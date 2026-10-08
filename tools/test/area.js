// Hjelpere for områdene i Edelfara. area(id, ankomst, time) starter et løp og laster området.
window.area = (id, arrival = null, hour = 11) => {
  const G = window.G;
  if (!G.run?.t0 || G.state === 'title' || G.state === 'splash') { G.player.setSheet(G.game.selectedSheet()); G.game.startRun(); }
  G.ui.hideScreens(); G.state = 'play';
  G.run.clock = Math.floor(G.run.clock / 24) * 24 + hour;
  G.game.loadArea(id, arrival, { noSave: true });
  G.ui.hideScreens(); G.state = 'play';
  G.dungeon.life?.snapAll?.();
  const e = window.sim ? window.sim(0.6) : null;
  G.game.camTarget.copy(G.player.pos).setY(0.6);
  return e || [id, G.dungeon.L.name, G.enemies.length, G.dungeon.life?.npcs?.length, G.interactables.length].join(' ');
};
// gå til en flis og se deg om
window.at = (tx, ty, sec = 0.6) => { const P = G.player; P.pos.set(tx * 2, 0, ty * 2); P.vel.set(0, 0, 0); const e = window.sim(sec); G.game.camTarget.set(P.pos.x, 0.6, P.pos.z); return e || 'ok'; };
window.its = () => G.interactables.filter(i => i.label).map(i => `${i.label} @${(i.pos.x / 2).toFixed(1)},${(i.pos.z / 2).toFixed(1)}`).join(' | ');
window.useIt = label => { const it = G.interactables.find(i => i.label && i.label.includes(label)); if (!it) return 'fant ikke ' + label; G.player.pos.set(it.pos.x + 0.6, 0, it.pos.z + 0.6); it.onUse?.(it); return [G.state, document.querySelector('#dlg-text')?.textContent.slice(0, 200)]; };
window.ivan = () => JSON.stringify(G.run.ivan);
