import { EREB_MAP, REGION_GEO } from './geography.js';
// Ereb og landene utenfor. Navn og relative plasseringer: Kampanjboken 1989,
// PDF s. 10-14 og 59-64, samt det store Ereb-kartet i Toms kildebibliotek.
// Markørene følger originalkartet. Regionkartene er fortsatt egne lokale oppsett.
export const ATLAS_SOURCES = {
  kampanj: 'https://kingafw.no/Drakar/boker/3e37a844129d/les-hele-boka.html',
  spelare: 'https://kingafw.no/Drakar/boker/a3c541529260/les-hele-boka.html',
  spelledare: 'https://kingafw.no/Drakar/boker/5d1c66369cd1/les-hele-boka.html',
  karta: 'https://kingafw.no/Drakar/boker/ae66767c8db9/les-hele-boka.html',
  ivanhoe: 'https://kingafw.no/Drakar/boker/668ce1cb305c/les-hele-boka.html',
  trakorien: 'https://kingafw.no/Drakar/boker/3605eb62c335/les-hele-boka.html',
  krilloan: 'https://kingafw.no/Drakar/boker/35697e393a6b/les-hele-boka.html',
  kapare: 'https://kingafw.no/Drakar/boker/f58270b411fc/les-hele-boka.html',
  aventyr: 'https://kingafw.no/Drakar/boker/b2dbaa795638/les-hele-boka.html',
};

// x/y er prosent i atlaset, mot øst/sør. sourcePage er PDF-siden i Kampanjboken.
// Samfunnsbeskrivelsene er korte egne sammendrag. Nye leirer og folk er våre egne.
const defs = [
  ['aidne', 'Aidne', 29, 67, 'temperert', 'fastland', 1, 'Fristaden og havnene i Zorakin og Kardunien. Dvergenes fjell, gamle skoger og kongeveier.', 'Kongeveien fører mot Tyndal og Edelfara. Ved kysten finner du skip videre ut på Kopparhavet.', 61],
  ['trakorien', 'Trakorien', 14, 29, 'temperert', 'oyer', 2, 'Øyrike med handel, sjøfart og motstridende trosretninger.', 'Tricilve samler handelsfolk fra øyene og fastlandet. Det går an å selge det meste der, men kjøperne kjenner varenes verdi.', 40],
  ['marjura', 'Marjura', 17, 18, 'kaldt', 'oy', 3, 'Den kalde øya nordvest for fastlandet, kjent fra fortellingene om svovel og Krau-Ki.', 'Sjøfolkene snakker lavt om Krau-Ki. Reisefølgene holder seg ved kysten til de har skaffet en veiviser.', 14],
  ['mereld', 'Mereld', 8, 51, 'temperert', 'oy', 2, 'Øyene mot Västerhavet, vest for Magilre.', 'Fiskere og små handelsskuter kjenner farvannene mellom øyene. Spør etter farleden ved sundet.', 61],
  ['bzegusta', 'Bzegusta', 16, 47, 'temperert', 'oy', 1, 'Øya ved innseilingen til Magilres kyster.', 'En kortere sjøetappe fører videre til handelsbyene på fastlandet.', 61],
  ['magilre', 'Magilre', 24, 45, 'temperert', 'kyst', 1, 'Vestlig handelsrike ved bergenes fot, med Mercana som stor havneby.', 'Handel mellom øst og vest passerer Mercana. Veiene innenlands møter skog og bratte fjell.', 40],
  ['klomellien', 'Klomellien', 32, 51, 'temperert', 'kyst', 2, 'Elveland og bystater, der Staden O er et knutepunkt for handelen.', 'På elvene er et varebrev nesten like viktig som lasten. Det er ikke alle bystatene som stoler på naboene.', 40],
  ['kasenu', 'Kasenu', 31, 58, 'skog', 'fastland', 2, 'Skoglandet mellom Aidne, Klomellien og Magilre.', 'Gamle tråkk knytter skogene til handelsveiene. Spør reisefølgene hvilke stier de bruker.', 61],
  ['goiana', 'Goiana', 25, 59, 'skog', 'fastland', 2, 'Skoger nord for Aidnes bygder.', 'Det går veier videre fra Lofhelm, men i skogene er ikke alle stier handelsveier.', 61],
  ['jorpagna', 'Jorpagna', 45, 62, 'temperert', 'kyst', 2, 'Et gammelt keiserrikes land, med Jorgund ved kysthandelen.', 'Det gamle riket er borte, men navn, veier og ruiner lever videre.', 8],
  ['ljusna', 'Ljusna', 34, 40, 'skog', 'fastland', 2, 'Landet sør for Ransard, ved de nordvestlige innlandsveiene.', 'Fra leiren går stiene videre mot Mirel og havnene i vest.', 61],
  ['mirel', 'Mirel', 39, 45, 'skog', 'fastland', 2, 'Innland ved Mefamirs sjø, mellom vestkysten og Nargurs skoger.', 'Å nå fram betyr å velge pass og veier med omhu. Samle proviant før du går videre mot nord.', 61],
  ['ransard', 'Ransard', 36, 33, 'kaldt', 'kyst', 3, 'Krigersamfunn i nordvest. Kapahlt er rikets hovedstad.', 'Griprytterne og klanenes feider gjør et godt følge verdifullt. En fremmed bør vite hvem som tar imot ham.', 22],
  ['jorduashur', 'Jorduashur', 37, 17, 'kaldt', 'kyst', 2, 'Jarledømmer, lange fjorder og nordlige skoger. Halle er en viktig havn.', 'Sjøveien knytter bygdene sammen når innlandsveiene er tunge å gå.', 40],
  ['palinor', 'Palinor', 43, 39, 'kaldt', 'fastland', 3, 'Nordlig innland mellom Ransard og Nargurs skoger.', 'Reisefølget må klare seg langt mellom trygge steder. Søk ly og mat før kvelden faller.', 61],
  ['nargur', 'Nargur', 52, 39, 'skog', 'fastland', 3, 'De store skogene i det indre Ereb.', 'Tømmer fra skogene føres til Mastika Agga. Inne mellom trærne er avstanden mellom folk stor.', 40],
  ['barbia', 'Barbia', 56, 28, 'kaldt', 'kyst', 2, 'Nordlig rike med Mastika Agga som stor utskipningshavn.', 'Handelen her knytter Nargurs skoger til Cereval, Akrogal og sjøveiene vestover.', 40],
  ['cereval', 'Cereval', 63, 39, 'kaldt', 'kyst', 3, 'Det østlige landet med Cerevallis, drakmästare og månsilver.', 'Månsilverets egenskaper er knyttet til landet. Ryktene om det får stadig nye reisende til å prøve lykken.', 61],
  ['torshem', 'Torshem', 53, 50, 'skog', 'fastland', 3, 'Skog- og fjellbygder mellom Nargur og de sørlige landene.', 'Gjennom dalene går handelsstier. Veiviserne vet hvor de møter fjellpassene.', 61],
  ['landori', 'Landori', 52, 57, 'skog', 'fastland', 2, 'Skoglandet sør for Torshem og nord for Berendien.', 'Stiene fører videre til kystbyene og de gamle jorpagniske veiene.', 61],
  ['berendien', 'Berendien', 54, 66, 'temperert', 'kyst', 2, 'Riket ved kysten mellom Jorpagna og Hynsolge.', 'Varer, leiesoldater og rykter følger veiene mellom de sørøstlige landene.', 61],
  ['felicien', 'Felicien', 58, 77, 'varmt', 'oyer', 3, 'Øyene ved Kopparhavets østlige trader. Tyros er en av havnene i reisetabellen.', 'Pirateri og flåtekrig setter handelen under press. Skipene trenger mer enn gode seil.', 22],
  ['hynsolge', 'Hynsolge', 63, 63, 'temperert', 'kyst', 3, 'Landet med Fervidun, Gråborg og strid mellom adel og byfolk.', 'En reisende bør høre mer enn én side av en sak. De samme hendelsene fortelles forskjellig bak borgmurer og ved markedet.', 61],
  ['grynnerbergen', 'Grynnerbergen', 59, 56, 'fjell', 'fastland', 3, 'Fjellkjeden mellom skogene i nord og Hynsolge.', 'Dvergenes gamle kultur hører hjemme i fjellene. Spør etter sporene deres i passene.', 5],
  ['nidland', 'Nidland', 69, 57, 'fjell', 'kyst', 4, 'Vicotniks stat ved Demontungan. Khaanikel er en av sjøtabellens havner.', 'Grensevakter, murer og mistanke gjør en tur inn i landet farlig. En havn er ikke et løfte om trygg ferdsel.', 23],
  ['krun', 'Krun', 71, 72, 'varmt', 'kyst', 3, 'Det sørøstlige landet ved Raas Narram og havnebyen Stabul.', 'Stabul er et handelsknutepunkt nedenfor fallene. Du kan ikke seile opp fossen til Golwyndas sötvattenshav.', 40],
  ['samkarna', 'Samkarna', 26, 93, 'tropisk', 'kyst', 3, 'Kontinenten sørvest for Ereb. Her ligger Melukha og Morélvidyns kyster.', 'Regn, våtmarker og Drakryggens fjell preger kontinenten. Pirater holder til langs nordkysten.', 10],
  ['soluna', 'Soluna', 67, 93, 'varmt', 'kyst', 3, 'Kontinenten sør for Kopparhavet, med Efaro, Sombatze og veiene videre mot Traxilme.', 'Handelen langs kysten er ikke det samme som en ferd gjennom ørkenene i sør.', 12],
  ['akrogal', 'Akrogal', 91, 53, 'varmt', 'fastland', 4, 'Den østlige kontinenten, knyttet til Ereb gjennom Demontungan.', 'Kalmurri og Furgia ligger bortenfor landbroen. Lenger øst er store områder ukjent for reisende fra Ereb.', 14],
];

export const ATLAS_REGIONS = Object.fromEntries(defs.map(([id, name, x, y, climate, shape, danger, lore, rumor, page]) => [id, { id, name, x, y, climate, shape, danger, lore, rumor, source: 'kampanj', sourcePage: page }]));

// Bokførte havner. Koordinatene under er på våre skjematiske regionkart.
const ports = [
  ['arno', 'Arno', 'caddo'], ['gringul', 'Gringul', 'erebos'],
  ['tricilve', 'Tricilve', 'trakorien'], ['mercana', 'Mercana', 'magilre'],
  ['staden_o', 'Staden O', 'klomellien'], ['kapahlt', 'Kapahlt', 'ransard'],
  ['halle', 'Halle', 'jorduashur'], ['mastika_agga', 'Mastika Agga', 'barbia'],
  ['cerevallis', 'Cerevallis', 'cereval'], ['jorgund', 'Jorgund', 'jorpagna'],
  ['fervidun', 'Fervidun', 'hynsolge'], ['tyros', 'Tyros', 'felicien'],
  ['khaanikel', 'Khaanikel', 'nidland'], ['stabul', 'Stabul', 'krun'],
  ['melukha', 'Melukha', 'samkarna'],
];
// Caddo og Erebos ligger sør for Aidne; egen definisjon gjør at de får egne kart.
ATLAS_REGIONS.caddo = { id: 'caddo', name: 'Caddo', x: 29, y: 81, climate: 'varmt', shape: 'oy', danger: 1,
  lore: 'Øyrepublikk med Arno som hovedstad, skipsbygging og en streng gren av den Lysande Vägen.',
  rumor: 'Magi er forbudt på Caddo. Spør om skikkene før du viser hva du kan.', source: 'spelare', sourcePage: 5 };
ATLAS_REGIONS.erebos = { id: 'erebos', name: 'Erebos', x: 41, y: 78, climate: 'varmt', shape: 'oyer', danger: 2,
  lore: 'Handelsøyene Dakkilo, Beyural, Targero og Tolokfe, med Gringul som en viktig møteplass.',
  rumor: 'Skip fra øst og vest bytter varer her. En avtale kan være verdt mer enn lasten, og et brutt løfte kan følge deg fra havn til havn.', source: 'spelare', sourcePage: 11 };

for(const [id,r] of Object.entries(ATLAS_REGIONS)) {
  r.geo=REGION_GEO[id].point;
  r.x=r.geo[0]/EREB_MAP.width*100;r.y=r.geo[1]/EREB_MAP.height*100;
}

export const ATLAS_PORTS = Object.fromEntries(ports.map(([id, name, region]) => [id, { id, name, region, x: 9, y: 22, source: 'kampanj', sourcePage: 40 }]));
export const ATLAS_SCENARIOS = [
  { id: 'edelfara', name: 'Triangeldrama i Edelfara', region: 'aidne', source: 'ivanhoe', state: 'spillbart', text: 'De tre adelsmennene, ledetrådene og fristen i Edelfara.' },
  { id: 'enhorningen', name: 'Enhörningen och Drakormen', region: 'hynsolge', source: 'aventyr', state: 'kilde funnet', text: 'Neste større oppdragskjede for Gråborg og Hynsolge.' },
  { id: 'edsbrytarna', name: 'Edsbrytarna i Erebos', region: 'erebos', source: 'aventyr', state: 'kilde funnet', text: 'Et byeventyr som kan knytte havn, etterforskning og sjøhandel sammen.' },
  { id: 'trakorien', name: 'Trakorien', region: 'trakorien', source: 'trakorien', state: 'verdensstoff', text: 'Øyene, trosretningene og handelshusene trenger egne folk og oppdrag.' },
  { id: 'kapare', name: 'Kopparhavets Kapare', region: 'samkarna', source: 'kapare', state: 'verdensstoff', text: 'Grunnlag for skip, pirater og egne sjøeventyr.' },
  { id: 'krilloan', name: 'Krilloan', region: 'samkarna', source: 'krilloan', state: 'verdensstoff', text: 'Kiorsham og Krilloan er grunnområder. Byens distrikter og eventyr krever videre arbeid.' },
];
