// Regeldata fra Drakar och Demoner (2023), også kjent som Dragonbane.
// Navn på regler, ferdigheter og evner står på svensk som i boka. Forklaringene er på norsk.
// Felt merket uv: true er ikke verifisert mot grunnboka (se memory.md).
// Ereb Altor-data (Aidne-bakgrunn, navn) er fra "Hjältar från Kopparhavet".

export const ATTRS = ['STY', 'FYS', 'SMI', 'INT', 'PSY', 'KAR'];
export const ATTR_NAME = { STY: 'Styrka', FYS: 'Fysik', SMI: 'Smidighet', INT: 'Intelligens', PSY: 'Psyke', KAR: 'Karisma' };

// Grundchans: ferdigheter du ikke er tränad i. Tränad = to ganger grundchans.
export function baseChance(v) {
  if (v <= 5) return 3;
  if (v <= 8) return 4;
  if (v <= 12) return 5;
  if (v <= 15) return 6;
  return 7;
}

// Skadebonus fra STY eller SMI (avhengig av våpenets ferdighet)
export function dmgBonusDie(v) {
  if (v >= 17) return 'D6';
  if (v >= 13) return 'D4';
  return null;
}

// Förflyttning: släktets grunnverdi pluss justering for SMI
export function moveMod(smi) {
  if (smi <= 6) return -4;
  if (smi <= 9) return -2;
  if (smi <= 12) return 0;
  if (smi <= 15) return 2;
  return 4;
}

// use: hva ferdigheten gjør i spillet (tom = ingen bruk ennå)
export const SKILLS = [
  { id: 'Hoppa & klättra', attr: 'SMI', type: 'gen', en: 'Acrobatics', use: '' },
  { id: 'Upptäcka fara', attr: 'INT', type: 'gen', en: 'Awareness', use: 'Bakhold: ser du fiendene først, blir de overrasket.' },
  { id: 'Köpslå', attr: 'KAR', type: 'gen', en: 'Bartering', use: 'Prute hos butikkbetjenten.' },
  { id: 'Bestiologi', attr: 'INT', type: 'gen', en: 'Beast Lore', use: 'Kjenne igjen fiender og svakhetene deres.' },
  { id: 'Bluffa', attr: 'KAR', type: 'gen', en: 'Bluffing', use: '' },
  { id: 'Vildmarksvana', attr: 'INT', type: 'gen', en: 'Bushcraft', use: '' },
  { id: 'Hantverk', attr: 'STY', type: 'gen', en: 'Crafting', use: 'Reparere trasig utrustning når du hviler.' },
  { id: 'Undvika', attr: 'SMI', type: 'gen', en: 'Evade', use: 'Dukke unna angrep.' },
  { id: 'Läkekonst', attr: 'INT', type: 'gen', en: 'Healing', use: 'Plaster om følgesvennen din.' },
  { id: 'Jakt & fiske', attr: 'SMI', type: 'gen', en: 'Hunting & Fishing', use: '' },
  { id: 'Främmande språk', attr: 'INT', type: 'gen', en: 'Languages', use: 'Lese dvergeruner.' },
  { id: 'Myter & legender', attr: 'INT', type: 'gen', en: 'Myths & Legends', use: 'Lese dvergeruner.' },
  { id: 'Uppträda', attr: 'KAR', type: 'gen', en: 'Performance', use: '' },
  { id: 'Övertala', attr: 'KAR', type: 'gen', en: 'Persuasion', use: 'Be om forskudd hos butikkbetjenten.' },
  { id: 'Rida', attr: 'SMI', type: 'gen', en: 'Riding', use: '' },
  { id: 'Sjökunnighet', attr: 'INT', type: 'gen', en: 'Seamanship', use: '' },
  { id: 'Fingerfärdighet', attr: 'SMI', type: 'gen', en: 'Sleight of Hand', use: 'Dyrke opp låste kister.' },
  { id: 'Smyga', attr: 'SMI', type: 'gen', en: 'Sneaking', use: 'Snike. Neste angrep blir et smyganfall.' },
  { id: 'Finna dolda ting', attr: 'INT', type: 'gen', en: 'Spot Hidden', use: 'Finne gjemmesteder i veggene.' },
  { id: 'Simma', attr: 'SMI', type: 'gen', en: 'Swimming', use: 'Kave seg fram i dypt vann.' },
  { id: 'Yxa', attr: 'STY', type: 'vap', en: 'Axes', use: 'Øks' },
  { id: 'Pilbåge', attr: 'SMI', type: 'vap', en: 'Bows', use: 'Bue' },
  { id: 'Slagsmål', attr: 'STY', type: 'vap', en: 'Brawling', use: 'Uten våpen' },
  { id: 'Armborst', attr: 'SMI', type: 'vap', en: 'Crossbows', use: 'Armbrøst' },
  { id: 'Hammare', attr: 'STY', type: 'vap', en: 'Hammers', use: 'Hammer og klubbe' },
  { id: 'Kniv', attr: 'SMI', type: 'vap', en: 'Knives', use: 'Kniv og dolk, også kast' },
  { id: 'Slunga', attr: 'SMI', type: 'vap', en: 'Slings', use: 'Slynge' },
  { id: 'Spjut', attr: 'STY', type: 'vap', en: 'Spears', use: 'Spyd og hellebard' },
  { id: 'Stav', attr: 'SMI', type: 'vap', en: 'Staves', use: 'Stav' },
  { id: 'Svärd', attr: 'STY', type: 'vap', en: 'Swords', use: 'Sverd' },
  // sekundære: ingen grundchans før du har lært dem
  { id: 'Animism', attr: 'INT', type: 'sek', en: 'Animism', use: 'Magiskole' },
  { id: 'Elementarism', attr: 'INT', type: 'sek', en: 'Elementalism', use: 'Magiskole', uv: true },
  { id: 'Mentalism', attr: 'INT', type: 'sek', en: 'Mentalism', use: 'Magiskole' },
  { id: 'Observation', attr: 'INT', type: 'sek', en: 'Observation', use: '', ereb: true, uv: true },
  { id: 'Taktik', attr: 'INT', type: 'sek', en: 'Tactics', use: '', ereb: true, uv: true },
];
export const SKILL = Object.fromEntries(SKILLS.map(s => [s.id, s]));
export const GENERAL = SKILLS.filter(s => s.type === 'gen').map(s => s.id);
export const WEAPON_SKILLS = SKILLS.filter(s => s.type === 'vap').map(s => s.id);
export const MELEE_STR = ['Yxa', 'Hammare', 'Slagsmål', 'Spjut', 'Svärd']; // skjold pareres med beste av disse

// --- Tillstånd ------------------------------------------------------------
export const CONDITIONS = [
  { id: 'UTM', name: 'Utmattad', attr: 'STY', en: 'Exhausted' },
  { id: 'KRA', name: 'Krasslig', attr: 'FYS', en: 'Sickly' },
  { id: 'OMT', name: 'Omtöcknad', attr: 'SMI', en: 'Dazed' },
  { id: 'ARG', name: 'Arg', attr: 'INT', en: 'Angry' },
  { id: 'RAD', name: 'Rädd', attr: 'PSY', en: 'Scared' },
  { id: 'UPP', name: 'Uppgiven', attr: 'KAR', en: 'Disheartened' },
];
export const COND_BY_ID = Object.fromEntries(CONDITIONS.map(c => [c.id, c]));
export const COND_BY_ATTR = Object.fromEntries(CONDITIONS.map(c => [c.attr, c.id]));

// --- Ålder ------------------------------------------------------------------
export const AGES = [
  { id: 'ung', name: 'Ung', roll: '1-3', free: 2, mods: { SMI: 1, FYS: 1 } },
  { id: 'medel', name: 'Medelålders', roll: '4-5', free: 4, mods: {} },
  { id: 'gammal', name: 'Gammal', roll: '6', free: 6, mods: { STY: -2, SMI: -2, FYS: -2, INT: 1, PSY: 1 } },
];
export function ageFromD6(r) { return r <= 3 ? 'ung' : r <= 5 ? 'medel' : 'gammal'; }

// --- Släkten ----------------------------------------------------------------
export const KINS = [
  {
    id: 'manniska', name: 'Människa', roll: '1-4', move: 10, abilities: ['anpasslig'],
    desc: 'Tilpasningsdyktige og overalt. Den vanligste släkten i Ereb Altor.',
    names: ['Joruna', 'Tym', 'Halvelda', 'Garmander', 'Verolun', 'Lothar'],
    ereb: ['Baldvin', 'Berceval', 'Cassian', 'Crispin', 'Edegar', 'Folkard', 'Garin', 'Gaspard', 'Kyrian', 'Krystof', 'Regin', 'Valien', 'Briann', 'Fabia', 'Jehanne', 'Gylvanda', 'Isold', 'Lavena', 'Aliana', 'Gynerva', 'Gilda', 'Helvid', 'Rosmynda', 'Hild'],
  },
  {
    id: 'halvling', name: 'Halvling', roll: '5-7', move: 8, abilities: ['halsomenal'],
    desc: 'Små, raske og vanskelige å få tak i. Glad i mat og trygge kroker.',
    names: ['Mirabel', 'Tobolt', 'Pimpa', 'Brodd', 'Hemlin', 'Rosmarie'], namesUv: true,
  },
  {
    id: 'dvarg', name: 'Dvärg', roll: '8-9', move: 8, abilities: ['langsint'],
    desc: 'Lave, brede og glemmer aldri en oförrätt. Karad Batur var et dvergerike.',
    names: ['Tinderrock', 'Halwyld', 'Tymolana', 'Traut', 'Urd', 'Fermer'],
    ereb: ['Ardun', 'Bataar', 'Zungar', 'Daguur', 'Dorj', 'Bolor', 'Jargal', 'Otgon', 'Temur', 'Zabrak', 'Altun', 'Badma', 'Dhurm', 'Hurrum', 'Jaran', 'Khula', 'Oyuun', 'Saran', 'Tuul', 'Tuya'],
  },
  {
    id: 'alv', name: 'Alv', roll: '10', move: 10, abilities: ['inrefrid'],
    desc: 'Høye, slanke og gamle til sinns. Kan meditere i stedet for å sove.',
    names: ['Arasin', 'Illyriana', 'Galvander', 'Tyrindelia', 'Erwilnor', 'Andremone'],
  },
  {
    id: 'anka', name: 'Anka', roll: '11', move: 8, abilities: ['vresig', 'simfotter'],
    desc: 'Hissige, stolte og bedre i vann enn alle andre. Svart Nebb er en anka.',
    names: ['Qwacksum', 'Splats', 'Mogghi', 'Groddy', 'Blisandina', 'Fjäderpuff'],
  },
  {
    id: 'vargfolk', name: 'Vargfolk', roll: '12', move: 12, abilities: ['jaktsinne'],
    desc: 'Ulvehoder med nese for byttedyr. Raskest av alle til fots.',
    names: ['Wyld', 'Lunariem', 'Obdurian', 'Wuldenhall', 'Grawe', 'Ylvadis'], namesUv: true,
  },
];
export const KIN = Object.fromEntries(KINS.map(k => [k.id, k]));
export function kinFromD12(r) { return r <= 4 ? 'manniska' : r <= 7 ? 'halvling' : r <= 9 ? 'dvarg' : r === 10 ? 'alv' : r === 11 ? 'anka' : 'vargfolk'; }

// Släktesförmågor. key = tasten (F)
export const KIN_ABILITIES = {
  anpasslig: { name: 'Anpasslig', en: 'Adaptive', vp: 3, uv: true,
    dod: 'Bruk verdien til en annen ferdighet når du slår, hvis du kan forklare hvorfor.',
    game: 'F: neste slag bruker den beste tränade ferdigheten din i stedet.' },
  halsomenal: { name: 'Hal som en ål', en: 'Hard to Catch', vp: 3, uv: true,
    dod: 'Fördel på slaget når du undviker et angrep.',
    game: 'F: neste Undvika-slag får fördel.' },
  langsint: { name: 'Långsint', en: 'Unforgiving', vp: 3,
    dod: 'Fördel når du angriper noen som har skadet deg (når som helst før).',
    game: 'F: neste angrep mot en fiende som har skadet deg får fördel.' },
  inrefrid: { name: 'Inre frid', en: 'Inner Peace', vp: 0, uv: true,
    dod: 'Mediter under kort vila: ekstra T6 KP, T6 VP og ett tillstånd til. Helt borte mens du mediterer.',
    game: 'F: kort vila med meditasjon (ekstra helbreding).' },
  vresig: { name: 'Vresig', en: 'Ill-Tempered', vp: 3,
    dod: 'Ikke en handling. Fördel på ett slag, og du blir Arg. Gjelder ikke INT-slag. Kan brukes igjen selv om du er Arg.',
    game: 'F: neste slag (ikke INT) får fördel. Etterpå er du Arg.' },
  simfotter: { name: 'Simfötter', en: 'Webbed Feet', vp: 0, passive: true,
    dod: 'Fördel på Simma. Full förflyttning i og under vann.',
    game: 'Alltid på: full fart i vann og ingen ulempe av vannet.' },
  jaktsinne: { name: 'Jaktsinne', en: 'Hunting Instincts', vp: 3,
    dod: 'Utpek et bytte du ser eller lukter. Følg sporet en hel dag. 1 VP til gir fördel på et angrep mot det.',
    game: 'F: merk fienden nærmest siktet som bytte. Angrep mot byttet bruker 1 VP for fördel.' },
};

// --- Våpen -----------------------------------------------------------------
// f: sub = smidig (subtle), p/s/b = stikk/hugg/kross, top = fellende, thr = kan kastes, long = lang,
//    nopar = kan ikke parere, nodb = ingen skadebonus
// kind: animasjon og treffbue i spillet
export const WEAPONS = {
  obevapnad: { name: 'Obeväpnad', skill: 'Slagsmål', grip: 1, str: 0, dmg: 'D6', dur: 0, f: ['b', 'nopar'], kind: 'fist', metal: false },
  kniv: { name: 'Kniv', skill: 'Kniv', grip: 1, str: 0, dmg: 'D8', dur: 6, f: ['sub', 'p', 'thr'], kind: 'knife', metal: true, price: 1 },
  dolk: { name: 'Dolk', skill: 'Kniv', grip: 1, str: 0, dmg: 'D8', dur: 9, f: ['sub', 'p', 's', 'thr'], kind: 'knife', metal: true, price: 2 },
  parerdolk: { name: 'Parerdolk', skill: 'Kniv', grip: 1, str: 0, dmg: 'D6', dur: 15, f: ['sub', 'p', 's'], kind: 'knife', metal: true, price: 4, uv: true },
  kortsvard: { name: 'Kortsvärd', skill: 'Svärd', grip: 1, str: 7, dmg: 'D10', dur: 12, f: ['p', 's'], kind: 'sword', metal: true, price: 8 },
  bredsvard: { name: 'Bredsvärd', skill: 'Svärd', grip: 1, str: 10, dmg: '2D6', dur: 15, f: ['p', 's'], kind: 'sword', metal: true, price: 12 },
  langsvard: { name: 'Långsvärd', skill: 'Svärd', grip: 1, str: 13, dmg: '2D8', dur: 15, f: ['p', 's'], kind: 'sword', metal: true, price: 20 },
  tvahandssvard: { name: 'Tvåhandssvärd', skill: 'Svärd', grip: 2, str: 16, dmg: '2D10', dur: 15, f: ['p', 's'], kind: 'great', metal: true, price: 40, uv: true },
  sabel: { name: 'Sabel', skill: 'Svärd', grip: 1, str: 10, dmg: '2D6', dur: 12, f: ['top', 's'], kind: 'sword', metal: true, price: 12 },
  handyxa: { name: 'Handyxa', skill: 'Yxa', grip: 1, str: 7, dmg: '2D6', dur: 9, f: ['top', 's', 'thr'], kind: 'axe', metal: true, price: 5 },
  stridsyxa: { name: 'Stridsyxa', skill: 'Yxa', grip: 1, str: 13, dmg: '2D8', dur: 9, f: ['top', 's'], kind: 'axe', metal: true, price: 18 },
  tvahandsyxa: { name: 'Tvåhandsyxa', skill: 'Yxa', grip: 2, str: 13, dmg: '2D10', dur: 9, f: ['top', 's'], kind: 'great', metal: true, price: 30 },
  stridsklubba: { name: 'Stridsklubba', skill: 'Hammare', grip: 1, str: 7, dmg: '2D4', dur: 12, f: ['b'], kind: 'hammer', metal: true, price: 4, uv: true },
  morgonstjarna: { name: 'Morgonstjärna', skill: 'Hammare', grip: 1, str: 13, dmg: '2D8', dur: 12, f: ['b'], kind: 'hammer', metal: true, price: 16 },
  slagslanda: { name: 'Slagslända', skill: 'Hammare', grip: 1, str: 13, dmg: '2D8', dur: 0, f: ['b', 'top', 'nopar'], kind: 'hammer', metal: true, price: 18 },
  lattstridshammare: { name: 'Lätt stridshammare', skill: 'Hammare', grip: 1, str: 10, dmg: '2D6', dur: 12, f: ['b', 'top'], kind: 'hammer', metal: true, price: 10 },
  tungstridshammare: { name: 'Tung stridshammare', skill: 'Hammare', grip: 2, str: 16, dmg: '2D10', dur: 12, f: ['b', 'top'], kind: 'great', metal: true, price: 30 },
  litenklubba: { name: 'Liten klubba', skill: 'Hammare', grip: 1, str: 7, dmg: 'D8', dur: 9, f: ['b'], kind: 'hammer', metal: false, price: 1 },
  storklubba: { name: 'Stor klubba', skill: 'Hammare', grip: 2, str: 16, dmg: '2D8', dur: 12, f: ['b'], kind: 'great', metal: false, price: 3 },
  stav: { name: 'Stav', skill: 'Stav', grip: 2, str: 7, dmg: 'D8', dur: 9, f: ['b', 'top'], kind: 'staff', metal: false, price: 1 },
  kortspjut: { name: 'Kortspjut', skill: 'Spjut', grip: 1, str: 7, dmg: 'D10', dur: 9, f: ['p', 'thr'], kind: 'spear', metal: true, price: 3 },
  langspjut: { name: 'Långspjut', skill: 'Spjut', grip: 2, str: 10, dmg: '2D8', dur: 9, f: ['p', 'long'], kind: 'spear', metal: true, price: 6 },
  hillebard: { name: 'Hillebard', skill: 'Spjut', grip: 2, str: 13, dmg: '2D8', dur: 12, f: ['p', 's', 'top', 'long'], kind: 'spear', metal: true, price: 20 },
  treudd: { name: 'Treudd', skill: 'Spjut', grip: 1, str: 10, dmg: 'D10', dur: 9, f: ['p', 'thr'], kind: 'spear', metal: true, price: 6, uv: true },
  slunga: { name: 'Slunga', skill: 'Slunga', grip: 1, str: 0, dmg: 'D8', dur: 0, f: ['b', 'nopar'], kind: 'sling', range: 20, metal: false, price: 1 },
  kortbage: { name: 'Kortbåge', skill: 'Pilbåge', grip: 2, str: 7, dmg: 'D10', dur: 3, f: ['p', 'nopar'], kind: 'bow', range: 30, metal: false, price: 6 },
  langbage: { name: 'Långbåge', skill: 'Pilbåge', grip: 2, str: 13, dmg: 'D12', dur: 6, f: ['p', 'nopar'], kind: 'bow', range: 100, metal: false, price: 18 },
  lattarmborst: { name: 'Lätt armborst', skill: 'Armborst', grip: 2, str: 7, dmg: '2D6', dur: 6, f: ['p', 'nodb', 'nopar'], kind: 'xbow', range: 40, metal: false, price: 12 },
  tungtarmborst: { name: 'Tungt armborst', skill: 'Armborst', grip: 2, str: 13, dmg: '2D8', dur: 9, f: ['p', 'nodb', 'nopar'], kind: 'xbow', range: 60, metal: false, price: 26 },
  litenskold: { name: 'Liten sköld', shield: true, grip: 1, str: 7, dmg: 'D8', dur: 15, f: ['b'], kind: 'shield', metal: false, price: 5 },
  storskold: { name: 'Stor sköld', shield: true, grip: 1, str: 13, dmg: 'D8', dur: 18, f: ['b'], kind: 'shield', metal: false, price: 10 },
};
export const RANGED_KINDS = ['bow', 'xbow', 'sling'];

// Rustning og hjelmer. bane: ferdigheter som får nackdel
export const ARMORS = {
  lader: { name: 'Läderrustning', rating: 1, bane: [], type: 'lader', metal: false, price: 4 },
  nitlader: { name: 'Nitläder', rating: 2, bane: ['Smyga'], type: 'lader', metal: false, price: 10 },
  ringbrynja: { name: 'Ringbrynja', rating: 4, bane: ['Undvika', 'Smyga'], type: 'ring', metal: true, price: 40 },
  platrustning: { name: 'Plåtrustning', rating: 6, bane: ['Hoppa & klättra', 'Undvika', 'Smyga'], type: 'plat', metal: true, price: 100, uv: true },
};
export const HELMETS = {
  oppenhjalm: { name: 'Öppen hjälm', rating: 1, bane: ['Upptäcka fara'], metal: true, price: 6 },
  tunnhjalm: { name: 'Tunnhjälm', rating: 2, bane: ['Upptäcka fara', 'avstand'], metal: true, price: 20 },
};
// Valgfri regel: skadetyper. Lær tåler kross bedre, ringbrynje tåler hugg bedre.
export function armorTypeBonus(type, dmgType) {
  if (type === 'lader' && dmgType === 'b') return 2;
  if (type === 'ring' && dmgType === 's') return 2;
  return 0;
}

// Annen utrustning fra startpakkene. fx = hva det gjør i spillet
export const GEAR = {
  fackla: { name: 'Fackla' },
  elddon: { name: 'Elddon' },
  rep: { name: 'Rep' },
  entrehake: { name: 'Änterhake' },
  smedverktyg: { name: 'Smidesverktyg', fx: 'smith' },
  snickarverktyg: { name: 'Snickarverktyg', fx: 'carpenter' },
  garvarverktyg: { name: 'Garvarverktyg', fx: 'tanner' },
  lykta: { name: 'Lykta och lampolja', fx: 'light' },
  oljelampa: { name: 'Oljelampa och lampolja', fx: 'light' },
  lyra: { name: 'Lyra', fx: 'instrument' },
  flojt: { name: 'Flöjt', fx: 'instrument' },
  horn: { name: 'Horn', fx: 'instrument' },
  koger: { name: 'Koger' },
  sovfall: { name: 'Sovfäll', fx: 'rest' },
  snara: { name: 'Snara' },
  metspo: { name: 'Metspö' },
  dyrkar: { name: 'Enkla dyrkar', fx: 'lockpicks' },
  kulor: { name: 'Kulor' },
  grimoire: { name: 'Grimoire' },
  orbuculum: { name: 'Orbuculum', fx: 'focus' },
  trollstav: { name: 'Trollstav', fx: 'focus' },
  amulett: { name: 'Amulett', fx: 'focus' },
  kikare: { name: 'Kikare' },
  falkok: { name: 'Fältkök', fx: 'cook' },
  talt: { name: 'Stort tält' },
  ryggsack: { name: 'Ryggsäck' },
  anteckningsbok: { name: 'Anteckningsbok' },
  bok: { name: 'Bok' },
  blackpenna: { name: 'Bläck och penna' },
  forband: { name: 'Förband', fx: 'bandage' },
  somngift: { name: 'Sömngift', fx: 'sleep' },
  asna: { name: 'Åsna (venter ved inngangen)' },
  karra: { name: 'Kärra (venter ved inngangen)' },
  hast: { name: 'Stridstränad häst (venter ved inngangen)' },
};

// --- Yrken ----------------------------------------------------------------
// heroic: startevne (eller valg). alt: hva SL kan tillate i stedet når startevnen ikke virker alene.
// pk: utrustningspakker. w = våpen (første er hovedvåpen), a = rustning, h = hjelm, g = annet.
export const PROFESSIONS = [
  {
    id: 'hantverkare', name: 'Hantverkare', key: 'STY', roll: 1,
    skills: ['Yxa', 'Slagsmål', 'Hantverk', 'Hammare', 'Kniv', 'Fingerfärdighet', 'Finna dolda ting', 'Svärd'],
    heroic: ['mastersmed', 'mastersnickare', 'mastergarvare'], heroicChoice: true,
    pk: {
      A: { w: ['lattstridshammare'], a: 'lader', g: ['smedverktyg', 'fackla', 'elddon'] },
      B: { w: ['handyxa'], a: 'lader', g: ['snickarverktyg', 'rep', 'fackla', 'elddon'] },
      C: { w: ['kniv'], a: 'lader', g: ['garvarverktyg', 'lykta', 'elddon'] },
    },
    food: 'D8', silver: 'D8',
    desc: 'Smed, snekker eller garver. Lager og reparerer ting, og slår hardt.',
  },
  {
    id: 'bard', name: 'Bard', key: 'KAR', roll: 2,
    skills: ['Hoppa & klättra', 'Bluffa', 'Undvika', 'Kniv', 'Främmande språk', 'Myter & legender', 'Uppträda', 'Övertala'],
    heroic: ['tonkonst'],
    pk: {
      A: { w: ['kniv'], g: ['lyra', 'oljelampa', 'elddon'] },
      B: { w: ['dolk'], g: ['flojt', 'rep', 'fackla', 'elddon'] },
      C: { w: ['kniv'], g: ['horn', 'fackla', 'elddon'] },
    },
    food: 'D6', silver: 'D8',
    desc: 'Sanger og historiefortellere. Musikken kan få fiender til å nøle.',
  },
  {
    id: 'krigare', name: 'Krigare', key: 'STY', roll: 3,
    skills: ['Yxa', 'Pilbåge', 'Slagsmål', 'Armborst', 'Undvika', 'Hammare', 'Spjut', 'Svärd'],
    heroic: ['stridsvana'],
    pk: {
      A: { w: ['langsvard|stridsyxa|morgonstjarna', 'litenskold'], a: 'ringbrynja', g: ['fackla', 'elddon'] },
      B: { w: ['kortsvard|handyxa|kortspjut', 'lattarmborst'], a: 'lader', g: ['koger', 'fackla', 'elddon'] },
      C: { w: ['langspjut'], a: 'nitlader', h: 'oppenhjalm', g: ['fackla', 'elddon'] },
    },
    food: 'D6', silver: 'D6',
    desc: 'Soldater og leiesoldater. Best med våpen, og tåler mest.',
  },
  {
    id: 'jagare', name: 'Jägare', key: 'SMI', roll: 4,
    skills: ['Hoppa & klättra', 'Upptäcka fara', 'Pilbåge', 'Vildmarksvana', 'Jakt & fiske', 'Kniv', 'Slunga', 'Smyga'],
    heroic: ['foljeslagare'],
    pk: {
      A: { w: ['kortbage', 'dolk'], a: 'lader', g: ['koger', 'snara', 'sovfall', 'rep', 'fackla', 'elddon'] },
      B: { w: ['langbage', 'kniv'], a: 'lader', g: ['koger', 'metspo', 'sovfall', 'rep', 'fackla', 'elddon'] },
      C: { w: ['slunga', 'dolk'], a: 'lader', g: ['snara', 'sovfall', 'rep', 'fackla', 'elddon'] },
    },
    food: 'D8', silver: 'D6',
    desc: 'Sporfinnere og skyttere. Har et dyr som følger dem.',
  },
  {
    id: 'riddare', name: 'Riddare', key: 'STY', roll: 5,
    skills: ['Bestiologi', 'Hammare', 'Myter & legender', 'Uppträda', 'Övertala', 'Rida', 'Spjut', 'Svärd'],
    heroic: ['livvakt'], alt: ['skoldblockad', 'defensiv', 'stridsvana'],
    pk: {
      A: { w: ['langsvard|morgonstjarna', 'litenskold'], a: 'platrustning', h: 'tunnhjalm', g: ['fackla', 'elddon'] },
      B: { w: ['slagslanda|lattstridshammare', 'litenskold'], a: 'ringbrynja', h: 'oppenhjalm', g: ['fackla', 'elddon'] },
      C: { w: ['kortsvard', 'litenskold'], a: 'ringbrynja', h: 'oppenhjalm', g: ['hast'] },
    },
    food: 'D6', silver: 'D12',
    desc: 'Krigere med ære, rustning og skjold. Tunge, men tåler mye.',
  },
  {
    id: 'magiker', name: 'Magiker', key: 'PSY', roll: 6, mage: true,
    skills: [],
    schools: {
      Animism: ['Animism', 'Bestiologi', 'Vildmarksvana', 'Undvika', 'Läkekonst', 'Jakt & fiske', 'Smyga', 'Stav'],
      Elementarism: ['Elementarism', 'Upptäcka fara', 'Undvika', 'Läkekonst', 'Främmande språk', 'Myter & legender', 'Finna dolda ting', 'Stav'],
      Mentalism: ['Mentalism', 'Hoppa & klättra', 'Upptäcka fara', 'Slagsmål', 'Undvika', 'Läkekonst', 'Främmande språk', 'Myter & legender'],
    },
    heroic: [],
    pk: {
      A: { w: ['stav'], g: ['orbuculum', 'grimoire', 'fackla', 'elddon'] },
      B: { w: ['kniv'], g: ['trollstav', 'grimoire', 'fackla', 'elddon'] },
      C: { w: [], g: ['amulett', 'sovfall', 'grimoire', 'fackla', 'elddon'] },
    },
    food: 'D6', silver: 'D8',
    desc: 'Trollkarer fra en av tre skoler. Ingen hjälteförmåga, men tre besvärjelser og tre trolleritrick.',
  },
  {
    id: 'sjofarare', name: 'Sjöfarare', key: 'SMI', roll: 7,
    skills: ['Hoppa & klättra', 'Upptäcka fara', 'Jakt & fiske', 'Kniv', 'Främmande språk', 'Sjökunnighet', 'Simma', 'Svärd'],
    heroic: ['sjoben'], alt: ['snabbfot', 'kastarm'],
    pk: {
      A: { w: ['kortbage', 'dolk'], g: ['koger', 'sovfall', 'rep', 'entrehake', 'fackla', 'elddon'] },
      B: { w: ['sabel'], a: 'lader', g: ['rep', 'entrehake', 'fackla', 'elddon'] },
      C: { w: ['treudd'], g: ['kikare', 'rep', 'entrehake', 'fackla', 'elddon'] },
    },
    food: 'D8', silver: 'D10',
    desc: 'Sjøfolk og pirater. Trygge i vann der andre vasser.',
  },
  {
    id: 'nasare', name: 'Nasare', key: 'KAR', roll: 8,
    skills: ['Upptäcka fara', 'Köpslå', 'Bluffa', 'Undvika', 'Kniv', 'Övertala', 'Fingerfärdighet', 'Finna dolda ting'],
    heroic: ['skattjagare'],
    pk: {
      A: { w: ['dolk'], g: ['rep', 'asna', 'sovfall', 'fackla', 'elddon'] },
      B: { w: ['kniv'], g: ['lykta', 'falkok', 'asna', 'karra', 'sovfall', 'elddon'] },
      C: { w: ['dolk'], g: ['talt', 'oljelampa', 'ryggsack', 'sovfall', 'elddon'] },
    },
    food: 'D6', silver: 'D12',
    desc: 'Handelsfolk med nese for verdier. Billigere hos far og finner skatter.',
  },
  {
    id: 'lard', name: 'Lärd', key: 'INT', roll: 9,
    skills: ['Upptäcka fara', 'Bestiologi', 'Vildmarksvana', 'Undvika', 'Läkekonst', 'Främmande språk', 'Myter & legender', 'Finna dolda ting'],
    heroic: ['intuition'],
    pk: {
      A: { w: ['stav'], g: ['anteckningsbok', 'blackpenna', 'sovfall', 'fackla', 'elddon'] },
      B: { w: ['kniv'], g: ['bok', 'oljelampa', 'sovfall', 'elddon'] },
      C: { w: ['kortsvard'], g: ['forband', 'somngift', 'lykta', 'sovfall', 'elddon'] },
    },
    food: 'D6', silver: 'D10',
    desc: 'Lærde og forskere. Vet mye om fiender og leser runer. Svake i kamp.',
  },
  {
    id: 'tjuv', name: 'Tjuv', key: 'SMI', roll: 10,
    skills: ['Hoppa & klättra', 'Upptäcka fara', 'Bluffa', 'Undvika', 'Kniv', 'Fingerfärdighet', 'Smyga', 'Finna dolda ting'],
    heroic: ['tjuvhugg'],
    pk: {
      A: { w: ['dolk', 'slunga'], g: ['rep', 'entrehake', 'fackla', 'elddon'] },
      B: { w: ['kniv'], g: ['dyrkar', 'fackla', 'elddon'] },
      C: { w: ['dolk*2'], g: ['kulor', 'rep', 'fackla', 'elddon'] },
    },
    food: 'D6', silver: 'D10',
    desc: 'Innbruddstyver og lommetyver. Sniker, dyrker og stikker i ryggen.',
  },
];
export const PROF = Object.fromEntries(PROFESSIONS.map(p => [p.id, p]));

// --- Hjälteförmågor ----------------------------------------------------------
// req: { s: [ferdigheter], v } = en av ferdighetene på minst v. act: 'active' (tast), 'passive', 'auto' (brukes av seg selv)
// game = hvordan den virker i sanntid her. dod = hva boka sier (omskrevet).
export const HEROIC = {
  tjuvhugg: { name: 'Tjuvhugg', en: 'Backstabbing', req: { s: ['Kniv'], v: 12 }, vp: 3, act: 'active', dur: 4,
    dod: 'Ikke en handling. Närstridsanfall mot en fiende som også er innen 2 m fra en annen rollperson blir et smyganfall. Bare smidige våpen.',
    game: 'R: i 4 sekunder blir anfall med smidig våpen mot en fiende som er opptatt med noe annet (eller har ryggen til) et smyganfall: fördel, kan ikke pareres eller undvikas, ekstra skadeterning.' },
  lonnmordare: { name: 'Lönnmördare', en: 'Assassin', req: { s: ['Smyga'], v: 12 }, vp: 0, act: 'passive', uv: true,
    dod: '+T8 skade på smyganfall med smidig våpen. Kan kombineres med Tjuvhugg.',
    game: 'Alltid på: smyganfall gjør +T8 skade.' },
  barsark: { name: 'Bärsärk', en: 'Berserker', req: { s: ['Yxa', 'Hammare', 'Slagsmål', 'Spjut', 'Svärd', 'Kniv', 'Stav'], v: 12 }, vp: 3, act: 'active',
    dod: 'Kampraseri: du kan ikke parera eller undvika, blir Arg, og slåss til alle fiender i synsfeltet er beseiret. Da blir du Utmattad.',
    game: 'R: raseri med fördel på närstridsanfall. Ingen parering eller dukking. Blir Arg, og Utmattad når ingen fiender er i nærheten.' },
  defensiv: { name: 'Defensiv', en: 'Defensive', req: { s: ['Yxa', 'Hammare', 'Spjut', 'Svärd', 'Kniv', 'Stav'], v: 12 }, vp: 0, act: 'passive', uv: true,
    dod: 'Du kan parera uten å bruke din tur.',
    game: 'Alltid på: parering låser deg ikke, og nedkjølingen halveres.' },
  snabbfot: { name: 'Snabbfot', en: 'Fast Footwork', req: { s: ['Undvika'], v: 12 }, vp: 0, act: 'passive', uv: true,
    dod: 'Du kan undvika uten å bruke din tur.',
    game: 'Alltid på: dukking låser deg ikke, og nedkjølingen halveres.' },
  dubbelhugg: { name: 'Dubbelhugg', en: 'Double Slash', req: { s: ['Svärd', 'Yxa'], v: 12 }, vp: 3, act: 'active', dur: 8, uv: true,
    dod: 'Ett närstridsanfall med huggvåpen treffer to fiender som står inntil hverandre. Skade slås for hver.',
    game: 'R: i 8 sekunder treffer hugg to fiender i stedet for én.' },
  drakdrapare: { name: 'Drakdräpare', en: 'Dragonslayer', req: { s: WEAPON_SKILLS, v: 12 }, vp: 3, act: 'active', dur: 10, uv: true,
    dod: '+T8 skade mot monstre, per treff.',
    game: 'R: i 10 sekunder gjør treff mot monstre +T8.' },
  tvavapen: { name: 'Två vapen', en: 'Dual Wield', req: { s: ['Kniv', 'Svärd', 'Yxa', 'Hammare'], v: 12 }, vp: 3, act: 'active', dur: 8, uv: true,
    dod: 'Ekstra anfall med et våpen i den andre hånden.',
    game: 'R: i 8 sekunder slår du også med reservevåpenet (enhånds) for hvert anfall.' },
  orad: { name: 'Orädd', en: 'Fearless', req: null, vp: 2, act: 'auto',
    dod: 'Motstå et skräckanfall automatisk, uten PSY-slag.',
    game: 'Av seg selv: når et skräckanfall treffer, brukes 2 VP og du står imot.' },
  fokuserad: { name: 'Fokuserad', en: 'Focused', req: null, vp: 0, act: 'passive', stack: true,
    dod: '+2 maks VP. Kan tas flere ganger.', game: '+2 maks VP.' },
  talig: { name: 'Tålig', en: 'Robust', req: null, vp: 0, act: 'passive', stack: true,
    dod: '+2 maks KP. Kan tas flere ganger.', game: '+2 maks KP.' },
  jarnnave: { name: 'Järnnäve', en: 'Iron Fist', req: { s: ['Slagsmål'], v: 12 }, vp: 0, act: 'passive', uv: true,
    dod: 'Ubevæpnede anfall får en ekstra skadeterning.', game: 'Alltid på: slag og spark uten våpen gjør 2T6.' },
  tvillingpil: { name: 'Tvillingpil', en: 'Twin Shot', req: { s: ['Pilbåge'], v: 12 }, vp: 3, act: 'active',
    dod: 'Bare bue. Skyt to piler med ett slag med nackdel. Skade slås for hver pil.',
    game: 'R: neste skudd sender to piler (nackdel på slaget).' },
  stridsvana: { name: 'Stridsvana', en: 'Veteran', req: { s: WEAPON_SKILLS, v: 12 }, vp: 1, act: 'active', dur: 6,
    dod: 'Ikke en handling. Behold initiativkortet fra forrige runde.',
    game: 'R: i 6 sekunder handler du først: raskere anfall, og treff avbryter fiender som lader opp.' },
  livvakt: { name: 'Livvakt', en: 'Guardian', req: { s: ['Yxa', 'Hammare', 'Svärd'], v: 12 }, vp: 2, act: 'active', dur: 8, uv: true,
    dod: 'Når du og en venn er innen 2 m fra samme fiende og den angriper vennen, må den angripe deg i stedet.',
    game: 'R: i 8 sekunder angriper fiender deg i stedet for følgesvennen din. Ensom ridder? Bytt til en annen evne.' },
  skoldblockad: { name: 'Sköldblockad', en: 'Shield Block', req: { s: MELEE_STR, v: 12 }, vp: 0, act: 'passive', uv: true,
    dod: 'Parera fysiske monsterangrep med skjold, med fördel.',
    game: 'Alltid på: med skjold kan du parera monsterangrep, med fördel.' },
  foljeslagare: { name: 'Följeslagare', en: 'Companion', req: { s: ['Jakt & fiske'], v: 12 }, vp: 3, act: 'active', uv: true,
    dod: 'Knytt deg til et vanlig dyr. Det følger deg og speider. 3 VP til får det til å angripe.',
    game: 'R: kall på hunden (3 VP) eller be den angripe fienden nærmest siktet (3 VP).' },
  tonkonst: { name: 'Tonkonst', en: 'Musician', req: { s: ['Uppträda'], v: 12 }, vp: 3, act: 'active', dur: 8, uv: true,
    dod: 'Handling. Venner innen 10 m får fördel, eller fiender innen 10 m får nackdel, til din neste tur. Instrument gir lengre rekkevidde eller lavere kostnad.',
    game: 'R: spill i 8 sekunder. Fiender innen 10 m får nackdel på anfall. Med instrument: 12 m og 2 VP.' },
  sjoben: { name: 'Sjöben', en: 'Sea Legs', req: { s: ['Simma'], v: 12 }, vp: 1, act: 'active', dur: 10, uv: true,
    dod: 'Ikke en handling. Ignorer alle ulemper av vann i en runde, også drukning.',
    game: 'R: i 10 sekunder hindrer vannet deg ikke.' },
  skattjagare: { name: 'Skattjägare', en: 'Treasure Hunter', req: { s: ['Köpslå'], v: 12 }, vp: 3, act: 'active', uv: true,
    dod: 'Ved et veiskille: få vite hvilken vei som fører til den største skatten.',
    game: 'R: et gyllent spor viser veien til den rikeste uåpnede skatten på nivået.' },
  intuition: { name: 'Intuition', en: 'Intuition', req: { s: ['Myter & legender'], v: 12 }, vp: 3, act: 'active', uv: true,
    dod: 'Når du står foran et vanskelig valg, spør SL og få et nyttig svar.',
    game: 'R: kartet over nivået åpner seg, og du får et hint om faren som venter.' },
  mastersmed: { name: 'Mästersmed', en: 'Master Blacksmith', req: { s: ['Hantverk'], v: 12 }, vp: 3, act: 'active',
    dod: 'Med smidesverktøy: slip et våpen (rustning teller 1 lavere mot det). Smi metallvåpen og rustning.',
    game: 'R: slip våpenet (3 VP). Fiendens rustning teller 1 lavere resten av nivået. Reparerer metall gratis når du hviler.' },
  mastersnickare: { name: 'Mästersnickare', en: 'Master Carpenter', req: { s: ['Hantverk'], v: 12 }, vp: 1, act: 'auto',
    dod: 'Med snekkerverktøy: T12 skade per VP mot dører, vegger og ting, uten rustning. Lag treting.',
    game: 'Av seg selv: knus låste kister for 1 VP. Reparerer tre gratis når du hviler.' },
  mastergarvare: { name: 'Mästergarvare', en: 'Master Tanner', req: { s: ['Hantverk'], v: 12 }, vp: 0, act: 'auto', uv: true,
    dod: 'Med garververktøy: lag lærrustning av skinnet til et dyr på ett skift.',
    game: 'Av seg selv: når du hviler etter å ha felt dyr, forsterkes lærrustningen (+1, maks +2).' },
  kastarm: { name: 'Kastarm', en: 'Throwing Arm', req: { s: ['Kniv', 'Yxa', 'Spjut'], v: 12 }, vp: 0, act: 'passive', uv: true, beta: true,
    dod: 'Kast et hvilket som helst enhåndsvåpen STY meter.',
    game: 'Alltid på: du kan kaste alle enhåndsvåpen, og kast får +T4 skade.' },
};

// Evner som kan dukke opp som belønning (de som virker i spillet)
export const HEROIC_REWARDS = ['barsark', 'defensiv', 'snabbfot', 'dubbelhugg', 'drakdrapare', 'tvavapen', 'orad', 'fokuserad', 'talig', 'jarnnave', 'tvillingpil', 'stridsvana', 'skoldblockad', 'lonnmordare', 'tjuvhugg', 'kastarm', 'intuition', 'skattjagare'];

// --- Magi -----------------------------------------------------------------
// vp: 'pl' = 2/4/6 for effektgrad 1-3. Ellers fast. dmg skaleres per effektgrad.
export const SPELLS = {
  // Elementarism
  eldklot: { name: 'Eldklot', en: 'Fireball', school: 'Elementarism', rank: 1, vp: 'pl', range: 20, kind: 'bolt', dmg: '2D6', per: 'D6', type: 'fire', uv: true,
    dod: '20 m. 2T6 eldskada, kan undvikas eller pareras som avstandsanfall, tenner brennbart. +T6 per effektgrad over 1.',
    game: 'Ildkule mot siktet. 2T6, +T6 per effektgrad. Setter fyr på fienden.' },
  vindstot: { name: 'Vindstöt', en: 'Gust of Wind', school: 'Elementarism', rank: 1, vp: 'pl', range: 10, kind: 'cone', dmg: '2D4', per: 'D4', type: 'b', uv: true,
    dod: '10 m kjegle. Skyver løse ting og vesener opp til menneskestørrelse 2T4 m og gjør like mye krosskada. +1 terning per effektgrad.',
    game: 'Vindkast i en kjegle. Skyver fiender unna og gjør 2T4.' },
  frost: { name: 'Frost', en: 'Frost', school: 'Elementarism', rank: 1, vp: 'pl', range: 4, kind: 'nova', dmg: 'D6', per: '', type: 'cold', uv: true,
    dod: '4 m sfære rundt deg. T6 skade og VP-tap for levende, slukker ild, fryser mennesketyper til de klarer et STY-slag. +4 m per effektgrad.',
    game: 'Kulde rundt deg (4 m, +4 m per effektgrad). T6 skade og fiendene fryser fast en stund.' },
  splittra: { name: 'Splittra', en: 'Shatter', school: 'Elementarism', rank: 1, vp: 'pl', range: 2, kind: 'object', uv: true,
    dod: 'Berøring. 2T10 skade mot ikke-magiske gjenstander, uten rustning. +T10 per effektgrad.',
    game: 'Knuser låste kister og kasser du står ved.' },
  // Animism
  blixtsken: { name: 'Blixtsken', en: 'Lightning Flash', school: 'Animism', rank: 1, vp: 'pl', range: 30, kind: 'chain', dmg: '2D6', per: 'D6', type: 'lightning', indoor: true, uv: true,
    dod: '30 m. 2T6 til målet og 2T4 som hopper til et mål innen 2 m. Metallrustning beskytter ikke. Dobbel VP-kostnad innendørs.',
    game: 'Lyn mot siktet som hopper videre til en fiende til. Koster dobbelt innendørs, og her er alt innendørs.' },
  lakasar: { name: 'Läka sår', en: 'Treat Wound', school: 'Animism', rank: 1, vp: 'pl', range: 0, kind: 'heal', dmg: '2D6', per: 'D6', uv: true,
    dod: 'Berøring. Helbreder 2T6 KP, +T6 per effektgrad. Kan brukes på deg selv.',
    game: 'Helbred deg selv 2T6, +T6 per effektgrad. Tar 1,5 sekunder.' },
  snarjande: { name: 'Snärjande rötter', en: 'Ensnaring Roots', school: 'Animism', rank: 1, vp: 'pl', range: 10, kind: 'root', uv: true,
    dod: '10 m. Røtter holder målet fast. Det kommer løs med Undvika (fördel på effektgrad 1, nackdel på 3). Virker ikke på monstre.',
    game: 'Røtter holder fienden nærmest siktet fast i 4, 6 eller 8 sekunder. Ikke monstre.' },
  bannlysa: { name: 'Bannlysa', en: 'Banish', school: 'Animism', rank: 1, vp: 'pl', range: 10, kind: 'smite', dmg: '2D8', per: 'D8', type: 'holy', uv: true,
    dod: '10 m, krever hellig symbol. 2T8 +T8 per effektgrad mot overjordiske vesener. Rustning hjelper ikke, kan ikke undvikas.',
    game: 'Hellig lys mot skjeletter og andre vandøde. Virker ikke på levende.' },
  // Mentalism
  kraftnave: { name: 'Kraftnäve', en: 'Power Fist', school: 'Mentalism', rank: 1, vp: 'pl', range: 0, kind: 'buff', dur: 90, uv: true,
    dod: 'Deg selv i en kvart. +T6 skade uten våpen per effektgrad.',
    game: 'I 90 sekunder gjør slag uten våpen +T6 per effektgrad.' },
  stenhud: { name: 'Stenhud', en: 'Stone Skin', school: 'Mentalism', rank: 1, vp: 'pl', range: 0, kind: 'buff', dur: 90, uv: true,
    dod: 'Berøring i en kvart. Rustning 4, +2 per effektgrad. Legges ikke sammen med annen rustning.',
    game: 'I 90 sekunder har du rustning 4, 6 eller 8 (det høyeste av dette og vanlig rustning).' },
  lyfta: { name: 'Lyfta', en: 'Levitate', school: 'Mentalism', rank: 1, vp: 'pl', range: 10, kind: 'lift', uv: true,
    dod: 'Løft en gjenstand eller et vesen opp til menneskestørrelse. Et motvillig mål gir nackdel.',
    game: 'Løft fienden nærmest siktet. Den henger hjelpeløs og faller etterpå (T6 per effektgrad).' },
  langsteg: { name: 'Långsteg', en: 'Longstrider', school: 'Mentalism', rank: 1, vp: 'pl', range: 0, kind: 'buff', dur: 90, uv: true,
    dod: 'Lengre förflyttning en stund.',
    game: 'I 90 sekunder går du 25% fortere per effektgrad.' },
};
export const TRICKS = {
  ljus: { name: 'Ljus', school: 'Allmän', game: 'Lyset rundt deg blir større og sterkere hele nivået (1 VP når nivået starter).' },
  hamta: { name: 'Hämta', school: 'Allmän', game: 'Gjenstander og silver innen 10 m flyr til deg.' },
  kannamagi: { name: 'Känna magi', school: 'Allmän', game: 'Magiske gjenstander synes på kartet.' },
  tanda: { name: 'Tända', school: 'Elementarism', game: 'Tenner fyrfat og fakler: litt mer lys (gratis).' },
  rokpuff: { name: 'Rökpuff', school: 'Elementarism', game: 'Fördel på Smyga (1 VP hver gang).' },
  fagelsang: { name: 'Fågelsång', school: 'Animism', game: 'Fördel på Upptäcka fara (1 VP).' },
  lagamat: { name: 'Laga mat', school: 'Animism', game: 'Brød og mat helbreder 2 KP mer.' },
  lasaupp: { name: 'Låsa upp', school: 'Mentalism', game: 'Låser opp låste kister for 1 VP.' },
  bromsafall: { name: 'Bromsa fall', school: 'Mentalism', game: 'Du tar ikke skade når du blir slått i bakken.' },
};

// --- Tabeller ------------------------------------------------------------

export const WEAKNESS = ['Godtroende', 'Grådig', 'Lettfornærmet', 'Overilt', 'Feig', 'Monsterhater', 'Fordomsfull (nattfolk er onde)', 'Lat', 'Fråtser', 'Kleptoman', 'Forfengelig', 'Hensynsløs', 'Redd for magi', 'Kunnskapstørst', 'Vill (sover aldri innendørs)', 'Skrythals', 'Voldelig', 'Sjefete', 'Pessimist', 'Arrogant'];
export const APPEARANCE = ['Stygt arr på kinnet', 'Rart hodeplagg', 'Underlig blek', 'Smiler alltid', 'Iskaldt blikk', 'Litt lubben', 'Tynn og senete', 'Uvanlig hårete', 'Vikende hårfeste', 'Prangende tatovering', 'Kvalmende stank', 'Praktfullt hår', 'Halter', 'Skitten', 'Ærlige blå øyne', 'Sølvtann', 'For mye parfyme', 'Ulike øyenfarger', 'Hvesende stemme', 'Værbitt ansikt'];
// Rekkefølgen på minnessakene er ikke kjent
export const MEMENTO = ['Utskåret pipe', 'Beinfløyte', 'Armbånd', 'Kobbermynt', 'Terninger av bein', 'Rovdyrtann', 'Griffonfjær', 'Kart', 'Horn', 'Brev', 'Medaljong', 'Fillete dagbok', 'Ring med inskripsjon', 'Sølvmedaljong', 'Rart formet stein', 'Treskulptur', 'Gammelt tinnkrus', 'Utsmykket nøkkel', 'Fillete gammel hatt', 'Trofaste gamle sko'];

// Aidne (Ereb Altor: Hjältar från Kopparhavet). Socialt stånd gir en ekstra tränad ferdighet hvis SL tillater.
export const AIDNE = [
  { stand: 'Fredlös', ex: 'Stråtrøver, flyktning', skill: ['Undvika'], memento: 'En lang askepil', place: 'En lysning dypt i skogen. Du kjenner en skogsalv.' },
  { stand: 'Lösdrivare', ex: 'Taskenspiller, gjøgler, tigger', skill: ['Uppträda', 'Fingerfärdighet'], memento: 'En fløyte med blomstermotiver', place: 'Pålede veier langs fjellsidene. Du kjenner tiggerkongen.' },
  { stand: 'Livegen', ex: 'Træl, snekker, tjenestefolk', skill: ['Hantverk'], memento: 'En pent dreid treskje', place: 'De store godsene der kornet strekker seg så langt øyet ser. Du kjenner en agitator.' },
  { stand: 'Torpare', ex: 'Jeger, dagarbeider', skill: ['Vildmarksvana'], memento: 'En syl med hornskaft', place: 'En vakker lysning i en av Aidnes grønne skoger. Du kjenner en røverhøvding.' },
  { stand: 'Kronobonde', ex: 'Gårdbruker, møller, nybygger', skill: ['Rida'], memento: 'En strikket topplue', place: 'Den gamle gravhaugen bortenfor sommerbeitet. Du kjenner en haugbo.' },
  { stand: 'Storbonde', ex: 'Junker, bergmann, patron', skill: ['Observation'], memento: 'En malt trestatuett av profeten Odo', place: 'Den gamle heksas svovelstinkende stue. Du kjenner en heksejeger.' },
  { stand: 'Borgare', ex: 'Svenn, kroeier, kartteiknar', skill: ['Hantverk'], memento: 'En sølvkjede verdt 30 silver', place: 'Handelskaiene der laugshusene troner. Du kjenner en laugsmester.' },
  { stand: 'Prästerskap', ex: 'Solmunk, tempelprest, eremitt', skill: ['Myter & legender'], memento: 'Et hellig solsymbol', place: 'Et soltempel i en hellig lund. Du kjenner en solånd.' },
  { stand: 'Lågadel', ex: 'Fanejunker, solridder, væpner', skill: ['Taktik'], memento: 'Et segl med slektens våpenskjold', place: 'En ensom ridderborg på en klippe. Du kjenner en røverbaron.' },
  { stand: 'Högadel', ex: 'Markis, borggreve, stormester', skill: ['Övertala'], memento: 'En stamtavle over slekten', place: 'De store bypalassene og hagene i hovedstaden. Du kjenner en rik markis.' },
];

// Skräcktabell (T8) ved mislykket PSY-slag mot skräckanfall
export const FEAR = [
  { name: 'Kraftløs', game: 'Mister 2T6 VP og blir Uppgiven.' },
  { name: 'Skjelven', game: 'Blir Rädd.' },
  { name: 'Andpusten', game: 'Blir Utmattad.' },
  { name: 'Likblek', game: 'Blir Rädd. Følgesvennen også.' },
  { name: 'Skrik', game: 'Skriket ditt vekker alle fiender i nærheten.' },
  { name: 'Raseri', game: 'Blir Arg og må storme mot kilden.' },
  { name: 'Lammet', game: 'Kan ikke røre deg. Slå PSY for å komme løs.' },
  { name: 'Vill panikk', game: 'Løper bort fra kilden til du klarer et PSY-slag.' },
];

// Missöden ved Demon på anfall (T6, valgfri regel)
export const MISHAP_MELEE = [
  { name: 'Mister våpenet', game: 'Våpenet faller ned foran føttene dine. Ta det opp med E.' },
  { name: 'Blottar deg', game: 'Fienden får et frislag som ikke kan pareres eller undvikas.' },
  { name: 'Våpenet setter seg fast', game: 'Det tar et STY-slag å få det løs.' },
  { name: 'Våpenet flyr', game: 'Våpenet flyr T3+3 m av gårde.' },
  { name: 'Våpenet skades', game: 'Trasig: nackdel til det blir reparert.' },
  { name: 'Treffer deg selv', game: 'Du tar våpenskaden (uten bonus).' },
];
export const MISHAP_RANGED = [
  { name: 'Mister våpenet', game: 'Våpenet faller ned foran føttene dine.' },
  { name: 'Tom for ammunisjon', game: 'Kogeret er tomt en stund.' },
  { name: 'Treffer noe verdifullt', game: 'Du ødelegger noe. Mister litt silver.' },
  { name: 'Våpenet går i stykker', game: 'Trasig: nackdel til det blir reparert.' },
  { name: 'Treffer en venn', game: 'Følgesvennen blir truffet, ellers deg selv.' },
  { name: 'Treffer deg selv', game: 'Du tar skaden (uten bonus).' },
];

// Magiska missöden (T20) ved Demon på besvärjelse
export const MAGIC_MISHAP = [
  { r: [1, 6], name: 'Tillstånd', game: 'Omtöcknad, Utmattad, Krasslig, Arg, Rädd eller Uppgiven.' },
  { r: [7, 7], name: 'Smerte', game: 'T6 skade per effektgrad.' },
  { r: [8, 8], name: 'Tømt', game: 'Mister T6 VP per effektgrad.' },
  { r: [9, 9], name: 'Magisk sykdom', game: 'Krasslig, og VP fylles ikke av seg selv før neste hvile.' },
  { r: [10, 10], name: 'Feil trylleformel', game: 'En annen besvärjelse du kan, går av i stedet.' },
  { r: [11, 11], name: 'Froskeforbannelse', game: 'Du kaster opp en frosk hver gang du lyver. Far merker det.' },
  { r: [12, 12], name: 'Gullforbannelse', game: 'Silver du tar på blir til støv resten av nivået.' },
  { r: [13, 13], name: 'Blindhet', game: 'Du ser nesten ingenting en stund.' },
  { r: [14, 14], name: 'Hukommelsestap', game: 'Kartet er glemt.' },
  { r: [15, 15], name: 'Feil mål', game: 'Et utilsiktet mål treffes også. Helbreding hjelper en fiende.' },
  { r: [16, 16], name: 'Slår tilbake', game: 'Angrepsformler treffer deg. Helbreding skader.' },
  { r: [17, 17], name: 'Dyreskikkelse', game: 'Du blir en rotte en stund.' },
  { r: [18, 18], name: 'Yngre', game: 'En alderskategori yngre.' },
  { r: [19, 19], name: 'Eldre', game: 'En alderskategori eldre.' },
  { r: [20, 20], name: 'Demonen kommer', game: 'Noe fra den andre siden har lagt merke til deg.' },
];

// Svåra skador (valgfri regel). T20-intervallene er ikke verifisert, bortsett fra at 15 er avkappet tå.
export const INJURIES = [
  { r: [1, 2], name: 'Brukket nese', bane: ['Upptäcka fara'], heal: 2 },
  { r: [3, 4], name: 'Arret ansikt', bane: ['Uppträda', 'Övertala'], heal: 2 },
  { r: [5, 6], name: 'Slått ut tenner', minus: { Uppträda: 2, Övertala: 2 }, perm: true },
  { r: [7, 7], name: 'Brukne ribbein', baneAttr: ['STY', 'SMI'], heal: 2 },
  { r: [8, 8], name: 'Hjernerystelse', baneAttr: ['INT'], heal: 2 },
  { r: [9, 9], name: 'Dype sår', baneAttr: ['STY', 'SMI'], bleed: true, heal: 2 },
  { r: [10, 11], name: 'Brukket bein', slow: 0.5, heal: 2 },
  { r: [12, 13], name: 'Brukket arm', noTwoHand: true, heal: 2 },
  { r: [14, 14], name: 'Mareritt', nightmare: true, heal: 2 },
  { r: [15, 15], name: 'Avkappet tå', move: -2, perm: true },
  { r: [16, 16], name: 'Avkappet finger', minus: { 'Fingerfärdighet': 2 }, perm: true },
  { r: [17, 17], name: 'Utstukket øye', minus: { 'Finna dolda ting': 2 }, perm: true },
  { r: [18, 18], name: 'Mareritt', nightmare: true, heal: 2 },
  { r: [19, 19], name: 'Forandret personlighet', newWeakness: true, perm: true },
  { r: [20, 20], name: 'Hukommelsestap', amnesia: true, heal: 1 },
];
export function fromRange(table, r) { return table.find(t => r >= t.r[0] && r <= t.r[1]); }
