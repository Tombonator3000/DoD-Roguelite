# Todo

Sortert etter hva som gir mest spill for minst jobb.

## Hvem jobber med hva

Skriv navnet ditt og grenen bak oppgaven før du begynner, og fjern linja når pull requesten er inne. Se AGENTS.md.

- Claude (`main`): bytter reglene fra DoD 2023 til DoD91 (4.0) med Expert og Gigant der det trengs, med fulle träffområden. Rører nesten alt i regelkoden: dod.js, rules.js, player.js, enemies.js, creation.js, ui.js, loot.js, townfolk.js. Vent med endringer i disse til det er pushet.
- Claude (`main`, etterpå): shadere (ild, vann, vind, våte flater), vær og flere partikler, tilt-shift og fargegradering. fx.js, post.js, town.js, world.js.

## Nå

- [x] Inventar med sekk, belte, 3D-ikoner og dra og slipp (0.5)
- [x] Lagre og laste med autolagring og tre plasser (0.5)
- [ ] DoD91-regler (4.0) med Expert og Gigant: egenskaper, färdigheter i T20, träffområden med egne KP, skadebonus, magi med PSY/KP-kostnad, yrken og raser fra Bok I. Lagrede spill fra 2023-reglene kan ikke lastes etterpå.

- [ ] Sjekke de uverifiserte verdiene (`uv: true` i src/dod.js) mot grunnboka: WP-kostnader og krav for hjälteförmågor, svenske navn, tabellen for svåra skador, noen våpen. Lista står i memory.md.
- [ ] Spilltest balansen på ekte maskin med flere rollpersoner. Spesielt: svake rollpersoner (FYS 6-8) på nivå 1, ridder i plåt mot Rødpels, magiker uten våpen, hvor ofte pressa-boksen dukker opp.
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

- [ ] Flere hjälteförmågor: Stridsrop, Kattfot, Förklädnad, Örnöga, Gott läkekött, Järngrepp, Blixtsnabb, Magisk talang, Massivt slag, Mästerkock, Mästerbesvärjare, Monsterjägare, Stigfinnare, Kvartermästare, Ynkrygg, Parera pilar.
- [ ] Allmän magi (Skingra, Beskyddare, Magisk sköld), besvärjelser på rang 2 og 3, lære nye fra grimoire eller lærer, grensen for preparerte besvärjelser.
- [ ] Bruk for ferdigheter som ikke gjør noe ennå: Hoppa & klättra (hull og avsatser), Bluffa (vakter), Vildmarksvana (mat), Simma (dypt vann), Rida, Sjökunnighet, Observation, Taktik. (Jakt & fiske, Uppträda, Fingerfärdighet og Köpslå brukes i byen fra 0.4.)
- [ ] Belastning (STY/2 gjenstander), mat og sult, fakler som brenner ut, gull og kopper i tillegg til silver.
- [ ] Sykdom og gift med virulens og styrke som motstridige slag.
- [ ] Flere monstre fra boka med egne angrepstabeller (troll som regenererer, kjempeedderkopp med nett, gast med skräck).

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

- [x] Spilltest før Pages-publisering: startknapp, andemodell, tastatur og pause fra prosjektets undermappe, fem nivåer og kampeffekter. ChatGPT i PR #2, testet og klar for innfletting.

- [x] Instansierte kampeffekter og opprydding ved nivåbytte, ChatGPT i PR #1. Tester og overlevering følger med.

- [ ] Instansiere fiendedeler for færre draw calls hvis det blir mange fiender.
- [ ] Flytte partikler til GPU om det trengs.
- [x] Repo på GitHub (Tombonator3000/DoD-Roguelite) med AGENTS.md og bygg til GitHub Pages.
- [x] Testriggen kan kjøres med THREE_DIR og CHROME, three ligger i devDependencies.
- [ ] Playwright som valgfri avhengighet for testriggen, og en npm-kommando for stresstesten.
