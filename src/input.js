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
    if (kia()) { aimDX = aimDY = 0; input.pendingShots = 0; input.fire = false; return; }
    const now = performance.now();
    const rdt = Math.min(0.25, Math.max(0, (now - (input._aimT || now)) / 1000)); input._aimT = now;
    if (!aimDX && !aimDY) return;
    // FPS-independent: queued deltas drain on a real-time exponential (tau 35 ms), so aim speed is the same at 10 or 60 fps
    // and no input is dropped; tiny remainders snap so the queue empties.
    const f = 1 - Math.exp(-rdt / 0.035);
    let ax = aimDX * f, ay = aimDY * f;
    if (Math.abs(aimDX - ax) < 1e-4) ax = aimDX;
    if (Math.abs(aimDY - ay) < 1e-4) ay = aimDY;
    aimDX -= ax; aimDY -= ay;
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
  input.clearAim = function clearAim() { aimDX = aimDY = 0; };
  input.resetState = function resetState() { aimDX = aimDY = 0; input.scope = false; input.fire = false; input.cover = false; input.pendingShots = 0; fireBtn = fireKey = fireMouse = false; sync(); };
  function sync() {
    input.fire = fireBtn || fireKey || fireMouse;
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
    const cam = window.SS && window.SS.camera; const fovRad = (cam ? cam.fov : 70) * Math.PI / 180;
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
    if (name === 'fire') { fireBtn = true; fireShots0 = window.SS && window.SS.weapon ? window.SS.weapon.shotsFired : 0; input.pendingShots = Math.min(8, (input.pendingShots | 0) + 1); } // every touch = one queued shot (fire rate respected by the weapon)
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
  buttons.fire.addEventListener('touchstart', (e) => { e.preventDefault(); fireTouches = e.targetTouches.length; if (!kia()) { fireBtn = true; sync(); } }, { passive: false });
  const touchUp = (e) => { fireTouches = e.targetTouches.length; if (fireTouches === 0) { fireBtn = false; sync(); } };
  buttons.fire.addEventListener('touchend', touchUp); buttons.fire.addEventListener('touchcancel', touchUp);
  // Hold-to-fire (tester: holds after an auto-reload fired nothing): the hold is owned by the pressing pointer and ends
  // only on that pointer's pointerup (window-level, so a release off the button still ends it) or a touch end. Spurious
  // pointercancel/lostpointercapture no longer end a hold; the mouse ':active' state is polled every frame as a backup.
  let firePid = null;
  buttons.fire.addEventListener('pointerdown', (e) => { firePid = e.pointerId; fireBtn = !kia(); sync(); });
  buttons.fire.addEventListener('mousedown', () => { if (!kia()) { fireBtn = true; sync(); } });
  const fireUp = (e) => { if (firePid != null && e.pointerId !== firePid) return; firePid = null; releaseFireBtn(); };
  window.addEventListener('pointerup', fireUp, true);
  window.addEventListener('mouseup', () => { if (fireTouches === 0) { firePid = null; fireBtn = false; sync(); } }, true);
  window.addEventListener('blur', () => { firePid = null; fireTouches = 0; fireBtn = false; sync(); });
  input.pollFire = function pollFire() { let act = false; try { act = buttons.fire.matches(':active') && !kia(); } catch (_) {}
    input.fire = fireBtn || fireKey || fireMouse || act; input.fireHeld = input.fire; };

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
