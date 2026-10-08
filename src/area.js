// Områdene utenfor Fristaden: skogen, landsbyene, borgene og leiren i Edelfara.
// Area bygger på Town (hus med tak som løftes bort, folk med døgnrytme), men leser kartet fra
// en layout i edelmap.js. Skog er WALL-fliser med trær, åser er WALL-skiver med en haug over.
import * as THREE from 'three';
import { G, T } from './state.js';
import { FLOORS, makeWaterMaterial } from './dungeon.js';
import { Town, Mesher, materials, HT, WATER_BOTTOM, WATER_Y, tileToWorld as U } from './town.js';
import { WALL, FLOOR, WATER, HOUSE, FENCE, GR, TW, TH } from './townmap.js';
import { hash2, buildChest, buildBarrel, buildCrate } from './assets.js';
import { townTextures, signTexture } from './towntex.js';
import { addWetness, addSway } from './wet.js';
import { AreaLife } from './arealife.js';
import { buildAreaGrid, K_FOREST, K_DEEP, K_HILL, K_WALL } from './areagrid.js';

const E = 30; // så mange fliser bakken og vannet fortsetter utenfor kartet
const idx = (x, y) => y * TW + x;
const inMap = (x, y) => x >= 0 && y >= 0 && x < TW && y < TH;
const clampT = (v, n) => Math.max(0, Math.min(n - 1, v));
const H = (x, y, s) => hash2(Math.floor(x), Math.floor(y), s);

// --- våpenskjold og plakater -----------------------------------------------------------------
const texCache = {};
function canvasTex(key, w, h, draw) {
  if (texCache[key]) return texCache[key];
  const cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  draw(cv.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  texCache[key] = t;
  return t;
}
// Fanene er spillets egne: boka sier ikke hva husene fører i skjoldet.
// Natthök (greven): en svart nattfalk på sølv. Eke: en grønn eik på gull. Ridderskors: et rødt kors på hvitt.
export function heraldry(kind) {
  return canvasTex('her_' + kind, 128, 256, (g, W, Hh) => {
    const bg = { edelfara: '#d8dce4', eke: '#d8b048', ridderskors: '#ece6d8', lekh: '#141014' }[kind] || '#888';
    g.fillStyle = bg;
    g.beginPath(); g.moveTo(0, 0); g.lineTo(W, 0); g.lineTo(W, Hh - 36); g.lineTo(W / 2, Hh); g.lineTo(0, Hh - 36); g.closePath(); g.fill();
    g.strokeStyle = kind === 'lekh' ? '#6a1010' : '#2a2420';
    g.lineWidth = 5;
    g.strokeRect(9, 9, W - 18, Hh - 70);
    if (kind === 'edelfara') {
      g.fillStyle = '#16161c';
      g.beginPath();
      g.moveTo(64, 70); g.lineTo(20, 110); g.lineTo(52, 104); g.lineTo(64, 150); g.lineTo(76, 104); g.lineTo(108, 110); g.closePath(); g.fill();
      g.beginPath(); g.arc(64, 80, 11, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#d8b048'; g.beginPath(); g.arc(68, 78, 3, 0, Math.PI * 2); g.fill();
    } else if (kind === 'eke') {
      g.fillStyle = '#2a5a24';
      g.fillRect(58, 110, 12, 50);
      for (const [x, y, r] of [[64, 84, 26], [44, 100, 20], [84, 100, 20], [64, 108, 18]]) { g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); }
    } else if (kind === 'ridderskors') {
      g.fillStyle = '#a01818';
      g.fillRect(54, 46, 20, 120);
      g.fillRect(24, 86, 80, 20);
    } else if (kind === 'lekh') {
      g.fillStyle = '#8a1a14';
      g.beginPath(); g.ellipse(64, 100, 34, 18, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#e0c040';
      g.beginPath(); g.ellipse(64, 100, 9, 15, 0, 0, Math.PI * 2); g.fill();
    }
  });
}
// Plakaten i Sortmund: «Efterlyses ... TIO GULDMYNT» (s. 3)
export function posterTex() {
  return canvasTex('poster', 128, 160, (g, W, Hh) => {
    g.fillStyle = '#e4d6b4'; g.fillRect(0, 0, W, Hh);
    g.fillStyle = 'rgba(120,90,50,0.25)';
    for (let i = 0; i < 30; i++) g.fillRect(Math.random() * W, Math.random() * Hh, 3, 3);
    g.fillStyle = '#2a1a10';
    g.textAlign = 'center';
    g.font = 'bold 19px Georgia, serif'; g.fillText('EFTERLYSES', W / 2, 30);
    g.font = '11px Georgia, serif';
    for (const [i, t] of ['Den som griper den eller de', 'våldsmän som bragte', 'Riddar Kettil Ormstunga', 'om livet, utlovas'].entries()) g.fillText(t, W / 2, 52 + i * 14);
    g.font = 'bold 17px Georgia, serif'; g.fillText('TIO GULDMYNT', W / 2, 122);
    g.font = 'italic 10px Georgia, serif'; g.fillText('Markis Ridderskors', W / 2, 146);
  });
}

// --- området --------------------------------------------------------------------------------
let PENDING = null;

export class Area extends Town {
  constructor(L, arrival = null) {
    PENDING = L;
    super(L.seed || 7, arrival || 'start');
    PENDING = null;
    this.L = L;
    this.areaId = L.id;
    this.isArea = true;
    this.peaceful = !!L.peaceful;
    this.peaceText = L.peaceText || null;
    this.lootDepth = L.lootDepth ?? 2;
    this.info = { ...FLOORS[0], name: L.name };
    const a = (arrival && L.arrivals[arrival]) || L.arrivals[L.defaultArrival] || Object.values(L.arrivals)[0];
    this.arrival = arrival || L.defaultArrival;
    this.start = { x: U(a.x), z: U(a.y) };
    this.startYaw = a.yaw ?? Math.PI * 0.5;
    this.flow = L.flow || [0.02, 0.01];
    this.anims = [];
  }

  gen() {
    const L = PENDING;
    const A = buildAreaGrid(L);
    this.ring = L.ring || null;
    this.river = null;
    this.gate = L.gate || null;
    this.towersList = L.towers || [];
    this.treeList = L.trees || [];
    this.spots = L.spots || {};
    this.hills = A.hills;
    this.fields = A.fields;
    this.grid.set(A.grid);
    this.ground = A.ground;
    this.bmap = A.bmap;
    this.doorMap = A.doorMap;
    this.bridgeMap = A.bridge;
    this.kind = A.kind;
    this.buildings = A.buildings.map((b, i) => ({ ...b, index: i, roofA: 1, frontLow: false }));
    this.shapes = new Array(TW * TH).fill(null);
    this.walkBlock = new Uint8Array(TW * TH);
    this.cityMask = new Uint8Array(TW * TH);
    for (let i = 0; i < TW * TH; i++) if (this.grid[i] === WALL && this.kind[i] === K_WALL) this.cityMask[i] = 1;
    this.pieces = [];
    for (let y = 0; y < TH; y++) for (let x = 0; x < TW; x++) {
      const v = this.get(x, y);
      if (v !== HOUSE && v !== FENCE) continue;
      const pc = this.wallPiece(x, y);
      this.pieces.push(pc);
      this.shapes[this.idx(x, y)] = pc.boxes.map(b => [b[0], b[1], b[2], b[3], 0]);
    }
    this.start = { x: U(23), z: U(23) };
  }

  isTower(x, y) {
    for (const t of this.towersList || []) if (x >= t[0] && x <= t[2] && y >= t[1] && y <= t[3]) return true;
    return false;
  }

  // vann og dypt vann (dypt vann er WALL, men ser ut som vann)
  waterTile(x, y) {
    const k = idx(clampT(x, TW), clampT(y, TH));
    return this.grid[k] === WATER || (this.grid[k] === WALL && this.kind[k] === K_DEEP) || this.bridgeMap[k] > 0;
  }

  build() {
    const M = materials();
    this.M = M;
    if (!M.forestFloor) {
      const TX = townTextures();
      // Gressteksturen er mørk i seg selv (bakken i byen får lys fra vertex-fargene),
      // så fargen her må ligge nær hvit, ellers blir kullen nesten svart.
      M.forestFloor = new THREE.MeshStandardMaterial({ map: TX.grass.map, roughness: 1, color: 0x9aa682 });
      M.hill = new THREE.MeshStandardMaterial({ map: TX.grass.map, normalMap: TX.grass.normalMap, roughness: 1, color: 0xdce4c8 });
      M.rock = new THREE.MeshStandardMaterial({ map: TX.stone.map, normalMap: TX.stone.normalMap, roughness: 0.95, color: 0x8a867c, flatShading: true });
      M.tent = new THREE.MeshStandardMaterial({ roughness: 0.95, vertexColors: true, side: THREE.DoubleSide });
      M.spruce = new THREE.MeshStandardMaterial({ roughness: 0.9, flatShading: true });
      addWetness(M.forestFloor, { puddles: false, k: 0.45 });
      addWetness(M.hill, { puddles: false, k: 0.45 });
      addSway(M.spruce, 'leaf');
    }
    this.buildGround(M);
    this.buildWater();
    if (this.ring) this.buildCityWall(M);
    this.buildHouses(M);
    this.buildOutside(M);
    G.scene.add(this.group);
  }

  buildWater() {
    const bottom = new Mesher(), side = new Mesher(), surf = new Mesher();
    const plat = this.L.plateau;
    for (let y = -E; y < TH + E; y++) for (let x = -E; x < TW + E; x++) {
      const inside = inMap(x, y);
      if (plat && !inside) continue;
      if (!this.waterTile(x, y)) continue;
      const X0 = x * T, Z0 = y * T, X1 = X0 + T, Z1 = Z0 + T;
      bottom.quadUp(X0, Z0, X1, Z1, WATER_BOTTOM, [0.32, 0.3, 0.26]);
      surf.quadUp(X0, Z0, X1, Z1, WATER_Y, [1, 1, 1]);
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        if (this.waterTile(x + dx, y + dy)) continue;
        const yy0 = WATER_BOTTOM, yy1 = 0;
        const col = [[0.42, 0.4, 0.36], [0.42, 0.4, 0.36], [0.8, 0.78, 0.7], [0.8, 0.78, 0.7]];
        if (dx === 1) side.quad([[X1, yy0, Z0], [X1, yy0, Z1], [X1, yy1, Z1], [X1, yy1, Z0]], [-1, 0, 0], [[Z0 / 2, yy0 / 2], [Z1 / 2, yy0 / 2], [Z1 / 2, yy1 / 2], [Z0 / 2, yy1 / 2]], col);
        else if (dx === -1) side.quad([[X0, yy0, Z0], [X0, yy0, Z1], [X0, yy1, Z1], [X0, yy1, Z0]], [1, 0, 0], [[Z0 / 2, yy0 / 2], [Z1 / 2, yy0 / 2], [Z1 / 2, yy1 / 2], [Z0 / 2, yy1 / 2]], col);
        else if (dy === 1) side.quad([[X0, yy0, Z1], [X1, yy0, Z1], [X1, yy1, Z1], [X0, yy1, Z1]], [0, 0, -1], [[X0 / 2, yy0 / 2], [X1 / 2, yy0 / 2], [X1 / 2, yy1 / 2], [X0 / 2, yy1 / 2]], col);
        else side.quad([[X0, yy0, Z0], [X1, yy0, Z0], [X1, yy1, Z0], [X0, yy1, Z0]], [0, 0, 1], [[X0 / 2, yy0 / 2], [X1 / 2, yy0 / 2], [X1 / 2, yy1 / 2], [X0 / 2, yy1 / 2]], col);
      }
    }
    this.addMesh(bottom, this.M.ground[GR.DIRT], false, true);
    this.addMesh(side, this.M.ground[GR.DIRT], false, true);
    this.waterMat = makeWaterMaterial();
    this.waterMat.uniforms.uDeep.value.setHex(0x113440);
    this.waterMat.uniforms.uShallow.value.setHex(0x2a6272);
    this.waterMat.uniforms.uGlint.value.setHex(0x4a8494);
    const wm = this.addMesh(surf, this.waterMat, false, false);
    if (wm) wm.renderOrder = 2;
  }

  buildCityWall(M) {
    super.buildCityWall(M);
  }

  // bakke utenfor kartet og under skogen, veier som fortsetter, åkrer, trær
  buildOutside(M) {
    const L = this.L;
    const plat = L.plateau;
    const floor = new Mesher(), low = new Mesher(), road = new Mesher(), cliff = new Mesher();
    const isFloorTile = (x, y) => {
      if (inMap(x, y)) {
        const k = idx(x, y);
        return this.grid[k] === WALL && this.kind[k] !== K_DEEP && this.kind[k] !== K_WALL;
      }
      return !this.waterTile(x, y);
    };
    for (let y = -E; y < TH + E; y++) {
      let run = null;
      const flush = () => {
        if (!run) return;
        const target = run.out && plat ? low : floor;
        target.quadUp(run.x0 * T, y * T, (run.x1 + 1) * T, (y + 1) * T, run.out && plat ? -plat.drop : -0.03, [1, 1, 1], 0.12);
        run = null;
      };
      for (let x = -E; x < TW + E; x++) {
        const ok = isFloorTile(x, y);
        const out = !inMap(x, y);
        if (ok && run && run.out === out) run.x1 = x;
        else { flush(); if (ok) run = { x0: x, x1: x, out }; }
      }
      flush();
    }
    this.addMesh(floor, L.open ? M.outside : M.forestFloor, false, true);
    if (plat) {
      this.addMesh(low, M.field, false, true);
      // klippekant rundt platået
      const d = -plat.drop;
      const c = [[0.6, 0.58, 0.54], [0.6, 0.58, 0.54], [0.95, 0.92, 0.86], [0.95, 0.92, 0.86]];
      const W0 = 0, W1 = TW * T, Z0 = 0, Z1 = TH * T;
      cliff.quad([[W0, d, Z1], [W1, d, Z1], [W1, 0, Z1], [W0, 0, Z1]], [0, 0, 1], [[0, d / 3], [W1 / 3, d / 3], [W1 / 3, 0], [0, 0]], c);
      cliff.quad([[W1, d, Z0], [W1, d, Z1], [W1, 0, Z1], [W1, 0, Z0]], [1, 0, 0], [[0, d / 3], [Z1 / 3, d / 3], [Z1 / 3, 0], [0, 0]], c);
      cliff.quad([[W0, d, Z0], [W1, d, Z0], [W1, 0, Z0], [W0, 0, Z0]], [0, 0, -1], [[0, d / 3], [W1 / 3, d / 3], [W1 / 3, 0], [0, 0]], c);
      cliff.quad([[W0, d, Z0], [W0, d, Z1], [W0, 0, Z1], [W0, 0, Z0]], [-1, 0, 0], [[0, d / 3], [Z1 / 3, d / 3], [Z1 / 3, 0], [0, 0]], c);
      this.addMesh(cliff, M.city, false, true);
      if (plat.lake) {
        const lk = plat.lake;
        const s = new Mesher();
        s.quadUp(lk[0] * T, lk[1] * T, lk[2] * T, lk[3] * T, -plat.drop + 0.04, [1, 1, 1]);
        // samme vannmateriale som resten, så WaterFX oppdaterer det
        const m = this.addMesh(s, this.waterMat, false, false);
        if (m) m.renderOrder = 2;
      }
    }
    // veiene fortsetter ut av kartet
    if (!plat) {
      const isRoad = (x, y) => { const k = idx(x, y); return this.grid[k] === FLOOR && (this.ground[k] === GR.DIRT || this.ground[k] === GR.COBBLE) && !this.bridgeMap[k]; };
      for (let x = 0; x < TW; x++) {
        if (isRoad(x, 0)) road.quadUp(x * T, -E * T, (x + 1) * T, 0, -0.015, [0.9, 0.86, 0.8], 0.34);
        if (isRoad(x, TH - 1)) road.quadUp(x * T, TH * T, (x + 1) * T, (TH + E) * T, -0.015, [0.9, 0.86, 0.8], 0.34);
      }
      for (let y = 0; y < TH; y++) {
        if (isRoad(0, y)) road.quadUp(-E * T, y * T, 0, (y + 1) * T, -0.015, [0.9, 0.86, 0.8], 0.34);
        if (isRoad(TW - 1, y)) road.quadUp(TW * T, y * T, (TW + E) * T, (y + 1) * T, -0.015, [0.9, 0.86, 0.8], 0.34);
      }
      this.addMesh(road, M.ground[GR.DIRT], false, true);
    }
    // åkrer med furer
    const fields = new Mesher();
    for (const f of this.fields) {
      const x0 = f.x0 * T, x1 = (f.x1 + 1) * T, z0 = f.y0 * T, z1 = (f.y1 + 1) * T;
      const col = f.crop === 'kal' ? [0.38, 0.56, 0.26] : f.crop === 'rug' ? [0.7, 0.62, 0.32] : [0.52, 0.62, 0.3];
      for (let z = z0 + 0.6; z < z1 - 0.3; z += 1.1) fields.box(x0 + 0.3, 0, z - 0.2, x1 - 0.3, f.crop === 'rug' ? 0.32 : 0.14, z + 0.2, { uv: 'world', us: 3, col, skip: { nx: true, px: true } });
    }
    this.addMesh(fields, M.field, false, true);
    this.buildTrees(M);
  }

  buildTrees(M) {
    const L = this.L;
    const plat = L.plateau;
    const R = (i, k) => hash2(i, k, 91);
    const pts = (L.trees || []).map(([x, y, sp]) => ({ x: U(x), z: U(y), inside: true, spruce: sp === 's', s: 1, hi: true }));
    // avstand til nærmeste åpne flis (skogen inne i kjernen trenger færre og større trær)
    const openNear = (x, y, r) => {
      for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) {
        const xx = x + i, yy = y + j;
        if (!inMap(xx, yy)) continue;
        if (this.grid[idx(xx, yy)] !== WALL) return true;
      }
      return false;
    };
    const B = 8;
    for (let y = -B; y < TH + B; y++) for (let x = -B; x < TW + B; x++) {
      const inside = inMap(x, y);
      let p, big = 1;
      if (inside) {
        const k = idx(x, y);
        if (this.grid[k] !== WALL || this.kind[k] !== K_FOREST) continue;
        if (openNear(x, y, 2)) p = 0.9;
        else { p = 0.5; big = 1.35; }
      } else {
        if (plat || this.waterTile(x, y)) continue;
        // ikke på veiene som går ut av kartet
        const cx = clampT(x, TW), cy = clampT(y, TH), ck = idx(cx, cy);
        if (this.grid[ck] === FLOOR && (this.ground[ck] === GR.DIRT || this.ground[ck] === GR.COBBLE)) continue;
        const dd = Math.max(x < 0 ? -x : x >= TW ? x - TW + 1 : 0, y < 0 ? -y : y >= TH ? y - TH + 1 : 0);
        // åpent landskap (Sortmund, Glimming): bare spredte trær utenfor kartet
        p = L.open ? 0.05 : dd < 3 ? 0.7 : 0.4;
        big = 1.3;
      }
      if (H(x + 99, y + 99, 5) > p) continue;
      const jx = 0.18 + H(x, y, 6) * 0.64, jz = 0.18 + H(x, y, 7) * 0.64;
      const sp = H(x, y, 8) < (L.spruce ?? 0.5);
      pts.push({ x: (x + jx) * T, z: (y + jz) * T, inside: false, spruce: sp, s: (0.95 + H(x, y, 9) * 0.55) * big, out: !inside });
    }
    // trærne deles i biter på 12 x 12 fliser, så det som er utenfor bildet (og skyggen) ikke tegnes
    const CH = 12 * T;
    const chunks = new Map();
    for (const t of pts) {
      const key = Math.floor(t.x / CH) + ',' + Math.floor(t.z / CH);
      if (!chunks.has(key)) chunks.set(key, []);
      chunks.get(key).push(t);
    }
    const trunkG = new THREE.CylinderGeometry(0.16, 0.26, 2.2, 6).translate(0, 1.1, 0);
    const leafHi = new THREE.IcosahedronGeometry(1, 1), leafLo = new THREE.IcosahedronGeometry(1, 0);
    const coneG = new THREE.ConeGeometry(1, 1, 7).translate(0, 0.5, 0);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), s = new THREE.Vector3(), p = new THREE.Vector3();
    const c = new THREE.Color();
    let n = 0;
    for (const list of chunks.values()) {
      const dec = list.filter(t => !t.spruce), spr = list.filter(t => t.spruce);
      const hi = list.some(t => t.hi);
      const trunks = new THREE.InstancedMesh(trunkG, M.bark, list.length);
      const leaves = new THREE.InstancedMesh(hi ? leafHi : leafLo, M.leaf, Math.max(1, dec.length * 3));
      const cones = new THREE.InstancedMesh(coneG, M.spruce, Math.max(1, spr.length * 3));
      let li = 0, ci = 0;
      list.forEach((t, j) => {
        const i = n++;
        const sc = t.s;
        e.set(0, R(i, 5) * 6, 0);
        q.setFromEuler(e);
        s.set(sc, sc * (t.spruce ? 0.7 : 0.9 + R(i, 6) * 0.3), sc);
        p.set(t.x, 0, t.z);
        m4.compose(p, q, s);
        trunks.setMatrixAt(j, m4);
        const base = R(i, 7);
        if (t.spruce) {
          // gran: tre kjegler oppå hverandre
          for (let k = 0; k < 3; k++) {
            p.set(t.x, (0.9 + k * 1.35) * sc, t.z);
            e.set(0, R(i, 60 + k) * 3, 0);
            q.setFromEuler(e);
            s.set((1.5 - k * 0.38) * sc, (2.3 - k * 0.35) * sc, (1.5 - k * 0.38) * sc);
            m4.compose(p, q, s);
            cones.setMatrixAt(ci, m4);
            c.setHSL(0.36 + base * 0.04, 0.32 + base * 0.12, 0.1 + k * 0.025 + R(i, 70 + k) * 0.03);
            cones.setColorAt(ci, c);
            ci++;
          }
        } else {
          for (let k = 0; k < 3; k++) {
            const ox = (R(i, 10 + k) - 0.5) * 1.3 * sc, oz = (R(i, 20 + k) - 0.5) * 1.3 * sc;
            const r = (0.95 + R(i, 30 + k) * 0.45) * sc;
            p.set(t.x + ox, (2.3 + k * 0.55 + R(i, 40 + k) * 0.4) * sc, t.z + oz);
            e.set(R(i, 50 + k), R(i, 60 + k) * 3, 0);
            q.setFromEuler(e);
            s.set(r, r * 0.85, r);
            m4.compose(p, q, s);
            leaves.setMatrixAt(li, m4);
            c.setHSL(0.24 + base * 0.08 - k * 0.012, 0.34 + base * 0.16, 0.13 + k * 0.025 + R(i, 70 + k) * 0.04);
            leaves.setColorAt(li, c);
            li++;
          }
        }
        if (t.inside) this.blockCircle(t.x, t.z, 0.5);
      });
      leaves.count = li;
      cones.count = ci;
      for (const m of [trunks, leaves, cones]) {
        if (!m.count) continue;
        m.computeBoundingSphere();
        m.castShadow = !list[0].out;
        m.receiveShadow = true;
        this.group.add(m);
      }
    }
    this.treeCount = pts.length;
    this.treePts = pts.filter(t => t.inside);
    this.buildTufts(M, 0.6);
  }

  // --- liv og ting i området -------------------------------------------------------------------
  populate(W) {
    this.world = W;
    const L = this.L;
    const F = { wood: new Mesher(), stone: new Mesher(), cloth: new Mesher(), paint: new Mesher(), iron: new Mesher(), tent: new Mesher() };
    this.F = F;
    for (const t of this.treePts || []) G.props.push({ type: 'tree', mesh: null, pos: new THREE.Vector3(t.x, 0, t.z), radius: 0.42, breakable: false });
    // ildsteder inne i husene
    for (const h of this.hearths) {
      W.flame(h.x, 0.12, h.z, 0xff9a40, 0.8, 1.8);
      const b = this.insideAt(h.x, h.z);
      const s = { pos: new THREE.Vector3(h.x, 1.2, h.z), color: new THREE.Color(0xff9a50), intensity: 22, base: 22, phase: Math.random() * 10, ember: true, dist: 9, inside: b?.id };
      W.sources.push(s);
      this.innerSrc.push(s);
    }
    // lykter på stolper, tent om natta
    const iron = new Mesher(), lampGlass = new Mesher();
    const lampFlames = [];
    for (const [lx, ly] of L.lamps || []) {
      const x = U(lx), z = U(ly);
      iron.box(x - 0.14, 0, z - 0.14, x + 0.14, 0.25, z + 0.14, { uv: 'world', col: [0.5, 0.5, 0.52] });
      iron.box(x - 0.05, 0.25, z - 0.05, x + 0.05, 2.6, z + 0.05, { uv: 'world', col: [0.42, 0.32, 0.24] });
      iron.box(x - 0.18, 2.6, z - 0.18, x + 0.18, 2.66, z + 0.18, { uv: 'world', col: [0.5, 0.5, 0.52] });
      lampGlass.box(x - 0.12, 2.66, z - 0.12, x + 0.12, 3.05, z + 0.12, { uv: 'world', col: [1, 1, 1] });
      lampFlames.push(W.flame(x, 2.72, z, 0xffb060, 0.4));
      const s = { pos: new THREE.Vector3(x, 2.9, z), color: new THREE.Color(0xffb468), intensity: 0, base: 18, phase: Math.random() * 10, lamp: true, dist: 12 };
      W.sources.push(s);
      this.lampSrc.push(s);
      this.blockCircle(x, z, 0.3);
      G.props.push({ type: 'lamp', mesh: null, pos: new THREE.Vector3(x, 0, z), radius: 0.2, breakable: false });
    }
    this.addMesh(iron, this.M.iron, true, true);
    this.addMesh(lampGlass, this.M.lampGlass, false, false);
    this.lampFlames = lampFlames;
    // lys inne i hus (stearinlys i kapellet)
    for (const l of L.lights || []) {
      for (const [cx, cz] of l.candles || []) {
        const c = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.24, 6), this.M.paper);
        c.position.set(U(cx), (l.h || 1) - 0.12, U(cz));
        F.iron.box(U(cx) - 0.05, 0, U(cz) - 0.05, U(cx) + 0.05, (l.h || 1) - 0.24, U(cz) + 0.05, { uv: 'world', col: [0.5, 0.42, 0.3] });
        this.group.add(c);
        W.flame(U(cx), (l.h || 1) + 0.0, U(cz), 0xffc070, 0.22);
      }
      const s = { pos: new THREE.Vector3(U(l.x), 1.6, U(l.y)), color: new THREE.Color(l.col || 0xffc878), intensity: 16 * (l.k || 1), base: 16 * (l.k || 1), phase: Math.random() * 10, dist: 8, inside: l.inside };
      W.sources.push(s);
      this.innerSrc.push(s);
    }
    for (const h of this.hills) this.buildHill(h, F);
    for (const p of L.props || []) this.prop(p, F, W);
    if (L.signs) this.signs(F, L.signs);
    const M = this.M;
    this.addMesh(F.wood, M.wood, true, true);
    this.addMesh(F.stone, M.stone, true, true);
    this.addMesh(F.cloth, M.cloth, true, true);
    this.addMesh(F.paint, M.paint, true, true);
    this.addMesh(F.iron, M.iron, true, true);
    this.addMesh(F.tent, M.tent, true, true);
    this.life = new AreaLife(this, W);
  }

  // Haug med borg, vindmølle eller bare gress
  buildHill(h, F) {
    const M = this.M;
    const R = (h.r + 0.7) * T, Ht = h.h || 6, Rt = R * (h.top ?? 0.5);
    const prof = [new THREE.Vector2(R + 1.2, -0.05), new THREE.Vector2(R, 0.35), new THREE.Vector2(R * 0.86, Ht * 0.32), new THREE.Vector2(Rt + (R - Rt) * 0.3, Ht * 0.78), new THREE.Vector2(Rt, Ht), new THREE.Vector2(0, Ht)];
    const geo = new THREE.LatheGeometry(prof, 28);
    const uv = geo.attributes.uv;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * R * 0.5, uv.getY(i) * 6);
    const mound = new THREE.Mesh(geo, M.hill);
    const cx = U(h.x), cz = U(h.y);
    mound.position.set(cx, 0, cz);
    // haugen er slak og trenger ikke kaste skygge, da slipper vi skyggestriper på skråningen
    mound.receiveShadow = true;
    mound.castShadow = false;
    this.group.add(mound);
    // sti opp: en lys stripe i bakken langs skråningen
    if (h.path != null) {
      const a = h.path;
      const dx = Math.cos(a), dz = Math.sin(a);
      const strip = new Mesher();
      const steps = 10;
      for (let i = 0; i < steps; i++) {
        const t0 = i / steps, t1 = (i + 1) / steps;
        const r0 = R + 0.6 - (R + 0.6 - Rt * 0.6) * t0, r1 = R + 0.6 - (R + 0.6 - Rt * 0.6) * t1;
        const y0 = this.hillY(h, r0) + 0.06, y1 = this.hillY(h, r1) + 0.06;
        const px = -dz * 0.9, pz = dx * 0.9;
        const A0 = [cx + dx * r0 - px, y0, cz + dz * r0 - pz], B0 = [cx + dx * r0 + px, y0, cz + dz * r0 + pz];
        const A1 = [cx + dx * r1 - px, y1, cz + dz * r1 - pz], B1 = [cx + dx * r1 + px, y1, cz + dz * r1 + pz];
        strip.quad([A0, B0, B1, A1], [0, 1, 0], [[0, t0 * 4], [1, t0 * 4], [1, t1 * 4], [0, t1 * 4]], [0.95, 0.9, 0.82]);
      }
      this.addMesh(strip, M.ground[GR.DIRT], false, true);
    }
    // bergknauser i skråningen
    for (let i = 0; i < 6; i++) {
      const a = H(h.x * 10 + i, h.y, 3) * Math.PI * 2, rr = R * (0.55 + H(i, h.x, 4) * 0.35);
      const rk = new THREE.Mesh(new THREE.DodecahedronGeometry(0.5 + H(i, h.y, 5) * 0.6, 0), M.rock);
      rk.position.set(cx + Math.cos(a) * rr, this.hillY(h, rr) - 0.1, cz + Math.sin(a) * rr);
      rk.rotation.set(i, i * 2, 0);
      rk.castShadow = true;
      this.group.add(rk);
    }
    if (h.castle) this.buildCastle(h, cx, Ht, cz, Rt, F);
    if (h.mill) this.buildWindmill(cx, Ht, cz);
  }

  hillY(h, r) {
    const R = (h.r + 0.7) * T, Ht = h.h || 6, Rt = R * (h.top ?? 0.5);
    if (r <= Rt) return Ht;
    if (r >= R) return 0.3 * Math.max(0, 1 - (r - R) / 1.2);
    const pts = [[R, 0.35], [R * 0.86, Ht * 0.32], [Rt + (R - Rt) * 0.3, Ht * 0.78], [Rt, Ht]];
    for (let i = 0; i < pts.length - 1; i++) {
      const [ra, ya] = pts[i], [rb, yb] = pts[i + 1];
      if (r <= ra && r >= rb) return ya + (yb - ya) * ((ra - r) / (ra - rb));
    }
    return Ht;
  }

  // Borg på haugen: hovedbygning, tårn og mur (Akershus s. 5, Ridderskors s. 3)
  buildCastle(h, cx, y, cz, Rt, F) {
    const M = this.M;
    const W = new Mesher(), roofM = new Mesher();
    const c = h.castle;
    const s = Math.min(1, Rt / 9);
    const col = [0.95, 0.92, 0.86];
    const bx = (x0, z0, x1, z1, y0, y1, k = 1) => W.box(cx + x0 * s, y + y0, cz + z0 * s, cx + x1 * s, y + y1, cz + z1 * s, { vs: 2, us: 2, ao: true, col: col.map(v => v * k) });
    // mur rundt (2,5 m)
    const wr = 6.2;
    bx(-wr, -wr, wr, -wr + 0.7, 0, 2.5);
    bx(-wr, wr - 0.7, wr, wr, 0, 2.5);
    bx(-wr, -wr, -wr + 0.7, wr, 0, 2.5);
    bx(wr - 0.7, -wr, wr, wr, 0, 2.5);
    for (let i = -5; i <= 5; i += 2) { bx(i - 0.3, -wr, i + 0.3, -wr + 0.7, 2.5, 3.0); bx(i - 0.3, wr - 0.7, i + 0.3, wr, 2.5, 3.0); bx(-wr, i - 0.3, -wr + 0.7, i + 0.3, 2.5, 3.0); bx(wr - 0.7, i - 0.3, wr, i + 0.3, 2.5, 3.0); }
    // hovedbygningen
    bx(-4.6, -4.6, 1.6, 0.6, 0, 5.6, 1.02);
    // tårnet
    const tw = c === 'ridderskors' ? 2.2 : 2.0;
    bx(2.0, -4.8, 2.0 + tw * 2, -4.8 + tw * 2, 0, 10.5, 0.98);
    for (const [tx, tz] of [[2.0, -4.8], [2.0 + tw * 2 - 0.6, -4.8], [2.0, -4.8 + tw * 2 - 0.6], [2.0 + tw * 2 - 0.6, -4.8 + tw * 2 - 0.6]]) bx(tx, tz, tx + 0.6, tz + 0.6, 10.5, 11.2);
    if (c === 'ridderskors') {
      // markisens borg er større: et ekstra tårn mot sjøen
      bx(-5.6, 2.2, -2.4, 5.4, 0, 8.2, 0.96);
      const cone = new THREE.Mesh(new THREE.ConeGeometry(2.4 * s, 3.2, 8), new THREE.MeshStandardMaterial({ map: townTextures().roof.slate.map, color: 0x9a8a80, roughness: 0.8 }));
      cone.position.set(cx - 4.0 * s, y + 8.2 + 1.6, cz + 3.8 * s);
      cone.castShadow = true;
      this.group.add(cone);
    }
    // saltak på hovedbygningen
    const x0 = cx - 4.9 * s, x1 = cx + 1.9 * s, z0 = cz - 4.9 * s, z1 = cz + 0.9 * s, ry = y + 5.6, top = ry + 2.6, zm = (z0 + z1) / 2;
    roofM.quad([[x0, ry, z0], [x1, ry, z0], [x1, top, zm], [x0, top, zm]], [0, 0.8, -0.6], [[0, 0], [3, 0], [3, 1.5], [0, 1.5]], [1, 1, 1]);
    roofM.quad([[x0, ry, z1], [x1, ry, z1], [x1, top, zm], [x0, top, zm]], [0, 0.8, 0.6], [[0, 0], [3, 0], [3, 1.5], [0, 1.5]], [1, 1, 1]);
    W.tri([[x0 + 0.3 * s, ry, z0 + 0.3 * s], [x0 + 0.3 * s, ry, z1 - 0.3 * s], [x0 + 0.3 * s, top, zm]], [-1, 0, 0], [[0, 0], [2, 0], [1, 1.3]], col);
    W.tri([[x1 - 0.3 * s, ry, z0 + 0.3 * s], [x1 - 0.3 * s, ry, z1 - 0.3 * s], [x1 - 0.3 * s, top, zm]], [1, 0, 0], [[0, 0], [2, 0], [1, 1.3]], col);
    this.addMesh(W, M.city, true, true);
    const rm = new THREE.MeshStandardMaterial({ map: townTextures().roof.slate.map, roughness: 0.85, vertexColors: true, side: THREE.DoubleSide });
    this.addMesh(roofM, rm, true, false);
    // fane på tårnet
    const ban = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 2.0).translate(0.5, -1, 0), new THREE.MeshStandardMaterial({ map: heraldry(h.banner || 'eke'), side: THREE.DoubleSide, alphaTest: 0.5, roughness: 0.9 }));
    const px = cx + (2.0 + tw) * s, pz = cz + (-4.8 + tw) * s;
    F.wood.box(px - 0.05, y + 11.2, pz - 0.05, px + 0.05, y + 14.2, pz + 0.05, { uv: 'world', col: [0.4, 0.3, 0.2] });
    ban.position.set(px + 0.05, y + 14.0, pz);
    this.group.add(ban);
    this.anims.push(t => { ban.rotation.y = Math.sin(t * 1.4 + cx) * 0.25; });
    // lys i vinduene om natta
    const win = new THREE.MeshStandardMaterial({ color: 0x1a1008, emissive: 0xffa040, emissiveIntensity: 0.2 });
    for (const [wx, wy, wz] of [[-2, 3.2, 0.62], [0, 3.2, 0.62], [-3.6, 3.2, 0.62], [3.0 + tw - 2, 7.5, -4.8 + tw * 2 + 0.02]]) {
      const pl = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.8), win);
      pl.position.set(cx + wx * s, y + wy, cz + wz * s + 0.02);
      this.group.add(pl);
    }
    (this.nightGlow || (this.nightGlow = [])).push(win);
  }

  // Markisens vindmølle på kvarnkullen (Sortmund)
  buildWindmill(cx, y, cz) {
    const M = this.M;
    const W = new Mesher();
    W.box(cx - 1.6, y, cz - 1.6, cx + 1.6, y + 5.2, cz + 1.6, { vs: 2.8, us: T, ao: true, col: [0.95, 0.9, 0.8] });
    this.addMesh(W, M.timber, true, true);
    const cone = new THREE.Mesh(new THREE.ConeGeometry(2.6, 2.6, 4), new THREE.MeshStandardMaterial({ map: townTextures().roof.shingle.map, roughness: 0.9, color: 0xb0a090 }));
    cone.rotation.y = Math.PI / 4;
    cone.position.set(cx, y + 5.2 + 1.3, cz);
    cone.castShadow = true;
    this.group.add(cone);
    const hub = new THREE.Group();
    hub.position.set(cx + 0.4, y + 4.4, cz + 1.75);
    const wood = new THREE.MeshStandardMaterial({ color: 0x6a4a30, roughness: 0.85 });
    const sail = new THREE.MeshStandardMaterial({ color: 0xe8dcc0, roughness: 0.95, side: THREE.DoubleSide });
    for (let i = 0; i < 4; i++) {
      const arm = new THREE.Group();
      arm.rotation.z = i * Math.PI / 2;
      const beam = new THREE.Mesh(new THREE.BoxGeometry(0.14, 4.4, 0.1), wood);
      beam.position.y = 2.2;
      const cloth = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 3.4), sail);
      cloth.position.set(0.55, 2.6, 0.02);
      beam.castShadow = cloth.castShadow = true;
      arm.add(beam, cloth);
      hub.add(arm);
    }
    this.group.add(hub);
    this.anims.push((t, dt) => { hub.rotation.z -= dt * 0.6 * (0.6 + (G.weather?.wind ?? 0.4)); });
  }

  // --- småting --------------------------------------------------------------------------------
  prop(p, F, W) {
    const x = U(p.x), z = U(p.y);
    const M = this.M;
    const t = p.t;
    if (t === 'tent' || t === 'roundtent') this.tent(x, z, p, F);
    else if (t === 'fire') this.campfire(x, z, p, W, F);
    else if (t === 'catapult') this.catapult(x, z, p.rot || 0);
    else if (t === 'barrel') this.barrel(x, z, p.s || 0.9);
    else if (t === 'crate') this.crate(x, z, p.s || 0.85);
    else if (t === 'chest') {
      const m = buildChest();
      m.position.set(x, 0, z);
      m.rotation.y = p.rot || 0;
      m.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
      this.group.add(m);
      this.addBlock(x - 0.45, z - 0.45, x + 0.45, z + 0.45);
      if (p.ref) this[p.ref] = m;
    } else if (t === 'cart') {
      const a = p.rot || 0;
      const g = new THREE.Group();
      const wood = new THREE.MeshStandardMaterial({ color: 0x6a4a2e, roughness: 0.85 });
      const bed = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.5, 2.4), wood);
      bed.position.y = 0.75;
      g.add(bed);
      for (const sx of [-0.8, 0.8]) for (const sz of [-0.7, 0.7]) {
        const wh = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.07, 6, 14), wood);
        wh.rotation.y = Math.PI / 2;
        wh.position.set(sx, 0.45, sz);
        g.add(wh);
      }
      const shaft = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 1.6), wood);
      shaft.position.set(0, 0.55, 1.9);
      g.add(shaft);
      g.position.set(x, 0, z);
      g.rotation.y = a;
      g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
      this.group.add(g);
      this.addBlock(x - 0.9, z - 0.9, x + 0.9, z + 0.9);
    } else if (t === 'woodpile') {
      for (let i = 0; i < 9; i++) {
        const lx = x - 0.7 + (i % 3) * 0.5, ly = 0.18 + Math.floor(i / 3) * 0.3;
        F.wood.box(lx - 0.18, ly - 0.15, z - 0.6, lx + 0.18, ly + 0.15, z + 0.6, { uv: 'world', col: [0.6, 0.44, 0.28] });
      }
      this.addBlock(x - 0.95, z - 0.65, x + 0.95, z + 0.65);
    } else if (t === 'hay') {
      const hay = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.9, 1.2, 10), new THREE.MeshStandardMaterial({ color: 0xc8a850, roughness: 1 }));
      hay.position.set(x, 0.6, z);
      hay.castShadow = hay.receiveShadow = true;
      this.group.add(hay);
      this.addBlock(x - 0.8, z - 0.8, x + 0.8, z + 0.8);
    } else if (t === 'well') {
      const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.9, 0.8, 14, 1, true), M.stonePlain);
      ring.position.set(x, 0.4, z);
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.87, 0.11, 6, 16).rotateX(Math.PI / 2), M.stonePlain);
      rim.position.set(x, 0.8, z);
      for (const m of [ring, rim]) { m.castShadow = true; m.receiveShadow = true; this.group.add(m); }
      F.wood.box(x - 0.95, 0, z - 0.06, x - 0.82, 2.0, z + 0.06, { uv: 'world', col: [0.5, 0.36, 0.24] });
      F.wood.box(x + 0.82, 0, z - 0.06, x + 0.95, 2.0, z + 0.06, { uv: 'world', col: [0.5, 0.36, 0.24] });
      F.wood.box(x - 1.0, 1.6, z - 0.05, x + 1.0, 1.7, z + 0.05, { uv: 'world', col: [0.45, 0.32, 0.2] });
      this.blockCircle(x, z, 0.9);
      G.props.push({ type: 'well', mesh: ring, pos: new THREE.Vector3(x, 0, z), radius: 0.95, breakable: false });
    } else if (t === 'post' || t === 'sign') {
      // veiskilt eller plakatstolpe
      F.wood.box(x - 0.07, 0, z - 0.07, x + 0.07, 2.1, z + 0.07, { uv: 'world', col: [0.45, 0.32, 0.2] });
      if (p.text) {
        const tex = signTexture(p.text, p.sub);
        const sm = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.8 });
        for (const s of [1, -1]) {
          const pl = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.34), sm);
          pl.position.set(x + Math.cos(p.rot || 0) * 0.5, 1.75, z + Math.sin(p.rot || 0) * 0.5 + s * 0.03);
          pl.rotation.y = s > 0 ? -(p.rot || 0) : Math.PI - (p.rot || 0);
          this.group.add(pl);
        }
      }
      G.props.push({ type: 'post', mesh: null, pos: new THREE.Vector3(x, 0, z), radius: 0.15, breakable: false });
    } else if (t === 'poster') {
      // plakat på en vegg: p.face er retningen den peker ut (radianer, 0 = sør)
      const pl = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.78), new THREE.MeshStandardMaterial({ map: posterTex(), roughness: 0.95 }));
      pl.position.set(x, p.h || 1.7, z);
      pl.rotation.y = p.face || 0;
      this.group.add(pl);
    } else if (t === 'banner') {
      F.wood.box(x - 0.06, 0, z - 0.06, x + 0.06, p.h || 4.2, z + 0.06, { uv: 'world', col: [0.42, 0.3, 0.2] });
      const m = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1.8).translate(0.45, -0.9, 0), new THREE.MeshStandardMaterial({ map: heraldry(p.kind), side: THREE.DoubleSide, alphaTest: 0.5, roughness: 0.9 }));
      m.position.set(x + 0.06, (p.h || 4.2) - 0.1, z);
      m.castShadow = true;
      this.group.add(m);
      this.anims.push(tt => { m.rotation.y = Math.sin(tt * 1.3 + x) * 0.3; });
      G.props.push({ type: 'post', mesh: null, pos: new THREE.Vector3(x, 0, z), radius: 0.12, breakable: false });
    } else if (t === 'horse') {
      this.horse(x, z, p.rot || 0, p.col);
    } else if (t === 'rock') {
      const rk = new THREE.Mesh(new THREE.DodecahedronGeometry(p.s || 0.8, 0), M.rock);
      rk.position.set(x, (p.s || 0.8) * 0.4, z);
      rk.rotation.set(p.x, p.y, 0);
      rk.castShadow = rk.receiveShadow = true;
      this.group.add(rk);
      G.props.push({ type: 'rock', mesh: rk, pos: new THREE.Vector3(x, 0, z), radius: (p.s || 0.8) * 0.9, breakable: false });
    } else if (t === 'stump') {
      F.wood.box(x - 0.3, 0, z - 0.3, x + 0.3, 0.45, z + 0.3, { uv: 'world', col: [0.5, 0.38, 0.26] });
      G.props.push({ type: 'stump', mesh: null, pos: new THREE.Vector3(x, 0, z), radius: 0.35, breakable: false });
    } else if (t === 'ruin') {
      // nedbrent stue: svarte stokker og en mur til pipa (skogshuggarens koja, s. 7)
      const c = [0.16, 0.13, 0.11];
      const w = p.w || 2.6, d = p.d || 2.0;
      F.wood.box(x - w, 0, z - d, x + w, 0.6, z - d + 0.25, { uv: 'world', col: c });
      F.wood.box(x - w, 0, z - d, x - w + 0.25, 1.1, z + d, { uv: 'world', col: c });
      F.wood.box(x + w - 0.25, 0, z - d, x + w, 0.35, z + d, { uv: 'world', col: c });
      F.wood.box(x - w, 0, z + d - 0.25, x - 0.4, 0.8, z + d, { uv: 'world', col: c });
      F.stone.box(x + w - 1.2, 0, z - d + 0.3, x + w - 0.3, 2.6, z - d + 1.1, { vs: 2, us: 2, col: [0.5, 0.46, 0.42] });
      for (let i = 0; i < 6; i++) {
        const bx2 = x - w * 0.6 + H(i, p.x, 4) * w * 1.2, bz2 = z - d * 0.6 + H(p.y, i, 5) * d * 1.2;
        const len = 1.4 + H(i, i, 6) * 1.6, ang = H(i, 3, 7) * 3;
        const beam = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, len), new THREE.MeshStandardMaterial({ color: 0x1a1410, roughness: 1 }));
        beam.position.set(bx2, 0.15 + (i % 2) * 0.12, bz2);
        beam.rotation.set(0.15 * (i % 3), ang, 0.1);
        beam.castShadow = true;
        this.group.add(beam);
      }
      this.addBlock(x - w, z - d, x + w, z - d + 0.25);
      this.addBlock(x - w, z - d, x - w + 0.25, z + d);
      this.addBlock(x + w - 1.2, z - d + 0.3, x + w - 0.3, z - d + 1.1);
      if (G.fx) this.smolder = { x: x + w - 0.75, y: 2.7, z: z - d + 0.7, t: 0 };
    } else if (t === 'pen') {
      // ulvehagen: stokkegjerde i ring
      const r = U(p.r || 2.5);
      const n = 22;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        if (p.gap != null && Math.abs(((a - p.gap + Math.PI * 3) % (Math.PI * 2)) - Math.PI) < 0.22) continue;
        const px = x + Math.cos(a) * r, pz = z + Math.sin(a) * r;
        F.wood.box(px - 0.12, 0, pz - 0.12, px + 0.12, 1.5 + H(i, 1, 2) * 0.3, pz + 0.12, { uv: 'world', col: [0.4, 0.3, 0.2] });
        this.addBlock(px - 0.32, pz - 0.32, px + 0.32, pz + 0.32);
      }
    } else if (t === 'bones') {
      for (let i = 0; i < 5; i++) F.paint.box(x - 0.4 + H(i, 1, 1) * 0.8, 0, z - 0.4 + H(i, 2, 2) * 0.8, x - 0.3 + H(i, 1, 1) * 0.8, 0.06, z - 0.1 + H(i, 2, 2) * 0.8, { uv: 'world', col: [0.86, 0.82, 0.72] });
    } else if (t === 'skullpole') {
      F.wood.box(x - 0.06, 0, z - 0.06, x + 0.06, 2.3, z + 0.06, { uv: 'world', col: [0.32, 0.24, 0.18] });
      const sk = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), new THREE.MeshStandardMaterial({ color: 0xd8ccb0, roughness: 0.8 }));
      sk.position.set(x, 2.42, z);
      sk.scale.set(1, 1.1, 1.15);
      this.group.add(sk);
    } else if (t === 'boat') {
      // eka: et halvt rør med åpningen opp
      const hull = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 3.2, 10, 1, false, Math.PI / 2, Math.PI), new THREE.MeshStandardMaterial({ color: 0x6a4a2e, roughness: 0.85, side: THREE.DoubleSide }));
      hull.rotation.x = Math.PI / 2;
      const g = new THREE.Group();
      g.add(hull);
      g.position.set(x, 0.05, z);
      g.rotation.y = p.rot || 0;
      g.scale.set(1, 0.6, 1);
      this.group.add(g);
      this.anims.push(tt => { g.position.y = 0.05 + Math.sin(tt * 1.3 + x) * 0.03; });
    } else if (t === 'net') {
      F.wood.box(x - 1.2, 0, z - 0.05, x - 1.1, 1.6, z + 0.05, { uv: 'world', col: [0.45, 0.32, 0.2] });
      F.wood.box(x + 1.1, 0, z - 0.05, x + 1.2, 1.6, z + 0.05, { uv: 'world', col: [0.45, 0.32, 0.2] });
      F.wood.box(x - 1.2, 1.55, z - 0.04, x + 1.2, 1.62, z + 0.04, { uv: 'world', col: [0.45, 0.32, 0.2] });
      F.cloth.box(x - 1.1, 0.5, z - 0.01, x + 1.1, 1.55, z + 0.01, { uv: 'world', col: [0.5, 0.46, 0.36] });
      this.addBlock(x - 1.2, z - 0.1, x + 1.2, z + 0.1);
    } else if (t === 'wheel') {
      // vannhjulet ved kvarnen i Akershus
      const g = new THREE.Group();
      g.position.set(x, 1.0, z);
      g.rotation.y = p.rot || 0;
      const inner = new THREE.Group();
      g.add(inner);
      const wood = new THREE.MeshStandardMaterial({ color: 0x5a3e28, roughness: 0.85 });
      const rim = new THREE.Mesh(new THREE.TorusGeometry(2.0, 0.1, 6, 24), wood);
      const rim2 = rim.clone();
      rim.position.z = -0.45; rim2.position.z = 0.45;
      inner.add(rim, rim2);
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        const pad = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.55, 1.0), wood);
        pad.position.set(Math.cos(a) * 2.0, Math.sin(a) * 2.0, 0);
        pad.rotation.z = a;
        inner.add(pad);
        const sp = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.0, 0.08), wood);
        sp.position.set(Math.cos(a) * 1.0, Math.sin(a) * 1.0, 0);
        sp.rotation.z = a - Math.PI / 2;
        inner.add(sp);
      }
      g.traverse(o => { if (o.isMesh) o.castShadow = true; });
      this.group.add(g);
      this.anims.push((tt, dt) => { inner.rotation.z -= dt * 0.7; });
      this.wheelSpot = { x, z };
    }
  }

  // Katapulten ved kullen i Akershus (s. 9: «en bräsch i muren, uppslagen av en katapult»)
  catapult(x, z, rot) {
    const g = new THREE.Group();
    const wood = new THREE.MeshStandardMaterial({ color: 0x6a4a2e, roughness: 0.85 });
    const dark = new THREE.MeshStandardMaterial({ color: 0x3a2a1c, roughness: 0.9 });
    for (const sx of [-0.7, 0.7]) {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, 3.2), wood);
      rail.position.set(sx, 0.35, 0);
      g.add(rail);
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.8, 0.2), wood);
      post.position.set(sx, 1.1, -0.3);
      post.rotation.x = 0.25;
      g.add(post);
      for (const sz of [-1.2, 1.2]) {
        const wh = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.14, 12), dark);
        wh.rotation.z = Math.PI / 2;
        wh.position.set(sx * 1.15, 0.45, sz);
        g.add(wh);
      }
    }
    const bar = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.18, 0.18), wood);
    bar.position.set(0, 1.9, -0.05);
    g.add(bar);
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.16, 3.0), wood);
    arm.position.set(0, 0.8, 0.6);
    arm.rotation.x = 0.35;
    g.add(arm);
    const cup = new THREE.Mesh(new THREE.SphereGeometry(0.3, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), dark);
    cup.position.set(0, 0.35, 2.0);
    cup.rotation.x = Math.PI;
    g.add(cup);
    const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.28, 0), this.M.rock);
    rock.position.set(0, 0.5, 2.0);
    g.add(rock);
    g.position.set(x, 0, z);
    g.rotation.y = rot;
    g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    this.group.add(g);
    this.addBlock(x - 1.3, z - 1.3, x + 1.3, z + 1.3);
  }

  // Kvernstein i kvarnen
  millstone(x, z) {
    const st = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.36, 18), this.M.stonePlain);
    st.position.set(x, 0.62, z);
    st.castShadow = st.receiveShadow = true;
    this.group.add(st);
    this.anims.push((t, dt) => { st.rotation.y += dt * 0.5; });
  }

  // Telt: rundt (grevens soldater) eller som et lite hus av hud (svartfolket)
  tent(x, z, p, F) {
    let M = F.tent;
    // Lekhs telt får egen mesh, så det kan bli gjennomsiktig når du er inne i det
    const own = p.ref === 'lekhTent' ? new Mesher() : null;
    if (own) M = own;
    const col = p.col || [0.9, 0.86, 0.76];
    const r = p.r || 1.9, h = p.h || 2.8;
    if (p.t === 'roundtent') {
      const n = 12, wallH = h * 0.42;
      for (let i = 0; i < n; i++) {
        const a0 = (i / n) * Math.PI * 2, a1 = ((i + 1) / n) * Math.PI * 2;
        const x0 = x + Math.cos(a0) * r, z0 = z + Math.sin(a0) * r, x1 = x + Math.cos(a1) * r, z1 = z + Math.sin(a1) * r;
        const nx = Math.cos((a0 + a1) / 2), nz = Math.sin((a0 + a1) / 2);
        const cc = i % 2 ? col : (p.stripe || col);
        if (!(p.door != null && i === p.door)) M.quad([[x0, 0, z0], [x1, 0, z1], [x1, wallH, z1], [x0, wallH, z0]], [nx, 0, nz], [[0, 0], [1, 0], [1, 1], [0, 1]], cc);
        M.tri([[x0, wallH, z0], [x1, wallH, z1], [x, h, z]], [nx * 0.7, 0.7, nz * 0.7], [[0, 0], [1, 0], [0.5, 1]], cc.map(v => v * 0.95));
      }
      // stang med vimpel
      F.wood.box(x - 0.04, h - 0.1, z - 0.04, x + 0.04, h + 1.2, z + 0.04, { uv: 'world', col: [0.4, 0.3, 0.2] });
      if (p.banner) {
        const m = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 1.1).translate(0.3, -0.55, 0), new THREE.MeshStandardMaterial({ map: heraldry(p.banner), side: THREE.DoubleSide, alphaTest: 0.5, roughness: 0.9 }));
        m.position.set(x + 0.04, h + 1.15, z);
        this.group.add(m);
        this.anims.push(tt => { m.rotation.y = Math.sin(tt * 1.6 + x) * 0.35; });
      }
      // stenger: rundt telt, døra (p.door) er åpen
      const segs = 10;
      for (let i = 0; i < segs; i++) {
        const a = (i / segs) * Math.PI * 2 + 0.3;
        const dA = p.door != null ? (p.door + 0.5) / n * Math.PI * 2 : -9;
        if (Math.abs(((a - dA + Math.PI * 3) % (Math.PI * 2)) - Math.PI) < 0.45) continue;
        const px = x + Math.cos(a) * (r - 0.2), pz = z + Math.sin(a) * (r - 0.2);
        this.addBlock(px - 0.3, pz - 0.3, px + 0.3, pz + 0.3, true);
      }
    } else {
      // A-telt av hud, åpning mot p.face
      const a = p.face || 0, ca = Math.cos(a), sa = Math.sin(a);
      const L2 = p.len || 2.2, w = p.w || 1.5;
      const P2 = (u, y, v) => [x + u * ca - v * sa, y, z + u * sa + v * ca];
      const cc = col;
      M.quad([P2(-L2, 0, -w), P2(L2, 0, -w), P2(L2, h, 0), P2(-L2, h, 0)], [sa * 0.7, 0.7, -ca * 0.7], [[0, 0], [1, 0], [1, 1], [0, 1]], cc);
      M.quad([P2(-L2, 0, w), P2(L2, 0, w), P2(L2, h, 0), P2(-L2, h, 0)], [-sa * 0.7, 0.7, ca * 0.7], [[0, 0], [1, 0], [1, 1], [0, 1]], cc.map(v => v * 0.85));
      M.tri([P2(-L2, 0, -w), P2(-L2, 0, w), P2(-L2, h, 0)], [-ca, 0, -sa], [[0, 0], [1, 0], [0.5, 1]], cc.map(v => v * 0.8));
      // stang i den åpne enden
      const [px, , pz] = P2(L2 + 0.05, 0, 0);
      F.wood.box(px - 0.05, 0, pz - 0.05, px + 0.05, h + 0.3, pz + 0.05, { uv: 'world', col: [0.35, 0.26, 0.18] });
      const cs = [P2(-L2, 0, -w), P2(L2, 0, -w), P2(L2, 0, w), P2(-L2, 0, w)];
      const xs = cs.map(q => q[0]), zs = cs.map(q => q[2]);
      if (!p.walkIn) this.addBlock(Math.min(...xs) + 0.2, Math.min(...zs) + 0.2, Math.max(...xs) - 0.2, Math.max(...zs) - 0.2, true);
      else {
        // sideveggene stenger, åpningen er fri
        const sv = [P2(-L2, 0, -w), P2(L2, 0, -w)], sv2 = [P2(-L2, 0, w), P2(L2, 0, w)];
        for (const [a, b] of [sv, sv2]) this.addBlock(Math.min(a[0], b[0]) - 0.15, Math.min(a[2], b[2]) - 0.15, Math.max(a[0], b[0]) + 0.15, Math.max(a[2], b[2]) + 0.15, true);
        const e0 = P2(-L2, 0, -w), e1 = P2(-L2, 0, w);
        this.addBlock(Math.min(e0[0], e1[0]) - 0.15, Math.min(e0[2], e1[2]) - 0.15, Math.max(e0[0], e1[0]) + 0.15, Math.max(e0[2], e1[2]) + 0.15, true);
        // folk og ulver finner veien rundt teltet, ikke gjennom veggene
        for (let tz = Math.floor((Math.min(...zs) - 0.2) / T); tz <= Math.floor((Math.max(...zs) + 0.2) / T); tz++) for (let tx = Math.floor((Math.min(...xs) - 0.2) / T); tx <= Math.floor((Math.max(...xs) + 0.2) / T); tx++) {
          if (tx >= 0 && tz >= 0 && tx < TW && tz < TH) this.walkBlock[this.idx(tx, tz)] = 1;
        }
      }
    }
    if (own) {
      const mat = new THREE.MeshStandardMaterial({ roughness: 0.95, vertexColors: true, side: THREE.DoubleSide, transparent: true, opacity: 1, depthWrite: true });
      const m = this.addMesh(own, mat, true, true);
      this.lekhTentMesh = m;
    }
  }

  campfire(x, z, p, W, F) {
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      F.stone.box(x + Math.cos(a) * 0.5 - 0.09, 0, z + Math.sin(a) * 0.5 - 0.09, x + Math.cos(a) * 0.5 + 0.09, 0.16, z + Math.sin(a) * 0.5 + 0.09, { vs: 2, us: 2, col: [0.6, 0.58, 0.55] });
    }
    for (let i = 0; i < 3; i++) {
      const a = i * 2.1;
      const log = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.8, 6), new THREE.MeshStandardMaterial({ color: 0x3a2618, roughness: 1 }));
      log.position.set(x, 0.12, z);
      log.rotation.set(Math.PI / 2 - 0.3, 0, a);
      log.rotation.order = 'YXZ';
      log.rotation.y = a;
      this.group.add(log);
    }
    if (p.lit !== false) {
      const f = W.flame(x, 0.05, z, 0xff8a40, p.size || 0.55, 1.6);
      const s = { pos: new THREE.Vector3(x, 0.9, z), color: new THREE.Color(0xff8a48), intensity: 12, base: 12, phase: Math.random() * 10, ember: true, dist: 9 };
      W.sources.push(s);
      (this.fires || (this.fires = [])).push({ f, s, x, z });
    }
    if (p.spit) {
      F.wood.box(x - 0.75, 0, z - 0.04, x - 0.68, 0.95, z + 0.04, { uv: 'world', col: [0.35, 0.25, 0.16] });
      F.wood.box(x + 0.68, 0, z - 0.04, x + 0.75, 0.95, z + 0.04, { uv: 'world', col: [0.35, 0.25, 0.16] });
      F.wood.box(x - 0.8, 0.88, z - 0.03, x + 0.8, 0.94, z + 0.03, { uv: 'world', col: [0.35, 0.25, 0.16] });
      F.paint.box(x - 0.3, 0.72, z - 0.18, x + 0.3, 1.0, z + 0.18, { uv: 'world', col: [0.5, 0.26, 0.16] });
    }
    this.blockCircle(x, z, 0.6);
    G.props.push({ type: 'fire', mesh: null, pos: new THREE.Vector3(x, 0, z), radius: 0.6, breakable: false });
  }

  // Hest som står bundet (grevens leir). Bare pynt.
  horse(x, z, rot, col = 0x5a3a24) {
    const g = new THREE.Group();
    const m = new THREE.MeshStandardMaterial({ color: col, roughness: 0.8 });
    const dark = new THREE.MeshStandardMaterial({ color: 0x1a1210, roughness: 0.9 });
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.42, 1.2, 4, 10), m);
    body.rotation.x = Math.PI / 2;
    body.position.y = 1.3;
    const neck = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 0.6, 4, 8), m);
    neck.position.set(0, 1.75, 0.85);
    neck.rotation.x = 0.7;
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.28, 0.6), m);
    head.position.set(0, 2.05, 1.25);
    head.rotation.x = 0.5;
    const mane = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.5, 0.6), dark);
    mane.position.set(0, 1.9, 0.75);
    mane.rotation.x = 0.7;
    g.add(body, neck, head, mane);
    for (const [lx, lz] of [[0.25, 0.55], [-0.25, 0.55], [0.25, -0.55], [-0.25, -0.55]]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 1.0, 6), m);
      leg.position.set(lx, 0.5, lz);
      g.add(leg);
    }
    const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.1, 0.8, 6), dark);
    tail.position.set(0, 1.15, -0.95);
    tail.rotation.x = -0.4;
    g.add(tail);
    g.position.set(x, 0, z);
    g.rotation.y = rot;
    g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    this.group.add(g);
    this.anims.push(t => { head.rotation.x = 0.5 + Math.max(0, Math.sin(t * 0.5 + x)) * 0.6; tail.rotation.z = Math.sin(t * 2 + z) * 0.2; });
    G.props.push({ type: 'horse', mesh: g, pos: new THREE.Vector3(x, 0, z), radius: 0.8, breakable: false });
    this.blockCircle(x, z, 0.8);
  }

  update(dt, P, sky) {
    this.animT = (this.animT || 0) + dt;
    for (const f of this.anims) f(this.animT, dt);
    const night = sky ? sky.night : 0.5;
    for (const m of this.nightGlow || []) m.emissiveIntensity = 0.15 + night * 1.6;
    if (this.smolder) {
      this.smolder.t -= dt;
      if (this.smolder.t <= 0 && Math.abs(this.smolder.x - P.pos.x) + Math.abs(this.smolder.z - P.pos.z) < 36) { this.smolder.t = 0.5 + Math.random() * 0.4; G.fx.burst('chimney', this.smolder, 1); }
    }
    super.update(dt, P, sky);
  }
}

export { HT };
