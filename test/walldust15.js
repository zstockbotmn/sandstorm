// A8 (A7 tester: Low wall dust = a pale ~25 px puff that faded within a few frames at 12-20 m). Calm run on a tier, find a
// facade hit 13-17 m away through the real shot test, freeze the walk, screenshot before and after SS.fx.impact at painted
// frames +1, +3, +6 and ~2 s real time; reports the changed-pixel box (vs the before shot) per frame.
// Usage: node test/walldust15.js [low|ultra-low|high] [outPrefix]
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path'), sharp = require('sharp');
const D = path.resolve(__dirname, '../dist'); const PORT = 8846;
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.glb': 'model/gltf-binary', '.json': 'application/json' };
const srv = http.createServer((q, r) => { let f = path.join(D, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); }).listen(PORT);
const [tier = 'low', out = 'logs/a8/walldust'] = process.argv.slice(2); fs.mkdirSync(path.dirname(out), { recursive: true });
async function diffBox(a, b) { const A = await sharp(a).raw().toBuffer({ resolveWithObject: true }), B = await sharp(b).raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h, channels: ch } = A.info; let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1, n = 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = (y * w + x) * ch; const d = Math.abs(A.data[i] - B.data[i]) + Math.abs(A.data[i + 1] - B.data[i + 1]) + Math.abs(A.data[i + 2] - B.data[i + 2]);
    if (d > 60) { n++; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; } }
  return n ? { px: n, w: x1 - x0 + 1, h: y1 - y0 + 1, box: [x0, y0, x1, y1], imgW: w } : { px: 0 }; }
(async () => { const b = await require('../tools/guard').launch(chromium, { executablePath: '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }, { timeoutMs: 600000 });
  const res = { tier }; let fail = [];
  try { const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 1.5, isMobile: true, hasTouch: true }); const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(String(e).slice(0, 160)));
    await p.goto('http://127.0.0.1:' + PORT + '/?seed=7&calm=1&loco=2&hits=2&repos=1&fx=3&q=' + tier); await p.waitForFunction(() => window.SS && SS.art && SS.art.done, null, { timeout: 180000 });
    await p.tap('#play'); await p.waitForFunction(() => SS.running && !document.body.classList.contains('starting'), null, { timeout: 120000 }); await p.waitForTimeout(2500);
    await p.evaluate(() => { SS.forceWalk = false; SS.player.health = 1e6; }); await p.waitForTimeout(2500);
    res.find = await p.evaluate(() => { SS.player.health = 1e6; SS.forceWalk = false; const T = SS.THREE; const eye = SS.camera.getWorldPosition(new T.Vector3());
      for (let k = 0; k < 60; k++) { const yaw = SS.input.yaw + (k % 2 ? 1 : -1) * (0.08 + 0.02 * k); const dir = new T.Vector3(Math.sin(yaw), -0.02, -Math.cos(yaw)).normalize(); const h = SS.weapon.firstHit(eye, dir);
        if (!h) continue; const d = h.point.distanceTo(eye); const n = h.face ? h.face.normal.clone().transformDirection(h.object.matrixWorld) : dir.clone().negate(); if (d < 13 || d > 17 || Math.abs(n.y) > 0.5) continue;
        window.__wd = { p: h.point.clone(), n, o: h.object };
        const rc = new T.Raycaster(eye, dir, 0.3, 40); const vis = []; SS.scene.traverse((o) => { if (o.isMesh && o.visible && !o.isSkinnedMesh && !o.isInstancedMesh && o.material && o.material.visible !== false) vis.push(o); });
        const vh = rc.intersectObjects(vis, false).filter((x) => { let q = x.object; while (q) { if (!q.visible) return false; q = q.parent; } return true; })[0];
        return { dist: +d.toFixed(1), name: h.object.name, yaw: +yaw.toFixed(3), visDist: vh ? +vh.distance.toFixed(2) : null, visName: vh ? vh.object.name : null }; } return null; });
    if (!res.find) fail.push('no facade hit at 13-17 m');
    else { const frames = async (k) => { await p.evaluate((k) => new Promise((r) => { const f0 = SS.frameN; const t = () => (SS.frameN - f0 >= k ? r() : requestAnimationFrame(t)); t(); }), k); };
      // screenshots take ~3 s here: hold the game loop (queue rAF callbacks) while the shot is taken, then release them
      await p.evaluate(() => { const raf = window.requestAnimationFrame.bind(window); window.__q = null; window.__rafOrig = raf; window.requestAnimationFrame = (cb) => { if (window.__q) { window.__q.push(cb); return 0; } return raf(cb); }; });
      // ...and the paused wall time is removed from performance.now, so real-time floors are judged as if no shot was taken
      await p.evaluate(() => { const pn = performance.now.bind(performance); window.__pMs = 0; performance.now = () => pn() - window.__pMs; window.__pn = pn; });
      const pause = () => p.evaluate(() => { window.__q = []; window.__p0 = window.__pn(); }), resume = () => p.evaluate(() => { const q = window.__q || []; window.__q = null; window.__pMs += window.__pn() - window.__p0; q.forEach((cb) => window.__rafOrig((t) => cb(performance.now()))); });
      const shotAt = async (f) => { await pause(); await p.waitForTimeout(150); await p.screenshot({ path: f }); };
      await frames(2); const before = out + '_' + tier + '_0before.png'; await shotAt(before); await resume();
      await p.evaluate(() => { const w = window.__wd; SS.wallPuffs0 = SS.wallPuffs | 0; SS.fx.impact(w.p, w.n, w.o); window.__wdT = performance.now(); window.__wdF = SS.frameN; });
      res.shots = [];
      for (const [tag, k] of [['f1', 1], ['f3', 2], ['f6', 3]]) { await frames(k); const f = out + '_' + tier + '_' + tag + '.png'; const info = await p.evaluate(() => ({ dF: SS.frameN - window.__wdF, ms: Math.round(performance.now() - window.__wdT), live: SS.fx3.puffs.live })); await shotAt(f); await resume(); res.shots.push({ tag, ...info, ...(await diffBox(before, f)), file: f }); }
      await p.waitForTimeout(Math.max(0, 2000 - (await p.evaluate(() => performance.now() - window.__wdT)))); { const f = out + '_' + tier + '_2s.png'; await p.screenshot({ path: f }); const info = await p.evaluate(() => ({ dF: SS.frameN - window.__wdF, ms: Math.round(performance.now() - window.__wdT), live: SS.fx3.puffs.live })); res.shots.push({ tag: '2s', ...info, ...(await diffBox(before, f)), file: f }); }
      res.wallPuffs = await p.evaluate(() => (SS.wallPuffs | 0) - SS.wallPuffs0);
      const f1 = res.shots[0]; if (!(f1.w >= 40)) fail.push('frame+1 puff only ' + f1.w + ' px wide');
      const s2 = res.shots[3]; if (!(s2.px > 0)) fail.push('nothing left at ~2 s'); }
    res.errs = errs; if (errs.length) fail.push('errors');
  } finally { await b.close(); srv.close(); }
  console.log(JSON.stringify(res)); console.log(fail.length ? 'WALLDUST FAIL ' + fail.join(' ; ') : 'WALLDUST PASS'); process.exit(fail.length ? 1 : 0); })().catch((e) => { console.error(e); process.exit(1); });
