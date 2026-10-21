# Gjenbruk fra prosjektbiblioteket og andre spill

## Oppdatert 21. oktober 2026: alle 172 spillprofiler

Tom ba om en ny gjennomgang av prosjektbiblioteket og spillene der. Jeg har vurdert alle **172 profiler i 17 sjangre** i [SPILL.md](https://github.com/Tombonator3000/prosjektbibliotek/blob/292a21fe703c83b0c5fc3d2a57982451da5b864a/SPILL.md), sammenholdt dem med Svart Nebb på `ce13d46` og undersøkt kodeutdrag og lisensfiler i **15 prosjekter** nærmere. DevilutionX og The Dark Mod fikk i tillegg kontroll av selve lisensdokumentet. Dette er statisk kildevurdering; ingen av disse spillene er bygget, kjørt eller integrasjonstestet hos oss i denne økta.

[Hele gjennomgangen som JSON](gjenbruk-spill.json) har én vurdering per profil, prioritet, begrunnelse, oppgitt lisensstatus, festede kilderevisjoner og hvilke filer som faktisk er undersøkt. GemRB og enkelte andre motorer forekommer under flere spillnavn. 172 profiler betyr derfor ikke 172 forskjellige motorer. Kildelisten er `bobeff/open-source-games` ved `3a9ab8f`; bibliotekets oversikt er fra 20. oktober.

Fordelingen er 10 profiler som er aktuelle nå, 34 for senere og 128 med lav relevans. Alle 17 undersøkte lisensfiler er kontrollert mot bibliotekets SHA-256. Merket kodekandidat betyr at en liten del kan undersøkes for tilpasning; kompatibilitet i spillet er ikke bevist.

**Anbefaling:** bygg først verdensminne, oppdragsdata og lokale reaksjoner i Arno/Gringul. Behold three.js r170, WebGL 2 og én HTML-fil. Det nyttige her er avgrensede systemer, ikke et motorbytte. For rask grafisk gevinst er Toms eksisterende `fadeFronts` og kvalitetstilpasning fortsatt nærmere vår teknologi enn de store motorene nedenfor.

Oppfølging i 0.9: verdensminne per rollperson, migrering av DoD91-lagringer, et felles oppdragsformat og havneavtalen med Ragna/Tova er implementert som egen kode. Trekronenes instanserte utskjæring er også rettet. Se [spillflyt og avgrensning](../README.md#nytt-i-09-verdensminne-og-havneavtalen). De øvrige kandidatene nedenfor er fortsatt en plan, ikke porter av motorene.

### Det som er mest nyttig hos oss

| Prioritet | Opphav og undersøkt kode | Konkret bruk i Svart Nebb | Vilkår og arbeid |
| --- | --- | --- | --- |
| 1 | [Daggerfall Unity: Quest.cs](https://github.com/Interkarma/daggerfall-unity/blob/b15ae9ed4ad5b1d14e75f1a0244c603bd700b854/Assets/Scripts/Game/Questing/Quest.cs) | Felles oppdragsressurser for person, sted og klokke, navngitte deloppgaver og lagret framdrift. Bruk dette til Edsbrytarna og oppdrag som kan vinnes, tapes eller avbrytes under lange reiser. | MIT for koden. C#/Unity må tilpasses JavaScript. Middels til stort; hent ikke originale Daggerfall-data. |
| 2 | [OpenNefia: QuestComponent.cs](https://github.com/OpenNefia/OpenNefia/blob/d8410b3e59845312d557c321d3752531519e14f6/OpenNefia.Content/Quests/QuestComponent.cs), [FactionSystem.cs](https://github.com/OpenNefia/OpenNefia/blob/d8410b3e59845312d557c321d3752531519e14f6/OpenNefia.Content/Factions/FactionSystem.cs) | Skill oppdragstilstand, frist, oppdragsgiver, opprinnelsessted og frø. Skill personlig forhold fra fraksjonens grunnforhold. En smugler i Arno kan hjelpe deg selv om vaktene misliker deg. | MIT for undersøkt kode. C# og en omfattende komponentmotor; ta små datamønstre, ikke hele arkitekturen. Middels til stort. |
| 3 | [Exult: schedule.cc](https://github.com/exult/exult/blob/31792fa4296c1c4ff40101eaa7f547bd4bc41736/schedule.cc) | Utvid døgnrytmen vi allerede har med faktiske gjøremål, avbrudd og reaksjoner når vei eller arbeidsplass er blokkert. Verksted, vertshus og havn bør ha egne handlinger. | GPL-2.0-or-later i filhodet. Bruk designet som referanse og skriv vår egen kode. Middels. |
| 4 | [Ultima VII: Revisited: GameSerializer.cpp](https://github.com/ViridianGames/U7Revisited/blob/38a96bc8076ed74706f49c82196f749587e5cb08/Source/GameSerializer.cpp), U7Object.cpp | Lagre klokke, skriptflagg og objektendringer i en samlet verdenstilstand. Se også hvordan interaksjoner og en redigerbar verden kan leve sammen i 3D. | Rotlisens BSD-2-Clause. Originale Ultima-filer kreves av motoren. NpcAnimation.cpp nevner Exult som opphav for en tabell; filvis opphav må avklares før eventuell kopiering. Her anbefales egen implementasjon. Stort. |
| 5 | [Endless Sky: ConditionSet.cpp](https://github.com/endless-sky/endless-sky/blob/e0334bf5634c502431271def8f3a74c2d88c6ed4/source/ConditionSet.cpp), [Mission.cpp](https://github.com/endless-sky/endless-sky/blob/e0334bf5634c502431271def8f3a74c2d88c6ed4/source/Mission.cpp) | Skill betingelser fra virkninger: tilby oppdrag hvis vilkår er oppfylt, og behandle ankomst, fullføring og fristbrudd én gang. Passer frakt, passasjerer og følger av sjøhendelser. | GPL-3.0-or-later i filhodene. Egen liten betingelsesmotor, ikke portering av deres kode eller kampanjetekst. Middels. |
| 6 | [Brogue CE: Architect.c](https://github.com/tmewett/BrogueCE/blob/104a20fedbe7d9360d2dfc8ff665571694212ad8/src/brogue/Architect.c), [Shattered Pixel Dungeon: LoopBuilder.java](https://github.com/00-Evan/shattered-pixel-dungeon/blob/57a4e06a4caf162446d1c28caa7983f0493fecf0/core/src/main/java/com/shatteredpixel/shatteredpixeldungeon/levels/builders/LoopBuilder.java) | Bedre plassering av rom, flaskehalser, valgfrie avstikkere og tematiske rom. Vi har allerede Prim-forbindelser og ekstra løkker i dungeon.js; gevinsten er meningsfulle rom og kontroll av framkommelighet. | AGPL-3.0 / GPL-3.0-or-later. Designreferanser, egen generatorutvidelse. Middels. |
| 7 | [Athena Crisis: applyConditions.tsx](https://github.com/nkzw-tech/athena-crisis/blob/1d7033db46ebf0e5435368673faf05764f66f256/apollo/lib/applyConditions.tsx), MapGenerator.tsx | Tydelig rekkefølge for handling, virkning og mål, med før-/ettertilstand som kan testes. Nyttig når et bevis både endrer et oppdrag, en NPC og journalen. | Koden er MIT, men grafikk, lyd og kampanje har egne vilkår. Mange interne avhengigheter; tilpass mønsteret uten React-motoren. Middels. |
| 8 | [Space Station 14: SharedInteractionSystem.cs](https://github.com/space-wizards/space-station-14/blob/6a9a8abe96f2c68646c73b3cd63d797e86842eba/Content.Shared/Interaction/SharedInteractionSystem.cs) | En felles sjekk av rekkevidde, fri vei, tilgang til beholder og hva spilleren holder, før interaksjonen skjer. Passer låste dører, nøkler, kister og å bruke en ting på en annen. | MIT for undersøkt kode. Ikke hent nettverksmotor eller innhold; lag et lite samspill-API rundt E og inventaret. Middels. |
| 9 | [Cataclysm: DDA: mapbuffer.cpp](https://github.com/CleverRaven/Cataclysm-DDA/blob/0723f9285fa0080dfe1876cc9c2845919252528c/src/mapbuffer.cpp) | Bare aktive områder simuleres fullt; endringer lagres og hentes ved retur. Bruk prinsippet når havner og byer skal huske åpne kister, folk og lokale hendelser. Ikke kjør hele Ereb Altor hvert bilde. | Prosjektets LICENSE.txt er CC BY-SA 3.0; ikke anta GPL. Her bare arkitekturreferanse. Stort hvis hele områdetilstanden innføres. |
| 10 | [.kkrieger: genbitmap.cpp](https://github.com/farbrausch/fr_public/blob/8c8f82c2ae01133370e649bbc05916e7aceecadd/werkkzeug3_kkrieger/genbitmap.cpp), genmesh.cpp | `Bitmap_Perlin`, `Bitmap_Cell`, `Bitmap_Bricks` og `Bitmap_Normals` viser hvordan små oppskrifter gir flere materialer. Aktuelt for mur, puss, tre og ruhet som supplement til våre malte materialer. | BSD med to vilkår i akkurat denne undermappen. Gammel C++ med x86-assembler og eget rammeverk. Avgrens til én ny oppskrift i reserve-/byggeverktøy; ikke port motor eller synth. Middels til stort. |

### Grafikk, animasjon og lyd

- **OpenLara**, [src/animation.h](https://github.com/XProger/OpenLara/blob/3b268ca4bf986c380f44a26ffd9218bf6d376249/src/animation.h), BSD-2-Clause: animasjonstilstander, overgangsvinduer og frame-hendelser er nyttige for treff og fotkontakt. Systemet leser Tomb Raider-format og er ikke en automatisk rigg til anda. Middels etter at modellen er rigget; originalanimasjoner og figurer følger ikke med lisensen.
- **Overgrowth**, [riggedobject.cpp](https://github.com/WolfireGames/overgrowth/blob/245fe4828631c84c0023d29d1525f5716ccb6106/Source/Objects/riggedobject.cpp), Apache-2.0: skjelett og IK-mål er en referanse for senere fotplassering, våpenfeste og reaksjoner. Stor, motorkoblet kode. Rigging av anda og enkle positurer kommer først. README sier uttrykkelig at grafikk og nivåer krever kjøpt spill og egen tillatelse til videredistribusjon.
- **Anarch**, [sounds.h](https://gitlab.com/drummyfish/anarch/-/blob/6f90562161200682459e772f1dacb747f23c5f95/sounds.h), CC0: seks bytebeat-formler og små 8 kHz-effekter viser svært kompakt lyd. Kan brukes til rare magiske gjenstander eller en bevisst grov lydprøve. De passer dårligere som hovedmusikk enn lutten vi allerede har. Forhåndsrendre og cache, og kontroller DC-offset, nivå og aliasing før bruk.
- **IsoCity**, [saveWorker.ts](https://github.com/amilich/isometric-city/blob/b774dd7913103e9dd9ec51b2151893c22683886e/src/lib/saveWorker.ts) og saveWorkerManager.ts, MIT: serialisering/komprimering utenfor hovedtråden kan hjelpe hvis store kampanjelagringer måles å hakke. Løsningen trenger `lz-string`, Next-bygg av worker og støtte i CSP; den passer ikke rett inn i vår ene HTML-fil. Senere, etter måling og formatvalg.
- **The Dark Mod** er den tydeligste designreferansen for vakter som hører noe, undersøker og gradvis blir mistenksomme. Profil og festet LICENSE.txt er lest; AI-koden er ikke undersøkt her. Programvare er GPLv3 med tillegg, mye innhold CC BY-NC-SA 3.0. Bruk egne tilstander og lyder ved en senere snikeutvidelse.

For oss er de nærmeste lydoppgavene nå **dør/knirk, havnemiljø og korte stemmer per släkt**. The Ninth Vigil er allerede brukt i PR #9 til fem underlag, romklang og taktbaserte overganger. Vi trenger ikke en ny lydmotor. Morbidiums CC0-foley og egne WebAudio-formanter fra den tidligere gjennomgangen er bedre første kandidater enn å hente hele lydsystemet fra et av de store spillene. Athena Crisis bruker Howler og lydfiler, ikke prosedyrisk syntese; det løser ikke et udekket behov hos oss nå.

På grafikksiden bør vi først gjøre spilleren synlig bak trekroner, kontrollere kvalitet og deretter variere lokal arkitektur/materialer. Prosedyriske detaljer må følge eksisterende takfading, dele materialer og ha fast frø. En ny PBR-/ruhetsoppskrift må holde materialbudsjettet; .kkriegers lille programfil er ikke et bevis for billig generering eller god mobil-FPS i vårt spill.

### Hva resten av katalogen gir

Alle radene er vurdert i JSON-fila. Tabellen under viser dekningen, ikke antall anbefalte porter.

| Gruppe | Profiler | Vurdering for dette spillet |
| --- | ---: | --- |
| Action | 1 | Hypersomnias nettverkskamp og redigerer er mindre nært dagens enspillerspill. |
| Bybygging | 8 | Små service-/vareflytmønstre kan brukes senere; IsoCity er undersøkt for lagring. Full bysimulering er for stor. |
| Eventyr | 6 | Endless Sky er prioritert. Dead Ascend for gjenstandsgåter, Pioneer for oppdrag/reise senere. ScummVM og dekompileringer er ikke innholdsbanker. |
| Førsteperson | 37 | .kkrieger, Anarch og The Dark Mod er skilt ut. De øvrige motorportene har liten gevinst for kameraet og teknologien vår. |
| Plattformspill | 13 | Jumpy/Punchy for kontroll/tilstander senere; resten krever mye ombygging og ofte originaldata. |
| Puslespill | 3 | Dead Ascend er under eventyr. Portal64, Whatajong og BlockOut II løser ikke et nåværende behov. |
| Racing og kjøresimulering | 12 | Lav prioritet; bil-/dekkfysikk og banemotorer hjelper lite med Ereb Altor. RVGLs kilde og lisens er uavklart. |
| Roguelike | 7 | Kartstruktur, gjenstandsinteraksjoner og lagring er relevante. NetHack/DCSS/Meritous er designreferanser; prioriter de undersøkte generator-/verdensprosjektene og OpenNefia. |
| Rollespill | 28 | Størst relevans for oppdrag, NPC-er og verdensminne. Flere profiler peker til samme GemRB-motor; kommersielle data er separate. |
| Sandkasse | 1 | Minosofts blokk-/nettverksmotor gir liten kortsiktig gevinst. |
| Sanntidsstrategi | 25 | Widelands/Unknown Horizons-lignende vareflyt kan inspirere handel senere. De store motorene og flerspillerløkkene er for omfattende nå. |
| Shoot 'em up | 2 | Taisei for lesbare prosjektilmønstre senere; SDL Sopwith har lav relevans. |
| Sport | 2 | Open Golf og Pooltool løser andre fysikk-/styringsbehov. |
| Tredjeperson | 8 | OpenLara og Overgrowth er undersøkt for animasjon. Andre porter er lite nært vår teknologi eller har uavklart opphav. |
| Turbasert strategi | 13 | Athena Crisis er undersøkt. Wesnoth for kampanjeforløp og OpenXcom for utstyr senere; ikke nye kampregler hos oss. |
| Tårnforsvar | 1 | Server Survival er webkode, men bølger og serverpedagogikk har lav relevans. |
| Økonomi og tycoon | 5 | OpenLoco, OpenTTD og CorsixTH kan inspirere ruter, vareflyt og oppgavekøer senere. Ingen ny økonomimotor nå. |

### Lisensfunn som endrer valgene

- **DevilutionX ved `0706e014` har Sustainable Use License 1.0.** Den begrenser bruk og distribusjon til angitte personlige/ikke-kommersielle formål. Dette er ikke en generell åpen kildekodelisens. Ingen kode eller data anbefales hentet derfra til vårt MIT-prosjekt.
- **RVGL og VVVVVV er ikke generelt frie kodekilder.** RVGLs konkrete kilde/lisens er ikke bekreftet i biblioteket; VVVVVV har egne bruksbegrensninger.
- **Dekompilering og motorporter frigir ikke originalspillet.** Det gjelder blant annet Nintendo-/Zelda-/Mario-prosjektene, Fallout CE, GemRB-spillene, Ultima og Tomb Raider. Et CC0-/MIT-/BSD-felt på et repo bekrefter ikke rettigheter til originalkode, musikk, kart eller figurer.
- **GPL/AGPL/CC BY-SA behandles som designreferanser i denne planen.** Å skrive om kode til JavaScript fjerner ikke lisensplikter. Direkte kodegjenbruk ville kreve en separat vurdering av fil og distribusjon; denne gjennomgangen endrer ikke prosjektets lisensvalg.
- **MIT/BSD/Apache gjelder undersøkte kodefiler med deres opphavsnotiser.** Kontroller også tredjepartsmapper og innhold. Athena Crisis er et konkret eksempel på MIT-kode med separat lisensiert spillinnhold.

### Anbefalt rekkefølge og krav til ferdig arbeid

1. **Verdensminne:** definer en versjonert kampanjetilstand ved siden av `G.run`, med faste ID-er for steder, personer, oppdrag og objektendringer. Ikke flytt alle gamle løpsdata over automatisk. Kontroller lagring/lasting, Fristaden–Arno–Fristaden, områdeskifte og uttrykkelig hva nederlag/nullstilling skal bevare. Ta hensyn til den delte localStorage-kvoten på GitHub Pages.
2. **Felles oppdragsformat:** bruk små tillatte betingelser og virkninger, uten `eval`. Knytt frister til den eksisterende spillklokka og reisetida. Prøv først ett lite oppdrag i Arno, med belønning som bare kan gis én gang, fristbrudd under reise og lasting før/etter innlevering. Deretter Edsbrytarna. DoD91-slag og tall kommer fortsatt fra egne regelmoduler og bøkene.
3. **Byfolk og reaksjoner:** egne folk, arbeidsplasser og interesser i Arno/Gringul. Minne om valg og vitner, og personlige forhold ved siden av lokalt rykte. Kontroller rutene gjennom døgnet og gjenbesøk etter lang reise før flere byer får samme løsning.
4. **Lesbar grafikk og meningsfulle rom:** trekroner viker for kameraet, lokale bygningsvarianter og noen nye romtyper. Kontroller tak/dører og framkommelighet for faste frø; mål tegnekall og bildefrekvens på vanlig maskin. Rigging kommer før OpenLara-/Overgrowth-inspirert animasjon.
5. **Lyd som fyller hull:** dør/knirk, havn og stemmer i dagens WebAudio-system. Test brukeraktivering, pause/mute, maks antall stemmer, nivå og opprydding. Anarch er en valgfri effektprøve, ikke erstatning for musikken.

Ingen nye spillfunksjoner eller tredjepartsfiler er integrert i denne gjennomgangen. Konkrete kildeutdrag ligger bare i arbeidsmappens undersøkelse, ikke i spillet. Bibliotekets åpne PR #4 om natteskift er lest som bakgrunn og gjelder en annen arbeidsflyt; den er ikke startet eller flettet her.

## Tidligere gjennomgang: 9. oktober 2026

Gjennomgang 9. oktober 2026, bestilt av Tom: hva i prosjektbiblioteket og de andre spillrepoene kan gjøre grafikk, gameplay, lyd, musikk og brukerflate bedre i Svart Nebb, og hvordan vi slipper å finne de samme løsningene på nytt i hvert spill.

Tre av repoene er private. Dette repoet er offentlig, så de heter privat repo A, B og C her. Tom vet hvilke det er.

Det følgende er historikken fra 9. oktober. Prioriteter og status nedenfor gjelder den datoen, med mindre en nyere oppdatering over sier noe annet. Blant annet er fotsteg/romklang/takt senere løst i PR #9, værbasert reisetid i PR #8, og prosjektbiblioteket har nå både egne løsningskort og 172 spillprofiler. Den opprinnelige gjennomgangen brukte fem hjelpeagenter til lesing; gjennomgangen 21. oktober er gjort av ChatGPT uten nye hjelpeagenter.

## WebGL eller WebGPU?

Vi bruker **WebGL 2** gjennom `THREE.WebGLRenderer` i three.js r170. Ingen av spillrepoene til Tom bruker WebGPU. Morbidium og privat repo A står på r128, Mythos på r180, Loincloth Legends på r186, og alle bruker WebGL. De eneste WebGPU-prosjektene i prosjektbiblioteket er referansene for kystvann (r185 og r186 uten WebGL-reserve).

Det er ingen grunn til å bytte nå:

- Det som skiller oss fra Weatherglass og de andre, er teknikk, ikke API. Alt i lista under virker i WebGL 2.
- WebGPURenderer krever three r171 eller nyere. Det betyr ny importmap, og alle shaderne våre som bruker onBeforeCompile (wet.js, cutaway, sway, fire, vann, vær) må skrives om til TSL.
- Testriggen kjører på SwiftShader i headless Chromium, og den støtter WebGL 2 godt.

WebGPU lønner seg først hvis vi vil ha compute på skjermkortet, som partikler i hundretusenvis eller væskesimulering.

## Det viktigste, i rekkefølge

| # | Hva | Fra | Hvorfor hos oss | Kost | Lisens |
| --- | --- | --- | --- | --- | --- |
| 1 | Fotsteg, dører, gulvknirk, regn, vind, natt, bål og sverdklang som lydfiler | Morbidium `assets/lyd/` (167 filer, 1,9 MB), Loincloth `public/assets/sound/` | Dekker todo-punktene om fotsteg, dører og planker med en gang. 40 lyder er omtrent 0,5 MB i base64 | Lett: base64 gjennom build.mjs, decodeAudioData | CC0, kreditert i `assets/lyd/KILDER.md` |
| 2 | Skriftene bygget inn med FontFace | SIGNAL-47 `web/src/core/fonts.ts` | page.html henter skriftene fra Google Fonts. Offline og i file:// faller de tilbake til systemskrift. Grenze Gotisch, Alegreya og Alegreya Sans SC er OFL, rundt 200 til 400 KB | Lett | OFL |
| 3 | Skjermeffekter: sjokkbølge, zoom-punch, rød kant ved lav KP, varmeflimmer | Loincloth `src/gfx/screenfx.ts` og `src/gfx/post.ts` (linje 410 til 475), opprinnelig fra Morbidium `04_render.js` | Drake, Demon, dödsslag og Rødpels får mer tyngde. Uniformene passer rett inn i GradePass | Lett til middels | Toms egen kode |
| 4 | Angrepspoletter og en tempostyrer | Loincloth `src/game/director.ts`, `src/data/difficulty.ts`, `requestToken` i `stage.ts` | Høyst 2 fiender angriper samtidig. Vanskelighetsgraden endrer bare oppladningen og pausene, ikke KP eller skade, så DoD-tallene står urørt | Middels, omtrent 70 linjer | Toms egen kode |
| 5 | Kroner og hus som blir gjennomsiktige mellom kamera og spiller | Loincloth `fadeFronts` i `src/gfx/env/common.ts` (linje 305) | Løser todo-punktet om at trærne i Ekeskogen skjuler spilleren | Lett | Toms egen kode |
| 6 | Håndtering av tapt WebGL-kontekst, og test for lekkasjer i skjermkortminnet | Morbidium `04_render.js` (`mistet`, `hentet`), `tools/testdeler/grafikk.py` | Vi har ingen handler. Verdenskartet bygger et nytt område for hvert møte, så lekkasjer hoper seg opp | Lett | Toms egen kode |
| 7 | Automatisk kvalitet og pikselbudsjett | Loincloth `src/app/perf.ts` (QualityGovernor), SIGNAL-47 `adapt()` i `web/src/main.ts` | Todo-punktet «adaptiv DPR» er rundt 10 til 70 linjer. Hold DPR under et pikselbudsjett, så 4K-skjermer ikke drukner | Lett | Toms egen kode |
| 8 | alphaToCoverage på gresstuster og faner | Voidcraft `docs/developer/ADVANCED_GRAPHICS.md` | Kantene på `MAT.tuft` og fanene hakker. Med MSAA fra 0.7 er det ett flagg per materiale | Svært lett | Bare ideen (Voidcraft er AGPL) |
| 9 | Gress som legger seg når anda går gjennom, og én maske for jord og gress | cortiz2894/stylized-components (via prosjektbiblioteket og Voidcraft) | Bryter opp flisene og gir liv i gresset. Passer inn i `addSway` i wet.js | Middels | MIT, krediter |
| 10 | Testing under artifact-CSP | SIGNAL-47 `web/tools/csptest.py` | Vi leverer `dist/artifact.html`, men tester den aldri med sandkassens regler | Lett | Toms egen kode |

## Grafikk

- **Vann.**
  - Dybde og skumkant uten dybdetekstur, med en maske per flis. Privat repo A `index.html` (rundt linje 2420), absorpsjon `vec3(0.36, 0.075, 0.085)`. Privat repo B `CoastalWater.shader`: `deepness = 1 - exp(-depth * 0.32)` og skumblonder fra Worley-støy.
  - Ringene får en svakere krone nr. to (Voidcraft: radius minus 0,23, styrke 0,32).
  - Kjølvann i V bak anda (privat repo A linje 4641 til 4655), og NRIP fra 8 til 16 eller 32.
  - Alt er lett, og vannet vårt har ingenting av dette i dag.
- **Høydetåke** som formel i `fog_fragment`: `a * e^(-b * h0) * (1 - e^(-b * ry * d)) / (b * ry)` med b = 0,075 (privat repo A `heightFog`). Gir den lave morgentåka over elva fra todo-lista. Lett til middels.
- **Varmeflimmer over smia** uten tekstur, ren sinusforskyvning inne i en ellipse i GradePass (Voidcraft `HeatHaze.shader`, Guild Life `HeatShimmer.tsx`). Lett.
- **Skyskygger bare på direkte lys**, projisert langs lyset: `p = wp.xz + L.xz / max(L.y, 0.18) * (160 - wp.y)` (privat repo A). Våre ganger hele `outgoingLight` i wet.js, også fyllyset. Lett.
- **Falske lamper i shaderen**: opptil N lamper som uniformlister lagt til emissive, uten nye shaderkompileringer (SIGNAL-47 `world/kit.ts` `floodlit()`). Kan gi alle fakler og vinduer lys om natta, ikke bare de sju i lys-poolen. Middels.
- **Skygger fra sola som retningslys** med cascades og snapping til texler: `threejs-shadow-systems` i scottstts/Threejs-Awesome-Graphics-Agent-Skills (MIT). Sjekk at eksemplene ikke er TSL. Middels.
- **Glitter i sola og mot flimring**: Beckmann-lobe og fasetter som tones ut etter fotavtrykket (`saturate(1.5 - footprint * 7)`). Bytt `fract(sin())` med Hoskins' hash, som ikke bander på mobil (privat repo B). Lett.
- **Klær og kropper**: ring-loft for kapper og kjortler med folder, slitasje bakt i vertexfarger, én tegning per figur (Mythos `app/mythos/miniatures.ts`, klassen `Sculpt`). Passer kinmodels.js. Lett til middels.
- **Blod og regn på linsen** (Loincloth `src/gfx/screenwet.ts`). Middels.
- **Telegrafer i én instansgeometri** med SDF-former og etterbilde (Morbidium `46_blekk.js`). Vi lager og kaster en geometri per angrep i fx.js, og Morbidium fant at det får shaderen til å lenke på nytt. Middels.

## Animasjon av anda

Ingen av repoene har et 3D-skjelett med Mixamo eller AnimationMixer. To biter kan settes sammen:

- **Rigging uten Blender.** Privat repo B `tools/prepare_models.py` (`rig_human`) og `polish_character_seams.py`:
  - vekter etter område fra de to nærmeste beina, med 1/d⁴;
  - KD-tre som sveiser hjørner som ligger oppå hverandre ("AI-modeller har løse UV-øyer");
  - åtte runder utjevning av vektene.
  - Kan gjøres i numpy i `tools/pack_mesh.py`, med skinIndex og skinWeight i duck.bin (rundt 80 til 160 KB).
- **Kurvene for anda** fra privat repo A `animDuck` (linje 4682 til 4750):
  - gange: kroppsrull `sin(ph) * 0.16`;
  - nikk: `0.12 + sin(2 * ph) * 0.14`;
  - hakk: utfall ganger 1,05 med vingeslag;
  - landing: sammentrykk i 0,22 s.
- **Dataformen for angrep**: Loincloth lagrer oppladning og slag som par av positurer (`src/game/attacks.ts`).

## Gameplay

- **Angrepspoletter og tempo**, se rad 4 over. Spenningen stiger med skaden du tar (andel ganger 2,5) og med 0,06 per drap. Ved 0,85 kommer en topp i 4 s, så 7 s pusterom med én polett mindre.
- **Etterforskning og journal** (SIGNAL-47 `web/SPILLDESIGN.md`, «Bevisbordet»):
  - hint i tre trinn: spørsmålet, retningen, neste trekk;
  - svaret selv forblir låst, og hintene skrives aldri inn i journalen;
  - fellene å unngå: pikseljakt, prøv-alle-par, uleselig på mobil.
  - Passer Triangeldrama, Ulfmar og todo-punktet om nøkkelord som låses opp av det du har sett.
- **Valg som NPC-er husker**: et valg i et oppdrag endrer hilsenen og gir en tjeneste én gang (Guild Life `data/npcMemories.ts`). `sanitizeQuestChoices()` kaster ukjente valg ved lasting.
- **Været i tall** (Guild Life `data/weather.ts`): `movementCostExtra`, `priceMultiplier` og `robberyMultiplier`. Passer Bok II-regelen om dårlig vær (−25 % og −50 % på reisen) og verdenskartet.
- **Tak på hendelser**: én tilfeldig hendelse per tur og 5 % sjanse per sjekk (Guild Life). Nyttig når vi spilltester om det er for mange møter.
- **«Denne uka»-råd**: en ren funksjon av tilstanden gir høyst 3 tips, de viktigste først (Guild Life `data/thisWeek.ts`). Kan si fra om sult, proviant og sju-dagersfristen. Lett.
- **Balanse med frø**: kjør N spill med Mulberry32, og spill det første frøet om igjen for å se at det blir likt (Guild Life `scripts/balance/`). Egen RNG for effekter, så de aldri bruker spillets tall. Krever at alle terninger i rules.js tar et frø først. Tungt.

## Lyd og stemmer

- **Lydfilene** fra Morbidium og Loincloth, se rad 1. Mønstrene fra Morbidium `src/42_lyd.js`:
  - dekod etter første tastetrykk, fire av gangen;
  - aldri samme variant to ganger på rad, høyst fem like lyder per 80 ms;
  - syntetisk lyd under som reserve;
  - fotsteg hver 1,45 flis, valgt etter underlaget.
- **Syntetisert foley uten filer**, hvis vi vil spare plass:
  - Fotsteg: tre på 95, 171 og 283 Hz, stein på 380, 720 og 1170 Hz (Mythos `scripts/build-audio.py`).
  - Dør: FM-knirk på 180, 390 og 810 Hz med låseklikk.
  - Privat repo A `MAT_SND` har en tabell per underlag.
- **Stemmer per släkt.** Morbidium `Sound.stemme` (`src/39_kombo.js`) er rundt 20 linjer. Sagtann går gjennom to formantfiltre per vokal, med æ, ø og å. Ordet deles i stavelser, og siste stavelse faller.
  - Med en grunntone per släkt og Voidcrafts tabell over tilstander (inaktiv, varsel, angrep, skadet, død, hilse, handel) får vi «egne stemmer for hver släkt» og byfolk som mumler som i Ultima VII.
- **Stemningsmotor** (SIGNAL-47 `core/ambience.ts`):
  - sirisser med egen tonehøyde og takt, som synger saktere når natta blir kald;
  - sjeldne ting langt unna, som ugle og hund;
  - én utebuss med lavpass på 700 Hz og styrke 0,3 inne.
  - Passer Fristaden, kloakken og været. Middels.
- **Trolldom fra 3044** `SoundSystem.js`:
  - Opplading: sagtann 80 til 400 Hz og sinus 200 til 2000 Hz over 0,75 s. Passer besvärjelser du holder inne.
  - Utløsning: dunk fra 60 til 20 Hz.
  - Lyn: sagtann 2500 til 400 Hz med støy gjennom høypass.
- **Fare-tilstand**: puls i vignetten, hjerteslag og lavpass på musikken når KP er lav. Grensen er `500 + (1 - fare) * 1500` Hz (3044). Lavpasset må sitte på en egen musikkbuss, ellers dempes lydeffektene også (Voidcraft).

## Musikk

- **Dirigent i takt**: `queue(sang, 'bar' | 'beat')`. Siste slag før skiftet er en bro på dominanten i den nye tonearten, og lag kommer inn på slaget og går ut på taktstreken (Loincloth `src/core/conductor.ts`, testet i `tools/tests/imuse.mjs`).
- Musikken trekker seg tilbake etter 20 s uten kamp, og dukker under store treff (Morbidium `06_musikk.js`). I dag krysstoner vi over 2,2 s og har bare intensitet. Middels.
- **Kontekst etter prioritet**: avslutning, kamp, inne, hule, landskap. Musikken skal aldri spille samme spor to ganger på rad, og kamp gjelder 14 s etter at du tok skade (Voidcraft `ClientMusic.cs`, bare ideen).
- **Instrumenter**: VCSL-samplene (CC0) med harpe, psalter, orgel, cembalo og klokker kan gi tempelet og vertshuset mer klang (Morbidium).
- **Ikke**: Scott Buckley-sporene i SIGNAL-47 er 2 til 3 MB hver, og YuE gir statisk lyd, krever 24 GB VRAM og har NC-vekter. Behold den prosedyriske musikken.

## Brukerflate og tilgjengelighet

- **Egne innstillinger** for blink, forvrengning (sjokkbølge, zoom, varmeflimmer), risting som glidebryter fra 0 til 1, og skala på brukerflaten (Loincloth, Morbidium `--ui`). Privat repo B har «færre blink» på som standard.
- **`prefers-reduced-motion` i JS**, ikke bare i CSS: uten blink, risting og hitstop (privat repo A, Guild Life `effectPolicy.ts`). Vi gjør det bare i CSS i dag.
- **Gjenstander som flyr** inn i beltet eller sekken med «+1», og paneler som toner inn på 0,14 s (Voidcraft WP-5 til 7, bare ideen).
- **Paneler som spretter opp av seg selv** skal ignorere tastene i 350 ms (Loincloth), så et Enter som var ment for noe annet ikke trykker på dem.
- **Gamepad**: standard mapping med vibrasjon ved treff, og menynavigasjon til nærmeste knapp i retningen til stikka (Loincloth `src/core/input.ts`, Morbidium `MenyNav`). Står på todo-lista.
- **Lagringen**:
  - eksporter og importer som JSON-fil (Mythos `Lobby.tsx`);
  - tre roterende autolagringer (SIGNAL-47);
  - migreringer fra versjon til versjon i stedet for å avvise gamle lagringer (Guild Life `data/saveLoad.ts`).
- **Tale**: Web Speech API kan lese replikker høyt med norske stemmer, uten filer (Guild Life `audio/speechNarrator.ts`, med løsninger for nettleserfeilene). Lav prioritet.

## Testing og verktøy

- **Spilltestmodus** bak `?testmodus` (Morbidium `src/44_testmodus.js`):
  - fps, laveste fps og minne;
  - skade per kilde og sekunder under 30 fps;
  - knapper for «si din mening»;
  - en ren tekstrapport på norsk som Tom limer inn til Claude.
  - Passer alle todo-punktene om test på ekte mobil.
- **Ytelsesmåling med faste faser** (Voidcraft `PerfProbe.cs`, privat repo B): oppvarming, så 120 s måling, p95 på 16,67 ms eller mindre, p99 under 20 ms, og antall bilder over 50 ms. SwiftShader-tall er UNVERIFIED for ekte fps.
- **Piksler i stedet for bilder** (vector-war-games `scripts/globe-rendering-smoke.mjs`): les piksler rett etter `composer.render()` og sjekk forhold, for eksempel at lamper om natta gløder og hvite vegger midt på dagen ikke gjør det. Hver pikseltest trenger en negativ kontroll (Loincloth `particles.mjs`).
- **Nåbarhet**: et bredde-først-søk over rutenettet til hver NPC og tjeneste, til hver time i timeplanen (SIGNAL-47 `tools/reachcheck.py`). `goto()` teleporterer og skjuler slike feil.
- **Mobiloppsett**: ingen side som renner over, og trykkflater på minst 44 px ved 844 x 390 (Guild Life `e2e/device-accessibility.spec.ts`).
- **Lydnivå**: K-vektet og «mobil» lydstyrke målt i OfflineAudioContext (Loincloth `mix.mjs`).
- **Rene moduler under node --test**: rules.js, dod.js, townmap.js og worldtravel.js kan testes uten nettleser (privat repo A `tests/integration.test.cjs`).
- **Logg og minne holdes korte** (Morbidium `tools/rydd_dokumenter.py`): log.md under 20 KB og eldre oppføringer i `logg/ÅÅÅÅ-MM.md`. memory.md får varsel over 8 KB. Vår log.md er 52 KB og memory.md 35 KB.

## Fallgruver de andre har betalt for

- Alle Pages-spillene til Tom deler opphavet `tombonator3000.github.io`, og dermed localStorage-kvoten. Miniatyrbildene i lagringene våre konkurrerer med SIGNAL-47, Guild Life og resten.
- InstancedMesh: `setColorAt` mens `count` er 0 gjør alle instansene svarte. Lag fargebufferen for full kapasitet.
- `Math.pow(negativt, 1.3)` gir NaN, som blir en hvit klatt i bloom. Klem først.
- `smoothstep(a, b, x)` krever a < b. Skriv `1.0 - smoothstep(a, b, x)` for motsatt vei.
- GLSL ES 3.0 reserverer `patch`, `sample`, `filter`, `input` og `output`.
- Under hitstop er dt 0, så sjekker av bakken må hoppe over dt = 0.
- SwiftShader regner dybden feil på én stor bakkeflate som går bak kameraet. Del den i celler på høyst 20 x 10.
- Legg til og ta bort lys gjør at alle shaderne bygges på nytt. Behold lysene og demp dem.
- Raycast treffer usynlige ting. Flytt dem til `layers.set(31)`.
- `localStorage.setItem(k, undefined)` lagrer strengen "undefined" (Guild Life BUG-015).
- `pointer: coarse` er usann på Samsung-telefoner med S Pen.
- MP3 har koderforsinkelse. Legg 0,15 s på loopene og mål stillheten foran hver fil.
- Lagrer man frø for testing, må det skje etter oppstart: three.js bruker Math.random til UUID-er.

## Ikke ta med

- **Voidcraft** er en AGPL-fork. Ideer og tall er greit, men ingen kode inn i vårt MIT-repo. Grasset og vannet der bygger på cortiz2894/stylized-components, som er MIT og kan brukes med kreditering.
- **Luanti-atlaset** i privat repo B er CC BY-SA 3.0.
- **MP3-ene** i privat repo A (4,8 MB) og muzak i privat repo B har ukjente rettigheter.
- **Kodeeksempelet `wet-puddle-rain`** i scottstts-pakken har GPL-materiale.
- **Spill-reimplementasjonene** i bobeff/open-source-games (Exult, Fallout CE, DevilutionX) kan studeres for mekanikk, men koden skal ikke kopieres.
- **Privat repo C** er en tom Unity-mal. Det er ingenting å hente der ennå.

## Kunnskap på tvers av spillene

Problemet: løsningene ligger spredt i hvert repo sitt memory.md, i docs og i loggene. Agentene finner dem ikke når de jobber i et annet spill. SwiftShader-fellene og loggfil-tipset er for eksempel lært to ganger, både her og i Loincloth.

Det som finnes:

- **prosjektbiblioteket** er godt på opphav: festede commits, kontrollsummer, PASS og UNVERIFIED, og søk med `scripts/find.py` uten nett. Men det katalogiserer andres repoer, ikke Toms egne løste problemer. Svart Nebb er ikke med ennå, og `find.py` søker ikke i forbehold eller dokumenter.
- **Loincloth `docs/GJENBRUK.md`** og denne fila er gjenbruksrevisjoner per prosjekt.
- **Skills** i `.claude/skills/` (Loincloth, Guild Life) og `Automation/Skills/` (SIGNAL-47, gauntlet-loop) har `agents/openai.yaml`, så Claude og ChatGPT/Codex leser de samme.

Steg 1 og 3 er gjort 9. oktober: løsningskortene ligger i prosjektbiblioteket (PR #1 der, `LOSNINGER.md`), med 15 kort fra Svart Nebb. Skillen `spill-gjenbruk` er steg 2.

Forslaget var tre steg:

1. **Løsningskort i prosjektbiblioteket**: `losninger/<domene>/<slug>.md` (grafikk, lyd, testing, ui, bygg, regler). `data/losninger.json` holder metadataene, og `find.py` søker i kortene. Hvert kort har:
   - symptomet slik man ville søkt etter det, også feilteksten;
   - konteksten (stack og versjon, for eksempel «three r170 WebGL2, EffectComposer»);
   - årsaken, løsningen med en liten kodebit og fellene;
   - hvordan det verifiseres, og status som PASS, FAIL eller UNVERIFIED med bevis;
   - opphav (repo, commit, fil og linje), lisens og «brukt i».

   Repoet er offentlig, så bare offentlige repoer kan få kort der.
2. **En felles skill** som hver agent bruker når den starter på et spill eller står fast. Den søker i løsningskortene og i GJENBRUK-filene før den finner opp noe selv, og skriver et kort når et problem er løst. Gauntlet-skillen Tom la ved 9. oktober kan stå ved siden av, for verifikasjonen.
3. **De første kortene** hentes fra memory.md her:
   - MSAA i komposeren i r170;
   - krokene i `lights_fragment_begin`;
   - uniformlister som må settes før første render;
   - onBeforeCompile i kjede med customProgramCacheKey;
   - vertexColors uten fargeattributt blir svart;
   - én HTML-fil med base64 og budsjett;
   - testriggen med SwiftShader og skriftene;
   - `[hidden]` med grid-skjermer;
   - Dialog.md-protokollen.

## Kilder

Repoene er lest på disse commitene:

| Repo | Commit |
| --- | --- |
| prosjektbibliotek | 813c1da |
| morbidium | 729219c |
| Loincloth-Legends | 60bc0d1 |
| privat repo A | 3fa2ed2 |
| Mythos-Quest-3D | 8c63eab |
| privat repo B | ede0aa2 |
| SIGNAL-47 | 925d613 |
| privat repo C | 0b01a00 |
| guild-life-adventures | 1fa0671 |
| vector-war-games | 83ba112 |
| 3044 | b552cff |
| Voidcraft | 2023500 |

Lisensene er slik repoene selv oppgir dem. Sjekk lisensfila og KILDER.md for hver fil før noe flyttes inn.
