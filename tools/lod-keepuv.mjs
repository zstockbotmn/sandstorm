// Far LOD that keeps the full mesh's UVs: meshopt simplify only drops vertices, so the kept UVs stay in the full model's
// quantized space and the full model's material (KHR_texture_transform included) maps them correctly at runtime.
// Textures are dropped (runtime reuses the full model's material). The old geometry-only LOD had no UVs: the shared
// texture sampled one texel -> flat orange smeared facades on the right of the street (A3 bug).
// Usage: node tools/lod-keepuv.mjs full.glb out.lod.glb [ratio=0.3]
import { NodeIO } from '@gltf-transform/core'; import { ALL_EXTENSIONS } from '@gltf-transform/extensions'; import { prune, simplify, weld } from '@gltf-transform/functions';
import { MeshoptDecoder, MeshoptEncoder, MeshoptSimplifier } from 'meshoptimizer';
const [inp, out, r = '0.3'] = process.argv.slice(2); await Promise.all([MeshoptDecoder.ready, MeshoptEncoder.ready, MeshoptSimplifier.ready]);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder, 'meshopt.encoder': MeshoptEncoder });
const doc = await io.read(inp);
await doc.transform(weld(), simplify({ simplifier: MeshoptSimplifier, ratio: +r, error: 0.02, lockBorder: false }));
for (const t of doc.getRoot().listTextures()) t.dispose();
await doc.transform(prune({ keepAttributes: true })); await io.write(out, doc);
