// Step 3 visual check (?fx=3): player-view stills of (a) skyline flash/tracer during the forced opening build-up, (b) near-miss
// dust, (c) world-hit dust+debris on a facade. Usage: node test/fx3-shots.js <tier low|high> <outPrefix>
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const D = path.resolve(__dirname, '../dist'); const PORT = 8843;
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.glb': 'model/gltf-binary', '.json': 'application/json' };
const srv = http.createServer((q, r) => { let f = path.join(D, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); }).listen(PORT);
const [tier = 'low', out = 'logs/a5/fx3'] = process.argv.slice(2); fs.mkdirSync(path.dirname(out), { recursive: true });
(async () => { const b = await require('../tools/guard').launch(chromium, { executablePath: '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'] }, { timeoutMs: 600000 });
  const res = {}; try { const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 1.5, isMobile: true, hasTouch: true }); const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(String(e).slice(0, 160)));
    await p.goto('http://127.0.0.1:' + PORT + '/?seed=7&calm=1&loco=2&hits=2&repos=1&fx=3&q=' + tier); await p.waitForFunction(() => window.SS && SS.art && SS.art.done, null, { timeout: 180000 });
    await p.tap('#play'); await p.waitForFunction(() => SS.running && !document.body.classList.contains('starting'), null, { timeout: 120000 }); await p.waitForTimeout(1500);
    // (a) skyline: force the build-up near 0.8 and grab the first frame with a live flash
    res.sky = await p.evaluate(async () => { SS.player.health = 1e6; SS.approachForce = 0.8; const f0 = SS.fx3.skyline.flashes; const t0 = performance.now(); while (SS.fx3.skyline.flashes === f0 && performance.now() - t0 < 20000) await new Promise((r) => requestAnimationFrame(r)); return { ...SS.fx3.skyline }; });
    await p.screenshot({ path: out + '_skyline_' + tier + '.png' }); await p.evaluate(() => { SS.approachForce = null; });
    // (b) near miss: a round passing 0.8 m left of the eye, angled down into the street 3-5 m ahead
    res.near = await p.evaluate(async () => { const T = SS.THREE, c = SS.camera.position; const pt = new T.Vector3(c.x - 0.8, c.y - 0.2, c.z - 5); SS.fx.nearMiss(pt, new T.Vector3(-0.1, -0.7, -0.7)); await new Promise((r) => setTimeout(r, 120)); return { ...SS.fx3.puffs }; });
    await p.screenshot({ path: out + '_nearmiss_' + tier + '.png' });
    await p.waitForTimeout(1500);
    // (c) world hit: the first world surface ahead-right through the real shot test
    res.hit = await p.evaluate(async () => { const T = SS.THREE; const eye = SS.camera.getWorldPosition(new T.Vector3()); const dir = new T.Vector3(0.75, -0.1, -1).normalize(); const h = SS.weapon.firstHit(eye, dir);
      if (!h) return { none: true }; const n = h.face ? h.face.normal.clone().transformDirection(h.object.matrixWorld) : dir.clone().negate(); SS.fx.impact(h.point, n, h.object); await new Promise((r) => setTimeout(r, 100));
      return { dist: +h.point.distanceTo(eye).toFixed(1), name: h.object.name, puffs: { ...SS.fx3.puffs } }; });
    await p.screenshot({ path: out + '_hit_' + tier + '.png' }); res.errs = errs;
  } finally { await b.close(); srv.close(); } console.log(JSON.stringify(res)); })().catch((e) => { console.error(e); process.exit(1); });
