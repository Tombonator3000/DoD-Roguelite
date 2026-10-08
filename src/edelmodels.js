// Svartfolket i Torilskogen: orcher, svartalfer, ulver og Lekh.
// Samme byggeklosser som fiendene i assets.js (prim), så treffblink og oppløsning virker likt.
import * as THREE from 'three';
import { prim } from './assets.js';

const { SPH, CAP, CYL, BOX, CONE, TOR, mat, part, pivot, finish } = prim;
// halvkuler (hjelmer, hetter). SPH i prim tar bare radius og oppløsning.
const hemiCache = new Map();
const HEMI = (r, w = 12, h = 8, arc = Math.PI / 2) => {
  const k = `${r}|${w}|${h}|${arc}`;
  if (!hemiCache.has(k)) hemiCache.set(k, new THREE.SphereGeometry(r, w, h, 0, Math.PI * 2, 0, arc));
  return hemiCache.get(k);
};

// Rundt skjold på venstre arm, med jernkant
function shield(armL, col, rim) {
  const s = pivot(0.05, -0.5, 0.16, armL);
  const disc = part(CYL(0.34, 0.34, 0.05, 14), col, 0, 0, 0, s);
  disc.rotation.x = Math.PI / 2;
  const edge = part(TOR(0.34, 0.025, 5, 18), rim, 0, 0, 0.02, s);
  void edge;
  part(SPH(0.07, 8, 6), rim, 0, 0, 0.05, s);
  return s;
}

// Våpen i høyre hånd. Bladet peker framover langs +z når armen henger.
function weapon(armR, kind, M) {
  const w = pivot(0, -0.8, 0.1, armR);
  if (kind === 'sabel') {
    const h = part(CYL(0.035, 0.035, 0.22, 6), M.leather, 0, 0, 0.05, w);
    h.rotation.x = Math.PI / 2;
    part(BOX(0.2, 0.03, 0.04), M.metal, 0, 0, 0.17, w);
    const b = part(BOX(0.05, 0.02, 0.85), M.metal, 0.03, 0, 0.6, w);
    b.rotation.y = 0.08;
  } else if (kind === 'spjut') {
    const h = part(CYL(0.03, 0.03, 1.7, 6), M.wood, 0, 0, 0.5, w);
    h.rotation.x = Math.PI / 2;
    const tip = part(CONE(0.06, 0.28, 6), M.metal, 0, 0, 1.45, w);
    tip.rotation.x = Math.PI / 2;
  } else if (kind === 'langspjut') {
    const h = part(CYL(0.03, 0.03, 2.4, 6), M.wood, 0, 0, 0.7, w);
    h.rotation.x = Math.PI / 2;
    const tip = part(CONE(0.07, 0.36, 6), M.metal, 0, 0, 2.05, w);
    tip.rotation.x = Math.PI / 2;
  } else if (kind === 'kortsvard') {
    part(BOX(0.16, 0.03, 0.04), M.metal, 0, 0, 0.08, w);
    part(BOX(0.05, 0.02, 0.6), M.metal, 0, 0, 0.42, w);
  } else if (kind === 'armborst' || kind === 'arbalest') {
    const big = kind === 'arbalest';
    part(BOX(0.08, 0.08, big ? 0.95 : 0.7), M.wood, 0, 0, big ? 0.35 : 0.25, w);
    const bow = part(BOX(big ? 1.0 : 0.72, 0.05, 0.06), big ? M.metal : M.wood, 0, 0.02, big ? 0.78 : 0.56, w);
    bow.rotation.y = 0;
    part(BOX(big ? 0.98 : 0.7, 0.012, 0.012), M.string, 0, 0.04, big ? 0.64 : 0.46, w);
    if (big) part(CYL(0.06, 0.06, 0.16, 8), M.metal, 0, -0.06, -0.08, w).rotation.z = Math.PI / 2;
  }
  return w;
}

/**
 * Orch fra Lekhs stamme. o.kind: 'band' (kroksabel og skjold), 'spjut', 'xbow' (lett armborst),
 * 'elite' (hjelm, rød fille, sabel og skjold), 'lead' (lederen med papirlapper i neven).
 */
export function buildOrcEd(o = {}) {
  const kind = o.kind || 'band';
  const root = new THREE.Group();
  const s = kind === 'elite' ? 1.0 : 0.9;
  const body = pivot(0, 1.25 * s, 0, root);
  const M = {
    skin: mat(kind === 'elite' ? 0x46523a : 0x5e6a48, { r: 0.75 }),
    leather: mat(0x3a2a20, { r: 0.9 }),
    metal: mat(0x5a5650, { r: 0.45, m: 0.8 }),
    wood: mat(0x5a3a1e, { r: 0.7 }),
    string: mat(0xd8d0b0, { r: 0.9 }),
    tusk: mat(0xe8e0c8, { r: 0.5 }),
    eye: mat(0x000000, { e: 0xff3020, ei: 3 }),
    rag: mat(kind === 'elite' ? 0x7a1a14 : 0x4a3a28, { r: 0.95 }),
    wshield: mat(0x4a3424, { r: 0.85 }),
  };
  const bm = part(CAP(0.5 * s, 0.65 * s, 12), M.skin, 0, 0, 0, body);
  bm.scale.set(1.1, 1, 0.85);
  part(CYL(0.55 * s, 0.5 * s, 0.35, 12), M.leather, 0, -0.35 * s, 0, body);
  // lærharnesk over brystet
  const vest = part(CAP(0.52 * s, 0.4 * s, 12), M.leather, 0, 0.08, 0.02, body);
  vest.scale.set(1.1, 0.9, 0.86);
  if (kind === 'elite') {
    const cape = part(BOX(0.9 * s, 1.0, 0.04), M.rag, 0, -0.05, -0.42, body);
    cape.rotation.x = 0.12;
  }
  const head = pivot(0, 0.78 * s, 0.12, body);
  part(SPH(0.32 * s, 12, 10), M.skin, 0, 0, 0, head);
  part(BOX(0.4 * s, 0.2, 0.3), M.skin, 0, -0.14, 0.1, head);
  for (const sx of [1, -1]) {
    const t = part(CONE(0.04, 0.16, 6), M.tusk, sx * 0.12, -0.08, 0.26 * s, head);
    t.rotation.x = -0.3;
    part(SPH(0.04, 8, 6), M.eye, sx * 0.11, 0.06, 0.27 * s, head, false);
    const ear = part(CONE(0.07, 0.22, 6), M.skin, sx * 0.3 * s, 0.08, -0.02, head);
    ear.rotation.z = -sx * 1.2;
  }
  if (kind === 'elite' || kind === 'lead') {
    const helm = part(HEMI(0.35 * s), M.metal, 0, 0.04, 0, head);
    helm.scale.y = 0.9;
    part(BOX(0.05, 0.22, 0.08), M.metal, 0, -0.04, 0.3 * s, head);
  }
  const armL = pivot(0.62 * s, 0.42 * s, 0, body);
  const armR = pivot(-0.62 * s, 0.42 * s, 0, body);
  for (const a of [armL, armR]) {
    part(CAP(0.14 * s, 0.45 * s), M.skin, 0, -0.35 * s, 0, a);
    part(SPH(0.15 * s, 8, 6), M.skin, 0, -0.75 * s, 0.05, a);
  }
  const wk = kind === 'xbow' ? 'armborst' : kind === 'spjut' ? 'spjut' : 'sabel';
  const wp = weapon(armR, wk, M);
  if (kind !== 'xbow') shield(armL, M.wshield, M.metal);
  else {
    // pilkogger på ryggen
    const q = part(CYL(0.09, 0.08, 0.6, 8), M.leather, 0.2, 0.2, -0.45, body);
    q.rotation.x = 0.3;
    for (let i = 0; i < 4; i++) part(CYL(0.012, 0.012, 0.2, 4), M.rag, 0.17 + (i % 2) * 0.05, 0.56, -0.53 + Math.floor(i / 2) * 0.04, body);
  }
  if (kind === 'lead') {
    // papirbiter i venstre neve (han tygger på brevene)
    const paper = mat(0xe8dcc0, { r: 0.95 });
    for (let i = 0; i < 3; i++) { const pp = part(BOX(0.16, 0.12, 0.01), paper, 0.04 * i, -0.8, 0.12 + i * 0.02, armL); pp.rotation.set(i * 0.4, i, 0.3); }
    // liten skinnpung på beltet
    part(SPH(0.1, 8, 6), M.leather, 0.3, -0.38, 0.38, body);
  }
  const legL = pivot(0.25 * s, -0.55 * s, 0, body);
  const legR = pivot(-0.25 * s, -0.55 * s, 0, body);
  for (const l of [legL, legR]) part(CAP(0.17 * s, 0.4 * s), M.leather, 0, -0.35 * s, 0, l);
  root.scale.setScalar(o.scale || 1);
  return finish(root, { body, head, armL, armR, legL, legR, weapon: wp }, kind === 'elite' ? 0x3a0804 : 0x2a1008);
}

/**
 * Svartalf: smal, gråsvart hud, lange ører, gule øyne, svart kappe. Kortsvärd og vanlig sköld.
 * Lekh (o.lekh): kyrass, åpen hjelm, arbalest og langspyd på ryggen, store føtter.
 */
export function buildSvartalf(o = {}) {
  const lekh = !!o.lekh;
  const root = new THREE.Group();
  const skin = mat(lekh ? 0x6a6470 : 0x4c4a56, { r: 0.7 });
  const cloth = mat(0x1e1a20, { r: 0.95 });
  const leather = mat(0x2e2420, { r: 0.85 });
  const metal = mat(0x8a8c90, { r: 0.35, m: 0.9 });
  const wood = mat(0x4a3020, { r: 0.75 });
  const eye = mat(0x000000, { e: 0xffc020, ei: 3.4 });
  const hairM = mat(0x0c0a0c, { r: 0.8 });
  const M = { leather, metal, wood, string: mat(0xd0c8a8, { r: 0.9 }) };
  const hips = pivot(0, 0.95, 0, root);
  part(BOX(0.34, 0.16, 0.2), leather, 0, 0, 0, hips);
  const torso = pivot(0, 0.05, 0, hips);
  const chest = part(CAP(0.17, 0.32, 10), lekh ? metal : leather, 0, 0.32, 0, torso);
  chest.scale.set(1.15, 1, 0.8);
  if (lekh) for (let i = 0; i < 3; i++) part(BOX(0.36, 0.03, 0.26), mat(0xb8a060, { r: 0.3, m: 1 }), 0, 0.18 + i * 0.14, 0, torso);
  const cape = part(BOX(0.42, 0.9, 0.03), cloth, 0, 0.18, -0.17, torso);
  cape.rotation.x = 0.1;
  const head = pivot(0, 0.72, 0.02, torso);
  part(SPH(0.15, 12, 10), skin, 0, 0.04, 0, head).scale.set(0.95, 1.08, 1);
  const chin = part(CONE(0.1, 0.14, 8), skin, 0, -0.06, 0.03, head);
  chin.rotation.x = Math.PI;
  for (const sx of [1, -1]) {
    const ear = part(CONE(0.035, 0.26, 5), skin, sx * 0.15, 0.08, -0.02, head);
    ear.rotation.z = -sx * 1.25;
    ear.rotation.y = sx * 0.3;
    part(SPH(0.026, 8, 6), eye, sx * 0.055, 0.05, 0.13, head, false);
  }
  if (lekh) {
    const helm = part(HEMI(0.17), metal, 0, 0.07, 0, head);
    helm.scale.y = 0.95;
    part(BOX(0.035, 0.16, 0.05), metal, 0, 0.0, 0.16, head);
  } else {
    const hood = part(HEMI(0.18, 10, 8, Math.PI * 0.6), cloth, 0, 0.06, -0.02, head);
    hood.scale.set(1, 1.1, 1.05);
    part(HEMI(0.155, 10, 8), hairM, 0, 0.08, -0.02, head);
  }
  const armL = pivot(0.24, 0.56, 0, torso);
  const armR = pivot(-0.24, 0.56, 0, torso);
  for (const a of [armL, armR]) {
    part(CAP(0.055, 0.34), lekh ? leather : cloth, 0, -0.2, 0, a);
    part(CAP(0.045, 0.3), skin, 0, -0.52, 0.03, a);
  }
  let wp;
  if (lekh) {
    wp = weapon(armR, 'arbalest', M);
    wp.position.y = -0.62;
    // langspydet på ryggen
    const sp = part(CYL(0.025, 0.025, 2.3, 6), wood, 0.12, 0.45, -0.24, torso);
    sp.rotation.z = 0.5;
    const tip = part(CONE(0.05, 0.3, 6), metal, -0.4, 1.45, -0.24, torso);
    tip.rotation.z = 0.5;
  } else {
    wp = weapon(armR, 'kortsvard', M);
    wp.position.y = -0.62;
    const sh = shield(armL, mat(0x2a2024, { r: 0.85 }), metal);
    sh.position.set(0.04, -0.4, 0.12);
    sh.scale.setScalar(0.85);
  }
  const legL = pivot(0.1, 0, 0, hips);
  const legR = pivot(-0.1, 0, 0, hips);
  for (const l of [legL, legR]) {
    part(CAP(0.07, 0.4), cloth, 0, -0.24, 0, l);
    part(CAP(0.055, 0.36), leather, 0, -0.66, 0, l);
    // Lekh har enorme føtter (Triangeldrama i Edelfara s. 10)
    part(BOX(lekh ? 0.16 : 0.1, 0.06, lekh ? 0.36 : 0.22), leather, 0, -0.92, lekh ? 0.1 : 0.05, l);
  }
  return finish(root, { hips, torso, head, armL, armR, legL, legR, weapon: wp }, lekh ? 0x40300a : 0x1a1430);
}

/**
 * Ulv. Firbent som kloakkrotta (samme deler: body, head, tail, legs), bare større.
 * o.rider: Lekh sitter på ryggen (når han flykter).
 */
export function buildWolf(o = {}) {
  const root = new THREE.Group();
  const big = o.rider ? 1.25 : 1;
  const fur = mat(o.rider ? 0x3a3634 : 0x6a625a, { r: 0.95 });
  const dark = mat(0x2a2624, { r: 0.95 });
  const eye = mat(0x000000, { e: 0xffd040, ei: 3 });
  const body = pivot(0, 0.62 * big, 0, root);
  const torso = part(SPH(0.5, 14, 10), fur, 0, 0, 0, body);
  torso.scale.set(0.55 * big, 0.5 * big, 1.1 * big);
  const neck = part(SPH(0.3, 10, 8), fur, 0, 0.12 * big, 0.42 * big, body);
  neck.scale.set(1, 1.1, 1.2);
  const head = pivot(0, 0.2 * big, 0.62 * big, body);
  part(SPH(0.2 * big, 12, 10), fur, 0, 0, 0, head);
  const snout = part(CONE(0.11 * big, 0.32 * big, 8), dark, 0, -0.04, 0.24 * big, head);
  snout.rotation.x = Math.PI / 2;
  part(SPH(0.04, 8, 6), mat(0x050404, { r: 0.4 }), 0, -0.03, 0.4 * big, head);
  for (const sx of [1, -1]) {
    part(SPH(0.03, 8, 6), eye, sx * 0.08 * big, 0.06, 0.15 * big, head, false);
    const ear = part(CONE(0.06 * big, 0.16 * big, 5), dark, sx * 0.1 * big, 0.17 * big, -0.02, head);
    ear.rotation.z = -sx * 0.2;
  }
  const tail = pivot(0, 0.08, -0.52 * big, body);
  const tm = part(CYL(0.03, 0.09, 0.6 * big, 6), fur, 0, -0.1, -0.26 * big, tail);
  tm.rotation.x = Math.PI / 2 + 0.5;
  const legs = [];
  for (const [x, z] of [[0.17, 0.36], [-0.17, 0.36], [0.17, -0.34], [-0.17, -0.34]]) {
    const lp = pivot(x * big, 0.42 * big, z * big, root);
    part(CYL(0.065 * big, 0.045 * big, 0.44 * big, 6), fur, 0, -0.2 * big, 0, lp);
    part(BOX(0.09 * big, 0.04, 0.12 * big), dark, 0, -0.42 * big, 0.03, lp);
    legs.push(lp);
  }
  if (o.rider) {
    // Lekh på ulveryggen, bøyd framover, arbalesten over armen
    const r = buildSvartalf({ lekh: true });
    const g = r.root;
    g.position.set(0, 0.2 * big, 0.05);
    g.scale.setScalar(0.92);
    r.parts.legL.rotation.x = -1.2; r.parts.legR.rotation.x = -1.2;
    r.parts.legL.rotation.z = 0.5; r.parts.legR.rotation.z = -0.5;
    r.parts.torso.rotation.x = 0.35;
    r.parts.armR.rotation.x = -1.2;
    body.add(g);
    const saddle = part(BOX(0.5, 0.06, 0.5), mat(0x5a2a18, { r: 0.8 }), 0, 0.26 * big, 0, body);
    void saddle;
  }
  return finish(root, { body, head, tail, legs }, 0x2a1c08);
}
