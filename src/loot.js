// Gjenstander i Diablo-stil (prefiks + base + suffiks) bygget på våpen og rustning fra DoD,
// og gaver mellom etasjene.
import { WEAPONS, ARMORS, HELMETS, SKILL, RANGED_KINDS } from './dod.js';
import { tStr } from './rules.js';

export const RARITY = {
  vanlig: { name: 'Vanlig', color: '#d9d0bf', hex: 0xd9d0bf },
  magisk: { name: 'Magisk', color: '#7d9bff', hex: 0x6d8bff },
  sjelden: { name: 'Sjelden', color: '#f0c850', hex: 0xf0c850 },
  unik: { name: 'Unik', color: '#d88c42', hex: 0xd88c42 },
};

const AMULETS = ['Amulett', 'Talisman', 'Ring', 'Brosje'];

// key 'skill:*' betyr våpenets egen ferdighet
const AFFIXES = [
  { pre: 'Skarp', key: 'dmg', min: 1, max: 3, slots: ['vapen', 'amulett'], desc: v => `+${v} skade` },
  { pre: 'Presis', key: 'skill:*', min: 1, max: 2, slots: ['vapen'], desc: (v, it) => `+${v} ${it?.skill || 'våpenferdighet'}` },
  { pre: 'Mesterlaget', key: 'master', min: 1, max: 1, slots: ['vapen'], desc: () => 'Mesterverk: STY-krav -3, brytvärde +3' },
  { suf: 'av Mester Flansen', key: 'skill:Slagsmål', min: 1, max: 2, slots: ['vapen', 'amulett', 'rustning'], desc: v => `+${v} Slagsmål` },
  { suf: 'av skyggene', key: 'skill:Smyga', min: 1, max: 3, slots: ['rustning', 'amulett', 'hjalm'], desc: v => `+${v} Smyga` },
  { suf: 'av ålen', key: 'skill:Undvika', min: 1, max: 2, slots: ['rustning', 'amulett'], desc: v => `+${v} Undvika` },
  { suf: 'av vaksomhet', key: 'skill:Upptäcka fara', min: 1, max: 3, slots: ['hjalm', 'amulett'], desc: v => `+${v} Upptäcka fara` },
  { suf: 'av dyrkeren', key: 'skill:Fingerfärdighet', min: 1, max: 3, slots: ['amulett'], desc: v => `+${v} Fingerfärdighet` },
  { suf: 'av seighet', key: 'maxKP', min: 2, max: 4, slots: ['rustning', 'amulett', 'hjalm'], desc: v => `+${v} maks KP` },
  { suf: 'av viljen', key: 'maxVP', min: 2, max: 3, slots: ['amulett', 'rustning', 'hjalm'], desc: v => `+${v} maks VP` },
  { suf: 'av vinden', key: 'speed', min: 6, max: 14, slots: ['rustning', 'amulett'], desc: v => `+${v}% fart` },
  { pre: 'Grådig', key: 'leech', min: 1, max: 2, slots: ['vapen', 'amulett'], desc: v => `Helbred ${v} KP ved drap` },
  { suf: 'av Utu', key: 'burn', min: 15, max: 30, slots: ['vapen'], desc: v => `${v}% sjanse for brann` },
  { pre: 'Giftig', key: 'poison', min: 15, max: 30, slots: ['vapen'], desc: v => `${v}% sjanse for gift` },
  { pre: 'Heldig', key: 'drake', min: 1, max: 1, slots: ['vapen', 'amulett'], desc: () => 'Drake på ett trinn til' },
  { pre: 'Herdet', key: 'armor', min: 1, max: 1, slots: ['rustning', 'amulett', 'hjalm'], desc: v => `+${v} rustning` },
  { suf: 'av inspirasjon', key: 'vpOnDrake', min: 1, max: 2, slots: ['vapen', 'amulett'], desc: v => `+${v} VP ved Drake` },
  { suf: 'av trolldom', key: 'skill:school', min: 1, max: 2, slots: ['amulett'], desc: v => `+${v} på magiskolen din` },
];

const r = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = a => a[Math.floor(Math.random() * a.length)];

export function describeMods(mods, item) {
  const lines = [];
  for (const [k, v] of Object.entries(mods || {})) {
    const af = AFFIXES.find(a => a.key === k);
    if (af) { lines.push(af.desc(v, item)); continue; }
    if (k.startsWith('skill:')) { lines.push(`+${v} ${k.slice(6)}`); continue; }
    if (k === 'breadHeal') lines.push(`Brød helbreder +${v}`);
    else if (k === 'kickStun') lines.push('Sparket lammer fienden');
    else if (k === 'thorns') lines.push(`Gir ${v} skade tilbake når du blir truffet`);
    else if (k === 'slow') lines.push(`-${v}% fart`);
  }
  return lines;
}

const FEAT_TXT = { sub: 'smidig', p: 'stikk', s: 'hugg', b: 'kross', top: 'fellende', thr: 'kast', long: 'lang', nopar: 'kan ikke parere', nodb: 'ingen skadebonus' };

function finalize(item) {
  item.lines = [];
  if (item.slot === 'vapen' || item.slot === 'vapen2') {
    const w = item;
    if (w.shield) item.lines.push(`Sköld: pareres med beste STY-närstridsvåpen. Brytvärde ${w.dur}`);
    else {
      const rng = w.range ? `, ${w.range} m` : '';
      item.lines.push(`${tStr(w.dmg)} skade, ${w.skill}${rng}`);
      const fs = (w.f || []).filter(f => FEAT_TXT[f]).map(f => FEAT_TXT[f]);
      item.lines.push(`${w.grip === 2 ? 'Tohånds' : 'Enhånds'}${w.str ? `, STY ${w.str}` : ''}${w.dur ? `, brytvärde ${w.dur}` : ''}${fs.length ? ', ' + fs.join(', ') : ''}`);
    }
    if (w.qty > 1) item.lines.push(`${w.qty} stykker`);
  }
  if (item.slot === 'rustning' || item.slot === 'hjalm') {
    item.lines.push(`Skyddsvärde ${item.armor}${item.bane?.length ? `. Nackdel: ${item.bane.map(b => (b === 'avstand' ? 'avstandsanfall' : b)).join(', ')}` : ''}`);
  }
  if (item.broken) item.lines.push('Trasig: nackdel til den blir reparert');
  item.lines.push(...describeMods(item.mods, item));
  item.value = Math.round(8 + (item.price || 0) * 0.6 + item.lines.length * 10 + (item.rarity === 'sjelden' ? 30 : item.rarity === 'unik' ? 80 : 0));
  return item;
}

export function weaponItem(wid, o = {}) {
  const w = WEAPONS[wid];
  if (!w) return null;
  const item = {
    slot: w.shield ? 'vapen2' : 'vapen', wid, base: w.name, name: o.name || w.name, skill: w.skill || null,
    dmg: w.dmg, grip: w.grip, str: w.str, dur: w.dur, f: [...w.f], kind: w.kind, range: w.range || 0,
    metal: w.metal, shield: !!w.shield, price: w.price || 0, rarity: o.rarity || 'vanlig', mods: { ...(o.mods || {}) },
    qty: o.qty || 1, broken: false, flavor: o.flavor,
  };
  if (item.mods.master) { item.str = Math.max(0, item.str - 3); item.dur += 3; }
  return finalize(item);
}

export function armorItem(aid, o = {}) {
  const a = ARMORS[aid];
  if (!a) return null;
  return finalize({ slot: 'rustning', aid, base: a.name, name: o.name || a.name, armor: a.rating + (o.bonus || 0), bane: [...a.bane], type: a.type, metal: a.metal, price: a.price, rarity: o.rarity || 'vanlig', mods: { ...(o.mods || {}) }, broken: false, flavor: o.flavor });
}

export function helmetItem(hid, o = {}) {
  const h = HELMETS[hid];
  if (!h) return null;
  return finalize({ slot: 'hjalm', hid, base: h.name, name: o.name || h.name, armor: h.rating, bane: [...h.bane], type: 'hjalm', metal: h.metal, price: h.price, rarity: o.rarity || 'vanlig', mods: { ...(o.mods || {}) }, broken: false });
}

export function refinalize(item) { return finalize(item); }

// Belønninger fra oppdrag i Fristaden
export function questAmulet(kind) {
  if (kind === 'martyr') return finalize({ slot: 'amulett', base: 'Minnemynt', name: 'Martyrens minnemynt', rarity: 'unik', mods: { maxVP: 2, 'skill:Upptäcka fara': 2 }, flavor: 'Et mynt med navnet til en falt tornväktare. Syster Jehanne sier at han våker over deg.' });
  return finalize({ slot: 'amulett', base: 'Stein', name: 'Pimpas lykkestein', rarity: 'magisk', mods: { 'skill:Upptäcka fara': 1 }, flavor: 'Den er helt vanlig. Pimpa sier den er magisk.' });
}

// Unike gjenstander. fn: lages som funksjon fordi noen avhenger av hvem du spiller.
const UNIQUES = [
  () => weaponItem('kniv', { name: G_isNebb() ? 'Fars gamle brødkniv' : 'Herr Nansens brødkniv', rarity: 'unik', mods: { dmg: 2, breadHeal: 2, leech: 1 }, flavor: 'Han brukte den til å skjære brød i butikken. Den har sett mer enn du tror.' }),
  () => finalize({ slot: 'amulett', base: 'Ring', name: 'Flansens nebbring', rarity: 'unik', mods: { 'skill:Slagsmål': 3, kickStun: 1, dmg: 1 }, flavor: 'Svømmeføttenes vei er ikke pen. Den virker.' }),
  () => weaponItem('kortsvard', { name: 'Utus solblad', rarity: 'unik', mods: { burn: 45, dmg: 2, 'skill:*': 2 }, flavor: 'Varmt å holde i. Litt for varmt.' }),
  () => armorItem('lader', { name: 'Tornvaktens kappe', bonus: 1, rarity: 'unik', mods: { thorns: 2, maxKP: 3 }, flavor: 'Ordenen ville ha den tilbake. De får vente.' }),
  () => weaponItem('stridsyxa', { name: 'Karad Baturs runøks', rarity: 'unik', mods: { master: 1, drake: 1, 'skill:*': 2 }, flavor: 'Runene på bladet lyser når den nærmer seg orcher.' }),
  () => weaponItem('kortbage', { name: 'Gråtrostens bue', rarity: 'unik', mods: { dmg: 2, vpOnDrake: 2 }, flavor: 'Laget av alveved fra Goiana. Strengen synger.' }),
];
let isNebb = () => false;
const G_isNebb = () => isNebb();
export function setNebbCheck(fn) { isNebb = fn; }

// Hvilke våpen som kan dukke opp. vekt etter dybde
const LOOT_WEAPONS = {
  1: ['kniv', 'dolk', 'kortsvard', 'handyxa', 'litenklubba', 'stav', 'kortspjut', 'slunga', 'kortbage', 'stridsklubba', 'litenskold'],
  3: ['bredsvard', 'sabel', 'lattstridshammare', 'langspjut', 'lattarmborst', 'parerdolk', 'litenskold', 'treudd'],
  4: ['langsvard', 'stridsyxa', 'morgonstjarna', 'tvahandsyxa', 'langbage', 'hillebard', 'storskold', 'tungtarmborst', 'slagslanda'],
};

export function makeItem(depth, opts = {}) {
  const roll = Math.random() + (opts.luck || 0) + depth * 0.03;
  let rarity = roll > 1.12 ? 'sjelden' : roll > 0.7 ? 'magisk' : 'vanlig';
  if (opts.rarity) rarity = opts.rarity;
  if (opts.unique || (Math.random() < 0.03 + depth * 0.01 && !opts.noUnique)) return pick(UNIQUES)();
  const slot = opts.slot || pick(['vapen', 'vapen', 'vapen', 'rustning', 'hjalm', 'amulett']);
  let item;
  if (slot === 'vapen') {
    let pool = [...LOOT_WEAPONS[1]];
    if (depth >= 2) pool.push(...LOOT_WEAPONS[3]);
    if (depth >= 3) pool.push(...LOOT_WEAPONS[4]);
    // smart loot: halvparten av gangene et våpen for en ferdighet du er tränad i
    const pref = opts.prefer || [];
    if (pref.length && Math.random() < 0.5) {
      const p2 = pool.filter(id => pref.includes(WEAPONS[id].skill) || (WEAPONS[id].shield && pref.includes('sköld')));
      if (p2.length) pool = p2;
    }
    item = weaponItem(pick(pool));
  } else if (slot === 'rustning') {
    const tiers = ['lader', 'lader', 'nitlader', 'ringbrynja', 'platrustning'];
    item = armorItem(pick(tiers.slice(0, Math.min(tiers.length, 2 + depth))));
  } else if (slot === 'hjalm') {
    item = helmetItem(depth >= 3 && Math.random() < 0.35 ? 'tunnhjalm' : 'oppenhjalm');
  } else {
    item = { slot: 'amulett', base: pick(AMULETS), mods: {} };
  }
  item.rarity = rarity;
  let n = rarity === 'vanlig' ? 0 : rarity === 'magisk' ? r(1, 2) : 3;
  if (slot === 'amulett' && n === 0) { n = 1; item.rarity = 'magisk'; }
  let pool = AFFIXES.filter(a => a.slots.includes(item.slot === 'vapen2' ? 'vapen' : item.slot));
  if (item.shield) pool = pool.filter(a => a.key !== 'skill:*');
  if (!opts.school) pool = pool.filter(a => a.key !== 'skill:school');
  let pre = null, suf = null;
  for (let i = 0; i < n && pool.length; i++) {
    const af = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
    const scale = 1 + Math.floor((depth - 1) / 2) * 0.5;
    const v = Math.max(af.min, Math.round(r(af.min, af.max) * (af.max > 3 ? 1 : scale)));
    let key = af.key;
    if (key === 'skill:school') key = 'skill:' + opts.school;
    item.mods[key] = (item.mods[key] || 0) + Math.min(v, af.max + Math.floor(depth / 2));
    if (af.pre && !pre) pre = af.pre;
    if (af.suf && !suf) suf = af.suf;
  }
  if (item.mods.master && item.str !== undefined) { item.str = Math.max(0, item.str - 3); item.dur += 3; }
  // intetkjønn (ett svärd, ett spjut) får -t, unntatt adjektiv på -ig og -t
  const neuter = /(svärd|spjut|armborst|läder)$/i.test(item.base);
  const adj = pre ? (neuter && !/(ig|t)$/.test(pre) ? pre + 't' : pre) : '';
  item.name = [adj, adj ? item.base.toLowerCase() : item.base, suf].filter(Boolean).join(' ');
  if (rarity === 'vanlig' && Math.random() < 0.4 && slot !== 'amulett') item.name = (neuter ? 'Rustent ' : 'Rusten ') + item.base.toLowerCase();
  return finalize(item);
}

export function isRanged(item) {
  return !!item && RANGED_KINDS.includes(item.kind);
}

// Gaver mellom etasjene (Hades-inspirert, men fra Ereb Altor). Dette er spillets eget lag, ikke DoD.
export const BOONS = [
  { id: 'utu_glod', src: 'Utu', name: 'Utus glød', desc: 'Treff har 25% sjanse til å sette fyr på fienden.', mods: { burn: 25 } },
  { id: 'utu_morgen', src: 'Utu', name: 'Morgenrøde', desc: 'Drake utløser en ildeksplosjon rundt målet.', flag: 'drakeBlast' },
  { id: 'utu_varme', src: 'Utu', name: 'Solvarme', desc: 'Gjenvinn 1 KP hvert 8. sekund.', flag: 'regen' },
  { id: 'fl_vei', src: 'Mester Flansen', name: 'Svømmeføttenes vei', desc: 'Når du dukker unna, gjør du T6 skade på alle du farer gjennom.', flag: 'dashHit' },
  { id: 'fl_nebb', src: 'Mester Flansen', name: 'Det bistre nebbet', desc: 'Tredje slag i kombinasjonen gjør +T6 og lammer.', flag: 'bitter' },
  { id: 'fl_ynde', src: 'Mester Flansen', name: 'Ingen ynde', desc: '+2 Slagsmål og +1 skade.', mods: { 'skill:Slagsmål': 2, dmg: 1 } },
  { id: 'fl_pust', src: 'Mester Flansen', name: 'Pusteteknikk', desc: 'VP kommer tilbake dobbelt så fort utenfor kamp.', flag: 'breath' },
  { id: 'fl_virvel', src: 'Mester Flansen', name: 'Vingevirvel', desc: 'Tredje slag i kombinasjonen blir en virvel som treffer alle rundt deg.', flag: 'spin' },
  { id: 'far_rabatt', src: 'Far', name: 'Ansatterabatt', desc: 'Butikken tar 40% mindre betalt. Du får 20 silver nå.', flag: 'discount', silver: 20 },
  { id: 'far_niste', src: 'Far', name: 'Matpakke', desc: 'En ekstra legedrikk nå. Drikker helbreder +3.', flag: 'lunch', potion: 1 },
  { id: 'far_overtid', src: 'Far', name: 'Overtid', desc: '+12% fart. Han har løpt ærend hele livet.', mods: { speed: 12 } },
  { id: 'drake_blod', src: 'Draken', name: 'Drakeblod', desc: 'Drake på 1 og 2 for alle slag.', mods: { drake: 1 } },
  { id: 'drake_gull', src: 'Draken', name: 'Gullfeber', desc: '+50% silver og oftere gjenstander.', flag: 'greed' },
  { id: 'demon_pakt', src: 'Demonen', name: 'Demonpakt', desc: '+3 skade på alle treff, men -4 maks KP.', mods: { dmg: 3, maxKP: -4 } },
  { id: 'demon_latter', src: 'Demonen', name: 'Demonens latter', desc: 'Demon er ikke lenger et missöde. Det blir trippel skade i stedet.', flag: 'demonCrit' },
  { id: 'demon_blod', src: 'Demonen', name: 'Blodtørst', desc: 'Helbred 2 KP ved drap, men VP kommer ikke tilbake av seg selv.', flag: 'bloodthirst', mods: { leech: 2 } },
];

export function boonChoices(owned, extra = []) {
  const have = new Set(owned.map(b => b.id));
  const pool = BOONS.filter(b => !have.has(b.id));
  const out = [...extra];
  const usedSrc = new Set(extra.map(e => e.src));
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  // først én fra hver kilde, deretter hva som helst
  for (const b of pool) {
    if (out.length >= 3) break;
    if (!usedSrc.has(b.src)) { out.push(b); usedSrc.add(b.src); }
  }
  for (const b of pool) {
    if (out.length >= 3) break;
    if (!out.includes(b)) out.push(b);
  }
  return out.slice(0, 3);
}

export const SRC_COLOR = {
  Utu: '#ffb347',
  'Mester Flansen': '#7fd4c1',
  Far: '#d9c9a0',
  Draken: '#f0c850',
  Demonen: '#e0483c',
  'Hjältedåd': '#e6d6ff',
};
export { SKILL };
