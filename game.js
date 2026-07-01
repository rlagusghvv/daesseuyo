const engine = window.DaesseuyoEngine;
const { keys } = engine;

const ui = {
  modeLabel: document.querySelector("#modeLabel"),
  awayName: document.querySelector("#awayName"),
  homeName: document.querySelector("#homeName"),
  awayScore: document.querySelector("#awayScore"),
  homeScore: document.querySelector("#homeScore"),
  awayHits: document.querySelector("#awayHits"),
  homeHits: document.querySelector("#homeHits"),
  awayErrors: document.querySelector("#awayErrors"),
  homeErrors: document.querySelector("#homeErrors"),
  homeNinthScore: document.querySelector("#homeNinthScore"),
  homeTenthScore: document.querySelector("#homeTenthScore"),
  inning: document.querySelector("#inningLabel"),
  bases: [
    [document.querySelector("#base1"), document.querySelector("#mobileBase1")],
    [document.querySelector("#base2"), document.querySelector("#mobileBase2")],
    [document.querySelector("#base3"), document.querySelector("#mobileBase3")],
  ],
  ballDots: [
    document.querySelector("#ballDot1"),
    document.querySelector("#ballDot2"),
    document.querySelector("#ballDot3"),
  ],
  strikeDots: [
    document.querySelector("#strikeDot1"),
    document.querySelector("#strikeDot2"),
  ],
  outDots: [
    document.querySelector("#outDot1"),
    document.querySelector("#outDot2"),
  ],
  phaseLabel: document.querySelector("#phaseLabel"),
  playerRoleLabel: document.querySelector("#playerRoleLabel"),
  turnTitle: document.querySelector("#turnTitle"),
  turnText: document.querySelector("#turnText"),
  roleBadge: document.querySelector("#roleBadge"),
  roleBadgeLabel: document.querySelector("#roleBadgeLabel"),
  roleBadgeValue: document.querySelector("#roleBadgeValue"),
  pitchBox: document.querySelector("#pitchBox"),
  batterBox: document.querySelector("#batterBox"),
  pitchRoleLabel: document.querySelector("#pitchRoleLabel"),
  batterRoleLabel: document.querySelector("#batterRoleLabel"),
  pitchPick: document.querySelector("#pitchPick"),
  pitchHint: document.querySelector("#pitchHint"),
  batterPick: document.querySelector("#batterPick"),
  batterHint: document.querySelector("#batterHint"),
  impactStrip: document.querySelector("#impactStrip"),
  readStep: document.querySelector("#readStep"),
  executionStep: document.querySelector("#executionStep"),
  outcomeStep: document.querySelector("#outcomeStep"),
  actionFlash: document.querySelector("#actionFlash"),
  actionFlashLabel: document.querySelector("#actionFlashLabel"),
  actionFlashMain: document.querySelector("#actionFlashMain"),
  actionFlashSub: document.querySelector("#actionFlashSub"),
  resultMotion: document.querySelector("#resultMotion"),
  motionFrame: document.querySelector("#motionFrame"),
  motionVideo: document.querySelector("#motionVideo"),
  motionScene: document.querySelector("#motionScene"),
  motionLabel: document.querySelector("#motionLabel"),
  motionMain: document.querySelector("#motionMain"),
  motionSub: document.querySelector("#motionSub"),
  zonePulse: document.querySelector("#zonePulse"),
  pitchTrail: document.querySelector("#pitchTrail"),
  targetDot: document.querySelector("#targetDot"),
  keyPad: document.querySelector("#keyPad"),
  resultLine: document.querySelector("#resultLine"),
  resultLabel: document.querySelector("#resultLabel"),
  resultText: document.querySelector("#resultText"),
  nextButton: document.querySelector("#nextButton"),
  pitchTotal: document.querySelector("#pitchTotal"),
  pitchStats: document.querySelector("#pitchStats"),
  readRate: document.querySelector("#readRate"),
  readStats: document.querySelector("#readStats"),
  duelCount: document.querySelector("#duelCount"),
  historySummary: document.querySelector("#historySummary"),
  historyList: document.querySelector("#historyList"),
  resetButton: document.querySelector("#resetButton"),
  modeButtons: [...document.querySelectorAll("button[data-mode]")],
  opponentButtons: [...document.querySelectorAll("button[data-opponent]")],
  aiButtons: [...document.querySelectorAll("button[data-ai-level]")],
  aiLabel: document.querySelector("#aiLabel"),
  rankTier: document.querySelector("#rankTier"),
  rankRating: document.querySelector("#rankRating"),
  rankDelta: document.querySelector("#rankDelta"),
  rankRecord: document.querySelector("#rankRecord"),
  dailySummary: document.querySelector("#dailySummary"),
  entryOverlay: document.querySelector("#entryOverlay"),
  startAiButton: document.querySelector("#startAiButton"),
  startDailyButton: document.querySelector("#startDailyButton"),
  startRankButton: document.querySelector("#startRankButton"),
  startMultiButton: document.querySelector("#startMultiButton"),
  hideEntryButton: document.querySelector("#hideEntryButton"),
  invitePanel: document.querySelector("#invitePanel"),
  inviteLink: document.querySelector("#inviteLink"),
  copyInviteButton: document.querySelector("#copyInviteButton"),
  retryButton: document.querySelector("#retryButton"),
  shareResultButton: document.querySelector("#shareResultButton"),
};

const classes = {
  smallButton: "flex items-center justify-center whitespace-nowrap rounded-md bg-muted p-2 text-xs text-foreground disabled:cursor-default disabled:opacity-50",
  smallButtonActive: "flex items-center justify-center whitespace-nowrap rounded-md bg-primary p-2 text-xs font-semibold text-primary-foreground disabled:cursor-default disabled:opacity-50",
  keyButton: "flex min-w-0 flex-col justify-center whitespace-nowrap rounded-md border border-border bg-card p-2 text-left text-xs text-foreground disabled:cursor-default disabled:opacity-50",
  keyButtonActive: "flex min-w-0 flex-col justify-center whitespace-nowrap rounded-md border border-primary bg-primary p-2 text-left text-xs font-semibold text-primary-foreground disabled:cursor-default disabled:opacity-50",
  roleBadge: "hidden flex-col justify-center rounded-md border border-border bg-background p-2 md:flex md:col-span-1 lg:col-span-2",
  roleBadgeActive: "hidden flex-col justify-center rounded-md border border-primary bg-background p-2 md:flex md:col-span-1 lg:col-span-2",
  playerBox: "hidden rounded-md bg-background/80 p-2 backdrop-blur-md md:block",
  playerBoxMine: "hidden rounded-md border border-primary bg-background/80 p-2 backdrop-blur-md md:block",
  playerBoxReady: "hidden rounded-md border border-primary bg-background/80 p-2 opacity-70 backdrop-blur-md md:block",
  playerBoxRight: "hidden rounded-md bg-background/80 p-2 text-right backdrop-blur-md md:block",
  playerBoxRightMine: "hidden rounded-md border border-primary bg-background/80 p-2 text-right backdrop-blur-md md:block",
  playerBoxRightReady: "hidden rounded-md border border-primary bg-background/80 p-2 text-right opacity-70 backdrop-blur-md md:block",
  result: "hidden",
  resultReveal: "hidden",
  impact: "grid grid-cols-3 gap-2 border-t border-border p-2",
  impactReveal: "grid grid-cols-3 gap-2 border-t border-primary bg-background p-2",
  actionFlash: "hidden",
  actionFlashReveal: "absolute right-4 top-4 z-30 w-32 rounded-md bg-primary p-2 text-center text-primary-foreground",
  motion: "hidden",
  motionReveal: "pointer-events-none absolute inset-0 z-20 flex items-center justify-center p-4",
  motionFrame: "relative flex h-40 w-64 flex-col items-center justify-center overflow-hidden rounded-md border border-border bg-background/80 p-4 text-center backdrop-blur-md",
  motionFrameImpact: "relative flex h-40 w-64 flex-col items-center justify-center overflow-hidden rounded-md border border-primary bg-background/80 p-4 text-center backdrop-blur-md",
  motionFramePrimary: "relative flex h-40 w-64 flex-col items-center justify-center overflow-hidden rounded-md border border-primary bg-primary p-4 text-center text-primary-foreground backdrop-blur-md",
  motionVideo: "absolute inset-0 h-full w-full object-cover opacity-70",
  motionVideoHidden: "hidden",
  zonePulse: "pointer-events-none absolute inset-0 rounded-md border-2 border-border opacity-0",
  zonePulseReveal: "pointer-events-none absolute inset-0 rounded-md border-2 border-primary bg-primary/20 opacity-100 animate-pulse",
  pitchTrail: "pointer-events-none absolute left-1/2 top-0 h-full w-2 -translate-x-1/2 rounded-full bg-primary opacity-0",
  pitchTrailReveal: "pointer-events-none absolute left-1/2 top-0 h-full w-2 -translate-x-1/2 rounded-full bg-primary opacity-70 animate-pulse",
  target: "absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary bg-primary/50",
  targetReveal: "absolute h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary bg-primary ring-2 ring-primary animate-pulse",
  base: "h-2 w-2 rotate-45 rounded-sm border-2 border-border bg-background sm:h-5 sm:w-5",
  baseOn: "h-2 w-2 rotate-45 rounded-sm border-2 border-primary bg-primary sm:h-5 sm:w-5",
  countDot: "h-2 w-2 rounded-full border border-border bg-background sm:h-3 sm:w-3",
  countDotOn: "h-2 w-2 rounded-full border border-primary bg-primary sm:h-3 sm:w-3",
};

const basePositions = [
  "col-start-3 row-start-2",
  "col-start-2 row-start-1",
  "col-start-1 row-start-2",
];

const targetPositions = {
  zone: "left-1/2 top-1/2",
  chase: "left-2/3 top-3/4",
  inside: "left-1/4 top-1/2",
  offspeed: "left-3/4 top-2/3",
  default: "left-1/2 top-1/2",
};

const params = new URLSearchParams(window.location.search);
let roomCode = params.get("duel") || "";
const deviceId = getDeviceId();
const clientId = `c_${deviceId}`;
const session = {
  online: false,
  connecting: false,
  room: roomCode,
  role: "local",
  clients: 1,
  locks: { pitch: false, batter: false },
  roleSlots: { pitcher: false, batter: false, active: 0, graceMs: 45000 },
  matchMode: "casual",
  opponent: "ai",
  lastError: "",
  deadlineAt: 0,
  clockSkew: 0,
};

const aiLevels = {
  rookie: { label: "쉬움", delay: 180, noise: 0.62, counter: 0.2, count: 0.12, repeat: 0.82 },
  normal: { label: "보통", delay: 150, noise: 0.38, counter: 0.52, count: 0.34, repeat: 0.64 },
  hard: { label: "어려움", delay: 120, noise: 0.2, counter: 0.82, count: 0.58, repeat: 0.48 },
  ace: { label: "에이스", delay: 90, noise: 0.1, counter: 1.05, count: 0.78, repeat: 0.34 },
};

let state = engine.freshState();
let profile = loadRankProfile();
session.matchMode = profile.mode;
session.opponent = roomCode ? "multi" : profile.opponent;
let eventSource = null;
let aiTimer = 0;
let autoAdvanceTimer = 0;
let countdownTimer = 0;
let motionVideoRequest = 0;
let serverProfileLoaded = false;
let trackedResultKey = "";
let dailyResultKey = "";
let dailyBoard = { entries: [], updatedAt: 0 };

function getDeviceId() {
  const existing = localStorage.getItem("daesseuyo-device-id");
  if (existing) return existing;
  const random = window.crypto?.randomUUID?.() || `${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;
  const id = random.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 60);
  localStorage.setItem("daesseuyo-device-id", id);
  return id;
}

function multiplayerOrigin() {
  if (window.location.protocol === "file:") return "http://127.0.0.1:4174";
  return window.location.origin;
}

function connectOnline() {
  closeOnline();
  if (session.opponent !== "multi" || !roomCode || params.get("offline") === "1" || !window.EventSource) {
    session.connecting = false;
    render();
    return;
  }

  session.connecting = true;
  session.lastError = "";
  const url = new URL("/events", multiplayerOrigin());
  url.searchParams.set("room", roomCode);
  url.searchParams.set("client", clientId);
  url.searchParams.set("mode", profile.mode);
  eventSource = new EventSource(url);

  eventSource.addEventListener("state", (event) => {
    const payload = JSON.parse(event.data);
    session.online = true;
    session.connecting = false;
    session.opponent = "multi";
    session.role = payload.role;
    session.clients = payload.clients;
    session.locks = payload.locks;
    session.roleSlots = payload.roleSlots || session.roleSlots;
    session.matchMode = payload.mode || profile.mode;
    session.deadlineAt = payload.deadlineAt || 0;
    session.clockSkew = Date.now() - (payload.serverNow || Date.now());
    state = payload.state;
    applyRankResult();
    render();
  });

  eventSource.onerror = () => {
    if (!session.online) {
      session.connecting = false;
      session.lastError = "서버 없음";
      render();
      return;
    }
    session.connecting = true;
    session.lastError = "재연결 중";
    render();
  };
}

function chooseKey(key) {
  if (!keys[key] || state.gameOver) return;

  if (state.phase === "reveal") {
    if (session.opponent === "ai") advanceAiPitch();
    return;
  }

  if (session.opponent === "ai") {
    if (!canChoose()) return;
    if (engine.submitChoice(state, key, Math.random)) render();
    return;
  }

  if (session.online) {
    if (!canChoose()) return;
    postAction("/choose", { key });
    return;
  }

  if (engine.submitChoice(state, key, Math.random)) render();
}

function setMatchMode(mode) {
  if (!["casual", "ranked"].includes(mode)) return;
  profile.mode = mode;
  saveRankProfile();
  session.matchMode = mode;
  if (session.online) postAction("/mode", { mode });
  render();
}

function setOpponentMode(opponent) {
  if (!["ai", "multi"].includes(opponent)) return;
  profile.opponent = opponent;
  saveRankProfile();
  session.opponent = opponent;
  session.lastError = "";
  state = engine.freshState();
  if (opponent === "ai") {
    closeOnline();
    session.online = false;
    session.connecting = false;
    session.role = "batter";
    session.clients = 1;
    session.locks = { pitch: false, batter: false };
    session.deadlineAt = 0;
    render();
    return;
  }
  if (!roomCode) {
    roomCode = generateRoomCode();
    session.room = roomCode;
    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set("duel", roomCode);
    window.history.replaceState({}, "", nextUrl);
    updateInviteLink();
  }
  session.online = false;
  session.connecting = true;
  session.role = "local";
  session.deadlineAt = 0;
  render();
  connectOnline();
}

function generateRoomCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let index = 0; index < 6; index += 1) {
    const random = Math.floor(Math.random() * alphabet.length);
    code += alphabet[random];
  }
  return code;
}

function inviteUrl() {
  const url = new URL(window.location.href);
  url.searchParams.set("duel", roomCode || generateRoomCode());
  url.searchParams.set("ref", "invite");
  return url.href;
}

function updateInviteLink() {
  if (!ui.inviteLink || !ui.invitePanel) return;
  if (!roomCode) {
    ui.invitePanel.className = "hidden";
    return;
  }
  ui.invitePanel.className = "rounded-md bg-background p-4";
  ui.inviteLink.value = inviteUrl();
}

function hideEntryOverlay() {
  profile.onboarded = true;
  saveRankProfile();
  if (ui.entryOverlay) ui.entryOverlay.className = "hidden";
}

function showEntryOverlayIfNeeded() {
  if (!ui.entryOverlay) return;
  const shouldShow = !roomCode && !profile.onboarded && params.get("play") !== "1";
  ui.entryOverlay.className = shouldShow
    ? "fixed inset-0 z-50 flex items-center justify-center bg-background/95 p-4 backdrop-blur-md"
    : "hidden";
  updateInviteLink();
}

function startAiFromEntry(mode = "casual") {
  profile.onboarded = true;
  saveRankProfile();
  setMatchMode(mode);
  setOpponentMode("ai");
  hideEntryOverlay();
  trackEvent(mode === "ranked" ? "start_ai_ranked" : "start_ai");
}

function startDailyFromEntry() {
  const url = new URL(window.location.href);
  url.searchParams.set("daily", todayKey());
  url.searchParams.set("ref", "daily");
  window.history.replaceState({}, "", url);
  profile.onboarded = true;
  profile.aiLevel = "hard";
  saveRankProfile();
  setMatchMode("ranked");
  setOpponentMode("ai");
  hideEntryOverlay();
  trackEvent("start_daily", { daily: todayKey(), aiLevel: profile.aiLevel });
}

function startMultiFromEntry() {
  profile.onboarded = true;
  saveRankProfile();
  setMatchMode("casual");
  setOpponentMode("multi");
  updateInviteLink();
  if (ui.startMultiButton) ui.startMultiButton.textContent = "방 생성됨";
  if (ui.hideEntryButton) ui.hideEntryButton.textContent = "게임 보기";
  trackEvent("create_invite", { room: roomCode });
}

function setAiLevel(level) {
  if (!aiLevels[level]) return;
  profile.aiLevel = level;
  saveRankProfile();
  render();
}

function nextPitch() {
  clearAutoAdvance();
  if (session.opponent === "multi" && session.online) {
    if (state.phase === "reveal" || state.gameOver) postAction("/next", {});
    return;
  }

  state = engine.nextPitch(state);
  render();
}

function resetGame() {
  clearAutoAdvance();
  trackedResultKey = "";
  dailyResultKey = "";
  if (session.opponent === "multi" && session.online) {
    postAction("/reset", {});
    return;
  }
  state = engine.freshState();
  render();
}

function loadRankProfile() {
  try {
    const saved = JSON.parse(localStorage.getItem("daesseuyo-rank-profile") || "{}");
    return {
      deviceId,
      mode: saved.mode === "ranked" ? "ranked" : "casual",
      opponent: saved.opponent === "multi" ? "multi" : "ai",
      aiLevel: aiLevels[saved.aiLevel] ? saved.aiLevel : "normal",
      rating: Number.isFinite(saved.rating) ? saved.rating : 1000,
      wins: Number.isFinite(saved.wins) ? saved.wins : 0,
      losses: Number.isFinite(saved.losses) ? saved.losses : 0,
      streak: Number.isFinite(saved.streak) ? saved.streak : 0,
      lastDelta: Number.isFinite(saved.lastDelta) ? saved.lastDelta : 0,
      lastResultKey: typeof saved.lastResultKey === "string" ? saved.lastResultKey : "",
      serverUpdatedAt: Number.isFinite(saved.serverUpdatedAt) ? saved.serverUpdatedAt : 0,
      onboarded: Boolean(saved.onboarded),
      matches: Array.isArray(saved.matches) ? saved.matches.slice(0, 12) : [],
    };
  } catch {
    return {
      deviceId,
      mode: "casual",
      opponent: "ai",
      aiLevel: "normal",
      rating: 1000,
      wins: 0,
      losses: 0,
      streak: 0,
      lastDelta: 0,
      lastResultKey: "",
      serverUpdatedAt: 0,
      onboarded: false,
      matches: [],
    };
  }
}

function saveRankProfile() {
  localStorage.setItem("daesseuyo-rank-profile", JSON.stringify(profile));
}

function applyRankResult() {
  if (session.matchMode !== "ranked" || !state.gameOver || !state.winner) return;
  const resultKey = `${session.opponent}:${profile.aiLevel}:${session.room || "local"}:${state.stats.total}:${state.awayScore}-${state.homeScore}:${state.winner}`;
  if (profile.lastResultKey === resultKey) return;

  const side = session.opponent === "multi" && session.online && session.role === "pitcher" ? "pitcher" : "batter";
  const won = state.winner === side;
  const ratingBefore = profile.rating;
  const base = won ? 22 : -18;
  const clutch = state.winner === "batter" ? Math.min(6, Math.max(0, state.homeScore - state.awayScore + 2)) : 0;
  const delta = won ? base + clutch : base - (state.stats.reads > 0 ? 2 : 0);

  profile.rating = Math.max(600, profile.rating + delta);
  profile.wins += won ? 1 : 0;
  profile.losses += won ? 0 : 1;
  profile.streak = won ? Math.max(1, profile.streak + 1) : Math.min(-1, profile.streak - 1);
  profile.lastDelta = delta;
  profile.lastResultKey = resultKey;
  profile.matches = [
    {
      at: Date.now(),
      won,
      delta,
      rating: profile.rating,
      mode: session.matchMode,
      opponent: session.opponent,
      role: side,
      score: `${state.awayScore}-${state.homeScore}`,
      pitches: state.stats.total,
    },
    ...profile.matches,
  ].slice(0, 12);
  saveRankProfile();
  syncRecordResult({ won, delta, side, resultKey, ratingBefore });
}

async function syncServerProfile() {
  if (serverProfileLoaded || window.location.protocol === "file:") return;
  serverProfileLoaded = true;
  try {
    const response = await fetch(`${multiplayerOrigin()}/profile?device=${encodeURIComponent(deviceId)}`);
    if (!response.ok) return;
    const payload = await response.json();
    const server = payload.profile;
    if (!server || !Number.isFinite(server.updatedAt) || server.updatedAt <= profile.serverUpdatedAt) return;
    profile.rating = Number.isFinite(server.rating) ? server.rating : profile.rating;
    profile.wins = Number.isFinite(server.wins) ? server.wins : profile.wins;
    profile.losses = Number.isFinite(server.losses) ? server.losses : profile.losses;
    profile.streak = Number.isFinite(server.streak) ? server.streak : profile.streak;
    profile.lastDelta = Number.isFinite(server.lastDelta) ? server.lastDelta : profile.lastDelta;
    profile.matches = Array.isArray(server.matches) ? server.matches.slice(0, 12) : profile.matches;
    profile.serverUpdatedAt = server.updatedAt;
    saveRankProfile();
    render();
  } catch {
    serverProfileLoaded = false;
  }
}

async function syncRecordResult({ won, delta, side, resultKey, ratingBefore }) {
  if (window.location.protocol === "file:") return;
  try {
    const response = await fetch(`${multiplayerOrigin()}/record`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        deviceId,
        resultKey,
        won,
        delta,
        ratingBefore,
        wins: profile.wins - (won ? 1 : 0),
        losses: profile.losses - (won ? 0 : 1),
        streak: won ? Math.max(0, profile.streak - 1) : Math.min(0, profile.streak + 1),
        mode: session.matchMode,
        opponent: session.opponent,
        role: side,
        score: `${state.awayScore}-${state.homeScore}`,
        pitches: state.stats.total,
      }),
    });
    if (!response.ok) return;
    const payload = await response.json();
    if (!payload.profile) return;
    profile.serverUpdatedAt = payload.profile.updatedAt || Date.now();
    saveRankProfile();
  } catch {
    // Local result remains saved even when the server write is temporarily unavailable.
  }
}

function closeOnline() {
  if (eventSource) eventSource.close();
  eventSource = null;
}

async function postAction(path, payload) {
  try {
    await fetch(`${multiplayerOrigin()}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        room: roomCode,
        clientId,
        ...payload,
      }),
    });
  } catch {
    session.online = false;
    session.lastError = "서버 끊김";
    render();
  }
}

function canChoose() {
  if (state.gameOver || state.phase === "reveal") return false;
  if (session.opponent === "ai") return state.phase === "bat";
  if (!session.online) return false;
  if (session.role === "pitcher") return !session.locks.pitch;
  if (session.role === "batter") return !session.locks.batter;
  return false;
}

function render() {
  applyRankResult();
  trackCompletedGame();
  syncDailyResult();
  renderStatus();
  renderRoleState();
  renderPlay();
  renderKeys();
  renderStats();
  renderRank();
  scheduleAiPitch();
  scheduleAutoAdvance();
  scheduleCountdown();
}

function renderStatus() {
  if (ui.modeLabel) ui.modeLabel.textContent = modeText();
  ui.awayName.textContent = session.opponent === "ai" ? "AI" : "수비";
  ui.homeName.textContent = session.opponent === "ai" ? "나" : "공격";
  ui.awayScore.textContent = state.awayScore;
  ui.homeScore.textContent = state.homeScore;
  ui.awayHits.textContent = "7";
  ui.homeHits.textContent = 6 + state.stats.hits;
  ui.awayErrors.textContent = "0";
  ui.homeErrors.textContent = "0";
  ui.homeNinthScore.textContent = state.isTiebreaker ? "0" : Math.max(0, state.homeScore - 3);
  ui.homeTenthScore.textContent = state.isTiebreaker ? Math.max(0, state.homeScore - 3) : "";
  ui.inning.textContent = scoreboardInning();
  ui.bases.forEach((base, index) => {
    base.forEach((baseMarker) => {
      if (baseMarker) baseMarker.className = `${state.runners[index] ? classes.baseOn : classes.base} ${basePositions[index]}`;
    });
  });
  renderCountDots(ui.ballDots, Math.min(3, state.balls));
  renderCountDots(ui.strikeDots, Math.min(2, state.strikes));
  renderCountDots(ui.outDots, Math.min(2, state.outs));
}

function renderCountDots(dots, activeCount) {
  dots.forEach((dot, index) => {
    dot.className = index < activeCount ? classes.countDotOn : classes.countDot;
  });
}

function scoreboardInning() {
  const number = Number.isFinite(state.inningNumber) ? state.inningNumber : parseInt(state.inning, 10) || 9;
  return state.isTiebreaker ? `${number}말 TB` : `${number}말`;
}

function modeText() {
  const mode = session.matchMode === "ranked" ? "랭크" : "친선";
  if (session.opponent === "ai") return `${mode} · AI ${aiLevels[profile.aiLevel].label}`;
  if (session.online) {
    const status = session.connecting ? "재연결" : `${session.roleSlots.active || session.clients}/2`;
    return `${mode} · ${session.room} · ${roleName(session.role)} · ${status}`;
  }
  if (session.connecting) return "멀티 연결중";
  if (session.lastError) return "로컬 2인 · 서버 없음";
  return `${mode} · 로컬 2인`;
}

function roleName(role) {
  if (role === "pitcher") return "투수";
  if (role === "batter") return "타자";
  return "관전";
}

function playerRole() {
  if (session.opponent === "ai") return "batter";
  if (session.online) return session.role;
  return "local";
}

function renderRoleState() {
  const role = playerRole();
  const isPitcher = role === "pitcher";
  const isBatter = role === "batter" || session.opponent === "ai";
  const positionText = rolePositionText(role);

  ui.roleBadgeLabel.textContent = session.opponent === "multi" && !session.online ? "매치" : "현재";
  ui.roleBadgeValue.textContent = session.opponent === "multi" && !session.online ? "대기" : positionText;
  ui.roleBadge.className = isPitcher || isBatter ? classes.roleBadgeActive : classes.roleBadge;
  ui.playerRoleLabel.textContent = rolePositionText(role);

  ui.pitchRoleLabel.textContent = isPitcher ? "내 투구" : "상대 투수";
  ui.batterRoleLabel.textContent = isBatter ? "내 타석" : "상대 타자";
  ui.pitchBox.className = session.locks.pitch || Boolean(state.pitchChoice)
    ? classes.playerBoxReady
    : isPitcher ? classes.playerBoxMine : classes.playerBox;
  ui.batterBox.className = session.locks.batter || Boolean(state.batterChoice)
    ? classes.playerBoxRightReady
    : isBatter ? classes.playerBoxRightMine : classes.playerBoxRight;
}

function rolePositionText(role) {
  if (session.opponent === "multi" && !session.online) return "대기";
  if (role === "pitcher") return "마운드";
  if (role === "batter") return "타석";
  if (role === "observer") return "관전";
  return "로컬";
}

function renderPlay() {
  const pitch = keys[state.pitchChoice];
  const read = keys[state.batterChoice];
  const myTurn = canChoose();
  const multiPicking = session.opponent === "multi" && session.online && state.phase !== "reveal" && !state.gameOver;
  const revealMode = state.phase === "reveal" || state.gameOver;
  ui.resultLine.className = revealMode ? classes.resultReveal : classes.result;
  ui.impactStrip.className = revealMode ? classes.impactReveal : classes.impact;
  ui.resultLabel.className = revealMode
    ? "text-sm font-semibold text-foreground"
    : "text-sm font-semibold text-muted-foreground";
  ui.actionFlash.className = revealMode ? classes.actionFlashReveal : classes.actionFlash;
  ui.resultMotion.className = revealMode ? classes.motionReveal : classes.motion;
  ui.zonePulse.className = revealMode ? classes.zonePulseReveal : classes.zonePulse;
  ui.pitchTrail.className = revealMode ? classes.pitchTrailReveal : classes.pitchTrail;

  if (state.gameOver) {
    ui.phaseLabel.textContent = "종료";
    ui.turnTitle.textContent = state.winner === "batter" ? "끝내기 성공" : "수비 승리";
    ui.turnText.textContent = `${state.awayScore}-${state.homeScore}`;
    ui.resultLabel.textContent = "종료";
    ui.resultText.textContent = state.winner === "batter" ? "타자가 승부를 뒤집었습니다." : "3아웃. 투수가 리드를 지켰습니다.";
    ui.actionFlashLabel.textContent = "경기";
    ui.actionFlashMain.textContent = state.result?.label || (state.winner === "batter" ? "끝내기" : "수비 승");
    ui.actionFlashSub.textContent = `${state.winner === "batter" ? "끝내기" : "3아웃"} · ${state.awayScore}-${state.homeScore}`;
  } else if (multiPicking) {
    ui.phaseLabel.textContent = myTurn ? "QWER 선택" : "대기";
    ui.turnTitle.textContent = myTurn
      ? roleActionText(session.role)
      : `${multiTimeText()} 대기`;
    ui.turnText.textContent = myTurn ? actionHintText(session.role) : readyText();
    ui.resultLabel.textContent = "";
    ui.resultText.textContent = "";
  } else if (state.phase === "pitch") {
    ui.phaseLabel.textContent = session.opponent === "ai" ? "AI" : "투구";
    ui.turnTitle.textContent = session.opponent === "ai"
      ? "투구 선택 중"
      : myTurn ? "던질 공 선택" : "투수 대기";
    ui.turnText.textContent = session.opponent === "ai" ? "곧 타석 차례" : actionHintText("pitcher");
    ui.resultLabel.textContent = "";
    ui.resultText.textContent = "";
  } else if (state.phase === "bat") {
    ui.phaseLabel.textContent = myTurn ? "QWER 선택" : "대기";
    ui.turnTitle.textContent = myTurn ? "칠 공 선택" : "타자 대기";
    ui.turnText.textContent = myTurn ? actionHintText("batter") : "상대 선택 대기";
    ui.resultLabel.textContent = "";
    ui.resultText.textContent = "";
  } else {
    ui.phaseLabel.textContent = "결과";
    ui.turnTitle.textContent = `${state.result.label} · 선택 ${readDisplayText(read)} / 실제 ${pitch.label}`;
    ui.turnText.textContent = `${state.result.relation.label} · ${state.result.execution.label}`;
    ui.resultLabel.textContent = state.result.label;
    ui.resultText.textContent = `${state.result.text} ${session.opponent === "ai" ? "곧바로 다음 공으로 넘어갑니다." : "다음 공은 자동으로 열립니다."}`;
    ui.actionFlashLabel.textContent = `${state.stats.total}구`;
    ui.actionFlashMain.textContent = state.result.label;
    ui.actionFlashSub.textContent = `${state.result.relation.label} · ${state.result.execution.label}`;
  }

  ui.pitchPick.textContent = shownPitchText(pitch);
  ui.pitchHint.textContent = pitchHintText();
  ui.batterPick.textContent = shownBatterText(read);
  ui.batterHint.textContent = batterHintText();
  renderImpactSteps(pitch, read);
  renderResultMotion(pitch, read);

  const targetKey = revealMode ? state.pitchChoice : "default";
  ui.targetDot.className = `${revealMode ? classes.targetReveal : classes.target} ${targetPositions[targetKey] || targetPositions.default}`;
  ui.nextButton.disabled = true;
}

function renderResultMotion(pitch, read) {
  if (!ui.resultMotion || !ui.motionFrame || !ui.motionScene || !ui.motionLabel || !ui.motionMain || !ui.motionSub) return;

  if ((state.phase !== "reveal" && !state.gameOver) || !state.result) {
    ui.motionFrame.className = classes.motionFrame;
    ui.motionScene.innerHTML = "";
    resetMotionVideo();
    ui.motionLabel.className = "relative z-10 text-xs font-semibold text-muted-foreground";
    ui.motionMain.className = "relative z-10 mt-2 text-2xl font-semibold leading-none";
    ui.motionSub.className = "relative z-10 mt-2 max-w-48 truncate text-xs font-semibold text-muted-foreground";
    ui.motionLabel.textContent = "결과";
    ui.motionMain.textContent = "대기";
    ui.motionSub.textContent = "선택 대기";
    return;
  }

  const motion = motionConfig(state.result.kind, pitch, read);
  ui.motionFrame.className = motion.frame;
  if (motion.video) {
    ui.motionScene.innerHTML = "";
    playMotionVideo(motion.video);
  } else {
    resetMotionVideo();
    ui.motionScene.innerHTML = "";
  }
  ui.motionLabel.className = motion.labelClass;
  ui.motionMain.className = motion.mainClass;
  ui.motionSub.className = motion.subClass;
  ui.motionLabel.textContent = motion.label;
  ui.motionMain.textContent = motion.main;
  ui.motionSub.textContent = motion.sub;
}

function resetMotionVideo() {
  if (!ui.motionVideo) return;
  motionVideoRequest += 1;
  ui.motionVideo.onerror = null;
  ui.motionVideo.onloadeddata = null;
  ui.motionVideo.pause();
  ui.motionVideo.removeAttribute("src");
  ui.motionVideo.load();
  ui.motionVideo.className = classes.motionVideoHidden;
}

function playMotionVideo(video) {
  if (!ui.motionVideo) return;
  motionVideoRequest += 1;
  const request = motionVideoRequest;
  const canPlayWebm = typeof ui.motionVideo.canPlayType === "function" && ui.motionVideo.canPlayType("video/webm");
  const firstSource = canPlayWebm ? video.webm : video.mp4;
  const fallbackSource = firstSource === video.webm ? video.mp4 : "";
  loadMotionVideoSource(firstSource, fallbackSource, request);
}

function loadMotionVideoSource(source, fallbackSource, request) {
  const resolvedSource = new URL(source, window.location.href).href;
  const showVideo = () => {
    if (request !== motionVideoRequest) return;
    try {
      ui.motionVideo.currentTime = 0;
    } catch {
      return;
    }
    ui.motionVideo.className = classes.motionVideo;
    const playPromise = ui.motionVideo.play();
    if (playPromise) playPromise.catch(() => {
      if (request === motionVideoRequest) ui.motionVideo.className = classes.motionVideoHidden;
    });
  };

  ui.motionVideo.className = classes.motionVideoHidden;
  ui.motionVideo.onerror = () => {
    if (request !== motionVideoRequest) return;
    if (fallbackSource) {
      loadMotionVideoSource(fallbackSource, "", request);
      return;
    }
    ui.motionVideo.className = classes.motionVideoHidden;
  };
  ui.motionVideo.onloadeddata = showVideo;

  if (ui.motionVideo.src !== resolvedSource) {
    ui.motionVideo.src = source;
    ui.motionVideo.load();
    return;
  }

  if (ui.motionVideo.readyState >= 2) {
    showVideo();
  } else {
    ui.motionVideo.load();
  }
}

function motionConfig(kind, pitch, read) {
  const choice = readDisplayText(read);
  const pitchLabel = pitch?.label || "-";
  const isStrikeout = state.result.text.includes("삼진");
  const scored = Number.isFinite(state.result.scored) ? state.result.scored : 0;
  const base = {
    frame: classes.motionFrame,
    scene: genericScene(),
    labelClass: "relative z-10 text-xs font-semibold text-muted-foreground",
    mainClass: "relative z-10 mt-2 text-2xl font-semibold leading-none",
    subClass: "relative z-10 mt-2 max-w-48 truncate text-xs font-semibold text-muted-foreground",
    label: `${choice} / ${pitchLabel}`,
    main: state.result.label,
    sub: state.result.execution.label,
  };

  if (kind === "homer") {
    return {
      ...base,
      frame: classes.motionFramePrimary,
      video: cutsceneVideo("homer"),
      scene: homerScene(),
      labelClass: "relative z-10 text-xs font-semibold text-primary-foreground",
      mainClass: "relative z-10 mt-2 text-2xl font-semibold leading-none text-primary-foreground",
      subClass: "relative z-10 mt-2 max-w-48 truncate text-xs font-semibold text-primary-foreground",
      main: "홈런",
      sub: "담장 밖",
    };
  }

  if (scored > 0) {
    return {
      ...base,
      frame: classes.motionFrameImpact,
      video: cutsceneVideo("score"),
      scene: scoreScene(),
      main: `${scored}득점`,
      sub: "홈 슬라이딩",
    };
  }

  if (isStrikeout) {
    return {
      ...base,
      frame: classes.motionFrameImpact,
      video: cutsceneVideo("strikeout"),
      scene: strikeoutScene(kind === "calledStrike"),
      main: kind === "calledStrike" ? "루킹 삼진" : "삼진",
      sub: "심판 콜",
    };
  }

  if (kind === "double" || kind === "single") {
    return {
      ...base,
      scene: hitScene(),
      main: kind === "double" ? "장타" : "안타",
      sub: kind === "double" ? "깊은 타구" : "출루",
    };
  }

  if (kind === "strike" || kind === "calledStrike") {
    return {
      ...base,
      scene: strikeScene(kind === "calledStrike"),
      main: kind === "calledStrike" ? "루킹" : "헛스윙",
      sub: "스트라이크",
    };
  }

  if (kind === "ball") {
    return {
      ...base,
      scene: ballScene(),
      main: "볼",
      sub: "골라냈다",
    };
  }

  return {
    ...base,
    scene: genericScene(),
    main: state.result.label,
    sub: state.result.execution.label,
  };
}

function cutsceneVideo(name) {
  return {
    webm: `./Content/Daesseuyo/Generated/Videos/${name}.webm`,
    mp4: `./Content/Daesseuyo/Generated/Videos/${name}.mp4`,
  };
}

function reelSvg(content) {
  return `
    <svg class="h-full w-full text-foreground" viewBox="0 0 256 160" role="img" aria-hidden="true">
      <rect x="0" y="0" width="256" height="160" class="fill-background"></rect>
      <rect x="0" y="104" width="256" height="56" class="fill-muted" opacity="0.35"></rect>
      ${content}
    </svg>
  `;
}

function homerScene() {
  return reelSvg(`
    <g class="text-primary">
      <path d="M24 108H232" class="stroke-current" stroke-width="4" stroke-linecap="round"></path>
      <path d="M32 108V76M56 108V72M80 108V76M104 108V72M128 108V76M152 108V72M176 108V76M200 108V72M224 108V76" class="stroke-current" stroke-width="2" opacity="0.65"></path>
      <path d="M48 120 C88 42 154 18 224 28" class="fill-none stroke-current" stroke-width="3" stroke-linecap="round" stroke-dasharray="8 8" opacity="0.8"></path>
      <circle r="6" class="fill-current">
        <animateMotion dur="0.9s" path="M48 120 C88 42 154 18 224 28" fill="freeze"></animateMotion>
        <animate attributeName="r" values="4;7;5" dur="0.9s" fill="freeze"></animate>
      </circle>
    </g>
    <g class="text-primary-foreground" opacity="0.85">
      <path d="M58 124h38" class="stroke-current" stroke-width="5" stroke-linecap="round">
        <animateTransform attributeName="transform" type="rotate" from="20 58 124" to="-28 58 124" dur="0.45s" fill="freeze"></animateTransform>
      </path>
    </g>
  `);
}

function strikeoutScene(isCalled) {
  return reelSvg(`
    <g class="text-primary">
      <text x="126" y="134" text-anchor="middle" class="fill-current" font-size="54" font-weight="800" opacity="0">
        K
        <animate attributeName="opacity" values="0;1;1" dur="0.7s" fill="freeze"></animate>
      </text>
    </g>
    <g class="text-foreground">
      <circle cx="128" cy="48" r="12" class="fill-current"></circle>
      <path d="M128 60v42" class="stroke-current" stroke-width="8" stroke-linecap="round"></path>
      <path d="M126 72h-30" class="stroke-current" stroke-width="6" stroke-linecap="round"></path>
      <path d="M130 72h34" class="stroke-current" stroke-width="6" stroke-linecap="round">
        <animateTransform attributeName="transform" type="rotate" values="0 130 72;-55 130 72;-45 130 72" dur="0.75s" fill="freeze"></animateTransform>
      </path>
      <path d="M118 106h20" class="stroke-current" stroke-width="6" stroke-linecap="round"></path>
    </g>
    <g class="text-muted-foreground" opacity="0.7">
      <path d="M94 130h68" class="stroke-current" stroke-width="2"></path>
      ${isCalled ? '<circle cx="128" cy="88" r="5" class="fill-current"><animate attributeName="opacity" values="0;1;0.4" dur="0.7s" fill="freeze"></animate></circle>' : ''}
    </g>
  `);
}

function scoreScene() {
  return reelSvg(`
    <g class="text-muted-foreground">
      <path d="M24 122H218" class="stroke-current" stroke-width="3" stroke-linecap="round"></path>
      <path d="M218 108l16 14-16 14-16-14z" class="fill-background stroke-current" stroke-width="3"></path>
    </g>
    <g class="text-primary">
      <path d="M80 130 C112 120 154 120 208 124" class="fill-none stroke-current" stroke-width="4" stroke-linecap="round" opacity="0.35">
        <animate attributeName="opacity" values="0;0.35;0" dur="0.9s" fill="freeze"></animate>
      </path>
      <g>
        <animateTransform attributeName="transform" type="translate" from="-70 0" to="48 0" dur="0.85s" fill="freeze"></animateTransform>
        <circle cx="92" cy="92" r="8" class="fill-current"></circle>
        <path d="M88 102l-28 20h46" class="fill-none stroke-current" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"></path>
        <path d="M104 114l26 10" class="stroke-current" stroke-width="7" stroke-linecap="round"></path>
      </g>
    </g>
  `);
}

function hitScene() {
  return reelSvg(`
    <g class="text-primary">
      <path d="M44 112 C86 72 138 54 212 48" class="fill-none stroke-current" stroke-width="4" stroke-linecap="round" stroke-dasharray="10 8"></path>
      <circle r="5" class="fill-current">
        <animateMotion dur="0.75s" path="M44 112 C86 72 138 54 212 48" fill="freeze"></animateMotion>
      </circle>
    </g>
    <g class="text-muted-foreground">
      <path d="M54 124h42" class="stroke-current" stroke-width="6" stroke-linecap="round">
        <animateTransform attributeName="transform" type="rotate" from="24 54 124" to="-24 54 124" dur="0.45s" fill="freeze"></animateTransform>
      </path>
    </g>
  `);
}

function strikeScene(isCalled) {
  return reelSvg(`
    <g class="text-muted-foreground">
      <rect x="104" y="42" width="48" height="72" rx="4" class="fill-none stroke-current" stroke-width="3"></rect>
      <path d="M128 28v108" class="stroke-current" stroke-width="2" opacity="0.4"></path>
    </g>
    <g class="text-primary">
      <circle cx="128" cy="80" r="6" class="fill-current">
        <animate attributeName="r" values="3;8;5" dur="0.65s" fill="freeze"></animate>
      </circle>
      ${isCalled ? '' : '<path d="M56 122h46" class="stroke-current" stroke-width="6" stroke-linecap="round"><animateTransform attributeName="transform" type="rotate" from="-35 56 122" to="30 56 122" dur="0.5s" fill="freeze"></animateTransform></path>'}
    </g>
  `);
}

function ballScene() {
  return reelSvg(`
    <g class="text-muted-foreground">
      <rect x="104" y="42" width="48" height="72" rx="4" class="fill-none stroke-current" stroke-width="3"></rect>
    </g>
    <g class="text-primary">
      <path d="M58 40 C88 74 154 112 212 124" class="fill-none stroke-current" stroke-width="3" stroke-linecap="round" stroke-dasharray="8 8" opacity="0.85"></path>
      <circle r="5" class="fill-current">
        <animateMotion dur="0.85s" path="M58 40 C88 74 154 112 212 124" fill="freeze"></animateMotion>
      </circle>
    </g>
  `);
}

function genericScene() {
  return reelSvg(`
    <g class="text-muted-foreground">
      <rect x="56" y="42" width="144" height="76" rx="8" class="fill-background stroke-current" stroke-width="2" opacity="0.8"></rect>
    </g>
    <g class="text-primary">
      <circle cx="128" cy="80" r="18" class="fill-none stroke-current" stroke-width="4">
        <animate attributeName="r" values="10;22;18" dur="0.75s" fill="freeze"></animate>
      </circle>
    </g>
  `);
}

function renderImpactSteps(pitch, read) {
  if (session.opponent === "multi" && session.online && state.phase !== "reveal" && !state.gameOver) {
    ui.readStep.textContent = session.locks.batter ? "타자 완료" : "타자 대기";
    ui.executionStep.textContent = session.locks.pitch ? "투수 완료" : "투수 대기";
    ui.outcomeStep.textContent = multiTimeText();
    return;
  }

  if (state.phase === "pitch") {
    ui.readStep.textContent = "타자 대기";
    ui.executionStep.textContent = session.opponent === "ai" ? "AI 선택중" : "투수 선택";
    ui.outcomeStep.textContent = "대기";
    return;
  }

  if (state.phase === "bat") {
    ui.readStep.textContent = "타자 선택";
    ui.executionStep.textContent = "투구 숨김";
    ui.outcomeStep.textContent = "대기";
    return;
  }

  if (!state.result) {
    ui.readStep.textContent = "대기";
    ui.executionStep.textContent = "숨김";
    ui.outcomeStep.textContent = "대기";
    return;
  }

  ui.readStep.textContent = `${state.result.relation.label} · ${readDisplayText(read)}`;
  ui.executionStep.textContent = state.result.execution.label;
  ui.outcomeStep.textContent = state.result.label;
}

function shownPitchText(pitch) {
  if (state.phase === "reveal" || state.gameOver) return pitch?.label || "숨김";
  if (session.opponent === "multi" && session.online) return session.locks.pitch ? "선택 완료" : "대기";
  if (session.opponent === "ai" && state.phase === "pitch") return "AI";
  if (state.phase === "bat" || session.locks.pitch) return "선택 완료";
  return "숨김";
}

function roleActionText(role) {
  if (role === "pitcher") return "던질 공 선택";
  if (role === "batter") return "칠 공 선택";
  return "선택 대기";
}

function actionHintText(role) {
  if (role === "pitcher") return "상대가 못 맞힐 공 고르기";
  if (role === "batter") return "칠 공을 고르거나 W로 골라내기";
  return "Q/W/E/R 중 하나";
}

function shownBatterText(read) {
  if (state.phase === "reveal" || state.gameOver) return readDisplayText(read);
  if (session.opponent === "multi" && session.online) return session.locks.batter ? "선택 완료" : "대기";
  if (session.locks.batter) return "선택 완료";
  return "대기";
}

function readDisplayText(read) {
  return read?.batText || read?.label || "대기";
}

function pitchHintText() {
  if (session.opponent === "multi" && session.online) {
    if (session.role === "pitcher") return session.locks.pitch ? "내 선택 완료" : `${multiTimeText()} 선택`;
    return session.locks.pitch ? "상대 선택 완료" : "상대 투수 선택중";
  }
  if (session.opponent === "ai" && state.phase === "pitch") return "AI 계산중";
  return state.phase === "pitch" ? "투수 차례" : "공개 전까지 숨김";
}

function batterHintText() {
  if (session.opponent === "multi" && session.online) {
    if (session.role === "batter") return session.locks.batter ? "내 선택 완료" : `${multiTimeText()} 선택`;
    return session.locks.batter ? "상대 선택 완료" : "상대 타자 선택중";
  }
  return state.phase === "bat" ? "내 타석" : "투수 선택 후 진행";
}

function readyText() {
  if (!session.online) return "연결을 기다립니다.";
  if (session.connecting) return "재연결 중입니다.";
  if (session.roleSlots.active < 2) return "친구 입장을 기다립니다.";
  if (session.role === "pitcher" && session.locks.pitch) return "내 투구 선택 완료. 타자를 기다립니다.";
  if (session.role === "batter" && session.locks.batter) return "내 선택 완료. 투수를 기다립니다.";
  if (session.role === "observer") return "관전 중입니다.";
  return "상대 선택을 기다립니다.";
}

function multiTimeText() {
  if (!session.deadlineAt) return "선택 대기";
  const now = Date.now() - session.clockSkew;
  const left = Math.max(0, Math.ceil((session.deadlineAt - now) / 1000));
  return `${left}초`;
}

function renderKeys() {
  const disabled = !canChoose();
  [...ui.keyPad.querySelectorAll("button")].forEach((button) => {
    const key = button.dataset.key;
    const active = session.opponent === "ai" && state.phase === "bat" && state.batterChoice === key;
    button.className = active ? classes.keyButtonActive : classes.keyButton;
    button.disabled = disabled;
    const usePitchText = session.opponent === "multi" && session.online && session.role === "pitcher";
    button.querySelector("strong").textContent = keyTitleText(key, usePitchText);
    button.querySelector("span").textContent = keyHelpText(key, usePitchText);
  });
}

function keyTitleText(key, usePitchText) {
  const batterText = {
    zone: "Q 존 안",
    chase: "W 골라내기",
    inside: "E 몸쪽",
    offspeed: "R 느린 공",
  };
  const pitcherText = {
    zone: "Q 존 안",
    chase: "W 존 밖",
    inside: "E 몸쪽",
    offspeed: "R 느린 공",
  };
  return (usePitchText ? pitcherText : batterText)[key] || keys[key].label;
}

function keyHelpText(key, usePitchText) {
  const batterText = {
    zone: "스트라이크",
    chase: "볼 보기",
    inside: "안쪽 공",
    offspeed: "변화구",
  };
  const pitcherText = {
    zone: "스트라이크",
    chase: "볼",
    inside: "안쪽 공",
    offspeed: "변화구",
  };
  return (usePitchText ? pitcherText : batterText)[key] || keys[key].label;
}

function scheduleAiPitch() {
  if (session.opponent !== "ai" || state.phase !== "pitch" || state.gameOver || aiTimer) return;
  aiTimer = window.setTimeout(() => {
    aiTimer = 0;
    if (session.opponent !== "ai" || state.phase !== "pitch" || state.gameOver) return;
    engine.submitChoice(state, chooseAiPitch(), Math.random);
    render();
  }, aiLevels[profile.aiLevel].delay);
}

function scheduleAutoAdvance() {
  if (autoAdvanceTimer && (session.opponent !== "ai" || state.phase !== "reveal" || state.gameOver)) {
    clearAutoAdvance();
  }
  if (session.opponent !== "ai" || state.phase !== "reveal" || state.gameOver || autoAdvanceTimer) return;
  autoAdvanceTimer = window.setTimeout(() => {
    autoAdvanceTimer = 0;
    if (session.opponent !== "ai" || state.phase !== "reveal" || state.gameOver) return;
    advanceAiPitch();
  }, revealAdvanceDelay());
}

function clearAutoAdvance() {
  if (!autoAdvanceTimer) return;
  window.clearTimeout(autoAdvanceTimer);
  autoAdvanceTimer = 0;
}

function revealAdvanceDelay() {
  if (!state.result) return 1050;
  const hasCutscene = state.result.kind === "homer" || state.result.scored > 0 || state.result.text.includes("삼진");
  return hasCutscene ? 3800 : 1050;
}

function advanceAiPitch() {
  clearAutoAdvance();
  state = engine.nextPitch(state);
  if (!state.gameOver && state.phase === "pitch") {
    engine.submitChoice(state, chooseAiPitch(), Math.random);
  }
  render();
}

function scheduleCountdown() {
  if (countdownTimer) {
    window.clearTimeout(countdownTimer);
    countdownTimer = 0;
  }
  if (session.opponent !== "multi" || !session.online || state.phase === "reveal" || state.gameOver || !session.deadlineAt) return;
  countdownTimer = window.setTimeout(() => {
    countdownTimer = 0;
    render();
  }, 500);
}

function chooseAiPitch() {
  const level = aiLevels[profile.aiLevel];
  const weights = {
    zone: 1,
    chase: 1,
    inside: 1,
    offspeed: 1,
  };

  const totalReads = Math.max(1, state.stats.total);
  for (const key of Object.keys(keys)) {
    const humanReadRate = state.stats.read[key] / totalReads;
    weights[key] += level.counter * (1 - humanReadRate) * 2.2;
  }

  if (state.balls >= 3) {
    weights.zone += 1.4 * level.count;
    weights.inside += 0.8 * level.count;
    weights.chase -= 0.7 * level.count;
  }
  if (state.strikes >= 2) {
    weights.chase += 1.35 * level.count;
    weights.offspeed += 1.05 * level.count;
  }
  if (state.runners[1] || state.runners[2]) {
    weights.inside += 0.7 * level.count;
    weights.offspeed += 0.45 * level.count;
  }

  const lastPitch = state.history[0]?.pitch;
  for (const [key, meta] of Object.entries(keys)) {
    if (meta.label === lastPitch) weights[key] *= level.repeat;
    weights[key] = Math.max(0.18, weights[key] + Math.random() * level.noise);
  }

  return weightedChoice(weights);
}

function weightedChoice(weights) {
  const entries = Object.entries(weights);
  const total = entries.reduce((sum, [, value]) => sum + value, 0);
  let cursor = Math.random() * total;
  for (const [key, value] of entries) {
    cursor -= value;
    if (cursor <= 0) return key;
  }
  return entries[entries.length - 1][0];
}

function renderStats() {
  ui.pitchTotal.textContent = `${state.stats.total}구`;
  ui.pitchStats.innerHTML = renderCountBars(state.stats.pitch);
  const readRate = state.stats.total ? Math.round((state.stats.reads / state.stats.total) * 100) : 0;
  const contacts = Number.isFinite(state.stats.contacts) ? state.stats.contacts : 0;
  ui.readRate.textContent = `${readRate}%`;
  ui.readStats.innerHTML = `
    ${statLine("맞힘", state.stats.reads, state.stats.total, "read")}
    ${statLine("비슷함", state.stats.partials, state.stats.total, "partial")}
    ${statLine("빗나감", state.stats.misses, state.stats.total, "miss")}
    ${statLine("실투", state.stats.mistakes, state.stats.total, "mistake")}
    ${statLine("빗맞음", contacts, state.stats.total, "contact")}
  `;
  ui.duelCount.textContent = `${state.stats.total}`;
  const latest = state.history[0];
  if (ui.historySummary) {
    ui.historySummary.textContent = latest
      ? `${latest.no}구 ${latest.label} · ${latest.relation}`
      : "기록 없음";
  }
  ui.historyList.innerHTML = state.history.length
    ? state.history.slice(0, 6).map((item) => `
      <div class="rounded-md bg-background p-2 text-xs text-muted-foreground">
        <strong class="block truncate text-foreground">${item.no}구 ${item.label} · ${item.pitch} / ${item.read}</strong>
        <span class="block truncate">${item.inning} · ${item.score} · ${item.count} · ${item.outs}아웃</span>
        <span class="block truncate">${item.runners} · ${item.relation} · ${item.execution}</span>
      </div>
    `).join("")
    : `<div class="rounded-md bg-background p-2 text-xs text-muted-foreground"><strong class="block text-foreground">대기</strong>아직 승부 기록이 없습니다.</div>`;
}

function renderRank() {
  ui.modeButtons.forEach((button) => {
    if (button.dataset.mode === "casual") button.textContent = session.opponent === "ai" ? "AI 연습" : "친선";
    if (button.dataset.mode === "ranked") button.textContent = session.opponent === "ai" ? "AI 랭크" : "랭크";
  });
  ui.modeButtons.forEach((button) => {
    const active = button.dataset.mode === session.matchMode;
    button.className = active ? classes.smallButtonActive : classes.smallButton;
    button.setAttribute("aria-pressed", String(active));
  });
  if (ui.rankTier) ui.rankTier.textContent = tierName(profile.rating);
  if (ui.rankRating) ui.rankRating.textContent = `${profile.rating}`;
  if (ui.rankDelta) {
    ui.rankDelta.textContent = profile.lastDelta === 0
      ? "±0"
      : `${profile.lastDelta > 0 ? "+" : ""}${profile.lastDelta}`;
    ui.rankDelta.className = profile.lastDelta === 0
      ? "text-xs not-italic text-muted-foreground"
      : "text-xs not-italic text-primary";
  }
  const streak = profile.streak === 0 ? "" : ` · ${Math.abs(profile.streak)}${profile.streak > 0 ? "연승" : "연패"}`;
  if (ui.rankRecord) ui.rankRecord.textContent = `${profile.wins}승 ${profile.losses}패${streak}`;
  if (ui.dailySummary) ui.dailySummary.textContent = dailySummaryText();
  ui.opponentButtons.forEach((button) => {
    const active = button.dataset.opponent === session.opponent;
    button.className = active ? classes.smallButtonActive : classes.smallButton;
    button.setAttribute("aria-pressed", String(active));
  });
  ui.aiButtons.forEach((button) => {
    const active = button.dataset.aiLevel === profile.aiLevel;
    button.className = `hidden lg:block ${active ? classes.smallButtonActive : classes.smallButton}`;
    button.setAttribute("aria-pressed", String(active));
    button.disabled = session.opponent !== "ai";
  });
  ui.aiLabel.textContent = session.matchMode === "ranked"
    ? `AI 랭크 · ${aiLevels[profile.aiLevel].label}`
    : `AI ${aiLevels[profile.aiLevel].label}`;
  if (ui.retryButton) {
    ui.retryButton.className = state.gameOver
      ? "rounded-md bg-muted px-2 py-2 text-xs font-semibold text-foreground"
      : "hidden";
  }
  if (ui.shareResultButton) {
    ui.shareResultButton.className = state.gameOver
      ? "rounded-md bg-primary px-2 py-2 text-xs font-semibold text-primary-foreground"
      : "hidden";
    ui.shareResultButton.textContent = "공유";
  }
}

function dailySummaryText() {
  const daily = activeDailyKey();
  if (!daily) return "오늘의 승부 대기";
  const entries = dailyBoard.entries || [];
  if (!entries.length) return "오늘 기록 없음";
  const leader = entries[0];
  return `오늘 1위 ${leader.score}점 · ${leader.pitches}구`;
}

function tierName(rating) {
  if (rating >= 1500) return "다이아";
  if (rating >= 1300) return "골드";
  if (rating >= 1150) return "실버";
  if (rating >= 1000) return "브론즈";
  return "루키";
}

function rankResultText() {
  const side = session.online && session.role === "pitcher" ? "pitcher" : "batter";
  const won = state.winner === side;
  const delta = profile.lastDelta === 0 ? "" : ` ${profile.lastDelta > 0 ? "+" : ""}${profile.lastDelta}`;
  return `${won ? "랭크 승리" : "랭크 패배"}${delta}`;
}

function todayKey() {
  return new Date().toISOString().slice(0, 10).replaceAll("-", "");
}

function sourceRef() {
  const current = new URLSearchParams(window.location.search);
  return current.get("ref") || current.get("utm_source") || "";
}

function resultShareUrl() {
  const url = new URL(window.location.href);
  const readRate = state.stats.total ? Math.round((state.stats.reads / state.stats.total) * 100) : 0;
  url.searchParams.delete("duel");
  url.searchParams.set("play", "1");
  url.searchParams.set("ref", "result");
  url.searchParams.set("share", "1");
  url.searchParams.set("score", `${state.awayScore}-${state.homeScore}`);
  url.searchParams.set("pitches", `${state.stats.total}`);
  url.searchParams.set("read", `${readRate}`);
  url.searchParams.set("result", resultWon() ? "win" : "loss");
  const daily = activeDailyKey();
  if (daily) url.searchParams.set("daily", daily);
  return url.href;
}

function resultShareText() {
  const won = resultWon();
  const readRate = state.stats.total ? Math.round((state.stats.reads / state.stats.total) * 100) : 0;
  const title = won ? "9회말 승부 이겼다" : "9회말 승부 졌다";
  const daily = activeDailyKey() ? " 오늘의 승부 기록판도 열림." : "";
  return `${title}. ${state.awayScore}-${state.homeScore}, ${state.stats.total}구, 읽기 ${readRate}%.${daily} 대쓰요에서 한 판 붙자.`;
}

function resultWon() {
  const role = session.online && session.role === "pitcher" ? "투수" : "타자";
  return state.winner === "batter" ? role !== "투수" : role === "투수";
}

async function shareResult() {
  const text = resultShareText();
  const url = resultShareUrl();
  const payload = {
    title: "대쓰요: real BaseBall",
    text,
    url,
  };
  try {
    if (navigator.share) {
      await navigator.share(payload);
    } else {
      await navigator.clipboard.writeText(`${text}\n${url}`);
    }
    trackEvent("share_result", {
      winner: state.winner,
      score: `${state.awayScore}-${state.homeScore}`,
      pitches: state.stats.total,
    });
    if (ui.shareResultButton) {
      ui.shareResultButton.textContent = "완료";
      window.setTimeout(() => {
        if (ui.shareResultButton) ui.shareResultButton.textContent = "공유";
      }, 1200);
    }
  } catch {
    if (ui.shareResultButton) ui.shareResultButton.textContent = "실패";
  }
}

function trackCompletedGame() {
  if (!state.gameOver || !state.winner) return;
  const key = `${session.opponent}:${session.matchMode}:${session.room || "local"}:${state.stats.total}:${state.awayScore}-${state.homeScore}:${state.winner}`;
  if (trackedResultKey === key) return;
  trackedResultKey = key;
  const readRate = state.stats.total ? Math.round((state.stats.reads / state.stats.total) * 100) : 0;
  trackEvent("game_over", {
    winner: state.winner,
    score: `${state.awayScore}-${state.homeScore}`,
    pitches: state.stats.total,
    readRate,
    result: state.result?.kind || "",
  });
}

function activeDailyKey() {
  const current = new URLSearchParams(window.location.search);
  return current.get("daily") || "";
}

async function loadDailyBoard() {
  if (window.location.protocol === "file:") return;
  const daily = activeDailyKey();
  if (!daily) return;
  try {
    const response = await fetch(`${multiplayerOrigin()}/daily?date=${encodeURIComponent(daily)}`);
    if (!response.ok) return;
    const payload = await response.json();
    if (!payload.board || !Array.isArray(payload.board.entries)) return;
    dailyBoard = payload.board;
    renderRank();
  } catch {
    // Daily board is optional and should not affect the game loop.
  }
}

async function syncDailyResult() {
  if (window.location.protocol === "file:" || !state.gameOver || !state.winner) return;
  const daily = activeDailyKey();
  if (!daily) return;
  const readRate = state.stats.total ? Math.round((state.stats.reads / state.stats.total) * 100) : 0;
  const resultKey = `${daily}:${session.opponent}:${session.room || "local"}:${state.stats.total}:${state.awayScore}-${state.homeScore}:${state.winner}:${state.result?.kind || ""}`;
  if (dailyResultKey === resultKey) return;
  dailyResultKey = resultKey;
  try {
    const response = await fetch(`${multiplayerOrigin()}/daily`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        daily,
        deviceId,
        resultKey,
        won: resultWon(),
        winner: state.winner,
        score: `${state.awayScore}-${state.homeScore}`,
        pitches: state.stats.total,
        readRate,
        outcome: state.result?.kind || "",
      }),
    });
    if (!response.ok) return;
    const payload = await response.json();
    if (payload.board && Array.isArray(payload.board.entries)) {
      dailyBoard = payload.board;
      renderRank();
    }
  } catch {
    dailyResultKey = "";
  }
}

function trackEvent(eventName, extra = {}) {
  if (window.location.protocol === "file:") return;
  const payload = {
    event: eventName,
    deviceId,
    ref: sourceRef(),
    path: window.location.pathname,
    room: roomCode ? "1" : "",
    mode: session.matchMode,
    opponent: session.opponent,
    ts: Date.now(),
    ...extra,
  };
  const body = JSON.stringify(payload);
  const url = `${multiplayerOrigin()}/metrics`;
  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon(url, blob);
      return;
    }
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Traffic metrics are best-effort and should never affect play.
  }
}

function renderCountBars(counts) {
  return Object.entries(keys).map(([key, meta]) => statLine(meta.label, counts[key], state.stats.total, key)).join("");
}

function statLine(label, value, total, key) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return `
    <div class="grid gap-2 rounded-md bg-background p-2" data-key="${key}">
      <div class="flex justify-between gap-2 text-xs text-muted-foreground">
        <span>${label}</span>
        <strong class="text-foreground">${value} · ${pct}%</strong>
      </div>
      <span class="hidden grid-cols-10 gap-2 xl:grid">${statSegments(pct)}</span>
    </div>
  `;
}

function statSegments(pct) {
  const filled = Math.round(pct / 10);
  return Array.from({ length: 10 }, (_, index) =>
    `<span class="h-2 rounded-md ${index < filled ? "bg-primary" : "bg-muted"}"></span>`
  ).join("");
}

ui.keyPad.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-key]");
  if (!button) return;
  chooseKey(button.dataset.key);
});

ui.nextButton.addEventListener("click", nextPitch);
ui.resetButton.addEventListener("click", resetGame);
ui.modeButtons.forEach((button) => {
  button.addEventListener("click", () => setMatchMode(button.dataset.mode));
});
ui.opponentButtons.forEach((button) => {
  button.addEventListener("click", () => setOpponentMode(button.dataset.opponent));
});
ui.aiButtons.forEach((button) => {
  button.addEventListener("click", () => setAiLevel(button.dataset.aiLevel));
});
if (ui.startAiButton) {
  ui.startAiButton.addEventListener("click", () => startAiFromEntry("casual"));
}
if (ui.startDailyButton) {
  ui.startDailyButton.addEventListener("click", startDailyFromEntry);
}
if (ui.startRankButton) {
  ui.startRankButton.addEventListener("click", () => startAiFromEntry("ranked"));
}
if (ui.startMultiButton) {
  ui.startMultiButton.addEventListener("click", startMultiFromEntry);
}
if (ui.hideEntryButton) {
  ui.hideEntryButton.addEventListener("click", hideEntryOverlay);
}
if (ui.copyInviteButton) {
  ui.copyInviteButton.addEventListener("click", async () => {
    updateInviteLink();
    try {
      await navigator.clipboard.writeText(ui.inviteLink.value);
      trackEvent("copy_invite", { room: roomCode });
      ui.copyInviteButton.textContent = "완료";
      window.setTimeout(() => {
        ui.copyInviteButton.textContent = "복사";
      }, 1200);
    } catch {
      ui.inviteLink.select();
    }
  });
}
if (ui.retryButton) {
  ui.retryButton.addEventListener("click", () => {
    trackEvent("retry", {
      previousWinner: state.winner,
      previousScore: `${state.awayScore}-${state.homeScore}`,
      previousPitches: state.stats.total,
    });
    resetGame();
  });
}
if (ui.shareResultButton) {
  ui.shareResultButton.addEventListener("click", shareResult);
}

window.addEventListener("keydown", (event) => {
  const map = { q: "zone", w: "chase", e: "inside", r: "offspeed" };
  const key = map[event.key.toLowerCase()];
  if (key) {
    event.preventDefault();
    chooseKey(key);
  }
  if (event.code === "Space" || event.key === "Enter") {
    event.preventDefault();
    nextPitch();
  }
});

showEntryOverlayIfNeeded();
syncServerProfile();
loadDailyBoard();
render();
trackEvent("view", {
  entry: roomCode ? "duel" : params.get("daily") ? "daily" : "home",
});
if (session.opponent === "multi") connectOnline();
