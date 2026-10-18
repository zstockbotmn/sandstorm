// m1w hotfix checks (tester at 2-5 fps):
//  A a tap/click on a pickup collects it and fires nothing   B a small drag at ~2 fps (plus one stale/teleport jump) never whips the view
//  C the ammo counter matches the rifle right after taps at ~2 fps   D scoped taps on a strafing fighter (moving in the sim) at ~2 fps
//    register and kill within 2 torso hits   E an off-view shot draws a tracer on screen (>= 1 rendered frame) and plays the crack
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const D = path.resolve(__dirname, '../dist'); const PORT = 8829;
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.glb': 'model/gltf-binary' };
const srv = http.createServer((q, r) => { let f = path.join(D, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); }).listen(PORT);
const QS = process.env.SS_QS || '', ONLY = process.env.SS_M1W ? process.env.SS_M1W.split(',') : null; const want = (k) => !ONLY || ONLY.includes(k);
(async () => { const b = await require('../tools/guard').launch(chromium, { executablePath: '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'] }, { timeoutMs: 1200000 });
  const res = {}, fail = [];
  const slowRaf = () => { const raf = window.requestAnimationFrame.bind(window); window.requestAnimationFrame = (cb) => raf((t) => { if (window.__preFrame && t !== window.__pfT) { window.__pfT = t; try { window.__preFrame(); } catch (_) {} } const ms = window.__slowMs | 0; if (ms) { const t0 = performance.now(); while (performance.now() - t0 < ms) {} } cb(t); }); };
  async function start() { const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true }); const p = await ctx.newPage(); await p.addInitScript(slowRaf); p.on('pageerror', (e) => (res.pageErrors = res.pageErrors || []).push(String(e).slice(0, 160)));
    await p.goto('http://127.0.0.1:' + PORT + '/?seed=7&calm=1&autopickup=0' + QS /* b1: tap-to-pickup exists only under ?autopickup=0 */); await p.waitForFunction(() => window.SS && SS.art && SS.art.done, null, { timeout: 180000 });
    await p.click('#play'); await p.waitForFunction(() => SS.running && !document.body.classList.contains('starting'), null, { timeout: 120000 });
    await p.evaluate(() => { SS.walking = false; SS.player.health = 1e6; }); await p.waitForTimeout(1500); return { p, cdp: await ctx.newCDPSession(p) }; }
  const tap = (cdp, x, y) => Promise.all([cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y, id: 1 }] }), cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })]);
  // A
  if (want('A')) try { const { p, cdp } = await start(); res.A = [];
    await p.evaluate(() => { window.__pd = []; addEventListener('pointerdown', (e) => window.__pd.push([e.pointerType, e.target.id || e.target.tagName, e.clientX | 0, e.clientY | 0, Math.round(performance.now() - (SS.startedAt || 0))]), true); });
    for (const how of ['click', 'tap']) { const pos = await p.evaluate(() => { const c = SS.camera, y = SS.input.yaw; const v = c.position.clone(); v.x += Math.sin(y) * 8; v.z -= Math.cos(y) * 8; v.y = 0;
        window.__freezeCam = true; /* the cover move must not carry the view past the drop mid-tap */ SS.stakes.drop('health', v); SS.player.health = 50; window.__f0 = SS.weapon.shotsFired; window.__k0 = SS.pickupsTaken | 0; window.__slowMs = 450;
        const it = SS.stakes.items[SS.stakes.items.length - 1]; it.t = -1e9; /* hold it on the ground for the test */ const w = it.g.position.clone(); w.y = 0.45; w.project(c); return [(w.x + 1) / 2 * innerWidth, (1 - w.y) / 2 * innerHeight]; });
      await p.waitForTimeout(1200);
      const pos2 = await p.evaluate(() => { const it = SS.stakes.items[SS.stakes.items.length - 1]; const w = it.g.position.clone(); w.y = 0.45; w.applyMatrix4(SS.lastVP); /* aim at what was last rendered */ return [(w.x + 1) / 2 * innerWidth, (1 - w.y) / 2 * innerHeight, SS.camera.position.y]; }); pos[0] = pos2[0]; pos[1] = pos2[1]; res.Adry = res.Adry || []; res.Adry.push(await p.evaluate((q) => SS.stakes.pickAt(q[0], q[1], true), pos)); // the camera may have dipped into cover meanwhile
      if (how === 'click') await cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: pos[0], y: pos[1], button: 'left', clickCount: 1 }).then(() => cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: pos[0], y: pos[1], button: 'left', clickCount: 1 }));
      else await tap(cdp, pos[0], pos[1]);
      await p.waitForTimeout(2500); const r = await p.evaluate(() => ({ kia: !!(SS.player && !SS.player.alive), touch: SS.input.touch, pd: (window.__pd || []).slice(-4), pickTaps: SS.input.pickTaps | 0, taken: (SS.pickupsTaken | 0) - window.__k0, fired: SS.weapon.shotsFired - window.__f0, left: SS.stakes.items.length, health: SS.player.health }));
      await p.evaluate(() => { window.__slowMs = 0; window.__freezeCam = false; SS.stakes.reset(); }); r.how = how; r.pos = pos.map(Math.round); res.A.push(r);
      if (r.taken !== 1) fail.push('A ' + how + ': pickup not collected ' + JSON.stringify(r)); if (r.fired) fail.push('A ' + how + ': the pickup tap fired ' + r.fired + ' round(s)'); }
    await p.context().close(); } catch (e) { fail.push('A exception ' + e.message); }
  // B
  if (want('B')) try { const { p, cdp } = await start(); res.B = {};
    const y0 = await p.evaluate(() => { SS.input.pitch = 0; window.__slowMs = 450; return [SS.input.yaw, SS.input.pitch]; }); await p.waitForTimeout(1500);
    // m1y: explicit event timestamps (s): small moves 30 ms apart, the teleport 4 ms after the last one (a fast real drag
    // at low fps is no longer clamped; only a true teleport, > 1/3 screen at > 8000 px/s, is)
    const x = 500, y = 200, T0 = Date.now() / 1000; await cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1, timestamp: T0 });
    for (let i = 1; i <= 6; i++) await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: x + i * 5, y: y + i * 2, button: 'left', buttons: 1, timestamp: T0 + i * 0.03 }); // a small 30x12 px drag
    await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: x + 30, y: y + 12 + 260, button: 'left', buttons: 1, timestamp: T0 + 0.184 }); // one stale/teleport jump (lag burst)
    await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: x + 30, y: y + 12 + 260, button: 'left', buttons: 1, timestamp: T0 + 0.19 });
    await cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: x + 30, y: y + 272, button: 'left', clickCount: 1, timestamp: T0 + 0.22 });
    await p.waitForTimeout(4000); const r = await p.evaluate(() => { window.__slowMs = 0; return { yaw: SS.input.yaw, pitch: SS.input.pitch, spikes: SS.input.aimSpikes | 0, sens: (70 * Math.PI / 180) / Math.max(200, innerHeight) }; });
    r.dYawDeg = +((r.yaw - y0[0]) * 180 / Math.PI).toFixed(2); r.dPitchDeg = +((r.pitch - y0[1]) * 180 / Math.PI).toFixed(2); res.B = r;
    const capPx = Math.max(24, 390 * 0.12), maxPitch = (12 + capPx * 1.05) * r.sens * 180 / Math.PI, maxYaw = 30 * 1.05 * r.sens * 180 / Math.PI;
    if (Math.abs(r.dPitchDeg) > maxPitch + 0.01) fail.push('B: pitch moved ' + r.dPitchDeg + ' deg (> ' + maxPitch.toFixed(1) + ') for a 12 px drag + one jump'); if (Math.abs(r.dYawDeg) > maxYaw + 0.01) fail.push('B: yaw moved ' + r.dYawDeg + ' deg (> ' + maxYaw.toFixed(1) + ') for a 30 px drag');
    if (Math.abs(r.pitch) > 34 * Math.PI / 180) fail.push('B: view whipped to the pitch limit');
    await p.context().close(); } catch (e) { fail.push('B exception ' + e.message); }
  // C
  if (want('C')) try { const { p, cdp } = await start(); res.C = [];
    const fb = await p.evaluate(() => { window.__slowMs = 450; SS.weapon.ammo = 30; const r = document.querySelector('[data-ctl=fire]').getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; }); await p.waitForTimeout(1500);
    for (let i = 0; i < 4; i++) { await tap(cdp, fb[0], fb[1]); await p.waitForTimeout(1100); res.C.push(await p.evaluate(() => ({ hud: document.getElementById('ammo').textContent, ammo: SS.weapon.ammo, reserve: SS.weapon.reserve }))); }
    await p.evaluate(() => { window.__slowMs = 0; });
    for (const c of res.C) if (c.hud.replace(/\s/g, '') !== (c.ammo + '/' + c.reserve)) fail.push('C: ammo HUD "' + c.hud + '" vs rifle ' + c.ammo + '/' + c.reserve);
    if (res.C.length && res.C[res.C.length - 1].ammo > 26) fail.push('C: taps did not fire ' + JSON.stringify(res.C));
    await p.context().close(); } catch (e) { fail.push('C exception ' + e.message); }
  // D
  if (want('D')) try { const { p, cdp } = await start(); res.D = {};
    Object.assign(res.D, await p.evaluate(() => { const c = SS.camera.position.clone(); window.__e = SS.debug.spawnEnemy('shifter'); const e = window.__e; let ok = null;
      for (const dz of [20, 18, 22, 24]) { for (const dx of [-1.5, 0, 1.5, -3, 3]) { SS.enemies.debugPose(e, c.x + dx, c.z - dz, 'idle'); e.group.updateMatrixWorld(true); const v = e.group.position.clone(); v.y += 1.25;
        const h = SS.weapon.firstHit(c.clone(), v.sub(c).normalize()); if (h && h.object.userData && h.object.userData.enemy === e) { ok = [dx, dz]; break; } } if (ok) break; }
      e.health = 100; e.shootCd = 1e9; e.debugVel = new SS.camera.position.constructor(2.2, 0, 0); window.__x0 = e.group.position.x; window.__flip = 0; /* m1x: flips in the frame hook (the aim's lead must know the velocity) */
      SS.input.scope = true; SS.weapon.ammo = 30; window.__f0 = SS.weapon.shotsFired; window.__parts = []; const kill0 = SS.weapon.shotsHit;
      // aim like a player tracking: the view set this frame is drawn with the fighter's NEW position, so lead by this frame's
      // motion (v * sim dt); m1x shots fly along the view that was on screen, against the fighter as drawn in that frame
      window.__aim = 0; window.__lastPF = 0; window.__preFrame = () => { const now = performance.now(), gap = window.__lastPF ? Math.min(0.2, (now - window.__lastPF) / 1000) : 0.016; window.__lastPF = now;
        { const ex = e.group.position.x - window.__x0; if (Math.abs(ex) > 1.6 && Math.sign(e.debugVel.x) === Math.sign(ex)) e.debugVel.x = -e.debugVel.x; }
        const bm = SS.weapon.targets.find((m) => m.userData.enemy === e && m.userData.part === 'body'); const v = e.group.position.clone(); v.y += 1.2; if (bm) bm.getWorldPosition(v); v.addScaledVector(e.debugVel, gap * (SS.timeScale || 1)); v.sub(SS.camera.position);
        SS.input.yaw = Math.atan2(v.x, -v.z); SS.input.pitch = -Math.atan2(v.y, Math.hypot(v.x, v.z)); }; window.__slowMs = 450; return { spot: ok }; }));
    await p.waitForTimeout(2500); const fb = await p.evaluate(() => { const r = document.querySelector('[data-ctl=fire]').getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; });
    res.D.taps = [];
    for (let i = 0; i < 5; i++) { if (!(await p.evaluate(() => window.__e.alive))) break; await tap(cdp, fb[0], fb[1]); await p.waitForTimeout(1300);
      res.D.taps.push(await p.evaluate(() => ({ shot: SS.weapon.lastShot && SS.weapon.lastShot.hit ? { part: SS.weapon.lastShot.hit.part, enemy: SS.weapon.lastShot.hit.enemy, name: SS.weapon.lastShot.hit.name, d: +SS.weapon.lastShot.hit.point.distanceTo(SS.weapon.lastShot.origin).toFixed(1) } : 'none', ed: +window.__e.group.position.distanceTo(SS.camera.position).toFixed(1), ex: +window.__e.group.position.x.toFixed(2), cx: +SS.camera.position.x.toFixed(2), scope: SS.input.scope, fov: Math.round(SS.camera.fov), hp: window.__e.health, alive: window.__e.alive, last: SS.lastEnemyHit ? SS.lastEnemyHit.part : null, vx: +window.__e.debugVel.x.toFixed(1), moving: !!window.__e.moving }))); }
    await p.waitForTimeout(800); Object.assign(res.D, await p.evaluate(() => { window.__preFrame = null; clearInterval(window.__flip); window.__slowMs = 0; return { dead: !window.__e.alive, fired: SS.weapon.shotsFired - window.__f0, hits: SS.weapon.shotsHit }; }));
    if (!res.D.spot) fail.push('D: no clear spot'); else { const n = res.D.taps.length; if (!res.D.dead) fail.push('D: strafing fighter not killed by ' + n + ' scoped taps at 2 fps ' + JSON.stringify(res.D.taps));
      else { // m1x (App PM): torso kills in 2, head in 1, limb hits deal less (a limb hit may add a tap); every tap must register
        const parts = res.D.taps.map((t) => (t.shot && t.shot.enemy ? t.shot.part : 'miss')); res.D.parts = parts;
        if (parts.includes('miss')) fail.push('D: a scoped tap on the strafing fighter did not register ' + JSON.stringify(res.D.taps));
        if (parts.filter((q) => q === 'body').length > 2) fail.push('D: 3+ torso hits to kill (expected 2) ' + JSON.stringify(parts)); } if (res.D.fired !== n) fail.push('D: ' + res.D.fired + ' rounds for ' + n + ' taps'); }
    await p.context().close(); } catch (e) { fail.push('D exception ' + e.message); }
  // E
  if (want('E')) try { const { p } = await start(); res.E = {};
    Object.assign(res.E, await p.evaluate(() => { const c = SS.camera.position, y = SS.input.yaw; const e = SS.debug.spawnEnemy('shifter'); window.__e = e; e.health = 1e9; e.shootCd = 1e9;
      SS.enemies.debugPose(e, c.x + Math.cos(y) * 14 + Math.sin(y) * 3, c.z + Math.sin(y) * 14 - Math.cos(y) * 3, 'idle'); e.group.updateMatrixWorld(true); // to the right, outside the view
      window.__c0 = SS.cracks | 0; window.__t0 = SS.offViewTracers | 0; window.__slowMs = 450; return { ctx: !!(SS.audio && SS.audio.isLive) }; }));
    await p.waitForTimeout(1200); await p.evaluate(() => { SS.enemies.debugShoot(window.__e); window.__seen = 0; window.__frames = 0; const raf = window.requestAnimationFrame;
      const chk = () => { const st = SS.enemies.tracerState(); const cam = SS.camera; const on = st.some((t) => { if (!t.vis) return false; for (const k of [0, 3]) { const v = new cam.position.constructor(t.a[k], t.a[k + 1], t.a[k + 2]).project(cam); if (Math.abs(v.x) <= 1 && Math.abs(v.y) <= 1 && v.z < 1) return true; }
          // the streak crosses the view if its end point (in front of the player) is on screen
          return false; }); if (on) window.__seen++; if (++window.__frames < 4) raf(chk); }; raf(chk); });
    await p.waitForTimeout(3500); Object.assign(res.E, await p.evaluate(() => { window.__slowMs = 0; return { tracers: (SS.offViewTracers | 0) - window.__t0, cracks: (SS.cracks | 0) - window.__c0, framesWithTracer: window.__seen, offView: SS.offViewShots | 0 }; }));
    if (!res.E.tracers) fail.push('E: the off-view shot drew no tracer ' + JSON.stringify(res.E)); else if (!res.E.framesWithTracer) fail.push('E: the off-view tracer was never on screen in a rendered frame ' + JSON.stringify(res.E));
    if (!res.E.cracks) fail.push('E: no crack played for the off-view shot ' + JSON.stringify(res.E));
    await p.context().close(); } catch (e) { fail.push('E exception ' + e.message); }
  // F (item 7): a lone engaged fighter firing at the worst-case rate (every 150 ms, accuracy x8) at a player in the open needs
  //   well over 20 s to kill (incoming damage-per-second cap)
  if (want('F')) try { const { p } = await start(); res.F = {};
    await p.evaluate(() => { SS.player.health = 100; SS.health = 100; SS.testAccuracy = 8; window.__e = SS.debug.spawnEnemy('shifter'); const e = window.__e; e.pinned = true; e.shootCd = 1e9; e.health = 1e6; e.engaged = true; SS.enemies.debugClearSpacing(); window.__t0 = performance.now(); window.__hp = [];
      window.__iv = setInterval(() => { if (!SS.player.alive) return; const c = SS.camera.position, y = SS.input.yaw; e.group.position.set(c.x + Math.sin(y) * 13 + Math.cos(y) * 0.6, 0, c.z - Math.cos(y) * 13 + Math.sin(y) * 0.6); e.group.updateMatrixWorld(true); SS.enemies.debugShoot(e); }, 150);
      window.__iv2 = setInterval(() => { window.__hp.push([Math.round((performance.now() - window.__t0) / 1000), Math.round(SS.player.health)]); if (!SS.player.alive && !window.__deadT) window.__deadT = (performance.now() - window.__t0) / 1000; }, 1000); });
    await p.waitForFunction(() => !SS.player.alive || performance.now() - window.__t0 > 40000, null, { timeout: 60000, polling: 500 }).catch(() => {});
    Object.assign(res.F, await p.evaluate(() => { clearInterval(window.__iv); clearInterval(window.__iv2); return { deadT: window.__deadT || (SS.player.alive ? null : (performance.now() - window.__t0) / 1000), hp20: (window.__hp.find((h) => h[0] >= 20) || [0, null])[1], capBlocked: SS.dmgCapBlocked | 0, cap: SS.enemies.DMG_CAP_HPS, hp: window.__hp.map((h) => h[1]).join(',') }; }));
    if (res.F.hp20 == null || res.F.hp20 < 15) fail.push('F: lone fighter took the player to ' + res.F.hp20 + '% in 20 s ' + JSON.stringify(res.F)); if (res.F.deadT != null && res.F.deadT < 28) fail.push('F: lone fighter killed the player in ' + res.F.deadT.toFixed(1) + ' s');
    if (!res.F.capBlocked) fail.push('F: damage cap never engaged (test not exercised) ' + JSON.stringify(res.F));
    await p.context().close(); } catch (e) { fail.push('F exception ' + e.message); }
  if (res.pageErrors) fail.push('page errors: ' + res.pageErrors.join(' | '));
  console.log(JSON.stringify(res)); console.log(fail.length ? 'M1W FAIL ' + fail.join(' ; ').slice(0, 400) : 'M1W PASS'); srv.close(); await b.close(); process.exit(fail.length ? 1 : 0);
})().catch((e) => { console.log('M1W FAIL exception ' + e.message); process.exit(1); });
