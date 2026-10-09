# Todo

Sortert etter hva som gir mest spill for minst jobb.

## Hvem jobber med hva

Skriv navnet ditt og grenen bak oppgaven før du begynner, og fjern linja når pull requesten er inne. Se AGENTS.md.

- Claude (`claude/verdenskart`, PR #7): verdenskart over Aidne og grafikkfiksene etter Weatherglass. Klar til gjennomgang. Nye filer worldmap.js, worldtravel.js, worldview.js, areatemplates.js, envlight.js, treegeo.js. Endrer main.js, travel.js, edelmap.js, arealife.js, inventory.js, invui.js, townfolk.js, townpeople.js, save.js, ui.js, area.js, town.js, page.html, player.js.

## Nå

- [x] Inventar med sekk, belte, 3D-ikoner og dra og slipp (0.5)
- [x] Lagre og laste med autolagring og tre plasser (0.5)
- [x] DoD91-regler (4.0) med Expert og Gigant: sju grundegenskaper, FV per ferdighet, träffområden med egne KP og rustning, parering per SR, magi med PSY, yrker og raser fra Bok I, Skräcktabellen, stridsmoral, fummeltabeller, EP og hjältepoäng (0.5). Lagrede spill fra 2023-reglene kan ikke lastes.
- [x] Ild i ett tegnekall, vann med refleksjoner og ringer, regn og lyn, våte flater og pytter, vind i gress og trær, løv, fugler, flaggermus, sporer, glør, damp, røkelse, tilt-shift og fargestemning (0.5)
- [x] Edelfara utenfor Nordporten: reisekart med tid, sju områder (Ekeskogen, Sortmund, Ridderskors borg, Akershus, Akershus borg, Glimming, Lekhs leir) og hele eventyret Triangeldrama i Edelfara med tre mistenkte, ledetråder, villspor, frist på sju dager, allierte, Lekh på ulven og fire slutter i Pharynx (0.6)
- [x] Verdenskart over Aidne og Drakdjupet i Fallout-stil (0.7): tåke, steder du kjenner eller finner, reise rute for rute, møter med Upptäcka fara og Smyga, Orientering, landsbyer, fire skjulte steder, proviant og sult, lagring på kartet. Se docs/verdenskart.md.
- [ ] Spilltest verdenskartet: er møtene for mange eller for få? Er 23 timer fra Fristaden til Edelfara for langt? Blir sulten et mas eller en fin grunn til å handle?
- [ ] Verdenskartet: flere landsbyer med egne folk og oppdrag (nå er alle landsbyer fra samme mal), Pendon og Ekeborg som egne byer, skip fra Fristaden og Ardesch.
- [ ] Verdenskartet: Rida og hester som halverer tida, og at været på kartet gjør reisen tregere (Bok II s. 5: dårlig vær -25 %, elendig -50 %).
- [ ] Packningen fra verdenskartet: å slippe en ting der legger den i området bak kartet, så den blir borte. Sperr slipp når kartet er oppe.
- [ ] Spilltest Edelfara: holder sju dager, eller er det for romslig? Er leiren for hard alene og for lett med grevens soldater? Finner folk fram til Ulfmar og bevisene uten journalen?
- [ ] Rida: hester i Sortmund og Akershus som korter ned reisetida på kartet, med et Rida-slag.
- [ ] Pharynx som eget område med hertigens vaktkaptein, i stedet for bare en rapport.
- [ ] Resten av Ivanhoe-boksen (Medeltidsregler og Aidne) er ikke brukt. Se om noe passer, for eksempel turnering i Sortmund.
- [x] Malte teksturer og grafikk fra D007: 22 materialpar, reisekart, pergament og fire faner. ChatGPT, flettet i PR #5, se docs/teksturer.md.
- [x] Menyer og brukerflate (0.6): ny pausemeny med journal og taster, innstillinger i spillet, tekststørrelse og tilt-shift av og på, tallvalg i samtaler, mobilrettelser. Flettet i PR #6, se docs/menyer.md.
- [ ] Spilltest menyene på ekte mobil: er knappene i pausemenyen store nok, og er tekststørrelsen Størst for mye i loggen?
- [ ] Pilnavigering (opp og ned) i pausemenyen som i tittelen.
- [ ] Spilltest grafikken på ekte maskin og mobil: er regnet for tett, tilt-shift for sterk, natta for mørk i uvær?
- [x] Grafikk etter Weatherglass, raske ting (0.7): MSAA i komposeren, bloom etter sted og tid, miljøkart fra himmelen, eksponering etter døgnet, myke trekroner. Se docs/grafikk-weatherglass.md.
- [ ] Trær nær kameraet skjuler spilleren i Ekeskogen. La kronene mellom kameraet og spilleren bli gjennomsiktige, som takene i byen. Mal: fadeFronts i Loincloth Legends (docs/gjenbruk.md).
- [ ] Fra docs/gjenbruk.md, raske ting: CC0-lyder fra Morbidium og Loincloth (fotsteg etter underlag, dører, gulvknirk, regn, vind, natt, bål, sverdklang), skriftene bygget inn med FontFace i stedet for Google Fonts, alphaToCoverage på tuster og faner, handler for tapt WebGL-kontekst, test av artifact.html under sandkassens CSP.
- [ ] Fra docs/gjenbruk.md, middels: skjermeffekter (sjokkbølge, zoom-punch, rød kant ved lav KP), angrepspoletter og tempostyrer (høyst 2 som angriper), automatisk kvalitet med pikselbudsjett, stemmer per släkt med formanter, musikk som skifter i takt, spilltestmodus bak ?testmodus.
- [ ] log.md er over 50 KB. Flytt eldre økter til logg/ÅÅÅÅ-MM.md, som Morbidium gjør med tools/rydd_dokumenter.py.
- [ ] Grafikk etter Weatherglass, middels: sol som retningslys ute med skyggekamera snappet til texler, lys gjennom bladene, bakkeshader som bryter opp flisene, enkel AO nederst på vegger og steiner, skyskygger på alle materialer.
- [ ] Grafikk etter Weatherglass, stort: trær med greiner og bladkort, gresstrå med vind, lav dis med lyssøyler, adaptiv DPR med tre nivåer.
- [ ] Mer grafikk: tåke som ligger lavt over elva om morgenen, snø om vinteren, lysstråler gjennom vinduene i flere hus, varmeflimmer over smia, skyggen av fuglene på bakken.

- [ ] Sjekke det som er merket `uv` mot bøkene: rottene (finnes ikke i Bok II), Rødpels og demonen, prisene i byen, sanntidsoversettelsene i docs/regler/IMPLEMENTERING.md.
- [ ] Spilltest balansen på ekte maskin med flere rollpersoner. Spesielt: svake rollpersoner (FYS 6-8) på nivå 1, halvlängdsman med STY 4, ridder i plåt mot Rødpels, magiker med stav (FV 5 er lite), hvor ofte du blir medvetslös.
- [ ] Rigge anda (Tripo har auto-rigging, ellers Mixamo) og bytte vagge-animasjonen med ekte gange, angrep, dukk og fall.
- [ ] Bedre modeller for de andre släktene (samme pipeline som anda), eller i det minste kontur og hender.
- [x] Musikk, fancy startmeny, bedre grafikk og effekter (0.2)
- [x] Egen rollperson etter DoD-reglene, med Aidne-bakgrunn fra Ereb Altor (0.3)
- [x] Parera og undvika som slag, pressa slag, drakvalg, missöden, vila, dödsslag med Samla sig, skräck, magi (0.3)
- [x] Fristaden over bakken med folk, døgnrytme, nøkkelordsamtaler, tjenester, oppdrag og tyveri (0.4)
- [ ] Spilltest byen: er prisene riktige mot det du finner i kloakken? Er natta mørk nok, eller for mørk? Er det for lett å stjele?
- [ ] Lyd for fotsteg (plask i vann, tasse på stein), og egne stemmer for hver släkt (nå er det grynt for alle unntatt anka).
- [ ] Ytelsestest på svakere bærbar og mobil.

## DoD-regler som mangler

- [ ] Hjälteförmågor som ikke er i koden ennå: Tålig, Stålblick, Fint, Hjältesprång, Giftskydd, Sköldkrossare. De står i HJALTEFORMAGOR, men Jehanne selger dem ikke.
- [ ] Flere besvärjelser fra Bok III og Expert Magi, og lære fra formelsamlinger i kloakken.
- [ ] Bruk for ferdigheter som ikke gjør noe ennå: Rida, Sjökunnighet, Geologi og flere kunskapsferdigheter. Spåra brukes fra 0.6 til sporet etter svartfolket i Akershus.
- [ ] Mat og sult, fakler som brenner ut, guld- og kopparmynt i tillegg til silver.
- [ ] Gift og sykdom med styrke mot FYS på Motståndstabellen.
- [ ] Flere monstre fra Bok II og Monsterboken med egne anfall (troll som gror, jättespindel med nett, gast med skräck).

## Snart

- [x] Hub i Fristaden: dojoen, fars butikk og oppslagstavla med oppdrag finnes i byen (0.4).
- [ ] Flere oppdrag i byen, gjerne med valg: Gaspard som smugler, Hvass som skylder penger, Pimpa som forsvinner i kloakken.
- [ ] Låste dører om natta (Fingerfärdighet eller dyrkar), og at folk reagerer hvis du står inne hos dem mens de sover.
- [x] Lagre byens tilstand (oppdrag, rykte, klokke) sammen med resten av løpet (0.5). Butikkenes lager i byen lagres ikke ennå.
- [ ] Lyd for dører, steg på planker og stein i byen, og stemmer for byfolk (korte grynt og hmm som i Ultima VII).
- [ ] Flere romtyper: fellerom (Upptäcka fara, Hoppa & klättra), skattekammer, rom med fanger å befri (Övertala).
- [ ] Følgesvenner du kan leie på Den feite gåsen, så evner som Livvakt og Tonkonst får noe å gjøre.
- [x] Lagre løp midt i (etasje, utstyr, gaver) slik at man kan fortsette senere (0.5).
- [ ] Gamepad-støtte (Gamepad API, venstre stikke går, høyre sikter).
- [ ] Vise slaget (T20 mot verdi) som liten terning ved siden av skadetallet når det er Drake eller Demon.

## Senere

- [ ] Verdenskart i Fallout-stil over Aidne (rutenett med tåke, reise i dager, tilfeldige møter, steder du finner eller får vite om), og senere hele Kopparhavet. Plan i docs/verdenskart.md, venter på Toms svar om målestokk, Ereno og proviant.

- [ ] Flere regioner fra "Hjältar från Kopparhavet" (Arkipelagen, Mindre Akrogal, Tolan og Jorien, Norra Samkarna, Norra Soluna) i bakgrunnssteget.
- [ ] Oververden i Ultima-stil: kart over Zorakin med Fristaden, Karad Batur og Ereno. Se verdenskartet over.
- [x] Samtaler med nøkkelord som i Ultima IV og V (0.4). Neste: ord som låses opp av ting du har sett i kloakken.
- [ ] Samarbeidsspill for to (Rune som spilleder?).

## Teknisk

- [x] Felles Dialog.md for agentbeskjeder og lese-/svareregler i AGENTS.md. ChatGPT på chatgpt/dialog.

- [x] Spilltest før Pages-publisering: startknapp, andemodell, tastatur og pause fra prosjektets undermappe, fem nivåer og kampeffekter. ChatGPT i PR #2, testet og klar for innfletting.

- [x] Instansierte kampeffekter og opprydding ved nivåbytte, ChatGPT i PR #1. Tester og overlevering følger med.

- [ ] Instansiere fiendedeler for færre draw calls hvis det blir mange fiender.
- [ ] Flytte partikler til GPU om det trengs.
- [x] Repo på GitHub (Tombonator3000/DoD-Roguelite) med AGENTS.md og bygg til GitHub Pages.
- [x] Testriggen kan kjøres med THREE_DIR og CHROME, three ligger i devDependencies.
- [ ] Playwright som valgfri avhengighet for testriggen, og en npm-kommando for stresstesten.
