export function createPlayer(camera, input, hud) {
  const player = {
    health: 100,
    alive: true,
  };
  let regenDelay = 0;

  player.damage = function damage(amount, fromPosition) {
    if (!player.alive) return;
    const dmg = Math.max(0, amount || 0);
    player.health = Math.max(0, player.health - dmg);
    if (window.SS) window.SS.health = player.health;
    if (hud) {
      hud.setHealth(player.health);
      hud.damageVignette(Math.min(1, 0.6 + dmg / 28));
      if (fromPosition && camera) {
        const dx = fromPosition.x - camera.position.x;
        const dz = fromPosition.z - camera.position.z;
        const yaw = input ? input.yaw : 0;
        const forward = dx * Math.sin(yaw) + dz * -Math.cos(yaw);
        const right = dx * Math.cos(yaw) + dz * Math.sin(yaw);
        hud.damageDirection(Math.atan2(right, forward));
      }
    }
    regenDelay = 5; // regen starts 5 s after the last hit
    if (player.health <= 0) {
      player.alive = false;
      if (window.SS) {
        window.SS.running = false;
        window.SS.walking = false;
        if (typeof window.SS.onDeath === 'function') window.SS.onDeath();
      }
    }
  };

  player.update = function update(dt) {
    if (!player.alive || player.health >= 100) return;
    // No mid-fight regen: engaged enemies (or auto-cover during a halt) must be able to kill you.
    const engaged = !!(window.SS && (window.SS.engaged | 0) > 0);
    const fighting = engaged || !!(window.SS && window.SS.cover && window.SS.cover.state !== 'none');
    if (fighting) {
      if (regenDelay > 0) regenDelay -= dt;
      return;
    }
    if (regenDelay > 0) {
      regenDelay -= dt;
      return;
    }
    const inCover = !!(input && (input.cover || (window.SS && window.SS.cover && window.SS.cover.state === 'in')));
    const rate = inCover ? 6 : 4; // light between-wave recover; cover no longer outpaces enemy fire
    player.health = Math.min(100, player.health + rate * dt);
    if (window.SS) window.SS.health = player.health;
    if (hud) hud.setHealth(player.health);
  };

  player.reset = function reset() {
    player.health = 100;
    player.alive = true;
    regenDelay = 0;
    if (window.SS) window.SS.health = 100;
    if (hud) hud.setHealth(100);
  };

  return player;
}
