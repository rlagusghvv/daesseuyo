# Mac Mini Deploy

맥미니에서 `대쓰요: real BaseBall` 웹 MVP를 상시 실행하는 절차다.

## 운영 방식

1. GitHub 저장소를 `~/Services/daesseuyo`로 받는다.
2. Node 서버를 `127.0.0.1:4174`에서 실행한다.
3. `launchd`로 재부팅 후에도 자동 실행한다.
4. `daesseuyo.splui.com`을 새 주소로 만든다.

## 서버 에이전트에게 줄 원샷 명령

`splui.com` 기준으로 새 주소 `daesseuyo.splui.com`을 만든다.

```bash
/bin/zsh <<'EOF'
set -euo pipefail

REPO_URL="git@github.com:rlagusghvv/daesseuyo.git"
APP_DIR="$HOME/Services/daesseuyo"
DOMAIN="daesseuyo.splui.com"

command -v brew >/dev/null 2>&1 || { echo "Homebrew가 없습니다: https://brew.sh"; exit 1; }
brew list git >/dev/null 2>&1 || brew install git
brew list node >/dev/null 2>&1 || brew install node
brew list ffmpeg >/dev/null 2>&1 || brew install ffmpeg

mkdir -p "$HOME/Services"
if [[ -d "$APP_DIR/.git" ]]; then
  git -C "$APP_DIR" pull --ff-only
else
  git clone "$REPO_URL" "$APP_DIR"
fi

cd "$APP_DIR"
chmod +x scripts/*.sh
DOMAIN="$DOMAIN" scripts/deploy_daesseuyo_macmini.sh
EOF
```

위 명령이 끝나면 서버 앱은 `127.0.0.1:4174`에서 계속 실행되고, 공개 주소는 `https://daesseuyo.splui.com`이다.

## 확인

```bash
HOST=127.0.0.1 PORT=4174 scripts/status_daesseuyo_launch_agent.sh
tail -f logs/daesseuyo.launchd.out.log
tail -f logs/daesseuyo.launchd.err.log
```
