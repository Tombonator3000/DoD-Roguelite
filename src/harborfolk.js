// Nye folk i havnekvarterene er spillets egne, ikke navngitte personer fra bøkene.
import { G } from './state.js';
import { performQuest, tickCampaign } from './campaign-runtime.js';
import { questEntries } from './quests.js';
import { formatDuration } from './journeytime.js';

const q = () => { tickCampaign(); return G.campaign?.quests.havnelisten; };
const act = (action, actor) => { const r = performQuest('havnelisten', action, actor); return r.ok ? r.message : r.why; };

function status() {
  q();
  const entry = G.campaign && questEntries(G.campaign).find(e => e.id === 'havnelisten');
  return entry ? `${entry.text}${entry.hours != null ? ` Du har ${formatDuration(entry.hours)} igjen.` : ''}` : 'Ragna ved havnekontoret i Arno trenger en som kan bære en liste til Gringul.';
}

export function harborFolk(place, people) {
  if (!['arno', 'gringul'].includes(place)) return people;
  const arno = place === 'arno', id = arno ? 'arno_ragna' : 'gringul_tova';
  const name = arno ? 'Ragna Blekkfinger' : 'Tova Ankarsdotter';
  people[0].name = arno ? 'Selma' : 'Maren';
  people[0].topics.NAVN = `${people[0].name}. Jeg driver vertshuset.`;
  people[0].topics.OPPDRAG = () => status();
  people[0].topics.RYKTER = () => arno ? 'Ragna fører havnas lister. Hun trenger en budbringer. Spør henne om [oppdraget|OPPDRAG]. Du finner henne på [havnekontoret|KONTORET] om dagen.' : 'Tova tar imot havnelistene fra Arno. Hun arbeider på [havnekontoret|KONTORET].';
  people[0].topics.KONTORET = 'Huset rett sør for vertshuset, på andre siden av veien. De arbeider fra sju til tolv og fra ett til seks. Ved middag og om kvelden er de her.';
  people[2].name = arno ? 'Ivar Bryggevakt' : 'Serak';
  people[2].topics.NAVN = `${people[2].name}. Jeg holder orden i havna.`;
  people[2].sched = people[2].sched.map(([hour, spot]) => [hour, spot === 'h1_bed' ? 'h2_bed' : spot]);
  people[2].greet = () => {
    const quest = q();
    if (quest?.state === 'done') return quest.flags.brutt ? 'Ragna har hørt om seglet. Her i havna holder vi avtalene våre.' : 'Du holdt ord om havnelisten. Det har folk lagt merke til.';
    if (!arno && G.campaign?.people.gringul_tova?.memories.liste_mottatt) return quest?.flags.brutt ? 'Tova sier at listen kom fram åpnet. Hender som dine bør holdes unna andres segl.' : 'Tova fikk listen. Nå skylder Ragna deg betaling. Arno ligger fire seildøgn unna.';
    if (arno && quest?.state === 'failed') return 'Ragna ventet forgjeves. Avtaler har en frist av en grunn.';
    return arno ? 'Hold magien for deg selv. Havna trenger pålitelige folk. Ragna ved havnekontoret har [arbeid|OPPDRAG].' : 'Hold hendene unna andres last. Har du en [havneliste|OPPDRAG], spør Tova.';
  };
  people[2].topics.OPPDRAG = () => status();
  return [...people, {
    id, name, short: arno ? 'en havneskriver med blekk på fingrene' : 'en lagerforvalter med nøkkelknippe', title: arno ? 'havneskriver i Arno' : 'lagerforvalter i Gringul',
    look: arno ? 'En kvinne med svarte fingertupper og et skrivebrett hun aldri legger fra seg.' : 'En kvinne med nøklene på innsiden av beltet. Hun teller segl før hun teller kasser.',
    model: { kin: 'manniska', profession: 'nasare', age: 'medel', clothes: { top: arno ? 0x31585c : 0x8b5030, pants: 0x302a24 } },
    sched: [[0, 'h1_bed'], [7, 'h1_in'], [12, 'inn_guest'], [13, 'h1_in'], [18, 'inn_guest'], [22, 'h1_bed']],
    greet: () => {
      const quest = q();
      if (arno) return quest?.state === 'done' ? (quest.flags.brutt ? 'Du kom fram, men seglet var brutt. Det glemmer jeg ikke.' : 'Du holdt ord. Det betyr noe her i havna.')
        : quest?.state === 'failed' ? 'Du lot [fristen|OPPDRAG] gå ut. Jeg må finne en annen budbringer.'
        : quest?.stage === 'arno' ? 'Du er tilbake. Har du [kvitteringen|KVITTERING] fra Tova?'
        : quest ? 'Hvordan går det med [havnelisten|OPPDRAG]?' : 'Jeg trenger en budbringer til Gringul. Vil du høre om [oppdraget|OPPDRAG]?';
      return quest?.stage === 'gringul' && quest.state === 'active' ? 'Ragnas budbringer? [Lever listen|LEVER], så får du en kvittering.'
        : G.campaign?.people[id]?.memories.liste_mottatt ? 'Listen er mottatt. Ta kvitteringen til Ragna i Arno.' : 'Jeg tar imot last og havnelister. Kommer du fra [Ragna|OPPDRAG]?';
    },
    topics: {
      NAVN: `${name}.`, JOBB: arno ? 'Jeg fører havnas regnskap. Last må stemme med listen. Det er lettere sagt enn gjort. [Oppdrag]? Her handler alt om [tillit].' : 'Jeg kontrollerer lasta fra Arno og gir skipperne kvittering. Ragna skriver pent. Skipperne gjør det ikke. [Tillit] er viktig.',
      OPPDRAG: () => arno && !q() ? 'Hent den forseglede listen i [kisten|KISTEN] ved handelsboden. Lever den til Tova i Gringul og kom tilbake med kvitteringen innen tolv døgn. Åtti silver med helt segl, tjue hvis det er brutt. Skipet bruker fire døgn hver vei. Vil du [ta oppdraget|JA] eller [la være|NEI]?' : status(),
      JA: () => arno ? act('accept', id) : 'Avtalen inngår du med Ragna i Arno.',
      NEI: 'Da lar vi det ligge.',
      LEVER: () => act('lever', id), KVITTERING: () => act('kvittering', id),
      KISTEN: 'Kisten står utenfor handelsboden, rett nord for veien. Hent listen etter at du har sagt ja.',
      TILLIT: () => { const n = G.campaign?.people[id]?.relation || 0; return n > 0 ? 'Du har holdt ord. Folk som deg får lettere hjelp her.' : n < 0 ? 'Et brutt løfte sitter lenge.' : 'Vi kjenner ikke hverandre godt nok ennå.'; },
      FARVEL: 'God ferd. Pass på fristen.',
    }, barks: arno ? ['Listen skal stemme.', 'Helt segl, takk.'] : ['En kasse av gangen.', 'Hvor er kvitteringen?'],
  }];
}
