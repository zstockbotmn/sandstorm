export function createHud() {
  const root = document.getElementById('hud');

  const distanceEl = document.createElement('div');
  distanceEl.id = 'distance';
  distanceEl.textContent = '0 m';

  const scoreEl = document.createElement('div');
  scoreEl.id = 'score';
  scoreEl.textContent = '0';

  const healthWrap = document.createElement('div');
  healthWrap.id = 'health';
  const healthFill = document.createElement('div');
  healthWrap.appendChild(healthFill);

  const ammoEl = document.createElement('div');
  ammoEl.id = 'ammo';
  ammoEl.textContent = '30 / \u221E';

  const reloadEl = document.createElement('div');
  reloadEl.id = 'reloading';
  reloadEl.textContent = 'RELOADING';
  reloadEl.style.display = 'none';

  const cross = document.createElement('div');
  cross.id = 'crosshair';
  for (let i = 0; i < 4; i++) {
    const arm = document.createElement('span');
    arm.className = 'arm a' + i;
    cross.appendChild(arm);
  }

  const dot = document.createElement('div');
  dot.id = 'red-dot';

  const marker = document.createElement('div');
  marker.id = 'hit-marker';
  for (let i = 0; i < 4; i++) {
    const t = document.createElement('span');
    marker.appendChild(t);
  }

  const vignette = document.createElement('div');
  vignette.id = 'dmg-vignette';

  const dir = document.createElement('div');
  dir.id = 'dmg-dir';
  const arrow = document.createElement('div');
  arrow.className = 'arrow';
  dir.appendChild(arrow);

  const hs = document.createElement('div');
  hs.id = 'hs-icon';
  hs.textContent = 'HS';

  root.append(distanceEl, scoreEl, healthWrap, ammoEl, reloadEl, cross, dot, marker, vignette, dir, hs);

  let health = 100;
  let score = 0;
  let hitTimer = 0;
  let dirTimer = 0;
  let hsTimer = 0;

  function applyHealth() {
    const h = Math.max(0, Math.min(100, health));
    healthFill.style.width = h + '%';
  }

  function hitMarker() {
    marker.classList.add('show');
    clearTimeout(hitTimer);
    hitTimer = setTimeout(() => marker.classList.remove('show'), 120);
  }

  function damageVignette(amount) {
    const a = Math.max(0.35, Math.min(1, amount == null ? 1 : amount));
    vignette.style.transition = 'none';
    vignette.style.opacity = String(a);
    requestAnimationFrame(() => {
      vignette.style.transition = 'opacity 0.55s linear';
      vignette.style.opacity = '0';
    });
  }

  function damageDirection(angle) {
    dir.style.transform = 'rotate(' + angle + 'rad)';
    dir.style.opacity = '1';
    clearTimeout(dirTimer);
    dirTimer = setTimeout(() => { dir.style.opacity = '0'; }, 450);
  }

  function setHealth(v) {
    health = v;
    if (window.SS) window.SS.health = v;
    applyHealth();
  }

  function headshotFlash() {
    hs.classList.add('show');
    clearTimeout(hsTimer);
    hsTimer = setTimeout(() => hs.classList.remove('show'), 420);
  }

  function setScore(v) {
    score = v | 0;
    scoreEl.textContent = String(score);
    if (window.SS) window.SS.score = score;
  }

  applyHealth();

  return {
    update(info) {
      if (!info) return;
      if (info.distance != null) distanceEl.textContent = Math.floor(info.distance) + ' m';
      if (info.ammo != null) ammoEl.textContent = info.ammo + ' / \u221E';
      if (info.reloading != null) reloadEl.style.display = info.reloading ? 'block' : 'none';
      if (info.scoped != null) {
        cross.style.display = info.scoped ? 'none' : 'block';
        dot.style.display = info.scoped ? 'block' : 'none';
      }
      if (info.health != null) {
        health = info.health;
        applyHealth();
      }
      if (info.score != null) {
        score = info.score | 0;
        scoreEl.textContent = String(score);
      }
    },
    hitMarker,
    damageVignette,
    damageDirection,
    setHealth,
    setScore,
    headshotFlash,
  };
}
