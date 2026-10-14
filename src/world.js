import * as THREE from 'three';
import { art } from './art.js';

const SEG_LEN = 60;
const SEG_COUNT = 5;
const START_Z = 24;      // first segment starts behind the spawn so the run opens in a street, not open desert
import { Q, LOWQ, ULTRA } from './quality.js';
import { pbrMaterial, worldBox } from './texlib.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
const DRAW_AHEAD = Q.drawAhead;  // segments wholly beyond this (fogged out anyway) are not drawn
const DRAW_BEHIND = 20;

function mulberry32(a) {
  a >>>= 0;
  return function rand() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makePlasterTexture() {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = '#c9a36a';
  g.fillRect(0, 0, 256, 256);
  const rng = mulberry32(0x51a7);
  const img = g.getImageData(0, 0, 256, 256);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (rng() - 0.5) * 36;
    d[i] = Math.max(0, Math.min(255, d[i] + n));
    d[i + 1] = Math.max(0, Math.min(255, d[i + 1] + n * 0.85));
    d[i + 2] = Math.max(0, Math.min(255, d[i + 2] + n * 0.55));
  }
  g.putImageData(img, 0, 0);
  g.strokeStyle = 'rgba(90, 60, 30, 0.18)';
  g.lineWidth = 2;
  for (let y = 32; y < 256; y += 32) {
    g.beginPath();
    g.moveTo(0, y + (rng() * 2));
    g.lineTo(256, y + (rng() * 2));
    g.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

const boxGeo = new THREE.BoxGeometry(1, 1, 1);
boxGeo.setAttribute('uv2', boxGeo.attributes.uv);
const barrelGeo = new THREE.CylinderGeometry(0.32, 0.36, 0.9, 8);

function prepTex(tex, repeatX, repeatY, srgb) {
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  tex.anisotropy = 4;
  if (srgb) tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// High tier swaps in Poly Haven CC0 maps. A failed fetch leaves the colored material.
function upgradeMaterial(mat, base, repeatX, repeatY, full = true) {
  const loader = new THREE.TextureLoader();
  const root = 'assets/textures/' + base;
  loader.load(root + '_diff.webp', (tex) => {
    prepTex(tex, repeatX, repeatY, true);
    mat.map = tex;
    mat.color.set(0xffffff);
    mat.needsUpdate = true;
  });
  if (!full) return;
  loader.load(root + '_nor.webp', (tex) => {
    prepTex(tex, repeatX, repeatY, false);
    mat.normalMap = tex;
    mat.needsUpdate = true;
  });
  loader.load(root + '_arm.webp', (tex) => {
    prepTex(tex, repeatX, repeatY, false);
    mat.roughnessMap = tex;
    mat.metalnessMap = tex;
    mat.aoMap = tex;
    mat.roughness = 1;
    mat.metalness = 1;
    mat.aoMapIntensity = 0.85;
    mat.needsUpdate = true;
  });
}

export function createWorld(scene, seed) {
  const plasterMap = makePlasterTexture();
  plasterMap.repeat.set(1, 1);

  const matPlaster = new THREE.MeshStandardMaterial({ map: plasterMap, roughness: 0.92, metalness: 0 });
  const matDark = new THREE.MeshStandardMaterial({ color: 0x1a140e, roughness: 1 });
  const matRoad = new THREE.MeshStandardMaterial({ color: 0x8d7b64, roughness: 1 });
  const matSand = new THREE.MeshStandardMaterial({ color: 0xd7bf8a, roughness: 1 });
  const matAwning = new THREE.MeshStandardMaterial({ color: 0xb5523a, roughness: 0.85 });
  const matAwningAlt = new THREE.MeshStandardMaterial({ color: 0xd8c7a0, roughness: 0.85 });
  const matBarrel = new THREE.MeshStandardMaterial({ color: 0x6b4423, roughness: 0.8 });
  const matWall = new THREE.MeshStandardMaterial({ color: 0xb8956a, roughness: 0.95 });
  const carColors = [0xb33a2b, 0xd8d2c4, 0x2c3a44, 0xc4a15a, 0x3d4a32].map(
    (color) => new THREE.MeshStandardMaterial({ color, roughness: 0.55, metalness: 0.15 })
  );
  const matGlass = new THREE.MeshStandardMaterial({ color: 0x9ec4d4, roughness: 0.25, metalness: 0.1 });
  // Shared by art colliders: not drawn, still raycastable (mesh.visible stays true).
  const matInvisible = new THREE.MeshBasicMaterial({ visible: false });
  if (/[?&]hitbox=2/.test(location.search)) Object.assign(matInvisible, { visible: true, wireframe: true, color: new THREE.Color(0xff8800) }); // world colliders too
  const BLDGS = [['bldg1', 0.3], ['bldg2', 0.3], ['bldg3', 0.2], ['bldg4', 0.2]];
  const ROOF_OK = { bldg1: 1, bldg2: 1, bldg3: 1 };
  // Poly Haven CC0 1k PBR (WebP) for building sides/backs/roofs and the background rows. World-scaled box UVs.
  const FULL = !LOWQ;
  const WALL_TEX = ['beige_wall_001', 'plastered_wall_02', 'brick_wall_02'];
  const shellMats = WALL_TEX.map((b) => pbrMaterial(b, { full: FULL, vertexColors: true }));
  const roofMat = pbrMaterial('concrete_wall_008', { full: FULL, vertexColors: true });
  const bgWindowMat = new THREE.MeshStandardMaterial({ color: 0x2a2520, roughness: 0.6 });
  // Grime: vertex colour darkens toward the ground and tints per building (dust/soot band at street level).
  function tint(g, r, gg, b, grime) {
    g.computeBoundingBox(); const y0 = g.boundingBox.min.y, y1 = g.boundingBox.max.y, pos = g.attributes.position;
    const col = new Float32Array(pos.count * 3);
    for (let i = 0; i < pos.count; i++) { const t = (pos.getY(i) - y0) / Math.max(0.01, y1 - y0); const d = 1 - grime * Math.max(0, 1 - t * 2.5) - grime * 0.35 * (1 - t);
      col[i * 3] = r * d; col[i * 3 + 1] = gg * d; col[i * 3 + 2] = b * d; }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3)); return g;
  }
  // Decals: one canvas atlas (oil stain, cracks, torn poster, grime streak), alpha-tested (no blending: the transparent
  // first-draw stall on software GL), polygon-offset, merged into one mesh per segment.
  const decalTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 512; const g = c.getContext('2d'); let sd = 11;
    const r = () => ((sd = (sd * 16807) % 2147483647) / 2147483647);
    // 0: oil stain
    for (let i = 0; i < 26; i++) { g.fillStyle = `rgba(28,22,16,${0.35 + r() * 0.4})`; g.beginPath(); g.ellipse(128 + (r() - 0.5) * 110, 128 + (r() - 0.5) * 90, 18 + r() * 50, 12 + r() * 36, r() * 3, 0, 7); g.fill(); }
    // 1: cracks
    g.strokeStyle = 'rgba(70,60,48,0.95)'; g.lineWidth = 1.6;
    for (let k = 0; k < 5; k++) { g.beginPath(); let x = 300 + r() * 170, y = 20 + r() * 60; g.moveTo(x, y); for (let i = 0; i < 9; i++) { x += (r() - 0.5) * 50; y += 18 + r() * 12; g.lineTo(Math.max(260, Math.min(500, x)), Math.min(250, y)); } g.stroke(); }
    // 2: torn poster
    g.fillStyle = '#c8b27a'; g.fillRect(30, 290, 196, 200); g.fillStyle = '#7a2a1e'; g.fillRect(44, 304, 168, 60); g.fillStyle = '#2b2a28';
    for (let i = 0; i < 6; i++) g.fillRect(48, 380 + i * 16, 80 + r() * 80, 7);
    g.globalCompositeOperation = 'destination-out'; for (let i = 0; i < 9; i++) { g.beginPath(); g.moveTo(30 + r() * 196, 490); g.lineTo(30 + r() * 196, 420 + r() * 60); g.lineTo(30 + r() * 196, 490); g.fill(); } g.globalCompositeOperation = 'source-over';
    // 3: grime streaks (rain/soot running down)
    for (let i = 0; i < 40; i++) { const x = 266 + r() * 236, w = 3 + r() * 12, h = 60 + r() * 180; g.fillStyle = `rgba(45,36,28,${0.35 + r() * 0.35})`; g.fillRect(x, 258, w, h); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
  })();
  const decalMat = new THREE.MeshStandardMaterial({ map: decalTex, alphaTest: 0.35, roughness: 0.95, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 });
  function decal(seg, cell, w, h, pos, normal) {
    const g = new THREE.PlaneGeometry(w, h); const uv = g.attributes.uv; const ox = (cell % 2) * 0.5, oy = cell < 2 ? 0.5 : 0;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, ox + uv.getX(i) * 0.5, oy + uv.getY(i) * 0.5);
    if (normal.y > 0.5) g.rotateX(-Math.PI / 2); else g.rotateY(Math.atan2(normal.x, normal.z));
    g.translate(pos.x + normal.x * 0.01, pos.y + normal.y * 0.004, pos.z + normal.z * 0.01);
    (seg._decals || (seg._decals = [])).push(g);
  }
  function boxAt(sx, sy, sz, x, y, z, tile) { const g = worldBox(sx, sy, sz, tile); g.translate(x, y, z); return g; }
  // Shell: sides, back and roof of a Meshy building get a textured box just inside the street facade, so no face shows
  // the smeared Meshy back texture from any angle. Height stops under the roof-shooter spot.
  function addShell(seg, _rng, side, box, roof, shellModel) {
    const rng = mulberry32(((box.min.z * 977) | 0) ^ (side * 0x5bd1e995) ^ seed);
    // Real wall plane: bbox front includes awnings/balconies, so raycast into the model from the street and sit the
    // shell front behind the deepest common wall hit (90th percentile), capped at 45% of the depth.
    const fx0 = side < 0 ? box.max.x : box.min.x, depthAll = box.max.x - box.min.x, hits = [];
    const dir = new THREE.Vector3(side, 0, 0);
    for (const y of [1.2, 2.4, 3.8, 5.5]) for (let k = 0; k < 7; k++) {
      const z = box.min.z + (0.12 + 0.76 * k / 6) * (box.max.z - box.min.z);
      _rc.set(new THREE.Vector3(fx0 - side * 0.5, Math.min(y, box.max.y - 0.3), z), dir); _rc.far = depthAll + 1;
      const h = _rc.intersectObject(shellModel, true)[0]; hits.push(h ? Math.abs(h.point.x - fx0) : depthAll); // a miss = open/see-through front
    }
    hits.sort((p, q) => p - q);
    const wallD = hits.length ? hits[Math.min(hits.length - 1, Math.floor(hits.length * 0.9))] : 0.6;
    const inset = Math.min(depthAll * 0.6, wallD + 0.3);
    const front = fx0 + side * inset;
    const back = side < 0 ? box.min.x - 0.06 : box.max.x + 0.06;
    const top = roof ? Math.min(box.max.y, roof.y - 0.25) : box.max.y * 0.985;
    const sx = Math.abs(front - back), sz = box.max.z - box.min.z + 0.12;
    const cx = (front + back) / 2, cz = (box.min.z + box.max.z) / 2;
    const k = (rng() * WALL_TEX.length) | 0, tr = 0.85 + rng() * 0.15;
    const walls = tint(boxAt(sx, top, sz, cx, top / 2, cz, 3), tr, tr * (0.95 + rng() * 0.05), tr * (0.88 + rng() * 0.1), 0.35);
    // grime streaks along the back and sides, an occasional poster on the street-visible side near the front
    const bx = back, nB = new THREE.Vector3(side, 0, 0);
    for (let i = 0; i < 0; i++) decal(seg, 3, 2.5 + rng() * 2, Math.min(top * 0.6, 3.5), new THREE.Vector3(bx, top - 1.6 - rng(), box.min.z + (0.2 + rng() * 0.6) * sz), nB);
    for (const zf of [box.min.z - 0.06, box.max.z + 0.06]) {
      const nz = new THREE.Vector3(0, 0, Math.sign(zf - cz));
      if (rng() < 0.5) decal(seg, 2, 0.8, 0.8, new THREE.Vector3(front + side * (0.6 + rng()), 1.6 + rng() * 0.4, zf), nz);
    }
    const m = new THREE.Mesh(walls, shellMats[k]); m.userData.ownGeo = true; m.castShadow = m.receiveShadow = true; seg.group.add(m);
    const cap = new THREE.Mesh(tint(boxAt(sx + 0.1, 0.12, sz + 0.1, cx, top + 0.04, cz, 4), 0.9, 0.88, 0.84, 0), roofMat); cap.receiveShadow = true; cap.userData.ownGeo = true; seg.group.add(cap);
  }
  // Background: 2-3 layered rows of textured low-poly buildings behind each side (not a flat skyline), merged per
  // material per segment. Rows step back and up; window bands on the street-facing side. Ultra 1 row, Low 2, High 3.
  const ROWS = [[20, 5, 10], [31, 7, 14], [44, 9, 20]];
  function addBackdrop(seg, rng, side, oz) {
    const nRows = ULTRA ? 1 : LOWQ ? 2 : 3;
    const byMat = shellMats.map(() => []); const roofs = [], wins = [];
    for (let r = 0; r < nRows; r++) {
      const [x0, hMin, hMax] = ROWS[r];
      let z = oz + rng() * 4;
      while (z > oz - SEG_LEN) {
        const lot = Math.min(z - (oz - SEG_LEN), 6 + rng() * 9); if (lot < 2) break;
        if (rng() < 0.12) { z -= lot * 0.5; continue; }
        const depth = 7 + rng() * 6, h = hMin + rng() * (hMax - hMin);
        const cx = side * (x0 + depth / 2 + rng() * 2), cz = z - lot / 2;
        const k = (rng() * WALL_TEX.length) | 0, tr = 0.78 + rng() * 0.22;
        byMat[k].push(tint(boxAt(depth, h, lot - 0.3, cx, h / 2, cz, 3), tr, tr * 0.96, tr * 0.9, 0.3));
        roofs.push(tint(boxAt(depth + 0.3, 0.4, lot, cx, h + 0.2, cz, 4), 0.85, 0.82, 0.78, 0));
        if (rng() < 0.3) roofs.push(tint(boxAt(1.4, 1.2, 1.4, cx + (rng() - 0.5) * depth * 0.5, h + 1, cz + (rng() - 0.5) * lot * 0.5, 2), 0.8, 0.8, 0.78, 0));
        if (r < 2) {
          const fx = cx - side * (depth / 2 + 0.02), floors = Math.max(1, Math.floor((h - 1) / 3.1)), nw = Math.max(1, Math.floor(lot / 2.6));
          for (let f = 0; f < floors; f++) for (let w = 0; w < nw; w++) {
            if (rng() < 0.2) continue;
            const g = new THREE.PlaneGeometry(0.9, 1.3); g.rotateY(side < 0 ? Math.PI / 2 : -Math.PI / 2);
            g.translate(fx, 1.9 + f * 3.1, cz - lot / 2 + (w + 0.5) * (lot / nw)); g.deleteAttribute('uv'); g.deleteAttribute('normal'); g.computeVertexNormals(); wins.push(g);
          }
        }
        z -= lot;
      }
    }
    const add = (list, mat, shadow) => { if (!list.length) return; const g = mergeGeometries(list.map((x) => x.index ? x.toNonIndexed() : x)); if (!g) return;
      const m = new THREE.Mesh(g, mat); m.receiveShadow = true; m.castShadow = false; m.userData.backdrop = true; m.userData.ownGeo = true; seg.group.add(m); };
    byMat.forEach((l, i) => add(l, shellMats[i]));
    add(roofs, roofMat); add(wins, bgWindowMat);
  }

  scene.background = new THREE.Color(0x8ec8ea);
  scene.fog = new THREE.FogExp2(0xdccdaa, Q.fog); // matched to the sky horizon band so far rows melt into haze
  // Endless desert floor that follows the player, so side views and alley gaps never show sky below the road.
  const desertMat = new THREE.MeshStandardMaterial({ color: 0xc8b48a, roughness: 1, metalness: 0 });
  const desertGeo = new THREE.PlaneGeometry(800, 800);
  desertGeo.setAttribute('uv2', desertGeo.attributes.uv);
  const desert = new THREE.Mesh(desertGeo, desertMat);
  desert.rotation.x = -Math.PI / 2; desert.position.y = -0.1; desert.receiveShadow = false; scene.add(desert);

  {
    // Diffuse on every tier (nothing untextured from any angle); normal + ARM on High only.
    const full = art.tier === 'high' && !LOWQ;
    upgradeMaterial(desertMat, 'sand_01', 48, 48, full);
    upgradeMaterial(matRoad, 'asphalt_01', 4, 18, full);
    upgradeMaterial(matSand, 'sand_01', 4, 14, full);
    upgradeMaterial(matPlaster, 'dirty_concrete', 2, 3, full);
    upgradeMaterial(matWall, 'dirty_concrete', 1, 2, full);
  }

  const hemi = new THREE.HemisphereLight(0xbcd8ee, 0xb8915c, 0.75); // warmer sand bounce, slightly less flat fill
  scene.add(hemi);

  const sun = new THREE.DirectionalLight(0xffeccb, 2.8); // late-morning desert sun: warmer, stronger key for contrast
  sun.position.set(28, 48, 16);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 160;
  sun.shadow.camera.left = -36;
  sun.shadow.camera.right = 36;
  sun.shadow.camera.top = 36;
  sun.shadow.camera.bottom = -36;
  sun.shadow.bias = -0.0004;
  scene.add(sun);
  scene.add(sun.target);

  const segments = [];
  const colliders = [];

  function addBox(seg, mat, x, y, z, sx, sy, sz, opts = {}) {
    const m = new THREE.Mesh(boxGeo, mat);
    m.scale.set(sx, sy, sz);
    m.position.set(x, y, z);
    m.castShadow = opts.cast !== false;
    m.receiveShadow = true;
    m.userData.segId = seg.id;
    seg.group.add(m);
    if (opts.collide !== false) {
      colliders.push(m);
      seg.owned.push(m);
    }
    return m;
  }

  function addInvisibleBox(seg, x, y, z, sx, sy, sz) {
    const m = addBox(seg, matInvisible, x, y, z, sx, sy, sz, { cast: false });
    m.visible = true;
    return m;
  }

  // Spawn separation: footprint (half-extents hx,hz + margin) must not touch any solid prop already in this segment.
  const _fb = new THREE.Box3();
  const SOLID = new Set(['car', 'carcab', 'barrel', 'lowwall', 'prop', 'sandbag']);
  function footFree(seg, x, z, hx, hz, margin = 0.35) {
    for (const m of seg.owned) {
      if (!m.isMesh || !SOLID.has(m.name)) continue;
      _fb.setFromObject(m);
      if (x + hx + margin > _fb.min.x && x - hx - margin < _fb.max.x && z + hz + margin > _fb.min.z && z - hz - margin < _fb.max.z) return false;
    }
    return true;
  }
  function overlapCount() { // test hook: pairs of overlapping solid props across live segments
    let n = 0; const a = new THREE.Box3(), b = new THREE.Box3();
    const solids = colliders.filter((m) => SOLID.has(m.name) && m.name !== 'carcab');
    for (let i = 0; i < solids.length; i++) { a.setFromObject(solids[i]); a.expandByScalar(-0.02);
      for (let j = i + 1; j < solids.length; j++) { b.setFromObject(solids[j]); if (a.intersectsBox(b) && !(solids[i].name === 'car' && solids[j].name === 'carcab')) { n++; overlapCount.last = [solids[i].name, solids[j].name, a.min.x.toFixed(1), a.min.z.toFixed(1), b.min.x.toFixed(1), b.min.z.toFixed(1)]; } } }
    return n;
  }

  function useProp(name) {
    return art.tier === 'high' && art.done && !!art.get(name);
  }

  function buildingsReady() {
    if (art.tier !== 'high' || !art.done) return false;
    for (let i = 0; i < BLDGS.length; i++) if (art.get(BLDGS[i][0])) return true;
    return false;
  }

  function pickBuilding(rng) {
    let total = 0;
    const opts = [];
    for (let i = 0; i < BLDGS.length; i++) {
      if (art.get(BLDGS[i][0])) {
        opts.push(BLDGS[i]);
        total += BLDGS[i][1];
      }
    }
    let r = rng() * total;
    for (let i = 0; i < opts.length; i++) {
      r -= opts[i][1];
      if (r <= 0) return opts[i][0];
    }
    return opts[opts.length - 1][0];
  }

  // Low cover: sandbags when the prop is loaded, same box collider either way.
  function addLowWall(seg, x, y, z, sx, sy, sz) {
    if (useProp('prop_sandbags')) {
      const obj = art.staticInstance('prop_sandbags');
      art.fitToBox(obj, sx, sy, sz, { keepAspect: true, alignLong: true, longStretch: 1.5 });
      obj.position.x += x;
      obj.position.z += z;
      seg.group.add(obj);
      { const _c = addInvisibleBox(seg, x, y, z, sx, sy, sz); _c.name = 'lowwall'; return _c; }
    }
    { const w = addBox(seg, matWall, x, y, z, sx, sy, sz); w.name = 'lowwall'; return w; }
  }

  function maybeFrontWall(seg, rng, side, cz, lot) {
    if (rng() < 0.45) {
      const wz = cz + (rng() - 0.5) * lot * 0.5;
      const wallLen = 2.2 + rng() * 2;
      addLowWall(seg, side * 5.5, 0.35, wz, 0.4, 0.7, wallLen);
      seg.coverPoints.push({ pos: new THREE.Vector3(side * 5.5, 0.9, wz), type: 'wall' });
    }
  }

  let sign2Mat = null;
  let signMat = null;
  function shopSign(raw) {
    if (!signMat) {
      const c = document.createElement('canvas'); c.width = 512; c.height = 160; const g = c.getContext('2d');
      g.fillStyle = '#e9e1cf'; g.fillRect(0, 0, 512, 160); g.fillStyle = '#7a1e14'; g.fillRect(0, 0, 512, 10); g.fillRect(0, 150, 512, 10);
      g.fillStyle = '#2a2420'; g.textAlign = 'center'; g.font = 'bold 64px sans-serif'; g.fillText('SOUK', 256, 76);
      g.font = 'bold 34px sans-serif'; g.fillText('MARKET · سوق', 256, 128);
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
      signMat = new THREE.MeshStandardMaterial({ map: t, roughness: 0.9, polygonOffset: true, polygonOffsetFactor: -2 });
    }
    if (!sign2Mat) { // second board baked as gibberish 'IVNEBIS 1961' -> readable 'CAFÉ · مقهى'
      const c = document.createElement('canvas'); c.width = 384; c.height = 160; const g = c.getContext('2d');
      g.fillStyle = '#d8d2c4'; g.fillRect(0, 0, 384, 160); g.strokeStyle = '#3b5e3a'; g.lineWidth = 10; g.strokeRect(5, 5, 374, 150);
      g.fillStyle = '#2a2420'; g.textAlign = 'center'; g.font = 'bold 60px sans-serif'; g.fillText('CAFÉ', 192, 80);
      g.font = 'bold 34px sans-serif'; g.fillText('مقهى', 192, 130);
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
      sign2Mat = new THREE.MeshStandardMaterial({ map: t, roughness: 0.9, polygonOffset: true, polygonOffsetFactor: -2 });
    }
    const w = raw.max.x - raw.min.x, h = raw.max.y - raw.min.y, d = raw.max.z - raw.min.z;
    const grp = new THREE.Group();
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.24, h * 0.19), signMat);
    m.position.set(raw.min.x + w * 0.2, raw.min.y + h * 0.765, raw.max.z - d * 0.18);
    const p2 = (window.SS && window.SS.sign2) || [0.665, 0.785, 0.1, 0.3, 0.3];
    const m2 = new THREE.Mesh(new THREE.PlaneGeometry(w * p2[3], h * p2[4]), sign2Mat);
    m2.position.set(raw.min.x + w * p2[0], raw.min.y + h * p2[1], raw.max.z - d * p2[2]);
    grp.add(m, m2);
    return grp;
  }
  // Front (+Z) faces the street. Width (local X) becomes the lot length along Z.
  function placeArtBuilding(seg, rng, name, side, zCursor, lot, doors) {
    const model = art.staticInstance(name);
    model.position.set(0, 0, 0);
    model.rotation.set(0, 0, 0);
    model.scale.set(1, 1, 1);
    model.updateMatrixWorld(true);
    const raw = new THREE.Box3().setFromObject(model);
    const sizeX = Math.max(1e-4, raw.max.x - raw.min.x);
    const sizeY = Math.max(1e-4, raw.max.y - raw.min.y);
    const s = (lot - 0.35) / sizeX;
    let yMul = 1;
    const h = sizeY * s;
    if (h < 3.6) yMul = Math.min(1.12, 3.6 / h); // max 12% vertical stretch (tester: stretched facades)
    else if (h > 11) yMul = Math.max(1 / 1.12, 11 / h);
    model.scale.set(s, s * yMul, s);
    // bldg3's Meshy texture bakes AI-gibberish shop lettering ('NAIVATS'); the glyphs are not mirrored, so a UV flip
    // would make it worse. Cover the main sign board with a readable painted sign instead.
    if (name === 'bldg3') model.add(shopSign(raw));
    model.rotation.y = side < 0 ? Math.PI / 2 : -Math.PI / 2;
    model.updateMatrixWorld(true);
    let box = new THREE.Box3().setFromObject(model);
    const facadeX = side * 6.2;
    const frontX = side < 0 ? box.max.x : box.min.x;
    const cz = zCursor - lot * 0.5;
    model.position.x += facadeX - frontX;
    model.position.y += -box.min.y;
    model.position.z += cz - (box.min.z + box.max.z) * 0.5;
    model.updateMatrixWorld(true);
    box = new THREE.Box3().setFromObject(model);
    seg.group.add(model);
    // Collider = the real building mass, not the bbox: the bbox front includes awnings/balconies and its top is above
    // the roof, so door-front and roof enemies stood INSIDE the invisible box and every shot hit the box (false misses).
    const roofEarly = ROOF_OK[name] ? findRoof(model, box, side, facadeX, cz) : null;
    {
      const fx0 = side < 0 ? box.max.x : box.min.x, depthAll = box.max.x - box.min.x, d = [];
      const dir = new THREE.Vector3(side, 0, 0);
      for (const y of [1.2, 2.4, 3.8]) for (let k = 0; k < 7; k++) {
        const z = box.min.z + (0.12 + 0.76 * k / 6) * (box.max.z - box.min.z);
        _rc.set(new THREE.Vector3(fx0 - side * 0.5, Math.min(y, box.max.y - 0.3), z), dir); _rc.far = depthAll + 1;
        const h = _rc.intersectObject(model, true)[0]; d.push(h ? Math.abs(h.point.x - fx0) : depthAll);
      }
      d.sort((p, q) => p - q);
      const wallIn = Math.min(depthAll * 0.6, Math.max(0, d[Math.floor(d.length * 0.5)] - 0.05));
      const front = fx0 + side * wallIn, back = side < 0 ? box.min.x : box.max.x;
      const top = roofEarly ? Math.min(box.max.y, roofEarly.y - 0.17) : box.max.y;
      const col = addInvisibleBox(seg, (front + back) * 0.5, (box.min.y + top) * 0.5, (box.min.z + box.max.z) * 0.5, Math.abs(back - front), top - box.min.y, box.max.z - box.min.z); col.name = 'building';
      col.userData.building = true;
    }
    const spanZ = Math.max(0.5, box.max.z - box.min.z);
    const doorZ = box.min.z + (0.12 + rng() * 0.76) * spanZ;
    doors.push(doorZ);
    seg.coverPoints.push({
      pos: new THREE.Vector3(facadeX - side * 0.4, 1.2, doorZ),
      type: 'door',
    });
    if (ROOF_OK[name]) {
      // Real roof only: raycast down onto the model just behind the facade; need a flat hit (normal.y > 0.8) near the top.
      const roof = roofEarly;
      if (roof) seg.coverPoints.push({ pos: roof, type: 'roof' });
      addShell(seg, rng, side, box, roof, model);
    } else addShell(seg, rng, side, box, null, model);
    maybeFrontWall(seg, rng, side, cz, lot);
  }

  const _rc = new THREE.Raycaster(); const _down = new THREE.Vector3(0, -1, 0);
  function findRoof(model, box, side, facadeX, cz) {
    const h = box.max.y - box.min.y; let best = null;
    for (const inset of [0.8, 1.3, 2.0, 2.8]) for (const dz of [0, -1.2, 1.2]) {
      const x = facadeX + side * inset, z = cz + dz;
      _rc.set(new THREE.Vector3(x, box.max.y + 2, z), _down); _rc.far = h + 3;
      const hit = _rc.intersectObject(model, true)[0];
      if (!hit || !hit.face) continue;
      const n = hit.face.normal.clone().transformDirection(hit.object.matrixWorld);
      if (n.y < 0.8 || hit.point.y < box.min.y + h * 0.55) continue;
      if (!best || hit.point.y > best.y) best = new THREE.Vector3(x, hit.point.y + 0.02, z);
    }
    return best ? (best.y += 0.15, best) : null; // enemies place roof feet at pos.y - 0.15
  }
  function nearDoor(z, half, doors) {
    const need = half + 0.8;
    for (let i = 0; i < doors.length; i++) {
      if (Math.abs(doors[i] - z) < need) return true;
    }
    return false;
  }

  function placeDecor(seg, rng, side, oz, doors) {
    if (art.tier !== 'high' || !art.done) return;
    const choices = [];
    if (art.get('prop_crates')) choices.push(['prop_crates', 1.4, 1.6, 1.4]);
    if (art.get('prop_cart')) choices.push(['prop_cart', 1.6, 1.6, 2.6]);
    if (!choices.length) return;
    if (rng() >= 0.5) return;
    const choice = choices[(rng() * choices.length) | 0];
    const obj = art.staticInstance(choice[0]);
    const dims = art.fitToBox(obj, choice[1], choice[2], choice[3], { keepAspect: true, alignLong: true });
    const half = dims.z * 0.5;
    let z = null;
    const x = side * (5.3 + rng() * 0.6);
    for (let attempt = 0; attempt < 8; attempt++) {
      const tryZ = oz - 4 - rng() * (SEG_LEN - 8);
      if (!nearDoor(tryZ, half, doors) && footFree(seg, x, tryZ, dims.x * 0.5, half)) { z = tryZ; break; }
    }
    if (z == null) return;
    obj.position.x += x;
    obj.position.z += z;
    seg.group.add(obj);
    (addInvisibleBox(seg, x, dims.y * 0.5, z, dims.x, dims.y, dims.z)).name = 'prop';
    seg.coverPoints.push({
      pos: new THREE.Vector3(x - side * (dims.x * 0.5), 0.9, z),
      type: 'wall',
    });
  }

  function fill(seg) {
    const set = new Set(seg.owned);
    for (let i = colliders.length - 1; i >= 0; i--) {
      if (set.has(colliders[i])) colliders.splice(i, 1);
    }
    seg.owned.length = 0;
    seg.coverPoints.length = 0;
    while (seg.group.children.length) { const ch = seg.group.children[0]; if (ch.userData.ownGeo && ch.geometry) ch.geometry.dispose(); seg.group.remove(ch); }

    const rng = mulberry32((seed ^ Math.imul(seg.gen + 1, 0x9e3779b1) ^ Math.imul(seg.id + 1, 0x85ebca6b)) >>> 0);
    const oz = seg.originZ;

    addBox(seg, matRoad, 0, -0.05, oz - SEG_LEN / 2, 10, 0.1, SEG_LEN, { cast: false });
    addBox(seg, matSand, -10.5, -0.02, oz - SEG_LEN / 2, 12, 0.08, SEG_LEN, { cast: false });
    addBox(seg, matSand, 10.5, -0.02, oz - SEG_LEN / 2, 12, 0.08, SEG_LEN, { cast: false });

    buildSide(seg, rng, -1, oz);
    buildSide(seg, rng, 1, oz);
    // Separate RNG so the backdrop never shifts gameplay layout (covers, cars, barrels).
    const brng = mulberry32((seed ^ Math.imul(seg.gen + 7, 0x27d4eb2d) ^ Math.imul(seg.id + 3, 0x165667b1)) >>> 0);
    addBackdrop(seg, brng, -1, oz);
    addBackdrop(seg, brng, 1, oz);
    const up = new THREE.Vector3(0, 1, 0);
    for (let i = 0, n = 5 + ((brng() * 4) | 0); i < n; i++) decal(seg, brng() < 0.7 ? 0 : 1, 1.0 + brng() * 1.4, 0.9 + brng() * 1.1, new THREE.Vector3((brng() - 0.5) * 8.5, 0.0, oz - brng() * SEG_LEN), up);
    if (seg._decals && seg._decals.length) {
      const g = mergeGeometries(seg._decals.map((x) => x.index ? x.toNonIndexed() : x)); seg._decals.forEach((x) => x.dispose()); seg._decals = null;
      if (g) { const dm = new THREE.Mesh(g, decalMat); dm.receiveShadow = true; dm.userData.ownGeo = true; seg.group.add(dm); }
    }

    const cars = 1 + (rng() * 3) | 0;
    for (let i = 0; i < cars; i++) {
      const side = rng() < 0.5 ? -1 : 1;
      let z = oz - 6 - rng() * (SEG_LEN - 12); const x = side * (3.2 + rng() * 0.6);
      let ok = footFree(seg, x, z, 1.0, 2.3);
      for (let t = 0; t < 6 && !ok; t++) { z = oz - 6 - rng() * (SEG_LEN - 12); ok = footFree(seg, x, z, 1.0, 2.3); }
      if (ok) addCar(seg, rng, x, z);
    }

    const barrels = 2 + (rng() * 4) | 0;
    for (let i = 0; i < barrels; i++) {
      const side = rng() < 0.5 ? -1 : 1;
      let z = oz - 4 - rng() * (SEG_LEN - 8);
      const x = side * (5.4 + rng() * 1.2);
      let ok = footFree(seg, x, z, 0.36, 0.36);
      for (let t = 0; t < 6 && !ok; t++) { z = oz - 4 - rng() * (SEG_LEN - 8); ok = footFree(seg, x, z, 0.36, 0.36); }
      if (!ok) continue;
      let m;
      if (useProp('prop_drum')) {
        const drum = art.staticInstance('prop_drum');
        art.fitToBox(drum, 0.62, 0.9, 0.62, { keepAspect: true, alignLong: true });
        drum.position.x += x;
        drum.position.z += z;
        seg.group.add(drum);
        m = new THREE.Mesh(barrelGeo, matInvisible); m.scale.set(0.88, 1, 0.88); // proxy inside the drum silhouette
        m.castShadow = false;
        m.visible = true;
      } else {
        m = new THREE.Mesh(barrelGeo, matBarrel);
        m.castShadow = true;
      }
      m.position.set(x, 0.45, z); m.name = 'barrel';
      m.receiveShadow = true;
      m.userData.segId = seg.id;
      seg.group.add(m);
      colliders.push(m);
      seg.owned.push(m);
      seg.coverPoints.push({ pos: new THREE.Vector3(x, 0.7, z), type: 'barrel' });
    }
  }

  function buildSide(seg, rng, side, oz) {
    const doors = [];
    let z = oz - 3;
    const end = oz - SEG_LEN + 2;
    while (z - 6 > end) {
      const lot = 8 + rng() * 8;
      if (z - lot < end) break;
      if (rng() < 0.2) {
        const gap = 4 + rng() * 3;
        seg.coverPoints.push({
          pos: new THREE.Vector3(side * 7.2, 1.2, z - gap * 0.5),
          type: 'alley',
        });
        if (rng() < 0.6) {
          addLowWall(seg, side * 6.2, 0.35, z - gap * 0.5, 0.35, 0.7, Math.min(gap - 0.5, 3.5));
          seg.coverPoints.push({
            pos: new THREE.Vector3(side * 6.2, 1.0, z - gap * 0.5),
            type: 'wall',
          });
        }
        z -= gap;
        continue;
      }
      // Extra roll only once art is in, so low tier and the pre-load fill stay identical.
      if (buildingsReady() && rng() < 1.01) {
        placeArtBuilding(seg, rng, pickBuilding(rng), side, z, lot, doors);
        z -= lot;
        continue;
      }
      const depth = 6 + rng() * 3;
      const floors = rng() < 0.4 ? 2 : 3;
      const h = floors * 3.15;
      const cx = side * (6.2 + depth * 0.5);
      const cz = z - lot * 0.5;
      addBox(seg, matPlaster, cx, h * 0.5, cz, depth, h, lot - 0.35);
      addBox(seg, matPlaster, cx, h + 0.28, cz, depth + 0.35, 0.55, lot, { collide: false });
      const facadeX = cx - side * (depth * 0.5);
      // Roof spot sits on the street-side parapet edge (not the roof centre, which put enemies inside the building).
      seg.coverPoints.push({ pos: new THREE.Vector3(facadeX + side * 0.45, h + 0.7, cz), type: 'roof' });
      const doorZ = cz + (rng() - 0.5) * lot * 0.3;
      doors.push(doorZ);
      addBox(seg, matDark, facadeX - side * 0.12, 1.15, doorZ, 0.28, 2.3, 1.15);
      seg.coverPoints.push({
        pos: new THREE.Vector3(facadeX - side * 0.4, 1.2, doorZ),
        type: 'door',
      });

      if (rng() < 0.65) {
        const aw = rng() < 0.5 ? matAwning : matAwningAlt;
        addBox(seg, aw, facadeX - side * 1.15, 2.55, doorZ, 2.1, 0.08, 2.4, { collide: false });
      }

      for (let f = 0; f < floors; f++) {
        const wy = 1.7 + f * 3.15;
        const count = Math.max(2, Math.round(lot / 4));
        for (let w = 0; w < count; w++) {
          const wz = cz - lot * 0.38 + ((w + 0.5) / count) * lot * 0.76;
          if (Math.abs(wz - doorZ) < 0.9 && f === 0) continue;
          addBox(seg, matDark, facadeX - side * 0.1, wy, wz, 0.22, 1.15, 0.85);
          seg.coverPoints.push({
            pos: new THREE.Vector3(facadeX - side * 0.45, wy, wz),
            type: 'window',
          });
        }
      }

      maybeFrontWall(seg, rng, side, cz, lot);

      z -= lot;
    }
    placeDecor(seg, rng, side, oz, doors);
  }

  function addCar(seg, rng, x, z) {
    const bodyMat = carColors[(rng() * carColors.length) | 0];
    const yaw = rng() < 0.5 ? 0 : Math.PI;
    if (useProp('prop_burnedcar')) {
      const jitter = (rng() - 0.5) * 0.3;
      const obj = art.staticInstance('prop_burnedcar');
      art.fitToBox(obj, 1.8, 1.5, 4.3, { keepAspect: true, alignLong: true });
      const pivot = new THREE.Group();
      pivot.add(obj);
      pivot.rotation.y = yaw + jitter;
      pivot.position.set(x, 0, z);
      seg.group.add(pivot);
      (addInvisibleBox(seg, x, 0.48, z, 1.75, 0.62, 4.15)).name = 'car';
      const cabin = addInvisibleBox(seg, x, 1.05, z + 0.15, 1.5, 0.52, 2.0); cabin.name = 'carcab';
      cabin.rotation.y = yaw;
    } else {
      addBox(seg, bodyMat, x, 0.48, z, 1.75, 0.62, 4.15);
      const cabin = addBox(seg, matGlass, x, 1.05, z + 0.15, 1.5, 0.52, 2.0);
      cabin.rotation.y = yaw;
    }
    seg.coverPoints.push({ pos: new THREE.Vector3(x, 1.15, z), type: 'car' });
  }

  for (let i = 0; i < SEG_COUNT; i++) {
    const group = new THREE.Group();
    scene.add(group);
    const seg = {
      id: i,
      gen: 0,
      originZ: START_Z - i * SEG_LEN,
      group,
      coverPoints: [],
      owned: [],
    };
    segments.push(seg);
    fill(seg);
  }

  let playerZ = 0;

  // Art loads after the first fill. Before Play, rebuild every segment; during a run, only segments whose near end is > 25 m ahead.
  art.onReady(() => {
    if (art.tier !== 'high') return;
    const ss = typeof window !== 'undefined' ? window.SS : null;
    const running = !!(ss && ss.running);
    const pz = (ss && ss.camera) ? ss.camera.position.z : playerZ;
    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      if (!running || seg.originZ < pz - 25) fill(seg);
    }
  });

  function update(playerZIn) {
    playerZ = playerZIn;
    desert.position.z = playerZ;
    sun.position.set(26, 46, playerZ + 18);
    sun.target.position.set(0, 0, playerZ - 30);
    sun.target.updateMatrixWorld();

    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      // distance culling: only segments overlapping [player-ahead, player+behind] are drawn
      seg.group.visible = seg.originZ - SEG_LEN < playerZ + DRAW_BEHIND && seg.originZ > playerZ - Q.drawAhead;
      if (playerZ < seg.originZ - SEG_LEN - 8) {
        seg.originZ -= SEG_COUNT * SEG_LEN;
        seg.gen += 1;
        const tf = performance.now(); fill(seg); const dtf = performance.now() - tf;
        if (typeof window !== 'undefined' && dtf > 40) (window.SS_SPIKES = window.SS_SPIKES || []).push(['fill', Math.round(tf), Math.round(dtf)]);
      }
    }
  }

  function reset(playerZ) {
    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      seg.gen = 0;
      seg.originZ = START_Z - i * SEG_LEN;
      fill(seg);
    }
    update(playerZ == null ? 0 : playerZ);
  }

  return { update, reset, segments, colliders, sun, overlapCount, footFree };
}
