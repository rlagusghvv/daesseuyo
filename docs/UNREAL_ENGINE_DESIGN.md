# Unreal Engine Design

## Engine Direction

엔진은 Unreal Engine 5를 기준으로 한다. 목표는 "웹에서 검증하는 카드형 야구"가 아니라, 실제 3D 경기장에서 선수와 공을 직접 조작하는 `대쓰요 : real BaseBall`의 리얼 야구 액션이다.

기본 판단:
- 렌더링: Nanite, Lumen, Virtual Shadow Maps 기반.
- 애니메이션: Motion Matching, Control Rig, Full Body IK, Physical Animation 기반.
- 물리: Chaos는 캐릭터 보조 물리와 충돌 기반으로 사용하고, 야구공 궤적과 공-배트 충돌은 커스텀 C++ 시뮬레이션으로 구현.
- 네트워크: 온라인 1v1은 서버 권위 판정. 클라이언트는 입력 예측과 리플레이 보정만 담당.

## Project Layout

```text
Source/
  Daesseuyo/
    Core/
      BaseballGameState
      BaseballRules
      CountState
      InningState
      RunnerState
    Physics/
      PitchSim
      BallFlightSim
      BatBallCollision
      BounceModel
    Players/
      PitcherController
      BatterController
      FielderController
      RunnerController
    Animation/
      BaseballAnimInstance
      PitchingMotionModel
      SwingMotionModel
      FieldingMotionModel
    AI/
      PitchCallingAI
      FieldingAI
      BaserunningAI
    Online/
      MatchSession
      InputSnapshot
      ServerSimResult
    Presentation/
      BroadcastCamera
      ReplaySystem
      CrowdReaction
```

## Ball Physics

공 물리는 게임의 핵심이다. Chaos rigid body에만 맡기지 않는다.

### Fixed-Tick Simulation

- 내부 시뮬레이션: 240 Hz 목표.
- 렌더링 프레임과 분리.
- 모든 투구와 타구는 동일한 입력값이면 동일한 결과가 나와야 한다.

### Pitch Flight

입력:
- 릴리스 위치
- 초기 속도 벡터
- 회전축
- 회전수
- 구종별 무브먼트 계수
- 투수 컨디션과 제구 오차

계산:
- 중력
- 항력
- Magnus 효과
- seam-shifted wake는 후순위 근사 모델
- 포수 미트 도달 시점과 존 통과 좌표

### Bat-Ball Collision

입력:
- 배트 스윙 궤도
- 배트 스피드
- 임팩트 지점
- 공 속도와 회전
- 타자 파워/컨택/배트 컨트롤

결과:
- 발사각
- 타구 속도
- 스핀
- 방향
- 파울 여부
- 배트 파손 또는 먹힘 감각은 후순위

## Input Design

### Pitching

첫 버전은 아날로그 릴리스 기반.

1. 구종 선택.
2. 목표 지점 선택.
3. 투구 강도 선택.
4. 릴리스 타이밍과 방향 입력.

실패 유형:
- 빠른 릴리스: 손에서 빠짐.
- 늦은 릴리스: 높거나 반대 방향으로 밀림.
- 과한 강도: 구속은 오르지만 제구와 회전축 불안.

### Batting

타격은 단순 타이밍 버튼이 아니다.

1. 좌스틱: 타격 기준점/배트 접근 위치.
2. 우스틱 또는 버튼: 스윙 타입.
3. 타이밍: 스윙 시작 시점.
4. 선수 능력: 보정은 하되 결과를 대신 만들지 않는다.

핵심은 "좋게 맞은 이유"와 "못 맞은 이유"가 화면과 리플레이에서 보이는 것이다.

### Fielding

수비는 완전 수동과 보조 수동 사이에서 시작한다.

- 이동은 플레이어 직접 조작.
- 낙구 지점 예측 원은 난이도에 따라 표시.
- 포구는 자동 보조를 주되, 다이빙/점프/펜스 플레이는 직접 입력.
- 송구는 방향 + 강도 + 정확도 타이밍으로 판정.

## Animation System

### Required Animation Sets

- 와인드업
- 세트 포지션
- 좌/우 투수 릴리스 변형
- 스윙: 컨택, 파워, 커트, 체크스윙
- 포수 포구, 블로킹, 송구
- 내야 포구, 백핸드, 러닝스로우, 병살 전환
- 외야 포구, 펜스 플레이, 중계 송구
- 주루, 슬라이딩, 태그 회피

### UE5 Features

- Motion Matching: 주루와 수비 이동.
- Control Rig: 투구폼, 스윙폼, 손/배트/미트 정렬.
- Full Body IK: 포구, 태그, 베이스 터치.
- Physical Animation: 충돌, 슬라이딩, 다이빙 후 잔동작.

## Camera and Presentation

카메라는 중계 흉내가 아니라 게임 조작성 우선이다.

- 투구 시점: 타격 카메라, 투수 카메라.
- 인플레이: 타구 추적 카메라에서 수비수 조작 카메라로 자연 전환.
- 리플레이: 임팩트, 포구, 홈 승부, 끝내기 상황 자동 컷.
- UI: 실제 방송 그래픽을 베끼지 않는 독자 HUD.

## Online Architecture

야구는 축구나 농구보다 순차 이벤트가 많아 온라인 판정 구조를 명확히 만들 수 있다.

### Server Authority

- 투수 입력, 타자 입력, 공 시뮬레이션은 서버가 최종 판정.
- 클라이언트는 예상 공 궤적과 스윙을 즉시 렌더링.
- 서버 결과가 오면 짧은 리플레이/카메라 컷으로 보정한다.

### Match Format

첫 온라인 목표:
- 1v1
- 3이닝 또는 9이닝
- 랭크보다 친선 매치 우선
- 투수/타자 동시 입력 지연 보정

## Vertical Slice Milestones

Before these milestones count as a realistic slice, run:

```bash
scripts/check_vertical_slice_ready.sh
```

If this gate fails, the build is still a blockout, even if gameplay code runs.

### Milestone 0: UE Project

- UE5 C++ 프로젝트 생성.
- 기본 경기장 레벨.
- 타자, 투수, 포수 skeletal mesh placeholder.
- 입력 매핑.

### Milestone 1: Pitch and Hit

- 커스텀 투구 궤적.
- 배트 스윙 콜라이더.
- 공-배트 충돌.
- 타구 속도/각도/방향 디버그 표시.

### Milestone 2: Fielding

- 내야/외야 기본 수비 AI.
- 플레이어 수비수 전환.
- 포구와 송구.
- 아웃/세이프 판정.

### Milestone 3: One Inning

- 9회말 2아웃 1점 차.
- 카운트, 아웃, 주자, 점수.
- 투수 교체 없이 한 이닝 완주.

### Milestone 4: Feel Pass

- 타구음.
- 미트 소리.
- 관중 반응.
- 슬로모 리플레이.
- 조명과 유니폼 질감 1차 퀄리티업.

## Non-Goals for First Slice

- 실제 구단/선수 라이선스.
- 풀 시즌 운영.
- 온라인 랭크.
- 완전한 선수 커스터마이징.
- 모든 구종과 모든 수비 애니메이션.
- 모바일 대응.

## Technical References

- Motion Matching: https://dev.epicgames.com/documentation/unreal-engine/motion-matching-in-unreal-engine
- Nanite: https://dev.epicgames.com/documentation/unreal-engine/nanite-virtualized-geometry-in-unreal-engine
- Physics and Chaos: https://dev.epicgames.com/documentation/unreal-engine/physics-in-unreal-engine
- Networked Physics: https://dev.epicgames.com/documentation/unreal-engine/networked-physics-overview
- Networking and Multiplayer: https://dev.epicgames.com/documentation/unreal-engine/networking-and-multiplayer-in-unreal-engine
