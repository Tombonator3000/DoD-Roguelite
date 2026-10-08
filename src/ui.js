import { G, T } from './state.js';
import {
  SKILL, SPELLS, RACE, PROF, AGES, GEAR, AIDNE, ABILITIES, LOCS, LOC_NAME, ATTR_NAME, ATTRS, KONSTER, KONST_PARTS,
  HJALTEFORMAGOR, skadebonus, fvCost,
} from './dod.js';
import { RARITY, SRC_COLOR, isRanged } from './loot.js';
import { WALL, FLOOR, WATER, PILLAR } from './dungeon.js';
import { tStr, derived, baseCost } from './rules.js';
import { HOUSE, FENCE, GR } from './townmap.js';
import { capKg, carriedKg } from './inventory.js';
import { hungerLevel } from './worldtravel.js';

const $ = s => document.querySelector(s);
const fmtKg = v => String(Math.round(v * 10) / 10).replace('.', ',');

// Ikoner (SVG-stier, 24x24)
const ICON = {
  fist: 'M7 11V7a2 2 0 0 1 4 0v3m0-1V6a2 2 0 0 1 4 0v4m0-2a2 2 0 0 1 4 0v5a7 7 0 0 1-7 7h-1a7 7 0 0 1-6-4l-1.5-3a1.8 1.8 0 0 1 3-2L7 13',
  blade: 'M4 20l11-11M14 6l3-3 4 4-3 3M7 14l3 3M4 20l3-1-2-2z',
  axe: 'M5 21L15 11M13 5c3-2 7 0 7 4l-4 1-4-4 1-1zM12 8l4 4',
  hammer: 'M5 21l9-9M11 4l6 6M9 6l4-4 6 6-4 4z',
  spear: 'M3 21L18 6M15 3h6v6M13 11l-2-2',
  staff: 'M6 21L18 3M16 3a2 2 0 1 0 4 0 2 2 0 1 0-4 0',
  bow: 'M5 3c8 3 13 8 16 16M5 3v16h16M9 15l10-10M16 5h3v3',
  shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z',
  dodge: 'M2 15c2.5 0 2.5-3 5-3s2.5 3 5 3 2.5-3 5-3 2.5 3 5 3M14 6h6m0 0l-3-3m3 3l-3 3',
  throw: 'M5 19L16 8M14 6l5-2-2 5M3 11h5M4 15h4',
  swap: 'M4 8h13l-3-3M20 16H7l3 3',
  kin: 'M12 3c1 4 5 5.5 5 10a5 5 0 0 1-10 0c0-3 2-4 2-6 1.6 1 2.6 2.6 2.6 2.6S12 6.5 12 3z',
  sneak: 'M2 12c3-4 6.5-5.5 10-5.5S19 8 22 12c-3 4-6.5 5.5-10 5.5S5 16 2 12zM2 12h20',
  potion: 'M9 3h6M10 3v5l-4.5 6.5A4.5 4.5 0 0 0 9.2 21h5.6a4.5 4.5 0 0 0 3.7-6.5L14 8V3M7 14h10',
  star: 'M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.5 6.7 19.4l1.2-6L3.4 9.3l6-.7z',
  spell: 'M5 19l9-9M14 4l1 3 3 1-3 1-1 3-1-3-3-1 3-1zM19 13l.6 1.4 1.4.6-1.4.6-.6 1.4-.6-1.4-1.4-.6 1.4-.6z',
  cross: 'M10 4h4v6h6v4h-6v6h-4v-6H4v-4h6z',
  rage: 'M12 3l2 5 5-2-2 5 4 3-5 1 1 5-5-3-5 3 1-5-5-1 4-3-2-5 5 2z',
};
const KIND_ICON = { fist: 'fist', knife: 'blade', sword: 'blade', great: 'blade', axe: 'axe', hammer: 'hammer', spear: 'spear', staff: 'staff', bow: 'bow', xbow: 'bow', sling: 'bow', shield: 'shield' };
const svg = k => `<svg viewBox="0 0 24 24"><path d="${ICON[k] || ICON.star}"/></svg>`;

const CONS_KIND = { potion: 'Drikk', potionvp: 'Drikk', saffron: 'Krydder' };
const SLOT_NAME = { vapen: 'våpen', vapen2: 'skjold', rustning: 'rustning', hjalm: 'hjälm', armar: 'armskydd', ben: 'benskydd', amulett: 'amulett' };

// Kroppen i HUD: sju träffområden
const DOLL = {
  huvud: { el: 'circle', a: { cx: 30, cy: 11, r: 9 }, t: [30, 11] },
  brost: { el: 'rect', a: { x: 19, y: 22, width: 22, height: 22, rx: 4 }, t: [30, 33] },
  mage: { el: 'rect', a: { x: 20, y: 46, width: 20, height: 15, rx: 3 }, t: [30, 53.5] },
  harm: { el: 'rect', a: { x: 7, y: 23, width: 10, height: 37, rx: 4 }, t: [12, 41] },
  varm: { el: 'rect', a: { x: 43, y: 23, width: 10, height: 37, rx: 4 }, t: [48, 41] },
  hben: { el: 'rect', a: { x: 18.5, y: 63, width: 10.5, height: 47, rx: 4 }, t: [23.75, 86] },
  vben: { el: 'rect', a: { x: 31, y: 63, width: 10.5, height: 47, rx: 4 }, t: [36.25, 86] },
};

export class UI {
  constructor() {
    this.hud = $('#hud');
    this.logEl = $('#log');
    this.prompt = $('#prompt');
    this.tooltip = $('#tooltip');
    this.mm = $('#minimap');
    this.mmCtx = this.mm.getContext('2d');
    this.big = $('#bigmap');
    this.bigCtx = this.big.getContext('2d');
    this.mmTimer = 0;
    this.boss = null;
    this.slots = {};
    this.lastTip = null;
    this.buildDoll();
  }

  buildDoll() {
    const box = $('#bodydoll');
    if (!box) return;
    // kroppen sett forfra: din høyre arm er til venstre i bildet
    const parts = LOCS.map(l => {
      const d = DOLL[l];
      const attrs = Object.entries(d.a).map(([k, v]) => `${k}="${v}"`).join(' ');
      return `<${d.el} class="z" data-loc="${l}" ${attrs}><title>${LOC_NAME[l]}</title></${d.el}><text class="n" data-n="${l}" x="${d.t[0]}" y="${d.t[1]}"></text>`;
    }).join('');
    box.innerHTML = `<svg viewBox="0 0 60 112">${parts}</svg>`;
    this.dollZ = {};
    this.dollN = {};
    for (const l of LOCS) { this.dollZ[l] = box.querySelector(`[data-loc="${l}"]`); this.dollN[l] = box.querySelector(`[data-n="${l}"]`); }
  }

  show(id) {
    document.querySelectorAll('.screen').forEach(s => (s.hidden = s.id !== id));
  }
  hideScreens() {
    document.querySelectorAll('.screen').forEach(s => (s.hidden = true));
  }

  log(html, cls = '') {
    const el = document.createElement('div');
    el.className = 'line ' + cls;
    el.innerHTML = html;
    this.logEl.appendChild(el);
    while (this.logEl.children.length > 7) this.logEl.firstChild.remove();
    setTimeout(() => el.classList.add('old'), 9000);
    // verdenskartet dekker HUD-en, så loggen vises der også
    if (this.mirror) {
      const m = el.cloneNode(true);
      this.mirror.appendChild(m);
      while (this.mirror.children.length > 4) this.mirror.firstChild.remove();
    }
  }

  // Ultima-aktig kamplogg med terningene synlige: «Dolk 7/14», «Dolk 1>3/14 Perfekt»
  logRoll(r, text, enemy = false) {
    if (!r) { this.log(text, enemy ? 'enemy' : ''); return; }
    const cls = r.perfekt ? 'drake' : r.fummel ? 'demon' : r.success ? 'ok' : 'fail';
    const name = r.label || r.skill || '';
    const dice = r.r2 != null ? `${r.r}>${r.r2}` : `${r.r ?? '?'}`;
    const tag = r.perfekt ? ' Perfekt' : r.fummel ? ' Fummel' : '';
    const hero = r.hero ? ' HP' : '';
    const cl = r.cl ?? r.target ?? '';
    this.log(`<span class="roll ${cls}" title="1T20 lik eller under CL ${cl}${r.fv != null ? `, FV ${r.fv}` : ''}${r.bonus ? `, +${r.bonus} fra förmåga` : ''}${r.hero ? ', hjältepoäng brukt' : ''}">${name} ${dice}/${cl}${tag}${hero}</span> ${text}`, enemy ? 'enemy' : '');
  }

  flashDamage() {
    const f = $('#dmgflash');
    f.classList.remove('on');
    void f.offsetWidth;
    f.classList.add('on');
  }

  showBoss(e) {
    if (this.boss !== e) $('#bossbar .name').textContent = e.def.barName || 'Rødpels, revehøvdingen';
    this.boss = e;
    $('#bossbar').hidden = false;
    $('#bossbar .fill').style.width = `${Math.max(0, (e.kp / e.maxKP) * 100)}%`;
  }
  hideBoss() {
    this.boss = null;
    $('#bossbar').hidden = true;
  }

  // o.region: et sted utenfor Fristaden (Edelfara). o.town: fredelig, uten angrepsknapper på mobil.
  setDepth(depth, name, o = {}) {
    const eb = $('#depth .eyebrow');
    const region = o.region || 'Zorakin, Aidne';
    eb.innerHTML = depth === 0 ? `<span class="ebp">${region} · </span><span id="clock"></span>` : `Nivå <span id="depthNum">${depth}</span> av 5<span class="ebp"> · </span><span id="clock" class="ebp"></span>`;
    document.body.classList.toggle('in-town', depth === 0 && o.town !== false);
    this.clockTxt = null;
    $('#depthName').textContent = name;
    const b = $('#banner');
    b.innerHTML = `<div class="eyebrow">${depth === 0 ? (o.region ? o.region : 'Zorakin, Aidnehalvøya') : `Nivå ${depth} av 5`}</div><div class="title">${name}</div>`;
    b.classList.remove('on');
    void b.offsetWidth;
    b.classList.add('on');
  }

  setClock(clock) {
    const h = ((clock % 24) + 24) % 24;
    const day = Math.floor(clock / 24) + 1;
    const hh = Math.floor(h), mm = Math.floor((h - hh) * 6) * 10;
    const part = h < 5 ? 'natt' : h < 10 ? 'morgen' : h < 17 ? 'dag' : h < 21 ? 'kveld' : 'natt';
    const W = G.weather;
    const wx = G.dungeon?.isTown && W && W.kind !== 'klart' ? `, ${W.label}` : '';
    const txt = `dag ${day}, kl. ${String(hh).padStart(2, '0')}.${String(mm).padStart(2, '0')} (${part}${wx})`;
    if (txt === this.clockTxt) return;
    this.clockTxt = txt;
    const el = $('#clock');
    if (el) el.textContent = txt;
  }

  // --- evnelinje ----------------------------------------------------------

  buildBar() {
    const P = G.player;
    const bar = $('#bar');
    bar.innerHTML = '';
    this.slots = {};
    const add = (k, key, icon, title, cost) => {
      const s = document.createElement('div');
      s.className = 'slot';
      s.dataset.k = k;
      s.title = title;
      s.innerHTML = `<kbd>${key}</kbd>${svg(icon)}${cost ? `<span class="c">${cost}</span>` : ''}<span class="n"></span>`;
      bar.appendChild(s);
      this.slots[k] = s;
    };
    const w = P.weapon();
    const fv = P.fvFor?.(w) ?? 0;
    add('atk', 'LMB', KIND_ICON[w.kind] || 'fist', `${isRanged(w) ? 'Skyt' : 'Anfall'} med ${w.name}: ${w.skill || 'Slagsmål'} FV ${fv}, skade ${tStr(w.dmg)}${P.sb && !isRanged(w) ? ` + SB ${tStr(P.sb)}` : ''}.`);
    add('parry', 'RMB', 'shield', 'Parera: hold inne. Hvert våpen og skjold parerer én gang per stridsrunde (1,5 s). Projektiler kan ikke pareres, men skjoldet tar piler mot det det dekker.');
    add('dash', 'SPC', 'dodge', 'Dukk unna: treffer et anfall mens du dukker, slår du et normalt SMI-slag. Ikke på kne.');
    add('throw', 'Q', 'throw', 'Kast et kastvåpen. Det når STY rutor. Plukk det opp igjen etterpå.');
    if (P.equip.vapen2 && !P.equip.vapen2.shield) add('swap', 'Z', 'swap', 'Bytt våpen mellom hendene');
    const keys = ['R', 'G', 'T'];
    P.activeSlots().forEach((s, i) => {
      if (s.kind === 'spell') {
        const sp = SPELLS[s.id];
        add('a' + (i + 1), keys[i], 'spell', `${sp.name} (${sp.school}, skolvärde ${sp.sv}${sp.f ? ', fysisk' : ''}${sp.quick ? ', kvick' : ''}). S ${P.spells[s.id]}. CL = S - 2 x (E - 1), koster E PSY. Hold for høyere E. ${sp.text}`, 'E');
      } else if (s.id === 'Bärsärkagång') add('a' + (i + 1), keys[i], 'rage', `Bärsärkagång (FV ${P.skills[s.id]}): +1T6 skade og raskere hugg, ingen parering eller dukking. Slutter med et ferdighetsslag (Bok I s. 46).`);
      else add('a' + (i + 1), keys[i], 'fist', `Avväpna (FV ${P.skills[s.id]}): neste treff prøver å slå våpenet ut av hånda (STY + FV mot fiendens STY).`);
    });
    const ab = ABILITIES[P.sheet.ability];
    if (ab) add('abil', 'F', 'kin', `${ab.name}${ab.psy ? ` (${ab.psy} PSY)` : ''}: ${ab.text}`, ab.psy || '');
    add('aid', 'H', 'cross', 'Första hjälpen: stopper blødning. Helbreder ingen KP. Trenger to hele armer.');
    add('sneak', 'SHF', 'sneak', 'Smyga: halv fart. Fiender må klare Upptäcka fara minus differensvärdet ditt for å se deg. Bakfra mot en som ikke har sett deg: +7.');
    add('potion', '1', 'potion', 'Legedrikk: 2T6 KP, fordelt på de skadde kroppsdelene.');
    add('hero', 'V', 'star', 'Hjältepoäng: gjør klar én, så blir neste slag ett trinn bedre (Bok I s. 64).');
    this.buildTouch();
  }

  buildTouch() {
    const P = G.player;
    const box = $('#tbtns-dyn');
    if (!box) return;
    const keys = ['TA1', 'TA2', 'TA3'];
    const short = s => (s.kind === 'spell' ? SPELLS[s.id].name.split(' ')[0].slice(0, 8) : s.id === 'Bärsärkagång' ? 'BÄRSÄRK' : 'AVVÄPNA');
    const ab = ABILITIES[P.sheet.ability];
    box.innerHTML = P.activeSlots().map((s, i) => `<button class="tbtn" data-tbtn="${keys[i]}">${short(s)}</button>`).join('')
      + (ab && !ab.passive ? `<button class="tbtn" data-tbtn="TKin">${ab.name.split(' ')[0].toUpperCase().slice(0, 8)}</button>` : '')
      + '<button class="tbtn" data-tbtn="TRest">FÖRBAND</button>'
      + (P.equip.vapen2 && !P.equip.vapen2.shield ? '<button class="tbtn" data-tbtn="TSwap">BYTT</button>' : '');
    G.input.bindTouchButtons?.(box);
  }

  // Statuslinja over evnelinja: blødning, skräck, buffs, överlastad
  statusChips(P) {
    const out = [];
    if (P.bleeding.size) out.push(['Blør', 'bad', `Blør fra ${[...P.bleeding].map(l => LOC_NAME[l].toLowerCase()).join(', ')}. 1 KP hvert 9. sekund per sår. H stopper det.`]);
    if (P.helpless) out.push(['Kryper', 'bad', 'Totala KP under 1: du kan bare krype, drikke og spise.']);
    else if (P.loc.brost <= 0 || P.loc.mage <= 0) out.push(['Kryper', 'bad', 'Bröstkorg eller mage på 0: du kan bare krype.']);
    else if (P.loc.hben <= 0 || P.loc.vben <= 0) out.push(['På kne', 'bad', 'Et bein på 0 KP.']);
    if (P.kp === 2) out.push(['Halv CL', 'bad', 'Totala KP 2: halv CL på alt.']);
    if (P.overloaded) out.push(['Överlastad', 'bad', `${fmtKg(P.load)} av ${P.capKg} kg.`]);
    if (P.fx.barsark) out.push(['Bärsärk', 'on', '+1T6 skade, ingen parering.']);
    if (P.stealth) out.push([`Smyger ${P.sneakDiff}`, 'on', 'Differensvärde fra Smyga.']);
    if (P.forced) out.push([{ paralyzed: 'Lammet', flee: 'Flykter', rage: 'Raseri', faint: 'Besvimt' }[P.forced.type] || 'Skräck', 'bad', 'Skräcktabellen.']);
    if (P.fx.fearCL?.t > 0) out.push([`Skräck -${P.fx.fearCL.v}`, 'bad', 'Minus på anfall og parering.']);
    if (P.fx.drunk > 0) out.push(['Full', 'bad', '-2 på CL.']);
    const hl = hungerLevel();
    if (hl === 2) out.push(['Utsultet', 'bad', 'To døgn uten mat: 1 KP hvert 12. time, og søvn leger ingenting.']);
    else if (hl === 1) out.push(['Sulten', 'bad', 'Et døgn uten mat: søvn gir ingen KP, og PSY kommer ikke tilbake av seg selv.']);
    if (P.fx.medBonus) out.push([`Meditation +${P.fx.medBonus}`, 'on', 'Gjelder neste slag.']);
    if (P.fx.tjuvBonus) out.push([`Tjuvens tur +${P.fx.tjuvBonus}`, 'on', 'Gjelder neste slag.']);
    if (P.fx.riddarslag) out.push(['Riddarslag', 'on', 'Neste treff gjør maksimal skade.']);
    if (P.fx.avvapna > 0) out.push(['Avväpna', 'on', 'Neste treff prøver å avväpna.']);
    if (P.heroArmed) out.push(['Hjältepoäng', 'on', 'Neste slag blir ett trinn bedre.']);
    for (const [id, b] of Object.entries(P.buffs)) out.push([`${(SPELLS[id]?.name || id).split(' ')[0]}${b.e ? ' E' + b.e : ''}`, 'on', `${SPELLS[id]?.text || ''} ${Math.ceil(b.t)} s igjen.`]);
    if (P.metalWorn && Object.keys(P.spells || {}).length) out.push(['Metall', 'bad', 'Inget järn mot huden: du kan ikke trylle.']);
    return out;
  }

  update(dt) {
    const P = G.player;
    $('#kpv').textContent = P.kp;
    $('#kpm').textContent = P.maxKP;
    $('#vpv').textContent = P.psy;
    $('#vpm').textContent = P.maxPSY;
    $('.orb.kp .fill').style.height = `${Math.max(0, P.kp / P.maxKP) * 100}%`;
    $('.orb.vp .fill').style.height = `${(P.psy / P.maxPSY) * 100}%`;
    $('.orb.kp').classList.toggle('low', P.kp / P.maxKP < 0.3);
    $('#silver').textContent = P.silver;
    const load = carriedKg(P), cap = capKg(P);
    const bk = `${load}/${cap}/${P.overloaded ? 1 : 0}`;
    if (this._bagKey !== bk) {
      this._bagKey = bk;
      $('#bagn').textContent = fmtKg(load);
      $('#bagc').textContent = cap;
      $('#bagchip').classList.toggle('over', !!P.overloaded);
    }
    const hk = `${P.hjp}/${P.heroArmed}`;
    if (this._hjpKey !== hk) {
      this._hjpKey = hk;
      const el = $('#hjpv');
      if (el) { el.textContent = `${P.hjp} HP`; el.classList.toggle('armed', !!P.heroArmed); el.classList.toggle('none', !P.hjp); }
    }
    if (G.run?.clock != null) this.setClock(G.run.clock);
    // kroppen
    const B = P.body;
    const dk = LOCS.map(l => `${B.loc[l]}${B.bleeding.has(l) ? 'b' : ''}${B.lame.has(l) ? 'l' : ''}`).join(',') + '|' + B.locMax.huvud;
    if (dk !== this._dollKey && this.dollZ) {
      this._dollKey = dk;
      for (const l of LOCS) {
        const v = B.loc[l], m = B.locMax[l];
        const z = this.dollZ[l];
        let col;
        if (B.lame.has(l) || v <= -m) col = '#3a0a08';
        else if (v <= 0) col = '#b3221d';
        else if (v >= m) col = '#4f5c40';
        else { const k = 1 - v / m; col = `rgb(${Math.round(110 + 110 * k)}, ${Math.round(110 - 30 * k)}, ${Math.round(60 - 30 * k)})`; }
        z.setAttribute('fill', col);
        z.classList.toggle('bleed', B.bleeding.has(l));
        z.querySelector('title').textContent = `${LOC_NAME[l]}: ${v} av ${m} KP, absorbering ${P.absAt?.(l) ?? 0}${B.bleeding.has(l) ? ', blør' : ''}${B.lame.has(l) ? ', lam' : ''}`;
        this.dollN[l].textContent = v;
      }
    }
    // status
    const chips = this.statusChips(P);
    const ck = chips.map(c => c[0]).join('|');
    if (ck !== this._chipKey) {
      this._chipKey = ck;
      $('#conds').innerHTML = chips.map(([t, c, ti]) => `<span class="${c === 'on' || c === 'bad' ? 'on' : ''}${c === 'bad' ? ' bad' : ''}" title="${ti}">${t}</span>`).join('');
    }
    const cdv = (k, max) => Math.min(1, (P.cd[k] || 0) / max);
    const set = (k, frac, disabled, extra, active) => {
      const s = this.slots[k];
      if (!s) return;
      s.style.setProperty('--cd', frac);
      s.classList.toggle('off', !!disabled);
      s.classList.toggle('active', !!active);
      if (extra !== undefined) s.querySelector('.n').textContent = extra;
    };
    const w = P.weapon();
    const slotsKey = P.activeSlots().map(s => s.id).join();
    if (this.lastW !== w || this.lastOff !== P.equip.vapen2 || this.lastSlots !== slotsKey) {
      this.lastW = w;
      this.lastOff = P.equip.vapen2;
      this.lastSlots = slotsKey;
      this.buildBar();
    }
    const able = P.canFight();
    set('atk', isRanged(w) ? cdv('shot', 1) : 0, !able || w.broken || P.gripOf(w) === 0 || (isRanged(w) && P.noAmmo > 0), w.broken ? '!' : '');
    set('parry', Math.min(1, Math.max(P.parryT.vapen, P.parryT.vapen2 ? P.parryT.vapen2 : 0) / 1.5), !able || !P.parryOptionsAny() || P.fx.barsark, '', P.guard > 0);
    set('dash', cdv('dodge', 0.7), !able || P.fx.barsark || P.loc.hben <= 0 || P.loc.vben <= 0);
    const thr = [P.equip.vapen, P.equip.vapen2].some(it => it?.thrown && !it.broken);
    set('throw', cdv('throw', 0.38), !thr);
    set('swap', cdv('swap', 0.3), false);
    P.activeSlots().forEach((s, i) => {
      const k = 'a' + (i + 1);
      if (s.kind === 'spell') set(k, cdv(k, 0.5), P.psy < 2 || P.metalWorn || P.curse?.mute, P.charge?.cdk === k ? 'E' + P.charge.e : '', P.charge?.cdk === k);
      else set(k, cdv(k, 0.6), false, '', s.id === 'Bärsärkagång' ? P.fx.barsark : P.fx.avvapna > 0);
    });
    const ab = ABILITIES[P.sheet.ability];
    if (ab) set('abil', cdv('abil', 0.5), ab.psy ? P.psy - ab.psy < 1 : false, P.sheet.ability === 'tjuvtur' ? `${2 - (P.floor.tjuvtur || 0)}` : '', !!(P.chan && (P.chan.kind === 'hands' || P.chan.kind === 'med')) || !!P.fx.riddarslag || !!P.fx.tjuvBonus);
    set('aid', cdv('aid', 0.5), !P.bleeding.size, P.bleeding.size || '', P.chan?.kind === 'aid');
    set('sneak', cdv('sneak', 1.2), P.fx.barsark, '', P.stealth);
    set('potion', cdv('potion', 1), P.potions <= 0, P.potions);
    set('hero', 0, P.hjp <= 0, P.hjp || '', P.heroArmed);
    // spørsmål om samhandling
    const W = G.world;
    let txt = null;
    if (W.nearItem?.kind === 'entry') txt = `<kbd>E</kbd> Ta ${W.nearItem.entry.name}${W.nearItem.entry.qty > 1 ? ' x' + W.nearItem.entry.qty : ''}`;
    else if (W.nearItem) txt = `<kbd>E</kbd> Ta opp <kbd>X</kbd> Ta på`;
    else if (W.nearInteract) txt = `<kbd>E</kbd> ${W.nearInteract.label}`;
    this.prompt.hidden = !txt;
    if (txt && this.prompt.innerHTML !== txt) this.prompt.innerHTML = txt;
    const tb = $('#tbtn-use');
    if (tb) tb.classList.toggle('ready', !!txt);
    this.updateTooltip(W.nearItem ? W.nearItem.item || W.nearItem.entry : null);
    if (this.boss) $('#bossbar .fill').style.width = `${Math.max(0, (this.boss.kp / this.boss.maxKP) * 100)}%`;
    // kanalisering: Första hjälpen, Handpåläggning, Meditation
    const rb = $('#restbar');
    const c = P.chan;
    if (c) {
      rb.hidden = false;
      $('#restlbl').textContent = c.kind === 'aid' ? 'Första hjälpen' : c.kind === 'hands' ? 'Handpåläggning' : 'Meditation';
      rb.querySelector('i').style.width = `${c.kind === 'aid' ? (c.t / c.dur) * 100 : (c.tick / 1.5) * 100}%`;
    } else rb.hidden = true;
    $('#blind').style.opacity = P.blind > 0 ? Math.min(0.92, P.blind / 2) : 0;
    this.mmTimer -= dt;
    if (this.mmTimer <= 0) {
      this.mmTimer = 0.12;
      this.drawMap(this.mmCtx, this.mm.width, this.mm.height, 5, true);
      if (!this.big.hidden) this.drawMap(this.bigCtx, this.big.width, this.big.height, 11, false);
    }
  }

  itemHTML(item, label, o = {}) {
    if (!item.slot) return this.entryHTML(item, label, o);
    const r = RARITY[item.rarity] || RARITY.vanlig;
    return `<div class="it"><div class="lbl">${label}</div><div class="nm" style="color:${r.color}">${item.name}</div>
      <div class="rar">${r.name} ${SLOT_NAME[item.slot] || item.slot}</div>
      ${(item.lines || []).map(l => `<div class="ln">${l}</div>`).join('')}
      ${item.flavor ? `<div class="fl">${item.flavor}</div>` : ''}${o.price != null ? `<div class="val">Verdi ${o.price} sm</div>` : ''}</div>`;
  }

  // Mat, drikk og verdisaker
  entryHTML(e, label, o = {}) {
    const r = RARITY[e.rarity || 'vanlig'];
    const kind = e.type === 'val' ? 'Verdisak' : CONS_KIND[e.icon] || 'Mat';
    return `<div class="it"><div class="lbl">${label}</div><div class="nm" style="color:${r.color}">${e.name}${e.qty > 1 ? ` <span class="q">x${e.qty}</span>` : ''}</div>
      <div class="rar">${kind}</div><div class="ln">${e.desc || ''}</div>
      <div class="val">Verdi ${o.price ?? e.value * (e.qty || 1)} sm</div></div>`;
  }

  updateTooltip(item) {
    if (item === this.lastTip) return;
    this.lastTip = item;
    if (!item) { this.tooltip.hidden = true; return; }
    if (!item.slot) { this.tooltip.innerHTML = this.entryHTML(item, 'På bakken'); this.tooltip.hidden = false; return; }
    const P = G.player;
    const slot = item.shield ? 'vapen2' : item.slot;
    const cur = P.equip[slot];
    this.tooltip.innerHTML = this.itemHTML(item, 'På bakken') + (cur ? this.itemHTML(cur, 'Har på') : '<div class="it"><div class="lbl">Har på</div><div class="ln">Ingenting</div></div>');
    this.tooltip.hidden = false;
  }

  // Automap i Diablo-stil, rotert 45 grader slik at opp er opp på skjermen
  drawMap(ctx, w, h, px, mini) {
    const D = G.dungeon, P = G.player;
    if (D.isTown) return this.drawTownMap(ctx, w, h, px, mini);
    ctx.clearRect(0, 0, w, h);
    if (mini) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, w / 2 - 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.fillStyle = 'rgba(8,7,10,0.72)';
      ctx.fillRect(0, 0, w, h);
    } else ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.rotate(Math.PI / 4);
    ctx.scale(px, px);
    const ptx = P.pos.x / T, ptz = P.pos.z / T;
    ctx.translate(-ptx, -ptz);
    const R = mini ? 22 : 60;
    const x0 = Math.max(0, Math.floor(ptx - R)), x1 = Math.min(D.W - 1, Math.ceil(ptx + R));
    const y0 = Math.max(0, Math.floor(ptz - R)), y1 = Math.min(D.H - 1, Math.ceil(ptz + R));
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      if (!D.explored[D.idx(x, y)]) continue;
      const v = D.get(x, y);
      if (v === FLOOR || v === PILLAR) { ctx.fillStyle = mini ? 'rgba(120,108,92,0.35)' : 'rgba(120,108,92,0.22)'; ctx.fillRect(x, y, 1, 1); }
      else if (v === WATER) { ctx.fillStyle = 'rgba(70,170,140,0.5)'; ctx.fillRect(x, y, 1, 1); }
    }
    ctx.strokeStyle = mini ? '#c9a35a' : 'rgba(201,163,90,0.85)';
    ctx.lineWidth = 1.6 / px;
    ctx.beginPath();
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      if (!D.explored[D.idx(x, y)] || D.get(x, y) === WALL) continue;
      if (D.get(x - 1, y) === WALL) { ctx.moveTo(x, y); ctx.lineTo(x, y + 1); }
      if (D.get(x + 1, y) === WALL) { ctx.moveTo(x + 1, y); ctx.lineTo(x + 1, y + 1); }
      if (D.get(x, y - 1) === WALL) { ctx.moveTo(x, y); ctx.lineTo(x + 1, y); }
      if (D.get(x, y + 1) === WALL) { ctx.moveTo(x, y + 1); ctx.lineTo(x + 1, y + 1); }
    }
    ctx.stroke();
    const dot = (wx, wz, col, r, always = false) => {
      const tx = Math.floor(wx / T), ty = Math.floor(wz / T);
      if (!always && !D.explored[D.idx(tx, ty)]) return;
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc(wx / T, wz / T, r, 0, Math.PI * 2);
      ctx.fill();
    };
    for (const it of G.interactables) {
      if (it.kind === 'stairs') dot(it.pos.x, it.pos.z, '#6ab4ff', 1.1);
      else if (it.kind === 'shop') dot(it.pos.x, it.pos.z, '#f0d080', 0.9);
      else if (it.kind === 'chest' && !it.opened) dot(it.pos.x, it.pos.z, it.locked ? '#c07030' : '#d8a040', 0.55);
      else if (it.kind === 'rune' && !it.read) dot(it.pos.x, it.pos.z, '#ffa040', 0.6);
    }
    for (const c of G.world.caches || []) if (!c.taken && (c.known || c.found)) dot(c.x, c.z, '#ffe080', 0.5, true);
    for (const p of G.pickups) if (p.kind === 'item') dot(p.pos.x, p.pos.z, RARITY[p.item.rarity].color, 0.4);
    // MÖRKERSYN og KÄNNA FIENDSKAP viser fiender du ikke ser
    const sense = P.buffs?.morkersyn || P.buffs?.kannafiendskap;
    for (const e of G.enemies) {
      if (e.dead) continue;
      if (e.alerted || sense) dot(e.pos.x, e.pos.z, e.fleeing ? '#c0a040' : e.def.boss ? '#ff5030' : '#c0392b', e.def.boss ? 0.9 : 0.4, !!sense);
    }
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(ptx, ptz, mini ? 0.7 : 0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    if (mini) {
      ctx.strokeStyle = '#6b5a3e';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, w / 2 - 2, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  // Bykart: bakke etter type, hus som streker, folk som prikker, navn på stort kart
  drawTownMap(ctx, w, h, px, mini) {
    const D = G.dungeon, P = G.player;
    ctx.clearRect(0, 0, w, h);
    ctx.save();
    if (mini) {
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, w / 2 - 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.fillStyle = 'rgba(8,7,10,0.72)';
      ctx.fillRect(0, 0, w, h);
    } else {
      ctx.fillStyle = 'rgba(6,5,8,0.8)';
      ctx.fillRect(0, 0, w, h);
      px = Math.min(18, Math.min(w, h) / (D.W * 1.36));
    }
    ctx.translate(w / 2, h / 2);
    ctx.rotate(Math.PI / 4);
    ctx.scale(px, px);
    // stort kart viser hele byen, lite kart følger deg
    const ptx = mini ? P.pos.x / T : D.W / 2, ptz = mini ? P.pos.z / T : D.H / 2;
    ctx.translate(-ptx, -ptz);
    const col = { [GR.COBBLE]: 'rgba(150,142,128,A)', [GR.DIRT]: 'rgba(120,98,70,A)', [GR.GRASS]: 'rgba(70,104,56,A)', [GR.WOOD]: 'rgba(132,96,60,A)', [GR.FLAG]: 'rgba(176,160,128,A)', [GR.PLANK]: 'rgba(128,110,84,A)' };
    const a = mini ? 0.55 : 0.4;
    const R = mini ? 22 : 60;
    const x0 = Math.max(0, Math.floor(ptx - R)), x1 = Math.min(D.W - 1, Math.ceil(ptx + R));
    const y0 = Math.max(0, Math.floor(ptz - R)), y1 = Math.min(D.H - 1, Math.ceil(ptz + R));
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const k = D.idx(x, y), v = D.grid[k];
      if (v === WATER) { ctx.fillStyle = 'rgba(60,130,170,0.6)'; ctx.fillRect(x, y, 1, 1); continue; }
      if (D.cityMask[k]) { ctx.fillStyle = 'rgba(201,163,90,0.75)'; ctx.fillRect(x, y, 1, 1); continue; }
      // områdene i Edelfara: skog, dypt vann, åser og stein
      if (v === WALL && D.kind) {
        const kk = D.kind[k];
        ctx.fillStyle = kk === 2 ? 'rgba(60,130,170,0.6)' : kk === 3 ? 'rgba(120,130,80,0.55)' : kk === 5 ? 'rgba(110,104,96,0.5)' : 'rgba(28,48,26,0.7)';
        ctx.fillRect(x, y, 1.02, 1.02);
        continue;
      }
      if (v === WALL) continue;
      const g = D.ground[k];
      if (col[g]) { ctx.fillStyle = col[g].replace('A', a); ctx.fillRect(x, y, 1.02, 1.02); }
    }
    // hus som streker mellom vegg-flisene
    ctx.strokeStyle = mini ? '#e0c080' : 'rgba(224,192,128,0.9)';
    ctx.lineWidth = 2.2 / px;
    ctx.beginPath();
    for (const pc of D.pieces) {
      if (pc.v !== HOUSE) continue;
      const cx = pc.tx + 0.5, cz = pc.ty + 0.5;
      for (const ar of pc.arms) {
        const l = (ar.len + 0.2) / T;
        ctx.moveTo(cx, cz);
        ctx.lineTo(cx + ar.dx * l, cz + ar.dy * l);
      }
    }
    ctx.stroke();
    ctx.strokeStyle = 'rgba(160,130,90,0.7)';
    ctx.lineWidth = 1 / px;
    ctx.beginPath();
    for (const pc of D.pieces) {
      if (pc.v !== FENCE) continue;
      const cx = pc.tx + 0.5, cz = pc.ty + 0.5;
      for (const ar of pc.arms) { ctx.moveTo(cx, cz); ctx.lineTo(cx + ar.dx * 0.5, cz + ar.dy * 0.5); }
    }
    ctx.stroke();
    const dot = (wx, wz, c, r) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(wx / T, wz / T, r, 0, Math.PI * 2); ctx.fill(); };
    if (D.grate) dot(D.grate.x, D.grate.z, '#6ab4ff', 0.9);
    for (const n of D.life?.npcs || []) if (!n.hidden) dot(n.pos.x, n.pos.z, n.mode === 'sleep' ? 'rgba(200,190,160,0.5)' : '#f0dc90', mini ? 0.45 : 0.4);
    if (D.isArea) {
      for (const it of D.life?.exits || []) if (it.label) dot(it.pos.x, it.pos.z, '#6ab4ff', 0.8);
      for (const a of D.life?.allies || []) if (!a.dead) dot(a.pos.x, a.pos.z, '#8ac0ff', 0.4);
      for (const e of G.enemies) if (!e.dead && e.alerted) dot(e.pos.x, e.pos.z, e.fleeing ? '#c0a040' : '#c0392b', e.def.leader ? 0.8 : 0.45);
    }
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(P.pos.x / T, P.pos.z / T, mini ? 0.7 : 0.75, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    if (!mini) {
      // navn på husene
      ctx.save();
      ctx.font = '600 13px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const c45 = Math.SQRT1_2;
      const toScreen = (tx, ty) => {
        const dx = (tx - ptx) * px, dy = (ty - ptz) * px;
        return [w / 2 + (dx - dy) * c45, h / 2 + (dx + dy) * c45];
      };
      for (const b of D.buildings) {
        const [sx, sy] = toScreen((b.x0 + b.x1 + 1) / 2, (b.y0 + b.y1 + 1) / 2);
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillText(b.name, sx + 1, sy + 1);
        ctx.fillStyle = '#f0dca0';
        ctx.fillText(b.name, sx, sy);
      }
      for (const [nm, tx, ty] of [['Torget', 19, 22], ['Nordporten', 18.5, 2.2], ['Kirkegården', 38, 26.5], ['Elva', 32, 30], ['Kloakkluken', D.grate.x / T, D.grate.z / T + 1.2]]) {
        const [sx, sy] = toScreen(tx, ty);
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillText(nm, sx + 1, sy + 1);
        ctx.fillStyle = nm === 'Kloakkluken' ? '#9ad0ff' : '#c9b58a';
        ctx.fillText(nm, sx, sy);
      }
      ctx.restore();
    } else {
      ctx.strokeStyle = '#6b5a3e';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, w / 2 - 2, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  toggleBigMap() {
    this.big.hidden = !this.big.hidden;
    if (!this.big.hidden) {
      this.big.width = Math.min(innerWidth, 1100);
      this.big.height = Math.min(innerHeight, 800);
    }
  }

  // --- skjermer -----------------------------------------------------------

  renderDojo(meta, upgrades, onBuy) {
    const el = $('#dojo-list');
    $('#feathers').textContent = meta.feathers;
    el.innerHTML = '';
    for (const u of upgrades) {
      const lv = meta.levels[u.id] || 0;
      const maxed = lv >= u.max;
      const cost = u.cost * (lv + 1);
      const row = document.createElement('div');
      row.className = 'up';
      row.innerHTML = `<div class="txt"><div class="nm">${u.name} <span class="lv">${'&#9670;'.repeat(lv)}${'&#9671;'.repeat(u.max - lv)}</span></div><div class="ds">${u.desc}</div></div>
        <button class="btn small" ${maxed || meta.feathers < cost ? 'disabled' : ''}>${maxed ? 'Fullført' : `${cost} fjær`}</button>`;
      row.querySelector('button').onclick = () => onBuy(u);
      el.appendChild(row);
    }
  }

  renderSheet() {
    const P = G.player, S = P.sheet;
    $('#sheet-body').innerHTML = sheetHTML(S, P);
  }
}

// Rollformulär etter DoD91. Felles for formuläret i spillet og sammendraget i rollpersonsskapingen.
// P (spilleren) er valgfri: uten den vises verdiene fra formuläret.
export function sheetHTML(S, P = null) {
  const race = RACE[S.kin] || RACE.manniska, prof = PROF[S.profession] || PROF.krigare;
  const age = AGES.find(a => a.id === S.age) || AGES[1];
  const A = P ? P.attrs : S.attrs;
  const skills = P ? P.skills : S.skills;
  const yrke = new Set(S.yrke || []);
  const der = derived(A, S.kin, {});
  const kp = P ? `${P.kp}/${P.maxKP}` : der.kp;
  const psy = P ? `${P.psy}/${P.maxPSY}` : A.PSY;
  const sb = skadebonus(A.STY + A.STO);
  const exp = P ? P.exp : {};
  const sheetLike = { yrke: S.yrke || [], specialFx: S.special?.fx || {}, kin: S.kin };
  const attrs = ATTRS.map(k => `<div class="attr"><div class="k">${k}</div><div class="v">${A[k]}</div><div class="n">${ATTR_NAME[k]}</div></div>`).join('');
  const skRow = id => {
    const v = skills[id];
    if (v == null) return '';
    const sk = SKILL[id];
    const ep = exp[id] || 0;
    const next = ep && sk ? fvCost(P ? P.baseSkills[id] || 0 : v, (P ? P.baseSkills[id] || 0 : v) + 1, baseCost(id, sheetLike)) : 0;
    return `<div class="sk${yrke.has(id) ? ' tr' : ''}" title="${sk?.use || ''}${ep ? ` ${ep} EP, neste FV koster ${next}.` : ''}"><span class="box ${ep ? 'm' : ''}"></span><span class="nm">${id}</span><span class="at">${sk?.attr || ''}${sk?.kat === 'B' ? ' B' : ''}</span><span class="v">${v}</span></div>`;
  };
  const ids = Object.keys(skills).filter(id => SKILL[id]);
  const byType = t => ids.filter(id => SKILL[id].type === t).sort((a, b) => a.localeCompare(b, 'sv')).map(skRow).join('');
  const prim = byType('prim');
  const vap = [...byType('vap'), ...byType('konst')].join('');
  const sek = [...byType('sek'), ...byType('magi')].join('');
  const ab = (name, desc, extra = '') => `<div class="boon-s"><b>${name}</b>${extra} <span>${desc}</span></div>`;
  const yf = ABILITIES[S.ability];
  const ability = yf ? ab(yf.name, yf.text, yf.psy ? ` <i>${yf.psy} PSY</i>` : '') : '<div class="ln">Ingen.</div>';
  const special = S.special ? ab(S.special.name, S.special.text) : '';
  const konst = S.konst && KONSTER[S.konst] ? ab(S.konst, KONSTER[S.konst].parts.map(p => KONST_PARTS[p].name).join(', ') + '.', ` <i>FV ${skills[S.konst] ?? 0}</i>`) : '';
  const spellsObj = P ? P.spells : S.spells || {};
  const spells = Object.entries(spellsObj).map(([id, s]) => SPELLS[id] ? ab(SPELLS[id].name, SPELLS[id].text, ` <i>S ${s}, skolvärde ${SPELLS[id].sv}</i>`) : '').join('');
  const heroic = P && P.heroic.length ? `<h3>Hjälteförmågor</h3>${P.heroic.map(h => ab(HJALTEFORMAGOR[h]?.name || h, HJALTEFORMAGOR[h]?.text || '')).join('')}` : '';
  let body = '';
  if (P) {
    body = `<h3>Träffområden</h3><div class="sks">${LOCS.map(l => `<div class="sk"><span class="box ${P.bleeding.has(l) ? 'm' : ''}"></span><span class="nm">${LOC_NAME[l]}</span><span class="at">abs ${P.absAt(l)}</span><span class="v">${P.loc[l]}/${P.locMax[l]}</span></div>`).join('')}</div>`;
  } else {
    const lk = der.loc;
    body = `<h3>Träffområden</h3><div class="sks">${LOCS.map(l => `<div class="sk"><span class="box"></span><span class="nm">${LOC_NAME[l]}</span><span class="at"></span><span class="v">${lk[l]}</span></div>`).join('')}</div>`;
  }
  let eq = '';
  if (P) {
    const names = { vapen: 'Våpen', vapen2: 'I den andre hånda', hjalm: 'Hjälm', rustning: 'Rustning', armar: 'Armskydd', ben: 'Benskydd', amulett: 'Amulett' };
    eq = Object.keys(names).map(s => (P.equip[s] ? G.ui.itemHTML(P.equip[s], names[s]) : `<div class="it"><div class="lbl">${names[s]}</div><div class="ln">Tomt</div></div>`)).join('');
  }
  const gear = (P ? [...P.kit] : S.gear?.g || []).map(g => GEAR[g]?.name || g).join(', ');
  const back = [
    S.appearance ? `<div><span>Utseende</span>${S.appearance}</div>` : '',
    S.stand ? `<div><span>Socialt stånd</span>${S.stand}</div>` : '',
    S.aidne != null && AIDNE[S.aidne] ? `<div><span>Aidne</span>${AIDNE[S.aidne].stand}</div>` : '',
  ].join('');
  const boons = P && P.boons.length ? `<h3>Gaver</h3>${P.boons.map(b => `<div class="boon-s"><b style="color:${SRC_COLOR[b.src]}">${b.name}</b> <span>${b.desc}</span></div>`).join('')}` : '';
  const inj = P && P.injuries.length ? `<h3>Kritiske skador</h3>${P.injuries.map(i => ab(`${i.name} (${LOC_NAME[i.loc]?.toLowerCase()})`, i.text)).join('')}` : '';
  const fob = P && P.phobias.length ? `<h3>Fobier</h3>${P.phobias.map(f => `<div class="ln">${f.name}${f.mild ? ' (mild)' : ''}</div>`).join('')}` : '';
  const epTot = Object.values(exp).reduce((a, b) => a + b, 0);
  const hand = { hoger: 'högerhänt', vanster: 'vänsterhänt', dubbelhant: 'dubbelhänt', ambidextrios: 'ambidextriös' }[S.hand] || '';
  return `
    <div class="sh-head"><div><div class="eyebrow">Rollformulär, DoD91</div><h2>${S.name}</h2>
      <div class="sub">${S.realName ? `Egentlig ${S.realName}. ` : ''}${race.name}, ${prof.name.toLowerCase()}${S.school ? ` (${S.school.toLowerCase()})` : ''}, ${age.name.toLowerCase()}${hand ? `, ${hand}` : ''}.</div></div>
      <div class="pts"><div><b>${kp}</b><span>KP</span></div><div><b>${psy}</b><span>PSY</span></div><div><b>${der.move}</b><span>Förflyttning</span></div><div><b>${sb ? tStr(sb) : '-'}</b><span>Skadebonus</span></div>${P ? `<div><b>${P.hjp}</b><span>Hjältepoäng</span></div><div><b>${epTot}</b><span>EP</span></div>` : ''}</div></div>
    <div class="attrs">${attrs}</div>
    <div class="dbs"><span>Bärförmåga <b>${A.STY} kg</b></span><span>Fylt rute: ferdigheten har EP. Lys tekst: yrkesfärdighet. B: kategori B (ingen EP fra eventyr).</span></div>
    <div class="cols3">
      <div><h3>Primära färdigheter</h3><div class="sks">${prim}</div>${body}</div>
      <div><h3>Vapen og stridskonst</h3><div class="sks">${vap || '<div class="ln">Ingen.</div>'}</div>${sek ? `<h3>Sekundära</h3><div class="sks">${sek}</div>` : ''}</div>
      <div><h3>Yrkesförmåga</h3>${ability}${special ? `<h3>Särskild förmåga</h3>${special}` : ''}${konst ? `<h3>Stridskonst</h3>${konst}` : ''}${spells ? `<h3>Besvärjelser</h3>${spells}` : ''}${heroic}${boons}${inj}${fob}</div>
    </div>
    ${eq ? `<h3>Utrustning</h3><div class="eq eq-grid">${eq}</div>` : ''}
    <div class="sh-foot"><div><span>Övrigt</span>${gear || 'Ingenting'}</div>${back}</div>`;
}
