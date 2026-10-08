# Logg: Svart Nebb under Fristaden

Alt som gjøres i prosjektet loggføres her med tidsstempel (Europe/Oslo).

## 2026-10-07

- 14:48 Oppstart. Mottok Ankor.obj (egentlig en zip: model.obj 138 MB, model.mtl, tex_img0.jpg 4096x4096) fra Tripo/Magnific, pluss referansebilder (Diablo II Resurrected, Hades, anda Svart Nebb).
- 14:50 Pakket ut zip. Modellen: 605 242 verts, 1 146 914 trekanter, en tekstur. Alt for tungt for sanntid i nettleser.
- 14:52 Desimerte med pymeshlab (quadric edge collapse med teksturbevaring) i tre steg: 300k, 100k, 24k trekanter. Beholdt UV-sømmer, beregnet glatte normaler.
- 14:53 Testrender i headless Chromium (three.js r170). Modellen ser bra ut. Fremover-retning er +X, foten står på y=0 etter sentrering. Høyde 1.65 enheter.
- 15:03 Pakket modellen til eget binærformat (assets/duck.bin, 399 KB: kvantiserte posisjoner, int8-normaler, u16 UV, u16 indekser). Tekstur nedskalert til 1024x1024 JPEG (146 KB).
- 15:05 Satte opp prosjektstruktur: src/ (ES-moduler), assets/, build.mjs (esbuild), dist/. three.js r170 lastes fra jsdelivr via importmap, alt annet bygges inn i én HTML-fil.
- 15:06 Skrev regelkjerne (src/rules.js): d20 under ferdighet, Drake på 1, Demon på 20, fordel/ulempe, seks tilstander knyttet til grunnegenskapene, skadebonus fra STY/SMI. Svart Nebbs rollformular: STY 13, FYS 14, SMI 16, INT 12, PSY 13, KAR 10.
- 15:08 Prosedyrisk lyd (src/audio.js): kvakk via sagtann og to formantfiltre, hugg, treff, mynter, drake-arpeggio, demon-dissonans, drypp i kloakken, drone.
- 15:10 Teksturer genereres i nettleseren (voronoi-brostein, murstein, heller) med normalkart. Shader-tillegg for kantlys/treffblink og gjennomsiktig sirkel rundt spilleren bak høye vegger.
- 15:12 Fiendemodeller av primitiver: kloakkrotte, skjelett, goblin-bueskytter, orch og sjefen Rødpels (rev med krone).
- 15:14 Dungeon-generator (src/dungeon.js): rom og L-korridorer (MST + løkker), start og trapp i hver sin ende (BFS), vannkanaler i kloakken, søyler i dvergehallene, fakler bare på høye vegger. Vegger mot kameraet blir lave. Flytfelt (BFS) for fiendenes veivalg.
- 15:16 Effekter (src/fx.js): partikler, hugg-buer i Hades-stil, røde telegrafer (sirkel, kjegle, rektangel), blodflekker, flytende tall i DOM, risting.
- 15:18 Loot (src/loot.js): våpen, rustning, amuletter med prefiks og suffiks, sjeldenhetsgrader, fire unike gjenstander. 16 gaver fra Utu, Mester Flansen, Far, Draken og Demonen.
- 15:20 Spiller (src/player.js): bevegelse relativt til skjermen, 3-slags Kvakk-Fu-kombo (tredje er spark), dukking med uskadelighet, kastekniv, vingevirvel, Hissig (kin-evne), snikemodus med snikmord, legedrikk. Vagge-animasjon på den statiske modellen.
- 15:22 Fiender (src/enemies.js): tilstandsmaskin med telegraferte angrep, bueskytter som holder avstand, orch som stanger, sjef med kombo, stanging, hyl (Redd) og rotteinnkalling.
- 15:24 Verden (src/world.js): lys-pool med 7 punktlys som tildeles nærmeste fakler, loot med lyssøyler og navnelapper, tønner og kasser, kister, trapp, fars butikk.
- 15:26 HUD og menyer (src/ui.js, src/page.html): Diablo-orber for KP og VP, evnelinje med nedkjøling, tilstandsrad, Ultima-logg med terningslag, automap rotert 45 grader, tooltip med sammenligning, rollformular.
- 15:28 Spill-løkke (src/main.js): tittelscene, etasjer, hvile i trappa med forbedringsslag og gavevalg, dødsslag (tre lyktes før tre feil), seier og tap, Mester Flansens dojo med fjær lagret i localStorage.
- 15:30 Første bygg: 945 KB. Testet i headless Chromium med SwiftShader. Ingen JS-feil.
- 15:31 Justert kamera (nærmere), tittelkamera og brosteinsskala.
- 15:33 Fikset: gjennomsiktig sirkel gjaldt også lave vegger (nå bare over 1.1 i høyde), lykta rundt spilleren sterkere.
- 15:34 Testet butikk, overgang med forbedringsslag og gavevalg, nivå 2, dvergehaller, sjefsarena, dødsslag, sluttskjerm.
- 15:35 Fikset: mer vann i kloakken (renner langs korridorer), kantlys på fiender, butikkskiltet skjulte far, norske gjenstandsnavn (kjønn og små bokstaver), hviletekst når KP er full, statistikk for skade tatt.
- 15:37 Mobil: berøringsknapper erstatter evnelinjen, logg og tooltip flyttet, tittelkamera løftet slik at anda synes over teksten. Pause ved tap av fokus.
- 15:38 Simulerte AI-kamp i faste tidssteg: orchen angriper to ganger på seks sekunder, spilleren feller den på fem.
- 15:39 Stresstest gjennom alle fem nivåene og sjefskampen med tilfeldige evner. Ingen feil, seier utløses.
- 15:41 Skrev README.md, memory.md, todo.md og IDEER.md.
- 15:44 Endret sidetittel til "Svart Nebb under Fristaden". Minifisert bygg: 877 KB totalt.
- 15:45 Publiserte prototypen som artifact (versjon 1).
- 15:46 La til tools/ (desimering og pakking av modell) og modell/ (desimert OBJ med 2K-tekstur og GLB, klar for rigging i Mixamo eller Tripo). Pakket prosjektet som svart-nebb.zip.
- 15:47 La til package.json (npm run build) og gjorde build.mjs uavhengig av sandkassestier. Ny zip.

## 2026-10-07, versjon 0.2: startmeny, musikk, grafikk og effekter

- 19:23 Ny bestilling: fancy startmeny, musikk, bedre grafikk, flere effekter.
- 19:28 Musikkmotor (src/music.js): lutt med Karplus-Strong (forhåndsrendret per tone, tonehøyde korrigert med playbackRate), drone med summing, kor med formantfiltre, fløyte med pust og vibrato, horn, FM-bjelle, forhåndsrendrede trommer (rammetromme, slag, rasle, tom, dunk, ambolt). Sequencer med lookahead.
- 19:29 Komponerte sanger: "Svart Nebbs vise" (tittel, 3/4, d-moll, 16 takter med melodi), utforsking (generativ, egen akkordrekke for dvergehallene med ambolt), kamplag som tones inn etter hvor mange fiender som jakter deg, sjefstema i d-frygisk med hornriff, seier i D-dur med bjeller, dødsstikk.
- 19:31 Lydsystemet fikk egne busser for musikk og effekter, generert romklang (convolver med tidlige refleksjoner), volumkontroll.
- 19:33 Etterbehandling (src/post.js): kromatisk aberrasjon, split-toning, kontrast, metning, vignett, filmkorn, fargeblink og aberrasjonspuls ved store treff. CSS-vignetten fjernet.
- 19:36 Grafikkmodul (src/gfx.js): runesirkel, stjerne, røyk, rist, spindelvev, bannere (dverg og rev), runerekker, ruhetskart med sølepytter, volumetrisk lyssjakt-shader, kontaktskygger.
- 19:38 Shader-tillegg: oppløsning (dissolve) med glødende kant, inverted hull-kontur.
- 19:40 Bakt AO i dungeon-geometrien: gulvfliser delt i 2x2 med mørkere hjørner nær vegger og søyler, vegger mørkere nederst. uv1 for ruhetskart i stor skala, vertexfarger.
- 19:43 Pynt (src/decor.js): lyssjakter fra rister med støv og lys, kloakkrør med slim og drypp, glødende dvergeruner, bannere som svaier, spindelvev, stearinlys, steinrester, trone med safransekker og mynter hos Rødpels. Tåke og støvkorn rundt spilleren.
- 19:47 Tittelscene (src/title.js): steinplattform med to runesirkler, anda med kantlys og kontur, søyler i halvsirkel, to fyrfat med lys og glør, lyssjakt med skyggekastende spotlight, tåke, kamera som kjører inn og sirkler.
- 19:50 Ny meny: splash med studionavnet, logo med gullglans og innglidning, menypunkter med diamantmarkør, flammestrek og hint, piltaster og lutt-toner ved bytte. Paneler for dojo, kontroller, innstillinger (musikk, lydeffekter, grafikk lav/middels/høy, skjermristing) og om spillet. Iris-overgang mellom meny, spill og etasjer.
- 19:52 Effekter: treffstjerner, ring og gullblink ved Drake, rødt blink ved Demon og skade, blå etterbilder ved dukking (oransje ved Hissig), fotstøv, røyk og gnister fra fakler, portalpartikler ved trappa, slow motion når sjefen dør, lykta blir rød under Hissig, avmetting under dødsslag.
- 19:55 Feil funnet og rettet: første bilde fikk negativ tidsdifferanse, så aberrasjonspulsen vokste. dt klemmes nå til minst 0.
- 19:56 Dempet lyssjakta på tittelen, mindre glød rundt fyrfatene, lysere og mer gjennomsiktig røyk (ny alfamultiplikator per partikkel), mindre slimdam.
- 19:58 Målte musikknivåer med offline-rendering: alt under 0.8 i topp unntatt sjefstemaet (1.38). Demper trommer, horn og kor der.
- 20:00 Testet hele flyten (splash, meny, iris, spill, pause, tilbake), mobilvisning, seiersskjerm. Stresstest gjennom alle nivåer og sjefen: ingen feil.
- 20:02 Oppdaterte README.md, memory.md og todo.md.
- 20:04 Republiserte artifact (versjon 2) og pakket ny zip.

## 2026-10-07, versjon 0.3: egen rollperson og flere DoD-regler

- 21:05 Ny bestilling: bruk reglene fra Google Drive eller nettet, lag mulighet for egen rollperson, si hva som mangler.
- 21:08 Søkte i Google Drive. Fant "Ereb Altor: Hjältar från Kopparhavet" (bakgrunnstabeller for Aidne/Zorakin, navn, språk), men ikke grunnboka for DoD 2023. Hentet teksten til /home/claude/rules/hjaltar.txt.
- 21:12 Startet tre søkeagenter parallelt: rollpersonsskaping, kamp/skade/vila, hjelteevner/magi/pressing. Kilder: Free Leagues offisielle Foundry-modul (via italiensk oversettelse), Foundry-systemkoden, Roll20-arket, offisielle forhåndsgenererte rollpersoner og forumet til Fria Ligan.
- 21:40 Alle tre rapporter er inne. Viktige funn: Ill-Tempered heter Vresig på svensk (ikke Lättretad), Webbed Feet heter Simfötter. Mange WP-kostnader og krav for hjelteevner er ikke verifisert.
- 21:45 Leste gjennom koden på nytt og la en plan: ny datamodul (dod.js), rollpersonsskaping i tittelmenyen, modeller for alle släkten, parera og undvika som slag, pressa slag med sakte film, drakvalg og demon-missöden, vila etter reglene, rädsla, monsterangrep fra tabell, magi med effektgrad.
- 21:55 Ny datamodul src/dod.js: grundegenskaper, grundchans, skadebonus, förflyttning, 30 ferdigheter (20 allmenne, 10 våpen) og sekundære (magiskoler, Observation og Taktik fra Ereb Altor), tillstånd, ålder, släkten med släktesförmågor, alle ti yrken med ferdighetslister, startevne og utrustningspakker A/B/C, våpentabell, rustning og hjelmer, skadetyper, 26 hjälteförmågor, 12 besvärjelser, 9 trolleritrick, tabeller for svaghet, utseende, minnessak, Aidne-bakgrunn, rädsla, missöden (närstrid, avstånd, magi) og svåra skador. Uverifiserte verdier er merket uv.
- 22:00 src/rules.js: terninger, slag med fördel/nackdel, 4T6 stryk laveste, alder, buildSheet fra valgene, Svart Nebb bygget på nytt som DoD-rollperson (anka, tjuv, medelålders, Tjuvhugg, Järnnäve og Lönnmördare), randomChoices for "Slumpa allt".
- 22:04 src/loot.js: gjenstander bygget på DoD-våpen og rustning, Mesterverk-affiks, smart loot etter tränade våpenferdigheter, nye unike (runøks, alvebue), gaver som før pluss Vingevirvel som Flansen-gave.
- 22:08 src/kinmodels.js: modeller av primitiver for människa, halvling, dvärg, alv og vargfolk med klær etter yrke, rustning og hjelm, våpenmodeller for alle typer, jakthund og demon. Anka bruker fortsatt 3D-modellen.
- 22:15 src/player.js skrevet om: våpen med ferdighet, STY-krav, grep og brytvärde, kombo per våpentype (spark med Slagsmål for kniv og knyttneve), skudd med bue, armbrøst og slynge, kast som må plukkes opp, parera (hold høyre knapp) og undvika som slag, pressa slag, drakvalg, missöden, tillstånd som varer til vila, släktesförmågor på F, hjälteförmågor og besvärjelser på R/G/T med effektgrad, vila (V og H), dödsslag med Samla sig, skräcktabell, animasjon av armer og bein.
- 22:22 src/enemies.js: NPC-er slår og kan parera/undvika, våpnene deres kan brekke, skjelett tar halv stikkskade, sykdom fra rotter (FYS-slag), monsterangrep som alltid treffer, Rødpels med T6-tabell uten gjentak og handlingskraft, demon fra magiskt missöde, frys, søvn, røtter og løfting.
- 22:28 src/world.js: låste kister (Fingerfärdighet, dyrkar, bryt opp med STY), gjemmesteder (Finna dolda ting), runestein i dvergehallene (Främmande språk eller Myter & legender), prosjektiler fra spilleren, lyn, gyllent spor (Skattjägare), Intuition, Splittra.
- 22:32 src/companion.js: hunden til Jägare (Följeslagare). Følger, speider på kartet og biter på kommando.
- 22:36 src/creation.js og ny tittelflyt: Rollpersoner (velg, endre, slett, lagres i nettleseren) og rollpersonsskaping i åtte steg med terningslag, forhåndsvisning på plattformen og formulär til slutt.
- 22:40 src/ui.js: evnelinje bygges ut fra rollpersonen, nytt rollformulär i DoD-stil, kart viser gjemmesteder, bytte og hund, pressa-boks, vilestolpe, døende-indikator.
- 22:42 src/main.js: velg rollperson, ambush med Upptäcka fara, Bestiologi første gang du ser en fiendetype, pressa slag med sakte film, kort vila i trappa, reparasjon med Hantverk, sesjonsspørsmål med kryss du velger selv, förbättringsslag, hjälteförmågor som belønning, dödsslag og Samla sig, svåra skador, butikk med Köpslå, forskudd (Övertala), dyrkar, reparasjon og lång vila. Herr Nansen har egne replikker når du ikke spiller sønnen hans.
- 22:44 Første bygg uten feil. Panelene i menyen så tomme ut i testen: CSS-animasjonene står på 0 fordi SwiftShader bruker over et sekund per bilde. Det samme skjedde i 0.2. Testriggen slår nå av animasjoner (NOANIM=1) og bruker lav grafikk (LOWQ=1).
- 22:47 Skjermbilder av alle släkten på plattformen. Skjoldet lå flatt som et brett. Fikset vinkelen. Smalere skapingspanel så figuren synes, kortere navn på stegene.
- 22:50 Simulert kamp med Svart Nebb: anfall, kast (dolken landet og ble plukket opp igjen), Vresig, Smyga med Omtöcknad (nackdel), pressa slag (standardvalget ble Omtöcknad, riktig for SMI), kort vila, dödsslag til døden.
- 22:52 Stresstest gjennom alle fem nivåer for tjuv, magiker, krigare og jägare: ingen feil. Ridder i plåt mot Rødpels: drepte sjefen og tok 1 skade. Økte skaden på Rødpels' angrep (2T10 og 3T6).
- 22:54 Testet magi direkte (Eldklot, Frost, Vindstöt), låst kiste, gjemmested, butikk med Köpslå og lång vila.
- 22:56 Balansetest med en enkel bot som går etter nærmeste fiende: fiendene slo for ofte etter DoD-skaden. Lengre pause mellom NPC-anfall (én handling per runde). Etterpå klarer Svart Nebb og en krigare hele nivå 1, svake rollpersoner med 6 til 7 KP faller.
- 22:58 Stresstest av alle ti yrker: ingen feil. Dödsslag-tittelen på svensk, HUD oppdateres når du faller.
- 23:00 Kopierte testriggen til tools/test (shot.mjs, sim.js, stress.js, bot.js).
- 23:06 Republiserte artifact (versjon 3) og pakket ny zip med kildekode, testrigg og oppdatert dokumentasjon.

## 2026-10-08, versjon 0.4: Fristaden over bakken

- 03:39 Ny bestilling: lag by over bakken, tenk Ultima men med Ereb Altor. Samme melding inneholdt et innlegg om "advisor"-oppsett i Claude Code, som skal sjekkes mot dokumentasjonen og besvares til slutt (ingen endringer i oppsett).
- 03:42 Sjekket advisor-dokumentasjonen: /advisor, advisorModel og --advisor finnes. "Haiku 5.5", --subagents, JEV, 340 tok/s, 16 ms og 3x arbeiderpool finnes ikke i dokumentasjonen.
- 03:45 Leste dungeon.js (Dungeon, GeoBuilder, vann), music.js (sangformat) og lore om Fristaden, Karad Batur, Tornväktarorden og Utu fra Ereb Altor-teksten. Plan: Town-klasse som arver Dungeon, håndlagd bykart, NPC-er med nøkkelordsamtaler som i Ultima IV/V.
- 03:55 src/townmap.js: kartet over Fristaden som ren data (46 x 46 fliser): bymur med Nordporten og tårn, elva med to broer og brygge, torget, gater, elleve bygninger med dører, gjerder, kirkegård, trær og steder folk står, sitter og sover. Skrev kartet ut som tekst i node for å sjekke det.
- 04:05 src/towntex.js: prosedyriske teksturer for bindingsverk, steinmur, takstein, spon, halm, skifer, kobber, brostein, heller, jord, gress og planker, pluss faner for Tornväktarorden og Zorakin og skilt over dørene.
- 04:12 src/town.js: Town arver Dungeon. Tynne vegger med egne kollisjonsbokser, dører med karm og dørblad, vinduer med skodder som lyser om kvelden, saltak og pyramidetak som tones ut når du går inn (og veggene mot kameraet senkes, som i Ultima VII), piper som ryker, bymur med murtinder og fallgitter, elv med bruer og rekkverk, åkrer utenfor muren, inventar i alle hus, gatelykter, brønn, salgsboder, oppslagstavle, minnestein, solur og kirkegård. Sol og måne etter klokka.
- 04:20 src/townpeople.js: seksten personer med nøkkelordsamtaler (NAVN, JOBB, FARVEL og ord i gull som blir nye spørsmål), døgnrytme, rop på torget og svar som avhenger av Aidne-bakgrunnen din. Lore fra Hjältar från Kopparhavet: Utu mot Shamash, Tornväktarnas tre løfter og martyrer, dvergene fra Karad Batur, kong Balian som Solens beskyddare, Kardunien og svartsoppa med kanel.
- 04:26 src/talk.js: samtalemotoren. Skriv et ord eller klikk. Bare de fire første bokstavene teller, som i Ultima IV. Ord du har lært og folk du kjenner navnet på lagres mellom løp.
- 04:32 src/townfolk.js: byfolk som går mellom steder med egen stifinning, sitter ved bordene, sover i sengene, går opp trappa om natta. Tjenester: rom og mat på vertshuset, helbredelse og velsignelse i tempelet, munkeløftet hos Jehanne, smie, reparasjon og sliping, trening med fjær hos Flansen (virker med en gang), besvärjelser og trolldrikk hos Gynerva, krydderbod, almisse til tiggerkongen. Tre oppdrag (rotter, skjeletter, runesteinen). Tyveri med Fingerfärdighet: lettere om natta når Utu ikke ser, vanskeligere i dagslys med vitner. Blir du sett, kommer vakta: bot eller en natt i vaktstua. Fiske fra brygga, opptreden på vertshuset, brønnvann, offergave.
- 04:38 Koblet inn i spillet: løpet starter på torget, kloakkluken tar deg ned, og fra trappa kan du klatre opp igjen (luken husker nivået). Klokke i HUD-en (dag og tid), bykart med hus og navn, fred i byen (ingen våpen), ny sang "Fristadens torg" i D-dur som blir stille om natta og en dans på vertshuset, fuglesang om dagen og sirisser om natta.
- 04:44 Første bygg uten feil. Første skjermbilde: byen tegnes. Takene løftet seg ikke når jeg gikk inn: populate() lagret World i this.W og overskrev bredden på rutenettet. Rettet.
- 04:50 Brønnen, soluret og gravsteinene var svarte (materialet ventet vertekstfarger som ikke fantes). Natta var nesten helt svart: lysere måne, flere lykter, lysere elv. Indre vindusglass lyser ikke lenger om natta. Mindre glødende kull i smia.
- 04:55 Test av samtaler, butikk, rom på vertshuset, tyveri, kloakken ned og opp igjen. Tyveribrikka på bodene sto på feil side. Rettet.
- 04:58 Døgntest (24 timer): alle seksten kommer fram til stedene sine. Mobilvisning av samtalen. Tegnekall ned fra 484 til omtrent 300 (folk langt unna skjules, småbiter kaster ikke skygge, smalere skyggekjegle).
- 05:02 Stresstest av alle ti yrker gjennom byen og fem nivåer: ingen feil. Seks rundturer by og kloakk: ingen lekkasje. Snakket med alle og kjøpte fra alle tjenester: ingen feil. Tyv tatt i dagslys: vakta lar deg ikke gå før du har betalt eller sittet inne.
- 05:06 Magiker hos Gynerva lærte Frost og kan forberede de andre. Hjelpeteksten forklarer byen.
- 05:25 Snakkeavstand til folk bak disker og boder (de sto for langt unna). Stort bykart med mørk bakgrunn, hele byen og navn. Elva synes nå (gresset utenfor muren lå over vannet). Rolige farger på vannet.
- 05:30 Siste runde: alle snakket med, tolv timers døgntest, tjuv, magiker og riddare gjennom fem nivåer. Ingen feil. Oppdaterte README.md, memory.md og todo.md, versjon 0.4.0.
- 05:33 Republiserte artifact (versjon 4) og pakket ny zip.

## 2026-10-08, versjon 0.5: inventar og grafikk

- 07:59 Ny bestilling: inventarsystem, flere shadere, flere partikler, "et visuelt mesterverk".
- 08:04 Leste post.js, fx.js og koden for gjenstander og legedrikker. Plan: sekk etter bärförmåga (STY/2) med belte og småsaker, inventarskjerm med 3D-ikoner og nærbilde av rollpersonen, prosedyrisk ild i ett tegnekall, nytt vann, vind i gress og løv, våte flater med refleksjoner, regn og lyn i byen, flere partikler (løv, fugler, flaggermus, sporer, gnister rundt gjenstander), tilt-shift og fargegradering per sted og tid.
- 08:12 Tom vil ha en lagre/laste-meny, og at alt flyttes til GitHub-repoet Tombonator3000/DoD-Roguelite. ChatGPT skal også hjelpe til.
- 08:14 Klonet repoet. Det hadde bare LICENSE og en README på én linje, og ingen agents.md. Første commit blir versjon 0.4 slik den ble publisert, pluss AGENTS.md med reglene for prosjektet og samarbeidet, .gitignore, rådata for modellen (modell/) og en GitHub Actions-jobb som bygger spillet og publiserer det til GitHub Pages.
- 08:16 Testriggen leser nå THREE_DIR og CHROME fra miljøet, så den kan kjøres andre steder enn i denne sandkassen. three 0.170.0 ligger i devDependencies.
- 08:19 Tom delte https://kingafw.no/Drakar/index.html. Det er et bibliotek med de eldre utgavene (DoD 1.0 til 5.0, Expert, Gigant, Chronopia) på svensk, med transkribert tekst. Skrevet inn som kilde i AGENTS.md og memory.md.
- 08:24 src/inventory.js: sekk med bärförmåga, överlast (tregere, nackdel på Smyga og Undvika), belte med fire legedrikker, stabler, mat, drikk og verdisaker (mynter, beger, edelsteiner, ringer, kjeder, en splint av revekrona). Pickups går i sekken, eller tas på hvis plassen er ledig. X tar på med en gang. Herr Nansen kjøper alt (SELGE), Bataar bare jern. Butikker og belønninger går gjennom giveItem.
- 08:26 Tom vil bytte til de gamle reglene: DoD91 (versjon 4.0), med Expert og Gigant der DoD91 ikke dekker noe. Lastet ned Bok I, II og III fra DoD 4.0, Expert Regler og Magi og Gigant Regelbok som tekst fra biblioteket. Tom valgte fulle träffområden, at 2023-reglene fjernes helt, og at reglene kommer før shaderne.
- 08:34 src/itemmodels.js: 3D-modeller for alle gjenstander (brynje, platerustning, hjelmer, amuletter, mat, flasker med væske, edelsteiner, beger, kjede, krone), med lysstråle og runesirkel på bakken i sjeldenhetsfargen, og glitter rundt magiske ting.
- 08:40 src/icons.js og src/invui.js: inventarskjermen. Egen liten WebGL-renderer lager 3D-ikoner (tonemapping og sRGB riktig), og gjenstanden du velger snurrer i detaljfeltet. Kameraet går inn i nærbilde av rollpersonen, som snur seg mot deg. Dra og slipp mellom sekk, kropp, belte og bakken, dobbeltklikk gjør det vanligste, sammenligning med det du har på. I eller SEKK-knappen åpner. Sekk-teller i HUD-en blinker rødt ved överlast.
- 08:44 src/save.js og src/saveui.js: lagre og laste med autolagring og tre plasser, med bilde av skjermen. Nivået bygges på nytt fra frøet, og bare endringene lagres: hvilke fiender som lever og hvor, åpne kister, knuste tønner, gjemmesteder, ting på bakken, kartet du har sett og butikken. Fortsett og Last spill i tittelmenyen, Lagre og Last i pausemenyen. Ikke midt i en kamp. Autolagring slettes når løpet er over.
- 08:47 Test: inventar med dra og slipp, lagre i byen og på nivå 2, laste begge, Fortsett i tittelen. Stresstest tjuv og krigare gjennom fem nivåer uten feil.
