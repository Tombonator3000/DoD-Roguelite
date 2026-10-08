import * as THREE from 'three';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

// Siste pass etter tonemapping: kromatisk aberrasjon, split-toning (kalde skygger,
// varme høylys), litt kontrast, vignett, filmkorn og et fargeblink for store treff.
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
    uFlash: { value: new THREE.Color(0, 0, 0) },
    uDesat: { value: 0 },
    uShadow: { value: new THREE.Color(0.9, 1.0, 1.1) },
    uHigh: { value: new THREE.Color(1.08, 1.0, 0.9) },
  },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: `
    uniform sampler2D tDiffuse; uniform float uTime, uCA, uCAPulse, uGrain, uVignette, uSat, uDesat;
    uniform vec2 uRes; uniform vec3 uFlash, uShadow, uHigh;
    varying vec2 vUv;
    float hash(vec2 p){ p = fract(p * vec2(443.897, 441.423)); p += dot(p, p.yx + 19.19); return fract((p.x + p.y) * p.x); }
    void main(){
      vec2 d = vUv - 0.5;
      float r2 = dot(d, d);
      float ca = (uCA + uCAPulse) * (0.4 + r2 * 3.0);
      vec3 col;
      col.r = texture2D(tDiffuse, vUv + d * ca).r;
      col.g = texture2D(tDiffuse, vUv).g;
      col.b = texture2D(tDiffuse, vUv - d * ca).b;
      float l = dot(col, vec3(0.299, 0.587, 0.114));
      col *= mix(uShadow, vec3(1.0), smoothstep(0.0, 0.45, l));
      col = mix(col, col * uHigh, smoothstep(0.35, 1.0, l));
      col = mix(col, col * col * (3.0 - 2.0 * col), 0.22);
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

export class GradePass extends ShaderPass {
  constructor() {
    super(GradeShader);
    this.flashCol = new THREE.Color(0, 0, 0);
    this.flashT = 0;
    this.caPulse = 0;
    this.desat = 0;
  }

  flash(color, amount = 0.25) {
    this.flashCol.set(color).multiplyScalar(amount);
    this.flashT = 1;
  }

  pulse(ca = 0.012) {
    this.caPulse = Math.max(this.caPulse, ca);
  }

  tick(dt, time) {
    const u = this.uniforms;
    u.uTime.value = time;
    this.flashT = Math.max(0, this.flashT - dt * 4);
    u.uFlash.value.copy(this.flashCol).multiplyScalar(this.flashT * this.flashT);
    this.caPulse = Math.max(0, this.caPulse - dt * 0.05);
    u.uCAPulse.value = this.caPulse;
    u.uDesat.value += (this.desat - u.uDesat.value) * Math.min(1, dt * 3);
  }
}
