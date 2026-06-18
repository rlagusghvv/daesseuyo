#!/bin/zsh
set -euo pipefail

APP_DIR="${APP_DIR:-$(cd "$(dirname "$0")/.." && pwd)}"
HOST="${HOST:-127.0.0.1}"
PORT="${PORT:-4174}"
LABEL="${LABEL:-com.daesseuyo.web}"
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"
LOG_DIR="$APP_DIR/logs"
NODE_PATH_PREFIX="${NODE_PATH_PREFIX:-/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin}"

mkdir -p "$HOME/Library/LaunchAgents" "$LOG_DIR"

cat > "$PLIST" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>$LABEL</string>
  <key>ProgramArguments</key>
  <array>
    <string>/bin/zsh</string>
    <string>-lc</string>
    <string>export PATH="$NODE_PATH_PREFIX"; cd "$APP_DIR" &amp;&amp; HOST="$HOST" PORT="$PORT" node multiplayer-server.js</string>
  </array>
  <key>RunAtLoad</key>
  <true/>
  <key>KeepAlive</key>
  <true/>
  <key>StandardOutPath</key>
  <string>$LOG_DIR/daesseuyo.launchd.out.log</string>
  <key>StandardErrorPath</key>
  <string>$LOG_DIR/daesseuyo.launchd.err.log</string>
  <key>WorkingDirectory</key>
  <string>$APP_DIR</string>
</dict>
</plist>
PLIST

launchctl bootout "gui/$(id -u)" "$PLIST" 2>/dev/null || true
launchctl bootstrap "gui/$(id -u)" "$PLIST"
launchctl kickstart -k "gui/$(id -u)/$LABEL"

echo "daesseuyo launchd service installed"
echo "label: $LABEL"
echo "plist: $PLIST"
echo "app: $APP_DIR"
echo "url: http://$HOST:$PORT/"
