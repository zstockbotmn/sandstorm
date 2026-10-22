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
      // A15c: hold log lines + DOORWAY chip
      // A16: the room=1 start hold (no G yet) must log its start line
      await p.waitForFunction(() => (SS.audioLog || []).some((x) => x.kind === 'room' && /^hold start \(door [\d.]+m\)/.test(x.detail)), null, { timeout: 8000 }).catch(() => {});
      res.startLine = await p.evaluate(() => ((SS.audioLog || []).find((x) => x.kind === 'room') || {}).detail || null); if (!res.startLine || !/^hold start/.test(res.startLine)) fail.push('room=1: no "room hold start" line before any G (' + res.startLine + ')');
      res.chip1 = await p.evaluate(() => { const c = document.getElementById('room-hint'); return c ? { shown: getComputedStyle(c).display !== 'none', text: c.textContent } : null; });
      if (!res.chip1 || !res.chip1.shown || !/DOORWAY/.test(res.chip1.text)) fail.push('no DOORWAY chip while held ' + JSON.stringify(res.chip1));
      // A14: G always jumps (next room when already at one) and keeps the hold; W walks on; the hold is 40 GAME-s
      await p.keyboard.press('g'); await p.waitForTimeout(600); res.next = await p.evaluate(() => ({ jump: SS.lastRoomJump, walking: SS.walking, hold: SS.roomHold }));
      if (!res.next.hold || res.next.walking) fail.push('G released the hold ' + JSON.stringify(res.next));
      if (res.next.jump && res.next.jump.ok && res.jump && res.next.jump.room.join() === res.jump.room.join()) fail.push('G jumped to the same room');
      await p.waitForTimeout(6000); res.noWave = await p.evaluate(() => ({ waveActive: !!SS.waveActive, engaged: SS.engaged | 0, alive: (SS.enemies.list || []).filter((e) => e.alive).length }));
      if (res.noWave.waveActive || res.noWave.alive) fail.push('a wave spawned during the room hold ' + JSON.stringify(res.noWave));
      await p.waitForTimeout(10); res.stillHeld = await p.evaluate(() => SS.roomHold && !SS.walking); if (!res.stillHeld) fail.push('hold ended within 3 s');
      await p.keyboard.press('w'); await p.waitForTimeout(400); res.resumed = await p.evaluate(() => ({ walking: SS.walking, hold: SS.roomHold }));
      if (!res.resumed.walking || res.resumed.hold) fail.push('W did not resume ' + JSON.stringify(res.resumed));
      res.chip2 = await p.evaluate(() => { const c = document.getElementById('room-hint'); return c ? getComputedStyle(c).display !== 'none' : false; }); if (res.chip2) fail.push('chip still shown after W');
      // tap path (mobile): G again, tap the chip
      await p.keyboard.press('g'); await p.waitForTimeout(800); const bb = await p.locator('#room-hint').boundingBox().catch(() => null);
      if (!bb) fail.push('no chip to tap after the 3rd G'); else { await p.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2); await p.waitForTimeout(400);
        res.tapped = await p.evaluate(() => ({ walking: SS.walking, hold: SS.roomHold })); if (!res.tapped.walking || res.tapped.hold) fail.push('chip tap did not resume ' + JSON.stringify(res.tapped)); }
      res.roomLog = await p.evaluate(() => (SS.audioLog || []).filter((x) => x.kind === 'room').map((x) => x.detail + (x.n > 1 ? ' x' + x.n : '')));
      res.ends = await p.evaluate(() => (SS.roomHoldEnds || []).map((x) => x.why));
      if (!res.roomLog.some((d) => /^hold start \(door [\d.]+m\)$/.test(d))) fail.push('no "room hold start (door Nm)" line ' + JSON.stringify(res.roomLog));
      for (const why of ['G next', 'W']) if (!res.ends.includes(why)) fail.push('no "room hold end (' + why + ')" ' + JSON.stringify(res.ends));
      if (!res.roomLog.some((d) => /^hold end \(W\)/.test(d))) fail.push('no hold end (W) line in the sound log'); }
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
