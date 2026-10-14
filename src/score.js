const KEY = 'ss-highscores';

function loadTable() {
  try {
    const raw = localStorage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch (e) {
    return [];
  }
}

function saveTable(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, 5)));
  } catch (e) { /* private mode */ }
}

export function createScore(hud, audio) {
  const state = {
    distance: 0,
    kills: 0,
    headshots: 0,
    shotsFired: 0,
    shotsHit: 0,
    accuracy: 0,
    score: 0,
    ended: false,
    killPts: 0, bonus: 0, streak: 0, mult: 1, lastKillT: 0,
  };

  function accuracyPct() {
    if (!state.shotsFired) return 0;
    return (state.shotsHit / state.shotsFired) * 100;
  }

  function live() {
    return Math.floor(state.distance) + Math.floor(state.killPts) + state.bonus; // kill points carry the streak multiplier
  }

  function publish() {
    if (!state.ended) state.score = live();
    state.accuracy = accuracyPct();
    if (window.SS) window.SS.score = state.score;
    if (hud && hud.setScore) hud.setScore(state.score);
  }

  function reset() {
    state.distance = 0;
    state.kills = 0;
    state.headshots = 0;
    state.shotsFired = 0;
    state.shotsHit = 0;
    state.accuracy = 0;
    state.score = 0;
    state.ended = false;
    state.killPts = 0; state.bonus = 0; state.streak = 0; state.mult = 1; state.lastKillT = 0; showMult();
    publish();
  }

  function setDistance(d) {
    state.distance = d || 0;
    if (!state.ended) publish();
  }

  function registerShot() {
    state.shotsFired += 1;
  }

  function registerHit() {
    state.shotsHit += 1;
  }

  // Kill streak: x1 -> x1.5 at 2 kills, x2 at 4, x2.5 at 6, x3 at 8. Taking damage or 10 s without a kill resets it.
  function showMult() { if (hud && hud.setMult) hud.setMult(state.mult, state.streak); if (window.SS) window.SS.mult = state.mult; }
  function breakStreak() { if (state.streak) { state.streak = 0; state.mult = 1; showMult(); } }
  function addBonus(n) { state.bonus += n | 0; publish(); }
  function addKill(headshot) {
    const now = performance.now(); if (now - state.lastKillT > 10000) state.streak = 0; state.lastKillT = now;
    state.streak += 1; state.mult = 1 + Math.min(4, Math.floor(state.streak / 2)) * 0.5; showMult();
    state.killPts += (100 + (headshot ? 50 : 0)) * state.mult;
    state.kills += 1;
    if (headshot) {
      state.headshots += 1;
      if (hud && hud.headshotFlash) hud.headshotFlash();
      if (audio && audio.headshot) audio.headshot();
    }
    publish();
  }

  function finish() {
    if (state.ended) {
      return { entry: null, table: loadTable(), isNewBest: false, best: best() };
    }
    state.ended = true;
    const acc = accuracyPct();
    state.accuracy = acc;
    state.score = live(); // one score source: the end screen shows exactly what the HUD showed
    if (window.SS) window.SS.score = state.score;
    if (hud && hud.setScore) hud.setScore(state.score);
    const prevBest = best();
    const entry = {
      score: state.score,
      distance: Math.floor(state.distance),
      kills: state.kills,
      headshots: state.headshots,
      accuracy: Math.round(acc * 10) / 10,
      date: new Date().toISOString(),
    };
    const list = loadTable();
    list.push(entry);
    list.sort((a, b) => b.score - a.score);
    const table = list.slice(0, 5);
    saveTable(table);
    const isNewBest = entry.score > prevBest || (list.length === 1);
    return { entry, table, isNewBest, best: table.length ? table[0].score : entry.score };
  }

  function best() {
    const list = loadTable();
    return list.length ? list[0].score | 0 : 0;
  }

  reset();

  return {
    state,
    reset,
    setDistance,
    registerShot,
    registerHit,
    addKill, addBonus, breakStreak,
    finish,
    best,
    table: loadTable,
  };
}
