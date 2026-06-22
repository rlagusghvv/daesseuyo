# 대쓰요: real BaseBall

한국 야구의 클러치 감정을 직접 조작형 한 타석 결투로 압축한 웹 MVP.

## Working Identity

- 제목: **대쓰요: real BaseBall**
- 원형: `대쓰요 : real BaseBall`
- 장르: 1타석 온라인 결투 + 클러치 로그라이크
- 현재 엔진: DOM 기반 웹 게임 + Node 멀티플레이 서버
- 첫 MVP: 9회말 동점 타석, 4키 투구/타격 예측, AI 대전, 실시간 멀티, 랭크/통계, 승부치기 연장

## Core Hook

KBO 라이선스가 없어서 못 만드는 게임이 아니라, 한국 야구의 템포와 감정, 투구와 타격의 손맛, 수비와 주루의 판단을 제대로 구현하는 게임을 만든다.

실제 구단, 실제 선수, 실제 대회명, 실제 해설자 음성/초상은 쓰지 않는다. 대신 한국 야구 팬이 바로 알아듣는 말맛과 경기 감정은 독자적인 방식으로 가져간다.

## Current Web MVP

루트의 `index.html`, `shared-engine.js`, `game.js`, `multiplayer-server.js`가 현재 플레이 가능한 MVP다. 리얼 선수 이미지를 흉내 내지 않고, 야구를 테마로 한 미니멀 심리전 보드로 간다.

UI 표준:

1. 스타일링은 Tailwind CSS 유틸리티만 사용한다.
2. 컴포넌트 톤은 shadcn/ui의 zinc 다크 테마를 기준으로 한다.
3. 인라인 스타일과 별도 CSS 파일을 만들지 않는다.
4. 패딩, 마진, 간격은 Tailwind 8pt 스케일을 따른다.
5. 포인트 색은 `primary` 한 계열만 사용한다.
6. 불필요한 테두리, 그림자, 과한 라운딩을 피한다.
7. 웹 게임 화면은 스크롤 없이 한 뷰포트 안에서 경기 상황, 플레이, 통계, 입력을 모두 보여준다.

현재 들어간 것:

1. 9회말 2아웃 2루 동점에서 시작하는 한 타석 공격/수비 승부.
2. 9회말에 득점이 없으면 10회말 2아웃 2루 승부치기, 10회말도 막으면 수비 승리.
3. Q/W/E/R 네 키로 진행하는 투수 패턴과 타자 예측 심리전.
4. 타자가 예측을 맞히면 좋은 타구 확률이 올라가지만 확정 홈런은 아닌 판정.
5. 투수도 좋은 선택을 해도 볼, 실투, 빗맞음이 나올 수 있는 제구 판정.
6. AI 난이도별 투구 패턴 읽기와 카운터.
7. 실시간 멀티 방에서 투수/타자가 제한 시간 안에 동시 선택.
8. 랭크/친선 모드, 레이팅, 최근 승부, 투구/읽기 통계.
9. 전체 상황, 플레이 화면, 통계를 한 페이지에서 보는 모바일 대응 UI.
10. 공개 진입 화면, 10초 규칙 안내, 친구 초대 링크 생성.
11. 기기 기반 랭크 전적을 서버의 `.data/rank-records.json`에 저장.

공개 URL:

```text
https://daesseuyo.splui.com
```

실행:

```bash
BIND_HOST=127.0.0.1 PORT=4174 node multiplayer-server.js
```

브라우저에서 연다.

```text
http://127.0.0.1:4174/?duel=TG7ZS8
```

조작:

- Q: 스트라이크
- W: 골라내기
- E: 몸쪽
- R: 변화구
- AI 대전은 내가 키를 누르면 바로 진행된다.
- 멀티는 투수와 타자가 제한 시간 안에 각각 키를 고르면 바로 공개된다.
- `?duel=방코드` 링크로 들어오면 바로 멀티 방으로 접속한다.

안정화 체크:

```bash
node scripts/simulate_balance.js --games 10000
scripts/check_web_mvp_ready.sh
```

맥미니 상시 실행:

- [Mac Mini Deploy](docs/MAC_MINI_DEPLOY.md)

## Unreal Archive

프로젝트 파일:

- [Daesseuyo.uproject](Daesseuyo.uproject)
- [MVP Build Notes](docs/MVP_BUILD.md)
- [One At-Bat Vertical Slice](docs/ONE_AT_BAT_VERTICAL_SLICE.md)
- [Realistic Vertical Slice Plan](docs/REALISTIC_VERTICAL_SLICE.md)

Unreal 빌드는 이전 실험용 `one-at-bat sample`이다. 무료/로컬로 확보 가능한 UE 템플릿 캐릭터, AI 생성 야구장/선수/공 2D 에셋, C++ 공 물리와 타격 루프를 붙여 한 타석을 직접 플레이할 수 있게 만들었다.

현재 샘플에 들어간 것:

1. UE5 C++ 프로젝트 스캐폴드.
2. 기본 GameMode와 플레이어 Pawn.
3. UE 템플릿 Manny/Quinn 캐릭터 에셋과 재질/리그 참조.
4. AI 생성 포토리얼 야구장 배경 이미지.
5. AI 생성 타자/투수/포수/야구공 알파 PNG 기반 HUD 프레젠테이션 레이어.
6. 엔진 기본 메시 기반의 필드, 베이스, 마운드, 펜스, 스코어보드, 장비 프롭.
7. 5개 구종의 커스텀 투구 궤적.
8. 240 Hz 고정 틱 기반 공 시뮬레이션.
9. 마우스/게임패드 조준과 스페이스/좌클릭 스윙.
10. 조준/타이밍 기반 공-배트 충돌.
11. 타구 비행, 볼/스트라이크/아웃/점수 HUD.

이 샘플이 실행 가능한지 먼저 확인한다.

```bash
scripts/check_realistic_sample_ready.sh
scripts/play_unreal_mvp.sh
```

production 한 타석 vertical slice로 부르려면 실제 야구장, 고품질 선수 모델, 야구 특화 모션캡처, 배트/미트 소켓, 투구/스윙 애니메이션 노티파이가 연결되어야 한다. 현재 준비 상태는 아래 명령으로 확인한다.

```bash
scripts/check_one_at_bat_vertical_slice_ready.sh
```

## Documents

- [GDD](docs/GDD.md)
- [Unreal Engine Design](docs/UNREAL_ENGINE_DESIGN.md)
- [Naming and Motifs](docs/NAMING.md)
- [Prototype Notes](prototype/README.md)
