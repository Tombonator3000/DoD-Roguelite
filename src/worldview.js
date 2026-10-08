// Verdenskartet på skjermen: tegningen, lista over steder, reisen rute for rute og møtene underveis.
// Tegnes med canvas i blekk og pergament. Kartet er vårt eget, tegnet fra rutenettet i worldmap.js.
import { G } from './state.js';
import { WW, WH, TERRAIN, PLACES, ROADS, RIVERS } from './worldmap.js';
import {
  W, look, known, findPath, pathHours, stepHours, roadAt, terrainAt, regionAt, placeAt, passable, seenAt,
  rollEncounter, tickHunger, hungerLevel, countFood, forage, campHours, ate, placeList,
} from './worldtravel.js';

const $ = s => document.querySelector(s);
const TERR_NAME = { '.': 'slette', F: 'skog', '^': 'fjell', '~': 'hav', o: 'innsjø' };
const hhmm = c => { const h = ((c % 24) + 24) % 24; return `${String(Math.floor(h)).padStart(2, '0')}.${String(Math.floor((h % 1) * 6) * 10).padStart(2, '0')}`; };
const dayOf = c => Math.floor(c / 24) + 1;
const fmtH = h => (h < 1 ? `${Math.round(h * 60)} minutter` : `${Math.round(h * 10) / 10} time${Math.round(h * 10) / 10 === 1 ? '' : 'r'}`.replace('.', ','));

function rng(seed) { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; }

export class WorldView {
  constructor() {
    this.cv = $('#world-map');
    this.ctx = this.cv.getContext('2d');
    this.sel = null;
    this.hover = null;
    this.moving = null;
    this.cv.addEventListener('click', e => this.click(e));
    this.cv.addEventListener('mousemove', e => this.move(e));
    this.cv.addEventListener('mouseleave', () => { this.hover = null; this.draw(); });
    $('#btn-w-go').onclick = () => this.go();
    $('#btn-w-enter').onclick = () => this.enter();
    $('#btn-w-camp').onclick = () => this.camp();
    $('#btn-w-forage').onclick = () => this.forageHere();
    addEventListener('resize', () => { if (!$('#world').hidden) { this.bg = null; this.draw(); } });
    // HUD-loggen ligger under kartet, så linjene vises her også
    G.ui.mirror = $('#w-log');
  }

  get isOpen() { return !$('#world').hidden; }

  // o.resume: fortsett ruta etter et møte
  open(o = {}) {
    const w = W();
    G.state = 'world';
    G.ui.show('world');
    $('#w-enc').hidden = true;
    look(w.x, w.y);
    tickHunger();
    this.sel = null;
    if (w.route?.length > 1) this.sel = w.route[w.route.length - 1];
    this.bg = null;
    this.refresh();
    G.audio.ui();
    if (o.note) G.ui.log(o.note);
  }

  close() {
    this.moving = null;
    G.ui.hideScreens();
  }

  // --- tegning ----------------------------------------------------------------------------------
  size() {
    const box = this.cv.parentElement.getBoundingClientRect();
    const Wd = Math.max(300, Math.floor(box.width));
    const Hd = Math.floor(Wd * WH / WW);
    if (this.cv.width !== Wd || this.cv.height !== Hd) { this.cv.width = Wd; this.cv.height = Hd; this.bg = null; }
    return { Wd, Hd, c: Wd / WW };
  }

  // Landskapet tegnes én gang per størrelse: farger, trær, fjell, kystlinje, elver og veier
  paintBackground(Wd, Hd, c) {
    const off = document.createElement('canvas');
    off.width = Wd; off.height = Hd;
    const g = off.getContext('2d');
    const col = { '~': '#9db0b0', '.': '#cfc59e', F: '#8f9a6c', '^': '#b4a78a', o: '#a3b8bd' };
    for (let y = 0; y < WH; y++) for (let x = 0; x < WW; x++) {
      g.fillStyle = col[TERRAIN[y][x]] || '#cfc59e';
      g.fillRect(Math.floor(x * c), Math.floor(y * c), Math.ceil(c) + 1, Math.ceil(c) + 1);
    }
    const R = rng(7);
    // bølger, gress, trær og fjell
    for (let y = 0; y < WH; y++) for (let x = 0; x < WW; x++) {
      const t = TERRAIN[y][x], X = x * c, Y = y * c;
      if (t === '~' && R() < 0.35) {
        g.strokeStyle = 'rgba(60,90,100,0.35)'; g.lineWidth = Math.max(1, c * 0.05);
        g.beginPath(); const wx = X + c * (0.2 + R() * 0.5), wy = Y + c * (0.3 + R() * 0.4);
        g.moveTo(wx, wy); g.quadraticCurveTo(wx + c * 0.12, wy - c * 0.1, wx + c * 0.24, wy); g.quadraticCurveTo(wx + c * 0.36, wy + c * 0.1, wx + c * 0.48, wy); g.stroke();
      } else if (t === '.') {
        g.fillStyle = 'rgba(110,100,60,0.35)';
        for (let i = 0; i < 3; i++) g.fillRect(X + R() * c, Y + R() * c, Math.max(1, c * 0.05), Math.max(1, c * 0.12));
      } else if (t === 'F') {
        for (let i = 0; i < 3; i++) {
          const tx = X + c * (0.15 + R() * 0.7), ty = Y + c * (0.25 + R() * 0.6), r = c * (0.17 + R() * 0.08);
          g.fillStyle = R() < 0.5 ? '#4f6238' : '#5b6e40';
          g.beginPath(); g.moveTo(tx, ty - r * 1.6); g.lineTo(tx - r, ty + r * 0.4); g.lineTo(tx + r, ty + r * 0.4); g.closePath(); g.fill();
          g.fillStyle = '#3a2a1a'; g.fillRect(tx - c * 0.02, ty + r * 0.4, c * 0.04, c * 0.08);
        }
      } else if (t === '^') {
        const px = X + c * (0.2 + R() * 0.2), py = Y + c * 0.8, w = c * (0.55 + R() * 0.2), h = c * (0.55 + R() * 0.25);
        g.fillStyle = '#8c7e66';
        g.beginPath(); g.moveTo(px, py); g.lineTo(px + w / 2, py - h); g.lineTo(px + w, py); g.closePath(); g.fill();
        g.fillStyle = '#e8e2d2';
        g.beginPath(); g.moveTo(px + w / 2, py - h); g.lineTo(px + w * 0.38, py - h * 0.72); g.lineTo(px + w * 0.62, py - h * 0.72); g.closePath(); g.fill();
        g.strokeStyle = 'rgba(50,36,24,0.55)'; g.lineWidth = Math.max(1, c * 0.04);
        g.beginPath(); g.moveTo(px, py); g.lineTo(px + w / 2, py - h); g.lineTo(px + w, py); g.stroke();
      }
    }
    // kystlinje: blekk der land møter vann
    g.strokeStyle = 'rgba(48,34,22,0.75)'; g.lineWidth = Math.max(1, c * 0.07);
    const wet = (x, y) => x < 0 || y < 0 || x >= WW || y >= WH ? null : '~o'.includes(TERRAIN[y][x]);
    g.beginPath();
    for (let y = 0; y < WH; y++) for (let x = 0; x < WW; x++) {
      if (wet(x, y)) continue;
      const X = x * c, Y = y * c;
      if (wet(x, y - 1)) { g.moveTo(X, Y); g.lineTo(X + c, Y); }
      if (wet(x, y + 1)) { g.moveTo(X, Y + c); g.lineTo(X + c, Y + c); }
      if (wet(x - 1, y)) { g.moveTo(X, Y); g.lineTo(X, Y + c); }
      if (wet(x + 1, y)) { g.moveTo(X + c, Y); g.lineTo(X + c, Y + c); }
    }
    g.stroke();
    // elver
    g.strokeStyle = 'rgba(70,110,130,0.8)'; g.lineWidth = Math.max(1.5, c * 0.1); g.lineCap = 'round';
    for (const r of RIVERS) { g.beginPath(); r.forEach(([x, y], i) => { const X = (x + 0.5) * c, Y = (y + 0.5) * c; if (i) g.lineTo(X, Y); else g.moveTo(X, Y); }); g.stroke(); }
    // veier
    for (const r of ROADS) {
      g.strokeStyle = r.kind === 'vei' ? 'rgba(92,58,30,0.9)' : 'rgba(92,58,30,0.7)';
      g.lineWidth = Math.max(1.5, c * (r.kind === 'vei' ? 0.13 : 0.08));
      g.setLineDash(r.kind === 'sti' ? [c * 0.25, c * 0.18] : []);
      g.beginPath(); r.pts.forEach(([x, y], i) => { const X = (x + 0.5) * c, Y = (y + 0.5) * c; if (i) g.lineTo(X, Y); else g.moveTo(X, Y); }); g.stroke();
    }
    g.setLineDash([]);
    // landskapsnavn
    g.fillStyle = 'rgba(60,40,24,0.55)'; g.textAlign = 'center';
    g.font = `italic ${Math.max(10, Math.round(c * 0.75))}px Alegreya, Georgia, serif`;
    for (const [t, x, y] of [['Drakdjupet', 35.5, 19], ['Sjunkna sjön', 22, 22.5], ['Aidnebergen', 15, 11.6], ['Vorgabergen', 33, 3.2], ['Nidabergen', 44, 6], ['Goiana', 19, 6.4], ['Torilskogen', 17.5, 17.8], ['Indar', 29.5, 19.6], ['Tolan', 44, 23], ['Kardunien', 6, 21], ['Valbukten', 2.5, 10.5]]) g.fillText(t, x * c, y * c);
    this.bg = off;
  }

  draw() {
    const { Wd, Hd, c } = this.size();
    if (!this.bg) this.paintBackground(Wd, Hd, c);
    const g = this.ctx, w = W();
    g.drawImage(this.bg, 0, 0);
    // Land du ikke har sett, er blankt pergament, som på et kart som ikke er ferdig tegnet.
    // Tåken lages i kartets egen oppløsning og skaleres opp med utjevning, så kantene blir myke.
    if (!this.fogC) { this.fogC = document.createElement('canvas'); this.fogC.width = WW; this.fogC.height = WH; }
    const fc = this.fogC.getContext('2d');
    const img = fc.createImageData(WW, WH);
    for (let i = 0; i < WW * WH; i++) {
      const s = w.seen[i];
      const n = ((i * 2654435761) >>> 0) % 9 - 4; // litt flekket, som gammelt papir
      img.data[i * 4] = 226 + n; img.data[i * 4 + 1] = 212 + n; img.data[i * 4 + 2] = 178 + n;
      img.data[i * 4 + 3] = s === 2 ? 0 : s === 1 ? 30 : 251;
    }
    fc.putImageData(img, 0, 0);
    g.imageSmoothingEnabled = true;
    g.drawImage(this.fogC, 0, 0, Wd, Hd);
    // ruta
    const path = this.moving?.path || this.preview;
    if (path && path.length > 1) {
      g.strokeStyle = '#9a1c16'; g.lineWidth = Math.max(2, c * 0.14); g.setLineDash([c * 0.3, c * 0.2]);
      g.beginPath();
      const from = this.moving ? this.moving.i : 0;
      path.slice(from).forEach(([x, y], i) => { const X = (x + 0.5) * c, Y = (y + 0.5) * c; if (i) g.lineTo(X, Y); else g.moveTo(X, Y); });
      g.stroke(); g.setLineDash([]);
      const [ex, ey] = path[path.length - 1];
      g.strokeStyle = '#9a1c16'; g.lineWidth = Math.max(2, c * 0.12);
      const X = (ex + 0.5) * c, Y = (ey + 0.5) * c, r = c * 0.3;
      g.beginPath(); g.moveTo(X - r, Y - r); g.lineTo(X + r, Y + r); g.moveTo(X + r, Y - r); g.lineTo(X - r, Y + r); g.stroke();
    }
    // steder
    for (const [id, p] of Object.entries(PLACES)) {
      if (!known(id)) continue;
      const X = (p.x + 0.5) * c, Y = (p.y + 0.5) * c;
      const r = c * (p.size === 'stor' ? 0.44 : p.size === 'middels' ? 0.35 : 0.27);
      const sel = this.sel && this.sel[0] === p.x && this.sel[1] === p.y;
      g.lineWidth = Math.max(1.5, c * 0.08);
      if (p.kind === 'sted') {
        g.fillStyle = sel ? '#9a1c16' : '#3a2414';
        g.beginPath(); g.moveTo(X, Y - r * 1.2); g.lineTo(X + r, Y); g.lineTo(X, Y + r * 1.2); g.lineTo(X - r, Y); g.closePath(); g.fill();
        g.strokeStyle = '#efe4c6'; g.stroke();
      } else {
        g.fillStyle = sel ? '#9a1c16' : p.kind === 'port' ? '#5a4a3a' : '#3a2414';
        g.beginPath(); g.arc(X, Y, r, 0, Math.PI * 2); g.fill();
        g.strokeStyle = '#efe4c6'; g.stroke();
        if (p.size === 'stor') { g.beginPath(); g.arc(X, Y, r * 0.45, 0, Math.PI * 2); g.strokeStyle = '#efe4c6'; g.stroke(); }
      }
      const fs = Math.max(10, Math.round(c * (p.size === 'stor' ? 0.62 : 0.5)));
      g.font = `${p.size === 'stor' ? 700 : 600} ${fs}px Alegreya, Georgia, serif`;
      g.textAlign = p.x > WW - 6 ? 'right' : 'left';
      const tx = X + (p.x > WW - 6 ? -r - 3 : r + 3), ty = Y + fs * 0.35;
      g.lineJoin = 'round'; g.lineWidth = 3; g.strokeStyle = 'rgba(239,228,198,0.92)';
      g.strokeText(p.name, tx, ty);
      g.fillStyle = '#2a1a10'; g.fillText(p.name, tx, ty);
    }
    // deg
    const [px, py] = this.moving?.at || [w.x, w.y];
    const X = (px + 0.5) * c, Y = (py + 0.5) * c;
    g.fillStyle = '#c0302a'; g.strokeStyle = '#1a0c08'; g.lineWidth = Math.max(1.5, c * 0.08);
    g.beginPath(); g.moveTo(X, Y - c * 0.42); g.lineTo(X + c * 0.3, Y); g.lineTo(X, Y + c * 0.42); g.lineTo(X - c * 0.3, Y); g.closePath(); g.fill(); g.stroke();
    // svevetekst for ruta under musa
    if (this.hover && !this.moving) {
      const [hx, hy] = this.hover;
      g.strokeStyle = 'rgba(42,26,16,0.8)'; g.lineWidth = 1.5;
      g.strokeRect(hx * c + 0.5, hy * c + 0.5, c - 1, c - 1);
    }
  }

  // --- sidepanelet ----------------------------------------------------------------------------
  refresh() {
    const w = W(), P = G.player;
    const reg = regionAt(w.x, w.y);
    const here = placeAt(w.x, w.y);
    $('#w-region').textContent = reg.name;
    const food = countFood(), hl = hungerLevel();
    $('#w-stats').innerHTML = [
      ['Tid', `Dag ${dayOf(G.run.clock)}, ${hhmm(G.run.clock)}`],
      ['Mat', `${food} døgn${hl ? `, ${hl === 2 ? 'utsultet' : 'sulten'}` : ''}`],
      ['KP', `${P.kp} av ${P.maxKP}`],
      ['Silver', `${P.silver} sm`],
    ].map(([k, v]) => `<div class="${k === 'Mat' && (hl || !food) ? 'bad' : ''}"><span>${k}</span><b>${v}</b></div>`).join('');
    const hp = here ? PLACES[here] : null;
    $('#w-here').innerHTML = hp ? `<b>${hp.name}</b><span>${hp.sub[0].toUpperCase() + hp.sub.slice(1)}.</span>` : `<b>${TERR_NAME[terrainAt(w.x, w.y)][0].toUpperCase() + TERR_NAME[terrainAt(w.x, w.y)].slice(1)}${roadAt(w.x, w.y) ? ' ved veien' : ''}</b><span>${reg.name}.</span>`;
    $('#btn-w-enter').textContent = hp ? (hp.kind === 'port' ? 'Gå til porten' : `Gå inn i ${hp.name}`) : 'Se deg om';
    $('#btn-w-camp').disabled = false;
    $('#btn-w-forage').disabled = !!(hp && hp.kind !== 'sted');
    this.info();
    // steder du kjenner, nærmeste først
    const list = placeList().map(p => ({ ...p, dist: Math.max(Math.abs(p.x - w.x), Math.abs(p.y - w.y)) })).sort((a, b) => a.dist - b.dist);
    const el = $('#w-places');
    el.innerHTML = list.map(p => `<button class="w-place${this.sel && this.sel[0] === p.x && this.sel[1] === p.y ? ' on' : ''}${p.x === w.x && p.y === w.y ? ' here' : ''}" data-x="${p.x}" data-y="${p.y}"><b>${p.name}</b><span>${p.x === w.x && p.y === w.y ? 'du er her' : p.sub}</span></button>`).join('');
    el.querySelectorAll('.w-place').forEach(b => (b.onclick = () => this.select(+b.dataset.x, +b.dataset.y)));
    this.draw();
  }

  info() {
    const w = W();
    const el = $('#w-info');
    const goBtn = $('#btn-w-go');
    this.preview = null;
    if (!this.sel || (this.sel[0] === w.x && this.sel[1] === w.y)) {
      el.innerHTML = '<span>Klikk på kartet eller på et sted i lista for å velge hvor du skal.</span>';
      goBtn.disabled = true;
      goBtn.textContent = 'Reis';
      return;
    }
    const [tx, ty] = this.sel;
    const path = findPath(w.x, w.y, tx, ty);
    const pid = placeAt(tx, ty);
    const name = pid && known(pid) ? PLACES[pid].name : `${TERR_NAME[terrainAt(tx, ty)]} i ${regionAt(tx, ty).name}`;
    if (!path) { el.innerHTML = `<b>${name}</b><span>Du kommer ikke dit til fots.</span>`; goBtn.disabled = true; return; }
    this.preview = path;
    const h = pathHours(path);
    const arrive = G.run.clock + h;
    const roadShare = path.slice(1).filter(([x, y]) => roadAt(x, y)).length / Math.max(1, path.length - 1);
    const food = countFood();
    const need = Math.max(0, Math.ceil((h - (24 - Math.min(24, G.run.clock - (W().fed ?? G.run.clock)))) / 24));
    el.innerHTML = `<b>${name[0].toUpperCase() + name.slice(1)}</b><span>${fmtH(h)}, ${roadShare > 0.7 ? 'mest langs veien' : roadShare > 0.3 ? 'dels langs veien' : 'utenfor veien'}. Fremme dag ${dayOf(arrive)} klokka ${hhmm(arrive)}.</span>${need > food ? `<span class="bad">Du har mat for ${food} døgn. Reisen krever ${need}.</span>` : ''}`;
    goBtn.disabled = false;
    goBtn.textContent = w.route?.length > 1 && w.route[w.route.length - 1][0] === tx && w.route[w.route.length - 1][1] === ty ? 'Fortsett reisen' : 'Reis';
  }

  select(x, y) {
    if (this.moving) return;
    this.sel = [x, y];
    G.audio.menuTick?.(67);
    this.refresh();
  }

  pickCell(e) {
    const r = this.cv.getBoundingClientRect();
    const x = Math.floor((e.clientX - r.left) / r.width * WW), y = Math.floor((e.clientY - r.top) / r.height * WH);
    return x >= 0 && y >= 0 && x < WW && y < WH ? [x, y] : null;
  }

  click(e) {
    if (this.moving || !$('#w-enc').hidden) return;
    const cell = this.pickCell(e);
    if (!cell) return;
    // et kjent sted i nærheten av klikket vinner
    let best = null, bd = 1.1;
    for (const p of placeList()) { const dd = Math.hypot(p.x - cell[0], p.y - cell[1]); if (dd < bd) { bd = dd; best = [p.x, p.y]; } }
    this.select(...(best || cell));
  }

  move(e) {
    const cell = this.pickCell(e);
    if (!cell) return;
    if (!this.hover || this.hover[0] !== cell[0] || this.hover[1] !== cell[1]) {
      this.hover = cell;
      const pid = placeAt(...cell);
      this.cv.title = seenAt(...cell) ? `${pid && known(pid) ? PLACES[pid].name + ', ' : ''}${TERR_NAME[terrainAt(...cell)]}, ${regionAt(...cell).name}` : 'Ukjent land';
      this.draw();
    }
  }

  // --- reisen ---------------------------------------------------------------------------------
  go() {
    if (this.moving || !this.sel) return;
    const w = W();
    const path = findPath(w.x, w.y, this.sel[0], this.sel[1]);
    if (!path || path.length < 2) return;
    w.route = path;
    this.moving = { path, i: 0, at: [w.x, w.y], t0: performance.now(), offRoad: !roadAt(w.x, w.y) };
    ['#btn-w-go', '#btn-w-enter', '#btn-w-camp', '#btn-w-forage'].forEach(s => ($(s).disabled = true));
    G.audio.ui();
    this.stepTimer = setTimeout(() => this.step(), 160);
  }

  // én rute om gangen: tid, tåke, mat, Orientering og møter
  step() {
    const m = this.moving;
    if (!m) return;
    const w = W(), P = G.player;
    const [x, y] = m.path[m.i + 1];
    const [px, py] = m.path[m.i];
    let h = stepHours(x, y) * (x !== px && y !== py ? 1.41 : 1);
    // Orientering når du forlater veien i skog og fjell (Bok I s. 54). Halv CL uten klar himmel.
    const lostTerr = !roadAt(x, y) && (terrainAt(x, y) === 'F' || terrainAt(x, y) === '^');
    if (lostTerr && !m.offRoad) {
      const sky = G.weather?.kindAt?.(G.run.clock) ?? G.weather?.kind;
      const clear = !sky || sky === 'klart';
      const r = P.roll('Orientering', { label: 'Orientering', mod: 0, halve: !clear });
      if (r.fummel) { h += 3; G.ui.logRoll(r, 'Du går i ring i tre timer før du kjenner igjen en stein du har sett før.'); }
      else if (!r.success) { h += 1; G.ui.logRoll(r, 'Stiene deler seg og forsvinner. Du mister en time på å finne retningen igjen.'); }
      else G.ui.logRoll(r, 'Du finner veien uten sti.');
    }
    m.offRoad = !roadAt(x, y);
    G.run.clock += h;
    w.x = x; w.y = y;
    m.i++;
    m.at = [x, y];
    w.route = m.path.slice(m.i);
    look(x, y);
    tickHunger();
    if (P.kp <= 0) { this.stop(); return; }
    const hour = ((G.run.clock % 24) + 24) % 24;
    const enc = m.i < m.path.length - 1 ? rollEncounter(x, y, hour) : null;
    this.refresh();
    if (enc) { this.encounter(enc, x, y, hour); return; }
    if (m.i >= m.path.length - 1) {
      this.stop();
      w.route = null;
      const pid = placeAt(x, y);
      if (pid && known(pid)) { G.ui.log(`Du er fremme ved ${PLACES[pid].name}.`); this.enter(); }
      return;
    }
    this.stepTimer = setTimeout(() => this.step(), 140);
  }

  stop() {
    clearTimeout(this.stepTimer);
    this.moving = null;
    this.refresh();
  }

  // Et møte stopper reisen. Fiender: Upptäcka fara avgjør om du ser dem først (Bok I).
  encounter(enc, x, y, hour) {
    const P = G.player;
    this.stop();
    const box = $('#w-enc');
    const depth = regionAt(x, y).danger;
    const terr = terrainAt(x, y), road = !!roadAt(x, y);
    const base = { enc, x, y, terr, road, depth, seed: Math.floor(Math.random() * 100000) };
    const btn = (label, fn, primary) => { const b = document.createElement('button'); b.className = 'btn' + (primary ? ' primary' : ''); b.textContent = label; b.onclick = fn; return b; };
    const show = (title, text, buttons) => {
      box.innerHTML = `<div class="eyebrow">${title}</div><p>${text}</p><div class="row"></div>`;
      const row = box.querySelector('.row');
      for (const b of buttons) row.appendChild(b);
      box.hidden = false;
      row.querySelector('button')?.focus({ preventScroll: true });
    };
    if (enc.kind !== 'fiende') {
      show(enc.kind === 'spesiell' ? 'Noe rart' : 'Du møter noen', enc.see, [
        btn('Gå bort til dem', () => { box.hidden = true; G.game.enterEncounter(base); }, true),
        btn('Fortsett', () => { box.hidden = true; this.go(); }),
      ]);
      return;
    }
    const r = P.roll('Upptäcka fara', { label: 'Upptäcka fara', mod: hour >= 21 || hour < 5 ? -3 : 0 });
    G.ui.logRoll(r, r.success ? 'Du ser dem før de ser deg.' : 'Du ser dem for sent.');
    if (!r.success) {
      show('Bakhold', `${enc.see.split('.')[0]}. De har sett deg først, og de er nær.`, [
        btn('Slåss', () => { box.hidden = true; G.game.enterEncounter({ ...base, ambush: true }); }, true),
      ]);
      return;
    }
    show('Du ser dem først', enc.see, [
      btn('Gå nærmere', () => { box.hidden = true; G.game.enterEncounter(base); }, true),
      btn('Smyg forbi (Smyga)', () => {
        const s = P.roll('Smyga', { label: 'Smyga', mod: terr === 'F' ? 2 : terr === '.' ? -3 : 0 });
        if (s.success) { G.ui.logRoll(s, 'Du kommer deg forbi uten at noen ser deg.'); box.hidden = true; this.go(); }
        else { G.ui.logRoll(s, 'En kvist knekker. De snur seg.'); box.hidden = true; G.game.enterEncounter({ ...base, ambush: true }); }
      }),
      btn('Gå rundt (en time)', () => { G.run.clock += 1; G.ui.log('Du går en lang omvei rundt dem. Det koster en time.'); box.hidden = true; this.go(); }),
    ]);
  }

  enter() {
    if (this.moving) return;
    const w = W();
    const pid = placeAt(w.x, w.y);
    G.game.enterSquare(pid && known(pid) ? pid : null);
  }

  // En natt ute: til klokka sju. Søvn gir 1T3 KP og all PSY hvis du har spist. En sjekk for møter i natt.
  camp() {
    if (this.moving) return;
    const w = W(), P = G.player;
    const hrs = campHours();
    const night = 22;
    const enc = rollEncounter(w.x, w.y, night) || (Math.random() < 0.5 ? rollEncounter(w.x, w.y, 2) : null);
    if (enc && enc.kind === 'fiende') {
      G.run.clock += hrs / 2;
      tickHunger();
      G.ui.log('Du våkner av at noen er i nærheten av leiren.');
      this.refresh();
      this.encounter(enc, w.x, w.y, ((G.run.clock % 24) + 24) % 24);
      return;
    }
    G.run.clock += hrs;
    tickHunger();
    const hungry = hungerLevel() > 0;
    const got = hungry ? 0 : P.heal(Math.ceil(Math.random() * 3), true);
    P.gainPSY(P.maxPSY);
    G.ui.log(`Du sover under åpen himmel. ${got ? `+${got} KP og ` : ''}all PSY.${hungry ? ' Du er for sulten til at sårene gror.' : ''} Klokka er sju.`);
    G.audio.heal?.();
    this.refresh();
  }

  forageHere() {
    if (this.moving) return;
    const w = W();
    const { r, n } = forage(w.x, w.y);
    G.ui.logRoll(r, n ? `Du finner mat for ${n} døgn: bær, sopp og en hare som var for treg.` : 'En time med leting, og ingenting å spise.');
    tickHunger();
    this.refresh();
  }
}

export { ate };
