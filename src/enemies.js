import * as THREE from 'three';
import { G } from './state.js';
import { skillRoll, rollDice, d, doubleDice, tStr } from './rules.js';
import { armorTypeBonus } from './dod.js';
import { buildRat, buildSkeleton, buildGoblin, buildOrc, buildFox } from './assets.js';
import { buildDemon } from './kinmodels.js';

// Fiendene. NPC-er (rotte, skjelett, goblin, orch) slår mot sin ferdighet og kan pareres.
// Monstre (Rødpels, demonen) treffer alltid når du står i formen, men kan undvikas. De har en angrepstabell (T6).
export const DEFS = {
  rat: {
    name: 'Kloakkråtta', kp: 4, armor: 0, skill: 10, dmg: 'D4', type: 'p', weapon: 'bett', speed: 5.0, radius: 0.36, aggro: 9,
    range: 1.3, windup: 0.4, recover: 0.6, shape: 'circle', sr: 1.15, silver: [0, 2], build: buildRat,
    sick: 0.35, swim: true, interrupt: true, bounty: 1, beast: true, defend: { kind: 'dodge', chance: 0.12 },
    lore: 'Kloakkråtter bærer sykdom. Et bitt kan gjøre deg Krasslig hvis du ikke klarer et FYS-slag.',
  },
  skeleton: {
    name: 'Skelett', kp: 9, armor: 2, armorType: 'lader', skill: 10, dmg: 'D10', type: 's', weapon: 'kortsvärd', dur: 12, speed: 2.7, radius: 0.5, aggro: 10,
    range: 1.9, windup: 0.62, recover: 0.8, shape: 'cone', sr: 2.5, arc: 1.7, silver: [1, 4], build: buildSkeleton,
    interrupt: true, bones: true, bounty: 2, undead: true, fearImmune: true, resist: { p: 0.5 }, defend: { kind: 'parry', chance: 0.22 },
    lore: 'Skjeletter tar halv skade av stikkvåpen. Hugg og kross virker best. Bannlysa biter på dem.',
  },
  goblin: {
    name: 'Goblinbågskytt', kp: 7, armor: 1, armorType: 'lader', skill: 11, dmg: 'D10', type: 'p', weapon: 'kortbåge', speed: 3.7, radius: 0.42, aggro: 13,
    ranged: true, pref: 7.5, windup: 0.85, recover: 1.0, silver: [2, 5], build: buildGoblin, interrupt: true, bounty: 2, defend: { kind: 'dodge', chance: 0.25 },
    lore: 'Goblinbueskyttere holder avstand. Gå tett på, så blir de nervøse.',
  },
  orc: {
    name: 'Orch', kp: 15, armor: 2, armorType: 'lader', skill: 12, dmg: '2D6', type: 's', weapon: 'sabel', dur: 12, speed: 3.0, radius: 0.72, aggro: 11,
    range: 2.3, windup: 0.8, recover: 0.95, shape: 'cone', sr: 3.0, arc: 1.9, charge: true, silver: [3, 8],
    build: buildOrc, interrupt: false, bounty: 4, defend: { kind: 'parry', chance: 0.28 },
    lore: 'Orcher bærer nitläder: krossvåpen gjør mindre, stikk og hugg mer. De stanger når du holder avstand.',
  },
  boss: {
    name: 'Rødpels', kp: 80, armor: 3, skill: 14, dmg: '2D8', type: 's', weapon: 'långsvärd', speed: 3.9, radius: 1.0, aggro: 26,
    range: 2.9, windup: 0.68, recover: 0.55, shape: 'cone', sr: 3.7, arc: 2.2, silver: [40, 60], build: buildFox,
    boss: true, monster: true, interrupt: false, bounty: 25, fearImmune: true, ferocity: 2,
    lore: 'Rødpels er et monster med handlingskraft 2: han handler to ganger for hver gang du blinker. Angrepene hans treffer alltid, men kan undvikas. Bare sverdhuggene kan pareres.',
  },
  demon: {
    name: 'Demon', kp: 26, armor: 3, skill: 15, dmg: '2D8', type: 's', weapon: 'klør', speed: 4.2, radius: 0.8, aggro: 40,
    range: 2.4, windup: 0.6, recover: 0.6, shape: 'cone', sr: 3.0, arc: 2.0, silver: [10, 20], build: buildDemon,
    monster: true, undead: true, fearImmune: true, interrupt: false, bounty: 10, ferocity: 2,
    lore: 'En demon fra den andre siden. Overjordisk: Bannlysa virker. Klørne treffer alltid hvis du ikke dukker.',
  },
};

// Rødpels' angrepstabell (T6). Samme angrep to ganger på rad gir det neste i tabellen.
const BOSS_ATTACKS = [
  { name: 'Kongelig vrål', fear: true },
  { name: 'Feiende hugg', shape: 'circle', r: 3.6, dmg: '2D10', type: 's', parry: true },
  { name: 'Revesprang', charge: true, dmg: '3D6', type: 'b', knock: true },
  { name: 'Bitt', shape: 'cone', r: 3.0, arc: 1.3, dmg: '2D10', type: 'p', hold: true },
  { name: 'Haleslag', shape: 'circle', r: 4.2, dmg: '2D8', type: 'b', knock: true },
  { name: 'Kongelig kombinasjon', shape: 'cone', r: 3.7, arc: 2.2, dmg: '2D10', type: 's', parry: true, combo: 2 },
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
    const scale = this.def.boss || this.def.monster ? 1 : 1 + 0.18 * (depth - 1);
    this.maxKP = this.kp = Math.round(this.def.kp * scale);
    this.skill = this.def.skill + Math.floor((depth - 1) / 2);
    this.armor = this.def.armor;
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
    this.weaponBroken = false;
    this.home = new THREE.Vector3(x, 0, z);
    this.defTokens = this.def.ferocity || 0;
    this.defTimer = 0;
    if (this.def.boss) {
      this.summons = [0.66, 0.33];
      this.combo = 0;
      this.intro = false;
      this.lastAtk = -1;
    }
  }

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
    G.game.onEnemiesAlerted?.(flock, cause);
  }

  setState(s) {
    this.state = s;
    this.t = 0;
  }

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
    const prey = this === G.player.prey;
    this.fx.forEach((u, i) => {
      u.uFlash.value = this.flash > 0 ? 1.6 : tint;
      if (this.frozen > 0) u.uRim.value.setRGB(0.3, 0.7, 1.2);
      else if (prey) u.uRim.value.setRGB(1.2, 0.2, 0.1);
      else u.uRim.value.copy(this.baseRim[i]);
    });
    this.cd -= dt;
    this.t += dt;
    if (this.surprised > 0) this.surprised -= dt;
    if (this.def.ferocity) {
      this.defTimer += dt;
      if (this.defTimer > 3) { this.defTimer = 0; this.defTokens = this.def.ferocity + (this.kp < this.maxKP * 0.5 ? 1 : 0); }
    }
    // skade over tid
    for (let i = this.dots.length - 1; i >= 0; i--) {
      const dt0 = this.dots[i];
      dt0.t -= dt;
      if (Math.random() < dt * 10) G.fx.burst(dt0.kind === 'burn' ? 'fire' : 'poison', { x: this.pos.x, y: 0.6, z: this.pos.z }, 1);
      if (dt0.t <= 0) {
        dt0.t = 1;
        dt0.ticks--;
        const dmg = dt0.kind === 'burn' ? d(4) : d(2);
        this.kp -= dmg;
        this.flash = 0.06;
        G.fx.float(String(dmg), this.pos, dt0.kind === 'burn' ? 'burn' : 'poison');
        if (this.kp <= 0) { this.die(); return true; }
        if (dt0.ticks <= 0) this.dots.splice(i, 1);
      }
    }
    // magiske tilstander
    if (this.lifted > 0) return this.updateLifted(dt);
    if (this.frozen > 0) {
      this.frozen -= dt;
      this.frozenTick = (this.frozenTick || 0) + dt;
      if (this.frozenTick > 1) { this.frozenTick = 0; if (skillRoll(this.skill).success && Math.random() < 0.4) this.frozen = 0; }
      if (Math.random() < dt * 6) G.fx.burst('splash', { x: this.pos.x, y: 1, z: this.pos.z }, 1);
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
      if (this.rootTick > 1.5) {
        this.rootTick = 0;
        const r = skillRoll(10, { boon: this.rootPL === 1 ? 1 : 0, bane: this.rootPL === 3 ? 1 : 0 });
        if (r.success) { this.rooted = 0; G.fx.float('Løs', this.pos, 'miss'); }
      }
      if (Math.random() < dt * 4) G.fx.burst('poison', { x: this.pos.x, y: 0.2, z: this.pos.z }, 1);
    }

    const P = G.player;
    const toP = tmp.set(P.pos.x - this.pos.x, 0, P.pos.z - this.pos.z);
    const dist = toP.length();
    const sneaking = P.stealth > 0;
    const aggroR = sneaking ? 2.6 : this.def.aggro;
    const canSee = dist < aggroR && G.dungeon.los(this.pos.x, this.pos.z, P.pos.x, P.pos.z);
    if (canSee) this.lastSeen.copy(P.pos);
    const playerOut = P.downed || P.dead;
    desired.set(0, 0, 0);
    let speed = this.def.speed * (this.def.boss && this.kp < this.maxKP * 0.5 ? 1.2 : 1);
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
        if (canSee && !playerOut) this.alert('sight');
        if (this.def.boss && dist < 15 && !this.intro) this.bossIntro();
        break;
      }
      case 'search': {
        tmp2.set(this.lastSeen.x - this.pos.x, 0, this.lastSeen.z - this.pos.z);
        if (tmp2.length() < 1 || this.t > 4) { this.alerted = false; this.setState('idle'); break; }
        desired.copy(tmp2.normalize()).multiplyScalar(0.6);
        faceTarget = this.lastSeen;
        if (canSee && !sneaking) this.setState('chase');
        break;
      }
      case 'chase': {
        if (playerOut) { desired.set(0, 0, 0); break; }
        if (sneaking && dist > 3.5 && !this.def.boss) { this.setState('search'); break; }
        faceTarget = P.pos;
        if (this.def.boss) { this.bossThink(dist, canSee); break; }
        if (this.def.ranged) {
          if (dist < this.def.pref - 2.5 && canSee) {
            desired.copy(toP).normalize().multiplyScalar(-1);
          } else if (dist > this.def.pref + 2 || !canSee) {
            this.pathTo(P.pos, dist, canSee);
          } else {
            desired.set(-toP.z, 0, toP.x).normalize().multiplyScalar(Math.sin(this.animT * 0.8) * 0.5);
            if (this.cd <= 0) this.startAim();
          }
        } else {
          if (this.def.charge && this.cd <= 0 && dist > 4.5 && dist < 9 && canSee && Math.random() < dt * 2 && this.rooted <= 0) {
            this.startCharge(8, 1.6);
          } else if (dist < this.def.range + P.radius && this.cd <= 0) {
            this.startWindup();
          } else if (dist > this.def.range * 0.7) {
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
          const atk = this.chargeAtk || { dmg: this.def.dmg, type: 'b' };
          if (this.def.monster) this.monsterHit(atk, 'ramler inn i');
          else this.attackPlayer(atk.dmg, 'ramler inn i', { type: 'b' });
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
      if (this.rooted > 0) desired.set(0, 0, 0);
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
    } else if (this.vel.lengthSq() > 0.5 && this.state === 'idle') {
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

  // --- magiske tilstander --------------------------------------------------

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
  root(sec, pl) {
    this.rooted = sec;
    this.rootPL = pl;
    this.rootTick = 0;
    G.fx.float('Fanget', this.pos, 'cond', 2.2);
    G.fx.burst('poison', { x: this.pos.x, y: 0.2, z: this.pos.z }, 18);
  }
  lift(sec, pl) {
    this.lifted = sec;
    this.liftPL = pl;
    this.liftT = 0;
    G.fx.endTelegraph(this.tg);
    this.tg = null;
    this.setState('chase');
    G.fx.float('Løftet', this.pos, 'cond', 2.4);
  }
  updateLifted(dt) {
    this.lifted -= dt;
    this.liftT += dt;
    const h = Math.min(2.2, this.liftT * 4);
    this.root.position.y = h + Math.sin(this.liftT * 6) * 0.08;
    this.root.rotation.z = Math.sin(this.liftT * 3) * 0.3;
    this.vel.set(0, 0, 0);
    if (Math.random() < dt * 8) G.fx.burst('will', { x: this.pos.x, y: h, z: this.pos.z }, 1);
    if (this.lifted <= 0) {
      this.lifted = 0;
      this.root.position.y = 0;
      this.root.rotation.z = 0;
      G.fx.burst('dust', this.pos, 12);
      G.fx.addShake(0.2);
      this.takeHit(rollDice(`${this.liftPL}D6`), new THREE.Vector3(), 0, { stun: 1, ignoreArmor: true, src: 'player' });
    }
    this.animate(dt);
    return true;
  }

  // --- forsvar: parera eller undvika spillerens angrep ---------------------

  tryDefend(r, o) {
    if (this.dead || this.frozen > 0 || this.asleep > 0 || this.lifted > 0 || this.surprised > 0) return null;
    if (['windup', 'aim', 'chargeWindup', 'charging', 'stagger', 'howl'].includes(this.state)) return null;
    let kind, value;
    if (this.def.monster) {
      // monstre: undvika eller parera mot 15, koster en handling
      if (this.defTokens <= 0 || Math.random() > 0.3) return null;
      this.defTokens--;
      kind = o.ranged ? 'dodge' : Math.random() < 0.5 ? 'parry' : 'dodge';
      value = 15;
    } else {
      const df = this.def.defend;
      if (!df || Math.random() > df.chance) return null;
      kind = df.kind === 'parry' && o.ranged ? 'dodge' : df.kind;
      if (kind === 'parry' && o.ranged) return null;
      value = this.skill;
    }
    const rr = skillRoll(value, { bane: this.weaponBroken && kind === 'parry' ? 1 : 0 });
    const ok = rr.success && (!r.drake || rr.drake);
    this.cd = Math.max(this.cd, 0.9);
    if (!ok) return null;
    G.fx.float(kind === 'parry' ? 'Parerad' : 'Undviker', this.pos, 'miss', 2.2);
    if (kind === 'parry') {
      G.fx.burst('spark', { x: this.pos.x, y: 1.2, z: this.pos.z }, 8);
      G.audio.hit(false);
      // brytvärde
      const dmg = rollDice(o.dice);
      const t = o.types?.includes('p') && o.types.length === 1;
      if (this.def.dur && !t && dmg > this.def.dur && !this.weaponBroken) {
        this.weaponBroken = true;
        G.fx.float('Våpenet brekker', this.pos, 'demon');
        G.ui.log(`${this.def.name}s ${this.def.weapon} tåler ikke slaget (${dmg} mot brytvärde ${this.def.dur}).`);
      }
    } else {
      tmp.set(this.pos.x - G.player.pos.x, 0, this.pos.z - G.player.pos.z).normalize();
      this.vel.addScaledVector(tmp, 6);
    }
    return kind;
  }

  // --- angrep ------------------------------------------------------------

  startWindup(o = {}) {
    this.setState('windup');
    const P = G.player;
    this.yaw = angleTo(this.pos, P.pos);
    const enraged = this.def.boss && this.kp < this.maxKP * 0.5;
    this.windupDur = (o.windup || this.def.windup) * (enraged ? 0.82 : 1);
    this.atk = { shape: o.shape || this.def.shape, r: o.r || this.def.sr, arc: o.arc || this.def.arc, dmg: o.dmg || this.def.dmg, type: o.type || this.def.type, monster: o.monster, parry: o.parry, knock: o.knock, hold: o.hold, name: o.name };
    this.tg = G.fx.telegraph(this.atk.shape, this.pos, this.yaw, { r: this.atk.r, arc: this.atk.arc, dur: this.windupDur, color: o.monster ? 0xff6a10 : undefined });
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
    const C = G.companion;
    if (C?.alive && this.inShape(atk, C.pos, 0.4)) C.takeHit(rollDice(atk.dmg), this.def.name);
    if (this.inShape(atk)) {
      if (atk.monster) this.monsterHit(atk, atk.name ? `(${atk.name}) treffer` : 'treffer');
      else this.attackPlayer(atk.dmg, this.type === 'rat' ? 'biter' : 'treffer', { type: atk.type });
    }
    this.setState('recover');
    this.recoverDur = this.def.recover;
    // én handling per runde: NPC-er venter litt mellom anfallene
    this.cd = this.def.recover + 0.9 + Math.random() * 0.9;
    if (this.def.ferocity) { this.cd *= 0.45; this.recoverDur *= 0.7; }
    if (this.combo > 0) {
      this.combo--;
      this.recoverDur = 0.12;
      this.cd = 0;
      this.nextCombo = true;
    }
  }

  // NPC-angrep: slå mot ferdigheten. Treff kan undvikas eller pareras.
  attackPlayer(dmgDice, verb, o = {}) {
    const P = G.player;
    if (P.downed || P.dead) return;
    let bane = 0;
    if (this.weaponBroken) bane++;
    if (P.fx.tonkonst > 0 && Math.hypot(P.pos.x - this.pos.x, P.pos.z - this.pos.z) <= (P.fx.tonkonstR || 10)) bane++;
    const r = skillRoll(this.skill, { bane });
    r.skill = this.def.weapon;
    const nm = this.def.name;
    if (r.demon) {
      G.fx.float('DEMON!', this.pos, 'demon');
      const n = d(3);
      if (n === 1) { G.ui.logRoll(r, `${nm} slår en Demon og mister fotfestet.`, true); this.setState('stagger'); this.stunDur = 1.2; }
      else if (n === 2) { G.ui.logRoll(r, `${nm} slår en Demon og blottar seg. Neste anfall mot den blir et smyganfall.`, true); this.surprised = 1.5; }
      else { const dmg = rollDice(dmgDice); this.kp -= dmg; G.fx.float(String(dmg), this.pos, 'dmg'); G.ui.logRoll(r, `${nm} slår en Demon og treffer seg selv (${dmg}).`, true); if (this.kp <= 0) this.die(); }
      return;
    }
    if (!r.success) {
      G.fx.float('Bom', P.pos, 'miss');
      G.ui.logRoll(r, `${nm} bommer.`, true);
      return;
    }
    let value = rollDice(r.drake ? doubleDice(dmgDice) : dmgDice);
    if (r.drake) G.fx.float('DRAKE!', this.pos, 'edrake');
    P.receiveAttack({
      src: this, value, dmg: dmgDice, type: o.type || this.def.type, drake: r.drake, roll: r, ranged: !!o.ranged,
      noDodge: !!o.noDodge, noParry: !!o.noParry,
      verb: `${verb}${r.drake ? ' med full kraft' : ''}`,
      after: real => this.afterHit(real, r),
    });
  }

  afterHit(real) {
    const P = G.player;
    if (real <= 0) return;
    if (this.def.sick && Math.random() < this.def.sick && !P.hasCond('KRA')) {
      // sykdom: FYS-slag eller Krasslig
      const r = P.roll('FYS', { noArmed: true });
      if (!r.success) { G.ui.logRoll(r, 'Rottebittet blir betent.'); P.addCond('KRA'); }
    }
  }

  // Monsterangrep: treffer alltid, kan undvikas, kan bare pareres hvis det står
  monsterHit(atk, verb) {
    const P = G.player;
    if (P.downed || P.dead) return;
    const value = rollDice(atk.dmg);
    P.receiveAttack({
      src: this, value, dmg: atk.dmg, type: atk.type, monster: true, parryable: !!atk.parry, noParry: !atk.parry && !P.has('skoldblockad'),
      verb,
      after: real => {
        if (atk.knock && !P.tricks?.has('bromsafall') && !P.downed) {
          P.action = { type: 'knockdown', t: 0, dur: 0.8 };
          P.tilt.rotation.x = -0.6;
          G.fx.float('Slått overende', P.pos, 'cond');
        }
        if (atk.hold && real > 0 && !P.downed) {
          P.action = { type: 'stuck', t: 0, dur: 99 };
          G.fx.float('Fasthold', P.pos, 'cond');
        }
      },
    });
  }

  freeAttack() {
    G.ui.log(`${this.def.name} får et frislag.`, 'enemy');
    if (this.def.monster) this.monsterHit({ dmg: this.def.dmg, type: this.def.type }, 'får frislag mot');
    else this.attackPlayer(this.def.dmg, 'får frislag mot', { noDodge: true, noParry: true });
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
      this.startWindup({ windup: 0.42, arc: a.arc, r: a.r, dmg: a.dmg, type: a.type, monster: true, parry: true, name: a.name });
      return;
    }
    if (this.cd > 0) {
      this.pathTo(G.player.pos, dist, canSee);
      return;
    }
    // slå T6 på angrepstabellen, ikke samme to ganger
    let n = d(6) - 1;
    if (n === this.lastAtk) n = (n + 1) % 6;
    // på avstand: sprang eller vrål, ellers gå nærmere
    if (dist > 4.5) {
      if (canSee && dist < 12 && (n === 2 || n === 0 || Math.random() < 0.4)) n = n === 0 ? 0 : 2;
      else { this.pathTo(G.player.pos, dist, canSee); return; }
    }
    this.lastAtk = n;
    const a = BOSS_ATTACKS[n];
    if (a.fear) this.startHowl(false);
    else if (a.charge) this.startCharge(12, 2.2, { dmg: a.dmg, type: a.type, knock: true, name: a.name });
    else {
      if (a.combo) this.combo = hp < 0.5 ? 2 : 1;
      this.startWindup({ shape: a.shape, r: a.r, arc: a.arc, dmg: a.dmg, type: a.type, monster: true, parry: a.parry, knock: a.knock, hold: a.hold, name: a.name, windup: a.shape === 'circle' ? 0.8 : undefined });
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
    if (P.pos.distanceTo(this.pos) < 12 && !P.downed) P.fearCheck(this);
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

  // --- skade ----------------------------------------------------------------

  takeHit(dmg, dir, knock, o = {}) {
    if (this.dead) return 0;
    let armor = o.ignoreArmor ? 0 : Math.max(0, this.armor + armorTypeBonus(this.def.armorType, o.type) - (o.armorMinus || 0));
    let real = Math.max(0, dmg - armor);
    if (this.def.resist?.[o.type] && real > 0) real = Math.ceil(real * this.def.resist[o.type]);
    this.alert('hit');
    this.asleep = 0;
    if (real <= 0) {
      G.fx.float('Prell', this.pos, 'miss');
      G.fx.burst('spark', { x: this.pos.x, y: 1, z: this.pos.z }, 6);
      return 0;
    }
    this.kp -= real;
    this.flash = 0.12;
    G.run.damageDealt += real;
    G.fx.float(String(real), this.pos, o.crit ? 'crit big' : 'dmg', this.def.boss ? 3.2 : this.type === 'rat' ? 1.0 : 1.9);
    G.fx.burst(this.def.bones ? 'bone' : 'blood', { x: this.pos.x, y: this.type === 'rat' ? 0.4 : 1.1, z: this.pos.z }, o.crit ? 16 : 8, dir);
    const kres = this.def.boss ? 0.12 : this.type === 'orc' || this.type === 'demon' ? 0.45 : 1;
    if (this.rooted <= 0) this.vel.addScaledVector(dir, knock * kres);
    const winding = this.state === 'windup' || this.state === 'aim' || this.state === 'chargeWindup';
    if (!this.def.boss && (this.def.interrupt || o.crit || o.stun || o.forceStagger)) {
      if (winding) { G.fx.endTelegraph(this.tg); this.tg = null; }
      if (winding || o.stun || this.state === 'chase') {
        this.setState('stagger');
        this.stunDur = o.stun || (o.crit ? 0.5 : 0.2);
        if (o.stun >= 0.7) G.fx.float('Lammet', this.pos, 'cond', 2.4);
      }
    }
    if (this.kp <= 0) this.die();
    else if (this.def.boss) G.ui.showBoss(this);
    return real;
  }

  addDot(kind) {
    const ex = this.dots.find(x => x.kind === kind);
    if (ex) { ex.ticks = Math.max(ex.ticks, kind === 'burn' ? 3 : 5); return; }
    this.dots.push({ kind, ticks: kind === 'burn' ? 3 : 5, t: 1 });
    G.fx.float(kind === 'burn' ? 'Brann' : 'Gift', this.pos, kind === 'burn' ? 'burn' : 'poison', 2.3);
  }

  die() {
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
    if (P.mods.leech) P.heal(P.mods.leech, true);
    if (P.prey === this) { P.prey = null; G.ui.log('Byttet er felt.'); }
    G.world.dropLoot(this);
    if (this.def.boss) {
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
        goblin: 'Goblinen slipper buen.',
        orc: 'Orchen dundrer i bakken.',
        demon: 'Demonen sprekker i glør og svovel. Det lukter brent hår lenge etterpå.',
      };
      if (Math.random() < 0.35 || this.type === 'demon') G.ui.log(lines[this.type]);
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
    if (P.hips) P.hips.position.y = 0.95 + Math.abs(sw) * 0.05;
    else if (P.body) P.body.position.y = (this.type === 'goblin' ? 0.62 : this.type === 'orc' ? 1.25 : this.type === 'demon' ? 1.3 : 1.55) + Math.abs(sw) * 0.05;
    let armR = -sw * 0.5, armL = sw * 0.5;
    if (st === 'windup') armR = -2.2 * wp;
    else if (st === 'recover' && this.t < 0.2) armR = -2.2 + (this.t / 0.2) * 2.6;
    else if (st === 'aim') { armL = -1.5; armR = -1.3 - wp * 0.4; }
    else if (st === 'chargeWindup') { armR = -0.6; armL = -0.6; if (bodyNode) bodyNode.rotation.x = 0.35 * wp; }
    else if (st === 'charging') { armR = 0.8; armL = 0.8; }
    else if (st === 'howl') { armR = -2.6 * wp; armL = -2.6 * wp; if (P.head) P.head.rotation.x = -0.6 * wp; }
    else if (st === 'stagger') { armR = 0.4; armL = 0.4; }
    if (this.lifted > 0) { armR = -2.8; armL = -2.8; }
    if (st !== 'chargeWindup' && bodyNode) bodyNode.rotation.x += ((st === 'charging' ? 0.4 : 0) - bodyNode.rotation.x) * Math.min(1, dt * 8);
    if (st !== 'howl' && P.head) P.head.rotation.x *= 0.9;
    if (P.armR) {
      P.armR.rotation.x += (armR - P.armR.rotation.x) * Math.min(1, dt * 18);
      P.armL.rotation.x += (armL - P.armL.rotation.x) * Math.min(1, dt * 18);
    }
    if (P.tail) P.tail.rotation.y = Math.sin(this.animT * 3) * 0.4;
    if (st === 'stagger' || this.surprised > 0) this.root.rotation.z = Math.sin(this.animT * 30) * 0.06;
    else if (this.lifted <= 0) this.root.rotation.z = 0;
  }
}
void tStr;
