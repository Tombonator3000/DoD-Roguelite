import * as THREE from 'three';

// ---------------------------------------------------------------------------
// Prosedyrisk ild. Alle flammene på et nivå (fakler, fyrfat, lykter, ildsteder,
// stearinlys) er instanser av én flate, så det blir ett tegnekall. Formen og
// tungene lages med støy i fragment-shaderen, og glorien rundt ligger i samme
// flate. CPU-en setter bare uTime.
// ---------------------------------------------------------------------------

const VERT = `
attribute vec3 iPos;
attribute vec4 iPar; // skala, fase, synlig, bredde
attribute vec3 iCol;
uniform float uTime;
varying vec2 vP;
varying vec3 vCol;
varying float vPh;
varying float vK;
varying float vW;
varying float vFogDepth;
void main(){
  float s = iPar.x * iPar.z;
  vPh = iPar.y;
  vCol = iCol;
  float t = uTime + iPar.y;
  vK = 0.9 + 0.12 * sin(t * 13.0) + 0.06 * sin(t * 29.0 + iPar.y);
  vW = iPar.w;
  // flata går fra -0.9 til 0.9 i x og fra -0.7 til 1.1 i y, i enheter av skalaen
  vec2 q = vec2(position.x * 1.8 * max(1.0, iPar.w * 0.8), position.y * 1.8 - 0.7);
  vP = q;
  vec4 mv = viewMatrix * vec4(iPos, 1.0);
  mv.xy += q * s;
  gl_Position = projectionMatrix * mv;
  #include <fog_vertex_fire>
}`;

const FRAG = `
uniform float uTime;
varying vec2 vP;
varying vec3 vCol;
varying float vPh;
varying float vK;
varying float vW;
#include <fog_pars_fire>
float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  for (int i = 0; i < OCT; i++) { v += a * noise(p); p = p * 2.07 + vec2(1.7, 9.2); a *= 0.5; }
  return v;
}
void main(){
  vec2 p = vP;
  float t = uTime * 1.15 + vPh;
  // glorie
  vec2 g = p - vec2(0.0, 0.2);
  float halo = exp(-dot(g, g / vec2(max(1.0, vW * 0.8) * max(1.0, vW * 0.8), 1.0)) * 4.2) * 0.28 * vK;
  // flammen: y = 0 ved foten, 1 ved spissen
  float h = 0.74 * vK;
  float y = (p.y + 0.12) / h;
  float x = p.x / (0.22 * vW);
  float n = fbm(vec2(x * 1.2 + vPh, y * 1.8 - t * 2.6));
  float n2 = fbm(vec2(x * 2.4 - 3.0, y * 3.2 - t * 4.0));
  x += (n - 0.5) * 1.1 * y;
  float w = (1.0 - y) * (0.5 + 0.8 * sqrt(clamp(y, 0.0, 1.0)));
  float edge = 1.0 - abs(x) / max(w, 0.001) + (n2 - 0.5) * 0.9 * (0.3 + y);
  float f = smoothstep(0.0, 0.35, edge) * smoothstep(-0.1, 0.06, y);
  // tunger som river seg løs nær toppen
  f *= smoothstep(1.0, 0.6, y + (n - 0.5) * 0.7);
  float core = smoothstep(0.35, 1.0, edge) * (1.0 - y);
  vec3 c = mix(vCol * vec3(0.85, 0.32, 0.12), vCol, smoothstep(0.0, 0.5, edge));
  c = mix(c, vec3(1.0, 0.86, 0.55), smoothstep(0.3, 0.85, core));
  vec3 col = c * f * 0.95 + vCol * halo;
  #include <fog_frag_fire>
  gl_FragColor = vec4(col, 1.0);
}`;

// Additiv blanding: tåka skal dempe lyset, ikke farge det.
const FOG = {
  fog_vertex_fire: 'vFogDepth = -mv.z;',
  fog_pars_fire: `varying float vFogDepth; uniform float fogNear; uniform float fogFar;`,
  fog_frag_fire: 'col *= 1.0 - smoothstep(fogNear, fogFar, vFogDepth);',
};

function shader(src, oct) {
  let s = src.replace('#define OCT', '');
  for (const [k, v] of Object.entries(FOG)) s = s.replace(`#include <${k}>`, v);
  return s.replace(/OCT/g, String(oct));
}

class Flame {
  constructor(field, i, x, y, z, base, phase) {
    this.field = field;
    this.i = i;
    this.pos = new THREE.Vector3(x, y, z);
    this.base = base;
    this.phase = phase;
    this._vis = true;
  }
  get visible() { return this._vis; }
  set visible(v) {
    v = !!v;
    if (v === this._vis) return;
    this._vis = v;
    this.field.par[this.i * 4 + 2] = v ? 1 : 0;
    this.field.aPar.needsUpdate = true;
  }
}

export class FireField {
  constructor(scene, max = 768) {
    this.max = max;
    const base = new THREE.PlaneGeometry(1, 1).translate(0, 0.5, 0);
    const g = new THREE.InstancedBufferGeometry();
    g.index = base.index;
    g.setAttribute('position', base.attributes.position);
    this.pos = new Float32Array(max * 3);
    this.par = new Float32Array(max * 4);
    this.col = new Float32Array(max * 3);
    this.aPos = new THREE.InstancedBufferAttribute(this.pos, 3);
    this.aPar = new THREE.InstancedBufferAttribute(this.par, 4);
    this.aCol = new THREE.InstancedBufferAttribute(this.col, 3);
    g.setAttribute('iPos', this.aPos);
    g.setAttribute('iPar', this.aPar);
    g.setAttribute('iCol', this.aCol);
    g.instanceCount = 0;
    this.geo = g;
    this.uniforms = THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { uTime: { value: 0 } }]);
    this.mat = this.makeMat(4);
    this.mesh = new THREE.Mesh(g, this.mat);
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = 6;
    scene.add(this.mesh);
    this.n = 0;
    this.color = new THREE.Color();
  }

  makeMat(oct) {
    return new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: shader(VERT, oct),
      fragmentShader: shader(FRAG, oct),
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      fog: true,
    });
  }

  // lav kvalitet: færre lag med støy
  setQuality(q) {
    const oct = q === 'lav' ? 2 : q === 'middels' ? 3 : 4;
    if (oct === this.oct) return;
    this.oct = oct;
    const old = this.mat;
    this.mat = this.makeMat(oct);
    this.mesh.material = this.mat;
    old.dispose();
  }

  add(x, y, z, hex, scale = 1, width = 1) {
    if (this.n >= this.max) return new Flame(this, this.max, x, y, z, scale, 0);
    const i = this.n++;
    const phase = Math.random() * 10;
    this.pos[i * 3] = x; this.pos[i * 3 + 1] = y; this.pos[i * 3 + 2] = z;
    this.par[i * 4] = scale; this.par[i * 4 + 1] = phase; this.par[i * 4 + 2] = 1; this.par[i * 4 + 3] = width;
    this.color.set(hex);
    this.col[i * 3] = this.color.r; this.col[i * 3 + 1] = this.color.g; this.col[i * 3 + 2] = this.color.b;
    this.geo.instanceCount = this.n;
    this.aPos.needsUpdate = this.aPar.needsUpdate = this.aCol.needsUpdate = true;
    return new Flame(this, i, x, y, z, scale, phase);
  }

  clear() {
    this.n = 0;
    this.geo.instanceCount = 0;
  }

  update(t) {
    this.uniforms.uTime.value = t;
  }
}
