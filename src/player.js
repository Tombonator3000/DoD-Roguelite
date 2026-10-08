import * as THREE from 'three';
import { G } from './state.js';
import { skillRoll, rollDice, d, doubleDice, addDie, tStr, diceAvg } from './rules.js';
import {
  SKILL, COND_BY_ID, COND_BY_ATTR, CONDITIONS, KIN, HEROIC, KIN_ABILITIES, SPELLS, ATTR_NAME,
  dmgBonusDie, moveMod, armorTypeBonus, MISHAP_MELEE, MISHAP_RANGED, MAGIC_MISHAP, FEAR, fromRange, INJURIES, AGES,
  MELEE_STR, GEAR, WEAKNESS,
} from './dod.js';
import { addRimFlash, makeOutline } from './assets.js';
import { weaponItem, armorItem, helmetItem, isRanged, refinalize } from './loot.js';
import { bagCap, makeCons, removeFromBag } from './inventory.js';
import { buildCharacter, buildWeaponMesh, ghostGeometry, HOLD } from './kinmodels.js';

// Kamera står mot +x,+z. "Opp" på skjermen er verdensretning (-1,0,-1).
const FWD = new THREE.Vector3(-1, 0, -1).normalize();
const RIGHT = new THREE.Vector3(1, 0, -1).normalize();
const tmp = new THREE.Vector3();
const tmp2 = new THREE.Vector3();

// Kombo-tider, rekkevidde og bue per våpentype
const MELEE = {
  fist: { t: [0.26, 0.26, 0.4], reach: 1.9, arc: 1.5, knock: 3.5 },
  knife: { t: [0.28, 0.27, 0.4], reach: 1.95, arc: 1.5, knock: 3.5 },
  sword: { t: [0.34, 0.33, 0.48], reach: 2.3, arc: 2.0, knock: 4.5 },
  axe: { t: [0.38, 0.36, 0.52], reach: 2.25, arc: 1.9, knock: 5 },
  hammer: { t: [0.42, 0.4, 0.56], reach: 2.2, arc: 1.7, knock: 6 },
  great: { t: [0.56, 0.52, 0.72], reach: 2.6, arc: 2.3, knock: 8 },
  staff: { t: [0.32, 0.32, 0.46], reach: 2.5, arc: 2.2, knock: 5 },
  spear: { t: [0.36, 0.36, 0.5], reach: 2.7, arc: 0.95, knock: 4 },
};
const RANGED = {
  bow: { draw: 0.48, cd: 0.22, speed: 30, proj: 'arrow' },
  xbow: { draw: 0.25, cd: 1.0, speed: 34, proj: 'bolt' },
  sling: { draw: 0.42, cd: 0.25, speed: 24, proj: 'stone' },
};
const UNARMED = () => weaponItem('obevapnad');

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
    this.equip = { vapen: null, vapen2: null, rustning: null, hjalm: null, amulett: null };
  }

  get name() { return this.sheet?.name || 'Rollpersonen'; }
  get isDuck() { return this.sheet?.kin === 'anka'; }
  get isNebb() { return this.sheet?.id === 'svartnebb'; }

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
      const c = buildCharacter(this.sheet, { armor: this.equip.rustning, helmet: this.equip.hjalm });
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
    const main = this.equip.vapen;
    const off = this.equip.vapen2;
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
    if (off && main?.grip !== 2 && main?.kind !== 'bow') mount(off, this.handL, 1);
    else if (!off && main?.grip !== 2 && main?.kind !== 'bow' && this.kit) {
      const focus = this.kit.has('orbuculum') ? 'orbuculum' : this.kit.has('trollstav') ? 'trollstav' : null;
      if (focus) mount({ kind: 'focus', wid: focus }, this.handL, 1);
    }
  }

  // --- nytt løp ------------------------------------------------------------

  newRun(meta) {
    const S = this.sheet;
    this.baseSkills = { ...S.skills };
    this.metaMods = {};
    const lv = meta?.levels || {};
    if (lv.trening) {
      // Hard trening: +1 på den beste tränade våpenferdigheten
      const best = S.trained.filter(s => SKILL[s]?.type === 'vap').sort((a, b) => S.skills[b] - S.skills[a])[0] || 'Slagsmål';
      this.metaMods['skill:' + best] = lv.trening;
    }
    if (lv.seig) this.metaMods.maxKP = lv.seig * 2;
    if (lv.vilje) this.metaMods.maxVP = lv.vilje * 2;
    if (lv.slip) this.metaMods.dmg = lv.slip;
    const ws = (S.gear.w || []).map(id => weaponItem(id)).filter(Boolean);
    // to like kniver blir én stabel som kan kastes
    let main = ws[0] || null, off = ws[1] || null;
    if (main && off && main.wid === off.wid && main.f.includes('thr')) { main.qty = 1; off.qty = 1; }
    if (main?.shield) { off = main; main = null; }
    this.equip = {
      vapen: main,
      vapen2: off,
      rustning: S.gear.a ? armorItem(S.gear.a, this.isNebb ? { name: 'Slitt lärkappa' } : {}) : null,
      hjalm: S.gear.h ? helmetItem(S.gear.h) : null,
      amulett: null,
    };
    if (this.isNebb && this.equip.vapen) this.equip.vapen.name = 'Nansens dolk';
    this.kit = new Set(S.gear.g || []);
    this.bag = [makeCons('brod', 2)];
    this.overloaded = false;
    this.heroic = [...S.heroic];
    this.spells = [...S.spells];
    this.tricks = new Set(S.tricks || []);
    this.kinAb = [...S.kinAbilities];
    this.boons = [];
    this.cond = {};
    this.marks = new Set();
    this.injuries = [];
    this.ageShift = 0;
    this.potions = 2 + (lv.niste || 0);
    this.silver = S.silver || 0;
    this.downs = 0;
    this.cd = { dodge: 0, throw: 0, sneak: 0, potion: 0, parry: 0, shot: 0, swap: 0, a1: 0, a2: 0, a3: 0, kin: 0 };
    this.fx = {};
    this.armed = null;
    this.prey = null;
    this.stealth = 0;
    this.invuln = 0;
    this.flash = 0;
    this.lock = 0;
    this.action = null;
    this.comboStep = 0;
    this.comboTimer = 0;
    this.guard = 0;
    this.guardHeld = false;
    this.vpTimer = 0;
    this.kpTimer = 0;
    this.downed = false;
    this.dead = false;
    this.dying = null;
    this.forced = null;
    this.charge = null;
    this.noAmmo = 0;
    this.curse = {};
    this.floorStats = {};
    this.floor = { roundRest: false, stretchRest: false, memento: false };
    this.recalc();
    this.kp = this.maxKP;
    this.vp = this.maxVP;
    this.tilt.rotation.set(0, 0, 0);
    this._stealthLook = false;
    this.buildModel();
  }

  // --- lagring -----------------------------------------------------------------------
  // Alt som endrer seg i løpet av et løp. Resten kommer fra formulæret (sheet).
  serialize() {
    const fx = {};
    for (const k of ['utu', 'light', 'sharpened', 'poisonUsed']) if (this.fx[k]) fx[k] = this.fx[k];
    return {
      sheet: this.sheet, baseSkills: this.baseSkills, metaMods: this.metaMods,
      equip: this.equip, bag: this.bag, kit: [...this.kit], potions: this.potions, silver: this.silver,
      heroic: this.heroic, spells: this.spells, tricks: [...this.tricks], kinAb: this.kinAb,
      boons: this.boons, cond: this.cond, marks: [...this.marks], injuries: this.injuries, ageShift: this.ageShift,
      kp: this.kp, vp: this.vp, downs: this.downs, curse: this.curse, floorStats: this.floorStats, floor: this.floor, fx,
    };
  }

  deserialize(d) {
    const clone = v => JSON.parse(JSON.stringify(v));
    this.setSheet(d.sheet);
    this.newRun(G.meta);
    this.baseSkills = clone(d.baseSkills);
    this.metaMods = clone(d.metaMods || {});
    this.equip = clone(d.equip);
    this.bag = clone(d.bag || []);
    this.kit = new Set(d.kit || []);
    this.potions = d.potions ?? 0;
    this.silver = d.silver ?? 0;
    this.heroic = clone(d.heroic || []);
    this.spells = clone(d.spells || []);
    this.tricks = new Set(d.tricks || []);
    this.kinAb = clone(d.kinAb || []);
    this.boons = clone(d.boons || []);
    this.cond = clone(d.cond || {});
    this.marks = new Set(d.marks || []);
    this.injuries = clone(d.injuries || []);
    this.ageShift = d.ageShift || 0;
    this.downs = d.downs || 0;
    this.curse = clone(d.curse || {});
    this.floorStats = clone(d.floorStats || {});
    this.floor = clone(d.floor || { roundRest: false, stretchRest: false, memento: false });
    this.recalc();
    this.kp = Math.min(this.maxKP, d.kp ?? this.maxKP);
    this.vp = Math.min(this.maxVP, d.vp ?? this.maxVP);
    this.buildModel();
  }

  // Kalles når et nytt nivå begynner (ett skift)
  onFloor() {
    this.floor = { roundRest: false, stretchRest: false, memento: false };
    this.floorStats = { silver: 0, chests: 0, kills: 0, pushes: 0, bread: 0, dodges: 0, runes: 0, lore: 0, beasts: 0, monsters: 0 };
    this.fx.sharpened = false;
    this.prey = null;
    this.curse.gold = false;
    if (this.tricks.has('ljus') && this.vp >= 1) { this.vp -= 1; this.fx.light = true; } else this.fx.light = false;
  }

  recalc() {
    const mods = {};
    const add = m => { for (const k in m || {}) mods[k] = (mods[k] || 0) + m[k]; };
    for (const [slot, it] of Object.entries(this.equip)) {
      if (!it) continue;
      for (const k in it.mods || {}) {
        if (k === 'skill:*') { if (it.skill) mods['skill:' + it.skill] = (mods['skill:' + it.skill] || 0) + it.mods[k]; }
        else if (k === 'master') continue;
        else mods[k] = (mods[k] || 0) + it.mods[k];
      }
      void slot;
    }
    for (const b of this.boons) add(b.mods);
    add(this.metaMods);
    this.mods = mods;
    this.flags = new Set(this.boons.map(b => b.flag).filter(Boolean));
    const A = this.attrs = this.effectiveAttrs();
    // ferdigheter: grunnverdi fra formulæret, justert hvis alderen har endret seg (magisk missöde)
    this.skills = {};
    for (const s in this.baseSkills) {
      let v = this.baseSkills[s];
      if (this.ageShift && SKILL[s]) {
        const bOld = baseChanceOf(this.sheet.attrs[SKILL[s].attr]), bNew = baseChanceOf(A[SKILL[s].attr]);
        v += (bNew - bOld) * (this.sheet.trained.includes(s) ? 2 : 1);
      }
      for (const inj of this.injuries) if (inj.minus?.[s]) v -= inj.minus[s];
      this.skills[s] = Math.max(1, Math.min(18, v + (mods['skill:' + s] || 0)));
    }
    const nTal = this.heroic.filter(h => h === 'talig').length, nFok = this.heroic.filter(h => h === 'fokuserad').length;
    this.maxKP = Math.max(4, A.FYS + (mods.maxKP || 0) + nTal * 2);
    this.maxVP = Math.max(2, A.PSY + (mods.maxVP || 0) + nFok * 2);
    const ar = this.equip.rustning, hj = this.equip.hjalm;
    this.armorBase = (ar ? ar.armor - (ar.broken ? 1 : 0) : 0) + (hj ? hj.armor : 0) + (mods.armor || 0);
    this.armor = this.armorBase;
    let move = KIN[this.sheet.kin].move + moveMod(A.SMI);
    for (const inj of this.injuries) if (inj.move) move += inj.move;
    this.move = Math.max(4, move);
    this.speedBase = 6.2 * (0.62 + 0.38 * this.move / 11);
    if (this.injuries.some(i => i.slow)) this.speedBase *= 0.6;
    this.speedMul = 1 + ((mods.speed || 0) - (mods.slow || 0)) / 100;
    this.overloaded = !!this.bag && this.bag.length > bagCap(this);
    if (this.overloaded) this.speedMul *= 0.72;
    this.drakeMax = 1 + (mods.drake || 0);
    this.dmgFlat = mods.dmg || 0;
    this.metalWorn = !!((ar && ar.metal) || (hj && hj.metal));
    if (this.kp > this.maxKP) this.kp = this.maxKP;
    if (this.vp > this.maxVP) this.vp = this.maxVP;
  }

  effectiveAttrs() {
    const A = { ...this.sheet.attrs };
    if (this.ageShift) {
      // flytt en alderskategori: bruk differansen mellom alderstabellene
      const order = ['ung', 'medel', 'gammal'];
      const cur = order.indexOf(this.sheet.age);
      const next = order[Math.max(0, Math.min(2, cur + this.ageShift))];
      const a0 = AGES.find(a => a.id === this.sheet.age).mods, a1 = AGES.find(a => a.id === next).mods;
      for (const k in A) A[k] = Math.max(1, Math.min(18, A[k] - (a0[k] || 0) + (a1[k] || 0)));
    }
    return A;
  }

  has(id) { return this.heroic.includes(id); }

  // --- tillstånd ------------------------------------------------------------

  hasCond(id) { return !!this.cond[id]; }
  condCount() { return Object.values(this.cond).filter(Boolean).length; }

  // exact: bare dette tillståndet (ved pressing). Ellers velges et annet hvis du allerede har det.
  addCond(id, exact = false) {
    if (this.hasCond(id)) {
      if (exact) return false;
      const free = CONDITIONS.filter(c => !this.hasCond(c.id));
      if (!free.length) {
        // alle seks: mist T6 VP, eller T6 KP hvis VP er tom
        const n = d(6);
        if (this.vp > 0) { this.vp = Math.max(0, this.vp - n); G.ui.log(`Alle tillstånd er tatt. ${this.name} mister ${n} VP.`); }
        else this.applyHit({ value: n, ignoreArmor: true, verb: 'utmattelse' });
        return false;
      }
      id = free[Math.floor(Math.random() * free.length)].id;
    }
    this.cond[id] = true;
    const c = COND_BY_ID[id];
    G.fx.float(c.name, this.pos, 'cond');
    G.ui.log(`${this.name} er nå <b class="c-cond">${c.name}</b> (nackdel på ${ATTR_NAME[c.attr]} og ferdighetene som hører til).`);
    return true;
  }
  clearCond(id) { delete this.cond[id]; }
  clearConds() { this.cond = {}; }

  // --- slag ----------------------------------------------------------------

  skillVal(skill) {
    if (ATTR_NAME[skill]) return this.attrs[skill];
    return this.skills[skill] ?? 0;
  }

  /**
   * Slår et slag. skill kan være en ferdighet eller en grundegenskap (STY, FYS ...).
   * o: { boon, bane, weapon, melee, ranged, target, important, noArmed, label }
   */
  roll(skill, o = {}) {
    let boon = o.boon || 0, bane = o.bane || 0;
    let value = this.skillVal(skill);
    const attr = ATTR_NAME[skill] ? skill : SKILL[skill]?.attr;
    if (attr && this.hasCond(COND_BY_ATTR[attr])) bane++;
    const ar = this.equip.rustning, hj = this.equip.hjalm;
    if (ar?.bane.includes(skill) || hj?.bane.includes(skill)) bane++;
    if (o.ranged && hj?.bane.includes('avstand')) bane++;
    for (const inj of this.injuries) {
      if (inj.bane?.includes(skill) || (attr && inj.baneAttr?.includes(attr))) bane++;
    }
    const w = o.weapon;
    if (w) {
      if (w.broken) bane++;
      if (w.str && this.attrs.STY < w.str) bane++;
      if (w.grip === 2 && this.injuries.some(i => i.noTwoHand)) bane++;
    }
    if (o.melee && this.inWater && !this.waterFree()) bane++;
    if (this.overloaded && (skill === 'Smyga' || skill === 'Undvika')) bane++;
    if (o.melee && this.fx.barsark > 0) boon++;
    if (o.target && this.prey === o.target && this.vp >= 1 && !o.noArmed) { this.vp -= 1; boon++; o.preyUsed = true; }
    // släktesförmåga som er gjort klar med F
    if (this.armed && !o.noArmed) {
      const a = this.armed;
      if (a === 'vresig' && attr !== 'INT') { boon++; o.vresig = true; this.armed = null; }
      else if (a === 'halsomenal' && skill === 'Undvika') { boon++; this.armed = null; o.kinUsed = true; }
      else if (a === 'langsint' && o.target?.hurtPlayer) { boon++; this.armed = null; o.kinUsed = true; }
      else if (a === 'anpasslig' && SKILL[skill]) {
        const best = Math.max(...this.sheet.trained.filter(s => this.skills[s] != null).map(s => this.skills[s]));
        if (best > value) { value = best; o.kinUsed = true; G.fx.float('Anpasslig', this.pos, 'sneak'); }
        this.armed = null;
      }
    }
    const r = skillRoll(value, { boon, bane, drakeMax: this.drakeMax, demonIsCrit: this.flags.has('demonCrit') });
    r.skill = skill;
    r.opts = { boon, bane, value };
    r.o = o;
    this.afterRoll(r);
    if (o.vresig) {
      G.fx.float('VRESIG!', this.pos, 'rage big', 2.4);
      this.voice('angry');
      this.addCond('ARG');
    }
    return r;
  }

  afterRoll(r) {
    const skill = r.skill;
    if ((r.drake || r.demon) && SKILL[skill]) {
      if (!this.marks.has(skill)) G.ui.log(`<span class="c-mark">${skill} er markert</span> og kan forbedres ved neste vila.`);
      this.marks.add(skill);
    }
    G.run.rolls++;
    if (r.drake) G.run.drakes++;
    if (r.demon) G.run.demons++;
  }

  // Pressa slaget: slå om alle terningene, behold boon/bane
  reroll(r) {
    const r2 = skillRoll(r.opts.value, { boon: r.opts.boon, bane: r.opts.bane, drakeMax: this.drakeMax, demonIsCrit: this.flags.has('demonCrit') });
    Object.assign(r2, { skill: r.skill, opts: r.opts, o: r.o, pushed: true });
    this.afterRoll(r2);
    return r2;
  }

  canPush(r) {
    return !r.success && !r.demon && this.condCount() < 6 && !this.downed && !this.dead;
  }

  // Slag som kan presses. cb får det endelige resultatet (kan komme senere hvis spilleren tenker).
  rollPush(skill, o, cb) {
    const r = this.roll(skill, o);
    if (this.canPush(r) && G.game.wantsPush(o)) G.game.offerPush(r, cb);
    else cb(r);
    return r;
  }

  vpCost(base) {
    return base;
  }
  spend(n) {
    if (this.vp < n) { G.fx.float('For lite VP', this.pos, 'miss'); return false; }
    this.vp -= n;
    return true;
  }

  waterFree() {
    return this.kinAb.includes('simfotter') || this.fx.sjoben > 0;
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
    const pitch = { halvling: 1.7, alv: 1.35, manniska: 1.2, dvarg: 0.85, vargfolk: 0.7 }[this.sheet.kin] || 1.2;
    if (kind === 'hurt') A.grunt(pitch * 1.1);
    else if (kind === 'angry') A.grunt(pitch * 0.85);
    else if (kind === 'down') { A.grunt(pitch * 0.8); A.grunt(pitch * 0.7); }
    else if (kind === 'dodge') { if (Math.random() < 0.4) A.grunt(pitch * 1.3); }
    else A.grunt(pitch);
  }

  // --- oppdatering --------------------------------------------------------

  inCombat() {
    for (const e of G.enemies) if (!e.dead && e.alerted && Math.abs(e.pos.x - this.pos.x) + Math.abs(e.pos.z - this.pos.z) < 26) return true;
    return false;
  }

  update(dt, input) {
    for (const k in this.cd) this.cd[k] = Math.max(0, this.cd[k] - dt);
    for (const k of ['tjuvhugg', 'dubbelhugg', 'drakdrapare', 'tvavapen', 'stridsvana', 'livvakt', 'sjoben', 'tonkonst']) if (this.fx[k] > 0) this.fx[k] -= dt;
    for (const k of ['kraftnave', 'stenhud', 'langsteg']) if (this.fx[k]) { this.fx[k].t -= dt; if (this.fx[k].t <= 0) { this.fx[k] = null; G.ui.log(`${SPELLS[k].name} tar slutt.`); this.recalc(); } }
    this.invuln = Math.max(0, this.invuln - dt);
    this.flash = Math.max(0, this.flash - dt);
    this.lock = Math.max(0, this.lock - dt);
    this.noAmmo = Math.max(0, this.noAmmo - dt);
    if (this.blind > 0) this.blind -= dt;
    if (this.animal > 0) { this.animal -= dt; if (this.animal <= 0) this.endAnimal(); }
    this.comboTimer -= dt;
    if (this.comboTimer <= 0 && !this.action) this.comboStep = 0;
    if (this.prey?.dead) this.prey = null;
    // Bärsärk varer til ingen fiender er i nærheten
    if (this.fx.barsark > 0) {
      this.fx.barsark -= dt;
      if (Math.random() < dt * 14) G.fx.burst('rage', this.pos, 1);
      if (!this.inCombat()) this.fx.barsarkCalm = (this.fx.barsarkCalm || 0) + dt; else this.fx.barsarkCalm = 0;
      if (this.fx.barsark <= 0 || this.fx.barsarkCalm > 2) {
        this.fx.barsark = 0;
        G.ui.log('Raseriet ebber ut.');
        this.addCond('UTM');
      }
    }
    if (this.stealth > 0) {
      this.stealth -= dt;
      if (this.stealth <= 0) this.breakStealth();
    }
    // VP kommer sakte tilbake utenfor kamp (spillets forenkling av snabb vila)
    if (!this.flags.has('bloodthirst') && !this.curse.noRegen) {
      const out = !this.inCombat();
      this.vpTimer += dt * (out ? 1 : 0.25) * (this.flags.has('breath') ? 2 : 1);
      if (this.vpTimer >= 5) { this.vpTimer = 0; if (this.vp < this.maxVP) this.vp++; }
    }
    if (this.flags.has('regen')) {
      this.kpTimer += dt;
      if (this.kpTimer >= 8) { this.kpTimer = 0; this.heal(1, true); }
    }
    if (this.dying) this.updateDying(dt);
    if (this.chanRest) this.updateRest(dt);

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
      const t = this.nearestEnemy(isRanged(this.equip.vapen) ? 22 : 9);
      if (t) this.aimDir.set(t.pos.x - this.pos.x, 0, t.pos.z - this.pos.z).normalize();
      else if (move.lengthSq() > 0.01) this.aimDir.copy(move).normalize();
    } else if (G.aim) {
      tmp2.set(G.aim.x - this.pos.x, 0, G.aim.z - this.pos.z);
      if (tmp2.lengthSq() > 0.04) this.aimDir.copy(tmp2.normalize());
    }

    if (this.downed) {
      this.vel.multiplyScalar(0.8);
      this.animate(dt, 0);
      return;
    }

    // tvungen handling fra skräcktabellen
    if (this.forced) this.updateForced(dt, move);

    const free = !this.forced || this.forced.type === 'rage';
    const peace = !!G.dungeon?.peaceful;
    let atk = free && (input.mouse.down || input.wasPressed('Mouse0') || input.down('TAtk'));
    if (peace && (atk || input.wasPressed('KeyQ') || input.wasPressed('TThrow') || input.wasPressed('KeyR') || input.wasPressed('KeyG') || input.wasPressed('KeyT') || input.wasPressed('KeyF'))) {
      atk = false;
      if (!this.peaceT || G.time > this.peaceT) {
        this.peaceT = G.time + 3;
        G.fx.float('Ikke her', this.pos, 'miss');
        if (!this.peaceTold) { this.peaceTold = true; G.ui.log('Vaktene i Fristaden holder øye med deg. Du lar våpenet være i byen.'); }
      }
    }
    const wantDodge = free && (input.wasPressed('Space') || input.wasPressed('TDash'));
    this.guardHeld = free && (input.mouse.rdown || input.down('TParry'));

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
      } else if (a.type === 'stuck') {
        a.tick = (a.tick || 0) + dt;
        if (a.tick >= 0.5) {
          a.tick = 0;
          const r = this.roll('STY', { noArmed: true });
          if (r.success) { this.action = null; G.fx.float('Løs!', this.pos, 'miss'); }
        }
      } else if (a.t >= a.dur) {
        this.action = null;
      }
    } else if (free && !this.lock) {
      if (this.charge) { /* lader en besvärjelse */ }
      else if (atk && !this.guard) this.startAttack();
      else if (!peace && (input.wasPressed('KeyQ') || input.wasPressed('TThrow'))) this.throwWeapon();
    }
    // vakt (parera)
    this.updateGuard(dt);
    if (free && (input.wasPressed('KeyZ') || input.wasPressed('Wheel') || input.wasPressed('TSwap'))) this.swapWeapons();
    if (free && !peace) this.updateAbilityKeys(dt, input);
    if (free && !peace && (input.wasPressed('KeyF') || input.wasPressed('TKin'))) this.useKin();
    if (free && (input.wasPressed('ShiftLeft') || input.wasPressed('ShiftRight') || input.wasPressed('TSneak'))) this.trySneak();
    if (input.wasPressed('Digit1') || input.wasPressed('TPotion')) this.drinkPotion();
    if (input.wasPressed('KeyV')) this.roundRest();
    if (input.wasPressed('KeyH') || input.wasPressed('TRest')) this.startStretchRest();

    // fart
    const inWater = G.dungeon.isWater(this.pos.x, this.pos.z);
    let speed = this.speedBase * this.speedMul;
    if (inWater && !this.waterFree()) speed *= 0.5;
    if (this.fx.langsteg) speed *= 1 + 0.25 * this.fx.langsteg.pl;
    if (this.stealth > 0) speed *= 0.72;
    if (this.fx.barsark > 0) speed *= 1.1;
    if (this.guard > 0) speed *= 0.45;
    if (this.charge) speed *= 0.5;
    if (this.chanRest) speed = 0;
    if (this.animal > 0) speed *= 1.15;
    const act = this.action;
    let desired = tmp2.copy(move).multiplyScalar(speed);
    if (this.forced && this.forced.type !== 'rage') desired.copy(this.forced.dir || move).multiplyScalar(this.forced.type === 'paralyzed' ? 0 : speed);
    if (act) {
      if (act.type === 'attack') desired.multiplyScalar(0.3);
      else if (act.type === 'spin') desired.multiplyScalar(0.55);
      else if (act.type === 'stumble' || act.type === 'stuck') desired.set(0, 0, 0);
      else if (act.type === 'throw' || act.type === 'shot' || act.type === 'cast') desired.multiplyScalar(0.45);
      else if (act.type === 'dash') desired.copy(act.dir).multiplyScalar(act.speed);
      else if (act.type === 'knockdown') desired.set(0, 0, 0);
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

  // --- etterbilder ---------------------------------------------------------

  spawnGhost() {
    if (!this.ghostGeo) return;
    let gh = this.ghostPool.pop();
    if (!gh || gh.geometry !== this.ghostGeo) {
      gh = new THREE.Mesh(this.ghostGeo, new THREE.MeshBasicMaterial({ color: 0x8fd0ff, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending, depthWrite: false }));
      gh.matrixAutoUpdate = false;
      gh.renderOrder = 6;
    }
    gh.material.color.set(this.fx.barsark > 0 ? 0xff7a3a : this.inWater ? 0x7affd8 : 0x8fd0ff);
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

  // fienden nærmest siktepunktet (for besvärjelser og Jaktsinne)
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
    return this.equip.vapen || this.unarmed || (this.unarmed = UNARMED());
  }

  dmgBonus(w) {
    if (!w || w.f.includes('nodb') || w.shield) return null;
    const attr = SKILL[w.skill]?.attr;
    if (attr !== 'STY' && attr !== 'SMI') return null;
    return dmgBonusDie(this.attrs[attr]);
  }

  parryItem() {
    const off = this.equip.vapen2, main = this.equip.vapen;
    if (off?.shield && !(main && main.grip === 2)) return off;
    if (main && !main.f.includes('nopar') && !isRanged(main)) return main;
    return null;
  }

  parrySkill(item) {
    if (!item) return null;
    if (item.shield) {
      // skjold: beste STY-baserte närstridsferdighet
      let best = 'Slagsmål';
      for (const s of MELEE_STR) if ((this.skills[s] || 0) > (this.skills[best] || 0)) best = s;
      return best;
    }
    return item.skill;
  }

  swapWeapons() {
    if (this.cd.swap > 0) return;
    const off = this.equip.vapen2;
    if (off?.shield) { G.fx.float('Skjoldet blir i hånda', this.pos, 'miss'); return; }
    if (!off && !this.equip.vapen) return;
    this.equip.vapen2 = this.equip.vapen;
    this.equip.vapen = off;
    this.cd.swap = 0.3;
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
    if (w.str && this.attrs.STY < w.str / 2) { G.fx.float('For tungt', this.pos, 'miss'); this.lock = 0.6; return; }
    if (this.animal > 0) return this.startBite();
    const kind = MELEE[w.kind] ? w.kind : 'fist';
    const M = MELEE[kind];
    const step = this.comboStep;
    const kick = step === 2 && (kind === 'knife' || kind === 'fist');
    const spin = step === 2 && this.flags.has('spin');
    let dur = M.t[step] / (this.fx.barsark > 0 ? 1.12 : 1) * (this.fx.stridsvana > 0 ? 0.75 : 1);
    if (w.str && this.attrs.STY < w.str) dur *= 1.2;
    if (spin) {
      this.action = { type: 'spin', t: 0, dur: 0.56, hits: [{ at: 0.14, done: false }, { at: 0.38, done: false }] };
      this.comboStep = 0;
      this.comboTimer = 0.9;
      G.audio.swing(0.8, 0.45);
      return;
    }
    this.action = { type: 'attack', step, kind, kick, heavy: step === 2, t: 0, dur, hitAt: dur * 0.42, hit: false, queued: false };
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

  meleeHit(a) {
    const w = this.weapon();
    const M = MELEE[a.kind];
    let o;
    if (a.kick) {
      const fist = UNARMED();
      o = { w: fist, skill: 'Slagsmål', dice: this.has('jarnnave') ? '2D6' : 'D6', range: 2.25, arc: 2.3, knock: 11, kick: true, types: ['b'] };
    } else {
      o = { w, skill: w.skill, dice: w.dmg, range: M.reach + (w.f.includes('long') ? 1.0 : 0), arc: M.arc, knock: M.knock * (a.heavy ? 1.8 : 1), heavy: a.heavy, types: w.f.filter(f => f === 'p' || f === 's' || f === 'b') };
      if (w.kind === 'fist' && this.has('jarnnave')) o.dice = '2D6';
    }
    if (a.kind === 'fist' || a.kick) { if (this.fx.kraftnave) o.extra = `${this.fx.kraftnave.pl}D6`; }
    if (a.kick && this.flags.has('bitter')) { o.extra2 = 'D6'; o.stun = 0.9; }
    if (a.kick && this.mods.kickStun) o.stun = Math.max(o.stun || 0, 0.7);
    const col = this.fx.barsark > 0 ? 0xff6a3a : a.kick ? 0xbff6ff : 0xfff1c8;
    G.fx.slash(this.pos, this.yaw, o.range + 0.25, o.arc, a.step === 1 ? -1 : 1, col, a.kick ? 0.55 : 0.95, a.kick ? 0.13 : 0.15);
    this.hitProps(o.range, o.arc);
    const targets = this.findTargets(o.range, o.arc);
    if (!targets.length) return;
    // DoD: ett anfall treffer ett mål. Dubbelhugg (huggvåpen) treffer to.
    const n = this.fx.dubbelhugg > 0 && o.types?.includes('s') && !a.kick ? 2 : 1;
    for (const t of targets.slice(0, n)) this.attackRoll(o, t);
    if (this.fx.tvavapen > 0 && !a.kick) {
      const off = this.equip.vapen2;
      if (off && !off.shield && off.grip === 1 && !isRanged(off)) {
        this.attackRoll({ w: off, skill: off.skill, dice: off.dmg, knock: 2, types: off.f.filter(f => f === 'p' || f === 's' || f === 'b'), offhand: true }, targets[0]);
      }
    }
  }

  // Er målet opptatt eller har ryggen til? (for Tjuvhugg)
  backstabOk(t) {
    if (!t) return false;
    const busy = t.state === 'windup' || t.state === 'aim' || t.state === 'recover' || t.state === 'stagger' || t.state === 'chargeWindup' || t.rooted > 0 || t.surprised > 0;
    const fx = Math.sin(t.yaw), fz = Math.cos(t.yaw);
    const dx = this.pos.x - t.pos.x, dz = this.pos.z - t.pos.z;
    const dd = Math.hypot(dx, dz) || 1;
    const behind = (dx * fx + dz * fz) / dd < -0.2;
    return busy || behind;
  }

  attackRoll(o, t) {
    const w = o.w;
    const subtle = w?.f.includes('sub');
    let sneak = this.stealth > 0 || t.surprised > 0;
    if (!sneak && this.fx.tjuvhugg > 0 && subtle && this.backstabOk(t)) sneak = true;
    let bane = 0;
    if (o.ranged && Math.hypot(t.pos.x - this.pos.x, t.pos.z - this.pos.z) < 2.2) bane++;
    if (o.twin) bane++;
    const ro = { boon: sneak ? 1 : 0, bane, weapon: w, melee: !o.ranged, ranged: !!o.ranged, target: t, important: false };
    if (this.stealth > 0) this.breakStealth();
    this.rollPush(o.skill, ro, r => {
      if (t.dead && !r.demon) return;
      r.sneak = sneak;
      this.resolveHit(r, t, o);
    });
  }

  // Velg skadetype: unngå det målet tåler godt
  pickType(types, t) {
    if (!types?.length) return 'b';
    let best = types[0], bv = -99;
    for (const ty of types) {
      let v = -armorTypeBonus(t.def.armorType, ty);
      if (t.def.resist?.[ty]) v -= 3;
      if (v > bv) { bv = v; best = ty; }
    }
    return best;
  }

  resolveHit(r, t, o) {
    const nm = t.def.boss ? t.def.name : t.def.name.toLowerCase();
    if (r.demon && !r.demonCrit) return this.mishap(o, r);
    if (!r.success) {
      G.fx.float('Bom', t.pos, 'miss');
      G.ui.logRoll(r, `Bom mot ${nm}.`);
      return;
    }
    // fienden kan parera eller undvika, unntatt mot smyganfall. Mot en Drake hjelper bare en Drake.
    if (!r.sneak) {
      const def = t.tryDefend?.(r, o);
      if (def) {
        G.ui.logRoll(r, `${t.def.name} ${def === 'parry' ? 'parerer' : 'undviker'}.`);
        return;
      }
    }
    const type = this.pickType(o.types, t);
    const crit = r.drake || r.demonCrit;
    let choice = null;
    if (crit) {
      const avg = diceAvg(o.dice);
      const other = this.findTargets((o.range || 2.3) + 0.5, 2.6).find(e => e !== t);
      if (type === 'p' && t.armor >= 3) choice = 'armor';
      else if (other && !o.ranged && avg + (o.dice ? 2 : 0) >= t.kp + t.armor) choice = 'extra';
      else choice = 'double';
    }
    let dice = o.dice;
    if (choice === 'double' || r.demonCrit) dice = doubleDice(dice);
    if (r.sneak && w_sub(o.w)) dice = addDie(dice);
    let dmg = rollDice(dice);
    const bonus = o.w && !o.kick ? this.dmgBonus(o.w) : o.kick ? dmgBonusDie(this.attrs.STY) : null;
    if (bonus) dmg += rollDice(bonus);
    if (o.extra) dmg += rollDice(o.extra);
    if (o.extra2) dmg += rollDice(o.extra2);
    if (o.throwBonus) dmg += rollDice(o.throwBonus);
    if (r.sneak && this.has('lonnmordare')) dmg += d(8);
    if (this.fx.drakdrapare > 0 && t.def.monster) dmg += d(8);
    dmg += this.dmgFlat;
    if (crit) {
      G.fx.float(r.sneak ? 'SMYGANFALL!' : 'DRAKE!', this.pos, 'drake big', 2.4);
      G.audio.drake();
      G.hitStop = Math.max(G.hitStop, 0.08);
      G.fx.addShake(0.4);
      G.post?.flash(0xffc860, 0.2);
      G.post?.pulse(0.008);
      G.fx.ring(this.pos, 3.2, 0xffd070, 0.3, 0.9);
      if (this.mods.vpOnDrake) this.gainVP(this.mods.vpOnDrake);
    } else if (r.sneak) {
      G.fx.float('SMYGANFALL!', this.pos, 'sneak big', 2.4);
      G.audio.drake();
      G.hitStop = Math.max(G.hitStop, 0.05);
    }
    tmp.set(t.pos.x - this.pos.x, 0, t.pos.z - this.pos.z).normalize();
    const topple = o.heavy && o.w?.f.includes('top');
    const stun = o.stun || (crit ? 0.4 : 0) || (topple ? 0.8 : 0) || (this.fx.stridsvana > 0 ? 0.25 : 0);
    const dealt = t.takeHit(dmg, tmp, o.knock * (crit ? 1.5 : 1), { crit: crit || r.sneak, stun, type, ignoreArmor: choice === 'armor', armorMinus: this.fx.sharpened ? 1 : 0, forceStagger: this.fx.stridsvana > 0 || topple, src: 'player' });
    G.fx.impact({ x: t.pos.x - tmp.x * t.radius * 0.6, z: t.pos.z - tmp.z * t.radius * 0.6 }, crit ? 0xffd060 : this.fx.barsark > 0 ? 0xff8a50 : 0xfff4e0, crit ? 2.6 : 1.5, t.type === 'rat' ? 0.45 : t.def.boss ? 1.8 : 1.1);
    if (!t.dead) {
      if (this.mods.burn && Math.random() * 100 < this.mods.burn) t.addDot('burn');
      if (this.mods.poison && Math.random() * 100 < this.mods.poison) t.addDot('poison');
      if (this.kit.has('somngift') && !this.fx.poisonUsed && (o.w?.f.includes('p') || o.w?.f.includes('s'))) { this.fx.poisonUsed = true; t.sleep?.(6); G.ui.log(`Sömngiften virker. ${t.def.name} sovner.`); }
    }
    if (crit && this.flags.has('drakeBlast')) G.world.fireBlast(t.pos, 3, 'D6');
    G.fx.addShake(o.kick || o.heavy ? 0.22 : 0.1);
    G.audio.hit(o.kick || crit || o.heavy);
    if (o.kick || o.heavy) G.hitStop = Math.max(G.hitStop, 0.045);
    const verb = r.sneak ? 'Smyganfall mot' : crit ? `<b class="c-drake">Drake!</b> ${choice === 'double' ? 'Dobbel skade mot' : choice === 'armor' ? 'Rustningen hjelper ikke' + (t.def.boss ? ' ' : ' for ') : 'Fullt treff på'}` : 'Treff på';
    G.ui.logRoll(r, `${verb} ${nm}, ${dealt} skade.`);
    if (choice === 'extra') {
      const other = this.findTargets((o.range || 2.3) + 0.5, 3).find(e => e !== t && !e.dead);
      if (other) {
        G.ui.log('Drake: et ekstra anfall.');
        setTimeout(() => { if (!other.dead && G.state === 'play') this.attackRoll(o, other); }, 120);
      }
    }
  }

  // Missöde ved Demon på anfall
  mishap(o, r) {
    const ranged = !!o.ranged;
    const n = d(6);
    const m = (ranged ? MISHAP_RANGED : MISHAP_MELEE)[n - 1];
    G.ui.logRoll(r, `<b class="c-demon">Demon!</b> Missöde: ${m.name}. ${m.game}`);
    G.fx.float('DEMON!', this.pos, 'demon big');
    G.audio.demon();
    this.voice('hurt');
    G.post?.flash(0xff2010, 0.18);
    G.post?.pulse(0.012);
    const w = o.w && !o.kick ? o.w : null;
    const drop = far => {
      if (!w || w.kind === 'fist') return;
      const slot = this.equip.vapen === w ? 'vapen' : this.equip.vapen2 === w ? 'vapen2' : null;
      if (!slot) return;
      this.equip[slot] = null;
      const a = Math.random() * Math.PI * 2, dist = far ? d(3) + 3 : 0.8;
      tmp.set(this.pos.x + Math.cos(a) * dist, 0, this.pos.z + Math.sin(a) * dist);
      G.dungeon.collide(tmp, 0.3);
      G.world.spawnPickup('item', tmp.x, tmp.z, { item: w, noFly: true });
      this.recalc();
      this.refreshWeaponMeshes();
    };
    if (!ranged) {
      if (n === 1) drop(false);
      else if (n === 2) { const e = this.nearestEnemy(4); if (e) e.freeAttack?.(); }
      else if (n === 3) { if (w) this.action = { type: 'stuck', t: 0, dur: 99 }; }
      else if (n === 4) drop(true);
      else if (n === 5) { if (w) { w.broken = true; refinalize(w); } }
      else this.applyHit({ value: rollDice(o.dice), verb: 'sitt eget våpen' });
      if (n !== 3) this.action = { type: 'stumble', t: 0, dur: 0.6 };
    } else {
      if (n === 1) drop(false);
      else if (n === 2) { if (w?.kind === 'sling') drop(false); else this.noAmmo = 10; }
      else if (n === 3) { const lost = Math.min(this.silver, d(6)); this.silver -= lost; if (lost) G.ui.log(`Pila går rett gjennom pungen din. ${lost} silver triller vekk.`); }
      else if (n === 4) { if (w) { w.broken = true; refinalize(w); } }
      else if (n === 5 && G.companion?.alive) G.companion.takeHit(rollDice(o.dice), 'skuddet ditt');
      else this.applyHit({ value: rollDice(o.dice), verb: 'sitt eget skudd' });
    }
  }

  // --- avstandsanfall ----------------------------------------------------------

  startShot(w) {
    if (this.cd.shot > 0) return;
    if (this.inWater && !this.waterFree()) { G.fx.float('Ikke i vann', this.pos, 'miss'); this.cd.shot = 0.5; return; }
    if (this.noAmmo > 0) { G.fx.float('Tomt koger', this.pos, 'miss'); this.cd.shot = 0.5; return; }
    if (w.str && this.attrs.STY < w.str / 2) { G.fx.float('For tung', this.pos, 'miss'); this.cd.shot = 0.6; return; }
    const R = RANGED[w.kind];
    const draw = R.draw * (w.wid === 'langbage' ? 1.25 : 1) * (this.fx.stridsvana > 0 ? 0.75 : 1);
    this.action = { type: 'shot', t: 0, draw, dur: draw + 0.12, w, fired: false };
    this.yaw = Math.atan2(this.aimDir.x, this.aimDir.z);
    G.audio.swing(0.5, 0.12);
  }

  fireShot(a) {
    const w = a.w;
    const R = RANGED[w.kind];
    this.cd.shot = R.cd * (w.wid === 'tungtarmborst' ? 1.4 : 1);
    const twin = this.fx.twinShot && w.kind === 'bow';
    this.fx.twinShot = false;
    const dirs = twin ? [-0.06, 0.06] : [0];
    for (const off of dirs) {
      const dir = this.aimDir.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), off);
      const life = Math.min(1.25, (w.range || 30) * 1.3 / R.speed);
      G.world.spawnPlayerProjectile(R.proj, this.pos, dir, { speed: R.speed, life, o: { w, skill: w.skill, dice: w.dmg, knock: 3, ranged: true, twin, types: w.f.filter(f => f === 'p' || f === 's' || f === 'b') } });
    }
    G.audio.swing(w.kind === 'xbow' ? 0.5 : 1.9, 0.3);
  }

  throwWeapon() {
    if (this.cd.throw > 0) return;
    const can = it => it && !it.shield && it.kind !== 'fist' && !isRanged(it) && (it.f.includes('thr') || (this.has('kastarm') && it.grip === 1));
    let slot = can(this.equip.vapen2) ? 'vapen2' : can(this.equip.vapen) ? 'vapen' : null;
    if (!slot) { G.fx.float('Ingenting å kaste', this.pos, 'miss'); this.cd.throw = 0.4; return; }
    const it = this.equip[slot];
    this.equip[slot] = null;
    // kastet du hovedvåpenet, tar du fram reservevåpenet
    if (slot === 'vapen' && this.equip.vapen2 && !this.equip.vapen2.shield) { this.equip.vapen = this.equip.vapen2; this.equip.vapen2 = null; }
    this.recalc();
    this.refreshWeaponMeshes();
    this.cd.throw = 0.38;
    this.action = { type: 'throw', t: 0, dur: 0.22 };
    this.yaw = Math.atan2(this.aimDir.x, this.aimDir.z);
    const maxR = Math.max(6, this.attrs.STY * (it.wid === 'kortspjut' ? 2 : 1));
    G.world.spawnPlayerProjectile('thrown', this.pos, this.aimDir.clone(), { speed: 22, life: Math.min(1.1, maxR / 22), item: it, o: { w: it, skill: it.skill, dice: it.dmg, knock: 3, ranged: true, throwBonus: this.has('kastarm') ? 'D4' : null, types: it.f.filter(f => f === 'p' || f === 's' || f === 'b') } });
    G.audio.swing(1.8, 0.25);
  }

  // --- forsvar --------------------------------------------------------------

  tryDodge(move) {
    if (this.cd.dodge > 0 || this.fx.barsark > 0 || this.chanRest) return;
    if (this.action && (this.action.type === 'spin' || this.action.type === 'stumble' || this.action.type === 'stuck' || this.action.type === 'knockdown')) return;
    this.charge = null;
    const dir = move.lengthSq() > 0.01 ? move.clone().normalize() : this.aimDir.clone();
    const ar = this.equip.rustning;
    const heavy = ar && (ar.aid === 'ringbrynja' || ar.aid === 'platrustning');
    this.action = { type: 'dash', t: 0, dur: 0.2, dir, hits: new Set(), speed: (heavy ? 19 : 24) * Math.min(1.25, this.speedMul) * (this.inWater && !this.waterFree() ? 0.6 : 1) };
    this.comboStep = 0;
    this.dodgeWin = 0.3; // angrep som lander i dette vinduet gir et Undvika-slag
    this.dodgeT = G.time;
    this.cd.dodge = this.has('snabbfot') ? 0.35 : 0.7;
    this.floorStats.dodges = (this.floorStats.dodges || 0) + 1;
    G.audio.swing(1.5, 0.3);
    this.voice('dodge');
    G.fx.burst(this.inWater ? 'splash' : 'dust', this.pos, 8);
    if (this.isDuck) G.fx.burst('feather', this.pos, 2);
  }

  dodging() {
    return this.dodgeT != null && G.time - this.dodgeT < this.dodgeWin;
  }

  updateGuard(dt) {
    const item = this.parryItem();
    if (this.guardHeld && item && this.cd.parry <= 0 && this.fx.barsark <= 0 && (!this.action || this.action.type === 'attack' && this.action.t > this.action.hitAt)) {
      if (this.guard <= 0) { this.guard = 0.0001; this.guardT = 0; }
      this.guardT += dt;
      this.guard = 1;
      if (this.guardT > 1.6) this.endGuard();
    } else if (this.guard > 0) this.endGuard();
    else if (this.guardHeld && !item && !this._noParryMsg) {
      this._noParryMsg = true;
      G.fx.float(this.fx.barsark > 0 ? 'Bärsärk parerer ikke' : 'Kan ikke parere med dette', this.pos, 'miss');
      setTimeout(() => (this._noParryMsg = false), 1200);
    }
  }
  endGuard() {
    this.guard = 0;
    this.cd.parry = this.has('defensiv') ? 0.2 : 0.45;
  }

  // Et angrep treffer deg. a: { src, dmg | value, type, drake, monster, ranged, area, noDodge, noParry, verb, after, ignoreArmor }
  receiveAttack(a) {
    if (this.downed || this.dead) return;
    if (this.invuln > 0 && !a.ignoreInvuln) return;
    const reactOK = this.fx.barsark <= 0;
    let mode = null;
    if (reactOK && !a.noDodge && this.dodging()) mode = 'dodge';
    else if (reactOK && !a.noParry && this.guard > 0) {
      const item = this.parryItem();
      const front = !a.src || (() => {
        const dx = a.src.pos.x - this.pos.x, dz = a.src.pos.z - this.pos.z;
        const dd = Math.hypot(dx, dz) || 1;
        return (dx * Math.sin(this.yaw) + dz * Math.cos(this.yaw)) / dd > -0.1;
      })();
      const okMonster = !a.monster || (item?.shield && this.has('skoldblockad')) || a.parryable;
      const okRanged = !a.ranged || item?.shield;
      if (item && front && okMonster && okRanged) mode = 'parry';
    }
    if (!mode) return this.applyHit(a);
    const item = mode === 'parry' ? this.parryItem() : null;
    const skill = mode === 'dodge' ? 'Undvika' : this.parrySkill(item);
    const o = { important: true, weapon: item, boon: mode === 'parry' && a.monster && item?.shield ? 1 : 0, label: mode === 'dodge' ? 'Undvika' : 'Parera' };
    this.rollPush(skill, o, r => {
      if (this.downed || this.dead) return;
      const ok = r.success && (!a.drake || r.drake);
      if (!ok) {
        G.ui.logRoll(r, mode === 'dodge' ? 'Klarer ikke å dukke unna.' : 'Pareringen glipper.');
        return this.applyHit(a);
      }
      if (mode === 'dodge') {
        G.fx.float('Undvek', this.pos, 'miss');
        G.ui.logRoll(r, `${this.name} dukker unna${a.src ? ' ' + (a.src.def?.name?.toLowerCase() || '') : ''}.`);
        G.run.dodges = (G.run.dodges || 0) + 1;
        if (!this.has('snabbfot')) this.lock = Math.max(this.lock, 0.2);
      } else {
        G.fx.float('Parerat', this.pos, 'miss');
        G.fx.burst('spark', { x: this.pos.x + Math.sin(this.yaw) * 0.6, y: 1.1, z: this.pos.z + Math.cos(this.yaw) * 0.6 }, 10);
        G.audio.hit(false);
        G.run.parries = (G.run.parries || 0) + 1;
        // brytvärde: skade over brytvärdet ødelegger våpenet (stikkskade gjør det aldri)
        const dmg = a.value ?? rollDice(a.dmg);
        let txt = `${this.name} parerer.`;
        if (a.type !== 'p' && item.dur && dmg > item.dur && !item.broken) {
          item.broken = true;
          refinalize(item);
          txt += ` ${item.name} tar skade (${dmg} mot brytvärde ${item.dur}) og er nå trasig.`;
          G.fx.float('Trasig!', this.pos, 'demon');
        }
        G.ui.logRoll(r, txt);
        if (!this.has('defensiv')) this.lock = Math.max(this.lock, 0.3);
        // Drake på parering: motangrep som alltid treffer
        if (r.drake && !a.drake && !a.ranged && a.src && !a.src.dead && a.src.takeHit) {
          const w = this.weapon();
          const dd = rollDice(w.dmg) + rollDice(this.dmgBonus(w) || '0');
          tmp.set(a.src.pos.x - this.pos.x, 0, a.src.pos.z - this.pos.z).normalize();
          const got = a.src.takeHit(dd, tmp, 5, { crit: true, stun: 0.5, src: 'player' });
          G.fx.float('MOTANFALL!', this.pos, 'drake big', 2.4);
          G.ui.log(`<b class="c-drake">Drake!</b> Motanfall mot ${a.src.def.name.toLowerCase()}, ${got} skade.`);
        }
      }
    });
  }

  armorVs(type) {
    const ar = this.equip.rustning;
    let v = this.armorBase;
    if (ar && !ar.broken) v += armorTypeBonus(ar.type, type);
    if (this.fx.stenhud) v = Math.max(v, 2 + 2 * this.fx.stenhud.pl);
    return v;
  }

  applyHit(a) {
    if (this.dead) return 0;
    const dmg = a.value ?? rollDice(a.dmg);
    const armor = a.ignoreArmor ? 0 : this.armorVs(a.type);
    const real = Math.max(0, dmg - armor);
    if (this.stealth > 0) this.breakStealth();
    this.interruptRest('skade');
    if (a.src?.def) a.src.hurtPlayer = true;
    if (real <= 0) {
      G.fx.float('Prell', this.pos, 'miss');
      G.fx.burst('spark', { x: this.pos.x, y: 1, z: this.pos.z }, 6);
      if (a.verb) this.logHit(a, `${a.who || a.src?.def?.name || 'Noe'} ${a.verb} ${this.name}, men rustningen tar alt (${dmg}).`);
      a.after?.(0);
      return 0;
    }
    // omedelbar död: skade minus KP er minst maks KP
    const instant = real - this.kp >= this.maxKP && this.kp > 0;
    G.run.damageTaken += Math.min(real, this.kp);
    if (a.verb) this.logHit(a, `${a.who || a.src?.def?.name || 'Noe'} ${a.verb} ${this.name}. ${real} skade${real < dmg ? ` (${dmg - real} tatt av rustning)` : ''}.`);
    const wasZero = this.kp <= 0;
    this.kp = Math.max(0, this.kp - real);
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
      a.src.takeHit(this.mods.thorns, tmp, 2, {});
    }
    a.after?.(real);
    if (instant) {
      G.ui.log(`Treffet er så hardt at ${this.name} dør på stedet (${real} skade mot ${this.maxKP} maks KP).`);
      G.game.onDeath(true);
      return real;
    }
    if (this.dying) {
      // skade på 0 KP er et misslyckat dödsslag
      this.dying.f++;
      G.ui.log('Skade mens du ligger nede: et misslyckat dödsslag.');
      if (this.dying.f >= 3) G.game.onDeath();
      return real;
    }
    if (this.kp <= 0 && !wasZero) G.game.onPlayerDown(a.src);
    return real;
  }

  logHit(a, txt) {
    if (a.roll) G.ui.logRoll(a.roll, txt, true);
    else G.ui.log(txt, 'enemy');
  }

  // Skräckanfall (rädsla)
  fearCheck(src, o = {}) {
    if (this.downed || this.dead) return;
    if (this.has('orad') && this.vp >= 2) {
      this.vp -= 2;
      G.fx.float('Orädd', this.pos, 'sneak');
      G.ui.log(`${this.name} er orädd (2 VP) og står imot.`);
      return;
    }
    this.rollPush('PSY', { important: true, bane: o.bane || 0, boon: this.fx.utu ? 1 : 0, label: 'Rädsla', noArmed: true }, r => {
      if (r.success) { G.ui.logRoll(r, `${this.name} står imot skräcken.`); return; }
      const n = d(8);
      const f = FEAR[n - 1];
      G.ui.logRoll(r, `<b class="c-demon">Skräck!</b> ${f.name}: ${f.game}`);
      G.fx.float(f.name.toUpperCase(), this.pos, 'cond big', 2.6);
      const away = new THREE.Vector3(this.pos.x - src.pos.x, 0, this.pos.z - src.pos.z).normalize();
      if (n === 1) { this.vp = Math.max(0, this.vp - rollDice('2D6')); this.addCond('UPP'); }
      else if (n === 2) this.addCond('RAD');
      else if (n === 3) this.addCond('UTM');
      else if (n === 4) { this.addCond('RAD'); G.companion?.scare?.(); }
      else if (n === 5) G.world.alertAround(this.pos, 30);
      else if (n === 6) { this.addCond('ARG'); this.forced = { type: 'rage', src, t: 2.5 }; }
      else if (n === 7) this.forced = { type: 'paralyzed', t: 0, tick: 0, max: 4 };
      else this.forced = { type: 'panic', dir: away, t: 0, tick: 0, max: 4, src };
    });
  }

  updateForced(dt, move) {
    const f = this.forced;
    f.t += dt;
    if (f.type === 'rage') {
      if (f.src && !f.src.dead) {
        move.set(f.src.pos.x - this.pos.x, 0, f.src.pos.z - this.pos.z);
        const dist = move.length();
        move.normalize();
        this.aimDir.copy(move);
        if (dist < 2.2 && !this.action) this.startAttack();
      }
      if (f.t > 2.5) this.forced = null;
      return;
    }
    f.tick += dt;
    if (f.type === 'panic' && f.src) f.dir = new THREE.Vector3(this.pos.x - f.src.pos.x, 0, this.pos.z - f.src.pos.z).normalize();
    if (f.tick >= 1) {
      f.tick = 0;
      const r = this.roll('PSY', { noArmed: true });
      if (r.success || f.t > f.max) { this.forced = null; G.fx.float('Fri', this.pos, 'miss'); }
    }
  }

  // --- evner --------------------------------------------------------------

  // Aktive evner på R, G og T (hjälteförmågor eller besvärjelser)
  activeSlots() {
    if (this.spells.length) return this.spells.slice(0, 3).map(id => ({ kind: 'spell', id }));
    const act = [...new Set(this.heroic)].filter(h => HEROIC[h]?.act === 'active');
    return act.slice(0, 3).map(id => ({ kind: 'heroic', id }));
  }

  updateAbilityKeys(dt, input) {
    const slots = this.activeSlots();
    const keys = [['KeyR', 'TA1', 'a1'], ['KeyG', 'TA2', 'a2'], ['KeyT', 'TA3', 'a3']];
    slots.forEach((s, i) => {
      const [k, tk, cdk] = keys[i];
      const pressed = input.wasPressed(k) || input.wasPressed(tk);
      const held = input.down(k) || input.down(tk);
      if (s.kind === 'heroic') {
        if (pressed && this.cd[cdk] <= 0 && !this.lock) this.useHeroic(s.id, cdk);
        return;
      }
      // besvärjelse: hold for høyere effektgrad
      if (pressed && !this.charge && this.cd[cdk] <= 0 && !this.lock && !this.action) {
        this.charge = { id: s.id, cdk, t: 0, key: k, tkey: tk };
      }
      if (this.charge && this.charge.cdk === cdk) {
        this.charge.t += dt;
        const pl = this.charge.t >= 0.75 ? 3 : this.charge.t >= 0.35 ? 2 : 1;
        if (pl !== this.charge.pl) {
          this.charge.pl = pl;
          G.fx.ring(this.pos, 1.2 + pl * 0.5, [0x9ab8ff, 0xb08aff, 0xff8ad8][pl - 1], 0.25, 0.1);
          if (pl > 1) G.audio.menuTick?.(60 + pl * 4);
        }
        if (!held) {
          const c = this.charge;
          this.charge = null;
          this.castSpell(c.id, c.pl, c.cdk);
        }
      }
    });
  }

  useHeroic(id, cdk) {
    const h = HEROIC[id];
    let cost = h.vp;
    if (id === 'tonkonst' && [...this.kit].some(g => GEAR[g]?.fx === 'instrument')) cost = 2;
    const say = (txt) => { G.fx.float(h.name.toUpperCase(), this.pos, 'rage big', 2.4); if (txt) G.ui.log(txt); };
    switch (id) {
      case 'tjuvhugg':
        if (!this.spend(cost)) return;
        this.fx.tjuvhugg = h.dur;
        say(`${this.name} venter på et åpent øyeblikk. Tjuvhugg i ${h.dur} sekunder.`);
        break;
      case 'barsark':
        if (this.fx.barsark > 0 || !this.spend(cost)) return;
        this.fx.barsark = 30;
        this.fx.barsarkCalm = 0;
        this.guard = 0;
        this.addCond('ARG');
        this.voice('angry');
        G.fx.ring(this.pos, 3.5, 0xff3a1a, 0.4);
        G.fx.burst('rage', this.pos, 20);
        G.fx.addShake(0.25);
        say(`${this.name} går <b class="c-rage">bärsärk</b>. Fördel på närstrid, ingen parering eller dukking.`);
        break;
      case 'dubbelhugg': case 'drakdrapare': case 'stridsvana': case 'livvakt': case 'sjoben':
        if (!this.spend(cost)) return;
        this.fx[id] = h.dur;
        say(`${h.name} i ${h.dur} sekunder.`);
        break;
      case 'tvavapen': {
        const off = this.equip.vapen2;
        if (!off || off.shield || off.grip !== 1 || isRanged(off)) { G.fx.float('Trenger et enhåndsvåpen til', this.pos, 'miss'); return; }
        if (!this.spend(cost)) return;
        this.fx.tvavapen = h.dur;
        say(`To våpen i ${h.dur} sekunder.`);
        break;
      }
      case 'tvillingpil':
        if (this.weapon().kind !== 'bow') { G.fx.float('Bare med bue', this.pos, 'miss'); return; }
        if (this.fx.twinShot || !this.spend(cost)) return;
        this.fx.twinShot = true;
        say('Neste skudd: to piler.');
        break;
      case 'tonkonst':
        if (!this.spend(cost)) return;
        this.fx.tonkonst = h.dur;
        this.fx.tonkonstR = cost === 2 ? 12 : 10;
        say(`${this.name} spiller. Fiender innen ${this.fx.tonkonstR} m får nackdel.`);
        this.playTune();
        break;
      case 'foljeslagare':
        if (!this.spend(cost)) return;
        G.game.companionAction();
        break;
      case 'skattjagare':
        if (!this.spend(cost)) return;
        if (!G.world.showTreasureTrail()) { this.vp += cost; G.fx.float('Ingen skatt igjen', this.pos, 'miss'); return; }
        say('Et gyllent spor viser veien.');
        break;
      case 'intuition':
        if (!this.spend(cost)) return;
        G.world.intuition();
        say();
        break;
      case 'mastersmed':
        if (!this.kit.has('smedverktyg')) { G.fx.float('Trenger smidesverktøy', this.pos, 'miss'); return; }
        if (this.fx.sharpened) { G.fx.float('Allerede slipt', this.pos, 'miss'); return; }
        if (!this.spend(cost)) return;
        this.fx.sharpened = true;
        say(`${this.name} sliper våpenet. Fiendens rustning teller 1 lavere resten av nivået.`);
        G.audio.swing(2.2, 0.3);
        break;
      default:
        return;
    }
    this.cd[cdk] = 0.6;
  }

  playTune() {
    const m = G.audio.music;
    const c = G.audio.ctx;
    if (!m || !c) return;
    const notes = [62, 65, 69, 74, 72, 69, 65, 67];
    notes.forEach((n, i) => { try { m.pluck(n, c.currentTime + 0.02 + i * 0.12, 0.7, G.audio.master, (i % 2) * 0.4 - 0.2, 0.5); } catch (e) { /* lyd er valgfri */ } });
  }

  useKin() {
    if (this.cd.kin > 0) return;
    this.cd.kin = 0.5;
    const ids = this.kinAb.filter(k => !KIN_ABILITIES[k].passive);
    const id = ids[0];
    if (!id) return;
    const k = KIN_ABILITIES[id];
    if (id === 'inrefrid') { this.startStretchRest(); return; }
    if (id === 'jaktsinne') {
      const t = this.aimedEnemy(20);
      if (!t) { G.fx.float('Ingen å jakte på', this.pos, 'miss'); return; }
      if (!this.spend(k.vp)) return;
      this.prey = t;
      G.fx.float('BYTTE', t.pos, 'rage big', 2.6);
      G.ui.log(`${this.name} får teften av ${t.def.name.toLowerCase()}. Angrep mot byttet bruker 1 VP for fördel.`);
      return;
    }
    if (this.armed === id) { this.armed = null; this.vp += k.vp; G.fx.float('Avbrutt', this.pos, 'miss'); return; }
    if (this.armed) return;
    if (!this.spend(k.vp)) return;
    this.armed = id;
    G.fx.float(k.name.toUpperCase(), this.pos, id === 'vresig' ? 'rage big' : 'sneak', 2.4);
    if (id === 'vresig') { G.fx.ring(this.pos, 3, 0xff3a1a, 0.35); this.voice('angry'); }
    G.ui.log(`${k.name}: ${k.game.replace(/^F: /, '')}`);
  }

  trySneak() {
    if (this.cd.sneak > 0) return;
    if (this.stealth > 0) { this.breakStealth(); return; }
    if (this.fx.barsark > 0) { G.fx.float('For rasende', this.pos, 'miss'); return; }
    this.cd.sneak = 2;
    let boon = 0;
    if (this.tricks.has('rokpuff') && this.vp >= 1) { this.vp -= 1; boon = 1; G.fx.burst('smoke', this.pos, 16); }
    this.rollPush('Smyga', { important: true, boon, label: 'Smyga' }, r => {
      if (r.demon && !r.demonCrit) {
        G.ui.logRoll(r, `<b class="c-demon">Demon!</b> ${this.isDuck ? 'Et kvakk slipper ut. Høyt.' : 'Noe velter med et brak.'} Alle hørte det.`);
        G.fx.float(this.isDuck ? 'KVAKK!' : 'BRAK!', this.pos, 'demon big');
        this.voice('angry');
        G.world.alertAround(this.pos, 22);
        return;
      }
      if (!r.success) {
        G.ui.logRoll(r, 'Smyga misslyckas. Noe knirker.');
        G.fx.float('Knirk', this.pos, 'miss');
        G.world.alertAround(this.pos, 10);
        return;
      }
      this.stealth = r.drake ? 12 : 8;
      this.cd.sneak = 1;
      G.ui.logRoll(r, `${r.drake ? '<b class="c-drake">Drake!</b> ' : ''}${this.name} glir inn i skyggene. Neste angrep blir et smyganfall.`);
      G.fx.float('I skyggene', this.pos, 'sneak');
      G.fx.burst('smoke', this.pos, 10);
      this.setStealthLook(true);
    });
  }

  breakStealth() {
    if (this.stealth > 0 || this._stealthLook) {
      this.stealth = 0;
      this.setStealthLook(false);
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

  // Tar en legedrikk fra sekken og henger den i beltet
  refillBelt() {
    const e = this.bag?.find(x => x.cid === 'legedrikk');
    if (!e || this.potions >= 4) return false;
    removeFromBag(this, e, 1);
    this.potions++;
    return true;
  }

  drinkPotion() {
    if (this.potions <= 0 && !this.refillBelt()) { G.fx.float('Ingen drikker', this.pos, 'miss'); return; }
    if (this.cd.potion > 0) return;
    if (this.kp >= this.maxKP && !this.dying) { G.fx.float('Full KP', this.pos, 'miss'); return; }
    this.potions--;
    this.cd.potion = 1;
    if (this.refillBelt()) G.ui.log('Du henger en ny legedrikk fra sekken i beltet.');
    const amount = rollDice('2D6') + (this.flags.has('lunch') ? 3 : 0);
    this.heal(amount);
    G.ui.log(`Legedrikk: +${amount} KP. Smaker av jern og mynte.`);
    if (this.dying) {
      this.dying = null;
      G.ui.log(`${this.name} er ikke lenger døende.`);
      G.game.hideDying();
    }
  }

  heal(n, quiet = false) {
    const before = this.kp;
    this.kp = Math.min(this.maxKP, this.kp + n);
    const got = this.kp - before;
    if (got > 0 && !quiet) {
      G.fx.float('+' + got, this.pos, 'heal');
      G.fx.burst('heal', this.pos, 14);
      G.audio.heal();
    } else if (got > 0) G.fx.burst('heal', this.pos, 4);
    return got;
  }

  gainVP(n) {
    const before = this.vp;
    this.vp = Math.min(this.maxVP, this.vp + n);
    if (this.vp > before) G.fx.burst('will', this.pos, 8);
  }

  // --- vila ----------------------------------------------------------------

  roundRest() {
    if (this.floor.roundRest) { G.fx.float('Snabb vila er brukt dette skiftet', this.pos, 'miss'); return; }
    if (this.action || this.chanRest) return;
    this.floor.roundRest = true;
    const n = d(6);
    this.action = { type: 'cast', t: 0, dur: 0.8, at: 0.7, done: false, fn: () => { this.gainVP(n); G.fx.float(`+${n} VP`, this.pos, 'heal'); } };
    G.ui.log(`Snabb vila: ${this.name} trekker pusten. +${n} VP.`);
  }

  startStretchRest() {
    if (this.chanRest) return;
    if (this.floor.stretchRest) { G.fx.float('Kort vila er brukt dette skiftet', this.pos, 'miss'); return; }
    if (this.inCombat()) { G.fx.float('Ikke med fiender i nærheten', this.pos, 'miss'); return; }
    this.chanRest = { t: 0, dur: 3 };
    this.breakStealth();
    G.ui.log(`${this.name} setter seg ned for en kort vila${this.kinAb.includes('inrefrid') ? ' og mediterer' : ''}...`);
  }

  updateRest(dt) {
    const c = this.chanRest;
    c.t += dt;
    if (Math.random() < dt * 6) G.fx.burst('heal', this.pos, 1);
    if (this.inCombat()) return this.interruptRest('fiender');
    if (c.t >= c.dur) {
      this.chanRest = null;
      this.floor.stretchRest = true;
      G.game.stretchRestResult(G.game.doStretchRest(false));
    }
  }

  interruptRest(why) {
    if (!this.chanRest) return;
    this.chanRest = null;
    G.fx.float('Vilen avbrytes', this.pos, 'miss');
    G.ui.log(`Vilen blir avbrutt (${why}).`);
  }

  // --- døende ved 0 KP etter Samla sig --------------------------------------

  updateDying(dt) {
    const D = this.dying;
    D.t += dt;
    if (D.t >= 5) {
      D.t = 0;
      const r = skillRoll(this.attrs.FYS, { bane: this.hasCond('KRA') ? 1 : 0 });
      r.skill = 'Dödsslag';
      if (r.drake) D.s += 2; else if (r.demon) D.f += 2; else if (r.success) D.s++; else D.f++;
      G.ui.logRoll(r, `Dödsslag: ${D.s} lyktes, ${D.f} feil.`);
      G.game.updateDyingHud();
      if (D.f >= 3) G.game.onDeath();
      else if (D.s >= 3) {
        this.dying = null;
        const n = d(6);
        this.heal(n);
        G.ui.log(`${this.name} er stabil igjen. +${n} KP.`);
        G.game.hideDying();
      }
    }
  }

  // --- dyreskikkelse (magisk missöde) ----------------------------------------
  startBite() {
    this.action = { type: 'attack', step: 0, kind: 'fist', kick: false, heavy: false, t: 0, dur: 0.3, hitAt: 0.12, hit: false, queued: false };
  }
  endAnimal() {
    this.animal = 0;
    if (this.animalModel) { this.bob.remove(this.animalModel); this.animalModel = null; }
    if (this.model) this.model.visible = true;
    G.fx.burst('smoke', this.pos, 14);
    G.ui.log(`${this.name} er seg selv igjen.`);
  }

  dashHits(a) {
    for (const e of G.enemies) {
      if (e.dead || a.hits.has(e)) continue;
      if (Math.hypot(e.pos.x - this.pos.x, e.pos.z - this.pos.z) < e.radius + 0.9) {
        a.hits.add(e);
        this.attackRoll({ w: UNARMED(), skill: 'Slagsmål', dice: 'D6', knock: 4, types: ['b'] }, e);
      }
    }
  }

  spinHit() {
    const col = this.fx.barsark > 0 ? 0xff7040 : 0xc8f0ff;
    G.fx.slash(this.pos, this.yaw, 3.0, Math.PI * 1.98, 1, col, 0.8, 0.2);
    G.fx.ring(this.pos, 3.1, col, 0.3, 0.3);
    if (this.isDuck) G.fx.burst('feather', this.pos, 3);
    G.audio.swing(1.1, 0.4);
    this.hitProps(3.0, 7);
    const w = this.weapon();
    for (const e of G.enemies) if (!e.dead && Math.hypot(e.pos.x - this.pos.x, e.pos.z - this.pos.z) < 2.9 + e.radius) {
      this.attackRoll({ w, skill: w.skill, dice: w.dmg, knock: 8, types: w.f.filter(f => f === 'p' || f === 's' || f === 'b') }, e);
    }
  }

  // --- magi ------------------------------------------------------------------

  castSpell(id, pl, cdk) {
    const sp = SPELLS[id];
    const school = sp.school;
    if (this.metalWorn) { G.fx.float('Metall stopper magien', this.pos, 'miss'); G.ui.log('Du kan ikke trylle i metallrustning eller metallhjelm.'); return; }
    if (this.animal > 0) { G.fx.float('Rotter kan ikke trylle', this.pos, 'miss'); return; }
    if (id === 'bannlysa' && !this.kit.has('amulett') && !this.equip.amulett) { G.fx.float('Trenger hellig symbol', this.pos, 'miss'); G.ui.log('Bannlysa krever et hellig symbol (amulett).'); return; }
    let cost = 2 * pl;
    if (sp.indoor) cost *= 2;
    let bodyDmg = 0;
    if (this.vp < cost) {
      // Kraft ur kroppen: ved 0 eller 1 VP kan du slå en terning for VP og ta like mye skade
      if (this.vp <= 1) {
        const die = cost <= 2 ? 4 : cost <= 4 ? 8 : cost <= 8 ? 12 : 20;
        const got = d(die);
        bodyDmg = got;
        G.ui.log(`Kraft ur kroppen: T${die} gir ${got} VP, og like mye skade etterpå.`);
        if (this.vp + got < cost) {
          G.fx.float('Ikke nok kraft', this.pos, 'miss');
          this.applyHit({ value: got, ignoreArmor: true, who: 'Magien', verb: 'river i' });
          return;
        }
        this.vp += got;
      } else {
        // senk effektgraden til det du har råd til
        while (pl > 1 && this.vp < 2 * pl * (sp.indoor ? 2 : 1)) pl--;
        cost = 2 * pl * (sp.indoor ? 2 : 1);
        if (this.vp < cost) { G.fx.float('For lite VP', this.pos, 'miss'); return; }
      }
    }
    const target = ['bolt', 'chain', 'root', 'smite', 'lift'].includes(sp.kind) ? this.aimedEnemy(sp.range || 10) : null;
    if (['chain', 'root', 'smite', 'lift'].includes(sp.kind) && !target) { G.fx.float('Ingen mål', this.pos, 'miss'); if (bodyDmg) this.vp = Math.max(0, this.vp - bodyDmg); return; }
    this.vp -= cost;
    this.cd[cdk] = 0.5;
    this.yaw = Math.atan2(this.aimDir.x, this.aimDir.z);
    const castTime = sp.kind === 'heal' ? 1.5 : 0.32;
    this.action = { type: 'cast', t: 0, dur: castTime + 0.15, at: castTime, done: false, fn: () => {
      this.rollPush(school, { important: true, label: sp.name }, r => {
        if (r.demon && !r.demonCrit) this.magicMishap(r, sp, pl);
        else if (!r.success) { G.ui.logRoll(r, `${sp.name} misslyckas. VP er brukt.`); G.fx.float('Fusk', this.pos, 'miss'); }
        else {
          let dmgMul = 1;
          if (r.drake) {
            if (sp.dmg) { dmgMul = 2; G.ui.log('<b class="c-drake">Drake!</b> Dobbel effekt.'); }
            else { this.vp = Math.min(this.maxVP, this.vp + cost); G.ui.log('<b class="c-drake">Drake!</b> Besvärjelsen koster ingen VP.'); }
            G.audio.drake();
            G.fx.float('DRAKE!', this.pos, 'drake big', 2.4);
          }
          G.ui.logRoll(r, `${sp.name} (effektgrad ${pl}).`);
          this.spellEffect(id, pl, target, dmgMul);
        }
        if (bodyDmg) this.applyHit({ value: bodyDmg, ignoreArmor: true, who: 'Magien', verb: 'river i' });
      });
    } };
    G.fx.ring(this.pos, 2, 0xb08aff, 0.3, 0.2);
    G.audio.swing(0.4, 0.2);
  }

  spellDmg(sp, pl, mul = 1) {
    let expr = sp.dmg;
    for (let i = 1; i < pl; i++) if (sp.per) expr += '+' + sp.per;
    let v = rollDice(expr);
    if (mul > 1) v += rollDice(expr);
    return v;
  }

  spellEffect(id, pl, target, mul = 1) {
    const sp = SPELLS[id];
    const P = this.pos;
    if (sp.kind === 'bolt') {
      G.world.spawnPlayerProjectile('fireball', P, this.aimDir.clone(), { speed: 20, life: 1.0, spell: { dmg: this.spellDmg(sp, pl, mul), burn: true, type: 'fire' } });
    } else if (sp.kind === 'cone') {
      G.fx.slash(P, this.yaw, 10, 0.93, 1, 0xd0f0ff, 0.6, 0.3);
      G.fx.burst('dust', { x: P.x + this.aimDir.x * 3, z: P.z + this.aimDir.z * 3 }, 30, this.aimDir);
      for (const e of G.enemies) {
        if (e.dead) continue;
        const dx = e.pos.x - P.x, dz = e.pos.z - P.z, dd = Math.hypot(dx, dz);
        if (dd > 10 + e.radius || (dd > 0.5 && (dx * this.aimDir.x + dz * this.aimDir.z) / dd < Math.cos(0.47))) continue;
        let n = rollDice(`${1 + pl}D4`);
        if (mul > 1) n += rollDice(`${1 + pl}D4`);
        tmp.set(dx, 0, dz).normalize();
        const k = e.def.boss ? 0.15 : 1;
        e.vel.addScaledVector(tmp, n * 3.5 * k);
        e.takeHit(n, tmp, 0, { stun: e.def.boss ? 0 : 0.6, type: 'b', src: 'player' });
      }
    } else if (sp.kind === 'nova') {
      const R = 4 * pl;
      G.fx.ring(P, R, 0x9ad8ff, 0.5, 0.3);
      G.fx.burst('heal', P, 30);
      for (const e of G.enemies) {
        if (e.dead || Math.hypot(e.pos.x - P.x, e.pos.z - P.z) > R + e.radius) continue;
        tmp.set(e.pos.x - P.x, 0, e.pos.z - P.z).normalize();
        e.takeHit(d(6) * mul, tmp, 0, { ignoreArmor: true, type: 'cold', src: 'player' });
        if (!e.dead && !e.def.boss) e.freeze?.(2 + pl);
      }
    } else if (sp.kind === 'chain') {
      const a = this.spellDmg(sp, pl, mul);
      G.world.lightning(P, target.pos);
      tmp.set(target.pos.x - P.x, 0, target.pos.z - P.z).normalize();
      target.takeHit(a, tmp, 2, { type: 'lightning', ignoreMetal: true, src: 'player' });
      const second = G.enemies.filter(e => !e.dead && e !== target && Math.hypot(e.pos.x - target.pos.x, e.pos.z - target.pos.z) < 4.5)[0];
      if (second) {
        G.world.lightning(target.pos, second.pos);
        second.takeHit(rollDice(`${1 + pl}D4`) * mul, tmp, 1, { type: 'lightning', src: 'player' });
      }
      G.audio.hit(true);
    } else if (sp.kind === 'heal') {
      const n = this.spellDmg(sp, pl, mul);
      this.heal(n);
      if (this.dying) { this.dying = null; G.game.hideDying(); }
    } else if (sp.kind === 'root') {
      if (target.def.monster) { G.ui.log('Snärjande rötter virker ikke på monstre.'); return; }
      target.root?.(2 + 2 * pl, pl);
    } else if (sp.kind === 'smite') {
      if (!target.def.undead) { G.ui.log(`${target.def.name} er ikke overjordisk. Bannlysa virker ikke.`); G.fx.float('Ingen virkning', target.pos, 'miss'); return; }
      tmp.set(target.pos.x - P.x, 0, target.pos.z - P.z).normalize();
      G.fx.burst('portal', target.pos, 20);
      G.world.lightning(new THREE.Vector3(target.pos.x, 8, target.pos.z), target.pos, 0xfff0b0);
      target.takeHit(this.spellDmg(sp, pl, mul), tmp, 2, { ignoreArmor: true, type: 'holy', src: 'player' });
    } else if (sp.kind === 'buff') {
      this.fx[id] = { t: sp.dur, pl };
      G.fx.ring(P, 2.2, 0xb08aff, 0.5, 0.5);
      G.ui.log(`${sp.name} virker i ${sp.dur} sekunder.`);
      this.recalc();
    } else if (sp.kind === 'lift') {
      if (target.def.boss) { G.ui.log('Rødpels er for tung å løfte.'); return; }
      target.lift?.(3, pl);
    } else if (sp.kind === 'object') {
      if (!G.world.shatterNear(P, 3, pl)) G.fx.float('Ingenting å knuse', P, 'miss');
    }
  }

  magicMishap(r, sp, pl) {
    const n = d(20);
    const m = fromRange(MAGIC_MISHAP, n);
    G.ui.logRoll(r, `<b class="c-demon">Demon!</b> Magiskt missöde (${n}): ${m.name}. ${m.game}`);
    G.fx.float('DEMON!', this.pos, 'demon big');
    G.audio.demon();
    G.post?.flash(0x8020ff, 0.25);
    if (n <= 6) this.addCond(['OMT', 'UTM', 'KRA', 'ARG', 'RAD', 'UPP'][n - 1]);
    else if (n === 7) this.applyHit({ value: rollDice(`${pl}D6`), ignoreArmor: true, who: 'Magien', verb: 'brenner i' });
    else if (n === 8) this.vp = Math.max(0, this.vp - rollDice(`${pl}D6`));
    else if (n === 9) { this.addCond('KRA'); this.curse.noRegen = true; }
    else if (n === 10) { const others = this.spells.filter(s => s !== sp); if (others.length) this.spellEffect(others[Math.floor(Math.random() * others.length)], pl, this.aimedEnemy(15)); }
    else if (n === 11) this.curse.frog = true;
    else if (n === 12) this.curse.gold = true;
    else if (n === 13) this.blind = 20;
    else if (n === 14) G.dungeon.explored.fill(0);
    else if (n === 15) { const e = this.nearestEnemy(12); if (e) { if (sp.kind === 'heal') { e.kp = Math.min(e.maxKP, e.kp + 6); G.fx.burst('heal', e.pos, 12); } else e.takeHit(d(6), new THREE.Vector3(), 0, { src: 'player' }); } }
    else if (n === 16) { if (sp.kind === 'heal') this.applyHit({ value: rollDice('2D6'), ignoreArmor: true, who: 'Magien', verb: 'vrir seg mot' }); else this.applyHit({ value: rollDice(sp.dmg || '2D6'), ignoreArmor: true, who: sp.name, verb: 'slår tilbake mot' }); }
    else if (n === 17) this.becomeAnimal(20);
    else if (n === 18 || n === 19) { this.ageShift += n === 18 ? -1 : 1; this.recalc(); G.ui.log(`${this.name} er plutselig ${n === 18 ? 'yngre' : 'eldre'}.`); }
    else G.game.summonDemon();
  }

  becomeAnimal(sec) {
    this.animal = sec;
    if (this.model) this.model.visible = false;
    const rat = G.game.buildRatModel?.();
    if (rat) { rat.scale.setScalar(1.6); this.bob.add(rat); this.animalModel = rat; }
    G.fx.burst('smoke', this.pos, 20);
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
      } else if (a.type === 'stumble' || a.type === 'stuck') {
        roll = Math.sin(p * Math.PI) * 0.6;
        pitch = Math.sin(p * Math.PI) * 0.5;
      }
    }
    if (this.chanRest) { bobY = -0.15; pitch = 0.1; }
    if (this.downed || this.dying) {
      roll = THREE.MathUtils.lerp(this.tilt.rotation.z, this.dying ? 0.5 : 1.35, Math.min(1, dt * 6));
      pitch = 0;
      twist = 0;
      bobY = -0.1;
    }
    const k = Math.min(1, dt * 22);
    this.tilt.rotation.x += (pitch - this.tilt.rotation.x) * k;
    this.tilt.rotation.y = a && (a.type === 'spin' || (a.type === 'attack' && !this.rig) || a.type === 'throw') ? twist : this.tilt.rotation.y + (twist - this.tilt.rotation.y) * k;
    this.tilt.rotation.z = this.downed || this.dying ? roll : this.tilt.rotation.z + (roll - this.tilt.rotation.z) * k;
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
    // kantlys: varmt normalt, rødt ved raseri, fiolett ved sniking, blått ved vakt
    const rim = this.fxU.uRim.value;
    if (this.fx.barsark > 0 || this.armed === 'vresig') rim.setRGB(1.2, 0.18, 0.05);
    else if (this.stealth > 0) rim.setRGB(0.25, 0.15, 0.45);
    else if (this.guard > 0) rim.setRGB(0.3, 0.5, 0.9);
    else if (this.charge) rim.setRGB(0.5, 0.3, 1.0);
    else if (this.armed) rim.setRGB(0.5, 0.42, 0.2);
    else rim.setRGB(0.32, 0.24, 0.16);
    this.fxU.uFlash.value = this.flash > 0 ? 1.4 : 0;
  }

  animateDuckHands(a, p, ease) {
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
      } else if (a.kind === 'fist' || a.kind === 'knife') {
        const arm = s === 1 ? 'L' : 'R';
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
    if (this.chanRest) { hipY = -0.45; legL = -1.4; legR = -1.4; kneeL = 1.6; kneeR = 1.6; shR = -0.4; shL = -0.4; }
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

function w_sub(w) { return !!w?.f?.includes('sub'); }
function baseChanceOf(v) { return v <= 5 ? 3 : v <= 8 ? 4 : v <= 12 ? 5 : v <= 15 ? 6 : 7; }
void WEAKNESS;
void INJURIES;
void tStr;
void KIN_ABILITIES;
