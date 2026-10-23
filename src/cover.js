import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { pbrMaterial } from './texlib.js';
import { LOWQ } from './quality.js';
export const COVER_GRACE_S = 1.5; // m1v: seconds of no damage after first reaching cover in a run (tunable)
function makeBags(W, H, D) {
  const parts = []; const rows = 3, rh = H / rows;
  for (let r = 0; r < rows; r++) {
    const n = r === 2 ? 4 : 5, bw = W / 5, x0 = -((n - 1) * bw) / 2;
    for (let i = 0; i < n; i++) {
      const g = new THREE.SphereGeometry(0.5, 10, 6);
      g.scale(bw * 1.08, rh * 1.25, D * (0.95 - r * 0.06));
      g.rotateY((i * 7 + r * 3) % 5 * 0.03 - 0.06);
      g.translate(x0 + i * bw + (r === 1 ? bw * 0.18 : 0), -H / 2 + rh * (r + 0.5), 0);
      parts.push(g);
    }
  }
  const m = mergeGeometries(parts); m.computeBoundingBox(); m.computeBoundingSphere(); return m;
}
// Automatic cover: when the walk halts for a fight, move behind the nearest cover ahead (or drop a sandbag wall) and duck.
// Tap SCOPE (or Q) to pop up and aim; tap again to duck back. While ducked (input.cover) the player can blind-fire.
const PLAYER_R = 0.55; // camera keeps this far from the cover face
const SEARCH_AHEAD = 7, STREET_X = 4.4, BEHIND = 1.0, MOVE_SPEED = 4.5;
export function createCover(scene, camera, world, input) {
  // Hessian (Poly Haven CC0) sandbags: three staggered rows of squashed-sphere bags merged into one mesh.
  const mat = pbrMaterial('hessian_230', { color: 0xd8c49a, full: !LOWQ });
  const BAG_H = 0.7;
  const geo = makeBags(2.6, BAG_H, 0.55); // low; crouched eye (~1.28) sees street
  const c = { state: 'none', target: null, spawned: null, update, reset };
  c.prewarmMesh = () => { const m = new THREE.Mesh(geo, mat.clone()); m.castShadow = m.receiveShadow = true; return m; };
  // pick(exclude, dir): first cover on engage (nearest ahead), or the next cover left (-1) / right (+1) of the current one.
  function pick(exclude, dir) {
    const pz = camera.position.z; let best = null, bd = 1e9, bestType = '';
    for (const seg of world.segments || []) for (const p of seg.coverPoints || []) {
      if (p.type !== 'barrel' && p.type !== 'car') continue;
      const ahead = pz - p.pos.z; if (ahead < (exclude ? -1 : 1.5) || ahead > (exclude ? SEARCH_AHEAD + 3 : SEARCH_AHEAD) || Math.abs(p.pos.x) > STREET_X) continue;
      if (exclude && Math.hypot(p.pos.x - exclude.x, p.pos.z - exclude.z) < 3.4) continue; // A9: a switch / grenade move clears the 3 m grenade radius
      if (dir && Math.sign(p.pos.x - camera.position.x) !== dir) continue;
      const d = ahead + Math.abs(p.pos.x - camera.position.x); if (d < bd) { bd = d; best = p.pos; bestType = p.type; }
    }
    if (best) {
      // stop at the cover's real surface: union the colliders around the spot and stand PLAYER_R behind its near face
      const box = new THREE.Box3(), tmp = new THREE.Box3(); let any = false;
      for (const m of world.colliders) { if (!m.geometry) continue; tmp.setFromObject(m); const cx = (tmp.min.x + tmp.max.x) / 2, cz = (tmp.min.z + tmp.max.z) / 2;
        if (Math.abs(cx - best.x) < 1.6 && Math.abs(cz - best.z) < 2.8 && tmp.max.y < 3) { box.union(tmp); any = true; } }
      c.kind = bestType;
      // m1s: behind a burned car (1.5 m roof, 4 m long) the body filled the lower half of the view: stand at its
      // street-side rear corner (the car still covers the body; the street ahead is open) - the eye is raised too (main).
      if (any && bestType === 'car') { c.surface = box; const inner = (box.min.x + box.max.x) / 2 > 0 ? box.min.x + 0.15 : box.max.x - 0.15; return new THREE.Vector3(inner, 0, box.max.z + PLAYER_R); }
      if (any) { c.surface = box; return new THREE.Vector3(Math.max(box.min.x + 0.3, Math.min(box.max.x - 0.3, camera.position.x)), 0, box.max.z + PLAYER_R); }
      return new THREE.Vector3(best.x, 0, best.z + BEHIND);
    }
    // none close: drop a sandbag-style wall just ahead of the halt point
    c.kind = 'sandbag';
    clearSpawned();
    const bx = dir ? Math.max(-STREET_X, Math.min(STREET_X, camera.position.x + dir * 4)) : exclude ? Math.max(-STREET_X, Math.min(STREET_X, camera.position.x + (camera.position.x > 0 ? -3 : 3))) : camera.position.x;
    const m = new THREE.Mesh(geo, mat.clone()); m.position.set(bx, BAG_H / 2, pz - 2.2); m.castShadow = m.receiveShadow = true;
    m.name = 'sandbag'; scene.add(m); world.colliders.push(m); c.spawned = m;
    c.surface = new THREE.Box3().setFromObject(m);
    return new THREE.Vector3(m.position.x, 0, c.surface.max.z + PLAYER_R);
  }
  function clearSpawned() {
    if (!c.spawned) return; scene.remove(c.spawned); const i = world.colliders.indexOf(c.spawned); if (i >= 0) world.colliders.splice(i, 1); c.spawned = null;
  }
  // A24: if the eye embeds in a prop/wall (cover switch path, sandbag near a wooden facade, doorway hold),
  // push out along the shallowest exit (prefer street-centre x, then +z) and log once per nudge.
  const _ub = new THREE.Box3(), _up = new THREE.Vector3();
  function unstick(why) {
    const cols = world.colliders || []; if (!cols.length) return false;
    _up.set(camera.position.x, camera.position.y, camera.position.z);
    let hit = null;
    for (const m of cols) {
      if (!m || !m.geometry) continue;
      try { _ub.setFromObject(m); } catch (_) { continue; }
      // Ignore flat ground slabs and giant skyboxes; keep facade / prop / room wood.
      const sx = _ub.max.x - _ub.min.x, sy = _ub.max.y - _ub.min.y, sz = _ub.max.z - _ub.min.z;
      if (sy < 0.4 || sy > 14 || sx > 40 || sz > 40) continue;
      if (!_ub.containsPoint(_up)) continue;
      hit = _ub; break;
    }
    if (!hit) {
      // Soft street clamp: never park past the facade line while in cover / walking back.
      if (Math.abs(camera.position.x) > STREET_X + 0.15) {
        const nx = Math.sign(camera.position.x) * STREET_X;
        camera.position.x = nx;
        try { if (window.SS && window.SS.audio) window.SS.audio.log('player', 'camera unstick'); } catch (_) {}
        const L = window.SS && (window.SS.unstickLog || (window.SS.unstickLog = []));
        if (L) { L.push({ sim: +((window.SS.simTime) || 0).toFixed(1), why: why || 'street', x: +camera.position.x.toFixed(2), z: +camera.position.z.toFixed(2) }); if (L.length > 20) L.shift(); }
        return true;
      }
      return false;
    }
    const pen = {
      xNeg: _up.x - hit.min.x, xPos: hit.max.x - _up.x,
      zNeg: _up.z - hit.min.z, zPos: hit.max.z - _up.z,
      yNeg: _up.y - hit.min.y, yPos: hit.max.y - _up.y
    };
    // Prefer exit toward street centre (x->0), then toward +z (behind cover / toward spawn).
    let best = 'x', bestD = 1e9, sign = 0;
    const xToward0 = camera.position.x >= 0 ? pen.xNeg : pen.xPos;
    if (xToward0 < bestD) { bestD = xToward0; best = 'x'; sign = camera.position.x >= 0 ? -1 : 1; }
    if (pen.zPos < bestD) { bestD = pen.zPos; best = 'z'; sign = 1; }
    if (pen.zNeg < bestD) { bestD = pen.zNeg; best = 'z'; sign = -1; }
    const pad = 0.12;
    if (best === 'x') camera.position.x += sign * (bestD + pad);
    else camera.position.z += sign * (bestD + pad);
    if (Math.abs(camera.position.x) > STREET_X) camera.position.x = Math.sign(camera.position.x || 1) * STREET_X;
    try { if (window.SS && window.SS.audio) window.SS.audio.log('player', 'camera unstick'); } catch (_) {}
    const L = window.SS && (window.SS.unstickLog || (window.SS.unstickLog = []));
    if (L) { L.push({ sim: +((window.SS.simTime) || 0).toFixed(1), why: why || 'geom', x: +camera.position.x.toFixed(2), z: +camera.position.z.toFixed(2), axis: best }); if (L.length > 20) L.shift(); }
    return true;
  }
  c.unstick = unstick;
  function update(dt, walking) {
    if (walking) {
      if (c.state !== 'none') { c.state = 'none'; c.target = null; c.surface = null; c.door = null; c.kind = null; clearSpawned(); }
      input.cover = false;
      if (!(window.SS && window.SS.doorStop && /veer|out/.test(window.SS.doorStop.state))) camera.position.x += (0 - camera.position.x) * (1 - Math.exp(-1.5 * dt)); // drift back to the road centre (held off while a doorway curve owns x)
      unstick('walk');
      return;
    }
    if (!window.SS || !window.SS.running) return;
    // 4e5b: door frame is sticky cover — never auto-pick away; re-take if target lost
    if (c.kind === 'door') {
      if (!c.target && c.door) { takeDoor(c.door); }
    } else if (!c.target) { c.target = pick(); c.state = 'moving'; }
    if (!c.target) return;
    const dx = c.target.x - camera.position.x, dz = c.target.z - camera.position.z, d = Math.hypot(dx, dz);
    if (d > 0.05) { const s = Math.min(d, MOVE_SPEED * dt) / d; camera.position.x += dx * s; camera.position.z += dz * s;
      if (c.kind !== 'door' && c.surface && camera.position.z < c.surface.max.z + PLAYER_R) camera.position.z = c.surface.max.z + PLAYER_R; // never enter the cover (skip for door: stand is beside the jamb)
      unstick('cover-move'); }
    else { if (c.state !== 'in' && window.SS && !window.SS.firstCoverT) { window.SS.firstCoverT = performance.now(); window.SS.coverGraceUntil = performance.now() + COVER_GRACE_S * 1000; } c.state = 'in'; unstick('cover-in'); } // m1v: 1.5 s grace on first reaching cover (COVER_GRACE_S)
    if (c.reaim) reaim(dt);
    input.cover = c.state === 'in' && !input.scope; // duck unless scoping (pop out)
    // 4e5b: doorway pop-out leans 0.35 m toward the street so the fight ahead is visible
    if (c.kind === 'door' && c.door && c.state === 'in') {
      const want = input.scope ? -(c.door.side || 1) * 0.35 : 0;
      c._doorLean = (c._doorLean || 0) + (want - (c._doorLean || 0)) * (1 - Math.exp(-8 * dt));
      camera.position.x = c.target.x + c._doorLean;
    } else c._doorLean = 0;
    if (c.spawned && c.spawned.material) {
      // ghost sandbag while ducked so a turn doesn't fill the screen; solid when popped out
      // (kept opaque: a transparent bag hit a 1-2 s first-blend-state stall on software GL)
    }
  }
  // Move to another cover (grenade flush / SWITCH COVER): a short exposed run, then duck again.
  c.relocate = function relocate(dir, why) {
    if (c.state === 'none' || !window.SS || !window.SS.running) return false;
    // 4e5b: SWITCH COVER does nothing at the door; grenade flush may still leave to street cover
    if (c.kind === 'door' && why !== 'grenade') return false;
    if (c.kind === 'door') { c.kind = null; c.door = null; }
    input.scope = false; // m1u: a cover move always leaves the scope
    const cur = c.target ? c.target.clone() : camera.position.clone(); const old = c.spawned; if (old) c.spawned = null;
    c.surface = null; let t = pick(cur, dir || 0);
    // A20 (tester A19 W4: a SWITCH COVER tap did nothing visible for ~10 s, no log): with no cover on that side the fallback
    // sandbag was clamped to the street edge - i.e. dropped on the player's own spot, so the 'move' went nowhere. Now a
    // tap that would move < 1.5 m tries the other side (then a cover-free 3 m side step), and every tap logs its result.
    if (why === 'switch' && Math.hypot(t.x - cur.x, t.z - cur.z) < 1.5) { clearSpawned(); c.surface = null; t = pick(cur, -(dir || 1));
      if (Math.hypot(t.x - cur.x, t.z - cur.z) < 1.5) { clearSpawned(); c.surface = null; t = pick(cur, 0); } }
    if (why === 'switch') { const n = Math.hypot(t.x - cur.x, t.z - cur.z); try { window.SS.audio.log('player', 'switch cover -> ' + n.toFixed(1) + 'm (' + (c.kind || '?') + ')'); } catch (_) {}
      const L = window.SS.switchLog || (window.SS.switchLog = []); L.push({ sim: +(window.SS.simTime || 0).toFixed(1), m: +n.toFixed(1), kind: c.kind, t: performance.now() }); } if (old && old !== c.spawned) { scene.remove(old); const i = world.colliders.indexOf(old); if (i >= 0) world.colliders.splice(i, 1); }
    // A24: never park the cover target inside a collider (wooden wall / prop)
    { const px = camera.position.x, pz = camera.position.z; camera.position.x = t.x; camera.position.z = t.z; unstick('cover-target'); t.x = camera.position.x; t.z = camera.position.z; camera.position.x = px; camera.position.z = pz; }
    c.target = t; c.state = 'moving'; input.cover = false; if (why === 'grenade') { c.reaim = 1.2; input.pitch = 0; /* only the announced grenade move turns the view; a SWITCH COVER tap never does (tester: view swung ~90 deg during a hold) */ if (input.clearAim) input.clearAim(); const w = window.SS && window.SS.weapon; if (w && w.cancelRecoil) w.cancelRecoil(); } /* hard level reset (tester: stuck looking at the bags) */ c.moves = (c.moves | 0) + 1; c.lastMove = why || 'switch'; return true;
  };
  // Fix 5: after a grenade-forced move the view was left facing a wall. Ease the view (yaw toward the nearest live enemy,
  // else straight down the street; pitch level) over the run + ~1 s, unless the player drags meanwhile.
  function reaim(dt) {
    if ((input.aimMovedT || 0) > performance.now() - 150) { c.reaim = 0; return; }
    c.reaim -= dt; let tx = 0, tz = -1, bd = 1e9; const el = window.SS.enemies && window.SS.enemies.list;
    if (el) for (const e of el) { if (!e || !e.alive || e.dying) continue; const dx = e.group.position.x - camera.position.x, dz = e.group.position.z - camera.position.z, d = Math.hypot(dx, dz); if (d > 1 && d < bd && -dz > Math.abs(dx) * 0.6) { /* only enemies ahead (within ~60 deg of down-street): never a big swing */ bd = d; tx = dx; tz = dz; } }
    const want = Math.atan2(tx, -tz); let dy = want - input.yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy));
    const k = 1 - Math.exp(-8 * dt); input.yaw += dy * k; input.pitch = 0;
    if (c.reaim <= 0) c.reaim = 0;
  }
  function takeDoor(door) {
    if (!door || !door.jamb) return false;
    clearSpawned();
    c.surface = door.jamb.clone();
    c.kind = 'door';
    c.door = door;
    c._doorLean = 0;
    c.target = new THREE.Vector3(door.x + door.side * 0.45, 0, door.jamb.max.z + PLAYER_R * 0.8);
    c.state = 'moving';
    input.cover = false;
    return true;
  }
  c.takeDoor = takeDoor;
  function reset() { c.reaim = 0; c.surface = null; c.state = 'none'; c.target = null; c.door = null; c.kind = null; c._doorLean = 0; clearSpawned(); input.cover = false; }
  c.reset = reset; // A13 debug: room teleport
  return c;
}
