import { reveal } from './worldtravel.js';
// Folk i Fristaden. Samtaler med nøkkelord som i Ultima IV og V:
// NAVN, JOBB og FARVEL virker alltid, og ord i [klammer] blir nye ord du kan spørre om.
// [vist|NØKKEL] viser "vist" men lærer NØKKEL.
// Et svar kan være tekst eller en funksjon (c) => tekst eller { say, act }.
// c: { P, run, life, npc, hour, night, isNebb, bg, rykte }
// bg er indeksen i AIDNE-tabellen (0 Fredlös ... 9 Högadel), eller null.
// teach: ferdighetene en lärare kan lære bort en uke om gangen, med lärarens FV (uv). Läraren har INT 13 eller mer.
// { fv, kin } betyr at bare det folket lærer den bort til nybegynnere.

const q = (c, id) => (c.run.quests[id] || (c.run.quests[id] = { state: 'none' }));

export const RUMORS = [
  'Folk sier det bor en [rev] med krone under byen. Folk sier mye rart etter tredje ølet.',
  'Dvergene fra [Karad Batur] handler i Fristaden fordi det er det eneste stedet som slipper dem inn med jern på seg.',
  'Tornväktarna sier at martyrene deres kommer tilbake når det trengs. Jeg har aldri sett noen komme tilbake fra noe som helst. Unntatt Tobolt, og han kommer tilbake hver dag.',
  'Kong Balian kaller seg [Solens beskyddare|BALIAN] nå. Hierofanten i Tibor kaller ham noe annet, men ikke så høyt.',
  'I [Kardunien] sier prestene at krydder er synd. Adelen der spiser svartsoppa med kanel og later som det er galle.',
  'Rottene i kloakken er store som hunder, sier de som har sett dem. De som har sett dem to ganger, sier kalver.',
  'Gynerva i tårnet har ikke sovet siden vårsolverv. Hun sier hun gjør det på dagtid, når ingen ser.',
  'Mester Flansen var visst en fryktet kjemper en gang. Nå er han fryktet i bakeriet.',
  'Vil du gjøre noe ingen skal se, så gjør det om natta. Utu ser alt solen når, og ikke en tomme mer.',
  'Under brua bor [Tobolt]. Gi ham en mynt, så forteller han hva rottene vet.',
  'Kjøpmann [Hvass] skylder halve byen penger og eier den andre halvparten.',
  'Det sies at man kan lese de gamle [runene] i dvergehallene hvis man kan språket. Bataar kan det, men han nekter å gå ned.',
];

export const DUNNO = [
  'Det vet jeg ingenting om.',
  'Hm? Det ordet har jeg ikke hørt.',
  'Spør noen andre. Spør Tobolt, han vet alt og ingenting.',
  'Nei, det kan jeg ikke svare på.',
  'Du snakker rart, men jeg skal ikke si det til noen.',
];

export const PEOPLE = [
  // --- Herr Nansen bruker butikken i main.js når den er åpen ----------------------
  {
    id: 'nansen', name: 'Herr Nansen', short: 'en and i forkle', title: 'butikkbetjent, ikke kjøpmann',
    look: 'En and i forkle. Han ser ut som en som har stått bak en disk hele livet, og som vet at han kommer til å gjøre det resten av livet også.',
    model: { duck: 'nansen' }, shopHours: [7, 21],
    sched: [[0, 'home_bed'], [6.5, 'home_in'], [7, 'shop_counter'], [21, 'home_in'], [22.5, 'home_bed']],
    greet: c => c.isNebb ? 'Nansen. Gutten min. Butikken er stengt, men du er ikke en kunde.' : 'Butikken er stengt. Kom tilbake i morgen, så skal jeg selge deg noe du ikke trenger.',
    topics: {
      NAVN: c => c.isNebb ? 'Du vet hva jeg heter. Jeg er faren din.' : 'Herr Nansen. Butikkbetjent. Ikke kjøpmann, det er [Hvass].',
      JOBB: 'Jeg står bak disken hos [Hvass] fra sju til ni. Etter ni står jeg her og tenker på disken.',
      HVASS: 'Sjefen. Han eier butikken og meg, hvis du spør ham. Han sier [safranen] er min feil.',
      SAFRAN: 'Hele lageret er borte. Noen kom inn gjennom [kloakken] om natta. Det luktet våt pels etterpå.',
      KLOAKKEN: 'Luken ligger på torget, ved butikken. Ikke gå ned dit. Eller gå, da. Du hører ikke på meg uansett.',
      MOR: c => c.isNebb ? 'Hun ville vært stolt av deg. Eller bekymret. Det var ofte det samme med henne.' : 'Hun var den kloke av oss. Hun er borte nå.',
      FARVEL: 'Lukk døra etter deg. Det trekker.',
    },
  },
  {
    id: 'hvass', barks: ['Tid er penger.', 'Hvor er safranen min?'], name: 'Kjøpmann Krystof Hvass', short: 'en tykk mann med fjærhatt', title: 'kjøpmann og laugsmester',
    look: 'En tykk mann med fjærhatt og ringer på alle fingrene. Han teller noe i hodet mens han ser på deg.',
    model: { kin: 'manniska', profession: 'nasare', age: 'gammal', clothes: { top: 0x6a2a3a, pants: 0x2a1a20 } },
    sched: [[0, 'manor_bed'], [7.5, 'manor_in'], [9, 'square_w'], [12, 'shop_back'], [15, 'square_c'], [18, 'inn_t3'], [21.5, 'manor_in'], [23, 'manor_bed']],
    greet: c => {
      if (c.bg === 9) return 'Å! En av fint folk. Velkommen, velkommen. Krystof Hvass, til tjeneste. Nesten til tjeneste.';
      if (c.bg === 6) return 'Du. Jeg kjenner igjen et laugsmerke når jeg ser det. Ikke tro at det gir deg rabatt. Det gir deg litt rabatt.';
      return c.isNebb ? 'Sønnen til Nansen. Har du funnet safranen min, eller er du bare her for å se på meg?' : 'Hva vil du? Jeg tar betalt for tiden min, så snakk fort.';
    },
    topics: {
      NAVN: 'Krystof Hvass. Kjøpmann. Laugsmester i [kjøpmannslauget|LAUGET]. Eier av Hvass handel, Hvass gård og en del av gjelda til alle andre.',
      JOBB: 'Jeg kjøper billig og selger dyrt. Det er hele kunsten. [Nansen] står i butikken for meg, så jeg slipper å se kundene.',
      NANSEN: c => c.isNebb ? 'Faren din er en god betjent. Ikke si det til ham, så slipper jeg å gi ham lønnsøkning.' : 'Betjenten min. En and. Han er treg, ærlig og billig. To av tre er bra.',
      SAFRAN: c => {
        const r = c.run.depthReached;
        return r >= 3 ? 'Sporet går til [Karad Batur]? Til dvergehallene? Hva skal en rev med safran der nede? Selge den til [Kardunien], selvfølgelig. Til de hyklerske adelsfolkene.' : 'Tre sekker safran fra [Kardunien]. Stjålet fra lageret mitt på én natt, gjennom kloakken. Finner du dem, skal du få en belønning. En liten en.';
      },
      LAUGET: c => {
        if (c.bg === 6 || c.bg === 9) { c.run.guild = true; return 'Kjøpmannslauget bestemmer prisene i Fristaden. Siden du er en av oss, skal du få laugspris overalt. Ti prosent. Ikke mer.'; }
        return 'Kjøpmannslauget bestemmer prisene. Du er ikke medlem. Det kan man se på deg.';
      },
      BELØNNING: 'Belønning? Når safranen står tilbake på lageret, snakker vi om det. Kanskje.',
      KARDUNIEN: 'Der sier prestene at krydder er synd. Derfor betaler adelen dobbelt for dem, i hemmelighet. Jeg elsker Kardunien.',
      FARVEL: 'Tiden er penger. Din var billig.',
    },
    bg: { 6: true, 9: true },
  },
  {
    id: 'flansen', name: 'Mester Flansen', short: 'en gammel and i tøfler', title: 'mester i Kvakk-Fu',
    look: 'En gammel and med hvite fjær, rød kappe og tøfler. Det ligger brødsmuler i fjærene hans.',
    model: { duck: 'flansen' }, shopHours: [6, 22],
    sched: [[0, 'dojo_bed'], [6, 'dojo_in'], [12, 'square_e'], [13.5, 'dojo_in'], [19, 'inn_t1'], [21.5, 'dojo_in'], [22.5, 'dojo_bed']],
    teach: { Slagsmål: 18, 'Quack-fu': { fv: 20, kin: 'anka' } },
    teachSay: 'En uke hos meg. Åtte timer om dagen, seks dager, og en dag til å klage. Du betaler i silver, jeg betaler i blåmerker.',
    teachText: 'Sju dager med spark, vagg og brød. Flansen sier ikke mye. Han slår.',
    greet: c => c.isNebb ? 'Nebb. Du står skjevt. Du har alltid stått skjevt.' : 'En elev? Nei. En fremmed. Fremmede kan også lære, hvis de har fjær å betale med.',
    topics: {
      NAVN: 'Flansen. Mester Flansen for elevene. Flansen for brødbakeren, som jeg skylder penger.',
      JOBB: 'Jeg lærer bort [Kvakk-Fu]. Svømmeføttenes vei. Jeg tar betalt i [fjær], fordi silver blir så tungt. Men vil du være [elev] en hel uke, tar jeg silver likevel.',
      'KVAKK-FU': 'Kvakk-Fu er kunsten å slå uten å tenke og tenke uten å slå. Mest det første. Spark når de venter et slag. Vagg når de venter et spark. Den er laget for ender. Andre kan prøve, men de faller mer.',
      FJÆR: 'Hver gang noen går ned i mørket og kommer tilbake, eller ikke kommer tilbake, får dojoen fjær. Ikke spør hvordan. Si [trening] hvis du vil bruke dem.',
      TRENING: { act: 'train', always: true },
      ELEV: { act: 'teachWeek', always: true },
      NEBB: c => c.isNebb ? 'Du var den verste eleven jeg har hatt. Og den eneste som kom tilbake hver dag. Det teller mer.' : 'Svart Nebb? Min verste elev. Han er sønnen til Nansen i butikken.',
      BRØD: 'Brød er livet. Tre brød er et godt liv. Fire brød er filosofi.',
      TØFLER: 'Man trener ikke i sko. Sko er for folk som er redde for gulvet.',
      FARVEL: 'Gå med svømmeføttene først.',
    },
  },
  {
    id: 'rosmynda', barks: ['Varm svartsoppa!', 'Tørk av føttene!'], name: 'Rosmynda', short: 'en kraftig kvinne med forkle', title: 'vertinne på Den feite gåsen',
    look: 'En kraftig kvinne med melk på forkleet og et blikk som har kastet ut større folk enn deg.',
    model: { kin: 'manniska', profession: 'hantverkare', age: 'medel', clothes: { top: 0x7a3a2a, pants: 0x4a3a30 } }, shopHours: [0, 24],
    sched: [[0, 'inn_bar'], [2, 'inn_stairs'], [7, 'inn_bar']],
    greet: c => c.night ? 'Sent ute. Vil du ha et [rom], eller vil du bare stå der og dryppe?' : 'Velkommen til Den feite gåsen. Tørk av føttene. Ja, du også.',
    topics: {
      NAVN: 'Rosmynda. Ros for vennene mine. Du er ikke en av dem ennå.',
      JOBB: 'Jeg driver vertshuset. [Rom] for natta eller for en hel uke, [mat] for magen, [øl] for resten. Og [rykter], hvis du sitter lenge nok.',
      ROM: { act: 'innRoom', always: true },
      MAT: { act: 'innMeal', always: true },
      ØL: { act: 'innAle', always: true },
      RYKTER: { act: 'rumor', always: true },
      GÅSEN: 'Den feite gåsen var en gås. Den var veldig feit. Mer trenger du ikke vite, og mer vil du ikke vite.',
      SVARTSOPPA: 'Svartsoppa er kokt på gåseblod, slik de gjør det i Kardunien. De bruker galle. Jeg bruker kanel. Shamash får tilgi meg.',
      ROTTER: 'Rottene kommer opp fra kloakken om natta og spiser alt. [Edegar] har lovet betaling til den som tar dem.',
      ISOLD: 'Alven synger her om kveldene. Folk drikker mer når hun synger. Jeg betaler henne i mat.',
      FARVEL: 'Kom tilbake. Ta med penger.',
    },
  },
  {
    id: 'cassian', name: 'Fader Cassian', short: 'en prest i gyllen kappe', title: 'solprest hos Utu',
    look: 'En solbrun mann i gyllen kappe med en solskive på brystet. Han smiler som om han vet noe om deg som du ikke vet selv.',
    model: { kin: 'manniska', profession: 'lard', age: 'medel', clothes: { top: 0xc89a30, pants: 0x6a4a1a } }, shopHours: [6, 22],
    sched: [[0, 'temple_bed'], [6, 'temple_altar'], [11, 'temple_steps'], [13, 'temple_altar'], [22, 'temple_bed']],
    greet: c => c.bg === 7 ? 'En bror i lyset! Eller søster. Utu bryr seg ikke, og ikke jeg heller. Kom inn i varmen.' : c.night ? 'Det er sent. Utu sover ikke, men det gjør prestene hans. Hva vil du?' : 'Solen skinner på deg, fremmede. Utu ser deg. Det er ment som en trøst.',
    topics: {
      NAVN: 'Cassian. Fader Cassian, når folk vil ha noe av meg. Det vil de nesten alltid.',
      JOBB: 'Jeg tjener [Utu] i Fristaden. Jeg [helbreder] de syke med HELA, gir [velsignelse] til de som går i mørket, og forklarer [Shamash] for de som har misforstått.',
      UTU: 'Utu er solens og rettferdighetens gud. Han ser alt solen når. Derfor handler vi på åpne torg, og derfor gjemmer tyver seg i [skyggene].',
      SKYGGENE: 'Det Utu ikke ser, må vi andre passe på. Om natta er Fristaden full av folk som har glemt det.',
      SHAMASH: 'I [Kardunien] tror de at Shamash er solguden, og at lidelse og sult er dyder. Hos oss tror vi at rikdom og glede skal vises fram i lyset. Det er mer behagelig.',
      KARDUNIEN: 'Naboriket. Tiggardrottningen styrer der, med Shamash-prestene. Vi var venner før. Nå er vi naboer.',
      BALIAN: 'Kong Balian av huset Zorac har utropt seg til Solens beskyddare. Hierofanten i Tibor var ikke spurt. Jeg sier ikke mer om det, Utu ser meg.',
      HELBREDER: { act: 'heal', always: true },
      VELSIGNELSE: { act: 'bless', always: true },
      SOLUR: 'Soluret foran tempelet viser tiden så lenge solen skinner. Om natta viser det ingenting, slik Utu vil.',
      FARVEL: 'Gå i lyset. Hvis du må gå i mørket, gå fort.',
    },
  },
  {
    id: 'jehanne', name: 'Syster Jehanne', short: 'en ridder i hvit våpenkjole', title: 'tornväktare',
    look: 'En høy kvinne i ringbrynje under en hvit våpenkjole med et svart tårn. Hun har et arr over det ene øyet, og hun ser på deg med det andre.',
    model: { kin: 'manniska', profession: 'riddare', age: 'medel', clothes: { top: 0xe8e2d4, cape: 0xe8e2d4 }, armor: { type: 'ring' }, helmet: null }, shopHours: [6, 22],
    sched: [[0, 'chapter_bed'], [6, 'memorial'], [8, 'chapter_in'], [12, 'memorial'], [13, 'chapter_in'], [19, 'inn_t2'], [21.5, 'chapter_in'], [22.5, 'chapter_bed']],
    teach: { Kortsvärd: 17, Bredsvärd: 19, Bastardsvärd: 17, 'Vanlig sköld': 18 },
    teachSay: 'Ordenen lærer bort sverdet til dem som vil verne de svake. Og til dem som betaler. Helst begge.',
    teachText: 'Sju dager på gårdsplassen bak kapittelhuset, fra morgenbønnen til kveldsbønnen.',
    greet: c => {
      if (c.rykte <= -3) return 'Du har stjålet fra de svake i denne byen. Jeg snakker ikke med tyver. Gå.';
      if (c.bg === 8) return 'Du bærer deg som en som er født til sverd. Velkommen, ridder. Ordenen har bruk for folk som deg.';
      return 'Fred være med deg. Hvis du kommer med fred.';
    },
    topics: {
      NAVN: 'Jehanne. Syster Jehanne av [Tornväktarorden|ORDENEN].',
      JOBB: 'Jeg vokter Fristaden for ordenen. Vi holder [orchene] borte fra passene og [de døde|DØDE] i gravene sine. Vil du lære sverd og skjold, kan du [trene|TRENING] med meg en uke. Har du gjort store [dåder], kan jeg vise deg hva de er verdt.',
      TRENING: { act: 'teachWeek', always: true },
      DÅDER: { act: 'hero', always: true },
      ORDENEN: 'Tornväktarorden ble grunnlagt for å bekjempe [Häxmästaren] i Svarta tornet. Han er død. Vi er ikke det. Vi har tre [løfter].',
      HÄXMÄSTAREN: 'Han satt i Svarta tornet i fjellene og sendte orcher mot alle levende. Ordenen vant. Tårnet er forseglet, og vi står vakt ved det.',
      LØFTER: 'Som riddere skal vi verne de svake. Som munker skal vi [helbrede] de syke. Som mystikere skal vi bevare de døde til de står opp igjen.',
      HELBREDE: { act: 'oathHeal', always: true },
      ORCHENE: 'Orchene i Aidnefjellene snakker svartiska og angriper alt som går over passene. Dvergene i [Karad Batur] kjemper sammen med oss.',
      MARTYRER: 'Våre falne kommer tilbake når det trengs mest. Navnene deres står på [minnesteinen].',
      MINNESTEINEN: 'Den står foran kapittelhuset. Les navnene, hvis du vil. Det er en ære for dem at noen leser.',
      DØDE: c => {
        const s = q(c, 'dode');
        const killed = (c.run.killsByType.skeleton || 0) - (s.base || 0);
        if (s.state === 'done') return 'Du har gitt seks av dem fred. Det glemmer jeg ikke.';
        if (s.state === 'active') {
          if (killed >= 6) { s.state = 'done'; return { say: 'Seks av dem har fått fred. Ta dette. Det har vært båret av en martyr, og nå av deg.', act: 'rewardDead' }; }
          return `Du har gitt ${Math.max(0, killed)} av seks fred. De vandrer fortsatt i hallene under byen.`;
        }
        s.state = 'active';
        s.base = c.run.killsByType.skeleton || 0;
        c.life.questLog('dode');
        return 'Under kloakken ligger Karad Baturs gamle haller. Der går de døde igjen, og det er ikke slik det skal være. Gi seks [skjeletter] fred, så skal ordenen takke deg.';
      },
      SKJELETTER: 'Bein uten sjel. Slå hardt, helst med noe som knuser. Stikk og piler går rett gjennom dem.',
      FARVEL: 'Vern de svake.',
    },
  },
  {
    id: 'bataar', name: 'Mäster Bataar', short: 'en dverg med sot i skjegget', title: 'smed fra Karad Batur',
    look: 'En bred dverg med sot i skjegget og armer som ser ut som de er smidd. Han lukter kull og jern.',
    model: { kin: 'dvarg', profession: 'hantverkare', age: 'gammal', clothes: { top: 0x5a3a28, pants: 0x3a3034 } }, shopHours: [7, 20],
    sched: [[0, 'smith_bed'], [6.5, 'smith_forge'], [12, 'inn_t4'], [13, 'smith_forge'], [20, 'inn_t4'], [22, 'smith_bed']],
    greet: c => c.night ? 'Smia er kald. Det er jeg også. Hva vil du?' : 'Hmf. Et menneske. Eller noe i den retningen. Trenger du jern?',
    topics: {
      NAVN: 'Bataar. Fra [Karad Batur]. Mäster for dere, Bataar for venner, ingenting for orcher.',
      JOBB: 'Jeg smir. [Handel] hvis du vil kjøpe, [reparere] hvis du har ødelagt noe, [slipe] hvis du vil ødelegge noe annet.',
      HANDEL: { act: 'smithShop', always: true },
      SELGE: { act: 'sellGear', always: true },
      REPARERE: { act: 'repair', always: true },
      SLIPE: { act: 'sharpen', always: true },
      'KARAD BATUR': 'Riket mitt ligger dypt under fjellene. Hallene under Fristaden er gamle, fra den tiden byen var vår handelspost. Vi dro. Vi tok ikke med alt. [Runene] er der fortsatt.',
      KARAD: 'Karad Batur. Si det ordentlig.',
      RUNENE: c => {
        const s = q(c, 'runer');
        if (s.state === 'done') return 'Du leste runene for meg. Våpenet ditt er bedre nå enn det fortjener.';
        if (s.state === 'active') {
          if ((c.run.runesRead || 0) > (s.base || 0)) { s.state = 'done'; return { say: 'Du har lest dem? "Her hviler hammeren til Dorj, inntil fjellet faller." Så de står der fortsatt. Gi meg våpenet ditt. Jeg skal gjøre det til noe.', act: 'rewardRunes' }; }
          return 'Runesteinen står i en av de gamle hallene. Les den og kom tilbake. Du trenger Tala främmande språk eller Historia for å skjønne den.';
        }
        s.state = 'active';
        s.base = c.run.runesRead || 0;
        c.life.questLog('runer');
        return 'Det står en runestein i hallene under kloakken. Jeg har ikke vært der på tretti år, og jeg skal ikke dit nå heller. Les den for meg, så smir jeg våpenet ditt til et mesterverk.';
      },
      ORCHER: 'De kommer over fjellene hver vår. Tornväktarna og vi holder dem tilbake. Det går stort sett bra. Stort sett.',
      TORNVÄKTARNA: 'Gode folk. Litt for glade i de døde, men gode folk.',
      FARVEL: 'Hold eggen skarp.',
    },
  },
  {
    id: 'gynerva', name: 'Gynerva', short: 'en kvinne i fiolett kappe', title: 'trollkyndig',
    look: 'En mager kvinne i fiolett kappe og spiss hatt. Fingrene hennes er flekkete av blekk, og øynene glitrer litt for mye.',
    model: { kin: 'manniska', profession: 'magiker', school: 'Mentalism', age: 'medel' }, shopHours: [10, 27],
    teachText: 'Sju dager med formler, blekk og kald te. Gynerva sover ikke. Du gjør det nesten ikke heller.',
    sched: [[0, 'tower_in'], [3, 'tower_stairs'], [10, 'tower_in']],
    greet: c => c.P.sheet.school ? `${c.P.sheet.school}! Jeg kjente det på deg. Det kribler i lufta.` : 'Besøk. Hvor sjelden. Rør ingenting som lyser.',
    topics: {
      NAVN: 'Gynerva. Bare Gynerva. Titler er for folk som ikke kan noe.',
      JOBB: 'Jeg studerer [magi] i tårnet. Jeg [lærer] bort det jeg kan til dem som har gnisten, og selger [trolldrikk] til dem som ikke har den.',
      MAGI: 'Magi er å vri verden litt. [Shamash] sier det er gudløst. Jeg sier at verden trenger å vris litt innimellom.',
      LÆRE: { act: 'teach', always: true },
      TROLLDRIKK: { act: 'potionShop', always: true },
      SHAMASH: 'I Kardunien brenner de folk som meg. Her i Zorakin får vi et tårn. Jeg vet hvor jeg vil bo.',
      KULA: 'Kula på bordet er et orbuculum. Den viser ting. Mest viser den meg, når jeg ser for lenge inn i den.',
      FARVEL: 'Gå forsiktig. Og ikke tenk for høyt.',
    },
  },
  {
    id: 'tobolt', barks: ['En mynt til kongen?', 'Rottene vet ting!'], name: 'Tobolt', short: 'en halvlängdsman i filler', title: 'tiggarkung under brua',
    look: 'En liten halvlängdsman i filler med en krone av blikk på hodet. Han sitter ved et bål under brua som om han eier den. Kanskje han gjør det.',
    model: { kin: 'halvlangdsman', profession: 'tjuv', age: 'gammal', clothes: { top: 0x5a4a38, pants: 0x3a3028, hood: 0x4a3c2c } },
    sched: [[0, 'bridge_camp']],
    greet: c => c.bg === 1 ? 'Du! Jeg kjenner deg! Vi tigget på samme veikant en vinter. Sett deg, sett deg. For deg er alt gratis.' : 'Velkommen til mitt rike, fremmede. Det er lite, men det er tørt. Nesten.',
    topics: {
      NAVN: 'Tobolt den første og eneste, konge av tiggerne i Fristaden. Kronen er av blikk. Makten er ekte.',
      JOBB: 'Jeg [tigger]. Og jeg vet ting. Tiggerne ser alt, fordi ingen ser tiggerne. For en [almisse] forteller jeg hva rottene vet.',
      TIGGER: 'Det er et ærlig yrke. Mer ærlig enn handel, i alle fall. Spør [Hvass].',
      ALMISSE: { act: 'alms', always: true },
      REV: 'Rødpels. Han kom opp gjennom kluken en natt med tre sekker på ryggen. Nei, ned. Han gikk ned med dem. Han betaler tiggerne for å holde kjeft. Ikke meg. Jeg holder kjeft gratis.',
      REVEN: 'Rødpels. Han kom opp gjennom kluken en natt og gikk ned igjen med tre sekker på ryggen. Han betaler tiggerne for å holde kjeft. Ikke meg. Jeg holder kjeft gratis.',
      KRONE: 'Den er av blikk. Revens er av gull. Hvem av oss er den egentlige kongen, tror du? Han bor i en kloakk. Jeg bor under en bro. Det er jevnt.',
      ROTTER: 'Rottene vet hvor ting er gjemt i kloakken. Jeg snakker med rottene. Ikke se sånn på meg.',
      FARVEL: 'Kom tilbake. Ta med en mynt. Eller to.',
    },
  },
  {
    id: 'gaspard', barks: ['Kanel! Kardemomme!', 'Nesten ekte safran!', 'Smak, min venn!'], name: 'Gaspard', short: 'en mann med kardunisk hatt', title: 'kryddhandler fra Ekeborg',
    look: 'En slank mann med smal bart og en hatt i kardunisk snitt. Boden hans lukter kanel, pepper og noe søtt.',
    model: { kin: 'manniska', profession: 'nasare', age: 'ung', clothes: { top: 0x3a2a5a, pants: 0x2a2030 } }, shopHours: [8, 19],
    sched: [[0, 'inn_stairs'], [8, 'stall_spice'], [19, 'inn_t2'], [23, 'inn_stairs']],
    greet: c => c.night ? 'Boden er stengt, min venn. Krydder sover også.' : 'Kanel! Kardemomme! Nesten ekte safran! Kom nærmere, min venn.',
    topics: {
      NAVN: 'Gaspard fra Ekeborg i [Kardunien]. Kryddhandler. Smugler, hvis du spør en Shamash-prest.',
      JOBB: 'Jeg selger krydder og [mat] til folk som liker smak. I Kardunien er det forbudt å like smak. Derfor er jeg her.',
      MAT: { act: 'spiceShop', always: true },
      HANDEL: { act: 'spiceShop', always: true },
      KARDUNIEN: 'Tiggardrottningen styrer der, og prestene sier at sult er en dyd. Adelen spiser svartsoppa med galle når folk ser på, og med kanel når de ikke gjør det. Kanelen kjøper de av meg.',
      SAFRAN: 'Safran? Hysj. For tre netter siden kom en fyr med rød pels og krone til boden min. Han ville selge tre sekker. Jeg sa nei. Nesten. Han sa han hadde kjøpere i Kardunien, og at han bodde [nede|KLOAKKEN].',
      KLOAKKEN: 'Han gikk ned gjennom kluken på torget. Jeg så det med egne øyne. Ikke si til Hvass at jeg sa det.',
      SVARTSOPPA: 'Gåseblod, eddik og galle. I Kardunien. Med kanel og gåseleverpølse, hvis du er adel. Ikke spør meg hvordan jeg vet det.',
      FARVEL: 'Måtte maten din alltid smake noe.',
    },
  },
  {
    id: 'folkard', barks: ['Porten er stengt.', 'Hold deg unna trøbbel.'], name: 'Folkard', short: 'en vakt med spyd', title: 'vakt ved Nordporten',
    look: 'En vakt i ringbrynje og blå våpenkjole med Zorakins sol. Han lener seg på spydet som om det var en venn.',
    model: { kin: 'manniska', profession: 'krigare', age: 'ung', clothes: { top: 0x1c2a5a }, armor: { type: 'ring' }, helmet: { hid: 'oppenhjalm' }, weapon: 'kortspjut' },
    sched: [[0, 'guard_bed'], [7, 'gate_l'], [19, 'guard_in'], [21, 'guard_bed']],
    greet: c => c.bg === 0 ? 'Vent litt. Har jeg ikke sett ansiktet ditt på en plakat? Nei? Greit. Men jeg holder øye med deg.' : c.bg === 8 || c.bg === 9 ? 'Herre. Eller frue. Velkommen til Fristaden.' : 'Stopp. Eller ikke stopp. Porten er stengt uansett.',
    topics: {
      NAVN: 'Folkard. Vakt. Det er det hele.',
      JOBB: 'Jeg vokter [porten] for kong [Balian] og fogden. Mest vokter jeg at ingen går ut, fordi det er [orcher] der ute.',
      PORTEN: 'Nordporten går ut til [kongeveien], til fjellene og [Karad Batur]. Den er stengt om natta. Om dagen holder jeg den åpen og ser sur ut.',
      KONGEVEIEN: () => { reveal(['ardesch', 'tyndal', 'galastan', 'pendon']); return 'Kongeveien går sørvest langs Drakdjupet, forbi [Ardesch] og [Tyndal], under Aidnebergen til [Galastan], og helt ned til [Pendon]. Edelfara ligger ved Torilskogen, rett etter Galastan. Skal du dit, ta med [proviant]. Det er langt mellom vertshusene.'; },
      PROVIANT: 'Rosmynda på Den feite gåsen selger niste til veien. Uten mat på veien går det dårlig. Jeg har sett folk komme tilbake fra Edelfara. De så ikke fornøyde ut.',
      ARDESCH: 'En landsby under Vorgabergen, på veien sørover. De har et vertshus med en vertinne som husker alle som ikke betalte.',
      PENDON: 'Kongens by. Stor, skitten og rik. Mest skitten.',
      ORCHER: 'De kom ned fra Aidnefjellene i fjor. Tornväktarna slo dem tilbake. De kommer igjen. Det gjør de alltid.',
      BALIAN: 'Kongen. Solens beskyddare. Jeg har aldri sett ham, men jeg har sett ansiktet hans på myntene, og det holder.',
      LOVEN: 'Stjeler du, betaler du. Kan du ikke betale, sitter du i vaktstua til morgenen. Det står ikke i loven, men det er sånn vi gjør det.',
      FARVEL: 'Hold deg på riktig side av loven. Eller i det minste på riktig side av meg.',
    },
  },
  {
    id: 'garin', name: 'Garin', short: 'en vakt med lykt', title: 'nattevakt',
    look: 'En gammel vakt med lykt og hjelm som har sett bedre dager. Han ser ut som han har sett bedre netter også.',
    model: { kin: 'manniska', profession: 'krigare', age: 'gammal', clothes: { top: 0x1c2a5a }, armor: { type: 'ring' }, helmet: { hid: 'oppenhjalm' }, weapon: 'kortspjut' },
    patrol: ['p1', 'p2', 'p3', 'p4', 'p3', 'p2', 'p5', 'p2', 'p6', 'p7'],
    sched: [[0, 'patrol'], [6, 'guard_bed2'], [14, 'gate_r'], [19, 'patrol']],
    teach: { Kortspjut: 18, Långspjut: 17 },
    teachSay: 'Spydet er enkelt. Den spisse enden mot fienden. Resten tar en uke.',
    teachText: 'Sju dager med spydet ved Nordporten. Garin ser ut som han sover, men han våkner hver gang du gjør feil.',
    greet: c => c.night ? 'Hvem der? Å, bare deg. Det er sent å være ute. Folk som er ute om natta, er sjelden ute i gode ærend.' : 'Jeg står vakt ved porten om ettermiddagen og går runder om natta. Sove gjør jeg når det passer.',
    topics: {
      NAVN: 'Garin. Tretti år i vakta. Tjueni av dem om natta.',
      JOBB: 'Jeg går runder om natta og ser etter [tyver]. Om dagen står jeg ved porten med Folkard og ser etter ingenting. Har du en uke, kan jeg lære deg [spydet|TRENING].',
      TYVER: 'Om natta ser ikke Utu noe, sier prestene. Men jeg ser. Jeg har lykt.',
      TRENING: { act: 'teachWeek', always: true },
      LOVEN: 'Hundre silver i bot for første tyveri. Mer for neste. Kan du ikke betale, sover du i vaktstua.',
      NATT: 'Natta er lang i Fristaden. Det er bare meg, rottene og Gynerva i tårnet som er våkne.',
      FARVEL: 'Hold deg i lyset.',
    },
  },
  {
    id: 'edegar', barks: ['Kål! Fristadens beste kål!', 'Ikke tråkk på kålen!'], name: 'Edegar', short: 'en bonde med jord på hendene', title: 'kålbonde',
    look: 'En senete mann med jord på hendene og en hatt som har vært i regn mange ganger.',
    model: { kin: 'manniska', profession: 'hantverkare', age: 'gammal', clothes: { top: 0x5a6a3a, pants: 0x4a3a28, extra: 'hat' } },
    sched: [[0, 'farm_bed'], [6, 'farm_garden'], [11, 'stall_veg'], [17, 'farm_garden'], [19.5, 'inn_t1'], [21, 'farm_bed']],
    greet: c => c.bg === 2 || c.bg === 4 ? 'Endelig noen som har hatt jord på hendene! Sett deg, sett deg. Ikke på kålen.' : 'Hei. Du står på kålen min. Nei, ikke der. Der.',
    topics: {
      NAVN: 'Edegar. Bonde. Det er ikke mange bønder innenfor bymuren, men noen må dyrke kål her også.',
      JOBB: 'Jeg dyrker [kål] bak huset og selger den på torget. Når [rottene] ikke tar den først.',
      KÅL: 'Fristadens beste kål. Det er ikke mye konkurranse, men den er god.',
      ROTTENE: c => {
        const s = q(c, 'rotter');
        const killed = (c.run.killsByType.rat || 0) - (s.base || 0);
        if (s.state === 'done') return 'Det har vært fredelig i kålen siden du var nede. Takk igjen.';
        if (s.state === 'active') {
          if (killed >= 10) { s.state = 'done'; return { say: 'Ti rotter! Jeg hørte det helt hit opp. Her er pengene, som lovet. Og et kålhode. Nei, du må ta kålhodet.', act: 'rewardRats' }; }
          return `${Math.max(0, killed)} av ti. Rottene teller ikke selv, men jeg gjør det.`;
        }
        s.state = 'active';
        s.base = c.run.killsByType.rat || 0;
        c.life.questLog('rotter');
        return 'Rottene kommer opp fra kloakken og spiser kålen min. Drep ti av dem der nede, så skal du få to hundre silver. Det er alt jeg har. Nesten.';
      },
      ROTTER: c => PEOPLE.find(p => p.id === 'edegar').topics.ROTTENE(c),
      FOGDEN: 'Fogden tar skatt på kålen. Kongen tar skatt på fogden. Det går rundt.',
      FARVEL: 'Pass deg for kålen.',
    },
  },
  {
    id: 'regin', barks: ['Fersk fisk! Nesten fersk!', 'Abbor fra elva!'], name: 'Regin', short: 'en fisker med skaut', title: 'fisker',
    look: 'En værbitt mann med rødt skaut og hender som lukter fisk. Han ser på elva som om den skylder ham noe.',
    model: { kin: 'manniska', profession: 'sjofarare', age: 'medel' },
    sched: [[0, 'inn_stairs'], [5.5, 'pier'], [11, 'stall_fish'], [16, 'pier'], [20, 'inn_t3'], [23, 'inn_stairs']],
    greet: c => c.bg === 3 ? 'En skogsmann! Du vet hvordan man får mat på bordet. Vil du prøve elva?' : 'Fisken biter ikke i dag. Den biter aldri når noen ser på.',
    topics: {
      NAVN: 'Regin. Jeg fisker i elva og selger på torget.',
      JOBB: 'Jeg [fisker]. Elva gir lite, men den gir. Om morgenen og ettermiddagen står jeg på [brygga].',
      FISKER: 'Vil du prøve? Gå ut på brygga og kast ut. Det er Överlevnad som teller. Og tålmodighet, men det er ikke en ferdighet.',
      FISKE: 'Vil du prøve? Gå ut på brygga og kast ut. Det er Överlevnad som teller. Kan du det ikke, får du håpe fisken er dum.',
      BRYGGA: 'Den lille brygga øst for elva. Den er gammel, men den holder. Stort sett.',
      ELVA: 'Elva kommer fra Aidnefjellene. Den renner gjennom Fristaden og videre mot havet. Det meste av byen havner i den før eller senere.',
      FARVEL: 'Måtte de bite.',
    },
  },
  {
    id: 'pimpa', barks: ['Jeg så en rev!', 'Du er den!', 'Hei, helt!'], name: 'Pimpa', short: 'en liten halvlängdsjente', title: 'halvlängdsjente',
    look: 'En liten halvlängdsjente med skitne kinn og en pinne hun bruker som sverd.',
    model: { kin: 'halvlangdsman', profession: 'bard', age: 'ung', clothes: { top: 0xd87a3a, pants: 0x4a3a2a }, child: true },
    wanderer: true,
    sched: [[0, 'farm_bed'], [7, 'square_c'], [11, 'well'], [13, 'square_w'], [16, 'graveyard'], [18, 'square_c'], [20.5, 'farm_bed']],
    greet: () => 'Hvem er du? Er du en helt? Du ser ikke ut som en helt. Du ser ut som en som har gått seg vill.',
    topics: {
      NAVN: 'Pimpa! Jeg bor hos onkel Edegar. Han er ikke onkelen min, men han har kål.',
      JOBB: 'Jeg leker. Og jeg ser etter [reven].',
      REVEN: 'Jeg så en rev med krone! Han gikk ned i [kloakkluken] med sekker! Ingen tror meg. Tror du meg?',
      KLOAKKLUKEN: 'Den er på torget, ved Hvass handel. Den er skummel. Jeg har sett ned i den. Det så tilbake.',
      LEKE: { act: 'play', always: true },
      HELT: 'Svart Nebb er en helt. Han er en and. Det er ikke mange ender som er helter.',
      FARVEL: 'Ha det! Ikke bli spist!',
    },
  },
  {
    id: 'isold', name: 'Isold', short: 'en alv med fjærhatt', title: 'skald',
    look: 'En høy alv med fjærhatt og en lutt på ryggen. Hun nynner på noe du nesten kjenner igjen.',
    model: { kin: 'alv', profession: 'bard', age: 'ung' },
    sched: [[0, 'inn_stairs'], [10, 'temple_steps'], [13, 'square_e'], [17, 'inn_stage'], [23.5, 'inn_stairs']],
    greet: c => c.isNebb ? 'Svart Nebb! I egen person! Jeg har laget en [vise] om deg. Du kommer ikke til å like den.' : 'God dag, fremmede. Har du en historie jeg kan synge om?',
    topics: {
      NAVN: 'Isold. Skald, lutt og dårlig rykte, i den rekkefølgen.',
      JOBB: 'Jeg synger på Den feite gåsen om kvelden. Om dagen samler jeg [historier]. Vil du [opptre] selv, er scenen ledig når jeg tar pause.',
      VISE: 'Visen om Svart Nebb. Den går i tre fjerdedeler og handler om en and som går ned i mørket. Den slutter ikke godt, men den slutter fort.',
      HISTORIER: 'Det beste er om Tornväktarnas martyrer som kommer tilbake. Det verste er om Hvass sin bestefar. Den skal du ikke høre.',
      OPPTRE: { act: 'perform', always: true },
      SANG: { act: 'song', always: true },
      FARVEL: 'Syng litt når du går. Det skremmer rottene.',
    },
  },
];

// Det som står på oppslagstavla
export const BOARD = {
  id: 'board', name: 'Oppslagstavla', title: 'på torget', board: true,
  greet: () => 'Lapper med nåler i. Noen er nye, noen er så gamle at blekket har rent.',
  topics: {
    SAFRAN: 'BORTKOMMET: Tre sekker safran fra Hvass handel. Belønning til den som finner dem. Kontakt [Hvass]. Betjenten har ingen myndighet.',
    ROTTER: 'ROTTEFANGER SØKES. Ti rotter, to hundre silver. Spør etter [Edegar] i kålhagen.',
    DØDE: 'TORNVÄKTARORDEN søker modige sjeler som vil gi de døde i hallene fred. Meld deg hos [Syster Jehanne|JEHANNE].',
    RUNENE: 'Kan du lese dvergerunar? Mäster [Bataar] i smia betaler med stål.',
    LOVEN: 'Etter fogdens ordre: Tyveri straffes med bot. Den som ikke kan betale, sitter i vaktstua. Utu ser deg.',
    HVASS: 'Krystof Hvass, kjøpmann og laugsmester. Holder til i Hvass handel ved torget, eller på vertshuset.',
    EDEGAR: 'Kålbonden. Bor i huset sørvest i byen, bak dojoen.',
    JEHANNE: 'Tornväktaren. Holder til i kapittelhuset øst for elva.',
    BATAAR: 'Smeden. Smia ligger sør for torget.',
  },
  start: ['SAFRAN', 'ROTTER', 'DØDE', 'RUNENE', 'LOVEN'],
};
