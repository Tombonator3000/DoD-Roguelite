// Samtaler som i Ultima: skriv et ord eller klikk på et du har lært.
// Ord i [klammer] i svarene blir nye nøkkelord. Bare de fire første bokstavene teller,
// slik det var i Ultima IV.
import { G } from './state.js';
import { DUNNO } from './townpeople.js';

const $ = s => document.querySelector(s);
const BASE = ['NAVN', 'JOBB', 'FARVEL'];
const ALIAS = {
  NAME: 'NAVN', HETER: 'NAVN', JOB: 'JOBB', ARBEID: 'JOBB', YRKE: 'JOBB', BYE: 'FARVEL', HADET: 'FARVEL', 'HA DET': 'FARVEL', ADJØ: 'FARVEL',
  KJØPE: 'HANDEL', KJØP: 'HANDEL', SELGE: 'HANDEL', SELG: 'HANDEL', SALG: 'HANDEL', SELL: 'HANDEL', BUY: 'HANDEL', TRADE: 'HANDEL', VARER: 'HANDEL',
  REV: 'REVEN', RØDPELS: 'REVEN', ROTTE: 'ROTTER', SAFFRAN: 'SAFRAN',
};

export function normWord(w) {
  return String(w || '').toUpperCase().replace(/[^A-ZÆØÅÄÖÜÉ\- ]/g, '').replace(/\s+/g, ' ').trim();
}

export function knownWords() {
  if (!G.meta.words) G.meta.words = [];
  return G.meta.words;
}

export class Talk {
  constructor(life) {
    this.life = life;
    this.npc = null;
    this.def = null;
    const inp = $('#dlg-input');
    const go = () => {
      const w = inp.value;
      inp.value = '';
      if (w.trim()) this.ask(w, true);
    };
    $('#dlg-askbtn').onclick = go;
    inp.onkeydown = e => {
      e.stopPropagation();
      if (e.key === 'Enter') { e.preventDefault(); go(); }
      if (e.key === 'Escape') { e.preventDefault(); inp.blur(); this.close(); }
    };
    $('#dlg-text').onclick = e => {
      const k = e.target.closest('[data-k]');
      if (k) this.ask(k.dataset.k);
    };
  }

  ctx() {
    const P = G.player;
    const h = ((G.run.clock % 24) + 24) % 24;
    return { P, run: G.run, life: this.life, npc: this.npc, hour: h, night: h >= 21 || h < 6, isNebb: P.isNebb, bg: P.sheet.aidne ?? null, rykte: G.run.rykte || 0 };
  }

  open(npc, opts = {}) {
    this.npc = npc;
    this.def = npc.def || npc;
    if (npc.talking !== undefined) npc.talking = true;
    G.state = 'dialog';
    G.audio.ui();
    this.wareMode = null;
    this.closing = false;
    const def = this.def;
    $('#dlg-wares').hidden = true;
    $('#dlg-wares').innerHTML = '';
    $('#dlg-ask').hidden = !!def.board;
    $('#dlg-look').textContent = def.look || '';
    $('#dlg-look').hidden = !def.look;
    this.renderWho();
    const c = this.ctx();
    let text = opts.text || (typeof def.greet === 'function' ? def.greet(c) : def.greet) || '';
    if (def.board) text = text + ' ' + def.start.map(k => `[${k.toLowerCase()}|${k}]`).join(', ') + '.';
    this.say(text, true);
    this.renderKeywords(opts.extra);
    G.ui.show('dialog');
    if (!G.touch) setTimeout(() => { if (this.npc === npc && !def.board) $('#dlg-input').focus({ preventScroll: true }); }, 30);
  }

  renderWho() {
    const def = this.def;
    const met = def.board || G.meta.met?.[def.id];
    const who = $('#dlg-who');
    if (met) who.innerHTML = `${def.name} <span>${def.title}</span>`;
    else who.innerHTML = `${cap(def.short)} <span>du vet ikke navnet ennå</span>`;
  }

  // Tekst med [ord] eller [vist|NØKKEL]. Nye ord læres og lagres.
  say(text, keepLook = false) {
    if (!keepLook) $('#dlg-look').hidden = true;
    const words = knownWords();
    let learned = false;
    const html = esc(text).replace(/\[([^\]|]+)(?:\|([^\]]+))?\]/g, (m, shown, key) => {
      const k = normWord(key || shown);
      if (!words.includes(k) && !BASE.includes(k)) { words.push(k); learned = true; }
      return `<b class="kwl" data-k="${k}">${shown}</b>`;
    });
    const el = $('#dlg-text');
    el.innerHTML = html;
    el.classList.remove('fresh');
    void el.offsetWidth;
    el.classList.add('fresh');
    if (learned) { G.game.persist(); if (this.def) this.renderKeywords(); }
  }

  topicKeys() {
    const def = this.def;
    const words = knownWords();
    const keys = Object.keys(def.topics || {}).filter(k => !BASE.includes(k));
    const vis = keys.filter(k => {
      const v = def.topics[k];
      return (v && typeof v === 'object' && v.always) || words.includes(k) || (def.board && def.start.includes(k));
    });
    return vis;
  }

  renderKeywords(extra) {
    const kw = $('#dlg-kw');
    kw.innerHTML = '';
    const def = this.def;
    const list = def.board ? [...this.topicKeys(), 'FARVEL'] : ['NAVN', 'JOBB', ...this.topicKeys(), 'FARVEL'];
    for (const w of [...list, ...(extra || [])]) {
      const b = document.createElement('button');
      b.className = 'kw';
      const v = def.topics?.[w];
      if (v && typeof v === 'object' && v.act) b.classList.add('svc');
      b.textContent = w;
      b.onclick = () => this.ask(w);
      kw.appendChild(b);
    }
  }

  match(raw) {
    let w = normWord(raw);
    if (!w) return null;
    const def = this.def;
    const keys = Object.keys(def.topics || {});
    if (def.board) keys.push('FARVEL');
    else keys.push(...BASE);
    if (ALIAS[w] && !keys.includes(w) && !(w.startsWith('SEL') && keys.includes('SELGE'))) w = ALIAS[w];
    if (w.startsWith('SEL') && keys.includes('SELGE')) return 'SELGE';
    if (keys.includes(w)) return w;
    if (w.length < 3) return null;
    const pre = w.slice(0, 4);
    const cand = keys.filter(k => k.slice(0, Math.min(4, pre.length)) === pre.slice(0, Math.min(4, k.length)));
    if (cand.length) return cand.sort((a, b) => a.length - b.length)[0];
    // ord i flere deler: prøv hvert ord
    for (const part of w.split(' ')) if (part !== w && part.length >= 3) { const m = this.match(part); if (m) return m; }
    return null;
  }

  ask(raw, typed = false) {
    if (!this.def || this.closing) return;
    const def = this.def;
    const c = this.ctx();
    const key = this.match(raw);
    G.audio.menuTick?.(64 + Math.floor(Math.random() * 6));
    if (!key) {
      const dn = def.dunno || DUNNO;
      this.say(dn[Math.floor(Math.random() * dn.length)]);
      return;
    }
    if (key === 'FARVEL') {
      const v = def.topics?.FARVEL;
      this.say(typeof v === 'function' ? v(c) : v || 'Farvel.');
      if (def.forced) return;
      this.closing = true;
      setTimeout(() => this.close(), 850);
      return;
    }
    if (key === 'NAVN' && !def.board) {
      if (!G.meta.met) G.meta.met = {};
      if (!G.meta.met[def.id]) { G.meta.met[def.id] = true; G.game.persist(); }
      this.renderWho();
    }
    let v = def.topics?.[key];
    if (typeof v === 'function') v = v(c);
    if (v == null) v = key === 'JOBB' ? 'Jeg gjør det jeg gjør.' : key === 'NAVN' ? def.name : null;
    if (v && typeof v === 'object') {
      if (v.say) this.say(v.say);
      if (v.act) this.life.service(v.act, this, this.npc);
    } else if (v) this.say(v);
    if (typed && !BASE.includes(key)) {
      const words = knownWords();
      if (!words.includes(key)) { words.push(key); G.game.persist(); }
    }
    this.renderKeywords();
  }

  // --- varer og tjenester ------------------------------------------------------------
  wares(rows, o = {}) {
    const el = $('#dlg-wares');
    el.hidden = false;
    el.innerHTML = '';
    const P = G.player;
    const cur = o.currency || 'silver';
    const have = cur === 'fjær' ? G.meta.feathers : P.silver;
    const head = document.createElement('div');
    head.className = 'purse';
    head.innerHTML = `Du har <b>${have}</b> ${cur}${o.note ? ` <span>(${o.note})</span>` : ''}`;
    el.appendChild(head);
    for (const r of rows) {
      if (r.hidden) continue;
      const row = document.createElement('div');
      row.className = 'ware';
      const price = r.price ?? 0;
      const off = r.disabled || have < price;
      row.innerHTML = `<div class="txt"><div class="nm" style="color:${r.color || 'var(--parch)'}">${r.name}</div><div class="ds">${r.desc || ''}</div></div><button class="btn small" ${off ? 'disabled' : ''}>${r.label || (price ? `${price} ${cur}` : 'Gratis')}</button>`;
      row.querySelector('button').onclick = () => {
        const now = cur === 'fjær' ? G.meta.feathers : P.silver;
        if (now < price || r.disabled) return;
        if (cur === 'fjær') G.meta.feathers -= price; else P.silver -= price;
        if (price) G.audio.coin();
        const t = r.buy();
        if (t) this.say(t);
        if (cur === 'fjær') G.game.persist();
        if (o.refresh) o.refresh(); else this.wares(rows, o);
      };
      el.appendChild(row);
    }
    if (o.barter) {
      const b = document.createElement('button');
      b.className = 'btn small barter';
      b.textContent = 'Köpslå om prisene';
      b.onclick = () => o.barter();
      el.appendChild(b);
    }
  }

  close(force = false) {
    if (this.def?.forced && !force) { this.say(this.def.topics?.FARVEL || 'Du må velge først.'); return; }
    if (G.state !== 'dialog') { this.npc = null; return; }
    document.activeElement?.blur?.();
    if (this.npc && this.npc.talking !== undefined) this.npc.talking = false;
    this.npc = null;
    this.def = null;
    this.closing = false;
    G.ui.hideScreens();
    G.state = 'play';
    G.ui.buildBar();
  }
}

function esc(s) {
  return String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
}
function cap(s) {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}
