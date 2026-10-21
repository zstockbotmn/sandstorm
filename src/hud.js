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
  const healthNum = document.createElement('span'); healthNum.id = 'health-num'; healthWrap.appendChild(healthNum); // m1y: the real HP as a number when low

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
  // m1v: the arc is an SVG ring segment ON the viewport edge (an ellipse inset from the real screen rect, so it hugs the
  // edge at every aspect ratio); the old rotated CSS ring sat ~46vmin from the centre, mid-screen on wide windows.
  const SVGNS = 'http://www.w3.org/2000/svg';
  function edgeSvg(cls) { const sv = document.createElementNS(SVGNS, 'svg'); sv.setAttribute('class', cls); const pth = document.createElementNS(SVGNS, 'path'); sv.appendChild(pth); return [sv, pth]; }
  const [dirSvg, dirPath] = edgeSvg('edge-arc'); dir.appendChild(dirSvg);
  // A8 tester (A7: 'a top bar that shifts sideways, never a distinct arc'): a filled red wedge on a ring around the
  // crosshair, pointing at the shooter, on top of the edge arc. Same show/hold timing as the arc (dmg-dir).
  const dirWedge = document.createElementNS(SVGNS, 'path'); dirWedge.setAttribute('class', 'wedge'); dirSvg.appendChild(dirWedge);
  function wedgePath(angle) { const W = window.innerWidth || 844, H = window.innerHeight || 390, cx = W / 2, cy = H / 2, m = Math.min(W, H), r0 = 0.17 * m, rt = 0.30 * m, hs = 15 * Math.PI / 180;
    const P = (r, a) => (cx + Math.sin(a) * r).toFixed(1) + ' ' + (cy - Math.cos(a) * r).toFixed(1);
    dirWedge.setAttribute('d', 'M' + P(r0, angle - hs) + 'A' + r0.toFixed(1) + ' ' + r0.toFixed(1) + ' 0 0 1 ' + P(r0, angle + hs) + 'L' + P(rt, angle) + 'Z'); } // arrowhead pointing out at the shooter
  // A8: FLANKED tell (App PM): amber label + a long edge streak toward the flanker, >= 1.5 s and >= 4 painted frames.
  const flankEl = document.createElement('div'); flankEl.id = 'flanked'; flankEl.textContent = 'FLANKED';
  // A8: small ducked / exposed indicator next to the health bar (tester A7: no cue for whether you are ducked).
  const stanceEl = document.createElement('div'); stanceEl.id = 'stance'; stanceEl.style.display = 'none'; let stanceK = '';
  const warn = document.createElement('div'); warn.id = 'edge-warn'; const [warnSvg, warnPath] = edgeSvg('edge-arc'); warn.appendChild(warnSvg);
  // Segment of the viewport rectangle (inset) centred where the ray from the centre toward the shooter meets it, so the
  // arc hugs the real screen edge at any aspect ratio, corners included. halfSpan = fraction of min(W,H) on each side.
  function edgePath(sv, pth, angle, halfSpan, inset) { const W = window.innerWidth || 844, H = window.innerHeight || 390; sv.setAttribute('viewBox', '0 0 ' + W + ' ' + H); sv.setAttribute('width', W); sv.setAttribute('height', H);
    const x0 = inset, y0 = inset, w = W - 2 * inset, h = H - 2 * inset, cx = W / 2, cy = H / 2, sx = Math.sin(angle), sy = -Math.cos(angle);
    const t = Math.min(Math.abs(sx) > 1e-6 ? (w / 2) / Math.abs(sx) : 1e9, Math.abs(sy) > 1e-6 ? (h / 2) / Math.abs(sy) : 1e9); const px = cx + sx * t, py = cy + sy * t;
    const P = 2 * (w + h); const toS = (x, y) => (y <= y0 + 0.5 ? x - x0 : x >= x0 + w - 0.5 ? w + (y - y0) : y >= y0 + h - 0.5 ? w + h + (x0 + w - x) : 2 * w + h + (y0 + h - y));
    const at = (q) => { q = ((q % P) + P) % P; if (q < w) return [x0 + q, y0]; q -= w; if (q < h) return [x0 + w, y0 + q]; q -= h; if (q < w) return [x0 + w - q, y0 + h]; q -= w; return [x0, y0 + h - q]; };
    const s0 = toS(px, py), L = halfSpan * Math.min(W, H); let d = '';
    for (let i = 0; i <= 16; i++) { const q = at(s0 - L + (2 * L * i) / 16); d += (i ? 'L' : 'M') + q[0].toFixed(1) + ' ' + q[1].toFixed(1); }
    pth.setAttribute('d', d); return [px, py]; }

  const hs = document.createElement('div');
  hs.id = 'hs-icon';
  hs.textContent = 'HEADSHOT';

  const radioStack = document.createElement('div');
  radioStack.id = 'radio-callouts';
  const radioLines = [];
  let radioNext = 0;

  const lowhp = document.createElement('div'); lowhp.id = 'lowhp';
  const ring = document.createElement('div'); ring.id = 'reload-ring';
  root.append(distanceEl, scoreEl, healthWrap, ammoEl, reloadEl, cross, dot, marker, vignette, dir, warn, hs, radioStack, lowhp, ring, flankEl, stanceEl);

  let health = 100;
  let score = 0;
  let hitTimer = 0;
  let dirTimer = 0;
  let hsTimer = 0;

  function applyHealth() {
    const h = Math.max(0, Math.min(100, health));
    healthFill.style.width = h + '%';
    healthNum.textContent = h > 0 && h < 30 ? String(Math.ceil(h)) : '';
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
    hideAt = now + (isKill(kind) ? 600 : 550); framesLeft = 3; // m1x: plain torso hits were too brief to notice at low fps // >= blood spray life
    if (!hudRaf) hudRaf = requestAnimationFrame(markerTick);
  }

  // A6 tester (HP 23 -> 12 with no cue seen): at ~1 fps the 0.55 s fade and the 0.9 s arc showed for 0-1 painted frames.
  // Every hit now holds the red edge pulse + a short full-screen red flash for >= 3 painted frames AND >= 250 ms real time
  // before fading, and the arc toward the shooter for >= 6 frames / 1.3 s.
  const flash = document.createElement('div'); flash.id = 'hit-flash';
  flash.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:3;opacity:0;background:rgba(220,20,10,.32)';
  root.appendChild(flash);
  let vigFrames = 0, vigAt = 0, vigRaf = 0, vigA = 0;
  function vigTick() { if (window.SS && window.SS.hudFreeze) { vigRaf = requestAnimationFrame(vigTick); return; } vigFrames -= 1;
    if (vigFrames > 0 || performance.now() < vigAt) { vigRaf = requestAnimationFrame(vigTick); return; }
    vignette.style.transition = 'opacity 0.55s linear'; vignette.style.opacity = '0';
    flash.style.transition = 'opacity 0.35s linear'; flash.style.opacity = '0'; vigRaf = 0; }
  function damageVignette(amount) {
    const a = Math.max(0.6, Math.min(1, amount == null ? 1 : amount));
    vignette.style.transition = 'none'; vignette.style.opacity = String(a);
    flash.style.transition = 'none'; flash.style.opacity = String(0.6 * Math.min(1, 0.55 + 0.45 * a)); // A8: ~60% of the A7 flash (tester: very strong)
    vigA = a; vigFrames = 3; vigAt = performance.now() + 250; hud.flashCount = (hud.flashCount | 0) + 1;
    if (!vigRaf) vigRaf = requestAnimationFrame(vigTick);
  }

  // m1t: red arc (plus arrow) toward the shooter, held >= 700 ms real time AND >= 2 painted frames, then fades.
  let dirHideAt = 0, dirFrames = 0, dirRaf = 0;
  function dirTick() { if (window.SS && window.SS.hudFreeze) { dirRaf = requestAnimationFrame(dirTick); return; } dirFrames -= 1; if (dirFrames <= 0 && performance.now() >= dirHideAt) { dir.classList.remove('show'); dirRaf = 0; return; } dirRaf = requestAnimationFrame(dirTick); }
  function damageDirection(angle) {
    hud.dirPoint = edgePath(dirSvg, dirPath, angle, 0.3, 12); wedgePath(angle); hud.wedgeCount = (hud.wedgeCount | 0) + 1; dir.style.transform = 'none'; dir.classList.add('show'); dir.style.opacity = '';
    dirHideAt = performance.now() + 1300; dirFrames = 6; hud.dirCount = (hud.dirCount | 0) + 1; hud.dirAngle = angle;
    if (!dirRaf) dirRaf = requestAnimationFrame(dirTick);
  }

  // m1v: warning streak on the edge toward an off-view shooter (no damage from there; this tells the player to look)
  let warnHideAt = 0, warnFrames = 0, warnRaf = 0;
  function warnTick() { if (window.SS && window.SS.hudFreeze) { warnRaf = requestAnimationFrame(warnTick); return; } warnFrames -= 1; if (warnFrames <= 0 && performance.now() >= warnHideAt) { warn.classList.remove('show'); warnRaf = 0; return; } warnRaf = requestAnimationFrame(warnTick); }
  let flankHideAt = 0, flankFrames = 0, flankRaf = 0;
  function flankTick() { if (window.SS && window.SS.hudFreeze) { flankRaf = requestAnimationFrame(flankTick); return; } flankFrames -= 1; if (flankFrames <= 0 && performance.now() >= flankHideAt) { flankEl.classList.remove('show'); flankRaf = 0; return; } if (performance.now() < flankHideAt - 300) { warn.classList.add('show'); warnHideAt = Math.max(warnHideAt, performance.now() + 300); } flankRaf = requestAnimationFrame(flankTick); }
  function flanked(angle) { edgeWarn(angle); warnHideAt = performance.now() + 1600; warnFrames = 4; flankEl.classList.remove('show'); void flankEl.offsetWidth; flankEl.classList.add('show');
    flankHideAt = performance.now() + 1800; flankFrames = 4; hud.flankedCount = (hud.flankedCount | 0) + 1; hud.flankedAngle = angle; if (!flankRaf) flankRaf = requestAnimationFrame(flankTick);
    if (window.SS && window.SS.audio && window.SS.audio.log) try { window.SS.audio.log('FLANKED', ''); } catch (_) {} }
  function setStance(k) { if (k === stanceK) return; stanceK = k; stanceEl.style.display = k ? 'block' : 'none'; stanceEl.className = k || ''; stanceEl.textContent = k === 'ducked' ? 'IN COVER' : k === 'exposed' ? 'EXPOSED' : ''; hud.stance = k; }
  function edgeWarn(angle) { hud.warnPoint = edgePath(warnSvg, warnPath, angle, 0.18, 6); warn.classList.add('show'); warnHideAt = performance.now() + 700; warnFrames = 3; hud.warnCount = (hud.warnCount | 0) + 1; hud.warnAngle = angle; if (!warnRaf) warnRaf = requestAnimationFrame(warnTick); }

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
  // m1x: a priority radio line (pacing warning before first contact): bypasses the 4 s throttle, stays up longer
  // m1z (tester at 0.6 fps never saw it): the line had the 2 s CSS fade of normal callouts, so it was transparent before a
  // second frame was painted, and later callouts could evict it. It now stays fully visible until BOTH a minimum real
  // time (6 s) and a minimum number of rendered frames (5) have passed, is never evicted by normal callouts, then fades.
  const RADIO_MIN_MS = 6000, RADIO_MIN_FRAMES = 5;
  function radio(text, ms) {
    radioNext = performance.now() + 4000; radioLast = text;
    const line = document.createElement('div'); line.className = 'radio-line radio-warn'; line.textContent = '[RADIO] ' + text;
    radioStack.appendChild(line); radioLines.push(line); evict();
    const t0 = performance.now(), f0 = (window.SS && window.SS.frameN) | 0, minMs = Math.max(RADIO_MIN_MS, ms || 0);
    hud.radioShownAt = t0; hud.radioText = text;
    const done = () => { line.remove(); const i = radioLines.indexOf(line); if (i >= 0) radioLines.splice(i, 1); hud.radioGoneAt = performance.now(); hud.radioFrames = ((window.SS && window.SS.frameN) | 0) - f0; };
    const check = () => { if (!line.isConnected) return; if (performance.now() - t0 >= minMs && (((window.SS && window.SS.frameN) | 0) - f0) >= RADIO_MIN_FRAMES) { line.classList.add('fade'); setTimeout(done, 900); } else setTimeout(check, 250); };
    setTimeout(check, 250);
  }
  // keep at most 2 lines; a priority (radio-warn) line is never the one evicted
  function evict() { while (radioLines.length > 2) { const i = radioLines.findIndex((l) => !l.classList.contains('radio-warn')); const l = radioLines.splice(i >= 0 ? i : 0, 1)[0]; l.remove(); } }
  // pA (0.6 fps): normal callouts faded by CSS in 2 s, so 'Moving!' was gone before a second frame was drawn, and a repeat
  // was dropped as 'same line twice'. Now each line is held by JS for >= 2.5 s real AND >= 3 rendered frames, then fades;
  // movement calls (important) skip the 4 s throttle, and a line may repeat once 8 s have passed.
  const CALL_MIN_MS = 2500, CALL_MIN_FRAMES = 3, callSeen = {};
  function callout(text, important) {
    const now = performance.now();
    if (!important && now < radioNext) return; // max one line per 4 s
    if (text === radioLast && now - (callSeen[text] || -1e9) < 8000) return; // never the same line twice in a row (8 s)
    radioNext = now + 4000; radioLast = text; callSeen[text] = now;
    const line = document.createElement('div');
    line.className = 'radio-line radio-held';
    line.textContent = '[RADIO] ' + text;
    radioStack.appendChild(line);
    radioLines.push(line);
    evict();
    const f0 = (window.SS && window.SS.frameN) | 0; hud.lastCallout = { text, t: now, frame: f0 };
    const done = () => { line.remove(); const i = radioLines.indexOf(line); if (i >= 0) radioLines.splice(i, 1); };
    const check = () => { if (!line.isConnected) return; if (performance.now() - now >= CALL_MIN_MS && (((window.SS && window.SS.frameN) | 0) - f0) >= CALL_MIN_FRAMES) { line.classList.add('fade'); setTimeout(done, 900); } else setTimeout(check, 250); };
    setTimeout(check, 250);
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

  function setAmmo(a, r) { const t = a + ' / ' + (r != null ? r : '\u221E'); if (ammoEl.textContent !== t) ammoEl.textContent = t; }
  // First-run hint (App PM): 'DRAG TO AIM · TAP FIRE' on the very first run only (localStorage 'ss.firstHint'; ?hint=1
  // shows it again; automated browsers only with ?hint=1 / ?hint=keep). Fades after the first real aim drag (>= 60 px) or a shot, else after 12 s real time - but never
  // before 4 s AND 3 rendered frames (readable under 1 fps). pointer-events: none, so it never eats a tap.
  const FH_KEY = 'ss.firstHint', FH_MIN_MS = 4000, FH_MIN_FRAMES = 3, FH_MAX_MS = 12000, FH_DRAG_PX = 60;
  const fhEl = document.createElement('div'); fhEl.id = 'first-hint'; fhEl.innerHTML = '<b>DRAG</b> TO AIM &nbsp;·&nbsp; TAP <b>FIRE</b> TO SHOOT'; root.appendChild(fhEl);
  const fh = { state: 'idle', shownAt: 0, f0: 0, drag0: 0, shots0: 0, reason: '' };
  try { if (/[?&]hint=1\b/.test(location.search)) localStorage.removeItem(FH_KEY); } catch (_) { /* storage blocked */ }
  const fhOff = (() => { try { return !!navigator.webdriver && !/[?&]hint=(1|keep)\b/.test(location.search); /* hint=keep: harness, storage kept */ } catch (_) { return false; } })(); // harness runs: only with ?hint=1
  const fhSeen = () => { if (fhOff) return true; try { return localStorage.getItem(FH_KEY) === '1'; } catch (_) { return fh.state !== 'idle'; } };
  setInterval(() => { const SS = window.SS; if (!SS) return; const now = performance.now();
    if (fh.state === 'idle') { if (SS.running && !fhSeen()) { fh.state = 'shown'; fh.shownAt = now; fh.f0 = SS.frameN | 0; fh.drag0 = (SS.input && SS.input.dragPx) || 0; fh.shots0 = (SS.weapon && SS.weapon.shotsFired) || 0; fhEl.classList.add('show'); try { localStorage.setItem(FH_KEY, '1'); } catch (_) {} } else if (SS.running) fh.state = 'skip'; return; }
    if (fh.state !== 'shown') return;
    const drag = ((SS.input && SS.input.dragPx) || 0) - fh.drag0 >= FH_DRAG_PX, shot = ((SS.weapon && SS.weapon.shotsFired) || 0) > fh.shots0, age = now - fh.shownAt;
    const minOk = age >= FH_MIN_MS && ((SS.frameN | 0) - fh.f0) >= FH_MIN_FRAMES;
    if (!SS.running || (minOk && (drag || shot || age >= FH_MAX_MS))) { fh.state = 'done'; fh.reason = !SS.running ? 'ended' : drag ? 'drag' : shot ? 'fire' : 'timeout'; fh.goneAt = now; fhEl.classList.remove('show'); } }, 200);
    const hud = {
    firstHint: fh,
    setAmmo,
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
    edgeWarn,
    flanked,
    setStance,
    setHealth,
    setScore,
    headshotFlash,
    callout,
    radio,
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
