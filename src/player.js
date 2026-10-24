const REGEN_DELAY_MS = 3000, REGEN_RATE = 22; // hp/s out of combat
// A6 tester (HP sat at 5 for ~8 min with enemies alive): regen was switched off for the whole fight (engaged or in cover),
// not reset by unseen hits. Standing rule: health regenerates after time without damage, fights included. Mid-fight it
// starts after FIGHT_DELAY_S game-s (and >= 3 s real) without damage and refills FIGHT_RATE hp per game-s, on the game clock
// so a slow box (game ~10x slower than real) cannot make it free. Out of combat it stays fast (real time).
const FIGHT_DELAY_S = 6, FIGHT_RATE = 4;
export function createPlayer(camera, input, hud) {
  const player = {
    health: 100,
    alive: true,
  };
  let regenDelay = 0;

  player.damage = function damage(amount, fromPosition, source) {
    if (!player.alive) return;
    let dmg = Math.max(0, amount || 0);
    const hp0 = player.health;
    // A26: during an active climax, never take HP below 35 if it was already >= 35 (rifle / grenade / RPG / truck / any source).
    const cx = window.SS && window.SS.climaxState;
    if (cx && cx.phase === 'active' && hp0 >= 35) {
      const cap = Math.max(0, hp0 - 35);
      if (dmg > cap) { dmg = cap; window.SS.climaxHpFloor = (window.SS.climaxHpFloor | 0) + 1; }
    }
    player.health = Math.max(0, player.health - dmg); if (player.health < 1) player.health = 0; // m1y: < 1 hp is dead (an 'empty' bar that stayed alive)
    if (cx && cx.phase === 'active' && hp0 >= 35 && player.health < 35) player.health = 35; // re-clamp after apply
    if (dmg >= 20 && window.SS && window.SS.scoreSys && window.SS.scoreSys.breakStreak) window.SS.scoreSys.breakStreak();
    if (window.SS) window.SS.health = player.health;
    if (hud) {
      hud.setHealth(player.health);
      hud.damageVignette(Math.min(1, 0.6 + dmg / 28));
      if (camera) { if (!fromPosition) { const f = camera.getWorldDirection(camera.position.clone()); fromPosition = camera.position.clone().addScaledVector(f, 5); } // m1u: every hit shows a direction
        const dx = fromPosition.x - camera.position.x;
        const dz = fromPosition.z - camera.position.z;
        const yaw = input ? input.yaw : 0;
        const forward = dx * Math.sin(yaw) + dz * -Math.cos(yaw);
        const right = dx * Math.cos(yaw) + dz * Math.sin(yaw);
        hud.damageDirection(Math.atan2(right, forward));
      }
    }
    if (window.SS && (source === 'rpg' || source === 'rpg-cover')) window.SS.lastRpgHitSim = window.SS.simTime || 0; // A14: flank hits keep a lull after an RPG hit too
    regenDelay = 5; lastHitT = performance.now(); lastHitSim = window.SS ? (window.SS.simTime || 0) : 0; // regen restarts after the delay
    // A6: every HP drop has a visible + audible cue: edge pulse + red flash (damageVignette), arc toward the shooter
    // (damageDirection), camera flinch, hit sound event. SS.hitLog records them so tests can check nothing drops silently.
    const SS = window.SS;
    if (SS && dmg > 0) {
      if (SS.fx && SS.fx.kick) SS.fx.kick('hit', Math.min(1.4, 0.6 + dmg / 25));
      if (SS.audio && SS.audio.hurt) SS.audio.hurt(fromPosition, dmg, source);
      const L = SS.hitLog || (SS.hitLog = []);
      L.push({ t: +(SS.simTime || 0).toFixed(2), hp0: +hp0.toFixed(1), hp: +player.health.toFixed(1), src: source || 'unknown',
        cues: { flash: !!hud, dir: !!(hud && camera), flinch: !!(SS.fx && SS.fx.kick), sound: !!(SS.audio && SS.audio.hurt) } });
      if (L.length > 40) L.shift();
    }
    if (player.health <= 0) {
      player.alive = false;
      if (window.SS) {
        window.SS.running = false; if (window.SS.input && window.SS.input.resetState) window.SS.input.resetState();
        window.SS.walking = false;
        if (typeof window.SS.onDeath === 'function') window.SS.onDeath();
      }
    }
  };

  // m1u (Zack's rule): health regenerates after a while without taking damage. Runs on REAL time (sim dt is capped at
  // low fps, which made regen crawl) and only out of combat; out of combat it refills fast enough to be full or near
  // full by the next contact (a 10-15 m walk between waves is only ~4-5 s).
  let lastHitT = -1e9, lastUpd = 0, lastHitSim = -1e9, lastSim = null;
  player.lastHitT = () => lastHitT;
  player.update = function update() {
    const now = performance.now(); const rdt = lastUpd ? Math.min(0.5, (now - lastUpd) / 1000) : 0; lastUpd = now;
    const sim = window.SS ? (window.SS.simTime || 0) : 0; const sdt = lastSim == null ? 0 : Math.max(0, Math.min(0.5, sim - lastSim)); lastSim = sim;
    if (!player.alive || player.health >= 100) return;
    const engaged = !!(window.SS && (window.SS.engaged | 0) > 0);
    const fighting = engaged || !!(window.SS && window.SS.cover && window.SS.cover.state !== 'none');
    const calm = !!(window.SS && window.SS.bigBeatCalmUntil != null && sim < window.SS.bigBeatCalmUntil);
    if (now - lastHitT < REGEN_DELAY_MS) return;
    let add;
    // A33: during big-beat calm only, fight regen is 1.5× so a Low frame still shows the bar climb. Reverts outside calm.
    // A36: no fight regen while a passive camper is under fire (enemies.js passiveDuck); big-beat calm regen unchanged
    if (fighting && !calm && window.SS && window.SS.passiveDuckSim != null && sim - window.SS.passiveDuckSim < 4) return;
    if (fighting) { if (sim - lastHitSim < FIGHT_DELAY_S) return; add = FIGHT_RATE * (calm ? 1.5 : 1) * sdt; }
    else add = REGEN_RATE * rdt;
    if (!(add > 0)) return;
    const h0 = player.health;
    player.health = Math.min(100, player.health + add);
    if (window.SS && fighting) { window.SS.fightRegen = +((window.SS.fightRegen || 0) + (player.health - h0)).toFixed(2); }
    if (window.SS) window.SS.health = player.health;
    if (hud) hud.setHealth(player.health);
    if (window.SS && calm && player.health > h0) {
      window.SS.regenDuringCalm = true;
      const L = window.SS.regenCalmLog || (window.SS.regenCalmLog = []);
      const prev = L[L.length - 1];
      if (!prev || player.health - prev.hpAfter >= 0.8 || sim - prev.sim >= 0.4) {
        L.push({ sim: +sim.toFixed(2), hpBefore: +h0.toFixed(1), hpAfter: +player.health.toFixed(1), until: +window.SS.bigBeatCalmUntil.toFixed(2) });
        if (L.length > 20) L.shift();
      }
    }
  };

  player.reset = function reset() {
    player.health = 100;
    player.alive = true;
    regenDelay = 0; lastHitT = -1e9; lastUpd = 0; lastHitSim = -1e9; lastSim = null;
    if (window.SS) { window.SS.health = 100; window.SS.regenDuringCalm = false; window.SS.regenCalmLog = []; window.SS.passiveDuckSim = null; window.SS.passiveDuckHits = 0; }
    if (hud) hud.setHealth(100);
  };

  return player;
}
