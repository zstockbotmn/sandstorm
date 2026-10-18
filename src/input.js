const PITCH_LIMIT = 35 * Math.PI / 180;
const SENS = 0.0023; // tester: twitchy (-40%, then -20%)
const SENS_SCOPED = 0.0007; // steadier scoped aim

function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}

export function createInput(canvas) {
  const input = {
    yaw: 0,
    pitch: 0,
    fire: false,
    scope: false,
    cover: false,
    reloadPressed: false,
    pendingShots: 0, // queued still-clicks; weapon drains one per available cooldown
    endFrame() {
      input.reloadPressed = false;
    },
  };
  input.state = input;
  let aimDX = 0, aimDY = 0;
  // After KIA all input is ignored (no aiming/firing on the death screen).
  const kia = () => !!(window.SS && window.SS.player && window.SS.player.alive === false);
  input.applyAim = function applyAim(dt) {
    if (kia()) { aimDX = aimDY = 0; input.pendingShots = 0; input.fire = false; endHold(); return; }
    const now = performance.now();
    const rdt = Math.min(0.25, Math.max(0, (now - (input._aimT || now)) / 1000)); input._aimT = now;
    if (input.scope !== input._lastScope) { input._lastScope = input.scope; aimDX = aimDY = 0; } // m1u: hip-rate deltas still queued must not land zoomed (overshoot)
    if (!aimDX && !aimDY) return;
    // FPS-independent: queued deltas drain on a real-time exponential (tau 35 ms), so aim speed is the same at 10 or 60 fps
    // and no input is dropped; tiny remainders snap so the queue empties.
    const f = 1 - Math.exp(-rdt / 0.035);
    let ax = aimDX * f, ay = aimDY * f;
    if (Math.abs(aimDX - ax) < 1e-4) ax = aimDX;
    if (Math.abs(aimDY - ay) < 1e-4) ay = aimDY;
    aimDX -= ax; aimDY -= ay;
    // Touch-only aim assist (App PM: subtle, no snapping): view-only. Near a visible live enemy the drag slows (friction)
    // and gains a light pull toward the enemy's chest, proportional to the drag itself (no drag = no motion). Shots are
    // never redirected by this; the hit ray is still the crosshair.
    // m1u: scoped aim is strictly linear (no friction/pull: the pull could push against a small drag and felt inverted)
    if (!input.scope && input.touch && window.SS && window.SS.camera && window.SS.enemies && window.SS.enemies.list && !/[?&]noassist\b/.test(location.search)) {
      const cam = window.SS.camera, cp = cam.position; let best = null, bestA = (input.scope ? 2.5 : 5) * Math.PI / 180;
      const fy = Math.sin(input.yaw), fz = -Math.cos(input.yaw);
      for (const e of window.SS.enemies.list) { if (!e || !e.alive || e.dying || !e.seen) continue; const gp = e.group.position;
        const dx = gp.x - cp.x, dz = gp.z - cp.z, dy = gp.y + 1.25 - cp.y, h = Math.hypot(dx, dz); if (h < 1 || h > 80) continue;
        const ey = Math.atan2(dx, -dz), ep = -Math.atan2(dy, h); let dyaw = ey - input.yaw; dyaw = Math.atan2(Math.sin(dyaw), Math.cos(dyaw)); const dp = ep - input.pitch;
        const ang = Math.hypot(dyaw, dp); if (ang < bestA) { bestA = ang; best = { dyaw, dp, ang }; } }
      if (best && performance.now() - (input.aimMovedT || 0) < 120) { const mag = Math.hypot(ax, ay), lim = (input.scope ? 2.5 : 5) * Math.PI / 180; const w = 1 - best.ang / lim;
        const fr = 1 - 0.35 * w; ax *= fr; ay *= fr; // friction near the target
        const pull = Math.min(0.15 * mag, 0.5 * best.ang) * w; if (pull > 0) { ax += best.dyaw / best.ang * pull; ay += best.dp / best.ang * pull; }
        input.assistW = w; } else input.assistW = 0;
      void fy; void fz;
    }
    // 360 deg aim (was clamped to +-60 deg, so enemies beside/behind the player could not be aimed at or hit).
    input.yaw += ax; if (input.yaw > Math.PI) input.yaw -= Math.PI * 2; else if (input.yaw < -Math.PI) input.yaw += Math.PI * 2;
    input.pitch = clamp(input.pitch + ay, -PITCH_LIMIT, PITCH_LIMIT);
  };

  const pointers = new Map();
  let fireBtn = false;
  let fireShots0 = 0;
  let fireKey = false;
  let fireMouse = false;

  const controls = document.createElement('div');
  controls.id = 'controls';
  const buttons = {};
  for (const name of ['reload', 'scope', 'fire']) { // no COVER button: cover is automatic
    const b = document.createElement('button');
    b.type = 'button';
    b.dataset.ctl = name;
    b.textContent = name.toUpperCase();
    controls.appendChild(b);
    buttons[name] = b;
  }  // SWITCH COVER (Zack): right side, above the ammo counter; two halves = next cover left / right. Shown only in cover.
  { const sw = document.createElement('div'); sw.id = 'switch-cover';
    for (const [ctl, label] of [['coverL', '\u25C0'], ['coverR', '\u25B6']]) { const b = document.createElement('button'); b.type = 'button'; b.dataset.ctl = ctl; b.textContent = label; sw.appendChild(b); buttons[ctl] = b; }
    const cap = document.createElement('span'); cap.textContent = 'SWITCH COVER'; sw.appendChild(cap); controls.appendChild(sw); }

  document.body.appendChild(controls);

  let pressTimer = 0;
  // FIRE-button holds are a real-time timeline (press time, release time), not a per-frame flag: at 0.3-1.5 fps a press
  // and release can both land inside one long frame, and a flag sampled per frame then saw nothing (tester: 0 rounds).
  // The weapon fires the rounds the hold has earned at the rifle's rate, whatever the frame rate.
  let holdN = 0;
  input.hold = null;
  // Real event time: at ~1 fps an event is handled up to a frame after it happened, so a quick tap would otherwise
  // be stretched into a long hold (tester: rounds missing/extra at low fps). Set by a capture listener, valid for this task only.
  input.holdLog = [];
  let evT = 0, evAt = -1e9;
  const evNow = () => { const n = performance.now(); return n - evAt < 8 && evT && evT <= n && n - evT < 5000 ? evT : n; };
  for (const t of ['pointerdown', 'pointerup', 'mousedown', 'mouseup', 'touchstart', 'touchend', 'touchcancel'])
    window.addEventListener(t, (e) => { evT = e.timeStamp || 0; evAt = performance.now(); }, true);
  // Every tap counts (tester m1q: taps lost at low fps): a tap that lands while the previous one is still being fired
  // (ended but not yet consumed by the weapon, e.g. two taps inside one long frame) is queued, not dropped.
  input.holdQ = [];
  const openHold = () => (input.holdQ.length ? input.holdQ[input.holdQ.length - 1] : input.hold);
  function startHold() { if (kia()) return; const o = openHold(); if (o && !o.end) return; const h = { start: evNow(), end: null, id: ++holdN, at: performance.now() };
    if (input.hold) { if (input.holdQ.length < 8) input.holdQ.push(h); } else input.hold = h; input.holdLog.push(h); if (input.holdLog.length > 20) input.holdLog.shift(); }
  let lastUpT = 0;
  function endHold() { lastUpT = performance.now(); const o = openHold(); if (o && !o.end) o.end = evNow(); }
  input.startHold = startHold; input.endHold = endHold;
  input.clearAim = function clearAim() { aimDX = aimDY = 0; };
  input.resetState = function resetState() { input.hold = null; input.holdQ.length = 0; aimDX = aimDY = 0; input.scope = false; input.fire = false; input.cover = false; input.pendingShots = 0; fireBtn = fireKey = fireMouse = false; sync(); };
  function sync() {
    input.fire = fireKey || fireMouse; // the FIRE button drives input.hold (timeline), not this flag
    if (!fireBtn) endHold();
    buttons.scope.classList.toggle('on', input.scope);
  }

  function controlName(target) {
    const el = target && target.closest ? target.closest('[data-ctl]') : null;
    return el ? el.dataset.ctl : null;
  }

  canvas.style.touchAction = 'none';

  canvas.addEventListener('pointerdown', (e) => {
    if (kia()) return;
    if (controlName(e.target)) return;
    // The Play tap (and its synthetic follow-up events) must never fire: ignore canvas presses until 400 ms after the run starts.
    if (!window.SS || !window.SS.running || performance.now() - (window.SS.startedAt || 0) < 400) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.preventDefault();
    input.touch = e.pointerType !== 'mouse';
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, mouse: e.pointerType === 'mouse', shots0: window.SS.weapon ? window.SS.weapon.shotsFired : 0 });
    // Mouse: never fire on press. A click (released <=4 px from press) fires one shot; holding still 100 ms starts auto-fire.
    if (e.pointerType === 'mouse') { const id = e.pointerId; pressTimer = setTimeout(() => { const q = pointers.get(id); if (q && !q.moved) { fireMouse = true; q.held = true; sync(); } }, 100); }
    sync();
    try { canvas.setPointerCapture(e.pointerId); } catch (_) { /* already released */ }
  });

  window.addEventListener('pointermove', (e) => {
    const p = pointers.get(e.pointerId);
    if (!p) return;
    e.preventDefault();
    const dx = e.clientX - p.x;
    const dy = e.clientY - p.y;
    p.x = e.clientX;
    p.y = e.clientY;
    // A drag is aiming, never shooting: cancel the mouse shot once it moves past 6 px.
    if (p.mouse && Math.hypot(p.x - p.sx, p.y - p.sy) > 4) { p.moved = true; clearTimeout(pressTimer); if (fireMouse) { fireMouse = false; sync(); } }
    // Proportional drag aim with light smoothing: deltas queue and are applied over ~35 ms in applyAim(dt).
    // Spikes (coalesced/late events) are capped so one event can't fling the view; gentle friction on a target.
    // Tester: ~1:1 drag (the scene tracks the finger: radians per px = vertical FOV / viewport height, so scoped
    // aim slows with the zoom), applied immediately (no smoothing tail -> no overshoot), spike-capped, no friction.
    // m1u: rate from the scope STATE (not camera.fov, which only changes on the next frame) so every scoped px is the same angle
    const fovRad = (input.scope ? 28 : 70) * Math.PI / 180;
    const sens = fovRad / Math.max(200, window.innerHeight || 390);
    if (kia()) return;
    // Per-event clamp sized to the screen: a real fast swipe moves < ~60% width / 35% height between two events;
    // larger single jumps are lag bursts or pointer teleports (spun the view into the ground). Clamp, don't drop.
    const mx = Math.max(160, (window.innerWidth || 844) * 0.6), my = Math.max(70, (window.innerHeight || 390) * 0.35);
    aimDX += Math.max(-mx, Math.min(mx, dx)) * sens; aimDY += Math.max(-my, Math.min(my, dy)) * sens;
    input.aimMovedT = performance.now(); if (window.SS && window.SS.weapon && window.SS.weapon.cancelRecoil) window.SS.weapon.cancelRecoil();
  }, { passive: false });

  function endPointer(e) {
    const p = pointers.get(e.pointerId);
    if (!p) return;
    pointers.delete(e.pointerId);
    if (p.mouse) { clearTimeout(pressTimer); if (!p.moved && Math.hypot(e.clientX - p.sx, e.clientY - p.sy) <= 4 && (!p.held || (window.SS.weapon && window.SS.weapon.shotsFired === p.shots0))) input.pendingShots = (input.pendingShots || 0) + 1; fireMouse = false; } // queue one shot per still-click; weapon drains when cooldown allows
    sync();
  }
  window.addEventListener('pointerup', endPointer);
  window.addEventListener('pointercancel', endPointer);

  controls.addEventListener('pointerdown', (e) => {
    const name = controlName(e.target);
    if (!name) return;
    e.preventDefault();
    e.stopPropagation();
    if (kia()) return;
    if (name === 'fire') { fireBtn = true; startHold(); } // every touch = one queued shot (fire rate respected by the weapon)
    else if (name === 'scope') { const now = performance.now(); if (now - (input._scopeT || 0) > 180) { input._scopeT = now; input.scope = !input.scope; input.scopeTaps = (input.scopeTaps | 0) + 1; } } // one toggle per press (no double-toggle from duplicate events) // tap-to-toggle: pop out of cover / duck back
    else if (name === 'reload') input.reloadPressed = true;
    else if (name === 'coverL' || name === 'coverR') { const cv = window.SS && window.SS.cover; if (cv && cv.relocate) cv.relocate(name === 'coverL' ? -1 : 1, 'switch'); }
    sync();
  });

  buttons.fire.addEventListener('pointerdown', (e) => {
    try { buttons.fire.setPointerCapture(e.pointerId); } catch (_) {}
  });
  // a quick FIRE tap that ended before any frame fired still gets exactly one shot
  // Fix 4 (hold FIRE = auto-fire): on iOS a held touch can raise pointercancel/lostpointercapture (long-press gesture),
  // which stopped auto-fire after a moment. While a real touch is on the button, only touchend/touchcancel releases it.
  let fireTouches = 0;
  const releaseFireBtn = () => { if (fireTouches > 0) return; fireBtn = false; sync(); }; // the tap's shot was queued on pointerdown
  buttons.fire.addEventListener('touchstart', (e) => { e.preventDefault(); fireTouches = e.targetTouches.length; if (!kia()) { fireBtn = true; startHold(); sync(); } }, { passive: false });
  const touchUp = (e) => { fireTouches = e.targetTouches.length; if (fireTouches === 0) { fireBtn = false; sync(); } };
  buttons.fire.addEventListener('touchend', touchUp); buttons.fire.addEventListener('touchcancel', touchUp);
  // Hold-to-fire (tester: holds after an auto-reload fired nothing): the hold is owned by the pressing pointer and ends
  // only on that pointer's pointerup (window-level, so a release off the button still ends it) or a touch end. Spurious
  // pointercancel/lostpointercapture no longer end a hold; the mouse ':active' state is polled every frame as a backup.
  let firePid = null;
  buttons.fire.addEventListener('pointerdown', (e) => { try { buttons.fire.setPointerCapture(e.pointerId); } catch (_) {} firePid = e.pointerId; fireBtn = !kia(); if (fireBtn) startHold(); sync(); });
  let fireMouseDown = false; // m1v: the ':active' backup below only applies while a real mouse press on FIRE is down
  buttons.fire.addEventListener('mousedown', () => { fireMouseDown = true; if (!kia()) { fireBtn = true; startHold(); sync(); } });
  const fireUp = (e) => { if (firePid != null && e.pointerId !== firePid) return; firePid = null; releaseFireBtn(); };
  window.addEventListener('pointerup', fireUp, true);
  window.addEventListener('mouseup', () => { fireMouseDown = false; if (fireTouches === 0) { firePid = null; fireBtn = false; sync(); } }, true);
  window.addEventListener('blur', () => { firePid = null; fireTouches = 0; fireBtn = false; sync(); });
  input.pollFire = function pollFire() { let act = false; try { act = buttons.fire.matches(':active') && !kia(); } catch (_) {}
    // m1v: at ~1 fps ':active' lingered after a tap and this backup opened a phantom hold that emptied the magazine
    if (act && fireMouseDown && !fireBtn && performance.now() - lastUpT > 400) { fireBtn = true; startHold(); }
    if (!fireBtn && firePid == null && !fireMouseDown && fireTouches === 0) { const o = openHold(); if (o && !o.end) o.end = Math.max(o.start, lastUpT || o.start); } /* nothing is down: an open hold is over */ if (fireKey || fireMouse) input.fire = true; input.fireHeld = !!(input.fire || (input.hold && !input.hold.end)); }; // only ever adds a hold (releases clear it via sync)

  window.addEventListener('keydown', (e) => {
    if (e.repeat) return;
    if (e.code === 'Space') {
      fireKey = true;
      e.preventDefault();
    } else if (e.code === 'KeyQ') input.scope = !input.scope; // Q toggles scope
    else if (e.code === 'KeyR') input.reloadPressed = true;
    else return;
    sync();
  });
  window.addEventListener('keyup', (e) => {
    if (e.code === 'Space') {
      fireKey = false;
      sync();
    }
  });

  canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  sync();
  return input;
}
