// Delt spilltilstand. Alle moduler importerer G i stedet for hverandre,
// slik at vi slipper sirkulære avhengigheter.
export const G = {
  scene: null,
  camera: null,
  renderer: null,
  composer: null,
  dungeon: null,
  player: null,
  enemies: [],
  projectiles: [],
  pickups: [],
  props: [],
  interactables: [],
  fx: null,
  ui: null,
  audio: null,
  input: null,
  assets: null,
  time: 0,
  hitStop: 0,
  state: 'title', // title | play | transition | dialog | deathroll | dead | victory | pause | sheet
  depth: 1,
  run: null, // statistikk for gjeldende løp
  meta: null, // permanente oppgraderinger (fjær)
  touch: false,
};

export const T = 2; // tilestørrelse i verdensenheter
