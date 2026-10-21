export function createAudio() {
  let ctx = null;
  let master = null;
  let shotBus = null;
  let windGain = null;
  let unlocked = false, live = false;
  // ?fx=3 only: a lowpass between master and destination, created on the first muffle and left in the chain at 20 kHz.
  const FX3 = (() => { try { return /[?&]fx=3(?:&|$)/.test(location.search); } catch (e) { return false; } })();
  let lp = null;
  let muff = null; // scheduled dip: { t0, wall, f0, f1, rec }
  function go() { live = true; if (master && ctx) { const t = ctx.currentTime; master.gain.cancelScheduledValues(t); master.gain.setValueAtTime(master.gain.value, t); master.gain.linearRampToValueAtTime(0.75, t + 0.25); } }
  function hush() { live = false; if (master && ctx) { const t = ctx.currentTime; master.gain.cancelScheduledValues(t); master.gain.setValueAtTime(master.gain.value, t); master.gain.linearRampToValueAtTime(0, t + 0.05); } } // m1u: Restart is silent until its first frame
  let chatterT = 10;
  let barkT = 9;
  let distantT = 7, approachT = 0;
  let wasBurst = false;

  // m1v: the gesture only creates/resumes the context (cheap); the graph (impulse + noise buffers, ~250k random
  // samples) is built after the 'Starting...' frame painted - building it inside the Play press held that paint back.
  let built = false, buildQueued = false;
  function ensureCtx() {
    if (ctx) return true;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = live ? 0.75 : 0; // m1u: silent until the first run frame is on screen (audio came before the picture)
    master.connect(ctx.destination);
    return true;
  }
  function ensure() {
    if (built) return true;
    if (!ensureCtx()) return false;
    built = true;

    const seconds = 0.85;
    const len = (ctx.sampleRate * seconds) | 0;
    const impulse = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const data = impulse.getChannelData(c);
      for (let i = 0; i < len; i++) {
        const t = i / len;
        data[i] = (Math.random() * 2 - 1) * (1 - t) * (1 - t) * 0.7;
      }
    }
    const conv = ctx.createConvolver();
    conv.buffer = impulse;
    const wet = ctx.createGain();
    wet.gain.value = 0.38;
    conv.connect(wet);
    wet.connect(master);

    const delay = ctx.createDelay(1.0);
    delay.delayTime.value = 0.17;
    const delayGain = ctx.createGain();
    delayGain.gain.value = 0.2;
    const delayFilter = ctx.createBiquadFilter();
    delayFilter.type = 'lowpass';
    delayFilter.frequency.value = 1400;
    delay.connect(delayFilter);
    delayFilter.connect(delayGain);
    delayGain.connect(master);

    shotBus = ctx.createGain();
    shotBus.gain.value = 1;
    shotBus.connect(master);
    shotBus.connect(conv);
    shotBus.connect(delay);

    const noiseLen = ctx.sampleRate * 2;
    const nbuf = ctx.createBuffer(1, noiseLen, ctx.sampleRate);
    const nd = nbuf.getChannelData(0);
    let brown = 0;
    for (let i = 0; i < noiseLen; i++) {
      brown = brown * 0.98 + (Math.random() * 2 - 1) * 0.02;
      nd[i] = brown * 3.2;
    }
    const wind = ctx.createBufferSource();
    wind.buffer = nbuf;
    wind.loop = true;
    const wf = ctx.createBiquadFilter();
    wf.type = 'lowpass';
    wf.frequency.value = 380;
    windGain = ctx.createGain();
    windGain.gain.value = 0.09;
    wind.connect(wf);
    wf.connect(windGain);
    windGain.connect(master);
    wind.start();
    return true;
  }

  function envGain(peak, dur, dest) {
    const g = ctx.createGain();
    const t = ctx.currentTime;
    g.gain.setValueAtTime(Math.max(0.0001, peak), t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    g.connect(dest || master);
    return g;
  }

  function noiseBuffer(dur) {
    const n = Math.max(1, (ctx.sampleRate * dur) | 0);
    const buf = ctx.createBuffer(1, n, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }

  function burst(dur, peak, freq, q, type, dest) {
    if (!ctx) return;
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer(dur);
    const f = ctx.createBiquadFilter();
    f.type = type || 'bandpass';
    f.frequency.value = freq;
    f.Q.value = q == null ? 0.7 : q;
    const g = envGain(peak, dur, dest || master);
    src.connect(f);
    f.connect(g);
    src.start();
  }

  function tone(freq, dur, peak, type, dest) {
    if (!ctx) return;
    const o = ctx.createOscillator();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, ctx.currentTime);
    const g = envGain(peak, dur, dest || master);
    o.connect(g);
    o.start();
    o.stop(ctx.currentTime + dur + 0.02);
    return o;
  }

  function panNode(pan) {
    const p = ctx.createStereoPanner();
    p.pan.value = Math.max(-1, Math.min(1, pan || 0));
    return p;
  }

  function bearing(pos) {
    const cam = window.SS && window.SS.camera;
    if (!cam || !pos) return (Math.random() * 2 - 1) * 0.6;
    const dx = pos.x - cam.position.x;
    const dz = pos.z - cam.position.z;
    const yaw = -cam.rotation.y;
    const right = dx * Math.cos(yaw) + dz * Math.sin(yaw);
    const fwd = dx * Math.sin(yaw) - dz * Math.cos(yaw);
    const len = Math.hypot(right, fwd) || 1;
    return right / len;
  }

  function gunfire() {
    if (!ensure()) return;
    burst(0.07, 0.55, 1600, 0.6, 'bandpass', shotBus);
    burst(0.05, 0.35, 420, 0.5, 'lowpass', shotBus);
    const o = ctx.createOscillator();
    o.type = 'sine';
    const t = ctx.currentTime;
    o.frequency.setValueAtTime(110, t);
    o.frequency.exponentialRampToValueAtTime(42, t + 0.09);
    const g = envGain(0.55, 0.1, shotBus);
    o.connect(g);
    o.start();
    o.stop(t + 0.12);
  }

  function enemyShot(pos) {
    if (!ctx) return;
    const p = panNode(bearing(pos));
    const g = ctx.createGain();
    g.gain.value = 0.28;
    p.connect(g);
    g.connect(master);
    burst(0.11, 0.4, 700, 0.6, 'lowpass', p);
    tone(68, 0.09, 0.12, 'sine', p);
  }

  // m1v: supersonic crack for fire from outside the view (sharp high snap, panned to the shooter's side)
  function crack(pos) {
    if (!ctx) return;
    // m1w: tester heard no crack (a 35 ms >4.2 kHz burst under the enemy report): longer, louder, lower snap + a whizz sweep
    const p = panNode(bearing(pos) * 1.2); const g = ctx.createGain(); g.gain.value = 0.95; p.connect(g); g.connect(master);
    burst(0.06, 0.9, 3000, 1.0, 'highpass', p); burst(0.11, 0.45, 1700, 1.6, 'bandpass', p);
    try { const o = ctx.createOscillator(), og = envGain(0.12, 0.16, p); o.type = 'sawtooth'; o.frequency.setValueAtTime(2600, ctx.currentTime); o.frequency.exponentialRampToValueAtTime(700, ctx.currentTime + 0.16); o.connect(og); o.start(); o.stop(ctx.currentTime + 0.2); } catch (_) {}
    if (window.SS) window.SS.cracks = (window.SS.cracks | 0) + 1;
  }

  // m1x: near = 0..1 (approaching firefight before first contact): louder, brighter, from ahead
  function distantShot(near) {
    if (!ctx) return;
    const n = near == null ? -1 : near;
    const p = panNode(n >= 0 ? (Math.random() * 2 - 1) * (0.5 - 0.3 * n) : (Math.random() * 2 - 1) * 0.85);
    const g = ctx.createGain();
    g.gain.value = n >= 0 ? 0.06 + 0.34 * n : 0.16;
    if (n >= 0) { const g0 = g; p.connect(g0); g0.connect(master); burst(0.12 + 0.08 * n, 0.35, 380 + 1100 * n * n, 0.5, 'lowpass', p); tone(52 + 18 * n, 0.12, 0.08, 'sine', p); return; }
    p.connect(g);
    g.connect(master);
    burst(0.16, 0.35, 480, 0.5, 'lowpass', p);
    tone(52, 0.12, 0.08, 'sine', p);
  }

  function hit() {
    if (!ctx) return;
    tone(1800, 0.04, 0.12, 'square');
    tone(95, 0.11, 0.32, 'sine'); burst(0.05, 0.3, 380, 0.8, 'lowpass'); // m1w: body-hit thud under the tick
  }

  function kill() { // kill confirm: low thump + bright ding
    if (!ctx) return;
    tone(140, 0.12, 0.25, 'sine'); setTimeout(() => tone(1250, 0.12, 0.14, 'triangle'), 40);
  }

  function headshot() {
    if (!ctx) return;
    tone(880, 0.09, 0.16, 'sine');
    const o = ctx.createOscillator();
    o.type = 'sine';
    const t = ctx.currentTime;
    o.frequency.setValueAtTime(1320, t + 0.06);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.setValueAtTime(0.14, t + 0.06);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
    o.connect(g);
    g.connect(master);
    o.start(t + 0.06);
    o.stop(t + 0.24);
  }

  function reload(which) {
    if (!ctx) return;
    if (which === 'end') {
      burst(0.03, 0.22, 2200, 2, 'highpass');
      tone(420, 0.04, 0.08, 'square');
    } else {
      burst(0.025, 0.28, 2800, 3, 'highpass');
      tone(640, 0.03, 0.06, 'square');
    }
  }

  function pickup(kind) { // bright two-note chime (health higher)
    if (!ctx) return;
    const f = kind === 'health' ? 880 : 660;
    tone(f, 0.05, 0.09, 'triangle'); setTimeout(() => ctx && tone(f * 1.5, 0.05, 0.12, 'triangle'), 70);
    burst(0.02, 0.1, 3200, 2, 'highpass');
  }

  function radio() {
    if (!ctx) return;
    const t0 = ctx.currentTime;
    const squelch = ctx.createOscillator();
    squelch.type = 'square';
    squelch.frequency.value = 1900;
    const sg = ctx.createGain();
    sg.gain.setValueAtTime(0.08, t0);
    sg.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.05);
    squelch.connect(sg);
    sg.connect(master);
    squelch.start(t0);
    squelch.stop(t0 + 0.06);
    const bursts = 2 + ((Math.random() * 3) | 0);
    for (let i = 0; i < bursts; i++) {
      const when = 0.06 + i * (0.09 + Math.random() * 0.08);
      const src = ctx.createBufferSource();
      src.buffer = noiseBuffer(0.07);
      const f = ctx.createBiquadFilter();
      f.type = 'bandpass';
      f.frequency.value = 900 + Math.random() * 800;
      f.Q.value = 4;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.setValueAtTime(0.12, t0 + when);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + when + 0.07);
      src.connect(f);
      f.connect(g);
      g.connect(master);
      src.start(t0 + when);
    }
    const end = ctx.createOscillator();
    end.type = 'sine';
    end.frequency.value = 1400;
    const eg = ctx.createGain();
    const et = t0 + 0.45;
    eg.gain.setValueAtTime(0.07, et);
    eg.gain.exponentialRampToValueAtTime(0.0001, et + 0.06);
    end.connect(eg);
    eg.connect(master);
    end.start(et);
    end.stop(et + 0.07);
  }

  function bark() {
    if (!ctx) return;
    const p = panNode((Math.random() * 2 - 1) * 0.7);
    const g = ctx.createGain();
    g.gain.value = 0.18;
    p.connect(g);
    g.connect(master);
    const o = ctx.createOscillator();
    o.type = 'sawtooth';
    const t = ctx.currentTime;
    o.frequency.setValueAtTime(280 + Math.random() * 40, t);
    o.frequency.exponentialRampToValueAtTime(140, t + 0.12);
    const og = ctx.createGain();
    og.gain.setValueAtTime(0.2, t);
    og.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = 900;
    o.connect(f);
    f.connect(og);
    og.connect(p);
    o.start();
    o.stop(t + 0.16);
    const o2 = ctx.createOscillator();
    o2.type = 'sawtooth';
    o2.frequency.setValueAtTime(240, t + 0.16);
    o2.frequency.exponentialRampToValueAtTime(110, t + 0.32);
    const g2 = ctx.createGain();
    g2.gain.setValueAtTime(0.0001, t);
    g2.gain.setValueAtTime(0.16, t + 0.16);
    g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.34);
    o2.connect(f);
    f.connect(g2);
    g2.connect(p);
    o2.start(t + 0.16);
    o2.stop(t + 0.36);
  }

  function unlock() {
    if (!ensureCtx()) return;
    unlocked = true;
    if (ctx.state === 'suspended') ctx.resume();
    if (!built && !buildQueued) { buildQueued = true; requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(ensure, 0))); }
  }

  function ensureMuffle() {
    if (!FX3 || lp) return !!lp;
    if (!ensureCtx()) return false;
    lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.Q.value = 0.707;
    lp.frequency.setValueAtTime(20000, ctx.currentTime);
    try { master.disconnect(ctx.destination); } catch (e) { /* not wired straight through */ }
    master.connect(lp);
    lp.connect(ctx.destination);
    return true;
  }

  function muffElapsed() {
    if (!muff || !ctx) return 0;
    const audioEl = ctx.currentTime - muff.t0;
    if (ctx.state === 'running' && audioEl > 0.01) return audioEl;
    const wallEl = ((typeof performance !== 'undefined' ? performance.now() : Date.now()) - muff.wall) / 1000;
    return Math.max(0, audioEl, wallEl);
  }

  // Value of the lowpass frequency at `el` seconds into the scheduled dip (linear in, exponential back out).
  function muffFreqAt(el) {
    if (!muff) return 20000;
    if (el <= 0) return muff.f0;
    if (el < 0.05) return muff.f0 + (muff.f1 - muff.f0) * (el / 0.05);
    const u = (el - 0.05) / muff.rec;
    if (u >= 1) return 20000;
    return muff.f1 * Math.pow(20000 / muff.f1, u);
  }

  function muffle(strength) {
    if (!FX3) return;
    try {
      if (!ensureMuffle()) return;
      const s = Math.max(0, Math.min(1, +strength || 0));
      const t = ctx.currentTime;
      const f0 = Math.max(30, muff ? muffFreqAt(muffElapsed()) : (lp.frequency.value || 20000));
      const f1 = Math.max(30, 300 + 900 * (1 - s));
      const rec = 1.2 + 1.6 * s;
      muff = { t0: t, wall: (typeof performance !== 'undefined' ? performance.now() : Date.now()), f0, f1, rec };
      lp.frequency.cancelScheduledValues(t);
      lp.frequency.setValueAtTime(f0, t);
      lp.frequency.linearRampToValueAtTime(f1, t + 0.05);
      lp.frequency.exponentialRampToValueAtTime(20000, t + 0.05 + rec);
      if (s > 0.001) {
        const o = ctx.createOscillator();
        o.type = 'sine';
        o.frequency.value = 3200 + Math.random() * 800; // 3.2–4 kHz tinnitus, around the lowpass
        const g = ctx.createGain();
        g.gain.setValueAtTime(Math.max(0.0001, 0.05 * s), t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + rec);
        o.connect(g);
        g.connect(ctx.destination);
        o.start(t);
        o.stop(t + rec + 0.05);
      }
    } catch (e) { /* audio graph not available */ }
  }

  function muffleLevel() {
    if (!lp) return 0;
    let f = muff ? muffFreqAt(muffElapsed()) : 20000;
    try { const live = lp.frequency.value; if (live > 0 && live < f) f = live; } catch (e) { /* keep the schedule */ }
    if (!(f > 0) || f >= 19900) return 0;
    const lo = 300, hi = 20000;
    const clamped = Math.min(hi, Math.max(lo, f));
    const n = Math.log(clamped / lo) / Math.log(hi / lo);
    return Math.max(0, Math.min(1, 1 - n));
  }

  function update(dt) {
    if (!ctx || !unlocked) return;
    const running = !!(window.SS && window.SS.running);
    const bursting = !!(window.SS && window.SS.bursting);
    if (windGain) windGain.gain.value = running && window.SS.walking ? 0.11 : 0.05;
    if (bursting && !wasBurst) radio();
    wasBurst = bursting;
    if (!running) return;
    chatterT -= dt;
    if (chatterT <= 0) {
      chatterT = 16 + Math.random() * 18;
      radio();
    }
    barkT -= dt;
    if (barkT <= 0) {
      barkT = 12 + Math.random() * 20;
      bark();
    }
    distantT -= dt;
    const appr = window.SS.approach; // m1x: opening approach, gunfire up ahead getting closer (synth, short volleys)
    if (appr != null && appr > 0) { approachT -= dt; if (approachT <= 0) { approachT = 2.6 - 1.6 * appr + Math.random() * 1.2;
      const nShots = 1 + Math.floor(Math.random() * (1 + 3 * appr)); for (let i = 0; i < nShots; i++) setTimeout(() => distantShot(appr), i * (90 + Math.random() * 70));
      window.SS.approachShots = (window.SS.approachShots | 0) + nShots; } distantT = Math.max(distantT, 3); }
    else if (distantT <= 0) {
      distantT = 6 + Math.random() * 10;
      distantShot();
    }
  }

  return { go, hush, isLive: () => live, unlock, update, gunfire, enemyShot, crack, hit, kill, headshot, reload, radio, pickup, muffle, muffleLevel };
}
