// Kartbyggeren for områdene i Edelfara. Ren data uten three.js, så kartene kan sjekkes i node
// (tools/test/areamap.mjs tegner dem som tekst).
import { WALL, FLOOR, WATER, HOUSE, FENCE, GR, TW, TH } from './townmap.js';

// kind: hva en WALL-flis er
export const K_FOREST = 0, K_OPEN = 1, K_DEEP = 2, K_HILL = 3, K_WALL = 4, K_ROCK = 5;
const idx = (x, y) => y * TW + x;
const inMap = (x, y) => x >= 0 && y >= 0 && x < TW && y < TH;
function hash2(x, y, seed) {
  let h = (x * 374761393 + y * 668265263 + seed * 1442695041) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967295;
}
const H = (x, y, s) => hash2(Math.floor(x), Math.floor(y), s);

// --- kartbygger --------------------------------------------------------------------------
// L.paint(k) maler kartet. Alt starter som skog. Hus, gjerder og murer legges på etterpå.
export function buildAreaGrid(L) {
  const N = TW * TH;
  const grid = new Uint8Array(N).fill(WALL);
  const ground = new Uint8Array(N).fill(GR.OUT);
  const bmap = new Uint8Array(N), doorMap = new Uint8Array(N), bridge = new Uint8Array(N);
  const kind = new Uint8Array(N); // K_FOREST
  const out = { grid, ground, bmap, doorMap, bridge, kind, hills: [], fields: [], buildings: L.buildings || [] };
  const set = (x, y, v, g, k) => {
    if (!inMap(x, y)) return;
    const i = idx(x, y);
    if (v != null) grid[i] = v;
    if (g != null) ground[i] = g;
    if (k != null) kind[i] = k;
    else if (v === FLOOR || v === WATER) kind[i] = K_OPEN;
  };
  const rect = (x0, y0, x1, y1, v, g, k) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, v, g, k); };
  const k = {
    set, rect,
    open: (x0, y0, x1, y1, g = GR.GRASS) => rect(x0, y0, x1, y1, FLOOR, g),
    // uregelmessig glenne: radius med litt støy i kanten
    glade(cx, cy, rx, ry = rx, g = GR.GRASS, seed = 3) {
      for (let y = Math.floor(cy - ry - 2); y <= cy + ry + 2; y++) for (let x = Math.floor(cx - rx - 2); x <= cx + rx + 2; x++) {
        const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry;
        const n = 0.82 + 0.36 * H(x, y, seed);
        if (dx * dx + dy * dy < n * n) set(x, y, FLOOR, g);
      }
    },
    // vei langs punkter, w = bredde i fliser
    road(pts, w = 2, g = GR.DIRT) {
      for (let i = 0; i < pts.length - 1; i++) {
        const [ax, ay] = pts[i], [bx, by] = pts[i + 1];
        const len = Math.hypot(bx - ax, by - ay), n = Math.ceil(len * 3);
        for (let s = 0; s <= n; s++) {
          const t = s / n, px = ax + (bx - ax) * t, py = ay + (by - ay) * t;
          for (let y = Math.floor(py - w / 2); y <= py + w / 2; y++) for (let x = Math.floor(px - w / 2); x <= px + w / 2; x++) {
            if (Math.hypot(x + 0.5 - px, y + 0.5 - py) <= w / 2 + 0.15) set(x, y, FLOOR, g);
          }
        }
      }
    },
    forest: (x0, y0, x1, y1) => rect(x0, y0, x1, y1, WALL, GR.OUT, K_FOREST),
    // skogsdunge med ujevn kant
    grove(cx, cy, rx, ry = rx, seed = 2) {
      for (let y = Math.floor(cy - ry - 2); y <= cy + ry + 2; y++) for (let x = Math.floor(cx - rx - 2); x <= cx + rx + 2; x++) {
        const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry;
        const n = 0.8 + 0.4 * H(x, y, seed);
        if (dx * dx + dy * dy < n * n) set(x, y, WALL, GR.OUT, K_FOREST);
      }
    },
    water: (x0, y0, x1, y1) => rect(x0, y0, x1, y1, WATER, GR.OUT),
    deep: (x0, y0, x1, y1) => rect(x0, y0, x1, y1, WALL, GR.OUT, K_DEEP),
    deepAt: (x, y) => set(x, y, WALL, GR.OUT, K_DEEP),
    waterAt: (x, y) => set(x, y, WATER, GR.OUT),
    rock: (x, y) => set(x, y, WALL, GR.OUT, K_ROCK),
    // ås: en skive av WALL med en haug over (og kanskje en borg på toppen)
    hill(cx, cy, r, o = {}) {
      for (let y = Math.floor(cy - r - 1); y <= cy + r + 1; y++) for (let x = Math.floor(cx - r - 1); x <= cx + r + 1; x++) {
        if (Math.hypot(x + 0.5 - cx, y + 0.5 - cy) <= r) set(x, y, WALL, GR.OUT, K_HILL);
      }
      out.hills.push({ x: cx, y: cy, r, ...o });
    },
    field(x0, y0, x1, y1, crop = 'korn') { rect(x0, y0, x1, y1, FLOOR, GR.DIRT); out.fields.push({ x0, y0, x1, y1, crop }); },
    bridge(x0, y0, x1, y1, t = 1) { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { set(x, y, FLOOR, GR.PLANK); bridge[idx(x, y)] = t; } },
  };
  L.paint?.(k, L.state || {});
  // bymurer og tårn (borggårder)
  if (L.ring) {
    const R = L.ring;
    for (let x = R.x0; x <= R.x1; x++) { set(x, R.y0, WALL, GR.OUT, K_WALL); set(x, R.y1, WALL, GR.OUT, K_WALL); }
    for (let y = R.y0; y <= R.y1; y++) { set(R.x0, y, WALL, GR.OUT, K_WALL); set(R.x1, y, WALL, GR.OUT, K_WALL); }
  }
  for (const t of L.towers || []) rect(t[0], t[1], t[2], t[3], WALL, GR.OUT, K_WALL);
  // bygninger som i buildTownLayout
  out.buildings.forEach((b, bi) => {
    for (let y = b.y0; y <= b.y1; y++) for (let x = b.x0; x <= b.x1; x++) {
      const edge = x === b.x0 || x === b.x1 || y === b.y0 || y === b.y1;
      if (edge) set(x, y, HOUSE, b.floor);
      else { set(x, y, FLOOR, b.floor); bmap[idx(x, y)] = bi + 1; }
    }
    for (const [x, y] of b.doors) { set(x, y, FLOOR, b.floor); doorMap[idx(x, y)] = bi + 1; bmap[idx(x, y)] = bi + 1; }
  });
  for (const [[ax, ay], [bx, by]] of L.fences || []) {
    for (let y = Math.min(ay, by); y <= Math.max(ay, by); y++) for (let x = Math.min(ax, bx); x <= Math.max(ax, bx); x++) {
      if (grid[idx(x, y)] === FLOOR && !bridge[idx(x, y)]) set(x, y, FENCE);
    }
  }
  for (const [x, y] of L.gaps || []) set(x, y, FLOOR);
  L.after?.(k, L.state || {});
  return out;
}


// For feilsøking: kartet som tekst. # skog, ~ vann, = dypt vann, ^ ås, M mur, H hus, x gjerde, D dør, b bro
export function asciiArea(A) {
  const ch = { [GR.COBBLE]: '=', [GR.DIRT]: ':', [GR.GRASS]: '.', [GR.WOOD]: 'w', [GR.FLAG]: 'f', [GR.PLANK]: 'b', [GR.OUT]: ',' };
  const rows = [];
  for (let y = 0; y < TH; y++) {
    let s = '';
    for (let x = 0; x < TW; x++) {
      const i = idx(x, y), v = A.grid[i], k = A.kind[i];
      if (v === WALL) s += k === K_DEEP ? '≈' : k === K_HILL ? '^' : k === K_WALL ? 'M' : k === K_ROCK ? 'o' : '#';
      else if (v === WATER) s += '~';
      else if (v === HOUSE) s += 'H';
      else if (v === FENCE) s += 'x';
      else if (A.doorMap[i]) s += 'D';
      else s += ch[A.ground[i]] || '?';
    }
    rows.push(s);
  }
  return rows.join('\n');
}
