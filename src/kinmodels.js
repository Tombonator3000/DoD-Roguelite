import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { prim, addRimFlash } from './assets.js';
import { mulberry32 } from './dungeon.js';

const { SPH, CAP, CYL, BOX, CONE, TOR, mat, part, pivot } = prim;
const hemiCache = new Map();
const HEMI = (r, w, h, tl) => {
  const k = `${r}|${w}|${h}|${tl}`;
  if (!hemiCache.has(k)) hemiCache.set(k, new THREE.SphereGeometry(r, w, h, 0, Math.PI * 2, 0, tl));
  return hemiCache.get(k);
};

// ---------------------------------------------------------------------------
// Våpenmodeller. Grepet er i origo, bladet peker langs -Y (samme retning som armen).
// ---------------------------------------------------------------------------

const WMAT = {};
function wm(key, color, o) {
  if (!WMAT[key]) WMAT[key] = mat(color, o);
  return WMAT[key];
}
const steel = () => wm('steel', 0xc4c8d0, { r: 0.28, m: 1 });
const dark = () => wm('darkmetal', 0x5a5650, { r: 0.45, m: 0.85 });
const wood = () => wm('wood', 0x6a4426, { r: 0.75 });
const leather = () => wm('leather', 0x3a2416, { r: 0.9 });
const brass = () => wm('brass', 0xc09040, { r: 0.35, m: 1 });

// Monteringsvinkel i hånda per type (rotasjon om X)
export const HOLD = { knife: -0.35, fist: 0, sword: -0.35, axe: -0.35, hammer: -0.35, great: -0.35, spear: -1.35, staff: 0, bow: 0, xbow: -1.5, sling: 0, shield: 0, focus: 0 };

export function buildWeaponMesh(item) {
  const g = new THREE.Group();
  if (!item) return g;
  const id = item.wid || '';
  const k = item.kind;
  const blade = (len, w = 0.05, th = 0.012) => {
    part(BOX(w, len, th), steel(), 0, -0.07 - len / 2, 0, g);
    const tip = part(CONE(w * 0.5, 0.08, 4), steel(), 0, -0.07 - len - 0.04, 0, g);
    tip.rotation.x = Math.PI;
    tip.scale.z = 0.3;
  };
  if (k === 'knife') {
    part(BOX(0.032, 0.1, 0.032), leather(), 0, 0.02, 0, g);
    part(BOX(0.09, 0.016, 0.03), brass(), 0, -0.04, 0, g);
    blade(id === 'kniv' ? 0.16 : 0.24, 0.035, 0.008);
  } else if (k === 'sword') {
    const len = { kortsvard: 0.5, bredsvard: 0.68, langsvard: 0.82, sabel: 0.66 }[id] || 0.6;
    part(BOX(0.035, 0.14, 0.035), leather(), 0, 0.03, 0, g);
    part(SPH(0.03, 8, 6), brass(), 0, 0.11, 0, g);
    part(BOX(0.2, 0.025, 0.04), brass(), 0, -0.05, 0, g);
    blade(len, id === 'bredsvard' ? 0.07 : 0.055);
    if (id === 'sabel') g.children.slice(-2).forEach(m => { m.rotation.z += 0.12; m.position.x += 0.04; });
  } else if (k === 'axe') {
    const big = id === 'stridsyxa';
    part(CYL(0.022, 0.026, big ? 0.75 : 0.55, 6), wood(), 0, big ? -0.25 : -0.17, 0, g);
    const head = part(BOX(0.025, big ? 0.22 : 0.15, big ? 0.24 : 0.16), steel(), 0, big ? -0.55 : -0.4, big ? 0.1 : 0.07, g);
    head.rotation.x = 0.1;
  } else if (k === 'hammer') {
    const len = id === 'litenklubba' ? 0.5 : 0.6;
    if (id === 'litenklubba' || id === 'stridsklubba') {
      part(CYL(0.065, 0.03, len, 7), id === 'stridsklubba' ? dark() : wood(), 0, -len / 2 + 0.06, 0, g);
      if (id === 'stridsklubba') for (let i = 0; i < 6; i++) { const f = part(BOX(0.02, 0.12, 0.05), dark(), Math.cos(i) * 0.06, -len + 0.12, Math.sin(i) * 0.06, g); f.rotation.y = i; }
    } else {
      part(CYL(0.022, 0.025, len, 6), wood(), 0, -len / 2 + 0.06, 0, g);
      if (id === 'morgonstjarna') {
        part(SPH(0.08, 10, 8), dark(), 0, -len + 0.02, 0, g);
        for (let i = 0; i < 8; i++) { const sp = part(CONE(0.018, 0.08, 4), steel(), 0, -len + 0.02, 0, g); sp.rotation.set(Math.random() * 6, Math.random() * 6, Math.random() * 6); sp.translateY(0.09); }
      } else if (id === 'slagslanda') {
        for (let i = 0; i < 4; i++) part(TOR(0.02, 0.006, 4, 8), dark(), 0, -len + 0.04 - i * 0.05, 0, g);
        part(SPH(0.075, 10, 8), dark(), 0, -len - 0.2, 0, g);
      } else {
        part(BOX(0.09, 0.09, 0.22), dark(), 0, -len + 0.04, 0.02, g);
      }
    }
  } else if (k === 'great') {
    if (id === 'tvahandssvard') {
      part(BOX(0.04, 0.3, 0.04), leather(), 0, 0.08, 0, g);
      part(BOX(0.3, 0.03, 0.05), brass(), 0, -0.08, 0, g);
      blade(1.05, 0.075);
    } else {
      part(CYL(0.026, 0.03, 1.15, 6), wood(), 0, -0.3, 0, g);
      if (id === 'tvahandsyxa') { const h = part(BOX(0.03, 0.3, 0.32), steel(), 0, -0.82, 0.13, g); h.rotation.x = 0.1; }
      else if (id === 'tungstridshammare') part(BOX(0.13, 0.13, 0.3), dark(), 0, -0.85, 0, g);
      else part(CYL(0.1, 0.05, 0.45, 8), wood(), 0, -0.7, 0, g);
    }
  } else if (k === 'staff') {
    part(CYL(0.025, 0.03, 1.7, 7), wood(), 0, 0.1, 0, g);
    part(SPH(0.045, 8, 6), wood(), 0, 0.95, 0, g);
  } else if (k === 'spear') {
    const len = id === 'kortspjut' ? 1.15 : id === 'treudd' ? 1.35 : 1.75;
    part(CYL(0.02, 0.022, len, 6), wood(), 0, -len / 2 + 0.35, 0, g);
    const end = -len + 0.35;
    if (id === 'treudd') {
      for (const x of [-0.06, 0, 0.06]) { const p = part(CONE(0.014, 0.18, 4), steel(), x, end - 0.1, 0, g); p.rotation.x = Math.PI; }
      part(BOX(0.15, 0.02, 0.02), steel(), 0, end, 0, g);
    } else {
      const t = part(CONE(0.035, 0.2, 4), steel(), 0, end - 0.1, 0, g);
      t.rotation.x = Math.PI;
      if (id === 'hillebard') part(BOX(0.02, 0.2, 0.18), steel(), 0, end + 0.1, 0.09, g);
    }
  } else if (k === 'bow') {
    const big = id === 'langbage';
    const r = big ? 0.75 : 0.52;
    const arc = part(TOR(r, 0.016, 4, 18, Math.PI * 0.8), wood(), 0, 0, -r * 0.82, g);
    arc.rotation.y = Math.PI / 2;
    arc.rotation.z = Math.PI / 2 + Math.PI * 0.1;
    part(CYL(0.003, 0.003, r * 1.9, 3), wm('string', 0xe8e0c8, { r: 1 }), 0, 0, -r * 0.62, g, false);
  } else if (k === 'xbow') {
    const big = id === 'tungtarmborst';
    part(BOX(0.05, big ? 0.6 : 0.48, 0.06), wood(), 0, -0.18, 0, g);
    part(BOX(big ? 0.7 : 0.55, 0.03, 0.035), dark(), 0, big ? -0.46 : -0.4, 0, g);
  } else if (k === 'sling') {
    part(CYL(0.006, 0.006, 0.45, 3), leather(), 0, -0.22, 0, g, false);
    part(SPH(0.04, 6, 5), leather(), 0, -0.46, 0, g);
  } else if (k === 'shield') {
    const big = id === 'storskold';
    const d = part(CYL(big ? 0.4 : 0.3, big ? 0.4 : 0.3, 0.04, 16), wm('shieldwood', 0x7a4a24, { r: 0.8 }), 0, 0, 0.06, g);
    d.rotation.x = Math.PI / 2;
    const rim = part(TOR(big ? 0.4 : 0.3, 0.018, 4, 20), dark(), 0, 0, 0.06, g);
    rim.rotation.x = 0;
    part(SPH(0.07, 10, 8), steel(), 0, 0, 0.09, g);
  } else if (k === 'focus') {
    if (id === 'trollstav') part(CYL(0.012, 0.016, 0.35, 6), wm('wand', 0x2a1a10, { r: 0.5 }), 0, -0.12, 0, g);
    else part(SPH(0.08, 12, 10), wm('orb', 0x88aaff, { r: 0.1, m: 0.2, e: 0x3050ff, ei: 1.4 }), 0, -0.02, 0.06, g);
  }
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return g;
}

// ---------------------------------------------------------------------------
// Rollpersoner av primitiver. Ser langs +Z. Høyre hånd er på -X.
// ---------------------------------------------------------------------------

const SKIN = [0xf2cba4, 0xe0b08a, 0xc08a60, 0x9a6640, 0x6a4430];
const HAIR = [0x1a1412, 0x3a2416, 0x6a3a1a, 0xa86a2a, 0xd8b060, 0x8a2a14];
const FUR = [0x6a6460, 0x8a6a4a, 0x3a3432, 0xbab2a6, 0x9a5a2a];

const CLOTHES = {
  hantverkare: { top: 0x6a5440, pants: 0x3a3a40, extra: 'apron' },
  bard: { top: 0x8a2a4a, pants: 0x2a2a4a, extra: 'feathercap' },
  krigare: { top: 0x6a2420, pants: 0x3a3020 },
  jagare: { top: 0x3a5a2a, pants: 0x4a3a28, extra: 'hood', hood: 0x2e4a24 },
  riddare: { top: 0x2a3a7a, pants: 0x2a2a30, extra: 'cape', cape: 0x24306a },
  magiker: { top: 0x4a2a7a, pants: 0x2a2030, extra: 'robe' },
  sjofarare: { top: 0xd8d0c0, pants: 0x2a3a5a, extra: 'bandana' },
  nasare: { top: 0x8a6a20, pants: 0x3a2a1a, extra: 'hat' },
  lard: { top: 0x4a5060, pants: 0x30343c, extra: 'robe' },
  tjuv: { top: 0x2c282a, pants: 0x1e1c1e, extra: 'hood', hood: 0x18161a },
  // yrkene i DoD91
  helare: { top: 0xd8d2c0, pants: 0x4a5a3a, extra: 'robe' },
  lardman: { top: 0x4a5060, pants: 0x30343c, extra: 'robe' },
  lonnmordare: { top: 0x1e1a1c, pants: 0x161416, extra: 'hood', hood: 0x2a0e10 },
  munk: { top: 0xc8781e, pants: 0x6a3a12, extra: 'robe' },
  utbygdsjagare: { top: 0x3a5a2a, pants: 0x4a3a28, extra: 'hood', hood: 0x2e4a24 },
};
const SCHOOL_COL = { Animism: 0x2f5a3a, Elementarism: 0x8a3014, Mentalism: 0x4a2a7a };

const KIN_SHAPE = {
  manniska: { s: 1, w: 1, head: 1 },
  halvling: { s: 0.7, w: 1.05, head: 1.22 },
  halvlangdsman: { s: 0.7, w: 1.05, head: 1.22 },
  halvalv: { s: 1.04, w: 0.92, head: 0.97 },
  halvorch: { s: 1.05, w: 1.14, head: 1.06 },
  dvarg: { s: 0.8, w: 1.4, head: 1.12 },
  alv: { s: 1.08, w: 0.86, head: 0.95 },
  vargfolk: { s: 1.06, w: 1.08, head: 1.05 },
};

function seeded(id) {
  let h = 0;
  for (const c of String(id)) h = (h * 31 + c.charCodeAt(0)) | 0;
  return mulberry32(h);
}

/**
 * Bygger en rollperson. Returnerer { root, rig, mats, fxU, height, handR, handL, ghostGeo }
 * sheet: rollformulär (kin, profession, school, age, id, appearance)
 */
export function buildCharacter(sheet, gear = {}) {
  const rnd = seeded(sheet.id + sheet.kin);
  const R = a => a[Math.floor(rnd() * a.length)];
  const shape = KIN_SHAPE[sheet.kin] || KIN_SHAPE.manniska;
  const cl = { ...(CLOTHES[sheet.profession] || CLOTHES.tjuv), ...(sheet.clothes || {}) };
  if (sheet.profession === 'magiker' && sheet.school && !sheet.clothes?.top) cl.top = SCHOOL_COL[sheet.school] || cl.top;
  const wolf = sheet.kin === 'vargfolk';
  const small = sheet.kin === 'halvling' || sheet.kin === 'halvlangdsman';
  const elfy = sheet.kin === 'alv' || sheet.kin === 'halvalv';
  const old = sheet.age === 'gammal';
  const skinCol = wolf ? R(FUR) : sheet.kin === 'halvorch' ? R([0x8a9a6a, 0x7a8a5a, 0x6a7a50]) : sheet.kin === 'alv' ? R([0xf4e0cc, 0xe8c8a8, 0xb08060]) : sheet.kin === 'dvarg' ? R([0xe0a888, 0xc88a68, 0x9a6a50]) : R(SKIN);
  const hairCol = old ? 0xb8b4b0 : elfy ? R([0xf0e0b0, 0x1a1412, 0xd8d8e0, 0x8a2a14]) : R(HAIR);

  const mats = [];
  const M = (c, o) => { const m = mat(c, o); mats.push(m); return m; };
  // rustningens materiale fra DoD91-tabellen (mat) eller den gamle typen
  const armorKind = a => a.mat || (a.type === 'ring' ? 'ring' : a.type === 'plat' ? 'plat' : a.aid === 'nitlader' ? 'nit' : 'lader');
  const armorMats = {};
  const armorMat = a => {
    const k = armorKind(a);
    if (!armorMats[k]) armorMats[k] = k === 'ring' ? M(0x8a8c90, { r: 0.55, m: 0.9 }) : k === 'plat' ? M(0xb8bcc4, { r: 0.25, m: 1 }) : k === 'nit' ? M(0x5a3a24, { r: 0.7 }) : k === 'tyg' ? M(0x7a6a50, { r: 0.95 }) : M(0x6a4428, { r: 0.8 });
    return armorMats[k];
  };
  const skin = M(skinCol, { r: wolf ? 0.95 : 0.7 });
  const top = M(cl.top, { r: 0.9 });
  const pants = M(cl.pants, { r: 0.92 });
  const boots = M(0x2a1c14, { r: 0.8 });
  const hair = M(hairCol, { r: 0.85 });
  const eyeM = M(0x0a0808, { r: 0.3, e: wolf ? 0xffb030 : 0x000000, ei: wolf ? 0.8 : 1 });
  const belt = M(0x3a2214, { r: 0.7 });

  const root = new THREE.Group();
  const body = new THREE.Group(); // skaleres per släkte
  body.scale.setScalar(shape.s);
  root.add(body);
  const W = shape.w;

  // bein
  const hips = pivot(0, 0.86, 0, body);
  const legs = [];
  for (const sx of [1, -1]) {
    const leg = pivot(sx * 0.1 * W, -0.02, 0, hips);
    const th = part(CAP(0.085 * Math.sqrt(W), 0.3), pants, 0, -0.2, 0, leg);
    void th;
    const knee = pivot(0, -0.42, 0, leg);
    part(CAP(0.07 * Math.sqrt(W), 0.28), small ? pants : boots, 0, -0.18, 0, knee);
    const foot = part(BOX(0.12 * W, 0.07, small ? 0.3 : 0.24), small ? skin : boots, 0, -0.39, 0.05, knee);
    // benskydd
    if (gear.legs) part(CYL(0.085 * Math.sqrt(W), 0.075 * Math.sqrt(W), 0.24, 10), armorMat(gear.legs), 0, -0.17, 0.005, knee);
    void foot;
    legs.push({ leg, knee });
  }
  // overkropp
  const torso = pivot(0, 0, 0, hips);
  const chest = part(CAP(0.19, 0.3, 12), top, 0, 0.32, 0, torso);
  chest.scale.set(1.15 * W, 1, 0.78 * (0.9 + W * 0.1));
  part(CYL(0.21 * W, 0.22 * W, 0.08, 12), belt, 0, 0.06, 0, torso).scale.z = 0.8;
  part(BOX(0.06, 0.05, 0.02), M(0xc8a050, { r: 0.3, m: 1 }), 0, 0.06, 0.18, torso);
  // rustning over
  const armor = gear.armor;
  if (armor) {
    const mt = armorKind(armor);
    const am = armorMat(armor);
    const a = part(CAP(0.205, 0.26, 12), am, 0, 0.34, 0, torso);
    a.scale.set(1.16 * W, 1, 0.82);
    if (mt === 'nit') for (let i = 0; i < 10; i++) part(SPH(0.012, 5, 4), M(0xc0b090, { r: 0.3, m: 1 }), (i % 5 - 2) * 0.07 * W, 0.24 + Math.floor(i / 5) * 0.14, 0.17, torso);
    if (mt === 'plat') for (const sx of [1, -1]) { const pd = part(HEMI(0.11, 10, 8, Math.PI / 2), am, sx * 0.25 * W, 0.53, 0, torso); pd.scale.set(1, 0.7, 1); }
    // brynja og hauberk går ned over lårene
    if (armor.covers?.includes('hben')) { const sk = part(CYL(0.21 * W, 0.26 * W, 0.3, 12), am, 0, -0.08, 0, torso); sk.scale.z = 0.8; }
  }
  if (cl.extra === 'apron') part(BOX(0.3 * W, 0.4, 0.02), M(0x4a3020, { r: 0.9 }), 0, 0.2, 0.17, torso);
  if (cl.extra === 'robe') {
    part(CYL(0.2 * W, 0.34 * W, 0.62, 12), top, 0, -0.26, 0, torso);
  }
  if (cl.extra === 'cape') {
    const cape = part(BOX(0.42 * W, 0.85, 0.02), M(cl.cape, { r: 0.9 }), 0, 0.15, -0.17, torso);
    cape.rotation.x = 0.1;
  }

  // hode
  const neck = pivot(0, 0.6, 0.01, torso);
  const head = pivot(0, 0.02, 0, neck);
  head.scale.setScalar(shape.head);
  let headTop = 0.26;
  if (wolf) {
    part(SPH(0.14, 14, 12), skin, 0, 0.13, 0, head);
    const snout = part(CONE(0.075, 0.22, 10), skin, 0, 0.1, 0.18, head);
    snout.rotation.x = Math.PI / 2;
    part(SPH(0.03, 8, 6), M(0x0a0808, { r: 0.4 }), 0, 0.1, 0.29, head);
    for (const sx of [1, -1]) {
      const ear = part(CONE(0.05, 0.14, 6), skin, sx * 0.08, 0.27, -0.01, head);
      ear.rotation.z = -sx * 0.25;
      part(SPH(0.02, 6, 5), eyeM, sx * 0.06, 0.16, 0.12, head, false);
    }
    headTop = 0.34;
  } else {
    part(SPH(0.13, 14, 12), skin, 0, 0.13, 0, head);
    part(SPH(0.03, 6, 5), skin, 0, 0.12, 0.13, head).scale.set(1, 0.9, sheet.kin === 'dvarg' ? 1.6 : 1.1);
    for (const sx of [1, -1]) {
      part(SPH(0.017, 6, 5), eyeM, sx * 0.045, 0.15, 0.115, head, false);
      if (elfy) { const ear = part(CONE(0.03, sheet.kin === 'alv' ? 0.14 : 0.09, 5), skin, sx * 0.13, 0.17, -0.01, head); ear.rotation.z = -sx * 1.1; }
      else part(SPH(0.03, 6, 5), skin, sx * 0.13, 0.13, 0, head).scale.set(0.5, 1, 0.8);
    }
    // hår
    if (!(cl.extra === 'hood')) {
      const h = part(HEMI(0.138, 14, 10, Math.PI * 0.55), hair, 0, 0.14, -0.012, head);
      h.scale.set(1, 1.05, 1.05);
      if (elfy || rnd() < 0.3) part(BOX(0.22, 0.28, 0.05), hair, 0, 0.02, -0.11, head);
      if (small) for (let i = 0; i < 7; i++) part(SPH(0.045, 6, 5), hair, Math.cos(i) * 0.11, 0.22 + Math.sin(i * 2) * 0.03, Math.sin(i) * 0.1 - 0.02, head);
    }
    if (sheet.kin === 'dvarg') {
      const beard = part(CONE(0.12, 0.34, 10), hair, 0, -0.06, 0.07, head);
      beard.rotation.x = Math.PI + 0.25;
      part(BOX(0.16, 0.04, 0.03), hair, 0, 0.09, 0.125, head);
    } else if (sheet.kin === 'manniska' && rnd() < 0.35) {
      part(SPH(0.09, 10, 8), hair, 0, 0.05, 0.07, head).scale.set(1, 0.8, 0.8);
    } else if (sheet.kin === 'halvorch') {
      for (const sx of [1, -1]) { const tk = part(CONE(0.012, 0.05, 5), M(0xe8e0c8, { r: 0.5 }), sx * 0.04, 0.06, 0.12, head); tk.rotation.x = Math.PI; }
    }
  }
  // hodeplagg
  const helmet = gear.helmet;
  const softHelm = helmet && !helmet.metal && (helmet.mat === 'tyg' || helmet.mat === 'lader' || helmet.mat === 'nit');
  if (softHelm) {
    // tyghuva og läderhuva
    const hood = part(HEMI(0.152, 14, 10, Math.PI * 0.6), armorMat(helmet), 0, 0.13, -0.01, head);
    hood.scale.set(1, 1.06, 1.08);
  } else if (helmet) {
    const hm = M(0x9a9ca2, { r: 0.35, m: 1 });
    const cap = part(HEMI(0.15, 14, 10, Math.PI * 0.55), hm, 0, 0.14, 0, head);
    cap.scale.y = 1.1;
    if (helmet.hid === 'tunnhjalm' || helmet.aid === 'tunnhjalm') {
      part(CYL(0.155, 0.155, 0.26, 14), hm, 0, 0.1, 0, head);
      part(BOX(0.18, 0.015, 0.02), M(0x050505, { r: 1 }), 0, 0.15, 0.155, head);
    } else part(BOX(0.025, 0.12, 0.02), hm, 0, 0.08, 0.15, head);
  } else if (cl.extra === 'hood') {
    const hood = part(HEMI(0.165, 14, 10, Math.PI * 0.62), M(cl.hood, { r: 0.95 }), 0, 0.12, -0.02, head);
    hood.scale.set(1, 1.1, 1.12);
    const tip = part(CONE(0.1, 0.22, 8), hood.material, 0, 0.14, -0.15, head);
    tip.rotation.x = -1.9;
  } else if (sheet.profession === 'magiker') {
    const brim = part(CYL(0.24, 0.24, 0.015, 16), M(cl.top, { r: 0.9 }), 0, 0.24, 0, head);
    const cone = part(CONE(0.13, 0.42, 12), brim.material, 0, 0.45, -0.03, head);
    cone.rotation.x = -0.25;
  } else if (cl.extra === 'feathercap') {
    const c = part(CYL(0.14, 0.15, 0.08, 12), M(0x2a1a3a, { r: 0.9 }), 0, 0.25, 0, head);
    c.rotation.z = 0.2;
    const f = part(CONE(0.025, 0.32, 5), M(0xf0e0a0, { r: 0.8 }), -0.1, 0.36, -0.05, head);
    f.rotation.z = 0.7;
  } else if (cl.extra === 'bandana') {
    part(HEMI(0.14, 12, 8, Math.PI * 0.5), M(0xa02020, { r: 0.9 }), 0, 0.15, 0, head);
  } else if (cl.extra === 'hat') {
    part(CYL(0.22, 0.22, 0.02, 16), M(0x3a2a1a, { r: 0.9 }), 0, 0.24, 0, head);
    part(CYL(0.12, 0.13, 0.12, 12), M(0x3a2a1a, { r: 0.9 }), 0, 0.3, 0, head);
  }
  if (sheet.profession === 'lard' && !helmet) part(CYL(0.13, 0.14, 0.06, 12), M(0x2a2a34, { r: 0.9 }), 0, 0.25, 0, head);

  // armer
  const arms = [];
  for (const sx of [1, -1]) {
    const sh = pivot(sx * 0.25 * W, 0.52, 0, torso);
    part(CAP(0.062 * Math.sqrt(W), 0.2), top, 0, -0.14, 0, sh);
    const el = pivot(0, -0.3, 0, sh);
    part(CAP(0.052 * Math.sqrt(W), 0.18), wolf ? skin : top, 0, -0.12, 0, el);
    part(SPH(0.055, 8, 6), skin, 0, -0.27, 0.01, el);
    const hand = pivot(0, -0.28, 0.02, el);
    // armskydd
    if (gear.arms) part(CYL(0.062 * Math.sqrt(W), 0.056 * Math.sqrt(W), 0.17, 10), armorMat(gear.arms), 0, -0.13, 0, el);
    arms.push({ sh, el, hand });
  }
  if (wolf) {
    const tail = pivot(0, 0.02, -0.17, hips);
    const tm = part(CAP(0.06, 0.3, 8), skin, 0, -0.1, -0.12, tail);
    tm.rotation.x = 0.9;
    tail.userData.tail = true;
    arms.tail = tail;
  }

  root.traverse(o => { if (o.isMesh) o.castShadow = true; });
  // felles kantlys/blink for alle materialer
  const fxU = {
    uRim: { value: new THREE.Color(0x000000) },
    uFlash: { value: 0 },
    uRimPow: { value: 2.4 },
    uDissolve: { value: 0 },
    uDissolveCol: { value: new THREE.Color(0xff6a20) },
  };
  for (const m of mats) addRimFlash(m, 0, 2.4, fxU);

  const rig = {
    body, hips, torso, neck, head,
    legL: legs[0].leg, kneeL: legs[0].knee, legR: legs[1].leg, kneeR: legs[1].knee,
    shL: arms[0].sh, elL: arms[0].el, handL: arms[0].hand,
    shR: arms[1].sh, elR: arms[1].el, handR: arms[1].hand,
    tail: arms.tail || null,
    scale: shape.s,
  };
  const height = (0.86 + 0.62 + headTop * shape.head) * shape.s;
  return { root, rig, mats, fxU, height };
}

// Statisk silhuett (til etterbilder når du dukker)
export function ghostGeometry(root) {
  root.updateMatrixWorld(true);
  const inv = new THREE.Matrix4().copy(root.matrixWorld).invert();
  const geos = [];
  root.traverse(o => {
    if (!o.isMesh) return;
    const g = o.geometry.clone();
    for (const k of Object.keys(g.attributes)) if (k !== 'position' && k !== 'normal') g.deleteAttribute(k);
    if (!g.index) return;
    g.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv, o.matrixWorld));
    geos.push(g);
  });
  try { return mergeGeometries(geos, false); } catch (e) { return null; }
}

// ---------------------------------------------------------------------------
// Jakthund (Följeslagare) og demon (magisk missöde)
// ---------------------------------------------------------------------------

export function buildHound() {
  const root = new THREE.Group();
  const fur = mat(0x7a5634, { r: 0.92 });
  const darkF = mat(0x3a2a1c, { r: 0.92 });
  const eye = mat(0x000000, { e: 0xffd060, ei: 1.5 });
  const body = pivot(0, 0.5, 0, root);
  const torso = part(CAP(0.17, 0.45, 10), fur, 0, 0, 0, body);
  torso.rotation.x = Math.PI / 2;
  const head = pivot(0, 0.18, 0.38, body);
  part(SPH(0.14, 12, 10), fur, 0, 0, 0, head);
  const sn = part(CYL(0.06, 0.08, 0.18, 8), fur, 0, -0.03, 0.14, head);
  sn.rotation.x = Math.PI / 2;
  part(SPH(0.03, 6, 5), darkF, 0, -0.02, 0.24, head);
  for (const sx of [1, -1]) {
    const ear = part(CONE(0.05, 0.12, 6), darkF, sx * 0.08, 0.12, -0.02, head);
    ear.rotation.z = -sx * 0.4;
    part(SPH(0.018, 6, 5), eye, sx * 0.055, 0.04, 0.11, head, false);
  }
  const tail = pivot(0, 0.06, -0.38, body);
  const tm = part(CAP(0.035, 0.25, 6), fur, 0, 0.1, -0.08, tail);
  tm.rotation.x = -0.8;
  const legs = [];
  for (const [x, z] of [[0.1, 0.24], [-0.1, 0.24], [0.1, -0.24], [-0.1, -0.24]]) {
    const lp = pivot(x, 0.36, z, root);
    part(CAP(0.04, 0.26, 6), fur, 0, -0.17, 0, lp);
    legs.push(lp);
  }
  return prim.finish(root, { body, head, tail, legs }, 0x2a1a08);
}

export function buildDemon() {
  const root = new THREE.Group();
  const skin = mat(0x3a0a0a, { r: 0.6, e: 0x400800, ei: 1 });
  const horn = mat(0xd8c8a0, { r: 0.5 });
  const eye = mat(0x000000, { e: 0xffe040, ei: 5 });
  const body = pivot(0, 1.3, 0, root);
  const bm = part(CAP(0.45, 0.6, 12), skin, 0, 0, 0, body);
  bm.scale.set(1.15, 1, 0.8);
  const head = pivot(0, 0.75, 0.1, body);
  part(SPH(0.28, 12, 10), skin, 0, 0, 0, head);
  for (const sx of [1, -1]) {
    const h = part(CONE(0.07, 0.45, 8), horn, sx * 0.18, 0.28, -0.05, head);
    h.rotation.z = -sx * 0.5;
    h.rotation.x = -0.4;
    part(SPH(0.05, 8, 6), eye, sx * 0.1, 0.04, 0.24, head, false);
  }
  const armL = pivot(0.58, 0.4, 0, body);
  const armR = pivot(-0.58, 0.4, 0, body);
  for (const a of [armL, armR]) {
    part(CAP(0.13, 0.5), skin, 0, -0.35, 0, a);
    for (let i = 0; i < 3; i++) { const c = part(CONE(0.025, 0.18, 4), horn, (i - 1) * 0.06, -0.75, 0.06, a); c.rotation.x = Math.PI - 0.4; }
  }
  const legL = pivot(0.22, -0.55, 0, body);
  const legR = pivot(-0.22, -0.55, 0, body);
  for (const l of [legL, legR]) part(CAP(0.16, 0.4), skin, 0, -0.33, 0, l);
  const tail = pivot(0, -0.4, -0.3, body);
  const t = part(CYL(0.02, 0.07, 1.0, 6), skin, 0, -0.1, -0.45, tail);
  t.rotation.x = 1.1;
  return prim.finish(root, { body, head, armL, armR, legL, legR, tail }, 0x801000);
}
