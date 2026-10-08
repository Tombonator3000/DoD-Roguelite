// Oppdraget «Triangeldrama i Edelfara»: tilstand, ledetråder, frist og journal.
// Alt ligger i G.run.ivan, så det lagres sammen med resten av løpet.
import { G } from './state.js';

// Greven gir seg en uke: «Får jag bara en vecka...» (s. 6). Etter det stormer soldatene Akershus,
// og svartfolket faller over dem (s. 9). Fristen regnes fra dagen du finner kureren, klokka seks.
export const DAYS = 7;

// kind: 'fakta' (det som hendte), 'svart' (peker mot svartfolket), 'falsk' (villspor, s. 8-9).
// strong: et bevis som kan overtale grevens folk (s. 9).
export const CLUES = {
  kurir: { t: 'Hertigens kurir ligger død i Ekeskogen, skutt med en armbrøstpil. Vesken er skåret opp i bunnen, men den fine ringen sitter fortsatt på fingeren hans.', kind: 'fakta' },
  depesch: { t: 'Depesjen: et lejdebrev fra hertigen av Pharynx, og en ordre til en viss Ererik. Finn ut hvem som drepte Riddar Kettil og tok pengekisten. Mistenkte: greve Edelfara i Glimming, baron Eke i Akershus og markis Ridderskors i Sortmund.', kind: 'fakta' },
  tann: { t: 'Tannmerker i et hjørne av depesjen, som om noen trodde den var spiselig.', kind: 'svart' },
  pil: { t: 'Pilen i kuriren har hullinger og svarte fjær. Treslaget vokser bare langt inne i Torilskogen.', kind: 'svart' },
  ulvspor: { t: 'Store ulvespor rundt liket av kuriren. De fører inn i skogen og blir borte.', kind: 'svart' },
  papir: { t: 'Fuktige, tygde papirbiter på veien mellom Ekeskogen og Akershus, og grynting inne i skogen.', kind: 'svart' },
  mynt: { t: 'Ti gullmynt med hertigens stempel i pungen til ledarorchen.', kind: 'svart' },
  orcbrev: { t: 'Ledarorchen hadde rester av to brev fra Pharynx: et fra en skredder til mjølneren i Akershus, og et kjærlighetsbrev fra Brigetta Hansdotra til soldaten Trigorm Detlefsson i Akershus borg.', kind: 'svart' },
  mynt_markis: { t: 'Markisen kjenner igjen myntene fra orchen. De lå i hans egen kiste, den Kettil hadde med seg.', kind: 'svart', strong: true },
  brev_trigorm: { t: 'Trigorm kjenner igjen konas håndskrift. Brevet skulle komme med hertigens kurir. Orchene har drept kureren.', kind: 'svart', strong: true },
  brev_mjolnare: { t: 'Mjølneren i Akershus fikk skredderens brev fra Pharynx. Det kom med kurirposten. Orchene har drept kureren.', kind: 'svart', strong: true },
  kettil_lik: { t: 'Riddar Kettil ble skutt gjennom ringbrynja, på kort hold, med et svært kraftig armborst.', kind: 'fakta' },
  kettil_hull: { t: 'Såret i Kettils bryst har flerrete kanter. Pilen hadde hullinger.', kind: 'svart' },
  hullingar: { t: 'Hullingpiler brukes bare av svartfolk, sier folk som kjenner Torilskogen.', kind: 'svart' },
  papirspiser: { t: 'Baron Eke: orcher spiser alt, til og med papir når de er sultne nok.', kind: 'svart' },
  svartfolk: { t: 'Baron Eke: svartfolket har strøket rundt i skogene i en uke. De brente en skogshuggers koie. Flere flokker er sett sør og øst for Akershus.', kind: 'svart' },
  styrbiorn: { t: 'Jakten var hovmesterens forslag, etter et brev fra en Herr Styrbiorn som aldri kom. Stygg, sprikende håndskrift med mange stavefeil.', kind: 'svart' },
  fange: { t: 'En såret orch: lederen deres er i skogen sør for Akershus, og et angrep på Akershus er planlagt.', kind: 'svart', strong: true },
  spor: { t: 'Spor fra svartfolk fører sørover fra Akershus, inn i skogen. Der må det være en leir.', kind: 'svart' },
  leir: { t: 'Lekhs leir sør for Akershus: svartalfer, orcher og en hage med ulver. Mange flere enn noen tror.', kind: 'svart', strong: true },
  kista: { t: 'Markisens pengekiste sto i Lekhs telt, under bjørneskinn.', kind: 'svart', strong: true },
  lekh: { t: 'Lekh, høvdingen over svartalfene i Torilskogen, står bak alt. Han vil la greven og baronen slite hverandre ut, og så ta Eke.', kind: 'svart', strong: true },
  // villspor
  greve_brev: { t: 'Grevens svar til markisen: «Siste ord er dog ikke sagt med dette...»', kind: 'falsk' },
  greve_tjener: { t: 'Folk i Glimming tror greven lot Kettil drepe for å ta pengene og holde striden ved like.', kind: 'falsk' },
  bastard: { t: 'Bonden med det halve øret: Kettil kalte markisen «far». Markisen jaget ham og betalte bonden hundre silverdaler.', kind: 'falsk' },
  edelina: { t: 'Baron Eke var forelsket i grevens datter Edelina, som alle kaller Linna. Hun ble gift med markisen.', kind: 'falsk' },
  jorne: { t: 'Baron Jörnes bud skal kreve inn to hundre gullmynt som baron Eke skylder.', kind: 'falsk' },
  arbalest: { t: 'En arbalest står lent mot et telt i grevens leir i Akershus, med fem hullingpiler i et stativ.', kind: 'falsk' },
};

export function Q() {
  const r = G.run;
  if (!r.ivan) r.ivan = { stage: 0, clues: {}, flags: {}, items: {}, dead: {}, day0: null, deadline: null };
  return r.ivan;
}
export const has = id => !!Q().clues[id];
export const fl = id => Q().flags[id];
export const item = id => Q().items[id];
export function flag(id, v = true) { Q().flags[id] = v; }
export function give(id, v = true) { Q().items[id] = v; }
export function take(id) { delete Q().items[id]; }

export function clue(id, quiet = false) {
  if (has(id) || !CLUES[id]) return false;
  Q().clues[id] = Math.round(G.run.clock * 10) / 10;
  if (!quiet) {
    G.ui.log(`<b class="c-mark">Ledetråd:</b> ${CLUES[id].t}`);
    G.audio.menuSelect?.();
  }
  return true;
}

export function started() { return Q().stage >= 1; }

// Kureren er funnet: lejdebrevet og ordren. Fristen begynner nå.
export function startQuest() {
  const q = Q();
  if (q.stage >= 1) return false;
  q.stage = 1;
  q.day0 = Math.floor(G.run.clock / 24);
  q.deadline = (q.day0 + DAYS) * 24 + 6;
  give('lejdebrev');
  G.run.quests = G.run.quests || {};
  G.run.quests.ivan = { state: 'active' };
  G.ui.log('<b class="c-mark">Nytt oppdrag:</b> Triangeldrama i Edelfara. Finn ut hvem som drepte Riddar Kettil og tok pengekisten, og rapporter til hertigens vaktkaptein i Pharynx.');
  G.ui.log(`Greve Edelfaras soldater beleirer Akershus. Om ${DAYS} dager stormer de borgen.`);
  G.audio.drake?.();
  return true;
}

// Sterke bevis mot svartfolket
export function proofs() {
  return Object.keys(Q().clues).filter(id => CLUES[id]?.strong).length + (fl('lekh') === 'dead' ? 1 : 0);
}

export function hoursLeft() {
  const q = Q();
  if (q.deadline == null) return null;
  return q.deadline - G.run.clock;
}

export function deadlineText() {
  const h = hoursLeft();
  if (h == null) return '';
  if (fl('truce')) return 'Beleiringen er hevet.';
  if (fl('storm')) return 'Akershus ble stormet.';
  if (h <= 0) return 'Fristen er ute.';
  const d = Math.floor(h / 24), t = Math.floor(h % 24);
  return `Greven stormer Akershus om ${d ? `${d} dag${d === 1 ? '' : 'er'} og ` : ''}${t} time${t === 1 ? '' : 'r'}.`;
}

// Hva du bør gjøre nå, for journalen
export function goal() {
  const q = Q();
  if (q.stage < 1) return null;
  if (fl('reported')) return 'Oppdraget er fullført. Hertigen vet hva som skjedde.';
  if (fl('storm') === 'fallen') return 'Akershus falt. Svartfolket herjer i Eke. Du kan fortsatt rapportere til Pharynx, men det er ikke mye å fortelle.';
  if (fl('storm') === 'count') return 'Greven tok Akershus og baronen til fange. Rapporter til Pharynx hva du vet.';
  if (fl('peace') && !fl('truce')) return 'Svartfolket er drevet tilbake, men greven vet det ikke. Fortell det til riddarkapteinen i Akershus før fristen går ut.';
  if (fl('peace')) return `Svartfolket er drevet tilbake. Reis til Pharynx og rapporter til hertigens vaktkaptein.${fl('chest') === 'carried' ? ' Markisen vil ha kisten sin.' : ''}`;
  if (fl('truce')) return 'Grevens soldater følger deg mot Lekhs leir. Reis dit fra Akershus.';
  if (has('leir') || has('fange') || has('spor')) return 'Overtal grevens riddarkapten i Akershus til å slutte fred med baronen og angripe svartfolket i stedet. Eller ta deg inn i leiren alene.';
  return 'Snakk med de tre adelsmennene og folket deres. Hvem tjener på mordet? Hvem lyver?';
}

export function journalHTML() {
  const q = Q();
  if (q.stage < 1) return '';
  const ids = Object.keys(q.clues).sort((a, b) => q.clues[a] - q.clues[b]);
  // hva som er villspor, vises først når saken er rapportert. Før det ser alle ledetrådene like ut.
  const rows = ids.map(id => `<div class="qrow clue ${fl('reported') ? CLUES[id].kind : ''}">${CLUES[id].t}</div>`).join('');
  return `<h3>Triangeldrama i Edelfara</h3><div class="qrow goal">${goal()}</div>${fl('reported') ? '' : `<div class="qrow dl">${deadlineText()}</div>`}${rows}`;
}
