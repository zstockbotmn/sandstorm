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
  root.traverse((o) => { if (o.isMesh) { o.frustumCulled = false; o.castShadow = false; o.renderOrder = 2; if (o.material) { o.material = o.material.clone(); o.material.roughness = 0.75; o.material.metalness = 0; } } });
  root.scale.setScalar(+(new URLSearchParams(location.search).get('armscale') || 0.2));
  root.rotation.y = Math.PI; // Blender -Y forward -> glTF +Z; the camera looks down -Z
  root.position.set(-0.3, 0.02, 0.42); // shoulders roughly at eye height, just behind the camera (rig space)
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
    holder.traverse((o) => { if (!o.isMesh) return; const p = o.geometry.attributes.position; for (let i = 0; i < p.count; i += 3) { v.fromBufferAttribute(p, i).applyMatrix4(o.matrixWorld).applyMatrix4(inv);
      if (v.z > zmin + len * 0.55 && v.z < zmin + len * 0.8 && v.y < gy) { gy = v.y; gz = v.z; } } });
    api.grip.position.set(0.012, gy + 0.05, gz - 0.01); api.guard.position.set(-0.01, (top + bot) * 0.5 - 0.02, zmin + len * 0.33);
    api.mag.position.set(-0.01, bot + 0.02, gz - len * 0.14);
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
    api.reach = Math.max(api.reach, _n.copy(target).sub(_S).length() - (S.la + S.lb));
  }
  const _pole = new THREE.Vector3(), _tg = new THREE.Vector3();
  api.update = function update(reloadT) {
    if (!api.holder) return;
    for (const [b, q] of rest) b.quaternion.copy(q);
    root.updateMatrixWorld(true);
    // right hand on the grip; elbow down and out to the right
    api.grip.getWorldPosition(_tg); camera.localToWorld(_pole.set(0.6, -0.9, 0.2)); solve(R, _tg, _pole);
    // left hand: handguard, or down to the magazine and back during a reload
    api.guard.getWorldPosition(_tg);
    if (reloadT > 0) { const w = Math.sin(Math.min(1, reloadT) * Math.PI); api.mag.getWorldPosition(_a); _a.y -= 0.12 * w; _tg.lerp(_a, Math.min(1, w * 1.6)); }
    camera.localToWorld(_pole.set(-0.5, -1.0, 0.0)); solve(L, _tg, _pole);
  };
  return api;
}
