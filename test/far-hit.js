// Tester m1s: a distant last fighter at the far end of the street took ~26 rounds on a red crosshair and never died
// (Ultra-low, ~6 fps). A pinned fighter is posed at 35/50/65 m on a clear line; at slowed frames the crosshair is held
// on its chest with FIRE: red must mean the shot ray really hits, and a hold must kill at every range.
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const D = path.resolve(__dirname, '../dist'); const PORT = 8810;
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.glb': 'model/gltf-binary' };
const srv = http.createServer((q, r) => { let f = path.join(D, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); }).listen(PORT);
(async () => { const b = await require('../tools/guard').launch(chromium, { executablePath: '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }, { timeoutMs: 600000 });
  const res = { runs: [] }, fail = []; const SLOW = +(process.env.SS_SLOW || 140);
  try { const p = await (await b.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true })).newPage();
    await p.addInitScript(() => { const raf = window.requestAnimationFrame.bind(window); window.requestAnimationFrame = (cb) => raf((t) => { const ms = window.__slowMs | 0; if (ms) { const t0 = performance.now(); while (performance.now() - t0 < ms) {} } cb(t); }); });
    await p.goto('http://127.0.0.1:' + PORT + '/?seed=7&calm=1' + (process.env.SS_QS || '')); await p.waitForFunction(() => window.SS && SS.art && SS.art.done, null, { timeout: 180000 });
    if (process.env.SS_ULTRA !== '0') await p.evaluate(() => SS.goUltra && SS.goUltra('test'));
    await p.click('#play'); await p.waitForTimeout(1500);
    await p.evaluate(() => { SS.player.health = 1e9; SS.walking = false; SS.weapon.reserve = 900; window.__e = SS.debug.spawnEnemy('shifter'); });
    await p.waitForTimeout(6000);
    await p.evaluate(() => { window.__aimF = () => { SS.walking = false; const e = window.__e, c = SS.camera.position, D = window.__D;
      for (const q of SS.enemies.list) if (q !== e && q.alive) { q.group.position.y = -50; q.pinned = true; q.shootCd = 1e9; }
      if (window.__spotD !== D) { window.__spotD = D; window.__spot = 0; const o = c.clone(), d = c.clone();
        for (const dx of [0, 0.6, -0.6, 1.2, -1.2, 2, -2, 3, -3]) { d.set(dx, 1.25 - c.y, -D).normalize(); const h = SS.weapon.firstHit(o, d);
          if (!h || h.distance > D - 0.5 || (h.object.userData && h.object.userData.enemy)) { window.__spot = dx; break; } } }
      if (window.__posedD !== D || window.__posedE !== e) { window.__posedD = D; window.__posedE = e; SS.enemies.debugPose(e, c.x + window.__spot, c.z - D, 'idle'); } // pose once per range: a fixed spot
      e.shootCd = 1e9; e.engaged = true; e.group.updateMatrixWorld(true);
      const bm = SS.weapon.targets.find((m) => m.userData.enemy === e && m.userData.part === 'body'); const v = e.group.position.clone(); v.y += 1.25; if (bm) bm.getWorldPosition(v);
      v.sub(c); SS.input.scope = !!window.__ads; SS.input.yaw = Math.atan2(v.x, -v.z); SS.input.pitch = -Math.atan2(v.y, Math.hypot(v.x, v.z)); return +v.length().toFixed(1); };
      clearInterval(window.__aimT); window.__aimT = setInterval(() => window.__aimF(), 100); });
    await p.evaluate((s) => { window.__slowMs = s; }, SLOW);
    const bb = await p.locator('[data-ctl=fire]').boundingBox(); const x = bb.x + bb.width / 2, y = bb.y + bb.height / 2;
    for (const [D, ads] of (process.env.FAR_ONLY ? [[50, 0]] : [[35, 0], [50, 0], [65, 0], [65, 1]])) {
      const d = await p.evaluate(([D, ads]) => { window.__D = D; window.__ads = ads; return window.__aimF(); }, [D, ads]); await p.waitForTimeout(1500); for (let k = 0; k < 10 && !(await p.evaluate(() => SS.weapon.onTarget)); k++) await p.waitForTimeout(300);
      const pre = await p.evaluate(() => { window.__e.health = 100; SS.weapon.ammo = 30; SS.weapon.reloading = false; window.__red = { on: 0, n: 0, miss: 0 }; window.__pp = { show: 0, kill: 0 }; if (!window.__ppOn) { window.__ppOn = 1; const m = document.getElementById('hit-marker'); const f = () => { if (m.classList.contains('show')) { window.__pp.show++; if (m.classList.contains('kill') || m.classList.contains('headkill')) window.__pp.kill++; } requestAnimationFrame(f); }; requestAnimationFrame(f); }
        const W = SS.weapon; W.onShotDebug = (s) => { const R = window.__red; R.n++;  if (W.onTarget && window.__e.alive && !window.__e.dying && !R.dead) { R.on++; if (!(s.hit && s.hit.enemy)) R.miss++; } if (!window.__e.alive || window.__e.dying) R.dead = 1;  }; return [W.shotsFired, W.shotsHit, W.onTarget]; });
      await p.mouse.move(x, y); await p.mouse.down(); await p.waitForTimeout(5000); await p.mouse.up(); await p.waitForTimeout(1500);
      const r = await p.evaluate((pre) => ({ shots: SS.weapon.shotsFired - pre[0], hits: SS.weapon.shotsHit - pre[1], alive: window.__e.alive, hp: window.__e.health, red0: pre[2], red: window.__red, fps: SS.benchFps || null, painted: window.__pp }), pre);
      if (r.hits && !r.painted.show) fail.push(D + ' m: hits but no hit marker painted at low fps'); if (!r.alive && !r.painted.kill) fail.push(D + ' m: kill but no kill marker painted');
      r.D = D; r.d = d; r.ads = ads; res.runs.push(r);
      if (!r.red0) fail.push(D + ' m' + (ads ? ' ADS' : '') + ': crosshair not red on a clear chest aim');
      if (r.alive) fail.push(D + ' m' + (ads ? ' ADS' : '') + ': 5 s hold did not kill ' + JSON.stringify(r));
      if (r.red.on && r.red.miss / r.red.on > 0.35) fail.push(D + ' m: red crosshair but ' + r.red.miss + '/' + r.red.on + ' shots missed');
      if (!r.alive) { await p.evaluate(() => { window.__slowMs = 0; }); await p.waitForTimeout(1500); await p.evaluate(() => { window.__e = SS.debug.spawnEnemy('shifter'); }); await p.waitForTimeout(800); await p.evaluate((s) => { window.__slowMs = s; }, SLOW); }
    }
    // lone last fighter far down the street (>35 m) must advance within ~8 s
    await p.evaluate(() => { window.__slowMs = 0; clearInterval(window.__aimT); const c = SS.camera.position; if (!window.__e.alive) window.__e = SS.debug.spawnEnemy('shifter'); const e = window.__e;
      for (const q of SS.enemies.list) if (q !== e && q.alive) { q.alive = false; q.group.visible = false; }
      SS.enemies.debugPose(e, c.x + (window.__spot || 0), c.z - 55, 'idle'); e.pinned = false; e.debugVel = null; e.engaged = true; e.health = 1e9; e.farT = 0; });
    await p.waitForTimeout(16000);
    res.advance = await p.evaluate(() => { const e = window.__e; return { alive: e.alive, advanced: e.advanced | 0, d: +e.group.position.distanceTo(SS.camera.position).toFixed(1), phase: e.phase }; });
    if (!res.advance.advanced && !(res.advance.d < 35)) fail.push('lone fighter at 55 m never came nearer ' + JSON.stringify(res.advance));
    // m1t: a last fighter hidden from the player (behind a facade) must not hit the player and must come into view within ~12 s
    await p.evaluate(() => { const c = SS.camera.position, e = window.__e; SS.enemies.debugPose(e, c.x + 11.5, c.z - 18, 'idle'); e.pinned = false; e.debugVel = null; e.engaged = true; e.health = 1e9; e.hiddenT = 0; e.shootCd = 0; e.staggerT = 0;
      window.__hp0 = SS.player.health; SS.player.health = 100; window.__sf0 = SS.seenForced | 0; window.__bb0 = SS.blindHitsBlocked | 0; });
    const hid = { t: null };
    for (let i = 0; i < 40; i++) { await p.waitForTimeout(500); const st = await p.evaluate(() => ({ sf: (SS.seenForced | 0) - window.__sf0, hp: SS.player.health, ht: +(window.__e.hiddenT || 0).toFixed(1), sees: SS.enemies.playerSees(window.__e), p: window.__e.group.position.toArray().map((v) => +v.toFixed(1)), cam: SS.camera.position.toArray().map((v) => +v.toFixed(1)), ph: window.__e.phase, n: SS.enemies.list.filter((q) => q.alive).length })); if (hid.prevHp != null && st.hp < hid.prevHp && !st.sees && !hid.prevSees) hid.unseenHit = (hid.unseenHit | 0) + 1; hid.prevHp = st.hp; hid.prevSees = st.sees; if (hid.t == null && (st.sf > 0 || st.sees)) { hid.t = (i + 1) * 0.5; hid.at = st; } hid.last = st; if (hid.t != null && i >= 30) break; }
    hid.blocked = await p.evaluate(() => (SS.blindHitsBlocked | 0) - window.__bb0);
    res.hidden = hid; if (hid.t == null) fail.push('hidden last fighter never brought into view ' + JSON.stringify(hid));
    if (hid.t != null && hid.t > 12.5) fail.push('hidden last fighter took ' + hid.t + ' s to come into view'); if (hid.unseenHit) fail.push('hidden fighter hit the player from out of sight ' + JSON.stringify(hid));
    await p.screenshot({ path: path.resolve(__dirname, '../screenshots/far-hit.png') });
  } catch (e) { fail.push('exception ' + e.message); }
  res.fail = fail; console.log(JSON.stringify(res)); console.log(fail.length ? 'FARHIT FAIL' : 'FARHIT PASS'); await b.close(); srv.close(); process.exit(fail.length ? 1 : 0); })();
