// Fiendene etter DoD91 (Bok II s. 23-48). Humanoider har detaljert strid med träffområden, dyr og demoner vanlig strid
// (bare totala KP, ingen parering, Bok II s. 15). Alle anfall er slag mot FV. Stridsmoral etter Expert s. 61-62.
// Verdier som ikke står i boka (kloakkråtta, Rødpels) er merket uv.
import * as THREE from 'three';
import { G, T } from './state.js';
import { clRoll, resist, rollDice, d } from './rules.js';
import { weaponItem } from './loot.js';
import { WEAPONS, ARMORS, SR, LOC_SHORT, hitLocation, skadebonus, FUMMEL_NARSTRID, fromRange } from './dod.js';
import { makeBody, hurt, lostKP, usable, kneeling } from './body.js';
import { buildRat, buildSkeleton, buildGoblin, buildOrc, buildFox } from './assets.js';
import { buildDemon } from './kinmodels.js';

const A = (STY, STO, FYS, SMI, INT, PSY) => ({ STY, STO, FYS, SMI, INT, PSY });

export const DEFS = {
  rat: {
    // ikke i Bok II: satt etter små dyr (liten katt, liten hund), uv
    name: 'Kloakkråtta', attrs: A(3, 2, 6, 15, 2, 8), kp: 4, nat: 0, detailed: false, beast: true, small: true, uv: true,
    attacks: [{ name: 'bett', dmg: 'D4', fv: 9, type: 'p', natural: true }], noSB: true,
    moral: 10, upptacka: 9, speed: 5.0, radius: 0.36, aggro: 9, range: 1.3, windup: 0.4, recover: 0.6, shape: 'circle', sr: 1.15,
    silver: [0, 20], build: buildRat, swim: true, interrupt: true, bounty: 1, ko: 'bite',
    lore: 'Kloakkråtter angriper i flokk. Bittene er små, men mange. De mister motet fort når flokken tynnes ut.',
  },
  skeleton: {
    // Bok II s. 45. Ingen skade av pilar og stickvapen. Ingen skade av vanlig eld. Ingen smärta, blöder inte.
    name: 'Skelett', attrs: A(13, 11, 0, 7, 2, 2), kp: 6, nat: 0, detailed: true, humanoid: true, undead: true, noMoral: true, fearImmune: true, noBleed: true, noPain: true,
    immune: { p: true }, noFire: true, weapon: 'kortsvard', fv: 9, armor: [], armorDeep: ['laderharnesk'], shieldDeep: 'litenrundskold', upptacka: 5,
    speed: 2.7, radius: 0.5, aggro: 10, range: 1.9, windup: 0.62, recover: 0.8, shape: 'cone', sr: 2.5, arc: 1.7, silver: [10, 40], build: buildSkeleton,
    interrupt: true, bones: true, bounty: 2, ko: 'kill',
    lore: 'Skjeletter tar ingen skade av stikk og piler (Bok II s. 45). Hugg og kross virker. De slåss til de faller fra hverandre.',
  },
  goblin: {
    // Vätte, Bok II s. 47. Ser i mørket. Feige i motgang (stridsmoral 6 som svartalfer, Expert s. 61).
    name: 'Vätte', attrs: A(7, 6, 11, 13, 11, 11), kp: 9, nat: 0, detailed: true, humanoid: true, weapon: 'kortbage', melee: 'dolk', fv: 8, meleeFv: 6,
    armor: ['tygharnesk'], armorDeep: ['laderhuva'], moral: 6, upptacka: 6, ranged: true, pref: 7.5,
    speed: 3.7, radius: 0.42, aggro: 13, windup: 0.85, recover: 1.0, silver: [20, 50], build: buildGoblin, interrupt: true, bounty: 2, ko: 'rob',
    lore: 'Vätter skyter med kortbåge og holder avstand. Kommer du tett på, blir de nervøse, og mister de noen, flykter de gjerne.',
  },
  orc: {
    // Orch, Bok II s. 42. Bär mest arm- och benskydd.
    name: 'Orch', attrs: A(14, 12, 11, 11, 8, 11), kp: 12, nat: 0, detailed: true, humanoid: true, weapon: 'kroksabel', fv: 9,
    armor: ['laderarmskydd', 'laderbenskydd'], armorDeep: ['nitladerharnesk'], shieldDeep: 'vanligskold', moral: 12, barsark: 2, upptacka: 6,
    speed: 3.0, radius: 0.72, aggro: 11, range: 2.3, windup: 0.8, recover: 0.95, shape: 'cone', sr: 3.0, arc: 1.9, charge: true, silver: [30, 80],
    build: buildOrc, interrupt: false, bounty: 4, ko: 'rob',
    lore: 'Orcher bærer arm- og benskydd. Stikk mot magen og hodet treffer der lærrustningen ikke dekker. De stanger når du holder avstand.',
  },
  boss: {
    // Rødpels, revehøvdingen. Ikke i boka: en ledare med opptil 50 % høyere verdier (Bok II s. 24), uv
    name: 'Rødpels', attrs: A(21, 16, 17, 16, 13, 15), kp: 30, nat: 1, detailed: true, humanoid: true, uv: true, weapon: 'bastardsvard', fv: 15,
    armor: ['nitladerharnesk', 'ringbrynjehuva', 'laderarmskydd'], noMoral: true, fearImmune: true, skrackSla: 5, upptacka: 12,
    speed: 3.9, radius: 1.0, aggro: 26, range: 2.9, windup: 0.68, recover: 0.55, shape: 'cone', sr: 3.7, arc: 2.2, silver: [400, 600], build: buildFox,
    boss: true, monster: true, interrupt: false, bounty: 25, ferocity: 2, ko: 'rob',
    lore: 'Rødpels slår to ganger per stridsrunde. Sverdhuggene kan pareres. Bitt og hale kan bare dukkes.',
  },
  demon: {
    // Demon, typisk (Bok II s. 28). Vanlig strid. Frätande blod (demonisk förmåga 6).
    name: 'Demon', attrs: A(26, 21, 26, 26, 16, 26), kp: 24, nat: 6, detailed: false, monster: true, fearImmune: true, moral: 14, skrackSla: 3,
    attacks: [{ name: 'klør', dmg: 'D8', fv: 12, type: 's', natural: true }], acidBlood: true, upptacka: 18,
    speed: 4.2, radius: 0.8, aggro: 40, range: 2.4, windup: 0.6, recover: 0.6, shape: 'cone', sr: 3.0, arc: 2.0, silver: [100, 200], build: buildDemon,
    interrupt: false, bounty: 10, ferocity: 2, ko: 'kill',
    lore: 'En demon fra den andre siden. Hud som rustning (6), og blodet fræser. Hold avstand når du hugger.',
  },
};

// Rødpels' angrepstabell (T6). Samme angrep to ganger på rad gir det neste i tabellen.
const BOSS_ATTACKS = [
  { name: 'Kongelig vrål', fear: true },
  { name: 'Feiende hugg', shape: 'circle', r: 3.6, weapon: true },
  { name: 'Revesprang', charge: true, dmg: '2D6', fv: 13, type: 'b', knock: true, natural: true },
  { name: 'Bitt', shape: 'cone', r: 3.0, arc: 1.3, dmg: 'D8', fv: 12, type: 'p', natural: true, hold: true },
  { name: 'Haleslag', shape: 'circle', r: 4.2, dmg: 'D6', fv: 12, type: 'b', natural: true, knock: true },
  { name: 'Kongelig kombinasjon', shape: 'cone', r: 3.7, arc: 2.2, weapon: true, combo: 2 },
];

const tmp = new THREE.Vector3();
const tmp2 = new THREE.Vector3();
const desired = new THREE.Vector3();

function angleTo(from, to) {
  return Math.atan2(to.x - from.x, to.z - from.z);
}
function wrap(a) {
  while (a > Math.PI) a -= Math.PI * 2;
  while (a < -Math.PI) a += Math.PI * 2;
  return a;
}

export class Enemy {
  constructor(type, x, z, depth) {
    this.type = type;
    this.def = DEFS[type];
    const m = this.def.build();
    this.root = m.root;
    this.parts = m.parts;
    this.fx = m.fx;
    this.baseRim = this.fx.map(u => u.uRim.value.clone());
    this.root.position.set(x, 0, z);
    G.scene.add(this.root);
    if (G.gfx) {
      this.blob = G.gfx.blobFor(this.def.radius * (this.type === 'rat' ? 1.1 : 0.9), 0.5);
      this.root.add(this.blob);
    }
    this.pos = this.root.position;
    this.vel = new THREE.Vector3();
    this.yaw = Math.random() * Math.PI * 2;
    this.radius = this.def.radius;
    this.depth = depth;
    const D = this.def;
    this.attrs = { ...D.attrs };
    // dypere nede er de mer erfarne (uv)
    const scale = D.boss || D.monster ? 1 : 1 + 0.1 * (depth - 1);
    this.body = makeBody(Math.max(2, Math.round(D.kp * scale)));
    this.fv = (D.fv || D.attacks?.[0]?.fv || 8) + (D.boss || D.monster ? 0 : Math.max(0, depth - 1));
    this.sb = D.noSB ? null : skadebonus(this.attrs.STY + this.attrs.STO);
    this.weapon = D.weapon ? WEAPONS[D.weapon] : null;
    this.weaponDur = this.weapon?.dur || 0;
    this.meleeW = D.melee ? WEAPONS[D.melee] : null;
    this.shieldItem = D.shieldDeep && depth >= (type === 'orc' ? 4 : 3) ? WEAPONS[D.shieldDeep] : null;
    this.shieldDur = this.shieldItem?.dur || 0;
    this.armor = [...(D.armor || []), ...(depth >= 3 ? D.armorDeep || [] : [])].map(id => ARMORS[id]).filter(Boolean);
    this.metalArmor = this.armor.some(a => a.metal);
    this.state = 'idle';
    this.t = 0;
    this.cd = 0.6 + Math.random() * 1.2;
    this.stunDur = 0;
    this.flash = 0;
    this.dead = false;
    this.deadT = 0;
    this.dots = [];
    this.animT = Math.random() * 10;
    this.lastSeen = new THREE.Vector3(x, 0, z);
    this.wander = new THREE.Vector3();
    this.wanderT = 0;
    this.tg = null;
    this.alerted = false;
    this.surprised = 0;
    this.rooted = 0;
    this.lifted = 0;
    this.frozen = 0;
    this.asleep = 0;
    this.prone = 0;
    this.blindT = 0;
    this.weakT = 0;
    this.fvMod = 0;
    this.parryCD = 0;
    this.spotT = 0;
    this.bleedT = 0;
    this.weaponLost = false;
    this.shieldLost = false;
    this.fleeing = false;
    this.berserk = false;
    this.halfChecked = false;
    this.home = new THREE.Vector3(x, 0, z);
    if (D.boss) {
      this.summons = [0.66, 0.33];
      this.combo = 0;
      this.intro = false;
      this.lastAtk = -1;
    }
  }

  get kp() { return this.body.kp; }
  set kp(v) { this.body.kp = v; }
  get maxKP() { return this.body.max; }
  get skill() { return this.fv; }

  alert(cause) {
    if (this.alerted) return;
    this.alerted = true;
    if (this.state === 'idle' || this.state === 'search') this.state = 'chase';
    if (this.type === 'rat') G.audio.squeak();
    else if (this.type === 'orc') G.audio.grunt(0.8);
    else if (this.type === 'skeleton') G.audio.bones();
    else if (this.type === 'goblin') G.audio.grunt(1.6);
    const flock = [this];
    for (const e of G.enemies) {
      if (e !== this && !e.dead && !e.alerted && e.pos.distanceTo(this.pos) < 7) {
        e.alerted = true;
        if (e.state === 'idle') e.state = 'chase';
        flock.push(e);
      }
    }
    // skräckslå: den som ser demonen eller hører Rødpels, slår på Skräcktabellen (Bok III s. 8)
    if (this.def.skrackSla && !this.def.boss && !this.feared) { this.feared = true; G.player.fearCheck?.(this, this.def.skrackSla); }
    G.game.onEnemiesAlerted?.(flock, cause);
  }

  setState(s) {
    this.state = s;
    this.t = 0;
  }

  immobile() { return this.asleep > 0 || this.rooted > 0 || this.frozen > 0 || this.lifted > 0; }

  update(dt) {
    this.animT += dt;
    if (this.dead) {
      this.deadT += dt;
      const p = Math.min(1, this.deadT / 0.35);
      this.root.rotation.z = (1 - Math.pow(1 - p, 3)) * (this.type === 'rat' ? 2.6 : 1.45) * this.deadSide;
      this.root.position.y += (0 - this.root.position.y) * Math.min(1, dt * 8);
      const len = this.def.boss ? 2.2 : 0.9;
      const dp = Math.max(0, (this.deadT - 0.3) / len);
      const ghost = this.def.bones;
      for (const u of this.fx) {
        u.uFlash.value = 0;
        u.uDissolve.value = Math.min(1.02, dp);
        u.uDissolveCol.value.setHex(ghost ? 0x5affc8 : this.type === 'demon' ? 0xffd040 : 0xff6a1a);
      }
      if (this.blob && dp > 0.4) this.blob.visible = false;
      if (dp > 0 && dp < 1) {
        const hh = { rat: 0.4, skeleton: 1.0, goblin: 0.8, orc: 1.3, boss: 1.8, demon: 1.8 }[this.type] || 1;
        const n = Math.random() < dt * (this.def.boss ? 120 : 45) ? (this.def.boss ? 3 : 1) : 0;
        if (n) G.fx.burst('dissolve', { x: this.pos.x, y: 0.15, z: this.pos.z, w: this.radius * 2.6, h: hh, col: ghost ? 'ghost' : '' }, n);
      }
      return dp < 1.05;
    }
    this.flash = Math.max(0, this.flash - dt);
    const tint = this.frozen > 0 ? 0.5 : 0;
    this.fx.forEach((u, i) => {
      u.uFlash.value = this.flash > 0 ? 1.6 : tint;
      if (this.frozen > 0) u.uRim.value.setRGB(0.3, 0.7, 1.2);
      else if (this.berserk) u.uRim.value.setRGB(1.2, 0.2, 0.1);
      else if (this.fleeing) u.uRim.value.setRGB(0.6, 0.6, 0.2);
      else u.uRim.value.copy(this.baseRim[i]);
    });
    this.cd -= dt;
    this.t += dt;
    this.parryCD = Math.max(0, this.parryCD - dt);
    if (this.surprised > 0) this.surprised -= dt;
    if (this.prone > 0) this.prone -= dt;
    if (this.blindT > 0) this.blindT -= dt;
    if (this.calm > 0) this.calm -= dt;
    if (this.weakT > 0) { this.weakT -= dt; if (this.weakT <= 0) this.fvMod = 0; }
    // blødning: 1 KP hvert 6. SR (Bok II s. 18)
    if (this.body.bleeding.size && !this.def.noBleed) {
      this.bleedT += dt;
      if (this.bleedT >= SR * 6) {
        this.bleedT = 0;
        this.body.kp -= this.body.bleeding.size;
        G.fx.burst('blood', { x: this.pos.x, y: 0.5, z: this.pos.z }, 3);
        if (this.kp <= 0) { this.die('blødning'); return true; }
      }
    }
    // skade over tid
    for (let i = this.dots.length - 1; i >= 0; i--) {
      const dt0 = this.dots[i];
      dt0.t -= dt;
      if (Math.random() < dt * 10) G.fx.burst(dt0.kind === 'burn' ? 'fire' : 'poison', { x: this.pos.x, y: 0.6, z: this.pos.z }, 1);
      if (dt0.t <= 0) {
        dt0.t = SR;
        dt0.ticks--;
        // eld: 1T4 første SR, 2T4 andre ... (Bok II s. 22), forenklet til 1T4 (uv)
        const dmg = dt0.kind === 'burn' ? (this.def.noFire ? 0 : d(4)) : d(2);
        if (dmg) {
          this.body.kp -= dmg;
          this.flash = 0.06;
          G.fx.float(String(dmg), this.pos, dt0.kind === 'burn' ? 'burn' : 'poison');
          if (this.kp <= 0) { this.die(); return true; }
        }
        if (dt0.ticks <= 0) this.dots.splice(i, 1);
      }
    }
    // magiske tilstander
    if (this.lifted > 0) return this.updateLifted(dt);
    if (this.frozen > 0) {
      this.frozen -= dt;
      this.vel.multiplyScalar(0.8);
      this.animate(0);
      return true;
    }
    if (this.asleep > 0) {
      this.asleep -= dt;
      this.vel.multiplyScalar(0.8);
      this.root.rotation.z = 0.25;
      if (Math.random() < dt) G.fx.float('z', this.pos, 'miss');
      return true;
    }
    if (this.rooted > 0) {
      this.rooted -= dt;
      this.rootTick = (this.rootTick || 0) + dt;
      if (this.rootTick > SR) {
        // ÖRTRANKOR: målet slår STY mot E x 10 - STO hver SR (Bok III)
        this.rootTick = 0;
        const rs = resist(this.attrs.STY, this.rootE * 10 - this.attrs.STO);
        if (rs.success) { this.rooted = 0; G.fx.float('Løs', this.pos, 'miss'); }
      }
      if (Math.random() < dt * 4) G.fx.burst('poison', { x: this.pos.x, y: 0.2, z: this.pos.z }, 1);
    }

    const P = G.player;
    const toP = tmp.set(P.pos.x - this.pos.x, 0, P.pos.z - this.pos.z);
    const dist = toP.length();
    const hidden = P.hidden?.() || this.blindT > 0;
    let canSee = !hidden && dist < this.def.aggro && G.dungeon.los(this.pos.x, this.pos.z, P.pos.x, P.pos.z);
    // Smyga mot Upptäcka fara: et slag hvert SR, minus differensvärdet (Bok I s. 43)
    if (canSee && P.stealth && !this.alerted) {
      this.spotT -= dt;
      if (this.spotT <= 0) {
        this.spotT = SR;
        const close = dist < 2.5 ? 5 : dist < 5 ? 2 : 0;
        const r = clRoll(this.def.upptacka - P.sneakDiff + close, this.def.upptacka);
        if (!r.success) canSee = false;
      } else canSee = false;
    }
    if (canSee) this.lastSeen.copy(P.pos);
    const playerOut = P.ko || P.dead;
    desired.set(0, 0, 0);
    let speed = this.def.speed * (this.def.boss && this.kp < this.maxKP * 0.5 ? 1.2 : 1) * (this.berserk ? 1.15 : 1);
    if (kneeling(this.body)) speed *= 0.35;
    let faceTarget = null;

    if (this.surprised > 0) {
      // overrasket: står og glor
      this.state = this.state === 'idle' ? 'chase' : this.state;
      faceTarget = P.pos;
      this.vel.multiplyScalar(0.85);
      if (Math.random() < dt * 3) G.fx.float('?', this.pos, 'miss');
      this.animate(dt);
      return true;
    }

    switch (this.state) {
      case 'idle': {
        this.wanderT -= dt;
        if (this.wanderT <= 0) {
          this.wanderT = 1.5 + Math.random() * 2.5;
          const a = Math.random() * Math.PI * 2;
          this.wander.set(Math.cos(a), 0, Math.sin(a)).multiplyScalar(Math.random() < 0.4 ? 0 : 0.35);
          if (this.pos.distanceTo(this.home) > 4) this.wander.copy(this.home).sub(this.pos).setY(0).normalize().multiplyScalar(0.35);
        }
        desired.copy(this.wander);
        if (desired.lengthSq() > 0.001) faceTarget = tmp2.copy(this.pos).add(desired);
        if (canSee && !playerOut && !(this.calm > 0)) this.alert('sight');
        if (this.def.boss && dist < 15 && !this.intro && !hidden) this.bossIntro();
        break;
      }
      case 'search': {
        tmp2.set(this.lastSeen.x - this.pos.x, 0, this.lastSeen.z - this.pos.z);
        if (tmp2.length() < 1 || this.t > 4) { this.alerted = false; this.setState('idle'); break; }
        desired.copy(tmp2.normalize()).multiplyScalar(0.6);
        faceTarget = this.lastSeen;
        if (canSee) this.setState('chase');
        break;
      }
      case 'flee': {
        // flykter bort fra deg til motet kommer tilbake (Expert s. 62)
        this.fleeDir(desired);
        speed *= 1.1;
        if (this.t > this.fleeT) {
          this.fleeing = false;
          this.alerted = false;
          this.home.copy(this.pos);
          this.setState('idle');
        } else if (dist < 1.6 && this.t > 1 && Math.hypot(this.vel.x, this.vel.z) < 0.6) {
          // trengt opp i et hjørne: slår seg fri
          this.fleeing = false;
          this.setState('chase');
        }
        break;
      }
      case 'chase': {
        if (playerOut) { desired.set(0, 0, 0); break; }
        if (!canSee && P.stealth && dist > 3.5 && !this.def.boss) { this.setState('search'); break; }
        faceTarget = P.pos;
        if (this.def.boss) { this.bossThink(dist, canSee); break; }
        const bow = this.def.ranged && !this.weaponLost && dist > 2.2;
        if (bow) {
          if (dist < this.def.pref - 2.5 && canSee) {
            desired.copy(toP).normalize().multiplyScalar(-1);
          } else if (dist > this.def.pref + 2 || !canSee) {
            this.pathTo(P.pos, dist, canSee);
          } else {
            desired.set(-toP.z, 0, toP.x).normalize().multiplyScalar(Math.sin(this.animT * 0.8) * 0.5);
            if (this.cd <= 0) this.startAim();
          }
        } else {
          if (this.def.charge && this.cd <= 0 && dist > 4.5 && dist < 9 && canSee && Math.random() < dt * 2 && this.rooted <= 0 && !kneeling(this.body)) {
            this.startCharge(8, 1.6);
          } else if (dist < (this.def.range || 1.6) + P.radius && this.cd <= 0) {
            this.startWindup();
          } else if (dist > (this.def.range || 1.6) * 0.7) {
            this.pathTo(P.pos, dist, canSee);
          }
        }
        break;
      }
      case 'windup': {
        const w = this.windupDur;
        if (this.t < w * 0.35 && !this.def.boss) {
          this.yaw += wrap(angleTo(this.pos, P.pos) - this.yaw) * Math.min(1, dt * 8);
          if (this.tg) this.tg.grp.rotation.y = this.yaw;
        }
        if (this.type === 'rat') desired.copy(toP).normalize().multiplyScalar(-0.15);
        if (this.t >= w) this.resolveMelee();
        break;
      }
      case 'aim': {
        if (this.t < this.windupDur * 0.65) {
          this.yaw = angleTo(this.pos, P.pos);
          if (this.tg) this.tg.grp.rotation.y = this.yaw;
        }
        if (this.t >= this.windupDur) this.fireArrow();
        break;
      }
      case 'chargeWindup': {
        if (this.t < this.windupDur * 0.4) {
          this.yaw = angleTo(this.pos, P.pos);
          if (this.tg) { this.tg.grp.rotation.y = this.yaw; this.tg.grp.position.set(this.pos.x, 0.04, this.pos.z); }
        }
        if (this.t >= this.windupDur) {
          G.fx.endTelegraph(this.tg);
          this.tg = null;
          this.setState('charging');
          this.chargeHit = false;
          G.audio.grunt(this.def.boss ? 0.6 : 0.9);
        }
        break;
      }
      case 'charging': {
        const dir = tmp2.set(Math.sin(this.yaw), 0, Math.cos(this.yaw));
        this.vel.copy(dir).multiplyScalar(this.def.boss ? 19 : 16);
        if (Math.random() < dt * 30) G.fx.burst('dust', this.pos, 1);
        if (!this.chargeHit && dist < this.radius + P.radius + 0.25) {
          this.chargeHit = true;
          const atk = this.chargeAtk || { name: 'stangning', dmg: 'D6', fv: this.fv, type: 'b', natural: true, knock: true };
          this.attackPlayer(atk, 'ramler inn i', { knock: true });
          P.vel.addScaledVector(dir, 14);
        }
        if (this.t > (this.def.boss ? 0.7 : 0.55)) { this.setState('recover'); this.recoverDur = 1.0; }
        break;
      }
      case 'howl': {
        if (this.t >= this.windupDur) this.resolveHowl();
        break;
      }
      case 'recover': {
        if (this.t >= (this.recoverDur || this.def.recover)) this.setState('chase');
        faceTarget = null;
        break;
      }
      case 'stagger': {
        if (this.t >= this.stunDur) this.setState('chase');
        break;
      }
    }

    // bevegelse
    if (this.state !== 'charging') {
      const inWater = G.dungeon.isWater(this.pos.x, this.pos.z);
      if (inWater && !this.def.swim) speed *= 0.55;
      desired.multiplyScalar(speed);
      const busy = this.state === 'windup' || this.state === 'aim' || this.state === 'chargeWindup' || this.state === 'howl' || this.state === 'stagger' || this.state === 'recover';
      if (busy && this.type !== 'rat') desired.multiplyScalar(0.15);
      if (this.rooted > 0 || this.prone > 0) desired.set(0, 0, 0);
      this.vel.lerp(desired, 1 - Math.exp(-8 * dt));
    }
    // separasjon
    for (const e of G.enemies) {
      if (e === this || e.dead) continue;
      const dx = this.pos.x - e.pos.x, dz = this.pos.z - e.pos.z;
      const dd = Math.hypot(dx, dz), rr = this.radius + e.radius;
      if (dd < rr && dd > 1e-4) {
        const push = ((rr - dd) / dd) * 0.5;
        this.pos.x += dx * push;
        this.pos.z += dz * push;
      }
    }
    for (const p of G.props) {
      const dx = this.pos.x - p.pos.x, dz = this.pos.z - p.pos.z;
      const dd = Math.hypot(dx, dz), rr = this.radius + p.radius;
      if (dd < rr && dd > 1e-4) { this.pos.x += (dx / dd) * (rr - dd); this.pos.z += (dz / dd) * (rr - dd); }
    }
    if (this.rooted > 0) this.vel.multiplyScalar(0.2);
    this.pos.x += this.vel.x * dt;
    this.pos.z += this.vel.z * dt;
    const hitWall = G.dungeon.collide(this.pos, this.radius);
    if (hitWall && this.state === 'charging' && this.t > 0.08) {
      this.setState('stagger');
      this.stunDur = 1.3;
      G.fx.addShake(0.35);
      G.audio.hit(true);
      G.fx.burst('dust', this.pos, 14);
      G.fx.float('Stanget i veggen', this.pos, 'miss');
    }
    if (faceTarget && this.state !== 'windup' && this.state !== 'aim' && this.state !== 'charging' && this.state !== 'chargeWindup') {
      const ta = angleTo(this.pos, faceTarget);
      this.yaw += wrap(ta - this.yaw) * Math.min(1, dt * 7);
    } else if (this.vel.lengthSq() > 0.5 && (this.state === 'idle' || this.state === 'flee')) {
      this.yaw += wrap(Math.atan2(this.vel.x, this.vel.z) - this.yaw) * Math.min(1, dt * 5);
    }
    this.root.rotation.y = this.yaw;
    const inWater = G.dungeon.isWater(this.pos.x, this.pos.z);
    this.root.position.y += ((inWater ? -0.35 : 0) - this.root.position.y) * Math.min(1, dt * 10);
    this.animate(dt);
    return true;
  }

  pathTo(target, dist, canSee) {
    if (canSee && dist < 12) desired.set(target.x - this.pos.x, 0, target.z - this.pos.z).normalize();
    else if (!G.dungeon.flowDir(this.pos.x, this.pos.z, desired)) desired.set(0, 0, 0);
  }

  // Bort fra spilleren langs avstandskartet
  fleeDir(out) {
    const D = G.dungeon;
    const tx = Math.floor(this.pos.x / T), ty = Math.floor(this.pos.z / T);
    let best = D.dist?.[D.idx(tx, ty)] ?? -1, bx = tx, by = ty;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue;
      if (!D.open?.(tx + dx, ty + dy)) continue;
      const v = D.dist?.[D.idx(tx + dx, ty + dy)];
      if (v != null && v < 65535 && v > best) { best = v; bx = tx + dx; by = ty + dy; }
    }
    if (bx === tx && by === ty) out.set(this.pos.x - G.player.pos.x, 0, this.pos.z - G.player.pos.z).normalize();
    else out.set((bx + 0.5) * T - this.pos.x, 0, (by + 0.5) * T - this.pos.z).normalize();
  }

  // --- magiske og andre tilstander --------------------------------------------------

  freeze(sec) {
    this.frozen = sec;
    G.fx.endTelegraph(this.tg);
    this.tg = null;
    this.setState('chase');
    G.fx.float('Frosset', this.pos, 'cond', 2.2);
  }
  sleep(sec) {
    if (this.def.boss || this.def.undead) return;
    this.asleep = sec;
    G.fx.endTelegraph(this.tg);
    this.tg = null;
    this.setState('chase');
  }
  entangle(sec, E) {
    this.rooted = sec;
    this.rootE = E || 1;
    this.rootTick = 0;
    G.fx.float('Fanget', this.pos, 'cond', 2.2);
    G.fx.burst('poison', { x: this.pos.x, y: 0.2, z: this.pos.z }, 18);
  }
  stagger(sec) {
    G.fx.endTelegraph(this.tg);
    this.tg = null;
    this.setState('stagger');
    this.stunDur = sec;
  }
  knockDown(sec) {
    if (this.def.boss) { this.stagger(sec * 0.5); return; }
    this.prone = sec;
    this.stagger(sec);
    this.root.rotation.z = 0.8;
  }
  weaken(e, sec) { this.fvMod = -e; this.weakT = sec; }
  blind(sec) { this.blindT = sec; this.stagger(Math.min(1.5, sec)); }
  distract(sec) { this.stagger(Math.min(2, sec)); this.alerted = false; }
  canBeDisarmed() { return !!this.weapon && !this.weaponLost && this.def.detailed; }
  disarm() {
    this.weaponLost = true;
    G.fx.float('Avväpnad', this.pos, 'cond', 2.2);
    if (this.weapon && !this.def.boss) G.world.spawnPickup('item', this.pos.x + 0.8, this.pos.z + 0.4, { item: weaponItem(this.def.weapon, { name: `Slitt ${this.weapon.name.toLowerCase()}` }) });
  }
  breakShield() {
    if (!this.shieldItem || this.shieldLost) return;
    this.shieldLost = true;
    G.fx.float('Skjoldet knuses', this.pos, 'cond', 2.2);
  }
  lift(sec, pl) {
    this.lifted = sec;
    this.liftPL = pl;
    this.liftT = 0;
    G.fx.endTelegraph(this.tg);
    this.tg = null;
    this.setState('chase');
  }
  updateLifted(dt) {
    this.lifted -= dt;
    this.liftT += dt;
    const h = Math.min(2.2, this.liftT * 4);
    this.root.position.y = h + Math.sin(this.liftT * 6) * 0.08;
    this.vel.set(0, 0, 0);
    if (this.lifted <= 0) {
      this.lifted = 0;
      this.root.position.y = 0;
      this.takeHit(rollDice(`${this.liftPL || 1}D6`), new THREE.Vector3(), 0, { total: true, stun: 1, src: 'player' });
    }
    this.animate(dt);
    return true;
  }

  // --- parering (Bok II s. 17): én gang per SR, med våpen eller skjold, bare forfra -------------

  tryParry(r, o = {}) {
    if (!this.def.detailed || this.dead) return null;
    if (this.immobile() || this.surprised > 0 || this.prone > 0 || this.berserk) return null;
    if (['windup', 'aim', 'chargeWindup', 'charging', 'howl', 'stagger', 'flee'].includes(this.state)) return null;
    if (this.parryCD > 0) return null;
    if (o.ranged && !o.thrown) return null;
    const sh = this.shieldItem && !this.shieldLost && usable(this.body, 'varm') ? this.shieldItem : null;
    const w = !this.weaponLost && usable(this.body, 'harm') && this.curWeapon()?.ranged !== true ? this.curWeapon() : null;
    if (o.thrown && !sh) return null;
    const item = sh || w;
    if (!item) return null;
    const P = G.player;
    const dx = P.pos.x - this.pos.x, dz = P.pos.z - this.pos.z;
    const dd = Math.hypot(dx, dz) || 1;
    if ((dx * Math.sin(this.yaw) + dz * Math.cos(this.yaw)) / dd < -0.2) return null;
    this.parryCD = SR;
    const pfv = this.curFv();
    const pr = clRoll(pfv + this.fvMod - 2 * lostKP(this.body, [sh ? 'varm' : 'harm']), pfv);
    if (pr.fummel) {
      this.stagger(SR * 0.7);
      G.fx.float('Fummel', this.pos, 'demon');
      return 'fummel';
    }
    if (!pr.success) return null;
    this.cd = Math.max(this.cd, SR * 0.5);
    G.fx.burst('spark', { x: this.pos.x, y: 1.2, z: this.pos.z }, 8);
    G.audio.hit(false);
    G.fx.float(pr.perfekt ? 'Perfekt parering' : 'Parerer', this.pos, 'miss', 2.2);
    if (pr.perfekt) return 'perfekt';
    // brytvärde: skade over BV koster 1 BV, ved 0 går resten gjennom
    const dmg = rollDice(o.dice || 'D6') + (o.melee && P.sb ? rollDice(P.sb) : 0);
    const key = sh ? 'shieldDur' : 'weaponDur';
    if (this[key] > 0 && dmg > this[key]) {
      const before = this[key];
      this[key]--;
      if (this[key] <= 0) {
        if (sh) this.shieldLost = true; else this.weaponLost = true;
        G.fx.float(`${item.name} går i stykker`, this.pos, 'demon', 2.2);
        G.ui.log(`${this.def.name}s ${item.name.toLowerCase()} går i stykker (${dmg} mot BV ${before}).`);
        return { overflow: dmg - before };
      }
    }
    return 'parried';
  }

  curWeapon() {
    if (this.weaponLost) return null;
    const P = G.player;
    if (this.meleeW && Math.hypot(P.pos.x - this.pos.x, P.pos.z - this.pos.z) < 2.4) return this.meleeW;
    return this.weapon;
  }
  curFv() {
    const w = this.curWeapon();
    if (w && w === this.meleeW && this.def.meleeFv) return this.def.meleeFv + Math.max(0, this.depth - 1);
    return this.fv;
  }

  // --- angrep ------------------------------------------------------------

  // Hvilket anfall et vanlig hugg er: våpen, naturlige våpen, eller knyttnever uten våpen
  mainAttack() {
    if (this.def.attacks) return this.def.attacks[0];
    const w = this.curWeapon();
    if (!w || w.ranged) return { name: 'knytnäve', dmg: 'D3', fv: Math.floor(this.fv / 2), type: 'b', natural: true };
    return { name: w.name.toLowerCase(), dmg: w.dmg, fv: this.curFv(), type: w.types[0] };
  }

  startWindup(o = {}) {
    this.setState('windup');
    const P = G.player;
    this.yaw = angleTo(this.pos, P.pos);
    const enraged = this.def.boss && this.kp < this.maxKP * 0.5;
    this.windupDur = (o.windup || this.def.windup) * (enraged ? 0.82 : 1) * (this.berserk ? 0.8 : 1);
    const base = o.weapon || !o.dmg ? this.mainAttack() : null;
    this.atk = {
      shape: o.shape || this.def.shape || 'cone', r: o.r || this.def.sr || 2, arc: o.arc || this.def.arc || 1.6,
      name: o.name || base?.name, dmg: o.dmg || base.dmg, fv: o.fv || base.fv, type: o.type || base.type, natural: o.natural ?? base?.natural,
      knock: o.knock, hold: o.hold, monster: !!o.monster,
    };
    this.tg = G.fx.telegraph(this.atk.shape, this.pos, this.yaw, { r: this.atk.r, arc: this.atk.arc, dur: this.windupDur, color: this.atk.natural && this.def.boss ? 0xff6a10 : undefined });
  }

  inShape(atk, pos = G.player.pos, rad = G.player.radius) {
    const dx = pos.x - this.pos.x, dz = pos.z - this.pos.z;
    const dd = Math.hypot(dx, dz);
    if (dd > atk.r + rad * 0.6) return false;
    if (atk.shape === 'circle') return true;
    const a = Math.atan2(dx, dz);
    return Math.abs(wrap(a - this.yaw)) < atk.arc / 2 + 0.15 || dd < 0.8;
  }

  resolveMelee() {
    G.fx.endTelegraph(this.tg);
    this.tg = null;
    const atk = this.atk;
    if (this.type === 'rat') {
      this.vel.set(Math.sin(this.yaw), 0, Math.cos(this.yaw)).multiplyScalar(7);
      G.audio.squeak();
    } else {
      if (atk.shape === 'circle') G.fx.slash(this.pos, this.yaw, atk.r, Math.PI * 1.98, 1, 0xff5a3a, 1.0, 0.2);
      else G.fx.slash(this.pos, this.yaw, atk.r, atk.arc, Math.random() < 0.5 ? 1 : -1, this.def.boss ? 0xff5a3a : 0xff9a7a, 1.0, 0.14);
      G.audio.swing(0.6, 0.35);
    }
    if (this.inShape(atk)) this.attackPlayer(atk, this.type === 'rat' ? 'biter' : atk.natural ? `slår med ${atk.name} mot` : 'hugger mot', { knock: atk.knock, hold: atk.hold });
    this.setState('recover');
    this.recoverDur = this.def.recover;
    // én handling per SR: NPC-er venter litt mellom anfallene
    this.cd = this.def.recover + 0.9 + Math.random() * 0.9;
    if (this.def.ferocity || this.berserk) { this.cd *= 0.45; this.recoverDur *= 0.7; }
    if (this.combo > 0) {
      this.combo--;
      this.recoverDur = 0.12;
      this.cd = 0;
      this.nextCombo = true;
    }
  }

  // Anfallsslag mot spilleren (Bok II s. 17): FV med modifikasjoner, så pareringen eller dukkingen hans
  attackPlayer(atk, verb, o = {}) {
    const P = G.player;
    if (P.dead || P.ko) return;
    let mod = this.fvMod;
    if (!o.ranged) {
      if (P.prone?.()) mod += 5;
      if (P.immobile?.()) mod += 10;
      // fra siden +3, bakfra +7
      const fx = Math.sin(P.yaw), fz = Math.cos(P.yaw);
      const dx = this.pos.x - P.pos.x, dz = this.pos.z - P.pos.z;
      const dd = Math.hypot(dx, dz) || 1;
      const dot = (dx * fx + dz * fz) / dd;
      if (dot < -0.35) mod += 7; else if (dot < 0.35) mod += 3;
    }
    if (this.blindT > 0) mod -= 15;
    if (this.def.detailed && !atk.natural) mod -= 2 * lostKP(this.body, ['harm']);
    const fv = atk.fv || this.fv;
    const r = clRoll(fv + mod, fv);
    r.skill = atk.name;
    r.label = `${this.def.name}: ${atk.name}`;
    G.run.enemyRolls = (G.run.enemyRolls || 0) + 1;
    if (r.fummel) { this.fumble(r); return; }
    P.receiveAttack({
      src: this, roll: r, dmg: atk.dmg, sb: atk.natural && this.def.small ? null : this.sb, type: atk.type || 'b',
      ranged: !!o.ranged, small: !!this.def.small, natural: !!atk.natural, noParry: !!atk.natural || !!o.noParry, noDodge: !!o.noDodge,
      verb,
      after: real => this.afterHit(real, o),
    });
  }

  afterHit(real, o = {}) {
    const P = G.player;
    if (real <= 0 || P.dead || P.ko) return;
    if (o.knock && !P.has?.('kattfot')) P.knockdown?.(0.8);
    if (o.hold) { P.forced = { type: 'paralyzed', t: 0, max: SR }; G.fx.float('Fastholdt', P.pos, 'cond'); }
  }

  // Fummel for fiender (Expert s. 60-61), forenklet
  fumble(r) {
    const n = d(20);
    const f = fromRange(FUMMEL_NARSTRID, n);
    const nm = this.def.name;
    G.fx.float('FUMMEL', this.pos, 'demon');
    if (f.fx === 'break' || f.fx === 'drop' || f.fx === 'dropFar') {
      if (this.def.detailed && this.weapon && !this.weaponLost) { this.weaponLost = true; G.ui.logRoll(r, `${nm} fumler: ${f.name.toLowerCase()}.`, true); return; }
    }
    if (f.fx === 'self') {
      const dmg = rollDice(this.mainAttack().dmg);
      G.ui.logRoll(r, `${nm} fumler og treffer seg selv (${dmg}).`, true);
      this.takeHit(dmg, new THREE.Vector3(), 0, { total: true });
      return;
    }
    if (f.fx === 'fall') { this.knockDown(SR); G.ui.logRoll(r, `${nm} fumler og snubler.`, true); return; }
    if (f.fx === 'open') { this.surprised = SR; G.ui.logRoll(r, `${nm} fumler og blottar seg.`, true); return; }
    this.stagger(SR * 0.8);
    G.ui.logRoll(r, `${nm} fumler og vakler.`, true);
  }

  startAim() {
    this.setState('aim');
    this.windupDur = this.def.windup;
    this.yaw = angleTo(this.pos, G.player.pos);
    this.tg = G.fx.telegraph('rect', this.pos, this.yaw, { w: 0.3, len: 15, dur: this.windupDur, color: 0xff4a2a });
    G.audio.swing(0.4, 0.12);
  }

  fireArrow() {
    G.fx.endTelegraph(this.tg);
    this.tg = null;
    G.world.spawnArrow(this, this.yaw);
    this.setState('recover');
    this.recoverDur = this.def.recover;
    this.cd = 2.0 + Math.random() * 1.2;
  }

  startCharge(len, w, atk = null) {
    this.setState('chargeWindup');
    this.windupDur = this.def.boss ? 0.75 : 0.85;
    this.yaw = angleTo(this.pos, G.player.pos);
    this.chargeAtk = atk;
    this.tg = G.fx.telegraph('rect', this.pos, this.yaw, { w, len, dur: this.windupDur, color: atk ? 0xff6a10 : undefined });
    this.cd = 3 + Math.random() * 2;
  }

  // --- sjefen -------------------------------------------------------------

  bossIntro() {
    this.intro = true;
    this.alert('boss');
    G.audio.roar();
    G.audio.playMusic('boss', { fast: true });
    G.post?.flash(0xff4020, 0.2);
    G.post?.pulse(0.014);
    G.fx.addShake(0.5);
    G.fx.float('RØDPELS', this.pos, 'boss big', 3.6);
    const P = G.player;
    G.ui.log(`<b class="c-boss">Rødpels, revehøvdingen:</b> «${P.isDuck ? 'En and. I mine haller. Jeg har spist bedre folk enn deg til frokost, og de var sprøere.' : `En ${P.sheet.kin === 'dvarg' ? 'dverg' : 'tyv'} i mine haller. Har Nansen sendt deg? Han burde passe butikken sin.`}»`);
    G.ui.showBoss(this);
  }

  bossThink(dist, canSee) {
    if (!this.intro) this.bossIntro();
    const hp = this.kp / this.maxKP;
    if (this.summons.length && hp < this.summons[0]) {
      this.summons.shift();
      this.startHowl(true);
      return;
    }
    if (this.nextCombo) {
      this.nextCombo = false;
      const a = BOSS_ATTACKS[5];
      this.startWindup({ windup: 0.42, arc: a.arc, r: a.r, weapon: true, name: a.name });
      return;
    }
    if (this.cd > 0) {
      this.pathTo(G.player.pos, dist, canSee);
      return;
    }
    // slå T6 på angrepstabellen, ikke samme to ganger
    let n = d(6) - 1;
    if (n === this.lastAtk) n = (n + 1) % 6;
    if (dist > 4.5) {
      if (canSee && dist < 12 && (n === 2 || n === 0 || Math.random() < 0.4)) n = n === 0 ? 0 : 2;
      else { this.pathTo(G.player.pos, dist, canSee); return; }
    }
    this.lastAtk = n;
    const a = BOSS_ATTACKS[n];
    if (a.fear) this.startHowl(false);
    else if (a.charge) this.startCharge(12, 2.2, { name: a.name.toLowerCase(), dmg: a.dmg, fv: a.fv, type: a.type, natural: true, knock: true });
    else {
      if (a.combo) this.combo = hp < 0.5 ? 2 : 1;
      this.startWindup({ shape: a.shape, r: a.r, arc: a.arc, weapon: a.weapon, dmg: a.dmg, fv: a.fv, type: a.type, natural: a.natural, knock: a.knock, hold: a.hold, name: a.name.toLowerCase(), windup: a.shape === 'circle' ? 0.8 : undefined });
    }
    G.fx.float(a.name, this.pos, 'edrake', 3.4);
  }

  startHowl(summon) {
    this.setState('howl');
    this.windupDur = 1.0;
    this.howlSummon = summon;
    this.tg = G.fx.telegraph('circle', this.pos, 0, { r: 12, dur: this.windupDur, color: 0xff6a20 });
    this.cd = 2;
  }

  resolveHowl() {
    G.fx.endTelegraph(this.tg);
    this.tg = null;
    G.audio.roar();
    G.fx.ring(this.pos, 12, 0xff6a20, 0.6);
    G.fx.addShake(0.6);
    const P = G.player;
    if (P.pos.distanceTo(this.pos) < 12 && !P.ko) P.fearCheck(this, this.def.skrackSla || 5);
    if (this.howlSummon) {
      G.ui.log('<b class="c-boss">Rødpels:</b> «Rotter! Middag!»');
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2 + Math.random();
        const x = this.pos.x + Math.cos(a) * 5, z = this.pos.z + Math.sin(a) * 5;
        if (G.dungeon.walkable(x, z)) {
          const e = new Enemy('rat', x, z, 4);
          e.alerted = true;
          e.state = 'chase';
          G.enemies.push(e);
          G.fx.burst('smoke', e.pos, 8);
        }
      }
    }
    this.setState('recover');
    this.recoverDur = 0.8;
  }

  // --- skade (Bok II s. 18) ------------------------------------------------------------

  absAt(loc) {
    let best = 0;
    for (const a of this.armor) if (a.covers.includes(loc)) best = Math.max(best, a.abs);
    return best + (this.def.nat || 0);
  }

  /**
   * dmg: skade før rustning. o: { loc, perfekt, ignoreArmor, type, total, armorLoc, magic, src, stun, crit, ranged }
   */
  takeHit(dmg, dir, knock, o = {}) {
    if (this.dead) return 0;
    const P = G.player;
    const wasUnaware = !this.alerted || this.surprised > 0;
    this.alert('hit');
    this.asleep = 0;
    if (this.def.immune?.[o.type] && !o.magic) {
      G.fx.float('Ingen virkning', this.pos, 'miss');
      if (!this._immuneTold) { this._immuneTold = true; G.ui.log(`${this.def.name} tar ingen skade av ${o.type === 'p' ? 'stikk og piler' : 'det'}.`); }
      return 0;
    }
    if (o.type === 'fire' && this.def.noFire && !o.magic) return 0;
    const loc = this.def.detailed && !o.total ? (o.loc || hitLocation(!!o.ranged)) : null;
    const abs = o.ignoreArmor ? 0 : loc ? this.absAt(loc) : o.armorLoc && this.def.detailed ? this.absAt(o.armorLoc) : (this.def.nat || 0);
    const real = Math.max(0, Math.round(dmg) - abs);
    if (real <= 0) {
      G.fx.float('Prell', this.pos, 'miss');
      G.fx.burst('spark', { x: this.pos.x, y: 1, z: this.pos.z }, 6);
      return 0;
    }
    const halfBefore = this.kp > this.maxKP / 2;
    const info = hurt(this.body, loc, real);
    this.flash = 0.12;
    G.run.damageDealt = (G.run.damageDealt || 0) + real;
    G.fx.float(String(real), this.pos, o.crit ? 'crit big' : 'dmg', this.def.boss ? 3.2 : this.type === 'rat' ? 1.0 : 1.9);
    G.fx.burst(this.def.bones ? 'bone' : 'blood', { x: this.pos.x, y: this.type === 'rat' ? 0.4 : 1.1, z: this.pos.z }, o.crit ? 16 : 8, dir);
    const kres = this.def.boss ? 0.12 : this.type === 'orc' || this.type === 'demon' ? 0.45 : 1;
    if (this.rooted <= 0) this.vel.addScaledVector(dir, knock * kres);
    // frätande blod: den som hugger demonen i närstrid må klare et SMI-slag (Bok II s. 29)
    if (this.def.acidBlood && o.src === 'player' && !o.ranged && !o.total && d(20) > P.attrs.SMI) {
      P.applyHit({ value: d(6), who: 'Demonblodet', verb: 'fræser på' });
    }
    // kroppsdeler (Bok II s. 18-19)
    if (info.loc) {
      const l = info.loc;
      if (info.critical && (l === 'huvud' || l === 'brost' || l === 'mage')) { this.die(l === 'huvud' ? 'hodet' : 'kritisk'); return real; }
      if (info.zero) {
        if (!this.def.noBleed) this.body.bleeding.add(l);
        if (l === 'huvud') { G.ui.log(this.def.undead ? `Hodeskallen til ${this.def.name.toLowerCase()}et knuses, og det faller sammen.` : `${this.def.name} får et slag i hodet og faller medvetslös om.`); this.die('ko'); return real; }
        if (l === 'brost' || l === 'mage') { G.ui.log(this.def.undead ? `${this.def.name} brekker over på midten.` : `${this.def.name} faller med ${LOC_SHORT[l]} på 0 KP og kryper unna.`); this.die('fall'); return real; }
        if (l === 'harm' && !this.weaponLost && this.weapon) { this.weaponLost = true; G.fx.float('Mister våpenet', this.pos, 'cond', 2.2); }
        if (l === 'varm' && this.shieldItem) this.shieldLost = true;
        if (l === 'hben' || l === 'vben') G.fx.float('På kne', this.pos, 'cond', 2);
        // svårt PSY-slag for å slåss videre, ellers lammet en stund (ikke odöda)
        if (!this.def.noPain && !resist(this.attrs.PSY, 15).success) this.stagger(SR);
      }
    }
    const winding = this.state === 'windup' || this.state === 'aim' || this.state === 'chargeWindup';
    if (!this.def.boss && (this.def.interrupt || o.crit || o.stun)) {
      if (winding) { G.fx.endTelegraph(this.tg); this.tg = null; }
      if (winding || o.stun || this.state === 'chase') {
        this.setState('stagger');
        this.stunDur = o.stun || (o.crit ? 0.5 : 0.2);
        if (o.stun >= 0.7) G.fx.float('Lammet', this.pos, 'cond', 2.4);
      }
    }
    // totala KP 0: ute av striden. Minus FYS: død. Spillet regner begge som beseiret.
    if (this.kp <= 0) { this.die(); return real; }
    if (this.def.boss) G.ui.showBoss(this);
    // stridsmoral (Expert s. 62): mer enn halve KP borte, eller angrepet overraskende
    if (halfBefore && this.kp <= this.maxKP / 2 && !this.halfChecked) { this.halfChecked = true; this.moralCheck(-4, 'mer enn halve KP borte'); }
    else if (wasUnaware && o.src === 'player') for (const e of this.flock()) e.moralCheck(0, 'overrasket');
    return real;
  }

  flock(r = 12) {
    return G.enemies.filter(e => !e.dead && e.type === this.type && e.pos.distanceTo(this.pos) < r);
  }

  // Moralslag: 1T20 lik eller under moral står kvar (Expert s. 61-62)
  moralCheck(mod, why) {
    if (this.dead || this.def.noMoral || this.def.moral == null || this.fleeing || this.berserk) return;
    const m = this.def.moral + mod;
    const r = d(20);
    const ok = r === 1 || (r !== 20 && r <= m);
    if (ok) return;
    // kan den gå bärsärk, prøver den det først
    if (this.def.barsark && this.kp > this.maxKP / 2 && d(20) <= this.def.barsark) {
      this.berserk = true;
      G.fx.float('BÄRSÄRK', this.pos, 'rage big', 2.4);
      G.ui.log(`<span class="roll fail">Moral ${r}/${m}</span> ${this.def.name} går bärsärk (${why}).`, 'enemy');
      return;
    }
    this.fleeing = true;
    this.fleeT = 8 + Math.random() * 6;
    G.fx.endTelegraph(this.tg);
    this.tg = null;
    this.setState('flee');
    G.fx.float(r === 20 ? 'Gir seg' : 'Flykter', this.pos, 'cond', 2.2);
    G.ui.log(`<span class="roll fail">Moral ${r}/${m}</span> ${this.def.name} ${r === 20 ? 'kaster våpenet og flykter' : 'mister motet og flykter'} (${why}).`, 'enemy');
    if (r === 20 && this.weapon) this.weaponLost = true;
  }

  addDot(kind) {
    if (kind === 'burn' && this.def.noFire) return;
    const ex = this.dots.find(x => x.kind === kind);
    if (ex) { ex.ticks = Math.max(ex.ticks, kind === 'burn' ? 3 : 5); return; }
    this.dots.push({ kind, ticks: kind === 'burn' ? 3 : 5, t: SR });
    G.fx.float(kind === 'burn' ? 'Brann' : 'Gift', this.pos, kind === 'burn' ? 'burn' : 'poison', 2.3);
  }

  die(how) {
    if (this.dead) return;
    this.dead = true;
    this.deadSide = Math.random() < 0.5 ? 1 : -1;
    this.lifted = 0;
    G.fx.endTelegraph(this.tg);
    this.tg = null;
    G.run.kills++;
    G.run.killsByType[this.type] = (G.run.killsByType[this.type] || 0) + 1;
    const P = G.player;
    if (P.floorStats) {
      P.floorStats.kills = (P.floorStats.kills || 0) + 1;
      if (this.def.beast) P.floorStats.beasts = (P.floorStats.beasts || 0) + 1;
      if (this.def.monster || this.type === 'orc') P.floorStats.monsters = (P.floorStats.monsters || 0) + 1;
    }
    const p = this.pos;
    if (this.def.bones) {
      G.fx.burst('bone', { x: p.x, y: 1, z: p.z }, 24);
      G.audio.bones();
      G.fx.decal(p.x, p.z, 0.8, 0x2a2420, 0.5);
    } else {
      G.fx.burst('blood', { x: p.x, y: 0.9, z: p.z }, 22);
      G.audio.crunch();
      G.fx.decal(p.x, p.z, this.type === 'rat' ? 0.6 : this.def.boss ? 2.2 : 1.2);
    }
    if (this.type === 'rat') G.audio.squeak();
    if (P.mods?.leech) P.heal(P.mods.leech, true);
    G.world.dropLoot(this);
    // store dåder gir hjältepoäng (Bok I s. 64: døda monster 10-50)
    if (this.type === 'demon') P.addHjp?.(10, 'du felte en demon');
    // stridsmoral: halve gruppen ute av striden, eller ledaren falt
    const rest = this.flock();
    const total = rest.length + 1 + (this._fallenFriends || 0);
    for (const e of rest) {
      e._fallenFriends = (e._fallenFriends || 0) + 1;
      if (e._fallenFriends >= Math.ceil(total / 2) && !e.halfGroup) { e.halfGroup = true; e.moralCheck(-5, 'halve flokken er borte'); }
    }
    if (this.def.boss) {
      for (const e of G.enemies) if (!e.dead && e !== this) e.moralCheck(-5, 'Rødpels er falt');
      P.addHjp?.(10, 'Rødpels er beseiret');
      G.slowmo = 1.6;
      G.post?.flash(0xffd080, 0.35);
      G.post?.pulse(0.02);
      G.audio.music?.stop();
      G.ui.hideBoss();
      G.ui.log('<b class="c-boss">Rødpels</b> segner om. Halen hans rykker en siste gang.');
      G.audio.roar();
      setTimeout(() => G.game.onVictory(), 2600);
    } else {
      const lines = {
        rat: 'Rotta piper en siste gang.',
        skeleton: 'Skjelettet faller fra hverandre i en haug.',
        goblin: 'Vätten slipper buen.',
        orc: 'Orchen dundrer i bakken.',
        demon: 'Demonen sprekker i glør og svovel. Det lukter brent hår lenge etterpå.',
      };
      if (how === 'fall' || how === 'ko') { /* allerede logget */ } else if (Math.random() < 0.35 || this.type === 'demon') G.ui.log(lines[this.type]);
    }
  }

  dispose() {
    G.scene.remove(this.root);
    G.fx.endTelegraph(this.tg);
  }

  // --- animasjon ------------------------------------------------------------

  animate(dt) {
    const P = this.parts;
    const sp = Math.min(1, Math.hypot(this.vel.x, this.vel.z) / Math.max(1, this.def.speed));
    const t = this.animT * (this.type === 'rat' ? 16 : 8);
    const sw = Math.sin(t) * sp;
    const st = this.state;
    const wp = st === 'windup' || st === 'aim' || st === 'chargeWindup' || st === 'howl' ? Math.min(1, this.t / (this.windupDur || 1)) : 0;
    if (this.type === 'rat') {
      P.body.position.y = 0.3 + Math.abs(sw) * 0.05;
      P.tail.rotation.y = Math.sin(this.animT * 6) * 0.5;
      P.legs.forEach((l, i) => (l.rotation.x = Math.sin(t + i * Math.PI * 0.5) * 0.8 * sp));
      P.head.rotation.x = st === 'windup' ? -0.3 * wp : 0;
      return;
    }
    if (P.legL) {
      P.legL.rotation.x = sw * 0.7;
      P.legR.rotation.x = -sw * 0.7;
    }
    const bodyNode = P.torso || P.body;
    const kneel = kneeling(this.body) ? 0.3 : 0;
    if (P.hips) P.hips.position.y = 0.95 + Math.abs(sw) * 0.05 - kneel;
    else if (P.body) P.body.position.y = (this.type === 'goblin' ? 0.62 : this.type === 'orc' ? 1.25 : this.type === 'demon' ? 1.3 : 1.55) + Math.abs(sw) * 0.05 - kneel;
    let armR = -sw * 0.5, armL = sw * 0.5;
    if (st === 'windup') armR = -2.2 * wp;
    else if (st === 'recover' && this.t < 0.2) armR = -2.2 + (this.t / 0.2) * 2.6;
    else if (st === 'aim') { armL = -1.5; armR = -1.3 - wp * 0.4; }
    else if (st === 'chargeWindup') { armR = -0.6; armL = -0.6; if (bodyNode) bodyNode.rotation.x = 0.35 * wp; }
    else if (st === 'charging') { armR = 0.8; armL = 0.8; }
    else if (st === 'howl') { armR = -2.6 * wp; armL = -2.6 * wp; if (P.head) P.head.rotation.x = -0.6 * wp; }
    else if (st === 'stagger') { armR = 0.4; armL = 0.4; }
    else if (st === 'flee') { armR = 0.6; armL = 0.6; }
    if (!usable(this.body, 'harm')) armR = 0.3;
    if (!usable(this.body, 'varm')) armL = 0.3;
    if (this.lifted > 0) { armR = -2.8; armL = -2.8; }
    if (st !== 'chargeWindup' && bodyNode) bodyNode.rotation.x += ((st === 'charging' ? 0.4 : 0) - bodyNode.rotation.x) * Math.min(1, dt * 8);
    if (st !== 'howl' && P.head) P.head.rotation.x *= 0.9;
    if (P.armR) {
      P.armR.rotation.x += (armR - P.armR.rotation.x) * Math.min(1, dt * 18);
      P.armL.rotation.x += (armL - P.armL.rotation.x) * Math.min(1, dt * 18);
    }
    if (P.tail) P.tail.rotation.y = Math.sin(this.animT * 3) * 0.4;
    if (this.prone > 0) this.root.rotation.z += (0.9 - this.root.rotation.z) * Math.min(1, dt * 10);
    else if (st === 'stagger' || this.surprised > 0) this.root.rotation.z = Math.sin(this.animT * 30) * 0.06;
    else if (this.lifted <= 0) this.root.rotation.z = 0;
  }
}

