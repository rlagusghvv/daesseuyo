#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
UPROJECT="$ROOT_DIR/Daesseuyo.uproject"

if [[ -z "${UE_ROOT:-}" ]]; then
  for candidate in \
    /Users/Shared/Epic\ Games/UE_5.7 \
    /Users/Shared/Epic\ Games/UE_* \
    /Applications/Epic\ Games/UE_* \
    /Applications/UE_*; do
    if [[ -x "$candidate/Engine/Binaries/Mac/UnrealEditor.app/Contents/MacOS/UnrealEditor" ]]; then
      UE_ROOT="$candidate"
      break
    fi
  done
fi

UNREAL_APP="$UE_ROOT/Engine/Binaries/Mac/UnrealEditor.app"

if [[ -z "${UE_ROOT:-}" || ! -d "$UNREAL_APP" ]]; then
  echo "UnrealEditor not found. Set UE_ROOT=/path/to/UE_5.x and retry." >&2
  exit 1
fi

echo "Launching one-at-bat sample: generated stadium backdrop, UE mannequin fallback players, and C++ batting/pitching loop."
echo "For the production one-at-bat gate, run scripts/check_one_at_bat_vertical_slice_ready.sh."

open -n "$UNREAL_APP" --args \
  "$UPROJECT" /Engine/Maps/Templates/Template_Default -game -windowed -ResX=1280 -ResY=720 -log \
  -ExecCmds="DisableAllScreenMessages"
