// Geometry-only LOD: drop every texture (runtime reuses the full model's materials). Usage: node tools/strip-tex.mjs in.glb out.glb
import { NodeIO } from '@gltf-transform/core'; import { ALL_EXTENSIONS } from '@gltf-transform/extensions'; import { prune } from '@gltf-transform/functions';
const [inp, out] = process.argv.slice(2); const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const doc = await io.read(inp); for (const t of doc.getRoot().listTextures()) t.dispose(); await doc.transform(prune()); await io.write(out, doc);
