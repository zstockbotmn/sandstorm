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
  ammoEl.textContent = '30 / 120';

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
  const arc = document.createElement('div'); arc.className = 'arc'; // m1t: red arc toward the shooter
  dir.append(arc, arrow);

  const hs = document.createElement('div');
  hs.id = 'hs-icon';
  hs.textContent = 'HEADSHOT';

  const radioStack = document.createElement('div');
  radioStack.id = 'radio-callouts';
  const radioLines = [];
  let radioNext = 0;

  const lowhp = document.createElement('div'); lowhp.id = 'lowhp';
  const ring = document.createElement('div'); ring.id = 'reload-ring';
  root.append(distanceEl, scoreEl, healthWrap, ammoEl, reloadEl, cross, dot, marker, vignette, dir, hs, radioStack, lowhp, ring);

  let health = 100;
  let score = 0;
  let hitTimer = 0;
  let dirTimer = 0;
  let hsTimer = 0;

  function applyHealth() {
    const h = Math.max(0, Math.min(100, health));
    healthFill.style.width = h + '%';
  }

  // m1s: every hit shows a marker, a kill a distinct one (red, larger), and each stays up for a minimum time AND at
  // least 2 painted frames, so it is seen at 4-6 fps (a 380 ms timer could expire between two slow frames). A kill
  // marker is never downgraded by a later plain hit while it is showing.
  let hideAt = 0, framesLeft = 0, hudRaf = 0, shownKind = '';
  const isKill = (k) => k === 'kill' || k === 'headkill';
  function markerTick() { if (window.SS && window.SS.hudFreeze) { hudRaf = requestAnimationFrame(markerTick); return; } framesLeft -= 1; if (framesLeft <= 0 && performance.now() >= hideAt) { marker.classList.remove('show', 'kill', 'head', 'headkill'); shownKind = ''; hudRaf = 0; return; } hudRaf = requestAnimationFrame(markerTick); }
  function hitMarker(kind) {
    kind = kind || 'hit'; const now = performance.now();
    if (isKill(shownKind) && !isKill(kind) && now < hideAt) { framesLeft = Math.max(framesLeft, 2); return; }
    marker.classList.remove('kill', 'head', 'headkill'); if (kind !== 'hit') { void marker.offsetWidth; marker.classList.add(kind); }
    marker.classList.add('show'); shownKind = kind; hud.markerCount = (hud.markerCount | 0) + 1; if (isKill(kind)) hud.killMarkers = (hud.killMarkers | 0) + 1;
    hideAt = now + (isKill(kind) ? 600 : 400); framesLeft = 3; // >= blood spray life
    if (!hudRaf) hudRaf = requestAnimationFrame(markerTick);
  }

  function damageVignette(amount) {
    const a = Math.max(0.6, Math.min(1, amount == null ? 1 : amount));
    vignette.style.transition = 'none';
    vignette.style.opacity = String(a);
    requestAnimationFrame(() => {
      vignette.style.transition = 'opacity 0.55s linear';
      vignette.style.opacity = '0';
    });
  }

  // m1t: red arc (plus arrow) toward the shooter, held >= 700 ms real time AND >= 2 painted frames, then fades.
  let dirHideAt = 0, dirFrames = 0, dirRaf = 0;
  function dirTick() { if (window.SS && window.SS.hudFreeze) { dirRaf = requestAnimationFrame(dirTick); return; } dirFrames -= 1; if (dirFrames <= 0 && performance.now() >= dirHideAt) { dir.classList.remove('show'); dirRaf = 0; return; } dirRaf = requestAnimationFrame(dirTick); }
  function damageDirection(angle) {
    dir.style.transform = 'rotate(' + angle + 'rad)'; dir.classList.add('show'); dir.style.opacity = '';
    dirHideAt = performance.now() + 900; dirFrames = 3; hud.dirCount = (hud.dirCount | 0) + 1; hud.dirAngle = angle;
    if (!dirRaf) dirRaf = requestAnimationFrame(dirTick);
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

  let radioLast = '';
  const remainEl = document.createElement('div'); remainEl.id = 'enemies-left'; root.appendChild(remainEl);
  let nextTxt = '';
  function setRemaining(n) { const t = n > 0 ? 'ENEMIES ' + n : nextTxt; if (remainEl.textContent !== t) remainEl.textContent = t; remainEl.style.display = t ? 'block' : 'none'; remainEl.classList.toggle('next', !(n > 0) && !!nextTxt); }
  function setNext(m) { nextTxt = m > 0 ? 'NEXT WAVE ' + Math.ceil(m) + ' m' : ''; }
  // Scope overlay: dark lens vignette + fine reticle, shown while zoomed.
  const scopeEl = document.createElement('div'); scopeEl.id = 'scope-overlay';
  scopeEl.innerHTML = '<div class="lens"></div><div class="rh"></div><div class="rv"></div><div class="rd"></div>'; root.prepend(scopeEl); // first child: HUD text (ammo, ENEMIES) stays on top
  function setScope(on) { if (scopeEl.classList.contains('on') !== !!on) { scopeEl.classList.toggle('on', !!on); cross.style.visibility = on ? 'hidden' : ''; dot.style.visibility = on ? 'hidden' : ''; } }
  const bannerEl = document.createElement('div'); bannerEl.id = 'wave-banner'; root.appendChild(bannerEl); let bannerTimer = 0;
  function banner(text) { bannerEl.textContent = text; bannerEl.classList.remove('show'); void bannerEl.offsetWidth; bannerEl.classList.add('show'); clearTimeout(bannerTimer); bannerTimer = setTimeout(() => bannerEl.classList.remove('show'), 1300); }
  const hintEl = document.createElement('div'); hintEl.id = 'aim-hint'; root.appendChild(hintEl); let hintTimer = 0;
  function hint(text) {
    if (!text) { clearTimeout(hintTimer); hintEl.classList.remove('show'); hud.hintText = ''; return; }
    hud.hintText = text;
    hintEl.textContent = text || '';
    hintEl.classList.add('show');
    clearTimeout(hintTimer);
    hintTimer = setTimeout(() => { hintEl.classList.remove('show'); hud.hintText = ''; }, 2800);
  }
  function onTarget(on) { cross.classList.toggle('on-target', !!on); }
  function callout(text) {
    const now = performance.now();
    if (now < radioNext || text === radioLast) return; // max one line per 4 s, never the same line twice in a row
    radioNext = now + 4000; radioLast = text;
    const line = document.createElement('div');
    line.className = 'radio-line';
    line.textContent = '[RADIO] ' + text;
    radioStack.appendChild(line);
    radioLines.push(line);
    while (radioLines.length > 2) radioLines.shift().remove();
    setTimeout(() => {
      line.remove();
      const i = radioLines.indexOf(line);
      if (i >= 0) radioLines.splice(i, 1);
    }, 2000);
  }

  const multEl = document.createElement('div'); multEl.id = 'mult'; root.appendChild(multEl);
  function setMult(m, streak) { multEl.textContent = m > 1 ? 'x' + m + ' STREAK ' + streak : ''; multEl.classList.remove('pop'); if (m > 1) { void multEl.offsetWidth; multEl.classList.add('pop'); } }
  const goalEl = document.createElement('div'); goalEl.id = 'goal'; root.appendChild(goalEl);
  function setGoal(t) { if (goalEl.textContent !== t) goalEl.textContent = t; }
  function setScore(v) {
    score = v | 0;
    scoreEl.textContent = String(score);
    if (window.SS) window.SS.score = score;
  }

  applyHealth();

  const hud = {
    update(info) {
      if (!info) return;
      if (info.distance != null) distanceEl.textContent = Math.floor(info.distance) + ' m';
      if (info.ammo != null) ammoEl.textContent = info.ammo + ' / ' + (info.reserve != null ? info.reserve : '\u221E');
      if (info.reloading != null) { reloadEl.style.display = info.reloading ? 'block' : 'none'; ring.classList.toggle('on', !!info.reloading); if (info.reloadP != null) ring.style.setProperty('--p', String(info.reloadP)); }
      if (info.health != null) lowhp.classList.toggle('on', info.health > 0 && info.health <= 35);
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
    callout,
    banner,
    hint,
    setRemaining,
    onTarget,
    setMult,
    setGoal,
    setNext,
    setScope,
  };
  return hud;
}
