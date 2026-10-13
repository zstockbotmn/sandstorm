// Mobile prep for one Meshy GLB: drop emissive (black after remove_lighting), resize textures by kind, WebP, prune.
// Usage: node tools/compress.mjs in.glb out.glb   (gltfpack -cc runs afterwards in compress-assets.sh)
// Sizes: fighter* base 1024 / normal+MR 512; bldg* base 1024 / 512; prop* all 512; *.anim (clips only) strips meshes+textures.
import { NodeIO } from '@gltf-transform/core'; import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { textureCompress, prune, dedup } from '@gltf-transform/functions'; import sharp from 'sharp'; import path from 'path';
const [inp, out] = process.argv.slice(2), b = path.basename(inp);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS); const doc = await io.read(inp); const root = doc.getRoot();
if (/\.anim\./.test(b)) { // clips only: drop mesh/skin/material/texture payload, keep node hierarchy + animations
  for (const n of root.listNodes()) { n.setMesh(null); n.setSkin(null); }
  for (const m of root.listMeshes()) m.dispose(); for (const s of root.listSkins()) s.dispose();
  for (const m of root.listMaterials()) m.dispose(); for (const t of root.listTextures()) t.dispose();
} else {
  for (const m of root.listMaterials()) { m.setEmissiveTexture(null); m.setEmissiveFactor([0, 0, 0]); }
  const big = /^prop/.test(b) ? 512 : 1024;
  await doc.transform(prune(), dedup(),
    textureCompress({ encoder: sharp, targetFormat: 'webp', quality: 82, resize: [big, big], slots: /baseColor/ }),
    textureCompress({ encoder: sharp, targetFormat: 'webp', quality: 85, resize: [512, 512], slots: /^(?!baseColor)/ }));
}
await doc.transform(prune()); await io.write(out, doc); console.log('prep', b, '->', out);
