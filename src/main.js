import * as THREE from 'three';
import { createWorld } from './world.js';

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

const world = createWorld(scene, 0x5a7d);

window.SS = {
  scene,
  camera,
  world,
  walking: true,
  distance: 0,
  running: false,
};

const SPEED = 2.2;
let last = 0;
let started = false;

function frame(now) {
  requestAnimationFrame(frame);
  const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
  last = now;
  if (window.SS.walking) {
    camera.position.z -= SPEED * dt;
    window.SS.distance += SPEED * dt;
  }
  camera.position.y = 1.7;
  camera.lookAt(0, 1.55, camera.position.z - 12);
  world.update(camera.position.z);
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
