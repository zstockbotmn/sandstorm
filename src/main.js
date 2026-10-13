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
import { createCover } from './cover.js';
import { createPostFx, wantLow } from './postfx.js';
import { createSky } from './sky.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 420);
camera.position.set(0, 1.7, 4);
camera.rotation.order = 'YXZ';
scene.add(camera);

const softGL = wantLow(renderer);
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, softGL ? 1 : 1.5));
renderer.shadowMap.enabled = !softGL;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const world = createWorld(scene, 0x5a7d);
if (softGL && world.sun) world.sun.castShadow = false;
const post = createPostFx(renderer, scene, camera);
const sky = createSky(scene);

// Daytime HDRI for high tier. The warm fog stays so the street still reads as desert.
if (art.tier === 'high') {
  new RGBELoader().load('assets/env/noon_grass_1k.hdr', (hdr) => {
    const pmrem = new THREE.PMREMGenerator(renderer);
    const env = pmrem.fromEquirectangular(hdr).texture;
    scene.environment = env;
    if (scene.environmentIntensity != null) scene.environmentIntensity = 0.72;
    hdr.dispose();
    pmrem.dispose();
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

window.SS = {
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
  const aim = 1 - Math.exp(-24 * dt); // snappier ADS so soft-GL / low fps still reaches ~2.5x
  const duck = 1 - Math.exp(-14 * dt);
  fov += ((st.scope ? SCOPE_FOV : BASE_FOV) - fov) * aim;
  eye += ((st.cover ? 1.28 : 1.7) - eye) * duck; // crouched eye clears lowered sandbags (~0.9 m)
  if (Math.abs(camera.fov - fov) > 0.01) {
    camera.fov = fov;
    camera.updateProjectionMatrix();
  }
  camera.position.y = eye;
  camera.rotation.y = -st.yaw;
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
  if (!frozen) cover.update(dt || 0.016, window.SS.walking && window.SS.running);
  applyCamera(dt || 0.016);
  const step = dt || 0.016;
  player.update(step);
  if (!frozen) enemies.update(step);
  weapon.update(dt, input.state);
  score.setDistance(window.SS.distance);
  audio.update(step);
  applyCamera(0);
  input.endFrame();
  if (!frozen) world.update(camera.position.z);
  sky.update(camera);
}

function frame(now) {
  requestAnimationFrame(frame);
  const raw = last ? (now - last) / 1000 : 0;
  last = now;
  // Catch up when frames are late (software GL): up to 4 x 50 ms so fire/walk still advance.
  const steps = raw > 0 ? Math.min(4, Math.max(1, Math.ceil(raw / 0.05))) : 1;
  const dt = raw > 0 ? Math.min(0.05, raw / steps) : 0;
  for (let i = 0; i < steps; i++) simStep(dt);
  hud.onTarget(weapon.onTarget);
  hud.update({
    distance: window.SS.distance,
    ammo: weapon.ammo,
    reloading: weapon.reloading,
    scoped: input.scope,
    score: window.SS.score,
    health: window.SS.health,
  });
  post.render();
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, softGL ? 1 : 1.5));
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
  score.reset();
  input.yaw = 0;
  input.pitch = 0;
  input.fire = false;
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
