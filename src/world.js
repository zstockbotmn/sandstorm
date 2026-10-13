import * as THREE from 'three';

const SEG_LEN = 60;
const SEG_COUNT = 5;

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
const barrelGeo = new THREE.CylinderGeometry(0.32, 0.36, 0.9, 8);

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

  scene.background = new THREE.Color(0x8ec8ea);
  scene.fog = new THREE.FogExp2(0xd2c4a2, 0.016);

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
      const m = new THREE.Mesh(barrelGeo, matBarrel);
      m.position.set(x, 0.45, z);
      m.castShadow = true;
      m.receiveShadow = true;
      m.userData.segId = seg.id;
      seg.group.add(m);
      colliders.push(m);
      seg.owned.push(m);
      seg.coverPoints.push({ pos: new THREE.Vector3(x, 0.7, z), type: 'barrel' });
    }
  }

  function buildSide(seg, rng, side, oz) {
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
          addBox(seg, matWall, side * 6.2, 0.45, z - gap * 0.5, 0.35, 0.9, Math.min(gap - 0.5, 3.5));
          seg.coverPoints.push({
            pos: new THREE.Vector3(side * 6.2, 1.0, z - gap * 0.5),
            type: 'wall',
          });
        }
        z -= gap;
        continue;
      }
      const depth = 6 + rng() * 3;
      const floors = rng() < 0.4 ? 2 : 3;
      const h = floors * 3.15;
      const cx = side * (6.2 + depth * 0.5);
      const cz = z - lot * 0.5;
      addBox(seg, matPlaster, cx, h * 0.5, cz, depth, h, lot - 0.35);
      addBox(seg, matPlaster, cx, h + 0.28, cz, depth + 0.35, 0.55, lot, { collide: false });
      seg.coverPoints.push({ pos: new THREE.Vector3(cx, h + 0.7, cz), type: 'roof' });

      const facadeX = cx - side * (depth * 0.5);
      const doorZ = cz + (rng() - 0.5) * lot * 0.3;
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

      if (rng() < 0.45) {
        const wz = cz + (rng() - 0.5) * lot * 0.5;
        addBox(seg, matWall, side * 5.5, 0.4, wz, 0.4, 0.8, 2.2 + rng() * 2);
        seg.coverPoints.push({ pos: new THREE.Vector3(side * 5.5, 0.9, wz), type: 'wall' });
      }

      z -= lot;
    }
  }

  function addCar(seg, rng, x, z) {
    const bodyMat = carColors[(rng() * carColors.length) | 0];
    const yaw = rng() < 0.5 ? 0 : Math.PI;
    addBox(seg, bodyMat, x, 0.48, z, 1.75, 0.62, 4.15);
    const cabin = addBox(seg, matGlass, x, 1.05, z + 0.15, 1.5, 0.52, 2.0);
    cabin.rotation.y = yaw;
    seg.coverPoints.push({ pos: new THREE.Vector3(x, 1.15, z), type: 'car' });
  }

  for (let i = 0; i < SEG_COUNT; i++) {
    const group = new THREE.Group();
    scene.add(group);
    const seg = {
      id: i,
      gen: 0,
      originZ: -i * SEG_LEN,
      group,
      coverPoints: [],
      owned: [],
    };
    segments.push(seg);
    fill(seg);
  }

  function update(playerZ) {
    sun.position.set(26, 46, playerZ + 18);
    sun.target.position.set(0, 0, playerZ - 30);
    sun.target.updateMatrixWorld();

    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      if (playerZ < seg.originZ - SEG_LEN - 8) {
        seg.originZ -= SEG_COUNT * SEG_LEN;
        seg.gen += 1;
        fill(seg);
      }
    }
  }

  return { update, segments, colliders };
}
