// Prosedyriske teksturer for Fristaden: bindingsverk, takstein, halm, skifer,
// kobber, brostein, jord, gress og plankegulv. Lages én gang og gjenbrukes.
import * as THREE from 'three';
import { stoneTextures, hash2, fbm, smooth } from './assets.js';
import { paintedTexture } from './textures.js';

const cache = {};

// Lager farge- og normalkart fra en funksjon per piksel.
// fn(u, v, o) setter o.r, o.g, o.b (0..255) og o.h (høyde 0..1). v = 0 er nederst.
function procTex(size, fn, strength = 2.5, wantNormal = true) {
  const C = new Uint8ClampedArray(size * size * 4);
  const H = new Float32Array(size * size);
  const o = { r: 0, g: 0, b: 0, h: 0 };
  for (let y = 0; y < size; y++) {
    const v = 1 - (y + 0.5) / size;
    for (let x = 0; x < size; x++) {
      const u = (x + 0.5) / size;
      o.h = 0;
      fn(u, v, o);
      const i = y * size + x;
      C[i * 4] = o.r; C[i * 4 + 1] = o.g; C[i * 4 + 2] = o.b; C[i * 4 + 3] = 255;
      H[i] = o.h;
    }
  }
  const mk = (data, srgb) => {
    const cv = document.createElement('canvas');
    cv.width = cv.height = size;
    cv.getContext('2d').putImageData(new ImageData(data, size, size), 0, 0);
    const t = new THREE.CanvasTexture(cv);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = 4;
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    return t;
  };
  const out = { map: mk(C, true) };
  if (wantNormal) {
    const N = new Uint8ClampedArray(size * size * 4);
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      const xl = (x - 1 + size) % size, xr = (x + 1) % size, yu = (y - 1 + size) % size, yd = (y + 1) % size;
      const dx = (H[y * size + xr] - H[y * size + xl]) * strength;
      const dy = (H[yd * size + x] - H[yu * size + x]) * strength;
      const l = Math.hypot(dx, dy, 1);
      const i = (y * size + x) * 4;
      N[i] = (-dx / l * 0.5 + 0.5) * 255;
      N[i + 1] = (dy / l * 0.5 + 0.5) * 255;
      N[i + 2] = (1 / l * 0.5 + 0.5) * 255;
      N[i + 3] = 255;
    }
    out.normalMap = mk(N, false);
  }
  return out;
}

const mix = (a, b, t) => a + (b - a) * t;
const frac = x => x - Math.floor(x);

// Bindingsverk: én flis (2 m) bred, 2,8 m høy. Stolper ved u = 0 og 0,5.
function timber() {
  const wood = (u, v, o, k = 1) => {
    const g = fbm(u * 3, v * 40, 3, 5, 3);
    const c = 0.75 + 0.35 * g;
    o.r = 78 * c * k; o.g = 50 * c * k; o.b = 30 * c * k;
    o.h = 0.85 + g * 0.1;
  };
  return procTex(256, (u, v, o) => {
    if (v < 0.085) {
      // steinsokkel
      const row = Math.floor(v / 0.0425), off = row % 2 ? 0.125 : 0;
      const cu = frac((u + off) * 4), cv = frac(v / 0.0425);
      const edge = Math.min(cu, 1 - cu, cv * 0.5, (1 - cv) * 0.5);
      const id = hash2(Math.floor((u + off) * 4), row, 3);
      const n = fbm(u * 16, v * 16, 16, 7, 3);
      const k = (0.62 + 0.3 * id) * (0.85 + 0.3 * n);
      const m = smooth(0.0, 0.08, edge);
      o.r = mix(48, 132 * k, m); o.g = mix(44, 126 * k, m); o.b = mix(40, 116 * k, m);
      o.h = 0.5 * m + n * 0.1;
      return;
    }
    const post = Math.min(Math.abs(u), Math.abs(u - 0.5), Math.abs(1 - u));
    const isPost = post < 0.032;
    const sill = v < 0.13, top = v > 0.935, mid = Math.abs(v - 0.52) < 0.024;
    // skråbånd i øvre felt
    let brace = false;
    if (v > 0.545 && v < 0.93) {
      const t = (v - 0.545) / 0.385;
      const bu = u < 0.5 ? 0.035 + t * 0.43 : 0.965 - t * 0.43;
      brace = Math.abs(u - bu) < 0.022;
    }
    if (isPost || sill || top || mid || brace) { wood(u, v, o, isPost ? 1 : 0.9); return; }
    // puss
    const n = fbm(u * 6, v * 6, 6, 11, 4);
    const n2 = fbm(u * 24, v * 24, 24, 13, 2);
    const dirt = smooth(0.3, 0.13, v) * 0.25;
    const k = (0.9 + 0.12 * n + 0.05 * n2) * (1 - dirt);
    o.r = 236 * k; o.g = 226 * k; o.b = 206 * k;
    o.h = 0.38 + n2 * 0.05;
  }, 3.0);
}

function stoneWall() {
  return stoneTextures({ style: 'brick', cells: 8, base: [178, 168, 152], mortar: [86, 80, 72], vari: 0.16, seed: 71, normalStrength: 3.5 });
}

function cityWall() {
  return stoneTextures({ style: 'brick', cells: 6, base: [128, 120, 106], mortar: [52, 48, 42], vari: 0.22, moss: 0.35, mossCol: [70, 84, 50], seed: 83, normalStrength: 4 });
}

// --- tak (u langs mønet, v oppover takflaten) ---------------------------------
function roofTile() {
  return procTex(256, (u, v, o) => {
    const rows = 9, cols = 8;
    const row = Math.floor(v * rows), off = row % 2 ? 0.5 / cols : 0;
    const cu = frac((u + off) * cols), cv = frac(v * rows);
    const id = hash2(Math.floor((u + off) * cols), row, 21);
    const prof = Math.sin(cu * Math.PI);
    const shadow = smooth(0.0, 0.35, cv);
    const n = fbm(u * 12, v * 12, 12, 23, 3);
    const k = (0.55 + 0.45 * prof) * (0.45 + 0.55 * shadow) * (0.85 + 0.25 * id) * (0.9 + 0.2 * n);
    o.r = 170 * k; o.g = 78 * k; o.b = 48 * k;
    o.h = prof * 0.6 + cv * 0.4;
  }, 3.5);
}

function roofShingle() {
  return procTex(256, (u, v, o) => {
    const rows = 10;
    const row = Math.floor(v * rows);
    const w = 0.08 + 0.06 * hash2(row, 1, 31);
    const shift = hash2(row, 2, 31);
    const cu = frac(u / w + shift);
    const id = hash2(Math.floor(u / w + shift), row, 33);
    const cv = frac(v * rows);
    const edge = Math.min(cu, 1 - cu) * w * 40;
    const g = fbm(u * 8, v * 60, 8, 35, 3);
    const k = (0.5 + 0.5 * smooth(0, 0.4, cv)) * smooth(0, 0.5, edge) * (0.75 + 0.35 * id) * (0.85 + 0.25 * g);
    o.r = 120 * k + 10; o.g = 100 * k + 8; o.b = 80 * k + 6;
    o.h = cv * 0.5 + 0.3 * smooth(0, 0.5, edge);
  }, 3.0);
}

function roofThatch() {
  return procTex(256, (u, v, o) => {
    const rows = 5;
    const cv = frac(v * rows);
    const fib = fbm(u * 90, v * 4, 90, 41, 3);
    const n = fbm(u * 6, v * 6, 6, 43, 4);
    const k = (0.55 + 0.5 * fib) * (0.55 + 0.45 * smooth(0, 0.5, cv)) * (0.8 + 0.3 * n);
    o.r = 176 * k + 12; o.g = 140 * k + 8; o.b = 76 * k;
    o.h = fib * 0.4 + cv * 0.5;
  }, 2.5);
}

function roofSlate() {
  return procTex(256, (u, v, o) => {
    const rows = 9, cols = 7;
    const row = Math.floor(v * rows), off = row % 2 ? 0.5 / cols : 0;
    const cu = frac((u + off) * cols), cv = frac(v * rows);
    const id = hash2(Math.floor((u + off) * cols), row, 51);
    const edge = Math.min(cu, 1 - cu) * 2;
    const n = fbm(u * 20, v * 20, 20, 53, 3);
    const k = (0.5 + 0.5 * smooth(0, 0.3, cv)) * smooth(0, 0.08, edge) * (0.75 + 0.35 * id) * (0.85 + 0.25 * n);
    o.r = 82 * k + 8; o.g = 90 * k + 9; o.b = 102 * k + 12;
    o.h = cv * 0.5 + 0.3 * smooth(0, 0.08, edge);
  }, 3.0);
}

function roofCopper() {
  return procTex(256, (u, v, o) => {
    const cols = 6;
    const cu = frac(u * cols);
    const seam = smooth(0.06, 0.0, Math.min(cu, 1 - cu));
    const n = fbm(u * 8, v * 8, 8, 61, 4);
    const streak = fbm(u * 40, v * 3, 40, 63, 2);
    const k = 0.75 + 0.3 * n;
    o.r = (78 + 40 * streak) * k; o.g = (150 + 30 * streak) * k; o.b = (122 + 20 * streak) * k;
    if (seam > 0.3) { o.r *= 0.8; o.g *= 0.85; o.b *= 0.85; }
    o.h = seam * 0.8 + n * 0.1;
  }, 3.0);
}

// --- bakke -----------------------------------------------------------------------
function cobble() {
  return stoneTextures({ style: 'cobble', cells: 9, base: [132, 124, 112], mortar: [58, 52, 44], vari: 0.26, seed: 91, normalStrength: 3.2 });
}
function flag() {
  return stoneTextures({ style: 'flag', cells: 3, base: [184, 168, 138], mortar: [92, 82, 66], vari: 0.12, cracks: true, seed: 97, normalStrength: 2.4 });
}
function dirt() {
  return procTex(256, (u, v, o) => {
    const n = fbm(u * 5, v * 5, 5, 71, 4);
    const n2 = fbm(u * 30, v * 30, 30, 73, 2);
    // småstein
    const cu = frac(u * 22), cv = frac(v * 22);
    const id = hash2(Math.floor(u * 22), Math.floor(v * 22), 75);
    const peb = id > 0.82 ? smooth(0.32, 0.18, Math.hypot(cu - 0.5, cv - 0.5)) : 0;
    const k = 0.75 + 0.35 * n + 0.08 * n2;
    o.r = mix(112 * k, 140, peb * 0.6); o.g = mix(88 * k, 132, peb * 0.6); o.b = mix(62 * k, 118, peb * 0.6);
    o.h = n * 0.3 + peb * 0.5;
  }, 2.0);
}
function grass() {
  return procTex(512, (u, v, o) => {
    const n = fbm(u * 4, v * 4, 4, 81, 4);
    const n2 = fbm(u * 18, v * 18, 18, 83, 3);
    const blade = fbm(u * 160, v * 40, 160, 85, 2);
    const dry = smooth(0.55, 0.8, fbm(u * 3, v * 3, 3, 87, 3));
    const k = 0.62 + 0.3 * n + 0.18 * blade + 0.06 * n2;
    o.r = mix(64, 118, dry) * k; o.g = mix(104, 112, dry) * k; o.b = mix(42, 52, dry) * k;
    o.h = blade * 0.4 + n2 * 0.2;
  }, 1.5);
}
function planks() {
  return procTex(256, (u, v, o) => {
    const rows = 6;
    const row = Math.floor(v * rows);
    const cv = frac(v * rows);
    const len = 0.45 + 0.4 * hash2(row, 3, 91);
    const sh = hash2(row, 4, 91);
    const cu = frac(u / len + sh);
    const id = hash2(Math.floor(u / len + sh), row, 93);
    const seamV = smooth(0.0, 0.06, Math.min(cv, 1 - cv));
    const seamU = smooth(0.0, 0.012 / len, Math.min(cu, 1 - cu) * len);
    const grain = fbm(u * 4, v * 70, 4, 95, 3);
    const k = (0.7 + 0.3 * id) * (0.8 + 0.3 * grain) * (0.35 + 0.65 * seamV * seamU);
    o.r = 150 * k; o.g = 104 * k; o.b = 66 * k;
    o.h = seamV * seamU * 0.6 + grain * 0.1;
  }, 2.5);
}
// Gresstust med alfa til instanser
function tuft() {
  const S = 64;
  const cv = document.createElement('canvas');
  cv.width = cv.height = S;
  const g = cv.getContext('2d');
  for (let i = 0; i < 22; i++) {
    const x = S * 0.2 + Math.random() * S * 0.6, h = S * (0.45 + Math.random() * 0.5);
    const lean = (Math.random() - 0.5) * S * 0.35;
    const c = 0.65 + Math.random() * 0.45;
    g.strokeStyle = `rgb(${86 * c},${122 * c},${52 * c})`;
    g.lineWidth = 2 + Math.random() * 2;
    g.beginPath();
    g.moveTo(x, S);
    g.quadraticCurveTo(x + lean * 0.3, S - h * 0.5, x + lean, S - h);
    g.stroke();
  }
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// Fane for Tornväktarorden (hvit med svart tårn) og Zorakin (blå med gull sol)
function banner(kind) {
  const W = 128, H = 256;
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const g = cv.getContext('2d');
  g.fillStyle = kind === 'torn' ? '#e8e2d4' : '#1c2a5a';
  g.beginPath();
  g.moveTo(0, 0); g.lineTo(W, 0); g.lineTo(W, H - 36); g.lineTo(W / 2, H); g.lineTo(0, H - 36);
  g.closePath();
  g.fill();
  g.strokeStyle = kind === 'torn' ? '#2a2420' : '#d8b060';
  g.lineWidth = 5;
  g.strokeRect(9, 9, W - 18, H - 70);
  g.fillStyle = kind === 'torn' ? '#1a1614' : '#e0b860';
  if (kind === 'torn') {
    // tårn
    g.fillRect(44, 70, 40, 110);
    for (let i = 0; i < 3; i++) g.fillRect(40 + i * 18, 56, 12, 18);
    g.fillStyle = '#e8e2d4';
    g.fillRect(58, 92, 12, 22);
  } else {
    g.beginPath();
    g.arc(W / 2, 108, 24, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = '#e0b860';
    g.lineWidth = 6;
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      g.beginPath();
      g.moveTo(W / 2 + Math.cos(a) * 32, 108 + Math.sin(a) * 32);
      g.lineTo(W / 2 + Math.cos(a) * 48, 108 + Math.sin(a) * 48);
      g.stroke();
    }
  }
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// Navnebrett med enkle bokstaver
const signCache = {};
export function signTexture(text, sub) {
  const key = text + '|' + (sub || '');
  if (signCache[key]) return signCache[key];
  const W = 512, H = 160;
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const g = cv.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H);
  lg.addColorStop(0, '#5a3a22'); lg.addColorStop(1, '#3a2414');
  g.fillStyle = lg;
  g.fillRect(0, 0, W, H);
  for (let i = 0; i < 40; i++) {
    g.strokeStyle = `rgba(0,0,0,${0.08 + Math.random() * 0.1})`;
    g.beginPath();
    const y = Math.random() * H;
    g.moveTo(0, y); g.bezierCurveTo(W * 0.3, y + 4, W * 0.6, y - 4, W, y + 2);
    g.stroke();
  }
  g.strokeStyle = '#c9a35a';
  g.lineWidth = 6;
  g.strokeRect(8, 8, W - 16, H - 16);
  g.fillStyle = '#ecd9a8';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `bold ${sub ? 54 : 62}px Georgia, serif`;
  g.fillText(text, W / 2, sub ? H * 0.4 : H / 2 + 3);
  if (sub) { g.font = 'italic 30px Georgia, serif'; g.fillStyle = '#c9b58a'; g.fillText(sub, W / 2, H * 0.75); }
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  signCache[key] = t;
  return t;
}

export function townTextures() {
  if (cache.ready) return cache;
  cache.timber = paintedTexture('bindingsverk') || timber();
  cache.stone = paintedTexture('steinvegg') || stoneWall();
  cache.city = paintedTexture('bymur') || cityWall();
  cache.roof = {
    tile: paintedTexture('takstein') || roofTile(),
    shingle: paintedTexture('spon') || roofShingle(),
    thatch: paintedTexture('halm') || roofThatch(),
    slate: paintedTexture('skifer') || roofSlate(),
    copper: paintedTexture('kobber') || roofCopper(),
  };
  cache.roof.cone = cache.roof.slate;
  cache.cobble = paintedTexture('brostein') || cobble();
  cache.flag = paintedTexture('heller') || flag();
  cache.dirt = paintedTexture('jord') || dirt();
  cache.grass = paintedTexture('gress') || grass();
  cache.planks = paintedTexture('planker') || planks();
  cache.forest = paintedTexture('skogbunn') || cache.grass;
  cache.rock = paintedTexture('klippe') || cache.stone;
  cache.canvas = paintedTexture('teltduk');
  cache.tuft = tuft();
  cache.bannerTorn = banner('torn');
  cache.bannerSol = banner('sol');
  cache.ready = true;
  return cache;
}
