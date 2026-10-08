// Kartet over Fristaden. Ren data uten three.js, så det kan testes i node.
// Rutenett 46 x 46 fliser. x mot høyre (+x), y nedover (+z i verden).
// Kameraet står i sørøst (+x, +z), så nord og vest er "bak" på skjermen.

export const WALL = 0, FLOOR = 1, WATER = 2, PILLAR = 3, HOUSE = 4, FENCE = 5;
export const GR = { OUT: 0, COBBLE: 1, DIRT: 2, GRASS: 3, WOOD: 4, FLAG: 5, PLANK: 6 };

export const TW = 46, TH = 46;
export const RING = { x0: 3, y0: 3, x1: 42, y1: 42 };
export const RIVER = { x0: 31, x1: 32 };
export const GATE = { x0: 17, x1: 19, y: 3 };

// Bygninger: veggene ligger på rektangelets kant, innsiden er rommet.
// front: veggene mot kameraet (sør og øst) senkes når du er inne.
export const BUILDINGS = [
  { id: 'inn', name: 'Den feite gåsen', sub: 'vertshus', x0: 5, y0: 5, x1: 13, y1: 11, doors: [[13, 8]], floor: GR.WOOD, style: 'timber', wallH: 4.6, roof: 'tile', plaster: 0xe2d4b4, chimney: [5.85, 8.9] },
  { id: 'shop', name: 'Hvass handel', sub: 'krambod', x0: 5, y0: 14, x1: 11, y1: 19, doors: [[11, 16]], floor: GR.WOOD, style: 'timber', wallH: 3.0, roof: 'shingle', plaster: 0xd8c8a6 },
  { id: 'temple', name: 'Utus soltempel', sub: 'tempel', x0: 21, y0: 5, x1: 28, y1: 13, doors: [[24, 13], [25, 13]], floor: GR.FLAG, style: 'stone', wallH: 4.6, roof: 'copper', pillars: [[23, 8], [26, 8], [23, 11], [26, 11]] },
  { id: 'chapter', name: 'Tornväktarordens kapittelhus', sub: 'ordenshus', x0: 34, y0: 5, x1: 41, y1: 11, doors: [[37, 11]], floor: GR.FLAG, style: 'stone', wallH: 3.8, roof: 'slate' },
  { id: 'tower', name: 'Gynervas tårn', sub: 'magikerens tårn', x0: 35, y0: 14, x1: 39, y1: 18, doors: [[37, 18]], floor: GR.WOOD, style: 'stone', wallH: 7.2, roof: 'cone' },
  { id: 'dojo', name: 'Mester Flansens dojo', sub: 'treningssal', x0: 5, y0: 25, x1: 12, y1: 31, doors: [[12, 28]], floor: GR.WOOD, style: 'timber', wallH: 3.0, roof: 'thatch', plaster: 0xe6dcc4 },
  { id: 'smithy', name: 'Bataars smie', sub: 'smie', x0: 21, y0: 29, x1: 27, y1: 34, doors: [[24, 29]], floor: GR.DIRT, style: 'stone', wallH: 3.2, roof: 'slate', chimney: [26.25, 32.8] },
  { id: 'home', name: 'Nansens hus', sub: 'hjem', x0: 12, y0: 35, x1: 16, y1: 40, doors: [[16, 37]], floor: GR.WOOD, style: 'timber', wallH: 2.7, roof: 'thatch', plaster: 0xd6c9ae, chimney: [13.6, 35.85] },
  { id: 'farm', name: 'Edegars hus', sub: 'bolig', x0: 5, y0: 34, x1: 10, y1: 40, doors: [[10, 37]], floor: GR.WOOD, style: 'timber', wallH: 2.8, roof: 'thatch', plaster: 0xcfc2a2, chimney: [6.5, 34.85] },
  { id: 'guard', name: 'Vaktstua', sub: 'vaktstue', x0: 22, y0: 37, x1: 27, y1: 41, doors: [[22, 39]], floor: GR.WOOD, style: 'timber', wallH: 2.8, roof: 'shingle', plaster: 0xd2c6aa, chimney: [26.4, 37.85] },
  { id: 'manor', name: 'Hvass gård', sub: 'kjøpmannsgård', x0: 34, y0: 33, x1: 41, y1: 40, doors: [[34, 36]], floor: GR.WOOD, style: 'timber', wallH: 3.6, roof: 'tile', plaster: 0xeadcc0, chimney: [39.55, 33.85] },
];

// Gjerder rundt hager (fra-til, inklusive). Hull i gjerdet er grinder.
const FENCES = [
  // Edegars kålhage
  [[5, 32], [10, 32]], [[5, 32], [5, 33]],
  // kirkegården øst for elva
  [[34, 23], [41, 23]], [[34, 23], [34, 29]], [[34, 29], [41, 29]],
];
const GATES_IN_FENCE = [[8, 32], [34, 26]];

// Trær (flis), litt tilfeldig plassert i flisa ved bygging
export const TREES = [
  [4.6, 16.4], [14.8, 4.9], [4.6, 26.6], [4.6, 37.4], [11.5, 33.6], [8.4, 41.4], [13.6, 41.4],
  [27.5, 18.4], [27.6, 24.6], [28.5, 31.0], [28.5, 38.5], [21.4, 41.4], [27.2, 4.7],
  [40.6, 14.6], [34.5, 19.6], [40.6, 27.6], [35.4, 24.4], [41.2, 41.3], [37.0, 41.4], [41.3, 31.3],
];

// Steder folk står, sover og jobber. x og z i flis (desimaler tillatt), yaw i radianer.
export const SPOTS = {
  shop_counter: { x: 7.3, y: 16.6, yaw: Math.PI / 2 },
  shop_back: { x: 6.6, y: 17.6, yaw: Math.PI / 2 },
  shop_door: { x: 12.9, y: 16.0, yaw: Math.PI / 2, wander: 1 },
  square_w: { x: 13.6, y: 20.6, yaw: Math.PI / 2, wander: 2 },
  square_c: { x: 20.5, y: 20.0, yaw: 0, wander: 3 },
  square_e: { x: 23.8, y: 21.6, yaw: -Math.PI / 2, wander: 2 },
  well: { x: 17.0, y: 18.4, yaw: -2.2 },
  stall_spice: { x: 14.6, y: 24.5, yaw: Math.PI },
  stall_fish: { x: 22.6, y: 18.2, yaw: 0 },
  stall_veg: { x: 22.4, y: 25.0, yaw: Math.PI },
  inn_bar: { x: 8.0, y: 6.75, yaw: 0 },
  inn_t1: { x: 10.4, y: 8.76, yaw: 0, sit: true },
  inn_t2: { x: 10.4, y: 10.04, yaw: Math.PI, sit: true },
  inn_t3: { x: 11.0, y: 7.03, yaw: 0, sit: true },
  inn_t4: { x: 11.0, y: 8.17, yaw: Math.PI, sit: true },
  inn_stage: { x: 7.0, y: 10.5, yaw: 0.7 },
  inn_stairs: { x: 11.6, y: 6.75, yaw: Math.PI / 2, upstairs: true },
  temple_altar: { x: 25.0, y: 7.15, yaw: 0 },
  temple_bed: { x: 22.05, y: 12.2, yaw: 0, sleep: true, lie: 'z' },
  temple_steps: { x: 23.2, y: 15.3, yaw: 0, wander: 1.5 },
  chapter_in: { x: 37.5, y: 9.75, yaw: 0 },
  chapter_bed: { x: 35.5, y: 7.3, yaw: 0, sleep: true, lie: 'z' },
  memorial: { x: 38.6, y: 13.55, yaw: Math.PI },
  tower_in: { x: 36.4, y: 17.2, yaw: 0.6 },
  tower_stairs: { x: 38.2, y: 17.9, yaw: 0, upstairs: true },
  dojo_in: { x: 9.2, y: 28.4, yaw: Math.PI / 2 },
  dojo_bed: { x: 11.7, y: 30.47, yaw: 0, sleep: true, lie: 'x' },
  smith_forge: { x: 24.6, y: 32.15, yaw: 0, work: 'hammer' },
  smith_bed: { x: 26.5, y: 31.05, yaw: 0, sleep: true, lie: 'z' },
  home_bed: { x: 13.5, y: 38.25, yaw: 0, sleep: true },
  home_in: { x: 14.4, y: 37.6, yaw: Math.PI / 2 },
  farm_bed: { x: 6.5, y: 39.1, yaw: 0, sleep: true, lie: 'z' },
  farm_garden: { x: 8.0, y: 33.5, yaw: Math.PI, wander: 1.5, work: 'dig' },
  guard_bed: { x: 24.8, y: 40.97, yaw: 0, sleep: true, lie: 'x' },
  guard_bed2: { x: 26.6, y: 40.97, yaw: 0, sleep: true, lie: 'x' },
  guard_in: { x: 25.6, y: 39.4, yaw: -Math.PI / 2 },
  manor_in: { x: 37.0, y: 36.0, yaw: -Math.PI / 2 },
  manor_bed: { x: 40.25, y: 39.5, yaw: 0, sleep: true, lie: 'z' },
  gate_l: { x: 17.3, y: 5.0, yaw: 0 },
  gate_r: { x: 19.7, y: 5.0, yaw: 0 },
  bridge_camp: { x: 30.1, y: 24.4, yaw: Math.PI / 2 },
  pier: { x: 33.6, y: 16.5, yaw: -Math.PI / 2 },
  graveyard: { x: 37.6, y: 25.5, yaw: Math.PI, wander: 1.2 },
  // vaktrunde om natta
  p1: { x: 18.5, y: 6.5 }, p2: { x: 18.5, y: 21.5 }, p3: { x: 30.0, y: 21.5 }, p4: { x: 38.0, y: 21.5 },
  p5: { x: 18.5, y: 36.0 }, p6: { x: 8.0, y: 21.5 }, p7: { x: 15.0, y: 12.6 },
};

export function tileIdx(x, y) { return y * TW + x; }

export function buildTownLayout() {
  const grid = new Uint8Array(TW * TH).fill(WALL);
  const ground = new Uint8Array(TW * TH).fill(GR.OUT);
  const bmap = new Uint8Array(TW * TH); // bygning + 1 for innsiden (og dørene)
  const doorMap = new Uint8Array(TW * TH); // bygning + 1
  const bridge = new Uint8Array(TW * TH);
  const set = (x, y, v, g) => {
    if (x < 0 || y < 0 || x >= TW || y >= TH) return;
    const i = tileIdx(x, y);
    if (v !== undefined && v !== null) grid[i] = v;
    if (g !== undefined && g !== null) ground[i] = g;
  };
  const rect = (x0, y0, x1, y1, v, g) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, v, g); };

  // innenfor muren: gress
  rect(RING.x0 + 1, RING.y0 + 1, RING.x1 - 1, RING.y1 - 1, FLOOR, GR.GRASS);
  // gater
  rect(17, 4, 19, 41, FLOOR, GR.COBBLE); // hovedgata nord-sør
  rect(12, 17, 25, 26, FLOOR, GR.COBBLE); // torget
  rect(4, 21, 41, 22, FLOOR, GR.COBBLE); // gata øst-vest
  rect(21, 14, 28, 16, FLOOR, GR.FLAG); // tempelplassen
  rect(4, 12, 16, 13, FLOOR, GR.DIRT); // smug mellom vertshuset og butikken
  rect(12, 14, 16, 16, FLOOR, GR.DIRT);
  rect(29, 4, 30, 41, FLOOR, GR.DIRT); // elvesti vest
  rect(33, 4, 33, 41, FLOOR, GR.DIRT); // elvesti øst
  rect(34, 12, 41, 13, FLOOR, GR.DIRT);
  rect(20, 27, 28, 28, FLOOR, GR.DIRT); // smigården
  rect(20, 35, 28, 36, FLOOR, GR.DIRT);
  rect(13, 27, 16, 34, FLOOR, GR.DIRT); // sti forbi dojoen
  rect(4, 23, 11, 24, FLOOR, GR.DIRT);
  rect(34, 30, 41, 32, FLOOR, GR.DIRT);
  rect(20, 4, 20, 13, FLOOR, GR.DIRT);
  // elva
  for (let y = RING.y0 + 1; y <= RING.y1 - 1; y++) for (let x = RIVER.x0; x <= RIVER.x1; x++) set(x, y, WATER, GR.OUT);
  // broer
  for (let x = RIVER.x0; x <= RIVER.x1; x++) {
    for (const y of [21, 22]) { set(x, y, FLOOR, GR.PLANK); bridge[tileIdx(x, y)] = 1; }
    set(x, 9, FLOOR, GR.PLANK); bridge[tileIdx(x, 9)] = 2;
  }
  // brygge ut i elva
  set(32, 16, FLOOR, GR.PLANK); bridge[tileIdx(32, 16)] = 3;

  // bymuren
  for (let i = RING.x0; i <= RING.x1; i++) { set(i, RING.y0, WALL, GR.OUT); set(i, RING.y1, WALL, GR.OUT); }
  for (let j = RING.y0; j <= RING.y1; j++) { set(RING.x0, j, WALL, GR.OUT); set(RING.x1, j, WALL, GR.OUT); }
  // porttårn og hjørnetårn
  rect(15, 4, 16, 4, WALL, GR.OUT);
  rect(20, 4, 21, 4, WALL, GR.OUT);
  rect(3, 3, 4, 4, WALL, GR.OUT);
  rect(41, 3, 42, 4, WALL, GR.OUT);

  // bygninger
  BUILDINGS.forEach((b, bi) => {
    for (let y = b.y0; y <= b.y1; y++) for (let x = b.x0; x <= b.x1; x++) {
      const edge = x === b.x0 || x === b.x1 || y === b.y0 || y === b.y1;
      if (edge) set(x, y, HOUSE, b.floor);
      else { set(x, y, FLOOR, b.floor); bmap[tileIdx(x, y)] = bi + 1; }
    }
    for (const [x, y] of b.doors) { set(x, y, FLOOR, b.floor); doorMap[tileIdx(x, y)] = bi + 1; bmap[tileIdx(x, y)] = bi + 1; }
    for (const [x, y] of b.pillars || []) set(x, y, PILLAR);
  });

  // gjerder
  for (const [[ax, ay], [bx, by]] of FENCES) {
    for (let y = Math.min(ay, by); y <= Math.max(ay, by); y++) for (let x = Math.min(ax, bx); x <= Math.max(ax, bx); x++) {
      if (grid[tileIdx(x, y)] === FLOOR) set(x, y, FENCE);
    }
  }
  for (const [x, y] of GATES_IN_FENCE) set(x, y, FLOOR);
  rect(6, 33, 10, 33, null, GR.DIRT); // kålåker

  return { grid, ground, bmap, doorMap, bridge };
}

// For feilsøking i node: tegn kartet som tekst
export function asciiTown(L) {
  const ch = { [GR.COBBLE]: '=', [GR.DIRT]: ':', [GR.GRASS]: '.', [GR.WOOD]: 'w', [GR.FLAG]: 'f', [GR.PLANK]: 'b', [GR.OUT]: ',' };
  const rows = [];
  for (let y = 0; y < TH; y++) {
    let s = '';
    for (let x = 0; x < TW; x++) {
      const i = tileIdx(x, y), v = L.grid[i];
      if (v === WALL) s += L.ground[i] === GR.OUT && (x < RING.x0 || x > RING.x1 || y < RING.y0 || y > RING.y1) ? ' ' : '#';
      else if (v === WATER) s += '~';
      else if (v === HOUSE) s += 'H';
      else if (v === FENCE) s += 'x';
      else if (v === PILLAR) s += 'o';
      else if (L.doorMap[i]) s += 'D';
      else s += ch[L.ground[i]] || '?';
    }
    rows.push(s.replace(/ /g, ' '));
  }
  return rows.join('\n');
}
