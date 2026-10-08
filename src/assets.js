import * as THREE from 'three';
import { puddleRoughness } from './gfx.js';

// ---------------------------------------------------------------------------
// Støy og prosedyriske teksturer (alt genereres i nettleseren, ingen bildefiler)
// ---------------------------------------------------------------------------

function hash2(x, y, seed) {
  let h = (x * 374761393 + y * 668265263 + seed * 1442695041) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967295;
}

function vnoise(x, y, period, seed) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = x - xi, yf = y - yi;
  const w = a => ((a % period) + period) % period;
  const a = hash2(w(xi), w(yi), seed), b = hash2(w(xi + 1), w(yi), seed);
  const c = hash2(w(xi), w(yi + 1), seed), dd = hash2(w(xi + 1), w(yi + 1), seed);
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  return a + (b - a) * u + (c - a) * v + (a - b - c + dd) * u * v;
}

function fbm(x, y, period, seed, oct = 4) {
  let s = 0, amp = 0.5, f = 1;
  for (let i = 0; i < oct; i++) {
    s += amp * vnoise(x * f, y * f, period * f, seed + i * 31);
    amp *= 0.5;
    f *= 2;
  }
  return s / 0.9375;
}

const smooth = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
export { hash2, vnoise, fbm, smooth };

/**
 * Lager fargetekstur + normalkart for stein.
 * style: 'cobble' (voronoi brostein), 'brick' (murstein), 'flag' (store heller)
 */
export function stoneTextures(o) {
  const size = o.size || 512;
  const cells = o.cells || 6;
  const seed = o.seed || 1;
  const H = new Float32Array(size * size);
  const C = new Uint8ClampedArray(size * size * 4);
  const rnd = (i, j, k = 0) => hash2(i, j, seed * 7 + k);
  const base = o.base, mortar = o.mortar, vari = o.vari ?? 0.25;
  const moss = o.moss || 0;
  const mossCol = o.mossCol || [50, 72, 40];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = (x / size) * cells, v = (y / size) * cells;
      let h = 0, cid = 0, cjd = 0;
      if (o.style === 'cobble') {
        const ci = Math.floor(u), cj = Math.floor(v);
        let f1 = 9, f2 = 9;
        for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
          const ni = ci + di, nj = cj + dj;
          const wi = ((ni % cells) + cells) % cells, wj = ((nj % cells) + cells) % cells;
          const px = ni + 0.15 + 0.7 * rnd(wi, wj, 1), py = nj + 0.15 + 0.7 * rnd(wi, wj, 2);
          const dist = Math.hypot(u - px, v - py);
          if (dist < f1) { f2 = f1; f1 = dist; cid = wi; cjd = wj; } else if (dist < f2) f2 = dist;
        }
        const edge = f2 - f1;
        h = smooth(0.02, 0.2, edge) * (1 - f1 * 0.35);
      } else {
        // brick / flag
        const rows = o.style === 'brick' ? cells : cells;
        const cols = o.style === 'brick' ? cells / 2 : cells;
        const ry = Math.floor(v);
        const off = o.style === 'brick' && ry % 2 ? 0.5 : 0;
        const ub = (x / size) * cols + off;
        const rx = Math.floor(ub);
        const fx = ub - rx, fy = v - ry;
        const ex = Math.min(fx, 1 - fx) / cols * (o.style === 'brick' ? 2 : 1);
        const ey = Math.min(fy, 1 - fy) / rows;
        const e = Math.min(ex, ey) * cells;
        h = smooth(0.0, o.style === 'brick' ? 0.09 : 0.06, e);
        cid = ((rx % cols) + cols) % cols;
        cjd = ((ry % rows) + rows) % rows;
        void rows;
      }
      const n = fbm((x / size) * 8, (y / size) * 8, 8, seed);
      const n2 = fbm((x / size) * 32, (y / size) * 32, 32, seed + 5, 2);
      const ct = 1 - vari + 2 * vari * rnd(cid, cjd, 3);
      // sprekker
      const crack = o.cracks ? smooth(0.48, 0.5, Math.abs(fbm((x / size) * 6, (y / size) * 6, 6, seed + 9, 3) - 0.5) * -1 + 0.5) : 0;
      let hh = h * (0.8 + 0.2 * n) + n2 * 0.08 * h - crack * 0.4 * h;
      H[y * size + x] = hh;
      const shade = (0.72 + 0.5 * n) * (0.9 + 0.2 * n2);
      let r = base[0] * ct * shade, g = base[1] * ct * shade, b = base[2] * ct * shade;
      const t = h;
      r = mortar[0] * (1 - t) + r * t;
      g = mortar[1] * (1 - t) + g * t;
      b = mortar[2] * (1 - t) + b * t;
      if (moss) {
        const mm = smooth(0.55, 0.8, fbm((x / size) * 4, (y / size) * 4, 4, seed + 3)) * (1 - h * 0.6) * moss;
        r = r * (1 - mm) + mossCol[0] * mm;
        g = g * (1 - mm) + mossCol[1] * mm;
        b = b * (1 - mm) + mossCol[2] * mm;
      }
      const i4 = (y * size + x) * 4;
      C[i4] = r; C[i4 + 1] = g; C[i4 + 2] = b; C[i4 + 3] = 255;
    }
  }
  const N = new Uint8ClampedArray(size * size * 4);
  const str = o.normalStrength || 3.0;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const xl = (x - 1 + size) % size, xr = (x + 1) % size, yu = (y - 1 + size) % size, yd = (y + 1) % size;
      const dx = (H[y * size + xr] - H[y * size + xl]) * str;
      const dy = (H[yd * size + x] - H[yu * size + x]) * str;
      const l = Math.hypot(dx, dy, 1);
      const i4 = (y * size + x) * 4;
      N[i4] = (-dx / l * 0.5 + 0.5) * 255;
      N[i4 + 1] = (dy / l * 0.5 + 0.5) * 255;
      N[i4 + 2] = (1 / l * 0.5 + 0.5) * 255;
      N[i4 + 3] = 255;
    }
  }
  const mk = (data, srgb) => {
    const cv = document.createElement('canvas');
    cv.width = cv.height = size;
    cv.getContext('2d').putImageData(new ImageData(data, size, size), 0, 0);
    const tx = new THREE.CanvasTexture(cv);
    tx.wrapS = tx.wrapT = THREE.RepeatWrapping;
    tx.anisotropy = 4;
    if (srgb) tx.colorSpace = THREE.SRGBColorSpace;
    return tx;
  };
  return { map: mk(C, true), normalMap: mk(N, false) };
}

function radialTexture(size, stops) {
  const cv = document.createElement('canvas');
  cv.width = cv.height = size;
  const g = cv.getContext('2d');
  const gr = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  for (const [p, c] of stops) gr.addColorStop(p, c);
  g.fillStyle = gr;
  g.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function flameTexture() {
  const w = 64, h = 128;
  const cv = document.createElement('canvas');
  cv.width = w;
  cv.height = h;
  const g = cv.getContext('2d');
  const img = g.createImageData(w, h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const u = (x / w - 0.5) * 2, v = y / h; // v: 0 topp, 1 bunn
      const width = Math.pow(v, 0.7) * (1 - Math.pow(v, 6)) * 1.05;
      const dd = Math.abs(u) / Math.max(width, 0.001);
      let a = Math.max(0, 1 - dd);
      a = Math.pow(a, 1.4) * smooth(0.0, 0.35, v);
      const core = Math.pow(Math.max(0, 1 - dd * 1.6), 2) * smooth(0.45, 0.85, v);
      const i = (y * w + x) * 4;
      img.data[i] = 255;
      img.data[i + 1] = 140 + 115 * core;
      img.data[i + 2] = 40 + 200 * core;
      img.data[i + 3] = 255 * a;
    }
  }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function labelTexture(text, w = 256, h = 64, color = '#e6d9bd', bg = '#2a1a10') {
  const cv = document.createElement('canvas');
  cv.width = w;
  cv.height = h;
  const g = cv.getContext('2d');
  g.fillStyle = bg;
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#8a6a3a';
  g.lineWidth = 4;
  g.strokeRect(4, 4, w - 8, h - 8);
  g.fillStyle = color;
  g.font = 'bold 34px Georgia, serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText(text, w / 2, h / 2 + 2);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// ---------------------------------------------------------------------------
// Shader-tillegg: kantlys + treffblink, og gjennomsiktig sirkel rundt spilleren
// ---------------------------------------------------------------------------

export function addRimFlash(mat, rim = 0x000000, pow = 3.0, shared = null) {
  const u = shared || {
    uRim: { value: new THREE.Color(rim) },
    uFlash: { value: 0 },
    uRimPow: { value: pow },
    uDissolve: { value: 0 },
    uDissolveCol: { value: new THREE.Color(0xff6a20) },
  };
  mat.userData.fx = u;
  mat.onBeforeCompile = sh => {
    Object.assign(sh.uniforms, u);
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vDPos;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvDPos = position;');
    sh.fragmentShader = sh.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
        uniform vec3 uRim; uniform float uFlash; uniform float uRimPow; uniform float uDissolve; uniform vec3 uDissolveCol;
        varying vec3 vDPos;
        float dHash(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
        float dNoise(vec3 x){ vec3 i = floor(x), f = fract(x); f = f*f*(3.0-2.0*f);
          return mix(mix(mix(dHash(i), dHash(i+vec3(1,0,0)), f.x), mix(dHash(i+vec3(0,1,0)), dHash(i+vec3(1,1,0)), f.x), f.y),
                     mix(mix(dHash(i+vec3(0,0,1)), dHash(i+vec3(1,0,1)), f.x), mix(dHash(i+vec3(0,1,1)), dHash(i+vec3(1,1,1)), f.x), f.y), f.z); }`
      )
      .replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
        float rimF = pow(1.0 - clamp(dot(normalize(normal), normalize(vViewPosition)), 0.0, 1.0), uRimPow);
        totalEmissiveRadiance += uRim * rimF + vec3(uFlash) * vec3(1.0, 0.92, 0.85);
        if (uDissolve > 0.0) {
          float dn = dNoise(vDPos * 7.0) * 0.65 + dNoise(vDPos * 19.0) * 0.35;
          if (dn < uDissolve) discard;
          totalEmissiveRadiance += uDissolveCol * smoothstep(uDissolve + 0.09, uDissolve, dn) * 4.0;
        }`
      );
  };
  mat.customProgramCacheKey = () => 'rimflash2';
  return u;
}

// Inverted hull-kontur: baksiden av modellen, blåst opp langs normalene
export function makeOutline(geo, thickness = 0.02, color = 0x050304) {
  const m = new THREE.MeshBasicMaterial({ color, side: THREE.BackSide });
  const u = { uOutline: { value: thickness } };
  m.onBeforeCompile = sh => {
    sh.uniforms.uOutline = u.uOutline;
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nuniform float uOutline;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\ntransformed += normalize(normal) * uOutline;');
  };
  m.customProgramCacheKey = () => 'outline';
  const mesh = new THREE.Mesh(geo, m);
  mesh.userData.outline = u;
  mesh.castShadow = false;
  return mesh;
}

export const cutawayUniforms = {
  uCutPos: { value: new THREE.Vector2(-9999, -9999) },
  uCutDepth: { value: 0 },
  uCutR: { value: 0 },
};

export function addCutaway(mat) {
  mat.onBeforeCompile = sh => {
    Object.assign(sh.uniforms, cutawayUniforms);
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying float vViewZ; varying float vWY;')
      .replace('#include <project_vertex>', '#include <project_vertex>\nvViewZ = -mvPosition.z; vWY = (modelMatrix * vec4(transformed, 1.0)).y;');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying float vViewZ; varying float vWY; uniform vec2 uCutPos; uniform float uCutDepth; uniform float uCutR;')
      .replace(
        'void main() {',
        `void main() {
        if (vViewZ < uCutDepth - 1.2 && vWY > 1.1) {
          float k = distance(gl_FragCoord.xy, uCutPos) / uCutR;
          float ign = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));
          if (k < 1.0 && ign > smoothstep(0.55, 1.0, k)) discard;
        }`
      );
  };
  mat.customProgramCacheKey = () => 'cutaway';
}

// ---------------------------------------------------------------------------
// Anda (Svart Nebb): dekoding av eget binærformat
// ---------------------------------------------------------------------------

export function decodeDuck(b64) {
  const s = atob(b64);
  const bin = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) bin[i] = s.charCodeAt(i);
  const buf = bin.buffer;
  const dv = new DataView(buf);
  const magic = String.fromCharCode(bin[0], bin[1], bin[2], bin[3]);
  if (magic !== 'DUCK') throw new Error('Ugyldig modellfil');
  const vc = dv.getUint32(4, true), ic = dv.getUint32(8, true);
  const mn = [dv.getFloat32(12, true), dv.getFloat32(16, true), dv.getFloat32(20, true)];
  const mx = [dv.getFloat32(24, true), dv.getFloat32(28, true), dv.getFloat32(32, true)];
  let off = 36;
  const q = new Uint16Array(buf, off, vc * 3); off += vc * 6;
  const nq = new Int8Array(buf, off, vc * 3); off += vc * 3;
  if (off % 2) off++;
  const uvq = new Uint16Array(buf, off, vc * 2); off += vc * 4;
  const idx = new Uint16Array(buf, off, ic);
  const pos = new Float32Array(vc * 3), nrm = new Float32Array(vc * 3), uv = new Float32Array(vc * 2);
  for (let i = 0; i < vc; i++) {
    for (let k = 0; k < 3; k++) {
      pos[i * 3 + k] = mn[k] + (q[i * 3 + k] / 65535) * (mx[k] - mn[k]);
      nrm[i * 3 + k] = nq[i * 3 + k] / 127;
    }
    uv[i * 2] = uvq[i * 2] / 65535;
    uv[i * 2 + 1] = uvq[i * 2 + 1] / 65535;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.BufferAttribute(nrm, 3));
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  g.setIndex(new THREE.BufferAttribute(new Uint16Array(idx), 1));
  g.computeBoundingSphere();
  g.computeBoundingBox();
  return g;
}

// ---------------------------------------------------------------------------
// Hjelpere for primitive modeller
// ---------------------------------------------------------------------------

const geoCache = new Map();
function geo(key, make) {
  if (!geoCache.has(key)) geoCache.set(key, make());
  return geoCache.get(key);
}
const SPH = (r = 0.5, w = 14, h = 10) => geo(`s${r}${w}${h}`, () => new THREE.SphereGeometry(r, w, h));
const CAP = (r, l, rs = 10) => geo(`c${r}${l}${rs}`, () => new THREE.CapsuleGeometry(r, l, 4, rs));
const CYL = (rt, rb, h, rs = 10) => geo(`y${rt}${rb}${h}${rs}`, () => new THREE.CylinderGeometry(rt, rb, h, rs));
const BOX = (x, y, z) => geo(`b${x}${y}${z}`, () => new THREE.BoxGeometry(x, y, z));
const CONE = (r, h, rs = 10) => geo(`k${r}${h}${rs}`, () => new THREE.ConeGeometry(r, h, rs));
const TOR = (r, t, rs = 8, ts = 20, arc = Math.PI * 2) => geo(`t${r}${t}${rs}${ts}${arc}`, () => new THREE.TorusGeometry(r, t, rs, ts, arc));

function mat(color, o = {}) {
  const m = new THREE.MeshStandardMaterial({
    color,
    roughness: o.r ?? 0.8,
    metalness: o.m ?? 0,
    emissive: o.e ?? 0x000000,
    emissiveIntensity: o.ei ?? 1,
  });
  return m;
}

function part(g, m, x = 0, y = 0, z = 0, parent = null, shadow = true) {
  const mesh = new THREE.Mesh(g, m);
  mesh.position.set(x, y, z);
  mesh.castShadow = shadow;
  if (parent) parent.add(mesh);
  return mesh;
}

function pivot(x, y, z, parent) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  parent.add(g);
  return g;
}

// Hver fiende får egne materialer (for treffblink), men deler geometri.
function finish(root, parts, rim) {
  const mats = new Set();
  root.traverse(o => {
    if (o.isMesh && o.material && !o.material.userData.noFx) mats.add(o.material);
  });
  const fx = [];
  for (const m of mats) fx.push(addRimFlash(m, rim, 2.6));
  return { root, parts, fx };
}

export const prim = { SPH, CAP, CYL, BOX, CONE, TOR, mat, part, pivot, finish };

export function buildRat() {
  const root = new THREE.Group();
  const fur = mat(0x4a3a30, { r: 0.95 });
  const pink = mat(0xb07a78, { r: 0.7 });
  const eye = mat(0x000000, { e: 0xff2a10, ei: 3 });
  const body = pivot(0, 0.3, 0, root);
  const torso = part(SPH(), fur, 0, 0, 0, body);
  torso.scale.set(0.55, 0.42, 0.9);
  const head = pivot(0, 0.06, 0.45, body);
  const hm = part(SPH(), fur, 0, 0, 0, head);
  hm.scale.set(0.32, 0.28, 0.42);
  const snout = part(CONE(0.11, 0.28, 8), fur, 0, -0.02, 0.27, head);
  snout.rotation.x = Math.PI / 2;
  part(SPH(0.04, 8, 6), pink, 0, -0.02, 0.41, head);
  part(SPH(0.035, 8, 6), eye, 0.09, 0.06, 0.15, head, false);
  part(SPH(0.035, 8, 6), eye, -0.09, 0.06, 0.15, head, false);
  const e1 = part(SPH(0.08, 8, 6), pink, 0.12, 0.15, 0.0, head);
  e1.scale.set(1, 1, 0.4);
  const e2 = part(SPH(0.08, 8, 6), pink, -0.12, 0.15, 0.0, head);
  e2.scale.set(1, 1, 0.4);
  const tail = pivot(0, 0.0, -0.42, body);
  const tm = part(CYL(0.015, 0.05, 0.9, 6), pink, 0, 0, -0.45, tail);
  tm.rotation.x = Math.PI / 2;
  const legs = [];
  for (const [x, z] of [[0.18, 0.25], [-0.18, 0.25], [0.18, -0.25], [-0.18, -0.25]]) {
    const lp = pivot(x, 0.18, z, root);
    part(CYL(0.04, 0.03, 0.2, 6), pink, 0, -0.1, 0, lp);
    legs.push(lp);
  }
  return finish(root, { body, head, tail, legs }, 0x2a0c06);
}

export function buildSkeleton() {
  const root = new THREE.Group();
  const bone = mat(0xd6ccb0, { r: 0.85 });
  const dark = mat(0x1a1410, { r: 1 });
  const glow = mat(0x000000, { e: 0x5cffd0, ei: 4 });
  const rust = mat(0x6b4a34, { r: 0.6, m: 0.6 });
  const hips = pivot(0, 0.95, 0, root);
  part(BOX(0.38, 0.14, 0.2), bone, 0, 0, 0, hips);
  const torso = pivot(0, 0.05, 0, hips);
  part(CYL(0.045, 0.045, 0.55, 6), bone, 0, 0.28, -0.04, torso);
  for (let i = 0; i < 4; i++) {
    const rib = part(TOR(0.2 - i * 0.02, 0.022, 5, 14, Math.PI * 1.6), bone, 0, 0.32 + i * 0.09, 0.02, torso);
    rib.rotation.x = Math.PI / 2;
    rib.rotation.z = Math.PI * 1.2;
  }
  const head = pivot(0, 0.82, 0.02, torso);
  part(SPH(0.19, 12, 10), bone, 0, 0, 0, head);
  part(BOX(0.22, 0.08, 0.18), bone, 0, -0.14, 0.04, head);
  part(SPH(0.045, 8, 6), dark, 0.07, 0.01, 0.15, head, false);
  part(SPH(0.045, 8, 6), dark, -0.07, 0.01, 0.15, head, false);
  part(SPH(0.025, 8, 6), glow, 0.07, 0.01, 0.17, head, false);
  part(SPH(0.025, 8, 6), glow, -0.07, 0.01, 0.17, head, false);
  const armL = pivot(0.26, 0.62, 0, torso);
  const armR = pivot(-0.26, 0.62, 0, torso);
  for (const a of [armL, armR]) {
    part(CYL(0.035, 0.03, 0.42, 6), bone, 0, -0.21, 0, a);
    part(CYL(0.03, 0.025, 0.38, 6), bone, 0, -0.58, 0.04, a);
  }
  const sword = pivot(0, -0.78, 0.08, armR);
  part(BOX(0.06, 0.08, 0.22), rust, 0, 0, 0, sword);
  const blade = part(BOX(0.05, 0.02, 0.9), rust, 0, 0, 0.5, sword);
  void blade;
  const legL = pivot(0.12, 0, 0, hips);
  const legR = pivot(-0.12, 0, 0, hips);
  for (const l of [legL, legR]) {
    part(CYL(0.045, 0.035, 0.48, 6), bone, 0, -0.24, 0, l);
    part(CYL(0.035, 0.03, 0.42, 6), bone, 0, -0.68, 0, l);
    part(BOX(0.1, 0.05, 0.18), bone, 0, -0.92, 0.05, l);
  }
  return finish(root, { hips, torso, head, armL, armR, legL, legR, weapon: sword }, 0x14302a);
}

export function buildGoblin() {
  const root = new THREE.Group();
  const skin = mat(0x6d8a3c, { r: 0.8 });
  const cloth = mat(0x4a3424, { r: 0.95 });
  const eye = mat(0x000000, { e: 0xffd040, ei: 3 });
  const wood = mat(0x5a3a1e, { r: 0.7 });
  const body = pivot(0, 0.62, 0, root);
  part(CAP(0.24, 0.3), cloth, 0, 0, 0, body);
  const head = pivot(0, 0.45, 0.02, body);
  part(SPH(0.24, 12, 10), skin, 0, 0, 0, head);
  const nose = part(CONE(0.06, 0.2, 6), skin, 0, -0.02, 0.26, head);
  nose.rotation.x = Math.PI / 2;
  for (const s of [1, -1]) {
    const ear = part(CONE(0.07, 0.36, 6), skin, s * 0.27, 0.05, -0.02, head);
    ear.rotation.z = -s * Math.PI / 2.3;
    part(SPH(0.035, 8, 6), eye, s * 0.09, 0.05, 0.2, head, false);
  }
  const hood = part(CONE(0.28, 0.35, 10), cloth, 0, 0.2, -0.05, head);
  hood.rotation.x = -0.3;
  const armL = pivot(0.26, 0.15, 0, body);
  const armR = pivot(-0.26, 0.15, 0, body);
  for (const a of [armL, armR]) part(CYL(0.06, 0.05, 0.42, 6), skin, 0, -0.2, 0, a);
  const bow = pivot(0, -0.38, 0.12, armL);
  const bm = part(TOR(0.42, 0.022, 5, 18, Math.PI), wood, 0, 0, 0, bow);
  bm.rotation.y = Math.PI / 2;
  bm.rotation.x = -Math.PI / 2;
  const legL = pivot(0.11, -0.25, 0, body);
  const legR = pivot(-0.11, -0.25, 0, body);
  for (const l of [legL, legR]) part(CYL(0.07, 0.05, 0.38, 6), skin, 0, -0.18, 0, l);
  return finish(root, { body, head, armL, armR, legL, legR, weapon: bow }, 0x2a2208);
}

export function buildOrc() {
  const root = new THREE.Group();
  const skin = mat(0x58664a, { r: 0.75 });
  const leather = mat(0x3a2a20, { r: 0.9 });
  const metal = mat(0x5a5650, { r: 0.45, m: 0.8 });
  const tusk = mat(0xe8e0c8, { r: 0.5 });
  const eye = mat(0x000000, { e: 0xff3020, ei: 3 });
  const body = pivot(0, 1.25, 0, root);
  const bm = part(CAP(0.5, 0.65, 12), skin, 0, 0, 0, body);
  bm.scale.set(1.1, 1, 0.85);
  part(CYL(0.55, 0.5, 0.35, 12), leather, 0, -0.35, 0, body);
  const head = pivot(0, 0.78, 0.12, body);
  part(SPH(0.32, 12, 10), skin, 0, 0, 0, head);
  part(BOX(0.4, 0.2, 0.3), skin, 0, -0.14, 0.1, head);
  for (const s of [1, -1]) {
    const t = part(CONE(0.04, 0.16, 6), tusk, s * 0.12, -0.08, 0.26, head);
    t.rotation.x = -0.3;
    part(SPH(0.04, 8, 6), eye, s * 0.11, 0.06, 0.27, head, false);
    const pad = part(SPH(0.26, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2), metal, s * 0.55, 0.5, 0, body);
    pad.scale.set(1, 0.7, 1);
  }
  const armL = pivot(0.62, 0.42, 0, body);
  const armR = pivot(-0.62, 0.42, 0, body);
  for (const a of [armL, armR]) {
    part(CAP(0.14, 0.45), skin, 0, -0.35, 0, a);
    part(SPH(0.15, 8, 6), skin, 0, -0.75, 0.05, a);
  }
  const axe = pivot(0, -0.8, 0.1, armR);
  const handle = part(CYL(0.04, 0.04, 1.3, 6), leather, 0, 0, 0.45, axe);
  handle.rotation.x = Math.PI / 2;
  const blade = part(BOX(0.06, 0.5, 0.38), metal, 0, 0.18, 1.0, axe);
  void blade;
  const legL = pivot(0.25, -0.55, 0, body);
  const legR = pivot(-0.25, -0.55, 0, body);
  for (const l of [legL, legR]) part(CAP(0.17, 0.4), leather, 0, -0.35, 0, l);
  return finish(root, { body, head, armL, armR, legL, legR, weapon: axe }, 0x2a1008);
}

export function buildFox() {
  const root = new THREE.Group();
  const fur = mat(0xc85a22, { r: 0.85 });
  const white = mat(0xeee4d4, { r: 0.85 });
  const black = mat(0x1a1210, { r: 0.9 });
  const plate = mat(0x5a1414, { r: 0.4, m: 0.7 });
  const gold = mat(0xc8a050, { r: 0.3, m: 1 });
  const eye = mat(0x000000, { e: 0xffd040, ei: 4 });
  const steel = mat(0x8a8a90, { r: 0.25, m: 1, e: 0x400808, ei: 1 });
  const body = pivot(0, 1.55, 0, root);
  const torso = part(CAP(0.45, 0.8, 12), fur, 0, 0, 0, body);
  torso.rotation.x = 0.12;
  part(BOX(0.7, 0.75, 0.25), plate, 0, 0.05, 0.32, body);
  part(SPH(0.3, 10, 8), white, 0, 0.35, 0.3, body).scale.set(1, 0.7, 0.5);
  const head = pivot(0, 0.95, 0.15, body);
  part(SPH(0.33, 14, 12), fur, 0, 0, 0, head);
  const snout = part(CONE(0.17, 0.5, 10), fur, 0, -0.08, 0.4, head);
  snout.rotation.x = Math.PI / 2;
  part(SPH(0.06, 8, 6), black, 0, -0.08, 0.65, head);
  for (const s of [1, -1]) {
    part(SPH(0.15, 8, 6), white, s * 0.15, -0.12, 0.18, head);
    const ear = part(CONE(0.11, 0.38, 8), fur, s * 0.17, 0.36, -0.04, head);
    ear.rotation.z = -s * 0.2;
    part(SPH(0.045, 8, 6), eye, s * 0.13, 0.06, 0.27, head, false);
    const pad = part(SPH(0.28, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2), plate, s * 0.5, 0.45, 0, body);
    pad.scale.set(1, 0.8, 1);
  }
  const crown = part(TOR(0.2, 0.035, 6, 16), gold, 0, 0.27, 0, head);
  crown.rotation.x = Math.PI / 2;
  const tail = pivot(0, -0.3, -0.38, body);
  const tm = part(SPH(0.5, 12, 10), fur, 0, 0.1, -0.6, tail);
  tm.scale.set(0.5, 0.45, 1.2);
  part(SPH(0.22, 10, 8), white, 0, 0.18, -1.15, tail);
  tail.rotation.x = -0.5;
  const armL = pivot(0.55, 0.38, 0, body);
  const armR = pivot(-0.55, 0.38, 0, body);
  for (const a of [armL, armR]) part(CAP(0.13, 0.55), fur, 0, -0.38, 0, a);
  const sword = pivot(0, -0.78, 0.08, armR);
  part(BOX(0.3, 0.06, 0.06), gold, 0, 0, 0.05, sword);
  const bl = part(BOX(0.09, 0.03, 1.5), steel, 0, 0, 0.85, sword);
  void bl;
  const legL = pivot(0.2, -0.6, 0, body);
  const legR = pivot(-0.2, -0.6, 0, body);
  for (const l of [legL, legR]) part(CAP(0.15, 0.55), black, 0, -0.42, 0, l);
  root.scale.setScalar(1.05);
  return finish(root, { body, head, armL, armR, legL, legR, weapon: sword, tail }, 0x6a2008);
}

// ---------------------------------------------------------------------------
// Rekvisitter
// ---------------------------------------------------------------------------

export function buildBarrel() {
  const g = new THREE.Group();
  const wood = mat(0x5e3e22, { r: 0.85 });
  const band = mat(0x3a3430, { r: 0.5, m: 0.7 });
  part(CYL(0.42, 0.42, 0.95, 12), wood, 0, 0.48, 0, g);
  part(CYL(0.47, 0.47, 0.08, 12), band, 0, 0.2, 0, g);
  part(CYL(0.47, 0.47, 0.08, 12), band, 0, 0.76, 0, g);
  g.traverse(o => { if (o.isMesh) o.receiveShadow = true; });
  return g;
}

export function buildCrate() {
  const g = new THREE.Group();
  const wood = mat(0x6a4a2a, { r: 0.9 });
  const dark = mat(0x3e2a18, { r: 0.9 });
  part(BOX(0.85, 0.85, 0.85), wood, 0, 0.43, 0, g);
  const s1 = part(BOX(0.9, 0.12, 0.9), dark, 0, 0.12, 0, g);
  const s2 = part(BOX(0.9, 0.12, 0.9), dark, 0, 0.75, 0, g);
  void s1; void s2;
  g.traverse(o => { if (o.isMesh) o.receiveShadow = true; });
  return g;
}

export function buildChest() {
  const g = new THREE.Group();
  const wood = mat(0x5a3418, { r: 0.8 });
  const gold = mat(0xb08a3c, { r: 0.35, m: 1 });
  part(BOX(1.1, 0.55, 0.7), wood, 0, 0.3, 0, g);
  part(BOX(1.14, 0.08, 0.74), gold, 0, 0.56, 0, g);
  const lid = pivot(0, 0.58, -0.35, g);
  const lm = part(CYL(0.35, 0.35, 1.1, 10, 1, false), wood, 0, 0, 0.35, lid);
  lm.rotation.z = Math.PI / 2;
  lm.scale.set(1, 1, 1);
  part(BOX(0.16, 0.2, 0.06), gold, 0, 0.0, 0.73, lid);
  g.userData.lid = lid;
  return g;
}

export function buildPillar(wallMat) {
  const g = new THREE.Group();
  part(CYL(0.55, 0.62, 3.0, 10), wallMat, 0, 1.6, 0, g).receiveShadow = true;
  part(BOX(1.4, 0.3, 1.4), wallMat, 0, 0.15, 0, g).receiveShadow = true;
  part(BOX(1.3, 0.3, 1.3), wallMat, 0, 3.15, 0, g);
  return g;
}

export class SharedAssets {
  constructor() {
    this.flameTex = flameTexture();
    this.glowTex = radialTexture(64, [[0, 'rgba(255,255,255,1)'], [0.25, 'rgba(255,255,255,0.55)'], [1, 'rgba(255,255,255,0)']]);
    this.biomeCache = {};
    this.duckGeo = null;
    this.duckTex = null;
  }

  biome(id) {
    if (this.biomeCache[id]) return this.biomeCache[id];
    let floor, wall;
    if (id === 'kloakk') {
      floor = stoneTextures({ style: 'cobble', cells: 7, base: [92, 98, 88], mortar: [22, 28, 24], vari: 0.22, moss: 0.7, seed: 11 });
      wall = stoneTextures({ style: 'brick', cells: 8, base: [104, 84, 66], mortar: [30, 26, 22], vari: 0.2, moss: 0.8, seed: 23 });
    } else if (id === 'dverg') {
      floor = stoneTextures({ style: 'flag', cells: 3, base: [118, 104, 86], mortar: [30, 24, 20], vari: 0.15, cracks: true, seed: 37 });
      wall = stoneTextures({ style: 'brick', cells: 5, base: [100, 92, 82], mortar: [28, 24, 20], vari: 0.12, seed: 41, normalStrength: 4 });
    } else {
      floor = stoneTextures({ style: 'flag', cells: 4, base: [96, 62, 52], mortar: [24, 14, 12], vari: 0.2, cracks: true, seed: 53 });
      wall = stoneTextures({ style: 'brick', cells: 6, base: [84, 58, 50], mortar: [22, 14, 12], vari: 0.18, seed: 59 });
    }
    // våte sølepytter i kloakken, polert stein hos dvergene (ruhetskart på uv1, større skala)
    const rough = puddleRoughness(id === 'kloakk' ? 5 : 9, id === 'kloakk');
    const floorMat = new THREE.MeshStandardMaterial({ map: floor.map, normalMap: floor.normalMap, roughnessMap: rough, roughness: 1, metalness: 0.0, vertexColors: true });
    floorMat.normalScale.set(1.2, 1.2);
    const wallMat = new THREE.MeshStandardMaterial({ map: wall.map, normalMap: wall.normalMap, roughness: 0.9, vertexColors: true });
    addCutaway(wallMat);
    const pillarMat = new THREE.MeshStandardMaterial({ map: wall.map, normalMap: wall.normalMap, roughness: 0.9 });
    addCutaway(pillarMat);
    const capMat = new THREE.MeshStandardMaterial({ color: 0x0b0908, roughness: 1, vertexColors: true });
    addCutaway(capMat);
    const sideMat = new THREE.MeshStandardMaterial({ map: wall.map, normalMap: wall.normalMap, roughness: 0.6, color: 0x8a9a90, vertexColors: true });
    this.biomeCache[id] = { floorMat, wallMat, capMat, pillarMat, sideMat };
    return this.biomeCache[id];
  }

  labelTexture(text) {
    return labelTexture(text);
  }
}
