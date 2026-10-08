# Svart Nebb under Fristaden

En spillbar prototype av et roguelite i stil med Diablo og Hades, med litt Ultima i dialogen. Du spiller Svart Nebb (egentlig Nansen), anka fra Fristaden i Zorakin, eller lager din egen rollperson. Reglene under panseret er Drakar och Demoner 4.0 fra 1991, med Expert og Gigant der det trengs, tilpasset sanntid: 1T20 mot CL, perfekt og fummel, träffområden med egne KP og rustning, parering per stridsrunde, Skräcktabellen, stridsmoral, magi med PSY, erfarenhet og hjältepoäng.

Laget med three.js r170. Alt annet er skrevet for hånd: teksturer, musikk, lyd, fiendemodeller og effekter genereres i nettleseren. Den eneste eksterne ressursen er 3D-modellen av anda, som er pakket inn i HTML-fila.

## Nytt i 0.6: Edelfara og Triangeldrama i Edelfara

- Nordporten i Fristaden åpner et reisekart over Edelfara i hertugdømmet Pharynx. Klikk på et sted og trykk Reis. Reisen tar timer på klokka: ni timer gjennom Torilskogen til Ekeskogen, og videre til Sortmund, Akershus og Glimming.
- Eventyret «Triangeldrama i Edelfara» fra Drakar och Demoner Ivanhoe. Første tur stopper i Ekeskogen, der hertigens kurir ligger død med en depesj: Riddar Kettil er drept og markisens pengekiste er borte. Tre adelsmenn mistenker hverandre, og grevens soldater beleirer Akershus. Om sju dager stormer de borgen.
- Sju områder i 3D tegnet etter kartene i boka: Ekeskogen, Sortmund med markisens plakater og vindmølla, Ridderskors borg, Akershus med grevens leir under borgkullen, Akershus borg, Glimming og Lekhs leir i skogen sør for Akershus.
- Over førti personer med samtaler etter modulen. Ledetråder, villspor og bevis samles i journalen i pausemenyen: ulvespor, tygde papirbiter, hullingpiler, myntene i ledarorchens pung, brevet til Trigorm og brevet til mjølneren.
- Nye fiender etter statblokkene: orcher på veien, ledarorchen, elitorcher, orcher med armborst, svartalfer, ulver og Lekh med arbalest. Lekh flykter på en ulv hvis det går dårlig.
- Overtal grevens riddarkapten med bevisene, så slutter greven og baronen fred og følger deg mot leiren. Eller gå inn alene. Kisten kan bæres tilbake til markisen, eller brytes opp.
- Fire slutter når du rapporterer til hertigens vaktkaptein i Pharynx, etter hva som skjedde med Akershus, freden og kisten.

## Nytt i 0.5: DoD91, inventar og lagring

- Reglene er byttet fra DoD 2023 til DoD 4.0 (1991) med Expert og Gigant. Sju grundegenskaper med STO, FV per ferdighet, yrkene og rasene fra Bok I, stridskonster fra Gigant (Quack-fu for anka).
- Fulle träffområden: hvert treff går mot en kroppsdel med egne KP og egen rustning. En arm på 0 slipper våpenet, et bein på 0 setter deg på kne, hodet på 0 slår deg ut. Kroppsdelene vises som en liten figur ved KP-kula.
- Parering er ett slag per våpen eller skjold per stridsrunde, med tabellen fra Bok II: skade over BV koster våpenet 1 BV. Fiendene parerer også, og de har egne våpen og rustning.
- Magi koster PSY. Effektgraden senker CL. Fummel gir Snedtändning. Ingen metall mot kroppen.
- Medvetslös i stedet for dödsslag: vätter og orcher raner deg, rotter biter, skjeletter og demoner slår videre. Du våkner etterpå, eller reiser deg med en hjältepoäng.
- Erfarenhet per ferdighet. Den setter seg når du hviler en uke på Den feite gåsen. Hjältepoäng fra store dåder gjør neste slag bedre (V), eller blir til grundegenskaper og hjälteförmågor hos Syster Jehanne.
- Ny rollpersonsskaping i ti steg etter Bok I, med tre sett terninger, flytting 2:1, alder, socialt stånd, yrkesval, EP-fordeling, besvärjelser, utrustning og navn.
- Inventar med 3D-ikoner: sekk etter bärförmåga (STY kg), belte med legedrikker, sju plasser på kroppen (også armar og ben), dra og slipp, sammenligning med det du har på.
- Lagre og laste: autolagring og tre plasser med bilde, både i byen og nede i kloakken.
- Ild som shader: fakler, fyrfat, lykter og ildsteder har levende flammer med tunger, alle i ett tegnekall.
- Nytt vann som speiler himmelen og lyktene, med ringer når noen går i det eller plasker.
- Vær i Fristaden: klart, skyet, regn og uvær etter klokka. Regn med plask, lyn og torden, vind i gress og trær, løv som blåser, sølepytter som speiler himmelen, og skyskygger. Regnet holder seg utenfor husene.
- Liv i lufta: fugler om dagen, flaggermus om natta og i hallene, sporer i kloakken, glør i smia, damp fra vannet, røkelse i tempelet og krydderrøyk hos Rødpels.
- Tilt-shift og fargestemning per sted og tid på døgnet.

## Nytt i 0.4: Fristaden over bakken

- Løpet starter i Fristaden, en by i Ultima-stil over kloakken: bymur med Nordporten og tårn, torg med brønn og salgsboder, elv med bruer og brygge, kirkegård, og elleve hus du kan gå inn i. Taket løfter seg og veggene mot kameraet senkes når du går inn, som i Ultima VII.
- Seksten personer med navn, jobb og døgnrytme: herr Nansen i Hvass handel, kjøpmann Hvass, Mester Flansen i dojoen, vertinne Rosmynda på Den feite gåsen, fader Cassian i Utus soltempel, syster Jehanne av Tornväktarorden, dvergsmeden Bataar fra Karad Batur, trollkyndige Gynerva i tårnet, tiggerkongen Tobolt under brua, kryddhandleren Gaspard fra Kardunien, vaktene Folkard og Garin, kålbonden Edegar, fiskeren Regin, halvlingungen Pimpa og skalden Isold. De åpner butikkene om morgenen, spiser på vertshuset om kvelden og sover om natta.
- Samtaler med nøkkelord som i Ultima IV og V: NAVN, JOBB og FARVEL virker alltid, ord i gull blir nye spørsmål, og du kan skrive selv (bare de fire første bokstavene teller). Navnet vises først når du har spurt. Ordene og folkene du kjenner huskes mellom løpene.
- Lore fra Ereb Altor: Utu mot Shamash, Tornväktarnas tre løfter og martyrer, dvergene fra Karad Batur, kong Balian som Solens beskyddare, tiggardrottningen i Kardunien og svartsoppa med kanel i stedet for galle. Aidne-bakgrunnen din gir egne svar og fordeler.
- Tjenester: rom, mat og mjød, helbredelse og Utus velsignelse, munkeløftet hos Jehanne, smie med reparasjon og sliping, trening med fjær hos Flansen (virker med en gang), besvärjelser og trolleritrick hos Gynerva, krydderbod, almisse som avslører gjemmesteder, fiske, opptreden, brønnvann og offergave.
- Tre oppdrag: rotteplagen, de dødes fred og runesteinen. De står i pausemenyen.
- Tyveri med Fingerfärdighet: lettere om natta når Utu ikke ser, vanskeligere i dagslys med vitner. Blir du sett, kommer vakta med bot eller en natt i vaktstua. Rykte påvirker prisene.
- Dag og natt med sol, måne, lykter som tennes, lysende vinduer, røyk fra pipene, fuglesang og sirisser. Klokka går også i kloakken.
- Fra trappa mellom nivåene kan du klatre opp til byen, og kloakkluken tar deg tilbake dit du snudde.
- Ny musikk: «Fristadens torg» i D-dur, stille om natta og en dans på vertshuset.

## Nytt i 0.3 (med DoD 2023-reglene, byttet ut i 0.5)

- Rollpersonsskaping etter kapittel 2 i DoD: släkte (T12), yrke (T10), ålder (T6), grundegenskaper (4T6, stryk laveste, ett bytte), färdigheter (6 fra yrket og 2, 4 eller 6 frie), hjälteförmåga eller tre besvärjelser og tre trolleritrick, utrustningspakke (T6), navn, svaghet, utseende og minnessak (T20). Valgfri bakgrunn fra Aidne (Ereb Altor) med socialt stånd og en ekstra tränad ferdighet.
- Rollpersonene lagres i nettleseren og kan endres eller slettes. Svart Nebb er bygget på nytt som en ferdig DoD-rollperson.
- Modeller for alle seks släkten, med klær etter yrke, rustning, hjelm og våpen i hendene. Jägaren har en hund.
- Alle våpen fra boka med ferdighet, STY-krav, grep, brytvärde og egenskaper. Buer, armbrøst og slynge skyter. Kastvåpen må plukkes opp igjen.
- Parera (hold høyre knapp) og undvika er slag. Mislykkede viktige slag kan presses mot et tillstånd, med sakte film mens du bestemmer deg.
- Drake og Demon på anfall følger reglene (drakvalg og missödestabeller). Fiender parerer og undviker også, og våpnene deres kan brekke.
- Släktesförmågor (Vresig, Simfötter, Anpasslig, Hal som en ål, Långsint, Inre frid, Jaktsinne) og 26 hjälteförmågor, de fleste brukbare i sanntid.
- Tre magiskoler med tolv besvärjelser og ni trolleritrick. Hold tasten for effektgrad 2 og 3.
- Rødpels er et monster med angrepstabell (T6), handlingskraft og et vrål som gir skräckslag.
- Vila etter reglene, dödsslag med Samla sig, omedelbar død, svåra skador (valgfritt), sesjonsspørsmål og förbättringsslag.
- Ferdigheter utenfor kamp: låste kister, gjemmesteder, dvergeruner, bakhold, Bestiologi, Köpslå og forskudd hos herr Nansen, reparasjon med Hantverk.

## Nytt i 0.2

- Splash og tittelskjerm med egen 3D-scene: anda på en plattform med runesirkel, lyssjakt, fyrfat og tåke.
- Prosedyrisk musikk: tittelvise, utforsking som får trommer og tempo når fiender jakter deg, sjefstema, seier og død. Alt syntetiseres, ingen lydfiler.
- Innstillinger for musikk, lydeffekter, grafikknivå og skjermristing (lagres i nettleseren).
- Bedre grafikk: bakt skygge i hjørner, våte sølepytter i kloakken, lyssjakter fra rister i taket, tåke og støv, kontur på anda, kontaktskygger, fargegradering, korn og vignett.
- Pynt: kloakkrør, dvergeruner, bannere, spindelvev, stearinlys og en trone med safransekker hos Rødpels.
- Effekter: fiender brenner bort i glør, etterbilder når du dukker, treffstjerner, blink ved Drake og Demon, iris-overganger, portal ved trappa, slow motion når sjefen faller.

## Kjøre spillet

[Spill i nettleseren](https://tombonator3000.github.io/DoD-Roguelite/). Trykk en tast på åpningsbildet, og velg «Ned i mørket» for å starte med Svart Nebb i Fristaden.

Åpne `dist/index.html` i en moderne nettleser (Chrome, Edge, Firefox). Det trengs nett for å hente three.js fra jsdelivr og skriftene fra Google Fonts. Ingen server trengs.

## Bygge

```
npm install
npm run build        # minifisert: dist/index.html og dist/artifact.html
npm run build:dev    # uten minifisering
```

`build.mjs` bundler `src/*.js` med esbuild (three holdes ekstern og lastes via importmap), og bygger inn `assets/duck.bin` og `assets/duck_tex.jpg` som base64.

GitHub Pages publiseres fra `main` etter at bygg, regresjonstester og nettlesertest har bestått. Nettlesertesten klikker startknappen, sjekker anda, tastatur og pause, og kjører fem nivåer fra samme undermappe som Pages. Den bruker lokale Three.js-filer; tilgjengeligheten til jsdelivr og Google Fonts testes ikke. Skjermbilder og `resultat.json` ligger i Actions-artefakten `pages-spilltest`.

## Kontroller

| Tast | Handling |
|---|---|
| WASD | Gå. Musa sikter. |
| Venstre klikk | Anfall (hold for kombo). Med avstandsvåpen skyter du. |
| Høyre klikk | Parera (hold inne). Ett våpen eller skjold parerer én gang per stridsrunde. |
| Mellomrom | Dukk unna (SMI-slag hvis et anfall treffer mens du dukker) |
| Q / Z | Kast et kastvåpen / bytt våpen (også musehjulet) |
| R / G / T | Besvärjelser (hold for høyere effektgrad), eller Bärsärkagång og Avväpna |
| F | Yrkesförmåga: Handpåläggning, Meditation, Riddarslag, Tjuvens tur, Bardens sång |
| H | Första hjälpen (stopper blødning) |
| V | Gjør klar en hjältepoäng: neste slag blir ett trinn bedre |
| Shift | Smyga. Bakfra mot en som ikke har sett deg: +7, og ingen parering |
| 1 | Legedrikk |
| E / X | Ta opp, åpne, snakk, gå ned trappa / ta på med en gang |
| Skriv + Enter | Spør om et ord i samtaler |
| I / C | Packning / rollformulär |
| Tab | Stort kart |
| M | Lyd av/på |
| Esc | Pause, lagre og laste |

På mobil vises en virtuell stikke og knapper. Angrep sikter automatisk på nærmeste fiende.

## Struktur

```
src/
  main.js       spill-løkke, kamera, lys, meny, rollpersoner, etasjer, søvn i trappa, medvetslös, butikk, byen inn og ut
  townmap.js    kartet over Fristaden (ren data)
  town.js       byen: hus, tak, vegger, elv, mur, inventar, kollisjon, sol og måne
  towntex.js    teksturer for byen
  townpeople.js folk i byen, samtaletekst, rykter, oppslagstavla
  townfolk.js   døgnrytme, tjenester, tyveri, oppdrag
  area.js       områdene utenfor byen: skog, vann, kuller med borg, telt, leirer, faner (arver Town)
  areagrid.js   maler rutenettet for et område fra layouten
  edelmap.js    de sju områdene i Edelfara og veiene mellom dem
  edelfolk.js   folk og samtaler i Edelfara
  arealife.js   livet i områdene: utganger, scener, allierte, storming, rapporten i Pharynx
  edelmodels.js orcher, svartalfer, ulver og Lekh
  ivan.js       oppdraget Triangeldrama i Edelfara: ledetråder, frist, journal
  travel.js     reisekartet
  talk.js       samtaler med nøkkelord
  dod.js        regeldata fra DoD 4.0, Expert og Gigant: raser, yrker, färdigheter, våpen, rustning, besvärjelser, tabeller
  body.js       kroppsdelene: KP per träffområde, blødning, lammelser
  rules.js      terninger, slag, rollformulär (buildSheet), Svart Nebb, tilfeldig rollperson
  creation.js   rollpersonsskaping i ti steg
  player.js     rollpersonen: bevegelse, våpen, forsvar, evner, magi, vila, animasjon
  kinmodels.js  modeller for släktene, våpen, hund og demon
  enemies.js    fiendetyper og AI, monsterangrep, sjefen Rødpels
  dungeon.js    generator, kollisjon, sikt, flytfelt, stier, geometri
  world.js      prosjektiler, loot, kister, gjemmesteder, runer, trapp, butikk, lys-pool
  title.js      3D-scenen bak tittelskjermen og rollpersonen på plattformen
  ui.js         HUD, evnelinje, logg, kart, tooltip, rollformulär
  fire.js       ild som instansiert shader
  water.js      vann med refleksjoner og ringer
  weather.js    vær, regn, lyn, løv, fugler og flaggermus
  wet.js        våte flater og vind i materialene
  loot.js       gjenstander, unike, gaver
  inventory.js  sekk, belte, vekt, salg
  invui.js      inventarskjermen
  icons.js      3D-ikoner for gjenstander
  itemmodels.js modeller av gjenstander
  save.js       lagring av løp
  saveui.js     lagre/laste-menyen
  combatfx.js   instansierte kampeffekter (ChatGPT)
  music.js      musikkmotor og sanger
  audio.js      prosedyrisk lyd
  post.js       tilt-shift, fargestemning, korn, vignett, blink
  gfx.js        prosedyriske teksturer, lyssjakt-shader, kontaktskygger
  decor.js      pynt per etasje, tåke og støvkorn
  assets.js     teksturer, shader-tillegg, modell-dekoding, primitive fiender
  input.js      tastatur, mus, berøring
  state.js      delt tilstand (G)
  page.html     HTML og CSS
assets/
  duck.bin      anda, 24 000 trekanter, eget binærformat
  duck_tex.jpg  tekstur 1024x1024
tools/
  decimate.py, pack_mesh.py, to_glb.py   modell-pipeline
  test/         testrigg (headless Chromium, simulering, stresstest, bot)
dist/
  index.html    ferdig spill, én fil
```

## Om reglene

Reglene følger Drakar och Demoner 4.0 (1991) med Expert og Gigant så langt det går i sanntid. En stridsrunde (SR) er 1,5 sekunder, initiativ er byttet ut med telegraferte angrep, og noen förmågor er tilpasset. Bøkene er oppsummert med sidetall i `docs/regler/`, og `docs/regler/IMPLEMENTERING.md` forklarer hvordan hver regel er oversatt. Det som ikke står i boka, er merket `uv`. Bakgrunnen fra Aidne er fra «Ereb Altor: Hjältar från Kopparhavet».

Se `memory.md` for tekniske beslutninger og hvordan reglene er tolket, `todo.md` for neste steg og `IDEER.md` for idébanken.
