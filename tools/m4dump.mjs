import {NodeIO} from '@gltf-transform/core';import {ALL_EXTENSIONS} from '@gltf-transform/extensions';import {MeshoptDecoder} from 'meshoptimizer';import fs from 'fs';
await MeshoptDecoder.ready;const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder});
const d=await io.read(process.argv[2]);const T=d.getRoot().listTextures();T.forEach((t,i)=>{fs.writeFileSync('/tmp/m4x/'+i+'.'+t.getMimeType().split('/')[1],t.getImage());console.log(i,t.getName(),t.getMimeType(),t.getSize())});
for(const m of d.getRoot().listMaterials())console.log(m.getName(),T.indexOf(m.getBaseColorTexture()),T.indexOf(m.getNormalTexture()),T.indexOf(m.getMetallicRoughnessTexture()));
