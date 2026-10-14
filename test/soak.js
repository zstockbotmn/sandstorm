// Enemy clip side-by-side: each locomotion clip (with the aim-pose upper body) at 4 m, front + 3/4 views, plus head look-at.
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const D = path.resolve(__dirname, '../dist'), OUT = path.resolve(__dirname, '../screenshots/soak'); fs.mkdirSync(OUT, { recursive: true });
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.glb': 'model/gltf-binary', '.hdr': 'application/octet-stream' };
const srv = http.createServer((q, r) => { let f = path.join(D, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); }).listen(8803);
(async () => { const b = await require('../tools/guard').launch(chromium, { executablePath: '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }, { timeoutMs: 900000 });
  const errs = [], res = {};
  try { const p = await (await b.newContext({ viewport: { width: 640, height: 360 }, isMobile: true, hasTouch: true })).newPage(); p.on('pageerror', e => errs.push(e.message));
    // Soak: play >= SS_SOAK_S seconds (default 330) with an auto-aim bot. Restart on game over. Track errors, frame
    // times, heap and GPU-resource growth, stuck/floating enemies, ammo/health sanity.
    const SOAK = +(process.env.SS_SOAK_S || 330) * 1000;
    await p.goto('http://127.0.0.1:8803/?seed=11' + (process.env.SS_QS || '')); await p.waitForFunction(() => window.SS && SS.art && SS.art.done, null, { timeout: 180000 });
    await p.tap('#play'); await p.waitForTimeout(1500);
    await p.evaluate(() => { window.__soak = { fr: [], last: performance.now(), samples: [], runs: 1, bad: [] }; const S = window.__soak;
      (function tick() { const t = performance.now(); S.fr.push(t - S.last); S.last = t; requestAnimationFrame(tick); })(); });
    const t0 = Date.now(); let sample = 0;
    while (Date.now() - t0 < SOAK) {
      const over = await p.evaluate(() => { const o = document.getElementById('over'); return !!(o && getComputedStyle(o).display !== 'none' && !o.hidden && o.offsetParent !== null); });
      if (over) { await p.tap('#restart').catch(() => {}); await p.evaluate(() => { window.__soak.runs++; }); await p.waitForTimeout(1500); }
      await p.evaluate(() => { const v = new SS.THREE.Vector3(), c = SS.camera.position, S = window.__soak;
        const list = (SS.enemies.list || []).filter((e) => e.alive && e.exposed).sort((a, b) => a.group.position.distanceTo(c) - b.group.position.distanceTo(c));
        const tgt = list[0]; if (tgt) { (tgt.parts && tgt.parts.torso ? tgt.parts.torso : tgt.group).getWorldPosition(v); if (!(tgt.parts && tgt.parts.torso)) v.y += 1.2; v.sub(c);
          SS.input.yaw = Math.atan2(v.x, -v.z); SS.input.pitch = -Math.atan2(v.y, Math.hypot(v.x, v.z)); SS.input.fire = Math.random() < 0.8; } else SS.input.fire = false;
        if (SS.weapon.ammo === 0 && SS.weapon.reserve === 0) S.bad.push('dry at ' + SS.distance.toFixed(0));
        if (!(SS.health >= 0 && SS.health <= 100)) S.bad.push('health ' + SS.health);
        for (const e of SS.enemies.list || []) if (e.alive && e.group.visible && !(Number.isFinite(e.group.position.x) && Number.isFinite(e.group.position.y))) S.bad.push('NaN enemy');
      });
      if (Date.now() - t0 > sample * 30000) { sample++; res.last = await p.evaluate(() => { const S = window.__soak, fr = S.fr.splice(0); fr.sort((a, b) => a - b);
        const r = SS.renderer.info, s = { t: Math.round(performance.now() / 1000), d: Math.round(SS.distance), kills: SS.scoreSys.state.kills, runs: S.runs, hp: Math.round(SS.health), ammo: SS.weapon.ammo + '/' + SS.weapon.reserve,
          alive: (SS.enemies.list || []).filter((e) => e.alive).length, enemies: (SS.enemies.list || []).length, p50: +(fr[fr.length >> 1] || 0).toFixed(1), p95: +(fr[Math.floor(fr.length * 0.95)] || 0).toFixed(1),
          geo: r.memory.geometries, tex: r.memory.textures, prog: (r.programs || []).length, calls: r.render.calls, heapMB: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1e6) : null,
          objs: (() => { let n = 0; SS.scene.traverse(() => n++); return n; })(), errs: (SS.errors || []).length }; S.samples.push(s); return s; }); console.log(JSON.stringify(res.last)); }
      await p.waitForTimeout(400);
    }
    res.soak = await p.evaluate(() => ({ samples: window.__soak.samples, bad: [...new Set(window.__soak.bad)].slice(0, 20), ssErrors: (SS.errors || []).slice(0, 20), spikes: (window.SS_SPIKES || []).length }));
    await p.screenshot({ path: OUT + '/end.png' });
  } catch (e) { errs.push('exception ' + e.message); }
  await b.close(); srv.close();
  const s = res.soak && res.soak.samples, a = s && s[1], z = s && s[s.length - 1];
  const leak = a && z && (z.geo > a.geo * 1.5 + 40 || z.tex > a.tex + 20 || z.objs > a.objs * 1.6 + 400);
  console.log(JSON.stringify({ soak: res.soak, errs, leak })); console.log(errs.length || leak || (res.soak && (res.soak.ssErrors.length || res.soak.bad.length)) ? 'SOAK FAIL' : 'SOAK PASS'); process.exit(0);
})();
