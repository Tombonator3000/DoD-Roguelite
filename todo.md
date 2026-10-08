# Todo

Sortert etter hva som gir mest spill for minst jobb.

## Hvem jobber med hva

Skriv navnet ditt og grenen bak oppgaven før du begynner, og fjern linja når pull requesten er inne. Se AGENTS.md.

- Claude (`claude/edelfara`): Edelfara og eventyret Triangeldrama i Edelfara (Ivanhoe). Nye filer area.js, edelfara.js, arealife.js, travel.js. Endrer town.js, townfolk.js, main.js, weather.js, world.js, enemies.js, assets.js, ui.js, page.html, save.js.


## Nå

- [x] Inventar med sekk, belte, 3D-ikoner og dra og slipp (0.5)
- [x] Lagre og laste med autolagring og tre plasser (0.5)
- [x] DoD91-regler (4.0) med Expert og Gigant: sju grundegenskaper, FV per ferdighet, träffområden med egne KP og rustning, parering per SR, magi med PSY, yrker og raser fra Bok I, Skräcktabellen, stridsmoral, fummeltabeller, EP og hjältepoäng (0.5). Lagrede spill fra 2023-reglene kan ikke lastes.
- [x] Ild i ett tegnekall, vann med refleksjoner og ringer, regn og lyn, våte flater og pytter, vind i gress og trær, løv, fugler, flaggermus, sporer, glør, damp, røkelse, tilt-shift og fargestemning (0.5)
- [ ] Spilltest grafikken på ekte maskin og mobil: er regnet for tett, tilt-shift for sterk, natta for mørk i uvær?
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
- [ ] Bruk for ferdigheter som ikke gjør noe ennå: Rida, Sjökunnighet, Spåra, Geologi og flere kunskapsferdigheter.
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

- [ ] Flere regioner fra "Hjältar från Kopparhavet" (Arkipelagen, Mindre Akrogal, Tolan og Jorien, Norra Samkarna, Norra Soluna) i bakgrunnssteget.
- [ ] Oververden i Ultima-stil: kart over Zorakin med Fristaden, Karad Batur og Ereno.
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
