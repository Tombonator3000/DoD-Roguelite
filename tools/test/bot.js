// Enkel "fornuftig" spiller for balansetest
window.bot = (sheetFn, secs = 90, floor = 1) => {
  const G = window.G;
  const RF = 1 / Math.SQRT2;
  const sheet = sheetFn();
  G.player.setSheet(sheet);
  G.game.startRun();
  if (floor >= 1) { G.game.loadFloor(floor); G.ui.buildBar(); }
  const P = G.player;
  let deathAt = null;
  window.__bt = null;
  const err = window.sim(secs, (t, G) => {
    if (P.dead) { if (deathAt == null) deathAt = t; return; }
    if (G.state === 'deathroll') { if (deathAt == null) deathAt = t; return; }
    const inp = G.input;
    inp.usingTouch = false;
    inp.mouse.rdown = false;
    if (G.game.push) G.game.acceptPush(null);
    if (P.kp < P.maxKP * 0.3 && P.potions > 0) inp.pressed.add('Digit1');
    // nærmeste fiende langs gangene
    if (!window.__bt || t - window.__bt.t > 0.5 || !window.__bt.e || window.__bt.e.dead) {
      let best = null, bl = 1e9, bp = null;
      for (const x of G.enemies) {
        if (x.dead) continue;
        const straight = x.pos.distanceTo(P.pos);
        if (straight > 40) continue;
        const path = G.dungeon.los(P.pos.x, P.pos.z, x.pos.x, x.pos.z) ? [] : G.dungeon.path(P.pos.x, P.pos.z, x.pos.x, x.pos.z);
        const len = path.length ? path.length * 2 : straight;
        if (len < bl) { bl = len; best = x; bp = path; }
      }
      window.__bt = { t, e: best, path: bp || [] };
    }
    const e = window.__bt.e;
    if (!e) { inp.touchMove.active = false; inp.mouse.down = false; if (P.kp < P.maxKP * 0.6 && !P.floor.stretchRest) inp.pressed.add('KeyH'); return; }
    G.aim.set(e.pos.x, 0.5, e.pos.z);
    const dx = e.pos.x - P.pos.x, dz = e.pos.z - P.pos.z, dd = Math.hypot(dx, dz) || 1;
    let vx = dx / dd, vz = dz / dd;
    const path = window.__bt.path;
    if (path && path.length && !G.dungeon.los(P.pos.x, P.pos.z, e.pos.x, e.pos.z)) {
      while (path.length > 1 && Math.hypot(path[0].x - P.pos.x, path[0].z - P.pos.z) < 1.2) path.shift();
      const wx = path[0].x - P.pos.x, wz = path[0].z - P.pos.z, wl = Math.hypot(wx, wz) || 1;
      vx = wx / wl; vz = wz / wl;
    }
    const w = P.weapon();
    const ranged = ['bow', 'xbow', 'sling'].includes(w.kind);
    const reach = ranged ? 9 : 2.0;
    let want = dd > reach || !G.dungeon.los(P.pos.x, P.pos.z, e.pos.x, e.pos.z) ? 1 : ranged && dd < 5 ? -1 : 0;
    // farlig fiende som lader: dukk eller parer
    const threat = G.enemies.find(x => !x.dead && (x.state === 'windup' || x.state === 'chargeWindup') && x.pos.distanceTo(P.pos) < (x.atk?.r || 3) + 1.2 && x.t > x.windupDur * 0.55);
    if (threat) {
      if (P.parryItem() && !threat.def.monster && Math.random() < 0.5) inp.mouse.rdown = true;
      else { vx = -(threat.pos.x - P.pos.x); vz = -(threat.pos.z - P.pos.z); const l = Math.hypot(vx, vz) || 1; vx /= l; vz /= l; want = 1; inp.pressed.add('Space'); }
    }
    inp.touchMove.active = want !== 0;
    inp.touchMove.x = (vx * RF - vz * RF) * want;
    inp.touchMove.y = -((-vx * RF - vz * RF) * want);
    inp.mouse.down = !threat && dd < reach + 0.5;
    if (Math.random() < 0.01) inp.pressed.add('KeyR');
  });
  G.input.touchMove.active = false;
  G.input.mouse.down = false;
  return { name: sheet.name, prof: sheet.profession, err, died: P.dead, deathAt, kp: `${P.kp}/${P.maxKP}`, kills: G.run.kills, left: G.enemies.filter(x => !x.dead).length, potions: P.potions, dmgTaken: G.run.damageTaken, dodges: G.run.dodges, parries: G.run.parries, pushes: G.run.pushes, conds: Object.keys(P.cond) };
};
window.mk = (prof, kin) => () => { let ch; for (let i = 0; i < 2000; i++) { ch = G.dev.randomChoices(); if (ch.profession === prof && (!kin || ch.kin === kin)) break; } return G.dev.buildSheet(ch); };
