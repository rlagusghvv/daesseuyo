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

echo "Daesseuyo realistic vertical slice gate"
echo

check_command "Metal compiler" xcrun -find metal
check_file "Built editor module" "Binaries/Mac/UnrealEditor-Daesseuyo.dylib"
check_file "Project file" "Daesseuyo.uproject"

echo
echo "Required realistic slice assets"
check_file "Stadium map" "Content/Daesseuyo/Art/Stadiums/SeoulNight/Maps/L_SeoulNight.umap"
check_file "Batter skeletal mesh" "Content/Daesseuyo/Art/Characters/Batter/SK_Batter.uasset"
check_file "Pitcher skeletal mesh" "Content/Daesseuyo/Art/Characters/Pitcher/SK_Pitcher.uasset"
check_file "Catcher skeletal mesh" "Content/Daesseuyo/Art/Characters/Catcher/SK_Catcher.uasset"
check_file "Wood bat mesh" "Content/Daesseuyo/Art/Equipment/Bat/SM_WoodBat.uasset"
check_file "Baseball mesh" "Content/Daesseuyo/Art/Equipment/Ball/SM_Baseball.uasset"
check_file "Catcher mitt mesh" "Content/Daesseuyo/Art/Equipment/Mitt/SM_CatcherMitt.uasset"
check_file "Batter hit montage" "Content/Daesseuyo/Animation/Baseball/Batter/AM_Batter_Swing_Hit.uasset"
check_file "Batter miss montage" "Content/Daesseuyo/Animation/Baseball/Batter/AM_Batter_Swing_Miss.uasset"
check_file "Pitcher throw montage" "Content/Daesseuyo/Animation/Baseball/Pitcher/AM_Pitcher_Throw_FourSeam.uasset"
check_file "Catcher catch montage" "Content/Daesseuyo/Animation/Baseball/Catcher/AM_Catcher_Catch_Center.uasset"

echo
if [[ "$missing" -eq 0 ]]; then
  echo "READY: realistic vertical slice assets are present."
else
  echo "NOT READY: this is still a blockout until the missing assets are imported and wired."
fi

exit "$missing"
