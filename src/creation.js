// Rollpersonsskaping etter Drakar och Demoner 4.0 (1991), "Ett enklare framslagningssystem" (Bok I s. 32).
// Ras og yrke velges fritt. Grundegenskapene slås med rasens terninger i tre sett, spilleren velger ett og kan
// flytte poeng 2:1. Särskild förmåga 2T20+1T10, svärdshand 2T4, socialt stånd og startkapital 2T6.
// Ålder gir EP (+25 minus rasens BP) og høyeste FV. EP fordeles på primära og yrkesfärdigheter, og magikeren
// kjøper besvärjelser. Alt som velges, ligger i this.c, og buildSheet(c) i rules.js lager formuläret.
import { G } from './state.js';
import {
  d, pick, tStr, diceAvg, buildSheet, startValues, baseCost, canBuy, forbidden, specialKind, specialOptions, defaultKonst,
  autoBuys, autoYrke, autoSpells, randomChoices, rollRaceAttrs, raceMax, meetsReq, applyAge, startEP, maxStartFV, derived,
  weaponFV, rollSpecial, rollHand, rollStand, rollMoney, clampMoney, kitOf,
} from './rules.js';
import {
  ATTRS, ATTR_NAME, RACES, RACE, AGES, AGE, AGE_YEARS, SKILLS, SKILL, PROFESSIONS, PROF, ABILITIES, special, standOf, moneyOf,
  SPELLS, SCHOOLS, spellBaseCost, KONSTER, KONST_PARTS, konstCost, WEAPONS, WEAPON_GROUPS, WEAPON_SKILLS, ARMORS, GEAR,
  AIDNE, APPEARANCE, LOC_NAME, fvCost, baseChance,
} from './dod.js';
import { sheetHTML } from './ui.js';

const $ = s => document.querySelector(s);
const STEPS = [
  { id: 'kin', name: 'Ras' },
  { id: 'prof', name: 'Yrke' },
  { id: 'attr', name: 'Egenskaper' },
  { id: 'age', name: 'Ålder' },
  { id: 'back', name: 'Bakgrunn' },
  { id: 'yrke', name: 'Yrkesval' },
  { id: 'skills', name: 'Färdigheter' },
  { id: 'magi', name: 'Magi' },
  { id: 'gear', name: 'Utrustning' },
  { id: 'name', name: 'Navn' },
];
const ATTR_USE = {
  STY: 'Bärförmåga i kg og skadebonus sammen med STO. Tunge våpen krever STY.',
  STO: 'KP sammen med FYS, skadebonus sammen med STY.',
  FYS: 'KP sammen med STO. Motstand mot gift og sykdom.',
  SMI: 'Treff, dukking og hvem som slår først. Mange ferdigheter bygger på SMI.',
  INT: 'Mange ferdigheter og alle magiskolene bygger på INT.',
  PSY: 'Kraften for magi og yrkesförmågor. Brukes opp og kommer tilbake. PSY 0 er døden.',
  KAR: 'Prat, pruting og bestikkelser i byen.',
};
const HAND = { hoger: 'Höger', vanster: 'Vänster', dubbelhant: 'Dubbelhänt', ambidextrios: 'Ambidextriös' };
const HAND_TXT = {
  hoger: 'Svärdshanden er høyre.', vanster: 'Svärdshanden er venstre.',
  dubbelhant: 'Begge hender er like gode, men ikke samtidig.', ambidextrios: 'Begge hender kan brukes samtidig til ulike ting.',
};
const SPECIAL_HINT = {
  sek: 'Er det ikke en yrkesfärdighet, har du den fra start, men kan ikke heve den med EP nå.',
  hobby: 'Du kan den fra start, men kan ikke heve den med EP nå.',
  skill: 'Taket for høyeste FV ved start blir også 2 høyere for den.',
  weapon: 'Gjelder ett våpen.',
};

const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const fmtN = n => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
const fmtX = x => String(Math.round(x * 100) / 100).replace('.', ',');
const kg = x => fmtX(x) + ' kg';
const signed = v => (v > 0 ? '+' : '') + v;
const sumD = dice => (dice?.length > 1 ? dice.join(' + ') + ' = ' : '');
const need = t => `<p class="cr-lead">${t}</p>`;
const reqTxt = p => Object.entries(p.req).map(([k, v]) => `${k} ${v}`).join(', ');
const handKey = (n, sp) => sp?.fx?.hand || (n >= 19 ? 'ambidextrios' : n >= 15 ? 'dubbelhant' : n >= 12 ? 'vanster' : 'hoger');
const defaultSet = kin => Object.fromEntries(ATTRS.map(k => [k, Math.floor(diceAvg(RACE[kin].dice[k]))]));
const shifted = (set, shift) => Object.fromEntries(ATTRS.map(k => [k, set[k] + (shift[k] || 0)]));
const weaponOfSkill = id => Object.values(WEAPONS).find(w => w.skill === id);

const CSS = `
.cr-steps { grid-template-columns: repeat(10, minmax(0, 1fr)); }
.cr-step span { max-width: 100%; overflow: hidden; text-overflow: ellipsis; }
.card.cr-no { opacity: .42; cursor: default; }
.card.cr-no:hover { transform: none; border-color: rgba(107,90,62,.55); }
.cr-dice { display: flex; flex-wrap: wrap; gap: 2px 9px; margin-top: 6px; font-family: var(--ui); font-weight: 700; font-size: 12px; color: var(--parch); font-variant-numeric: tabular-nums; }
.cr-dice i { font-style: normal; font-size: 10px; letter-spacing: .1em; color: var(--gild); margin-right: 3px; }
.cr-dice.big { font-size: 15px; gap: 6px 16px; margin: 4px 0 10px; }
.cr-tag { display: inline-block; margin-top: 6px; font-family: var(--ui); font-weight: 800; font-size: 11px; letter-spacing: .06em; padding: 1px 6px; border: 1px solid rgba(103,201,162,.45); color: var(--moss); }
.cr-tag.bad, .cr-at em.bad { border-color: rgba(255,138,106,.5); color: #ff8a6a; }
.cr-ok { color: var(--moss); font-size: 14px; margin: 8px 0 0 !important; }
.cr-at { display: grid; grid-template-columns: minmax(0, 1fr) 56px repeat(3, 46px) 92px 40px 46px; gap: 3px 6px; align-items: center; font-family: var(--ui); margin-top: 6px; }
.cr-at .h, .cr-at .h.ag, .cr-at .h.dc { font-size: 10px; letter-spacing: .04em; text-transform: uppercase; color: var(--dim); text-align: center; }
.cr-at .hset { font-family: var(--ui); font-weight: 800; padding: 4px 0; background: rgba(0,0,0,.3); border: 1px solid rgba(107,90,62,.45); cursor: pointer; color: var(--dim); }
.cr-at .hset.on { color: #fff4dc; border-color: var(--gild); }
.cr-at em { display: block; font-style: normal; font-size: 9.5px; letter-spacing: .04em; text-transform: none; color: var(--moss); }
.cr-at .a { min-width: 0; padding: 4px 0; border-top: 1px solid rgba(107,90,62,.25); font-size: 14px; }
.cr-at .a b { color: var(--gild); letter-spacing: .1em; margin-right: 6px; }
.cr-at .a i { font-style: normal; font-size: 11px; color: var(--ember); margin-left: 4px; }
.cr-at .a small { display: block; font-family: var(--body); font-size: 12px; color: var(--dim); line-height: 1.25; }
.cr-at .dc { font-size: 12.5px; color: var(--parch); text-align: center; line-height: 1.2; }
.cr-at .dc span { font-size: 10px; color: var(--dim); }
.cr-at .sv { font-family: var(--ui); font-weight: 800; font-size: 17px; padding: 4px 0; text-align: center; color: var(--dim); background: rgba(0,0,0,.25); border: 1px solid rgba(107,90,62,.35); cursor: pointer; font-variant-numeric: tabular-nums; }
.cr-at .sv.on { color: #fff4dc; border-color: var(--gild); background: rgba(201,163,90,.16); }
.cr-at .sv.low, .cr-at .fv.low { color: #ff8a6a; }
.cr-at .sh { display: flex; align-items: center; justify-content: center; gap: 4px; }
.cr-at .sh span { width: 22px; text-align: center; font-weight: 800; color: var(--moss); }
.cr-at .ag { text-align: center; font-size: 13px; color: var(--moss); }
.cr-at .fv { text-align: right; font-weight: 800; font-size: 21px; color: var(--gild); font-variant-numeric: tabular-nums; }
.pm { width: 24px; height: 24px; padding: 0; font-family: var(--ui); font-weight: 800; font-size: 15px; line-height: 1; color: var(--parch); background: rgba(0,0,0,.35); border: 1px solid var(--gild-dim); cursor: pointer; }
.pm:hover:not(:disabled) { border-color: var(--gild); color: #fff; }
.pm:disabled { opacity: .28; cursor: default; }
.derived.four { grid-template-columns: repeat(4, minmax(0, 1fr)); margin-bottom: 8px; }
.derived b.z { color: var(--moss); }
.cr-box { margin: 6px 0 4px; padding: 9px 12px; border: 1px solid rgba(201,163,90,.35); background: rgba(201,163,90,.06); font-size: 14.5px; line-height: 1.45; }
.cr-box > b { color: var(--gild); font-family: var(--ui); }
.cr-box .chips { margin-top: 4px; }
.cr-sub { font-family: var(--ui); font-size: 11px; letter-spacing: .12em; text-transform: uppercase; color: var(--dim); margin: 9px 0 4px; }
.cr-sub b { color: var(--parch); letter-spacing: .04em; text-transform: none; font-size: 13px; }
.chip.dash { border-style: dashed; border-color: rgba(201,163,90,.65); }
.cr-sk { display: grid; grid-template-columns: minmax(0, 1fr) 40px 34px 24px 30px 24px 60px; align-items: center; gap: 2px 6px; padding: 3px 6px; font-family: var(--ui); font-weight: 700; font-size: 14.5px; border-bottom: 1px dotted rgba(107,90,62,.4); }
.cr-sk.hd { font-size: 10px; letter-spacing: .1em; text-transform: uppercase; color: var(--dim); border: 0; padding-bottom: 0; }
.cr-sk .nm { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cr-sk .nm i { font-style: normal; font-size: 10.5px; color: var(--gild); letter-spacing: .06em; }
.cr-sk .at, .cr-sk .st { font-size: 11px; color: var(--dim); text-align: center; letter-spacing: .04em; }
.cr-sk > b { text-align: center; font-size: 17px; color: var(--parch); font-variant-numeric: tabular-nums; }
.cr-sk.up > b { color: var(--gild); }
.cr-sk .co { font-size: 12px; color: var(--dim); text-align: right; font-variant-numeric: tabular-nums; }
.cr-sk .tx { grid-column: 1 / -1; font-family: var(--body); font-weight: 400; font-size: 12.5px; color: var(--dim); line-height: 1.3; padding-bottom: 2px; }
.cr-sk.off { opacity: .45; }
.cr-cols { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0 18px; }
.cr-kit { display: grid; grid-template-columns: minmax(0, 1fr) 58px 70px 64px; align-items: center; gap: 8px; padding: 5px 6px; border-bottom: 1px dotted rgba(107,90,62,.4); font-family: var(--ui); font-size: 14.5px; }
.cr-kit .nm { font-weight: 800; min-width: 0; }
.cr-kit .nm i { font-style: normal; font-size: 10.5px; color: var(--moss); margin-left: 4px; }
.cr-kit .nm small { display: block; font-weight: 500; font-size: 12px; color: var(--dim); }
.cr-kit .kg, .cr-kit .pr { text-align: right; color: var(--dim); font-size: 13px; font-variant-numeric: tabular-nums; }
.cr-kit .btn { justify-self: end; }
@media (max-width: 620px) {
  .cr-step span { display: none; }
  .cr-at { grid-template-columns: minmax(0, 1fr) repeat(3, 40px) 86px 42px; }
  .cr-at .dc, .cr-at .ag, .cr-at .a small { display: none; }
  .cr-cols, .cards.two, .cards.three { grid-template-columns: 1fr; }
  .cr-kit { grid-template-columns: minmax(0, 1fr) 54px 64px; }
  .cr-kit .pr { display: none; }
}
`;

export class Creator {
  constructor(game) {
    this.game = game;
    this.step = 0;
    this.swapIdx = null;
    this.saMode = 'tre';
    this.pickOpen = false;
    this.c = this.fresh();
    if (!document.getElementById('cr-style')) {
      const st = document.createElement('style');
      st.id = 'cr-style';
      st.textContent = CSS;
      document.head.appendChild(st);
    }
    const next = $('#cr-next');
    if (!$('#cr-save')) {
      const b = document.createElement('button');
      b.className = 'btn small';
      b.id = 'cr-save';
      b.textContent = 'Lagre';
      b.hidden = true;
      next.parentNode.insertBefore(b, next);
    }
    $('#cr-prev').onclick = () => this.go(this.step - 1, -1);
    next.onclick = () => (this.step < STEPS.length - 1 ? this.go(this.step + 1, 1) : this.finish(true));
    $('#cr-save').onclick = () => this.finish(false);
    $('#cr-random').onclick = () => this.randomAll();
  }

  fresh() {
    return {
      rules: 'dod91', kin: null, profession: null, sex: null, sets: null, set: 0, shift: {}, rolled: null, age: null,
      special: null, specialDice: null, specialSkill: null, specialAttrs: null, hand: null, handDice: null,
      stand: null, standDice: null, money: null, moneyRaw: null, moneyDice: null,
      school: null, yrke: [], konst: null, buys: {}, spells: {}, gear: null, name: '', appearance: null, aidne: null,
    };
  }

  // existing: choices fra et lagret formulär. Er det fra 2023-reglene, beholdes bare det som fortsatt passer.
  open(existing) {
    let c = this.fresh();
    if (existing && (existing.rules === 'dod91' || (existing.rolled && 'STO' in existing.rolled))) {
      c = { ...c, ...JSON.parse(JSON.stringify(existing)), rules: 'dod91' };
    } else if (existing) {
      if (RACE[existing.kin]) c.kin = existing.kin;
      if (PROF[existing.profession]) c.profession = existing.profession;
      c.name = existing.name || '';
      if (existing.id) c.id = existing.id;
    }
    if (!c.sets && c.rolled) { c.sets = [{ ...c.rolled }]; c.set = 0; c.shift = {}; }
    this.c = c;
    this.swapIdx = null;
    this.saMode = 'tre';
    this.pickOpen = false;
    this.step = 0;
    this.render();
  }

  go(i, dir = 0) {
    if (i < 0) { this.game.showView('tv-pick'); this.game.refreshPick(); return; }
    i = Math.max(0, Math.min(STEPS.length - 1, i));
    if (dir && STEPS[i].id === 'magi' && !this.magicStep()) i = Math.max(0, Math.min(STEPS.length - 1, i + dir));
    this.step = i;
    this.swapIdx = null;
    G.audio?.menuTick?.(62 + this.step * 2);
    this.render();
    $('#cr-body').scrollTop = 0;
  }

  // --- tilstand ---------------------------------------------------------------

  prof() { return this.c.profession ? PROF[this.c.profession] : null; }
  race() { return RACE[this.c.kin || 'manniska']; }
  // krav rasen aldri kan nå, selv med flytting (terningenes maks er for lav)
  unreachable(id) {
    if (!this.c.kin) return [];
    const max = raceMax(this.c.kin);
    return Object.entries(PROF[id].req).filter(([k, v]) => max[k] < v).map(([k, v]) => `${k} ${v}`);
  }
  profOk(id) { return !!PROF[id] && !(PROF[id].magic && this.c.kin && RACE[this.c.kin].noMagic) && !this.unreachable(id).length; }
  magicStep() { const p = this.prof(); return !!p && (p.magic || (p.id === 'utbygdsjagare' && this.c.yrke.includes('Animism'))); }
  extraCount() { return this.c.special ? special(this.c.special).fx.extraPicks || 0 : 0; }

  // valgene med standardverdier der spilleren ikke har valgt ennå (til forhåndsvisning og utregning)
  draft() {
    const c = this.c;
    const kin = c.kin || 'manniska';
    return { ...c, kin, profession: c.profession || 'tjuv', rolled: c.rolled || defaultSet(kin), age: c.age || 'mogen', name: (c.name || '').trim() || 'Uten navn', id: c.id || 'ny-rollperson' };
  }
  finalChoices() { return { ...this.c, name: (this.c.name || '').trim() }; }

  // yrkesfärdigheter: hva som er fra yrkets liste, og hva som må telle som frie valg
  inList(id) {
    const p = this.prof();
    return p.skills.includes(id) || (p.skills.includes('vapen') && SKILL[id]?.type === 'vap') || (p.skills.includes('magi') && SKILL[id]?.type === 'magi');
  }
  weaponPicks() {
    const p = this.prof();
    if (!p?.skills.includes('vapen')) return [];
    return this.c.yrke.filter(id => SKILL[id]?.type === 'vap' && !p.skills.includes(id));
  }
  weaponCount() { return this.weaponPicks().length; }
  outsideCount() {
    const p = this.prof();
    const over = Math.max(0, this.weaponCount() - (p.max.vapen || 0));
    return this.c.yrke.filter(id => !this.inList(id)).length + over;
  }
  yrkeValid() {
    const c = this.c, p = this.prof();
    if (!p) return true;
    const extra = this.extraCount();
    const schools = c.yrke.filter(id => SKILL[id]?.type === 'magi').length;
    return c.yrke.length <= p.pick + extra && this.outsideCount() <= extra && schools <= 1 && new Set(c.yrke).size === c.yrke.length &&
      c.yrke.every(id => (SKILL[id] || id === 'Stridskonster') && !forbidden(id, p.id));
  }
  dropYrke() {
    const c = this.c, p = this.prof();
    let i = -1;
    for (let j = c.yrke.length - 1; j >= 0 && i < 0; j--) if (!this.inList(c.yrke[j])) i = j;
    if (i < 0 && this.weaponCount() > (p.max.vapen || 0)) { const w = this.weaponPicks(); i = c.yrke.lastIndexOf(w[w.length - 1]); }
    if (i < 0) i = c.yrke.length - 1;
    c.yrke.splice(i, 1);
  }

  pool() {
    let lo = 0, hi = 0;
    for (const v of Object.values(this.c.shift || {})) { if (v < 0) lo -= v; else hi += v; }
    return lo - 2 * hi;
  }

  specialDone() {
    const c = this.c, kind = specialKind(c.special);
    if (!kind || kind === 'extra') return true;
    if (kind === 'attrs') {
      const a = c.specialAttrs || [];
      return (a.length === 3 && new Set(a).size === 3) || (a.length === 2 && a[0] === a[1]);
    }
    return !!c.specialSkill;
  }

  done(id) {
    const c = this.c, p = this.prof();
    switch (id) {
      case 'kin': return !!c.kin;
      case 'prof': return !!p && this.profOk(p.id);
      case 'attr': return !!c.rolled && !!p && meetsReq(c.rolled, p.id);
      case 'age': return !!c.age;
      case 'back': {
        const sp = c.special != null ? special(c.special) : null;
        return !!sp && (c.hand != null || !!sp.fx.hand) && c.stand != null && c.money != null && this.specialDone();
      }
      case 'yrke': return !!p && this.yrkeValid() && c.yrke.length === p.pick + this.extraCount() && (!p.magic || !!c.school) && (!c.yrke.includes('Stridskonster') || !!c.konst);
      case 'skills': return this.done('yrke') && Object.keys(c.buys).length > 0;
      case 'magi': return !p || !p.magic || Object.keys(c.spells).length > 0;
      case 'gear': return !!p;
      case 'name': return !!(c.name || '').trim();
    }
    return false;
  }
  allDone() { return STEPS.every(s => this.done(s.id)); }
  missing() { return STEPS.filter(s => !this.done(s.id)).map(s => s.name); }

  // Rydder opp etter endringer: ugyldige valg faller bort, og EP som ikke lenger kan betales, gis tilbake.
  normalize() {
    const c = this.c;
    c.yrke = c.yrke || [];
    c.buys = c.buys || {};
    c.spells = c.spells || {};
    c.shift = c.shift || {};
    if (c.profession && !this.profOk(c.profession)) this.setProf(null);
    if (c.sets?.length) { if (!c.sets[c.set]) c.set = 0; c.rolled = shifted(c.sets[c.set], c.shift); }
    if (c.moneyRaw != null) c.money = clampMoney(c.moneyRaw, c.stand);
    const p = this.prof();
    if (p) {
      for (let n = 0; n < 40 && !this.yrkeValid(); n++) this.dropYrke();
      if (!p.magic || (c.school && !c.yrke.includes(c.school))) c.school = null;
      if (c.gear && (c.gear.w?.length !== p.kit.w.length || !c.gear.a || !c.gear.g)) c.gear = null;
    }
    if (c.konst && !c.yrke.includes('Stridskonster')) c.konst = null;
    const kind = specialKind(c.special);
    if (c.specialSkill && (!kind || kind === 'attrs' || kind === 'extra' || !specialOptions(kind, this.draft()).includes(c.specialSkill))) c.specialSkill = null;
    if (kind !== 'attrs') c.specialAttrs = null;
    const v = startValues(this.draft());
    for (const id of Object.keys(c.buys)) { if (v.bought[id] == null) delete c.buys[id]; else c.buys[id] = v.bought[id]; }
    for (const id of Object.keys(c.spells)) { if (v.spells[id] == null) delete c.spells[id]; else c.spells[id] = v.spells[id]; }
    this.v = startValues(this.draft());
    try { this.sheet = buildSheet(this.draft()); } catch (e) { this.sheet = null; }
  }

  // --- tegning ---------------------------------------------------------------

  render() {
    this.normalize();
    this.renderSteps();
    const body = $('#cr-body');
    const top = body.scrollTop;
    body.innerHTML = this['r_' + STEPS[this.step].id]();
    body.scrollTop = top;
    this.bind(body);
    this.updateNav();
    this.updatePreview();
  }
  renderSteps() {
    const el = $('#cr-steps');
    el.innerHTML = STEPS.map((s, i) => `<button class="cr-step${i === this.step ? ' on' : ''}${this.done(s.id) ? ' ok' : ''}" data-i="${i}" title="${s.name}"><b>${i + 1}</b><span>${s.name}</span></button>`).join('');
    el.querySelectorAll('button').forEach(b => (b.onclick = () => this.go(+b.dataset.i)));
  }
  updateNav() {
    const last = this.step === STEPS.length - 1;
    const ok = this.allDone();
    $('#cr-next').textContent = last ? 'Lagre og spill' : 'Neste';
    $('#cr-next').disabled = last && !ok;
    $('#cr-save').hidden = !last;
    $('#cr-save').disabled = !ok;
    const miss = this.missing();
    $('#cr-hint').textContent = miss.length ? `Mangler: ${miss.join(', ')}` : 'Rollpersonen er klar.';
  }
  updatePreview() {
    const s = this.sheet || { id: 'ny-rollperson', kin: this.c.kin || 'manniska', profession: this.c.profession || 'tjuv', age: 'mogen', gear: { w: [], a: [], g: [] } };
    try { this.game.title.setCharacter(s); } catch (e) { /* modellen kan vente til formuläret er komplett */ }
  }
  flash(msg) {
    $('#cr-hint').textContent = msg;
    G.audio?.menuTick?.(44);
  }

  dieBtn(act, label) {
    return `<button class="btn small die-btn" data-act="${act}"><span class="d20"></span>${label}</button>`;
  }
  epBoxes() {
    const v = this.v, left = v.ep - v.spent;
    return `<div class="derived four"><div><b>${v.ep}</b><span>EP i alt</span></div><div><b>${v.spent}</b><span>Brukt</span></div>
      <div><b class="${left ? '' : 'z'}">${left}</b><span>Igjen</span></div><div><b>${v.maxFV}</b><span>Høyest FV</span></div></div>`;
  }

  r_kin() {
    const c = this.c;
    const bonus = r => [
      ...Object.entries(r.skillBonus || {}).map(([k, v]) => (v === 'B5' ? `${k} 20` : `${k} +${v}`)),
      ...(r.darkvision ? ['mørkesyn'] : []),
    ].join(', ');
    return `<p class="cr-lead">Velg ras. Rasen gir terningene for grundegenskapene, förflyttning og noen ferdigheter. Det rasen koster i BP, trekkes fra EP du får til ferdigheter.</p>
      <div class="cards">${RACES.map(r => `<button class="card${c.kin === r.id ? ' on' : ''}" data-kin="${r.id}">
        <div class="roll">${r.bp} BP${r.move ? ` · förflyttning ${signed(r.move)}` : ''}</div><div class="nm">${r.name}</div>
        <div class="ds">${esc(r.desc)}</div>
        <div class="cr-dice">${ATTRS.map(k => `<span><i>${k}</i>${tStr(r.dice[k])}</span>`).join('')}</div>
        ${bonus(r) ? `<div class="ab"><b>Bonus:</b> ${esc(bonus(r))}</div>` : ''}
        ${r.noMagic ? '<div class="ab">Blir normalt ikke magiker.</div>' : ''}
      </button>`).join('')}</div>`;
  }

  r_prof() {
    const c = this.c;
    return `<p class="cr-lead">Velg yrke. Yrket har krav til grundegenskaper, en yrkesförmåga og en liste med yrkesfärdigheter. Du velger 12 av dem (magiker 9). De koster 3 EP per trinn, mot 5 for andre sekundære.</p>
      <div class="cards">${PROFESSIONS.map(p => {
        const no = !this.profOk(p.id);
        const never = this.unreachable(p.id);
        const ab = p.ability ? ABILITIES[p.ability] : null;
        const meets = c.rolled && c.sets ? meetsReq(c.rolled, p.id) : null;
        return `<button class="card${c.profession === p.id ? ' on' : ''}${no ? ' cr-no' : ''}" data-prof="${p.id}" ${no ? 'disabled' : ''}>
          <div class="roll">Krav: ${reqTxt(p)}</div><div class="nm">${p.name}</div>
          <div class="ds">${esc(p.desc)}</div>
          <div class="ab"><b>${ab ? esc(ab.name) : 'Ingen yrkesförmåga'}</b>${ab ? ': ' + esc(ab.text) : '. Lærer besvärjelser fra start.'}</div>
          <div class="meta">${p.pick} yrkesfärdigheter${p.max.vapen ? `, ${p.max.vapen >= 99 ? 'fritt antall' : p.max.vapen} våpen` : ''}</div>
          ${never.length ? `<div class="cr-tag bad">${RACE[c.kin].name} når aldri ${never.join(', ')}</div>` : no ? `<div class="cr-tag bad">${RACE[c.kin].name} blir ikke magiker</div>` : meets === false ? '<div class="cr-tag bad">Settet ditt når ikke kravet</div>' : ''}
        </button>`;
      }).join('')}</div>`;
  }

  r_attr() {
    const c = this.c, p = this.prof(), r = this.race();
    const lead = `<p class="cr-lead">Alle sju slås med terningene for ${r.name.toLowerCase()}, i tre sett. Velg settet du vil ha. Så kan du flytte poeng 2:1: senk én egenskap 2, eller to egenskaper 1 hver, for å heve en annen 1. Aldri over rasens maks.${p ? ` ${p.name} krever ${reqTxt(p)}.` : ' Velg yrke for å se kravene.'}</p>`;
    const row = `<div class="cr-row">${this.dieBtn('roll-sets', c.sets ? 'Slå tre nye sett' : 'Slå tre sett')}${c.sets && Object.keys(c.shift).length ? '<button class="btn small" data-act="reset-shift">Angre flytting</button>' : ''}</div>`;
    if (!c.sets) return lead + row + `<div class="cr-dice big">${ATTRS.map(k => `<span><i>${k}</i>${tStr(r.dice[k])}</span>`).join('')}</div>`;
    const max = raceMax(r.id);
    const ageMods = r.id === 'alv' ? {} : AGE[c.age || 'mogen'].mods;
    const A = this.v.attrs;
    const sets = [0, 1, 2].map(i => c.sets[i] || null);
    const head = `<div class="h"></div><div class="h dc">Terning</div>${sets.map((s, i) => (s
      ? `<button class="h hset${c.set === i ? ' on' : ''}" data-set="${i}">Sett ${i + 1}${p ? `<em class="${meetsReq(s, p.id) ? '' : 'bad'}">${meetsReq(s, p.id) ? 'passer' : 'for lavt'}</em>` : ''}</button>`
      : `<div class="h">Sett ${i + 1}</div>`)).join('')}<div class="h">Flytt</div><div class="h ag">Ålder</div><div class="h">Verdi</div>`;
    const rows = ATTRS.map(k => {
      const req = p?.req[k];
      const sh = c.shift[k] || 0;
      return `<div class="a"><b>${k}</b>${ATTR_NAME[k]}${req ? `<i>krav ${req}</i>` : ''}<small>${ATTR_USE[k]}</small></div>
        <div class="dc">${tStr(r.dice[k])}<br><span>maks ${max[k]}</span></div>
        ${sets.map((s, i) => (s ? `<button class="sv${c.set === i ? ' on' : ''}${req && s[k] < req ? ' low' : ''}" data-set="${i}">${s[k]}</button>` : '<div class="sv">?</div>')).join('')}
        <div class="sh"><button class="pm" data-sh="${k}" data-d="-1" title="Senk">-</button><span>${sh ? signed(sh) : ''}</span><button class="pm" data-sh="${k}" data-d="1" title="Hev">+</button></div>
        <div class="ag">${ageMods[k] ? signed(ageMods[k]) : ''}</div>
        <div class="fv${req && c.rolled[k] < req ? ' low' : ''}">${A[k]}</div>`;
    }).join('');
    const pool = this.pool();
    const lack = p ? Object.entries(p.req).filter(([k, v]) => c.rolled[k] < v).map(([k, v]) => `${k} ${c.rolled[k]} av ${v}`) : [];
    const D = derived(A, r.id, { kpMul: this.v.special?.fx.kpMul });
    return lead + row + `<div class="cr-at">${head}${rows}</div>
      <p class="hint">${pool >= 2 ? `Du har senket nok til å heve ${Math.floor(pool / 2)}.` : pool === 1 ? 'Senk ett poeng til for å kunne heve ett.' : 'Klikk et sett for å velge det.'} Verdien er etter alder${this.v.special?.fx.attrs ? ' og den särskilda förmågan' : ''}. Kravet gjelder før alder.</p>
      ${p ? (lack.length ? `<p class="warn">Kravet for ${p.name.toLowerCase()} er ikke nådd: ${lack.join(', ')}. Velg et annet sett, flytt poeng eller slå på nytt.</p><div class="cr-row"><button class="btn small" data-act="auto-shift">Flytt for meg</button></div>` : `<p class="cr-ok">Settet oppfyller kravet for ${p.name.toLowerCase()}.</p>`) : ''}
      <div class="derived">
        <div><b>${D.kp}</b><span>KP (FYS+STO)/2</span></div>
        <div><b>${D.sb ? '+' + tStr(D.sb) : '-'}</b><span>Skadebonus</span></div>
        <div><b>${D.move}</b><span>Förflyttning</span></div>
        <div><b>${A.STY} kg</b><span>Bärförmåga</span></div>
        <div><b>${A.PSY}</b><span>PSY</span></div>
      </div>`;
  }

  r_age() {
    const c = this.c, kin = c.kin || 'manniska', alv = kin === 'alv';
    const raw = c.rolled;
    return `<p class="cr-lead">Velg ålder. Eldre rollpersoner får flere EP og høyere FV fra start, men kroppen svekkes. Yrkeskravet gjelder ikke etter alderen.${alv ? ' Alver eldes ikke: de regnes som unge for EP og penger og som mogne for grundegenskaper og høyeste FV.' : ''}</p>
      <div class="cards two">${AGES.map((a, i) => {
        const yrs = AGE_YEARS[kin]?.[i];
        return `<button class="card${c.age === a.id ? ' on' : ''}" data-age="${a.id}">
          <div class="roll">${yrs && yrs !== '?' ? `${yrs} år` : 'Ålder'}</div><div class="nm">${a.name}</div>
          <div class="ab">${alv || !Object.keys(a.mods).length ? 'Ingen endring av grundegenskaper' : Object.entries(a.mods).map(([k, v]) => `${k} ${signed(v)}`).join(', ')}</div>
          <div class="meta">${startEP(a.id, kin)} EP · høyest FV ${maxStartFV(a.id, kin)} · penger x${fmtX(alv ? 1 : a.money)}</div>
          ${raw ? `<div class="cr-dice">${ATTRS.map(k => `<span><i>${k}</i>${applyAge(raw, a.id, kin)[k]}</span>`).join('')}</div>` : ''}
        </button>`;
      }).join('')}</div>
      <p class="hint">EP til ferdigheter: alderens EP + 25 minus rasens BP (${RACE[kin].name} ${RACE[kin].bp}).${alv ? ' Alver får alltid 150.' : ''}</p>`;
  }

  r_back() {
    const c = this.c;
    const sp = c.special != null ? special(c.special) : null;
    const kind = specialKind(c.special);
    const hk = sp?.fx.hand || c.hand != null ? handKey(c.hand || 2, sp) : null;
    const mult = c.kin === 'alv' ? 1 : AGE[c.age || 'mogen'].money;
    const v = this.v;
    return `<p class="cr-lead">Fire slag om hvem rollpersonen var før kloakken. Slå hvert for seg, eller alle på en gang.</p>
      <div class="cr-row">${this.dieBtn('roll-back', 'Slå alle fire')}</div>
      <h3>Särskild förmåga <i>2T20 + 1T10</i></h3>
      <div class="cr-row">${this.dieBtn('roll-special', sp ? 'Slå på nytt' : 'Slå')}<span class="cr-res" id="res-special">${sp ? sumD(c.specialDice) + c.special : ''}</span></div>
      ${sp ? `<div class="cr-box"><b>${esc(sp.name)}.</b> ${esc(sp.text)}${this.specialPicker(kind)}</div>` : '<p class="hint">Et talent eller en bakgrunn: bedre i en ferdighet, raskere refleks eller noe annet.</p>'}
      <h3>Svärdshand <i>2T4</i></h3>
      ${sp?.fx.hand ? `<p class="hint">Du er ${HAND[sp.fx.hand].toLowerCase()} fra den särskilda förmågan og slår ikke.</p>`
        : `<div class="cr-row">${this.dieBtn('roll-hand', c.hand != null ? 'Slå på nytt' : 'Slå')}<span class="cr-res" id="res-hand">${c.hand != null ? `${sumD(c.handDice)}${c.hand}: ${HAND[hk]}` : ''}</span></div>`}
      <p class="hint">${hk ? HAND_TXT[hk] + ' Den andre hånda er dårligere, unntatt med skjold og Två vapen.' : '2 til 11 höger, 12 til 14 vänster, 15 til 18 dubbelhänt, 19 og over ambidextriös. Like terninger: slå en til og legg til.'}</p>
      <h3>Socialt stånd <i>2T6</i></h3>
      <div class="cr-row">${this.dieBtn('roll-stand', c.stand != null ? 'Slå på nytt' : 'Slå')}<span class="cr-res" id="res-stand">${c.stand != null ? `${sumD(c.standDice)}${c.stand}: ${standOf(c.stand)}` : ''}</span></div>
      <p class="hint">Like terninger: slå 2T6 til og legg til. Ståndet gir FV i Tala modersmål (16, overklasse og adel 20) og, sammen med INT, i Läsa/Skriva modersmål.${c.stand != null ? ` Du får ${v.base['Tala modersmål']} og ${v.base['Läsa/Skriva modersmål']}.` : ''}</p>
      <h3>Startkapital <i>2T6</i></h3>
      <div class="cr-row">${this.dieBtn('roll-money', c.money != null ? 'Slå på nytt' : 'Slå')}<span class="cr-res" id="res-money">${c.money != null ? `${sumD(c.moneyDice)}${c.moneyRaw ?? c.money}${c.moneyRaw != null && c.moneyRaw !== c.money ? `, høyst 10 fra ståndet: ${c.money}` : ''}` : ''}</span></div>
      <p class="hint">${c.money != null ? `${fmtN(moneyOf(c.money))} sm x ${fmtX(mult)} for alderen = <b>${fmtN(moneyOf(c.money) * mult)} sm</b>. Silveret brukes i butikkene i Fristaden.` : 'Slås som socialt stånd, men havner aldri mer enn 10 over eller under det. Summen ganges med alderen.'}</p>`;
  }

  specialPicker(kind) {
    const c = this.c;
    if (!kind) return '';
    if (kind === 'extra') return '<div class="cr-sub">Velg de to ekstra under Yrkesval.</div>';
    if (kind === 'attrs') {
      const a = c.specialAttrs || [];
      const one = this.saMode === 'en' || (a.length === 2 && a[0] === a[1]);
      return `<div class="cr-sub">Velg</div><div class="seg"><button data-samode="tre" class="${one ? '' : 'on'}">+1 på tre</button><button data-samode="en" class="${one ? 'on' : ''}">+2 på en</button></div>
        <div class="chips">${ATTRS.map(k => `<button class="chip${a.includes(k) ? ' on' : ''}" data-saattr="${k}">${k} <span>${ATTR_NAME[k]}</span></button>`).join('')}</div>`;
    }
    if (c.specialSkill && !this.pickOpen) {
      return `<div class="cr-row"><span class="cr-sub">Valgt: <b>${esc(c.specialSkill)}</b></span><button class="btn small" data-act="pick-open">Endre</button></div><p class="hint">${SPECIAL_HINT[kind]}</p>`;
    }
    const opts = specialOptions(kind, this.draft());
    const groups = [['prim', 'Primära'], ['sek', 'Sekundära'], ['vap', 'Vapen'], ['magi', 'Magi']];
    const yrke = new Set(c.yrke);
    return `<div class="cr-sub">${kind === 'weapon' ? 'Velg et våpen' : kind === 'skill' ? 'Velg en ferdighet' : 'Velg en sekundær ferdighet'}</div>
      <p class="hint">${SPECIAL_HINT[kind]}${yrke.size ? ' Stiplet: yrkesfärdighet.' : ''}</p>` +
      groups.map(([t, n]) => {
        const ids = opts.filter(id => SKILL[id].type === t);
        if (!ids.length) return '';
        return `<div class="cr-sub">${n}</div><div class="chips">${ids.map(id => `<button class="chip${c.specialSkill === id ? ' on' : ''}${yrke.has(id) ? ' dash' : ''}" data-spsk="${esc(id)}" title="${esc(SKILL[id].use || '')}">${esc(id)} <span>${SKILL[id].attr}</span></button>`).join('')}</div>`;
      }).join('');
  }

  r_yrke() {
    const c = this.c, p = this.prof();
    if (!p) return need('Velg yrke først.');
    const A = this.v.attrs;
    const extra = this.extraCount();
    const total = p.pick + extra;
    const kitSkills = this.gearNow().w.map(w => WEAPONS[w]?.skill);
    const chip = (id, cls = '', title = '') => {
      const s = SKILL[id];
      const attr = s ? s.attr : 'SMI';
      return `<button class="chip${c.yrke.includes(id) ? ' on' : ''}${cls}" data-yrke="${esc(id)}" title="${esc(title || s?.use || (id === 'Stridskonster' ? 'Velg en stridskonst under.' : ''))}">${esc(id)} <span>${attr}</span><b>${baseChance(A[attr])}</b></button>`;
    };
    let html = `<p class="cr-lead">Velg ${p.pick} yrkesfärdigheter${extra ? ' og to til fra hele listen (Stort kunskapsområde)' : ''}. Du får BC fra grundegenskapen gratis (tallet), og de koster 3 EP per trinn. Resten av listen blir vanlige sekundære ferdigheter som koster 5 og ikke kan læres ved start.</p>
      <div class="cr-row"><button class="btn small" data-act="auto-yrke">Velg for meg</button><span class="cr-res">${c.yrke.length} av ${total}</span></div>`;
    if (p.magic) {
      html += `<h3>Magiskole <i>påkrevd, teller som en</i></h3><div class="seg big">${SCHOOLS.map(s => `<button data-school="${s}" class="${c.school === s ? 'on' : ''}">${s}</button>`).join('')}</div>
        <p class="hint">${c.school ? esc(SKILL[c.school].use) : 'Skolen du lærer besvärjelser fra.'} INT gir BC i skolen. FV i skolen avgjør hvilke besvärjelser du kan lære og hvor høy E du kan bruke.</p>`;
    }
    html += `<h3>Fra yrket</h3><div class="chips">${p.skills.filter(s => s !== 'vapen' && s !== 'magi').map(id => chip(id)).join('')}</div>`;
    if (p.skills.includes('vapen')) {
      const groups = {};
      for (const id of WEAPON_SKILLS.filter(x => !p.skills.includes(x))) {
        const w = weaponOfSkill(id);
        (groups[w.group] = groups[w.group] || []).push(id);
      }
      html += `<h3>Vapenfärdigheter <i>${this.weaponCount()} av ${p.max.vapen >= 99 ? 'fritt antall' : p.max.vapen}</i></h3>
        <p class="hint">Ett FV per våpen. Med andre våpen i samme gruppe har du minst halvparten. Stiplet: i utrustningen din.</p>
        ${Object.entries(groups).map(([g, ids]) => `<div class="cr-sub">${WEAPON_GROUPS[g].name}</div><div class="chips">${ids.map(id => {
          const w = weaponOfSkill(id);
          return chip(id, kitSkills.includes(id) ? ' dash' : '', `${w.shield ? 'Sköld, BV ' + w.dur : tStr(w.dmg) + ' skade'}, STY ${w.str}`);
        }).join('')}</div>`).join('')}`;
    }
    if (c.yrke.includes('Stridskonster')) html += this.konstPicker();
    if (extra) {
      const out = SKILLS.filter(s => s.type !== 'prim' && s.type !== 'konst' && !this.inList(s.id) && !forbidden(s.id, p.id)).map(s => s.id);
      html += `<h3>Stort kunskapsområde <i>${this.outsideCount()} av ${extra}</i></h3><p class="hint">To valgfrie sekundære ferdigheter blir yrkesfärdigheter.</p><div class="chips">${out.map(id => chip(id)).join('')}</div>`;
    }
    return html;
  }

  konstPicker() {
    const c = this.c;
    return `<h3>Stridskonst</h3><p class="hint">Ett FV for alle teknikkene. Grundkostnaden er summen av teknikkene. Obeväpnad strid går ikke i tyngre rustning enn lær.</p>
      <div class="cards two">${Object.entries(KONSTER).map(([id, k]) => `<button class="card small${c.konst === id ? ' on' : ''}" data-konst="${esc(id)}">
        <div class="roll">Grundkostnad ${konstCost(id)} · ${esc(k.src)}</div><div class="nm">${esc(id)}</div>
        <div class="ds">${esc(k.who)}</div>
        <div class="ab">${k.parts.map(x => KONST_PARTS[x].name).join(', ')}</div>
      </button>`).join('')}</div>`;
  }

  skHead(first = 'Ferdighet', st = 'Start', fv = 'FV') {
    return `<div class="cr-sk hd"><span>${first}</span><span class="at"></span><span class="st">${st}</span><span></span><span class="at">${fv}</span><span></span><span class="co">Neste</span></div>`;
  }
  skRow(id) {
    const v = this.v;
    const left = v.ep - v.spent;
    const base = v.base[id] ?? 0;
    const cur = v.bought[id] ?? base;
    const cap = v.capOf(id);
    const next = cur < cap ? fvCost(cur, cur + 1, baseCost(id, v.draft)) : null;
    const s = SKILL[id];
    return `<div class="cr-sk${cur > base ? ' up' : ''}"><span class="nm" title="${esc(s?.use || '')}">${esc(id)}</span><span class="at">${s?.attr || ''}</span><span class="st">${base}</span>
      <button class="pm" data-buy="${esc(id)}" data-d="-1" ${cur > base ? '' : 'disabled'}>-</button><b>${cur}</b><button class="pm" data-buy="${esc(id)}" data-d="1" ${next != null && next <= left ? '' : 'disabled'}>+</button>
      <span class="co">${next == null ? 'maks' : next + ' EP'}</span></div>`;
  }

  r_skills() {
    const c = this.c, p = this.prof();
    if (!p) return need('Velg yrke først.');
    const v = this.v;
    const dr = this.draft();
    const yrkeRows = c.yrke.filter(id => SKILL[id] && canBuy(id, dr));
    if (c.konst && canBuy(c.konst, dr)) yrkeRows.push(c.konst);
    if (c.kin === 'dvarg' && !yrkeRows.includes('Geologi')) yrkeRows.push('Geologi');
    const prim = SKILLS.filter(s => s.type === 'prim').map(s => s.id);
    const shown = new Set([...yrkeRows, ...prim]);
    const others = Object.entries(v.skills).filter(([id, fv]) => fv > 0 && !shown.has(id));
    return `<p class="cr-lead">Fordel EP. Primära färdigheter koster 2 per trinn, yrkesfärdigheter 3${c.konst ? `, ${esc(c.konst)} ${baseCost(c.konst, v.draft)}` : ''}. Over FV 10 koster hvert trinn mer (Bok I s. 29). Ved start er høyeste FV ${v.maxFV}. Shift-klikk tar fem trinn.</p>
      ${this.epBoxes()}
      <div class="cr-row"><button class="btn small" data-act="auto-buys">Fordel for meg</button><button class="btn small" data-act="reset-buys">Nullstill</button></div>
      ${p.magic ? '<p class="hint">Magiker: spar EP til besvärjelser i neste steg, og hev skolen til skolvärdet du vil nå.</p>' : ''}
      <h3>Yrkesfärdigheter</h3>${this.skHead()}${yrkeRows.map(id => this.skRow(id)).join('')}
      <h3>Primära färdigheter</h3><div class="cr-cols"><div>${this.skHead()}${prim.slice(0, 10).map(id => this.skRow(id)).join('')}</div><div>${this.skHead()}${prim.slice(10).map(id => this.skRow(id)).join('')}</div></div>
      ${others.length ? `<h3>Har du fra før <i>kan ikke heves med EP ved start</i></h3><div class="chips">${others.map(([id, fv]) => `<span class="chip lock">${esc(id)} <b>${fv}</b></span>`).join('')}</div>` : ''}`;
  }

  r_magi() {
    const c = this.c, p = this.prof();
    if (!p) return need('Velg yrke først.');
    if (!p.magic) {
      if (p.id === 'utbygdsjagare') {
        return need(`Utbygdsjägare kan lære Animism og besvärjelser med skolvärde 12 eller lavere, men ingen besvärjelser fra start (Bok I s. 22). ${c.yrke.includes('Animism') ? 'Du har Animism som yrkesfärdighet, så Gynerva i byen kan lære deg dem senere.' : 'Ta Animism som yrkesfärdighet hvis du vil lære dem senere.'}`);
      }
      return need(`Bare magiker lærer besvärjelser fra start. ${p.name} hopper over dette steget.`);
    }
    if (!c.school) return need('Velg magiskole under Yrkesval først.');
    const v = this.v;
    const fv = v.skills[c.school] || 0;
    const list = Object.entries(SPELLS).filter(([, s]) => s.school === c.school || s.school === 'Allmän').sort((a, b) => a[1].sv - b[1].sv || a[1].name.localeCompare(b[1].name));
    return `<p class="cr-lead">Du kan lære besvärjelser med skolvärde (SV) opp til FV i ${c.school}. Allmänna regnes til skolen din. S er hvor godt du kan besvärjelsen, som et FV. Slaget er S - 2 x (E - 1), og lykkes det, koster det E PSY. Du har PSY ${v.attrs.PSY}. Ingen magi med metall mot kroppen.</p>
      ${this.epBoxes()}
      <div class="cr-row"><button class="btn small" data-act="auto-spells">Velg og fordel for meg</button><span class="hint">Fordeler også EP på nytt.</span></div>
      <h3>Skolen</h3>${this.skHead()}${this.skRow(c.school)}
      <h3>Besvärjelser <i>${Object.keys(c.spells).length} valgt</i></h3>${this.skHead('Besvärjelse', 'Grk', 'S')}
      ${list.map(([id, s]) => this.spRow(id, s, fv)).join('')}`;
  }
  spRow(id, s, fv) {
    const c = this.c, v = this.v;
    const left = v.ep - v.spent;
    const cur = c.spells[id] || 0;
    const locked = s.sv > fv;
    const next = cur < v.maxFV ? fvCost(cur, cur + 1, spellBaseCost(s.sv)) : null;
    return `<div class="cr-sk${cur ? ' up' : ''}${locked ? ' off' : ''}"><span class="nm">${esc(s.name)}${s.school === 'Allmän' ? ' <i>allmän</i>' : ''}</span><span class="at">SV ${s.sv}</span><span class="st">${spellBaseCost(s.sv)}</span>
      <button class="pm" data-spell="${id}" data-d="-1" ${cur ? '' : 'disabled'}>-</button><b>${cur || '-'}</b><button class="pm" data-spell="${id}" data-d="1" ${!locked && next != null && next <= left ? '' : 'disabled'}>+</button>
      <span class="co">${locked ? `trenger ${s.sv}` : next == null ? 'maks' : next + ' EP'}</span>
      <span class="tx">${esc(s.text)}</span></div>`;
  }

  gearNow() {
    const p = this.prof() || PROF.tjuv;
    const g = kitOf(this.c, this.v?.attrs?.STY ?? 10);
    return { w: [...g.w], a: [...g.a], g: [...g.g] };
  }

  r_gear() {
    const c = this.c, p = this.prof();
    if (!p) return need('Velg yrke først.');
    const g = this.gearNow();
    const A = this.v.attrs;
    let all = 0, bag = 0;
    const wRows = g.w.map((id, i) => {
      const w = WEAPONS[id];
      all += w.kg;
      if (i >= 2) bag += w.kg;
      const hands = w.twoOnly || w.ranged ? 'to hender' : A.STY >= w.str ? 'én hånd' : A.STY * 2 >= w.str ? 'to hender' : 'for tung';
      const swapped = p.kit.w[i] !== id ? (c.gear ? 'byttet' : 'lettere, for STY') : '';
      return `<div class="cr-kit"><span class="nm">${esc(w.name)}${swapped ? `<i>${swapped}</i>` : ''}<small>${w.shield ? `Sköld, BV ${w.dur}` : `${tStr(w.dmg)} skade`}, STY ${w.str} (${hands}), FV ${weaponFV(this.v.skills, w)}</small></span>
        <span class="kg">${kg(w.kg)}</span><span class="pr">${fmtN(w.price)} sm</span><button class="btn small" data-swap="${i}">${this.swapIdx === i ? 'Lukk' : 'Bytt'}</button></div>${this.swapIdx === i ? this.swapList(i) : ''}`;
    }).join('');
    const aRows = g.a.map(id => {
      const a = ARMORS[id];
      all += a.kg;
      return `<div class="cr-kit"><span class="nm">${esc(a.name)}<small>Absorbering ${a.abs} på ${a.covers.map(l => LOC_NAME[l].toLowerCase()).join(', ')}${a.metal ? '. Metall' : ''}</small></span><span class="kg">${kg(a.kg)}</span><span class="pr">${fmtN(a.price)} sm</span><span></span></div>`;
    }).join('');
    const gRows = g.g.map(id => {
      const x = GEAR[id];
      all += x.kg;
      bag += x.kg;
      return `<div class="cr-kit"><span class="nm">${esc(x.name)}</span><span class="kg">${kg(x.kg)}</span><span class="pr">${fmtN(x.price)} sm</span><span></span></div>`;
    }).join('');
    const metal = p.magic && g.a.some(id => ARMORS[id].metal);
    return `<p class="cr-lead">Boka gir ikke yrkene fast utrustning. Dette er spillets forslag for ${p.name.toLowerCase()}. Du kan bytte ett våpen mot et som koster det samme eller mindre.</p>
      <h3>Våpen</h3>${wRows}
      ${aRows ? `<h3>Rustning</h3>${aRows}` : ''}
      <h3>Annet</h3>${gRows}
      ${metal ? '<p class="warn">Magikere kan ikke trylle i metallrustning.</p>' : ''}
      <div class="derived four" style="margin-top:12px"><div><b>${kg(bag)}</b><span>I sekken</span></div><div><b>${A.STY} kg</b><span>Bärförmåga</span></div>
        <div><b>${kg(all)}</b><span>Alt i alt</span></div><div><b>${this.sheet ? fmtN(this.sheet.silver) : '?'}</b><span>Silver (sm)</span></div></div>
      <p class="hint">Bärförmåga er STY kg. Det du har på deg og i hendene, teller ikke. Bærer du mer, blir du överlastad: tregere, og dårligere til å snike, hoppe og klatre.</p>`;
  }

  swapList(i) {
    const p = this.prof(), A = this.v.attrs;
    const orig = WEAPONS[p.kit.w[i]];
    const cur = this.gearNow().w[i];
    const own = new Set(this.c.yrke);
    const alts = Object.values(WEAPONS)
      .filter(w => !w.unarmed && w.skill !== 'Slagsmål' && !!w.shield === !!orig.shield && w.price <= orig.price && w.id !== orig.id && w.str <= A.STY * 2)
      .sort((a, b) => b.price - a.price);
    return `<div class="cr-box"><div class="cr-sub">${esc(orig.name)} kan byttes mot noe til ${fmtN(orig.price)} sm eller mindre. Bare ett bytte.</div>
      <div class="chips">${cur !== orig.id ? `<button class="chip" data-act="reset-gear">Behold ${esc(orig.name.toLowerCase())}</button>` : ''}
      ${alts.map(w => `<button class="chip${cur === w.id ? ' on' : ''}${own.has(w.skill) ? ' dash' : ''}" data-swapto="${w.id}" data-i="${i}" title="${w.shield ? 'Sköld' : tStr(w.dmg) + ' skade'}, STY ${w.str}, ${kg(w.kg)}">${esc(w.name)} <span>${w.shield ? 'BV ' + w.dur : tStr(w.dmg)}</span><b>${fmtN(w.price)}</b></button>`).join('')}</div>
      <p class="hint">Stiplet: du har ferdigheten som yrkesfärdighet.</p></div>`;
  }

  r_name() {
    const c = this.c, r = this.race();
    const ad = c.aidne != null ? AIDNE[c.aidne] : null;
    let sheet;
    if (this.allDone()) {
      try { sheet = `<div class="cr-sheet">${sheetHTML(buildSheet(this.finalChoices()))}</div>`; } catch (e) { sheet = this.miniSheet(); }
    } else sheet = `<p class="warn">Mangler før du kan lagre: ${this.missing().join(', ')}.</p>`;
    return `<p class="cr-lead">Navn, kjønn og utseende har ingen regeleffekt. Aidne-bakgrunnen er smak fra Ereb Altor: folk i byen svarer etter den.</p>
      <div class="field"><label for="cr-name">Navn</label><input id="cr-name" maxlength="28" value="${esc(c.name)}" placeholder="${esc(r.names[0])}" autocomplete="off">${this.dieBtn('roll-name', 'Foreslå')}</div>
      <div class="field"><label>Kjønn</label><div class="seg"><button data-sex="man" class="${c.sex === 'man' ? 'on' : ''}">Mann</button><button data-sex="kvinna" class="${c.sex === 'kvinna' ? 'on' : ''}">Kvinne</button></div></div>
      <div class="field"><label>Utseende</label><span class="val">${esc(c.appearance || 'Ingenting særlig')}</span>${this.dieBtn('roll-look', 'Slå T20')}<button class="btn small" data-act="no-look">Ingen</button></div>
      <div class="chips">${APPEARANCE.map((a, i) => `<button class="chip${c.appearance === a ? ' on' : ''}" data-look="${i}">${esc(a)}</button>`).join('')}</div>
      <h3>Ereb Altor: Aidne <i>valgfritt</i></h3>
      <p class="hint">Aidne er landet rundt Zorakin, Kardunien og fjellene i nord. Språk: jori, svartiska, narguriska.</p>
      <div class="cr-row">${this.dieBtn('roll-aidne', 'Slå T10')}<button class="btn small" data-act="no-aidne">Ingen</button></div>
      <div class="chips">${AIDNE.map((a, i) => `<button class="chip${c.aidne === i ? ' on' : ''}" data-aidne="${i}" title="${esc(a.ex)}"><span>${i + 1}</span>${esc(a.stand)}</button>`).join('')}</div>
      ${ad ? `<div class="cr-box"><b>${esc(ad.stand)}</b> (${esc(ad.ex.toLowerCase())}). ${esc(ad.place)}</div>` : ''}
      <h3>Rollformulär</h3>${sheet}`;
  }

  // reserve hvis sheetHTML ikke kan tegne formuläret
  miniSheet() {
    const s = buildSheet(this.finalChoices());
    const D = derived(s.attrs, s.kin, { kpMul: s.special?.fx.kpMul });
    const top = Object.entries(s.skills).filter(([id]) => s.yrke.includes(id) || id === s.konst).sort((a, b) => b[1] - a[1]).slice(0, 8);
    return `<div class="cr-sheet"><b>${esc(s.name)}</b>: ${RACE[s.kin].name}, ${PROF[s.profession].name.toLowerCase()}, ${AGE[s.age].name.toLowerCase()}.
      <div class="cr-dice big">${ATTRS.map(k => `<span><i>${k}</i>${s.attrs[k]}</span>`).join('')}</div>
      KP ${D.kp}, skadebonus ${D.sb ? '+' + tStr(D.sb) : 'ingen'}, förflyttning ${D.move}. ${s.special ? esc(s.special.name) + '. ' : ''}${HAND[s.hand]}. ${esc(s.stand)}. ${fmtN(s.silver)} sm.
      <div class="cr-sub">Yrkesfärdigheter</div>${top.map(([id, fv]) => `${esc(id)} ${fv}`).join(', ')}
      ${Object.keys(s.spells).length ? `<div class="cr-sub">Besvärjelser</div>${Object.entries(s.spells).map(([id, S]) => `${esc(SPELLS[id].name)} S${S}`).join(', ')}` : ''}</div>`;
  }

  // --- handlinger ---------------------------------------------------------------

  bind(body) {
    const c = this.c;
    const on = (sel, fn) => body.querySelectorAll(sel).forEach(b => (b.onclick = e => fn(b, e)));
    on('[data-kin]', b => { this.setKin(b.dataset.kin); this.render(); });
    on('[data-prof]', b => { this.setProf(b.dataset.prof); this.render(); });
    on('[data-set]', b => { c.set = +b.dataset.set; c.shift = {}; G.audio?.menuSelect?.(); this.render(); });
    on('[data-sh]', b => this.shiftAttr(b.dataset.sh, +b.dataset.d));
    on('[data-age]', b => { c.age = b.dataset.age; G.audio?.menuSelect?.(); this.render(); });
    on('[data-spsk]', b => { c.specialSkill = b.dataset.spsk; this.pickOpen = false; G.audio?.menuTick?.(66); this.render(); });
    on('[data-samode]', b => { this.saMode = b.dataset.samode; c.specialAttrs = []; this.render(); });
    on('[data-saattr]', b => { this.clickSpecialAttr(b.dataset.saattr); this.render(); });
    on('[data-yrke]', b => { this.toggleYrke(b.dataset.yrke); this.render(); });
    on('[data-school]', b => { this.setSchool(b.dataset.school); this.render(); });
    on('[data-konst]', b => { c.konst = b.dataset.konst; G.audio?.menuSelect?.(); this.render(); });
    on('[data-buy]', (b, e) => this.buy(b.dataset.buy, +b.dataset.d * (e.shiftKey ? 5 : 1)));
    on('[data-spell]', (b, e) => this.buySpell(b.dataset.spell, +b.dataset.d * (e.shiftKey ? 5 : 1)));
    on('[data-swap]', b => { const i = +b.dataset.swap; this.swapIdx = this.swapIdx === i ? null : i; this.render(); });
    on('[data-swapto]', b => this.swapTo(+b.dataset.i, b.dataset.swapto));
    on('[data-sex]', b => { c.sex = c.sex === b.dataset.sex ? null : b.dataset.sex; this.render(); });
    on('[data-look]', b => { c.appearance = APPEARANCE[+b.dataset.look]; this.render(); });
    on('[data-aidne]', b => { c.aidne = +b.dataset.aidne; this.render(); });
    on('[data-act]', b => this.act(b.dataset.act));
    const nm = body.querySelector('#cr-name');
    if (nm) nm.oninput = () => { c.name = nm.value; this.renderSteps(); this.updateNav(); };
  }

  setKin(id) {
    const c = this.c;
    if (c.kin !== id) {
      const wasSuggestion = !c.name || RACES.some(r => r.names.includes(c.name) || (r.ereb || []).includes(c.name));
      c.kin = id;
      // andre terninger: settene må slås på nytt
      c.sets = null;
      c.rolled = null;
      c.shift = {};
      c.set = 0;
      if (c.profession && !this.profOk(c.profession)) this.setProf(null);
      if (id === 'alv' && !c.age) c.age = 'mogen';
      if (wasSuggestion) c.name = '';
    }
    G.audio?.menuSelect?.();
  }
  setProf(id) {
    const c = this.c;
    if (c.profession === id) return;
    c.profession = id;
    c.school = null;
    c.yrke = [];
    c.konst = null;
    c.buys = {};
    c.spells = {};
    c.gear = null;
    this.swapIdx = null;
    G.audio?.menuSelect?.();
  }
  setSchool(s) {
    const c = this.c, p = this.prof();
    c.yrke = c.yrke.filter(id => SKILL[id]?.type !== 'magi' || id === s);
    if (!c.yrke.includes(s)) {
      if (c.yrke.length >= p.pick + this.extraCount()) { this.flash('Magiskolen må være med. Fjern en annen ferdighet først.'); return; }
      c.yrke.unshift(s);
    }
    c.school = s;
    G.audio?.menuSelect?.();
  }
  toggleYrke(id) {
    const c = this.c, p = this.prof();
    const i = c.yrke.indexOf(id);
    if (i >= 0) {
      c.yrke.splice(i, 1);
      if (p.magic && id === c.school) c.school = null;
      G.audio?.menuTick?.(60);
      return;
    }
    c.yrke.push(id);
    if (!this.yrkeValid()) {
      c.yrke.pop();
      const full = c.yrke.length >= p.pick + this.extraCount();
      const weapon = SKILL[id]?.type === 'vap' && !p.skills.includes(id);
      this.flash(full ? 'Du har valgt så mange du kan. Fjern en først.' : weapon ? `Høyst ${p.max.vapen} vapenfärdigheter for ${p.name.toLowerCase()}${this.extraCount() ? ', og de frie valgene er brukt' : ''}.` : 'De frie valgene er brukt.');
      return;
    }
    if (p.magic && SKILL[id]?.type === 'magi') c.school = id;
    if (id === 'Stridskonster' && !c.konst) c.konst = defaultKonst(this.draft());
    G.audio?.menuTick?.(66);
  }
  clickSpecialAttr(k) {
    const c = this.c;
    let a = [...(c.specialAttrs || [])];
    const one = this.saMode === 'en' || (a.length === 2 && a[0] === a[1]);
    if (one) a = [k, k];
    else {
      const i = a.indexOf(k);
      if (i >= 0) a.splice(i, 1);
      else { if (a.length >= 3) a.shift(); a.push(k); }
    }
    c.specialAttrs = a;
    G.audio?.menuTick?.(66);
  }
  setSpecial(r) {
    const c = this.c;
    c.special = r.total;
    c.specialDice = r.dice;
    c.specialSkill = null;
    c.specialAttrs = null;
    this.saMode = 'tre';
    this.pickOpen = false;
  }

  // 2:1: to poeng ned gir ett opp. Aldri over rasens maks, aldri under 3.
  shiftAttr(k, dlt) {
    const c = this.c;
    if (!c.sets) return;
    const base = c.sets[c.set][k];
    const cur = c.shift[k] || 0;
    const pool = this.pool();
    if (dlt > 0) {
      if (cur < 0) { if (pool < 1) return this.flash('Poenget er allerede brukt. Senk noe annet først.'); }
      else if (pool < 2) return this.flash('Senk først: to poeng ned gir ett opp.');
      else if (base + cur + 1 > raceMax(c.kin)[k]) return this.flash(`Rasens maks for ${k} er ${raceMax(c.kin)[k]}.`);
    } else if (cur <= 0 && base + cur - 1 < 3) return this.flash(`${k} kan ikke bli lavere enn 3.`);
    c.shift[k] = cur + dlt;
    if (!c.shift[k]) delete c.shift[k];
    G.audio?.menuTick?.(64 + dlt * 2);
    this.render();
  }

  // Minste flytting som når yrkets krav for et sett: hev det som mangler, senk det som har mest å gå på.
  // Gir { shift, up } eller null hvis settet ikke kan nå kravet.
  planShift(set) {
    const p = this.prof(), max = raceMax(this.c.kin);
    const shift = {};
    const val = k => set[k] + (shift[k] || 0);
    const floor = k => p.req[k] || 3;
    let up = 0;
    for (const [k, v] of Object.entries(p.req)) {
      if (set[k] >= v) continue;
      if (v > max[k]) return null;
      shift[k] = v - set[k];
      up += v - set[k];
    }
    for (let down = up * 2; down > 0; down--) {
      const k = ATTRS.filter(x => !(shift[x] > 0) && val(x) - 1 >= floor(x)).sort((a, b) => (val(b) - floor(b)) - (val(a) - floor(a)) || (p.req[a] ? 1 : 0) - (p.req[b] ? 1 : 0))[0];
      if (!k) return null;
      shift[k] = (shift[k] || 0) - 1;
    }
    return { shift, up };
  }
  // Velger settet som trenger minst flytting, og flytter
  autoShift() {
    const c = this.c, p = this.prof();
    if (!c.sets || !p) return;
    let best = null;
    c.sets.forEach((s, i) => {
      const plan = this.planShift(s);
      const sum = ATTRS.reduce((a, k) => a + s[k], 0);
      if (plan && (!best || plan.up < best.up || (plan.up === best.up && sum > best.sum))) best = { ...plan, i, sum };
    });
    if (!best) return this.flash('Ingen av settene kan nå kravet. Slå på nytt.');
    c.set = best.i;
    c.shift = best.shift;
    G.audio?.menuSelect?.();
    this.render();
  }

  buy(id, dlt) {
    const c = this.c, v = this.v;
    const base = v.base[id] ?? 0;
    const cur = v.bought[id] ?? base;
    if (dlt > 0) {
      const cap = v.capOf(id);
      let to = Math.min(cap, cur + dlt);
      while (to > cur && fvCost(cur, to, baseCost(id, v.draft)) > v.ep - v.spent) to--;
      if (to <= cur) return this.flash(cur >= cap ? `Høyest FV ${cap} ved start.` : 'Ikke nok EP igjen.');
      c.buys[id] = to;
    } else {
      const to = Math.max(base, cur + dlt);
      if (to <= base) delete c.buys[id];
      else c.buys[id] = to;
    }
    G.audio?.menuTick?.(dlt > 0 ? 68 : 60);
    this.render();
  }
  buySpell(id, dlt) {
    const c = this.c, v = this.v, s = SPELLS[id];
    const cur = c.spells[id] || 0;
    if (dlt > 0) {
      if (s.sv > (v.skills[c.school] || 0)) return this.flash(`${s.name} krever ${s.sv} i ${c.school}.`);
      let to = Math.min(v.maxFV, cur + dlt);
      while (to > cur && fvCost(cur, to, spellBaseCost(s.sv)) > v.ep - v.spent) to--;
      if (to <= cur) return this.flash(cur >= v.maxFV ? `Høyest S ${v.maxFV} ved start.` : 'Ikke nok EP igjen.');
      c.spells[id] = to;
    } else {
      const to = Math.max(0, cur + dlt);
      if (to <= 0) delete c.spells[id];
      else c.spells[id] = to;
    }
    G.audio?.menuTick?.(dlt > 0 ? 68 : 60);
    this.render();
  }
  swapTo(i, id) {
    const c = this.c, kit = this.prof().kit;
    const w = kit.w.map((x, j) => (j === i ? id : x));
    c.gear = w.every((x, j) => x === kit.w[j]) ? null : { w, a: [...kit.a], g: [...kit.g] };
    this.swapIdx = null;
    G.audio?.menuSelect?.();
    this.render();
  }

  // animerer et terningslag i et element og kaller cb etterpå
  spin(el, sides, final, cb) {
    let n = 0;
    G.audio?.dice?.();
    const iv = setInterval(() => {
      if (el) el.textContent = d(sides);
      if (++n > 7) {
        clearInterval(iv);
        if (el) el.textContent = final;
        cb?.();
      }
    }, 45);
  }

  rollSets() {
    const c = this.c, p = this.prof();
    const kin = c.kin || 'manniska';
    const sets = [0, 1, 2].map(() => rollRaceAttrs(kin));
    c.sets = [];
    c.shift = {};
    G.audio?.dice?.();
    let i = 0;
    const next = () => {
      if ((c.kin || 'manniska') !== kin) return;
      c.sets.push(sets[i++]);
      c.set = i < 3 ? c.sets.length - 1 : Math.max(0, p ? sets.findIndex(s => meetsReq(s, p.id)) : 0);
      this.render();
      G.audio?.menuTick?.(60 + i * 3);
      if (i < 3) setTimeout(next, 150);
    };
    next();
  }

  act(a) {
    const c = this.c, p = this.prof();
    const el = id => document.getElementById(id);
    switch (a) {
      case 'roll-sets': this.rollSets(); return;
      case 'reset-shift': c.shift = {}; break;
      case 'auto-shift': this.autoShift(); return;
      case 'pick-open': this.pickOpen = true; break;
      case 'roll-special': { const r = rollSpecial(); this.spin(el('res-special'), 50, sumD(r.dice) + r.total, () => { this.setSpecial(r); this.render(); }); return; }
      case 'roll-hand': { const r = rollHand(); this.spin(el('res-hand'), 8, sumD(r.dice) + r.total, () => { c.hand = r.total; c.handDice = r.dice; this.render(); }); return; }
      case 'roll-stand': { const r = rollStand(); this.spin(el('res-stand'), 12, sumD(r.dice) + r.total, () => { c.stand = r.total; c.standDice = r.dice; this.render(); }); return; }
      case 'roll-money': { const r = rollMoney(c.stand); this.spin(el('res-money'), 12, sumD(r.dice) + r.raw, () => { c.moneyRaw = r.raw; c.money = r.total; c.moneyDice = r.dice; this.render(); }); return; }
      case 'roll-back': {
        const sp = rollSpecial(), h = rollHand(), st = rollStand(), m = rollMoney(st.total);
        this.setSpecial(sp);
        Object.assign(c, { hand: h.total, handDice: h.dice, stand: st.total, standDice: st.dice, moneyRaw: m.raw, money: m.total, moneyDice: m.dice });
        G.audio?.dice?.();
        break;
      }
      case 'auto-yrke':
        if (!p) return;
        if (p.magic && !c.school) c.school = 'Elementarmagi';
        c.yrke = autoYrke(p.id, this.draft());
        if (c.yrke.includes('Stridskonster') && !c.konst) c.konst = defaultKonst(this.draft());
        G.audio?.menuSelect?.();
        break;
      case 'auto-buys':
        if (!p) return;
        if (p.magic && !Object.keys(c.spells).length) c.spells = autoSpells(this.draft());
        c.buys = autoBuys(this.draft());
        G.audio?.menuSelect?.();
        break;
      case 'reset-buys': c.buys = {}; break;
      case 'auto-spells':
        c.spells = autoSpells(this.draft());
        c.buys = autoBuys(this.draft());
        G.audio?.menuSelect?.();
        break;
      case 'reset-gear': c.gear = null; this.swapIdx = null; break;
      case 'roll-name': { const r = this.race(); c.name = pick([...r.names, ...(r.ereb || [])]); break; }
      case 'roll-look': c.appearance = APPEARANCE[d(20) - 1]; G.audio?.dice?.(); break;
      case 'no-look': c.appearance = null; break;
      case 'roll-aidne': c.aidne = d(AIDNE.length) - 1; G.audio?.dice?.(); break;
      case 'no-aidne': c.aidne = null; break;
      default: return;
    }
    this.render();
  }

  randomAll() {
    const r = randomChoices();
    if (!r) return;
    this.c = { ...this.fresh(), ...r, id: this.c.id };
    if (!this.c.id) delete this.c.id;
    this.swapIdx = null;
    this.saMode = 'tre';
    this.pickOpen = false;
    G.audio?.menuSelect?.();
    this.step = STEPS.length - 1;
    this.render();
    // vis formuläret med en gang
    const body = $('#cr-body'), sheet = body.querySelector?.('.cr-sheet');
    body.scrollTop = sheet ? Math.max(0, body.scrollTop + sheet.getBoundingClientRect().top - body.getBoundingClientRect().top - 48) : 0;
  }

  finish(start) {
    if (!this.allDone()) return;
    const sheet = buildSheet(this.finalChoices());
    this.c.id = sheet.id;
    this.game.saveCharacter(sheet);
    G.audio?.menuSelect?.();
    if (start) this.game.startWith(sheet);
    else { this.game.showView('tv-pick'); this.game.refreshPick(); }
  }
}
