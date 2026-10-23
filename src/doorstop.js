import * as THREE from 'three';

// Once per run (A28: default on; ?bld=0 or ?rooms=0 off) the walk curves into one doorway and holds for the next wave.
// Control points are fixed; inLen/outLen are the precomputed sample lengths (no runtime tuning).
// ?door=1 / ?doorstop=1: A29 forces a room in the 25–40 m band + arms on first post-W1 walk (wide fallback); SOUND logs door arm / veer / held.
const SPEED = 3;
const BLD4 = !/[?&]bld=0\b/.test(location.search);
const ROOMS0 = /[?&]rooms=0\b/.test(location.search);
const FORCE_DOOR = /[?&](?:door|doorstop)=1\b/.test(location.search);
const N = 64;

function freshRec() {
  return { count: 0, state: 'idle', inWalkS: 0, outWalkS: 0, duck: { front: 0, flank: 0, frontShots: 0 } };
}

function cubic(P, t) {
  const u = 1 - t, uu = u * u, tt = t * t;
  const c0 = uu * u, c1 = 3 * uu * t, c2 = 3 * u * tt, c3 = tt * t;
  return {
    x: c0 * P[0].x + c1 * P[1].x + c2 * P[2].x + c3 * P[3].x,
    z: c0 * P[0].z + c1 * P[1].z + c2 * P[2].z + c3 * P[3].z,
  };
}

function cubicTan(P, t) {
  const u = 1 - t, a = 3 * u * u, b = 6 * u * t, c = 3 * t * t;
  return {
    x: a * (P[1].x - P[0].x) + b * (P[2].x - P[1].x) + c * (P[3].x - P[2].x),
    z: a * (P[1].z - P[0].z) + b * (P[2].z - P[1].z) + c * (P[3].z - P[2].z),
  };
}

function buildSamples(P) {
  const samples = [{ t: 0, s: 0 }];
  let len = 0, prev = cubic(P, 0);
  for (let i = 1; i < N; i++) {
    const t = i / (N - 1);
    const p = cubic(P, t);
    len += Math.hypot(p.x - prev.x, p.z - prev.z);
    samples.push({ t, s: len });
    prev = p;
  }
  return { P, samples, len };
}

function tAt(path, dist) {
  const s = path.samples;
  if (dist <= 0) return 0;
  if (dist >= path.len) return 1;
  let lo = 0, hi = s.length - 1;
  while (lo + 1 < hi) {
    const mid = (lo + hi) >> 1;
    if (s[mid].s < dist) lo = mid;
    else hi = mid;
  }
  const a = s[lo], b = s[hi], span = b.s - a.s;
  return a.t + (b.t - a.t) * (span > 1e-8 ? (dist - a.s) / span : 0);
}

function poseAt(path, dist) {
  const t = tAt(path, Math.max(0, Math.min(path.len, dist)));
  const p = cubic(path.P, t), d = cubicTan(path.P, t);
  return { x: p.x, z: p.z, tx: d.x, tz: d.z };
}

function standOf(door) {
  return { x: door.x + door.side * 0.45, z: door.z - 0.6 + 0.45 };
}

function xzDist(x, z, b) {
  const dx = x < b.min.x ? b.min.x - x : x > b.max.x ? x - b.max.x : 0;
  const dz = z < b.min.z ? b.min.z - z : z > b.max.z ? z - b.max.z : 0;
  return Math.hypot(dx, dz);
}

export function createDoorStop(camera, world, input, enemies, cover) {
  let rec = freshRec();
  let path = null;
  let s = 0;
  let parked = null;
  let needRebuild = false;
  let wasWalking = false;
  let boxCache = new WeakMap();
  const _box = new THREE.Box3();

  function attach() {
    const S = window.SS;
    if (!S) return null;
    if (S.doorStop !== rec) S.doorStop = rec;
    if (S.doorHold == null) S.doorHold = false;
    return S;
  }
  attach();

  function on() {
    const S = window.SS;
    // A28: stay armed even if fps drops to ultra-low mid-run; only ?rooms=0 / ?bld=0 kill it.
    return !!(BLD4 && S && !ROOMS0);
  }

  function makeIn(door) {
    const camx = camera.position.x, camz = camera.position.z;
    const stand = standOf(door);
    const built = buildSamples([
      { x: camx, z: camz },
      { x: camx, z: camz - 0.45 * (camz - door.z) },
      { x: door.x - door.side * 2.5, z: door.z + 0.3 },
      stand,
    ]);
    built.kind = 'in';
    built.door = door;
    built.stand = stand;
    return built;
  }

  function makeOut(door, from) {
    const p0 = from || standOf(door);
    const built = buildSamples([
      { x: p0.x, z: p0.z },
      { x: door.x - door.side * 2.5, z: door.z - 0.3 },
      { x: 0, z: door.z - 6 },
      { x: 0, z: door.z - 12 },
    ]);
    built.kind = 'out';
    built.door = door;
    built.stand = standOf(door);
    return built;
  }

  function boxesFor(door) {
    let boxes = boxCache.get(door);
    if (boxes) return boxes;
    boxes = [];
    const cols = world.colliders || [];
    for (let i = 0; i < cols.length; i++) {
      const m = cols[i];
      if (!m) continue;
      try { _box.setFromObject(m); } catch (_) { continue; }
      if (_box.isEmpty()) continue;
      boxes.push(_box.clone());
    }
    boxCache.set(door, boxes);
    return boxes;
  }

  // Jamb, its +z mirror, and the facade skin beside the opening are the doorway itself.
  function skin(box, door) {
    const jamb = door.jamb;
    if (jamb) {
      if (box.intersectsBox(jamb)) return true;
      const zA = 2 * door.z - jamb.max.z, zB = 2 * door.z - jamb.min.z;
      const mz0 = Math.min(zA, zB), mz1 = Math.max(zA, zB);
      if (box.max.x >= jamb.min.x && box.min.x <= jamb.max.x && box.max.y >= jamb.min.y && box.min.y <= jamb.max.y && box.max.z >= mz0 && box.min.z <= mz1) return true;
    }
    const side = door.side || 1;
    const jx0 = jamb ? jamb.min.x : door.x, jx1 = jamb ? jamb.max.x : door.x;
    const expand = -0.4 * side;
    const x0 = Math.min(jx0, jx1, jx0 + expand, jx1 + expand);
    const x1 = Math.max(jx0, jx1, jx0 + expand, jx1 + expand);
    const hz = (door.w || 1.2) * 0.5 + 1.2;
    return box.max.x >= x0 && box.min.x <= x1 && box.max.z >= door.z - hz && box.min.z <= door.z + hz;
  }

  function blocked(door, built) {
    const boxes = boxesFor(door);
    for (let i = 0; i < 12; i++) {
      const p = poseAt(built, built.len * (i / 11));
      for (let k = 0; k < boxes.length; k++) {
        const b = boxes[k];
        // Road/sand are under the feet; the lintel is overhead. Body-height boxes only.
        if (b.max.y <= 0.25 || b.min.y >= 2.0) continue;
        if (skin(b, door)) continue;
        if (xzDist(p.x, p.z, b) <= 0.6) return true;
      }
    }
    return false;
  }

  function dlog(why, extra) {
    if (window.SS) window.SS.doorDbg = why + (extra ? ' ' + extra : '');
    try { if (window.SS && window.SS.audio && window.SS.audio.log) window.SS.audio.log('door', why + (extra ? ' ' + extra : '')); } catch (_) {}
  }

  function candidates(wide) {
    const cz = camera.position.z, found = [], segs = world.segments || [];
    // A28: slightly wider arm window; force uses 4-55 m. A29 force fallback: any room ahead up to 120 m.
    const lo = FORCE_DOOR ? (wide ? 2 : 4) : 14, hi = FORCE_DOOR ? (wide ? 120 : 55) : 22;
    for (let i = 0; i < segs.length; i++) {
      const pts = segs[i].coverPoints || [];
      for (let j = 0; j < pts.length; j++) {
        const p = pts[j];
        if (!p || p.type !== 'room' || !p.door) continue;
        const ahead = cz - p.door.z;
        // Normal: start the veer ~14-22 m ahead so in+out walk stays near ~11 s at 3 m/s.
        if (ahead >= lo && ahead <= hi) found.push(p.door);
      }
    }
    found.sort((a, b) => (cz - a.z) - (cz - b.z));
    return found;
  }

  function begin(S) {
    let doors = candidates(false);
    if (!doors.length && FORCE_DOOR) doors = candidates(true);
    if (!doors.length) { dlog('no room ahead', 'z' + camera.position.z.toFixed(0)); return false; }
    for (let i = 0; i < doors.length; i++) {
      const door = doors[i];
      const built = makeIn(door);
      // A28 force: accept even if path grazes a collider (tester at ~1 fps needs a guaranteed stop).
      if (!FORCE_DOOR && blocked(door, built)) continue;
      rec.count = 1;
      rec.state = 'veer';
      rec.inLen = built.len;
      rec.room = [door.x, door.z];
      rec.side = door.side;
      rec.veerSim = S.simTime || 0;
      path = built;
      s = 0;
      parked = { x: camera.position.x, z: camera.position.z };
      needRebuild = false;
      dlog('veer start', 'door z' + door.z.toFixed(0) + ' ahead ' + (camera.position.z - door.z).toFixed(0) + 'm');
      if (enemies.deferWaveTo) enemies.deferWaveTo((S.distance || 0) + built.len + 1);
      return true;
    }
    dlog('no room ahead', 'blocked');
    return false;
  }

  function easeYaw(dt, door) {
    if ((performance.now() - (input.aimMovedT || 0)) <= 400) return;
    const pose = poseAt(path, Math.min(s, path.len));
    const street = path.kind === 'in' && path.len > 0 && s >= path.len * 0.8;
    const target = street ? Math.atan2(-door.side * 0.5, 1) : Math.atan2(pose.tx, -pose.tz);
    const d = Math.atan2(Math.sin(target - input.yaw), Math.cos(target - input.yaw));
    input.yaw += d * (1 - Math.exp(-3 * dt));
  }

  function place(dt) {
    const z0 = camera.position.z;
    const end = s >= path.len;
    const pose = poseAt(path, end ? path.len : s);
    camera.position.x = pose.x;
    camera.position.z = pose.z;
    const drop = z0 - camera.position.z;
    if (drop > 0 && window.SS) window.SS.distance += drop;
    if (path.kind === 'in') rec.inWalkS += dt;
    else rec.outWalkS += dt;
    easeYaw(dt, path.door);
    parked = { x: pose.x, z: pose.z };
    return end;
  }

  function arrive(S) {
    rec.state = 'held';
    S.doorHold = true;
    S.walking = false; // same-frame: cover.update still runs this tick; do not let a stale walking flag wipe takeDoor
    rec.arriveSim = S.simTime || 0;
    rec.clears0 = S.waveClears | 0;
    rec.coverKind = 'door';
    if (!rec.duck) rec.duck = { front: 0, flank: 0, frontShots: 0 };
    if (enemies.waveNow) enemies.waveNow();
    if (cover && cover.takeDoor) cover.takeDoor(path.door);
    dlog('IN COVER · DOORWAY', 'sim ' + (S.simTime || 0).toFixed(1));
  }

  function finishOut() {
    rec.state = 'done';
    if (Math.abs(camera.position.x) < 0.02) camera.position.x = 0;
    path = null;
    s = 0;
  }

  function drifted() {
    if (!parked) return false;
    return Math.hypot(camera.position.x - parked.x, camera.position.z - parked.z) > 0.25;
  }

  function rebuild() {
    if (!path || !path.door) { needRebuild = false; return; }
    const door = path.door;
    if (path.kind === 'in') {
      path = makeIn(door);
      rec.inLen = path.len;
    } else {
      path = makeOut(door, { x: camera.position.x, z: camera.position.z });
      rec.outLen = path.len;
    }
    s = 0;
    needRebuild = false;
  }

  function update(dt, walking) {
    const S = attach();
    if (!S || !on() || !S.running) return false;
    dt = dt || 0;
    if (rec.state === 'idle') {
      // A29: ?door=1 arms on the first post-W1 walk (waveClears >= 1), same as release — early room + wide fallback make it deterministic.
      const clearsOk = (S.waveClears | 0) >= 1;
      if (rec.count === 0 && clearsOk && walking) {
        if (!rec._armedLog) { rec._armedLog = true; dlog('door arm', 'clears ' + (S.waveClears | 0) + ' dist ' + (S.distance || 0).toFixed(0)); }
        begin(S);
      }
      if (rec.state !== 'veer') return false;
    } else if (rec.state === 'done') {
      return false;
    } else if (rec.state === 'held') {
      const sim = S.simTime || 0;
      const due = (S.waveClears | 0) > (rec.clears0 | 0) || (rec.arriveSim != null && sim - rec.arriveSim >= 90);
      if (!due) return false;
      S.doorHold = false;
      rec.state = 'out';
      if (path && path.door) {
        path = makeOut(path.door, path.stand);
        rec.outLen = path.len;
        s = 0;
      }
    }
    if ((rec.state !== 'veer' && rec.state !== 'out') || !path) return false;
    if (!walking) {
      if (drifted()) needRebuild = true;
      wasWalking = false;
      return false;
    }
    if (!wasWalking) {
      if (drifted()) needRebuild = true;
      wasWalking = true;
    }
    if (needRebuild) rebuild();
    s += SPEED * dt;
    const ended = place(dt);
    if (ended) {
      if (path.kind === 'in') arrive(S);
      else finishOut();
    }
    return true;
  }

  function reset() {
    rec = freshRec();
    path = null;
    s = 0;
    parked = null;
    needRebuild = false;
    wasWalking = false;
    boxCache = new WeakMap();
    const S = window.SS;
    if (S) {
      S.doorStop = rec;
      S.doorHold = false;
    }
  }

  return { update, reset };
}
