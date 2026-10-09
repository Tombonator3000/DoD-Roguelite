// Områder fra mal for verdenskartet: møter i skog, slette og fjell, landsbyer, og stedene du finner
// (gravhaugen, orchleiren, Svarta Tornet, vraket). Ren data, som edelmap.js. Rutenettet er 46 x 46
// fliser à 2 m. Folkene er spillets egne. Faren følger kildene i docs/verdenskart.md.
import { FLOOR, GR } from './townmap.js';
import { PLACES, ENCOUNTERS } from './worldmap.js';
import { reveal, known, regionAt, ate } from './worldtravel.js';

const PI = Math.PI;
const TERR_NAME = { '.': 'slette', F: 'skog', '^': 'fjell' };

function rng(seed) {
  let s = (Math.abs(seed | 0) % 2147483646) + 1;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}
const pick = (R, a) => a[Math.floor(R() * a.length)];

const NAMES = {
  manniska: ['Gunnar', 'Halvar', 'Ingrid', 'Ylva', 'Brage', 'Sigrun', 'Torvald', 'Eira', 'Orm', 'Ragna', 'Holmfrid', 'Asmund', 'Tyra', 'Gisle', 'Runa', 'Leidulf'],
  dvarg: ['Gorm', 'Bruni', 'Dagny', 'Thrain', 'Hild', 'Kargo', 'Udde', 'Brynja'],
  alv: ['Elendril', 'Ilmare', 'Saelis', 'Faenor', 'Liria', 'Tavael'],
};
const SURN = { dvarg: ['Kvartsskjegg', 'Jernhånd', 'Skiferfot', 'Gruvebror'], manniska: ['Kålsdotter', 'fra Valon', 'Tjärsson', 'Brunhatt', 'den tykke'], alv: ['av Goiana', 'Sølvlind'] };

// Hvilke steder du kan få høre om i nærheten (ikke de du alt vet om)
function nearbyUnknown(x, y, n = 2, hidden = true) {
  return Object.entries(PLACES)
    .filter(([id, p]) => !known(id) && (hidden || !p.hidden) && p.kind !== 'port')
    .map(([id, p]) => [id, Math.max(Math.abs(p.x - x), Math.abs(p.y - y))])
    .filter(([, dd]) => dd <= 12)
    .sort((a, b) => a[1] - b[1]).slice(0, n).map(([id]) => id);
}

function tellAbout(ids, fallback) {
  const fresh = reveal(ids);
  if (!fresh.length) return fallback;
  const p = PLACES[fresh[0]];
  const lines = {
    gravhaugen: 'Det står en gammel gravhaug i lia under fjellet, med en steinring rundt. Folk går ikke dit etter mørkets frembrudd. Det er noe som går der da.',
    orchleiren: 'Orcher har slått leir oppe i Aidnebergen, vest for passet. Røyken ser du fra Galastan på klare dager.',
    svarta_tornet: 'Svarta Tornet står i Aidnebergen. Tornväktarna forseglet det for mange år siden. Nå sier folk at portene er stengt igjen, og at orchene er tilbake rundt det.',
    vraket: 'Det ligger en strandet kogg på kysten sør for Ardesch. Ingen har tømt den ennå, sier de, fordi rottene var der først.',
  };
  return `${lines[fresh[0]] || `Kjenner du ${p.name}? ${p.sub[0].toUpperCase() + p.sub.slice(1)}. Jeg kan vise deg på kartet.`}${fresh.length > 1 ? ` Og ${PLACES[fresh[1]].name}, hvis du skal den veien.` : ''}`;
}

// --- folk ------------------------------------------------------------------------------------
function person(o) {
  return {
    sched: [[0, o.spot]], barks: o.barks || [],
    look: o.look, model: o.model, id: o.id, name: o.name, short: o.short, title: o.title,
    greet: o.greet, topics: { FARVEL: o.bye || 'Gå med Utu.', ...o.topics },
  };
}

// Folk du møter på veien. spots: navn på stedene i møteområdet.
export function encounterFolk(kind, seed, x, y) {
  const R = rng(seed);
  const nm = (kin = 'manniska') => pick(R, NAMES[kin]);
  const rumor = () => c => tellAbout(nearbyUnknown(x, y, 2), 'Jeg vet ikke om noe du ikke vet. Veien er veien.');
  if (kind === 'karavane') {
    const n = nm();
    return [
      person({ id: 'w_kjopmann', spot: 'f1', name: n, short: 'en kjøpmann med bred hatt', title: 'kjøpmann på reise',
        look: 'En rund mann med bred filthatt og en pung som er større enn hodet hans. Han har tre vogner og to vakter, og han teller alle tre hele tiden.',
        model: { kin: 'manniska', profession: 'nasare', age: 'medel', clothes: { top: 0x6a2a14, pants: 0x2a2018 } },
        greet: 'God dag, god dag! Handel? Alt er til salgs, unntatt vognene. Og vaktene. Og hatten.',
        topics: { NAVN: `${n}. Kjøpmann. Jeg kjører mellom Pendon og Fristaden to ganger i året.`, JOBB: 'Jeg kjøper billig der det er mye og selger dyrt der det er lite. Det er hele kunsten. [Handel]?', HANDEL: { act: 'w_trade' }, RYKTER: rumor(), VEIEN: 'Kongeveien er trygg nok om dagen. Om natta kommer [stråtrøverne] ned fra åsene.', STRÅTRØVERNE: 'De later som de reparerer en kjerre. Ser du en veltet kjerre og noen som ikke vet hvordan et hjul ser ut, så snu.' },
        barks: ['Handel?', 'Alt er til salgs!'] }),
      person({ id: 'w_vakt1', spot: 'f2', name: nm(), short: 'en vakt med spyd', title: 'karavanevakt',
        look: 'En vakt i lærharnesk som har gått for langt i dag og vet at han skal gå like langt i morgen.',
        model: { kin: 'manniska', profession: 'krigare', age: 'ung', clothes: { top: 0x4a3a28 }, armor: { type: 'lader' }, weapon: 'kortspjut' },
        greet: 'Snakk med sjefen. Jeg bare går her.', topics: { NAVN: 'Spiller ingen rolle.', JOBB: 'Jeg går ved siden av vogna og ser farlig ut. Det er overraskende ofte nok.' }, barks: ['Hold avstand.'] }),
    ];
  }
  if (kind === 'pilegrimer') {
    return [
      person({ id: 'w_pilegrim', spot: 'f1', name: `Bror ${nm()}`, short: 'en pilegrim i gul kappe', title: 'pilegrim på vei til Utus tempel',
        look: 'En mager mann i gul kappe med solskive på staven. Føttene hans er bare og harde som skinn.',
        model: { kin: 'manniska', profession: 'helare', age: 'gammal', clothes: { top: 0xc89a1a, pants: 0x6a5a3a } },
        greet: 'Utu ser deg, vandrer. Han ser alle. Det er hele poenget med en sol.',
        topics: { NAVN: 'Navnet mitt er ikke viktig. Veien er viktig.', JOBB: 'Vi går til Utus tempel i Fristaden, så i Pendon, så hjem igjen. Hvert år. Det er [botsgangen].', BOTSGANGEN: 'Vi går for de som ikke kan. Og for de som ikke vil. Det er flest av dem.', UTU: 'Solen som ser alt og dømmer rettferdig. Kongen kaller seg Solens beskyddare nå. Hm.', MÅLTID: { act: 'w_share' }, RYKTER: rumor() },
        barks: ['Utu ser deg.', 'Lys over veien.'] }),
      person({ id: 'w_pilegrim2', spot: 'f2', name: `Søster ${nm()}`, short: 'en pilegrim med kurv', title: 'pilegrim',
        look: 'En kvinne med en kurv brød og et blikk som teller hvor mange det skal deles på.',
        model: { kin: 'manniska', profession: 'helare', age: 'medel', clothes: { top: 0xd8aa2a } },
        greet: 'Er du sulten? Spør bror. Han deler. Jeg teller.', topics: { NAVN: 'Søster, det holder.', JOBB: 'Jeg bærer brødet og passer på at bror ikke gir bort alt.', MÅLTID: { act: 'w_share' } }, barks: ['Del med oss.'] }),
    ];
  }
  if (kind === 'tornvaktare') {
    return [
      person({ id: 'w_tornridder', spot: 'f1', name: `Riddar ${nm()}`, short: 'en ridder med tornekrans', title: 'av Tornväktarorden',
        look: 'En ridder i hvit våpenkjole over ringbrynje, med en krans av svarte torner malt på skjoldet. Hun har sett orcher før, og det ser du på henne.',
        model: { kin: 'manniska', profession: 'riddare', age: 'medel', clothes: { top: 0xe8e4dc, cape: 0xe8e4dc }, armor: { type: 'ring' }, helmet: { hid: 'oppenhjalm' }, weapon: 'bredsvard' },
        greet: 'Stans. Hvem er du, og hva gjør du så langt oppe?',
        topics: { NAVN: 'Det får holde at jeg er en Tornväktare.', JOBB: 'Vi vokter passene mot [orchene]. Ordenen har tårn og borger langs hele Aidnebergen.', ORCHENE: c => tellAbout(['orchleiren', 'svarta_tornet'], 'De kommer ned fra fjellet hver vår. Vi slår dem tilbake hver sommer. Det har vi gjort i tre hundre år.'), TORNET: c => tellAbout(['svarta_tornet'], 'Svarta Tornet er forseglet. Ingen går inn. Det gjelder deg også.'), RYKTER: rumor() },
        bye: 'Hold deg på veien. Og hold deg unna tårnet.', barks: ['Stans.', 'Ordenen vokter.'] }),
      person({ id: 'w_vapner', spot: 'f2', name: nm(), short: 'en væpner', title: 'væpner i Tornväktarorden',
        look: 'En ung væpner med for stor hjelm og et skjold han ikke har vokst inn i ennå.',
        model: { kin: 'manniska', profession: 'krigare', age: 'ung', clothes: { top: 0xe8e4dc }, armor: { type: 'lader' }, weapon: 'kortsvard' },
        greet: 'Snakk med riddaren. Jeg bærer bare skjoldet hennes.', topics: { NAVN: 'Jeg får et navn når jeg blir slått til ridder.', JOBB: 'Pusse, bære, lytte. Mest lytte.' }, barks: ['Ja, riddar.'] }),
    ];
  }
  if (kind === 'dverger') {
    const n = nm('dvarg');
    return [
      person({ id: 'w_dverg', spot: 'f1', name: `${n} ${pick(R, SURN.dvarg)}`, short: 'en dverg med skjegg til beltet', title: 'handelsdverg fra Karad Batur',
        look: 'En dverg med flettet skjegg, jernbeslått stav og øyne som har regnet ut hva du er verdt før du rakk å hilse.',
        model: { kin: 'dvarg', profession: 'nasare', age: 'gammal', clothes: { top: 0x4a5a6a } },
        greet: 'Hm. Et menneske. Eller noe i den retningen. Går du til [Fristaden]?',
        topics: { NAVN: `${n}. Det andre navnet er for dvergene.`, JOBB: 'Vi bærer jern og stein ned fra [Karad Batur] og korn og øl opp. Handel går gjennom [Fristaden]. Det har den alltid gjort.', 'KARAD BATUR': 'Riket vårt er under fjellet. Porten er stengt for fremmede. Det er ikke personlig. Det er bare sånn.', FRISTADEN: 'Den gang byen var fri, handlet vi med alle. Nå handler vi med fogden. Det er dyrere.', EKSTRA: 'Nei.', HANDEL: { act: 'w_trade' }, RYKTER: rumor() },
        barks: ['Hm.', 'Ikke rør kisten.'] }),
      person({ id: 'w_dverg2', spot: 'f2', name: nm('dvarg'), short: 'en dverg som bærer', title: 'bærer', look: 'En ung dverg med en stang over skulderen og en kiste i den andre enden.',
        model: { kin: 'dvarg', profession: 'krigare', age: 'ung', clothes: { top: 0x6a4a2a } }, greet: 'Ikke snakk til meg. Jeg teller skritt.', topics: { NAVN: 'Fire hundre og tolv. Nei. Nå glemte jeg det.', JOBB: 'Bære. Telle. Bære.' }, barks: ['... fire hundre og tretten ...'] }),
    ];
  }
  if (kind === 'bonde') {
    const n = nm();
    return [person({ id: 'w_bonde', spot: 'f1', name: n, short: 'en bonde med kålkjerre', title: 'kålbonde',
      look: 'En bonde med jord under neglene og en kjerre full av kål. Eselet foran kjerra ser på deg som om du var skyld i alt.',
      model: { kin: 'manniska', profession: 'hantverkare', age: 'medel', clothes: { top: 0x5a6a3a, pants: 0x4a3a28 } },
      greet: 'Kål? Fersk kål. Nesten fersk.',
      topics: { NAVN: `${n}. Fra gården bak åsen.`, JOBB: 'Jeg dyrker kål og selger kål. Eselet drar kål. Vi lever av kål, alle tre.', KÅL: { act: 'w_farm' }, ESELET: 'Han heter Baron. Han vet det selv.', RYKTER: rumor(), VEIEN: 'Hold deg på veien. Utenfor veien er det skog, og i skogen er det ting.' },
      barks: ['Kål!', 'Hysj, Baron.'] })];
  }
  if (kind === 'jeger') {
    const n = nm();
    return [person({ id: 'w_jeger', spot: 'f1', name: n, short: 'en jeger med bue', title: 'jeger',
      look: 'En senete jeger i grønn kappe, med bue over skulderen og tre harer på stanga. Han går lydløst, selv når han står stille.',
      model: { kin: 'manniska', profession: 'jagare', age: 'medel', clothes: { top: 0x3a4a2a } },
      greet: 'Du går som en okse i en kirke. Hørte deg for en time siden.',
      topics: { NAVN: `${n}. Det er nok for skogen.`, JOBB: 'Jeg jakter og selger kjøtt. Tørket kjøtt holder seg på veien. [Proviant]?', PROVIANT: { act: 'w_hunter' }, SPOR: c => tellAbout(nearbyUnknown(x, y, 1, true), 'Det er ulv her, og noe større. Mer vet jeg ikke.'), RYKTER: rumor() },
      barks: ['Stille.', 'Hører du?'] })];
  }
  if (kind === 'kvakkmunk') {
    return [person({ id: 'w_kvakkmunk', spot: 'f1', name: 'Mester Kvakkvald', short: 'en gammel and i munkekappe', title: 'eremitt',
      look: 'En eldgammel and i grå munkekappe, med føttene i kors og gress på hatten. Han puster så sakte at du lurer på om han gjør det.',
      model: { duck: 'flansen' },
      greet: 'Du kom. Jeg har ventet. Eller sovet. Det er ikke så stor forskjell i min alder.',
      topics: { NAVN: 'Kvakkvald. Jeg lærte [Flansen] alt han kan. Han glemte halvparten. Det var den beste halvparten.', JOBB: 'Jeg sitter. Det er vanskeligere enn det ser ut.', FLANSEN: 'Han var en lovende elev. Han spiste for mye brød. Det gjør han vel fortsatt.', LÆR: { act: 'w_munk' }, VEIEN: 'Veien er lang. Det er fordi du går den feil vei rundt.' },
      bye: 'Sitt stille av og til. Det er der kraften er.', barks: ['...', 'Kvakk.'] })];
  }
  return [];
}

// Folk i landsbyene: verten (rom, mat, proviant, rykter), handleren og en bonde eller vakt
function villageFolk(id, p) {
  const R = rng(id.length * 97 + p.x * 31 + p.y);
  const kin = p.folk === 'dverg' ? 'dvarg' : p.folk === 'alv' ? 'alv' : 'manniska';
  const nm = () => pick(R, NAMES[kin]);
  const vert = nm(), hand = nm(), bonde = nm();
  const place = p.name;
  const rumor = () => tellAbout((p.tells || []).filter(t => !known(t)).concat(nearbyUnknown(p.x, p.y, 2, false)).slice(0, 2), `Det skjer ikke stort i ${place}. Det er derfor vi bor her.`);
  return [
    { id: `v_${id}_vert`, name: vert, short: kin === 'dvarg' ? 'en dverg bak disken' : 'en vertinne med forkle', title: `vert i ${place}`,
      look: kin === 'dvarg' ? 'En bred dverg med ølfat under armen og skjegget knyttet opp så det ikke havner i suppa.' : 'En kraftig kvinne med forkle og et blikk som veier deg og pungen din samtidig.',
      model: { kin, profession: 'nasare', age: 'medel', clothes: { top: 0x6a3a2a, pants: 0x3a2a1a } },
      sched: [[0, 'inn_up'], [7, 'inn_bar'], [23, 'inn_up']],
      greet: c => (c.night ? 'Vi har stengt kjøkkenet, men senga er der. [Rom]?' : `Velkommen til ${place}. [Mat], [rom], [proviant] til veien, eller bare [rykter]?`),
      topics: { NAVN: `${vert}. Jeg eier stedet. Banken eier taket.`, JOBB: 'Jeg driver vertshuset. [Rom], [mat] og [proviant]. Og [rykter], som er gratis, men ikke billige.', ROM: { act: 'ed_room' }, MAT: { act: 'ed_meal' }, PROVIANT: { act: 'w_proviant' }, RYKTER: c => rumor(), VEIEN: 'Kongeveien går gjennom her. Hold deg på den, så kommer du fram.', FARVEL: 'Kom tilbake når du er sulten. Det blir du.' },
      barks: ['Varm suppe!', 'Tørk av føttene.'] },
    { id: `v_${id}_hand`, name: hand, short: 'en handelsmann i vest', title: `handelsmann i ${place}`,
      look: 'En tynn mann med blyant bak øret og en vekt på disken som du mistenker ikke viser riktig.',
      model: { kin, profession: 'nasare', age: 'gammal', clothes: { top: 0x2a3a5a } },
      sched: [[0, 'shop_bed'], [8, 'shop_in'], [20, 'shop_bed']], shopHours: [8, 20], closedLine: 'Bua er stengt. Kom tilbake i morgen klokka åtte.',
      greet: 'Se deg om. Rør så lite som mulig.',
      topics: { NAVN: `${hand}. Det står over døra.`, JOBB: 'Jeg selger det folk trenger på veien. [Handel]?', HANDEL: { act: 'w_trade' }, RYKTER: 'Spør vertinna. Hun hører alt. Jeg hører bare penger.' },
      barks: ['Se, ikke rør.'] },
    { id: `v_${id}_bonde`, name: bonde, short: p.big ? 'en byvakt' : 'en bonde', title: p.big ? `byvakt i ${place}` : `bonde i ${place}`,
      look: p.big ? 'En vakt i blå våpenkjole som har gått samme runde i tolv år.' : 'En bonde med rake og solbrent nakke.',
      model: p.big ? { kin, profession: 'krigare', age: 'medel', clothes: { top: 0x1c2a5a }, armor: { type: 'ring' }, helmet: { hid: 'oppenhjalm' }, weapon: 'kortspjut' } : { kin, profession: 'hantverkare', age: 'gammal', clothes: { top: 0x5a6a3a } },
      sched: [[0, 'h1_bed'], [6, 'street_w'], [12, 'inn_t1'], [13, p.big ? 'street_e' : 'field'], [19, 'inn_t2'], [22, 'h1_bed']],
      greet: p.big ? 'Hold deg unna trøbbel, så holder jeg meg unna deg.' : 'God dag. Har du sett eselet mitt?',
      topics: { NAVN: `${bonde}.`, JOBB: p.big ? 'Jeg holder orden. Det er mest å se streng ut.' : 'Jeg pløyer, sår, høster og klager. I den rekkefølgen.', RYKTER: c => rumor() },
      barks: p.big ? ['Hold deg unna trøbbel.'] : ['Fint vær for kål.'] },
  ];
}

// --- terreng i møteområdene -------------------------------------------------------------------
const ARR = {
  south: { x: 22.5, y: 44.2, yaw: PI }, north: { x: 22.5, y: 1.6, yaw: 0 },
  west: { x: 1.6, y: 22.5, yaw: PI / 2 }, east: { x: 44.4, y: 22.5, yaw: -PI / 2 },
};
const EXITS = [
  { x: 22.5, y: 45.5, world: true, label: 'Ut på verdenskartet (sør)' }, { x: 22.5, y: 0.5, world: true, label: 'Ut på verdenskartet (nord)' },
  { x: 0.5, y: 22.5, world: true, label: 'Ut på verdenskartet (vest)' }, { x: 45.5, y: 22.5, world: true, label: 'Ut på verdenskartet (øst)' },
];

function paintTerrain(k, terr, road, R, o = {}) {
  if (terr === '.') {
    k.open(0, 0, 45, 45, GR.GRASS);
    for (let i = 0; i < 7; i++) k.grove(3 + R() * 40, 3 + R() * 40, 2 + R() * 3, 2 + R() * 3, 30 + i);
    k.open(16, 14, 29, 30, GR.GRASS);
  } else if (terr === '^') {
    // lyng og stein: gress i bunnen, flater av berg, åser og steinblokker
    k.open(0, 0, 45, 45, GR.GRASS);
    for (let i = 0; i < 6; i++) { const x = Math.floor(2 + R() * 38), y = Math.floor(2 + R() * 38); k.rect(x, y, x + 2 + Math.floor(R() * 4), y + 2 + Math.floor(R() * 3), FLOOR, GR.FLAG); }
    for (let i = 0; i < 5; i++) {
      const left = i % 2 === 0;
      k.hill(left ? 4 + R() * 9 : 32 + R() * 9, 4 + i * 9 + R() * 3, 3 + R() * 2.5, { h: 2.4 + R() * 2.2 });
    }
    for (let i = 0; i < 40; i++) { const x = Math.floor(R() * 46), y = Math.floor(R() * 46); if (Math.abs(x - 22.5) > 6) k.rock(x, y); }
    k.grove(40, 40, 3, 3, 41); k.grove(5, 40, 3, 2.5, 42);
  } else {
    // skog: alt starter som skog, med en glenne i midten
    k.glade(22.5, 21, 9, 7, GR.GRASS, 3);
    k.glade(14 + R() * 6, 34, 4, 3, GR.GRASS, 4);
    k.glade(28 + R() * 6, 10, 4, 3, GR.GRASS, 5);
  }
  if (o.coast) { k.deep(38, 0, 45, 45); k.water(35, 0, 37, 45); }
  // veien eller tråkket gjennom
  const g = road ? GR.DIRT : GR.GRASS;
  k.road([[22.5, 47], [22.5, 34], [24, 24], [21.5, 14], [22.5, -1]], road ? 2.2 : 1.4, g);
  if (!o.coast) k.road([[-1, 22.5], [10, 22], [20, 21.5]], 1.3, GR.GRASS);
  k.road([[25, 21.5], [36, 23], [47, 22.5]], 1.3, GR.GRASS);
}

function scatter(R, cx, cy, n, r0, r1) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * PI * 2 + R() * 0.6, r = r0 + R() * (r1 - r0);
    out.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  return out;
}

// Et møte. enc: fra ENCOUNTERS. o: { x, y, terr, road, seed, ambush, depth }
export function encounterLayout(enc, o) {
  const R = rng(o.seed);
  const reg = regionAt(o.x, o.y);
  const terr = o.terr;
  const props = [], spawns = [], spots = {};
  const cx = 22.5, cy = enc.camp ? 18 : 19;
  if (enc.camp) props.push({ t: 'fire', x: cx, y: cy, lit: true, size: 0.5 }, { t: 'stump', x: cx - 1.6, y: cy + 0.8 }, { t: 'bones', x: cx + 2.2, y: cy - 1.4 });
  if (enc.id === 'rovere') props.push({ t: 'cart', x: 23.8, y: 24.2, rot: 1.1 }, { t: 'crate', x: 21.4, y: 25.4 });
  if (enc.id === 'karavane') props.push({ t: 'cart', x: 24.6, y: 22.5, rot: 0.1 }, { t: 'cart', x: 24.8, y: 27.4, rot: 0.1 }, { t: 'horse', x: 24.8, y: 19.6, rot: PI, col: 0x7a5232 }, { t: 'crate', x: 20.8, y: 23.2 }, { t: 'barrel', x: 20.6, y: 24.1 });
  if (enc.id === 'bonde') props.push({ t: 'cart', x: 24.2, y: 21.2, rot: 0.2 }, { t: 'horse', x: 24.4, y: 18.6, rot: PI, col: 0x6a6a6a });
  if (enc.id === 'dverger') props.push({ t: 'chest', x: 23.6, y: 20.4, rot: 0.4 });
  if (enc.id === 'pilegrimer' || enc.id === 'kvakkmunk') props.push({ t: 'stump', x: 21.2, y: 20.2 });
  if (enc.kind === 'fiende') {
    let i = 0;
    for (const [type, a, b] of enc.mobs) {
      const n = a + Math.floor(R() * (b - a + 1));
      const pts = o.ambush ? scatter(R, 22.5, 38, n, 5, 8) : scatter(R, cx, cy, n, enc.camp ? 2.2 : 1.5, enc.camp ? 4 : 4.5);
      for (const [x, y] of pts) spawns.push({ type, x: Math.max(3, Math.min(42.5, x)), y: Math.max(3, Math.min(42.5, y)), id: `m${i++}`, depth: o.depth, alert: !!o.ambush });
    }
  } else {
    spots.f1 = { x: 22.0, y: 20.4, yaw: PI * 0.1 };
    spots.f2 = { x: 23.6, y: 21.2, yaw: -PI * 0.2, wander: 1.2 };
    spots.f3 = { x: 21.0, y: 21.8, yaw: PI * 0.3 };
  }
  const tn = TERR_NAME[terr] || 'slette';
  const name = enc.kind === 'spesiell' ? 'Et rart møte' : `${tn[0].toUpperCase() + tn.slice(1)}${o.road ? ' ved veien' : ''}`;
  return {
    id: '_mote', name, region: reg.name, sub: `${tn} i ${reg.name}`, seed: o.seed % 1000, peaceful: enc.kind !== 'fiende',
    spruce: terr === '^' ? 0.75 : terr === 'F' ? 0.5 : 0.3, lootDepth: o.depth, music: 'explore', open: terr !== 'F', defaultArrival: 'south',
    peaceText: 'Du trekker ikke våpen mot folk som ikke har gjort deg noe.',
    arrivals: ARR, exits: EXITS, props, spots, spawns, enc: enc.id,
    paint(k) { paintTerrain(k, terr, o.road, rng(o.seed + 7)); },
    people: enc.kind === 'fiende' ? [] : encounterFolk(enc.folk, o.seed, o.x, o.y),
    intro: enc.fight,
  };
}

// --- landsbyene -----------------------------------------------------------------------------
export function villageLayout(id) {
  const p = PLACES[id];
  const R = rng(id.length * 131 + p.x);
  const pre = 'v' + id.slice(0, 4) + '_';
  const plaster = [0xe6d6b2, 0xd8ccb0, 0xe0d0aa, 0xd4c8a8][Math.floor(R() * 4)];
  const buildings = [
    { id: pre + 'inn', name: 'Vertshuset', sub: 'värdshus', x0: 12, y0: 14, x1: 19, y1: 20, doors: [[15, 20]], floor: GR.WOOD, style: 'timber', wallH: 4.2, roof: 'tile', plaster, chimney: [13.0, 17.2], shutter: [0.56, 0.24, 0.14] },
    { id: pre + 'shop', name: 'Handelsboden', sub: 'handelsbod', x0: 25, y0: 15, x1: 30, y1: 20, doors: [[27, 20]], floor: GR.WOOD, style: 'timber', wallH: 3.0, roof: 'shingle', plaster: 0xd8ccb0, chimney: [29.6, 16.0], shutter: [0.3, 0.38, 0.26] },
    { id: pre + 'h1', name: 'Et hus', sub: 'hus', x0: 13, y0: 26, x1: 17, y1: 30, doors: [[15, 26]], floor: GR.WOOD, style: 'timber', wallH: 2.7, roof: 'thatch', plaster: 0xcfc2a2, chimney: [13.9, 28.6], shutter: [0.36, 0.42, 0.24] },
    { id: pre + 'h2', name: 'Et hus', sub: 'hus', x0: 27, y0: 26, x1: 31, y1: 30, doors: [[29, 26]], floor: GR.WOOD, style: 'timber', wallH: 2.7, roof: 'thatch', plaster: 0xd6caa8, chimney: [27.9, 28.6], shutter: [0.42, 0.24, 0.16] },
  ];
  if (p.big || p.size !== 'liten') {
    buildings.push(
      { id: pre + 'h3', name: 'Et hus', sub: 'hus', x0: 4, y0: 15, x1: 8, y1: 19, doors: [[6, 19]], floor: GR.WOOD, style: 'stone', wallH: 3.0, roof: 'slate', chimney: [4.9, 15.8], shutter: [0.5, 0.36, 0.2] },
      { id: pre + 'h4', name: 'Et hus', sub: 'hus', x0: 36, y0: 15, x1: 41, y1: 20, doors: [[38, 20]], floor: GR.WOOD, style: 'timber', wallH: 3.2, roof: 'tile', plaster, chimney: [40.4, 16.2], shutter: [0.62, 0.14, 0.12] },
      { id: pre + 'h5', name: 'Et hus', sub: 'hus', x0: 4, y0: 26, x1: 8, y1: 30, doors: [[6, 26]], floor: GR.WOOD, style: 'timber', wallH: 2.8, roof: 'thatch', plaster: 0xd2c6a6, chimney: [7.4, 29.4], shutter: [0.3, 0.42, 0.5] },
    );
  }
  const props = [
    { t: 'well', x: 22.5, y: 24.6 },
    { t: 'barrel', x: 11.4, y: 21.0 }, { t: 'barrel', x: 11.4, y: 21.8 }, { t: 'crate', x: 24.4, y: 21.2 },
    { t: 'cart', x: 33.6, y: 24.6, rot: 1.2 }, { t: 'hay', x: 34.6, y: 31.2 }, { t: 'woodpile', x: 18.6, y: 27.6 },
    { t: 'post', x: 42.6, y: 21.0, text: p.name.toUpperCase(), sub: p.sub, rot: 0.2 },
  ];
  if (p.coast) props.push({ t: 'boat', x: 41.6, y: 38.6, rot: 1.2 }, { t: 'net', x: 38.4, y: 38.0 });
  return {
    id: 'by_' + id, name: p.name, region: regionAt(p.x, p.y).name, sub: p.sub, seed: 40 + id.length, peaceful: true, spruce: 0.3, music: 'town', open: true,
    intro: `${p.name}, ${p.sub}. Vertshuset er det største huset ved veien, og handelsboden ligger rett over gata.`,
    peaceText: `Dette er ${p.name}. Folk her bærer ikke våpen på gata, og det gjør ikke du heller.`,
    defaultArrival: 'west', arrivals: ARR, exits: EXITS.slice(2),
    paint(k) {
      k.open(0, 0, 45, 45, GR.GRASS);
      k.grove(4, 6, 4, 3.5, 21); k.grove(40, 6, 4.5, 3.5, 22); k.grove(4, 41, 4, 3.5, 23);
      k.road([[-1, 22.5], [47, 22.5]], 2.4);
      k.rect(18, 21, 27, 24, FLOOR, GR.COBBLE);
      k.road([[15, 21], [15, 22]], 1.4); k.road([[27, 21], [27, 22]], 1.4);
      k.road([[15, 24], [15, 25]], 1.4); k.road([[29, 24], [29, 25]], 1.4);
      k.field(33, 32, 42, 40, 'korn'); k.field(18, 34, 27, 41, 'kal');
      if (p.coast) { k.deep(0, 43, 45, 45); k.water(30, 41, 45, 42); }
    },
    buildings, fences: [[[32, 31], [43, 31]], [[32, 31], [32, 41]], [[43, 31], [43, 41]]], gaps: [[37, 31]],
    signs: [[pre + 'inn', 'VÄRDSHUS', p.name], [pre + 'shop', 'HANDEL', '']],
    lamps: [[11.6, 22.0], [20.0, 20.6], [25.0, 20.6], [32.4, 21.0], [22.5, 26.4]],
    props, trees: [[10, 24.6], [34.4, 26.4, 's'], [20.4, 31.6]],
    furnish({ W, table, bench, bed, shelf, hearth, F, U }, A) {
      // vertshuset
      W(13.2, 15.55, 16.6, 15.9, 0, 1.05, [0.5, 0.34, 0.22]);
      W(13.15, 15.5, 16.65, 15.95, 1.05, 1.12, [0.42, 0.28, 0.18], false);
      shelf(13.0, 14.62, 16.6, 14.85, 2.0, true);
      hearth(12.62, 16.6, 13.05, 17.8, 13.25, 17.2);
      table(16.0, 17.8, 1.1, 0.55); bench(16.0, 17.18, 1.1, 0.2); bench(16.0, 18.42, 1.1, 0.2);
      table(18.0, 16.2, 0.9, 0.5); bench(18.0, 15.65, 0.9, 0.2); bench(18.0, 16.75, 0.9, 0.2);
      for (const x of [17.4, 18.0]) A.barrel(U(x), U(19.7), 0.8);
      // handelsboden
      W(25.6, 17.55, 28.4, 17.9, 0, 1.0, [0.46, 0.32, 0.2]);
      shelf(25.62, 15.6, 29.4, 15.86, 1.8, true);
      bed(29.0, 18.6, 29.8, 19.9, [0.4, 0.4, 0.3]);
      for (const [x, z] of [[26.0, 19.4], [26.6, 19.5]]) A.sack(U(x), U(z), false);
      // husene
      hearth(13.62, 27.6, 14.05, 28.8, 14.25, 28.2); bed(15.8, 28.6, 16.6, 29.9, [0.5, 0.36, 0.22]); table(14.8, 27.5, 0.8, 0.5);
      hearth(27.62, 27.6, 28.05, 28.8, 28.25, 28.2); bed(29.8, 28.6, 30.6, 29.9, [0.32, 0.4, 0.5]); table(28.8, 27.5, 0.8, 0.5);
    },
    spots: {
      inn_bar: { x: 14.8, y: 15.15, yaw: 0 },
      inn_t1: { x: 16.0, y: 17.16, yaw: 0, sit: true }, inn_t2: { x: 16.0, y: 18.44, yaw: PI, sit: true },
      inn_t3: { x: 18.0, y: 15.63, yaw: 0, sit: true }, inn_t4: { x: 18.0, y: 16.77, yaw: PI, sit: true },
      inn_up: { x: 13.6, y: 19.6, yaw: 0, upstairs: true }, inn_door: { x: 15.5, y: 21.6, yaw: 0, wander: 1.5 },
      shop_in: { x: 27.0, y: 16.8, yaw: 0 }, shop_bed: { x: 29.4, y: 19.2, yaw: 0, sleep: true, lie: 'z' },
      h1_in: { x: 15.2, y: 27.4, yaw: PI }, h1_bed: { x: 16.2, y: 29.3, yaw: 0, sleep: true, lie: 'z' },
      h2_in: { x: 29.2, y: 27.4, yaw: PI }, h2_bed: { x: 30.2, y: 29.3, yaw: 0, sleep: true, lie: 'z' },
      street_w: { x: 8.0, y: 22.8, wander: 2 }, street_c: { x: 22.5, y: 22.4, wander: 2 }, street_e: { x: 36.0, y: 22.8, wander: 2 },
      field: { x: 37.0, y: 35.5, yaw: 0, wander: 1.5, work: 'dig' },
    },
    people: villageFolk(id, p), place: id,
  };
}

// --- stedene du finner -----------------------------------------------------------------------
export function siteLayout(id, cleared, depth) {
  const p = PLACES[id];
  const R = rng(id.length * 211 + p.y);
  const props = [], spawns = [];
  let terr = '.', coast = false, intro = '';
  const add = (type, x, y, n = 1, r = 2) => {
    if (cleared) return;
    const pts = n === 1 ? [[x, y]] : scatter(R, x, y, n, r * 0.4, r);
    for (const [px, py] of pts) spawns.push({ type, x: px, y: py, id: 's' + spawns.length, depth });
  };
  const night = h => h >= 21 || h < 5;
  if (p.site === 'gravhaug') {
    terr = '.';
    intro = 'En gravhaug med steinring. Gresset er dødt der skyggene faller, og lufta er kald selv i solskinn.';
    for (let i = 0; i < 9; i++) { const a = (i / 9) * PI * 2; props.push({ t: 'rock', x: 22.5 + Math.cos(a) * 8, y: 17 + Math.sin(a) * 7, s: 1.3 }); }
    props.push({ t: 'bones', x: 20.6, y: 22.6 }, { t: 'bones', x: 25.8, y: 21.0 });
    add('skeleton', 22.5, 18, 3, 4);
  } else if (p.site === 'orchleir') {
    terr = 'F';
    intro = 'Orchleiren. Røyk, skinn som tørker på stokker, og lukten av noe som ble kokt for lenge siden.';
    props.push({ t: 'fire', x: 22.5, y: 19, lit: true, size: 0.6, spit: true }, { t: 'tent', x: 18.4, y: 16.4, face: 0.4, len: 2.2, w: 1.6, h: 2.0, col: [0.42, 0.34, 0.24] },
      { t: 'tent', x: 26.8, y: 16.0, face: -0.5, len: 2.2, w: 1.6, h: 2.0, col: [0.32, 0.26, 0.2] }, { t: 'skullpole', x: 22.5, y: 13.6 }, { t: 'bones', x: 24.6, y: 21.4 }, { t: 'woodpile', x: 19.6, y: 22.0 });
    add('orc_band', 22.5, 19, 4, 4); add('orc_lead', 22.5, 16.4); add('orc_xbow', 22.5, 14.8, 2, 3);
  } else if (p.site === 'tarn') {
    terr = '^';
    intro = 'Svarta Tornet. Svart stein mot grå himmel, og en port med Tornväktarnas segl over. Seglet er brutt. Noen har vært her.';
    props.push({ t: 'ruin', x: 22.5, y: 13.5, w: 6.5, d: 6.5 }, { t: 'skullpole', x: 18.6, y: 19.4 }, { t: 'skullpole', x: 26.4, y: 19.4 }, { t: 'fire', x: 22.5, y: 21.8, lit: true, size: 0.45 }, { t: 'banner', x: 22.5, y: 17.6, kind: 'lekh', h: 3.2 });
    add('orc_band', 22.5, 21.6, 3, 3.5); add('orc_elite', 22.5, 18.6); add('goblin', 22.5, 26, 3, 4);
  } else if (p.site === 'vrak') {
    terr = '.'; coast = true;
    intro = 'En kogg ligger på siden i strandkanten, med masten brukket og lasten spredt utover sanden. Noe beveger seg inne i skroget.';
    props.push({ t: 'ruin', x: 31.0, y: 21.0, w: 5.5, d: 2.6 }, { t: 'boat', x: 28.0, y: 27.6, rot: 0.6 }, { t: 'net', x: 26.0, y: 18.4 },
      { t: 'crate', x: 27.4, y: 23.6 }, { t: 'crate', x: 25.6, y: 25.0, s: 0.7 }, { t: 'barrel', x: 28.6, y: 25.2 }, { t: 'barrel', x: 24.4, y: 21.8 });
    add('rat', 28.0, 22.0, 5, 3); add('skeleton', 30.4, 20.6);
  }
  void night;
  return {
    id: 'sted_' + id, name: p.name, region: regionAt(p.x, p.y).name, sub: p.sub, seed: 70 + id.length, peaceful: false, spruce: terr === '^' ? 0.75 : 0.45, lootDepth: depth, music: 'explore', open: terr !== 'F',
    defaultArrival: 'south', arrivals: ARR, exits: coast ? [EXITS[0], EXITS[1], EXITS[2]] : EXITS, props, spawns, spots: {},
    paint(k) { paintTerrain(k, terr, false, rng(id.length * 7), { coast }); },
    people: [], place: id, site: p.site, intro: cleared ? `${p.name}. Det er stille her nå.` : intro,
    // når alle er borte, ligger det noe igjen (løsningen er i arealife.js)
    reward: cleared ? null : { depth: depth + 1, silver: 60 + Math.floor(R() * 120), at: p.site === 'vrak' ? [27.4, 23.0] : [22.5, 19.5] },
  };
}

// En stille rute uten møte og uten sted: du stopper og ser deg om. o: { x, y, terr, road, seed }
export function wildLayout(o) {
  const reg = regionAt(o.x, o.y);
  const R = rng(o.seed);
  const tn = TERR_NAME[o.terr] || 'slette';
  const props = [];
  // noen har rastet her før deg
  if (R() < 0.5) props.push({ t: 'fire', x: 21.0, y: 24.0, lit: false, size: 0.4 }, { t: 'stump', x: 19.8, y: 24.6 });
  if (o.terr === '^') props.push({ t: 'rock', x: 26.0, y: 20.0, s: 1.4 }, { t: 'rock', x: 18.4, y: 17.2, s: 1.1 });
  if (R() < 0.3) props.push({ t: 'bones', x: 25.4, y: 26.8 });
  const lines = {
    '.': 'Gress så langt du ser, og vind i det. En lerke et sted over deg.',
    F: 'Høye trær og stille luft. Det knaker i greinene når vinden tar tak oppe i kronene.',
    '^': 'Stein og lyng, og et kaldt gufs fra snøen lenger oppe.',
  };
  return {
    id: '_vill', name: `${tn[0].toUpperCase() + tn.slice(1)}${o.road ? ' ved veien' : ''}`, region: reg.name, sub: `${tn} i ${reg.name}`, seed: o.seed % 1000, peaceful: false,
    spruce: o.terr === '^' ? 0.75 : o.terr === 'F' ? 0.5 : 0.3, lootDepth: reg.danger, music: 'explore', open: o.terr !== 'F', defaultArrival: 'south',
    arrivals: ARR, exits: EXITS, props, spots: {}, spawns: [], people: [], wild: true,
    paint(k) { paintTerrain(k, o.terr, o.road, rng(o.seed + 7)); },
    intro: `${lines[o.terr] || lines['.']} ${reg.name}.`,
  };
}

export { ENCOUNTERS, ate };
