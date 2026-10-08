# Drakar och Demoner 4.0 (1991), Bok I: Rollpersonen. Regelspecifikation

Källa: `/home/claude/rules/kingafw/dod4_bok1_rollpersonen.txt` (transkription, Target Games AB 1991, red. Henrik Strandberg).
Allt nedan är hämtat ur den filen. Inget är gissat; där boken är otydlig eller hänvisar till andra kapitel står det uttryckligen.

**Sidnummer.** Transkriptionen har sidmarkörer bara för trykt side 3 till 7. Sidnummer för senare avsnitt är tagna ur bokens innehållsförteckning (sidan där avsnittet börjar). Formatet nedan är "(s. N)" = trykt side N.

**Notation i denna fil.** Intervall skrivs `1-9`. Minus skrivs `-`. Bokens tankstreck i tabeller ersätts så här: "ej tillämpligt" = `-`, "automatisk framgång" = `ok`, "förbjuden färdighet" = `F`. `†` behålls där boken använder det.

**Viktig läsregel.** Alla slag är "slå lika med eller under". När boken skriver "-X på tärningsslaget/slaget" betyder det att X dras från tärningsresultatet, alltså en fördel. "-X på CL" är en nackdel.

---

## 0. Grundbegrepp (s. 4-7)

### Tärningar (s. 5)
- `nTm` = slå n st m-sidiga och summera. `2T6+2` = summa + 2.
- T10: resultatet 0 betyder 10.
- T3 = T6 där 1-2 = 1, 3-4 = 2, 5-6 = 3. T2 = T6 där 1-3 = 1, 4-6 = 2.
- T100 = två T10 (ental och tiotal); "00" = 100.

### De sju grundegenskaperna (s. 5-6)
Normalt 3-18, högre är bättre.

| Förk. | Namn | Används till (enligt boken) |
|---|---|---|
| STY | Styrka | Skada i närstrid (via SB), bärförmåga, hur tung rustning man orkar |
| FYS | Fysik | Hälsa, uthållighet, motstånd mot gift och sjukdom, KP |
| SMI | Smidighet | Snabbhet, träffsäkerhet, undvika (t.ex. fallande block), **vem som anfaller först i strid** |
| INT | Intelligens | Inlärning, besvärjelser i minnet |
| PSY | Psyke | Magisk kraft, självdisciplin, tur, intuition, motstånd mot magi. Förbrukas som "PSY-poäng" |
| KAR | Karisma | Charm, ledarskap, övertalning |
| STO | Storlek | KP (med FYS), SB (med STY), smyga/gömma sig, knuffas omkull, slumpa vem som träffas |

### STO, vikt och längd (s. 6)

| STO | Vikt i kg | Längd i cm |
|---|---|---|
| 1 | 1-9 | 10-60 |
| 2 | 10-18 | 40-110 |
| 3 | 19-27 | 60-120 |
| 4 | 28-36 | 75-130 |
| 5 | 37-45 | 90-140 |
| 6 | 46-50 | 110-150 |
| 7 | 51-55 | 130-160 |
| 8 | 56-60 | 140-170 |
| 9 | 61-65 | 150-175 |
| 10 | 66-70 | 155-180 |
| 11 | 71-75 | 160-180 |
| 12 | 76-80 | 160-180 |
| 13 | 81-85 | 165-185 |
| 14 | 86-90 | 170-185 |
| 15 | 91-95 | 175-190 |
| 16 | 96-100 | 180-195 |
| 17 | 101-110 | 185-200 |
| 18 | 111-120 | 190-205 |
| 19 | 121-130 | 200-210 |
| 20 | 131-140 | 205-220 |
| 21 | 141-150 | 210-230 |

Hög STY: välj längd nära det lägre värdet; låg STY: nära det högre. Dvärgar väger STY kg mer än tabellen. Alver väger (20 - STY) kg mindre.

### Färdigheter, kort (s. 6-7)
- Färdighetsvärde (FV), normalt 1-20. FV 1 = nybörjare, 15-20 = nästan fullärd.
- Varje färdighet bygger på en grundegenskap. Grundegenskapen ger gratis FV vid skapandet och kan begränsa max-FV.
- **Primära färdigheter**: alla har dem från början, förtryckta på formuläret, obegränsat FV.
- **Sekundära färdigheter**: kan inte läras från början (undantag: yrkesfärdigheter, särskild förmåga). FV kan aldrig överstiga grundegenskapen de bygger på.
- **Yrkesfärdigheter**: sekundära färdigheter som yrket gjort till sina. FV från början, billigare att lära, **obegränsade**.
- Grundslag: 1T20 <= FV (egentligen CL, se 5.4) = lyckat.

### Magi, kort (s. 7)
Tre skolor i denna bok: animism, elementarmagi, mentalism. Bara magiker (och utbygdsjägare) kan lära sig besvärjelser. Besvärjelser följer varken primär- eller sekundärreglerna och är obegränsade. Svårighet = skolvärde (SV) 1-20. I stället för FV har besvärjelsen skicklighetsvärde (S), som fungerar exakt som FV (KNÄCKA S12 = FV 12).

---

## 1. Hur du skapar en rollperson (s. 8)

Alla rollpersoner har **125 bakgrundspoäng (BP)**. BP köper:
1. Ras (0-25 BP)
2. Grundegenskaper
3. Särskilda förmågor
4. Dubbelhänt eller ambidextriös (via Svärdshand)
5. Socialt stånd
6. Extra startkapital
7. Extra FV i startfärdigheterna (kvarvarande BP x 5 = extra EP)

Obligatoriskt: köpa ras (kan kosta 0) och köpa grundegenskaper så att yrkets krav uppfylls.

**Ordning (bokens kapitelordning och exemplet):**
1. Ras (BP)
2. Yrke (välj 12 yrkesfärdigheter, magiker 9; anteckna yrkesförmåga)
3. Kön
4. Grundegenskaper (köp med BP, lägg sedan på rasmodifikation; STO separat)
5. Kroppspoäng (totala och per träffområde)
6. Skadebonus
7. Förflyttning
8. Särskilda förmågor (2T20 + BP)
9. Svärdshand (2T6 + BP)
10. Socialt stånd (2T6 + BP)
11. Startkapital (2T6 + BP + halva BP på socialt stånd)
12. Ålder (modifierar grundegenskaper, ger EP, multiplicerar startkapital, sätter max-FV)
13. Startfärdigheter: räkna BC, spendera EP
14. Utseende och bakgrund
15. Utrustning (köp för startkapitalet)

---

## 2. Ras (s. 8-11)

### Raser och kostnad i BP (s. 8-9)

| Ras | Kostnad i BP |
|---|---|
| Alv | 25 |
| Anka | 0 |
| Dvärg | 25 |
| Halvalv | 15 |
| Halvlängdsman | 15 |
| Halvorch | 10 |
| Människa | 10 |

Det finns sju spelbara raser i boken. Orch är **inte** spelbar här (nämns bara som förälder till halvorch). Fler raser finns enligt boken i kapitlet Varelser och i "Drakar och Demoner Monster".

### Tabell över rasernas modifikationer på grundegenskaperna (s. 10)

| Ras | STY | FYS | SMI | INT | PSY | KAR | STO* |
|---|---|---|---|---|---|---|---|
| Alv | -1 | ±0 | +3 | +3 | ±0 | +2 | 8-14 (11) |
| Anka | -4 | +2 | +2 | ±0 | ±0 | -3 | 3-6 (5) |
| Dvärg | +3 | +2 | ±0 | ±0 | ±2 | ±0 | 4-9 (7) |
| Halvalv | ±0 | ±0 | +2 | ±0 | ±0 | +1 | 7-16 (12) |
| Halvlängdsm. | -4 | +3 | +3 | ±0 | +2 | ±0 | 3-6 (5) |
| Halvorch | +2 | +2 | -1 | ±0 | ±0 | -3 | 8-18 (13) |
| Människa | ±0 | ±0 | ±0 | ±0 | ±0 | ±0 | 8-18 (13) |

*STO: lägsta-högsta möjliga STO, normalvärde inom parentes. Dvärgens PSY står som "±2" i källan (troligen tryckfel för ±0 eller +2; kan inte avgöras ur filen).

**Tärningar per grundegenskap och ras finns INTE i denna bok.** "Ett enklare framslagningssystem" hänvisar till kapitlet Varelser. Enda exemplet här: "En människa (STY 3T6) får t.ex. inte ha mer än 18 i STY."

### Raserna i detalj

| | Alv | Anka | Dvärg | Halvalv | Halvlängdsman | Halvorch | Människa |
|---|---|---|---|---|---|---|---|
| Färdighetsbonus | +4 FV Upptäcka fara och Lyssna | FV 20 (B5) i Simma; +4 FV Smyga | FV 5 i Geologi, som räknas som **primär** för dvärgar | +2 FV Upptäcka fara och Lyssna | +4 FV Gömma sig | +4 FV Slagsmål | inget |
| Förflyttning (rasmod.) | +1 | -2 | -2 | ±0 | -2 | ±0 | ±0 |
| Tala modersmål (BC i) | alviska + ett människospråk | ett människospråk | dvärgiska + ett människospråk | alviska + ett människospråk | ett människospråk | svartiska + ett människospråk | ett människospråk |
| Läsa/Skriva modersmål (BC i) | alviska + ett människospråk | ett människospråk | dvärgiska | ett människospråk eller alviska | ett människospråk | ett människospråk | ett människospråk |
| Sinnen och annat | kattögon, mycket bättre syn och hörsel; dör inte av ålder, åldras inte | små, klena, uthålliga, smidiga | perfekt mörkersyn; blir normalt inte magiker | ungefär dubbelt så bra syn och hörsel som människor; lever mycket länge | ca 1 m långa; blir normalt inte magiker | starkare än människor, motbjudande utseende | |
| Vikt | (20 - STY) kg under tabellen | | STY kg över tabellen | | | | |

Övriga rasregler som står utspridda i boken:
- Alver behöver bara 4 timmars sömn för tjuvens förmåga (s. 21) och 2 timmars sömn för att återställa erfarenhetsslag (s. 63), mot 8 respektive 6 för andra.
- Ålder: se 4.9. Alver räknas som "Unga" för EP och startkapital men "Mogna" för grundegenskapsmodifikationer och max-FV från start.
- Svartiska har inget skriftspråk (s. 52).
- Dvärgspråket hålls hemligt.

---

## 3. Yrke (s. 11-22)

### Allmänt (s. 11)
- 11 yrken. Yrket bestämmer vilka färdigheter man kan lära sig från början, vad det kostar senare (yrkesfärdighet grundkostnad 3 EP, annan sekundär 5 EP), och en unik **yrkesförmåga**.
- Man väljer **12** yrkesfärdigheter ur yrkets lista (**magiker 9**). Ovalda färdigheter i listan blir vanliga sekundära färdigheter.
- Grupper med underfärdigheter (Tala/Läsa-Skriva främmande språk, Hantverk, Spela instrument, vapenfärdigheter): varje språk/hantverk/instrument/vapen är en egen färdighet och räknas som en egen yrkesfärdighet. Max antal ur gruppen anges per yrke; ingen gräns angiven = obegränsat (i praktiken max 12).
- Från början kan man bara lära sig primära färdigheter, yrkesfärdigheter (och besvärjelser för magiker). I spel kan man lära sig allt, dyrare. Undantag: förbjudna färdigheter (magiskolor för alla utom magiker och utbygdsjägare).
- **Startutrustning och startpengar per yrke anges inte.** Startkapital är gemensamt (4.8). Om utrustning, se 7.
- Inga uttryckliga rustningsförbud per yrke. Rustningsbegränsningar finns i färdigheterna: Akrobatik (ingen rustning), Stridskonster (inte tyngre än läder), Simma (inte i någon rustning), Smyga (metallrustning -4).

### Tabell över grundegenskapskrav (s. 11)
Lägsta värde (efter rasmodifikation) för att få tillhöra yrket.

| Yrke | STY | FYS | SMI | INT | PSY | KAR | STO |
|---|---|---|---|---|---|---|---|
| Bard | | | 12 | | | 14 | |
| Helare | | | | 12 | 12 | | |
| Krigare | 14 | 12 | | | | | |
| Lärd man | | | | 16 | | | |
| Lönnmördare | | | 14 | | 12 | | |
| Magiker | | | | 12 | 14 | | |
| Munk | | | | 12 | 12 | | |
| Sjöfarare | | 12 | 12 | | | | |
| Riddare | 14 | 12 | | | 12 | | |
| Tjuv | | | 16 | | | | |
| Utbygdsjägare | | 12 | 12 | | 12 | | |

Kraven gäller bara vid köpet. Åldersmodifikationer får sedan sänka under kravet (s. 28).

### 3.1 Bard (s. 12). Krav SMI 12, KAR 14
**Yrkesförmåga:** spela ett instrument eller sjunga i minst 1 minut och lyckas med färdighetsslag i rätt färdighet. Då uppfattar alla som hör det bardens KAR som +5. Påverkar KAR-baserade färdigheter (t.ex. Muta, Övertala, Bluffa, Skådespeleri): CL +5. Varar 1 timme.
**Möjliga yrkesfärdigheter:** En valfri vapenfärdighet, Tala maximalt två valfria främmande språk, Läsa/Skriva ett valfritt främmande språk, Administration, Akrobatik, Buktala, Dans, Djurträning, Dolk, Förfalskning, Geografi, Gyckelkonster, ett valfritt Hantverk, Hasardspel, Heraldik, Historia, Hypnotisera, Knopar, Kulturkännedom, Låsdyrkning, Läppläsning, Muta, Målning, Schack & brädspel, Simma, Skådespeleri, Spela instrument (obegränsat antal), Språkkunskap, Trästav.

### 3.2 Helare (s. 13). Krav INT 12, PSY 12
**Yrkesförmåga (handpåläggning):**
- Läker 1 KP/SR på vilken varelse som helst. Kostar 1 PSY-poäng per läkt KP.
- Fördriva sjukdom: helarens PSY/2 måste övervinna sjukdomens Svårighetsgrad.
- Neutralisera gift: PSY/2 måste övervinna giftets STY på Motståndstabellen.
- Sjukdom/gift kostar lika många PSY-poäng som giftets/sjukdomens STY, oavsett utfall.
- PSY kan inte bli lägre än 1; skulle den bli det misslyckas helaren automatiskt och PSY blir 1.
- PSY-poäng återfås "på vanligt vis" (kapitlet Magi, inte i denna bok).
Respekterar liv, ogillar att skada (rollspelsnotis, ingen regel).
**Möjliga yrkesfärdigheter:** Tala maximalt två valfria främmande språk, Läsa/Skriva ett valfritt främmande språk, Alkemi, Djurhelning, Dolk, Drogkunskap, Geografi, Giftkunskap, ett valfritt Hantverk, Hypnotisera, Kulturkännedom, Kunskap om demoner, Kunskap om magi, Kunskap om odöda, Läkekonst, Massage, Orientering, Simma, Trästav, Zoologi, Örtkunskap, Överlevnad.
Avvikelse: Färdighetstabellen ger Helare Språkkunskap men inte Dolk; Dolk-beskrivningen saknar också Helare.

### 3.3 Krigare (s. 14). Krav STY 14, FYS 12
**Yrkesförmåga:** alltid +5 på alla initiativslag.
**Möjliga yrkesfärdigheter:** Vapenfärdigheter (obegränsat; Vapenfärdigheter-beskrivningen säger "Krigare (12)"), Tala ett valfritt främmande språk, Avväpna, Bärsärkagång, Dra vapen, Dolk, Geografi, ett valfritt Hantverk, Hasardspel, Kulturkännedom, Simma, Stridskonster, Trästav, Två vapen.

### 3.4 Lärd man (s. 15). Krav INT 16
**Yrkesförmåga:** alltid -5 på alla slag på Skräcktabellen (Skräcktabellen finns inte i denna bok).
**Möjliga yrkesfärdigheter:** Tala maximalt fyra valfria främmande språk, Läsa/Skriva maximalt fyra valfria främmande språk, Administration, Alkemi, Astrologi, Dolk, Drogkunskap, Förfalskning, Geografi, Geologi, Giftkunskap, Hasardspel, Heraldik, Historia, Kulturkännedom, Kunskap om demoner, Kunskap om magi, Kunskap om odöda, Räkning, Schack & brädspel, Simma, Språkkunskap, Trästav, Zoologi, Örtkunskap.

### 3.5 Lönnmördare (s. 16). Krav SMI 14, PSY 12
**Yrkesförmåga (attack bakifrån):** kräver lyckat slag i Smyga och att offret misslyckas med Upptäcka fara. Skadebonus används inte. Resultat beror på lönnmördarens anfallsslag:

| Anfallsslag | Effekt |
|---|---|
| Fummel | misslyckas |
| Misslyckat | träffar ändå, normal skada (utan SB) |
| Lyckat | dubbel skada (utan SB) |
| Perfekt | fyrdubbel skada (utan SB) |

Endast mot humanoider som inte är mer än 2 meter längre än lönnmördaren.
**Möjliga yrkesfärdigheter:** En valfri vapenfärdighet, Tala ett valfritt främmande språk, Administration, Akrobatik, Dra vapen, Dolk, Förfalskning, Geografi, Giftkunskap, Hantera fällor, Hasardspel, Hypnotisera, Knopar, Kulturkännedom, Låsdyrkning, Muta, Simma, Skådespeleri, Stavhopp, Stridskonster, Teckenspråk, Trästav, Undre världen, Änterhake.

### 3.6 Magiker (s. 17). Krav INT 12, PSY 14
- Väljer bara **9** yrkesfärdigheter, men kan lära sig besvärjelser från början.
- Måste välja en magiskola (animism, elementarmagi eller mentalism) som yrkesfärdighet. Nio ytterligare skolor finns i "Drakar och Demoner Magi".
- Har svårt att lära sig annat, t.ex. vapen: inga vapenfärdigheter i listan (kan läras senare som vanliga sekundära, grundkostnad 5).
- Känna magi är primär för magiker (se 5.8). Kunskap om magi får magikern automatiskt (= högsta FV i en magiskola).
**Yrkesförmåga:** ingen.
**Möjliga yrkesfärdigheter:** Tala maximalt tre valfria främmande språk, Läsa/Skriva maximalt tre valfria främmande språk, Alkemi, Astrologi, Djurhelning, Djurträning, Drogkunskap, Geografi, Giftkunskap, Kulturkännedom, Kunskap om demoner, Kunskap om magi, Kunskap om odöda, Magisk kanalisering, en valfri Magiskola, Räkning, Simma, Språkkunskap, Trästav, Zoologi, Örtkunskap.

### 3.7 Munk (s. 18). Krav INT 12, PSY 12
**Yrkesförmåga:** meditera en hel SR (gör inget annat) = +1 FV i valfri färdighet. Kumulativt över flera SR i rad, men aldrig mer än dubbla ursprungliga FV. Gäller ett enda färdighetsslag, som måste göras inom 1 minut efter att meditationen avslutats.
**Möjliga yrkesfärdigheter:** Tala maximalt tre valfria främmande språk, Läsa/Skriva maximalt tre valfria främmande språk, Avväpna, Djurhelning, Dolk, Drogkunskap, Förfalskning, Geografi, Giftkunskap, ett valfritt Hantverk, Heraldik, Historia, Knopar, Kulturkännedom, Kunskap om demoner, Kunskap om magi, Kunskap om odöda, Läkekonst, Massage, Målning, Räkning, Simma, Spela maximalt två valfria instrument, Språkkunskap, Stridskonster, Trästav, Zoologi, Örtkunskap.
Avvikelse: Färdighetstabellen och Dolk-beskrivningen ger inte Munk Dolk.

### 3.8 Sjöfarare (s. 19). Krav FYS 12, SMI 12
**Yrkesförmåga:** +5 på FYS, STO eller STY vid alla motståndsslag mot besvärjelser som rör elementen eller mot "naturliga" element (eldsvådor, iskyla m.m.).
**Möjliga yrkesfärdigheter:** Maximalt tre valfria vapenfärdigheter, Tala maximalt tre valfria främmande språk, Läsa/Skriva ett valfritt främmande språk, Akrobatik, Dans, Dolk, Geografi, ett valfritt Hantverk, Hasardspel, Gyckelkonster, Knopar, Kulturkännedom, Muta, Navigation (= Navigera), Orientering, Schack & brädspel, Simma, Sjökunnighet, Spela maximalt två valfria instrument, Spå väder, Stavhopp, Trästav, Undre världen, Änterhake.

### 3.9 Riddare (s. 20). Krav STY 14, FYS 12, PSY 12
Överklasskrigare med ideal (skydda svaga, lojalitet, hövlighet). Den som inte följer idealen ska vara krigare.
**Yrkesförmåga:** spendera 5 PSY-poäng för att antingen (1) träffa valfri kroppsdel utan avdrag på CL (om detaljerad strid används), eller (2) göra maximal skada med vapnet inklusive maximal skadebonus. Rustningens absorbering dras av som vanligt och slaget kan pareras som vanligt. Utan detaljerad strid gäller alltid alternativ 2. PSY återfås normalt (kapitlet Magi).
**Möjliga yrkesfärdigheter:** Maximalt fem valfria vapenfärdigheter, Tala ett valfritt främmande språk, Läsa/Skriva ett valfritt främmande språk, Administration, Avväpna, Dans, Djurträning, Dra vapen, Dolk, Geografi, Heraldik, Historia, Kulturkännedom, Kunskap om magi, Kunskap om odöda, Målning, Räkning, Schack & brädspel, Simma, Spela maximalt två valfria instrument, Språkkunskap, Trästav, Två vapen.

### 3.10 Tjuv (s. 21). Krav SMI 16
**Yrkesförmåga:** spendera PSY-poäng för +1 CL per poäng på valfri färdighet, max +3 per gång. Max 2 användningar mellan varje sovperiod om 8 timmar (4 timmar för alver). PSY återfås normalt (kapitlet Magi).
**Möjliga yrkesfärdigheter:** Maximalt två valfria vapenfärdigheter, Tala ett valfritt främmande språk, Administration, Akrobatik, Buktala, Dra vapen, Dolk, Drogkunskap, Förfalskning, Geografi, Giftkunskap, Hypnotisera, Gyckelkonster, Knopar, Kulturkännedom, Låsdyrkning, Läppläsning, Muta, Räkning, Simma, Skådespeleri, Spela maximalt två valfria instrument, Stavhopp, Teckenspråk, Trästav, Undre världen, Änterhake.
Avvikelse: Färdighetstabellen ger Tjuv även **Hantera fällor** och **Hasardspel** men inte **Drogkunskap**. Färdighetsbeskrivningarna stämmer med tabellen (Hantera fällor och Hasardspel listar Tjuv; Drogkunskap gör det inte).

### 3.11 Utbygdsjägare (s. 22). Krav FYS 12, SMI 12, PSY 12
**Yrkesförmåga (Animism):** kan lära sig magiskolan Animism som yrkesfärdighet, och alla allmänna besvärjelser och animism-besvärjelser med skolvärde **12 eller lägre**. Kan **inte** lära sig besvärjelser från början.
**Möjliga yrkesfärdigheter:** Maximalt tre valfria vapenfärdigheter, Tala ett valfritt främmande språk, Animism, Djurhelning, Djurträning, Dolk, Drogkunskap, Geografi, Geologi, Giftkunskap, ett valfritt Hantverk, Hantera fällor, Knopar, Kulturkännedom, Orientering, Simma, Spå väder, Zoologi, Örtkunskap, Överlevnad.
Avvikelse: Färdighetstabellen (och Trästav "Yrken: Alla") ger även Trästav.

---

## 4. Rollpersonens värden

### 4.1 Kön (s. 23)
Man eller kvinna. Ingen regeleffekt alls.

### 4.2 Grundegenskaper (s. 23-24)
Köp värde 3-18 för BP, lägg **sedan** på rasmodifikationen (så slutvärdet kan bli över 18, t.ex. alv SMI 15 + 3 = 18, eller mer).

| Värde du vill köpa | Pris i BP |
|---|---|
| 3 | 0 |
| 4 | 1 |
| 5 | 2 |
| 6 | 3 |
| 7 | 5 |
| 8 | 7 |
| 9 | 9 |
| 10 | 10 |
| 11 | 11 |
| 12 | 12 |
| 13 | 14 |
| 14 | 17 |
| 15 | 20 |
| 16 | 25 |
| 17 | 30 |
| 18 | 40 |

Yrkeskravet kontrolleras mot värdet efter rasmodifikation (exemplet: alv köper SMI 9 för att nå 12).

**STO** köps inte med tabellen ovan. Alla har rasens normalvärde gratis. Större kostar BP, mindre ger BP. Måste ligga inom rasens min-max.

| Önskad modifikation | Kostnad i BP |
|---|---|
| +1 | 2 |
| +2 | 4 |
| +3 | 6 |
| +4 | 8 |
| +5 | 10 |

| Önskad modifikation | Extra BP |
|---|---|
| -1 | +1 |
| -2 | +2 |
| -3 | +3 |
| -4 | +5 |
| -5 | +7 |

Exempel: människa (8-18, normal 13): STO 17 kostar 8 BP; STO 9 ger 5 BP.

### 4.3 Kroppspoäng (s. 24)
- **Totala KP = (FYS + STO) / 2, avrundat uppåt.**
- Skada dras både från den träffade kroppsdelen och från totala KP.
- KP i en kroppsdel = 0: kroppsdelen ur funktion.
- Totala KP = 0: medvetslös, riskerar att förblöda och dö.
- KP per kroppsdel läses ur tabellen med totala KP som kolumn.

**Kroppspoängstabell**

| Träffområde | 5-7 | 8-11 | 12-15 | 16-20 | 21-25 | 26-30 | 31-35 | 36-40 | +5 |
|---|---|---|---|---|---|---|---|---|---|
| Bröstkorg | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | +1 |
| Höger ben | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | +1 |
| Vänster ben | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | +1 |
| Mage | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | +1 |
| Höger arm | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | +1 |
| Vänster arm | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | +1 |
| Huvud | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | +1 |

Kolumnen "+5" = för varje ytterligare 5 totala KP över 40, +1 i varje kroppsdel.

Sluten form (stämmer med alla kolumner): låt T = totala KP och
`k = 0 om T 5-7; 1 om T 8-11; 2 om T 12-15; 3 + floor((T - 16) / 5) om T >= 16`.
Då är Bröstkorg = 4 + k; Höger ben = Vänster ben = Mage = Huvud = 3 + k; Höger arm = Vänster arm = 2 + k.
Tabellen täcker inte T < 5 (boken anger inget).

Exempel ur boken: FYS 15, STO 11 ger 13 KP, kolumn 12-15.
Träfftabellen (vilken kroppsdel som träffas) finns **inte** i denna bok (kapitlet Strid).
Särskild förmåga 65 "Extremt smärttålig": totala KP x 1,5, och kroppsdelarnas KP räknas om därefter.

### 4.4 Skadebonus (s. 25)
SB läggs till skadan i närstrid. Läses på STY + STO.

| STY+STO | SB |
|---|---|
| 1-26 | ingen |
| 27-29 | +1 |
| 30-32 | +1T2 |
| 33-40 | +1T4 |
| 41-50 | +1T6 |
| 51-60 | +1T10 |
| 61-80 | +2T6 |
| 81-100 | +3T6 |
| 101-140 | +4T6 |
| 141-180 | +5T6 |

### 4.5 Förflyttning (s. 25)
Antal rutor per stridsrunda (SR). 1 ruta = 1,5 m, 1 SR ungefär 5 sekunder. Läses på STO + FYS + SMI, plus rasmodifikation.

| STO+FYS+SMI | Förflyttning |
|---|---|
| 0-11 | 7 |
| 12-20 | 8 |
| 21-29 | 9 |
| 30-38 | 10 |
| 39-47 | 11 |
| 48-56 | 12 |
| 57-65 | 13 |
| 66-74 | 14 |
| 75-83 | 15 |
| 84-92 | 16 |
| för varje ytterligare +8 | +1 |

| Rasmodifikation | |
|---|---|
| Anka | -2 |
| Alv | +1 |
| Dvärg | -2 |
| Halvlängdsman | -2 |
| Övriga | ±0 |

Sluten form för S >= 12: `8 + floor((S - 12) / 9)` för S 12-92 (stämmer med tabellen); för S > 92 anger boken "+1 per ytterligare 8", alltså 93-100 = 17, 101-108 = 18 osv. (tolkning av "+8").
Exempel: alv 11+15+18 = 44 ger 11, +1 = 12.
Smyga: max halva hastigheten. Simma har egen förflyttning (se Simma).

### 4.6 Särskilda förmågor (s. 25-26)
Spendera minst 1 BP, max effektivt +40. Slå **2T20 + BP** en gång. SL får justera resultat som inte passar yrket. Får man FV i en sekundär färdighet har man den från start men får inte höja den med startfärdighets-EP. "Förbjudna färdigheter" = magiskolor för fel yrke.

| 2T20+BP | Förmåga |
|---|---|
| 3-4 | +1 på FV på valfri sekundär färdighet (utom förbjudna färdigheter). |
| 5-6 | Sjöfararbakgrund. +2 på FV i Sjökunnighet och Navigera. |
| 7-8 | Starka vrister. +3 på FV på Hoppa. |
| 9-10 | Bråkig uppväxt. +3 på FV i Slagsmål. |
| 11-12 | Hantverkarbakgrund. +3 på FV i valfri hantverksfärdighet (läderarbete, smide, träsnideri eller liknande). |
| 13-14 | Smidig kropp. +3 på FV i Akrobatik. |
| 15-16 | Köpmannabakgrund. +3 på FV i Värdera. |
| 17-18 | God koordinationsförmåga. +3 på FV i Två vapen. |
| 19-20 | Hobbyist. FV 3 i en valfri sekundär färdighet, som man då får lära sig från början. Inte förbjuden färdighet. |
| 21-22 | Starka nypor. Alltid +3 på CL i Klättra. |
| 23-24 | Mottagligt medium. Alltid +5 på CL i Magisk kanalisering som passiv part. |
| 25-26 | Hängiven student. +2 på valfritt FV. Om färdigheten har ett max-FV höjs även detta med 2. Inte förbjuden färdighet. |
| 27-28 | Övertygande tonfall. Alltid +3 på CL i Övertala och Muta. |
| 29-30 | Sjätte sinne. +1 på FV i Upptäcka fara och Finna dolda ting. |
| 31-32 | Stirrande blick. Alltid +5 på CL i Hypnotisera. |
| 33-34 | Magikänsla. Alltid +5 på CL i Känna magi. |
| 35-36 | Gott språksinne. Automatiskt FV 20 (B5) i att Tala och Läsa/Skriva ett valfritt språk. |
| 37-38 | Stort kunskapsområde. Välj ytterligare två valfria sekundära färdigheter som yrkesfärdigheter. |
| 39-40 | God bågskytt. Alla räckvidder för alla projektilvapen +25 %. |
| 41-42 | Absolut gehör. Grundkostnaden för Spela instrument och Sjunga är alltid 1. |
| 43-44 | Precisionssinne. CL +1 på alla vapenfärdigheter. |
| 45-46 | Dubbelhänt (se Svärdshand). |
| 47-48 | God tidskänsla. Vet alltid klockan på 10 minuter när; bedömer 2 minuter på 5 sekunder när. |
| 49-51 | Absolut ögonmått. Bedömer avstånd med 5 % felmarginal. |
| 52-54 | Mycket uppmärksam. Alltid +2 på CL i Finna dolda ting och Upptäcka fara. |
| 55 | Blixtrande reflexer. +3 på alla initiativslag. |
| 56 | Bärsärk. +5 på FV i Bärsärkagång. |
| 57 | Gott balanssinne. +5 på SMI vid alla balansakter och för att landa på fötterna efter fall. |
| 58 | Hästarnas herre. +10 på FV i Rida; kan aldrig bli avkastad (men kan trilla av). |
| 59 | Ambidextriös (se Svärdshand). |
| 60 | Djurvän. Blir aldrig anfallen av vanliga djur, vilda eller tama. |
| 61 | Turgubbe. Kan alltid höja en CL med +1 genom att spendera 1 PSY-poäng (max 1 poäng per slag). PSY återfås normalt. |
| 62 | Magisk empati. Om PSY övervinner antalet effektgrader lagrade i ett magiskt föremål identifieras automatiskt alla besvärjelser och deras effektgrader. |
| 63 | Gudarnas gunstling. Varje gång KP når noll: 25 % chans att guden återställer alla KP. Kritiska skador läks inte så. |
| 64 | Lättlärd. Grundkostnaden för sekundära färdigheter blir 4 poäng. |
| 65 | Extremt smärttålig. Totala KP x 1,5; ändrar även träffområdenas KP. |
| 66 | Snabbslående. Slår alltid först i varje SR. Möter man en annan med samma förmåga slår ni om initiativet som vanligt. |
| 67 | Baneman. +5 på CL vid alla attacker mot en vald ras eller ett folkslag. |
| 68 | God kroppskontroll. Lyckat Normalt FYS-slag: +5 på STY och alla STY-baserade färdigheter i 3 SR. Max 2 gånger per dag. |
| 69 | Järnnäve. Alltid maximal skada i obeväpnad strid. |
| 70 | Extremt orädd. -5 på alla slag på Skräcktabellen. |
| 71 | Orubblig vilja. +5 på PSY vid alla slag PSY mot PSY på Motståndstabellen. |
| 72 | Härdig mot element. +5 på FYS vid alla Motståndsslag mot eld, köld, vatten, vind etc. |
| 73 | Gott läkekött. KP-förluster från fysiskt våld eller elementarbesvärjelser läker dubbelt så fort. |
| 74 | God mental kontroll. PSY förbrukad av besvärjelser återfås på halva tiden. Icke-magiker: räknas som 73. |
| 75 | Naturlig färdighet med vapen. FV +5 på en valfri vapenfärdighet. |
| 76 | Kluven personlighet. Får dessutom välja yrkesförmågan från vilket annat yrke som helst. |
| 77 | God känsla för yrket. Kostnaden för att lära sig en av sina besvärjelser eller en av sina yrkesfärdigheter halveras alltid (avrunda uppåt), efter multiplikation av grundkostnaden. |
| 78 | Hamnbytare. Kan förvandla sig till (1T6): 1 varg, 2 björn, 3 hök, 4 hjort, 5 svan, 6 katt. Övertar djurets alla egenskaper utom INT och INT-baserade färdigheter (ej besvärjelser). Tar 1 SR, varar så länge man vill. För varje timme över normala PSY-värdet: Normalt PSY-slag, annars för alltid fast. (Mer i DoD Monster.) |
| 79 | Snabb uppfattningsförmåga. +5 på CL på alla vapenpareringar i närstrid, och kan parera projektiler man ser komma (med närstridsvapen i handen; CL = FV i vapnet). |
| 80 | God PSY-potential. Alltid -5 på tärningsslaget vid försök att höja PSY. Resultat 0 eller lägre räknas som 1. |
| 81+ | Höjd grundegenskap. +1 på tre olika valfria grundegenskaper eller +2 på en. |

### 4.7 Svärdshand (s. 27)
Svärdshand = den vanliga handen, sköldhand = den andra. Sköldhanden är genomgående sämre, utom för Två vapen och Sköld (effekten beskrivs inte i siffror i denna bok). Slå **2T6 + BP**.

| 2T6+BP | Svärdshand |
|---|---|
| 2-11 | Höger |
| 12-14 | Vänster |
| 15-18 | Dubbelhänt |
| >=19 | Ambidextriös |

Dubbelhänt: båda händerna lika bra, men inte samtidigt. Ambidextriös: båda samtidigt till olika saker. Har man fått någon av dem som särskild förmåga slår man inte.

### 4.8 Socialt stånd och Startkapital (s. 27)
Socialt stånd: **2T6 + BP**.

| 2T6+BP | Socialt stånd |
|---|---|
| 2 | Egendomslös (träl, slav, straffånge, tiggarmunk, livegen, galärslav) |
| 3-4 | Lägre underklass (tiggare, latrintömmare, gravgrävare) |
| 5-7 | Högre underklass (lärling, gesäll, novis) |
| 8-11 | Lägre medelklass (grovhantverkare, arbetande köpman, stadsvakt) |
| 12-16 | Högre medelklass (finhantverkare, köpman, präst, självägande bonde) |
| 17-22 | Lägre överklass (rådsman, hovfolk, hantverksmäster) |
| 23-29 | Högre överklass (borgmästare, skråmästare, gillesmästare, riksämbetsman) |
| 30-37 | Lågadel (riddare, friherre, baron, markis, jarl, biskop) |
| >=38 | Högadel (greve, hertig, prins, kardinal, påve, kung, kejsare) |

Startkapital: **2T6 + BP på startkapital + ceil(BP på socialt stånd / 2)**. Slutsumman kan aldrig bli mer än 10 över slutsumman för socialt stånd. Multipliceras sedan med ålderns multipel (4.9). sm = silvermynt.

| 2T6+BP | Startkapital |
|---|---|
| 2 | 200 sm |
| 3-4 | 400 sm |
| 5-7 | 600 sm |
| 8-11 | 1.000 sm |
| 12-16 | 2.000 sm |
| 17-22 | 3.000 sm |
| 23-29 | 5.000 sm |
| 30-37 | 10.000 sm |
| 38-46 | 20.000 sm |
| 47-56 | 30.000 sm |
| >=57 | 50.000 sm |

### 4.9 Ålder (s. 28)
Kvarvarande BP x 5 läggs till EP för startfärdigheter. Åldern modifierar grundegenskaperna (yrkeskraven gäller inte längre), ger EP, multiplicerar startkapitalet och sätter max-FV vid skapandet. Ålder väljs fritt.

| | Ung | Mogen | Medelålders | Gammal |
|---|---|---|---|---|
| STY | -1 | ±0 | -2 | -5 |
| FYS | +1 | ±0 | -1 | -3 |
| SMI | +1 | ±0 | -1 | -3 |
| INT | ±0 | ±0 | +1 | +1 |
| PSY | -1 | ±0 | +2 | +4 |
| KAR | ±0 | ±0 | +1 | +1 |
| STO | ±0 | ±0 | ±0 | ±0 |
| EP | 150 | 200 | 250 | 300 |
| Startkapital | x1 | x1,5 | x2 | x2,5 |
| Max FV från start | 13 | 15 | 17 | 19 |
| Anka | 16-20 | 21-40 | 41-60 | 61-80 |
| Dvärg | 21-40 | 41-155 | 151-250 | 251-400 |
| Halvalv | 30-40 | 41-70 | 71-100 | 101-130 |
| Halvl.man | 20-30 | 31-60 | 61-75 | 76-100 |
| Halvorch | 12-18 | 19-30 | 31-45 | 46-55 |
| Människa | 16-20 | 21-45 | 46-60 | 61-80 |

Dvärg "Mogen 41-155" står så i källan (överlappar 151-250; texten säger "medelålders dvärg 151-250 år").
**Alver:** räknas som Unga för EP (150) och startkapital (x1), men som Mogna för grundegenskapsmodifikationer (±0) och max-FV från start (15). Åldras inte; ingen åldersrad i tabellen.

### 4.10 Startfärdigheter (s. 28-30)
Startfärdigheter = alla primära färdigheter + de valda yrkesfärdigheterna. Sekundära färdigheter kan inte läras från början (utom via särskild förmåga). Magiker kan lära sig besvärjelser från början; utbygdsjägare inte.

**Baschans (BC)**: gratis FV från grundegenskapen som färdigheten bygger på. Ges i alla primära färdigheter och alla yrkesfärdigheter, inte i besvärjelser. Tala och Läsa/Skriva modersmål har egna regler (5.7).

| Grundegenskapsvärde | BC |
|---|---|
| 1-3 | 0 |
| 4-8 | 1 |
| 9-12 | 2 |
| 13-16 | 3 |
| 17-20 | 4 |
| >20 | 5 |

Rasbonusar (t.ex. alv +4 Upptäcka fara) läggs ovanpå BC (exempel: BC 3 + 4 = FV 7).

**Grundkostnad i EP per FV-steg:**
- Primär färdighet: 2
- Yrkesfärdighet: 3
- Sekundär färdighet: 5 (4 med särskild förmåga Lättlärd)
- Besvärjelse: enligt skolvärde (tabell nedan)
- Stridskonster: summan av teknikernas kostnad (5.9, Stridskonster)

**Kostnad = grundkostnad x multipel.** Multipeln läses med raden "FV du har" och kolumnen "FV du vill köpa".

| FV du har | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 12 | 14 | 16 | 18 | 21 | 24 | 27 | 31 | 35 | 39 | 44 |
| 1 | - | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 11 | 13 | 15 | 17 | 20 | 23 | 26 | 30 | 34 | 38 | 43 |
| 2 | - | - | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 10 | 12 | 14 | 16 | 19 | 22 | 25 | 29 | 33 | 37 | 42 |
| 3 | - | - | - | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 9 | 11 | 13 | 15 | 18 | 21 | 24 | 28 | 32 | 36 | 41 |
| 4 | - | - | - | - | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 14 | 17 | 20 | 23 | 27 | 31 | 35 | 40 |
| 5 | - | - | - | - | - | 1 | 2 | 3 | 4 | 5 | 7 | 9 | 11 | 13 | 16 | 19 | 22 | 26 | 30 | 34 | 39 |
| 6 | - | - | - | - | - | - | 1 | 2 | 3 | 4 | 6 | 8 | 10 | 12 | 15 | 18 | 21 | 25 | 29 | 33 | 38 |
| 7 | - | - | - | - | - | - | - | 1 | 2 | 3 | 5 | 7 | 9 | 11 | 14 | 17 | 20 | 24 | 28 | 32 | 37 |
| 8 | - | - | - | - | - | - | - | - | 1 | 2 | 4 | 6 | 8 | 10 | 13 | 16 | 19 | 23 | 27 | 31 | 36 |
| 9 | - | - | - | - | - | - | - | - | - | 1 | 3 | 5 | 7 | 9 | 12 | 15 | 18 | 22 | 26 | 30 | 35 |
| 10 | - | - | - | - | - | - | - | - | - | - | 2 | 4 | 6 | 8 | 11 | 14 | 17 | 21 | 25 | 29 | 34 |
| 11 | - | - | - | - | - | - | - | - | - | - | - | 2 | 4 | 6 | 9 | 12 | 15 | 19 | 23 | 27 | 32 |
| 12 | - | - | - | - | - | - | - | - | - | - | - | - | 2 | 4 | 7 | 10 | 13 | 17 | 21 | 25 | 30 |
| 13 | - | - | - | - | - | - | - | - | - | - | - | - | - | 2 | 5 | 8 | 11 | 15 | 19 | 23 | 28 |
| 14 | - | - | - | - | - | - | - | - | - | - | - | - | - | - | 3 | 6 | 9 | 13 | 17 | 21 | 26 |
| 15 | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | 3 | 6 | 10 | 14 | 18 | 23 |
| 16 | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | 3 | 7 | 11 | 15 | 20 |
| 17 | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | 4 | 8 | 12 | 17 |
| 18 | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | 4 | 8 | 13 |
| 19 | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | 4 | 9 |
| 20+ | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | 5 |

Sluten form (kontrollerad mot varje cell): multipel(från a till b) = `C[b] - C[a]`, där
`C = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 16, 18, 21, 24, 27, 31, 35, 39, 44]` för FV 0-21.
Alltså per steg: FV 1-10 multipel 1 vardera, 11-14 multipel 2, 15-17 multipel 3, 18-20 multipel 4, 21 multipel 5. Raden "20+" antyder (tolkning) att varje steg över 20 kostar multipel 5; boken ger inga kolumner över 21.

Bokens exempel: Klättra 4 till 10 (primär) = 2 x 6 = 12 EP. Hantera fällor 4 till 11 (yrke) = 3 x 8 = 24 EP. Långbåge 4 till 15 = 3 x 17 = 51 EP.

Begränsningar vid skapandet: max-FV enligt ålder (om inte särskild förmåga säger annat); inga EP i sekundära färdigheter (även en sekundär man fått via särskild förmåga får inte höjas).

**Besvärjelser, grundkostnad efter skolvärde** (bara magiker från start):

| Skolvärde | Grundkostnad |
|---|---|
| 1-3 | 2 |
| 4-6 | 4 |
| 7-9 | 6 |
| 10-12 | 8 |
| 13-15 | 10 |
| 16-18 | 12 |
| 19-21 | 14 |
| för varje ytterligare +3 | +2 |

Exempel: KNÄCKA (SV 6, grundkostnad 4) S 7 till 10 = 4 x 3 = 12 EP. FÖRSTENA (SV 19, grundkostnad 14) S 7 till 10 = 42 EP.

### 4.11 Utseende och personlig bakgrund (s. 31)
Fritt, utan siffror. Inga regler.

### 4.12 Ett enklare framslagningssystem (s. 32)
Alternativ med tärningar i stället för BP (även för SLP).

| Steg | Regel |
|---|---|
| Ras | Bestäm själv. |
| Yrke | Bestäm själv. |
| Grundegenskaper | Alla sju slås med rasens tärningar (anges i kapitlet Varelser, **inte i denna bok**). Slå tre kompletta uppsättningar, välj en. Får flytta poäng 2:1 (sänk en egenskap 2 eller två egenskaper 1 vardera för att höja en med 1). Aldrig över rasens maxvärde (människa STY 3T6: max 18). Yrkeskraven måste uppfyllas. |
| Kön | Bestäm själv. |
| KP, SB, förflyttning | Som vanligt. |
| Särskild förmåga | 2T20 + 1T10 i stället för 2T20 + BP. |
| Svärdshand | 2T4 i stället för 2T6 + BP. Om båda visar samma, slå 1T4 till och lägg till; om även den visar samma, ytterligare 1T4 osv. |
| Socialt stånd | 2T6. Om båda visar samma, slå 2T6 till och lägg till; om även dessa är lika, ytterligare 2T6 osv. |
| Startkapital | Samma metod som socialt stånd. Resultatet får inte vara mer än 10 under eller 10 över socialt stånds slutresultat. |
| Ålder | Bestäm själv. |
| Startfärdigheter | EP enligt ålder, +25, minus rasens BP-kostnad. Alv alltid 150; Ung anka 150+25+0 = 175; Medelålders människa 250+25-10 = 215. |

---

## 5. Färdigheter (s. 34-62)

### 5.1 Allmänt (s. 35)
FV normalt 1-20. FV + alla situationsmodifikationer = **Chans att lyckas (CL)**.
Varje beskrivning har: Namn, Typ (primär/sekundär, ev. kategori B), Yrken (för sekundära; siffra inom parentes = max antal ur gruppen), Grundegenskap, Beskrivning.

### 5.2 Färdighetskategorier (s. 35)
**Kategori A** (omärkt): skala 1-20 (högre möjligt men ovanligt). Färdighetsslag med 1T20.

**Kategori B**: FV omvandlas vid användning till B-FV 0-5. Oftast inget slag ("kan eller kan inte"). Slag görs som för A bara när slumpen verkligen avgör, t.ex. om rollpersonen är sinnesförvirrad (drog, slag i huvudet), under stress eller press, eller lider av minnesdefekter. B-färdigheter förbättras precis som A, men **bara genom träning**, inte genom erfarenhet i äventyr (s. 63).

| FV | B-FV |
|---|---|
| 0 | B0 |
| 1-4 | B1 |
| 5-10 | B2 |
| 11-15 | B3 |
| 16-19 | B4 |
| 20+ | B5 |

Allmän tolkning av B-nivåer när färdigheten inte anger egna:

| B-FV | Kunskap |
|---|---|
| 0 | Inga kunskaper alls |
| 1 | Obetydliga kunskaper: bara det mest grundläggande |
| 2 | Små kunskaper: stora luckor, måste slå i böcker för detaljer, god inblick i stora drag |
| 3 | Goda kunskaper: välorienterad, ej överkurs |
| 4 | Mycket goda kunskaper: kan bli lärare, nästan fullärd |
| 5 | Expertkunskaper: kan svara på alla frågor om ämnet |

### 5.3 Färdighetstabellen (s. 36)

**Primära färdigheter** (alla har dem, BC från grundegenskapen, grundkostnad 2, obegränsat FV):

| Färdighet | Grundegenskap | Kat. | Sida |
|---|---|---|---|
| Bluffa | KAR | A | 40 |
| Finna dolda ting | INT | A | 40 |
| Första hjälpen | INT | A | 40 |
| Gömma sig | INT | A | 40 |
| Hoppa | SMI | A | 40 |
| Klättra | SMI | A | 40 |
| Köpslå | KAR | A | 41 |
| Lyssna | INT | A | 41 |
| Läsa/Skriva modersmål | spec./INT | B | 42 |
| Rida | SMI | A | 42 |
| Sjunga | KAR | A | 43 |
| Slagsmål | STY | A | 43 |
| Smyga | SMI | A | 43 |
| Spåra | INT | A | 43 |
| Stjäla föremål | SMI | A | 44 |
| Tala modersmål | spec./INT | (B-skala, "Typ: Primär") | 44 |
| Upptäcka fara | PSY | A | 44 |
| Värdera | INT | A | 44 |
| Övertala | KAR | A | 44 |

Specialfall: Geologi är primär för dvärgar; Känna magi är primär för magiker.

**Sekundära färdigheter.** Matrisen är exakt som i boken. `x` = kan väljas som yrkesfärdighet; siffra = max antal ur gruppen; `F` = förbjuden (streck i boken); `*` = se utbygdsjägarens yrkesförmåga; `†` = se färdigheten. Kolumnen "Kat." är hämtad ur respektive färdighetsbeskrivning ("Typ: Sekundär, B"). Grundkostnad: 3 om yrkesfärdighet, annars 5.

Kolumner: Bard, Hel = Helare, Kri = Krigare, LMa = Lärd man, Löm = Lönnmördare, Mag = Magiker, Mun = Munk, Sjö = Sjöfarare, Rid = Riddare, Tju = Tjuv, Jäg = Utbygdsjägare.

| Färdighet (grundegenskap) | Kat. | Bard | Hel | Kri | LMa | Löm | Mag | Mun | Sjö | Rid | Tju | Jäg |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Vapenfärdigheter (var.) | A | 1 | | x | | 1 | | | 3 | 5 | 2 | 3 |
| Tala främ. språk (INT) | B | 2 | 2 | 1 | 4 | 1 | 3 | 3 | 3 | 1 | 1 | 1 |
| L/S främ. språk (INT) | B | 1 | 1 | | 4 | | 3 | 3 | 1 | 1 | | |
| Administration (INT) | B | x | | | x | x | | | | x | x | |
| Akrobatik (SMI) | B | x | | | | x | | | x | | x | |
| Alkemi (INT) | A | | x | | x | | x | | | | | |
| Astrologi (INT) | A | | | | x | | x | | | | | |
| Avväpna (SMI) | A | | | x | | | | x | | x | | |
| Buktala (PSY) | A | x | | | | | | | | | x | |
| Bärsärkagång (PSY) | A | | | x | | | | | | | | |
| Dans (SMI) | A | x | | | | | | | x | x | | |
| Djurhelning (INT) | A | | x | | | | x | x | | | | x |
| Djurträning (PSY) | A | x | | | | | x | | | x | | x |
| Dolk (SMI) | A | x | | x | x | x | | | x | x | x | x |
| Dra vapen (SMI) | A | | | x | | x | | | | x | x | |
| Drogkunskap (INT) | A | | x | | x | | x | x | | | | x |
| Förfalskning (INT) | A | x | | | x | x | | x | | | x | |
| Geografi (INT) | B | x | x | x | x | x | x | x | x | x | x | x |
| Geologi (INT) | B | | | | x | | | | | | | x |
| Giftkunskap (INT) | A | | x | | x | x | x | x | | | x | x |
| Hantera fällor (SMI) | A | | | | | x | | | | | x | x |
| Hantverk (var.) | B | 1 | 1 | 1 | | | | 1 | 1 | | | 1 |
| Hasardspel (PSY) | A | x | | x | x | x | | | x | | x | |
| Heraldik (INT) | B | x | | | x | | | x | | x | | |
| Historia (INT) | B | x | | | x | | | x | | x | | |
| Hypnotisera (PSY) | A | x | x | | | x | | | | | x | |
| Gyckelkonster (SMI) | B | x | | | | | | | x | | x | |
| Knopar (SMI) | A | x | | | | x | | x | x | | x | x |
| Kulturkännedom (INT) | B | x | x | x | x | x | x | x | x | x | x | x |
| K. om demoner (INT) | B | | x | | x | | x | x | | | | |
| K. om magi (INT) | B | | x | | x | | x | x | | x | | |
| K. om odöda (INT) | B | | x | | x | | x | x | | x | | |
| Känna magi (PSY) | A | | | | | | † | | | | | |
| Låsdyrkning (SMI) | A | x | | | | x | | | | | x | |
| Läkekonst (INT) | A | | x | | | | | x | | | | |
| Läppläsning (INT) | A | x | | | | | | | | | x | |
| Mag. kanal. (INT) | A | | | | | | x | | | | | |
| Magiskolor (INT) | A | F | F | F | F | F | x | F | F | F | F | * |
| Massage (SMI) | A | | x | | | | | x | | | | |
| Muta (KAR) | A | x | | | | x | | | x | | x | |
| Målning (SMI) | A | x | | | | | | x | | x | | |
| Navigation (INT) | A | | | | | | | | x | | | |
| Orientering (INT) | A | | x | | | | | | x | | | x |
| Räkning (INT) | B | | | | x | | x | x | | x | x | |
| Schack & bräd. (INT) | A | x | | | x | | | | x | x | | |
| Simma (SMI) | B | x | x | x | x | x | x | x | x | x | x | x |
| Sjökunnighet (INT) | A | | | | | | | | x | | | |
| Skådespeleri (KAR) | A | x | | | | x | | | | | x | |
| Spela instrum. (KAR) | A | x | | | | | | 2 | 2 | 2 | 2 | |
| Språkkunskap (INT) | B | x | x | | x | | x | x | | x | | |
| Spå väder (INT) | A | | | | | | | | x | | | x |
| Stavhopp (SMI) | A | | | | | x | | | x | | x | |
| Stridskonster (SMI) | A | | | x | | x | | x | | | | |
| Teckenspråk (INT) | A | | | | | x | | | | | x | |
| Trästav (SMI) | A | x | x | x | x | x | x | x | x | x | x | x |
| Två vapen (var.) | A | | | x | | | | | | x | | |
| Undre världen (INT) | B | | | | | x | | | x | | x | |
| Zoologi (INT) | B | | x | | x | | x | x | | | | x |
| Änterhake (SMI) | A | | | | | x | | | x | | x | |
| Örtkunskap (INT) | A | | x | | x | | x | x | | | | x |
| Överlevnad (INT) | A | | x | | | | | | | | | x |

"Navigation" i tabellen heter "Navigera" i beskrivningen. Avvikelser mellan tabellen och yrkeslistorna: se 3.2, 3.7, 3.10, 3.11.

### 5.4 Chans att lyckas (CL) och färdighetsslag (s. 37)
- CL = FV + alla modifikationer (färdighetens egna plus SL:s egna).
- **Färdighetsslag: 1T20 <= CL = lyckat.**
- Kategori B: oftast inget slag; annars som A.
- Fyra utfall: perfekt slag, lyckat, misslyckat, fummel.
- Så länge FV >= 1: slår man 1 har man alltid lyckats, slår man 20 har man alltid misslyckats, oavsett CL.
- FV 0 och CL <= 0: man måste slå två 1:or i rad för att lyckas.

**Perfekta slag och fummel** (observera att omslaget jämförs mot **FV**, inte CL):

| CL | Regel |
|---|---|
| CL < 1 | Kan inte slå perfekt. 20 = fummel. |
| CL 1-19 | Slår man 1: slå igen; omslag <= FV = perfekt (annars vanligt lyckat). Slår man 20: slå igen; omslag > FV = fummel (annars vanligt misslyckat). |
| CL >= 20 | 1 är alltid perfekt. Slår man 2: slå igen; omslag <= FV = perfekt. Fummel bara på två 20:or i rad. |

**Differensvärde** = CL - tärningsslaget (CL 17, slag 12 ger 5). Används av många färdigheter som grad av framgång. Ett misslyckat slag ger negativt differensvärde (Smyga-exemplet: Smyga 10, slag 18 ger fiendens Upptäcka fara +8).

**Dolda färdighetsslag**: SL slår, spelaren får inte veta utfallet (t.ex. Finna dolda ting, Upptäcka fara, Hantera fällor, Navigera, Geologi, Astrologi, Zoologi).

**Färdigheter och grundegenskaper**: tillfällig ändring av en grundegenskap ändrar CL i alla färdigheter som bygger på den lika mycket så länge effekten varar; CL blir aldrig lägre än 1 på detta sätt. Permanent ändring ändrar FV i de **primära färdigheterna och yrkesfärdigheterna** som bygger på egenskapen automatiskt; FV kan då bli hur högt eller lågt som helst, även 0.

Ej definierat i denna bok: "ett särskilt slag" (nämns i Drogkunskap, Giftkunskap, Örtkunskap som ett mellanläge mellan lyckat och perfekt).

### 5.5 Grundegenskapsslag (s. 37-38)
När ingen färdighet passar, slå mot lämplig grundegenskap (SMI undvika klippblock, FYS motstå gift, STO baxa dörr, STY bryta arm).
- Enkelt fall: **1T20 <= grundegenskapsvärdet**.
- Med svårighetsgrad (SG 1-25): korsa SG med grundegenskapen i Motståndstabellen; slå 1T20 <= värdet.

| Problem | SG |
|---|---|
| Mycket lätt | 1 |
| Lätt | 5 |
| Normalt | 10 |
| Svårt | 15 |
| Mycket svårt | 20 |
| Extremt svårt | 25 |

**Motståndstabellen** (rad = SG, kolumn = grundegenskapsvärde). `ok` = automatisk framgång, `†` = automatiskt misslyckande.

| SG | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | ok | ok | ok | ok | ok | ok | ok | ok | ok | ok | ok |
| 2 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | ok | ok | ok | ok | ok | ok | ok | ok | ok | ok |
| 3 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | ok | ok | ok | ok | ok | ok | ok | ok | ok |
| 4 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | ok | ok | ok | ok | ok | ok | ok | ok |
| 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | ok | ok | ok | ok | ok | ok | ok |
| 6 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | ok | ok | ok | ok | ok | ok |
| 7 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | ok | ok | ok | ok | ok |
| 8 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | ok | ok | ok | ok |
| 9 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | ok | ok | ok |
| 10 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | ok | ok |
| 11 | † | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | ok |
| 12 | † | † | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 |
| 13 | † | † | † | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 |
| 14 | † | † | † | † | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 |
| 15 | † | † | † | † | † | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 |
| 16 | † | † | † | † | † | † | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 |
| 17 | † | † | † | † | † | † | † | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 |
| 18 | † | † | † | † | † | † | † | † | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 |
| 19 | † | † | † | † | † | † | † | † | † | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 |
| 20 | † | † | † | † | † | † | † | † | † | † | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 |
| 21 | † | † | † | † | † | † | † | † | † | † | † | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |

Tabellen fortsätter ("osv") åt båda håll. **Sluten form (kontrollerad mot varje cell):** `X = G + 10 - SG`; X >= 20 automatisk framgång; X <= 0 automatiskt misslyckande; annars slå 1T20 <= X.

**Motståndstabellen för motstridiga värden ("A mot B").** Boken använder samma tabell när ett värde ska övervinna ett annat (Bluffa, Köpslå, Avväpna, Muta, PSY mot PSY, helarens PSY/2 mot giftets STY). Den aktiva parten är kolumnen (G), den passiva är raden (SG). Köpslå-exemplet bekräftar det: FV 9 mot FV 13 ger 9 + 10 - 13 = 6.

Bokens exempel: STY 11 mot SG 15 = 6. SMI 18 mot SG 20 = 8. FYS 15 mot giftets SG 5 = automatisk framgång (giftet gör då halv skada, 1T6 i stället för 2T6).

### 5.6 Att skapa egna färdigheter (s. 39)
Tillåtet; använd lämplig grundegenskap. Förslag i boken: Antropologi, Arkitektur, Metallurgi, Retorik, Paddla kanot, Köra vagn, Ro, Segla, Meditera, Åka skidor, Ornitologi, Mykologi, Åka skridskor, Mima, Hortologi, Osteologi, Militär taktik, Belägringsmaskiner, Botanik, Fysik, Kunskap om alver/dvärgar/svartfolk/drakar/älvfolk, Jordbruk, Matlagning, Skaldekonst, Astronomi, Mytologi, Dyka, Kalligrafi, Förklädnad, Provsmaka, Stadskännedom, Gå på lina, Spårtydning, Komponera musik, Förföra, Gömma föremål, Tigga, Kamouflera sig, Förhöra, Spela död, Göra upp eld, Jaga, Gruvdrift, Kartritning, Bota fobier, Mineralogi, Medicin, Skugga, Lyssna, Falkenteri, Spela kort, Vada, Bryta arm, Gladiatorspel, Duellera.

### 5.7 Primära färdigheter (s. 40-44)

**Bluffa** (KAR, s. 40). Lyckat slag = man kommer på en trovärdig lögn. Sedan Motståndstabellen: (KAR + FV Bluffa) mot målets INT. Lyckas: trodd, men kan genomskådas efter (värdet i tabellen - tärningsslaget) minuter. Perfekt på första slaget: inget tabellslag, aldrig genomskådad.

**Finna dolda ting** (INT, s. 40). Hitta dolda dörrar, personer, saker, fällor. SL slår alltid dolt. Fummel: tror motsatsen. Perfekt: mer information än efterfrågat. Misslyckat: hittar inget.

**Första hjälpen** (INT, s. 40). Lyckat = förband lagt, blödning stoppad. Läker inga KP.

**Gömma sig** (INT, s. 40). Om lyckat måste sökaren lyckas med Finna dolda ting, med den gömdes differensvärde draget från sökarens CL.

| Modifikationer för att gömma sig | |
|---|---|
| Kläder som kontrasterar mot bakgrunden | -4 |
| Kläder som smälter in i bakgrunden | +1 |
| Skymning/gryning | +2 |
| Natt | +5 |

Ljusbonus gäller inte mot varelser med mörkersyn (exemplet med orcher).

**Hoppa** (SMI, s. 40).
- Höjd med sats och volt över hindret: (FV + SMI) dm; utan: halva.
- Längd med sats: (FV + SMI) x 2 dm; utan: halva.
- Satsen måste vara dubbelt så lång som hoppet är långt eller högt.
- Fall: kan falla "FV + SMI x 2 dm" utan skada (troligen (FV+SMI) x 2, jämför Akrobatik); längre fall: dra av sträckan från fallhöjden.
- Otränad: dubbla sin längd horisontellt, halva sin längd vertikalt.
- Normalt inget slag; slag krävs i pressade lägen (beskjutning, våta kläder). Fummel får oftast ödesdigra följder.

**Klättra** (SMI, s. 40). Väggar, tak, repstegar, trädstammar, armgång. Tak- och bergsklättring kräver linor och öglor. Hastighet på trädstammar och träytor: (differensvärdet / 2) meter per SR. Misslyckat: kommer inte längre. Tre misslyckade i rad: avbryt och klättra ned. Fummel: tappar greppet. Perfekt: dubbelt så långt.

**Köpslå** (KAR, s. 41). Motståndstabellen: köparens FV Köpslå mot säljarens FV Köpslå. Vinner köparen sänks priset med (CL i tabellen - tärningsslaget) x 5 %. Exempel: 9 mot 13 ger CL 6, slag 3: -15 %.

**Lyssna** (INT, s. 41). SL summerar alla modifikationer. Positiv summa: hör automatiskt utan slag. 0 eller negativ: SL slår ett modifierat slag. Varje svar om ljudet (riktning, vad det är) kräver ett lyckat slag.

| Avstånd till ljudet | Modifikation |
|---|---|
| 0-2 m | +5 |
| 3-5 | +3 |
| 6-10 | +1 |
| 11-20 | ±0 |
| 21-50 | -1 |
| 51-75 | -3 |
| 76-150 | -5 |
| 151-250 | -8 |
| 251-400 | -11 |
| 401-600 | -15 |
| 601-1000 | -20 |
| 1000-2000 | -25 |
| 2000-3000 | -40 |

| Lyssnaren... | Modifikation |
|---|---|
| Slöar | -7 |
| Pratar | -5 |
| Viskar | -2 |
| Skriker | -10 |
| För oljud | -10 |
| Slåss | -10 |

| Andra faktorer | Modifikation |
|---|---|
| Medvind från ljudet | +1 till +5 |
| Motvind mot ljudet | -1 till -5 |

| Ljudkälla | Modifikation |
|---|---|
| Armborstskott | +2 |
| Bågskott | ±0 |
| Krossat glas | +2 |
| Kropp som slår i marken | ±0 |
| Dörr öppnas | ±0 |
| Dörr öppnas försiktigt | -3 |
| Försiktiga steg | -1 |
| Normala steg | ±0 |
| Springande steg | +1 |
| Svärdstrid | +5 |
| Knytnävsslag | +1 |
| Nysning | +1 |
| Snarkning | ±0 |
| Viskning | -3 |
| Prat | ±0 |
| Högljudd konversation | +2 |
| Skrik | +5 |
| Explosion | +20 |

**Läsa/Skriva modersmål** (Primär, B; speciell/INT, s. 42). BC beror på socialt stånd och INT:

| Socialt stånd | BC |
|---|---|
| Överklass el. adel (INT 15+) | 20 |
| Överklass el. adel (INT 1-14) | 16 |
| Högre medelklass (INT 15+) | 16 |
| Högre medelklass (INT 1-14) | 11 |
| Lägre medelklass (INT 15+) | 11 |
| Lägre medelklass (INT 1-14) | 5 |
| Högre underklass (INT 15+) | 5 |
| Högre underklass (INT 1-14) | 1 |
| Övriga (INT 15+) | 1 |
| Övriga (INT 1-14) | 0 |

Språk per ras: se avsnitt 2. Nivåbeskrivningar: se Läsa/Skriva främmande språk.

**Rida** (SMI, s. 42). Slag krävs vid avancerade handlingar (hoppa, galoppera, strida till häst). Misslyckat: faller av, vanlig fallskada, ingen reduktion för Akrobatik eller Hoppa. Hoppa av i full fart frivilligt: lyckat Akrobatik räcker. Fummel: faller av, dubbel fallskada. Strid till häst kräver specialtränad häst (styr med en hand och skänklarna). Vanlig ridhäst när en annan häst rider rakt mot den: slag krävs; misslyckat = hästen skenar i slumpvis riktning. Stoppa skenande häst: slag med halverad CL; misslyckas man även med ohalverad CL kastas man av. Eld, explosioner, drakar, stora rovdjur: hästen måste klara INT-slag OCH ryttaren ett färdighetsslag.

**Sjunga** (KAR, s. 43). Skriva, minnas och framföra sånger. Förslag: höjer KAR i åhörarnas ögon +1 (lyckat) eller +3 (perfekt).

**Slagsmål** (STY, s. 43). Obeväpnad strid (om man inte har en Stridskonst). Omfattar Knytnäve och Spark. Fungerar som strid med vapen. **En attack med vardera näven i samma SR.** Skadevärden för knytnäve och spark står i kapitlet Strid (inte här).

**Smyga** (SMI, s. 43). Slå; differensvärdet modifierar CL för den som försöker upptäcka med Upptäcka fara (observatörens CL - smygarens differensvärde). Max halva normala hastigheten. Extra försiktigt: en fjärdedel av gånghastigheten, -5 på färdighetsslaget (alltså lättare). Ett slag per minut.

| Smygtabell: omständighet | CL-modifikation |
|---|---|
| Regn* | +1 till +5 |
| Åska | +10 |
| Vind OCH närliggande träd* | +1 till +5 |
| Porlande vattendrag* | +1 till +5 |
| Metallrustning | -4 |
| Grus | -4 |
| Annat ljud i närheten* | +1 till +20 |

*SL väljer inom ramarna.

**Spåra** (INT, s. 43). Slå en gång i timmen och vid varje vägval. Misslyckat: tappat spåret. Fummel: följer ett annat spår i 1T6 timmar. Den förföljde kan dölja sina spår: spårarens CL minskas med den förföljdes differensvärde i Spåra.

| Underlag | CL-modifikation |
|---|---|
| Mjukt | +5 |
| Medium | ±0 |
| Hårt | -5 |
| Sumpigt | +5 |
| Blött efter regn | +2 |
| Snö | +5 |

| Vegetation | CL-modifikation |
|---|---|
| Skog | +2 |
| Högt gräs | +2 |
| Ingen, t.ex. berg | -10 |
| Buskar | +1 |

| Spårets ålder | CL-modifikation |
|---|---|
| Upp till 1 timme | ±0 |
| Upp till 6 timmar | -1 |
| Upp till 12 timmar | -2 |
| Upp till 24 timmar | -3 |
| Upp till 2 dagar | -5 |
| Upp till 7 dagar | -7 |
| Upp till 14 dagar | -15 |
| Mer än 14 dagar | -20 |

| Diverse | CL-modifikation |
|---|---|
| Den förföljde blöder | +3 |
| Regn | -2 per timme |
| Snöfall | -5 per timme |

**Stjäla föremål** (SMI, s. 44). Lyckat = fick tag på föremålet. Offret upptäcker:

| Tjuvens slag | Offret upptäcker om |
|---|---|
| Perfekt | kan inte upptäckas |
| Lyckat | offret slår perfekt PSY-slag |
| Misslyckat | offret klarar normalt PSY-slag |
| Fummel | automatiskt, offret slår inte |

Andra i närheten: alltid 5 % chans att någon upptäcker stölden. En misslyckad stöld har 25 % chans att bli uppmärksammad.

| Omständighet | CL-modifikation |
|---|---|
| Föremålet ligger i ytterficka | -1 |
| Föremålet ligger i innerficka | -5 |
| Föremålet sitter på offret (ring, halskedja etc.) | -12 |
| Föremålet hänger i offrets bälte | ±0 |

**Tala modersmål** (Primär; speciell/INT, s. 44). BC: överklass eller adel FV 20 (B5); alla andra FV 16 (B4). Språk per ras: se avsnitt 2.

**Upptäcka fara** (PSY, s. 44). Sjätte sinne: en intuitiv känsla av att något är på gång, ingen klar bild. SL slår alltid dolt. Används mot Smyga, Buktala.

**Värdera** (INT, s. 44). Bestäm ett föremåls värde. SL modifierar efter sällsynthet och tidigare erfarenhet. Differensvärdet anger hur mycket det över- eller undervärderas.

**Övertala** (KAR, s. 44). Få någon att göra något han inte vill, utan tvång. Farligt eller otillåtet förslag: förslagsvis -5.

### 5.8 Sekundära färdigheter (s. 45-62)
Format: **Namn** (Grundegenskap; Kat.; Yrken enligt beskrivningen; sida). FV kan aldrig överstiga grundegenskapen (gäller inte yrkesfärdigheter, se 6.1).

**Administration** (INT; B; Bard, Lärd man, Lönnmördare, Riddare, Tjuv; s. 45). Hur samhället styrs, myndigheter, organisation, delegering, vilka ämbeten man bör muta, juridik.

**Akrobatik** (SMI; B; Bard, Lönnmördare, Sjöfarare, Tjuv; s. 45). Nivåer:

| B-FV | Kan |
|---|---|
| 0 Ingenting | Livsfara att försöka |
| 1 Nybörjare | Gå på händer, landa på fötterna vid fall |
| 2 Tränad | Stavhopp och längdhopp, falla utan att skada sig, hjula, frivolter, armgång på grovt rep |
| 3 Kunnig | Klättra rep och stegar utan problem, spänd lina, svinga i lianer, enkla trapetsmanövrer, volter; enkla manövrer till häst (CL = medel av CL Akrobatik och CL Rida) |
| 4 Erfaren | Klättra lodräta ytor med fästen, fulländad trapets, svårare konster till häst |
| 5 Mästare | Slak lina och allt annat |

Allmänt: faller (SMI + FV) x 2 dm utan skada (dra av från längre fall). Med sats och hjulning: hoppa (SMI + FV) dm högt med volt, dubbelt i stavhopp; satsen minst dubbelt så lång som hindret är högt. Lugna omständigheter: inget slag. Beskjuten eller distraherad: SMI-slag, misslyckande ofta förödande. **Ingen rustning eller klumpiga föremål.**

**Alkemi** (INT; A; Helare, Lärd man, Magiker; s. 45). Framställa alkemiska brygder och elixir (beskrivs i DoD Magi). FV <= FV i Läsa/Skriva.

**Astrologi** (INT; A; Lärd man, Magiker; s. 45). Förutsäga framtid ur himlakroppar; dolda slag. Perfekt: mycket detaljerad information. Lyckat: korrekt. Misslyckat: ingen information. Fummel: totalt felaktig.

**Avväpna** (SMI; A; Krigare, Munk, Riddare; s. 46). Kräver lämpligt redskap i handen och **ett lyckat anfallsslag**, plus lyckat slag i Avväpna. Därefter Motståndstabellen: (anfallarens STY + FV Avväpna) mot den avväpnades STY. Lyckas: vapnet landar 1T3+1 meter bort i slumpvis riktning.

**Buktala** (PSY; A; Bard, Tjuv; s. 46). Rösten låter komma från en plats inom 3 m. Genomskådas med Upptäcka fara modifierat med buktalarens differensvärde. Nytt slag varje minut.

**Bärsärkagång** (PSY; A; Krigare; s. 46). Försätter sig i raseri (boken säger inte uttryckligen att ett slag krävs för att starta). Under bärsärkagång:
- Angriper vettlöst närmaste fiende; **+1T6 skada på alla attacker**; bara närstridsattacker.
- **En extra attack sist i varje SR.**
- Får aldrig parera (inte ens med sköld) eller söka skydd mot projektiler.
- Bryr sig inte om skador, men en kritiskt skadad kroppsdel blir obrukbar.
- När KP i en kroppsdel når 0: slå färdighetsslag; lyckat = lugnar sig (blir normal "med allt vad det innebär"), misslyckat = fortsätter.
- När alla fiender är ur stridbart skick eller flytt: slå färdighetsslag. Misslyckat: svimmar i lika många minuter som differensvärdet. Lyckat: förföljer de flyende i FYS antal SR, lugnar sig sedan. Ingen att förfölja: lugn efter (20 - FYS) SR.

**Dans** (SMI; A; Bard, Sjöfarare, Riddare; s. 46). Förslag: KAR +1 (lyckat) eller +3 (perfekt) i publikens ögon. Kvalitet = differensvärde.

**Djurhelning** (INT; A; Helare, Magiker, Munk, Utbygdsjägare; s. 46). Som Läkekonst för djur; varje djurtyp separat färdighet.

**Djurträning** (PSY; A; Bard, Magiker, Riddare, Utbygdsjägare; s. 46). Lära ett djur något: (20 - djurets INT) lyckade slag, ett slag per vecka. Perfekt = tre lyckade. Fummel = börja om.

**Dolk** (SMI; A; Bard, Krigare, Lärd man, Lönnmördare, Sjöfarare, Riddare, Tjuv, Utbygdsjägare; s. 47). Se Vapenfärdigheter.

**Dra vapen** (SMI; A; Krigare, Lönnmördare, Riddare, Tjuv; s. 47). Dra och anfalla i samma SR, som vanlig attack. FV i Dra vapen kan aldrig överstiga FV med vapnet. Utan negativa modifikationer krävs: vapnet lätt åtkomligt, båda händerna fria, gott om svängrum.

**Drogkunskap** (INT; A; Helare, Lärd man, Magiker, Munk, Utbygdsjägare; s. 47). Brygder med allmänna effekter. En dag letande = ett slag: lyckat 1T4 doser, "särskilt slag" 2T4, perfekt 4T4 (rätt miljö krävs). Framställning kräver laboratorium. Effekter i kapitlet Örter & Växter.

**Förfalskning** (INT; A; Bard, Lärd man, Lönnmördare, Munk, Tjuv; s. 47). Upptäckt kräver **perfekt** slag i Finna dolda ting, modifierat med förfalskarens differensvärde och tabellen. Kräver originalet i minst (60 - FV) minuter. Kräver minst FV B4 i att Skriva språket.

| Modifikation på att genomskåda | |
|---|---|
| Den som ser förfalskningen har gjort originalet | +5 |
| Har sett originalet (eller liknande) | +2 |

| Modifikation på förfalskningens CL | |
|---|---|
| Originalet är en kejserlig handling (el. dyl.) | -10 |
| Sigill | -5 |
| Namnteckning | -2 |
| För varje sida (ca A4) | -1 |

Flera modifikationer kan gälla samtidigt.

**Geografi** (INT; B; Alla; s. 48). Kontinentens folk, språk, vattenvägar, städer, politik. Kartor och uppslagsböcker kan ge modifikationer.

**Geologi** (INT; B; Lärd man, Utbygdsjägare; s. 48). Hitta och identifiera ädla stenar och metaller; dolt slag. Vanligt: järn, kvarts, bergskristall. Ovanligt: koppar, tenn, opaler. Sällsynt: de flesta ädelstenar, guld, silver. Mycket sällsynt: diamanter, uran, platina. Kan värdera stenar och metaller. Primär med FV 5 för dvärgar.

**Giftkunskap** (INT; A; Helare, Lärd man, Lönnmördare, Magiker, Munk, Tjuv, Utbygdsjägare; s. 48). Gifter och motgifter. En dag letande: lyckat 1T2 doser, "särskilt slag" 1T4, perfekt 2T4. Laboratorium krävs. Effekter i kapitlet Örter & Växter.

**Gyckelkonster** (SMI; B; Bard, Sjöfarare, Tjuv; s. 48). Inget slag om man inte blir störd (då normalt slag).

| B-FV | Kan |
|---|---|
| 0 | Ingenting |
| 1 Nybörjare | Gå på händer och styltor |
| 2 Tränad | Sluka och spruta eld, jonglera tre bollar |
| 3 Kunnig | Jonglera fyra föremål (bollar, knivar, tallrikar) |
| 4 Erfaren | Sluka svärd, jonglera fem föremål, jonglera mellan sig och andra lika skickliga |
| 5 Mästare | Jonglera upp till sju föremål, avancerade balansakter |

**Hantera fällor** (SMI; A; Lönnmördare, Tjuv, Utbygdsjägare; s. 49). Gillra och desarmera fällor. Alltid dolt slag; vid misslyckande tror spelaren ändå att det gick. Misslyckad desarmering: risk att fällan utlöses (anges per fälla). Fummel: fällan utlöses alltid.

**Hantverk** (varierar; B; Bard, Helare, Krigare, Munk, Sjöfarare, Utbygdsjägare; s. 49). Varje hantverk är en egen färdighet. Kräver lokal, verktyg, material. Exempel med grundegenskap: Smide (STY), Sömnad (SMI), Snickeri (SMI), Stenhuggning (SMI), Garvning (INT), Guldsmide (SMI), Juvelsnideri (SMI), Hovslageri (SMI), Gjutning (INT), Träsnideri (SMI), Tygfärgning (INT). (Läderarbete nämns också, utan grundegenskap.)

| B-FV | Nivå | Effekt på produkter |
|---|---|---|
| 0 | Ingenting | |
| 1 | Lärling | Enkla saker; godtagbart om dubbel tid. Vapen: skada -2, brytvärde -4. Rustning: vikt +1, absorbering -1. Pris 1/4. |
| 2 | Gesäll | Obetydligt under genomsnitt; säljs för halva priset. Vapen: skada -1, brytvärde -2. |
| 3 | Kunnig | Allt inom yrket, standardpris. |
| 4 | Mästare | Upp till dubbla priset. Vapen: brytvärde +2. |
| 5 | Framstående mästare | Samlare betalar upp till tiodubbelt. Vapen: skada +1, brytvärde +4. Rustning: absorbering +1. |

**Hasardspel** (PSY; A; Bard, Krigare, Lärd man, Lönnmördare, Sjöfarare, Tjuv; s. 50). Egen procedur:
1. SL bestämmer i hemlighet motståndarens FV.
2. Spelaren väljer myntslag och insats (Normal, Dubbel, Femdubbel, Tiodubbel osv.).
3. SL slår dolt 1T10 för var och en och lägger till respektive CL. Högst vinner differensen i vald myntenhet, gånger insatsmultipeln.
Exempel: 8+11 = 19 mot 15+13 = 28 (sic: källan anger ett T10-resultat på 15): vinnaren får 9 sm x 10 (tiodubbel insats) = 90 sm.
Fusk (preparerade tärningar/kort): +0 till +10 CL valfritt. Chans att en åskådare upptäcker = CL i Finna dolda ting + CL i Hasardspel + fusktillägget - fuskarens CL i Hasardspel. Varje åskådare får en chans varje gång.

**Heraldik** (INT; B; Bard, Lärd man, Munk, Riddare; s. 50). Identifiera vapensköldar och släktband. -2 på CL om utländskt, ytterligare -2 om annan kultur.

**Historia** (INT; B; Bard, Lärd man, Munk, Riddare; s. 50). FV <= FV Läsa/Skriva. Inom specialintresse: dubbel CL. Fummel: felaktig information. Perfekt: extra nyttig information.

| Händelse (exempel) | CL-modifikation |
|---|---|
| Mycket viktig (stort krig) | +5 |
| Viktig (mord på en kung, mindre krig) | ±0 |
| Liten (upprorsförsök, mord på länsherre) | -5 |
| Mycket liten (liten översvämning) | -10 |

| Andra modifikationer | |
|---|---|
| Händelsen utspelade sig i annat land | -2 |
| Händelsen utspelade sig på annan kontinent | -10 |
| För varje femtio år tillbaka i tiden | -1 |

**Hypnotisera** (PSY; A; Bard, Helare, Lönnmördare, Tjuv; s. 50). FV Hypnotisera måste övervinna offrets PSY (Motståndstabellen) **tre SR i rad**; bruten ögonkontakt = automatiskt misslyckande. I trans: framkalla minnen, få offret att berätta eller handla. Order helt mot offrets natur: ny kontroll (FV mot PSY), modifieras i extremfall. **FV kan aldrig överstiga hypnotisörens PSY**, även som yrkesfärdighet.

**Knopar** (SMI; A; Bard, Lönnmördare, Munk, Sjöfarare, Tjuv, Utbygdsjägare; s. 51). Ta sig loss: CL = eget FV Knopar - bindarens FV Knopar. Rep bundna med perfekt slag kan aldrig lossas. Perfekt slag lossar alla andra rep. Även repstegar, tackel, fläta rep.

**Kulturkännedom** (INT; B; Alla; s. 51). Seder, tabun, gudar m.m. för en kultur; separat färdighet per kultur. Minst FV 15 för att smälta in utan att väcka uppseende.

**Kunskap om demoner** (INT; B; Helare, Lärd man, Magiker, Munk; s. 51). Teori. Praktik kräver magiskolan Demonologi (DoD Magi). FV = FV i Demonologi. FV <= FV Läsa/Skriva.

**Kunskap om magi** (INT; B; Helare, Lärd man, (Magiker), Munk, Riddare; s. 51). Teori om besvärjelser och skolor. Magiker har den automatiskt med FV = högsta FV i en magiskola. FV <= FV Läsa/Skriva.

**Kunskap om odöda** (INT; B; Helare, Lärd man, Magiker, Munk, Riddare; s. 51). Teori. Praktik kräver Nekromanti (DoD Magi). FV = FV i Nekromanti. FV <= FV Läsa/Skriva.

**Känna magi** (PSY; A; primär för magiker, sekundär för övriga; s. 51). En separat färdighet per magiskola (ingen "Känna allmän magi"). Dolda slag när SL tycker det passar; ger bara en obestämd känsla. Avgöra om ett föremål är magiskt: okänt föremål -20 CL; framgångsrikt använt på identiskt föremål tidigare: ingen modifikation; +1 CL per lagrad effektgrad. Lyckat: vet att det är magiskt. Perfekt: vet antal besvärjelser och effektgrader, men inte vilka. Allmänna besvärjelser räknas till föremålets huvudbesvärjelses skola; bara allmänna: använd högsta Känna magi-FV. Magiker: FV = FV i motsvarande magiskola (följer med när den höjs), BC i övriga skolor, kan höjas vidare normalt.

**Låsdyrkning** (SMI; A; Lönnmördare, Tjuv; s. 52).
- Låsets svårighetsgrad SG vanligen 1-20, svåra upp till 25, okänt = 15.
- Utan dyrkar: halv chans. Mycket bra dyrkar eller stora dyrksatser: +1T6 eller +1T10.
- Ett slag per SR. Lyckat: dra differensvärdet från låsets SG. SG 0 = öppet. Misslyckat: inget händer, men SG +1T6.
- Perfekt: öppet direkt. Fummel: får inte försöka igen förrän högre FV, och slå på fummeltabellen:

| 1T4 | Resultat |
|---|---|
| 1 | Dyrken går sönder men fastnar inte. |
| 2 | Dyrken går sönder och fastnar. Låset måste monteras isär av låssmed; inte ens rätt nyckel hjälper. |
| 3 | Knäckt självförtroende: -5 CL i Låsdyrkning i tre dagar. |
| 4 | Mental blockering: -10 CL på alla lås i en vecka. |

**Läkekonst** (INT; A; Helare, Munk; s. 52). Per vecka fullständig vård: slag modifierat av skadans omfattning. Lyckat: patienten får tillbaka dubbelt så många KP som normalt (normal läkning beskrivs inte här). Vissa skador (benbrott, inre blödningar) kräver läkare, annars men för livet.

**Läppläsning** (INT; A; Bard, Tjuv; s. 52). Lyckat = ser vad som sägs. Kräver Tala minst B4 i språket.

**Läsa/Skriva främmande språk** (INT; B; Bard (1), Helare (1), Lärd man (4), Magiker (3), Munk (3), Sjöfarare (1), Riddare (1); s. 52). Varje skriftspråk separat. Språk: människospråk (människor, ankor, halvorcher, halvalver, halvlängdsmän; t.ex. kardiska, tjugiska, trakoriska i Ereb Altor), alviska, dvärgspråket (hemligt), svartiska (inget skriftspråk), uråldriga språk och drakspråk (kan aldrig väljas som yrkesfärdighet).

| B-FV | Nivå |
|---|---|
| 0 | Kan varken läsa eller skriva |
| 1 | Begränsade: pusslar ihop mycket enkel text |
| 2 | Begynnande: enkla texter, förstår medelsvåra med ordbok |
| 3 | Normala: relativt obehindrat, inte högtidlig stil |
| 4 | Goda: vackert och korrekt, inte ålderdomlig stil |
| 5 | Utmärkta: även gammalmodig/högtidlig stil, läser mellan raderna |

**Magisk kanalisering** (INT; A; Magiker; s. 53). Använd en villig, medveten person som medium för en besvärjelse (ej ritual); mediet lägger besvärjelsen och förlorar PSY. Båda måste ha FV > besvärjelsens effektgrad och båda lyckas med slag.

**Magiskolor** (INT; A; Magiker (en valfri), Utbygdsjägare (Animism); s. 53). Se kapitlet Magi (inte i denna bok). Förbjudna för övriga yrken.

**Massage** (SMI; A; Helare, Munk; s. 53). Läker 1T2 KP per behandling (ca 2 timmar). Bara skador från trubbiga vapen (klubbor, trästavar, slungstenar, stridshammare o.dyl.). Max en behandling per dygn.

**Muta** (KAR; A; Bard, Lönnmördare, Sjöfarare, Tjuv; s. 54). Mutan bör vara minst en dagslön; riskabla tjänster dubblas flera gånger. Mutaren måste övervinna mottagarens **mutfaktor** (1-25; 1 = fattig och omoralisk, 25 = obrottsligt plikttrogen) på Motståndstabellen. Misslyckat: grundchans 25 % att bli rapporterad och arresterad (SL modifierar).

**Målning** (SMI; A; Bard, Munk, Sjöfarare, Riddare; s. 54). Kvalitet = differensvärde. Kan bedöma andras målningar.

**Navigera** (INT; A; Sjöfarare; s. 54). Dolt slag per dag till sjöss. Misslyckat: 10 % kursavvikelse, kumulativt per nytt misslyckande. Lyckat: åter på rätt kurs. Effekten är försening, inte fel mål. Perfekt: vinner en dags resa. Fummel: ytterligare två dagars försening. Landmärken ger bonus, dåligt väder och okänt vatten minus.

**Orientering** (INT; A; Helare, Sjöfarare, Utbygdsjägare; s. 54). Utomhus. Slag vid varje viktigt vägval. Utan molnfri himmel: halverad CL. Lyckat: vet bästa vägen. Misslyckat: spelarna väljer själva. Fummel: väljer helt fel väg.

**Räkning** (INT; B; Lärd man, Magiker, Munk, Riddare, Tjuv; s. 55). Nivåer: 0 ingenting, 1 addition och subtraktion, 2 multiplikation, 3 division, 4 affärsmässig bokföring, 5 geometri och algebra.

**Schack & brädspel** (INT; A; Bard, Lärd man, Sjöfarare, Riddare; s. 55). Båda slår; högst differensvärde vinner. Lika: remi (schack) eller omslag (bräde).

**Simma** (SMI; B; Alla; s. 55). Ankor har FV 20 (B5).

| FN | Innebär | Förflyttning (rutor/SR) |
|---|---|---|
| 0 | Kan ej simma | 0 |
| 1 | Simkunnig | 1 |
| 2 | Hyfsad simmare | 2 |
| 3 | God simmare | 3 |
| 4 | Skicklig simmare | 4 |
| 5 | Mästersimmare | 5 |

Kappsimning: högst SMI vinner. Kan aldrig simma i rustning, inte ens läder. Kan hålla sig flytande i läderrustning högst FYS/2 minuter. Slag i svåra lägen (ström, virvel, lätt sårad; svårt sårad kan inte göra något), lämpligt intervall 1 minut.

**Sjökunnighet** (INT; A; Sjöfarare; s. 55). Till havs: Lätt FYS-slag och slag i Sjökunnighet; misslyckas något blir man sjösjuk (-5 CL på alla färdigheter; fummel = utslagen). Upprepas varje kväll utan sjösjukeavdraget, med +1 CL per tidigare misslyckande; först när båda lyckas mår man bättre, och nästa morgon är man frisk resten av resan. **På gungande skepp är CL i SMI- och STY-baserade färdigheter aldrig högre än FV i Sjökunnighet, även i strid.** Hårt väder: slag varje halvtimme, misslyckat = mindre olycka.

**Skådespeleri** (KAR; A; Bard, Lönnmördare, Tjuv; s. 55). Spela roller, skriva pjäser. Kvalitet = differensvärde. Fummel: kommer av sig eller avslöjar sin identitet.

**Spela instrument** (KAR; A; Bard, Munk, Sjöfarare, Riddare, Tjuv; s. 56). Varje instrument separat. Förslag: KAR +1 (lyckat) / +3 (perfekt) i åhörarnas ögon.

**Språkkunskap** (INT; B; Bard, Helare, Lärd man, Magiker, Munk, Riddare; s. 56). Identifiera ett språk i tal eller skrift, utan att förstå det.

**Spå väder** (INT; A; Sjöfarare, Utbygdsjägare; s. 56). Förutsäga vädret 12 timmar framåt. Lyckat: 90 % rätt. Misslyckat: 50 %. Fummel: totalt fel. Perfekt: 100 %.

**Stavhopp** (SMI; A; Lönnmördare, Sjöfarare, Tjuv; s. 56). Hinder lika höga som staven, max FV/4 meter. Fummel: normal fallskada från hindrets höjd.

**Stridskonster** (SMI; A; Krigare, Lönnmördare, Munk; s. 56-58). Spelaren konstruerar en stridskonst av tekniker. Grundkostnad = summan av teknikernas kostnader, avrundat uppåt; +2 EP om stridskonsten inte är yrkesfärdighet. Ett FV gäller alla tekniker i stridskonsten; de lärs och får erfarenhet som en enhet. Obeväpnad strid inte i tyngre rustning än läder. Utan "Obeväpnad parering av vapen" kan en obeväpnad bara parera obeväpnade attacker. Exempel: normal spark + bakåtspark + fint + obeväpnad parering = 0,5+0,5+0,5+1,0 = 2,5, avrundas till 3 (obs: tabellen ger Obeväpnad parering 0,5; exemplet räknar 1,0).

| Teknik | Grundkostnad |
|---|---|
| Avväpning | 1,0 |
| Bakåtspark | 0,5 |
| Bedövningsslag† | 1,0 |
| Blind strid | 2,0 |
| Dubbelslag | 1,0 |
| Dubbelspark | 1,5 |
| Fallteknik/Rullningar | 0,5 |
| Fint | 0,5 |
| Hoppspark | 1,0 |
| Högt kast | 1,0 |
| Initiativbonus | 0,5 |
| Krosslag | 1,0 |
| Liggande/Knästående strid | 1,0 |
| Lågt kast† | 0,5 |
| Låsning/Neddragning† | 1,0 |
| Normalt slag | 0,5 |
| Normal spark | 0,5 |
| Obeväpnad parering av vapen | 0,5 |
| Rundspark | 1,0 |
| Stålsättning | 1,0 |
| Uppresning | 0,5 |
| Vidvinkelsyn | 1,0 |

† bara mot människoliknande motståndare.

| Teknik | Mekanik |
|---|---|
| Avväpning | Obeväpnad parering mot beväpnat anfall. Lyckas motståndarens attack: fungerar som vanlig parering. Misslyckas den: vapnet far 1T3 rutor åt något håll, om inte anfallaren lyckas parera avväpningen. Perfekt: försvararen tar vapnet, om inte anfallaren också slår perfekt (då vanlig parering). |
| Bakåtspark | Mot motståndare i rutan bakom. 1T6 skada. |
| Bedövningsslag | 1T3 skada. Om skada: offret Svårt FYS-slag, annars förlorar nästa attack eller parering. Icke-människotyp: bara 1T3 skada. |
| Blind strid | Alltid på, inget slag. Kan slåss i beckmörker (terrängen fortfarande besvärlig). |
| Dubbelslag | Två knytnävsattacker i samma SR mot olika motståndare, 1T3 vardera, separata slag, högst 180 grader isär. |
| Dubbelspark | Flygande hoppspark mot två olika motståndare, 1T6 vardera, separata slag, högst 1 m isär. Annars som Hoppspark. |
| Fallteknik/Rullning | Lyckat slag vid fall: halv fallskada. Lyckad rullning: upp till 5 rutor på en SR; kan inte huggas med närstridsvapen under rullningen. Misslyckad: halva sträckan och liggande. |
| Fint | Görs samtidigt med ett angrepp. Lyckas: motståndarens chans att parera halveras (avrunda nedåt). Inte med avståndsvapen. |
| Hoppspark | En rutas sats, spark mot huvud eller bröstkorg, 1T8. Miss: landar i målets ruta; SMI-slag lyckat = på fötterna men gör inget nästa runda utom att återfå balansen; misslyckat = liggande i rutan (kan slåss liggande nästa runda med den tekniken). -2 på initiativslaget. |
| Högt kast | Alltid sist i SR. Lyckas: offret kastas 1T3 rutor valfri riktning, liggande; offret Svårt SMI-slag, misslyckat = 1T3 skada. |
| Initiativbonus | Alltid på. +5 på SMI vid beräkning av turordning. |
| Krosslag | Knytnäve mot ömtåliga punkter, 1T6. |
| Liggande strid | Alltid på. Slag, sparkar, parera, låga kast liggande. Anfallaren får ingen bonus mot liggande mål. |
| Lågt kast | Lyckas: försvararen faller i sin ruta, ingen skada. Kan pareras. Reser sig efter 1T2 SR. |
| Låsning/Neddragning | Som anfall, kan pareras. Lyckas: motståndaren nere och låst. Ta sig loss: halverad SMI (avrunda nedåt) måste övervinna angriparens FV. |
| Normalt slag | Knytnäve mot huvud eller bröstkorg, 1T3. |
| Normal spark | Mot ben, bröstkorg eller huvud, 1T6. |
| Obeväpnad parering av vapen | Kan parera alla närstridsattacker, även vapen, som om man hade vapen. |
| Rundspark | 1T8. Miss: får inte anfalla eller parera nästa runda. -2 på initiativslaget. |
| Stålsättning | Varje gång man tar skada: lyckat slag = halv skada. Inte mot huvudträffar. |
| Uppresning | Kastad omkull: lyckat slag = upp direkt, när som helst i SR. |
| Vidvinkelsyn | Alltid på. Synfält 270 grader. |

**Tala främmande språk** (INT; B; Bard (2), Helare (2), Krigare (1), Lärd man (4), Lönnmördare (1), Magiker (3), Munk (3), Sjöfarare (3), Riddare (1), Tjuv (1), Utbygdsjägare (1); s. 58). Varje språk separat.

| B-FV | Nivå |
|---|---|
| 0 | Kan inget |
| 1 | Minimala: enkla vardagsmeningar, kraftig brytning |
| 2 | Användbara: god kontroll, märkbar accent, litet ordförråd |
| 3 | Goda: svag brytning |
| 4 | Utmärkta: som en infödd |
| 5 | Perfekt: som en bildad infödd, formell stil |

**Teckenspråk** (INT; A; Lönnmördare, Tjuv; s. 59). Lär språket via Tala främmande språk; för att själv "tala" det krävs FV i Teckenspråk, som aldrig får överstiga Tala-FV i språket. Förstå = Tala-FV. Varje teckenspråk separat (t.ex. tjuvgillets "strack").

**Trästav** (SMI; A; Alla; s. 59). Se Vapenfärdigheter (gruppen Stångvapen).

**Två vapen** (varierar, SMI om vapnen bygger på olika grundegenskaper; A; Krigare, Riddare; s. 59).
- En färdighet per kombination och hand, t.ex. "Stridsklubba (svärdshand) + Dolk (sköldhand)" (hand behöver inte anges om dubbelhänt/ambidextriös).
- Behövs inte för sköld i sköldhanden + vapen i svärdshanden.
- FV <= lägsta av de två enskilda FV. BC = floor(lägsta FV / 2).
- Inga tvåhandsvapen i kombinationen.
- Per SR välj: två attacker, en attack + en parad, eller två parader. Vid två attacker: svärdshandens attack på vanlig plats i SR, sköldhandens **allra sist**.

**Undre världen** (INT; B; Lönnmördare, Sjöfarare, Tjuv; s. 59). Tjuvgillen, ledare, tillhåll, hälare. Separat färdighet per stad. Misslyckande kan få obehagliga följder.

**Vapenfärdigheter** (varierar; A; Bard (1), Krigare (12), Lönnmördare (1), Sjöfarare (3), Riddare (5), Tjuv (2), Utbygdsjägare (3); s. 60). Ett FV per vapen, samma FV för anfall och parering när vapnet kan båda. Inom en vapengrupp har man minst floor(högsta FV i gruppen / 2) med alla gruppens vapen (Kortsvärd 15 ger minst 7 med andra enhandssvärd).

| Vapengrupp | Grundegenskap | Vapenfärdigheter |
|---|---|---|
| Dolkar | SMI | Dolk, Parerdolk |
| Enhandssvärd | STY | Alla svärd som RPn kan använda med en hand* |
| Enhands krossvapen | STY | Stridsklubba, stridshammare, morgonstjärna, träklubba, spikklubba |
| Enhandsyxor | STY | Alla yxor som RPn kan använda med en hand* |
| Tvåhandsvapen | STY | Svärd, yxor och krossvapen som RPn måste använda med två händer* |
| Stickvapen | STY | Kortspjut, Långspjut, Tornerlans, Treudd, Pik, Spetum |
| Kättingvapen | SMI | Stridsslaga, Stridsgissel |
| Stångvapen | STY | Hillebard, Pålyxa, Trästav |
| Bågar | SMI | Liten båge, Långbåge, Kortbåge, Sammansatt båge |
| Armborst | SMI | Lätt armborst, Tungt armborst, Arbalest |
| Slunga | SMI | Slunga, Stavslunga |
| Kastvapen | SMI | Kastspjut, kastkniv, kastyxa |
| Piska | SMI | Piska |
| Sköldar | SMI | Bucklare, Liten rundsköld, Stor rundsköld, Långsköld, Vanlig sköld, Romersk sköld |
| Blåsrör | SMI | Blåsrör |

*Se "Hantering" i kapitlet Vapen och Rustningar (inte i denna bok). Obs: Trästav listas i Stångvapen (STY) men färdigheten Trästav anges som SMI, och Dolk som SMI.

**Zoologi** (INT; B; Helare, Lärd man, Magiker, Munk, Utbygdsjägare; s. 61). Djur, inklusive ointelligenta legendariska varelser (grip), inte intelligenta (drakar, enhörningar). Spelaren väljer fråga, SL slår dolt. Lyckat: sant svar eller "vet inte". Misslyckat: "vet inte" eller nästan sant. Fummel: falskt. Perfekt: mer än efterfrågat. CL +5 (mycket vanliga djur) till -10 (sällsynta) till -20 (unika).

**Änterhake** (SMI; A; Lönnmördare, Sjöfarare, Tjuv; s. 61). Max STY rutor horisontellt, floor(STY/3) rutor uppåt. Fummel: faller ned på kastaren (uppåt) eller lossnar i kritiskt läge.

**Örtkunskap** (INT; A; Helare, Lärd man, Magiker, Munk, Utbygdsjägare; s. 61). Läkande dekokter och omslag. En dag letande: lyckat 1T4 doser, "särskilt slag" 2T4, perfekt 4T4. Effekter i kapitlet Örter & Växter.

**Överlevnad** (INT; A; Helare, Utbygdsjägare; s. 62). Hitta vatten, mat, skydd, bedöma väder, ta sig fram. Vid onormala förhållanden slår alla, t.ex. en gång i timmen (mycket svårt) eller två gånger per dag (lindrigare). Misslyckat: **alla grundegenskaper -1 tillfälligt** (utmattning, kyla, törst).

---

## 6. Hur man blir bättre (s. 63-64)

### 6.1 Erfarenhetspoäng och tak (s. 63)
- Varje erfarenhetspoäng (EP) gäller **en bestämd färdighet** och antecknas vid den.
- EP omvandlas till FV med samma kostnadstabell som startfärdigheter (grundkostnad x multipel; 4.10). Grundkostnad: primär 2, yrkesfärdighet 3, övrig sekundär 5, besvärjelse efter SV.
- Källor: ensamträning, träning med lärare, erfarenhet (äventyr), bonuspoäng.
- **Tak:** sekundära färdigheter och alla kategori B-färdigheter kan aldrig få högre FV än grundegenskapen. Primära färdigheter och yrkesfärdigheter kan inte **tränas** över grundegenskapen; över det bara genom erfarenhet i äventyr (B-färdigheter undantagna, de kan inte gå över alls).

### 6.2 Ensamträning (s. 63)
- Normal: 8 timmar/dag, 6 dagar/vecka. Varje vecka: Normalt grundegenskapsslag (SG 10, alltså 1T20 <= grundegenskapen) för färdighetens grundegenskap. Lyckat = 1 EP; misslyckat = bortkastad vecka.
- 6 timmar/dag: tiden +50 %. 4 timmar/dag: dubbel tid. Inte mer än 8 eller mindre än 4 timmar.
- Inte under pågående äventyr. Kan kombineras med deltidsarbete. Kräver material (smedja, vapen, skjutplats).

### 6.3 Träning med lärare (s. 63)
- Läraren: minst FV 17 (FV B4) och INT >= 13. Lärarens FV måste vara mer än 3 över elevens.
- Alltid 8 timmar/dag, 6 dagar/vecka. Eleven slår **två** slag per vecka (som ensamträning).
- Modifikationer: för varje FV över 18 läraren har: -1 på slaget. Ensam elev: "CL -5 på slaget" (ordagrant; sammanhanget tyder på en fördel).
- Kostnad: 150 sm/vecka (magiker 300 sm). Annan ras än läraren x1,5. Ensam elev x3. Inkluderar lokal, utrustning, assistenter.
- Tränings-EP kan omvandlas till FV så snart man har tillräckligt.

### 6.4 Erfarenhet genom äventyr (s. 63)
- Gäller inte kategori B.
- **Första gången en färdighet används framgångsrikt efter en sovperiod på minst 6 timmar (2 timmar för alver): 1 EP. Perfekt slag: 1T3+1 EP.** Sedan inga fler EP i den färdigheten förrän efter ny sömn om minst 6 timmar.
- EP kan inte växlas in till FV under pågående äventyr; kräver en sammanhängande vila på **minst 7 dagar**, då allt omvandlas.
- Bonuspoäng efter äventyr (fördelas fritt på färdigheter med SL:s godkännande):

| Orsak | Bonuspoäng |
|---|---|
| Framgångsrikt utfört uppdrag | 1-4 |
| Osedvanligt svår gärning | 1-2 |
| Gott rollspelande | 1-4 |
| Max totalt per äventyr | 10 |

### 6.5 Hur man kan höja sin PSY (s. 64)
Slås efter varje äventyr, en gång, om villkoret uppfylldes. Ökningen kommer gradvis under en vecka. Kamperna måste vara verkliga och allvarliga (SL stoppar "träningskamper").

| | Magiker som övervunnit ett offers motstånd PSY mot PSY | Icke-magiker som övervunnit en magikers anfall PSY mot PSY |
|---|---|---|
| Slag | 1T20 | 1T20 |
| +1 PSY om | resultat <= (25 - nuvarande PSY) | resultat <= (20 - nuvarande PSY) |
| Etta | +1T3+1 PSY | +1T3+1 PSY |
| Över gränsen | PSY över 24: bara en etta ger +1; två ettor i rad ger +1T3+1 | PSY över 19: bara en etta ger +1 |

Särskild förmåga 80: -5 på tärningsslaget, 0 eller lägre räknas som 1.

### 6.6 Hjältedåd (s. 64)
Hjältepoäng (HP). Chans att bli igenkänd = (totala insamlade HP i livet) %, modifierat av SL. SL kan dra HP för ohjältemodiga handlingar (överge vänner, förråda, vägra duell).

| Dåd | HP |
|---|---|
| Uppnå FV 21 (41, 61 osv.) i någon färdighet | 1T4 |
| Vinna turnering med fler än 400 deltagare | 5 |
| På kungens uppdrag rädda prinsessa | 10 |
| Döda fiendens härförare | 10 |
| Upptäcka ny kontinent | 10 |
| Leda belägring och erövring av fientlig borg | 10 |
| Stjäla skatt från monster utan att döda det* | 5-25 |
| Döda monster* | 10-50 |
| Rädda kungarike från undergång | 50 |
| Besegra annan hjälte | † |

*T.ex. drake, gorgon, rock, titan, demon, svart hämnare, dödsriddare eller annan ytterst sällsynt och extremt farlig varelse.
† 10 % (avrunda nedåt) av den hjältens HP.

Spendera HP:
- **Höja CL** (när som helst, före ett färdighetsslag, 1 HP): fummel blir bara misslyckat; misslyckat blir lyckat; lyckat blir perfekt; perfekt ger tillbaka HP:n.
- **Skaffa särskild förmåga** (bara mellan äventyr): nytt slag på tabellen i 4.6 med +2 per HP, minst 1, max 40 HP.
- **Förbättra grundegenskaperna** (bara mellan äventyr): 5 HP = +1 på en grundegenskap (ej STO). Obegränsat och permanent; påverkar färdigheter baserade på den.

---

## 7. Utrustning (s. 4 och s. 31)
- s. 4: lådans innehåll (rollformulär, fem tärningar T4, T6, T8, T10, T20, figurer, golvplan). Inga spelregler.
- s. 31: "I utrustningstabellen finns uppräknat priser". **Utrustningstabellen, vapentabeller och rustningstabeller finns inte i denna bok.** En snäll SL låter ofta rollpersonerna börja med livsviktiga saker, t.ex. ett vapen, en ryggsäck och kläder.
- Prisuppgifter som ändå finns i Bok I: lärare 150 sm/vecka (magiker 300 sm); hästexemplet: medelstor draghäst begärd 2.000 sm, "även en mycket fin häst är knappast värd mer än 1.000 sm".
- Hantverksnivåernas effekt på vapens skada och brytvärde och rustningars vikt och absorbering: se Hantverk (5.8).

---

## 8. Saknas i denna bok (hänvisningar)
För implementering behövs dessa från andra böcker/kapitel:
- Tärningar per grundegenskap och ras (kapitlet Varelser).
- Strid: initiativ (bygger på SMI enligt s. 5 och Initiativbonus), antal attacker, parering, träfftabell, skada för knytnäve/spark och vapen, absorbering, kritiska skador, fall- och läkningstakt (kapitlet Strid).
- Vapen och rustningar, "Hantering", priser (kapitlet Vapen och Rustningar, utrustningstabellen).
- PSY-poängens återhämtning, besvärjelser, effektgrader, magiskolorna (kapitlet Magi, DoD Magi).
- Skräcktabellen, sjukdomars Svårighetsgrad, gifters STY.
- Örter & Växter (drogernas, gifternas och läkedrogernas effekter).
- Definition av "särskilt slag".

---

## Notes for a real-time action game

- **Hit-location KP maps well.** Total KP = ceil((FYS+STO)/2) plus the location table gives a natural "limb disabled at 0" mechanic (arm at 0 = drop weapon or no shield, leg at 0 = slow or limp). Keep both pools: damage subtracts from the location and from the total.
- **Skadebonus and Förflyttning are pure derived stats.** STY+STO gives the SB dice; STO+FYS+SMI plus race gives speed. Convert rutor/SR to metres per second with the book's own units: 1 ruta = 1,5 m, 1 SR ≈ 5 s, so Förflyttning 10 ≈ 3 m/s. Anka gets -2.
- **The SR (≈5 s) is the hardest thing to translate.** "Once per SR" effects (helarens 1 KP/SR, munkens meditation, Låsdyrkning per SR, Hypnotisera 3 SR in a row, Bärsärkagång durations in SR) become timers or cooldowns of about 5 s. An attack per SR is far too slow for action combat, so attack speed has to be separated from SR. Then define "per SR" bonuses as per-attack or per-5-seconds explicitly.
- **Initiative has no direct real-time equivalent.** Krigare +5, Blixtrande reflexer +3, Initiativbonus +5 SMI, Snabbslående and the -2 on Hoppspark/Rundspark can become attack wind-up speed or a first-strike window instead of turn order.
- **d20 roll-under for attacks can stay hidden.** Roll on each swing against weapon-FV CL. Perfekt then gives a crit, fummel a stagger or self-penalty, and the differensvärde can scale effects. Keep the special rule that the re-roll is compared to FV, not CL.
- **Opposed checks via the closed-form Motståndstabellen** (X = G + 10 - SG) are cheap enough for real time: Avväpna (STY+FV vs STY), backstab, Smyga vs Upptäcka fara, Gömma sig vs Finna dolda ting, Stjäla föremål vs PSY.
- **Stealth is a strong fit**, especially for a duck thief (Anka: +4 Smyga, Smyga is SMI-based). Smyga at half speed, extra careful at a quarter speed (-5 on the roll), metallrustning -4, rain/thunder/water bonuses, and the observer's Upptäcka fara reduced by the sneak's differensvärde all work as continuous detection checks. "One roll per minute" has to become a shorter tick or a roll per observer per check interval.
- **Lönnmördare backstab maps directly**: x1 on a failed attack roll, x2 on success, x4 on perfekt, no SB, only humanoids no more than 2 m taller than you. Gate it on "unseen" (failed Upptäcka fara) instead of a separate Smyga roll.
- **Tjuv's PSY-for-CL (+1 per PSY, max 3, 2 uses per rest) and the HP "höja CL" rule** become an active ability. Since dice are hidden in real time, apply it as a timed buff ("next 3 seconds") or a guaranteed tier-up on the next action.
- **Bärsärkagång is a ready-made rage mode**: +1T6 damage, an extra attack, no parry or cover, ends on a skill roll when a limb hits 0 KP or enemies are gone, then a faint for |differensvärde| minutes (compress to seconds). Två vapen gives a natural off-hand attack that lands last.
- **Stridskonster as a buildable move list** is a good unlock tree: each technique has a cost and a concrete effect (1T3 to 1T8 damage, knockdown, roll 5 rutor with melee immunity, 270-degree vision, half damage on Stålsättning).
- **Experience must be adapted.** The book gives 1 EP for the first success per skill after 6 h sleep (2 h for alver), 1T3+1 on perfekt, and banks it until 7 days of rest. In a roguelite this becomes "first success per skill per floor or run gives a mark", converted at a hub or between runs using the C[] cost table. The EP-to-FV costs and the attribute caps carry over unchanged.
- **Category B skills (Simma, språk, Kulturkännedom, Akrobatik etc.) are binary gates, not rolls.** Implement them as thresholds (B-FV level) that unlock actions, for example swim speed = FN rutor/SR, or a dialogue keyword that needs Tala B3.
- **Time-scale skills are out-of-combat systems**: Spåra per hour, Navigera per day, Läkekonst per week, Överlevnad per hour or day, Drog/Gift/Örtkunskap per day of searching. Run them as town or travel-screen actions with the same tables, not in the action layer.
- **Many numbers the combat layer needs are not in Bok I** (weapon damage, armour absorption, hit-location roll, PSY regeneration, race dice). Take them from the Strid, Vapen och Rustningar, Magi and Varelser chapters before you build combat. Do not extrapolate them from this file.
