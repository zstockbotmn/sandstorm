// A5 tester: with ?enemies=1 the player took no damage in ~2 min. Measure enemy fire vs hits on a given build/flags.
// The player stands exposed (never ducks, never fires) after first contact; HP is topped back to 100 after each hit so the
// low-HP rules never kick in. Over SS_SECS real seconds (default 90) after the first enemy shot: shots (SS.enemyShots), hits
// (player.damage calls from enemies), game seconds, fps, and every gate counter (offView, fresh, blind, dmgCap, grace, silent).
// Usage: SS_DIST=dist SS_QS='&q=low&enemies=1&loco=2&repos=1&hits=2&fx=3' node test/passive.js
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const D = path.resolve(process.env.SS_DIST || path.join(__dirname, '../dist')); const PORT = +(process.env.SS_PORT || 8847);
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.glb': 'model/gltf-binary', '.json': 'application/json', '.ogg': 'audio/ogg', '.wav': 'audio/wav' };
const srv = http.createServer((q, r) => { let f = path.join(D, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); }).listen(PORT);
const QS = process.env.SS_QS || '&q=low&enemies=1', SECS = +(process.env.SS_SECS || 90);
(async () => { const b = await require('../tools/guard').launch(chromium, { executablePath: '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }, { timeoutMs: 600000 });
  const p = await (await b.newContext({ viewport: { width: 844, height: 390 } })).newPage(); const errs = []; p.on('pageerror', (e) => errs.push(String(e).slice(0, 160)));
  await p.goto('http://127.0.0.1:' + PORT + '/?seed=7' + QS); await p.waitForFunction(() => window.SS && SS.art && SS.art.done, null, { timeout: 180000 });
  await p.click('#play'); await p.waitForFunction(() => SS.running && !document.body.classList.contains('starting'), null, { timeout: 120000 });
  const r = await p.evaluate(async (SECS) => { const pl = SS.player; let hits = 0, dmg = 0; const orig = pl.damage; pl.damage = function (a, from) { hits++; dmg += a || 0; orig.call(this, a, from); pl.health = 100; if (SS.hud && SS.hud.setHealth) SS.hud.setHealth(100); };
    const t0 = performance.now(); while (!(SS.enemyShots > 0) && performance.now() - t0 < 240000) await new Promise((ok) => setTimeout(ok, 250));
    const keys = ['enemyShots', 'offViewShots', 'freshBlocked', 'blindHitsBlocked', 'dmgCapBlocked', 'graceBlocked'], base = {}; for (const k of keys) base[k] = SS[k] | 0;
    const tw = performance.now(), ts = SS.simTime || 0, f0 = SS.frameN | 0, h0 = hits; let silent0 = 0; for (const e of SS.enemies.list) silent0 += e.silentSkips | 0;
    const ph = {}; while (performance.now() - tw < SECS * 1000) { if (SS.input) SS.input.cover = false; for (const e of SS.enemies.list) if (e.alive && !e.dying) { const k = (e.phase || '?') + (e.behavior ? '/' + e.behavior : ''); ph[k] = (ph[k] | 0) + 1; } await new Promise((ok) => setTimeout(ok, 200)); }
    const out = { waitToFirstShotS: +((tw - t0) / 1000).toFixed(1), realS: SECS, gameS: +((SS.simTime || 0) - ts).toFixed(1), fps: +(((SS.frameN | 0) - f0) / SECS).toFixed(2), hits: hits - h0, dmg: Math.round(dmg) };
    for (const k of keys) out[k] = (SS[k] | 0) - base[k]; let silent = 0, alive = 0; for (const e of SS.enemies.list) { silent += e.silentSkips | 0; if (e.alive) alive++; } out.silentSkips = silent - silent0; out.alive = alive;
    out.phases = ph; out.shotsPerGameMin = out.gameS > 0 ? +(out.enemyShots / out.gameS * 60).toFixed(1) : 0; out.hitRate = out.enemyShots ? +(out.hits / out.enemyShots).toFixed(3) : 0; return out; }, SECS);
  await b.close(); srv.close(); console.log(JSON.stringify({ qs: QS, dist: D, ...r, errs })); process.exit(0); })();
