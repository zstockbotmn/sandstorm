// Enemy clip side-by-side: each locomotion clip (with the aim-pose upper body) at 4 m, front + 3/4 views, plus head look-at.
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const D = path.resolve(__dirname, '../dist'), OUT = path.resolve(__dirname, '../screenshots/ragdoll'); fs.mkdirSync(OUT, { recursive: true });
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.glb': 'model/gltf-binary', '.hdr': 'application/octet-stream' };
const srv = http.createServer((q, r) => { let f = path.join(D, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); }).listen(8803);
(async () => { const b = await require('../tools/guard').launch(chromium, { executablePath: '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }, { timeoutMs: 500000 });
  const errs = [], res = {};
  try { const p = await (await b.newContext({ viewport: { width: 640, height: 360 }, isMobile: true, hasTouch: true })).newPage(); p.on('pageerror', e => errs.push(e.message));
    await p.goto('http://127.0.0.1:8803/?seed=7' + (process.env.SS_QS || ''));  await p.waitForFunction(() => window.SS && SS.art && SS.art.done, null, { timeout: 180000 });
    await p.tap('#play'); await p.waitForTimeout(1200); if (process.env.ROOF) await p.evaluate(() => { window.__ROOF = 1; });
    const out = []; for (let k = 0; k < 3; k++) { await p.waitForTimeout(10000); out.push(await p.evaluate(() => ({ q: SS.quality, alive: SS.player && SS.player.alive, hp: SS.health, d: Math.round(SS.distance), walk: SS.walking, en: (SS.enemies.list || []).map((x) => x ? [x.alive ? 1 : 0, x.exposed ? 1 : 0, !!x.art, x.anchor && x.anchor.type, Math.round(x.group.position.distanceTo(SS.camera.position)), x.phase] : 'UNDEF') }))); }
    console.log(JSON.stringify(out));
  } catch (e) { console.log('ERR', e.message); } await b.close(); srv.close(); process.exit(0); })();
