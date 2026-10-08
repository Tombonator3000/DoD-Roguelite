// Kartene over Edelfara: sju områder fra «Triangeldrama i Edelfara» (Ivanhoe-modulen til DoD).
// Kilde: kartene i modulen (Sortmund s. 14, Akershus og Glimmings borg s. 13, Edelfara s. 15),
// tegnet om til rutenett på 46 x 46 fliser à 2 m. Byggene er færre enn på kartene, men på samme steder.
// Ren data uten three.js. x mot øst, y mot sør.
import { WALL, FLOOR, GR } from './townmap.js';
import { K_ROCK } from './areagrid.js';

const PI = Math.PI;

// Elva i Akershus slynger seg litt. Øverste rad elva ligger på, for en x.
export const akRiverY = x => 29 + Math.round(Math.sin(x / 7));

export const AREAS = {
  // --- Ekeskogen: der veien deler seg i Torilskogen, og der kureren ligger død -----------------
  ekeskogen: {
    id: 'ekeskogen', name: 'Ekeskogen', sub: 'Torilskogen, grevskapet Edelfara', seed: 11, peaceful: false, spruce: 0.45, lootDepth: 2, music: 'explore',
    defaultArrival: 'west',
    arrivals: {
      west: { x: 1.6, y: 22.5, yaw: PI / 2 }, east: { x: 44.4, y: 18.5, yaw: -PI / 2 }, south: { x: 22.6, y: 44.3, yaw: PI },
    },
    exits: [
      { x: 0.5, y: 22.5, to: 'fristaden', label: 'Landeveien ut av Torilskogen' },
      { x: 45.5, y: 18.5, to: 'sortmund', label: 'Veien østover mot Sortmund' },
      { x: 22.6, y: 45.5, to: 'akershus', label: 'Stien sørover mot Akershus' },
    ],
    paint(k) {
      k.road([[-1, 22.5], [9, 22.5], [16, 20.5], [24, 19.5], [33, 18.5], [47, 18.5]], 2.2);
      k.road([[24, 19.5], [25, 25], [24, 32], [22.6, 40], [22.6, 47]], 2);
      k.glade(21, 18.2, 6.5, 4.4, GR.GRASS, 3);
      // stien til den nedbrente koia i nordøst
      k.road([[31, 18.5], [33, 14], [34, 11]], 1.3, GR.GRASS);
      k.glade(34.5, 9.5, 3.8, 3.1, GR.GRASS, 4);
      // dyretråkk med papirbiter, inn til orchenes glenne
      k.road([[24.4, 30], [28, 31.5], [31, 33.5], [34, 35]], 1.3, GR.GRASS);
      k.glade(36.5, 36, 4.4, 3.5, GR.GRASS, 5);
      k.glade(8, 24.6, 2.5, 1.8, GR.GRASS, 6);
      k.glade(40, 16.4, 2.6, 1.8, GR.GRASS, 7);
    },
    props: [
      { t: 'post', x: 25.9, y: 17.2, text: 'SORTMUND', sub: 'Akershus i sør', rot: 0 },
      { t: 'ruin', x: 34.6, y: 9.4, w: 2.4, d: 1.8 },
      { t: 'woodpile', x: 31.6, y: 8.2 },
      { t: 'stump', x: 33.0, y: 12.2 }, { t: 'stump', x: 37.4, y: 8.0 }, { t: 'stump', x: 36.2, y: 11.6 },
      { t: 'fire', x: 27.6, y: 21.3, lit: true, size: 0.4 },
      { t: 'stump', x: 26.6, y: 21.9 },
      { t: 'rock', x: 15.6, y: 16.8, s: 0.7 }, { t: 'rock', x: 39.0, y: 38.6, s: 0.9 }, { t: 'rock', x: 34.2, y: 33.6, s: 0.6 },
      { t: 'bones', x: 38.2, y: 36.4 },
    ],
    trees: [[18.0, 15.4], [24.6, 15.2, 's'], [17.0, 21.6]],
    spots: {
      jorne_rest: { x: 26.65, y: 21.85, yaw: 0.9, sit: true },
      jorne_sleep: { x: 28.3, y: 22.2, yaw: 0, sleep: true, lie: 'x' },
      jorne_road: { x: 22.0, y: 21.0, yaw: PI / 2, wander: 1.5 },
    },
  },

  // --- Sortmund: markis Ridderskors' landsby mellom borgkullen og kvarnkullen, ved sjøen Kärkel ---------
  sortmund: {
    id: 'sortmund', name: 'Sortmund', sub: 'Ridderskors baroni', seed: 12, peaceful: true, spruce: 0.25, music: 'town', open: true,
    peaceText: 'Vaktkapteinen i Sortmund har øynene på deg. Du lar våpenet være i landsbyen.',
    flow: [0.01, 0.0],
    defaultArrival: 'west',
    arrivals: {
      west: { x: 1.6, y: 17.6, yaw: PI / 2 }, east: { x: 44.2, y: 23.4, yaw: -2.3 }, castle: { x: 26.5, y: 13.4, yaw: 0 },
    },
    exits: [
      { x: 0.5, y: 17.6, to: 'ekeskogen', label: 'Veien vestover mot Ekeskogen og Akershus' },
      { x: 45.5, y: 23.8, to: 'glimming', label: 'Veien østover mot Glimming' },
      { x: 26.5, y: 12.0, area: 'ridderskors', arrival: 'gate', label: 'Gå opp borgveien til markisen', need: 'castle_sm' },
    ],
    paint(k) {
      k.open(0, 0, 45, 45, GR.GRASS);
      // sjøen Kärkel i nord
      k.deep(0, 0, 45, 3);
      k.water(0, 4, 16, 4);
      k.water(33, 4, 45, 4);
      // skogsdunger på flatlandet
      k.grove(2.5, 31, 3.5, 5, 21);
      k.grove(16, 42.5, 6, 3.5, 22);
      k.grove(42, 32, 4.5, 4.5, 23);
      k.grove(42.5, 8.0, 3.2, 2.4, 24);
      k.grove(6, 41, 4, 3.5, 25);
      // hovedgata øst-vest, og så mot Glimming
      k.road([[-1, 17.6], [40, 17.6], [47, 24.2]], 2.2);
      k.rect(14, 16, 30, 19, FLOOR, GR.COBBLE);
      k.road([[26.5, 11], [26.5, 17]], 1.6);
      k.road([[14, 17], [10, 12.6], [6, 11.3]], 1.6);
      k.road([[24.5, 18], [24.5, 27], [30, 33], [32.5, 37.4]], 1.6);
      k.hill(26.5, 6, 5.5, { h: 7, castle: 'ridderskors', banner: 'ridderskors', path: PI / 2 });
      k.hill(39.5, 40, 4.2, { h: 3.6, mill: true, top: 0.62 });
      k.field(34, 21, 40, 29, 'rug');
      k.field(13, 29, 22, 35, 'korn');
      k.field(26, 36, 29, 42, 'kal');
      k.field(3, 37, 10, 39, 'korn');
      // brygger ut i sjøen
      k.bridge(40, 2, 40, 4, 3);
      k.bridge(1, 2, 1, 4, 3);
    },
    buildings: [
      { id: 'sm_kapell', name: 'Kapellet', sub: 'kapell', x0: 2, y0: 5, x1: 7, y1: 10, doors: [[4, 10]], floor: GR.FLAG, style: 'stone', wallH: 4.2, roof: 'slate', shutter: null },
      { id: 'sm_fisk', name: 'Fiskerens stue', sub: 'fisker', x0: 9, y0: 6, x1: 12, y1: 9, doors: [[10, 9]], floor: GR.WOOD, style: 'timber', wallH: 2.6, roof: 'thatch', plaster: 0xd2c6a6, chimney: [9.8, 6.8], shutter: [0.3, 0.42, 0.5] },
      { id: 'sm_tupp', name: 'Galande Tuppen', sub: 'värdshus', x0: 14, y0: 10, x1: 21, y1: 16, doors: [[17, 16]], floor: GR.WOOD, style: 'timber', wallH: 4.4, roof: 'tile', plaster: 0xe6d6b2, chimney: [15.0, 13.2], shutter: [0.56, 0.24, 0.14] },
      { id: 'sm_vakt', name: 'Vaktkaptenens hus', sub: 'vaktkaptein', x0: 29, y0: 12, x1: 33, y1: 16, doors: [[31, 16]], floor: GR.WOOD, style: 'timber', wallH: 3.0, roof: 'shingle', plaster: 0xd8ccb0, chimney: [32.6, 12.8], shutter: [0.62, 0.14, 0.12] },
      { id: 'sm_bagare', name: 'Bakeriet', sub: 'baker', x0: 35, y0: 11, x1: 39, y1: 15, doors: [[37, 15]], floor: GR.WOOD, style: 'timber', wallH: 2.8, roof: 'tile', plaster: 0xe0d0aa, chimney: [38.4, 12.0], shutter: [0.5, 0.36, 0.2] },
      { id: 'sm_vagn', name: 'Vagnmakarens hus', sub: 'vognmaker', x0: 2, y0: 19, x1: 7, y1: 23, doors: [[4, 19]], floor: GR.WOOD, style: 'timber', wallH: 2.9, roof: 'shingle', plaster: 0xd4c8a8, chimney: [6.4, 22.4], shutter: [0.3, 0.38, 0.26] },
      { id: 'sm_bonde', name: 'Gudmars gård', sub: 'bonde', x0: 9, y0: 20, x1: 13, y1: 24, doors: [[11, 20]], floor: GR.WOOD, style: 'timber', wallH: 2.7, roof: 'thatch', plaster: 0xcfc2a2, chimney: [9.9, 22.6], shutter: [0.36, 0.42, 0.24] },
      { id: 'sm_bild', name: 'Bildhuggaren', sub: 'taverna', x0: 17, y0: 20, x1: 22, y1: 25, doors: [[19, 20]], floor: GR.WOOD, style: 'timber', wallH: 3.0, roof: 'thatch', plaster: 0xd8c8a4, chimney: [21.8, 24.6], shutter: [0.42, 0.24, 0.16] },
      { id: 'sm_smed', name: 'Smia', sub: 'smed og hovslager', x0: 26, y0: 20, x1: 31, y1: 24, doors: [[28, 20]], floor: GR.DIRT, style: 'stone', wallH: 3.0, roof: 'slate', chimney: [30.3, 23.3], shutter: null },
      { id: 'sm_mjol', name: 'Mjølnerens hus', sub: 'markisens mjølner', x0: 29, y0: 38, x1: 33, y1: 42, doors: [[32, 38]], floor: GR.WOOD, style: 'timber', wallH: 2.7, roof: 'thatch', plaster: 0xd6caa8, chimney: [29.9, 41.3], shutter: [0.4, 0.3, 0.2] },
    ],
    fences: [[[9, 26], [14, 26]], [[9, 26], [9, 29]], [[14, 26], [14, 29]], [[9, 29], [14, 29]], [[2, 24], [7, 24]], [[2, 24], [2, 27]], [[7, 24], [7, 27]], [[2, 27], [7, 27]]],
    gaps: [[11, 26], [4, 24]],
    signs: [['sm_tupp', 'GALANDE TUPPEN', 'värdshus'], ['sm_bild', 'BILDHUGGAREN', 'taverna'], ['sm_smed', 'SMED', 'hovslager'], ['sm_bagare', 'BAGARE', '']],
    lamps: [[13.6, 16.2], [22.4, 15.6], [25.4, 16.2], [33.8, 16.4], [8.6, 16.2], [24.0, 19.8], [6.4, 11.0]],
    lights: [{ x: 4.6, y: 8.0, h: 1.0, col: 0xffc878, k: 0.7, inside: 'sm_kapell', candles: [[4.15, 7.0], [5.05, 7.0], [4.15, 9.1], [5.05, 9.1]] }],
    props: [
      { t: 'well', x: 12.2, y: 18.9 },
      { t: 'poster', x: 6.5, y: 18.88, face: PI, h: 1.6 },
      { t: 'poster', x: 21.05, y: 15.12, face: PI * 0, h: 1.6 },
      { t: 'poster', x: 29.05, y: 15.6, face: -PI / 2, h: 1.6 },
      { t: 'cart', x: 8.4, y: 21.6, rot: 0.3 }, { t: 'cart', x: 3.2, y: 25.4, rot: 1.4 },
      { t: 'barrel', x: 13.2, y: 14.0 }, { t: 'barrel', x: 13.3, y: 14.8 }, { t: 'crate', x: 22.6, y: 14.6 },
      { t: 'hay', x: 11.6, y: 27.6 }, { t: 'hay', x: 9.4, y: 28.0 },
      { t: 'woodpile', x: 31.6, y: 25.4 },
      { t: 'boat', x: 4.0, y: 4.4, rot: 1.4 }, { t: 'boat', x: 41.6, y: 4.3, rot: -0.3 }, { t: 'net', x: 8.0, y: 4.9 },
      { t: 'post', x: 41.2, y: 19.6, text: 'GLIMMING', sub: 'fem timer', rot: 0.6 },
      { t: 'post', x: 1.6, y: 15.8, text: 'AKERSHUS', sub: 'gjennom Torilskogen', rot: 0 },
      { t: 'banner', x: 25.4, y: 12.6, kind: 'ridderskors', h: 4.2 },
    ],
    trees: [[13.2, 20.6], [24.0, 9.4], [33.6, 33.0], [9.0, 14.2, 's'], [38.0, 17.0]],
    furnish({ W, table, bench, bed, shelf, hearth, F, U }, A) {
      // Galande Tuppen
      W(15.2, 11.55, 18.6, 11.9, 0, 1.05, [0.5, 0.34, 0.22]);
      W(15.15, 11.5, 18.65, 11.95, 1.05, 1.12, [0.42, 0.28, 0.18], false);
      shelf(15.0, 10.62, 18.6, 10.85, 2.0, true);
      hearth(14.62, 12.6, 15.05, 13.8, 15.25, 13.2);
      table(18.0, 13.8, 1.1, 0.55); bench(18.0, 13.18, 1.1, 0.2); bench(18.0, 14.42, 1.1, 0.2);
      table(20.0, 12.2, 0.9, 0.5); bench(20.0, 11.65, 0.9, 0.2); bench(20.0, 12.75, 0.9, 0.2);
      for (const x of [19.2, 19.8]) A.barrel(U(x), U(15.7), 0.8);
      F.cloth.box(U(16.2), 0.01, U(13.4), U(17.4), 0.025, U(15.2), { uv: 'world', col: [0.52, 0.2, 0.14] });
      // vaktkapteinen
      bed(29.65, 12.65, 30.45, 14.15, [0.5, 0.18, 0.16]);
      table(32.2, 13.6, 0.8, 0.5);
      A.weaponRack(U(33.25), U(15.0), 'z');
      // kapellet: alter og båren med Kettil
      F.stone.box(U(4.0), 0, U(5.65), U(5.2), 1.0, U(6.05), { vs: 2, us: 2, col: [0.95, 0.92, 0.84] });
      F.cloth.box(U(3.95), 1.0, U(5.6), U(5.25), 1.04, U(6.1), { uv: 'world', col: [0.85, 0.82, 0.74] });
      A.addBlock(U(4.0), U(5.65), U(5.2), U(6.05));
      W(4.25, 7.2, 4.95, 8.9, 0, 0.42, [0.42, 0.3, 0.2]);
      F.cloth.box(U(4.2), 0.42, U(7.15), U(5.0), 0.46, U(8.95), { uv: 'world', col: [0.92, 0.9, 0.84] });
      for (const z of [9.6, 10.1]) bench(6.2, z, 1.0, 0.2);
      A.addBlock(U(5.7), U(9.45), U(6.7), U(10.25));
      bed(6.45, 5.65, 7.25, 7.0, [0.36, 0.3, 0.26]);
      // fiskeren
      hearth(9.62, 6.62, 10.0, 7.05, 9.8, 7.25);
      bed(11.2, 6.65, 12.0, 8.2, [0.32, 0.4, 0.5]);
      // bakeriet
      F.stone.box(U(37.8), 0, U(11.62), U(38.9), 1.3, U(12.6), { vs: 2, us: 2, col: [0.82, 0.7, 0.6] });
      A.addBlock(U(37.8), U(11.62), U(38.9), U(12.6), false);
      A.hearths.push({ x: U(38.35), z: U(12.65) });
      table(36.2, 13.0, 1.2, 0.55);
      shelf(35.62, 11.6, 35.86, 13.6, 1.8, true);
      // vognmakeren
      hearth(5.9, 22.62, 6.9, 23.05, 6.4, 22.25);
      bed(2.65, 21.4, 3.45, 22.9, [0.4, 0.4, 0.3]);
      table(4.8, 21.0, 1.0, 0.55);
      // Gudmars gård
      hearth(9.62, 22.0, 10.05, 23.2, 10.25, 22.6);
      bed(12.2, 22.65, 13.0, 24.1, [0.5, 0.36, 0.22]);
      bed(10.8, 23.7, 11.9, 24.3, [0.6, 0.5, 0.3]);
      table(11.4, 21.4, 0.8, 0.5);
      // Bildhuggaren
      W(18.05, 21.2, 18.4, 24.2, 0, 1.05, [0.48, 0.34, 0.22]);
      table(20.4, 22.2, 1.0, 0.55); bench(20.4, 21.6, 1.0, 0.2); bench(20.4, 22.8, 1.0, 0.2);
      table(20.6, 24.3, 1.0, 0.55); bench(20.6, 23.7, 1.0, 0.2); bench(20.6, 24.9, 1.0, 0.2);
      A.barrel(U(17.9), U(24.9), 0.8);
      // smia
      F.stone.box(U(29.6), 0, U(22.6), U(31.0), 0.9, U(24.0), { vs: 2, us: 2, col: [0.7, 0.66, 0.62] });
      A.addBlock(U(29.6), U(22.6), U(31.0), U(24.0), false);
      A.coalAt = { x: U(30.3), z: U(23.3) };
      A.hearths.push({ x: U(30.3), z: U(23.3), forge: true });
      A.anvil(U(28.4), U(22.9));
      bed(26.65, 22.6, 27.45, 24.1, [0.42, 0.36, 0.3]);
      A.weaponRack(U(26.75), U(21.4), 'z');
      // mjølneren
      hearth(29.62, 40.8, 30.05, 41.9, 30.25, 41.3);
      bed(32.0, 40.6, 32.8, 42.1, [0.6, 0.5, 0.34]);
      for (const [x, z] of [[30.4, 39.0], [30.9, 39.1], [30.4, 39.6]]) A.sack(U(x), U(z), false);
    },
    spots: {
      tupp_bar: { x: 16.8, y: 11.15, yaw: 0 },
      tupp_t1: { x: 18.0, y: 13.16, yaw: 0, sit: true },
      tupp_t2: { x: 18.0, y: 14.44, yaw: PI, sit: true },
      tupp_t3: { x: 20.0, y: 11.63, yaw: 0, sit: true },
      tupp_t4: { x: 20.0, y: 12.77, yaw: PI, sit: true },
      tupp_corner: { x: 20.7, y: 15.5, yaw: -2.4 },
      tupp_up: { x: 15.6, y: 15.6, yaw: 0, upstairs: true },
      tupp_door: { x: 17.5, y: 17.6, yaw: 0, wander: 1.5 },
      vakt_in: { x: 31.6, y: 14.4, yaw: PI / 2 },
      vakt_bed: { x: 30.05, y: 13.9, yaw: 0, sleep: true, lie: 'z' },
      street_w: { x: 9.0, y: 17.8 }, street_c: { x: 20.0, y: 18.4 }, street_e: { x: 36.0, y: 17.8 }, street_s: { x: 24.5, y: 24.0 },
      kapell_chap: { x: 3.4, y: 8.6, yaw: PI / 2 },
      kapell_bed: { x: 6.85, y: 6.75, yaw: 0, sleep: true, lie: 'z' },
      kapell_door: { x: 4.5, y: 11.4, yaw: 0, wander: 1.2 },
      bonde_in: { x: 11.2, y: 22.0, yaw: PI / 2 },
      bonde_bed: { x: 12.6, y: 23.8, yaw: 0, sleep: true, lie: 'z' },
      bonde_garden: { x: 11.5, y: 27.5, yaw: 0, wander: 1.2, work: 'dig' },
      bild_bar: { x: 17.8, y: 22.6, yaw: PI / 2 },
      bild_t1: { x: 20.4, y: 21.58, yaw: 0, sit: true },
      bild_t2: { x: 20.6, y: 24.92, yaw: PI, sit: true },
      bild_up: { x: 21.7, y: 21.0, yaw: 0, upstairs: true },
      smed_forge: { x: 28.4, y: 22.25, yaw: 0, work: 'hammer' },
      smed_bed: { x: 27.05, y: 23.8, yaw: 0, sleep: true, lie: 'z' },
      smed_door: { x: 28.5, y: 19.3, yaw: 0, wander: 1 },
      bake_in: { x: 36.6, y: 12.0, yaw: 0, work: 'dig' },
      bake_out: { x: 37.0, y: 16.3, yaw: 0, wander: 1.2 },
      bake_up: { x: 35.9, y: 14.6, upstairs: true },
      fisk_pier: { x: 1.5, y: 2.6, yaw: PI },
      fisk_in: { x: 10.8, y: 8.6, yaw: PI },
      fisk_bed: { x: 11.6, y: 7.9, yaw: 0, sleep: true, lie: 'z' },
    },
  },

  // --- Ridderskors: markisens borg på borgkullen ------------------------------------------------------
  ridderskors: {
    id: 'ridderskors', name: 'Ridderskors', sub: 'markisens borg over Sortmund', seed: 13, peaceful: true, spruce: 0.3, music: 'town',
    peaceText: 'Markisens vakter står ved porten. Her trekker ingen våpen.',
    plateau: { drop: 7, lake: [-30, -30, 76, -1] },
    defaultArrival: 'gate',
    arrivals: { gate: { x: 23.5, y: 35.0, yaw: PI } },
    exits: [{ x: 23.5, y: 36.0, area: 'sortmund', arrival: 'castle', label: 'Gå ned borgveien til Sortmund' }],
    ring: { x0: 9, y0: 7, x1: 37, y1: 37 },
    gate: { x0: 22, x1: 24, y: 37 },
    towers: [[8, 6, 10, 8], [36, 6, 38, 8], [8, 36, 10, 38], [36, 36, 38, 38], [20, 36, 21, 38], [25, 36, 26, 38]],
    paint(k) {
      k.open(0, 0, 45, 45, GR.GRASS);
      for (let i = 0; i < 46; i++) { k.rock(i, 0); k.rock(i, 45); k.rock(0, i); k.rock(45, i); }
      for (const [x, y] of [[1, 1], [2, 1], [1, 2], [44, 3], [43, 1], [3, 44], [42, 43], [44, 41], [1, 30], [1, 31], [44, 18], [27, 44], [28, 44]]) k.rock(x, y);
      k.rect(10, 8, 36, 36, FLOOR, GR.COBBLE);
      k.road([[23.5, 38], [23.5, 46]], 2.4);
      k.rect(10, 31, 36, 36, FLOOR, GR.DIRT);
    },
    buildings: [
      { id: 'rk_hall', name: 'Riddersalen', sub: 'markisens sal', x0: 11, y0: 9, x1: 23, y1: 18, doors: [[17, 18]], floor: GR.WOOD, style: 'stone', wallH: 5.0, roof: 'slate', chimney: [12.0, 13.5], shutter: [0.62, 0.12, 0.1] },
      { id: 'rk_study', name: 'Markisens arbetsrum', sub: 'arbetsrum', x0: 25, y0: 9, x1: 33, y1: 16, doors: [[28, 16]], floor: GR.WOOD, style: 'stone', wallH: 4.4, roof: 'slate', chimney: [32.5, 10.2], shutter: [0.62, 0.12, 0.1] },
      { id: 'rk_kok', name: 'Kjøkkenet', sub: 'kjøkken', x0: 11, y0: 21, x1: 17, y1: 26, doors: [[17, 23]], floor: GR.FLAG, style: 'timber', wallH: 3.0, roof: 'tile', plaster: 0xe2d4b6, chimney: [12.0, 22.0], shutter: [0.5, 0.2, 0.16] },
      { id: 'rk_stall', name: 'Stallen', sub: 'stall', x0: 28, y0: 22, x1: 35, y1: 28, doors: [[28, 25]], floor: GR.DIRT, style: 'timber', wallH: 3.2, roof: 'thatch', plaster: 0xd2c2a0, shutter: [0.4, 0.3, 0.2] },
    ],
    signs: [],
    lamps: [[20.0, 19.4], [26.6, 17.4], [23.5, 30.2], [19.4, 34.6], [27.6, 34.6]],
    props: [
      { t: 'well', x: 22.5, y: 24.5 },
      { t: 'banner', x: 21.4, y: 34.6, kind: 'ridderskors', h: 4.6 }, { t: 'banner', x: 25.6, y: 34.6, kind: 'ridderskors', h: 4.6 },
      { t: 'cart', x: 26.0, y: 30.6, rot: 1.6 }, { t: 'hay', x: 34.0, y: 30.4 }, { t: 'crate', x: 18.8, y: 22.4 }, { t: 'barrel', x: 18.8, y: 23.3 },
      { t: 'horse', x: 33.4, y: 30.8, rot: PI, col: 0x7a5232 },
    ],
    trees: [[13.0, 33.5], [33.0, 19.8, 's']],
    furnish({ W, table, bench, bed, shelf, hearth, F, U }, A) {
      // riddersalen: langbord og høysete
      table(17.0, 13.2, 6.0, 1.0);
      bench(17.0, 12.3, 5.8, 0.25); bench(17.0, 14.1, 5.8, 0.25);
      W(20.6, 12.7, 21.4, 13.7, 0, 1.4, [0.42, 0.26, 0.16]);
      hearth(11.62, 12.6, 12.05, 14.4, 12.25, 13.5);
      F.cloth.box(U(14.5), 0.01, U(15.2), U(19.5), 0.025, U(17.2), { uv: 'world', col: [0.55, 0.12, 0.1] });
      shelf(22.4, 9.62, 22.9, 9.85, 2.2, true);
      // arbetsrummet: skrivebordet, kisten, hyllene
      table(29.0, 11.6, 1.6, 0.8);
      W(28.6, 10.55, 29.4, 10.9, 0, 0.5, [0.44, 0.3, 0.2]);
      shelf(25.62, 9.7, 25.86, 12.6, 2.3, true);
      shelf(30.6, 9.62, 32.4, 9.86, 2.0, true);
      hearth(32.0, 9.62, 33.0, 10.05, 32.5, 10.25);
      bed(31.6, 13.2, 32.6, 15.2, [0.62, 0.14, 0.12]);
      F.cloth.box(U(27.0), 0.01, U(12.6), U(30.6), 0.025, U(15.0), { uv: 'world', col: [0.3, 0.2, 0.42] });
      // kjøkkenet
      hearth(11.62, 21.6, 12.05, 23.0, 12.25, 22.3);
      table(14.4, 23.6, 1.6, 0.7);
      shelf(13.0, 25.62, 16.4, 25.86, 1.8, true);
      // stallen
      for (const z of [23.4, 25.2, 26.8]) W(33.0, z - 0.1, 34.9, z + 0.1, 0, 1.2, [0.42, 0.3, 0.2]);
      for (const [x, z] of [[29.4, 27.3], [30.0, 27.4]]) A.sack(U(x), U(z), false);
    },
    spots: {
      markis_study: { x: 29.0, y: 10.75, yaw: 0, sit: true },
      markis_walk: { x: 28.6, y: 13.6, yaw: 0, wander: 1.2 },
      markis_hall: { x: 21.0, y: 13.2, yaw: -PI / 2 },
      markis_bed: { x: 32.1, y: 14.8, yaw: 0, sleep: true, lie: 'z' },
      gate_l: { x: 21.2, y: 35.2, yaw: PI },
      gate_r: { x: 25.8, y: 35.2, yaw: PI },
      guard_study: { x: 27.0, y: 17.4, yaw: 0 },
      kok_in: { x: 14.4, y: 22.8, yaw: PI, work: 'dig' },
      kok_bed: { x: 13.5, y: 25.3, upstairs: true },
      court: { x: 22.0, y: 27.6, wander: 3 },
      stall_in: { x: 31.0, y: 24.6, wander: 1.2 },
    },
  },

  // --- Akershus: baron Ekes borg på kullen, grevens leir, kvarnen og värdshuset Ekehus -----------------
  akershus: {
    id: 'akershus', name: 'Akershus', sub: 'Eke baroni', seed: 14, peaceful: true, spruce: 0.4, music: 'explore',
    peaceText: 'Grevens soldater er overalt i glenna. Trekker du våpen her, er du død før du rekker å angre.',
    flow: [-0.32, 0.0],
    defaultArrival: 'east',
    arrivals: {
      east: { x: 44.4, y: 31.6, yaw: -PI / 2 }, castle: { x: 15.8, y: 16.0, yaw: 0.9 }, south: { x: 24.3, y: 44.2, yaw: PI },
    },
    exits: [
      { x: 45.5, y: 31.6, to: 'ekeskogen', label: 'Veien østover gjennom skogen' },
      { x: 14.7, y: 14.7, area: 'akershus_borg', arrival: 'gate', label: 'Gå opp til baron Ekes borg', need: 'castle_ak' },
      { x: 24.3, y: 45.5, to: 'lagret', label: 'Stien sørover gjennom skogen', need: 'trail' },
    ],
    paint(k, st) {
      k.glade(23, 21, 22, 19.5, GR.GRASS, 7);
      k.glade(30, 38, 13, 6, GR.GRASS, 8);
      for (let x = 0; x < 46; x++) { const y = akRiverY(x); k.deep(x, y, x, y + 1); }
      k.bridge(30, akRiverY(30), 31, akRiverY(31) + 1, 2);
      // kvarndammen øst for kvarnen
      for (let y = 18; y <= 26; y++) for (let x = 40; x <= 45; x++) if (Math.hypot(x + 0.5 - 44, y + 0.5 - 22) < 4.2) k.deepAt(x, y);
      k.hill(9, 9, 6.5, { h: 8, castle: 'akershus', banner: 'eke', path: PI / 4 });
      k.road([[15, 15], [20, 19], [27, 24], [30.5, 27.4]], 1.8);
      k.road([[30.5, 30.7], [30.5, 33.6]], 1.8);
      k.road([[30.5, 31.6], [38, 31.6], [47, 31.6]], 2);
      k.road([[30.5, 27.0], [35.5, 24.0]], 1.4);
      k.field(21, 8, 28, 14, 'rug');
      k.field(30, 8, 37, 16, 'korn');
      k.field(34, 37, 41, 42, 'kal');
      k.field(10, 33, 16, 39, 'korn');
      if (st.trail) k.road([[26, 39], [24.3, 43], [24.3, 47]], 1.4, GR.GRASS);
      if (st.trail) k.glade(25.5, 40.5, 2.4, 1.6, GR.GRASS, 9);
    },
    buildings: [
      { id: 'ak_kvarn', name: 'Kvarnen', sub: 'vannmølle', x0: 33, y0: 22, x1: 38, y1: 27, doors: [[35, 22]], floor: GR.WOOD, style: 'timber', wallH: 5.0, roof: 'shingle', plaster: 0xd0c09c, shutter: [0.4, 0.3, 0.2] },
      { id: 'ak_ekehus', name: 'Ekehus gästgiveri', sub: 'värdshus', x0: 26, y0: 34, x1: 33, y1: 39, doors: [[30, 34]], floor: GR.WOOD, style: 'timber', wallH: 3.8, roof: 'thatch', plaster: 0xb8b0a0, chimney: [27.2, 36.5], shutter: [0.3, 0.4, 0.3] },
      { id: 'ak_gard1', name: 'Bondegården ved dammen', sub: 'gård', x0: 38, y0: 12, x1: 42, y1: 16, doors: [[40, 16]], floor: GR.WOOD, style: 'timber', wallH: 2.7, roof: 'thatch', plaster: 0xcfc2a2, chimney: [41.3, 12.9], shutter: [0.32, 0.4, 0.26] },
      { id: 'ak_gard2', name: 'Torgils gård', sub: 'gård', x0: 18, y0: 34, x1: 22, y1: 38, doors: [[22, 36]], floor: GR.WOOD, style: 'timber', wallH: 2.7, roof: 'thatch', plaster: 0xc8bc9c, chimney: [18.9, 34.9], shutter: [0.36, 0.3, 0.2] },
      { id: 'ak_gard3', name: 'Gården i øst', sub: 'gård', x0: 37, y0: 34, x1: 41, y1: 38, doors: [[39, 34]], floor: GR.WOOD, style: 'timber', wallH: 2.7, roof: 'thatch', plaster: 0xd4c6a4, chimney: [40.2, 37.2], shutter: [0.4, 0.36, 0.22] },
    ],
    fences: [[[17, 39], [23, 39]], [[17, 39], [17, 42]], [[23, 39], [23, 42]], [[17, 42], [23, 42]]],
    gaps: [[20, 39]],
    signs: [['ak_ekehus', 'EKEHUS', 'gästgiveri']],
    lamps: [[29.2, 33.0], [32.2, 30.6]],
    props: [
      { t: 'roundtent', x: 14.4, y: 20.8, r: 1.9, h: 2.9, col: [0.9, 0.88, 0.8], stripe: [0.2, 0.28, 0.5], banner: 'edelfara', door: 2 },
      { t: 'roundtent', x: 18.6, y: 18.6, r: 1.9, h: 2.9, col: [0.9, 0.88, 0.8], stripe: [0.2, 0.28, 0.5], banner: 'edelfara', door: 3 },
      { t: 'roundtent', x: 11.6, y: 24.6, r: 1.9, h: 2.9, col: [0.9, 0.88, 0.8], stripe: [0.2, 0.28, 0.5], banner: 'edelfara', door: 1 },
      { t: 'roundtent', x: 16.8, y: 25.4, r: 1.9, h: 2.9, col: [0.9, 0.88, 0.8], stripe: [0.2, 0.28, 0.5], banner: 'edelfara', door: 10 },
      { t: 'roundtent', x: 21.2, y: 23.4, r: 1.9, h: 2.9, col: [0.9, 0.88, 0.8], stripe: [0.2, 0.28, 0.5], banner: 'edelfara', door: 9 },
      { t: 'roundtent', x: 24.6, y: 19.6, r: 2.5, h: 3.4, col: [0.92, 0.9, 0.84], stripe: [0.12, 0.12, 0.16], banner: 'edelfara', door: 4 },
      { t: 'fire', x: 15.6, y: 22.9, spit: true }, { t: 'fire', x: 20.4, y: 20.8 },
      { t: 'horse', x: 12.4, y: 17.2, rot: 2.2, col: 0x5a3a24 }, { t: 'horse', x: 13.6, y: 18.2, rot: 2.3, col: 0x2a2018 },
      { t: 'horse', x: 10.6, y: 18.6, rot: 2.0, col: 0x8a6a4a }, { t: 'horse', x: 11.8, y: 19.8, rot: 2.4, col: 0x4a3020 },
      { t: 'catapult', x: 18.4, y: 14.8, rot: -2.4 },
      { t: 'wheel', x: 35.6, y: 28.3, rot: 0 },
      { t: 'boat', x: 28.4, y: 29.4, rot: 1.5 }, { t: 'boat', x: 27.2, y: 29.6, rot: 1.6 }, { t: 'net', x: 27.8, y: 27.6 },
      { t: 'cart', x: 33.2, y: 20.2, rot: 0.3 },
      { t: 'barrel', x: 32.4, y: 21.0 }, { t: 'crate', x: 32.4, y: 21.8 },
      { t: 'hay', x: 41.6, y: 17.6 }, { t: 'hay', x: 19.6, y: 40.6 },
      { t: 'post', x: 33.4, y: 30.4, text: 'EKEHUS', sub: 'Sortmund i øst', rot: 0 },
      { t: 'banner', x: 15.6, y: 15.6, kind: 'edelfara', h: 4.0 },
    ],
    trees: [[26.4, 26.6], [38.0, 30.2], [8.0, 30.6], [23.6, 31.8, 's']],
    furnish({ W, table, bench, bed, shelf, hearth, F, U }, A) {
      // Ekehus: stor peis, langbord, bønder med ølkrus
      W(31.2, 35.2, 31.55, 38.0, 0, 1.05, [0.48, 0.32, 0.2]);
      hearth(26.62, 35.6, 27.05, 37.4, 27.25, 36.5);
      table(28.8, 36.0, 1.6, 0.6); bench(28.8, 35.35, 1.6, 0.2); bench(28.8, 36.65, 1.6, 0.2);
      table(29.0, 38.0, 1.2, 0.5); bench(29.0, 37.45, 1.2, 0.2);
      for (const z of [38.6, 38.2]) A.barrel(U(32.6), U(z), 0.8);
      // kvarnen: kvernsteinen
      W(35.2, 23.8, 36.8, 25.4, 0, 0.4, [0.44, 0.32, 0.22]);
      A.millstone(U(36.0), U(24.6));
      for (const [x, z] of [[33.8, 25.8], [34.3, 26.2], [33.8, 26.4], [37.2, 23.2]]) A.sack(U(x), U(z), false);
      bed(37.2, 25.4, 38.0, 26.8, [0.6, 0.54, 0.4]);
      // gårdene
      hearth(38.62, 13.0, 39.05, 14.2, 39.25, 13.6); bed(41.2, 13.0, 42.0, 14.5, [0.5, 0.4, 0.3]);
      hearth(18.62, 35.0, 19.05, 36.2, 19.25, 35.6); bed(18.8, 36.6, 19.6, 37.9, [0.42, 0.34, 0.24]); table(20.6, 35.6, 0.8, 0.5);
      hearth(37.62, 35.6, 38.05, 36.8, 38.25, 36.2); bed(40.0, 35.6, 40.8, 37.1, [0.5, 0.42, 0.28]);
    },
    spots: {
      ek_bar: { x: 31.85, y: 36.4, yaw: -PI / 2 },
      ek_t1: { x: 28.4, y: 35.33, yaw: 0, sit: true },
      ek_t2: { x: 29.2, y: 35.33, yaw: 0, sit: true },
      ek_t3: { x: 28.8, y: 36.67, yaw: PI, sit: true },
      ek_t4: { x: 29.0, y: 37.43, yaw: 0, sit: true },
      ek_up: { x: 27.3, y: 38.6, upstairs: true },
      knight_tent: { x: 24.6, y: 21.6, yaw: 0.6, wander: 1.5 },
      knight_bed: { x: 24.8, y: 19.2, upstairs: true },
      camp_fire1: { x: 15.0, y: 23.8, yaw: 0.6 },
      camp_fire2: { x: 21.2, y: 21.5, yaw: -2.2 },
      camp_tent: { x: 18.6, y: 18.8, upstairs: true },
      camp_tent2: { x: 14.4, y: 20.8, upstairs: true },
      castle_guard: { x: 15.6, y: 16.6, yaw: 0.8 },
      castle_guard2: { x: 16.6, y: 15.6, yaw: 0.8 },
      p_a: { x: 22.0, y: 26.0 }, p_b: { x: 27.0, y: 24.5 }, p_c: { x: 19.0, y: 16.5 },
      mill_in: { x: 35.6, y: 23.4, yaw: PI, work: 'dig' },
      mill_door: { x: 35.4, y: 21.0, yaw: 0, wander: 1.2 },
      mill_bed: { x: 37.6, y: 26.6, sleep: true, lie: 'z' },
      torgils_farm: { x: 20.4, y: 40.6, yaw: 0, wander: 1.4, work: 'dig' },
      torgils_in: { x: 20.6, y: 36.8, yaw: PI },
      torgils_bed: { x: 19.2, y: 37.6, sleep: true, lie: 'z' },
      gard1_out: { x: 40.0, y: 18.0, wander: 1.4, work: 'dig' },
      gard1_bed: { x: 41.6, y: 14.3, sleep: true, lie: 'z' },
      gard3_out: { x: 37.5, y: 40.0, wander: 1.5, work: 'dig' },
      gard3_bed: { x: 40.4, y: 36.9, sleep: true, lie: 'z' },
    },
  },

  // --- Akershus borg: baron Ekes borg på toppen av kullen ----------------------------------------------
  akershus_borg: {
    id: 'akershus_borg', name: 'Akershus borg', sub: 'baron Ekes borg', seed: 15, peaceful: true, spruce: 0.4, music: 'town',
    peaceText: 'Du ga fra deg våpnene i porten. Baronens folk har fått dem.',
    plateau: { drop: 9 },
    defaultArrival: 'gate',
    arrivals: { gate: { x: 23.5, y: 28.6, yaw: PI } },
    exits: [{ x: 23.5, y: 29.6, area: 'akershus', arrival: 'castle', label: 'Gå ned fra borgen' }],
    ring: { x0: 12, y0: 10, x1: 34, y1: 30 },
    gate: { x0: 22, x1: 24, y: 30 },
    towers: [[11, 29, 12, 31], [34, 29, 35, 31]],
    paint(k) {
      k.open(0, 0, 45, 45, GR.GRASS);
      for (let i = 0; i < 46; i++) { k.rock(i, 0); k.rock(i, 45); k.rock(0, i); k.rock(45, i); }
      for (const [x, y] of [[2, 2], [3, 2], [43, 44], [42, 44], [44, 20], [1, 40]]) k.rock(x, y);
      k.rect(13, 11, 33, 29, FLOOR, GR.DIRT);
      k.rect(20, 20, 27, 29, FLOOR, GR.COBBLE);
      k.road([[23.5, 31], [23.5, 46]], 2.2);
    },
    buildings: [
      { id: 'ab_hus', name: 'Huvudbyggnaden', sub: 'baronens hus', x0: 13, y0: 11, x1: 24, y1: 19, doors: [[18, 19]], floor: GR.WOOD, style: 'stone', wallH: 5.0, roof: 'slate', chimney: [14.0, 15.0], shutter: [0.22, 0.4, 0.2] },
      { id: 'ab_torn', name: 'Tornet', sub: 'torn', x0: 27, y0: 11, x1: 33, y1: 17, doors: [[30, 17]], floor: GR.WOOD, style: 'stone', wallH: 8.0, roof: 'cone', rows: [1.8, 4.2, 6.6], shutter: null },
      { id: 'ab_vakt', name: 'Soldatstua', sub: 'soldatstue', x0: 13, y0: 22, x1: 18, y1: 27, doors: [[18, 24]], floor: GR.WOOD, style: 'timber', wallH: 2.8, roof: 'shingle', plaster: 0xcfc2a2, chimney: [13.9, 22.9], shutter: [0.22, 0.4, 0.2] },
    ],
    signs: [],
    lamps: [[19.4, 21.0], [27.4, 21.0], [21.0, 27.8], [26.0, 27.8]],
    props: [
      { t: 'well', x: 26.6, y: 24.6 },
      { t: 'banner', x: 21.4, y: 28.6, kind: 'eke', h: 4.2 }, { t: 'banner', x: 25.6, y: 28.6, kind: 'eke', h: 4.2 },
      { t: 'woodpile', x: 31.4, y: 26.4 }, { t: 'barrel', x: 29.0, y: 27.6 }, { t: 'barrel', x: 29.8, y: 27.8 }, { t: 'crate', x: 30.6, y: 27.6 },
      { t: 'fire', x: 22.6, y: 23.6, size: 0.4 },
    ],
    trees: [[31.5, 21.0, 's']],
    furnish({ W, table, bench, bed, shelf, hearth, F, U }, A) {
      // studerkammaren: bord, peis, gevær og hjortetrofeer
      table(19.0, 14.6, 2.6, 0.9);
      bench(19.0, 13.85, 2.4, 0.22); bench(19.0, 15.35, 2.4, 0.22);
      W(21.2, 12.0, 22.2, 12.7, 0, 0.8, [0.4, 0.28, 0.18]);
      hearth(13.62, 14.0, 14.05, 16.0, 14.25, 15.0);
      shelf(16.0, 11.62, 19.0, 11.86, 2.2, true);
      A.weaponRack(U(23.75), U(15.0), 'z');
      bed(22.6, 16.6, 23.6, 18.4, [0.24, 0.42, 0.22]);
      bed(15.0, 17.6, 16.6, 18.4, [0.4, 0.34, 0.26]);
      F.cloth.box(U(17.2), 0.01, U(16.4), U(20.8), 0.025, U(18.6), { uv: 'world', col: [0.3, 0.4, 0.22] });
      // tornet
      shelf(27.62, 12.0, 27.86, 14.0, 2.4, true);
      table(30.0, 13.6, 1.0, 0.6);
      // soldatstua
      hearth(13.62, 23.0, 14.05, 24.4, 14.25, 23.7);
      bed(14.8, 25.6, 16.3, 26.4, [0.22, 0.4, 0.2]); bed(16.6, 25.6, 17.6, 26.4, [0.22, 0.4, 0.2]);
      table(16.0, 23.4, 1.0, 0.5);
    },
    spots: {
      baron_study: { x: 19.0, y: 13.83, yaw: 0, sit: true },
      baron_walk: { x: 20.6, y: 16.6, yaw: PI, wander: 1.4 },
      baron_bed: { x: 23.1, y: 18.1, sleep: true, lie: 'z' },
      son1: { x: 18.0, y: 15.37, yaw: PI, sit: true },
      son2: { x: 20.2, y: 15.37, yaw: PI, sit: true },
      son_bed: { x: 15.8, y: 18.0, sleep: true, lie: 'x' },
      son_court: { x: 24.0, y: 24.4, wander: 2 },
      trigorm_gate: { x: 22.0, y: 28.4, yaw: PI },
      trigorm_wall: { x: 28.4, y: 22.6, yaw: 0.6, wander: 1.5 },
      trigorm_bed: { x: 15.5, y: 26.0, sleep: true, lie: 'x' },
      soldier_gate: { x: 25.0, y: 28.4, yaw: PI },
      soldier_tower: { x: 30.0, y: 14.6, yaw: 0, wander: 1 },
      soldier_bed: { x: 17.1, y: 26.0, sleep: true, lie: 'x' },
    },
  },

  // --- Glimming: greve Edelfaras borg i vägskälet, og värdshuset Kräklan & Svärdet ---------------------
  glimming: {
    id: 'glimming', name: 'Glimming', sub: 'greve Edelfaras borg, Styringheim', seed: 16, peaceful: true, spruce: 0.3, music: 'town', open: true,
    peaceText: 'Grevens livvakter står ved borgen. Du lar våpenet være.',
    defaultArrival: 'south',
    arrivals: { south: { x: 22.5, y: 44.2, yaw: PI }, east: { x: 44.2, y: 26.6, yaw: -PI / 2 } },
    exits: [
      { x: 22.5, y: 45.5, to: 'sortmund', label: 'Veien sørover mot Sortmund' },
      { x: 45.5, y: 26.6, to: 'pharynx', label: 'Veien østover mot Pharynx' },
      { x: 11.0, y: 0.5, flavor: 'Veien nordover går mot Filtofia. Det er dagsreiser dit, og oppdraget ditt er her.', label: 'Veien nordover mot Filtofia' },
      { x: 0.5, y: 27.6, flavor: 'Veien vestover går mot Kaskeby og Skogmark. Det du leter etter, er ikke der.', label: 'Veien vestover mot Kaskeby' },
    ],
    paint(k) {
      k.open(0, 0, 45, 45, GR.GRASS);
      k.grove(40.5, 5.5, 4.6, 4.4, 31);
      k.grove(2.5, 19, 3, 5, 32);
      k.grove(42.4, 41, 3.2, 3.4, 33);
      k.grove(4, 40, 4.5, 4, 34);
      k.grove(32, 43, 4, 2.5, 35);
      k.grove(6, 6, 4, 3, 36);
      k.road([[-1, 27.6], [47, 26.6]], 2.2);
      k.road([[22.5, 27], [22.5, 47]], 2);
      k.road([[14, 27], [12.6, 15], [11, -1]], 1.6);
      k.road([[22.5, 27], [22.5, 20]], 2);
      k.glade(22.5, 16.4, 4.8, 3.3, GR.COBBLE, 37);
      k.glade(22.5, 16.4, 2.4, 1.4, GR.GRASS, 38);
      k.rect(21, 12, 24, 13, FLOOR, GR.COBBLE);
      k.field(26, 38, 34, 43, 'korn');
    },
    buildings: [
      { id: 'gl_borg', name: 'Glimmings borg', sub: 'grevens sal', x0: 14, y0: 4, x1: 31, y1: 12, doors: [[22, 12]], floor: GR.FLAG, style: 'stone', wallH: 5.6, roof: 'slate', chimney: [15.0, 8.0], shutter: [0.12, 0.12, 0.16] },
      { id: 'gl_vakt', name: 'Livvaktens hus', sub: 'vaktstue', x0: 12, y0: 14, x1: 17, y1: 19, doors: [[17, 16]], floor: GR.WOOD, style: 'stone', wallH: 3.2, roof: 'slate', chimney: [12.9, 18.2], shutter: [0.12, 0.12, 0.16] },
      { id: 'gl_tjanst', name: 'Tjenerboligen', sub: 'tjenere', x0: 28, y0: 14, x1: 33, y1: 19, doors: [[28, 16]], floor: GR.WOOD, style: 'timber', wallH: 3.0, roof: 'tile', plaster: 0xe4d8bc, chimney: [32.2, 18.2], shutter: [0.12, 0.12, 0.16] },
      { id: 'gl_krak', name: 'Kräklan & Svärdet', sub: 'värdshus', x0: 25, y0: 30, x1: 32, y1: 36, doors: [[25, 33]], floor: GR.WOOD, style: 'timber', wallH: 4.2, roof: 'tile', plaster: 0xe0d0aa, chimney: [31.2, 31.0], shutter: [0.3, 0.36, 0.5] },
    ],
    fences: [[[33, 30], [38, 30]], [[38, 30], [38, 36]], [[33, 36], [38, 36]]],
    gaps: [[38, 33]],
    signs: [['gl_krak', 'KRÄKLAN & SVÄRDET', 'värdshus']],
    lamps: [[20.6, 13.6], [24.4, 13.6], [20.6, 20.6], [24.4, 20.6], [23.8, 29.0], [24.2, 36.6], [16.2, 26.0]],
    props: [
      { t: 'banner', x: 19.4, y: 13.4, kind: 'edelfara', h: 4.6 }, { t: 'banner', x: 25.6, y: 13.4, kind: 'edelfara', h: 4.6 },
      { t: 'post', x: 20.4, y: 28.8, text: 'SORTMUND', sub: 'Pharynx i øst', rot: 0 },
      { t: 'cart', x: 35.0, y: 33.0, rot: 1.2 }, { t: 'hay', x: 36.6, y: 31.4 }, { t: 'horse', x: 34.8, y: 35.0, rot: 0.4, col: 0x6a4a30 },
      { t: 'barrel', x: 32.8, y: 37.0 }, { t: 'barrel', x: 33.5, y: 37.2 }, { t: 'well', x: 23.6, y: 31.6 },
    ],
    trees: [[18.0, 21.6], [27.0, 21.6], [13.8, 22.4, 's'], [31.0, 22.4, 's'], [9.0, 30.0]],
    furnish({ W, table, bench, bed, shelf, hearth, F, U }, A) {
      // grevens sal: langbord, høysete, peis, tepper
      table(22.5, 7.6, 8.0, 1.1);
      bench(22.5, 6.6, 7.6, 0.24); bench(22.5, 8.6, 7.6, 0.24);
      W(27.6, 7.0, 28.6, 8.2, 0, 1.6, [0.38, 0.22, 0.14]);
      F.paint.box(U(27.6), 1.6, U(7.0), U(28.6), 1.68, U(8.2), { uv: 'world', col: [0.8, 0.62, 0.2] });
      hearth(14.62, 7.0, 15.05, 9.0, 15.25, 8.0);
      F.cloth.box(U(17.0), 0.01, U(9.2), U(28.0), 0.025, U(11.6), { uv: 'world', col: [0.18, 0.2, 0.42] });
      shelf(29.0, 4.62, 30.8, 4.86, 2.4, true);
      bed(29.4, 9.4, 30.6, 11.4, [0.16, 0.18, 0.4]);
      // livvakten
      hearth(12.62, 17.2, 13.05, 18.4, 13.25, 17.8); bed(14.6, 18.0, 16.4, 18.8, [0.16, 0.18, 0.3]); table(14.6, 15.6, 0.8, 0.5);
      // tjenerne
      hearth(32.0, 17.62, 33.0, 18.05, 32.5, 18.25); bed(30.4, 14.6, 32.2, 15.4, [0.5, 0.42, 0.3]); table(30.0, 17.0, 0.9, 0.5);
      // Kräklan & Svärdet
      W(26.2, 30.6, 29.0, 30.95, 0, 1.05, [0.5, 0.34, 0.22]);
      shelf(26.2, 30.62, 29.0, 30.84, 2.0, true);
      hearth(31.0, 30.62, 32.0, 31.05, 31.5, 31.25);
      table(28.4, 33.4, 1.2, 0.6); bench(28.4, 32.75, 1.2, 0.2); bench(28.4, 34.05, 1.2, 0.2);
      table(30.6, 34.6, 1.0, 0.55); bench(30.6, 34.0, 1.0, 0.2); bench(30.6, 35.2, 1.0, 0.2);
      A.barrel(U(31.8), U(35.5), 0.8);
    },
    spots: {
      greve_hall: { x: 28.1, y: 7.6, yaw: -PI / 2, sit: true },
      greve_walk: { x: 25.0, y: 10.4, wander: 1.6 },
      greve_bed: { x: 30.0, y: 11.0, sleep: true, lie: 'z' },
      hov_door: { x: 22.5, y: 13.4, yaw: 0 },
      hov_hall: { x: 26.4, y: 9.6, yaw: -2.0 },
      hov_bed: { x: 31.0, y: 15.0, sleep: true, lie: 'x' },
      livvakt1: { x: 20.2, y: 14.2, yaw: 0.3 },
      livvakt2: { x: 24.8, y: 14.2, yaw: -0.3 },
      livvakt_bed: { x: 15.5, y: 18.4, sleep: true, lie: 'x' },
      livvakt_round: { x: 22.5, y: 22.0, wander: 3 },
      krak_bar: { x: 27.6, y: 30.3, yaw: 0 },
      krak_t1: { x: 28.4, y: 32.73, yaw: 0, sit: true },
      krak_t2: { x: 28.4, y: 34.07, yaw: PI, sit: true },
      krak_t3: { x: 30.6, y: 33.98, yaw: 0, sit: true },
      krak_up: { x: 31.4, y: 35.4, upstairs: true },
      krak_yard: { x: 35.6, y: 33.6, wander: 1.5 },
      field_w: { x: 30.0, y: 40.4, wander: 2, work: 'dig' },
    },
  },

  // --- Lekhs leir: en hogd glenne i skogen en kilometer sør for Akershus (s. 11-12) ---------------------
  lagret: {
    id: 'lagret', name: 'Lekhs leir', sub: 'Torilskogen, sør for Akershus', seed: 17, peaceful: false, spruce: 0.6, lootDepth: 3, music: 'explore',
    defaultArrival: 'north',
    arrivals: { north: { x: 10.6, y: 1.6, yaw: 0.25 } },
    exits: [{ x: 10.6, y: 0.5, to: 'akershus', label: 'Stien nordover tilbake til Akershus' }],
    paint(k) {
      k.glade(23, 23, 11.5, 8.6, GR.DIRT, 9);
      k.glade(23, 23, 8, 6, GR.DIRT, 10);
      k.road([[16, 16], [12, 8], [10.6, -1]], 1.5, GR.GRASS);
      // fluktstien mot sørøst, der Lekh rir når det går galt
      k.road([[33, 16], [38, 26], [42, 36], [46.5, 42]], 1.4, GR.GRASS);
      k.glade(34, 13, 3.2, 2.8, GR.DIRT, 11);
      k.glade(23, 17.4, 6.4, 3.8, GR.DIRT, 12);
    },
    props: [
      { t: 'tent', x: 23.0, y: 17.6, face: PI / 2, len: 3.4, w: 2.2, h: 2.7, col: [0.34, 0.24, 0.16], walkIn: true, ref: 'lekhTent' },
      { t: 'tent', x: 14.6, y: 20.8, face: 0, len: 2.0, w: 1.5, h: 2.0, col: [0.18, 0.16, 0.18] },
      { t: 'tent', x: 31.6, y: 21.0, face: PI, len: 2.0, w: 1.5, h: 2.0, col: [0.18, 0.16, 0.18] },
      { t: 'tent', x: 13.4, y: 28.0, face: -0.6, len: 2.2, w: 1.6, h: 2.0, col: [0.42, 0.34, 0.24] },
      { t: 'tent', x: 23.4, y: 31.2, face: -PI / 2, len: 2.2, w: 1.6, h: 2.0, col: [0.42, 0.34, 0.24] },
      { t: 'tent', x: 33.0, y: 28.4, face: PI + 0.6, len: 2.2, w: 1.6, h: 2.0, col: [0.42, 0.34, 0.24] },
      { t: 'pen', x: 34.2, y: 12.8, r: 2.3, gap: 1.2 },
      { t: 'fire', x: 18.4, y: 25.0 }, { t: 'fire', x: 28.4, y: 25.2 }, { t: 'fire', x: 23.2, y: 23.4, spit: true, size: 0.7 },
      { t: 'skullpole', x: 20.4, y: 15.2 }, { t: 'skullpole', x: 25.8, y: 15.2 },
      { t: 'banner', x: 23.0, y: 14.6, kind: 'lekh', h: 3.6 },
      { t: 'bones', x: 26.0, y: 27.0 }, { t: 'bones', x: 16.4, y: 24.0 },
      { t: 'stump', x: 12.4, y: 22.4 }, { t: 'stump', x: 34.2, y: 24.0 }, { t: 'stump', x: 30.6, y: 31.6 }, { t: 'stump', x: 15.6, y: 31.0 },
      { t: 'woodpile', x: 27.8, y: 18.0 }, { t: 'crate', x: 19.4, y: 18.4 }, { t: 'barrel', x: 20.2, y: 18.6 },
    ],
    trees: [],
    spots: {},
  },
};

// Noder på reisekartet. x og y er prosent av kartet (s. 15, forenklet). hours: reisetid til naboene.
export const NODES = {
  fristaden: { name: 'Landeveien', sub: 'ut på verdenskartet, mot Fristaden', x: 8, y: 14 },
  ekeskogen: { name: 'Ekeskogen', sub: 'Torilskogen', x: 40, y: 56 },
  sortmund: { name: 'Sortmund', sub: 'Ridderskors', x: 74, y: 52 },
  akershus: { name: 'Akershus', sub: 'Eke baroni', x: 30, y: 80 },
  glimming: { name: 'Glimming', sub: 'grevens borg', x: 72, y: 20 },
  lagret: { name: 'Lekhs leir', sub: 'i skogen sør for Akershus', x: 34, y: 92, hidden: true },
  pharynx: { name: 'Pharynx', sub: 'hertigens by', x: 94, y: 6, text: true },
};
export const EDGES = [
  ['fristaden', 'ekeskogen', 1, 'skog'], ['ekeskogen', 'sortmund', 4, 'skog'], ['ekeskogen', 'akershus', 3, 'skog'],
  ['sortmund', 'glimming', 5, 'vei'], ['akershus', 'lagret', 0.5, 'sti'], ['glimming', 'pharynx', 10, 'vei'],
];

export { WALL, K_ROCK };
