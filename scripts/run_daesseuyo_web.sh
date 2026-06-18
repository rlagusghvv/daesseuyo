#!/bin/zsh
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
HOST="${HOST:-127.0.0.1}"
PORT="${PORT:-4174}"

cd "$ROOT_DIR"
exec node multiplayer-server.js
