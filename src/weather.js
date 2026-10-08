import * as THREE from 'three';
import { G, T } from './state.js';
import { BUILDINGS, TW, TH } from './townmap.js';
import { makeMotes } from './decor.js';
import { updateWet } from './wet.js';

// ---------------------------------------------------------------------------
// Vær og liv i lufta. Regn, plask, lyn, vind, løv, fugler og flaggermus, og
// sporer, glør og damp nede i kloakken og hallene. Regn og løv regnes ut i
// vertex-shaderen og pakkes rundt kameraet, så CPU-en bare setter uniformer.
// Været i byen følger klokka: hver tredje time trekkes nytt vær fra et frø.
// ---------------------------------------------------------------------------

export const KINDS = {
  klart: { cloud: 0.08, rain: 0, wind: 0.35, storm: 0 },
  skyet: { cloud: 0.6, rain: 0, wind: 0.6, storm: 0 },
  regn: { cloud: 0.85, rain: 0.65, wind: 0.7, storm: 0 },
  storm: { cloud: 1, rain: 1, wind: 1.35, storm: 1 },
};
const ORDER = ['klart', 'klart', 'klart', 'skyet', 'skyet', 'regn', 'regn', 'storm'];
export const KIND_NAME = { klart: 'klart', skyet: 'skyet', regn: 'regn', storm: 'uvær' };

const hash = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

// Tak over byen: høyden under taket per flis, så regn og løv ikke faller inn i husene.
// Hvert område (Fristaden og stedene i Edelfara) fyller den på nytt med sine bygninger og telt.
function fillCover(tex, buildings, extra = []) {
  const data = tex.image.data;
  data.fill(0);
  for (const b of [...buildings, ...extra]) {
    const h = Math.min(12.5, (b.wallH || 3.5) + 1.6);
    for (let y = b.y0; y <= b.y1; y++) for (let x = b.x0; x <= b.x1; x++) if (x >= 0 && y >= 0 && x < TW && y < TH) data[y * TW + x] = Math.round(h * 20);
  }
  tex.needsUpdate = true;
}
function coverTexture() {
  const t = new THREE.DataTexture(new Uint8Array(TW * TH), TW, TH, THREE.RedFormat, THREE.UnsignedByteType);
  fillCover(t, BUILDINGS);
  return t;
}

const COVER = `
uniform sampler2D uCover;
uniform float uCoverOn;
uniform float uInside;
float coverAt(vec3 p){
  if (uCoverOn < 0.5) return 0.0;
  vec2 uv = p.xz / vec2(${(TW * T).toFixed(1)}, ${(TH * T).toFixed(1)});
  if (uv.x < 0.0 || uv.y < 0.0 || uv.x > 1.0 || uv.y > 1.0) return 0.0;
  return texture2D(uCover, uv).r * 255.0 / 20.0;
}
float hash1(float n){ return fract(sin(n * 127.1 + 311.7) * 43758.5453); }
`;

// --- regn: tynne streker som faller skrått med vinden ---------------------------------
function makeRain(count, cover) {
  const base = new THREE.BufferGeometry();
  base.setAttribute('position', new THREE.Float32BufferAttribute([-1, 0, 0, 1, 0, 0, 1, 1, 0, -1, 1, 0], 3));
  base.setIndex([0, 1, 2, 0, 2, 3]);
  const g = new THREE.InstancedBufferGeometry();
  g.index = base.index;
  g.setAttribute('position', base.attributes.position);
  const seed = new Float32Array(count * 4);
  for (let i = 0; i < count * 4; i++) seed[i] = Math.random();
  g.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seed, 4));
  g.instanceCount = count;
  const m = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    uniforms: {
      uTime: { value: 0 }, uCenter: { value: new THREE.Vector3() }, uBox: { value: new THREE.Vector3(40, 12, 40) },
      uAmount: { value: 0 }, uWind: { value: new THREE.Vector2() }, uLen: { value: 1.05 }, uPx: { value: 0.002 }, uAspect: { value: 1.7 },
      uColor: { value: new THREE.Color(0.62, 0.68, 0.76) }, uCover: { value: cover }, uCoverOn: { value: 1 }, uInside: { value: 0 },
    },
    vertexShader: `${COVER}
      attribute vec4 aSeed;
      uniform float uTime, uAmount, uLen, uPx, uAspect;
      uniform vec3 uCenter, uBox;
      uniform vec2 uWind;
      varying float vA;
      void main(){
        if (aSeed.w > uAmount) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); vA = 0.0; return; }
        float speed = 17.0 + aSeed.w * 6.0;
        float fall = mod(uTime * speed + aSeed.y * uBox.y, uBox.y);
        vec3 drift = vec3(uWind.x, 0.0, uWind.y) * 0.09;
        vec3 p = vec3(aSeed.x * uBox.x, uBox.y - fall, aSeed.z * uBox.z);
        p.xz += drift.xz * fall * 1.6;
        p.x = mod(p.x - uCenter.x + uBox.x * 0.5, uBox.x) - uBox.x * 0.5 + uCenter.x;
        p.z = mod(p.z - uCenter.z + uBox.z * 0.5, uBox.z) - uBox.z * 0.5 + uCenter.z;
        float cov = coverAt(p);
        vA = (cov > 0.0 && (p.y < cov || uInside > 0.5)) ? 0.0 : 1.0;
        vA *= smoothstep(0.0, 2.0, fall) * step(0.0, p.y);
        vec3 dir = normalize(vec3(drift.x * 1.6, -1.0, drift.z * 1.6));
        vec3 tail = p - dir * uLen * (0.7 + aSeed.x * 0.6);
        // fast bredde i piksler, uansett avstand
        vec4 hv = viewMatrix * vec4(p, 1.0);
        vec4 hc = projectionMatrix * hv;
        vec4 tc = projectionMatrix * (viewMatrix * vec4(tail, 1.0));
        vec4 c = mix(hc, tc, position.y);
        vec2 d = normalize((tc.xy / tc.w - hc.xy / hc.w) * vec2(uAspect, 1.0) + vec2(0.0, 0.00001));
        vec2 perp = vec2(-d.y, d.x) / vec2(uAspect, 1.0);
        c.xy += perp * position.x * uPx * c.w;
        gl_Position = c;
        vA *= smoothstep(6.0, 11.0, -hv.z);
      }`,
    fragmentShader: `uniform vec3 uColor; varying float vA;
      void main(){ if (vA <= 0.01) discard; gl_FragColor = vec4(uColor, 0.42 * vA); }`,
  });
  const mesh = new THREE.Mesh(g, m);
  mesh.frustumCulled = false;
  mesh.renderOrder = 9;
  return mesh;
}

// --- plask på bakken: små ringer som vokser og blir borte ---------------------------------
function makeSplashes(count, cover) {
  const pos = new Float32Array(count * 3);
  const seed = new Float32Array(count * 4);
  for (let i = 0; i < count * 4; i++) seed[i] = Math.random();
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 4));
  const m = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uTime: { value: 0 }, uCenter: { value: new THREE.Vector3() }, uBox: { value: new THREE.Vector3(30, 1, 30) },
      uAmount: { value: 0 }, uScale: { value: 400 }, uColor: { value: new THREE.Color(0.7, 0.76, 0.84) },
      uCover: { value: cover }, uCoverOn: { value: 1 }, uInside: { value: 0 },
    },
    vertexShader: `${COVER}
      attribute vec4 aSeed;
      uniform float uTime, uAmount, uScale;
      uniform vec3 uCenter, uBox;
      varying float vA; varying float vPh;
      void main(){
        if (aSeed.w > uAmount) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); gl_PointSize = 0.0; vA = 0.0; return; }
        float cyc = uTime / (0.35 + aSeed.z * 0.25) + aSeed.y * 10.0;
        float id = floor(cyc);
        vPh = fract(cyc);
        vec3 p = vec3((hash1(id * 1.37 + aSeed.x * 91.0) - 0.5) * uBox.x, 0.04, (hash1(id * 2.11 + aSeed.y * 53.0) - 0.5) * uBox.z);
        p.xz += uCenter.xz;
        vA = coverAt(p) > 0.0 ? 0.0 : (1.0 - vPh);
        vec4 mv = viewMatrix * vec4(p, 1.0);
        gl_PointSize = (0.04 + vPh * 0.13) * uScale / -mv.z;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `uniform vec3 uColor; varying float vA; varying float vPh;
      void main(){ if (vA <= 0.01) discard; vec2 c = gl_PointCoord - 0.5; float d = length(c);
        float ring = smoothstep(0.5, 0.38, d) * smoothstep(0.18, 0.34, d);
        gl_FragColor = vec4(uColor, ring * vA * 0.35); }`,
  });
  const pts = new THREE.Points(g, m);
  pts.frustumCulled = false;
  pts.renderOrder = 8;
  return pts;
}

// --- løv som blåser rundt ------------------------------------------------------------
function makeLeaves(count, cover) {
  const pos = new Float32Array(count * 3);
  const seed = new Float32Array(count * 4);
  for (let i = 0; i < count * 4; i++) seed[i] = Math.random();
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 4));
  const m = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uTime: { value: 0 }, uCenter: { value: new THREE.Vector3() }, uBox: { value: new THREE.Vector3(44, 9, 44) },
      uAmount: { value: 0 }, uScale: { value: 400 }, uWind: { value: new THREE.Vector2() }, uLight: { value: 1 },
      uCover: { value: cover }, uCoverOn: { value: 1 }, uInside: { value: 0 },
    },
    vertexShader: `${COVER}
      attribute vec4 aSeed;
      uniform float uTime, uAmount, uScale, uLight;
      uniform vec3 uCenter, uBox;
      uniform vec2 uWind;
      varying float vA; varying float vRot; varying vec3 vCol;
      void main(){
        if (aSeed.w > uAmount) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); gl_PointSize = 0.0; vA = 0.0; return; }
        float t = uTime;
        float fall = mod(t * (0.35 + aSeed.y * 0.4) + aSeed.z * uBox.y, uBox.y);
        vec3 p = vec3(aSeed.x * uBox.x, uBox.y - fall, aSeed.y * uBox.z);
        p.x += uWind.x * t * (1.1 + aSeed.z) + sin(t * (1.3 + aSeed.w * 2.0) + aSeed.x * 30.0) * 0.6;
        p.z += uWind.y * t * (1.1 + aSeed.z) + cos(t * (1.1 + aSeed.x * 1.7) + aSeed.y * 20.0) * 0.6;
        p.x = mod(p.x - uCenter.x + uBox.x * 0.5, uBox.x) - uBox.x * 0.5 + uCenter.x;
        p.z = mod(p.z - uCenter.z + uBox.z * 0.5, uBox.z) - uBox.z * 0.5 + uCenter.z;
        float cov = coverAt(p);
        vA = (cov > 0.0 && (p.y < cov || uInside > 0.5)) ? 0.0 : 1.0;
        vA *= smoothstep(0.0, 0.4, p.y) * (1.0 - smoothstep(uBox.y * 0.8, uBox.y, p.y));
        vRot = t * (1.5 + aSeed.x * 3.0) + aSeed.z * 6.28;
        vec3 c1 = vec3(0.42, 0.36, 0.08), c2 = vec3(0.6, 0.26, 0.05), c3 = vec3(0.22, 0.3, 0.06);
        vCol = (aSeed.x < 0.4 ? c1 : aSeed.x < 0.75 ? c2 : c3) * uLight;
        vec4 mv = viewMatrix * vec4(p, 1.0);
        gl_PointSize = (0.16 + aSeed.w * 0.08) * uScale / -mv.z;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `varying float vA; varying float vRot; varying vec3 vCol;
      void main(){
        if (vA <= 0.01) discard;
        vec2 c = gl_PointCoord - 0.5;
        float s = sin(vRot), co = cos(vRot);
        c = vec2(c.x * co - c.y * s, c.x * s + c.y * co);
        // bladet blir smalt når det snur seg
        c.x /= 0.25 + 0.75 * abs(sin(vRot * 0.7));
        float d = length(vec2(c.x * 2.0, c.y));
        float leaf = smoothstep(0.5, 0.42, d + abs(c.x) * 0.6);
        if (leaf < 0.05) discard;
        gl_FragColor = vec4(vCol * (0.8 + 0.4 * (0.5 - c.y)), leaf * vA);
      }`,
  });
  const pts = new THREE.Points(g, m);
  pts.frustumCulled = false;
  pts.renderOrder = 8;
  return pts;
}

// --- fugler og flaggermus ------------------------------------------------------------
// Kropp og to vinger. Vingespissene (aWing = 1) flakser i vertex-shaderen.
function flyerGeometry(bat) {
  const P = [], W = [];
  const tri = (a, b, c, wa, wb, wc) => { P.push(...a, ...b, ...c); W.push(wa, wb, wc); };
  if (bat) {
    tri([0, 0, 0.18], [0, 0, -0.14], [0.42, 0.02, -0.12], 0, 0, 1);
    tri([0, 0, 0.18], [-0.42, 0.02, -0.12], [0, 0, -0.14], 0, 1, 0);
    tri([0.42, 0.02, -0.12], [0, 0, -0.14], [0.2, 0, -0.26], 1, 0, 0.5);
    tri([-0.42, 0.02, -0.12], [-0.2, 0, -0.26], [0, 0, -0.14], 1, 0.5, 0);
  } else {
    tri([0, 0, 0.26], [0.06, 0, -0.2], [-0.06, 0, -0.2], 0, 0, 0);
    tri([0, 0, 0.08], [0.5, 0.04, -0.06], [0, 0, -0.08], 0, 1, 0);
    tri([0, 0, 0.08], [0, 0, -0.08], [-0.5, 0.04, -0.06], 0, 0, 1);
    tri([0, 0, -0.14], [0.12, 0, -0.32], [-0.12, 0, -0.32], 0, 0, 0);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
  g.setAttribute('aWing', new THREE.Float32BufferAttribute(W, 1));
  return g;
}

class Flock {
  constructor(scene, n, bat) {
    this.n = n;
    this.bat = bat;
    const g = flyerGeometry(bat);
    this.phase = new Float32Array(n);
    for (let i = 0; i < n; i++) this.phase[i] = Math.random() * 10;
    g.setAttribute('aPhase', new THREE.InstancedBufferAttribute(this.phase, 1));
    this.mat = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      fog: true,
      uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, {
        uTime: { value: 0 }, uFlap: { value: bat ? 16 : 7 }, uColor: { value: new THREE.Color(bat ? 0x0c0808 : 0x2e2a26) },
      }]),
      vertexShader: `attribute float aWing; attribute float aPhase; uniform float uTime, uFlap; varying float vFogDepth;
        void main(){
          vec3 p = position;
          float f = sin(uTime * uFlap + aPhase * 6.28);
          p.y += aWing * f * 0.3;
          p.x *= 1.0 - aWing * abs(f) * 0.25;
          vec4 mv = modelViewMatrix * instanceMatrix * vec4(p, 1.0);
          vFogDepth = -mv.z;
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: `uniform vec3 uColor; uniform vec3 fogColor; uniform float fogNear, fogFar; varying float vFogDepth;
        void main(){ gl_FragColor = vec4(mix(uColor, fogColor, smoothstep(fogNear, fogFar, vFogDepth)), 1.0); }`,
    });
    this.mesh = new THREE.InstancedMesh(g, this.mat, n);
    this.mesh.frustumCulled = false;
    this.mesh.visible = false;
    scene.add(this.mesh);
    this.birds = Array.from({ length: n }, (_, i) => ({ a: (i / n) * Math.PI * 2, r: 1 + Math.random(), y: Math.random(), o: Math.random() * 10 }));
    this.center = new THREE.Vector3();
    this.m4 = new THREE.Matrix4();
    this.q = new THREE.Quaternion();
    this.e = new THREE.Euler();
    this.v = new THREE.Vector3();
    this.sc = new THREE.Vector3(1, 1, 1);
    this.mode = 'circle';
    this.t = 0;
  }

  // circle: kretser over et punkt. pass: flyr forbi i en rett linje (flaggermus i kloakken).
  start(mode, center, o = {}) {
    this.mode = mode;
    this.center.copy(center);
    this.t = 0;
    this.radius = o.radius ?? 14;
    this.height = o.height ?? 10;
    this.speed = o.speed ?? 0.25;
    this.dir = o.dir || new THREE.Vector3(1, 0, 0);
    this.len = o.len ?? 40;
    this.mesh.visible = true;
  }

  stop() { this.mesh.visible = false; this.mode = null; }

  update(dt, time) {
    if (!this.mesh.visible) return;
    this.mat.uniforms.uTime.value = time;
    this.t += dt;
    const s = this.bat ? 1 : 0.8;
    for (let i = 0; i < this.n; i++) {
      const b = this.birds[i];
      let x, y, z, yaw;
      if (this.mode === 'circle') {
        const a = b.a + this.t * this.speed * (1 + b.r * 0.15);
        const r = this.radius * (0.75 + b.r * 0.25) + Math.sin(this.t * 0.7 + b.o) * 1.5;
        x = this.center.x + Math.cos(a) * r;
        z = this.center.z + Math.sin(a) * r;
        y = this.height + b.y * 2.5 + Math.sin(this.t * 1.3 + b.o) * 0.6;
        yaw = Math.atan2(-Math.sin(a), Math.cos(a)) + Math.PI;
        if (this.bat) { x += Math.sin(this.t * 7 + b.o) * 0.6; y += Math.sin(this.t * 9 + b.o * 2) * 0.4; }
      } else {
        const k = this.t * 7 - b.o * 0.6;
        const side = (b.r - 1.5) * 3;
        x = this.center.x + this.dir.x * (k - this.len / 2) - this.dir.z * side + Math.sin(this.t * 8 + b.o) * 0.5;
        z = this.center.z + this.dir.z * (k - this.len / 2) + this.dir.x * side + Math.cos(this.t * 7 + b.o) * 0.5;
        y = this.height + b.y * 1.2 + Math.sin(this.t * 10 + b.o * 3) * 0.35;
        yaw = Math.atan2(this.dir.x, this.dir.z);
        if (i === 0 && k - this.len / 2 > this.len * 0.6 + 6) { this.stop(); return; }
      }
      this.e.set(0, yaw, 0);
      this.q.setFromEuler(this.e);
      this.v.set(x, y, z);
      this.sc.setScalar(s);
      this.m4.compose(this.v, this.q, this.sc);
      this.mesh.setMatrixAt(i, this.m4);
    }
    this.mesh.instanceMatrix.needsUpdate = true;
  }
}

// --- været ---------------------------------------------------------------------------
export class Weather {
  constructor(scene) {
    this.scene = scene;
    this.kind = 'klart';
    this.forced = null;
    this.cloud = 0.1;
    this.rain = 0;
    this.storm = 0;
    this.windK = 0.3;
    this.wet = 0;
    this.flash = 0;
    this.wind = new THREE.Vector2(0.6, 0.3);
    this.windAng = 0.5;
    this.boltT = 8;
    this.thunders = [];
    this.cover = coverTexture();
    this.quality = 'hoy';
    this.build('hoy');
    this.birds = [new Flock(scene, 7, false), new Flock(scene, 6, false)];
    this.bats = new Flock(scene, 7, true);
    this.batT = 12;
    // sporer i kloakken, glør i smia
    this.spores = makeMotes(160, new THREE.Vector3(28, 3.2, 28), 0x9aff6a, 0.075);
    this.spores.visible = false;
    scene.add(this.spores);
    this.embers = makeMotes(120, new THREE.Vector3(26, 6, 26), 0xff7a30, 0.06);
    this.embers.visible = false;
    scene.add(this.embers);
    this.steamT = 0;
  }

  build(q) {
    for (const o of [this.rainMesh, this.splash, this.leaves]) if (o) { this.scene.remove(o); o.geometry.dispose(); o.material.dispose(); }
    const k = q === 'lav' ? 0.3 : q === 'middels' ? 0.6 : 1;
    this.rainMesh = makeRain(Math.round(2600 * k), this.cover);
    this.splash = makeSplashes(Math.round(420 * k), this.cover);
    this.leaves = makeLeaves(Math.round(160 * k), this.cover);
    this.scene.add(this.rainMesh, this.splash, this.leaves);
    this.quality = q;
  }

  setQuality(q) { if (q !== this.quality) this.build(q); }

  // tvinger fram vær (testing og fortellingen). null slipper klokka til igjen.
  force(kind) { this.forced = kind && KINDS[kind] ? kind : null; if (this.forced) this.kind = this.forced; }

  kindAt(clock) {
    if (this.forced) return this.forced;
    const block = Math.floor(clock / 3);
    if (block <= 5) return block === 5 ? 'skyet' : 'klart'; // første kveld er stille
    return ORDER[Math.floor(hash(block + (G.run?.seed || 0) * 0.001) * ORDER.length)];
  }

  // Ved nytt nivå: hopp rett til været, ikke fade inn.
  snap() {
    const town = G.dungeon?.isTown;
    this.kind = town ? this.kindAt(G.run?.clock || 0) : 'klart';
    const K = KINDS[this.kind];
    this.cloud = town ? K.cloud : 0;
    this.rain = town ? K.rain : 0;
    this.storm = town ? K.storm : 0;
    this.windK = town ? K.wind : 0;
    this.wet = town ? (this.rain > 0 ? 0.8 : 0) : 0;
    this.flash = 0;
    this.birds.forEach(b => b.stop());
    this.bats.stop();
    this.batT = 6 + Math.random() * 10;
    this.levelStart();
  }

  levelStart() {
    const D = G.dungeon;
    if (D?.isTown) fillCover(this.cover, D.buildings || BUILDINGS, D.covers || []);
    const biome = D?.biome || D?.info?.biome;
    this.spores.visible = biome === 'kloakk';
    this.embers.visible = biome === 'dverg' || biome === 'rev';
    this.spores.material.uniforms.uColor.value.setHex(D?.depth === 2 ? 0xc8ff5a : 0x7affa0);
    this.embers.material.uniforms.uColor.value.setHex(biome === 'rev' ? 0xff4a20 : 0xff8a30);
    if (D?.isTown) {
      // kameraet ser skrått ned fra 16 meter, så fuglene må fly lavt for å synes
      const P = G.player.pos;
      this.birds[0].start('circle', new THREE.Vector3(P.x - 4, 0, P.z - 3), { radius: 9, height: 5.2, speed: 0.32 });
      this.birds[1].start('circle', new THREE.Vector3(P.x + 6, 0, P.z + 5), { radius: 7, height: 4.6, speed: -0.4 });
    }
  }

  get raining() { return this.rain > 0.05; }
  get label() { return KIND_NAME[this.kind] || this.kind; }

  update(dt, center, time) {
    const D = G.dungeon;
    const town = !!D?.isTown;
    // mål for været
    let target = KINDS.klart;
    if (town) {
      const k = this.kindAt(G.run?.clock || 0);
      if (k !== this.kind) {
        this.kind = k;
        if (k === 'regn' || k === 'storm') G.ui?.log?.(k === 'storm' ? 'Himmelen mørkner. Det kommer et uvær.' : 'Det begynner å regne.');
        else if (this.rain > 0.2) G.ui?.log?.('Regnet gir seg.');
      }
      target = KINDS[this.kind];
    }
    const ease = (a, b, r) => a + (b - a) * Math.min(1, dt * r);
    this.cloud = town ? ease(this.cloud, target.cloud, 0.25) : 0;
    this.rain = town ? ease(this.rain, target.rain, 0.3) : 0;
    this.storm = town ? ease(this.storm, target.storm, 0.3) : 0;
    this.windK = town ? ease(this.windK, target.wind, 0.2) : 0;
    // våte flater: blir fort våte, tørker sakte
    this.wet = town ? (this.rain > this.wet ? ease(this.wet, Math.min(1, this.rain * 1.3), 0.25) : ease(this.wet, 0, 0.012)) : 0;
    // vind med kast
    this.windAng += dt * 0.03 * Math.sin(time * 0.05);
    const gust = 0.75 + 0.35 * Math.sin(time * 0.6) * Math.sin(time * 0.23 + 1.3);
    const ws = this.windK * gust * 2.2;
    this.wind.set(Math.cos(this.windAng) * ws, Math.sin(this.windAng) * ws);
    // lyn
    this.flash = Math.max(0, this.flash - dt * 5);
    if (town && this.storm > 0.6) {
      this.boltT -= dt;
      if (this.boltT <= 0) {
        this.boltT = 5 + Math.random() * 14;
        this.flash = 1;
        G.post?.flash?.(0xcfe0ff, 0.45);
        const delay = 0.4 + Math.random() * 2.2;
        this.thunders.push({ t: delay, k: 1 - delay / 3 });
      }
    }
    for (let i = this.thunders.length - 1; i >= 0; i--) {
      const th = this.thunders[i];
      th.t -= dt;
      if (th.t <= 0) { G.audio?.thunder?.(th.k); this.thunders.splice(i, 1); }
    }
    G.audio?.setRain?.(town ? this.rain : 0, !!D?.insideId);
    updateWet(this, time, G.game?.sky, dt);
    // regn, plask og løv følger kameraets mål
    const sc = G.fx?.add?.uniforms?.uScale?.value || 400;
    const inside = town && D.insideId ? 1 : 0;
    for (const o of [this.rainMesh, this.splash, this.leaves]) o.material.uniforms.uInside.value = inside;
    const ru = this.rainMesh.material.uniforms;
    ru.uTime.value = time;
    ru.uCenter.value.set(center.x, center.y || 0, center.z);
    ru.uAmount.value = this.rain;
    ru.uWind.value.copy(this.wind);
    ru.uPx.value = 1.7 / Math.max(200, innerHeight);
    ru.uAspect.value = innerWidth / Math.max(1, innerHeight);
    this.rainMesh.visible = this.rain > 0.01;
    const su = this.splash.material.uniforms;
    su.uTime.value = time;
    su.uCenter.value.set(center.x, 0, center.z);
    su.uAmount.value = this.rain * 0.9;
    su.uScale.value = sc;
    this.splash.visible = this.rain > 0.05;
    const night = G.game?.sky?.night ?? 0;
    const lu = this.leaves.material.uniforms;
    lu.uTime.value = time;
    lu.uCenter.value.set(center.x, 0, center.z);
    lu.uAmount.value = town ? Math.min(1, 0.15 + this.windK * 0.45) : 0;
    lu.uWind.value.copy(this.wind).multiplyScalar(0.6);
    lu.uScale.value = sc;
    lu.uLight.value = 1 - night * 0.75;
    this.leaves.visible = town;
    // fugler om dagen når det ikke regner, flaggermus om natta og i hallene
    const birdsOn = town && night < 0.5 && this.rain < 0.3;
    for (const [i, b] of this.birds.entries()) {
      if (birdsOn && !b.mode) b.start('circle', b.center, { radius: b.radius, height: b.height, speed: b.speed });
      if (!birdsOn && b.mode) b.stop();
      if (b.mode === 'circle') {
        const ox = i ? 6 : -4, oz = i ? 5 : -3;
        b.center.x += (center.x + ox - b.center.x) * Math.min(1, dt * 0.15);
        b.center.z += (center.z + oz - b.center.z) * Math.min(1, dt * 0.15);
      }
      b.update(dt, time);
    }
    this.batT -= dt;
    if (this.batT <= 0) {
      this.batT = town ? 18 + Math.random() * 25 : 22 + Math.random() * 30;
      const ok = town ? night > 0.6 && this.rain < 0.3 : D && D.biome !== 'stad';
      if (ok && !this.bats.mode) {
        const a = Math.random() * Math.PI * 2;
        const dir = new THREE.Vector3(Math.cos(a), 0, Math.sin(a));
        this.bats.start('pass', new THREE.Vector3(center.x, 0, center.z), { dir, len: 34, height: town ? 6 : 2.6 });
        G.audio?.squeak?.();
      }
    }
    this.bats.update(dt, time);
    for (const m of [this.spores, this.embers]) {
      if (!m.visible) continue;
      m.material.uniforms.uTime.value = time;
      m.material.uniforms.uCenter.value.set(center.x, 0, center.z);
      m.material.uniforms.uScale.value = sc;
    }
    // damp fra vannet i kloakken
    if (D && !town && D.biome === 'kloakk') {
      this.steamT -= dt;
      if (this.steamT <= 0) {
        this.steamT = 0.25 + Math.random() * 0.35;
        for (let k = 0; k < 6; k++) {
          const x = center.x + (Math.random() - 0.5) * 22, z = center.z + (Math.random() - 0.5) * 22;
          if (D.isWater(x, z)) { G.fx.burst('steam', { x, y: -0.15, z }, 1); break; }
        }
      }
    }
  }
}
