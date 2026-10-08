// Regelkjerne fra Drakar och Demoner (2023):
// - Slag: T20, lik eller under verdien lyktes. 1 er Drake, 20 er Demon.
// - Fördel: slå to T20 og bruk den laveste. Nackdel: bruk den høyeste. De nuller hverandre ut.
// - Tillstånd knyttet til grundegenskaper gir nackdel på egenskapen og ferdighetene som hører til.
// - Markerte ferdigheter (Drake, Demon eller sesjonsspørsmål) kan forbedres ved vila: slå over verdien.

import {
  ATTRS, ATTR_NAME, SKILLS, SKILL, baseChance, dmgBonusDie, KIN, PROF, AGES, HEROIC,
  WEAKNESS, APPEARANCE, MEMENTO, AIDNE, PROFESSIONS, KINS, SPELLS, TRICKS, ageFromD6, kinFromD12,
} from './dod.js';

export { CONDITIONS, COND_BY_ID } from './dod.js';
export const ATTR = ATTR_NAME;

export function d(n) {
  return 1 + Math.floor(Math.random() * n);
}
export const pick = a => a[Math.floor(Math.random() * a.length)];

// "D8", "2D6", "D4+1", "D10+D4"
export function rollDice(expr) {
  if (!expr) return 0;
  let total = 0;
  for (const part of String(expr).toUpperCase().split('+')) {
    const p = part.trim();
    const m = p.match(/^(\d*)[DT](\d+)$/);
    if (m) {
      const count = m[1] ? parseInt(m[1]) : 1;
      for (let i = 0; i < count; i++) total += d(parseInt(m[2]));
    } else if (p) total += parseInt(p) || 0;
  }
  return total;
}

export function diceAvg(expr) {
  let total = 0;
  for (const part of String(expr || '').toUpperCase().split('+')) {
    const m = part.trim().match(/^(\d*)[DT](\d+)$/);
    if (m) total += (m[1] ? parseInt(m[1]) : 1) * (parseInt(m[2]) + 1) / 2;
    else total += parseInt(part) || 0;
  }
  return total;
}

// Dobler antall terninger: "2D6" blir "4D6", "D8+D4" blir "2D8+2D4"
export function doubleDice(expr) {
  return String(expr).toUpperCase().split('+').map(p => {
    const m = p.trim().match(/^(\d*)D(\d+)$/);
    return m ? `${(m[1] ? parseInt(m[1]) : 1) * 2}D${m[2]}` : p;
  }).join('+');
}
// En terning til av samme slag: "D8" blir "2D8"
export function addDie(expr) {
  const m = String(expr).toUpperCase().match(/^(\d*)D(\d+)(.*)$/);
  if (!m) return expr;
  return `${(m[1] ? parseInt(m[1]) : 1) + 1}D${m[2]}${m[3]}`;
}
// Bokstil: "2T6"
export const tStr = expr => String(expr || '').toUpperCase().replace(/D/g, 'T');

/**
 * Slag mot en verdi.
 * @param {number} target verdien
 * @param {object} o { boon, bane, drakeMax (1 = bare 1 er Drake), demonIsCrit }
 */
export function skillRoll(target, o = {}) {
  const net = (o.boon || 0) - (o.bane || 0);
  const a = d(20);
  const b = net !== 0 ? d(20) : null;
  const r = net > 0 ? Math.min(a, b) : net < 0 ? Math.max(a, b) : a;
  const drakeMax = o.drakeMax || 1;
  const drake = r <= drakeMax;
  const demon = r === 20;
  let success = drake || (!demon && r <= target);
  let demonCrit = false;
  if (demon && o.demonIsCrit) {
    success = true;
    demonCrit = true;
  }
  return { r, dice: b == null ? [a] : [a, b], target, success, drake, demon, demonCrit, boon: net > 0, bane: net < 0 };
}

export function damageBonus(attrVal) {
  return dmgBonusDie(attrVal);
}

// 4T6, stryk den laveste
export function rollAttr() {
  const dice = [d(6), d(6), d(6), d(6)];
  const sorted = [...dice].sort((a, b) => a - b);
  return { dice, total: sorted[1] + sorted[2] + sorted[3], dropped: sorted[0] };
}

export function applyAge(raw, ageId) {
  const age = AGES.find(a => a.id === ageId) || AGES[1];
  const out = {};
  for (const k of ATTRS) out[k] = Math.max(1, Math.min(18, (raw[k] || 10) + (age.mods[k] || 0)));
  return out;
}

// Alle ferdighetsverdier ut fra grundegenskaper og tränade ferdigheter.
// Sekundære ferdigheter (magiskoler, Ereb Altor-ferdigheter) finnes bare hvis de er tränade.
export function computeSkills(attrs, trained, extra = {}) {
  const t = new Set(trained);
  const out = {};
  for (const s of SKILLS) {
    if (s.type === 'sek' && !t.has(s.id)) continue;
    const bc = baseChance(attrs[s.attr]);
    out[s.id] = Math.min(18, (t.has(s.id) ? bc * 2 : bc) + (extra[s.id] || 0));
  }
  return out;
}

export function meetsReq(skills, id) {
  const h = HEROIC[id];
  if (!h || !h.req) return true;
  return h.req.s.some(s => (skills[s] || 0) >= h.req.v);
}

export function trainedCount(ageId) {
  const age = AGES.find(a => a.id === ageId) || AGES[1];
  return { prof: 6, free: age.free };
}

// Ferdig rollformulär ut fra valgene i rollpersonsskapingen
export function buildSheet(c) {
  const prof = PROF[c.profession];
  const kin = KIN[c.kin];
  const attrs = applyAge(c.rawAttrs, c.age);
  const trained = [...new Set([...(c.profSkills || []), ...(c.freeSkills || []), ...(c.extraSkill ? [c.extraSkill] : [])])];
  const skills = computeSkills(attrs, trained, c.improved || {});
  const pk = prof.pk[c.pkg || 'A'];
  const w = [];
  for (const raw of pk.w) {
    let id = raw;
    if (id.includes('|')) id = (c.weaponPick && id.split('|').includes(c.weaponPick)) ? c.weaponPick : id.split('|')[0];
    if (id.endsWith('*2')) { w.push(id.slice(0, -2)); w.push(id.slice(0, -2)); } else w.push(id);
  }
  return {
    v: 1,
    id: c.id || 'rp' + Math.floor(Math.random() * 1e9).toString(36),
    name: c.name || pick(kin.names),
    kin: c.kin,
    profession: c.profession,
    age: c.age,
    school: prof.mage ? c.school : null,
    rawAttrs: { ...c.rawAttrs },
    attrs,
    trained,
    skills,
    kinAbilities: [...kin.abilities],
    heroic: prof.mage ? [] : [...(c.heroic || [])],
    spells: prof.mage ? [...(c.spells || [])] : [],
    tricks: prof.mage ? [...(c.tricks || [])] : [],
    pkg: c.pkg || 'A',
    gear: { w, a: pk.a || null, h: pk.h || null, g: [...(pk.g || [])] },
    silver: c.silver ?? 0,
    food: c.food ?? 0,
    weakness: c.weakness ?? null,
    appearance: c.appearance ?? null,
    memento: c.memento ?? null,
    aidne: c.aidne ?? null,
    extraSkill: c.extraSkill || null,
    choices: JSON.parse(JSON.stringify(c)),
  };
}

// Svart Nebb, egentlig Nansen. Anka, tjuv og lönnmördare fra Fristaden i Zorakin.
// Medelålders: 6 yrkesferdigheter + 4 frie. Noen verdier er forbedret gjennom kampanjen.
export function svartNebb() {
  const attrs = { STY: 13, FYS: 14, SMI: 16, INT: 12, PSY: 13, KAR: 10 };
  const trained = ['Kniv', 'Smyga', 'Undvika', 'Fingerfärdighet', 'Upptäcka fara', 'Finna dolda ting', 'Slagsmål', 'Svärd', 'Simma', 'Hoppa & klättra'];
  const improved = { Kniv: 1, Smyga: 1, Slagsmål: 2 };
  return {
    v: 1,
    id: 'svartnebb',
    premade: true,
    name: 'Svart Nebb',
    realName: 'Nansen',
    kin: 'anka',
    profession: 'tjuv',
    age: 'medel',
    school: null,
    rawAttrs: { ...attrs },
    attrs,
    trained,
    skills: computeSkills(attrs, trained, improved),
    improved,
    kinAbilities: ['vresig', 'simfotter'],
    heroic: ['tjuvhugg', 'jarnnave', 'lonnmordare'],
    spells: [],
    tricks: [],
    pkg: 'C',
    gear: { w: ['dolk', 'dolk'], a: 'lader', h: null, g: ['kulor', 'rep', 'fackla', 'elddon'] },
    silver: 6,
    food: 3,
    weakness: 'Lettfornærmet',
    appearance: 'Iskaldt blikk',
    memento: 'Mester Flansens gamle tøffel',
    aidne: 6,
    extraSkill: null,
    blurb: 'Egentlig Nansen. Anka, tjuv og lönnmördare fra Fristaden i Zorakin. Kvakk-Fu lært av Mester Flansen. Faren er butikkbetjent, ikke kjøpmann.',
  };
}

// Helt tilfeldig rollperson etter reglene (brukes av "Slumpa allt")
export function randomChoices() {
  const kin = kinFromD12(d(12));
  const profession = PROFESSIONS[d(10) - 1].id;
  const prof = PROF[profession];
  const age = ageFromD6(d(6));
  const raw = {};
  for (const k of ATTRS) raw[k] = rollAttr().total;
  // bytt to slik at yrkets nøkkelegenskap blir høyest
  const best = ATTRS.reduce((a, b) => (raw[a] >= raw[b] ? a : b));
  if (best !== prof.key) { const t = raw[best]; raw[best] = raw[prof.key]; raw[prof.key] = t; }
  const school = prof.mage ? pick(Object.keys(prof.schools)) : null;
  const list = prof.mage ? prof.schools[school] : prof.skills;
  const profSkills = prof.mage ? [list[0], ...shuffle(list.slice(1)).slice(0, 5)] : shuffle(list).slice(0, 6);
  const free = AGES.find(a => a.id === age).free;
  const pool = SKILLS.filter(s => s.type !== 'sek' && !profSkills.includes(s.id)).map(s => s.id);
  // frie valg: helst et våpen hvis yrket mangler ett
  const freeSkills = [];
  const hasWeapon = profSkills.some(s => SKILL[s].type === 'vap');
  if (!hasWeapon) freeSkills.push(pick(['Kniv', 'Svärd', 'Stav', 'Spjut']));
  for (const s of shuffle(pool)) { if (freeSkills.length >= free) break; if (!freeSkills.includes(s)) freeSkills.push(s); }
  const heroic = prof.mage ? [] : [prof.heroicChoice ? pick(prof.heroic) : prof.heroic[0]];
  let spells = [], tricks = [];
  if (prof.mage) {
    spells = shuffle(Object.keys(SPELLS).filter(k => SPELLS[k].school === school)).slice(0, 3);
    tricks = shuffle(Object.keys(TRICKS).filter(k => TRICKS[k].school === school || TRICKS[k].school === 'Allmän')).slice(0, 3);
  }
  const kinD = KIN[kin];
  return {
    kin, profession, age, rawAttrs: raw, school, profSkills, freeSkills, heroic, spells, tricks,
    pkg: 'ABC'[Math.floor((d(6) - 1) / 2)],
    name: pick([...kinD.names, ...(kinD.ereb || [])]),
    weakness: WEAKNESS[d(20) - 1],
    appearance: APPEARANCE[d(20) - 1],
    memento: MEMENTO[d(20) - 1],
    aidne: null,
    silver: rollDice(prof.silver),
    food: rollDice(prof.food),
  };
}

export function shuffle(a) {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

export { KINS, PROFESSIONS, AIDNE };
