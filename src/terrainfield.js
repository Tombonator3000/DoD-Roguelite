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
  return field;
}

// Bilineært, med identiske vekter på begge sider av en geometrisk flisekant.
// Sperrede felt får samme overflate som nærmeste åpne felt, ikke gress inne i hus.
export function terrainWeights(field, wx, wz, tile = 2) {
  const px = wx / tile - 0.5, pz = wz / tile - 0.5, x = Math.floor(px), z = Math.floor(pz);
  const fx = px - x, fz = pz - z;
  const at = (i, j) => field[Math.max(0, Math.min(TH - 1, j)) * TW + Math.max(0, Math.min(TW - 1, i))];
  const samples = [[at(x, z), (1 - fx) * (1 - fz)], [at(x + 1, z), fx * (1 - fz)],
    [at(x, z + 1), (1 - fx) * fz], [at(x + 1, z + 1), fx * fz]];
  const fallback = samples.reduce((a, b) => b[0] >= 0 && (a[0] < 0 || b[1] > a[1]) ? b : a, [-1, -1])[0];
  const weights = [0, 0, 0, 0];
  for (const [id, weight] of samples) weights[id < 0 ? Math.max(0, fallback) : id] += weight;
  return weights;
}
