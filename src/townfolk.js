// Byfolk med døgnrytme (som i Ultima V), tjenester, tyveri og oppdrag i Fristaden.
import * as THREE from 'three';
import { G, T } from './state.js';
import { buildCharacter, buildWeaponMesh, HOLD } from './kinmodels.js';
import { makeOutline, buildChest, hash2 } from './assets.js';
import { weaponItem, makeItem, RARITY, refinalize, questAmulet } from './loot.js';
import { rollDice, d, clRoll } from './rules.js';
import { SPELLS, SKILL, HJALTEFORMAGOR, ATTR_NAME } from './dod.js';
import { SPOTS } from './townmap.js';
import { PEOPLE, BOARD, RUMORS } from './townpeople.js';
import { Talk } from './talk.js';
import { giveItem, makeCons, renderSellList } from './inventory.js';

const U = v => v * T;
const tmp = new THREE.Vector3();

// Penger er silvermynt (sm) som i DoD91, der en dolk koster 70 sm. De faste prisene i byen står i de
// gamle tallene og ganges med PRIS i price(). Våpen, rustning og lärare er allerede i sm.
const PRIS = 10;
// Byfolk har PSY 11 når de skal merke et tyveri (uv).
const NPC_PSY = 11;
// Gynervas FV i alle tre magiskoler (uv). Läraren må ha minst 17 og mer enn 3 over eleven (Bok I s. 63).
const GYNERVA_FV = 19;

export const QUEST_TITLES = {
  rotter: 'Rotteplagen: drep ti rotter i kloakken og gå til Edegar.',
  dode: 'De dødes fred: gi seks skjeletter fred og gå til Syster Jehanne.',
  runer: 'Runesteinen: les runesteinen i dvergehallene og gå til Bataar.',
  ivan: 'Triangeldrama i Edelfara: finn ut hvem som drepte Riddar Kettil, og rapporter til Pharynx.',
};

export function hourOf(clock) { return ((clock % 24) + 24) % 24; }
export function isNight(h) { return h >= 21 || h < 5.5; }
function openAt(hours, h) {
  if (!hours) return true;
  const [a, b] = hours;
  return (h >= a && h < b) || (b > 24 && h < b - 24);
}

// --- en person ---------------------------------------------------------------------------
export class NPC {
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
      const p = this.life.spots[this.def.patrol[this.patrolI % this.def.patrol.length]];
      return { x: U(p.x), z: U(p.y), yaw: 0, spot: p };
    }
    const p = this.life.spots[name];
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
      const spot = this.spotName === 'patrol' ? null : this.life.spots[this.spotName];
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
    const spot = this.life.spots[this.spotName];
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
  // people: folk i andre områder (arealife.js). Standard er folket i Fristaden.
  constructor(town, W, people = PEOPLE) {
    this.town = town;
    this.W = W;
    this.spots = town.spots || SPOTS;
    const run = G.run;
    run.quests = run.quests || {};
    run.rykte = run.rykte || 0;
    this.visit = { barter: {}, stolen: new Set(), once: new Set(), fished: 0, rumor: Math.floor(Math.random() * RUMORS.length) };
    this.talk = new Talk(this);
    G.talk = this.talk;
    this.npcs = people.map(def => new NPC(def, this));
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
    // Nordporten: ut til Edelfara (reisekartet). Stengt om natta.
    this.gateIt = this.add(U(18.5), U(4.6), 1.2, 'Gå ut gjennom Nordporten', () => {
      const hh = this.hour;
      if (hh >= 22 || hh < 5) { G.ui.log('Nordporten er stengt om natta. Folkard åpner når det lysner, rundt klokka fem.'); G.fx.float('Stengt', G.player.pos, 'miss'); return; }
      G.game.openTravel('fristaden');
    });
    this.add(T0.board.x, T0.board.z, 0.6, 'Les oppslagstavla', () => this.talk.open(BOARD));
    this.add(T0.memorial.x, T0.memorial.z, 0.5, 'Les minnesteinen', () => this.readMemorial());
    this.add(T0.sundial.x, T0.sundial.z, 0.75, 'Se på soluret', () => this.readSundial());
    this.add(T0.well.x + 1.25, T0.well.z + 0.4, 0.4, 'Drikk av brønnen', () => this.drinkWell());
    this.add(U(32.5), U(16.5), 0.7, 'Fiske fra brygga (Överlevnad)', () => this.fish());
    this.add(U(7.0), U(10.5), 0.6, 'Opptre på scenen', () => this.perform(), { stage: true });
    this.add(U(15.25), U(39.55), 0.6, G.player.isNebb ? 'Sov i den gamle senga di' : 'En seng som lukter and', () => this.nebbBed());
    // offerskål i tempelet
    const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.2, 0.18, 14), new THREE.MeshStandardMaterial({ color: 0xd8a840, roughness: 0.25, metalness: 1, emissive: 0x6a4a10, emissiveIntensity: 0.4 }));
    bowl.position.set(U(23.9), 0.95, U(12.6));
    const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.2, 0.86, 8), bowl.material);
    stand.position.set(U(23.9), 0.43, U(12.6));
    T0.group.add(bowl, stand);
    T0.addBlock(U(23.9) - 0.22, U(12.6) - 0.22, U(23.9) + 0.22, U(12.6) + 0.22);
    this.add(U(23.9), U(12.6), 0.35, 'Gi en gave til Utu (50 sm)', () => this.offering(), { steal: 'bowl', normal: 'Gi en gave til Utu (50 sm)' });
    // pengekiste hos Hvass
    const chest = buildChest();
    chest.position.set(U(40.85), 0, U(35.6));
    chest.rotation.y = -Math.PI / 2;
    chest.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    T0.group.add(chest);
    T0.addBlock(U(40.85) - 0.38, U(35.6) - 0.58, U(40.85) + 0.38, U(35.6) + 0.58);
    this.chestMesh = chest;
    this.add(U(40.5), U(35.6), 0.6, null, () => this.steal('strongbox'), { steal: 'strongbox', sneakLabel: 'Dyrk opp pengekisten (Låsdyrkning)' });
    // boder og hylla i butikken: bare når du sniker
    for (const s of T0.stalls) {
      const owner = { spice: 'gaspard', fish: 'regin', veg: 'edegar' }[s.id];
      this.add(U(s.x), U(s.z) + s.face * 1.05, 0.7, null, () => this.steal('stall_' + s.id), { steal: 'stall_' + s.id, owner, sneakLabel: 'Snatt fra boden (Stjäla föremål)' });
    }
    this.add(U(6.2), U(17.0), 0.5, null, () => this.steal('shelf'), { steal: 'shelf', owner: 'nansen', sneakLabel: 'Snatt fra hylla (Stjäla föremål)' });
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
      if (it.steal === 'bowl') it.label = sneaking ? (this.visit.stolen.has('bowl') ? null : 'Snatt fra offerskåla (Stjäla föremål)') : it.normal;
      if (it.stage) it.label = h >= 17 || h < 2 ? `Opptre på scenen (${this.performSkill()})` : null;
    }
    const n = G.run.nextDepth || 1;
    if (this.grateIt) this.grateIt.label = n > 1 ? `Klatre ned i kloakken (tilbake til nivå ${n})` : 'Klatre ned i kloakken';
    if (this.gateIt) this.gateIt.label = h >= 22 || h < 5 ? 'Nordporten (stengt om natta)' : 'Gå ut gjennom Nordporten';
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

  // base står i de gamle tallene og ganges med PRIS. raw: base er allerede i sm (våpen, rustning, lärare).
  price(npcId, base, raw = false) {
    let m = 1;
    const ry = G.run.rykte || 0;
    if (ry <= -2) m *= 1.25;
    else if (ry >= 3) m *= 0.9;
    if (G.run.guild) m *= 0.9;
    const b = this.visit.barter[npcId];
    if (b === 'good') m *= 0.8;
    else if (b === 'great') m *= 0.6;
    else if (b === 'bad') m *= 1.25;
    if (G.player.flags?.has?.('discount')) m *= 0.8;
    const sm = raw ? base : base * PRIS;
    return sm === 0 ? 0 : Math.max(1, Math.round(sm * m));
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
      P.rollHero('Köpslå', { label: 'Köpslå' }, r => {
        let t;
        if (r.fummel) { this.visit.barter[npcId] = 'bad'; t = 'Prute? Med meg? Nå ble alt litt dyrere.'; }
        else if (r.perfekt) { this.visit.barter[npcId] = 'great'; t = 'Du er verre enn Hvass. Greit. Nesten halv pris.'; }
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
      talk.say('Fjær for kunnskap. Det er en god handel for deg og en dårlig handel for fjærene. Vil du heller være [elev] en uke, tar jeg silver.');
    } else if (act === 'teachWeek') {
      if (id === 'jehanne' && (G.run.rykte || 0) <= -3) { talk.say('Jeg lærer ikke tyver å slåss. De klarer seg godt nok fra før.'); return; }
      const refresh = () => {
        const rows = Object.entries(def.teach || {}).map(([sk, t]) => {
          const tt = typeof t === 'number' ? { fv: t } : t;
          // en stridskonst som bare et folk lærer bort: bare for dem, eller for den som allerede kan litt
          if (tt.kin && P.sheet.kin !== tt.kin && P.skills[sk] == null) return null;
          return this.weekRow(def, sk, tt.fv, 150);
        }).filter(Boolean);
        talk.wares(rows, { note: this.priceNote(id), refresh });
      };
      refresh();
      talk.say(def.teachSay || 'En uke, åtte timer om dagen. Det er sånn man lærer.');
    } else if (act === 'hero') {
      // Hjältepoäng brukes mellom slagene (Bok I s. 64, Expert s. 64-65, Gigant s. 8). Bare
      // förmågor spillet faktisk bruker, står på lista.
      const IMPL = ['jarnnave', 'kattfot', 'snabbfot', 'skarpogd', 'snabbslaende', 'orad', 'projektilparering', 'snabblakning'];
      const refresh = () => {
        const rows = ['STY', 'FYS', 'SMI', 'INT', 'PSY', 'KAR'].map(a => {
          const room = P.attrRoom(a);
          return { name: `${ATTR_NAME[a]} +1`, desc: `${a} ${P.sheet.attrs[a] + (P.attrUp[a] || 0)} blir ${P.sheet.attrs[a] + (P.attrUp[a] || 0) + 1}.${a === 'FYS' ? ' Gir flere KP.' : ''}`, price: 5, disabled: !room, label: room ? null : 'Rasens maks', buy: () => { P.raiseAttr(a); return 'Det sitter i kroppen nå. Ikke la det gå til hodet.'; } };
        });
        for (const id of IMPL) {
          const h = HJALTEFORMAGOR[id];
          const own = P.has(id);
          rows.push({ name: h.name, desc: `${h.text}${h.src ? ` (${h.src})` : ''}`, price: h.hp, disabled: own, label: own ? 'Har' : null, color: '#e8c06a', buy: () => { P.learnHeroic(id); return `${h.name}. Ordenen har en sang om det. Den er lang.`; } });
        }
        talk.wares(rows, { currency: 'hp', refresh, note: 'hjältepoäng fra store dåder' });
      };
      refresh();
      talk.say(P.hjp ? 'Store dåder setter spor. Hjältepoäng kan bli til styrke, eller til noe ingen kan ta fra deg.' : 'Du har ingen hjältepoäng ennå. Drep en demon, eller Rødpels. Så snakker vi.');
    } else if (act === 'innRoom') {
      const night = this.price(id, 6);
      talk.wares([
        { name: 'Et rom for natta', desc: 'Sov til klokka sju. En natt i senga gir litt tilbake: 1T3 KP og all PSY.', price: night, buy: () => { this.sleep('inn'); return 'Første dør til venstre i trappa. Ikke den andre, der bor Gaspard.'; } },
        { name: 'Vila en vecka', desc: 'Sju netter i rommet. Sårene gror, all PSY kommer tilbake, og erfarenheten setter seg: EP blir til FV. Bare en hel uke i ro gjør det.', price: night * 7, buy: () => { this.restWeek(); return 'En uke? Da får du rommet med vindu. Det andre vinduet, ikke det knuste.'; } },
      ], { note: this.priceNote(id) });
      talk.say(`${night} sm natta, sju netter for en uke. Frokost er ikke inkludert, men lukten av den er gratis.`);
    } else if (act === 'innMeal') {
      const refresh = () => talk.wares([
        { name: 'Svartsoppa', desc: 'Kokt på gåseblod, med kanel i stedet for galle. Helbreder 1T6+2 KP.', price: this.price(id, 3), buy: () => { const got = P.heal(d(6) + 2); fx('heal', 12); return got ? `Den smaker bedre enn den ser ut. +${got} KP.` : 'Du er mett, men du spiser opp likevel.'; } },
        { name: 'Brød og ost', desc: 'Helbreder 3 KP.', price: this.price(id, 2), buy: () => { const got = P.heal(3 + (P.mods?.breadHeal || 0)); return got ? `+${got} KP. Mester Flansen hadde godkjent.` : 'Du er allerede mett.'; } },
        { name: 'Gåsestek', desc: 'Husets stolthet. Helbreder 2T6 KP. Én gang per besøk.', price: this.price(id, 9), disabled: once('stek'), buy: () => { mark('stek'); const got = P.heal(rollDice('2D6')); fx('heal', 24); return `Den feite gåsen. Du forstår navnet nå.${got ? ` +${got} KP.` : ''}`; } },
      ], { note: this.priceNote(id), refresh, barter: this.barterFn(id, talk, () => refresh()) });
      refresh();
      talk.say('Vi har svartsoppa, brød og gåsestek. Svartsoppaen er tradisjon. Gåsesteken er grunnen til at folk kommer.');
    } else if (act === 'innAle') {
      const refresh = () => talk.wares([
        { name: 'Øl', desc: '+1 PSY og et rykte på kjøpet.', price: this.price(id, 1), buy: () => { P.gainPSY(1); return RUMORS[(this.visit.rumor++) % RUMORS.length]; } },
        { name: 'Mjød', desc: '+1T6 PSY, men du må klare et FYS-slag, ellers blir du full (-2 på CL en stund).', price: this.price(id, 3), buy: () => {
          const before = P.psy;
          P.gainPSY(d(6));
          const n = P.psy - before;
          const r = P.attrRoll('FYS', 10, { label: 'Mjød' });
          if (!r.success) P.fx.drunk = Math.max(P.fx.drunk || 0, 120);
          G.ui.logRoll(r, r.success ? 'Mjøden går rett i hodet, men du holder deg.' : 'Mjøden går rett i hodet. Du er full: -2 på CL en stund.');
          return r.success ? `+${n} PSY. Sterk saker.` : `+${n} PSY. Rommet snurrer litt.`;
        } },
      ], { note: this.priceNote(id), refresh });
      refresh();
      talk.say('Øl eller mjød? Øl er for prat. Mjød er for å glemme praten.');
    } else if (act === 'rumor') {
      talk.say(RUMORS[(this.visit.rumor++) % RUMORS.length]);
    } else if (act === 'heal') {
      // HELA lagt av Fader Cassian: 1T6 KP per effektgrad, og blødningen stopper (Bok III s. 16).
      // Presten lykkes alltid, og prisen er 40 sm per E (spillets tolkning, uv).
      const free = P.sheet.aidne === 7;
      const refresh = () => {
        const hurt = P.kp < P.maxKP || Object.keys(P.locMax || {}).some(l => P.loc[l] < P.locMax[l]);
        const bleeding = P.bleeding?.size > 0;
        const notes = ['', 'For skrubbsår og blåmerker.', 'For et ordentlig hugg.', 'For når noen har brukt deg som ambolt.', 'For det som nesten tok livet av deg.'];
        talk.wares([
          ...[1, 2, 3, 4].map(E => ({
            name: `HELA E${E}`, desc: `Cassian legger HELA på deg: ${E}T6 KP, og blødningen stopper. ${notes[E]}`,
            price: free ? 0 : this.price(id, 4 * E), disabled: !hurt && !bleeding, label: !hurt && !bleeding ? 'Hel' : null,
            buy: () => {
              const got = P.heal(rollDice(E + 'D6'));
              P.stopBleeding();
              fx('heal', 12 + E * 6);
              G.audio.heal();
              return got ? `Utus lys går gjennom deg. Sårene lukker seg. +${got} KP.` : 'Utus lys går gjennom deg. Det er varmt, nesten for varmt.';
            },
          })),
          { name: 'Stoppe blødningen', desc: 'Cassian binder sårene og ber en kort bønn. All blødning stopper. Ingen KP.', price: free ? 0 : this.price(id, 2), disabled: !bleeding, label: bleeding ? null : 'Blør ikke',
            buy: () => { P.stopBleeding(); fx('heal', 8); return 'Lin, eddik og en bønn til Utu. Det holder til du finner noe bedre.'; } },
        ], { note: free ? 'gratis for prästerskap' : this.priceNote(id), refresh });
      };
      refresh();
      talk.say(free ? 'For en av oss koster det ingenting. Utu har nok.' : 'Utu helbreder alle. Tempelet tar imot gaver. Det er ikke det samme, men det henger sammen. Velg hvor mye lys du trenger.');
    } else if (act === 'bless') {
      const free = P.sheet.aidne === 7;
      talk.wares([{ name: 'Utus velsignelse', desc: 'Neste nivå: sterkere lys rundt deg og -2 på Skräcktabellen. Én gang per besøk.', price: free ? 0 : this.price(id, 12), disabled: once('bless') || G.run.blessing, label: once('bless') || G.run.blessing ? 'Velsignet' : null, buy: () => { mark('bless'); G.run.blessing = true; fx('gold', 24); G.audio.drake?.(); return 'Måtte Utu se deg, også der solen ikke når.'; } }], { note: free ? 'gratis for prästerskap' : this.priceNote(id) });
      talk.say('Velsignelsen varer ett nivå. Lenger enn det kan ingen be om lys under jorda.');
    } else if (act === 'oathHeal') {
      // Munkeløftet: Jehanne legger HELA E1 på deg gratis, én gang om dagen (uv)
      if ((G.run.rykte || 0) <= -3) { talk.say('Jeg helbreder de syke, ikke tyver. Gå til tempelet, kanskje Utu er mer tilgivende.'); return; }
      if (once('oath')) { talk.say('Jeg har gjort det jeg kan for deg i dag. Kom tilbake i morgen.'); return; }
      mark('oath');
      const bled = P.bleeding?.size > 0;
      const got = P.heal(d(6));
      P.stopBleeding();
      fx('heal', 20);
      G.audio.heal();
      talk.say(`Munkeløftet sier at jeg skal helbrede de syke. Det koster ingenting. Hold stille. HELA. ${got ? `+${got} KP.` : 'Du var nesten hel fra før.'}${bled ? ' Blødningen stopper.' : ''}`);
    } else if (act === 'smithShop') {
      if (!this.visit.smith) {
        const depth = Math.max(1, Math.min(5, G.run.nextDepth || 1));
        // våpen du har som yrkesfärdighet dukker oftere opp
        const pref = (P.sheet.yrke || []).filter(s => SKILL[s]?.type === 'vap');
        this.visit.smith = [
          makeItem(depth + 1, { slot: 'vapen', prefer: pref, noUnique: true }),
          makeItem(depth + 1, { slot: 'vapen', prefer: pref, noUnique: true, rarity: 'magisk' }),
          makeItem(depth, { slot: 'vapen', noUnique: true }),
          makeItem(depth + 1, { slot: 'rustning', noUnique: true }),
          makeItem(depth + 1, { slot: 'hjalm', noUnique: true }),
        ].map(it => ({ it, sold: false }));
      }
      const refresh = () => talk.wares(this.visit.smith.map(s => ({
        // item.value er allerede i sm. Smeden legger på 80 sm.
        name: s.it.name, color: RARITY[s.it.rarity].color, desc: s.it.lines.join(', '), price: this.price(id, s.it.value + 80, true), disabled: s.sold, label: s.sold ? 'Solgt' : null,
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
      // ødelagt (BV 0) eller slitt (BV under det nye)
      const worn = it => it && (it.broken || (it.durMax != null && it.dur < it.durMax));
      const items = Object.values(P.equip).filter(worn);
      if (!items.length) { talk.say('Det er ingenting trasig på deg. Ikke ennå.'); return; }
      const refresh = () => talk.wares(items.map(it => ({ name: it.name, desc: it.durMax != null ? `Reparer. BV ${it.broken ? 0 : it.dur} av ${it.durMax}.` : 'Reparer', price: this.price(id, 5), disabled: !worn(it), label: worn(it) ? null : 'Hel', buy: () => { it.broken = false; if (it.durMax != null) it.dur = it.durMax; refinalize(it); P.recalc?.(); P.refreshWeaponMeshes?.(); return 'Sånn. Som nytt. Bedre enn nytt, faktisk.'; } })), { note: this.priceNote(id), refresh });
      refresh();
      talk.say('Vis meg hva du har ødelagt.');
    } else if (act === 'sharpen') {
      talk.wares([{ name: 'Slipe våpenet', desc: 'Neste nivå: fiendens rustning absorberer 1 mindre mot deg.', price: this.price(id, 8), disabled: G.run.sharpen, label: G.run.sharpen ? 'Slipt' : null, buy: () => { G.run.sharpen = true; G.fx.burst('spark', P.pos, 14); return 'Eggen biter nå. Den holder ett nivå, så må du komme tilbake.'; } }], { note: this.priceNote(id) });
      talk.say('Et slipt våpen er et lykkelig våpen.');
    } else if (act === 'teach') {
      // DoD91 har ingen trolleritrick. Bare magiker og utbygdsjägare kan lære magi (Bok III s. 3).
      const hunter = P.sheet.ability === 'animistjagare';
      const school = P.sheet.school || (hunter ? 'Animism' : null);
      if (!school) { talk.say('Du har ingen gnist. Ikke en gang en liten en. Men jeg selger [trolldrikk], hvis det er noen trøst.'); return; }
      const refresh = () => {
        const fv = P.skills[school] || 0;
        // ny besvärjelse: S = halve FV i skolen, minst 3 (uv). Utbygdsjägare: bare skolvärde 12 eller lavere (Bok I s. 22).
        const S = Math.max(3, Math.floor(fv / 2));
        const maxSv = hunter ? 12 : 99;
        const fresh = Object.keys(SPELLS)
          .filter(k => (SPELLS[k].school === school || SPELLS[k].school === 'Allmän') && P.spells[k] == null && SPELLS[k].sv <= maxSv)
          .sort((a, b) => SPELLS[a].sv - SPELLS[b].sv);
        const order = P.spellOrder || Object.keys(P.spells);
        const ready = order.slice(0, 3);
        const unready = Object.keys(P.spells).filter(k => SPELLS[k] && !ready.includes(k));
        const rows = [
          // EP i en magiskole kommer bare fra träning med lärare (Bok III s. 7). Magiker tar 300 sm uka.
          this.weekRow(def, school, GYNERVA_FV, 300),
          ...fresh.map(k => {
            const sp = SPELLS[k];
            const ok = sp.sv <= fv;
            // pris: 100 sm per skolvärde (uv)
            return {
              name: `Besvärjelse: ${sp.name}`, desc: `${sp.school}, skolvärde ${sp.sv}. ${sp.text} ${ok ? `Du lærer den med S ${S}.` : `Krever ${school} ${sp.sv}, du har ${fv}.`}`,
              price: this.price(id, 10 * sp.sv), disabled: !ok, label: ok ? null : `Skolvärde ${sp.sv}`,
              buy: () => { P.learnSpell(k, S); this.prepare(k); return `${sp.name} er din, S ${S}. Den ligger først, så den er klar på R.`; },
            };
          }),
          ...unready.map(k => ({ name: `Forbered: ${SPELLS[k].name}`, desc: `S ${P.spells[k]}. Legg den på R. Bare tre ligger klare om gangen, på R, G og T.`, price: 0, label: 'Forbered', buy: () => { this.prepare(k); return `${SPELLS[k].name} er forberedt.`; } })),
        ];
        talk.wares(rows, { note: this.priceNote(id), refresh });
      };
      refresh();
      talk.say(`${school}. Det kan jeg. Velg, og betal, og ikke stå så nær kula.`);
    } else if (act === 'potionShop') {
      const refresh = () => talk.wares([
        { name: 'Trolldrikk', desc: 'All PSY tilbake. Drikkes nå hvis du mangler PSY, ellers i sekken.', price: this.price(id, 10), buy: () => { if (P.psy < P.maxPSY) { P.gainPSY(P.maxPSY); fx('will', 20); } else giveItem(makeCons('trolldrikk')); return 'Den smaker fiolett. Det er normalt.'; } },
        { name: 'Legedrikk', desc: 'Helbreder 2T6 KP. Går i beltet, eller i sekken når beltet er fullt.', price: this.price(id, 16), buy: () => { giveItem(makeCons('legedrikk')); return 'For når det går galt. Det går alltid galt.'; } },
      ], { note: this.priceNote(id), refresh, barter: this.barterFn(id, talk, () => refresh()) });
      refresh();
      talk.say('Trolldrikk for hodet, legedrikk for kroppen. Ingen av dem for sjelen.');
    } else if (act === 'spiceShop') {
      const refresh = () => talk.wares([
        { name: 'Gåseleverpølse', desc: 'Helbreder 4 KP. Spises nå hvis du er skadet, ellers i sekken.', price: this.price(id, 3), buy: () => { if (P.kp < P.maxKP) { const got = P.heal(4); return `+${got} KP. Du føler deg litt adelig.`; } giveItem(makeCons('polse')); return 'Til senere. Den holder seg. Det er det beste man kan si om den.'; } },
        { name: 'Kanelbolle', desc: 'Helbreder 2 KP og gir 1 PSY. Spises nå eller går i sekken.', price: this.price(id, 2), buy: () => { if (P.kp < P.maxKP || P.psy < P.maxPSY) { P.heal(2); P.gainPSY(1); return 'Kanel. Shamash ville ha grått.'; } giveItem(makeCons('kanel')); return 'Pakket inn i papir. Ikke sett deg på den.'; } },
        { name: 'Legedrikk', desc: 'Helbreder 2T6 KP. Beltet først, så sekken.', price: this.price(id, 15), buy: () => { giveItem(makeCons('legedrikk')); return 'Fra Ekeborg. Nesten ekte.'; } },
        { name: 'Nesten ekte safran', desc: 'Gul. Det er det meste man kan si om den. Gaspard blunker.', price: this.price(id, 20), disabled: once('fake'), buy: () => { mark('fake'); G.run.fakeSaffron = true; giveItem(makeCons('safran')); return 'Ikke vis den til Hvass. Eller vis den til Hvass, og løp.'; } },
      ], { note: this.priceNote(id), refresh, barter: this.barterFn(id, talk, () => refresh()) });
      refresh();
      talk.say('Smak, min venn, smak! Det er det eneste livet ikke kan ta fra deg. Bortsett fra alt det andre.');
    } else if (act === 'alms') {
      const free = P.sheet.aidne === 1;
      if (once('alms')) { talk.say('Jeg har sagt det jeg vet. Rottene har ikke sagt noe nytt siden.'); return; }
      talk.wares([{ name: 'En almisse', desc: 'Tobolt forteller hvor ting er gjemt på neste nivå (gjemmesteder vises på kartet).', price: free ? 0 : 50, buy: () => {
        mark('alms');
        G.run.cacheHint = (G.run.cacheHint || 0) + 2;
        if (!G.run.almsGiven) { G.run.almsGiven = true; G.run.rykte = (G.run.rykte || 0) + 1; }
        return 'Takk, takk. Hør her: der nede er det steiner som sitter løst, og bak dem ligger det ting. Rottene viste meg. Se etter dem på kartet ditt.';
      } }], { note: free ? 'gratis for en gammel venn' : '' });
      talk.say(free ? 'For deg er det gratis, gamle venn. Bare si ordet.' : 'Femti silver. Kongen må spise, selv om riket er lite.');
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
      // Hvert av de tre oppdragene gir 1 hjältepoäng i tillegg til belønningen (uv)
      const it = questAmulet('martyr');
      giveItem(it);
      G.run.rykte = (G.run.rykte || 0) + 1;
      G.ui.log(`<b class="c-mark">Oppdrag fullført:</b> De dødes fred. Du får ${it.name}.`);
      P.addHjp(1, 'De dødes fred');
      G.audio.drake?.();
    } else if (act === 'rewardRats') {
      P.silver += 200;
      P.heal(2);
      G.run.rykte = (G.run.rykte || 0) + 1;
      G.audio.coin();
      G.ui.log('<b class="c-mark">Oppdrag fullført:</b> Rotteplagen. +200 silver og et kålhode (+2 KP).');
      P.addHjp(1, 'Rotteplagen');
    } else if (act === 'rewardRunes') {
      const w = P.equip.vapen;
      G.run.rykte = (G.run.rykte || 0) + 1;
      if (w && w.kind !== 'fist') {
        w.mods = w.mods || {};
        if (!w.mods.master) { w.mods.master = 1; w.name = 'Bataars ' + w.name.replace(/^Bataars /, ''); }
        else w.mods.dmg = (w.mods.dmg || 0) + 1;
        refinalize(w);
        P.recalc?.();
        G.ui.log(`<b class="c-mark">Oppdrag fullført:</b> Runesteinen. ${w.name} er et mesterverk nå.`);
      } else {
        P.silver += 300;
        G.ui.log('<b class="c-mark">Oppdrag fullført:</b> Runesteinen. Du har ikke noe våpen, så Bataar betaler 300 silver.');
      }
      P.addHjp(1, 'Runesteinen');
      G.audio.drake?.();
    }
  }

  // En rad for "en ukes trening" med lärare (Bok I s. 63). base: 150 sm, eller 300 sm hos en magiker.
  // Läraren må ha mer enn 3 over elevens FV, og ingen kan trenes over grundegenskapen.
  // Annen ras enn läraren: x1,5. "Ensam elev" (x3) brukes ikke, ellers blir det for dyrt (uv).
  weekRow(def, sk, tfv, base) {
    const P = G.player;
    const attr = SKILL[sk]?.attr || 'INT';
    const fv = P.baseSkills?.[sk] ?? P.skills[sk] ?? 0;
    const cap = P.attrs[attr] ?? 0;
    const kin = def.model?.duck ? 'anka' : def.model?.kin;
    const mul = kin && kin !== P.sheet.kin ? 1.5 : 1;
    let label = null;
    if (fv >= tfv - 3) label = 'Lært nok';
    else if (fv >= cap) label = `Tak: ${attr} ${cap}`;
    const ep = P.exp?.[sk] || 0;
    return {
      name: `En ukes trening: ${sk}`,
      desc: `FV ${fv}${ep ? `, ${ep} EP spart` : ''}. Sju dager, to ${attr}-slag. Hvert lyckat gir 1 EP.${mul > 1 ? ' Dyrere fordi dere er av ulike folk.' : ''}`,
      price: this.price(def.id, Math.round(base * mul), true), disabled: !!label, label,
      buy: () => { this.trainWeek(def, sk, tfv); return def.teachText || 'Sju dager. Det gjør vondt, og så setter det seg.'; },
    };
  }

  // To normale grundegenskapsslag. Hver FV over 18 hos läraren gjør slaget 1 lettere (Bok I s. 63).
  trainWeek(def, sk, tfv) {
    const P = G.player;
    const attr = SKILL[sk]?.attr || 'INT';
    const sg = 10 - Math.max(0, tfv - 18);
    this.passTime(7, () => {
      let n = 0;
      for (let i = 0; i < 2; i++) {
        const r = P.attrRoll(attr, sg, { label: sk });
        if (r.success) n++;
        G.ui.logRoll(r, r.success ? `${sk}: det satt seg. 1 EP.` : `${sk}: ingenting satt seg denne gangen.`);
      }
      if (n) P.addExp(sk, n);
      G.ui.log(`<b class="c-mark">En uke hos ${def.name}.</b> ${n ? `+${n} EP i ${sk}.` : 'Ingen EP denne uka.'} EP blir til FV når du hviler en uke på Den feite gåsen.`);
      G.ui.log('Klokka er sju. Det har gått en uke i Fristaden.');
    });
  }

  // Legg en besvärjelse først i P.spellOrder, så den ligger på R
  prepare(k) {
    const P = G.player;
    const o = P.spellOrder || (P.spellOrder = Object.keys(P.spells));
    const i = o.indexOf(k);
    if (i >= 0) o.splice(i, 1);
    o.unshift(k);
    G.ui.buildBar();
  }

  // --- ting du kan gjøre i byen ---------------------------------------------------------------
  // Tiden går fram til klokka sju om morgenen. days = 1 er i morgen tidlig, 7 er en uke.
  // Hver natt er søvn: P.onSleep nullstiller det som gjelder "etter søvn" (første lyckade slag gir EP osv.).
  passTime(days, after) {
    const P = G.player;
    G.game.wipe(() => {
      const c = G.run.clock;
      let t = Math.floor(c / 24) * 24 + 7;
      if (t <= c + 0.5) t += 24;
      G.run.clock = t + 24 * (days - 1);
      P.onSleep?.();
      this.talk.close(true);
      this.visit.once.clear();
      this.visit.barter = {};
      this.visit.stolen.clear();
      this.visit.smith = null;
      this.visit.fished = 0;
      this.snapAll();
      after?.();
    });
  }

  sleep(where) {
    const P = G.player;
    this.passTime(1, () => {
      // en natt i senga gir litt tilbake, ikke alt (DoD91: KP gror sakte, PSY kommer tilbake med hvile)
      const got = P.heal(d(3));
      P.gainPSY(P.maxPSY);
      G.fx.burst('heal', P.pos, 24);
      G.audio.heal();
      const back = `En natt i senga gir litt tilbake: ${got ? `+${got} KP og ` : ''}all PSY.`;
      G.ui.log(where === 'home' ? `Du sover i den gamle senga di. Far snorker i rommet ved siden av. ${back}` : `Du sover på Den feite gåsen. Gaspard snorker gjennom veggen. ${back}`);
      G.ui.log('Klokka er sju. En ny dag i Fristaden.');
    });
  }

  // Vila en vecka: sju netter på vertshuset. Her, og bare her, blir EP til FV (Bok I s. 63).
  restWeek() {
    const P = G.player;
    this.passTime(7, () => {
      const txt = P.restWeek();
      G.fx.burst('heal', P.pos, 30);
      G.audio.heal();
      G.ui.log('<b class="c-mark">En uke på Den feite gåsen.</b> Sårene gror, PSY er tilbake, og spart EP er blitt til FV.');
      G.ui.log('Klokka er sju. Det har gått en uke i Fristaden.');
      // det som ble bedre, i et eget vindu så det ikke forsvinner i loggen
      this.talk.open({
        id: 'restweek', name: 'En uke senere', title: 'Den feite gåsen', board: true, start: [], topics: {},
        greet: () => 'Du har sovet, spist og sett på regnet i sju dager. ' + String(txt || 'Ingenting nytt satt seg denne gangen.').replace(/<[^>]+>/g, ''),
      });
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
      const r = P.roll('Historia', { label: 'Historia' });
      if (r.success) { P.gainPSY(2); G.ui.logRoll(r, 'Du kjenner historiene bak navnene. Det gir mot. +2 PSY.'); }
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
    P.gainPSY(1);
    G.audio.splash?.();
    G.ui.log('Brønnvannet er kaldt og smaker jern. +1 PSY.');
  }

  fish() {
    const P = G.player;
    if (this.visit.fished >= 3) { G.ui.log('Fisken har skjønt hva du driver med. Prøv igjen en annen dag.'); return; }
    this.visit.fished++;
    G.run.clock += 0.33;
    // Torpare (Aidne) og morgen eller kveld: +3 hver (uv)
    let mod = P.sheet.aidne === 3 ? 3 : 0;
    const h = this.hour;
    if (h < 8 || (h > 17 && h < 21)) mod += 3;
    const done = r => {
      if (r.perfekt) {
        const it = makeItem(Math.max(1, G.run.nextDepth || 1), { slot: 'amulett', rarity: 'magisk' });
        G.ui.logRoll(r, `En stor gjedde! Inni den ligger ${it.name}. Det skjer oftere i viser enn i virkeligheten.`);
        G.world.spawnPickup('item', P.pos.x, P.pos.z + 0.6, { item: it });
        P.heal(d(6));
      } else if (r.success) {
        const got = P.heal(d(6));
        G.ui.logRoll(r, `Du får en abbor og steker den over Tobolts bål. ${got ? `+${got} KP.` : 'Du er mett, men den var god.'}`);
      } else if (r.fummel) {
        this.visit.fished = 3;
        G.ui.logRoll(r, 'Snøret setter seg fast, og du faller nesten i elva. Du blir våt og sur, og fisken er skremt for i dag.');
      } else G.ui.logRoll(r, 'Ingenting biter. Elva ser på deg.');
    };
    // Uten Överlevnad: et svårt INT-slag, så alle kan prøve lykken (uv)
    if ((P.skills['Överlevnad'] || 0) > 0) P.rollHero('Överlevnad', { label: 'Fiske', mod }, done);
    else done(P.attrRoll('INT', 15 - mod, { label: 'Fiske' }));
  }

  // Opptreden: det beste av Sjunga og Spela instrument. Spela instrument trenger lyra eller fløyte.
  performSkill() {
    const P = G.player;
    const instr = P.kit?.has?.('lyra') || P.kit?.has?.('flojt');
    const sing = P.skills['Sjunga'] || 0, play = instr ? P.skills['Spela instrument'] || 0 : 0;
    return play > sing ? 'Spela instrument' : 'Sjunga';
  }

  perform(talk) {
    const P = G.player;
    const h = this.hour;
    const say = t => (talk ? talk.say(t) : G.ui.log(t));
    if (!(h >= 17 || h < 2)) { say('Det er ingen publikum før kvelden. Kom tilbake når folk har fått i seg litt øl.'); return; }
    if (this.visit.once.has('perform')) { say('Du har opptrådt i kveld. To ganger blir for mye for alle.'); return; }
    this.visit.once.add('perform');
    const sk = this.performSkill();
    P.rollHero(sk, { label: sk }, r => {
      if (r.perfekt) {
        const n = rollDice('D6') * 60;
        P.silver += n;
        G.run.rykte = (G.run.rykte || 0) + 1;
        G.ui.logRoll(r, `Hele vertshuset synger med. Noen gråter. +${n} silver.`);
        G.fx.burst('gold', P.pos, 20);
      } else if (r.success) {
        const n = rollDice('D6') * 20;
        P.silver += n;
        G.ui.logRoll(r, `Folk klapper, og noen slenger mynter. +${n} silver.`);
        G.audio.coin();
      } else if (r.fummel) {
        G.run.rykte = (G.run.rykte || 0) - 1;
        G.ui.logRoll(r, 'Noen kaster en kålrot. Den treffer. Edegar vil ha den tilbake.');
      } else G.ui.logRoll(r, 'Ingen klapper. Ingen kaster noe heller. Det er nesten verre.');
      if (talk) talk.renderKeywords();
    });
  }

  offering() {
    const P = G.player;
    if (this.visit.once.has('offer')) { G.ui.log('Du har gitt til Utu i dag. Han ser deg.'); return; }
    if (P.silver < 50) { G.ui.log('Du har ikke femti silver. Utu forstår. Tempelet forstår mindre.'); return; }
    P.silver -= 50;
    this.visit.once.add('offer');
    P.gainPSY(2);
    if (!G.run.offered) { G.run.offered = true; G.run.rykte = (G.run.rykte || 0) + 1; }
    G.fx.burst('gold', P.pos, 16);
    G.audio.coin();
    G.ui.log('Du legger femti silver i skåla. Solskiven over alteret glimter. +2 PSY.');
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

  // Hvem merker tyveriet? Tabellen for Stjäla föremål (Bok I s. 44): perfekt kan ikke oppdages,
  // lyckat bare på et perfekt PSY-slag, misslyckat på et normalt PSY-slag, fummel alltid.
  // Samme tabell for pengekisten (uv). Gir personen som så deg, 'vakt' hvis ingen sto der, eller null.
  spotted(r, ws) {
    if (r.perfekt) return null;
    if (r.fummel) return ws[0] || 'vakt';
    for (const n of ws) {
      const p = clRoll(NPC_PSY, NPC_PSY);
      if (r.success ? p.perfekt : p.success) return n;
    }
    return null;
  }

  steal(what) {
    const P = G.player;
    if (this.visit.stolen.has(what)) return;
    const h = this.hour;
    const night = isNight(h);
    const ws = this.witnesses(P.pos);
    const lock = what === 'strongbox';
    // Utu ser ikke om natta: +3 uten vitner om natta, -3 med vitner i dagslys (uv)
    let mod = 0;
    if (night && !ws.length) mod += 3;
    if (!night && ws.length) mod -= 3;
    if (lock) {
      if (G.run.strongbox) { G.ui.log('Pengekisten er tom. Det var du som tømte den.'); return; }
      // uten dyrkar: halv chans (Bok I s. 52)
      if (!P.kit?.has?.('dyrkar')) mod -= Math.ceil((P.skills['Låsdyrkning'] || 0) / 2);
    }
    const sk = lock ? 'Låsdyrkning' : 'Stjäla föremål';
    P.rollHero(sk, { label: sk, mod }, r => {
      const seen = this.spotted(r, ws);
      if (r.success) {
        this.visit.stolen.add(what);
        if (P.floorStats) P.floorStats.chests = (P.floorStats.chests || 0) + 1;
        let txt;
        if (lock) {
          G.run.strongbox = true;
          const n = 300 + rollDice('D6') * 50;
          P.silver += n;
          G.run.silver = (G.run.silver || 0) + n;
          G.world.spawnPickup('item', P.pos.x, P.pos.z + 0.7, { item: makeItem(Math.max(2, G.run.nextDepth || 1), { rarity: 'sjelden' }) });
          txt = `Låsen gir etter. Hvass har ${n} silver og noe annet fint i kisten. Hadde.`;
        } else if (what === 'bowl') {
          const n = 50 + rollDice('D6') * 10;
          P.silver += n;
          txt = `${n} silver fra Utus skål. Solskiven over alteret ser på deg. Eller gjør den ikke det?`;
          G.run.utuAngry = true;
        } else if (what === 'shelf') {
          const nobody = seen ? '' : ' Ingen så det.';
          if (Math.random() < 0.5) { G.world.spawnPickup('potion', P.pos.x, P.pos.z + 0.6); txt = 'En legedrikk fra hylla.' + nobody; }
          else { G.world.spawnPickup('item', P.pos.x, P.pos.z + 0.6, { item: makeItem(Math.max(1, G.run.nextDepth || 1)) }); txt = 'Noe fra hylla.' + nobody; }
          if (P.isNebb) txt += ' Far kommer til å telle varene i morgen.';
        } else {
          const n = 20 + rollDice('D6') * 10;
          P.silver += n;
          if (what !== 'stall_spice') G.world.spawnPickup('bread', P.pos.x, P.pos.z + 0.6);
          txt = what === 'stall_spice' ? `En pung med ${n} silver under kanelen. Gaspard teller dem aldri.` : `Et brød og ${n} silver fra boden.`;
        }
        G.ui.logRoll(r, `<b class="c-mark">Tyveri:</b> ${txt}`);
        G.audio.coin();
      }
      if (seen) {
        const line = seen === 'vakt' ? 'En vakt kommer rundt hjørnet akkurat da.' : `${G.meta.met?.[seen.id] ? seen.def.name : cap(seen.def.short)} ser deg. "Tyv! Vakt!"`;
        if (r.success) G.ui.log(line); else G.ui.logRoll(r, line);
        this.caught(what === 'bowl' ? 2 : 1);
      } else if (!r.success) {
        G.ui.logRoll(r, lock ? 'Låsen gir ikke etter. Du lar den være før noen hører deg.' : 'Du får ikke løs noe uten at det bråker. Du lar det være.');
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
    const fine = 100 * run.offenses * sev;
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
        this.passTime(1, () => {
          P.pos.set(U(21.6), 0, U(39.5));
          P.vel.set(0, 0, 0);
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
void hash2;
