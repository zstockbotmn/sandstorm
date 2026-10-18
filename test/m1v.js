const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const D = path.resolve(__dirname, '../dist'); const PORT = 8817;
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.glb': 'model/gltf-binary' };
const srv = http.createServer((q, r) => { let f = path.join(D, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); }).listen(PORT);
// m1v hotfix checks (tester played at 1-6 fps on Ultra-low):
//  A off-view rooftop shooter at 2 fps: no damage, warning shown; control on-screen shooter does hit
//  B 1.5 s grace after first cover + softer wave-1 damage   C every tap/click registers at 1 fps
//  D scoped hits register at 2 fps   E 'Starting...' is on screen right after the tap with a throttled CPU
//  F damage arc sits on the viewport edge at several aspect ratios, one per damaging hit
const OUT = path.resolve(__dirname, '../screenshots/m1v'); fs.mkdirSync(OUT, { recursive: true });
const QS = process.env.SS_QS || '', ONLY = process.env.SS_M1V ? process.env.SS_M1V.split(',') : null;
(async () => { const b = await require('../tools/guard').launch(chromium, { executablePath: '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }, { timeoutMs: 1500000 });
  const res = {}, fail = [];
  const slowRaf = () => { const raf = window.requestAnimationFrame.bind(window); window.requestAnimationFrame = (cb) => raf((t) => { const ms = window.__slowMs | 0; if (ms) { const t0 = performance.now(); while (performance.now() - t0 < ms) {} } cb(t); }); };
  async function page(vp) { const ctx = await b.newContext({ viewport: vp || { width: 844, height: 390 }, hasTouch: true }); const p = await ctx.newPage(); await p.addInitScript(slowRaf); p.on('pageerror', (e) => (res.pageErrors = res.pageErrors || []).push(String(e).slice(0, 160))); return p; }
  async function startRun(p, extra) { await p.goto('http://127.0.0.1:' + PORT + '/?seed=7&calm=1' + (extra || '') + QS); await p.waitForFunction(() => window.SS && SS.art && SS.art.done, null, { timeout: 180000 });
    await p.click('#play'); await p.waitForFunction(() => window.SS && SS.running && !document.body.classList.contains('starting'), null, { timeout: 120000 });
    await p.evaluate(() => { window.__dmg = []; const P = SS.player, d0 = P.damage.bind(P); P.damage = (amount, from) => { const c = SS.camera; c.updateMatrixWorld(); let ndc = null;
        if (from) { let best = null, bd = 1e9; for (const e of SS.enemies.list || []) { if (!e.alive) continue; const dd = e.group.position.distanceTo(from); if (dd < bd) { bd = dd; best = e; } }
          if (best) { const w = best.group.position.clone(); w.y += 1.25; const v = w.project(c); ndc = [+v.x.toFixed(2), +v.y.toFixed(2), +v.z.toFixed(3)]; } }
        window.__dmg.push({ t: performance.now(), amount: +(+amount).toFixed(2), ndc, wave: SS.waveClears | 0, soft: (SS.waveClears | 0) === 0 && (SS.simTime || 0) < 40, cover: !!SS.input.cover }); return d0(amount, from); }; }); }
  const hideOthers = (p) => p.evaluate(() => { for (const q of SS.enemies.list) if (q !== window.__e && q.alive) { q.group.position.y = -50; q.pinned = true; q.shootCd = 1e9; } });
  const want = (k) => !ONLY || ONLY.includes(k);
  // A) off-view rooftop shooter (upper right, outside the frustum) at ~2 fps; then the same shooter on screen as the control
  if (want('A')) try { const p = await page(); await startRun(p);
    await p.evaluate(() => { SS.player.health = 1e6; SS.testAccuracy = 8; window.__e = SS.debug.spawnEnemy('shifter'); const e = window.__e; e.pinned = true; e.shootCd = 1e9; e.health = 1e6;
      window.__pose = (mode) => { const c = SS.camera.position, y = SS.input.yaw, f = [Math.sin(y), -Math.cos(y)], r = [Math.cos(y), Math.sin(y)];
        if (mode === 'off') e.group.position.set(c.x + r[0] * 12 + f[0] * 3, 7, c.z + r[1] * 12 + f[1] * 3); else e.group.position.set(c.x + f[0] * 13 + r[0] * 0.6, 0, c.z + f[1] * 13 + r[1] * 0.6); e.group.updateMatrixWorld(true); };
      window.__mode = 'off'; window.__shots = 0; window.__iv = setInterval(() => { window.__pose(window.__mode); const w0 = SS.hud.warnCount | 0; SS.enemies.debugShoot(e); window.__shots++;
        if (window.__mode === 'off' && (SS.hud.warnCount | 0) > w0 && !window.__frozeWarn) { window.__frozeWarn = 1; SS.hudFreeze = true; } }, 350); });
    await hideOthers(p); await p.evaluate(() => { window.__slowMs = 480; window.__dmg.length = 0; SS.offViewShots = 0; });
    const t0 = Date.now(); let shot = false; while (Date.now() - t0 < 22000) { await p.waitForTimeout(1000); if (!shot && await p.evaluate(() => !!SS.hudFreeze)) { await p.screenshot({ path: OUT + '/A-offview-warning.png' }); await p.evaluate(() => { SS.hudFreeze = false; }); shot = true; } }
    res.A = await p.evaluate(() => ({ shots: window.__shots, dmg: window.__dmg.length, offView: SS.offViewShots | 0, warns: SS.hud.warnCount | 0, fps: SS.benchFps || null }));
    await p.evaluate(() => { window.__mode = 'on'; window.__dmg.length = 0; }); await p.waitForTimeout(16000);
    res.A.control = await p.evaluate(() => ({ dmg: window.__dmg.length, offscreenDmg: window.__dmg.filter((d) => d.ndc && (Math.abs(d.ndc[0]) > 1 || Math.abs(d.ndc[1]) > 1 || d.ndc[2] > 1)).length, sample: window.__dmg.slice(0, 3) }));
    await p.evaluate(() => { clearInterval(window.__iv); window.__slowMs = 0; });
    if (res.A.dmg > 0) fail.push('A: off-view rooftop shooter dealt ' + res.A.dmg + ' hits at 2 fps');
    if (res.A.offView < 3 || res.A.warns < 3) fail.push('A: off-view shots not warned ' + JSON.stringify(res.A));
    if (res.A.control.dmg < 1) fail.push('A: control (on-screen shooter) never hit: test not exercised ' + JSON.stringify(res.A.control));
    if (res.A.control.offscreenDmg) fail.push('A: damage from an off-screen shooter in the control phase');
    await p.context().close(); } catch (e) { fail.push('A exception ' + e.message); }
  // B) grace after first cover + wave-1 damage
  if (want('B')) try { const p = await page(); await startRun(p);
    await p.evaluate(() => { SS.player.health = 1e6; SS.testAccuracy = 8; window.__e = SS.debug.spawnEnemy('shifter'); const e = window.__e; e.pinned = true; e.shootCd = 1e9; e.health = 1e6; e.engaged = true;
      window.__iv = setInterval(() => { const c = SS.camera.position, y = SS.input.yaw; e.group.position.set(c.x + Math.sin(y) * 13 + Math.cos(y) * 0.6, 0, c.z - Math.cos(y) * 13 + Math.sin(y) * 0.6); e.group.updateMatrixWorld(true); SS.enemies.debugShoot(e); }, 150); });
    await hideOthers(p);
    await p.waitForFunction(() => SS.firstCoverT > 0, null, { timeout: 90000 }).catch(() => {}); await p.waitForTimeout(5000);
    res.B = await p.evaluate(() => { clearInterval(window.__iv); const fc = SS.firstCoverT; const D = window.__dmg; return { firstCover: !!fc, inGrace: D.filter((d) => d.t >= fc && d.t < fc + 1450).length, afterGrace: D.filter((d) => d.t >= fc + 1500).length,
      blocked: SS.graceBlocked | 0, wave1Max: Math.max(0, ...D.filter((d) => d.soft).map((d) => d.amount)), wave1Hits: D.filter((d) => d.soft).length }; });
    if (!res.B.firstCover) fail.push('B: never reached cover'); else { if (res.B.inGrace) fail.push('B: ' + res.B.inGrace + ' hits inside the 1.5 s cover grace'); if (!res.B.afterGrace) fail.push('B: no hits after the grace (test not exercised)'); }
    if (!res.B.wave1Hits) fail.push('B: no wave-1 hits sampled'); else if (res.B.wave1Max > 22 * 0.6 + 0.01) fail.push('B: wave-1 hit of ' + res.B.wave1Max + ' > ' + (22 * 0.6).toFixed(1));
    await p.context().close(); } catch (e) { fail.push('B exception ' + e.message); }
  // C) taps and clicks at ~1 fps: every one fires
  if (want('C')) try { const p = await page(); await startRun(p); const cdp = await p.context().newCDPSession(p);
    await p.evaluate(() => { SS.player.health = 1e6; for (const q of SS.enemies.list) { q.group.position.y = -50; q.pinned = true; q.shootCd = 1e9; } SS.weapon.ammo = 30; SS.weapon.reserve = 300; window.__slowMs = 950; });
    await p.waitForTimeout(2500); const fb = await p.evaluate(() => { const r = document.querySelector('[data-ctl=fire]').getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; });
    const s0 = await p.evaluate(() => SS.weapon.shotsFired);
    const sends = []; for (let i = 0; i < 5; i++) { const pt = [{ x: fb[0] + i, y: fb[1], id: 1 }]; sends.push(cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pt })); sends.push(cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })); }
    await Promise.all(sends); await p.waitForTimeout(4500); const s1 = await p.evaluate(() => { SS.weapon.ammo = 30; return SS.weapon.shotsFired; });
    const clicks = []; for (let i = 0; i < 5; i++) { clicks.push(cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: 520, y: 150, button: 'left', clickCount: 1 })); clicks.push(cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: 520, y: 150, button: 'left', clickCount: 1 })); }
    await Promise.all(clicks); await p.waitForTimeout(4500); const s2 = await p.evaluate(() => SS.weapon.shotsFired);
    res.C = { taps: s1 - s0, clicks: s2 - s1, fps: await p.evaluate(() => SS.benchFps || null) };
    if (res.C.taps !== 5) fail.push('C: 5 FIRE taps at ~1 fps fired ' + res.C.taps); if (res.C.clicks !== 5) fail.push('C: 5 clicks at ~1 fps fired ' + res.C.clicks);
    await p.evaluate(() => { window.__slowMs = 0; }); await p.context().close(); } catch (e) { fail.push('C exception ' + e.message); }
  // D) scoped hits at ~2 fps on an exposed fighter at ~22 m
  if (want('D')) try { const p = await page(); await startRun(p); const cdp = await p.context().newCDPSession(p);
    await p.evaluate(() => { SS.player.health = 1e6; window.__e = SS.debug.spawnEnemy('shifter'); }); await hideOthers(p); await p.waitForTimeout(3000);
    res.D = await p.evaluate(() => { const e = window.__e, c = SS.camera.position; e.shootCd = 1e9; let ok = null;
      for (const dz of [22, 20, 24, 18]) { for (const dx of [0.4, -0.8, 1.2, -1.6, 2, -2.4]) { SS.enemies.debugPose(e, c.x + dx, c.z - dz, 'idle'); e.group.updateMatrixWorld(true); const v = e.group.position.clone(); v.y += 1.25;
          const h = SS.weapon.firstHit(c.clone(), v.sub(c).normalize()); if (h && h.object.userData && h.object.userData.enemy === e) { ok = [dx, dz]; break; } } if (ok) break; }
      e.health = 100; SS.input.scope = true; SS.weapon.ammo = 30; window.__f0 = SS.weapon.shotsFired;
      window.__aimIv = setInterval(() => { const bm = SS.weapon.targets.find((m) => m.userData.enemy === e && m.userData.part === 'body'); const v = e.group.position.clone(); v.y += 1.2; if (bm) bm.getWorldPosition(v); v.sub(SS.camera.position);
        SS.input.yaw = Math.atan2(v.x, -v.z); SS.input.pitch = -Math.atan2(v.y, Math.hypot(v.x, v.z)); }, 50); window.__slowMs = 480; return { spot: ok, h0: SS.weapon.shotsHit, f0: SS.weapon.shotsFired }; });
    await p.waitForTimeout(2500); const fb = await p.evaluate(() => { const r = document.querySelector('[data-ctl=fire]').getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; });
    for (let i = 0; i < 4; i++) { const alive = await p.evaluate(() => window.__e.alive); if (!alive) break; await Promise.all([cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: fb[0], y: fb[1], id: 1 }] }), cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })]); await p.waitForTimeout(1300); (res.D.perTap = res.D.perTap || []).push(await p.evaluate(() => [SS.weapon.shotsFired, SS.weapon.shotsHit, window.__e.alive, SS.input.holdLog.map((h) => [Math.round(h.start), h.end && Math.round(h.end), Math.round(h.at)]), Math.round(performance.now()), !!SS.input.fire, SS.input.pendingShots, SS.weapon.holdFired])); }
    await p.waitForTimeout(1500); Object.assign(res.D, await p.evaluate(() => { clearInterval(window.__aimIv); window.__slowMs = 0; return { dead: !window.__e.alive, hits: SS.weapon.shotsHit, fired: SS.weapon.shotsFired, fps: SS.benchFps || null }; }));
    if (res.D.spot && res.D.fired - res.D.f0 !== (res.D.perTap || []).length) fail.push('D: ' + (res.D.fired - res.D.f0) + ' rounds for ' + (res.D.perTap || []).length + ' taps');
    if (!res.D.spot) fail.push('D: no clear spot for the scoped target'); else if (!res.D.dead) fail.push('D: scoped target at ~22 m not killed by 4 on-chest taps at 2 fps ' + JSON.stringify(res.D));
    await p.context().close(); } catch (e) { fail.push('D exception ' + e.message); }
  // E) 'Starting...' with a throttled CPU: on screen right after the tap, before the run is live
  if (want('E')) try { const p = await page(); await p.goto('http://127.0.0.1:' + PORT + '/?seed=7&calm=1' + QS); await p.waitForFunction(() => window.SS && SS.art && SS.art.done, null, { timeout: 180000 });
    const cdp = await p.context().newCDPSession(p); await cdp.send('Emulation.setCPUThrottlingRate', { rate: 6 }); await p.waitForTimeout(1500);
    const pb = await p.evaluate(() => { const r = document.getElementById('play').getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; });
    const frames = []; cdp.on('Page.screencastFrame', (f) => { frames.push({ ts: f.metadata.timestamp * 1000, data: f.data }); cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => {}); });
    await cdp.send('Page.startScreencast', { format: 'png', everyNthFrame: 1, maxWidth: 422, maxHeight: 195 }); await p.waitForTimeout(1500);
    const tTap = Date.now(); await Promise.all([cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: pb[0], y: pb[1], id: 1 }] }), cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })]);
    await p.waitForFunction(() => SS.startNowAt > 0, null, { timeout: 120000, polling: 500 }).catch(() => {}); await p.waitForTimeout(500); await cdp.send('Page.stopScreencast').catch(() => {});
    const startAt = await p.evaluate(() => SS.startNowAt || 0); const PNG = require('playwright-core/lib/utilsBundle').PNG; let seen = null;
    for (const f of frames) { if (f.ts < tTap - 50) continue; const img = PNG.sync.read(Buffer.from(f.data, 'base64')); let dark = 0, tot = 0;
      for (let y = 5; y < img.height; y += 11) for (let x = 5; x < img.width; x += 11) { const i = (y * img.width + x) * 4; tot++; if (img.data[i] + img.data[i + 1] + img.data[i + 2] < 120) dark++; }
      (res.Elog = res.Elog || []).push([Math.round(f.ts - tTap), +(dark / tot).toFixed(2)]); if (!seen && dark / tot > 0.8) { seen = { ms: Math.round(f.ts - tTap), beforeStart: f.ts < startAt, startAtMs: startAt - tTap }; fs.writeFileSync(OUT + '/E-starting.png', Buffer.from(f.data, 'base64')); } }
    res.E = { seen, throttle: 6 }; await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
    await p.waitForFunction(() => SS.running && !document.body.classList.contains('starting'), null, { timeout: 120000 }).catch(() => {}); res.E.startPaintMs = await p.evaluate(() => SS.startPaintMs); res.E.diag = await p.evaluate(() => SS.startDiag || null);
    if (!seen) fail.push('E: Starting... never seen on screen with a 6x throttled CPU'); else { if (!seen.beforeStart) fail.push('E: Starting... only reached the screen after the heavy start began'); if (seen.ms > 4000) fail.push('E: Starting... took ' + seen.ms + ' ms to reach the screen'); }
    await p.context().close(); } catch (e) { fail.push('E exception ' + e.message); }
  // F) arc on the viewport edge at several aspect ratios
  if (want('F')) try { res.F = [];
    for (const vp of [{ width: 1536, height: 890 }, { width: 844, height: 390 }, { width: 1024, height: 768 }, { width: 2400, height: 1080 }]) { const p = await page(vp); await startRun(p);
      const r = await p.evaluate(() => { SS.player.health = 1e6; const out = [], c = SS.camera.position, y = SS.input.yaw, f = [Math.sin(y), -Math.cos(y)], rt = [Math.cos(y), Math.sin(y)];
        for (const [name, a, bb] of [['right', 0, 1], ['left', 0, -1], ['front', 1, 0], ['back', -1, 0], ['frontRight', 1, 1]]) { const d0 = SS.hud.dirCount | 0;
          SS.player.damage(1, new SS.THREE.Vector3(c.x + f[0] * a * 8 + rt[0] * bb * 8, 1.4, c.z + f[1] * a * 8 + rt[1] * bb * 8)); const pt = SS.hud.dirPoint; const W = innerWidth, H = innerHeight;
          out.push({ name, drawn: (SS.hud.dirCount | 0) === d0 + 1, x: Math.round(pt[0]), y: Math.round(pt[1]), edge: Math.round(Math.min(pt[0], W - pt[0], pt[1], H - pt[1])) }); } return out; });
      await p.evaluate(() => { const c = SS.camera.position, y = SS.input.yaw; SS.player.damage(1, new SS.THREE.Vector3(c.x + Math.cos(y) * 8, 1.4, c.z + Math.sin(y) * 8)); SS.hudFreeze = true; }); await p.waitForTimeout(600);
      await p.screenshot({ path: OUT + '/F-arc-' + vp.width + 'x' + vp.height + '.png' }); await p.evaluate(() => { SS.hudFreeze = false; });
      res.F.push({ vp: vp.width + 'x' + vp.height, r }); for (const q of r) { if (!q.drawn) fail.push('F ' + vp.width + ': no arc for a ' + q.name + ' hit'); if (q.edge > 30) fail.push('F ' + vp.width + 'x' + vp.height + ': ' + q.name + ' arc ' + q.edge + ' px from the edge'); }
      await p.context().close(); } } catch (e) { fail.push('F exception ' + e.message); }
  res.fail = fail; console.log(JSON.stringify(res)); await b.close(); srv.close(); console.log(fail.length ? 'M1V FAIL ' + fail.join('; ') : 'M1V PASS'); process.exit(fail.length ? 1 : 0); })();
