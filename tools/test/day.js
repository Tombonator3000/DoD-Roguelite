// Kjører et helt døgn i byen og ser etter folk som står fast
window.dayTest = (hours = 24, dt = 0.2) => {
  const life = G.dungeon.life;
  const stats = {};
  for (const n of life.npcs) stats[n.id] = { walkT: 0, maxWalk: 0, arrivals: 0, spots: new Set() };
  let lastSpot = {};
  const err = window.sim(hours * 120, () => {
    for (const n of life.npcs) {
      const s = stats[n.id];
      if (n.path && !n.arrived && !n.wandering) { s.walkT += dt; s.maxWalk = Math.max(s.maxWalk, s.walkT); }
      else { if (s.walkT > 0) s.arrivals++; s.walkT = 0; }
      if (lastSpot[n.id] !== n.spotName) { s.spots.add(n.spotName); lastSpot[n.id] = n.spotName; }
    }
  }, dt);
  const out = {};
  for (const n of life.npcs) out[n.id] = `${stats[n.id].maxWalk.toFixed(0)}s maks gange, ${stats[n.id].arrivals} ankomster, nå ${n.spotName}${n.arrived ? '' : ' (underveis)'}`;
  return { err, clock: G.run.clock.toFixed(1), out };
};
