// Regelkjerne fra Drakar och Demoner 4.0 (1991):
// - Färdighetsslag: 1T20 lik eller under CL (FV + modifikasjoner) lyktes.
// - Perfekt og fummel: slår du 1, slår du om, og omslaget lik eller under FV er perfekt. Slår du 20, slår du om,
//   og omslaget over FV er fummel. CL under 1 kan ikke bli perfekt. CL 20 eller mer: fummel bare på to 20 på rad.
// - Motståndstabellen: aktiv mot passiv, mål = 10 + aktiv - passiv.
// - Rollpersonen lages med "Ett enklare framslagningssystem" (Bok I s. 32): rasens terninger, EP etter alder.
// Kilde og sidetall: docs/regler/bok1.md og bok2.md.

import {
  ATTRS, ATTR_NAME, SKILLS, SKILL, baseChance, RACE, PROF, PROFESSIONS, RACES, AGE, AGES, WEAPONS, WEAPON_GROUPS, KONSTER, konstCost,
  SPELLS, spellBaseCost, special, skadebonus, forflyttning, locKP, fvCost, APPEARANCE, AIDNE, standOf, moneyOf,
} from './dod.js';

export const ATTR = ATTR_NAME;

export function d(n) {
  return 1 + Math.floor(Math.random() * n);
}
export const pick = a => a[Math.floor(Math.random() * a.length)];

// "D8", "2D6", "D4+1", "3D6-2", "D10+D4". T og D betyr det samme.
function terms(expr) {
  return String(expr || '').toUpperCase().replace(/T/g, 'D').replace(/\s+/g, '').replace(/-/g, '+-').split('+').filter(Boolean);
}
export function rollDice(expr) {
  if (!expr) return 0;
  let total = 0;
  for (const p of terms(expr)) {
    const neg = p.startsWith('-');
    const q = neg ? p.slice(1) : p;
    const m = q.match(/^(\d*)D(\d+)$/);
    let v = 0;
    if (m) { const n = m[1] ? parseInt(m[1]) : 1; for (let i = 0; i < n; i++) v += d(parseInt(m[2])); }
    else v = parseInt(q) || 0;
    total += neg ? -v : v;
  }
  return total;
}
export function diceAvg(expr) {
  let total = 0;
  for (const p of terms(expr)) {
    const neg = p.startsWith('-');
    const q = neg ? p.slice(1) : p;
    const m = q.match(/^(\d*)D(\d+)$/);
    const v = m ? (m[1] ? parseInt(m[1]) : 1) * (parseInt(m[2]) + 1) / 2 : parseInt(q) || 0;
    total += neg ? -v : v;
  }
  return total;
}
export function diceMax(expr) {
  let total = 0;
  for (const p of terms(expr)) {
    const neg = p.startsWith('-');
    const q = neg ? p.slice(1) : p;
    const m = q.match(/^(\d*)D(\d+)$/);
    const v = m ? (m[1] ? parseInt(m[1]) : 1) * parseInt(m[2]) : parseInt(q) || 0;
    total += neg ? -v : v;
  }
  return total;
}
// Bokstil: "2T6+1"
export const tStr = expr => String(expr || '').toUpperCase().replace(/D/g, 'T');

export function shuffle(a) {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

/**
 * Färdighetsslag mot CL (Bok I s. 37).
 * @param {number} cl chans att lyckas (FV + modifikasjoner)
 * @param {number} fv färdighetsvärdet (omslaget for perfekt og fummel sammenlignes med FV, ikke CL)
 */
export function clRoll(cl, fv = cl) {
  cl = Math.round(cl);
  const r = d(20);
  let r2 = null, success = false, perfekt = false, fummel = false;
  if (cl < 1) {
    if (fv >= 1 && r === 1) success = true;
    else if (r === 1) { r2 = d(20); success = r2 === 1; }
    if (r === 20) fummel = true;
  } else if (cl <= 19) {
    if (r === 1) { success = true; r2 = d(20); perfekt = r2 <= fv; }
    else if (r === 20) { r2 = d(20); fummel = r2 > fv; }
    else success = r <= cl;
  } else {
    if (r === 1) { success = true; perfekt = true; }
    else if (r === 2) { success = true; r2 = d(20); perfekt = r2 <= fv; }
    else if (r === 20) { r2 = d(20); fummel = r2 === 20; }
    else success = true;
  }
  return { r, r2, cl, fv, success, perfekt, fummel, diff: cl - r };
}

// Motståndstabellen: aktiv mot passiv (eller grundegenskap mot svårighetsgrad)
export function resist(active, passive) {
  const target = 10 + active - passive;
  if (target >= 20) return { auto: true, success: true, target, r: null };
  if (target <= 0) return { auto: true, success: false, target, r: null };
  const r = d(20);
  return { success: r <= target, target, r, diff: target - r };
}
export const attrRoll = (value, sg = 10) => resist(value, sg);

// Avledede verdier (Bok I s. 24-25)
export function totalKP(attrs) { return Math.ceil(((attrs.FYS || 0) + (attrs.STO || 0)) / 2); }
export function derived(attrs, raceId, mods = {}) {
  let kp = totalKP(attrs);
  if (mods.kpMul) kp = Math.floor(kp * mods.kpMul);
  return {
    kp,
    loc: locKP(kp),
    sb: skadebonus((attrs.STY || 0) + (attrs.STO || 0)),
    move: Math.max(1, forflyttning((attrs.STO || 0) + (attrs.FYS || 0) + (attrs.SMI || 0)) + (RACE[raceId]?.move || 0) + (mods.move || 0)),
  };
}

// --- Rollpersonen ------------------------------------------------------------------

export function rollRaceAttrs(raceId) {
  const r = RACE[raceId] || RACE.manniska;
  const out = {};
  for (const k of ATTRS) out[k] = rollDice(r.dice[k]);
  return out;
}
export function raceMax(raceId) {
  const r = RACE[raceId] || RACE.manniska;
  const out = {};
  for (const k of ATTRS) out[k] = diceMax(r.dice[k]);
  return out;
}
export function meetsReq(attrs, profId) {
  const p = PROF[profId];
  return !p || Object.entries(p.req).every(([k, v]) => (attrs[k] || 0) >= v);
}
export function applyAge(raw, ageId, raceId) {
  const age = AGE[ageId] || AGE.mogen;
  const mods = raceId === 'alv' ? {} : age.mods;
  const out = {};
  for (const k of ATTRS) out[k] = Math.max(1, (raw[k] || 10) + (mods[k] || 0));
  return out;
}
export function startEP(ageId, raceId) {
  if (raceId === 'alv') return 150;
  return (AGE[ageId] || AGE.mogen).ep + 25 - (RACE[raceId]?.bp || 0);
}
export function maxStartFV(ageId, raceId) { return raceId === 'alv' ? 15 : (AGE[ageId] || AGE.mogen).maxFV; }

// Grunnkostnad per FV-trinn (Bok I s. 29). sheetLike: { yrke, specialFx, kin }.
export function baseCost(id, sheetLike) {
  const sk = SKILL[id];
  const yrke = sheetLike.yrke || [];
  const fx = sheetLike.specialFx || {};
  if (SPELLS[id]) return spellBaseCost(SPELLS[id].sv);
  if (fx.cost?.[id]) return fx.cost[id];
  if (sk?.type === 'konst') return konstCost(id) + (yrke.includes(id) || yrke.includes('Stridskonster') ? 0 : 2);
  // Geologi er primär for dvärgar (Bok I s. 11)
  if (sk?.type === 'prim' || (id === 'Geologi' && sheetLike.kin === 'dvarg')) return 2;
  if (yrke.includes(id)) return 3;
  if (fx.secCost) return fx.secCost;
  return 5;
}

// Läsa/Skriva modersmål: BC etter socialt stånd og INT (Bok I s. 42)
function readBC(stand, int) {
  const hi = int >= 15;
  if (stand >= 17) return hi ? 20 : 16;
  if (stand >= 12) return hi ? 16 : 11;
  if (stand >= 8) return hi ? 11 : 5;
  if (stand >= 5) return hi ? 5 : 1;
  return hi ? 1 : 0;
}

// Magiskoler er förbjudna färdigheter for alle unntatt magiker og utbygdsjägare med Animism (Bok I s. 11)
export function forbidden(id, profId) {
  if (SKILL[id]?.type !== 'magi') return false;
  return !(PROF[profId]?.magic || (profId === 'utbygdsjagare' && id === 'Animism'));
}

// Kan start-EP brukes på ferdigheten? Primära, yrkesfärdigheter, stridskonsten og (for magiker) besvärjelser.
// Sekundære ferdigheter fra ras eller särskild förmåga har man, men de kan ikke høynes ved start (Bok I s. 28-30).
export function canBuy(id, c) {
  if (SPELLS[id]) return !!PROF[c.profession]?.magic;
  const s = SKILL[id];
  if (!s) return false;
  const yrke = c.yrke || [];
  if (s.type === 'prim') return true;
  if (id === 'Geologi' && c.kin === 'dvarg') return true;
  if (s.type === 'konst') return c.konst === id && yrke.includes('Stridskonster');
  return yrke.includes(id);
}

// Särskilda förmågor der spilleren må velge noe (Bok I s. 25-26)
export function specialKind(n) {
  const fx = n ? special(n).fx : {};
  if (fx.anySek === 3) return 'hobby';
  if (fx.anySek) return 'sek';
  if (fx.anySkill) return 'skill';
  if (fx.weaponFV) return 'weapon';
  if (fx.attrs) return 'attrs';
  if (fx.extraPicks) return 'extra';
  return null;
}
// Ferdighetene man kan velge for en slik förmåga. Aldri förbjudna färdigheter.
export function specialOptions(kind, c) {
  return SKILLS.filter(s => {
    if (s.type === 'konst' || forbidden(s.id, c.profession)) return false;
    if (kind === 'weapon') return s.type === 'vap';
    if (kind === 'sek' || kind === 'hobby') return s.type !== 'prim';
    if (kind === 'skill') return s.id !== 'Tala modersmål';
    return false;
  }).map(s => s.id);
}

// Stridskonst som passer rasen og yrket (Gigant s. 37)
export function defaultKonst(c) { return c.kin === 'anka' ? 'Quack-fu' : c.profession === 'munk' ? 'Tanno-tekniken' : 'Stjärnnäven'; }

// Slagene i "Ett enklare framslagningssystem" (Bok I s. 32). dice: terningene, total: summen.
const sum = a => a.reduce((s, x) => s + x, 0);
// Särskild förmåga: 2T20 + 1T10
export function rollSpecial() { const dice = [d(20), d(20), d(10)]; return { dice, total: sum(dice) }; }
// Svärdshand: 2T4. Viser de det samme, slås 1T4 til, og igjen så lenge den nye viser det samme.
export function rollHand() {
  const dice = [d(4), d(4)];
  if (dice[0] === dice[1]) for (let i = 0; i < 30; i++) { const x = d(4); dice.push(x); if (x !== dice[0]) break; }
  return { dice, total: sum(dice) };
}
// Socialt stånd: 2T6. Viser de det samme, slås 2T6 til, og igjen så lenge de to nye også er like.
export function rollStand() {
  const dice = [d(6), d(6)];
  for (let i = 0; i < 30 && dice[dice.length - 1] === dice[dice.length - 2]; i++) dice.push(d(6), d(6));
  return { dice, total: sum(dice) };
}
// Startkapital: slås som socialt stånd, men blir aldri mer enn 10 under eller over det.
export function clampMoney(raw, stand) { return stand == null ? raw : Math.max(stand - 10, Math.min(stand + 10, raw)); }
export function rollMoney(stand) {
  const r = rollStand();
  return { dice: r.dice, raw: r.total, total: clampMoney(r.total, stand) };
}

// Startbonus på grundegenskaper fra Höjd grundegenskap: tre ulike +1, eller samme to ganger for +2
function specialAttrBonus(attrs, c, fx) {
  if (!fx.attrs) return;
  for (const k of (c.specialAttrs?.length ? c.specialAttrs : ['SMI', 'FYS', 'PSY'])) attrs[k] = (attrs[k] || 0) + 1;
}

// Startverdier: BC i primære ferdigheter og yrkesfärdigheter, rasbonus og särskild förmåga.
export function baseSkills(c, attrs) {
  const race = RACE[c.kin] || RACE.manniska;
  const yrke = new Set(c.yrke || []);
  const stand = c.stand || 6;
  const out = {};
  for (const s of SKILLS) {
    // Tala modersmål: överklass og adel FV 20, ellers 16 (Bok I s. 44)
    if (s.id === 'Tala modersmål') { out[s.id] = stand >= 17 ? 20 : 16; continue; }
    if (s.id === 'Läsa/Skriva modersmål') { out[s.id] = readBC(stand, attrs.INT || 0); continue; }
    const known = s.type === 'prim' || yrke.has(s.id) || (s.type === 'konst' && c.konst === s.id && yrke.has('Stridskonster'));
    if (known) out[s.id] = baseChance(attrs[s.attr]);
  }
  // Känna magi er primär for magiker (Bok I s. 51)
  if (PROF[c.profession]?.magic) out['Känna magi'] = baseChance(attrs.PSY);
  for (const [k, v] of Object.entries(race.skillBonus || {})) {
    if (v === 'B5') out[k] = 20;
    else out[k] = (out[k] || 0) + v;
  }
  if (c.konst && out[c.konst] == null) out[c.konst] = 0;
  const fx = c.special ? special(c.special).fx : {};
  for (const [k, v] of Object.entries(fx.skill || {})) out[k] = (out[k] || 0) + v;
  for (const [k, v] of Object.entries(fx.setSkill || {})) out[k] = Math.max(out[k] || 0, v);
  const sk = c.specialSkill;
  if (sk && SKILL[sk] && !forbidden(sk, c.profession)) {
    if (fx.anySek === 3) out[sk] = Math.max(out[sk] || 0, 3);
    else if (fx.anySek || fx.anySkill || fx.weaponFV) out[sk] = (out[sk] || 0) + (fx.anySek || fx.anySkill || fx.weaponFV);
  }
  return out;
}

// Alt som regnes ut fra valgene: grundegenskaper, FV, besvärjelser og EP. buildSheet og skapingen bruker den.
// base: FV før EP. bought: FV kjøpt for EP (det som faktisk ble betalt). EP brukes i rekkefølgen i c.buys.
export function startValues(c) {
  const prof = PROF[c.profession] || PROF.krigare;
  const attrs = applyAge(c.rolled || c.rawAttrs || rollRaceAttrs(c.kin), c.age, c.kin);
  const sp = c.special ? special(c.special) : null;
  const fx = sp?.fx || {};
  specialAttrBonus(attrs, c, fx);
  const draft = { yrke: c.yrke || [], specialFx: fx, kin: c.kin };
  const base = baseSkills(c, attrs);
  const skills = { ...base };
  const maxFV = maxStartFV(c.age, c.kin);
  const ep = startEP(c.age, c.kin);
  // Hängiven student hever også taket med 2 for ferdigheten
  const capOf = id => maxFV + (fx.anySkill && c.specialSkill === id ? fx.anySkill : 0);
  const bought = {};
  let spent = 0;
  for (const [id, want] of Object.entries(c.buys || {})) {
    if (skills[id] == null || SPELLS[id] || !canBuy(id, c)) continue;
    const from = skills[id];
    const to = Math.min(capOf(id), Math.max(from, want));
    const cost = fvCost(from, to, baseCost(id, draft));
    if (to <= from || spent + cost > ep) continue;
    spent += cost;
    skills[id] = to;
    bought[id] = to;
  }
  const school = prof.magic ? (c.school || 'Elementarmagi') : (prof.id === 'utbygdsjagare' && c.yrke?.includes('Animism') ? 'Animism' : null);
  const spells = {};
  // Bare magiker lærer besvärjelser fra start. Utbygdsjägare lærer dem senere (Bok I s. 22).
  if (prof.magic) {
    for (const [id, s] of Object.entries(c.spells || {})) {
      const sd = SPELLS[id];
      // Allmänna regnes til skolen der man har høyest FV (Bok III s. 4)
      if (!sd || (sd.school !== school && sd.school !== 'Allmän') || (skills[school] || 0) < sd.sv) continue;
      const to = Math.min(maxFV, Math.max(1, s));
      const cost = fvCost(0, to, spellBaseCost(sd.sv));
      if (spent + cost > ep) continue;
      spent += cost;
      spells[id] = to;
    }
    // Magikeren har Känna magi og Kunskap om magi minst lik FV i skolen (Bok I s. 51)
    skills['Känna magi'] = Math.max(skills['Känna magi'] || 0, skills[school] || 0);
    skills['Kunskap om magi'] = Math.max(skills['Kunskap om magi'] || 0, skills[school] || 0);
  }
  return { attrs, base, skills, bought, spells, school, ep, spent, maxFV, capOf, draft, special: sp };
}

// Bygg et ferdig rollformulär fra valgene. c.buys = { ferdighet: ønsket FV }, c.spells = { id: S }.
export function buildSheet(c) {
  if (!c.rolled) c = { ...c, rolled: c.rawAttrs || rollRaceAttrs(c.kin) };
  const race = RACE[c.kin] || RACE.manniska;
  const prof = PROF[c.profession] || PROF.krigare;
  const v = startValues(c);
  const sp = v.special;
  const sheet = {
    v: 2, rules: 'dod91',
    id: c.id || 'rp' + Math.floor(Math.random() * 1e9).toString(36),
    name: c.name || pick([...race.names, ...(race.ereb || [])]),
    kin: c.kin, profession: c.profession, age: c.age || 'mogen', sex: c.sex || null,
    rolled: { ...c.rolled }, attrs: v.attrs,
    special: sp ? { n: c.special, name: sp.name, text: sp.text, fx: sp.fx, skill: c.specialSkill || null, attrs: c.specialAttrs || null } : null,
    hand: handOf(c.hand || 2, sp), stand: standOf(c.stand || 6), standRoll: c.stand || 6,
    yrke: [...(c.yrke || [])], skills: v.skills, spells: v.spells, school: v.school,
    konst: c.konst || null, ability: prof.ability,
    gear: (k => ({ w: [...k.w], a: [...k.a], g: [...k.g] }))(kitOf(c, v.attrs.STY)),
    // alver regnes som unge for startkapitalet (Bok I s. 28)
    silver: c.silver ?? Math.round(moneyOf(c.money || 6) * (c.kin === 'alv' ? 1 : AGE[c.age]?.money || 1)),
    epTotal: v.ep, epSpent: v.spent, epLeft: v.ep - v.spent,
    appearance: c.appearance ?? null, aidne: c.aidne ?? null,
    choices: JSON.parse(JSON.stringify({ ...c, rules: 'dod91' })),
  };
  return sheet;
}

function handOf(n, sp) {
  if (sp?.fx?.hand) return sp.fx.hand;
  return n >= 19 ? 'ambidextrios' : n >= 15 ? 'dubbelhant' : n >= 12 ? 'vanster' : 'hoger';
}

// Effektivt FV med et våpen: eget FV, eller minst halvparten av høyeste FV i samme vapengrupp (Bok I s. 60)
export function weaponFV(skills, w) {
  if (!w) return skills['Slagsmål'] || 0;
  if (w.unarmed || w.skill === 'Slagsmål') return skills['Slagsmål'] || 0;
  const own = skills[w.skill] || 0;
  let best = 0;
  for (const x of Object.values(WEAPONS)) if (x.group === w.group && skills[x.skill] > best) best = skills[x.skill];
  return Math.max(own, Math.floor(best / 2));
}

// Prioriteter når EP fordeles av seg selv (tilfeldig rollperson og "Fordel EP")
const PRIORITY = {
  bard: ['Spela instrument', 'Sjunga', 'Övertala', 'Dolk', 'Akrobatik', 'Upptäcka fara', 'Smyga'],
  helare: ['Läkekonst', 'Första hjälpen', 'Trästav', 'Örtkunskap', 'Upptäcka fara'],
  krigare: ['@vapen', '@vapen2', 'Upptäcka fara', 'Bärsärkagång', 'Dra vapen', 'Två vapen', 'Slagsmål'],
  lardman: ['Kunskap om magi', 'Historia', 'Tala främmande språk', 'Dolk', 'Upptäcka fara', 'Finna dolda ting'],
  lonnmordare: ['@vapen', 'Smyga', '@konst', 'Låsdyrkning', 'Gömma sig', 'Upptäcka fara', 'Akrobatik'],
  magiker: ['@school', 'Känna magi', 'Upptäcka fara', 'Trästav'],
  munk: ['@konst', 'Trästav', 'Läkekonst', 'Upptäcka fara', 'Smyga'],
  sjofarare: ['@vapen', 'Simma', 'Akrobatik', 'Upptäcka fara', 'Klättra'],
  riddare: ['@vapen', '@vapen2', 'Upptäcka fara', 'Dra vapen', 'Två vapen'],
  tjuv: ['@vapen', 'Smyga', 'Låsdyrkning', 'Stjäla föremål', 'Gömma sig', 'Akrobatik', 'Upptäcka fara'],
  utbygdsjagare: ['@vapen', '@vapen2', 'Spåra', 'Smyga', 'Upptäcka fara', 'Överlevnad'],
};
// Fordel start-EP av seg selv. Besvärjelsene i c.spells betales først, og skolen heves til skolvärdet de trenger.
export function autoBuys(c) {
  const v = startValues({ ...c, buys: {}, spells: {} });
  const { base, maxFV, draft } = v;
  const buys = {};
  let ep = v.ep;
  const cur = id => buys[id] ?? base[id];
  const buy = (id, to) => {
    to = Math.min(to, v.capOf(id));
    const cost = fvCost(cur(id), to, baseCost(id, draft));
    if (to <= cur(id) || cost > ep) return false;
    ep -= cost;
    buys[id] = to;
    return true;
  };
  if (PROF[c.profession]?.magic && c.spells) {
    const need = Math.max(0, ...Object.keys(c.spells).map(id => SPELLS[id]?.sv || 0));
    if (need > cur(v.school)) buy(v.school, need);
    for (const [id, s] of Object.entries(c.spells)) if (SPELLS[id]) ep -= fvCost(0, Math.min(maxFV, Math.max(1, s)), spellBaseCost(SPELLS[id].sv));
  }
  // våpen rollpersonen kan løfte, og de i utrustningen først, i samme rekkefølge
  const kit = kitOf(c, v.attrs.STY || 0).w.map(w => WEAPONS[w]?.skill);
  const rank = s => {
    const w = Object.values(WEAPONS).find(x => x.skill === s);
    const heavy = w && w.str > 2 * (v.attrs.STY || 0) ? 100 : 0;
    return heavy + (kit.includes(s) ? kit.indexOf(s) : 50);
  };
  const yrkeW = (c.yrke || []).filter(s => SKILL[s]?.type === 'vap').sort((a, b) => rank(a) - rank(b));
  const named = (PRIORITY[c.profession] || []).map(s => s === '@vapen' ? yrkeW[0] : s === '@vapen2' ? yrkeW[1] : s === '@konst' ? c.konst : s === '@school' ? v.school : s);
  const list = [...new Set(named)].filter(s => s && base[s] != null && canBuy(s, c));
  const targets = [maxFV, maxFV - 2, maxFV - 4];
  for (let round = 0; round < 6 && ep > 0; round++) {
    list.forEach((id, i) => {
      const goal = Math.min(maxFV, i < 2 ? targets[0] : i < 4 ? targets[1] : targets[2]);
      if (cur(id) < goal) buy(id, Math.min(goal, cur(id) + 2));
    });
  }
  // det som er igjen: ett trinn om gangen, først prioritetene, så andre yrkesfärdigheter og primära som brukes i spillet
  const rest = [...list, ...yrkeW, ...(c.yrke || []), ...SKILLS.filter(s => s.type === 'prim' && s.use).map(s => s.id)]
    .filter((s, i, a) => a.indexOf(s) === i && base[s] != null && canBuy(s, c) && !SPELLS[s]);
  for (let n = 0; n < 40 && ep > 0; n++) {
    let any = false;
    for (const id of rest) if (buy(id, cur(id) + 1)) any = true;
    if (!any) break;
  }
  return buys;
}

// Velg yrkesfärdigheter av seg selv: våpen først, så de viktigste for yrket.
// Med Stort kunskapsområde kommer to ekstra fra hele listen over sekundære ferdigheter.
const EXTRA_POOL = ['Akrobatik', 'Låsdyrkning', 'Läkekonst', 'Två vapen', 'Dra vapen', 'Undre världen', 'Hantera fällor', 'Örtkunskap', 'Överlevnad', 'Simma'];
export function autoYrke(profId, c = {}) {
  const p = PROF[profId];
  const out = [];
  const nWeapons = Math.min(p.max.vapen || 0, profId === 'krigare' ? 3 : 2);
  const weaponPool = { krigare: ['Bredsvärd', 'Stridsyxa', 'Vanlig sköld', 'Kortspjut'], riddare: ['Bredsvärd', 'Vanlig sköld', 'Morgonstjärna'], tjuv: ['Kastkniv', 'Kortsvärd'], lonnmordare: ['Kastkniv'], sjofarare: ['Kroksabel', 'Kastkniv', 'Handyxa'], utbygdsjagare: ['Liten båge', 'Handyxa', 'Kortspjut'], bard: ['Kortsvärd'] }[profId] || [];
  for (const w of weaponPool) if (out.length < nWeapons) out.push(w);
  if (p.skills.includes('Dolk')) out.push('Dolk');
  if (p.magic) out.push(c.school || 'Elementarmagi');
  if (p.skills.includes('Stridskonster') && (c.kin === 'anka' || profId === 'munk')) out.push('Stridskonster');
  const prio = (PRIORITY[profId] || []).filter(s => !s.startsWith('@'));
  for (const s of [...prio, ...shuffle(p.skills)]) {
    if (out.length >= p.pick) break;
    if (s === 'vapen' || s === 'magi' || s === 'Tala främmande språk' || s === 'Läsa/Skriva främmande språk' || s === 'Hantverk' || s === 'Spela instrument') continue;
    if (SKILL[s] && !out.includes(s) && p.skills.includes(s) && SKILL[s].type !== 'prim') out.push(s);
  }
  const res = out.slice(0, p.pick);
  const extra = c.special ? special(c.special).fx.extraPicks || 0 : 0;
  for (const s of [...EXTRA_POOL, ...shuffle(p.skills)]) {
    if (res.length >= p.pick + extra) break;
    if (SKILL[s] && SKILL[s].type !== 'prim' && !res.includes(s) && !forbidden(s, profId)) res.push(s);
  }
  return res;
}

// Tre besvärjelser fra skolen og Allmänna som skolen kan nå ved start, med S 8 (spillets valg)
const SPELL_PRIORITY = ['blixt', 'vindpil', 'eld', 'energistrale', 'hela', 'skold', 'skydd', 'kallahanden', 'sprang', 'frost', 'oka', 'motstandskraft', 'ljus', 'traeld'];
export function autoSpells(c, random = false) {
  if (!PROF[c.profession]?.magic) return {};
  const school = c.school || 'Elementarmagi';
  const maxFV = maxStartFV(c.age, c.kin);
  const fv = Math.min(8, maxFV);
  const ok = Object.keys(SPELLS).filter(k => (SPELLS[k].school === school || SPELLS[k].school === 'Allmän') && SPELLS[k].sv <= fv);
  const order = random ? shuffle(ok) : [...new Set([...SPELL_PRIORITY.filter(k => ok.includes(k)), ...ok])];
  return Object.fromEntries(order.slice(0, 3).map(k => [k, Math.min(8, maxFV)]));
}

// Helt tilfeldig rollperson etter reglene ("Slumpa allt" og stresstestene)
// Utrustningsforslaget: er et våpen i yrkets forslag for tungt (STY x 2 under kravet), byttes det
// mot det dyreste våpenet av samme slag som rollpersonen kan løfte og som ikke koster mer. Finnes
// ingen, blir det en dolk eller parerdolk. Spillets eget forslag, så alle tunge våpen byttes.
export function fitKit(kit, sty) {
  const w = [...kit.w];
  let changed = false;
  w.forEach((id, i) => {
    const orig = WEAPONS[id];
    if (!orig || orig.shield || (orig.str || 1) <= sty * 2) return;
    const alt = Object.values(WEAPONS)
      .filter(x => !x.unarmed && x.skill !== 'Slagsmål' && !x.shield && !!x.ranged === !!orig.ranged && !!x.thrown === !!orig.thrown
        && x.price <= orig.price && x.str <= sty * 2 && !w.includes(x.id))
      .sort((a, b) => b.price - a.price)[0];
    const to = alt?.id || ['dolk', 'parerdolk', 'knogjarn'].find(x => !w.includes(x));
    if (to) { w[i] = to; changed = true; }
  });
  return changed ? { w, a: [...kit.a], g: [...kit.g] } : null;
}
// Utrustningen rollpersonen faktisk får: eget bytte, ellers forslaget tilpasset STY.
export function kitOf(c, sty) {
  const kit = PROF[c.profession]?.kit;
  if (!kit) return { w: [], a: [], g: [] };
  return c.gear || fitKit(kit, sty) || kit;
}

export function randomChoices(profId = null) {
  for (let tries = 0; tries < 200; tries++) {
    const kin = pick(RACES).id;
    const profession = profId || pick(PROFESSIONS).id;
    if (PROF[profession].magic && RACE[kin].noMagic) continue;
    // tre sett med rasens terninger, ta det første som oppfyller kravet (Bok I s. 32)
    const sets = [0, 1, 2].map(() => rollRaceAttrs(kin));
    const set = sets.findIndex(s => meetsReq(s, profession));
    if (set < 0) continue;
    const age = pick(['ung', 'mogen', 'mogen', 'medel']);
    const sp = rollSpecial(), hand = rollHand(), stand = rollStand(), money = rollMoney(stand.total);
    const c = {
      rules: 'dod91', kin, profession, age, sex: pick(['man', 'kvinna']), sets, set, shift: {}, rolled: { ...sets[set] },
      special: sp.total, specialDice: sp.dice, hand: hand.total, handDice: hand.dice,
      stand: stand.total, standDice: stand.dice, money: money.total, moneyRaw: money.raw, moneyDice: money.dice,
    };
    c.school = PROF[profession].magic ? pick(['Animism', 'Elementarmagi', 'Mentalism']) : null;
    c.yrke = autoYrke(profession, c);
    if (c.yrke.includes('Stridskonster')) c.konst = defaultKonst(c);
    const kind = specialKind(c.special);
    if (kind === 'attrs') c.specialAttrs = shuffle(['STY', 'FYS', 'SMI', 'INT', 'PSY', 'KAR']).slice(0, 3);
    else if (kind && kind !== 'extra') {
      const opts = specialOptions(kind, c);
      const good = opts.filter(s => c.yrke.includes(s) || SKILL[s].use);
      c.specialSkill = pick(good.length ? good : opts);
    }
    c.spells = autoSpells(c, true);
    c.buys = autoBuys(c);
    const race = RACE[kin];
    c.name = pick([...race.names, ...(race.ereb || [])]);
    c.appearance = pick(APPEARANCE);
    c.aidne = d(AIDNE.length) - 1;
    return c;
  }
  return null;
}

// Svart Nebb, egentlig Nansen. Svart anka, lönnmördare fra Fristaden i Zorakin.
// Quack-fu lært av Mester Flansen (Gigant s. 37). Verdiene er satt for hånd etter reglene.
export function svartNebb() {
  const attrs = { STY: 8, STO: 5, FYS: 14, SMI: 17, INT: 12, PSY: 13, KAR: 7 };
  const skills = {
    Bluffa: 7, 'Finna dolda ting': 8, 'Första hjälpen': 6, 'Gömma sig': 10, Hoppa: 9, Klättra: 9, Köpslå: 5, Lyssna: 9,
    'Läsa/Skriva modersmål': 1, Rida: 0, Sjunga: 3, Slagsmål: 9, Smyga: 15, Spåra: 4, 'Stjäla föremål': 12, 'Tala modersmål': 16,
    'Upptäcka fara': 11, Värdera: 6, Övertala: 5,
    Dolk: 14, Kastkniv: 11, 'Quack-fu': 14, Akrobatik: 13, Låsdyrkning: 12, Simma: 20, 'Undre världen': 9, 'Dra vapen': 8, 'Hantera fällor': 6,
    Knopar: 6, Kulturkännedom: 4, Geografi: 3, Muta: 4, Giftkunskap: 3,
  };
  return {
    v: 2, rules: 'dod91', id: 'svartnebb', premade: true,
    name: 'Svart Nebb', realName: 'Nansen', kin: 'anka', profession: 'lonnmordare', age: 'ung', sex: 'man',
    rolled: { ...attrs }, attrs,
    special: { n: 10, name: 'Bråkig uppväxt', text: '+3 FV i Slagsmål.', fx: { skill: { Slagsmål: 3 } } },
    hand: 'hoger', stand: 'Egendomslös', standRoll: 2,
    yrke: ['Kastkniv', 'Akrobatik', 'Dolk', 'Dra vapen', 'Geografi', 'Giftkunskap', 'Hantera fällor', 'Knopar', 'Kulturkännedom', 'Låsdyrkning', 'Muta', 'Stridskonster', 'Undre världen'],
    skills, spells: {}, school: null, konst: 'Quack-fu', ability: 'bakhall',
    gear: { w: ['dolk', 'kastkniv'], a: ['laderharnesk', 'laderhuva'], g: ['dyrkar', 'rep', 'fackla', 'elddon'] },
    silver: 200, epTotal: 175, epSpent: 175, epLeft: 0,
    appearance: 'Iskaldt blikk', aidne: 6,
    blurb: 'Egentlig Nansen. Svart anka og lönnmördare fra Fristaden i Zorakin. Quack-fu lært av Mester Flansen. Faren er butikkbetjent, ikke kjøpmann.',
  };
}

export { RACES as KINS, PROFESSIONS, AIDNE, AGES };
