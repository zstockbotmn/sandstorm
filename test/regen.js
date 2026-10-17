// m1u (Zack's rule): health regenerates after a while without damage. At ~5 fps: take heavy damage, clear the wave, and
// the player must be at >= 90 hp when the next wave makes contact (real-time regen during the walk between waves).
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const D = path.resolve(__dirname, '../dist'); const PORT = 8814;
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.glb': 'model/gltf-binary' };
const srv = http.createServer((q, r) => { let f = path.join(D, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); }).listen(PORT);
(async () => { const b = await require('../tools/guard').launch(chromium, { executablePath: '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }, { timeoutMs: 600000 });
  const res = {}, fail = [];
  try { const p = await (await b.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true })).newPage();
    await p.addInitScript(() => { const raf = window.requestAnimationFrame.bind(window); window.requestAnimationFrame = (cb) => raf((t) => { const ms = window.__slowMs | 0; if (ms) { const t0 = performance.now(); while (performance.now() - t0 < ms) {} } cb(t); }); });
    await p.goto('http://127.0.0.1:' + PORT + '/?seed=3' + (process.env.SS_QS || '')); await p.waitForFunction(() => window.SS && SS.art && SS.art.done, null, { timeout: 180000 });
    await p.click('#play'); await p.waitForFunction(() => SS.running, null, { timeout: 60000 }); await p.evaluate(() => { window.__slowMs = 200; });
    // wave 1: wait for its fighters, take a beating, then they all die
    await p.waitForFunction(() => SS.enemies.list.some((e) => e.alive), null, { timeout: 90000 });
    await p.evaluate(() => { for (const e of SS.enemies.list) e.shootCd = 1e9; SS.player.damage(78, SS.camera.position.clone().add(new SS.THREE.Vector3(0, 0, -10))); });
    res.hpAfterHit = await p.evaluate(() => Math.round(SS.player.health));
    await p.waitForTimeout(1500);
    await p.evaluate(() => { const w = SS.waveClears | 0; window.__w0 = w; const t = setInterval(() => { if (SS.enemies.list.some((e) => e.alive && !e.dying)) SS.debug.killAll(); if ((SS.waveClears | 0) > w) clearInterval(t); }, 300); });
    await p.waitForFunction(() => (SS.waveClears | 0) > window.__w0, null, { timeout: 90000 }).catch(() => {});
    res.clearedAt = await p.evaluate(() => ({ hp: Math.round(SS.player.health), d: Math.round(SS.distance), clears: SS.waveClears | 0 }));
    // next contact = first fighter of the next wave alive
    const t0 = Date.now(); let contact = null;
    while (Date.now() - t0 < 120000) { contact = await p.evaluate(() => SS.enemies.list.some((e) => e.alive && !e.dying) ? { hp: Math.round(SS.player.health), d: Math.round(SS.distance) } : null); if (contact) break; await p.waitForTimeout(150); }
    res.contact = contact; res.secs = Math.round((Date.now() - t0) / 1000); res.fps = await p.evaluate(() => SS.benchFps || null);
    if (!(res.clearedAt.clears >= 1)) fail.push('wave 1 never cleared ' + JSON.stringify(res));
    else if (!contact) fail.push('no next contact within 120 s ' + JSON.stringify(res));
    else if (contact.hp < 90) fail.push('next contact at ' + contact.hp + ' hp (want >= 90) ' + JSON.stringify(res));
  } catch (e) { fail.push('exception ' + e.message); }
  res.fail = fail; console.log(JSON.stringify(res)); console.log(fail.length ? 'REGEN FAIL' : 'REGEN PASS'); await b.close(); srv.close(); process.exit(fail.length ? 1 : 0); })();
