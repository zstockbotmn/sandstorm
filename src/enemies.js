import * as THREE from 'three';
import { createRagdollSystem } from './ragdoll.js';

const BODY_DMG = 55;
const HEAD_DMG = 100;
const MAX_HEALTH = 100;

const _look = new THREE.Vector3();
const _muzzle = new THREE.Vector3();
const _aim = new THREE.Vector3();

function shemaghTexture() {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 128;
  const g = c.getContext('2d');
  g.fillStyle = '#7a332c';
  g.fillRect(0, 0, 128, 128);
  g.strokeStyle = '#f0ddb0';
  g.lineWidth = 4;
  for (let i = -128; i < 256; i += 18) {
    g.beginPath();
    g.moveTo(i, 0);
    g.lineTo(i + 96, 128);
    g.stroke();
  }
  g.strokeStyle = '#221814';
  g.lineWidth = 2;
  for (let y = 10; y < 128; y += 16) {
    g.beginPath();
    g.moveTo(0, y);
    g.lineTo(128, y + 2);
    g.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function soft(r, g, b) {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const ctx = c.getContext('2d');
  const grd = ctx.createRadialGradient(32, 32, 2, 32, 32, 30);
  grd.addColorStop(0, `rgba(${r},${g},${b},0.95)`);
  grd.addColorStop(1, `rgba(${r},${g},${b},0)`);
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function difficulty() {
  const dist = window.SS && window.SS.distance ? window.SS.distance : 0;
  return Math.max(0, Math.min(1, dist / 700));
}

export function createEnemies(scene, camera, world, weapon, player) {
  const root = new THREE.Group();
  scene.add(root);
  const ragdolls = createRagdollSystem(scene);

  const scarfMap = shemaghTexture();
  const matSkin = new THREE.MeshStandardMaterial({ color: 0xc48a62, roughness: 0.72 });
  const matCloth = new THREE.MeshStandardMaterial({ color: 0x6a7040, roughness: 0.86 });
  const matClothDark = new THREE.MeshStandardMaterial({ color: 0x3e4428, roughness: 0.88 });
  const matScarf = new THREE.MeshStandardMaterial({ color: 0xffffff, map: scarfMap, roughness: 0.92 });
  const matRifle = new THREE.MeshStandardMaterial({ color: 0x2a2c28, roughness: 0.55, metalness: 0.45 });
  const matWood = new THREE.MeshStandardMaterial({ color: 0x4a3424, roughness: 0.7 });

  const capsule = (r, len) => new THREE.CapsuleGeometry(r, len, 3, 6);
  const geoTorso = capsule(0.17, 0.42);
  const geoHead = new THREE.SphereGeometry(0.125, 10, 8);
  const geoLimb = capsule(0.055, 0.28);
  const geoLeg = capsule(0.07, 0.38);
  const geoScar = new THREE.SphereGeometry(0.14, 8, 6);

  const bloodMat = new THREE.SpriteMaterial({
    map: soft(160, 16, 12),
    transparent: true,
    depthWrite: false,
  });
  const flashes = [];
  const tracers = [];
  const blood = [];
  const decals = [];
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3));

  for (let i = 0; i < 8; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({
      map: soft(255, 190, 90),
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }));
    s.visible = false;
    s.scale.setScalar(0.35);
    scene.add(s);
    flashes.push({ sprite: s, life: 0 });
  }
  for (let i = 0; i < 10; i++) {
    const line = new THREE.Line(lineGeo.clone(), new THREE.LineBasicMaterial({
      color: 0xffc56a,
      transparent: true,
      opacity: 0.9,
    }));
    line.visible = false;
    line.frustumCulled = false;
    scene.add(line);
    tracers.push({ line, life: 0 });
  }
  for (let i = 0; i < 36; i++) {
    const s = new THREE.Sprite(bloodMat.clone());
    s.visible = false;
    scene.add(s);
    blood.push({ sprite: s, life: 0, vel: new THREE.Vector3() });
  }

  const list = [];
  const api = { list, update };

  let phase = 'quiet';
  let phaseT = 2.5;
  let quietCap = 1;
  let burstCap = 4;
  let spawnCd = 1.2;

  function register(mesh, enemy, part) {
    mesh.userData.enemy = enemy;
    mesh.userData.part = part;
    weapon.targets.push(mesh);
  }

  function unregister(enemy) {
    const targets = weapon.targets;
    for (let i = targets.length - 1; i >= 0; i--) {
      if (targets[i].userData && targets[i].userData.enemy === enemy) targets.splice(i, 1);
    }
  }

  function buildEnemy(behavior, anchor) {
    const group = new THREE.Group();
    const enemy = {
      behavior,
      group,
      anchor,
      health: MAX_HEALTH,
      alive: true,
      exposed: behavior !== 'popper',
      hideT: 0.4 + Math.random() * 1.2,
      showT: 0,
      moveT: 0,
      shootCd: 0.4 + Math.random() * 0.8,
      goal: null,
      home: anchor.pos.clone(),
      flankFrom: anchor.pos.clone(),
      flankTo: anchor.pos.clone(),
    };

    const torso = new THREE.Mesh(geoTorso, matCloth);
    torso.position.y = 1.15;
    torso.castShadow = true;
    group.add(torso);
    const head = new THREE.Mesh(geoHead, matSkin);
    head.position.y = 1.68;
    head.castShadow = true;
    group.add(head);
    const wrap = new THREE.Mesh(geoScar, matScarf);
    wrap.scale.set(1.08, 0.78, 1.12);
    wrap.position.y = 1.64;
    group.add(wrap);

    function limb(geo, x, y, z) {
      const m = new THREE.Mesh(geo, matClothDark);
      m.position.set(x, y, z);
      m.castShadow = true;
      group.add(m);
      return m;
    }
    limb(geoLimb, -0.24, 1.2, 0.02);
    limb(geoLimb, 0.24, 1.15, 0.12);
    limb(geoLeg, -0.09, 0.55, 0);
    limb(geoLeg, 0.09, 0.55, 0);

    const rifle = new THREE.Group();
    const stock = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.08, 0.22), matWood);
    stock.position.set(0.18, 1.2, 0.12);
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.07, 0.36), matRifle);
    body.position.set(0.18, 1.24, -0.08);
    const barrel = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.02, 0.42), matRifle);
    barrel.position.set(0.18, 1.27, -0.4);
    rifle.add(stock, body, barrel);
    group.add(rifle);
    enemy.muzzleLocal = new THREE.Vector3(0.18, 1.27, -0.62);

    register(head, enemy, 'head');
    register(torso, enemy, 'body');
    enemy.parts = { head, torso };

    enemy.home = standPos(anchor);
    enemy.flankFrom = enemy.home.clone();
    enemy.flankTo = enemy.home.clone();
    group.position.copy(enemy.home);
    root.add(group);
    enemy.takeHit = (part, point) => hitEnemy(enemy, part, point);
    list.push(enemy);
    if (enemy.behavior === 'popper') group.position.copy(hidePos(enemy));
    return enemy;
  }

  function standPos(anchor) {
    const elevated = anchor.type === 'window' || anchor.type === 'roof';
    const y = elevated ? Math.max(0, anchor.pos.y - 1.2) : 0;
    return new THREE.Vector3(anchor.pos.x, y, anchor.pos.z);
  }

  function hidePos(enemy) {
    const pos = enemy.home;
    const side = Math.sign(pos.x) || 1;
    const drop = enemy.anchor.type === 'roof' ? 0.9 : 0.15;
    return new THREE.Vector3(pos.x + side * 0.9, Math.max(0, pos.y - drop), pos.z);
  }

  function facePlayer(enemy) {
    _look.set(camera.position.x, enemy.group.position.y, camera.position.z);
    enemy.group.lookAt(_look);
  }

  function spray(point) {
    let spawned = 0;
    for (let i = 0; i < blood.length && spawned < 8; i++) {
      const b = blood[i];
      if (b.life > 0) continue;
      b.life = 0.35 + Math.random() * 0.25;
      b.sprite.visible = true;
      b.sprite.position.copy(point);
      b.sprite.material.opacity = 0.9;
      b.sprite.scale.setScalar(0.12 + Math.random() * 0.12);
      b.vel.set((Math.random() - 0.5) * 2.4, 1.2 + Math.random() * 2.2, (Math.random() - 0.5) * 2.4);
      spawned += 1;
    }
  }

  function dropDecal(pos) {
    let mesh = null;
    for (let i = 0; i < decals.length; i++) {
      if (!decals[i].visible) { mesh = decals[i]; break; }
    }
    if (!mesh) {
      mesh = new THREE.Mesh(
        new THREE.CircleGeometry(0.55, 10),
        new THREE.MeshBasicMaterial({ color: 0x4a0808, transparent: true, opacity: 0.82, depthWrite: false })
      );
      mesh.rotation.x = -Math.PI / 2;
      scene.add(mesh);
      decals.push(mesh);
    }
    mesh.visible = true;
    mesh.position.set(pos.x, 0.04, pos.z);
    mesh.scale.setScalar(0.7 + Math.random() * 0.5);
  }

  function kill(enemy, point) {
    if (!enemy.alive) return;
    enemy.alive = false;
    unregister(enemy);
    const origin = enemy.group.position;
    spray(point || origin.clone().setY(origin.y + 1.3));
    dropDecal(origin);
    const yaw = enemy.group.rotation.y;
    const doll = ragdolls.spawn(origin, yaw, _aim.copy(origin).sub(camera.position).normalize());
    ragdolls.addNearbyStatics(doll, world.colliders, origin);
    enemy.group.visible = false;
    root.remove(enemy.group);
  }

  function hitEnemy(enemy, part, point) {
    if (!enemy.alive) return;
    const dmg = part === 'head' ? HEAD_DMG : BODY_DMG;
    enemy.health -= dmg;
    if (point) spray(point);
    if (enemy.health <= 0) kill(enemy, point);
  }

  weapon.onHit = function onHit(info) {
    if (!info || !info.enemy || !info.enemy.takeHit) return;
    const dirPoint = info.point;
    info.enemy.takeHit(info.part, dirPoint);
    if (window.SS && window.SS.hud && window.SS.hud.hitMarker) window.SS.hud.hitMarker();
  };

  function muzzleFlash(pos) {
    let slot = flashes[0];
    for (let i = 0; i < flashes.length; i++) {
      if (flashes[i].life <= 0) { slot = flashes[i]; break; }
    }
    slot.life = 0.05;
    slot.sprite.visible = true;
    slot.sprite.position.copy(pos);
  }

  function tracer(a, b) {
    let slot = tracers[0];
    for (let i = 0; i < tracers.length; i++) {
      if (tracers[i].life <= 0) { slot = tracers[i]; break; }
    }
    slot.life = 0.07;
    const attr = slot.line.geometry.attributes.position;
    attr.setXYZ(0, a.x, a.y, a.z);
    attr.setXYZ(1, b.x, b.y, b.z);
    attr.needsUpdate = true;
    slot.line.geometry.computeBoundingSphere();
    slot.line.visible = true;
    slot.line.material.opacity = 0.9;
  }

  function enemyShoot(enemy) {
    const diff = difficulty();
    enemy.group.updateMatrixWorld();
    _muzzle.copy(enemy.muzzleLocal).applyMatrix4(enemy.group.matrixWorld);
    const dist = _muzzle.distanceTo(camera.position);
    let chance = (0.42 - dist * 0.006) * (0.55 + 0.7 * diff);
    if (window.SS && window.SS.input && window.SS.input.cover) chance *= 0.18;
    chance = Math.max(0.02, Math.min(0.72, chance));
    const hit = Math.random() < chance && player && player.alive;
    _aim.copy(camera.position);
    if (!hit) {
      _aim.x += (Math.random() - 0.5) * 2.4;
      _aim.y += (Math.random() - 0.5) * 1.2;
      _aim.z += (Math.random() - 0.5) * 2.4;
    }
    muzzleFlash(_muzzle);
    tracer(_muzzle, _aim);
    if (hit) {
      const amount = 8 + diff * 6 + Math.random() * 4;
      player.damage(amount, _muzzle);
    }
  }

  function coverPool(types) {
    const out = [];
    const segs = world.segments || [];
    const pz = camera.position.z;
    for (let s = 0; s < segs.length; s++) {
      const pts = segs[s].coverPoints || [];
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        const ahead = pz - p.pos.z;
        if (ahead < 20 || ahead > 55) continue;
        if (types && types.indexOf(p.type) < 0) continue;
        out.push(p);
      }
    }
    return out;
  }

  function occupied(pos) {
    for (let i = 0; i < list.length; i++) {
      if (!list[i].alive) continue;
      const h = list[i].home;
      if ((h.x - pos.x) ** 2 + (h.z - pos.z) ** 2 < 2.2) return true;
    }
    return false;
  }

  function spawnOne(prefer) {
    const diff = difficulty();
    const roll = prefer || (Math.random() < 0.45 ? 'popper' : Math.random() < 0.55 ? 'shifter' : 'flanker');
    let types;
    if (roll === 'popper') types = ['window', 'roof', 'wall', 'barrel', 'car'];
    else if (roll === 'flanker') types = ['alley', 'door'];
    else types = ['wall', 'barrel', 'car', 'door', 'alley'];
    let pool = coverPool(types);
    if (!pool.length) pool = coverPool(null);
    if (!pool.length) return null;
    let pick = pool[(Math.random() * pool.length) | 0];
    for (let n = 0; n < 6; n++) {
      const tryP = pool[(Math.random() * pool.length) | 0];
      if (!occupied(tryP.pos)) { pick = tryP; break; }
    }
    if (occupied(pick.pos)) return null;
    const enemy = buildEnemy(roll, pick);
    if (roll === 'flanker') {
      const side = Math.sign(pick.pos.x) || (Math.random() < 0.5 ? -1 : 1);
      enemy.flankFrom.copy(enemy.home);
      enemy.flankTo.set(side * (1.6 + Math.random() * 1.2), 0, enemy.home.z + (Math.random() - 0.5) * 2);
      enemy.group.position.copy(enemy.flankFrom);
      enemy.exposed = false;
    }
    if (roll === 'shifter') {
      enemy.goal = enemy.home.clone();
      enemy.moveT = 0.2;
    }
    enemy.shootCd = 0.6 + Math.random() * (1.4 - diff);
    return enemy;
  }

  function nearestCover(from, avoid) {
    const pool = coverPool(['wall', 'barrel', 'car', 'door']);
    let best = null;
    let bestD = 1e9;
    for (let i = 0; i < pool.length; i++) {
      const p = pool[i].pos;
      if (avoid && (p.x - avoid.x) ** 2 + (p.z - avoid.z) ** 2 < 1) continue;
      const d = p.distanceToSquared(from);
      if (d > 0.8 && d < 64 && d < bestD) {
        bestD = d;
        best = p;
      }
    }
    return best ? new THREE.Vector3(best.x, 0, best.z) : null;
  }

  function updateEnemy(enemy, dt, diff) {
    if (!enemy.alive) return;
    const popScale = 1 - 0.45 * diff;
    if (enemy.behavior === 'popper') {
      if (enemy.exposed) {
        enemy.showT -= dt;
        facePlayer(enemy);
        enemy.group.position.lerp(enemy.home, 1 - Math.exp(-10 * dt));
        if (enemy.showT <= 0) {
          enemy.exposed = false;
          enemy.hideT = (1 + Math.random() * 3) * popScale;
        } else if (player.alive && window.SS.running) {
          enemy.shootCd -= dt;
          if (enemy.shootCd <= 0) {
            enemyShoot(enemy);
            enemy.shootCd = (0.7 + Math.random() * 0.8) * (1.15 - 0.4 * diff);
          }
        }
      } else {
        enemy.hideT -= dt;
        const hid = hidePos(enemy);
        enemy.group.position.lerp(hid, 1 - Math.exp(-8 * dt));
        if (enemy.hideT <= 0) {
          enemy.exposed = true;
          enemy.showT = 0.55 + Math.random() * 0.7;
          enemy.shootCd = 0.12 + Math.random() * 0.25;
        }
      }
    } else if (enemy.behavior === 'shifter') {
      if (!enemy.goal) enemy.goal = enemy.home.clone();
      const moving = enemy.group.position.distanceTo(enemy.goal) > 0.35 && enemy.moveT <= 0;
      if (enemy.moveT > 0) {
        enemy.moveT -= dt;
        enemy.exposed = true;
        facePlayer(enemy);
        if (player.alive && window.SS.running) {
          enemy.shootCd -= dt;
          if (enemy.shootCd <= 0) {
            enemyShoot(enemy);
            enemy.shootCd = 0.55 + Math.random() * 0.5;
          }
        }
        if (enemy.moveT <= 0) {
          const next = nearestCover(enemy.group.position, enemy.goal);
          enemy.goal = next || enemy.home.clone();
        }
      } else if (moving) {
        enemy.exposed = true;
        const step = 3.4 * dt * (1 + 0.35 * diff);
        const dir = _look.copy(enemy.goal).sub(enemy.group.position);
        dir.y = 0;
        const len = dir.length();
        if (len > 0.05) {
          dir.multiplyScalar(step / len);
          enemy.group.position.add(dir);
          enemy.group.lookAt(enemy.goal.x, enemy.group.position.y, enemy.goal.z);
        }
      } else {
        enemy.moveT = 0.7 + Math.random() * 0.8;
        enemy.shootCd = 0.15;
      }
    } else {
      const dest = enemy.exposed ? enemy.flankTo : enemy.flankTo;
      const d = enemy.group.position.distanceTo(enemy.flankTo);
      if (d > 0.4) {
        enemy.exposed = false;
        const step = 3.8 * dt * (1 + 0.3 * diff);
        _look.copy(enemy.flankTo).sub(enemy.group.position);
        _look.y = 0;
        const len = _look.length() || 1;
        enemy.group.position.addScaledVector(_look, step / len);
        enemy.group.lookAt(enemy.flankTo.x, enemy.group.position.y, enemy.flankTo.z);
      } else {
        enemy.exposed = true;
        enemy.group.position.y += (0 - enemy.group.position.y) * (1 - Math.exp(-6 * dt));
        facePlayer(enemy);
        if (player.alive && window.SS.running) {
          enemy.shootCd -= dt;
          if (enemy.shootCd <= 0) {
            enemyShoot(enemy);
            enemy.shootCd = (0.65 + Math.random() * 0.7) * (1.1 - 0.35 * diff);
          }
        }
      }
    }
  }

  function aliveCount() {
    let n = 0;
    for (let i = 0; i < list.length; i++) if (list[i].alive) n += 1;
    return n;
  }

  function update(dt) {
    const diff = difficulty();
    phaseT -= dt;
    const alive = aliveCount();
    if (phase === 'quiet') {
      if (phaseT <= 0) {
        phase = 'burst';
        burstCap = 3 + Math.min(3, (diff * 3 + Math.random() * 2) | 0);
        phaseT = 8 + Math.random() * 6;
        spawnCd = 0.25;
      }
    } else if (phaseT <= 0 || (alive === 0 && phaseT < 6)) {
      phase = 'quiet';
      quietCap = Math.random() < 0.4 ? 0 : (Math.random() < 0.5 ? 1 : 2);
      phaseT = 7 + Math.random() * 6 - diff * 2;
      spawnCd = 0.8;
    }

    const cap = phase === 'quiet' ? quietCap : burstCap;
    spawnCd -= dt;
    if (window.SS && window.SS.running && alive < cap && spawnCd <= 0) {
      const made = spawnOne();
      spawnCd = made ? (phase === 'burst' ? 0.45 + (1 - diff) * 0.55 : 2.2) : 0.6;
    }

    const pz = camera.position.z;
    let hold = false;
    for (let i = list.length - 1; i >= 0; i--) {
      const e = list[i];
      if (!e.alive) {
        list.splice(i, 1);
        continue;
      }
      if (e.group.position.z > pz + 6) {
        e.alive = false;
        unregister(e);
        root.remove(e.group);
        list.splice(i, 1);
        continue;
      }
      updateEnemy(e, dt, diff);
      const dx = e.group.position.x - camera.position.x;
      const dy = e.group.position.y - camera.position.y;
      const dz = e.group.position.z - camera.position.z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (dist < 60 && e.group.position.z < pz + 3) hold = true;
    }

    if (window.SS && window.SS.running) window.SS.walking = !hold;

    for (let i = 0; i < flashes.length; i++) {
      const f = flashes[i];
      if (f.life <= 0) continue;
      f.life -= dt;
      if (f.life <= 0) f.sprite.visible = false;
    }
    for (let i = 0; i < tracers.length; i++) {
      const t = tracers[i];
      if (t.life <= 0) continue;
      t.life -= dt;
      t.line.material.opacity = Math.max(0, t.life / 0.07);
      if (t.life <= 0) t.line.visible = false;
    }
    for (let i = 0; i < blood.length; i++) {
      const b = blood[i];
      if (b.life <= 0) continue;
      b.life -= dt;
      b.vel.y -= 9 * dt;
      b.sprite.position.addScaledVector(b.vel, dt);
      if (b.sprite.position.y < 0.05) {
        b.sprite.position.y = 0.05;
        b.vel.y *= -0.2;
        b.vel.x *= 0.6;
        b.vel.z *= 0.6;
      }
      b.sprite.material.opacity = Math.max(0, b.life * 2);
      if (b.life <= 0) b.sprite.visible = false;
    }
    if (decals.length > 12) {
      const old = decals.shift();
      scene.remove(old);
      old.geometry.dispose();
    }

    ragdolls.update(dt, pz);
  }

  return api;
}
