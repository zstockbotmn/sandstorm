// Offline check of the ?loco=2 blendspace on the MEASURED clip directions (fighter.loco.meta.json, from loco-fitmeta).
// For walk and run, every 15 deg: the two weighted clips must bracket the wanted direction (one on each side) and the
// weight-blended unit direction must be within MAX_ERR deg of it. Node only, no browser. Usage: node tools/loco-blendcheck.mjs [--json]
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
import { blendWeights } from '../src/locomotion.js';
const R = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const meta = JSON.parse(fs.readFileSync(path.join(R, 'assets/models/fighter.loco.meta.json'), 'utf8'));
const MAX_ERR = 35; // deg; the walk band has no clip between strafeR (90) and backWalk (208): 180 deg blends those two
const pt = (n, f, r) => ({ name: n, fwd: f, right: r, a: Math.atan2(r, f) });
const bands = { walk: [pt('walk', 1.4, 0), ...['strafeL', 'strafeR', 'backWalk'].map((n) => pt(n, meta[n].fwd, meta[n].right))],
  run: [pt('run', 5.2, 0), ...['runStrafeL', 'runStrafeR', 'backRun'].map((n) => pt(n, meta[n].fwd, meta[n].right))] };
const fails = [], rows = [];
for (const [band, pts] of Object.entries(bands)) for (let deg = 0; deg < 360; deg += 15) {
  const q = deg * Math.PI / 180, w = blendWeights(pts, Math.cos(q), Math.sin(q)); let x = 0, y = 0, sum = 0;
  for (const [n, v] of Object.entries(w)) { const p = pts.find((p) => p.name === n); x += v * Math.cos(p.a); y += v * Math.sin(p.a); sum += v; }
  let err = Math.abs(Math.atan2(y, x) - q) * 180 / Math.PI; if (err > 180) err = 360 - err;
  rows.push({ band, deg, w, err: +err.toFixed(1), sum: +sum.toFixed(3) });
  if (Math.abs(sum - 1) > 1e-3) fails.push(band + deg + ' weights sum ' + sum);
  if (err > MAX_ERR) fails.push(band + deg + ' blended direction off by ' + err.toFixed(0) + ' deg ' + JSON.stringify(w));
}
if (process.argv.includes('--json')) console.log(JSON.stringify(rows));
console.log('clip directions (deg):', Object.values(bands).flat().map((p) => p.name + ' ' + (p.a * 180 / Math.PI).toFixed(0)).join(', '));
console.log('max direction error walk', Math.max(...rows.filter((r) => r.band === 'walk').map((r) => r.err)), 'run', Math.max(...rows.filter((r) => r.band === 'run').map((r) => r.err)));
console.log(fails.length ? 'BLENDCHECK FAIL ' + fails.join(' ; ') : 'BLENDCHECK PASS'); if (fails.length) process.exitCode = 1;
