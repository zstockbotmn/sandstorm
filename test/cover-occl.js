// m1y: crouched / cover-peek fighters behind props (tester: ~5 scoped on-target shots on a crouched enemy registered nothing).
// Real AI fighters take cover and peek; every frame, rays from the eye to the VISIBLE bones (head, neck, chest, hips,
// shoulders) are cast twice: against what is DRAWN (visible meshes incl. the skinned body) and through the game's shot test
// (firstHit: colliders + shot props + hit volumes). A point that is visibly the fighter but whose shot hits world
// geometry is a false occlusion (reported with the blocker); a visible point that the shot passes is a hit-volume gap.
// Then scoped shots at 1 fps (lead-free: fighters hold still in cover) at visible crouched points must register.
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const D = path.resolve(__dirname, '../dist'); const PORT = 8834;
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.glb': 'model/gltf-binary', '.json': 'application/json' };
const srv = http.createServer((q, r) => { let f = path.join(D, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); }).listen(PORT);
const QS = process.env.SS_QS || '';
(async () => { const b = await require('../tools/guard').launch(chromium, { executablePath: '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }, { timeoutMs: 900000 });
  const res = {}, fail = [];
  const ctx = await b.newContext({ viewport: { width: 844, height: 390 } }); const p = await ctx.newPage();
  await p.addInitScript(() => { const raf = window.requestAnimationFrame.bind(window); window.requestAnimationFrame = (cb) => raf((t) => { const ms = window.__slowMs | 0; if (ms && !window.__inSlow) { window.__inSlow = true; const t0 = performance.now(); while (performance.now() - t0 < ms) {} setTimeout(() => { window.__inSlow = false; }, 0); } if (window.__post && t !== window.__pfT) { window.__pfT = t; try { window.__post(); } catch (_) {} } cb(t); }); });
  p.on('pageerror', (e) => (res.pageErrors = res.pageErrors || []).push(String(e).slice(0, 160)));
  await p.goto('http://127.0.0.1:' + PORT + '/?seed=' + (process.env.SS_SEED || 7) + '&calm=1' + QS); await p.waitForFunction(() => window.SS && SS.art && SS.art.done, null, { timeout: 180000 });
  await p.click('#play'); await p.waitForFunction(() => SS.running && !document.body.classList.contains('starting'), null, { timeout: 120000 });
  await p.evaluate(() => { SS.player.health = 1e6; const THREE = SS.THREE; const ray = new THREE.Raycaster(); ray.far = 120;
    window.__E = []; for (let i = 0; i < 3; i++) { const e = SS.debug.spawnEnemy(i === 0 ? 'shifter' : undefined); if (e) { e.health = 1e9; e.noFireUntilR = 1e15; window.__E.push(e); } }
    const tg = new Set(SS.weapon.targets); const shown = (o) => { for (let q = o; q; q = q.parent) if (!q.visible) return false; return true; };
    const drawn = () => { const out = []; SS.scene.traverse((o) => { if (!(o.isMesh || o.isSkinnedMesh) || o.isSprite || tg.has(o) || !shown(o)) return; const m = o.material; if (m && (m.transparent && (m.opacity == null || m.opacity < 0.6)) ) return; if (m && m.colorWrite === false) return;
      for (let q = o; q; q = q.parent) if (q === SS.camera) return; out.push(o); }); return out; };
    const owner = (o) => { for (let q = o; q; q = q.parent) { const e = window.__E.find((x) => x.group === q); if (e) return e; } return null; };
    window.__R = { samples: 0, visible: 0, falseOccl: 0, gap: 0, blockers: {}, gapParts: {}, postures: {} };
    window.__post = () => { const R = window.__R; if (!window.__sampling) return; const list = drawn(); const c = SS.camera.getWorldPosition(new THREE.Vector3());
      for (const e of window.__E) { if (!e.alive || !e.bones) continue; if (!(e.posture === 'crouch' || e.phase === 'peek' || e.phase === 'fire' || e.phase === 'hide')) continue;
        e.group.traverse((o) => { if (o.isSkinnedMesh) { o.boundingSphere = null; o.boundingBox = null; } });
        const B = e.bones; const pts = { head: B.Head, neck: B.Neck || B.Head, chest: e.spineTop || B.Spine2 || B.Spine, hips: B.Hips, lsh: B.LeftArm, rsh: B.RightArm };
        for (const k in pts) { if (!pts[k]) continue; const v = pts[k].getWorldPosition(new THREE.Vector3()); const d = v.clone().sub(c).normalize(); R.samples++;
          ray.set(c, d); const vh = ray.intersectObjects(list, false)[0]; if (!vh || owner(vh.object) !== e) continue; R.visible++; R.postures[e.posture + '/' + e.phase] = (R.postures[e.posture + '/' + e.phase] | 0) + 1;
          const h = SS.weapon.firstHit(c.clone(), d.clone()); const he = h && h.object.userData && h.object.userData.enemy;
          if (he === e) continue;
          if (h && !he && h.distance < vh.distance - 0.05) { R.falseOccl++; const o = h.object; const nm = (o.name || o.type) + (o.userData.shotProp ? '[prop]' : '[collider]') + (shown(o) ? '' : '[hidden]'); R.blockers[nm] = (R.blockers[nm] | 0) + 1;
            if (!R.ex) { const bb = new THREE.Box3().setFromObject(o); R.ex = { nm, part: k, hitY: +h.point.y.toFixed(2), visY: +vh.point.y.toFixed(2), boxTop: +bb.max.y.toFixed(2), dist: +vh.distance.toFixed(1), visObj: vh.object.name || vh.object.type }; } }
          else { R.gap++; R.gapParts[k] = (R.gapParts[k] | 0) + 1; } } } };
  });
  // let the fighters reach cover, then sample at normal fps and at 1 fps
  await p.waitForTimeout(6000); await p.evaluate(() => { window.__sampling = true; }); await p.waitForTimeout(25000);
  res.normal = await p.evaluate(() => JSON.parse(JSON.stringify(window.__R)));
  await p.evaluate(() => { window.__R = { samples: 0, visible: 0, falseOccl: 0, gap: 0, blockers: {}, gapParts: {}, postures: {} }; window.__slowMs = 1000; }); await p.waitForTimeout(25000);
  res.fps1 = await p.evaluate(() => JSON.parse(JSON.stringify(window.__R)));
  // scoped shots at 1 fps on a crouched visible fighter: aim the on-screen view at a visible bone (fighters still in cover)
  res.shots = []; await p.evaluate(() => { SS.input.scope = true; });
  for (let k = 0; k < 6; k++) { const r = await p.evaluate(() => { const THREE = SS.THREE; const c = SS.camera.position; const e = window.__E.find((x) => x.alive && x.posture === 'crouch' && !x.moving); if (!e) return { skip: 'no crouched fighter' };
      const v = (e.spineTop || e.bones.Spine).getWorldPosition(new THREE.Vector3()).lerp(e.bones.Head.getWorldPosition(new THREE.Vector3()), 0.5); const d = v.clone().sub(c);
      SS.input.yaw = Math.atan2(d.x, -d.z); SS.input.pitch = -Math.atan2(d.y, Math.hypot(d.x, d.z)); window.__aimE = e; return { d: +d.length().toFixed(1) }; });
    if (r.skip) { res.shots.push(r); break; } await p.waitForTimeout(2600); // two rendered frames with this view
    // check what is ON SCREEN and queue the click in the same task (between two frames): the shot fires next frame along
    // that drawn view against the fighter as drawn (if he ducks behind the prop later, that is a correct miss, not this check)
    const [vis, s0] = await p.evaluate(() => { const THREE = SS.THREE, L = SS.lastCam; const d = new THREE.Vector3(0, 0, -1).applyQuaternion(L.q); const h = SS.weapon.firstHit(L.p.clone(), d);
      SS.input.pendingShots = (SS.input.pendingShots | 0) + 1; return [h ? (h.object.userData.enemy ? 'enemy:' + h.object.userData.part : 'world:' + (h.object.name || h.object.type)) : 'none', SS.weapon.shotsFired]; });
    await p.waitForFunction((n) => SS.weapon.shotsFired > n, s0, { timeout: 9000, polling: 200 }).catch(() => {});
    r.pre = vis; r.hit = await p.evaluate(() => { const h = SS.weapon.lastShot && SS.weapon.lastShot.hit; return h ? (h.enemy ? 'enemy:' + h.part : 'world:' + h.name) : 'none'; }); res.shots.push(r); }
  await p.evaluate(() => { window.__slowMs = 0; window.__sampling = false; });
  for (const k of ['normal', 'fps1']) { const R = res[k]; if (R.visible < 20) { fail.push(k + ': only ' + R.visible + ' visible crouched/peek samples'); continue; }
    if (R.falseOccl / R.visible > 0.03) fail.push(k + ': ' + R.falseOccl + '/' + R.visible + ' visible points blocked by world geometry ' + JSON.stringify(R.blockers) + ' ' + JSON.stringify(R.ex || {}));
    if (R.gap / R.visible > 0.12) fail.push(k + ': ' + R.gap + '/' + R.visible + ' visible points pass the hit volumes ' + JSON.stringify(R.gapParts)); }
  { const aimed = res.shots.filter((s) => !s.skip && /^enemy/.test(s.pre)); const missed = aimed.filter((s) => !/^enemy/.test(s.hit)); if (missed.length) fail.push('1 fps: ' + missed.length + '/' + aimed.length + ' on-target scoped shots at a crouched fighter did not register ' + JSON.stringify(missed)); }
  if (res.pageErrors) fail.push('page errors: ' + res.pageErrors.join(' | '));
  console.log(JSON.stringify(res)); console.log(fail.length ? 'COVEROCCL FAIL ' + fail.join(' ; ').slice(0, 900) : 'COVEROCCL PASS'); srv.close(); await b.close(); process.exit(fail.length ? 1 : 0);
})().catch((e) => { console.log('COVEROCCL FAIL exception ' + e.message); process.exit(1); });
