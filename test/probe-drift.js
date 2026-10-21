// step 2 (?hits=2&loco=2): per-body-part hit reactions. NOT RUN YET (box busy when written).
// A fighter is posed 15 m ahead (debugPose). Per zone it is hit through the real shot test (weapon.firstHit -> takeHit):
//  armL / legR / torso: lastHitZone matches, wounds[zone] +1, SS.hitZones[zone] +1, reactW peaks >= 0.5 within 0.25 s and falls
//  < 0.1 within 1.0 s (torso/arm) / 1.3 s (leg); the hit-side limb volume stays on its drawn bones (<= 8 cm) while reacting;
//  torso: root steps back 0.2-0.5 m away from the shooter, never into a collider; no per-frame bone pop > 25 cm.
//  Lasting (AI released for 4 s): arm wound -> spreadMul >= 2.4 and clutchW > 0.5 at some point while not firing;
//  leg wound -> limp > 0.5 and speedMul <= 0.65.
//  Kills (2d): see killCase below (zone, pre-fall, knee buckle, no pop, fall direction, cover slump, settle, stays, Low cap).
// Usage: SS_QS='&q=low&test=fast' node test/hit-react.js   (also run with &q=high)
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const D = path.resolve(__dirname, '../dist'); const PORT = 8839;
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.glb': 'model/gltf-binary', '.json': 'application/json' };
const srv = http.createServer((q, r) => { let f = path.join(D, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); }).listen(PORT);
const QS = process.env.SS_QS || '';
(async () => { const b = await require('../tools/guard').launch(chromium, { executablePath: '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }, { timeoutMs: 900000 });
  const res = { zones: [], kills: [] }, fail = []; const ctx = await b.newContext({ viewport: { width: 844, height: 390 } }); const p = await ctx.newPage();
  p.on('pageerror', (e) => (res.pageErrors = res.pageErrors || []).push(String(e).slice(0, 160)));
  await p.goto('http://127.0.0.1:' + PORT + '/?seed=7&calm=1&loco=2&hits=2' + QS); await p.waitForFunction(() => window.SS && SS.art && SS.art.done, null, { timeout: 180000 });
  await p.click('#play'); await p.waitForFunction(() => SS.running && !document.body.classList.contains('starting'), null, { timeout: 120000 });
  await p.evaluate(() => { window.__more = () => { for (let i = 0; i < 10; i++) { const e = SS.debug.spawnEnemy(); if (e && e.bones) { e.health = 1e9; e.shootCd = 1e9; return e; } } return null; }; /* 3 m cover spacing: spawn on demand once earlier fighters are dead */ SS.walking = false; SS.player.health = 1e6; window.__pool = []; for (let i = 0; i < 20 && window.__pool.length < 12; i++) { const e = SS.debug.spawnEnemy(); if (e && e.bones) { e.health = 1e9; e.shootCd = 1e9; window.__pool.push(e); } } });
  const out = await p.evaluate(async () => { const c = SS.camera.position.clone(), e = window.__pool.shift(); const rows = [];
    for (const q of window.__pool) SS.enemies.debugPose(q, c.x + 40, c.z - 5, 'idle'); SS.enemies.debugPose(e, c.x, c.z - 15, 'idle'); e.group.rotation.y = 0; e.pinned = false; e.staggerT = 0; e.debugHold = true;
    let prev = e.group.position.clone(); const t0 = performance.now();
    while (performance.now() - t0 < 3000) { await new Promise((r) => requestAnimationFrame(r)); const gp = e.group.position; const d = gp.clone().sub(prev); prev = gp.clone();
      let near = null; for (const m of (SS.world && SS.world.colliders) || []) { if (m.name !== 'prop') continue; const dd = Math.hypot(m.position.x - gp.x, m.position.z - gp.z); if (!near || dd < near) near = dd; }
      let mate = 99; for (const q of SS.enemies.list || []) if (q !== e && q.alive) mate = Math.min(mate, Math.hypot(q.group.position.x - gp.x, q.group.position.z - gp.z));
      rows.push([Math.round(performance.now() - t0), +gp.x.toFixed(3), +gp.z.toFixed(3), +d.x.toFixed(3), +d.z.toFixed(3), e.phase, +(e.peekT || 0).toFixed(2), e._stepVec && [+e._stepVec.x.toFixed(2), +e._stepVec.z.toFixed(2)], !!e._sideStep, e.moving, near && +near.toFixed(2), +mate.toFixed(2), e.art && +e.art.root.position.x.toFixed(3)]); }
    return { rows: rows.filter((r, i) => i % 4 === 0), tier: SS.art.tier, list: !!SS.enemies.list }; });
  console.log(JSON.stringify(out)); await b.close(); srv.close(); process.exit(0); })();
