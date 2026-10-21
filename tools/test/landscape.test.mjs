import test from 'node:test';
import assert from 'node:assert/strict';
import { terrainField, terrainWeights, roadAt, vegetationAt } from '../../src/terrainfield.js';
import { houseStyle } from '../../src/housestyle.js';
import { TW, TH, FLOOR, WALL, WATER, GR, BUILDINGS } from '../../src/townmap.js';
import { K_FOREST, K_DEEP, buildAreaGrid } from '../../src/areagrid.js';
import { villageLayout } from '../../src/areatemplates.js';

test('Terrengvekter er normaliserte, kontinuerlige og endelige også utenfor kartet', () => {
  const field = new Int8Array(TW * TH);
  for (let y = 0; y < TH; y++) for (let x = TW / 2; x < TW; x++) field[y * TW + x] = 1;
  assert.deepEqual(terrainWeights(field, 20, 20), [1, 0, 0, 0]);
  assert.deepEqual(terrainWeights(field, 70, 20), [0, 1, 0, 0]);
  const edge = terrainWeights(field, TW, 20);
  assert.ok(edge[1] > 0.9, 'Jorden skal dominere selve veikanten');
  const a = terrainWeights(field, TW - 0.00001, 20), b = terrainWeights(field, TW + 0.00001, 20);
  assert.ok(a.every((n, i) => Math.abs(n - b[i]) < 0.00002));
  for (const [x, z] of [[-120, -15], [150, 120], [46.3, 25.7], [0, 0]]) {
    const w = terrainWeights(field, x, z);
    assert.ok(w.every(n => Number.isFinite(n) && n >= 0 && n <= 1));
    assert.ok(Math.abs(w.reduce((a, b) => a + b) - 1) < 1e-9);
  }
});

test('Brostein har fast kjerne og en jordskulder før gresset', () => {
  const field = new Int8Array(TW * TH);
  for (let y = 0; y < TH; y++) for (let x = 23; x < TW; x++) field[y * TW + x] = 2;
  assert.deepEqual(terrainWeights(field, 48, 24), [0, 0, 1, 0]);
  const shoulder = terrainWeights(field, 45.82, 24);
  assert.ok(shoulder[1] > 0.65 && shoulder[2] < 0.05, JSON.stringify(shoulder));
  assert.deepEqual(terrainWeights(field, 44.8, 24), [1, 0, 0, 0]);
});

function roadFixture() {
  const A = buildAreaGrid({ buildings: [], paint(k) {
    k.open(0, 0, 45, 45, GR.GRASS);
    k.road([[4, 10], [10, 10], [15, 15]], 1.8);
    k.rect(14, 14, 18, 18, FLOOR, GR.COBBLE);
  } });
  return terrainField({ ...A, roads: A.roads, bridgeMap: A.bridge, cityMask: new Uint8Array(TW * TH) });
}

test('Jordveien følger faktiske segmenter gjennom en sving', () => {
  const field = roadFixture();
  for (const [x, z] of [[12, 20], [20, 20], [24.6, 24.6]]) {
    assert.ok(terrainWeights(field, x, z)[1] > 0.99, `${x},${z}`);
    assert.ok(roadAt(field, x, z).distance < -1.79);
  }
  assert.deepEqual(terrainWeights(field, 12, 24), [1, 0, 0, 0]);
  const a = terrainWeights(field, 19.99999, 20), b = terrainWeights(field, 20.00001, 20);
  assert.ok(a.every((v, i) => Math.abs(v - b[i]) < 0.0001));
});

test('Veien går åpent inn på belegning uten gressbånd i veimøtet', () => {
  const field = roadFixture();
  for (let d = 25; d <= 31; d += 0.1) {
    const w = terrainWeights(field, d, d);
    assert.ok(w[0] + w[3] < 0.001, `${d}: ${JSON.stringify(w)}`);
    assert.ok(Math.abs(w[1] + w[2] - 1) < 0.001);
  }
  assert.deepEqual(terrainWeights(field, 31, 31), [0, 0, 1, 0]);
});

test('Jordtilkomst beholder brostein og heller som allerede er lagt', () => {
  const A = buildAreaGrid({ buildings: [], paint(k) {
    k.open(0, 0, 45, 45, GR.GRASS);
    k.rect(14, 14, 18, 18, FLOOR, GR.COBBLE);
    k.rect(20, 14, 22, 18, FLOOR, GR.FLAG);
    k.road([[10, 16], [25, 16]], 2);
  } });
  for (let y = 14; y <= 18; y++) for (let x = 14; x <= 22; x++) {
    if (x === 19) continue;
    assert.equal(A.ground[y * TW + x], x < 19 ? GR.COBBLE : GR.FLAG);
    assert.equal(A.grid[y * TW + x], FLOOR);
  }
});

test('Tuster holdes unna veibane, jordskulder og brostein', () => {
  const field = roadFixture();
  for (const [x, z] of [[12, 20], [12, 22.2], [31, 31]]) assert.equal(vegetationAt(field, x, z), false);
  assert.equal(vegetationAt(field, 12, 24), true);
});

test('Alle dører i bymalen har sammenhengende adkomst til hovedveien', () => {
  for (const id of ['arno', 'gringul']) {
    const L = villageLayout(id), A = buildAreaGrid(L);
    const field = terrainField({ ...A, L, roads: A.roads, bridgeMap: A.bridge, cityMask: new Uint8Array(TW * TH) });
    for (const b of L.buildings) for (const [x, y] of b.doors) {
      const start = (y + 0.5) * 2 + (y === b.y0 ? -0.55 : 0.55);
      for (let i = 0; i <= 20; i++) {
        const z = start + (45 - start) * i / 20, w = terrainWeights(field, x * 2 + 1, z);
        assert.ok(w[1] + w[2] > 0.999, `${id}/${b.id}: ${z}, ${JSON.stringify(w)}`);
      }
    }
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
