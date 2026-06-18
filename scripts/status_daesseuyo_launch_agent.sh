#!/bin/zsh
set -euo pipefail

HOST="${HOST:-127.0.0.1}"
PORT="${PORT:-4174}"
LABEL="${LABEL:-com.daesseuyo.web}"

launchctl print "gui/$(id -u)/$LABEL" || true
curl -fsS "http://$HOST:$PORT/health"
