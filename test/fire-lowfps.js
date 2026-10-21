// A2 tester: "FIRE click sometimes didn't register (ammo unchanged)" at 0.7 fps. NOT run yet.
// Busy-waits each frame (SS_SPIN_MS, default 1300 -> ~0.7 fps) and clicks with real mouse events:
//   A  FIRE button, quick click (down/up 40 ms apart, both inside one frame) x10, 2.5 s apart -> exactly 1 round each
//   B  canvas still-click x6 -> exactly 1 round each
//   C  reload: a click DURING the reload fires 0 (by design, counted in tapsExpired), a click 300 ms after it ends fires 1
//   D  wave clear: a click queued in the same frame the last enemy dies is dropped by design (input.fireCuts +1);
//      a click 400 ms after that kill (next frames) must still fire 1 (no lingering cut)
//   E  a 1.5 s FIRE hold, then a quick click right after release (same frame) -> the click adds 1 round on top of the hold
// Logs per click: rounds fired, ammo before/after, fireCuts, tapsExpired, the last holdLog entry, frame gap. Any click in A,
// B, the post-reload click in C, the post-kill click in D or the extra click in E that fires 0 is the bug.
// Usage: SS_QS='&q=low&test=fast' node test/fire-lowfps.js
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const D = path.resolve(__dirname, '../dist'); const PORT = 8844;
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.glb': 'model/gltf-binary', '.json': 'application/json' };
const srv = http.createServer((q, r) => { let f = path.join(D, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); }).listen(PORT);
const QS = process.env.SS_QS || '', SPIN = Number(process.env.SS_SPIN_MS || 1300);
(async () => { const b = await require('../tools/guard').launch(chromium, { executablePath: '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }, { timeoutMs: 900000 });
  const res = { spinMs: SPIN }, fail = []; const ctx = await b.newContext({ viewport: { width: 844, height: 390 } }); const p = await ctx.newPage();
  await p.addInitScript(() => { const raf = window.requestAnimationFrame.bind(window); window.requestAnimationFrame = (cb) => raf((t) => { const s = window.__spinMs | 0; if (s) { const t0 = performance.now(); while (performance.now() - t0 < s) {} } cb(t); }); });
  await p.goto('http://127.0.0.1:' + PORT + '/?seed=7&calm=1&loco=2&hits=2' + QS); await p.waitForFunction(() => window.SS && SS.art && SS.art.done, null, { timeout: 180000 });
  await p.click('#play'); await p.waitForFunction(() => SS.running && !document.body.classList.contains('starting'), null, { timeout: 120000 });
  await p.evaluate(() => { SS.walking = false; SS.player.health = 1e6; SS.weapon.reserve = 999; for (const e of SS.enemies.list) { e.shootCd = 1e9; e.health = 1e9; } });
  await p.waitForTimeout(1500); await p.evaluate((s) => { window.__spinMs = s; }, SPIN); await p.waitForTimeout(3000);
  const fireBox = await p.evaluate(() => { const r = document.querySelector('button[data-ctl="fire"]').getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
  const snap = () => p.evaluate(() => ({ shots: SS.weapon.shotsFired | 0, ammo: SS.weapon.ammo, reloading: !!SS.weapon.reloading, cuts: SS.input.fireCuts | 0, expired: SS.input.tapsExpired | 0, hold: SS.input.holdLog && SS.input.holdLog.length ? { ...SS.input.holdLog[SS.input.holdLog.length - 1] } : null, gap: SS.input.gapMs || null }));
  const topUp = () => p.evaluate(() => { if (!SS.weapon.reloading) SS.weapon.ammo = 30; });
  const click = async (x, y) => { await p.mouse.move(x, y); await p.mouse.down(); await p.waitForTimeout(40); await p.mouse.up(); };
  const one = async (tag, x, y, want) => { await topUp(); await p.waitForTimeout(400); const a = await snap(); await click(x, y); await p.waitForTimeout(2500); const z = await snap(); const r = { tag, fired: z.shots - a.shots, want, ammo: [a.ammo, z.ammo], cuts: z.cuts - a.cuts, expired: z.expired - a.expired, hold: z.hold, gap: z.gap }; (res.clicks = res.clicks || []).push(r); if (want != null && r.fired !== want) fail.push(tag + ': fired ' + r.fired + ' (want ' + want + ')'); return r; };
  // A + B
  for (let i = 0; i < 10; i++) await one('A' + i, fireBox[0], fireBox[1], 1);
  for (let i = 0; i < 6; i++) await one('B' + i, 422, 160, 1);
  // C: reload
  await p.evaluate(() => { SS.weapon.ammo = 5; SS.input.reloadPressed = true; }); await p.waitForTimeout(300);
  res.reloadStarted = await p.evaluate(() => !!SS.weapon.reloading); { const a = await snap(); await click(fireBox[0], fireBox[1]); await p.waitForTimeout(400); const z = await snap(); res.C_during = { fired: z.shots - a.shots, expired: z.expired - a.expired, stillReloading: z.reloading }; }
  await p.waitForFunction(() => !SS.weapon.reloading, null, { timeout: 60000 }); await p.waitForTimeout(300); await one('C_after', fireBox[0], fireBox[1], 1);
  // D: wave clear in the same frame as a queued click
  res.D = await p.evaluate(async () => { const L = SS.enemies.list.filter((e) => e.alive); for (const e of L.slice(1)) { e.health = 1; e.takeHit('head', e.group.position.clone().setY(1.6)); } await new Promise((r) => setTimeout(r, 3000)); return { alive: SS.enemies.list.filter((e) => e.alive).length }; });
  { await topUp(); const a = await snap(); await p.mouse.move(fireBox[0], fireBox[1]); await p.mouse.down(); await p.evaluate(() => { const e = SS.enemies.list.find((q) => q.alive); if (e) { e.health = 1; SS.debugKillNearest(); } }); await p.mouse.up();
    await p.waitForTimeout(2500); const z = await snap(); res.D.sameFrame = { fired: z.shots - a.shots, cuts: z.cuts - a.cuts }; }
  await p.waitForTimeout(400); await one('D_after', fireBox[0], fireBox[1], 1);
  // E: hold then a quick click right after release
  { await topUp(); const a = await snap(); await p.mouse.move(fireBox[0], fireBox[1]); await p.mouse.down(); await p.waitForTimeout(1500); await p.mouse.up(); await p.waitForTimeout(30); await click(fireBox[0], fireBox[1]); await p.waitForTimeout(3000); const z = await snap();
    res.E = { fired: z.shots - a.shots, holdLog: await p.evaluate(() => (SS.input.holdLog || []).slice(-3)) }; res.E.note = 'expect hold rounds (~1.5 s at the rifle rate) + 1'; }
  await p.evaluate(() => { window.__spinMs = 0; });
  console.log(JSON.stringify(res)); console.log(fail.length ? 'FIRELOWFPS FAIL ' + fail.join(' ; ') : 'FIRELOWFPS PASS'); await b.close(); srv.close(); process.exit(fail.length ? 1 : 0); })();
