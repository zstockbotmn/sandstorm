// A9: a real wave on one tier with ?sp=5&rpg=1 (forced RPG 6 s into the wave). Player stays ducked (cover haze shots),
// screenshots the RPG mid-flight and after impact, then a debug grenade (set-piece rules: <= 30, never below 5 HP).
// Usage: node test/rpg-wave.js [low|ultra-low] [outPrefix]
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const D = path.resolve(__dirname, '../dist'); const PORT = 8845;
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.glb': 'model/gltf-binary', '.json': 'application/json' };
const srv = http.createServer((q, r) => { let f = path.join(D, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); }).listen(PORT);
const [tier = 'low', out = 'logs/a9/rpg'] = process.argv.slice(2); fs.mkdirSync(path.dirname(out), { recursive: true });
(async () => { const b = await require('../tools/guard').launch(chromium, { executablePath: '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }, { timeoutMs: 900000 });
  const res = { tier }, fail = [];
  try { const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 1.5, isMobile: true, hasTouch: true }); const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(String(e).slice(0, 160)));
    await p.goto('http://127.0.0.1:' + PORT + '/?seed=7&loco=2&hits=2&repos=1&fx=3&sp=5&rpg=1&debug&q=' + tier); await p.waitForFunction(() => window.SS && SS.art && SS.art.done, null, { timeout: 180000 });
    await p.tap('#play'); await p.waitForFunction(() => SS.running && !document.body.classList.contains('starting'), null, { timeout: 120000 });
    await p.evaluate(() => { const raf = window.requestAnimationFrame.bind(window); window.__q = null; window.__rafOrig = raf; window.requestAnimationFrame = (cb) => { if (window.__q) { window.__q.push(cb); return 0; } return raf(cb); };
      const pn = performance.now.bind(performance); window.__pMs = 0; performance.now = () => pn() - window.__pMs; window.__pn = pn; });
    const pause = () => p.evaluate(() => { window.__q = []; window.__p0 = window.__pn(); }), resume = () => p.evaluate(() => { const q = window.__q || []; window.__q = null; window.__pMs += window.__pn() - window.__p0; q.forEach((cb) => window.__rafOrig(() => cb(performance.now()))); });
    const shot = async (name) => { await pause(); await p.waitForTimeout(150); const f = out + '_' + tier + '_' + name + '.png'; await p.screenshot({ path: f }); await resume(); return f; };
    // wait for the RPG launch (wave 1 + 6 s), topping HP so the wave cannot end the run; stay ducked (never scope)
    res.wait = await p.evaluate(async () => { const t0 = performance.now(); while (!(SS.setpiece && SS.setpiece.rpgs > 0) && performance.now() - t0 < 400000) { SS.input.scope = false; if (SS.player.health < 60) SS.player.health = 100; await new Promise((r) => setTimeout(r, 100)); }
      return { ok: !!(SS.setpiece && SS.setpiece.rpgs > 0), sim: +(SS.simTime || 0).toFixed(1), ducked: !!SS.input.cover, nearInCover: SS.coverNearMisses | 0, coverImpacts: SS.coverImpacts | 0 }; });
    if (!res.wait.ok) fail.push('no RPG within the wait');
    else { res.flight = [await shot('1rpg_launch')]; for (let i = 0; i < 2; i++) { await p.waitForTimeout(250); res.flight.push(await shot('2rpg_flight' + i)); (res.trail = res.trail || []).push(await p.evaluate(() => SS.setpieces.trailStats())); }
      await p.waitForFunction(() => SS.setpiece.lastRpg && SS.setpiece.lastRpg.impactR, null, { timeout: 30000 }); res.impactShot = await shot('3rpg_impact');
      res.rpg = await p.evaluate(() => ({ ...SS.setpiece.lastRpg, hp: SS.player.health, log: (SS.audioLog || []).slice(-12) }));
      const r = res.rpg; if (!(r.impactR - r.launchR >= 900)) fail.push('tell < 900 ms'); if (r.dmg > 30 || r.hp < 5) fail.push('rpg damage ' + r.dmg); if (r.kind === 'street') res.note = 'launch fell back to mid-street';
      { const th = r.log.find((x) => x.kind === 'launch thump'), wh = r.log.find((x) => x.kind === 'whoosh'); res.sound = { thump: th && th.t, whoosh: wh && wh.t }; if (!th || !wh || !(wh.t - th.t >= 0.2)) fail.push('thump/whoosh not sequenced ' + JSON.stringify(res.sound)); } }
    // haze: ducked in the live wave for ~6 s more, then a still
    await p.evaluate(async () => { const t0 = SS.simTime; while (SS.simTime - t0 < 6) { SS.input.scope = false; if (SS.player.health < 60) SS.player.health = 100; await new Promise((r) => setTimeout(r, 100)); } });
    res.hazeShot = await shot('4ducked_haze'); res.haze = await p.evaluate(() => ({ ducked: !!SS.input.cover, live: SS.fx3 && SS.fx3.puffs.live, coverImpacts: SS.coverImpacts | 0, near: SS.coverNearMisses | 0 }));
    // grenade under set-piece rules at 40 HP
    res.nade = await p.evaluate(async () => { SS.player.health = 40; const ok = SS.enemies.debugGrenade(); const t0 = performance.now(); const n0 = SS.lastGrenade; while (SS.lastGrenade === n0 && performance.now() - t0 < 30000) await new Promise((r) => setTimeout(r, 100)); return { thrown: ok, ...(SS.lastGrenade || {}), hp: SS.player.health }; });
    // no-escape grenade (debug: cover does not relocate) at 20 HP: must hit, capped, and leave >= 5 HP
    res.nadeStay = await p.evaluate(async () => { SS.player.health = 20; const ok = SS.enemies.debugGrenade(true); const t0 = performance.now(); const n0 = SS.lastGrenade; while (SS.lastGrenade === n0 && performance.now() - t0 < 30000) await new Promise((r) => setTimeout(r, 100)); return { thrown: ok, ...(SS.lastGrenade || {}), hp: SS.player.health }; });
    if (res.nadeStay.thrown && (res.nadeStay.dmg > 30 || res.nadeStay.hp < 5 || !(res.nadeStay.dmg > 0))) fail.push('grenade stay ' + JSON.stringify(res.nadeStay));
    if (res.nade.thrown) { if (res.nade.dmg > 30 || (res.nade.hpBefore >= 5 && res.nade.hp < 5)) fail.push('grenade ' + JSON.stringify(res.nade)); } else res.nadeNote = 'no live enemy to throw';
    res.errs = errs; if (errs.length) fail.push('errors');
  } finally { await b.close(); srv.close(); }
  console.log(JSON.stringify(res)); console.log(fail.length ? 'RPGWAVE FAIL ' + fail.join(' ; ') : 'RPGWAVE PASS'); process.exit(fail.length ? 1 : 0); })().catch((e) => { console.error(e); process.exit(1); });
