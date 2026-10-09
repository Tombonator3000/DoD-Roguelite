// Verdenskartet over Aidne og Drakdjupet: ren data uten three.js, så kartet kan sjekkes i node.
// Kilde for hvor ting ligger: kartet i «Ereb Altor: Kopparhavet» (Helmgast 2024, Toms Drive) og
// «Hjältar från Kopparhavet» (2025) s. 33-37. Tom valgte 2024-kartet og en sammenpresset målestokk
// (2026-10-08): én rute er omtrent én time på vei, ikke en dagsmarsj. Pharynx og Edelfara står ikke
// på 2024-kartet. De er satt inn ved bukta sør for Valon, slik de gamle bøkene (Ivanhoe, 1988) har dem
// midt i Zorakin ved kysten. Karad Batur ligger i Vorgabergen like ved Fristaden, Ereno sør for byen.
// x mot øst, y mot sør. Terrenget er tegnet om fra kartet, ikke kopiert: ett tegn per rute.

export const WW = 50, WH = 30;

// ~ hav, . slette og åker, F skog, ^ fjell og høyland, o innsjø
export const TERRAIN = [
  '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~..FFFFFF^~^^^........',
  '~~~~~~~~~~~~~~~~~~~~~~~~~~~.....FFFF^^^.^....^....',
  '~~^~~~~~~~~~~~.~~~~~~~~~~~~^...~~FFFF^^^^^^^.^.^..',
  '~~~~~~~~~~~~~..~.~~~~^...~~......F^^^^^^^^........',
  '~^^.~~~~~~~~~.FF..~~...FFF..FFFFF^^^^^^^^^^^^.^^..',
  '..^^^.~~~~~~~~FFF....FFFFFFF^FFFF^^^^^^^^^^^^^^^.^',
  '..^^^^~~~~~~~.FFFF..FFF^FFFFFFFF^^^^^^^^.^^^^^^~^^',
  '~~.^.^^^.^.^..FFFFF^FFFF^FFFFFF^^^.....^.^^^^^^^^^',
  '~~~~.^.^^......^FFFFFFFFF^FFFF^^^^.......^^^^^^^^^',
  '~~~~.~~........FFFFFFFFFF^^FF^^^^^^......F^^^^^^^.',
  '~~~~~.........^FFFFFFFFFF^^^^^^^^^..~~~FFFFFFF^^^F',
  'FF~~~~....^.^..F^FFFFFFF^^^^^^^^....~~FFFFFF^^FFFF',
  '~~~~~~.^...^^^^^.FFF^^^^^...^^^^...~~~~^.FF^^^^FFF',
  '~~~~~......^^.^^^^^^^^^^^...F^^^...~~~~...^^^^^^^^',
  '~^~~~...FF^^^^^^^oo^^.^^....^FF.....~~~..^^^^^^^^.',
  '.....FFF^^^^^^^^^FFF^^.....FF^^....^~~~~^^^^^^^^.~',
  '..FF^F^^^^.FF.FFFFFFF.......^^F..~~~~~~.^^^^^^^^^.',
  '..^.FF^FF.^....^FFFFF..~~~...FF.~~~~~~..^^^^^^^^^.',
  '..^...FFF.~..^.^^.....~~~~...FF.~~~~~~...^^^^^^...',
  '..~..~.F..~~~...^....~~~~~...F...~~~~~..^.^.^FF.F.',
  '..~~~~....~~~~..^.~~~~~~~~~......~~~~~.....^^F...~',
  '~~~~~~.....~~.....~~~~~~~~.......~~~~~.......^..~~',
  '~~~~~~....~~..^^...~~~~~~^.......^~~~~...........~',
  '~~~~~~....~..^....~~~~~~~~..~....~~~~~....^.......',
  '~~~~~~~~~~~..^^...~~~~~~~~~~~~~~~~~~~...^^.F......',
  '~~~~~.~~~~..^^^..~~~~~~~~~~~~~~~~~~~~...^^^FF.....',
  '~~~~~~~~~~..^....~~~~~~~~~~^~^^~~~~~.^^^^^^^^.....',
  '~~~~~~~~~~..^~...~~~~~~~~~~^^F~~~~~~.^^^^^^^^^^...',
  '~~~~~~~~~~~^~~~..~~~~~~~~~~~~~~~~~~~^..^..^^^^^^..',
  '..~~~~~~~~~.~..~~~~~~~~~~~~~~~~~~~...~~^.~.~..FFF^',
];

// Timer det tar å krysse en rute til fots. Vei gir alltid 1. Hemvist er koden i Bok II s. 24
// (2 öppen skog, 3 tät skog, 4 slätter, 5 berg och högland, 7 vattendrag, 12 kuster, 13 öppet hav).
// Timene er spillets egne, i samme forhold som dagsmarsjene i Bok II s. 5 (uv).
export const TERR = {
  '.': { name: 'slette', hours: 1.5, hemvist: 4, freq: 'uvanlig' },
  F: { name: 'skog', hours: 2.5, hemvist: 3, freq: 'vanlig', lost: true },
  '^': { name: 'fjell', hours: 3.5, hemvist: 5, freq: 'vanlig', lost: true },
  '~': { name: 'hav', hours: null, hemvist: 13 },
  o: { name: 'innsjø', hours: null, hemvist: 7 },
};

// Hyppighet per rute, som i Fallout 2 (WORLDMAP.TXT), men lavere fordi rutene her er små (uv).
export const FREQ = { ingen: 0, sjelden: 0.025, uvanlig: 0.05, vanlig: 0.085, hyppig: 0.14 };
export const FREQ_ORDER = ['ingen', 'sjelden', 'uvanlig', 'vanlig', 'hyppig'];

// Veier: lister med ruter som tegnes rett mellom. Kongeveien går fra Fristaden langs Drakdjupet
// til Tyndal og Galastan, så videre til Sarbon og Pendon. Stier er smalere, men går like fort.
export const ROADS = [
  { kind: 'vei', name: 'Kongeveien', pts: [[35, 7], [34, 9], [33, 11], [33, 13], [31, 14], [29, 14], [26, 14], [24, 15], [22, 15], [21, 14]] },
  { kind: 'vei', name: 'Kongeveien', pts: [[21, 14], [20, 15], [19, 16], [19, 17], [18, 18], [18, 19], [17, 20], [17, 21], [16, 23], [17, 24], [16, 25]] },
  { kind: 'vei', pts: [[19, 17], [20, 17], [21, 18]] },
  { kind: 'vei', pts: [[26, 14], [27, 16], [27, 17], [27, 19], [27, 20], [26, 21]] },
  { kind: 'sti', pts: [[26, 21], [29, 21], [32, 21]] },
  { kind: 'vei', pts: [[33, 13], [34, 13], [35, 14]] },
  { kind: 'vei', pts: [[35, 7], [36, 8], [37, 9]] },
  { kind: 'sti', pts: [[37, 9], [38, 9], [39, 10], [39, 11], [40, 12], [39, 13]] },
  { kind: 'vei', pts: [[39, 13], [40, 14], [40, 15], [39, 16], [39, 17], [39, 19], [40, 21]] },
  { kind: 'vei', pts: [[39, 19], [41, 19], [43, 19]] },
  { kind: 'sti', pts: [[35, 7], [35, 6], [36, 5], [36, 4]] },
  { kind: 'vei', pts: [[18, 19], [17, 18], [16, 17], [15, 17], [13, 17], [11, 16], [10, 16]] },
  { kind: 'vei', pts: [[10, 16], [9, 15], [8, 14], [7, 13]] },
  { kind: 'sti', pts: [[10, 16], [7, 16], [5, 17], [3, 17]] },
  { kind: 'sti', pts: [[21, 14], [21, 12], [21, 10], [21, 7]] },
  { kind: 'sti', pts: [[21, 7], [22, 5], [22, 3]] },
  { kind: 'sti', pts: [[10, 16], [11, 13], [12, 10], [12, 7]] },
];

// Elver, bare til tegningen
export const RIVERS = [
  [[30, 9], [30, 11], [31, 13], [32, 15], [33, 16]],
  [[18, 11], [19, 13], [20, 15.5], [21.5, 17.2]],
  [[25.5, 11], [25.5, 13], [24.8, 15], [23.6, 16.6]],
  [[13, 9], [12.5, 12], [11.5, 14.5], [10.6, 17.5], [10.6, 20.3]],
];

// Steder. size: stor, middels, liten. known: kjent fra start. hidden: vises først når du er i ruta.
// kind: fristaden (byen), edelfara (lokalkartet), pharynx (rapporten), by (landsby fra mal),
// port (bare tekst), sted (et område med noe i, fra mal).
export const PLACES = {
  fristaden: { name: 'Fristaden', sub: 'fristaden innerst i Drakdjupet', x: 35, y: 7, size: 'stor', kind: 'fristaden', known: true },
  karad_batur: {
    name: 'Karad Batur', sub: 'dvergeriket under Vorgabergen', x: 36, y: 4, size: 'stor', kind: 'port', known: true,
    text: 'Stien ender ved en port av svart stein, høyt oppe i Vorgabergen. Den er stengt. En dverg ser ned på deg fra en glugge. «Handel går gjennom Fristaden. Det har den alltid gjort.» Gluggen smeller igjen.',
  },
  ereno: { name: 'Ereno', sub: 'dvergenes handelsby', x: 37, y: 9, size: 'middels', kind: 'by', known: true, folk: 'dverg', tells: ['paloma', 'mehelt', 'vraket'] },
  ardesch: { name: 'Ardesch', sub: 'landsby under Vorgabergen', x: 33, y: 11, size: 'liten', kind: 'by', tells: ['mehelt', 'tyndal', 'gravhaugen'] },
  mehelt: { name: 'Mehelt', sub: 'fiskevær ved Drakdjupet', x: 35, y: 14, size: 'liten', kind: 'by', coast: true, tells: ['vraket', 'daston', 'indanum'] },
  paloma: { name: 'Paloma', sub: 'by i Yverne', x: 39, y: 13, size: 'middels', kind: 'by', tells: ['atrema', 'kandra'] },
  atrema: { name: 'Atrema', sub: 'havneby ved Drakdjupet', x: 39, y: 19, size: 'liten', kind: 'by', coast: true, tells: ['entika', 'kandra'] },
  kandra: { name: 'Kandra', sub: 'fri by med marked', x: 43, y: 19, size: 'middels', kind: 'by', tells: ['entika', 'paloma'] },
  entika: { name: 'Entika', sub: 'by på Tolan', x: 40, y: 21, size: 'liten', kind: 'by', tells: ['atrema'] },
  tyndal: { name: 'Tyndal', sub: 'landsby ved elva', x: 26, y: 14, size: 'liten', kind: 'by', tells: ['galastan', 'daston', 'svarta_tornet'] },
  daston: { name: 'Daston', sub: 'landsby i Indar', x: 27, y: 17, size: 'liten', kind: 'by', tells: ['indanum', 'bormont'] },
  indanum: { name: 'Indanum', sub: 'by på Indar', x: 26, y: 21, size: 'middels', kind: 'by', coast: true, tells: ['bormont', 'pendon'] },
  bormont: { name: 'Bormont', sub: 'fiskevær på Indar', x: 32, y: 21, size: 'liten', kind: 'by', coast: true, tells: ['mehelt'] },
  galastan: { name: 'Galastan', sub: 'landsby under Aidnebergen', x: 21, y: 14, size: 'liten', kind: 'by', tells: ['edelfara', 'sarbon', 'orchleiren', 'gravhaugen'] },
  edelfara: { name: 'Edelfara', sub: 'grevskapet ved Torilskogen', x: 19, y: 16, size: 'middels', kind: 'edelfara', known: true },
  pharynx: { name: 'Pharynx', sub: 'hertigens by', x: 21, y: 18, size: 'stor', kind: 'pharynx' },
  sarbon: { name: 'Sarbon', sub: 'hertugby i åsene', x: 18, y: 19, size: 'middels', kind: 'by', tells: ['pendon', 'tyronfold', 'edelbeck'] },
  edelbeck: { name: 'Edelbeck', sub: 'landsby ved Pendon', x: 17, y: 24, size: 'liten', kind: 'by', tells: ['pendon'] },
  pendon: { name: 'Pendon', sub: 'Zorakins hovedstad', x: 16, y: 25, size: 'stor', kind: 'by', big: true, tells: ['ekeborg', 'sarbon', 'indanum'] },
  tyronfold: { name: 'Tyronfold', sub: 'grenseby mot Kardunien', x: 13, y: 17, size: 'liten', kind: 'by', tells: ['ekeborg', 'svarta_tornet'] },
  ekeborg: { name: 'Ekeborg', sub: 'Karduniens hovedstad', x: 10, y: 16, size: 'stor', kind: 'by', big: true, tells: ['faltrax', 'derenham', 'thorgund'] },
  faltrax: { name: 'Faltrax', sub: 'havneby i Faltrakien', x: 7, y: 13, size: 'middels', kind: 'by', coast: true, tells: ['derenham'] },
  derenham: { name: 'Derenham', sub: 'landsby ved kysten', x: 3, y: 17, size: 'liten', kind: 'by', coast: true, tells: ['faltrax'] },
  thorgund: { name: 'Thorgund', sub: 'landsby på Gonderslätt', x: 12, y: 7, size: 'liten', kind: 'by', tells: ['lofhelm'] },
  lofhelm: { name: 'Lofhelm', sub: 'skogsby i Goiana', x: 21, y: 7, size: 'liten', kind: 'by', folk: 'alv', tells: ['hammersklint', 'thorgund'] },
  hammersklint: { name: 'Hammersklint', sub: 'kystby i nord', x: 22, y: 3, size: 'liten', kind: 'by', coast: true, tells: ['lofhelm'] },
  // steder du finner selv, eller hører om
  gravhaugen: { name: 'Gravhaugen', sub: 'en gammel gravhaug', x: 30, y: 12, size: 'liten', kind: 'sted', hidden: true, site: 'gravhaug' },
  orchleiren: { name: 'Orchleiren', sub: 'leir i Aidnebergen', x: 17, y: 12, size: 'liten', kind: 'sted', hidden: true, site: 'orchleir' },
  svarta_tornet: { name: 'Svarta Tornet', sub: 'det gamle tårnet i Aidnebergen', x: 13, y: 13, size: 'middels', kind: 'sted', hidden: true, site: 'tarn' },
  vraket: { name: 'Vraket', sub: 'en strandet kogg', x: 32, y: 16, size: 'liten', kind: 'sted', hidden: true, site: 'vrak', coast: true },
};

// Regioner for navn og møtetabeller. Den første som passer, gjelder.
export const REGIONS = [
  { id: 'torilskogen', name: 'Torilskogen', test: (x, y, t) => x >= 14 && x <= 21 && y >= 15 && y <= 18 && t !== '^', danger: 2 },
  { id: 'vorga', name: 'Vorgabergen', test: (x, y, t) => x >= 28 && x <= 40 && y <= 11 && (t === '^' || y <= 3), danger: 2 },
  { id: 'nida', name: 'Nidabergen', test: (x, y) => x > 40 && y <= 10, danger: 3 },
  { id: 'tolan', name: 'Yverne og Tolan', test: (x, y) => x >= 37 && y > 10, danger: 2 },
  { id: 'goiana', name: 'Goiana og Nordanskog', test: (x, y) => x >= 13 && x < 28 && y <= 10, danger: 2 },
  { id: 'kardunien', name: 'Kardunien', test: (x) => x <= 12, danger: 1 },
  { id: 'aidneberg', name: 'Aidnebergen', test: (x, y, t) => t === '^' && y <= 15, danger: 2 },
  { id: 'zorakin', name: 'Zorakin', test: () => true, danger: 1 },
];

// Møtetabeller. w: vekt, terr: terrenget det kan skje i, regions: hvor, night: bare om natta,
// road: bare på vei. Fiendtlige møter har mobs (type, antall), nøytrale har folk (mal i areatemplates.js).
// Faren og vanligheten bygger på Bok II og kildene for hver region (docs/verdenskart.md). Tallene er uv.
export const ENCOUNTERS = [
  { id: 'ulver', kind: 'fiende', w: 10, terr: 'F^', regions: ['torilskogen', 'vorga', 'nida', 'goiana', 'aidneberg', 'tolan', 'kardunien'], mobs: [['ulv', 2, 4]],
    see: 'Ulver. Du ser grå rygger mellom trærne, og de har sett deg.', fight: 'Ulvene sirkler inn.', night: 1.6 },
  { id: 'orcher', kind: 'fiende', w: 9, terr: 'F^.', regions: ['aidneberg', 'vorga', 'torilskogen', 'goiana', 'nida'], mobs: [['orc_band', 3, 5], ['orc_lead', 0, 1]],
    see: 'Orcher. En flokk med skjold og kroksabler ved et bål. De har ikke sett deg ennå.', fight: 'Orchene reiser seg fra bålet.', camp: true },
  { id: 'svartalfer', kind: 'fiende', w: 7, terr: 'F', regions: ['torilskogen'], mobs: [['svartalf', 2, 3], ['ulv', 1, 2]],
    see: 'Svartalfer. Tre skikkelser i svarte kapper glir mellom stammene, med ulver ved siden av seg.', fight: 'Svartalfene trekker sverdene.' },
  { id: 'vetter', kind: 'fiende', w: 8, terr: '^', regions: ['vorga', 'nida', 'aidneberg'], mobs: [['goblin', 3, 6]],
    see: 'Vetter. Små, grå skikkelser krabber nedover ura med spyd og sekker.', fight: 'Vettene hyler og kommer.' },
  { id: 'rovere', kind: 'fiende', w: 10, terr: '.F', regions: ['zorakin', 'kardunien', 'tolan'], mobs: [['rovare', 2, 4], ['rovare_bue', 1, 2]],
    see: 'Stråtrøvere. En gruppe menn venter ved en veltet kjerre og later som de reparerer den.', fight: '«Pengene eller livet. Helst begge.»', road: 1.5 },
  { id: 'gjengangere', kind: 'fiende', w: 4, terr: '.F^', regions: null, mobs: [['skeleton', 2, 4]], onlyNight: true,
    see: 'Gjengangere. Noen går mellom gravhaugene i månelyset, og de har ikke pustet på lenge.', fight: 'Skjelettene snur seg mot deg.' },
  // nøytrale
  { id: 'karavane', kind: 'folk', w: 8, terr: '.F^', regions: null, roadOnly: true, folk: 'karavane',
    see: 'En karavane. Tre vogner, en kjøpmann med bred hatt og to vakter med spyd. De hilser.', fight: 'Kjøpmannen løfter hatten. «Handel?»' },
  { id: 'pilegrimer', kind: 'folk', w: 6, terr: '.F', regions: ['zorakin', 'tolan', 'kardunien'], folk: 'pilegrimer',
    see: 'Pilegrimer i gule kapper med solskiver på staven. De synger om Utu.', fight: 'En av pilegrimene vinker deg nærmere.' },
  { id: 'tornvaktare', kind: 'folk', w: 5, terr: '^F', regions: ['aidneberg', 'vorga', 'torilskogen'], folk: 'tornvaktare',
    see: 'Tornväktare. En ridder i hvit våpenkjole med tornekrans og to væpnere, på vei opp mot passet.', fight: 'Ridderen holder hånda opp. «Stans. Hvem er du?»' },
  { id: 'dverger', kind: 'folk', w: 6, terr: '^.', regions: ['vorga'], folk: 'dverger',
    see: 'Dverger fra Karad Batur. To av dem bærer en kiste på stenger, den tredje teller skritt.', fight: 'Den eldste dvergen nikker. «Fristaden?»' },
  { id: 'bonde', kind: 'folk', w: 7, terr: '.', regions: ['zorakin', 'kardunien', 'tolan'], folk: 'bonde',
    see: 'En bonde med en kjerre full av kål, og et esel som ikke vil.', fight: 'Bonden ser opp. «Kål?»' },
  { id: 'jeger', kind: 'folk', w: 5, terr: 'F^', regions: null, folk: 'jeger',
    see: 'En jeger med bue og tre harer på stanga. Han har sett deg lenge.', fight: 'Jegeren senker buen. «Du går for høyt.»' },
  // spesielle møter: sjeldne, én gang per løp
  { id: 'kvakkmunk', kind: 'spesiell', w: 1.2, terr: '.F^', regions: null, folk: 'kvakkmunk', once: true,
    see: 'Midt i veien sitter en gammel and i munkekappe med føttene i kors. Han har sittet der lenge. Det er gress på hatten.', fight: 'Anda åpner ett øye.' },
];
