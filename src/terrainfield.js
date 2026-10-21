// Fire overflater i samme bakke. Feltet endrer bare utseende, aldri gangruter.
import { TW, TH, GR, WALL, HOUSE, WATER, PILLAR, FENCE } from './townmap.js';
import { K_FOREST, K_OPEN, K_HILL, K_ROCK } from './areagrid.js';

export const TERRAIN_GRASS = 0, TERRAIN_DIRT = 1, TERRAIN_COBBLE = 2, TERRAIN_FOREST = 3;
export const naturalGround = g => g === GR.GRASS || g === GR.DIRT || g === GR.COBBLE;

export function terrainField(D) {
  const field = new Int8Array(TW * TH).fill(-1);
  for (let y = 0; y < TH; y++) for (let x = 0; x < TW; x++) {
    const i = y * TW + x, v = D.grid[i], g = D.ground[i];
    if (v === WATER || v === HOUSE || v === PILLAR || v === FENCE || D.bridgeMap[i] || D.cityMask[i] || D.bmap[i]) continue;
    if (v === WALL) {
      // Dypt vann og murer skal fortsatt ha skarp kant.
      if (D.kind && [K_FOREST, K_OPEN, K_HILL, K_ROCK].includes(D.kind[i])) field[i] = D.L?.open ? 0 : 3;
      else if (!D.kind && !D.cityMask[i]) field[i] = 0;
    } else if (naturalGround(g)) field[i] = g === GR.GRASS ? 0 : g === GR.DIRT ? 1 : 2;
  }
  field.roads = [];
  for (const road of D.roads || []) {
    if (road.ground !== GR.DIRT) continue;
    for (let i = 1; i < road.points.length; i++) {
      const a = road.points[i - 1].map(n => n * 2), b = road.points[i].map(n => n * 2);
      const extend = (p, q) => {
        if (p[0] >= 0 && p[1] >= 0 && p[0] <= TW * 2 && p[1] <= TH * 2) return;
        const len = Math.hypot(p[0] - q[0], p[1] - q[1]);
        if (len > 0) { p[0] += (p[0] - q[0]) / len * 120; p[1] += (p[1] - q[1]) / len * 120; }
      };
      const originalA = a.slice(); extend(a, b); extend(b, originalA);
      field.roads.push({ a, b, radius: road.width });
    }
  }
  // Rasterets trappetrinn tas ut av veijorden. Ikke-veimerkede jordplasser beholdes.
  field.base = field.slice();
  if (field.roads.length) for (let y = 0; y < TH; y++) for (let x = 0; x < TW; x++) {
    const i = y * TW + x;
    if (field[i] === 1 && roadAt(field, x * 2 + 1, y * 2 + 1).distance < 0.4) field.base[i] = 0;
  }
  return field;
}

export function roadAt(field, wx, wz) {
  let distance = 6, traffic = 0;
  for (const { a, b, radius } of field.roads || []) {
    const dx = b[0] - a[0], dz = b[1] - a[1], len2 = dx * dx + dz * dz;
    const t = len2 > 0 ? Math.max(0, Math.min(1, ((wx - a[0]) * dx + (wz - a[1]) * dz) / len2)) : 0;
    const d = Math.hypot(wx - a[0] - dx * t, wz - a[1] - dz * t), edge = d - radius;
    if (edge < distance) { distance = edge; traffic = Math.max(0, 1 - d / radius); }
  }
  return { distance, traffic };
}

// Avstand i meter til overflatene. Negative verdier ligger inne i overflaten.
// Ingen indre fliseskjøter: avstand måles til andre overflater, ikke til egen fliskant.
export function terrainSample(field, wx, wz, tile = 2) {
  const base = field.base || field;
  const px = Math.max(0.001, Math.min(TW * tile - 0.001, wx));
  const pz = Math.max(0.001, Math.min(TH * tile - 0.001, wz));
  const x = Math.floor(px / tile), z = Math.floor(pz / tile), here = base[z * TW + x];
  const d = [6, 6, 6, 6];
  for (let j = Math.max(0, z - 3); j <= Math.min(TH - 1, z + 3); j++) {
    for (let i = Math.max(0, x - 3); i <= Math.min(TW - 1, x + 3); i++) {
      const kind = base[j * TW + i];
      if (kind < 0) continue;
      const dx = Math.max(i * tile - px, 0, px - (i + 1) * tile);
      const dz = Math.max(j * tile - pz, 0, pz - (j + 1) * tile);
      d[kind] = Math.min(d[kind], Math.hypot(dx, dz));
    }
  }
  if (here >= 0) d[here] = -Math.min(...d.filter((v, i) => i !== here));
  const road = roadAt(field, wx, wz);
  d[1] = Math.min(d[1], road.distance);
  return { distances: d, traffic: road.traffic };
}

const smooth = (a, b, v) => { const t = Math.max(0, Math.min(1, (v - a) / (b - a))); return t * t * (3 - 2 * t); };
export function surfaceWeights(d) {
  const stone = 1 - smooth(-0.18, 0.22, d[2]);
  const earth = 1 - smooth(-0.12, 0.72, Math.min(d[1], d[2]));
  const forest = 1 - smooth(-0.3, 0.8, d[3]);
  const vegetation = (1 - stone) * (1 - earth);
  return [vegetation * (1 - forest), earth * (1 - stone), stone, vegetation * forest];
}

export function terrainWeights(field, wx, wz, tile = 2) {
  return surfaceWeights(terrainSample(field, wx, wz, tile).distances);
}

export function vegetationAt(field, wx, wz) {
  const d = terrainSample(field, wx, wz).distances;
  return Math.min(d[1], d[2]) > 0.8;
}
