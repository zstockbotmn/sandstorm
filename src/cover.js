import * as THREE from 'three';
// Automatic cover: when the walk halts for a fight, move behind the nearest cover ahead (or drop a sandbag wall) and duck.
// Tap SCOPE (or Q) to pop up and aim; tap again to duck back. While ducked (input.cover) the player can blind-fire.
const SEARCH_AHEAD = 7, STREET_X = 4.4, BEHIND = 1.0, MOVE_SPEED = 4.5;
export function createCover(scene, camera, world, input) {
  const mat = new THREE.MeshStandardMaterial({ color: 0x9c8a62, roughness: 0.95 });
  const geo = new THREE.BoxGeometry(2.6, 0.9, 0.55); // low enough that crouched eye (~1.28) sees the street
  const c = { state: 'none', target: null, spawned: null, update, reset };
  function pick() {
    const pz = camera.position.z; let best = null, bd = 1e9;
    for (const seg of world.segments || []) for (const p of seg.coverPoints || []) {
      if (p.type !== 'barrel' && p.type !== 'car') continue;
      const ahead = pz - p.pos.z; if (ahead < 1.5 || ahead > SEARCH_AHEAD || Math.abs(p.pos.x) > STREET_X) continue;
      const d = ahead + Math.abs(p.pos.x - camera.position.x); if (d < bd) { bd = d; best = p.pos; }
    }
    if (best) return new THREE.Vector3(best.x, 0, best.z + BEHIND);
    // none close: drop a sandbag-style wall just ahead of the halt point
    const m = new THREE.Mesh(geo, mat); m.position.set(camera.position.x, 0.45, pz - 2.2); m.castShadow = m.receiveShadow = true;
    scene.add(m); world.colliders.push(m); c.spawned = m;
    return new THREE.Vector3(m.position.x, 0, m.position.z + BEHIND);
  }
  function clearSpawned() {
    if (!c.spawned) return; scene.remove(c.spawned); const i = world.colliders.indexOf(c.spawned); if (i >= 0) world.colliders.splice(i, 1); c.spawned = null;
  }
  function update(dt, walking) {
    if (walking) {
      if (c.state !== 'none') { c.state = 'none'; c.target = null; clearSpawned(); }
      input.cover = false;
      camera.position.x += (0 - camera.position.x) * (1 - Math.exp(-1.5 * dt)); // drift back to the road centre
      return;
    }
    if (!window.SS || !window.SS.running) return;
    if (!c.target) { c.target = pick(); c.state = 'moving'; }
    const dx = c.target.x - camera.position.x, dz = c.target.z - camera.position.z, d = Math.hypot(dx, dz);
    if (d > 0.05) { const s = Math.min(d, MOVE_SPEED * dt) / d; camera.position.x += dx * s; camera.position.z += dz * s; }
    else c.state = 'in';
    input.cover = c.state === 'in' && !input.scope; // duck unless scoping (pop out)
  }
  function reset() { c.state = 'none'; c.target = null; clearSpawned(); input.cover = false; }
  return c;
}
