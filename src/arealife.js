// Livet i områdene i Edelfara: folk, utganger, ting å undersøke, svartfolket, allierte soldater,
// fristen og slagene. Bygger på TownLife (townfolk.js), så samtaler og døgnrytme virker som i Fristaden.
import * as THREE from 'three';
import { G, T } from './state.js';
import { TownLife, hourOf } from './townfolk.js';
import { PEOPLE_BY_AREA, scene } from './edelfolk.js';
import { Q, has, fl, flag, clue, item, give, take, started, startQuest, proofs, hoursLeft } from './ivan.js';
import { rollDice, d, clRoll } from './rules.js';
import { WEAPONS } from './dod.js';
import { makeCons, giveItem } from './inventory.js';
import { weaponItem, makeItem, refinalize, questAmulet } from './loot.js';
import { buildCharacter, buildWeaponMesh, HOLD } from './kinmodels.js';
import { buildChest } from './assets.js';
import { Enemy } from './enemies.js';

const U = v => v * T;
const tmp = new THREE.Vector3();

// Rykter i vertshusene (modulen s. 3-6, med noen av spillets egne)
const RUMORS = {
  sortmund: [
    'De sier Riddar Kettil kunne slåss for fem. De sier også at han drakk for ti.',
    'Markisen har ikke sovet siden kisten forsvant. Kokka sier han teller sølvskjeene om natta.',
    'Baron Eke var forelsket i den unge grevinnen, vettu. Hun valgte markisen. Eller faren valgte for henne.',
    'Folk sier det var Eken. Folk sa det samme om tørken i fjor.',
    'Bøndene i Eke kaller svartfolket lortinger. De sier lortingene har vært ute mer enn vanlig i år.',
  ],
  akershus: [
    'Grevens menn tok sauene til Torgils. De kalte det forsyninger.',
    'Ingen i hele Eke heter Ererik. Det har vi spurt om før.',
    'Lys i skogen sør for elva om natta. Kolbrennere, sier noen. Ingen brenner kol i den skogen.',
    'Baronen tar ikke ut mer skatt enn han trenger. Det er derfor han er fattig, og derfor vi liker ham.',
  ],
  glimming: [
    'Greven holdt fest i tre dager forrige måned. Hjortene i skogen holdt fest da han dro.',
    'Hovmesteren fikk et brev fra nord, sier de. Han kastet det på ilden og angret seg etterpå.',
    'Her i Glimming tror vi ikke alt greven sier. Det er sunt å bo nær nok til å høre ham.',
  ],
};

// Hvor du kommer ut når du reiser hit fra et annet sted
export const ARRIVE = {
  ekeskogen: { fristaden: 'west', sortmund: 'east', akershus: 'south' },
  sortmund: { ekeskogen: 'west', glimming: 'east' },
  akershus: { ekeskogen: 'east', lagret: 'south' },
  glimming: { sortmund: 'south', pharynx: 'east' },
  lagret: { akershus: 'north' },
};

// --- grevens soldater som slåss på din side ----------------------------------------------------
class Ally {
  constructor(life, o) {
    this.life = life;
    this.name = o.name;
    this.knight = !!o.knight;
    const sheet = { id: 'ally-' + o.id, kin: 'manniska', profession: o.knight ? 'riddare' : 'krigare', age: o.age || 'medel', clothes: o.knight ? { top: 0x2a2a34, cape: 0xd8dce4 } : { top: 0x2a2a34 } };
    const c = buildCharacter(sheet, { armor: o.knight ? { type: 'plat' } : { type: 'ring' }, helmet: { hid: o.knight ? 'tunnhjalm' : 'oppenhjalm' } });
    this.rig = c.rig;
    this.root = new THREE.Group();
    this.root.add(c.root);
    const wid = o.weapon || 'bredsvard';
    this.w = WEAPONS[wid];
    const wm = buildWeaponMesh(weaponItem(wid));
    wm.rotation.x = HOLD[this.w.kind] ?? -0.35;
    c.rig.handR.add(wm);
    if (G.gfx) this.root.add(G.gfx.blobFor(0.38, 0.5));
    this.pos = this.root.position;
    this.pos.set(o.x, 0, o.z);
    this.yaw = o.yaw || 0;
    G.scene.add(this.root);
    // soldat: grundegenskaper 12, bredsvärd 60 % CL = FV 12, 11 KP (s. 9). Riddere: FV 14, 14 KP (s. 11).
    this.kp = o.knight ? 14 : 11;
    this.fv = o.knight ? 14 : 12;
    this.sb = 'D4';
    this.abs = o.knight ? 6 : 4;
    this.cd = 0.5 + Math.random();
    this.hitCD = 1 + Math.random();
    this.walk = Math.random() * 6;
    this.swing = 0;
    this.dead = false;
    this.slot = o.slot || 0;
    this.target = null;
  }

  update(dt) {
    if (this.dead) { this.root.rotation.z += (1.45 - this.root.rotation.z) * Math.min(1, dt * 6); return; }
    const P = G.player;
    this.cd -= dt;
    this.hitCD -= dt;
    // nærmeste fiende innen synsvidde
    let best = null, bd = 24;
    for (const e of G.enemies) {
      if (e.dead || e.fleeing || e.def.leader && e.type === 'lekh_ulv') continue;
      const dd = Math.hypot(e.pos.x - this.pos.x, e.pos.z - this.pos.z);
      if (dd < bd && (dd < 9 || G.dungeon.los(this.pos.x, this.pos.z, e.pos.x, e.pos.z))) { bd = dd; best = e; }
    }
    this.target = best;
    let sp = 0;
    if (best) {
      if (!best.alerted && bd < 14) best.alert('ally');
      tmp.set(best.pos.x - this.pos.x, 0, best.pos.z - this.pos.z);
      const reach = 1.5 + best.radius;
      if (bd > reach) {
        if (G.dungeon.los(this.pos.x, this.pos.z, best.pos.x, best.pos.z)) tmp.normalize();
        else if (!G.dungeon.flowDir(this.pos.x, this.pos.z, tmp)) tmp.set(0, 0, 0);
        sp = 3.4;
      } else {
        tmp.normalize();
        best.engagedBy = this;
        if (this.cd <= 0) this.strike(best);
        // fienden slår tilbake mot den som står foran den
        if (this.hitCD <= 0 && best.alerted && !best.immobile?.() && best.state !== 'stagger') {
          this.hitCD = 1.4 + Math.random() * 0.9;
          this.takeBlow(best);
        }
      }
      this.yaw = Math.atan2(best.pos.x - this.pos.x, best.pos.z - this.pos.z);
    } else {
      // følg spilleren i en løs flokk
      const a = this.slot * 1.1 + 2.4;
      const fx = P.pos.x + Math.cos(a) * 3.2, fz = P.pos.z + Math.sin(a) * 3.2;
      tmp.set(fx - this.pos.x, 0, fz - this.pos.z);
      const dd = tmp.length();
      if (dd > 1.2) {
        if (G.dungeon.los(this.pos.x, this.pos.z, fx, fz)) tmp.normalize();
        else if (!G.dungeon.flowDir(this.pos.x, this.pos.z, tmp)) tmp.set(0, 0, 0);
        sp = dd > 8 ? 4.2 : 2.8;
        this.yaw = Math.atan2(tmp.x, tmp.z);
      }
    }
    if (sp > 0) {
      this.pos.x += tmp.x * sp * dt;
      this.pos.z += tmp.z * sp * dt;
      G.dungeon.collide(this.pos, 0.4);
    }
    for (const o of this.life.allies) {
      if (o === this || o.dead) continue;
      const dx = this.pos.x - o.pos.x, dz = this.pos.z - o.pos.z, dd = Math.hypot(dx, dz);
      if (dd < 0.8 && dd > 1e-4) { this.pos.x += dx / dd * (0.8 - dd) * 0.5; this.pos.z += dz / dd * (0.8 - dd) * 0.5; }
    }
    this.root.rotation.y = this.yaw;
    this.animate(dt, sp);
  }

  strike(e) {
    this.cd = 1.5 + Math.random() * 0.8;
    this.swing = 0.35;
    const r = clRoll(this.fv, this.fv);
    G.audio.swing?.(0.7, 0.2);
    if (!r.success) return;
    const dmg = rollDice(this.w.dmg) + rollDice(this.sb) + (r.perfekt ? rollDice(this.w.dmg) : 0);
    tmp.set(e.pos.x - this.pos.x, 0, e.pos.z - this.pos.z).normalize();
    e.takeHit(dmg, tmp.clone(), 3, { src: 'ally', type: this.w.types?.[0] || 's' });
  }

  takeBlow(e) {
    const atk = e.mainAttack();
    const r = clRoll(atk.fv || e.fv, atk.fv || e.fv);
    if (!r.success) return;
    const dmg = Math.max(0, rollDice(atk.dmg) + (e.sb && !atk.natural ? rollDice(e.sb) : 0) - this.abs);
    if (!dmg) return;
    this.kp -= dmg;
    G.fx.burst('blood', { x: this.pos.x, y: 1.1, z: this.pos.z }, 6);
    G.fx.float(String(dmg), this.pos, 'dmg', 1.9);
    if (this.kp <= 0) {
      this.dead = true;
      if (e.engagedBy === this) e.engagedBy = null;
      G.ui.log(`${this.name} faller.`);
    }
  }

  animate(dt, sp) {
    const r = this.rig;
    if (!r) return;
    this.walk += dt * sp * 3.4;
    const w = Math.min(1, sp / 2);
    const k = Math.min(1, dt * 10);
    const L = (o, key, v) => { o.rotation[key] += (v - o.rotation[key]) * k; };
    L(r.legL, 'x', Math.sin(this.walk) * 0.6 * w); L(r.legR, 'x', -Math.sin(this.walk) * 0.6 * w);
    this.swing = Math.max(0, this.swing - dt);
    L(r.shR, 'x', this.swing > 0 ? -2.2 + (0.35 - this.swing) * 7 : -0.4);
    L(r.elR, 'x', -0.5);
  }

  dispose() { G.scene.remove(this.root); }
}

// --- livet i et område -----------------------------------------------------------------------
export class AreaLife extends TownLife {
  constructor(area, W) {
    super(area, W, PEOPLE_BY_AREA[area.areaId] || []);
    this.area = area;
    this.id = area.areaId;
    this.L = area.L;
    this.allies = [];
    this.exits = [];
    this.visit.rumorList = RUMORS[this.id] || RUMORS.sortmund;
    this.setup();
  }

  // Fristadens faste ting finnes ikke her
  addFixtures() {}

  clang(npc) {
    const P = G.player;
    if (Math.hypot(npc.pos.x - P.pos.x, npc.pos.z - P.pos.z) > 14) return;
    G.audio.clang?.();
    G.fx.burst('spark', { x: npc.pos.x + Math.sin(npc.yaw) * 0.6, y: 0.9, z: npc.pos.z + Math.cos(npc.yaw) * 0.6 }, 6);
  }

  setup() {
    const L = this.L, A = this.area;
    const q = Q();
    q.dead[this.id] = q.dead[this.id] || [];
    for (const ex of L.exits || []) {
      const it = this.add(U(ex.x), U(ex.y), 1.0, ex.label, () => this.useExit(ex), { kind: 'exit', reach: 1.7 });
      it.exit = ex;
      this.exits.push(it);
    }
    this.checkStorm(true);
    const f = this['setup_' + this.id];
    if (f) f.call(this);
    if (this.id === 'akershus' && fl('storm') === 'fallen') this.ruins();
    // svartfolk og andre fiender etter hvor langt oppdraget er kommet
    A.spawnList = (this.spawns() || []).filter(s => !q.dead[this.id].includes(s.id));
  }

  // --- utganger ------------------------------------------------------------------------------
  exitOpen(ex) {
    if (!ex.need) return true;
    if (ex.need === 'trail') return true; // stien vises alltid. Om du finner sporet, er et slag (useExit)
    return true;
  }

  useExit(ex) {
    if (G.state !== 'play' || G.game.wiping) return;
    if (ex.flavor) { G.ui.log(ex.flavor); return; }
    if (ex.to === 'pharynx' && !started()) { G.ui.log('Pharynx er hertigens by, ti timer østover. Du har ingen grunn til å dra dit ennå.'); return; }
    const P = G.player;
    const fight = G.enemies.some(e => !e.dead && e.alerted && !e.fleeing && Math.hypot(e.pos.x - P.pos.x, e.pos.z - P.pos.z) < 7);
    if (fight) { G.ui.log('Ikke nå. Noen er rett bak deg.'); G.fx.float('Kamp', P.pos, 'miss'); return; }
    if (ex.need === 'castle_sm') {
      if (!item('lejdebrev') && !started()) {
        G.ui.log('Vaktene ved borgveien stopper deg. «Markisen tar ikke imot. Har du nyheter om mordet, eller noe med segl på, kan du komme igjen.»');
        return;
      }
      if (!fl('smCastleTold')) { flag('smCastleTold'); G.ui.log('Vaktene ved borgveien ser hertigens segl og slipper deg opp.'); }
    }
    if (ex.need === 'castle_ak') {
      if (!item('lejdebrev')) {
        G.ui.log('Grevens soldater sperrer stien. «Ingen går opp uten grevens tillatelse. Eller hertigens, hvis du har noe sånt.»');
        return;
      }
      if (!fl('akCastleTold')) {
        flag('akCastleTold');
        G.ui.log('Soldatene slipper deg forbi når de ser hertigens segl. Halvveis opp suser en pil forbi øret ditt. Du holder lejdebrevet høyt og roper. Porten åpnes på gløtt, og du gir fra deg våpnene før de slipper deg inn.');
      }
    }
    if (ex.need === 'trail' && !fl('trail')) {
      // et normalt Spåra-slag finner veien til leiren (s. 9). Ett forsøk i timen.
      if (q_last() && G.run.clock - q_last() < 1) { G.ui.log('Du har nettopp lett her. Prøv igjen om en stund, når lyset har snudd.'); return; }
      Q().flags.trailTry = G.run.clock;
      const r = P.roll('Spåra', { label: 'Spåra' });
      G.run.clock += 0.25;
      if (!r.success) { G.ui.logRoll(r, 'Tråkket deler seg og forsvinner mellom trærne. Du finner ikke noe å følge.'); return; }
      G.ui.logRoll(r, 'Tråkket er ikke et dyretråkk. Store fotspor, ulvespor og knekte kvister. Det går sørover.');
      flag('trail');
      clue('spor');
    }
    G.audio.ui();
    if (ex.area) G.game.goArea(ex.area, ex.arrival);
    else G.game.travelTo(ex.to, this.id);
  }

  // --- faste ting per område -------------------------------------------------------------------
  setup_ekeskogen() {
    const A = this.area;
    // den døde kureren
    const body = this.corpse(U(18.6), U(15.9), 0.4, { top: 0x2a6a2a, pants: 0x3a2a1a }, 'kurir');
    void body;
    const hat = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.2, 10), new THREE.MeshStandardMaterial({ color: 0x2a6a2a, roughness: 0.9 }));
    hat.position.set(U(18.6) - 1.0, 0.1, U(15.9) - 0.1);
    hat.rotation.z = 1.4;
    A.group.add(hat);
    this.add(U(18.6), U(15.9), 0.9, 'Undersøk den døde mannen', () => this.talk.open(scene('kurir', this)));
    if (!item('lejdebrev')) {
      const pk = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.12, 0.32), new THREE.MeshStandardMaterial({ color: 0x0c0a0a, roughness: 0.5, metalness: 0.2 }));
      pk.position.set(U(20.4), 0.06, U(16.2));
      pk.rotation.y = 0.6;
      A.group.add(pk);
      this.packMesh = pk;
      this.packIt = this.add(U(20.4), U(16.2), 0.6, 'Plukk opp den svarte pakken', () => {
        startQuest();
        give('lejdebrev');
        this.packMesh.visible = false;
        this.packIt.label = null;
        this.packIt.onUse = null;
        this.talk.open(scene('depesch', this));
      });
    }
    // papirbiter på veien mot Akershus
    const paper = new THREE.MeshStandardMaterial({ color: 0xe8dcc0, roughness: 0.95 });
    for (const [x, z] of [[24.4, 30.4], [25.6, 30.8], [27.4, 31.4], [29.6, 32.6], [31.6, 33.8], [33.6, 34.8]]) {
      const pp = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.16).rotateX(-Math.PI / 2), paper);
      pp.position.set(U(x), 0.02, U(z));
      pp.rotation.y = x;
      A.group.add(pp);
    }
    this.add(U(24.4), U(30.4), 0.6, 'Plukk opp papirbiten', () => this.talk.open(scene('papir', this)));
    this.add(U(34.6), U(11.4), 1.4, 'Se på den nedbrente koia', () => {
      if (!fl('ruinSeen')) {
        flag('ruinSeen');
        const r = G.player.roll('Spåra', { label: 'Spåra' });
        G.ui.logRoll(r, r.success ? 'Orchespor rundt asken, mange dager gamle. De går sørover, mot Akershus.' : 'Aske og forkullede stokker. Den som bodde her, er borte.');
        if (r.success && !has('svartfolk')) { clue('svartfolk', true); G.ui.log('<b class="c-mark">Ledetråd:</b> Orcher brente skogshuggerens koie. Sporene går sørover.'); }
      } else G.ui.log('Aske og forkullede stokker. Det lukter fortsatt røyk.');
    });
  }

  setup_sortmund() {
    // Riddar Kettil på båren i kapellet
    this.corpse(U(4.6), U(8.05), 0.47, { top: 0x5a5a62, pants: 0x2a2a30 }, 'kettil', { armor: { type: 'ring' } });
    const flowers = new THREE.MeshStandardMaterial({ color: 0xe8d070, roughness: 0.6 });
    for (let i = 0; i < 8; i++) {
      const fl0 = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 4), i % 2 ? flowers : new THREE.MeshStandardMaterial({ color: 0xd06a8a, roughness: 0.6 }));
      fl0.position.set(U(4.3) + (i % 2) * U(0.6), 0.5, U(7.3) + Math.floor(i / 2) * U(0.42));
      this.area.group.add(fl0);
    }
    this.add(U(5.3), U(8.0), 0.6, 'Undersøk Riddar Kettils lik', () => this.talk.open(scene('kettil', this)));
    // plakatene
    for (const [x, y] of [[6.5, 18.6], [21.05, 15.4], [28.8, 15.6]]) {
      this.add(U(x), U(y), 0.5, 'Les plakaten', () => this.talk.open({ id: 'poster', name: 'Efterlyses', title: 'plakat fra markisen', board: true, start: [], topics: {}, greet: () => 'EFTERLYSES. Den som kan gripe den eller de voldsmenn som tok livet av Riddar [Kettil] Ormstunga, er lovet en belønning på TI GULLMYNT. Markis Kristierne Ettilesson Ridderskors.' }));
    }
  }

  setup_akershus() {
    // arbalesten ved teltet til Riddar Hjalmar
    const ab = buildWeaponMesh(weaponItem('arbalest'));
    ab.position.set(U(19.7), 0.72, U(17.65));
    ab.rotation.set(-0.3, 0.5, 0.1);
    this.area.group.add(ab);
    const rack = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.5, 0.12), new THREE.MeshStandardMaterial({ color: 0x4a3020, roughness: 0.85 }));
    rack.position.set(U(20.3), 0.25, U(17.5));
    this.area.group.add(rack);
    this.add(U(19.9), U(17.4), 0.6, 'Se på arbalesten ved teltet', () => {
      clue('arbalest');
      G.ui.log('En tung arbalest står lent mot teltduken. I et stativ ved siden av står fem piler med hullinger og grå fjær.');
    });
    this.add(U(35.6), U(28.0), 0.8, 'Se på vannhjulet', () => G.ui.log('Hjulet går tungt og jevnt i strømmen. Kvarnen maler for hele Eke. Vinden når ikke inn i skogen, så det er elva som gjør jobben.'));
  }

  setup_lagret() {
    const A = this.area;
    // kisten under bjørneskinn i Lekhs telt (s. 12)
    const x = U(23.0), z = U(17.8);
    const fur = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.18, 1.0), new THREE.MeshStandardMaterial({ color: 0x3a2a1e, roughness: 1 }));
    fur.position.set(x, 0.32, z);
    if (fl('chest') !== 'carried' && fl('chest') !== 'returned' && fl('chest') !== 'stolen') {
      const ch = buildChest();
      ch.position.set(x, 0, z);
      ch.scale.setScalar(0.9);
      A.group.add(ch);
      this.chestMesh = ch;
      fur.position.y = 0.72;
    }
    A.group.add(fur);
    this.furMesh = fur;
    this.chestIt = this.add(x, z + 0.9, 0.6, fl('chest') ? 'Bjørneskinnene' : 'Løft bjørneskinnene', () => this.openChest());
    this.add(U(24.4), U(16.6), 0.5, 'Lekhs papirer', () => {
      clue('lekh');
      G.ui.log('Under en stein i teltet ligger noen ark. Et av dem er et utkast til et brev, skrevet med stygg, sprikende skrift og mange stavefeil: «Til hovmester på Glimming. Jeg Styrbiorn, sønn av greven av Ulfvenberg, kommer på besøk...» Det andre er et kart over Akershus med borgen strøket over.');
      if (has('styrbiorn')) G.ui.log('Samme håndskrift som brevet hovmesteren på Glimming beskrev. Det var Lekh som ga greven ideen til jakten.');
    });
    if (!has('leir')) { clue('leir'); flag('campSeen'); }
    if (fl('truce') && !fl('peace')) {
      this.spawnAllies({ x: U(11.6), z: U(4.2) });
      G.ui.log('Grevens soldater kommer etter deg ned stien. Riddar Ulfmar trekker sverdet. «Ingen nåde for lortinger.»');
    }
  }

  // en død eller sovende kropp på bakken (kureren, Kettil)
  corpse(x, z, y, clothes, id, gear = {}) {
    const c = buildCharacter({ id: 'corpse-' + id, kin: 'manniska', profession: 'krigare', age: 'medel', clothes }, { armor: gear.armor || null });
    const g = c.root;
    g.position.set(x, y, z);
    g.rotation.x = -Math.PI / 2;
    g.rotation.z = 0.2;
    c.rig.shL.rotation.z = 0.3; c.rig.shR.rotation.z = -0.3;
    this.area.group.add(g);
    this.area.addBlock(x - 0.4, z - 0.9, x + 0.4, z + 0.9);
    return g;
  }

  // --- svartfolket --------------------------------------------------------------------------------
  spawns() {
    const out = [];
    const P = G.player;
    const add = (type, x, y, id, setup) => out.push({ type, x: U(x), z: U(y), id, depth: 1, setup });
    if (this.id === 'ekeskogen') {
      if (fl('peace')) return out;
      // de fem orchene som vokter veien (s. 6-7)
      add('orc_lead', 36.6, 36.2, 'lead');
      add('orc_band', 35.0, 35.0, 'b1'); add('orc_band', 38.2, 35.4, 'b2'); add('orc_band', 37.4, 37.8, 'b3'); add('orc_band', 34.8, 37.2, 'b4');
    } else if (this.id === 'lagret') {
      if (fl('peace') || fl('storm')) return out;
      const h = hourOf(G.run.clock);
      const meal = (h >= 18 && h < 20) || (h >= 7 && h < 8);
      const night = h >= 22 || h < 5;
      this.campNight = night;
      if (fl('truce')) {
        // med grevens soldater: bare de disiplinerte orchene og svartalfene slåss, Lekh flykter (s. 9)
        for (const [x, y, i] of [[20, 22, 1], [26, 22, 2], [23, 26, 3], [18, 27, 4], [28, 27, 5], [23, 20, 6]]) add('orc_elite', x, y, 'e' + i);
        for (const [x, y, i] of [[21.4, 19.6, 1], [24.6, 19.6, 2], [22, 15, 3], [24, 15, 4], [16, 21, 5], [30, 21, 6]]) add('svartalf', x, y, 's' + i);
        for (const [x, y, i] of [[14, 29, 1], [33, 29, 2], [23, 31, 3], [19, 24, 4]]) add('orc_camp', x, y, 'c' + i, e => { e.campRunner = true; });
        add('lekh', 23.4, 21.4, 'lekh');
        add('ulv', 34.2, 12.6, 'w1'); add('ulv', 33.4, 13.6, 'w2');
        return out;
      }
      // alene: vakter to og to, flere ved bålene ved utspisning (s. 12)
      const sentries = meal ? [[18.6, 23.6, 1], [19.6, 25.8, 2], [27.6, 23.8, 3], [28.8, 26.0, 4]] : [[13.6, 13.0, 1], [15.0, 12.4, 2], [31.2, 16.4, 3], [32.4, 17.4, 4]];
      for (const [x, y, i] of sentries) add('svartalf', x, y, 's' + i, e => { e.sentry = true; });
      add('svartalf', 21.2, 19.8, 's5'); add('svartalf', 24.8, 19.8, 's6');
      add('lekh', night ? 23.0 : 23.4, night ? 18.4 : 22.4, 'lekh', e => { if (night) e.asleep = 9999; });
      if (!night) {
        for (const [x, y, i] of [[20, 26, 1], [26.8, 25.6, 2], [16.4, 22.4, 3]]) add('orc_elite', x, y, 'e' + i);
        for (const [x, y, i] of [[14, 29, 1], [33, 29, 2], [22.6, 32.4, 3]]) add('orc_camp', x, y, 'c' + i);
        add('orc_xbow', 17.0, 18.6, 'x1'); add('orc_xbow', 29.4, 18.8, 'x2');
      }
      add('ulv', 34.2, 12.6, 'w1'); add('ulv', 33.4, 13.6, 'w2');
    } else if (this.id === 'akershus') {
      if (fl('storm') === 'fallen') {
        // etter stormingen: svartfolket plyndrer det som er igjen
        for (const [x, y, i] of [[22, 22, 1], [28, 24, 2], [30, 36, 3], [16, 22, 4]]) add('orc_camp', x, y, 'r' + i);
        add('svartalf', 24, 19, 'rs1'); add('orc_xbow', 33, 31, 'rx1');
      }
    }
    void P;
    return out;
  }

  onEnemyDied(e) {
    const q = Q();
    if (e.spawnIdx != null && !q.dead[this.id].includes(e.spawnIdx)) q.dead[this.id].push(e.spawnIdx);
    const x = e.pos.x, z = e.pos.z;
    if (e.type === 'orc_lead') {
      this.add(x, z, 0.7, 'Gjennomsøk ledarorchen', () => this.talk.open(scene('ledare', this)));
    } else if (e.def.group === 'svartfolk' && e.type.startsWith('orc') && !fl('fangeDone') && !fl('fangeSpot')) {
      // en orch som faller med 0 KP i bröstkorg eller mage, eller slått medvetslös, lever en stund til
      if (e.deathHow === 'fall' || e.deathHow === 'ko') {
        flag('fangeSpot');
        this.add(x, z, 0.7, 'Forhør den sårede orchen', it => { if (fl('fangeDone')) { it.label = null; G.ui.log('Han er død. Han bet tungen av seg.'); return; } this.talk.open(scene('fange', this)); });
      }
    }
    if (e.type === 'lekh' || e.type === 'lekh_ulv') {
      flag('lekh', 'dead');
      clue('lekh');
      G.ui.hideBoss();
      G.ui.log('<b class="c-boss">Lekh er død.</b> Svartfolket har mistet hodet sitt.');
      G.player.addHjp?.(3, 'Lekh er felt');
      G.world.spawnPickup('item', x, z, { item: weaponItem('arbalest', { name: 'Lekhs arbalest', rarity: 'sjelden', flavor: 'Tung, svart og stygg. Pilen går gjennom ringbrynje på kort hold. Det vet Riddar Kettil.' }) });
      // uten Lekh flykter resten (s. 9: «vid tecken på motgång flyr alla»). De som ikke flykter, kommer.
      for (const o of G.enemies) if (!o.dead && o.def.group === 'svartfolk') { o.alert('alarm'); if (!o.def.noMoral) o.moralCheck(-8, 'Lekh er falt'); }
      this.checkPeace();
    }
    if (this.id === 'lagret') this.checkPeace();
  }

  checkPeace() {
    if (fl('peace') || this.id !== 'lagret' && this.id !== 'akershus') return;
    // de som fortsatt slåss: svartalfer, elitorcher og Lekh. Spredte vakter langt unna teller ikke.
    const P = G.player;
    const fighters = G.enemies.filter(e => !e.dead && !e.fleeing && !e.escaped && e.def.group === 'svartfolk' && (e.type === 'svartalf' || e.type === 'orc_elite' || e.def.leader)
      && (e.alerted || Math.hypot(e.pos.x - P.pos.x, e.pos.z - P.pos.z) < 20));
    const lekhGone = fl('lekh') === 'dead' || fl('lekh') === 'fled';
    if (!lekhGone || fighters.length) return;
    flag('peace');
    if (this.battle) flag('storm', 'defended');
    G.ui.log('<b class="c-mark">Svartfolket er drevet tilbake.</b> De som er igjen, flykter inn i Torilskogen. Grevens soldater jubler. Noen av dem gråter.');
    G.player.addHjp?.(2, 'svartfolket er drevet tilbake');
    G.audio.drake?.();
    if (this.battle) { this.battle = false; this.area.peaceful = false; }
    G.audio.playMusic?.('explore');
  }

  // --- Lekh flykter på ulven (s. 9) -----------------------------------------------------------------
  updateLekh(dt) {
    const lekh = G.enemies.find(e => !e.dead && e.type === 'lekh');
    if (lekh && !this.lekhFled && lekh.alerted) {
      if (!this.lekhShown) { this.lekhShown = true; G.ui.showBoss(lekh); G.ui.log('<b class="c-boss">Lekh:</b> «Menneskekryp! Ingen nåde. Ingen fanger.»'); G.audio.roar?.(); }
      const hurt = lekh.kp < lekh.maxKP * 0.55;
      const lost = fl('truce') && this.allies.filter(a => !a.dead).length > 3 && G.enemies.filter(e => !e.dead && e.type === 'svartalf').length < 4;
      if (hurt || lost || (fl('truce') && lekh.alerted && (this.lekhT = (this.lekhT || 0) + dt) > 14)) this.mountWolf(lekh);
    }
    const lw = G.enemies.find(e => !e.dead && !e.escaped && e.type === 'lekh_ulv');
    if (lw) G.ui.showBoss(lw);
  }

  mountWolf(lekh) {
    this.lekhFled = true;
    const kp = lekh.kp;
    const x = lekh.pos.x, z = lekh.pos.z;
    lekh.dead = true;
    lekh.dispose();
    G.enemies.splice(G.enemies.indexOf(lekh), 1);
    G.fx.burst('dust', { x, y: 0.5, z }, 16);
    G.ui.log(this.id === 'lagret' ? '<b class="c-boss">Lekh</b> plystrer skarpt. En svær ulv bryter ut av hagen, og Lekh svinger seg opp på ryggen. Han rir mot sørøst!' : '<b class="c-boss">Lekh</b> plystrer skarpt. En svær ulv kommer løpende fra skogkanten, og Lekh svinger seg opp på ryggen. Han rir mot skogen i sør!');
    const e = new Enemy('lekh_ulv', x, z, 1);
    e.spawnIdx = 'lekh';
    e.body.kp = Math.min(e.maxKP, kp + 4);
    e.alerted = true;
    // veien ut: langs fluktstien, rundt telt og gjerder (npcPath følger åpne fliser)
    const goal = this.id === 'lagret' ? [45.6, 41.6] : [24.3, 45.6];
    const route = (fx, fz) => (this.area.npcPath(fx, fz, U(goal[0]), U(goal[1])) || [{ x: U(goal[0]), z: U(goal[1]) }]).map(p => new THREE.Vector3(p.x, 0, p.z));
    let path = route(x, z);
    let wi = 0, stuckT = 0;
    const last = new THREE.Vector3(x, 0, z);
    const baseUpdate = e.update.bind(e);
    e.update = dt => {
      const P = G.player;
      const dp = Math.hypot(P.pos.x - e.pos.x, P.pos.z - e.pos.z);
      // tar du ham igjen, snur han og slåss
      if (e.cornered || dp < 2.2 || e.immobile()) { e.cornered = true; return baseUpdate(dt); }
      if (e.dead) return baseUpdate(dt);
      const t = path[wi];
      const dx = t.x - e.pos.x, dz = t.z - e.pos.z, dd = Math.hypot(dx, dz);
      if (dd < 0.6) {
        wi++;
        // update() som returnerer false, fjernes av spill-løkka (dispose og splice skjer der)
        if (wi >= path.length) { this.lekhEscaped(e); return false; }
        return true;
      }
      const sp = e.def.speed * (e.prone > 0 ? 0.2 : 1);
      e.pos.x += dx / dd * sp * dt;
      e.pos.z += dz / dd * sp * dt;
      G.dungeon.collide(e.pos, e.radius);
      // står den fast mot noe, finner den en ny vei
      stuckT += dt;
      if (stuckT > 0.5) {
        if (e.pos.distanceTo(last) < 0.3) { path = route(e.pos.x, e.pos.z); wi = Math.min(1, path.length - 1); }
        last.copy(e.pos);
        stuckT = 0;
      }
      e.vel.set(dx / dd * sp, 0, dz / dd * sp);
      e.yaw = Math.atan2(dx, dz);
      e.root.rotation.y = e.yaw;
      e.animT += dt;
      e.flash = Math.max(0, e.flash - dt);
      e.animate(dt);
      return true;
    };
    G.enemies.push(e);
  }

  lekhEscaped(e) {
    flag('lekh', 'fled');
    e.escaped = true;
    G.ui.hideBoss();
    G.ui.log('<b class="c-boss">Lekh</b> forsvinner inn i Torilskogen på ulveryggen. Du hører latteren hans lenge etter at du har mistet ham av syne.');
    for (const o of G.enemies) if (!o.dead && o.def.group === 'svartfolk') { o.alert('alarm'); if (!o.def.noMoral) o.moralCheck(-6, 'Lekh har flyktet'); }
    this.checkPeace();
  }

  // Leiren våkner når noen slår alarm (natt og dag): elitorcher og orcher kommer ut av teltene
  campAlarm() {
    if (this.id !== 'lagret' || this.alarm || fl('truce')) return;
    this.alarm = true;
    G.ui.log('Et horn låter i leiren. Svartfolk velter ut av teltene!');
    G.audio.roar?.();
    const q = Q();
    const spots = [[14.6, 22.6, 'ae1', 'orc_elite'], [31.6, 22.8, 'ae2', 'orc_elite'], [13.6, 26.6, 'ac1', 'orc_camp'], [23.4, 29.6, 'ac2', 'orc_camp'], [32.4, 26.8, 'ac3', 'orc_camp']];
    if (this.campNight) spots.push([23.4, 21.0, 'ae3', 'orc_elite'], [18.4, 21.0, 'ax1', 'orc_xbow']);
    setTimeout(() => {
      if (G.dungeon !== this.area) return;
      for (const [x, y, id, type] of spots) {
        if (q.dead[this.id].includes(id)) continue;
        const e = new Enemy(type, U(x), U(y), 1);
        e.spawnIdx = id;
        e.alerted = true;
        e.state = 'chase';
        G.enemies.push(e);
        G.fx.burst('dust', e.pos, 8);
      }
      const lekh = G.enemies.find(e => e.type === 'lekh' && !e.dead);
      if (lekh) { lekh.asleep = 0; lekh.alert('alarm'); }
    }, 2500);
  }

  // --- allierte ---------------------------------------------------------------------------------
  spawnAllies(where) {
    const P = G.player;
    const names = ['Soldaten Toke', 'Soldaten Arvid', 'Soldaten Holm', 'Soldaten Eskil', 'Soldaten Rune', 'Soldaten Vemund', 'Soldaten Sixten', 'Soldaten Aslak'];
    const list = [{ name: 'Riddar Ulfmar', knight: true, id: 'ulfmar' }, { name: 'Riddar Hjalmar', knight: true, id: 'hjalmar', age: 'ung' }, ...names.map((n, i) => ({ name: n, id: 's' + i }))];
    list.forEach((o, i) => {
      const a = i * 0.7 + 1.2;
      const x = (where?.x ?? P.pos.x) + Math.cos(a) * (2 + (i % 3)), z = (where?.z ?? P.pos.z) - 1.5 - Math.abs(Math.sin(a)) * 2;
      const al = new Ally(this, { ...o, x, z, slot: i, yaw: P.yaw });
      G.dungeon.collide(al.pos, 0.4);
      this.allies.push(al);
    });
  }

  // --- fristen og stormingen av Akershus ------------------------------------------------------------
  checkStorm(onLoad = false) {
    const q = Q();
    if (q.deadline == null || fl('truce') || fl('storm')) return;
    if (G.run.clock < q.deadline) return;
    if (this.id === 'akershus' && !onLoad && !fl('peace')) { this.startBattle(); return; }
    // ikke til stede: Akershus faller
    if (fl('lekh') === 'dead' || fl('peace')) {
      flag('storm', 'count');
      G.ui.log('<b class="c-boss">Fristen er ute.</b> Grevens soldater slo en bresj i muren på Akershus og tok baronen til fange. Svartfolket kom aldri. Uten Lekh var det ingen som ledet dem.');
    } else {
      flag('storm', 'fallen');
      G.ui.log('<b class="c-boss">Fristen er ute.</b> Grevens soldater stormet Akershus gjennom en bresj i muren. Da striden ebbet ut, styrtet svartfolkets hær ut av skogen. Ingen av de tjue som var igjen, overlevde. Lekh hadde gitt ordre om at ingen skulle få nåde.');
    }
  }

  ruins() {
    const A = this.area;
    A.peaceful = false;
    for (const n of this.npcs) { n.hidden = true; n.root.visible = false; n.def = { ...n.def, sched: [[0, n.spotName]] }; }
    for (const [x, y] of [[14.4, 20.8], [18.6, 18.6], [21.2, 23.4], [29.6, 36.4], [20.0, 36.0]]) {
      const f = this.W.flame(U(x), 0.05, U(y), 0xff7a30, 1.6, 2.6);
      void f;
      this.W.sources.push({ pos: new THREE.Vector3(U(x), 1.5, U(y)), color: new THREE.Color(0xff7a38), intensity: 20, base: 20, phase: Math.random() * 10, ember: true, dist: 12 });
    }
  }

  startBattle() {
    if (this.battle) return;
    this.battle = true;
    flag('storm', 'battle');
    const A = this.area;
    A.peaceful = false;
    G.ui.log('<b class="c-boss">Fristen er ute.</b> Katapulten smeller. Steinen treffer muren på kullen, og grevens soldater stormer opp. Midt i larmen kommer et horn fra skogen i sør. Svartfolket!');
    G.audio.roar?.();
    G.fx.addShake(0.6);
    G.audio.playMusic?.('boss', { fast: true });
    this.spawnAllies({ x: U(20), z: U(22) });
    const q = Q();
    const wave = [['orc_elite', 23, 40], ['orc_elite', 27, 41], ['orc_camp', 20, 41], ['orc_camp', 31, 40], ['orc_camp', 25, 43], ['orc_camp', 34, 41],
      ['svartalf', 24, 42], ['svartalf', 28, 43], ['svartalf', 22, 43], ['orc_xbow', 30, 43], ['orc_xbow', 19, 42], ['lekh', 26, 44], ['ulv', 32, 42]];
    wave.forEach(([type, x, y], i) => {
      const id = 'w' + i;
      if (q.dead[this.id].includes(id)) return;
      const e = new Enemy(type, U(x), U(y), 1);
      e.spawnIdx = id;
      e.alerted = true;
      e.state = 'chase';
      G.enemies.push(e);
    });
  }

  // --- kisten i Lekhs telt ------------------------------------------------------------------------
  openChest() {
    const P = G.player;
    const st = fl('chest');
    if (st) { G.ui.log(st === 'stolen' ? 'Kisten er tom. Du vet hvorfor.' : 'Bjørneskinnene. Kisten er borte.'); return; }
    const near = G.enemies.some(e => !e.dead && e.alerted && !e.fleeing && Math.hypot(e.pos.x - P.pos.x, e.pos.z - P.pos.z) < 9);
    if (near) { G.ui.log('Ikke nå. De ser deg.'); return; }
    clue('kista');
    this.talk.open({
      id: 'scene_kiste', name: 'Pengekisten', title: 'under bjørneskinnene i Lekhs telt', board: true, start: ['BÆRE', 'BRYTE'],
      greet: () => 'Under bjørneskinnene står en jernbeslått kiste med markisens kors på lokket. Låsen er hel. Den er tung, og den klirrer. Fem hundre gullmynt, hvis markisen ikke har talt feil. Han har sikkert ikke det.',
      topics: {
        BÆRE: () => {
          flag('chest', 'carried');
          this.chestGone();
          return 'Du løfter kisten opp på skulderen. Den er tung som en dårlig samvittighet. Markisen venter nok på den.';
        },
        BRYTE: () => {
          flag('chest', 'stolen');
          P.silver += 5000;
          G.run.silver = (G.run.silver || 0) + 5000;
          G.run.rykte = (G.run.rykte || 0) - 3;
          G.audio.coin();
          this.chestGone();
          return 'Du bryter opp låsen. Fem hundre gullmynt, femtusen silver. Du fyller hver lomme du har. Det er mye penger. Det er også mye å forklare, hvis noen spør.';
        },
        FARVEL: 'Du lar kisten stå. Foreløpig.',
      },
    });
  }

  chestGone() {
    if (this.chestMesh) this.chestMesh.visible = false;
    if (this.furMesh) this.furMesh.position.y = 0.12;
    this.chestIt.label = 'Bjørneskinnene';
  }

  // --- tjenester i vertshusene og ellers ---------------------------------------------------------
  service(act, talk, npc) {
    const P = G.player;
    const def = npc?.def || npc;
    const id = def?.id;
    const h = this.hour;
    const closed = def?.shopHours && !((h >= def.shopHours[0] && h < def.shopHours[1]) || (def.shopHours[1] > 24 && h < def.shopHours[1] - 24));
    if (closed && act !== 'ed_rumor' && act !== 'ed_convince') { talk.say(def.closedLine || 'Det er stengt nå. Kom tilbake i morgen.'); return; }
    // kontant koster mer i Sortmund (s. 11)
    const k = this.id === 'sortmund' ? 1.3 : 1;
    const price = sm => this.price(id, Math.round(sm * k), true);
    const fx = (kind, n = 20) => G.fx.burst(kind, P.pos, n);
    const once = key => this.visit.once.has(key), mark = key => this.visit.once.add(key);
    if (act === 'ed_room') {
      const night = price(this.id === 'akershus' ? 40 : 60);
      talk.wares([{ name: 'Et rom for natta', desc: 'Sov til klokka sju. En natt i senga gir litt tilbake: 1T3 KP og all PSY. Tiden går, og greven venter ikke.', price: night, buy: () => { this.sleep('inn'); return 'Trappa opp, døra til høyre. Den knirker, men den lukker.'; } }], { note: this.priceNote(id) });
      talk.say(`${night} sm natta.${this.id === 'sortmund' ? ' Kontant koster mer her i Sortmund. Sånn er det bare.' : ''}`);
    } else if (act === 'ed_meal' || act === 'ed_meal2') {
      const cheap = act === 'ed_meal2';
      const refresh = () => talk.wares([
        { name: cheap ? 'Stor porsjon husmannskost' : 'Husmannskost', desc: `Kålstuing, flesk og poteter. Helbreder 1T6+${cheap ? 3 : 2} KP.`, price: price(cheap ? 25 : 35), buy: () => { const got = P.heal(d(6) + (cheap ? 3 : 2)); fx('heal', 12); return got ? `Det smaker hjemme. +${got} KP.` : 'Du er mett, men du spiser opp likevel.'; } },
        { name: 'Brød og ost', desc: 'Helbreder 3 KP.', price: price(20), buy: () => { const got = P.heal(3 + (P.mods?.breadHeal || 0)); return got ? `+${got} KP.` : 'Du er allerede mett.'; } },
        { name: 'Niste til veien', desc: 'Et brød i sekken.', price: price(15), buy: () => { giveItem(makeCons('brod')); return 'Pakket inn i en klut. Ikke sett deg på den.'; } },
      ], { note: this.priceNote(id), refresh, barter: this.barterFn(id, talk, () => refresh()) });
      refresh();
      talk.say(cheap ? 'Store porsjoner, lav pris. Ingen klager. Ikke høyt.' : 'Maten er god og ølet bedre.');
    } else if (act === 'ed_ale') {
      const list = this.visit.rumorList;
      const refresh = () => talk.wares([
        { name: 'Øl', desc: '+1 PSY og et rykte på kjøpet.', price: price(10), buy: () => { P.gainPSY(1); return list[(this.visit.rumor++) % list.length]; } },
        { name: 'Mjød', desc: '+1T6 PSY, men du må klare et FYS-slag, ellers blir du full (-2 på CL en stund).', price: price(30), buy: () => {
          const before = P.psy;
          P.gainPSY(d(6));
          const n = P.psy - before;
          const r = P.attrRoll('FYS', 10, { label: 'Mjød' });
          if (!r.success) P.fx.drunk = Math.max(P.fx.drunk || 0, 120);
          G.ui.logRoll(r, r.success ? 'Mjøden går rett i hodet, men du holder deg.' : 'Mjøden går rett i hodet. Du er full: -2 på CL en stund.');
          return `+${n} PSY.`;
        } },
      ], { note: this.priceNote(id), refresh });
      refresh();
      talk.say('Øl for prat, mjød for å glemme praten.');
    } else if (act === 'ed_rumor') {
      const list = this.visit.rumorList;
      talk.say(list[(this.visit.rumor++) % list.length]);
    } else if (act === 'ed_bread') {
      const refresh = () => talk.wares([
        { name: 'Brød', desc: 'Helbreder 2 KP. Spises nå hvis du er skadet, ellers i sekken.', price: price(8), buy: () => { if (P.kp < P.maxKP) { const got = P.heal(2); return `+${got} KP. Det er godt.`; } giveItem(makeCons('brod')); return 'I sekken.'; } },
      ], { note: this.priceNote(id), refresh });
      refresh();
      talk.say('Ett brød eller ti?');
    } else if (act === 'ed_repair') {
      const worn = it => it && (it.broken || (it.durMax != null && it.dur < it.durMax));
      const items = Object.values(P.equip).filter(worn);
      if (!items.length) { talk.say('Det er ingenting trasig på deg. Ikke ennå.'); return; }
      const refresh = () => talk.wares(items.map(it => ({ name: it.name, desc: it.durMax != null ? `Reparer. BV ${it.broken ? 0 : it.dur} av ${it.durMax}.` : 'Reparer', price: price(50), disabled: !worn(it), label: worn(it) ? null : 'Hel', buy: () => { it.broken = false; if (it.durMax != null) it.dur = it.durMax; refinalize(it); P.recalc?.(); P.refreshWeaponMeshes?.(); return 'Sånn. Den holder til neste gang du er dum med den.'; } })), { note: this.priceNote(id), refresh });
      refresh();
      talk.say('Vis meg hva du har ødelagt.');
    } else if (act === 'ed_bribe_hov') {
      // hovmesteren husker for noen silvermynt (s. 6). Muta kan gjøre det billigere.
      if (has('styrbiorn')) { talk.say('Jeg har sagt det jeg husker. Mer husker jeg ikke, uansett hvor mange mynter du har.'); return; }
      const tell = () => { clue('styrbiorn'); return 'Brevet er dessverre kastet. Men nå som du nevner det: det var skrevet med ganske stygg og sprikende håndskrift, med mange stavefeil. Han skylder på nordlendingenes dårlige skolegang.'; };
      const rows = [{ name: 'Noen silvermynt', desc: 'Hovmesteren husker bedre når lomma er tyngre.', price: 30, buy: tell }];
      if ((P.skills['Muta'] || 0) > 0 && !once('muta_hov')) rows.push({ name: 'Muta (ferdighet)', desc: 'Et diskret ord og en mynt i rett øyeblikk. Lykkes du, koster det bare 10 sm.', price: 10, buy: () => { mark('muta_hov'); const r = P.roll('Muta', { label: 'Muta' }); G.ui.logRoll(r, r.success ? 'Han tar imot mynten uten å se på den.' : 'Han ser på mynten som om den var en flue.'); return r.success ? tell() : 'Hovmesteren ser ned på mynten. Den er for liten, og du er for synlig.'; } });
      talk.wares(rows, {});
      talk.say('Herr Styrbiorn? Brevet hans... Jeg husker så dårlig nå om dagen. Det er alderen.');
    } else if (act === 'ed_return_chest') {
      this.returnChest(talk);
    } else if (act === 'ed_convince') {
      this.convince(talk);
    } else super.service(act, talk, npc);
  }

  returnChest(talk) {
    const P = G.player;
    flag('chest', 'returned');
    // finnerlønn fra en svært gjerrig markis (uv), og belønningen på plakaten hvis morderen er tatt
    let sm = 250;
    const bounty = fl('lekh') === 'dead';
    if (bounty) sm += 100;
    P.silver += sm;
    G.run.silver = (G.run.silver || 0) + sm;
    G.run.rykte = (G.run.rykte || 0) + 1;
    G.audio.coin();
    P.addHjp?.(1, 'markisens kiste er tilbake');
    G.ui.log(`<b class="c-mark">Kisten er tilbake hos markisen.</b> Han gir deg ${sm} sm${bounty ? ', med belønningen for Kettils morder' : ''}.`);
    talk.say(`Han åpner kisten, teller, teller igjen, og lukker den. Alle fem hundre! Hm. Fire hundre og nittiåtte. Nei, fem hundre. Han legger ${sm} silver i hånda di, ett mynt av gangen.${bounty ? ' Belønningen fra plakaten er med. Morderen er død, sier du. Det får holde.' : ''} Takk. Du kan gå nå. Pass deg for trappa. Den er dyr å reparere.`);
  }

  convince(talk) {
    const P = G.player;
    if (fl('truce')) { talk.say('Mennene er klare. Reis til leiren fra skogkanten i sør, så kommer vi etter.'); return; }
    if (fl('peace')) { talk.say('Det er over. Takk deg, ikke meg.'); return; }
    const where = has('leir') || has('fange') || has('spor') || fl('trail');
    if (!where) { talk.say('Svartfolk? Bøndene snakker om svartfolk. Vis meg hvor de er, og gi meg noe mer enn snakk, så skal jeg tro deg.'); return; }
    const n = proofs();
    const ok = () => {
      flag('truce');
      flag('trail');
      G.ui.log('<b class="c-mark">Våpenhvile.</b> Riddar Ulfmar sender bud opp til borgen. Baronen og grevens folk slutter å skyte på hverandre. Soldatene gjør seg klare til å angripe svartfolkets leir.');
      G.audio.drake?.();
      talk.say('Han ser lenge på det du har lagt fram. Greven blir rasende hvis jeg tar feil. Han blir mer rasende hvis vi alle blir drept av lortinger. Jeg sender bud til baronen om våpenhvile. Vi følger deg til leiren. Dra fra skogkanten i sør, så kommer vi etter.');
    };
    if (n >= 2) { ok(); return; }
    if (this.visit.once.has('convince')) { talk.say('Jeg har hørt deg. Kom tilbake med mer.'); return; }
    this.visit.once.add('convince');
    // ett bevis: et Övertala-slag. Ingen: et svårt (uv)
    const r = P.roll('Övertala', { label: 'Övertala', mod: n ? 0 : -5 });
    G.ui.logRoll(r, r.success ? 'Ridderen nikker sakte.' : 'Ridderen rister på hodet.');
    if (r.success) ok();
    else talk.say('Det er for lite. Jeg kan ikke bryte grevens ordre på et rykte. Kom tilbake med bevis: noe fra svartfolket som hører til i denne saken.');
  }

  // --- rapporten til hertigens vaktkaptein i Pharynx (s. 2: «rapportera därefter till mig i Pharynx») ----
  reportPharynx() {
    const P = G.player;
    const peace = fl('peace'), truce = fl('truce'), storm = fl('storm'), stolen = fl('chest') === 'stolen';
    const outcome = peace && truce ? 'full' : peace ? 'halv' : storm === 'count' ? 'greve' : storm === 'fallen' ? 'falt' : 'ingen';
    const greet = {
      full: 'Du rir inn i Pharynx og blir ført til hertigens vaktkaptein, en gråhåret mann med segl i beltet. Han leser rapporten din to ganger. «Lekh. En svartalf. Han lurte greven med et falskt brev, drepte Kettil og kureren, og ventet på at våre egne adelsmenn skulle slite hverandre ut. Og du fikk greven og baronen til å slåss på samme side.» Han smiler for første gang. «Hertigen vil vite om dette, Ererik. Eller hva du nå heter.»',
      halv: 'Hertigens vaktkaptein leser rapporten din. «Svartfolket er drevet tilbake, men greven og baronen står fortsatt mot hverandre med sverdet halvt ute. Det er halve jobben. Den viktigste halvdelen, kanskje.»',
      greve: 'Hertigens vaktkaptein hører på deg uten å si noe. «Greven tok Akershus, og baronen sitter i et tårn i Glimming. Hertigen kommer ikke til å like det. Men du fant ut hvem som drepte Kettil. Det er noe.»',
      falt: 'Hertigens vaktkaptein ser lenge på deg. «Akershus er brent. Baronen og guttene hans er døde, og svartfolket herjer i Eke. Du kom for sent, eller vi sendte deg for sent. Hertigen vil ha det skrevet ned.»',
      ingen: 'Hertigens vaktkaptein tar imot deg i et kaldt rom. «Du har altså funnet depesjen. Bra. Men du vet ikke hvem som drepte Kettil ennå? Dra tilbake og finn det ut, før greven stormer Akershus.» Han ser på timeglasset. Du rir tilbake til Glimming.',
    }[outcome];
    if (outcome !== 'ingen' && !fl('reported')) {
      flag('reported');
      const sm = { full: 1500, halv: 800, greve: 400, falt: 150 }[outcome] * (stolen ? 0.5 : 1);
      P.silver += sm;
      G.run.silver = (G.run.silver || 0) + sm;
      G.audio.coin();
      if (outcome === 'full' && !stolen) { giveItem(questAmulet('hertig')); G.run.rykte = (G.run.rykte || 0) + 2; }
      P.addHjp?.(outcome === 'full' ? 2 : 1, 'rapporten til hertigen');
      G.ui.log(`<b class="c-mark">Oppdrag fullført:</b> Triangeldrama i Edelfara. Hertigens vaktkaptein betaler ${sm} sm${outcome === 'full' && !stolen ? ' og gir deg hertigens signetring' : ''}.${stolen ? ' Han vet om kisten, og trekker halvparten.' : ''}`);
      G.run.quests = G.run.quests || {};
      G.run.quests.ivan = { state: 'done' };
      G.audio.drake?.();
    }
    this.talk.open({ id: 'pharynx', name: 'Pharynx', title: 'hertigens vaktkaptein', board: true, start: [], topics: { FARVEL: 'Du rir tilbake vestover, til Glimming.' }, greet: () => greet });
  }

  sleep(where) {
    const P = G.player;
    void where;
    this.passTime(1, () => {
      const got = P.heal(d(3));
      P.gainPSY(P.maxPSY);
      G.fx.burst('heal', P.pos, 24);
      G.audio.heal();
      G.ui.log(`Du sover på vertshuset. ${got ? `+${got} KP og ` : ''}all PSY.`);
      G.ui.log(`Klokka er sju. ${this.L.name} våkner.`);
      this.checkStorm();
    });
  }

  // --- per bilde ----------------------------------------------------------------------------------
  update(dt, P, sky) {
    super.update(dt, P, sky);
    for (const it of this.exits) {
      const ex = it.exit;
      if (ex.need === 'trail') it.label = fl('trail') ? 'Stien sørover mot Lekhs leir' : 'Et tråkk inn i skogen (Spåra)';
      if (ex.need === 'castle_sm') it.label = item('lejdebrev') || started() ? ex.label : 'Borgveien (vaktene stopper deg)';
      if (ex.need === 'castle_ak') it.label = item('lejdebrev') ? ex.label : 'Stien opp til borgen (grevens vakter)';
      if (ex.to === 'lagret' && fl('truce')) it.label = 'Angrip leiren med grevens soldater';
    }
    for (const a of this.allies) a.update(dt);
    if (this.id === 'lagret' || this.battle) this.updateLekh(dt);
    if (this.id === 'lagret' && !this.alarm && G.enemies.some(e => !e.dead && e.alerted && e.def.group === 'svartfolk')) this.campAlarm();
    // de som løper når grevens soldater kommer (s. 9)
    for (const e of G.enemies) if (e.campRunner && !e.fleeing && !e.dead && e.alerted) { e.fleeing = true; e.fleeT = 60; e.setState('flee'); }
    // svartfolket i Ekeskogen går til angrep på dem som er dårlig rustet (s. 6)
    if (this.id === 'ekeskogen' && !this.ambushed && !P.metalWorn && started()) {
      const tz = P.pos.z / T, tx = P.pos.x / T;
      if (tz > 26 && tz < 42 && tx > 18 && tx < 30) {
        this.ambushed = true;
        const band = G.enemies.filter(e => !e.dead && (e.type === 'orc_band' || e.type === 'orc_lead'));
        if (band.length) { G.ui.log('Grynting i skogen! Fem orcher bryter fram mellom trærne. Du er ikke godt nok rustet til at de lar deg være.'); band.forEach(e => { e.alert('ambush'); }); }
      }
    }
    this.checkT = (this.checkT || 0) - dt;
    if (this.checkT <= 0) { this.checkT = 2; this.checkStorm(); if (this.id === 'lagret' || this.battle) this.checkPeace(); }
    // Lekhs telt blir gjennomsiktig når du er inne
    const lt = this.area.lekhTentMesh;
    if (lt) {
      const inside = Math.abs(P.pos.x - U(23.0)) < 1.6 && Math.abs(P.pos.z - U(17.6)) < 3.6;
      const want = inside ? 0.25 : 1;
      lt.material.opacity += (want - lt.material.opacity) * Math.min(1, dt * 6);
    }
  }

  dispose() {
    // går du fra slaget om Akershus før det er over, faller borgen
    if (this.battle && !fl('peace')) {
      flag('storm', 'fallen');
      G.ui.log('<b class="c-boss">Akershus faller</b> bak deg. Røyken fra borgen ses langt inn i skogen.');
    }
    for (const a of this.allies) a.dispose();
    this.allies = [];
    super.dispose();
  }
}

function q_last() { return Q().flags.trailTry || 0; }

export { ARRIVE as AREA_ARRIVE, hoursLeft };
