import { loadFacade, raycast, texel } from './facade-sample.mjs';
import fs from 'node:fs';

const NAMES = ['bldg1', 'bldg2', 'bldg3', 'bldg4'];
const FACES = [
  { id: '+X', n: [1, 0, 0] }, { id: '-X', n: [-1, 0, 0] },
  { id: '+Z', n: [0, 0, 1] }, { id: '-Z', n: [0, 0, -1] },
];
// A12: the GLBs are in raw model units (~1.9 wide), placed at s ~ lot/1.9 (8-16 m lots). Every threshold below is in metres of a
// placed 12 m building, so scale them by U = model units per metre (it found 0 windows on the raw ~2-unit models before).
let U = 1, STEP = 0.25;
const r3 = (v) => Math.round(v * 1000) / 1000;
const samples = (lo, hi) => {
  const pts = [];
  if (hi >= lo) for (let i = 0, n = Math.floor((hi - lo) / STEP + 1e-6); i <= n; i++) pts.push(lo + i * STEP);
  return pts;
};
const median = (xs) => {
  if (!xs.length) return 0;
  const s = xs.slice().sort((a, b) => a - b), m = s.length >> 1;
  return s.length & 1 ? s[m] : (s[m - 1] + s[m]) / 2;
};
function scanFace(f, face) {
  const n = face.n, ax = n[0] ? 0 : 2, al = ax ? 0 : 2;
  const plane = (n[ax] > 0 ? f.bbox.max : f.bbox.min)[ax];
  const as = samples(f.bbox.min[al], f.bbox.max[al]);
  const ys = samples(f.bbox.min[1] + 0.6 * U, f.bbox.max[1] - 0.2 * U);
  const cells = [];
  for (let ia = 0; ia < as.length; ia++) for (let iy = 0; iy < ys.length; iy++) {
    const o = [0, ys[iy], 0];
    o[ax] = plane + 0.5 * U * n[ax]; o[al] = as[ia];
    const hit = raycast(f, o[0], o[1], o[2], -n[0], -n[1], -n[2]);
    cells.push({ ia, iy, a: as[ia], y: ys[iy], depth: hit ? hit.t - 0.5 * U : null, rgb: hit ? texel(f, hit) : null });
  }
  const hits = cells.filter((c) => c.depth != null), md = median(hits.map((c) => c.depth));
  let darkN = 0, near = 0;
  // A12: the Meshy windows are mostly geometric RECESSES, not dark texels (ASCII probe of the +Z faces). A cell is a window
  // cell if it sits 0.12-4 m behind the local wall (Meshy window holes run deep) (median depth of the 9x9 cells round it, ~2.25 m) or is a dark texel
  // on the wall plane.
  const ny0 = ys.length, at = (ia, iy) => cells[ia * ny0 + iy];
  for (const c of cells) {
    if (c.depth == null) { c.dark = false; continue; }
    const loc = []; for (let da = -4; da <= 4; da++) for (let dy = -4; dy <= 4; dy++) { const k = at(c.ia + da, c.iy + dy); if (k && c.ia + da >= 0 && c.ia + da < as.length && c.iy + dy >= 0 && c.iy + dy < ny0 && k.depth != null) loc.push(k.depth); }
    const wall = median(loc), rec = c.depth - wall;
    const [r, g, b] = c.rgb, l = 0.299 * r + 0.587 * g + 0.114 * b;
    c.dark = (rec > 0.12 * U && rec < 4.0 * U) || (Math.abs(rec) < 0.35 * U && (l < 0.22 || (l < 0.35 && Math.max(r, g, b) - Math.min(r, g, b) < 0.08)));
    if (c.dark) darkN++;
    if (c.depth < 0.6 * U) near++;
  }
  const score = hits.length ? near / hits.length + 2 * (darkN / hits.length) : 0;
  return { face, plane, ax, al, cells, score, na: as.length, ny: ys.length };
}

function windowsOf(scan) {
  const { cells, plane, ax, al, na, ny } = scan, seen = new Uint8Array(cells.length), wins = [];
  for (let i = 0; i < cells.length; i++) {
    if (!cells[i].dark || seen[i]) continue;
    const comp = [], q = [i];
    seen[i] = 1;
    for (let qi = 0; qi < q.length; qi++) {
      const c = cells[q[qi]];
      comp.push(c);
      for (const [da, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const ja = c.ia + da, jy = c.iy + dy, j = ja * ny + jy;
        if (ja < 0 || jy < 0 || ja >= na || jy >= ny || !cells[j].dark || seen[j]) continue;
        seen[j] = 1; q.push(j);
      }
    }
    let amin = Infinity, amax = -Infinity, ymin = Infinity, ymax = -Infinity, dep = 0;
    for (const c of comp) {
      amin = Math.min(amin, c.a); amax = Math.max(amax, c.a);
      ymin = Math.min(ymin, c.y); ymax = Math.max(ymax, c.y); dep += c.depth;
    }
    const w0 = amax - amin + STEP, h0 = ymax - ymin + STEP;
    const rectN = (Math.round((amax - amin) / STEP) + 1) * (Math.round((ymax - ymin) / STEP) + 1);
    if (w0 < 0.5 * U || w0 > 2.2 * U || h0 < 0.7 * U || h0 > 2.4 * U || comp.length / rectN <= 0.6) continue;
    const ctr = [0, (ymin + ymax) / 2, 0];
    ctr[ax] = plane; ctr[al] = (amin + amax) / 2;
    wins.push({ c: ctr.map(r3), w: r3(w0 - 0.12 * U), h: r3(h0 - 0.12 * U), depth: r3(dep / comp.length) });
  }
  return wins;
}

const out = {};
for (const name of NAMES) {
  try {
    const f = await loadFacade(`assets/models/${name}.glb`);
    U = (f.bbox.max[0] - f.bbox.min[0]) / 12; STEP = 0.25 * U;
    // the runtime only accepts the street face (+Z, placeArtBuilding: 'Front (+Z) faces the street'); other faces are logged only
    const scores = {}; let best = null;
    for (const face of FACES) { const s = scanFace(f, face); scores[face.id] = +s.score.toFixed(2); if (face.id === '+Z') best = s; }
    const { min, max } = f.bbox, windows = windowsOf(best);
    out[name] = { face: best.face.id, size: [max[0] - min[0], max[1] - min[1], max[2] - min[2]], windows };
    console.log(name, best.face.id, best.score.toFixed(2), windows.length, JSON.stringify(scores));
  } catch (err) { console.error(name, err); }
}
fs.writeFileSync('assets/models/windows.json', JSON.stringify(out, null, 2));
