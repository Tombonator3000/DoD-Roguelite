// Testhjelper: kjør spillogikken i faste tidssteg uten å vente på rendering
window.sim = (sec, fn, dt = 1 / 30) => {
  const G = window.G;
  const n = Math.round(sec / dt);
  let err = null;
  for (let i = 0; i < n; i++) {
    try {
      if (fn) fn(i * dt, G);
      if (G.state !== 'play') { G.input.endFrame(); continue; }
      G.time += dt;
      G.run.clock += dt / 120;
      if (G.game.push) G.game.pushKeys(G.input, dt);
      G.dungeon.computeFlow(G.player.pos.x, G.player.pos.z);
      G.player.update(dt, G.input);
      for (let k = G.enemies.length - 1; k >= 0; k--) if (!G.enemies[k].update(dt)) { G.enemies[k].dispose(); G.enemies.splice(k, 1); }
      G.companion?.update(dt);
      if (G.dungeon.isTown) G.dungeon.update(dt, G.player, G.game.townLights(dt));
      G.world.update(dt, G.camera);
      G.fx.update(dt, G.camera);
      G.ui.update(dt);
      G.input.endFrame();
    } catch (e) { err = e.message + '\n' + e.stack; break; }
  }
  return err;
};
window.placeNear = (e, dist = 5) => {
  const G = window.G;
  for (let k = 0; k < 32; k++) {
    const a = (k / 32) * Math.PI * 2;
    const x = e.pos.x + Math.cos(a) * dist, z = e.pos.z + Math.sin(a) * dist;
    if (G.dungeon.walkable(x, z) && G.dungeon.los(x, z, e.pos.x, e.pos.z)) { G.player.pos.set(x, 0, z); return true; }
  }
  return false;
};
