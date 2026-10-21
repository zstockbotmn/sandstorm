// Step 4 stills (NOT run yet): ?bld=4p (procedural buildings only) and ?bld=4 (art buildings + interior windows, art rooms) on one tier.
// Staged camera (window.__freezeCam, calm=1, no walking), one frame held via the rAF pause, five views per config:
//   street (start, down the street), facadeL/facadeR (12 m out, 35 deg to each side at +30 m), room (outside the first
//   'room' cover point, if any), sky (+120 m, pitched up 6 deg: parapets / tanks / antennas / domes of step 4d).
// Records SS.bld4 / bld4sky / bld4rooms / bld4Skip / lastRI per view. Fails only on page errors, a missing SS.bld4 or no
// windows at all; everything else is for review (screenshots in logs/step4/).
// Usage: node test/bld4-shots.js [low|high|ultra-low] [4p|4] [outPrefix]
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const D = path.resolve(__dirname, '../dist'); const PORT = 8847;
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.glb': 'model/gltf-binary', '.json': 'application/json', '.hdr': 'application/octet-stream' };
const srv = http.createServer((q, r) => { let f = path.join(D, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); }).listen(PORT);
const [tier = 'low', bld = '4', out = 'logs/step4/bld4'] = process.argv.slice(2); fs.mkdirSync(path.dirname(out), { recursive: true });
(async () => { const b = await require('../tools/guard').launch(chromium, { executablePath: '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }, { timeoutMs: 600000 });
  const res = { tier, bld, views: {} }, fail = [];
  try { const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true }); const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(String(e)));
    await p.goto('http://127.0.0.1:' + PORT + '/?calm=1&seed=7&bld=' + bld + '&q=' + tier); await p.waitForFunction(() => window.SS && SS.art && SS.art.done, null, { timeout: 180000 });
    await p.tap('#play'); await p.waitForFunction(() => SS.running && !document.body.classList.contains('starting'), null, { timeout: 120000 });
    await p.evaluate(() => { const raf = window.requestAnimationFrame.bind(window); window.__q = null; window.requestAnimationFrame = (cb) => { if (window.__q) { window.__q.push(cb); return 0; } return raf(cb); };
      SS.walking = false; window.__freezeCam = true; window.__z0 = SS.camera.position.z; });
    res.quality = await p.evaluate(() => SS.quality);
    const room = await p.evaluate(() => { for (const s of (SS.world && SS.world.segments) || []) for (const c of s.coverPoints || []) if (c.type === 'room') return [c.pos.x, c.pos.y, c.pos.z]; return null; });
    const views = [['street', [0, 1.7, 0], [0, 1.7, -40]], ['facadeL', [0, 1.7, -30], [-12, 3, -38.6]], ['facadeR', [0, 1.7, -30], [12, 3, -38.6]], ['sky', [0, 1.7, -120], [0, 6, -180]]];
    if (room) views.splice(3, 0, ['room', [room[0] > 0 ? room[0] - 5 : room[0] + 5, 1.6, room[2] + 1.5], [room[0], 1.2, room[2]]]);
    res.room = room;
    for (const [name, from, to] of views) {
      // the room target is already in world z; the others are relative to the start
      await p.evaluate(([f, t, isRoom]) => { const c = SS.camera, z = window.__z0; c.position.set(f[0], f[1], isRoom ? f[2] : z + f[2]); c.lookAt(t[0], t[1], isRoom ? t[2] : z + t[2]); c.updateMatrixWorld(); }, [from, to, name === 'room']);
      await p.waitForTimeout(2500); // segment recycle / LOD / lazy textures settle at the new spot
      await p.evaluate(([f, t, isRoom]) => { const c = SS.camera, z = window.__z0; c.position.set(f[0], f[1], isRoom ? f[2] : z + f[2]); c.lookAt(t[0], t[1], isRoom ? t[2] : z + t[2]); c.updateMatrixWorld(); }, [from, to, name === 'room']);
      await p.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
      await p.evaluate(() => { window.__q = []; }); await p.waitForTimeout(150);
      const file = out + '_' + tier + '_bld' + bld + '_' + name + '.png'; await p.screenshot({ path: file });
      res.views[name] = { file, ri: await p.evaluate(() => SS.lastRI) };
      await p.evaluate(() => { const q = window.__q || []; window.__q = null; q.forEach((cb) => requestAnimationFrame(cb)); });
    }
    res.stats = await p.evaluate(() => ({ bld4: SS.bld4 || null, sky: SS.bld4sky || null, rooms: SS.bld4rooms | 0, skip: SS.bld4Skip || null }));
    if (!res.stats.bld4) fail.push('SS.bld4 missing'); else if (!(res.stats.bld4.windows > 0) && !(res.stats.bld4.artWindows > 0)) fail.push('no interior windows');
    if (bld === '4' && tier !== 'ultra-low' && res.stats.bld4 && !(res.stats.bld4.artWindows > 0)) res.note = 'no art windows (assets/models/windows.json missing? run tools/window-table.mjs + build first)';
    res.errs = errs; if (errs.length) fail.push('page errors');
  } catch (e) { fail.push('exception ' + String(e).slice(0, 200)); } finally { await b.close(); srv.close(); }
  fs.writeFileSync(out + '_' + tier + '_bld' + bld + '.json', JSON.stringify(res, null, 1));
  console.log(JSON.stringify(res)); console.log(fail.length ? 'BLD4SHOTS FAIL ' + fail.join(' ; ') : 'BLD4SHOTS PASS'); process.exit(fail.length ? 1 : 0); })().catch((e) => { console.error(e); process.exit(1); });
