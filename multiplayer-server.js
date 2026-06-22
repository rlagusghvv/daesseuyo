#!/usr/bin/env node

const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");
const engine = require("./shared-engine.js");

const rootDir = __dirname;
const port = Number(process.env.PORT || 4174);
const bindHost = process.env.BIND_HOST || process.env.HOST || "127.0.0.1";
const dataDir = path.join(rootDir, ".data");
const recordsFile = path.join(dataDir, "rank-records.json");
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

function handleProfile(req, res, url) {
  const deviceId = sanitizeDevice(url.searchParams.get("device"));
  if (!deviceId) {
    writeJson(res, 400, { ok: false, error: "missing device" });
    return;
  }
  writeJson(res, 200, { ok: true, profile: getRecordProfile(deviceId) });
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
    res.writeHead(200, {
      "Content-Type": contentType(filePath),
      "Cache-Control": "no-store",
    });
    res.end(data);
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
    return JSON.parse(fs.readFileSync(recordsFile, "utf8"));
  } catch {
    return { clients: {} };
  }
}

function saveRecords() {
  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(recordsFile, JSON.stringify(records, null, 2));
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
  if (filePath.endsWith(".png")) return "image/png";
  if (filePath.endsWith(".mp4")) return "video/mp4";
  if (filePath.endsWith(".webm")) return "video/webm";
  return "application/octet-stream";
}

function writeCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
}

function writeJson(res, status, payload) {
  writeCors(res);
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

const server = http.createServer((req, res) => {
  writeCors(res);
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host || "127.0.0.1"}`);
  if (req.method === "GET" && url.pathname === "/health") {
    writeJson(res, 200, {
      ok: true,
      rooms: rooms.size,
      activeClients: roomSummaries().reduce((sum, room) => sum + room.clients, 0),
      roomTtlMs: ROOM_TTL_MS,
      revealMs: REVEAL_MS,
    });
    return;
  }
  if (req.method === "GET" && url.pathname === "/rooms") {
    writeJson(res, 200, { rooms: roomSummaries() });
    return;
  }
  if (req.method === "GET" && url.pathname === "/profile") {
    handleProfile(req, res, url);
    return;
  }
  if (req.method === "GET" && url.pathname === "/events") {
    handleEvents(req, res, url);
    return;
  }
  if (req.method === "POST" && ["/choose", "/next", "/reset", "/mode", "/record"].includes(url.pathname)) {
    handleAction(req, res, url);
    return;
  }
  if (req.method === "GET") {
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
