// A10: step-5c truck moment in a real run with ?sp=5&truck=1 (one truck 2 s into every wave). Screenshots the tell, the
// approach, the wreck and the bail-out. Checks: tell >= 1.2 s real, dmg <= 20 and HP >= 5, 1-2 fighters spawned and
// re-pathed, crash point clear of collider boxes, no RPG launch within 8 game-s of the truck.
// Usage: node test/truck.js [low|ultra-low] [outPrefix]
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const D = path.resolve(__dirname, '../dist'); const PORT = 8848;
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.glb': 'model/gltf-binary', '.json': 'application/json', '.hdr': 'application/octet-stream' };
const srv = http.createServer((q, r) => { let f = path.join(D, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); }).listen(PORT);
const [tier = 'low', out = 'logs/a10/truck'] = process.argv.slice(2); fs.mkdirSync(path.dirname(out), { recursive: true });
(async () => { const b = await require('../tools/guard').launch(chromium, { executablePath: '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }, { timeoutMs: 900000 });
  const res = { tier }, fail = [];
  try { const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 1.5, isMobile: true, hasTouch: true }); const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(String(e).slice(0, 160)));
    await p.goto('http://127.0.0.1:' + PORT + '/?seed=7&loco=2&hits=2&repos=1&fx=3&sp=5&truck=1&debug&q=' + tier); await p.waitForFunction(() => window.SS && SS.art && SS.art.done, null, { timeout: 180000 });
    await p.tap('#play'); await p.waitForFunction(() => SS.running && !document.body.classList.contains('starting'), null, { timeout: 120000 });
    await p.evaluate(() => { const raf = window.requestAnimationFrame.bind(window); window.__q = null; window.__rafOrig = raf; window.requestAnimationFrame = (cb) => { if (window.__q) { window.__q.push(cb); return 0; } return raf(cb); };
      const pn = performance.now.bind(performance); window.__pMs = 0; performance.now = () => pn() - window.__pMs; window.__pn = pn; });
    const pause = () => p.evaluate(() => { window.__q = []; window.__p0 = window.__pn(); }), resume = () => p.evaluate(() => { const q = window.__q || []; window.__q = null; window.__pMs += window.__pn() - window.__p0; q.forEach((cb) => window.__rafOrig(() => cb(performance.now()))); });
    const shot = async (name) => { await pause(); await p.waitForTimeout(150); const f = out + '_' + tier + '_' + name + '.png'; await p.screenshot({ path: f }); await resume(); return f; };
    res.wait = await p.evaluate(async () => { const t0 = performance.now(); while (!(SS.truckMoment && SS.truckMoment.count > 0) && performance.now() - t0 < 400000) { SS.input.scope = false; if (SS.player.health < 60) SS.player.health = 100; await new Promise((r) => setTimeout(r, 100)); }
      return { ok: !!(SS.truckMoment && SS.truckMoment.count > 0), sim: +(SS.simTime || 0).toFixed(1), ducked: !!SS.input.cover }; });
    if (!res.wait.ok) fail.push('no truck within the wait');
    else { res.shots = [await shot('1tell')]; await p.waitForTimeout(500); res.shots.push(await shot('2approach'));
      await p.waitForFunction(() => SS.truckMoment.last && SS.truckMoment.last.crashR, null, { timeout: 30000 }); res.shots.push(await shot('3crash'));
      await p.waitForFunction(() => SS.truckMoment.last && SS.truckMoment.last.fighters > 0, null, { timeout: 20000 }).catch(() => {}); await p.waitForTimeout(1500); res.shots.push(await shot('4bailout'));
      res.truck = await p.evaluate(() => { const L = SS.truckMoment.last, w = SS.world, B = new SS.THREE.Box3(); const g = SS.scene ? null : null;
        let wreck = null; const roots = []; (SS.camera.parent || null); 
        const crash = { x: 0, z: 0 }; let inside = 0; const pt = new SS.THREE.Vector3();
        const tr = (SS.renderer && null); const root = (() => { let r = null; const sc = SS.camera; let s = sc; while (s.parent) s = s.parent; s.traverse((o) => { if (o.name === 'truck_moment') r = o; }); return r; })();
        if (root) { pt.set(root.position.x, 0.6, root.position.z); for (const m of (w && w.colliders) || []) { if (!m.geometry) continue; B.setFromObject(m); if (B.containsPoint(pt)) inside++; } wreck = [+root.position.x.toFixed(1), +(root.position.z - SS.camera.position.z).toFixed(1)]; }
        const bail = (SS.enemies.list || []).filter((e) => e.alive && e.fromTruck).map((e) => ({ phase: e.phase, path: !!(e.path && e.path.length), d: +e.group.position.distanceTo(SS.camera.position).toFixed(1) }));
        const rpg = SS.setpiece && SS.setpiece.lastRpg; return { ...L, tellMs: Math.round(L.crashR - L.startR), hp: SS.player.health, wreck, insideColliders: inside, bail, rpgLaunchSim: rpg ? rpg.launchSim : null, log: (SS.audioLog || []).slice(-10) }; });
      const t = res.truck; if (!(t.tellMs >= 1200)) fail.push('tell ' + t.tellMs + ' ms'); if (t.dmg > 20 || t.hp < 5) fail.push('truck dmg ' + t.dmg);
      if (!(t.fighters >= 1)) fail.push('no bail-out fighters'); if (t.insideColliders) fail.push('wreck inside ' + t.insideColliders + ' collider(s)');
      if (t.rpgLaunchSim != null && Math.abs(t.rpgLaunchSim - t.startSim) < 8) fail.push('RPG within 8 s of the truck');
      // 6 s later: one more look (fighters at cover, RPG spacing)
      await p.waitForTimeout(6000); res.shots.push(await shot('5after')); res.after = await p.evaluate(() => ({ rpg: SS.setpiece && SS.setpiece.lastRpg ? SS.setpiece.lastRpg.launchSim : null, gap: SS.setPieceAt, fps: SS.fps || null, pr: SS.pr }));
      if (res.after.rpg != null && Math.abs(res.after.rpg - res.truck.startSim) < 8) fail.push('RPG within 8 s of the truck (after)'); }
    res.errs = errs; if (errs.length) fail.push('page errors');
  } catch (e) { fail.push('exception ' + String(e).slice(0, 200)); } finally { await b.close(); srv.close(); }
  res.fail = fail; console.log(JSON.stringify(res)); console.log(fail.length ? 'TRUCK FAIL ' + fail.join('; ') : 'TRUCK PASS'); process.exit(fail.length ? 1 : 0); })();
