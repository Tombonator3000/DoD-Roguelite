// Spilleren etter Drakar och Demoner 4.0 (DoD91). Reglene er oversatt til sanntid etter docs/regler/IMPLEMENTERING.md.
// Färdighetsslag er 1T20 mot CL. Träffområden har egne KP og egen rustning. PSY er kraften for magi.
import * as THREE from 'three';
import { G } from './state.js';
import { clRoll, resist, rollDice, diceMax, d, weaponFV, derived, baseCost, raceMax } from './rules.js';
import {
  SKILL, SPELLS, ATTR_NAME, PROF, ABILITIES, SR, LOCS, LOC_NAME, LOC_SHORT, hitLocation, CRIT_LIMB, skadebonus,
  SNEDTANDNING, skrack, FOBIER, FUMMEL_NARSTRID, FUMMEL_AVSTAND, fromRange, KONSTER, fvCost, spellBaseCost, GEAR, HJALTEFORMAGOR,
} from './dod.js';
import { addRimFlash, makeOutline } from './assets.js';
import { weaponItem, armorItem, isRanged, refinalize } from './loot.js';
import { makeCons, removeFromBag, carriedKg } from './inventory.js';
import { hungerLevel } from './worldtravel.js';
import { buildCharacter, buildWeaponMesh, ghostGeometry, HOLD } from './kinmodels.js';
import { makeBody, resizeBody, hurt, lostKP, usable, legHalf, kneeling, fallen, healBody, healFull, ARMS, LEGS } from './body.js';

// Kamera står mot +x,+z. "Opp" på skjermen er verdensretning (-1,0,-1).
const FWD = new THREE.Vector3(-1, 0, -1).normalize();
const RIGHT = new THREE.Vector3(1, 0, -1).normalize();
const tmp = new THREE.Vector3();
const tmp2 = new THREE.Vector3();

// Kombo-tider, rekkevidde og bue per våpentype (spillets eget, uv)
const MELEE = {
  fist: { t: [0.26, 0.26, 0.4], reach: 1.9, arc: 1.5, knock: 3.5 },
  knife: { t: [0.28, 0.27, 0.4], reach: 1.95, arc: 1.5, knock: 3.5 },
  sword: { t: [0.34, 0.33, 0.48], reach: 2.3, arc: 2.0, knock: 4.5 },
  axe: { t: [0.38, 0.36, 0.52], reach: 2.25, arc: 1.9, knock: 5 },
  hammer: { t: [0.42, 0.4, 0.56], reach: 2.2, arc: 1.7, knock: 6 },
  great: { t: [0.56, 0.52, 0.72], reach: 2.6, arc: 2.3, knock: 8 },
  staff: { t: [0.32, 0.32, 0.46], reach: 2.5, arc: 2.2, knock: 5 },
  spear: { t: [0.36, 0.36, 0.5], reach: 2.7, arc: 0.95, knock: 4 },
  shield: { t: [0.4, 0.4, 0.5], reach: 1.9, arc: 1.4, knock: 5 },
};
const RANGED = {
  bow: { draw: 0.48, cd: 0.22, speed: 30, proj: 'arrow' },
  xbow: { draw: 0.25, cd: 1.0, speed: 34, proj: 'bolt' },
  sling: { draw: 0.42, cd: 0.25, speed: 24, proj: 'stone' },
};
const UNARMED = () => weaponItem('obevapnad');
// Gjenstandsegenskaper som bare gjelder når du slår med akkurat det våpenet
const WEAPON_KEYS = new Set(['forh', 'master', 'dmg', 'burn', 'poison']);
// Kroppsdeler en ferdighet trenger hele (-2 CL per tapt KP, Bok II s. 19)
const NEED = {
  Klättra: ARMS, Låsdyrkning: ARMS, 'Stjäla föremål': ARMS, 'Första hjälpen': ARMS, 'Hantera fällor': ARMS, Knopar: ARMS, 'Spela instrument': ARMS, Läkekonst: ARMS,
  Smyga: LEGS, Hoppa: LEGS, Akrobatik: LEGS, Simma: LEGS, Dans: LEGS, Stavhopp: LEGS,
};
const HEAVY_SKILLS = new Set(['Smyga', 'Akrobatik', 'Hoppa', 'Klättra']);
const KONST_PARRY = { kind: 'fist', name: 'Obeväpnad parering', konst: true, dur: 99, unarmed: true };

function buildFallbackDuck() {
  const g = new THREE.Group();
  const white = new THREE.MeshStandardMaterial({ color: 0xeeeae0, roughness: 0.8 });
  const orange = new THREE.MeshStandardMaterial({ color: 0xe08a3a, roughness: 0.6 });
  const brown = new THREE.MeshStandardMaterial({ color: 0x5a3422, roughness: 0.9 });
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.32, 0.5, 4, 12), brown);
  body.position.y = 0.7;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 14, 12), white);
  head.position.set(0, 1.3, 0.05);
  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.35, 10), orange);
  beak.rotation.x = Math.PI / 2;
  beak.position.set(0, 1.25, 0.35);
  g.add(body, head, beak);
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  g.userData.mat = brown;
  return g;
}

// Varighet i sekunder fra besvärjelsens varighet (Bok III). Lange varigheter er kortet ned (uv).
function spellDur(sp, S) {
  const dur = sp.dur || '';
  if (dur === 'S/4min') return Math.max(20, (S / 4) * 60);
  if (dur === 'Sx1min') return Math.max(30, S * 20);
  if (dur === 'Sx1SR') return Math.max(SR * 3, S * SR);
  if (dur === 'Sx1h') return Math.max(60, S * 60);
  return 30;
}

export class Player {
  constructor() {
    this.root = new THREE.Group();
    this.tilt = new THREE.Group();
    this.tilt.rotation.order = 'YXZ';
    this.bob = new THREE.Group();
    this.root.add(this.tilt);
    this.tilt.add(this.bob);
    if (G.gfx) {
      this.blob = G.gfx.blobFor(0.48, 0.55);
      this.root.add(this.blob);
    }
    this.ghosts = [];
    this.ghostPool = [];
    this.lastPh = 0;
    this.pos = this.root.position;
    this.vel = new THREE.Vector3();
    this.radius = 0.42;
    this.yaw = 0;
    this.aimDir = new THREE.Vector3(0, 0, 1);
    this.walkPhase = 0;
    this.yOff = 0;
    this.metaMods = {};
    this.mats = [];
    this.wMeshes = {};
    this.equip = { vapen: null, vapen2: null, hjalm: null, rustning: null, armar: null, ben: null, amulett: null };
    this.buffs = {};
    this.fx = {};
    this.mods = {};
    this.flags = new Set();
    this.heroic = [];
    this.injuries = [];
  }

  get name() { return this.sheet?.name || 'Rollpersonen'; }
  get isDuck() { return this.sheet?.kin === 'anka'; }
  get isNebb() { return this.sheet?.id === 'svartnebb'; }
  // svärdshand (Bok I s. 27): venstrehendte slår med venstre arm
  get mainArm() { return this.sheet?.hand === 'vanster' ? 'varm' : 'harm'; }
  get offArm() { return this.mainArm === 'harm' ? 'varm' : 'harm'; }
  get kp() { return this.body.kp; }
  set kp(v) { this.body.kp = v; }
  get maxKP() { return this.body.max; }
  get loc() { return this.body.loc; }
  get locMax() { return this.body.locMax; }
  get bleeding() { return this.body.bleeding; }
  get downed() { return !!this.ko; }

  has(id) { return this.heroic.includes(id); }

  // --- modell --------------------------------------------------------------

  setSheet(sheet) {
    this.sheet = sheet;
    this.baseSkills = { ...sheet.skills };
  }

  buildModel() {
    if (this.model) this.bob.remove(this.model);
    this.rig = null;
    this.outline = null;
    this.wMeshes = {};
    const A = G.assets;
    if (this.isDuck) {
      let mesh;
      if (A.duckGeo) {
        this.mat = new THREE.MeshStandardMaterial({ map: A.duckTex, roughness: 0.78, metalness: 0.0 });
        mesh = new THREE.Mesh(A.duckGeo, this.mat);
        mesh.rotation.y = -Math.PI / 2; // modellen ser langs +X, vi vil ha +Z
        mesh.scale.setScalar(this.isNebb ? 1.08 : 1.0);
        mesh.castShadow = true;
        this.outline = makeOutline(A.duckGeo, 0.022);
        mesh.add(this.outline);
        this.ghostGeo = A.duckGeo;
        this.ghostRot = -Math.PI / 2;
        if (!this.isNebb) this.mat.color.setHSL(((this.sheet.id.length * 37) % 100) / 100, 0.18, 0.82);
      } else {
        mesh = buildFallbackDuck();
        this.mat = mesh.userData.mat;
      }
      this.mats = [this.mat];
      this.fxU = addRimFlash(this.mat, 0x000000, 2.4);
      this.model = new THREE.Group();
      this.model.add(mesh);
      // hendene sitter omtrent ved vingespissene
      this.handR = new THREE.Group();
      this.handR.position.set(-0.36, 0.72, 0.18);
      this.handL = new THREE.Group();
      this.handL.position.set(0.36, 0.72, 0.18);
      this.model.add(this.handR, this.handL);
      this.height = 1.5;
    } else {
      const E = this.equip;
      const c = buildCharacter(this.sheet, { armor: E.rustning, helmet: E.hjalm, arms: E.armar, legs: E.ben });
      this.model = c.root;
      this.rig = c.rig;
      this.mats = c.mats;
      this.fxU = c.fxU;
      this.handR = c.rig.handR;
      this.handL = c.rig.handL;
      this.height = c.height;
      this.ghostGeo = ghostGeometry(c.root);
      this.ghostRot = 0;
    }
    this.bob.add(this.model);
    this.refreshWeaponMeshes();
    this.setStealthLook(!!this._stealthLook);
  }

  refreshWeaponMeshes() {
    for (const k of ['R', 'L']) if (this.wMeshes[k]) { this.wMeshes[k].parent?.remove(this.wMeshes[k]); this.wMeshes[k] = null; }
    if (!this.handR) return;
    const main = this.weapon();
    const off = this.equip.vapen2;
    const two = this.gripOf(main) === 2;
    const mount = (item, hand, side) => {
      if (!item || item.kind === 'fist') return;
      const m = buildWeaponMesh(item);
      m.rotation.x = HOLD[item.kind] ?? -0.35;
      if (item.kind === 'shield') { m.position.set(side * 0.04, 0.12, 0.02); m.rotation.y = side * 0.25; if (this.rig) m.rotation.x = 1.55; }
      hand.add(m);
      this.wMeshes[side > 0 ? 'L' : 'R'] = m;
    };
    if (main && main.kind === 'bow') mount(main, this.handL, 1);
    else mount(main, this.handR, -1);
    if (off && !two && main?.kind !== 'bow') mount(off, this.handL, 1);
    else if (!off && !two && main?.kind !== 'bow' && this.kit?.has('formelsamling')) mount({ kind: 'focus', wid: 'orbuculum' }, this.handL, 1);
  }

  // --- nytt løp ------------------------------------------------------------

  bestWeaponSkill() {
    let best = 'Slagsmål';
    for (const [s, v] of Object.entries(this.baseSkills)) if (SKILL[s]?.type === 'vap' && v > (this.baseSkills[best] || 0)) best = s;
    return best;
  }

  newRun(meta) {
    const S = this.sheet;
    this.baseSkills = { ...S.skills };
    this.spells = { ...(S.spells || {}) };
    this.spellOrder = Object.keys(this.spells);
    this.metaMods = {};
    const lv = meta?.levels || {};
    if (lv.trening) this.metaMods['skill:' + this.bestWeaponSkill()] = lv.trening;
    if (lv.seig) this.metaMods.kp = lv.seig * 2;
    if (lv.vilje) this.metaMods.psy = lv.vilje;
    if (lv.slip) this.metaMods.dmg = lv.slip;
    this.equip = { vapen: null, vapen2: null, hjalm: null, rustning: null, armar: null, ben: null, amulett: null };
    for (const id of S.gear?.w || []) {
      const w = weaponItem(id);
      if (!w) continue;
      if (w.shield) { if (!this.equip.vapen2) this.equip.vapen2 = w; continue; }
      if (!this.equip.vapen) this.equip.vapen = w;
      else if (!this.equip.vapen2) this.equip.vapen2 = w;
    }
    for (const aid of S.gear?.a || []) {
      const a = armorItem(aid);
      if (a && !this.equip[a.slot]) this.equip[a.slot] = a;
    }
    if (this.isNebb) {
      if (this.equip.vapen?.wid === 'dolk') this.equip.vapen.name = 'Nansens dolk';
      if (this.equip.rustning) this.equip.rustning.name = 'Slitt läderharnesk';
    }
    this.kit = new Set(S.gear?.g || []);
    // to brød og proviant for to døgn på reise (verdenskartet)
    this.bag = [makeCons('brod', 2), makeCons('proviant', 2)];
    this.potions = 2 + (lv.niste || 0);
    this.silver = S.silver || 0;
    this.boons = [];
    this.heroic = [];
    this.hjp = 0;
    this.attrUp = {};
    this.heroArmed = false;
    this.exp = {};
    this.expUsed = new Set();
    this.injuries = [];
    this.phobias = [];
    this.curse = {};
    this.cd = { dodge: 0, throw: 0, sneak: 0, potion: 0, shot: 0, swap: 0, a1: 0, a2: 0, a3: 0, abil: 0, aid: 0, hero: 0 };
    this.parryT = { vapen: 0, vapen2: 0 };
    this.fx = {};
    this.buffs = {};
    this.stealth = false;
    this.sneakDiff = 0;
    this.sneakT = 0;
    this.invuln = 0;
    this.flash = 0;
    this.lock = 0;
    this.action = null;
    this.chan = null;
    this.comboStep = 0;
    this.comboTimer = 0;
    this.guard = 0;
    this.guardHeld = false;
    this.psyT = 0;
    this.kpT = 0;
    this.bleedT = 0;
    this.ko = null;
    this.helpless = false;
    this.critVital = false;
    this.dead = false;
    this.forced = null;
    this.charge = null;
    this.noAmmo = 0;
    this.floorStats = {};
    this.floor = { tjuvtur: 0 };
    this.body = null;
    this.recalc();
    healFull(this.body);
    this.psy = this.maxPSY;
    this.tilt.rotation.set(0, 0, 0);
    this._stealthLook = false;
    this.buildModel();
  }

  // --- lagring -----------------------------------------------------------------------
  // Alt som endrer seg i løpet av et løp. Resten kommer fra formulæret (sheet).
  serialize() {
    const B = this.body;
    const fx = {};
    for (const k of ['light', 'utu', 'calm', 'ankle']) if (this.fx[k]) fx[k] = this.fx[k];
    return {
      sheet: this.sheet, baseSkills: this.baseSkills, spells: this.spells, spellOrder: this.spellOrder, metaMods: this.metaMods,
      equip: this.equip, bag: this.bag, kit: [...this.kit], potions: this.potions, silver: this.silver,
      boons: this.boons, heroic: this.heroic, hjp: this.hjp, attrUp: this.attrUp, exp: this.exp, expUsed: [...this.expUsed],
      injuries: this.injuries, phobias: this.phobias, curse: this.curse,
      body: { kp: B.kp, loc: B.loc, bleeding: [...B.bleeding], lame: [...B.lame] },
      psy: this.psy, floor: this.floor, floorStats: this.floorStats, fx,
      kp: B.kp, maxKP: B.max,
    };
  }

  deserialize(s) {
    const clone = v => JSON.parse(JSON.stringify(v));
    this.setSheet(s.sheet);
    this.newRun(G.meta);
    this.baseSkills = clone(s.baseSkills);
    this.spells = clone(s.spells || {});
    this.spellOrder = clone(s.spellOrder || Object.keys(this.spells));
    this.metaMods = clone(s.metaMods || {});
    this.equip = { ...this.equip, ...clone(s.equip) };
    this.bag = clone(s.bag || []);
    this.kit = new Set(s.kit || []);
    this.potions = s.potions ?? 0;
    this.silver = s.silver ?? 0;
    this.boons = clone(s.boons || []);
    this.heroic = clone(s.heroic || []);
    this.hjp = s.hjp || 0;
    this.attrUp = clone(s.attrUp || {});
    this.exp = clone(s.exp || {});
    this.expUsed = new Set(s.expUsed || []);
    this.injuries = clone(s.injuries || []);
    this.phobias = clone(s.phobias || []);
    this.curse = clone(s.curse || {});
    this.floor = clone(s.floor || { tjuvtur: 0 });
    this.floorStats = clone(s.floorStats || {});
    this.recalc();
    const b = s.body;
    if (b) {
      this.body.kp = Math.min(this.body.max, b.kp);
      for (const l of LOCS) if (b.loc?.[l] != null) this.body.loc[l] = Math.min(this.body.locMax[l], b.loc[l]);
      this.body.bleeding = new Set(b.bleeding || []);
      this.body.lame = new Set(b.lame || []);
    }
    this.psy = Math.min(this.maxPSY, s.psy ?? this.maxPSY);
    Object.assign(this.fx, s.fx || {});
    this.helpless = this.kp <= 0;
    this.buildModel();
  }

  // Kalles når et nytt nivå begynner
  onFloor() {
    this.floorStats = { silver: 0, chests: 0, kills: 0, bread: 0, dodges: 0, runes: 0, lore: 0, beasts: 0, monsters: 0, locks: 0 };
    this.fx.light = this.kit.has('lykta');
    this.fx.sharpened = false;
    this.curse.gold = false;
  }

  // Etter minst seks timers søvn (trappa, senga): EP-sperren nullstilles (Bok I s. 63), Tjuvens tur kommer tilbake
  onSleep() {
    this.expUsed.clear();
    this.floor.tjuvtur = 0;
    this.fx.calm = 0;
    this.fx.medBonus = 0;
  }

  recalc() {
    const mods = {};
    for (const [slot, it] of Object.entries(this.equip)) {
      if (!it) continue;
      const w = slot === 'vapen' || slot === 'vapen2';
      for (const k in it.mods || {}) {
        if (w && WEAPON_KEYS.has(k)) continue;
        if (k === 'light' || (k === 'skydd' && slot !== 'amulett')) continue;
        if (k === 'skill:*') { if (it.skill) mods['skill:' + it.skill] = (mods['skill:' + it.skill] || 0) + it.mods[k]; continue; }
        mods[k] = (mods[k] || 0) + it.mods[k];
      }
    }
    const add = m => { for (const k in m || {}) mods[k] = (mods[k] || 0) + m[k]; };
    for (const b of this.boons) add(b.mods);
    add(this.metaMods);
    if (mods['skill:konst'] && this.sheet.konst) mods['skill:' + this.sheet.konst] = (mods['skill:' + this.sheet.konst] || 0) + mods['skill:konst'];
    this.mods = mods;
    this.flags = new Set(this.boons.map(b => b.flag).filter(Boolean));
    // grundegenskaper
    const A = { ...this.sheet.attrs };
    for (const k in A) A[k] = Math.max(1, A[k] + (this.attrUp?.[k] || 0) + (mods['attr:' + k] || 0));
    if (this.buffs.oka) A[this.buffs.oka.attr || 'STY'] += this.buffs.oka.e;
    this.attrs = A;
    // ferdigheter
    this.skills = {};
    for (const s in this.baseSkills) this.skills[s] = Math.max(0, this.baseSkills[s] + (mods['skill:' + s] || 0));
    for (const k in mods) if (k.startsWith('skill:')) { const s = k.slice(6); if (this.skills[s] == null && SKILL[s]) this.skills[s] = Math.max(0, mods[k]); }
    const school = this.sheet.school;
    if (school && PROF[this.sheet.profession]?.magic) for (const s of ['Känna magi', 'Kunskap om magi']) this.skills[s] = Math.max(this.skills[s] || 0, this.skills[school] || 0);
    // kropp: totala KP = (FYS + STO) / 2 (Bok I s. 24)
    const sp = this.sheet.special?.fx || {};
    let kp = Math.ceil((A.FYS + A.STO) / 2);
    if (sp.kpMul) kp = Math.floor(kp * sp.kpMul);
    kp = Math.max(3, kp + (mods.kp || 0));
    if (!this.body) this.body = makeBody(kp);
    else if (this.body.max !== kp) resizeBody(this.body, kp);
    this.maxPSY = Math.max(1, A.PSY + (mods.psy || 0));
    if (this.psy > this.maxPSY) this.psy = this.maxPSY;
    this.sb = skadebonus(A.STY + A.STO);
    let move = derived(A, this.sheet.kin, { move: (mods.move || 0) + (this.has('snabbfot') ? 2 : 0) }).move;
    if (this.fx.ankle) move -= 1;
    for (const inj of this.injuries) if (inj.slow) move = Math.min(move, 6);
    this.move = Math.max(2, move);
    // rutor per SR til meter per sekund, tilpasset kampfarten (uv)
    this.speedBase = 0.6 * this.move + 0.15;
    // rustning
    const worn = ['hjalm', 'rustning', 'armar', 'ben'].map(s => this.equip[s]).filter(Boolean);
    this.metalWorn = worn.some(a => a.metal);
    this.clank = worn.some(a => a.clank && !a.broken);
    this.perception = Math.min(0, ...worn.map(a => a.perception || 0));
    this.skyddAll = (mods.skydd || 0) + (this.buffs.skydd?.e || 0);
    this.natAbs = this.buffs.laderhud ? 2 : 0;
    // packning (Bok II s. 5: ikke mer enn STY kg)
    this.capKg = A.STY;
    this.load = this.bag ? carriedKg(this) : 0;
    this.overloaded = this.load > this.capKg;
    this.speedMul = 1 + ((mods.speed || 0) - (mods.slow || 0)) / 100;
    if (this.overloaded) this.speedMul *= 0.75;
    this.dmgFlat = mods.dmg || 0;
    if (this.kp > 0 && this.body.loc.huvud > 0) this.helpless = false;
  }

  // --- slag ----------------------------------------------------------------

  skillVal(id) {
    if (ATTR_NAME[id]) return this.attrs[id];
    if (SPELLS[id]) return this.spells[id] || 0;
    return this.skills[id] ?? 0;
  }

  /** CL for en ferdighet med alle modifikasjoner. null = du kan ikke bruke ferdigheter nå (totala KP 1). */
  cl(id, o = {}) {
    if (this.kp <= 1 && !o.always) return null;
    let cl = (o.base ?? this.skillVal(id)) + (o.mod || 0);
    const fx = this.sheet.special?.fx;
    if (fx?.cl?.[id]) cl += fx.cl[id];
    cl += this.mods.luck || 0;
    if (this.clank && (id === 'Smyga' || id === 'Klättra')) cl = Math.floor(cl / 2);
    if (id === 'Akrobatik' && this.metalWorn) cl = Math.min(cl, 0);
    if (this.perception && (id === 'Upptäcka fara' || id === 'Finna dolda ting')) cl += this.perception;
    if (this.overloaded && HEAVY_SKILLS.has(id)) cl -= 5;
    const locs = o.locs || NEED[id];
    if (locs) {
      cl -= 2 * lostKP(this.body, locs);
      for (const inj of this.injuries) if (inj.minus && locs.includes(inj.loc)) cl -= inj.minus;
    }
    if (this.fx.drunk > 0) cl -= 2;
    if (o.combat && this.fx.fearCL?.t > 0) cl -= this.fx.fearCL.v;
    if (this.curse.amnesia) cl -= 5;
    if (this.has('skarpogd') && id === 'Upptäcka fara') cl = Math.max(cl, 15);
    if (this.kp === 2) cl = Math.floor(cl / 2);
    return cl;
  }

  /**
   * Slår et färdighetsslag, eller et grundegenskapsslag for STY, FYS osv. (normalt, eller o.sg).
   * o: { mod, base, fv, sg, locs, label, combat, noExp, noHero, noBonus, halve }
   */
  roll(id, o = {}) {
    const attr = !!ATTR_NAME[id];
    let cl;
    if (attr) {
      cl = 10 + this.attrs[id] + (o.mod || 0) - (o.sg ?? 10);
      if (o.locs) cl -= 2 * lostKP(this.body, o.locs);
      if (this.kp === 2) cl = Math.floor(cl / 2);
    } else {
      cl = this.cl(id, o);
      if (cl === null) return { r: 20, r2: null, cl: 0, fv: 0, success: false, perfekt: false, fummel: false, diff: -20, blocked: true, skill: id, label: o.label || id };
    }
    let bonus = 0;
    if (!o.noBonus) {
      if (this.fx.medBonus) { bonus += this.fx.medBonus; this.fx.medBonus = 0; }
      if (this.fx.tjuvBonus) { bonus += this.fx.tjuvBonus; this.fx.tjuvBonus = 0; }
    }
    cl += bonus;
    if (o.halve) cl = Math.floor(cl / 2);
    const r = clRoll(cl, o.fv ?? (attr ? this.attrs[id] : Math.max(1, this.skillVal(id))));
    r.skill = id;
    r.label = o.label || id;
    r.bonus = bonus;
    if (this.heroArmed && !o.noHero) this.useHero(r);
    if (this.flags.has('demonLaugh') && r.fummel) { r.fummel = false; r.laughed = true; }
    G.run.rolls = (G.run.rolls || 0) + 1;
    if (r.perfekt) G.run.perfekt = (G.run.perfekt || 0) + 1;
    if (r.fummel) G.run.fummel = (G.run.fummel || 0) + 1;
    if (r.success && !o.noExp) this.gainExp(id, r.perfekt);
    return r;
  }

  rollHero(id, o, cb) {
    const r = this.roll(id, o);
    cb?.(r);
    return r;
  }

  attrRoll(attr, sg = 10, o = {}) {
    return this.roll(attr, { ...o, sg });
  }

  // Hjältepoäng: slaget blir ett trinn bedre (Bok I s. 64)
  useHero(r) {
    this.heroArmed = false;
    this.hjp = Math.max(0, this.hjp - 1);
    if (r.fummel) r.fummel = false;
    else if (!r.success) r.success = true;
    else if (!r.perfekt) r.perfekt = true;
    else this.hjp++;
    r.hero = true;
    G.run.heroUsed = (G.run.heroUsed || 0) + 1;
    G.fx.float('HJÄLTEDÅD', this.pos, 'drake big', 2.4);
    G.audio.drake?.();
  }

  armHero() {
    if (this.cd.hero > 0) return;
    this.cd.hero = 0.3;
    if (this.heroArmed) { this.heroArmed = false; G.fx.float('Avbrutt', this.pos, 'miss'); return; }
    if (this.hjp <= 0) { G.fx.float('Ingen hjältepoäng', this.pos, 'miss'); return; }
    this.heroArmed = true;
    G.fx.float('Hjältepoäng klar', this.pos, 'sneak');
    G.ui.log('Neste slag blir ett trinn bedre (1 hjältepoäng).');
  }

  // Hjältepoäng mellom slagene (Bok I s. 64, Expert s. 64): 5 HP gir +1 i en grundegenskap, aldri
  // over rasens maks og aldri STO. Hjälteförmågor koster det som står i HJALTEFORMAGOR.
  attrRoom(a) {
    if (a === 'STO') return false;
    const max = raceMax(this.sheet.kin)[a];
    return (this.sheet.attrs[a] || 0) + (this.attrUp[a] || 0) < max;
  }
  raiseAttr(a) {
    if (!this.attrRoom(a)) return false;
    this.attrUp[a] = (this.attrUp[a] || 0) + 1;
    this.recalc();
    G.fx.float(`+1 ${a}`, this.pos, 'drake big', 2.2);
    G.ui.log(`<b class="c-drake">${a} ${this.attrs[a]}</b>. Fem hjältepoäng er blitt til noe du har.`);
    return true;
  }
  learnHeroic(id) {
    const h = HJALTEFORMAGOR[id];
    if (!h || this.has(id)) return false;
    this.heroic.push(id);
    this.recalc();
    G.fx.float(h.name, this.pos, 'drake big', 2.2);
    G.ui.log(`<b class="c-drake">Hjälteförmåga: ${h.name}</b>. ${h.text}`);
    return true;
  }

  addHjp(n, why = '') {
    if (!n) return;
    this.hjp += n;
    G.run.hjpTotal = (G.run.hjpTotal || 0) + n;
    G.fx.float(`+${n} hjältepoäng`, this.pos, 'drake big', 2.4);
    G.ui.log(`<b class="c-drake">+${n} hjältepoäng</b>${why ? ': ' + why : ''}.`);
  }

  // Erfarenhet (Bok I s. 63): første lyckade slag etter søvn gir 1 EP, perfekt 1T3+1. Ikke kategori B.
  gainExp(id, perfekt) {
    if (ATTR_NAME[id]) return;
    const sk = SKILL[id];
    if (!sk && !SPELLS[id]) return;
    if (sk && (sk.kat === 'B' || sk.type === 'magi')) return;
    if (this.expUsed.has(id)) return;
    this.expUsed.add(id);
    const n = perfekt ? d(3) + 1 : 1;
    this.exp[id] = (this.exp[id] || 0) + n;
    G.fx.float(`+${n} EP`, this.pos, 'mark', 1.2);
  }
  addExp(id, n = 1) {
    this.exp[id] = (this.exp[id] || 0) + n;
  }

  spendPSY(n) {
    // PSY 0 er døden (Bok III s. 5). Spillet lar deg ikke gå dit selv (uv).
    if (this.psy - n < 1) { G.fx.float('For lite PSY', this.pos, 'miss'); return false; }
    this.psy -= n;
    return true;
  }
  gainPSY(n) {
    const before = this.psy;
    this.psy = Math.min(this.maxPSY, this.psy + n);
    if (this.psy > before) G.fx?.burst('will', this.pos, 8);
    return this.psy - before;
  }

  voice(kind) {
    const A = G.audio;
    if (this.isDuck) {
      if (kind === 'hurt') A.quack(1.45, 0.9);
      else if (kind === 'angry') { A.quack(0.78, 1); A.quack(0.72, 1, 0.13); }
      else if (kind === 'dodge') A.quack(1.25, 0.55);
      else if (kind === 'down') { A.quack(0.7, 1); A.quack(0.6, 1, 0.25); }
      else A.quack(1, 0.7);
      return;
    }
    const pitch = { halvlangdsman: 1.7, alv: 1.35, halvalv: 1.3, manniska: 1.2, dvarg: 0.85, halvorch: 0.75 }[this.sheet.kin] || 1.2;
    if (kind === 'hurt') A.grunt(pitch * 1.1);
    else if (kind === 'angry') A.grunt(pitch * 0.85);
    else if (kind === 'down') { A.grunt(pitch * 0.8); A.grunt(pitch * 0.7); }
    else if (kind === 'dodge') { if (Math.random() < 0.4) A.grunt(pitch * 1.3); }
    else A.grunt(pitch);
  }

  // --- tilstand -------------------------------------------------------------

  inCombat() {
    for (const e of G.enemies) if (!e.dead && e.alerted && !e.fleeing && Math.abs(e.pos.x - this.pos.x) + Math.abs(e.pos.z - this.pos.z) < 26) return true;
    return false;
  }
  // Ligger du? Da får fiender +5 i närstrid (Bok II s. 17)
  prone() { return !!(this.helpless || fallen(this.body) || this.action?.type === 'knockdown' || this.forced?.type === 'faint'); }
  // Orørlig: +10
  immobile() { return !!(this.forced && (this.forced.type === 'paralyzed' || this.forced.type === 'faint')); }
  hidden() { return !!(this.buffs.osynlighet || (this.buffs.kamouflage && Math.hypot(this.vel.x, this.vel.z) < 0.4)); }
  waterFree() { return (this.skills.Simma || 0) >= 11 || this.isDuck; }
  canFight() { return !this.helpless && !fallen(this.body) && this.kp > 1; }

  // --- oppdatering --------------------------------------------------------

  update(dt, input) {
    for (const k in this.cd) this.cd[k] = Math.max(0, this.cd[k] - dt);
    for (const k in this.parryT) this.parryT[k] = Math.max(0, this.parryT[k] - dt);
    this.invuln = Math.max(0, this.invuln - dt);
    this.flash = Math.max(0, this.flash - dt);
    this.lock = Math.max(0, this.lock - dt);
    this.noAmmo = Math.max(0, this.noAmmo - dt);
    if (this.blind > 0) this.blind -= dt;
    if (this.fx.drunk > 0) this.fx.drunk -= dt;
    if (this.fx.fearCL?.t > 0) this.fx.fearCL.t -= dt;
    if (this.fx.avvapna > 0) this.fx.avvapna -= dt;
    if (this.fx.medExpire > 0) { this.fx.medExpire -= dt; if (this.fx.medExpire <= 0) this.fx.medBonus = 0; }
    this.updateBuffs(dt);
    this.comboTimer -= dt;
    if (this.comboTimer <= 0 && !this.action) this.comboStep = 0;
    this.updateBarsark(dt);
    if (this.stealth) {
      this.sneakT -= dt;
      if (this.sneakT <= 0) this.sneakRoll(true);
    }
    // blødning: 1 totala KP hvert 6. SR per kroppsdel som blør (Bok II s. 18)
    if (this.bleeding.size) {
      this.bleedT += dt;
      if (this.bleedT >= SR * 6) {
        this.bleedT = 0;
        const n = this.bleeding.size;
        this.body.kp -= n;
        G.fx.float('-' + n, this.pos, 'hurt');
        G.fx.burst('blood', { x: this.pos.x, y: 0.6, z: this.pos.z }, 4);
        G.ui.log(`Du blør (${[...this.bleeding].map(l => LOC_SHORT[l]).join(', ')}): -${n} KP. Trykk <kbd>H</kbd> for Första hjälpen.`);
        this.checkVitals({ damage: true });
        if (this.dead || this.ko) return;
      }
    } else this.bleedT = 0;
    // PSY kommer tilbake utenfor kamp: 1 per 20 sekunder (Bok III: 1 per time i hvile, uv)
    if (!this.flags.has('bloodthirst')) {
      const out = !this.inCombat();
      // sulten: PSY kommer ikke tilbake av seg selv (verdenskartet, uv)
      this.psyT += dt * (out && !hungerLevel() ? 1 : 0) * (this.flags.has('breath') ? 2 : 1) * (this.sheet.special?.fx?.psyRegen || 1);
      if (this.psyT >= 20) { this.psyT = 0; if (this.psy < this.maxPSY) this.psy++; }
    }
    if (this.flags.has('regen')) {
      this.kpT += dt;
      if (this.kpT >= 12) { this.kpT = 0; this.heal(1, true); }
    }

    // bevegelsesretning (skjermrelativ)
    let ix = 0, iy = 0;
    if (input.down('KeyW') || input.down('ArrowUp')) iy += 1;
    if (input.down('KeyS') || input.down('ArrowDown')) iy -= 1;
    if (input.down('KeyD') || input.down('ArrowRight')) ix += 1;
    if (input.down('KeyA') || input.down('ArrowLeft')) ix -= 1;
    const move = tmp.set(0, 0, 0);
    if (input.touchMove.active) {
      move.addScaledVector(RIGHT, input.touchMove.x).addScaledVector(FWD, -input.touchMove.y);
      if (move.lengthSq() > 1) move.normalize();
    } else if (ix || iy) {
      move.addScaledVector(RIGHT, ix).addScaledVector(FWD, iy).normalize();
    }

    // sikte
    if (input.usingTouch) {
      const t = this.nearestEnemy(isRanged(this.weapon()) ? 22 : 9);
      if (t) this.aimDir.set(t.pos.x - this.pos.x, 0, t.pos.z - this.pos.z).normalize();
      else if (move.lengthSq() > 0.01) this.aimDir.copy(move).normalize();
    } else if (G.aim) {
      tmp2.set(G.aim.x - this.pos.x, 0, G.aim.z - this.pos.z);
      if (tmp2.lengthSq() > 0.04) this.aimDir.copy(tmp2.normalize());
    }

    if (this.ko) {
      this.vel.multiplyScalar(0.8);
      this.animate(dt, 0);
      return;
    }

    // tvungen handling fra Skräcktabellen
    if (this.forced) this.updateForced(dt, move);

    const free = !this.forced || this.forced.type === 'rage';
    const peace = !!G.dungeon?.peaceful;
    const able = this.canFight();
    let atk = free && able && (input.mouse.down || input.wasPressed('Mouse0') || input.down('TAtk'));
    if (peace && (atk || input.wasPressed('KeyQ') || input.wasPressed('TThrow') || input.wasPressed('KeyR') || input.wasPressed('KeyG') || input.wasPressed('KeyT'))) {
      atk = false;
      if (!this.peaceT || G.time > this.peaceT) {
        this.peaceT = G.time + 3;
        G.fx.float('Ikke her', this.pos, 'miss');
        if (!this.peaceTold || G.dungeon?.peaceText) { this.peaceTold = true; G.ui.log(G.dungeon?.peaceText || 'Vaktene i Fristaden holder øye med deg. Du lar våpenet være i byen.'); }
      }
    }
    const wantDodge = free && able && (input.wasPressed('Space') || input.wasPressed('TDash'));
    this.guardHeld = free && able && (input.mouse.rdown || input.down('TParry'));

    if (wantDodge) this.tryDodge(move);

    const a = this.action;
    if (a) {
      a.t += dt;
      if (a.type === 'attack') {
        if (atk && a.t > a.hitAt) a.queued = true;
        if (!a.hit && a.t >= a.hitAt) { a.hit = true; this.meleeHit(a); }
        if (a.t >= a.dur) {
          this.action = null;
          if (a.queued && !this.lock) this.startAttack();
        }
      } else if (a.type === 'shot') {
        if (!a.fired && a.t >= a.draw) { a.fired = true; this.fireShot(a); }
        if (a.t >= a.dur) this.action = null;
      } else if (a.type === 'dash') {
        if (this.flags.has('dashHit')) this.dashHits(a);
        a.ghostT = (a.ghostT || 0) - dt;
        if (a.ghostT <= 0) { a.ghostT = 0.035; this.spawnGhost(); }
        if (a.t >= a.dur) this.action = null;
      } else if (a.type === 'spin') {
        for (const h of a.hits) if (!h.done && a.t >= h.at) { h.done = true; this.spinHit(a); }
        if (a.t >= a.dur) this.action = null;
      } else if (a.type === 'cast') {
        if (!a.done && a.t >= a.at) { a.done = true; a.fn(); }
        if (a.t >= a.dur) this.action = null;
      } else if (a.type === 'knockdown') {
        if (!a.tried && this.sheet.konst && KONSTER[this.sheet.konst]?.parts.includes('uppresning')) {
          a.tried = true;
          const r = this.roll(this.sheet.konst, { label: 'Uppresning', noExp: true });
          if (r.success) { a.dur = Math.min(a.dur, 0.25); G.fx.float('Uppresning', this.pos, 'sneak'); }
        }
        if (a.t >= a.dur) this.action = null;
      } else if (a.t >= a.dur) {
        this.action = null;
      }
    } else if (free && !this.lock && able) {
      if (this.charge || this.chan) { /* lader en besvärjelse eller kanaliserer */ }
      else if (atk && !this.guard) this.startAttack();
      else if (!peace && (input.wasPressed('KeyQ') || input.wasPressed('TThrow'))) this.throwWeapon();
    }
    this.updateGuard(dt);
    if (free && (input.wasPressed('KeyZ') || input.wasPressed('Wheel') || input.wasPressed('TSwap'))) this.swapWeapons();
    if (free && !peace && able) this.updateAbilityKeys(dt, input);
    this.updateAbility(dt, input, free && !peace);
    if (free && (input.wasPressed('ShiftLeft') || input.wasPressed('ShiftRight') || input.wasPressed('TSneak'))) this.trySneak();
    if (input.wasPressed('Digit1') || input.wasPressed('TPotion')) this.drinkPotion();
    if (input.wasPressed('KeyH') || input.wasPressed('TRest')) this.startAid();
    if (input.wasPressed('KeyV') || input.wasPressed('TPush')) this.armHero();
    this.updateChan(dt, move);

    // fart
    const inWater = G.dungeon.isWater(this.pos.x, this.pos.z);
    let speed = this.speedBase * this.speedMul;
    if (inWater && !this.waterFree()) speed *= 0.5;
    if (this.stealth) speed *= 0.5;
    if (this.fx.barsark) speed *= 1.1;
    if (this.guard > 0) speed *= 0.45;
    if (this.charge) speed *= 0.5;
    if (legHalf(this.body)) speed *= 0.5;
    if (kneeling(this.body)) speed *= 0.35;
    if (this.helpless || fallen(this.body) || this.kp <= 1) speed *= 0.2;
    if (this.chan) speed *= this.chan.kind === 'aid' || this.chan.kind === 'med' ? 0 : 0.3;
    const act = this.action;
    let desired = tmp2.copy(move).multiplyScalar(speed);
    if (this.forced && this.forced.type !== 'rage') desired.copy(this.forced.dir || move).multiplyScalar(this.forced.type === 'flee' ? speed : 0);
    if (act) {
      if (act.type === 'attack') desired.multiplyScalar(0.3);
      else if (act.type === 'spin') desired.multiplyScalar(0.55);
      else if (act.type === 'stumble' || act.type === 'knockdown') desired.set(0, 0, 0);
      else if (act.type === 'throw' || act.type === 'shot' || act.type === 'cast') desired.multiplyScalar(0.45);
      else if (act.type === 'dash') desired.copy(act.dir).multiplyScalar(act.speed);
    }
    const k = act?.type === 'dash' ? 1 : 1 - Math.exp(-18 * dt);
    this.vel.lerp(desired, k);
    // utfall i angrep
    if (act?.type === 'attack' && act.t < act.hitAt) this.vel.addScaledVector(this.aimDir, (act.heavy ? 9 : 5) * dt * 10);

    this.pos.x += this.vel.x * dt;
    this.pos.z += this.vel.z * dt;
    for (const p of G.props) this.pushOut(p.pos, p.radius);
    for (const c of G.interactables) if (c.solid) this.pushOut(c.pos, c.radius);
    if (act?.type !== 'dash') for (const e of G.enemies) if (!e.dead && !e.lifted) this.pushOut(e.pos, e.radius * 0.8, 0.5);
    G.dungeon.collide(this.pos, this.radius);

    // retning
    let faceDir = null;
    if (act && (act.type === 'attack' || act.type === 'throw' || act.type === 'spin' || act.type === 'shot' || act.type === 'cast') || this.guard > 0 || this.charge) faceDir = this.aimDir;
    else if (act?.type === 'dash') faceDir = act.dir;
    else if (move.lengthSq() > 0.01) faceDir = move;
    if (faceDir) {
      const target = Math.atan2(faceDir.x, faceDir.z);
      let dy = target - this.yaw;
      while (dy > Math.PI) dy -= Math.PI * 2;
      while (dy < -Math.PI) dy += Math.PI * 2;
      this.yaw += dy * Math.min(1, dt * (act || this.guard ? 30 : 16));
    }
    this.root.rotation.y = this.yaw;

    const wasInWater = this.inWater;
    this.inWater = inWater;
    if (inWater && !wasInWater) { G.fx.burst('splash', this.pos, 10); G.audio.splash(); }
    this.animate(dt, Math.hypot(this.vel.x, this.vel.z));
    this.updateGhosts(dt);
    G.dungeon.reveal(this.pos.x, this.pos.z, 7);
  }

  updateBuffs(dt) {
    for (const id of Object.keys(this.buffs)) {
      const b = this.buffs[id];
      b.t -= dt;
      if (b.t > 0) continue;
      delete this.buffs[id];
      G.ui.log(`${SPELLS[id]?.name || id} tar slutt.`);
      if (id === 'oka' || id === 'skydd' || id === 'laderhud') this.recalc();
      if (id === 'astralvapen') this.refreshWeaponMeshes();
      if (id === 'osynlighet' || id === 'kamouflage') this.setStealthLook(this.stealth);
    }
  }

  // --- etterbilder ---------------------------------------------------------

  spawnGhost() {
    if (!this.ghostGeo) return;
    let gh = this.ghostPool.pop();
    if (!gh || gh.geometry !== this.ghostGeo) {
      gh = new THREE.Mesh(this.ghostGeo, new THREE.MeshBasicMaterial({ color: 0x8fd0ff, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending, depthWrite: false }));
      gh.matrixAutoUpdate = false;
      gh.renderOrder = 6;
    }
    gh.material.color.set(this.fx.barsark ? 0xff7a3a : this.inWater ? 0x7affd8 : 0x8fd0ff);
    const src = this.isDuck ? this.model.children[0] : this.model;
    src.updateWorldMatrix(true, false);
    gh.matrix.copy(src.matrixWorld);
    gh.matrixWorld.copy(src.matrixWorld);
    gh.userData.t = 0;
    G.scene.add(gh);
    this.ghosts.push(gh);
  }

  updateGhosts(dt) {
    for (let i = this.ghosts.length - 1; i >= 0; i--) {
      const gh = this.ghosts[i];
      gh.userData.t += dt;
      const p = gh.userData.t / 0.3;
      if (p >= 1) { G.scene.remove(gh); this.ghosts.splice(i, 1); this.ghostPool.push(gh); continue; }
      gh.material.opacity = 0.4 * (1 - p);
    }
  }

  pushOut(p, r, k = 1) {
    const dx = this.pos.x - p.x, dz = this.pos.z - p.z;
    const dd = Math.hypot(dx, dz), rr = r + this.radius;
    if (dd < rr && dd > 1e-4) {
      this.pos.x += (dx / dd) * (rr - dd) * k;
      this.pos.z += (dz / dd) * (rr - dd) * k;
    }
  }

  nearestEnemy(range, from = this.pos) {
    let best = null, bd = range;
    for (const e of G.enemies) {
      if (e.dead) continue;
      const dd = Math.hypot(e.pos.x - from.x, e.pos.z - from.z);
      if (dd < bd) { bd = dd; best = e; }
    }
    return best;
  }

  // fienden nærmest siktepunktet
  aimedEnemy(range) {
    const aim = G.input?.usingTouch || !G.aim ? null : G.aim;
    let best = null, bd = 1e9;
    for (const e of G.enemies) {
      if (e.dead) continue;
      const dp = Math.hypot(e.pos.x - this.pos.x, e.pos.z - this.pos.z);
      if (dp > range) continue;
      if (!G.dungeon.los(this.pos.x, this.pos.z, e.pos.x, e.pos.z)) continue;
      const da = aim ? Math.hypot(e.pos.x - aim.x, e.pos.z - aim.z) : dp;
      if (da < bd) { bd = da; best = e; }
    }
    return best;
  }

  // --- våpen ---------------------------------------------------------------

  weapon() {
    if (this.buffs.astralvapen) return this.astral || (this.astral = { ...weaponItem('bredsvard'), name: 'Astralvapen', dmg: 'D8-1', astral: true, skill: this.sheet.school || 'Elementarmagi', magic: true, dur: 99 });
    if (this.equip.vapen && usable(this.body, this.mainArm)) return this.equip.vapen;
    return this.unarmed || (this.unarmed = UNARMED());
  }

  // Hantering (Bok II): STY lik eller over kravet gir én hånd. Under: to hender. Under halvparten: for tungt. 0 = kan ikke brukes.
  gripOf(w) {
    if (!w || w.unarmed || w.kind === 'fist' || w.astral) return 1;
    const sty = this.attrs?.STY ?? 10;
    if (sty * 2 < (w.str || 1)) return 0;
    if (w.ranged || w.twoOnly) return 2;
    return sty >= (w.str || 1) ? 1 : 2;
  }

  // FV med et våpen: egen ferdighet, eller halvparten av beste i samme vapengrupp (Bok I s. 60)
  fvFor(w) {
    if (w?.astral) return this.skills[w.skill] || 0;
    if (!w || w.unarmed || w.kind === 'fist') return this.skills['Slagsmål'] || 0;
    return weaponFV(this.skills, w);
  }

  // Det du kan parere med akkurat nå, skjold først (Bok II s. 16-17)
  parryOptions(a = {}) {
    const out = [];
    const main = this.equip.vapen, off = this.equip.vapen2;
    const w = this.weapon();
    const two = this.gripOf(w) === 2 || isRanged(w);
    if (off && !two && !off.broken && usable(this.body, this.offArm) && this.parryT.vapen2 <= 0) {
      if (off.shield) out.push({ item: off, slot: 'vapen2' });
      else if (!isRanged(off) && !a.thrown) out.push({ item: off, slot: 'vapen2' });
    }
    if ((!a.thrown || this.projParry()) && !isRanged(w) && this.parryT.vapen <= 0) {
      const armsOK = two ? ARMS.every(l => usable(this.body, l)) : usable(this.body, this.mainArm);
      if (w.unarmed || w.kind === 'fist') {
        // obeväpnad parering finnes bare i noen stridskonster (Gigant s. 35)
        const k = this.sheet.konst;
        if (k && KONSTER[k]?.parts.includes('parering') && armsOK) out.push({ item: KONST_PARRY, slot: 'vapen', konst: k });
      } else if (armsOK && !w.broken && !(main && main.broken)) out.push({ item: w, slot: 'vapen' });
    }
    return out;
  }
  parryItem() { return this.parryOptions()[0]?.item || null; }
  // Projektilparering (Expert s. 65): piler og kastvåpen kan pareres med sverd eller stav
  projParry() {
    if (!this.has('projektilparering')) return false;
    return /svärd|sabel|stav/i.test(this.weapon()?.skill || '');
  }

  swapWeapons() {
    if (this.cd.swap > 0) return;
    const off = this.equip.vapen2;
    if (off?.shield) { G.fx.float('Skjoldet blir i hånda', this.pos, 'miss'); return; }
    if (!off && !this.equip.vapen) return;
    this.equip.vapen2 = this.equip.vapen;
    this.equip.vapen = off;
    // Dra vapen: bytte og hugge i samme bevegelse
    this.cd.swap = (this.skills['Dra vapen'] || 0) >= 10 ? 0.1 : 0.3;
    this.comboStep = 0;
    this.recalc();
    this.refreshWeaponMeshes();
    G.audio.swing(1.6, 0.15);
    G.fx.float(this.weapon().name, this.pos, 'miss');
  }

  // --- närstrid ------------------------------------------------------------

  startAttack() {
    const w = this.weapon();
    if (isRanged(w)) return this.startShot(w);
    const grip = this.gripOf(w);
    if (grip === 0) { G.fx.float('For tungt', this.pos, 'miss'); this.lock = 0.6; return; }
    if (grip === 2 && !ARMS.every(l => usable(this.body, l))) { G.fx.float('Trenger to hele armer', this.pos, 'miss'); this.lock = 0.6; return; }
    const kind = MELEE[w.kind] ? w.kind : 'fist';
    const M = MELEE[kind];
    const step = this.comboStep;
    const konst = this.sheet.konst && KONSTER[this.sheet.konst];
    const unarmed = kind === 'fist';
    const off = this.equip.vapen2;
    const offStrike = step === 2 && !unarmed && grip === 1 && off && !off.shield && !isRanged(off) && usable(this.body, this.offArm) && this.gripOf(off) === 1;
    const lowThrow = step === 2 && unarmed && konst?.parts.includes('lagtkast');
    const kick = step === 2 && !offStrike && !lowThrow && (kind === 'knife' || kind === 'fist');
    const spin = step === 2 && this.flags.has('spin');
    // initiativ: Krigare +5, Blixtrande reflexer, Initiativbonus gir raskere hugg (uv)
    let init = (this.sheet.ability === 'krigarinitiativ' ? 5 : 0) + (this.sheet.special?.fx?.init || 0) + (konst?.parts.includes('initiativ') ? 5 : 0) + (this.has('snabbslaende') ? 5 : 0);
    let dur = M.t[step] * (1 - Math.min(0.25, init * 0.02)) / (this.fx.barsark ? 1.25 : 1);
    if (grip === 2 && !w.twoOnly) dur *= 1.15;
    if (spin) {
      this.action = { type: 'spin', t: 0, dur: 0.56, hits: [{ at: 0.14, done: false }, { at: 0.38, done: false }] };
      this.comboStep = 0;
      this.comboTimer = 0.9;
      G.audio.swing(0.8, 0.45);
      return;
    }
    this.action = { type: 'attack', step, kind, kick, offStrike, lowThrow, heavy: step === 2, t: 0, dur, hitAt: dur * 0.42, hit: false, queued: false };
    this.comboStep = (step + 1) % 3;
    this.comboTimer = dur + 0.45;
    this.yaw = Math.atan2(this.aimDir.x, this.aimDir.z);
    G.audio.swing(step === 2 ? 0.7 : 1 + step * 0.15);
  }

  findTargets(range, arc) {
    const out = [];
    const fx = this.aimDir.x, fz = this.aimDir.z;
    for (const e of G.enemies) {
      if (e.dead) continue;
      const dx = e.pos.x - this.pos.x, dz = e.pos.z - this.pos.z;
      const dd = Math.hypot(dx, dz);
      if (dd > range + e.radius) continue;
      let dot = 1;
      if (dd > 0.9) {
        dot = (dx * fx + dz * fz) / dd;
        if (dot < Math.cos(arc / 2)) continue;
      }
      out.push({ e, score: dd - dot * 1.2 });
    }
    out.sort((a, b) => a.score - b.score);
    return out.map(o => o.e);
  }

  hitProps(range, arc) {
    const fx = this.aimDir.x, fz = this.aimDir.z;
    for (const p of [...G.props]) {
      const dx = p.pos.x - this.pos.x, dz = p.pos.z - this.pos.z;
      const dd = Math.hypot(dx, dz);
      if (dd > range + p.radius) continue;
      if (arc < 6 && dd > 0.6 && (dx * fx + dz * fz) / dd < Math.cos(arc / 2)) continue;
      G.world.breakProp(p);
    }
  }

  // Beskriver ett anfall: ferdighet, FV, skade og hvilke armer som må være hele
  attackSpec(w, a = {}) {
    const konstId = this.sheet.konst;
    const konst = konstId && KONSTER[konstId];
    const unarmed = !w || w.unarmed || w.kind === 'fist';
    if (a.kick) {
      // spark: Slagsmål eller stridskonst med spark (Bok II s. 20)
      const kk = konst?.parts.includes('normalspark') ? konstId : 'Slagsmål';
      return { w: UNARMED(), skill: kk, fv: this.skills[kk] || 0, dice: 'D6', kick: true, types: ['b'], label: kk === 'Slagsmål' ? 'Spark' : `${kk}: spark`, locs: [] };
    }
    if (a.lowThrow) return { w: UNARMED(), skill: konstId, fv: this.skills[konstId] || 0, dice: '0', throwDown: true, types: ['b'], label: `${konstId}: lågt kast`, locs: ARMS };
    if (unarmed) {
      if (konst?.parts.includes('krosslag')) return { w: UNARMED(), skill: konstId, fv: this.skills[konstId] || 0, dice: 'D6', types: ['b'], label: `${konstId}: krosslag`, locs: [this.mainArm], unarmed: true };
      return { w: UNARMED(), skill: 'Slagsmål', fv: this.skills['Slagsmål'] || 0, dice: 'D3', types: ['b'], label: 'Knytnäve', locs: [this.mainArm], unarmed: true };
    }
    const two = this.gripOf(w) === 2;
    return { w, skill: w.skill, fv: this.fvFor(w), dice: w.dmg, types: w.types || ['s'], label: w.astral ? 'Astralvapen' : w.skill, locs: two || isRanged(w) ? ARMS : [this.mainArm] };
  }

  meleeHit(a) {
    let w = this.weapon();
    const M = MELEE[a.kind];
    let o;
    if (a.offStrike) {
      const off = this.equip.vapen2;
      const tv = this.skills['Två vapen'] || 0;
      o = { ...this.attackSpec(off), offhand: true, locs: [this.offArm] };
      // Två vapen: FV er det laveste av de to (Bok I s. 59). Uten: -10 for sköldhanden.
      if (tv > 0) o.fv = Math.min(tv, o.fv); else o.mod = -10;
      o.label = tv > 0 ? 'Två vapen' : `${off.skill} (andra handen)`;
      w = off;
    } else o = this.attackSpec(w, a);
    o.melee = true;
    o.range = (M?.reach || 1.9) + (w?.reach || 0) * 1.2;
    o.arc = a.kick ? 2.3 : M?.arc || 1.5;
    o.knock = (a.kick ? 11 : (M?.knock || 3.5)) * (a.heavy ? 1.6 : 1);
    o.heavy = a.heavy;
    if (a.heavy && this.flags.has('bitter') && (a.kick || a.lowThrow)) { o.extra = 'D6'; o.stun = 0.9; }
    if (a.kick && this.mods.kickStun) o.stun = Math.max(o.stun || 0, 0.7);
    const col = this.fx.barsark ? 0xff6a3a : a.kick || a.lowThrow ? 0xbff6ff : this.buffs.flammandehand ? 0xffa050 : w?.astral ? 0x8ab8ff : 0xfff1c8;
    G.fx.slash(this.pos, this.yaw, o.range + 0.25, o.arc, a.step === 1 ? -1 : 1, col, a.kick ? 0.55 : 0.95, a.kick ? 0.13 : 0.15);
    this.hitProps(o.range, o.arc);
    const targets = this.findTargets(o.range, o.arc);
    if (!targets.length) return;
    // DoD: ett anfall treffer ett mål
    this.attackRoll(o, targets[0]);
  }

  relPos(t) {
    const fx = Math.sin(t.yaw), fz = Math.cos(t.yaw);
    const dx = this.pos.x - t.pos.x, dz = this.pos.z - t.pos.z;
    const dd = Math.hypot(dx, dz) || 1;
    const dot = (dx * fx + dz * fz) / dd;
    return dot < -0.35 ? 'back' : dot < 0.35 ? 'side' : 'front';
  }
  unaware(t) { return !t.alerted || t.surprised > 0 || t.asleep > 0; }

  // Ett anfallsslag mot et mål, med parering, träffområde og skade (Bok II s. 17-18)
  attackRoll(o, t) {
    if (t.dead) return;
    const w = o.w;
    const ranged = !!o.ranged;
    const pos = ranged ? 'front' : this.relPos(t);
    const unaware = this.unaware(t);
    let mod = o.mod || 0;
    if (!ranged) { if (pos === 'back') mod += 7; else if (pos === 'side') mod += 3; }
    if (t.prone > 0 && !ranged) mod += 5;
    if (t.immobile?.()) mod += 10;
    if (w?.mods?.forh) mod += w.mods.forh;
    if (this.buffs.fortrollavapen && !o.unarmed) mod += this.buffs.fortrollavapen.e;
    mod += (this.mods.weaponCL || 0) + (this.sheet.special?.fx?.weaponCL || 0);
    if (ranged && Math.hypot(t.pos.x - this.pos.x, t.pos.z - this.pos.z) < 1.6) mod -= 5;
    const r = this.roll(o.skill, { base: o.fv, fv: Math.max(1, o.fv), mod, locs: o.locs, combat: true, label: o.label });
    if (this.stealth) this.breakStealth();
    if (this.buffs.osynlighet) { delete this.buffs.osynlighet; this.setStealthLook(false); G.ui.log('OSYNLIGHET brytes.'); }
    const nm = t.def.boss ? t.def.name : t.def.name.toLowerCase();
    if (r.blocked) { G.fx.float('For svak', this.pos, 'miss'); return; }
    if (r.fummel) { this.fumble(o, r); return; }
    // lönnmördarens attack bakifrån (Bok I s. 16): bom gir vanlig skade, lyckat dobbel, perfekt fyrdobbel
    const bakhall = this.sheet.ability === 'bakhall' && !ranged && unaware && pos !== 'front' && t.def.humanoid;
    let mult = 1;
    if (bakhall) mult = r.perfekt ? 4 : r.success ? 2 : 1;
    else if (!r.success) {
      G.fx.float('Bom', t.pos, 'miss');
      G.ui.logRoll(r, `Bom mot ${nm}.`);
      return;
    }
    if (o.throwDown) {
      // lågt kast kan pareres (Gigant s. 35)
      const p = !r.perfekt && !(unaware && pos === 'back') ? t.tryParry?.(r, o) : null;
      if (p === 'parried' || p === 'perfekt') { G.ui.logRoll(r, `${t.def.name} står imot kastet.`); return; }
      t.knockDown?.(SR);
      G.fx.float('Kastet over ende', t.pos, 'cond');
      G.ui.logRoll(r, `${t.def.name} går i bakken.`);
      G.audio.hit(true);
      G.fx.addShake(0.2);
      return;
    }
    // parering: ikke mot perfekt, ikke mot projektiler, ikke når målet ikke vet om deg bakfra
    let overflow = null;
    if (!r.perfekt && !bakhall && !(unaware && pos !== 'front')) {
      const p = t.tryParry?.(r, o);
      if (p === 'parried' || p === 'perfekt') {
        G.ui.logRoll(r, `${t.def.name} parerer${p === 'perfekt' ? ' perfekt' : ''}.`);
        return;
      }
      if (p?.overflow != null) overflow = p.overflow;
    }
    const maxHit = r.perfekt || this.fx.riddarslag;
    let dmg;
    if (overflow != null) dmg = overflow;
    else {
      dmg = maxHit ? diceMax(o.dice) : rollDice(o.dice);
      if (o.unarmed && (this.sheet.special?.fx?.ironFist || this.has('jarnnave'))) dmg = diceMax(o.dice);
      const sbOK = !ranged && !bakhall && this.sb;
      if (sbOK) dmg += maxHit ? diceMax(this.sb) : rollDice(this.sb);
      if (w && !o.unarmed) dmg += (w.mods?.dmg || 0) + (w.mods?.master ? 1 : 0) + (w.mods?.forh || 0) + (this.buffs.fortrollavapen?.e || 0);
      if (this.buffs.flammandehand && !ranged) dmg += rollDice(`${this.buffs.flammandehand.e}D3`);
      if (this.fx.barsark && !ranged) dmg += d(6);
      if (o.extra) dmg += rollDice(o.extra);
      dmg += this.dmgFlat + (this.fx.sharpened && !o.unarmed ? 1 : 0);
      dmg *= mult;
      if (r.perfekt && this.flags.has('demonLaugh')) dmg *= 1.5;
      dmg = Math.round(dmg);
    }
    if (this.fx.riddarslag) { this.fx.riddarslag = false; G.ui.log('<b class="c-drake">Riddarslag:</b> maksimal skade.'); }
    const loc = t.def.detailed ? (o.loc || (o.headOnly ? 'huvud' : hitLocation(ranged))) : null;
    tmp.set(t.pos.x - this.pos.x, 0, t.pos.z - this.pos.z).normalize();
    const crit = r.perfekt || mult > 1;
    const dealt = t.takeHit(dmg, tmp, (o.knock || 3) * (crit ? 1.5 : 1), {
      loc, perfekt: r.perfekt, ignoreArmor: r.perfekt, type: this.pickType(o.types, t), src: 'player', crit, stun: o.stun || (crit ? 0.4 : 0), ranged,
      magic: !!(w?.mods?.forh || this.buffs.fortrollavapen || w?.astral), wid: w?.wid,
    });
    if (crit) {
      G.fx.float(bakhall ? 'BAKIFRÅN!' : 'PERFEKT!', this.pos, 'drake big', 2.4);
      G.audio.drake();
      G.hitStop = Math.max(G.hitStop, 0.08);
      G.fx.addShake(0.4);
      G.post?.flash(0xffc860, 0.2);
      G.post?.pulse(0.008);
      G.fx.ring(this.pos, 3.2, 0xffd070, 0.3, 0.9);
      if (r.perfekt && this.flags.has('perfektBlast')) G.world.fireBlast(t.pos, 3, 'D6');
    }
    G.fx.impact({ x: t.pos.x - tmp.x * t.radius * 0.6, z: t.pos.z - tmp.z * t.radius * 0.6 }, crit ? 0xffd060 : this.fx.barsark ? 0xff8a50 : 0xfff4e0, crit ? 2.6 : 1.5, t.type === 'rat' ? 0.45 : t.def.boss ? 1.8 : 1.1);
    if (!t.dead && dealt > 0) {
      if (w?.mods?.burn && Math.random() * 100 < w.mods.burn) t.addDot('burn');
      if (this.mods.burn && Math.random() * 100 < this.mods.burn) t.addDot('burn');
      if (w?.mods?.poison && Math.random() * 100 < w.mods.poison) t.addDot('poison');
      if (this.kit.has('somngift') && !this.fx.poisonUsed && (o.types?.includes('p') || o.types?.includes('s'))) { this.fx.poisonUsed = true; t.sleep?.(8); G.ui.log(`Sömngiften virker. ${t.def.name} sovner.`); }
    }
    // Avväpna (Bok I s. 46): lyckat anfall, lyckat slag i Avväpna, så STY + FV mot målets STY
    if (this.fx.avvapna > 0 && !t.dead && !ranged && t.canBeDisarmed?.()) {
      this.fx.avvapna = 0;
      const ar = this.roll('Avväpna', { label: 'Avväpna' });
      if (ar.success) {
        const rs = resist(this.attrs.STY + (this.skills['Avväpna'] || 0), t.attrs?.STY || 10);
        if (rs.success) { t.disarm(); G.ui.logRoll(ar, `${t.def.name} mister våpenet.`); }
        else G.ui.logRoll(ar, `${t.def.name} holder fast i våpenet.`);
      } else G.ui.logRoll(ar, 'Avväpna misslyckas.');
    }
    G.fx.addShake(o.kick || o.heavy ? 0.22 : 0.1);
    G.audio.hit(o.kick || crit || o.heavy);
    if (o.kick || o.heavy) G.hitStop = Math.max(G.hitStop, 0.045);
    const verb = bakhall ? `<b class="c-drake">Attack bakifrån</b> x${mult} mot` : r.perfekt ? '<b class="c-drake">Perfekt!</b> Fullt treff på' : 'Treff på';
    G.ui.logRoll(r, `${verb} ${nm}${loc ? ` i ${LOC_SHORT[loc]}` : ''}, ${dealt} skade.`);
  }

  // Velg skadetype: unngå det målet tåler godt (skjeletter tar ikke skade av stikk)
  pickType(types, t) {
    if (!types?.length) return 'b';
    const ok = types.filter(ty => !t.def.immune?.[ty]);
    return ok[0] || types[0];
  }

  // Fummel (Expert s. 60-61)
  fumble(o, r, depth = 0) {
    const ranged = !!o.ranged;
    const n = d(20);
    const f = fromRange(ranged ? FUMMEL_AVSTAND : FUMMEL_NARSTRID, n);
    if (depth === 0) {
      G.fx.float('FUMMEL!', this.pos, 'demon big');
      G.audio.demon();
      this.voice('hurt');
      G.post?.flash(0xff2010, 0.18);
      G.post?.pulse(0.012);
    }
    G.ui.logRoll(r, `<b class="c-demon">Fummel (${n}):</b> ${f.name}.${f.text ? ' ' + f.text : ''}`);
    const w = o.w && !o.w.unarmed && o.w.kind !== 'fist' ? o.w : null;
    const slot = w ? (this.equip.vapen === w ? 'vapen' : this.equip.vapen2 === w ? 'vapen2' : null) : null;
    const drop = far => {
      if (!w || !slot) return;
      this.equip[slot] = null;
      const a = Math.random() * Math.PI * 2, dist = far ? (d(3) + 1) * 1.5 : 0.8;
      tmp.set(this.pos.x + Math.cos(a) * dist, 0, this.pos.z + Math.sin(a) * dist);
      G.dungeon.collide(tmp, 0.3);
      G.world.spawnPickup('item', tmp.x, tmp.z, { item: w, noFly: true });
      this.recalc();
      this.refreshWeaponMeshes();
      G.ui.buildBar?.();
    };
    switch (f.fx) {
      case 'break':
        if (w) { w.broken = true; w.dur = 0; refinalize(w); G.fx.float('Våpenet brekker', this.pos, 'demon'); } else this.lock = SR;
        break;
      case 'stagger': this.lock = Math.max(this.lock, SR * 0.8); this.action = { type: 'stumble', t: 0, dur: 0.6 }; break;
      case 'stagger3': this.lock = Math.max(this.lock, SR * 0.8 * d(3)); this.action = { type: 'stumble', t: 0, dur: 0.6 }; break;
      case 'fall': this.knockdown(SR); break;
      case 'armor': {
        const loc = hitLocation(false);
        const s = ['hjalm', 'rustning', 'armar', 'ben'].find(k => this.equip[k]?.covers?.includes(loc));
        if (s) {
          const it = this.equip[s];
          this.equip[s] = null;
          G.world.spawnPickup('item', this.pos.x + 0.6, this.pos.z + 0.4, { item: it, noFly: true });
          G.ui.log(`${it.name} løsner og faller av.`);
          this.recalc();
          this.buildModel();
        }
        break;
      }
      case 'ankle': this.fx.ankle = true; this.recalc(); break;
      case 'drop': drop(false); break;
      case 'dropFar': drop(true); break;
      case 'self': this.applyHit({ value: rollDice(o.dice || 'D3') + (this.sb && !ranged ? rollDice(this.sb) : 0), who: 'Ditt eget våpen', verb: 'treffer' }); break;
      case 'open': this.fx.open = true; break;
      case 'twice': if (depth < 2) { this.fumble(o, r, depth + 1); this.fumble(o, r, depth + 1); } break;
      default: break;
    }
  }

  knockdown(dur) {
    this.action = { type: 'knockdown', t: 0, dur, tried: false };
    this.tilt.rotation.x = -0.6;
    G.fx.float('Over ende', this.pos, 'cond');
  }

  // --- avstandsanfall ----------------------------------------------------------

  startShot(w) {
    if (this.cd.shot > 0) return;
    if (this.inWater && !this.waterFree()) { G.fx.float('Ikke i vann', this.pos, 'miss'); this.cd.shot = 0.5; return; }
    if (this.noAmmo > 0) { G.fx.float('Tomt koger', this.pos, 'miss'); this.cd.shot = 0.5; return; }
    if (this.gripOf(w) === 0) { G.fx.float('For tung å spenne', this.pos, 'miss'); this.cd.shot = 0.6; return; }
    if (!ARMS.every(l => usable(this.body, l))) { G.fx.float('Trenger to hele armer', this.pos, 'miss'); this.cd.shot = 0.6; return; }
    const R = RANGED[w.kind];
    const draw = R.draw * (w.wid === 'langbage' ? 1.25 : 1);
    this.action = { type: 'shot', t: 0, draw, dur: draw + 0.12, w, fired: false };
    this.yaw = Math.atan2(this.aimDir.x, this.aimDir.z);
    G.audio.swing(0.5, 0.12);
  }

  fireShot(a) {
    const w = a.w;
    const R = RANGED[w.kind];
    // armborst lades på nytt: 3 og 6 SR i boka, kortet ned i spillet (uv)
    this.cd.shot = w.reload ? w.reload * SR * 0.4 : R.cd;
    const range = (w.range || 30) * (1 + (this.sheet.special?.fx?.range || 0) / 100);
    const life = Math.min(1.25, range * 0.6 / R.speed);
    const spec = { ...this.attackSpec(w), ranged: true, knock: 3 };
    G.world.spawnPlayerProjectile(R.proj, this.pos, this.aimDir.clone(), { speed: R.speed, life, o: spec });
    G.audio.swing(w.kind === 'xbow' ? 0.5 : 1.9, 0.3);
  }

  throwWeapon() {
    if (this.cd.throw > 0) return;
    const can = it => it && it.thrown && !it.broken;
    const slot = can(this.equip.vapen2) ? 'vapen2' : can(this.equip.vapen) ? 'vapen' : null;
    if (!slot) { G.fx.float('Ingenting å kaste', this.pos, 'miss'); this.cd.throw = 0.4; return; }
    const arm = slot === 'vapen' ? this.mainArm : this.offArm;
    if (!usable(this.body, arm)) { G.fx.float('Armen er ubrukelig', this.pos, 'miss'); return; }
    const it = this.equip[slot];
    this.equip[slot] = null;
    if (slot === 'vapen' && this.equip.vapen2 && !this.equip.vapen2.shield) { this.equip.vapen = this.equip.vapen2; this.equip.vapen2 = null; }
    this.recalc();
    this.refreshWeaponMeshes();
    this.cd.throw = 0.38;
    this.action = { type: 'throw', t: 0, dur: 0.22 };
    this.yaw = Math.atan2(this.aimDir.x, this.aimDir.z);
    // kastvåpen når STY rutor (Bok II s. 32), en rute er 1,5 m
    const maxR = Math.max(6, this.attrs.STY * 1.5);
    const spec = { ...this.attackSpec(it), w: it, ranged: true, thrown: true, knock: 3, locs: [arm] };
    G.world.spawnPlayerProjectile('thrown', this.pos, this.aimDir.clone(), { speed: 22, life: Math.min(1.1, maxR / 22), item: it, o: spec });
    G.audio.swing(1.8, 0.25);
  }

  // --- forsvar --------------------------------------------------------------

  tryDodge(move) {
    if (this.cd.dodge > 0 || this.fx.barsark || this.chan) return;
    if (kneeling(this.body) || fallen(this.body)) { G.fx.float('Kan ikke dukke på kne', this.pos, 'miss'); this.cd.dodge = 0.5; return; }
    if (this.action && (this.action.type === 'spin' || this.action.type === 'stumble' || this.action.type === 'knockdown')) return;
    this.charge = null;
    if (this.stealth) this.breakStealth();
    const dir = move.lengthSq() > 0.01 ? move.clone().normalize() : this.aimDir.clone();
    const heavy = this.equip.rustning?.metal && this.equip.rustning.kg >= 10;
    this.action = { type: 'dash', t: 0, dur: 0.2, dir, hits: new Set(), speed: (heavy ? 18 : 24) * Math.min(1.25, this.speedMul) * (this.inWater && !this.waterFree() ? 0.6 : 1) };
    this.comboStep = 0;
    this.dodgeWin = 0.3;
    this.dodgeT = G.time;
    this.cd.dodge = 0.7;
    this.floorStats.dodges = (this.floorStats.dodges || 0) + 1;
    G.audio.swing(1.5, 0.3);
    this.voice('dodge');
    G.fx.burst(this.inWater ? 'splash' : 'dust', this.pos, 8);
    if (this.isDuck) G.fx.burst('feather', this.pos, 2);
  }

  dodging() {
    return this.dodgeT != null && G.time - this.dodgeT < this.dodgeWin;
  }

  updateGuard() {
    const can = !this.fx.barsark && this.canFight() && this.parryOptionsAny();
    if (this.guardHeld && can && (!this.action || (this.action.type === 'attack' && this.action.t > this.action.hitAt))) {
      this.guard = 1;
    } else if (this.guard > 0) this.guard = 0;
    else if (this.guardHeld && !can && !this._noParryMsg) {
      this._noParryMsg = true;
      G.fx.float(this.fx.barsark ? 'Bärsärk parerer ikke' : 'Kan ikke parere med dette', this.pos, 'miss');
      setTimeout(() => (this._noParryMsg = false), 1200);
    }
  }
  // Har du noe å parere med i det hele tatt (uansett om det er brukt denne SR)?
  parryOptionsAny() {
    const save = { ...this.parryT };
    this.parryT.vapen = 0;
    this.parryT.vapen2 = 0;
    const n = this.parryOptions().length;
    this.parryT = save;
    return n > 0;
  }

  /**
   * Et anfall mot deg. a: { src, roll, dmg, sb, type, ranged, thrown, small, natural, noParry, noDodge, verb, who, after, value, loc, total, ignoreArmor }
   * roll er fiendens anfallsslag (clRoll). Uten roll regnes det som lyckat.
   */
  receiveAttack(a) {
    if (this.dead || this.ko) return;
    if (this.invuln > 0 && !a.ignoreInvuln) return;
    const r = a.roll || { success: true, perfekt: false };
    if (!r.success && this.fx.open) { r.success = true; this.fx.open = false; G.ui.log('Den klumpete bevegelsen din åpner for et treff.'); }
    if (!r.success) {
      G.fx.float('Bom', this.pos, 'miss');
      if (a.roll) G.ui.logRoll(a.roll, `${a.who || a.src?.def?.name || 'Noe'} bommer.`, true);
      return;
    }
    const front = !a.src || (() => {
      const dx = a.src.pos.x - this.pos.x, dz = a.src.pos.z - this.pos.z;
      const dd = Math.hypot(dx, dz) || 1;
      return (dx * Math.sin(this.yaw) + dz * Math.cos(this.yaw)) / dd > -0.1;
    })();
    // dukking: normalt SMI-slag (DoD91 har ingen Undvika, uv)
    if (!a.noDodge && this.dodging()) {
      const akro = (this.skills.Akrobatik || 0) >= 5 && !this.metalWorn ? 3 : 0;
      const dr = this.roll('SMI', { sg: 10, mod: akro, locs: LEGS, label: 'Dukke unna', noExp: true });
      if (dr.success) {
        G.fx.float('Unna', this.pos, 'miss');
        G.ui.logRoll(dr, `${this.name} dukker unna.`);
        G.run.dodges = (G.run.dodges || 0) + 1;
        return;
      }
      G.ui.logRoll(dr, 'Klarer ikke å dukke unna.');
    }
    // SKÖLD: lufta parerer neste fysiske anfall av seg selv (Bok III)
    if (this.buffs.skold && !r.perfekt) {
      const bv = this.buffs.skold.bv;
      const val = a.value ?? rollDice(a.dmg) + (a.sb ? rollDice(a.sb) : 0);
      delete this.buffs.skold;
      G.fx.ring(this.pos, 1.6, 0x9ad8ff, 0.3, 0.4);
      if (val <= bv) { G.ui.log('SKÖLD tar anfallet.'); return; }
      G.ui.log(`SKÖLD brister (${val} mot BV ${bv}).`);
      return this.applyHit({ ...a, value: val - bv });
    }
    // parering (Bok II s. 17)
    if (!r.perfekt && !a.noParry && this.guard > 0 && front && !this.fx.barsark && (!(a.ranged && !a.thrown) || this.projParry())) {
      const opt = this.parryOptions(a)[0];
      if (opt) {
        const item = opt.item;
        const skill = opt.konst || item.skill;
        const fv = opt.konst ? (this.skills[opt.konst] || 0) : this.fvFor(item);
        const locs = opt.slot === 'vapen2' ? [this.offArm] : this.gripOf(item) === 2 ? ARMS : [this.mainArm];
        const pmod = (this.sheet.special?.fx?.parryCL || 0) + (a.src?.feint ? -Math.floor(fv / 2) : 0);
        const pr = this.roll(skill, { base: fv, fv: Math.max(1, fv), locs, mod: pmod, combat: true, label: 'Parera' });
        this.parryT[opt.slot] = SR;
        if (pr.fummel) {
          this.fumble({ w: item, dice: item.dmg }, pr);
        } else if (pr.perfekt) {
          G.fx.float('Perfekt parering', this.pos, 'sneak');
          G.ui.logRoll(pr, `${this.name} parerer perfekt.`);
          G.run.parries = (G.run.parries || 0) + 1;
          this.parryFx();
          return;
        } else if (pr.success) {
          G.run.parries = (G.run.parries || 0) + 1;
          this.parryFx();
          const val = a.value ?? rollDice(a.dmg) + (a.sb ? rollDice(a.sb) : 0);
          if (opt.konst) {
            // obeväpnad parering trekker 1T6 fra skaden (Gigant s. 35)
            const red = d(6);
            G.ui.logRoll(pr, `${opt.konst}: ${this.name} tar av for slaget (-${red}).`);
            if (val - red > 0) return this.applyHit({ ...a, value: val - red });
            return;
          }
          if (val > item.dur && item.dur > 0) {
            const before = item.dur;
            item.dur -= 1;
            let txt = `${this.name} parerer. ${item.name} mister 1 BV (${val} mot BV ${before}).`;
            if (item.dur <= 0) {
              item.broken = true;
              refinalize(item);
              txt = `${item.name} går i stykker (${val} mot BV ${before}).`;
              G.fx.float('Ødelagt!', this.pos, 'demon');
              G.ui.logRoll(pr, txt);
              this.recalc();
              G.ui.buildBar?.();
              if (val - before > 0) return this.applyHit({ ...a, value: val - before });
              return;
            }
            refinalize(item);
            G.ui.logRoll(pr, txt);
            return;
          }
          G.fx.float('Parerat', this.pos, 'miss');
          G.ui.logRoll(pr, `${this.name} parerer.`);
          return;
        } else G.ui.logRoll(pr, 'Pareringen glipper.');
      }
    }
    return this.applyHit(a);
  }

  parryFx() {
    G.fx.burst('spark', { x: this.pos.x + Math.sin(this.yaw) * 0.6, y: 1.1, z: this.pos.z + Math.cos(this.yaw) * 0.6 }, 10);
    G.audio.hit(false);
  }

  // Absorbering på en kroppsdel: beste rustningsdel + SKYDD + naturlig skydd
  absAt(loc) {
    let best = 0;
    for (const s of ['hjalm', 'rustning', 'armar', 'ben']) {
      const a = this.equip[s];
      if (!a || a.broken || !a.covers?.includes(loc)) continue;
      best = Math.max(best, a.abs + (a.mods?.skydd || 0));
    }
    return best + this.skyddAll + this.natAbs;
  }

  applyHit(a) {
    if (this.dead) return 0;
    const perf = !!a.roll?.perfekt;
    let value = a.value ?? (perf ? diceMax(a.dmg) + (a.sb ? diceMax(a.sb) : 0) : rollDice(a.dmg) + (a.sb ? rollDice(a.sb) : 0));
    if ((a.type === 'fire' || a.type === 'cold') && this.buffs.motstandskraft) value = Math.max(0, value - this.buffs.motstandskraft.e);
    const loc = a.total ? null : (a.loc || (a.small ? hitLocation(false, d(8)) : hitLocation(!!a.ranged)));
    // skjoldet tar piler mot kroppsdelene det dekker når du står i vakt (Bok III s. 37)
    if (loc && a.ranged && this.guard > 0) {
      const sh = this.equip.vapen2;
      if (sh?.shield && !sh.broken && sh.covers?.includes(loc) && usable(this.body, this.offArm)) {
        G.fx.float('Skjoldet', this.pos, 'miss');
        this.parryFx();
        G.ui.log(`${sh.name} tar ${a.who ? a.who.toLowerCase() : 'skuddet'}.`);
        return 0;
      }
    }
    const abs = a.ignoreArmor || perf ? 0 : loc ? this.absAt(loc) : a.armorLoc ? this.absAt(a.armorLoc) : 0;
    const real = Math.max(0, Math.round(value) - abs);
    if (this.stealth) this.breakStealth();
    if (this.buffs.osynlighet) { delete this.buffs.osynlighet; this.setStealthLook(false); }
    if (a.src?.def) a.src.hurtPlayer = true;
    const who = a.who || a.src?.def?.name || 'Noe';
    if (real <= 0) {
      G.fx.float('Prell', this.pos, 'miss');
      G.fx.burst('spark', { x: this.pos.x, y: 1, z: this.pos.z }, 6);
      if (a.verb) this.logHit(a, `${who} ${a.verb} ${this.name}${loc ? ' i ' + LOC_SHORT[loc] : ''}, men rustningen tar alt (${value}).`);
      a.after?.(0);
      return 0;
    }
    this.interrupt('skade');
    const info = hurt(this.body, loc, real);
    G.run.damageTaken = (G.run.damageTaken || 0) + real;
    if (a.verb) this.logHit(a, `${who} ${a.verb} ${this.name}${loc ? ' i ' + LOC_SHORT[loc] : ''}${perf ? ' med full kraft' : ''}. ${real} skade${abs && real < value ? ` (${value - real} tatt av rustning)` : ''}.`);
    this.flash = 0.14;
    this.invuln = Math.max(this.invuln, 0.12);
    G.fx.float('-' + real, this.pos, 'hurt');
    if (this.isDuck) G.fx.burst('feather', this.pos, 6);
    G.fx.burst('blood', { x: this.pos.x, y: 1, z: this.pos.z }, 5);
    G.fx.addShake(0.35);
    G.post?.pulse(0.01);
    G.post?.flash(0xa01008, 0.12);
    this.voice('hurt');
    G.audio.hit(true);
    G.ui.flashDamage();
    if (this.mods.thorns && a.src && !a.src.dead && a.src.takeHit) {
      tmp.set(a.src.pos.x - this.pos.x, 0, a.src.pos.z - this.pos.z).normalize();
      a.src.takeHit(this.mods.thorns, tmp, 2, { total: true });
    }
    a.after?.(real);
    if (info.loc) this.onLocHit(info);
    if (!this.dead) this.checkVitals({ damage: true });
    return real;
  }

  logHit(a, txt) {
    if (a.roll && a.roll.r != null) G.ui.logRoll(a.roll, txt, true);
    else G.ui.log(txt, 'enemy');
  }

  // Hva skjer når en kroppsdel går i null eller blir kritisk skadet (Bok II s. 18-19)
  onLocHit(info) {
    const l = info.loc;
    if (info.critical) {
      if (l === 'huvud') {
        G.ui.log(`<b class="c-demon">Kritisk skade i hodet.</b> Hodet til ${this.name} knuses.`);
        G.game.onDeath(true, 'Hodet knust');
        return;
      }
      if (l === 'brost' || l === 'mage') {
        this.critVital = true;
        G.ui.log(`<b class="c-demon">Kritisk skade i ${LOC_SHORT[l]}.</b> Du forblør om ingen stopper det.`);
        this.body.bleeding.add(l);
        this.knockOut(`kritisk skade i ${LOC_SHORT[l]}`);
        return;
      }
      const c = fromRange(CRIT_LIMB, d(10));
      this.injuries.push({ loc: l, name: c.name, minus: c.minus || 0, lame: !!c.lame, slow: !!c.slow && LEGS.includes(l), text: c.text });
      if (c.lame) this.body.lame.add(l);
      G.ui.log(`<b class="c-demon">Kritisk skade i ${LOC_SHORT[l]}:</b> ${c.name}. ${c.text}`);
      G.fx.float(c.name, this.pos, 'demon', 2.4);
      this.recalc();
      if (ARMS.includes(l)) this.armDown(l);
    }
    if (info.zero) {
      this.body.bleeding.add(l);
      G.fx.float(`${LOC_NAME[l]} 0`, this.pos, 'cond big', 2.2);
      if (l === 'huvud') { G.ui.log('Hodet er nede på 0 KP. Det blir svart.'); this.knockOut('slag mot hodet'); return; }
      if (l === 'brost' || l === 'mage') {
        G.ui.log(`${LOC_NAME[l]} er nede på 0 KP. ${this.name} faller og kan bare krype. Drikk, eller trykk <kbd>H</kbd> for å stoppe blødningen.`);
        this.guard = 0;
        this.breakStealth();
        return;
      }
      G.ui.log(`${LOC_NAME[l]} er nede på 0 KP og blør. ${ARMS.includes(l) ? 'Armen henger slapp.' : 'Du står på kne.'}`);
      if (ARMS.includes(l)) this.armDown(l);
      if (this.fx.barsark) {
        const br = this.roll('Bärsärkagång', { noExp: true, label: 'Bärsärkagång' });
        if (br.success) this.endBarsark('Raseriet legger seg.');
      } else {
        // svårt PSY-slag for å slåss videre (Bok II s. 18)
        const r = this.attrRoll('PSY', 15, { label: 'Smärta', noExp: true });
        if (!r.success) { this.forced = { type: 'paralyzed', t: 0, max: SR }; G.ui.logRoll(r, 'Smerten lammer deg et øyeblikk.'); }
        else G.ui.logRoll(r, 'Du biter tennene sammen.');
      }
    }
  }

  // Armen er ute: det du holder i den hånda faller
  armDown(l) {
    const drop = slot => {
      const it = this.equip[slot];
      if (!it || it.shield) return;
      this.equip[slot] = null;
      G.world.spawnPickup('item', this.pos.x + 0.5, this.pos.z + 0.5, { item: it, noFly: true });
      G.ui.log(`${it.name} faller fra deg.`);
    };
    if (l === this.mainArm) drop('vapen');
    if (l === this.offArm) {
      drop('vapen2');
      const w = this.equip.vapen;
      if (w && this.gripOf(w) === 2) drop('vapen');
    }
    this.recalc();
    this.refreshWeaponMeshes();
    G.ui.buildBar?.();
  }

  // Totala KP 2: halv CL. 1: bare krype. 0: medvetslös. Minus FYS: død (Bok II s. 18).
  checkVitals(o = {}) {
    if (this.dead) return;
    if (this.kp <= -this.attrs.FYS) {
      G.ui.log(`${this.name} har ${this.kp} KP. Det er under minus FYS (${-this.attrs.FYS}).`);
      G.game.onDeath(false, 'Totala KP under minus FYS');
      return;
    }
    if (this.kp <= 0 && !this.ko && (o.damage || !this.helpless)) { this.knockOut('totala KP er 0'); return; }
    if (this.kp === 2 && this._kpWarn !== 2) { this._kpWarn = 2; G.ui.log('Totala KP er 2: halv CL på alt.'); }
    if (this.kp === 1 && this._kpWarn !== 1) { this._kpWarn = 1; G.ui.log('Totala KP er 1: du kan ikke bruke ferdigheter, bare krype, drikke og spise.'); }
    if (this.kp > 2) this._kpWarn = 0;
  }

  knockOut(cause) {
    if (this.ko || this.dead) return;
    this.ko = { cause };
    this.breakStealth();
    this.guard = 0;
    this.action = null;
    this.chan = null;
    this.charge = null;
    this.forced = null;
    if (this.fx.barsark) this.fx.barsark = 0;
    this.voice('down');
    G.game.onKnockout?.(cause);
  }

  // Når du våkner. hero: du reiste deg med en hjältepoäng.
  wakeUp(hero = false) {
    this.ko = null;
    if (hero) {
      if (this.kp < 1) this.kp = 1;
      for (const l of ['huvud', 'brost', 'mage']) if (this.body.loc[l] < 1) this.body.loc[l] = 1;
    }
    this.critVital = false;
    this.invuln = 2;
    this.helpless = this.kp <= 0 || this.body.loc.huvud <= 0;
    this.tilt.rotation.set(0, 0, 0);
  }

  interrupt(why) {
    // konsentrasjonen brytes: besvärjelsen misslyckas og koster 1 PSY (Bok III s. 4)
    if (this.action?.type === 'cast' && !this.action.done && this.action.spell) {
      this.action = null;
      this.psy = Math.max(1, this.psy - 1);
      G.fx.float('Konsentrasjonen brytes', this.pos, 'miss');
      G.ui.log('Konsentrasjonen brytes. Besvärjelsen misslyckas (1 PSY).');
    }
    if (this.charge) this.charge = null;
    if (this.chan) { G.fx.float('Avbrutt', this.pos, 'miss'); this.chan = null; }
    void why;
  }

  // --- Skräck (Bok III s. 8-11) ---------------------------------------------------

  fearCheck(src, slag = 0) {
    if (this.dead || this.ko) return;
    if (this.buffs.orad || this.has('orad') || this.mods.fearless) {
      G.fx.float('Orädd', this.pos, 'sneak');
      G.ui.log(`${this.name} kjenner ingen skräck.`);
      return;
    }
    const mods = [];
    if (this.sheet.ability === 'lardlugn') mods.push(-5);
    if (this.sheet.special?.fx?.fear) mods.push(this.sheet.special.fx.fear);
    if (this.fx.utu) mods.push(-2);
    if (this.fx.calm) mods.push(-2);
    if (src && this.phobias.some(p => p.type === src.type)) mods.push(3);
    const m = mods.length ? mods.reduce((a, b) => (Math.abs(b) > Math.abs(a) ? b : a), 0) : 0;
    const r = d(20);
    const n = r - this.attrs.PSY + slag + m;
    const res = skrack(n);
    const sign = v => (v >= 0 ? `+${v}` : `${v}`);
    G.ui.log(`<span class="roll ${n <= 1 ? 'ok' : 'fail'}" title="1T20 - PSY + skräckslå + modifikasjon">Skräck ${r}-${this.attrs.PSY}${sign(slag)}${m ? sign(m) : ''}=${n}</span> <b class="c-demon">${res.name}:</b> ${res.text}`);
    if (n > 1) G.fx.float(res.name.toUpperCase(), this.pos, 'cond big', 2.6);
    this.applyFear(res, src);
  }

  applyFear(res, src) {
    const dice = v => (typeof v === 'number' ? v : rollDice(v));
    if (res.calm) this.fx.calm = 1;
    if (res.cl) this.fx.fearCL = { v: dice(res.cl), t: dice(res.sr || 1) * SR };
    if (res.paralyze) this.forced = res.paralyze === 'source' ? { type: 'paralyzed', t: 0, src, untilSource: true, max: 14 } : { type: 'paralyzed', t: 0, max: dice(res.paralyze) * SR };
    if (res.flee) this.forced = { type: 'flee', t: 0, src, random: !!res.random, max: Math.min(14, dice(res.flee) * SR * 0.5), dir: null };
    if (res.berserk) this.forced = { type: 'rage', t: 0, src, max: SR * 3 };
    if (res.faint) {
      if (res.faint === 'long') { this.knockOut('besvimt av skräck'); return; }
      this.forced = { type: 'faint', t: 0, max: dice(res.faint) * SR * 0.5 };
    }
    if (res.phobia && src) {
      const name = FOBIER[d(FOBIER.length) - 1];
      this.phobias.push({ type: src.type, name, mild: res.phobia < 10 });
      G.ui.log(`Du får ${res.phobia < 10 ? 'en mild' : 'en'} fobi: ${name.toLowerCase()} (${src.def?.name?.toLowerCase() || 'kilden'}).`);
    }
    if (res.halfSMI) this.fx.fearCL = { v: 4, t: 20 };
    if (this.forced?.type === 'faint') this.knockdown(this.forced.max);
  }

  updateForced(dt, move) {
    const f = this.forced;
    f.t += dt;
    const srcGone = !f.src || f.src.dead || Math.hypot(f.src.pos.x - this.pos.x, f.src.pos.z - this.pos.z) > 18;
    if ((f.max != null && f.t >= f.max) || (f.untilSource && srcGone)) { this.forced = null; G.fx.float('Fri', this.pos, 'miss'); return; }
    if (f.type === 'rage') {
      if (f.src && !f.src.dead) {
        move.set(f.src.pos.x - this.pos.x, 0, f.src.pos.z - this.pos.z);
        const dist = move.length();
        move.normalize();
        this.aimDir.copy(move);
        if (dist < 2.2 && !this.action) this.startAttack();
      }
      return;
    }
    if (f.type === 'flee') {
      if (!f.dir || (!f.random && f.src)) {
        f.dir = f.random || !f.src ? (f.dir || new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize()) : new THREE.Vector3(this.pos.x - f.src.pos.x, 0, this.pos.z - f.src.pos.z).normalize();
      }
    }
  }

  // --- R, G, T: besvärjelser eller ferdigheter ------------------------------------

  activeSlots() {
    if (this.spellOrder?.length && !this.curse.mute) return this.spellOrder.filter(id => SPELLS[id]).slice(0, 3).map(id => ({ kind: 'spell', id }));
    return ['Bärsärkagång', 'Avväpna'].filter(s => (this.baseSkills[s] || 0) > 0).slice(0, 3).map(id => ({ kind: 'skill', id }));
  }

  updateAbilityKeys(dt, input) {
    const slots = this.activeSlots();
    const keys = [['KeyR', 'TA1', 'a1'], ['KeyG', 'TA2', 'a2'], ['KeyT', 'TA3', 'a3']];
    slots.forEach((s, i) => {
      const [k, tk, cdk] = keys[i];
      const pressed = input.wasPressed(k) || input.wasPressed(tk);
      const held = input.down(k) || input.down(tk);
      if (s.kind === 'skill') {
        if (pressed && this.cd[cdk] <= 0) this.useSkillSlot(s.id, cdk);
        return;
      }
      // besvärjelse: hold for høyere effektgrad
      if (pressed && !this.charge && this.cd[cdk] <= 0 && !this.lock && !this.action) {
        this.charge = { id: s.id, cdk, t: 0, key: k, tkey: tk, e: 0 };
      }
      if (this.charge && this.charge.cdk === cdk) {
        this.charge.t += dt;
        const maxE = this.maxE(s.id);
        const e = Math.max(1, Math.min(maxE, 1 + Math.floor(this.charge.t / 0.35)));
        if (e !== this.charge.e) {
          this.charge.e = e;
          G.fx.ring(this.pos, 1.0 + e * 0.35, [0x9ab8ff, 0xb08aff, 0xff8ad8, 0xffd08a][Math.min(3, e - 1)], 0.25, 0.1);
          if (e > 1) G.audio.menuTick?.(60 + e * 3);
        }
        if (!held) {
          const c = this.charge;
          this.charge = null;
          this.castSpell(c.id, c.e, c.cdk);
        }
      }
    });
  }

  // Høyeste effektgrad: FV i skolen, og aldri så mye at PSY går til 0
  maxE(id) {
    const sp = SPELLS[id];
    const school = sp.school === 'Allmän' ? this.sheet.school : sp.school;
    return Math.max(1, Math.min(this.skills[school] || 1, this.psy - 1, 10));
  }

  useSkillSlot(id, cdk) {
    this.cd[cdk] = 0.6;
    if (id === 'Bärsärkagång') {
      if (this.fx.barsark) { G.fx.float('Allerede bärsärk', this.pos, 'miss'); return; }
      this.fx.barsark = 1;
      this.fx.barsarkCalm = 0;
      this.guard = 0;
      this.voice('angry');
      G.fx.ring(this.pos, 3.5, 0xff3a1a, 0.4);
      G.fx.burst('rage', this.pos, 20);
      G.fx.addShake(0.25);
      G.fx.float('BÄRSÄRK', this.pos, 'rage big', 2.4);
      G.ui.log(`${this.name} går <b class="c-rage">bärsärk</b>: +1T6 skade og raskere hugg, ingen parering eller dukking (Bok I s. 46).`);
    } else if (id === 'Avväpna') {
      this.fx.avvapna = 6;
      G.fx.float('Avväpna', this.pos, 'sneak');
      G.ui.log('Neste treff prøver å slå våpenet ut av hånda på fienden.');
    }
  }

  updateBarsark(dt) {
    if (!this.fx.barsark) return;
    if (Math.random() < dt * 14) G.fx.burst('rage', this.pos, 1);
    if (!this.inCombat()) this.fx.barsarkCalm = (this.fx.barsarkCalm || 0) + dt; else this.fx.barsarkCalm = 0;
    if (this.fx.barsarkCalm > 2) {
      // alle fiender er borte: slå Bärsärkagång. Bom: du svimer (Bok I s. 46)
      const r = this.roll('Bärsärkagång', { noExp: true, label: 'Bärsärkagång' });
      if (r.success) this.endBarsark('Raseriet ebber ut.', r);
      else {
        this.endBarsark('Raseriet tar slutt, og du besvimer.', r);
        this.forced = { type: 'faint', t: 0, max: Math.max(2, Math.abs(r.diff || 2)) };
        this.knockdown(this.forced.max);
      }
    }
  }
  endBarsark(txt, r) {
    this.fx.barsark = 0;
    if (r) G.ui.logRoll(r, txt); else G.ui.log(txt);
  }

  // --- F: yrkesförmåga (Bok I s. 12-22) ----------------------------------------------

  updateAbility(dt, input, ok) {
    const id = this.sheet.ability;
    const ab = ABILITIES[id];
    const pressed = input.wasPressed('KeyF') || input.wasPressed('TKin');
    const held = input.down('KeyF') || input.down('TKin');
    if (!ab || !ok) return;
    if (ab.passive) {
      if (pressed) { G.fx.float(ab.name, this.pos, 'sneak'); G.ui.log(`${ab.name}: ${ab.text}`); }
      return;
    }
    if (id === 'handpalaggning' || id === 'meditation') {
      if (pressed && !this.chan && this.canFight()) {
        if (id === 'handpalaggning' && this.kp >= this.maxKP && !this.bleeding.size) { G.fx.float('Ingen skader', this.pos, 'miss'); return; }
        this.chan = { kind: id === 'meditation' ? 'med' : 'hands', t: 0, tick: 0, key: true };
        G.ui.log(id === 'meditation' ? 'Du står stille og mediterer.' : 'Du legger hendene på såret.');
      }
      if (this.chan && (this.chan.kind === 'hands' || this.chan.kind === 'med') && !held) {
        const c = this.chan;
        this.chan = null;
        if (c.kind === 'med' && this.fx.medBonus) G.ui.log(`Meditation: +${this.fx.medBonus} på neste slag (innen ett minutt).`);
      }
      return;
    }
    if (!pressed || this.cd.abil > 0) return;
    this.cd.abil = 0.5;
    if (id === 'riddarslag') {
      if (this.fx.riddarslag) { G.fx.float('Allerede klar', this.pos, 'miss'); return; }
      if (!this.spendPSY(5)) return;
      this.fx.riddarslag = true;
      G.fx.float('RIDDARSLAG', this.pos, 'rage big', 2.4);
      G.ui.log('Riddarslag (5 PSY): neste treff gjør maksimal skade med maksimal skadebonus.');
    } else if (id === 'tjuvtur') {
      if (this.floor.tjuvtur >= 2) { G.fx.float('Brukt to ganger', this.pos, 'miss'); G.ui.log('Tjuvens tur kommer tilbake etter søvn.'); return; }
      const n = Math.min(3, this.psy - 1);
      if (n < 1) { G.fx.float('For lite PSY', this.pos, 'miss'); return; }
      this.psy -= n;
      this.floor.tjuvtur++;
      this.fx.tjuvBonus = n;
      G.fx.float(`TJUVENS TUR +${n}`, this.pos, 'sneak', 2.2);
      G.ui.log(`Tjuvens tur (${n} PSY): +${n} på neste slag.`);
    } else if (id === 'bardsang') {
      const sk = (this.skills['Spela instrument'] || 0) >= (this.skills.Sjunga || 0) && [...this.kit].some(g => GEAR[g]?.fx === 'instrument') ? 'Spela instrument' : 'Sjunga';
      const r = this.roll(sk, { label: 'Bardens sång' });
      this.playTune();
      if (r.success) {
        let n = 0;
        // i kloakken: dyrene roer seg (spillets tolkning)
        for (const e of G.enemies) if (!e.dead && e.def.beast && e.pos.distanceTo(this.pos) < 10) { e.calm = 20; e.alerted = false; e.setState?.('idle'); n++; }
        this.fx.bard = 60;
        G.ui.logRoll(r, n ? `Musikken roer ned dyrene rundt deg (${n}).` : 'Alle som hører deg blir mer mottagelige.');
      } else G.ui.logRoll(r, 'Det låter ikke helt riktig.');
    }
  }

  // Kanaliserte handlinger: Handpåläggning, Meditation, Första hjälpen
  updateChan(dt, move) {
    const c = this.chan;
    if (!c) return;
    c.t += dt;
    c.tick += dt;
    if (c.kind === 'hands') {
      if (Math.random() < dt * 8) G.fx.burst('heal', this.pos, 1);
      if (c.tick >= SR) {
        c.tick = 0;
        if (this.kp >= this.maxKP && !this.bleeding.size) { this.chan = null; G.ui.log('Handpåläggning: alt er grodd.'); return; }
        if (!this.spendPSY(1)) { this.chan = null; return; }
        this.heal(1, true);
        this.body.bleeding.clear();
        G.fx.float('+1', this.pos, 'heal');
      }
    } else if (c.kind === 'med') {
      if (move.lengthSq() > 0.01) { this.chan = null; G.fx.float('Avbrutt', this.pos, 'miss'); return; }
      if (Math.random() < dt * 4) G.fx.burst('will', this.pos, 1);
      if (c.tick >= SR) {
        c.tick = 0;
        this.fx.medBonus = Math.min(10, (this.fx.medBonus || 0) + 1);
        this.fx.medExpire = 60;
        G.fx.float(`+${this.fx.medBonus}`, this.pos, 'sneak');
      }
    } else if (c.kind === 'aid') {
      if (c.t >= c.dur) {
        this.chan = null;
        const kitBonus = this.kit.has('forband') ? 2 : 0;
        const r = this.roll('Första hjälpen', { mod: (this.critVital ? -10 : 0) + kitBonus, label: 'Första hjälpen' });
        if (r.success) {
          this.body.bleeding.clear();
          this.critVital = false;
          G.ui.logRoll(r, 'Forbindingen sitter. Blødningen stopper.');
          G.fx.burst('heal', this.pos, 10);
        } else G.ui.logRoll(r, 'Forbindingen glipper. Prøv igjen.');
      }
    }
  }

  // H: Första hjälpen på deg selv (Bok I s. 40). Stopper blødning, helbreder ingen KP.
  startAid() {
    if (this.chan || this.cd.aid > 0 || this.ko) return;
    this.cd.aid = 0.5;
    if (!this.bleeding.size) { G.fx.float('Du blør ikke', this.pos, 'miss'); return; }
    if (!ARMS.every(l => usable(this.body, l))) { G.fx.float('Trenger to hele armer', this.pos, 'miss'); G.ui.log('Första hjälpen krever to hele armer.'); return; }
    if (this.inCombat()) G.ui.log('Du legger forbinding midt i kampen. Hold deg unna i et øyeblikk.');
    this.chan = { kind: 'aid', t: 0, tick: 0, dur: SR };
    this.breakStealth();
  }

  playTune() {
    const m = G.audio.music;
    const c = G.audio.ctx;
    if (!m || !c) return;
    const notes = [62, 65, 69, 74, 72, 69, 65, 67];
    notes.forEach((n, i) => { try { m.pluck(n, c.currentTime + 0.02 + i * 0.12, 0.7, G.audio.master, (i % 2) * 0.4 - 0.2, 0.5); } catch (e) { /* lyd er valgfri */ } });
  }

  // --- Smyga (Bok I s. 43) ----------------------------------------------------------

  trySneak() {
    if (this.cd.sneak > 0) return;
    if (this.stealth) { this.breakStealth(); return; }
    if (this.fx.barsark) { G.fx.float('For rasende', this.pos, 'miss'); return; }
    this.cd.sneak = 1.2;
    this.sneakRoll(false);
  }

  sneakRoll(again) {
    const r = this.roll('Smyga', { label: 'Smyga' });
    if (r.fummel) {
      G.ui.logRoll(r, `<b class="c-demon">Fummel!</b> ${this.isDuck ? 'Et kvakk slipper ut. Høyt.' : 'Noe velter med et brak.'} Alle hørte det.`);
      G.fx.float(this.isDuck ? 'KVAKK!' : 'BRAK!', this.pos, 'demon big');
      this.voice('angry');
      G.world.alertAround(this.pos, 22);
      this.breakStealth();
      return;
    }
    if (!r.success) {
      G.ui.logRoll(r, again ? 'Du tråkker på noe. Smygingen er over.' : 'Smyga misslyckas. Noe knirker.');
      G.fx.float('Knirk', this.pos, 'miss');
      G.world.alertAround(this.pos, 8);
      this.breakStealth();
      return;
    }
    this.stealth = true;
    this.sneakDiff = Math.max(0, r.diff || 0);
    this.sneakT = 40;
    if (!again) {
      G.ui.logRoll(r, `${this.name} glir inn i skyggene (differens ${this.sneakDiff}). Fiender må klare Upptäcka fara minus det for å se deg.`);
      G.fx.float('I skyggene', this.pos, 'sneak');
      G.fx.burst('smoke', this.pos, 10);
      this.setStealthLook(true);
    }
  }

  breakStealth() {
    if (this.stealth || this._stealthLook) {
      this.stealth = false;
      this.setStealthLook(!!(this.buffs.osynlighet || this.buffs.kamouflage));
    }
  }

  setStealthLook(on) {
    this._stealthLook = on;
    if (this.outline) this.outline.visible = !on;
    for (const m of this.mats) {
      m.transparent = on;
      m.opacity = on ? 0.42 : 1;
      m.depthWrite = !on;
      m.needsUpdate = true;
    }
  }

  // --- drikker og läkning --------------------------------------------------------------

  refillBelt() {
    const e = this.bag?.find(x => x.cid === 'legedrikk');
    if (!e || this.potions >= 4) return false;
    removeFromBag(this, e, 1);
    this.potions++;
    return true;
  }

  drinkPotion() {
    if (this.ko) return;
    if (this.potions <= 0 && !this.refillBelt()) { G.fx.float('Ingen drikker', this.pos, 'miss'); return; }
    if (this.cd.potion > 0) return;
    if (this.kp >= this.maxKP && !this.bleeding.size && LOCS.every(l => this.loc[l] >= this.locMax[l])) { G.fx.float('Full KP', this.pos, 'miss'); return; }
    this.potions--;
    this.cd.potion = 1;
    if (this.refillBelt()) G.ui.log('Du henger en ny legedrikk fra sekken i beltet.');
    const amount = rollDice('2D6') + (this.flags.has('lunch') ? 3 : 0);
    const got = this.heal(amount);
    G.ui.log(`Legedrikk: +${got} KP. Smaker av jern og mynte.`);
  }

  heal(n, quiet = false) {
    const before = this.kp;
    const sumLoc = () => LOCS.reduce((s, l) => s + Math.min(this.locMax[l], this.loc[l]), 0);
    const lb = sumLoc();
    healBody(this.body, n);
    const got = Math.max(this.kp - before, Math.min(n, sumLoc() - lb));
    if (this.helpless && this.kp > 0 && this.loc.huvud > 0) { this.helpless = false; G.ui.log(`${this.name} kommer seg på beina igjen.`); }
    if (got > 0 && !quiet) {
      G.fx.float('+' + got, this.pos, 'heal');
      G.fx.burst('heal', this.pos, 14);
      G.audio.heal();
    } else if (got > 0) G.fx.burst('heal', this.pos, 4);
    this.checkVitals();
    return got;
  }

  healAll() {
    healFull(this.body);
    this.psy = this.maxPSY;
    this.helpless = false;
    this.critVital = false;
  }

  stopBleeding() {
    this.body.bleeding.clear();
    this.critVital = false;
  }

  // En uke på vertshuset: läkning, PSY og EP til FV (Bok I s. 63, Bok II s. 20)
  restWeek() {
    const out = [];
    let mult = 1;
    if (this.sheet.special?.fx?.healMul) mult *= this.sheet.special.fx.healMul;
    if (this.has('snabblakning')) mult *= 2;
    if ((this.skills['Läkekonst'] || 0) > 0) {
      const r = this.roll('Läkekonst', { label: 'Läkekonst', noExp: true, always: true });
      if (r.success) { mult *= 2; out.push('Läkekonst lykkes: sårene gror dobbelt så fort.'); }
    }
    // naturlig läkning: 1 KP per uke i hver skadd kroppsdel og i totala KP (Bok II s. 20)
    const kb = this.kp;
    for (const l of LOCS) if (this.loc[l] < this.locMax[l] && !this.body.lame.has(l)) this.body.loc[l] = Math.min(this.locMax[l], this.loc[l] + mult);
    this.body.kp = Math.min(this.maxKP, this.kp + mult);
    if (LOCS.every(l => this.loc[l] >= this.locMax[l] || this.body.lame.has(l))) this.body.kp = this.maxKP;
    this.body.bleeding.clear();
    this.critVital = false;
    if (this.kp > kb) out.push(`+${this.kp - kb} KP.`);
    this.psy = this.maxPSY;
    out.push('All PSY er tilbake.');
    this.onSleep();
    // erfarenhet blir til FV
    const ups = [];
    const sheetLike = { yrke: this.sheet.yrke || [], specialFx: this.sheet.special?.fx || {}, kin: this.sheet.kin };
    for (const id of Object.keys(this.exp)) {
      let ep = this.exp[id];
      if (ep <= 0) continue;
      const isSpell = !!SPELLS[id];
      const sk = SKILL[id];
      if (!isSpell && !sk) continue;
      let fv = isSpell ? (this.spells[id] || 0) : (this.baseSkills[id] || 0);
      const from = fv;
      const bc = isSpell ? spellBaseCost(SPELLS[id].sv) : baseCost(id, sheetLike);
      // sekundære ferdigheter utenfor yrket og kategori B kan ikke gå over grundegenskapen (Bok I s. 63)
      const capped = sk && (sk.kat === 'B' || (sk.type === 'sek' && !sheetLike.yrke.includes(id)));
      const cap = capped ? this.sheet.attrs[sk.attr] : 99;
      while (fv < cap) {
        const c = fvCost(fv, fv + 1, bc);
        if (c > ep) break;
        ep -= c;
        fv++;
      }
      this.exp[id] = ep;
      if (fv > from) {
        if (isSpell) this.spells[id] = fv; else this.baseSkills[id] = fv;
        ups.push(`${SPELLS[id]?.name || id} ${from} til ${fv}`);
        if (from < 21 && fv >= 21) this.addHjp(d(4), `${id} har nådd FV 21`);
      }
    }
    if (ups.length) out.push(`Erfarenhet blir til ferdighet: ${ups.join(', ')}.`);
    else out.push('Ingen ferdigheter hadde nok EP til et nytt trinn ennå.');
    this.recalc();
    return out.join(' ');
  }

  learnSpell(id, S) {
    if (!SPELLS[id]) return;
    this.spells[id] = Math.max(this.spells[id] || 0, S);
    if (!this.spellOrder.includes(id)) this.spellOrder.push(id);
    G.ui.buildBar?.();
  }

  // --- etterbilde-angrep og virvel ----------------------------------------------------

  dashHits(a) {
    for (const e of G.enemies) {
      if (e.dead || a.hits.has(e)) continue;
      if (Math.hypot(e.pos.x - this.pos.x, e.pos.z - this.pos.z) < e.radius + 0.9) {
        a.hits.add(e);
        this.attackRoll({ w: UNARMED(), skill: 'Slagsmål', fv: this.skills['Slagsmål'] || 0, dice: 'D6', knock: 4, types: ['b'], label: 'Svømmeføttenes vei', unarmed: true, melee: true }, e);
      }
    }
  }

  spinHit() {
    const col = this.fx.barsark ? 0xff7040 : 0xc8f0ff;
    G.fx.slash(this.pos, this.yaw, 3.0, Math.PI * 1.98, 1, col, 0.8, 0.2);
    G.fx.ring(this.pos, 3.1, col, 0.3, 0.3);
    if (this.isDuck) G.fx.burst('feather', this.pos, 3);
    G.audio.swing(1.1, 0.4);
    this.hitProps(3.0, 7);
    const spec = { ...this.attackSpec(this.weapon()), knock: 8, melee: true };
    for (const e of G.enemies) if (!e.dead && Math.hypot(e.pos.x - this.pos.x, e.pos.z - this.pos.z) < 2.9 + e.radius) this.attackRoll(spec, e);
  }

  // --- magi (Bok III s. 3-31) -------------------------------------------------------

  castSpell(id, E, cdk) {
    const sp = SPELLS[id];
    const S = this.spells[id] || 0;
    if (this.curse.mute) { G.fx.float('Stum', this.pos, 'miss'); G.ui.log('Du kan ikke trylle resten av løpet.'); return; }
    if (this.metalWorn) { G.fx.float('Metall stopper magien', this.pos, 'miss'); G.ui.log('Inget järn mot huden: du kan ikke trylle i metallrustning (Bok III s. 5).'); return; }
    if (!ARMS.every(l => usable(this.body, l))) { G.fx.float('Trenger to hele armer', this.pos, 'miss'); return; }
    E = Math.max(1, Math.min(E, this.maxE(id)));
    if (this.psy - E < 1) { G.fx.float('For lite PSY', this.pos, 'miss'); G.ui.log('PSY 0 er døden. Du har ikke nok PSY til den effektgraden.'); return; }
    const targeted = ['debuff', 'root', 'chill', 'bolt', 'beam'].includes(sp.kind);
    const range = S * 2 * 1.5 + 4;
    const target = targeted ? this.aimedEnemy(range) : null;
    if (targeted && !target) { G.fx.float('Ingen mål', this.pos, 'miss'); return; }
    this.cd[cdk] = 0.5;
    this.yaw = Math.atan2(this.aimDir.x, this.aimDir.z);
    // en besvärjelse tar 1 SR, kvicke (K) virker med en gang (Bok III s. 4)
    const castTime = sp.quick ? 0.3 : SR * 0.8;
    const aim = G.aim ? G.aim.clone() : this.pos.clone().addScaledVector(this.aimDir, 4);
    this.action = { type: 'cast', spell: id, t: 0, dur: castTime + 0.15, at: castTime, done: false, fn: () => {
      const r = this.roll(id, { base: S, fv: Math.max(1, S), mod: -2 * (E - 1), label: `${sp.name} E${E}` });
      let cost = E;
      if (r.fummel) cost = E;
      else if (r.perfekt) cost = Math.max(1, Math.floor(E / 2));
      else if (!r.success) cost = 1;
      this.psy = Math.max(1, this.psy - cost);
      if (r.fummel) { G.ui.logRoll(r, `<b class="c-demon">Snedtändning!</b> (${cost} PSY)`); this.snedtandning(id, E, target, aim); return; }
      if (!r.success) { G.ui.logRoll(r, `${sp.name} misslyckas (1 PSY).`); G.fx.float('Fusk', this.pos, 'miss'); return; }
      if (r.perfekt) { G.fx.float('PERFEKT!', this.pos, 'drake big', 2.4); G.audio.drake(); }
      G.ui.logRoll(r, `${sp.name}, effektgrad ${E} (${cost} PSY).`);
      this.spellEffect(id, E, target, aim);
    } };
    G.fx.ring(this.pos, 2, 0xb08aff, 0.3, 0.2);
    G.audio.swing(0.4, 0.2);
  }

  // Fysisk manifestation (F) virker alltid. Andre må vinne PSY mot PSY (Bok III s. 5).
  spellResisted(sp, t) {
    if (sp.f || !t) return false;
    const rs = resist(this.psy, t.attrs?.PSY ?? 10);
    if (!rs.success) { G.ui.log(`${t.def.name} står imot (PSY mot PSY).`); G.fx.float('Står imot', t.pos, 'miss'); return true; }
    return false;
  }

  spellEffect(id, E, target, aim) {
    const sp = SPELLS[id];
    const S = this.spells[id] || 1;
    const P = this.pos;
    const buff = (o = {}) => {
      this.buffs[id] = { t: spellDur(sp, S), e: E, ...o };
      G.fx.ring(P, 2.2, 0xb08aff, 0.5, 0.5);
      G.ui.log(`${sp.name} virker i ${Math.round(this.buffs[id].t)} sekunder.`);
      this.recalc();
    };
    const dirTo = t => tmp.set(t.pos.x - P.x, 0, t.pos.z - P.z).normalize();
    const inRange = (pt, r) => G.enemies.filter(e => !e.dead && Math.hypot(e.pos.x - pt.x, e.pos.z - pt.z) < r + e.radius);
    const clampAim = maxR => {
      const v = new THREE.Vector3(aim.x - P.x, 0, aim.z - P.z);
      if (v.length() > maxR) v.setLength(maxR);
      return new THREE.Vector3(P.x + v.x, 0, P.z + v.z);
    };
    switch (sp.kind) {
      case 'detect':
        if (!G.world.showTreasureTrail()) G.ui.log('VARSEBLIVNING: ingenting skjult i nærheten.');
        else G.ui.log('VARSEBLIVNING: et lysende spor viser veien til det som er skjult.');
        break;
      case 'dispel':
        this.fx.fearCL = null;
        if (this.forced) this.forced = null;
        G.ui.log('SKINGRA: det som lå over deg, løsner.');
        break;
      case 'buff':
        if (id === 'oka') buff({ attr: 'STY' }); else buff();
        break;
      case 'armor': case 'armor2': case 'nightvision': case 'fearless': case 'whirl': case 'flamehand': case 'weaponbuff': case 'hide':
        buff();
        if (sp.kind === 'flamehand') this.buffs[id].t = Math.min(60, d(3) * 20);
        if (sp.kind === 'hide') this.setStealthLook(true);
        break;
      case 'invis':
        buff();
        this.setStealthLook(true);
        for (const e of G.enemies) if (!e.dead && e.alerted && !e.def.boss) { e.alerted = false; e.setState?.('search'); }
        break;
      case 'astral':
        buff();
        this.astral = null;
        this.refreshWeaponMeshes();
        break;
      case 'light':
        if (id === 'traeld') { this.fx.light = true; G.ui.log('TRÄELD: fakkelen brenner klarere resten av nivået.'); }
        else buff();
        break;
      case 'airshield':
        this.buffs.skold = { t: 30, bv: 4 + 2 * E, e: E };
        G.fx.ring(P, 1.6, 0x9ad8ff, 0.4, 0.4);
        G.ui.log(`SKÖLD: lufta parerer neste fysiske anfall (BV ${4 + 2 * E}).`);
        break;
      case 'heal': {
        const n = rollDice(`${E}D6`);
        const got = this.heal(n);
        if (E >= 1) this.body.bleeding.clear();
        if (E >= 3) this.critVital = false;
        G.ui.log(`HELA: +${got} KP.`);
        break;
      }
      case 'cure':
        G.ui.log('NEUTRALISERA GIFT: kroppen er ren.');
        break;
      case 'sense':
        buff();
        break;
      case 'summon': {
        // rottene i kloakken hjelper deg en stund (spillets tolkning)
        const es = inRange(P, 9);
        for (const e of es) { e.distract?.(3 + E); G.fx.burst('dust', e.pos, 8); }
        G.ui.log(es.length ? `Rotter strømmer fram og river i bena på fiendene (${es.length}).` : 'Rotter titter fram, ser seg om og forsvinner.');
        break;
      }
      case 'debuff':
        if (this.spellResisted(sp, target)) break;
        target.weaken?.(E, spellDur(sp, S));
        G.ui.log(`MINSKA: ${target.def.name} blir svakere (-${E}).`);
        break;
      case 'root':
        if (this.spellResisted(sp, target)) break;
        target.entangle?.(SR * 2 * E, E);
        break;
      case 'chill': {
        const rs = resist(target.attrs?.FYS ?? 10, 15);
        if (!rs.success) { target.stagger?.(SR); G.ui.log(`KALLA HANDEN: ${target.def.name} stivner.`); }
        else { target.weaken?.(4, SR); G.ui.log(`KALLA HANDEN: ${target.def.name} skjelver (-4).`); }
        G.fx.burst('splash', target.pos, 12);
        break;
      }
      case 'arrow':
        G.world.spawnPlayerProjectile('arrow', P, this.aimDir.clone(), { speed: 34, life: 1.2, spell: { dmg: rollDice('D10') + E, type: 'p', loc: true, homing: true } });
        break;
      case 'bolt': {
        // BLIXT: rustning hjelper ikke, bare totala KP
        const n = rollDice(`${E}D6`);
        G.world.lightning(P, target.pos);
        target.takeHit(n, dirTo(target), 2, { total: true, ignoreArmor: true, type: 'lightning', magic: true, src: 'player' });
        G.audio.hit(true);
        break;
      }
      case 'fireball': case 'frost': {
        const pt = clampAim(S * 2 * 1.5);
        const fire = sp.kind === 'fireball';
        G.fx.ring(pt, 1.6, fire ? 0xff8a30 : 0x9ad8ff, 0.35, 0.4);
        G.fx.burst(fire ? 'fire' : 'splash', { x: pt.x, y: 0.6, z: pt.z }, 28);
        for (const e of inRange(pt, 1.5)) e.takeHit(rollDice(`${E}D6`), dirTo(e), 3, { total: true, armorLoc: 'brost', type: fire ? 'fire' : 'cold', magic: true, src: 'player' });
        G.audio.hit(true);
        break;
      }
      case 'beam': {
        G.world.lightning(P, target.pos, 0xfff0a0);
        target.takeHit(rollDice(`${E}D3`), dirTo(target), 2, { loc: target.def.detailed ? hitLocation(true) : null, type: 'p', magic: true, src: 'player', ranged: true });
        break;
      }
      case 'shatter': {
        const pt = target?.pos || clampAim(S * 2 * 1.5);
        if (!G.world.shatterNear(pt, 2.5)) G.fx.float('Ingenting å knuse', P, 'miss');
        for (const e of inRange(pt, 2)) e.breakShield?.();
        break;
      }
      case 'unlock': {
        const ch = G.interactables.filter(it => it.kind === 'chest' && !it.opened && it.locked).sort((a, b) => a.pos.distanceTo(P) - b.pos.distanceTo(P))[0];
        if (ch && ch.pos.distanceTo(P) < S * 1.5 + 3) G.world.openChest(ch, 'ÖPPNA: låsen glir opp av seg selv.');
        else G.ui.log('ÖPPNA: ingen lås i nærheten.');
        break;
      }
      case 'explosion': {
        // 5 per E til alle innen E meter, 1 mindre per rute lenger ut. Du kan treffe deg selv.
        const pt = clampAim(S * 2 * 1.5);
        const R = E + 3;
        G.fx.ring(pt, R, 0xffb050, 0.5, 0.6);
        G.fx.burst('fire', { x: pt.x, y: 0.7, z: pt.z }, 50);
        G.fx.addShake(0.6);
        G.post?.flash(0xffd090, 0.35);
        for (const e of inRange(pt, R)) {
          const dd = Math.hypot(e.pos.x - pt.x, e.pos.z - pt.z);
          const n = 5 * E - Math.max(0, Math.floor((dd - E) / 1.5));
          if (n > 0) e.takeHit(n, dirTo(e), 8, { total: true, type: 'fire', magic: true, src: 'player', stun: 1 });
        }
        const pd = Math.hypot(P.x - pt.x, P.z - pt.z);
        if (pd < R) {
          const n = 5 * E - Math.max(0, Math.floor((pd - E) / 1.5));
          if (n > 0) this.applyHit({ value: n, total: true, who: 'EXPLOSION', verb: 'treffer', type: 'fire' });
        }
        break;
      }
      case 'leap': {
        const dir = this.aimDir.clone();
        this.action = { type: 'dash', t: 0, dur: 0.35, dir, hits: new Set(), speed: Math.min(28, 4 * E / 0.35) };
        G.fx.burst('dust', P, 12);
        break;
      }
      case 'shock': {
        for (const e of inRange(P, 2.2)) e.takeHit(rollDice(`${E}D4`), dirTo(e), 3, { total: true, ignoreArmor: true, type: 'lightning', magic: true, src: 'player' });
        G.fx.ring(P, 2.2, 0xbfd8ff, 0.3, 0.3);
        break;
      }
      case 'dark': {
        const pt = clampAim(S * 2 * 1.5);
        G.fx.burst('smoke', { x: pt.x, y: 0.8, z: pt.z }, 40);
        for (const e of inRange(pt, 4)) e.blind?.(S * 1.5);
        G.ui.log('MÖRKER: fiendene i kula ser ingenting (-15).');
        break;
      }
      default:
        G.ui.log(`${sp.name}: ingenting skjer her.`);
    }
  }

  // Snedtändningstabellen, 1T20 + E (Bok III s. 8)
  snedtandning(id, E, target, aim) {
    const n = d(20) + E;
    const s = fromRange(SNEDTANDNING, n);
    G.fx.float('SNEDTÄNDNING', this.pos, 'demon big');
    G.audio.demon();
    G.post?.flash(0x8020ff, 0.25);
    G.ui.log(`<b class="c-demon">Snedtändning (${n}):</b> ${s.name}. ${s.text}`);
    const sp = SPELLS[id];
    if (n <= 5) { if (E >= 2) this.spellEffect(id, Math.floor(E / 2), target, aim); }
    else if (n <= 11) { this.applyHit({ value: E, total: true, ignoreArmor: true, who: 'Magien', verb: 'slår tilbake mot' }); if (!this.ko && !this.dead) { this.forced = { type: 'faint', t: 0, max: E * SR }; this.knockdown(E * SR); } }
    else if (n <= 15) {
      if (['bolt', 'fireball', 'frost', 'beam', 'explosion', 'shock'].includes(sp.kind)) this.applyHit({ value: rollDice(`${E}D6`), total: true, who: sp.name, verb: 'slår tilbake mot', type: 'fire' });
      else { this.applyHit({ value: E, total: true, ignoreArmor: true, who: 'Magien', verb: 'brenner i' }); this.blind = 10; }
    } else if (n <= 18) this.curse.mute = true;
    else if (n === 19) {
      const k = d(4);
      this.metaMods['attr:INT'] = (this.metaMods['attr:INT'] || 0) - k;
      const ids = Object.keys(this.spells).sort(() => Math.random() - 0.5).slice(0, k);
      for (const s2 of ids) { delete this.spells[s2]; this.spellOrder = this.spellOrder.filter(x => x !== s2); }
      this.recalc();
    } else { this.curse.mute = true; this.curse.amnesia = true; this.phobias.push({ type: 'magi', name: FOBIER[d(FOBIER.length) - 1] }); }
    G.ui.buildBar?.();
  }

  // --- animasjon ----------------------------------------------------------

  animate(dt, speed) {
    const t = G.time;
    const a = this.action;
    const sp = Math.min(1, speed / 6);
    this.walkPhase += dt * (4 + speed * 1.6);
    let roll = Math.sin(this.walkPhase) * (this.rig ? 0.04 : 0.15) * sp;
    let pitch = (this.rig ? 0.05 : 0.1) * sp;
    let twist = Math.sin(this.walkPhase) * 0.06 * sp;
    let bobY = Math.abs(Math.sin(this.walkPhase)) * (this.rig ? 0.05 : 0.09) * sp + Math.sin(t * 2.2) * 0.008;
    let sx = 1, sy = 1 + Math.sin(t * 2.2) * 0.008, sz = 1;
    let p = 0, ease = 0;
    if (a) {
      p = Math.min(1, a.t / a.dur);
      ease = 1 - Math.pow(1 - p, 3);
      if (a.type === 'attack') {
        if (!this.rig) {
          if (a.step === 0) twist = 0.95 - 1.8 * ease;
          else if (a.step === 1) twist = -0.95 + 1.8 * ease;
          else {
            pitch = p < 0.4 ? -0.35 * (p / 0.4) : -0.35 + 0.6 * ((p - 0.4) / 0.6);
            twist = Math.sin(p * Math.PI) * 0.5;
            sy = 1 + Math.sin(p * Math.PI) * 0.06;
          }
        } else twist = 0;
        roll *= 0.3;
      } else if (a.type === 'dash') {
        pitch = this.rig ? 0.35 : 0.5;
        sy = this.rig ? 0.9 : 0.86;
        sz = this.rig ? 1.08 : 1.22;
        roll = 0;
      } else if (a.type === 'spin') {
        twist = ease * Math.PI * 4;
        sy = 0.92;
      } else if (a.type === 'throw') {
        twist = 0.7 - 1.2 * ease;
      } else if (a.type === 'stumble') {
        roll = Math.sin(p * Math.PI) * 0.6;
        pitch = Math.sin(p * Math.PI) * 0.5;
      } else if (a.type === 'knockdown') {
        roll = 1.1;
        bobY = -0.1;
      }
    }
    if (this.chan) { bobY = -0.15; pitch = 0.1; }
    const down = this.ko || this.helpless || fallen(this.body);
    if (!down && kneeling(this.body)) { bobY -= 0.22; pitch += 0.12; }
    if (down) {
      roll = THREE.MathUtils.lerp(this.tilt.rotation.z, this.ko ? 1.35 : 0.9, Math.min(1, dt * 6));
      pitch = 0;
      twist = 0;
      bobY = -0.1;
    }
    const k = Math.min(1, dt * 22);
    this.tilt.rotation.x += (pitch - this.tilt.rotation.x) * k;
    this.tilt.rotation.y = a && (a.type === 'spin' || (a.type === 'attack' && !this.rig) || a.type === 'throw') ? twist : this.tilt.rotation.y + (twist - this.tilt.rotation.y) * k;
    this.tilt.rotation.z = down ? roll : this.tilt.rotation.z + (roll - this.tilt.rotation.z) * k;
    this.bob.position.y = bobY;
    this.bob.scale.x += (sx - this.bob.scale.x) * k;
    this.bob.scale.y += (sy - this.bob.scale.y) * k;
    this.bob.scale.z += (sz - this.bob.scale.z) * k;
    if (this.rig) this.animateRig(dt, sp, a, p, ease);
    else this.animateDuckHands(a, p, ease);
    const yT = this.inWater ? -0.42 : 0;
    this.yOff += (yT - this.yOff) * Math.min(1, dt * 10);
    this.root.position.y = this.yOff;
    if (this.inWater && speed > 1 && Math.random() < dt * 8) G.fx.burst('splash', this.pos, 1);
    const ph = Math.sin(this.walkPhase);
    if (speed > 2.5 && !this.inWater && Math.sign(ph) !== Math.sign(this.lastPh) && G.fx) G.fx.burst('step', this.pos, 2);
    this.lastPh = ph;
    // kantlys: varmt normalt, rødt ved raseri, fiolett ved sniking, blått ved vakt, gull når en hjältepoäng er klar
    const rim = this.fxU.uRim.value;
    if (this.fx.barsark) rim.setRGB(1.2, 0.18, 0.05);
    else if (this.heroArmed) rim.setRGB(1.0, 0.8, 0.3);
    else if (this.stealth || this.buffs.osynlighet) rim.setRGB(0.25, 0.15, 0.45);
    else if (this.guard > 0) rim.setRGB(0.3, 0.5, 0.9);
    else if (this.charge) rim.setRGB(0.5, 0.3, 1.0);
    else if (this.bleeding.size) rim.setRGB(0.6, 0.08, 0.06);
    else rim.setRGB(0.32, 0.24, 0.16);
    this.fxU.uFlash.value = this.flash > 0 ? 1.4 : 0;
  }

  animateDuckHands(a, p) {
    // anda har ingen armer: våpenet følger kroppen, og hever seg ved vakt
    const R = this.handR, L = this.handL;
    if (!R) return;
    let rx = 0, rz = 0;
    if (this.guard > 0) { rx = -0.9; rz = 0.5; }
    if (a?.type === 'attack') rx = -1.2 * Math.sin(p * Math.PI);
    if (a?.type === 'shot') rx = -1.2;
    R.rotation.x += (rx - R.rotation.x) * 0.3;
    R.rotation.z += (rz - R.rotation.z) * 0.3;
    if (L) L.rotation.x += ((this.guard > 0 ? -1.0 : a?.type === 'shot' ? -1.4 : 0) - L.rotation.x) * 0.3;
  }

  animateRig(dt, sp, a, p, ease) {
    const r = this.rig;
    const ph = this.walkPhase;
    const k = Math.min(1, dt * 18);
    const L = (o, key, v) => { o.rotation[key] += (v - o.rotation[key]) * k; };
    let legL = Math.sin(ph) * 0.65 * sp, legR = -Math.sin(ph) * 0.65 * sp;
    let kneeL = Math.max(0, -Math.sin(ph + 0.6)) * 0.9 * sp, kneeR = Math.max(0, Math.sin(ph + 0.6)) * 0.9 * sp;
    let shR = -legL * 0.6, shL = -legR * 0.6, elR = -0.25, elL = -0.25, shRz = -0.08, shLz = 0.08;
    let torY = 0, torX = 0.03 * sp, hipY = 0;
    const w = this.weapon();
    const kind = w?.kind;
    // hvilestilling per våpen
    if (kind === 'bow') { shL = -0.3; elL = -0.6; }
    else if (kind === 'xbow') { shR = -0.6; elR = -0.9; shL = -0.7; elL = -0.8; }
    else if (kind === 'spear' || kind === 'staff' || kind === 'great') { shR = -0.35; elR = -0.7; shL = -0.45; elL = -0.9; }
    else if (kind && kind !== 'fist') { shR = shR - 0.1; elR = -0.45; }
    if (this.equip.vapen2?.shield) { shL = -0.5; elL = -1.1; }
    // ubrukelig arm henger
    if (!usable(this.body, 'harm')) { shR = 0.1; elR = 0; }
    if (!usable(this.body, 'varm')) { shL = 0.1; elL = 0; }
    if (this.guard > 0) {
      if (this.equip.vapen2?.shield) { shL = -1.35; elL = -0.5; shLz = -0.3; }
      else { shR = -1.4; elR = -0.6; shRz = 0.7; }
      torY = 0.15;
    }
    if (this.charge || a?.type === 'cast') { shR = -1.3; shL = -1.3; elR = -0.3; elL = -0.3; }
    if (a?.type === 'attack') {
      const s = a.step;
      const wind = p < 0.42 ? p / 0.42 : 1;
      const rel = p < 0.42 ? 0 : (p - 0.42) / 0.58;
      if (a.kick) {
        legR = -1.6 * Math.sin(Math.min(1, p * 1.4) * Math.PI);
        kneeR = 0.2;
        torX = -0.15;
        shR = -0.4; shL = -0.4;
      } else if (a.kind === 'fist' || a.kind === 'knife' || a.offStrike) {
        const arm = s === 1 || a.offStrike ? 'L' : 'R';
        const v = p < 0.4 ? -0.4 - 0.4 * wind : -1.6 + 0.8 * rel;
        if (arm === 'R') { shR = v; elR = p < 0.4 ? -1.4 : -0.1; } else { shL = v; elL = p < 0.4 ? -1.4 : -0.1; }
        torY = (arm === 'R' ? 1 : -1) * (p < 0.4 ? 0.35 : -0.25);
      } else if (a.kind === 'spear') {
        shR = -0.7 - 0.6 * (p < 0.4 ? 0 : 1 - rel * 0.5); elR = p < 0.4 ? -1.2 : -0.1;
        shL = shR + 0.2; elL = elR - 0.3;
        torY = p < 0.4 ? 0.3 : -0.2;
      } else if (a.kind === 'great' || (a.heavy && (a.kind === 'axe' || a.kind === 'hammer'))) {
        // slag ovenfra
        shR = p < 0.42 ? -2.7 * wind : -2.7 + 2.0 * rel; elR = -0.2;
        shL = shR + 0.1; elL = -0.3;
        torX = p < 0.42 ? -0.15 : 0.25 * rel;
      } else {
        // hugg fra siden: armen fram, overkroppen vrir seg
        const dir = s === 1 ? -1 : 1;
        shR = -1.45; elR = -0.2;
        shRz = dir > 0 ? 0.9 * (1 - ease) - 0.4 : -0.4 + 0.9 * ease;
        torY = dir * (p < 0.42 ? 0.9 * wind : 0.9 - 1.9 * rel);
      }
    } else if (a?.type === 'shot') {
      if (kind === 'bow') { shL = -1.55; elL = 0; shR = -1.5; elR = -1.6 * Math.min(1, p * 2); torY = -0.3; }
      else if (kind === 'xbow') { shR = -1.4; elR = -0.2; shL = -1.4; elL = -0.3; }
      else { shR = -2.6 + 5 * p; elR = 0; }
    } else if (a?.type === 'throw') {
      shR = p < 0.4 ? -2.6 : -2.6 + 2.2 * ((p - 0.4) / 0.6); elR = -0.4;
    } else if (a?.type === 'dash') {
      hipY = -0.12; legL = -0.7; legR = 0.4; kneeL = 1.2; kneeR = 1.0; shR = 0.5; shL = 0.5;
    }
    if (this.chan || kneeling(this.body)) { hipY = -0.45; legL = -1.4; legR = -1.4; kneeL = 1.6; kneeR = 1.6; if (this.chan) { shR = -0.4; shL = -0.4; } }
    L(r.legL, 'x', legL); L(r.legR, 'x', legR);
    L(r.kneeL, 'x', kneeL); L(r.kneeR, 'x', kneeR);
    L(r.shR, 'x', shR); L(r.shL, 'x', shL);
    L(r.shR, 'z', shRz); L(r.shL, 'z', shLz);
    L(r.elR, 'x', elR); L(r.elL, 'x', elL);
    r.torso.rotation.y += (torY - r.torso.rotation.y) * Math.min(1, dt * (a?.type === 'attack' ? 30 : 12));
    L(r.torso, 'x', torX);
    r.hips.position.y += (0.86 + hipY + Math.abs(Math.sin(ph)) * 0.03 * sp - r.hips.position.y) * k;
    r.torso.scale.y = 1 + Math.sin(G.time * 2.2) * 0.01;
    if (r.tail) r.tail.rotation.y = Math.sin(G.time * 3) * 0.4;
    r.head.rotation.y = -r.torso.rotation.y * 0.5;
  }
}
