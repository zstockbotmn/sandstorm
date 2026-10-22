// A19 probe (tester A18: a corpse hung horizontal ~1 m up for 4 frames): kill fighters with K and sample the ragdoll
// height (sim + real time) until it settles; FAIL if a settled body's lowest part is > 0.45 m up with no box under it.
// (was: kill log through the NORMAL hit path (not K): a torso kill and a limb kill each log "kill (torso)" / "kill (limb)",
// a head kill "kill (head)", and clearing the wave logs "wave N clear". Low, no flags.
// Usage: node test/kill-log.js [low] [outPrefix]
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const D = path.resolve(__dirname, '../dist'); const PORT = 8848;
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.glb': 'model/gltf-binary', '.json': 'application/json', '.hdr': 'application/octet-stream' };
const srv = http.createServer((q, r) => { let f = path.join(D, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); }).listen(PORT);
const [tier = 'low', out = 'logs/a19/doll'] = process.argv.slice(2); fs.mkdirSync(path.dirname(out), { recursive: true });
(async () => { const b = await require('../tools/guard').launch(chromium, { executablePath: '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }, { timeoutMs: 400000 });
  const res = { tier }, fail = [];
  try { const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 1.5, isMobile: true, hasTouch: true }); const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(String(e)));
    await p.goto('http://127.0.0.1:' + PORT + '/?seed=7&loco=2&hits=2&repos=1&fx=3&sp=5&debug&q=' + tier); await p.waitForFunction(() => window.SS && SS.art && SS.art.done, null, { timeout: 180000 });
    await p.tap('#play'); await p.waitForFunction(() => SS.running && !document.body.classList.contains('starting'), null, { timeout: 120000 });
    await p.waitForFunction(() => (SS.enemies.list || []).filter((e) => e.alive && !e.dying).length >= 2, null, { timeout: 240000, polling: 500 });
    await p.waitForTimeout(1500);
    res.dolls = await p.evaluate(async () => { const out = [];
      for (let k = 0; k < 4; k++) { const before = SS.lastDoll; SS.debugKillNearest(); const t0 = performance.now(), s0 = SS.simTime; let d = null; const tr = [];
        while (performance.now() - t0 < 9000) { await new Promise((r) => setTimeout(r, 150)); d = SS.lastDoll !== before ? SS.lastDoll : null; if (!d) continue;
          const ys = d.parts.map((q) => q.mesh.position.y), mn = Math.min(...ys), av = ys.reduce((a, b) => a + b, 0) / ys.length;
          tr.push([+((SS.simTime - s0)).toFixed(2), +((performance.now() - t0) / 1000).toFixed(2), +mn.toFixed(2), +av.toFixed(2), d.settled ? 1 : 0]); if (d.settled && tr.length > 3) break; }
        const boxes = d && d.boxes ? d.boxes.map((b) => ({ y: +b.p.y.toFixed(2), top: +(b.p.y + b.hy).toFixed(2), hx: +b.hx.toFixed(2), hz: +b.hz.toFixed(2) })) : [];
        out.push({ k, mode: (SS.enemies.list || []).slice(-1)[0] && null, settled: d && d.settled, last: tr[tr.length - 1], boxes, trace: tr.filter((_, i) => i % 3 === 0 || i === tr.length - 1) });
        await new Promise((r) => setTimeout(r, 1500)); if (!(SS.enemies.list || []).some((x) => x.alive && !x.dying)) break; }
      return out; });
    for (const d of res.dolls) { if (!d.last) continue; const [s, r, mn, av, st] = d.last; if (st && mn > 0.45 && !d.boxes.some((b) => b.top > mn - 0.3 && b.top < mn + 0.3)) fail.push('doll ' + d.k + ' settled ' + mn + ' m up with no box under it'); if (!st && mn > 0.45) fail.push('doll ' + d.k + ' still up after 9 s (min y ' + mn + ')'); }
    if (errs.length) { res.errs = errs.slice(0, 5); fail.push('page errors'); } await ctx.close();
  } catch (e) { fail.push('exception ' + e.message); }
  await b.close(); srv.close(); res.fail = fail; console.log(JSON.stringify(res)); console.log(fail.length ? 'DOLL FAIL ' + fail.join(' ; ') : 'DOLL PASS'); process.exit(fail.length ? 1 : 0);
})();
