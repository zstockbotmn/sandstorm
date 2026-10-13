const YAW_LIMIT = 60 * Math.PI / 180; // keep the street in view
const PITCH_LIMIT = 35 * Math.PI / 180;
const SENS = 0.0023; // tester: twitchy (-40%, then -20%)
const SENS_SCOPED = 0.0009;

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
    endFrame() {
      input.reloadPressed = false;
    },
  };
  input.state = input;

  const pointers = new Map();
  let fireBtn = false;
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
  }
  document.body.appendChild(controls);

  let pressTimer = 0;
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
    const sens = input.scope ? SENS_SCOPED : SENS;
    input.yaw = clamp(input.yaw + dx * sens, -YAW_LIMIT, YAW_LIMIT);
    input.pitch = clamp(input.pitch + dy * sens, -PITCH_LIMIT, PITCH_LIMIT);
  }, { passive: false });

  function endPointer(e) {
    const p = pointers.get(e.pointerId);
    if (!p) return;
    pointers.delete(e.pointerId);
    if (p.mouse) { clearTimeout(pressTimer); if (!p.moved && Math.hypot(e.clientX - p.sx, e.clientY - p.sy) <= 4 && (!p.held || (window.SS.weapon && window.SS.weapon.shotsFired === p.shots0))) input.clickShot = true; fireMouse = false; } // a still click always gets its shot, even if the 100 ms hold began and no frame fired
    sync();
  }
  window.addEventListener('pointerup', endPointer);
  window.addEventListener('pointercancel', endPointer);

  controls.addEventListener('pointerdown', (e) => {
    const name = controlName(e.target);
    if (!name) return;
    e.preventDefault();
    e.stopPropagation();
    if (name === 'fire') fireBtn = true;
    else if (name === 'scope') { input.scope = true; try { buttons.scope.setPointerCapture(e.pointerId); } catch (_) {} } // hold to scope / pop out of cover
    else if (name === 'reload') input.reloadPressed = true;
    sync();
  });

  buttons.fire.addEventListener('pointerdown', (e) => {
    try { buttons.fire.setPointerCapture(e.pointerId); } catch (_) {}
  });
  const releaseScope = () => { input.scope = false; sync(); };
  buttons.scope.addEventListener('pointerup', releaseScope);
  buttons.scope.addEventListener('pointercancel', releaseScope);
  buttons.scope.addEventListener('lostpointercapture', releaseScope);
  const releaseFireBtn = () => { fireBtn = false; sync(); };
  buttons.fire.addEventListener('pointerup', releaseFireBtn);
  buttons.fire.addEventListener('pointercancel', releaseFireBtn);
  buttons.fire.addEventListener('lostpointercapture', releaseFireBtn);

  window.addEventListener('keydown', (e) => {
    if (e.repeat) return;
    if (e.code === 'Space') {
      fireKey = true;
      e.preventDefault();
    } else if (e.code === 'KeyQ') input.scope = true; // hold Q to scope
    else if (e.code === 'KeyR') input.reloadPressed = true;
    else return;
    sync();
  });
  window.addEventListener('keyup', (e) => {
    if (e.code === 'Space') {
      fireKey = false;
      sync();
    } else if (e.code === 'KeyQ') { input.scope = false; sync(); }
  });

  canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  sync();
  return input;
}
