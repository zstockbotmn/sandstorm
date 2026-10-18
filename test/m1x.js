// m1x hotfix checks (tester at 1-8 fps, mouse):
//  A a click on a medkit ~1 s after it was drawn (it is already flying in / just collected) collects or is swallowed and
//    fires NOTHING; a click away from it still fires one round   B a stale mouse pointer (missed pointerup) + a plain hover
//    never turns the view   C a scoped press -> short pause -> drag at 5 fps never fires   D a still hold at 5 fps still auto-fires
//  E pacing: a run opens with a quiet walk; approaching gunfire, a TEXT radio warning before the first enemy shot, first
//    contact after FIRST_CONTACT_S
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const D = path.resolve(__dirname, '../dist'); const PORT = 8832;
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.glb': 'model/gltf-binary' };
const srv = http.createServer((q, r) => { let f = path.join(D, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); }).listen(PORT);
const QS = process.env.SS_QS || '', ONLY = process.env.SS_M1X ? process.env.SS_M1X.split(',') : null; const want = (k) => !ONLY || ONLY.includes(k);
(async () => { const b = await require('../tools/guard').launch(chromium, { executablePath: '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'] }, { timeoutMs: 1200000 });
  const res = {}, fail = [];
  const slowRaf = () => { const raf = window.requestAnimationFrame.bind(window); window.requestAnimationFrame = (cb) => raf((t) => { const ms = window.__slowMs | 0; if (ms && !window.__inSlow) { window.__inSlow = true; const t0 = performance.now(); while (performance.now() - t0 < ms) {} setTimeout(() => { window.__inSlow = false; }, 0); } if (window.__preFrame && t !== window.__pfT) { window.__pfT = t; try { window.__preFrame(); } catch (_) {} } cb(t); }); };
  async function start(calm, qs) { const ctx = await b.newContext({ viewport: { width: 844, height: 390 } }); const p = await ctx.newPage(); await p.addInitScript(slowRaf); p.on('pageerror', (e) => (res.pageErrors = res.pageErrors || []).push(String(e).slice(0, 160)));
    await p.goto('http://127.0.0.1:' + PORT + '/?seed=7' + (calm ? '&calm=1' : '') + (qs || '') + QS); await p.waitForFunction(() => window.SS && SS.art && SS.art.done, null, { timeout: 180000 });
    await p.click('#play'); await p.waitForFunction(() => SS.running && !document.body.classList.contains('starting'), null, { timeout: 120000 });
    if (calm) await p.evaluate(() => { SS.walking = false; SS.player.health = 1e6; }); await p.waitForTimeout(1500); return { p, ctx }; }
  const shots = (p) => p.evaluate(() => SS.weapon.shotsFired);
  if (want('A') || want('B') || want('C') || want('D') || want('F') || want('G') || want('H')) { const { p, ctx } = await start(true);
    await p.evaluate(() => { window.__freezeCam = true; SS.weapon.ammo = 30; SS.weapon.reserve = 200; });
    // A: drop a kit 7 m ahead, take its screen spot as drawn, click there ~1 s later (fly-in started at 0.6 s)
    if (want('A')) { res.A = [];
      for (const [slow, lateMs] of [[200, 900], [200, 1700], [1000, 1500], [1000, 3200]]) { const pos = await p.evaluate((slow) => { const c = SS.camera, y = SS.input.yaw; const v = c.position.clone(); v.x += Math.sin(y) * 7; v.z -= Math.cos(y) * 7; v.y = 0;
          window.__slowMs = slow; SS.stakes.drop('health', v); SS.player.health = 50; window.__f0 = SS.weapon.shotsFired; window.__a0 = SS.weapon.ammo; window.__k0 = SS.pickupsTaken | 0;
          const it = SS.stakes.items[SS.stakes.items.length - 1]; const w = it.g.position.clone(); w.y = 0.45; w.applyMatrix4(SS.lastVP); /* the drop is clamped to the street */ return [(w.x + 1) / 2 * innerWidth, (1 - w.y) / 2 * innerHeight]; }, slow);
        await p.waitForTimeout(lateMs); const state = await p.evaluate((pos) => ({ items: SS.stakes.items.length, fly: SS.stakes.items.length ? +(SS.stakes.items[0].fly || 0).toFixed(2) : null, dry: SS.stakes.pickAt(pos[0], pos[1], true) }), pos);
        await p.mouse.click(pos[0], pos[1]); await p.waitForTimeout(1800);
        const r = await p.evaluate(() => ({ fired: SS.weapon.shotsFired - window.__f0, ammo: [window.__a0, SS.weapon.ammo], taken: (SS.pickupsTaken | 0) - window.__k0, tapped: SS.pickupsTapped | 0, late: SS.pickupsLateTaps | 0 }));
        Object.assign(r, { fps: Math.round(1000 / slow), lateMs, pos: pos.map(Math.round), atClick: state }); res.A.push(r);
        if (r.fired !== 0) fail.push('A: a click on the medkit (' + Math.round(1000 / slow) + ' fps) ' + lateMs + ' ms after it was drawn FIRED ' + r.fired + ' ' + JSON.stringify(r));
        if (r.taken < 1) fail.push('A: the medkit was not collected ' + JSON.stringify(r));
        await p.evaluate(() => { window.__slowMs = 0; SS.stakes.reset(); }); await p.waitForTimeout(400); }
      // m1z (tester, 0.6 fps: health refilled AND the mag dropped 18->17): taps on the kit's spot in a LATER frame of its
      // fly-in (the kit moves toward the player), 1-2 s after that frame was drawn - often after the auto-collect already took
      // it, while the tap is still queued in the event loop. Ammo and shotsFired must not change at 1 fps and 0.6 fps.
      res.A2 = [];
      for (const [slow, frameIx, lagMs, kind] of [[1000, 3, 1200, 'health'], [1000, 4, 2000, 'health'], [1600, 3, 1500, 'health'], [1600, 4, 1500, 'health'], [1600, 4, 2000, 'health'], [1600, 2, 1000, 'health'], [1000, 3, 1500, 'ammo'], [1600, 3, 1500, 'ammo'], [1600, 4, 2000, 'ammo']]) {
        await p.evaluate(([slow, kind]) => { const c = SS.camera, y = SS.input.yaw; const v = c.position.clone(); v.x += Math.sin(y) * 6; v.z -= Math.cos(y) * 6; v.y = 0; window.__slowMs = slow;
          SS.stakes.drop(kind, v); SS.player.health = 50; SS.weapon.reserve = 60; window.__r0 = SS.weapon.reserve; window.__f0 = SS.weapon.shotsFired; window.__a0 = SS.weapon.ammo; window.__k0 = SS.pickupsTaken | 0; window.__fr = [];
          const it = SS.stakes.items[SS.stakes.items.length - 1]; window.__kitFr = () => { if (!SS.stakes.items.includes(it)) { window.__fr.push(null); return; } const w = it.g.position.clone(); w.y += 0.45 * it.g.scale.x; w.applyMatrix4(SS.lastVP); window.__fr.push([(w.x + 1) / 2 * innerWidth, (1 - w.y) / 2 * innerHeight, w.z]); };
          const prev = window.__preFrame; window.__preFrame = () => { if (prev) prev(); if (window.__kitFr) window.__kitFr(); }; window.__prevPF = prev; }, [slow, kind]);
        await p.waitForFunction((k) => window.__fr.length > k, frameIx, { timeout: 60000, polling: 200 }); const pos = await p.evaluate((k) => window.__fr[k], frameIx); await p.waitForTimeout(lagMs);
        const atClick = await p.evaluate(() => SS.stakes.items.length); let clicked = false;
        if (pos && pos[2] > -1 && pos[2] < 1 && pos[0] >= 0 && pos[0] < 844 && pos[1] >= 0 && pos[1] < 390) { await p.mouse.click(pos[0], pos[1]); clicked = true; }
        await p.waitForTimeout(Math.max(4000, slow * 4));
        const r = await p.evaluate(() => ({ fired: SS.weapon.shotsFired - window.__f0, ammo: [window.__a0, SS.weapon.ammo], taken: (SS.pickupsTaken | 0) - window.__k0, reserve: [window.__r0, SS.weapon.reserve], gapMs: Math.round(SS.input.gapMs) }));
        Object.assign(r, { kind, fps: +(1000 / slow).toFixed(1), frameIx, lagMs, pos: pos && pos.slice(0, 2).map(Math.round), clicked, kitLeftAtClick: atClick }); res.A2.push(r);
        if (clicked && (r.fired !== 0 || r.ammo[0] !== r.ammo[1])) fail.push('A2: a tap on the flying ' + kind + ' drop (' + r.fps + ' fps, frame ' + frameIx + ', ' + lagMs + ' ms late) cost ammo ' + JSON.stringify(r));
        if (r.taken < 1) fail.push('A2: the medkit was not collected ' + JSON.stringify(r));
        if (kind === 'ammo' && !(r.reserve[1] > r.reserve[0])) fail.push('A2: the ammo drop did not add reserve ' + JSON.stringify(r));
        await p.evaluate(() => { window.__preFrame = window.__prevPF; window.__kitFr = null; window.__slowMs = 0; SS.stakes.reset(); }); await p.waitForTimeout(600); }
      if (!res.A2.some((r) => r.clicked && r.kitLeftAtClick === 0)) fail.push('A2: no case tapped after the auto-collect took the kit (tap pending while collected) ' + JSON.stringify(res.A2.map((r) => [r.clicked, r.kitLeftAtClick])));
      // W (m2a): FIRE taps still queued when the last enemy of a wave dies never fire into the walk (0.6 fps, taps queued
      // in the same event-loop window as the kill)
      { await p.evaluate(() => { window.__slowMs = 1600; }); await p.waitForTimeout(2500);
        const e0 = await p.evaluate(() => { const c = SS.camera.position; const e = SS.debug.spawnEnemy('shifter'); SS.enemies.debugPose(e, c.x + 3, c.z - 20, 'idle'); e.shootCd = 1e9; e.noFireUntilR = 1e15; window.__we = e; return !!e; });
        await p.waitForTimeout(3500); for (let i = 0; i < 3; i++) await p.mouse.click(200 + i * 3, 120);
        const atKill = await p.evaluate(() => { const e = window.__we; e.health = 1; e.takeHit('body', e.group.position.clone()); return { fired: SS.weapon.shotsFired, alive: (SS.enemies.list || []).filter((x) => x.alive).length, cuts: SS.input.fireCuts | 0 }; });
        await p.waitForTimeout(8000); const after = await p.evaluate(() => ({ fired: SS.weapon.shotsFired, cuts: SS.input.fireCuts | 0, pending: SS.input.pendingShots | 0 }));
        await p.evaluate(() => { window.__slowMs = 0; });
        res.W = { spawned: e0, atKill, after, firedAfterKill: after.fired - atKill.fired };
        if (atKill.alive !== 0) fail.push('W: other enemies alive, wave not cleared ' + JSON.stringify(res.W));
        else if (res.W.firedAfterKill !== 0) fail.push('W: ' + res.W.firedAfterKill + ' queued FIRE tap(s) fired after the wave cleared ' + JSON.stringify(res.W)); }
      // and ammo is untouched in the A cases too
      for (const r of res.A) if (r.ammo[0] !== r.ammo[1]) fail.push('A: medkit tap changed ammo ' + JSON.stringify(r));
      // control: a click well away from any drop still fires one round
      const f0 = await shots(p); await p.mouse.click(200, 120); await p.waitForTimeout(1500); res.A_ctrl = (await shots(p)) - f0;
      if (res.A_ctrl !== 1) fail.push('A: a plain canvas click fired ' + res.A_ctrl + ' rounds (want 1)'); }
    // B: a stale mouse pointer (its pointerup was missed) must not steer the view on a hover
    if (want('B')) { await p.mouse.move(400, 200); await p.evaluate(() => { const c = document.querySelector('canvas'); c.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 1, pointerType: 'mouse', button: 0, buttons: 1, clientX: 400, clientY: 200, bubbles: true })); window.__y0 = SS.input.yaw; });
      await p.waitForTimeout(150); for (let i = 1; i <= 10; i++) { await p.mouse.move(400 + i * 40, 200); await p.waitForTimeout(30); } await p.waitForTimeout(600);
      res.B = await p.evaluate(() => ({ dyawDeg: +((SS.input.yaw - window.__y0) * 180 / Math.PI).toFixed(1), hoverDrops: SS.input.hoverDrops | 0 }));
      if (Math.abs(res.B.dyawDeg) > 2) fail.push('B: a buttonless hover turned the view ' + res.B.dyawDeg + ' deg ' + JSON.stringify(res.B));
      // and a real slow drag still turns it (~1:1)
      await p.evaluate(() => { window.__y0 = SS.input.yaw; window.__f0 = SS.weapon.shotsFired; }); await p.mouse.move(300, 200); await p.mouse.down(); for (let i = 1; i <= 10; i++) { await p.mouse.move(300 + i * 10, 200); await p.waitForTimeout(30); } await p.mouse.up(); await p.waitForTimeout(600);
      res.B_drag = await p.evaluate(() => ({ dyawDeg: +((SS.input.yaw - window.__y0) * 180 / Math.PI).toFixed(1), fired: SS.weapon.shotsFired - window.__f0, want: +(100 * 70 / innerHeight).toFixed(1) }));
      if (Math.abs(Math.abs(res.B_drag.dyawDeg) - res.B_drag.want) > res.B_drag.want * 0.3) fail.push('B: a 100 px drag turned ' + res.B_drag.dyawDeg + ' deg (want ~' + res.B_drag.want + ')'); }
    // C: scoped, 5 fps: press, pause 150 ms, drag 80 px over ~0.6 s, release -> no round
    if (want('C')) { res.C = [];
      for (const pause of [60, 150, 300]) { await p.evaluate(() => { SS.input.scope = true; window.__slowMs = 200; }); await p.waitForTimeout(800); const f0 = await shots(p);
        await p.mouse.move(420, 200); await p.mouse.down(); await p.waitForTimeout(pause); for (let i = 1; i <= 8; i++) { await p.mouse.move(420 + i * 10, 200 + i * 2); await p.waitForTimeout(70); } await p.mouse.up(); await p.waitForTimeout(1200);
        const fired = (await shots(p)) - f0; res.C.push({ pause, fired }); if (fired) fail.push('C: a scoped drag (pause ' + pause + ' ms) at 5 fps fired ' + fired); }
      await p.evaluate(() => { window.__slowMs = 0; SS.input.scope = false; }); }
    // D: a still hold at 5 fps still auto-fires (feel)
    if (want('D')) { await p.evaluate(() => { window.__slowMs = 200; SS.weapon.ammo = 30; }); await p.waitForTimeout(600); const f0 = await shots(p); await p.mouse.move(420, 200); await p.mouse.down(); await p.waitForTimeout(1600); await p.mouse.up(); await p.waitForTimeout(800);
      res.D = { fired: (await shots(p)) - f0 }; await p.evaluate(() => { window.__slowMs = 0; }); if (res.D.fired < 3) fail.push('D: a 1.6 s still hold at 5 fps fired only ' + res.D.fired); }
    // H (m1y: a full-screen HUD SVG swallowed canvas clicks): with the damage arc, edge warning, low-HP glow, radio and
    // banners all showing, every point of the play area hit-tests to the canvas or a real control
    if (want('H')) { res.H = await p.evaluate(() => { SS.player.health = 1e6; const hud = SS.hud; try { hud.damageDirection(0.7); hud.damageVignette(1); hud.callout && hud.callout('test line'); hud.radio && hud.radio('Contact reported ahead. Stay sharp.'); hud.banner && hud.banner('CONTACT'); hud.hitMarker && hud.hitMarker('hit'); } catch (_) {}
        document.getElementById('edge-warn') && document.getElementById('edge-warn').classList.add('show'); document.getElementById('lowhp') && document.getElementById('lowhp').classList.add('on');
        const bad = {}; let n = 0; for (let x = 10; x < innerWidth; x += 24) for (let y = 10; y < innerHeight; y += 24) { const el = document.elementFromPoint(x, y); if (!el || el.tagName === 'CANVAS' || el.closest('[data-ctl]')) continue; const k = (el.id || el.tagName) + '.' + (el.getAttribute('class') || ''); bad[k] = (bad[k] | 0) + 1; n++; }
        document.getElementById('edge-warn') && document.getElementById('edge-warn').classList.remove('show'); return { n, bad }; });
      if (res.H.n) fail.push('H: ' + res.H.n + ' play-area points hit a HUD element instead of the canvas ' + JSON.stringify(res.H.bad)); }
    // G (m1y, tester at ~1 fps: a fast 300 px drag turned ~20 px): a fast drag (one 300 px jump / three 100 px moves) at 1 fps turns ~1:1
    if (want('G')) { res.G = []; const cdp = await ctx.newCDPSession(p);
      for (const steps of [1, 3]) { await p.evaluate(() => { SS.input.scope = false; window.__slowMs = 1000; }); await p.waitForTimeout(2200); const y0 = await p.evaluate(() => SS.input.yaw);
        const x = 250, y = 200; await cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
        for (let i = 1; i <= steps; i++) await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: x + Math.round(300 * i / steps), y, button: 'left', buttons: 1 });
        await cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: x + 300, y, button: 'left', clickCount: 1 }); await p.waitForTimeout(5000);
        const r = await p.evaluate((y0) => ({ dyawPx: +(Math.abs(SS.input.yaw - y0) / ((70 * Math.PI / 180) / Math.max(200, innerHeight))).toFixed(0) }), y0); r.steps = steps; res.G.push(r);
        if (r.dyawPx < 300 * 0.7 || r.dyawPx > 300 * 1.3) fail.push('G: a fast 300 px drag (' + steps + ' move' + (steps > 1 ? 's' : '') + ') at 1 fps turned ' + r.dyawPx + ' px'); }
      await p.evaluate(() => { window.__slowMs = 0; }); }
    // F (m1y): a click held back by a reload at ~1 fps expires by event time instead of firing seconds later (mid-drag)
    if (want('F')) { await p.evaluate(() => { SS.input.scope = false; window.__slowMs = 1000; SS.weapon.ammo = 10; SS.weapon.reserve = 200; SS.input.reloadPressed = true; });
      const f0 = await shots(p); await p.mouse.click(260, 140); const rl = await p.evaluate(() => !!SS.weapon.reloading || SS.weapon.ammo === 30); // reload is 2 s real time (~2 frames here)
      await p.waitForFunction(() => !SS.weapon.reloading, null, { timeout: 40000, polling: 300 }).catch(() => {}); await p.waitForTimeout(2500);
      res.F = await p.evaluate((f0) => ({ fired: SS.weapon.shotsFired - f0, expired: SS.input.tapsExpired | 0, ammo: SS.weapon.ammo }), f0); res.F.reloadingAtClick = rl;
      { const g0 = await shots(p); await p.mouse.click(260, 140); await p.waitForTimeout(4000); res.F.plainClick1fps = (await shots(p)) - g0; if (res.F.plainClick1fps !== 1) fail.push('F: a plain click at 1 fps fired ' + res.F.plainClick1fps + ' (want 1)'); }
      await p.evaluate(() => { window.__slowMs = 0; });
      if (rl && res.F.fired) fail.push('F: a click made during a reload at 1 fps fired ' + res.F.fired + ' round(s) after the reload ' + JSON.stringify(res.F)); if (!rl && !res.F.expired) fail.push('F: not exercised (no reload seen, no click expired) ' + JSON.stringify(res.F)); }
    await ctx.close(); }
  // E: pacing, real spawns (no calm)
  // R (m1z, tester at 0.6 fps never saw the radio line in 45+ s): default path (no calm) at 0.6 fps with ?contact=14. The
  // '[RADIO] Contact reported ahead' line must appear before first contact, on the wall clock (not frame count), and stay
  // fully visible for >= 5 rendered frames AND >= 6 s real time; nothing may clear it early.
  if (want('R')) { const { p, ctx } = await start(false, '&contact=14');
    await p.evaluate(() => { SS.player.health = 1e6; window.__slowMs = 1600; const t0 = performance.now(); const R = window.__R = { t0, shownT: 0, visFrames: 0, visFirst: 0, visLast: 0, contactT: 0, frames: 0, text: '' };
      window.__preFrame = () => { R.frames++; const now = performance.now() - t0; const el = document.querySelector('.radio-warn');
        if (el) { const op = +getComputedStyle(el).opacity; if (!R.shownT) { R.shownT = now; R.text = el.textContent; } if (op > 0.9) { R.visFrames++; if (!R.visFirst) R.visFirst = now; R.visLast = now; } }
        if (!R.contactT && (SS.enemies.list || []).some((e) => e.alive)) R.contactT = now; }; });
    const t0 = Date.now(); while (Date.now() - t0 < 150000) { const R = await p.evaluate(() => window.__R); if (R.contactT && R.visLast && R.contactT - R.visLast > 3000) break; if (R.contactT && Date.now() - t0 > 100000) break; await p.waitForTimeout(2000); }
    res.R = await p.evaluate(() => { window.__preFrame = null; window.__slowMs = 0; const R = window.__R; return { ...R, visMs: Math.round(R.visLast - R.visFirst), shownT: Math.round(R.shownT), contactT: Math.round(R.contactT), quietRunT: +(SS.quietRunT || 0).toFixed(1), gone: SS.hud.radioGoneAt ? Math.round(SS.hud.radioGoneAt - SS.hud.radioShownAt) : null }; });
    const R = res.R; if (!R.shownT) fail.push('R: radio warning never shown at 0.6 fps ' + JSON.stringify(R));
    else { if (!/Contact reported ahead/.test(R.text)) fail.push('R: wrong radio text ' + R.text); if (R.contactT && R.shownT > R.contactT) fail.push('R: radio warning after first contact ' + JSON.stringify(R));
      if (R.visFrames < 5) fail.push('R: radio warning visible on only ' + R.visFrames + ' frames at 0.6 fps (want >= 5)'); if (R.gone != null && R.gone < 6000) fail.push('R: radio warning removed after ' + R.gone + ' ms (want >= 6 s)');
      if (R.shownT > (14 - 5) * 1000 * 1.6) fail.push('R: radio warning at ' + R.shownT + ' ms wall (contact=14: want ~9 s; frame-count based?)'); }
    await ctx.close(); }
  // I (first-run hint): 'DRAG TO AIM · TAP FIRE' shows on the first run only, never takes a tap, holds >= 4 s and >= 3
  // frames, fades after a real drag / a shot / 12 s; at 0.6 fps it is still on screen for >= 3 frames.
  if (want('I')) { const { p, ctx } = await start(true, '&hint=1'); const vis = () => p.evaluate(() => { const el = document.getElementById('first-hint'); return el ? +getComputedStyle(el).opacity : -1; });
    res.I = { atStart: await vis() }; if (!(res.I.atStart > 0.9)) fail.push('I: first-run hint not shown at start (opacity ' + res.I.atStart + ')');
    const box = await p.evaluate(() => { const r = document.getElementById('first-hint').getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
    res.I.under = await p.evaluate(([x, y]) => { const el = document.elementFromPoint(x, y); return el ? el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') : null; }, box);
    if (res.I.under !== 'canvas') fail.push('I: the hint takes taps (elementFromPoint ' + res.I.under + ')');
    // an early 200 px drag: the hint stays until its 4 s minimum, then fades with reason 'drag'
    await p.mouse.move(300, 200); await p.mouse.down(); for (let i = 1; i <= 8; i++) { await p.mouse.move(300 + i * 25, 200); await p.waitForTimeout(30); } await p.mouse.up();
    await p.waitForTimeout(500); res.I.afterDrag = await vis(); await p.waitForTimeout(5000); res.I.later = await vis(); res.I.fh = await p.evaluate(() => ({ ...SS.hud.firstHint, ms: Math.round(SS.hud.firstHint.goneAt - SS.hud.firstHint.shownAt), seen: localStorage.getItem('ss.firstHint') }));
    if (!(res.I.afterDrag > 0.9)) fail.push('I: hint faded before its 4 s minimum ' + JSON.stringify(res.I));
    if (res.I.later > 0.1 || res.I.fh.reason !== 'drag') fail.push('I: hint did not fade after the drag ' + JSON.stringify(res.I));
    if (res.I.fh.seen !== '1') fail.push('I: hint not stored as seen');
    // second run in the same profile: not shown again (hint=keep keeps storage)
    const p2 = await ctx.newPage(); await p2.goto('http://127.0.0.1:' + PORT + '/?seed=7&calm=1&hint=keep' + QS); await p2.waitForFunction(() => window.SS && SS.art && SS.art.done, null, { timeout: 180000 });
    await p2.click('#play'); await p2.waitForFunction(() => SS.running, null, { timeout: 120000 }); await p2.waitForTimeout(1500);
    res.I.second = await p2.evaluate(() => ({ op: +getComputedStyle(document.getElementById('first-hint')).opacity, state: SS.hud.firstHint.state }));
    if (res.I.second.op > 0.1 || res.I.second.state === 'shown') fail.push('I: hint shown again on the second run ' + JSON.stringify(res.I.second));
    await ctx.close();
    // 0.6 fps, no input: on screen for >= 3 rendered frames, gone by ~12 s (timeout); a tap on it fires (passes through)
    { const { p, ctx } = await start(true, '&hint=1'); await p.evaluate(() => { window.__slowMs = 1600; window.__hf = { vis: 0 }; window.__preFrame = () => { const el = document.getElementById('first-hint'); if (el && +getComputedStyle(el).opacity > 0.9) window.__hf.vis++; }; });
      const r0 = await p.evaluate(() => SS.weapon.shotsFired); await p.waitForTimeout(16000);
      res.I.slow = await p.evaluate(() => ({ vis: window.__hf.vis, reason: SS.hud.firstHint.reason, ms: Math.round(SS.hud.firstHint.goneAt - SS.hud.firstHint.shownAt), fired: SS.weapon.shotsFired }));
      res.I.slow.fired -= r0; await p.evaluate(() => { window.__slowMs = 0; window.__preFrame = null; });
      if (res.I.slow.vis < 3) fail.push('I: at 0.6 fps the hint was visible on only ' + res.I.slow.vis + ' frames');
      if (res.I.slow.reason !== 'timeout' || res.I.slow.ms < 12000 || res.I.slow.ms > 15000) fail.push('I: 0.6 fps hint did not time out at ~12 s ' + JSON.stringify(res.I.slow));
      await ctx.close(); }
    // a tap on the hint's spot at normal fps fires one round and dismisses it (after the minimum)
    { const { p, ctx } = await start(true, '&hint=1'); const f0 = await shots(p); await p.mouse.click(box[0], box[1]); await p.waitForTimeout(1500); res.I.tapFired = (await shots(p)) - f0;
      if (res.I.tapFired !== 1) fail.push('I: a tap on the hint fired ' + res.I.tapFired + ' (want 1: taps pass through)');
      await p.waitForTimeout(4000); res.I.tapReason = await p.evaluate(() => SS.hud.firstHint.reason); if (res.I.tapReason !== 'fire') fail.push('I: hint did not fade after a shot (' + res.I.tapReason + ')'); await ctx.close(); } }
  if (want('E')) { const { p, ctx } = await start(false);
    await p.evaluate(() => { SS.player.health = 1e6; window.__E = { warnT: 0, firstShotT: 0, firstEnemyT: 0, maxApproach: 0 }; const t0 = SS.startedAt || performance.now(); window.__Et0 = t0;
      setInterval(() => { const E = window.__E, now = performance.now() - t0; if (!E.warnT && SS.radioWarnAt) E.warnT = SS.radioWarnAt - t0; if (!E.firstShotT && (SS.enemyShots | 0) > 0) E.firstShotT = now;
        if (!E.firstEnemyT && (SS.enemies.list || []).some((e) => e.alive)) { E.firstEnemyT = now; E.d = +SS.distance.toFixed(1); } E.maxApproach = Math.max(E.maxApproach, SS.approach || 0); E.line = E.line || ([...document.querySelectorAll('.radio-warn')].map((x) => x.textContent)[0] || ''); }, 100); });
    const t0 = Date.now(); while (Date.now() - t0 < 90000) { const E = await p.evaluate(() => window.__E); if (E.firstShotT) break; await p.waitForTimeout(1000); }
    res.E = await p.evaluate(() => Object.assign({}, window.__E, { FIRST_CONTACT_S: SS.enemies.FIRST_CONTACT_S, quietRunT: +(SS.quietRunT || 0).toFixed(1), approachShots: SS.approachShots | 0, firstWave: SS.firstWave }));
    const E = res.E, C = E.FIRST_CONTACT_S * 1000;
    if (!E.firstEnemyT || E.firstEnemyT < C - 1500) fail.push('E: first contact at ' + Math.round(E.firstEnemyT / 100) / 10 + ' s (want >= ' + E.FIRST_CONTACT_S + ' s)');
    if (!E.warnT || !E.firstShotT || E.firstShotT - E.warnT < 3000) fail.push('E: radio warning not >= 3 s before the first enemy shot ' + JSON.stringify(E));
    if (!/Contact reported ahead/.test(E.line)) fail.push('E: no text radio warning ' + JSON.stringify(E.line));
    if (E.maxApproach < 0.8) fail.push('E: approach gunfire did not build up ' + E.maxApproach);
    await ctx.close(); }
  if (res.pageErrors) fail.push('page errors: ' + res.pageErrors.join(' | '));
  console.log(JSON.stringify(res)); console.log(fail.length ? 'M1X FAIL ' + fail.join(' ; ').slice(0, 900) : 'M1X PASS'); srv.close(); await b.close(); process.exit(fail.length ? 1 : 0);
})().catch((e) => { console.log('M1X FAIL exception ' + e.message); process.exit(1); });
