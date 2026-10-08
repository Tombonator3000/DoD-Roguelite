// Tilfeldig rusling i Fristaden: går, trykker E, snakker, kjøper, sniker og stjeler
window.townWander = (secs = 30, seed = 1) => {
  const G = window.G;
  let s = seed;
  const R = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  const keys = ['KeyE', 'KeyE', 'KeyE', 'ShiftLeft', 'Space', 'KeyQ', 'Mouse0', 'KeyR', 'KeyF', 'KeyV', 'KeyH', 'Digit1', 'KeyZ'];
  const words = ['navn', 'jobb', 'handel', 'rom', 'mat', 'øl', 'rykter', 'safran', 'reven', 'trening', 'elev', 'hela', 'vila', 'helbreder', 'velsignelse', 'almisse', 'leke', 'opptre', 'sang', 'runene', 'døde', 'rotter', 'lære', 'trolldrikk', 'reparere', 'slipe', 'fiske', 'betale', 'vaktstua', 'xyz', 'karad', 'utu', 'shamash', 'farvel'];
  const RF = 1 / Math.SQRT2;
  let dir = [0, 0], dirT = 0;
  const stats = { talks: 0, asks: 0, buys: 0, uses: 0 };
  const err = window.sim(secs, (t, G) => {
    const inp = G.input;
    if (G.state === 'dialog') {
      if (G.talk?.npc || G.talk?.def) {
        if (R() < 0.3) { G.talk.ask(words[Math.floor(R() * words.length)], true); stats.asks++; }
        const btn = [...document.querySelectorAll('#dlg-wares .ware button')].filter(b => !b.disabled);
        if (btn.length && R() < 0.2) { btn[Math.floor(R() * btn.length)].click(); stats.buys++; }
        if (R() < 0.05) G.talk.close();
      } else if (R() < 0.2) G.game.closeShop();
      return;
    }
    if (G.state !== 'play') return;
    dirT -= 1 / 30;
    if (dirT <= 0) { dirT = 0.5 + R() * 2.5; const a = R() * Math.PI * 2; dir = [Math.cos(a), Math.sin(a)]; }
    inp.usingTouch = false;
    inp.touchMove.active = true;
    inp.touchMove.x = (dir[0] * RF - dir[1] * RF);
    inp.touchMove.y = -((-dir[0] * RF - dir[1] * RF));
    if (R() < 0.04) {
      const k = keys[Math.floor(R() * keys.length)];
      if (k === 'KeyE' && G.world.nearInteract) {
        const it = G.world.nearInteract;
        // ikke gå ned i kloakken under testen
        if (it === G.dungeon.life.grateIt) return;
        stats.uses++;
        if (it.kind === 'npc') stats.talks++;
      }
      inp.pressed.add(k);
    }
  });
  G.input.touchMove.active = false;
  if (G.state === 'dialog') { if (G.talk?.def) G.talk.close(); else G.game.closeShop(); }
  window.__townStats = stats;
  return err;
};

// Snakk med alle, spør om alle ord de kan, og kjøp litt av alt
window.talkAll = (maxBuys = 2) => {
  const G = window.G;
  const out = [];
  const life = G.dungeon.life;
  G.player.silver = 99999;
  G.meta.feathers = Math.max(G.meta.feathers || 0, 999);
  for (const n of life.npcs) {
    if (n.hidden || n.mode === 'sleep') { out.push(n.id + ': sover eller er borte'); continue; }
    window.talk(n.id);
    if (G.state !== 'dialog') { out.push(n.id + ': ingen dialog'); continue; }
    if (!G.talk?.def) { out.push(n.id + ': butikk'); G.game.closeShop(); G.state = 'play'; continue; }
    let asked = 0;
    for (const k of Object.keys(n.def.topics)) {
      if (k === 'FARVEL' || !G.talk?.def) continue;
      try { G.talk.ask(k); asked++; } catch (e) { out.push(`${n.id} ${k}: ${e.message}`); }
      const btns = [...document.querySelectorAll('#dlg-wares .ware button')].filter(b => !b.disabled);
      for (const b of btns.slice(0, maxBuys)) { try { b.click(); } catch (e) { out.push(`${n.id} kjøp: ${e.message}`); } }
      const bar = document.querySelector('#dlg-wares .barter');
      if (bar && Math.random() < 0.5) { try { bar.click(); } catch (e) { out.push(`${n.id} köpslå: ${e.message}`); } }
    }
    out.push(`${n.id}: ${asked} ord`);
    if (G.talk?.def) G.talk.close();
    G.state = 'play';
  }
  return out;
};
