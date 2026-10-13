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
  // distant hazy skyline band: random flat-roof/dome silhouettes, fades into the horizon colour
  const s = document.createElement('canvas'); s.width = 2048; s.height = 128; const h = s.getContext('2d');
  let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  h.fillStyle = 'rgba(196,176,140,1)';
  for (let x = 0; x < 2048;) { const w = 20 + rnd() * 70, ht = 18 + rnd() * 70; h.fillRect(x, 128 - ht, w, ht);
    if (rnd() < 0.15) { h.beginPath(); h.arc(x + w / 2, 128 - ht, w * 0.35, Math.PI, 0); h.fill(); }
    if (rnd() < 0.08) h.fillRect(x + w * 0.4, 128 - ht - 40, 6, 40); x += w + rnd() * 6; }
  const sTex = new THREE.CanvasTexture(s); sTex.colorSpace = THREE.SRGBColorSpace; sTex.wrapS = THREE.RepeatWrapping; sTex.repeat.x = 3;
  const band = new THREE.Mesh(new THREE.CylinderGeometry(150, 150, 30, 48, 1, true), new THREE.MeshBasicMaterial({ map: sTex, transparent: true, side: THREE.BackSide, fog: false, depthWrite: false }));
  band.position.y = 13; band.renderOrder = -9; band.frustumCulled = false; scene.add(band);
  scene.background = new THREE.Color(0xa9cbe3);
  return { update(cam) { dome.position.copy(cam.position); band.position.x = cam.position.x; band.position.z = cam.position.z; } };
}
