// Regeldata fra Drakar och Demoner 4.0 (1991, "DoD91"), med Expert (1987) og Gigant der DoD91 ikke dekker noe.
// Kilde: transkriberte bøker på kingafw.no, trukket ut i docs/regler/*.md (sidetall står der).
// Regeltermer står på svensk som i boka. Forklaringene er på norsk.
// uv: true betyr at verdien er spillets egen tolkning eller tilpasning til sanntid, ikke tatt rett fra boka.
// Ereb Altor-data (Aidne-bakgrunn, navn) er fra "Hjältar från Kopparhavet" og gir bare smak i byen.

export const ATTRS = ['STY', 'STO', 'FYS', 'SMI', 'INT', 'PSY', 'KAR'];
export const ATTR_NAME = { STY: 'Styrka', STO: 'Storlek', FYS: 'Fysik', SMI: 'Smidighet', INT: 'Intelligens', PSY: 'Psyke', KAR: 'Karisma' };

// Én stridsrunda (SR) er omtrent 5 sekunder i boka. I sanntid regner spillet 1 SR som 1,5 sekunder (uv).
export const SR = 1.5;

// --- Tabeller fra Bok I ---------------------------------------------------------------

// Baschans (BC) fra grundegenskapen (Bok I s. 28)
export function baseChance(v) {
  if (v <= 3) return 0;
  if (v <= 8) return 1;
  if (v <= 12) return 2;
  if (v <= 16) return 3;
  if (v <= 20) return 4;
  return 5;
}

// Skadebonus fra STY + STO (Bok I s. 25)
export function skadebonus(sum) {
  if (sum <= 26) return null;
  if (sum <= 29) return '1';
  if (sum <= 32) return 'D2';
  if (sum <= 40) return 'D4';
  if (sum <= 50) return 'D6';
  if (sum <= 60) return 'D10';
  if (sum <= 80) return '2D6';
  if (sum <= 100) return '3D6';
  if (sum <= 140) return '4D6';
  return '5D6';
}

// Förflyttning i rutor per SR fra STO + FYS + SMI (Bok I s. 25), pluss rasens modifikasjon
export function forflyttning(sum) {
  if (sum <= 11) return 7;
  if (sum <= 92) return 8 + Math.floor((sum - 12) / 9);
  return 16 + Math.ceil((sum - 92) / 8);
}

// Träffområden og KP per kroppsdel (Bok I s. 24). Totala KP = (FYS + STO) / 2, avrundet opp.
export const LOCS = ['huvud', 'brost', 'mage', 'harm', 'varm', 'hben', 'vben'];
export const LOC_NAME = { huvud: 'Huvud', brost: 'Bröstkorg', mage: 'Mage', harm: 'Höger arm', varm: 'Vänster arm', hben: 'Höger ben', vben: 'Vänster ben' };
// i løpende tekst på norsk
export const LOC_SHORT = { huvud: 'hodet', brost: 'brystet', mage: 'magen', harm: 'høyre arm', varm: 'venstre arm', hben: 'høyre bein', vben: 'venstre bein' };
export function locKP(total) {
  let k = total <= 7 ? 0 : total <= 11 ? 1 : total <= 15 ? 2 : 3 + Math.floor((total - 16) / 5);
  if (total < 5) k = -1;
  return { brost: Math.max(1, 4 + k), huvud: Math.max(1, 3 + k), mage: Math.max(1, 3 + k), hben: Math.max(1, 3 + k), vben: Math.max(1, 3 + k), harm: Math.max(1, 2 + k), varm: Math.max(1, 2 + k) };
}
// Träfftabellen for humanoider, 1T20 (Bok II s. 18)
export const HIT_MELEE = [[2, 'vben'], [4, 'hben'], [8, 'mage'], [11, 'varm'], [14, 'harm'], [16, 'brost'], [20, 'huvud']];
export const HIT_RANGED = [[3, 'vben'], [6, 'hben'], [9, 'mage'], [11, 'varm'], [13, 'harm'], [18, 'brost'], [20, 'huvud']];
export function hitLocation(ranged = false, r = 1 + Math.floor(Math.random() * 20)) {
  for (const [max, loc] of ranged ? HIT_RANGED : HIT_MELEE) if (r <= max) return loc;
  return 'huvud';
}

// Kritiska arm- och benskador, 1T10 (Bok II s. 18-19). minus = CL-straff for ferdigheter som trenger kroppsdelen.
export const CRIT_LIMB = [
  { r: [1, 3], name: 'Brutet ben', minus: 3, text: 'Benet i kroppsdelen er brukket. Det gror, men med -3 på CL.' },
  { r: [4, 5], name: 'Stiv led', minus: 4, slow: true, text: 'Et stygt sår i albuen eller kneet. Leddet kan aldri bøyes igjen, -4 på CL.' },
  { r: [6, 7], name: 'Avkuttede nervebaner', lame: true, text: 'Kroppsdelen er lam resten av livet.' },
  { r: [8, 9], name: 'Avkuttede sener', minus: 5, text: 'Muskler og sener er kuttet. -5 på CL til det gror.' },
  { r: [10, 10], name: 'Knust ben', lame: true, amputate: true, text: 'Benet i kroppsdelen er knust. Den må amputeres.' },
];

// Motståndstabellen (Bok I s. 38): aktiv verdi mot passiv verdi. Mål = 10 + aktiv - passiv.
export function resistTarget(active, passive) { return 10 + active - passive; }
export const SG = { mycketLatt: 1, latt: 5, normalt: 10, svart: 15, mycketSvart: 20, extremt: 25 };

// Kostnad i EP for å gå fra FV a til FV b er grundkostnad x (C[b] - C[a]) (Bok I s. 29)
export const FV_COST = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 16, 18, 21, 24, 27, 31, 35, 39, 44];
export function fvCost(from, to, base) {
  const c = v => (v <= 21 ? FV_COST[Math.max(0, v)] : 44 + (v - 21) * 5);
  return Math.max(0, base * (c(to) - c(from)));
}
// Kategori B: FV omregnet til B-nivå (Bok I s. 35)
export function bLevel(fv) { return fv <= 0 ? 0 : fv <= 4 ? 1 : fv <= 10 ? 2 : fv <= 15 ? 3 : fv <= 19 ? 4 : 5; }

// --- Raser (Bok I s. 8-11, tärningar fra Bok II s. 27-38) -----------------------------
// mods: rasmodifikasjon på grundegenskaper (BP-systemet). dice: tärningar i "Ett enklare framslagningssystem".
export const RACES = [
  {
    id: 'manniska', name: 'Människa', bp: 10, move: 0,
    dice: { STY: '3D6', STO: '2D6+6', FYS: '3D6', SMI: '3D6', INT: '3D6', PSY: '3D6', KAR: '3D6' },
    mods: {}, sto: [8, 18, 13], skillBonus: {}, moral: 10, barsark: 1,
    desc: 'Tilpasningsdyktige og overalt. Ingen særlige evner, men heller ingen svakheter.',
    names: ['Joruna', 'Tym', 'Halvelda', 'Garmander', 'Verolun', 'Lothar'],
    ereb: ['Baldvin', 'Berceval', 'Cassian', 'Crispin', 'Edegar', 'Folkard', 'Garin', 'Gaspard', 'Kyrian', 'Krystof', 'Regin', 'Valien', 'Briann', 'Fabia', 'Jehanne', 'Gylvanda', 'Isold', 'Lavena', 'Aliana', 'Gynerva', 'Gilda', 'Helvid', 'Rosmynda', 'Hild'],
  },
  {
    id: 'anka', name: 'Anka', bp: 0, move: -2,
    dice: { STY: '2D6', STO: '1D4+2', FYS: '2D6+6', SMI: '2D6+6', INT: '3D6', PSY: '3D6', KAR: '2D6+1' },
    mods: { STY: -4, FYS: 2, SMI: 2, KAR: -3 }, sto: [3, 6, 5], skillBonus: { Simma: 'B5', Smyga: 4 }, moral: 12, barsark: 3,
    desc: 'Små, klene, seige og smidige. Svimmer som ingen andre, sniker godt og har et temperament. Svarte ankor er piratankor: voldsomme, men med ære.',
    names: ['Qwacksum', 'Splats', 'Mogghi', 'Groddy', 'Blisandina', 'Fjäderpuff'],
  },
  {
    id: 'dvarg', name: 'Dvärg', bp: 25, move: -2, darkvision: true,
    dice: { STY: '4D6', STO: '2D4+1', FYS: '2D6+6', SMI: '3D6', INT: '3D6', PSY: '2D6+6', KAR: '3D6' },
    mods: { STY: 3, FYS: 2, PSY: 2 }, sto: [4, 9, 7], skillBonus: { Geologi: 5 }, moral: 14, barsark: 2, noMagic: true,
    desc: 'Lave og brede, med perfekt mørkesyn. Blir normalt ikke magikere. Karad Batur var et dvergerike.',
    names: ['Tinderrock', 'Halwyld', 'Tymolana', 'Traut', 'Urd', 'Fermer'],
    ereb: ['Ardun', 'Bataar', 'Zungar', 'Daguur', 'Dorj', 'Bolor', 'Jargal', 'Otgon', 'Temur', 'Zabrak', 'Altun', 'Badma', 'Dhurm', 'Hurrum', 'Jaran', 'Khula', 'Oyuun', 'Saran', 'Tuul', 'Tuya'],
  },
  {
    id: 'alv', name: 'Alv', bp: 25, move: 1,
    dice: { STY: '2D6+3', STO: '2D4+6', FYS: '3D6', SMI: '3D6+3', INT: '4D6', PSY: '3D6', KAR: '3D6+2' },
    mods: { STY: -1, SMI: 3, INT: 3, KAR: 2 }, sto: [8, 14, 11], skillBonus: { 'Upptäcka fara': 4, Lyssna: 4 }, moral: 15, barsark: 1, ageless: true,
    desc: 'Kattøyne, skarp syn og hørsel. Eldes ikke. Trenger bare fire timers søvn.',
    names: ['Arasin', 'Illyriana', 'Galvander', 'Tyrindelia', 'Erwilnor', 'Andremone'],
  },
  {
    id: 'halvalv', name: 'Halvalv', bp: 15, move: 0,
    dice: { STY: '3D6', STO: '2D6+6', FYS: '3D6', SMI: '3D6+2', INT: '3D6', PSY: '3D6', KAR: '3D6+1' },
    mods: { SMI: 2, KAR: 1 }, sto: [7, 16, 12], skillBonus: { 'Upptäcka fara': 2, Lyssna: 2 }, moral: 12, barsark: 1,
    desc: 'Dobbelt så god syn og hørsel som mennesker. Lever svært lenge.',
    names: ['Elwin', 'Marialda', 'Tirion', 'Sylvara'], namesUv: true,
  },
  {
    id: 'halvlangdsman', name: 'Halvlängdsman', bp: 15, move: -2,
    dice: { STY: '2D6', STO: '1D3+2', FYS: '2D6+6', SMI: '4D6', INT: '3D6', PSY: '2D6+6', KAR: '3D6' },
    mods: { STY: -4, FYS: 3, SMI: 3, PSY: 2 }, sto: [3, 6, 5], skillBonus: { 'Gömma sig': 4 }, moral: 10, barsark: 1, noMagic: true,
    desc: 'Omtrent en meter høye. Fredelige, men seige og modige når det gjelder. Blir normalt ikke magikere.',
    names: ['Mirabel', 'Tobolt', 'Pimpa', 'Brodd', 'Hemlin', 'Rosmarie'], namesUv: true,
  },
  {
    id: 'halvorch', name: 'Halvorch', bp: 10, move: 0, darkvision: true,
    dice: { STY: '3D6+2', STO: '2D6+4', FYS: '3D6+2', SMI: '2D6+2', INT: '3D6', PSY: '3D6', KAR: '2D6+1' },
    mods: { STY: 2, FYS: 2, SMI: -1, KAR: -3 }, sto: [8, 18, 13], skillBonus: { Slagsmål: 4 }, moral: 12, barsark: 2,
    desc: 'Sterkere enn mennesker, med mørkesyn og et frastøtende utseende. Ofte bitre einstøinger.',
    names: ['Gorak', 'Shagra', 'Ulmo', 'Brugha'], namesUv: true,
  },
];
export const RACE = Object.fromEntries(RACES.map(r => [r.id, r]));
// gamle navn fra 2023-utgaven i lagrede rollpersoner
export const KIN = RACE;
export const KINS = RACES;

// --- Ålder (Bok I s. 28) ---------------------------------------------------------------
export const AGES = [
  { id: 'ung', name: 'Ung', mods: { STY: -1, FYS: 1, SMI: 1, PSY: -1 }, ep: 150, money: 1, maxFV: 13 },
  { id: 'mogen', name: 'Mogen', mods: {}, ep: 200, money: 1.5, maxFV: 15 },
  { id: 'medel', name: 'Medelålders', mods: { STY: -2, FYS: -1, SMI: -1, INT: 1, PSY: 2, KAR: 1 }, ep: 250, money: 2, maxFV: 17 },
  { id: 'gammal', name: 'Gammal', mods: { STY: -5, FYS: -3, SMI: -3, INT: 1, PSY: 4, KAR: 1 }, ep: 300, money: 2.5, maxFV: 19 },
];
export const AGE = Object.fromEntries(AGES.map(a => [a.id, a]));
export const AGE_YEARS = {
  anka: ['16-20', '21-40', '41-60', '61-80'], dvarg: ['21-40', '41-150', '151-250', '251-400'], halvalv: ['30-40', '41-70', '71-100', '101-130'],
  halvlangdsman: ['20-30', '31-60', '61-75', '76-100'], halvorch: ['12-18', '19-30', '31-45', '46-55'], manniska: ['16-20', '21-45', '46-60', '61-80'], alv: ['?', '?', '?', '?'],
};

// --- Färdigheter (Bok I s. 34-62) ------------------------------------------------------
// type: prim (alla har dem), sek (sekundär), vap (vapenfärdighet), magi (magiskola), konst (stridskonst)
// kat: 'A' eller 'B'. use: hva ferdigheten gjør i spillet (tom = ingen bruk ennå).
const P = (id, attr, use = '', kat = 'A') => ({ id, attr, type: 'prim', kat, use });
const S = (id, attr, use = '', kat = 'A') => ({ id, attr, type: 'sek', kat, use });
export const SKILLS = [
  P('Bluffa', 'KAR', 'Lyve deg ut av ting i byen.'),
  P('Finna dolda ting', 'INT', 'Finne gjemmesteder i veggene.'),
  P('Första hjälpen', 'INT', 'H: legg forbinding og stopp blødning. Helbreder ingen KP.'),
  P('Gömma sig', 'INT', 'Stå stille i skyggene uten å bli sett.'),
  P('Hoppa', 'SMI'),
  P('Klättra', 'SMI'),
  P('Köpslå', 'KAR', 'Prute i butikkene.'),
  P('Lyssna', 'INT', 'Høre fiender før du ser dem.'),
  P('Läsa/Skriva modersmål', 'INT', '', 'B'),
  P('Rida', 'SMI'),
  P('Sjunga', 'KAR', 'Opptre på vertshuset.'),
  P('Slagsmål', 'STY', 'Knytnever (1T3) og spark (1T6) uten våpen.'),
  P('Smyga', 'SMI', 'Shift: snike. Angrep bakfra gir +7 og kan ikke pareres.'),
  P('Spåra', 'INT', 'Følge spor fram til skatter.'),
  P('Stjäla föremål', 'SMI', 'Stjele fra boder og lommer i byen.'),
  P('Tala modersmål', 'INT', '', 'B'),
  P('Upptäcka fara', 'PSY', 'Merke bakhold og feller før det er for sent.'),
  P('Värdera', 'INT', 'Se hva ting er verdt.'),
  P('Övertala', 'KAR', 'Be om forskudd og tjenester.'),
  S('Administration', 'INT', '', 'B'),
  S('Akrobatik', 'SMI', 'Dukke unna med mindre risiko. Ikke i rustning.', 'B'),
  S('Alkemi', 'INT'),
  S('Astrologi', 'INT'),
  S('Avväpna', 'SMI', 'Slå våpenet ut av hånda på fienden.'),
  S('Buktala', 'PSY'),
  S('Bärsärkagång', 'PSY', 'Raseri: +1T6 skade, et ekstra angrep, ingen parering.'),
  S('Dans', 'SMI'),
  S('Djurhelning', 'INT'),
  S('Djurträning', 'PSY'),
  S('Dra vapen', 'SMI', 'Bytte våpen og hugge i samme bevegelse.'),
  S('Drogkunskap', 'INT'),
  S('Förfalskning', 'INT'),
  S('Geografi', 'INT', '', 'B'),
  S('Geologi', 'INT', '', 'B'),
  S('Giftkunskap', 'INT'),
  S('Gyckelkonster', 'SMI', '', 'B'),
  S('Hantera fällor', 'SMI'),
  S('Hantverk', 'INT', 'Reparere trasig utrustning.', 'B'),
  S('Hasardspel', 'PSY'),
  S('Heraldik', 'INT', '', 'B'),
  S('Historia', 'INT', 'Lese dvergeruner.', 'B'),
  S('Hypnotisera', 'PSY'),
  S('Knopar', 'SMI'),
  S('Kulturkännedom', 'INT', '', 'B'),
  S('Kunskap om demoner', 'INT', '', 'B'),
  S('Kunskap om magi', 'INT', '', 'B'),
  S('Kunskap om odöda', 'INT', '', 'B'),
  S('Känna magi', 'PSY', 'Kjenne igjen magiske ting.'),
  S('Låsdyrkning', 'SMI', 'Dyrke opp låste kister. Trenger dyrkar.'),
  S('Läkekonst', 'INT', 'Dobbelt så rask helbredelse når du hviler.'),
  S('Läppläsning', 'INT'),
  S('Magisk kanalisering', 'INT'),
  S('Massage', 'SMI'),
  S('Muta', 'KAR', 'Bestikke vakta.'),
  S('Målning', 'SMI'),
  S('Navigera', 'INT'),
  S('Orientering', 'INT'),
  S('Räkning', 'INT', '', 'B'),
  S('Schack & brädspel', 'INT'),
  S('Simma', 'SMI', 'Bevege seg i dypt vann.', 'B'),
  S('Sjökunnighet', 'INT'),
  S('Skådespeleri', 'KAR'),
  S('Spela instrument', 'KAR', 'Opptre på vertshuset.'),
  S('Språkkunskap', 'INT', '', 'B'),
  S('Spå väder', 'INT'),
  S('Stavhopp', 'SMI'),
  S('Tala främmande språk', 'INT', 'Lese dvergeruner (dvärgiska).', 'B'),
  S('Läsa/Skriva främmande språk', 'INT', '', 'B'),
  S('Teckenspråk', 'INT'),
  S('Två vapen', 'SMI', 'Hugge med våpenet i andre hånd også.'),
  S('Undre världen', 'INT', 'Vite hvem som kjøper tyvegods i byen.', 'B'),
  S('Zoologi', 'INT', 'Kjenne igjen dyr og svakhetene deres.', 'B'),
  S('Änterhake', 'SMI'),
  S('Örtkunskap', 'INT', 'Finne og bruke legende urter.'),
  S('Överlevnad', 'INT', 'Fiske, finne mat og vann.'),
  { id: 'Animism', attr: 'INT', type: 'magi', kat: 'A', use: 'Magiskole: naturen og levende ting.' },
  { id: 'Elementarmagi', attr: 'INT', type: 'magi', kat: 'A', use: 'Magiskole: ild, vann, luft, jord, lys og mørke.' },
  { id: 'Mentalism', attr: 'INT', type: 'magi', kat: 'A', use: 'Magiskole: kropp og sinn.' },
];

// --- Vapen (Bok II s. 32, Bok III s. 34-37) ------------------------------------------------
// str: STY-krav. Med STY >= krav kan våpenet brukes med én hånd. Krav over STY: to hender. Krav over STY x 2: kan ikke brukes.
// twoOnly: kan aldri brukes med én hånd. reach: rutor ut over nabo-ruta. dur: BV (brytvärde). kg: vekt. price: sm.
// group: vapengruppe (Bok I s. 60). Innen gruppa har du minst halvparten av ditt høyeste FV.
// types: p = stikk, s = hugg, b = kross (skjeletter tar ingen skade av stikk og piler).
// kind: animasjon og treffbue i spillet.
export const WEAPON_GROUPS = {
  dolkar: { name: 'Dolkar', attr: 'SMI' }, enhandssvard: { name: 'Enhandssvärd', attr: 'STY' }, krossvapen: { name: 'Enhands krossvapen', attr: 'STY' },
  enhandsyxor: { name: 'Enhandsyxor', attr: 'STY' }, tvahandsvapen: { name: 'Tvåhandsvapen', attr: 'STY' }, stickvapen: { name: 'Stickvapen', attr: 'STY' },
  kattingvapen: { name: 'Kättingvapen', attr: 'SMI' }, stangvapen: { name: 'Stångvapen', attr: 'STY' }, bagar: { name: 'Bågar', attr: 'SMI' },
  armborst: { name: 'Armborst', attr: 'SMI' }, slunga: { name: 'Slunga', attr: 'SMI' }, kastvapen: { name: 'Kastvapen', attr: 'SMI' },
  piska: { name: 'Piska', attr: 'SMI' }, skoldar: { name: 'Sköldar', attr: 'SMI' }, obevapnad: { name: 'Obeväpnad', attr: 'STY' },
};
const W = (id, name, group, dmg, str, o = {}) => ({ id, name, skill: o.skill || name, group, dmg, str, reach: o.reach || 0, dur: o.dur ?? 11, kg: o.kg ?? 2, price: o.price ?? 100, twoOnly: !!o.twoOnly, types: o.types || ['s'], kind: o.kind || 'sword', metal: o.metal ?? true, ranged: !!o.ranged, thrown: !!o.thrown, range: o.range || 0, reload: o.reload || 0, shield: false });
export const WEAPONS = {
  obevapnad: { id: 'obevapnad', name: 'Knytnävar', skill: 'Slagsmål', group: 'obevapnad', dmg: 'D3', str: 1, reach: 0, dur: 0, kg: 0, price: 0, types: ['b'], kind: 'fist', metal: false, unarmed: true },
  knogjarn: W('knogjarn', 'Knogjärn', 'obevapnad', 'D3+1', 1, { skill: 'Slagsmål', dur: 0, kg: 0.5, price: 20, types: ['b'], kind: 'fist' }),
  dolk: W('dolk', 'Dolk', 'dolkar', 'D4+1', 1, { dur: 9, kg: 0.5, price: 70, types: ['p', 's'], kind: 'knife' }),
  parerdolk: W('parerdolk', 'Parerdolk', 'dolkar', 'D4+1', 1, { dur: 13, kg: 0.5, price: 80, types: ['p', 's'], kind: 'knife' }),
  klubba: W('klubba', 'Klubba', 'krossvapen', 'D6', 5, { dur: 7, kg: 1, price: 20, types: ['b'], kind: 'hammer', metal: false }),
  spikklubba: W('spikklubba', 'Spikklubba', 'krossvapen', 'D6+1', 5, { dur: 7, kg: 1, price: 30, types: ['b'], kind: 'hammer', metal: false }),
  kortsvard: W('kortsvard', 'Kortsvärd', 'enhandssvard', 'D6+1', 7, { dur: 15, kg: 2, price: 400, types: ['p', 's'] }),
  kortspjut: W('kortspjut', 'Kortspjut', 'stickvapen', 'D6', 7, { reach: 1, dur: 11, kg: 2, price: 90, types: ['p'], kind: 'spear' }),
  trastav: W('trastav', 'Trästav', 'stangvapen', 'D6', 7, { twoOnly: true, dur: 7, kg: 2, price: 100, types: ['b'], kind: 'staff', metal: false }),
  korpnabb: W('korpnabb', 'Korpnäbb', 'krossvapen', 'D8', 7, { dur: 15, kg: 2, price: 600, types: ['p', 'b'], kind: 'hammer' }),
  kroksabel: W('kroksabel', 'Kroksabel', 'enhandssvard', 'D8+2', 9, { dur: 15, kg: 3, price: 650, types: ['s'] }),
  piska: W('piska', 'Piska', 'piska', 'D2', 9, { reach: 1, dur: 3, kg: 3, price: 120, types: ['s'], kind: 'knife', metal: false }),
  handyxa: W('handyxa', 'Handyxa', 'enhandsyxor', 'D6+1', 9, { dur: 11, kg: 3, price: 60, types: ['s'], kind: 'axe' }),
  hjalmkrossare: W('hjalmkrossare', 'Hjälmkrossare', 'krossvapen', 'D8+1', 11, { dur: 15, kg: 4, price: 700, types: ['b'], kind: 'hammer' }),
  stridshammare: W('stridshammare', 'Stridshammare', 'krossvapen', 'D6+2', 11, { dur: 15, kg: 4, price: 850, types: ['b'], kind: 'hammer' }),
  stridsyxa: W('stridsyxa', 'Stridsyxa', 'enhandsyxor', 'D8+2', 11, { dur: 11, kg: 4, price: 450, types: ['s'], kind: 'axe' }),
  langspjut: W('langspjut', 'Långspjut', 'stickvapen', 'D10', 11, { twoOnly: true, reach: 2, dur: 11, kg: 4, price: 300, types: ['p'], kind: 'spear' }),
  bredsvard: W('bredsvard', 'Bredsvärd', 'enhandssvard', 'D8+1', 13, { dur: 15, kg: 4.5, price: 1000, types: ['p', 's'] }),
  stridsgissel: W('stridsgissel', 'Stridsgissel', 'kattingvapen', 'D10', 13, { dur: 11, kg: 4.5, price: 1250, types: ['b'], kind: 'hammer' }),
  morgonstjarna: W('morgonstjarna', 'Morgonstjärna', 'krossvapen', 'D8+2', 13, { dur: 11, kg: 4.5, price: 1500, types: ['b', 'p'], kind: 'hammer' }),
  treudd: W('treudd', 'Treudd', 'stickvapen', '3D6-2', 15, { reach: 1, dur: 11, kg: 5, price: 1000, types: ['p'], kind: 'spear' }),
  bastardsvard: W('bastardsvard', 'Bastardsvärd', 'enhandssvard', 'D10+1', 17, { dur: 15, kg: 5.5, price: 2500, types: ['p', 's'] }),
  stortraklubba: W('stortraklubba', 'Stor träklubba', 'tvahandsvapen', '2D4', 21, { dur: 11, kg: 6, price: 50, types: ['b'], kind: 'great', metal: false }),
  stridsslaga: W('stridsslaga', 'Stridsslaga', 'kattingvapen', 'D10+1', 25, { dur: 11, kg: 6.5, price: 1500, types: ['b'], kind: 'great' }),
  skaggyxa: W('skaggyxa', 'Skäggyxa', 'tvahandsvapen', '2D8+1', 25, { dur: 11, kg: 6.5, price: 1100, types: ['s'], kind: 'great' }),
  hillebard: W('hillebard', 'Hillebard', 'stangvapen', '3D6+1', 29, { twoOnly: true, reach: 1, dur: 11, kg: 7.5, price: 1900, types: ['p', 's'], kind: 'spear' }),
  tvahandsyxa: W('tvahandsyxa', 'Tvåhandsyxa', 'tvahandsvapen', '2D10+1', 31, { twoOnly: true, reach: 1, dur: 11, kg: 8, price: 1900, types: ['s'], kind: 'great' }),
  tvahandssvard: W('tvahandssvard', 'Tvåhandssvärd', 'tvahandsvapen', '2D10+2', 31, { twoOnly: true, reach: 1, dur: 15, kg: 8, price: 3500, types: ['p', 's'], kind: 'great' }),
  // projektilvapen: alltid to hender, kan ikke pareres. Kan spennes hvis STY-krav <= STY x 2.
  litenbage: W('litenbage', 'Liten båge', 'bagar', 'D4+1', 9, { ranged: true, range: 135, kg: 1.5, price: 150, types: ['p'], kind: 'bow', metal: false, dur: 0 }),
  kortbage: W('kortbage', 'Kortbåge', 'bagar', 'D6+1', 17, { ranged: true, range: 135, kg: 2, price: 400, types: ['p'], kind: 'bow', metal: false, dur: 0 }),
  langbage: W('langbage', 'Långbåge', 'bagar', 'D8+1', 29, { ranged: true, range: 180, kg: 3, price: 700, types: ['p'], kind: 'bow', metal: false, dur: 0 }),
  slunga: W('slunga', 'Slunga', 'slunga', 'D6', 9, { ranged: true, range: 90, kg: 0.5, price: 40, types: ['b'], kind: 'sling', metal: false, dur: 0 }),
  lattarmborst: W('lattarmborst', 'Lätt armborst', 'armborst', '2D4+2', 25, { ranged: true, range: 150, reload: 3, kg: 5, price: 1300, types: ['p'], kind: 'xbow', metal: false, dur: 0 }),
  tungtarmborst: W('tungtarmborst', 'Tungt armborst', 'armborst', '2D6+2', 27, { ranged: true, range: 225, reload: 6, kg: 6, price: 2250, types: ['p'], kind: 'xbow', metal: false, dur: 0 }),
  // Lekhs arbalest, 3T6+3 (Triangeldrama i Edelfara s. 10). Brukes med Tungt armborst. STY-krav, vekt og pris står ikke der (uv).
  arbalest: { ...W('arbalest', 'Arbalest', 'armborst', '3D6+3', 31, { skill: 'Tungt armborst', ranged: true, range: 250, reload: 8, kg: 9, price: 4000, types: ['p'], kind: 'xbow', metal: false, dur: 0 }), uv: true },
  // kastvapen: én hånd, rekkevidde STY rutor. Kan pareres med skjold.
  kastkniv: W('kastkniv', 'Kastkniv', 'kastvapen', 'D4+1', 9, { thrown: true, kg: 0.5, price: 100, types: ['p'], kind: 'knife', dur: 9 }),
  kastyxa: W('kastyxa', 'Kastyxa', 'kastvapen', 'D6+2', 9, { thrown: true, kg: 3, price: 90, types: ['s'], kind: 'axe', dur: 11 }),
  kastspjut: W('kastspjut', 'Kastspjut', 'kastvapen', 'D6+1', 11, { thrown: true, kg: 1, price: 120, types: ['p'], kind: 'spear', dur: 11 }),
};
// Sköldar (Bok III s. 37). covers: kroppsdeler skjoldet tar piler for (sköldarm = vänster arm).
const SH = (id, name, str, dur, kg, price, covers) => ({ id, name, skill: name, group: 'skoldar', shield: true, dmg: 'D3', str, dur, kg, price, covers, kind: 'shield', types: ['b'], metal: false, reach: 0 });
export const SHIELDS = {
  targ: SH('targ', 'Targ', 1, 9, 1, 500, ['varm']),
  litenrundskold: SH('litenrundskold', 'Liten rundsköld', 3, 9, 2, 650, ['varm']),
  vanligskold: SH('vanligskold', 'Vanlig sköld', 7, 11, 6, 850, ['varm', 'brost']),
  langskold: SH('langskold', 'Långsköld', 7, 11, 6, 900, ['varm', 'brost', 'vben']),
  storrundskold: SH('storrundskold', 'Stor rundsköld', 11, 11, 7, 1000, ['varm', 'mage', 'brost']),
};
Object.assign(WEAPONS, SHIELDS);
export const RANGED_KINDS = ['bow', 'xbow', 'sling'];
export const WEAPON_SKILLS = [...new Set(Object.values(WEAPONS).filter(w => !w.unarmed && w.skill !== 'Slagsmål').map(w => w.skill))];
for (const w of Object.values(WEAPONS)) {
  if (w.unarmed || w.skill === 'Slagsmål' || SKILLS.some(s => s.id === w.skill)) continue;
  SKILLS.push({ id: w.skill, attr: WEAPON_GROUPS[w.group].attr, type: 'vap', kat: 'A', group: w.group, use: w.shield ? 'Parere med skjoldet.' : `Våpen: ${w.name}` });
}
// Stridskonster (Bok I s. 56-58, Gigant s. 35-37). Én ferdighet per stridskonst, SMI-basert.
export const KONST_PARTS = {
  normalspark: { name: 'Normal spark', cost: 0.5, dmg: 'D6', text: 'Spark, 1T6 skade.' },
  rundspark: { name: 'Rundspark', cost: 1.0, dmg: 'D8', text: 'Snurrer en hel runde, 1T8. Bommer den, mister du neste anfall.' },
  hoppspark: { name: 'Hoppspark', cost: 1.0, dmg: 'D8', text: 'Krever en rutes tilløp. Treffer alltid hodet, 1T8. Bommer den, faller du.' },
  bakatspark: { name: 'Bakåtspark', cost: 0.5, dmg: 'D6', text: 'Spark mot en fiende bak deg, 1T6.' },
  normaltslag: { name: 'Normalt slag', cost: 0.5, dmg: 'D3', text: 'Knyttneveslag, 1T3.' },
  krosslag: { name: 'Krosslag', cost: 1.0, dmg: 'D6', text: 'Slag mot ømme punkter, 1T6.' },
  bedovning: { name: 'Bedövningsslag', cost: 1.0, dmg: 'D3', text: '1T3. Gjør det skade, må offeret klare et svårt FYS-slag eller miste neste anfall.' },
  parering: { name: 'Obeväpnad parering', cost: 0.5, text: 'Parere alle närstridsanfall, også våpen, uten våpen. Lykkes det, trekkes 1T6 fra skaden.' },
  fint: { name: 'Fint', cost: 0.5, text: 'Lykkes finten, halveres fiendens sjanse til å parere.' },
  avvapning: { name: 'Avväpning', cost: 1.0, text: 'Lykkes pareringen mot et bommet våpenanfall, mister fienden våpenet.' },
  lagtkast: { name: 'Lågt kast', cost: 0.5, text: 'Kaster fienden over ende uten skade. Kan pareres.' },
  hogtkast: { name: 'Högt kast', cost: 1.0, text: 'Kaster fienden 1T3 rutor. Svårt SMI-slag, ellers 1T3 KP i en kroppsdel.' },
  fallteknik: { name: 'Fallteknik', cost: 0.5, passive: true, text: 'Alltid på: all fallskade halveres.' },
  uppresning: { name: 'Uppresning', cost: 0.5, passive: true, text: 'Slås du over ende, kan du reise deg med en gang med et lyckat slag.' },
  liggande: { name: 'Liggande strid', cost: 1.0, passive: true, text: 'Alltid på: kan slå, sparke og parere liggende.' },
  initiativ: { name: 'Initiativbonus', cost: 0.5, passive: true, text: 'Alltid på: +5 på SMI i turordningen (raskere anfall).' },
  missil: { name: 'Missilavledning', cost: 1.5, text: 'Dukke unna kastvåpen og piler (ikke slyngesteiner og armbrøst) en gang per SR.' },
};
export const KONSTER = {
  'Quack-fu': { parts: ['krosslag', 'parering', 'lagtkast', 'fallteknik', 'uppresning'], who: 'Ankene. Laget for ankenes evner og begrensninger.', src: 'Gigant s. 37' },
  'Stjärnnäven': { parts: ['normalspark', 'bakatspark', 'krosslag', 'parering', 'fallteknik', 'liggande'], who: 'Landet Erebos.', src: 'Gigant s. 37' },
  'Tanno-tekniken': { parts: ['fint', 'initiativ'], weapon: 'trastav', who: 'Den Lysande Vägens solmunker. Trestav som anfaller og parerer i samme SR.', src: 'Gigant s. 37' },
};
for (const k of Object.keys(KONSTER)) SKILLS.push({ id: k, attr: 'SMI', type: 'konst', kat: 'A', use: 'Stridskonst: ' + KONSTER[k].parts.map(p => KONST_PARTS[p].name).join(', ') + '.' });
export function konstCost(id) { return Math.ceil(KONSTER[id].parts.reduce((a, p) => a + KONST_PARTS[p].cost, 0) + (KONSTER[id].weapon ? 3 : 0)); }

export const SKILL = Object.fromEntries(SKILLS.map(s => [s.id, s]));
export const PRIMARY = SKILLS.filter(s => s.type === 'prim').map(s => s.id);

// --- Rustning (Bok III s. 36) -------------------------------------------------------------
// covers: kroppsdeler. Bare én rustningsdel per kroppsdel; har to deler samme kroppsdel, teller den beste.
// slot: hvor den bæres i spillet (hjalm, rustning = overkropp, armar, ben).
const A = (id, name, slot, covers, abs, kg, price, o = {}) => ({ id, name, slot, covers, abs, kg, price, metal: !!o.metal, clank: !!o.clank, noInfect: !!o.noInfect, perception: o.perception || 0, mat: o.mat || 'lader' });
const ARMS = ['harm', 'varm'], LEGS = ['hben', 'vben'], TORSO = ['brost', 'mage'];
export const ARMORS = {
  // hjälmar (huvud)
  tyghuva: A('tyghuva', 'Tyghuva', 'hjalm', ['huvud'], 1, 0.5, 25, { mat: 'tyg' }),
  laderhuva: A('laderhuva', 'Läderhuva', 'hjalm', ['huvud'], 2, 0.5, 80),
  nitladerhuva: A('nitladerhuva', 'Nitläderhuva', 'hjalm', ['huvud'], 3, 1, 180, { mat: 'nit' }),
  ringbrynjehuva: A('ringbrynjehuva', 'Ringbrynjehuva', 'hjalm', ['huvud'], 4, 4, 300, { metal: true, noInfect: true, mat: 'ring' }),
  oppenhjalm: A('oppenhjalm', 'Öppen metallhjälm', 'hjalm', ['huvud'], 6, 4, 500, { metal: true, mat: 'plat' }),
  tunnhjalm: A('tunnhjalm', 'Tunnhjälm', 'hjalm', ['huvud'], 8, 6, 1000, { metal: true, perception: -5, mat: 'plat' }),
  // harnesk (bröstkorg och mage)
  tygharnesk: A('tygharnesk', 'Vadderad tygrock', 'rustning', TORSO, 1, 2, 130, { mat: 'tyg' }),
  laderharnesk: A('laderharnesk', 'Läderharnesk', 'rustning', TORSO, 2, 3, 600),
  nitladerharnesk: A('nitladerharnesk', 'Nitläderharnesk', 'rustning', TORSO, 3, 4, 1150, { mat: 'nit' }),
  hardatlader: A('hardatlader', 'Härdat läderharnesk', 'rustning', TORSO, 4, 4, 1500),
  ringbrynjeskjorta: A('ringbrynjeskjorta', 'Ringbrynjeskjorta', 'rustning', TORSO, 5, 10, 1500, { metal: true, noInfect: true, mat: 'ring' }),
  fjallpansar: A('fjallpansar', 'Fjällpansar', 'rustning', TORSO, 6, 14, 1500, { metal: true, clank: true, mat: 'plat' }),
  metallharnesk: A('metallharnesk', 'Metallharnesk', 'rustning', TORSO, 7, 12, 1900, { metal: true, clank: true, mat: 'plat' }),
  // brynja (bröstkorg, mage, armar) og hauberk (hele kroppen unntatt hodet)
  ringbrynja: A('ringbrynja', 'Ringbrynja', 'rustning', [...TORSO, ...ARMS], 5, 16, 2000, { metal: true, noInfect: true, mat: 'ring' }),
  hauberk: A('hauberk', 'Ringbrynjehauberk', 'rustning', [...TORSO, ...ARMS, ...LEGS], 5, 32, 3500, { metal: true, noInfect: true, mat: 'ring' }),
  helrustning: A('helrustning', 'Helrustning', 'rustning', [...TORSO, ...ARMS, ...LEGS], 8, 25, 5100, { metal: true, clank: true, mat: 'plat' }),
  // armskydd og benskydd (per par)
  laderarmskydd: A('laderarmskydd', 'Läderarmskydd', 'armar', ARMS, 2, 3, 250),
  nitladerarmskydd: A('nitladerarmskydd', 'Nitläderarmskydd', 'armar', ARMS, 3, 5, 500, { mat: 'nit' }),
  metallarmskydd: A('metallarmskydd', 'Armskenor av metall', 'armar', ARMS, 7, 6, 1350, { metal: true, clank: true, mat: 'plat' }),
  laderbenskydd: A('laderbenskydd', 'Läderbenskydd', 'ben', LEGS, 2, 4, 400),
  nitladerbenskydd: A('nitladerbenskydd', 'Nitläderbenskydd', 'ben', LEGS, 3, 6, 750, { mat: 'nit' }),
  brynjehosor: A('brynjehosor', 'Brynjehosor', 'ben', LEGS, 5, 15, 2500, { metal: true, noInfect: true, mat: 'ring' }),
  metallbenskydd: A('metallbenskydd', 'Benskenor av metall', 'ben', LEGS, 7, 7, 1850, { metal: true, clank: true, mat: 'plat' }),
};

// --- Annen utrustning (Bok III s. 38-44). kg og pris i sm ---------------------------------------
export const GEAR = {
  fackla: { name: 'Fackla', kg: 1, price: 1 },
  elddon: { name: 'Elddon', kg: 0.2, price: 5 },
  rep: { name: 'Rep, 10 m', kg: 2, price: 15 },
  entrehake: { name: 'Änterhake', kg: 2, price: 50 },
  smedverktyg: { name: 'Smidesverktyg', fx: 'smith', kg: 5, price: 190 },
  lykta: { name: 'Lykta och lampolja', fx: 'light', kg: 1, price: 30 },
  lyra: { name: 'Lyra', fx: 'instrument', kg: 1, price: 150 },
  flojt: { name: 'Flöjt', fx: 'instrument', kg: 0.2, price: 30 },
  koger: { name: 'Koger med 20 pilar', kg: 1, price: 40 },
  sovfall: { name: 'Sovfäll', fx: 'rest', kg: 3, price: 30 },
  dyrkar: { name: 'Dyrkar', fx: 'lockpicks', kg: 0.2, price: 150 },
  kulor: { name: 'Slungkulor', kg: 1, price: 5 },
  formelsamling: { name: 'Formelsamling', kg: 2, price: 200 },
  ryggsack: { name: 'Ryggsäck', kg: 1, price: 20 },
  forband: { name: 'Förband', fx: 'bandage', kg: 0.2, price: 10 },
  somngift: { name: 'Sömngift', fx: 'sleep', kg: 0.1, price: 300 },
  heligtsymbol: { name: 'Heligt solsymbol', kg: 0.2, price: 50 },
};

// --- Yrken (Bok I s. 11-22) ----------------------------------------------------------------
// req: krav på grundegenskaper. pick: antall yrkesfärdigheter man velger (12, magiker 9).
// skills: mulige yrkesfärdigheter. tall i 'max' = høyst så mange fra gruppa (vapen, språk, instrument, hantverk).
// ability: yrkesförmåga (se ABILITIES). kit: forslag til startutrustning (boka har ingen, uv).
export const PROFESSIONS = [
  { id: 'bard', name: 'Bard', req: { SMI: 12, KAR: 14 }, pick: 12, ability: 'bardsang', max: { vapen: 1, tala: 2, lasa: 1, instrument: 99, hantverk: 1 },
    skills: ['vapen', 'Tala främmande språk', 'Läsa/Skriva främmande språk', 'Administration', 'Akrobatik', 'Buktala', 'Dans', 'Djurträning', 'Dolk', 'Förfalskning', 'Geografi', 'Gyckelkonster', 'Hantverk', 'Hasardspel', 'Heraldik', 'Historia', 'Hypnotisera', 'Knopar', 'Kulturkännedom', 'Låsdyrkning', 'Läppläsning', 'Muta', 'Målning', 'Schack & brädspel', 'Simma', 'Skådespeleri', 'Spela instrument', 'Språkkunskap', 'Trästav'],
    kit: { w: ['dolk'], a: ['laderharnesk'], g: ['lyra', 'fackla', 'elddon'] }, desc: 'Sångare och berättare. Musiken gör alla som hör den mer mottagliga.' },
  { id: 'helare', name: 'Helare', req: { INT: 12, PSY: 12 }, pick: 12, ability: 'handpalaggning', max: { tala: 2, lasa: 1, hantverk: 1 },
    skills: ['Tala främmande språk', 'Läsa/Skriva främmande språk', 'Alkemi', 'Djurhelning', 'Drogkunskap', 'Geografi', 'Giftkunskap', 'Hantverk', 'Hypnotisera', 'Kulturkännedom', 'Kunskap om demoner', 'Kunskap om magi', 'Kunskap om odöda', 'Läkekonst', 'Massage', 'Orientering', 'Simma', 'Språkkunskap', 'Trästav', 'Zoologi', 'Örtkunskap', 'Överlevnad'],
    kit: { w: ['trastav'], a: ['tygharnesk'], g: ['forband', 'fackla', 'elddon'] }, desc: 'Läker med händerna: en KP per PSY-poäng.' },
  { id: 'krigare', name: 'Krigare', req: { STY: 14, FYS: 12 }, pick: 12, ability: 'krigarinitiativ', max: { vapen: 99, tala: 1, hantverk: 1 },
    skills: ['vapen', 'Tala främmande språk', 'Avväpna', 'Bärsärkagång', 'Dra vapen', 'Dolk', 'Geografi', 'Hantverk', 'Hasardspel', 'Kulturkännedom', 'Simma', 'Stridskonster', 'Trästav', 'Två vapen'],
    kit: { w: ['bredsvard', 'vanligskold'], a: ['ringbrynjeskjorta', 'oppenhjalm'], g: ['fackla', 'elddon'] }, desc: 'Soldater och legoknektar. Alltid +5 på initiativet.' },
  { id: 'lardman', name: 'Lärd man', req: { INT: 16 }, pick: 12, ability: 'lardlugn', max: { tala: 4, lasa: 4 },
    skills: ['Tala främmande språk', 'Läsa/Skriva främmande språk', 'Administration', 'Alkemi', 'Astrologi', 'Dolk', 'Drogkunskap', 'Förfalskning', 'Geografi', 'Geologi', 'Giftkunskap', 'Hasardspel', 'Heraldik', 'Historia', 'Kulturkännedom', 'Kunskap om demoner', 'Kunskap om magi', 'Kunskap om odöda', 'Räkning', 'Schack & brädspel', 'Simma', 'Språkkunskap', 'Trästav', 'Zoologi', 'Örtkunskap'],
    kit: { w: ['dolk'], a: [], g: ['lykta', 'elddon'] }, desc: 'Vet mer än de flesta. Alltid -5 på Skräcktabellen.' },
  { id: 'lonnmordare', name: 'Lönnmördare', req: { SMI: 14, PSY: 12 }, pick: 12, ability: 'bakhall', max: { vapen: 1, tala: 1 },
    skills: ['vapen', 'Tala främmande språk', 'Administration', 'Akrobatik', 'Dra vapen', 'Dolk', 'Förfalskning', 'Geografi', 'Giftkunskap', 'Hantera fällor', 'Hasardspel', 'Hypnotisera', 'Knopar', 'Kulturkännedom', 'Låsdyrkning', 'Muta', 'Simma', 'Skådespeleri', 'Stavhopp', 'Stridskonster', 'Teckenspråk', 'Trästav', 'Undre världen', 'Änterhake'],
    kit: { w: ['dolk', 'kastkniv'], a: ['laderharnesk', 'laderhuva'], g: ['dyrkar', 'fackla', 'elddon'] }, desc: 'Attack bakifrån: dubbel skada, fyrdubbel på perfekt slag.' },
  { id: 'magiker', name: 'Magiker', req: { INT: 12, PSY: 14 }, pick: 9, ability: null, magic: true, max: { tala: 3, lasa: 3, magi: 1 },
    skills: ['Tala främmande språk', 'Läsa/Skriva främmande språk', 'Alkemi', 'Astrologi', 'Djurhelning', 'Djurträning', 'Drogkunskap', 'Geografi', 'Giftkunskap', 'Kulturkännedom', 'Kunskap om demoner', 'Kunskap om magi', 'Kunskap om odöda', 'Magisk kanalisering', 'magi', 'Räkning', 'Simma', 'Språkkunskap', 'Trästav', 'Zoologi', 'Örtkunskap'],
    kit: { w: ['trastav'], a: ['tygharnesk'], g: ['formelsamling', 'fackla', 'elddon'] }, desc: 'Lär sig besvärjelser från början. Inget järn mot huden när han trollar.' },
  { id: 'munk', name: 'Munk', req: { INT: 12, PSY: 12 }, pick: 12, ability: 'meditation', max: { tala: 3, lasa: 3, instrument: 2, hantverk: 1 },
    skills: ['Tala främmande språk', 'Läsa/Skriva främmande språk', 'Avväpna', 'Djurhelning', 'Drogkunskap', 'Förfalskning', 'Geografi', 'Giftkunskap', 'Hantverk', 'Heraldik', 'Historia', 'Knopar', 'Kulturkännedom', 'Kunskap om demoner', 'Kunskap om magi', 'Kunskap om odöda', 'Läkekonst', 'Massage', 'Målning', 'Räkning', 'Simma', 'Spela instrument', 'Språkkunskap', 'Stridskonster', 'Trästav', 'Zoologi', 'Örtkunskap'],
    kit: { w: ['trastav'], a: [], g: ['forband', 'fackla', 'elddon'] }, desc: 'Mediterar för att bli bättre på nästa slag.' },
  { id: 'sjofarare', name: 'Sjöfarare', req: { FYS: 12, SMI: 12 }, pick: 12, ability: 'sjoben', max: { vapen: 3, tala: 3, lasa: 1, instrument: 2, hantverk: 1 },
    skills: ['vapen', 'Tala främmande språk', 'Läsa/Skriva främmande språk', 'Akrobatik', 'Dans', 'Dolk', 'Geografi', 'Hantverk', 'Hasardspel', 'Gyckelkonster', 'Knopar', 'Kulturkännedom', 'Muta', 'Navigera', 'Orientering', 'Schack & brädspel', 'Simma', 'Sjökunnighet', 'Spela instrument', 'Spå väder', 'Stavhopp', 'Trästav', 'Undre världen', 'Änterhake'],
    kit: { w: ['kroksabel', 'kastkniv'], a: ['laderharnesk'], g: ['rep', 'fackla', 'elddon'] }, desc: '+5 mot eld, köld och andra element.' },
  { id: 'riddare', name: 'Riddare', req: { STY: 14, FYS: 12, PSY: 12 }, pick: 12, ability: 'riddarslag', max: { vapen: 5, tala: 1, lasa: 1, instrument: 2 },
    skills: ['vapen', 'Tala främmande språk', 'Läsa/Skriva främmande språk', 'Administration', 'Avväpna', 'Dans', 'Djurträning', 'Dra vapen', 'Dolk', 'Geografi', 'Heraldik', 'Historia', 'Kulturkännedom', 'Kunskap om magi', 'Kunskap om odöda', 'Målning', 'Räkning', 'Schack & brädspel', 'Simma', 'Spela instrument', 'Språkkunskap', 'Trästav', 'Två vapen'],
    kit: { w: ['bredsvard', 'vanligskold'], a: ['ringbrynja', 'tunnhjalm'], g: ['fackla', 'elddon'] }, desc: 'Kan bränna 5 PSY för ett hugg med maximal skada.' },
  { id: 'tjuv', name: 'Tjuv', req: { SMI: 16 }, pick: 12, ability: 'tjuvtur', max: { vapen: 2, tala: 1, instrument: 2 },
    skills: ['vapen', 'Tala främmande språk', 'Administration', 'Akrobatik', 'Buktala', 'Dra vapen', 'Dolk', 'Förfalskning', 'Geografi', 'Gyckelkonster', 'Hantera fällor', 'Hasardspel', 'Hypnotisera', 'Knopar', 'Kulturkännedom', 'Låsdyrkning', 'Läppläsning', 'Muta', 'Räkning', 'Simma', 'Skådespeleri', 'Spela instrument', 'Stavhopp', 'Teckenspråk', 'Trästav', 'Undre världen', 'Änterhake'],
    kit: { w: ['dolk', 'kastkniv'], a: ['laderharnesk'], g: ['dyrkar', 'fackla', 'elddon'] }, desc: 'Kan bränna PSY för +1 till +3 på ett slag, två gånger mellan varje sömn.' },
  { id: 'utbygdsjagare', name: 'Utbygdsjägare', req: { FYS: 12, SMI: 12, PSY: 12 }, pick: 12, ability: 'animistjagare', max: { vapen: 3, tala: 1, hantverk: 1 },
    skills: ['vapen', 'Tala främmande språk', 'Animism', 'Djurhelning', 'Djurträning', 'Dolk', 'Drogkunskap', 'Geografi', 'Geologi', 'Giftkunskap', 'Hantverk', 'Hantera fällor', 'Knopar', 'Kulturkännedom', 'Orientering', 'Simma', 'Spå väder', 'Trästav', 'Zoologi', 'Örtkunskap', 'Överlevnad'],
    kit: { w: ['litenbage', 'handyxa'], a: ['laderharnesk'], g: ['koger', 'sovfall', 'fackla', 'elddon'] }, desc: 'Kan lära sig animism och dess besvärjelser upp till skolvärde 12.' },
];
export const PROF = Object.fromEntries(PROFESSIONS.map(p => [p.id, p]));

// Yrkesförmågor (Bok I s. 12-22). key: hvilken tast i spillet, vp: PSY-kostnad.
export const ABILITIES = {
  bardsang: { name: 'Bardens sång', key: 'F', psy: 0, text: 'Spill eller syng i ett minutt med et lyckat slag: alle som hører deg ser KAR som +5 i en time (bare i byen).' },
  handpalaggning: { name: 'Handpåläggning', key: 'F', psy: 1, text: 'Hold F: helbreder 1 KP per SR på deg selv. Koster 1 PSY per KP. PSY kan ikke gå under 1.' },
  krigarinitiativ: { name: '+5 på initiativ', passive: true, text: 'Alltid +5 på initiativ: anfallene dine kommer raskere (spillets tolkning).' },
  lardlugn: { name: 'Lärd mans lugn', passive: true, text: 'Alltid -5 på alle slag på Skräcktabellen.' },
  bakhall: { name: 'Attack bakifrån', passive: true, text: 'Fra Smyga og bakfra: bommer du, treffer du likevel med vanlig skade. Lyckat gir dobbel skade, perfekt fyrdubbel. Ingen skadebonus. Bare mot humanoider.' },
  meditation: { name: 'Meditation', key: 'F', psy: 0, text: 'Hold F og stå helt stille: +1 FV per SR på neste slag, høyst dobbelt FV. Må brukes innen ett minutt.' },
  sjoben: { name: 'Sjöfarare', passive: true, text: '+5 på FYS, STO eller STY mot ild, kulde og andre element.' },
  riddarslag: { name: 'Riddarslag', key: 'F', psy: 5, text: 'F: bruk 5 PSY. Neste treff gjør maksimal skade med maksimal skadebonus.' },
  tjuvtur: { name: 'Tjuvens tur', key: 'F', psy: 1, text: 'F: +1 CL per PSY (høyst +3) på neste slag. To ganger mellom hver søvn (hvert nivå i spillet).' },
  animistjagare: { name: 'Animism', passive: true, text: 'Kan lære animism og besvärjelser med skolvärde 12 eller lavere (i byen hos Gynerva).' },
};

// --- Särskilda förmågor, 2T20 + BP (Bok I s. 25-26). fx: hva spillet gjør med den -------------
export const SPECIALS = [
  { r: [3, 4], name: 'Skicklig', text: '+1 FV i en valgfri sekundær ferdighet.', fx: { anySek: 1 } },
  { r: [5, 6], name: 'Sjöfararbakgrund', text: '+2 FV i Sjökunnighet og Navigera.', fx: { skill: { Sjökunnighet: 2, Navigera: 2 } } },
  { r: [7, 8], name: 'Starka vrister', text: '+3 FV i Hoppa.', fx: { skill: { Hoppa: 3 } } },
  { r: [9, 10], name: 'Bråkig uppväxt', text: '+3 FV i Slagsmål.', fx: { skill: { Slagsmål: 3 } } },
  { r: [11, 12], name: 'Hantverkarbakgrund', text: '+3 FV i Hantverk.', fx: { skill: { Hantverk: 3 } } },
  { r: [13, 14], name: 'Smidig kropp', text: '+3 FV i Akrobatik.', fx: { skill: { Akrobatik: 3 } } },
  { r: [15, 16], name: 'Köpmannabakgrund', text: '+3 FV i Värdera.', fx: { skill: { Värdera: 3 } } },
  { r: [17, 18], name: 'God koordinationsförmåga', text: '+3 FV i Två vapen.', fx: { skill: { 'Två vapen': 3 } } },
  { r: [19, 20], name: 'Hobbyist', text: 'FV 3 i en valgfri sekundær ferdighet.', fx: { anySek: 3 } },
  { r: [21, 22], name: 'Starka nypor', text: 'Alltid +3 på CL i Klättra.', fx: { cl: { Klättra: 3 } } },
  { r: [23, 24], name: 'Mottagligt medium', text: '+5 på CL i Magisk kanalisering som passiv part.', fx: {} },
  { r: [25, 26], name: 'Hängiven student', text: '+2 FV i en valgfri ferdighet.', fx: { anySkill: 2 } },
  { r: [27, 28], name: 'Övertygande tonfall', text: 'Alltid +3 på CL i Övertala og Muta.', fx: { cl: { Övertala: 3, Muta: 3 } } },
  { r: [29, 30], name: 'Sjätte sinne', text: '+1 FV i Upptäcka fara og Finna dolda ting.', fx: { skill: { 'Upptäcka fara': 1, 'Finna dolda ting': 1 } } },
  { r: [31, 32], name: 'Stirrande blick', text: '+5 på CL i Hypnotisera.', fx: { cl: { Hypnotisera: 5 } } },
  { r: [33, 34], name: 'Magikänsla', text: '+5 på CL i Känna magi.', fx: { cl: { 'Känna magi': 5 } } },
  { r: [35, 36], name: 'Gott språksinne', text: 'FV 20 i å tale og lese et språk.', fx: { setSkill: { 'Tala främmande språk': 20, 'Läsa/Skriva främmande språk': 20 } } },
  { r: [37, 38], name: 'Stort kunskapsområde', text: 'To ekstra yrkesfärdigheter.', fx: { extraPicks: 2 } },
  { r: [39, 40], name: 'God bågskytt', text: 'Alle skuddvåpen når 25 % lenger.', fx: { range: 25 } },
  { r: [41, 42], name: 'Absolut gehör', text: 'Grundkostnad 1 for Spela instrument og Sjunga.', fx: { cost: { 'Spela instrument': 1, Sjunga: 1 } } },
  { r: [43, 44], name: 'Precisionssinne', text: 'CL +1 med alle våpen.', fx: { weaponCL: 1 } },
  { r: [45, 46], name: 'Dubbelhänt', text: 'Begge hender like gode (ikke samtidig).', fx: { hand: 'dubbelhant' } },
  { r: [47, 48], name: 'God tidskänsla', text: 'Vet alltid hva klokka er.', fx: {} },
  { r: [49, 51], name: 'Absolut ögonmått', text: 'Bedømmer avstander nesten perfekt.', fx: {} },
  { r: [52, 54], name: 'Mycket uppmärksam', text: 'Alltid +2 på CL i Finna dolda ting og Upptäcka fara.', fx: { cl: { 'Finna dolda ting': 2, 'Upptäcka fara': 2 } } },
  { r: [55, 55], name: 'Blixtrande reflexer', text: '+3 på alle initiativslag.', fx: { init: 3 } },
  { r: [56, 56], name: 'Bärsärk', text: '+5 FV i Bärsärkagång.', fx: { skill: { Bärsärkagång: 5 } } },
  { r: [57, 57], name: 'Gott balanssinne', text: '+5 SMI til balanse og å lande på beina.', fx: {} },
  { r: [58, 58], name: 'Hästarnas herre', text: '+10 FV i Rida.', fx: { skill: { Rida: 10 } } },
  { r: [59, 59], name: 'Ambidextriös', text: 'Begge hender samtidig til ulike ting.', fx: { hand: 'ambidextrios' } },
  { r: [60, 60], name: 'Djurvän', text: 'Vanlige dyr angriper deg aldri.', fx: { animalFriend: true } },
  { r: [61, 61], name: 'Turgubbe', text: 'Kan alltid kjøpe +1 CL for 1 PSY.', fx: { luck: true } },
  { r: [62, 62], name: 'Magisk empati', text: 'Kjenner igjen magiske ting.', fx: {} },
  { r: [63, 63], name: 'Gudarnas gunstling', text: 'Hver gang KP når 0: 25 % sjanse for at guden gir alle KP tilbake.', fx: { favored: true } },
  { r: [64, 64], name: 'Lättlärd', text: 'Grundkostnad 4 for sekundære ferdigheter.', fx: { secCost: 4 } },
  { r: [65, 65], name: 'Extremt smärttålig', text: 'Totala KP x 1,5.', fx: { kpMul: 1.5 } },
  { r: [66, 66], name: 'Snabbslående', text: 'Slår alltid først (anfallene dine er raskere).', fx: { init: 6 } },
  { r: [67, 67], name: 'Baneman', text: '+5 på CL mot en rase eller et folkeslag.', fx: { bane: 'orc' } },
  { r: [68, 68], name: 'God kroppskontroll', text: 'Normalt FYS-slag: +5 STY i 3 SR, to ganger om dagen.', fx: {} },
  { r: [69, 69], name: 'Järnnäve', text: 'Alltid maksimal skade uten våpen.', fx: { ironFist: true } },
  { r: [70, 70], name: 'Extremt orädd', text: '-5 på alle slag på Skräcktabellen.', fx: { fear: -5 } },
  { r: [71, 71], name: 'Orubblig vilja', text: '+5 på PSY i PSY mot PSY.', fx: { willpower: 5 } },
  { r: [72, 72], name: 'Härdig mot element', text: '+5 på FYS mot ild, kulde og vann.', fx: {} },
  { r: [73, 73], name: 'Gott läkekött', text: 'Skader gror dobbelt så fort.', fx: { healMul: 2 } },
  { r: [74, 74], name: 'God mental kontroll', text: 'PSY kommer tilbake på halve tida.', fx: { psyRegen: 2 } },
  { r: [75, 75], name: 'Naturlig färdighet med vapen', text: '+5 FV med ett valgfritt våpen.', fx: { weaponFV: 5 } },
  { r: [76, 76], name: 'Kluven personlighet', text: 'Yrkesförmågan fra et annet yrke i tillegg.', fx: {} },
  { r: [77, 77], name: 'God känsla för yrket', text: 'Halv pris på en yrkesfärdighet.', fx: {} },
  { r: [78, 78], name: 'Hamnbytare', text: 'Kan skifte ham til et dyr.', fx: {} },
  { r: [79, 79], name: 'Snabb uppfattningsförmåga', text: '+5 på CL på parering i närstrid, og kan parere piler.', fx: { parryCL: 5, parryArrows: true } },
  { r: [80, 80], name: 'God PSY-potential', text: '-5 når du prøver å heve PSY.', fx: {} },
  { r: [81, 999], name: 'Höjd grundegenskap', text: '+1 på tre grundegenskaper.', fx: { attrs: 3 } },
];
export function special(n) { return SPECIALS.find(s => n >= s.r[0] && n <= s.r[1]) || SPECIALS[SPECIALS.length - 1]; }

// Svärdshand (Bok I s. 27), socialt stånd og startkapital (Bok I s. 27)
export const STAND = [
  { max: 2, name: 'Egendomslös' }, { max: 4, name: 'Lägre underklass' }, { max: 7, name: 'Högre underklass' }, { max: 11, name: 'Lägre medelklass' },
  { max: 16, name: 'Högre medelklass' }, { max: 22, name: 'Lägre överklass' }, { max: 29, name: 'Högre överklass' }, { max: 37, name: 'Lågadel' }, { max: 999, name: 'Högadel' },
];
export const MONEY = [[2, 200], [4, 400], [7, 600], [11, 1000], [16, 2000], [22, 3000], [29, 5000], [37, 10000], [46, 20000], [56, 30000], [999, 50000]];
export function standOf(n) { return STAND.find(s => n <= s.max).name; }
export function moneyOf(n) { return MONEY.find(m => n <= m[0])[1]; }

// --- Magi (Bok III s. 3-31) --------------------------------------------------------------------
// Slaget: CL = S - 2 x (E - 1). Lyckat koster E PSY, perfekt halve E (minst 1), misslyckat 1 PSY, fummel E PSY og Snedtändning.
// PSY er grundegenskapen selv. PSY 0 = døden. Ikke i kontakt med jern (metallrustning stopper magi).
// sv: skolvärde (skolans FV som trengs). kind: hvordan spillet bruker den. f: fysisk manifestation (ingen motstand).
// Bare besvärjelser som gir mening i spillet er med. Resten står i docs/regler/magi.md.
export const SPELLS = {
  // Allmänna
  varseblivning: { name: 'VARSEBLIVNING', school: 'Allmän', sv: 6, kind: 'detect', text: 'Retning og avstand til nærmeste skjulte ting (gjemmested, kiste, trapp). Hver E viser en til.' },
  skingra: { name: 'SKINGRA', school: 'Allmän', sv: 6, kind: 'dispel', text: 'Opphever en annen besvärjelse hvis E vinner over dens E.' },
  antimagi: { name: 'ANTIMAGI', school: 'Allmän', sv: 6, kind: 'buff', dur: 'S/4min', text: 'Magisk skjold: fiendtlig magi må vinne over E på Motståndstabellen.' },
  // Animism
  traeld: { name: 'TRÄELD', school: 'Animism', sv: 2, kind: 'light', f: true, quick: true, text: 'Tenner et stykke tørt tre. I spillet: tenner en fakkel.' },
  minska: { name: 'MINSKA', school: 'Animism', sv: 6, kind: 'debuff', resist: true, text: '-1 per E på STY, FYS, SMI eller STO hos målet i S/4 minutter.' },
  oka: { name: 'ÖKA', school: 'Animism', sv: 6, kind: 'buff', dur: 'S/4min', text: '+1 per E på STY (eller SMI) i S/4 minutter.' },
  vindpil: { name: 'VINDPIL', school: 'Animism', sv: 6, kind: 'arrow', f: true, text: 'En pil som alltid treffer målet: 1T10+E skade. Rustning tar som vanlig.' },
  ortrankor: { name: 'ÖRTRANKOR', school: 'Animism', sv: 6, kind: 'root', f: true, text: 'Ranker fanger målet. 1 E per 10 STO. Målet slår STY mot E x 10 - STO hver SR.' },
  kamouflage: { name: 'KAMOUFLAGE', school: 'Animism', sv: 7, kind: 'hide', dur: 'S/4min', text: 'Står du helt stille, kan ingen se deg.' },
  hela: { name: 'HELA', school: 'Animism', sv: 12, kind: 'heal', text: 'Helbreder 1T6 KP per E på en kroppsdel (og totala KP).' },
  kannafiendskap: { name: 'KÄNNA FIENDSKAP', school: 'Animism', sv: 12, kind: 'sense', text: 'Merker om skapninger i nærheten vil deg vondt.' },
  neutraliseragift: { name: 'NEUTRALISERA GIFT', school: 'Animism', sv: 15, kind: 'cure', f: true, text: 'Fjerner 1T6+1 giftstyrke per E.' },
  tillkallarattor: { name: 'TILLKALLA VARELSE (däggdjur)', school: 'Animism', sv: 2, kind: 'summon', text: 'Kaller 20 STO med dyr per E. Rottene i kloakken hjelper deg en stund (spillets tolkning).' },
  // Elementarmagi
  ljus: { name: 'LJUS', school: 'Elementarmagi', sv: 2, kind: 'light', f: true, text: 'En gjenstand lyser opp 3 m rundt seg, +3 m per E. Fiender ser deg også.' },
  morker: { name: 'MÖRKER', school: 'Elementarmagi', sv: 3, kind: 'dark', f: true, text: 'En kule av mørke, 6 m. Ingen ser inn. -15 for alle uten mørkesyn.' },
  skold: { name: 'SKÖLD', school: 'Elementarmagi', sv: 3, kind: 'airshield', f: true, quick: true, text: 'Lufta blir et skjold som parerer neste fysiske anfall automatisk. BV 4, +2 per E.' },
  flammandehand: { name: 'FLAMMANDE HAND', school: 'Elementarmagi', sv: 4, kind: 'flamehand', f: true, text: 'Hånda brenner: +1T3 skade per E i 1T3 minutter.' },
  kallahanden: { name: 'KALLA HANDEN', school: 'Elementarmagi', sv: 4, kind: 'chill', f: true, quick: true, text: 'Kulde mot ett mål: svårt FYS-slag eller det kan ikke gjøre noe denne SR. Klarer det seg, -4 på CL.' },
  blixt: { name: 'BLIXT', school: 'Elementarmagi', sv: 6, kind: 'bolt', f: true, quick: true, text: 'Lyn mot nærmeste mål foran deg: 1T6 per E. Rustning hjelper ikke. Bare totala KP.' },
  eld: { name: 'ELD', school: 'Elementarmagi', sv: 6, kind: 'fireball', f: true, text: 'Hete i en kule på 1 m: 1T6 per E. Rustning tar. Bare totala KP.' },
  energistrale: { name: 'ENERGISTRÅLE', school: 'Elementarmagi', sv: 6, kind: 'beam', f: true, text: 'Lysstråle mot ett mål: 1T3 per E på en kroppsdel. Rustning tar.' },
  frost: { name: 'FROST', school: 'Elementarmagi', sv: 6, kind: 'frost', f: true, text: 'Kulde i en kule på 1 m: 1T6 per E. Slukker ild.' },
  fortrollavapen: { name: 'FÖRTROLLA VAPEN', school: 'Elementarmagi', sv: 6, kind: 'weaponbuff', dur: 'Sx1min', text: '+1 CL og +1 skade per E. Biter på skapninger som bare skades av magi.' },
  knacka: { name: 'KNÄCKA', school: 'Elementarmagi', sv: 6, kind: 'shatter', f: true, quick: true, text: 'Knuser ting: BV -10, +2 per E. Knuser kister, tønner og skjold.' },
  oppna: { name: 'ÖPPNA', school: 'Elementarmagi', sv: 6, kind: 'unlock', f: true, text: 'Åpner låste kister og dører.' },
  virvelskold: { name: 'VIRVELSKÖLD', school: 'Elementarmagi', sv: 8, kind: 'whirl', f: true, dur: 'Sx1SR', text: 'Virvelvind rundt deg. Prosjektiler bøyes av hvis E vinner over pilens motståndsvärde (4).' },
  astralvapen: { name: 'ASTRALVAPEN', school: 'Elementarmagi', sv: 10, kind: 'astral', f: true, dur: 'Sx1SR', text: 'Et sverd av blått lys. Magisk, gjør 2 mindre skade enn et ekte sverd.' },
  explosion: { name: 'EXPLOSION', school: 'Elementarmagi', sv: 11, kind: 'explosion', f: true, quick: true, text: 'Eksplosjon: 5 skade per E til alle innen E meter, 1 mindre per rute lenger ut. Du kan treffe deg selv. Alle blendes.' },
  // Mentalism
  sprang: { name: 'SPRÅNG', school: 'Mentalism', sv: 1, kind: 'leap', quick: true, text: 'Et kjempesprang: 4 m per E bortover.' },
  motstandskraft: { name: 'MOTSTÅNDSKRAFT', school: 'Mentalism', sv: 3, kind: 'buff', dur: 'Sx1min', text: 'Hver skade av ild og kulde blir 1 mindre per E.' },
  skydd: { name: 'SKYDD', school: 'Mentalism', sv: 6, kind: 'armor', dur: 'S/4min', text: '+1 i rustning overalt per E.' },
  laderhud: { name: 'LÄDERHUD', school: 'Mentalism', sv: 8, kind: 'armor2', dur: 'Sx1h', text: 'Huden blir lær: naturlig skydd 2. KAR -2.' },
  morkersyn: { name: 'MÖRKERSYN', school: 'Mentalism', sv: 8, kind: 'nightvision', dur: 'Sx1h', text: 'Ser varme. I spillet: du ser fiender gjennom mørket på kartet.' },
  osynlighet: { name: 'OSYNLIGHET', school: 'Mentalism', sv: 9, kind: 'invis', dur: 'Sx1min', text: '6 STO usynlig per E. Brytes hvis du slåss, løper eller blir skadet.' },
  elchock: { name: 'ELCHOCK', school: 'Mentalism', sv: 10, kind: 'shock', f: true, quick: true, text: '1T4 per E til alle du rører. Metallrustning tar bare halvparten.' },
  orad: { name: 'ORÄDD', school: 'Mentalism', sv: 14, kind: 'fearless', dur: 'Sx1min', text: 'Du slår aldri på Skräcktabellen.' },
};
export const SCHOOLS = ['Animism', 'Elementarmagi', 'Mentalism'];
export function spellBaseCost(sv) { return 2 + 2 * Math.floor((Math.max(1, sv) - 1) / 3); }

// Snedtändningstabellen, 1T20 + E (Bok III s. 8)
export const SNEDTANDNING = [
  { r: [1, 5], name: 'Halv effekt', text: 'Besvärjelsen virker med halv effektgrad.' },
  { r: [6, 11], name: 'Magien slår tilbake', text: 'Du mister like mange KP som effektgraden og besvimer en stund.' },
  { r: [12, 15], name: 'Selvforhekset', text: 'En skadelig besvärjelse rammer deg selv. En god en koster KP og gjør deg blind.' },
  { r: [16, 17], name: 'Stum', text: 'Du blir stum og kan ikke trylle resten av løpet.' },
  { r: [18, 18], name: 'Lam av magi', text: 'Du kan ikke utøve noen magi resten av løpet, men du kan snakke.' },
  { r: [19, 19], name: 'Hjerneskade', text: 'INT og INT-baserte ferdigheter -1T4. Du glemmer like mange besvärjelser.' },
  { r: [20, 999], name: 'Total hukommelsestap', text: 'Du kan ikke bruke ferdigheter eller magi resten av løpet, og får en fobi.' },
];

// --- Skräck (Bok III s. 8-11) ------------------------------------------------------------------
// Slaget: 1T20 - offerets PSY + Skräckslå + høyeste modifikasjon. Resultatet leses på tabellen.
export const SKRACK = [
  { max: 0, name: 'Uberørt', text: 'Så uberørt at du får -2 på Skräcktabellen resten av dagen.', calm: true },
  { max: 1, name: 'Uberørt', text: 'Skräcken biter ikke på deg.' },
  { max: 2, name: 'Forsiktig', text: '-1 på anfall og parering denne SR.', cl: -1, sr: 1 },
  { max: 3, name: 'Forsiktig', text: '-2 på anfall og parering i 1T4 SR.', cl: -2, sr: 'D4' },
  { max: 4, name: 'Lammet', text: 'Lammet av skräck denne SR.', paralyze: 1 },
  { max: 5, name: 'Forsiktig', text: '-1T4 på alt i 1T4 SR.', cl: 'D4', sr: 'D4' },
  { max: 6, name: 'Lammet', text: 'Lammet av skräck i 1T4 SR.', paralyze: 'D4' },
  { max: 7, name: 'Kvalm', text: 'Kramper og spyr. Kan ikke gjøre noe i 1T4+2 SR.', paralyze: 'D4+2' },
  { max: 8, name: 'Bärsärk', text: 'Går bärsärk og stormer mot kilden.', berserk: true },
  { max: 9, name: 'Mild fobi', text: 'Du får en mild fobi.', phobia: 5 },
  { max: 10, name: 'Flykt', text: 'Flykter fra kilden i 3T6 SR.', flee: '3D6' },
  { max: 11, name: 'Skjelving', text: 'Hender og bein skjelver: -2T4 på alt i 2T8 SR.', cl: '2D4', sr: '2D8' },
  { max: 12, name: 'Panikk', text: 'Flykter skrikende i tilfeldig retning i 3T6 SR.', flee: '3D6', random: true },
  { max: 13, name: 'Besvimer', text: 'Besvimer og våkner 2T8 SR senere.', faint: '2D8' },
  { max: 14, name: 'Besvimer', text: 'Besvimer lenge (2T8 minutter).', faint: 'long' },
  { max: 15, name: 'Normal fobi', text: 'Du får en fobi.', phobia: 10 },
  { max: 16, name: 'Rystet', text: 'Faller om og skjelver til kilden er borte. SMI halvert etterpå.', paralyze: 'source', halfSMI: true },
  { max: 17, name: 'Forsteinet', text: 'Står lammet til kilden går. +1 på tabellen resten av dagen.', paralyze: 'source' },
  { max: 18, name: 'Vill flukt', text: 'Flykter vilt og tør ikke komme tilbake.', flee: '6D6' },
  { max: 19, name: 'Overbelastet', text: 'Overser kilden fullstendig, som om den ikke var der.', ignore: true },
  { max: 20, name: 'Hysterisk', text: 'Står og skriker til kilden er borte.', paralyze: 'source' },
  { max: 999, name: 'Hjertet svikter', text: 'Besvimer av skräck. Håret blir hvitt.', faint: 'long' },
];
export function skrack(n) { return SKRACK.find(s => n <= s.max); }
export const FOBIER = ['Agorafobi', 'Klaustrofobi', 'Demofobi', 'Ailurofobi', 'Entemofobi', 'Ofiofobi', 'Skotofobi', 'Dendrofobi', 'Talassofobi', 'Xenofobi', 'Hippofobi', 'Troglofobi', 'Hagiofobi', 'Kynofobi', 'Ornithofobi', 'Iktyofobi', 'Pyrofobi', 'Botanofobi', 'Anekrofobi', 'Monofobi'];

// --- Fummeltabeller (Expert s. 60-61) ---------------------------------------------------------------
export const FUMMEL_NARSTRID = [
  { r: [1, 1], name: 'Vapnet går sönder', fx: 'break' },
  { r: [2, 7], name: 'Vacklar', text: 'Mister neste anfall eller parering.', fx: 'stagger' },
  { r: [8, 8], name: 'Helt ur balans', text: 'Mister de neste 1T3 anfallene.', fx: 'stagger3' },
  { r: [9, 10], name: 'Snubblar', text: 'Det tar en SR å komme seg opp.', fx: 'fall' },
  { r: [11, 11], name: 'Tappar rustning', text: 'En rustningsdel løsner.', fx: 'armor' },
  { r: [12, 13], name: 'Vrickar foten', text: 'Förflyttning -1 resten av striden.', fx: 'ankle' },
  { r: [14, 16], name: 'Tappar vapnet', text: 'Våpenet faller ned der du står.', fx: 'drop' },
  { r: [17, 17], name: 'Vapnet flyger', text: 'Våpenet slås 1T3 rutor bort.', fx: 'dropFar' },
  { r: [18, 18], name: 'Träffar sig själv', text: 'Ingen venn i nærheten, så du treffer deg selv.', fx: 'self' },
  { r: [19, 19], name: 'Klumpig', text: 'Neste fiendeangrep treffer automatisk.', fx: 'open' },
  { r: [20, 20], name: 'Rejäl klantighet', text: 'Slå to ganger.', fx: 'twice' },
];
export const FUMMEL_AVSTAND = [
  { r: [1, 12], name: 'Distraherad', text: 'Kan ikke gjøre noe denne SR.', fx: 'stagger' },
  { r: [13, 15], name: 'Tappar vapnet', text: 'Våpenet faller ned.', fx: 'drop' },
  { r: [16, 17], name: 'Snubblar', text: 'Det tar en SR å komme seg opp.', fx: 'fall' },
  { r: [18, 18], name: 'Träffar sig själv', text: 'Pila går i din egen fot.', fx: 'self' },
  { r: [19, 19], name: 'Vapnet går sönder', fx: 'break' },
  { r: [20, 20], name: 'Rejäl klantighet', text: 'Slå to ganger.', fx: 'twice' },
];
export const FUMMEL_PARERING = FUMMEL_NARSTRID;
export function fromRange(table, r) { return table.find(t => r >= t.r[0] && r <= t.r[1]); }

// --- Hjältedåd (Bok I s. 64, Expert s. 64-65, Gigant s. 8) ------------------------------------------
// Hjältepoäng (HP) fra FV 21 og store dåder. 1 HP: höja CL ett trinn. Hjälteförmågor kjøpes mellom løpene.
export const HJALTEFORMAGOR = {
  jarnnave: { name: 'Järnnäve', hp: 1, text: 'Knytnever og spark gjør alltid maksimal skade.' },
  kattfot: { name: 'Kattfot', hp: 2, text: 'Mister aldri balansen. Slås aldri over ende.' },
  skarpogd: { name: 'Skarpögd', hp: 4, text: 'CL i Upptäcka fara er alltid minst 15.' },
  snabbslaende: { name: 'Snabbslående', hp: 4, text: 'Anfallene dine kommer før alle andres.' },
  talig: { name: 'Tålig', hp: 4, text: 'To sjanser der andre får én (PSY mot PSY og lignende).' },
  orad: { name: 'Orädd', hp: 5, text: 'Slår aldri på Skräcktabellen.' },
  projektilparering: { name: 'Projektilparering', hp: 5, text: 'Kan parere piler og kastvåpen med sverd eller stav.' },
  snabblakning: { name: 'Snabbläkning', hp: 6, text: 'Skader gror dobbelt så fort.' },
  stalblick: { name: 'Stålblick', hp: 6, text: 'Fiender som ser deg slå normalt PSY-slag, ellers nøler de en SR.' },
  snabbfot: { name: 'Snabbfot', hp: 3, text: 'Förflyttning +2.', src: 'Gigant' },
  fint: { name: 'Fint', hp: 4, text: 'Fienden må klare et svårt INT-slag for å parere.', src: 'Gigant' },
  hjaltesprang: { name: 'Hjältesprång', hp: 4, text: 'Hopper fem ganger sin egen lengde.', src: 'Gigant' },
  giftskydd: { name: 'Giftskydd', hp: 5, text: 'Alle gifter har halv styrke mot deg.', src: 'Gigant' },
  skoldkrossare: { name: 'Sköldkrossare', hp: 2, text: '+4 på CL mot skjold, og skjoldet kan knuses.', src: 'Gigant' },
};

// --- Stridsmoral (Expert s. 61-62) ------------------------------------------------------------------
export const MORAL = { anka: 12, ankaVit: 7, manniska: 10, orch: 12, svartalf: 6, vatte: 6, troll: 18, ointelligent: 10, aggressiv: 15 };

// --- Aidne (Ereb Altor: Hjältar från Kopparhavet). Bare smak: folk i byen svarer etter bakgrunnen. --------
export const AIDNE = [
  { stand: 'Fredlös', ex: 'Stråtrøver, flyktning', place: 'En lysning dypt i skogen. Du kjenner en skogsalv.' },
  { stand: 'Lösdrivare', ex: 'Taskenspiller, gjøgler, tigger', place: 'Pålede veier langs fjellsidene. Du kjenner tiggerkongen.' },
  { stand: 'Livegen', ex: 'Træl, snekker, tjenestefolk', place: 'De store godsene der kornet strekker seg så langt øyet ser. Du kjenner en agitator.' },
  { stand: 'Torpare', ex: 'Jeger, dagarbeider', place: 'En vakker lysning i en av Aidnes grønne skoger. Du kjenner en røverhøvding.' },
  { stand: 'Kronobonde', ex: 'Gårdbruker, møller, nybygger', place: 'Den gamle gravhaugen bortenfor sommerbeitet. Du kjenner en haugbo.' },
  { stand: 'Storbonde', ex: 'Junker, bergmann, patron', place: 'Den gamle heksas svovelstinkende stue. Du kjenner en heksejeger.' },
  { stand: 'Borgare', ex: 'Svenn, kroeier, kartteiknar', place: 'Handelskaiene der laugshusene troner. Du kjenner en laugsmester.' },
  { stand: 'Prästerskap', ex: 'Solmunk, tempelprest, eremitt', place: 'Et soltempel i en hellig lund. Du kjenner en solånd.' },
  { stand: 'Lågadel', ex: 'Fanejunker, solridder, væpner', place: 'En ensom ridderborg på en klippe. Du kjenner en røverbaron.' },
  { stand: 'Högadel', ex: 'Markis, borggreve, stormester', place: 'De store bypalassene og hagene i hovedstaden. Du kjenner en rik markis.' },
];
export const APPEARANCE = ['Stygt arr på kinnet', 'Rart hodeplagg', 'Underlig blek', 'Smiler alltid', 'Iskaldt blikk', 'Litt lubben', 'Tynn og senete', 'Uvanlig hårete', 'Vikende hårfeste', 'Prangende tatovering', 'Kvalmende stank', 'Praktfullt hår', 'Halter', 'Skitten', 'Ærlige blå øyne', 'Sølvtann', 'For mye parfyme', 'Ulike øyenfarger', 'Hvesende stemme', 'Værbitt ansikt'];
