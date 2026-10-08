import * as THREE from 'three';
import { G, T } from './state.js';
import { buildPillar } from './assets.js';

export const WALL = 0, FLOOR = 1, WATER = 2, PILLAR = 3;
const TALL = 3.2, LOW = 0.85, WATER_BOTTOM = -0.75, WATER_Y = -0.24;

export function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const FLOORS = [
  { name: 'Fristaden', biome: 'stad', town: true, fog: 0x2a3040, ambient: 0x9098b8, torch: 0xffa850, alt: 0xffc070 },
  { name: 'Fristadens kloakker', biome: 'kloakk', fog: 0x0a1210, ambient: 0x6f8f88, torch: 0xff9a4a, alt: 0x52ffb0 },
  { name: 'Rottenes renner', biome: 'kloakk', fog: 0x08100e, ambient: 0x60807a, torch: 0xff9248, alt: 0x52ffb0 },
  { name: 'Karad Baturs glemte haller', biome: 'dverg', fog: 0x120c08, ambient: 0x8a7766, torch: 0xffa040, alt: 0xff7a30 },
  { name: 'Den kalde smia', biome: 'dverg', fog: 0x100a07, ambient: 0x7a6858, torch: 0xff9838, alt: 0xff5a20 },
  { name: 'Revehiet', biome: 'rev', fog: 0x120606, ambient: 0x8a5a50, torch: 0xff6a34, alt: 0xff3a20, boss: true },
];

// Fiendesammensetning per dybde
const ENEMY_TABLE = {
  1: [['rat', 6], ['skeleton', 4]],
  2: [['rat', 4], ['skeleton', 4], ['goblin', 3]],
  3: [['skeleton', 4], ['goblin', 4], ['orc', 2], ['rat', 1]],
  4: [['goblin', 4], ['orc', 3], ['skeleton', 3]],
};

export class Dungeon {
  constructor(depth, seed) {
    this.depth = depth;
    this.seed = seed;
    this.info = FLOORS[depth];
    this.biome = this.info.biome;
    this.rng = mulberry32(seed);
    this.W = 46;
    this.H = 46;
    this.grid = new Uint8Array(this.W * this.H);
    this.explored = new Uint8Array(this.W * this.H);
    this.dist = new Uint16Array(this.W * this.H);
    this.queue = new Int32Array(this.W * this.H);
    this.rooms = [];
    this.torches = [];
    this.braziers = [];
    this.spawnList = [];
    this.propList = [];
    this.chestList = [];
    this.cacheList = [];
    this.runeStone = null;
    this.decor = [];
    this.stairs = null;
    this.shop = null;
    this.bossSpawn = null;
    this.group = new THREE.Group();
    if (this.info.boss) this.genBoss();
    else this.gen();
  }

  rnd(a, b) {
    return a + Math.floor(this.rng() * (b - a + 1));
  }
  pick(arr) {
    return arr[Math.floor(this.rng() * arr.length)];
  }
  idx(x, y) {
    return y * this.W + x;
  }
  get(x, y) {
    if (x < 0 || y < 0 || x >= this.W || y >= this.H) return WALL;
    return this.grid[y * this.W + x];
  }
  set(x, y, v) {
    if (x < 1 || y < 1 || x >= this.W - 1 || y >= this.H - 1) return;
    this.grid[y * this.W + x] = v;
  }
  open(x, y) {
    const v = this.get(x, y);
    return v === FLOOR || v === WATER;
  }
  tw(t) {
    return (t + 0.5) * T;
  }
  // høy vegg = vegg uten åpne naboer mot kameraet (-x, -z)
  tallWall(x, y) {
    return this.get(x, y) === WALL && this.get(x - 1, y) === WALL && this.get(x, y - 1) === WALL && this.get(x - 1, y - 1) === WALL;
  }

  carveRect(x, y, w, h, v = FLOOR) {
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) this.set(i, j, v);
  }

  corridor(a, b) {
    let x = a.cx, y = a.cy;
    const hFirst = this.rng() < 0.5;
    // i kloakken går det ofte en renne langs den ene siden av gangen
    const gutter = this.biome === 'kloakk' && this.rng() < 0.55;
    const carve = (cx, cy, horiz) => {
      for (let j = 0; j < 2; j++) for (let i = 0; i < 2; i++) {
        if (this.get(cx + i, cy + j) === WALL) {
          const lane2 = horiz ? j === 1 : i === 1;
          this.set(cx + i, cy + j, gutter && lane2 ? WATER : FLOOR);
        }
      }
    };
    const stepX = () => { while (x !== b.cx) { carve(x, y, true); x += Math.sign(b.cx - x); } };
    const stepY = () => { while (y !== b.cy) { carve(x, y, false); y += Math.sign(b.cy - y); } };
    if (hFirst) { stepX(); stepY(); } else { stepY(); stepX(); }
    carve(x, y, true);
  }

  gen() {
    const target = 10 + (this.depth > 2 ? 1 : 0);
    for (let tries = 0; tries < 600 && this.rooms.length < target; tries++) {
      const w = this.rnd(6, 11), h = this.rnd(6, 11);
      const x = this.rnd(2, this.W - w - 3), y = this.rnd(2, this.H - h - 3);
      let ok = true;
      for (const r of this.rooms) {
        if (x < r.x + r.w + 3 && x + w + 3 > r.x && y < r.y + r.h + 3 && y + h + 3 > r.y) { ok = false; break; }
      }
      if (!ok) continue;
      this.rooms.push({ x, y, w, h, cx: x + Math.floor(w / 2), cy: y + Math.floor(h / 2) });
    }
    for (const r of this.rooms) this.carveRect(r.x, r.y, r.w, r.h);
    // MST (Prim) + noen ekstra løkker
    const n = this.rooms.length;
    const inTree = [0];
    const dd = (a, b) => Math.abs(a.cx - b.cx) + Math.abs(a.cy - b.cy);
    while (inTree.length < n) {
      let best = null, bd = 1e9;
      for (const i of inTree) for (let j = 0; j < n; j++) {
        if (inTree.includes(j)) continue;
        const v = dd(this.rooms[i], this.rooms[j]);
        if (v < bd) { bd = v; best = [i, j]; }
      }
      this.corridor(this.rooms[best[0]], this.rooms[best[1]]);
      inTree.push(best[1]);
    }
    for (let k = 0; k < 3; k++) {
      const a = this.pick(this.rooms), b = this.pick(this.rooms);
      if (a !== b && dd(a, b) < 22) this.corridor(a, b);
    }
    // start og trapp
    const start = this.rooms[this.rnd(0, n - 1)];
    start.kind = 'start';
    this.computeFlowTile(start.cx, start.cy);
    let far = null, fd = -1;
    for (const r of this.rooms) {
      const v = this.dist[this.idx(r.cx, r.cy)];
      if (v !== 65535 && v > fd) { fd = v; far = r; }
    }
    far.kind = 'stairs';
    this.start = { x: this.tw(start.cx), z: this.tw(start.cy) };
    this.stairs = { x: this.tw(far.cx), z: this.tw(far.cy) };
    // butikken til far
    const shopChance = this.depth === 1 ? 1 : 0.55;
    if (this.rng() < shopChance) {
      const mids = this.rooms
        .filter(r => !r.kind)
        .map(r => ({ r, v: this.dist[this.idx(r.cx, r.cy)] }))
        .filter(o => o.v !== 65535)
        .sort((a, b) => a.v - b.v);
      if (mids.length) {
        const o = this.depth === 1 ? mids[0] : mids[Math.floor(mids.length / 2)];
        o.r.kind = 'shop';
        this.shop = { x: this.tw(o.r.cx), z: this.tw(o.r.cy) - 0.6 };
      }
    }
    for (const r of this.rooms) this.decorateRoom(r);
    this.placeSecrets();
  }

  // Gjemmesteder i veggene (Finna dolda ting) og en runestein i dvergehallene
  placeSecrets() {
    const rooms = this.rooms.filter(r => r.kind !== 'start' && r.kind !== 'shop');
    const n = 1 + (this.depth > 2 ? 1 : 0) + (this.rng() < 0.5 ? 1 : 0);
    for (let k = 0; k < n && rooms.length; k++) {
      const r = rooms.splice(Math.floor(this.rng() * rooms.length), 1)[0];
      const spots = [];
      for (let j = r.y; j < r.y + r.h; j++) for (let i = r.x; i < r.x + r.w; i++) {
        if (this.get(i, j) !== FLOOR) continue;
        if (this.get(i, j - 1) === WALL) spots.push({ i, j, nx: 0, nz: -1 });
        else if (this.get(i - 1, j) === WALL) spots.push({ i, j, nx: -1, nz: 0 });
      }
      if (!spots.length) continue;
      const sp = spots[Math.floor(this.rng() * spots.length)];
      this.cacheList.push({ x: this.tw(sp.i) + sp.nx * 0.7, z: this.tw(sp.j) + sp.nz * 0.7, nx: sp.nx, nz: sp.nz });
    }
    if (this.biome === 'dverg') {
      const cand = this.rooms.filter(r => !r.kind && r.w >= 6 && r.h >= 6);
      if (cand.length) {
        const r = cand[Math.floor(this.rng() * cand.length)];
        let i = r.cx + 1, j = r.cy - 1;
        if (this.get(i, j) !== FLOOR) { i = r.cx; j = r.cy; }
        if (this.get(i, j) === FLOOR) this.runeStone = { x: this.tw(i), z: this.tw(j) };
      }
    }
  }

  // Korteste vei mellom to punkter (for Skattjägare). Returnerer punkter i verden.
  path(ax, az, bx, bz) {
    const { W, H } = this;
    if (!this.pd) { this.pd = new Uint16Array(W * H); this.pq = new Int32Array(W * H); }
    const dist = this.pd, queue = this.pq;
    dist.fill(65535);
    const sx = Math.floor(bx / T), sy = Math.floor(bz / T);
    if (!this.open(sx, sy)) return [];
    let head = 0, tail = 0;
    dist[this.idx(sx, sy)] = 0;
    queue[tail++] = this.idx(sx, sy);
    while (head < tail) {
      const c = queue[head++];
      const cx = c % W, cy = (c - cx) / W;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = cx + dx, ny = cy + dy;
        if (!this.open(nx, ny)) continue;
        const ni = ny * W + nx;
        if (dist[ni] > dist[c] + 1) { dist[ni] = dist[c] + 1; queue[tail++] = ni; }
      }
    }
    let x = Math.floor(ax / T), y = Math.floor(az / T);
    const out = [];
    for (let guard = 0; guard < W * H && dist[this.idx(x, y)] > 0; guard++) {
      let bxn = x, byn = y, best = dist[this.idx(x, y)];
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy;
        if (!this.open(nx, ny)) continue;
        const v = dist[this.idx(nx, ny)];
        if (v < best) { best = v; bxn = nx; byn = ny; }
      }
      if (bxn === x && byn === y) break;
      x = bxn; y = byn;
      out.push({ x: this.tw(x), z: this.tw(y) });
    }
    void H;
    return out;
  }

  genBoss() {
    const start = { x: 4, y: 20, w: 7, h: 7 };
    const arena = { x: 17, y: 12, w: 21, h: 21 };
    start.cx = start.x + 3; start.cy = start.y + 3; start.kind = 'start';
    arena.cx = arena.x + 10; arena.cy = arena.y + 10; arena.kind = 'boss';
    this.rooms.push(start, arena);
    this.carveRect(start.x, start.y, start.w, start.h);
    this.carveRect(arena.x, arena.y, arena.w, arena.h);
    // rund arena
    for (let j = arena.y; j < arena.y + arena.h; j++) for (let i = arena.x; i < arena.x + arena.w; i++) {
      if (Math.hypot(i - arena.cx, j - arena.cy) > 11.6) this.set(i, j, WALL);
    }
    this.corridor(start, arena);
    // søyler i ring
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2 + Math.PI / 8;
      const x = Math.round(arena.cx + Math.cos(a) * 6.5), y = Math.round(arena.cy + Math.sin(a) * 6.5);
      this.set(x, y, PILLAR);
    }
    this.start = { x: this.tw(start.cx), z: this.tw(start.cy) };
    this.bossSpawn = { x: this.tw(arena.cx), z: this.tw(arena.cy) };
    this.decorateRoom(start);
    this.decorateRoom(arena);
  }

  decorateRoom(r) {
    const { x, y, w, h } = r;
    const biome = this.biome;
    const isSpecial = r.kind === 'start' || r.kind === 'stairs' || r.kind === 'shop';
    // vannkanal (kloakk)
    if (biome === 'kloakk' && !isSpecial && r.kind !== 'boss' && (w >= 6 || h >= 6) && this.rng() < 0.7) {
      if (w >= h) {
        const cy = y + Math.floor(h / 2) - (this.rng() < 0.5 ? 2 : -1);
        for (let i = x; i < x + w; i++) for (let j = cy; j < cy + 2; j++) if (this.get(i, j) === FLOOR) this.set(i, j, WATER);
      } else {
        const cx = x + Math.floor(w / 2) - (this.rng() < 0.5 ? 2 : -1);
        for (let j = y; j < y + h; j++) for (let i = cx; i < cx + 2; i++) if (this.get(i, j) === FLOOR) this.set(i, j, WATER);
      }
    }
    // søyler
    const pillarChance = biome === 'dverg' ? 0.85 : 0.45;
    if (r.kind !== 'boss' && w >= 9 && h >= 9 && this.rng() < pillarChance) {
      for (const [px, py] of [[x + 2, y + 2], [x + w - 3, y + 2], [x + 2, y + h - 3], [x + w - 3, y + h - 3]]) {
        if (this.get(px, py) === FLOOR) this.set(px, py, PILLAR);
      }
    }
    // fakler på høye vegger (nord og vest for rommet, de vender mot kameraet)
    const torchColor = (alt) => (alt ? this.info.alt : this.info.torch);
    const step = r.kind === 'boss' ? 3 : 4;
    let placed = 0;
    for (let i = x + 1; i < x + w - 1; i += step) {
      if (this.tallWall(i, y - 1) && this.open(i, y)) {
        this.torches.push({ x: this.tw(i), z: y * T + 0.12, nx: 0, nz: 1, color: torchColor(biome === 'kloakk' && this.rng() < 0.35) });
        placed++;
      }
    }
    for (let j = y + 1; j < y + h - 1; j += step) {
      if (this.tallWall(x - 1, j) && this.open(x, j)) {
        this.torches.push({ x: x * T + 0.12, z: this.tw(j), nx: 1, nz: 0, color: torchColor(biome === 'kloakk' && this.rng() < 0.35) });
        placed++;
      }
    }
    // fyrfat
    if ((biome !== 'kloakk' || placed === 0) && r.kind !== 'stairs' && r.kind !== 'shop' && r.kind !== 'start') {
      if (r.kind === 'boss') {
        for (const [ox, oy] of [[-5, -5], [5, -5], [-5, 5], [5, 5]]) this.braziers.push({ x: this.tw(r.cx + ox), z: this.tw(r.cy + oy) });
      } else if (this.rng() < 0.6 && this.get(r.cx, r.cy) === FLOOR) {
        const bx = r.cx + (this.rng() < 0.5 ? -1 : 1), by = r.cy;
        if (this.get(bx, by) === FLOOR) this.braziers.push({ x: this.tw(bx) , z: this.tw(by) });
      }
    }
    if (r.kind === 'boss') return;
    // tønner og kasser langs veggene
    const nearWall = [];
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) {
      if (this.get(i, j) !== FLOOR) continue;
      if (Math.abs(i - r.cx) <= 1 && Math.abs(j - r.cy) <= 1) continue;
      const wallN = !this.open(i - 1, j) || !this.open(i + 1, j) || !this.open(i, j - 1) || !this.open(i, j + 1);
      if (wallN) nearWall.push([i, j]);
    }
    const nProps = r.kind === 'start' ? 1 : this.rnd(1, 3);
    for (let k = 0; k < nProps && nearWall.length; k++) {
      const [i, j] = nearWall.splice(Math.floor(this.rng() * nearWall.length), 1)[0];
      this.propList.push({ type: this.rng() < 0.55 ? 'barrel' : 'crate', x: this.tw(i) + (this.rng() - 0.5) * 0.6, z: this.tw(j) + (this.rng() - 0.5) * 0.6 });
    }
    if (!isSpecial && this.rng() < 0.3 && nearWall.length) {
      const [i, j] = nearWall.splice(Math.floor(this.rng() * nearWall.length), 1)[0];
      this.chestList.push({ x: this.tw(i), z: this.tw(j), locked: this.rng() < (this.depth > 1 ? 0.4 : 0.25) });
    }
    // bein og hodeskaller
    for (let k = 0; k < this.rnd(2, 6); k++) {
      const i = this.rnd(x, x + w - 1), j = this.rnd(y, y + h - 1);
      if (this.get(i, j) === FLOOR) this.decor.push({ x: this.tw(i) + (this.rng() - 0.5) * 1.6, z: this.tw(j) + (this.rng() - 0.5) * 1.6, rot: this.rng() * 6.28, kind: this.rng() < 0.3 ? 'skull' : 'bone' });
    }
    // fiender
    if (r.kind === 'start' || r.kind === 'shop') return;
    const table = ENEMY_TABLE[Math.min(4, this.depth)];
    const total = table.reduce((s, e) => s + e[1], 0);
    const count = this.rnd(2, 4) + Math.floor(this.depth / 2);
    for (let k = 0; k < count; k++) {
      let roll = this.rng() * total, type = table[0][0];
      for (const [t, wgt] of table) { if ((roll -= wgt) <= 0) { type = t; break; } }
      for (let a = 0; a < 10; a++) {
        const i = this.rnd(x + 1, x + w - 2), j = this.rnd(y + 1, y + h - 2);
        if (this.get(i, j) === FLOOR) {
          this.spawnList.push({ type, x: this.tw(i), z: this.tw(j) });
          // rotter kommer i flokk
          if (type === 'rat' && this.rng() < 0.6) this.spawnList.push({ type, x: this.tw(i) + 0.8, z: this.tw(j) + 0.5 });
          break;
        }
      }
    }
  }

  // --- spørringer -------------------------------------------------------

  tileOf(v) {
    return Math.floor(v / T);
  }
  solid(tx, ty) {
    const v = this.get(tx, ty);
    return v === WALL || v === PILLAR;
  }
  isWater(wx, wz) {
    return this.get(Math.floor(wx / T), Math.floor(wz / T)) === WATER;
  }
  walkable(wx, wz) {
    return this.open(Math.floor(wx / T), Math.floor(wz / T));
  }

  collide(p, r) {
    let hit = false;
    for (let it = 0; it < 2; it++) {
      const tx0 = Math.floor((p.x - r) / T), tx1 = Math.floor((p.x + r) / T);
      const tz0 = Math.floor((p.z - r) / T), tz1 = Math.floor((p.z + r) / T);
      for (let tz = tz0; tz <= tz1; tz++) for (let tx = tx0; tx <= tx1; tx++) {
        const v = this.get(tx, tz);
        if (v === PILLAR) {
          const cx = (tx + 0.5) * T, cz = (tz + 0.5) * T;
          const dx = p.x - cx, dz = p.z - cz;
          const dd = Math.hypot(dx, dz), rr = r + 0.62;
          if (dd < rr && dd > 1e-5) { p.x += (dx / dd) * (rr - dd); p.z += (dz / dd) * (rr - dd); hit = true; }
        } else if (v === WALL) {
          const cx = Math.max(tx * T, Math.min(p.x, (tx + 1) * T));
          const cz = Math.max(tz * T, Math.min(p.z, (tz + 1) * T));
          const dx = p.x - cx, dz = p.z - cz;
          const d2 = dx * dx + dz * dz;
          if (d2 < r * r) {
            if (d2 > 1e-8) {
              const dd = Math.sqrt(d2);
              p.x += (dx / dd) * (r - dd);
              p.z += (dz / dd) * (r - dd);
            } else {
              // sentrum inne i flisen: skyv ut langs korteste akse
              const l = p.x - tx * T, rgt = (tx + 1) * T - p.x, u = p.z - tz * T, dn = (tz + 1) * T - p.z;
              const m = Math.min(l, rgt, u, dn);
              if (m === l) p.x -= l + r; else if (m === rgt) p.x += rgt + r; else if (m === u) p.z -= u + r; else p.z += dn + r;
            }
            hit = true;
          }
        }
      }
    }
    return hit;
  }

  los(ax, az, bx, bz) {
    const dx = bx - ax, dz = bz - az;
    const len = Math.hypot(dx, dz);
    const steps = Math.ceil(len / 0.5);
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      if (this.get(Math.floor((ax + dx * t) / T), Math.floor((az + dz * t) / T)) === WALL) return false;
    }
    return true;
  }

  computeFlowTile(sx, sy) {
    const { W, dist, queue } = this;
    dist.fill(65535);
    if (!this.open(sx, sy)) return;
    let head = 0, tail = 0;
    const s = this.idx(sx, sy);
    dist[s] = 0;
    queue[tail++] = s;
    while (head < tail) {
      const c = queue[head++];
      const cx = c % W, cy = (c - cx) / W;
      const nd = dist[c] + 1;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dy) continue;
        const nx = cx + dx, ny = cy + dy;
        if (!this.open(nx, ny)) continue;
        if (dx && dy && (!this.open(cx + dx, cy) || !this.open(cx, cy + dy))) continue;
        const ni = ny * W + nx;
        if (dist[ni] > nd) { dist[ni] = nd; queue[tail++] = ni; }
      }
    }
  }

  computeFlow(wx, wz) {
    this.computeFlowTile(Math.floor(wx / T), Math.floor(wz / T));
  }

  flowDir(wx, wz, out) {
    const tx = Math.floor(wx / T), ty = Math.floor(wz / T);
    let best = this.dist[this.idx(tx, ty)] ?? 65535, bx = tx, by = ty;
    if (!this.open(tx, ty)) best = 65535;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue;
      const nx = tx + dx, ny = ty + dy;
      if (!this.open(nx, ny)) continue;
      if (dx && dy && (!this.open(tx + dx, ty) || !this.open(tx, ty + dy))) continue;
      const v = this.dist[this.idx(nx, ny)];
      if (v < best) { best = v; bx = nx; by = ny; }
    }
    if (bx === tx && by === ty) return false;
    out.set((bx + 0.5) * T - wx, 0, (by + 0.5) * T - wz).normalize();
    return true;
  }

  reveal(wx, wz, R) {
    const tx = Math.floor(wx / T), ty = Math.floor(wz / T);
    for (let j = -R; j <= R; j++) for (let i = -R; i <= R; i++) {
      if (i * i + j * j > R * R) continue;
      const x = tx + i, y = ty + j;
      if (x < 0 || y < 0 || x >= this.W || y >= this.H) continue;
      this.explored[this.idx(x, y)] = 1;
    }
  }

  // --- geometri ---------------------------------------------------------

  build(assets) {
    const B = assets.biome(this.biome);
    const isWall = (x, y) => this.get(x, y) === WALL;
    const anyOpen8 = (x, y) => {
      for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) if ((i || j) && this.get(x + i, y + j) !== WALL) return true;
      return false;
    };
    const built = new Uint8Array(this.W * this.H);
    const height = new Float32Array(this.W * this.H);
    for (let y = 0; y < this.H; y++) for (let x = 0; x < this.W; x++) {
      if (!isWall(x, y) || !anyOpen8(x, y)) continue;
      built[this.idx(x, y)] = 1;
      // vegg mellom gulv og kamera (kamera står mot +x,+z) blir lav
      const nearCam = this.get(x - 1, y) !== WALL || this.get(x, y - 1) !== WALL || this.get(x - 1, y - 1) !== WALL;
      height[this.idx(x, y)] = nearCam ? LOW : TALL;
    }
    const bW = new GeoBuilder(), bC = new GeoBuilder(), bF = new GeoBuilder(), bS = new GeoBuilder(), bWater = new GeoBuilder();
    // bakt omgivelsesskygge: mørkere nær vegger og søyler, litt tilfeldig variasjon
    const aoCache = new Map();
    const ao = (wx, wz) => {
      const key = wx * 1000 + wz;
      if (aoCache.has(key)) return aoCache.get(key);
      const tx = Math.floor(wx / T - 0.001), tz = Math.floor(wz / T - 0.001);
      let dmin = 9;
      for (let j = -2; j <= 3; j++) for (let i = -2; i <= 3; i++) {
        const v = this.get(tx + i, tz + j);
        if (v === WALL) {
          const cx = Math.max((tx + i) * T, Math.min(wx, (tx + i + 1) * T));
          const cz = Math.max((tz + j) * T, Math.min(wz, (tz + j + 1) * T));
          dmin = Math.min(dmin, Math.hypot(wx - cx, wz - cz));
        } else if (v === PILLAR) {
          dmin = Math.min(dmin, Math.max(0, Math.hypot(wx - (tx + i + 0.5) * T, wz - (tz + j + 0.5) * T) - 0.7));
        }
      }
      const t = Math.min(1, dmin / 1.8);
      const h = Math.sin(wx * 12.9898 + wz * 78.233) * 43758.5453;
      const r = (0.42 + 0.58 * t * t * (3 - 2 * t)) * (0.93 + 0.14 * (h - Math.floor(h)));
      aoCache.set(key, r);
      return r;
    };
    const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    for (let y = 0; y < this.H; y++) for (let x = 0; x < this.W; x++) {
      const v = this.get(x, y);
      const x0 = x * T, x1 = (x + 1) * T, z0 = y * T, z1 = (y + 1) * T;
      if (v === FLOOR || v === PILLAR) {
        bF.floorTile(x0, z0, x1, z1, 0, ao);
      } else if (v === WATER) {
        bS.quadUp(x0, z0, x1, z1, WATER_BOTTOM, [0.35, 0.35, 0.35, 0.35]);
        bWater.quadUp(x0, z0, x1, z1, WATER_Y);
        for (const [dx, dy] of dirs) {
          if (this.get(x + dx, y + dy) === WATER) continue;
          bS.wallFace(x, y, dx, dy, WATER_BOTTOM, 0, true, 0.25, 0.8);
        }
      } else if (built[this.idx(x, y)]) {
        const h = height[this.idx(x, y)];
        bC.quadUp(x0, z0, x1, z1, h);
        for (const [dx, dy] of dirs) {
          const nx = x + dx, ny = y + dy;
          const nOpen = this.get(nx, ny) !== WALL;
          const nh = nOpen ? 0 : built[this.idx(nx, ny)] ? height[this.idx(nx, ny)] : 0;
          if (nh >= h) continue;
          if (nOpen) bW.wallFace(x, y, dx, dy, nh, h, false, h > 2 ? 0.45 : 0.55, h > 2 ? 1.05 : 0.85);
          else bC.wallFace(x, y, dx, dy, nh, h, false);
        }
      }
    }
    const add = (b, m, cast = true, recv = true) => {
      const mesh = new THREE.Mesh(b.geometry(), m);
      mesh.castShadow = cast;
      mesh.receiveShadow = recv;
      this.group.add(mesh);
      return mesh;
    };
    add(bF, B.floorMat, false, true);
    add(bW, B.wallMat, true, true);
    add(bC, B.capMat, true, false);
    if (bS.pos.length) add(bS, B.sideMat, false, true);
    if (bWater.pos.length) {
      this.waterMat = makeWaterMaterial();
      const wm = add(bWater, this.waterMat, false, false);
      wm.renderOrder = 2;
    }
    // søyler
    for (let y = 0; y < this.H; y++) for (let x = 0; x < this.W; x++) {
      if (this.get(x, y) !== PILLAR) continue;
      const p = buildPillar(B.pillarMat);
      p.position.set(this.tw(x), 0, this.tw(y));
      p.traverse(o => { if (o.isMesh) o.castShadow = true; });
      this.group.add(p);
    }
    this.buildDecor();
    G.scene.add(this.group);
  }

  buildDecor() {
    const boneMat = new THREE.MeshStandardMaterial({ color: 0xcfc4a6, roughness: 0.9 });
    const boneGeo = new THREE.CapsuleGeometry(0.035, 0.4, 2, 6);
    const skullGeo = new THREE.SphereGeometry(0.13, 10, 8);
    const bones = this.decor.filter(d => d.kind === 'bone');
    const skulls = this.decor.filter(d => d.kind === 'skull');
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), s = new THREE.Vector3(1, 1, 1), p = new THREE.Vector3();
    if (bones.length) {
      const im = new THREE.InstancedMesh(boneGeo, boneMat, bones.length * 2);
      bones.forEach((b, i) => {
        for (let k = 0; k < 2; k++) {
          e.set(Math.PI / 2, 0, b.rot + k * 1.2);
          q.setFromEuler(e);
          p.set(b.x + k * 0.15, 0.04, b.z + k * 0.1);
          m4.compose(p, q, s);
          im.setMatrixAt(i * 2 + k, m4);
        }
      });
      im.receiveShadow = true;
      this.group.add(im);
    }
    if (skulls.length) {
      const im = new THREE.InstancedMesh(skullGeo, boneMat, skulls.length);
      skulls.forEach((b, i) => {
        e.set(0.3, b.rot, 0);
        q.setFromEuler(e);
        p.set(b.x, 0.1, b.z);
        m4.compose(p, q, s);
        im.setMatrixAt(i, m4);
      });
      im.castShadow = true;
      this.group.add(im);
    }
  }

  dispose() {
    G.scene.remove(this.group);
    this.group.traverse(o => {
      if (o.isMesh || o.isInstancedMesh) {
        o.geometry?.dispose?.();
      }
    });
  }
}

// Bygger sammenslått geometri med UV i verdenskoordinater
class GeoBuilder {
  constructor() {
    this.pos = [];
    this.nrm = [];
    this.uv = [];
    this.uv1 = [];
    this.col = [];
    this.idx = [];
  }
  _quad(p, n, uvs, cols = null) {
    const base = this.pos.length / 3;
    for (let i = 0; i < 4; i++) {
      this.pos.push(p[i][0], p[i][1], p[i][2]);
      this.nrm.push(n[0], n[1], n[2]);
      this.uv.push(uvs[i][0], uvs[i][1]);
      this.uv1.push(p[i][0] / 14, p[i][2] / 14);
      const c = cols ? cols[i] : 1;
      this.col.push(c, c, c);
    }
    // sjekk vinding mot normalen
    const ax = p[1][0] - p[0][0], ay = p[1][1] - p[0][1], az = p[1][2] - p[0][2];
    const bx = p[2][0] - p[0][0], by = p[2][1] - p[0][1], bz = p[2][2] - p[0][2];
    const cx = ay * bz - az * by, cy = az * bx - ax * bz, cz = ax * by - ay * bx;
    if (cx * n[0] + cy * n[1] + cz * n[2] >= 0) this.idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
    else this.idx.push(base, base + 2, base + 1, base, base + 3, base + 2);
  }
  quadUp(x0, z0, x1, z1, y, cols = null) {
    const s = 0.34;
    this._quad(
      [[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]],
      [0, 1, 0],
      [[x0 * s, -z0 * s], [x1 * s, -z0 * s], [x1 * s, -z1 * s], [x0 * s, -z1 * s]],
      cols
    );
  }
  // gulvflis delt i 2x2 med bakt AO i hjørnene
  floorTile(x0, z0, x1, z1, y, ao) {
    const xm = (x0 + x1) / 2, zm = (z0 + z1) / 2;
    for (const [a0, b0, a1, b1] of [[x0, z0, xm, zm], [xm, z0, x1, zm], [x0, zm, xm, z1], [xm, zm, x1, z1]]) {
      this.quadUp(a0, b0, a1, b1, y, [ao(a0, b0), ao(a1, b0), ao(a1, b1), ao(a0, b1)]);
    }
  }
  // flate på kanten av flis (tx,ty) mot nabo (dx,dy). inward: vender inn i flisen
  wallFace(tx, ty, dx, dy, y0, y1, inward, c0 = 1, c1 = 1) {
    const s = 0.25;
    const sign = inward ? -1 : 1;
    const cols = [c0, c0, c1, c1];
    if (dx !== 0) {
      const x = dx > 0 ? (tx + 1) * T : tx * T;
      const z0 = ty * T, z1 = (ty + 1) * T;
      this._quad(
        [[x, y0, z0], [x, y0, z1], [x, y1, z1], [x, y1, z0]],
        [dx * sign, 0, 0],
        [[z0 * s, y0 * s], [z1 * s, y0 * s], [z1 * s, y1 * s], [z0 * s, y1 * s]],
        cols
      );
    } else {
      const z = dy > 0 ? (ty + 1) * T : ty * T;
      const x0 = tx * T, x1 = (tx + 1) * T;
      this._quad(
        [[x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z]],
        [0, 0, dy * sign],
        [[x0 * s, y0 * s], [x1 * s, y0 * s], [x1 * s, y1 * s], [x0 * s, y1 * s]],
        cols
      );
    }
  }
  geometry() {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.pos, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(this.nrm, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(this.uv, 2));
    g.setAttribute('uv1', new THREE.Float32BufferAttribute(this.uv1, 2));
    g.setAttribute('color', new THREE.Float32BufferAttribute(this.col, 3));
    g.setIndex(this.idx);
    g.computeBoundingSphere();
    return g;
  }
}

export function makeWaterMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uTime: { value: 0 },
      uPlayer: { value: new THREE.Vector3() },
      uDeep: { value: new THREE.Color(0x041a15) },
      uShallow: { value: new THREE.Color(0x0f4436) },
      uGlint: { value: new THREE.Color(0x4fe6b4) },
    },
    vertexShader: `varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position,1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: `
      uniform float uTime; uniform vec3 uPlayer, uDeep, uShallow, uGlint; varying vec3 vW;
      float h(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
      float n(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
        return mix(mix(h(i),h(i+vec2(1,0)),f.x), mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x), f.y); }
      void main(){
        vec2 p = vW.xz;
        float a = n(p*0.7 + vec2(uTime*0.18, uTime*0.06));
        float b = n(p*1.9 - vec2(uTime*0.11, -uTime*0.15));
        float m = a*0.6 + b*0.4;
        float caust = pow(1.0 - abs(m*2.0-1.0), 7.0);
        vec3 col = mix(uDeep, uShallow, m) + uGlint * caust * 0.55;
        float pd = distance(p, uPlayer.xz);
        col += vec3(0.32,0.22,0.12) * smoothstep(8.0, 0.0, pd) * (0.25 + caust*0.8);
        gl_FragColor = vec4(col, 0.9);
      }`,
  });
}
