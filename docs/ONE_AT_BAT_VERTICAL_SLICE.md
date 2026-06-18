# One At-Bat Vertical Slice

## Goal

`대쓰요 : real BaseBall`의 Unreal 목표는 당분간 전체 야구 게임이 아니다. 목표는 한 장면이다.

> 9회말 2아웃, 주자 2루, 1점 차. 투수 1명, 타자 1명, 포수 1명. 플레이어는 조준하고 스윙한다. 결과는 삼진, 볼넷, 아웃, 동점타, 끝내기 홈런 중 하나로 끝난다.

이 장면이 리얼하게 보이면 그 다음에 수비, 주루, 온라인, 리그 모드로 확장한다.

## Current Implementation

- `ADaesseuyoMvpPawn` now runs as a one-at-bat loop.
- The at-bat stops after strikeout, walk, ball in play, or walk-off.
- C++ ball physics, pitch break, contact quality, score/count logic remain in code.
- Camera starts behind home plate and switches to a simple batted-ball tracking view.
- `ADaesseuyoMvpHud` draws AI-generated 2D stadium, batter, pitcher, catcher, and baseball assets over the realtime simulation.
- Production assets are loaded first from the agreed paths below.
- If production assets are missing, the project falls back to UE mannequin sample assets.

## AI-Generated Presentation Assets

These project-local PNGs are generated with image generation and are used directly by the HUD layer:

```text
Content/Daesseuyo/Generated/Images/stadium_batting_view.png
Content/Daesseuyo/Generated/Images/plate_view_cinematic.png
Content/Daesseuyo/Generated/Images/Cutouts/batter_cutout.png
Content/Daesseuyo/Generated/Images/Cutouts/pitcher_cutout.png
Content/Daesseuyo/Generated/Images/Cutouts/catcher_cutout.png
Content/Daesseuyo/Generated/Images/Cutouts/baseball_cutout.png
```

This is not a replacement for production 3D assets, but it gives the one-at-bat sample a realistic broadcast-style first impression while the C++ pitch/contact loop remains playable.

## Production Asset Contract

Put imported assets at these exact paths. The C++ pawn checks these paths first.

```text
Content/Daesseuyo/Art/Stadiums/SeoulNight/Maps/L_SeoulNight.umap
Content/Daesseuyo/Art/Characters/Batter/SK_Batter.uasset
Content/Daesseuyo/Art/Characters/Pitcher/SK_Pitcher.uasset
Content/Daesseuyo/Art/Characters/Catcher/SK_Catcher.uasset
Content/Daesseuyo/Art/Equipment/Bat/SM_WoodBat.uasset
Content/Daesseuyo/Art/Equipment/Ball/SM_Baseball.uasset
Content/Daesseuyo/Art/Equipment/Mitt/SM_CatcherMitt.uasset
Content/Daesseuyo/Animation/Baseball/Batter/AM_Batter_Idle.uasset
Content/Daesseuyo/Animation/Baseball/Batter/AM_Batter_Swing_Hit.uasset
Content/Daesseuyo/Animation/Baseball/Batter/AM_Batter_Swing_Miss.uasset
Content/Daesseuyo/Animation/Baseball/Pitcher/AM_Pitcher_Throw_FourSeam.uasset
Content/Daesseuyo/Animation/Baseball/Catcher/AM_Catcher_Catch_Center.uasset
```

Run:

```bash
scripts/check_one_at_bat_vertical_slice_ready.sh
```

## Asset Shopping Shortlist

Use this as a starting point, not as final art direction.

- Fab `Baseball Stadium`: Unreal-ready baseball stadium/building-block package.
- Fab `Basic Baseball Movement`: 218 baseball mocap animations. It does not include stadium/equipment models.
- Fab `Baseball Pitcher Animated`: pitcher character plus cap, mitt, ball, and pitching-related animations. Useful fallback/reference.
- Epic `Game Animation Sample Project`: motion matching/retargeting reference, not a baseball motion pack.

## Acceptance Bar

The slice is acceptable only when:

- Batter, pitcher, and catcher no longer read as default gray mannequins.
- Pitch and swing motions read as baseball, not generic attack animations.
- Bat, ball, mitt, helmet, and catcher gear are visible and scaled correctly.
- The stadium fills the shot; WorldGrid/Template_Default should not be visually dominant.
- A player can complete one at-bat without editor interaction.
- The result screen clearly communicates strikeout, walk, out, tie hit, or walk-off.
