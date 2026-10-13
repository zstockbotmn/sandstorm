import * as THREE from 'three';

// Rapier is a separate chunk. Load it on first need so the game module can start without it.
let rapierPromise = null;
function loadRapier() {
  if (!rapierPromise) {
    rapierPromise = import('@dimforge/rapier3d-compat').then(async (mod) => {
      const RAPIER = mod.default;
      await RAPIER.init();
      return RAPIER;
    });
  }
  return rapierPromise;
}

const _q = new THREE.Quaternion();
const _bodyQ = new THREE.Quaternion();
const _boneQ = new THREE.Quaternion();
const _invQ = new THREE.Quaternion();
const _parentQ = new THREE.Quaternion();
const _targetQ = new THREE.Quaternion();
const _pA = new THREE.Vector3();
const _pB = new THREE.Vector3();
const _up = new THREE.Vector3(0, 1, 0);

// uarmL is -X in the doll, which is the Meshy model's right side (model +X is its left).
const SKIN_ORDER = ['Hips', 'Spine01', 'Head', 'RightArm', 'RightForeArm', 'LeftArm', 'LeftForeArm', 'RightUpLeg', 'RightLeg', 'LeftUpLeg', 'LeftLeg'];
const SKIN_PART = {
  Hips: 'pelvis',
  Spine01: 'torso',
  Head: 'head',
  RightArm: 'uarmL',
  RightForeArm: 'larmL',
  LeftArm: 'uarmR',
  LeftForeArm: 'larmR',
  RightUpLeg: 'ulegL',
  RightLeg: 'llegL',
  LeftUpLeg: 'ulegR',
  LeftLeg: 'llegR',
};
const SKIN_MIRRORS = [['RightArm', 'LeftArm'], ['RightForeArm', 'LeftForeArm'], ['RightUpLeg', 'LeftUpLeg'], ['RightLeg', 'LeftLeg']];
let skinSideLogged = false;

const ENEMY_SCALE = 1.2;
// Membership in the high 16 bits, filter in the low 16. Bodies hit the world, not each other.
const GROUP_BODY = (1 << 16) | 2;
const GROUP_WORLD = (2 << 16) | 1;

function shemaghTexture() {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 128;
  const g = c.getContext('2d');
  g.fillStyle = '#4a1410';
  g.fillRect(0, 0, 128, 128);
  g.strokeStyle = '#1a0c0a';
  g.lineWidth = 10;
  for (let i = -128; i < 256; i += 16) {
    g.beginPath();
    g.moveTo(i, 0);
    g.lineTo(i + 128, 128);
    g.stroke();
  }
  g.strokeStyle = '#c45c42';
  g.lineWidth = 5;
  for (let i = -120; i < 256; i += 16) {
    g.beginPath();
    g.moveTo(i + 8, 0);
    g.lineTo(i + 136, 128);
    g.stroke();
  }
  g.strokeStyle = '#f2e6d4';
  g.lineWidth = 3;
  for (let y = 0; y < 128; y += 16) {
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
    emissive: opts.emissive != null ? opts.emissive : color,
    emissiveIntensity: opts.emissiveIntensity ?? 0.06,
  });
}

function plainBody(x, y, z) {
  return {
    position: { x, y, z },
    quaternion: {
      x: 0, y: 0, z: 0, w: 1,
      copy(o) {
        this.x = o.x; this.y = o.y; this.z = o.z; this.w = o.w;
        return this;
      },
    },
    velocity: { set() {} },
  };
}

export function createRagdollSystem(scene) {
  let RAPIER = null;
  let phys = null;
  const dolls = [];
  const pending = [];

  function bootWorld(api) {
    RAPIER = api;
    phys = new RAPIER.World({ x: 0, y: -14, z: 0 });
    phys.timestep = 1 / 60;
    phys.numSolverIterations = 6;

    const groundBody = phys.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(0, -0.25, 0));
    phys.createCollider(
      RAPIER.ColliderDesc.cuboid(400, 0.25, 400).setFriction(0.55).setRestitution(0.02).setCollisionGroups(GROUP_WORLD),
      groundBody
    );

    const queued = pending.splice(0, pending.length);
    for (let i = 0; i < queued.length; i++) realize(queued[i]);
  }

  // createRagdollSystem start, and again from the first spawn if this has not run yet.
  loadRapier().then(bootWorld).catch((err) => {
    console.debug('ragdoll rapier init failed', err);
    pending.length = 0;
  });
  const S = ENEMY_SCALE;
  const skin = makeMat(0xa56b48, { roughness: 0.72, emissive: 0x3a2014 });
  const cloth = makeMat(0x2c3228, { roughness: 0.88, emissive: 0x121510 });
  const clothDark = makeMat(0x161814, { roughness: 0.9, emissive: 0x080907 });
  const vest = makeMat(0x0c0d0c, { roughness: 0.86, emissive: 0x050505 });
  const scarf = makeMat(0xffffff, { map: scarfMap, roughness: 0.9, emissive: 0x3a1810, emissiveIntensity: 0.08 });
  const matRim = new THREE.MeshBasicMaterial({
    color: 0x0a0c0a,
    side: THREE.BackSide,
    depthWrite: false,
  });

  function addRim(mesh, extra = 1.08) {
    const rim = new THREE.Mesh(mesh.geometry, matRim);
    rim.scale.setScalar(extra);
    rim.castShadow = false;
    mesh.add(rim);
  }

  function addPart(doll, name, mesh, hx, hy, hz, mass, x, y, z) {
    mesh.castShadow = true;
    mesh.position.set(x, y, z);
    scene.add(mesh);
    const rb = phys.createRigidBody(
      RAPIER.RigidBodyDesc.dynamic()
        .setTranslation(x, y, z)
        .setLinearDamping(0.14)
        .setAngularDamping(0.42)
        .setCanSleep(true)
    );
    phys.createCollider(
      RAPIER.ColliderDesc.cuboid(hx, hy, hz)
        .setMass(mass)
        .setFriction(0.5)
        .setRestitution(0.02)
        .setCollisionGroups(GROUP_BODY),
      rb
    );
    const body = plainBody(x, y, z);
    body.velocity.set = function setVel(vx, vy, vz) { rb.setLinvel({ x: vx, y: vy, z: vz }, true); };
    const part = { name, mesh, body, rb };
    doll.parts.push(part);
    return part;
  }

  function ball(a, b, pivotA, pivotB) {
    const data = RAPIER.JointData.spherical(
      { x: pivotA[0], y: pivotA[1], z: pivotA[2] },
      { x: pivotB[0], y: pivotB[1], z: pivotB[2] }
    );
    const joint = phys.createImpulseJoint(data, a.rb, b.rb, true);
    joint.setContactsEnabled(false);
    return joint;
  }

  function hinge(a, b, pivotA, pivotB) {
    // Local Y is along the limb. Bend around X so elbows and knees fold.
    const data = RAPIER.JointData.revolute(
      { x: pivotA[0], y: pivotA[1], z: pivotA[2] },
      { x: pivotB[0], y: pivotB[1], z: pivotB[2] },
      { x: 1, y: 0, z: 0 }
    );
    const joint = phys.createImpulseJoint(data, a.rb, b.rb, true);
    joint.setContactsEnabled(false);
    if (joint.setLimits) joint.setLimits(-0.15, 2.4);
    return joint;
  }

  function pushBody(part) {
    const p = part.body.position;
    const q = part.body.quaternion;
    part.rb.setTranslation({ x: p.x, y: p.y, z: p.z }, true);
    part.rb.setRotation({ x: q.x, y: q.y, z: q.z, w: q.w }, true);
  }

  function fillSpawn(doll, origin, yaw, impulse) {
    const cx = origin.x;
    const cy = origin.y;
    const cz = origin.z;
    const baseY = Math.max(0, cy);

    const pelvis = addPart(
      doll, 'pelvis',
      new THREE.Mesh(new THREE.BoxGeometry(0.28 * S, 0.2 * S, 0.18 * S), clothDark),
      0.14 * S, 0.1 * S, 0.09 * S,
      8, cx, baseY + 0.92 * S, cz
    );
    addRim(pelvis.mesh);
    const torso = addPart(
      doll, 'torso',
      new THREE.Mesh(new THREE.BoxGeometry(0.36 * S, 0.44 * S, 0.2 * S), vest),
      0.18 * S, 0.22 * S, 0.1 * S,
      12, cx, baseY + 1.28 * S, cz
    );
    addRim(torso.mesh);
    const head = addPart(
      doll, 'head',
      new THREE.Mesh(new THREE.SphereGeometry(0.13 * S, 10, 8), skin),
      0.13 * S, 0.13 * S, 0.13 * S,
      4, cx, baseY + 1.66 * S, cz
    );
    // Sphere collider is a cuboid of the same radius so the public part list stays simple.
    addRim(head.mesh, 1.1);
    const scarfMesh = new THREE.Mesh(new THREE.SphereGeometry(0.145 * S, 8, 6), scarf);
    scarfMesh.scale.set(1.05, 0.72, 1.05);
    head.mesh.add(scarfMesh);
    addRim(scarfMesh, 1.06);

    const limbs = [
      ['uarmL', -0.28 * S, 1.38 * S, 0.09 * S, 0.28 * S, 0.09 * S, 2.2],
      ['uarmR', 0.28 * S, 1.38 * S, 0.09 * S, 0.28 * S, 0.09 * S, 2.2],
      ['larmL', -0.28 * S, 1.06 * S, 0.08 * S, 0.26 * S, 0.08 * S, 1.6],
      ['larmR', 0.28 * S, 1.06 * S, 0.08 * S, 0.26 * S, 0.08 * S, 1.6],
      ['ulegL', -0.1 * S, 0.66 * S, 0.12 * S, 0.4 * S, 0.12 * S, 5],
      ['ulegR', 0.1 * S, 0.66 * S, 0.12 * S, 0.4 * S, 0.12 * S, 5],
      ['llegL', -0.1 * S, 0.26 * S, 0.1 * S, 0.38 * S, 0.1 * S, 3.5],
      ['llegR', 0.1 * S, 0.26 * S, 0.1 * S, 0.38 * S, 0.1 * S, 3.5],
    ];
    const byName = { pelvis, torso, head };
    for (let i = 0; i < limbs.length; i++) {
      const L = limbs[i];
      byName[L[0]] = addPart(
        doll, L[0],
        new THREE.Mesh(new THREE.BoxGeometry(L[3], L[4], L[5]), cloth),
        L[3] / 2, L[4] / 2, L[5] / 2,
        L[6], cx + L[1], baseY + L[2], cz
      );
      addRim(byName[L[0]].mesh, 1.1);
    }

    if (yaw) {
      _q.setFromAxisAngle(_up, yaw);
      for (let i = 0; i < doll.parts.length; i++) {
        const p = doll.parts[i];
        const dx = p.body.position.x - cx;
        const dz = p.body.position.z - cz;
        const rx = dx * Math.cos(yaw) - dz * Math.sin(yaw);
        const rz = dx * Math.sin(yaw) + dz * Math.cos(yaw);
        p.body.position.x = cx + rx;
        p.body.position.z = cz + rz;
        p.body.quaternion.copy(_q);
        pushBody(p);
      }
    }

    doll.constraints.push(ball(pelvis, torso, [0, 0.1 * S, 0], [0, -0.22 * S, 0]));
    doll.constraints.push(ball(torso, head, [0, 0.22 * S, 0], [0, -0.14 * S, 0]));
    doll.constraints.push(ball(torso, byName.uarmL, [-0.2 * S, 0.16 * S, 0], [0, 0.14 * S, 0]));
    doll.constraints.push(ball(torso, byName.uarmR, [0.2 * S, 0.16 * S, 0], [0, 0.14 * S, 0]));
    doll.constraints.push(hinge(byName.uarmL, byName.larmL, [0, -0.14 * S, 0], [0, 0.13 * S, 0]));
    doll.constraints.push(hinge(byName.uarmR, byName.larmR, [0, -0.14 * S, 0], [0, 0.13 * S, 0]));
    doll.constraints.push(ball(pelvis, byName.ulegL, [-0.09 * S, -0.1 * S, 0], [0, 0.2 * S, 0]));
    doll.constraints.push(ball(pelvis, byName.ulegR, [0.09 * S, -0.1 * S, 0], [0, 0.2 * S, 0]));
    doll.constraints.push(hinge(byName.ulegL, byName.llegL, [0, -0.2 * S, 0], [0, 0.19 * S, 0]));
    doll.constraints.push(hinge(byName.ulegR, byName.llegR, [0, -0.2 * S, 0], [0, 0.19 * S, 0]));

    const ix = impulse ? impulse.x : 0;
    const iy = impulse ? impulse.y : 0.4;
    const iz = impulse ? impulse.z : -1;
    const len = Math.hypot(ix, iy, iz) || 1;
    const kick = 7.5;
    torso.body.velocity.set((ix / len) * kick, (iy / len) * kick * 0.35 + 0.6, (iz / len) * kick);
    head.body.velocity.set((ix / len) * kick * 1.15, 1.1, (iz / len) * kick * 1.15);
    pelvis.body.velocity.set((ix / len) * kick * 0.65, 0.3, (iz / len) * kick * 0.65);

  }

  function realize(job) {
    const doll = job.doll;
    if (doll._cancelled) return;
    fillSpawn(doll, job.origin, job.yaw, job.impulse);
    dolls.push(doll);
    if (job.statics) addNearbyStatics(doll, job.statics.colliders, job.statics.origin);
    if (job.bonesRequested) {
      const links = linkSkin(doll, job.bones);
      if (doll.skin) {
        doll.skin.links = links;
        // kill() hides the box stand-in only when parts already exist. Replay that if we built late.
        if (doll.skin.model) {
          for (let i = 0; i < doll.parts.length; i++) {
            doll.parts[i].mesh.traverse((obj) => { obj.visible = false; });
          }
        }
      }
    }
    doll._job = null;
  }

  function spawn(origin, yaw, impulse) {
    if (!rapierPromise) loadRapier();
    const doll = { parts: [], constraints: [], statics: [], age: 0, frozen: false };
    const job = {
      doll,
      origin: { x: origin.x, y: origin.y, z: origin.z },
      yaw: yaw || 0,
      impulse: impulse ? { x: impulse.x, y: impulse.y, z: impulse.z } : null,
      statics: null,
      bones: null,
      bonesRequested: false,
    };
    if (!phys) {
      doll._job = job;
      pending.push(job);
      return doll;
    }
    fillSpawn(doll, job.origin, job.yaw, job.impulse);
    dolls.push(doll);
    return doll;
  }

  function disposeMesh(mesh) {
    mesh.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose();
    });
    scene.remove(mesh);
  }

  // Map bones onto the existing bodies. offQ/offP keep the death-pose offset.
  function bindSkin(doll, bones) {
    if (!doll) return [];
    if (!phys) {
      if (doll._job) {
        doll._job.bones = bones;
        doll._job.bonesRequested = true;
      }
      return [];
    }
    return linkSkin(doll, bones);
  }

  function linkSkin(doll, bones) {
    const byName = Object.create(null);
    for (let i = 0; i < doll.parts.length; i++) byName[doll.parts[i].name] = doll.parts[i];
    const partOf = Object.assign(Object.create(null), SKIN_PART);
    for (let i = 0; i < SKIN_MIRRORS.length; i++) {
      const boneA = SKIN_MIRRORS[i][0];
      const boneB = SKIN_MIRRORS[i][1];
      const bone = bones && bones[boneA];
      const partA = byName[partOf[boneA]];
      const partB = byName[partOf[boneB]];
      if (!bone || !partA || !partB) continue;
      bone.getWorldPosition(_pA);
      _pB.set(partA.body.position.x, partA.body.position.y, partA.body.position.z);
      const dA = _pA.distanceToSquared(_pB);
      _pB.set(partB.body.position.x, partB.body.position.y, partB.body.position.z);
      if (_pA.distanceToSquared(_pB) < dA) {
        const tmp = partOf[boneA];
        partOf[boneA] = partOf[boneB];
        partOf[boneB] = tmp;
        if (!skinSideLogged) {
          skinSideLogged = true;
          console.debug('ragdoll bindSkin side swap', boneA, partOf[boneA], boneB, partOf[boneB]);
        }
      }
    }
    const links = [];
    for (let i = 0; i < SKIN_ORDER.length; i++) {
      const boneName = SKIN_ORDER[i];
      const bone = bones && bones[boneName];
      const part = byName[partOf[boneName]];
      if (!bone || !part) continue;
      const body = part.body;
      _bodyQ.set(body.quaternion.x, body.quaternion.y, body.quaternion.z, body.quaternion.w);
      bone.getWorldQuaternion(_boneQ);
      _invQ.copy(_bodyQ).invert();
      const offQ = _invQ.clone().multiply(_boneQ);
      bone.getWorldPosition(_pA);
      _pA.x -= body.position.x;
      _pA.y -= body.position.y;
      _pA.z -= body.position.z;
      const offP = _pA.applyQuaternion(_invQ).clone();
      links.push({ bone, part, offQ, offP, root: boneName === 'Hips' });
    }
    return links;
  }

  function driveSkin(skinLink) {
    const links = skinLink.links;
    if (!links || !skinLink.model) return;
    skinLink.model.updateMatrixWorld(true);
    for (let i = 0; i < links.length; i++) {
      const link = links[i];
      const bone = link.bone;
      const body = link.part.body;
      _bodyQ.set(body.quaternion.x, body.quaternion.y, body.quaternion.z, body.quaternion.w);
      _targetQ.copy(_bodyQ).multiply(link.offQ);
      const parent = bone.parent;
      if (parent) parent.getWorldQuaternion(_parentQ);
      else _parentQ.identity();
      bone.quaternion.copy(_parentQ.invert()).multiply(_targetQ);
      if (link.root) {
        _pA.set(body.position.x, body.position.y, body.position.z);
        _pB.copy(link.offP).applyQuaternion(_bodyQ);
        _pA.add(_pB);
        if (parent) parent.worldToLocal(_pA);
        bone.position.copy(_pA);
      }
      bone.updateMatrixWorld(true);
    }
  }

  function removeDoll(doll) {
    if (doll.skin && doll.skin.model) {
      const model = doll.skin.model;
      if (model.parent) model.parent.remove(model);
      doll.skin = null;
    }
    for (let i = 0; i < doll.constraints.length; i++) phys.removeImpulseJoint(doll.constraints[i], false);
    for (let i = 0; i < doll.parts.length; i++) {
      phys.removeRigidBody(doll.parts[i].rb);
      disposeMesh(doll.parts[i].mesh);
    }
    for (let i = 0; i < doll.statics.length; i++) phys.removeRigidBody(doll.statics[i]);
    const idx = dolls.indexOf(doll);
    if (idx >= 0) dolls.splice(idx, 1);
  }

  function addNearbyStatics(doll, colliders, origin) {
    if (!doll) return;
    if (!phys) {
      if (doll._job) {
        doll._job.statics = {
          colliders,
          origin: origin ? { x: origin.x, y: origin.y, z: origin.z } : { x: 0, y: 0, z: 0 },
        };
      }
      return;
    }
    if (!colliders) return;
    let n = 0;
    for (let i = 0; i < colliders.length && n < 5; i++) {
      const m = colliders[i];
      if (!m.geometry || m.geometry.type !== 'BoxGeometry') continue;
      const p = m.position;
      if (Math.abs(p.x - origin.x) > 4 || Math.abs(p.z - origin.z) > 4) continue;
      if (p.y > 4) continue;
      const body = phys.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(p.x, p.y, p.z));
      phys.createCollider(
        RAPIER.ColliderDesc.cuboid(
          Math.abs(m.scale.x) * 0.5,
          Math.abs(m.scale.y) * 0.5,
          Math.abs(m.scale.z) * 0.5
        ).setFriction(0.55).setRestitution(0.02).setCollisionGroups(GROUP_WORLD),
        body
      );
      doll.statics.push(body);
      n += 1;
    }
  }

  function syncPart(part) {
    const t = part.rb.translation();
    const r = part.rb.rotation();
    part.body.position.x = t.x;
    part.body.position.y = t.y;
    part.body.position.z = t.z;
    part.body.quaternion.x = r.x;
    part.body.quaternion.y = r.y;
    part.body.quaternion.z = r.z;
    part.body.quaternion.w = r.w;
    part.mesh.position.set(t.x, t.y, t.z);
    _q.set(r.x, r.y, r.z, r.w);
    part.mesh.quaternion.copy(_q);
  }

  function update(dt, cameraZ) {
    if (!phys) return;
    const step = Math.min(0.05, dt || 0.016);
    const n = Math.max(1, Math.round(step / (1 / 60)));
    phys.timestep = step / n;
    for (let s = 0; s < n; s++) phys.step();
    for (let d = dolls.length - 1; d >= 0; d--) {
      const doll = dolls[d];
      doll.age += step;
      let behind = true;
      for (let i = 0; i < doll.parts.length; i++) {
        const part = doll.parts[i];
        syncPart(part);
        if (part.body.position.z < cameraZ + 2) behind = false;
      }
      if (doll.skin) driveSkin(doll.skin);
      if (doll.age > 8 || behind) removeDoll(doll);
    }
  }

  function clear() {
    for (let i = 0; i < pending.length; i++) pending[i].doll._cancelled = true;
    pending.length = 0;
    if (!phys) return;
    while (dolls.length) removeDoll(dolls[0]);
  }

  return { spawn, update, addNearbyStatics, dolls, clear, bindSkin };
}
