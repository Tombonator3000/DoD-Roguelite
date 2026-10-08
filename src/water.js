import * as THREE from 'three';
import { G } from './state.js';

// ---------------------------------------------------------------------------
// Vann, versjon 2. Høyden lages av to lag med støy som flyter, ringer fra
// spilleren og plask, og regndråper når det regner. Normalen regnes ut av
// høyden, og den gir Fresnel-refleks av himmelen, et glimt av sola og
// speilbilder av faklene (de seks nærmeste lyskildene i lys-poolen).
// ---------------------------------------------------------------------------

const NRIP = 8;
const NL = 6;

const VERT = `
varying vec3 vW;
varying float vFogDepth;
void main(){
  vec4 w = modelMatrix * vec4(position, 1.0);
  vW = w.xyz;
  vec4 mv = viewMatrix * w;
  vFogDepth = -mv.z;
  gl_Position = projectionMatrix * mv;
}`;

const FRAG = `
uniform float uTime, uRain, uCaust;
uniform vec3 uPlayer, uDeep, uShallow, uGlint, uSky, uSkyH, uSunDir, uSunCol;
uniform vec2 uFlow;
uniform vec4 uRip[${NRIP}];
uniform vec3 uLP[${NL}];
uniform vec3 uLC[${NL}];
uniform vec3 fogColor;
uniform float fogNear, fogFar;
varying vec3 vW;
varying float vFogDepth;
float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(h(i), h(i + vec2(1.0, 0.0)), f.x), mix(h(i + vec2(0.0, 1.0)), h(i + vec2(1.0, 1.0)), f.x), f.y); }
// regndråper: én ring per celle, med tilfeldig fase og plass
float rain(vec2 p){
  vec2 c = floor(p / 0.7);
  vec2 f = p - (c + 0.5) * 0.7;
  float r = h(c);
  vec2 o = (vec2(h(c + 3.1), h(c + 7.7)) - 0.5) * 0.3;
  float ph = fract(uTime * (0.9 + r * 0.6) + r * 7.0);
  float d = length(f - o);
  float rr = ph * 0.32;
  return sin((d - rr) * 40.0) * exp(-pow((d - rr) * 18.0, 2.0)) * (1.0 - ph) * step(r, uRain * 1.2);
}
float height(vec2 p){
  vec2 fl = uFlow * uTime;
  float a = n(p * 0.55 - fl * 0.55 + vec2(uTime * 0.05, 0.0));
  float b = n(p * 1.7 - fl * 1.3 + vec2(-uTime * 0.12, uTime * 0.09));
  float hh = a * 0.6 + b * 0.3;
  for (int i = 0; i < ${NRIP}; i++) {
    vec4 r = uRip[i];
    float age = uTime - r.z;
    if (r.w <= 0.0 || age < 0.0 || age > 2.4) continue;
    float d = distance(p, r.xy);
    float front = age * 2.1;
    float k = exp(-pow((d - front) * 2.6, 2.0)) * r.w * (1.0 - age / 2.4) / (1.0 + d * 1.2);
    hh += sin((d - front) * 13.0) * k * 0.3;
  }
  if (uRain > 0.01) hh += rain(p) * 0.08 + rain(p * 1.37 + 5.0) * 0.06;
  return hh;
}
void main(){
  vec2 p = vW.xz;
  float e = 0.06;
  float h0 = height(p);
  float hx = height(p + vec2(e, 0.0));
  float hz = height(p + vec2(0.0, e));
  vec3 N = normalize(vec3(-(hx - h0) / e * 0.55, 1.0, -(hz - h0) / e * 0.55));
  vec3 V = normalize(cameraPosition - vW);
  float fres = 0.04 + 0.96 * pow(1.0 - max(dot(N, V), 0.0), 5.0);
  vec3 R = reflect(-V, N);
  vec3 sky = mix(uSkyH, uSky, smoothstep(0.0, 0.8, R.y));
  // gamle kaustikker, svakere der vannet speiler mest
  float m = n(p * 0.7 + vec2(uTime * 0.18, uTime * 0.06)) * 0.6 + n(p * 1.9 - vec2(uTime * 0.11, -uTime * 0.15)) * 0.4;
  float caust = pow(1.0 - abs(m * 2.0 - 1.0), 7.0);
  vec3 base = mix(uDeep, uShallow, clamp(h0 * 0.9 + 0.15, 0.0, 1.0)) + uGlint * caust * uCaust * (1.0 - fres);
  vec3 col = mix(base, sky, clamp(fres * 1.4, 0.0, 0.85));
  // sola eller nøkkellyset
  float sp = pow(max(dot(R, uSunDir), 0.0), 220.0);
  col += uSunCol * sp * 3.0;
  // faklene speiler seg
  for (int i = 0; i < ${NL}; i++) {
    vec3 L = uLP[i] - vW;
    float d2 = dot(L, L);
    vec3 Ld = L * inversesqrt(max(d2, 0.0001));
    float s = pow(max(dot(R, Ld), 0.0), 90.0);
    col += uLC[i] * (s * 2.2 + max(dot(N, Ld), 0.0) * 0.05) / (1.0 + d2 * 0.12);
  }
  // varmt skjær rundt spilleren (lykta)
  float pd = distance(p, uPlayer.xz);
  col += vec3(0.32, 0.22, 0.12) * smoothstep(8.0, 0.0, pd) * (0.15 + caust * 0.5) * uCaust;
  float fog = smoothstep(fogNear, fogFar, vFogDepth);
  col = mix(col, fogColor, fog);
  gl_FragColor = vec4(col, 0.86 + fres * 0.12);
}`;

const SHARED = {
  rip: Array.from({ length: NRIP }, () => new THREE.Vector4(0, 0, -99, 0)),
  lp: Array.from({ length: NL }, () => new THREE.Vector3(0, -99, 0)),
  lc: Array.from({ length: NL }, () => new THREE.Color(0, 0, 0)),
};

export function makeWaterMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    fog: true,
    uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, {
      uTime: { value: 0 },
      uRain: { value: 0 },
      uCaust: { value: 1 },
      uPlayer: { value: new THREE.Vector3() },
      uDeep: { value: new THREE.Color(0x041a15) },
      uShallow: { value: new THREE.Color(0x0f4436) },
      uGlint: { value: new THREE.Color(0x4fe6b4) },
      uSky: { value: new THREE.Color(0x1a2a28) },
      uSkyH: { value: new THREE.Color(0x0a1210) },
      uSunDir: { value: new THREE.Vector3(0, 1, 0) },
      uSunCol: { value: new THREE.Color(0, 0, 0) },
      uFlow: { value: new THREE.Vector2(0.08, 0.02) },
      uRip: { value: SHARED.rip },
      uLP: { value: SHARED.lp },
      uLC: { value: SHARED.lc },
    }]),
    vertexShader: VERT,
    fragmentShader: FRAG,
  });
}

const tv = new THREE.Vector3();

// Holder ringene og sender lys, sol og himmel til vannet på nivået.
export class WaterFX {
  constructor() {
    this.k = 0;
    this.stepT = 0;
  }

  ripple(x, z, amp = 1) {
    const r = SHARED.rip[this.k++ % NRIP];
    r.set(x, z, G.time, amp);
  }

  clear() {
    for (const r of SHARED.rip) r.set(0, 0, -99, 0);
  }

  update(dt) {
    const D = G.dungeon;
    const m = D?.waterMat;
    if (!m) return;
    const u = m.uniforms;
    const P = G.player;
    u.uTime.value = G.time;
    u.uPlayer.value.copy(P.pos);
    u.uRip.value = SHARED.rip;
    u.uLP.value = SHARED.lp;
    u.uLC.value = SHARED.lc;
    // ringer når noen går i vannet
    this.stepT -= dt;
    if (this.stepT <= 0) {
      this.stepT = 0.24;
      const moving = Math.hypot(P.vel?.x || 0, P.vel?.z || 0) > 0.6;
      if (moving && D.isWater(P.pos.x, P.pos.z)) this.ripple(P.pos.x, P.pos.z, 0.7);
      for (const e of G.enemies) {
        if (e.dead || Math.abs(e.pos.x - P.pos.x) + Math.abs(e.pos.z - P.pos.z) > 20) continue;
        if (D.isWater(e.pos.x, e.pos.z) && Math.random() < 0.35) { this.ripple(e.pos.x, e.pos.z, 0.5); break; }
      }
    }
    // de nærmeste lyskildene
    const L = G.world?.lights || [];
    for (let i = 0; i < NL; i++) {
      const l = L[i];
      if (!l || l.intensity <= 0) { SHARED.lc[i].setRGB(0, 0, 0); continue; }
      SHARED.lp[i].copy(l.position);
      SHARED.lc[i].copy(l.color).multiplyScalar(l.intensity * 0.05);
    }
    const key = G.game?.key;
    if (key) {
      tv.copy(key.position).sub(key.target.position).normalize();
      u.uSunDir.value.copy(tv);
      u.uSunCol.value.copy(key.color).multiplyScalar(Math.min(2.5, key.intensity) * (D.isTown ? 0.6 : 0.25));
    }
    const W = G.weather;
    u.uRain.value = D.isTown ? (W?.rain || 0) : 0;
    if (D.isTown && G.game?.sky?.sky) {
      u.uSky.value.copy(G.game.sky.sky).multiplyScalar(W ? 1 - W.cloud * 0.45 : 1);
      u.uSkyH.value.copy(G.game.sky.fog);
      u.uCaust.value = 0.35;
      u.uFlow.value.set(0, 0.35); // elva renner sørover
    } else {
      const fc = G.scene.fog?.color;
      if (fc) { u.uSky.value.copy(fc).multiplyScalar(1.6); u.uSkyH.value.copy(fc); }
      u.uCaust.value = 1;
      u.uFlow.value.set(0.08, 0.02);
    }
  }
}
