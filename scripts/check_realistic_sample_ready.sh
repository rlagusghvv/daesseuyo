#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

missing=0

check_file() {
  local label="$1"
  local path="$2"
  if [[ -e "$path" ]]; then
    printf "OK   %-34s %s\n" "$label" "$path"
  else
    printf "MISS %-34s %s\n" "$label" "$path"
    missing=1
  fi
}

check_command() {
  local label="$1"
  shift
  if "$@" >/dev/null 2>&1; then
    printf "OK   %-34s %s\n" "$label" "$*"
  else
    printf "MISS %-34s %s\n" "$label" "$*"
    missing=1
  fi
}

echo "Daesseuyo playable realistic sample gate"
echo

check_command "Metal compiler" xcrun -find metal
check_file "Built editor module" "Binaries/Mac/UnrealEditor-Daesseuyo.dylib"
check_file "Generated stadium backdrop" "Content/Daesseuyo/Generated/Images/stadium_batting_view.png"
check_file "Generated cinematic plate view" "Content/Daesseuyo/Generated/Images/plate_view_cinematic.png"
check_file "AI batter cutout" "Content/Daesseuyo/Generated/Images/Cutouts/batter_cutout.png"
check_file "AI pitcher cutout" "Content/Daesseuyo/Generated/Images/Cutouts/pitcher_cutout.png"
check_file "AI catcher cutout" "Content/Daesseuyo/Generated/Images/Cutouts/catcher_cutout.png"
check_file "AI baseball sprite" "Content/Daesseuyo/Generated/Images/Cutouts/baseball_cutout.png"
check_file "Manny sample mesh" "Content/Characters/Mannequins/Meshes/SKM_Manny_Simple.uasset"
check_file "Quinn sample mesh" "Content/Characters/Mannequins/Meshes/SKM_Quinn_Simple.uasset"
check_file "Manny material" "Content/Characters/Mannequins/Materials/Manny/MI_Manny_01_New.uasset"
check_file "Quinn material" "Content/Characters/Mannequins/Materials/Quinn/MI_Quinn_01.uasset"
check_file "Mannequin rig" "Content/Characters/Mannequins/Rigs/PA_Mannequin.uasset"
check_file "Idle animation" "Content/Characters/Mannequins/Anims/Unarmed/MM_Idle.uasset"
check_file "Swing placeholder animation" "Content/Characters/Mannequins/Anims/Unarmed/Attack/MM_Attack_02.uasset"
check_file "Pitch placeholder animation" "Content/Characters/Mannequins/Anims/Unarmed/Attack/MM_Attack_01.uasset"

echo
if [[ "$missing" -eq 0 ]]; then
  echo "READY: playable realistic sample assets are present."
else
  echo "NOT READY: sample assets are missing."
fi

exit "$missing"
