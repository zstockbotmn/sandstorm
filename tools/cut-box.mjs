// Remove triangles whose centroid lies inside an axis-aligned box (e.g. a figure fused to a Meshy building).
// Usage: node tools/cut-box.mjs in.glb out.glb xmin xmax ymin ymax zmin zmax
import { NodeIO } from '@gltf-transform/core'; import { prune } from '@gltf-transform/functions';
const [inp, out, ...b] = process.argv.slice(2); const [x0, x1, y0, y1, z0, z1] = b.map(Number);
const io = new NodeIO(); const doc = await io.read(inp); const p = doc.getRoot().listMeshes()[0].listPrimitives()[0];
const pos = p.getAttribute('POSITION').getArray(), ia = p.getIndices(), idx = ia.getArray(), ni = [];
for (let t = 0; t < idx.length; t += 3) { let c = [0, 0, 0]; for (let j = 0; j < 3; j++) for (let a = 0; a < 3; a++) c[a] += pos[3 * idx[t + j] + a] / 3;
  if (!(c[0] > x0 && c[0] < x1 && c[1] > y0 && c[1] < y1 && c[2] > z0 && c[2] < z1)) ni.push(idx[t], idx[t + 1], idx[t + 2]); }
console.log('tris', idx.length / 3, '->', ni.length / 3); ia.setArray(new Uint32Array(ni)); await doc.transform(prune()); await io.write(out, doc);
