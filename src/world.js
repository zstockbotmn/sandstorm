import * as THREE from 'three';
import { art } from './art.js';

const SEG_LEN = 60;
const SEG_COUNT = 5;
const START_Z = 24;      // first segment starts behind the spawn so the run opens in a street, not open desert
import { Q } from './quality.js';
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
function upgradeMaterial(mat, base, repeatX, repeatY) {
  const loader = new THREE.TextureLoader();
  const root = 'assets/textures/' + base;
  loader.load(root + '_diff.webp', (tex) => {
    prepTex(tex, repeatX, repeatY, true);
    mat.map = tex;
    mat.color.set(0xffffff);
    mat.needsUpdate = true;
  });
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
  const BLDGS = [['bldg1', 0.3], ['bldg2', 0.3], ['bldg3', 0.2], ['bldg4', 0.2]];
  const ROOF_OK = { bldg1: 1, bldg2: 1, bldg3: 1 };

  scene.background = new THREE.Color(0x8ec8ea);
  scene.fog = new THREE.FogExp2(0xd2c4a2, Q.fog);
  // Endless desert floor that follows the player, so side views and alley gaps never show sky below the road.
  const desertMat = new THREE.MeshStandardMaterial({ color: 0xc8b48a, roughness: 1, metalness: 0 });
  const desertGeo = new THREE.PlaneGeometry(800, 800);
  desertGeo.setAttribute('uv2', desertGeo.attributes.uv);
  const desert = new THREE.Mesh(desertGeo, desertMat);
  desert.rotation.x = -Math.PI / 2; desert.position.y = -0.1; desert.receiveShadow = false; scene.add(desert);

  if (art.tier === 'high') {
    upgradeMaterial(desertMat, 'sand_01', 48, 48);
    upgradeMaterial(matRoad, 'asphalt_01', 4, 18);
    upgradeMaterial(matSand, 'sand_01', 4, 14);
    upgradeMaterial(matPlaster, 'dirty_concrete', 2, 3);
    upgradeMaterial(matWall, 'dirty_concrete', 1, 2);
  }

  const hemi = new THREE.HemisphereLight(0xb7ddf5, 0xc4a06a, 0.85);
  scene.add(hemi);

  const sun = new THREE.DirectionalLight(0xfff3d4, 2.5);
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
      return addInvisibleBox(seg, x, y, z, sx, sy, sz);
    }
    return addBox(seg, matWall, x, y, z, sx, sy, sz);
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
    addInvisibleBox(
      seg,
      (box.min.x + box.max.x) * 0.5,
      (box.min.y + box.max.y) * 0.5,
      (box.min.z + box.max.z) * 0.5,
      box.max.x - box.min.x,
      box.max.y - box.min.y,
      box.max.z - box.min.z
    );
    const spanZ = Math.max(0.5, box.max.z - box.min.z);
    const doorZ = box.min.z + (0.12 + rng() * 0.76) * spanZ;
    doors.push(doorZ);
    seg.coverPoints.push({
      pos: new THREE.Vector3(facadeX - side * 0.4, 1.2, doorZ),
      type: 'door',
    });
    if (ROOF_OK[name]) {
      seg.coverPoints.push({
        pos: new THREE.Vector3(facadeX + side * 0.45, box.max.y + 0.15, cz),
        type: 'roof',
      });
    }
    maybeFrontWall(seg, rng, side, cz, lot);
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
    for (let attempt = 0; attempt < 8; attempt++) {
      const tryZ = oz - 4 - rng() * (SEG_LEN - 8);
      if (!nearDoor(tryZ, half, doors)) { z = tryZ; break; }
    }
    if (z == null) return;
    const x = side * (5.3 + rng() * 0.6);
    obj.position.x += x;
    obj.position.z += z;
    seg.group.add(obj);
    addInvisibleBox(seg, x, dims.y * 0.5, z, dims.x, dims.y, dims.z);
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
    while (seg.group.children.length) seg.group.remove(seg.group.children[0]);

    const rng = mulberry32((seed ^ Math.imul(seg.gen + 1, 0x9e3779b1) ^ Math.imul(seg.id + 1, 0x85ebca6b)) >>> 0);
    const oz = seg.originZ;

    addBox(seg, matRoad, 0, -0.05, oz - SEG_LEN / 2, 10, 0.1, SEG_LEN, { cast: false });
    addBox(seg, matSand, -10.5, -0.02, oz - SEG_LEN / 2, 12, 0.08, SEG_LEN, { cast: false });
    addBox(seg, matSand, 10.5, -0.02, oz - SEG_LEN / 2, 12, 0.08, SEG_LEN, { cast: false });

    buildSide(seg, rng, -1, oz);
    buildSide(seg, rng, 1, oz);

    const cars = 1 + (rng() * 3) | 0;
    for (let i = 0; i < cars; i++) {
      const side = rng() < 0.5 ? -1 : 1;
      const z = oz - 6 - rng() * (SEG_LEN - 12);
      addCar(seg, rng, side * (3.2 + rng() * 0.6), z);
    }

    const barrels = 2 + (rng() * 4) | 0;
    for (let i = 0; i < barrels; i++) {
      const side = rng() < 0.5 ? -1 : 1;
      const z = oz - 4 - rng() * (SEG_LEN - 8);
      const x = side * (5.4 + rng() * 1.2);
      let m;
      if (useProp('prop_drum')) {
        const drum = art.staticInstance('prop_drum');
        art.fitToBox(drum, 0.62, 0.9, 0.62, { keepAspect: true, alignLong: true });
        drum.position.x += x;
        drum.position.z += z;
        seg.group.add(drum);
        m = new THREE.Mesh(barrelGeo, matInvisible);
        m.castShadow = false;
        m.visible = true;
      } else {
        m = new THREE.Mesh(barrelGeo, matBarrel);
        m.castShadow = true;
      }
      m.position.set(x, 0.45, z);
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
      addInvisibleBox(seg, x, 0.48, z, 1.75, 0.62, 4.15);
      const cabin = addInvisibleBox(seg, x, 1.05, z + 0.15, 1.5, 0.52, 2.0);
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

  return { update, reset, segments, colliders, sun };
}
