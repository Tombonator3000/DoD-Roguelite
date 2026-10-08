# Prosjektminne

Ting som er lurt å huske neste gang noen (menneske eller AI) jobber med prosjektet.

## Hva det er

- Roguelite dungeon crawler, Diablo/Hades-kamera og -kamp, Ultima-aktig dialog med nøkkelord.
- Regler fra Drakar och Demoner 4.0 (1991, "DoD91") med Expert og Gigant der DoD91 ikke dekker noe, tilpasset sanntid. Fram til 0.5 var det DoD 2023 (Dragonbane); de reglene er fjernet helt.
- Hovedperson: Svart Nebb, egentlig Nansen. Anka, tjuv og lönnmördare fra Fristaden i Zorakin (Ereb Altor). Kampstil: Kvakk-Fu (Slagsmål), lært av Mester Flansen. Skal føles brutal, ikke elegant.
- Fra 0.3 kan du også lage egen rollperson etter reglene. Svart Nebb er den ferdige rollpersonen.
- Far (herr Nansen) er butikkbetjent, ikke kjøpmann. Gjennomgangsvits. Spiller du en annen rollperson, er han den som har leid deg, og han har egne replikker (NANSEN i main.js).
- Historien: noen har stjålet safranlageret fra butikken. Sporet går gjennom Fristadens kloakker, ned i Karad Baturs dvergehaller og ender hos Rødpels, en rev med krone.
- Lore brukt: Fristaden var en handelspost for dvergene i Karad Batur før Zorakin tok den, Utu (gave-kilde), Tornvaktarorden (unik kappe), Aidne-bakgrunn fra "Ereb Altor: Hjältar från Kopparhavet".

## Kilder for reglene

- DoD 4.0 Bok I (Grundregler), Bok II (Strid), Bok III (Magi), Expert Regler og Magi, Gigant Regelbok. Teksten er hentet fra https://kingafw.no/Drakar/index.html (Toms lenke, oktober 2026) og oppsummert med sidetall i docs/regler/ (bok1.md, bok2.md, magi.md, expert_gigant.md).
- docs/regler/IMPLEMENTERING.md er kontrakten: hvordan hver regel er oversatt til sanntid, og Player-API-et som byen og skapingen bruker. Les den før du rører regelkoden.
- Verdier som ikke står i boka (fiender som ikke finnes der, priser i byen, sanntidsoversettelser) er merket `uv` i koden eller i IMPLEMENTERING.md.
- Lore: Ereb Altor, Monsterboken 1 og 2, Svartfolk, Tjuvar och lönnmördare, Kopparhavets Kapare fra samme bibliotek. "Ereb Altor: Hjältar från Kopparhavet" (Google Drive, id 1QKI2XwSbfsRLdwJL8mb4C5qZWWOO2e_F) for Aidne-bakgrunnen.
- Funn fra 2023-tida som fortsatt gjelder for navn: Simfötter (Webbed Feet).

## Tekniske beslutninger

- three.js r170 fra jsdelivr via importmap. Ikke nyere uten å sjekke: fra r171 er three.module.js splittet i flere filer. BufferGeometryUtils hentes fra three/addons.
- Én HTML-fil. Modellen bygges inn som base64. Ingen fetch av eksterne filer, fordi artifact-sandkassen blokkerer det.
- Modellen fra Tripo/Magnific var 1,15 millioner trekanter. Desimert med pymeshlab (quadric edge collapse med tekstur) til 24 000. Eget binærformat (tools/pack_mesh.py). UV i OBJ-konvensjon, flipY=true.
- Modellens fremover-retning er +X. I koden roteres den -90 grader om Y slik at fremover blir +Z.
- Koordinater: tile (tx, ty) har senter i verden ((tx+0.5)*2, 0, (ty+0.5)*2). T = 2. Rutenett 46x46.
- Kamera står i retning (+x, +y, +z) fra spilleren. Skjerm-opp tilsvarer verdensretning (-1, 0, -1). Skjerm-høyre er (1, 0, -1).
- Yaw: retning (sin yaw, 0, cos yaw). Bruk atan2(dx, dz).
- Vegger mellom gulv og kamera bygges lave (0.85). Andre vegger er høye (3.2), får fakler og en dithret sirkel rundt spilleren (addCutaway).
- Lys: én spotlight over spilleren med skygge, svakt halvkulelys, og en pool på 7 punktlys som flyttes til nærmeste fakler hver frame.
- Bloom via UnrealBloomPass, tonemapping ACES via OutputPass, GradePass til slutt.
- Delt tilstand i `G` (state.js). `window.G` og `G.dev` (randomChoices, buildSheet) er satt for feilsøking.
- Lagring i localStorage med try/catch: meta (svartnebb.meta.v1), innstillinger (svartnebb.settings.v1), rollpersoner (svartnebb.chars.v1, maks 8), valgt rollperson (svartnebb.lastchar), lagrede spill (svartnebb.saves.v1, fra 0.5).

## Versjon 0.2: lyd, meny og grafikk

- Musikk (music.js) er ren WebAudio. Lutt med Karplus-Strong, forhåndsrendret per tone, tonehøyde med playbackRate. Bardens Tonkonst spiller noen lutt-toner via music.pluck.
- Sequenceren planlegger 140 ms fram. Utforskingssangen leser music.intensity (0 til 1) ut fra antall jagende fiender.
- Tittelen har egen THREE.Scene (title.js). RenderPass.scene byttes hver frame. Fra 0.3 viser plattformen den valgte rollpersonen (TitleScene.setCharacter).
- Rim/flash-shaderen (addRimFlash) kan dele uniforms mellom flere materialer (fjerde argument). Rollpersoner av primitiver bruker ett felles sett.
- dt i hovedløkka klemmes til [0, 0.05].

## Versjon 0.3: egen rollperson og DoD-regler

- Moduler: dod.js (all regeldata), rules.js (terninger, buildSheet, svartNebb, randomChoices), creation.js (skapingen), kinmodels.js (modeller). companion.js (hunden) ligger der fortsatt, men brukes ikke fra 0.5.
- Regeltermer står på svensk som i boka (färdigheter, tillstånd, förmågor). Resten av teksten er norsk.
- Rollformulär (sheet) er et rent JSON-objekt. Fra 0.5 er formatet DoD91 (`v: 2, rules: 'dod91'`): kin, profession, age, sex, rolled, attrs (sju: STY STO FYS SMI INT PSY KAR), special, hand, stand, yrke (valgte yrkesfärdigheter), skills { navn: FV }, spells { id: S }, school, konst, ability, gear { w, a, g }, silver, ep-felter, choices. Gamle formulærer (2023) filtreres bort i main.js.
- Hvert løp starter fra formulæret. Forbedringer i løpet forsvinner når løpet er over (roguelite). Bare dojo-oppgraderinger er permanente.
- Utstyr fra 0.5: sju plasser, vapen (hovedhånd), vapen2 (andre hånd eller skjold), rustning (kropp), armar, ben, hjalm, amulett. Ubevæpnet = Slagsmål.
- Tastene fra 0.5: LMB anfall, RMB parera (hold), Mellomrom dukk, Q kast, Z/hjul bytt våpen, R/G/T besvärjelser eller Bärsärkagång/Avväpna (hold for høyere E), F yrkesförmåga, H första hjälpen, V gjør klar en hjältepoäng, Shift smyga, 1 legedrikk, E bruk, X ta på, I packning, C rollformulär.

## Versjon 0.5: inventar og lagring

- Moduler: inventory.js (sekk, belte, vekt, giveItem, salg), invui.js (inventarskjermen med dra og slipp), icons.js (egen WebGL-renderer for 3D-ikoner), itemmodels.js (modeller av alle gjenstander), save.js og saveui.js (lagring), body.js (kroppsdelene).
- Lagring: autolagring og tre plasser med bilde av skjermen. Nivået bygges på nytt fra frøet, og bare endringene lagres (levende fiender, åpne kister, knuste tønner, gjemmesteder, ting på bakken, sett kart, butikk). Ikke midt i en kamp. Autolagring slettes når løpet er over. SAVE_VERSION 2 og rules 'dod91': eldre lagringer kan ikke lastes.
- Gjenstander som går til spilleren, skal gjennom giveItem (inventory.js). Skjold går til vapen2.

## Versjon 0.5: grafikk og vær

- fire.js (FireField): all ild er instanser av én flate med støy i fragment-shaderen. world.flame(x, y, z, farge, skala, bredde) returnerer et Flame-objekt med pos, base, phase og visible. Fyrfat og ildsteder har bredde 1,8 til 2,2. Ingen flamme-sprites lenger.
- water.js: makeWaterMaterial (dungeon.js eksporterer den videre) og WaterFX (G.water). G.water.ripple(x, z, styrke) lager ringer, og FX.burst('splash') gjør det av seg selv. De seks første lysene i lys-poolen speiler seg. uRip, uLP og uLC er delte lister, så de må være satt før første render (ellers krasjer three på en tom uniformliste).
- weather.js (G.weather): kind er klart, skyet, regn eller storm, og følger G.run.clock i blokker på tre timer. force(kind) til testing, snap() ved nytt nivå. cloud, rain, storm, windK, wet og flash går mykt mot målet. wind er en Vector2. Regn, plask og løv pakkes rundt kameraets mål i vertex-shaderen. Tak: en DataTexture med høyden under taket per flis (fra BUILDINGS), og uInside skjuler alt over tak når du står inne.
- Regnstrekene har fast bredde i piksler (uPx), ellers blir de nærmeste dråpene enorme. Rain-materialet må være DoubleSide, fordi flaten snus når den bygges i skjermrommet.
- Kameraet står 16 m over bakken. Ting høyere enn 6 til 7 m havner utenfor bildet, så fugler flyr på 4,5 til 5,5 m og følger etter spilleren.
- wet.js: addWetness(mat, { puddles, k }) og addSway(mat, 'grass' | 'leaf' | 'flower') kjeder onBeforeCompile og customProgramCacheKey, så de virker sammen med addCutaway. Uniformene i WET og SWAY settes av været (updateWet). Skyskygger ligger i samme shader.
- post.js: GradePass har tilt-shift (uTilt, av på lav kvalitet) og mood(biome, night, rain) med LOOKS per sted. tiltWant settes i main-løkka (0,5 i tittelen, 0 når packningen er åpen).
- Lyd: G.audio.thunder(k) og G.audio.setRain(nivå, inne).
- FX.burst har fått 'steam' og 'incense'. Partikler med negativ tyngde (røyk) driver med vinden.
- Feilsøking: G.camLock (en Vector3) låser kameraets mål, nyttig for nærbilder i testriggen sammen med G.camera.fov.
- Tegnekall: målt med én G.composer.render() og renderer.info.autoReset = false. Byen om natta omtrent 320, kloakken omtrent 160, nesten som før 0.5-grafikken.

## Regler slik de er implementert (DoD91, fra 0.5)

Detaljene står i docs/regler/IMPLEMENTERING.md. Det viktigste:

- Slag: 1T20 lik eller under CL. Slår du 1, slår du om: under FV er perfekt. Slår du 20, slår du om: over FV er fummel (`clRoll(cl, fv)`). Motståndstabellen: 10 + aktiv - passiv (`resist`).
- Kroppen (src/body.js): totala KP = ceil((FYS+STO)/2), og sju kroppsdeler med egne KP fra `locKP` (huvud, brost, mage, harm, varm, hben, vben). Rustning per kroppsdel, beste stykke teller, pluss SKYDD og naturlig rustning. LOC_NAME er svensk (rollformulär), LOC_SHORT er norsk prosa (hodet, brystet, høyre arm).
- En kroppsdel på 0 blør 1 KP per 6 SR. Arm 0 slipper våpenet, bein 0 setter deg på kne, bryst eller mage 0 betyr kryping, hodet 0 slår deg ut. Kritisk (KP på minus maks): hodet er døden, bryst og mage gir medvetslös og et svårt FYS-slag, armer og bein slår på CRIT_LIMB. -2 CL per tapt KP i kroppsdelene ferdigheten trenger. Totala KP 2 halverer CL, 1 stopper ferdigheter, 0 er medvetslös, minus FYS er døden.
- Parering: én per våpen eller skjold per SR (`parryT`, må være { vapen: 0, vapen2: 0 }). Resultattabellen i Bok II: lyckat tar slaget, skade over BV koster 1 BV og resten går igjennom. Ingen parering mot piler (bare skjold), kastvåpen bare med skjold, naturlige anfall kan ikke pareres. Projektilparering (hjälteförmåga) gir parering mot piler og kast med sverd eller stav.
- Dukking er et vanlig SMI-slag (+3 med Akrobatik 5 og ingen metall). Posisjon: bakfra +7, fra siden +3, liggende +5, ubevegelig +10. Lönnmördare bakfra: x1 ved bom, x2 lyckat, x4 perfekt, uten SB.
- Grep: STY minst kravet gir én hånd, minst halve kravet krever to hender, ellers for tungt (`gripOf`). Utrustningsforslaget i skapingen bytter våpen som er for tunge (`fitKit`/`kitOf` i rules.js).
- Fummel fra Expert (FUMMEL_NARSTRID, FUMMEL_AVSTAND), stridsmoral fra Expert (1T20 lik eller under moral, ellers flykt eller bärsärk), Skräcktabellen (1T20 - PSY + skräckslå + modifikasjon).
- Magi: CL = S - 2(E-1). Koster E PSY, perfekt E/2, misslyckat 1, fummel E og Snedtändning. Ingen metall på kroppen. PSY kan aldri gå til 0 ved trylling. Skade bryter konsentrasjonen. PSY kommer tilbake med 1 per 20 s utenfor kamp (spillets eget).
- Erfarenhet: første lyckade slag per ferdighet etter søvn gir 1 EP (perfekt 1T3+1). EP blir FV når du hviler en uke på vertshuset (`restWeek`, kostnad `fvCost`). Bonuspoeng i trappa.
- Hjältepoäng: FV 21 gir 1T4, demon og Rødpels 10, oppdrag i byen 1. V gjør klar én, så blir neste slag ett trinn bedre. Hos Syster Jehanne (DÅDER): 5 HP gir +1 i en grundegenskap (`P.attrUp`), og åtte hjälteförmågor kan kjøpes (bare de koden bruker).
- Medvetslös: røvere (vätte, orch, Rødpels) tar halve silveret og en verdisak og stikker, rotter biter 1T2 ganger, skjeletter og demoner får opptil seks runder. Så et svårt FYS-slag hvis noe var kritisk, et FYS-slag for blødning, og du våkner. Hjältepoäng-knappen reiser deg med 1 KP med en gang.
- Bärförmåga er STY kg. Det du har på deg og i hendene, teller ikke. Legedrikker veier 0,5 kg. Överlastad: x0,75 fart og -5 på Smyga, Akrobatik, Hoppa og Klättra. Aldri mer enn 2 x STY.
- Penger er silvermynt (sm), ganget med 10 fra 0.4.

## Versjon 0.4: Fristaden over bakken

- Moduler: townmap.js (kartet som ren data, kan kjøres i node med asciiTown), towntex.js (prosedyriske teksturer, lages én gang), town.js (Town arver Dungeon: geometri, kollisjon, tak, lys etter klokka via skyAt), townpeople.js (personer og samtaletekst), talk.js (samtalemotoren), townfolk.js (NPC med døgnrytme, tjenester, tyveri, oppdrag).
- Dybde 0 er byen. FLOORS[0] finnes. loadFloor(0, null, false, 'start' | 'grate'). G.run.nextDepth sier hvilket nivå kloakkluken går til. G.run.clock er timer siden dag 1 kl. 00 (starter 17). Klokka går 0,5 spillminutt per sekund, også i kloakken.
- Rutenett i byen: WALL (bymur og alt utenfor), FLOOR, WATER (elva, kan vades), PILLAR (tempelet), HOUSE (tynne husvegger, 0,4 m), FENCE. Tynne vegger har bokser i shapes[idx]. Møbler legges inn med addBlock (samme liste, flagg 1 = slipper sikt gjennom). collide() sjekker en flis ekstra rundt, fordi dørkarmer stikker inn i nabofliser. walkBlock stenger fliser for byfolkets stifinning (npcPath), ikke for spilleren.
- Hus: rektangler i BUILDINGS. Veggene mot kameraet (sørkant y1 og østkant x1) bygges to ganger, full høyde og lav (0,9). Når spilleren står inne (bmap), tones taket ut og de lave veggene vises. Takmaterialer er per bygning og alltid transparent.
- Lys i byen: nøkkellyset (spotlight) blir sol eller måne med decay 0 og distance 0, plassert etter skyAt(time). Lykter og ild er World.sources med `dist`, `enabled` og `inside` (indre lys virker bare når du er i samme hus).
- Materialer med vertexColors krever color-attributt. Primitiver uten (CylinderGeometry osv.) må bruke MAT.stonePlain eller andre uten vertexColors, ellers blir de svarte.
- Ikke kall noe på Town for W eller H: det er bredden og høyden på rutenettet (idx bruker this.W). World ligger i this.world.
- Samtaler: ord lagres i G.meta.words, folk du vet navnet på i G.meta.met. Svar kan være tekst, funksjon eller { say, act }. act går til TownLife.service. def.forced (vakta med bota) lar deg ikke lukke samtalen.
- Herr Nansen bruker den gamle butikken (main.openShop) når han står bak disken i åpningstida. Ellers vanlig samtale.
- Fred i byen: G.dungeon.peaceful stopper anfall, kast, evner og släktesförmåga i player.update.
- Aidne-bakgrunn gir egne svar: Lösdrivare (Tobolt gratis), Prästerskap (Cassian gratis), Borgare og Högadel (laugspris hos Hvass), Lågadel og Fredlös (Jehanne og vakta), Torpare (Regin), Livegen og Kronobonde (Edegar).
- Rykte (G.run.rykte): tyveri -2, almisse, oppdrag, offer og god opptreden +1. Under -2 blir alt 25 % dyrere, fra 3 og opp 10 % billigere. På -3 nekter Jehanne å trene deg (hjältepoäng tar hun imot uansett).
- Tegnekall i byen er omtrent 300. Folk lengre unna enn 34 (manhattan) skjules, småbiter på rollpersonene kaster ikke skygge.

## Versjon 0.6: Edelfara og Triangeldrama i Edelfara

- Kilde: eventyret «Triangeldrama i Edelfara» fra boksen Drakar och Demoner Ivanhoe. Tom lastet opp PDF-en med tekstlag. I biblioteket på kingafw.no ligger det bare som skannede sider. Sidetall i kommentarene (s. 2 til 11) viser til PDF-en. Statblokkene står på s. 10. Verdier som ikke er sjekket mot Bok II, er merket `uv`.
- Moduler: areagrid.js (rutenettet males fra layouten, ren data, kan kjøres i node), area.js (Area arver Town: skog, vann, kuller, borger, telt, props, faner), edelmap.js (de sju områdene, NODES og EDGES til reisekartet), edelmodels.js (orcher, svartalfer, ulv, Lekh), edelfolk.js (folk og samtaler), arealife.js (AreaLife arver TownLife: utganger, scener, allierte, storming, Pharynx), ivan.js (oppdragets tilstand, ledetråder, frist, journal), travel.js (reisekartet).
- Area tar layouten gjennom modulvariabelen PENDING før super(), fordi Dungeon-konstruktøren kaller gen() før underklassen har satt noe på this. Ikke flytt det inn i konstruktøren.
- Rutenettet er 46x46 med T = 2 som byen. Kind per flis: K_FOREST 0, K_OPEN 1, K_DEEP 2, K_HILL 3, K_WALL 4, K_ROCK 5. Skog er WALL med trær, dypt vann er WALL som tegnes som vann, kuller er WALL-disker med en lathe-haug og en borg eller vindmølle på toppen. Borggårder bruker ring, port og tårn som byen (cityMask). `L.plateau` gir klippekant, `L.open` gir åpent land i stedet for skog utenfor kartet.
- Utganger i layouten: `to` (en node på reisekartet), `area` + `arrival` (rett til et annet område), `need` ('castle_sm', 'castle_ak', 'trail') og `flavor` (bare tekst). Ankomstpunktene står i `arrivals`. Bygnings-id-er må være unike på tvers av områdene (prefiks sm_, rk_, ak_, ab_, gl_).
- Reisekartet: Nordporten åpner det. Dijkstra over EDGES, timene legges på G.run.clock. Fristaden til Ekeskogen 9 t, Ekeskogen til Sortmund 4, Ekeskogen til Akershus 3, Sortmund til Glimming 5, Akershus til leiren 0,5, Glimming til Pharynx 10. Første tur stopper alltid i Ekeskogen (kureren) til oppdraget har startet. Pharynx er ikke et område: du reiser 10 t, rapporten skrives, og du kommer tilbake til Glimming ved østveien med 10 t til.
- Oppdraget ligger i G.run.ivan: stage, clues (id og klokkeslett), flags, items, dead (fiende-id-er per område, så de ikke kommer igjen), day0 og deadline. Fristen er day0 + 7 dager kl. 06. Flagg: trail, truce (våpenhvile), peace (svartfolket drevet tilbake), lekh ('dead' eller 'fled'), chest ('carried', 'returned', 'stolen'), storm ('battle', 'defended', 'count', 'fallen'), reported. `flag(id, v)` setter true når v mangler, så send aldri undefined.
- Ledetråder i CLUES har kind fakta, svart (peker mot svartfolket) eller falsk (villspor), og `strong` for bevis som teller hos Riddar Ulfmar. proofs() teller sterke bevis pluss Lekh død. To eller flere gir våpenhvile med en gang, ett gir et Övertala-slag, ingen et slag på -5 (uv). Ett forsøk per besøk.
- Stormingen: når fristen går ut og du står i Akershus uten fred, starter slaget (storm 'battle', 'defended' hvis du vinner). Er du ikke der: 'count' hvis Lekh er død eller freden er sluttet, ellers 'fallen' og Akershus ligger i ruiner. Går du fra slaget, blir det 'fallen'.
- Fred (checkPeace) i leiren og i Akershus: Lekh død eller flyktet, og ingen svartalf, elitorch eller leder som er varslet eller nærmere enn 20 m.
- Slutter i Pharynx: full (fred og våpenhvile) 1500 sm, hertigens signetring og +2 rykte, halv (bare fred) 800, greve (greven tok borgen) 400, falt 150. Stjal du kisten, halveres alt og ringen uteblir.
- Allierte (Ally i arealife.js) er grevens soldater. De slår med takeHit og `src: 'ally'`, og fiender med `engagedBy` står og slåss mot dem. Slagene tilbake simuleres.
- Lekh flykter på ulven (lekh_ulv): `update` byttes på instansen og følger npcPath med sjekk for at den står fast. Når den slipper unna, returnerer update false, så hovedløkka fjerner den. Ikke splice G.enemies inne i en update.
- Telt du kan gå inn i stenger bare side- og bakveggene, og walkBlock legges under hele teltet så npcPath går rundt. Lekhs telt har eget gjennomsiktig materiale som tones ut når du er inne.
- Gressteksturen (towntex.js) er mørk i seg selv, snitt omtrent (58, 90, 37). Bakken i byen får lyset fra vertex-fargene. Et materiale med denne teksturen og en vanlig grønn farge blir nesten svart, så bruk farge nær hvit (kullene 0xdce4c8). Samme med gresstustene: fargen må være lys.

## Versjon 0.6: menyer og brukerflate (Claude)

- Pausemenyen (#pause) har knappene som `.pmi` i `.pz-menu` og løpet i `#pz-run`, som `pause()` i main.js fyller hver gang. Fanene Journal og Taster byttes med `pauseTab(id)`. Knappenes id-er er de samme som før (btn-resume, btn-save, btn-load, btn-sheet, btn-quit), og testene klikker på dem. `#btn-mute` finnes ikke lenger; lyd av og på ligger i innstillingene og på M.
- Til tittelskjermen krever to trykk: klassen `armed` på #btn-quit og teksten i #pz-warn. Begge nullstilles i `pause()`.
- Innstillingene i spillet (#opts): `openOpts()` flytter `#set-rows` fra tittelens #settings inn i #opts-rows, og `closeOpts()` legger dem tilbake foran `.back`. Da finnes det bare ett sett med kontroller og hendelser. Escape i løkka sjekker #opts før pausen.
- Nye innstillinger i svartnebb.settings.v1: `tilt` (1 eller 0, tilt-shift; alltid av på lav grafikk) og `text` (1, 1,15 eller 1,3). `applySettings()` setter CSS-variabelen `--txt` på html, og loggen, samtalene, journalen, hjelpen og panelene regner skriftstørrelsen med `calc(... * var(--txt))` i 0.6-blokka nederst i stilarket.
- `.only-touch` og `.no-touch` viser og skjuler innhold etter `body.touch`. Brukt i hjelpen og i Taster-fanen.
- Lange paneler i tittelen får klassen `tscroll` og en `.tp-body` som ruller, så Tilbake står fast nederst.
- Grunnmur i 0.6-blokka: `box-sizing: border-box` på panelene, inputfeltene og lagringsradene, og `button, select, input { font-family: inherit }`. Uten den siste står knapper uten egen skrift i systemskriften.
- Samtaler: tallene 1 til 9 i det tomme skrivefeltet klikker ord nummer n i #dlg-kw (talk.js). Tallet foran ordet er en CSS-teller og står ikke i textContent, så `kws()` i testriggen er uendret.
- Journalen (ivan.js) viser fargen for fakta, svart og villspor først når `reported` er satt.
- Testriggen med ekte skrifter: Google Fonts nås ikke fra sandkassen, så skjermbilder viser reserveskriftene. `npm install @fontsource/grenze-gotisch @fontsource/alegreya @fontsource/alegreya-sans-sc` i en egen mappe og svar på forespørslene til fonts.googleapis.com og fonts.gstatic.com med CSS og woff2 derfra (page.route i Playwright), så ser bildene ut som i en vanlig nettleser.

## Ereb Altor: geografi til verdenskartet

- Fristaden ligger innerst i Dakkilobukten (Drakdjupet i 2024-kartet) nordøst på Aidne-halvøya, ved foten av fjellet, med Karad Batur like ved. Pharynx er et hertugdømme midt i Zorakin ved Caddobukten, omtrent 1 100 km fra Fristaden. Edelfara er sørvest i Pharynx ved Torilskogen på Grindanu. Spillet har i dag bare 9 timers reise mellom dem.
- To lag med kanon: 1985 til 1991 (Ivanhoe, Spelledarboken og Kampanjboken 1989, Svartfolk) har Pharynx, Torilskogen og Kardien. 2024 til 2025 (Helmgast) har Karad Batur og Kardunien, men ikke Pharynx. Ereno ligger nord eller nordøst for Fristaden i de gamle bøkene og sør i 2024-kartet.
- Avstander og sjøreiser, farer per område og kildene står i docs/verdenskart.md. Reiseregler i Bok II s. 5: gang 20 km, marsj 30 km, ritt 25 km, hard ritt 40 km per 12 timer, dårlig vær -25 %, elendig -50 %. Hemvistkoder for monstre i Bok II s. 24.

## Testing

- Testriggen ligger i tools/test. shot.mjs åpner siden i headless Chromium med SwiftShader og ruter three.js til lokal node_modules (stien THREE_DIR må peke riktig). NOANIM=1 slår av CSS-animasjoner (de står på 0 fordi hvert bilde tar over et sekund), LOWQ=1 setter lav grafikk og stille lyd, INIT="$(cat sim.js)" legger inn hjelpere, VW/VH/TOUCH for mobil.
- sim.js: window.sim(sekunder, fn) kjører spillogikken i faste steg uten rendering. placeNear(e, dist) setter spilleren i sikt av en fiende.
- stress.js: stress(yrke, sekunder per nivå) lager en tilfeldig rollperson og går gjennom alle fem nivåene med tilfeldige handlinger.
- bot.js: bot(sheetFn, sekunder, nivå) er en enkel spiller som går langs gangene til nærmeste fiende. Brukes til grov balanse. setTimeout virker ikke inne i sim, så dödsslag registreres bare som "nede".
- Musikknivåer kan måles ved å rendre sangene i en OfflineAudioContext.
- town.js (i tools/test): goto(tx, ty, sek) flytter spilleren og kameraet, setHour(h) stiller klokka og setter alle på plass, npc(id), talk(id), ask(ord), kws().
- townstress.js: townWander(sek) rusler tilfeldig, talkAll() snakker med alle og kjøper fra alle tjenester. day.js: dayTest(timer) kjører døgnet og melder hvem som står fast.
- stress.js starter nå i byen og tar kloakkluken ned. Medvetslös håndteres med koWake/koHero.
- shot.mjs tar handlinger som JSON: {"t":"eval","js":"..."}, {"t":"shot"}, {"t":"key","k":"Enter"}, {"t":"wait","ms":300}. Logger skrives ut før det siste skjermbildet, som får 20 s.
- combatfx-browser.mjs lokalt i denne sandkassen: PLAYWRIGHT_PATH=/home/claude/devenv/node_modules/playwright og CHROME=/opt/pw-browsers/chromium-1194/chrome-linux/chrome, ellers leter Playwright etter en nyere Chromium som ikke finnes.
- stress() kjører sim(), som ikke kaller G.weather.update. Test været med en egen løkke, eller med skjermbilder (rAF-løkka kjører mellom handlingene i shot.mjs).
- area.js (i tools/test, fra 0.6): area(id, ankomst, time) laster et område, at(tx, ty) flytter spilleren, its() lister det du kan bruke, useIt(tekst) bruker det, ivan() viser oppdragets tilstand. Sammen med talk, ask og kws fra town.js kan hele kjeden kjøres: kureren, depesjen, orchene, Kettil, markisen, brevene, Ulfmar, leiren, kisten og Pharynx. node tools/test/areamap.mjs tegner områdene som tekst.
- Testriggen med skjermbilder: SwiftShader bruker 5 til 30 s per bilde i områdene. Skriv utdata til en loggfil i stedet for å pipe til tail (alt forsvinner ved timeout), og bruk absolutte stier til skjermbildene. Ikke bruk pkill -f med et mønster som også treffer ditt eget skall. Spilleren dør i lange sim-kjøringer; sett P.invuln og kroppens KP på nytt mellom stegene hvis du tester noe annet enn kamp.
- Stresstest-boten holder nesten aldri parera eller dukker, så 0 pareringer i resultatet er normalt. Test parering med et eget skript: sett P.guard = 1, P.parryT = { vapen: 0, vapen2: 0 } og P.invuln = 0 før hvert anfall (invuln 0,12 s etter et treff stopper neste anfall).

## Gotchas

- Knapper beholder fokus etter klikk, og mellomrom kan da trykke dem igjen. Vi kaller blur() når et løp starter eller fortsetter.
- `[hidden]` må ha `display: none !important` fordi skjermene bruker `display: grid`.
- Punktstørrelse i partikkel-shaderen må skaleres med høyde og fov (FX.setScale) ved resize.
- Backspace og Escape i tittelen går tilbake, men ikke når du skriver i navnefeltet.
- SphereGeometry med delvis kule må lages med HEMI() i kinmodels.js. SPH() i assets.js ignorerer ekstra argumenter.
- Skjold i hånda til figurer med armer trenger rotation.x = 1.55, ellers ligger det flatt når albuen er bøyd.
- Enemy.root er en THREE.Group. Ikke kall en metode root (ÖRTRANKOR feilet på det). Metoden heter entangle.
- Ikke bruk svenske kroppsdelnavn i norsk loggtekst. Bruk LOC_SHORT.
- Fiendens fv øker med dybden (fv + depth - 1), og kroppen skaleres med 1 + 0,1 x (depth - 1).

## Kampeffektlag (ChatGPT, 2026-10-08)

- `CombatFX` i `src/combatfx.js` arver `FX` og importeres som FX i main.js. Én endret importlinje. Claudes `fx.js` er beholdt, inkludert `spark()` for gjenstander.
- `src/combatfx-pool.js` har to instanslag: maks 128 glødeffekter og 96 småbiter. Ingen nye eksterne ressurser. `slash()` og `ring()` har egne shadere; øvrige overstyrte metoder kaller grunnlaget først.
- `clearLevel()` nullstiller også grunnlagets hugg, ringer og partikkel-tegneområder før neste frame. Samlingene må fortsatt hete slashes/rings dersom grunnlaget endres.
- Nye tester: `node --test tools/test/combatfx.test.mjs` og `node tools/test/combatfx-browser.mjs dist/combatfx-test`. Sistnevnte krever Playwright og et ferdig bygg; TEST_SOURCE=1 kjører kildemodulene direkte. CHROME og PLAYWRIGHT_PATH er valgfrie lokale stier.
- Lokalt på Chrome 154/SwiftShader: fire regresjonstester bestått, `stress('tjuv', 20)` gjennom fem nivåer uten feil, åtte umiddelbare oppryddinger med null gjenværende effekter. Testet sammen med inventar/lagring fra 26cddf7. GitHub Actions på b1520fa har også bygget den selvstendige HTML-fila og bestått alle regresjons- og nettlesertestene.
- Ingen DoD-regler eller lore er endret. Se `docs/kampeffekter.md` for metodegrensene ved videre grafikkarbeid.

## GitHub Pages (ChatGPT, 2026-10-08)

- Spilladresse: https://tombonator3000.github.io/DoD-Roguelite/. Pages bruker GitHub Actions, ikke en egen publiseringsgren. Bygg og publiser på main må lykkes før ny versjon vises.
- pages.yml kjører kampeffekt-regresjonstester og tools/test/combatfx-browser.mjs mot ferdig dist/index.html før upload-pages-artifact. Testen serverer HTML fra /DoD-Roguelite/, bruker den synlige startknappen, sjekker den innebygde anda, tastatur og pause/Fortsett, og kjører stress('tjuv', 20), shadere og opprydding. Et mislykket teststeg stopper deploy-jobben.
- Playwright 1.62.1 og Chromium installeres kun i CI med --no-save. Three r170 rutes til node_modules og skriftene erstattes i testen. Dette sjekker spillbygget og prosjektstien, men ikke CDN-tilgjengelighet eller den offentlige Pages-tjenesten. Actions-artefakten pages-spilltest inneholder bilder og resultat.json; HTML-fila som publiseres er uendret av testrutingen.
- Validering i PR #2: GitHub Actions 37741626256 på 0aa805b besto det minifiserte HTML-bygget, fire regresjonstester og hele nettlesertesten. /DoD-Roguelite/ startet med original and (19 594 verts), bevegelse og pause/Fortsett virket, alle fem nivåer og åtte oppryddinger besto, ingen konsoll- eller ressursfeil. PR-artefakten heter kampeffekter-test; Pages-artefakten heter pages-spilltest.

## Dialog mellom agentene

- `Dialog.md` i repoets rot brukes til beskjeder, spørsmål og overleveringer mellom Claude, ChatGPT/Codex og andre agenter, etter Toms bestilling 2026-10-08. Les nye innlegg ved øktstart, også på relevante arbeidsgrener/PR-er. Innlegg har meldings-ID, norsk tidspunkt, avsender/mottaker, emne, status og gren/PR; svar legges nederst med henvisning til ID-en. Beslutninger, arbeidsfordeling og utført arbeid føres også i memory.md, todo.md og log.md.

## Malte teksturer og grafikk (ChatGPT, D007)

- `src/textures.js` dekoder `window.TEX` før Game.init. `paintedTexture(navn)` returnerer `{ map, normalMap }` bare når hele paret finnes; ellers bruker fabrikkene gammel reserve. Delte teksturer caches, materialer RepeatWrapping/anisotropy 4, fargekart sRGB og normalkart lineære. Fanene bruker clamp.
- `build.mjs` bygger bare JPG/PNG direkte under `assets/tex/` inn som data-URI-er. Ingen bilde-fetch. Budsjett 4 000 000 byte, artifact 16 MiB. `raw/` er arbeidsdata og bygges ikke inn. Settet tar 3 856 040 byte; HTML omtrent 6,81 MB.
- 22 par, 512 x 512: gress, skogbunn, jord, brostein, heller, planker, klippe, teltduk, bindingsverk, steinvegg, bymur, takstein, spon, halm, skifer, kobber, kloakk_gulv/vegg, dverg_gulv/vegg og rev_gulv/vegg. Egne høyder i raw/*_h.png, OpenGL-normaler fra periodiske sentraldifferanser. Normal-PNG er paletter med 24 retninger, uten dithering; ikke sRGB.
- `tools/prepare_textures.py` krever Pillow og numpy bare ved bildeendring. Farge-JPEG kvalitet 76, kart 80; kantkorreksjon og snittlysstyrke etter D007. Bindingsverket settes sammen med presise UV-felt fra timber(), med smale skjøter ved sokkel/overbånd. KILDER.md dokumenterer egen AI-generert kunst og MIT-lisens.
- Nye materialfelt i townTextures: forest, rock, canvas. Nøytral materialfarge for malte kart utenfor byen og i Area; reservekart får gamle farger. CanvasTexture brukes til å skille reserve fra malte bilder.
- edelfara_kart_c er 1600 x 1152, bare canvas. NODES/EDGES og skjulte steder står for alle navn og ruter. Tegningen røper ikke den skjulte leiren. Reisekartets CSS-bredde begrenser høyden, draw() beholder forholdet 0,72. Ingen nye reiser eller regelendringer.
- pergament_c brukes via --pergament og body.malt-pergament for journal og dialog; mørkt blekk, også på tjenesteknapper. Faner fane_edelfara/eke/ridderskors/lekh er 256 x 512 PNG med alfa.
- `tools/test/texture-browser.mjs` tar bilder og måler én composer-render ved likt kamera. `texture-fallback.mjs` tester komplett/manglende/ødelagt sett og dekoding, fargerom og wrapping. CI kjører begge, Pages kjører fallback. Alle lokale spilltester, fem nivåer og åtte oppryddinger bestått uten feil. Visuell gjennomgang og målinger i docs/teksturer.md. Ingen nye tegnekall i byen eller områdene. Fysisk mobil og uvær er fortsatt åpne spilltester.
