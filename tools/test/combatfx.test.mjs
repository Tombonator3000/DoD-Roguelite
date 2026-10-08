import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { CombatFXPool } from '../../src/combatfx-pool.js';
import { CombatFX } from '../../src/combatfx.js';
import { FX } from '../../src/fx.js';
import { G } from '../../src/state.js';

const camera = new THREE.PerspectiveCamera();
globalThis.document = { getElementById: () => ({ appendChild() {} }) };
globalThis.innerWidth = 1280;
globalThis.innerHeight = 720;
G.gfx = { star: new THREE.Texture() };
G.game = { settings: { quality: 'hoy' } };

test('effektlag holder faste grenser og gjenbruker ressursene', () => {
  const scene = new THREE.Scene(), pool = new CombatFXPool(scene);
  const geo = pool.glow.mesh.geometry, mat = pool.glow.mesh.material;
  const records = new Set(pool.glow.records);
  for (let round = 0; round < 30; round++) {
    for (let i = 0; i < 400; i++) pool.glow.spawn(0, { x: 1, z: 2 }, 0xffffff);
    assert.equal(pool.count, 128);
    pool.update(0.1, camera);
    assert.equal(pool.glow.mesh.count, 128);
    pool.update(1, camera);
    assert.equal(pool.count, 0);
    assert.equal(pool.glow.mesh.visible, false);
  }
  assert.equal(scene.children.length, 2);
  assert.equal(pool.glow.mesh.geometry, geo);
  assert.equal(pool.glow.mesh.material, mat);
  assert.ok(pool.glow.records.every(r => records.has(r)));
  pool.dispose();
  assert.equal(scene.children.length, 0);
});

test('posisjonen kopieres og sm�biter f�lger fart, tyngdekraft og levetid', () => {
  const pool = new CombatFXPool(new THREE.Scene());
  const p = { x: 2, y: 1, z: 3 };
  pool.debris.spawn(4, p, 0xffffff, { vx: 2, vy: 1, gravity: 10, life: 1 });
  p.x = 200;
  pool.update(0.1, camera);
  const r = pool.debris.records[0];
  assert.ok(Math.abs(r.x - 2.2) < 0.0001);
  assert.equal(r.vy, 0);
  assert.equal(r.y, 1);
  assert.equal(pool.glow.spawn(0, { x: NaN, z: 1 }, 0xffffff), false);
  pool.update(1, camera);
  assert.equal(pool.count, 0);
  pool.dispose();
});

test('niv�bytte rydder hugg, ringer, telegrafer og partikler med en gang', () => {
  const scene = new THREE.Scene(), fx = new CombatFX(scene);
  const p = { x: 1, z: 2 };
  FX.prototype.slash.call(fx, p, 0, 2, Math.PI, 1);
  FX.prototype.ring.call(fx, p, 2);
  fx.slash(p, 0, 2, Math.PI, -1);
  fx.ring(p, 2);
  fx.telegraph('circle', p, 0, { r: 2, dur: 1 });
  fx.impact(p);
  fx.burst('bone', p, 12);
  fx.update(0.02, camera);
  assert.ok(fx.combat.count > 0);
  let disposed = 0;
  fx.slashes[0].geom.addEventListener('dispose', () => disposed++);
  fx.rings[0].geom.addEventListener('dispose', () => disposed++);
  fx.clearLevel();
  assert.equal(disposed, 2);
  assert.equal(fx.slashes.length + fx.rings.length + fx.telegraphs.length + fx.stars.length, 0);
  assert.equal(fx.combat.count, 0);
  assert.equal(fx.add.geo.drawRange.count + fx.norm.geo.drawRange.count, 0);
  assert.equal(scene.children.length, 4);
  fx.clearLevel();
  assert.equal(scene.children.length, 4);
});

test('lav grafikk gir f�rre gnister og enkeltpartikler gir ingen magiring', () => {
  const low = new CombatFX(new THREE.Scene()), high = new CombatFX(new THREE.Scene());
  const p = { x: 0, z: 0 };
  G.game.settings.quality = 'lav'; low.impact(p);
  G.game.settings.quality = 'hoy'; high.impact(p);
  assert.ok(low.combat.count < high.combat.count);
  const before = high.combat.count;
  high.burst('portal', p, 1);
  assert.equal(high.combat.count, before);
  high.burst('heal', p, 12);
  assert.equal(high.combat.count, before + 1);
});
