import * as THREE from 'three';
import { G, T } from './state.js';
import { CONDITIONS, ATTR } from './rules.js';
import { SKILLS, SKILL, HEROIC, KIN_ABILITIES, SPELLS, TRICKS, KIN, PROF, AGES, GEAR, AIDNE, baseChance, dmgBonusDie } from './dod.js';
import { RARITY, SRC_COLOR, isRanged } from './loot.js';
import { WALL, FLOOR, WATER, PILLAR } from './dungeon.js';
import { tStr } from './rules.js';
import { HOUSE, FENCE, GR } from './townmap.js';
import { bagCap } from './inventory.js';

const $ = s => document.querySelector(s);
const tmp = new THREE.Vector3();

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
};
const KIND_ICON = { fist: 'fist', knife: 'blade', sword: 'blade', great: 'blade', axe: 'axe', hammer: 'hammer', spear: 'spear', staff: 'staff', bow: 'bow', xbow: 'bow', sling: 'bow' };
const svg = k => `<svg viewBox="0 0 24 24"><path d="${ICON[k] || ICON.star}"/></svg>`;

const CONS_KIND = { potion: 'Drikk', potionvp: 'Drikk', saffron: 'Krydder' };

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
    this.condEls = {};
    const ce = $('#conds');
    for (const c of CONDITIONS) {
      const s = document.createElement('span');
      s.textContent = c.name;
      s.title = `${c.name} (${c.attr}): nackdel på ${ATTR[c.attr]} og ferdighetene som hører til.`;
      ce.appendChild(s);
      this.condEls[c.id] = s;
    }
    this.slots = {};
    this.lastTip = null;
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
  }

  // Ultima-aktig kamplogg med terningene synlige
  logRoll(r, text, enemy = false) {
    const dice = r.dice.length > 1 ? `${r.dice.join('|')}${r.boon ? ' F' : ' N'}` : `${r.r}`;
    const cls = r.drake ? 'drake' : r.demon ? 'demon' : r.success ? 'ok' : 'fail';
    const sk = r.skill ? `${r.skill === 'Slagsmål' && G.player?.isNebb ? 'Kvakk-Fu' : r.skill} ` : '';
    const pushed = r.pushed ? ' P' : '';
    this.log(`<span class="roll ${cls}" title="T20 mot ${r.target}${r.pushed ? ', pressat' : ''}">${sk}${dice}/${r.target}${pushed}</span> ${text}`, enemy ? 'enemy' : '');
  }

  flashDamage() {
    const f = $('#dmgflash');
    f.classList.remove('on');
    void f.offsetWidth;
    f.classList.add('on');
  }

  showBoss(e) {
    this.boss = e;
    $('#bossbar').hidden = false;
    $('#bossbar .fill').style.width = `${Math.max(0, (e.kp / e.maxKP) * 100)}%`;
  }
  hideBoss() {
    this.boss = null;
    $('#bossbar').hidden = true;
  }

  setDepth(depth, name) {
    const eb = $('#depth .eyebrow');
    eb.innerHTML = depth === 0 ? '<span class="ebp">Zorakin, Aidne · </span><span id="clock"></span>' : `Nivå <span id="depthNum">${depth}</span> av 5<span class="ebp"> · </span><span id="clock" class="ebp"></span>`;
    document.body.classList.toggle('in-town', depth === 0);
    this.clockTxt = null;
    $('#depthName').textContent = name;
    const b = $('#banner');
    b.innerHTML = `<div class="eyebrow">${depth === 0 ? 'Zorakin, Aidnehalvøya' : `Nivå ${depth} av 5`}</div><div class="title">${name}</div>`;
    b.classList.remove('on');
    void b.offsetWidth;
    b.classList.add('on');
  }

  setClock(clock) {
    const h = ((clock % 24) + 24) % 24;
    const day = Math.floor(clock / 24) + 1;
    const hh = Math.floor(h), mm = Math.floor((h - hh) * 6) * 10;
    const part = h < 5 ? 'natt' : h < 10 ? 'morgen' : h < 17 ? 'dag' : h < 21 ? 'kveld' : 'natt';
    const txt = `dag ${day}, kl. ${String(hh).padStart(2, '0')}.${String(mm).padStart(2, '0')} (${part})`;
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
    add('atk', 'LMB', KIND_ICON[w.kind] || 'fist', `${isRanged(w) ? 'Skyt' : 'Anfall'} med ${w.name} (${w.skill})`);
    add('parry', 'RMB', 'shield', 'Parera: hold inne. Slår parering mot angrep forfra.');
    add('dash', 'SPC', 'dodge', 'Undvika: dukk unna. Angrep som lander mens du dukker gir et Undvika-slag.');
    add('throw', 'Q', 'throw', 'Kast et kastvåpen. Plukk det opp igjen etterpå.');
    if (P.equip.vapen2 && !P.equip.vapen2.shield) add('swap', 'Z', 'swap', 'Bytt våpen');
    const keys = ['R', 'G', 'T'];
    P.activeSlots().forEach((s, i) => {
      if (s.kind === 'spell') {
        const sp = SPELLS[s.id];
        add('a' + (i + 1), keys[i], 'spell', `${sp.name} (${sp.school}). Hold inne for høyere effektgrad: 2, 4 eller 6 VP${sp.indoor ? ', dobbelt innendørs' : ''}. ${sp.game}`, sp.indoor ? '4+' : '2+');
      } else {
        const h = HEROIC[s.id];
        add('a' + (i + 1), keys[i], 'star', `${h.name}: ${h.game}`, h.vp || '');
      }
    });
    const kin = P.kinAb.find(k => !KIN_ABILITIES[k].passive);
    if (kin) add('kin', 'F', 'kin', `${KIN_ABILITIES[kin].name}: ${KIN_ABILITIES[kin].game}`, KIN_ABILITIES[kin].vp || '');
    add('sneak', 'SHF', 'sneak', 'Smyga. Neste angrep blir et smyganfall.');
    add('potion', '1', 'potion', 'Legedrikk: 2T6 KP.');
    this.buildTouch();
  }

  buildTouch() {
    const P = G.player;
    const box = $('#tbtns-dyn');
    if (!box) return;
    const keys = ['TA1', 'TA2', 'TA3'];
    const SHORT = { foljeslagare: 'HUND', anpasslig: 'ANPASS', halsomenal: 'ÅL', langsint: 'HÄMND', inrefrid: 'MEDITERA', vresig: 'VRESIG', jaktsinne: 'JAKT', drakdrapare: 'DRAKDRÄP', mastersmed: 'SLIPA', skattjagare: 'SKATT', tvillingpil: 'TVILLING' };
    const short = (id, name) => SHORT[id] || name.split(' ')[0].toUpperCase().slice(0, 8);
    const labels = P.activeSlots().map(s => short(s.id, s.kind === 'spell' ? SPELLS[s.id].name : HEROIC[s.id].name));
    const kin = P.kinAb.find(k => !KIN_ABILITIES[k].passive);
    box.innerHTML = labels.map((l, i) => `<button class="tbtn" data-tbtn="${keys[i]}">${l}</button>`).join('')
      + (kin ? `<button class="tbtn" data-tbtn="TKin">${short(kin, KIN_ABILITIES[kin].name)}</button>` : '')
      + (P.equip.vapen2 && !P.equip.vapen2.shield ? '<button class="tbtn" data-tbtn="TSwap">BYTT</button>' : '');
    G.input.bindTouchButtons?.(box);
  }

  update(dt) {
    const P = G.player;
    $('#kpv').textContent = P.kp;
    $('#kpm').textContent = P.maxKP;
    $('#vpv').textContent = P.vp;
    $('#vpm').textContent = P.maxVP;
    $('.orb.kp .fill').style.height = `${(P.kp / P.maxKP) * 100}%`;
    $('.orb.vp .fill').style.height = `${(P.vp / P.maxVP) * 100}%`;
    $('.orb.kp').classList.toggle('low', P.kp / P.maxKP < 0.3);
    $('#silver').textContent = P.silver;
    const bk = `${P.bag?.length || 0}/${bagCap(P)}/${P.overloaded ? 1 : 0}`;
    if (this._bagKey !== bk) {
      this._bagKey = bk;
      $('#bagn').textContent = P.bag?.length || 0;
      $('#bagc').textContent = bagCap(P);
      $('#bagchip').classList.toggle('over', !!P.overloaded);
    }
    if (G.run?.clock != null) this.setClock(G.run.clock);
    for (const c of CONDITIONS) this.condEls[c.id].classList.toggle('on', P.hasCond(c.id));
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
    if (this.lastW !== w || this.lastOff !== P.equip.vapen2 || this.lastSlots !== P.activeSlots().map(s => s.id).join()) {
      this.lastW = w;
      this.lastOff = P.equip.vapen2;
      this.lastSlots = P.activeSlots().map(s => s.id).join();
      this.buildBar();
    }
    set('atk', isRanged(w) ? cdv('shot', 1) : 0, w.broken || (isRanged(w) && P.noAmmo > 0), w.broken ? '!' : '');
    set('parry', cdv('parry', 0.45), !P.parryItem() || P.fx.barsark > 0, '', P.guard > 0);
    set('dash', cdv('dodge', 0.7), P.fx.barsark > 0);
    const thr = [P.equip.vapen, P.equip.vapen2].some(it => it && !it.shield && !isRanged(it) && it.kind !== 'fist' && (it.f.includes('thr') || (P.has('kastarm') && it.grip === 1)));
    set('throw', cdv('throw', 0.38), !thr);
    set('swap', cdv('swap', 0.3), false);
    P.activeSlots().forEach((s, i) => {
      const k = 'a' + (i + 1);
      if (s.kind === 'spell') set(k, cdv(k, 0.5), P.vp < 2 && P.vp > 1, P.charge?.cdk === k ? 'EG' + P.charge.pl : '', P.charge?.cdk === k);
      else {
        const h = HEROIC[s.id];
        const on = (P.fx[s.id] > 0) || (s.id === 'barsark' && P.fx.barsark > 0) || (s.id === 'tvillingpil' && P.fx.twinShot) || (s.id === 'mastersmed' && P.fx.sharpened);
        set(k, cdv(k, 0.6), P.vp < h.vp, '', on);
      }
    });
    set('kin', cdv('kin', 0.5), false, '', !!P.armed || !!P.prey);
    set('sneak', cdv('sneak', 2), P.fx.barsark > 0, '', P.stealth > 0);
    set('potion', cdv('potion', 1), P.potions <= 0, P.potions);
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
    // kort vila
    const rb = $('#restbar');
    if (P.chanRest) { rb.hidden = false; rb.querySelector('i').style.width = `${(P.chanRest.t / P.chanRest.dur) * 100}%`; }
    else rb.hidden = true;
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
    const r = RARITY[item.rarity];
    const slotName = { vapen: 'våpen', vapen2: 'skjold', rustning: 'rustning', hjalm: 'hjelm', amulett: 'amulett' }[item.slot] || item.slot;
    return `<div class="it"><div class="lbl">${label}</div><div class="nm" style="color:${r.color}">${item.name}</div>
      <div class="rar">${r.name} ${slotName}</div>
      ${item.lines.map(l => `<div class="ln">${l}</div>`).join('')}
      ${item.flavor ? `<div class="fl">${item.flavor}</div>` : ''}${o.price != null ? `<div class="val">Verdi ${o.price} silver</div>` : ''}</div>`;
  }

  // Mat, drikk og verdisaker
  entryHTML(e, label, o = {}) {
    const r = RARITY[e.rarity || 'vanlig'];
    const kind = e.type === 'val' ? 'Verdisak' : CONS_KIND[e.icon] || 'Mat';
    return `<div class="it"><div class="lbl">${label}</div><div class="nm" style="color:${r.color}">${e.name}${e.qty > 1 ? ` <span class="q">x${e.qty}</span>` : ''}</div>
      <div class="rar">${kind}</div><div class="ln">${e.desc || ''}</div>
      <div class="val">Verdi ${o.price ?? e.value * (e.qty || 1)} silver</div></div>`;
  }

  updateTooltip(item) {
    if (item === this.lastTip) return;
    this.lastTip = item;
    if (!item) { this.tooltip.hidden = true; return; }
    if (!item.slot) { this.tooltip.innerHTML = this.entryHTML(item, 'På bakken'); this.tooltip.hidden = false; return; }
    const cur = G.player.equip[item.slot === 'vapen2' && !G.player.equip.vapen2 ? 'vapen2' : item.slot];
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
    const magic = P.tricks?.has('kannamagi');
    for (const p of G.pickups) if (p.kind === 'item') dot(p.pos.x, p.pos.z, RARITY[p.item.rarity].color, magic && p.item.rarity !== 'vanlig' ? 0.7 : 0.4, magic && p.item.rarity !== 'vanlig');
    const C = G.companion;
    for (const e of G.enemies) {
      if (e.dead) continue;
      const spotted = e.alerted || (C?.alive && Math.hypot(e.pos.x - C.pos.x, e.pos.z - C.pos.z) < 12);
      if (spotted || e === P.prey) dot(e.pos.x, e.pos.z, e === P.prey ? '#ff2a10' : e.def.boss ? '#ff5030' : '#c0392b', e.def.boss || e === P.prey ? 0.9 : 0.4, e === P.prey);
    }
    if (C?.alive) dot(C.pos.x, C.pos.z, '#d8b080', 0.45, true);
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
    if (G.companion?.alive) dot(G.companion.pos.x, G.companion.pos.z, '#d8b080', 0.45);
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

  // Rollformulär i DoD-stil
  renderSheet() {
    const P = G.player, S = P.sheet;
    $('#sheet-body').innerHTML = sheetHTML(S, P);
  }
}

// Felles for rollformulär i spillet og oppsummeringen i rollpersonsskapingen.
// P (spilleren) er valgfri: uten den vises verdiene fra formulæret.
export function sheetHTML(S, P = null) {
  const kin = KIN[S.kin], prof = PROF[S.profession];
  const age = AGES.find(a => a.id === S.age);
  const A = P ? P.attrs : S.attrs;
  const skills = P ? P.skills : S.skills;
  const trained = new Set(S.trained);
  const marks = P ? P.marks : new Set();
  const attrs = Object.keys(ATTR).map(k => `<div class="attr"><div class="k">${k}</div><div class="v">${A[k]}</div><div class="n">${ATTR[k]}</div></div>`).join('');
  const skRow = s => {
    const v = skills[s.id];
    if (v == null) return '';
    const label = s.id === 'Slagsmål' && S.id === 'svartnebb' ? 'Slagsmål (Kvakk-Fu)' : s.id;
    return `<div class="sk${trained.has(s.id) ? ' tr' : ''}"><span class="box ${marks.has(s.id) ? 'm' : ''}"></span><span class="nm">${label}</span><span class="at">${s.attr}</span><span class="v">${v}</span></div>`;
  };
  const gen = SKILLS.filter(s => s.type === 'gen').map(skRow).join('');
  const vap = SKILLS.filter(s => s.type === 'vap').map(skRow).join('');
  const sek = SKILLS.filter(s => s.type === 'sek').map(skRow).join('');
  const kp = P ? `${P.kp}/${P.maxKP}` : A.FYS;
  const vp = P ? `${P.vp}/${P.maxVP}` : A.PSY;
  const move = P ? P.move : kin.move + (A.SMI <= 6 ? -4 : A.SMI <= 9 ? -2 : A.SMI <= 12 ? 0 : A.SMI <= 15 ? 2 : 4);
  const db = k => (dmgBonusDie(A[k]) ? '+' + tStr(dmgBonusDie(A[k])) : 'ingen');
  const ab = (name, desc, extra = '') => `<div class="boon-s"><b>${name}</b>${extra} <span>${desc}</span></div>`;
  const heroic = (P ? P.heroic : S.heroic).map(h => ab(HEROIC[h].name, HEROIC[h].game, HEROIC[h].vp ? ` <i>${HEROIC[h].vp} VP</i>` : '')).join('') || '<div class="ln">Ingen.</div>';
  const kinA = S.kinAbilities.map(k => ab(KIN_ABILITIES[k].name, KIN_ABILITIES[k].game, KIN_ABILITIES[k].vp ? ` <i>${KIN_ABILITIES[k].vp} VP</i>` : '')).join('');
  const spells = (S.spells || []).map(s => ab(SPELLS[s].name, SPELLS[s].game, ` <i>${SPELLS[s].school}</i>`)).join('');
  const tricks = (S.tricks || []).map(t => ab(TRICKS[t].name, TRICKS[t].game)).join('');
  let eq = '';
  if (P) {
    const names = { vapen: 'Våpen', vapen2: 'I den andre hånda', rustning: 'Rustning', hjalm: 'Hjälm', amulett: 'Amulett' };
    eq = Object.keys(names).map(s => (P.equip[s] ? G.ui.itemHTML(P.equip[s], names[s]) : `<div class="it"><div class="lbl">${names[s]}</div><div class="ln">Tomt</div></div>`)).join('');
  }
  const gear = (P ? [...P.kit] : S.gear.g || []).map(g => GEAR[g]?.name || g).join(', ');
  const back = [
    S.weakness ? `<div><span>Svaghet</span>${S.weakness}</div>` : '',
    S.appearance ? `<div><span>Utseende</span>${S.appearance}</div>` : '',
    S.memento ? `<div><span>Minnessak</span>${S.memento}</div>` : '',
    S.aidne != null ? `<div><span>Socialt stånd (Aidne)</span>${AIDNE[S.aidne].stand}</div>` : '',
  ].join('');
  const boons = P && P.boons.length ? `<h3>Gaver</h3>${P.boons.map(b => `<div class="boon-s"><b style="color:${SRC_COLOR[b.src]}">${b.name}</b> <span>${b.desc}</span></div>`).join('')}` : '';
  const inj = P && P.injuries.length ? `<h3>Svåra skador</h3>${P.injuries.map(i => `<div class="boon-s"><b>${i.name}</b> <span>${i.perm ? 'Varig' : `Leges etter ${i.left} vila til`}</span></div>`).join('')}` : '';
  return `
    <div class="sh-head"><div><div class="eyebrow">Rollformulär</div><h2>${S.name}</h2>
      <div class="sub">${S.realName ? `Egentlig ${S.realName}. ` : ''}${kin.name}, ${prof.name.toLowerCase()}${S.school ? ` (${S.school.toLowerCase()})` : ''}, ${age.name.toLowerCase()}.</div></div>
      <div class="pts"><div><b>${kp}</b><span>KP</span></div><div><b>${vp}</b><span>VP</span></div><div><b>${move}</b><span>Förflyttning</span></div><div><b>${P ? P.armor : '-'}</b><span>Rustning</span></div></div></div>
    <div class="attrs">${attrs}</div>
    <div class="dbs"><span>Skadebonus STY <b>${db('STY')}</b></span><span>Skadebonus SMI <b>${db('SMI')}</b></span><span>Grundchans brukes for ferdigheter du ikke er tränad i (fylt rute = tränad).</span></div>
    <div class="cols3">
      <div><h3>Färdigheter</h3><div class="sks">${gen}</div></div>
      <div><h3>Vapenfärdigheter</h3><div class="sks">${vap}</div>${sek ? `<h3>Sekundära</h3><div class="sks">${sek}</div>` : ''}
        <p class="hint">Fylt rute er markert og kan forbedres ved vila.</p></div>
      <div><h3>Släktesförmåga</h3>${kinA}<h3>Hjälteförmågor</h3>${heroic}${spells ? `<h3>Besvärjelser</h3>${spells}` : ''}${tricks ? `<h3>Trolleritrick</h3>${tricks}` : ''}${boons}${inj}</div>
    </div>
    ${eq ? `<h3>Utrustning</h3><div class="eq eq-grid">${eq}</div>` : ''}
    <div class="sh-foot"><div><span>Övrigt</span>${gear || 'Ingenting'}</div>${back}</div>`;
}
void baseChance;
void SKILL;
