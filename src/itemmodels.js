// Modeller av gjenstander, brukt både på bakken og som ikoner i inventaret.
// Geometri og materialer deles, så ingenting her skal kastes (dispose) av den som bruker dem.
import * as THREE from 'three';
import { buildWeaponMesh } from './kinmodels.js';
import { RARITY } from './loot.js';

const GEO = new Map();
const MAT = new Map();
const geo = (k, fn) => { if (!GEO.has(k)) GEO.set(k, fn()); return GEO.get(k); };
function mat(k, o) {
  if (!MAT.has(k)) {
    const m = new THREE.MeshStandardMaterial({ color: o.c, roughness: o.r ?? 0.7, metalness: o.m ?? 0, emissive: o.e ?? 0, emissiveIntensity: o.ei ?? 1, flatShading: !!o.flat, transparent: !!o.op, opacity: o.op ?? 1, depthWrite: !o.op, side: o.ds ? THREE.DoubleSide : THREE.FrontSide });
    m.userData.shared = true;
    MAT.set(k, m);
  }
  return MAT.get(k);
}
function mesh(g, m, x = 0, y = 0, z = 0, parent) {
  const o = new THREE.Mesh(g, m);
  o.position.set(x, y, z);
  o.castShadow = true;
  if (parent) parent.add(o);
  return o;
}
const lathe = (k, pts, seg = 18) => geo(k, () => new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), seg));

const M = {
  gold: () => mat('gold', { c: 0xe0b050, r: 0.22, m: 1 }),
  oldgold: () => mat('oldgold', { c: 0xb88a38, r: 0.38, m: 1 }),
  silver: () => mat('silver', { c: 0xd4d6dc, r: 0.18, m: 1 }),
  steel: () => mat('steel', { c: 0xb8bcc4, r: 0.3, m: 1 }),
  dark: () => mat('darksteel', { c: 0x5e5a56, r: 0.5, m: 0.85 }),
  chain: () => mat('chain', { c: 0x8a8e96, r: 0.55, m: 1, flat: true }),
  leather: () => mat('leather', { c: 0x6a4228, r: 0.85 }),
  leatherDk: () => mat('leatherdk', { c: 0x3c2414, r: 0.9 }),
  brass: () => mat('brass', { c: 0xc89848, r: 0.32, m: 1 }),
  cloth: () => mat('saffcloth', { c: 0xd8a030, r: 0.95 }),
  twine: () => mat('twine', { c: 0x8a6a40, r: 1 }),
  bread: () => mat('bread', { c: 0xc58a46, r: 0.92 }),
  crust: () => mat('crust', { c: 0x7a4a20, r: 0.95 }),
  sausage: () => mat('sausage', { c: 0x8a3a2a, r: 0.5 }),
  fish: () => mat('fish', { c: 0xb88a48, r: 0.55, m: 0.15 }),
  icing: () => mat('icing', { c: 0xf0e6d0, r: 0.6 }),
  glass: () => mat('glass', { c: 0xcfe4ee, r: 0.04, m: 0.1, op: 0.3 }),
  cork: () => mat('cork', { c: 0x9a7448, r: 0.9 }),
  pebble: () => mat('pebble', { c: 0x8a8680, r: 0.75 }),
  bone: () => mat('bone', { c: 0xe0d4b8, r: 0.6 }),
};
const liquid = (k, c, e) => mat('liq' + k, { c, r: 0.15, m: 0, e, ei: 1.3 });
const gemMat = (k, c, e) => mat('gem' + k, { c, r: 0.04, m: 0.25, e, ei: 0.55, flat: true });

// --- gjenstander du kan bære ---------------------------------------------------------

// Rustningens materiale i DoD91-tabellen (mat): tyg, lader, nit, ring, plat
const kindOf = item => item.mat || (item.aid === 'platrustning' ? 'plat' : item.aid === 'ringbrynja' ? 'ring' : item.aid === 'nitlader' ? 'nit' : item.metal ? 'plat' : 'lader');
const softMat = k => (k === 'tyg' ? mat('clothArm', { c: 0x8a7a5a, r: 0.95 }) : M.leather());

function armor(item, g) {
  const k = kindOf(item);
  const plate = k === 'plat', ring = k === 'ring', studs = k === 'nit';
  const body = plate ? M.steel() : ring ? M.chain() : softMat(k);
  const prof = [[0.0, -0.25], [0.15, -0.25], [0.16, -0.2], [0.14, -0.08], [0.15, 0.04], [0.19, 0.14], [0.2, 0.2], [0.13, 0.25], [0.06, 0.27], [0.0, 0.27]];
  const t = mesh(lathe('cuirass', prof, 20), body, 0, 0, 0, g);
  t.scale.z = 0.62;
  // belte
  const belt = mesh(geo('armbelt', () => new THREE.TorusGeometry(0.145, 0.018, 5, 20)), M.leatherDk(), 0, -0.13, 0, g);
  belt.rotation.x = Math.PI / 2;
  belt.scale.y = 0.62;
  mesh(geo('buckle', () => new THREE.BoxGeometry(0.05, 0.04, 0.02)), M.brass(), 0, -0.13, 0.093, g);
  if (plate || ring) {
    // skulderplater
    for (const s of [-1, 1]) {
      const p = mesh(geo('pauld', () => new THREE.SphereGeometry(0.085, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2)), plate ? M.steel() : M.dark(), s * 0.19, 0.2, 0, g);
      p.rotation.z = -s * 0.5;
      p.scale.set(1, 0.8, 0.85);
    }
  }
  if (plate) {
    const ridge = mesh(geo('ridge', () => new THREE.BoxGeometry(0.012, 0.36, 0.02)), M.steel(), 0, 0.02, 0.118, g);
    ridge.rotation.x = -0.12;
    for (let i = 0; i < 3; i++) {
      const l = mesh(geo('lame', () => new THREE.TorusGeometry(0.155, 0.01, 4, 20, Math.PI)), M.dark(), 0, -0.2 - i * 0.02, 0, g);
      l.rotation.x = Math.PI / 2;
      l.rotation.z = Math.PI;
      l.scale.y = 0.65;
    }
  }
  if (studs) {
    const sg = geo('stud', () => new THREE.SphereGeometry(0.011, 6, 4));
    for (let r = 0; r < 4; r++) for (let c = -2; c <= 2; c++) {
      const y = -0.05 + r * 0.065, x = c * 0.05;
      mesh(sg, M.brass(), x, y, 0.1 + (1 - Math.abs(c) * 0.25) * 0.005 - Math.abs(c) * 0.008, g);
    }
  }
  // brynja og hauberk har ermer og skjørt
  if (item.covers?.includes('harm')) for (const sx of [-1, 1]) { const sl = mesh(geo('sleeve', () => new THREE.CylinderGeometry(0.05, 0.06, 0.2, 10)), body, sx * 0.21, 0.1, 0, g); sl.rotation.z = sx * 0.5; }
  if (item.covers?.includes('hben')) mesh(geo('skirt', () => new THREE.CylinderGeometry(0.15, 0.2, 0.16, 18, 1, true)), mat(plate ? 'steelds' : 'chainds', { c: plate ? 0xb8bcc4 : 0x8a8e96, r: plate ? 0.3 : 0.55, m: 1, ds: true }), 0, -0.32, 0, g).scale.z = 0.7;
  if (!item.metal) {
    // snøring foran
    const lg = geo('lace', () => new THREE.BoxGeometry(0.05, 0.006, 0.006));
    for (let i = 0; i < 4; i++) { const l = mesh(lg, M.leatherDk(), 0, 0.0 + i * 0.045, 0.098, g); l.rotation.z = i % 2 ? 0.5 : -0.5; }
  }
}

function helmet(item, g) {
  const k = kindOf(item);
  if (!item.metal) {
    // tyghuva, läderhuva og nitläderhuva
    const m = softMat(k);
    mesh(geo('hood', () => new THREE.SphereGeometry(0.155, 18, 10, 0, Math.PI * 2, 0, Math.PI * 0.62)), m, 0, -0.03, 0, g).scale.set(1, 1.05, 1.1);
    for (const sx of [-1, 1]) { const f = mesh(geo('hoodflap', () => new THREE.BoxGeometry(0.05, 0.12, 0.1)), m, sx * 0.13, -0.11, 0.01, g); f.rotation.z = sx * 0.15; }
    if (k === 'nit') { const sg = geo('stud', () => new THREE.SphereGeometry(0.011, 6, 4)); for (let i = 0; i < 7; i++) { const a = -1.2 + i * 0.4; mesh(sg, M.brass(), Math.sin(a) * 0.15, 0.02, Math.cos(a) * 0.15, g); } }
    return;
  }
  if (k === 'ring') {
    mesh(geo('coif', () => new THREE.SphereGeometry(0.155, 18, 10, 0, Math.PI * 2, 0, Math.PI * 0.68)), M.chain(), 0, -0.03, 0, g).scale.set(1, 1.08, 1.05);
    mesh(geo('coifneck', () => new THREE.CylinderGeometry(0.13, 0.17, 0.08, 18, 1, true)), mat('chainds', { c: 0x8a8e96, r: 0.55, m: 1, ds: true }), 0, -0.14, 0, g);
    return;
  }
  if (item.hid === 'tunnhjalm' || item.aid === 'tunnhjalm') {
    mesh(geo('tunbody', () => new THREE.CylinderGeometry(0.15, 0.16, 0.24, 18, 1, true)), mat('steelds', { c: 0xb8bcc4, r: 0.3, m: 1, ds: true }), 0, 0, 0, g);
    mesh(geo('tuntop', () => new THREE.SphereGeometry(0.15, 18, 8, 0, Math.PI * 2, 0, Math.PI / 2)), M.steel(), 0, 0.12, 0, g).scale.y = 0.55;
    const slit = mesh(geo('slit', () => new THREE.BoxGeometry(0.2, 0.018, 0.04)), mat('void', { c: 0x050403, r: 1 }), 0, 0.04, 0.142, g);
    slit.rotation.x = 0.05;
    mesh(geo('tunrib', () => new THREE.BoxGeometry(0.016, 0.24, 0.02)), M.dark(), 0, 0, 0.156, g);
    const hg = geo('breath', () => new THREE.CylinderGeometry(0.006, 0.006, 0.02, 5));
    for (let i = 0; i < 4; i++) { const h = mesh(hg, mat('void', { c: 0x050403, r: 1 }), 0.04 + (i % 2) * 0.025, -0.04 - Math.floor(i / 2) * 0.03, 0.15, g); h.rotation.x = Math.PI / 2; }
    const band = mesh(geo('tunband', () => new THREE.TorusGeometry(0.158, 0.012, 4, 22)), M.brass(), 0, -0.1, 0, g);
    band.rotation.x = Math.PI / 2;
  } else {
    mesh(geo('dome', () => new THREE.SphereGeometry(0.16, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2)), M.steel(), 0, -0.03, 0, g).scale.y = 1.1;
    const rim = mesh(geo('domerim', () => new THREE.TorusGeometry(0.162, 0.016, 5, 24)), M.dark(), 0, -0.03, 0, g);
    rim.rotation.x = Math.PI / 2;
    mesh(geo('nasal', () => new THREE.BoxGeometry(0.03, 0.13, 0.02)), M.dark(), 0, -0.08, 0.165, g);
    const crest = mesh(geo('crest', () => new THREE.TorusGeometry(0.17, 0.012, 4, 20, Math.PI)), M.brass(), 0, -0.03, 0, g);
    crest.rotation.y = Math.PI / 2;
  }
}

// Armskydd og benskydd: et par skinner
function guards(item, g, legs) {
  const k = kindOf(item);
  const m = k === 'plat' ? M.steel() : k === 'ring' ? M.chain() : softMat(k);
  for (const sx of [-1, 1]) {
    const c = mesh(geo(legs ? 'greave' : 'bracer', () => new THREE.CylinderGeometry(legs ? 0.055 : 0.045, legs ? 0.05 : 0.04, legs ? 0.26 : 0.18, 12)), m, sx * 0.08, 0, 0, g);
    c.rotation.z = sx * 0.12;
    const band = mesh(geo(legs ? 'greaveband' : 'bracerband', () => new THREE.TorusGeometry(legs ? 0.056 : 0.046, 0.008, 4, 14)), k === 'plat' ? M.dark() : M.leatherDk(), sx * 0.08, legs ? 0.09 : 0.06, 0, g);
    band.rotation.x = Math.PI / 2;
    if (k === 'nit') mesh(geo('stud', () => new THREE.SphereGeometry(0.011, 6, 4)), M.brass(), sx * 0.08, 0, legs ? 0.056 : 0.046, g);
    if (legs && k === 'plat') mesh(geo('kneecop', () => new THREE.SphereGeometry(0.04, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2)), M.steel(), sx * 0.08, 0.14, 0.03, g).rotation.x = 0.6;
  }
}

function amulet(item, g) {
  const col = RARITY[item.rarity || 'magisk'].hex;
  const gem = gemMat('am' + col, col, col);
  const base = item.base || 'Amulett';
  const cord = (r = 0.13, y = 0.08) => { const c = mesh(geo('cord' + r, () => new THREE.TorusGeometry(r, 0.008, 4, 24, Math.PI * 1.15)), M.twine(), 0, y, 0, g); c.rotation.z = -Math.PI * 0.075; return c; };
  if (base === 'Ring') {
    const t = mesh(geo('ringband', () => new THREE.TorusGeometry(0.1, 0.025, 10, 24)), M.gold(), 0, 0, 0, g);
    t.rotation.x = 0.35;
    mesh(geo('ringset', () => new THREE.CylinderGeometry(0.04, 0.03, 0.04, 8)), M.gold(), 0, 0.11, 0.03, g).rotation.x = 0.35;
    mesh(geo('ringgem', () => new THREE.OctahedronGeometry(0.045, 0)), gem, 0, 0.145, 0.04, g);
  } else if (base === 'Talisman') {
    cord(0.12, 0.06);
    const t = mesh(geo('talis', () => new THREE.CylinderGeometry(0.11, 0.11, 0.025, 3)), M.bone(), 0, -0.06, 0, g);
    t.rotation.x = Math.PI / 2;
    t.rotation.y = Math.PI;
    mesh(geo('talgem', () => new THREE.IcosahedronGeometry(0.03, 0)), gem, 0, -0.07, 0.02, g);
  } else if (base === 'Brosje') {
    const d = mesh(geo('brooch', () => new THREE.CylinderGeometry(0.11, 0.11, 0.02, 20)), M.oldgold(), 0, 0, 0, g);
    d.rotation.x = Math.PI / 2;
    const r = mesh(geo('broochrim', () => new THREE.TorusGeometry(0.11, 0.014, 6, 24)), M.gold(), 0, 0, 0.01, g);
    void r;
    const pin = mesh(geo('pin', () => new THREE.CylinderGeometry(0.006, 0.006, 0.3, 5)), M.silver(), 0, 0, -0.016, g);
    pin.rotation.z = 0.9;
    mesh(geo('brgem', () => new THREE.IcosahedronGeometry(0.045, 0)), gem, 0, 0, 0.03, g);
  } else if (base === 'Minnemynt') {
    cord(0.12, 0.08);
    const c = mesh(geo('memcoin', () => new THREE.CylinderGeometry(0.075, 0.075, 0.014, 22)), M.silver(), 0, -0.04, 0, g);
    c.rotation.x = Math.PI / 2;
    const s = mesh(geo('memsun', () => new THREE.TorusGeometry(0.045, 0.008, 4, 18)), M.gold(), 0, -0.04, 0.009, g);
    void s;
  } else if (base === 'Stein') {
    cord(0.1, 0.08);
    mesh(geo('pebble', () => new THREE.IcosahedronGeometry(0.075, 1)), M.pebble(), 0, -0.03, 0, g).scale.set(1, 0.8, 0.6);
  } else {
    cord();
    const d = mesh(geo('pend', () => new THREE.CylinderGeometry(0.07, 0.07, 0.02, 6)), M.gold(), 0, -0.05, 0, g);
    d.rotation.x = Math.PI / 2;
    mesh(geo('pendgem', () => new THREE.OctahedronGeometry(0.045, 0)), gem, 0, -0.05, 0.022, g).scale.z = 0.6;
  }
}

// --- mat, drikk og verdisaker --------------------------------------------------------

function flask(g, liq, glow) {
  const outer = [[0, -0.12], [0.06, -0.118], [0.1, -0.09], [0.11, -0.04], [0.095, 0.02], [0.04, 0.06], [0.028, 0.08], [0.028, 0.13], [0.034, 0.14], [0, 0.14]];
  const inner = [[0, -0.108], [0.055, -0.106], [0.09, -0.082], [0.1, -0.04], [0.086, 0.01], [0, 0.01]];
  mesh(lathe('flaskin', inner, 16), liquid(liq, liq, glow), 0, 0, 0, g);
  const o = mesh(lathe('flask', outer, 18), M.glass(), 0, 0, 0, g);
  o.castShadow = false;
  o.renderOrder = 2;
  mesh(geo('cork', () => new THREE.CylinderGeometry(0.03, 0.025, 0.05, 8)), M.cork(), 0, 0.15, 0, g);
}

const ENTRY = {
  bread(g) {
    mesh(geo('loaf', () => new THREE.CapsuleGeometry(0.1, 0.18, 4, 10).rotateZ(Math.PI / 2)), M.bread(), 0, 0, 0, g).scale.set(1, 0.72, 0.9);
    const cg = geo('score', () => new THREE.BoxGeometry(0.012, 0.02, 0.14));
    for (const x of [-0.08, 0, 0.08]) { const s = mesh(cg, M.crust(), x, 0.068, 0, g); s.rotation.y = 0.5; }
  },
  sausage(g) {
    const s = mesh(geo('saus', () => new THREE.TorusGeometry(0.12, 0.045, 8, 16, Math.PI * 1.1)), M.sausage(), 0, -0.04, 0, g);
    s.rotation.z = -0.15;
    const tie = geo('saustie', () => new THREE.SphereGeometry(0.02, 6, 4));
    mesh(tie, M.twine(), 0.12, -0.05, 0, g);
    mesh(tie, M.twine(), -0.115, 0.0, 0, g);
  },
  fish(g) {
    mesh(geo('fishbody', () => new THREE.SphereGeometry(0.1, 14, 10)), M.fish(), 0, 0, 0, g).scale.set(1.9, 0.85, 0.5);
    const t = mesh(geo('fishtail', () => new THREE.ConeGeometry(0.07, 0.1, 3)), M.fish(), -0.22, 0, 0, g);
    t.rotation.z = Math.PI / 2;
    t.scale.z = 0.3;
    mesh(geo('fisheye', () => new THREE.SphereGeometry(0.014, 6, 4)), mat('fisheye', { c: 0xf0f0e0, r: 0.2 }), 0.13, 0.025, 0.04, g);
    const fin = mesh(geo('fishfin', () => new THREE.ConeGeometry(0.04, 0.08, 3)), M.crust(), 0, 0.085, 0, g);
    fin.scale.z = 0.25;
  },
  bun(g) {
    mesh(geo('bun', () => new THREE.TorusGeometry(0.075, 0.055, 10, 18)), M.bread(), 0, 0, 0, g).rotation.x = Math.PI / 2;
    mesh(geo('buntop', () => new THREE.SphereGeometry(0.07, 12, 8)), M.crust(), 0, 0.02, 0, g).scale.y = 0.6;
    const ig = geo('icing', () => new THREE.SphereGeometry(0.014, 5, 4));
    for (let i = 0; i < 7; i++) { const a = i * 0.9; mesh(ig, M.icing(), Math.cos(a) * 0.08, 0.05, Math.sin(a) * 0.08, g); }
  },
  potion(g) { flask(g, 0xc8141e, 0x7a0408); },
  potionvp(g) { flask(g, 0x8a3ae0, 0x4a10a0); },
  saffron(g) {
    mesh(geo('sack', () => new THREE.SphereGeometry(0.1, 12, 10)), M.cloth(), 0, -0.03, 0, g).scale.set(1, 0.9, 0.85);
    mesh(geo('sackneck', () => new THREE.ConeGeometry(0.06, 0.09, 10)), M.cloth(), 0, 0.09, 0, g).rotation.x = Math.PI;
    const t = mesh(geo('sacktie', () => new THREE.TorusGeometry(0.035, 0.009, 4, 12)), M.twine(), 0, 0.07, 0, g);
    t.rotation.x = Math.PI / 2;
  },
  coin(g) {
    const gg = geo('bigcoin', () => new THREE.CylinderGeometry(0.09, 0.09, 0.018, 24));
    for (let i = 0; i < 3; i++) { const c = mesh(gg, M.gold(), (i - 1) * 0.05, -0.06 + i * 0.02, (i - 1) * 0.02, g); c.rotation.set(0.15 * i, 0, 0.1 - i * 0.08); }
    const head = mesh(geo('foxhead', () => new THREE.ConeGeometry(0.035, 0.06, 3)), M.oldgold(), 0.05, -0.015, 0.02, g);
    head.rotation.x = -Math.PI / 2;
    head.scale.z = 0.25;
  },
  cup(g) {
    mesh(lathe('goblet', [[0, -0.14], [0.07, -0.14], [0.072, -0.128], [0.02, -0.11], [0.016, -0.03], [0.03, -0.01], [0.075, 0.03], [0.085, 0.12], [0.078, 0.12], [0.068, 0.035], [0, 0.0]], 20), mat('silverds', { c: 0xd4d6dc, r: 0.18, m: 1, ds: true }), 0, 0, 0, g);
    const band = mesh(geo('gobband', () => new THREE.TorusGeometry(0.081, 0.006, 4, 20)), M.gold(), 0, 0.08, 0, g);
    band.rotation.x = Math.PI / 2;
  },
  crystal(g) {
    const cm = mat('crystal', { c: 0xdaf2ff, r: 0.02, m: 0.1, e: 0x4a7aa0, ei: 0.5, op: 0.72, flat: true });
    const p = geo('cryprism', () => { const gg = new THREE.CylinderGeometry(0.045, 0.05, 0.2, 6); gg.translate(0, 0.0, 0); return gg; });
    const tip = geo('crytip', () => new THREE.ConeGeometry(0.045, 0.09, 6));
    const one = (x, y, rz, s) => { const h = new THREE.Group(); h.position.set(x, y, 0); h.rotation.z = rz; h.scale.setScalar(s); g.add(h); mesh(p, cm, 0, 0, 0, h); mesh(tip, cm, 0, 0.145, 0, h); };
    one(0, 0, 0, 1);
    one(0.06, -0.05, -0.5, 0.6);
    one(-0.055, -0.06, 0.45, 0.55);
  },
  gem_r(g) { const m = mesh(geo('gemcut', () => brilliant()), gemMat('red', 0xe0102a, 0x700010), 0, 0, 0, g); m.rotation.x = 0.5; },
  gem_g(g) { const m = mesh(geo('gemcut', () => brilliant()), gemMat('green', 0x10c060, 0x046030), 0, 0, 0, g); m.rotation.x = 0.5; m.scale.set(1.05, 1.2, 1.05); },
  ring(g) {
    const t = mesh(geo('dring', () => new THREE.TorusGeometry(0.1, 0.04, 8, 6)), M.oldgold(), 0, 0, 0, g);
    t.rotation.x = 0.6;
    const rg = geo('rune', () => new THREE.BoxGeometry(0.008, 0.03, 0.01));
    for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2 + Math.PI / 6; const r = mesh(rg, mat('runeglow', { c: 0x40e0ff, e: 0x2090c0, ei: 1.6, r: 0.4 }), Math.cos(a) * 0.1, Math.sin(a) * 0.1 * Math.cos(0.6), Math.sin(a) * 0.1 * Math.sin(0.6) + 0.035, g); r.rotation.z = a; }
  },
  chain(g) {
    const lg = geo('link', () => new THREE.TorusGeometry(0.03, 0.009, 6, 12));
    const n = 13;
    for (let i = 0; i < n; i++) {
      const a = (i / (n - 1)) * Math.PI * 1.25 - Math.PI * 0.12;
      const l = mesh(lg, M.gold(), Math.cos(a) * 0.13, -Math.sin(a) * 0.11 + 0.03, 0, g);
      l.rotation.set(i % 2 ? Math.PI / 2 : 0, 0, -a + Math.PI / 2);
      l.scale.set(1, 1.4, 1);
    }
    mesh(geo('chaingem', () => new THREE.OctahedronGeometry(0.035, 0)), gemMat('blue', 0x3050e0, 0x101870), 0, -0.1, 0, g);
  },
  crown(g) {
    const band = mesh(geo('crownband', () => new THREE.CylinderGeometry(0.13, 0.12, 0.06, 20, 1, true, 0, Math.PI * 0.9)), mat('goldds', { c: 0xe0b050, r: 0.22, m: 1, ds: true }), 0, -0.04, 0, g);
    void band;
    const sp = geo('crownspike', () => new THREE.ConeGeometry(0.022, 0.09, 4));
    for (let i = 0; i < 4; i++) { const a = (i + 0.5) / 4 * Math.PI * 0.9; mesh(sp, M.gold(), Math.sin(a) * 0.125, 0.03, Math.cos(a) * 0.125, g); }
    const gm = gemMat('red', 0xe0102a, 0x700010);
    for (let i = 0; i < 3; i++) { const a = (i + 1) / 4 * Math.PI * 0.9; mesh(geo('crowngem', () => new THREE.OctahedronGeometry(0.02, 0)), gm, Math.sin(a) * 0.13, -0.04, Math.cos(a) * 0.13, g); }
    g.rotation.y = -0.8;
  },
};

// Briljantslipt stein (krone og paviljong)
function brilliant() {
  const g = new THREE.CylinderGeometry(0.07, 0.11, 0.045, 8, 1);
  g.translate(0, 0.0225, 0);
  const p = new THREE.ConeGeometry(0.11, 0.12, 8);
  p.rotateX(Math.PI);
  p.translate(0, -0.06, 0);
  const merged = mergeTwo(g, p);
  merged.computeVertexNormals();
  return merged;
}
function mergeTwo(a, b) {
  const A = a.toNonIndexed(), B = b.toNonIndexed();
  const pos = new Float32Array(A.attributes.position.count * 3 + B.attributes.position.count * 3);
  pos.set(A.attributes.position.array, 0);
  pos.set(B.attributes.position.array, A.attributes.position.array.length);
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  return out;
}

// Ikonnavn for gjenstander uten egen "icon"
export function iconKey(e) {
  if (!e) return 'none';
  if (e.slot) {
    if (e.slot === 'vapen' || e.slot === 'vapen2') return 'w:' + (e.wid || e.kind);
    if (e.slot === 'rustning') return 'a:' + (e.aid || 'lader');
    if (e.slot === 'hjalm') return 'h:' + (e.aid || e.hid || 'oppenhjalm');
    if (e.slot === 'armar') return 'ar:' + (e.aid || 'lader');
    if (e.slot === 'ben') return 'be:' + (e.aid || 'lader');
    return 'm:' + (e.base || 'Amulett') + ':' + (e.rarity || 'magisk');
  }
  return 'e:' + e.icon;
}

// Lager en modell. Gruppen er sentrert rundt origo og omtrent en halv meter stor.
export function buildItemModel(e) {
  const g = new THREE.Group();
  if (!e) return g;
  if (e.slot === 'vapen' || e.slot === 'vapen2') {
    const w = buildWeaponMesh(e);
    g.add(w);
    g.userData.weapon = true;
  } else if (e.slot === 'rustning') armor(e, g);
  else if (e.slot === 'hjalm') helmet(e, g);
  else if (e.slot === 'armar') guards(e, g, false);
  else if (e.slot === 'ben') guards(e, g, true);
  else if (e.slot === 'amulett') amulet(e, g);
  else if (ENTRY[e.icon]) ENTRY[e.icon](g);
  else ENTRY.coin(g);
  return g;
}

// Liten lysstråle og ring på bakken etter sjeldenhet
const BEAM_GEO = new THREE.CylinderGeometry(0.05, 0.22, 3.6, 12, 1, true).translate(0, 1.8, 0);
export function rarityBeam(rarity) {
  const col = RARITY[rarity || 'vanlig'].hex;
  const m = new THREE.ShaderMaterial({
    uniforms: { uCol: { value: new THREE.Color(col) }, uT: { value: 0 }, uA: { value: rarity === 'vanlig' ? 0.18 : rarity === 'magisk' ? 0.42 : 0.62 } },
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: `uniform vec3 uCol; uniform float uT; uniform float uA; varying vec2 vUv;
      void main(){
        float fade = pow(1.0 - vUv.y, 2.2);
        float streak = 0.65 + 0.35 * sin(vUv.x * 37.7 + uT * 2.0) * sin(vUv.x * 12.6 - uT * 1.3);
        float pulse = 0.8 + 0.2 * sin(uT * 3.0);
        float rise = 0.5 + 0.5 * sin(vUv.y * 18.0 - uT * 4.0);
        gl_FragColor = vec4(uCol * (1.2 + rise * 0.6), fade * streak * pulse * uA);
      }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
  });
  const b = new THREE.Mesh(BEAM_GEO, m);
  b.userData.beam = true;
  b.castShadow = false;
  return b;
}

const RING_GEO = new THREE.PlaneGeometry(1.4, 1.4).rotateX(-Math.PI / 2);
export function rarityRing(rarity) {
  const col = RARITY[rarity || 'vanlig'].hex;
  const m = new THREE.ShaderMaterial({
    uniforms: { uCol: { value: new THREE.Color(col) }, uT: { value: 0 }, uA: { value: rarity === 'vanlig' ? 0.35 : 0.85 } },
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: `uniform vec3 uCol; uniform float uT; uniform float uA; varying vec2 vUv;
      void main(){
        vec2 p = vUv * 2.0 - 1.0;
        float r = length(p);
        float a = atan(p.y, p.x);
        float ring = smoothstep(0.08, 0.0, abs(r - 0.62 - 0.03 * sin(uT * 2.0)));
        float runes = step(0.5, fract(a * 3.8197 + uT * 0.15)) * smoothstep(0.05, 0.0, abs(r - 0.78));
        float glow = smoothstep(0.85, 0.0, r) * 0.35;
        float k = (ring + runes * 0.6 + glow) * uA;
        if (k < 0.004) discard;
        gl_FragColor = vec4(uCol * 1.4, k);
      }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const r = new THREE.Mesh(RING_GEO, m);
  r.renderOrder = 1;
  return r;
}
