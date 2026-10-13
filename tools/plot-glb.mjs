import { NodeIO } from '@gltf-transform/core'; import sharp from 'sharp';
const [inp, outp, ax='z'] = process.argv.slice(2);
const doc = await new NodeIO().read(inp); const p = doc.getRoot().listMeshes()[0].listPrimitives()[0];
const pos = p.getAttribute('POSITION').getArray(), idx = p.getIndices().getArray();
const W=600,Hh=600, img=Buffer.alloc(W*Hh*3); const zb=new Float32Array(W*Hh).fill(-1e9);
// front view: x right, y up, depth = z (color by z); side view: z right, y up
for (let t=0;t<idx.length;t+=3){ let c=[0,0,0]; for(let j=0;j<3;j++)for(let a=0;a<3;a++)c[a]+=pos[3*idx[t+j]+a]/3;
 let X,Y=c[1],D; if(ax==='z'){X=c[0];D=c[2]} else if(ax==='x'){X=c[2];D=c[0]} else {X=c[0];Y=-c[2];D=c[1]}
 const px=Math.round((X+1)/2*W), py=Math.round((1-(Y+1)/2)*Hh); if(px<0||py<0||px>=W||py>=Hh)continue;
 for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++){const q=(py+dy)*W+px+dx; if(q<0||q>=W*Hh||D<zb[q])continue; zb[q]=D; const v=Math.max(0,Math.min(255,(D+0.5)*255)); img[3*q]=v; img[3*q+1]=255-v; img[3*q+2]=80;}}
await sharp(img,{raw:{width:W,height:Hh,channels:3}}).png().toFile(outp);
