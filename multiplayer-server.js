#!/usr/bin/env node

const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { URL } = require("url");
const engine = require("./shared-engine.js");

const rootDir = __dirname;
const port = Number(process.env.PORT || 4174);
const bindHost = process.env.BIND_HOST || process.env.HOST || "127.0.0.1";
const dataDir = path.join(rootDir, ".data");
const recordsFile = path.join(dataDir, "rank-records.json");
const metricsFile = path.join(dataDir, "traffic-events.jsonl");
const rooms = new Map();
const MULTI_PICK_MS = 7000;
const REVEAL_MS = 3800;
const ROOM_TTL_MS = Number(process.env.ROOM_TTL_MS || 10 * 60 * 1000);
const HEARTBEAT_MS = Number(process.env.HEARTBEAT_MS || 15000);
const CLEANUP_MS = Number(process.env.CLEANUP_MS || 30000);
const ROLE_GRACE_MS = Number(process.env.ROLE_GRACE_MS || 45 * 1000);
const records = loadRecords();

function getRoom(roomId) {
  const id = sanitizeRoom(roomId);
  if (!rooms.has(id)) {
    rooms.set(id, {
      id,
      state: engine.freshState(),
      roles: { pitcher: "", batter: "" },
      clients: new Map(),
      mode: "casual",
      seq: 0,
      deadlineAt: 0,
      roundTimer: null,
      advanceTimer: null,
      updatedAt: Date.now(),
      createdAt: Date.now(),
    });
    startRound(rooms.get(id));
  }
  const room = rooms.get(id);
  touchRoom(room);
  return room;
}

function sanitizeRoom(value) {
  const safe = String(value || "default").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 24);
  return safe || "default";
}

function sanitizeClient(value) {
  return String(value || "").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 80);
}

function touchRoom(room) {
  if (room) room.updatedAt = Date.now();
}

function assignRole(room, clientId) {
  pruneDisconnectedRoles(room);
  if (room.roles.pitcher === clientId) return "pitcher";
  if (room.roles.batter === clientId) return "batter";
  if (!room.roles.pitcher) {
    room.roles.pitcher = clientId;
    return "pitcher";
  }
  if (!room.roles.batter) {
    room.roles.batter = clientId;
    return "batter";
  }
  return "observer";
}

function clientCount(room) {
  return [...room.clients.values()].filter((client) => client.connections.size > 0).length;
}

function activeRoleCount(room) {
  return ["pitcher", "batter"].filter((role) => {
    const clientId = room.roles[role];
    if (!clientId) return false;
    const client = room.clients.get(clientId);
    return client && client.connections.size > 0;
  }).length;
}

function pruneDisconnectedRoles(room) {
  const now = Date.now();
  for (const role of ["pitcher", "batter"]) {
    const clientId = room.roles[role];
    if (!clientId) continue;
    const client = room.clients.get(clientId);
    if (!client || (client.connections.size === 0 && now - client.disconnectedAt > ROLE_GRACE_MS)) {
      room.roles[role] = "";
      if (client && client.connections.size === 0) room.clients.delete(clientId);
    }
  }
}

function publicPayload(room, clientId, message = "") {
  const role = assignRole(room, clientId);
  const state = JSON.parse(JSON.stringify(room.state));
  const reveal = state.phase === "reveal" || state.gameOver;
  if (!reveal) {
    state.pitchChoice = "";
    state.batterChoice = "";
    state.result = null;
  }
  return {
    room: room.id,
    mode: room.mode,
    role,
    clients: clientCount(room),
    seq: room.seq,
    serverNow: Date.now(),
    deadlineAt: room.deadlineAt,
    pickMs: MULTI_PICK_MS,
    revealMs: REVEAL_MS,
    locks: {
      pitch: Boolean(room.state.pitchChoice),
      batter: Boolean(room.state.batterChoice),
    },
    roleSlots: {
      pitcher: Boolean(room.roles.pitcher),
      batter: Boolean(room.roles.batter),
      active: activeRoleCount(room),
      graceMs: ROLE_GRACE_MS,
    },
    state,
    message,
  };
}

function sendEvent(res, event, payload) {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
}

function broadcast(room, message = "") {
  touchRoom(room);
  room.seq += 1;
  for (const [clientId, client] of room.clients) {
    for (const res of client.connections) {
      sendEvent(res, "state", publicPayload(room, clientId, message));
    }
  }
}

function startRound(room) {
  touchRoom(room);
  clearTimeout(room.roundTimer);
  clearTimeout(room.advanceTimer);
  room.roundTimer = null;
  room.advanceTimer = null;
  if (room.state.gameOver || room.state.phase === "reveal") {
    room.deadlineAt = 0;
    return;
  }
  room.deadlineAt = Date.now() + MULTI_PICK_MS;
  room.roundTimer = setTimeout(() => finishRound(room, "time expired"), MULTI_PICK_MS);
}

function finishRound(room, message = "revealed") {
  touchRoom(room);
  clearTimeout(room.roundTimer);
  room.roundTimer = null;
  if (room.state.gameOver || room.state.phase === "reveal") return;

  if (!room.state.pitchChoice) engine.submitRoleChoice(room.state, "pitcher", randomKey(), Math.random);
  if (!room.state.batterChoice) engine.submitRoleChoice(room.state, "batter", randomKey(), Math.random);
  room.deadlineAt = 0;
  broadcast(room, message);
  scheduleAutoNext(room);
}

function scheduleAutoNext(room) {
  clearTimeout(room.advanceTimer);
  room.advanceTimer = null;
  if (room.state.gameOver || room.state.phase !== "reveal") return;
  room.advanceTimer = setTimeout(() => {
    room.advanceTimer = null;
    if (room.state.gameOver) {
      broadcast(room, "game over");
      return;
    }
    room.state = engine.nextPitch(room.state);
    startRound(room);
    broadcast(room, "next pitch");
  }, REVEAL_MS);
}

function randomKey() {
  const list = Object.keys(engine.keys);
  return list[Math.floor(Math.random() * list.length)];
}

function handleEvents(req, res, url) {
  const clientId = sanitizeClient(url.searchParams.get("client"));
  if (!clientId) {
    writeJson(res, 400, { error: "missing client id" });
    return;
  }
  const room = getRoom(url.searchParams.get("room"));

  const requestedMode = validMode(url.searchParams.get("mode"));
  if (requestedMode) room.mode = requestedMode;

  assignRole(room, clientId);
  if (!room.clients.has(clientId)) {
    room.clients.set(clientId, { connections: new Set(), disconnectedAt: 0 });
  }
  const client = room.clients.get(clientId);
  client.disconnectedAt = 0;

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*",
  });
  res.write(": connected\n\n");
  client.connections.add(res);
  const heartbeat = setInterval(() => {
    res.write(`: heartbeat ${Date.now()}\n\n`);
  }, HEARTBEAT_MS);
  if (heartbeat.unref) heartbeat.unref();
  sendEvent(res, "state", publicPayload(room, clientId, "connected"));
  broadcast(room);

  req.on("close", () => {
    clearInterval(heartbeat);
    client.connections.delete(res);
    if (client.connections.size === 0) {
      client.disconnectedAt = Date.now();
      if (room.clients.size > 0) broadcast(room);
      else touchRoom(room);
    }
  });
}

async function handleAction(req, res, url) {
  const body = await readBody(req);
  if (url.pathname === "/record") {
    const result = saveRecord(body);
    writeJson(res, result.ok ? 200 : 400, result);
    return;
  }
  if (url.pathname === "/daily") {
    const result = saveDailyResult(body);
    writeJson(res, result.ok ? 200 : 400, result);
    return;
  }

  const clientId = sanitizeClient(body.clientId);
  if (!clientId) {
    writeJson(res, 400, { ok: false, error: "missing client id" });
    return;
  }
  const room = getRoom(body.room);
  const role = assignRole(room, clientId);

  if (url.pathname === "/choose") {
    if (!engine.keys[body.key]) {
      writeJson(res, 400, { ok: false, error: "invalid key" });
      return;
    }
    if (role !== "pitcher" && role !== "batter") {
      writeJson(res, 403, { ok: false, error: "not your turn" });
      return;
    }
    const changed = engine.submitRoleChoice(room.state, role, body.key, Math.random);
    if (room.state.phase === "reveal" || room.state.gameOver) {
      room.deadlineAt = 0;
      clearTimeout(room.roundTimer);
      room.roundTimer = null;
      scheduleAutoNext(room);
    }
    broadcast(room, changed ? "choice accepted" : "choice ignored");
    writeJson(res, 200, { ok: changed });
    return;
  }

  if (url.pathname === "/next") {
    if (role !== "pitcher" && role !== "batter") {
      writeJson(res, 403, { ok: false, error: "not your turn" });
      return;
    }
    room.state = engine.nextPitch(room.state);
    startRound(room);
    broadcast(room, "next pitch");
    writeJson(res, 200, { ok: true });
    return;
  }

  if (url.pathname === "/reset") {
    if (role !== "pitcher" && role !== "batter") {
      writeJson(res, 403, { ok: false, error: "not your turn" });
      return;
    }
    room.state = engine.freshState();
    startRound(room);
    broadcast(room, "reset");
    writeJson(res, 200, { ok: true });
    return;
  }

  if (url.pathname === "/mode") {
    const mode = validMode(body.mode);
    if (!mode) {
      writeJson(res, 400, { ok: false, error: "invalid mode" });
      return;
    }
    room.mode = mode;
    broadcast(room, "mode changed");
    writeJson(res, 200, { ok: true, mode });
    return;
  }

  writeJson(res, 404, { error: "not found" });
}

async function handleMetrics(req, res) {
  const body = await readBody(req);
  const result = saveMetric(body);
  writeJson(res, result.ok ? 200 : 400, result);
}

function handleProfile(req, res, url, headOnly = false) {
  const deviceId = sanitizeDevice(url.searchParams.get("device"));
  if (!deviceId) {
    writeJson(res, 400, { ok: false, error: "missing device" }, headOnly);
    return;
  }
  writeJson(res, 200, { ok: true, profile: getRecordProfile(deviceId) }, headOnly);
}

function handleDaily(req, res, url, headOnly = false) {
  const date = sanitizeDailyKey(url.searchParams.get("date") || todayKey());
  writeJson(res, 200, { ok: true, date, board: dailyBoard(date) }, headOnly);
}

function handleShareCard(req, res, url) {
  const card = shareCard(url);
  res.writeHead(200, {
    "Content-Type": "image/svg+xml; charset=utf-8",
    "Cache-Control": "public, max-age=300",
  });
  res.end(req.method === "HEAD" ? "" : card);
}

function validMode(value) {
  if (value === "ranked") return "ranked";
  if (value === "casual") return "casual";
  return "";
}

function readBody(req) {
  return new Promise((resolve) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 10000) req.destroy();
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(raw || "{}"));
      } catch {
        resolve({});
      }
    });
  });
}

function serveStatic(req, res, url) {
  const requested = url.pathname === "/" ? "/index.html" : url.pathname;
  const filePath = path.normalize(path.join(rootDir, requested));
  if (!filePath.startsWith(rootDir)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }
  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    if (filePath.endsWith("index.html") && hasShareMeta(url)) {
      res.writeHead(200, {
        "Content-Type": contentType(filePath),
        "Cache-Control": "no-store",
      });
      res.end(req.method === "HEAD" ? "" : applyShareMeta(data.toString("utf8"), req, url));
      return;
    }
    res.writeHead(200, {
      "Content-Type": contentType(filePath),
      "Cache-Control": "no-store",
    });
    res.end(req.method === "HEAD" ? "" : data);
  });
}

function cleanupRooms() {
  const now = Date.now();
  for (const [id, room] of rooms) {
    pruneDisconnectedRoles(room);
    if (clientCount(room) > 0) continue;
    if (now - room.updatedAt < ROOM_TTL_MS) continue;
    clearTimeout(room.roundTimer);
    clearTimeout(room.advanceTimer);
    rooms.delete(id);
    console.log(`cleaned empty room ${id}`);
  }
}

function roomSummaries() {
  return [...rooms.values()].map((room) => ({
    id: room.id,
    clients: clientCount(room),
    roleSlots: {
      pitcher: Boolean(room.roles.pitcher),
      batter: Boolean(room.roles.batter),
      active: activeRoleCount(room),
    },
    phase: room.state.phase,
    gameOver: room.state.gameOver,
    mode: room.mode,
    ageMs: Date.now() - room.createdAt,
    idleMs: Date.now() - room.updatedAt,
  }));
}

function loadRecords() {
  try {
    const saved = JSON.parse(fs.readFileSync(recordsFile, "utf8"));
    if (!saved.clients) saved.clients = {};
    if (!saved.daily) saved.daily = {};
    return saved;
  } catch {
    return { clients: {}, daily: {} };
  }
}

function saveRecords() {
  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(recordsFile, JSON.stringify(records, null, 2));
}

function saveMetric(body) {
  const event = sanitizeToken(body.event, 40);
  if (!event) return { ok: false, error: "missing event" };

  const row = {
    at: Date.now(),
    event,
    device: hashDevice(sanitizeDevice(body.deviceId)),
    ref: sanitizeToken(body.ref, 60),
    path: sanitizePath(body.path),
    room: body.room ? "1" : "",
    mode: validMode(body.mode) || sanitizeToken(body.mode, 20),
    opponent: sanitizeToken(body.opponent, 20),
    winner: sanitizeToken(body.winner, 20),
    score: sanitizeToken(body.score, 20),
    pitches: clampNumber(body.pitches, 0, 99, 0),
    readRate: clampNumber(body.readRate, 0, 100, 0),
    result: sanitizeToken(body.result, 30),
  };

  try {
    fs.mkdirSync(dataDir, { recursive: true });
    fs.appendFileSync(metricsFile, `${JSON.stringify(row)}\n`);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: "metric write failed" };
  }
}

function trafficSummary() {
  const rows = readMetricRows();
  const now = Date.now();
  return {
    ok: true,
    totalEvents: rows.length,
    last24h: summarizeMetricRows(rows.filter((row) => now - row.at <= 24 * 60 * 60 * 1000)),
    last7d: summarizeMetricRows(rows.filter((row) => now - row.at <= 7 * 24 * 60 * 60 * 1000)),
  };
}

function readMetricRows() {
  try {
    const lines = fs.readFileSync(metricsFile, "utf8").trim().split("\n").filter(Boolean);
    return lines.slice(-5000).map((line) => JSON.parse(line)).filter((row) => Number.isFinite(row.at));
  } catch {
    return [];
  }
}

function summarizeMetricRows(rows) {
  const byEvent = {};
  const byRef = {};
  const devices = new Set();
  for (const row of rows) {
    byEvent[row.event] = (byEvent[row.event] || 0) + 1;
    byRef[row.ref || "direct"] = (byRef[row.ref || "direct"] || 0) + 1;
    if (row.device) devices.add(row.device);
  }
  return {
    events: rows.length,
    uniqueDevices: devices.size,
    byEvent,
    byRef,
  };
}

function sanitizeToken(value, maxLength) {
  return String(value || "").replace(/[^a-zA-Z0-9가-힣_.:-]/g, "").slice(0, maxLength);
}

function sanitizePath(value) {
  const pathValue = String(value || "/").replace(/[^a-zA-Z0-9/_-]/g, "").slice(0, 120);
  return pathValue || "/";
}

function hashDevice(deviceId) {
  if (!deviceId) return "";
  return crypto.createHash("sha256").update(deviceId).digest("hex").slice(0, 24);
}

function sanitizeDevice(value) {
  return String(value || "").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 80);
}

function defaultRecord() {
  return {
    rating: 1000,
    wins: 0,
    losses: 0,
    streak: 0,
    lastDelta: 0,
    matches: [],
    resultKeys: [],
    updatedAt: 0,
  };
}

function getRecordProfile(deviceId) {
  const existing = records.clients[deviceId] || defaultRecord();
  return {
    rating: existing.rating,
    wins: existing.wins,
    losses: existing.losses,
    streak: existing.streak,
    lastDelta: existing.lastDelta,
    matches: existing.matches.slice(0, 12),
    updatedAt: existing.updatedAt,
  };
}

function todayKey() {
  return new Date().toISOString().slice(0, 10).replace(/-/g, "");
}

function sanitizeDailyKey(value) {
  const safe = String(value || "").replace(/[^0-9]/g, "").slice(0, 8);
  return safe.length === 8 ? safe : todayKey();
}

function dailyBoard(date) {
  if (!records.daily) records.daily = {};
  const board = records.daily[date] || { entries: [] };
  return {
    entries: board.entries.slice(0, 20),
    updatedAt: board.updatedAt || 0,
  };
}

function saveDailyResult(body) {
  if (!records.daily) records.daily = {};
  const date = sanitizeDailyKey(body.daily || body.date);
  const deviceId = sanitizeDevice(body.deviceId);
  const resultKey = String(body.resultKey || "").slice(0, 160);
  if (!deviceId || !resultKey) return { ok: false, error: "invalid daily result" };

  const board = records.daily[date] || { entries: [], resultKeys: [], updatedAt: 0 };
  if (!Array.isArray(board.entries)) board.entries = [];
  if (!Array.isArray(board.resultKeys)) board.resultKeys = [];
  if (board.resultKeys.includes(resultKey)) return { ok: true, duplicate: true, date, board: dailyBoard(date) };

  const won = Boolean(body.won);
  const pitches = clampNumber(body.pitches, 0, 99, 0);
  const readRate = clampNumber(body.readRate, 0, 100, 0);
  const score = dailyScore({ won, pitches, readRate, winner: body.winner });
  const entry = {
    id: hashDevice(deviceId),
    name: dailyName(deviceId),
    at: Date.now(),
    won,
    score,
    gameScore: String(body.score || "").slice(0, 20),
    pitches,
    readRate,
    outcome: sanitizeToken(body.outcome || body.result, 30),
  };

  board.resultKeys.unshift(resultKey);
  board.resultKeys = board.resultKeys.slice(0, 300);
  const existingIndex = board.entries.findIndex((item) => item.id === entry.id);
  if (existingIndex >= 0) {
    if (entry.score >= board.entries[existingIndex].score) board.entries[existingIndex] = entry;
  } else {
    board.entries.push(entry);
  }
  board.entries.sort((a, b) => b.score - a.score || a.pitches - b.pitches || b.readRate - a.readRate || a.at - b.at);
  board.entries = board.entries.slice(0, 100);
  board.updatedAt = Date.now();
  records.daily[date] = board;
  saveRecords();
  return { ok: true, date, board: dailyBoard(date), entry };
}

function dailyScore({ won, pitches, readRate }) {
  const finish = won ? 10000 : 2500;
  const pace = Math.max(0, 40 - pitches) * 90;
  const read = readRate * 18;
  return Math.max(0, Math.round(finish + pace + read));
}

function dailyName(deviceId) {
  const digest = hashDevice(deviceId).slice(0, 4).toUpperCase();
  return `D-${digest}`;
}

function saveRecord(body) {
  const deviceId = sanitizeDevice(body.deviceId);
  const resultKey = String(body.resultKey || "").slice(0, 160);
  if (!deviceId || !resultKey) return { ok: false, error: "invalid record" };

  const record = records.clients[deviceId] || {
    ...defaultRecord(),
    rating: clampNumber(body.ratingBefore ?? body.rating, 600, 2400, 1000),
    wins: clampNumber(body.wins, 0, 100000, 0),
    losses: clampNumber(body.losses, 0, 100000, 0),
    streak: clampNumber(body.streak, -100000, 100000, 0),
  };

  if (record.resultKeys.includes(resultKey)) {
    records.clients[deviceId] = record;
    return { ok: true, duplicate: true, profile: getRecordProfile(deviceId) };
  }

  const won = Boolean(body.won);
  const delta = clampNumber(body.delta, -60, 60, won ? 20 : -18);
  record.rating = Math.max(600, record.rating + delta);
  record.wins += won ? 1 : 0;
  record.losses += won ? 0 : 1;
  record.streak = won ? Math.max(1, record.streak + 1) : Math.min(-1, record.streak - 1);
  record.lastDelta = delta;
  record.updatedAt = Date.now();
  record.resultKeys.unshift(resultKey);
  record.resultKeys = record.resultKeys.slice(0, 80);
  record.matches.unshift({
    at: record.updatedAt,
    won,
    delta,
    rating: record.rating,
    mode: String(body.mode || "ranked").slice(0, 20),
    opponent: String(body.opponent || "ai").slice(0, 20),
    role: String(body.role || "batter").slice(0, 20),
    score: String(body.score || "").slice(0, 20),
    pitches: clampNumber(body.pitches, 0, 99, 0),
  });
  record.matches = record.matches.slice(0, 20);
  records.clients[deviceId] = record;
  saveRecords();
  return { ok: true, profile: getRecordProfile(deviceId) };
}

function clampNumber(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(min, Math.min(max, Math.round(number)));
}

function contentType(filePath) {
  if (filePath.endsWith(".html")) return "text/html; charset=utf-8";
  if (filePath.endsWith(".js")) return "text/javascript; charset=utf-8";
  if (filePath.endsWith(".webmanifest")) return "application/manifest+json; charset=utf-8";
  if (filePath.endsWith(".xml")) return "application/xml; charset=utf-8";
  if (filePath.endsWith(".txt")) return "text/plain; charset=utf-8";
  if (filePath.endsWith(".svg")) return "image/svg+xml";
  if (filePath.endsWith(".png")) return "image/png";
  if (filePath.endsWith(".mp4")) return "video/mp4";
  if (filePath.endsWith(".webm")) return "video/webm";
  return "application/octet-stream";
}

function hasShareMeta(url) {
  return url.searchParams.has("share") || url.searchParams.has("score") || url.searchParams.has("pitches");
}

function publicBaseUrl(req) {
  const host = req.headers["x-forwarded-host"] || req.headers.host || "daesseuyo.splui.com";
  const proto = req.headers["x-forwarded-proto"] || (String(host).includes("127.0.0.1") ? "http" : "https");
  return `${proto}://${host}`;
}

function applyShareMeta(html, req, url) {
  const meta = resultMeta(url, publicBaseUrl(req));
  return html
    .replace(/<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${escapeHtml(meta.title)}" />`)
    .replace(/<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${escapeHtml(meta.description)}" />`)
    .replace(/<meta property="og:image" content="[^"]*" \/>/, `<meta property="og:image" content="${escapeHtml(meta.image)}" />`)
    .replace(/<meta name="twitter:title" content="[^"]*" \/>/, `<meta name="twitter:title" content="${escapeHtml(meta.title)}" />`)
    .replace(/<meta name="twitter:description" content="[^"]*" \/>/, `<meta name="twitter:description" content="${escapeHtml(meta.description)}" />`)
    .replace(/<meta name="twitter:image" content="[^"]*" \/>/, `<meta name="twitter:image" content="${escapeHtml(meta.image)}" />`);
}

function resultMeta(url, baseUrl) {
  const score = sanitizeToken(url.searchParams.get("score"), 20) || "9회말";
  const pitches = clampNumber(url.searchParams.get("pitches"), 0, 99, 0);
  const read = clampNumber(url.searchParams.get("read"), 0, 100, 0);
  const result = sanitizeToken(url.searchParams.get("result"), 20);
  const title = result === "win" ? "대쓰요 끝내기 성공" : result === "loss" ? "대쓰요 수비 승리" : "대쓰요 결과";
  const description = `${score}, ${pitches}구, 읽기 ${read}%. 9회말 2아웃 야구 심리전.`;
  const image = `${baseUrl}/share-card.svg?score=${encodeURIComponent(score)}&pitches=${pitches}&read=${read}&result=${encodeURIComponent(result)}`;
  return { title, description, image };
}

function shareCard(url) {
  const score = escapeHtml(sanitizeToken(url.searchParams.get("score"), 20) || "3-3");
  const pitches = clampNumber(url.searchParams.get("pitches"), 0, 99, 0);
  const read = clampNumber(url.searchParams.get("read"), 0, 100, 0);
  const result = sanitizeToken(url.searchParams.get("result"), 20);
  const main = result === "win" ? "끝내기 성공" : result === "loss" ? "수비 승리" : "9회말 승부";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#09090b"/>
  <rect x="56" y="56" width="1088" height="518" rx="32" fill="#18181b" stroke="#27272a" stroke-width="4"/>
  <text x="96" y="142" fill="#a1a1aa" font-family="Arial, sans-serif" font-size="34" font-weight="700">대쓰요: real BaseBall</text>
  <text x="96" y="262" fill="#fafafa" font-family="Arial, sans-serif" font-size="86" font-weight="800">${main}</text>
  <text x="96" y="354" fill="#e4e4e7" font-family="Arial, sans-serif" font-size="54" font-weight="700">${score} · ${pitches}구 · 읽기 ${read}%</text>
  <g transform="translate(850 170)">
    <rect x="0" y="0" width="210" height="270" rx="20" fill="#09090b" stroke="#e4e4e7" stroke-width="12"/>
    <path d="M70 0v270M140 0v270M0 90h210M0 180h210" stroke="#27272a" stroke-width="6"/>
    <circle cx="105" cy="135" r="28" fill="#e4e4e7"/>
    <path d="M30 326h280" stroke="#e4e4e7" stroke-width="18" stroke-linecap="round"/>
  </g>
  <text x="96" y="498" fill="#a1a1aa" font-family="Arial, sans-serif" font-size="32" font-weight="700">9회말 2아웃, 네 키로 끝내는 야구 심리전</text>
</svg>`;
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function writeCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,POST,OPTIONS");
}

function writeJson(res, status, payload, headOnly = false) {
  writeCors(res);
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(headOnly ? "" : JSON.stringify(payload));
}

const server = http.createServer((req, res) => {
  writeCors(res);
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host || "127.0.0.1"}`);
  const isRead = req.method === "GET" || req.method === "HEAD";
  if (isRead && url.pathname === "/health") {
    writeJson(res, 200, {
      ok: true,
      rooms: rooms.size,
      activeClients: roomSummaries().reduce((sum, room) => sum + room.clients, 0),
      roomTtlMs: ROOM_TTL_MS,
      revealMs: REVEAL_MS,
    }, req.method === "HEAD");
    return;
  }
  if (isRead && url.pathname === "/rooms") {
    writeJson(res, 200, { rooms: roomSummaries() }, req.method === "HEAD");
    return;
  }
  if (isRead && url.pathname === "/profile") {
    handleProfile(req, res, url, req.method === "HEAD");
    return;
  }
  if (isRead && url.pathname === "/daily") {
    handleDaily(req, res, url, req.method === "HEAD");
    return;
  }
  if (isRead && url.pathname === "/traffic") {
    writeJson(res, 200, trafficSummary(), req.method === "HEAD");
    return;
  }
  if (isRead && url.pathname === "/share-card.svg") {
    handleShareCard(req, res, url);
    return;
  }
  if (req.method === "GET" && url.pathname === "/events") {
    handleEvents(req, res, url);
    return;
  }
  if (req.method === "POST" && url.pathname === "/metrics") {
    handleMetrics(req, res);
    return;
  }
  if (req.method === "POST" && ["/choose", "/next", "/reset", "/mode", "/record", "/daily"].includes(url.pathname)) {
    handleAction(req, res, url);
    return;
  }
  if (isRead) {
    serveStatic(req, res, url);
    return;
  }
  writeJson(res, 405, { error: "method not allowed" });
});

server.listen(port, bindHost, () => {
  console.log(`Daesseuyo multiplayer server: http://${bindHost}:${port}/?duel=TG7ZS8`);
});

const cleanupTimer = setInterval(cleanupRooms, CLEANUP_MS);
if (cleanupTimer.unref) cleanupTimer.unref();
