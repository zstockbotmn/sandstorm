import { createArms } from './arms.js';
let arms = null;
document.body.classList.add('title'); // HUD + controls hidden behind the title menu (tester: visible after a page reload)
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
import { createFx3 } from './fx3.js';
import { createPost3 } from './post3.js';
import { createStakes } from './stakes.js';
import { createCover } from './cover.js';
import { createPostFx, wantLow } from './postfx.js';
import { createSky } from './sky.js';
import { preloadRapier } from './ragdoll.js';
import { Q, QUALITY, setQuality, goLow, goUltra, onLow, EXPLICIT, PICKED, isSoftwareRenderer, rendererString, FAST } from './quality.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

// Phones: no MSAA (postfx/DPR carry the look), DPR <= 1.25, cheap PCF shadows at 1024.
const PHONE = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent || '');
const FX3 = /[?&]fx=3(?:&|$)/.test(location.search);
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
// test=fast: flat untextured look for everything (raycasts use each mesh's OWN material, so hits are unchanged)
if (FAST) { scene.overrideMaterial = new THREE.MeshBasicMaterial({ color: 0x8a8478 }); }
if (art.tier === 'high' && !FAST) {
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

window.SS = { fast: FAST,
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
let fx = null, post3 = null;
let fxPx = 0, fxPy = 0;
function clearFxPos() {
  if (!fxPx && !fxPy) return;
  camera.position.x -= fxPx;
  camera.position.y -= fxPy;
  fxPx = 0; fxPy = 0;
}
if (FX3) { fx = createFx3({ camera, audio, scene }); window.SS.fx = fx; post3 = createPost3({ renderer }); }
window.SS.renderer = renderer; // headless shots read info.render.triangles

const priorHit = weapon.onHit;
weapon.onHit = function onHit(info) {
  const wasAlive = !!(info && info.enemy && info.enemy.alive); // m1v: accuracy counts hits on LIVE enemies only
  if (priorHit) priorHit(info);
  if (wasAlive) score.registerHit();
  audio.hit();
};
weapon.onShot = function onShot() {
  score.registerShot();
  audio.gunfire();
  if (fx) fx.kick('shot', 1);
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
window.SS.walkSpeed = SPEED;
const BASE_FOV = 70;
const SCOPE_FOV = 28; // ~2.5x
let fov = BASE_FOV;
let eye = 1.7;
let last = 0;
let started = false;

function applyCamera(dt) {
  if (window.__freezeCam) return; // test hook: hold a staged camera (truck close-up)
  const st = input.state;
  const aim = 1 - Math.exp(-36 * dt); // snappier ADS so soft-GL / low fps still reaches ~2.5x
  const duck = 1 - Math.exp(-14 * dt);
  fov = st.scope ? SCOPE_FOV : BASE_FOV; // instant zoom (lerp took 2-3 s at low fps)
  const upEye = cover.kind === 'car' && cover.state !== 'none' ? 1.85 : 1.7; // m1s: see over a burned car's roof
  eye += ((st.cover ? (cover.kind === 'car' && cover.state !== 'none' ? 1.32 : 1.28) : upEye) - eye) * duck; // crouched eye clears lowered sandbags (~0.9 m)
  if (Math.abs(camera.fov - fov) > 0.01) {
    camera.fov = fov;
    camera.updateProjectionMatrix();
  }
  if (fx) clearFxPos();
  camera.position.y = eye;
  camera.rotation.y = -st.yaw + (window.SS_VIEW_YAW || 0); // test hook: look sideways/backward for coverage shots
  camera.rotation.x = -st.pitch;
  camera.rotation.z = 0;
  if (fx) {
    const o = fx.offsets();
    camera.rotation.x += o.pitch;
    camera.rotation.y += o.yaw;
    camera.rotation.z = o.roll;
    camera.position.x += o.x;
    camera.position.y += o.y;
    fxPx = o.x; fxPy = o.y;
  }
  camera.updateMatrixWorld();
}

function simStep(dt) {
  if (fx && !window.__freezeCam) clearFxPos(); // walk and cover read the unshaken body position
  if (fx) fx.update(dt || 0);
  if (post3 && !window.SS.subStep) post3.update(dt || 0);
  if (window.SS.running) window.SS.simTime = (window.SS.simTime || 0) + (dt || 0);
  const frozen = !player.alive; // death freezes the world: no walking, no enemy/world updates
  if (window.SS.walking && !frozen) {
    camera.position.z -= SPEED * dt;
    window.SS.distance += SPEED * dt;
  }
  input.applyAim(dt || 0.016); input.onTarget = weapon.onTarget;
  if (!frozen && !window.__freezeCam && (window.SS.running || !document.body.classList.contains("title"))) cover.update(dt || 0.016, window.SS.walking && window.SS.running); // title backdrop: no cover moves (camera clipped a prop)
  applyCamera(dt || 0.016);
  const step = dt || 0.016;
  // Fire BEFORE enemies move: shots test the hitboxes exactly where the last rendered frame showed them (firing after
  // the enemy update tested next-frame positions - a running fighter at 20 fps had moved ~0.25 m off the crosshair).
  weapon.update(dt, input.state);
  if (window.SS.quality === 'ultra-low' && (ultraT += dt || 0) > 2) { ultraT = 0; try { ultraTrim(); } catch (e) {} }
  if (FAST && (fastT += dt || 0) > 1) { fastT = 0; try { fastTrim(); } catch (e) {} }
  if (arms) { try { arms.update(weapon.reloadProgress()); } catch (err) { console.warn('arms', err); arms = null; } }
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
function frame(now) { window.SS.frameN = (window.SS.frameN | 0) + 1;
  requestAnimationFrame(frame);
  if (!window.SS.running && document.body.classList.contains('starting')) { last = 0; return; } // m1v: let 'Starting...' present (no GPU work until the run is live)
  const raw = last ? (now - last) / 1000 : 0; const tFrame = performance.now();
  last = now;
  adaptRes(raw); if (window.SS.autoLowTick) window.SS.autoLowTick(Math.min(raw, 1));
  if (raw > 0.25 && window.SS && window.SS.running) (window.SS.hitches = window.SS.hitches || []).push([Math.round(now), Math.round(raw * 1000), window.SS.engaged | 0]);
  // Catch up when frames are late (software GL): up to 4 x 50 ms so fire/walk still advance.
  const steps = raw > 0 ? Math.min(4, Math.max(1, Math.ceil(raw / 0.05))) : 1;
  const dt = raw > 0 ? Math.min(0.05, raw / steps) : 0;
  const slow = (window.SS.slowmoUntil || 0) > performance.now() ? 0.3 : 1; window.SS.timeScale = slow;
  window.SS.lastSimDt = dt * slow * steps; // tests: this frame's total sim time (a tracking aim leads by about this much)
  try { for (let i = 0; i < steps; i++) { window.SS.subStep = i; simStep(dt * slow); } window.SS.subStep = 0; }
  catch (err) { // never freeze HUD/render on a sim error; report once per message
    const k = String(err && err.message); if (!frameErrs.has(k)) { frameErrs.add(k); console.error('[sandstorm] sim step failed:', err && (err.stack || err)); (window.SS.errors = window.SS.errors || []).push('sim:' + k); } }
  { const sw = document.getElementById('switch-cover'); if (sw) sw.classList.toggle('on', cover.state !== 'none' && player.alive && window.SS.running); }
  hud.onTarget(weapon.onTarget); hud.setScope(!!input.scope && player.alive && window.SS.running);
  hud.update({
    distance: window.SS.distance,
    ...(() => { if (weapon.reloading) { if (!window.__ammoLatch) window.__ammoLatch = { ammo: weapon.ammo, reserve: weapon.reserve }; return window.__ammoLatch; } window.__ammoLatch = null; return { ammo: weapon.ammo, reserve: weapon.reserve }; })(), // counter holds still mid-reload (tester: flickered to 5/180), then jumps once to the result
    reloading: weapon.reloading, reloadP: weapon.reloadProgress ? weapon.reloadProgress() : null,
    scoped: input.scope,
    score: window.SS.score,
    health: window.SS.health,
  });
  const tr = performance.now(); const simMs = tr - tFrame;
  if (Q.post && !post.low) post.render(); else renderer.render(scene, camera);
  window.SS.lastVP = (window.SS.lastVP || new THREE.Matrix4()).multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse); // m1w: taps hit-test what was ON SCREEN
  { const lc = window.SS.lastCam || (window.SS.lastCam = { p: new THREE.Vector3(), q: new THREE.Quaternion(), ok: false, n: 0 });
    camera.getWorldPosition(lc.p); camera.getWorldQuaternion(lc.q); lc.ok = !!window.SS.running; lc.n = window.SS.frameN | 0; } // m1x: shots use the view that was ON SCREEN
  if (window.SS.running && window.SS.firstRunFrame) window.SS.firstRunFrame(); // drop 'Starting...' + unmute with the first run frame
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
// Title backdrop (tester m1r: black title on Low/High): the frame loop only starts on Play, so until then redraw the
// street a few times a second (also after resizes, which clear the canvas).
{ let lastTitle = 0, lastRaf = 0, lastSig = '', doneT = 0; const titleDraw = (t) => { if (started) return; if (document.body.classList.contains('starting')) { requestAnimationFrame(titleDraw); return; } // m1v: no title GPU work while 'Starting...' must get on screen
    // m1u: with no manual pick the title also benchmarks (a fresh profile sat on High at 0.5 fps): draw every frame and
    // feed the real frame time to the auto tier steps until the tier settles; a pick/?q= keeps the cheap 4 Hz redraw.
    const bench = !EXPLICIT && !PICKED && window.SS.quality !== 'ultra-low' && art.done && !/[?&]titlebench=0\b/.test(location.search); const raw = lastRaf ? (t - lastRaf) / 1000 : 0; lastRaf = t;
    if (bench && raw > 0 && window.SS.autoLowTick) window.SS.autoLowTick(Math.min(raw, 1));
    // m1v: the title view is static - outside the bench, redraw only when something changed (art/textures landed, resize)
    // plus a 1 Hz settle for 4 s after the art is done; a 4 Hz full redraw held a throttled press back by seconds.
    const sig = (art.done ? 1 : 0) + ':' + scene.children.length + ':' + renderer.domElement.width + 'x' + renderer.domElement.height + ':' + renderer.info.memory.textures + ':' + renderer.info.memory.geometries;
    if (art.done && !doneT) doneT = t; const settle = doneT && t - doneT < 4000 && t - lastTitle > 1000;
    if (bench || sig !== lastSig || settle || (!art.done && t - lastTitle > 400)) { lastTitle = t; lastSig = sig; // m1s: draw the placeholder street immediately, real art as it lands
    try { camera.updateMatrixWorld(); if (Q.post && !post.low) post.render(); else renderer.render(scene, camera); } catch (e) {} } requestAnimationFrame(titleDraw); };
  requestAnimationFrame(titleDraw); }

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
      ' · Accuracy ' + e.accuracy + '%' + (e.shots != null ? ' (' + e.hits + '/' + e.shots + ' hits)' : '');
  }
  overTable.innerHTML = '<tr><th>#</th><th>Score</th><th>Dist</th><th>Kills</th><th>HS</th><th>Acc</th><th>Date</th></tr>';
  const rows = result.table || [];
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const tr = document.createElement('tr');
    const when = (() => { const d = new Date(r.date || ''); if (isNaN(d)) return ''; const p = (n) => String(n).padStart(2, '0'); return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes()); })(); // local time (stored as UTC ISO)
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
  fov = BASE_FOV; camera.fov = BASE_FOV; camera.updateProjectionMatrix(); // m1v: restart leaves the scope fully (fov back now)
  eye = 1.7;
  window.SS.distance = 0;
  window.SS.health = 100;
  window.SS.bursting = false; window.SS.engaged = 0; window.SS.waveClears = 0; window.SS.slowmoUntil = 0; window.SS.runs = (window.SS.runs | 0) + 1;
  window.SS.walking = true;
  window.SS.running = true; window.SS.startedAt = performance.now(); window.SS.firstCoverT = 0; window.SS.coverGraceUntil = 0; window.SS.simTime = 0; document.body.classList.remove('title'); if (window.SS.pendingTierToast && hud.hint) { const m = window.SS.pendingTierToast; window.SS.pendingTierToast = null; setTimeout(() => hud.hint(m), 600); } if (window.SS.input) window.SS.input.fire = false;
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

// m1t: Play acts on pointerdown (one press under lag), once per title; click remains the keyboard path + audio unlock.
let playDone = false;
// m1u: instant feedback - 'Starting...' paints on the press, the heavy start runs after that paint, the overlay and the
// audio (muted until then) come up with the first run frame.
window.SS.firstRunFrame = () => { if (!document.body.classList.contains('starting')) return; document.body.classList.remove('starting'); try { audio.go(); } catch (_) {} window.SS.startPaintMs = Math.round(performance.now() - (window.SS.pressT || 0)); };
// m1v: heavy start work only after the 'Starting...' frame was produced: two rAFs (the first frame with the overlay has
// been committed) plus a short timeout so a slow GPU/compositor presents it before shader compiles/uploads queue up.
const afterPaint = (fn) => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(fn, 200))));
// m1v: the overlay goes into the DOM first thing in the press; audio.unlock only creates/resumes the context (its graph is
// built after the paint) and the heavy start waits for afterPaint.
const playPress = (ev) => { if (!playDone) { playDone = true; const now = performance.now(); window.SS.pressT = now; document.body.classList.add('starting');
    window.SS.startDiag = { queueMs: ev && ev.timeStamp ? Math.round(now - ev.timeStamp) : null }; requestAnimationFrame(() => { window.SS.startDiag.raf1Ms = Math.round(performance.now() - now); });
    afterPaint(startNow); } try { audio.unlock(); } catch (_) {} };
{ const pb = document.getElementById('play'); pb.addEventListener('pointerdown', (ev) => { if (ev.cancelable) ev.preventDefault(); playPress(ev); }); pb.addEventListener('click', playPress); }
function startNow() { window.SS.startNowAt = Date.now(); // m1v: wall clock when the heavy start begins (tests compare with presented frames)
  document.getElementById('start').style.display = 'none';
  restartRun(); // first start and Restart share one full reset (tester m1r: Restart left wave/spawner state behind)
  // m1v: chunked heavy start - yield after the reset, then compile the run's shaders asynchronously (parallel compile
  // where available, capped at 2.5 s) before the first run frame, so the page keeps painting 'Starting...'.
  setTimeout(() => { let done = false; const go = () => { if (done) return; done = true; startRunLive(); };
    try { const pr = renderer.compileAsync ? renderer.compileAsync(scene, camera) : null; if (pr && pr.then) { pr.then(go, go); setTimeout(go, 2500); } else go(); } catch (_) { go(); } }, 0);
}
function startRunLive() {
  window.SS.walking = true;
  window.SS.running = true; window.SS.startedAt = performance.now(); document.body.classList.remove('title'); if (window.SS.pendingTierToast && hud.hint) { const m = window.SS.pendingTierToast; window.SS.pendingTierToast = null; setTimeout(() => hud.hint(m), 600); } if (window.SS.input) window.SS.input.fire = false;
  if (!started) {
    started = true;
    requestAnimationFrame(frame);
  }
}

// Act on pointerdown (tester: short taps dropped at low fps - a click needs down+up on the same element); click is the
// keyboard/fallback path, de-duplicated so one press never restarts twice.
{ let lastR = 0; const go = (e) => { const now = performance.now(); if (now - lastR < 600) return; lastR = now; if (e && e.preventDefault) e.preventDefault(); audio.unlock(); try { audio.hush(); } catch (_) {} input.scope = false; hud.setScope(false); window.SS.pressT = now; /* m1v: scope + overlay drop on the press itself */ document.body.classList.add('starting'); afterPaint(() => { window.SS.startNowAt = Date.now(); restartRun(); requestAnimationFrame(() => requestAnimationFrame(() => window.SS.firstRunFrame())); }); };
  const rb = document.getElementById('restart'); rb.addEventListener('pointerdown', go); rb.addEventListener('click', go); }

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
art.onReady(() => { document.body.classList.add('ready'); });
art.onLate((name) => { if ((name === 'rifle_m4' || name === 'rifle_ak47') && weapon.modelName !== 'rifle_m4') { const r = art.staticInstance(name); if (r) { r.name = name; if (weapon.model && weapon.model.parent) weapon.model.parent.remove(weapon.model); weapon.setModel(r, /[?&]rflip=1/.test(location.search)); } } }); // slow start: the real rifle replaces the placeholder when it lands
art.onReady(() => { const m4 = art.staticInstance('rifle_m4'); if (m4) m4.name = 'rifle_m4'; const r = m4 || art.staticInstance('rifle_ak47'); if (r) weapon.setModel(r, /[?&]rflip=1/.test(location.search));
  if (m4 && weapon.model && art.get('fps_arms') && /[?&]arms=1/.test(location.search) /* hands opt-in (?arms=1) until they read as a gloved soldier grip */) { try { arms = createArms(art.get('fps_arms'), art.anims('fps_arms'), camera);
    if (arms) { weapon.model.parent.add(arms.root); arms.attach(weapon.model); window.SS.arms = arms; } } catch (err) { console.warn('arms', err); arms = null; } } });

// Rapier (ragdoll physics, ~4 MB) is fetched after the first rendered frames, never before Play/first paint.
let rapierQueued = false;
function queueRapier() { if (rapierQueued || /[?&]rapier=0/.test(location.search)) return; rapierQueued = true; setTimeout(() => (window.requestIdleCallback ? requestIdleCallback(() => preloadRapier(), { timeout: 1500 }) : setTimeout(() => preloadRapier(), 1500)), 0); }
document.getElementById('play').addEventListener('click', () => requestAnimationFrame(() => requestAnimationFrame(queueRapier)));

// Quality toggle on the start screen (saved in localStorage; applies on reload).
{ const b = document.getElementById('quality');
  // Shows the tier in use (incl. an auto/saved Ultra-low) and cycles Ultra-low -> Low -> High; a pick sticks (no auto override).
  if (b) { const cur = () => (window.SS.quality === 'ultra-low' ? 'ultra-low' : QUALITY === 'low' || window.SS.quality === 'low' ? 'low' : 'high');
    const label = () => { const c = cur(); b.textContent = 'Quality: ' + (c === 'ultra-low' ? 'Ultra-low' : c === 'low' ? 'Low' : 'High') + (window.SS.autoLow && !PICKED ? ' (auto) - tap to change' : ' - tap to change'); };
    window.SS.qualityLabel = label; label();
    // m1t: act on pointerdown (laggy clicks needed repeats) and exactly once: a second press while the reload is pending
    // used to step the cycle again (High -> Ultra-low), which then looked like an auto fallback.
    let picked = false; const pick = (ev) => { ev.stopPropagation(); if (ev.cancelable) ev.preventDefault(); if (picked) return; picked = true; const c = cur(); const next = c === 'ultra-low' ? 'low' : c === 'low' ? 'high' : 'ultra-low';
      b.textContent = 'Quality: ' + (next === 'ultra-low' ? 'Ultra-low' : next === 'low' ? 'Low' : 'High') + ' - loading\u2026'; b.disabled = true; window.SS.qualityPicks = (window.SS.qualityPicks | 0) + 1; setQuality(next); };
    b.addEventListener('pointerdown', pick); b.addEventListener('click', pick); }
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
  try { renderer.render(scene, camera); } catch (e) {} // redraw without the prewarm set: the title backdrop showed it (m1p: red/yellow shapes 'clipping' the camera)
  (window.SS || {}).prewarmMs = Math.round(performance.now() - t0);
});

// Ultra-low (tester: < 10 fps): fewer draw calls, not just fewer pixels. The distant skyline (backdrop rows, never
// cover) is hidden; colliders, fighters, the rifle/hands, drops and grenades are
// never touched (they are not in the segment groups), so cover and hits behave exactly as before. Re-run as segments recycle.
const _ultraS = new THREE.Sphere(); let ultraT = 0;
// test=fast: hide only the backdrop rows (never colliders or shot props: shotList skips hidden props, which would change LOS)
let fastT = 0; function fastTrim() { const keep = new Set(world.colliders || []); for (const seg of world.segments || []) { if (seg && seg.group) seg.group.traverse((o) => { if (o.userData.backdrop && o.visible && !keep.has(o) && !o.userData.shotProp) o.visible = false; }); } }
function ultraTrim() { let hid = 0; const keep = new Set(world.colliders || []);
  for (const seg of world.segments || []) { if (!seg || !seg.group) continue; seg.group.traverse((o) => {
    if (!o.isMesh || o.isSkinnedMesh || !o.visible || keep.has(o) || o.userData.ultraKeep || !o.geometry) return;
    if (o.userData.backdrop) { o.visible = false; hid++; return; } // distant skyline: in the fog anyway
    if (!o.geometry.boundingSphere) o.geometry.computeBoundingSphere(); o.updateWorldMatrix(true, false); _ultraS.copy(o.geometry.boundingSphere).applyMatrix4(o.matrixWorld);
    o.userData.ultraKeep = true; }); } // small clutter stays: hiding it left its collider in place, so enemies seen 'in the open' were behind invisible cover and shots never landed (m1p stall)
  window.SS.ultraHidden = (window.SS.ultraHidden | 0) + hid; }
// Auto Low: software WebGL at start (unless ?q=high), or fps < 25 for 3 s mid-run. Applied live, no reload.
onLow(() => {
  renderer.setPixelRatio(baseDPR() * resScale); renderer.setSize(window.innerWidth, window.innerHeight); post.setSize(window.innerWidth, window.innerHeight);
  if (world.sun) world.sun.castShadow = false; renderer.shadowMap.enabled = false;
  scene.traverse((o) => { if (o.material) for (const m of (Array.isArray(o.material) ? o.material : [o.material])) m.needsUpdate = true; });
  if (scene.fog && scene.fog.density != null) scene.fog.density = Q.fog;
  camera.far = Q.far; camera.updateProjectionMatrix();
  // Ultra-low (tester: < 10 fps): fewer draw calls, not just fewer pixels. Small non-colliding clutter (debris, bottles,
  // rubble bits) is hidden and every remaining static mesh stops recomputing its matrix each frame. Colliders, fighters,
  // the rifle/hands and drops are untouched, so cover and hits behave exactly as before.
  if (window.SS.quality === 'ultra-low') ultraTrim();
  if (window.SS.qualityLabel) window.SS.qualityLabel();
  { const msg = (window.SS.quality === 'ultra-low' ? 'Ultra-low' : 'Low') + ' quality on for smoother play'; window.SS.tierToast = msg; if (hud.hint && window.SS.running) hud.hint(msg); else window.SS.pendingTierToast = msg; } // shown now, or at run start if it switched on the menu // names the tier actually applied (fix 8)
});
window.SS.gpu = rendererString(renderer.getContext());
window.SS.THREE = THREE; window.SS.world = world; // tests
window.SS.camera = camera; // perf/debug probes (test/perf-bldg.js)
window.SS.goUltra = (r) => { goLow(r || 'debug'); goUltra(r || 'debug'); }; // tests
if ((softGL || isSoftwareRenderer(renderer.getContext())) && !EXPLICIT && !PICKED && !/[?&]start=high\b/.test(location.search)) goLow('software-gl'); // ?start=high (tests): act like a weak real GPU
// Remember the auto-chosen tier across reloads (tester): a saved ultra-low starts as ultra-low.
try { if (!EXPLICIT && localStorage.getItem('ss.quality') === 'ultra-low') { const why = PICKED ? 'picked' : 'saved'; goLow(why); goUltra(why); if (PICKED) window.SS.autoLow = null; } } catch (e) {} // a picked Ultra-low is not 'auto'
// Startup + ongoing fps benchmark (menu included): average fps over a 2 s window (3 s in a run); < 20 -> Low.
{ let n = 0, t = 0, skip = 3; window.SS.autoLowTick = (raw) => {
    // Ultra-low still too slow (tester box < 3.5 fps): step the render scale down 0.4 -> 0.3 -> 0.22 (ultra-low only).
    if (window.SS.quality === 'ultra-low' && raw > 0 && !EXPLICIT) { n++; t += raw; if (t < 3) return; const fps = n / t; n = t = 0; window.SS.benchFps = Math.round(fps * 10) / 10;
      if (fps < 4 && Q.res > 0.23) { Q.res = Math.max(0.22, +(Q.res * 0.75).toFixed(2)); window.SS.ultraRes = Q.res; onResize(); } return; }
    if (window.SS.quality === 'ultra-low' || ((EXPLICIT || PICKED) && !/[?&]ultra=1/.test(location.search)) || !(raw > 0)) { n = t = 0; return; } // a menu pick is never auto-lowered
    if (skip > 0) { skip--; return; } // first frames include load/compile
    n++; t += raw; const win = window.SS.running ? 3 : 2; if (t < win) return;
    const fps = n / t; window.SS.benchFps = Math.round(fps * 10) / 10; n = t = 0; if (window.SS.quality === 'low') { if (fps < 10) goUltra('fps<10'); } else if (fps < 20) goLow('fps<20'); }; }

// ?debug readout: fps, quality (+ why auto-Low fired), renderer string.
// Debug-only kill helper (?debug or automation): K, or the small KILL button, kills the nearest live enemy with a normal head
// hit (same hitEnemy path as a real round: marker, score, kill fall). Tester: 0.7 fps taps never landed, so the last-enemy case
// could not be reached.
if (/[?&]debug\b/.test(location.search) || navigator.webdriver === true) {
  window.SS.debugKillNearest = () => { const L = (window.SS.enemies && window.SS.enemies.list) || []; let best = null, bd = 1e9;
    for (const e of L) { if (!e.alive || e.dying) continue; const d = e.group.position.distanceTo(camera.position); if (d < bd) { bd = d; best = e; } }
    if (!best) return null; const hp = best.bones && best.bones.Head ? best.bones.Head.getWorldPosition(new THREE.Vector3()) : best.group.position.clone().setY(1.6);
    best.health = Math.min(best.health, 1); best.takeHit('head', hp); return best; };
  // A2 tester: legs hidden behind a cart could not be hit, so the limp/clutch couldn't be checked. Forced, non-lethal hits on the
  // nearest fighter's left leg / left arm / torso through the normal hit path (zone, wound, reaction, damage capped to stay alive).
  const DBG_HIT = { legL: ['limb', 'LeftUpLeg', 'LeftLeg'], armL: ['limb', 'LeftArm', 'LeftForeArm'], torso: ['body', 'Hips', 'Spine02'] };
  window.SS.debugHitNearest = (zone) => { const spec = DBG_HIT[zone]; if (!spec) return null; const L = (window.SS.enemies && window.SS.enemies.list) || []; let best = null, bd = 1e9;
    for (const e of L) { if (!e.alive || e.dying) continue; const d = e.group.position.distanceTo(camera.position); if (d < bd) { bd = d; best = e; } }
    if (!best) return null; const B = best.bones || {}, a = B[spec[1]], b = B[spec[2]] || B.Spine01 || B.Spine; let pt;
    if (a && b) pt = a.getWorldPosition(new THREE.Vector3()).lerp(b.getWorldPosition(new THREE.Vector3()), 0.5); else pt = best.group.position.clone().setY(zone === 'legL' ? 0.6 : zone === 'armL' ? 1.3 : 1.1);
    best.health = Math.max(best.health, 80); best.takeHit(spec[0], pt); window.SS.lastDebugHit = { zone, got: best.lastHitZone || null }; return best; };
  window.SS.debugMoveNearest = () => { const L = (window.SS.enemies && window.SS.enemies.list) || []; let best = null, bd = 1e9;
    for (const e of L) { if (!e.alive || e.dying) continue; const d = e.group.position.distanceTo(camera.position); if (d < bd) { bd = d; best = e; } }
    const r = best && window.SS.enemies.debugMove ? window.SS.enemies.debugMove(best) : null; window.SS.lastDebugMove = r; return r; };
  window.addEventListener('keydown', (e) => { if (!window.SS.running) return; if (e.key === 'k' || e.key === 'K') window.SS.debugKillNearest();
    else if (e.key === 'm' || e.key === 'M') window.SS.debugMoveNearest();
    else if (e.key === 'l' || e.key === 'L') window.SS.debugHitNearest('legL'); else if (e.key === 'a' || e.key === 'A') window.SS.debugHitNearest('armL'); else if (e.key === 't' || e.key === 'T') window.SS.debugHitNearest('torso'); });
  if (/[?&]debug\b/.test(location.search)) { const kb = document.createElement('button'); kb.id = 'dbg-kill'; kb.textContent = 'KILL';
    kb.style.cssText = 'position:fixed;right:8px;top:64px;z-index:30;font:600 11px monospace;color:#fff;background:rgba(160,30,30,.8);border:0;border-radius:4px;padding:4px 8px';
    kb.addEventListener('pointerdown', (e) => { e.stopPropagation(); e.preventDefault(); if (window.SS.running) window.SS.debugKillNearest(); }); document.body.appendChild(kb);
    { const mb = document.createElement('button'); mb.id = 'dbg-move'; mb.textContent = 'MOVE';
      mb.style.cssText = 'position:fixed;right:8px;top:176px;z-index:30;font:600 11px monospace;color:#fff;background:rgba(30,90,150,.85);border:0;border-radius:4px;padding:4px 8px';
      mb.addEventListener('pointerdown', (e) => { e.stopPropagation(); e.preventDefault(); if (window.SS.running) window.SS.debugMoveNearest(); }); document.body.appendChild(mb); }
    [['LEG', 'legL', 92], ['ARM', 'armL', 120], ['TORSO', 'torso', 148]].forEach(([label, zone, top]) => { const hb = document.createElement('button'); hb.id = 'dbg-hit-' + zone; hb.textContent = label;
      hb.style.cssText = 'position:fixed;right:8px;top:' + top + 'px;z-index:30;font:600 11px monospace;color:#fff;background:rgba(150,110,20,.85);border:0;border-radius:4px;padding:4px 8px';
      hb.addEventListener('pointerdown', (e) => { e.stopPropagation(); e.preventDefault(); if (window.SS.running) window.SS.debugHitNearest(zone); }); document.body.appendChild(hb); }); }
}
if (/[?&]debug\b/.test(location.search)) {
  const el = document.createElement('div'); el.id = 'dbg-fps';
  el.style.cssText = 'position:fixed;left:6px;bottom:22px;z-index:20;font:11px monospace;color:#fff;background:rgba(0,0,0,.55);padding:2px 5px;pointer-events:none;max-width:60vw;white-space:nowrap;overflow:hidden';
  document.body.appendChild(el); let fN = 0, fT = performance.now();
  const tick = () => { fN++; requestAnimationFrame(tick); }; requestAnimationFrame(tick);
  setInterval(() => { const now = performance.now(); const fps = fN * 1000 / (now - fT); fN = 0; fT = now;
    el.textContent = 'fps ' + fps.toFixed(1) + ' · ' + (window.SS.quality || '?') + (window.SS.autoLow ? ' (auto: ' + window.SS.autoLow + ')' : '') + ' · ' + String(window.SS.gpu || '').slice(0, 60); }, 500);
}
