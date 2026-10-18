const REGEN_DELAY_MS = 3000, REGEN_RATE = 22; // hp/s out of combat
export function createPlayer(camera, input, hud) {
  const player = {
    health: 100,
    alive: true,
  };
  let regenDelay = 0;

  player.damage = function damage(amount, fromPosition) {
    if (!player.alive) return;
    const dmg = Math.max(0, amount || 0);
    player.health = Math.max(0, player.health - dmg); if (player.health < 1) player.health = 0; // m1y: < 1 hp is dead (an 'empty' bar that stayed alive)
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
    regenDelay = 5; lastHitT = performance.now(); // regen starts REGEN_DELAY_MS after the last hit
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
  let lastHitT = -1e9, lastUpd = 0;
  player.lastHitT = () => lastHitT;
  player.update = function update() {
    const now = performance.now(); const rdt = lastUpd ? Math.min(0.5, (now - lastUpd) / 1000) : 0; lastUpd = now;
    if (!player.alive || player.health >= 100) return;
    const engaged = !!(window.SS && (window.SS.engaged | 0) > 0);
    const fighting = engaged || !!(window.SS && window.SS.cover && window.SS.cover.state !== 'none');
    if (fighting) return;
    if (now - lastHitT < REGEN_DELAY_MS) return;
    player.health = Math.min(100, player.health + REGEN_RATE * rdt);
    if (window.SS) window.SS.health = player.health;
    if (hud) hud.setHealth(player.health);
  };

  player.reset = function reset() {
    player.health = 100;
    player.alive = true;
    regenDelay = 0; lastHitT = -1e9; lastUpd = 0;
    if (window.SS) window.SS.health = 100;
    if (hud) hud.setHealth(100);
  };

  return player;
}
