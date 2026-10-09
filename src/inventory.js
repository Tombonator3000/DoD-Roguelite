// Packning etter DoD91: du bærer høyst STY kg uten å bli tynget (Bok II s. 5, "Ej mer packning än STY kg").
// Det du har på deg og i hendene teller ikke (uv). Over STY kg er du överlastad: tregere, og -5 på Smyga,
// Akrobatik, Hoppa og Klättra (uv). Høyst 2 x STY kg. Legedrikker henger i beltet (fire plasser).
// Penger er silvermynt (sm). Verdiene her er ganget med 10 fra versjon 0.4.
import { G } from './state.js';
import { rollDice } from './rules.js';
import { RARITY, itemKg } from './loot.js';

export const BELT = 4;
export const POTION_KG = 0.5;

// Mat, drikk og annet som kan brukes
export const CONS = {
  brod: { name: 'Brød', icon: 'bread', value: 20, kg: 0.5, desc: 'Helbreder 2 KP. Mester Flansen regner det som et måltid.', heal: 2, bread: true },
  // mat for et døgn på reise (verdenskartet). Spises av seg selv når du er sulten (uv).
  proviant: { name: 'Proviant', icon: 'ration', value: 15, kg: 0.6, desc: 'Mat for et døgn på reise: tørket kjøtt, hardt brød og ost i en klut. Spises av seg selv når det er tid.', ration: true },
  polse: { name: 'Gåseleverpølse', icon: 'sausage', value: 30, kg: 0.3, desc: 'Helbreder 4 KP. Det adelen i Kardunien spiser når prestene ikke ser.', heal: 4 },
  fisk: { name: 'Stekt abbor', icon: 'fish', value: 20, kg: 0.4, desc: 'Helbreder 1T6 KP.', healDie: 'D6' },
  kanel: { name: 'Kanelbolle', icon: 'bun', value: 20, kg: 0.2, desc: 'Helbreder 2 KP og gir 1 PSY.', heal: 2, psy: 1 },
  legedrikk: { name: 'Legedrikk', icon: 'potion', value: 140, kg: POTION_KG, desc: 'Helbreder 2T6 KP. Hører hjemme i beltet.', healDie: '2D6', potion: true },
  trolldrikk: { name: 'Trolldrikk', icon: 'potionvp', value: 100, kg: 0.3, desc: 'All PSY tilbake med en gang. Smaker fiolett.', psyAll: true },
  safran: { name: 'Nesten ekte safran', icon: 'saffron', value: 10, kg: 0.1, desc: 'Gul. Det er det meste man kan si om den.', junk: true },
};

// Verdisaker: veier litt, gjør ingenting, selges i byen
export const VALUABLES = [
  { vid: 'revemynt', name: 'Mynt med revehode', icon: 'coin', value: 80, kg: 0.05, depth: 1, desc: 'Preget i kloakken. Rødpels betaler med disse.' },
  { vid: 'solvbeger', name: 'Sølvbeger', icon: 'cup', value: 160, kg: 0.4, depth: 1, desc: 'Bulkete, men ekte sølv.' },
  { vid: 'bergkristall', name: 'Bergkristall', icon: 'crystal', value: 180, kg: 0.3, depth: 2, desc: 'Klar som is. Dvergene slipte slike til lamper.' },
  { vid: 'rubin', name: 'Rubin', icon: 'gem_r', value: 300, kg: 0.05, depth: 2, desc: 'Rød som en revepels.' },
  { vid: 'smaragd', name: 'Smaragd', icon: 'gem_g', value: 340, kg: 0.05, depth: 3, desc: 'Fra gruvene under Karad Batur, sier de.' },
  { vid: 'dvergering', name: 'Dvergering', icon: 'ring', value: 260, kg: 0.1, depth: 3, desc: 'For stor for en finger. Dvergene bar dem på tommelen.' },
  { vid: 'gullkjede', name: 'Gullkjede', icon: 'chain', value: 420, kg: 0.2, depth: 4, desc: 'Tung og glatt. Noen savner den.' },
  { vid: 'kronesplint', name: 'Splint av en revekrone', icon: 'crown', value: 700, kg: 0.3, depth: 5, desc: 'Gull, med tannmerker.' },
];

export function makeValuable(depth) {
  const pool = VALUABLES.filter(v => v.depth <= Math.max(1, depth));
  const w = pool.map(v => 1 + (v.depth >= depth - 1 ? 2 : 0));
  let r = Math.random() * w.reduce((a, b) => a + b, 0);
  let v = pool[0];
  for (let i = 0; i < pool.length; i++) { r -= w[i]; if (r <= 0) { v = pool[i]; break; } }
  return { type: 'val', vid: v.vid, name: v.name, icon: v.icon, value: v.value, kg: v.kg, desc: v.desc, qty: 1, rarity: v.value >= 400 ? 'sjelden' : v.value >= 250 ? 'magisk' : 'vanlig' };
}

export function makeCons(cid, qty = 1) {
  const c = CONS[cid];
  return { type: 'cons', cid, name: c.name, icon: c.icon, value: c.value, kg: c.kg, desc: c.desc, qty, rarity: 'vanlig' };
}

export const isGear = e => !!e?.slot;
export const stackKey = e => (e.type === 'cons' ? 'c:' + e.cid : e.type === 'val' ? 'v:' + e.vid : null);

// Vekt for én ting i sekken (gamle lagrede ting uten kg får en standardvekt)
export function kgOf(e) {
  if (!e) return 0;
  if (isGear(e)) return itemKg(e);
  const base = e.kg ?? (e.type === 'cons' ? CONS[e.cid]?.kg : VALUABLES.find(v => v.vid === e.vid)?.kg) ?? 0.2;
  return Math.round(base * (e.qty || 1) * 100) / 100;
}

export function carriedKg(P) {
  let kg = (P.potions || 0) * POTION_KG;
  for (const e of P.bag || []) kg += kgOf(e);
  return Math.round(kg * 10) / 10;
}
export function capKg(P) { return P.attrs?.STY ?? P.sheet.attrs.STY; }
export function hardCapKg(P) { return capKg(P) * 2; }
export function isOverloaded(P) { return carriedKg(P) > capKg(P); }

// Gamle navn som andre moduler fortsatt bruker
export const bagCap = capKg;
export const hardCap = hardCapKg;

// Er det plass? noOverload: bare innenfor STY kg (brukes når ting plukkes opp av seg selv)
export function canCarry(P, e, noOverload = false) {
  const lim = noOverload ? capKg(P) : hardCapKg(P);
  return carriedKg(P) + kgOf(e) <= lim + 1e-6;
}

// Legg i sekken. Stabler like ting. Returnerer false hvis du ikke orker mer.
export function addToBag(P, e, quiet = false) {
  if (!canCarry(P, e)) {
    if (!quiet) { G.fx.float('For tungt', P.pos, 'miss'); G.ui.log(`Du orker ikke bære mer (høyst ${hardCapKg(P)} kg). Slipp noe først (I).`); }
    return false;
  }
  const k = stackKey(e);
  if (k) {
    const ex = P.bag.find(x => stackKey(x) === k);
    if (ex) { ex.qty += e.qty || 1; afterChange(P); return true; }
  }
  if (!e.uid) e.uid = 'i' + Math.random().toString(36).slice(2, 9);
  P.bag.push(e);
  const was = P.overloaded;
  afterChange(P);
  if (!quiet && P.overloaded && !was) G.ui.log(`${P.name} er <b class="c-cond">överlastad</b> (${carriedKg(P)} av ${capKg(P)} kg): tregere, og -5 på Smyga, Akrobatik, Hoppa og Klättra.`);
  return true;
}

export function removeFromBag(P, e, n = null) {
  const i = P.bag.indexOf(e);
  if (i < 0) return null;
  if (stackKey(e) && n != null && e.qty > n) {
    e.qty -= n;
    afterChange(P);
    return { ...e, qty: n, uid: undefined };
  }
  P.bag.splice(i, 1);
  afterChange(P);
  return e;
}

function afterChange(P) {
  P.recalc?.();
  if (G.inv?.isOpen) G.inv.render();
}

// Gi spilleren en gjenstand: tar den på hvis plassen er ledig, ellers i sekken.
// Orker du ikke mer, byttes den med det du har på, og det gamle havner på bakken.
export function giveItem(item, o = {}) {
  const P = G.player;
  if (isGear(item)) {
    const slot = item.shield ? 'vapen2' : item.slot;
    if (!P.equip[slot]) { equip(P, item, slot); logGot(item, 'tar på'); return 'equip'; }
    if (slot === 'vapen' && !P.equip.vapen2 && !item.shield) { equip(P, item, 'vapen2'); logGot(item, 'tar i den andre hånda'); return 'equip'; }
    if (addToBag(P, item, true)) { logGot(item, 'legger i sekken'); G.fx.float('I sekken', P.pos, 'silver'); return 'bag'; }
    if (o.noDrop) return null;
    G.world.equipItem(item);
    return 'swap';
  }
  if (item.type === 'cons' && item.cid === 'legedrikk') {
    while (item.qty > 0 && P.potions < BELT) { P.potions++; item.qty--; }
    if (item.qty <= 0) { P.recalc?.(); G.fx.float('Legedrikk', P.pos, 'heal'); return 'belt'; }
  }
  if (addToBag(P, item)) { G.fx.float(item.qty > 1 ? `${item.name} x${item.qty}` : item.name, P.pos, 'silver'); return 'bag'; }
  return null;
}

function logGot(item, verb) {
  const P = G.player;
  G.ui.log(`${P.name} ${verb} <b style="color:${RARITY[item.rarity]?.color || 'var(--parch)'}">${item.name}</b>.`);
  if (item.str && P.gripOf?.(item) === 0) G.ui.log(`${item.name} krever STY ${item.str}. Med STY ${P.attrs.STY} er det for tungt.`);
  else if (item.str && P.attrs.STY < item.str && !item.ranged && !item.twoOnly) G.ui.log(`${item.name} krever STY ${item.str}. Du må bruke begge hender.`);
}

export function equip(P, item, slot) {
  P.equip[slot] = item;
  refreshAfterEquip(P, slot);
}

export function refreshAfterEquip(P, slot) {
  P.recalc();
  if (slot === 'rustning' || slot === 'hjalm' || slot === 'armar' || slot === 'ben') P.buildModel();
  else P.refreshWeaponMeshes();
  G.ui.buildBar?.();
}

// Ta på fra sekken. Det du hadde på, går i sekken.
export function equipFromBag(P, item, want = null) {
  if (!isGear(item)) return false;
  let slot = want || item.slot;
  if (item.shield && slot === 'vapen') slot = 'vapen2';
  if (slot === 'vapen2' && item.slot !== 'vapen' && item.slot !== 'vapen2') return false;
  if (slot !== 'vapen' && slot !== 'vapen2' && slot !== item.slot) return false;
  if (slot === 'vapen' && item.shield) return false;
  removeFromBag(P, item);
  const old = P.equip[slot];
  P.equip[slot] = item;
  if (old && !addToBag(P, old, true)) G.world.spawnPickup(old.slot ? 'item' : 'entry', P.pos.x + 0.6, P.pos.z, old.slot ? { item: old } : { entry: old });
  refreshAfterEquip(P, slot);
  G.audio.swing?.(2, 0.15);
  return true;
}

export function unequip(P, slot) {
  const it = P.equip[slot];
  if (!it) return false;
  if (!canCarry(P, it)) { G.fx.float('For tungt', P.pos, 'miss'); return false; }
  P.equip[slot] = null;
  addToBag(P, it, true);
  refreshAfterEquip(P, slot);
  return true;
}

export function dropEntry(P, e, fromSlot = null) {
  let item = e;
  if (fromSlot) { item = P.equip[fromSlot]; P.equip[fromSlot] = null; refreshAfterEquip(P, fromSlot); }
  else item = removeFromBag(P, e);
  if (!item) return;
  const a = Math.random() * Math.PI * 2;
  const x = P.pos.x + Math.cos(a) * 0.9, z = P.pos.z + Math.sin(a) * 0.9;
  if (isGear(item)) G.world.spawnPickup('item', x, z, { item });
  else G.world.spawnPickup('entry', x, z, { entry: item });
  G.audio.crunch?.();
  G.ui.log(`${P.name} slipper ${item.name}${item.qty > 1 ? ` x${item.qty}` : ''}.`);
}

// Spis, drikk eller bruk. Returnerer teksten som skal vises.
export function useEntry(P, e) {
  if (e.type !== 'cons') return null;
  const c = CONS[e.cid];
  if (!c || c.junk) return 'Det er ikke noe å bruke den til.';
  let txt = '';
  // et måltid: mat (ikke drikker) holder sulten borte et døgn (verdenskartet, uv)
  const meal = !c.potion && !c.psyAll && (c.heal || c.healDie || c.ration);
  if (c.ration) {
    if (G.run?.world) { G.run.world.fed = G.run.clock; G.run.world.starveT = null; }
    removeFromBag(P, e, 1);
    G.ui.log('Du spiser en dagsranson. Nå holder det et døgn.');
    return 'Proviant: et døgn uten sult.';
  }
  if (c.psyAll) {
    if (P.psy >= P.maxPSY) return 'PSY er allerede full.';
    P.psy = P.maxPSY;
    G.fx.burst('will', P.pos, 20);
    txt = 'Trolldrikk: all PSY tilbake.';
  } else {
    const hurtLoc = P.loc && Object.keys(P.loc).some(l => P.loc[l] < P.locMax[l]);
    if (P.kp >= P.maxKP && !hurtLoc && !(c.psy && P.psy < P.maxPSY)) return 'Du er mett og hel. Spar den.';
    let n = c.heal || 0;
    if (c.healDie) n = rollDice(c.healDie);
    if (c.bread) n += P.mods?.breadHeal || 0;
    if (c.potion && P.flags?.has('lunch')) n += 3;
    const got = P.heal(n);
    if (c.psy) P.gainPSY ? P.gainPSY(c.psy) : (P.psy = Math.min(P.maxPSY, P.psy + c.psy));
    if (c.bread && P.floorStats) P.floorStats.bread = (P.floorStats.bread || 0) + 1;
    G.fx.burst('heal', P.pos, 14);
    txt = `${c.name}: +${got} KP${c.psy ? `, +${c.psy} PSY` : ''}.`;
  }
  if (meal && G.run?.world) { G.run.world.fed = G.run.clock; G.run.world.starveT = null; }
  removeFromBag(P, e, 1);
  G.audio.heal?.();
  G.ui.log(txt);
  return txt;
}

// Pris når du selger. Herr Nansen tar alt, Bataar bare utstyr.
export function sellPrice(e, merchant) {
  const base = isGear(e) ? e.value : e.value * (e.qty || 1);
  if (merchant === 'bataar') return isGear(e) ? Math.max(1, Math.round(base * 0.5)) : 0;
  if (e.type === 'val') return Math.max(1, Math.round(base * 0.85));
  if (e.type === 'cons') return Math.max(1, Math.round(base * 0.5));
  return Math.max(1, Math.round(base * 0.4));
}

export function rarityOf(e) { return RARITY[e.rarity || 'vanlig'] || RARITY.vanlig; }

// Salgsliste i samtalevinduet. merchant: 'nansen' tar alt, 'bataar' bare utstyr.
// mod: prisfaktor (köpslå, rykte). say(text) viser svaret.
export function renderSellList(el, merchant, o = {}) {
  const P = G.player;
  const mod = o.mod ?? 1;
  el.hidden = false;
  el.innerHTML = '';
  const head = document.createElement('div');
  head.className = 'purse';
  head.innerHTML = `Du har <b>${P.silver}</b> sm <span>(du selger${merchant === 'bataar' ? ', bare våpen og rustning' : ''})</span>`;
  el.appendChild(head);
  const rows = P.bag.filter(e => merchant !== 'bataar' || isGear(e));
  if (!rows.length) {
    const r = document.createElement('div');
    r.className = 'ware empty';
    r.textContent = merchant === 'bataar' ? 'Du har ikke noe utstyr i sekken.' : 'Sekken er tom.';
    el.appendChild(r);
  }
  for (const e of rows) {
    const one = stackKey(e) ? { ...e, qty: 1 } : e;
    const price = Math.max(1, Math.round(sellPrice(one, merchant) * mod));
    const row = document.createElement('div');
    row.className = 'ware';
    const col = rarityOf(e).color;
    const desc = isGear(e) ? (e.lines || []).join(', ') : e.desc;
    row.innerHTML = `<div class="ico" data-icon="${e.uid || ''}"></div><div class="txt"><div class="nm" style="color:${col}">${e.name}${e.qty > 1 && !isGear(e) ? ` x${e.qty}` : ''}</div><div class="ds">${desc || ''}</div></div><button class="btn small">Selg ${price}</button>`;
    row.querySelector('button').onclick = () => {
      removeFromBag(P, e, stackKey(e) ? 1 : null);
      P.silver += price;
      G.audio.coin();
      if (o.say) o.say(o.line ? o.line(e, price) : `${price} sm for ${e.name.toLowerCase()}.`);
      renderSellList(el, merchant, o);
    };
    el.appendChild(row);
    G.icons?.fill(row.querySelector('.ico'), e);
  }
  if (o.back) {
    const b = document.createElement('button');
    b.className = 'btn small barter';
    b.textContent = 'Tilbake til varene';
    b.onclick = o.back;
    el.appendChild(b);
  }
}
