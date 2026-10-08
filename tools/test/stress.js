// Stresstest: alle yrker, alle nivåer, tilfeldige handlinger
window.stress = (profId, secsPerFloor = 20, seedName = 'x') => {
  const G = window.G;
  const RF = 1 / Math.SQRT2;
  const out = { prof: profId, floors: [], errors: [] };
  // lag tilfeldig rollperson med dette yrket
  let c;
  const R = G.dev;
  let ch;
  for (let i = 0; i < 400; i++) { ch = R.randomChoices(); if (ch.profession === profId) break; }
  ch.name = 'Test ' + profId;
  const sheet = R.buildSheet(ch);
  G.player.setSheet(sheet);
  G.game.startRun();
  // starter i Fristaden: litt tilfeldig rusling, så ned kloakkluken
  if (G.dungeon.isTown) {
    const terr = window.townWander ? window.townWander(8) : null;
    if (terr) out.errors.push('by: ' + terr);
    G.ui.hideScreens();
    G.state = 'play';
    G.game.loadFloor(1);
    G.ui.buildBar();
  }
  out.kin = sheet.kin;
  out.spells = sheet.spells;
  out.weapons = sheet.gear.w;
  out.armor = sheet.gear.a;
  const keys = ['KeyR', 'KeyG', 'KeyT', 'KeyF', 'KeyQ', 'KeyZ', 'ShiftLeft', 'Digit1', 'Space', 'KeyV', 'KeyH', 'KeyE', 'KeyX'];
  for (let depth = 1; depth <= 5; depth++) {
    const P = G.player;
    P.healAll(); // hold liv i testen
    let held = null, heldT = 0;
    const err = window.sim(secsPerFloor, (t, G) => {
      const P = G.player;
      if (P.dead) return;
      // medvetslös: la sekvensen gå, eller reis deg med en hjältepoäng
      if (G.state === 'deathroll' && G.game.ko) {
        if (G.game.ko.done) G.game.koWake();
        else if (Math.random() < 0.05) { P.hjp = Math.max(P.hjp, 1); G.game.koHero(); }
        return;
      }
      if (P.kp < 4 || P.loc.huvud < 2 || P.loc.brost < 2 || P.loc.mage < 2) P.healAll();
      const e = P.nearestEnemy(40);
      const inp = G.input;
      inp.usingTouch = false;
      if (e) {
        G.aim.set(e.pos.x, 0.5, e.pos.z);
        const dx = e.pos.x - P.pos.x, dz = e.pos.z - P.pos.z, dd = Math.hypot(dx, dz) || 1;
        const vx = dx / dd, vz = dz / dd;
        const want = dd > 2 ? 1 : -0.3;
        inp.touchMove.active = true;
        inp.touchMove.x = (vx * RF - vz * RF) * want;
        inp.touchMove.y = -((-vx * RF - vz * RF) * want);
        inp.mouse.down = dd < 6 || Math.random() < 0.3;
        inp.mouse.rdown = Math.random() < 0.1;
      } else { inp.touchMove.active = false; inp.mouse.down = false; }
      if (Math.random() < 0.03) { const k = keys[Math.floor(Math.random() * keys.length)]; inp.pressed.add(k); if (k.startsWith('Key') && 'RGT'.includes(k[3])) { held = k; heldT = Math.random() * 1.2; inp.keys.add(k); } }
      if (held) { heldT -= 1 / 30; if (heldT <= 0) { inp.keys.delete(held); held = null; } }
      if (G.state === 'dialog') G.game.closeShop();
    });
    G.input.touchMove.active = false;
    G.input.mouse.down = false;
    if (err) { out.errors.push(`d${depth}: ${err}`); break; }
    out.floors.push({ depth, kills: G.run.kills, rolls: G.run.rolls, kp: P.kp, psy: P.psy, bleeding: [...P.bleeding], exp: Object.keys(P.exp).length, enemiesLeft: G.enemies.filter(e => !e.dead).length });
    if (depth < 5) {
      try {
        G.state = 'play';
        G.game.descend();
        const b = document.querySelector('#boon-cards .boon');
        b?.click();
        G.game.applyPendingBoon();
        G.ui.hideScreens();
        G.state = 'play';
        G.game.loadFloor(depth + 1);
        G.ui.buildBar();
      } catch (e2) { out.errors.push(`descend ${depth}: ${e2.message}\n${e2.stack}`); break; }
    }
  }
  out.final = { kills: G.run.kills, perfekt: G.run.perfekt || 0, fummel: G.run.fummel || 0, parries: G.run.parries || 0, dodges: G.run.dodges || 0, hjp: G.player.hjp, ko: G.run.ko || 0, boss: G.enemies.some(e => e.def.boss && !e.dead) ? 'lever' : 'død/borte' };
  return out;
};
