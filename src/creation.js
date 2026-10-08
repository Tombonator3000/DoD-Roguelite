// Rollpersonsskaping etter Drakar och Demoner (2023), kapittel 2.
// Släkte (T12), yrke (T10), ålder (T6), grundegenskaper (4T6, stryk laveste, ett bytte),
// färdigheter (6 av yrkets 8 + frie etter alder), hjälteförmåga eller magi, utrustning (T6), bakgrunn.
import { G } from './state.js';
import { d, rollDice, rollAttr, buildSheet, computeSkills, applyAge, randomChoices, shuffle, pick } from './rules.js';
import {
  ATTRS, ATTR_NAME, KINS, KIN, PROFESSIONS, PROF, AGES, SKILLS, SKILL, HEROIC, KIN_ABILITIES, SPELLS, TRICKS,
  WEAPONS, ARMORS, HELMETS, GEAR, WEAKNESS, APPEARANCE, MEMENTO, AIDNE, baseChance, dmgBonusDie, moveMod, kinFromD12, ageFromD6,
} from './dod.js';
import { sheetHTML } from './ui.js';

const $ = s => document.querySelector(s);
const STEPS = [
  { id: 'kin', name: 'Släkte' },
  { id: 'prof', name: 'Yrke' },
  { id: 'age', name: 'Ålder' },
  { id: 'attr', name: 'Egenskaper' },
  { id: 'skills', name: 'Färdigheter' },
  { id: 'abil', name: 'Förmågor' },
  { id: 'gear', name: 'Utrustning' },
  { id: 'back', name: 'Bakgrunn' },
];
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const tS = e => String(e || '').toUpperCase().replace(/D/g, 'T');

function wName(id) { return WEAPONS[id]?.name || id; }
function itemList(pk) {
  const parts = [];
  for (const w of pk.w) {
    if (w.endsWith('*2')) parts.push(`2 ${wName(w.slice(0, -2)).toLowerCase()}er`);
    else parts.push(w.split('|').map(wName).join(' eller '));
  }
  if (pk.a) parts.push(ARMORS[pk.a].name);
  if (pk.h) parts.push(HELMETS[pk.h].name);
  for (const g of pk.g || []) parts.push(GEAR[g].name);
  return parts.join(', ');
}

export class Creator {
  constructor(game) {
    this.game = game;
    this.step = 0;
    this.c = this.fresh();
    $('#cr-prev').onclick = () => this.go(this.step - 1);
    $('#cr-next').onclick = () => (this.step < STEPS.length - 1 ? this.go(this.step + 1) : this.finish(true));
    $('#cr-random').onclick = () => this.randomAll();
  }

  fresh() {
    return { kin: null, profession: null, school: null, age: null, rawAttrs: null, rolls: null, swap: null, swapped: false, profSkills: [], freeSkills: [], heroic: [], spells: [], tricks: [], pkg: null, weaponPick: null, silver: null, food: null, name: '', weakness: null, appearance: null, memento: null, aidne: null, extraSkill: null, useAidne: false };
  }

  open(existing) {
    this.c = existing ? JSON.parse(JSON.stringify(existing)) : this.fresh();
    this.step = 0;
    this.render();
  }

  go(i) {
    if (i < 0) { this.game.showView('tv-pick'); this.game.refreshPick(); return; }
    this.step = Math.max(0, Math.min(STEPS.length - 1, i));
    G.audio.menuTick?.(62 + this.step * 2);
    this.render();
    $('#cr-body').scrollTop = 0;
  }

  // --- status -------------------------------------------------------------

  done(id) {
    const c = this.c;
    const prof = c.profession && PROF[c.profession];
    switch (id) {
      case 'kin': return !!c.kin;
      case 'prof': return !!c.profession && (!prof.mage || !!c.school);
      case 'age': return !!c.age;
      case 'attr': return !!c.rawAttrs;
      case 'skills': return !!prof && c.profSkills.length === 6 && c.freeSkills.length === this.freeCount();
      case 'abil': return !!prof && (prof.mage ? c.spells.length === 3 && c.tricks.length === 3 : c.heroic.length === 1);
      case 'gear': return !!c.pkg && c.silver != null;
      case 'back': return !!c.name.trim();
    }
    return false;
  }
  freeCount() {
    return (AGES.find(a => a.id === this.c.age) || AGES[1]).free;
  }
  allDone() { return STEPS.every(s => this.done(s.id)); }

  attrsNow() {
    if (!this.c.rawAttrs) return null;
    return applyAge(this.c.rawAttrs, this.c.age || 'medel');
  }
  skillsNow() {
    const A = this.attrsNow() || { STY: 10, FYS: 10, SMI: 10, INT: 10, PSY: 10, KAR: 10 };
    const tr = [...this.c.profSkills, ...this.c.freeSkills, ...(this.c.useAidne && this.c.extraSkill ? [this.c.extraSkill] : [])];
    return computeSkills(A, tr);
  }

  // Midlertidig formulär til forhåndsvisning (modellen på plattformen)
  previewSheet() {
    const c = this.c;
    return {
      id: 'preview-' + (c.name || 'x') + (c.kin || ''), kin: c.kin || 'manniska', profession: c.profession || 'tjuv', school: c.school, age: c.age || 'medel',
      gear: c.profession ? (() => { const pk = PROF[c.profession].pk[c.pkg || 'A']; return { w: pk.w.map(w => (w.includes('|') ? (c.weaponPick && w.split('|').includes(c.weaponPick) ? c.weaponPick : w.split('|')[0]) : w.replace('*2', ''))), a: pk.a, h: pk.h, g: pk.g }; })() : { w: [], a: null, h: null, g: [] },
    };
  }

  updatePreview() {
    this.game.title.setCharacter(this.previewSheet());
  }

  // --- tegning ---------------------------------------------------------------

  render() {
    const c = this.c;
    $('#cr-steps').innerHTML = STEPS.map((s, i) => `<button class="cr-step${i === this.step ? ' on' : ''}${this.done(s.id) ? ' ok' : ''}" data-i="${i}"><b>${i + 1}</b><span>${s.name}</span></button>`).join('');
    $('#cr-steps').querySelectorAll('button').forEach(b => (b.onclick = () => this.go(+b.dataset.i)));
    const body = $('#cr-body');
    body.innerHTML = this['r_' + STEPS[this.step].id]();
    this.bind(body);
    const last = this.step === STEPS.length - 1;
    $('#cr-next').textContent = last ? 'Ned i mørket' : 'Neste';
    $('#cr-next').disabled = last && !this.allDone();
    const missing = STEPS.filter(s => !this.done(s.id)).map(s => s.name);
    $('#cr-hint').textContent = missing.length ? `Mangler: ${missing.join(', ')}` : 'Rollpersonen er klar.';
    this.updatePreview();
    void c;
  }

  dieBtn(act, label) {
    return `<button class="btn small die-btn" data-act="${act}"><span class="d20"></span>${label}</button>`;
  }

  r_kin() {
    const c = this.c;
    return `<p class="cr-lead">Velg släkte eller slå T12. Släktet gir förflyttning og en släktesförmåga. Ingen släkter endrer grundegenskapene.</p>
      <div class="cr-row">${this.dieBtn('roll-kin', 'Slå T12')}<span class="cr-res" id="res-kin"></span></div>
      <div class="cards">${KINS.map(k => `<button class="card${c.kin === k.id ? ' on' : ''}" data-kin="${k.id}">
        <div class="roll">T12: ${k.roll}</div><div class="nm">${k.name}</div>
        <div class="ds">${k.desc}</div>
        <div class="meta">Förflyttning ${k.move}</div>
        ${k.abilities.map(a => `<div class="ab"><b>${KIN_ABILITIES[a].name}</b>${KIN_ABILITIES[a].vp ? ` <i>${KIN_ABILITIES[a].vp} VP</i>` : ''}<br>${KIN_ABILITIES[a].dod}</div>`).join('')}
      </button>`).join('')}</div>`;
  }

  r_prof() {
    const c = this.c;
    const p = c.profession && PROF[c.profession];
    return `<p class="cr-lead">Velg yrke eller slå T10. Yrket gir åtte ferdigheter å velge fra, en hjälteförmåga og utrustning.</p>
      <div class="cr-row">${this.dieBtn('roll-prof', 'Slå T10')}<span class="cr-res" id="res-prof"></span></div>
      <div class="cards">${PROFESSIONS.map(pr => `<button class="card${c.profession === pr.id ? ' on' : ''}" data-prof="${pr.id}">
        <div class="roll">T10: ${pr.roll}</div><div class="nm">${pr.name}</div>
        <div class="ds">${pr.desc}</div>
        <div class="meta">Viktigst: ${ATTR_NAME[pr.key]}</div>
        <div class="ab">${pr.mage ? 'Magi: tre besvärjelser og tre trolleritrick' : pr.heroic.map(h => HEROIC[h].name).join(' / ')}</div>
      </button>`).join('')}</div>
      ${p?.mage ? `<h3>Magiskole</h3><div class="seg big">${Object.keys(p.schools).map(s => `<button data-school="${s}" class="${c.school === s ? 'on' : ''}">${s}</button>`).join('')}</div>
        <p class="hint">${c.school === 'Animism' ? 'Animism: naturens og livets magi. Lyn, røtter, helbredelse og bannlysning.' : c.school === 'Elementarism' ? 'Elementarism: ild, luft, vann og jord. Ildkuler, vindkast og frost.' : c.school === 'Mentalism' ? 'Mentalism: sinnets makt over kropp og ting. Kraftnäve, stenhud og løfting.' : 'Velg en skole.'} Du kan ikke trylle i metallrustning.</p>` : ''}`;
  }

  r_age() {
    const c = this.c;
    return `<p class="cr-lead">Velg ålder eller slå T6. Eldre rollpersoner kan mer, men kroppen er ikke hva den var.</p>
      <div class="cr-row">${this.dieBtn('roll-age', 'Slå T6')}<span class="cr-res" id="res-age"></span></div>
      <div class="cards three">${AGES.map(a => `<button class="card${c.age === a.id ? ' on' : ''}" data-age="${a.id}">
        <div class="roll">T6: ${a.roll}</div><div class="nm">${a.name}</div>
        <div class="meta">${6 + a.free} tränade färdigheter (6 fra yrket, ${a.free} frie)</div>
        <div class="ab">${Object.keys(a.mods).length ? Object.entries(a.mods).map(([k, v]) => `${k} ${v > 0 ? '+' : ''}${v}`).join(', ') : 'Ingen endring av grundegenskaper'}</div>
      </button>`).join('')}</div>`;
  }

  r_attr() {
    const c = this.c;
    const A = this.attrsNow();
    const prof = c.profession && PROF[c.profession];
    const age = AGES.find(a => a.id === (c.age || 'medel'));
    const rows = ATTRS.map(k => {
      const raw = c.rawAttrs?.[k];
      const dice = c.rolls?.[k];
      const mod = age.mods[k] || 0;
      return `<button class="attr-row${c.swap === k ? ' sel' : ''}${prof?.key === k ? ' key' : ''}" data-attr="${k}" ${!c.rawAttrs ? 'disabled' : ''}>
        <span class="k">${k}</span><span class="n">${ATTR_NAME[k]}</span>
        <span class="dice">${dice ? dice.map((v, i) => `<i class="${i === dice.indexOf(Math.min(...dice)) ? 'drop' : ''}">${v}</i>`).join('') : ''}</span>
        <span class="v">${raw ?? '?'}</span><span class="m">${mod ? (mod > 0 ? '+' : '') + mod : ''}</span><span class="f">${A ? A[k] : ''}</span>
      </button>`;
    }).join('');
    const kin = c.kin ? KIN[c.kin] : null;
    const derived = A ? `<div class="derived">
        <div><b>${A.FYS}</b><span>KP (= FYS)</span></div><div><b>${A.PSY}</b><span>VP (= PSY)</span></div>
        <div><b>${kin ? kin.move + moveMod(A.SMI) : '?'}</b><span>Förflyttning</span></div>
        <div><b>${dmgBonusDie(A.STY) ? '+' + tS(dmgBonusDie(A.STY)) : '-'}</b><span>Skadebonus STY</span></div>
        <div><b>${dmgBonusDie(A.SMI) ? '+' + tS(dmgBonusDie(A.SMI)) : '-'}</b><span>Skadebonus SMI</span></div>
      </div>` : '';
    return `<p class="cr-lead">Slå 4T6 for hver grundegenskap i rekkefølge og stryk den laveste terningen. Etterpå kan du bytte plass på to av dem. Alder legges til til slutt, og ingenting kan bli høyere enn 18.</p>
      <div class="cr-row">${this.dieBtn('roll-attrs', c.rawAttrs ? 'Slå på nytt' : 'Slå 4T6 seks ganger')}<button class="btn small" data-act="std-attrs">Husregel: 15, 14, 13, 12, 10, 8</button></div>
      <div class="attr-head"><span></span><span></span><span>Terninger</span><span>Slag</span><span>Ålder</span><span>Verdi</span></div>
      <div class="attr-list">${rows}</div>
      <p class="hint">${c.rawAttrs ? (c.swapped && !c.stdAttrs ? 'Du har brukt byttet ditt. Slå på nytt for å starte forfra.' : c.swap ? `Velg hvem ${c.swap} skal bytte med.` : 'Klikk to grundegenskaper for å bytte dem.') : ''}${prof ? ` ${prof.name}: ${ATTR_NAME[prof.key]} er viktigst.` : ''}</p>
      ${derived}`;
  }

  r_skills() {
    const c = this.c;
    const prof = c.profession && PROF[c.profession];
    if (!prof) return '<p class="cr-lead">Velg yrke først.</p>';
    if (prof.mage && !c.school) return '<p class="cr-lead">Velg magiskole under Yrke først.</p>';
    const list = prof.mage ? prof.schools[c.school] : prof.skills;
    const sk = this.skillsNow();
    const A = this.attrsNow();
    const free = this.freeCount();
    const chip = (id, on, kind) => {
      const s = SKILL[id];
      const bc = A ? baseChance(A[s.attr]) : '?';
      const val = A ? (on ? bc * 2 : bc) : '?';
      const locked = prof.mage && id === c.school && kind === 'prof';
      const alt = kind === 'prof' && !on && c.freeSkills.includes(id);
      return `<button class="chip${on ? ' on' : ''}${locked ? ' lock' : ''}${alt ? ' alt' : ''}" data-${kind === 'prof' ? 'pskill' : 'fskill'}="${esc(id)}" title="${s.en}${s.use ? ': ' + s.use : ''}">${id} <span>${s.attr}</span><b>${val}</b></button>`;
    };
    const others = SKILLS.filter(s => s.type !== 'sek' && !c.profSkills.includes(s.id)).map(s => s.id);
    return `<p class="cr-lead">Velg seks ferdigheter fra yrket${prof.mage ? ' (magiskolen er alltid med)' : ''}, og ${free} frie fra hele listen. Tränade ferdigheter starter på to ganger grundchansen. Resten bruker grundchansen.</p>
      <div class="cr-row">${this.dieBtn('roll-skills', 'Velg tilfeldig')}</div>
      <h3>Yrkesfärdigheter <span class="cnt">${c.profSkills.length}/6</span></h3>
      <div class="chips">${list.map(id => chip(id, c.profSkills.includes(id), 'prof')).join('')}</div>
      <h3>Frie val <span class="cnt">${c.freeSkills.length}/${free}</span></h3>
      <div class="chips">${others.map(id => chip(id, c.freeSkills.includes(id), 'free')).join('')}</div>
      ${!Object.keys(sk).some(k => SKILL[k].type === 'vap' && [...c.profSkills, ...c.freeSkills].includes(k)) ? '<p class="warn">Ingen tränad vapenfärdighet. Det blir tungt i kloakken.</p>' : ''}`;
  }

  r_abil() {
    const c = this.c;
    const prof = c.profession && PROF[c.profession];
    if (!prof) return '<p class="cr-lead">Velg yrke først.</p>';
    const kinTxt = c.kin ? KIN[c.kin].abilities.map(a => `<div class="ab"><b>${KIN_ABILITIES[a].name}</b>: ${KIN_ABILITIES[a].game}</div>`).join('') : '';
    if (prof.mage) {
      if (!c.school) return '<p class="cr-lead">Velg magiskole under Yrke først.</p>';
      const spells = Object.entries(SPELLS).filter(([, s]) => s.school === c.school);
      const tricks = Object.entries(TRICKS).filter(([, t]) => t.school === c.school || t.school === 'Allmän');
      return `<p class="cr-lead">Magikere har ingen hjälteförmåga i starten. Du kan tre besvärjelser på rang 1 og tre trolleritrick. Besvärjelser koster 2, 4 eller 6 VP etter effektgrad. Trick koster 1 VP.</p>
        <h3>Besvärjelser <span class="cnt">${c.spells.length}/3</span></h3>
        <div class="cards two">${spells.map(([id, s]) => `<button class="card small${c.spells.includes(id) ? ' on' : ''}" data-spell="${id}"><div class="nm">${s.name}</div><div class="ds">${s.game}</div><div class="rule">Boka: ${s.dod}</div></button>`).join('')}</div>
        <h3>Trolleritrick <span class="cnt">${c.tricks.length}/3</span></h3>
        <div class="cards two">${tricks.map(([id, t]) => `<button class="card small${c.tricks.includes(id) ? ' on' : ''}" data-trick="${id}"><div class="nm">${t.name} <i>${t.school}</i></div><div class="ds">${t.game}</div></button>`).join('')}</div>
        <h3>Släktesförmåga</h3>${kinTxt}`;
    }
    const opts = [...prof.heroic, ...(prof.alt || [])];
    return `<p class="cr-lead">Du starter med yrkets hjälteförmåga, uten kravet. ${prof.alt ? 'Startevnen gjør lite når du er alene, så SL tillater et bytte (boka sier SL kan gjøre det).' : prof.heroicChoice ? 'Hantverkare velger én av tre.' : ''}</p>
      <div class="cards two">${opts.map(id => {
        const h = HEROIC[id];
        const alt = prof.alt?.includes(id);
        return `<button class="card small${c.heroic[0] === id ? ' on' : ''}" data-heroic="${id}"><div class="nm">${h.name}${alt ? ' <i>SL-bytte</i>' : ''}${h.vp ? ` <i>${h.vp} VP</i>` : ''}</div><div class="ds">${h.game}</div><div class="rule">Boka: ${h.dod}</div></button>`;
      }).join('')}</div>
      <h3>Släktesförmåga</h3>${kinTxt}
      <p class="hint">Flere hjälteförmågor får du når en ferdighet når 18, eller som belønning når du hviler mellom nivåene.</p>`;
  }

  r_gear() {
    const c = this.c;
    const prof = c.profession && PROF[c.profession];
    if (!prof) return '<p class="cr-lead">Velg yrke først.</p>';
    const pk = c.pkg ? prof.pk[c.pkg] : null;
    const choiceW = pk?.w.find(w => w.includes('|'));
    return `<p class="cr-lead">Velg en utrustningspakke eller slå T6 (1-2 A, 3-4 B, 5-6 C). Du får også ${tS(prof.food)} matransoner og ${tS(prof.silver)} silver.</p>
      <div class="cr-row">${this.dieBtn('roll-pkg', 'Slå T6')}<span class="cr-res" id="res-pkg"></span></div>
      <div class="cards three">${['A', 'B', 'C'].map(k => `<button class="card${c.pkg === k ? ' on' : ''}" data-pkg="${k}"><div class="roll">T6: ${k === 'A' ? '1-2' : k === 'B' ? '3-4' : '5-6'}</div><div class="nm">Pakke ${k}</div><div class="ds">${itemList(prof.pk[k])}</div></button>`).join('')}</div>
      ${choiceW ? `<h3>Velg våpen</h3><div class="seg big">${choiceW.split('|').map(w => `<button data-wpick="${w}" class="${(c.weaponPick || choiceW.split('|')[0]) === w ? 'on' : ''}">${wName(w)}</button>`).join('')}</div>` : ''}
      <div class="cr-row money"><span>Silver: <b>${c.silver ?? '?'}</b></span><span>Mat: <b>${c.food ?? '?'}</b></span>${this.dieBtn('roll-money', 'Slå silver og mat')}</div>
      <p class="hint">Silver kan brukes hos butikkbetjenten nede i kloakken. Dyr og vogner venter ved inngangen.</p>`;
  }

  r_back() {
    const c = this.c;
    const kin = c.kin && KIN[c.kin];
    const ad = c.aidne != null ? AIDNE[c.aidne] : null;
    let sheet = '';
    if (this.allDone()) {
      try { sheet = `<div class="cr-sheet">${sheetHTML(buildSheet(this.choicesForBuild()))}</div>`; } catch (e) { sheet = ''; }
    }
    return `<p class="cr-lead">Til slutt: navn, svaghet, utseende og minnessak. Slå T20 eller skriv selv.</p>
      <div class="field"><label for="cr-name">Navn</label><input id="cr-name" maxlength="28" value="${esc(c.name)}" placeholder="${kin ? esc(kin.names[0]) : 'Navn'}" autocomplete="off">${this.dieBtn('roll-name', 'Slå navn')}</div>
      <div class="field"><label>Svaghet <i>valgfri</i></label><span class="val">${esc(c.weakness || 'Ingen')}</span>${this.dieBtn('roll-weak', 'Slå T20')}<button class="btn small" data-act="no-weak">Ingen</button></div>
      <p class="hint">Spiller du på svakheten din, får du et ekstra markeringskryss når du hviler.</p>
      <div class="field"><label>Utseende</label><span class="val">${esc(c.appearance || '-')}</span>${this.dieBtn('roll-look', 'Slå T20')}</div>
      <div class="field"><label>Minnessak</label><span class="val">${esc(c.memento || '-')}</span>${this.dieBtn('roll-mem', 'Slå T20')}</div>
      <p class="hint">Minnessaken lar deg bli kvitt et ekstra tillstånd én gang per nivå når du tar kort vila.</p>
      <h3>Ereb Altor: Aidne <i>valgfritt</i></h3>
      <label class="check"><input type="checkbox" id="cr-aidne" ${c.useAidne ? 'checked' : ''}> Rollpersonen kommer fra Aidne (Zorakin, Kardunien eller fjellene i nord). Språk: jori, svartiska, narguriska.</label>
      ${c.useAidne ? `<div class="cr-row">${this.dieBtn('roll-aidne', 'Slå T10 socialt stånd')}</div>
        ${ad ? `<div class="aidne"><b>${ad.stand}</b> (${ad.ex}). ${ad.place}<br>Minnessak: ${ad.memento}.
          <div class="seg">${ad.skill.map(s => `<button data-extra="${esc(s)}" class="${c.extraSkill === s ? 'on' : ''}">+ ${s} tränad</button>`).join('')}<button data-extra="" class="${!c.extraSkill ? 'on' : ''}">Ingen ekstra</button></div>
          <button class="btn small" data-act="aidne-mem">Bruk ${esc(ad.memento.toLowerCase())} som minnessak</button></div>` : ''}
        <p class="hint">Fra «Hjältar från Kopparhavet»: heroiske rollpersoner kan starte med en ekstra tränad ferdighet ut fra socialt stånd, hvis SL tillater det.</p>` : ''}
      ${sheet}`;
  }

  // --- handlinger ---------------------------------------------------------------

  bind(body) {
    const c = this.c;
    const rerender = () => this.render();
    body.querySelectorAll('[data-kin]').forEach(b => (b.onclick = () => { this.setKin(b.dataset.kin); rerender(); }));
    body.querySelectorAll('[data-prof]').forEach(b => (b.onclick = () => { this.setProf(b.dataset.prof); rerender(); }));
    body.querySelectorAll('[data-school]').forEach(b => (b.onclick = () => { this.setSchool(b.dataset.school); rerender(); }));
    body.querySelectorAll('[data-age]').forEach(b => (b.onclick = () => { this.setAge(b.dataset.age); rerender(); }));
    body.querySelectorAll('[data-attr]').forEach(b => (b.onclick = () => this.clickAttr(b.dataset.attr)));
    body.querySelectorAll('[data-pskill]').forEach(b => (b.onclick = () => { this.toggleProfSkill(b.dataset.pskill); rerender(); }));
    body.querySelectorAll('[data-fskill]').forEach(b => (b.onclick = () => { this.toggleFree(b.dataset.fskill); rerender(); }));
    body.querySelectorAll('[data-heroic]').forEach(b => (b.onclick = () => { c.heroic = [b.dataset.heroic]; rerender(); }));
    body.querySelectorAll('[data-spell]').forEach(b => (b.onclick = () => { this.toggle(c.spells, b.dataset.spell, 3); rerender(); }));
    body.querySelectorAll('[data-trick]').forEach(b => (b.onclick = () => { this.toggle(c.tricks, b.dataset.trick, 3); rerender(); }));
    body.querySelectorAll('[data-pkg]').forEach(b => (b.onclick = () => { this.setPkg(b.dataset.pkg); rerender(); }));
    body.querySelectorAll('[data-wpick]').forEach(b => (b.onclick = () => { c.weaponPick = b.dataset.wpick; rerender(); }));
    body.querySelectorAll('[data-extra]').forEach(b => (b.onclick = () => { c.extraSkill = b.dataset.extra || null; rerender(); }));
    body.querySelectorAll('[data-act]').forEach(b => (b.onclick = () => this.act(b.dataset.act, b)));
    const nm = body.querySelector('#cr-name');
    if (nm) nm.oninput = () => { c.name = nm.value; $('#cr-hint').textContent = this.allDone() ? 'Rollpersonen er klar.' : $('#cr-hint').textContent; $('#cr-next').disabled = !this.allDone(); };
    const ai = body.querySelector('#cr-aidne');
    if (ai) ai.onchange = () => { c.useAidne = ai.checked; if (!ai.checked) { c.aidne = null; c.extraSkill = null; } rerender(); };
  }

  toggle(arr, id, max) {
    const i = arr.indexOf(id);
    if (i >= 0) arr.splice(i, 1);
    else if (arr.length < max) arr.push(id);
    else { arr.shift(); arr.push(id); }
    G.audio.menuTick?.(64);
  }

  setKin(id) {
    this.c.kin = id;
    if (!this.c.name || KINS.some(k => k.names.includes(this.c.name) || (k.ereb || []).includes(this.c.name))) this.c.name = '';
    G.audio.menuSelect?.();
  }
  setProf(id) {
    const c = this.c;
    if (c.profession !== id) {
      c.profession = id;
      c.school = null;
      c.profSkills = [];
      c.freeSkills = [];
      c.heroic = [];
      c.spells = [];
      c.tricks = [];
      c.pkg = null;
      c.weaponPick = null;
      c.silver = null;
      c.food = null;
      const p = PROF[id];
      if (!p.mage && !p.heroicChoice) c.heroic = [p.heroic[0]];
    }
    G.audio.menuSelect?.();
  }
  setSchool(s) {
    const c = this.c;
    c.school = s;
    c.profSkills = [s];
    c.spells = [];
    c.tricks = [];
    c.freeSkills = c.freeSkills.filter(x => !PROF.magiker.schools[s].includes(x));
  }
  setAge(id) {
    this.c.age = id;
    const f = this.freeCount();
    if (this.c.freeSkills.length > f) this.c.freeSkills.length = f;
    G.audio.menuSelect?.();
  }
  setPkg(k) {
    const c = this.c;
    c.pkg = k;
    c.weaponPick = null;
    if (c.silver == null) this.rollMoney();
    G.audio.menuSelect?.();
  }
  rollMoney() {
    const p = PROF[this.c.profession];
    this.c.silver = rollDice(p.silver);
    this.c.food = rollDice(p.food);
  }
  toggleProfSkill(id) {
    const c = this.c;
    if (PROF[c.profession].mage && id === c.school) return;
    const i = c.profSkills.indexOf(id);
    if (i >= 0) c.profSkills.splice(i, 1);
    else if (c.profSkills.length < 6) { c.profSkills.push(id); c.freeSkills = c.freeSkills.filter(x => x !== id); }
    G.audio.menuTick?.(64);
  }
  toggleFree(id) {
    this.toggle(this.c.freeSkills, id, this.freeCount());
  }

  clickAttr(k) {
    const c = this.c;
    if (!c.rawAttrs || (c.swapped && !c.stdAttrs)) return;
    if (!c.swap) { c.swap = k; this.render(); return; }
    if (c.swap === k) { c.swap = null; this.render(); return; }
    const a = c.swap;
    [c.rawAttrs[a], c.rawAttrs[k]] = [c.rawAttrs[k], c.rawAttrs[a]];
    if (c.rolls) [c.rolls[a], c.rolls[k]] = [c.rolls[k], c.rolls[a]];
    c.swap = null;
    if (!c.stdAttrs) c.swapped = true;
    G.audio.menuSelect?.();
    this.render();
  }

  // animerer en terning i et element og kaller cb med resultatet
  spin(el, sides, final, cb) {
    let n = 0;
    G.audio.dice?.();
    const iv = setInterval(() => {
      if (el) el.textContent = d(sides);
      if (++n > 7) {
        clearInterval(iv);
        if (el) el.textContent = final;
        cb?.();
      }
    }, 45);
  }

  act(a) {
    const c = this.c;
    const res = id => $('#' + id);
    if (a === 'roll-kin') { const r = d(12); this.spin(res('res-kin'), 12, `T12: ${r}`, () => { this.setKin(kinFromD12(r)); this.render(); res('res-kin') && (res('res-kin').textContent = `T12: ${r}, ${KIN[c.kin].name}`); }); }
    else if (a === 'roll-prof') { const r = d(10); this.spin(res('res-prof'), 10, `T10: ${r}`, () => { this.setProf(PROFESSIONS[r - 1].id); this.render(); res('res-prof') && (res('res-prof').textContent = `T10: ${r}, ${PROF[c.profession].name}`); }); }
    else if (a === 'roll-age') { const r = d(6); this.spin(res('res-age'), 6, `T6: ${r}`, () => { this.setAge(ageFromD6(r)); this.render(); res('res-age') && (res('res-age').textContent = `T6: ${r}, ${AGES.find(x => x.id === c.age).name}`); }); }
    else if (a === 'roll-attrs') this.rollAttrs();
    else if (a === 'std-attrs') {
      const vals = [15, 14, 13, 12, 10, 8];
      c.rawAttrs = {};
      ATTRS.forEach((k, i) => (c.rawAttrs[k] = vals[i]));
      // nøkkelegenskapen får 15
      const p = c.profession && PROF[c.profession];
      if (p && p.key !== 'STY') { const t = c.rawAttrs[p.key]; c.rawAttrs[p.key] = c.rawAttrs.STY; c.rawAttrs.STY = t; }
      c.rolls = null;
      c.stdAttrs = true;
      c.swapped = false;
      c.swap = null;
      this.render();
    } else if (a === 'roll-skills') {
      const p = PROF[c.profession];
      if (!p || (p.mage && !c.school)) return;
      const list = p.mage ? p.schools[c.school] : p.skills;
      c.profSkills = p.mage ? [c.school, ...shuffle(list.slice(1)).slice(0, 5)] : shuffle(list).slice(0, 6);
      const pool = SKILLS.filter(s => s.type !== 'sek' && !c.profSkills.includes(s.id)).map(s => s.id);
      const hasW = c.profSkills.some(s => SKILL[s].type === 'vap');
      c.freeSkills = [];
      if (!hasW) c.freeSkills.push(pick(['Kniv', 'Svärd', 'Stav', 'Spjut', 'Yxa']));
      for (const s of shuffle(pool)) { if (c.freeSkills.length >= this.freeCount()) break; if (!c.freeSkills.includes(s)) c.freeSkills.push(s); }
      this.render();
    } else if (a === 'roll-pkg') { const r = d(6); const k = r <= 2 ? 'A' : r <= 4 ? 'B' : 'C'; this.spin(res('res-pkg'), 6, `T6: ${r}`, () => { this.setPkg(k); this.render(); res('res-pkg') && (res('res-pkg').textContent = `T6: ${r}, pakke ${k}`); }); }
    else if (a === 'roll-money') { this.rollMoney(); this.render(); }
    else if (a === 'roll-name') {
      const k = KIN[c.kin || 'manniska'];
      c.name = pick([...k.names, ...(c.useAidne || (k.ereb && Math.random() < 0.5) ? k.ereb || [] : [])]);
      this.render();
    } else if (a === 'roll-weak') { c.weakness = WEAKNESS[d(20) - 1]; this.render(); }
    else if (a === 'no-weak') { c.weakness = null; this.render(); }
    else if (a === 'roll-look') { c.appearance = APPEARANCE[d(20) - 1]; this.render(); }
    else if (a === 'roll-mem') { c.memento = MEMENTO[d(20) - 1]; this.render(); }
    else if (a === 'roll-aidne') { c.aidne = d(10) - 1; c.extraSkill = AIDNE[c.aidne].skill[0]; this.render(); }
    else if (a === 'aidne-mem') { c.memento = AIDNE[c.aidne].memento; this.render(); }
  }

  rollAttrs() {
    const c = this.c;
    c.rawAttrs = {};
    c.rolls = {};
    c.swapped = false;
    c.swap = null;
    c.stdAttrs = false;
    const vals = ATTRS.map(() => rollAttr());
    let i = 0;
    G.audio.dice?.();
    const next = () => {
      if (i >= ATTRS.length) { this.render(); return; }
      const k = ATTRS[i];
      c.rawAttrs[k] = vals[i].total;
      c.rolls[k] = vals[i].dice;
      i++;
      this.render();
      G.audio.menuTick?.(60 + i * 2);
      setTimeout(next, 110);
    };
    next();
  }

  randomAll() {
    const r = randomChoices();
    this.c = { ...this.fresh(), ...r, rolls: null, useAidne: false };
    G.audio.menuSelect?.();
    this.step = STEPS.length - 1;
    this.render();
  }

  choicesForBuild() {
    const c = this.c;
    return { ...c, extraSkill: c.useAidne ? c.extraSkill : null, aidne: c.useAidne ? c.aidne : null, name: c.name.trim() };
  }

  finish(start) {
    if (!this.allDone()) return;
    const sheet = buildSheet(this.choicesForBuild());
    if (this.c.id) sheet.id = this.c.id;
    this.game.saveCharacter(sheet);
    if (start) this.game.startWith(sheet);
  }
}
void HELMETS;
