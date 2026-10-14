import * as THREE from 'three';
import { createWorld } from './world.js';
import { art } from './art.js';
import { createInput } from './input.js';
import { createWeapon } from './weapon.js';
import { createHud } from './hud.js';
import { createPlayer } from './player.js';
import { createEnemies } from './enemies.js';
import { createScore } from './score.js';
import { createAudio } from './audio.js';
import { createStakes } from './stakes.js';
import { createCover } from './cover.js';
import { createPostFx, wantLow } from './postfx.js';
import { createSky } from './sky.js';
import { preloadRapier } from './ragdoll.js';
import { Q, QUALITY, setQuality, goLow, goUltra, onLow, EXPLICIT, isSoftwareRenderer, rendererString } from './quality.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

// Phones: no MSAA (postfx/DPR carry the look), DPR <= 1.25, cheap PCF shadows at 1024.
const PHONE = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent || '');
const renderer = new THREE.WebGLRenderer({ antialias: !PHONE, powerPreference: 'high-performance' });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, Q.far);
camera.position.set(0, 1.7, 4);
camera.rotation.order = 'YXZ';
scene.add(camera);

const softGL = wantLow(renderer);
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, softGL ? 1 : PHONE ? 1.25 : 1.5) * Q.res);
renderer.shadowMap.enabled = !softGL && Q.shadows;
renderer.shadowMap.type = PHONE ? THREE.PCFShadowMap : THREE.PCFSoftShadowMap;

const world = createWorld(scene, 0x5a7d);
if ((softGL || !Q.shadows) && world.sun) world.sun.castShadow = false;
if (PHONE && world.sun) world.sun.shadow.mapSize.set(1024, 1024);
const post = createPostFx(renderer, scene, camera);
const sky = createSky(scene);

// Daytime HDRI for high tier. The warm fog stays so the street still reads as desert.
if (art.tier === 'high') {
  new RGBELoader().load('assets/env/noon_grass_512.hdr', (hdr) => {
    const tp = performance.now(); const pmrem = new THREE.PMREMGenerator(renderer);
    const env = pmrem.fromEquirectangular(hdr).texture;
    scene.environment = env;
    if (scene.environmentIntensity != null) scene.environmentIntensity = 0.72;
    hdr.dispose();
    pmrem.dispose(); (window.SS_T = window.SS_T || {}).pmremMs = Math.round(performance.now() - tp);
  }, undefined, (err) => { console.warn('hdri', err && (err.message || err)); });
}
const input = createInput(renderer.domElement);
const weapon = createWeapon(camera, world, scene);
const hud = createHud();
const player = createPlayer(camera, input, hud);
const enemies = createEnemies(scene, camera, world, weapon, player);
const audio = createAudio();
const score = createScore(hud, audio);
const cover = createCover(scene, camera, world, input);
const stakes = createStakes(scene, camera, hud, player, weapon, score, audio);

window.SS = {
  THREE,
  scene,
  camera,
  world,
  input,
  weapon,
  hud,
  player,
  enemies,
  audio,
  scoreSys: score,
  cover,
  stakes,
  walking: true,
  distance: 0,
  running: false,
  bursting: false,
  score: 0,
  health: 100,
  onDeath() {},
};
// art.js may have started loading before this object existed. Keep the same reference.
window.SS.art = art;
window.SS.renderer = renderer; // headless shots read info.render.triangles

const priorHit = weapon.onHit;
weapon.onHit = function onHit(info) {
  if (priorHit) priorHit(info);
  score.registerHit();
  audio.hit();
};
weapon.onShot = function onShot() {
  score.registerShot();
  audio.gunfire();
};
weapon.onReload = function onReload(which) {
  audio.reload(which);
};

window.SS.debug = {
  spawnEnemy(behavior) {
    return enemies.spawnEnemy(behavior);
  },
  killAll() {
    enemies.killAll();
  },
  damage(n) {
    player.damage(n);
  },
};

const SPEED = 3.0; // a bit faster between fights
const BASE_FOV = 70;
const SCOPE_FOV = 28; // ~2.5x
let fov = BASE_FOV;
let eye = 1.7;
let last = 0;
let started = false;

function applyCamera(dt) {
  const st = input.state;
  const aim = 1 - Math.exp(-36 * dt); // snappier ADS so soft-GL / low fps still reaches ~2.5x
  const duck = 1 - Math.exp(-14 * dt);
  fov = st.scope ? SCOPE_FOV : BASE_FOV; // instant zoom (lerp took 2-3 s at low fps)
  eye += ((st.cover ? 1.28 : 1.7) - eye) * duck; // crouched eye clears lowered sandbags (~0.9 m)
  if (Math.abs(camera.fov - fov) > 0.01) {
    camera.fov = fov;
    camera.updateProjectionMatrix();
  }
  camera.position.y = eye;
  camera.rotation.y = -st.yaw + (window.SS_VIEW_YAW || 0); // test hook: look sideways/backward for coverage shots
  camera.rotation.x = -st.pitch;
  camera.rotation.z = 0;
  camera.updateMatrixWorld();
}

function simStep(dt) {
  const frozen = !player.alive; // death freezes the world: no walking, no enemy/world updates
  if (window.SS.walking && !frozen) {
    camera.position.z -= SPEED * dt;
    window.SS.distance += SPEED * dt;
  }
  input.applyAim(dt || 0.016); input.onTarget = weapon.onTarget;
  if (!frozen) cover.update(dt || 0.016, window.SS.walking && window.SS.running);
  applyCamera(dt || 0.016);
  const step = dt || 0.016;
  // Fire BEFORE enemies move: shots test the hitboxes exactly where the last rendered frame showed them (firing after
  // the enemy update tested next-frame positions - a running fighter at 20 fps had moved ~0.25 m off the crosshair).
  weapon.update(dt, input.state);
  player.update(step);
  if (!frozen) enemies.update(step);
  if (!frozen && window.SS.running) stakes.update(step);
  score.setDistance(window.SS.distance);
  audio.update(step);
  applyCamera(0);
  input.endFrame();
  if (!frozen) world.update(camera.position.z);
  sky.update(camera);
}

// Adaptive resolution: every 2 s, if fps < 40 drop the render scale 15% (floor 0.6); if fps > 56 for 6 s, step back up.
function baseDPR() { return Math.min(window.devicePixelRatio || 1, softGL ? 1 : PHONE ? 1.25 : 1.5) * Q.res; }
let resScale = 1, fpsN = 0, fpsT = 0, goodT = 0;
function adaptRes(raw) {
  if (softGL || !(raw > 0) || raw > 0.5) return;
  fpsN++; fpsT += raw; if (fpsT < 2) return;
  const fps = fpsN / fpsT; fpsN = 0; fpsT = 0; let next = resScale;
  if (fps < 40) { next = Math.max(0.6, resScale * 0.85); goodT = 0; }
  else if (fps > 56) { goodT += 2; if (goodT >= 6) { next = Math.min(1, resScale / 0.85); goodT = 0; } } else goodT = 0;
  if (Math.abs(next - resScale) > 0.01) { resScale = next; window.SS.resScale = resScale; onResize(); }
  window.SS.fps = Math.round(fps);
}

const frameErrs = new Set();
function frame(now) {
  requestAnimationFrame(frame);
  const raw = last ? (now - last) / 1000 : 0; const tFrame = performance.now();
  last = now;
  adaptRes(raw); if (window.SS.autoLowTick) window.SS.autoLowTick(Math.min(raw, 1));
  if (raw > 0.25 && window.SS && window.SS.running) (window.SS.hitches = window.SS.hitches || []).push([Math.round(now), Math.round(raw * 1000), window.SS.engaged | 0]);
  // Catch up when frames are late (software GL): up to 4 x 50 ms so fire/walk still advance.
  const steps = raw > 0 ? Math.min(4, Math.max(1, Math.ceil(raw / 0.05))) : 1;
  const dt = raw > 0 ? Math.min(0.05, raw / steps) : 0;
  const slow = (window.SS.slowmoUntil || 0) > performance.now() ? 0.3 : 1; window.SS.timeScale = slow;
  try { for (let i = 0; i < steps; i++) simStep(dt * slow); }
  catch (err) { // never freeze HUD/render on a sim error; report once per message
    const k = String(err && err.message); if (!frameErrs.has(k)) { frameErrs.add(k); console.error('[sandstorm] sim step failed:', err && (err.stack || err)); (window.SS.errors = window.SS.errors || []).push('sim:' + k); } }
  { const sw = document.getElementById('switch-cover'); if (sw) sw.classList.toggle('on', cover.state !== 'none' && player.alive && window.SS.running); }
  hud.onTarget(weapon.onTarget); hud.setScope(!!input.scope && player.alive && window.SS.running);
  hud.update({
    distance: window.SS.distance,
    ammo: weapon.ammo, reserve: weapon.reserve,
    reloading: weapon.reloading, reloadP: weapon.reloadProgress ? weapon.reloadProgress() : null,
    scoped: input.scope,
    score: window.SS.score,
    health: window.SS.health,
  });
  const tr = performance.now(); const simMs = tr - tFrame;
  if (Q.post && !post.low) post.render(); else renderer.render(scene, camera);
  window.SS.lastRI = [renderer.info.render.calls, renderer.info.render.triangles];
  { const rm = performance.now() - tr; { const P = renderer.info.programs || []; if (P.length !== (window.SS.progN | 0)) { window.SS.progN = P.length; const seen = window.SS.progSeen = window.SS.progSeen || new Set(); const fresh = P.filter(x => !seen.has(x.cacheKey)); fresh.forEach(x => seen.add(x.cacheKey)); (window.SS.progLog = window.SS.progLog || []).push([Math.round(tr), Math.round(performance.now() - tr), fresh.map(x => x.name + '|' + String(x.cacheKey).replace(/,false/g, ',f').slice(0, 400))]); } }
  window.SS.prog = [(renderer.info.programs || []).length, renderer.info.memory.geometries, renderer.info.memory.textures]; if (window.SS.running && (rm > 900 || simMs > 150)) (window.SS_SPIKES = window.SS_SPIKES || []).push(['frame', Math.round(tr), Math.round(simMs), Math.round(rm), (renderer.info.programs || []).length, renderer.info.memory.geometries, renderer.info.memory.textures, renderer.info.render.calls, renderer.info.render.triangles, window.SS.distance.toFixed(1), window.SS.engaged|0, (window.SS.enemies.list||[]).length]); }
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(baseDPR() * resScale);
  renderer.setSize(window.innerWidth, window.innerHeight);
  post.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onResize);

const overEl = document.getElementById('over');
const overNew = document.getElementById('over-new');
const overStats = document.getElementById('over-stats');
const overTable = document.getElementById('over-table');
const bestEl = document.getElementById('best');

function showBest() {
  bestEl.textContent = 'Best: ' + score.best();
}

function showOver(result) {
  const e = result.entry;
  overNew.style.display = result.isNewBest ? 'block' : 'none';
  if (e) {
    overStats.textContent =
      'Score ' + e.score +
      ' · ' + e.distance + ' m' +
      ' · Kills ' + e.kills +
      ' · Headshots ' + e.headshots +
      ' · Accuracy ' + e.accuracy + '%';
  }
  overTable.innerHTML = '<tr><th>#</th><th>Score</th><th>Dist</th><th>Kills</th><th>HS</th><th>Acc</th><th>Date</th></tr>';
  const rows = result.table || [];
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const tr = document.createElement('tr');
    const when = (r.date || '').slice(0, 10);
    tr.innerHTML =
      '<td>' + (i + 1) + '</td><td>' + r.score + '</td><td>' + r.distance +
      '</td><td>' + r.kills + '</td><td>' + r.headshots + '</td><td>' + r.accuracy +
      '%</td><td>' + when + '</td>';
    overTable.appendChild(tr);
  }
  overEl.style.display = 'flex';
  showBest();
}

function restartRun() {
  overEl.style.display = 'none';
  player.reset();
  enemies.reset();
  weapon.reset();
  score.reset(); stakes.reset();
  input.yaw = 0;
  input.pitch = 0;
  input.resetState(); hud.setScope(false);
  camera.position.set(0, 1.7, 4);
  fov = BASE_FOV;
  eye = 1.7;
  window.SS.distance = 0;
  window.SS.health = 100;
  window.SS.bursting = false;
  window.SS.walking = true;
  window.SS.running = true; window.SS.startedAt = performance.now(); if (window.SS.input) window.SS.input.fire = false;
  cover.reset();
  world.reset(camera.position.z);
  score.setDistance(0);
}

window.SS.onDeath = function onDeath() {
  if (!window.SS.running && overEl.style.display === 'flex') return;
  window.SS.running = false;
  window.SS.walking = false;
  const result = score.finish();
  showOver(result);
};

document.getElementById('play').addEventListener('click', () => {
  audio.unlock();
  document.getElementById('start').style.display = 'none';
  window.SS.walking = true;
  window.SS.running = true; window.SS.startedAt = performance.now(); if (window.SS.input) window.SS.input.fire = false;
  if (!started) {
    started = true;
    requestAnimationFrame(frame);
  }
});

document.getElementById('restart').addEventListener('click', () => {
  audio.unlock();
  restartRun();
});

showBest();

// ?debug: show the build (service worker cache version) in a corner.
if (/[?&]debug\b/.test(location.search)) {
  const tag = document.createElement('div');
  tag.id = 'build-tag';
  tag.style.cssText = 'position:fixed;left:4px;bottom:2px;z-index:99;font:10px monospace;color:#fff;background:rgba(0,0,0,.45);padding:1px 4px;pointer-events:none';
  tag.textContent = 'build …';
  document.body.appendChild(tag);
  fetch('sw.js', { cache: 'no-store' }).then(r => r.text()).then(t => { const m = t.match(/ss-[0-9a-f]{10}/); tag.textContent = 'build ' + (m ? m[0] : 'dev'); }).catch(() => { tag.textContent = 'build ?'; });
}

// Swap the code-built box rifle for the CC0 rifle model once art is loaded (box rifle stays if it fails / low tier).
// High tier: ask the service worker to cache the High-only normal/ARM maps (Low never downloads them).
if (QUALITY !== 'low' && 'serviceWorker' in navigator) navigator.serviceWorker.ready.then((r) => r.active && r.active.postMessage('cache-hi')).catch(() => {});
// ?hitbox: mark every shot's hit point (red = enemy, yellow = world) for 2 s.
if (/[?&]hitbox/.test(location.search)) {
  const mk = [], gE = new THREE.SphereGeometry(0.06, 8, 6), mE = new THREE.MeshBasicMaterial({ color: 0xff2020, depthTest: false }), mW = new THREE.MeshBasicMaterial({ color: 0xffee00, depthTest: false });
  weapon.onShotDebug = (s) => { if (!s.hit) return; const m = new THREE.Mesh(gE, s.hit.enemy ? mE : mW); m.position.copy(s.hit.point); m.renderOrder = 99; scene.add(m); mk.push(m); setTimeout(() => { scene.remove(m); }, 2000); };
}
art.onReady(() => { const m4 = art.staticInstance('rifle_m4'); if (m4) m4.name = 'rifle_m4'; const r = m4 || art.staticInstance('rifle_ak47'); if (r) weapon.setModel(r, /[?&]rflip=1/.test(location.search)); });

// Rapier (ragdoll physics, ~4 MB) is fetched after the first rendered frames, never before Play/first paint.
let rapierQueued = false;
function queueRapier() { if (rapierQueued || /[?&]rapier=0/.test(location.search)) return; rapierQueued = true; setTimeout(() => (window.requestIdleCallback ? requestIdleCallback(() => preloadRapier(), { timeout: 1500 }) : setTimeout(() => preloadRapier(), 1500)), 0); }
document.getElementById('play').addEventListener('click', () => requestAnimationFrame(() => requestAnimationFrame(queueRapier)));

// Quality toggle on the start screen (saved in localStorage; applies on reload).
{ const b = document.getElementById('quality');
  if (b) { const label = () => { b.textContent = 'Quality: ' + (QUALITY === 'low' ? 'Low' : 'High'); }; label();
    b.addEventListener('click', (ev) => { ev.stopPropagation(); setQuality(QUALITY === 'low' ? 'high' : 'low'); }); }
  window.SS.quality = QUALITY; }

// Prewarm (tester: 1-2 s hitches at first contact): compile every shader and upload every texture the fight will use
// (all fighter rigs, props, buildings) right after art loads, so the first enemy/prop on screen doesn't stall.
art.onReady(() => {
  const t0 = performance.now(); const tmp = new THREE.Group(); tmp.position.set(0, 0, camera.position.z - 6); scene.add(tmp);
  try {
    for (const f of art.fillFighterPool(2)) if (f && f.root) tmp.add(f.root); // pooled: these exact instances are used by the first waves
    for (const n of ['prop_sandbags', 'prop_burnedcar', 'prop_drum', 'prop_crates', 'prop_cart', 'bldg1', 'bldg2', 'bldg3', 'bldg4']) { const o = art.staticInstance(n); if (o) { o.scale.setScalar(0.001); tmp.add(o); } }
    tmp.traverse((o) => { o.frustumCulled = false; const ms = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : [];
      for (const m of ms) for (const k of ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'aoMap']) if (m[k]) renderer.initTexture(m[k]); });
    try { tmp.add(enemies.prewarmSet()); tmp.add(cover.prewarmMesh()); tmp.add(stakes.prewarm()); } catch (e) {}
    // shadow-receive variants change the program too: add receive/cast twins of every prewarm mesh
    { const twins = []; tmp.traverse((o) => { if (o.isMesh && !o.isSkinnedMesh) { const t = o.clone(); t.receiveShadow = !o.receiveShadow; t.castShadow = true; twins.push(t); } }); for (const t of twins) tmp.add(t); }
    // compile hidden pooled objects too (muzzle flashes, tracers, box gun, blood): force visible for the compile only
    const hidden = []; scene.traverse((o) => { if (!o.visible) { hidden.push(o); o.visible = true; } });
    renderer.compile(scene, camera);
    // Also draw once (tiny offscreen target, temp objects spread in view): drivers/SwiftShader JIT per draw state, not at link.
    { const rt = new THREE.WebGLRenderTarget(64, 32); let i = 0; tmp.children.forEach((c) => { c.position.set(((i++ % 9) - 4) * 0.6, 1.4, 0); if (c.scale.x < 0.01) c.scale.setScalar(0.004); });
      renderer.setRenderTarget(rt); renderer.render(scene, camera); renderer.setRenderTarget(null); rt.dispose();
      renderer.render(scene, camera); } // and once to the real framebuffer (behind the menu): blend/target states JIT here, not mid-fight
    for (const o of hidden) o.visible = false;
  } catch (err) { console.warn('prewarm', err && err.message); }
  scene.remove(tmp);
  (window.SS || {}).prewarmMs = Math.round(performance.now() - t0);
});

// Auto Low: software WebGL at start (unless ?q=high), or fps < 25 for 3 s mid-run. Applied live, no reload.
onLow(() => {
  renderer.setPixelRatio(baseDPR() * resScale); renderer.setSize(window.innerWidth, window.innerHeight); post.setSize(window.innerWidth, window.innerHeight);
  if (world.sun) world.sun.castShadow = false; renderer.shadowMap.enabled = false;
  scene.traverse((o) => { if (o.material) for (const m of (Array.isArray(o.material) ? o.material : [o.material])) m.needsUpdate = true; });
  if (scene.fog && scene.fog.density != null) scene.fog.density = Q.fog;
  camera.far = Q.far; camera.updateProjectionMatrix();
  const b = document.getElementById('quality'); if (b) b.textContent = 'Quality: ' + (window.SS.quality === 'ultra' ? 'Ultra-low' : 'Low');
  if (hud.hint && window.SS.running) hud.hint('Low quality on for smoother play');
});
window.SS.gpu = rendererString(renderer.getContext());
if ((softGL || isSoftwareRenderer(renderer.getContext())) && !EXPLICIT) goLow('software-gl');
// Startup + ongoing fps benchmark (menu included): average fps over a 2 s window (3 s in a run); < 20 -> Low.
{ let n = 0, t = 0, skip = 3; window.SS.autoLowTick = (raw) => { if (window.SS.quality === 'ultra' || (EXPLICIT && !/[?&]ultra=1/.test(location.search)) || !(raw > 0)) { n = t = 0; return; }
    if (skip > 0) { skip--; return; } // first frames include load/compile
    n++; t += raw; const win = window.SS.running ? 3 : 2; if (t < win) return;
    const fps = n / t; window.SS.benchFps = Math.round(fps * 10) / 10; n = t = 0; if (window.SS.quality === 'low') { if (fps < 10) goUltra('fps<10'); } else if (fps < 20) goLow('fps<20'); }; }

// ?debug readout: fps, quality (+ why auto-Low fired), renderer string.
if (/[?&]debug\b/.test(location.search)) {
  const el = document.createElement('div'); el.id = 'dbg-fps';
  el.style.cssText = 'position:fixed;left:6px;bottom:22px;z-index:20;font:11px monospace;color:#fff;background:rgba(0,0,0,.55);padding:2px 5px;pointer-events:none;max-width:60vw;white-space:nowrap;overflow:hidden';
  document.body.appendChild(el); let fN = 0, fT = performance.now();
  const tick = () => { fN++; requestAnimationFrame(tick); }; requestAnimationFrame(tick);
  setInterval(() => { const now = performance.now(); const fps = fN * 1000 / (now - fT); fN = 0; fT = now;
    el.textContent = 'fps ' + fps.toFixed(1) + ' · ' + (window.SS.quality || '?') + (window.SS.autoLow ? ' (auto: ' + window.SS.autoLow + ')' : '') + ' · ' + String(window.SS.gpu || '').slice(0, 60); }, 500);
}
