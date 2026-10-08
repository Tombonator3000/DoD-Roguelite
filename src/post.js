import * as THREE from 'three';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

// Siste pass etter tonemapping: tilt-shift (uskarpt øverst og nederst, som en
// modell sett gjennom et objektiv), kromatisk aberrasjon, fargegradering med
// split-toning (skyggefarge og høylysfarge per sted og tid på døgnet),
// kontrast, metning, vignett, filmkorn og et fargeblink for store treff.
const GradeShader = {
  uniforms: {
    tDiffuse: { value: null },
    uTime: { value: 0 },
    uRes: { value: new THREE.Vector2(1, 1) },
    uCA: { value: 0.0025 },
    uCAPulse: { value: 0 },
    uGrain: { value: 0.045 },
    uVignette: { value: 0.85 },
    uSat: { value: 1.08 },
    uCon: { value: 0.22 },
    uFlash: { value: new THREE.Color(0, 0, 0) },
    uDesat: { value: 0 },
    uShadow: { value: new THREE.Color(0.9, 1.0, 1.1) },
    uHigh: { value: new THREE.Color(1.08, 1.0, 0.9) },
    uTilt: { value: 0 },
    uFocus: { value: 0.52 },
  },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: `
    uniform sampler2D tDiffuse; uniform float uTime, uCA, uCAPulse, uGrain, uVignette, uSat, uCon, uDesat, uTilt, uFocus;
    uniform vec2 uRes; uniform vec3 uFlash, uShadow, uHigh;
    varying vec2 vUv;
    float hash(vec2 p){ p = fract(p * vec2(443.897, 441.423)); p += dot(p, p.yx + 19.19); return fract((p.x + p.y) * p.x); }
    void main(){
      vec2 d = vUv - 0.5;
      float r2 = dot(d, d);
      vec3 col;
      float tb = uTilt * smoothstep(0.16, 0.52, abs(vUv.y - uFocus));
      if (tb > 0.02) {
        // tilt-shift: ni prøver på en Vogel-skive, radius opp til seks piksler
        vec2 px = tb * 6.0 / uRes;
        float rot = hash(vUv * uRes) * 6.2832;
        col = texture2D(tDiffuse, vUv).rgb * 0.16;
        for (int i = 0; i < 8; i++) {
          float fi = float(i);
          float a = fi * 2.39996 + rot;
          float rr = sqrt((fi + 0.5) / 8.0);
          col += texture2D(tDiffuse, vUv + vec2(cos(a), sin(a)) * rr * px).rgb * 0.105;
        }
      } else {
        float ca = (uCA + uCAPulse) * (0.4 + r2 * 3.0);
        col.r = texture2D(tDiffuse, vUv + d * ca).r;
        col.g = texture2D(tDiffuse, vUv).g;
        col.b = texture2D(tDiffuse, vUv - d * ca).b;
      }
      float l = dot(col, vec3(0.299, 0.587, 0.114));
      col *= mix(uShadow, vec3(1.0), smoothstep(0.0, 0.45, l));
      col = mix(col, col * uHigh, smoothstep(0.35, 1.0, l));
      col = mix(col, col * col * (3.0 - 2.0 * col), uCon);
      l = dot(col, vec3(0.299, 0.587, 0.114));
      col = mix(vec3(l), col, uSat * (1.0 - uDesat));
      float v = smoothstep(0.95, 0.18, length(d * vec2(1.0, 0.9)) * 1.25);
      col *= mix(1.0, v, uVignette);
      float n = hash(vUv * uRes + fract(uTime * 7.31) * 100.0) - 0.5;
      col += n * uGrain * (0.6 + (1.0 - l) * 0.6);
      col += uFlash;
      gl_FragColor = vec4(col, 1.0);
    }`,
};

// Fargestemning per sted. shadow og high er multiplikatorer for skygger og høylys.
const C = (r, g, b) => new THREE.Color(r, g, b);
export const LOOKS = {
  kloakk: { shadow: C(0.86, 1.02, 0.98), high: C(1.08, 1.02, 0.86), sat: 1.06, con: 0.24 },
  dverg: { shadow: C(0.96, 0.92, 1.04), high: C(1.12, 0.98, 0.8), sat: 1.1, con: 0.24 },
  rev: { shadow: C(1.02, 0.86, 0.92), high: C(1.12, 0.94, 0.84), sat: 1.14, con: 0.3 },
  dag: { shadow: C(0.92, 0.98, 1.08), high: C(1.06, 1.02, 0.94), sat: 1.1, con: 0.2 },
  skumring: { shadow: C(0.96, 0.93, 1.08), high: C(1.08, 0.99, 0.9), sat: 1.06, con: 0.22 },
  natt: { shadow: C(0.84, 0.94, 1.18), high: C(1.06, 1.0, 0.94), sat: 0.94, con: 0.22 },
  regn: { shadow: C(0.88, 0.96, 1.1), high: C(0.98, 1.0, 1.04), sat: 0.82, con: 0.16 },
  tittel: { shadow: C(0.9, 1.0, 1.1), high: C(1.08, 1.0, 0.9), sat: 1.08, con: 0.22 },
};

export class GradePass extends ShaderPass {
  constructor() {
    super(GradeShader);
    this.flashCol = new THREE.Color(0, 0, 0);
    this.flashT = 0;
    this.caPulse = 0;
    this.desat = 0;
    this.tiltK = 1;
    this.tiltWant = 0.85;
    this.look = { shadow: LOOKS.tittel.shadow.clone(), high: LOOKS.tittel.high.clone(), sat: 1.08, con: 0.22 };
    this.tc = new THREE.Color();
  }

  flash(color, amount = 0.25) {
    this.flashCol.set(color).multiplyScalar(amount);
    this.flashT = 1;
  }

  pulse(ca = 0.012) {
    this.caPulse = Math.max(this.caPulse, ca);
  }

  // Sett stemningen. Byen blander dag, skumring og natt etter hvor mørkt det er, og regn oppå.
  mood(biome, night = 0, rain = 0) {
    const L = this.look;
    if (biome === 'stad') {
      const dusk = Math.max(0, 1 - Math.abs(night - 0.45) / 0.3);
      const a = night < 0.45 ? LOOKS.dag : LOOKS.natt;
      L.shadow.copy(a.shadow).lerp(LOOKS.skumring.shadow, dusk);
      L.high.copy(a.high).lerp(LOOKS.skumring.high, dusk);
      L.sat = a.sat + (LOOKS.skumring.sat - a.sat) * dusk;
      L.con = a.con;
      if (rain > 0) {
        L.shadow.lerp(LOOKS.regn.shadow, rain * 0.7);
        L.high.lerp(LOOKS.regn.high, rain * 0.7);
        L.sat += (LOOKS.regn.sat - L.sat) * rain * 0.7;
        L.con += (LOOKS.regn.con - L.con) * rain * 0.7;
      }
    } else {
      const a = LOOKS[biome] || LOOKS.tittel;
      L.shadow.copy(a.shadow); L.high.copy(a.high); L.sat = a.sat; L.con = a.con;
    }
  }

  // 0 slår av tilt-shift (lav kvalitet). Tittelskjermen får litt mindre.
  setTilt(k) { this.tiltK = k; }

  tick(dt, time) {
    const u = this.uniforms;
    u.uTime.value = time;
    this.flashT = Math.max(0, this.flashT - dt * 4);
    u.uFlash.value.copy(this.flashCol).multiplyScalar(this.flashT * this.flashT);
    this.caPulse = Math.max(0, this.caPulse - dt * 0.05);
    u.uCAPulse.value = this.caPulse;
    u.uDesat.value += (this.desat - u.uDesat.value) * Math.min(1, dt * 3);
    const k = Math.min(1, dt * 1.5);
    const L = this.look;
    u.uShadow.value.lerp(L.shadow, k);
    u.uHigh.value.lerp(L.high, k);
    u.uSat.value += (L.sat - u.uSat.value) * k;
    u.uCon.value += (L.con - u.uCon.value) * k;
    u.uTilt.value += (this.tiltWant * this.tiltK - u.uTilt.value) * Math.min(1, dt * 4);
  }
}
