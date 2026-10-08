import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { G } from './state.js';
import { SharedAssets, decodeDuck, cutawayUniforms, buildRat } from './assets.js';
import { Dungeon, FLOORS } from './dungeon.js';
import { Player } from './player.js';
import { World } from './world.js';
import { CombatFX as FX } from './combatfx.js';
import { UI } from './ui.js';
import { Sound } from './audio.js';
import { Input } from './input.js';
import { d, rollDice, svartNebb, randomChoices, buildSheet, clRoll, resist } from './rules.js';
import { SKILL, RACE, PROF, SR, LOC_SHORT, fvCost, spellBaseCost, SPELLS } from './dod.js';
import { boonChoices, SRC_COLOR, makeItem, RARITY, setNebbCheck, refinalize, weaponItem, armorItem } from './loot.js';
import { baseCost } from './rules.js';
import { Gfx } from './gfx.js';
import { loadTextureImages } from './textures.js';
import { GradePass } from './post.js';
import { Ambient } from './decor.js';
import { TitleScene } from './title.js';
import { Creator } from './creation.js';
import { Enemy } from './enemies.js';
import { Town, skyAt } from './town.js';
import { hourOf, QUEST_TITLES } from './townfolk.js';
import * as INV from './inventory.js';
import { giveItem, makeCons, renderSellList, canCarry, bagCap } from './inventory.js';
import { Icons } from './icons.js';
import { InvUI } from './invui.js';
import { saveGame, readSave, latestSave, deleteSave, describe as describeSave } from './save.js';
import { SaveUI } from './saveui.js';
import { WaterFX } from './water.js';
import { Weather } from './weather.js';
import { Area } from './area.js';
import { AREAS, NODES } from './edelmap.js';
import { ARRIVE } from './arealife.js';
import { Travel } from './travel.js';
import { Q, fl, journalHTML, hoursLeft } from './ivan.js';

const $ = s => document.querySelector(s);
const CAM_OFF = new THREE.Vector3(10.4, 15.6, 10.4);
const tmp = new THREE.Vector3();
const tmp2 = new THREE.Vector3();
const tmp3 = new THREE.Vector3();
const tmp4 = new THREE.Color();
const CLOSE_OFF = new THREE.Vector3(3.3, 1.75, 3.3);

// Mester Flansens dojo: varige forbedringer mellom løpene, kjøpt for fjær (spillets eget lag, uv)
const UPGRADES = [
  { id: 'trening', name: 'Hard trening', desc: '+1 FV i den beste vapenfärdigheten din i alle fremtidige løp.', cost: 15, max: 3 },
  { id: 'seig', name: 'Seig kropp', desc: '+2 totala KP (og KP i kroppsdelene etter tabellen).', cost: 20, max: 3 },
  { id: 'vilje', name: 'Indre ro', desc: '+1 PSY.', cost: 20, max: 2 },
  { id: 'niste', name: 'Fars niste', desc: 'Start med en ekstra legedrikk.', cost: 15, max: 2 },
  { id: 'slip', name: 'Slipestein', desc: '+1 skade på alle treff.', cost: 30, max: 2 },
];

// første gang du kommer til et sted i Edelfara
const AREA_INTRO = {
  ekeskogen: 'Torilskogen. Vårsola titter fram mellom bladene høyt over stien, og fuglene synger. Sortmund og Galande Tuppen ligger en drøy dagsmarsj østover. Du er nesten skuffet over at du ikke har sett noe svartfolk.',
  sortmund: 'Sortmund. Allerede på avstand ser du at noe er galt. Alle dører og vinduer er lukket, og gata er tom. Ikke engang hundene er ute, selv om været er fint.',
  ridderskors: 'Markisens borg på borgkullen. Sjøen Kärkel ligger blank og kald nedenfor.',
  akershus: 'Akershus. Baron Ekes borg ligger majestetisk på toppen av kullen, i kanten av en stor glenne i Torilskogen. Nedenfor står fem runde telt med grevens faner, og lyset fra leirbålene glimter i blankt metall.',
  akershus_borg: 'Akershus borg. En hovedbygning og et høyt tårn, bundet sammen av en mur. Fem soldater, en baron og to gutter mot en hel hær.',
  glimming: 'Glimming. Grevens prektige borg ligger ved veiskillet, og värdshuset Kräklan & Svärdet ved veien sørover.',
  lagret: 'En glenne hogd ut i skogen. Telt av hud, røyk fra leirbål, og et sted bak trærne uler en ulv.',
};

const FLOOR_INTRO = {
  0: 'Fristaden. Bymuren holder orchene ute, og kloakken holder det verste nede. Det meste av tiden.',
  1: 'Kloakkene under Fristaden. Det lukter rotte, råtten fisk og noe som er verre. Sporet etter safranen går nedover.',
  2: 'Rennene blir dypere. Noen har tegnet en rev på veggen. Med krone.',
  3: 'Under kloakkene ligger Karad Baturs gamle haller. Dvergene dro for lenge siden. Noe annet bor her nå.',
  4: 'Smia er kald, men noen har fyrt opp i fyrfatene. Orcher snorker i mørket.',
  5: 'Revehiet. Det lukter våt pels og stjålne krydder.',
};

// Far snakker til sønnen sin. Herr Nansen snakker til en fremmed han har leid.
const DAD = {
  town: [
    'Nansen! Du er hjemme. Har du spist? Nei, ikke svar. Kjøp et brød.',
    'Der er du. Sjefen spør etter safranen hver time. Jeg sier at du er på saken. Er du på saken?',
  ],
  greet: [
    'Nansen! Gutten min. Hva gjør du i kloakken? Nei, ikke svar. Jeg vil ikke vite det.',
    'Der er du igjen. Du har blod på nebbet. Er det ditt?',
    'Jeg har holdt av et brød til deg. Det koster fortsatt penger, men jeg holdt det av.',
  ],
  NAVN: 'Du vet godt hva jeg heter. Jeg er faren din. Herr Nansen, hvis du skal kjøpe noe.',
  JOBB: 'Jeg er butikkbetjent. Ikke kjøpmann. Kjøpmannen eier butikken, jeg står i den. Forskjellen er lønna. Sjefen sendte meg ned hit fordi han mener det finnes et marked blant folk som har gått seg vill. Han har dessverre rett.',
  SAFRAN: 'Hele safranlageret er borte, og sjefen sier det er min feil. Han sier det hver dag. Finner du det, får jeg kanskje beholde jobben. Kanskje.',
  FLANSEN: 'Den gamle anda med tøflene? Han lærte deg å slåss, sier du. Jeg har aldri sett ham slåss. Jeg har sett ham spise tre brød på en gang.',
  KARAD: 'Fristaden var en handelspost for dvergene i Karad Batur før Zorakin tok den. Hallene deres ligger rett under oss. De dro, men de tok ikke med seg alt.',
  REVEN: 'Det sies at en rev har tatt over de gamle dvergehallene. Rødpels. Han har visst krone. Ikke stol på en rev med krone.',
  FARVEL: 'Spis ordentlig. Og ikke bare brød.',
};
const NANSEN = {
  town: [
    'Velkommen til Hvass handel. Den ekte butikken, ikke den i kloakken. Prisene er de samme, men lukten er bedre.',
    'Å, det er du. Leiesvennen. Kjøp noe, så ser det ut som jeg jobber.',
  ],
  greet: [
    'Å, det er du. Den jeg leide. Har du funnet safranen? Nei? Vil du kjøpe noe, da?',
    'Du lever fortsatt. Bra. Sjefen betaler ikke for døde leiesvenner, og ikke for levende heller, egentlig.',
    'Velkommen til butikken. Den er mindre her nede, men prisene er de samme.',
  ],
  NAVN: 'Herr Nansen. Butikkbetjent. Ikke kjøpmann, det er en annen. Sønnen min kaller seg Svart Nebb, men det skal du ikke bry deg om.',
  JOBB: 'Jeg står bak disken. Kjøpmannen eier butikken. Han sendte meg ned hit for å selge til folk som har gått seg vill. Og så sendte han deg ned for å finne safranen. Vi er visst i samme båt.',
  SAFRAN: 'Hele lageret er borte. Sjefen gir meg skylden. Finner du det, skal du få ... noe. Jeg vet ikke hva ennå. Rabatt, kanskje.',
  FLANSEN: 'Mester Flansen? En gammel and med tøfler som lærer bort Kvakk-Fu. Sønnen min trente hos ham. Jeg har aldri skjønt hva det går ut på.',
  KARAD: 'Fristaden var en handelspost for dvergene i Karad Batur før Zorakin tok den. Hallene deres ligger rett under oss.',
  REVEN: 'En rev med krone. Rødpels, kaller de ham. Ikke stol på en rev med krone. Ikke på en uten heller.',
  FARVEL: 'Ikke dø. Det er dårlig for forretningene.',
};

function loadMeta() {
  try {
    const s = localStorage.getItem('svartnebb.meta.v1');
    if (s) return { feathers: 0, levels: {}, runs: 0, best: 0, wins: 0, ...JSON.parse(s) };
  } catch (e) { /* lagring er valgfri */ }
  return { feathers: 0, levels: {}, runs: 0, best: 0, wins: 0 };
}
function saveMeta(m) {
  try { localStorage.setItem('svartnebb.meta.v1', JSON.stringify(m)); } catch (e) { /* ignorer */ }
}
function loadSettings(touch) {
  const def = { music: 70, sfx: 100, quality: touch ? 'middels' : 'hoy', shake: 1, tilt: 1, text: 1 };
  try {
    const s = localStorage.getItem('svartnebb.settings.v1');
    if (s) return { ...def, ...JSON.parse(s) };
  } catch (e) { /* valgfritt */ }
  return def;
}
function saveSettings(s) {
  try { localStorage.setItem('svartnebb.settings.v1', JSON.stringify(s)); } catch (e) { /* ignorer */ }
}
function loadChars() {
  try {
    const s = localStorage.getItem('svartnebb.chars.v1');
    if (s) return JSON.parse(s).filter(c => c && c.v === 2 && c.rules === 'dod91');
  } catch (e) { /* valgfritt */ }
  return [];
}
function saveChars(list) {
  try { localStorage.setItem('svartnebb.chars.v1', JSON.stringify(list.slice(0, 8))); } catch (e) { /* ignorer */ }
}

const BIOME_LOOK = {
  kloakk: { mist: 0x5a7a72, motes: 0xbfe8d0, density: 1 },
  dverg: { mist: 0x7a6a5a, motes: 0xffd0a0, density: 0.8 },
  rev: { mist: 0x7a4a42, motes: 0xffa080, density: 1 },
  stad: { mist: 0x9aa0b0, motes: 0xfff2c0, density: 0.12 },
};
const MENU_NOTES = [62, 65, 69, 72, 74];

class Game {
  constructor() {
    G.game = this;
    window.G = G; // praktisk for feilsøking i konsollen
    G.dev = { randomChoices, buildSheet, inv: INV, makeItem, weaponItem, armorItem, clRoll, resist, SPELLS };
    this.upgrades = UPGRADES;
    this.sky = {};
  }

  persist() {
    saveMeta(G.meta);
  }

  // Kjøp hos Mester Flansen i byen: virker med en gang, og i alle senere løp
  buyUpgradeNow(u) {
    const lv = G.meta.levels[u.id] || 0;
    G.meta.levels[u.id] = lv + 1;
    saveMeta(G.meta);
    const P = G.player;
    const mm = P.metaMods;
    if (u.id === 'trening') {
      const best = P.bestWeaponSkill();
      mm['skill:' + best] = (mm['skill:' + best] || 0) + 1;
    } else if (u.id === 'seig') mm.kp = (mm.kp || 0) + 2;
    else if (u.id === 'vilje') mm.psy = (mm.psy || 0) + 1;
    else if (u.id === 'slip') mm.dmg = (mm.dmg || 0) + 1;
    else if (u.id === 'niste') P.potions = Math.min(4, P.potions + 1);
    P.recalc();
    if (u.id === 'vilje') P.psy = Math.min(P.maxPSY, P.psy + 1);
    G.fx.burst('feather', P.pos, 18);
    G.audio.drake?.();
    G.ui.log(`Mester Flansen lærer deg <b>${u.name}</b>.`);
    return ['Bra. Du står litt mindre skjevt nå.', 'Igjen. Nei, det holder. Det var bra.', 'Svømmeføttene først. Alltid svømmeføttene først.'][Math.floor(Math.random() * 3)];
  }

  init() {
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
    renderer.setSize(innerWidth, innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    $('#stage').appendChild(renderer.domElement);
    G.renderer = renderer;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050405);
    scene.fog = new THREE.Fog(0x0a1210, 30, 64);
    G.scene = scene;
    const cam = new THREE.PerspectiveCamera(33, innerWidth / innerHeight, 0.5, 120);
    G.camera = cam;
    this.camTarget = new THREE.Vector3();
    this.hemi = new THREE.HemisphereLight(0x6f8f88, 0x0b0806, 0.55);
    scene.add(this.hemi);
    this.key = new THREE.SpotLight(0xffe0bc, 110, 30, 0.62, 0.65, 1.6);
    this.key.castShadow = true;
    this.key.shadow.mapSize.set(1536, 1536);
    this.key.shadow.camera.near = 3;
    this.key.shadow.camera.far = 24;
    this.key.shadow.bias = -0.0004;
    this.key.shadow.normalBias = 0.035;
    scene.add(this.key, this.key.target);
    this.fill = new THREE.DirectionalLight(0x8aa0c0, 0.22);
    this.fill.position.set(10, 14, 10);
    scene.add(this.fill);
    this.lantern = new THREE.PointLight(0xffb070, 9, 8, 2);
    scene.add(this.lantern);
    const composer = new EffectComposer(renderer);
    this.renderPass = new RenderPass(scene, cam);
    composer.addPass(this.renderPass);
    this.bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth / 2, innerHeight / 2), 0.65, 0.6, 0.78);
    composer.addPass(this.bloom);
    composer.addPass(new OutputPass());
    G.post = new GradePass();
    composer.addPass(G.post);
    G.composer = composer;

    G.gfx = new Gfx();
    G.assets = new SharedAssets();
    try {
      if (window.DUCK_B64) {
        G.assets.duckGeo = decodeDuck(window.DUCK_B64);
        const tex = new THREE.TextureLoader().load(window.DUCK_TEX);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = 4;
        G.assets.duckTex = tex;
      }
    } catch (e) {
      console.warn('Kunne ikke laste andemodellen, bruker reserve', e);
      G.assets.duckGeo = null;
    }
    G.fx = new FX(scene);
    G.ambient = new Ambient(scene);
    G.weather = new Weather(scene);
    G.ui = new UI();
    G.icons = new Icons();
    G.inv = new InvUI();
    G.saveui = new SaveUI();
    G.travel = new Travel();
    G.audio = new Sound();
    G.input = new Input(renderer.domElement);
    G.world = new World();
    G.water = new WaterFX();
    G.meta = loadMeta();
    this.chars = loadChars();
    try { this.selectedId = localStorage.getItem('svartnebb.lastchar') || 'svartnebb'; } catch (e) { this.selectedId = 'svartnebb'; }
    G.player = new Player();
    setNebbCheck(() => G.player.isNebb);
    scene.add(G.player.root);
    G.run = this.freshRun();
    G.player.setSheet(this.selectedSheet());
    G.player.newRun(G.meta);
    G.touch = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
    this.settings = loadSettings(G.touch);
    this.title = new TitleScene();
    this.title.setCharacter(this.selectedSheet());
    this.creator = new Creator(this);
    if (G.touch) {
      G.input.setupTouch($('#touch'));
      document.body.classList.add('touch');
    }
    this.raycaster = new THREE.Raycaster();
    this.ground = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.5);
    G.aim = new THREE.Vector3();
    this.flowTimer = 0;
    this.bindUI();
    addEventListener('resize', () => this.resize());
    addEventListener('blur', () => this.pause());
    document.addEventListener('visibilitychange', () => { if (document.hidden) this.pause(); });
    this.applySettings();
    this.resize();
    this.showSplash();
    this.last = performance.now();
    requestAnimationFrame(t => this.loop(t));
  }

  freshRun() {
    return {
      kills: 0, killsByType: {}, drakes: 0, demons: 0, rolls: 0, pushes: 0, dodges: 0, parries: 0, damageDealt: 0, damageTaken: 0, silver: 0, depthReached: 1, t0: performance.now(), known: new Set(),
      // Fristaden
      clock: 17, nextDepth: 1, quests: {}, rykte: 0, offenses: 0, runesRead: 0, cacheHint: 0, blessing: false, sharpen: false,
    };
  }

  // --- rollpersoner -----------------------------------------------------------

  allSheets() {
    return [svartNebb(), ...this.chars];
  }
  selectedSheet() {
    return this.allSheets().find(s => s.id === this.selectedId) || svartNebb();
  }
  saveCharacter(sheet) {
    const i = this.chars.findIndex(c => c.id === sheet.id);
    if (i >= 0) this.chars[i] = sheet; else this.chars.unshift(sheet);
    saveChars(this.chars);
    this.selectChar(sheet.id);
  }
  selectChar(id) {
    this.selectedId = id;
    try { localStorage.setItem('svartnebb.lastchar', id); } catch (e) { /* valgfritt */ }
    this.title.setCharacter(this.selectedSheet());
    this.refreshTitleInfo();
  }
  deleteChar(id) {
    this.chars = this.chars.filter(c => c.id !== id);
    saveChars(this.chars);
    if (this.selectedId === id) this.selectChar('svartnebb');
    this.refreshPick();
  }

  refreshPick() {
    const list = $('#pick-list');
    list.innerHTML = '';
    for (const s of this.allSheets()) {
      const kin = RACE[s.kin] || RACE.manniska, prof = PROF[s.profession] || PROF.krigare;
      const row = document.createElement('div');
      row.className = 'pick' + (s.id === this.selectedId ? ' on' : '');
      const A = s.attrs;
      row.innerHTML = `<button class="pick-main"><div class="nm">${s.name}${s.premade ? ' <i>ferdig rollperson</i>' : ''}</div>
        <div class="ds">${kin.name}, ${prof.name.toLowerCase()}${s.school ? ` (${s.school.toLowerCase()})` : ''}. ${['STY', 'STO', 'FYS', 'SMI', 'INT', 'PSY', 'KAR'].map(k => `${k} ${A[k]}`).join(' · ')}</div></button>
        ${s.premade ? '' : '<button class="btn small edit">Endre</button><button class="btn small del" title="Slett">Slett</button>'}`;
      row.querySelector('.pick-main').onclick = () => { this.selectChar(s.id); this.refreshPick(); G.audio.menuTick?.(67); };
      row.querySelector('.pick-main').ondblclick = () => this.startWith(s);
      row.querySelector('.edit')?.addEventListener('click', () => { this.showView('tv-create'); this.creator.open({ ...s.choices, id: s.id }); });
      row.querySelector('.del')?.addEventListener('click', () => {
        if (row.dataset.confirm) this.deleteChar(s.id);
        else { row.dataset.confirm = '1'; row.querySelector('.del').textContent = 'Sikker?'; }
      });
      list.appendChild(row);
    }
    const S = this.selectedSheet();
    $('#pick-blurb').textContent = S.blurb || `${(RACE[S.kin] || RACE.manniska).name}, ${(PROF[S.profession] || PROF.krigare).name.toLowerCase()}. ${S.appearance ? S.appearance + '. ' : ''}${S.special ? 'Särskild förmåga: ' + S.special.name.toLowerCase() + '.' : ''}`;
  }

  startWith(sheet) {
    this.selectChar(sheet.id);
    G.player.setSheet(sheet);
    this.beginRun();
  }

  resize() {
    const w = innerWidth, h = innerHeight;
    G.renderer.setSize(w, h);
    G.composer.setSize(w, h);
    this.bloom.resolution.set(w / 2, h / 2);
    G.camera.aspect = w / h;
    G.camera.fov = w < 700 ? 44 : 33;
    G.camera.updateProjectionMatrix();
    const sc = (h * G.renderer.getPixelRatio()) / (2 * Math.tan((G.camera.fov * Math.PI) / 360));
    G.fx.setScale(h * G.renderer.getPixelRatio(), G.camera.fov);
    G.ambient.setScale(sc);
    this.title.setScale(sc);
    G.post.uniforms.uRes.value.set(w * G.renderer.getPixelRatio(), h * G.renderer.getPixelRatio());
    this.applyViewOffset();
  }

  applyViewOffset() {
    const w = innerWidth, h = innerHeight;
    const t = G.state === 'title' || G.state === 'splash';
    const wide = this.view === 'tv-create' || this.view === 'tv-pick';
    if (t && w > 820) G.camera.setViewOffset(w, h, -w * (wide ? Math.min(0.3, 0.12 + 380 / w) : 0.19), 0, w, h);
    else if (t) G.camera.setViewOffset(w, h, 0, h * (wide ? 0.32 : 0.26), w, h);
    else G.camera.clearViewOffset();
  }

  // --- splash og tittel ------------------------------------------------------

  showSplash() {
    G.state = 'splash';
    G.ui.hud.hidden = true;
    $('#touch').hidden = true;
    G.ui.show('splash');
    if (G.touch) $('.sp-press').textContent = 'Trykk på skjermen';
    this.applyViewOffset();
    const go = e => {
      if (G.state !== 'splash') return;
      if (e && e.type === 'keydown' && (e.metaKey || e.ctrlKey || e.altKey)) return;
      removeEventListener('keydown', go);
      removeEventListener('pointerdown', go);
      this.dismissSplash();
    };
    addEventListener('keydown', go);
    addEventListener('pointerdown', go);
  }

  dismissSplash() {
    G.audio.init();
    G.audio.setVolumes(this.settings.music / 100, this.settings.sfx / 100);
    G.audio.playMusic('title');
    G.audio.menuSelect?.();
    G.input.pressed.clear();
    this.titleReadyAt = performance.now() + 900;
    const sp = $('#splash');
    sp.classList.add('out');
    setTimeout(() => { sp.hidden = true; sp.classList.remove('out'); }, 1300);
    this.enterTitle(false);
  }

  enterTitle(quick) {
    G.state = 'title';
    G.audio.setBiome?.('meny');
    G.ui.hud.hidden = true;
    $('#touch').hidden = true;
    G.ui.hideBoss();
    const t = $('#title');
    document.querySelectorAll('.screen').forEach(x => { if (x.id !== 'title' && x.id !== 'splash') x.hidden = true; });
    t.hidden = false;
    t.classList.add('go');
    t.classList.toggle('quick', !!quick);
    this.title.leave = 0;
    this.title.setCharacter(this.selectedSheet());
    this.showView('tv-menu');
    this.refreshTitleInfo();
    this.applyViewOffset();
  }

  refreshTitleInfo() {
    G.ui.renderDojo(G.meta, UPGRADES, u => this.buyUpgrade(u));
    $('#title-stats').textContent = G.meta.runs ? `${G.meta.runs} forsøk, ${G.meta.wins} seire, beste nivå ${G.meta.best || 1}` : 'Første gang ned i mørket';
    $('#mi-feathers').textContent = `${G.meta.feathers} fjær`;
    const last = latestSave();
    $('#mi-continue').hidden = !last;
    $('#mi-quick').classList.toggle('primary', !last);
    if (last) { const d = describeSave(last.data); $('#mi-cont-hint').textContent = `${d.title}${d.place ? ', ' + d.place : ''}`; }
    const S = this.selectedSheet();
    $('#mi-char').textContent = S.name;
    $('#statline').innerHTML = ['STY', 'STO', 'FYS', 'SMI', 'INT', 'PSY', 'KAR'].map(k => `<div><b>${S.attrs[k]}</b><span>${k}</span></div>`).join('');
  }

  showView(id) {
    document.querySelectorAll('#title .tview').forEach(v => (v.hidden = v.id !== id));
    this.view = id;
    $('#title').classList.toggle('wide', id === 'tv-create' || id === 'tv-pick');
    this.applyViewOffset();
    if (id === 'tv-menu') this.selectMenu(this.menuSel ?? 0, true, false);
    else if (id !== 'tv-create') {
      const first = $('#' + id + ' input, #' + id + ' .seg button, #' + id + ' button');
      first?.focus({ preventScroll: true });
    }
  }

  menuItems() {
    return [...document.querySelectorAll('#menu .mi')].filter(m => !m.hidden);
  }

  selectMenu(i, silent, focus = true) {
    const items = this.menuItems();
    i = (i + items.length) % items.length;
    if (i !== this.menuSel && !silent) G.audio.menuTick?.(MENU_NOTES[i % MENU_NOTES.length]);
    this.menuSel = i;
    items.forEach((m, k) => m.classList.toggle('sel', k === i));
    if (focus && document.activeElement !== items[i]) items[i].focus({ preventScroll: true });
  }

  menuAction(act) {
    G.audio.menuSelect?.();
    if (act === 'start') { this.refreshPick(); this.showView('tv-pick'); }
    else if (act === 'quick') this.startWith(this.selectedSheet());
    else if (act === 'continue') { const l = latestSave(); if (l) this.loadSave(l.slot); }
    else if (act === 'load') { this.showView('tv-saves'); G.saveui.render($('#title-saves'), 'load', { onLoad: slot => this.loadSave(slot) }); }
    else if (act === 'dojo') { this.refreshTitleInfo(); this.showView('dojo'); }
    else if (act === 'help') this.showView('help');
    else if (act === 'settings') { this.syncSettingsUI(); this.showView('settings'); }
    else if (act === 'about') this.showView('about');
  }

  backToMenu() {
    $('#title').classList.add('quick');
    G.audio.menuTick?.(57);
    this.title.setCharacter(this.selectedSheet());
    this.showView('tv-menu');
  }

  wipe(mid, dur = 0.55) {
    if (this.wiping) return;
    this.wiping = true;
    const el = $('#wipe');
    const t0 = performance.now();
    const closeStep = now => {
      const p = Math.min(1, (now - t0) / (dur * 1000));
      el.style.setProperty('--r', `${150 * (1 - p * p)}vmax`);
      if (p < 1) return requestAnimationFrame(closeStep);
      el.style.setProperty('--r', '-6vmax');
      mid();
      const t1 = performance.now() + 120;
      const openStep = n2 => {
        const q = Math.max(0, Math.min(1, (n2 - t1) / (dur * 1000 * 1.3)));
        el.style.setProperty('--r', `${150 * (1 - Math.pow(1 - q, 3)) - 6 * (1 - q)}vmax`);
        if (q < 1) requestAnimationFrame(openStep);
        else this.wiping = false;
      };
      requestAnimationFrame(openStep);
    };
    requestAnimationFrame(closeStep);
  }

  beginRun() {
    if (this.wiping) return;
    this.title.leaving = true;
    this.wipe(() => this.startRun(), 0.7);
  }

  titleScene() {
    this.wipe(() => {
      G.audio.playMusic('title');
      this.enterTitle(true);
    });
  }

  // --- innstillinger --------------------------------------------------------

  applySettings() {
    const st = this.settings;
    G.audio.setVolumes(st.music / 100, st.sfx / 100);
    G.shakeMul = st.shake ? 1 : 0;
    const q = st.quality;
    const dpr = devicePixelRatio || 1;
    G.renderer.setPixelRatio(q === 'lav' ? 1 : q === 'middels' ? Math.min(dpr, 1.25) : Math.min(dpr, 2));
    this.bloom.enabled = q !== 'lav';
    const shadows = q !== 'lav';
    const size = q === 'hoy' ? 2048 : 1024;
    for (const l of [this.key, this.title.spot]) {
      l.castShadow = shadows;
      if (l.shadow.mapSize.x !== size) {
        l.shadow.mapSize.set(size, size);
        l.shadow.map?.dispose();
        l.shadow.map = null;
      }
    }
    G.post.uniforms.uGrain.value = q === 'lav' ? 0 : 0.045;
    G.post.uniforms.uCA.value = q === 'lav' ? 0 : 0.0025;
    G.ambient.setEnabled(q !== 'lav', q !== 'lav');
    G.world?.fire?.setQuality(q);
    G.weather?.setQuality(q);
    G.post.setTilt(q === 'lav' || !st.tilt ? 0 : q === 'middels' ? 0.7 : 1);
    document.documentElement.style.setProperty('--txt', String(st.text || 1));
    this.resize();
  }

  syncSettingsUI() {
    const st = this.settings;
    const m = $('#set-music'), f = $('#set-sfx');
    m.value = st.music;
    f.value = st.sfx;
    for (const [inp, out] of [[m, '#out-music'], [f, '#out-sfx']]) {
      inp.style.setProperty('--v', inp.value + '%');
      $(out).textContent = inp.value;
    }
    document.querySelectorAll('#set-quality button').forEach(b => b.classList.toggle('on', b.dataset.q === st.quality));
    document.querySelectorAll('#set-shake button').forEach(b => b.classList.toggle('on', +b.dataset.s === st.shake));
    document.querySelectorAll('#set-tilt button').forEach(b => b.classList.toggle('on', +b.dataset.t === st.tilt));
    document.querySelectorAll('#set-text button').forEach(b => b.classList.toggle('on', +b.dataset.x === st.text));
    document.querySelectorAll('#set-mute button').forEach(b => b.classList.toggle('on', (b.dataset.m === '1') === !!G.audio.muted));
  }

  // Innstillingene fra pausemenyen: radene flyttes fra tittelens panel og tilbake igjen,
  // så det finnes bare ett sett med kontroller.
  openOpts() {
    if (G.state !== 'pause') return;
    this.syncSettingsUI();
    $('#opts-rows').appendChild($('#set-rows'));
    G.ui.show('opts');
    $('#opts .seg button.on')?.focus({ preventScroll: true });
  }

  closeOpts() {
    if ($('#opts').hidden) return;
    $('#settings').insertBefore($('#set-rows'), $('#settings .back'));
    if (G.state === 'pause') { G.ui.show('pause'); $('#btn-opts').focus({ preventScroll: true }); }
    else G.ui.hideScreens();
  }

  pauseTab(id) {
    document.querySelectorAll('.pz-tabs button').forEach(b => b.classList.toggle('on', b.dataset.pt === id));
    $('#pz-journal').hidden = id !== 'journal';
    $('#pz-keys').hidden = id !== 'keys';
  }

  buyUpgrade(u) {
    const lv = G.meta.levels[u.id] || 0;
    const cost = u.cost * (lv + 1);
    if (lv >= u.max || G.meta.feathers < cost) return;
    G.meta.feathers -= cost;
    G.meta.levels[u.id] = lv + 1;
    saveMeta(G.meta);
    G.audio.init();
    G.audio.coin();
    this.refreshTitleInfo();
  }

  bindUI() {
    this.menuItems().forEach((m, i) => {
      m.addEventListener('mouseenter', () => this.selectMenu(i));
      m.addEventListener('focus', () => this.selectMenu(i, false, false));
      m.addEventListener('click', () => this.menuAction(m.dataset.act));
    });
    document.querySelectorAll('#title .back').forEach(b => (b.onclick = () => this.backToMenu()));
    $('#btn-pick-start').onclick = () => this.startWith(this.selectedSheet());
    $('#btn-pick-new').onclick = () => { this.showView('tv-create'); this.creator.open(null); };
    const vol = (id, out, key) => {
      const inp = $(id);
      inp.addEventListener('input', () => {
        inp.style.setProperty('--v', inp.value + '%');
        $(out).textContent = inp.value;
        this.settings[key] = +inp.value;
        G.audio.setVolumes(this.settings.music / 100, this.settings.sfx / 100);
        saveSettings(this.settings);
      });
      inp.addEventListener('change', () => { if (key === 'sfx') G.audio.quack(1, 0.8); });
    };
    vol('#set-music', '#out-music', 'music');
    vol('#set-sfx', '#out-sfx', 'sfx');
    const seg = (sel, key, attr, num) => document.querySelectorAll(sel + ' button').forEach(b => (b.onclick = () => {
      this.settings[key] = num ? +b.dataset[attr] : b.dataset[attr];
      saveSettings(this.settings);
      this.applySettings();
      this.syncSettingsUI();
      G.audio.menuTick?.(67);
    }));
    seg('#set-quality', 'quality', 'q', false);
    seg('#set-shake', 'shake', 's', true);
    seg('#set-tilt', 'tilt', 't', true);
    seg('#set-text', 'text', 'x', true);
    document.querySelectorAll('#set-mute button').forEach(b => (b.onclick = () => {
      G.audio.init();
      G.audio.setMuted(b.dataset.m === '1');
      this.syncSettingsUI();
      G.audio.menuTick?.(67);
    }));
    $('#btn-resume').onclick = () => this.resume();
    // to trykk: det som ikke er lagret, går tapt (autolagringen blir liggende)
    $('#btn-quit').onclick = () => {
      const b = $('#btn-quit');
      if (!b.classList.contains('armed')) {
        b.classList.add('armed');
        $('#pz-warn').hidden = false;
        G.audio.menuTick?.(52);
        return;
      }
      G.ui.hideBoss();
      this.endRunCleanup();
      this.titleScene();
    };
    $('#btn-inv').onclick = () => { this.resume(); if (G.state === 'play') G.inv.open(); };
    $('#btn-opts').onclick = () => this.openOpts();
    $('#btn-opts-back').onclick = () => this.closeOpts();
    $('#btn-sheet-x').onclick = () => this.resume();
    document.querySelectorAll('.pz-tabs button').forEach(b => (b.onclick = () => this.pauseTab(b.dataset.pt)));
    $('#btn-again').onclick = () => this.wipe(() => this.startRun());
    $('#btn-totitle').onclick = () => this.titleScene();
    $('#btn-sheet-close').onclick = () => this.resume();
    $('#btn-sheet').onclick = () => this.openSheet();
    $('#btn-continue').onclick = () => this.nextFloor();
    $('#btn-up').onclick = () => this.goUpToTown();
    $('#btn-ko-go').onclick = () => this.koWake();
    $('#btn-ko-hero').onclick = () => this.koHero();
    $('#tbtn-pause').addEventListener('touchstart', e => { e.preventDefault(); this.pause(); }, { passive: false });
    $('#tbtn-inv').addEventListener('touchstart', e => { e.preventDefault(); if (G.state === 'play') G.inv.open(); }, { passive: false });
    $('#bagchip').onclick = () => { if (G.state === 'play') G.inv.open(); };
    $('#btn-save').onclick = () => this.openSaves('save');
    $('#btn-load').onclick = () => this.openSaves('load');
    $('#btn-saves-back').onclick = () => this.closeSaves();
    $('#tbtn-use').addEventListener('touchstart', e => { e.preventDefault(); if (G.state === 'play') G.world.interact(); }, { passive: false });
  }

  endRunCleanup() {
    if (this.koTimer) { clearTimeout(this.koTimer); this.koTimer = null; }
    this.ko = null;
  }

  startRun() {
    document.activeElement?.blur?.();
    G.audio.init();
    G.audio.ui();
    G.meta.runs++;
    saveMeta(G.meta);
    G.run = this.freshRun();
    this.endRunCleanup();
    G.player.newRun(G.meta);
    G.depth = 1;
    G.ui.hideScreens();
    G.ui.hideBoss();
    G.post.desat = 0;
    G.ui.logEl.innerHTML = '';
    G.ui.hud.hidden = false;
    $('#touch').hidden = !G.touch;
    G.state = 'play';
    this.view = null;
    this.applyViewOffset();
    this.title.leaving = false;
    $('#title').hidden = true;
    G.depth = 0;
    this.loadFloor(0, null, false, 'start');
    G.ui.buildBar();
    G.audio.playMusic('town');
    const P = G.player;
    G.ui.log(P.isNebb
      ? 'Noen har stjålet hele safranlageret fra Hvass handel, der far står bak disken, og sjefen gir ham skylden. Sporet går ned i kloakken.'
      : `Herr Nansen, butikkbetjent hos Hvass handel i Fristaden, har leid ${P.name} for å finne det stjålne safranlageret. Sporet går ned i kloakken.`);
    G.ui.log('Kloakkluken ligger på torget. Snakk med folk først: trykk <kbd>E</kbd>, og skriv eller klikk på ord. Ord i gull blir nye spørsmål.');
  }

  // fra kloakkluken i byen og ned
  enterSewers() {
    if (G.state !== 'play' || this.wiping) return;
    const n = Math.max(1, G.run.nextDepth || 1);
    G.state = 'transition';
    G.audio.ui();
    this.wipe(() => {
      G.ui.hideScreens();
      G.state = 'play';
      this.loadFloor(n);
      G.ui.buildBar();
      G.audio.playMusic('explore');
      if (n > 1) G.ui.log('Du klatrer ned gjennom kloakken og finner veien tilbake dit du snudde.');
    });
  }

  // --- Edelfara: reisekartet og områdene utenfor byen ---------------------------------------

  openTravel(from) {
    if (G.state !== 'play' || this.wiping) return;
    G.travel.open(from);
  }

  // Reis langs veiene til et sted. Første gang stopper du i Ekeskogen, der kureren ligger (s. 2).
  travelTo(to, from) {
    if (this.wiping || G.travel.anim) return;
    const r = G.travel.route(from, to);
    if (!r) return;
    let path = r.path;
    if (Q().stage < 1 && path.includes('ekeskogen') && to !== 'ekeskogen' && from !== 'ekeskogen') path = path.slice(0, path.indexOf('ekeskogen') + 1);
    const dest = path[path.length - 1];
    const prev = path[path.length - 2];
    const hours = G.travel.hoursOf(path);
    G.state = 'transition';
    document.activeElement?.blur?.();
    G.travel.animate(path, () => {
      this.wipe(() => {
        G.ui.hideScreens();
        G.state = 'play';
        G.run.clock += hours;
        if (dest !== to) G.ui.log('Halvveis gjennom Torilskogen ser du noe under en busk ved veiskillet. Du stopper.');
        if (dest === 'fristaden') {
          this.loadFloor(0, null, false, 'gate');
          G.ui.buildBar();
          G.audio.playMusic('town');
          G.ui.log(`Du kommer inn gjennom Nordporten etter ${hours} timer på veien. Folkard nikker til deg.`);
          return;
        }
        if (dest === 'pharynx') {
          // Pharynx har ikke noe eget område: du rapporterer, og rir tilbake til Glimming
          G.run.clock += hours;
          this.loadArea('glimming', 'east');
          G.dungeon.life?.reportPharynx?.();
          return;
        }
        this.loadArea(dest, ARRIVE[dest]?.[prev]);
      });
    });
  }

  // Inn eller ut av en borg i samme område (borgveien i Sortmund, kullen i Akershus)
  goArea(id, arrival) {
    if (this.wiping) return;
    G.state = 'transition';
    this.wipe(() => {
      G.ui.hideScreens();
      G.state = 'play';
      G.run.clock += 0.25;
      this.loadArea(id, arrival);
    });
  }

  loadArea(id, arrival, opts = {}) {
    const L0 = AREAS[id];
    if (!L0) return;
    if (G.dungeon) G.dungeon.dispose();
    G.fx.clearLevel();
    G.ui.hideBoss();
    G.depth = 0;
    G.run.area = id;
    const L = { ...L0, state: { trail: !!fl('trail') } };
    G.dungeon = new Area(L, arrival);
    G.dungeon.build(G.assets);
    this.setTownLighting(true);
    G.world.buildLevel(G.dungeon);
    const info = G.dungeon.info;
    G.scene.fog.color.setHex(info.fog);
    G.scene.background.setHex(0x040304);
    this.hemi.color.setHex(info.ambient);
    const P = G.player;
    P.pos.set(G.dungeon.start.x, 0, G.dungeon.start.z);
    P.vel.set(0, 0, 0);
    P.yaw = G.dungeon.startYaw;
    P.onFloor();
    G.dungeon.computeFlow(P.pos.x, P.pos.z);
    this.camTarget.copy(P.pos);
    G.camera.position.copy(P.pos).add(CAM_OFF);
    G.audio.setBiome('stad');
    const look = BIOME_LOOK.stad;
    G.ambient.setLook(look.mist, look.motes, look.density);
    this.townNight = null;
    G.weather.snap();
    G.water.clear();
    G.post.mood('stad');
    G.ui.setDepth(0, L.name, { region: 'Edelfara, Pharynx', town: !!L.peaceful });
    G.ui.buildBar();
    G.audio.playMusic(L.music === 'town' ? 'town' : 'explore');
    const seen = G.run.seenAreas || (G.run.seenAreas = []);
    if (!seen.includes(id)) { seen.push(id); if (L.intro) G.ui.log(L.intro); else G.ui.log(AREA_INTRO[id] || L.name + '.'); }
    if (!this.loadingSave && !opts.noSave) setTimeout(() => { if (G.state === 'play' && !G.player.dead) saveGame('auto', true); }, 400);
  }

  onEnemyDied(e) {
    G.dungeon?.life?.onEnemyDied?.(e);
  }

  // fra trappa og opp til byen
  goUpToTown() {
    document.activeElement?.blur?.();
    this.applyPendingBoon();
    G.run.nextDepth = G.depth + 1;
    G.run.clock += 1;
    this.wipe(() => {
      G.ui.hideScreens();
      G.state = 'play';
      this.loadFloor(0, null, false, 'grate');
      G.ui.buildBar();
      G.audio.playMusic('town');
      G.ui.log(`Du klatrer opp gjennom kloakken og løfter på luken. Fristaden. Kloakkluken tar deg tilbake til nivå ${G.run.nextDepth} når du vil.`);
    });
  }

  loadFloor(depth, seed, title = false, arrival = 'start') {
    if (G.dungeon) G.dungeon.dispose();
    if (G.run) G.run.area = null;
    G.fx.clearLevel();
    G.ui.hideBoss();
    G.depth = depth;
    const town = depth === 0;
    G.dungeon = town ? new Town(seed ?? 1, arrival) : new Dungeon(depth, seed ?? Math.floor(Math.random() * 1e9));
    G.dungeon.build(G.assets);
    this.setTownLighting(town);
    G.world.buildLevel(G.dungeon);
    const info = FLOORS[depth];
    G.scene.fog.color.setHex(info.fog);
    G.scene.background.setHex(0x040304);
    this.hemi.color.setHex(info.ambient);
    const P = G.player;
    P.pos.set(G.dungeon.start.x, 0, G.dungeon.start.z);
    P.vel.set(0, 0, 0);
    P.yaw = town ? Math.PI * 0.5 : Math.PI * 0.25;
    P.onFloor();
    if (!town) {
      P.fx.utu = false;
      if (G.run.blessing) { G.run.blessing = false; P.fx.utu = true; P.fx.light = true; G.ui.log('Utus velsignelse følger deg ned: sterkere lys og -2 på Skräcktabellen.'); }
      if (G.run.sharpen) { G.run.sharpen = false; P.fx.sharpened = true; G.ui.log('Bataars slipte egg gir +1 skade på dette nivået.'); }
    }
    if (title) {
      for (const e of G.enemies) e.dispose();
      G.enemies.length = 0;
    }
    G.dungeon.computeFlow(P.pos.x, P.pos.z);
    this.camTarget.copy(P.pos);
    G.camera.position.copy(P.pos).add(CAM_OFF);
    G.audio.setBiome(info.biome);
    const look = BIOME_LOOK[info.biome];
    G.ambient.setLook(look.mist, look.motes, look.density);
    this.townNight = null;
    G.weather.snap();
    G.water.clear();
    G.post.mood(info.biome);
    if (!title) {
      if (!town) G.run.depthReached = Math.max(G.run.depthReached, depth);
      G.ui.setDepth(depth, info.name);
      G.ui.log(FLOOR_INTRO[depth]);
      if (!this.loadingSave) setTimeout(() => { if (G.state === 'play' && !G.player.dead) saveGame('auto', true); }, 400);
    }
  }

  // --- lagre og laste ------------------------------------------------------------------

  openSaves(mode) {
    if (G.state !== 'pause') return;
    $('#saves-eye').textContent = mode === 'save' ? 'Lagre' : 'Last';
    $('#saves-h').textContent = mode === 'save' ? 'Lagre spillet' : 'Last et lagret spill';
    G.ui.show('saves');
    G.saveui.render($('#saves-list'), mode, { onLoad: slot => this.loadSave(slot) });
  }

  closeSaves() {
    if ($('#saves').hidden) return;
    if (G.state === 'pause') G.ui.show('pause');
    else G.ui.hideScreens();
  }

  loadSave(slot) {
    const r = readSave(slot);
    if (!r.ok) { G.saveui.msg?.(r.why); return; }
    if (this.wiping) return;
    const d = r.data;
    document.activeElement?.blur?.();
    G.audio.init();
    G.audio.ui();
    const fromTitle = G.state === 'title';
    if (fromTitle) this.title.leaving = true;
    this.wipe(() => {
      this.endRunCleanup();
      this.loadingSave = true;
      G.run = { ...this.freshRun(), ...d.run, known: new Set(d.run.known || []), t0: performance.now() };
      const P = G.player;
      if (d.player.sheet?.id) { try { this.selectedId = d.player.sheet.id; localStorage.setItem('svartnebb.lastchar', d.player.sheet.id); } catch (e) { /* valgfritt */ } }
      P.deserialize(d.player);
      G.ui.hideScreens();
      G.ui.hideBoss();
      G.post.desat = 0;
      G.ui.logEl.innerHTML = '';
      G.ui.hud.hidden = false;
      $('#touch').hidden = !G.touch;
      G.state = 'play';
      this.view = null;
      this.applyViewOffset();
      this.title.leaving = false;
      $('#title').hidden = true;
      if (d.area && AREAS[d.area]) this.loadArea(d.area, null);
      else this.loadFloor(d.depth, d.seed, false, 'start');
      // onFloor() nullstilte disse, så de settes tilbake etter at nivået er bygd
      P.floor = JSON.parse(JSON.stringify(d.player.floor || P.floor));
      P.floorStats = JSON.parse(JSON.stringify(d.player.floorStats || P.floorStats));
      Object.assign(P.fx, d.player.fx || {});
      if (d.level) G.world.applyLevel(d.level);
      P.pos.set(d.pos.x, 0, d.pos.z);
      P.yaw = d.pos.yaw || 0;
      P.vel.set(0, 0, 0);
      G.dungeon.computeFlow(P.pos.x, P.pos.z);
      if (G.dungeon.isTown) G.dungeon.life?.snapAll?.();
      this.camTarget.copy(P.pos);
      G.camera.position.copy(P.pos).add(CAM_OFF);
      this.loadingSave = false;
      G.ui.buildBar();
      G.audio.playMusic(G.dungeon.isArea ? (G.dungeon.L.music === 'town' ? 'town' : 'explore') : G.dungeon.isTown ? 'town' : 'explore');
      G.ui.log(`Fortsetter: ${describeSave(d).title}${G.dungeon.isArea ? ', ' + G.dungeon.L.name : G.dungeon.isTown ? ', Fristaden' : ''}.`);
    }, fromTitle ? 0.7 : 0.55);
  }

  // Lys for byen (sol og måne) eller for kloakken (lykt)
  setTownLighting(town) {
    const k = this.key;
    this.inTown = town;
    if (town) {
      k.decay = 0;
      k.distance = 0;
      k.angle = 0.62;
      k.penumbra = 0.35;
      k.shadow.camera.near = 6;
      k.shadow.camera.far = 95;
      k.shadow.bias = -0.0006;
      k.shadow.normalBias = 0.05;
    } else {
      k.decay = 1.6;
      k.distance = 30;
      k.angle = 0.62;
      k.penumbra = 0.65;
      k.intensity = 110;
      k.color.setHex(0xffe0bc);
      k.shadow.camera.near = 3;
      k.shadow.camera.far = 24;
      k.shadow.bias = -0.0004;
      k.shadow.normalBias = 0.035;
      this.hemi.groundColor.setHex(0x0b0806);
      this.hemi.intensity = 0.55;
      this.fill.color.setHex(0x8aa0c0);
      this.fill.intensity = 0.22;
      G.scene.fog.near = 30;
      G.scene.fog.far = 64;
      if (G.audio.music) { G.audio.music.night = false; G.audio.music.inn = false; }
    }
    k.shadow.camera.updateProjectionMatrix();
  }

  townLights(dt) {
    const P = G.player;
    const sky = skyAt(hourOf(G.run.clock), this.sky);
    const k = this.key;
    k.position.set(P.pos.x + sky.dir.x, sky.dir.y, P.pos.z + sky.dir.z);
    k.target.position.set(P.pos.x, 0, P.pos.z);
    k.target.updateMatrixWorld();
    const W = G.weather;
    const cloud = W.cloud;
    k.color.copy(sky.sun);
    k.intensity = sky.sunI * 1.15 * (1 - cloud * 0.72);
    this.hemi.color.copy(sky.sky).lerp(sky.fog, cloud * 0.5);
    this.hemi.groundColor.copy(sky.ground);
    this.hemi.intensity = sky.hemiI * 1.4 * (1 - cloud * 0.2) + W.flash * W.flash * 5;
    this.fill.color.copy(sky.sky);
    this.fill.intensity = 0.22 + (1 - sky.night) * 0.3;
    this.fill.position.set(P.pos.x - 10, 14, P.pos.z + 12);
    this.fill.target.position.copy(P.pos);
    this.fill.target.updateMatrixWorld();
    const n = sky.night;
    this.lantern.color.setRGB(1, 0.72, 0.46);
    this.lantern.intensity = 7 * Math.max(0, (n - 0.3) / 0.7) * (P.fx?.light ? 1.5 : 1);
    this.lantern.distance = 9;
    this.lantern.position.set(P.pos.x + 1.0, 2.3, P.pos.z + 1.0);
    G.scene.fog.color.copy(sky.fog);
    G.scene.background.copy(sky.fog);
    G.scene.fog.near = (44 - n * 14) * (1 - W.rain * 0.35);
    G.scene.fog.far = (105 - n * 30) * (1 - W.rain * 0.3);
    if (cloud > 0.01) { G.scene.fog.color.lerp(tmp4.setRGB(0.32, 0.34, 0.38).multiplyScalar(1 - n * 0.8), cloud * 0.45); G.scene.background.copy(G.scene.fog.color); }
    G.post.mood('stad', n, W.rain);
    const night = n > 0.6;
    G.audio.townNight = night;
    if (G.audio.music) {
      G.audio.music.night = night;
      G.audio.music.inn = G.dungeon.insideId === 'inn';
    }
    if (night !== this.townNight) {
      this.townNight = night;
      if (night) G.ambient.setLook(0x2a3448, 0xd8ff7a, 0.5);
      else G.ambient.setLook(0x9aa0b0, 0xfff2c0, 0.12);
    }
    void dt;
    return sky;
  }

  applyPendingBoon() {
    const P = G.player;
    const b = this.pendingBoon;
    if (b) {
      P.boons.push(b);
      if (b.silver) P.silver += b.silver * 10;
      if (b.potion) P.potions = Math.min(4, P.potions + b.potion);
      G.ui.log(`Gave fra ${b.src}: <b style="color:${SRC_COLOR[b.src]}">${b.name}</b>.`);
      P.recalc();
    }
    this.pendingBoon = null;
    // bonuspoeng fra trappa (Bok I s. 63)
    for (const q of this.bonusPicks || []) if (q.pick) P.addExp(q.pick, 1);
    if (this.bonusPicks?.length) G.ui.log(`Bonuspoeng: ${this.bonusPicks.map(q => q.pick).join(', ')} (+1 EP hver).`);
    this.bonusPicks = null;
  }

  // Når en flokk får øye på deg: Upptäcka fara mot bakhold, og kunnskap om fienden
  onEnemiesAlerted(flock, cause) {
    const P = G.player;
    if (G.state !== 'play' || P.ko) return;
    for (const e of flock) {
      if (G.run.known.has(e.type) || e.def.boss) continue;
      G.run.known.add(e.type);
      if (!e.def.lore) continue;
      const sk = e.def.undead ? 'Kunskap om odöda' : e.type === 'demon' ? 'Kunskap om demoner' : 'Zoologi';
      if (!(P.skills[sk] > 0)) continue;
      const r = P.roll(sk, { label: sk });
      if (r.success) { G.ui.logRoll(r, `<b class="c-mark">${sk}:</b> ${e.def.lore}`); P.floorStats.lore = (P.floorStats.lore || 0) + 1; }
    }
    if (cause !== 'sight' || flock.some(e => e.def.boss || e.ambushDone)) return;
    flock.forEach(e => (e.ambushDone = true));
    // Upptäcka fara: en intuitiv følelse av at noe er på gang (Bok I s. 44)
    const r = P.roll('Upptäcka fara', { label: 'Upptäcka fara' });
    if (r.success) {
      for (const e of flock) if (!e.dead) e.surprised = r.perfekt ? 2.2 : 1.3;
      G.ui.logRoll(r, `${P.name} merker dem først. De er overrasket.`);
      G.fx.float('Overrasket!', flock[0].pos, 'sneak');
    } else if (r.fummel) {
      G.ui.logRoll(r, 'Bakhold! De er over deg før du skjønner noe.');
      P.lock = 0.8;
      for (const e of flock) e.cd = 0;
    } else G.ui.logRoll(r, 'Fiender!');
  }

  // --- trappa ned: søvn, erfarenhet, bonuspoeng og gaver ---------------------

  // En natts søvn i trappa (uv: det boka gir på en uke, gir spillet på en natt)
  sleepStairs() {
    const P = G.player;
    const out = [];
    if (P.bleeding.size) {
      const can = P.loc.harm > 0 && P.loc.varm > 0;
      const r = can ? P.roll('Första hjälpen', { label: 'Första hjälpen', mod: (P.critVital ? -10 : 0) + (P.kit.has('forband') ? 2 : 0), always: true }) : null;
      if (r?.success) { P.stopBleeding(); out.push('Du legger forbinding før du sover.'); }
      else {
        const n = d(3);
        P.kp -= n;
        P.stopBleeding();
        out.push(`Du får ikke stoppet blødningen før den har kostet ${n} KP.`);
        if (P.kp <= -P.attrs.FYS) { this.onDeath(false, 'blødde i hjel i trappa'); return null; }
      }
    }
    let mult = 1;
    if (P.sheet.special?.fx?.healMul) mult *= P.sheet.special.fx.healMul;
    if (P.has('snabblakning')) mult *= 2;
    if ((P.skills['Läkekonst'] || 0) > 0 && P.kp < P.maxKP) {
      const r = P.roll('Läkekonst', { label: 'Läkekonst', always: true, noExp: true });
      if (r.success) { mult *= 2; out.push('Läkekonst: sårene gror dobbelt så fort.'); }
    }
    const kb = P.kp;
    for (const l of Object.keys(P.loc)) if (P.loc[l] < P.locMax[l] && !P.body.lame.has(l)) P.loc[l] = Math.min(P.locMax[l], P.loc[l] + mult);
    P.kp = Math.min(P.maxKP, P.kp + mult);
    if (Object.keys(P.loc).every(l => P.loc[l] >= P.locMax[l] || P.body.lame.has(l))) P.kp = P.maxKP;
    if (P.kp > kb) out.push(`Søvnen gir +${P.kp - kb} KP.`);
    // PSY: 1 per time i hvile (Bok III s. 4), åtte timer
    const pb = P.psy;
    P.gainPSY(8);
    if (P.psy > pb) out.push(`+${P.psy - pb} PSY.`);
    if (P.kp > 0 && P.loc.huvud > 0) P.helpless = false;
    P.onSleep();
    // reparasjon med Hantverk (Bok I s. 49)
    for (const it of Object.values(P.equip)) {
      if (!it || !(it.broken || (it.durMax && it.dur < it.durMax))) continue;
      if (!(P.skills.Hantverk > 0)) continue;
      const r = P.roll('Hantverk', { label: 'Hantverk', always: true });
      if (r.success) { it.broken = false; if (it.durMax) it.dur = it.durMax; refinalize(it); out.push(`Hantverk: ${it.name} er reparert.`); }
      else out.push(`Hantverk: ${it.name} er fortsatt skadet.`);
    }
    P.recalc();
    return out.join(' ') || 'Du sover dårlig, men du sover.';
  }

  descend() {
    if (G.state !== 'play') return;
    G.state = 'transition';
    G.audio.ui();
    const P = G.player;
    P.chan = null;
    P.fx.barsark = 0;
    P.breakStealth();
    P.forced = null;
    P.charge = null;
    P.heroArmed = false;
    const restTxt = this.sleepStairs();
    if (restTxt == null) return;
    $('#rest-text').innerHTML = `${P.name} setter seg i trappa og sover noen timer. ${restTxt}`;
    this.renderExp();
    // bonuspoeng etter nivået (Bok I s. 63, tilpasset)
    const F = P.floorStats;
    const reasons = ['Nivået er klart'];
    if ((F.monsters || 0) > 0 || (F.kills || 0) >= 8) reasons.push('Du beseiret farlige fiender');
    if ((F.locks || 0) > 0 || (F.runes || 0) > 0 || G.world.caches.some(c => c.found)) reasons.push('Du løste noe uten å slåss');
    if ((F.lore || 0) > 0) reasons.push('Du visste hva du møtte');
    const opts = Object.keys(P.baseSkills).filter(id => SKILL[id] && SKILL[id].kat !== 'B' && SKILL[id].type !== 'magi').sort((a, b) => a.localeCompare(b, 'sv'));
    const best = P.bestWeaponSkill();
    this.bonusPicks = reasons.slice(0, 4).map((q, i) => ({ q, pick: i === 0 ? best : P.sheet.yrke?.find(s => opts.includes(s) && s !== best) || best }));
    const sl = $('#session-list');
    sl.innerHTML = this.bonusPicks.map((q, i) => `<div class="sq yes"><span class="q">${q.q}</span><span class="a">+1 EP</span><select data-i="${i}">${opts.map(o => `<option${o === q.pick ? ' selected' : ''}>${o}</option>`).join('')}</select></div>`).join('');
    sl.querySelectorAll('select').forEach(el => (el.onchange = () => { this.bonusPicks[+el.dataset.i].pick = el.value; }));
    this.renderBoons(boonChoices(P.boons, []));
    $('#transition-title').textContent = `Trappa ned til nivå ${G.depth + 1}`;
    $('#transition-next').textContent = FLOORS[G.depth + 1].name;
    G.ui.show('transition');
  }

  renderExp() {
    const P = G.player;
    const sheetLike = { yrke: P.sheet.yrke || [], specialFx: P.sheet.special?.fx || {}, kin: P.sheet.kin };
    const rows = Object.entries(P.exp).filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1]);
    const list = $('#improve-list');
    if (!rows.length) { list.innerHTML = '<div class="imp none">Ingen EP ennå. Første lyckade slag i en ferdighet etter søvn gir 1 EP.</div>'; return; }
    list.innerHTML = `<div class="explist"><span class="h">Ferdighet</span><span class="h">EP</span><span class="h">Neste FV koster</span>${rows.map(([id, n]) => {
      const isSpell = !!SPELLS[id];
      const fv = isSpell ? P.spells[id] || 0 : P.baseSkills[id] || 0;
      const cost = fvCost(fv, fv + 1, isSpell ? spellBaseCost(SPELLS[id].sv) : baseCost(id, sheetLike));
      return `<span>${isSpell ? SPELLS[id].name : id} <i style="color:var(--dim)">FV ${fv}</i></span><span class="${n >= cost ? 'ok' : ''}">${n}</span><span>${cost}</span>`;
    }).join('')}</div>`;
  }

  renderBoons(choices) {
    const cards = $('#boon-cards');
    cards.innerHTML = '';
    $('#boon-head').hidden = !choices.length;
    for (const b of choices) {
      const c = document.createElement('button');
      c.className = 'boon';
      c.style.setProperty('--src', SRC_COLOR[b.src]);
      c.innerHTML = `<div class="src">${b.src}</div><div class="nm">${b.name}</div><div class="ds">${b.desc}</div>`;
      c.onclick = () => {
        if (c.classList.contains('picked')) return;
        cards.querySelectorAll('.boon').forEach(x => x.classList.toggle('picked', x === c));
        cards.querySelectorAll('.boon').forEach(x => x.classList.toggle('dim', x !== c));
        this.pendingBoon = b;
        $('#btn-continue').disabled = false;
        $('#btn-up').disabled = false;
        G.audio.ui();
      };
      cards.appendChild(c);
    }
    this.pendingBoon = null;
    $('#btn-continue').disabled = !!choices.length;
    $('#btn-up').disabled = !!choices.length;
  }

  nextFloor() {
    document.activeElement?.blur?.();
    this.applyPendingBoon();
    G.run.nextDepth = G.depth + 1;
    this.wipe(() => {
      G.ui.hideScreens();
      G.state = 'play';
      this.loadFloor(G.depth + 1);
      G.ui.buildBar();
      if (G.audio.music && G.audio.music.name !== 'explore') G.audio.playMusic('explore');
    });
  }

  // --- medvetslös (Bok II s. 18-19, IMPLEMENTERING.md) -------------------------------------

  onKnockout(cause) {
    const P = G.player;
    if (P.dead || this.ko) return;
    G.state = 'deathroll';
    G.run.ko = (G.run.ko || 0) + 1;
    G.post.desat = 0.85;
    G.audio.music?.setIntensity(0);
    this.ko = { cause, done: false };
    $('#ko-title').textContent = 'Det blir svart';
    $('#ko-cause').textContent = `${P.name} er medvetslös (${cause}). Totala KP ${P.kp}. Døden kommer ved minus FYS (${-P.attrs.FYS}).`;
    $('#ko-log').innerHTML = '';
    $('#btn-ko-hero').hidden = !(P.hjp > 0);
    $('#btn-ko-hero').disabled = false;
    $('#btn-ko-go').disabled = true;
    G.ui.update(0);
    G.ui.show('deathroll');
    this.koQueue = this.koSteps();
    this.koTimer = setTimeout(() => this.koStep(), 700);
  }

  koLine(html, cls = '') {
    const el = document.createElement('div');
    el.className = cls;
    el.innerHTML = html;
    $('#ko-log').appendChild(el);
  }

  // Hva som skjer mens du ligger: fiendene handler etter hva de er (uv), så blødningen, så våkner du
  koSteps() {
    const P = G.player;
    const steps = [];
    const near = G.enemies.filter(e => !e.dead && e.alerted && !e.fleeing && e.pos.distanceTo(P.pos) < 16);
    const robbers = near.filter(e => e.def.ko === 'rob');
    const biters = near.filter(e => e.def.ko === 'bite');
    const killers = near.filter(e => e.def.ko === 'kill');
    if (!near.length) steps.push(() => this.koLine('Ingen fiender er i nærheten. Mørket er stille.'));
    if (robbers.length) steps.push(() => {
      const lost = Math.floor(P.silver / 2);
      P.silver -= lost;
      const vals = P.bag.filter(x => x.type === 'val');
      const v = vals.length ? vals[Math.floor(Math.random() * vals.length)] : null;
      if (v) P.bag.splice(P.bag.indexOf(v), 1);
      const who = robbers[0].def.boss ? 'Rødpels' : robbers.length > 1 ? `${robbers.length} ${robbers[0].type === 'orc' ? 'orcher' : 'vätter'}` : robbers[0].def.name.toLowerCase();
      this.koLine(`${who[0].toUpperCase() + who.slice(1)} roter gjennom lommene dine${lost ? `: ${lost} sm` : ''}${v ? ` og ${v.name.toLowerCase()}` : ''} er borte. Så går de.`, 'bad');
      if (robbers[0].def.boss) this.koLine('«Kom tilbake når du er sprøere», sier Rødpels.');
      for (const e of robbers) { e.alerted = false; e.fleeing = true; e.fleeT = 6; e.setState('flee'); }
      P.recalc();
    });
    for (const e of biters) {
      // rotter biter noen ganger og mister så interessen (uv)
      const n = d(2);
      steps.push(() => {
        for (let i = 0; i < n && !P.dead; i++) {
          const atk = e.def.attacks[0];
          const r = clRoll(atk.fv + 10, atk.fv);
          if (!r.success) continue;
          const got = P.applyHit({ dmg: atk.dmg, roll: r, small: true, src: e });
          this.koLine(`${e.def.name} biter (${got} skade). KP ${P.kp}.`, 'bad');
        }
        if (!P.dead) { this.koLine(`${e.def.name} mister interessen.`); e.alerted = false; e.calm = 30; e.setState('idle'); }
      });
    }
    if (killers.length) {
      for (let round = 0; round < 6; round++) {
        steps.push(() => {
          for (const e of killers) {
            if (P.dead || e.dead) continue;
            const atk = e.mainAttack();
            const r = clRoll(atk.fv + 10, atk.fv);
            if (!r.success) { this.koLine(`${e.def.name} bommer.`); continue; }
            const got = P.applyHit({ dmg: atk.dmg, sb: e.sb, roll: r, src: e });
            this.koLine(`${e.def.name} slår mot deg der du ligger (${got} skade). KP ${P.kp}.`, 'bad');
          }
        });
      }
      steps.push(() => { if (!P.dead) { this.koLine('De tror du er død, og går.'); for (const e of killers) { e.alerted = false; e.setState('idle'); } } });
    }
    // kritisk skade i bröstkorg eller mage: svårt FYS-slag, ellers død (Bok II s. 19)
    if (P.critVital) steps.push(() => {
      const r = P.attrRoll('FYS', 15, { label: 'Svårt FYS-slag', noExp: true, noHero: true });
      if (!r.success) { this.koLine(`<span class="roll fail">FYS ${r.r}/${r.cl}</span> Kroppen gir opp.`, 'bad'); this.onDeath(false, 'kritisk skade i kroppen'); return; }
      this.koLine(`<span class="roll ok">FYS ${r.r}/${r.cl}</span> Du klamrer deg fast.`, 'good');
      P.critVital = false;
    });
    // blødning mens du ligger: et normalt FYS-slag, ellers 1T3 KP før det levrer seg (uv)
    steps.push(() => {
      if (!P.bleeding.size || P.dead) return;
      const r = P.attrRoll('FYS', 10, { label: 'FYS-slag', noExp: true, noHero: true });
      if (r.success) this.koLine(`<span class="roll ok">FYS ${r.r}/${r.cl}</span> Blodet levrer seg.`, 'good');
      else {
        const n = d(3);
        P.kp -= n;
        this.koLine(`<span class="roll fail">FYS ${r.r}/${r.cl}</span> Du blør ${n} KP før det stopper. KP ${P.kp}.`, 'bad');
        if (P.kp <= -P.attrs.FYS) { this.onDeath(false, 'blødde i hjel'); return; }
      }
      P.stopBleeding();
    });
    steps.push(() => {
      if (P.dead) return;
      // tiden går: 1T4 timer ved 0 totala KP, 1T100 - FYS minutter ved slag mot hodet (Bok II s. 18)
      const head = P.loc.huvud <= 0 && P.kp > 0;
      const hours = head ? Math.max(5, d(100) - P.attrs.FYS) / 60 : d(4);
      G.run.clock += hours;
      this.koLine(`Du våkner ${hours >= 1 ? `etter ${Math.round(hours)} time${Math.round(hours) === 1 ? '' : 'r'}` : `etter ${Math.round(hours * 60)} minutter`}.${P.kp <= 0 || P.loc.huvud <= 0 ? ' Du kan bare krype til du får helbredet deg.' : ''}`, 'good');
      $('#ko-title').textContent = 'Du lever';
      $('#btn-ko-go').disabled = false;
      $('#btn-ko-hero').hidden = true;
      this.ko.done = true;
    });
    return steps;
  }

  koStep() {
    this.koTimer = null;
    const P = G.player;
    if (!this.ko || P.dead) return;
    const step = this.koQueue.shift();
    if (!step) return;
    G.audio.dice?.();
    step();
    if (P.dead) return;
    if (this.koQueue.length) this.koTimer = setTimeout(() => this.koStep(), 750);
  }

  koWake() {
    const P = G.player;
    if (!this.ko || !this.ko.done || P.dead) return;
    this.ko = null;
    P.wakeUp(false);
    G.post.desat = P.helpless ? 0.35 : 0;
    G.ui.hideScreens();
    G.state = 'play';
    G.ui.log(P.helpless ? `${P.name} kommer til seg selv, men kan bare krype. Drikk en legedrikk eller spis noe.` : `${P.name} kommer til seg selv.`);
  }

  // 1 hjältepoäng: du reiser deg med en gang (uv)
  koHero() {
    const P = G.player;
    if (!this.ko || P.hjp <= 0 || P.dead) return;
    if (this.koTimer) { clearTimeout(this.koTimer); this.koTimer = null; }
    P.hjp--;
    G.run.heroUsed = (G.run.heroUsed || 0) + 1;
    this.ko = null;
    P.wakeUp(true);
    for (const e of G.enemies) {
      if (e.dead) continue;
      tmp.set(e.pos.x - P.pos.x, 0, e.pos.z - P.pos.z);
      const dd = tmp.length();
      if (dd < 6) { e.vel.addScaledVector(tmp.normalize(), 14); e.stagger?.(1); }
    }
    G.fx.ring(P.pos, 6, 0xfff0c0, 0.5);
    if (P.isDuck) G.fx.burst('feather', P.pos, 16);
    G.post.desat = 0;
    G.post.flash(0xfff0c0, 0.3);
    G.audio.drake?.();
    G.ui.hideScreens();
    G.state = 'play';
    G.ui.log(`<b class="c-drake">Hjältedåd:</b> ${P.name} reiser seg igjen med ${P.kp} KP.`);
  }

  feathersFor(victory) {
    const r = G.run;
    return r.depthReached * 5 + Math.floor(r.kills / 3) + (victory ? 30 : 0);
  }

  onDeath(instant = false, cause = '') {
    deleteSave('auto');
    const P = G.player;
    if (P.dead) return;
    P.dead = true;
    P.ko = null;
    this.ko = null;
    if (this.koTimer) { clearTimeout(this.koTimer); this.koTimer = null; }
    G.state = 'dead';
    G.audio.playMusic('death', { fast: true });
    G.post.desat = 0;
    const f = this.feathersFor(false);
    G.meta.feathers += f;
    G.meta.best = Math.max(G.meta.best, G.run.depthReached);
    saveMeta(G.meta);
    this.deathCause = cause;
    this.showEnd(false, f, instant);
  }

  onVictory() {
    deleteSave('auto');
    if (G.state === 'dead' || G.state === 'victory' || G.state === 'title') return;
    if (G.state !== 'play') { setTimeout(() => this.onVictory(), 500); return; }
    G.state = 'victory';
    G.audio.playMusic('victory', { fast: true });
    const f = this.feathersFor(true);
    G.meta.feathers += f;
    G.meta.wins++;
    G.meta.best = 5;
    saveMeta(G.meta);
    this.showEnd(true, f);
  }

  showEnd(win, feathers, instant) {
    const r = G.run;
    const P = G.player;
    const mins = Math.max(1, Math.round((performance.now() - r.t0) / 60000));
    $('#end-title').textContent = win ? 'Safranen er funnet' : `${P.name} er død`;
    const cause = this.deathCause ? ` (${this.deathCause})` : '';
    $('#end-text').textContent = win
      ? (P.isNebb
        ? 'Rødpels er beseiret. Safranen ligger i en kiste bak tronen hans, og noe av den er ikke engang spist. Far får beholde jobben. Sjefen sier ikke takk.'
        : `Rødpels er beseiret. ${P.name} bærer safransekkene opp til herr Nansen, som får beholde jobben. Betalingen er hundre sm og et brød fra i forrigårs.`)
      : (P.isNebb
        ? `Svart Nebb ble liggende i mørket under Fristaden${instant ? ' etter ett eneste, altfor hardt slag' : ''}${cause}. Mester Flansen kommer til å si at han visste det. Han kommer til å si det med munnen full av brød.`
        : `${P.name} ble liggende i mørket under Fristaden${instant ? ' etter ett eneste, altfor hardt slag' : ''}${cause}. Herr Nansen leier en ny neste uke.`);
    $('#end-stats').innerHTML = [
      ['Nivå nådd', `${r.depthReached} av 5`],
      ['Fiender felt', r.kills],
      ['Perfekta slag', r.perfekt || 0],
      ['Fummel', r.fummel || 0],
      ['Hjältepoäng brukt', r.heroUsed || 0],
      ['Parerat / dukket', `${r.parries || 0} / ${r.dodges || 0}`],
      ['Skade gjort', r.damageDealt || 0],
      ['Skade tatt', r.damageTaken || 0],
      ['Silver plukket', `${r.silver} sm`],
      ['Tid', `${mins} min`],
    ].map(([k, v]) => `<div><span>${k}</span><b>${v}</b></div>`).join('');
    $('#end-feathers').textContent = `+${feathers} fjær til Mester Flansens dojo`;
    $('#touch').hidden = true;
    this.endRunCleanup();
    G.ui.show('end');
  }

  // --- butikken ------------------------------------------------------------------

  openShop() {
    G.state = 'dialog';
    const D = G.dungeon;
    const P = G.player;
    const lines = P.isNebb ? DAD : NANSEN;
    const inTown = !!D.isTown;
    const idep = inTown ? Math.max(1, G.run.nextDepth || 1) : G.depth + 1;
    if (!D.shopStock) {
      D.shopStock = [
        { id: 'bread', name: 'Brød', desc: 'Helbreder 3 KP. Ferskt i forrigårs.', price: 40 },
        { id: 'potion', name: 'Legedrikk', desc: 'Helbreder 2T6 KP.', price: 140 },
        { id: 'bandage', name: 'Förband', desc: '+2 på Första hjälpen så lenge du har dem.', price: 10, once: true },
        { id: 'stone', name: 'Bryne', desc: '+1 skade resten av løpet.', price: 280, once: true },
        { id: 'picks', name: 'Dyrkar', desc: 'Uten dyrkar er CL i Låsdyrkning halvert.', price: 150, once: true },
        { id: 'repair', name: 'Reparasjon', desc: 'Far fikser alt som er trasig, og gir våpen og skjold full BV. Han har en tang.', price: 60 },
        { id: 'rest', name: 'Sov bak disken', desc: 'En natts søvn i trygghet: litt KP, mye PSY. Gratis.', price: 0, once: true },
        { id: 'item', item: makeItem(idep, G.world.lootOpts({ rarity: 'magisk' })) },
        { id: 'item', item: makeItem(idep, G.world.lootOpts({ luck: 0.4 })) },
      ];
      if (inTown) D.shopStock = D.shopStock.filter(s => s.id !== 'rest');
      for (const s of D.shopStock) if (s.item) { s.name = s.item.name; s.price = s.item.value + 100 * Math.max(0, G.depth); }
      D.dadGreet = inTown ? lines.town[Math.floor(Math.random() * lines.town.length)] : lines.greet[(G.depth - 1) % lines.greet.length];
      D.barter = null;
      D.advance = false;
    }
    if (!P.isNebb) for (const s of D.shopStock) if (s.id === 'repair') s.desc = 'Herr Nansen fikser alt som er trasig, og gir våpen og skjold full BV. Han har en tang.';
    this.dadSay(D.dadGreet);
    this.renderShop(false);
    $('#dlg-who').innerHTML = P.isNebb ? 'Far <span>butikkbetjent, ikke kjøpmann</span>' : 'Herr Nansen <span>butikkbetjent, ikke kjøpmann</span>';
    G.ui.show('dialog');
    G.audio.quack(0.9, 0.6);
  }

  dadSay(text) {
    $('#dlg-text').textContent = text;
  }

  priceOf(s) {
    const P = G.player;
    const D = G.dungeon;
    let m = 1;
    if (P.flags.has('discount')) m *= 0.6;
    if (D.isTown && G.run.guild) m *= 0.9;
    if (D.isTown && (G.run.rykte || 0) <= -2) m *= 1.25;
    if (D.barter === 'good') m *= 0.8;
    else if (D.barter === 'great') m *= 0.6;
    else if (D.barter === 'bad') m *= 1.25;
    return s.price === 0 ? 0 : Math.max(1, Math.round(s.price * m));
  }

  renderShop(showWares) {
    const P = G.player;
    const D = G.dungeon;
    const lines = P.isNebb ? DAD : NANSEN;
    const kw = $('#dlg-kw');
    kw.innerHTML = '';
    const words = ['NAVN', 'JOBB', 'HANDEL', 'SELGE', 'SAFRAN', 'FLANSEN', 'KARAD'];
    if (G.depth >= 2 || G.run.depthReached >= 2) words.push('REVEN');
    if (!D.advance) words.push('FORSKUDD');
    words.push('FARVEL');
    for (const w of words) {
      const b = document.createElement('button');
      b.className = 'kw';
      b.textContent = w;
      b.onclick = () => {
        G.audio.ui();
        if (w === 'HANDEL') { this.startBarter(); return; }
        if (w === 'SELGE') { this.renderSell(); return; }
        if (w === 'FORSKUDD') { this.askAdvance(); return; }
        if (w === 'FARVEL') { this.dadSay(lines.FARVEL); setTimeout(() => this.closeShop(), 700); return; }
        this.dadSay(lines[w]);
      };
      kw.appendChild(b);
    }
    const wares = $('#dlg-wares');
    wares.hidden = !showWares;
    if (!showWares) return;
    const mods = [];
    if (P.flags.has('discount')) mods.push('ansatterabatt');
    if (D.barter === 'good') mods.push('Köpslå: 20% avslag');
    if (D.barter === 'great') mods.push('Köpslå: 40% avslag');
    if (D.barter === 'bad') mods.push('Köpslå: 25% dyrere');
    wares.innerHTML = `<div class="purse">Du har <b>${P.silver}</b> sm${mods.length ? ` <span>(${mods.join(', ')})</span>` : ''}</div>`;
    for (const s of D.shopStock) {
      if (s.sold) continue;
      if (s.id === 'repair' && !Object.values(P.equip).some(it => it?.broken || (it?.durMax && it.dur < it.durMax))) continue;
      if (s.id === 'picks' && P.kit.has('dyrkar')) continue;
      if (s.id === 'bandage' && P.kit.has('forband')) continue;
      const price = this.priceOf(s);
      const row = document.createElement('div');
      row.className = 'ware';
      const nameCol = s.item ? RARITY[s.item.rarity].color : 'var(--parch)';
      const desc = s.item ? s.item.lines.join(', ') : s.desc;
      row.innerHTML = `<div class="txt"><div class="nm" style="color:${nameCol}">${s.name}</div><div class="ds">${desc}</div></div><button class="btn small" ${P.silver < price ? 'disabled' : ''}>${price ? price + ' sm' : 'Gratis'}</button>`;
      row.querySelector('button').onclick = () => this.buy(s, price);
      wares.appendChild(row);
    }
  }

  // Herr Nansen kjøper alt: verdisaker, mat og utstyr
  renderSell() {
    const D = G.dungeon;
    const mod = D.barter === 'great' ? 1.25 : D.barter === 'good' ? 1.1 : D.barter === 'bad' ? 0.8 : 1;
    const P = G.player;
    if (!P.bag.length) { this.dadSay(P.isNebb ? 'Sekken din er tom. Det er ikke noe å selge der.' : 'Du har ingenting å selge. Kom tilbake med noe.'); return; }
    renderSellList($('#dlg-wares'), 'nansen', {
      mod,
      say: t => this.dadSay(t),
      line: (e, n) => (e.type === 'val' ? (P.isNebb ? `${n} sm. Jeg sier ikke til sjefen hvor den kom fra.` : `${n} sm. Jeg spør ikke hvor den kom fra.`) : `${n} sm. Det er det den er verdt her.`),
      back: () => this.renderShop(true),
    });
    this.dadSay(P.isNebb ? 'Vis meg hva du har. Og nei, jeg kjøper ikke brød tilbake til full pris.' : 'Legg det på disken. Jeg betaler det sjefen ville betalt, minus det han ikke vet om.');
  }

  // Köpslå: ett slag per besøk
  startBarter() {
    const P = G.player;
    const D = G.dungeon;
    if (D.barter) { this.dadSay('Se deg om. Ikke ta på noe du ikke skal kjøpe.'); this.renderShop(true); return; }
    P.rollHero('Köpslå', { label: 'Köpslå' }, r => {
      if (r.fummel) { D.barter = 'bad'; this.dadSay('Prute? Med meg? Nå ble alt litt dyrere.'); }
      else if (r.perfekt) { D.barter = 'great'; this.dadSay('Du er verre enn sjefen. Greit, greit. Halv pris nesten.'); }
      else if (r.success) { D.barter = 'good'; this.dadSay('Hmf. Du får en rabatt. Ikke si det til noen.'); }
      else { D.barter = 'none'; this.dadSay('Prisene står på lappene. De står der av en grunn.'); }
      G.ui.logRoll(r, 'Köpslå hos butikkbetjenten.');
      this.renderShop(true);
    });
  }

  askAdvance() {
    const P = G.player;
    const D = G.dungeon;
    D.advance = true;
    if (P.curse.frog) { this.dadSay('Du åpner munnen, og en frosk hopper ut. Han ser lenge på den. Svaret er nei.'); this.renderShop(false); return; }
    P.rollHero('Övertala', { label: 'Övertala' }, r => {
      if (r.success) {
        const n = rollDice('D6') * (r.perfekt ? 40 : 20);
        P.silver += n;
        this.dadSay(P.isNebb ? `Her. ${n} sm. Det er av lønna mi, så ikke bruk alt på brød.` : `Et forskudd. ${n} sm. Det trekkes fra betalingen. Hvis det blir noen betaling.`);
        G.audio.coin();
      } else this.dadSay(P.isNebb ? 'Forskudd? Jeg har ikke fått lønn siden vårsolverv.' : 'Forskudd? Du har ikke funnet noe ennå.');
      G.ui.logRoll(r, 'Övertala butikkbetjenten.');
      this.renderShop(false);
    });
  }

  buy(s, price) {
    const P = G.player;
    if (P.silver < price) return;
    if (s.id === 'potion' && P.potions >= 4 && !canCarry(P, makeCons('legedrikk'))) { this.dadSay('Du har ikke plass til flere. Verken i beltet eller i sekken.'); return; }
    P.silver -= price;
    if (price) G.audio.coin();
    if (s.id === 'bread') {
      if (P.kp < P.maxKP) { P.heal(3); this.dadSay('Tygg ordentlig.'); }
      else if (giveItem(makeCons('brod'))) this.dadSay('Til sekken, da. Ikke klem den.');
      else this.dadSay('Du er jo mett. Men takk for pengene.');
    } else if (s.id === 'potion') { giveItem(makeCons('legedrikk')); this.dadSay('Ikke drikk den på tom mage.'); }
    else if (s.id === 'stone') { P.metaMods.dmg = (P.metaMods.dmg || 0) + 1; P.recalc(); s.sold = true; this.dadSay('Brynet var bestefars. Ikke si det til sjefen.'); }
    else if (s.id === 'picks') { P.kit.add('dyrkar'); s.sold = true; this.dadSay('Til hva? Nei. Ikke svar.'); }
    else if (s.id === 'bandage') { P.kit.add('forband'); s.sold = true; this.dadSay('Rene. Nesten. Jeg har brukt dem på kålen.'); }
    else if (s.id === 'repair') {
      for (const it of Object.values(P.equip)) if (it && (it.broken || (it.durMax && it.dur < it.durMax))) { it.broken = false; if (it.durMax) it.dur = it.durMax; refinalize(it); }
      P.recalc();
      this.dadSay('Sånn. Som nytt. Nesten.');
    } else if (s.id === 'rest') {
      // en natts søvn bak disken, som i trappa
      const txt = this.sleepStairs();
      s.sold = true;
      G.fx.burst('heal', P.pos, 30);
      G.audio.heal();
      this.dadSay('Sov du. Jeg passer butikken. Det er jo det jeg gjør.');
      if (txt) G.ui.log(`Søvn bak disken: ${txt}`);
    } else if (s.item) {
      giveItem(s.item);
      s.sold = true;
      this.dadSay('Den der passer deg. Nesten.');
    }
    this.renderShop(true);
  }

  closeShop() {
    if (G.state !== 'dialog') return;
    if (G.talk?.npc) { G.talk.close(); return; }
    const tl = G.dungeon?.life;
    if (tl?.talkingNansen) { tl.talkingNansen.talking = false; tl.talkingNansen = null; }
    G.ui.hideScreens();
    G.state = 'play';
    G.ui.buildBar();
  }

  // --- pause og rollformulär ---------------------------------------------

  pause() {
    if (G.state !== 'play') return;
    G.state = 'pause';
    const P = G.player;
    const qs = Object.entries(G.run.quests || {}).filter(([, q]) => q.state === 'active' || q.state === 'done');
    const journal = (qs.length ? '<h3>Oppdrag</h3>' + qs.map(([id, q]) => `<div class="qrow ${q.state}">${q.state === 'done' ? 'Fullført: ' : ''}${QUEST_TITLES[id] || id}</div>`).join('') : '') + journalHTML();
    $('#pause-quests').innerHTML = journal || `<div class="pz-empty">Ingen oppdrag ennå. ${G.dungeon.isTown && !G.dungeon.isArea ? 'Oppslagstavla på torget har arbeid, og folk i byen vet ting.' : 'Folk i Fristaden har arbeid, og oppslagstavla på torget henger fullt.'}</div>`;
    // løpet i korte trekk
    const D = G.dungeon;
    const place = D.isArea ? D.L.name : D.isTown ? 'Fristaden' : FLOORS[G.depth]?.name || '';
    const c = G.run.clock, h = ((c % 24) + 24) % 24;
    const when = `Dag ${Math.floor(c / 24) + 1}, ${String(Math.floor(h)).padStart(2, '0')}.${String(Math.floor((h % 1) * 6) * 10).padStart(2, '0')}`;
    const cells = [['Sted', place], ['Tid', when], ['Silver', `${P.silver} sm`], ['Hjältepoäng', P.hjp ?? 0]];
    if (D.isTown && !D.isArea) cells.push(['Rykte', (G.run.rykte || 0) > 0 ? `+${G.run.rykte}` : String(G.run.rykte || 0)]);
    else if (!D.isTown) cells.push(['Nivå', `${G.depth} av 5`]);
    else cells.push(['Fiender felt', G.run.kills || 0]);
    $('#pz-run').innerHTML = cells.map(([k, v]) => `<div><span>${k}</span><b title="${v}">${v}</b></div>`).join('');
    $('#btn-quit').classList.remove('armed');
    $('#pz-warn').hidden = true;
    this.pauseTab('journal');
    G.ui.show('pause');
    $('#btn-resume').focus({ preventScroll: true });
  }
  openSheet() {
    if (G.state !== 'play' && G.state !== 'pause') return;
    G.state = 'sheet';
    G.ui.renderSheet();
    G.ui.show('sheet');
  }
  resume() {
    document.activeElement?.blur?.();
    if (G.state === 'pause' || G.state === 'sheet' || G.state === 'dialog') {
      G.ui.hideScreens();
      G.state = 'play';
    }
  }

  // --- løkke ---------------------------------------------------------------

  updateAim() {
    const inp = G.input;
    const ndc = tmp.set((inp.mouse.x / innerWidth) * 2 - 1, -(inp.mouse.y / innerHeight) * 2 + 1, 0);
    this.raycaster.setFromCamera(ndc, G.camera);
    const hit = this.raycaster.ray.intersectPlane(this.ground, tmp2);
    if (hit) G.aim.copy(hit);
  }

  loop(now) {
    requestAnimationFrame(t => this.loop(t));
    let dt = Math.max(0, Math.min(0.05, (now - this.last) / 1000));
    this.last = now;
    const inp = G.input;
    const P = G.player;
    const inTitle = G.state === 'title' || G.state === 'splash';
    inp.allowNav = inTitle || G.state === 'dialog';
    const typing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName);
    if (G.state === 'title') this.titleKeys(inp);
    else if (inp.wasPressed('Escape')) {
      if (G.state === 'inventory') G.inv.close();
      else if (G.state === 'travel') G.travel.close();
      else if (!$('#saves').hidden) this.closeSaves();
      else if (!$('#opts').hidden) this.closeOpts();
      else if (G.state === 'play') this.pause();
      else if (G.state === 'dialog') this.closeShop();
      else this.resume();
    }
    if (inp.wasPressed('KeyM') && !inTitle && !typing) G.audio.setMuted(!G.audio.muted);
    if (G.state === 'play') {
      if (inp.wasPressed('KeyC')) this.openSheet();
      if (inp.wasPressed('Tab')) G.ui.toggleBigMap();
      if (inp.wasPressed('KeyI') && !typing) G.inv.open();
    } else if (G.state === 'sheet' && inp.wasPressed('KeyC')) this.resume();
    else if (G.state === 'inventory' && inp.wasPressed('KeyI')) G.inv.close();

    G.post.tiltWant = inTitle ? 0.5 : G.state === 'inventory' ? 0 : 0.85;
    if (inTitle) {
      G.post.mood('tittel');
      G.time += dt;
      if (this.title.leaving) this.title.leave = Math.min(1, this.title.leave + dt / 0.75);
      this.title.update(dt, G.camera);
      this.renderPass.scene = this.title.scene;
      G.post.tick(dt, G.time);
      G.audio.update(dt);
      G.composer.render();
      inp.endFrame();
      return;
    }
    this.renderPass.scene = G.scene;

    if (G.state === 'play') {
      let gdt = dt;
      if (G.hitStop > 0) { G.hitStop -= dt; gdt = dt * 0.06; }
      if (G.slowmo > 0) { G.slowmo -= dt; gdt *= 0.3; }
      G.time += gdt;
      G.run.clock += gdt / 120;
      this.updateAim();
      if (inp.wasPressed('KeyE')) G.world.interact();
      else if (inp.wasPressed('KeyX') && G.world.nearItem?.kind === 'item') G.world.interact(true);
      this.flowTimer -= gdt;
      if (this.flowTimer <= 0) { this.flowTimer = 0.25; G.dungeon.computeFlow(P.pos.x, P.pos.z); }
      P.update(gdt, inp);
      for (let i = G.enemies.length - 1; i >= 0; i--) {
        if (!G.enemies[i].update(gdt)) { G.enemies[i].dispose(); G.enemies.splice(i, 1); }
      }
      if (G.dungeon.isTown) G.dungeon.update(gdt, P, this.townLights(gdt));
      G.world.update(gdt, G.camera);
      G.fx.update(gdt, G.camera);
      G.ui.update(dt);
      this.musicTimer = (this.musicTimer || 0) - dt;
      if (this.musicTimer <= 0) {
        this.musicTimer = 0.3;
        let n = 0;
        for (const e of G.enemies) if (!e.dead && e.alerted && !e.def.boss && Math.abs(e.pos.x - P.pos.x) + Math.abs(e.pos.z - P.pos.z) < 22) n++;
        G.audio.music?.setIntensity(Math.min(1, n * 0.34));
      }
    } else {
      G.time += dt;
      if (G.state === 'deathroll') {
        P.animate(dt, 0);
        for (const e of G.enemies) e.animate(dt * 0.3);
      }
      if (G.state === 'inventory') {
        // rollpersonen snur seg mot kameraet og står og puster
        let dy = Math.atan2(CAM_OFF.x, CAM_OFF.z) - 0.35 - P.yaw;
        dy = Math.atan2(Math.sin(dy), Math.cos(dy));
        P.yaw += dy * Math.min(1, dt * 5);
        P.root.rotation.y = P.yaw;
        P.animate(dt, 0);
        G.icons?.tick(dt);
      }
      if (G.dungeon?.isTown && (G.state === 'dialog' || G.state === 'transition' || G.state === 'inventory')) G.dungeon.update(dt, P, this.townLights(dt));
      G.world.update(0, G.camera);
      G.fx.update(G.state === 'deathroll' ? dt * 0.2 : dt, G.camera);
    }
    G.ambient.update(dt, P.pos, G.time);
    if (G.state !== 'title' && G.state !== 'splash') G.weather.update(G.state === 'play' || G.state === 'dialog' ? dt : dt * 0.3, this.camTarget, G.time);
    G.post.tick(dt, G.time);
    G.audio.update(dt);
    this.updateCamera(dt);
    this.updateLights(dt);
    G.water.update(dt);
    G.composer.render();
    inp.endFrame();
  }

  titleKeys(inp) {
    if (this.wiping || performance.now() < (this.titleReadyAt || 0)) return;
    const typing = ['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement?.tagName);
    if (this.view === 'tv-menu') {
      if (inp.wasPressed('ArrowDown') || inp.wasPressed('KeyS')) this.selectMenu((this.menuSel ?? 0) + 1);
      if (inp.wasPressed('ArrowUp') || inp.wasPressed('KeyW')) this.selectMenu((this.menuSel ?? 0) - 1);
      const items = this.menuItems();
      if ((inp.wasPressed('Enter') || inp.wasPressed('Space')) && !items.includes(document.activeElement)) {
        this.menuAction(items[this.menuSel ?? 0].dataset.act);
      }
    } else if (inp.wasPressed('Escape') || (inp.wasPressed('Backspace') && !typing)) {
      if (this.view === 'tv-create') { this.refreshPick(); this.showView('tv-pick'); G.audio.menuTick?.(57); }
      else this.backToMenu();
    }
  }

  updateCamera(dt) {
    const cam = G.camera;
    const P = G.player;
    const lead = tmp2.set(0, 0, 0);
    if (G.state === 'play' && !G.input.usingTouch) {
      lead.set(G.aim.x - P.pos.x, 0, G.aim.z - P.pos.z);
      const l = lead.length();
      if (l > 6) lead.multiplyScalar(6 / l);
      lead.multiplyScalar(0.18);
    }
    // nærbilde når packningen er åpen
    const wantClose = G.state === 'inventory' ? 1 : 0;
    this.closeK = (this.closeK || 0) + (wantClose - (this.closeK || 0)) * (1 - Math.exp(-5 * dt));
    const ck = this.closeK < 0.002 ? 0 : this.closeK;
    const ce = ck * ck * (3 - 2 * ck);
    this.camTarget.lerp(tmp.set(P.pos.x + lead.x, 0.6 + ce * 0.05, P.pos.z + lead.z), 1 - Math.exp(-7 * dt));
    if (G.camLock) this.camTarget.copy(G.camLock); // feilsøking og skjermbilder
    const sh = G.fx.shake * G.fx.shake * (G.shakeMul ?? 1);
    const off = tmp3.copy(CAM_OFF).lerp(CLOSE_OFF, ce);
    cam.position.set(this.camTarget.x + off.x, this.camTarget.y + off.y, this.camTarget.z + off.z);
    if (ce > 0) {
      const w = innerWidth, h = innerHeight;
      const panel = document.querySelector('#inv .inv-panel');
      const narrow = w <= 820;
      const pw = panel ? panel.offsetWidth : Math.min(800, w);
      const ph = panel ? panel.offsetHeight : h * 0.66;
      const xo = narrow ? 0 : (pw / 2) * ce;
      const yo = narrow ? (ph / 2) * ce * 0.9 : 0;
      cam.setViewOffset(w, h, xo, yo, w, h);
      const el = document.querySelector('#inv');
      if (el) el.style.setProperty('--sx', `${((w - pw) / 2 / w) * 100}%`);
      this.viewOff = true;
    } else if (this.viewOff) { cam.clearViewOffset(); this.viewOff = false; }
    if (sh > 0.001) {
      const t = G.time * 60;
      cam.position.x += (Math.sin(t * 1.3) + Math.sin(t * 2.7)) * sh * 0.35;
      cam.position.y += Math.sin(t * 1.9) * sh * 0.3;
      cam.position.z += (Math.cos(t * 1.7) + Math.sin(t * 3.1)) * sh * 0.35;
    }
    cam.lookAt(this.camTarget);
  }

  updateLights(dt = 0.016) {
    const P = G.player;
    if (this.inTown) {
      const cam = G.camera;
      cam.updateMatrixWorld();
      tmp.set(P.pos.x, 1.0, P.pos.z).project(cam);
      const pr = G.renderer.getPixelRatio();
      cutawayUniforms.uCutPos.value.set((tmp.x * 0.5 + 0.5) * innerWidth * pr, (tmp.y * 0.5 + 0.5) * innerHeight * pr);
      tmp.set(P.pos.x, 1.0, P.pos.z).applyMatrix4(cam.matrixWorldInverse);
      cutawayUniforms.uCutDepth.value = -tmp.z;
      cutawayUniforms.uCutR.value = innerHeight * pr * 0.17;
      return;
    }
    const want = P.fx?.barsark ? 1 : 0;
    this.rageMix = (this.rageMix || 0) + (want - (this.rageMix || 0)) * Math.min(1, dt * 4);
    const light = P.fx?.light ? 1.6 : 1;
    this.lantern.color.setRGB(1, 0.69 - 0.4 * this.rageMix, 0.44 - 0.34 * this.rageMix);
    this.lantern.intensity = (9 + this.rageMix * 10) * light;
    this.lantern.distance = 8 * (P.fx?.light ? 1.5 : 1);
    this.key.position.set(P.pos.x + 1.5, 11, P.pos.z + 1.5);
    this.key.target.position.set(P.pos.x, 0, P.pos.z);
    this.key.target.updateMatrixWorld();
    this.lantern.position.set(P.pos.x + 1.2, 2.3, P.pos.z + 1.2);
    this.fill.position.set(P.pos.x + 10, 14, P.pos.z + 10);
    this.fill.target.position.copy(P.pos);
    this.fill.target.updateMatrixWorld();
    const cam = G.camera;
    cam.updateMatrixWorld();
    tmp.set(P.pos.x, 1.0, P.pos.z).project(cam);
    const pr = G.renderer.getPixelRatio();
    cutawayUniforms.uCutPos.value.set((tmp.x * 0.5 + 0.5) * innerWidth * pr, (tmp.y * 0.5 + 0.5) * innerHeight * pr);
    tmp.set(P.pos.x, 1.0, P.pos.z).applyMatrix4(cam.matrixWorldInverse);
    cutawayUniforms.uCutDepth.value = -tmp.z;
    cutawayUniforms.uCutR.value = innerHeight * pr * 0.16;
  }
}

void rollDice; void LOC_SHORT; void SR; void Enemy; void buildRat;

// Materialene får ferdig dekodede bilder. Manglende bilder bruker de gamle fabrikkene.
loadTextureImages().then(() => new Game().init());
