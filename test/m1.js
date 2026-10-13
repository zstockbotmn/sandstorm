// M1 quick headless landscape check: load, controls, run loop, enemies/kill, no page errors, offline via sw. Serves dist/ on :8795.
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path'), assert = require('assert');
const D = path.resolve(__dirname, '../dist'), OUT = path.resolve(__dirname, '../screenshots/m1');
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.glb': 'model/gltf-binary', '.json': 'application/json' };
const srv = http.createServer((q, r) => { let f = path.join(D, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); }).listen(8795);
const res = {};
(async () => { const b = await require('../tools/guard').launch(chromium, { executablePath: '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'] }, { timeoutMs: +(process.env.SS_TIMEOUT_MS || 480000) });
 try {
  const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1' });
  const p = await ctx.newPage(), errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push('console: ' + m.text()));
  await p.goto('http://127.0.0.1:8795/?seed=7&calm=1'); await p.waitForFunction(() => window.SS && document.querySelector('#play'), null, { timeout: 60000 });
  await p.screenshot({ path: OUT + '/1-start.png' });
  await p.tap('#play'); await p.waitForTimeout(4000); res.ammoAfterPlay = await p.evaluate(() => SS.weapon.ammo);
  const d0 = await p.evaluate(() => SS.distance); await p.waitForTimeout(6000); const d1 = await p.evaluate(() => SS.distance);
  res.walk = { d0, d1, walking: await p.evaluate(() => SS.walking) };
  await p.screenshot({ path: OUT + '/2-walking.png' });
  // aim drag
  const y0 = await p.evaluate(() => SS.input.yaw); const pt0 = await p.evaluate(() => SS.input.pitch); const am0 = await p.evaluate(() => SS.weapon.ammo); await p.mouse.move(300, 200); await p.mouse.down(); await p.mouse.move(200, 180, { steps: 8 }); await p.mouse.up(); await p.mouse.move(310, 200); await p.mouse.down(); await p.mouse.move(320, 200, { steps: 3 }); await p.mouse.up(); await p.waitForTimeout(300); res.dragAmmo = [am0, await p.evaluate(() => SS.weapon.ammo)];
  await p.mouse.click(400, 200); await p.waitForTimeout(300); res.clickAmmo = await p.evaluate(() => SS.weapon.ammo); res.aim = { y0, y1: await p.evaluate(() => SS.input.yaw), pt0, pt1: await p.evaluate(() => SS.input.pitch) };
  // fire / scope / cover / reload via keys
  await p.keyboard.press('r'); await p.waitForFunction(() => SS.weapon.ammo === 30, null, { timeout: 30000 }).catch(() => {}); const a0 = await p.evaluate(() => SS.weapon.ammo ?? SS.weapon.mag); await p.keyboard.down('Space'); await p.waitForTimeout(700); await p.keyboard.up('Space'); const a1 = await p.evaluate(() => SS.weapon.ammo ?? SS.weapon.mag); res.fire = { a0, a1 };
  await p.keyboard.down('q'); await p.waitForTimeout(800); res.scopeFov = await p.evaluate(() => SS.camera.fov); await p.screenshot({ path: OUT + '/3-scoped.png' }); await p.keyboard.up('q'); await p.waitForTimeout(300); res.scopeReleased = await p.evaluate(() => SS.input.scope);
  res.noCoverBtn = await p.evaluate(() => !document.querySelector('[data-ctl="cover"]'));
  await p.keyboard.press('r'); await p.waitForFunction(() => SS.weapon.ammo === 30, null, { timeout: 30000 }).catch(() => {}); res.afterReload = await p.evaluate(() => SS.weapon.ammo ?? SS.weapon.mag);
  // enemies
  await p.evaluate(() => { window.__en = [SS.debug.spawnEnemy('shifter'), SS.debug.spawnEnemy('flanker'), SS.debug.spawnEnemy('popper')]; }); await p.waitForTimeout(3000);
  res.enemyStop = await p.evaluate(() => SS.walking); await p.screenshot({ path: OUT + '/4-enemies.png' });
  res.halt = await p.evaluate(() => ({ engaged: SS.engaged, hud: (document.querySelector('#enemies-left') || {}).textContent, cover: SS.cover.state, ducked: SS.input.cover, eyeY: SS.camera.position.y }));
  // kill one engaged enemy by real damage: the halt must stay while others are alive
  res.haltAfterOne = await p.evaluate(async () => { const e = __en.find(x => x && x.alive && x.engaged); if (e) e.takeHit('head', e.group.position.clone()); await new Promise(r => setTimeout(r, 1500)); return { walking: SS.walking, engaged: SS.engaged }; });
  // scope pops out of cover and fires
  await p.keyboard.down('q'); await p.waitForTimeout(500); res.pop = await p.evaluate(() => ({ ducked: SS.input.cover, a0: SS.weapon.ammo })); await p.keyboard.down('Space'); await p.waitForTimeout(500); await p.keyboard.up('Space'); res.pop.a1 = await p.evaluate(() => SS.weapon.ammo); await p.keyboard.up('q'); await p.waitForTimeout(400); res.pop.reDucked = await p.evaluate(() => SS.input.cover);
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
  // real progress: distance past 30 m, and shoot a real enemy dead (aim computed from its torso, Space held; no debug kill)
  res.shoot = await p.evaluate(async () => { SS.input.scope = true; const k0 = SS.scoreSys.state.kills; const e = SS.debug.spawnEnemy('flanker'); if (!e) return { k0, k1: k0, spawned: false };
    const until = performance.now() + 9000; const v = new SS.camera.position.constructor();
    while (performance.now() < until && e.alive) { if (e.exposed) { e.group.getWorldPosition(v); v.y += 1.3; v.sub(SS.camera.position);
        SS.input.yaw = Math.atan2(v.x, -v.z); SS.input.pitch = -Math.atan2(v.y, Math.hypot(v.x, v.z)); SS.input.fire = true; } else SS.input.fire = false;
      if (SS.weapon.ammo === 0) SS.input.reloadPressed = true; await new Promise(r => setTimeout(r, 30)); }
    SS.input.fire = false; SS.input.scope = false; return { k0, k1: SS.scoreSys.state.kills, spawned: true }; });
  await p.waitForFunction(() => SS.walking, null, { timeout: 25000 }).catch(() => {}); await p.waitForFunction(() => SS.distance > 30, null, { timeout: 20000 }).catch(() => {}); res.distance = await p.evaluate(() => SS.distance);
  await p.evaluate(() => SS.debug.damage(1000)); await p.waitForTimeout(500); { const f0 = await p.evaluate(() => [SS.distance, SS.camera.position.z]); await p.waitForTimeout(1500); const f1 = await p.evaluate(() => [SS.distance, SS.camera.position.z]); res.deathFreeze = { f0, f1 }; } res.over = await p.evaluate(() => { const o = document.querySelector('#over'); return !!o && getComputedStyle(o).display !== 'none'; });
  res.highscores = await p.evaluate(() => localStorage.getItem('ss-highscores')); await p.screenshot({ path: OUT + '/6-gameover.png' });
  // natural death: fresh run, real spawns, no input, no debug calls; standing still must get you killed (target 60-90 s)
  { const p2 = await ctx.newPage(); p2.on('pageerror', e => errs.push('p2: ' + e.message)); await p2.goto('http://127.0.0.1:8795/?seed=7'); await p2.waitForFunction(() => window.SS && document.querySelector('#play'), null, { timeout: 60000 });
    await p2.tap('#play'); const t0 = Date.now();
    res.naturalDeath = await p2.waitForFunction(() => { const o = document.querySelector('#over'); return o && getComputedStyle(o).display !== 'none'; }, null, { timeout: +(process.env.SS_DEATH_MS || 200000), polling: 1000 }).then(() => (Date.now() - t0) / 1000).catch(() => null);
    res.naturalDist = await p2.evaluate(() => SS.distance); await p2.close(); }
  // offline
  await p.waitForFunction(() => navigator.serviceWorker.controller, null, { timeout: 30000 }).catch(() => {}); res.caches = await p.evaluate(() => caches.keys());
  await ctx.setOffline(true); await p.reload(); await p.waitForFunction(() => window.SS && document.querySelector('#play'), null, { timeout: 30000 }).then(() => res.offline = true).catch(() => res.offline = false); await ctx.setOffline(false);
  await p.screenshot({ path: OUT + '/7-offline.png' });
  res.ammoOverlap = await p.evaluate(() => { const a = document.querySelector('#ammo').getBoundingClientRect(); return [...document.querySelectorAll('[data-ctl]')].some(b => { const r = b.getBoundingClientRect(); return !(a.right < r.left || a.left > r.right || a.bottom < r.top || a.top > r.bottom); }); }); res.errors = errs; console.log(JSON.stringify(res, null, 1));
  assert.equal(res.ammoAfterPlay, 30, 'Play tap fires no shots'); assert.ok(d1 > d0, 'walks'); assert.notEqual(res.aim.y1, y0, 'aim'); assert.ok(res.aim.pt1 < res.aim.pt0, 'drag up looks up (pitch decreases; camera.rotation.x=-pitch)'); assert.ok(a1 < a0, 'fires'); assert.ok(res.scopeFov < 32, 'scope ~2.5x'); assert.equal(res.scopeReleased, false, 'scope is hold'); assert.ok(res.noCoverBtn, 'no COVER button');
  assert.ok(res.halt.engaged > 0 && /ENEMIES \d/.test(res.halt.hud), 'halt HUD count'); assert.ok(res.halt.cover === 'in' && res.halt.ducked && res.halt.eyeY < 1.4, 'auto-cover engaged and ducked');
  assert.ok(res.haltAfterOne.walking === false && res.haltAfterOne.engaged > 0, 'halt stays until all engaged are dead'); assert.ok(!res.pop.ducked && res.pop.a1 < res.pop.a0 && res.pop.reDucked, 'scope pops out of cover and fires');
  assert.equal(res.enemyStop, false, 'stops for enemies'); assert.equal(res.resumed, true, 'resumes'); assert.ok(res.over, 'game over'); assert.ok(res.highscores, 'highscore saved');
  assert.ok(res.distance > 30, 'distance > 30 m'); assert.ok(res.shoot.spawned && res.shoot.k1 > res.shoot.k0, 'shot a real enemy dead'); assert.ok(res.naturalDeath != null, 'standing still gets you killed');
  assert.equal(res.dragAmmo[0], res.dragAmmo[1], 'mouse drag never fires'); assert.equal(res.clickAmmo, res.dragAmmo[1] - 1, 'mouse click fires one shot');
  assert.ok(res.softlock.spawned && res.softlock.despawned && res.softlock.walking && res.softlock.d1 > res.softlock.d0, 'soft-lock enemy inside building is cleared and walking resumes');
  assert.deepEqual(res.deathFreeze.f0, res.deathFreeze.f1, 'death freezes walking/world');
  assert.ok(res.caches.some(k => k.startsWith('ss-')), 'ss- cache'); assert.ok(res.offline, 'offline'); assert.equal(res.ammoOverlap, false, 'ammo clear of buttons'); assert.equal(errs.length, 0, 'no page errors');
  console.log('M1 PASS');
 } finally { await b.close(); srv.close(); } })().catch(e => { console.error('M1 FAIL', e.message); process.exit(1); });
