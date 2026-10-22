// A15d: kill log through the NORMAL hit path (not K): a torso kill and a limb kill each log "kill (torso)" / "kill (limb)",
// a head kill "kill (head)", and clearing the wave logs "wave N clear". Low, no flags.
// Usage: node test/kill-log.js [low] [outPrefix]
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const D = path.resolve(__dirname, '../dist'); const PORT = 8848;
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.glb': 'model/gltf-binary', '.json': 'application/json', '.hdr': 'application/octet-stream' };
const srv = http.createServer((q, r) => { let f = path.join(D, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); }).listen(PORT);
const [tier = 'low', out = 'logs/a15/kill'] = process.argv.slice(2); fs.mkdirSync(path.dirname(out), { recursive: true });
(async () => { const b = await require('../tools/guard').launch(chromium, { executablePath: '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }, { timeoutMs: 400000 });
  const res = { tier }, fail = [];
  try { const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 1.5, isMobile: true, hasTouch: true }); const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(String(e)));
    await p.goto('http://127.0.0.1:' + PORT + '/?seed=7&loco=2&hits=2&repos=1&fx=3&sp=5&debug&q=' + tier); await p.waitForFunction(() => window.SS && SS.art && SS.art.done, null, { timeout: 180000 });
    await p.tap('#play'); await p.waitForFunction(() => SS.running && !document.body.classList.contains('starting'), null, { timeout: 120000 });
    await p.waitForFunction(() => (SS.enemies.list || []).filter((e) => e.alive && !e.dying).length >= 2, null, { timeout: 240000, polling: 500 });
    await p.waitForTimeout(1500);
    res.kills = await p.evaluate(async () => { const out = []; const parts = ['body', 'limb', 'head'];
      for (const part of parts) { const e = (SS.enemies.list || []).find((x) => x.alive && !x.dying); if (!e) { out.push(part + ': no target'); continue; }
        const pt = e.group.position.clone(); pt.y += part === 'limb' ? 0.6 : part === 'head' ? 1.6 : 1.1; e.health = 1; e.takeHit(part, pt); out.push(part + ': alive=' + e.alive);
        await new Promise((r) => setTimeout(r, 400)); }
      // clear the rest of the wave through the body path
      for (let i = 0; i < 40; i++) { const e = (SS.enemies.list || []).find((x) => x.alive && !x.dying); if (!e && !SS.waveActive) break; if (e) { e.health = 1; e.takeHit('body', e.group.position.clone().setY(1.1)); } await new Promise((r) => setTimeout(r, 500)); }
      return out; });
    await p.waitForTimeout(2000);
    res.log = await p.evaluate(() => (SS.audioLog || []).filter((x) => x.kind === 'kill' || x.kind === 'wave').map((x) => x.kind + ' ' + x.detail + (x.n > 1 ? ' x' + x.n : '')));
    for (const k of ['kill (torso)', 'kill (limb)', 'kill (head)']) if (!res.log.some((l) => l.startsWith(k))) fail.push('no "' + k + '" line');
    if (!res.log.some((l) => /^wave \d+ clear/.test(l))) fail.push('no "wave N clear" line');
    if (errs.length) { res.errs = errs.slice(0, 5); fail.push('page errors'); } await ctx.close();
  } catch (e) { fail.push('exception ' + e.message); }
  await b.close(); srv.close(); res.fail = fail; console.log(JSON.stringify(res)); console.log(fail.length ? 'KILLLOG FAIL ' + fail.join(' ; ') : 'KILLLOG PASS'); process.exit(fail.length ? 1 : 0);
})();
