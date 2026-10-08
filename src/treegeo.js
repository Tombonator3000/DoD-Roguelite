// Trekroner med myke former i stedet for facetterte kuler og kjegler.
// Løvtrær: klumpete kuler der normalene ligger mellom flatens egen og en som peker rett ut fra midten,
// så lyset faller mykt over kronen. Graner: kjegler med takket nederkant.
// Fargen i hjørnene er mørkere nederst og lysere øverst (en enkel AO), og ganges med fargen per
// instans. Ideen er fra docs/grafikk-weatherglass.md (normaler fra en ellipsoide rundt kronen, AO etter
// hvor i kronen bladet sitter). Formen avhenger bare av posisjonen, så like hjørner flytter seg likt.
import * as THREE from 'three';
import { G } from './state.js';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';

function h3(x, y, z) { const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453; return s - Math.floor(s); }
function noise3(x, y, z) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const xf = x - xi, yf = y - yi, zf = z - zi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf), w = zf * zf * (3 - 2 * zf);
  const L = (a, b, t) => a + (b - a) * t;
  const c = (dx, dy, dz) => h3(xi + dx, yi + dy, zi + dz);
  return L(L(L(c(0, 0, 0), c(1, 0, 0), u), L(c(0, 1, 0), c(1, 1, 0), u), v), L(L(c(0, 0, 1), c(1, 0, 1), u), L(c(0, 1, 1), c(1, 1, 1), u), v), w);
}
const sstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

// Hvor fine kronene er, etter kvaliteten: [nære trær, trær i kanten av kartet]. detail 0 gir 20 flater,
// 1 gir 80 og 2 gir 320. Før 0.7 var det 1 og 0 overalt.
export function leafDetail() {
  const q = G.game?.settings?.quality;
  return q === 'hoy' ? [2, 1] : q === 'lav' ? [1, 0] : [1, 1];
}

export function leafBlob(detail = 2, seed = 1) {
  let g = new THREE.IcosahedronGeometry(1, detail);
  g.deleteAttribute('normal');
  g.deleteAttribute('uv');
  g = mergeVertices(g);
  const pos = g.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i).normalize();
    const n = noise3(v.x * 1.8 + seed, v.y * 1.8, v.z * 1.8) - 0.5;
    const n2 = noise3(v.x * 3.6, v.y * 3.6 + seed, v.z * 3.6) - 0.5;
    let r = 1 + n * 0.34 + n2 * 0.12;
    if (v.y < -0.2) r *= 1 - (-0.2 - v.y) * 0.22; // litt flatere under
    pos.setXYZ(i, v.x * r, v.y * r * 0.94, v.z * r);
  }
  g.computeVertexNormals();
  const nrm = g.attributes.normal;
  const col = new Float32Array(pos.count * 3);
  const d = new THREE.Vector3(), nn = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    d.fromBufferAttribute(pos, i).normalize();
    nn.fromBufferAttribute(nrm, i).lerp(d, 0.55).normalize();
    nrm.setXYZ(i, nn.x, nn.y, nn.z);
    // mørkere nederst og i gropene, varmere og lysere øverst
    const y = d.y;
    const lump = pos.getX(i) * d.x + pos.getY(i) * d.y + pos.getZ(i) * d.z;
    const mott = 0.86 + 0.28 * noise3(d.x * 5 + seed * 3, d.y * 5, d.z * 5); // flekker av lys og skygge i løvet
    const ao = (0.5 + 0.62 * sstep(-0.95, 0.75, y)) * (0.82 + 0.18 * sstep(0.88, 1.12, lump)) * mott;
    col[i * 3] = ao * (1 + Math.max(0, y) * 0.08);
    col[i * 3 + 1] = ao;
    col[i * 3 + 2] = ao * (0.92 - Math.max(0, y) * 0.06);
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  return g;
}

// Gran: kjegle fra y = 0 til 1 med takket kant nederst, mørk inn mot stammen
export function spruceCone(seg = 10, seed = 3) {
  let g = new THREE.ConeGeometry(1, 1, seg, 3, false);
  g.deleteAttribute('uv');
  g.deleteAttribute('normal');
  g = mergeVertices(g);
  const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    const rr = Math.hypot(x, z);
    if (rr < 1e-4) continue;
    const a = Math.atan2(z, x);
    const k = (y + 0.5); // 0 nederst, 1 i toppen
    const tooth = (h3(Math.round(a * 10), seed, 0) - 0.5);
    const edge = 1 - k;
    // nederkanten: tenner opp og ned, og litt ujevn radius
    const ny = y + (k < 0.01 ? tooth * 0.16 - 0.04 : 0);
    const nr = 1 + (noise3(Math.cos(a) * 2 + seed, k * 3, Math.sin(a) * 2) - 0.5) * 0.22 * edge;
    pos.setXYZ(i, x * nr, ny, z * nr);
  }
  g.translate(0, 0.5, 0);
  g.computeVertexNormals();
  const nrm = g.attributes.normal;
  const col = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    const rr = Math.hypot(pos.getX(i), pos.getZ(i));
    // bunnplata (rett under kjeglen) er mørk, og fargen lysner mot toppen
    const under = nrm.getY(i) < -0.6 ? 0.35 : 1;
    const ao = (0.55 + 0.6 * sstep(0, 1, y)) * under * (rr < 0.05 && y < 0.1 ? 0.4 : 1);
    col[i * 3] = ao * (1 + y * 0.05);
    col[i * 3 + 1] = ao;
    col[i * 3 + 2] = ao * (0.95 - y * 0.05);
    // normalene vippes litt opp, så kjeglen tar imot himmellyset som en krone
    const nx = nrm.getX(i), nyv = nrm.getY(i), nz = nrm.getZ(i);
    if (nyv > -0.6) { const l = Math.hypot(nx, nyv + 0.25, nz); nrm.setXYZ(i, nx / l, (nyv + 0.25) / l, nz / l); }
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  return g;
}
