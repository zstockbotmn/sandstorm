import {NodeIO} from '@gltf-transform/core';import {ALL_EXTENSIONS} from '@gltf-transform/extensions';import {MeshoptDecoder} from 'meshoptimizer';
await MeshoptDecoder.ready;const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder});
const d=await io.read('assets/models/rifle_m4.glb');const P=[];
for(const m of d.getRoot().listMeshes())for(const pr of m.listPrimitives()){const a=pr.getAttribute('POSITION');const n=a.getNormalized?1:1;for(let i=0;i<a.getCount();i++)P.push(a.getElement(i,[]));}
const ax=[0,1,2].map(k=>Math.max(...P.map(p=>p[k]))-Math.min(...P.map(p=>p[k])));console.log('extent',ax);
const L=ax.indexOf(Math.max(...ax));const lo=Math.min(...P.map(p=>p[L])),len=ax[L];const B=20,mn=Array(B).fill(1e9),mx=Array(B).fill(-1e9);
for(const p of P){const b=Math.min(B-1,Math.floor((p[L]-lo)/len*B));mn[b]=Math.min(mn[b],p[1]);mx[b]=Math.max(mx[b],p[1]);}
console.log('long axis',L);mn.forEach((v,i)=>console.log(i,(i/B).toFixed(2),v.toFixed(3),mx[i].toFixed(3)));
