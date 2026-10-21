import * as THREE from 'three';

export const ATLAS_COLS = 4;
export const ATLAS_ROWS = 2;
export const ATLAS_BACK = 0.5;

const WALLS = ['#d9c7a3', '#c49a5a', '#9fb3b8', '#9aa58a'];
const FLOORS = ['#a0583a', '#7a2e2a', '#8c7a60'];
let atlas = null;

function shade(hex, k) {
  const n = parseInt(hex.slice(1), 16);
  const c = (s) => Math.max(0, Math.min(255, Math.round(((n >> s) & 255) * k)));
  return `rgb(${c(16)},${c(8)},${c(0)})`;
}

function quad(ctx, p) {
  ctx.beginPath();
  ctx.moveTo(p[0][0], p[0][1]);
  for (let i = 1; i < 4; i++) ctx.lineTo(p[i][0], p[i][1]);
  ctx.closePath();
}

function paintCell(ctx, col, row, index) {
  const x = col * 128, y = row * 128;
  const x0 = x, y0 = y, x1 = x + 128, y1 = y + 128;
  const bx0 = x + 32, by0 = y + 32, bx1 = x + 96, by1 = y + 96;
  const ceiling = [[x0, y0], [x1, y0], [bx1, by0], [bx0, by0]];
  const floor = [[x0, y1], [x1, y1], [bx1, by1], [bx0, by1]];
  const left = [[x0, y0], [bx0, by0], [bx0, by1], [x0, y1]];
  const right = [[x1, y0], [bx1, by0], [bx1, by1], [x1, y1]];
  const wall = WALLS[index % 4];
  const kind = index % 3;
  const floorHex = FLOORS[kind];

  ctx.fillStyle = shade(wall, 0.7); quad(ctx, ceiling); ctx.fill();
  ctx.fillStyle = shade(floorHex, 0.85); quad(ctx, floor); ctx.fill();
  ctx.fillStyle = shade(wall, 0.8); quad(ctx, left); ctx.fill(); quad(ctx, right); ctx.fill();
  ctx.fillStyle = wall; ctx.fillRect(bx0, by0, 64, 64);

  if (kind === 0) {
    ctx.save(); quad(ctx, floor); ctx.clip();
    ctx.strokeStyle = shade(floorHex, 0.55); ctx.lineWidth = 1; ctx.beginPath();
    for (let i = 1; i <= 2; i++) {
      ctx.moveTo(x0, y1 - i * 14); ctx.lineTo(x1, y1 - i * 14);
      ctx.moveTo(x0 + i * 28, by1); ctx.lineTo(x0 + i * 28, y1);
    }
    ctx.stroke(); ctx.restore();
  } else if (kind === 1) {
    ctx.strokeStyle = shade(floorHex, 1.45); ctx.lineWidth = 4;
    quad(ctx, [[x0 + 14, y1 - 8], [x1 - 14, y1 - 8], [bx1 - 8, by1 + 6], [bx0 + 8, by1 + 6]]);
    ctx.stroke();
  }

  const item = index % 4;
  if (item === 0) {
    ctx.fillStyle = '#221c16'; ctx.fillRect(bx0 + 20, by0 + 14, 24, 50);
  } else if (item === 1) {
    ctx.strokeStyle = '#5c4030'; ctx.lineWidth = 2; ctx.beginPath();
    ctx.moveTo(bx0 + 8, by0 + 24); ctx.lineTo(bx1 - 8, by0 + 24);
    ctx.moveTo(bx0 + 8, by0 + 42); ctx.lineTo(bx1 - 8, by0 + 42); ctx.stroke();
    ctx.fillStyle = '#6a4b32';
    ctx.fillRect(bx0 + 14, by0 + 16, 12, 8); ctx.fillRect(bx0 + 34, by0 + 34, 14, 8);
  } else if (item === 2) {
    ctx.fillStyle = '#6d8c9a'; ctx.fillRect(bx0 + 14, by0 + 12, 36, 26);
    ctx.strokeStyle = '#3d2c1c'; ctx.lineWidth = 3; ctx.strokeRect(bx0 + 14, by0 + 12, 36, 26);
  } else {
    ctx.fillStyle = '#3a2414';
    ctx.fillRect(bx0 + 8, by0 + 38, 30, 4);
    ctx.fillRect(bx0 + 10, by0 + 42, 3, 14); ctx.fillRect(bx0 + 32, by0 + 42, 3, 14);
    ctx.fillRect(bx0 + 42, by0 + 26, 3, 28); ctx.fillRect(bx0 + 42, by0 + 26, 14, 3);
    ctx.fillRect(bx0 + 42, by0 + 40, 12, 3);
  }

  if (index === 5) {
    const w = 128 * 0.3;
    ctx.fillStyle = '#8a3d55'; ctx.fillRect(x0, y0, w, 128);
    ctx.fillStyle = '#6a3050'; ctx.fillRect(x1 - w, y0, w, 128);
  }
  if (index >= 6) {
    ctx.fillStyle = '#1a1612'; ctx.fillRect(x0, y0, 128, 128);
    ctx.fillStyle = '#3e382e';
    for (let i = 0; i < 6; i++) ctx.fillRect(x0 + 8, y0 + 12 + i * 18, 112, 5);
  }

  const fades = [
    [ceiling, x + 64, y0, x + 64, by0],
    [floor, x + 64, y1, x + 64, by1],
    [left, x0, y + 64, bx0, y + 64],
    [right, x1, y + 64, bx1, y + 64],
  ];
  for (const [shape, ax, ay, bx, by] of fades) {
    const g = ctx.createLinearGradient(ax, ay, bx, by);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, 'rgba(0,0,0,0.25)');
    ctx.fillStyle = g; quad(ctx, shape); ctx.fill();
  }
}

export function createInteriorAtlas() {
  if (atlas) return atlas;
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 256;
  const ctx = canvas.getContext('2d');
  let index = 0;
  for (let row = 0; row < ATLAS_ROWS; row++) {
    for (let col = 0; col < ATLAS_COLS; col++) paintCell(ctx, col, row, index++);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.generateMipmaps = true;
  tex.anisotropy = 1;
  tex.needsUpdate = true;
  atlas = tex;
  return tex;
}
