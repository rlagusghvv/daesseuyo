#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BALANCE_REPORT="${TMPDIR:-/tmp}/daesseuyo-balance-report.json"

cd "$ROOT_DIR"

node --check shared-engine.js
node --check game.js
node --check multiplayer-server.js
node --check scripts/simulate_balance.js
bash -n scripts/import_mixkit_cutscenes.sh

node scripts/simulate_balance.js --games "${SIM_GAMES:-10000}" --seed "${SIM_SEED:-20260618}" > "$BALANCE_REPORT"
node - "$BALANCE_REPORT" <<'NODE'
const fs = require("fs");
const report = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
if (report.warnings.length) {
  console.error(JSON.stringify(report.warnings, null, 2));
  process.exit(1);
}
console.log(`balance ok: batter ${report.rates.batterWinPct}% / pitcher ${report.rates.pitcherWinPct}%, avg ${report.perGame.pitches} pitches`);
NODE

for file in Content/Daesseuyo/Generated/Videos/*.webm Content/Daesseuyo/Generated/Videos/*.mp4; do
  ffmpeg -hide_banner -v error -t 0.1 -i "$file" -frames:v 1 -f null -
done

if curl -fsS http://127.0.0.1:4174/health >/dev/null; then
  echo "server health ok"
else
  echo "server health skipped: start with node multiplayer-server.js"
fi

echo "web MVP ready"
