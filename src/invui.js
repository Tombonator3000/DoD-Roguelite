// Inventarskjermen: rollperson i nærbilde til venstre, packning til høyre.
// Dra og slipp mellom sekk, kropp, belte og bakken. Dobbeltklikk gjør det vanligste.
import { G } from './state.js';
import { GEAR } from './dod.js';
import { RARITY } from './loot.js';
import { diceAvg } from './rules.js';
import { capKg, hardCapKg, carriedKg, kgOf, isGear, stackKey, equipFromBag, unequip, dropEntry, useEntry, removeFromBag, addToBag, refreshAfterEquip, makeCons, canCarry } from './inventory.js';
import { LOC_NAME } from './dod.js';

const $ = s => document.querySelector(s);
const SLOTS = [
  { slot: 'hjalm', name: 'Hjelm', area: 'h' },
  { slot: 'amulett', name: 'Amulett', area: 'a' },
  { slot: 'vapen', name: 'Hovedhånd', area: 'w' },
  { slot: 'rustning', name: 'Rustning', area: 'r' },
  { slot: 'vapen2', name: 'Andre hånd', area: 'o' },
  { slot: 'armar', name: 'Armskydd', area: 'm' },
  { slot: 'ben', name: 'Benskydd', area: 'l' },
];
const SLOT_NAME = { vapen: 'våpen', vapen2: 'skjold', rustning: 'rustning', hjalm: 'hjälm', amulett: 'amulett', armar: 'armskydd', ben: 'benskydd' };
const KIND_NAME = { val: 'Verdisak', cons: 'Mat og drikk' };
const fmtKg = v => String(Math.round(v * 10) / 10).replace('.', ',');
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function canEquip(e, slot) {
  if (!isGear(e)) return false;
  if (slot === 'vapen') return (e.slot === 'vapen' || e.slot === 'vapen2') && !e.shield;
  if (slot === 'vapen2') return e.slot === 'vapen' || e.slot === 'vapen2';
  return e.slot === slot;
}

export class InvUI {
  constructor() {
    this.el = $('#inv');
    this.isOpen = false;
    this.sel = null;
    this.drag = null;
    this.lastClick = { key: null, t: 0 };
    $('#inv-close').onclick = () => this.close();
    this.el.addEventListener('pointerdown', e => this.onDown(e));
    addEventListener('pointermove', e => this.onMove(e));
    addEventListener('pointerup', e => this.onUp(e));
    addEventListener('pointercancel', () => this.endDrag());
    this.el.addEventListener('contextmenu', e => e.preventDefault());
    this.spinCanvas = $('#inv-spin');
  }

  open() {
    if ((G.state !== 'play' && G.state !== 'world') || G.player.downed) return;
    this.fromWorld = G.state === 'world';
    G.state = 'inventory';
    this.isOpen = true;
    document.activeElement?.blur?.();
    if (!this.sel) this.sel = null;
    G.ui.show('inv');
    document.body.classList.add('inv-open');
    G.ui.tooltip.hidden = true;
    G.audio.menuSelect?.();
    G.audio.cloth?.();
    this.render();
  }

  close() {
    if (!this.isOpen) return;
    this.endDrag();
    this.isOpen = false;
    G.icons?.setSpin(null, null);
    document.body.classList.remove('inv-open');
    G.ui.hideScreens();
    if (G.state === 'inventory') G.state = 'play';
    G.ui.lastTip = undefined;
    G.ui.buildBar();
    G.audio.menuTick?.(60);
    if (this.fromWorld) { this.fromWorld = false; G.state = 'world'; G.ui.show('world'); G.worldview.refresh(); }
  }

  toggle() { if (this.isOpen) this.close(); else this.open(); }

  // --- tegning ------------------------------------------------------------------------

  refOf(key) {
    const P = G.player;
    if (!key) return null;
    const [k, v] = key.split(':');
    if (k === 'eq') return P.equip[v] ? { kind: 'eq', slot: v, e: P.equip[v], key } : null;
    if (k === 'bag') { const e = P.bag.find(x => x.uid === v); return e ? { kind: 'bag', e, key } : null; }
    if (k === 'belt') return P.potions > +v ? { kind: 'belt', i: +v, e: makeCons('legedrikk'), key } : null;
    return null;
  }

  cell(e, key, extra = '') {
    const r = RARITY[e?.rarity || 'vanlig'];
    const q = e && !isGear(e) && e.qty > 1 ? `<i class="q">${e.qty}</i>` : '';
    const br = e?.broken ? '<i class="br">trasig</i>' : '';
    return `<div class="ic ${e ? 'full' : 'empty'} ${key && this.sel === key ? "sel" : ""} ${extra}" ${e ? `data-drag="${key}"` : ''} data-key="${key || ''}" style="--rc:${r.color}"><div class="img" data-ico="${key}"></div>${q}${br}</div>`;
  }

  render() {
    if (!this.isOpen) return;
    const P = G.player;
    for (const e of P.bag) if (!e.uid) e.uid = 'i' + Math.random().toString(36).slice(2, 9);
    if (this.sel && !this.refOf(this.sel)) this.sel = null;
    const cap = capKg(P), hard = hardCapKg(P), n = P.bag.length;
    const load = carriedKg(P);
    const cells = Math.max(12, Math.ceil((n + 1) / 6) * 6);
    // kropp
    const doll = SLOTS.map(s => {
      const e = P.equip[s.slot];
      return `<div class="slot area-${s.area}" data-drop="eq:${s.slot}">${this.cell(e, 'eq:' + s.slot, 'big')}<div class="sl">${e ? esc(e.name) : s.name}</div></div>`;
    }).join('');
    // belte
    let belt = '';
    for (let i = 0; i < 4; i++) belt += `<div class="bslot" data-drop="belt">${this.cell(i < P.potions ? makeCons('legedrikk') : null, 'belt:' + i, 'round')}</div>`;
    // sekk
    let bag = '';
    for (let i = 0; i < cells; i++) {
      const e = P.bag[i];
      bag += `<div class="bcell" data-drop="bag:${i}">${this.cell(e || null, e ? 'bag:' + e.uid : null)}</div>`;
    }
    const kit = [...P.kit].map(id => `<span class="chip" title="${esc(GEAR[id]?.name || id)}">${esc(GEAR[id]?.name || id)}</span>`).join('');
    const over = P.overloaded;
    this.el.querySelector('.inv-body').innerHTML = `
      <div class="inv-head">
        <div><div class="eyebrow">Packning</div><h2>${esc(P.name)}</h2></div>
        <div class="inv-purse"><b>${P.silver}</b> sm</div>
      </div>
      <div class="inv-grid">
        <div class="col-a">
          <div class="doll">${doll}<div class="doll-fig"></div></div>
          <h3>Beltet <span>${P.potions} av 4 legedrikker</span></h3>
          <div class="belt">${belt}</div>
          <h3>Småsaker <span>teller ikke</span></h3>
          <div class="kit">${kit || '<span class="none">Ingenting</span>'}</div>
        </div>
        <div class="col-b">
          <h3>Sekken <span class="${over ? 'bad' : ''}">${fmtKg(load)} av ${cap} kg</span></h3>
          <div class="cap"><div class="capbar"><i style="width:${Math.min(100, (load / cap) * 100)}%"></i>${load > cap ? `<b style="width:${Math.min(100, ((load - cap) / cap) * 100)}%"></b>` : ''}</div>
            <div class="capnote">Bärförmåga ${cap} kg, like mye som STY (Bok II s. 5). Det du har på deg og i hendene teller ikke. Høyst ${hard} kg.</div></div>
          ${over ? '<div class="overwarn">Överlastad: du går tregere og har -5 på Smyga, Akrobatik, Hoppa og Klättra.</div>' : ''}
          <div class="bag">${bag}</div>
          <div class="drop" data-drop="ground">Slipp på bakken</div>
          <div class="detail" id="inv-detail"></div>
        </div>
      </div>
      <div class="inv-hint">Dra for å flytte. Dobbeltklikk tar på, bruker eller tar av. <kbd>I</kbd> eller <kbd>Esc</kbd> lukker.</div>`;
    // ikoner
    for (const el of this.el.querySelectorAll('[data-ico]')) {
      const ref = this.refOf(el.dataset.ico);
      if (ref) G.icons?.fill(el, ref.e, ref.kind === 'eq' && (ref.slot === 'vapen' || ref.slot === 'vapen2'));
    }
    this.renderDetail();
  }

  renderDetail() {
    const box = $('#inv-detail');
    if (!box) return;
    const ref = this.refOf(this.sel);
    if (!ref) {
      box.innerHTML = '<div class="dempty">Velg noe for å se det nærmere.</div>';
      G.icons?.setSpin(null, null);
      return;
    }
    const P = G.player;
    const e = ref.e;
    const r = RARITY[e.rarity || 'vanlig'];
    let kind, lines = [], flavor = e.flavor || '';
    if (isGear(e)) {
      kind = `${r.name} ${SLOT_NAME[e.slot] || ''}`;
      lines = e.lines || [];
    } else {
      kind = e.type === 'val' ? 'Verdisak' : KIND_NAME[e.type] || '';
      lines = [e.desc];
    }
    const cmp = ref.kind === 'bag' && isGear(e) ? this.compare(e) : '';
    const acts = this.actions(ref).map((a, i) => `<button class="btn small ${i === 0 ? 'primary' : ''}" data-act="${i}">${a.label}</button>`).join('');
    const value = isGear(e) ? e.value : e.value * (e.qty || 1);
    box.innerHTML = `
      <div class="dtop"><canvas id="inv-spin" width="160" height="160"></canvas>
        <div class="dtxt"><div class="nm" style="color:${r.color}">${esc(e.name)}${!isGear(e) && e.qty > 1 ? ` <span>x${e.qty}</span>` : ''}</div>
        <div class="rar">${esc(kind)}${ref.kind === 'eq' ? ' <em>har på</em>' : ref.kind === 'belt' ? ' <em>i beltet</em>' : ''}</div>
        ${lines.map(l => `<div class="ln">${esc(l)}</div>`).join('')}
        ${flavor ? `<div class="fl">${esc(flavor)}</div>` : ''}
        <div class="val">Verdi omtrent ${value} sm${!isGear(e) ? ` · ${fmtKg(kgOf(e))} kg` : ''}</div></div></div>
      ${cmp}
      <div class="acts">${acts}</div>`;
    const list = this.actions(ref);
    box.querySelectorAll('[data-act]').forEach(b => { b.onclick = () => { list[+b.dataset.act].fn(); this.after(); }; });
    G.icons?.setSpin(box.querySelector('#inv-spin'), e);
    void P;
  }

  compare(e) {
    const P = G.player;
    const slot = e.slot === 'vapen2' || e.shield ? 'vapen2' : e.slot;
    const cur = P.equip[slot];
    if (!cur) return `<div class="cmp"><div class="ch">Mot det du har</div><div class="cl up">Plassen er ledig</div></div>`;
    const rows = [];
    if (e.covers && !e.shield && cur.covers) {
      const ea = e.abs + (e.mods?.skydd || 0), ca = cur.abs + (cur.mods?.skydd || 0);
      rows.push(`<div class="cl ${ea > ca ? 'up' : ea < ca ? 'down' : ''}">Absorbering ${ea} mot ${ca}</div>`);
      const more = e.covers.filter(c => !cur.covers.includes(c)), less = cur.covers.filter(c => !e.covers.includes(c));
      if (more.length) rows.push(`<div class="cl up">Dekker også ${more.map(c => LOC_NAME[c].toLowerCase()).join(', ')}</div>`);
      if (less.length) rows.push(`<div class="cl down">Dekker ikke ${less.map(c => LOC_NAME[c].toLowerCase()).join(', ')}</div>`);
      if (e.metal && !cur.metal) rows.push('<div class="cl down">Metall: ingen magi</div>');
      if (e.clank && !cur.clank) rows.push('<div class="cl down">Klirrer: halv CL på Smyga og Klättra</div>');
    }
    if (e.dmg && cur.dmg && !e.shield) {
      const a = diceAvg(e.dmg) + (e.mods?.dmg || 0) + (e.mods?.forh || 0), b = diceAvg(cur.dmg) + (cur.mods?.dmg || 0) + (cur.mods?.forh || 0);
      rows.push(`<div class="cl ${a > b ? 'up' : a < b ? 'down' : ''}">Snittskade ${a.toFixed(1)} mot ${b.toFixed(1)}</div>`);
      const g = P.gripOf?.(e);
      if (g === 0) rows.push(`<div class="cl down">For tungt: krever STY ${e.str}, du har ${P.attrs.STY}</div>`);
      else if (g === 2 && !e.ranged && !e.twoOnly) rows.push(`<div class="cl down">Krever STY ${e.str}: du må bruke begge hender</div>`);
      const fe = P.fvFor?.(e), fc = P.fvFor?.(cur);
      if (fe != null && fc != null && fe !== fc) rows.push(`<div class="cl ${fe > fc ? 'up' : 'down'}">FV ${fe} mot ${fc}</div>`);
    }
    if (e.shield && cur.shield) rows.push(`<div class="cl ${e.dur > cur.dur ? 'up' : e.dur < cur.dur ? 'down' : ''}">BV ${e.dur} mot ${cur.dur}</div>`);
    const ml = Object.keys(e.mods || {}).length, cl = Object.keys(cur.mods || {}).length;
    if (ml !== cl) rows.push(`<div class="cl ${ml > cl ? 'up' : 'down'}">${ml > cl ? 'Flere' : 'Færre'} egenskaper</div>`);
    return `<div class="cmp"><div class="ch">Mot ${esc(cur.name)}</div>${rows.join('') || '<div class="cl">Omtrent like</div>'}</div>`;
  }

  actions(ref) {
    const P = G.player;
    const e = ref.e;
    const out = [];
    if (ref.kind === 'bag') {
      if (isGear(e)) {
        if (e.shield) out.push({ label: 'Ta på', fn: () => equipFromBag(P, e, 'vapen2') });
        else if (e.slot === 'vapen' || e.slot === 'vapen2') {
          out.push({ label: 'Ta i hånda', fn: () => equipFromBag(P, e, 'vapen') });
          out.push({ label: 'Andre hånd', fn: () => equipFromBag(P, e, 'vapen2') });
        } else out.push({ label: 'Ta på', fn: () => equipFromBag(P, e) });
      } else if (e.type === 'cons') {
        if (e.cid === 'legedrikk') {
          out.push({ label: 'Drikk', fn: () => this.say(useEntry(P, e)) });
          if (P.potions < 4) out.push({ label: 'Til beltet', fn: () => { removeFromBag(P, e, 1); P.potions++; P.recalc(); } });
        } else if (!e.junk && e.cid !== 'safran') out.push({ label: e.icon === 'potionvp' ? 'Drikk' : 'Spis', fn: () => this.say(useEntry(P, e)) });
      }
      out.push({ label: 'Slipp', fn: () => { dropEntry(P, e); this.sel = null; } });
    } else if (ref.kind === 'eq') {
      out.push({ label: 'Ta av', fn: () => { if (!unequip(P, ref.slot)) this.say('Sekken er full.'); } });
      if (ref.slot === 'vapen' || ref.slot === 'vapen2') out.push({ label: 'Bytt hånd', fn: () => this.swapHands() });
      out.push({ label: 'Slipp', fn: () => { dropEntry(P, null, ref.slot); this.sel = null; } });
    } else if (ref.kind === 'belt') {
      out.push({ label: 'Drikk', fn: () => { G.state = 'play'; P.cd.potion = 0; P.drinkPotion(); G.state = 'inventory'; } });
      out.push({ label: 'Til sekken', fn: () => { if (!canCarry(P, makeCons('legedrikk'))) return this.say('Sekken er full.'); P.potions--; addToBag(P, makeCons('legedrikk'), true); } });
    }
    return out;
  }

  say(t) {
    if (!t) return;
    const el = this.el.querySelector('.inv-say');
    el.textContent = t;
    el.classList.remove('on');
    void el.offsetWidth;
    el.classList.add('on');
  }

  swapHands() {
    const P = G.player;
    const a = P.equip.vapen, b = P.equip.vapen2;
    if (b?.shield) { this.say('Skjoldet hører hjemme i den andre hånda.'); return; }
    P.equip.vapen = b;
    P.equip.vapen2 = a;
    refreshAfterEquip(P, 'vapen');
    G.audio.swing?.(1.6, 0.15);
  }

  after() {
    G.ui.buildBar();
    this.render();
  }

  // Standardhandling ved dobbeltklikk
  quick(key) {
    const ref = this.refOf(key);
    if (!ref) return;
    const a = this.actions(ref)[0];
    if (a && a.label !== 'Slipp') { a.fn(); this.after(); }
  }

  // --- dra og slipp ------------------------------------------------------------------

  onDown(ev) {
    const src = ev.target.closest('[data-drag], [data-key]');
    if (!src || ev.button > 0) return;
    const key = src.dataset.drag || null;
    if (!key) return;
    ev.preventDefault();
    this.drag = { key, x: ev.clientX, y: ev.clientY, on: false, src };
  }

  onMove(ev) {
    const d = this.drag;
    if (!d) return;
    if (!d.on && Math.hypot(ev.clientX - d.x, ev.clientY - d.y) > 7) {
      d.on = true;
      const ref = this.refOf(d.key);
      if (!ref) { this.drag = null; return; }
      d.ref = ref;
      const g = (d.ghost = document.createElement('div'));
      g.className = 'inv-ghost';
      const img = d.src.querySelector('.img');
      if (img) g.style.backgroundImage = img.style.backgroundImage;
      document.body.appendChild(g);
      d.src.classList.add('lift');
      // vis hvor den kan ligge
      for (const t of this.el.querySelectorAll('[data-drop]')) if (this.canDrop(ref, t.dataset.drop)) t.classList.add('can');
      G.audio.menuTick?.(58);
    }
    if (d.on) {
      d.ghost.style.transform = `translate(${ev.clientX}px, ${ev.clientY}px) translate(-50%, -55%) rotate(-6deg)`;
      const t = document.elementFromPoint(ev.clientX, ev.clientY)?.closest('[data-drop]');
      for (const h of this.el.querySelectorAll('.hover')) if (h !== t) h.classList.remove('hover');
      if (t && t.classList.contains('can')) t.classList.add('hover');
    }
  }

  onUp(ev) {
    const d = this.drag;
    if (!d) return;
    if (!d.on) {
      // klikk
      const now = performance.now();
      if (this.lastClick.key === d.key && now - this.lastClick.t < 340) { this.lastClick.key = null; this.drag = null; this.quick(d.key); return; }
      this.lastClick = { key: d.key, t: now };
      this.sel = d.key;
      this.drag = null;
      G.audio.menuTick?.(64);
      this.render();
      return;
    }
    const t = document.elementFromPoint(ev.clientX, ev.clientY)?.closest('[data-drop]');
    const target = t?.dataset.drop;
    const ref = d.ref;
    this.endDrag();
    if (target && this.canDrop(ref, target)) {
      this.doDrop(ref, target);
      this.after();
    }
  }

  endDrag() {
    const d = this.drag;
    if (!d) return;
    d.ghost?.remove();
    d.src?.classList.remove('lift');
    for (const t of this.el.querySelectorAll('.can, .hover')) t.classList.remove('can', 'hover');
    this.drag = null;
  }

  canDrop(ref, target) {
    const [k, v] = target.split(':');
    const e = ref.e;
    if (k === 'ground') return true;
    if (k === 'eq') {
      if (ref.kind === 'eq') return (ref.slot === 'vapen' && v === 'vapen2' && !G.player.equip.vapen2?.shield) || (ref.slot === 'vapen2' && v === 'vapen' && !e.shield);
      return ref.kind === 'bag' && canEquip(e, v);
    }
    if (k === 'bag') {
      if (ref.kind === 'bag') return true;
      return true;
    }
    if (k === 'belt') return ref.kind === 'bag' && e.cid === 'legedrikk' && G.player.potions < 4;
    return false;
  }

  doDrop(ref, target) {
    const P = G.player;
    const [k, v] = target.split(':');
    const e = ref.e;
    if (k === 'ground') {
      if (ref.kind === 'bag') dropEntry(P, e);
      else if (ref.kind === 'eq') dropEntry(P, null, ref.slot);
      else if (ref.kind === 'belt') { P.potions--; const x = makeCons('legedrikk'); P.bag.push(x); dropEntry(P, x); }
      this.sel = null;
      return;
    }
    if (k === 'eq') {
      if (ref.kind === 'eq') this.swapHands();
      else equipFromBag(P, e, v);
      this.sel = 'eq:' + v;
      return;
    }
    if (k === 'bag') {
      if (ref.kind === 'bag') {
        const i = P.bag.indexOf(e);
        const j = Math.min(P.bag.length - 1, +v);
        if (i >= 0 && i !== j) { P.bag.splice(i, 1); P.bag.splice(j, 0, e); }
      } else if (ref.kind === 'eq') { if (!unequip(P, ref.slot)) this.say('Sekken er full.'); }
      else if (ref.kind === 'belt') { if (canCarry(P, makeCons('legedrikk'))) { P.potions--; addToBag(P, makeCons('legedrikk'), true); } else this.say('Sekken er full.'); }
      return;
    }
    if (k === 'belt') { removeFromBag(P, e, 1); P.potions++; }
  }
}

void stackKey;
