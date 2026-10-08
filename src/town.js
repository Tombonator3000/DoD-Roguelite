// Fristaden over bakken: en by i Ultima-stil med bindingsverkshus, soltempel,
// elv med bruer, bymur med port og tak som løftes bort når du går inn.
import * as THREE from 'three';
import { G, T } from './state.js';
import { Dungeon, makeWaterMaterial } from './dungeon.js';
import { addWetness, addSway } from './wet.js';
import { addCutaway, buildBarrel, buildCrate, buildChest, buildPillar, hash2 } from './assets.js';
import { townTextures, signTexture } from './towntex.js';
import { WALL, FLOOR, WATER, PILLAR, HOUSE, FENCE, GR, TW, TH, RING, RIVER, GATE, BUILDINGS, TREES, SPOTS, buildTownLayout } from './townmap.js';
import { TownLife } from './townfolk.js';
import { shaftMaterial } from './gfx.js';

export { HOUSE, FENCE, GR, SPOTS };

const HT = 0.2; // halv veggtykkelse
const FT = 0.07; // halv gjerdetykkelse
const STUB = 0.2; // dørkarm stikker så langt inn i dørflisa (døråpning 1,6 m)
const LOWH = 0.9;
const CITY_TALL = 4.4, CITY_LOW = 1.15, TOWER_H = 6.4;
const WATER_BOTTOM = -0.75, WATER_Y = -0.24;
const OV = 0.45; // takutstikk
const U = v => v * T;

const MAT = {};

// --- geometribygger med RGB-farger -------------------------------------------------
class Mesher {
  constructor() { this.p = []; this.n = []; this.uv = []; this.c = []; this.i = []; }
  get empty() { return this.p.length === 0; }
  quad(P, N, UV, C) {
    const base = this.p.length / 3;
    for (let k = 0; k < 4; k++) {
      this.p.push(P[k][0], P[k][1], P[k][2]);
      this.n.push(N[0], N[1], N[2]);
      this.uv.push(UV[k][0], UV[k][1]);
      const c = Array.isArray(C[0]) ? C[k] : C;
      this.c.push(c[0], c[1], c[2]);
    }
    const ax = P[1][0] - P[0][0], ay = P[1][1] - P[0][1], az = P[1][2] - P[0][2];
    const bx = P[2][0] - P[0][0], by = P[2][1] - P[0][1], bz = P[2][2] - P[0][2];
    const cx = ay * bz - az * by, cy = az * bx - ax * bz, cz = ax * by - ay * bx;
    if (cx * N[0] + cy * N[1] + cz * N[2] >= 0) this.i.push(base, base + 1, base + 2, base, base + 2, base + 3);
    else this.i.push(base, base + 2, base + 1, base, base + 3, base + 2);
  }
  tri(P, N, UV, C) {
    const base = this.p.length / 3;
    for (let k = 0; k < 3; k++) {
      this.p.push(P[k][0], P[k][1], P[k][2]);
      this.n.push(N[0], N[1], N[2]);
      this.uv.push(UV[k][0], UV[k][1]);
      const c = Array.isArray(C[0]) ? C[k] : C;
      this.c.push(c[0], c[1], c[2]);
    }
    const ax = P[1][0] - P[0][0], ay = P[1][1] - P[0][1], az = P[1][2] - P[0][2];
    const bx = P[2][0] - P[0][0], by = P[2][1] - P[0][1], bz = P[2][2] - P[0][2];
    const cx = ay * bz - az * by, cy = az * bx - ax * bz, cz = ax * by - ay * bx;
    if (cx * N[0] + cy * N[1] + cz * N[2] >= 0) this.i.push(base, base + 1, base + 2);
    else this.i.push(base, base + 2, base + 1);
  }
  // Boks med valgfrie flater. o.uv: 'wall' (u langs veggen, v = y/vs) eller 'world' (skala us)
  box(x0, y0, z0, x1, y1, z1, o = {}) {
    const sk = o.skip || {};
    const col = o.col || [1, 1, 1];
    const us = o.us || T, vs = o.vs || 2.8;
    const ao = o.ao ? (y => { const t = Math.min(1, Math.max(0, y / 1.6)); return 0.66 + 0.34 * t * t * (3 - 2 * t); }) : () => 1;
    const C = y => [col[0] * ao(y), col[1] * ao(y), col[2] * ao(y)];
    const world = o.uv === 'world';
    const uvX = (z, y) => world ? [z / us, y / us] : [z / us, y / vs];
    const uvZ = (x, y) => world ? [x / us, y / us] : [x / us, y / vs];
    if (!sk.px) this.quad([[x1, y0, z0], [x1, y0, z1], [x1, y1, z1], [x1, y1, z0]], [1, 0, 0], [uvX(z0, y0), uvX(z1, y0), uvX(z1, y1), uvX(z0, y1)], [C(y0), C(y0), C(y1), C(y1)]);
    if (!sk.nx) this.quad([[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]], [-1, 0, 0], [uvX(z0, y0), uvX(z1, y0), uvX(z1, y1), uvX(z0, y1)], [C(y0), C(y0), C(y1), C(y1)]);
    if (!sk.pz) this.quad([[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], [0, 0, 1], [uvZ(x0, y0), uvZ(x1, y0), uvZ(x1, y1), uvZ(x0, y1)], [C(y0), C(y0), C(y1), C(y1)]);
    if (!sk.nz) this.quad([[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0]], [0, 0, -1], [uvZ(x0, y0), uvZ(x1, y0), uvZ(x1, y1), uvZ(x0, y1)], [C(y0), C(y0), C(y1), C(y1)]);
    if (!sk.py) {
      const tv = o.topV;
      const uvT = (x, z) => (tv != null ? [x / us, tv] : [x / us, -z / us]);
      const ct = o.colTop || C(y1);
      this.quad([[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]], [0, 1, 0], [uvT(x0, z0), uvT(x1, z0), uvT(x1, z1), uvT(x0, z1)], ct);
    }
    if (o.bottom) this.quad([[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]], [0, -1, 0], [[0, 0], [1, 0], [1, 1], [0, 1]], C(y0));
  }
  quadUp(x0, z0, x1, z1, y, cols, s = 0.34, rot = false) {
    const uv = (x, z) => (rot ? [z * s, x * s] : [x * s, -z * s]);
    this.quad([[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]], [0, 1, 0], [uv(x0, z0), uv(x1, z0), uv(x1, z1), uv(x0, z1)], cols);
  }
  geometry() {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.p, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(this.n, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(this.uv, 2));
    g.setAttribute('color', new THREE.Float32BufferAttribute(this.c, 3));
    g.setIndex(this.i);
    g.computeBoundingSphere();
    return g;
  }
}

const hex = h => { const c = new THREE.Color(h); return [c.r, c.g, c.b]; };
const lerp = (a, b, t) => a + (b - a) * t;

function stdMat(o, cut = true) {
  const m = new THREE.MeshStandardMaterial(o);
  if (cut) addCutaway(m);
  return m;
}

function materials() {
  if (MAT.ready) return MAT;
  const TX = townTextures();
  MAT.timber = stdMat({ map: TX.timber.map, normalMap: TX.timber.normalMap, roughness: 0.92, vertexColors: true });
  MAT.stone = stdMat({ map: TX.stone.map, normalMap: TX.stone.normalMap, roughness: 0.9, vertexColors: true });
  MAT.stonePlain = stdMat({ map: TX.stone.map, normalMap: TX.stone.normalMap, roughness: 0.9, color: 0xc8c0b4 });
  MAT.pillar = stdMat({ map: TX.stone.map, normalMap: TX.stone.normalMap, roughness: 0.85, color: 0xf0e4c8 });
  MAT.city = stdMat({ map: TX.city.map, normalMap: TX.city.normalMap, roughness: 0.92, vertexColors: true });
  MAT.ground = {
    [GR.COBBLE]: stdMat({ map: TX.cobble.map, normalMap: TX.cobble.normalMap, roughness: 0.85, vertexColors: true }, false),
    [GR.DIRT]: stdMat({ map: TX.dirt.map, normalMap: TX.dirt.normalMap, roughness: 1, vertexColors: true }, false),
    [GR.GRASS]: stdMat({ map: TX.grass.map, normalMap: TX.grass.normalMap, roughness: 1, vertexColors: true }, false),
    [GR.WOOD]: stdMat({ map: TX.planks.map, normalMap: TX.planks.normalMap, roughness: 0.75, vertexColors: true }, false),
    [GR.FLAG]: stdMat({ map: TX.flag.map, normalMap: TX.flag.normalMap, roughness: 0.7, vertexColors: true }, false),
  };
  MAT.plank = stdMat({ map: TX.planks.map, normalMap: TX.planks.normalMap, roughness: 0.85, vertexColors: true, color: 0xb8a890 }, false);
  MAT.wood = stdMat({ map: TX.planks.map, roughness: 0.8, vertexColors: true }, false);
  MAT.cloth = stdMat({ roughness: 0.95, vertexColors: true }, false);
  MAT.paint = stdMat({ roughness: 0.7, vertexColors: true }, false);
  MAT.iron = stdMat({ color: 0x2a2a2e, roughness: 0.45, metalness: 0.85, vertexColors: true }, false);
  MAT.gold = new THREE.MeshStandardMaterial({ color: 0xd8a840, roughness: 0.25, metalness: 1, emissive: 0x8a5a10, emissiveIntensity: 0.5 });
  MAT.glass = new THREE.MeshStandardMaterial({ color: 0x1a2028, roughness: 0.2, metalness: 0.3, emissive: 0xffa850, emissiveIntensity: 0.1, vertexColors: true });
  MAT.glassIn = new THREE.MeshStandardMaterial({ color: 0x2a3444, roughness: 0.3, metalness: 0.2, emissive: 0x3a5070, emissiveIntensity: 0.4 });
  MAT.lampGlass = new THREE.MeshStandardMaterial({ color: 0x302010, emissive: 0xffb860, emissiveIntensity: 0.2 });
  MAT.coal = new THREE.MeshStandardMaterial({ color: 0x1a0a04, emissive: 0xff5a10, emissiveIntensity: 1.6, roughness: 0.9 });
  MAT.outside = new THREE.MeshStandardMaterial({ map: TX.grass.map, roughness: 1, color: 0x9aa884 });
  MAT.field = new THREE.MeshStandardMaterial({ map: TX.dirt.map, roughness: 1, color: 0xa08a6a });
  MAT.leaf = stdMat({ roughness: 0.85, flatShading: true });
  MAT.bark = stdMat({ color: 0x4a3424, roughness: 0.95 });
  MAT.tuft = new THREE.MeshStandardMaterial({ map: TX.tuft, alphaTest: 0.45, side: THREE.DoubleSide, roughness: 1 });
  MAT.flower = new THREE.MeshStandardMaterial({ roughness: 0.6 });
  MAT.paper = new THREE.MeshStandardMaterial({ color: 0xe8dcc0, roughness: 0.95 });
  MAT.roofs = {};
  // regn: bakken blir blank og får pytter, vegger og treverk blir mørkere
  addWetness(MAT.ground[GR.COBBLE]);
  addWetness(MAT.ground[GR.DIRT], { k: 0.9 });
  addWetness(MAT.ground[GR.FLAG]);
  addWetness(MAT.ground[GR.GRASS], { puddles: false, k: 0.45 });
  addWetness(MAT.ground[GR.WOOD], { puddles: false, k: 0.8 });
  addWetness(MAT.plank, { puddles: false, k: 0.8 });
  addWetness(MAT.stone, { puddles: false, k: 0.5 });
  addWetness(MAT.timber, { puddles: false, k: 0.4 });
  addWetness(MAT.city, { puddles: false, k: 0.5 });
  // vind i gress, blomster og trekroner
  addSway(MAT.tuft, 'grass');
  addSway(MAT.flower, 'flower');
  addSway(MAT.leaf, 'leaf');
  MAT.ready = true;
  return MAT;
}

// Takmaterialer per bygning (de tones ut hver for seg)
function roofMats(b) {
  if (MAT.roofs[b.id]) return MAT.roofs[b.id];
  const TX = townTextures();
  const tex = TX.roof[b.roof] || TX.roof.tile;
  const roof = stdMat({ map: tex.map, normalMap: tex.normalMap, roughness: b.roof === 'copper' ? 0.5 : 0.9, metalness: b.roof === 'copper' ? 0.3 : 0, transparent: true, vertexColors: true });
  const src = b.style === 'stone' ? TX.stone : TX.timber;
  const gable = stdMat({ map: src.map, normalMap: src.normalMap, roughness: 0.92, transparent: true, vertexColors: true });
  const chim = stdMat({ map: TX.city.map, normalMap: TX.city.normalMap, roughness: 0.92, transparent: true, vertexColors: true });
  MAT.roofs[b.id] = { roof, gable, chim, all: [roof, gable, chim] };
  return MAT.roofs[b.id];
}

// --- himmel og lys etter klokka ------------------------------------------------------
const SKY = [
  // time, sol (farge, styrke), himmel, bakke, hemi, tåke, natt (0..1)
  [0, 0x8aa0e0, 0.7, 0x3a4a80, 0x16161f, 0.62, 0x101830, 1],
  [4.5, 0x8aa0e0, 0.7, 0x3a4a80, 0x16161f, 0.62, 0x101830, 1],
  [6, 0xffa070, 1.2, 0x8a7aa8, 0x3a2a24, 0.62, 0x5a4a5a, 0.55],
  [8, 0xfff0d8, 2.4, 0xb8ccf0, 0x5a4a34, 0.9, 0x8a9ab0, 0],
  [15, 0xfff4e0, 2.6, 0xbcd0f4, 0x5a4a34, 0.95, 0x90a2b8, 0],
  [17.5, 0xffc080, 2.1, 0xa8b0d0, 0x4a3a2a, 0.8, 0x8a8494, 0.1],
  [19.5, 0xff8a50, 1.3, 0x7a6a98, 0x2e2224, 0.62, 0x4a3a50, 0.45],
  [21, 0x8a98d8, 0.75, 0x404c84, 0x18161e, 0.64, 0x1a1e36, 0.85],
  [22.5, 0x8aa0e0, 0.7, 0x3a4a80, 0x16161f, 0.62, 0x101830, 1],
  [24, 0x8aa0e0, 0.7, 0x3a4a80, 0x16161f, 0.62, 0x101830, 1],
];
const cA = new THREE.Color(), cB = new THREE.Color();
export function skyAt(hour, out) {
  const h = ((hour % 24) + 24) % 24;
  let i = 0;
  while (i < SKY.length - 2 && SKY[i + 1][0] <= h) i++;
  const a = SKY[i], b = SKY[i + 1];
  const t = (h - a[0]) / Math.max(0.001, b[0] - a[0]);
  const col = (ia, ib, o) => { cA.setHex(ia); cB.setHex(ib); return o.copy(cA).lerp(cB, t); };
  out.sun = col(a[1], b[1], out.sun || new THREE.Color());
  out.sunI = lerp(a[2], b[2], t);
  out.sky = col(a[3], b[3], out.sky || new THREE.Color());
  out.ground = col(a[4], b[4], out.ground || new THREE.Color());
  out.hemiI = lerp(a[5], b[5], t);
  out.fog = col(a[6], b[6], out.fog || new THREE.Color());
  out.night = lerp(a[7], b[7], t);
  // solas retning: øst om morgenen, vest om kvelden. Månen står i sør om natta.
  const day = h >= 5.5 && h <= 20.5;
  const k = day ? (h - 5.5) / 15 : 0.5;
  const az = day ? lerp(-0.9, 2.2, k) : 1.0;
  const el = day ? Math.max(0.35, Math.sin(k * Math.PI)) : 0.8;
  out.dir = (out.dir || new THREE.Vector3()).set(Math.cos(az) * -16, 14 + el * 22, Math.sin(az) * 12 + 6);
  return out;
}

// --- byen ------------------------------------------------------------------------------
export class Town extends Dungeon {
  constructor(seed, arrival = 'start') {
    super(0, seed);
    this.isTown = true;
    this.peaceful = true;
    this.arrival = arrival;
    const sp = arrival === 'grate' ? { x: 13.6, y: 22.4 } : { x: 12.8, y: 16.5 };
    this.start = { x: U(sp.x), z: U(sp.y) };
    this.explored.fill(1);
    this.insideId = null;
    this.smokers = [];
    this.lampSrc = [];
    this.innerSrc = [];
    this.incense = [];
    this.timeT = 0;
  }

  gen() {
    const L = buildTownLayout();
    this.grid.set(L.grid);
    this.ground = L.ground;
    this.bmap = L.bmap;
    this.doorMap = L.doorMap;
    this.bridgeMap = L.bridge;
    this.buildings = BUILDINGS.map((b, i) => ({ ...b, index: i, roofA: 1, frontLow: false }));
    this.shapes = new Array(TW * TH).fill(null);
    this.walkBlock = new Uint8Array(TW * TH);
    this.cityMask = new Uint8Array(TW * TH);
    for (let y = 0; y < TH; y++) for (let x = 0; x < TW; x++) {
      if (this.get(x, y) !== WALL) continue;
      const ring = (x === RING.x0 || x === RING.x1) && y >= RING.y0 && y <= RING.y1 || (y === RING.y0 || y === RING.y1) && x >= RING.x0 && x <= RING.x1;
      const tower = this.isTower(x, y);
      if (ring || tower) this.cityMask[this.idx(x, y)] = 1;
    }
    this.pieces = [];
    for (let y = 0; y < TH; y++) for (let x = 0; x < TW; x++) {
      const v = this.get(x, y);
      if (v !== HOUSE && v !== FENCE) continue;
      const pc = this.wallPiece(x, y);
      this.pieces.push(pc);
      const list = [];
      for (const b of pc.boxes) list.push([b[0], b[1], b[2], b[3], 0]);
      this.shapes[this.idx(x, y)] = list;
    }
    this.start = { x: U(12.8), z: U(16.5) };
  }

  isTower(x, y) {
    return (x >= 15 && x <= 16 && y >= 3 && y <= 4) || (x >= 20 && x <= 21 && y >= 3 && y <= 4) || (x <= 4 && y <= 4 && x >= 3 && y >= 3) || (x >= 41 && x <= 42 && y >= 3 && y <= 4);
  }
  isGate(x, y) {
    return y === GATE.y && x >= GATE.x0 && x <= GATE.x1;
  }

  buildingOf(tx, ty) {
    for (const b of this.buildings) if (tx >= b.x0 && tx <= b.x1 && ty >= b.y0 && ty <= b.y1) return b;
    return null;
  }

  // Tynn vegg: stolpe i midten og armer mot naboveggene, korte karmer mot dører
  wallPiece(tx, ty) {
    const v = this.get(tx, ty);
    const h = v === HOUSE ? HT : FT;
    const cx = (tx + 0.5) * T, cz = (ty + 0.5) * T;
    const arms = [];
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const w = this.get(tx + dx, ty + dy);
      const conn = v === HOUSE ? w === HOUSE : (w === FENCE || w === HOUSE);
      const door = v === HOUSE && this.doorMap[this.idx(tx + dx, ty + dy)] > 0;
      if (conn) arms.push({ dx, dy, len: T / 2 - h, end: false });
      else if (door) arms.push({ dx, dy, len: T / 2 - h + STUB, end: true, door: true });
    }
    const boxes = [[cx - h, cz - h, cx + h, cz + h]];
    for (const a of arms) {
      if (a.dx === 1) boxes.push([cx + h, cz - h, cx + h + a.len, cz + h]);
      else if (a.dx === -1) boxes.push([cx - h - a.len, cz - h, cx - h, cz + h]);
      else if (a.dy === 1) boxes.push([cx - h, cz + h, cx + h, cz + h + a.len]);
      else boxes.push([cx - h, cz - h - a.len, cx + h, cz - h]);
    }
    const b = v === HOUSE ? this.buildingOf(tx, ty) : null;
    return { tx, ty, v, cx, cz, h, arms, boxes, b, front: b ? (ty === b.y1 || tx === b.x1) : false };
  }

  // Møbler og annet som stenger: legges i alle fliser boksen dekker
  addBlock(x0, z0, x1, z1, losBlock = false) {
    const box = [x0, z0, x1, z1, losBlock ? 0 : 1];
    for (let ty = Math.floor(z0 / T); ty <= Math.floor(z1 / T); ty++) for (let tx = Math.floor(x0 / T); tx <= Math.floor(x1 / T); tx++) {
      if (tx < 0 || ty < 0 || tx >= TW || ty >= TH) continue;
      const i = this.idx(tx, ty);
      (this.shapes[i] || (this.shapes[i] = [])).push(box);
      const cx = (tx + 0.5) * T, cz = (ty + 0.5) * T;
      if (cx > x0 - 0.5 && cx < x1 + 0.5 && cz > z0 - 0.5 && cz < z1 + 0.5) this.walkBlock[i] = 1;
    }
  }
  blockCircle(x, z, r) {
    const tx = Math.floor(x / T), ty = Math.floor(z / T);
    if (tx >= 0 && ty >= 0 && tx < TW && ty < TH && r > 0.4) this.walkBlock[this.idx(tx, ty)] = 1;
  }

  // --- spørringer ----------------------------------------------------------------
  collide(p, r) {
    let hit = false;
    for (let it = 0; it < 2; it++) {
      const tx0 = Math.floor((p.x - r) / T) - 1, tx1 = Math.floor((p.x + r) / T) + 1;
      const tz0 = Math.floor((p.z - r) / T) - 1, tz1 = Math.floor((p.z + r) / T) + 1;
      for (let tz = tz0; tz <= tz1; tz++) for (let tx = tx0; tx <= tx1; tx++) {
        const v = this.get(tx, tz);
        if (v === WALL) {
          if (pushBox(p, r, tx * T, tz * T, (tx + 1) * T, (tz + 1) * T)) hit = true;
          continue;
        }
        if (v === PILLAR) {
          const cx = (tx + 0.5) * T, cz = (tz + 0.5) * T;
          const dx = p.x - cx, dz = p.z - cz;
          const dd = Math.hypot(dx, dz), rr = r + 0.62;
          if (dd < rr && dd > 1e-5) { p.x += (dx / dd) * (rr - dd); p.z += (dz / dd) * (rr - dd); hit = true; }
        }
        const sh = this.shapes[this.idx(tx, tz)];
        if (sh) for (const b of sh) if (pushBox(p, r, b[0], b[1], b[2], b[3])) hit = true;
      }
    }
    return hit;
  }

  pointBlocked(x, z) {
    const tx = Math.floor(x / T), tz = Math.floor(z / T);
    const v = this.get(tx, tz);
    if (v === WALL) return true;
    const sh = this.shapes[this.idx(tx, tz)];
    if (sh) for (const b of sh) if (!b[4] && x > b[0] - 0.02 && x < b[2] + 0.02 && z > b[1] - 0.02 && z < b[3] + 0.02) return true;
    return false;
  }

  los(ax, az, bx, bz) {
    const dx = bx - ax, dz = bz - az;
    const len = Math.hypot(dx, dz);
    const steps = Math.ceil(len / 0.25);
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      if (this.pointBlocked(ax + dx * t, az + dz * t)) return false;
    }
    return true;
  }

  // vei for byfolk: bare gulv, ikke vann, ikke møbler
  walkOpen(x, y) {
    if (x < 0 || y < 0 || x >= TW || y >= TH) return false;
    const i = this.idx(x, y);
    return this.grid[i] === FLOOR && !this.walkBlock[i];
  }

  npcPath(ax, az, bx, bz) {
    if (!this.pd2) { this.pd2 = new Uint16Array(TW * TH); this.pq2 = new Int32Array(TW * TH); }
    const dist = this.pd2, q = this.pq2;
    dist.fill(65535);
    let sx = Math.floor(bx / T), sy = Math.floor(bz / T);
    if (!this.walkOpen(sx, sy)) { const n = this.nearestOpen(sx, sy); if (!n) return null; sx = n[0]; sy = n[1]; }
    let head = 0, tail = 0;
    dist[this.idx(sx, sy)] = 0;
    q[tail++] = this.idx(sx, sy);
    while (head < tail) {
      const c = q[head++];
      const cx = c % TW, cy = (c - cx) / TW;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dy) continue;
        const nx = cx + dx, ny = cy + dy;
        if (!this.walkOpen(nx, ny)) continue;
        if (dx && dy && (!this.walkOpen(cx + dx, cy) || !this.walkOpen(cx, cy + dy))) continue;
        const ni = ny * TW + nx;
        if (dist[ni] > dist[c] + 1) { dist[ni] = dist[c] + 1; q[tail++] = ni; }
      }
    }
    let x = Math.floor(ax / T), y = Math.floor(az / T);
    if (!this.walkOpen(x, y) || dist[this.idx(x, y)] === 65535) { const n = this.nearestOpen(x, y, true); if (!n) return null; x = n[0]; y = n[1]; }
    const out = [{ x: (x + 0.5) * T, z: (y + 0.5) * T }];
    for (let guard = 0; guard < 400 && dist[this.idx(x, y)] > 0; guard++) {
      let bxn = x, byn = y, best = dist[this.idx(x, y)];
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dy) continue;
        const nx = x + dx, ny = y + dy;
        if (!this.walkOpen(nx, ny)) continue;
        if (dx && dy && (!this.walkOpen(x + dx, y) || !this.walkOpen(x, y + dy))) continue;
        const v = dist[this.idx(nx, ny)];
        if (v < best) { best = v; bxn = nx; byn = ny; }
      }
      if (bxn === x && byn === y) break;
      x = bxn; y = byn;
      out.push({ x: (x + 0.5) * T, z: (y + 0.5) * T });
    }
    out.push({ x: bx, z: bz });
    return out;
  }

  nearestOpen(x, y, reach) {
    for (let r = 1; r < 4; r++) for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) {
      if (this.walkOpen(x + i, y + j) && (!reach || this.pd2[this.idx(x + i, y + j)] < 65535)) return [x + i, y + j];
    }
    return null;
  }

  insideAt(wx, wz) {
    const tx = Math.floor(wx / T), ty = Math.floor(wz / T);
    if (tx < 0 || ty < 0 || tx >= TW || ty >= TH) return null;
    const bi = this.bmap[this.idx(tx, ty)];
    return bi ? this.buildings[bi - 1] : null;
  }

  // --- geometri ------------------------------------------------------------------
  build() {
    const M = materials();
    this.M = M;
    this.buildGround(M);
    this.buildWater();
    this.buildCityWall(M);
    this.buildHouses(M);
    this.buildOutside(M);
    G.scene.add(this.group);
  }

  addMesh(mesher, mat, cast = true, recv = true, parent = this.group) {
    if (mesher.empty) return null;
    const m = new THREE.Mesh(mesher.geometry(), mat);
    m.castShadow = cast;
    m.receiveShadow = recv;
    parent.add(m);
    return m;
  }

  // avstand til nærmeste vegg (for bakt skygge på bakken)
  aoAt(wx, wz) {
    const tx = Math.floor(wx / T - 0.001), tz = Math.floor(wz / T - 0.001);
    let dmin = 9;
    const db = (x0, z0, x1, z1) => {
      const cx = Math.max(x0, Math.min(wx, x1)), cz = Math.max(z0, Math.min(wz, z1));
      dmin = Math.min(dmin, Math.hypot(wx - cx, wz - cz));
    };
    for (let j = -2; j <= 2; j++) for (let i = -2; i <= 2; i++) {
      const x = tx + i, y = tz + j;
      if (x < 0 || y < 0 || x >= TW || y >= TH) continue;
      const k = this.idx(x, y);
      if (this.cityMask[k]) db(x * T, y * T, (x + 1) * T, (y + 1) * T);
      else if (this.grid[k] === HOUSE) for (const b of this.shapes[k]) db(b[0], b[1], b[2], b[3]);
      else if (this.grid[k] === PILLAR) dmin = Math.min(dmin, Math.max(0, Math.hypot(wx - (x + 0.5) * T, wz - (y + 0.5) * T) - 0.7));
    }
    const t = Math.min(1, dmin / 1.4);
    const h = Math.sin(wx * 12.9898 + wz * 78.233) * 43758.5453;
    return (0.5 + 0.5 * t * t * (3 - 2 * t)) * (0.92 + 0.16 * (h - Math.floor(h)));
  }

  groundKindAt(tx, ty, qx, qy) {
    // qx, qy: punkt i flisa (flisenheter). Kanten av en bygning deles i inne og ute.
    const k = this.idx(tx, ty);
    const b = this.buildingOf(tx, ty);
    const v = this.grid[k];
    if (b && (v === HOUSE || this.doorMap[k])) {
      const inside = qx > b.x0 + 0.5 && qx < b.x1 + 0.5 && qy > b.y0 + 0.5 && qy < b.y1 + 0.5;
      if (inside) return b.floor;
      const ox = qx < b.x0 + 0.5 ? -1 : qx > b.x1 + 0.5 ? 1 : 0;
      const oy = qy < b.y0 + 0.5 ? -1 : qy > b.y1 + 0.5 ? 1 : 0;
      const nx = tx + ox, ny = ty + oy;
      const nb = this.buildingOf(nx, ny);
      const g = this.ground[this.idx(nx, ny)];
      if (!nb && g !== GR.OUT && g !== GR.PLANK && this.grid[this.idx(nx, ny)] !== WATER) return g;
      return GR.GRASS;
    }
    return this.ground[k];
  }

  buildGround(M) {
    const ms = {};
    const get = k => ms[k] || (ms[k] = new Mesher());
    const plank = new Mesher();
    const curb = new Mesher();
    const ao = (x, z) => { const a = this.aoAt(x, z); return [a, a, a]; };
    for (let y = 0; y < TH; y++) for (let x = 0; x < TW; x++) {
      const k = this.idx(x, y);
      const v = this.grid[k];
      if (v === WATER || this.cityMask[k]) continue;
      if (v === WALL) continue; // utenfor muren: egen bakke
      const g = this.ground[k];
      if (g === GR.PLANK) continue;
      const x0 = x * T, z0 = y * T, xm = x0 + T / 2, zm = z0 + T / 2, x1 = x0 + T, z1 = z0 + T;
      for (const [a0, b0, a1, b1] of [[x0, z0, xm, zm], [xm, z0, x1, zm], [x0, zm, xm, z1], [xm, zm, x1, z1]]) {
        const kind = this.groundKindAt(x, y, (a0 + a1) / 2 / T, (b0 + b1) / 2 / T);
        const s = kind === GR.GRASS ? 0.2 : kind === GR.WOOD ? 0.42 : 0.34;
        get(kind).quadUp(a0, b0, a1, b1, 0, [ao(a0, b0), ao(a1, b0), ao(a1, b1), ao(a0, b1)], s, kind === GR.WOOD && this.woodRot(x, y));
      }
      // kantstein mellom brostein og gress/jord
      if (g === GR.COBBLE) {
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nk = this.idx(x + dx, y + dy);
          const ng = this.ground[nk], nv = this.grid[nk];
          if ((ng !== GR.GRASS && ng !== GR.DIRT) || nv !== FLOOR || this.buildingOf(x + dx, y + dy)) continue;
          const w = 0.09;
          if (dx === 1) curb.box(x1 - w, 0, z0, x1 + w, 0.07, z1, { uv: 'world', us: 0.6, col: [0.78, 0.74, 0.68] });
          else if (dx === -1) curb.box(x0 - w, 0, z0, x0 + w, 0.07, z1, { uv: 'world', us: 0.6, col: [0.78, 0.74, 0.68] });
          else if (dy === 1) curb.box(x0, 0, z1 - w, x1, 0.07, z1 + w, { uv: 'world', us: 0.6, col: [0.78, 0.74, 0.68] });
          else curb.box(x0, 0, z0 - w, x1, 0.07, z0 + w, { uv: 'world', us: 0.6, col: [0.78, 0.74, 0.68] });
        }
      }
    }
    for (const k in ms) this.addMesh(ms[k], M.ground[k], false, true);
    this.addMesh(curb, M.city, false, true);
    // bruer og brygge
    const rails = new Mesher();
    for (let y = 0; y < TH; y++) for (let x = 0; x < TW; x++) {
      const bt = this.bridgeMap[this.idx(x, y)];
      if (!bt) continue;
      const x0 = x * T, z0 = y * T, x1 = x0 + T, z1 = z0 + T;
      plank.box(x0, -0.06, z0, x1, 0.06, z1, { uv: 'world', us: 2.9, col: [1, 1, 1] });
      // rekkverk på sidene som ikke er bro eller land
      const isB = (i, j) => this.bridgeMap[this.idx(i, j)] > 0;
      const land = (i, j) => this.grid[this.idx(i, j)] === FLOOR && !isB(i, j);
      const rail = (ax, az, bx2, bz2) => {
        const along = Math.abs(bx2 - ax) > Math.abs(bz2 - az);
        const len = along ? bx2 - ax : bz2 - az;
        const n = Math.max(2, Math.round(Math.abs(len) / 1.0) + 1);
        for (let i = 0; i < n; i++) {
          const t = i / (n - 1);
          const px = lerp(ax, bx2, t), pz = lerp(az, bz2, t);
          rails.box(px - 0.06, 0.06, pz - 0.06, px + 0.06, 0.95, pz + 0.06, { uv: 'world', us: 1.5, col: [0.62, 0.5, 0.38] });
        }
        if (along) rails.box(Math.min(ax, bx2), 0.82, az - 0.05, Math.max(ax, bx2), 0.92, az + 0.05, { uv: 'world', us: 1.5, col: [0.66, 0.54, 0.4] });
        else rails.box(ax - 0.05, 0.82, Math.min(az, bz2), ax + 0.05, 0.92, Math.max(az, bz2), { uv: 'world', us: 1.5, col: [0.66, 0.54, 0.4] });
        // stenger kanten
        const w = 0.08;
        if (along) this.addBlock(Math.min(ax, bx2), az - w, Math.max(ax, bx2), az + w, false);
        else this.addBlock(ax - w, Math.min(az, bz2), ax + w, Math.max(az, bz2), false);
      };
      if (!isB(x, y - 1) && !land(x, y - 1)) rail(x0, z0 + 0.1, x1, z0 + 0.1);
      if (!isB(x, y + 1) && !land(x, y + 1)) rail(x0, z1 - 0.1, x1, z1 - 0.1);
      if (!isB(x - 1, y) && !land(x - 1, y)) rail(x0 + 0.1, z0, x0 + 0.1, z1);
      if (!isB(x + 1, y) && !land(x + 1, y)) rail(x1 - 0.1, z0, x1 - 0.1, z1);
      // pæler ned i vannet
      for (const [px, pz] of [[x0 + 0.25, z0 + 0.25], [x1 - 0.25, z0 + 0.25], [x0 + 0.25, z1 - 0.25], [x1 - 0.25, z1 - 0.25]]) {
        rails.box(px - 0.1, WATER_BOTTOM, pz - 0.1, px + 0.1, -0.06, pz + 0.1, { uv: 'world', us: 1.5, col: [0.4, 0.32, 0.26] });
      }
    }
    this.addMesh(plank, M.plank, true, true);
    this.addMesh(rails, M.wood, true, true);
  }

  woodRot(x, y) {
    const b = this.buildingOf(x, y);
    return b ? (b.x1 - b.x0) < (b.y1 - b.y0) : false;
  }

  buildWater() {
    const bottom = new Mesher(), side = new Mesher(), surf = new Mesher();
    const river = (x, y) => x >= RIVER.x0 && x <= RIVER.x1 && (y < RING.y0 || y > RING.y1 || this.get(x, y) === WATER || this.bridgeMap[this.idx(x, y)] > 0 || this.cityMask[this.idx(x, y)]);
    const y0 = -40, y1 = TH + 40;
    for (let y = y0; y < y1; y++) for (let x = RIVER.x0; x <= RIVER.x1; x++) {
      const inMap = y >= 0 && y < TH;
      if (inMap && !river(x, y)) continue;
      const X0 = x * T, Z0 = y * T, X1 = X0 + T, Z1 = Z0 + T;
      bottom.quadUp(X0, Z0, X1, Z1, WATER_BOTTOM, [0.32, 0.3, 0.26]);
      surf.quadUp(X0, Z0, X1, Z1, WATER_Y, [1, 1, 1]);
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy;
        if (nx >= RIVER.x0 && nx <= RIVER.x1) { if (ny < 0 || ny >= TH || river(nx, ny)) continue; }
        const yy0 = WATER_BOTTOM, yy1 = 0;
        const col = [[0.42, 0.4, 0.36], [0.42, 0.4, 0.36], [0.85, 0.82, 0.76], [0.85, 0.82, 0.76]];
        if (dx === 1) side.quad([[X1, yy0, Z0], [X1, yy0, Z1], [X1, yy1, Z1], [X1, yy1, Z0]], [-1, 0, 0], [[Z0 / 2, yy0 / 2], [Z1 / 2, yy0 / 2], [Z1 / 2, yy1 / 2], [Z0 / 2, yy1 / 2]], col);
        else if (dx === -1) side.quad([[X0, yy0, Z0], [X0, yy0, Z1], [X0, yy1, Z1], [X0, yy1, Z0]], [1, 0, 0], [[Z0 / 2, yy0 / 2], [Z1 / 2, yy0 / 2], [Z1 / 2, yy1 / 2], [Z0 / 2, yy1 / 2]], col);
        else if (dy === 1) side.quad([[X0, yy0, Z1], [X1, yy0, Z1], [X1, yy1, Z1], [X0, yy1, Z1]], [0, 0, -1], [[X0 / 2, yy0 / 2], [X1 / 2, yy0 / 2], [X1 / 2, yy1 / 2], [X0 / 2, yy1 / 2]], col);
        else side.quad([[X0, yy0, Z0], [X1, yy0, Z0], [X1, yy1, Z0], [X0, yy1, Z0]], [0, 0, 1], [[X0 / 2, yy0 / 2], [X1 / 2, yy0 / 2], [X1 / 2, yy1 / 2], [X0 / 2, yy1 / 2]], col);
      }
    }
    this.addMesh(bottom, this.M.ground[GR.DIRT], false, true);
    this.addMesh(side, this.M.city, false, true);
    this.waterMat = makeWaterMaterial();
    this.waterMat.uniforms.uDeep.value.setHex(0x113440);
    this.waterMat.uniforms.uShallow.value.setHex(0x2a6272);
    this.waterMat.uniforms.uGlint.value.setHex(0x4a8494);
    const wm = this.addMesh(surf, this.waterMat, false, false);
    if (wm) wm.renderOrder = 2;
  }

  buildCityWall(M) {
    const W = new Mesher(), merl = new Mesher();
    const heightOf = (x, y) => {
      if (!this.cityMask[this.idx(x, y)]) return 0;
      if (this.isTower(x, y)) return TOWER_H;
      if (this.isGate(x, y)) return CITY_TALL;
      const open = (i, j) => { const v = this.get(i, j); return v !== WALL; };
      return open(x - 1, y) || open(x, y - 1) || open(x - 1, y - 1) ? CITY_LOW : CITY_TALL;
    };
    const col = [1, 1, 1];
    for (let y = 0; y < TH; y++) for (let x = 0; x < TW; x++) {
      if (!this.cityMask[this.idx(x, y)]) continue;
      const h = heightOf(x, y);
      const X0 = x * T, Z0 = y * T, X1 = X0 + T, Z1 = Z0 + T;
      const overRiver = x >= RIVER.x0 && x <= RIVER.x1;
      const base = overRiver ? WATER_BOTTOM : 0;
      if (this.isGate(x, y)) {
        // porten: buen over og fallgitteret
        W.box(X0, 3.3, Z0, X1, h, Z1, { vs: 2, us: 2, ao: false, col, skip: {} });
        continue;
      }
      // tak
      W.box(X0, h - 0.001, Z0, X1, h, Z1, { uv: 'world', us: 2, skip: { px: 1, nx: 1, pz: 1, nz: 1 }, col: [0.9, 0.88, 0.84] });
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nh = heightOf(x + dx, y + dy);
        if (nh >= h) continue;
        const lo = this.isGate(x + dx, y + dy) ? 0 : (nh > 0 ? nh : base);
        const o = { vs: 2, us: 2, ao: true, col, skip: { px: dx !== 1, nx: dx !== -1, pz: dy !== 1, nz: dy !== -1, py: true } };
        if (this.isGate(x + dx, y + dy)) { W.box(X0, base, Z0, X1, 3.3, Z1, { ...o }); W.box(X0, 3.3, Z0, X1, h, Z1, { ...o }); continue; }
        W.box(X0, lo, Z0, X1, h, Z1, o);
      }
      // murtinder på høye murer og tårn
      if (h >= CITY_TALL - 0.01) {
        const tower = this.isTower(x, y);
        const cm = (i, j) => this.cityMask[this.idx(i, j)] > 0;
        const outN = tower ? !(this.isTower(x, y - 1) && cm(x, y - 1)) : !cm(x, y - 1);
        const outW = tower ? !(this.isTower(x - 1, y) && cm(x - 1, y)) : !cm(x - 1, y) && x <= RING.x0;
        const outS = tower && !(this.isTower(x, y + 1) && cm(x, y + 1));
        const outE = tower && !(this.isTower(x + 1, y) && cm(x + 1, y));
        const mh = 0.7;
        const along = (fn) => { for (const t of [0.25, 0.75]) fn(t); };
        if (outN && (tower || y <= RING.y0)) along(t => merl.box(X0 + t * T - 0.32, h, Z0, X0 + t * T + 0.32, h + mh, Z0 + 0.5, { vs: 2, us: 2, col }));
        if (outW) along(t => merl.box(X0, h, Z0 + t * T - 0.32, X0 + 0.5, h + mh, Z0 + t * T + 0.32, { vs: 2, us: 2, col }));
        if (outS) along(t => merl.box(X0 + t * T - 0.32, h, Z1 - 0.5, X0 + t * T + 0.32, h + mh, Z1, { vs: 2, us: 2, col }));
        if (outE) along(t => merl.box(X1 - 0.5, h, Z0 + t * T - 0.32, X1, h + mh, Z0 + t * T + 0.32, { vs: 2, us: 2, col }));
      }
    }
    this.addMesh(W, M.city, true, true);
    this.addMesh(merl, M.city, true, true);
    // fallgitter i porten
    const iron = new Mesher();
    const gz = (GATE.y + 0.5) * T;
    const gx0 = GATE.x0 * T, gx1 = (GATE.x1 + 1) * T;
    for (let x = gx0 + 0.2; x < gx1; x += 0.42) iron.box(x - 0.045, 0, gz - 0.045, x + 0.045, 3.3, gz + 0.045, { uv: 'world', col: [0.5, 0.5, 0.52] });
    for (let y = 0.5; y < 3.3; y += 0.55) iron.box(gx0, y - 0.04, gz - 0.06, gx1, y + 0.04, gz + 0.06, { uv: 'world', col: [0.5, 0.5, 0.52] });
    this.addMesh(iron, M.iron, true, true);
    // mørk portgang bak gitteret
    const dark = new THREE.Mesh(new THREE.PlaneGeometry(gx1 - gx0, 3.3), new THREE.MeshBasicMaterial({ color: 0x050404 }));
    dark.position.set((gx0 + gx1) / 2, 1.65, GATE.y * T + 0.15);
    this.group.add(dark);
  }

  // --- hus -------------------------------------------------------------------------
  buildHouses(M) {
    const backT = new Mesher(), backS = new Mesher(), fence = new Mesher();
    const backWood = new Mesher(), backGlass = new Mesher();
    this.furn = { wood: new Mesher(), cloth: new Mesher(), stone: new Mesher(), iron: new Mesher(), paint: new Mesher(), gold: new Mesher() };
    for (const b of this.buildings) {
      b.fF = { walls: new Mesher(), wood: new Mesher(), glass: new Mesher() };
      b.fL = new Mesher();
      b.tint = b.style === 'stone' ? (b.id === 'temple' ? [1.08, 1.0, 0.86] : b.id === 'smithy' ? [0.78, 0.74, 0.7] : [0.9, 0.9, 0.92]) : hex(b.plaster || 0xe0d4b8).map(c => c * 1.08);
    }
    for (const pc of this.pieces) {
      if (pc.v === FENCE) { this.fencePiece(pc, fence); continue; }
      const b = pc.b;
      const target = pc.front ? b.fF.walls : (b.style === 'stone' ? backS : backT);
      this.wallBoxes(pc, target, b.wallH, b);
      if (pc.front) this.wallBoxes(pc, b.fL, LOWH, b, true);
    }
    // vinduer, dører, skilt
    for (const b of this.buildings) {
      this.windows(b, backWood, backGlass);
      this.doors(b, backT, backS);
    }
    this.addMesh(backT, M.timber, true, true);
    this.addMesh(backS, M.stone, true, true);
    this.addMesh(fence, M.wood, true, true);
    this.addMesh(backWood, M.paint, true, true);
    this.addMesh(backGlass, M.glass, false, false);
    if (this.glassIn) this.addMesh(this.glassIn, MAT.glassIn, false, false);
    for (const b of this.buildings) {
      const wallMat = b.style === 'stone' ? M.stone : M.timber;
      const gF = new THREE.Group(), gL = new THREE.Group();
      this.addMesh(b.fF.walls, wallMat, true, true, gF);
      this.addMesh(b.fF.wood, M.paint, true, true, gF);
      this.addMesh(b.fF.glass, M.glass, false, false, gF);
      if (b.fF.glassIn) this.addMesh(b.fF.glassIn, MAT.glassIn, false, false, gF);
      this.addMesh(b.fL, wallMat, true, true, gL);
      gL.visible = false;
      this.group.add(gF, gL);
      b.frontFull = gF;
      b.frontLowG = gL;
      this.buildRoof(b);
    }
    this.furnish();
    const F = this.furn;
    this.addMesh(F.wood, M.wood, true, true);
    this.addMesh(F.cloth, M.cloth, true, true);
    this.addMesh(F.stone, M.stone, true, true);
    this.addMesh(F.iron, M.iron, true, true);
    this.addMesh(F.paint, M.paint, true, true);
    this.addMesh(F.gold, M.gold, true, true);
    // søyler i tempelet
    for (let y = 0; y < TH; y++) for (let x = 0; x < TW; x++) {
      if (this.get(x, y) !== PILLAR) continue;
      const p = buildPillar(M.pillar);
      p.position.set(this.tw(x), 0, this.tw(y));
      p.scale.set(0.85, 1.45, 0.85);
      p.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
      this.group.add(p);
    }
  }

  wallBoxes(pc, M, H, b, low = false) {
    const { cx, cz, h } = pc;
    const vs = b.style === 'stone' ? 2 : 2.8;
    const us = b.style === 'stone' ? 2 : T;
    const col = b.tint;
    const topV = b.style === 'stone' ? null : 0.97;
    const has = (dx, dy) => pc.arms.find(a => a.dx === dx && a.dy === dy);
    // stolpe
    M.box(cx - h, 0, cz - h, cx + h, H, cz + h, { vs, us, ao: true, col, topV, skip: { px: !!has(1, 0), nx: !!has(-1, 0), pz: !!has(0, 1), nz: !!has(0, -1) } });
    for (const a of pc.arms) {
      const sk = { px: a.dx !== 1 || !a.end, nx: a.dx !== -1 || !a.end, pz: a.dy !== 1 || !a.end, nz: a.dy !== -1 || !a.end };
      if (a.dx) { sk.pz = false; sk.nz = false; } else { sk.px = false; sk.nx = false; }
      if (a.dx === 1) M.box(cx + h, 0, cz - h, cx + h + a.len, H, cz + h, { vs, us, ao: true, col, topV, skip: sk });
      else if (a.dx === -1) M.box(cx - h - a.len, 0, cz - h, cx - h, H, cz + h, { vs, us, ao: true, col, topV, skip: sk });
      else if (a.dy === 1) M.box(cx - h, 0, cz + h, cx + h, H, cz + h + a.len, { vs, us, ao: true, col, topV, skip: sk });
      else M.box(cx - h, 0, cz - h - a.len, cx + h, H, cz - h, { vs, us, ao: true, col, topV, skip: sk });
    }
    void low;
  }

  fencePiece(pc, M) {
    const { cx, cz } = pc;
    const col = [0.72, 0.6, 0.46];
    M.box(cx - 0.08, 0, cz - 0.08, cx + 0.08, 1.0, cz + 0.08, { uv: 'world', us: 1.5, col });
    for (const a of pc.arms) {
      const len = a.len + FT;
      for (const yy of [0.42, 0.78]) {
        if (a.dx === 1) M.box(cx, yy - 0.05, cz - 0.035, cx + len, yy + 0.05, cz + 0.035, { uv: 'world', us: 1.5, col });
        else if (a.dx === -1) M.box(cx - len, yy - 0.05, cz - 0.035, cx, yy + 0.05, cz + 0.035, { uv: 'world', us: 1.5, col });
        else if (a.dy === 1) M.box(cx - 0.035, yy - 0.05, cz, cx + 0.035, yy + 0.05, cz + len, { uv: 'world', us: 1.5, col });
        else M.box(cx - 0.035, yy - 0.05, cz - len, cx + 0.035, yy + 0.05, cz, { uv: 'world', us: 1.5, col });
      }
    }
  }

  windows(b, backWood, backGlass) {
    const stone = b.style === 'stone';
    const shutterCol = { inn: [0.25, 0.42, 0.3], shop: [0.5, 0.22, 0.16], dojo: [0.6, 0.18, 0.14], home: [0.24, 0.32, 0.5], farm: [0.32, 0.4, 0.26], guard: [0.3, 0.32, 0.44], manor: [0.18, 0.3, 0.5] }[b.id];
    const rows = b.id === 'tower' ? [1.7, 3.9, 6.1] : b.id === 'temple' ? [2.5] : stone ? [1.8] : b.wallH >= 4 ? [1.5, 3.55] : [1.5];
    const ww = b.id === 'temple' ? 0.55 : stone ? 0.6 : 0.82, wh = b.id === 'temple' ? 1.7 : stone ? 0.85 : 0.9;
    const isDoor = (x, y) => this.doorMap[this.idx(x, y)] === b.index + 1;
    for (let y = b.y0; y <= b.y1; y++) for (let x = b.x0; x <= b.x1; x++) {
      if (this.get(x, y) !== HOUSE) continue;
      const corner = (x === b.x0 || x === b.x1) && (y === b.y0 || y === b.y1);
      if (corner) continue;
      const horiz = y === b.y0 || y === b.y1;
      const n1 = horiz ? [x - 1, y] : [x, y - 1], n2 = horiz ? [x + 1, y] : [x, y + 1];
      if (isDoor(...n1) || isDoor(...n2)) continue;
      if (b.id !== 'temple' && b.id !== 'tower' && (x + y) % 2) continue;
      if (b.id === 'tower' && (x !== 37 && y !== 16)) continue;
      const nx = horiz ? 0 : (x === b.x0 ? -1 : 1), nz = horiz ? (y === b.y0 ? -1 : 1) : 0;
      const front = y === b.y1 || x === b.x1;
      const wood = front ? b.fF.wood : backWood, glass = front ? b.fF.glass : backGlass;
      const gin = front ? (b.fF.glassIn || (b.fF.glassIn = new Mesher())) : (this.glassIn || (this.glassIn = new Mesher()));
      const cx = (x + 0.5) * T, cz = (y + 0.5) * T;
      for (const cy of rows) {
        if (cy + wh / 2 > b.wallH - 0.2) continue;
        this.windowAt(cx, cy, cz, nx, nz, ww, wh, wood, glass, shutterCol, b, gin);
      }
    }
  }

  windowAt(cx, cy, cz, nx, nz, ww, wh, wood, glass, shutterCol, b, gin) {
    const frameC = [0.36, 0.25, 0.16];
    const glassC = b.id === 'temple' ? [1.0, 0.78, 0.42] : b.id === 'tower' ? [0.7, 0.62, 1.0] : [1, 0.86, 0.66];
    for (const side of [1, -1]) {
      const off = (HT + 0.012) * side;
      const px = cx + nx * off, pz = cz + nz * off;
      const n = [nx * side, 0, nz * side];
      const hw = ww / 2, hh = wh / 2;
      const gc = side > 0 ? glassC : [1, 1, 1];
      const gm = side > 0 ? glass : gin;
      if (nx) gm.quad([[px, cy - hh, cz - hw], [px, cy - hh, cz + hw], [px, cy + hh, cz + hw], [px, cy + hh, cz - hw]], n, [[0, 0], [1, 0], [1, 1], [0, 1]], gc);
      else gm.quad([[cx - hw, cy - hh, pz], [cx + hw, cy - hh, pz], [cx + hw, cy + hh, pz], [cx - hw, cy + hh, pz]], n, [[0, 0], [1, 0], [1, 1], [0, 1]], gc);
      if (side < 0) continue;
      const d = 0.06, f = 0.07;
      const bx = (ax, ay, aw, ah) => {
        // boks i veggplanet, (ax, ay) sentrum langs veggen og i høyden
        if (nx) wood.box(px - (nx < 0 ? d : 0), ay - ah / 2, cz + ax - aw / 2, px + (nx > 0 ? d : 0), ay + ah / 2, cz + ax + aw / 2, { uv: 'world', col: frameC });
        else wood.box(cx + ax - aw / 2, ay - ah / 2, pz - (nz < 0 ? d : 0), cx + ax + aw / 2, ay + ah / 2, pz + (nz > 0 ? d : 0), { uv: 'world', col: frameC });
      };
      bx(0, cy + hh + f / 2, ww + f * 2, f);
      bx(0, cy - hh - f / 2, ww + f * 2 + 0.1, f * 1.4);
      bx(-hw - f / 2, cy, f, wh);
      bx(hw + f / 2, cy, f, wh);
      bx(0, cy, 0.035, wh);
      bx(0, cy + 0.05, ww, 0.035);
      if (shutterCol) {
        const sw = ww * 0.52;
        for (const s of [-1, 1]) {
          const ax = s * (hw + f + sw / 2 + 0.02);
          if (nx) wood.box(px - (nx < 0 ? 0.04 : 0), cy - hh, cz + ax - sw / 2, px + (nx > 0 ? 0.04 : 0), cy + hh, cz + ax + sw / 2, { uv: 'world', col: shutterCol });
          else wood.box(cx + ax - sw / 2, cy - hh, pz - (nz < 0 ? 0.04 : 0), cx + ax + sw / 2, cy + hh, pz + (nz > 0 ? 0.04 : 0), { uv: 'world', col: shutterCol });
        }
      }
    }
  }

  doors(b, backT, backS) {
    const lintelY = b.id === 'temple' ? 3.2 : 2.15;
    const doorTiles = b.doors;
    // dørene samles per vegglinje (dobbeldør i tempelet)
    const groups = [];
    for (const [x, y] of doorTiles) {
      const g = groups.find(g => (g.y === y && Math.abs(g.x1 - x) === 1 && (y === b.y0 || y === b.y1)) || (g.x === x && Math.abs(g.y1 - y) === 1 && (x === b.x0 || x === b.x1)));
      if (g) { g.x1 = Math.max(g.x1, x); g.y1 = Math.max(g.y1, y); g.x0 = Math.min(g.x0, x); g.y0 = Math.min(g.y0, y); }
      else groups.push({ x, y, x0: x, x1: x, y0: y, y1: y });
    }
    for (const g of groups) {
      const horiz = g.y === b.y0 || g.y === b.y1;
      const front = g.y === b.y1 || g.x === b.x1;
      const M = front ? b.fF.walls : (b.style === 'stone' ? backS : backT);
      const vs = b.style === 'stone' ? 2 : 2.8, us = b.style === 'stone' ? 2 : T;
      const col = b.tint, topV = b.style === 'stone' ? null : 0.97;
      if (horiz) {
        const z = (g.y + 0.5) * T;
        const xa = g.x0 * T + STUB, xb = (g.x1 + 1) * T - STUB;
        M.box(xa, lintelY, z - HT, xb, b.wallH, z + HT, { vs, us, col, topV, skip: { px: true, nx: true } });
      } else {
        const x = (g.x + 0.5) * T;
        const za = g.y0 * T + STUB, zb = (g.y1 + 1) * T - STUB;
        M.box(x - HT, lintelY, za, x + HT, b.wallH, zb, { vs, us, col, topV, skip: { pz: true, nz: true } });
      }
      // dørblad som står åpent innover
      const n = b.id === 'temple' ? 2 : 1;
      const open = horiz ? (g.x1 - g.x0 + 1) * T - 2 * STUB : (g.y1 - g.y0 + 1) * T - 2 * STUB;
      const leafW = open / n - 0.04;
      const inward = horiz ? (g.y === b.y0 ? 1 : -1) : (g.x === b.x0 ? 1 : -1);
      const lc = b.id === 'temple' ? [0.7, 0.5, 0.2] : [0.45, 0.3, 0.18];
      for (let k = 0; k < n; k++) {
        const geo = new THREE.BoxGeometry(leafW, lintelY - 0.05, 0.07);
        const cols = [];
        for (let i = 0; i < geo.attributes.position.count; i++) cols.push(...lc);
        geo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
        geo.translate(leafW / 2, (lintelY - 0.05) / 2, 0);
        const leaf = new THREE.Mesh(geo, this.M.paint);
        leaf.castShadow = true;
        // hengsel ved karmen, bladet peker langs c (lukket) og svinger inn mot n
        let hx, hz, c, nn;
        if (horiz) {
          const z = (g.y + 0.5) * T + inward * (HT + 0.04);
          const left = k === 0;
          hx = left ? g.x0 * T + STUB + 0.02 : (g.x1 + 1) * T - STUB - 0.02;
          hz = z;
          c = [left ? 1 : -1, 0];
          nn = [0, inward];
        } else {
          const x = (g.x + 0.5) * T + inward * (HT + 0.04);
          hx = x;
          hz = g.y0 * T + STUB + 0.02;
          c = [0, 1];
          nn = [inward, 0];
        }
        const ang = 1.45;
        const dx = c[0] * Math.cos(ang) + nn[0] * Math.sin(ang), dz = c[1] * Math.cos(ang) + nn[1] * Math.sin(ang);
        leaf.position.set(hx, 0, hz);
        leaf.rotation.y = Math.atan2(-dz, dx);
        this.group.add(leaf);
      }
    }
  }

  buildRoof(b) {
    const R = roofMats(b);
    const g = new THREE.Group();
    const roof = new Mesher(), gable = new Mesher(), chim = new Mesher();
    const X0 = (b.x0 + 0.5) * T - HT - OV, X1 = (b.x1 + 0.5) * T + HT + OV;
    const Z0 = (b.y0 + 0.5) * T - HT - OV, Z1 = (b.y1 + 0.5) * T + HT + OV;
    const H = b.wallH;
    const col = [1, 1, 1];
    const th = 0.16;
    let ridgeY;
    if (b.roof === 'cone') {
      const xc = (X0 + X1) / 2, zc = (Z0 + Z1) / 2;
      const s = (X1 - X0) / 2;
      const pitch = 1.15;
      const ey = H - OV * pitch;
      const apex = [xc, H + (s - OV) * pitch, zc];
      ridgeY = apex[1];
      const cs = [[X0, Z0], [X1, Z0], [X1, Z1], [X0, Z1]];
      for (let i = 0; i < 4; i++) {
        const a = cs[i], c = cs[(i + 1) % 4];
        const mx = (a[0] + c[0]) / 2 - xc, mz = (a[1] + c[1]) / 2 - zc;
        const ml = Math.hypot(mx, mz);
        const e1 = new THREE.Vector3(c[0] - a[0], 0, c[1] - a[1]), e2 = new THREE.Vector3(apex[0] - a[0], apex[1] - ey, apex[2] - a[1]);
        const n = e1.clone().cross(e2).normalize();
        if (n.y < 0) n.negate();
        const len = Math.hypot(c[0] - a[0], c[1] - a[1]);
        const sl = Math.hypot(ml, apex[1] - ey) / 1.8;
        roof.tri([[a[0], ey, a[1]], [c[0], ey, c[1]], apex], [n.x, n.y, n.z], [[0, 0], [len / 1.8, 0], [len / 3.6, sl]], col);
        // takskjegg
        const p0 = [a[0], ey - th, a[1]], p1 = [c[0], ey - th, c[1]];
        roof.quad([p0, p1, [c[0], ey, c[1]], [a[0], ey, a[1]]], [mx / ml, 0, mz / ml], [[0, 0], [len / 1.8, 0], [len / 1.8, 0.05], [0, 0.05]], [0.5, 0.45, 0.4]);
      }
      // spir
      const sp = new THREE.Mesh(new THREE.ConeGeometry(0.08, 1.2, 6), this.M.gold);
      sp.position.set(apex[0], apex[1] + 0.5, apex[2]);
      g.add(sp);
    } else {
      const alongX = (b.x1 - b.x0) >= (b.y1 - b.y0);
      const p = b.roof === 'thatch' ? 0.85 : b.roof === 'copper' ? 0.62 : 0.68;
      // arbeid i lokale akser: a = langs mønet, c = på tvers
      const A0 = alongX ? X0 : Z0, A1 = alongX ? X1 : Z1, C0 = alongX ? Z0 : X0, C1 = alongX ? Z1 : X1;
      const wc0 = C0 + OV, wc1 = C1 - OV, cc = (C0 + C1) / 2, s = (wc1 - wc0) / 2;
      const rise = Math.min(4.4, s * p);
      const pp = rise / s;
      const ey = H - OV * pp;
      ridgeY = H + rise;
      const P = (a, y, c) => (alongX ? [a, y, c] : [c, y, a]);
      const nrm = sgn => { const v = new THREE.Vector3(0, 1, sgn * pp).normalize(); return alongX ? [0, v.y, v.z] : [v.z, v.y, 0]; };
      const slope = Math.hypot(cc - C0, ridgeY - ey);
      const uvs = [[A0 / 1.8, 0], [A1 / 1.8, 0], [A1 / 1.8, slope / 1.8], [A0 / 1.8, slope / 1.8]];
      // to takflater med tykkelse
      for (const sgn of [-1, 1]) {
        const ce = sgn < 0 ? C0 : C1;
        roof.quad([P(A0, ey, ce), P(A1, ey, ce), P(A1, ridgeY, cc), P(A0, ridgeY, cc)], nrm(sgn), uvs, col);
        const n2 = nrm(sgn).map(v => -v);
        roof.quad([P(A0, ey - th, ce), P(A1, ey - th, ce), P(A1, ridgeY - th, cc), P(A0, ridgeY - th, cc)], n2, uvs, [0.35, 0.32, 0.3]);
        // takskjegg
        const en = alongX ? [0, 0, sgn] : [sgn, 0, 0];
        roof.quad([P(A0, ey - th, ce), P(A1, ey - th, ce), P(A1, ey, ce), P(A0, ey, ce)], en, [[0, 0], [1, 0], [1, 0.04], [0, 0.04]], [0.45, 0.4, 0.36]);
        // vindskier i endene
        for (const ae of [A0, A1]) {
          const an = alongX ? [ae === A0 ? -1 : 1, 0, 0] : [0, 0, ae === A0 ? -1 : 1];
          roof.quad([P(ae, ey - th, ce), P(ae, ey, ce), P(ae, ridgeY, cc), P(ae, ridgeY - th, cc)], an, [[0, 0], [0.04, 0], [0.04, 1], [0, 1]], [0.4, 0.36, 0.32]);
        }
      }
      // mønekam
      const mk = 0.16;
      if (alongX) roof.box(A0, ridgeY - 0.06, cc - mk, A1, ridgeY + 0.1, cc + mk, { uv: 'world', us: 1.8, col: [0.75, 0.7, 0.66] });
      else roof.box(cc - mk, ridgeY - 0.06, A0, cc + mk, ridgeY + 0.1, A1, { uv: 'world', us: 1.8, col: [0.75, 0.7, 0.66] });
      // gavler i veggplanet
      const vs = b.style === 'stone' ? 2 : 2.8, us = b.style === 'stone' ? 2 : T;
      for (const ae of [A0 + OV, A1 - OV]) {
        const an = alongX ? [ae < cc * 0 + (A0 + A1) / 2 ? -1 : 1, 0, 0] : [0, 0, ae < (A0 + A1) / 2 ? -1 : 1];
        const t0 = P(ae, H, wc0), t1 = P(ae, H, wc1), t2 = P(ae, ridgeY - th, cc);
        const uv = q => [(alongX ? q[2] : q[0]) / us, q[1] / vs];
        gable.tri([t0, t1, t2], an, [uv(t0), uv(t1), uv(t2)], b.tint);
        // baksiden av gavlen (synlig innenfra)
        gable.tri([t0, t2, t1], an.map(v => -v), [uv(t0), uv(t2), uv(t1)], b.tint.map(c => c * 0.7));
      }
      // solskive på tempelgavlen mot sør
      if (b.id === 'temple') {
        const sun = this.sunDisk(1.0);
        const zf = Z1 - OV + 0.06;
        sun.position.set((X0 + X1) / 2, H + rise * 0.42, zf);
        g.add(sun);
        b.sun = sun;
      }
    }
    // pipe
    if (b.chimney) {
      const cx = U(b.chimney[0]), cz = U(b.chimney[1]);
      chim.box(cx - 0.35, H - 0.5, cz - 0.35, cx + 0.35, ridgeY + 0.9, cz + 0.35, { vs: 2, us: 2, col: [0.9, 0.86, 0.8] });
      chim.box(cx - 0.42, ridgeY + 0.85, cz - 0.42, cx + 0.42, ridgeY + 1.0, cz + 0.42, { vs: 2, us: 2, col: [0.7, 0.66, 0.6] });
      this.smokers.push({ x: cx, y: ridgeY + 1.1, z: cz, b, t: Math.random() });
    }
    this.addMesh(roof, R.roof, true, false, g);
    this.addMesh(gable, R.gable, true, true, g);
    this.addMesh(chim, R.chim, true, false, g);
    this.group.add(g);
    b.roofG = g;
    b.roofMats = R.all;
    b.ridgeY = ridgeY;
    for (const m of R.all) m.opacity = 1;
  }

  sunDisk(r) {
    const g = new THREE.Group();
    const disk = new THREE.Mesh(new THREE.CircleGeometry(r * 0.55, 28), MAT.gold);
    g.add(disk);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(r * 0.62, 0.05, 6, 32), MAT.gold);
    g.add(ring);
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const ray = new THREE.Mesh(new THREE.ConeGeometry(0.09, r * (i % 2 ? 0.32 : 0.48), 4), MAT.gold);
      const rr = r * 0.7 + (i % 2 ? 0.16 : 0.24);
      ray.position.set(Math.cos(a) * rr, Math.sin(a) * rr, 0);
      ray.rotation.z = a - Math.PI / 2;
      g.add(ray);
    }
    return g;
  }

  // --- inventar -----------------------------------------------------------------------
  furnish() {
    const F = this.furn;
    const W = (x0, z0, x1, z1, y0, y1, col = [0.62, 0.46, 0.32], block = true) => {
      F.wood.box(U(x0), y0, U(z0), U(x1), y1, U(z1), { uv: 'world', us: 1.4, col });
      if (block && y0 < 1.2) this.addBlock(U(x0), U(z0), U(x1), U(z1));
    };
    const table = (x, z, w, d, h = 0.78) => {
      const col = [0.56, 0.4, 0.28];
      F.wood.box(U(x - w / 2), h - 0.08, U(z - d / 2), U(x + w / 2), h, U(z + d / 2), { uv: 'world', us: 1.4, col });
      for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
        const lx = U(x + sx * (w / 2 - 0.05)), lz = U(z + sz * (d / 2 - 0.05));
        F.wood.box(lx - 0.05, 0, lz - 0.05, lx + 0.05, h - 0.08, lz + 0.05, { uv: 'world', us: 1.4, col: [0.42, 0.3, 0.2] });
      }
      this.addBlock(U(x - w / 2), U(z - d / 2), U(x + w / 2), U(z + d / 2));
    };
    const bench = (x, z, w, d, h = 0.46) => {
      F.wood.box(U(x - w / 2), h - 0.07, U(z - d / 2), U(x + w / 2), h, U(z + d / 2), { uv: 'world', us: 1.4, col: [0.5, 0.36, 0.24] });
      for (const sx of [-1, 1]) F.wood.box(U(x + sx * (w / 2 - 0.06)) - 0.04, 0, U(z - d / 2) + 0.04, U(x + sx * (w / 2 - 0.06)) + 0.04, h - 0.07, U(z + d / 2) - 0.04, { uv: 'world', col: [0.4, 0.28, 0.18] });
    };
    const bed = (x0, z0, x1, z1, blanket) => {
      W(x0, z0, x1, z1, 0, 0.32, [0.48, 0.34, 0.22]);
      F.cloth.box(U(x0) + 0.05, 0.32, U(z0) + 0.05, U(x1) - 0.05, 0.46, U(z1) - 0.05, { uv: 'world', col: blanket });
      // pute i nordenden
      const horiz = (x1 - x0) > (z1 - z0);
      if (horiz) F.cloth.box(U(x0) + 0.08, 0.44, U(z0) + 0.1, U(x0) + 0.5, 0.56, U(z1) - 0.1, { uv: 'world', col: [0.92, 0.9, 0.84] });
      else F.cloth.box(U(x0) + 0.1, 0.44, U(z0) + 0.08, U(x1) - 0.1, 0.56, U(z0) + 0.5, { uv: 'world', col: [0.92, 0.9, 0.84] });
    };
    const shelf = (x0, z0, x1, z1, h, goods) => {
      W(x0, z0, x1, z1, 0, 0.06);
      for (let y = 0.5; y < h; y += 0.55) W(x0, z0, x1, z1, y, y + 0.05, [0.5, 0.36, 0.24], false);
      for (const [sx, sz] of [[x0, z0], [x1, z1]]) F.wood.box(U(sx) - 0.04, 0, U(sx === x0 ? z0 : z1) - 0.04, U(sx) + 0.04, h, U(sx === x0 ? z0 : z1) + 0.04, { uv: 'world', col: [0.4, 0.28, 0.18] });
      if (goods) {
        const R = (a, b) => a + hash2(Math.floor(x0 * 100 + a * 10), Math.floor(z0 * 100 + b * 10), 5) * (b - a);
        const horiz = (x1 - x0) > (z1 - z0);
        for (let y = 0.55; y < h; y += 0.55) {
          for (let t = 0.08; t < 0.95; t += 0.14) {
            const px = horiz ? lerp(x0, x1, t) : (x0 + x1) / 2, pz = horiz ? (z0 + z1) / 2 : lerp(z0, z1, t);
            const hh = 0.12 + R(0, 0.22);
            const c = [[0.6, 0.3, 0.2], [0.3, 0.45, 0.3], [0.7, 0.62, 0.4], [0.35, 0.3, 0.5], [0.8, 0.75, 0.6]][Math.floor(R(0, 4.99))];
            F.paint.box(U(px) - 0.08, y + 0.05, U(pz) - 0.08, U(px) + 0.08, y + 0.05 + hh, U(pz) + 0.08, { uv: 'world', col: c });
          }
        }
      }
    };
    const hearth = (x0, z0, x1, z1, fireX, fireZ) => {
      F.stone.box(U(x0), 0, U(z0), U(x1), 1.25, U(z1), { vs: 2, us: 2, col: [0.86, 0.8, 0.74] });
      this.addBlock(U(x0), U(z0), U(x1), U(z1), false);
      F.iron.box(U(fireX) - 0.3, 0.05, U(fireZ) - 0.12, U(fireX) + 0.3, 0.12, U(fireZ) + 0.12, { uv: 'world', col: [0.5, 0.5, 0.5] });
      this.hearths.push({ x: U(fireX), z: U(fireZ) });
    };
    this.hearths = [];
    this.interior = [];
    // vertshuset
    W(6.0, 7.1, 9.7, 7.45, 0, 1.05, [0.5, 0.34, 0.22]);
    W(5.95, 7.05, 9.75, 7.5, 1.05, 1.12, [0.42, 0.28, 0.18], false);
    shelf(5.7, 5.62, 9.0, 5.82, 2.0, true);
    for (const x of [6.3, 6.95]) this.barrel(U(x), U(6.25), 0.85);
    hearth(5.62, 8.3, 6.05, 9.5, 6.25, 8.9);
    table(10.4, 9.4, 1.1, 0.55); bench(10.4, 8.78, 1.1, 0.2); bench(10.4, 10.02, 1.1, 0.2);
    table(11.0, 7.6, 0.9, 0.5); bench(11.0, 7.05, 0.9, 0.2); bench(11.0, 8.15, 0.9, 0.2);
    // trapp opp til rommene
    for (let i = 0; i < 6; i++) W(11.9 + i * 0.22, 5.65, 12.15 + i * 0.22, 6.35, 0, 0.3 + i * 0.32, [0.46, 0.32, 0.2], i < 3);
    F.cloth.box(U(6.6), 0.01, U(9.6), U(8.6), 0.025, U(10.8), { uv: 'world', col: [0.5, 0.18, 0.14] });
    // butikken
    W(7.75, 15.35, 8.05, 18.2, 0, 1.0, [0.52, 0.36, 0.24]);
    W(7.7, 15.3, 8.1, 18.25, 1.0, 1.07, [0.44, 0.3, 0.2], false);
    shelf(5.62, 15.2, 5.85, 18.8, 2.2, true);
    shelf(8.6, 18.6, 10.8, 18.82, 1.7, true);
    for (const [x, z] of [[6.3, 18.4], [6.7, 18.5], [6.3, 15.6]]) this.sack(U(x), U(z), true);
    this.crate(U(10.4), U(15.6), 0.9);
    // tempelet
    F.stone.box(U(24.3), 0, U(6.15), U(25.7), 1.0, U(6.9), { vs: 2, us: 2, col: [1.05, 0.98, 0.86] });
    F.cloth.box(U(24.25), 1.0, U(6.1), U(25.75), 1.04, U(6.95), { uv: 'world', col: [0.85, 0.62, 0.16] });
    this.addBlock(U(24.3), U(6.15), U(25.7), U(6.9));
    for (const x of [24.0, 26.0]) for (const z of [9.4, 10.3]) bench(x, z, 1.1, 0.2);
    this.addBlock(U(23.45), U(9.25), U(24.55), U(10.45));
    this.addBlock(U(25.45), U(9.25), U(26.55), U(10.45));
    F.cloth.box(U(24.6), 0.01, U(7.2), U(25.4), 0.02, U(12.9), { uv: 'world', col: [0.62, 0.16, 0.1] });
    bed(21.65, 10.8, 22.45, 12.3, [0.92, 0.82, 0.5]);
    const sd = this.sunDisk(0.9);
    sd.position.set(U(25.0), 2.9, U(5.62));
    this.group.add(sd);
    this.templeSun = sd;
    // kapittelhuset
    table(37.5, 8.4, 2.6, 0.7);
    bench(37.5, 7.75, 2.4, 0.2); bench(37.5, 9.05, 2.4, 0.2);
    bed(35.1, 6.1, 35.9, 7.4, [0.85, 0.84, 0.8]);
    shelf(39.4, 5.62, 40.9, 5.85, 2.0, false);
    this.weaponRack(U(41.15), U(8.2), 'z');
    // tårnet
    shelf(36.05, 14.62, 38.95, 14.86, 2.6, true);
    table(37.4, 16.6, 1.0, 0.6);
    F.wood.box(U(38.4), 0, U(17.0), U(38.9), 3.6, U(17.6), { uv: 'world', col: [0.4, 0.28, 0.2] });
    this.addBlock(U(38.4), U(17.0), U(38.9), U(17.6));
    // dojoen
    F.cloth.box(U(7.0), 0.01, U(26.6), U(11.2), 0.03, U(30.2), { uv: 'world', col: [0.5, 0.46, 0.32] });
    for (const z of [27.0, 29.6]) this.dummy(U(6.5), U(z));
    bed(10.2, 30.1, 11.8, 30.85, [0.6, 0.2, 0.16]);
    shelf(9.0, 25.62, 11.0, 25.85, 1.2, false);
    for (let i = 0; i < 6; i++) {
      // tøfler ved døra
      const x = U(11.3) + 0.05, z = U(26.4) + i * 0.24;
      F.cloth.box(x, 0.02, z, x + 0.3, 0.1, z + 0.16, { uv: 'world', col: i % 2 ? [0.55, 0.12, 0.1] : [0.36, 0.22, 0.5] });
    }
    this.basket(U(6.5), U(30.6));
    // smia
    F.stone.box(U(25.55), 0, U(32.15), U(26.95), 0.9, U(33.45), { vs: 2, us: 2, col: [0.7, 0.66, 0.62] });
    this.addBlock(U(25.55), U(32.15), U(26.95), U(33.45), false);
    const coal = new THREE.Mesh(new THREE.BoxGeometry(U(0.55), 0.06, U(0.45)), MAT.coal);
    coal.position.set(U(26.25), 0.92, U(32.8));
    this.group.add(coal);
    this.forgeCoal = coal;
    this.hearths.push({ x: U(26.25), z: U(32.8), forge: true });
    this.anvil(U(24.6), U(32.6));
    W(22.1, 33.0, 23.2, 33.5, 0, 0.6, [0.42, 0.3, 0.2]);
    this.weaponRack(U(21.75), U(31.4), 'z');
    bed(26.1, 29.75, 26.9, 31.15, [0.42, 0.36, 0.3]);
    // Nansens hus
    hearth(13.1, 35.62, 14.1, 36.05, 13.6, 36.25);
    bed(13.1, 37.5, 13.9, 39.0, [0.36, 0.46, 0.66]);
    bed(14.6, 39.25, 15.9, 39.9, [0.2, 0.2, 0.22]);
    table(15.0, 36.6, 0.8, 0.5);
    // Edegars hus
    hearth(6.05, 34.62, 7.0, 35.05, 6.5, 35.25);
    bed(6.1, 37.6, 6.9, 39.2, [0.5, 0.42, 0.3]);
    table(8.6, 37.0, 0.9, 0.55);
    for (const [x, z] of [[9.6, 39.5], [9.2, 39.6]]) this.sack(U(x), U(z), false);
    // vaktstua
    hearth(25.9, 37.62, 26.9, 38.05, 26.4, 38.25);
    bed(23.4, 40.6, 24.9, 41.35, [0.3, 0.32, 0.44]);
    bed(25.2, 40.6, 26.7, 41.35, [0.3, 0.32, 0.44]);
    table(24.6, 38.6, 0.9, 0.5);
    this.weaponRack(U(22.85), U(38.2), 'z');
    // Hvass gård
    hearth(39.0, 33.62, 40.1, 34.05, 39.55, 34.25);
    bed(39.6, 37.8, 40.9, 39.6, [0.55, 0.12, 0.18]);
    table(37.0, 37.0, 1.4, 0.7);
    F.cloth.box(U(35.6), 0.01, U(35.4), U(38.8), 0.025, U(38.6), { uv: 'world', col: [0.32, 0.18, 0.38] });
    shelf(34.62, 33.7, 34.86, 35.6, 2.0, true);
  }

  barrel(x, z, s = 1) {
    const m = buildBarrel();
    m.position.set(x, 0, z);
    m.scale.setScalar(s);
    m.rotation.y = hash2(Math.floor(x * 10), Math.floor(z * 10), 9) * 6;
    m.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    this.group.add(m);
    this.addBlock(x - 0.4 * s, z - 0.4 * s, x + 0.4 * s, z + 0.4 * s);
  }
  crate(x, z, s = 1) {
    const m = buildCrate();
    m.position.set(x, 0, z);
    m.scale.setScalar(s);
    m.rotation.y = hash2(Math.floor(x * 10), Math.floor(z * 10), 11) * 1.2;
    m.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    this.group.add(m);
    this.addBlock(x - 0.42 * s, z - 0.42 * s, x + 0.42 * s, z + 0.42 * s);
  }
  sack(x, z, empty) {
    const F = this.furn;
    const col = empty ? [0.62, 0.5, 0.32] : [0.72, 0.62, 0.42];
    const h = empty ? 0.22 : 0.6;
    F.cloth.box(x - 0.24, 0, z - 0.2, x + 0.24, h, z + 0.2, { uv: 'world', col });
    if (!empty) F.cloth.box(x - 0.12, h, z - 0.1, x + 0.12, h + 0.12, z + 0.1, { uv: 'world', col: col.map(c => c * 0.85) });
  }
  basket(x, z) {
    const F = this.furn;
    F.wood.box(x - 0.3, 0, z - 0.22, x + 0.3, 0.3, z + 0.22, { uv: 'world', col: [0.66, 0.5, 0.28] });
    for (let i = 0; i < 4; i++) F.paint.box(x - 0.22 + i * 0.12, 0.28, z - 0.1, x - 0.12 + i * 0.12, 0.38, z + 0.1, { uv: 'world', col: [0.8, 0.56, 0.3] });
  }
  dummy(x, z) {
    const F = this.furn;
    F.wood.box(x - 0.06, 0, z - 0.06, x + 0.06, 1.7, z + 0.06, { uv: 'world', col: [0.5, 0.36, 0.22] });
    F.wood.box(x - 0.5, 1.25, z - 0.05, x + 0.5, 1.33, z + 0.05, { uv: 'world', col: [0.5, 0.36, 0.22] });
    F.cloth.box(x - 0.2, 0.9, z - 0.16, x + 0.2, 1.5, z + 0.16, { uv: 'world', col: [0.76, 0.64, 0.36] });
    F.cloth.box(x - 0.13, 1.5, z - 0.13, x + 0.13, 1.78, z + 0.13, { uv: 'world', col: [0.8, 0.68, 0.4] });
    this.addBlock(x - 0.25, z - 0.2, x + 0.25, z + 0.2);
  }
  anvil(x, z) {
    const F = this.furn;
    F.wood.box(x - 0.25, 0, z - 0.25, x + 0.25, 0.5, z + 0.25, { uv: 'world', col: [0.4, 0.28, 0.18] });
    F.iron.box(x - 0.16, 0.5, z - 0.12, x + 0.16, 0.66, z + 0.12, { uv: 'world', col: [0.6, 0.6, 0.62] });
    F.iron.box(x - 0.42, 0.66, z - 0.15, x + 0.32, 0.82, z + 0.15, { uv: 'world', col: [0.6, 0.6, 0.62] });
    this.addBlock(x - 0.3, z - 0.28, x + 0.3, z + 0.28);
  }
  weaponRack(x, z, axis) {
    const F = this.furn;
    const n = 4;
    for (let i = 0; i < n; i++) {
      const o = (i - (n - 1) / 2) * 0.3;
      const px = axis === 'z' ? x : x + o, pz = axis === 'z' ? z + o : z;
      F.iron.box(px - 0.025, 0.1, pz - 0.025, px + 0.025, 1.5, pz + 0.025, { uv: 'world', col: [0.75, 0.76, 0.8] });
      F.wood.box(px - 0.07, 0.95, pz - 0.07, px + 0.07, 1.02, pz + 0.07, { uv: 'world', col: [0.3, 0.2, 0.12] });
    }
    if (axis === 'z') F.wood.box(x - 0.1, 0, z - 0.7, x + 0.1, 0.12, z + 0.7, { uv: 'world', col: [0.4, 0.28, 0.18] });
    else F.wood.box(x - 0.7, 0, z - 0.1, x + 0.7, 0.12, z + 0.1, { uv: 'world', col: [0.4, 0.28, 0.18] });
  }

  // --- utenfor muren ----------------------------------------------------------------------
  buildOutside(M) {
    // gress utenfor muren, delt rundt elva så vannet synes
    const S = 130;
    const cx = TW * T / 2, cz = TH * T / 2;
    const rx0 = RIVER.x0 * T, rx1 = (RIVER.x1 + 1) * T;
    const out = new Mesher();
    for (const [x0, x1] of [[cx - S, rx0], [rx1, cx + S]]) out.quadUp(x0, cz - S, x1, cz + S, -0.03, [1, 1, 1], 0.12);
    const plane = this.addMesh(out, M.outside, false, true);
    void plane;
    // åkrer i vest og nord
    const fields = new Mesher();
    const fieldRects = [[-30, -40, -6, -6], [-30, 0, -6, 40], [-30, 46, -6, 80], [0, -50, 28, -8], [44, -50, 58, -8], [70, -50, 110, -8], [100, 0, 130, 50]];
    for (const [x0, z0, x1, z1] of fieldRects) {
      fields.quadUp(x0, z0, x1, z1, -0.015, [0.85, 0.8, 0.7], 0.12);
      for (let z = z0 + 1; z < z1; z += 1.6) fields.box(x0 + 0.5, -0.02, z - 0.25, x1 - 0.5, 0.12, z + 0.25, { uv: 'world', us: 3, col: [0.42, 0.6, 0.3], skip: { nx: true, px: true } });
    }
    this.addMesh(fields, M.field, false, true);
    // veien ut av porten
    const road = new Mesher();
    road.quadUp(GATE.x0 * T + 0.5, -60, (GATE.x1 + 1) * T - 0.5, RING.y0 * T, -0.01, [0.9, 0.86, 0.8], 0.34);
    this.addMesh(road, M.ground[GR.DIRT], false, true);
    this.buildTrees(M);
  }

  buildTrees(M) {
    const pts = TREES.map(([x, y]) => ({ x: U(x), z: U(y), inside: true }));
    // trær utenfor muren
    const R = (i, k) => hash2(i, k, 77);
    for (let i = 0; i < 70; i++) {
      const a = R(i, 1) * Math.PI * 2, d = 58 + R(i, 2) * 50;
      const x = TW * T / 2 + Math.cos(a) * d, z = TH * T / 2 + Math.sin(a) * d;
      if (x > RIVER.x0 * T - 6 && x < (RIVER.x1 + 1) * T + 6) continue;
      if (z < RING.y0 * T && x > GATE.x0 * T - 4 && x < (GATE.x1 + 1) * T + 4) continue;
      pts.push({ x, z, inside: false, s: 1.2 + R(i, 3) * 0.8 });
    }
    const trunkG = new THREE.CylinderGeometry(0.16, 0.26, 2.2, 7).translate(0, 1.1, 0);
    const leafG = new THREE.IcosahedronGeometry(1, 1);
    const trunks = new THREE.InstancedMesh(trunkG, M.bark, pts.length);
    const leaves = new THREE.InstancedMesh(leafG, M.leaf, pts.length * 3);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), s = new THREE.Vector3(), p = new THREE.Vector3();
    const c = new THREE.Color();
    pts.forEach((t, i) => {
      const sc = t.s || (0.85 + R(i, 4) * 0.4);
      e.set(0, R(i, 5) * 6, 0);
      q.setFromEuler(e);
      s.set(sc, sc * (0.9 + R(i, 6) * 0.3), sc);
      p.set(t.x, 0, t.z);
      m4.compose(p, q, s);
      trunks.setMatrixAt(i, m4);
      const base = R(i, 7);
      for (let k = 0; k < 3; k++) {
        const ox = (R(i, 10 + k) - 0.5) * 1.2 * sc, oz = (R(i, 20 + k) - 0.5) * 1.2 * sc;
        const r = (0.85 + R(i, 30 + k) * 0.4) * sc;
        p.set(t.x + ox, (2.3 + k * 0.55 + R(i, 40 + k) * 0.4) * sc, t.z + oz);
        e.set(R(i, 50 + k), R(i, 60 + k) * 3, 0);
        q.setFromEuler(e);
        s.set(r, r * 0.85, r);
        m4.compose(p, q, s);
        leaves.setMatrixAt(i * 3 + k, m4);
        c.setHSL(0.25 + base * 0.07 - k * 0.012, 0.34 + base * 0.14, 0.13 + k * 0.025 + R(i, 70 + k) * 0.04);
        leaves.setColorAt(i * 3 + k, c);
      }
      if (t.inside) this.blockCircle(t.x, t.z, 0.5);
    });
    trunks.castShadow = leaves.castShadow = true;
    trunks.receiveShadow = leaves.receiveShadow = true;
    this.group.add(trunks, leaves);
    this.treePts = pts.filter(t => t.inside);
    // gresstuster og blomster
    const tuftG = new THREE.PlaneGeometry(0.7, 0.5).translate(0, 0.25, 0);
    const tg2 = tuftG.clone().rotateY(Math.PI / 2);
    const tg = mergeTwo(tuftG, tg2);
    const spots = [];
    for (let y = 0; y < TH; y++) for (let x = 0; x < TW; x++) {
      const k = this.idx(x, y);
      if (this.grid[k] !== FLOOR || this.ground[k] !== GR.GRASS || this.buildingOf(x, y)) continue;
      let edge = 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (this.ground[this.idx(x + dx, y + dy)] !== GR.GRASS || this.grid[this.idx(x + dx, y + dy)] !== FLOOR) edge++;
      const n = 2 + edge * 2;
      for (let j = 0; j < n; j++) spots.push([(x + R(k, j * 2)) * T, (y + R(k, j * 2 + 1)) * T, R(k, j + 50)]);
    }
    const tufts = new THREE.InstancedMesh(tg, M.tuft, spots.length);
    spots.forEach(([x, z, r], i) => {
      e.set(0, r * 6, 0);
      q.setFromEuler(e);
      const sc = 0.7 + r * 0.7;
      s.set(sc, sc * (0.8 + r * 0.5), sc);
      p.set(x, 0, z);
      m4.compose(p, q, s);
      tufts.setMatrixAt(i, m4);
      c.setHSL(0.22 + r * 0.06, 0.4, 0.42 + r * 0.12);
      tufts.setColorAt(i, c);
    });
    tufts.receiveShadow = true;
    this.group.add(tufts);
    const flowerG = new THREE.SphereGeometry(0.06, 6, 4);
    const fl = spots.filter(sp => sp[2] > 0.82);
    const flowers = new THREE.InstancedMesh(flowerG, M.flower, fl.length);
    fl.forEach(([x, z, r], i) => {
      p.set(x + 0.2, 0.32 + r * 0.1, z + 0.1);
      q.identity();
      s.setScalar(1);
      m4.compose(p, q, s);
      flowers.setMatrixAt(i, m4);
      c.setHex([0xf0e060, 0xf4f0ea, 0xb070d0, 0xe06050][Math.floor(r * 37) % 4]);
      flowers.setColorAt(i, c);
    });
    this.group.add(flowers);
  }

  // --- liv i byen ---------------------------------------------------------------------
  populate(W) {
    this.world = W;
    const M = this.M;
    for (const t of this.treePts || []) G.props.push({ type: 'tree', mesh: null, pos: new THREE.Vector3(t.x, 0, t.z), radius: 0.42, breakable: false });
    // gatelykter
    const LAMPS = [[16.4, 6.0], [20.5, 10.0], [12.4, 16.9], [25.7, 17.3], [13.3, 26.7], [25.7, 26.7], [29.5, 20.4], [33.5, 23.4], [16.5, 33.0], [20.5, 36.0], [6.0, 20.4], [38.0, 20.4], [35.0, 12.4], [33.4, 35.0], [16.5, 41.3],
      [16.6, 23.4], [21.4, 20.4], [28.6, 14.4], [14.5, 7.2], [13.4, 29.6], [22.4, 28.4], [21.4, 38.6], [11.4, 13.4]];
    const iron = new Mesher();
    const lampGlass = new Mesher();
    for (const [lx, ly] of LAMPS) {
      if (this.get(Math.floor(lx), Math.floor(ly)) !== FLOOR) continue;
      const x = U(lx), z = U(ly);
      iron.box(x - 0.16, 0, z - 0.16, x + 0.16, 0.3, z + 0.16, { uv: 'world', col: [0.5, 0.5, 0.52] });
      iron.box(x - 0.055, 0.3, z - 0.055, x + 0.055, 2.75, z + 0.055, { uv: 'world', col: [0.5, 0.5, 0.52] });
      iron.box(x - 0.2, 2.75, z - 0.2, x + 0.2, 2.82, z + 0.2, { uv: 'world', col: [0.5, 0.5, 0.52] });
      iron.box(x - 0.15, 3.25, z - 0.15, x + 0.15, 3.32, z + 0.15, { uv: 'world', col: [0.5, 0.5, 0.52] });
      lampGlass.box(x - 0.13, 2.82, z - 0.13, x + 0.13, 3.25, z + 0.13, { uv: 'world', col: [1, 1, 1] });
      W.flame(x, 2.88, z, 0xffb060, 0.42);
      const s = { pos: new THREE.Vector3(x, 3.0, z), color: new THREE.Color(0xffb468), intensity: 0, base: 20, phase: Math.random() * 10, lamp: true, dist: 13 };
      W.sources.push(s);
      this.lampSrc.push(s);
      this.blockCircle(x, z, 0.3);
      G.props.push({ type: 'lamp', mesh: null, pos: new THREE.Vector3(x, 0, z), radius: 0.22, breakable: false });
    }
    this.addMesh(iron, M.iron, true, true);
    this.addMesh(lampGlass, MAT.lampGlass, false, false);
    this.lampFlames = W.flames.slice();
    // ildsteder og smia
    for (const h of this.hearths) {
      W.flame(h.x, 0.12, h.z, h.forge ? 0xff7a30 : 0xff9a40, h.forge ? 0.9 : 0.8, 1.8);
      const b = this.insideAt(h.x, h.z);
      const s = { pos: new THREE.Vector3(h.x, 1.2, h.z), color: new THREE.Color(h.forge ? 0xff7a38 : 0xff9a50), intensity: 22, base: 22, phase: Math.random() * 10, ember: true, dist: 9, inside: b?.id };
      W.sources.push(s);
      this.innerSrc.push(s);
    }
    // fyrfat i tempelet og lys i ordenshuset og tårnet
    for (const [x, z, col, inside, k] of [[23.0, 6.8, 0xffc060, 'temple', 1.2], [27.0, 6.8, 0xffc060, 'temple', 1.2], [37.5, 8.4, 0xffd090, 'chapter', 0.5], [37.4, 16.6, 0x9a80ff, 'tower', 0.6]]) {
      const wx = U(x), wz = U(z);
      if (k > 1) {
        const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.22, 0.3, 10), MAT.gold);
        bowl.position.set(wx, 1.0, wz);
        const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.18, 0.9, 8), MAT.gold);
        stand.position.set(wx, 0.45, wz);
        this.group.add(bowl, stand);
        W.flame(wx, 1.1, wz, col, 1.1, 1.8);
        this.addBlock(wx - 0.35, wz - 0.35, wx + 0.35, wz + 0.35);
        this.incense.push({ x: wx, y: 1.75, z: wz, t: Math.random() });
      } else if (inside === 'tower') {
        const orb = new THREE.Mesh(new THREE.SphereGeometry(0.22, 18, 14), new THREE.MeshStandardMaterial({ color: 0x2a1a5a, emissive: 0x8a6aff, emissiveIntensity: 1.6, roughness: 0.1 }));
        orb.position.set(wx, 1.06, wz);
        this.group.add(orb);
        this.orb = orb;
      } else {
        for (const o of [-0.6, 0, 0.6]) {
          const c = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.22, 6), MAT.paper);
          c.position.set(wx + o, 0.89, wz);
          this.group.add(c);
          W.flame(wx + o, 1.0, wz, 0xffc070, 0.22);
        }
      }
      const s = { pos: new THREE.Vector3(wx, 1.8, wz), color: new THREE.Color(col), intensity: 18 * k, base: 18 * k, phase: Math.random() * 10, dist: 9, inside, steady: inside === 'tower' };
      W.sources.push(s);
      this.innerSrc.push(s);
    }
    // lys gjennom taket i tempelet, synlig om dagen når du står inne
    {
      const mat = shaftMaterial(0xffe2a8, 0.36);
      const h = 4.6;
      const geo = new THREE.CylinderGeometry(0.75, 1.5, h, 24, 1, true).translate(0, h / 2, 0);
      const shaft = new THREE.Mesh(geo, mat);
      shaft.position.set(U(25), 0, U(9.6));
      shaft.rotation.z = 0.16;
      shaft.renderOrder = 7;
      const pool = new THREE.Mesh(new THREE.CircleGeometry(1.7, 28).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: G.assets.glowTex, color: 0xffd8a0, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending, depthWrite: false }));
      pool.position.set(U(25) + 0.35, 0.03, U(9.6));
      this.group.add(shaft, pool);
      this.templeShaft = { shaft, pool, mat };
    }
    this.buildSquareProps(W);
    this.life = new TownLife(this, W);
  }

  buildSquareProps(W) {
    const M = this.M;
    const F = { wood: new Mesher(), stone: new Mesher(), cloth: new Mesher(), paint: new Mesher(), iron: new Mesher() };
    // brønnen
    const wx = U(15.6), wz = U(19.2);
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.0, 0.85, 16, 1, true), MAT.stonePlain);
    ring.position.set(wx, 0.42, wz);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.97, 0.12, 6, 18).rotateX(Math.PI / 2), MAT.stonePlain);
    rim.position.set(wx, 0.85, wz);
    const water = new THREE.Mesh(new THREE.CircleGeometry(0.85, 16).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0x0a1a20, roughness: 0.1, metalness: 0.4 }));
    water.position.set(wx, 0.35, wz);
    for (const m of [ring, rim]) { m.castShadow = true; m.receiveShadow = true; }
    this.group.add(ring, rim, water);
    F.wood.box(wx - 1.05, 0, wz - 0.07, wx - 0.9, 2.2, wz + 0.07, { uv: 'world', col: [0.5, 0.36, 0.24] });
    F.wood.box(wx + 0.9, 0, wz - 0.07, wx + 1.05, 2.2, wz + 0.07, { uv: 'world', col: [0.5, 0.36, 0.24] });
    F.wood.box(wx - 1.1, 1.75, wz - 0.05, wx + 1.1, 1.85, wz + 0.05, { uv: 'world', col: [0.45, 0.32, 0.2] });
    const wr = new THREE.Mesh(this.gableGeo(2.6, 1.4, 0.6), roofMats({ id: 'well', roof: 'shingle', style: 'timber' }).roof);
    wr.position.set(wx, 2.15, wz);
    wr.castShadow = true;
    this.group.add(wr);
    F.wood.box(wx - 0.14, 1.2, wz - 0.12, wx + 0.14, 1.45, wz + 0.12, { uv: 'world', col: [0.55, 0.4, 0.26] });
    G.props.push({ type: 'well', mesh: ring, pos: new THREE.Vector3(wx, 0, wz), radius: 1.05, breakable: false });
    this.blockCircle(wx, wz, 1);
    this.well = { x: wx, z: wz };
    // salgsboder med markiser
    this.stalls = [
      { id: 'spice', x: 14.6, z: 24.0, face: -1, col: [0.62, 0.16, 0.14], goods: [[0.85, 0.45, 0.1], [0.6, 0.12, 0.08], [0.9, 0.75, 0.2], [0.4, 0.25, 0.12]] },
      { id: 'fish', x: 22.6, z: 18.7, face: 1, col: [0.16, 0.34, 0.6], goods: [[0.7, 0.74, 0.78], [0.55, 0.6, 0.66], [0.75, 0.7, 0.62]] },
      { id: 'veg', x: 22.4, z: 24.5, face: -1, col: [0.24, 0.5, 0.22], goods: [[0.85, 0.5, 0.15], [0.42, 0.62, 0.22], [0.7, 0.18, 0.2], [0.85, 0.8, 0.4]] },
    ];
    for (const s of this.stalls) {
      const x = U(s.x), z = U(s.z);
      const w = 1.3, d = 0.55;
      F.wood.box(x - w, 0, z - d, x + w, 0.9, z + d, { uv: 'world', col: [0.56, 0.42, 0.28] });
      F.wood.box(x - w - 0.05, 0.9, z - d - 0.05, x + w + 0.05, 0.96, z + d + 0.05, { uv: 'world', col: [0.48, 0.34, 0.22] });
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
        const h = sz === s.face ? 2.1 : 2.5;
        F.wood.box(x + sx * w - 0.05, 0.9, z + sz * (d + 0.4) - 0.05, x + sx * w + 0.05, h, z + sz * (d + 0.4) + 0.05, { uv: 'world', col: [0.5, 0.36, 0.24] });
      }
      // markise, stripet
      const n = 8;
      for (let i = 0; i < n; i++) {
        const a0 = x - w - 0.1 + (i / n) * (2 * w + 0.2), a1 = x - w - 0.1 + ((i + 1) / n) * (2 * w + 0.2);
        const c = i % 2 ? s.col : [0.92, 0.88, 0.8];
        const zF = z + s.face * (d + 0.6), zB = z - s.face * (d + 0.5);
        F.cloth.quad([[a0, 2.1, zF], [a1, 2.1, zF], [a1, 2.55, zB], [a0, 2.55, zB]], [0, 0.94, s.face * 0.34], [[0, 0], [1, 0], [1, 1], [0, 1]], c);
        F.cloth.quad([[a0, 2.1, zF], [a0, 2.55, zB], [a1, 2.55, zB], [a1, 2.1, zF]], [0, -0.94, -s.face * 0.34], [[0, 0], [1, 0], [1, 1], [0, 1]], c.map(v => v * 0.6));
        F.cloth.box(a0, 1.88, zF - 0.01, a1, 2.1, zF + 0.01, { uv: 'world', col: c });
      }
      // varer
      s.goods.forEach((gc, i) => {
        const gx = x - w + 0.35 + i * ((2 * w - 0.7) / Math.max(1, s.goods.length - 1));
        F.paint.box(gx - 0.2, 0.96, z - 0.22, gx + 0.2, 1.06, z + 0.22, { uv: 'world', col: [0.5, 0.38, 0.24] });
        for (let k = 0; k < 5; k++) F.paint.box(gx - 0.16 + (k % 3) * 0.12, 1.06, z - 0.15 + Math.floor(k / 3) * 0.16, gx - 0.06 + (k % 3) * 0.12, 1.14 + (k % 2) * 0.03, z - 0.05 + Math.floor(k / 3) * 0.16, { uv: 'world', col: gc });
      });
      this.addBlock(x - w, z - d, x + w, z + d);
    }
    // oppslagstavla
    const bx = U(20.8), bz = U(17.25);
    F.wood.box(bx - 1.0, 0, bz - 0.06, bx - 0.88, 2.2, bz + 0.06, { uv: 'world', col: [0.45, 0.32, 0.2] });
    F.wood.box(bx + 0.88, 0, bz - 0.06, bx + 1.0, 2.2, bz + 0.06, { uv: 'world', col: [0.45, 0.32, 0.2] });
    F.wood.box(bx - 0.95, 0.9, bz - 0.04, bx + 0.95, 2.0, bz + 0.04, { uv: 'world', col: [0.55, 0.4, 0.26] });
    F.wood.box(bx - 1.1, 2.0, bz - 0.25, bx + 1.1, 2.12, bz + 0.25, { uv: 'world', col: [0.4, 0.28, 0.18] });
    for (const [px, py, pw, ph] of [[-0.6, 1.6, 0.42, 0.5], [-0.05, 1.45, 0.5, 0.62], [0.55, 1.65, 0.4, 0.42], [0.45, 1.1, 0.36, 0.3], [-0.55, 1.08, 0.4, 0.28]]) {
      F.paint.box(bx + px - pw / 2, py - ph / 2, bz + 0.04, bx + px + pw / 2, py + ph / 2, bz + 0.055, { uv: 'world', col: [0.92, 0.88, 0.76] });
    }
    this.addBlock(bx - 1.0, bz - 0.15, bx + 1.0, bz + 0.15, true);
    this.board = { x: bx, z: bz + 0.6 };
    // kloakkluken
    const gx = U(12.6), gz = U(23.4);
    F.stone.box(gx - 0.85, 0, gz - 0.85, gx + 0.85, 0.08, gz + 0.85, { vs: 2, us: 2, col: [0.7, 0.68, 0.64] });
    for (let i = -3; i <= 3; i++) F.iron.box(gx + i * 0.2 - 0.04, 0.08, gz - 0.62, gx + i * 0.2 + 0.04, 0.12, gz + 0.62, { uv: 'world', col: [0.45, 0.45, 0.48] });
    F.iron.box(gx - 0.66, 0.08, gz - 0.66, gx + 0.66, 0.11, gz - 0.58, { uv: 'world', col: [0.45, 0.45, 0.48] });
    F.iron.box(gx - 0.66, 0.08, gz + 0.58, gx + 0.66, 0.11, gz + 0.66, { uv: 'world', col: [0.45, 0.45, 0.48] });
    const hole = new THREE.Mesh(new THREE.PlaneGeometry(1.24, 1.24).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0x000000 }));
    hole.position.set(gx, 0.085, gz);
    this.group.add(hole);
    this.grate = { x: gx, z: gz };
    // minnesteinen for Tornväktarordens martyrer
    const mx = U(38.6), mz = U(12.9);
    F.stone.box(mx - 0.5, 0, mz - 0.3, mx + 0.5, 0.25, mz + 0.3, { vs: 2, us: 2, col: [0.8, 0.78, 0.74] });
    F.stone.box(mx - 0.36, 0.25, mz - 0.16, mx + 0.36, 2.0, mz + 0.16, { vs: 2, us: 2, col: [0.86, 0.84, 0.8] });
    const runes = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 1.3), new THREE.MeshBasicMaterial({ map: G.gfx.runeStrips[2], color: 0xd8c8a0, transparent: true, opacity: 0.55, depthWrite: false }));
    runes.position.set(mx, 1.15, mz + 0.17);
    this.group.add(runes);
    this.addBlock(mx - 0.5, mz - 0.3, mx + 0.5, mz + 0.3);
    this.memorial = { x: mx, z: mz + 0.9 };
    // solur foran tempelet
    const sx = U(24.9), sz = U(15.6);
    const dial = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.62, 0.9, 12), MAT.stonePlain);
    dial.position.set(sx, 0.45, sz);
    dial.castShadow = dial.receiveShadow = true;
    const face = new THREE.Mesh(new THREE.CircleGeometry(0.5, 24).rotateX(-Math.PI / 2), MAT.gold);
    face.position.set(sx, 0.91, sz);
    const gnomon = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.4, 0.45), MAT.gold);
    gnomon.position.set(sx, 1.05, sz);
    gnomon.rotation.x = -0.5;
    this.group.add(dial, face, gnomon);
    G.props.push({ type: 'sundial', mesh: dial, pos: new THREE.Vector3(sx, 0, sz), radius: 0.62, breakable: false });
    this.blockCircle(sx, sz, 0.6);
    this.sundial = { x: sx, z: sz };
    // kirkegården
    const stones = [];
    for (const gx2 of [35.8, 37.0, 38.2, 39.4]) for (const gz2 of [24.7, 26.3, 27.9]) {
      if (Math.hypot(gx2 - 40.6, gz2 - 27.6) < 1.2) continue;
      stones.push([gx2 + (hash2(gx2 * 10, gz2 * 10, 3) - 0.5) * 0.3, gz2]);
    }
    for (const [x2, z2] of stones) {
      const x = U(x2), z = U(z2), h = 0.7 + hash2(x2 * 7, z2 * 7, 4) * 0.4;
      F.stone.box(x - 0.3, 0, z - 0.09, x + 0.3, h, z + 0.09, { vs: 2, us: 2, col: [0.72, 0.72, 0.7] });
      const top = new THREE.Mesh(this.stoneTopGeo || (this.stoneTopGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.18, 12).rotateX(Math.PI / 2)), MAT.stonePlain);
      top.position.set(x, h, z);
      top.castShadow = true;
      this.group.add(top);
      this.addBlock(x - 0.3, z - 0.1, x + 0.3, z + 0.1);
    }
    // benker
    for (const [x, z, horiz] of [[25.3, 23.6, false], [12.8, 20.2, false], [20.2, 26.4, true]]) {
      const X = U(x), Z = U(z);
      const w = 0.8;
      if (horiz) F.wood.box(X - w, 0.42, Z - 0.2, X + w, 0.5, Z + 0.2, { uv: 'world', col: [0.5, 0.36, 0.24] });
      else F.wood.box(X - 0.2, 0.42, Z - w, X + 0.2, 0.5, Z + w, { uv: 'world', col: [0.5, 0.36, 0.24] });
      for (const s of [-1, 1]) {
        if (horiz) F.stone.box(X + s * (w - 0.15) - 0.1, 0, Z - 0.18, X + s * (w - 0.15) + 0.1, 0.42, Z + 0.18, { vs: 2, us: 2, col: [0.8, 0.78, 0.74] });
        else F.stone.box(X - 0.18, 0, Z + s * (w - 0.15) - 0.1, X + 0.18, 0.42, Z + s * (w - 0.15) + 0.1, { vs: 2, us: 2, col: [0.8, 0.78, 0.74] });
      }
      if (horiz) this.addBlock(X - w, Z - 0.2, X + w, Z + 0.2); else this.addBlock(X - 0.2, Z - w, X + 0.2, Z + w);
    }
    // tønner og kasser
    for (const [x, z] of [[12.4, 14.4], [12.35, 15.1], [14.4, 10.6], [26.4, 28.2], [34.45, 17.4], [20.5, 30.5]]) this.barrel(U(x), U(z), 0.9);
    for (const [x, z] of [[14.3, 11.4], [27.6, 28.3], [34.45, 16.6], [20.4, 31.4]]) this.crate(U(x), U(z), 0.85);
    // tiggerkongens leir ved brofestet
    F.cloth.box(U(29.2), 0.01, U(24.9), U(29.9), 0.08, U(25.9), { uv: 'world', col: [0.42, 0.34, 0.26] });
    const cx2 = U(29.6), cz2 = U(24.5);
    for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; F.stone.box(cx2 + Math.cos(a) * 0.28 - 0.07, 0, cz2 + Math.sin(a) * 0.28 - 0.07, cx2 + Math.cos(a) * 0.28 + 0.07, 0.12, cz2 + Math.sin(a) * 0.28 + 0.07, { vs: 2, us: 2, col: [0.6, 0.58, 0.55] }); }
    W.flame(cx2, 0.05, cz2, 0xff8a40, 0.45);
    const camp = { pos: new THREE.Vector3(cx2, 0.8, cz2), color: new THREE.Color(0xff8a48), intensity: 8, base: 8, phase: 2, ember: true, dist: 6, lampish: true };
    W.sources.push(camp);
    this.lampSrc.push(camp);
    // skilt over dørene
    this.signs(F);
    // Tornväktarordens faner og Zorakins faner ved porten
    const TX = townTextures();
    const bannerAt = (tex, x, y, z, ry) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 2.0).translate(0, -1, 0), new THREE.MeshStandardMaterial({ map: tex, side: THREE.DoubleSide, alphaTest: 0.5, roughness: 0.9 }));
      m.position.set(x, y, z);
      m.rotation.y = ry;
      m.castShadow = true;
      this.group.add(m);
      W.anim.push(t => { m.rotation.x = Math.sin(t * 1.3 + x) * 0.04; });
    };
    bannerAt(TX.bannerTorn, U(36.2), 3.5, U(11.5) + HT + 0.03, 0);
    bannerAt(TX.bannerTorn, U(38.8), 3.5, U(11.5) + HT + 0.03, 0);
    bannerAt(TX.bannerSol, U(16.0), 5.9, U(4.0) + T + 0.03, 0);
    bannerAt(TX.bannerSol, U(21.0), 5.9, U(4.0) + T + 0.03, 0);
    for (const k in F) this.addMesh(F[k], k === 'wood' ? M.wood : k === 'stone' ? M.stone : k === 'cloth' ? M.cloth : k === 'iron' ? M.iron : M.paint, true, true);
  }

  signs(F) {
    const list = [
      ['inn', 'DEN FEITE GÅSEN', 'vertshus'], ['shop', 'HVASS HANDEL', 'krambod'], ['smithy', 'SMIE', 'Bataar fra Karad Batur'],
      ['dojo', 'KVAKK-FU', 'Mester Flansen'], ['tower', 'GYNERVA', 'trollkyndig'],
    ];
    for (const [id, text, sub] of list) {
      const b = this.buildings.find(x => x.id === id);
      const [dx, dy] = b.doors[0];
      const horiz = dy === b.y0 || dy === b.y1;
      const out = horiz ? (dy === b.y0 ? -1 : 1) : (dx === b.x0 ? -1 : 1);
      const cx = (dx + 0.5) * T, cz = (dy + 0.5) * T;
      // skiltet henger på en arm ved siden av døra, vinkelrett på veggen
      const along = 1.3;
      const sx = horiz ? cx + along : cx + out * (HT + 0.65);
      const sz = horiz ? cz + out * (HT + 0.65) : cz - along;
      const y = Math.min(b.wallH - 0.4, 2.65);
      const tex = signTexture(text, sub);
      const sm = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.8 });
      const sg = new THREE.PlaneGeometry(1.25, 0.39);
      for (const s of [1, -1]) {
        const p = new THREE.Mesh(sg, sm);
        p.position.set(sx, y, sz);
        p.rotation.y = horiz ? (s > 0 ? Math.PI / 2 : -Math.PI / 2) : (s > 0 ? 0 : Math.PI);
        if (horiz) p.position.x += s * 0.022; else p.position.z += s * 0.022;
        this.group.add(p);
      }
      // ramme og arm
      if (horiz) {
        F.iron.box(sx - 0.02, y + 0.2, Math.min(cz + out * HT, sz + out * 0.66), sx + 0.02, y + 0.25, Math.max(cz + out * HT, sz + out * 0.66), { uv: 'world', col: [0.4, 0.4, 0.42] });
        F.paint.box(sx - 0.02, y - 0.21, sz - 0.64, sx + 0.02, y + 0.21, sz + 0.64, { uv: 'world', col: [0.3, 0.2, 0.12], skip: { px: true, nx: true } });
      } else {
        F.iron.box(Math.min(cx + out * HT, sx + out * 0.66), y + 0.2, sz - 0.02, Math.max(cx + out * HT, sx + out * 0.66), y + 0.25, sz + 0.02, { uv: 'world', col: [0.4, 0.4, 0.42] });
        F.paint.box(sx - 0.64, y - 0.21, sz - 0.02, sx + 0.64, y + 0.21, sz + 0.02, { uv: 'world', col: [0.3, 0.2, 0.12], skip: { pz: true, nz: true } });
      }
    }
  }

  gableGeo(w, h, d) {
    // lite saltak for brønnen
    const m = new Mesher();
    const hw = w / 2, hd = d / 2 + 0.6;
    m.quad([[-hw, 0, -hd], [hw, 0, -hd], [hw, h * 0.5, 0], [-hw, h * 0.5, 0]], [0, 0.8, -0.6], [[0, 0], [w / 1.8, 0], [w / 1.8, 0.8], [0, 0.8]], [1, 1, 1]);
    m.quad([[-hw, 0, hd], [hw, 0, hd], [hw, h * 0.5, 0], [-hw, h * 0.5, 0]], [0, 0.8, 0.6], [[0, 0], [w / 1.8, 0], [w / 1.8, 0.8], [0, 0.8]], [1, 1, 1]);
    return m.geometry();
  }

  // --- per bilde ---------------------------------------------------------------------------
  update(dt, P, sky) {
    this.timeT += dt;
    const ins = this.insideAt(P.pos.x, P.pos.z);
    this.insideId = ins?.id || null;
    for (const b of this.buildings) {
      const want = b === ins ? 0 : 1;
      b.roofA += (want - b.roofA) * Math.min(1, dt * 6);
      if (Math.abs(b.roofA - want) < 0.01) b.roofA = want;
      for (const m of b.roofMats) m.opacity = b.roofA;
      b.roofG.visible = b.roofA > 0.02;
      const sh = b.roofA > 0.5;
      if (sh !== b.shadowOn) { b.shadowOn = sh; b.roofG.traverse(o => { if (o.isMesh) o.castShadow = sh; }); }
      const low = b.roofA < 0.5;
      if (low !== b.frontLow) {
        b.frontLow = low;
        b.frontFull.visible = !low;
        b.frontLowG.visible = low;
      }
    }
    // pipene ryker
    for (const s of this.smokers) {
      s.t -= dt;
      if (s.t <= 0 && s.b.roofA > 0.3) {
        s.t = 0.35 + Math.random() * 0.3;
        if (Math.abs(s.x - P.pos.x) + Math.abs(s.z - P.pos.z) < 40) G.fx.burst('chimney', { x: s.x, y: s.y, z: s.z }, 1);
      }
    }
    // lys etter tid på døgnet
    const night = sky ? sky.night : 0.5;
    const lit = Math.min(1, Math.max(0, (night - 0.15) / 0.5));
    for (const s of this.lampSrc) s.intensity = s.base * lit;
    for (const f of this.lampFlames || []) f.visible = lit > 0.05;
    MAT.lampGlass.emissiveIntensity = 0.15 + lit * 2.2;
    MAT.glass.emissiveIntensity = 0.06 + lit * 1.5;
    for (const s of this.innerSrc) s.enabled = !s.inside || s.inside === this.insideId;
    if (this.waterMat && sky) {
      this.waterMat.uniforms.uDeep.value.setHex(0x113440).lerp(cA.setHex(0x081624), night);
      this.waterMat.uniforms.uShallow.value.setHex(0x2a6272).lerp(cA.setHex(0x1a3a52), night);
    }
    if (this.orb) this.orb.scale.setScalar(1 + Math.sin(this.timeT * 2) * 0.06);
    // røkelse fra fyrfatene i tempelet
    for (const r of this.incense) {
      r.t -= dt;
      if (r.t > 0 || Math.abs(r.x - P.pos.x) + Math.abs(r.z - P.pos.z) > 24) continue;
      r.t = 0.16 + Math.random() * 0.12;
      G.fx.burst('incense', r, 1);
    }
    if (this.templeShaft) {
      const day = Math.max(0, 1 - night * 1.6) * (1 - (G.weather?.cloud || 0) * 0.6);
      const on = this.insideId === 'temple' && day > 0.05;
      this.templeShaft.shaft.visible = this.templeShaft.pool.visible = on;
      this.templeShaft.mat.uniforms.uTime.value = this.timeT;
      this.templeShaft.mat.uniforms.uStr.value = 0.36 * day;
      this.templeShaft.pool.material.opacity = 0.4 * day;
    }
    if (this.forgeCoal) this.forgeCoal.material.emissiveIntensity = 0.9 + Math.sin(this.timeT * 5) * 0.2 + Math.sin(this.timeT * 13) * 0.08;
    if (this.life) this.life.update(dt, P, sky);
  }

  dispose() {
    if (this.life) this.life.dispose();
    super.dispose();
  }
}

function pushBox(p, r, x0, z0, x1, z1) {
  const cx = Math.max(x0, Math.min(p.x, x1)), cz = Math.max(z0, Math.min(p.z, z1));
  const dx = p.x - cx, dz = p.z - cz;
  const d2 = dx * dx + dz * dz;
  if (d2 >= r * r) return false;
  if (d2 > 1e-8) {
    const dd = Math.sqrt(d2);
    p.x += (dx / dd) * (r - dd);
    p.z += (dz / dd) * (r - dd);
  } else {
    const l = p.x - x0, rg = x1 - p.x, u = p.z - z0, dn = z1 - p.z;
    const m = Math.min(l, rg, u, dn);
    if (m === l) p.x = x0 - r; else if (m === rg) p.x = x1 + r; else if (m === u) p.z = z0 - r; else p.z = z1 + r;
  }
  return true;
}

function mergeTwo(a, b) {
  const g = new THREE.BufferGeometry();
  const pos = [...a.attributes.position.array, ...b.attributes.position.array];
  const nrm = [...a.attributes.normal.array, ...b.attributes.normal.array];
  const uv = [...a.attributes.uv.array, ...b.attributes.uv.array];
  const n = a.attributes.position.count;
  const idx = [...a.index.array, ...[...b.index.array].map(i => i + n)];
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  return g;
}

export { U as tileToWorld };
