// Byfolk med døgnrytme (som i Ultima V), tjenester, tyveri og oppdrag i Fristaden.
import * as THREE from 'three';
import { G, T } from './state.js';
import { buildCharacter, buildWeaponMesh, HOLD } from './kinmodels.js';
import { makeOutline, buildChest, hash2 } from './assets.js';
import { weaponItem, makeItem, RARITY, refinalize, questAmulet } from './loot.js';
import { rollDice, d } from './rules.js';
import { SPELLS, TRICKS } from './dod.js';
import { SPOTS } from './townmap.js';
import { PEOPLE, BOARD, RUMORS } from './townpeople.js';
import { Talk } from './talk.js';
import { giveItem, makeCons, renderSellList } from './inventory.js';

const U = v => v * T;
const tmp = new THREE.Vector3();

export const QUEST_TITLES = {
  rotter: 'Rotteplagen: drep ti rotter i kloakken og gå til Edegar.',
  dode: 'De dødes fred: gi seks skjeletter fred og gå til Syster Jehanne.',
  runer: 'Runesteinen: les runesteinen i dvergehallene og gå til Bataar.',
};

export function hourOf(clock) { return ((clock % 24) + 24) % 24; }
export function isNight(h) { return h >= 21 || h < 5.5; }
function openAt(hours, h) {
  if (!hours) return true;
  const [a, b] = hours;
  return (h >= a && h < b) || (b > 24 && h < b - 24);
}

// --- en person ---------------------------------------------------------------------------
class NPC {
  constructor(def, life) {
    this.def = def;
    this.id = def.id;
    this.life = life;
    this.root = new THREE.Group();
    this.pos = this.root.position;
    this.yaw = 0;
    this.path = null;
    this.pi = 0;
    this.spotName = null;
    this.arrived = false;
    this.talking = false;
    this.walkPhase = Math.random() * 6;
    this.animT = Math.random() * 10;
    this.speed = def.id === 'pimpa' ? 2.6 : def.patrol ? 1.5 : 1.8;
    this.patrolI = 0;
    this.wanderT = 2 + Math.random() * 4;
    this.barkT = 8 + Math.random() * 20;
    this.blockT = 0;
    this.model = this.buildModel();
    this.root.add(this.model);
    if (G.gfx) { this.blob = G.gfx.blobFor(0.38, 0.5); this.root.add(this.blob); }
    G.scene.add(this.root);
  }

  buildModel() {
    const m = this.def.model;
    const g = new THREE.Group();
    this.body = g;
    if (m.duck) {
      const A = G.assets;
      if (A.duckGeo) {
        const mat = new THREE.MeshStandardMaterial({ map: A.duckTex, roughness: 0.8, color: m.duck === 'flansen' ? 0xf6f0e6 : 0xb9c3d6 });
        const mesh = new THREE.Mesh(A.duckGeo, mat);
        mesh.rotation.y = -Math.PI / 2;
        mesh.scale.setScalar(m.duck === 'flansen' ? 0.94 : 1.02);
        mesh.castShadow = true;
        mesh.add(makeOutline(A.duckGeo, 0.02));
        g.add(mesh);
      }
      if (m.duck === 'nansen') {
        const apron = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.62, 0.04), new THREE.MeshStandardMaterial({ color: 0xe8dcc0, roughness: 0.9 }));
        apron.position.set(0, 0.55, 0.36);
        g.add(apron);
      } else {
        const robe = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.5, 0.62, 14, 1, true), new THREE.MeshStandardMaterial({ color: 0x8a2018, roughness: 0.9, side: THREE.DoubleSide }));
        robe.position.y = 0.42;
        robe.castShadow = true;
        g.add(robe);
        for (const sx of [-1, 1]) {
          const sl = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.08, 0.3), new THREE.MeshStandardMaterial({ color: 0x5a2a6a, roughness: 0.9 }));
          sl.position.set(sx * 0.16, 0.04, 0.12);
          g.add(sl);
        }
      }
      this.rig = null;
      this.height = 1.4;
      return g;
    }
    const sheet = { id: 'npc-' + this.def.id, kin: m.kin, profession: m.profession, school: m.school || null, age: m.age || 'medel', clothes: m.clothes };
    const c = buildCharacter(sheet, { armor: m.armor || null, helmet: m.helmet || null });
    this.rig = c.rig;
    this.height = c.height;
    if (m.weapon) {
      const it = weaponItem(m.weapon);
      const wm = buildWeaponMesh(it);
      wm.rotation.x = HOLD[it.kind] ?? -0.35;
      c.rig.handR.add(wm);
    }
    if (m.child) c.root.scale.setScalar(0.8);
    // småbiter kaster ikke skygge (sparer tegnekall), klossen under gjør jobben
    c.root.traverse(o => {
      if (!o.isMesh) return;
      if (!o.geometry.boundingSphere) o.geometry.computeBoundingSphere();
      if (o.geometry.boundingSphere.radius < 0.12) o.castShadow = false;
    });
    g.add(c.root);
    if (this.def.patrol) {
      // nattevaktens lykt
      const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.2, 0.14), new THREE.MeshStandardMaterial({ color: 0x201008, emissive: 0xffb050, emissiveIntensity: 2 }));
      lamp.position.set(0, -0.3, 0.05);
      c.rig.handL.add(lamp);
      this.lamp = lamp;
    }
    return g;
  }

  // hvor personen skal være nå
  wantSpot(h) {
    const s = this.def.sched;
    let cur = s[s.length - 1][1];
    for (const [t, name] of s) if (h >= t) cur = name;
    return cur;
  }

  spotPos(name) {
    if (name === 'patrol') {
      const p = SPOTS[this.def.patrol[this.patrolI % this.def.patrol.length]];
      return { x: U(p.x), z: U(p.y), yaw: 0, spot: p };
    }
    const p = SPOTS[name];
    return { x: U(p.x), z: U(p.y), yaw: p.yaw || 0, spot: p };
  }

  snap(h) {
    this.spotName = this.wantSpot(h);
    const t = this.spotPos(this.spotName);
    this.pos.set(t.x, 0, t.z);
    this.yaw = t.yaw;
    this.path = null;
    this.arrived = true;
    this.onArrive(t);
  }

  goTo(t) {
    this.path = this.life.town.npcPath(this.pos.x, this.pos.z, t.x, t.z);
    this.pi = 1;
    this.arrived = false;
    this.mode = 'walk';
    this.hidden = false;
    this.root.visible = true;
    this.root.rotation.set(0, 0, 0);
    if (!this.path) { this.pos.set(t.x, 0, t.z); this.arrived = true; this.onArrive(t); }
  }

  onArrive(t) {
    const sp = t.spot;
    this.mode = sp.sleep ? 'sleep' : sp.sit ? 'sit' : sp.upstairs ? 'gone' : sp.work || 'idle';
    this.hidden = this.mode === 'gone';
    this.root.visible = !this.hidden;
    if (this.spotName !== 'patrol') this.yaw = t.yaw;
    this.root.rotation.set(0, 0, 0);
  }

  get asleep() { return this.mode === 'sleep' || this.mode === 'gone'; }
  get awake() { return !this.asleep; }

  update(dt, P, h) {
    this.animT += dt;
    const want = this.wantSpot(h);
    if (want !== this.spotName && !this.talking) {
      this.spotName = want;
      this.goTo(this.spotPos(want));
    }
    let sp = 0;
    if (this.talking) {
      const a = Math.atan2(P.pos.x - this.pos.x, P.pos.z - this.pos.z);
      this.turnTo(a, dt * 6);
      this.mode = this.mode === 'sleep' ? 'sleep' : this.mode === 'sit' ? 'sit' : 'talk';
    } else if (this.path && !this.arrived) {
      const tgt = this.path[this.pi];
      if (!tgt) { this.finishPath(); }
      else {
        const dx = tgt.x - this.pos.x, dz = tgt.z - this.pos.z;
        const dd = Math.hypot(dx, dz);
        // vent hvis spilleren står i veien
        const pdx = P.pos.x - this.pos.x, pdz = P.pos.z - this.pos.z;
        const pd = Math.hypot(pdx, pdz);
        const ahead = pd < 1.0 && (pdx * dx + pdz * dz) > 0;
        if (ahead) { this.blockT += dt; if (this.blockT > 2.5) { this.blockT = 0; this.goTo(this.spotPos(this.spotName)); } }
        else this.blockT = 0;
        if (dd < 0.18) { this.pi++; if (this.pi >= this.path.length) this.finishPath(); }
        else if (!ahead) {
          const step = Math.min(dd, this.speed * dt);
          this.pos.x += (dx / dd) * step;
          this.pos.z += (dz / dd) * step;
          sp = this.speed;
          this.turnTo(Math.atan2(dx, dz), dt * 8);
        }
      }
    } else if (this.arrived && this.mode !== 'sleep' && this.mode !== 'gone' && this.mode !== 'sit') {
      // rusle rundt ved stedet sitt
      const spot = this.spotName === 'patrol' ? null : SPOTS[this.spotName];
      if (spot?.wander || this.def.wanderer) {
        this.wanderT -= dt;
        if (this.wanderT <= 0) {
          this.wanderT = 4 + Math.random() * 7;
          const r = spot?.wander || 1.5;
          for (let k = 0; k < 6; k++) {
            const x = U(spot.x + (Math.random() - 0.5) * 2 * r), z = U(spot.y + (Math.random() - 0.5) * 2 * r);
            if (this.life.town.walkOpen(Math.floor(x / T), Math.floor(z / T))) {
              this.path = this.life.town.npcPath(this.pos.x, this.pos.z, x, z);
              this.pi = 1;
              if (this.path) { this.arrived = false; this.wandering = true; this.mode = 'walk'; }
              break;
            }
          }
        }
      }
    }
    if (!this.hidden) {
      // ikke gå gjennom spilleren
      const dx = this.pos.x - P.pos.x, dz = this.pos.z - P.pos.z;
      const dd = Math.hypot(dx, dz);
      if (dd < 0.7 && dd > 1e-4 && this.mode !== 'sleep' && this.mode !== 'sit') { this.pos.x += dx / dd * (0.7 - dd) * 0.5; this.pos.z += dz / dd * (0.7 - dd) * 0.5; }
    }
    this.root.rotation.y = this.yaw;
    const far = Math.abs(this.pos.x - P.pos.x) + Math.abs(this.pos.z - P.pos.z) > 34;
    this.root.visible = !this.hidden && !far;
    if (!far && !this.hidden) this.animate(dt, sp);
    // rop når du går forbi
    this.barkT -= dt;
    if (this.barkT <= 0 && this.def.barks && this.awake && !this.talking) {
      this.barkT = 18 + Math.random() * 20;
      const dd = Math.hypot(this.pos.x - P.pos.x, this.pos.z - P.pos.z);
      if (dd < 7 && openAt(this.def.shopHours, h)) G.fx.float(this.def.barks[Math.floor(Math.random() * this.def.barks.length)], this.pos, 'say', this.height + 0.5);
    }
  }

  finishPath() {
    this.path = null;
    this.arrived = true;
    if (this.wandering) { this.wandering = false; this.mode = 'idle'; return; }
    if (this.spotName === 'patrol') {
      this.patrolI++;
      this.goTo(this.spotPos('patrol'));
      return;
    }
    const t = this.spotPos(this.spotName);
    this.pos.set(t.x, 0, t.z);
    this.onArrive(t);
  }

  turnTo(a, k) {
    let da = a - this.yaw;
    while (da > Math.PI) da -= Math.PI * 2;
    while (da < -Math.PI) da += Math.PI * 2;
    this.yaw += da * Math.min(1, k);
  }

  animate(dt, sp) {
    const t = this.animT;
    const mode = sp > 0 ? 'walk' : this.mode;
    if (sp > 0) this.walkPhase += dt * sp * 3.4;
    const spot = SPOTS[this.spotName];
    // posisjon og leie
    let y = 0, rx = 0, rz = 0;
    if (mode === 'sleep') {
      y = 0.47;
      if (this.rig) { if (spot?.lie === 'x') rz = Math.PI / 2; else rx = -Math.PI / 2; }
    } else if (mode === 'sit') y = this.rig ? -0.38 : 0.08;
    this.body.position.y += (y - this.body.position.y) * Math.min(1, dt * 8);
    this.body.rotation.x += (rx - this.body.rotation.x) * Math.min(1, dt * 6);
    this.body.rotation.z += (rz - this.body.rotation.z) * Math.min(1, dt * 6);
    if (this.blob) this.blob.visible = mode !== 'sleep';
    if (!this.rig) {
      // and: vagge
      const m = this.body.children[0];
      if (!m) return;
      const w = sp > 0 ? 1 : 0;
      m.rotation.z = Math.sin(this.walkPhase) * 0.13 * w;
      m.position.y = Math.abs(Math.sin(this.walkPhase)) * 0.05 * w + (mode === 'talk' ? Math.max(0, Math.sin(t * 7)) * 0.025 : 0);
      const sq = mode === 'sleep' ? 0.82 : 1 + Math.sin(t * 2) * 0.01;
      m.scale.y = (this.def.model.duck === 'flansen' ? 0.94 : 1.02) * sq;
      return;
    }
    const r = this.rig;
    const k = Math.min(1, dt * 10);
    const L = (o, key, v) => { o.rotation[key] += (v - o.rotation[key]) * k; };
    const ph = this.walkPhase;
    const w = sp > 0 ? Math.min(1, sp / 2) : 0;
    let legL = Math.sin(ph) * 0.6 * w, legR = -Math.sin(ph) * 0.6 * w;
    let kneeL = Math.max(0, -Math.sin(ph + 0.6)) * 0.8 * w, kneeR = Math.max(0, Math.sin(ph + 0.6)) * 0.8 * w;
    let shL = -legR * 0.55, shR = -legL * 0.55, elL = -0.2, elR = -0.2, shLz = 0.06, shRz = -0.06;
    let torX = 0.02 * w, headY = 0, headX = 0;
    if (this.def.model.weapon) { shR = -0.25; elR = -0.6; }
    if (this.def.patrol) { shL = -0.5; elL = -0.9; }
    if (mode === 'sit') { legL = legR = -1.45; kneeL = kneeR = 1.45; elL = elR = -0.6; shL = shR = -0.25; }
    else if (mode === 'sleep') { shL = shR = 0.05; elL = elR = -0.1; shLz = 0.12; shRz = -0.12; }
    else if (mode === 'hammer') {
      const p = (t * 1.1) % 1;
      shR = p < 0.6 ? -0.4 - p / 0.6 * 2.0 : -2.4 + (p - 0.6) / 0.4 * 2.0;
      elR = -0.5;
      shL = -0.7; elL = -0.8; torX = 0.12;
      if (p > 0.97 && !this.hit) { this.hit = true; this.life.clang(this); }
      if (p < 0.5) this.hit = false;
    } else if (mode === 'dig') {
      const p = Math.sin(t * 2.2);
      shR = -0.8 - p * 0.4; shL = -0.8 - p * 0.4; elR = elL = -0.5; torX = 0.25 + p * 0.1;
    } else if (mode === 'talk') {
      headX = Math.sin(t * 2.3) * 0.05;
      if (Math.sin(t * 0.9) > 0.3) { shR = -0.7 + Math.sin(t * 3.1) * 0.2; elR = -1.1; }
    } else if (mode === 'idle') {
      headY = Math.sin(t * 0.37 + this.id.length) * 0.35;
      shR = -0.04 + Math.sin(t * 1.3) * 0.02;
    }
    L(r.legL, 'x', legL); L(r.legR, 'x', legR);
    L(r.kneeL, 'x', kneeL); L(r.kneeR, 'x', kneeR);
    L(r.shL, 'x', shL); L(r.shR, 'x', shR);
    L(r.shL, 'z', shLz); L(r.shR, 'z', shRz);
    L(r.elL, 'x', elL); L(r.elR, 'x', elR);
    L(r.torso, 'x', torX);
    L(r.head, 'y', headY); L(r.head, 'x', headX);
    r.torso.scale.y = 1 + Math.sin(t * 2.1) * 0.012;
    if (r.tail) r.tail.rotation.y = Math.sin(t * 3) * 0.4;
  }

  dispose() {
    G.scene.remove(this.root);
  }
}

// --- byen lever ---------------------------------------------------------------------------
export class TownLife {
  constructor(town, W) {
    this.town = town;
    this.W = W;
    const run = G.run;
    run.quests = run.quests || {};
    run.rykte = run.rykte || 0;
    this.visit = { barter: {}, stolen: new Set(), once: new Set(), fished: 0, rumor: Math.floor(Math.random() * RUMORS.length) };
    this.talk = new Talk(this);
    G.talk = this.talk;
    this.npcs = PEOPLE.map(def => new NPC(def, this));
    const h = hourOf(run.clock);
    for (const n of this.npcs) n.snap(h);
    for (const n of this.npcs) {
      const it = { kind: 'npc', npc: n, pos: n.pos, radius: 0.42, reach: 1.25, solid: true, label: null, onUse: () => this.talkTo(n) };
      n.it = it;
      G.interactables.push(it);
    }
    // nattevaktens lykt lyser opp gata
    const garin = this.npcs.find(n => n.def.patrol);
    if (garin) {
      this.garinLight = { pos: new THREE.Vector3(), color: new THREE.Color(0xffb468), intensity: 0, base: 12, phase: 1, dist: 9 };
      W.sources.push(this.garinLight);
      this.garin = garin;
    }
    this.addFixtures();
  }

  add(x, z, radius, label, onUse, o = {}) {
    const it = { kind: o.kind || 'town', pos: new THREE.Vector3(x, 0, z), radius, solid: !!o.solid, label, baseLabel: label, onUse, ...o };
    G.interactables.push(it);
    return it;
  }

  addFixtures() {
    const T0 = this.town;
    this.grateIt = this.add(T0.grate.x, T0.grate.z, 0.85, 'Klatre ned i kloakken', () => G.game.enterSewers());
    this.add(T0.board.x, T0.board.z, 0.6, 'Les oppslagstavla', () => this.talk.open(BOARD));
    this.add(T0.memorial.x, T0.memorial.z, 0.5, 'Les minnesteinen', () => this.readMemorial());
    this.add(T0.sundial.x, T0.sundial.z, 0.75, 'Se på soluret', () => this.readSundial());
    this.add(T0.well.x + 1.25, T0.well.z + 0.4, 0.4, 'Drikk av brønnen', () => this.drinkWell());
    this.add(U(32.5), U(16.5), 0.7, 'Fiske fra brygga (Jakt & fiske)', () => this.fish());
    this.add(U(7.0), U(10.5), 0.6, 'Opptre på scenen (Uppträda)', () => this.perform(), { stage: true });
    this.add(U(15.25), U(39.55), 0.6, G.player.isNebb ? 'Sov i den gamle senga di' : 'En seng som lukter and', () => this.nebbBed());
    // offerskål i tempelet
    const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.2, 0.18, 14), new THREE.MeshStandardMaterial({ color: 0xd8a840, roughness: 0.25, metalness: 1, emissive: 0x6a4a10, emissiveIntensity: 0.4 }));
    bowl.position.set(U(23.9), 0.95, U(12.6));
    const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.2, 0.86, 8), bowl.material);
    stand.position.set(U(23.9), 0.43, U(12.6));
    T0.group.add(bowl, stand);
    T0.addBlock(U(23.9) - 0.22, U(12.6) - 0.22, U(23.9) + 0.22, U(12.6) + 0.22);
    this.add(U(23.9), U(12.6), 0.35, 'Gi en gave til Utu (5 silver)', () => this.offering(), { steal: 'bowl', normal: 'Gi en gave til Utu (5 silver)' });
    // pengekiste hos Hvass
    const chest = buildChest();
    chest.position.set(U(40.85), 0, U(35.6));
    chest.rotation.y = -Math.PI / 2;
    chest.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    T0.group.add(chest);
    T0.addBlock(U(40.85) - 0.38, U(35.6) - 0.58, U(40.85) + 0.38, U(35.6) + 0.58);
    this.chestMesh = chest;
    this.add(U(40.5), U(35.6), 0.6, null, () => this.steal('strongbox'), { steal: 'strongbox', sneakLabel: 'Dyrk opp pengekisten (Fingerfärdighet)' });
    // boder og hylla i butikken: bare når du sniker
    for (const s of T0.stalls) {
      const owner = { spice: 'gaspard', fish: 'regin', veg: 'edegar' }[s.id];
      this.add(U(s.x), U(s.z) + s.face * 1.05, 0.7, null, () => this.steal('stall_' + s.id), { steal: 'stall_' + s.id, owner, sneakLabel: 'Snatt fra boden (Fingerfärdighet)' });
    }
    this.add(U(6.2), U(17.0), 0.5, null, () => this.steal('shelf'), { steal: 'shelf', owner: 'nansen', sneakLabel: 'Snatt fra hylla (Fingerfärdighet)' });
  }

  get hour() { return hourOf(G.run.clock); }

  update(dt, P, sky) {
    const h = this.hour;
    for (const n of this.npcs) n.update(dt, P, h);
    // merkelapper
    const sneaking = P.stealth > 0;
    for (const n of this.npcs) {
      const it = n.it;
      const met = G.meta.met?.[n.id];
      const nm = met ? n.def.name : n.def.short;
      it.solid = !n.hidden && n.mode !== 'sleep';
      it.label = n.hidden ? null : n.mode === 'sleep' ? `${cap(nm)} sover` : `Snakk med ${nm}`;
    }
    for (const it of G.interactables) {
      if (it.sneakLabel) it.label = sneaking && !this.visit.stolen.has(it.steal) ? it.sneakLabel : null;
      if (it.steal === 'bowl') it.label = sneaking ? (this.visit.stolen.has('bowl') ? null : 'Snatt fra offerskåla (Fingerfärdighet)') : it.normal;
      if (it.stage) it.label = h >= 17 || h < 2 ? 'Opptre på scenen (Uppträda)' : null;
    }
    const n = G.run.nextDepth || 1;
    this.grateIt.label = n > 1 ? `Klatre ned i kloakken (tilbake til nivå ${n})` : 'Klatre ned i kloakken';
    if (this.garin) {
      const g = this.garin;
      tmp.set(0, 0, 0);
      g.lamp?.getWorldPosition(tmp);
      this.garinLight.pos.copy(tmp);
      this.garinLight.pos.y += 0.4;
      const lit = sky ? Math.max(0, (sky.night - 0.2) / 0.6) : 0.5;
      this.garinLight.intensity = g.root.visible && g.awake ? this.garinLight.base * Math.min(1, lit) : 0;
      if (g.lamp) g.lamp.material.emissiveIntensity = 0.3 + Math.min(1, lit) * 2;
    }
  }

  snapAll() {
    const h = this.hour;
    for (const n of this.npcs) if (!n.talking) n.snap(h);
  }

  clang(npc) {
    const P = G.player;
    if (Math.hypot(npc.pos.x - P.pos.x, npc.pos.z - P.pos.z) > 14) return;
    G.audio.clang?.();
    G.fx.burst('spark', { x: U(24.6), y: 0.9, z: U(32.6) }, 6);
  }

  questLog(id) {
    G.ui.log(`<b class="c-mark">Nytt oppdrag:</b> ${QUEST_TITLES[id]}`);
    G.audio.drake?.();
  }

  // --- samtaler -----------------------------------------------------------------------
  talkTo(n) {
    const P = G.player;
    if (n.mode === 'sleep') {
      G.fx.float('Zzz', n.pos, 'miss', 1.2);
      if (!this.sleepHint) { this.sleepHint = true; G.ui.log(`${G.meta.met?.[n.id] ? n.def.name : cap(n.def.short)} sover. Folk i Fristaden følger døgnet. Kom tilbake når det er lyst.`); }
      return;
    }
    const h = this.hour;
    if (n.id === 'nansen' && openAt(n.def.shopHours, h) && n.spotName === 'shop_counter' && n.arrived) {
      n.talking = true;
      this.talkingNansen = n;
      G.game.openShop();
      return;
    }
    void P;
    this.talk.open(n);
  }

  price(npcId, base) {
    let m = 1;
    const ry = G.run.rykte || 0;
    if (ry <= -2) m *= 1.25;
    else if (ry >= 3) m *= 0.9;
    if (G.run.guild) m *= 0.9;
    const b = this.visit.barter[npcId];
    if (b === 'good') m *= 0.8;
    else if (b === 'great') m *= 0.6;
    else if (b === 'bad') m *= 1.25;
    if (G.player.flags.has('discount')) m *= 0.8;
    return base === 0 ? 0 : Math.max(1, Math.round(base * m));
  }

  priceNote(npcId) {
    const n = [];
    const ry = G.run.rykte || 0;
    if (ry <= -2) n.push('dårlig rykte: dyrere');
    else if (ry >= 3) n.push('godt rykte: billigere');
    if (G.run.guild) n.push('laugspris');
    const b = this.visit.barter[npcId];
    if (b === 'good') n.push('Köpslå: 20% avslag');
    if (b === 'great') n.push('Köpslå: 40% avslag');
    if (b === 'bad') n.push('Köpslå: 25% dyrere');
    return n.join(', ');
  }

  barterFn(npcId, talk, refresh) {
    if (this.visit.barter[npcId]) return null;
    return () => {
      const P = G.player;
      P.rollPush('Köpslå', { important: true, label: 'Köpslå' }, r => {
        let t;
        if (r.demon) { this.visit.barter[npcId] = 'bad'; t = 'Prute? Med meg? Nå ble alt litt dyrere.'; }
        else if (r.drake) { this.visit.barter[npcId] = 'great'; t = 'Du er verre enn Hvass. Greit. Nesten halv pris.'; }
        else if (r.success) { this.visit.barter[npcId] = 'good'; t = 'Hmf. Du får en rabatt. Ikke si det til noen.'; }
        else { this.visit.barter[npcId] = 'none'; t = 'Prisene står fast. De står der av en grunn.'; }
        G.ui.logRoll(r, 'Köpslå.');
        talk.say(t);
        refresh();
      });
    };
  }

  service(act, talk, npc) {
    const P = G.player;
    const h = this.hour;
    const def = npc?.def || npc;
    const closed = def?.shopHours && !openAt(def.shopHours, h);
    const once = k => this.visit.once.has(k);
    const mark = k => this.visit.once.add(k);
    const fx = (kind, n = 20) => G.fx.burst(kind, P.pos, n);
    if (closed && !['rumor', 'song', 'play', 'alms'].includes(act)) {
      talk.say(def.closedLine || 'Det er stengt nå. Kom tilbake i morgen.');
      return;
    }
    const id = def?.id;
    if (act === 'train') {
      const refresh = () => {
        const rows = G.game.upgrades.map(u => {
          const lv = G.meta.levels[u.id] || 0;
          return { name: `${u.name} ${'I'.repeat(lv)}${lv >= u.max ? ' (ferdig)' : ''}`, desc: u.desc + ' Gjelder også dette løpet.', price: u.cost * (lv + 1), disabled: lv >= u.max, label: lv >= u.max ? 'Lært' : null, buy: () => G.game.buyUpgradeNow(u) };
        });
        talk.wares(rows, { currency: 'fjær', refresh, note: 'fjær fra tidligere løp' });
      };
      refresh();
      talk.say('Fjær for kunnskap. Det er en god handel for deg og en dårlig handel for fjærene.');
    } else if (act === 'innRoom') {
      const price = this.price(id, 6);
      talk.wares([{ name: 'Et rom for natta', desc: 'Sov til klokka sju. Alle KP, VP og tillstånd kommer tilbake, og svåra skador gror litt.', price, buy: () => { this.sleep('inn'); return 'Første dør til venstre i trappa. Ikke den andre, der bor Gaspard.'; } }], { note: this.priceNote(id) });
      talk.say('Seks silver for natta. Frokost er ikke inkludert, men lukten av den er gratis.');
    } else if (act === 'innMeal') {
      const refresh = () => talk.wares([
        { name: 'Svartsoppa', desc: 'Kokt på gåseblod, med kanel i stedet for galle. Helbreder T6+2 KP og tar bort Krasslig.', price: this.price(id, 3), buy: () => { const got = P.heal(d(6) + 2); P.clearCond?.('KRA'); fx('heal', 12); return got ? `Den smaker bedre enn den ser ut. +${got} KP.` : 'Du er mett, men du spiser opp likevel.'; } },
        { name: 'Brød og ost', desc: 'Helbreder 3 KP.', price: this.price(id, 2), buy: () => { const got = P.heal(3 + (P.mods.breadHeal || 0)); return got ? `+${got} KP. Mester Flansen hadde godkjent.` : 'Du er allerede mett.'; } },
        { name: 'Gåsestek', desc: 'Husets stolthet. Alle KP tilbake. Én gang per besøk.', price: this.price(id, 9), disabled: once('stek'), buy: () => { mark('stek'); P.heal(99); fx('heal', 24); return 'Den feite gåsen. Du forstår navnet nå.'; } },
      ], { note: this.priceNote(id), refresh, barter: this.barterFn(id, talk, () => refresh()) });
      refresh();
      talk.say('Vi har svartsoppa, brød og gåsestek. Svartsoppaen er tradisjon. Gåsesteken er grunnen til at folk kommer.');
    } else if (act === 'innAle') {
      const refresh = () => talk.wares([
        { name: 'Øl', desc: '+1 VP og et rykte på kjøpet.', price: this.price(id, 1), buy: () => { P.vp = Math.min(P.maxVP, P.vp + 1); return RUMORS[(this.visit.rumor++) % RUMORS.length]; } },
        { name: 'Mjød', desc: '+T6 VP, men slå FYS eller bli Omtöcknad.', price: this.price(id, 3), buy: () => {
          const n = d(6);
          P.vp = Math.min(P.maxVP, P.vp + n);
          const r = P.roll('FYS', { noArmed: true });
          if (!r.success) P.addCond('OMT');
          G.ui.logRoll(r, r.success ? 'Mjøden går rett i hodet, men du holder deg.' : 'Mjøden går rett i hodet. Du blir Omtöcknad.');
          return r.success ? `+${n} VP. Sterk saker.` : `+${n} VP. Rommet snurrer litt.`;
        } },
      ], { note: this.priceNote(id), refresh });
      refresh();
      talk.say('Øl eller mjød? Øl er for prat. Mjød er for å glemme praten.');
    } else if (act === 'rumor') {
      talk.say(RUMORS[(this.visit.rumor++) % RUMORS.length]);
    } else if (act === 'heal') {
      const free = P.sheet.aidne === 7;
      const refresh = () => talk.wares([
        { name: 'Helbredelse', desc: 'Alle KP tilbake, og svåra skador som ikke er varige gror.', price: free ? 0 : this.price(id, 8), buy: () => {
          P.heal(99);
          const before = P.injuries.length;
          P.injuries = P.injuries.filter(i => i.perm);
          P.recalc();
          fx('heal', 30);
          G.audio.heal();
          return before > P.injuries.length ? 'Utus lys går gjennom deg. Sårene lukker seg, også de dype.' : 'Utus lys går gjennom deg. Det er varmt, nesten for varmt.';
        } },
        { name: 'Rensing', desc: 'Tar bort alle tillstånd.', price: free ? 0 : this.price(id, 4), buy: () => { P.clearConds(); fx('will', 16); return 'Det som tynget deg, ligger igjen her. Utu tar vare på det.'; } },
      ], { note: free ? 'gratis for prästerskap' : this.priceNote(id), refresh });
      refresh();
      talk.say(free ? 'For en av oss koster det ingenting. Utu har nok.' : 'Utu helbreder alle. Tempelet tar imot gaver. Det er ikke det samme, men det henger sammen.');
    } else if (act === 'bless') {
      const free = P.sheet.aidne === 7;
      talk.wares([{ name: 'Utus velsignelse', desc: 'Neste nivå: sterkere lys rundt deg og fördel mot skräck. Én gang per besøk.', price: free ? 0 : this.price(id, 12), disabled: once('bless') || G.run.blessing, label: once('bless') || G.run.blessing ? 'Velsignet' : null, buy: () => { mark('bless'); G.run.blessing = true; fx('gold', 24); G.audio.drake?.(); return 'Måtte Utu se deg, også der solen ikke når.'; } }], { note: free ? 'gratis for prästerskap' : this.priceNote(id) });
      talk.say('Velsignelsen varer ett nivå. Lenger enn det kan ingen be om lys under jorda.');
    } else if (act === 'oathHeal') {
      if ((G.run.rykte || 0) <= -3) { talk.say('Jeg helbreder de syke, ikke tyver. Gå til tempelet, kanskje Utu er mer tilgivende.'); return; }
      if (once('oath')) { talk.say('Jeg har gjort det jeg kan for deg i dag. Kom tilbake i morgen.'); return; }
      mark('oath');
      P.clearConds();
      const got = P.heal(d(6));
      fx('heal', 20);
      G.audio.heal();
      talk.say(`Munkeløftet sier at jeg skal helbrede de syke. Det koster ingenting. ${got ? `+${got} KP, og` : 'Du er'} kvitt det som tynget deg.`);
    } else if (act === 'smithShop') {
      if (!this.visit.smith) {
        const depth = Math.max(1, Math.min(5, G.run.nextDepth || 1));
        const pref = P.sheet.trained.filter(s => s);
        this.visit.smith = [
          makeItem(depth + 1, { slot: 'vapen', prefer: pref, noUnique: true }),
          makeItem(depth + 1, { slot: 'vapen', prefer: pref, noUnique: true, rarity: 'magisk' }),
          makeItem(depth, { slot: 'vapen', noUnique: true }),
          makeItem(depth + 1, { slot: 'rustning', noUnique: true }),
          makeItem(depth + 1, { slot: 'hjalm', noUnique: true }),
        ].map(it => ({ it, sold: false }));
      }
      const refresh = () => talk.wares(this.visit.smith.map(s => ({
        name: s.it.name, color: RARITY[s.it.rarity].color, desc: s.it.lines.join(', '), price: this.price(id, s.it.value + 8), disabled: s.sold, label: s.sold ? 'Solgt' : null,
        buy: () => { s.sold = true; giveItem(s.it); return 'Godt jern. Ikke bruk det på stein.'; },
      })), { note: this.priceNote(id), refresh, barter: this.barterFn(id, talk, () => refresh()) });
      refresh();
      talk.say('Se deg om. Alt er smidd her, unntatt det som er smidd i Karad Batur. Det er bedre.');
    } else if (act === 'sellGear') {
      const ry = G.run.rykte || 0;
      renderSellList(document.querySelector('#dlg-wares'), 'bataar', {
        mod: ry <= -2 ? 0.8 : ry >= 3 ? 1.1 : 1,
        say: t => talk.say(t),
        line: (e, n) => (e.rarity === 'vanlig' ? `${n} silver. Mest for jernet.` : `${n} silver. Pent arbeid. Ikke dvergearbeid, men pent.`),
      });
      talk.say('Jeg kjøper jern, ikke juveler. Juveler kan du ta med til butikken til Nansen.');
    } else if (act === 'repair') {
      const broken = Object.values(P.equip).filter(it => it?.broken);
      if (!broken.length) { talk.say('Det er ingenting trasig på deg. Ikke ennå.'); return; }
      const refresh = () => talk.wares(broken.map(it => ({ name: it.name, desc: 'Reparer', price: this.price(id, 5), disabled: !it.broken, label: it.broken ? null : 'Hel', buy: () => { it.broken = false; refinalize(it); P.recalc(); P.refreshWeaponMeshes?.(); return 'Sånn. Som nytt. Bedre enn nytt, faktisk.'; } })), { note: this.priceNote(id), refresh });
      refresh();
      talk.say('Vis meg hva du har ødelagt.');
    } else if (act === 'sharpen') {
      talk.wares([{ name: 'Slipe våpenet', desc: 'Neste nivå: fiendens rustning teller ett mindre mot deg.', price: this.price(id, 8), disabled: G.run.sharpen, label: G.run.sharpen ? 'Slipt' : null, buy: () => { G.run.sharpen = true; G.fx.burst('spark', P.pos, 14); return 'Eggen biter nå. Den holder ett nivå, så må du komme tilbake.'; } }], { note: this.priceNote(id) });
      talk.say('Et slipt våpen er et lykkelig våpen.');
    } else if (act === 'teach') {
      const school = P.sheet.school;
      if (!school) { talk.say('Du har ingen gnist. Jeg kan se det. Men jeg kan selge deg trolldrikk, hvis det er noen trøst.'); return; }
      const refresh = () => {
        const newSpells = Object.keys(SPELLS).filter(k => SPELLS[k].school === school && !P.spells.includes(k));
        const newTricks = Object.keys(TRICKS).filter(k => (TRICKS[k].school === school || TRICKS[k].school === 'Allmän') && !P.tricks.has(k));
        const prepared = P.spells.slice(3);
        const rows = [
          ...newSpells.map(k => ({ name: `Besvärjelse: ${SPELLS[k].name}`, desc: SPELLS[k].game, price: this.price(id, 25), buy: () => { P.spells.unshift(k); G.ui.buildBar(); return `${SPELLS[k].name} er din. Den ligger først i grimoiren, så den er klar på R.`; } })),
          ...prepared.map(k => ({ name: `Forbered: ${SPELLS[k].name}`, desc: 'Flytt besvärjelsen til R. Du har bare tre forberedt om gangen.', price: 0, label: 'Forbered', buy: () => { P.spells = [k, ...P.spells.filter(x => x !== k)]; G.ui.buildBar(); return `${SPELLS[k].name} er forberedt.`; } })),
          ...newTricks.map(k => ({ name: `Trolleritrick: ${TRICKS[k].name}`, desc: TRICKS[k].game, price: this.price(id, 10), buy: () => { P.tricks.add(k); return `${TRICKS[k].name}. Et lite triks, men lite er ofte nok.`; } })),
        ];
        if (!rows.length) { talk.say('Du kan alt jeg kan lære bort i din skole. Det er både imponerende og litt irriterende.'); $hide(); return; }
        talk.wares(rows, { note: this.priceNote(id), refresh });
      };
      refresh();
      talk.say(`${school}. Det kan jeg. Velg, og betal, og ikke stå så nær kula.`);
    } else if (act === 'potionVP') {
      const refresh = () => talk.wares([
        { name: 'Trolldrikk', desc: 'Alle VP tilbake. Drikkes nå hvis du mangler VP, ellers i sekken.', price: this.price(id, 10), buy: () => { if (P.vp < P.maxVP) { P.vp = P.maxVP; fx('will', 20); } else giveItem(makeCons('trolldrikk')); return 'Den smaker fiolett. Det er normalt.'; } },
        { name: 'Legedrikk', desc: 'Helbreder 2T6 KP. Går i beltet, eller i sekken når beltet er fullt.', price: this.price(id, 16), buy: () => { giveItem(makeCons('legedrikk')); return 'For når det går galt. Det går alltid galt.'; } },
      ], { note: this.priceNote(id), refresh, barter: this.barterFn(id, talk, () => refresh()) });
      refresh();
      talk.say('Trolldrikk for viljen, legedrikk for kroppen. Ingen av dem for sjelen.');
    } else if (act === 'spiceShop') {
      const refresh = () => talk.wares([
        { name: 'Gåseleverpølse', desc: 'Helbreder 4 KP. Spises nå hvis du er skadet, ellers i sekken.', price: this.price(id, 3), buy: () => { if (P.kp < P.maxKP) { const got = P.heal(4); return `+${got} KP. Du føler deg litt adelig.`; } giveItem(makeCons('polse')); return 'Til senere. Den holder seg. Det er det beste man kan si om den.'; } },
        { name: 'Kanelbolle', desc: 'Helbreder 2 KP og gir 1 VP. Spises nå eller går i sekken.', price: this.price(id, 2), buy: () => { if (P.kp < P.maxKP || P.vp < P.maxVP) { P.heal(2); P.vp = Math.min(P.maxVP, P.vp + 1); return 'Kanel. Shamash ville ha grått.'; } giveItem(makeCons('kanel')); return 'Pakket inn i papir. Ikke sett deg på den.'; } },
        { name: 'Legedrikk', desc: 'Helbreder 2T6 KP. Beltet først, så sekken.', price: this.price(id, 15), buy: () => { giveItem(makeCons('legedrikk')); return 'Fra Ekeborg. Nesten ekte.'; } },
        { name: 'Nesten ekte safran', desc: 'Gul. Det er det meste man kan si om den. Gaspard blunker.', price: this.price(id, 20), disabled: once('fake'), buy: () => { mark('fake'); G.run.fakeSaffron = true; giveItem(makeCons('safran')); return 'Ikke vis den til Hvass. Eller vis den til Hvass, og løp.'; } },
      ], { note: this.priceNote(id), refresh, barter: this.barterFn(id, talk, () => refresh()) });
      refresh();
      talk.say('Smak, min venn, smak! Det er det eneste livet ikke kan ta fra deg. Bortsett fra alt det andre.');
    } else if (act === 'alms') {
      const free = P.sheet.aidne === 1;
      if (once('alms')) { talk.say('Jeg har sagt det jeg vet. Rottene har ikke sagt noe nytt siden.'); return; }
      talk.wares([{ name: 'En almisse', desc: 'Tobolt forteller hvor ting er gjemt på neste nivå (gjemmesteder vises på kartet).', price: free ? 0 : 5, buy: () => {
        mark('alms');
        G.run.cacheHint = (G.run.cacheHint || 0) + 2;
        if (!G.run.almsGiven) { G.run.almsGiven = true; G.run.rykte = (G.run.rykte || 0) + 1; }
        return 'Takk, takk. Hør her: der nede er det steiner som sitter løst, og bak dem ligger det ting. Rottene viste meg. Se etter dem på kartet ditt.';
      } }], { note: free ? 'gratis for en gammel venn' : '' });
      talk.say(free ? 'For deg er det gratis, gamle venn. Bare si ordet.' : 'Fem silver. Kongen må spise, selv om riket er lite.');
    } else if (act === 'play') {
      if (G.run.pimpaStone) { talk.say('Du har allerede lykkesteinen min! Ikke mist den!'); return; }
      G.run.pimpaStone = true;
      const it = questAmulet('pimpa');
      giveItem(it);
      talk.say('Du er den! Nei, vent. Her, du kan få lykkesteinen min. Den er magisk. Den er helt vanlig, men den er magisk.');
    } else if (act === 'perform') {
      this.perform(talk);
    } else if (act === 'song') {
      const songs = [
        'Isold stemmer lutten og synger om Tornväktarnas martyrer, som står opp når klokkene ringer i Pendon. Ingen klokker ringer. Hun synger likevel.',
        'Isold synger visen om Svart Nebb. Den går i tre fjerdedeler. Den handler om en and som går ned i mørket for å redde farens ære, og om tre brød.',
        'Isold synger om dvergene som dro fra Karad Baturs handelspost og etterlot runene sine. Refrenget er bare dvergenavn.',
      ];
      G.audio.menuSelect?.();
      talk.say(songs[Math.floor(Math.random() * songs.length)]);
    } else if (act === 'rewardDead') {
      const it = questAmulet('martyr');
      giveItem(it);
      G.run.rykte = (G.run.rykte || 0) + 1;
      G.ui.log(`<b class="c-mark">Oppdrag fullført:</b> De dødes fred. Du får ${it.name}.`);
      G.audio.drake?.();
    } else if (act === 'rewardRats') {
      P.silver += 20;
      P.heal(2);
      G.run.rykte = (G.run.rykte || 0) + 1;
      G.audio.coin();
      G.ui.log('<b class="c-mark">Oppdrag fullført:</b> Rotteplagen. +20 silver og et kålhode (+2 KP).');
    } else if (act === 'rewardRunes') {
      const w = P.equip.vapen;
      G.run.rykte = (G.run.rykte || 0) + 1;
      if (w && w.kind !== 'fist') {
        w.mods = w.mods || {};
        if (!w.mods.master) { w.mods.master = 1; w.name = 'Bataars ' + w.name.replace(/^Bataars /, ''); }
        else w.mods.dmg = (w.mods.dmg || 0) + 1;
        refinalize(w);
        P.recalc();
        G.ui.log(`<b class="c-mark">Oppdrag fullført:</b> Runesteinen. ${w.name} er et mesterverk nå.`);
      } else {
        P.silver += 30;
        G.ui.log('<b class="c-mark">Oppdrag fullført:</b> Runesteinen. Du har ikke noe våpen, så Bataar betaler 30 silver.');
      }
      G.audio.drake?.();
    }
  }

  // --- ting du kan gjøre i byen ---------------------------------------------------------------
  sleep(where) {
    const P = G.player;
    G.game.wipe(() => {
      const c = G.run.clock;
      let t = Math.floor(c / 24) * 24 + 7;
      if (t <= c + 0.5) t += 24;
      G.run.clock = t;
      P.kp = P.maxKP;
      P.vp = P.maxVP;
      P.clearConds();
      if (P.floor) { P.floor.roundRest = false; P.floor.stretchRest = false; P.floor.memento = false; }
      for (const inj of P.injuries) if (!inj.perm) inj.left--;
      P.injuries = P.injuries.filter(i => i.perm || i.left > 0);
      P.recalc();
      this.talk.close();
      this.visit.once.clear();
      this.visit.barter = {};
      this.visit.stolen.clear();
      this.visit.smith = null;
      this.snapAll();
      G.fx.burst('heal', P.pos, 24);
      G.audio.heal();
      G.ui.log(where === 'home' ? 'Du sover i den gamle senga di. Far snorker i rommet ved siden av. Lång vila: alt er tilbake.' : 'Du sover på Den feite gåsen. Gaspard snorker gjennom veggen. Lång vila: alt er tilbake.');
      G.ui.log('Klokka er sju. En ny dag i Fristaden.');
    });
  }

  nebbBed() {
    const P = G.player;
    if (!P.isNebb) { G.ui.log('Det er ikke din seng. Den lukter and, og den er for liten.'); return; }
    this.sleep('home');
  }

  readMemorial() {
    const def = {
      id: 'memorial', name: 'Minnesteinen', title: 'Tornväktarordens martyrer', board: true, start: [],
      greet: () => 'Navn hogd i stein: Ser Aldrin av Tornet, Syster Hild, Bror Garmander, Ser Valien den yngre, og mange flere som er slitt bort av regn. Nederst står det: "De står opp når de trengs."',
      topics: {},
    };
    this.talk.open(def);
    const P = G.player;
    if (!this.visit.once.has('memorial')) {
      this.visit.once.add('memorial');
      const r = P.roll('Myter & legender', { noArmed: true });
      if (r.success) { P.vp = Math.min(P.maxVP, P.vp + 2); G.ui.logRoll(r, 'Du kjenner historiene bak navnene. Det gir mot. +2 VP.'); }
      else G.ui.logRoll(r, 'Navnene sier deg ingenting, men du leser dem likevel.');
    }
  }

  readSundial() {
    const h = this.hour;
    if (isNight(h) || h < 6.2 || h > 20) { G.ui.log('Uten sol viser soluret ingenting. Utu ser ikke om natta.'); return; }
    const hh = Math.floor(h), mm = Math.floor((h - hh) * 60 / 15) * 15;
    G.ui.log(`Skyggen på soluret faller omtrent på ${hh}.${String(mm).padStart(2, '0')}.`);
  }

  drinkWell() {
    const P = G.player;
    if (this.visit.once.has('well')) { G.ui.log('Du har drukket nok brønnvann for i dag.'); return; }
    this.visit.once.add('well');
    P.vp = Math.min(P.maxVP, P.vp + 1);
    G.audio.splash?.();
    G.ui.log('Brønnvannet er kaldt og smaker jern. +1 VP.');
  }

  fish() {
    const P = G.player;
    if (this.visit.fished >= 3) { G.ui.log('Fisken har skjønt hva du driver med. Prøv igjen en annen dag.'); return; }
    this.visit.fished++;
    G.run.clock += 0.33;
    let boon = P.sheet.aidne === 3 ? 1 : 0;
    const h = this.hour;
    if (h < 8 || (h > 17 && h < 21)) boon++;
    P.rollPush('Jakt & fiske', { important: true, label: 'Jakt & fiske', boon, noArmed: true }, r => {
      if (r.drake) {
        const it = makeItem(Math.max(1, G.run.nextDepth || 1), { slot: 'amulett', rarity: 'magisk' });
        G.ui.logRoll(r, `En stor gjedde! Inni den ligger ${it.name}. Det skjer oftere i viser enn i virkeligheten.`);
        G.world.spawnPickup('item', P.pos.x, P.pos.z + 0.6, { item: it });
        P.heal(d(6));
      } else if (r.success) {
        const got = P.heal(d(6));
        G.ui.logRoll(r, `Du får en abbor og steker den over Tobolts bål. ${got ? `+${got} KP.` : 'Du er mett, men den var god.'}`);
      } else if (r.demon) {
        G.ui.logRoll(r, 'Snøret setter seg fast, og du faller nesten i elva. Du blir våt og sur.');
        P.addCond('ARG');
      } else G.ui.logRoll(r, 'Ingenting biter. Elva ser på deg.');
    });
  }

  perform(talk) {
    const P = G.player;
    const h = this.hour;
    const say = t => (talk ? talk.say(t) : G.ui.log(t));
    if (!(h >= 17 || h < 2)) { say('Det er ingen publikum før kvelden. Kom tilbake når folk har fått i seg litt øl.'); return; }
    if (this.visit.once.has('perform')) { say('Du har opptrådt i kveld. To ganger blir for mye for alle.'); return; }
    this.visit.once.add('perform');
    P.rollPush('Uppträda', { important: true, label: 'Uppträda', noArmed: true }, r => {
      if (r.drake) {
        const n = rollDice('D6') * 6;
        P.silver += n;
        G.run.rykte = (G.run.rykte || 0) + 1;
        G.ui.logRoll(r, `Hele vertshuset synger med. Noen gråter. +${n} silver.`);
        G.fx.burst('gold', P.pos, 20);
      } else if (r.success) {
        const n = rollDice('D6') * 2;
        P.silver += n;
        G.ui.logRoll(r, `Folk klapper, og noen slenger mynter. +${n} silver.`);
        G.audio.coin();
      } else if (r.demon) {
        G.run.rykte = (G.run.rykte || 0) - 1;
        G.ui.logRoll(r, 'Noen kaster en kålrot. Den treffer. Edegar vil ha den tilbake.');
        P.kp = Math.max(1, P.kp - 1);
      } else G.ui.logRoll(r, 'Ingen klapper. Ingen kaster noe heller. Det er nesten verre.');
      if (talk) talk.renderKeywords();
    });
  }

  offering() {
    const P = G.player;
    if (this.visit.once.has('offer')) { G.ui.log('Du har gitt til Utu i dag. Han ser deg.'); return; }
    if (P.silver < 5) { G.ui.log('Du har ikke fem silver. Utu forstår. Tempelet forstår mindre.'); return; }
    P.silver -= 5;
    this.visit.once.add('offer');
    P.vp = Math.min(P.maxVP, P.vp + 2);
    if (!G.run.offered) { G.run.offered = true; G.run.rykte = (G.run.rykte || 0) + 1; }
    G.fx.burst('gold', P.pos, 16);
    G.audio.coin();
    G.ui.log('Du legger fem silver i skåla. Solskiven over alteret glimter. +2 VP.');
  }

  // Hvem ser deg? Våkne folk innen 9 meter med fri sikt.
  witnesses(pos, except) {
    const out = [];
    for (const n of this.npcs) {
      if (n.hidden || !n.awake || n.id === except) continue;
      const dd = Math.hypot(n.pos.x - pos.x, n.pos.z - pos.z);
      if (dd > 9) continue;
      if (!this.town.los(n.pos.x, n.pos.z, pos.x, pos.z)) continue;
      out.push(n);
    }
    return out;
  }

  steal(what) {
    const P = G.player;
    if (this.visit.stolen.has(what)) return;
    const h = this.hour;
    const night = isNight(h);
    const ws = this.witnesses(P.pos);
    let boon = 0, bane = 0;
    if (night && !ws.length) boon++;
    if (!night && ws.length) bane++;
    if (what === 'strongbox') {
      if (G.run.strongbox) { G.ui.log('Pengekisten er tom. Det var du som tømte den.'); return; }
      if (!P.kit.has('dyrkar')) bane++;
    }
    P.rollPush('Fingerfärdighet', { important: true, label: 'Fingerfärdighet', boon, bane, noArmed: true }, r => {
      const seen = ws.length > 0 && !r.success;
      if (r.success) {
        this.visit.stolen.add(what);
        P.floorStats.chests = (P.floorStats.chests || 0) + 1;
        let txt;
        if (what === 'strongbox') {
          G.run.strongbox = true;
          const n = 30 + rollDice('D6') * 5;
          P.silver += n;
          G.run.silver += n;
          G.world.spawnPickup('item', P.pos.x, P.pos.z + 0.7, { item: makeItem(Math.max(2, G.run.nextDepth || 1), { rarity: 'sjelden' }) });
          txt = `Låsen gir etter. Hvass har ${n} silver og noe annet fint i kisten. Hadde.`;
        } else if (what === 'bowl') {
          const n = 5 + rollDice('D6');
          P.silver += n;
          txt = `${n} silver fra Utus skål. Solskiven over alteret ser på deg. Eller gjør den ikke det?`;
          G.run.utuAngry = true;
        } else if (what === 'shelf') {
          if (Math.random() < 0.5) { G.world.spawnPickup('potion', P.pos.x, P.pos.z + 0.6); txt = 'En legedrikk fra hylla. Ingen så det.'; }
          else { G.world.spawnPickup('item', P.pos.x, P.pos.z + 0.6, { item: makeItem(Math.max(1, G.run.nextDepth || 1)) }); txt = 'Noe fra hylla. Ingen så det.'; }
          if (P.isNebb) txt += ' Far kommer til å telle varene i morgen.';
        } else {
          const n = 2 + rollDice('D6');
          P.silver += n;
          if (what !== 'stall_spice') G.world.spawnPickup('bread', P.pos.x, P.pos.z + 0.6);
          txt = what === 'stall_spice' ? `En pung med ${n} silver under kanelen. Gaspard teller dem aldri.` : `Et brød og ${n} silver fra boden.`;
        }
        G.ui.logRoll(r, `<b class="c-mark">Tyveri:</b> ${txt}`);
        G.audio.coin();
      } else if (seen || r.demon) {
        G.ui.logRoll(r, ws.length ? `${G.meta.met?.[ws[0].id] ? ws[0].def.name : cap(ws[0].def.short)} ser deg. "Tyv! Vakt!"` : 'En vakt kommer rundt hjørnet akkurat da.');
        this.caught(what === 'bowl' ? 2 : 1);
      } else {
        G.ui.logRoll(r, 'Du får ikke løs noe uten at det bråker. Du lar det være.');
      }
    });
  }

  caught(sev = 1) {
    const P = G.player;
    const run = G.run;
    run.offenses = (run.offenses || 0) + 1;
    run.rykte = (run.rykte || 0) - 2 * sev;
    const guard = this.npcs.filter(n => n.def.model.weapon && !n.hidden).sort((a, b) => Math.hypot(a.pos.x - P.pos.x, a.pos.z - P.pos.z) - Math.hypot(b.pos.x - P.pos.x, b.pos.z - P.pos.z))[0] || this.npcs.find(n => n.id === 'folkard');
    // vakta kommer løpende
    const a = Math.random() * Math.PI * 2;
    for (let k = 0; k < 8; k++) {
      const x = P.pos.x + Math.cos(a + k) * 1.3, z = P.pos.z + Math.sin(a + k) * 1.3;
      if (this.town.walkOpen(Math.floor(x / T), Math.floor(z / T))) { guard.pos.set(x, 0, z); break; }
    }
    guard.hidden = false;
    guard.mode = 'idle';
    guard.root.rotation.set(0, 0, 0);
    guard.body.rotation.set(0, 0, 0);
    guard.body.position.y = 0;
    const fine = 10 * run.offenses * sev;
    const def = {
      ...guard.def,
      forced: true,
      greet: () => `Tyv! I Fristaden betaler tyver. ${fine} silver i bot, eller en natt i vaktstua. Velg.`,
      topics: {
        BETALE: { act: 'payFine', always: true },
        VAKTSTUA: { act: 'jail', always: true },
        FARVEL: 'Du går ingen steder før du har valgt.',
      },
    };
    const fake = { def, talking: false, pos: guard.pos };
    guard.talking = true;
    this.fineAmount = fine;
    this.fineGuard = guard;
    this.talk.open(fake);
    this.talk.closing = false;
    // overstyr tjenestene for boten
    const orig = this.service.bind(this);
    this.service = (act, talk, npc) => {
      if (act === 'payFine') {
        if (P.silver >= fine) {
          P.silver -= fine;
          G.audio.coin();
          talk.say('Betalt. Hold fingrene i lommene dine, og bare dine.');
          this.service = orig;
          guard.talking = false;
          setTimeout(() => talk.close(true), 900);
        } else talk.say(`Du har ikke ${fine} silver. Da blir det vaktstua.`);
      } else if (act === 'jail') {
        this.service = orig;
        guard.talking = false;
        G.game.wipe(() => {
          const c = G.run.clock;
          let t = Math.floor(c / 24) * 24 + 7;
          if (t <= c + 0.5) t += 24;
          G.run.clock = t;
          talk.close(true);
          P.pos.set(U(21.6), 0, U(39.5));
          P.vel.set(0, 0, 0);
          this.visit.once.clear();
          this.visit.stolen.clear();
          this.snapAll();
          G.ui.log('En natt i vaktstua på en hard benk. Klokka er sju, og du er fri. Rykte er ikke det samme som før.');
        });
      } else orig(act, talk, npc);
    };
  }

  dispose() {
    for (const n of this.npcs) n.dispose();
    if (G.talk === this.talk) G.talk = null;
  }
}

function cap(s) { return s ? s[0].toUpperCase() + s.slice(1) : s; }
function $hide() { const el = document.querySelector('#dlg-wares'); if (el) el.hidden = true; }
void hash2;
