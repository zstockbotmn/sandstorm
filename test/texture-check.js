// Texture/asset check (tester pA: flat black rifle + flat blue/green cover on Low with ?loco=2). Loads a build dir, plays,
// screenshots, and reports which art loaded/failed/skipped. Fails if rifle_m4 / fps_arms / any prop_* is missing or the
// load timed out. SS_CPU_SLOW=6 throttles the CPU like the tester's box. Usage: SS_DIR=/path/to/dist SS_QS='&q=low&loco=2&repos=1' SS_SHOT=out.png node test/texture-check.js
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const D = process.env.SS_DIR || path.resolve(__dirname, '../dist'); const PORT = Number(process.env.SS_PORT || 8841);
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.glb': 'model/gltf-binary', '.json': 'application/json', '.ktx2': 'image/ktx2', '.png': 'image/png', '.jpg': 'image/jpeg', '.hdr': 'application/octet-stream' };
const srv = http.createServer((q, r) => { let f = path.join(D, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (e, b) => { if (e) { (res404.push(q.url)); r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); }).listen(PORT);
const res404 = []; const QS = process.env.SS_QS || '&q=low';
(async () => { const b = await require('../tools/guard').launch(chromium, { executablePath: '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }, { timeoutMs: 600000 });
  const res = {}, fail = []; const ctx = await b.newContext({ viewport: { width: 844, height: 390 } }); const p = await ctx.newPage(); const t0 = Date.now();
  if (process.env.SS_CPU_SLOW) { const cdp = await ctx.newCDPSession(p); await cdp.send('Emulation.setCPUThrottlingRate', { rate: Number(process.env.SS_CPU_SLOW) }); res.cpuSlow = Number(process.env.SS_CPU_SLOW); } /* tester-box-like slow load */
  p.on('pageerror', (e) => (res.pageErrors = res.pageErrors || []).push(String(e).slice(0, 160)));
  p.on('console', (m) => { const t = m.text(); if (/art|timeout|failed/i.test(t)) (res.console = res.console || []).push(t.slice(0, 160)); });
  await p.goto('http://127.0.0.1:' + PORT + '/?seed=7&calm=1' + QS); await p.waitForFunction(() => window.SS && SS.art && SS.art.done, null, { timeout: 240000 });
  res.artMs = Date.now() - t0;
  await p.click('#play'); await p.waitForFunction(() => SS.running && !document.body.classList.contains('starting'), null, { timeout: 120000 }); await p.waitForTimeout(6000);
  Object.assign(res, await p.evaluate(() => ({ tier: SS.art.tier, quality: SS.quality, loaded: SS.art.loaded, failed: SS.art.failed, bytes: SS.art.bytes })));
  await p.screenshot({ path: process.env.SS_SHOT || 'logs/texture-check.png' });
  const need = ['rifle_m4', 'fps_arms', 'prop_sandbags', 'prop_burnedcar', 'prop_drum', 'prop_crates', 'prop_cart'];
  const miss = need.filter((n) => !(res.loaded || []).includes(n)); if (miss.length) fail.push('not loaded: ' + miss.join(','));
  if (res404.length) fail.push('404: ' + res404.slice(0, 6).join(','));
  console.log(JSON.stringify(res)); console.log(fail.length ? 'TEXCHECK FAIL ' + fail.join(' ; ') : 'TEXCHECK PASS'); srv.close(); await b.close(); process.exit(fail.length ? 1 : 0);
})().catch((e) => { console.log('TEXCHECK FAIL exception ' + e.message); process.exit(1); });
