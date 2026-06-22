#!/bin/zsh
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BIND_HOST="${BIND_HOST:-127.0.0.1}"
PORT="${PORT:-4174}"

cd "$ROOT_DIR"
exec env BIND_HOST="$BIND_HOST" PORT="$PORT" node multiplayer-server.js
