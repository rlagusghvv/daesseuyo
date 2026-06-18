(function exposeEngine(root, factory) {
  const engine = factory();
  if (typeof module === "object" && module.exports) module.exports = engine;
  root.DaesseuyoEngine = engine;
})(typeof globalThis !== "undefined" ? globalThis : this, function createEngine() {
  const keys = {
    zone: {
      hotkey: "Q",
      label: "스트라이크",
      pitchText: "존 안",
      batText: "존 안",
      target: { left: 52, top: 50 },
    },
    chase: {
      hotkey: "W",
      label: "볼",
      pitchText: "존 밖",
      batText: "골라내기",
      target: { left: 66, top: 87 },
    },
    inside: {
      hotkey: "E",
      label: "몸쪽",
      pitchText: "몸쪽",
      batText: "몸쪽",
      target: { left: 22, top: 48 },
    },
    offspeed: {
      hotkey: "R",
      label: "변화구",
      pitchText: "느린 공",
      batText: "느린 공",
      target: { left: 74, top: 70 },
    },
  };

  const partialPairs = new Set([
    "zone:inside",
    "inside:zone",
    "chase:offspeed",
    "offspeed:chase",
  ]);

  const executionTables = {
    zone: [
      { kind: "quality", label: "낮은 스트라이크", weight: 70 },
      { kind: "ball", label: "살짝 빠짐", weight: 12 },
      { kind: "mistake", label: "가운데 실투", weight: 18 },
    ],
    chase: [
      { kind: "quality", label: "낮게 떨어짐", weight: 58 },
      { kind: "ball", label: "완전히 빠짐", weight: 28 },
      { kind: "mistake", label: "높은 실투", weight: 14 },
    ],
    inside: [
      { kind: "quality", label: "꽉 찬 몸쪽", weight: 68 },
      { kind: "ball", label: "몸쪽 빠짐", weight: 12 },
      { kind: "mistake", label: "가운데 실투", weight: 20 },
    ],
    offspeed: [
      { kind: "quality", label: "낮게 떨어짐", weight: 64 },
      { kind: "ball", label: "낮게 빠짐", weight: 16 },
      { kind: "mistake", label: "높은 실투", weight: 20 },
    ],
  };

  const outcomeLabels = {
    ball: "볼",
    strike: "헛스윙",
    calledStrike: "스트라이크",
    foul: "파울",
    contact: "빗맞음",
    out: "범타",
    single: "안타",
    double: "장타",
    homer: "홈런",
  };

  function freshState() {
    return {
      phase: "pitch",
      inningNumber: 9,
      inning: "9회말",
      isTiebreaker: false,
      awayScore: 3,
      homeScore: 3,
      outs: 2,
      balls: 0,
      strikes: 0,
      runners: [false, true, false],
      pitchChoice: "",
      batterChoice: "",
      result: null,
      gameOver: false,
      winner: "",
      stats: {
        pitch: emptyCounts(),
        read: emptyCounts(),
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
        total: 0,
      },
      history: [],
    };
  }

  function emptyCounts() {
    return Object.fromEntries(Object.keys(keys).map((key) => [key, 0]));
  }

  function submitChoice(state, key, random = Math.random) {
    if (!keys[key] || state.gameOver || state.phase === "reveal") return false;
    if (state.phase === "pitch") {
      state.pitchChoice = key;
      state.phase = "bat";
      return true;
    }
    if (state.phase === "bat") {
      state.batterChoice = key;
      revealPitch(state, random);
      return true;
    }
    return false;
  }

  function submitRoleChoice(state, role, key, random = Math.random) {
    if (!keys[key] || state.gameOver || state.phase === "reveal") return false;
    if (role !== "pitcher" && role !== "batter") return false;
    if (role === "pitcher") {
      if (state.pitchChoice) return false;
      state.pitchChoice = key;
    }
    if (role === "batter") {
      if (state.batterChoice) return false;
      state.batterChoice = key;
    }
    if (state.pitchChoice && state.batterChoice) {
      revealPitch(state, random);
      return true;
    }
    state.phase = "pitch";
    return true;
  }

  function revealPitch(state, random) {
    ensureStats(state);
    const before = {
      inning: state.inning,
      balls: state.balls,
      strikes: state.strikes,
      outs: state.outs,
      runners: [...state.runners],
      awayScore: state.awayScore,
      homeScore: state.homeScore,
    };
    const relation = readRelation(state.pitchChoice, state.batterChoice);
    const execution = weightedPick(executionTables[state.pitchChoice], random);
    const outcome = adjustOutcomeForCount(state, decideOutcome(relation, execution, state.batterChoice, state.pitchChoice, random));
    const applied = applyOutcome(state, outcome.kind);

    state.phase = "reveal";
    state.result = {
      kind: outcome.kind,
      label: outcomeLabels[outcome.kind],
      relation,
      execution,
      text: applied.text,
      scored: applied.scored,
    };

    state.stats.pitch[state.pitchChoice] += 1;
    state.stats.read[state.batterChoice] += 1;
    state.stats.total += 1;
    if (relation.kind === "read") state.stats.reads += 1;
    if (relation.kind === "partial") state.stats.partials += 1;
    if (relation.kind === "miss") state.stats.misses += 1;
    if (execution.kind === "mistake") state.stats.mistakes += 1;
    if (outcome.kind === "ball") state.stats.balls += 1;
    if (outcome.kind === "strike" || outcome.kind === "calledStrike") state.stats.strikes += 1;
    if (outcome.kind === "foul") state.stats.fouls += 1;
    if (outcome.kind === "contact") state.stats.contacts += 1;
    if (outcome.kind === "out") state.stats.outs += 1;
    if (["single", "double", "homer"].includes(outcome.kind)) state.stats.hits += 1;
    if (["double", "homer"].includes(outcome.kind)) state.stats.extraBases += 1;
    if (outcome.kind === "homer") state.stats.homers += 1;

    state.history.unshift({
      no: state.stats.total,
      inning: before.inning,
      score: `${before.awayScore}-${before.homeScore}`,
      count: `${before.balls}-${before.strikes}`,
      outs: before.outs,
      runners: runnerText(before.runners),
      pitch: keys[state.pitchChoice].label,
      read: keys[state.batterChoice].batText || keys[state.batterChoice].label,
      relation: relation.label,
      execution: execution.label,
      kind: outcome.kind,
      label: outcomeLabels[outcome.kind],
      text: applied.text,
      scored: applied.scored,
    });
    state.history = state.history.slice(0, 10);
  }

  function runnerText(runners) {
    const labels = [];
    if (runners[0]) labels.push("1루");
    if (runners[1]) labels.push("2루");
    if (runners[2]) labels.push("3루");
    return labels.length ? labels.join(" ") : "주자 없음";
  }

  function ensureStats(state) {
    if (!state.stats) state.stats = {};
    if (!state.stats.pitch) state.stats.pitch = emptyCounts();
    if (!state.stats.read) state.stats.read = emptyCounts();

    for (const key of Object.keys(keys)) {
      if (!Number.isFinite(state.stats.pitch[key])) state.stats.pitch[key] = 0;
      if (!Number.isFinite(state.stats.read[key])) state.stats.read[key] = 0;
    }

    for (const key of [
      "reads",
      "partials",
      "misses",
      "mistakes",
      "balls",
      "strikes",
      "fouls",
      "contacts",
      "outs",
      "hits",
      "extraBases",
      "homers",
      "total",
    ]) {
      if (!Number.isFinite(state.stats[key])) state.stats[key] = 0;
    }

    if (!Array.isArray(state.history)) state.history = [];
  }

  function readRelation(pitchKey, readKey) {
    if (pitchKey === readKey) {
      return { kind: "read", label: "맞힘", text: "타자가 투수의 선택을 정확히 맞혔습니다." };
    }
    if (partialPairs.has(`${pitchKey}:${readKey}`)) {
      return { kind: "partial", label: "비슷함", text: "완전히 맞히지는 못했지만 따라갈 수 있는 공입니다." };
    }
    return { kind: "miss", label: "빗나감", text: "투수가 타자의 선택을 피했습니다." };
  }

  function decideOutcome(relation, execution, batterChoice, pitchChoice, random) {
    if (batterChoice === "chase") return decideTakeOutcome(pitchChoice, execution, random);

    if (execution.kind === "ball") {
      const disciplined = relation.kind === "read" || batterChoice === "chase";
      return weightedPick(disciplined
        ? [
            { kind: "ball", weight: 76 },
            { kind: "foul", weight: 14 },
            { kind: "strike", weight: 10 },
          ]
        : [
            { kind: "ball", weight: 34 },
            { kind: "strike", weight: 38 },
            { kind: "foul", weight: 18 },
            { kind: "out", weight: 10 },
          ], random);
    }

    if (relation.kind === "read" && execution.kind === "mistake") {
      return weightedPick([
        { kind: "homer", weight: 10 },
        { kind: "double", weight: 16 },
        { kind: "single", weight: 26 },
        { kind: "out", weight: 25 },
        { kind: "foul", weight: 12 },
        { kind: "strike", weight: 11 },
      ], random);
    }

    if (relation.kind === "read") {
      return weightedPick([
        { kind: "homer", weight: 3 },
        { kind: "double", weight: 8 },
        { kind: "single", weight: 22 },
        { kind: "out", weight: 32 },
        { kind: "foul", weight: 22 },
        { kind: "strike", weight: 13 },
      ], random);
    }

    if (relation.kind === "partial" && execution.kind === "mistake") {
      return weightedPick([
        { kind: "double", weight: 6 },
        { kind: "single", weight: 18 },
        { kind: "foul", weight: 34 },
        { kind: "out", weight: 28 },
        { kind: "strike", weight: 14 },
      ], random);
    }

    if (relation.kind === "partial") {
      return weightedPick([
        { kind: "single", weight: 5 },
        { kind: "foul", weight: 38 },
        { kind: "out", weight: 30 },
        { kind: "strike", weight: 27 },
      ], random);
    }

    if (execution.kind === "mistake") {
      return weightedPick([
        { kind: "double", weight: 4 },
        { kind: "single", weight: 12 },
        { kind: "foul", weight: 24 },
        { kind: "out", weight: 28 },
        { kind: "strike", weight: 32 },
      ], random);
    }

    return weightedPick([
      { kind: "single", weight: 3 },
      { kind: "foul", weight: 17 },
      { kind: "out", weight: 26 },
      { kind: "strike", weight: 54 },
    ], random);
  }

  function decideTakeOutcome(pitchChoice, execution, random) {
    if (execution.kind === "ball") {
      return weightedPick([
        { kind: "ball", weight: 90 },
        { kind: "calledStrike", weight: 10 },
      ], random);
    }

    if (pitchChoice === "chase") {
      return weightedPick(execution.kind === "mistake"
        ? [
            { kind: "calledStrike", weight: 58 },
            { kind: "ball", weight: 42 },
          ]
        : [
            { kind: "ball", weight: 86 },
            { kind: "calledStrike", weight: 14 },
          ], random);
    }

    if (pitchChoice === "offspeed" && execution.kind === "quality") {
      return weightedPick([
        { kind: "calledStrike", weight: 70 },
        { kind: "ball", weight: 30 },
      ], random);
    }

    return weightedPick([
      { kind: "calledStrike", weight: 88 },
      { kind: "ball", weight: 12 },
    ], random);
  }

  function adjustOutcomeForCount(state, outcome) {
    if (outcome.kind !== "out" || state.strikes >= 1) return outcome;
    return { kind: "contact", weight: outcome.weight };
  }

  function applyOutcome(state, kind) {
    if (kind === "ball") {
      state.balls += 1;
      if (state.balls >= 4) {
        const scored = walk(state);
        return { scored, text: scored ? "볼넷. 밀어내기 득점입니다." : "볼넷으로 출루합니다." };
      }
      return { scored: 0, text: "볼입니다. 카운트가 타자 쪽으로 기웁니다." };
    }

    if (kind === "strike") {
      state.strikes += 1;
      if (state.strikes >= 3) return recordOut(state, "삼진입니다. 투수가 카운트를 끝냈습니다.");
      return { scored: 0, text: "헛스윙. 스트라이크가 올라갑니다." };
    }

    if (kind === "calledStrike") {
      state.strikes += 1;
      if (state.strikes >= 3) return recordOut(state, "루킹 삼진입니다. 골라낸 공이 존에 들어왔습니다.");
      return { scored: 0, text: "지켜본 공이 스트라이크입니다." };
    }

    if (kind === "foul") {
      if (state.strikes < 2) state.strikes += 1;
      return { scored: 0, text: "파울. 타자가 버텼지만 카운트 압박은 남습니다." };
    }

    if (kind === "contact") {
      if (state.strikes < 2) state.strikes += 1;
      return { scored: 0, text: "빗맞은 타구. 아웃은 아니지만 카운트가 몰립니다." };
    }

    if (kind === "out") return recordOut(state, "범타. 좋은 타이밍을 만들지 못했습니다.");
    if (kind === "single") return hitSingle(state);
    if (kind === "double") return hitDouble(state);
    return hitHomer(state);
  }

  function recordOut(state, text) {
    state.outs += 1;
    resetCount(state);
    if (state.outs >= 3) {
      if (state.homeScore === state.awayScore) {
        if (state.isTiebreaker) {
          state.gameOver = true;
          state.winner = "pitcher";
          return {
            scored: 0,
            text: `${text} 승부치기를 막아내 수비가 이겼습니다.`,
          };
        }
        const nextInning = advanceTiebreaker(state);
        return {
          scored: 0,
          text: `${text} ${nextInning}로 이어집니다.`,
        };
      }
      state.gameOver = true;
      state.winner = "pitcher";
    }
    return { scored: 0, text };
  }

  function hitSingle(state) {
    let scored = 0;
    if (state.runners[2]) scored += 1;
    if (state.runners[1]) scored += 1;
    state.runners = [true, state.runners[0], false];
    state.homeScore += scored;
    resetCount(state);
    finishIfWalkoff(state);
    return {
      scored,
      text: scored ? `안타. ${scored}점이 들어옵니다.` : "안타. 출루에 성공합니다.",
    };
  }

  function hitDouble(state) {
    let scored = 0;
    if (state.runners[2]) scored += 1;
    if (state.runners[1]) scored += 1;
    state.runners = [false, true, state.runners[0]];
    state.homeScore += scored;
    resetCount(state);
    finishIfWalkoff(state);
    return {
      scored,
      text: scored ? `장타. ${scored}점이 들어옵니다.` : "장타. 득점권 찬스를 만듭니다.",
    };
  }

  function hitHomer(state) {
    const scored = state.runners.filter(Boolean).length + 1;
    state.runners = [false, false, false];
    state.homeScore += scored;
    resetCount(state);
    finishIfWalkoff(state);
    return { scored, text: `홈런. ${scored}점이 들어옵니다.` };
  }

  function walk(state) {
    let scored = 0;
    const [first, second, third] = state.runners;
    if (first && second && third) scored = 1;
    state.runners = [true, second || first, third || (first && second)];
    state.homeScore += scored;
    resetCount(state);
    finishIfWalkoff(state);
    return scored;
  }

  function finishIfWalkoff(state) {
    if (state.homeScore > state.awayScore) {
      state.gameOver = true;
      state.winner = "batter";
    }
  }

  function advanceTiebreaker(state) {
    const current = Number.isFinite(state.inningNumber) ? state.inningNumber : parseInt(state.inning, 10) || 9;
    state.inningNumber = current + 1;
    state.inning = `${state.inningNumber}회말 승부치기`;
    state.isTiebreaker = true;
    state.outs = 2;
    state.balls = 0;
    state.strikes = 0;
    state.runners = [false, true, false];
    return state.inning;
  }

  function resetCount(state) {
    state.balls = 0;
    state.strikes = 0;
  }

  function nextPitch(state) {
    if (state.gameOver) return freshState();
    if (state.phase !== "reveal") return state;
    state.phase = "pitch";
    state.pitchChoice = "";
    state.batterChoice = "";
    state.result = null;
    return state;
  }

  function weightedPick(rows, random) {
    const total = rows.reduce((sum, row) => sum + row.weight, 0);
    let cursor = random() * total;
    for (const row of rows) {
      cursor -= row.weight;
      if (cursor <= 0) return { ...row };
    }
    return { ...rows[rows.length - 1] };
  }

  return {
    keys,
    freshState,
    submitChoice,
    submitRoleChoice,
    nextPitch,
    readRelation,
  };
});
