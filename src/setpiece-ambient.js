import * as THREE from 'three';

const KINDS = ['fire', 'radio', 'dog', 'door', 'heli'];
const LINES = [
  'Bravo, hold at the market.', 'Eyes on rooftops, east side.', 'Command, sector four is quiet.',
  'Copy, moving to the next block.', 'No movement on the north road.', 'Keep spacing, watch the alleys.',
  'Dust is up. Visibility is short.', 'All units, check your six.', 'Market road is clear so far.',
  'Hold fire. Nothing confirmed.', 'Foot patrol passing the square.', 'Command, we are still quiet.',
];

function roundTex() {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d'), r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.4, 'rgba(255,255,255,0.45)'); r.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = r; g.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c);
}

export function createAmbient({ scene, camera, hud }) {
  const tex = roundTex(), geo = new THREE.PlaneGeometry(1, 1);
  const counts = { fire: 0, radio: 0, dog: 0, door: 0, heli: 0, gunfire: 0 }, pub = { counts, last: null };
  const state = { phase: 'idle', kind: null, t: 0, dur: 0 };
  let ev = null, wait = 7 + Math.random() * 7, lastBurst = -1e9, lastLive = -1e9, prev = '', seenRun = null, eligible = false;
  const rnd = (a, b) => a + Math.random() * (b - a), side = () => (Math.random() < 0.5 ? -1 : 1);
  const clip = () => (window.SS && window.SS.audio) || null;
  const dist = (p) => { if (!p) return 0; const c = camera.position; return Math.hypot(p.x - c.x, (p.y || 0) - c.y, p.z - c.z); };
  const say = (name, pos, dur) => { const a = clip(); if (a && a[name]) a[name](pos, dur); };
  function publish(kind, sim, p) {
    counts[kind] += 1; prev = kind; pub.last = { kind, sim, dist: dist(p) };
    state.kind = kind; state.phase = 'on'; state.t = 0; state.dur = ev ? ev.dur : 0;
    if (window.SS) window.SS.ambient = pub;
  }
  function drop(root) {
    if (!root) return;
    const mats = new Set(), geos = new Set();
    root.traverse((o) => { if (o.isMesh) { if (o.geometry && o.geometry !== geo) geos.add(o.geometry); if (o.material) mats.add(o.material); } });
    scene.remove(root); geos.forEach((g) => g.dispose()); mats.forEach((m) => m.dispose());
  }
  const endEv = () => { if (ev) drop(ev.root); ev = null; state.kind = null; state.phase = 'idle'; state.t = 0; state.dur = 0; };
  function sprite(color) {
    const mat = new THREE.MeshBasicMaterial({ map: tex, color, transparent: true, opacity: 0, depthWrite: false, fog: false, toneMapped: false, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(geo, mat); mesh.frustumCulled = false; return mesh;
  }
  const put = (root, g, mat, x, y, z) => { const o = new THREE.Mesh(g, mat); o.position.set(x, y, z); o.frustumCulled = false; root.add(o); return o; };
  function startFire() {
    const x = side() * rnd(7, 9), z = camera.position.z - rnd(70, 110), root = new THREE.Group();
    root.name = 'ambient_fire'; root.position.set(x, 0, z);
    const flames = [], smokes = [], cols = [0xff4a10, 0xff7a1c, 0xffb03a, 0xffe08a], n = 6 + ((Math.random() * 5) | 0);
    for (let i = 0; i < n; i++) { const m = sprite(cols[i % 4]); m.position.set(rnd(-1.2, 1.2), rnd(4, 9), rnd(-0.7, 0.7)); m.userData.s = rnd(1.5, 3.1); root.add(m); flames.push(m); }
    for (let i = 0; i < 6; i++) { const m = sprite(0x2a2622); m.position.set(rnd(-1.3, 1.3), rnd(4.5, 8), rnd(-0.8, 0.8)); m.userData.s = rnd(2.2, 3.6); m.userData.vy = rnd(0.35, 0.8); root.add(m); smokes.push(m); }
    scene.add(root); const dur = rnd(10, 14), pos = { x, y: 6, z }; say('crackle', pos, dur);
    return { kind: 'fire', t: 0, dur, root, flames, smokes, pos };
  }
  function startDog() {
    const lead = rnd(50, 80), fromX = side() * 5.4, toX = -fromX, z = camera.position.z - lead;
    const mat = new THREE.MeshBasicMaterial({ color: 0x2b2622, fog: false, toneMapped: false }), root = new THREE.Group();
    root.name = 'ambient_dog'; const legG = new THREE.BoxGeometry(0.06, 0.3, 0.06), legs = [];
    put(root, new THREE.BoxGeometry(0.7, 0.35, 0.25), mat, 0, 0.46, 0);
    put(root, new THREE.BoxGeometry(0.22, 0.18, 0.2), mat, 0.4, 0.58, 0);
    for (const [lx, lz] of [[0.22, 0.07], [0.22, -0.07], [-0.2, 0.07], [-0.2, -0.07]]) legs.push(put(root, legG, mat, lx, 0.15, lz));
    root.position.set(fromX, 0, z); root.rotation.y = toX > fromX ? 0 : Math.PI; scene.add(root);
    const dur = rnd(3, 5), pos = { x: fromX, y: 0.4, z }; say('bark', pos);
    return { kind: 'dog', t: 0, dur, root, legs, fromX, toX, lead, pos };
  }
  function startHeli() {
    const lead = rnd(150, 220), y = rnd(40, 60), fromX = side() * 120, toX = -fromX, z = camera.position.z - lead;
    const mat = new THREE.MeshBasicMaterial({ color: 0x221e1b, fog: false, toneMapped: false }), root = new THREE.Group();
    root.name = 'ambient_heli';
    put(root, new THREE.BoxGeometry(3.4, 1.05, 1.15), mat, 0, 0, 0);
    put(root, new THREE.BoxGeometry(2.2, 0.22, 0.22), mat, -2.3, 0.12, 0);
    const rotor = new THREE.Group(); rotor.position.y = 0.7; const blade = new THREE.BoxGeometry(8.6, 0.05, 0.32);
    const b0 = new THREE.Mesh(blade, mat), b1 = new THREE.Mesh(blade, mat); b1.rotation.y = Math.PI / 2;
    b0.frustumCulled = b1.frustumCulled = false; rotor.add(b0, b1); root.add(rotor);
    root.position.set(fromX, y, z); root.rotation.y = toX > fromX ? 0 : Math.PI; scene.add(root);
    const dur = rnd(8, 12), pos = { x: fromX, y, z }; say('heli', pos, dur);
    return { kind: 'heli', t: 0, dur, root, rotor, fromX, toX, y, lead, pos };
  }
  // A17 (tester A16: 'far-off gunfire' never came - the 'fire' beat is a burning building): a far firefight - 3-5 distant reports
  // from 120-200 m ahead to one side, 0.25-0.6 s apart ('gunfire far-off Nm' in the sound log).
  function startGunfire() { const pos = { x: side() * rnd(30, 60), y: 2, z: camera.position.z - rnd(120, 200) }, n = 3 + ((Math.random() * 3) | 0), a = clip();
    if (a && a.log) a.log('gunfire', 'far-off ' + Math.round(dist(pos)) + 'm');
    let t = 0; for (let i = 0; i < n; i++) { t += rnd(250, 600); setTimeout(() => { const b = clip(); if (b && b.distantShot && window.SS && window.SS.running) b.distantShot(-1); }, t); }
    return { kind: 'gunfire', t: 0, dur: 3, pos }; }
  function startRadio() {
    if (hud && hud.radio) hud.radio(LINES[(Math.random() * LINES.length) | 0], 3200);
    { const a = clip(); if (a && a.log) a.log('radio', 'chatter'); } // A14: the radio had no sound-log line
    return { kind: 'radio', t: 0, dur: 3.2, pos: null };
  }
  function startDoor() {
    const pos = { x: camera.position.x + side() * rnd(45, 70), y: 2, z: camera.position.z - rnd(6, 22) };
    say('door', pos); return { kind: 'door', t: 0, dur: 0.4, pos };
  }
  function begin(kind, sim) {
    if (ev) endEv();
    ev = kind === 'gunfire' ? startGunfire() : kind === 'fire' ? startFire() : kind === 'dog' ? startDog() : kind === 'heli' ? startHeli() : kind === 'door' ? startDoor() : startRadio();
    publish(kind, sim, ev.pos); wait = rnd(5, 8); return pub.last; // A11: 5-8 s apart so a 15-25 s calm gets 2-3 events
  }
  function step(dt) {
    ev.t += dt; state.t = ev.t;
    const u = ev.dur > 0 ? ev.t / ev.dur : 1, fade = u < 0.15 ? u / 0.15 : u > 0.82 ? Math.max(0, (1 - u) / 0.18) : 1;
    if (ev.kind === 'fire') {
      for (let i = 0; i < ev.flames.length; i++) {
        const m = ev.flames[i]; m.lookAt(camera.position);
        const flick = 0.45 + 0.55 * Math.abs(Math.sin(ev.t * (8 + i) + i));
        m.material.opacity = fade * flick; m.scale.setScalar(m.userData.s * (0.82 + 0.28 * flick));
      }
      for (let i = 0; i < ev.smokes.length; i++) {
        const m = ev.smokes[i]; m.lookAt(camera.position); m.position.y += dt * m.userData.vy;
        m.material.opacity = 0.3 * fade * (1 - Math.min(1, Math.max(0, (m.position.y - 4) / 12)));
        m.scale.setScalar(m.userData.s * (1 + ev.t * 0.08));
      }
    } else if (ev.kind === 'dog') {
      const k = Math.min(1, u), x = ev.fromX + (ev.toX - ev.fromX) * k;
      ev.pos.x = x; ev.pos.z = camera.position.z - ev.lead;
      ev.root.position.set(x, Math.abs(Math.sin(ev.t * 14)) * 0.05, ev.pos.z);
      for (let i = 0; i < ev.legs.length; i++) ev.legs[i].rotation.z = Math.sin(ev.t * 14 + ((i === 0 || i === 3) ? 0 : Math.PI)) * 0.5;
    } else if (ev.kind === 'heli') {
      ev.pos.x = ev.fromX + (ev.toX - ev.fromX) * Math.min(1, u); ev.pos.z = camera.position.z - ev.lead;
      ev.root.position.set(ev.pos.x, ev.y, ev.pos.z); ev.rotor.rotation.y += dt * 32;
    }
    if ((ev.pos && dist(ev.pos) < 40) || ev.t >= ev.dur) endEv();
  }
  const liveEnemy = () => { const list = (window.SS && window.SS.enemies && window.SS.enemies.list) || []; return !list.every((e) => !e || !e.alive); };
  let firstPending = false, lastBeat = '';
  const BEAT_KINDS = ['radio', 'dog', 'gunfire']; let beatBag = [];
  function resetRun() {
    const id = (window.SS && window.SS.runs) || 0;
    if (seenRun == null) { seenRun = id; return; }
    if (id === seenRun) return;
    seenRun = id; lastBurst = -1e9; lastLive = -1e9; eligible = false; firstPending = false; if (window.SS) window.SS.calmLog = []; prev = ''; lastBeat = ''; beatBag = []; wait = rnd(7, 14);
    counts.fire = counts.radio = counts.dog = counts.door = counts.heli = counts.gunfire = 0; pub.last = null;
    if (window.SS) window.SS.ambient = pub; endEv();
  }
  function pick() { let i = (Math.random() * 5) | 0; if (KINDS[i] === prev) i = (i + 1 + ((Math.random() * 4) | 0)) % 5; return KINDS[i]; }
  function update(dt, sim) {
    const SS = window.SS || {}; sim = sim || SS.simTime || 0; dt = dt || 0; resetRun();
    if (SS.bursting) lastBurst = sim;
    if (!SS.running) return;
    if (ev) step(dt);
    // A11 (tester: no ambience at all): SS.bursting is only the 8-14 s spawn window, the fight runs on after it, and the old
    // rule (>= 6 s after bursting AND a 7-14 s countdown) never fit the ~5 s gaps. Now: quiet = no live enemy for >= 1.5 s;
    // the first event comes 2-3.5 s into the calm, then every 5-8 s; none starts in the last 2.5 s before the next contact.
    // A14 (tester: the wave 1->2 gap had no ambience line): the calm's FIRST event is guaranteed within ~3 s of the clear:
    // 0.5 s debounce + 1.5-2.4 s, it ends any event still running from before, it is never the (visual-only) radio, and
    // it is logged ('ambient <kind>' + SS.calmLog { clearSim, firstSim, kind }).
    if (liveEnemy() || SS.bursting) { lastLive = sim; eligible = false; }
    if (!SS.running || SS.bursting || sim - lastLive < 0.5) return;
    if (!eligible) { eligible = true; firstPending = true; wait = rnd(1.5, 2.4); if (ev) endEv();
      const L = SS.calmLog || (SS.calmLog = []); L.push({ clearSim: lastLive > -1e8 ? +lastLive.toFixed(1) : null, firstSim: null, kind: null }); if (L.length > 20) L.shift(); }
    if (ev) return;
    // A16 (PM): every calm gets EXACTLY ONE ambient beat - distant radio chatter, a barking dog or far-off gunfire, never the
    // same kind as the previous calm's beat - and nothing else (the old 5-8 s follow-ups are gone). SS.calmLog[i].beats counts it.
    if (firstPending) { wait -= dt; if (wait > 0) return; firstPending = false;
      // A17 (tester A16: beats only alternated radio / dog): a shuffled bag of all three, refilled without repeating the last
      if (!beatBag.length) { beatBag = BEAT_KINDS.slice().sort(() => Math.random() - 0.5); if (beatBag[0] === lastBeat) beatBag.push(beatBag.shift()); }
      const k = beatBag.shift(); lastBeat = k;
      const r = begin(k, sim), L = SS.calmLog; if (L && L.length) { const c = L[L.length - 1]; c.firstSim = +sim.toFixed(1); c.kind = k; c.beats = (c.beats | 0) + 1; }
      { const a = clip(); if (a && a.log) a.log('ambient', k + (lastLive > -1e8 ? ' (calm +' + (sim - lastLive).toFixed(1) + 's)' : ' (opening)')); } return r; }
  }
  function debugAmbient(kind) { return KINDS.indexOf(kind) < 0 ? null : begin(kind, (window.SS && window.SS.simTime) || 0); }
  if (window.SS) window.SS.ambient = pub;
  return { update, debugAmbient, state };
}
