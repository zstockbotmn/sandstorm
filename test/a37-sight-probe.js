// A37 probe: at IN COVER · DOORWAY, sweep yaw and raycast against drawn world meshes (room clip box honoured) to find
// what the default look actually sees. Diagnostic only.
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const D = path.resolve(process.argv[3] || path.join(__dirname, '../dist')); const PORT = 8853;
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.glb': 'model/gltf-binary', '.json': 'application/json', '.hdr': 'application/octet-stream', '.jpg': 'image/jpeg', '.png': 'image/png' };
const srv = http.createServer((q, r) => { let f = path.join(D, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); }).listen(PORT);
const out = process.argv[2] || 'logs/a37/sight.json';
fs.mkdirSync(path.dirname(out), { recursive: true });
(async () => {
  const b = await require('../tools/guard').launch(chromium, { executablePath: '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }, { timeoutMs: 3600000 });
  try {
    const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 1.5, isMobile: true, hasTouch: true });
    const p = await ctx.newPage(); const err = []; p.on('pageerror', (e) => err.push(String(e)));
    await p.goto('http://127.0.0.1:' + PORT + '/?loco=2&hits=2&repos=1&fx=3&sp=5&door=1&cxnade=1&debug&q=low&nosw=1');
    await p.waitForFunction(() => window.SS && SS.art && SS.art.done, null, { timeout: 180000 });
    await p.tap('#play'); await p.waitForFunction(() => SS.running && !document.body.classList.contains('starting'), null, { timeout: 120000 });
    const R = await p.evaluate(async () => {
      const t0 = performance.now(); let lastKill = 0;
      while (performance.now() - t0 < 900000) {
        const sim = SS.simTime || 0; SS.input.scope = false;
        const held = !!(SS.doorHold || (SS.doorStop && SS.doorStop.state === 'held'));
        if (!held && sim - lastKill > 2.0 && SS.debugKillNearest) { SS.debugKillNearest(); lastKill = sim; }
        if (held && SS.cover && SS.cover.state === 'in' && SS.cover.kind === 'door') break;
        if (!SS.player.alive || sim > 220) return { fail: 'no hold', sim };
        await new Promise((r) => setTimeout(r, 200));
      }
      SS.input.aimMovedT = 0; const th = SS.simTime; while (SS.simTime - th < 1.5) await new Promise((r) => setTimeout(r, 150));
      const T3 = SS.THREE, door = SS.cover.door, side = door.side || 1, W2 = door.jamb.max.z - door.z;
      const clipA = new T3.Vector3(Math.min(door.x - side * 0.28, door.x + side * 3.85), -0.1, door.z - W2 + 0.01), clipB = new T3.Vector3(Math.max(door.x - side * 0.28, door.x + side * 3.85), 2.99, door.z + W2 - 0.01);
      const inClip0 = (q) => q.x > clipA.x && q.x < clipB.x && q.y > clipA.y && q.y < clipB.y && q.z > clipA.z && q.z < clipB.z;
      const inClip = (q, o) => { const m = o && (Array.isArray(o.material) ? o.material[0] : o.material); return inClip0(q) && !!(m && m.userData && m.userData.roomClip); };
      const meshes = []; for (const s of SS.world.segments) s.group.traverseVisible((o) => { if (!o.isMesh) return; const m = Array.isArray(o.material) ? o.material[0] : o.material; if (!m || m.transparent || m.visible === false) return; meshes.push(o); });
      const rc = new T3.Raycaster(); const cam = SS.camera.position.clone();
      const sweep = [];
      for (let deg = 0; deg <= 90; deg += 3) {
        const yaw = -side * deg * Math.PI / 180; rc.set(cam, new T3.Vector3(Math.sin(yaw), 0, -Math.cos(yaw))); rc.far = 40;
        const hits = rc.intersectObjects(meshes, false).filter((h) => !inClip(h.point, h.object));
        const h = hits[0]; sweep.push({ deg, yaw: +yaw.toFixed(3), d: h ? +h.distance.toFixed(2) : null, hit: h ? (h.object.name || h.object.type) + (h.object.userData.building ? '[bld]' : '') + (h.object.userData.ownGeo ? '[own]' : '') + ' @' + h.point.x.toFixed(2) + ',' + h.point.z.toFixed(2) : null, reachX0: +(Math.abs(cam.x) / Math.max(0.05, Math.sin(deg * Math.PI / 180))).toFixed(1) });
      }
      const en = SS.enemies.list.filter((e) => e.alive && !e.dying).map((e) => { const q = e.group.position.clone(); q.y = 1.25; const dv = q.clone().sub(cam); const dist = dv.length(); rc.set(cam, dv.normalize()); rc.far = dist - 0.3; const hs = rc.intersectObjects(meshes, false).filter((h) => !inClip(h.point, h.object)); return { id: e.id, x: +q.x.toFixed(1), z: +q.z.toFixed(1), press: !!e._doorPressure, yawTo: +Math.atan2(q.x - cam.x, -(q.z - cam.z)).toFixed(3), visClear: !hs.length, block: hs[0] ? (hs[0].object.name || hs[0].object.type) + ' @' + hs[0].point.x.toFixed(2) + ',' + hs[0].point.z.toFixed(2) : null }; });
      return { door: { x: door.x, z: door.z, side, jamb: [door.jamb.min.x, door.jamb.min.z, door.jamb.max.x, door.jamb.max.z] }, cam: { x: cam.x, y: cam.y, z: cam.z }, yaw: SS.input.yaw, want: SS.doorPeek && SS.doorPeek.want, sweep, en, sim: SS.simTime };
    });
    R.errs = err.slice(0, 3);
    await p.screenshot({ path: out.replace(/\.json$/, '.png') });
    fs.writeFileSync(out, JSON.stringify(R, null, 1));
    console.log('PROBE done yaw=' + R.yaw);
    await ctx.close();
  } catch (e) { console.log('PROBE FAIL ' + (e && e.message || e)); }
  finally { try { await b.close(); } catch (_) {} try { srv.close(); } catch (_) {} }
  process.exit(0);
})();
