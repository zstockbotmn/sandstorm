import fs from 'fs'; import * as THREE from 'three'; import { BVHLoader } from 'three/examples/jsm/loaders/BVHLoader.js';
const f = process.argv[2]; const r = new BVHLoader().parse(fs.readFileSync('assets-src/cmu/' + f + '.bvh', 'utf8')); const c = r.clip;
const hp = c.tracks.find(t => t.name === 'Hips.position'), hq = c.tracks.find(t => t.name === 'Hips.quaternion'); const n = hp.times.length, dt = hp.times[1];
const P = (i) => new THREE.Vector3().fromArray(hp.values, i*3), Y = (i) => { const fw = new THREE.Vector3(0,0,1).applyQuaternion(new THREE.Quaternion().fromArray(hq.values, i*4)); return Math.atan2(fw.x, fw.z); };
const W = Math.round(0.5/dt); let out = [];
for (let i = 0; i + W < n; i += W) { const d = P(i+W).sub(P(i)); const y = Y(i); const fwd = Math.cos(y)*d.z + Math.sin(y)*d.x, side = Math.cos(y)*d.x - Math.sin(y)*d.z; let dy = Y(i+W) - y; while (dy > Math.PI) dy -= 2*Math.PI; while (dy < -Math.PI) dy += 2*Math.PI;
  out.push(`${(i*dt).toFixed(1)}:${(fwd/0.5*0.054).toFixed(2)}/${(side/0.5*0.054).toFixed(2)}/${(dy/0.5*57).toFixed(0)}`); }
console.log(f, out.join(' '));
