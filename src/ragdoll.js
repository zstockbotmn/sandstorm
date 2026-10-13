import * as THREE from 'three';
import * as CANNON from 'cannon-es';

const _q = new THREE.Quaternion();

function shemaghTexture() {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 128;
  const g = c.getContext('2d');
  g.fillStyle = '#6e2e2a';
  g.fillRect(0, 0, 128, 128);
  g.strokeStyle = '#e6d2a2';
  g.lineWidth = 3;
  for (let i = -128; i < 256; i += 16) {
    g.beginPath();
    g.moveTo(i, 0);
    g.lineTo(i + 128, 128);
    g.stroke();
  }
  g.strokeStyle = '#1c1a18';
  g.lineWidth = 2;
  for (let y = 8; y < 128; y += 14) {
    g.beginPath();
    g.moveTo(0, y);
    g.lineTo(128, y);
    g.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

const scarfMap = shemaghTexture();

function makeMat(color, opts = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: opts.roughness ?? 0.78,
    metalness: opts.metalness ?? 0.02,
    map: opts.map || null,
  });
}

export function createRagdollSystem(scene) {
  const phys = new CANNON.World({ gravity: new CANNON.Vec3(0, -14, 0) });
  phys.broadphase = new CANNON.SAPBroadphase(phys);
  phys.allowSleep = true;
  phys.solver.iterations = 8;

  const groundMat = new CANNON.Material('ground');
  const bodyMat = new CANNON.Material('rag');
  phys.addContactMaterial(new CANNON.ContactMaterial(groundMat, bodyMat, {
    friction: 0.45,
    restitution: 0.02,
  }));

  const ground = new CANNON.Body({ mass: 0, material: groundMat });
  ground.addShape(new CANNON.Plane());
  ground.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
  phys.addBody(ground);

  const dolls = [];
  const skin = makeMat(0xc48a62);
  const cloth = makeMat(0x6d7344);
  const clothDark = makeMat(0x4e5630);
  const scarf = makeMat(0x6e2e2a, { map: scarfMap, roughness: 0.9 });

  function addPart(doll, name, mesh, shape, mass, x, y, z) {
    mesh.castShadow = true;
    mesh.position.set(x, y, z);
    scene.add(mesh);
    const body = new CANNON.Body({
      mass,
      material: bodyMat,
      linearDamping: 0.12,
      angularDamping: 0.18,
      position: new CANNON.Vec3(x, y, z),
    });
    body.addShape(shape);
    phys.addBody(body);
    const part = { name, mesh, body };
    doll.parts.push(part);
    return part;
  }

  function hinge(a, b, pivotA, pivotB, angle, twist) {
    const c = new CANNON.ConeTwistConstraint(a.body, b.body, {
      pivotA: new CANNON.Vec3(pivotA[0], pivotA[1], pivotA[2]),
      pivotB: new CANNON.Vec3(pivotB[0], pivotB[1], pivotB[2]),
      axisA: new CANNON.Vec3(0, 1, 0),
      axisB: new CANNON.Vec3(0, 1, 0),
      angle: angle == null ? 0.6 : angle,
      twistAngle: twist == null ? 0.3 : twist,
      collideConnected: false,
    });
    phys.addConstraint(c);
    return c;
  }

  function point(a, b, pivotA, pivotB) {
    const c = new CANNON.PointToPointConstraint(
      a.body,
      new CANNON.Vec3(pivotA[0], pivotA[1], pivotA[2]),
      b.body,
      new CANNON.Vec3(pivotB[0], pivotB[1], pivotB[2]),
      80
    );
    phys.addConstraint(c);
    return c;
  }

  function spawn(origin, yaw, impulse) {
    const doll = { parts: [], constraints: [], statics: [], age: 0, frozen: false };
    const cx = origin.x;
    const cy = origin.y;
    const cz = origin.z;
    const baseY = Math.max(0, cy);

    const pelvis = addPart(
      doll, 'pelvis',
      new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.2, 0.18), clothDark),
      new CANNON.Box(new CANNON.Vec3(0.14, 0.1, 0.09)),
      8, cx, baseY + 0.92, cz
    );
    const torso = addPart(
      doll, 'torso',
      new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.44, 0.2), cloth),
      new CANNON.Box(new CANNON.Vec3(0.18, 0.22, 0.1)),
      12, cx, baseY + 1.28, cz
    );
    const head = addPart(
      doll, 'head',
      new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 8), skin),
      new CANNON.Sphere(0.13),
      4, cx, baseY + 1.66, cz
    );
    const scarfMesh = new THREE.Mesh(new THREE.SphereGeometry(0.145, 8, 6), scarf);
    scarfMesh.scale.set(1.05, 0.72, 1.05);
    head.mesh.add(scarfMesh);

    const limbs = [
      ['uarmL', -0.28, 1.38, 0.09, 0.28, 0.09, 2.2],
      ['uarmR', 0.28, 1.38, 0.09, 0.28, 0.09, 2.2],
      ['larmL', -0.28, 1.06, 0.08, 0.26, 0.08, 1.6],
      ['larmR', 0.28, 1.06, 0.08, 0.26, 0.08, 1.6],
      ['ulegL', -0.1, 0.66, 0.12, 0.4, 0.12, 5],
      ['ulegR', 0.1, 0.66, 0.12, 0.4, 0.12, 5],
      ['llegL', -0.1, 0.26, 0.1, 0.38, 0.1, 3.5],
      ['llegR', 0.1, 0.26, 0.1, 0.38, 0.1, 3.5],
    ];
    const byName = { pelvis, torso, head };
    for (let i = 0; i < limbs.length; i++) {
      const L = limbs[i];
      const hx = L[3] / 2;
      const hy = L[4] / 2;
      const hz = L[5] / 2;
      byName[L[0]] = addPart(
        doll, L[0],
        new THREE.Mesh(new THREE.BoxGeometry(L[3], L[4], L[5]), cloth),
        new CANNON.Box(new CANNON.Vec3(hx, hy, hz)),
        L[6], cx + L[1], baseY + L[2], cz
      );
    }

    if (yaw) {
      const q = new CANNON.Quaternion();
      q.setFromEuler(0, yaw, 0);
      for (let i = 0; i < doll.parts.length; i++) {
        const p = doll.parts[i];
        const dx = p.body.position.x - cx;
        const dz = p.body.position.z - cz;
        const rx = dx * Math.cos(yaw) - dz * Math.sin(yaw);
        const rz = dx * Math.sin(yaw) + dz * Math.cos(yaw);
        p.body.position.x = cx + rx;
        p.body.position.z = cz + rz;
        p.body.quaternion.copy(q);
      }
    }

    doll.constraints.push(hinge(pelvis, torso, [0, 0.1, 0], [0, -0.22, 0], 0.35, 0.2));
    doll.constraints.push(hinge(torso, head, [0, 0.22, 0], [0, -0.14, 0], 0.7, 0.4));
    doll.constraints.push(hinge(torso, byName.uarmL, [-0.2, 0.16, 0], [0, 0.14, 0], 1.2, 0.6));
    doll.constraints.push(hinge(torso, byName.uarmR, [0.2, 0.16, 0], [0, 0.14, 0], 1.2, 0.6));
    doll.constraints.push(point(byName.uarmL, byName.larmL, [0, -0.14, 0], [0, 0.13, 0]));
    doll.constraints.push(point(byName.uarmR, byName.larmR, [0, -0.14, 0], [0, 0.13, 0]));
    doll.constraints.push(hinge(pelvis, byName.ulegL, [-0.09, -0.1, 0], [0, 0.2, 0], 0.8, 0.3));
    doll.constraints.push(hinge(pelvis, byName.ulegR, [0.09, -0.1, 0], [0, 0.2, 0], 0.8, 0.3));
    doll.constraints.push(point(byName.ulegL, byName.llegL, [0, -0.2, 0], [0, 0.19, 0]));
    doll.constraints.push(point(byName.ulegR, byName.llegR, [0, -0.2, 0], [0, 0.19, 0]));

    const ix = impulse ? impulse.x : 0;
    const iy = impulse ? impulse.y : 0.4;
    const iz = impulse ? impulse.z : -1;
    const len = Math.hypot(ix, iy, iz) || 1;
    const kick = 7.5;
    torso.body.velocity.set((ix / len) * kick, (iy / len) * kick * 0.35 + 0.6, (iz / len) * kick);
    head.body.velocity.set((ix / len) * kick * 1.15, 1.1, (iz / len) * kick * 1.15);
    pelvis.body.velocity.set((ix / len) * kick * 0.65, 0.3, (iz / len) * kick * 0.65);

    dolls.push(doll);
    return doll;
  }

  function disposeMesh(mesh) {
    mesh.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose();
    });
    scene.remove(mesh);
  }

  function removeDoll(doll) {
    for (let i = 0; i < doll.constraints.length; i++) phys.removeConstraint(doll.constraints[i]);
    for (let i = 0; i < doll.parts.length; i++) {
      phys.removeBody(doll.parts[i].body);
      disposeMesh(doll.parts[i].mesh);
    }
    for (let i = 0; i < doll.statics.length; i++) phys.removeBody(doll.statics[i]);
    const idx = dolls.indexOf(doll);
    if (idx >= 0) dolls.splice(idx, 1);
  }

  function addNearbyStatics(doll, colliders, origin) {
    if (!colliders) return;
    let n = 0;
    for (let i = 0; i < colliders.length && n < 5; i++) {
      const m = colliders[i];
      if (!m.geometry || m.geometry.type !== 'BoxGeometry') continue;
      const p = m.position;
      if (Math.abs(p.x - origin.x) > 4 || Math.abs(p.z - origin.z) > 4) continue;
      if (p.y > 4) continue;
      const body = new CANNON.Body({ mass: 0, material: groundMat });
      body.addShape(new CANNON.Box(new CANNON.Vec3(
        Math.abs(m.scale.x) * 0.5,
        Math.abs(m.scale.y) * 0.5,
        Math.abs(m.scale.z) * 0.5
      )));
      body.position.set(p.x, p.y, p.z);
      phys.addBody(body);
      doll.statics.push(body);
      n += 1;
    }
  }

  function update(dt, cameraZ) {
    const step = Math.min(0.05, dt || 0.016);
    phys.step(1 / 60, step, 3);
    for (let d = dolls.length - 1; d >= 0; d--) {
      const doll = dolls[d];
      doll.age += step;
      let behind = true;
      for (let i = 0; i < doll.parts.length; i++) {
        const part = doll.parts[i];
        const b = part.body;
        part.mesh.position.set(b.position.x, b.position.y, b.position.z);
        _q.set(b.quaternion.x, b.quaternion.y, b.quaternion.z, b.quaternion.w);
        part.mesh.quaternion.copy(_q);
        if (b.position.z < cameraZ + 2) behind = false;
      }
      if (doll.age > 8 || behind) removeDoll(doll);
    }
  }

  function clear() {
    while (dolls.length) removeDoll(dolls[0]);
  }

  return { spawn, update, addNearbyStatics, dolls, clear };
}
