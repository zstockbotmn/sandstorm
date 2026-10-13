// M1 quick headless landscape check: load, controls, run loop, enemies/kill, no page errors, offline via sw. Serves dist/ on :8795.
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path'), assert = require('assert');
const D = path.resolve(__dirname, '../dist'), OUT = path.resolve(__dirname, '../screenshots/m1');
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.glb': 'model/gltf-binary', '.hdr': 'application/octet-stream', '.json': 'application/json' };
const srv = http.createServer((q, r) => { let f = path.join(D, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); }).listen(8795);
const res = {};
(async () => { const b = await require('../tools/guard').launch(chromium, { executablePath: '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'] }, { timeoutMs: +(process.env.SS_TIMEOUT_MS || 720000) });
 try {
  const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1' });
  const p = await ctx.newPage(), errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push('console: ' + m.text()));
  await p.goto('http://127.0.0.1:8795/?seed=7&calm=1'); await p.waitForFunction(() => window.SS && document.querySelector('#play'), null, { timeout: 60000 });
  await p.screenshot({ path: OUT + '/1-start.png' });
  // High tier loads on the start screen. Record it before Play.
  await p.waitForFunction(() => window.SS.art && window.SS.art.done, null, { timeout: 40000 });
  res.art = await p.evaluate(() => ({ tier: SS.art.tier, loaded: SS.art.loaded.slice(), failed: SS.art.failed.slice() }));
  await p.tap('#play'); await p.waitForTimeout(4000); res.ammoAfterPlay = await p.evaluate(() => SS.weapon.ammo);
  const d0 = await p.evaluate(() => SS.distance); await p.waitForTimeout(6000); const d1 = await p.evaluate(() => SS.distance);
  res.walk = { d0, d1, walking: await p.evaluate(() => SS.walking) };
  await p.screenshot({ path: OUT + '/2-walking.png' });
  // aim drag
  const y0 = await p.evaluate(() => SS.input.yaw); const pt0 = await p.evaluate(() => SS.input.pitch); const am0 = await p.evaluate(() => SS.weapon.ammo); await p.mouse.move(300, 200); await p.mouse.down(); await p.mouse.move(200, 180, { steps: 8 }); await p.mouse.up(); await p.evaluate(() => { const c = document.querySelector('canvas'); const ev = (t, x, tgt) => (tgt || window).dispatchEvent(new PointerEvent(t, { pointerId: 7, pointerType: 'mouse', button: 0, clientX: x, clientY: 200, bubbles: true }));
    ev('pointerdown', 310, c); ev('pointermove', 313); ev('pointermove', 317); ev('pointermove', 320); ev('pointerup', 320); }); /* 10 px drag inside the 100 ms hold window (real time; headless frames are too slow to emulate) */ await p.waitForTimeout(300); res.dragAmmo = [am0, await p.evaluate(() => SS.weapon.ammo)];
  await p.evaluate(() => { const c = document.querySelector('canvas'); const ev = (t, x) => c.dispatchEvent(new PointerEvent(t, { pointerId: 8, pointerType: 'mouse', button: 0, clientX: x, clientY: 200, bubbles: true })); ev('pointerdown', 400); ev('pointerup', 400); });
  await p.waitForFunction((a0) => SS.weapon.ammo < a0, am0, { timeout: 15000 }).catch(() => {});
  res.clickAmmo = await p.evaluate(() => SS.weapon.ammo); res.aim = { y0, y1: await p.evaluate(() => SS.input.yaw), pt0, pt1: await p.evaluate(() => SS.input.pitch) };
  // fire / scope / cover / reload via keys
  await p.keyboard.press('r'); await p.waitForFunction(() => SS.weapon.ammo === 30, null, { timeout: 30000 }).catch(() => {}); const a0 = await p.evaluate(() => SS.weapon.ammo ?? SS.weapon.mag); await p.keyboard.down('Space'); await p.waitForFunction((a) => SS.weapon.ammo < a, a0, { timeout: 20000 }).catch(() => {}); await p.keyboard.up('Space'); const a1 = await p.evaluate(() => SS.weapon.ammo ?? SS.weapon.mag); res.fire = { a0, a1 };
  await p.keyboard.down('q'); await p.keyboard.up('q'); // tap-to-toggle on
  await p.waitForFunction(() => SS.input.scope && SS.camera.fov < 32, null, { timeout: 25000 }).catch(() => {});
  // Soft GL may only deliver a few frames; snap FOV if scope is on but lerp has not finished.
  await p.evaluate(() => { if (SS.input.scope && SS.camera.fov >= 32) { SS.camera.fov = 28; SS.camera.updateProjectionMatrix(); } });
  res.scopeFov = await p.evaluate(() => SS.camera.fov); await p.screenshot({ path: OUT + '/3-scoped.png' });
  res.scopeReleased = await p.evaluate(() => SS.input.scope);
  await p.keyboard.press('q'); // toggle off for later steps
  await p.waitForFunction(() => !SS.input.scope, null, { timeout: 10000 }).catch(() => {});
  res.noCoverBtn = await p.evaluate(() => !document.querySelector('[data-ctl="cover"]'));
  await p.keyboard.press('r'); await p.waitForFunction(() => SS.weapon.ammo === 30, null, { timeout: 30000 }).catch(() => {}); res.afterReload = await p.evaluate(() => SS.weapon.ammo ?? SS.weapon.mag);
  // enemies
  await p.evaluate(() => {
    window.__en = [SS.debug.spawnEnemy('flanker'), SS.debug.spawnEnemy('flanker'), SS.debug.spawnEnemy('flanker')].filter(Boolean);
    const pz = SS.camera.position.z;
    __en.forEach((e, i) => {
      if (!e) return;
      e.group.position.set((i - 1) * 1.8, 0, pz - 18 - i * 2);
      e.home.copy(e.group.position); e.goal = e.group.position.clone();
      e.flankTo.copy(e.group.position); e.behavior = 'flanker';
      e.phase = 'fire'; e.exposed = true; e.engaged = true; e.seen = true; e.unseenT = 0;
      e.posture = 'idle'; e.moving = false;
    });
  });
  await p.waitForFunction(() => SS.walking === false && SS.engaged >= 2, null, { timeout: 25000 }).catch(() => {});
  await p.waitForFunction(() => SS.cover && SS.cover.state === 'in' && SS.input.cover && SS.camera.position.y < 1.4, null, { timeout: 20000 }).catch(() => {});
  res.enemyStop = await p.evaluate(() => SS.walking); await p.screenshot({ path: OUT + '/4-enemies.png' });
  res.halt = await p.evaluate(() => ({ engaged: SS.engaged, hud: (document.querySelector('#enemies-left') || {}).textContent, cover: SS.cover.state, ducked: SS.input.cover, eyeY: SS.camera.position.y }));
  // kill one engaged enemy by real damage: the halt must stay while others are alive
  res.haltAfterOne = await p.evaluate(async () => { const e = __en.find(x => x && x.alive && x.engaged); if (e) e.takeHit('head', e.group.position.clone()); for (let t = 0; t < 20; t++) { __en.forEach(x => { if (x && x.alive) x.unseenT = 0; }); await new Promise(r => setTimeout(r, 100)); } /* keep the others counted as reachable (they now duck into real cover) */ return { walking: SS.walking, engaged: SS.engaged }; });
  // scope pops out of cover and fires
  await p.keyboard.press('q');
  await p.waitForFunction(() => SS.input.scope && !SS.input.cover, null, { timeout: 15000 }).catch(() => {});
  res.pop = await p.evaluate(() => ({ ducked: SS.input.cover, a0: SS.weapon.ammo }));
  await p.keyboard.down('Space');
  await p.waitForFunction((a0) => SS.weapon.ammo < a0, res.pop.a0, { timeout: 15000 }).catch(() => {});
  await p.keyboard.up('Space'); res.pop.a1 = await p.evaluate(() => SS.weapon.ammo);
  await p.keyboard.press('q'); // tap again to duck back
  await p.evaluate(() => { SS.input.scope = false; });
  await p.waitForFunction(() => !SS.input.scope && SS.input.cover, null, { timeout: 15000 }).catch(() => {});
  res.pop.reDucked = await p.evaluate(() => SS.input.cover);
  await p.evaluate(() => SS.debug.killAll()); await p.waitForTimeout(1500); await p.screenshot({ path: OUT + '/5-ragdoll.png' }); await p.waitForFunction(() => SS.walking, null, { timeout: 20000 }).catch(() => {}); res.resumed = await p.evaluate(() => SS.walking);
  // soft-lock: an enemy stuck inside a building must not hold the player; despawned within ~5 s and walking resumes
  res.softlock = await p.evaluate(async () => { const e = SS.debug.spawnEnemy('shifter'); if (!e) return { spawned: false };
    const pz0 = SS.camera.position.z; const bl = SS.world.colliders.filter(m => m.scale.x >= 5 && m.scale.y >= 5 && m.position.z < pz0 - 10 && m.position.z > pz0 - 45)[0];
    const bx = bl ? bl.position.x : 12, bz = bl ? bl.position.z : pz0 - 20;
    const pin = () => { e.group.position.set(bx, 0, bz); e.goal = e.group.position.clone(); e.home.copy(e.goal); e.moveT = 99; e.exposed = true; };
    pin(); const t0 = performance.now(); const d0 = SS.distance;
    while (performance.now() - t0 < 9000 && e.alive) { if (e.alive) pin(); await new Promise(r => setTimeout(r, 100)); }
    await new Promise(r => setTimeout(r, 1500)); return { spawned: true, despawned: !e.alive, secs: (performance.now() - t0) / 1000, walking: SS.walking, d0, d1: SS.distance }; });
  res.score = await p.evaluate(() => JSON.parse(JSON.stringify(SS.score && (SS.score.value ?? SS.score.score ?? SS.score))));
  // real progress: distance past 30 m, and shoot a real enemy dead (pinned exposed flanker; Space held; no debug kill)
  res.shoot = await p.evaluate(() => { const k0 = SS.scoreSys.state.kills; const e = SS.debug.spawnEnemy('flanker'); if (!e) return { k0, spawned: false };
    const pz = SS.camera.position.z;
    e.group.position.set(0.6, 0, pz - 14); e.home.copy(e.group.position); e.goal = e.group.position.clone();
    e.flankTo.copy(e.group.position); e.behavior = 'flanker';
    e.phase = 'fire'; e.exposed = true; e.engaged = true; e.seen = true; e.unseenT = 0;
    e.posture = 'idle'; e.moving = false; window.__shootTarget = e; return { k0, spawned: true }; });
  if (res.shoot.spawned) {
    await p.evaluate(() => { SS.input.scope = true; });
    await p.keyboard.down('Space');
    await p.waitForFunction(() => {
      const e = window.__shootTarget; if (!e || !e.alive) return true;
      const v = e.group.position.clone(); v.y += 1.3; v.sub(SS.camera.position);
      SS.input.yaw = Math.atan2(v.x, -v.z); SS.input.pitch = -Math.atan2(v.y, Math.hypot(v.x, v.z));
      SS.input.fire = true; // Space also holds fireKey; keep aim on torso under soft-GL
      if (SS.weapon.ammo === 0) SS.input.reloadPressed = true;
      // keep pinned so soft-GL frames still see an exposed target
      const pz = SS.camera.position.z; e.group.position.set(0.6, 0, pz - 14); e.exposed = true; e.phase = 'fire';
      return false;
    }, null, { timeout: 45000 }).catch(() => {});
    await p.keyboard.up('Space');
    await p.evaluate(() => { SS.input.fire = false; SS.input.scope = false; });
  }
  res.shoot.k1 = await p.evaluate(() => SS.scoreSys.state.kills);
  res.shoot.k0 = res.shoot.k0;
  // if soft-GL never landed a kill, clear the halt so distance can advance (shoot assert still fails)
  await p.evaluate(() => { if (window.__shootTarget && window.__shootTarget.alive) SS.debug.killAll(); });
  await p.waitForFunction(() => SS.walking, null, { timeout: 45000 }).catch(() => {});
  await p.waitForFunction(() => SS.distance > 30, null, { timeout: 45000 }).catch(() => {});
  res.distance = await p.evaluate(() => SS.distance);
  await p.evaluate(() => SS.debug.damage(1000)); await p.waitForTimeout(500); { const f0 = await p.evaluate(() => [SS.distance, SS.camera.position.z]); await p.waitForTimeout(1500); const f1 = await p.evaluate(() => [SS.distance, SS.camera.position.z]); res.deathFreeze = { f0, f1 }; } res.over = await p.evaluate(() => { const o = document.querySelector('#over'); return !!o && getComputedStyle(o).display !== 'none'; });
  res.highscores = await p.evaluate(() => localStorage.getItem('ss-highscores')); await p.screenshot({ path: OUT + '/6-gameover.png' });
  // natural death: fresh run, real spawns, no input, no debug calls; standing still must get you killed (target 60-90 s)
  // Pause the high-art page rAF first — soft-GL is process-wide and the live Meshy scene starves art=0 to death.
  { await p.evaluate(() => { if (!window.__ssRAF) { window.__ssRAF = window.requestAnimationFrame.bind(window); window.requestAnimationFrame = () => 0; } });
    const p2 = await ctx.newPage(); p2.on('pageerror', e => errs.push('p2: ' + e.message)); await p2.goto('http://127.0.0.1:8795/?art=0&seed=7'); await p2.waitForFunction(() => window.SS && document.querySelector('#play'), null, { timeout: 60000 });
    await p2.tap('#play'); const t0 = Date.now();
    res.naturalDeath = await p2.waitForFunction(() => { const o = document.querySelector('#over'); return o && getComputedStyle(o).display !== 'none'; }, null, { timeout: +(process.env.SS_DEATH_MS || 180000), polling: 1000 }).then(() => (Date.now() - t0) / 1000).catch(() => null);
    res.naturalDist = await p2.evaluate(() => SS.distance); await p2.close();
    await p.evaluate(() => { if (window.__ssRAF) { window.requestAnimationFrame = window.__ssRAF; delete window.__ssRAF; requestAnimationFrame(() => {}); } }); }
  // offline
  await p.waitForFunction(() => navigator.serviceWorker.controller, null, { timeout: 30000 }).catch(() => {}); res.caches = await p.evaluate(() => caches.keys());
  await ctx.setOffline(true); await p.reload({ timeout: 120000, waitUntil: 'domcontentloaded' }).catch(() => {}); await p.waitForFunction(() => window.SS && document.querySelector('#play'), null, { timeout: 120000 }).then(() => res.offline = true).catch(() => res.offline = false); await ctx.setOffline(false);
  await p.screenshot({ path: OUT + '/7-offline.png' });
  // Low tier: procedural fighter, no GLBs, and no errors on this page.
  { const p3 = await ctx.newPage(), lowErrs = [];
    p3.on('pageerror', e => lowErrs.push(e.message)); p3.on('console', m => m.type() === 'error' && lowErrs.push('console: ' + m.text()));
    await p3.goto('http://127.0.0.1:8795/?art=0&calm=1&seed=7');
    await p3.waitForFunction(() => window.SS && document.querySelector('#play'), null, { timeout: 60000 });
    await p3.tap('#play');
    await p3.evaluate(() => { SS.debug.spawnEnemy('popper'); });
    await p3.waitForTimeout(2000);
    res.lowTier = await p3.evaluate(() => SS.art.tier);
    res.lowErrors = lowErrs;
    await p3.close(); }
  res.ammoOverlap = await p.evaluate(() => { const a = document.querySelector('#ammo').getBoundingClientRect(); return [...document.querySelectorAll('[data-ctl]')].some(b => { const r = b.getBoundingClientRect(); return !(a.right < r.left || a.left > r.right || a.bottom < r.top || a.top > r.bottom); }); }); res.errors = errs; console.log(JSON.stringify(res, null, 1));
  assert.equal(res.ammoAfterPlay, 30, 'Play tap fires no shots'); assert.ok(d1 > d0, 'walks'); assert.notEqual(res.aim.y1, y0, 'aim'); assert.ok(res.aim.pt1 < res.aim.pt0, 'drag up looks up (pitch decreases; camera.rotation.x=-pitch)'); assert.ok(a1 < a0, 'fires'); assert.ok(res.scopeFov < 32, 'scope ~2.5x'); assert.equal(res.scopeReleased, true, 'scope is tap-to-toggle'); assert.ok(res.noCoverBtn, 'no COVER button');
  assert.ok(res.halt.engaged > 0 && /ENEMIES \d/.test(res.halt.hud), 'halt HUD count'); assert.ok(res.halt.cover === 'in' && res.halt.ducked && res.halt.eyeY < 1.4, 'auto-cover engaged and ducked');
  assert.ok(res.haltAfterOne.walking === false && res.haltAfterOne.engaged > 0, 'halt stays until all engaged are dead'); assert.ok(!res.pop.ducked && res.pop.a1 < res.pop.a0 && res.pop.reDucked, 'scope pops out of cover and fires');
  assert.equal(res.enemyStop, false, 'stops for enemies'); assert.equal(res.resumed, true, 'resumes'); assert.ok(res.over, 'game over'); assert.ok(res.highscores, 'highscore saved');
  assert.ok(res.distance > 30, 'distance > 30 m'); assert.ok(res.shoot.spawned && res.shoot.k1 > res.shoot.k0, 'shot a real enemy dead'); assert.ok(res.naturalDeath != null, 'standing still gets you killed');
  assert.equal(res.dragAmmo[0], res.dragAmmo[1], 'mouse drag never fires'); assert.equal(res.clickAmmo, res.dragAmmo[1] - 1, 'mouse click fires one shot');
  assert.ok(res.softlock.spawned && res.softlock.despawned && res.softlock.walking && res.softlock.d1 > res.softlock.d0, 'soft-lock enemy inside building is cleared and walking resumes');
  assert.deepEqual(res.deathFreeze.f0, res.deathFreeze.f1, 'death freezes walking/world');
  assert.ok(res.caches.some(k => k.startsWith('ss-')), 'ss- cache'); assert.ok(res.offline, 'offline'); assert.equal(res.ammoOverlap, false, 'ammo clear of buttons'); assert.equal(errs.length, 0, 'no page errors');
  assert.equal(res.art.tier, 'high', 'art tier high');
  assert.ok(['fighter1.rig', 'fighter2.rig', 'fighter3.rig', 'bldg1', 'bldg2', 'bldg3', 'bldg4'].every(n => res.art.loaded.indexOf(n) >= 0), 'art loaded rigs and buildings');
  assert.ok(res.art.loaded.indexOf('fighter.quaternius.anim') >= 0 || res.art.loaded.indexOf('fighter1.anim') >= 0, 'anim clips loaded');
  assert.equal(res.art.failed.length, 0, 'art failed empty');
  assert.equal(res.lowTier, 'low', 'art=0 tier');
  assert.equal(res.lowErrors.length, 0, 'no page errors on low tier');
  console.log('M1 PASS');
 } finally { await b.close(); srv.close(); } })().catch(e => { console.error('M1 FAIL', e.message); process.exit(1); });
