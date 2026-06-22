#!/bin/zsh
set -euo pipefail
setopt NULL_GLOB

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BIND_HOST="${BIND_HOST:-127.0.0.1}"
PORT="${PORT:-4174}"
SUBDOMAIN="${SUBDOMAIN:-daesseuyo}"
ROOT_DOMAIN="${ROOT_DOMAIN:-splui.com}"
DOMAIN="${DOMAIN:-${PUBLIC_DOMAIN:-$SUBDOMAIN.$ROOT_DOMAIN}}"

infer_public_domain() {
  local -a files
  files=(
    /opt/homebrew/etc/Caddyfile
    /usr/local/etc/Caddyfile
    /etc/caddy/Caddyfile
    /opt/homebrew/etc/nginx/nginx.conf
    /opt/homebrew/etc/nginx/servers/*.conf
    /usr/local/etc/nginx/nginx.conf
    /usr/local/etc/nginx/servers/*.conf
    /etc/nginx/nginx.conf
    /etc/nginx/sites-enabled/*
    "$HOME"/.cloudflared/*.yml
    "$HOME"/.cloudflared/*.yaml
    /opt/homebrew/etc/cloudflared/*.yml
    /opt/homebrew/etc/cloudflared/*.yaml
    /usr/local/etc/cloudflared/*.yml
    /usr/local/etc/cloudflared/*.yaml
    /etc/cloudflared/*.yml
    /etc/cloudflared/*.yaml
  )

  local candidates=""
  local file
  for file in $files; do
    [[ -f "$file" ]] || continue
    candidates+=$'\n'
    candidates+="$(grep -Eoh '([A-Za-z0-9][A-Za-z0-9-]*\.)+[A-Za-z]{2,}' "$file" 2>/dev/null || true)"
  done

  DAESSEUYO_DOMAIN_CANDIDATES="$candidates" node - "$SUBDOMAIN" <<'NODE'
const subdomain = process.argv[2] || "daesseuyo";
const blocked = [
  "example.com",
  "your-domain.example",
  "github.com",
  "nodejs.org",
  "brew.sh",
  "apple.com",
  "w3.org",
  "mixkit.co",
  "cloudflare.com",
  "trycloudflare.com",
  "argotunnel.com",
];
const hosts = (process.env.DAESSEUYO_DOMAIN_CANDIDATES || "")
  .split(/\s+/)
  .map((host) => host.trim().toLowerCase())
  .filter(Boolean)
  .filter((host) => !blocked.some((bad) => host === bad || host.endsWith(`.${bad}`)))
  .filter((host) => !host.includes("localhost"))
  .filter((host) => !host.includes("example"))
  .filter((host) => !/^\d+\.\d+\.\d+\.\d+$/.test(host))
  .sort((a, b) => a.length - b.length || a.localeCompare(b));

function rootOf(host) {
  const parts = host.split(".").filter(Boolean);
  if (parts.length <= 2) return host;
  const last = parts[parts.length - 1];
  const second = parts[parts.length - 2];
  const commonCountrySecondLevels = new Set(["ac", "co", "com", "go", "ne", "net", "or", "org", "pe", "re"]);
  if (last.length === 2 && commonCountrySecondLevels.has(second) && parts.length >= 3) {
    return parts.slice(-3).join(".");
  }
  return parts.slice(-2).join(".");
}

if (hosts.length) {
  console.log(`${subdomain}.${rootOf(hosts[0])}`);
}
NODE
}

configure_cloudflared() {
  local domain="$1"
  local config=""
  local file
  for file in \
    "$HOME"/.cloudflared/config.yml \
    "$HOME"/.cloudflared/config.yaml \
    "$HOME"/.cloudflared/*.yml \
    "$HOME"/.cloudflared/*.yaml \
    /opt/homebrew/etc/cloudflared/config.yml \
    /opt/homebrew/etc/cloudflared/config.yaml \
    /opt/homebrew/etc/cloudflared/*.yml \
    /opt/homebrew/etc/cloudflared/*.yaml \
    /usr/local/etc/cloudflared/config.yml \
    /usr/local/etc/cloudflared/config.yaml \
    /usr/local/etc/cloudflared/*.yml \
    /usr/local/etc/cloudflared/*.yaml \
    /etc/cloudflared/config.yml \
    /etc/cloudflared/config.yaml \
    /etc/cloudflared/*.yml \
    /etc/cloudflared/*.yaml; do
    [[ -f "$file" ]] || continue
    if grep -q "ingress:" "$file"; then
      config="$file"
      break
    fi
  done
  [[ -n "$config" ]] || return 1

  local tunnel
  tunnel="$(awk -F: '/^[[:space:]]*tunnel:/ { gsub(/^[[:space:]]+|[[:space:]]+$/, "", $2); print $2; exit }' "$config")"

  cp "$config" "$config.bak.$(date +%Y%m%d%H%M%S)"
  if ! grep -q "hostname:[[:space:]]*$domain" "$config"; then
    awk -v domain="$domain" -v service="http://'"$BIND_HOST:$PORT"'" '
      !added && $0 ~ /^[[:space:]]*service:[[:space:]]*http_status:404/ {
        print "  - hostname: " domain
        print "    service: " service
        added = 1
      }
      { print }
      END {
        if (!added) {
          print "  - hostname: " domain
          print "    service: " service
        }
      }
    ' "$config" > "$config.tmp"
    mv "$config.tmp" "$config"
  fi

  if command -v cloudflared >/dev/null 2>&1 && [[ -n "$tunnel" ]]; then
    cloudflared tunnel route dns "$tunnel" "$domain" || true
    brew services restart cloudflared 2>/dev/null || true
    launchctl kickstart -k "gui/$(id -u)/com.cloudflare.cloudflared" 2>/dev/null || true
  fi

  echo "cloudflared configured: $domain -> http://$BIND_HOST:$PORT"
  return 0
}

configure_caddy() {
  local domain="$1"
  local caddyfile=""
  local file
  for file in /opt/homebrew/etc/Caddyfile /usr/local/etc/Caddyfile /etc/caddy/Caddyfile; do
    [[ -f "$file" ]] || continue
    caddyfile="$file"
    break
  done
  [[ -n "$caddyfile" ]] || return 1
  command -v caddy >/dev/null 2>&1 || return 1

  cp "$caddyfile" "$caddyfile.bak.$(date +%Y%m%d%H%M%S)"
  if ! grep -q "$domain" "$caddyfile"; then
    cat >> "$caddyfile" <<CADDY

$domain {
    encode zstd gzip
    reverse_proxy $BIND_HOST:$PORT
}
CADDY
  fi
  caddy validate --config "$caddyfile"
  brew services restart caddy 2>/dev/null || caddy reload --config "$caddyfile"
  echo "caddy configured: $domain -> http://$BIND_HOST:$PORT"
  return 0
}

configure_nginx() {
  local domain="$1"
  command -v nginx >/dev/null 2>&1 || return 1

  local nginx_dir="/opt/homebrew/etc/nginx/servers"
  [[ -d /opt/homebrew/etc/nginx ]] || nginx_dir="/usr/local/etc/nginx/servers"
  mkdir -p "$nginx_dir"

  cat > "$nginx_dir/daesseuyo.conf" <<NGINX
server {
    listen 80;
    server_name $domain;

    location / {
        proxy_pass http://$BIND_HOST:$PORT;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_buffering off;
        proxy_read_timeout 3600s;
    }
}
NGINX

  nginx -t
  brew services restart nginx 2>/dev/null || nginx -s reload
  echo "nginx configured: $domain -> http://$BIND_HOST:$PORT"
  return 0
}

cd "$ROOT_DIR"

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js가 없습니다. brew install node 후 다시 실행하세요." >&2
  exit 1
fi

node --check shared-engine.js
node --check game.js
node --check multiplayer-server.js
node scripts/simulate_balance.js --games "${SIM_GAMES:-10000}" >/dev/null

if command -v ffmpeg >/dev/null 2>&1; then
  scripts/check_web_mvp_ready.sh
else
  echo "ffmpeg가 없어 영상 디코드 체크는 건너뜁니다. 필요하면 brew install ffmpeg 하세요."
fi

APP_DIR="$ROOT_DIR" BIND_HOST="$BIND_HOST" PORT="$PORT" scripts/install_daesseuyo_launch_agent.sh
sleep 2
curl -fsS "http://$BIND_HOST:$PORT/health"
echo

if [[ -z "$DOMAIN" ]]; then
  echo "앱 실행 완료: http://$BIND_HOST:$PORT"
  echo "도메인을 정하지 못했습니다. DOMAIN=daesseuyo.splui.com 으로 다시 실행하세요." >&2
  exit 1
fi

if configure_cloudflared "$DOMAIN"; then
  :
elif configure_caddy "$DOMAIN"; then
  :
elif configure_nginx "$DOMAIN"; then
  :
else
  echo "앱 실행 완료: http://$BIND_HOST:$PORT"
  echo "기존 cloudflared/Caddy/Nginx 설정을 찾지 못했습니다. $DOMAIN -> http://$BIND_HOST:$PORT 로 직접 연결하세요." >&2
  exit 1
fi

echo "public url: https://$DOMAIN"
curl -I "https://$DOMAIN/" || curl -I "http://$DOMAIN/" || true
