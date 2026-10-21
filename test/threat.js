// App PM (A5 enemies felt harmless): in a normal wave on Low with the preview flags, a player who aims out (scope) 3 s of
// every 5 and never fires takes the first damage within 20 game-s of the fight's first enemy round, enemies fire >= SS_MIN_SHOTS (4) rounds per
// 10 game-s, and some rounds pass close (near misses: dust/whizz/shake). HP is topped back to 100 after each hit (only first
// damage and rates are measured; no low-HP rules). Usage: SS_QS='&q=low' SS_RUNS=2 node test/threat.js
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const D = path.resolve(__dirname, '../dist'); const PORT = 8848;
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.glb': 'model/gltf-binary', '.json': 'application/json', '.ogg': 'audio/ogg', '.wav': 'audio/wav' };
const srv = http.createServer((q, r) => { let f = path.join(D, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); }).listen(PORT);
const QS = process.env.SS_QS || '&q=low', RUNS = +(process.env.SS_RUNS || 2), MIN = +(process.env.SS_MIN_SHOTS || 4), FIGHT_S = 30;
(async () => { const b = await require('../tools/guard').launch(chromium, { executablePath: '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }, { timeoutMs: 900000 });
  const fail = [], res = [];
  for (let run = 0; run < RUNS; run++) {
    const ctx = await b.newContext({ viewport: { width: 844, height: 390 } }), p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(String(e).slice(0, 160)));
    await p.goto('http://127.0.0.1:' + PORT + '/?seed=' + (7 + run) + '&loco=2&repos=1&hits=2&fx=3' + QS); await p.waitForFunction(() => window.SS && SS.art && SS.art.done, null, { timeout: 180000 });
    await p.click('#play'); await p.waitForFunction(() => SS.running && !document.body.classList.contains('starting'), null, { timeout: 120000 });
    const r = await p.evaluate(async (FIGHT_S) => { const pl = SS.player; let first = null, hits = 0, near = 0; const orig = pl.damage;
      pl.damage = function (a, from) { hits++; if (first == null) first = SS.simTime; orig.call(this, a, from); pl.health = 100; };
      const t0 = performance.now(); while (!(SS.enemyShots > 0) && performance.now() - t0 < 240000) await new Promise((ok) => setTimeout(ok, 100));
      if (SS.fx && SS.fx.nearMiss) { const nm = SS.fx.nearMiss; SS.fx.nearMiss = function (...a) { near++; return nm.apply(this, a); }; }
      const s0 = SS.simTime, shots0 = SS.enemyShots | 0, hits0 = hits; let th = null;
      let exp = 0, n = 0; while (SS.simTime - s0 < FIGHT_S && performance.now() - t0 < 600000) { const ph = (SS.simTime - s0) % 5; if (SS.input) SS.input.scope = ph < 3; /* a player who aims out 3 s of every 5 (scope pops out of cover), ducked the rest */ th = SS.threat || th; n++; if (SS.input && !SS.input.cover) exp++; await new Promise((ok) => setTimeout(ok, 200)); }
      if (SS.input) SS.input.scope = false;
      const g = SS.simTime - s0; return { firstDmgS: first == null ? null : +(first - s0).toFixed(1), gameS: +g.toFixed(1), shotsPer10: +(((SS.enemyShots | 0) - shots0) / g * 10).toFixed(1), hits: hits - hits0, nearMisses: near, exposedFrac: +(exp / Math.max(1, n)).toFixed(2), threat: th }; }, FIGHT_S);
    r.run = run; r.errs = errs; res.push(r); console.log(JSON.stringify(r)); await ctx.close();
    if (r.firstDmgS == null || r.firstDmgS > 20) fail.push('run ' + run + ': first damage ' + r.firstDmgS + ' game-s'); if (r.shotsPer10 < MIN) fail.push('run ' + run + ': ' + r.shotsPer10 + ' shots / 10 s');
    if (!r.nearMisses) fail.push('run ' + run + ': no near misses'); if (errs.length) fail.push('run ' + run + ' errors ' + errs.join(' | '));
  }
  await b.close(); srv.close(); console.log(fail.length ? 'THREAT FAIL ' + fail.join(' ; ') : 'THREAT PASS'); process.exit(fail.length ? 1 : 0); })();
