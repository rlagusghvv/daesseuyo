#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
UPROJECT="$ROOT_DIR/Daesseuyo.uproject"

if [[ ! -f "$UPROJECT" ]]; then
  echo "Daesseuyo.uproject not found: $UPROJECT" >&2
  exit 1
fi

if [[ -z "${UE_ROOT:-}" ]]; then
  for candidate in \
    /Users/Shared/Epic\ Games/UE_* \
    /Applications/Epic\ Games/UE_* \
    /Applications/UE_*; do
    if [[ -d "$candidate/Engine/Build/BatchFiles/Mac" ]]; then
      UE_ROOT="$candidate"
      break
    fi
  done
fi

if [[ -z "${UE_ROOT:-}" || ! -d "$UE_ROOT" ]]; then
  echo "Unreal Engine root not found. Set UE_ROOT=/path/to/UE_5.x and retry." >&2
  exit 1
fi

BUILD_SCRIPT="$UE_ROOT/Engine/Build/BatchFiles/Mac/Build.sh"
GENERATE_SCRIPT="$UE_ROOT/Engine/Build/BatchFiles/Mac/GenerateProjectFiles.sh"

if [[ ! -x "$BUILD_SCRIPT" ]]; then
  echo "Build.sh not found or not executable: $BUILD_SCRIPT" >&2
  exit 1
fi

if [[ -x "$GENERATE_SCRIPT" ]]; then
  "$GENERATE_SCRIPT" -project="$UPROJECT" -game
fi

"$BUILD_SCRIPT" DaesseuyoEditor Mac Development "$UPROJECT" -WaitMutex -NoUBA
