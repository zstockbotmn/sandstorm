const YAW_LIMIT = 70 * Math.PI / 180;
const PITCH_LIMIT = 35 * Math.PI / 180;
const SENS = 0.0048;
const SENS_SCOPED = 0.0019;

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
  for (const name of ['reload', 'scope', 'cover', 'fire']) {
    const b = document.createElement('button');
    b.type = 'button';
    b.dataset.ctl = name;
    b.textContent = name.toUpperCase();
    controls.appendChild(b);
    buttons[name] = b;
  }
  document.body.appendChild(controls);

  function sync() {
    input.fire = fireBtn || fireKey || fireMouse;
    buttons.scope.classList.toggle('on', input.scope);
    buttons.cover.classList.toggle('on', input.cover);
  }

  function controlName(target) {
    const el = target && target.closest ? target.closest('[data-ctl]') : null;
    return el ? el.dataset.ctl : null;
  }

  canvas.style.touchAction = 'none';

  canvas.addEventListener('pointerdown', (e) => {
    if (controlName(e.target)) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.preventDefault();
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY, mouse: e.pointerType === 'mouse' });
    if (e.pointerType === 'mouse') fireMouse = true;
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
    const sens = input.scope ? SENS_SCOPED : SENS;
    input.yaw = clamp(input.yaw + dx * sens, -YAW_LIMIT, YAW_LIMIT);
    input.pitch = clamp(input.pitch - dy * sens, -PITCH_LIMIT, PITCH_LIMIT);
  }, { passive: false });

  function endPointer(e) {
    const p = pointers.get(e.pointerId);
    if (!p) return;
    pointers.delete(e.pointerId);
    if (p.mouse) fireMouse = false;
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
    else if (name === 'scope') input.scope = !input.scope;
    else if (name === 'cover') input.cover = !input.cover;
    else if (name === 'reload') input.reloadPressed = true;
    sync();
  });

  buttons.fire.addEventListener('pointerdown', (e) => {
    try { buttons.fire.setPointerCapture(e.pointerId); } catch (_) {}
  });
  const releaseFireBtn = () => { fireBtn = false; sync(); };
  buttons.fire.addEventListener('pointerup', releaseFireBtn);
  buttons.fire.addEventListener('pointercancel', releaseFireBtn);
  buttons.fire.addEventListener('lostpointercapture', releaseFireBtn);

  window.addEventListener('keydown', (e) => {
    if (e.repeat) return;
    if (e.code === 'Space') {
      fireKey = true;
      e.preventDefault();
    } else if (e.code === 'KeyQ') input.scope = !input.scope;
    else if (e.code === 'KeyC') input.cover = !input.cover;
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
