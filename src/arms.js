import * as THREE from 'three';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
// First-person arms (CC0 "fps arms" by para, OpenGameArt; fingers curled into a grip pose in Blender, see
// tools/arms_export.py). Arms are driven by analytic two-bone IK every frame: the right hand holds the pistol grip,
// the left the handguard (or the magazine during a reload), so recoil, ADS and reload motion of the rifle carry the hands.
const _S = new THREE.Vector3(), _E = new THREE.Vector3(), _T = new THREE.Vector3(), _P = new THREE.Vector3(), _n = new THREE.Vector3(), _m = new THREE.Vector3();
const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _q = new THREE.Quaternion(), _pq = new THREE.Quaternion();
const _wq = new THREE.Quaternion(), _mx = new THREE.Matrix4(), _hq = new THREE.Quaternion(), _x = new THREE.Vector3(), _y = new THREE.Vector3(), _z = new THREE.Vector3();
const QP = new URLSearchParams(location.search);
function aimBone(bone, target) { // rotate bone (world) so its length axis (local +Y) points at target
  bone.getWorldPosition(_S); bone.getWorldQuaternion(_wq); _a.set(0, 1, 0).applyQuaternion(_wq); _b.copy(target).sub(_S).normalize();
  _q.setFromUnitVectors(_a, _b); bone.parent.getWorldQuaternion(_pq); const inv = _pq.clone().invert();
  bone.quaternion.premultiply(inv.multiply(_q).multiply(_pq)); bone.updateMatrixWorld(true);
}
export function createArms(src, clips, camera) {
  const root = SkeletonUtils.clone(src); root.name = 'fps_arms';
  const B = (n) => root.getObjectByName(n);
  const side = (s) => ({ up: B('upper_arm' + s), fore: B('forearm' + s), ctl: B('hand' + s + 'control'), hand: B('hand' + s) }); // GLTFLoader strips '.' from node names
  const R = side('R'), L = side('L');
  if (!R.up || !R.fore || !R.ctl || !L.up || !L.fore || !L.ctl) return null;
  // Uniform (tester: bare skin tubes): procedural multicam-style sleeves and dark tan gloves, painted per vertex. A vertex
  // mostly weighted to a hand/finger bone is glove, the rest is sleeve; the camo blotches come from a few octaves of
  // value noise over the bind-pose position (no texture download, nothing to license).
  const hash = (x, y, z) => { const h = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453; return h - Math.floor(h); };
  const vnoise = (x, y, z) => { const ix = Math.floor(x), iy = Math.floor(y), iz = Math.floor(z), fx = x - ix, fy = y - iy, fz = z - iz; const L = (a, b, t) => a + (b - a) * t * t * (3 - 2 * t);
    return L(L(L(hash(ix, iy, iz), hash(ix + 1, iy, iz), fx), L(hash(ix, iy + 1, iz), hash(ix + 1, iy + 1, iz), fx), fy), L(L(hash(ix, iy, iz + 1), hash(ix + 1, iy, iz + 1), fx), L(hash(ix, iy + 1, iz + 1), hash(ix + 1, iy + 1, iz + 1), fx), fy), fz); };
  const CAMO = [[0.55, 0.49, 0.37], [0.42, 0.40, 0.29], [0.33, 0.27, 0.19], [0.62, 0.56, 0.44], [0.24, 0.22, 0.17]], GLOVE = [0.21, 0.18, 0.14], CUFF = [0.36, 0.33, 0.25];
  const camoK = +(QP.get('camok') || 16);
  root.traverse((o) => { if (!o.isMesh) return; o.frustumCulled = false; o.castShadow = false; o.renderOrder = 2;
    const g = o.geometry, pos = g && g.attributes.position; if (!pos) return; const si = g.attributes.skinIndex, sw = g.attributes.skinWeight, bones = o.skeleton ? o.skeleton.bones : null;
    if (!g.boundingBox) g.computeBoundingBox(); const sz = g.boundingBox.getSize(new THREE.Vector3()).length() || 1;
    const col = new Float32Array(pos.count * 3);
    for (let i = 0; i < pos.count; i++) { let handW = 0, cuffW = 0;
      if (si && sw && bones) for (let k = 0; k < 4; k++) { const bn = bones[si.getComponent(i, k)]; const w = sw.getComponent(i, k); if (!bn || !w) continue; const nm = bn.name.toLowerCase();
        if (/hand|f_|thumb|palm/.test(nm)) handW += w; else if (/forearm/.test(nm)) cuffW += w * 0; }
      let c; if (handW > 0.5) c = GLOVE; else { const x = pos.getX(i) / sz * camoK, y = pos.getY(i) / sz * camoK, z = pos.getZ(i) / sz * camoK; const n = 0.6 * vnoise(x, y, z) + 0.4 * vnoise(x * 2.3 + 7, y * 2.3, z * 2.3);
        c = handW > 0.25 ? CUFF : CAMO[Math.min(CAMO.length - 1, Math.floor(n * CAMO.length * 1.15))]; }
      col[i * 3] = c[0] ** 2.2; col[i * 3 + 1] = c[1] ** 2.2; col[i * 3 + 2] = c[2] ** 2.2; } // palette is sRGB; vertex colours are linear
    o.geometry = g.clone(); o.geometry.setAttribute('color', new THREE.BufferAttribute(col, 3));
    if (o.material) { o.material = o.material.clone(); o.material.map = null; o.material.vertexColors = true; o.material.color.setRGB(1, 1, 1); o.material.roughness = 0.9; o.material.metalness = 0; o.material.needsUpdate = true; } });
  root.scale.setScalar(+(QP.get('armscale') || 0.1));
  root.rotation.y = +(QP.get('armrot') || 0) * Math.PI / 180; // rig already faces -Z; the old PI flip put the right arm on the left
  { const v = (QP.get('armpos') || '-0.05,-0.06,0.2').split(',').map(Number); root.position.set(v[0], v[1], v[2]); } // shoulders roughly at eye height, just behind the camera (rig space)
  const clip = (clips || []).find((c) => c.name === 'grip');
  if (clip) for (const t of clip.tracks) { // apply grip pose directly: track names keep Blender's dots, node names don't
    const i = t.name.lastIndexOf('.'), prop = t.name.slice(i + 1), o = B(THREE.PropertyBinding.sanitizeNodeName(t.name.slice(0, i)).replace(/\./g, ''));
    if (!o) continue; if (prop === 'quaternion') o.quaternion.fromArray(t.values, 0); else if (prop === 'position') o.position.fromArray(t.values, 0); }
  const rest = new Map(); root.traverse((o) => { if (o.isBone) rest.set(o, o.quaternion.clone()); });
  root.updateMatrixWorld(true);
  for (const S of [R, L]) { S.up.getWorldPosition(_a); S.fore.getWorldPosition(_b); S.la = _a.distanceTo(_b); S.hand.getWorldPosition(_E); S.lb = _b.distanceTo(_E);
    const fq = new THREE.Quaternion(), cq = new THREE.Quaternion(); S.fore.getWorldQuaternion(fq); S.ctl.getWorldQuaternion(cq); S.rel = fq.invert().multiply(cq); }
  // hand frames from the rifle: fingers (+Y bone axis) wrap the part, palm (+/-Z) faces it. off = per-hand roll fix (URL-tunable)
  const eul = (k, d) => { const v = (QP.get(k) || d).split(',').map(Number); return new THREE.Quaternion().setFromEuler(new THREE.Euler(v[0] * Math.PI / 180, v[1] * Math.PI / 180, v[2] * Math.PI / 180)); };
  R.off = eul('hr', '0,0,0'); L.off = eul('hl', '0,0,0');
  const hframe = (fx, fy, fz, px, py, pz) => (m) => { const hq = api.holder.getWorldQuaternion(_hq);
    _y.set(fx, fy, fz).normalize().applyQuaternion(hq); _z.set(px, py, pz).normalize().applyQuaternion(hq); _x.crossVectors(_y, _z).normalize(); _z.crossVectors(_x, _y); m.makeBasis(_x, _y, _z); };
  R.basis = hframe(-0.5, -0.8, -0.3, -1, 0, 0); // right: fingers down/forward round the grip, palm to the left
  L.basis = hframe(-0.6, 0.3, -0.5, 0, 1, 0);   // left: palm up under the handguard, fingers to the left
  const api = { root, R, L, grip: new THREE.Object3D(), guard: new THREE.Object3D(), mag: new THREE.Object3D(), reach: 0 };
  // grip points on the rifle (holder space), measured from the mesh: lowest point of the rear half = pistol grip,
  // front third mid-height = handguard, magwell just ahead of the grip
  api.attach = function attach(holder) {
    holder.updateMatrixWorld(true); const inv = holder.matrixWorld.clone().invert(); const v = new THREE.Vector3();
    let gy = Infinity, gz = 0, top = -Infinity, bot = Infinity, zmin = Infinity, zmax = -Infinity;
    holder.traverse((o) => { if (!o.isMesh) return; const p = o.geometry.attributes.position; for (let i = 0; i < p.count; i += 3) { v.fromBufferAttribute(p, i).applyMatrix4(o.matrixWorld).applyMatrix4(inv);
      zmin = Math.min(zmin, v.z); zmax = Math.max(zmax, v.z); top = Math.max(top, v.y); bot = Math.min(bot, v.y); } });
    const len = zmax - zmin;
    // Profile the rifle along its length (holder z): per-bin lowest point. The muzzle end is the thin one (barrel), so
    // fractions are measured from it whichever way the model faces. M4 profile: handguard 0.1-0.42, magazine 0.45-0.55,
    // pistol grip 0.65-0.78, stock 0.8-1 (measured from the GLB, tools/prof.mjs).
    const NB = 20, lo = new Array(NB).fill(Infinity), hi = new Array(NB).fill(-Infinity);
    holder.traverse((o) => { if (!o.isMesh) return; const p = o.geometry.attributes.position; for (let i = 0; i < p.count; i += 2) { v.fromBufferAttribute(p, i).applyMatrix4(o.matrixWorld).applyMatrix4(inv);
      const k = Math.min(NB - 1, Math.max(0, Math.floor((v.z - zmin) / len * NB))); lo[k] = Math.min(lo[k], v.y); hi[k] = Math.max(hi[k], v.y); } });
    const muzzleAtMin = (hi[0] - lo[0]) <= (hi[NB - 1] - lo[NB - 1]);
    const zAt = (f) => muzzleAtMin ? zmin + len * f : zmax - len * f;
    const binAt = (f) => Math.min(NB - 1, Math.max(0, Math.floor((zAt(f) - zmin) / len * NB)));
    let gyB = Infinity, gf = 0.72; for (let f = 0.62; f <= 0.8; f += 0.02) { const y = lo[binAt(f)]; if (y < gyB) { gyB = y; gf = f; } }
    const guardBot = Math.min(lo[binAt(0.25)], lo[binAt(0.3)]), recvBot = lo[binAt(0.6)];
    // right hand round the middle-upper pistol grip; left palm under the handguard; magwell for reloads
    api.grip.position.set(0.0, gyB + (recvBot - gyB) * +(QP.get('gripy') || 0.4), zAt(gf + 0.01)); // round the grip itself (tester: hand sat under the receiver)
    api.guard.position.set(0.0, guardBot - 0.005, zAt(+(QP.get('guardf') || 0.24)));
    api.mag.position.set(0.0, lo[binAt(0.5)] + 0.03, zAt(0.5)); api.profile = { muzzleAtMin, gf, gyB, guardBot, recvBot, len };
    holder.add(api.grip, api.guard, api.mag); api.holder = holder;
  };
  function solve(S, target, pole) {
    S.up.getWorldPosition(_S); _n.copy(target).sub(_S); const d = Math.min(_n.length(), (S.la + S.lb) * 0.999); _n.normalize();
    const cosA = Math.max(-1, Math.min(1, (S.la * S.la + d * d - S.lb * S.lb) / (2 * S.la * d))), sinA = Math.sqrt(1 - cosA * cosA);
    _m.copy(pole).sub(_S); _m.addScaledVector(_n, -_m.dot(_n)).normalize();
    _E.copy(_S).addScaledVector(_n, S.la * cosA).addScaledVector(_m, S.la * sinA);
    aimBone(S.up, _E); _T.copy(_S).addScaledVector(_n, d); aimBone(S.fore, _T);
    // hand: place the control bone at the wrist; orient with the forearm, rolled into the rifle
    S.fore.getWorldPosition(_a); _b.copy(_T).sub(_a).normalize();
    S.ctl.parent.updateMatrixWorld(true); const p = S.ctl.parent.worldToLocal(_T.clone()); S.ctl.position.copy(p);
    if (S.basis) { S.basis(_mx); _wq.setFromRotationMatrix(_mx); _wq.multiply(S.off); } else { S.fore.getWorldQuaternion(_wq); _wq.multiply(S.rel); }
    S.ctl.parent.getWorldQuaternion(_pq); S.ctl.quaternion.copy(_pq.invert().multiply(_wq)); S.ctl.updateMatrixWorld(true);
    S.hand.getWorldPosition(_a); api.reach = Math.max(api.reach, _a.distanceTo(target));
  }
  const _pole = new THREE.Vector3(), _tg = new THREE.Vector3();
  const LSH = (QP.get('lsh') || '0.09,-0.02,-0.24').split(',').map(Number); // camera-space shift of the left shoulder
  api.update = function update(reloadT) {
    if (!api.holder) return;
    for (const [b, q] of rest) b.quaternion.copy(q);
    root.updateMatrixWorld(true);
    // Left shoulder forward and in (supporting arm reaches out along the rifle): the handguard is ~0.7 m from the rest
    // shoulder but the arm is 0.53 m long, so the hand stopped short at the magazine.
    if (!L.up0) L.up0 = L.up.position.clone();
    L.up.position.copy(L.up0); root.updateMatrixWorld(true); L.up.getWorldPosition(_a);
    camera.localToWorld(_b.set(LSH[0], LSH[1], LSH[2])); camera.localToWorld(_S.set(0, 0, 0)); _a.add(_b.sub(_S));
    L.up.parent.updateMatrixWorld(true); L.up.position.copy(L.up.parent.worldToLocal(_a)); root.updateMatrixWorld(true);
    // right hand on the grip; elbow down and out to the right
    api.grip.getWorldPosition(_tg); camera.localToWorld(_pole.set(0.6, -0.9, 0.2)); solve(R, _tg, _pole);
    // left hand: handguard, or down to the magazine and back during a reload
    api.guard.getWorldPosition(_tg);
    if (reloadT > 0) { const w = Math.sin(Math.min(1, reloadT) * Math.PI); api.mag.getWorldPosition(_a); _a.y -= 0.12 * w; _tg.lerp(_a, Math.min(1, w * 1.6)); }
    camera.localToWorld(_pole.set(-0.9, -1.0, 0.3)); solve(L, _tg, _pole); // elbow down and out: forearm angles up to the handguard instead of standing stiff
  };
  return api;
}
