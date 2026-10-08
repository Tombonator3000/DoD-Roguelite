import * as THREE from 'three';
import { G } from './state.js';
import { skillRoll, rollDice } from './rules.js';
import { buildHound } from './kinmodels.js';

// Följeslagare: jegerens hund. Følger deg, speider og angriper når du ber om det (3 VP).
export class Companion {
  constructor(x, z) {
    const m = buildHound();
    this.root = m.root;
    this.parts = m.parts;
    this.fx = m.fx;
    this.root.position.set(x, 0, z);
    G.scene.add(this.root);
    if (G.gfx) { this.blob = G.gfx.blobFor(0.45, 0.5); this.root.add(this.blob); }
    this.pos = this.root.position;
    this.vel = new THREE.Vector3();
    this.yaw = 0;
    this.maxKP = this.kp = 10;
    this.skill = 12;
    this.alive = true;
    this.target = null;
    this.attackT = 0;
    this.orderT = 0;
    this.animT = 0;
    this.flash = 0;
    this.scared = 0;
  }

  dispose() {
    G.scene.remove(this.root);
  }

  order(target) {
    this.target = target;
    this.orderT = 10;
    G.audio.grunt(1.4);
    G.fx.float('Ta den!', this.pos, 'rage', 1.4);
  }

  scare() {
    this.scared = 3;
  }

  takeHit(n, who) {
    if (!this.alive) return;
    if (G.player.fx.livvakt > 0) { G.fx.float('Livvakt', this.pos, 'miss', 1.2); return; }
    this.kp -= n;
    this.flash = 0.15;
    G.fx.float('-' + n, this.pos, 'hurt', 1.2);
    G.fx.burst('blood', { x: this.pos.x, y: 0.5, z: this.pos.z }, 6);
    if (this.kp <= 0) {
      this.alive = false;
      G.ui.log(`Hunden blir liggende etter ${who || 'slaget'}. Den kommer seg til neste nivå, men ikke nå.`);
      this.root.rotation.z = 1.4;
      setTimeout(() => this.dispose(), 1500);
    }
  }

  update(dt) {
    if (!this.alive) return;
    this.animT += dt;
    this.flash = Math.max(0, this.flash - dt);
    for (const u of this.fx) u.uFlash.value = this.flash > 0 ? 1.4 : 0;
    const P = G.player;
    this.orderT -= dt;
    this.scared -= dt;
    if (this.target && (this.target.dead || this.orderT <= 0)) this.target = null;
    let goal = null, speed = 6.8;
    if (this.scared > 0) {
      goal = new THREE.Vector3(P.pos.x - Math.sin(P.yaw) * 2, 0, P.pos.z - Math.cos(P.yaw) * 2);
    } else if (this.target) {
      goal = this.target.pos;
      speed = 8;
      const dd = Math.hypot(goal.x - this.pos.x, goal.z - this.pos.z);
      this.attackT -= dt;
      if (dd < this.target.radius + 0.9 && this.attackT <= 0) {
        this.attackT = 1.1;
        const r = skillRoll(this.skill);
        r.skill = 'Bett';
        const e = this.target;
        if (r.success) {
          const dir = new THREE.Vector3(e.pos.x - this.pos.x, 0, e.pos.z - this.pos.z).normalize();
          const got = e.takeHit(rollDice(r.drake ? '2D8' : 'D8'), dir, 3, { type: 'p', stun: 0.2 });
          G.ui.logRoll(r, `Hunden biter ${e.def.name.toLowerCase()}, ${got} skade.`);
        } else G.ui.logRoll(r, 'Hunden bommer.');
        G.audio.grunt(1.5);
      }
    } else {
      // følg etter, litt bak og til siden
      const side = new THREE.Vector3(Math.cos(P.yaw), 0, -Math.sin(P.yaw));
      goal = new THREE.Vector3(P.pos.x - Math.sin(P.yaw) * 1.6 + side.x * 1.2, 0, P.pos.z - Math.cos(P.yaw) * 1.6 + side.z * 1.2);
    }
    const to = new THREE.Vector3(goal.x - this.pos.x, 0, goal.z - this.pos.z);
    const dist = to.length();
    const want = dist > 0.6 ? to.normalize().multiplyScalar(Math.min(speed, dist * 3)) : new THREE.Vector3();
    if (dist > 6 && !this.target && !G.dungeon.los(this.pos.x, this.pos.z, P.pos.x, P.pos.z)) {
      G.dungeon.flowDir(this.pos.x, this.pos.z, want);
      want.multiplyScalar(speed);
    }
    if (dist > 22) { this.pos.set(P.pos.x - 1, 0, P.pos.z - 1); }
    this.vel.lerp(want, 1 - Math.exp(-8 * dt));
    this.pos.x += this.vel.x * dt;
    this.pos.z += this.vel.z * dt;
    G.dungeon.collide(this.pos, 0.35);
    if (this.vel.lengthSq() > 0.3) this.yaw = Math.atan2(this.vel.x, this.vel.z);
    else if (this.target) this.yaw = Math.atan2(this.target.pos.x - this.pos.x, this.target.pos.z - this.pos.z);
    this.root.rotation.y = this.yaw;
    const inWater = G.dungeon.isWater(this.pos.x, this.pos.z);
    this.root.position.y += ((inWater ? -0.3 : 0) - this.root.position.y) * Math.min(1, dt * 10);
    // speider: avslører kartet rundt seg
    G.dungeon.reveal(this.pos.x, this.pos.z, 5);
    const sp = Math.min(1, this.vel.length() / 6);
    const t = this.animT * 14;
    this.parts.legs.forEach((l, i) => (l.rotation.x = Math.sin(t + i * Math.PI * 0.5) * 0.7 * sp));
    this.parts.tail.rotation.y = Math.sin(this.animT * (this.target ? 4 : 9)) * 0.6;
    this.parts.body.position.y = 0.5 + Math.abs(Math.sin(t)) * 0.04 * sp;
  }
}
