#!/bin/zsh
set -euo pipefail

BIND_HOST="${BIND_HOST:-127.0.0.1}"
PORT="${PORT:-4174}"
LABEL="${LABEL:-com.daesseuyo.web}"

launchctl print "gui/$(id -u)/$LABEL" || true
curl -fsS "http://$BIND_HOST:$PORT/health"
