// Mesh island analysis / removal. Usage: node tools/islands.mjs in.glb [out.glb keepIdsCSV]
import { NodeIO } from '@gltf-transform/core';
import { prune } from '@gltf-transform/functions';
const [inp, out, keep] = process.argv.slice(2);
const io = new NodeIO(); const doc = await io.read(inp);
const prim = doc.getRoot().listMeshes()[0].listPrimitives()[0];
const pos = prim.getAttribute('POSITION').getArray(), idxA = prim.getIndices(), idx = idxA.getArray();
const nv = pos.length / 3, q = 1e4, key = new Map(), canon = new Int32Array(nv);
for (let i = 0; i < nv; i++) { const k = Math.round(pos[3*i]*q)+','+Math.round(pos[3*i+1]*q)+','+Math.round(pos[3*i+2]*q); if (!key.has(k)) key.set(k, i); canon[i] = key.get(k); }
const par = new Int32Array(nv).map((_, i) => i); const f = x => { while (par[x] !== x) x = par[x] = par[par[x]]; return x; };
const u = (a, b) => { a = f(a); b = f(b); if (a !== b) par[a] = b; };
for (let t = 0; t < idx.length; t += 3) { u(canon[idx[t]], canon[idx[t+1]]); u(canon[idx[t]], canon[idx[t+2]]); }
const comps = new Map();
for (let t = 0; t < idx.length; t += 3) { const r = f(canon[idx[t]]); let c = comps.get(r); if (!c) comps.set(r, c = { tris: 0, min: [1e9,1e9,1e9], max: [-1e9,-1e9,-1e9], list: [] }); c.tris++; c.list.push(t);
  for (let j = 0; j < 3; j++) for (let a = 0; a < 3; a++) { const v = pos[3*idx[t+j]+a]; c.min[a] = Math.min(c.min[a], v); c.max[a] = Math.max(c.max[a], v); } }
const arr = [...comps.values()].sort((a, b) => b.tris - a.tris); arr.forEach((c, i) => c.id = i);
if (!out) { console.log('components', arr.length); arr.slice(0, 40).forEach(c => console.log(c.id, c.tris, c.min.map(v=>v.toFixed(3)).join(','), '->', c.max.map(v=>v.toFixed(3)).join(','))); }
else { const ks = new Set(keep.split(',').map(Number)); const ni = []; arr.filter(c => ks.has(c.id)).forEach(c => c.list.forEach(t => ni.push(idx[t], idx[t+1], idx[t+2])));
  idxA.setArray(new Uint32Array(ni)); await doc.transform(prune()); await io.write(out, doc); console.log('kept tris', ni.length/3); }
