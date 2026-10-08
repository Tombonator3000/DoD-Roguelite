// Reisekartet over Edelfara. Åpnes fra Nordporten i Fristaden og fra veiene ut av hvert område.
// Kartet er tegnet etter oversiktskartet i «Triangeldrama i Edelfara» (s. 15), forenklet.
import { G } from './state.js';
import { NODES, EDGES } from './edelmap.js';
import { fl, started } from './ivan.js';

const $ = s => document.querySelector(s);
const EDGE_NAME = { skog: 'gjennom Torilskogen', vei: 'langs landeveien', sti: 'på en sti gjennom skogen' };

export class Travel {
  constructor() {
    this.cv = $('#travel-map');
    this.ctx = this.cv.getContext('2d');
    this.from = null;
    this.sel = null;
    this.anim = null;
    this.cv.addEventListener('click', e => this.click(e));
    this.cv.addEventListener('mousemove', e => this.hover(e));
    $('#btn-travel-go').onclick = () => this.go();
    $('#btn-travel-stay').onclick = () => this.close();
    addEventListener('resize', () => { if (!$('#travel').hidden) this.draw(); });
  }

  // noder du kjenner til: Lekhs leir først når du har funnet sporet, Pharynx når oppdraget er i gang
  visible(id) {
    const n = NODES[id];
    if (!n) return false;
    if (id === 'lagret') return !!fl('trail');
    if (id === 'pharynx') return started();
    return true;
  }

  edges() {
    return EDGES.filter(([a, b]) => this.visible(a) && this.visible(b));
  }

  // korteste vei i timer
  route(from, to) {
    if (from === to) return null;
    const dist = { [from]: 0 }, prev = {};
    const open = new Set(Object.keys(NODES).filter(id => this.visible(id) || id === from));
    while (open.size) {
      let u = null;
      for (const id of open) if (dist[id] != null && (u == null || dist[id] < dist[u])) u = id;
      if (u == null) break;
      open.delete(u);
      if (u === to) break;
      for (const [a, b, h] of this.edges()) {
        const v = a === u ? b : b === u ? a : null;
        if (!v || !open.has(v)) continue;
        if (dist[v] == null || dist[u] + h < dist[v]) { dist[v] = dist[u] + h; prev[v] = u; }
      }
    }
    if (dist[to] == null) return null;
    const path = [to];
    while (path[0] !== from) path.unshift(prev[path[0]]);
    return { path, hours: dist[to] };
  }

  hoursOf(path) {
    let h = 0;
    for (let i = 0; i < path.length - 1; i++) {
      const e = EDGES.find(([a, b]) => (a === path[i] && b === path[i + 1]) || (b === path[i] && a === path[i + 1]));
      h += e ? e[2] : 0;
    }
    return h;
  }

  open(from) {
    if (G.state !== 'play') return;
    this.from = from;
    this.sel = null;
    this.anim = null;
    G.state = 'travel';
    G.audio.ui();
    G.ui.show('travel');
    $('#travel-go').hidden = false;
    this.info();
    this.draw();
  }

  close() {
    if (this.anim) return;
    G.ui.hideScreens();
    G.state = 'play';
  }

  info() {
    const el = $('#travel-info');
    const from = NODES[this.from];
    if (!this.sel) {
      el.innerHTML = `<b>${from.name}</b><span>Velg et sted på kartet.</span>`;
      $('#btn-travel-go').disabled = true;
      return;
    }
    const r = this.route(this.from, this.sel);
    const n = NODES[this.sel];
    if (!r) { el.innerHTML = `<b>${n.name}</b><span>Du vet ikke veien dit.</span>`; $('#btn-travel-go').disabled = true; return; }
    const first = EDGES.find(([a, b]) => (a === r.path[0] && b === r.path[1]) || (b === r.path[0] && a === r.path[1]));
    const via = r.path.slice(1, -1).map(id => NODES[id].name);
    const h = r.hours;
    const t = h < 1 ? `${Math.round(h * 60)} minutter` : `${h} time${h === 1 ? '' : 'r'}`;
    const arrive = ((G.run.clock + h) % 24 + 24) % 24;
    const night = arrive >= 21 || arrive < 5.5;
    el.innerHTML = `<b>${n.name}</b><span>${n.sub}. ${t} ${EDGE_NAME[first?.[3]] || ''}${via.length ? `, via ${via.join(' og ')}` : ''}.</span><span>Fremme klokka ${String(Math.floor(arrive)).padStart(2, '0')}.${String(Math.floor((arrive % 1) * 60)).padStart(2, '0')}${night ? ', i mørket' : ''}.${n.text ? ' Du rapporterer og rir tilbake til Glimming.' : ''}</span>`;
    $('#btn-travel-go').disabled = false;
  }

  go() {
    if (!this.sel || this.anim) return;
    G.game.travelTo(this.sel, this.from);
  }

  // Markøren går langs ruten før neste område lastes
  animate(path, done) {
    this.anim = { path, t: 0, dur: Math.min(2.2, 0.7 + path.length * 0.45), done };
    $('#travel-go').hidden = true;
    G.ui.show('travel');
    const step = () => {
      const a = this.anim;
      if (!a) return;
      a.t += 1 / 60;
      this.draw();
      if (a.t >= a.dur) { this.anim = null; done(); return; }
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  pos(id) {
    const n = NODES[id];
    const W = this.cv.width, H = this.cv.height;
    return [n.x / 100 * W, n.y / 100 * H];
  }

  pick(e) {
    const r = this.cv.getBoundingClientRect();
    const x = (e.clientX - r.left) * (this.cv.width / r.width), y = (e.clientY - r.top) * (this.cv.height / r.height);
    let best = null, bd = 34 * (this.cv.width / r.width);
    for (const id of Object.keys(NODES)) {
      if (!this.visible(id) || id === this.from) continue;
      const [px, py] = this.pos(id);
      const d = Math.hypot(px - x, py - y);
      if (d < bd) { bd = d; best = id; }
    }
    return best;
  }

  click(e) {
    if (this.anim) return;
    const id = this.pick(e);
    if (!id) return;
    this.sel = id;
    G.audio.menuTick?.(67);
    this.info();
    this.draw();
  }

  hover(e) {
    const id = this.pick(e);
    this.cv.style.cursor = id ? 'pointer' : 'default';
    if (id !== this.hoverId) { this.hoverId = id; this.draw(); }
  }

  draw() {
    const cv = this.cv;
    const box = cv.parentElement.getBoundingClientRect();
    const W = Math.max(320, Math.floor(box.width)), Hh = Math.max(240, Math.floor(Math.min(box.width * 0.72, innerHeight * 0.62)));
    if (cv.width !== W || cv.height !== Hh) { cv.width = W; cv.height = Hh; }
    const g = this.ctx;
    // pergament
    const bg = g.createLinearGradient(0, 0, W, Hh);
    bg.addColorStop(0, '#e6d6b0'); bg.addColorStop(1, '#cdb88a');
    g.fillStyle = bg;
    g.fillRect(0, 0, W, Hh);
    // Torilskogen: et belte av skog fra sørvest mot midten
    let seed = 7;
    const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    g.fillStyle = 'rgba(70,96,58,0.32)';
    for (let i = 0; i < 260; i++) {
      const t = rnd();
      const cx = (0.12 + t * 0.62 + (rnd() - 0.5) * 0.3) * W, cy = (0.4 + t * 0.5 + (rnd() - 0.5) * 0.36) * Hh;
      const r = (0.02 + rnd() * 0.035) * W;
      g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.fill();
    }
    g.fillStyle = 'rgba(50,76,44,0.5)';
    for (let i = 0; i < 90; i++) {
      const cx = (0.15 + rnd() * 0.5) * W, cy = (0.55 + rnd() * 0.4) * Hh;
      const tx = cx, ty = cy;
      g.beginPath(); g.moveTo(tx, ty - 7); g.lineTo(tx - 5, ty + 5); g.lineTo(tx + 5, ty + 5); g.closePath(); g.fill();
    }
    // elva gjennom Eke og sjøen ved Sortmund
    g.strokeStyle = 'rgba(60,110,150,0.6)';
    g.lineWidth = 4;
    g.beginPath();
    g.moveTo(0.02 * W, 0.86 * Hh);
    g.bezierCurveTo(0.2 * W, 0.84 * Hh, 0.32 * W, 0.92 * Hh, 0.5 * W, 0.86 * Hh);
    g.bezierCurveTo(0.62 * W, 0.8 * Hh, 0.68 * W, 0.66 * Hh, 0.76 * W, 0.46 * Hh);
    g.stroke();
    g.fillStyle = 'rgba(60,110,150,0.55)';
    g.beginPath(); g.ellipse(0.71 * W, 0.47 * Hh, 0.03 * W, 0.02 * Hh, -0.4, 0, Math.PI * 2); g.fill();
    // veier
    for (const [a, b, h, kind] of this.edges()) {
      const [ax, ay] = this.pos(a), [bx, by] = this.pos(b);
      g.strokeStyle = kind === 'vei' ? 'rgba(90,60,30,0.85)' : 'rgba(90,60,30,0.6)';
      g.lineWidth = kind === 'vei' ? 3 : 2;
      g.setLineDash(kind === 'skog' ? [8, 6] : kind === 'sti' ? [3, 5] : []);
      g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx, by); g.stroke();
      g.setLineDash([]);
      g.fillStyle = 'rgba(60,40,20,0.85)';
      g.font = `italic ${Math.round(W / 72)}px Georgia, serif`;
      g.textAlign = 'center';
      g.fillText(h < 1 ? `${Math.round(h * 60)} min` : `${h} t`, (ax + bx) / 2 + 8, (ay + by) / 2 - 6);
    }
    // valgt rute
    const r = this.sel && this.route(this.from, this.sel);
    const path = this.anim?.path || r?.path;
    if (path) {
      g.strokeStyle = '#a0201a';
      g.lineWidth = 4;
      g.beginPath();
      path.forEach((id, i) => { const [x, y] = this.pos(id); if (i) g.lineTo(x, y); else g.moveTo(x, y); });
      g.stroke();
    }
    // steder
    for (const id of Object.keys(NODES)) {
      if (!this.visible(id) && id !== this.from) continue;
      const n = NODES[id];
      const [x, y] = this.pos(id);
      const here = id === this.from, sel = id === this.sel, hov = id === this.hoverId;
      g.fillStyle = here ? '#2a1a10' : sel ? '#a0201a' : hov ? '#6a3a20' : '#4a3020';
      g.beginPath(); g.arc(x, y, here || sel ? 9 : 7, 0, Math.PI * 2); g.fill();
      g.strokeStyle = '#e6d6b0'; g.lineWidth = 2; g.stroke();
      g.fillStyle = '#2a1a10';
      g.font = `bold ${Math.round(W / 50)}px Georgia, serif`;
      g.textAlign = x > W * 0.8 ? 'right' : 'left';
      const ox = x > W * 0.8 ? -14 : 14;
      g.fillText(n.name, x + ox, y + 4);
      g.font = `italic ${Math.round(W / 70)}px Georgia, serif`;
      g.fillStyle = 'rgba(42,26,16,0.75)';
      g.fillText(here ? 'du er her' : n.sub, x + ox, y + 4 + Math.round(W / 52));
    }
    // markøren under reisen
    if (this.anim) {
      const a = this.anim, p = a.path;
      const k = Math.min(1, a.t / a.dur) * (p.length - 1);
      const i = Math.min(p.length - 2, Math.floor(k)), f = k - i;
      const [x0, y0] = this.pos(p[i]), [x1, y1] = this.pos(p[i + 1]);
      const x = x0 + (x1 - x0) * f, y = y0 + (y1 - y0) * f;
      g.fillStyle = '#f0c040';
      g.beginPath(); g.arc(x, y, 7, 0, Math.PI * 2); g.fill();
      g.strokeStyle = '#2a1a10'; g.lineWidth = 2; g.stroke();
    }
    // tittel og rose
    g.fillStyle = 'rgba(42,26,16,0.85)';
    g.textAlign = 'left';
    g.font = `bold ${Math.round(W / 34)}px Georgia, serif`;
    g.fillText('Grevskapet Edelfara', 18, Hh - 22);
    g.font = `italic ${Math.round(W / 64)}px Georgia, serif`;
    g.fillText('hertigdömet Pharynx, Zorakin', 20, Hh - 6);
  }
}
