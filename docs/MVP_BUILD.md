# Playable Sample Build Notes

## Goal

현재 빌드는 `대쓰요 : real BaseBall`의 실행 가능한 one-at-bat sample이다. 엔진 안에서 한 타석을 직접 조작하고, AI 생성 야구장/선수/공 2D 에셋과 UE 템플릿 캐릭터가 얹힌 상태에서 투구, 타격, 카운트, 공 물리 판정을 확인한다.

실제 목표 퀄리티와 production asset gate는 [One At-Bat Vertical Slice](ONE_AT_BAT_VERTICAL_SLICE.md)를 기준으로 한다.

## Current Sample

구현된 것:
- Unreal Engine 5 C++ 프로젝트 파일
- 기본 GameMode와 Pawn
- AI 생성 포토리얼 야구장 배경 이미지
- AI 생성 타자/투수/포수/야구공 알파 PNG 기반 HUD 프레젠테이션 레이어
- UE 템플릿 Manny/Quinn 캐릭터, 재질, 리그 참조
- 엔진 기본 메시 기반 필드, 베이스, 마운드, 펜스, 스코어보드, 장비 프롭
- 투구 타입 5개
- 240 Hz 고정 틱 기반 투구/타구 시뮬레이션
- 중력, 항력, 간이 Magnus 효과
- 마우스/게임패드 조준
- 스페이스/좌클릭 스윙
- 조준/타이밍 기반 공-배트 충돌
- 인플레이 타구 비행
- 볼/스트라이크/아웃/점수 디버그 HUD

구현됐다고 부르면 안 되는 것:
- 리얼 선수 모델
- 야구 특화 모션캡처 기반 투구/타격
- 실제 3D 야구장 수준의 구장 아트
- 포수/타자/투수 소켓과 애니메이션 노티파이 기반 이벤트
- 더쇼/프로스피리츠 계열의 시각 퀄리티

## How to Open

1. Unreal Engine 5를 설치한다.
2. `Daesseuyo.uproject`를 연다.
3. 에디터가 C++ 프로젝트 빌드를 요청하면 빌드한다.
4. 빈 레벨에서 Play를 누른다.

UE가 프로젝트 연결을 요구하면 `Daesseuyo.uproject`를 우클릭해서 설치된 UE5 버전으로 전환한다.

macOS에서 CLI 빌드를 시도하려면:

```bash
scripts/build_unreal_mvp.sh
```

이 스크립트는 현재 UE 5.7 macOS 환경에서 UBA(Unreal Build Accelerator) 세그폴트를 피하기 위해 `-NoUBA`로 로컬 빌드를 실행한다.

Unreal Engine이 자동으로 감지되지 않으면:

```bash
UE_ROOT="/Users/Shared/Epic Games/UE_5.x" scripts/build_unreal_mvp.sh
```

현재 샘플 준비 상태를 확인하고 바로 실행하려면:

```bash
scripts/check_realistic_sample_ready.sh
scripts/play_unreal_mvp.sh
```

production 한 타석 에셋 준비 상태를 확인하려면:

```bash
scripts/check_one_at_bat_vertical_slice_ready.sh
```

## Controls

- `Mouse X/Y`: 타격 조준점 이동
- `Gamepad Left Stick`: 타격 조준점 이동
- `Space`: 스윙
- `Left Mouse`: 스윙
- `R`: MVP 리셋

## What to Validate

- 투구가 단순 직선이 아니라 구종별로 다르게 휘는가?
- 스윙 타이밍이 너무 빠르거나 늦으면 헛스윙이 나는가?
- 조준점과 공 위치가 맞으면 인플레이가 되는가?
- 타구가 최소한 야구공처럼 날아가는가?
- 이 구조 위에 애니메이션과 실제 경기장을 얹을 가치가 있는가?

샘플의 실행 준비는 `scripts/check_realistic_sample_ready.sh`로 검증한다. production 한 타석 수준의 시각 퀄리티는 `scripts/check_one_at_bat_vertical_slice_ready.sh`와 `docs/ONE_AT_BAT_VERTICAL_SLICE.md` 기준으로 검증한다.

## Next Realistic Step

1. 리얼 야구장 에셋 import.
2. 타자/투수/포수 고품질 skeletal mesh import.
3. 야구 특화 mocap animation import.
4. 배트/미트/공 소켓 계약 정의.
5. `PitchRelease`, `SwingContactWindowStart/End`, `CatcherReceive` animation notify 연결.
6. 현재 공 물리와 animation notify를 연결해 실제 투구-스윙 루프를 만든다.
