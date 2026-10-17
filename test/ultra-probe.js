// Ultra-low simplification: draw calls before/after goUltra, screenshot. Not in the suite (diagnostic).
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const D = path.resolve(__dirname, '../dist'); const PORT = 8805;
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.glb': 'model/gltf-binary' };
const srv = http.createServer((q, r) => { let f = path.join(D, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); }).listen(PORT);
(async () => { const b = await require('../tools/guard').launch(chromium, { executablePath: '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }, { timeoutMs: 300000 });
  const res = {}; try { const p = await (await b.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true })).newPage();
    await p.goto('http://127.0.0.1:' + PORT + '/?seed=7&calm=1&q=low'); await p.waitForFunction(() => window.SS && SS.art && SS.art.done, null, { timeout: 180000 });
    await p.waitForTimeout(1500); res.near = await p.evaluate(() => { const out = [], c = SS.camera.position, v = c.clone(); SS.scene.traverse((o) => { if (!o.isMesh) return; for (let q = o; q; q = q.parent) if (!q.visible) return; o.getWorldPosition(v); const d = v.distanceTo(c); if (d < 7 && v.z < c.z) { const path = []; for (let q = o; q && path.length < 4; q = q.parent) path.push(q.name || q.type); out.push(path.join('<') + '@' + d.toFixed(2)); } }); return { cam: c.toArray(), out: out.slice(0, 25) }; });
    res.pick = await p.evaluate(() => { const R = new SS.THREE.Raycaster(), out = []; for (const [x, y] of [[0.25, -0.2], [0.3, 0.1], [0.2, -0.6], [-0.1, -0.7]]) { R.setFromCamera(new SS.THREE.Vector2(x, y), SS.camera);
      const h = R.intersectObjects(SS.scene.children, true).filter((q) => { for (let o = q.object; o; o = o.parent) if (!o.visible) return false; return true; })[0];
      if (h) { const path = []; for (let q = h.object; q && path.length < 5; q = q.parent) path.push(q.name || q.type); out.push([x, y, path.join('<'), h.distance.toFixed(2), h.object.material && h.object.material.color && h.object.material.color.getHexString(), JSON.stringify(h.object.userData).slice(0, 80)]); } } return out; });
    res.dom = await p.evaluate(() => [[560, 200], [420, 305], [480, 250]].map(([x, y]) => document.elementsFromPoint(x, y).slice(0, 5).map((e) => e.tagName + '#' + e.id + '.' + e.className).join(' > ')));
    { const shot = async () => { await p.evaluate(() => { document.getElementById('start').style.display = 'none'; }); await p.screenshot({ path: 'screenshots/ultra/cat-' + (shot.n = (shot.n | 0) + 1) + '.png' }); await p.evaluate(() => { document.getElementById('start').style.display = ''; }); return shot.n; };
      res.cat = {}; res.cat.base = await shot();
      for (const k of ['isSprite', 'isSkinnedMesh', 'isInstancedMesh', 'isPoints', 'isLine']) { const n = await p.evaluate((k) => { window.__h = []; SS.scene.traverse((o) => { if (o[k] && o.visible) { o.visible = false; window.__h.push(o); } }); return window.__h.length; }, k);
        await p.waitForTimeout(700); res.cat[k] = [n, await shot()]; await p.evaluate(() => { for (const o of window.__h) o.visible = true; }); } }
    res.titleHudHidden = await p.evaluate(() => getComputedStyle(document.getElementById('hud')).visibility);
    fs.mkdirSync('screenshots/ultra', { recursive: true }); await p.screenshot({ path: 'screenshots/ultra/0-title.png' });
    await p.click('#play'); await p.waitForTimeout(4000); res.hudRun = await p.evaluate(() => getComputedStyle(document.getElementById('hud')).visibility);
    res.low = await p.evaluate(() => SS.renderer.info.render.calls); await p.screenshot({ path: 'screenshots/ultra/1-low.png' });
    await p.evaluate(() => SS.goUltra('probe')); await p.waitForTimeout(4000);
    res.ultra = await p.evaluate(() => ({ calls: SS.renderer.info.render.calls, hidden: SS.ultraHidden, q: SS.quality })); await p.screenshot({ path: 'screenshots/ultra/2-ultra.png' });
  } catch (e) { res.err = e.message; } console.log(JSON.stringify(res)); await b.close(); srv.close(); process.exit(0); })();
