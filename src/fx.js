import * as THREE from 'three';
import { G } from './state.js';

const tmpV = new THREE.Vector3();

// ---------------------------------------------------------------------------
// Partikler: ett Points-objekt per blandemodus, CPU-oppdatert
// ---------------------------------------------------------------------------
class Particles {
  constructor(max, additive) {
    this.max = max;
    this.n = 0;
    this.pos = new Float32Array(max * 3);
    this.col = new Float32Array(max * 3);
    this.size = new Float32Array(max);
    this.alpha = new Float32Array(max);
    this.vel = new Float32Array(max * 3);
    this.life = new Float32Array(max);
    this.maxLife = new Float32Array(max);
    this.s0 = new Float32Array(max);
    this.s1 = new Float32Array(max);
    this.grav = new Float32Array(max);
    this.drag = new Float32Array(max);
    this.sway = new Float32Array(max);
    this.floorStop = new Uint8Array(max);
    this.amul = new Float32Array(max);
    const g = new THREE.BufferGeometry();
    this.aPos = new THREE.BufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage);
    this.aCol = new THREE.BufferAttribute(this.col, 3).setUsage(THREE.DynamicDrawUsage);
    this.aSize = new THREE.BufferAttribute(this.size, 1).setUsage(THREE.DynamicDrawUsage);
    this.aAlpha = new THREE.BufferAttribute(this.alpha, 1).setUsage(THREE.DynamicDrawUsage);
    g.setAttribute('position', this.aPos);
    g.setAttribute('pcolor', this.aCol);
    g.setAttribute('psize', this.aSize);
    g.setAttribute('palpha', this.aAlpha);
    g.setDrawRange(0, 0);
    this.uniforms = { uScale: { value: 400 } };
    const m = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      transparent: true,
      depthWrite: false,
      blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
      vertexShader: `attribute vec3 pcolor; attribute float psize; attribute float palpha; uniform float uScale;
        varying vec3 vC; varying float vA;
        void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); gl_PointSize = psize * uScale / -mv.z; gl_Position = projectionMatrix * mv; vC = pcolor; vA = palpha; }`,
      fragmentShader: `varying vec3 vC; varying float vA;
        void main(){ vec2 c = gl_PointCoord - 0.5; float d = length(c); if (d > 0.5) discard;
          float a = smoothstep(0.5, 0.05, d); gl_FragColor = vec4(vC, a * vA); }`,
    });
    this.points = new THREE.Points(g, m);
    this.points.frustumCulled = false;
    this.points.renderOrder = 5;
    this.geo = g;
  }

  spawn(x, y, z, vx, vy, vz, color, life, s0, s1, grav = 0, drag = 0, sway = 0, floorStop = 0, amul = 1) {
    if (this.n >= this.max) return;
    const i = this.n++;
    this.pos[i * 3] = x; this.pos[i * 3 + 1] = y; this.pos[i * 3 + 2] = z;
    this.vel[i * 3] = vx; this.vel[i * 3 + 1] = vy; this.vel[i * 3 + 2] = vz;
    this.col[i * 3] = color.r; this.col[i * 3 + 1] = color.g; this.col[i * 3 + 2] = color.b;
    this.life[i] = life; this.maxLife[i] = life;
    this.s0[i] = s0; this.s1[i] = s1;
    this.grav[i] = grav; this.drag[i] = drag; this.sway[i] = sway; this.floorStop[i] = floorStop;
    this.amul[i] = amul;
  }

  _kill(i) {
    const j = --this.n;
    if (i === j) return;
    for (let k = 0; k < 3; k++) {
      this.pos[i * 3 + k] = this.pos[j * 3 + k];
      this.vel[i * 3 + k] = this.vel[j * 3 + k];
      this.col[i * 3 + k] = this.col[j * 3 + k];
    }
    this.life[i] = this.life[j]; this.maxLife[i] = this.maxLife[j];
    this.s0[i] = this.s0[j]; this.s1[i] = this.s1[j];
    this.grav[i] = this.grav[j]; this.drag[i] = this.drag[j]; this.sway[i] = this.sway[j]; this.floorStop[i] = this.floorStop[j];
    this.amul[i] = this.amul[j];
  }

  update(dt, t) {
    for (let i = 0; i < this.n; i++) {
      this.life[i] -= dt;
      if (this.life[i] <= 0) { this._kill(i); i--; continue; }
      const k = i * 3;
      const dr = Math.exp(-this.drag[i] * dt);
      this.vel[k] *= dr; this.vel[k + 2] *= dr;
      this.vel[k + 1] = this.vel[k + 1] * dr - this.grav[i] * dt;
      let sx = 0, sz = 0;
      if (this.sway[i]) { sx = Math.sin(t * 5 + i) * this.sway[i]; sz = Math.cos(t * 4.3 + i * 1.7) * this.sway[i]; }
      this.pos[k] += (this.vel[k] + sx) * dt;
      this.pos[k + 1] += this.vel[k + 1] * dt;
      this.pos[k + 2] += (this.vel[k + 2] + sz) * dt;
      if (this.floorStop[i] && this.pos[k + 1] < 0.03) {
        this.pos[k + 1] = 0.03; this.vel[k] *= 0.3; this.vel[k + 2] *= 0.3; this.vel[k + 1] = 0;
      }
      const p = 1 - this.life[i] / this.maxLife[i];
      this.size[i] = this.s0[i] + (this.s1[i] - this.s0[i]) * p;
      this.alpha[i] = Math.min(1, (1 - p) * 2.2) * this.amul[i];
    }
    this.geo.setDrawRange(0, this.n);
    this.aPos.needsUpdate = this.aCol.needsUpdate = this.aSize.needsUpdate = this.aAlpha.needsUpdate = true;
  }
}

// ---------------------------------------------------------------------------
const C = c => new THREE.Color(c);
const COL = {
  blood: C(0x6a0a0a), blood2: C(0x9a1410), bone: C(0xd8ceb0), spark: C(0xffc860), white: C(0xffffff),
  feather: C(0xf2efe6), featherDark: C(0x2a2622), splash: C(0x9fe8d0), dust: C(0x7a7064), heal: C(0x60ff9a),
  rage: C(0xff3a1a), gold: C(0xffd060), fire: C(0xff7a20), ember: C(0xff5010), will: C(0x6a8cff), wood: C(0x6a4a2a),
  poison: C(0x7aff40), smoke: C(0x2a2624),
  csmoke: C(0x8a8680), portal: C(0x6ab4ff), portal2: C(0xc8e4ff), drip: C(0x6ad8a8), tsmoke: C(0x2e2824), dissolve: C(0xff7a2a), ghostly: C(0x6affd0),
};

const SPARK_COL = new Map();

export class FX {
  constructor(scene) {
    this.add = new Particles(2500, true);
    this.norm = new Particles(2500, false);
    scene.add(this.add.points, this.norm.points);
    this.scene = scene;
    this.shake = 0;
    this.decals = [];
    this.decalGeo = new THREE.CircleGeometry(1, 20);
    this.decalGeo.rotateX(-Math.PI / 2);
    this.slashes = [];
    this.telegraphs = [];
    this.floaters = [];
    this.floatRoot = document.getElementById('floaters');
    this.rings = [];
    this.stars = [];
    this.starPool = [];
  }

  // Lysende stjerne der et slag treffer
  impact(p, color = 0xffffff, size = 1.2, y = 1.0) {
    let sp = this.starPool.pop();
    if (!sp) {
      sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: G.gfx.star, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
      sp.renderOrder = 9;
    }
    sp.material.color.set(color);
    sp.material.rotation = Math.random() * Math.PI;
    sp.position.set(p.x + (Math.random() - 0.5) * 0.3, y, p.z + (Math.random() - 0.5) * 0.3);
    sp.userData.t = 0;
    sp.userData.size = size;
    this.scene.add(sp);
    this.stars.push(sp);
  }

  setScale(h, fov) {
    const s = h / (2 * Math.tan((fov * Math.PI) / 360));
    this.add.uniforms.uScale.value = s;
    this.norm.uniforms.uScale.value = s;
  }

  burst(kind, p, n = 12, dir = null) {
    const R = Math.random;
    for (let i = 0; i < n; i++) {
      const a = R() * Math.PI * 2;
      let sp = 2 + R() * 4;
      let vx = Math.cos(a) * sp, vz = Math.sin(a) * sp, vy = 1 + R() * 3;
      if (dir) { vx = vx * 0.5 + dir.x * sp * 1.2; vz = vz * 0.5 + dir.z * sp * 1.2; }
      const y = p.y ?? 1;
      switch (kind) {
        case 'blood':
          this.norm.spawn(p.x, y, p.z, vx, vy + 1, vz, R() < 0.5 ? COL.blood : COL.blood2, 0.6 + R() * 0.5, 0.16, 0.1, 14, 1.5, 0, 1);
          break;
        case 'bone':
          this.norm.spawn(p.x, y, p.z, vx, vy + 2, vz, COL.bone, 0.7 + R() * 0.4, 0.12, 0.08, 16, 1, 0, 1);
          break;
        case 'wood':
          this.norm.spawn(p.x, y, p.z, vx, vy + 2, vz, COL.wood, 0.8 + R() * 0.4, 0.16, 0.1, 16, 1, 0, 1);
          break;
        case 'spark':
          this.add.spawn(p.x, y, p.z, vx * 1.6, vy + 1, vz * 1.6, COL.spark, 0.25 + R() * 0.25, 0.14, 0.02, 10, 3);
          break;
        case 'feather':
          this.norm.spawn(p.x, y + R() * 0.5, p.z, vx * 0.4, 1.5 + R() * 1.5, vz * 0.4, R() < 0.8 ? COL.feather : COL.featherDark, 1.4 + R() * 0.8, 0.2, 0.16, 1.6, 2.5, 0.7, 1);
          break;
        case 'splash':
          this.norm.spawn(p.x, -0.2, p.z, vx * 0.6, 2 + R() * 2.5, vz * 0.6, COL.splash, 0.5 + R() * 0.3, 0.14, 0.05, 12, 1);
          break;
        case 'dust':
          this.norm.spawn(p.x, 0.15, p.z, vx * 0.3, 0.4 + R() * 0.5, vz * 0.3, COL.dust, 0.5 + R() * 0.4, 0.2, 0.55, 0, 3);
          break;
        case 'heal':
          this.add.spawn(p.x + (R() - 0.5) * 0.8, 0.3 + R() * 1.2, p.z + (R() - 0.5) * 0.8, 0, 1.2 + R(), 0, COL.heal, 0.9 + R() * 0.4, 0.18, 0.04, -0.5, 1);
          break;
        case 'will':
          this.add.spawn(p.x + (R() - 0.5) * 0.8, 0.3 + R() * 1.2, p.z + (R() - 0.5) * 0.8, 0, 1.2 + R(), 0, COL.will, 0.9 + R() * 0.4, 0.18, 0.04, -0.5, 1);
          break;
        case 'rage':
          this.add.spawn(p.x + (R() - 0.5) * 0.6, 0.8 + R() * 0.8, p.z + (R() - 0.5) * 0.6, vx * 0.1, 1.5 + R(), vz * 0.1, COL.rage, 0.5 + R() * 0.3, 0.22, 0.05, -1, 2);
          break;
        case 'gold':
          this.add.spawn(p.x, y, p.z, vx * 0.5, vy + 1.5, vz * 0.5, COL.gold, 0.5 + R() * 0.4, 0.12, 0.02, 6, 2);
          break;
        case 'fire':
          this.add.spawn(p.x + (R() - 0.5) * 0.3, y, p.z + (R() - 0.5) * 0.3, (R() - 0.5) * 0.4, 1.2 + R() * 1.4, (R() - 0.5) * 0.4, R() < 0.5 ? COL.fire : COL.ember, 0.5 + R() * 0.5, 0.22, 0.02, -0.4, 1.5);
          break;
        case 'poison':
          this.add.spawn(p.x + (R() - 0.5) * 0.5, y, p.z + (R() - 0.5) * 0.5, 0, 0.6 + R(), 0, COL.poison, 0.5 + R() * 0.3, 0.14, 0.02, -0.5, 1);
          break;
        case 'portal': {
          const a2 = R() * Math.PI * 2, rr = 0.4 + R() * 1.5;
          this.add.spawn(p.x + Math.cos(a2) * rr, 0.1, p.z + Math.sin(a2) * rr, -Math.sin(a2) * 0.8, 1.2 + R() * 1.6, Math.cos(a2) * 0.8, R() < 0.6 ? COL.portal : COL.portal2, 1.2 + R() * 0.8, 0.14, 0.02, -0.3, 0.4);
          break;
        }
        case 'drip':
          this.add.spawn(p.x + (R() - 0.5) * 0.1, p.y, p.z, 0, -0.5, 0, COL.drip, 0.35, 0.07, 0.05, 14, 0, 0, 1);
          break;
        case 'torchsmoke':
          this.norm.spawn(p.x + (R() - 0.5) * 0.15, p.y, p.z + (R() - 0.5) * 0.15, (R() - 0.5) * 0.2, 0.6 + R() * 0.5, (R() - 0.5) * 0.2, COL.tsmoke, 1.8 + R(), 0.3, 1.1, -0.15, 1.2, 0.15, 0, 0.28);
          break;
        case 'dissolve':
          this.add.spawn(p.x + (R() - 0.5) * (p.w || 0.8), (p.y || 0.5) + R() * (p.h || 1.4), p.z + (R() - 0.5) * (p.w || 0.8), (R() - 0.5) * 0.6, 0.8 + R() * 1.4, (R() - 0.5) * 0.6, p.col === 'ghost' ? COL.ghostly : COL.dissolve, 0.6 + R() * 0.6, 0.12, 0.02, -0.6, 1.2, 0.3);
          break;
        case 'step':
          this.norm.spawn(p.x + (R() - 0.5) * 0.3, 0.08, p.z + (R() - 0.5) * 0.3, (R() - 0.5) * 0.6, 0.25 + R() * 0.3, (R() - 0.5) * 0.6, COL.dust, 0.45 + R() * 0.3, 0.14, 0.4, 0, 3);
          break;
        case 'chimney':
          this.norm.spawn(p.x + (R() - 0.5) * 0.2, p.y, p.z + (R() - 0.5) * 0.2, 0.22 + R() * 0.2, 0.65 + R() * 0.35, -0.12 + R() * 0.2, COL.csmoke, 3.6 + R() * 1.6, 0.4, 2.3, -0.08, 0.45, 0.25, 0, 0.32);
          break;
        case 'smoke':
          this.norm.spawn(p.x + (R() - 0.5) * 0.6, y, p.z + (R() - 0.5) * 0.6, vx * 0.15, 0.6 + R() * 0.6, vz * 0.15, COL.smoke, 1.0 + R() * 0.6, 0.4, 1.2, -0.3, 1.5, 0, 0, 0.6);
          break;
      }
    }
  }

  // Glitring rundt gjenstander på bakken
  spark(x, y, z, hex) {
    const c = SPARK_COL.get(hex) || SPARK_COL.set(hex, new THREE.Color(hex).lerp(COL.white, 0.35)).get(hex);
    const R = Math.random;
    this.add.spawn(x, y, z, (R() - 0.5) * 0.15, 0.35 + R() * 0.4, (R() - 0.5) * 0.15, c, 0.8 + R() * 0.6, 0.11, 0.0, -0.05, 0.6, 0.12);
  }

  ember(p) {
    const R = Math.random;
    this.add.spawn(p.x + (R() - 0.5) * 0.2, p.y, p.z + (R() - 0.5) * 0.2, (R() - 0.5) * 0.5, 1 + R() * 1.2, (R() - 0.5) * 0.5, COL.ember, 0.7 + R() * 0.6, 0.06, 0.01, -0.3, 0.5, 0.25);
  }

  decal(x, z, r, color = 0x3a0606, opacity = 0.85) {
    const m = new THREE.MeshStandardMaterial({ color, roughness: 0.25, metalness: 0.1, transparent: true, opacity, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
    const d = new THREE.Mesh(this.decalGeo, m);
    d.position.set(x, 0.015 + Math.random() * 0.01, z);
    d.scale.set(r * (0.8 + Math.random() * 0.4), 1, r * (0.8 + Math.random() * 0.4));
    d.rotation.y = Math.random() * 6.28;
    d.receiveShadow = true;
    d.userData.grow = 0;
    d.userData.target = d.scale.clone();
    d.scale.multiplyScalar(0.2);
    this.scene.add(d);
    this.decals.push(d);
    if (this.decals.length > 140) {
      const old = this.decals.shift();
      this.scene.remove(old);
      old.material.dispose();
    }
  }

  // Hugg-bue i Hades-stil: en ringsektor som feies over
  slash(origin, yaw, range, arc, dir, color = 0xfff0c0, y = 0.9, dur = 0.16) {
    const inner = range * 0.35;
    const geom = new THREE.RingGeometry(inner, range, 28, 1, -Math.PI / 2 - arc / 2, arc);
    const mtl = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      uniforms: {
        uStart: { value: -Math.PI / 2 - arc / 2 }, uArc: { value: arc }, uProg: { value: 0 }, uDir: { value: dir },
        uInner: { value: inner }, uOuter: { value: range }, uAlpha: { value: 1 }, uColor: { value: new THREE.Color(color) },
      },
      vertexShader: `varying vec2 vP; void main(){ vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `varying vec2 vP; uniform float uStart, uArc, uProg, uDir, uInner, uOuter, uAlpha; uniform vec3 uColor;
        void main(){
          float ang = atan(vP.y, vP.x);
          float t = clamp((ang - uStart) / uArc, 0.0, 1.0);
          if (uDir < 0.0) t = 1.0 - t;
          float head = uProg * 1.3;
          float a = smoothstep(head - 0.65, head, t) * step(t, head);
          float r = (length(vP) - uInner) / (uOuter - uInner);
          a *= smoothstep(0.0, 0.55, r) * (1.0 - smoothstep(0.88, 1.0, r));
          gl_FragColor = vec4(uColor * (0.75 + r * 1.15), a * uAlpha * 0.85);
        }`,
    });
    const mesh = new THREE.Mesh(geom, mtl);
    mesh.rotation.x = -Math.PI / 2;
    const grp = new THREE.Group();
    grp.add(mesh);
    grp.position.set(origin.x, y, origin.z);
    grp.rotation.y = yaw;
    grp.renderOrder = 6;
    this.scene.add(grp);
    this.slashes.push({ grp, mtl, geom, t: 0, dur });
  }

  // Ring som utvider seg (virvel, eksplosjon, brøl)
  ring(p, r, color = 0xffd080, dur = 0.35, y = 0.2) {
    const geom = new THREE.RingGeometry(0.85, 1, 48);
    const mtl = new THREE.MeshBasicMaterial({ color, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(geom, mtl);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(p.x, y, p.z);
    this.scene.add(mesh);
    this.rings.push({ mesh, mtl, geom, t: 0, dur, r });
  }

  // Telegraf: rød form på gulvet som fylles opp før angrepet treffer
  telegraph(shape, p, yaw, o) {
    const grp = new THREE.Group();
    grp.position.set(p.x, 0.04, p.z);
    grp.rotation.y = yaw;
    const color = o.color ?? 0xff2a1a;
    const mk = (g, op) => {
      const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: op, depthWrite: false, blending: THREE.AdditiveBlending }));
      m.rotation.x = -Math.PI / 2;
      grp.add(m);
      return m;
    };
    let outline, fill;
    if (shape === 'circle') {
      outline = mk(new THREE.RingGeometry(o.r - 0.08, o.r, 48), 0.55);
      fill = mk(new THREE.CircleGeometry(o.r, 48), 0.22);
    } else if (shape === 'cone') {
      const s = -Math.PI / 2 - o.arc / 2;
      outline = mk(new THREE.RingGeometry(o.r - 0.1, o.r, 32, 1, s, o.arc), 0.6);
      fill = mk(new THREE.CircleGeometry(o.r, 32, s, o.arc), 0.22);
    } else {
      const g1 = new THREE.PlaneGeometry(o.w, o.len);
      g1.translate(0, -o.len / 2, 0);
      const g2 = g1.clone();
      outline = mk(g1, 0.12);
      fill = mk(g2, 0.3);
    }
    fill.scale.set(0.001, 0.001, 0.001);
    this.scene.add(grp);
    const tg = { grp, outline, fill, shape, t: 0, dur: o.dur, done: false };
    this.telegraphs.push(tg);
    return tg;
  }

  endTelegraph(tg) {
    if (!tg || tg.done) return;
    tg.done = true;
    this.scene.remove(tg.grp);
    tg.grp.traverse(o => { if (o.isMesh) { o.geometry.dispose(); o.material.dispose(); } });
  }

  float(text, pos, cls = '', yOff = 1.9) {
    const el = document.createElement('div');
    el.className = 'floater ' + cls;
    el.textContent = text;
    this.floatRoot.appendChild(el);
    this.floaters.push({ el, p: new THREE.Vector3(pos.x + (Math.random() - 0.5) * 0.5, (pos.y || 0) + yOff, pos.z), t: 0, dur: cls.includes('say') ? 2.8 : cls.includes('big') ? 1.3 : 0.9 });
  }

  addShake(a) {
    this.shake = Math.min(1, this.shake + a);
  }

  update(dt, cam) {
    const t = G.time;
    this.add.update(dt, t);
    this.norm.update(dt, t);
    for (const d of this.decals) {
      if (d.userData.grow < 1) {
        d.userData.grow = Math.min(1, d.userData.grow + dt * 3);
        const k = 0.2 + 0.8 * (1 - Math.pow(1 - d.userData.grow, 3));
        d.scale.set(d.userData.target.x * k, 1, d.userData.target.z * k);
      }
    }
    for (let i = this.slashes.length - 1; i >= 0; i--) {
      const s = this.slashes[i];
      s.t += dt;
      const p = s.t / s.dur;
      s.mtl.uniforms.uProg.value = Math.min(1, p);
      s.mtl.uniforms.uAlpha.value = p < 1 ? 1 : Math.max(0, 1 - (p - 1) * 4);
      if (p > 1.25) {
        this.scene.remove(s.grp);
        s.geom.dispose();
        s.mtl.dispose();
        this.slashes.splice(i, 1);
      }
    }
    for (let i = this.stars.length - 1; i >= 0; i--) {
      const sp = this.stars[i];
      sp.userData.t += dt;
      const p = sp.userData.t / 0.16;
      if (p >= 1) { this.scene.remove(sp); this.stars.splice(i, 1); this.starPool.push(sp); continue; }
      const s = sp.userData.size * (0.4 + Math.sin(Math.min(1, p * 1.6) * Math.PI * 0.5) * 0.9) * (1 - p * 0.3);
      sp.scale.set(s, s, 1);
      sp.material.opacity = 1 - p * p;
    }
    for (let i = this.rings.length - 1; i >= 0; i--) {
      const r = this.rings[i];
      r.t += dt;
      const p = r.t / r.dur;
      const s = r.r * (0.3 + 0.7 * (1 - Math.pow(1 - Math.min(1, p), 3)));
      r.mesh.scale.set(s, s, s);
      r.mtl.opacity = Math.max(0, 1 - p);
      if (p >= 1) {
        this.scene.remove(r.mesh);
        r.geom.dispose();
        r.mtl.dispose();
        this.rings.splice(i, 1);
      }
    }
    for (let i = this.telegraphs.length - 1; i >= 0; i--) {
      const tg = this.telegraphs[i];
      if (tg.done) { this.telegraphs.splice(i, 1); continue; }
      tg.t += dt;
      const p = Math.min(1, tg.t / tg.dur);
      if (tg.shape === 'rect') tg.fill.scale.set(1, p, 1);
      else tg.fill.scale.set(p, p, 1);
      tg.outline.material.opacity = 0.35 + 0.35 * Math.sin(tg.t * 30) * 0.5 + 0.2;
    }
    // flytende tekst (DOM)
    const w = innerWidth, h = innerHeight;
    for (let i = this.floaters.length - 1; i >= 0; i--) {
      const f = this.floaters[i];
      f.t += dt;
      const p = f.t / f.dur;
      if (p >= 1) { f.el.remove(); this.floaters.splice(i, 1); continue; }
      tmpV.copy(f.p);
      tmpV.y += p * 1.1;
      tmpV.project(cam);
      const sx = (tmpV.x * 0.5 + 0.5) * w, sy = (-tmpV.y * 0.5 + 0.5) * h;
      const sc = p < 0.15 ? 0.6 + p / 0.15 * 0.6 : 1.2 - Math.min(0.2, (p - 0.15) * 0.6);
      f.el.style.transform = `translate(${sx}px, ${sy}px) translate(-50%, -50%) scale(${sc})`;
      f.el.style.opacity = p > 0.7 ? (1 - p) / 0.3 : 1;
    }
    this.shake = Math.max(0, this.shake - dt * 2.2);
  }

  clearLevel() {
    for (const d of this.decals) { this.scene.remove(d); d.material.dispose(); }
    this.decals = [];
    for (const tg of this.telegraphs) this.endTelegraph(tg);
    this.telegraphs = [];
    for (const f of this.floaters) f.el.remove();
    this.floaters = [];
    for (const sp of this.stars) { this.scene.remove(sp); this.starPool.push(sp); }
    this.stars = [];
    this.add.n = 0;
    this.norm.n = 0;
  }
}
