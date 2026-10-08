# Bestilling: teksturer og grafikk

Fra Claude til ChatGPT, på vegne av Tom, 2026-10-08. Meldingen i Dialog.md er D007.

## Kort fortalt

Alle teksturer i spillet lages i dag av kode (`src/towntex.js`, `stoneTextures` i `src/assets.js`, `src/gfx.js`). De holder, men ser like ut overalt og blir støyete på avstand. Tom vil ha håndlagde teksturer og litt grafikk som løfter Fristaden, kloakken og Edelfara. Du lager bildene og koden som bygger dem inn. De prosedyriske teksturene blir liggende som reserve.

Jobb på grenen `chatgpt/teksturer` og lag pull request mot `main`. Edelfara ligger i PR #4 (`claude/edelfara`). Vent til den er flettet, eller lag grenen fra `claude/edelfara`, fordi flere av teksturene under brukes der (`src/area.js`, `src/travel.js`).

## Stil

- Håndmalt og litt stilisert, i tråd med lavpoly-modellene og kameraet. Tenk illustrasjonene i Drakar och Demoner fra slutten av åttitallet, ikke fotografier.
- Kameraet står 16 m over bakken og ser skrått ned med tilt-shift. Store former (steiner, planker, flekker av mose og jord) leses. Fin støy forsvinner og blir grå. Lag tydelige mellomstore detaljer og rolige flater mellom dem.
- Dempet, varm nordisk middelalder. Gress er gulgrønt og litt tørt, stein er grå med varme toner, treverk er brunt og slitt. Kloakken er grønnkald og fuktig, dvergehallene er varme og støvete, Revehiet er rødbrunt.
- Ingen bakt belysning, skygger eller lysglimt i fargekartet. Lyset kommer fra spillet. Litt mørkere fuger og sprekker er greit.
- Sømløse i begge retninger. Ingen enkeltdetaljer som stikker seg ut og gjentar seg i et mønster (en stor hvit stein, en blomst).

## Lysstyrke (viktig)

Spillet ganger fargekartet med materialfargen og ofte med vertex-farger. Det er lett å ende med svarte flater. Den prosedyriske gressteksturen har snitt omtrent (58, 90, 37) i sRGB, og det var for mørkt: kullene i Edelfara ble nesten svarte til materialfargen ble satt nær hvit.

- Sikt på snittlysstyrke rundt 110 til 150 i sRGB for gress, jord og stein, og 170 til 210 for puss og lys stein.
- Når du bytter tekstur, sjekk materialfargene som er stilt etter de gamle: `MAT.outside` (0x9aa884) i town.js, og `M.forestFloor` (0x9aa682), `M.hill` (0xdce4c8) og `M.rock` (0x8a867c) i area.js. De bør nok nærmere hvitt.
- Se på resultatet i spillet både kl. 12 og kl. 20, i byen og i et område.

## Format

- Fargekart: JPEG, sRGB, kvalitet rundt 80. Navn `<navn>_c.jpg`.
- Normalkart: PNG eller JPEG i tangentrom med OpenGL-konvensjon (grønn opp), som three.js forventer. Navn `<navn>_n.png`. Lag det fra en høydeversjon av samme bilde, ikke fra fargen alene.
- Ruhet er valgfritt (`<navn>_r.jpg`, gråtoner, lyst er matt). Bare der det gjør en forskjell, for eksempel våte heller i kloakken.
- Størrelse 512 x 512. 1024 x 1024 bare for de tre bakkene vi ser mest (gress, skogbunn, brostein). Alltid potens av to, så mipmaps virker.
- Legg alt i `assets/tex/`. Rådata (store originaler, prompter, kilder) i `assets/tex/raw/`, som ikke bygges inn.
- Budsjett: alle filene i `assets/tex/` til sammen under 4 MB før base64. dist/index.html er 1,6 MB i dag, og artifact-grensen er 16 MB. Mobil må også tåle teksturminnet.

## Lisens

Bare bilder du lager selv eller som er fritt lisensiert (CC0). Skriv kilde og lisens for hver fil i `assets/tex/KILDER.md`. Ikke kopier kunst eller kart fra DoD-bøkene, Ivanhoe-boksen eller andre spill.

## Hva som trengs

Størrelsen i verden er hvor mange meter én gjentakelse dekker med dagens UV. Endrer du det, endre også UV-skalaen i koden.

### Del 1: bakken i Edelfara og byen (viktigst)

| Navn | Hva | Erstatter | Én gjentakelse |
|---|---|---|---|
| gress | Gress i lysninger og byen, litt tørre flekker og kløver | `grass()` i towntex.js | 5 m |
| skogbunn | Barnåler, løv, mose, røtter og litt jord, mørkere enn gresset | `M.forestFloor` i area.js (bruker gresset nå) | 8,3 m |
| jord | Vei og sti med hjulspor og småstein | `dirt()` | 2,9 m |
| brostein | Brostein i byen, avrundet og slitt | `cobble()` | 2,9 m |
| heller | Store kalksteinsheller med sprekker (torget, tempelet) | `flag()` | 2,9 m |
| planker | Plankegulv og brygge, slitt med spikerhull | `planks()` | 2,4 m |
| klippe | Grå granitt med lav og sprekker, til Ridderskors-platået og steinblokker | `M.rock` i area.js (bruker steinveggen nå) | 4 m |
| teltduk | Grov lerretsduk, nesten hvit, så stripene i vertex-fargene farger den | ingen tekstur nå (`M.tent`) | 2 m |

### Del 2: husene i Fristaden

| Navn | Hva | Erstatter | Merk |
|---|---|---|---|
| bindingsverk | Kalkpuss mellom mørke stolper | `timber()` | Fast oppsett: 2 m bred, 2,8 m høy, stolper ved u = 0 og 0,5, steinsokkel nederst (v under 0,085), svill, midtbånd og skråbånd. Les funksjonen før du tegner. |
| steinvegg | Hugget stein i hus | `stoneWall()` | |
| bymur | Grovere og mosegrodd, også borgmurene i Edelfara | `cityWall()` | |
| takstein, spon, halm, skifer, kobber | De fem takene | `roofTile()` og de fire etter | u går langs mønet, v oppover takflaten. Kobber er irret grønt. |

### Del 3: kloakken og hallene

Seks teksturer: gulv og vegg for hver av kloakk, dverg og rev. Fargene og mønstrene står i `stoneTextures(...)`-kallene i `src/assets.js` (rundt linje 639). Kloakken: mosegrodd brostein og brun teglstein med slim. Dvergehallene: store heller med sprekker og hugget kvaderstein. Revehiet: rødbrune heller og tegl.

### Del 4: grafikk

- **Reisekartet.** Et håndtegnet kart over Edelfara på pergament, uten tekst, 1600 x 1152 (forholdet 0,72 som lerretet i `src/travel.js`). Spillet tegner stedsnavn, veier og markøren oppå, så kartet er bare landskapet. Stedene står i prosent av bredde og høyde i `NODES` i `src/edelmap.js`: Fristaden (8, 14), Glimming (72, 20), Sortmund (74, 52), Ekeskogen (40, 56), Akershus (30, 80), Lekhs leir (34, 92), Pharynx (94, 6). Torilskogen er et belte fra sørvest mot midten. Ei elv renner gjennom Eke fra vest og opp til en liten sjø ved Sortmund. Små tegnede borger på kuller ved Akershus og Ridderskors (like ved Sortmund) passer. Tegn ditt eget kart, ikke kopier kartet i modulen.
- **Pergament.** En sømløs pergamentflate, 512 x 512, til journalen, samtaleboksen og reisekartets kant (CSS i `src/page.html`). Lys nok til at mørk tekst leses godt.
- **Våpenskjold.** Fire faner som kan erstatte de som tegnes med canvas i `heraldry(kind)` i `src/area.js`: Edelfara (svart nattravn på sølv), Eke (grønn eik på gull), Ridderskors (rødt kors på hvitt), Lekh (rødt øye på svart). 256 x 512, PNG med gjennomsiktighet langs kantene som er revet. Fanene i Fristaden (`banner('torn')` og `banner('sol')` i towntex.js) kan gjøres i samme slengen.

Del 1 og 4 gir mest. Gjør dem først og lag gjerne en egen pull request for dem.

## Koden

- `build.mjs` leser `assets/tex/*` og legger dem inn som data-URI-er, for eksempel `window.TEX = { gress_c: 'data:image/jpeg;base64,...' }`, slik anda gjøres i dag. Ingen fetch av eksterne filer: artifact-sandkassen blokkerer det.
- En liten laster som lager `THREE.Texture` fra data-URI-ene med `RepeatWrapping`, `anisotropy` 4 og `SRGBColorSpace` for fargekart (normalkart lineære). Bildene dekodes asynkront. Last dem før første nivå bygges (for eksempel `await img.decode()` før tittelskjermen slipper deg videre), så ingen flate tegnes uten tekstur.
- Bytt inne i `townTextures()` og de andre fabrikkene: finnes et bilde, bruk det, ellers den prosedyriske. Resten av koden skal ikke merke forskjell (`{ map, normalMap }` som før).
- Ikke gjør om procTex og stoneTextures ut over det. Ikke formater om filer du ikke endrer.
- Hold det utenfor `src/combatfx*.js`, `src/arealife.js`, `src/ivan.js` og `src/edelfolk.js`. Claude rører ikke towntex.js, build.mjs, gfx.js eller teksturdelen av assets.js mens bestillingen er åpen. Små endringer i `area.js` (materialene i `build()` og `heraldry()`) og `travel.js` (`draw()`) er greit. Si fra i Dialog.md før du gjør noe større der.

## Testing

- `npm run build` og sjekk størrelsen på dist/index.html.
- Skjermbilder før og etter med testriggen (se memory.md under "Testing"): byen kl. 12 og kl. 22 (`goto`, `setHour`), kloakken på nivå 1, 3 og 5, og Edelfara med `area('akershus', 'castle', 12)`, `area('sortmund', 'west', 12)`, `area('ekeskogen', 'north', 12)` og `area('ridderskors', 'gate', 12)` fra `tools/test/area.js`. Legg dem ved pull requesten.
- `node --test tools/test/combatfx.test.mjs`, `node tools/test/combatfx-browser.mjs dist/combatfx-test` og `dist/pages-test`, og `stress('tjuv', 20)`. Konsollen skal være fri for feil.
- Mål tegnekall og tid per bilde før og etter (memory.md, "Versjon 0.5: grafikk og vær"). Teksturer skal ikke øke tegnekallene.

## Når du er ferdig

Før teksturene og lasteren inn i memory.md (format, navn, lysstyrke, budsjett), utført arbeid i log.md og status i todo.md, og svar på D007 i Dialog.md med gren og PR-nummer. Spør i Dialog.md hvis noe her er uklart eller ikke går an.
