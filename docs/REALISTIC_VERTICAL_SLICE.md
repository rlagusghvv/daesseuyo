# Realistic Vertical Slice Plan

## Decision

현재 Unreal 실행 화면은 `production realistic vertical slice`가 아니다. 지금 빌드는 생성형 야구장 배경, UE 템플릿 캐릭터, C++ 투구/타격 루프를 붙인 `one-at-bat sample`로 취급한다.

당장 작업 기준은 [One At-Bat Vertical Slice](ONE_AT_BAT_VERTICAL_SLICE.md)다. 이 문서는 그 이후 전체 리얼 야구 게임으로 확장할 때의 큰 기준으로 남긴다.

`대쓰요 : real BaseBall`의 다음 목표는 기본 도형이나 회색 Mannequin으로 "야구처럼 보이게" 만드는 것이 아니라, 리얼 야구 게임으로 보일 최소 장면을 만드는 것이다.

## Target Bar

첫 vertical slice는 다음 장면 하나로 판단한다.

- 9회말 2아웃, 1점 차
- 타자 1명, 투수 1명, 포수 1명
- 실제 야구장 형태의 필드와 펜스
- 투수 와인드업 또는 세트 포지션에서 릴리스
- 타자 준비 자세, 스윙, 헛스윙/임팩트 후속 모션
- 포수 미트 포구 또는 블로킹 반응
- 공은 현재 C++ 고정 틱 물리로 이동
- 임팩트/포구 시점은 애니메이션 노티파이와 공 물리 이벤트가 연결
- 카메라는 홈플레이트 뒤 타격 시점, 릴리스/임팩트 리플레이 시점 최소 2개

## Fail Gates

아래 중 하나라도 해당하면 vertical slice로 부르지 않는다.

- 선수가 primitive mesh, UE 기본 회색 Mannequin, 또는 찰흙 블록아웃으로 보인다.
- 투구와 스윙이 야구 모션이 아니라 일반 공격/팔 휘두르기처럼 보인다.
- 배트가 손 소켓에 붙어 있지 않거나 임팩트 지점과 스윙 궤적이 맞지 않는다.
- 포수 미트와 스트라이크존이 분리되어 보인다.
- 구장 스케일이 사람 크기와 맞지 않는다.
- WorldGrid, Template_Default 느낌이 남아 있다.
- 플레이어가 한 타석을 보고 "야구 게임 방향"을 느끼지 못한다.

## Required Asset Intake

### Stadium

우선순위 1: 현실형 야구장 패키지.

- 후보: Fab `Baseball Stadium`
- 이유: Unreal Engine용 assets/maps/materials가 준비되어 있고, PBR 기반으로 제작됐다고 명시되어 있다.
- 요구 작업: 실제 IP가 떠오르는 표식 제거, 한국 가상 리그 톤으로 광고판/색/스코어보드 교체.

### Baseball Motion

우선순위 1: 야구 특화 모션캡처.

- 후보: Fab `Basic Baseball Movement`
- 이유: 218개 야구 모션캡처 애니메이션이 있고 타자 스윙, 번트, 포수 포구, 주루 모션을 포함한다.
- 주의: 판매 설명상 구장/장비 모델은 포함되지 않는다.

### Character Base

우선순위 1: MetaHuman 또는 UE5 Manny 호환 고품질 선수 바디.

- 목표: 타자, 투수, 포수를 같은 skeleton/retarget chain으로 통합.
- 유니폼은 첫 slice에서 2팀만 만든다.
- 실제 구단 색 조합과 로고는 쓰지 않는다.

### Pitcher Fallback

후보: Fab `Baseball Pitcher Animated`

- 장점: 투수 캐릭터, 캡, 미트, 공, 13개 야구 관련 애니메이션이 포함되어 있다.
- 리스크: 설명상 모션캡처가 아니고 Epic Skeleton에 직접 rigged 된 것은 아니다. 주전 에셋보다는 fallback 또는 참고용이다.

### Locomotion Foundation

후보: Epic `Game Animation Sample Project`

- 용도: 야구 동작 자체가 아니라 수비/주루 locomotion, motion matching, retargeting reference.
- 첫 slice에서는 수비 이동까지 넓히지 말고 투수-타자-포수 연출 안정화 뒤 적용한다.

## Expected Project Paths

리얼 vertical slice 에셋은 다음 경로를 기준으로 정리한다.

```text
Content/Daesseuyo/Art/Stadiums/SeoulNight/Maps/L_SeoulNight.umap
Content/Daesseuyo/Art/Characters/Batter/SK_Batter.uasset
Content/Daesseuyo/Art/Characters/Pitcher/SK_Pitcher.uasset
Content/Daesseuyo/Art/Characters/Catcher/SK_Catcher.uasset
Content/Daesseuyo/Art/Equipment/Bat/SM_WoodBat.uasset
Content/Daesseuyo/Art/Equipment/Ball/SM_Baseball.uasset
Content/Daesseuyo/Art/Equipment/Mitt/SM_CatcherMitt.uasset
Content/Daesseuyo/Animation/Baseball/Batter/AM_Batter_Swing_Hit.uasset
Content/Daesseuyo/Animation/Baseball/Batter/AM_Batter_Swing_Miss.uasset
Content/Daesseuyo/Animation/Baseball/Pitcher/AM_Pitcher_Throw_FourSeam.uasset
Content/Daesseuyo/Animation/Baseball/Catcher/AM_Catcher_Catch_Center.uasset
```

## Implementation After Asset Intake

1. Create `L_SeoulNight_VerticalSlice` from the stadium map.
2. Add socket contract:
   - `hand_r_bat`
   - `hand_l_glove`
   - `release_ball`
   - `catch_mitt`
   - `bat_barrel`
3. Add animation notifies:
   - `PitchRelease`
   - `SwingContactWindowStart`
   - `SwingContactWindowEnd`
   - `CatcherReceive`
4. Replace current `ADaesseuyoMvpPawn` presentation layer with asset-driven actors:
   - `ADaesPitcherActor`
   - `ADaesBatterActor`
   - `ADaesCatcherActor`
   - `ADaesBallActor`
5. Keep current C++ ball physics and count state, but drive visible events from animation notifies.
6. Add cinematic replay only after the pitch/hit loop looks credible in real time.

## Current Status

- C++ ball physics: usable as prototype base.
- Input/count/strike logic: usable as prototype base.
- Current visual scene: playable realistic sample only, not acceptable as final target quality.
- Missing blocker: real baseball assets and baseball-specific mocap integration.
