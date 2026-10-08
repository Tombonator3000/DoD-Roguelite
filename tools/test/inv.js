// Hjelpere for inventaret. Krever sim.js.
window.fillBag = (n = 4) => {
  const G = window.G, P = G.player, I = G.dev.inv;
  const out = [];
  out.push(I.giveItem(G.dev.makeItem(3, { slot: 'vapen', rarity: 'sjelden' })));
  out.push(I.giveItem(G.dev.makeItem(3, { slot: 'rustning', rarity: 'magisk' })));
  out.push(I.giveItem(G.dev.makeItem(3, { slot: 'hjalm' })));
  out.push(I.giveItem(G.dev.makeItem(3, { slot: 'amulett', rarity: 'sjelden' })));
  for (let i = 0; i < n; i++) out.push(I.giveItem(I.makeValuable(1 + i)));
  out.push(I.giveItem(I.makeCons('legedrikk', 3)));
  out.push(I.giveItem(I.makeCons('polse', 2)));
  out.push(I.giveItem(I.makeCons('trolldrikk')));
  return { out, bag: P.bag.map(e => e.name + (e.qty > 1 ? ' x' + e.qty : '')), cap: I.bagCap(P), over: P.overloaded, potions: P.potions };
};
window.startTown = () => { const G = window.G; G.game.startRun(); G.ui.hideScreens(); G.state = 'play'; return window.sim(1); };
window.startFloor = d => { const G = window.G; G.game.startRun(); G.ui.hideScreens(); G.state = 'play'; G.game.loadFloor(d || 1); G.ui.buildBar(); return window.sim(1); };
window.saveTest = () => {
  const G = window.G, P = G.player, out = {};
  G.state = 'pause';
  document.querySelector('#btn-save').click();
  const rowsSave = [...document.querySelectorAll('#saves-list .srow')].map(r => r.dataset.slot + ':' + r.querySelectorAll('button').length);
  out.rowsSave = rowsSave.join(' ');
  document.querySelector('#saves-list [data-slot="1"] [data-do="save"]').click();
  out.after = document.querySelector('#save-msg').textContent;
  out.list = JSON.parse(localStorage.getItem('svartnebb.saves.v1') || '{}');
  out.slots = Object.keys(out.list).map(k => k + '=' + (out.list[k].meta.place) + '/' + (out.list[k].thumb ? out.list[k].thumb.length : 0));
  out.size = (localStorage.getItem('svartnebb.saves.v1') || '').length;
  delete out.list;
  G.game.resume();
  return out;
};
window.waitWipe = () => new Promise(r => { const f = () => (window.G.game.wiping ? setTimeout(f, 100) : r(1)); setTimeout(f, 200); });
