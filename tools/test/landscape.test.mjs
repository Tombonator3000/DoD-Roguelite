import test from 'node:test';
import assert from 'node:assert/strict';
import { terrainField, terrainWeights } from '../../src/terrainfield.js';
import { houseStyle } from '../../src/housestyle.js';
import { TW, TH, FLOOR, WALL, WATER, GR, BUILDINGS } from '../../src/townmap.js';
import { K_FOREST, K_DEEP } from '../../src/areagrid.js';

test('Terrengvekter er normaliserte, kontinuerlige og endelige også utenfor kartet', () => {
  const field = new Int8Array(TW * TH);
  for (let y = 0; y < TH; y++) for (let x = TW / 2; x < TW; x++) field[y * TW + x] = 1;
  assert.deepEqual(terrainWeights(field, 20, 20), [1, 0, 0, 0]);
  assert.deepEqual(terrainWeights(field, 70, 20), [0, 1, 0, 0]);
  const edge = terrainWeights(field, TW, 20);
  assert.deepEqual(edge, [0.5, 0.5, 0, 0]);
  const a = terrainWeights(field, TW - 0.00001, 20), b = terrainWeights(field, TW + 0.00001, 20);
  assert.ok(a.every((n, i) => Math.abs(n - b[i]) < 0.00002));
  for (const [x, z] of [[-120, -15], [150, 120], [46.3, 25.7], [0, 0]]) {
    const w = terrainWeights(field, x, z);
    assert.ok(w.every(n => Number.isFinite(n) && n >= 0 && n <= 1));
    assert.ok(Math.abs(w.reduce((a, b) => a + b) - 1) < 1e-9);
  }
});

test('Husgulv, bruer og dypt vann deltar ikke i terrengblandingen', () => {
  const n = TW * TH, D = { grid: new Uint8Array(n).fill(FLOOR), ground: new Uint8Array(n).fill(GR.GRASS),
    bmap: new Uint8Array(n), bridgeMap: new Uint8Array(n), cityMask: new Uint8Array(n), kind: new Uint8Array(n) };
  D.bmap[0] = 1; D.bridgeMap[1] = 1; D.cityMask[2] = 1; D.grid[3] = WATER;
  D.grid[4] = WALL; D.kind[4] = K_DEEP;
  D.grid[5] = WALL; D.kind[5] = K_FOREST;
  D.ground[6] = GR.DIRT; D.ground[7] = GR.COBBLE;
  const field = terrainField(D);
  assert.deepEqual([...field.slice(0, 9)], [-1, -1, -1, -1, -1, 3, 1, 2, 0]);
  const w = terrainWeights(field, 0, 0);
  assert.ok(w.every(Number.isFinite)); assert.equal(w.reduce((a, b) => a + b), 1);
});

test('Husvarianter er faste og beholder dører, høyde, gulv og grunnriss', () => {
  const before = JSON.stringify(BUILDINGS);
  const first = structuredClone(BUILDINGS), second = structuredClone(BUILDINGS);
  first.forEach(houseStyle); second.forEach(houseStyle);
  assert.deepEqual(first, second);
  for (let i = 0; i < first.length; i++) {
    const a = first[i], b = BUILDINGS[i];
    for (const k of ['doors', 'wallH', 'floor', 'x0', 'y0', 'x1', 'y1', 'style']) assert.deepEqual(a[k], b[k]);
    const snapshot = structuredClone(a); houseStyle(a); assert.deepEqual(a, snapshot);
  }
  assert.ok(new Set(first.map(b => b.architecture.kind)).size >= 4);
  assert.ok(new Set(first.filter(b => b.roof !== 'cone').map(b => b.roofPitch)).size >= 4);
  assert.ok(first.some(b => b.architecture.dormers > 0));
  assert.equal(JSON.stringify(BUILDINGS), before);
});
