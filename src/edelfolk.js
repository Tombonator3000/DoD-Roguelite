// Folket i Edelfara. Replikkene bygger på «Triangeldrama i Edelfara» (s. 3-9), skrevet om til norsk.
// Navnene er modulens. Navn som ikke står i modulen (vaktkapteinen, vertene, riddarkapteinen,
// sønnene, hovmesteren og noen bønder), er spillets egne.
import { G } from './state.js';
import { has, fl, flag, clue, item, give, take, started, deadlineText } from './ivan.js';

const PI = Math.PI;
const lejde = () => !!item('lejdebrev');

// --- Ekeskogen -----------------------------------------------------------------------------
const EKESKOGEN = [
  {
    id: 'ed_hallvard', name: 'Hallvard', short: 'en budbærer med rød hatt', title: 'budbærer for baron Jörne',
    look: 'En mager mann i reisekappe med baron Jörnes våpen på brystet, tre svarte fugler på gult. Han har et skrin under armen og en kniv i beltet han ikke vet hva han skal gjøre med.',
    model: { kin: 'manniska', profession: 'nasare', age: 'ung', clothes: { top: 0xb8901a, pants: 0x3a2a1a } },
    sched: [[0, 'jorne_sleep'], [6, 'jorne_rest'], [9, 'jorne_road'], [12, 'jorne_rest'], [15, 'jorne_road'], [19, 'jorne_rest'], [22, 'jorne_sleep']],
    greet: c => (c.night ? 'Ikke kom nærmere! Å. Du er ikke en orch. Sett deg ved bålet, hvis du vil.' : 'God dag! Er veien til [Akershus] fri? Folk sier det er soldater der.'),
    topics: {
      NAVN: 'Hallvard. Ridebud, ikke kriger. Det vil jeg at du skal vite.',
      JOBB: 'Jeg bærer bud for baron [Jörne], sør for Eke. Nå skal jeg til [Akershus] med et brev til baron [Eke].',
      JÖRNE: 'Min herre har gårdene sine sør for skogen. Han låner ut penger til folk han liker. Han liker baron Eke. Eller, det gjorde han.',
      AKERSHUS: 'Baron Ekes borg. Greven har soldater rundt hele kullen, sier de. Jeg har ventet her i to dager på at noen skal si at det er trygt.',
      EKE: c => { clue('jorne'); return 'Baron Eke lovet å betale tilbake [gjelden] denne uka. To hundre gullmynt. Jeg skal hente dem. Han er en hederlig mann, sier min herre. Han er også blakk, sier alle andre.'; },
      GJELDEN: 'To hundre gullmynt. Ingen liten sum for en baron som spiser kålsuppe til jul.',
      SKOGEN: 'Jeg hørte noe grynte inne i skogen i går kveld, sør for veiskillet. Jeg holdt meg ved bålet og sang høyt. Det hjelper visst ikke, men det føltes riktig.',
      SVARTFOLK: 'Svartfolk? Her? Nei. Si at du tuller.',
      KUREREN: c => (has('kurir') ? 'En av hertigens kurerer? Død? Da sover jeg med kniven i hånda i natt. Ikke at jeg vet hvordan man gjør det.' : 'Hvilken kurir?'),
      ERERIK: 'Aldri hørt navnet.',
      FARVEL: 'Hvis du går mot Akershus, si at Hallvard kommer. Snart. Når det er trygt.',
    },
    barks: ['Er det trygt nå?', 'Hørte du det?'],
  },
];

// --- Sortmund ------------------------------------------------------------------------------
const SORTMUND = [
  {
    id: 'ed_holmger', name: 'Holmger', short: 'en vaktkaptein med grått skjegg', title: 'markisens vaktkaptein i Sortmund',
    look: 'En bredskuldret mann i rød kappe med markisens kors. Han ser på deg som om han allerede har skrevet deg inn i en bok.',
    model: { kin: 'manniska', profession: 'krigare', age: 'gammal', clothes: { top: 0x8a1a14, pants: 0x2a2420 }, armor: { type: 'ring' }, helmet: { hid: 'oppenhjalm' }, weapon: 'bredsvard' },
    sched: [[0, 'vakt_bed'], [6, 'vakt_in'], [8, 'patrol'], [12, 'tupp_door'], [13, 'patrol'], [19, 'vakt_in'], [22, 'vakt_bed']],
    patrol: ['street_w', 'street_c', 'street_e', 'street_s', 'street_c'],
    greet: c => (c.night ? 'Ute så sent? Det er ikke lurt nå om dagen.' : 'Fremmed. Hva vil du i Sortmund? Si det fort, og si det sant.'),
    topics: {
      NAVN: 'Holmger. Vaktkaptein. Det holder.',
      JOBB: 'Jeg er markisens vaktkaptein. Jeg holder orden på Sortmund og alle i den. Akkurat nå holder jeg øye med [plakaten], og med deg.',
      PLAKATEN: 'Markisen lover en [belønning] til den som griper den eller dem som drepte Riddar [Kettil]. Det henger plakater over hele byen. Folk holder dører og vinduer lukket.',
      BELØNNING: 'Ti gullmynt. Markisen betaler når den skyldige står foran ham. Ikke før.',
      KETTIL: 'Riddar Kettil Ormstunga. Han ble funnet noen mil fra Glimming med to av mennene sine, med strupen skåret over, sier de. Kisten var borte, og resten av følget. Han ligger i [kapellet] nå og venter på å bli begravet.',
      KAPELLET: 'Kaplanen har vasket ham og pyntet ham med blomster. Han lar deg se, hvis du ber pent.',
      MARKISEN: c => `Markis Kristierne bor i borgen på [borgkullen]. Han tar ikke imot hvem som helst nå. Har du nyheter om mordet, eller noe med segl på, kan du prøve borgveien.${lejde() ? ' Du har et lejdebrev? Da slipper de deg nok opp.' : ''}`,
      BORGKULLEN: 'Markisens forfar bygde borgen der. Sjøen [Kärkel] tar seg av nordsiden. Vi tar oss av resten.',
      KÄRKEL: 'God fisk, kaldt vann. Ingen har noen gang angrepet Sortmund fra sjøen. Ingen har angrepet Sortmund i det hele tatt, før nå.',
      LEJDEBREV: c => (lejde() ? 'Hertigens segl. Hm. Da må jeg vel hjelpe deg. Hva vil du vite?' : 'Hva for et brev?'),
      EKE: 'Folk på vertshuset sier det var baron Eke. Folk på vertshuset sier mye.',
      GLIMMING: 'Grevens borg ligger fem timer nordøst, ved veiskillet.',
      SVARTFOLK: 'I Ridderskors? Nei. De holder seg inne i Torilskogen. Det har de alltid gjort.',
      ERERIK: 'Ingen her heter det.',
    },
    barks: ['Hold dere innendørs.', 'Fremmed i byen. Jeg ser deg.'],
  },
  {
    id: 'ed_ottar', name: 'Ottar', short: 'en rund vert med forkle', title: 'vert på Galande Tuppen',
    look: 'En rund mann med rødt ansikt og et forkle som har sett bedre dager. Han tørker det samme kruset gang på gang.',
    model: { kin: 'manniska', profession: 'hantverkare', age: 'medel', clothes: { top: 0x7a5a3a, pants: 0x3a2a20 } },
    sched: [[0, 'tupp_up'], [7, 'tupp_bar'], [24, 'tupp_up']],
    shopHours: [7, 24],
    greet: 'Velkommen til Galande Tuppen, det eneste stedet i Sortmund som har åpent. Folk trenger øl mer enn noen gang.',
    topics: {
      NAVN: 'Ottar. Faren min het Ottar også. Det sparte mye tid.',
      JOBB: 'Jeg skjenker. Vi har [rom], [mat] og [øl]. Ølet er kjent langt utenfor Ridderskors. Det er hyggeligere her enn på [Bildhuggaren], og dyrere.',
      ROM: { act: 'ed_room' },
      MAT: { act: 'ed_meal' },
      ØL: { act: 'ed_ale' },
      RYKTER: { act: 'ed_rumor' },
      BILDHUGGAREN: 'Tavernaen over gata. Gerd lager god mat. Ikke si at jeg sa det.',
      KETTIL: 'Han satt der borte og drakk til han så dobbelt, og begge to var like tørste. Stakkars Kettil. Han var ikke Etins beste barn, men han var nok snill innerst inne. Helt innerst.',
      EKE: 'Det må være Eken, sier [Fastulf]. Han sier det hver kveld. Han har sagt det om tørken og om kua til Gudmar også.',
      FASTULF: 'Han i hjørnet. Mer bein enn mann, mer meninger enn bein.',
      PRISENE: 'Kontant koster mer i Sortmund. Håndverkerne må reise langt for å bli kvitt pengene. Her bytter folk heller.',
      ERERIK: 'Ingen Ererik har bodd her. Jeg ville husket et sånt navn.',
    },
    barks: ['Øl! Varmt eller kaldt!', 'Et rom for natta?'],
    closedLine: 'Vi har stengt. Kom tilbake i morgen.',
  },
  {
    id: 'ed_fastulf', name: 'Fastulf', short: 'en lang, senete mann i hjørnet', title: 'tømmerkjører',
    look: 'Lang og senete, med nese som en kråke og et krus som aldri blir tomt lenge.',
    model: { kin: 'manniska', profession: 'hantverkare', age: 'gammal', clothes: { top: 0x4a4a3a, pants: 0x2a2820 } },
    sched: [[0, 'tupp_up'], [9, 'bake_out'], [15, 'tupp_corner'], [23, 'tupp_up']],
    greet: c => (has('kurir') || started() ? 'Du har hørt om kisten, ja? Det må være Eken! Det må være Eken! Han er fattig som en kirkerotte, vettu!' : 'Det må være Eken. Ja, jeg snakker om Kettil. Hva ellers?'),
    topics: {
      NAVN: 'Fastulf. Alle vet hvem jeg er.',
      JOBB: 'Jeg kjører tømmer når det er tømmer å kjøre. Nå er det ikke det. Så jeg sitter her og vet ting.',
      EKE: 'Baron Ragnvalde Görelsson til Eke. [Røverbaronen]. Han har drept bønder og stjålet kuer, sier alle. Og så ble han sur da [markisen] giftet seg med den unge grevinnen. Jeg har ventet på hevnen hans siden den dagen. Og nå kom den!',
      RØVERBARONEN: 'Spør bøndene hans i Akershus. De sier sikkert at han er snill. De er redde, vettu.',
      MARKISEN: 'Markis Kristierne er en klok mann. Han giftet seg med fröken [Edelina], den eldste datteren til greven. Godt gjort, sier jeg.',
      EDELINA: c => { clue('edelina'); return 'Edelina Sebestidsdotter. Alle kaller henne Linna. Baron Eke var forelsket i henne, i hemmelighet. Men hun ble gitt bort til markisen, som har mer gull enn Eke har trær. Et godt trekk, sier alle i byen.'; },
      KETTIL: 'Riddar Kettil kunne slåss for fem når det trengtes. Og drikke for ti. Han var markisens eneste ordentlige venn, sier noen.',
      KISTEN: 'Fem hundre gullmynt! Det sier i hvert fall Ottar. Han hørte det fra vaktene, som hørte det fra kokka.',
    },
    barks: ['Det må være Eken!', 'Fattig som en kirkerotte!'],
  },
  {
    id: 'ed_hjalmar', name: 'Hjalmar', short: 'en tjukk bonde med lue', title: 'bonde i Sortmund',
    look: 'En tjukk og blid bonde som har hørt alt to ganger og fortalt det tre.',
    model: { kin: 'manniska', profession: 'nasare', age: 'medel', clothes: { top: 0x5a6a3a, pants: 0x3a3020 } },
    sched: [[0, 'tupp_up'], [6, 'bonde_garden'], [11, 'street_c'], [17, 'tupp_t2'], [23, 'tupp_up']],
    greet: 'Ja, det var altså grevens høyvelbårne venner som skulle ut og jakte [lortinger] i baronens skoger.',
    topics: {
      NAVN: 'Hjalmar. Jeg har den gården bak bakeriet. Den med den skjeve låven.',
      JOBB: 'Kål og løk. Og prat, sier kona.',
      LORTINGER: 'Svartfolk, altså. Så ble baronen sur, for de kunne bli sure og angripe borgen hans. Han jaget grevens venner og sa at de ikke fikk jakte. Så ble de sure og sa det til greven, som ble enda surere. Han truet med å gjøre Eken fredløs og sa at han skulle komme opp til [Glimming], men baronen nektet. Så sendte greven masse soldater og riddere til Akershus. Mer vet jeg ikke.',
      GLIMMING: 'Grevens borg. Fine folk. Vi får ikke komme inn. Vi har ikke lyst heller.',
      KETTIL: 'Kommer du i hu da han red inn på torget baklengs? Nei, du gjør ikke det. Du var ikke her.',
    },
  },
  {
    id: 'ed_gudmar', name: 'Gudmar', short: 'en bonde med halve venstre øret borte', title: 'bonde i Sortmund',
    look: 'En kraftig bonde med jordete hender. Det venstre øret hans er bare en stump, og arret er ferskt.',
    model: { kin: 'manniska', profession: 'hantverkare', age: 'medel', clothes: { top: 0x6a5a40, pants: 0x3a3428 } },
    sched: [[0, 'bonde_bed'], [6, 'bonde_garden'], [12, 'bonde_in'], [13, 'bonde_garden'], [19, 'bonde_in'], [22, 'bonde_bed']],
    greet: c => (started() ? 'Du spør om Kettil, hører jeg. Kom hit, så skal du få høre noe. Se på [øret] mitt først.' : 'Hva glor du på? Ja, [øret]. Ja, det er ferskt.'),
    topics: {
      NAVN: 'Gudmar. Jeg betaler skatt. Det er det markisen vil vite om meg.',
      JOBB: 'Jeg dyrker kål og korn og betaler skatt til [markisen]. Jeg har ikke mye til overs for ham.',
      ØRET: c => { clue('bastard'); return 'For noen dager siden kom Kettil brasende inn i storstua mi, akkurat da vi skulle spise. Han ville ha mat og ei seng, og den yngste datteren min til sengevarmer. Jeg ble sint og ville kaste ham ut, men han var full, dro kniven og skar av meg halve øret. Om kvelden fikk jeg sendt drengen til borgen, og [markisen] kom ved daggry med følge. Da han begynte å skjelle ut Kettil, sa Kettil noe som fikk meg til å undre: «Men far, du var vel ikke perfekt i ungdommen din heller?» Markisen skrek: «Du har vanæret meg, din usle bastard! Forsvinn, og vis deg aldri mer!» Så kastet han en pung med hundre silverdaler til meg og snudde på hælen.'; },
      MARKISEN: 'Snål som ei geit, rik som et troll. Han har betalt mye for Kettils fyll, sier folk. Nå vet du kanskje hvorfor.',
      KETTIL: 'Han er død, og jeg skal ikke late som jeg gråter.',
      BASTARD: 'Du hørte hva jeg sa. Jeg sier det ikke igjen. Ikke høyt, i hvert fall.',
    },
    barks: ['Psst. Du som spør om Kettil.'],
  },
  {
    id: 'ed_ansgar', name: 'Fader Ansgar', short: 'en kaplan i grå kutte', title: 'kaplan i Sortmund',
    look: 'En tynn, gammel prest med vokssøl på ermene. Han har vasket mange døde, og han gjør det godt.',
    model: { kin: 'manniska', profession: 'munk', age: 'gammal', clothes: { top: 0x6a6a6a, pants: 0x3a3a3a } },
    sched: [[0, 'kapell_bed'], [6, 'kapell_chap'], [12, 'kapell_door'], [13, 'kapell_chap'], [22, 'kapell_bed']],
    greet: 'Fred være med deg. Du kommer for å se [Kettil], antar jeg. Alle gjør det.',
    topics: {
      NAVN: 'Ansgar. Fader for de fleste, bror for noen.',
      JOBB: 'Jeg passer kapellet og de døde. Akkurat nå er det mest de døde.',
      KETTIL: 'Han ligger på båren. Jeg har vasket ham og lagt blomster rundt. Du kan se på ham, men vær varsom. Han har fått nok bråk. Se på [såret], hvis du forstår deg på sånt.',
      SÅRET: 'Hundrevis av folk har vært på stedet der han ble funnet og glodd. Der finner du ingenting. Men såret hans forteller noe, hvis man vet hvordan man ser.',
      BEGRAVELSE: 'Når markisen bestemmer seg. Han venter på at noen skal betale for den.',
      MARKISEN: 'Han kommer hit hver kveld og står der en stund. Han sier ingenting. Det sier jo litt.',
      ERERIK: 'Det er et navn fra nord. Ingen her bærer det.',
    },
  },
  {
    id: 'ed_gerd', name: 'Gerd', short: 'en kvinne med melete armer', title: 'vertinne på Bildhuggaren',
    look: 'Bred i hoftene og rask i kjeften, med mel til albuene og en øse i beltet.',
    model: { kin: 'manniska', profession: 'hantverkare', age: 'medel', clothes: { top: 0x8a3a2a, pants: 0x3a2a24 } },
    sched: [[0, 'bild_up'], [8, 'bild_bar'], [23, 'bild_up']],
    shopHours: [8, 23],
    greet: 'Bildhuggaren. Maten er enkel, prisen er lav, og ingen spør hvem du er. Det er mer enn Tuppen kan si.',
    topics: {
      NAVN: 'Gerd. Bildhuggeren var mannen min. Han hogg stein. Nå hogger jeg kål.',
      JOBB: 'Jeg lager [mat] og tapper [øl]. Ikke så fint som Galande Tuppen, men det er varmere her.',
      MAT: { act: 'ed_meal2' },
      ØL: { act: 'ed_ale' },
      JAKTEN: 'Grevens fine venner skulle jakte [lortinger] i baronens skoger. Baronen ble sur, for da kunne lortingene bli sure og angripe borgen hans. Han jaget vekk grevens venner, og så ble greven enda surere.',
      LORTINGER: 'Det er det bøndene i Eke kaller svartfolket. Lortinger. Det sier vel det meste.',
      KETTIL: 'Han kom aldri hit. Her var det ikke fint nok å drikke seg full.',
    },
    closedLine: 'Kjøkkenet er stengt. Kom igjen i morgen tidlig.',
  },
  {
    id: 'ed_halvdan', name: 'Halvdan', short: 'en sotete smed', title: 'smed og hovslager',
    look: 'Svære underarmer, svidd forkle og en stemme som har ropt over ambolten i tretti år.',
    model: { kin: 'manniska', profession: 'hantverkare', age: 'medel', clothes: { top: 0x4a3a30, pants: 0x2a2a2a } },
    sched: [[0, 'smed_bed'], [6, 'smed_forge'], [12, 'smed_door'], [13, 'smed_forge'], [19, 'smed_door'], [21, 'smed_bed']],
    shopHours: [6, 21],
    greet: 'Smia er åpen. Hestene i Sortmund mister skoene sine akkurat som før, mord eller ikke.',
    topics: {
      NAVN: 'Halvdan. Jeg er hel, uansett hva navnet sier.',
      JOBB: 'Smed og hovslager. Jeg kan [reparere] det du har ødelagt.',
      REPARERE: { act: 'ed_repair' },
      PILEN: 'Hullingpiler? Det smir ikke jeg. Ingen her gjør det. De er laget for å drepe, ikke for å jakte.',
      HULLINGER: 'Spør bøndene i Eke. De har skogen rett utenfor døra, og alt som bor i den.',
    },
    closedLine: 'Ilden er slokket for i dag.',
  },
  {
    id: 'ed_marta', name: 'Märta', short: 'en ung baker', title: 'baker i Sortmund',
    look: 'Ung og flink, med et brødspade over skulderen som et våpen.',
    model: { kin: 'manniska', profession: 'hantverkare', age: 'ung', clothes: { top: 0xd8c8a8, pants: 0x4a3a2a } },
    sched: [[0, 'bake_up'], [4, 'bake_in'], [10, 'bake_out'], [14, 'bake_in'], [20, 'bake_up']],
    shopHours: [4, 20],
    greet: 'Ferskt brød! I hvert fall var det det i morges.',
    topics: {
      NAVN: 'Märta.',
      JOBB: 'Jeg baker [brød] til hele Sortmund, og til borgen. Markisen spiser bare det som er en dag gammelt. Det er billigere.',
      BRØD: { act: 'ed_bread' },
      MARKISEN: 'Han kjøper gammelt brød og gir det til hestene. Så kjøper han havre til hestene og spiser den selv. Sier folk.',
    },
    closedLine: 'Ovnen hviler. Kom i morgen tidlig.',
  },
  {
    id: 'ed_sigge', name: 'Sigge', short: 'en fisker med våte støvler', title: 'fisker ved Kärkel',
    look: 'Gammel og brun som en tørket gjedde, med nett over armen.',
    model: { kin: 'manniska', profession: 'sjofarare', age: 'gammal' },
    sched: [[0, 'fisk_bed'], [5, 'fisk_pier'], [13, 'fisk_in'], [15, 'fisk_pier'], [20, 'fisk_bed']],
    greet: 'Shh. Fisken hører deg.',
    topics: {
      NAVN: 'Sigge.',
      JOBB: 'Jeg fisker i Kärkel og selger til Ottar. Han betaler i øl. Det går opp.',
      SJØEN: 'Kärkel er dyp på midten. Ingen har funnet bunnen. Noen har prøvd.',
      FISKEN: 'Ingen fisk i dag. Fisken vet noe vi ikke vet.',
    },
  },
];

// --- Ridderskors ---------------------------------------------------------------------------
const RIDDERSKORS = [
  {
    id: 'ed_markis', name: 'Markis Ridderskors', short: 'en eldre herre i mørk fløyel', title: 'markis Kristierne Ettilesson',
    look: 'En distingert eldre herre i mørk fløyel med en tung nøkkel i beltet. Han ser på pengepungen din før han ser på deg.',
    model: { kin: 'manniska', profession: 'riddare', age: 'gammal', clothes: { top: 0x3a1a2a, pants: 0x1e1a1c, cape: 0x6a1010 } },
    sched: [[0, 'markis_bed'], [7, 'markis_study'], [11, 'markis_walk'], [12, 'markis_hall'], [14, 'markis_study'], [18, 'markis_hall'], [22, 'markis_bed']],
    greet: c => {
      if (fl('chest') === 'returned') return 'Min kiste! Mine penger! Velkommen, velkommen. Ikke rør noe.';
      if (fl('chest') === 'stolen') return 'Du. Du våger å komme hit. Jeg vet hva du gjorde med kisten min. Hele Ridderskors vet det.';
      return 'Nyheter om mordet, sier vaktene? Snakk. Men ikke for lenge. Tid er penger, og penger er... borte.';
    },
    topics: {
      NAVN: 'Kristierne Ettilesson, markis av Ridderskors. Du kan si «herr markis».',
      JOBB: 'Jeg er markis av Ridderskors. I teorien styrer jeg baroniet. I praksis gjør min kone det, når hun ikke er i [Pendon]. Akkurat nå sørger jeg over [pengene].',
      PENGENE: 'Fem hundre gullmynt! Til greve Edelfara, som [forsoningsgave], så striden mellom ham og [Eke] skulle få en ende. Eke skulle betale tilbake senere. Riddar [Kettil] skulle bringe [kisten] til Glimming med fem soldater. Etter tre dager fant de Kettil og to av mennene, og ingen kiste.',
      FORSONINGSGAVE: 'Hertigen ga meg et vink om det. Jeg skulle støtte Eke uten å si at det var hertigens tanke. Jeg gjorde det motvillig. Svært motvillig.',
      EKE: 'Naturligvis var det Eke, den tiggende fattiglappen! Kassakisten hans er like tom som hodet. Visst, hertigen gikk god for ham, men hertigen er gammel og embetsmennene hans er late som esler. Eke har ingenting å tape. Han er sikkert halvveis til Kardien nå med pengene mine, mine egne penger, som jeg har slitt for i mitt ansikts sved!',
      KETTIL: c => (has('bastard') ? 'Kettil var min beste ridder. Hvis noen har fortalt deg noe annet, er det løgn. Og hvis det ikke er løgn, angår det ikke deg. Fortsett.' : 'Tja... hvorfor ikke? Han var, unnskyld, er... var min beste ridder. Det han gjorde privat, hadde ingenting med tjenesten å gjøre, selv om han nok var til bry iblant. Han var glad i spriten, ja, men han var dyktig også. Det må sies.'),
      KISTEN: c => {
        if (fl('chest') === 'carried') return { act: 'ed_return_chest' };
        if (fl('chest') === 'returned') return 'Den står trygt i kjelleren nå. Med tre låser. Jeg teller den hver kveld.';
        return 'Den er borte! En jernbeslått kiste med fem hundre gullmynt. Finn den, og du skal få... min takk. Og belønningen på [plakaten].';
      },
      PLAKATEN: 'Ti gullmynt til den som griper morderne. Det står der. Jeg står ved det.',
      GREVEN: c => { clue('greve_brev'); return 'Jeg har ikke hatt noen kontakt med min svigerfar, utover budet om at pengene var på vei. Han svarte. Her er svaret. Han henter et papir fra skrivebordet: «Glimming, den tjuende. Til markis Herr Kristierne Ettilesson Ridderskors. Nevnte pengesum er visselig til stor nytte for baron Ekes sak. Trekker mine tropper tilbake når pengene når Glimming. Siste ord er dog ikke sagt med dette... Herr Sebestid Natthök, greve av Edelfara.»'; },
      BUDET: 'Jeg sendte bud til baron Eke også. Svar fikk jeg aldri. Budbæreren slapp vel ikke forbi grevens soldater, som ikke vet noe om noe.',
      MORDET: 'Om greven selv har latt Kettil drepe og tatt pengene? Ha! Visselig ville han få Eke da, men noe slikt ville han aldri senke seg til. Han er min svigerfar, vet du.',
      PENDON: 'Min kone er i Pendon i audiens hos kongen. Hun ville visst hva man gjør nå. Hun vet alltid det.',
      MYNTENE: c => {
        if (!item('mynt')) return 'Hvilke mynter? Har du mynter, vil jeg gjerne se dem. Det vil jeg alltid.';
        clue('mynt_markis');
        return 'Han river myntene ut av hånda di og holder dem opp mot lyset. Hertigens stempel, og det lille hakket jeg selv satte i hvert tiende mynt. Disse lå i MIN kiste! Hvor fikk du dem? Fra en orch? En ORCH? Han gir dem motvillig tilbake. Behold dem som bevis. Men jeg har telt dem.';
      },
      SVARTFOLKET: c => (has('lekh') || has('leir') ? 'Svartfolk? Lortinger tok kisten min? Da må noen jo hente den! Ikke jeg, naturligvis.' : 'Svartfolk holder seg i skogen. Hva skal de med gull? De kan ikke engang telle.'),
      BASTARD: c => (has('bastard') ? 'Markisen blir hvit i ansiktet. Hvem har sagt det? Gudmar? Den bonden skal få betale for øret sitt to ganger. Kettil var... Det angår ikke deg. Det angår ikke noen.' : 'Hva skal det bety?'),
      ERERIK: 'Ererik? Nei. Burde jeg kjenne ham?',
    },
  },
  {
    id: 'ed_rk_vakt1', name: 'Vakten Arnulf', short: 'en vakt ved porten', title: 'markisens vakt',
    look: 'Ung og nervøs, med en hellebard som er for lang for ham.',
    model: { kin: 'manniska', profession: 'krigare', age: 'ung', clothes: { top: 0x8a1a14 }, armor: { type: 'ring' }, helmet: { hid: 'oppenhjalm' }, weapon: 'kortspjut' },
    sched: [[0, 'gate_l'], [24, 'gate_l']],
    greet: 'Markisen tar imot dem som har nyheter eller segl. Du er inne, så du har vel en av delene.',
    topics: {
      JOBB: 'Jeg vokter porten. Markisen sier at hvis kisten kommer tilbake, får vi lønn for to måneder. Han sa ikke hvilke to.',
      KETTIL: 'Han lærte meg å holde spydet. Han var full da, men han lærte meg det likevel.',
    },
  },
  {
    id: 'ed_rk_vakt2', name: 'Vakten Sune', short: 'en gammel vakt', title: 'markisens vakt',
    model: { kin: 'manniska', profession: 'krigare', age: 'gammal', clothes: { top: 0x8a1a14 }, armor: { type: 'ring' }, helmet: { hid: 'oppenhjalm' }, weapon: 'kortspjut' },
    sched: [[0, 'gate_r'], [24, 'gate_r']],
    greet: 'Hmf.',
    topics: {
      JOBB: 'Porten. I førti år. Den har ikke gått noe sted.',
      MARKISEN: 'Han teller kobberne i lønnsposen to ganger. Den andre gangen finner han alltid ett for mye.',
    },
  },
  {
    id: 'ed_rk_kokk', name: 'Kokka Rannveig', short: 'ei kokke med sleiv', title: 'kokke på borgen',
    look: 'Kort og bred, med sleiv i hånda og meninger om alt.',
    model: { kin: 'manniska', profession: 'hantverkare', age: 'gammal', clothes: { top: 0x8a7a5a, pants: 0x3a3028 } },
    sched: [[0, 'kok_bed'], [5, 'kok_in'], [10, 'court'], [11, 'kok_in'], [21, 'kok_bed']],
    greet: 'Ikke i veien! Grøten brenner seg ikke selv. Jo, den gjør det.',
    topics: {
      JOBB: 'Jeg lager mat til markisen. Grøt nå. Han sier det er billigere enn sorg.',
      KETTIL: 'Han kom hit til kjøkkenet om natta og spiste rett fra gryta. Markisen visste det. Han sa aldri noe. Rart, ikke sant?',
      KISTEN: 'Den sto i gangen i tre dager før de reiste. Markisen sov ved siden av den. Jeg måtte bære maten til ham der.',
    },
  },
];

// --- Akershus ------------------------------------------------------------------------------
const AKERSHUS = [
  {
    id: 'ed_ulfmar', name: 'Riddar Ulfmar', short: 'en høy ridder i polert harnisk', title: 'grevens riddarkapten i Akershus',
    look: 'En høy ridder med grevens nattfalk på brystet. Han har ikke sovet godt på en uke, og det er ikke borgens skyld.',
    model: { kin: 'manniska', profession: 'riddare', age: 'medel', clothes: { top: 0x2a2a34, cape: 0xd8dce4 }, armor: { type: 'plat' }, helmet: null, weapon: 'bredsvard' },
    sched: [[0, 'knight_bed'], [6, 'knight_tent'], [9, 'castle_guard2'], [11, 'knight_tent'], [22, 'knight_bed']],
    greet: c => {
      if (fl('peace')) return 'Hertigens mann. Svartfolket er drevet inn i skogen igjen. Det var en god dag å være soldat.';
      if (fl('truce')) return 'Mennene er klare. Vi følger deg til leiren deres når du vil. Si fra.';
      return 'Stans. Dette er grevens leir. Hva vil du her?';
    },
    topics: {
      NAVN: 'Ulfmar Brandsson, ridder i grevens tjeneste.',
      JOBB: 'Jeg leder grevens styrke i Akershus. Fem riddere og førti mann. Vi skal få baron [Eke] ut av borgen og til Glimming, med eller mot hans vilje.',
      EKE: 'Han slo tilbake det første angrepet vårt med fem soldater og to gutter. Det må man gi ham. Nå venter vi på ordre, og på [katapulten].',
      KATAPULTEN: c => `Den står der oppe ved kullen. Når greven gir ordre, slår vi en bresj i muren. ${deadlineText()}`,
      ARBALESTEN: c => (has('arbalest') ? 'Den tilhører Riddar Hjalmar. Han jakter villsvin med den. Villsvin har tykt skinn, derfor hullingene. Han har ikke vært ute av leiren på en uke.' : 'Hvilken arbalest?'),
      LEJDEBREV: c => (lejde() ? 'Hertigens segl. Da slipper jeg deg opp til borgen. Men forsvarerne skyter på alt som ikke er en av grevens menn. Vis dem brevet også, og hold hendene der de kan se dem.' : 'Jeg ser ikke noe brev.'),
      SVARTFOLKET: { act: 'ed_convince', always: false },
      LEKH: { act: 'ed_convince' },
      KETTIL: 'Greven tror det var Eke. Jeg tror greven tror det han vil. Det er ikke min sak å tro.',
      ERERIK: 'Ingen i min styrke heter det.',
    },
  },
  {
    id: 'ed_ak_hjalmar', name: 'Riddar Hjalmar', short: 'en ridder som pusser en arbalest', title: 'ridder i grevens tjeneste',
    look: 'En ung ridder med bart og en arbalest over knærne. Han pusser den som om den var en hund.',
    model: { kin: 'manniska', profession: 'riddare', age: 'ung', clothes: { top: 0x2a2a34, cape: 0xd8dce4 }, armor: { type: 'ring' }, weapon: 'bredsvard' },
    sched: [[0, 'camp_tent'], [7, 'camp_fire2'], [12, 'p_c'], [14, 'camp_fire2'], [22, 'camp_tent']],
    greet: 'Pent stykke, ikke sant? Fra Kardien. Den går gjennom et villsvin fra førti skritt.',
    topics: {
      JOBB: 'Jeg venter. Ridder er en som venter i fint tøy.',
      ARBALESTEN: c => { clue('arbalest'); return 'Den er min. Hullingpilene er for villsvin. Det står fem i stativet ved teltet, og jeg har talt dem hver morgen. Ingen mangler. Du tror vel ikke...? Ha!'; },
      JAKTEN: 'Jeg var med på grevens jakt. Vi så ikke et eneste svartfolk. Bare en sint baron.',
    },
  },
  {
    id: 'ed_ak_soldat', name: 'Soldaten Toke', short: 'en soldat ved bålet', title: 'grevens soldat',
    look: 'Gjørmete støvler og et lag med sot i ansiktet. Han steker noe på et spyd.',
    model: { kin: 'manniska', profession: 'krigare', age: 'ung', clothes: { top: 0x2a2a34 }, armor: { mat: 'nit' }, helmet: { hid: 'oppenhjalm' }, weapon: 'kortspjut' },
    sched: [[0, 'camp_tent2'], [6, 'camp_fire1'], [10, 'castle_guard'], [16, 'camp_fire1'], [23, 'camp_tent2']],
    greet: 'Vil du ha? Det er ekorn. Tror jeg.',
    topics: {
      JOBB: 'Soldat. Vi har vært her en uke. Bøndene liker oss ikke. Ølet på [Ekehus] liker oss enda mindre.',
      EKEHUS: 'Vertshuset ved kvarnen. De stenger når vi kommer. Vi har tatt litt fra bøndene. Ikke mye. Litt.',
      SVARTFOLKET: 'Jeg hørte noe ule i skogen i natt. Ulv, sa korporalen. Ulver uler ikke sånn, sa jeg.',
      BORGEN: 'Ingen går opp uten grevens tillatelse. Eller hertigens, hvis du har noe sånt.',
    },
  },
  {
    id: 'ed_ebbe', name: 'Ebbe', short: 'en grå vert med tykke briller', title: 'vert på Ekehus',
    look: 'Tynn og grå, med briller tykke som flaskebunner. Han ser deg likevel.',
    model: { kin: 'manniska', profession: 'hantverkare', age: 'gammal', clothes: { top: 0x5a5a4a, pants: 0x3a3428 } },
    sched: [[0, 'ek_up'], [7, 'ek_bar'], [23, 'ek_up']],
    shopHours: [7, 23],
    greet: c => (fl('ekehusShut') ? 'Alle rom er fulle, og jeg skal akkurat stenge.' : fl('ekehusOk') ? 'Velkommen tilbake. Sett deg.' : 'Hva er du for en? Har du noe med [greven] å gjøre?'),
    topics: {
      NAVN: 'Ebbe. Jeg har drevet Ekehus i tretti år. Kvarnen var her før meg. Den blir her etter.',
      JOBB: c => (fl('ekehusShut') ? 'Jeg stenger. Ridderskors er grevens svigersønn, vet du.' : 'Jeg har [rom], [mat] og [øl]. Mest for bønder som kommer med kornet sitt til kvarnen.'),
      GREVEN: c => { flag('ekehusOk'); return 'Ikke? Godt. Sett deg, da. Torgils, flytt deg.'; },
      RIDDERSKORS: c => { flag('ekehusShut'); return 'Ridderskors? Bøndene reiser seg og går. Ebbe tørker disken. Jeg skal akkurat stenge, og alle rom er fulle. Markisen er grevens svigersønn, vet du.'; },
      ROM: c => (fl('ekehusShut') ? 'Fullt.' : { act: 'ed_room' }),
      MAT: c => (fl('ekehusShut') ? 'Kjøkkenet er stengt.' : { act: 'ed_meal2' }),
      ØL: c => (fl('ekehusShut') ? 'Tomt.' : { act: 'ed_ale' }),
      SKILTET: 'Det står «Välkommen till Ekehus Gästgiveri». Det knirker når det blåser. Jeg liker det.',
    },
    closedLine: 'Det er stengt.',
  },
  {
    id: 'ed_brunolf', name: 'Brunolf', short: 'en storvokst bonde med helskjegg', title: 'bonde i Akershus',
    look: 'Diger, med et svaiende helskjegg og et ølkrus som ser lite ut i neven hans.',
    model: { kin: 'manniska', profession: 'hantverkare', age: 'medel', clothes: { top: 0x5a4a30, pants: 0x3a3020 } },
    sched: [[0, 'gard1_bed'], [6, 'gard1_out'], [17, 'ek_t1'], [23, 'gard1_bed']],
    greet: c => (fl('ekehusOk') ? 'Ja, ja. Sett deg.' : 'Hva er dere for noen? Fremmede er ikke velkomne her nå. Har du noe med [greven] å gjøre?'),
    topics: {
      NAVN: 'Brunolf. Gården ved dammen er min.',
      JOBB: 'Jeg dyrker korn og har lite til overs for soldater.',
      GREVEN: c => { flag('ekehusOk'); return 'De dumme hodene kom hit for å jakte [lortinger], som så skulle ha angrepet oss. Så kom Eken og jaget dem, og sa at her fikk de ikke jakte. Så ble greven sur og sendte hit en masse soldater. Se hva de har gjort! De har vært her en uke og har allerede plyndret [Torgils] her ved siden av meg. Tvi vøle, dem vil vi ikke ha her!'; },
      TORGILS: 'Han sitter der. Han sier ikke så mye nå om dagen. Det sier nok.',
      PENGENE: 'Det var vel hertigen som sto bak. Den gjerrigknarken Ridderskors ville aldri gjort noe sånt om ikke hertigen hadde bedt ham. Han er den gjerrigste som går på to bein.',
      KETTIL: c => (has('kettil_lik') || has('kurir') ? 'Den gynnaren drakk vel opp hvert koppermynt på Galande Tuppen, ha ha! ... Drept? Og uten kiste? Bøndene blir stille. Så er det vel bare Ridderskors og greven som tjener på det. Baronen vår holder hardt på pengene, men noe sånt ville han aldri gjort. Ridderskors slår to fluer i en smekk: han blir kvitt Kettil og får pengene tilbake. Og greven har fortsatt en god grunn til å avsette Eken. Det har de klekket ut sammen, greven og svigersønnen hans.' : 'Den gynnaren drakk vel opp hvert koppermynt på Galande Tuppen, ha ha!'),
      LORTINGER: c => {
        const ok = has('pil') || has('kettil_hull') || has('papir');
        if (ok) clue('hullingar');
        return `Vi har sett dem i skogen sør og øst for her, mer enn på mange år. De brente ei koie.${ok ? ' Hullingpiler, sier du? Det er det bare lortingene som bruker. Ingen bonde ville kastet bort jern på sånt.' : ''}`;
      },
      ERERIK: 'Ingen Ererik her. Ingen i hele Eke heter det. Det er jeg sikker på.',
    },
  },
  {
    id: 'ed_torgils', name: 'Torgils', short: 'en mager bonde som stirrer i krusset', title: 'bonde i Akershus',
    look: 'Tynn og stille. Han ser ut som en som har mistet noe og ikke vet hvor han skal lete.',
    model: { kin: 'manniska', profession: 'hantverkare', age: 'gammal', clothes: { top: 0x4a4a3a, pants: 0x3a3428 } },
    sched: [[0, 'torgils_bed'], [6, 'torgils_farm'], [12, 'torgils_in'], [13, 'torgils_farm'], [17, 'ek_t3'], [22, 'torgils_bed']],
    greet: 'Hm.',
    topics: {
      NAVN: 'Torgils.',
      JOBB: 'Jeg hadde sauer. Grevens menn tok dem, og halve kornet.',
      SAUENE: 'Ikke si det til dem. Da tar de resten.',
      SVARTFOLKET: 'Jeg så tre av dem ved skogkanten sør for gården min for to netter siden. De så på meg. Så gikk de sørover. Ikke noe tull, de gikk som soldater.',
    },
  },
  {
    id: 'ed_grim', name: 'Mjølneren Grim', short: 'en melhvit mjølner', title: 'mjølner i Akershus',
    look: 'Hvit av mel fra hår til støvler. Bare øynene er mørke.',
    model: { kin: 'manniska', profession: 'hantverkare', age: 'medel', clothes: { top: 0xe0dccc, pants: 0xb8b0a0 } },
    sched: [[0, 'mill_bed'], [5, 'mill_in'], [12, 'mill_door'], [13, 'mill_in'], [20, 'ek_t4'], [23, 'mill_bed']],
    greet: c => (item('brevMjolnare') ? 'Er det brev til meg? Jeg venter på noe fra Pharynx.' : 'Kvarnen maler for hele Eke. Vinden når ikke inn i skogen, så elva gjør jobben.'),
    topics: {
      NAVN: 'Grim. Det er navnet, ikke humøret.',
      JOBB: 'Alle bønder i Eke sender kornet sitt hit. Kvarnen er den eneste i baroniet. Dammen holder vannet oppe, hjulet gjør resten.',
      BREV: c => {
        if (!item('brevMjolnare')) return 'Jeg venter på en kappe fra en skredder i Pharynx. Brevet om den skulle komme med kurirposten. Det kommer vel aldri.';
        take('brevMjolnare');
        clue('brev_mjolnare');
        return 'Fra skredderen i Pharynx! Kappen er ferdig «til lørdag». Han ser på den tygde kanten. Hvordan har du fått tak i dette? Det skulle komme med hertigens kurir. All post fra Pharynx gjør det.';
      },
      KUREREN: 'Hertigens kurir kommer innom med post fra Pharynx, en gang hver uke eller to. Han er forsinket.',
    },
  },
];

// --- Akershus borg -------------------------------------------------------------------------
const AKERSHUS_BORG = [
  {
    id: 'ed_baron', name: 'Baron Ragnvalde', short: 'en kraftig mann med stort skjegg', title: 'baron Ragnvalde Görelsson av Eke',
    look: 'Kraftig av kropp, ord og handling, med buskete mørkebrunt hår og et stort helskjegg. Han ler vanligvis høyt og ofte. Ikke nå.',
    model: { kin: 'manniska', profession: 'jagare', age: 'medel', clothes: { top: 0x3a5a2a, pants: 0x3a2a1a, hood: 0x2e4a24 }, armor: { mat: 'nit' } },
    sched: [[0, 'baron_bed'], [6, 'baron_walk'], [8, 'baron_study'], [12, 'baron_walk'], [14, 'baron_study'], [22, 'baron_bed']],
    greet: c => (fl('peace') ? 'Hertigens mann! Så det var lortingene hele tiden. Kom, sett deg, vi har kjøtt igjen nå.' : 'Så, hertigens folk. Kom inn og sett deg. Pass hodet, taket er lavt, og humøret mitt er lavere.'),
    topics: {
      NAVN: 'Ragnvalde Görelsson, baron av Eke. Folk kaller meg Eken. Til ansiktet.',
      JOBB: 'Jeg er baron av Eke, men jeg ser meg mer som en talsmann for folket her enn som en hersker. Jeg tar ikke ut mer skatt enn jeg trenger. Det har gjort meg populær hos bøndene og upopulær hos alle andre.',
      KETTIL: 'Såå, de slynglene har vevd sammen enda en komplott mot meg. Skjønner du hva som har skjedd? Ridderskors sendte av gårde sin forhatte ridder med en tom kiste, og ordnet det slik at grevens menn tok livet av ham. Og så gir de meg skylden! Meg, som ikke engang visste om noen [penger]! Nå har jeg hertigen og markisen mot meg også. Fint, altså!',
      PENGER: 'Fem hundre gullmynt, sier du? Til greven? For min skyld? Ingen har sagt et ord til meg om det. Ingen bud har kommet hit, i hvert fall ikke forbi grevens soldater.',
      GREVEN: 'Grevens forbannede jaktselskap skulle vært akkurat den grunnen [svartfolket] trengte for å angripe meg. Det var det han planla, den listige greve Edelfara. Enten måtte jeg gå imot ordren hans, eller så ville landet mitt bli herjet av lortingene. Så kunne han, med hertigens hjelp, rense ut lortingene og sette sin egen sønn i Akershus. Som det ser ut nå, får han det som han vil likevel. Men stol på at vi skal kjempe!',
      SVARTFOLKET: c => { clue('svartfolk'); return 'Den siste uka har de strøket rundt her som katter rundt varm grøt. De brente en skogshuggers koie, men ellers har de vært merkelig stille. Flere flokker med orcher og svartalfer er sett i skogene sør og øst for Akershus. Det har ikke skjedd på mange år.'; },
      PILEN: c => {
        if (!(has('pil') || has('kettil_hull'))) return 'Hvilken pil?';
        clue('hullingar');
        return 'Vis meg. Hm. Hullinger, svarte fjær, tre fra dypt inne i Torilskogen. Det er svartfolkets arbeid. Ingen andre bruker sånne.';
      },
      TANNMERKER: c => {
        if (!has('tann')) return 'Tannmerker? I hva?';
        clue('papirspiser');
        return 'I tjæren på en depesj? Orcher spiser alt. Til og med papir, når de er sultne nok. Og de er alltid sultne.';
      },
      KUREREN: 'Jeg vet ingenting om noen kurir. Og jeg kjenner ingen [Ererik].',
      ERERIK: 'Aldri hørt navnet.',
      TRIGORM: 'Jeg har en soldat som heter Trigorm Detlefsson. Han venter på brev fra kona si i Pharynx. Hun er med barn. Han er ikke til å holde ut.',
      JÖRNE: c => (has('jorne') ? 'Ja, jeg skylder baron Jörne to hundre gullmynt. Han får dem. Når jeg har dem. Det har ingenting med Kettil å gjøre, og det vet Jörne.' : 'Naboen i sør. Grei kar. Flink med penger.'),
      EDELINA: c => (has('edelina') ? 'Baronen rødmer under skjegget. Det er lenge siden. Hun valgte gull, eller faren valgte for henne. Det er ikke derfor jeg sitter her.' : 'Grevens datter. Hva med henne?'),
      SØNNENE: 'Åke og Göran. Gode gutter. De fikk smake krig forrige uke. Jeg håper de slipper mer.',
      LEKH: c => (has('lekh') || has('leir') ? 'Lekh? Svartalfen med de store føttene? Han har vært en torn i siden på Eke i årevis. Er han i dette, er han hjernen. Han er den eneste av dem som har en.' : 'Hvem?'),
    },
  },
  {
    id: 'ed_ake', name: 'Åke', short: 'en ung mann med farens skjegg på vei', title: 'baronens eldste sønn',
    look: 'Seksten, kanskje sytten. Han prøver å se farlig ut og klarer nesten.',
    model: { kin: 'manniska', profession: 'jagare', age: 'ung', clothes: { top: 0x3a5a2a, pants: 0x3a2a1a, hood: 0x2e4a24 } },
    sched: [[0, 'son_bed'], [7, 'son_court'], [12, 'son1'], [14, 'son_court'], [22, 'son_bed']],
    greet: 'Far sier vi ikke skal snakke med fremmede. Du er inne, så du er vel ikke fremmed lenger.',
    topics: {
      JOBB: 'Jeg vokter muren med Göran. Vi skjøt to av grevens menn i beinet forrige uke. De skrek veldig.',
      SVARTFOLKET: 'Jeg har sett lys i skogen sør for elva om natta. Mange lys. Far sier det er kolbrennere. Det er ikke kolbrennere.',
    },
  },
  {
    id: 'ed_goran', name: 'Göran', short: 'en gutt med bue', title: 'baronens yngste sønn',
    model: { kin: 'manniska', profession: 'jagare', age: 'ung', clothes: { top: 0x4a6a2a, pants: 0x3a2a1a, hood: 0x3e5a24 }, child: true },
    sched: [[0, 'son_bed'], [8, 'son_court'], [12, 'son2'], [15, 'son_court'], [21, 'son_bed']],
    greet: 'Er du en spion? Spioner sier alltid nei.',
    topics: {
      JOBB: 'Jeg skyter. Far sier jeg er best av oss alle. Han sier det til Åke også.',
      EKORN: 'Jeg har skutt fire i dag. Kokka vil ikke ha dem.',
    },
  },
  {
    id: 'ed_trigorm', name: 'Trigorm Detlefsson', short: 'en urolig soldat', title: 'soldat i Akershus borg',
    look: 'En ung soldat som går fram og tilbake på muren, opp og ned, opp og ned.',
    model: { kin: 'manniska', profession: 'krigare', age: 'ung', clothes: { top: 0x2a4a22 }, armor: { mat: 'nit' }, helmet: { hid: 'oppenhjalm' }, weapon: 'kortspjut' },
    sched: [[0, 'trigorm_bed'], [6, 'trigorm_gate'], [12, 'trigorm_wall'], [18, 'trigorm_gate'], [22, 'trigorm_bed']],
    greet: c => (item('brevTrigorm') ? 'Har du... er det et brev? Til meg?' : 'Har du sett en kurir på veien? Han skulle vært her for lenge siden.'),
    topics: {
      NAVN: 'Trigorm Detlefsson. Fra Kessirel utenfor Pharynx.',
      JOBB: 'Soldat hos baron Eke. Jeg venter på [brev] fra kona mi.',
      BREV: c => {
        if (!item('brevTrigorm')) return 'Fra Brigetta. Hun skal ha barn. Kureren tar med posten fra Pharynx, men han har ikke kommet.';
        take('brevTrigorm');
        clue('brev_trigorm');
        return 'Fra Brigetta! Han river opp brevet og leser, og ansiktet går fra bekymret til strålende. Hun har det bra! Så ser han på den tygde kanten. Men hvordan har du fått tak i det? Hertigens kurir skulle hatt det med seg. All posten fra Pharynx kommer med ham.';
      },
      KUREREN: 'Han kommer fra Sortmund-veien. Han skulle vært her for ti dager siden.',
    },
  },
  {
    id: 'ed_ab_soldat', name: 'Soldaten Ivar', short: 'en soldat med bandasjert arm', title: 'soldat i Akershus borg',
    model: { kin: 'manniska', profession: 'krigare', age: 'medel', clothes: { top: 0x2a4a22 }, armor: { mat: 'nit' }, helmet: { hid: 'oppenhjalm' }, weapon: 'kortspjut' },
    sched: [[0, 'soldier_bed'], [6, 'soldier_gate'], [12, 'soldier_tower'], [18, 'soldier_gate'], [22, 'soldier_bed']],
    greet: 'Du ga fra deg våpnene i porten. Du får dem igjen når du går. Kanskje.',
    topics: {
      JOBB: 'Vi slo tilbake det første angrepet med bare lette sår. Borgen tåler et par måneders beleiring. Mat har vi. Tålmodighet har vi mindre av.',
      KATAPULTEN: 'De har satt opp en katapult ved teltene. Når den begynner, holder ikke muren lenge.',
    },
  },
];

// --- Glimming ------------------------------------------------------------------------------
const GLIMMING = [
  {
    id: 'ed_hov', name: 'Hovmester Ambjörn', short: 'en stiv hovmester i livré', title: 'grevens hovmester',
    look: 'Rak som en lanse og like varm. Livreet er strøket, nesen er høy.',
    model: { kin: 'manniska', profession: 'lardman', age: 'gammal', clothes: { top: 0x1e2040, pants: 0x18182a } },
    sched: [[0, 'hov_bed'], [7, 'hov_door'], [12, 'hov_hall'], [14, 'hov_door'], [20, 'hov_hall'], [23, 'hov_bed']],
    greet: c => (fl('glimmingOk') ? 'Greven venter i salen. Ikke la ham vente for lenge. Han liker det ikke.' : 'Glimming. Hvem skal jeg melde?'),
    topics: {
      NAVN: 'Ambjörn, hovmester på Glimming i tjueto år.',
      JOBB: 'Jeg melder gjester, holder orden på tjenerne og passer på at greven aldri trenger å tenke på noe. Det siste er det viktigste.',
      LEJDEBREV: c => { if (!lejde()) return 'Jeg ser ikke noe brev.'; flag('glimmingOk'); return 'Hertigens segl... Et øyeblikk. Han forsvinner inn og kommer tilbake etter et minutt. Greven tar imot dere. I salen.'; },
      JAKTEN: 'Ja, det var mitt forslag. Jeg fikk et brev fra en [Herr Styrbiorn], annen sønn av greven av Ulfvenberg i det nordligste Pharynx. Han skulle komme som gjest noen dager senere, men dukket aldri opp. Jakten ble holdt likevel.',
      STYRBIORN: { act: 'ed_bribe_hov' },
      GREVEN: 'Greven er en stor venn av jakt og tornerspill. Han liker ikke å bli forstyrret. Han liker heller ikke å kjede seg. Det er en balansegang.',
    },
  },
  {
    id: 'ed_greve', name: 'Greve Sebestid', short: 'en ung adelsmann i silke', title: 'greve Sebestid Natthök av Edelfara',
    look: 'Ung og bortskjemt, i silke. Rene, edle trekk, men gulaktig hud og spinkel kropp. Han ser ut som en som alltid har fått det han pekte på.',
    model: { kin: 'manniska', profession: 'bard', age: 'ung', clothes: { top: 0xd8d0b8, pants: 0x1e2040, extra: 'cape', cape: 0x1e2040 } },
    sched: [[0, 'greve_bed'], [9, 'greve_walk'], [10, 'greve_hall'], [13, 'greve_walk'], [15, 'greve_hall'], [23, 'greve_bed']],
    greet: c => {
      if (!fl('glimmingOk')) return 'Hvem slapp deg inn? Hovmesteren min melder folk. Det er det han er til for.';
      if (fl('peace')) return 'Hm. Lortinger. I mine skoger. Jeg har trukket troppene hjem. Ikke fordi noen ba meg om det.';
      return 'Jaså, dere kommer fra hertigen... Hva kan han ha med dette å gjøre? En liten intern affære som denne burde knapt bekymre ham.';
    },
    topics: {
      NAVN: c => (fl('glimmingOk') ? 'Sebestid Natthök, greve av Edelfara. Det står på alt jeg eier. Det er mye.' : 'Spør hovmesteren.'),
      JOBB: c => (fl('glimmingOk') ? 'Jeg jakter, jeg holder tornerspill, og jeg holder fester folk snakker om i årevis. Og så må jeg ta meg av [Eke]. Det er det minst morsomme.' : 'Det angår deg ikke.'),
      EKE: c => (fl('glimmingOk') ? 'Gi meg bare en uke, så skal jeg nok røyke ut den slimete ormen Eke fra hullet han gjemmer seg i. Han tøyer virkelig tålmodigheten min. Ikke nok med at han overser innkallelsene mine, han graver sin egen grav også. Jeg antar dere har hørt om velbårne Riddar [Kettil]s tragiske skjebne?' : 'Spør hovmesteren.'),
      KETTIL: c => (fl('glimmingOk') ? 'Akk, akk, det er en hard verden vi lever i. Akkurat det man kunne vente seg fra Eke. Gjelden kveler ham, vet dere. Nok om dette. Hva er grunnen til dette uventede og ærefulle besøket?' : 'Spør hovmesteren.'),
      JAKTEN: c => (fl('glimmingOk') ? 'Litt underholdning må man jo by gjestene sine. En av dem foreslo en jakt, og jeg syntes det var en utmerket idé! Hvem kunne ane at stakkars Eke skulle ta det så tungt? Bekymre seg for noen skitne svartfolk, pytt sann! Fattiglappen var bare redd for at de skulle felle en av de dyrebare hjortene hans. Hvem som foreslo det? Kjære dere, tror dere virkelig jeg legger sånne trivialiteter på minnet? Men når jeg tenker etter, tror jeg faktisk det var [hovmesteren] min.' : 'Spør hovmesteren.'),
      HOVMESTEREN: 'Ambjörn. Han husker alt jeg glemmer. Det er derfor jeg betaler ham.',
      MARKISEN: 'Min svigersønn. Rik som et troll og like gavmild. Han sendte penger for å kjøpe fred til Eke. Fred! Med Eke!',
      SVARTFOLKET: c => (has('leir') || has('lekh') ? 'Lortinger som angriper Akershus? Det ville jo løst problemet mitt. Nei, det mente jeg ikke. Ikke helt.' : 'Pytt.'),
      FREDEN: c => (fl('peace') ? 'Baronen og jeg har... kommet til en forståelse. Han kommer til Glimming neste måned. Med hatten i hånda, håper jeg.' : 'Fred med Eke? Når han kommer krypende.'),
    },
  },
  {
    id: 'ed_gl_livvakt', name: 'Livvakten Orm', short: 'en livvakt i svart', title: 'grevens livvakt',
    model: { kin: 'manniska', profession: 'krigare', age: 'medel', clothes: { top: 0x16161c }, armor: { type: 'plat' }, helmet: { hid: 'tunnhjalm' }, weapon: 'bredsvard' },
    sched: [[0, 'livvakt_bed'], [6, 'livvakt1'], [12, 'livvakt_round'], [14, 'livvakt1'], [22, 'livvakt_bed']],
    greet: 'Gå rolig.',
    topics: { JOBB: 'Jeg passer på greven. Han passer på hjortene. Alle passer på noe.' },
  },
  {
    id: 'ed_rasmus', name: 'Rasmus', short: 'en munter vert', title: 'vert på Kräklan & Svärdet',
    look: 'Munter og svett, med en krok i stedet for venstre hånd. Han henger kruset på den.',
    model: { kin: 'manniska', profession: 'hantverkare', age: 'medel', clothes: { top: 0x6a3a2a, pants: 0x3a2a24 } },
    sched: [[0, 'krak_up'], [7, 'krak_bar'], [24, 'krak_up']],
    shopHours: [7, 24],
    greet: 'Velkommen til Kräklan & Svärdet! Vi har rom, mat og god plass for den som kommer langveis fra.',
    topics: {
      NAVN: 'Rasmus. Kräklan er meg, svärdet var den som tok hånda. Jeg vant likevel.',
      JOBB: 'Jeg har [rom] og [mat] og [øl] til normale priser. Det er sjeldent her i distriktet, kan du spørre om i Sortmund.',
      ROM: { act: 'ed_room' }, MAT: { act: 'ed_meal' }, ØL: { act: 'ed_ale' }, RYKTER: { act: 'ed_rumor' },
      GREVEN: 'Han kommer hit iblant og spanderer på alle. Så går han uten å betale. Det jevner seg ut.',
    },
    closedLine: 'Vi har stengt.',
  },
  {
    id: 'ed_ylva', name: 'Ylva', short: 'en skarp kvinne med kurv', title: 'bykvinne i Glimming',
    look: 'Skarp i blikket og rask i kjeften, med en kurv full av egg og meninger.',
    model: { kin: 'manniska', profession: 'nasare', age: 'medel', clothes: { top: 0x5a3a5a, pants: 0x2a2030 } },
    sched: [[0, 'krak_up'], [7, 'field_w'], [12, 'krak_yard'], [16, 'krak_t1'], [22, 'krak_up']],
    greet: 'Du er ikke herfra. Det ser man på skoene.',
    topics: {
      NAVN: 'Ylva.',
      JOBB: 'Jeg selger egg til borgen. Hovmesteren teller dem to ganger. Greven spiser dem en gang.',
      KETTIL: c => { clue('greve_tjener'); return 'Mja, nå kan man si at greven tjener på det. Baron Eke havner jo i potten. Nå kan nok ingenting stoppe greven. Han er vant til å få det som han vil, skjønner du. Kanskje han lot Kettil drepe, med eller uten markisens velsignelse, for å ta pengene og holde bråket i gang.'; },
      GREVEN: 'Her i Glimming er vi ikke så lojale som de er i Sortmund og Akershus. Vi bor for nær.',
    },
  },
  {
    id: 'ed_brodd', name: 'Brodd', short: 'en gammel stallkar', title: 'stallkar på Kräklan',
    model: { kin: 'manniska', profession: 'hantverkare', age: 'gammal', clothes: { top: 0x4a3a2a, pants: 0x2a2420 } },
    sched: [[0, 'krak_up'], [6, 'krak_yard'], [19, 'krak_t3'], [23, 'krak_up']],
    greet: 'Hestene først, folk etterpå.',
    topics: {
      JOBB: 'Jeg steller hestene til dem som overnatter.',
      JAKTEN: 'Jeg sadlet hestene til grevens venner. Fine folk. Ikke en eneste av dem kunne sitte på en hest. De kom tilbake samme kveld, uten bytte og uten hatter.',
      STYRBIORN: 'Herr Styrbiorn? Aldri sett. Han skulle visst komme. Ingen hest ble sadlet for ham.',
    },
  },
];

// Samme sak, flere ord: modulens navn på adelsmennene og svartfolket peker til de samme emnene
const SAME = [['GREVEN', 'EDELFARA'], ['MARKISEN', 'RIDDERSKORS'], ['EKE', 'BARONEN'], ['SVARTFOLKET', 'LORTINGER', 'ORCHER'], ['SVARTFOLK', 'LORTINGER', 'ORCHER'], ['LORTINGER', 'SVARTFOLKET', 'ORCHER']];
function aliases(list) {
  for (const def of list) {
    const t = def.topics || (def.topics = {});
    for (const [a, ...bs] of SAME) if (t[a]) for (const b of bs) if (!t[b]) t[b] = t[a];
  }
  return list;
}

export const PEOPLE_BY_AREA = {
  ekeskogen: aliases(EKESKOGEN), sortmund: aliases(SORTMUND), ridderskors: aliases(RIDDERSKORS), akershus: aliases(AKERSHUS),
  akershus_borg: aliases(AKERSHUS_BORG), glimming: aliases(GLIMMING), lagret: [],
};

// --- Scener: ting du undersøker (Talk med board: true) ---------------------------------------------
export function scene(id, life) {
  const P = G.player;
  const once = k => { if (fl('once_' + k)) return false; flag('once_' + k); return true; };
  const S = {
    kurir: {
      id: 'scene_kurir', name: 'En død mann', title: 'under en busk ved veiskillet', board: true,
      start: ['PILEN', 'VESKEN', 'RINGEN', 'SPORENE'],
      greet: () => { clue('kurir'); return 'Under en busk stikker et par blankpussede ridestøvler fram. De har en eier, og han er død. Kort grønn tunika og ridebukser, og skaftet av en avbrukket armbrøstpil i brystet. Blodet på bakken er svart og tørt. Det kan ikke være mange dager siden. Ved hodet ligger en grønn kurerhatt, og på høyre langfinger sitter hertigens av Pharynx velkjente våpenring.'; },
      topics: {
        PILEN: () => {
          if (once('pil')) {
            // en med lokalkunnskap vet hvor treet vokser: et normalt INT-slag (uv)
            const r = P.attrRoll('INT', 10, { label: 'INT' });
            G.ui.logRoll(r, r.success ? 'Du kjenner treslaget.' : 'Treslaget sier deg ingenting.');
            if (r.success) clue('pil'); else flag('pilFail');
          }
          return `Skaftet er brukket på midten. Spissen sitter dypt og har hullinger. Noen svarte fjærstrå henger igjen på skjorta.${has('pil') ? ' Treet i skaftet vokser bare langt inne i Torilskogen.' : ''}`;
        },
        VESKEN: 'En skulderveske i blodflekket lær. Låsen er hel, men bunnen er skåret opp, og den er tom. De som gjorde det, brydde seg ikke om låsen.',
        RINGEN: 'Hertigens våpenring. Mannen var en av hertigens kurerer. Ringen er verdt mer enn en hest, og den sitter der fortsatt. Den som drepte ham, var ikke ute etter penger. Eller så visste de ikke hva en ring er verdt.',
        SPORENE: () => {
          if (once('spor_kurir')) {
            // svårt fardighetsslag i Spåra (s. 2): -5 på CL (uv)
            const r = P.roll('Spåra', { mod: -5, label: 'Svårt Spåra' });
            G.ui.logRoll(r, r.success ? 'Store poter, mange av dem.' : 'Bakken forteller deg ingenting.');
            if (r.success) clue('ulvspor');
          }
          return has('ulvspor') ? 'Store ulvespor går i ring rundt kroppen. De leder inn i skogen og blir borte.' : 'Bakken er tråkket opp. Du ser ikke noe som gir mening.';
        },
        FARVEL: 'Du lar ham ligge. Noen bør begrave ham. Kanskje du.',
      },
    },
    depesch: {
      id: 'scene_depesch', name: 'Den svarte pakken', title: 'hertigens depesj', board: true,
      start: ['LEJDEBREVET', 'BREVET', 'TANNMERKER'],
      greet: () => 'Noen meter fra liket ligger en svart, firkantet pakke med jernbånd. Den er tullet i linduk, tjæret og forseglet med jerntråd og hertigens segl. Ett hjørne er revet i stykker. Inni ligger to pergamentark.',
      topics: {
        LEJDEBREVET: () => { give('lejdebrev'); return 'Et lejdebrev fra hertigen av Pharynx. Alle under hertigs rang er pålagt å hjelpe den som bærer det. Det gjelder en måned framover. Du stikker det innenfor skjorta.'; },
        BREVET: () => { clue('depesch'); return 'Vakker, nøyaktig skrift, en profesjonell skriver. Ekte pergament, og seglet til hertigens vaktkaptein. «Pharynx, den tjuetredje. Beste [Ererik]! Befaler Dem å skyndsomst undersøke mordet på Riddar [Kettil] og hvor pengekisten han hadde med seg ble av. Vær diskret. Deres hemmelige identitet er ikke verdt å avsløre. Vær varsom med greve [Edelfara] i Glimming, baron [Eke] i Akershus og markis [Ridderskors] i Sortmund. Trolig står en av dem bak. Undersøk hvilke motiver de kan ha hatt, og rapporter så til meg i Pharynx. Striden mellom baron Eke og greve Edelfara må få en ende. Lykkes De, skal hertigens ynnest være Deres!»'; },
        TANNMERKER: () => { clue('tann'); return 'Små, skarpe merker i tjæren, som om et dyr har prøvd å spise pakken. Det ga visst opp. Tjære smaker ikke godt, selv ikke for et dyr.'; },
        ERERIK: 'Brevet er til en Ererik, med en hemmelig identitet. Kanskje du kan være ham, en stund. Ingen her vet hvordan han ser ut.',
        FARVEL: 'Du pakker depesjen inn igjen. Den er tyngre enn den ser ut.',
      },
    },
    kettil: {
      id: 'scene_kettil', name: 'Riddar Kettil Ormstunga', title: 'på båren i kapellet', board: true,
      start: ['SÅRET', 'RINGBRYNJA'],
      greet: () => 'Riddar Kettil ligger på båren i ringbrynje, vasket og pyntet med blomster. Han var en stor mann. Det eneste tegnet på vold er et usedvanlig stort hull i brystet.',
      topics: {
        SÅRET: () => {
          if (once('kettil1')) {
            // normal INT-kontroll, deretter svår INT-kontroll (s. 8)
            const r = P.attrRoll('INT', 10, { label: 'INT' });
            G.ui.logRoll(r, r.success ? 'Du ser hva som har skjedd.' : 'Et hull. Det sier deg ikke mer.');
            if (r.success) {
              clue('kettil_lik');
              const r2 = P.attrRoll('INT', 15, { label: 'Svår INT' });
              G.ui.logRoll(r2, r2.success ? 'Kantene forteller resten.' : 'Mer ser du ikke.');
              if (r2.success) clue('kettil_hull');
            }
          }
          return `${has('kettil_lik') ? 'Pilen har gått rett gjennom både ringbrynja og kroppen og ut på andre siden. Skytten må ha stått helt nær, med et svært kraftig armborst.' : 'Et stort hull midt i brystet.'}${has('kettil_hull') ? ' Kantene er flerret opp: pilen hadde hullinger.' : ''}`;
        },
        RINGBRYNJA: 'Ringene er sprengt inn foran og ut bak. Det er ikke en vanlig armbrøst som gjør det.',
        HALSEN: 'Folk sier strupen hans var skåret over. Den er ikke det. Folk sier mye.',
        FARVEL: 'Du lar ham hvile. Blomstene lukter søtt.',
      },
    },
    papir: {
      id: 'scene_papir', name: 'En papirbit', title: 'på veien mot Akershus', board: true, start: ['LYTTE'],
      greet: () => { clue('papir'); return 'En fuktig papirbit ligger i veien, og et par meter unna en til. Det er umulig å se hva som har stått på dem. De er klissete, som om noen har tygget på dem.'; },
      topics: {
        LYTTE: 'Du står stille og lytter. Noen hundre meter inne i skogen, mot øst, hører du svak grynting, som fra et villsvin. Flere papirbiter ligger med noen meters mellomrom inn mellom trærne.',
        FARVEL: 'Du stikker papirbiten i lomma.',
      },
    },
    ledare: {
      id: 'scene_ledare', name: 'Ledarorchen', title: 'han som tygget papir', board: true, start: ['PUNGEN', 'PAPIRENE'],
      greet: () => 'Ledarorchen ligger på ryggen med åpen munn. Det sitter papirrester mellom tennene hans. I sekken har han en liten skinnpung.',
      topics: {
        PUNGEN: () => { if (!item('mynt')) { give('mynt'); clue('mynt'); } return 'Ti glitrende gullmynt med hertigens av Pharynx stempel. Mer enn en orch tjener på et helt liv. Du tar dem med. De kan si noe til noen.'; },
        PAPIRENE: () => {
          if (!fl('orcbrev')) { flag('orcbrev'); give('brevMjolnare'); give('brevTrigorm'); clue('orcbrev'); }
          return 'Restene av to brev, tygget i kantene. Det ene er fra en skredder i Pharynx til mjølneren i Akershus, som enkelt melder at kappen hans er ferdig «til lørdag». Det andre er et glødende kjærlighetsbrev fra fru Brigetta Hansdotra i Kessirel utenfor Pharynx til Trigorm Detlefsson, menig soldat i Akershus borg.';
        },
        FARVEL: 'Du lar ham ligge. Ingen kommer til å savne ham, unntatt kanskje lederen hans.',
      },
    },
    fange: {
      id: 'scene_fange', name: 'En såret orch', title: 'på bakken, med blod i munnen', board: true, start: ['FORHØRE'],
      greet: () => 'Orchen ligger og hiver etter pusten. Han lever, men ikke lenge. Han ser på deg med gule øyne.',
      topics: {
        FORHØRE: () => {
          if (fl('fangeDone')) return 'Han er død. Han bet tungen av seg.';
          flag('fangeDone');
          const lang = (P.skills['Tala främmande språk'] || 0) > 0;
          if (!lang) return 'Han grynter noe på orchiska. Du forstår ikke et ord. Så bøyer han hodet bakover og biter tungen av seg selv. Det blir stille.';
          const r = P.roll('Tala främmande språk', { label: 'Orchiska' });
          G.ui.logRoll(r, r.success ? 'Du får fram noen ord på orchiska.' : 'Han forstår deg ikke, eller vil ikke.');
          if (!r.success) return 'Han spytter blod på deg og biter tungen av seg selv.';
          clue('fange');
          flag('lekhKnown');
          flag('trail');
          return 'Du får ham til å snakke. Høvdingen deres heter [Lekh]. Han er i skogen sør for Akershus med mange flere. Når menneskene har slått hverandre ut, skal de ta borgen. Så kommer han på andre tanker, og biter tungen av seg selv.';
        },
        LEKH: 'Navnet sier deg ingenting ennå. Men det vil det gjøre.',
        FARVEL: 'Du lar ham ligge.',
      },
    },
  };
  return S[id];
}
