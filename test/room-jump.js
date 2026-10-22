// A13: debug room jump. ?debug&bld=4&room=1 (Low) must put the walk 2.5 m short of a room doorway, facing it, walk held;
// G resumes. Also checks the sound log: no footstep/breath entries, one 'footsteps xN' line, hurt line ends '→ HP'.
// Usage: node test/room-jump.js [low|high] [outPrefix]
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const D = path.resolve(__dirname, '../dist'); const PORT = 8848;
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.glb': 'model/gltf-binary', '.json': 'application/json', '.hdr': 'application/octet-stream' };
const srv = http.createServer((q, r) => { let f = path.join(D, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); }).listen(PORT);
const [tier = 'low', out = 'logs/a13/room'] = process.argv.slice(2); fs.mkdirSync(path.dirname(out), { recursive: true });
(async () => { const b = await require('../tools/guard').launch(chromium, { executablePath: '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }, { timeoutMs: 400000 });
  const res = { tier }, fail = [];
  try { const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 1.5, isMobile: true, hasTouch: true }); const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(String(e)));
    await p.goto('http://127.0.0.1:' + PORT + '/?seed=7&loco=2&hits=2&repos=1&fx=3&sp=5&bld=4&room=1&debug&q=' + tier); await p.waitForFunction(() => window.SS && SS.art && SS.art.done, null, { timeout: 180000 });
    await p.tap('#play'); await p.waitForFunction(() => SS.running && !document.body.classList.contains('starting'), null, { timeout: 120000 });
    await p.waitForFunction(() => SS.lastRoomJump, null, { timeout: 30000 }).catch(() => {});
    res.jump = await p.evaluate(() => SS.lastRoomJump || null);
    if (!res.jump || !res.jump.ok) fail.push('room jump failed ' + JSON.stringify(res.jump));
    else { await p.waitForTimeout(1500); res.held = await p.evaluate(() => ({ walking: SS.walking, hold: SS.roomHold, z: +SS.camera?.position?.z?.toFixed?.(1) || null }));
      if (res.held.walking || !res.held.hold) fail.push('walk not held ' + JSON.stringify(res.held));
      await p.screenshot({ path: out + '_' + tier + '_doorway.png' });
      await p.keyboard.press('g'); await p.waitForTimeout(400); res.resumed = await p.evaluate(() => ({ walking: SS.walking, hold: SS.roomHold }));
      if (!res.resumed.walking || res.resumed.hold) fail.push('G did not resume ' + JSON.stringify(res.resumed)); }
    await p.waitForTimeout(4000); await p.evaluate(() => SS.debugHurt()); await p.waitForTimeout(300);
    res.log = await p.evaluate(() => ({ quiet: SS.audioQuiet, steps: (SS.audioLog || []).filter((x) => x.kind === 'footstep' || x.kind === 'breath').length, hurt: (SS.audioLog || []).filter((x) => x.kind === 'hit taken').map((x) => x.detail), hp: Math.round(SS.player.health), overlay: (document.getElementById('dbg-audiolog') || {}).textContent || '' }));
    if (res.log.steps) fail.push('footstep/breath entries in audioLog');
    if (!(res.log.quiet && res.log.quiet.total > 0)) fail.push('no footsteps counted');
    if (!res.log.hurt.some((x) => /\u2192 \d+$/.test(x))) fail.push('hurt line lacks → HP');
    if ((res.log.overlay.match(/footsteps x/g) || []).length > 1) fail.push('more than one footsteps line');
    await p.screenshot({ path: out + '_' + tier + '_log.png' });
    if (errs.length) { res.errs = errs.slice(0, 5); fail.push('page errors'); } await ctx.close();
  } catch (e) { fail.push('exception ' + e.message); }
  await b.close(); srv.close(); res.fail = fail; console.log(JSON.stringify(res)); console.log(fail.length ? 'ROOMJUMP FAIL ' + fail.join(' ; ') : 'ROOMJUMP PASS'); process.exit(fail.length ? 1 : 0);
})();
