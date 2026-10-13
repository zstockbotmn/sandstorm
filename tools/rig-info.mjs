import { NodeIO } from '@gltf-transform/core'; import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
const doc = await new NodeIO().registerExtensions(ALL_EXTENSIONS).read(process.argv[2]); const r = doc.getRoot();
const pr = (n, d) => { console.log(' '.repeat(d) + n.getName(), n.getMesh() ? '[mesh]' : '', n.getSkin() ? '[skin]' : '', n.getTranslation().map(v => v.toFixed(2)).join(','), n.getScale().map(v=>v.toFixed(2)).join(','), n.getRotation().map(v=>v.toFixed(2)).join(',')); n.listChildren().forEach(c => pr(c, d + 1)); };
r.listScenes()[0].listChildren().forEach(n => pr(n, 0));
console.log('anims', r.listAnimations().map(a => a.getName() + ':' + a.listChannels().length + ':' + a.listChannels().map(c=>c.getTargetPath()).filter((v,i,a)=>a.indexOf(v)===i).join('/')).join(' | '));
console.log('meshes', r.listMeshes().length, 'skins', r.listSkins().map(s => s.listJoints().length));
