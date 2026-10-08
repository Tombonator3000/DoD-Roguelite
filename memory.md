# Prosjektminne

Ting som er lurt å huske neste gang noen (menneske eller AI) jobber med prosjektet.

## Hva det er

- Roguelite dungeon crawler, Diablo/Hades-kamera og -kamp, Ultima-aktig dialog med nøkkelord.
- Regler fra Drakar och Demoner (Fria Ligan, 2023, også kjent som Dragonbane), tilpasset sanntid.
- Hovedperson: Svart Nebb, egentlig Nansen. Anka, tjuv og lönnmördare fra Fristaden i Zorakin (Ereb Altor). Kampstil: Kvakk-Fu (Slagsmål), lært av Mester Flansen. Skal føles brutal, ikke elegant.
- Fra 0.3 kan du også lage egen rollperson etter reglene. Svart Nebb er den ferdige rollpersonen.
- Far (herr Nansen) er butikkbetjent, ikke kjøpmann. Gjennomgangsvits. Spiller du en annen rollperson, er han den som har leid deg, og han har egne replikker (NANSEN i main.js).
- Historien: noen har stjålet safranlageret fra butikken. Sporet går gjennom Fristadens kloakker, ned i Karad Baturs dvergehaller og ender hos Rødpels, en rev med krone.
- Lore brukt: Fristaden var en handelspost for dvergene i Karad Batur før Zorakin tok den, Utu (gave-kilde), Tornvaktarorden (unik kappe), Aidne-bakgrunn fra "Ereb Altor: Hjältar från Kopparhavet".

## Kilder for reglene

- Google Drive har "ereb_altor_hjaltar_fran_kopparhavet.pdf" (id 1QKI2XwSbfsRLdwJL8mb4C5qZWWOO2e_F), men ikke grunnboka for DoD 2023. Teksten ligger uttrukket i /home/claude/rules/hjaltar.txt (forsvinner med sandkassen).
- Resten kommer fra nettet (oktober 2026): Free Leagues offisielle Foundry-modul via den italienske oversettelsen (github.com/LuckyFrico/dragonbane-translation-ita), Foundry-systemet pafvel/dragonbane, Roll20-arket (svenske navn), offisielle pregens, forumet til Fria Ligan. Ingen piratkopier.
- Verdier som ikke er sjekket mot boka er merket `uv: true` i src/dod.js. Har Tom boka, bør disse sjekkes: WP-kostnad og krav for de fleste hjälteförmågor, svenske navn på Anpasslig, Hal som en ål, Inre frid, Livvakt (Guardian), Sjöben, Skattjägare, intervallene i tabellen for svåra skador, STY-krav for tvåhandssvärd, skaden til stridsklubba og treudd, besvärjelsenes svenske navn (Eldklot, Vindstöt, Blixtsken, Långsteg, Lyfta, Snärjande rötter).
- Tom har pekt på https://kingafw.no/Drakar/index.html (oktober 2026): bibliotek med eldre utgaver (DoD 1.0 til 5.0, Expert, Chronopia), svensk tekst. Bra for lore og monstre (Ereb Altor, Monsterboken, Svartfolk, Tjuvar och lönnmördare, Kopparhavets Kapare), men ikke for tallene i 2023-reglene.
- Funn: Ill-Tempered heter Vresig på svensk (ikke Lättretad), Webbed Feet heter Simfötter.

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
- Lagring i localStorage med try/catch: meta (svartnebb.meta.v1), innstillinger (svartnebb.settings.v1), rollpersoner (svartnebb.chars.v1, maks 8), valgt rollperson (svartnebb.lastchar).

## Versjon 0.2: lyd, meny og grafikk

- Musikk (music.js) er ren WebAudio. Lutt med Karplus-Strong, forhåndsrendret per tone, tonehøyde med playbackRate. Bardens Tonkonst spiller noen lutt-toner via music.pluck.
- Sequenceren planlegger 140 ms fram. Utforskingssangen leser music.intensity (0 til 1) ut fra antall jagende fiender.
- Tittelen har egen THREE.Scene (title.js). RenderPass.scene byttes hver frame. Fra 0.3 viser plattformen den valgte rollpersonen (TitleScene.setCharacter).
- Rim/flash-shaderen (addRimFlash) kan dele uniforms mellom flere materialer (fjerde argument). Rollpersoner av primitiver bruker ett felles sett.
- dt i hovedløkka klemmes til [0, 0.05].

## Versjon 0.3: egen rollperson og DoD-regler

- Moduler: dod.js (all regeldata), rules.js (terninger, buildSheet, svartNebb, randomChoices), creation.js (skapingen), kinmodels.js (modeller), companion.js (hunden).
- Regeltermer står på svensk som i boka (färdigheter, tillstånd, förmågor). Resten av teksten er norsk.
- Rollformulär (sheet) er et rent JSON-objekt: kin, profession, age, school, rawAttrs, attrs (etter alder), trained, skills, kinAbilities, heroic, spells, tricks, gear { w, a, h, g }, silver, food, weakness, appearance, memento, aidne, choices (for å kunne endre senere).
- Hvert løp starter fra formulæret. Forbedringer i løpet forsvinner når løpet er over (roguelite). Bare dojo-oppgraderinger er permanente.
- Utstyr: vapen (hovedhånd), vapen2 (reserve eller skjold), rustning, hjalm, amulett. Ubevæpnet = Slagsmål T6.
- Tastene: LMB anfall, RMB parera (hold), Mellomrom undvika, Q kast, Z/hjul bytt våpen, R/G/T evner eller besvärjelser (hold for effektgrad 2 og 3), F släktesförmåga, Shift smyga, X pressa, V snabb vila, H kort vila, 1 legedrikk, E bruk.

## Regler slik de er implementert

- Slag: T20 lik eller under. 1 Drake, 20 Demon. Fördel/nackdel: to terninger, beste eller verste, nuller hverandre.
- Grundchans etter egenskap (1-5: 3, 6-8: 4, 9-12: 5, 13-15: 6, 16-18: 7). Tränad = dobbel. Sekundære (magi) finnes bare hvis tränad.
- Skadebonus fra STY eller SMI etter våpenets ferdighet (13-16 T4, 17+ T6). Armbrøst har ingen.
- Tillstånd: nackdel på egenskapen og ferdighetene som hører til. Varer til vila. Får du et du har, velges et annet. Alle seks: T6 VP, så T6 KP.
- Pressa slag: viktige slag (forsvar, smyga, magi, lås, gjemmesteder, runer, skräck, butikk) gir en boks med sakte film (tid x0.12) i 1,8 sekunder. Standardvalget er tillståndet som hører til slaget. Innstilling: Viktige, Alle, Aldri. Demon kan ikke presses.
- Forsvar: angrep som lander mens du dukker (0,3 s vindu) gir Undvika-slag. Holder du parera og angrepet kommer forfra, slår du våpenets ferdighet (skjold: beste STY-närstrid). Mot en fiendes Drake hjelper bare en Drake. Parera-Drake gir motanfall. Skade over brytvärdet gjør våpenet trasig (nackdel), unntatt stikkskade. Piler kan bare pareres med skjold. Monsterangrep kan bare pareres der det står (eller med Sköldblockad).
- Anfall treffer ett mål (Dubbelhugg: to). Tredje slag i komboen er tungt (fellende våpen slår overende), med kniv eller knyttneve er det et spark (Slagsmål).
- Smyganfall (fra Smyga, overraskede fiender eller Tjuvhugg): fördel, kan ikke forsvares, smidige våpen får en terning til, Lönnmördare +T8.
- Drake på anfall velges automatisk: ignorer rustning (stikk mot rustning 3+), ekstra anfall (hvis målet uansett dør og det står en til ved siden), ellers dobbel skadeterning.
- Demon på anfall: T6 på missödestabellen for närstrid eller avstånd.
- Fiender (NPC) parerer eller undviker av og til, og det koster dem tid. Monstre forsvarer seg mot 15 med "handlingskraft"-poeng.
- Vann: halv fart, nackdel på närstrid, ingen avstandsanfall. Simfötter og Sjöben fjerner det.
- Vila: snabb vila (V, T6 VP, én per nivå), kort vila (H eller i trappa, T6 KP, T6 VP, ett tillstånd, alv mediterer, minnessaken tar ett til én gang per nivå), lång vila hos butikkbetjenten (alt). VP kommer også sakte tilbake utenfor kamp (1 per 5 s), det er spillets eget.
- Dödsslag: FYS, Krasslig gir nackdel, kan ikke presses, Drake og Demon teller dobbelt. Tre lyktes gir T6 KP. Samla sig (PSY med nackdel) lar deg handle med 0 KP med dödsslag hvert 5. sekund. Skade på 0 KP er et misslyckat dödsslag. Omedelbar död hvis skade minus KP er minst maks KP. Svåra skador (valgfritt): FYS-slag etter fallet, ellers T20.
- Forbedring: Drake og Demon markerer. Sesjonsspørsmål i trappa (nytt sted, farlig fiende, hinder uten vold, svakhet) gir kryss du velger selv. T20 over verdien gir +1. Ferdighet som når 18 gir en hjälteförmåga. Etter nivå 2 og 4 kan du også få en.
- Skräck: Rødpels' vrål gir PSY-slag og T8 på skräcktabellen. Orädd står imot for 2 VP.
- Magi: effektgrad 1-3 koster 2/4/6 VP (Blixtsken dobbelt innendørs). Feil slag bruker VP likevel. Drake: dobbel effekt eller gratis. Demon: T20 magiskt missöde (dyreskikkelse er en rotte, 20 kaller på en demon). Metallrustning eller metallhjelm stopper magi. Kraft ur kroppen ved 0-1 VP.

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
- Rykte (G.run.rykte): tyveri -2, almisse, oppdrag, offer og god opptreden +1. Under -2 blir alt 25 % dyrere, fra 3 og opp 10 % billigere. På -3 nekter Jehanne å hjelpe.
- Tegnekall i byen er omtrent 300. Folk lengre unna enn 34 (manhattan) skjules, småbiter på rollpersonene kaster ikke skygge.

## Testing

- Testriggen ligger i tools/test. shot.mjs åpner siden i headless Chromium med SwiftShader og ruter three.js til lokal node_modules (stien THREE_DIR må peke riktig). NOANIM=1 slår av CSS-animasjoner (de står på 0 fordi hvert bilde tar over et sekund), LOWQ=1 setter lav grafikk og stille lyd, INIT="$(cat sim.js)" legger inn hjelpere, VW/VH/TOUCH for mobil.
- sim.js: window.sim(sekunder, fn) kjører spillogikken i faste steg uten rendering. placeNear(e, dist) setter spilleren i sikt av en fiende.
- stress.js: stress(yrke, sekunder per nivå) lager en tilfeldig rollperson og går gjennom alle fem nivåene med tilfeldige handlinger.
- bot.js: bot(sheetFn, sekunder, nivå) er en enkel spiller som går langs gangene til nærmeste fiende. Brukes til grov balanse. setTimeout virker ikke inne i sim, så dödsslag registreres bare som "nede".
- Musikknivåer kan måles ved å rendre sangene i en OfflineAudioContext.
- town.js (i tools/test): goto(tx, ty, sek) flytter spilleren og kameraet, setHour(h) stiller klokka og setter alle på plass, npc(id), talk(id), ask(ord), kws().
- townstress.js: townWander(sek) rusler tilfeldig, talkAll() snakker med alle og kjøper fra alle tjenester. day.js: dayTest(timer) kjører døgnet og melder hvem som står fast.
- stress.js starter nå i byen og tar kloakkluken ned.

## Gotchas

- Knapper beholder fokus etter klikk, og mellomrom kan da trykke dem igjen. Vi kaller blur() når et løp starter eller fortsetter.
- `[hidden]` må ha `display: none !important` fordi skjermene bruker `display: grid`.
- Punktstørrelse i partikkel-shaderen må skaleres med høyde og fov (FX.setScale) ved resize.
- Backspace og Escape i tittelen går tilbake, men ikke når du skriver i navnefeltet.
- SphereGeometry med delvis kule må lages med HEMI() i kinmodels.js. SPH() i assets.js ignorerer ekstra argumenter.
- Skjold i hånda til figurer med armer trenger rotation.x = 1.55, ellers ligger det flatt når albuen er bøyd.

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
