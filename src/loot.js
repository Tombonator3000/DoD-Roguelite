// Gjenstander i Diablo-stil bygget på våpen- og rustningstabellene i DoD91 (Bok II s. 32, Bok III s. 34-37).
// Magiske gjenstander bærer besvärjelser med fast effektgrad, som i Bok III s. 43: FÖRTROLLA VAPEN på våpen,
// SKYDD på rustning, ÖKA i amuletter. Resten (navneprefikser, sjeldenhet, unike ting) er spillets eget lag (uv).
import { WEAPONS, ARMORS, SKILL, RANGED_KINDS, LOC_NAME } from './dod.js';
import { tStr } from './rules.js';

export const RARITY = {
  vanlig: { name: 'Vanlig', color: '#d9d0bf', hex: 0xd9d0bf },
  magisk: { name: 'Magisk', color: '#7d9bff', hex: 0x6d8bff },
  sjelden: { name: 'Sjelden', color: '#f0c850', hex: 0xf0c850 },
  unik: { name: 'Unik', color: '#d88c42', hex: 0xd88c42 },
};

const AMULETS = ['Amulett', 'Talisman', 'Ring', 'Brosje'];

// key 'skill:*' = våpenets egen ferdighet. e: effektgrad (besvärjelsen i gjenstanden).
const AFFIXES = [
  { pre: 'Förtrollad', key: 'forh', min: 1, max: 3, slots: ['vapen'], desc: v => `FÖRTROLLA VAPEN E${v}: +${v} CL og +${v} skade` },
  { pre: 'Mästersmidd', key: 'master', min: 1, max: 1, slots: ['vapen'], desc: () => 'Smidd av en mester: BV +3 og +1 skade' },
  { pre: 'Skarp', key: 'dmg', min: 1, max: 2, slots: ['vapen'], desc: v => `+${v} skade` },
  { suf: 'av Mester Flansen', key: 'skill:Slagsmål', min: 1, max: 3, slots: ['vapen', 'amulett', 'armar'], desc: v => `+${v} Slagsmål` },
  { suf: 'av skyggene', key: 'skill:Smyga', min: 1, max: 3, slots: ['rustning', 'amulett', 'hjalm', 'ben'], desc: v => `+${v} Smyga` },
  { suf: 'av vaksomhet', key: 'skill:Upptäcka fara', min: 1, max: 3, slots: ['hjalm', 'amulett'], desc: v => `+${v} Upptäcka fara` },
  { suf: 'av dyrkeren', key: 'skill:Låsdyrkning', min: 1, max: 3, slots: ['amulett', 'armar'], desc: v => `+${v} Låsdyrkning` },
  { suf: 'av seighet', key: 'kp', min: 1, max: 3, slots: ['rustning', 'amulett'], desc: v => `+${v} totala KP` },
  { suf: 'av viljen', key: 'psy', min: 1, max: 3, slots: ['amulett', 'hjalm'], desc: v => `+${v} PSY` },
  { suf: 'av vinden', key: 'move', min: 1, max: 2, slots: ['ben', 'amulett'], desc: v => `Förflyttning +${v}` },
  { pre: 'Besvärjd', key: 'skydd', min: 1, max: 2, slots: ['rustning', 'hjalm', 'armar', 'ben', 'amulett'], desc: v => `SKYDD E${v}: +${v} abs` },
  { pre: 'Grådig', key: 'leech', min: 1, max: 2, slots: ['vapen', 'amulett'], desc: v => `Helbred ${v} KP når du dreper` },
  { suf: 'av Utu', key: 'burn', min: 15, max: 30, slots: ['vapen'], desc: v => `${v} % sjanse for å sette fyr på målet` },
  { pre: 'Giftig', key: 'poison', min: 15, max: 30, slots: ['vapen'], desc: v => `${v} % sjanse for gift` },
  { pre: 'Heldig', key: 'luck', min: 1, max: 2, slots: ['amulett'], desc: v => `+${v} CL på alle slag` },
  { suf: 'av styrka', key: 'attr:STY', min: 1, max: 2, slots: ['amulett', 'armar'], desc: v => `ÖKA E${v}: STY +${v}` },
  { suf: 'av smidighet', key: 'attr:SMI', min: 1, max: 2, slots: ['amulett', 'ben'], desc: v => `ÖKA E${v}: SMI +${v}` },
  { suf: 'av trolldom', key: 'skill:school', min: 1, max: 2, slots: ['amulett'], desc: v => `+${v} FV i magiskolen din` },
  { pre: 'Lätt', key: 'light', min: 1, max: 1, slots: ['rustning', 'armar', 'ben'], desc: () => 'Halv vekt' },
];

const r = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = a => a[Math.floor(Math.random() * a.length)];

export function describeMods(mods, item) {
  const lines = [];
  for (const [k, v] of Object.entries(mods || {})) {
    const af = AFFIXES.find(a => a.key === k);
    if (af) { lines.push(af.desc(v, item)); continue; }
    if (k.startsWith('skill:')) { lines.push(`+${v} ${k.slice(6)}`); continue; }
    if (k.startsWith('attr:')) { lines.push(`${k.slice(5)} +${v}`); continue; }
    if (k === 'breadHeal') lines.push(`Brød helbreder +${v}`);
    else if (k === 'thorns') lines.push(`Gir ${v} skade tilbake når du blir truffet`);
    else if (k === 'fearless') lines.push('ORÄDD: du slår aldri på Skräcktabellen');
    else if (k === 'kickStun') lines.push('Sparket slår fienden overende');
  }
  return lines;
}

const TYPE_TXT = { p: 'stikk', s: 'hugg', b: 'kross' };
export const SLOT_LABEL = { vapen: 'våpen', vapen2: 'skjold', rustning: 'rustning', hjalm: 'hjälm', armar: 'armskydd', ben: 'benskydd', amulett: 'amulett' };

function finalize(item) {
  item.lines = [];
  if (item.slot === 'vapen' || item.slot === 'vapen2') {
    const w = item;
    const dmg = tStr(w.dmg) + (w.mods?.dmg ? `+${w.mods.dmg}` : '') + (w.mods?.master ? '+1' : '') + (w.mods?.forh ? `+${w.mods.forh}` : '');
    if (w.shield) item.lines.push(`Sköld, BV ${w.dur}. Tar piler for ${(w.covers || []).map(c => LOC_NAME[c].toLowerCase()).join(', ')}`);
    else {
      item.lines.push(`Skada ${dmg}, ${w.skill}${w.ranged ? `, ${w.range} m` : w.thrown ? ', kastes STY rutor' : ''}`);
      item.lines.push(`STY-krav ${w.str}${w.twoOnly || w.ranged ? ', bare to hender' : ''}${w.reach ? `, når ${w.reach} rute${w.reach > 1 ? 'r' : ''} lenger` : ''}${w.dur ? `, BV ${w.dur}` : ''}, ${(w.types || []).map(t => TYPE_TXT[t]).join('/')}`);
    }
    if (w.qty > 1) item.lines.push(`${w.qty} stykker`);
  }
  if (item.covers && !item.shield) {
    const abs = item.abs + (item.mods?.skydd || 0);
    item.lines.push(`Absorbering ${abs} på ${item.covers.map(c => LOC_NAME[c].toLowerCase()).join(', ')}`);
    if (item.clank) item.lines.push('Klirrer: halv CL på Smyga og Klättra');
    else if (item.metal) item.lines.push('Metall: ingen magi, ingen Akrobatik');
    if (item.perception) item.lines.push(`${item.perception} på Upptäcka fara og Finna dolda ting`);
  }
  if (item.broken) item.lines.push('Ødelagt: BV er 0. Må repareres hos smeden.');
  item.lines.push(...describeMods(item.mods, item));
  const kg = itemKg(item);
  if (kg) item.lines.push(`Vekt ${String(kg).replace('.', ',')} kg`);
  const magic = Object.keys(item.mods || {}).length;
  item.value = Math.round((item.price || 20) * 0.6 + magic * 120 + (item.rarity === 'sjelden' ? 300 : item.rarity === 'unik' ? 800 : 0));
  return item;
}

export function itemKg(item) {
  if (!item) return 0;
  let kg = item.kg || 0;
  if (item.mods?.light) kg /= 2;
  return Math.round(kg * (item.qty || 1) * 10) / 10;
}

export function weaponItem(wid, o = {}) {
  const w = WEAPONS[wid];
  if (!w) return null;
  const item = {
    ...w, slot: w.shield ? 'vapen2' : 'vapen', wid, base: w.name, name: o.name || w.name, types: [...(w.types || [])],
    durMax: w.dur, rarity: o.rarity || 'vanlig', mods: { ...(o.mods || {}) }, qty: o.qty || 1, broken: false, flavor: o.flavor,
  };
  delete item.id;
  if (item.mods.master) { item.dur += 3; item.durMax += 3; }
  return finalize(item);
}

export function armorItem(aid, o = {}) {
  const a = ARMORS[aid];
  if (!a) return null;
  const item = { ...a, aid, base: a.name, name: o.name || a.name, covers: [...a.covers], abs: a.abs + (o.bonus || 0), rarity: o.rarity || 'vanlig', mods: { ...(o.mods || {}) }, broken: false, flavor: o.flavor };
  delete item.id;
  return finalize(item);
}
// gamle kall fra 2023-koden
export const helmetItem = armorItem;

export function refinalize(item) { return finalize(item); }

// Belønninger fra oppdrag i Fristaden
export function questAmulet(kind) {
  // hertigens signetring for den som løste Triangeldrama i Edelfara (spillets egen belønning, uv)
  if (kind === 'hertig') return finalize({ slot: 'amulett', base: 'Ring', name: 'Hertigens signetring', rarity: 'unik', kg: 0.05, price: 800, mods: { 'skill:Övertala': 3, 'skill:Upptäcka fara': 2, luck: 1 }, flavor: 'Pharynx\' segl i gull. Folk under hertigs rang pleier å høre etter når de ser den.' });
  if (kind === 'martyr') return finalize({ slot: 'amulett', base: 'Minnemynt', name: 'Martyrens minnemynt', rarity: 'unik', kg: 0.05, price: 200, mods: { psy: 2, 'skill:Upptäcka fara': 2, fearless: 1 }, flavor: 'Et mynt med navnet til en falt tornväktare. Syster Jehanne sier at han våker over deg.' });
  return finalize({ slot: 'amulett', base: 'Stein', name: 'Pimpas lykkestein', rarity: 'magisk', kg: 0.1, price: 5, mods: { luck: 1 }, flavor: 'Den er helt vanlig. Pimpa sier den er magisk.' });
}

// Unike gjenstander. fn: lages som funksjon fordi noen avhenger av hvem du spiller.
const UNIQUES = [
  () => weaponItem('dolk', { name: G_isNebb() ? 'Fars gamle brødkniv' : 'Herr Nansens brødkniv', rarity: 'unik', mods: { dmg: 2, breadHeal: 2, leech: 1 }, flavor: 'Han brukte den til å skjære brød i butikken. Den har sett mer enn du tror.' }),
  () => finalize({ slot: 'amulett', base: 'Ring', name: 'Flansens nebbring', rarity: 'unik', kg: 0.05, price: 400, mods: { 'skill:Slagsmål': 3, 'skill:Quack-fu': 3, kickStun: 1 }, flavor: 'Svømmeføttenes vei er ikke pen. Den virker.' }),
  () => weaponItem('kortsvard', { name: 'Utus solblad', rarity: 'unik', mods: { burn: 45, forh: 2 }, flavor: 'Varmt å holde i. Litt for varmt.' }),
  () => armorItem('laderharnesk', { name: 'Tornvaktens kappe', bonus: 1, rarity: 'unik', mods: { thorns: 2, kp: 2, 'skill:Smyga': 2 }, flavor: 'Ordenen ville ha den tilbake. De får vente.' }),
  () => weaponItem('stridsyxa', { name: 'Karad Baturs runøks', rarity: 'unik', mods: { master: 1, forh: 3 }, flavor: 'Runene på bladet lyser når den nærmer seg orcher.' }),
  () => weaponItem('litenbage', { name: 'Gråtrostens bue', rarity: 'unik', mods: { forh: 2, dmg: 1 }, flavor: 'Laget av alveved fra Goiana. Strengen synger.' }),
];
let isNebb = () => false;
const G_isNebb = () => isNebb();
export function setNebbCheck(fn) { isNebb = fn; }

// Hva som kan dukke opp, etter dybde
const LOOT_WEAPONS = {
  1: ['dolk', 'klubba', 'spikklubba', 'kortsvard', 'kortspjut', 'trastav', 'handyxa', 'kastkniv', 'slunga', 'litenbage', 'targ', 'litenrundskold'],
  2: ['parerdolk', 'korpnabb', 'kroksabel', 'stridsyxa', 'stridshammare', 'kastyxa', 'kastspjut', 'vanligskold', 'kortbage'],
  3: ['hjalmkrossare', 'bredsvard', 'morgonstjarna', 'langspjut', 'stridsgissel', 'treudd', 'langskold', 'lattarmborst'],
  4: ['bastardsvard', 'skaggyxa', 'hillebard', 'tvahandsyxa', 'tvahandssvard', 'storrundskold', 'langbage', 'tungtarmborst'],
};
const LOOT_ARMOR = {
  rustning: [['tygharnesk', 'laderharnesk'], ['nitladerharnesk', 'hardatlader'], ['ringbrynjeskjorta', 'ringbrynja', 'fjallpansar'], ['metallharnesk', 'hauberk', 'helrustning']],
  hjalm: [['tyghuva', 'laderhuva'], ['nitladerhuva'], ['ringbrynjehuva', 'oppenhjalm'], ['tunnhjalm']],
  armar: [['laderarmskydd'], ['nitladerarmskydd'], ['nitladerarmskydd'], ['metallarmskydd']],
  ben: [['laderbenskydd'], ['nitladerbenskydd'], ['brynjehosor'], ['metallbenskydd']],
};

export function makeItem(depth, opts = {}) {
  const roll = Math.random() + (opts.luck || 0) + depth * 0.03;
  let rarity = roll > 1.12 ? 'sjelden' : roll > 0.7 ? 'magisk' : 'vanlig';
  if (opts.rarity) rarity = opts.rarity;
  if (opts.unique || (Math.random() < 0.03 + depth * 0.01 && !opts.noUnique)) return pick(UNIQUES)();
  const slot = opts.slot || pick(['vapen', 'vapen', 'vapen', 'rustning', 'hjalm', 'armar', 'ben', 'amulett']);
  let item;
  if (slot === 'vapen' || slot === 'vapen2') {
    let pool = [];
    for (let i = 1; i <= Math.min(4, depth + 1); i++) pool.push(...LOOT_WEAPONS[i]);
    if (slot === 'vapen2') pool = pool.filter(id => WEAPONS[id].shield);
    // smart loot: halvparten av gangene et våpen du har FV i
    const pref = opts.prefer || [];
    if (pref.length && Math.random() < 0.5) {
      const p2 = pool.filter(id => pref.includes(WEAPONS[id].skill));
      if (p2.length) pool = p2;
    }
    item = weaponItem(pick(pool));
  } else if (LOOT_ARMOR[slot]) {
    const tiers = LOOT_ARMOR[slot];
    const t = Math.min(tiers.length - 1, Math.floor(Math.random() * Math.min(tiers.length, 1 + Math.ceil(depth / 1.5))));
    item = armorItem(pick(tiers[t]));
  } else {
    item = { slot: 'amulett', base: pick(AMULETS), kg: 0.1, price: 50, mods: {} };
  }
  item.rarity = rarity;
  let n = rarity === 'vanlig' ? 0 : rarity === 'magisk' ? r(1, 2) : 3;
  if (slot === 'amulett' && n === 0) { n = 1; item.rarity = 'magisk'; }
  let pool = AFFIXES.filter(a => a.slots.includes(item.slot === 'vapen2' ? 'vapen' : item.slot));
  if (item.shield) pool = pool.filter(a => ['skydd', 'light'].includes(a.key) || a.key.startsWith('skill:'));
  if (item.ranged) pool = pool.filter(a => a.key !== 'master');
  if (!opts.school) pool = pool.filter(a => a.key !== 'skill:school');
  let pre = null, suf = null;
  for (let i = 0; i < n && pool.length; i++) {
    const af = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
    const v = Math.min(af.max, r(af.min, af.max) + (depth >= 4 && af.max <= 3 ? 1 : 0));
    let key = af.key;
    if (key === 'skill:school') key = 'skill:' + opts.school;
    item.mods[key] = Math.min(af.max, (item.mods[key] || 0) + v);
    if (af.pre && !pre) pre = af.pre;
    if (af.suf && !suf) suf = af.suf;
  }
  if (item.mods.master && item.dur != null) { item.dur += 3; item.durMax = (item.durMax || item.dur - 3) + 3; }
  // svensk bøyning: intetkjønn (svärd, spjut, armborst, läder...) får -t
  const neuter = /(svärd|spjut|armborst|harnesk|pansar|läder|armskydd|benskydd)$/i.test(item.base);
  const plural = /(hosor|skydd)$/i.test(item.base);
  const adj = pre ? (plural ? (/(ig|d)$/.test(pre) ? pre + 'a' : pre + 'a') : neuter && !/(ig|t)$/.test(pre) ? pre.replace(/d$/, 't') + (pre.endsWith('d') ? '' : 't') : pre) : '';
  item.name = [adj, adj ? item.base.toLowerCase() : item.base, suf].filter(Boolean).join(' ');
  if (rarity === 'vanlig' && Math.random() < 0.35 && slot !== 'amulett') item.name = (plural ? 'Slitna ' : neuter ? 'Slitet ' : 'Sliten ') + item.base.toLowerCase();
  return finalize(item);
}

export function isRanged(item) {
  return !!item && RANGED_KINDS.includes(item.kind);
}

// Gaver mellom etasjene (Hades-inspirert, men fra Ereb Altor). Spillets eget lag, ikke DoD.
export const BOONS = [
  { id: 'utu_glod', src: 'Utu', name: 'Utus glød', desc: 'Treff har 25 % sjanse til å sette fyr på fienden.', mods: { burn: 25 } },
  { id: 'utu_morgen', src: 'Utu', name: 'Morgenrøde', desc: 'Perfekte slag utløser en ildeksplosjon rundt målet.', flag: 'perfektBlast' },
  { id: 'utu_varme', src: 'Utu', name: 'Solvarme', desc: 'Gjenvinn 1 KP hvert 12. sekund.', flag: 'regen' },
  { id: 'fl_vei', src: 'Mester Flansen', name: 'Svømmeføttenes vei', desc: 'Når du dukker unna, gjør du 1T6 skade på alle du farer gjennom.', flag: 'dashHit' },
  { id: 'fl_nebb', src: 'Mester Flansen', name: 'Det bistre nebbet', desc: 'Tredje slag i kombinasjonen gjør +1T6 og slår fienden overende.', flag: 'bitter' },
  { id: 'fl_ynde', src: 'Mester Flansen', name: 'Ingen ynde', desc: '+3 FV i Slagsmål og stridskonsten din.', mods: { 'skill:Slagsmål': 3, 'skill:konst': 3 } },
  { id: 'fl_pust', src: 'Mester Flansen', name: 'Pusteteknikk', desc: 'PSY kommer dobbelt så fort tilbake utenfor kamp.', flag: 'breath' },
  { id: 'fl_virvel', src: 'Mester Flansen', name: 'Vingevirvel', desc: 'Tredje slag i kombinasjonen blir en virvel som treffer alle rundt deg.', flag: 'spin' },
  { id: 'far_rabatt', src: 'Far', name: 'Ansatterabatt', desc: 'Butikken tar 40 % mindre betalt. Du får 60 silver nå.', flag: 'discount', silver: 60 },
  { id: 'far_niste', src: 'Far', name: 'Matpakke', desc: 'En ekstra legedrikk nå. Legedrikker helbreder +3.', flag: 'lunch', potion: 1 },
  { id: 'far_overtid', src: 'Far', name: 'Overtid', desc: 'Förflyttning +2. Han har løpt ærend hele livet.', mods: { move: 2 } },
  { id: 'drake_blod', src: 'Draken', name: 'Drakeblod', desc: '+2 CL med alle våpen.', mods: { weaponCL: 2 } },
  { id: 'drake_gull', src: 'Draken', name: 'Gullfeber', desc: '+50 % silver og oftere gjenstander.', flag: 'greed' },
  { id: 'demon_pakt', src: 'Demonen', name: 'Demonpakt', desc: '+3 skade på alle treff, men -3 totala KP.', mods: { dmg: 3, kp: -3 } },
  { id: 'demon_latter', src: 'Demonen', name: 'Demonens latter', desc: 'Fummel blir et vanlig bom, og perfekte slag gjør trippel skade.', flag: 'demonLaugh' },
  { id: 'demon_blod', src: 'Demonen', name: 'Blodtørst', desc: 'Helbred 2 KP ved drap, men PSY kommer ikke tilbake av seg selv.', flag: 'bloodthirst', mods: { leech: 2 } },
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
