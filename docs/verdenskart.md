# Verdenskart i Fallout-stil for Ereb Altor (plan)

Claude, 2026-10-08. Tom spurte om et verdenskart som i Fallout 1 og 2: du klikker på kartet og reiser, det kan dukke opp tilfeldige møter, du kan finne steder selv, og noen byer er markert fra starten. På sikt skal Ereb Altor-verdenen og kartet bli større. Dette er en plan, ingen kode ennå.

## Kort fortalt

Ja, det passer godt, og mye av grunnmuren finnes allerede:
- Reisekartet til Edelfara regner reisetid på klokka.
- Area-motoren kan bygge et område fra et malt rutenett.
- Samtalesystemet kan lære deg nye steder.
- DoD 4.0 har regler som nesten er laget for dette:
  - dagsmarsj og ritt i km per dag (Bok II s. 5),
  - Orientering for å gå seg vill (Bok I s. 54),
  - Upptäcka fara for å se fienden først,
  - en hemvistkode og en vanlighet for hvert monster (Bok II s. 24), som kan bli møtetabeller per terreng.

Det største valget er målestokken:
- I kanon ligger Fristaden og Pharynx omtrent 1 100 km fra hverandre, på hver sin side av Zorakin.
- I dag tar reisen fra Fristaden til Ekeskogen 9 timer.

Anbefalingen min:
- **Fase 1:** et rutenett over Aidne-halvøya der én rute er én dagsmarsj (25 km).
- **Edelfara:** det nåværende Edelfara-kartet blir et lokalkart du kommer inn i fra verdenskartet, slik byene i Fallout har sitt eget bykart.
- **Hurtigreise:** skip og karavaner gjør de lange turene kortere.

## Slik virker verdenskartet i Fallout 1 og 2

**Rutenett og tåke**
- Fallout 2-kartet er 20 fliser med 7 x 6 ruter, til sammen 840 ruter (28 x 30).
- Alt er svart fra start, unntatt der du begynner.
- Ruter du har vært i, blir lyse. Rutene rundt dem blir halvmørke, og et flagg per rute bestemmer om naboene vises.
- I Fallout 1 gir perken Scout én rute ekstra syn i alle retninger.

**Reise**
- Du klikker hvor som helst, og figuren går i rett linje mens en strek viser veien.
- Terrenget avgjør farten. I Fallout 2 tar det omtrent 25 timer å krysse en rute med ørken, by eller hav, og 32,5 timer i fjellet.
- Du kan stoppe hvor som helst og gå inn i ruta du står i, selv om det ikke er noe sted der.
- Pathfinder (Fallout 1) gir 25 % kortere reisetid.
- Bilen i Fallout 2 gjør reisene mye kortere, bruker drivstoff og gir færre møter.

**Steder**
- Byer og steder er grønne sirkler i tre størrelser.
- Noen er kjent fra start. Andre er skjult til et manus avslører dem, for eksempel når noen forteller deg om stedet.
- Når du går inn i en by igjen, kommer et bykart med innganger til de ulike delene av byen.

**Tilfeldige møter**
- Hver rute har en hyppighet: Tvunget 100 %, Hyppig 38 %, Vanlig 22 %, Uvanlig 12 %, Sjelden 4 %, Ingen 0 %. Den kan i prinsippet være ulik morgen, ettermiddag og natt.
- Hver rute peker på en møtetabell for området. Hver linje i tabellen har sjanse, antall, vilkår og om gruppen er fiendtlig, nøytral eller slåss med noen andre.
- Møtet spilles på et tilfeldig kart for terrenget, for eksempel ett av fem fjellkart.

**Unngå møter**
- I Fallout 2 har du sjanse til å se møtet først og velge om du vil gå inn i det eller fortsette.
- Sjansen er Outdoorsman, med et tak på 95 % og trekk for hvor farlig ruta er (0 til 70 %).
- Ranger gir færre fiendtlige møter.

**Spesielle møter**
- Sjeldne, rare møter med vitser og referanser.
- Sjansen øker med Luck og med perkene Scout, Ranger og Explorer.

**Tid**
- Fallout 1 hadde en frist (vannbrikken), så reisetiden betydde noe.
- Fallout 2 har nesten ingen frist, og der er reisetid mest stemning.

## Hva vi tar med, og hva vi lar ligge

| Fallout | I Svart Nebb |
| --- | --- |
| Rutenett med tåke, naboruter vises | Ja. Fra fjell og høyder ser du to ruter. Geografi FV 12 eller mer viser navnet på elver og landskap du ser (uv). |
| Klikk og reis i rett linje | Ja, men langs veier når det går. Vei gir full marsjfart, utenfor vei går det saktere (se under). |
| Terreng gir fart | Ja, etter Bok II: gang 20 km, marsj 30 km, ritt 25 km og hard ritt 40 km per 12 timer. Dårlig vær gir -25 %, elendig vær -50 %. |
| Stopp hvor som helst | Ja. «Slå leir» eller «Se deg om» bygger et område av terrenget i ruta. |
| Byer markert, andre steder skjult | Ja. Fristaden og det du vet om (Ereno, Karad Batur) er markert. Resten lærer du i samtaler, eller du finner det når du går inn i ruta. |
| Bykart med innganger | Ja. Edelfara får dagens reisekart som lokalkart. Fristaden kan få Nordporten og havna som innganger. |
| Møtetabeller per område og terreng | Ja, bygget på hemvistkodene og vanligheten i Bok II, pluss egne regionale tabeller (Torilskogen: svartfolk og ulver, Aidnebergen: orcher, troll og banditter). |
| Outdoorsman for å unngå | Upptäcka fara: lykkes du, ser du dem først og kan velge mellom å gå inn, Smyga forbi eller gå rundt (+½ dag). |
| Gå seg vill | Orientering når du går utenfor vei i skog, fjell og myr. Halv CL uten klar himmel. Misslyckat gir en rute feil og tapt tid, fummel feil retning (Bok I s. 54). |
| Bil og drivstoff | Hest (Rida), karavaner mot betaling, og skip over Kopparhavet. |
| Spesielle møter | Ja, få og håndlagde, med egne vitser fra Ereb. Sjansen øker med hjältepoäng i stedet for Luck (uv). |
| Mat og vann | Kanskje senere. Proviant med vekt, og Överlevnad for å finne mat. Ikke i fase 1. |

## Hva Ereb Altor sier om geografien

To hjelpeagenter har lest kildene (kingafw.no, Hjältar från Kopparhavet på Toms Drive, Triangeldrama i Edelfara). Hovedfunnene:

**Fristaden**
- Fristaden ligger nordøst på Aidne-halvøya, innerst i Dakkilobukten (Drakdjupet på 2024-kartet), ved foten av fjellet.
- Den er en liten by med ett hus på kartet, som betyr omtrent tusen innbyggere.
- Dvergeriket Karad Batur ligger like ved, og dvergene handler gjennom Fristaden.
- Zorakins erobring av Fristaden ødela handelen med dvergene. Da bygde Caddo og dvergene Ereno.

**Pharynx og Edelfara**
- Pharynx er et hertugdømme midt i Zorakin, med byen ved Caddobukten og munningen av Jostefloden.
- Edelfara er grevskapet sørvest i Pharynx, inntil Torilskogen på halvøya Grindanu.
- Svartfolk slo seg ned i Torilskogen i år 126 eO.

**Avstander, målt på kartet i Ivanhoe-boksen (pluss eller minus 15 %)**

| Strekning | Omtrent |
| --- | --- |
| Fristaden til Ereno | 120 km |
| Fristaden til Chrymd | 145 km |
| Fristaden til Luksilo | 190 km |
| Fristaden til Pharynx | 1 100 km |
| Fristaden til Pendon | 1 300 til 1 400 km |
| Pharynx til Pendon | 370 km |
| Pharynx til Svarta Tornet | 270 km |

**Sjøveien**
- Resetidstabellen i Kampanjboken 1989 gir disse dagene fra Fristaden: Nohstril 4, Gringul 8, Arno 10, Pendon 18 og Tyros 35. Været gir pluss eller minus 50 %.
- Hjältar från Kopparhavet regner sjøreiser i farvann. Ett farvann er det et skip krysser på en uke.

**Rundt Fristaden**
- Nord og nordvest: Aidnebergen (Vorgabergen) med Karad Batur.
- Sør: bukta med øya Dakkilo og byen Nohstril.
- Sørvest: hertugbyene Chrymd og Luksilo, så Nordbergaskogen og halvøya Indar.

**Farer per område, til møtetabellene**

| Område | Farer |
| --- | --- |
| Aidnebergen | Orcher, troll, ulver, grottbjørn og ørn, sjelden drake |
| Torilskogen | Svartalfer, orcher og ulver |
| Zorakins jordbruksland | Stråtrøvere, røverbaroner, hekser og heksejegere, pest |
| Nordbergaskogen | Skogsalver som jager bort mennesker og dreper svartfolk |
| Grimmaniträsket | Bare «otaliga hemska berättelser», fritt fram for oss |
| Kopparhavet | Pirater, sjøslanger, spøkelseståke og haier |

**To lag med kanon som ikke alltid er enige**
- De gamle bøkene (1985 til 1991) har Pharynx, Torilskogen og Grindanu.
- De nye (Helmgast 2024 og 2025) har Karad Batur og navnet Kardunien, men nevner ikke Pharynx.
- Ereno ligger nord eller nordøst for Fristaden i de gamle bøkene og sør for byen på 2024-kartet.
- Spillet bruker allerede begge, og forslaget er å fortsette med det:
  - geografien fra Ivanhoe-kartet,
  - Karad Batur og navnene fra 2024.
- Tom bør velge hvor Ereno skal ligge.

Vi tegner vårt eget kart. Kartene fra bøkene er bare kilde for hvor ting ligger.

## Forslag: Aidne-kartet

**Målestokk**
- Én rute er 25 km, omtrent én dagsmarsj på vei.
- Aidne med Zorakin, Kardien og fjellene er omtrent 1 600 x 1 000 km. Det blir et rutenett på omtrent 64 x 40 ruter, tre ganger så mange som i Fallout 2.
- De fleste rutene er villmark med møter, ikke steder.

**Reisetid og hastighet**
- Til fots tar Fristaden til Edelfara omtrent 44 dager, som er en ekspedisjon.
- Raskere måter å komme seg fram på:
  - hest gir hard ritt på 40 km per dag;
  - en karavane langs kongeveien går tryggere, men tar det den tar;
  - skip fra Fristaden til Pendon tar 18 dager, og videre derfra.
- Fristen i Triangeldrama begynner først når du finner kureren, så den lange reisen ødelegger ikke oppdraget.

**Fart utenfor vei** (spillets tolkning, uv)

| Terreng | Fart |
| --- | --- |
| Slette og åker | 1 |
| Åpen skog | 0,75 |
| Tett skog | 0,5, med Orientering |
| Berg | 0,5, med Orientering |
| Myr | 0,4, med Orientering |
| Høyfjell og isbre | Kan ikke krysses uten pass |
| Hav | Bare med skip |

Elver krysses ved vadesteder og bruer. Ellers koster en elv en halv dag og et Simma-slag.

**Møter**
- Hver rute har hemvist (Bok II-koden), en hyppighet (Fallout-skalaen) og en region.
- Én sjekk per dag, og en ekstra om natta hvis du sover ute uten vakt.
- Tabellen for regionen og hemvisten velger møtet.
- Fiendtlige møter bruker fiendene vi har (orcher, svartalfer, ulver, vetter, skjeletter), og nye kan komme til senere. Kandidater er stråtrøvere, røverriddere, varg, bjørn, troll og heksejegere, merket uv til de er sjekket mot Bok II.
- Nøytrale møter er en karavane, pilegrimer, Tornväktare på patrulje, dverger fra Karad Batur eller bønder med rykter. De får samtaler med nøkkelord som byfolket.

**Steder fra start**
- Markert: Fristaden, Karad Batur (porten) og Ereno.
- Lærer du i samtaler i Fristaden: Chrymd, Luksilo, Nohstril, Pendon og Pharynx.
- Lærer du i Edelfara (samme folk som nå): Edelfara og stedene der.
- Skjult til du finner dem:
  - Svarta Tornet, en hule i Aidnebergen og en ruin i Grimmaniträsket;
  - minst ett spesielt møte.

**Bykart**
- Edelfara bruker dagens reisekart som lokalkart.
- Går du inn i ruta, kommer Edelfara-kartet. Går du ut ved Pharynx-veien, kommer verdenskartet.

## Senere: hele Kopparhavet

Fase 4 kan gå et nivå opp, med et sjøkart over Kopparhavet der én rute er ett farvann (en uke med skip). Det har Erebosiska arkipelagen med Nares og Tibor, Jorien og Tolan med Grivela og Tyrus, Mindre Akrogal med Rabul, og piratøya Montarkun. Aidne-kartet blir da ett av flere landkart du går i land på. Hjältar från Kopparhavet har vind og en skjult fare for hvert farvann, og ferdige møter på havet (pirater, sjøslanger, Lotan), så det henger godt sammen med Navigera og Sjökunnighet fra Bok I.

## Hvordan det kan bygges

**Data** i `src/worldmap.js` (ren data, kan tegnes som tekst i node, slik `areamap.mjs` gjør):
- terrengrader som tegn per rute;
- et lag med veier og elver;
- regioner;
- steder med rute, størrelse, om de er kjent fra start, og hvilket område eller lokalkart de åpner.

**Tilstand** i `G.run.world`:
- posisjon og dag;
- sett og besøkte ruter, som base64 med én byte per rute (omtrent 2,5 kB);
- kjente steder og ferdige spesialmøter.

Den lagres med resten av løpet.

**Skjerm**
- Utvid `travel.js` med en verdensmodus: rutenett, tåke som blekkvask på pergament, en rød markør og streken til målet med antall dager.
- Markøren går rute for rute, og klokka går.
- Møter stopper reisen med et valg: «Du ser: fem orcher ved et bål.» Gå nærmere, smyg forbi eller gå rundt.

**Møteområder**
- Nye maler i `areagrid.js`: lysning i skogen, vei gjennom åkre, fjellpass, vadested, myr, kyst og ruin.
- Fiendene settes ut som i Edelfara.

**Steder i samtaler**
- Et lite kall, `revealPlace(id)`, som et svar i samtalene kan bruke.
- Loggen sier «Pendon er merket på kartet.»

**Kartbildet**
- Lag rutenettet først og tegn et enkelt testkart fra det.
- Bestill så et malt kart av ChatGPT som følger rutenettet, slik reisekartet ble laget i D007.

**Tester** i `tools/test/world.js`:
- gå fra Fristaden til Pharynx;
- tving fram et møte;
- sjekk tåken etter lagring og lasting.

## Faser

1. **Aidne-kartet uten møter.** Rutenett, tåke, reise med klokke og terreng, steder fra start og fra samtaler. Edelfara blir lokalkart.
2. **Tilfeldige møter.** Tabeller per region og hemvist, Upptäcka fara og Smyga for å unngå, møteområder fra mal, og Orientering utenfor vei.
3. **Hest, karavaner og skip.** Hester i Fristaden og Sortmund (Rida), karavaner mot betaling og skipsreiser fra Fristaden.
4. **Kopparhavet.** Et sjøkart med farvann og flere landkart.

## Spørsmål til Tom

1. Ærlig målestokk (Edelfara er en lang reise, men hest og skip hjelper) eller sammenpresset (alt innen noen dagers reise, som nå)?
2. Hvor skal Ereno ligge: nord eller nordøst for Fristaden (de gamle bøkene) eller sør (2024-kartet)?
3. Skal mat og proviant være med fra start, eller vente?

## Kilder

- [Fallout 2 random encounters (fallout.wiki)](https://fallout.wiki/wiki/Fallout_2_random_encounters)
- [Worldmap.txt File Format (fallout.wiki)](https://fallout.wiki/wiki/Worldmap.txt_File_Format)
- [Fallout 2 map (fallout.wiki)](https://fallout.wiki/wiki/Fallout_2_map)
- [World map (fallout.wiki)](https://fallout.wiki/wiki/World_Map)
- [Outdoorsman (Fallout Wiki)](https://fallout.fandom.com/wiki/Outdoorsman)
- [Fallout perks (Fallout Wiki)](https://fallout.fandom.com/wiki/Fallout_perks)
- [Worldmap, Maps and City text editing guide (Fallout modding wiki)](https://falloutmods.fandom.com/wiki/Worldmap,_Maps_and_City_text_editing_guide)
- [DarkFO devlog del 6: Worldmap and Random Encounters](https://darkf.github.io/2014/08/15/darkfo_devlog_pt_6.html)
- [Random encounters, Fallout (ludo.guide)](https://www.ludo.guide/guide/fallout/random-encounters)
- [Spelledarboken 1989, Zorakin (kingafw.no)](https://kingafw.no/Drakar/boker/5d1c66369cd1/del-98.html) og [Kardien](https://kingafw.no/Drakar/boker/5d1c66369cd1/del-63.html)
- [Kampanjboken 1989, Resetidstabell (kingafw.no)](https://kingafw.no/Drakar/boker/3e37a844129d/del-41.html)
- [Aidne-kartet fra Ivanhoe (kingafw.no)](https://kingafw.no/Drakar/bibliotek/boker/d9af19573fe5.html)
- Ereb Altor: Hjältar från Kopparhavet (Helmgast 2025), Toms Drive, s. 6 til 37 og kartene s. 30 til 31 og 90 til 91
- Triangeldrama i Edelfara (Drakar och Demoner Ivanhoe), PDF fra Tom
- Drakar och Demoner 4.0 Bok I s. 54 og Bok II s. 5 og 24, oppsummert i docs/regler/
