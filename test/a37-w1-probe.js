// A37 probe (diagnostic): at W1 on ?door=1&q=low, do rounds at what the player SEES of a fighter connect?
// Every ~1 sim-s, for each live fighter: rays from the eye to every hit-volume centre and every skeleton bone.
// vis = first DRAWN surface (segments + props, art clip honoured; the fighter's own body excluded) vs shot = weapon.firstHit.
// Then scripted shots (debugShoot) at visible volume centres: hits / kills.
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const D = path.resolve(process.argv[3] || path.join(__dirname, '../dist')); const PORT = 8855;
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.glb': 'model/gltf-binary', '.json': 'application/json', '.hdr': 'application/octet-stream', '.jpg': 'image/jpeg', '.png': 'image/png' };
const srv = http.createServer((q, r) => { let f = path.join(D, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); }).listen(PORT);
const out = process.argv[2] || 'logs/a37/w1-probe.json';
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
      const T3 = SS.THREE, W = SS.world, wt = SS.weapon, sleep = (ms) => new Promise((r) => setTimeout(r, ms));
      const t0 = performance.now(); SS.player.health = 1e9;
      while (!(SS.cover && SS.cover.state === 'in' && SS.enemies.list.some((e) => e.alive)) && performance.now() - t0 < 600000) { if ((SS.simTime || 0) > 120) return { fail: 'no W1' }; await sleep(200); }
      const drawn = () => { const out = []; for (const sg of W.segments) sg.group.traverseVisible((o) => { if (!o.isMesh) return; const m = Array.isArray(o.material) ? o.material[0] : o.material; if (!m || m.transparent || m.visible === false || m.colorWrite === false) return; out.push(o); }); 
        // props/cover outside segments (spawned sandbags, cars set-pieces) - any visible opaque scene mesh that is not an enemy part / the viewmodel
        SS.scene.traverseVisible((o) => { if (!o.isMesh || o.isSkinnedMesh) return; let q = o, enemy = false; while (q) { if (q.userData && (q.userData.enemy || q.userData.isEnemy)) { enemy = true; break; } q = q.parent; } if (enemy) return; const m = Array.isArray(o.material) ? o.material[0] : o.material; if (!m || m.transparent || m.visible === false || m.colorWrite === false || m.depthTest === false) return; if (!out.includes(o)) out.push(o); });
        return out; };
      const clipArt = (h) => { if (!(W.inRoomClip && W.inRoomClip(h.point))) return false; const m = Array.isArray(h.object.material) ? h.object.material[0] : h.object.material; return !!(m && m.userData && m.userData.roomClip); };
      const rc = new T3.Raycaster();
      const enemyGroups = new Set();
      const stats = { samples: 0, visPts: 0, visHit: 0, falseBlock: 0, visNoVol: 0, blockers: {}, ranges: [] };
      const ex = [];
      const tEnd = (SS.simTime || 0) + 30; let lastS = -1;
      let meshes = drawn();
      while ((SS.simTime || 0) < tEnd && performance.now() - t0 < 1500000) {
        const sim = SS.simTime || 0; if (sim - lastS < 1.0) { await sleep(100); continue; } lastS = sim; meshes = drawn();
        SS.input.cover = true; SS.input.scope = false;
        const cam = SS.camera.position.clone();
        for (const e of SS.enemies.list) { if (!e.alive || e.dying) continue;
          const groupSet = new Set(); e.group.traverse((o) => groupSet.add(o));
          const pts = [];
          for (const m of wt.targets) if (m.userData.enemy === e) { const v = new T3.Vector3(); m.getWorldPosition(v); pts.push({ k: 'vol:' + m.userData.part, v }); }
          if (e.bones) for (const [n, bn] of Object.entries(e.bones)) { if (!bn || !bn.isBone) continue; const v = new T3.Vector3(); bn.getWorldPosition(v); pts.push({ k: 'bone:' + n, v }); }
          const dist = e.group.position.distanceTo(cam); stats.ranges.push(+dist.toFixed(1));
          for (const pt of pts) {
            stats.samples++;
            const dv = pt.v.clone().sub(cam), dT = dv.length(); dv.normalize();
            rc.set(cam, dv); rc.far = dT + 0.5;
            let vh = null; for (const h of rc.intersectObjects(meshes, false)) { if (groupSet.has(h.object) || clipArt(h)) continue; vh = h; break; }
            const visible = !vh || vh.distance > dT - 0.12;
            if (!visible) continue;
            stats.visPts++;
            const sh = wt.firstHit(cam, dv);
            const onEnemy = sh && sh.object.userData && sh.object.userData.enemy === e;
            if (onEnemy) { stats.visHit++; continue; }
            if (sh && !(sh.object.userData && sh.object.userData.enemy) && sh.distance < dT - 0.12) {
              stats.falseBlock++; const nm = (sh.object.name || sh.object.type) + (sh.object.visible ? '' : '[invisible]') + (sh.object.userData.building ? '[bld]' : '');
              stats.blockers[nm] = (stats.blockers[nm] | 0) + 1;
              if (ex.length < 25) ex.push({ sim: +sim.toFixed(1), e: e.id, pt: pt.k, dT: +dT.toFixed(1), blockD: +sh.distance.toFixed(2), blocker: nm, at: [+sh.point.x.toFixed(2), +sh.point.y.toFixed(2), +sh.point.z.toFixed(2)], visFirst: vh ? (vh.object.name || vh.object.type) + '@' + vh.distance.toFixed(2) : null });
            } else if (pt.k.startsWith('bone:')) stats.visNoVol++;
          }
        }
      }
      // real fire path (input.pendingShots -> shoot() on the last RENDERED view), aimed at a visible bone of a fighter as drawn
      const shots = { n: 0, hit: 0, parts: {}, miss: {}, missEx: [], k0: SS.hud.killMarkers | 0, m0: SS.hud.markerCount | 0, dead0: SS.enemies.list.filter((e) => !e.alive).length, noTarget: 0 };
      const frame = async (n) => { const f0 = SS.frameN | 0; const t1 = performance.now(); while ((SS.frameN | 0) < f0 + n && performance.now() - t1 < 20000) await sleep(20); };
      const PREF = ['Spine02', 'Spine01', 'Spine', 'Head', 'neck', 'Hips', 'LeftArm', 'RightArm', 'LeftUpLeg', 'RightUpLeg'];
      const tS = (SS.simTime || 0) + 40;
      while ((SS.simTime || 0) < tS && shots.n < 60) {
        await frame(1); const cam = SS.camera.position.clone(); meshes = drawn(); let aim = null;
        const live = SS.enemies.list.filter((e) => e.alive && !e.dying).sort((a, b) => a.group.position.distanceTo(cam) - b.group.position.distanceTo(cam));
        for (const e of live) { const groupSet = new Set(); e.group.traverse((o) => groupSet.add(o)); if (!e.bones) continue;
          for (const n of PREF) { const bn = e.bones[n]; if (!bn || !bn.isBone) continue; const v = new T3.Vector3(); bn.getWorldPosition(v); const dv = v.clone().sub(cam), dT = dv.length(); dv.normalize(); rc.set(cam, dv); rc.far = dT;
            let vh = null; for (const h of rc.intersectObjects(meshes, false)) { if (groupSet.has(h.object) || clipArt(h)) continue; vh = h; break; }
            if (!vh || vh.distance > dT - 0.12) { aim = { e, v, dv, bone: n, dT }; break; } }
          if (aim) break; }
        if (!aim) { shots.noTarget++; await sleep(300); continue; }
        SS.input.yaw = Math.atan2(aim.dv.x, -aim.dv.z); SS.input.pitch = -Math.asin(aim.dv.y); SS.input.aimMovedT = performance.now();
        await frame(1);
        // the player fires only when the crosshair drawn on screen is red (weapon.onTarget of the frame just shown)
        if (!wt.onTarget) { shots.notRed = (shots.notRed | 0) + 1; continue; }
        const drawnBone = new T3.Vector3(); aim.e.bones[aim.bone].getWorldPosition(drawnBone);
        { const v = aim.e.group.position.clone(), top = v.clone(); top.y += 1.7; v.project(SS.camera); top.project(SS.camera); const px = Math.abs(top.y - v.y) * 0.5 * innerHeight; (shots.px || (shots.px = [])).push(+px.toFixed(0)); }
        const before = wt.lastShot; SS.input.pendingShots = 1; await frame(1); const s = wt.lastShot; if (s === before) { shots.noFire = (shots.noFire | 0) + 1; continue; }
        shots.n++;
        if (s.hit && s.hit.enemy) { shots.hit++; shots.parts[s.hit.part] = (shots.parts[s.hit.part] | 0) + 1; }
        else { const k = s.hit ? s.hit.name : 'nothing'; shots.miss[k] = (shots.miss[k] | 0) + 1;
          const o = s.origin, d = s.dir; const near = (v) => { const w = v.clone().sub(o); const t = w.dot(d); return +w.sub(d.clone().multiplyScalar(t)).length().toFixed(2); };
          const nowV = new T3.Vector3(); aim.e.bones[aim.bone].getWorldPosition(nowV);
          if (shots.missEx.length < 20) shots.missEx.push({ sim: +(SS.simTime || 0).toFixed(1), bone: aim.bone, dT: +aim.dT.toFixed(1), blocker: k, hitD: s.hit ? +o.distanceTo(s.hit.point).toFixed(2) : null, offDrawn: near(drawnBone), offNow: near(nowV), phase: aim.e.phase || null, lc: SS.lastCam && SS.lastCam.n, fN: SS.frameN }); }
        await sleep(200);
      }
      shots.dead = SS.enemies.list.filter((e) => !e.alive).length - shots.dead0;
      shots.killMarkers = (SS.hud.killMarkers | 0) - shots.k0; shots.markers = (SS.hud.markerCount | 0) - shots.m0;
      stats.ranges = [Math.min(...stats.ranges), Math.max(...stats.ranges)];
      return { stats, ex, shots, sim: SS.simTime, fw: SS.firstWave };
    });
    R.errs = err.slice(0, 3);
    fs.writeFileSync(out, JSON.stringify(R, null, 1));
    console.log('W1 PROBE ' + JSON.stringify({ stats: R.stats, shots: R.shots }));
    await ctx.close();
  } catch (e) { console.log('PROBE FAIL ' + (e && e.message || e)); }
  finally { try { await b.close(); } catch (_) {} try { srv.close(); } catch (_) {} }
  process.exit(0);
})();
