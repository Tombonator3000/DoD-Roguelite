import * as THREE from 'three';
import { G, T } from './state.js';
import { WALL, FLOOR, WATER, PILLAR } from './dungeon.js';
import { shaftMaterial } from './gfx.js';

// ---------------------------------------------------------------------------
// Svevende støvkorn: posisjonene pakkes rundt et senter i vertex-shaderen,
// så CPU-en gjør ingenting per frame utover å sette uniformer.
// ---------------------------------------------------------------------------
export function makeMotes(count, box, color, size = 0.06, wrapAround = true) {
  const pos = new Float32Array(count * 3);
  const rnd = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (Math.random() - 0.5) * box.x;
    pos[i * 3 + 1] = Math.random() * box.y;
    pos[i * 3 + 2] = (Math.random() - 0.5) * box.z;
    rnd[i] = Math.random();
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('rnd', new THREE.BufferAttribute(rnd, 1));
  const m = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uCenter: { value: new THREE.Vector3() },
      uBox: { value: box.clone() },
      uScale: { value: 400 },
      uSize: { value: size },
      uColor: { value: new THREE.Color(color) },
      uWrap: { value: wrapAround ? 1 : 0 },
    },
    vertexShader: `attribute float rnd; uniform float uTime, uScale, uSize, uWrap; uniform vec3 uCenter, uBox; varying float vA;
      void main(){
        vec3 p = position;
        p.y = mod(p.y + uTime * (0.08 + rnd * 0.22), uBox.y);
        p.x += sin(uTime * (0.3 + rnd * 0.4) + rnd * 6.28) * 0.35;
        p.z += cos(uTime * (0.25 + rnd * 0.35) + rnd * 4.0) * 0.35;
        if (uWrap > 0.5) {
          vec3 rel = p - (uCenter - vec3(uBox.x, 0.0, uBox.z) * 0.5);
          p.x = mod(p.x - uCenter.x + uBox.x * 0.5, uBox.x) - uBox.x * 0.5 + uCenter.x;
          p.z = mod(p.z - uCenter.z + uBox.z * 0.5, uBox.z) - uBox.z * 0.5 + uCenter.z;
        } else { p.xz += uCenter.xz; }
        p.y += uCenter.y;
        float yy = (p.y - uCenter.y) / uBox.y;
        vA = smoothstep(0.0, 0.15, yy) * (1.0 - smoothstep(0.7, 1.0, yy)) * (0.4 + 0.6 * fract(rnd * 7.13));
        vA *= 0.6 + 0.4 * sin(uTime * (1.5 + rnd * 2.0) + rnd * 20.0);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = uSize * uScale / -mv.z * (0.6 + rnd * 0.8);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `uniform vec3 uColor; varying float vA;
      void main(){ vec2 c = gl_PointCoord - 0.5; float d = length(c); if (d > 0.5) discard; gl_FragColor = vec4(uColor * smoothstep(0.5, 0.0, d) * vA, 1.0); }`,
  });
  const pts = new THREE.Points(g, m);
  pts.frustumCulled = false;
  pts.renderOrder = 8;
  return pts;
}

// Tåke og støv rundt spilleren
export class Ambient {
  constructor(scene) {
    this.scene = scene;
    this.motes = makeMotes(260, new THREE.Vector3(26, 5, 26), 0xffd8a0, 0.055);
    scene.add(this.motes);
    this.mist = [];
    const mat = () => new THREE.SpriteMaterial({ map: G.gfx.smoke, color: 0x8a9a94, transparent: true, opacity: 0.07, depthWrite: false });
    for (let i = 0; i < 30; i++) {
      const s = new THREE.Sprite(mat());
      s.userData.v = new THREE.Vector3((Math.random() - 0.5) * 0.4, 0, (Math.random() - 0.5) * 0.4);
      s.userData.base = 0.04 + Math.random() * 0.06;
      s.userData.rot = (Math.random() - 0.5) * 0.1;
      const sc = 5 + Math.random() * 6;
      s.scale.set(sc, sc * 0.6, 1);
      s.material.rotation = Math.random() * 6.28;
      s.position.set((Math.random() - 0.5) * 30, 0.3 + Math.random() * 0.8, (Math.random() - 0.5) * 30);
      this.mist.push(s);
      scene.add(s);
    }
    this.enabled = true;
  }

  setLook(color, moteColor, density = 1) {
    for (const s of this.mist) s.material.color.set(color);
    this.motes.material.uniforms.uColor.value.set(moteColor);
    this.density = density;
  }

  setEnabled(on, motesOn = true) {
    this.enabled = on;
    for (const s of this.mist) s.visible = on;
    this.motes.visible = motesOn;
  }

  setScale(s) {
    this.motes.material.uniforms.uScale.value = s;
  }

  update(dt, center, time) {
    const u = this.motes.material.uniforms;
    u.uTime.value = time;
    u.uCenter.value.set(center.x, 0, center.z);
    if (!this.enabled) return;
    for (const s of this.mist) {
      s.position.addScaledVector(s.userData.v, dt);
      s.material.rotation += s.userData.rot * dt;
      const dx = s.position.x - center.x, dz = s.position.z - center.z;
      if (Math.abs(dx) > 16) s.position.x -= Math.sign(dx) * 32;
      if (Math.abs(dz) > 16) s.position.z -= Math.sign(dz) * 32;
      s.material.opacity = s.userData.base * (this.density ?? 1);
    }
  }
}

// ---------------------------------------------------------------------------
// Pynt for en etasje
// ---------------------------------------------------------------------------

const rustMat = () => new THREE.MeshStandardMaterial({ color: 0x4a3828, roughness: 0.45, metalness: 0.7 });
const stoneMat = () => new THREE.MeshStandardMaterial({ color: 0x5a5048, roughness: 0.95 });

export function decorate(dg, W) {
  const gfx = G.gfx;
  const biome = dg.biome;
  W.anim = [];
  W.shaftMats = [];
  W.shaftMotes = [];
  const rust = rustMat();
  const stone = stoneMat();
  const R = Math.random;
  const tw = t => (t + 0.5) * T;

  for (const room of dg.rooms) {
    const { x, y, w, h } = room;
    // lyssjakt fra rist eller sprekk i taket
    const shaftChance = room.kind === 'boss' ? 1 : biome === 'kloakk' ? 0.5 : biome === 'dverg' ? 0.38 : 0;
    if (room.kind !== 'stairs' && R() < shaftChance) {
      let sx = room.cx, sy = room.cy;
      if (room.kind !== 'boss') {
        for (let a = 0; a < 12; a++) {
          const i = x + 1 + Math.floor(R() * (w - 2)), j = y + 1 + Math.floor(R() * (h - 2));
          if (dg.get(i, j) === FLOOR) { sx = i; sy = j; break; }
        }
      }
      const col = room.kind === 'boss' ? 0xff9a7a : biome === 'dverg' ? 0xb8d0ff : 0x9cc8ff;
      makeShaft(W, tw(sx), tw(sy), col, room.kind === 'boss' ? 1.25 : 1);
    }
    // kloakkrør langs nordveggen
    if (biome === 'kloakk' && R() < 0.5) {
      let i0 = -1, i1 = -1;
      for (let i = x; i < x + w; i++) {
        if (dg.tallWall(i, y - 1)) { if (i0 < 0) i0 = i; i1 = i; } else if (i0 >= 0) break;
      }
      if (i0 >= 0 && i1 - i0 >= 2) {
        const x0 = i0 * T, x1 = (i1 + 1) * T, z = y * T + 0.3, py = 2.55 + R() * 0.35;
        const len = x1 - x0;
        const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, len, 10), rust);
        pipe.rotation.z = Math.PI / 2;
        pipe.position.set((x0 + x1) / 2, py, z);
        pipe.castShadow = true;
        W.addObj(pipe);
        for (let bx = x0 + 0.6; bx < x1; bx += 2.4) {
          const br = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.42, 0.34), rust);
          br.position.set(bx, py, z - 0.12);
          W.addObj(br);
        }
        const dx = x0 + 0.8 + R() * (len - 1.6);
        const drop = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, py - 0.25, 8), rust);
        drop.position.set(dx, (py + 0.25) / 2, z);
        drop.castShadow = true;
        W.addObj(drop);
        const elbow = new THREE.Mesh(new THREE.SphereGeometry(0.17, 10, 8), rust);
        elbow.position.set(dx, py, z);
        W.addObj(elbow);
        const slime = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.8).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: G.assets.glowTex, color: 0x2aff8a, transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending, depthWrite: false }));
        slime.position.set(dx, 0.03, z + 0.5);
        W.addObj(slime);
        W.anim.push(t => { slime.material.opacity = 0.16 + Math.sin(t * 1.7 + dx) * 0.05; });
        W.drips = W.drips || [];
        W.drips.push(new THREE.Vector3(dx, 0.3, z + 0.1));
      }
    }
    // glødende runer og bannere på høye vegger (dverg og rev)
    if (biome !== 'kloakk') {
      let placed = 0;
      for (let i = x + 3; i < x + w - 1 && placed < 2; i += 4) {
        if (!dg.tallWall(i, y - 1)) continue;
        if (biome === 'dverg' && (placed === 0 || R() < 0.5)) {
          const strip = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 0.5), new THREE.MeshBasicMaterial({ map: gfx.runeStrips[Math.floor(R() * 4)], color: 0xff8a3a, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
          strip.position.set(tw(i), 2.75, y * T + 0.04);
          W.addObj(strip);
          const ph = R() * 6;
          W.anim.push(t => { strip.material.opacity = 0.45 + 0.35 * Math.sin(t * 1.2 + ph) * Math.sin(t * 0.37 + ph); });
        } else {
          const pivot = new THREE.Group();
          pivot.position.set(tw(i), 3.05, y * T + 0.09);
          const cloth = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 2.0).translate(0, -1.0, 0), new THREE.MeshStandardMaterial({ map: gfx.banners[biome === 'rev' ? 'rev' : 'dverg'], side: THREE.DoubleSide, alphaTest: 0.5, roughness: 0.9 }));
          cloth.castShadow = true;
          pivot.add(cloth);
          const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.25, 6), rust);
          rod.rotation.z = Math.PI / 2;
          pivot.add(rod);
          W.addObj(pivot);
          const ph = R() * 6;
          W.anim.push(t => { pivot.rotation.x = Math.sin(t * 1.1 + ph) * 0.035 + 0.03; });
        }
        placed++;
      }
    }
    // spindelvev i hjørnet der to høye vegger møtes
    if (dg.tallWall(x - 1, y - 1) && dg.tallWall(x, y - 1) && dg.tallWall(x - 1, y) && R() < 0.75) {
      const web = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 1.7), new THREE.MeshBasicMaterial({ map: gfx.web, transparent: true, opacity: 0.45, depthWrite: false, side: THREE.DoubleSide }));
      web.position.set(x * T + 0.62, 2.55, y * T + 0.62);
      web.rotation.y = Math.PI / 4;
      W.addObj(web);
    }
    // stearinlys hos dvergene og reven
    if (biome !== 'kloakk' && room.kind !== 'boss' && R() < 0.5) {
      const ci = x + (R() < 0.5 ? 0 : w - 1), cj = y + Math.floor(R() * h);
      if (dg.get(ci, cj) === FLOOR) candles(W, tw(ci) + (R() - 0.5) * 0.6, tw(cj) + (R() - 0.5) * 0.6);
    }
    // steinrester i dvergehallene
    if (biome === 'dverg' && R() < 0.45) {
      const ci = x + 1 + Math.floor(R() * (w - 2)), cj = y + (R() < 0.5 ? 0 : h - 1);
      if (dg.get(ci, cj) === FLOOR) {
        for (let k = 0; k < 6; k++) {
          const s = 0.18 + R() * 0.32;
          const b = new THREE.Mesh(new THREE.BoxGeometry(s, s * 0.7, s * 1.2), stone);
          b.position.set(tw(ci) + (R() - 0.5) * 1.2, s * 0.3, tw(cj) + (R() - 0.5) * 1.2);
          b.rotation.set(R() * 0.5, R() * 3, R() * 0.5);
          b.castShadow = b.receiveShadow = true;
          W.addObj(b);
        }
      }
    }
    if (room.kind === 'boss') throne(W, room, dg);
  }
}

function makeShaft(W, x, z, color, scale = 1) {
  const gfx = G.gfx;
  const h = 10;
  const mat = shaftMaterial(color, 0.3);
  W.shaftMats.push(mat);
  const geo = new THREE.CylinderGeometry(0.9 * scale, 1.75 * scale, h, 28, 1, true).translate(0, h / 2, 0);
  const shaft = new THREE.Mesh(geo, mat);
  shaft.position.set(x, 0, z);
  shaft.renderOrder = 7;
  W.addObj(shaft);
  const pool = new THREE.Mesh(new THREE.PlaneGeometry(3.6 * scale, 3.6 * scale).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: gfx.grate, color, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false }));
  pool.position.set(x, 0.035, z);
  pool.rotation.y = Math.random() * 0.4;
  W.addObj(pool);
  const motes = makeMotes(50, new THREE.Vector3(2.2 * scale, 6, 2.2 * scale), color, 0.07, false);
  motes.material.uniforms.uCenter.value.set(x, 0, z);
  W.addObj(motes);
  W.shaftMotes.push(motes);
  W.sources.push({ pos: new THREE.Vector3(x, 3.4, z), color: new THREE.Color(color), intensity: 18 * scale, phase: 0, steady: true });
}

function candles(W, x, z) {
  const wax = new THREE.MeshStandardMaterial({ color: 0xe8dcc0, roughness: 0.6, emissive: 0x2a1a08 });
  const n = 3 + Math.floor(Math.random() * 3);
  for (let i = 0; i < n; i++) {
    const hh = 0.18 + Math.random() * 0.3;
    const cx = x + (Math.random() - 0.5) * 0.5, cz = z + (Math.random() - 0.5) * 0.5;
    const c = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, hh, 8), wax);
    c.position.set(cx, hh / 2, cz);
    W.addObj(c);
    W.flame(cx, hh + 0.02, cz, 0xffb060, 0.22);
  }
  W.sources.push({ pos: new THREE.Vector3(x, 0.9, z), color: new THREE.Color(0xffb060), intensity: 7, phase: Math.random() * 5 });
}

function throne(W, room, dg) {
  const x = (room.cx + 0.5) * T, z = (room.y + 2.2) * T;
  const g = new THREE.Group();
  const dark = new THREE.MeshStandardMaterial({ color: 0x2a1410, roughness: 0.6 });
  const gold = new THREE.MeshStandardMaterial({ color: 0xc8a050, roughness: 0.3, metalness: 1 });
  const red = new THREE.MeshStandardMaterial({ color: 0x8a1a14, roughness: 0.85 });
  const box = (sx, sy, sz, m, px, py, pz) => {
    const b = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), m);
    b.position.set(px, py, pz);
    b.castShadow = b.receiveShadow = true;
    g.add(b);
    return b;
  };
  box(3.2, 0.35, 2.2, dark, 0, 0.17, 0);
  box(2.6, 0.25, 1.8, dark, 0, 0.47, 0);
  box(1.6, 0.6, 1.2, dark, 0, 0.9, 0.1);
  box(1.5, 0.18, 1.1, red, 0, 1.28, 0.15);
  box(1.9, 3.0, 0.3, dark, 0, 2.2, -0.45);
  box(2.0, 0.12, 0.36, gold, 0, 3.72, -0.45);
  box(0.25, 0.8, 1.1, dark, -0.85, 1.4, 0.1);
  box(0.25, 0.8, 1.1, dark, 0.85, 1.4, 0.1);
  box(0.3, 0.1, 1.15, gold, -0.85, 1.83, 0.1);
  box(0.3, 0.1, 1.15, gold, 0.85, 1.83, 0.1);
  // safransekker og mynter
  const sack = new THREE.MeshStandardMaterial({ color: 0xc87a1a, roughness: 0.9, emissive: 0x3a1a00 });
  for (let i = 0; i < 5; i++) {
    const s = new THREE.Mesh(new THREE.SphereGeometry(0.42, 12, 10), sack);
    s.scale.set(1, 1.15, 0.9);
    s.position.set((i % 2 ? 1 : -1) * (1.9 + (i >> 1) * 0.5), 0.45, 0.2 + (i >> 1) * 0.55);
    s.castShadow = true;
    g.add(s);
  }
  const spill = new THREE.Mesh(new THREE.CircleGeometry(1.1, 24).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xc8801a, roughness: 0.9, emissive: 0x140800, transparent: true, opacity: 0.8 }));
  spill.position.set(2.3, 0.02, 1.4);
  g.add(spill);
  const coin = new THREE.MeshStandardMaterial({ color: 0xe0c070, roughness: 0.25, metalness: 1 });
  for (let i = 0; i < 26; i++) {
    const c = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.03, 10), coin);
    c.position.set(-2.3 + (Math.random() - 0.5) * 1.4, 0.02 + Math.random() * 0.12, 1.3 + (Math.random() - 0.5) * 1.0);
    c.rotation.set(Math.random(), Math.random() * 3, Math.random());
    g.add(c);
  }
  g.position.set(x, 0, z);
  W.addObj(g);
  G.props.push({ type: 'throne', mesh: g, pos: g.position, radius: 1.6, breakable: false });
  // bannere bak tronen
  for (const sx of [-2.4, 2.4]) {
    const pivot = new THREE.Group();
    pivot.position.set(x + sx, 3.3, z - 0.9);
    const cloth = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 2.4).translate(0, -1.2, 0), new THREE.MeshStandardMaterial({ map: G.gfx.banners.rev, side: THREE.DoubleSide, alphaTest: 0.5, roughness: 0.9 }));
    pivot.add(cloth);
    W.addObj(pivot);
    const ph = Math.random() * 5;
    W.anim.push(t => { pivot.rotation.x = Math.sin(t * 0.9 + ph) * 0.04; });
  }
}
