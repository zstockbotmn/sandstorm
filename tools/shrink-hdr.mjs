// Downsample an equirect .hdr (RGBE) by an integer factor (box filter) and write flat RGBE. Lighting-only env, so 512x256 is plenty.
import fs from 'fs';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { FloatType } from 'three';
const [inp, out, f = '2'] = process.argv.slice(2); const F = +f;
const L = new RGBELoader(); L.setDataType(FloatType);
const buf = fs.readFileSync(inp); const r = L.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.length));
const { width: W, height: H, data } = r; const w = W / F | 0, h = H / F | 0;
const hdr = Buffer.from(`#?RADIANCE\nFORMAT=32-bit_rle_rgbe\n\n-Y ${h} +X ${w}\n`, 'ascii'); const px = Buffer.alloc(w * h * 4);
for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { let R = 0, G = 0, B = 0;
  for (let j = 0; j < F; j++) for (let i = 0; i < F; i++) { const k = ((y * F + j) * W + (x * F + i)) * 4; R += data[k]; G += data[k + 1]; B += data[k + 2]; }
  R /= F * F; G /= F * F; B /= F * F; const m = Math.max(R, G, B), o = (y * w + x) * 4;
  if (m < 1e-32) { px[o] = px[o + 1] = px[o + 2] = px[o + 3] = 0; continue; }
  const e = Math.ceil(Math.log2(m)); const sc = 256 / Math.pow(2, e); px[o] = Math.min(255, R * sc); px[o + 1] = Math.min(255, G * sc); px[o + 2] = Math.min(255, B * sc); px[o + 3] = e + 128; }
fs.writeFileSync(out, Buffer.concat([hdr, px])); console.log(W + 'x' + H, '->', w + 'x' + h, fs.statSync(out).size, 'bytes');
