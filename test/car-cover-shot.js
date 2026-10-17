// m1s: screenshot a cover stop behind a burned car (the car used to fill the lower half of the view).
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const D = path.resolve(__dirname, '../dist'); const PORT = 8811;
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.glb': 'model/gltf-binary' };
const srv = http.createServer((q, r) => { let f = path.join(D, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); }).listen(PORT);
(async () => { const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }); const res = {};
  try { const p = await (await b.newContext({ viewport: { width: 844, height: 390 } })).newPage();
    await p.goto('http://127.0.0.1:' + PORT + '/?seed=' + (process.env.SEED || 2) + '&calm=1' + (process.env.SS_QS || '')); await p.waitForFunction(() => window.SS && SS.art && SS.art.done, null, { timeout: 180000 });
    await p.click('#play'); await p.waitForTimeout(1000); await p.evaluate(() => { SS.player.health = 1e9; });
    // walk until a car cover point is 3-6 m ahead, then halt and engage
    res.found = await p.evaluate(async () => { for (let i = 0; i < 400; i++) { const pz = SS.camera.position.z;
        for (const s of SS.world.segments) for (const c of s.coverPoints || []) if (c.type === 'car' && pz - c.pos.z > 3 && pz - c.pos.z < 6 && Math.abs(c.pos.x) < 4.4) { SS.walking = false; return { pz, c: c.pos.toArray() }; }
        await new Promise((r) => setTimeout(r, 100)); } return null; });
    await p.evaluate(() => { const e = window.__e = SS.debug.spawnEnemy('shifter'); const c = SS.camera.position; SS.enemies.debugPose(e, 0, c.z - 16, 'idle'); e.health = 1e9; e.shootCd = 1e9; setInterval(() => { e.engaged = true; e.shootCd = 1e9; SS.walking = false; }, 30); }); await p.waitForTimeout(5000);
    res.state = await p.evaluate(() => ({ kind: SS.cover && SS.cover.kind, st: SS.cover && SS.cover.state, cam: SS.camera.position.toArray().map((v) => +v.toFixed(2)) }));
    await p.evaluate(() => { SS.input.pitch = 0.02; SS.input.yaw = 0; }); await p.waitForTimeout(800);
    await p.screenshot({ path: path.resolve(__dirname, '../screenshots/car-cover-duck.png') });
    await p.evaluate(() => { window.__upT = setInterval(() => { SS.input.cover = false; }, 16); }); await p.waitForTimeout(900);
    res.up = await p.evaluate(() => SS.camera.position.toArray().map((v) => +v.toFixed(2)));
    await p.screenshot({ path: path.resolve(__dirname, '../screenshots/car-cover.png') });
  } catch (e) { res.err = e.message; } console.log(JSON.stringify(res)); await b.close(); srv.close(); })();
