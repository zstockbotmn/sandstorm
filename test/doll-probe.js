// A20: K-kill path on any tier (ultra-low = canned death pose, no physics) at normal or throttled fps; asserts the body
// (hips / lowest bone) is < 0.3 m above where the fighter stood 1 s (real) after the kill.
// A19 probe (tester A18: a corpse hung horizontal ~1 m up for 4 frames): kill fighters with K and sample the ragdoll
// height (sim + real time) until it settles; FAIL if a settled body's lowest part is > 0.45 m up with no box under it.
// (was: kill log through the NORMAL hit path (not K): a torso kill and a limb kill each log "kill (torso)" / "kill (limb)",
// a head kill "kill (head)", and clearing the wave logs "wave N clear". Low, no flags.
// Usage: node test/kill-log.js [low] [outPrefix]
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const D = path.resolve(__dirname, '../dist'); const PORT = 8848;
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.glb': 'model/gltf-binary', '.json': 'application/json', '.hdr': 'application/octet-stream' };
const srv = http.createServer((q, r) => { let f = path.join(D, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); }).listen(PORT);
const [tier = 'low', out = 'logs/a20/doll', thr = '1'] = process.argv.slice(2); // thr: CDP CPU throttle (6 = ~1-2 fps) fs.mkdirSync(path.dirname(out), { recursive: true });
(async () => { const b = await require('../tools/guard').launch(chromium, { executablePath: '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }, { timeoutMs: 400000 });
  const res = { tier }, fail = [];
  try { const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 1.5, isMobile: true, hasTouch: true }); const p = await ctx.newPage(); if (+thr > 1) { const cdp = await ctx.newCDPSession(p); await cdp.send('Emulation.setCPUThrottlingRate', { rate: +thr }); } const errs = []; p.on('pageerror', (e) => errs.push(String(e)));
    await p.goto('http://127.0.0.1:' + PORT + '/?seed=7&loco=2&hits=2&repos=1&fx=3&sp=5&debug&q=' + tier); await p.waitForFunction(() => window.SS && SS.art && SS.art.done, null, { timeout: 180000 });
    await p.tap('#play'); await p.waitForFunction(() => SS.running && !document.body.classList.contains('starting'), null, { timeout: 120000 });
    await p.waitForFunction(() => (SS.enemies.list || []).filter((e) => e.alive && !e.dying).length >= 2, null, { timeout: 240000, polling: 500 });
    await p.waitForTimeout(1500);
    res.dolls = await p.evaluate(async () => { const out = [], V = new THREE_V();
      function THREE_V() { return null; }
      for (let k = 0; k < 4; k++) { const e = SS.debugKillNearest(); if (!e) break; const y0 = e.group.position.y, t0 = performance.now(), s0 = SS.simTime; const tr = [];
        const bones = Object.values(e.bones || {}).filter((b) => b && b.getWorldPosition);
        while (performance.now() - t0 < 4000) { await new Promise((r) => setTimeout(r, 120));
          let mn = 1e9, mx = -1e9, hy = null; const w = { x: 0, y: 0, z: 0 }; const tmp = e.bones && e.bones.Hips;
          for (const b of bones) { b.updateWorldMatrix(true, false); const y = b.matrixWorld.elements[13]; if (y < mn) mn = y; if (y > mx) mx = y; }
          if (tmp) { tmp.updateWorldMatrix(true, false); hy = tmp.matrixWorld.elements[13]; }
          tr.push([+((performance.now() - t0) / 1000).toFixed(2), +((SS.simTime - s0)).toFixed(2), hy == null ? null : +(hy - y0).toFixed(2), +(mn - y0).toFixed(2), +(mx - y0).toFixed(2)]); }
        const pose = {}; for (const [n, bn] of Object.entries(e.bones || {})) if (bn && bn.matrixWorld) pose[n] = +(bn.matrixWorld.elements[13] - y0).toFixed(2);
        let prop = null; try { const T = SS.THREE, hb = e.bones && e.bones.Hips; if (hb && T) { const hp = new T.Vector3(); hb.getWorldPosition(hp); const bx = new T.Box3();
          for (const m of (SS.world.colliders || [])) { if (!m.geometry) continue; bx.setFromObject(m); if (hp.x > bx.min.x - 0.3 && hp.x < bx.max.x + 0.3 && hp.z > bx.min.z - 0.3 && hp.z < bx.max.z + 0.3 && bx.max.y < hp.y + 0.05 && bx.max.y > hp.y - 0.7 && bx.max.y - y0 > 0.2) { prop = { top: +(bx.max.y - y0).toFixed(2), name: m.name || m.type }; break; } } } } catch (_) {}
        const at1 = tr.find((x) => x[0] >= 1.0) || tr[tr.length - 1];
        out.push({ k, y0: +y0.toFixed(2), mode: e.fallMode || null, fps: SS.benchFps || null, at1, last: tr[tr.length - 1], pose, prop, trace: tr.filter((_, i) => i % 3 === 0) });
        await new Promise((r) => setTimeout(r, 800)); if (!(SS.enemies.list || []).some((x) => x.alive && !x.dying)) await new Promise((r) => setTimeout(r, 15000)); }
      return out; });
    for (const d of res.dolls) { const h = d.at1; if (!h) continue; const hip = h[2] != null ? h[2] : h[3]; if (hip > 0.3 && !(d.prop && d.last && d.last[2] - d.prop.top < 0.45)) fail.push('kill ' + d.k + ' (' + d.mode + ', y0 ' + d.y0 + '): hips ' + hip + ' m up 1 s after the kill'); if (h[3] < -0.6) fail.push('kill ' + d.k + ': lowest bone ' + h[3] + ' m below its floor (past an edge / through the ground)'); }
    if (!res.dolls.length) fail.push('no kills');
    if (errs.length) { res.errs = errs.slice(0, 5); fail.push('page errors'); } await ctx.close();
  } catch (e) { fail.push('exception ' + e.message); }
  await b.close(); srv.close(); res.fail = fail; console.log(JSON.stringify(res)); console.log(fail.length ? 'DOLL FAIL ' + fail.join(' ; ') : 'DOLL PASS'); process.exit(fail.length ? 1 : 0);
})();
