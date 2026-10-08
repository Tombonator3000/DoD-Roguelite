# Svart Nebb under Fristaden

En spillbar prototype av et roguelite i stil med Diablo og Hades, med litt Ultima i dialogen. Du spiller Svart Nebb (egentlig Nansen), anka fra Fristaden i Zorakin, eller lager din egen rollperson. Reglene under panseret er hentet fra Drakar och Demoner (2023) og tilpasset sanntid: T20 under ferdigheten, Drake og Demon, parera og undvika, pressa slag, tillstånd, hjälteförmågor, magi med effektgrad, vila og dödsslag.

Laget med three.js r170. Alt annet er skrevet for hånd: teksturer, musikk, lyd, fiendemodeller og effekter genereres i nettleseren. Den eneste eksterne ressursen er 3D-modellen av anda, som er pakket inn i HTML-fila.

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

## Nytt i 0.3

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
| Høyre klikk | Parera (hold inne) |
| Mellomrom | Undvika (dukk unna) |
| Q / Z | Kast et kastvåpen / bytt våpen (også musehjulet) |
| R / G / T | Hjälteförmågor, eller besvärjelser (hold for effektgrad 2 og 3) |
| F | Släktesförmåga |
| Shift | Smyga. Neste angrep blir et smyganfall |
| X, 1 til 6 | Pressa slaget når boksen dukker opp |
| V / H | Snabb vila / kort vila |
| 1 | Legedrikk (2T6 KP) |
| E | Ta opp, åpne, les, snakk, gå ned trappa eller kloakkluken |
| Skriv + Enter | Spør om et ord i samtaler |
| C | Rollformulär |
| Tab | Stort kart |
| M | Lyd av/på |
| Esc | Pause |

På mobil vises en virtuell stikke og knapper. Angrep sikter automatisk på nærmeste fiende.

## Struktur

```
src/
  main.js       spill-løkke, kamera, lys, meny, rollpersoner, etasjer, vila, dödsslag, pressa slag, butikk, byen inn og ut
  townmap.js    kartet over Fristaden (ren data)
  town.js       byen: hus, tak, vegger, elv, mur, inventar, kollisjon, sol og måne
  towntex.js    teksturer for byen
  townpeople.js folk i byen, samtaletekst, rykter, oppslagstavla
  townfolk.js   døgnrytme, tjenester, tyveri, oppdrag
  talk.js       samtaler med nøkkelord
  dod.js        regeldata fra Drakar och Demoner: ferdigheter, släkten, yrken, våpen, evner, magi, tabeller
  rules.js      terninger, slag, rollformulär (buildSheet), Svart Nebb, tilfeldig rollperson
  creation.js   rollpersonsskaping i åtte steg
  player.js     rollpersonen: bevegelse, våpen, forsvar, evner, magi, vila, animasjon
  kinmodels.js  modeller for släktene, våpen, hund og demon
  companion.js  jegerens hund
  enemies.js    fiendetyper og AI, monsterangrep, sjefen Rødpels
  dungeon.js    generator, kollisjon, sikt, flytfelt, stier, geometri
  world.js      prosjektiler, loot, kister, gjemmesteder, runer, trapp, butikk, lys-pool
  title.js      3D-scenen bak tittelskjermen og rollpersonen på plattformen
  ui.js         HUD, evnelinje, logg, kart, tooltip, rollformulär
  loot.js       gjenstander, unike, gaver
  music.js      musikkmotor og sanger
  audio.js      prosedyrisk lyd
  post.js       fargegradering, korn, vignett, blink
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

Reglene følger Drakar och Demoner (Fria Ligan, 2023) så langt det går i sanntid. Initiativkort og runder er byttet ut med telegraferte angrep og nedkjøling, og noen evner er tilpasset (de står forklart både som i boka og som i spillet). Verdier som ikke er sjekket mot grunnboka er merket `uv` i `src/dod.js`. Bakgrunnen fra Aidne er fra «Ereb Altor: Hjältar från Kopparhavet».

Se `memory.md` for tekniske beslutninger og hvordan reglene er tolket, `todo.md` for neste steg og `IDEER.md` for idébanken.
