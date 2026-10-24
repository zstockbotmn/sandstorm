// m1t: at ~5 fps (frames slowed), hit marker, kill marker and the damage-direction arc must be on real painted frames:
// screenshots are taken right after each event, and a rAF painter counts frames that showed each one.
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const D = path.resolve(__dirname, '../dist'); const PORT = 8813; const OUT = path.resolve(__dirname, '../screenshots/feedback'); fs.mkdirSync(OUT, { recursive: true });
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.glb': 'model/gltf-binary' };
const srv = http.createServer((q, r) => { let f = path.join(D, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); }).listen(PORT);
(async () => { const b = await require('../tools/guard').launch(chromium, { executablePath: '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }, { timeoutMs: 600000 });
  const res = {}, fail = [];
  try { const p = await (await b.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true })).newPage();
    await p.addInitScript(() => { const raf = window.requestAnimationFrame.bind(window); window.requestAnimationFrame = (cb) => raf((t) => { const ms = window.__slowMs | 0; if (ms) { const t0 = performance.now(); while (performance.now() - t0 < ms) {} } cb(t); }); });
    await p.goto('http://127.0.0.1:' + PORT + '/?seed=7&calm=1' + (process.env.SS_QS || '')); await p.waitForFunction(() => window.SS && SS.art && SS.art.done, null, { timeout: 180000 });
    await p.click('#play'); await p.waitForFunction(() => window.SS && SS.running, null, { timeout: 90000 }); await p.waitForTimeout(1500);
    await p.evaluate(() => { SS.player.health = 1e9; SS.weapon.reserve = 900; window.__e = SS.debug.spawnEnemy('shifter'); }); await p.waitForFunction(() => window.__e && window.__e.bones && SS.weapon.targets.some((m) => m.userData.enemy === window.__e), null, { timeout: 30000 });
    await p.evaluate(() => { const e = window.__e, c = SS.camera.position; for (const q of SS.enemies.list) if (q !== e && q.alive) { q.group.position.y = -50; q.pinned = true; q.shootCd = 1e9; }
      let ok = null; for (const dz of [9, 12, 7, 15]) { for (const dx of [0.3, -0.8, 1.2, -1.6, 2, -2.4]) { SS.enemies.debugPose(e, c.x + dx, c.z - dz, 'idle'); e.group.updateMatrixWorld(true);
          const v = e.group.position.clone(); v.y += 1.25; const h = SS.weapon.firstHit(c.clone(), v.sub(c).normalize()); if (h && h.object.userData && h.object.userData.enemy === e) { ok = [dx, dz]; break; } } if (ok) break; } window.__spotOk = ok; e.shootCd = 1e9; e.health = 1e9;
      window.__aim = setInterval(() => { const bm = SS.weapon.targets.find((m) => m.userData.enemy === e && m.userData.part === 'body'); const v = e.group.position.clone(); v.y += 1.25; if (bm) bm.getWorldPosition(v); v.sub(SS.camera.position); SS.input.scope = false; SS.input.yaw = Math.atan2(v.x, -v.z); SS.input.pitch = -Math.atan2(v.y, Math.hypot(v.x, v.z)); SS.walking = false; }, 100);
      window.__pp = { hit: 0, kill: 0, dir: 0 }; const m = document.getElementById('hit-marker'), d = document.getElementById('dmg-dir');
      const f = () => { if (m.classList.contains('show')) { if (/kill/.test(m.className)) window.__pp.kill++; else window.__pp.hit++; } if (d.classList.contains('show')) window.__pp.dir++; const fz = window.__freezeAt; if (fz && !SS.hudFreeze && window.__pp[fz] >= 2) SS.hudFreeze = true; requestAnimationFrame(f); }; requestAnimationFrame(f); });
    await p.evaluate(() => { window.__slowMs = 180; }); res.settle1 = await settle();
    // A38 (App PM: state waits, not fixed ms): before each shot the view must have landed on the fighter (camera forward
    // within 0.3 deg of the eye->body-volume ray and still, 2 painted frames running) and its pose settled (< 1 cm / frame).
    const settle = () => p.evaluate(async () => { const V = SS.THREE.Vector3, e = window.__e, t0 = performance.now(); let n0 = SS.frameN | 0, ok = 0, pv = null, pf = null, last = null;
      while (performance.now() - t0 < 30000) { await new Promise((r) => setTimeout(r, 15)); const n = SS.frameN | 0; if (n === n0) continue; n0 = n;
        const bm = SS.weapon.targets.find((m) => m.userData.enemy === e && m.userData.part === 'body'); const v = bm ? bm.getWorldPosition(new V()) : e.group.position.clone().setY(1.25);
        const f = SS.camera.getWorldDirection(new V()), want = v.clone().sub(SS.camera.position).normalize(), off = f.angleTo(want) * 180 / Math.PI;
        const still = pv ? v.distanceTo(pv) < 0.01 && f.angleTo(pf) * 180 / Math.PI < 0.05 : false; pv = v; pf = f; last = { off: +off.toFixed(3), still };
        if (off < 0.3 && still) ok++; else ok = 0; if (ok >= 2) return Object.assign({ ms: Math.round(performance.now() - t0) }, last); }
      return Object.assign({ timeout: true }, last); });
    const waitFor = async (expr, ms) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await p.evaluate(expr)) return true; await p.waitForTimeout(40); } return false; };
    // 1) plain hit
    const m0 = await p.evaluate(() => { window.__freezeAt = 'hit'; return SS.hud.markerCount | 0; });
    res.shot1 = await p.evaluate(() => { const cd = SS.camera.getWorldDirection(new SS.THREE.Vector3()); const w = window.__e.group.position.clone(); w.y += 1.25; w.sub(SS.camera.position).normalize(); window.__dd = [SS.weapon.targets.filter((m) => m.userData.enemy === window.__e).map((m) => m.userData.part + ':' + m.getWorldPosition(new SS.THREE.Vector3()).toArray().map((v) => v.toFixed(1))).slice(0, 2), window.__e.alive, window.__e.group.visible, cd.toArray().map((v) => v.toFixed(3)), w.toArray().map((v) => v.toFixed(3)), SS.input.yaw.toFixed(3), SS.input.pitch.toFixed(3), SS.camera.rotation.y.toFixed(3), SS.camera.rotation.x.toFixed(3)]; const s = SS.weapon.debugShoot(SS.input); return (s && s.hit ? s.hit.name + ':' + s.hit.enemy + '@' + s.hit.point.distanceTo(s.origin).toFixed(1) : 'none') + ' spot ' + JSON.stringify(window.__spotOk) + ' e ' + window.__e.group.position.toArray().map((v) => v.toFixed(1)) + ' c ' + SS.camera.position.toArray().map((v) => v.toFixed(1)) + JSON.stringify(window.__dd || null); });
    res.hit = await waitFor(`(SS.hud.markerCount|0) > ${m0}`, 6000); await waitFor('SS.hudFreeze', 4000); await p.screenshot({ path: OUT + '/1-hit-marker.png' }); await p.evaluate(() => { SS.hudFreeze = false; window.__freezeAt = null; }); await p.waitForTimeout(1500);
    // 2) kill
    res.settle2 = await settle();
    const k0 = await p.evaluate(() => { window.__freezeAt = 'kill'; return SS.hud.killMarkers | 0; }); res.shot2 = await p.evaluate(() => { window.__e.health = 10; const s = SS.weapon.debugShoot(SS.input); return (s && s.hit ? s.hit.name + ':' + s.hit.enemy + '@' + s.hit.point.distanceTo(s.origin).toFixed(1) : 'none') + ' spot ' + JSON.stringify(window.__spotOk) + ' e ' + window.__e.group.position.toArray().map((v) => v.toFixed(1)) + ' c ' + SS.camera.position.toArray().map((v) => v.toFixed(1)) + JSON.stringify(window.__dd || null); });
    res.kill = await waitFor(`(SS.hud.killMarkers|0) > ${k0}`, 6000); await waitFor('SS.hudFreeze', 4000); await p.screenshot({ path: OUT + '/2-kill-marker.png' }); await p.evaluate(() => { SS.hudFreeze = false; window.__freezeAt = null; }); await p.waitForTimeout(1500);
    // 3) damage direction: a hit from the player's right
    
    const d0 = await p.evaluate(() => { window.__freezeAt = 'dir'; return SS.hud.dirCount | 0; });
    await p.evaluate(() => { const c = SS.camera.position; SS.player.damage(1, new SS.THREE.Vector3(c.x + 8, 1.4, c.z - 2)); });
    res.dir = await waitFor(`(SS.hud.dirCount|0) > ${d0}`, 3000); await waitFor('SS.hudFreeze', 4000); res.dirStyle = await p.evaluate(() => { const d = document.getElementById('dmg-dir'), a = d.querySelector('.arc'), cs = getComputedStyle(d), ca = a ? getComputedStyle(a) : null, r = d.getBoundingClientRect(); return { cls: d.className, op: cs.opacity, disp: cs.display, vis: cs.visibility, tf: d.style.transform, z: cs.zIndex, rect: [r.x, r.y, r.width, r.height].map(Math.round), arc: ca && [ca.borderTopColor, ca.borderTopWidth, ca.opacity, ca.display] }; }); const st0 = Date.now(); res.dirAtShot = await p.evaluate(() => [document.getElementById('dmg-dir').className, Math.round(performance.now())]); await p.screenshot({ path: OUT + '/3-damage-arc.png' }); res.shotMs = Date.now() - st0; await p.evaluate(() => { SS.hudFreeze = false; window.__freezeAt = null; }); res.dirAfterShot = await p.evaluate(() => [document.getElementById('dmg-dir').className, Math.round(performance.now()), SS.hud.dirCount]);
    await p.waitForTimeout(2500); res.painted = await p.evaluate(() => window.__pp); res.fps = await p.evaluate(() => SS.benchFps || null);
    if (!res.hit || res.painted.hit < 2) fail.push('hit marker not on >= 2 painted frames ' + JSON.stringify(res));
    if (!res.kill || res.painted.kill < 2) fail.push('kill marker not on >= 2 painted frames ' + JSON.stringify(res));
    if (!res.dir || res.painted.dir < 2) fail.push('damage arc not on >= 2 painted frames ' + JSON.stringify(res));
  } catch (e) { fail.push('exception ' + e.message); }
  res.fail = fail; console.log(JSON.stringify(res)); console.log(fail.length ? 'FEEDBACK FAIL' : 'FEEDBACK PASS'); await b.close(); srv.close(); process.exit(fail.length ? 1 : 0); })();
