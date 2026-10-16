// Fix 6: M4 white specks = smooth fully-metallic UV islands (MR map) + bright/red base-colour flecks. Replace those textures.
import {NodeIO} from '@gltf-transform/core';import {ALL_EXTENSIONS} from '@gltf-transform/extensions';import {MeshoptDecoder,MeshoptEncoder} from 'meshoptimizer';import fs from 'fs';
await MeshoptDecoder.ready; await MeshoptEncoder.ready;
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder,'meshopt.encoder':MeshoptEncoder});
const [src,dst,base,mr]=process.argv.slice(2); const d=await io.read(src); const m=d.getRoot().listMaterials()[0];
m.getBaseColorTexture().setImage(fs.readFileSync(base)); m.getMetallicRoughnessTexture().setImage(fs.readFileSync(mr));
await io.write(dst,d); console.log('ok',fs.statSync(dst).size);
