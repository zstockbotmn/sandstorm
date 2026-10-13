import * as THREE from 'three';
import { createWorld } from './world.js';
import { createInput } from './input.js';
import { createWeapon } from './weapon.js';
import { createHud } from './hud.js';

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 220);
camera.position.set(0, 1.7, 4);
camera.rotation.order = 'YXZ';
scene.add(camera);

const world = createWorld(scene, 0x5a7d);
const input = createInput(renderer.domElement);
const weapon = createWeapon(camera, world, scene);
const hud = createHud();

window.SS = {
  scene,
  camera,
  world,
  input,
  weapon,
  hud,
  walking: true,
  distance: 0,
  running: false,
  score: 0,
  health: 100,
};

const SPEED = 2.2;
const BASE_FOV = 70;
const SCOPE_FOV = 40;
let fov = BASE_FOV;
let eye = 1.7;
let last = 0;
let started = false;

function applyCamera(dt) {
  const st = input.state;
  const aim = 1 - Math.exp(-12 * dt);
  const duck = 1 - Math.exp(-8 * dt);
  fov += ((st.scope ? SCOPE_FOV : BASE_FOV) - fov) * aim;
  eye += ((st.cover ? 1.0 : 1.7) - eye) * duck;
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

function frame(now) {
  requestAnimationFrame(frame);
  const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
  last = now;
  if (window.SS.walking) {
    camera.position.z -= SPEED * dt;
    window.SS.distance += SPEED * dt;
  }
  applyCamera(dt || 0.016);
  weapon.update(dt, input.state);
  applyCamera(0);
  input.endFrame();
  world.update(camera.position.z);
  hud.update({
    distance: window.SS.distance,
    ammo: weapon.ammo,
    reloading: weapon.reloading,
    scoped: input.scope,
    score: window.SS.score,
    health: window.SS.health,
  });
  renderer.render(scene, camera);
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onResize);

document.getElementById('play').addEventListener('click', () => {
  document.getElementById('start').style.display = 'none';
  window.SS.walking = true;
  window.SS.running = true;
  if (!started) {
    started = true;
    requestAnimationFrame(frame);
  }
});
