import { loadFacade, raycast, texel } from './facade-sample.mjs';
import fs from 'node:fs';

const NAMES = ['bldg1', 'bldg2', 'bldg3', 'bldg4'];
const FACES = [
  { id: '+X', n: [1, 0, 0] }, { id: '-X', n: [-1, 0, 0] },
  { id: '+Z', n: [0, 0, 1] }, { id: '-Z', n: [0, 0, -1] },
];
// A12: the GLBs are in raw model units (~1.9 wide), placed at s ~ lot/1.9 (8-16 m lots). Every threshold below is in metres of a
// placed 12 m building, so scale them by U = model units per metre (it found 0 windows on the raw ~2-unit models before).
let U = 1, STEP = 0.25, scanStats = null;
const DRY = process.argv.includes('--dry'); const MAPN = (process.argv.find((a) => a.startsWith('--map=')) || '').slice(6); let rej = []; // --map=bldg2: ASCII of the window cells + component sizes (m) // A15: print counts only, do not write assets/models/windows.json
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
  const hits = cells.filter((c) => c.depth != null);
  let darkN = 0, near = 0;
  // A12: the Meshy windows are mostly geometric RECESSES; A15 (bldg2 ~15 visible, table had 6): the recesses are shallow
  // (0.05-0.35 m on a 12 m facade) and the facade texture is bright (absolute luminance < 0.22 almost never fires).
  // Per cell: rec = depth behind the LOCAL wall (median of the 9x9 cells round it); lum is judged RELATIVE to the
  // facade's own wall luminance (median of on-plane cells). win = recess 0.05-4 m, or on-plane and >= 22% darker than
  // the wall (or the old absolute dark rule). c.s keeps a soft score for the grid prior.
  const ny0 = ys.length, at = (ia, iy) => (ia >= 0 && ia < as.length && iy >= 0 && iy < ny0 ? cells[ia * ny0 + iy] : null);
  for (const c of cells) {
    if (c.depth == null) { c.rec = null; continue; }
    const loc = []; for (let da = -4; da <= 4; da++) for (let dy = -4; dy <= 4; dy++) { const k = at(c.ia + da, c.iy + dy); if (k && k.depth != null) loc.push(k.depth); }
    c.rec = c.depth - median(loc); const [r, g, b] = c.rgb; c.l = 0.299 * r + 0.587 * g + 0.114 * b; c.sat = Math.max(r, g, b) - Math.min(r, g, b);
  }
  // local wall luminance (13x13 cells, ~3.25 m): broad dirt / soot gradients on the lower floors are not windows
  for (const c of cells) { if (c.depth == null) continue; const ll = []; for (let da = -6; da <= 6; da++) for (let dy = -6; dy <= 6; dy++) { const k = at(c.ia + da, c.iy + dy); if (k && k.depth != null && k.l != null) ll.push(k.l); } c.locL = median(ll); }
  const wallL = median(hits.filter((c) => Math.abs(c.rec) < 0.05 * U).map((c) => c.l)) || 0.5;
  for (const c of cells) {
    if (c.depth == null) { c.dark = false; c.s = 0; continue; }
    const recW = c.rec > 0.05 * U && c.rec < 4.0 * U, onPlane = Math.abs(c.rec) < 0.35 * U;
    const darkW = onPlane && c.l < c.locL * 0.72 && c.locL - c.l > 0.06 && (c.l < wallL * 0.8 || c.l < 0.22); // darker than its OWN neighbourhood
    c.dark = recW || darkW; c.recW = recW; c.darkW = darkW; c.s = (recW ? Math.min(1, c.rec / (0.15 * U)) : 0) + (darkW ? Math.min(1, (wallL - c.l) / (0.4 * wallL)) : 0);
    if (c.dark) darkN++;
    if (c.depth < 0.6 * U) near++;
  }
  // morphological closing (3x3 dilate then erode) joins a window split by a mullion / sill texel into one component
  const dil = cells.map((c) => c.dark || [[1,0],[-1,0],[0,1],[0,-1]].some(([da, dy]) => { const k = at(c.ia + da, c.iy + dy); return k && k.dark; }));
  for (let i = 0; i < cells.length; i++) { const c = cells[i]; c.win = dil[i] && c.depth != null && [[1,0],[-1,0],[0,1],[0,-1]].every(([da, dy]) => { const k = at(c.ia + da, c.iy + dy); return !k || dil[k.ia * ny0 + k.iy]; }); }
  const score = hits.length ? near / hits.length + 2 * (darkN / hits.length) : 0;
  scanStats = { wallL: +wallL.toFixed(3), darkFrac: hits.length ? +(darkN / hits.length).toFixed(3) : 0 };
  return { face, plane, ax, al, cells, score, na: as.length, ny: ys.length, y0: f.bbox.min[1] };
}

// A15: two passes - (1) RECESS components (the reliable cue), (2) DARK-only components away from accepted windows with a
// stricter fill - so dark sill / dirt cells can no longer chain several windows into one oversized blob (bldg1).
function closeMask(scan, flag) { const { cells, na, ny } = scan, at = (ia, iy) => (ia >= 0 && ia < na && iy >= 0 && iy < ny ? cells[ia * ny + iy] : null), N4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const dil = cells.map((c) => !!c[flag] || N4.some(([da, dy]) => { const k = at(c.ia + da, c.iy + dy); return k && k[flag]; }));
  return cells.map((c, i) => dil[i] && c.depth != null && N4.every(([da, dy]) => { const k = at(c.ia + da, c.iy + dy); return !k || dil[k.ia * ny + k.iy]; })); }
function windowsOf(scan) {
  const { cells, plane, ax, al, na, ny } = scan, wins = [], taken = new Uint8Array(cells.length);
  const pass = (mask, minFill) => { const seen = new Uint8Array(cells.length);
  for (let i = 0; i < cells.length; i++) {
    if (!mask[i] || seen[i] || taken[i]) continue;
    const comp = [], q = [i];
    seen[i] = 1;
    for (let qi = 0; qi < q.length; qi++) {
      const c = cells[q[qi]];
      comp.push(c);
      for (const [da, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const ja = c.ia + da, jy = c.iy + dy, j = ja * ny + jy;
        if (ja < 0 || jy < 0 || ja >= na || jy >= ny || !mask[j] || seen[j] || taken[j]) continue;
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
    if (MAPN) rej.push([+(w0 / U).toFixed(2), +(h0 / U).toFixed(2), +(comp.length / rectN).toFixed(2), +(((ymin + ymax) / 2 - scan.y0) / U).toFixed(1)]);
    if (w0 < 0.45 * U || w0 > (h0 >= 1.2 * U ? 3.4 : 2.4) * U || h0 < 0.6 * U || h0 > 2.8 * U || comp.length / rectN <= minFill) continue; // A15: shop / arcade windows up to 3.4 m wide when >= 1.2 m tall
    const ctr = [0, (ymin + ymax) / 2, 0];
    ctr[ax] = plane; ctr[al] = (amin + amax) / 2;
    wins.push({ c: ctr.map(r3), w: r3(w0 - 0.12 * U), h: r3(h0 - 0.12 * U), depth: r3(dep / comp.length), _a: (amin + amax) / 2, _y: (ymin + ymax) / 2 });
    for (const k of cells) if (Math.abs(k.a - (amin + amax) / 2) <= w0 / 2 + STEP && Math.abs(k.y - (ymin + ymax) / 2) <= h0 / 2 + STEP) taken[k.ia * ny + k.iy] = 1;
  } };
  pass(closeMask(scan, 'recW'), 0.45);
  const nRec = wins.length; pass(closeMask(scan, 'darkW'), 0.55); scanStats.recess = nRec; scanStats.dark = wins.length - nRec;
  return gridFill(scan, wins);
}
// A15 grid / row regularity prior: facades repeat windows on floors (rows) and bays (columns). Cluster the detected
// centres into rows (y within 0.5 m) and columns (a within 0.45 m); for every row x column slot with no window, test a
// median-sized rect there and accept it when >= 30% of its cells carry window evidence (c.s > 0), >= 90% of them hit the
// facade, it is not on the ground floor band (< 2.2 m) and it overlaps no window. Inferred entries are flagged.
function cluster(vals, tol) { const s = vals.slice().sort((a, b) => a - b), out = []; for (const v of s) { const g = out[out.length - 1]; if (g && v - g.v[g.v.length - 1] <= tol) g.v.push(v); else out.push({ v: [v] }); } return out.map((g) => ({ m: median(g.v), n: g.v.length })); }
function gridFill(scan, wins) {
  const { cells, plane, ax, al, na, ny } = scan; if (wins.length < 3) return wins.map(strip);
  const rows = cluster(wins.map((w) => w._y), 0.5 * U).filter((r) => r.n >= 2), cols = cluster(wins.map((w) => w._a), 0.45 * U).filter((c) => c.n >= 2);
  const mw = median(wins.map((w) => w.w)), mh = median(wins.map((w) => w.h)), yMin = scan.y0 + 2.2 * U; let added = 0;
  for (const r of rows) for (const c of cols) {
    if (r.m < yMin) continue;
    if (wins.some((w) => Math.abs(w._a - c.m) < (w.w + mw) / 2 && Math.abs(w._y - r.m) < (w.h + mh) / 2)) continue;
    let n = 0, ev = 0, hit = 0;
    for (const k of cells) { if (Math.abs(k.a - c.m) > mw / 2 || Math.abs(k.y - r.m) > mh / 2) continue; n++; if (k.depth != null) hit++; if (k.s > 0) ev++; }
    if (!n || hit / n < 0.9 || ev / n < 0.3) continue;
    const ctr = [0, r.m, 0]; ctr[ax] = plane; ctr[al] = c.m;
    const ds = cells.filter((k) => k.depth != null && Math.abs(k.a - c.m) <= mw / 2 && Math.abs(k.y - r.m) <= mh / 2).map((k) => k.depth);
    wins.push({ c: ctr.map(r3), w: r3(mw), h: r3(mh), depth: r3(median(ds)), inferred: true, _a: c.m, _y: r.m }); added++;
  }
  scanStats.rows = rows.length; scanStats.cols = cols.length; scanStats.inferred = added;
  return wins.map(strip);
}
function strip(w) { const o = { ...w }; delete o._a; delete o._y; return o; }

const out = {};
for (const name of NAMES) {
  try {
    const f = await loadFacade(`assets/models/${name}.glb`);
    U = (f.bbox.max[0] - f.bbox.min[0]) / 12; STEP = 0.25 * U;
    // the runtime only accepts the street face (+Z, placeArtBuilding: 'Front (+Z) faces the street'); other faces are logged only
    const scores = {}; let best = null;
    for (const face of FACES) { const s = scanFace(f, face); scores[face.id] = +s.score.toFixed(2); if (face.id === '+Z') best = s; }
    rej = []; const { min, max } = f.bbox, windows = windowsOf(best);
    if (MAPN === name) { const { cells, na, ny } = best; for (let iy = ny - 1; iy >= 0; iy -= 2) { let l = ''; for (let ia = 0; ia < na; ia++) { const c = cells[ia * ny + iy]; l += c.depth == null ? ' ' : c.recW ? '#' : c.darkW ? 'd' : '.'; } console.log(l); }
      console.log('components [w m, h m, fill, y m]:', JSON.stringify(rej.filter((r) => r[0] > 0.3 && r[1] > 0.3))); }
    out[name] = { face: best.face.id, size: [max[0] - min[0], max[1] - min[1], max[2] - min[2]], windows };
    console.log(name, best.face.id, best.score.toFixed(2), windows.length, '(' + windows.filter((w) => w.inferred).length + ' inferred)', JSON.stringify(scanStats), JSON.stringify(scores));
  } catch (err) { console.error(name, err); }
}
if (!DRY) fs.writeFileSync('assets/models/windows.json', JSON.stringify(out, null, 2));
if (process.argv.includes('--list')) for (const [k, v] of Object.entries(out)) { const u = v.size[0] / 12; console.log(k, v.windows.map((w) => `${((w.c[0] - (-v.size[0] / 2)) / u).toFixed(1)},${(w.c[1] / u).toFixed(1)} ${(w.w / u).toFixed(1)}x${(w.h / u).toFixed(1)}${w.inferred ? '*' : ''}`).join(' | ')); }
