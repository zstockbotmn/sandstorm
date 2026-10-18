// Leg blend for ?loco=2. Without that flag nothing here runs (art.js gates the clips).
// Call updateLoco before mixer.update: gait clips are posed by hand (timeScale 0).
// The stationary base (idle/aim/lean/crouchIdle) keeps normal looping playback.

const _search = (typeof location !== 'undefined' && location && location.search) || '';
export const LOCO2 = /[?&]loco=2\b/.test(_search);

// Names inside fighter.loco.anim.glb. Legs+hips only; art.js files them as SPLIT_ANIMS.
export const LOCO_KEYS = ['strafeL', 'strafeR', 'backWalk', 'runStrafeL', 'runStrafeR', 'backRun', 'crouchWalk', 'turnL', 'turnR'];

// Actions this layer owns. `strafe` is the old single clip; it is eased out so it cannot stack.
const MANAGED = ['idle', 'aim', 'lean', 'crouchIdle', 'walk', 'jog', 'run', 'strafe', 'crouch', 'crouchWalk',
  'strafeL', 'strafeR', 'backWalk', 'runStrafeL', 'runStrafeR', 'backRun', 'turnL', 'turnR'];
// Phased by the shared gait clock. Pure bases (idle/aim/lean/crouchIdle) are not in here.
const GAIT = { walk: 1, jog: 1, run: 1, strafe: 1, crouch: 1, crouchWalk: 1, strafeL: 1, strafeR: 1, backWalk: 1,
  runStrafeL: 1, runStrafeR: 1, backRun: 1, turnL: 1, turnR: 1 };
// Body-frame m/s used when a clip has no measured meta. Walk/jog/run match the old STRIDE table.
const CANON = {
  walk: [1.4, 0, 1.4], strafe: [1.4, 0, 1.4], jog: [3, 0, 3], run: [5.2, 0, 5.2],
  crouch: [1.1, 0, 1.1], crouchWalk: [1.1, 0, 1.1],
  strafeL: [0, -1.4, 1.4], strafeR: [0, 1.4, 1.4], backWalk: [-1.2, 0, 1.2],
  runStrafeL: [2.5, -4.4, 5], runStrafeR: [2.5, 4.4, 5], backRun: [-2.3, 0, 2.3],
};
const WALK_SIDES = [{ name: 'strafeL', fwd: 0, right: -1 }, { name: 'strafeR', fwd: 0, right: 1 }, { name: 'backWalk', fwd: -1, right: 0 }];
const RUN_SIDES = [{ name: 'runStrafeL', fwd: 0.5, right: -1 }, { name: 'runStrafeR', fwd: 0.5, right: 1 }, { name: 'backRun', fwd: -1, right: 0 }];

function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
function smoothstep(e0, e1, x) {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
}
function angDist(a, b) {
  let d = Math.abs(a - b) % (Math.PI * 2);
  if (d > Math.PI) d = Math.PI * 2 - d;
  return d;
}
function wrap01(x) {
  if (!Number.isFinite(x)) return 0;
  x %= 1;
  return x < 0 ? x + 1 : x;
}
function addW(out, name, w) { if (name && w > 0) out[name] = (out[name] || 0) + w; }

// Two sample directions nearest the velocity angle. Diagonals split those two; an exact hit is weight 1.
// points: [{ name, fwd, right }] in body frame (right = character's right). Usable from node.
export function blendWeights(points, fwd, right) {
  const out = {};
  const live = [];
  if (points) for (let i = 0; i < points.length; i++) {
    const p = points[i];
    if (!p || !p.name) continue;
    const f = +p.fwd || 0, r = +p.right || 0;
    if (!Number.isFinite(f) || !Number.isFinite(r) || Math.hypot(f, r) < 1e-6) continue;
    live.push(p);
  }
  if (!live.length) return out;
  const mag = Math.hypot(+fwd || 0, +right || 0);
  if (live.length === 1 || mag < 1e-6) {
    let best = live[0], bf = -Infinity;
    if (mag < 1e-6) for (let i = 0; i < live.length; i++) {
      const f = +live[i].fwd || 0;
      if (f > bf) { bf = f; best = live[i]; }
    }
    out[best.name] = 1;
    return out;
  }
  const q = Math.atan2(+right || 0, +fwd || 0);
  const scored = [];
  for (let i = 0; i < live.length; i++) {
    const p = live[i];
    const a = Math.atan2(+p.right || 0, +p.fwd || 0);
    scored.push({ name: p.name, a, d: angDist(q, a) });
  }
  scored.sort((a, b) => a.d - b.d || (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
  const A = scored[0];
  if (A.d < 1e-4) {
    let n = 1;
    while (n < scored.length && scored[n].d < 1e-4) n++;
    for (let i = 0; i < n; i++) addW(out, scored[i].name, 1 / n);
    return out;
  }
  if (scored.length === 1) { addW(out, A.name, 1); return out; }
  let B = scored[1];
  const d2 = B.d;
  for (let i = 2; i < scored.length; i++) {
    if (scored[i].d > d2 + 1e-4) break;
    if (angDist(scored[i].a, A.a) < angDist(B.a, A.a)) B = scored[i];
  }
  const wB = A.d / (A.d + B.d);
  addW(out, A.name, 1 - wB);
  addW(out, B.name, wB);
  return out;
}

function metaOf(enemy, name) {
  const root = enemy.locoMeta || (enemy.art && enemy.art.locoMeta);
  return (root && root[name]) || null;
}
function metaSpeed(enemy, name) {
  const m = metaOf(enemy, name);
  if (m && +m.speed > 0) return +m.speed;
  const c = CANON[name];
  if (c && c[2] > 0) return c[2];
  if (m) { const h = Math.hypot(+m.fwd || 0, +m.right || 0); if (h > 0) return h; }
  return 0;
}
function clipDur(action, enemy, name) {
  const c = action.getClip && action.getClip();
  if (c && c.duration > 0) return c.duration;
  const m = metaOf(enemy, name);
  if (m && +m.duration > 0) return +m.duration;
  return 1;
}
// Prefer measured meta. A zero vector falls back to the canonical direction so the sample still has an angle.
function sample(actions, enemy, name, fbFwd, fbRight) {
  if (!actions[name]) return null;
  const m = metaOf(enemy, name);
  let f = m && m.fwd != null ? +m.fwd : fbFwd;
  let r = m && m.right != null ? +m.right : fbRight;
  if (!Number.isFinite(f)) f = fbFwd;
  if (!Number.isFinite(r)) r = fbRight;
  if (Math.hypot(f, r) < 1e-4) { f = fbFwd; r = fbRight; }
  return { name, fwd: f, right: r };
}
function bandPoints(actions, enemy, fwdName, sides) {
  const pts = [];
  const canon = (fwdName && CANON[fwdName]) || [1, 0, 1];
  const fwd = fwdName ? sample(actions, enemy, fwdName, canon[0], canon[1]) : null;
  if (fwd) pts.push(fwd);
  for (let i = 0; i < sides.length; i++) {
    const s = sides[i];
    const p = sample(actions, enemy, s.name, s.fwd, s.right);
    if (p) pts.push(p);
    else if (fwd) pts.push({ name: fwd.name, fwd: s.fwd, right: s.right }); // missing side plays the forward clip
  }
  return pts;
}
function walkFwd(actions) { return actions.walk ? 'walk' : actions.strafe ? 'strafe' : null; }
function runFwd(actions, speed) {
  if (actions.jog && speed < 3.6) return 'jog'; // same cut as desiredAnim
  if (actions.run) return 'run';
  return actions.jog ? 'jog' : null;
}
function crouchFwd(actions) {
  if (actions.crouchWalk) return 'crouchWalk';
  if (!actions.crouch) return null;
  const c = actions.crouch.getClip && actions.crouch.getClip();
  const idle = actions.idle && actions.idle.getClip && actions.idle.getClip();
  if (c && idle && c === idle) return null; // crouch action is just the idle clip
  return 'crouch';
}
function resolveBase(actions, name) {
  if (name && actions[name]) return name;
  if (actions.idle) return 'idle';
  if (actions.crouchIdle) return 'crouchIdle';
  return actions.crouch ? 'crouch' : null;
}
function tierCap(tier) { return tier === 'ultra-low' ? 2 : tier === 'low' ? 3 : 4; }

// Drop the smallest loco clips past the tier cap and scale the rest so their sum is unchanged.
function capLoco(targets, baseName, cap) {
  const names = [];
  for (const n in targets) if (n !== baseName && targets[n] > 1e-4) names.push(n);
  if (names.length <= cap) return;
  names.sort((a, b) => targets[b] - targets[a] || (a < b ? -1 : 1));
  let all = 0, keep = 0;
  for (let i = 0; i < names.length; i++) { all += targets[names[i]]; if (i < cap) keep += targets[names[i]]; }
  const scale = keep > 1e-8 ? all / keep : 0;
  for (let i = 0; i < names.length; i++) {
    if (i < cap) targets[names[i]] *= scale;
    else delete targets[names[i]];
  }
}

function buildTargets(enemy, input) {
  const actions = enemy.actions;
  const vel = enemy.locoVel;
  const speed = vel.speed;
  const move = smoothstep(0.08, 0.35, speed);
  const idle = 1 - move;
  const targets = {};
  const phased = {};
  const baseName = resolveBase(actions, input.base);
  let turnBlend = 0, turnName = null;
  const turnRate = +input.turnRate || 0;
  if (speed < 0.25 && Math.abs(turnRate) > 0.6) {
    turnBlend = smoothstep(0.6, 1.5, Math.abs(turnRate));
    const want = turnRate > 0 ? 'turnL' : 'turnR'; // +yaw rate = left
    if (turnBlend > 0 && actions[want]) turnName = want;
    else turnBlend = 0;
  }
  if (baseName) targets[baseName] = idle * (1 - turnBlend);
  if (turnName) { targets[turnName] = idle * turnBlend; phased[turnName] = 1; }

  let wWalk = 0, wRun = 0, wCrouch = 0;
  if (input.crouch) wCrouch = 1;
  else if (speed >= 3.2) wRun = 1;
  else if (speed <= 2.2) wWalk = 1;
  else { wRun = (speed - 2.2) / (3.2 - 2.2); wWalk = 1 - wRun; }

  let miss = 0;
  const put = (pts, bw) => {
    if (!(bw > 0) || !(move > 0)) return;
    if (!pts.length) { miss += bw; return; }
    const blend = blendWeights(pts, vel.fwd, vel.right);
    const keys = Object.keys(blend);
    if (!keys.length) { miss += bw; return; }
    for (let i = 0; i < keys.length; i++) {
      const w = blend[keys[i]] * bw * move;
      if (w <= 0) continue;
      targets[keys[i]] = (targets[keys[i]] || 0) + w;
      phased[keys[i]] = 1;
    }
  };
  if (wWalk) put(bandPoints(actions, enemy, walkFwd(actions), WALK_SIDES), wWalk);
  if (wRun) put(bandPoints(actions, enemy, runFwd(actions, speed), RUN_SIDES), wRun);
  // One crouch clip for every direction (no crouch-strafe clips; the body still faces its facing).
  if (wCrouch) {
    const cn = crouchFwd(actions);
    const p = cn ? sample(actions, enemy, cn, (CANON[cn] || [1, 0, 1])[0], (CANON[cn] || [1, 0, 1])[1]) : null;
    put(p ? [p] : [], 1);
  }
  if (miss > 0 && baseName) targets[baseName] = (targets[baseName] || 0) + miss * move;
  capLoco(targets, baseName, tierCap(input.tier));
  let sum = 0;
  for (const n in targets) sum += targets[n];
  if (sum < 1e-4) { if (baseName) targets[baseName] = 1; }
  else if (Math.abs(sum - 1) > 1e-3) { const s = 1 / sum; for (const n in targets) targets[n] *= s; }
  return { targets, phased, baseName };
}

// 0.15 s time constant. Stops (target speed ~0 while still moving) use 0.1 s so they land sooner.
function easeVel(vel, fwd, right, dt) {
  const cSp = Math.hypot(vel.fwd, vel.right);
  const tSp = Math.hypot(fwd, right);
  const tau = tSp < 1e-3 && cSp > tSp ? 0.1 : 0.15;
  const a = dt > 0 ? 1 - Math.exp(-dt / tau) : 0;
  vel.fwd += (fwd - vel.fwd) * a;
  vel.right += (right - vel.right) * a;
  vel.speed = Math.hypot(vel.fwd, vel.right);
}

function applyAction(action, w, phase, dur, manual) {
  if (w < 1e-3) {
    if (action.setEffectiveWeight) action.setEffectiveWeight(0);
    if (action.isScheduled && action.isScheduled()) action.stop();
    action.enabled = false;
    return;
  }
  action.enabled = true;
  action.paused = false;
  if (!action.isScheduled || !action.isScheduled()) action.play();
  action.setEffectiveWeight(w);
  if (manual) {
    action.setEffectiveTimeScale(0);
    action.time = phase * dur;
  } else action.setEffectiveTimeScale(1);
}

export function createLoco(enemy) {
  if (!enemy) return;
  if (!enemy.locoVel) enemy.locoVel = { fwd: 0, right: 0, speed: 0 };
  else { enemy.locoVel.fwd = 0; enemy.locoVel.right = 0; enemy.locoVel.speed = 0; }
  const w = {};
  const A = enemy.actions || {};
  for (let i = 0; i < MANAGED.length; i++) {
    const name = MANAGED[i];
    const a = A[name];
    if (!a || !a.setEffectiveWeight) continue;
    const on = name === 'idle' ? 1 : 0;
    w[name] = on;
    if (on) {
      a.enabled = true; a.paused = false;
      if (a.play) a.play();
      a.setEffectiveWeight(1);
      if (a.setEffectiveTimeScale) a.setEffectiveTimeScale(1);
    } else {
      a.setEffectiveWeight(0);
      if (a.isScheduled && a.isScheduled()) a.stop();
      a.enabled = false;
    }
  }
  enemy.locoW = w;
  if (!Number.isFinite(enemy.animPhase)) enemy.animPhase = 0;
  if (!enemy.locoMeta && enemy.art && enemy.art.locoMeta) enemy.locoMeta = enemy.art.locoMeta;
}

export function updateLoco(enemy, dt, input) {
  if (!enemy) return;
  if (!(dt > 0)) dt = 0;
  input = input || {};
  if (!enemy.locoVel) enemy.locoVel = { fwd: 0, right: 0, speed: 0 };
  if (!enemy.locoW) enemy.locoW = {};
  const v = input.vel || {};
  easeVel(enemy.locoVel, +v.fwd || 0, +v.right || 0, dt);
  const actions = enemy.actions;
  if (!actions) return;
  const built = buildTargets(enemy, input);
  const targets = built.targets;
  const k = dt > 0 ? 1 - Math.exp(-10 * dt) : 0; // ease weights at 10/s
  const speed = enemy.locoVel.speed;
  let adv = 0;
  for (let i = 0; i < MANAGED.length; i++) {
    const name = MANAGED[i];
    const action = actions[name];
    if (!action && !(enemy.locoW[name] > 0) && !(targets[name] > 0)) continue;
    const cur = enemy.locoW[name] || 0;
    const tgt = targets[name] || 0;
    let w = cur + (tgt - cur) * k;
    if (w < 1e-3 && tgt < 1e-3) w = 0;
    if (w < 0) w = 0;
    enemy.locoW[name] = action ? w : 0;
    if (!action || !(w > 0)) continue;
    // Shared gait clock. The stationary base is not in this sum; a crouch clip used as the base stays out until it is the stepping clip.
    const manual = !!GAIT[name] && (name !== built.baseName || !!built.phased[name]);
    if (!manual) continue;
    const ms = Math.max(0.3, metaSpeed(enemy, name));
    adv += w * clamp(speed / ms, 0.45, 1.7) / Math.max(1e-3, clipDur(action, enemy, name));
  }
  const phase = wrap01((enemy.animPhase || 0) + adv * dt);
  enemy.animPhase = phase;
  for (let i = 0; i < MANAGED.length; i++) {
    const name = MANAGED[i];
    const action = actions[name];
    if (!action) continue;
    const w = enemy.locoW[name] || 0;
    const manual = !!GAIT[name] && (name !== built.baseName || !!built.phased[name]);
    applyAction(action, w, phase, clipDur(action, enemy, name), manual);
  }
}
