// Packning etter Drakar och Demoner: bärförmåga er STY/2 (avrundet opp), +2 med ryggsäck (uv).
// Våpen i hendene, rustning og hjelm som er på, teller ikke. Småsaker teller ikke.
// Over bärförmåga er du överlastad: tregere, og nackdel på Smyga og Undvika (spillets tolkning, uv).
// Legedrikker henger i beltet (fire plasser). Resten ligger i sekken.
import { G } from './state.js';
import { d, rollDice } from './rules.js';
import { RARITY } from './loot.js';

export const OVERLOAD_SLOTS = 4;

// Mat, drikk og annet som kan brukes
export const CONS = {
  brod: { name: 'Brød', icon: 'bread', value: 2, desc: 'Helbreder 2 KP. Mester Flansen regner det som en måltid.', heal: 2, bread: true },
  polse: { name: 'Gåseleverpølse', icon: 'sausage', value: 3, desc: 'Helbreder 4 KP. Det adelen i Kardunien spiser når prestene ikke ser.', heal: 4 },
  fisk: { name: 'Stekt abbor', icon: 'fish', value: 2, desc: 'Helbreder T6 KP.', healDie: 'D6' },
  kanel: { name: 'Kanelbolle', icon: 'bun', value: 2, desc: 'Helbreder 2 KP og gir 1 VP.', heal: 2, vp: 1 },
  legedrikk: { name: 'Legedrikk', icon: 'potion', value: 14, desc: 'Helbreder 2T6 KP. Hører hjemme i beltet.', healDie: '2D6', potion: true },
  trolldrikk: { name: 'Trolldrikk', icon: 'potionvp', value: 10, desc: 'Alle VP tilbake med en gang. Smaker fiolett.', vpAll: true },
  safran: { name: 'Nesten ekte safran', icon: 'saffron', value: 1, desc: 'Gul. Det er det meste man kan si om den.', junk: true },
};

// Verdisaker: tar plass, gjør ingenting, selges i byen
export const VALUABLES = [
  { vid: 'revemynt', name: 'Mynt med revehode', icon: 'coin', value: 8, depth: 1, desc: 'Preget i kloakken. Rødpels betaler med disse.' },
  { vid: 'solvbeger', name: 'Sølvbeger', icon: 'cup', value: 16, depth: 1, desc: 'Bulkete, men ekte sølv.' },
  { vid: 'bergkristall', name: 'Bergkristall', icon: 'crystal', value: 18, depth: 2, desc: 'Klar som is. Dvergene slipte slike til lamper.' },
  { vid: 'rubin', name: 'Rubin', icon: 'gem_r', value: 30, depth: 2, desc: 'Rød som en revepels.' },
  { vid: 'smaragd', name: 'Smaragd', icon: 'gem_g', value: 34, depth: 3, desc: 'Fra gruvene under Karad Batur, sier de.' },
  { vid: 'dvergering', name: 'Dvergering', icon: 'ring', value: 26, depth: 3, desc: 'For stor for en finger. Dvergene bar dem på tommelen.' },
  { vid: 'gullkjede', name: 'Gullkjede', icon: 'chain', value: 42, depth: 4, desc: 'Tung og glatt. Noen savner den.' },
  { vid: 'kronesplint', name: 'Splint av en revekrone', icon: 'crown', value: 70, depth: 5, desc: 'Gull, med tannmerker.' },
];

export function makeValuable(depth) {
  const pool = VALUABLES.filter(v => v.depth <= Math.max(1, depth));
  const w = pool.map(v => 1 + (v.depth >= depth - 1 ? 2 : 0));
  let r = Math.random() * w.reduce((a, b) => a + b, 0);
  let v = pool[0];
  for (let i = 0; i < pool.length; i++) { r -= w[i]; if (r <= 0) { v = pool[i]; break; } }
  return { type: 'val', vid: v.vid, name: v.name, icon: v.icon, value: v.value, desc: v.desc, qty: 1, rarity: v.value >= 40 ? 'sjelden' : v.value >= 25 ? 'magisk' : 'vanlig' };
}

export function makeCons(cid, qty = 1) {
  const c = CONS[cid];
  return { type: 'cons', cid, name: c.name, icon: c.icon, value: c.value, desc: c.desc, qty, rarity: 'vanlig' };
}

export const isGear = e => !!e?.slot;
export const stackKey = e => (e.type === 'cons' ? 'c:' + e.cid : e.type === 'val' ? 'v:' + e.vid : null);

export function bagCap(P) {
  const sty = P.attrs?.STY ?? P.sheet.attrs.STY;
  return Math.ceil(sty / 2) + (P.kit?.has('ryggsack') ? 2 : 0) + (P.mods?.bagCap || 0);
}
export function bagCount(P) { return P.bag.length; }
export function isOverloaded(P) { return P.bag.length > bagCap(P); }
export function hardCap(P) { return bagCap(P) + OVERLOAD_SLOTS; }

// Er det plass? noOverload: bare innenfor bärförmåga (brukes når ting plukkes opp av seg selv)
export function canCarry(P, e, noOverload = false) {
  const k = stackKey(e);
  if (k && P.bag.some(x => stackKey(x) === k)) return true;
  return P.bag.length < (noOverload ? bagCap(P) : hardCap(P));
}

// Legg i sekken. Stabler like ting. Returnerer false hvis det ikke er plass i det hele tatt.
export function addToBag(P, e, quiet = false) {
  const k = stackKey(e);
  if (k) {
    const ex = P.bag.find(x => stackKey(x) === k);
    if (ex) { ex.qty += e.qty || 1; afterChange(P); return true; }
  }
  if (P.bag.length >= hardCap(P)) {
    if (!quiet) { G.fx.float('Sekken er full', P.pos, 'miss'); G.ui.log('Sekken er full. Slipp noe først (I).'); }
    return false;
  }
  if (!e.uid) e.uid = 'i' + Math.random().toString(36).slice(2, 9);
  P.bag.push(e);
  const was = P.overloaded;
  afterChange(P);
  if (!quiet && P.overloaded && !was) G.ui.log(`${P.name} er <b class="c-cond">överlastad</b>: tregere, og nackdel på Smyga og Undvika. Bärförmåga ${bagCap(P)}.`);
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
  P.overloaded = isOverloaded(P);
  P.recalc?.();
  if (G.inv?.isOpen) G.inv.render();
}

// Gi spilleren en gjenstand: tar den på hvis plassen er ledig, ellers i sekken.
// Er sekken full, byttes den med det du har på, og det gamle havner på bakken.
export function giveItem(item, o = {}) {
  const P = G.player;
  if (isGear(item)) {
    const slot = item.slot === 'vapen' && item.shield ? 'vapen2' : item.slot;
    if (!P.equip[slot] && !(slot === 'vapen' && !P.equip.vapen)) { equip(P, item, slot); logGot(item, 'tar på'); return 'equip'; }
    if (slot === 'vapen' && !P.equip.vapen) { equip(P, item, 'vapen'); logGot(item, 'tar'); return 'equip'; }
    if (addToBag(P, item, true)) { logGot(item, 'legger i sekken'); G.fx.float('I sekken', P.pos, 'silver'); return 'bag'; }
    if (o.noDrop) return null;
    G.world.equipItem(item);
    return 'swap';
  }
  if (item.type === 'cons' && item.cid === 'legedrikk') {
    while (item.qty > 0 && P.potions < 4) { P.potions++; item.qty--; }
    if (item.qty <= 0) { G.fx.float('Legedrikk', P.pos, 'heal'); return 'belt'; }
  }
  if (addToBag(P, item)) { G.fx.float(item.qty > 1 ? `${item.name} x${item.qty}` : item.name, P.pos, 'silver'); return 'bag'; }
  return null;
}

function logGot(item, verb) {
  G.ui.log(`${G.player.name} ${verb} <b style="color:${RARITY[item.rarity]?.color || 'var(--parch)'}">${item.name}</b>.`);
  if (item.str && G.player.attrs.STY < item.str) G.ui.log(`${item.name} krever STY ${item.str}. Du får nackdel med det.`);
}

export function equip(P, item, slot) {
  P.equip[slot] = item;
  refreshAfterEquip(P, slot);
}

export function refreshAfterEquip(P, slot) {
  P.recalc();
  if (slot === 'rustning' || slot === 'hjalm') P.buildModel();
  else P.refreshWeaponMeshes();
  G.ui.buildBar?.();
}

// Ta på fra sekken. Det du hadde på, går i sekken.
export function equipFromBag(P, item, want = null) {
  if (!isGear(item)) return false;
  let slot = want || item.slot;
  if (item.shield && slot === 'vapen') slot = 'vapen2';
  if ((slot === 'vapen2') && item.slot !== 'vapen' && item.slot !== 'vapen2') return false;
  if (slot !== 'vapen' && slot !== 'vapen2' && slot !== item.slot) return false;
  if (slot === 'vapen' && item.shield) return false;
  removeFromBag(P, item);
  const old = P.equip[slot];
  P.equip[slot] = item;
  if (old) addToBag(P, old, true);
  refreshAfterEquip(P, slot);
  G.audio.swing?.(2, 0.15);
  return true;
}

export function unequip(P, slot) {
  const it = P.equip[slot];
  if (!it) return false;
  if (P.bag.length >= hardCap(P)) { G.fx.float('Sekken er full', P.pos, 'miss'); return false; }
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
  if (c.vpAll) {
    if (P.vp >= P.maxVP) return 'VP er allerede fulle.';
    P.vp = P.maxVP;
    G.fx.burst('will', P.pos, 20);
    txt = 'Trolldrikk: alle VP tilbake.';
  } else {
    if (P.kp >= P.maxKP && !(c.vp && P.vp < P.maxVP)) return 'Du er mett og hel. Spar den.';
    let n = c.heal || 0;
    if (c.healDie) n = rollDice(c.healDie);
    if (c.bread) n += (P.mods.breadHeal || 0) + (P.tricks?.has('lagamat') ? 2 : 0);
    if (c.potion && P.flags?.has('lunch')) n += 3;
    const got = P.heal(n);
    if (c.vp) P.vp = Math.min(P.maxVP, P.vp + c.vp);
    if (c.bread) P.floorStats.bread = (P.floorStats.bread || 0) + 1;
    G.fx.burst('heal', P.pos, 14);
    txt = `${c.name}: +${got} KP${c.vp ? `, +${c.vp} VP` : ''}.`;
    if (c.potion && P.dying) { P.dying = null; G.game.hideDying(); txt += ' Ikke lenger døende.'; }
  }
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
  head.innerHTML = `Du har <b>${P.silver}</b> silver <span>(du selger${merchant === 'bataar' ? ', bare våpen og rustning' : ''})</span>`;
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
      if (o.say) o.say(o.line ? o.line(e, price) : `${price} silver for ${e.name.toLowerCase()}.`);
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

void d;
