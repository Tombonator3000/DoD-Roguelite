import * as THREE from 'three';

// Prosedyriske teksturer og spesialmaterialer for grafikkløftet.

function canvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return [c, c.getContext('2d')];
}
function tex(c, srgb = true) {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

// Myk mørk flekk under figurer (kontaktskygge)
export function blobTexture() {
  const [c, g] = canvas(128, 128);
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(255,255,255,1)');
  gr.addColorStop(0.45, 'rgba(255,255,255,0.65)');
  gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr;
  g.fillRect(0, 0, 128, 128);
  return tex(c, false);
}

// Firetagget stjerne for treff
export function starTexture() {
  const [c, g] = canvas(128, 128);
  g.translate(64, 64);
  const gr = g.createRadialGradient(0, 0, 0, 0, 0, 28);
  gr.addColorStop(0, 'rgba(255,255,255,1)');
  gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr;
  g.fillRect(-64, -64, 128, 128);
  for (const [a, len, w] of [[0, 62, 5], [Math.PI / 2, 62, 5], [Math.PI / 4, 34, 3], [-Math.PI / 4, 34, 3]]) {
    g.save();
    g.rotate(a);
    const lg = g.createLinearGradient(-len, 0, len, 0);
    lg.addColorStop(0, 'rgba(255,255,255,0)');
    lg.addColorStop(0.5, 'rgba(255,255,255,1)');
    lg.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = lg;
    g.beginPath();
    g.moveTo(-len, 0);
    g.lineTo(0, -w);
    g.lineTo(len, 0);
    g.lineTo(0, w);
    g.closePath();
    g.fill();
    g.restore();
  }
  return tex(c);
}

// Røykdott med støy
export function smokeTexture() {
  const S = 128;
  const [c, g] = canvas(S, S);
  const img = g.createImageData(S, S);
  const r = rng(7);
  const blobs = Array.from({ length: 9 }, () => [S / 2 + (r() - 0.5) * 50, S / 2 + (r() - 0.5) * 50, 18 + r() * 26]);
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    let a = 0;
    for (const [bx, by, br] of blobs) a += Math.max(0, 1 - Math.hypot(x - bx, y - by) / br);
    const edge = Math.max(0, 1 - Math.hypot(x - S / 2, y - S / 2) / (S / 2));
    a = Math.min(1, a * 0.55) * edge;
    const i = (y * S + x) * 4;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = 255;
    img.data[i + 3] = a * 255;
  }
  g.putImageData(img, 0, 0);
  return tex(c);
}

// Runesirkel: ringer, runer og en sjutakket stjerne
const RUNE_STROKES = [
  [[0, -1, 0, 1], [0, -1, 0.6, -0.4]],
  [[0, -1, 0, 1], [0, -0.2, 0.6, -0.8], [0, 0.2, 0.6, 0.8]],
  [[-0.5, -1, -0.5, 1], [0.5, -1, 0.5, 1], [-0.5, -0.4, 0.5, 0.4]],
  [[0, -1, 0, 1], [0, -1, 0.6, -0.5], [0.6, -0.5, 0, 0]],
  [[-0.5, 1, 0, -1], [0, -1, 0.5, 1]],
  [[0, -1, 0, 1], [-0.6, -0.3, 0.6, 0.3]],
  [[-0.5, -1, 0.5, 1], [0.5, -1, -0.5, 1]],
  [[0, -1, 0, 1], [0, 0, 0.6, -0.6], [0, 0, -0.6, -0.6]],
  [[-0.5, -1, -0.5, 1], [-0.5, -1, 0.5, -0.3], [0.5, -0.3, -0.5, 0.3]],
  [[0, -1, 0.6, 0], [0.6, 0, 0, 1], [0, 1, -0.6, 0], [-0.6, 0, 0, -1]],
];

export function drawRune(g, idx, x, y, s, rot = 0) {
  const st = RUNE_STROKES[idx % RUNE_STROKES.length];
  g.save();
  g.translate(x, y);
  g.rotate(rot);
  g.beginPath();
  for (const [x0, y0, x1, y1] of st) {
    g.moveTo(x0 * s, y0 * s);
    g.lineTo(x1 * s, y1 * s);
  }
  g.stroke();
  g.restore();
}

export function runeRingTexture(size = 512, seed = 3) {
  const [c, g] = canvas(size, size);
  const R = size / 2;
  g.translate(R, R);
  g.strokeStyle = 'rgba(255,255,255,1)';
  g.lineCap = 'round';
  g.shadowColor = 'rgba(255,255,255,0.9)';
  g.shadowBlur = size / 60;
  const ring = (r, w) => { g.lineWidth = w; g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.stroke(); };
  ring(R * 0.96, size / 120);
  ring(R * 0.9, size / 260);
  ring(R * 0.72, size / 160);
  ring(R * 0.66, size / 300);
  const r = rng(seed);
  const n = 24;
  g.lineWidth = size / 180;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    drawRune(g, Math.floor(r() * 10), Math.cos(a) * R * 0.81, Math.sin(a) * R * 0.81, R * 0.045, a + Math.PI / 2);
  }
  // sjutakket stjerne
  g.lineWidth = size / 220;
  g.beginPath();
  for (let i = 0; i <= 7; i++) {
    const a = ((i * 3) / 7) * Math.PI * 2 - Math.PI / 2;
    const x = Math.cos(a) * R * 0.64, y = Math.sin(a) * R * 0.64;
    if (i === 0) g.moveTo(x, y); else g.lineTo(x, y);
  }
  g.stroke();
  ring(R * 0.2, size / 200);
  return tex(c);
}

// Lysflekk under et rist i taket
export function grateTexture() {
  const S = 256;
  const [c, g] = canvas(S, S);
  const gr = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  gr.addColorStop(0, 'rgba(255,255,255,0.95)');
  gr.addColorStop(0.55, 'rgba(255,255,255,0.45)');
  gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr;
  g.fillRect(0, 0, S, S);
  g.globalCompositeOperation = 'destination-out';
  g.fillStyle = 'rgba(0,0,0,0.85)';
  for (let i = 1; i < 6; i++) {
    g.fillRect((i * S) / 6 - 5, 0, 10, S);
    g.fillRect(0, (i * S) / 6 - 5, S, 10);
  }
  return tex(c);
}

// Spindelvev i et hjørne
export function webTexture() {
  const S = 256;
  const [c, g] = canvas(S, S);
  g.strokeStyle = 'rgba(230,230,230,0.55)';
  g.lineWidth = 1.4;
  const spokes = 7;
  const ends = [];
  for (let i = 0; i < spokes; i++) {
    const a = (i / (spokes - 1)) * Math.PI * 0.5;
    const x = Math.cos(a) * S * 0.98, y = Math.sin(a) * S * 0.98;
    ends.push([a]);
    g.beginPath();
    g.moveTo(0, 0);
    g.lineTo(x, y);
    g.stroke();
  }
  for (let k = 1; k < 9; k++) {
    const rr = (k / 9) * S * 0.95;
    g.beginPath();
    for (let i = 0; i < spokes; i++) {
      const a = (i / (spokes - 1)) * Math.PI * 0.5;
      const sag = i > 0 && i < spokes ? 0.93 : 1;
      const x = Math.cos(a) * rr * sag, y = Math.sin(a) * rr * sag;
      if (i === 0) g.moveTo(x, y); else g.quadraticCurveTo(Math.cos(a - 0.1) * rr * 0.86, Math.sin(a - 0.1) * rr * 0.86, x, y);
    }
    g.stroke();
  }
  return tex(c);
}

// Banner: farget duk med gullkant og emblem
export function bannerTexture(kind) {
  const W = 128, H = 256;
  const [c, g] = canvas(W, H);
  const base = kind === 'rev' ? ['#5a0f0c', '#2a0606'] : ['#1a2a4a', '#0a1222'];
  const lg = g.createLinearGradient(0, 0, W, 0);
  lg.addColorStop(0, base[1]);
  lg.addColorStop(0.5, base[0]);
  lg.addColorStop(1, base[1]);
  g.fillStyle = lg;
  g.beginPath();
  g.moveTo(0, 0);
  g.lineTo(W, 0);
  g.lineTo(W, H - 40);
  g.lineTo(W / 2, H);
  g.lineTo(0, H - 40);
  g.closePath();
  g.fill();
  g.strokeStyle = '#c9a35a';
  g.lineWidth = 5;
  g.beginPath();
  g.moveTo(8, 6);
  g.lineTo(W - 8, 6);
  g.lineTo(W - 8, H - 44);
  g.lineTo(W / 2, H - 10);
  g.lineTo(8, H - 44);
  g.closePath();
  g.stroke();
  g.fillStyle = '#d8b060';
  g.strokeStyle = '#d8b060';
  g.lineWidth = 7;
  g.save();
  g.translate(W / 2, 105);
  if (kind === 'rev') {
    // revehode
    g.beginPath();
    g.moveTo(-34, -30);
    g.lineTo(-18, -4);
    g.lineTo(18, -4);
    g.lineTo(34, -30);
    g.lineTo(22, 10);
    g.lineTo(0, 42);
    g.lineTo(-22, 10);
    g.closePath();
    g.fill();
    g.fillStyle = base[1];
    g.fillRect(-14, 4, 8, 6);
    g.fillRect(6, 4, 8, 6);
  } else {
    // dvergehammer
    g.fillRect(-30, -34, 60, 26);
    g.fillRect(-5, -10, 10, 60);
    g.lineWidth = 3;
    drawRune(g, 2, 0, 74, 12);
  }
  g.restore();
  const t = tex(c);
  return t;
}

// Glødende dvergerunerekke for veggene
export function runeStripTexture(seed = 1) {
  const W = 256, H = 64;
  const [c, g] = canvas(W, H);
  g.strokeStyle = '#fff';
  g.lineWidth = 4;
  g.lineCap = 'round';
  g.shadowColor = '#fff';
  g.shadowBlur = 8;
  const r = rng(seed);
  for (let i = 0; i < 5; i++) drawRune(g, Math.floor(r() * 10), 28 + i * 50, 32, 20);
  return tex(c);
}

// Ruhetskart med sølepytter (lav ruhet = blank og våt)
export function puddleRoughness(seed = 5, wet = true) {
  const S = 256;
  const [c, g] = canvas(S, S);
  const img = g.createImageData(S, S);
  const r = rng(seed);
  const pts = Array.from({ length: wet ? 14 : 6 }, () => [r() * S, r() * S, 14 + r() * 34]);
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    let m = 0;
    for (const [px, py, pr] of pts) {
      for (const ox of [-S, 0, S]) for (const oy of [-S, 0, S]) {
        const dd = Math.hypot(x - px - ox, y - py - oy) / pr;
        m = Math.max(m, 1 - dd);
      }
    }
    const wob = Math.sin(x * 0.11 + y * 0.07) * 0.08 + Math.sin(x * 0.031 - y * 0.05) * 0.1;
    const puddle = wet ? Math.min(1, Math.max(0, (m + wob - 0.15) * 3)) : 0;
    const base = wet ? 0.78 : 0.82 + (Math.sin(x * 0.2) * Math.sin(y * 0.17)) * 0.06 - m * 0.25;
    const rough = base * (1 - puddle) + 0.12 * puddle;
    const i = (y * S + x) * 4;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = rough * 255;
    img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  const t = tex(c, false);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.channel = 1;
  return t;
}

// Volumetrisk lyssjakt: åpen kjegle med additiv shader
export function shaftMaterial(color = 0x9cc4ff, strength = 0.32) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uColor: { value: new THREE.Color(color) }, uStr: { value: strength } },
    vertexShader: `varying vec2 vUv; varying vec3 vN; varying vec3 vV;
      void main(){ vUv = uv; vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform float uTime, uStr; uniform vec3 uColor; varying vec2 vUv; varying vec3 vN; varying vec3 vV;
      float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
      float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f); return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y); }
      void main(){
        float facing = abs(dot(vN, vV));
        float a = pow(facing, 1.6);
        float y = vUv.y;
        a *= smoothstep(0.0, 0.18, y) * (1.0 - smoothstep(0.55, 1.0, y));
        float dust = n(vec2(vUv.x * 18.0, y * 6.0 - uTime * 0.25)) * 0.5 + n(vec2(vUv.x * 40.0 + uTime * 0.1, y * 14.0 - uTime * 0.6)) * 0.5;
        a *= 0.65 + dust * 0.7;
        gl_FragColor = vec4(uColor * a * uStr, 1.0);
      }`,
  });
}

export class Gfx {
  constructor() {
    this.blob = blobTexture();
    this.star = starTexture();
    this.smoke = smokeTexture();
    this.runeRing = runeRingTexture();
    this.grate = grateTexture();
    this.web = webTexture();
    this.banners = { dverg: bannerTexture('dverg'), rev: bannerTexture('rev') };
    this.runeStrips = [1, 2, 3, 4].map(runeStripTexture);
    this.blobMat = new THREE.MeshBasicMaterial({ color: 0x000000, alphaMap: this.blob, transparent: true, opacity: 0.6, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3 });
    this.blobGeo = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);
  }

  blobFor(radius, opacity = 0.6) {
    const m = new THREE.Mesh(this.blobGeo, opacity === 0.6 ? this.blobMat : this.blobMat.clone());
    if (opacity !== 0.6) m.material.opacity = opacity;
    m.scale.set(radius * 2.8, 1, radius * 2.8);
    m.position.y = 0.025;
    m.renderOrder = 1;
    return m;
  }
}
