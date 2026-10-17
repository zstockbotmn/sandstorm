// Real kills on Meshy (high-tier) fighters with normal fire; fails on any pageerror/console error or if a fight soft-locks.
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const D = path.resolve(__dirname, '../dist'), OUT = path.resolve(__dirname, '../screenshots/kill-art'); fs.mkdirSync(OUT, { recursive: true });
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.glb': 'model/gltf-binary', '.hdr': 'application/octet-stream' };
const srv = http.createServer((q, r) => { let f = path.join(D, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); }).listen(8798);
(async () => { const b = await require('../tools/guard').launch(chromium, { executablePath: '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }, { timeoutMs: +(process.env.SS_TIMEOUT_MS || 600000) });
  const res = { errs: [] }; let code = 0;
  try { const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
    const p = await ctx.newPage(); p.on('pageerror', e => res.errs.push('pageerror: ' + e.message + ' @ ' + (e.stack || '').split('\n').slice(0, 4).join(' | ')));
    p.on('console', m => { if (m.type() === 'error') res.errs.push('console: ' + m.text()); });
    await p.goto('http://127.0.0.1:8798/' + (process.env.SS_Q || '?seed=7') + (process.env.SS_QS || '')); await p.waitForFunction(() => window.SS && SS.art && SS.art.done, null, { timeout: 120000 });
    res.art = await p.evaluate(() => ({ tier: SS.art.tier, failed: SS.art.failed }));
    await p.tap('#play'); await p.waitForFunction(() => window.SS && SS.running, null, { timeout: 90000 }); const t0 = Date.now();
    // first contact within ~15 s
    // headless soft-GL runs ~0.1-0.3x real time, so measure first contact in GAME distance: 15 s at 3 m/s = 45 m
    res.firstContactM = await p.waitForFunction(() => SS.engaged > 0 || !SS.walking, null, { timeout: 150000, polling: 250 }).then(() => p.evaluate(() => SS.distance)).catch(() => null);
    res.probe = await p.evaluate(() => ({ d: SS.distance, alive: (SS.enemies.list || []).filter(e => e.alive).length, bursting: SS.bursting, engaged: SS.engaged, walking: SS.walking, running: SS.running, breatherTo: SS.breatherTo, gameT: SS.gameTime }));
    // fight: aim at nearest exposed enemy torso and fire until the wave clears (or 120 s)
    // top up with debug-spawned art fighters so the test sees several real deaths at soft-GL speed (kills are still real shots)
    res.naturalWave = await p.evaluate(async () => { const t0 = performance.now(); let maxAlive = 0, grew = false, prev = null; while (performance.now() - t0 < 3000) { const n = (SS.enemies.list || []).filter(e => e.alive).length; if (prev !== null && n > prev) grew = true; prev = n; maxAlive = Math.max(maxAlive, n); await new Promise(r => setTimeout(r, 100)); } return { maxAlive, grew, spawnsWhileEngaged: SS.spawnsWhileEngaged | 0, quality: SS.quality }; });
    await p.evaluate(() => { for (const b of ['shifter', 'flanker', 'shifter']) SS.debug.spawnEnemy(b); });
    res.fight = await p.evaluate(async () => { const k0 = SS.scoreSys.state.kills; const v = new SS.camera.position.constructor(); const t0 = performance.now(); let last = { k: k0, t: t0 }; const log = [];
      while (performance.now() - t0 < 200000) { const list = (SS.enemies.list || []).filter(e => e.alive);
        if (SS.scoreSys.state.kills - k0 >= 3) break;
        const tgt = list.filter(e => e.exposed).sort((a, b) => a.group.position.distanceTo(SS.camera.position) - b.group.position.distanceTo(SS.camera.position))[0];
        if (tgt) { (tgt.parts && tgt.parts.torso ? tgt.parts.torso : tgt.group).getWorldPosition(v); if (!(tgt.parts && tgt.parts.torso)) v.y += 1.2; v.sub(SS.camera.position);
          SS.input.yaw = Math.atan2(v.x, -v.z); SS.input.pitch = -Math.atan2(v.y, Math.hypot(v.x, v.z)); SS.input.scope = true; SS.input.fire = true; } else SS.input.fire = false;
        const k = SS.scoreSys.state.kills; if (k !== last.k) last = { k, t: performance.now() };
        if (performance.now() - last.t > 90000) { log.push('no kill for 90 s'); break; }
        await new Promise(r => setTimeout(r, 40)); }
      SS.input.fire = false; SS.input.scope = false;
      return { ssErrors: SS.errors || [], hitches: (SS.hitches || []).slice(0, 20), prewarmMs: SS.prewarmMs, deadVisible: (SS.enemies.list || []).filter(e => !e.alive && e.group.visible).length, kills: SS.scoreSys.state.kills - k0, walking: SS.walking, engaged: SS.engaged, hits: SS.weapon.shotsHit, shots: SS.weapon.shotsFired, secs: (performance.now() - t0) / 1000, log }; });
    await p.screenshot({ path: OUT + '/after-fight.png' });
    console.log(JSON.stringify(res, null, 1));
    if (res.errs.length) throw new Error('page errors');
    if (res.art.tier !== 'high' || res.art.failed.length) throw new Error('art not high/complete');
    if (!(res.fight.kills >= 2)) throw new Error('fewer than 2 real kills on art fighters');
    if (res.fight.ssErrors.length) throw new Error('SS.errors: ' + res.fight.ssErrors.join(', '));
    if (res.naturalWave.grew || res.naturalWave.spawnsWhileEngaged) throw new Error('reinforcements spawned during an engaged wave: ' + JSON.stringify(res.naturalWave));
    if (res.firstContactM == null || res.firstContactM > 45) throw new Error('first contact later than 45 m (~15 s)');
    console.log('KILL-ART PASS');
  } catch (e) { console.log(JSON.stringify(res, null, 1)); console.log('KILL-ART FAIL', e.message); code = 1; } finally { await b.close(); srv.close(); process.exit(code); } })();
