// A8 visual + timing checks on one tier (calm run, no enemies): (1) a hit from a shooter 60 deg right -> wedge around the
// crosshair + edge arc + 60% flash; (2) FLANKED tell from behind-left; (3) stance pill; (4) shake: a near-miss 'impact'
// kick must hold >= 2 painted frames AND >= 250 ms; (5) a cover-lip impact while ducked (sandbag top), screenshotted.
// Usage: node test/a8-hud.js [low|ultra-low] [outPrefix]
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const D = path.resolve(__dirname, '../dist'); const PORT = 8847;
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.glb': 'model/gltf-binary', '.json': 'application/json' };
const srv = http.createServer((q, r) => { let f = path.join(D, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); }).listen(PORT);
const [tier = 'low', out = 'logs/a8/hud'] = process.argv.slice(2); fs.mkdirSync(path.dirname(out), { recursive: true });
(async () => { const b = await require('../tools/guard').launch(chromium, { executablePath: '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }, { timeoutMs: 600000 });
  const res = { tier }, fail = [];
  try { const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 1.5, isMobile: true, hasTouch: true }); const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(String(e).slice(0, 160)));
    await p.goto('http://127.0.0.1:' + PORT + '/?seed=7&calm=1&loco=2&hits=2&repos=1&fx=3&q=' + tier); await p.waitForFunction(() => window.SS && SS.art && SS.art.done, null, { timeout: 180000 });
    await p.tap('#play'); await p.waitForFunction(() => SS.running && !document.body.classList.contains('starting'), null, { timeout: 120000 }); await p.waitForTimeout(2000);
    await p.evaluate(() => { const raf = window.requestAnimationFrame.bind(window); window.__q = null; window.__rafOrig = raf; window.requestAnimationFrame = (cb) => { if (window.__q) { window.__q.push(cb); return 0; } return raf(cb); };
      const pn = performance.now.bind(performance); window.__pMs = 0; performance.now = () => pn() - window.__pMs; window.__pn = pn; SS.player.health = 100; });
    const pause = () => p.evaluate(() => { window.__q = []; window.__p0 = window.__pn(); }), resume = () => p.evaluate(() => { const q = window.__q || []; window.__q = null; window.__pMs += window.__pn() - window.__p0; q.forEach((cb) => window.__rafOrig(() => cb(performance.now()))); });
    const frames = (k) => p.evaluate((k) => new Promise((r) => { const f0 = SS.frameN; const t = () => (SS.frameN - f0 >= k ? r() : requestAnimationFrame(t)); t(); }), k);
    const shot = async (name) => { await pause(); await p.waitForTimeout(150); const f = out + '_' + tier + '_' + name + '.png'; await p.screenshot({ path: f }); await resume(); return f; };
    // wait for cover (ducked) during the calm walk, up to 40 s
    res.cover = await p.evaluate(async () => { const t0 = performance.now(); while (!(SS.input.cover && SS.cover && SS.cover.surface) && performance.now() - t0 < 60000) await new Promise((r) => setTimeout(r, 200)); SS.forceWalk = false; return !!(SS.input.cover && SS.cover.surface); });
    await frames(3);
    // (1) hit from 60 deg right, 14 m
    await p.evaluate(() => { const c = SS.camera.position, y = SS.input.yaw + Math.PI / 3; SS.player.damage(12, new SS.THREE.Vector3(c.x + Math.sin(y) * 14, 1.4, c.z - Math.cos(y) * 14), 'test'); });
    await frames(1); res.hit = await p.evaluate(() => { const f = document.getElementById('hit-flash'), w = document.querySelector('#dmg-dir path.wedge'); const r = w ? w.getBoundingClientRect() : null;
      return { flashOpacity: +getComputedStyle(f).opacity, dirShown: document.getElementById('dmg-dir').classList.contains('show'), wedge: r ? [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] : null, wedgeCount: SS.hud.wedgeCount | 0, stance: SS.hud.stance }; });
    res.hitShot = await shot('1hit_right60');
    if (!(res.hit.flashOpacity > 0.3 && res.hit.flashOpacity <= 0.62)) fail.push('flash opacity ' + res.hit.flashOpacity);
    if (!res.hit.wedge || !(res.hit.wedge[0] + res.hit.wedge[2] / 2 > 440)) fail.push('wedge not right of centre ' + JSON.stringify(res.hit.wedge));
    await p.waitForTimeout(1800);
    // (2) FLANKED from behind-left
    await p.evaluate(() => SS.hud.flanked(-2.2)); await frames(1); res.flank = await p.evaluate(() => ({ label: getComputedStyle(document.getElementById('flanked')).opacity, warn: document.getElementById('edge-warn').classList.contains('show'), n: SS.hud.flankedCount }));
    res.flankShot = await shot('2flanked');
    await frames(2); res.flank2 = await p.evaluate(() => ({ label: getComputedStyle(document.getElementById('flanked')).opacity }));
    if (!(+res.flank.label > 0.9 && res.flank.warn)) fail.push('FLANKED not shown ' + JSON.stringify(res.flank));
    await p.waitForTimeout(2000);
    // (4) shake hold
    res.shake = await p.evaluate(() => new Promise((ok) => { SS.fx.kick('impact', 1.6); const t0 = performance.now(), f0 = SS.frameN; let lastF = f0, lastT = t0; const D = Math.PI / 180;
      const tick = () => { const o = SS.fx.offsets(), rot = Math.hypot(o.pitch, o.yaw, o.roll) / D; if (rot > 0.08) { lastF = SS.frameN; lastT = performance.now(); } if (performance.now() - t0 > 1500) return ok({ frames: lastF - f0, ms: Math.round(lastT - t0) }); requestAnimationFrame(tick); }; requestAnimationFrame(tick); }));
    if (!(res.shake.frames >= 2 && res.shake.ms >= 250)) fail.push('shake ' + JSON.stringify(res.shake));
    // (5) cover lip impact while ducked
    if (res.cover) { res.lip = await p.evaluate(() => { const sb = SS.cover.surface, c = SS.camera.position, T = SS.THREE; const pt = new T.Vector3(Math.max(sb.min.x + 0.1, Math.min(sb.max.x - 0.1, c.x + 0.3)), sb.max.y - 0.03, (sb.min.z + sb.max.z) / 2);
        const n0 = SS.fx3.puffs.spawned; SS.fx.impact(pt, new T.Vector3(0, 0.6, 0.8).normalize(), null); return { at: [+pt.x.toFixed(2), +pt.y.toFixed(2), +pt.z.toFixed(2)], spawned: SS.fx3.puffs.spawned - n0, eyeY: +c.y.toFixed(2) }; });
      await frames(1); res.lipShot = await shot('5coverlip'); if (!(res.lip.spawned > 0)) fail.push('cover lip impact spawned nothing'); }
    else res.lipSkipped = 'no cover with a surface box in the calm walk (stance ' + (await p.evaluate(() => SS.hud.stance)) + ')';
    res.stanceShot = res.lipShot; res.errs = errs; if (errs.length) fail.push('errors');
  } finally { await b.close(); srv.close(); }
  console.log(JSON.stringify(res)); console.log(fail.length ? 'A8HUD FAIL ' + fail.join(' ; ') : 'A8HUD PASS'); process.exit(fail.length ? 1 : 0); })().catch((e) => { console.error(e); process.exit(1); });
