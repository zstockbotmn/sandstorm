import * as THREE from 'three';
// Desert sky + distant skyline. Replaces the HDRI as background (the PMREM env map rendered as a blurry/black
// background with green trees); the HDRI is still used for lighting only.
export function createSky(scene) {
  // vertical gradient sky dome (no fog, always behind everything)
  const c = document.createElement('canvas'); c.width = 4; c.height = 256; const g = c.getContext('2d');
  const gr = g.createLinearGradient(0, 0, 0, 256);
  gr.addColorStop(0, '#5f9fd6'); gr.addColorStop(0.42, '#a9cbe3'); gr.addColorStop(0.5, '#e2d3b0'); gr.addColorStop(1, '#cdb88c');
  g.fillStyle = gr; g.fillRect(0, 0, 4, 256);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const dome = new THREE.Mesh(new THREE.SphereGeometry(200, 24, 16), new THREE.MeshBasicMaterial({ map: tex, side: THREE.BackSide, fog: false, depthWrite: false }));
  dome.renderOrder = -10; dome.frustumCulled = false; scene.add(dome);
  // Distant city ring (replaces the flat skyline band): low-poly 3D blocks, domes and minarets on a ring that rides with
  // the camera, lit by the scene and hazed toward the horizon colour by distance (fog off so it never vanishes).
  let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const haze = new THREE.Color(0xe2d3b0), base = new THREE.Color(0xc2a77e), tmpC = new THREE.Color();
  const N = 220, box = new THREE.BoxGeometry(1, 1, 1); box.translate(0, 0.5, 0);
  const mat = new THREE.MeshLambertMaterial({ color: 0xffffff, fog: false });
  const blocks = new THREE.InstancedMesh(box, mat, N);
  const domeG = new THREE.SphereGeometry(1, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), towerG = new THREE.CylinderGeometry(0.5, 0.6, 1, 8); towerG.translate(0, 0.5, 0);
  const domes = new THREE.InstancedMesh(domeG, mat, 24), towers = new THREE.InstancedMesh(towerG, mat, 16);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), sc = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);
  let nd = 0, nt = 0;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2 + rnd() * 0.02, r = 105 + rnd() * 70, w = 6 + rnd() * 12, d = 6 + rnd() * 10, h = 5 + rnd() * 22 * (r < 140 ? 0.7 : 1);
    v.set(Math.sin(a) * r, -0.5, Math.cos(a) * r); q.setFromAxisAngle(up, a + rnd() * 0.3); sc.set(w, h, d);
    blocks.setMatrixAt(i, m4.compose(v, q, sc));
    const k = Math.min(1, (r - 100) / 80) * 0.55 + 0.25; blocks.setColorAt(i, tmpC.copy(base).multiplyScalar(0.85 + rnd() * 0.25).lerp(haze, k));
    if (nd < 24 && rnd() < 0.11) { const dr = Math.min(w, d) * 0.4; domes.setMatrixAt(nd, m4.compose(v.clone().setY(h - 0.5), q, sc.set(dr, dr * 0.9, dr))); domes.setColorAt(nd++, tmpC); }
    if (nt < 16 && rnd() < 0.07) { towers.setMatrixAt(nt, m4.compose(v.clone().add(sc.set(w * 0.3, 0, 0)), q, sc.set(1.6, h + 10 + rnd() * 8, 1.6))); towers.setColorAt(nt++, tmpC); }
  }
  domes.count = nd; towers.count = nt;
  const band = new THREE.Group(); band.add(blocks, domes, towers);
  [blocks, domes, towers].forEach((m) => { m.frustumCulled = false; m.castShadow = m.receiveShadow = false; });
  scene.add(band);
  scene.background = new THREE.Color(0xa9cbe3);
  return { update(cam) { dome.position.copy(cam.position); band.position.x = cam.position.x; band.position.z = cam.position.z; band.position.y = 0; } };
}
