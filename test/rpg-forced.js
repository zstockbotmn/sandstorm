// A12: a forced RPG (?rpg=1) must launch in EVERY wave, with ?truck=1 too (tester A11: none in waves 1-5 with both flags).
// Per config, 3 waves: wait for the launch (HP topped), let it land, then K-skip the wave. Records per wave the launch time
// after the wave start, the truck start, the thump -> whoosh gap and the hit damage (10-30, HP >= 5).
// Usage: node test/rpg-forced.js [tier] [outPrefix]   (SS_QS adds query, default '&test=fast')
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const D = path.resolve(__dirname, '../dist'); const PORT = 8844;
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.glb': 'model/gltf-binary', '.json': 'application/json', '.hdr': 'application/octet-stream' };
const srv = http.createServer((q, r) => { let f = path.join(D, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); }).listen(PORT);
const [tier = 'low', out = 'logs/a12/rpg-forced'] = process.argv.slice(2); fs.mkdirSync(path.dirname(out), { recursive: true }); const QS = process.env.SS_QS || '&test=fast';
(async () => { const b = await require('../tools/guard').launch(chromium, { executablePath: '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }, { timeoutMs: 1500000 });
  const res = { tier, configs: {} }, fail = [];
  try { for (const cfg of ['rpg=1&truck=1', 'rpg=1']) {
    const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true }); const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(String(e)));
    await p.goto('http://127.0.0.1:' + PORT + '/?seed=7&loco=2&hits=2&repos=1&fx=3&sp=5&debug&' + cfg + '&q=' + tier + QS); await p.waitForFunction(() => window.SS && SS.art && SS.art.done, null, { timeout: 180000 });
    await p.tap('#play'); await p.waitForFunction(() => SS.running && !document.body.classList.contains('starting'), null, { timeout: 120000 });
    const r = await p.evaluate(async () => {
      const sleep = (ms) => new Promise((r) => setTimeout(r, ms)), top = () => { if (SS.player.health < 60) SS.player.health = 100; };
      const waitFor = async (fn, simMax) => { const s0 = SS.simTime, t0 = performance.now(); while (!fn() && SS.simTime - s0 < simMax && performance.now() - t0 < 400000) { top(); await sleep(120); } return fn(); };
      const waves = [];
      for (let w = 1; w <= 3; w++) {
        if (!(await waitFor(() => SS.bursting, 90))) return { waves, err: 'no wave ' + w };
        const ws = SS.simTime, n0 = (SS.setpiece && SS.setpiece.rpgs) | 0, tr0 = SS.trucks | 0; let truckAt = null;
        const ok = await waitFor(() => { if (truckAt == null && (SS.trucks | 0) > tr0) truckAt = +(SS.simTime - ws).toFixed(1); return ((SS.setpiece && SS.setpiece.rpgs) | 0) > n0; }, 45);
        const rec = { w, rpg: ok, launchAfter: ok ? +(SS.setpiece.lastRpg.launchSim - ws).toFixed(1) : null, truckAt, live: SS.waveActive, bursting: SS.bursting, engaged: SS.engaged | 0, gate: SS.nadeGate, starved: !!SS.nadeStarved, noThrower: SS.nadeNoThrower, spGap: SS.setPieceAt != null ? +(SS.simTime - SS.setPieceAt).toFixed(1) : null, nades: SS.grenades | 0 };
        if (ok) { await waitFor(() => SS.setpiece.lastRpg.impactR, 20); const L = SS.setpiece.lastRpg; rec.dmg = +(+L.dmg).toFixed(1); rec.hpBefore = L.hpBefore; rec.aim = L.aim;
          const log = SS.audioLog || [], th = [...log].reverse().find((x) => x.kind === 'launch thump'), wh = [...log].reverse().find((x) => x.kind === 'whoosh'); rec.thump = th && th.t; rec.whoosh = wh && wh.t; }
        waves.push(rec); const c0 = SS.waveClears | 0; SS.enemies.killAll(); await waitFor(() => (SS.waveClears | 0) > c0, 30); SS.enemies.killAll();
      }
      return { waves }; });
    r.errs = errs; res.configs[cfg] = r; if (r.err) fail.push(cfg + ': ' + r.err); if (errs.length) fail.push(cfg + ': page errors');
    for (const w of r.waves || []) { if (!w.rpg) fail.push(cfg + ': no RPG in wave ' + w.w);
      else { if (w.dmg > 30 || (w.dmg > 0 && w.dmg < 10 && w.hpBefore - w.dmg > 5)) fail.push(cfg + ' w' + w.w + ' dmg ' + w.dmg); if (w.thump != null && w.whoosh != null && !(w.whoosh - w.thump >= 0.2)) fail.push(cfg + ' w' + w.w + ' thump/whoosh gap ' + (w.whoosh - w.thump).toFixed(2));
        if (w.truckAt != null && Math.abs(w.launchAfter - w.truckAt) < 8) fail.push(cfg + ' w' + w.w + ' RPG within 8 s of the truck start'); } }
    await ctx.close(); } } catch (e) { fail.push('exception ' + String(e).slice(0, 200)); } finally { await b.close(); srv.close(); }
  fs.writeFileSync(out + '_' + tier + '.json', JSON.stringify(res, null, 1));
  console.log(JSON.stringify(res)); console.log(fail.length ? 'RPGFORCED FAIL ' + fail.join(' ; ') : 'RPGFORCED PASS'); process.exit(fail.length ? 1 : 0); })().catch((e) => { console.error(e); process.exit(1); });
