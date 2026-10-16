import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { pbrMaterial } from './texlib.js';
import { LOWQ } from './quality.js';
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
    const pz = camera.position.z; let best = null, bd = 1e9;
    for (const seg of world.segments || []) for (const p of seg.coverPoints || []) {
      if (p.type !== 'barrel' && p.type !== 'car') continue;
      const ahead = pz - p.pos.z; if (ahead < (exclude ? -1 : 1.5) || ahead > (exclude ? SEARCH_AHEAD + 3 : SEARCH_AHEAD) || Math.abs(p.pos.x) > STREET_X) continue;
      if (exclude && Math.hypot(p.pos.x - exclude.x, p.pos.z - exclude.z) < 1.6) continue;
      if (dir && Math.sign(p.pos.x - camera.position.x) !== dir) continue;
      const d = ahead + Math.abs(p.pos.x - camera.position.x); if (d < bd) { bd = d; best = p.pos; }
    }
    if (best) {
      // stop at the cover's real surface: union the colliders around the spot and stand PLAYER_R behind its near face
      const box = new THREE.Box3(), tmp = new THREE.Box3(); let any = false;
      for (const m of world.colliders) { if (!m.geometry) continue; tmp.setFromObject(m); const cx = (tmp.min.x + tmp.max.x) / 2, cz = (tmp.min.z + tmp.max.z) / 2;
        if (Math.abs(cx - best.x) < 1.6 && Math.abs(cz - best.z) < 2.8 && tmp.max.y < 3) { box.union(tmp); any = true; } }
      if (any) { c.surface = box; return new THREE.Vector3(Math.max(box.min.x + 0.3, Math.min(box.max.x - 0.3, camera.position.x)), 0, box.max.z + PLAYER_R); }
      return new THREE.Vector3(best.x, 0, best.z + BEHIND);
    }
    // none close: drop a sandbag-style wall just ahead of the halt point
    clearSpawned();
    const bx = dir ? Math.max(-STREET_X, Math.min(STREET_X, camera.position.x + dir * 3)) : exclude ? Math.max(-STREET_X, Math.min(STREET_X, camera.position.x + (camera.position.x > 0 ? -3 : 3))) : camera.position.x;
    const m = new THREE.Mesh(geo, mat.clone()); m.position.set(bx, BAG_H / 2, pz - 2.2); m.castShadow = m.receiveShadow = true;
    m.name = 'sandbag'; scene.add(m); world.colliders.push(m); c.spawned = m;
    c.surface = new THREE.Box3().setFromObject(m);
    return new THREE.Vector3(m.position.x, 0, c.surface.max.z + PLAYER_R);
  }
  function clearSpawned() {
    if (!c.spawned) return; scene.remove(c.spawned); const i = world.colliders.indexOf(c.spawned); if (i >= 0) world.colliders.splice(i, 1); c.spawned = null;
  }
  function update(dt, walking) {
    if (walking) {
      if (c.state !== 'none') { c.state = 'none'; c.target = null; c.surface = null; clearSpawned(); }
      input.cover = false;
      camera.position.x += (0 - camera.position.x) * (1 - Math.exp(-1.5 * dt)); // drift back to the road centre
      return;
    }
    if (!window.SS || !window.SS.running) return;
    if (!c.target) { c.target = pick(); c.state = 'moving'; }
    const dx = c.target.x - camera.position.x, dz = c.target.z - camera.position.z, d = Math.hypot(dx, dz);
    if (d > 0.05) { const s = Math.min(d, MOVE_SPEED * dt) / d; camera.position.x += dx * s; camera.position.z += dz * s;
      if (c.surface && camera.position.z < c.surface.max.z + PLAYER_R) camera.position.z = c.surface.max.z + PLAYER_R; } // never enter the cover
    else c.state = 'in';
    if (c.reaim) reaim(dt);
    input.cover = c.state === 'in' && !input.scope; // duck unless scoping (pop out)
    if (c.spawned && c.spawned.material) {
      // ghost sandbag while ducked so a turn doesn't fill the screen; solid when popped out
      // (kept opaque: a transparent bag hit a 1-2 s first-blend-state stall on software GL)
    }
  }
  // Move to another cover (grenade flush / SWITCH COVER): a short exposed run, then duck again.
  c.relocate = function relocate(dir, why) {
    if (c.state === 'none' || !window.SS || !window.SS.running) return false;
    const cur = c.target ? c.target.clone() : camera.position.clone(); const old = c.spawned; if (old) c.spawned = null;
    c.surface = null; const t = pick(cur, dir || 0); if (old && old !== c.spawned) { scene.remove(old); const i = world.colliders.indexOf(old); if (i >= 0) world.colliders.splice(i, 1); }
    c.target = t; c.state = 'moving'; input.cover = false; if (why === 'grenade' || why === 'switch') { c.reaim = 1.2; input.pitch = 0; if (input.clearAim) input.clearAim(); const w = window.SS && window.SS.weapon; if (w && w.cancelRecoil) w.cancelRecoil(); } /* hard level reset (tester: stuck looking at the bags) */ c.moves = (c.moves | 0) + 1; c.lastMove = why || 'switch'; return true;
  };
  // Fix 5: after a grenade-forced move the view was left facing a wall. Ease the view (yaw toward the nearest live enemy,
  // else straight down the street; pitch level) over the run + ~1 s, unless the player drags meanwhile.
  function reaim(dt) {
    if ((input.aimMovedT || 0) > performance.now() - 150) { c.reaim = 0; return; }
    c.reaim -= dt; let tx = 0, tz = -1, bd = 1e9; const el = window.SS.enemies && window.SS.enemies.list;
    if (el) for (const e of el) { if (!e || !e.alive || e.dying) continue; const dx = e.group.position.x - camera.position.x, dz = e.group.position.z - camera.position.z, d = Math.hypot(dx, dz); if (d > 1 && d < bd) { bd = d; tx = dx; tz = dz; } }
    const want = Math.atan2(tx, -tz); let dy = want - input.yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy));
    const k = 1 - Math.exp(-8 * dt); input.yaw += dy * k; input.pitch = 0;
    if (c.reaim <= 0) c.reaim = 0;
  }
  function reset() { c.reaim = 0; c.surface = null; c.state = 'none'; c.target = null; clearSpawned(); input.cover = false; }
  return c;
}
