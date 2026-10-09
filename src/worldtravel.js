// Reisen på verdenskartet: tilstand, tåke, veivalg, tid, møter og mat.
// Fallout 1 og 2 er forbildet (rutenett med tåke, klikk og gå, møter per rute). Reglene er DoD 4.0:
// Upptäcka fara for å se møtet først, Smyga for å komme forbi, Orientering utenfor vei (Bok I s. 54),
// Överlevnad for å finne mat. Tidene er sammenpresset etter Toms valg. Tall som ikke står i boka, er uv.
import { G } from './state.js';
import { WW, WH, TERRAIN, TERR, FREQ, FREQ_ORDER, ROADS, PLACES, REGIONS, ENCOUNTERS } from './worldmap.js';
import { makeCons, giveItem } from './inventory.js';
import { d } from './rules.js';

const idx = (x, y) => y * WW + x;
export const inWorld = (x, y) => x >= 0 && y >= 0 && x < WW && y < WH;

// --- veier som et lag: 1 = vei, 2 = sti -------------------------------------------------------
export const ROAD = new Uint8Array(WW * WH);
for (const r of ROADS) {
  for (let i = 0; i < r.pts.length - 1; i++) {
    const [ax, ay] = r.pts[i], [bx, by] = r.pts[i + 1];
    const n = Math.max(Math.abs(bx - ax), Math.abs(by - ay));
    for (let s = 0; s <= n; s++) {
      const x = Math.round(ax + (bx - ax) * s / n), y = Math.round(ay + (by - ay) * s / n);
      const k = idx(x, y);
      ROAD[k] = ROAD[k] === 1 ? 1 : r.kind === 'vei' ? 1 : 2;
    }
  }
}
const PLACE_AT = {};
for (const [id, p] of Object.entries(PLACES)) PLACE_AT[idx(p.x, p.y)] = id;

export const terrainAt = (x, y) => (inWorld(x, y) ? TERRAIN[y][x] : '~');
export const placeAt = (x, y) => PLACE_AT[idx(x, y)] || null;
export const roadAt = (x, y) => (inWorld(x, y) ? ROAD[idx(x, y)] : 0);
export function regionAt(x, y) {
  const t = terrainAt(x, y);
  return REGIONS.find(r => r.test(x, y, t)) || REGIONS[REGIONS.length - 1];
}
export const passable = (x, y) => inWorld(x, y) && TERR[terrainAt(x, y)]?.hours != null;

// timer for å gå inn i en rute
export function stepHours(x, y) {
  if (!passable(x, y)) return Infinity;
  if (roadAt(x, y)) return 1;
  return TERR[terrainAt(x, y)].hours;
}

// --- tilstanden i G.run.world -----------------------------------------------------------------
export function W() {
  const r = G.run;
  if (!r.world) {
    const f = PLACES.fristaden;
    r.world = { x: f.x, y: f.y, seen: new Array(WW * WH).fill(0), known: {}, fed: r.clock ?? 17, starveT: null, done: {}, cleared: {}, enc: null, route: null };
    for (const [id, p] of Object.entries(PLACES)) if (p.known) r.world.known[id] = true;
    // landet rett rundt Fristaden kjenner du fra før
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) if (inWorld(f.x + dx, f.y + dy)) r.world.seen[idx(f.x + dx, f.y + dy)] = 1;
    look(f.x, f.y);
  }
  const w = r.world;
  if (!w.seen || w.seen.length !== WW * WH) w.seen = new Array(WW * WH).fill(0);
  return w;
}

export const seenAt = (x, y) => (inWorld(x, y) ? W().seen[idx(x, y)] : 0);
export const known = id => !!W().known[id] || (id === 'pharynx' && (G.run.ivan?.stage || 0) >= 1);

// Tåken letter rundt deg. Fra fjellet ser du lenger, som Scout i Fallout (uv).
export function look(x, y) {
  const w = G.run.world;
  if (!w) return;
  const r = terrainAt(x, y) === '^' ? 2 : 1;
  for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
    const nx = x + dx, ny = y + dy;
    if (!inWorld(nx, ny)) continue;
    const k = idx(nx, ny);
    if (w.seen[k] < 1) w.seen[k] = 1;
    // byer og steder du ser, blir kjent. Skjulte steder først når du står i ruta.
    const pid = PLACE_AT[k];
    if (pid && !w.known[pid] && !PLACES[pid].hidden && (Math.abs(dx) <= 1 && Math.abs(dy) <= 1)) reveal(pid, false, 'Du ser');
  }
  w.seen[idx(x, y)] = 2;
  const here = PLACE_AT[idx(x, y)];
  if (here && !w.known[here]) reveal(here, false, 'Du finner');
}

// Et sted blir merket på kartet. Brukes fra samtaler: reveal(['pendon', 'ardesch']).
export function reveal(ids, quiet = false, how = '') {
  const w = W();
  const list = Array.isArray(ids) ? ids : [ids];
  const fresh = list.filter(id => PLACES[id] && !w.known[id]);
  // stedet blir merket, men landet rundt er ukjent til du har sett det selv
  for (const id of fresh) w.known[id] = true;
  if (fresh.length && !quiet) {
    const names = fresh.map(id => PLACES[id].name);
    const txt = names.length === 1 ? names[0] : names.slice(0, -1).join(', ') + ' og ' + names[names.length - 1];
    G.ui?.log(how ? `${how} ${txt}. Merket på kartet.` : `<b class="c-mark">På kartet:</b> ${txt}.`);
    G.audio?.menuSelect?.();
  }
  return fresh;
}

// --- veivalg: A* over rutene, åtte retninger --------------------------------------------------
export function findPath(sx, sy, tx, ty) {
  if (!passable(tx, ty)) return null;
  const N = WW * WH, INF = 1e9;
  const g = new Float32Array(N).fill(INF), prev = new Int32Array(N).fill(-1), closed = new Uint8Array(N);
  const h = (x, y) => Math.max(Math.abs(tx - x), Math.abs(ty - y)) * 1;
  const open = [[h(sx, sy), sx, sy]];
  g[idx(sx, sy)] = 0;
  while (open.length) {
    let bi = 0;
    for (let i = 1; i < open.length; i++) if (open[i][0] < open[bi][0]) bi = i;
    const [, x, y] = open.splice(bi, 1)[0];
    const k = idx(x, y);
    if (closed[k]) continue;
    closed[k] = 1;
    if (x === tx && y === ty) break;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue;
      const nx = x + dx, ny = y + dy;
      if (!passable(nx, ny)) continue;
      // ikke skjær hjørner over vann
      if (dx && dy && (!passable(x + dx, y) || !passable(x, y + dy))) continue;
      const c = stepHours(nx, ny) * (dx && dy ? 1.41 : 1) * (roadAt(nx, ny) && roadAt(x, y) ? 0.9 : 1);
      const nk = idx(nx, ny);
      if (g[k] + c < g[nk]) { g[nk] = g[k] + c; prev[nk] = k; open.push([g[nk] + h(nx, ny), nx, ny]); }
    }
  }
  const tk = idx(tx, ty);
  if (g[tk] >= INF) return null;
  const path = [];
  for (let k = tk; k !== -1; k = prev[k]) path.unshift([k % WW, Math.floor(k / WW)]);
  return path;
}

export function pathHours(path) {
  let h = 0;
  for (let i = 1; i < path.length; i++) {
    const [x, y] = path[i], [px, py] = path[i - 1];
    h += stepHours(x, y) * (x !== px && y !== py ? 1.41 : 1);
  }
  return h;
}

// --- møter ------------------------------------------------------------------------------------
export function freqAt(x, y, hour) {
  const t = TERR[terrainAt(x, y)];
  if (!t || !t.freq) return 0;
  let i = FREQ_ORDER.indexOf(t.freq);
  if (roadAt(x, y)) i -= 1;
  // nær byer er det tryggere
  for (const p of Object.values(PLACES)) if (p.kind !== 'sted' && Math.max(Math.abs(p.x - x), Math.abs(p.y - y)) <= 1) { i = Math.min(i, 1); break; }
  const reg = regionAt(x, y);
  if (reg.danger >= 2 && !roadAt(x, y)) i += 1;
  const night = hour >= 21 || hour < 5;
  if (night) i += 1;
  i = Math.max(0, Math.min(FREQ_ORDER.length - 1, i));
  return FREQ[FREQ_ORDER[i]];
}

export function pickEncounter(x, y, hour) {
  const t = terrainAt(x, y), reg = regionAt(x, y).id, road = roadAt(x, y);
  const night = hour >= 21 || hour < 5;
  const w = W();
  const pool = ENCOUNTERS.filter(e => e.terr.includes(t) && (!e.regions || e.regions.includes(reg)) && (!e.onlyNight || night) && (!e.roadOnly || road) && !(e.once && w.done[e.id]));
  if (!pool.length) return null;
  const weight = e => e.w * (night && e.night ? e.night : 1) * (road && e.road ? e.road : 1) * (night && e.kind === 'folk' ? 0.4 : 1);
  let r = Math.random() * pool.reduce((a, e) => a + weight(e), 0);
  for (const e of pool) { r -= weight(e); if (r <= 0) return e; }
  return pool[pool.length - 1];
}

export function rollEncounter(x, y, hour) {
  if (placeAt(x, y) || G.debugNoEnc) return null; // G.debugNoEnc: for testene
  if (Math.random() >= freqAt(x, y, hour)) return null;
  return pickEncounter(x, y, hour);
}

// --- mat og sult ------------------------------------------------------------------------------
// Ett måltid per døgn. Proviant spises først, så brød. Uten mat i et døgn er du sulten: du får ikke
// KP av søvn, og PSY kommer ikke tilbake. Etter to døgn mister du 1 KP hver tolvte time, men aldri
// det siste (uv: Bok I og II har ingen sultregel vi har funnet).
export function hoursSinceMeal() { return (G.run.clock || 0) - (W().fed ?? G.run.clock); }
export function hungerLevel() {
  if (!G.run?.world) return 0;
  const h = hoursSinceMeal();
  return h >= 48 ? 2 : h >= 24 ? 1 : 0;
}
export function ate(note) {
  const w = W();
  w.fed = G.run.clock;
  w.starveT = null;
  if (note) G.ui?.log(note);
}

function eatFromBag() {
  const P = G.player;
  if (!P?.bag) return null;
  for (const cid of ['proviant', 'brod']) {
    const i = P.bag.findIndex(it => it && it.type === 'cons' && it.cid === cid);
    if (i < 0) continue;
    const it = P.bag[i];
    if ((it.qty || 1) > 1) it.qty--;
    else P.bag.splice(i, 1);
    P.recalc?.();
    return cid;
  }
  return null;
}

export function countFood() {
  const P = G.player;
  if (!P?.bag) return 0;
  return P.bag.filter(it => it && it.type === 'cons' && (it.cid === 'proviant' || it.cid === 'brod')).reduce((a, it) => a + (it.qty || 1), 0);
}

export function tickHunger() {
  if (!G.run?.world || !G.player) return;
  const w = W();
  if (hoursSinceMeal() >= 24) {
    const what = eatFromBag();
    if (what) { ate(what === 'proviant' ? 'Du spiser en dagsranson. Tørket kjøtt, hardt brød og en bit ost.' : 'Du spiser brødet fra sekken. Det får holde.'); return; }
  }
  const h = hoursSinceMeal();
  if (h >= 24 && !w.hungryTold) { w.hungryTold = true; G.ui?.log('<b class="c-cond">Du er sulten.</b> Uten mat gror ikke sårene når du sover, og PSY kommer ikke tilbake av seg selv. Kjøp proviant, eller let etter mat (Överlevnad).'); }
  if (h < 24) w.hungryTold = false;
  if (h >= 48) {
    if (w.starveT == null) w.starveT = w.fed + 48;
    while (G.run.clock - w.starveT >= 12) {
      w.starveT += 12;
      const P = G.player;
      if (P.kp > 1) { P.kp -= 1; G.ui?.log('<b class="c-cond">Sulten.</b> Du mister 1 KP. Kroppen tærer på seg selv.'); G.ui?.flashDamage?.(); }
    }
  }
}

// Överlevnad: let etter mat i en time. Lyckat gir én dagsranson, perfekt to. Ikke i byene.
export function forage(x, y) {
  const P = G.player;
  const t = terrainAt(x, y);
  G.run.clock += 1;
  const mod = t === 'F' ? 0 : t === '.' ? -2 : -4;
  const r = P.roll('Överlevnad', { label: 'Överlevnad', mod });
  const n = r.perfekt ? 2 : r.success ? 1 : 0;
  if (n) giveItem(makeCons('proviant', n));
  return { r, n };
}

// Natt under åpen himmel: til klokka sju (minst seks timer). Søvn gir 1T3 KP og all PSY hvis du ikke er sulten.
export function campHours() {
  const h = ((G.run.clock % 24) + 24) % 24;
  return h < 7 ? 7 - h : Math.max(6, 24 - h + 7);
}

export function placeList() {
  return Object.entries(PLACES).filter(([id]) => known(id)).map(([id, p]) => ({ id, ...p }));
}

export { PLACES, TERRAIN, TERR, WW, WH, d };
