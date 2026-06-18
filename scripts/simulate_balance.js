#!/usr/bin/env node

const engine = require("../shared-engine.js");

const keyList = Object.keys(engine.keys);
const args = parseArgs(process.argv.slice(2));
const games = Number(args.games || args.g || 10000);
const seed = Number(args.seed || 20260618);
const maxPitches = Number(args.maxPitches || 80);
const random = mulberry32(seed);

const totals = {
  games: 0,
  batterWins: 0,
  pitcherWins: 0,
  tiebreakers: 0,
  capped: 0,
  pitches: 0,
  reads: 0,
  partials: 0,
  misses: 0,
  mistakes: 0,
  balls: 0,
  strikes: 0,
  fouls: 0,
  contacts: 0,
  outs: 0,
  hits: 0,
  extraBases: 0,
  homers: 0,
  walks: 0,
  strikeouts: 0,
  scoredGames: 0,
  runs: 0,
};

const outcomeCounts = Object.fromEntries(["ball", "strike", "calledStrike", "foul", "contact", "out", "single", "double", "homer"].map((kind) => [kind, 0]));
const pitchCounts = Object.fromEntries(keyList.map((key) => [key, 0]));
const readCounts = Object.fromEntries(keyList.map((key) => [key, 0]));

for (let i = 0; i < games; i += 1) {
  const state = engine.freshState();
  let pitches = 0;

  while (!state.gameOver && pitches < maxPitches) {
    const pitchKey = choosePitch(state, random);
    const readKey = chooseRead(state, random);
    engine.submitRoleChoice(state, "pitcher", pitchKey, random);
    engine.submitRoleChoice(state, "batter", readKey, random);
    pitches += 1;

    const last = state.history[0];
    if (last) {
      outcomeCounts[last.kind] += 1;
      if (last.text.includes("볼넷")) totals.walks += 1;
      if (last.text.includes("삼진")) totals.strikeouts += 1;
    }

    if (!state.gameOver) engine.nextPitch(state);
  }

  totals.games += 1;
  totals.pitches += state.stats.total;
  totals.reads += state.stats.reads;
  totals.partials += state.stats.partials;
  totals.misses += state.stats.misses;
  totals.mistakes += state.stats.mistakes;
  totals.balls += state.stats.balls;
  totals.strikes += state.stats.strikes;
  totals.fouls += state.stats.fouls;
  totals.contacts += state.stats.contacts;
  totals.outs += state.stats.outs;
  totals.hits += state.stats.hits;
  totals.extraBases += state.stats.extraBases;
  totals.homers += state.stats.homers;
  totals.runs += Math.max(0, state.homeScore - 3);
  if (state.homeScore > 3) totals.scoredGames += 1;
  if (state.isTiebreaker) totals.tiebreakers += 1;
  if (pitches >= maxPitches && !state.gameOver) totals.capped += 1;
  if (state.winner === "batter") totals.batterWins += 1;
  if (state.winner === "pitcher") totals.pitcherWins += 1;

  for (const key of keyList) {
    pitchCounts[key] += state.stats.pitch[key];
    readCounts[key] += state.stats.read[key];
  }
}

const report = {
  seed,
  games,
  strategy: {
    pitcher: "count-aware mixed",
    batter: "count-aware mixed",
  },
  rates: {
    batterWinPct: pct(totals.batterWins, totals.games),
    pitcherWinPct: pct(totals.pitcherWins, totals.games),
    scoredGamePct: pct(totals.scoredGames, totals.games),
    tiebreakerPct: pct(totals.tiebreakers, totals.games),
    readPct: pct(totals.reads, totals.pitches),
    partialPct: pct(totals.partials, totals.pitches),
    missPct: pct(totals.misses, totals.pitches),
    mistakePct: pct(totals.mistakes, totals.pitches),
    hitPct: pct(totals.hits, totals.pitches),
    homerPct: pct(totals.homers, totals.pitches),
    strikeoutPct: pct(totals.strikeouts, totals.pitches),
    walkPct: pct(totals.walks, totals.pitches),
  },
  perGame: {
    pitches: round(totals.pitches / totals.games),
    runs: round(totals.runs / totals.games),
    hits: round(totals.hits / totals.games),
    homers: round(totals.homers / totals.games),
    strikeouts: round(totals.strikeouts / totals.games),
    walks: round(totals.walks / totals.games),
  },
  outcomes: outcomeCounts,
  pitchMix: percentMap(pitchCounts, totals.pitches),
  readMix: percentMap(readCounts, totals.pitches),
  warnings: balanceWarnings(),
};

console.log(JSON.stringify(report, null, 2));

function choosePitch(state, rand) {
  const weights = { zone: 1, chase: 1, inside: 1, offspeed: 1 };
  if (state.balls >= 3) {
    weights.zone += 1.6;
    weights.inside += 0.7;
    weights.chase *= 0.45;
  }
  if (state.strikes >= 2) {
    weights.chase += 1.2;
    weights.offspeed += 1;
  }
  if (state.runners[1] || state.runners[2]) {
    weights.inside += 0.5;
    weights.offspeed += 0.35;
  }
  const lastRead = state.history[0]?.read;
  for (const [key, meta] of Object.entries(engine.keys)) {
    if (meta.batText === lastRead || meta.label === lastRead) weights[key] += 0.45;
  }
  return weightedChoice(weights, rand);
}

function chooseRead(state, rand) {
  const weights = { zone: 1, chase: 0.8, inside: 1, offspeed: 1 };
  if (state.balls >= 3) weights.chase += 1.5;
  if (state.strikes >= 2) {
    weights.chase += 0.65;
    weights.offspeed += 0.5;
    weights.zone += 0.35;
  }
  if (state.runners[1] || state.runners[2]) weights.inside += 0.3;
  const lastPitch = state.history[0]?.pitch;
  for (const [key, meta] of Object.entries(engine.keys)) {
    if (meta.label === lastPitch) weights[key] *= 0.72;
  }
  return weightedChoice(weights, rand);
}

function weightedChoice(weights, rand) {
  const entries = Object.entries(weights).map(([key, value]) => [key, Math.max(0.05, value)]);
  const total = entries.reduce((sum, [, value]) => sum + value, 0);
  let cursor = rand() * total;
  for (const [key, value] of entries) {
    cursor -= value;
    if (cursor <= 0) return key;
  }
  return entries[entries.length - 1][0];
}

function mulberry32(seedValue) {
  let value = seedValue >>> 0;
  return function nextRandom() {
    value += 0x6d2b79f5;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pct(value, total) {
  return total ? round((value / total) * 100) : 0;
}

function percentMap(counts, total) {
  return Object.fromEntries(Object.entries(counts).map(([key, value]) => [key, pct(value, total)]));
}

function round(value) {
  return Math.round(value * 100) / 100;
}

function balanceWarnings() {
  const warnings = [];
  const batterWin = pct(totals.batterWins, totals.games);
  const homerRate = pct(totals.homers, totals.pitches);
  const avgPitches = totals.pitches / totals.games;
  const tiebreakerRate = pct(totals.tiebreakers, totals.games);
  if (batterWin < 35 || batterWin > 65) warnings.push(`batter win rate ${batterWin}% is outside 35-65%`);
  if (homerRate > 6) warnings.push(`home run rate ${homerRate}% is high for a short duel`);
  if (avgPitches < 3 || avgPitches > 14) warnings.push(`average pitch count ${round(avgPitches)} feels off for a fast web game`);
  if (tiebreakerRate > 80) warnings.push(`tiebreaker rate ${tiebreakerRate}% may make 9th inning feel inconclusive`);
  if (totals.capped > 0) warnings.push(`${totals.capped} games hit maxPitches cap`);
  return warnings;
}

function parseArgs(argv) {
  const parsed = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith("--")) continue;
    const [key, inline] = arg.slice(2).split("=");
    parsed[key] = inline ?? argv[index + 1] ?? true;
    if (inline === undefined) index += 1;
  }
  return parsed;
}
