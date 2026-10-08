# DoD 4.0 (1991), Bok II: Spelledarboken. Regelspecifikation

Källa: `/home/claude/rules/kingafw/dod4_bok2_spelledarboken.txt`. Allt nedan är hämtat ur den filen. Det som är min tolkning eller mitt förslag är märkt **(tolkning)** eller **(förslag)**.

Sidnummer = trykt side. Transkriptionen har inga sidmarkörer i brödtexten, så sidan är den som bokens innehållsförteckning (och index) anger för avsnittet. Ett avsnitt kan fortsätta på nästa sida.

Notation: `1T20` = en tjugosidig tärning, `2T6+3` osv. `CL` = chans att lyckas (slå 1T20 lika med eller under). `FV` = färdighetsvärde. `KP` = kroppspoäng. `SB` = skadebonus. `BV` = brytvärde. `abs` = absorberingsförmåga. `SR` = stridsrunda. `SG` = svårighetsgrad. `sm` = silvermynt. Ruta = 1,5 m. I tabeller betyder `-` "inget/ej angivet".

## 0. Vad som INTE finns i denna bok (hänvisningar i texten/index)

| Sak | Var den finns enligt boken |
|---|---|
| Gränser för perfekt slag och fummel | Bok I s. 37 (index "Perfekta slag I-37", "Fummel I-37") |
| Fummeltabeller (anfall, parering) | Bok III s. 39 (index "Fummeltabeller III-39") |
| Avståndsmodifikation per avstånd | CL-tabellen säger "Avstånd -varierar (se nedan)" men ingen tabell följer i texten |
| Vindmodifikation | "se Vapen och Rustningar" (ej i denna bok) |
| Skräckslå / Skräcktabellen | Bok III s. 8-9 |
| Erfarenhetspoäng, "Hur man blir bättre" | Bok I s. 28 |
| Träffområdestabell för andra kroppsformer | Bok III s. 23 (index). Denna bok har bara den humanoida tabellen |
| Vapenkategori/färdighet per vapen, SMI-krav | Finns inte i vapentabellerna här (bara STY-krav) |
| Stridsdiagrammet (s. 31) | En bild, inte transkriberad |

## 1. Tid & rörelse (s. 5)

### Stor tidsskala (s. 5)
Används för resor och vila. Väder: dåligt väder (regn, hård blåst, kyla, hetta, snö) -25 % resväg; uselt väder (slagregn, snöstorm, gyttja, ökenhetta, djupt snötäcke) -50 %. Rätt utrustning upphäver vissa effekter. Exceptionellt hög/låg FYS och/eller SMI: dagsmarsch högst ±5 km.

| Färdsätt | Sträcka | Kontrollslag* |
|---|---|---|
| Gång | 20 km/12 tim | Inget |
| Marsch | 30 km/12 tim | Ett Lätt SMI-slag/dag |
| Jogg | 20 km/6 tim | Ett Lätt SMI-slag/timme† |
| Ritt | 25 km/12 tim | Ett Rida-slag med +10 på CL/dag |
| Hård ritt | 40 km/12 tim | Ett Rida-slag/dag |
| Fyrsprång | 30 km/6 tim | Ett Rida-slag/timme |

\* Misslyckat slag = litet missöde (stukar foten, hästen skenar och RP trillar av). † Maximalt FYS km per dag. Ej mer packning än STY kg. Lämplig klädsel krävs.

### Detaljerad tidsskala (s. 6), sträcka per minut

| Förflyttningssätt | Sträcka | Kontrollslag* |
|---|---|---|
| Krypa | 20 m | - |
| Smyga | 50 m | (Smyga-slag) |
| Gång | 100 m | - |
| Jogga | 200 m | - |
| Springa | 300 m | Lätt SMI-slag† |
| Sprinta | 400 m | Lätt SMI-slag‡ |

\* Misslyckat = litet missöde (stukar foten, snubblar). † Maximalt FYS/2 minuter. Rustning eller börda ej tillåten. ‡ Maximalt FYS/4 minuter. Lämplig klädsel krävs. Rustning eller börda ej tillåten.

### Stridsskala (s. 15)
- 1 SR = ungefär 5 sekunder.
- Golvplanens ruta = kvadrat med 150 cm sida. Förflyttningsförmåga anges i rutor per SR och är avpassad för försiktig rörelse i strid.
- En ostörd person på jämnt underlag kan **springa dubbelt** så långt, men får då inte göra något annat i SR (inte ens skicka meddelanden) och är helt omedveten om omgivningen.
- **Sprinta tredubbel** förflyttning: kräver ingen rustning, ingen ryggsäck, inget i händerna, lämplig klädsel (SL:s bedömning). Samma begränsningar som springa.
- Förflyttningskoder (s. 25): L = till lands, F = flygande, S = simmande, B = borrande, A = oavsett omgivning.
- Förflyttningsförmåga för rollpersoner: se Tabell för förflyttningsförmåga (avsnitt 3.1).

**(tolkning)** L10 = 15 m/SR = 3 m/s, vilket stämmer med "Jogga 200 m/minut" och med att full förflyttning räknas som jogg.

## 2. Strid (s. 14-22)

### 2.1 Vanlig och detaljerad strid (s. 15)
- **Vanlig strid**: för monster, djur och andra icke-humanoida varelser. Endast totala KP används. Inget pareringsslag slås (s. 17: pareringsslag "gäller ej vanlig strid eller attacker med projektilvapen").
- **Detaljerad strid**: för strid mellan personer. Träffområden och KP per kroppsdel används. Tar längre tid, så vanlig strid rekommenderas när det är många deltagare.

### 2.2 Turordning (s. 15)
- Först i varje SR slår alla ett **initiativslag: 1T10 + SMI** (plus eventuella övriga modifikationer).
- Högst agerar först. Lika: slå om mellan de inblandade. Turordningen gäller hela SR.
- SL slår dolda slag för SLP. SL bestämmer SLP:s handlingar helst utan att påverkas av vad spelarna gör.
- Flera attacker per SR: alla gör först sin första attack i turordning, sedan gör de som kan sin andra attack i turordning, osv. (s. 16)

### 2.3 Handlingar (s. 15)
En handling per SR, välj en:

| Handling | Regel |
|---|---|
| Lägga en besvärjelse | Full koncentration hela SR, inget annat. |
| Full förflyttning | Flytta upp till förflyttningsförmågan (SL minskar i besvärlig terräng). Flyttar man max joggar man och gör inget annat. Man får avbryta förflyttningen för att söka skydd eller parera ett hugg och stannar då där man var. |
| Avfyra ett projektilvapen | Stå stilla, sikta, skjut. Inget annat i SR utom omladdning. |
| Kasta ett kastvapen | Stå stilla, sikta, kasta. Inget annat i SR. |
| Använda annan färdighet | Hoppa, klättra, smyga, dyrka lås osv. Ofta full koncentration. SL kan tillåta närstridsattack efter t.ex. hopp från gren eller smygande bakifrån, förslag -10 på CL. Sitta upp på häst tar hela SR. |
| Delta i närstrid | Flytta högst halva modifierade förflyttningsförmågan (avrunda nedåt) före striden. |
| Utföra en annan handling | Byta vapen, plocka upp något, rota i ryggsäck osv. SL avgör tid och följder. I trängda lägen färdighetsslag (Rida för att hoppa upp på häst, Armborst för omladdning). Misslyckat = försök igen nästa SR. Fummel = t.ex. trillar av hästen, skär av bågsträngen. |

Meddelanden: korta utrop ("Hjälp!") när som helst. Längre meningar: får flytta högst halva förflyttningen (avrunda nedåt) och kan bara parera den SR.

### 2.4 Anfall och parering (s. 16)
- Två sorters strid: **närstrid** (handvapen, naturliga vapen) och **avståndsstrid** (kastvapen; projektilvapen: båge, armborst, blåsrör, arbalest, bola, slunga).
- Normalt **en attack eller en parering per vapen och SR**.
- Vapen + sköld: anfalla med vapnet och parera med skölden, eller parera med båda.
- Ett vapen i varje hand: två anfall, eller två pareringar, eller ett anfall och en parering.
- Parering kräver vapen eller sköld att parera med. Görs som färdighetsslag.
- Man kan aldrig parera om man håller ett avståndsvapen i handen (s. 17).

**Närstrid**: färdighetsslag i vapenfärdigheten, lyckat = träff (om inte parerat). Motståndaren ska normalt stå i rutan intill. Vissa vapen (spjut, hillebarder) når en eller flera rutor bort, även genom rutor med andra stridande.

**Avståndsstrid**: färdighetsslag i vapenfärdigheten. **Projektilvapen kan inte pareras.** **Kastvapen kan pareras bara med sköld och bara om försvararen ser vapnet kastas.** Minst en ruta mellan skytt och mål. Skjuta/kasta genom ruta med andra personer: risk att träffa dem, riktvärde 50 % (SL avgör).

**Att söka skydd** (s. 16): Den som väntar sig beskjutning och agerar före skytten i turordningen kan söka skydd (träd, sten, hörn, bord) eller kasta sig ned. Sker omedelbart före anfallet, sedan inget annat den SR (har han redan agerat avgör SL). Slå **Normalt SMI-slag**:
- Lyckat skydd: dra **differensvärdet** (CL minus tärningsutfall) från skyttens CL. Exempel: SMI 13, slår 6, skytten får -7.
- Lyckat kasta sig omkull: -1 på skyttens CL per ruta mellan skytt och mål.
- Misslyckat: inget avdrag. Skytten måste ändå skjuta (om han inte själv söker skydd).

### 2.5 Stridens förlopp (s. 17)
Ordning för varje attack: 1) Beräkna CL, 2) Slå anfallsslag, 3) Slå pareringsslag, 4) Utläs resultat, 5) Bestäm träffområde (s. 18), 6) Slå skada, 7) Dra bort rustningens absorbering, 8) Dra bort skadan från KP.

#### Beräkna CL (s. 17)

Modifikationer för avståndsattacker:

| Situation | Modifikation |
|---|---|
| Målet ligger ned | -1 för varje ruta mellan skytt och mål |
| Målet orörligt (medvetslöst, etc.) | +10 |
| Skymning, fackelsken | -5 |
| Mörker | -15 |
| Sikte på viss kroppsdel | -5 (endast detaljerad strid) |
| Vind | -varierar (se Vapen och Rustningar) |
| Avstånd | -varierar (se nedan) [ingen tabell i texten] |
| Skador | -varierar (se nedan) [= -2 per förlorad KP i berörd kroppsdel, avsnitt 2.7] |
| Målet tar skydd | -differensvärdet (se ovan) |

Modifikationer för närstridsattacker:

| Situation | Modifikation |
|---|---|
| Målet ligger ned | +5 |
| Anfall från sidan | +3 |
| Anfall bakifrån | +7 |
| Målet orörligt (medvetslöst, etc.) | +10 |
| Skymning, fackelsken | -5 |
| Mörker | -15 |
| Sikte på viss kroppsdel | -5 (endast detaljerad strid) |
| Anfall med sköldhand | -10 |
| Skador | -varierar [-2 per förlorad KP i berörd kroppsdel] |

#### Slå anfallsslag (s. 17)
- **Perfekt**: attacken gör automatiskt maximal skada (med maximal SB), utan avdrag för försvararens rustning eller naturliga skydd. Inget pareringsslag.
- **Fummel**: slå på rätt fummeltabell (finns inte i denna bok).
- **Lyckat eller misslyckat**: motståndaren slår pareringsslag (ej i vanlig strid, ej mot projektilvapen).

#### Slå pareringsslag (s. 17)
Inget pareringsslag mot projektilvapen, eller om försvararen av annan anledning inte kan parera. Fortsätt då som om pareringen vore "Misslyckat".

#### Hur man utläser resultaten (s. 17)

| Anfallsslag | Pareringsslag | Resultat |
|---|---|---|
| Fummel | Slås ej | Slå på rätt fummeltabell. |
| Misslyckas | Fummel | Slå på Fummeltabellen för Pareringar. |
| Misslyckat | Misslyckas | Ingenting händer. Fortsätt med nästa attack. |
| Misslyckat | Lyckat eller perfekt | Slå normal skada. Om skadan är högre än anfallarens vapens BV, så minskas dess BV med 1. |
| Lyckat | Fummel | Slå på Fummeltabellen för Pareringar och fortsätt därefter med att bestämma träffområde. |
| Lyckat | Misslyckat | Bestäm träffområde. |
| Lyckat | Lyckat | Slå normal skada. Om skadan är högre än försvararens vapens/skölds BV, så minskas dess BV med 1. Om BV på detta vis blir 0, så tar försvararen den överskjutande skadan. |
| Lyckat | Perfekt | Inget händer. |
| Perfekt | Slås ej | Bestäm träffområde. Attacken gör automatiskt maximal skada. Försvararens rustningsabsorbering dras ej bort. |

Text under "Slå skada" (s. 18), ordagrant: "Om både anfallsslaget och pareringsslaget blev 'lyckade' så har man redan slagit skadan, som minskas med ett." **(tolkning)** Detta syftar på BV-minskningen i raden Lyckat/Lyckat; skadan träffar inte försvararen om inte BV når 0.

### 2.6 Att bestämma träffområde (s. 18)
Används bara i detaljerad strid. Anfallaren kan sikta på en viss kroppsdel med -5 på CL; annars slås 1T20.

Träfftabellen (humanoid, enda tabellen i boken):

| Närstrid 1T20 | Avståndsstrid 1T20 | Träffområde |
|---|---|---|
| 1-2 | 1-3 | Vänster ben |
| 3-4 | 4-6 | Höger ben |
| 5-8 | 7-9 | Mage |
| 9-11 | 10-11 | Vänster arm |
| 12-14 | 12-13 | Höger arm |
| 15-16 | 14-18 | Bröstkorg |
| 17-20 | 19-20 | Huvud |

Andra kroppsformer: ingen tabell här. Draken har bara skydd per zon (Kropp 10, Buk 5, Vingar 1).

### 2.7 Skada, absorbering och KP (s. 18)
- **Slå skada**: vapnets skadetärningar (vapentabellen). I närstrid läggs SB till. Perfekt slag = maximal skada + maximal SB.
- **Absorbering**: rustningens eller det naturliga skyddets abs på det träffade området dras från skadan.
- **Dra skadan**: detaljerad strid: från träffområdets KP **och** från totala KP. Vanlig strid: bara totala KP.
- Exempel (s. 18): kortsvärd 1T6+1, slår 5, orch har läder (abs 2) på magen: 5+1-2 = 4 KP från både magens och totala KP. Stridsyxa 1T10+2 och SB +1T4 mot ringbrynja: 6+2+3-3 = 8 KP. (Obs: exemplet är inkonsekvent med tabellerna: det säger "ringbrynja (abs 6)" men drar 3, och ger stridsyxa 1T10+2 medan vapentabellen ger 1T8+2. Tabellerna i avsnitt 3 bör gälla.)
- Skadebesvärjelser (BLIXT, ELD, FROST) och elementarers skada (utom Gnomens närstridsattacker): bara totala KP, ingen kroppsdel. ENERGISTRÅLE träffar en kroppsdel som en vanlig projektil.

#### Totala KP (s. 18)

| Totala KP | Effekt |
|---|---|
| 2 | Halverad CL på alla färdigheter. |
| 1 | Inga färdigheter alls. Kan bara krypa undan, tala ansträngt. Kan inte lägga första förband eller använda besvärjelser. |
| 0 | Automatiskt medvetslös (chock, blodförlust) i 1T4 timmar. Efter uppvaknande kan han inget göra förrän totala KP är positiva. |
| -FYS | Död. |

#### KP per träffområde (s. 18-19)

| Händelse | Effekt |
|---|---|
| Ett träffområde når 0 KP | **Blödning**: -1 totala KP var sjätte SR tills någon lyckas med Första förband eller HELA E1. |
| Arm eller ben når 0 | Kroppsdelen obrukbar (smärta). Svårt PSY-slag för att fortsätta strida med kvarvarande delar. Ben: står på knä. Arm: hänger slapp. Två armar krävs för Första förband, Läkekonst och för att lägga besvärjelse. |
| Bröstkorg eller mage når 0 | Faller till marken, kan bara krypa undan striden tills hjälp kommer. |
| Huvud når 0 | Omedelbart medvetslös i 1T100-FYS minuter (minst 5 minuter). Kan inget göra förrän huvudets KP är positiva. |
| Dubbelt så mycket skada som kroppsdelen tål | **Kritiskt skadad**. Arm/ben: aldrig normal igen, slå 1T10 på tabellen nedan. Mage/bröstkorg: omedelbar medvetslöshet, förblöder inom FYS SR om inte Första hjälpen med -10 på CL eller HELA E3 stoppar blödningen, **och** offret klarar ett Svårt FYS-slag, annars död. Huvud: krossat eller avhugget, omedelbar död. |
| Varje förlorad KP i en kroppsdel | -2 på CL i alla färdigheter som kräver att den kroppsdelen är hel. Exempel: -3 KP i svärdsarmen ger -6 på alla attacker, även tvåhandsvapen och båge (sparkar påverkas inte). |
| Hälften av KP förlorade i ett ben | Förflyttningen halveras. |

**(tolkning)** "Dubbelt så mycket skada som den tål" = kroppsdelens KP har nått minus sitt maxvärde (skada >= 2 x max).

HELA läggs på en kroppsdel och läker lika mycket av totala KP. Överskott läks på valfri annan plats. Vanlig läkning och Massage fungerar likadant. Massage läker bara skador av trubbiga vapen.

Tabell för kritiska arm- och benskador (s. 18-19):

| 1T10 | Resultat |
|---|---|
| 1-3 | Benet i kroppsdelen är brutet. Måste spjälkas men kan användas i framtiden, dock med -3 på CL i alla färdigheter som kräver att kroppsdelen är hel. |
| 4-5 | Fult sår i armbågen/knäet. Efter sju veckors sängläge läker det så illa att leden aldrig kan böjas igen. Hand/fot fungerar. -4 på CL för alla färdigheter som kräver kroppsdelen. Ben: förflyttningen minskas dessutom till L6. |
| 6-7 | Nervbanorna är av. Kroppsdelen förlamad resten av livet och förtvinar så småningom. |
| 8-9 | Muskler och senor av, läker så småningom. -5 på CL i alla färdigheter som kräver att kroppsdelen är hel. |
| 10 | Benet i kroppsdelen är krossat. Kroppsdelen måste amputeras. |

### 2.8 Infektioner, amputation, läkning (s. 20)
- **Infektioner**: slå för varje kroppsdel efter en strid. Vanligt eggvapen: 1 % per poäng skada. Särskilt smutsiga vapen och djurs naturliga vapen: 3 % per poäng skada. Inte obeväpnad strid och trubbiga vapen. Infektion: 5 % chans att utveckla kallbrand inom 1T4 veckor, då måste kroppsdelen amputeras. Kallbrand i huvud, mage eller bål = död. Med infektion kan man inte hela några KP i den drabbade kroppsdelen. Matt och febrig, inget aktivt i de 1T4 veckor det tar att läka. HELA E4 läker infektion, men inte kallbrand. Ringbrynjedelar i rustningstabellen: "Sår kan inte bli infekterade" (fotnot 1).
- **Amputation**: oförmögen till något aktivt i fyra veckor. FYS minskar permanent med det antal KP den amputerade kroppsdelen hade (påverkar också totala KP).
- **Naturlig läkning**: 1 KP per vecka i varje skadad kroppsdel samt i totala KP. När alla kroppsdelar läkt helt återställs totala KP automatiskt. Kräver vila liggande; annars hälften så fort. Magi, örter och Läkekonst går fortare.

### 2.9 Stridsmoral (s. 20)
Gäller SLP. Inte hjältar och drakar (handlar förnuftigt), inte ointelligenta (INT 0) och inte konstgjorda (odöda, elementarer): de slåss tills de förstörs.

Moralslag slås för varje stridande när:
- Egna ledaren flyr, stupar, ger sig eller tas tillfånga
- Hälften av den egna gruppen är oförmögna att slåss
- Gruppen eller varelsen angrips överraskande
- Varelsen har förlorat mer än hälften av sina KP
- Varelsen angrips av en person som har högre STO och som går bärsärkagång

Moralslag = 1T20 med modifikationer:

| Situation | Modifikation |
|---|---|
| Antal stridskamrater | +antalet |
| Andra stridskamrater har flytt | -antalet x 2 |
| Antal motståndare | -antalet |
| Gruppen/varelsen anfalls från två eller flera håll samtidigt | -2 |
| Gruppens ledare sårad | -5 |
| Gruppens ledare har flytt, stupat eller tagits tillfånga | -10 |
| Varelsen har förlorat mer än hälften av sina KP | -4 |

Resultat **lägre än eller lika med PSY** = måste fly så fort som möjligt; kan han inte fly (omringad) släpper han vapnen och sträcker upp händerna. Slagen 20 = alltid misslyckande. Slagen 1 = alltid lyckat. **(tolkning)** "Misslyckande" betyder här att varelsen flyr, eftersom lågt resultat är dåligt i detta slag.

### 2.10 Särskilda situationer (s. 20-22)

**Obeväpnad strid (s. 20)**: Slagsmål: nävar 1T3+SB (räknas som färdigheten Två vapen, dvs. två handlingar), spark 1T6+SB (en handling: en attack eller en parering). Obeväpnade attacker kan alltid pareras, med eller utan vapen/sköld; obeväpnad försvarare använder Slagsmål (eller stridskonst med "obeväpnad parering"). Misslyckad obeväpnad attack som pareras med vapen (inte sköld): anfallaren tar 1T2-1 KP i armen han anföll med. Vapen kan inte pareras med bara händer utan tekniken "obeväpnad parering". Obeväpnad kan frivilligt ta emot ett vapenanfall med en arm: lyckas anfall och "parering" tar armen normal skada; misslyckas det händer ingenting.

**Två handlingar i samma SR (s. 21)** (två vapen, teknik med två attacker, knytnävar):
- Två anfall: första på normal plats i turordningen, andra **alltid sist i SR**. Flera "sist": inbördes enligt turordningen.
- Två pareringar: två olika attacker, eller samma attack två gånger (misslyckas första får han försöka med andra vapnet). Valet uppges innan SR börjar.
- Ett anfall och en parering: pareringen kommer samtidigt som motståndarens attack, anfallet på normal plats.
- Dubbelslag och Dubbelspark: båda samtidigt på normal plats.

**Fasthållning (s. 21)**: normal attack med CL = (STO+SMI+STY)/3. Lyckas den: anfallarens STY mot försvararens STY på Motståndstabellen. Lyckas det hålls försvararen fast. Nytt motståndsslag varje omgång. Ingen av dem kan göra något annat under tiden.

**Strid i mörker (s. 21)**: utan mörkersyn -15 på CL i anfall och pareringar, minst CL 1. Fackelsken: -5. Varelse med mörkersyn mot varmblodiga varelser: inga modifikationer.

**Liggande strid (s. 21)**: liggande kan bara slåss med dolk, kortsvärd, armborst och naturliga vapen. Närstrid mot liggande: +5 på CL.

**Anfall från sidan (s. 21)**: +3 på CL. Den anfallne får parera.

**Anfall bakifrån (s. 21)**: +7 på CL. Omedveten försvarare får inte parera. Kontroll: anfallaren slår Smyga. Lyckas det slår försvararen Upptäcka fara modifierat med minus anfallarens differensvärde från Smyga. Misslyckas Upptäcka fara har han inte upptäckt anfallaren. Misslyckad Smyga eller lyckad Upptäcka fara = upptäckt, får parera.

**Skada av fall (s. 21)**: 1T6 per meter efter de första tre metrarna.

**Skada av vatten (s. 22)**: hålla andan. Efter cirka två minuter medvetslös, efter ytterligare 1T3 minuter död. Räddad innan dess: ingen skada. Vakuum: samma.

**Skada av eld (s. 22)**: 1T4 första SR, 2T4 andra, 3T4 tredje osv. Rustning skyddar tills eldskadan tränger igenom dess abs; sedan fattar kläderna eld och rustningen skyddar inte alls. Kväva genom att rulla: Normalt SMI-slag. Hjälpare med filt: hjälparen ska klara Normalt SMI-slag. Kasta fackla för att antända något: Svårt SMI-slag, räckvidd STY rutor, 50 % chans att antända (SL justerar, torrt halmtak lättare än fuktigt).

## 3. Tabeller (s. 31-34)
Index: Stridsdiagram s. 31, Skadebonustabell s. 32, Vapentabeller s. 32. Övriga tabeller ligger på s. 31-34 utan exakt sida.

### 3.1 Tabell för förflyttningsförmåga

| STO+FYS+SMI | Förflyttning (rutor/SR) |
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

Rasmodifikationer: Anka -2, Alv +1, Dvärg -2, Halvlängdsman -2, Övriga ±0.

### 3.2 Skadebonustabell (s. 32)

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

### 3.3 Kroppspoängstabell (KP per träffområde efter totala KP)

| Träffområde | 5-7 | 8-11 | 12-15 | 16-20 | 21-25 | 26-30 | 31-35 | 36-40 | per +5 |
|---|---|---|---|---|---|---|---|---|---|
| Bröstkorg | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | +1 |
| Höger ben | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | +1 |
| Vänster ben | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | +1 |
| Mage | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | +1 |
| Höger arm | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | +1 |
| Vänster arm | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | +1 |
| Huvud | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | +1 |

KP under 5 täcks inte av tabellen.

### 3.4 Vapentabeller (s. 32)
Kolumnen "Längd" förklaras inte i denna bok. **(tolkning)** Längd = hur många rutor bort vapnet når utöver intilliggande ruta (jfr s. 16: spjut och hillebarder når en eller flera rutor bort). Ej verifierat.

Obeväpnade stridskonster:

| Namn | Skada | STY-krav | Längd |
|---|---|---|---|
| Normalt slag* | 1T3 | 1 | 0 |
| Dubbelslag | 1T3 | 1 | 0 |
| Normal spark* | 1T6 | 1 | 0 |
| Dubbelspark | 1T6 | 1 | 1 |
| Krosslag | 1T6 | 1 | 0 |
| Hoppspark | 1T8 | 1 | 1 |
| Rundspark | 1T8 | 1 | 0 |

\* Använd antingen FV i stridskonsten eller FV i Slagsmål.

Projektilvapen (alla måste användas med två händer):

| Namn | Skada | STY-krav | Räckvidd | Vikt kg | Pris sm |
|---|---|---|---|---|---|
| Liten båge | 1T4+1 | 9 | 135 m | 1,5 | 150 |
| Kortbåge | 1T6+1 | 17 | 135 m | 2 | 400 |
| Långbåge | 1T8+1 | 29 | 180 m | 3 | 700 |
| Sammansatt båge | 1T10+1 | 29 | 180 m | 3,5 | 1.000 |
| Slunga | 1T6 | 9 | 90 m | 0,5 | 40 |
| Stavslunga | 1T8 | 21 | 120 m | 2 | 80 |
| Blåsrör | spec. | 1 | 20 m | 0,5 | 80 |
| Lätt armborst | 2T4+2 | 25 | 150 m | 5 | 1.300 |
| Tungt armborst | 2T6+2 | 27 | 225 m | 6 | 2.250 |
| Arbalest | 3T6+3 | 31 | 250 m | 8 | 4.000 |

Kastvapen (kan bara användas med en hand):

| Namn | Skada | STY-krav | Räckvidd | Vikt kg | Pris sm |
|---|---|---|---|---|---|
| Kastspjut | 1T6+1 | 11 | STY rutor | 1 | 120 |
| Kastkniv | 1T4+1 | 9 | STY rutor | 0,5 | 100 |
| Kastyxa | 1T6+2 | 9 | STY rutor | 3 | 90 |

Laddningstider: Stavslunga 1 SR, Lätt armborst 3 SR, Tungt armborst 6 SR, Arbalest 12 SR, Övriga 0 SR.

Närstridsvapen (SB läggs till i närstrid):

| Namn | Skada | STY-krav | Längd | Vikt | BV | Pris sm |
|---|---|---|---|---|---|---|
| Knogjärn el. stålhätta | +1 | 1 | 0 | 0,5 | - | 20 |
| Parerdolk | 1T4+1 | 1 | 0 | 0,5 | 13 | 80 |
| Dolk | 1T4+1 | 1 | 0 | 0,5 | 9 | 70 |
| Klubba | 1T6 | 5 | 0 | 1 | 7 | 20 |
| Spikklubba | 1T6+1 | 5 | 0 | 1 | 7 | 30 |
| Kortsvärd | 1T6+1 | 7 | 0 | 2 | 15 | 400 |
| Kortspjut (2) | 1T6 | 7 | 1 | 2 | 11 | 90 |
| Trästav | 1T6 | 7* | 0 | 2 | 7 | 100 |
| Korpnäbb | 1T8 | 7 | 0 | 2 | 15 | 600 |
| Kroksabel | 1T8+2 | 9 | 0 | 3 | 15 | 650 |
| Piska | 1T2 | 9 | 1 | 3 | 3 | 120 |
| Handyxa | 1T6+1 | 9 | 0 | 3 | 11 | 60 |
| Hjälmkrossare | 1T8+1 | 11 | 0 | 4 | 15 | 700 |
| Stridshammare | 1T6+2 | 11 | 0 | 4 | 15 | 850 |
| Stridsyxa | 1T8+2 | 11 | 0 | 4 | 11 | 450 |
| Långspjut (2) | 1T10 | 11* | 2 | 4 | 11 | 300 |
| Bredsvärd | 1T8+1 | 13 | 0 | 4,5 | 15 | 1.000 |
| Stridsgissel | 1T10 | 13 | 0 | 4,5 | 11 | 1.250 |
| Morgonstjärna | 1T8+2 | 13 | 0 | 4,5 | 11 | 1.500 |
| Treudd | 3T6-2 | 15 | 1 | 5 | 11 | 1.000 |
| Bastardsvärd | 1T10+1 | 17 | 0 | 5,5 | 15 | 2.500 |
| Stor träklubba | 2T4 | 21 | 0 | 6 | 11 | 50 |
| Stor spikklubba | 2T4+1 | 21 | 0 | 6 | 11 | 70 |
| Stridsslaga | 1T10+1 | 25 | 0 | 6,5 | 11 | 1.500 |
| Skäggyxa | 2T8+1 | 25 | 0 | 6,5 | 11 | 1.100 |
| Pik | 2T8-1 | 25* | 3 | 6,5 | 11 | 1.900 |
| Lans | 2T8 | 25* (1) | 2 | 6,5 | 15 | 650 |
| Partisan (2) | 2T8+2 | 27* | 1 | 7 | 11 | 1.400 |
| Spetum (2) | 2T8+1 | 27* | 1 | 7 | 11 | 1.250 |
| Glav (2) | 2T10 | 27* | 1 | 7 | 11 | 1.600 |
| Pålyxa (2) | 3T6 | 29* | 1 | 7,5 | 11 | 1.150 |
| Hillebard (2) | 3T6+1 | 29* | 1 | 7,5 | 11 | 1.900 |
| Tvåhandsyxa | 2T10+1 | 31* | 1 | 8 | 11 | 1.900 |
| Tvåhandssvärd | 2T10+2 | 31* | 1 | 8 | 15 | 3.500 |

\* Kan aldrig användas med en hand. (1) Tornerlans kan användas med en hand om man är beriden och kilar fast lansen under armen. (2) Kan användas som trästav, men STY-kravet är detsamma.

### 3.5 Sköldtabell

| Sköldtyp | Skyddar | STY-krav | BV | Vikt kg | Pris sm |
|---|---|---|---|---|---|
| Targ (bucklare) | Sköldarm | 1 | 9 | 1 | 500 |
| Rundsköld, liten | Sköldarm | 3 | 9 | 2 | 650 |
| Rundsköld, stor | Sköldarm+mage+bröstkorg | 11 | 11 | 7 | 1.000 |
| Långsköld (normandisk) | Sköldarm+bröstkorg+"sköldben" | 7 | 11 | 6 | 900 |
| Vanlig sköld (trekantig) | Sköldarm+bröstkorg | 7 | 11 | 6 | 850 |
| Scutata (romersk sköld) | Sköldarm+mage+bröstkorg | 7 | 13 | 8 | 1.100 |
| Pavise (bågskyttesköld) | Sköldarm+mage+bröstkorg+"sköldben" | 18 | 11 | 16 | 900 |
| Läderöverdrag | | +2 | +2 | +2 | +250 |
| Metallskoning | | +3 | +3 | +3 | +500 |

Hur "Skyddar" används mekaniskt står inte här (index: Sköldar, diagram III-36).

### 3.6 Rustningar

Rustningsvikter (**(tolkning)** procentjustering av rustningsvikten efter bärarens storlek):

| STO+STY+FYS | Viktmodifikation |
|---|---|
| -8 | -70 % |
| 9-11 | -60 % |
| 12-14 | -50 % |
| 15-17 | -40 % |
| 18-20 | -30 % |
| 21-26 | -20 % |
| 27-33 | -10 % |
| 34-39 | ±0 % |
| 40-45 | +10 % |
| 46-51 | +20 % |
| 52-57 | +30 % |
| 58-63 | +40 % |
| 64-69 | +50 % |
| för varje ytterligare +6 | +10 % |

Hela rustningar (samma abs överallt; **(tolkning)** täcker hela kroppen):

| Typ | Absorbering | Vikt kg | Pris sm |
|---|---|---|---|
| Tjockt tyg | 1 | 7,5 | 275 |
| Läder | 2 | 11 | 1.300 |
| Nitläder | 3 | 16 | 2.500 |
| Härdat läder | 4 | 13 | 3.500 |
| Ringbrynja | 5 | 35 | 3.700 |
| Förstärkt ringbrynja | 6 | 51 | 4.700 |
| Hel lamellerad rustning | 7 | 28 | 6.000 |
| Hel metallrustning | 8 | 31 | 6.000 |
| Hel laminerad rustning | 9 | 38 | 5.600 |

Rustningstabell (delar per kroppsdel):

| Del (kroppsdel) | Namn | Abs | Vikt kg | Pris sm |
|---|---|---|---|---|
| Hjälm (huvud) | Tyghuva | 1 | 0,5 | 25 |
| | Läderhuva | 2 | 0,5 | 80 |
| | Nitläderhuva | 3 | 1 | 180 |
| | Ringbrynjehuva (1) | 4 | 4 | 300 |
| | Öppen metallhjälm | 6 | 4 | 500 |
| | Ö. metallhjälm m. visir | 6 | 6 | 1.500 |
| | Tunnhjälm (2) | 8 | 6 | 1.000 |
| Armskydd (arm) (3) | Tjockt tyg | 1 | 2 | 50 |
| | Läder | 2 | 3 | 250 |
| | Nitläder | 3 | 5 | 500 |
| | Härdat läder | 4 | 3 | 750 |
| | Lamellerad | 6 | 5,5 | 950 |
| | Metall | 7 | 6 | 1.350 |
| | Laminerad | 8 | 8 | 1.200 |
| Benskydd (ben) (3) | Tjockt tyg | 1 | 3 | 80 |
| | Läder | 2 | 4 | 400 |
| | Nitläder | 3 | 6 | 750 |
| | Härdat läder | 4 | 5 | 1.150 |
| | Lamellerad | 6 | 6 | 1.550 |
| | Metall | 7 | 7 | 1.850 |
| | Laminerad | 8 | 9 | 1.600 |
| Harnesk (bröstkorg och mage) | Tjockt tyg | 1 | 2 | 130 |
| | Läder | 2 | 3 | 600 |
| | Nitläder | 3 | 4 | 1.150 |
| | Härdat läder | 4 | 4 | 1.500 |
| | Ringbrynjeskjorta (1) | 5 | 10 | 1.500 |
| | Förstärkt ringbrynja (1) | 6 | 15 | 1.150 |
| | Fjällpansar | 6 | 14 | 1.500 |
| | Lamellerad | 6 | 10 | 1.550 |
| | Metall | 7 | 12 | 1.900 |
| | Laminerad | 8 | 15 | 1.800 |
| Brynja (bröstkorg, mage, armar) (4) | Ringbrynja (1) | 5 | 16 | 2.000 |
| | Förstärkt ringbrynja (1) | 6 | 24 | 2.500 |
| Brynjehosor (ben) | Ringbrynja (1) | 5 | 15 | 2.500 |
| | Förstärkt ringbrynja (1) | 6 | 22,5 | 3.250 |
| Hauberk (hela kroppen utom huvud) (4) | Ringbrynja (1) | 5 | 32 | 3.500 |
| | Förstärkt ringbrynja (1) | 6 | 48 | 4.500 |
| Helrustning (hela kroppen utom huvud) | Metall | 8 | 25 | 5.100 |

(1) Sår kan inte bli infekterade. (2) -5 på CL på Finna dolda ting och Upptäcka fara. (3) Pris och vikt gäller per par. (4) Ringbrynjehuva kan ingå: lägg då till 3 kg och 200 sm.

Andra straff (SMI, förflyttning, belastning) för rustning anges inte i denna bok. Springa/sprinta kräver ingen rustning (avsnitt 1).

### 3.7 Motståndstabellen och svårighetsgrader
Aktiv egenskap (kolumn) mot motstånd/SG (rad). Slå under eller lika med värdet med 1T20. `†` = automatiskt misslyckande, `A` = automatisk framgång (boken: "-"). Formel som stämmer med varje cell: `mål = 10 + värde - SG`, `>= 20` = A, `<= 0` = †.

| SG \ värde | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 osv |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | A | A | A | A | A | A | A | A | A | A | A |
| 2 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | A | A | A | A | A | A | A | A | A | A |
| 3 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | A | A | A | A | A | A | A | A | A |
| 4 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | A | A | A | A | A | A | A | A |
| 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | A | A | A | A | A | A | A |
| 6 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | A | A | A | A | A | A |
| 7 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | A | A | A | A | A |
| 8 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | A | A | A | A |
| 9 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | A | A | A |
| 10 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | A | A |
| 11 | † | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | A |
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

| Problem | SG |
|---|---|
| Mycket lätt | 1 |
| Lätt | 5 |
| Normalt | 10 |
| Svårt | 15 |
| Mycket svårt | 20 |
| Extremt svårt | 25 |

**(tolkning)** Används för motståndsslag (STY mot STY, PSY mot PSY, FYS mot gifts STY): den aktiva partens värde är kolumnen, motståndarens värde är raden (SG).

## 4. Varelser (s. 23-48)

### 4.1 Format (s. 24-25)

Hemvister (kod, s. 24):

| Kod | Hemvist |
|---|---|
| 1 | Regnskog. Djungler och regnskogar. |
| 2 | Öppen skog. Gles barr-, löv- eller blandskog med stigar, gläntor och vattendrag. |
| 3 | Tät skog. Mycket tät skog utan stigar, gläntor eller vattendrag. |
| 4 | Slätter och öppen kuperad terräng. Odlade fält eller grässlätter med skogsdungar/buskar. |
| 5 | Berg och högland. Som 4 fast högt beläget. |
| 6 | Träsk och sumpmark. Torvmossar, kärr, myrar, kvicksand. |
| 7 | Vattendrag. Floder, insjöar, dammar, källor, vadställen. |
| 8 | Grottor. Hålor, grottsystem, labyrinter, katakomber. |
| 9 | Stäpp. Förtorkad grässtäpp. |
| 10 | Öken. Sand-, sten-, saltöknar och oaser. |
| 11 | Frusna ödemarker. Kalfjäll, glaciärer, tundror, isfält. |
| 12 | Kuster. Sandstränder, sjöklippor och öar. |
| 13 | Öppet hav och stora salta insjöar. |
| A | Magiska platser (magiska, förtrollade, förbannade, välsignade). |
| B | I bebyggelse (städer, byar, slott, herrgårdar, gårdar). |
| C | Nära bebyggelse. I anslutning till B. |
| D | Slagfält/skeppsvrak. |
| E | Ruiner. Som B, fast övergivet. |
| F | Gravplatser (gravhögar, kyrkogårdar, kryptor, katakomber m.m.). |
| G | Avskiljt. |

Koder kombineras: "5B, 8B" = städer i berg/högland och i underjorden.

- **Vanlighet**: Vanlig, Ovanlig, Sällsynt, Mycket sällsynt, Unik. De flesta djur och humanoider ovanliga eller sällsynta, de flesta monster mycket sällsynta.
- **Antal**: hur många man möter åt gången (för humanoider: utanför samhället, eller samhällets storlek).
- **Grundegenskaper**: typvärde = medelvärde. Unga djur kan ha 50 % lägre värden, ledare upp till 50 % högre. För varelser större än människor motsvarar 10 STO ungefär 1 meter (jätte STO 60 ≈ 6 m). Spelbara raser har även tärningsformel.
- **Färdigheter**: typiska färdigheter plus naturliga vapen. "2 Nävar (1T3); 5" = två angrepp med nävarna per SR, FV 5 på vardera, 1T3 skada. I djurtabellerna skrivs "1T6, 8" = skada 1T6, FV 8. "halv SB" och "ingen SB" anger avvikande SB.
- **Förflyttning**: rutor per SR (1,5 m). L, F, S, B, A (se avsnitt 1).
- **Naturligt skydd**: naturlig abs (hud, päls, fjäll).
- **SB** som inte anges i blocket: räkna fram ur Skadebonustabellen (STY+STO). **(tolkning)**
- Vanliga djur (s. 25) anfaller humanoider bara om de känner sig hotade, om ungarna är i fara eller om de är skadade. Flocklevande rovdjur (vargar, lejon) kan anfalla om de är extremt hungriga.

### 4.2 Djur (s. 25-27)

**Björnar (s. 25)** (hemvist/vanlighet ej angivna)

| | Liten björn | Medelstor björn | Stor björn |
|---|---|---|---|
| Antal | 1-2 | 1-2 | 1-2 |
| STY | 14 | 23 | 35 |
| STO | 14 | 23 | 35 |
| FYS | 11 | 11 | 16 |
| SMI | 11 | 11 | 11 |
| INT | 2 | 2 | 2 |
| PSY | 11 | 11 | 11 |
| KP | 13 | 17 | 26 |
| SB | - | +1T6 | +2T6 |
| Nat. skydd | 2 | 3 | 4 |
| Förflyttning | L12 | L12 | L12 |
| 1 Bett (skada, FV) | 1T6, 8 | 1T8, 12 | 1T8, 12 |
| 2 Klor | 1T6, 10 | 1T6, 12 | 1T6, 14 |
| 1 Kram (2T8) | spec. | spec. | spec. |
| Klättra | 12 | 2 | 2 |
| Upptäcka fara | 5 | 5 | 5 |
| Simma | 12 | 10 | 10 |
| Spåra | 12 | 13 | 16 |

Kram förklaras inte närmare i texten.

**Fladdermus (vampyrfladdermus) / Fladdermussvärm (s. 25)**: Hemvist 8; vanlig; antal 1T100 x 10; F20. En RP kan anfallas av upp till 2T6 fladdermöss per SR. SL slår 1T10 per fladdermus: högre än rustningens abs = bettet sitter, 1 KP skada och 10 % risk för sjukdom/infektion. Fastbiten fladdermus gör 1 KP till varje SR den sitter kvar. Bränner man den släpper den; slits den loss med våld: 1 KP skada. Varje lyckat anfallsslag mot svärmen dödar en fladdermus. Varje SR man anfaller svärmen med fackla flyr 1T10 individer.

**Hovdjur (s. 25)**: häst, ponny, åsna, mula, zebra (liten häst). Ston -2 STY och STO (ej mulor).

| | Liten häst | Stor häst | Åsna | Ponny | Mula |
|---|---|---|---|---|---|
| Hemvist | varierar | varierar | varierar | varierar | B, C |
| Vanlighet | vanlig | vanlig | ovanlig | ovanlig | ovanlig |
| STY | 29 | 32 | 20 | 22 | 25 |
| STO | 25 | 28 | 15 | 17 | 17 |
| FYS | 11 | 11 | 11 | 11 | 11 |
| SMI | 13 | 11 | 13 | 11 | 11 |
| INT | 2 | 2 | 2 | 2 | 2 |
| PSY | 11 | 11 | 11 | 11 | 11 |
| KP | 18 | 20 | 13 | 14 | 14 |
| SB | +1T10 | +1T10 | +1T4 | +1T4 | +1T6 |
| Nat. skydd | 1 | 1 | - | - | - |
| Förflyttning | L26 | L24 | L16 | L26 | L20 |
| 1 Bett | 1T4 (halv SB), 8 (alla) | | | | |
| 2 Hovsparkar | 1T8, 8 (alla) | | | | |
| Upptäcka fara | 14 | 17 | 7 | 17 | 7 |

**Hunddjur (s. 26)**: vanlig hund (liten/medelstor/stor), vildhund (medelstor), räv (medelstor), schakal, hyena, prärievarg (stor), varg, ulv.

| | Liten hund | Medelstor hund | Stor hund | Varg | Ulv |
|---|---|---|---|---|---|
| Hemvist | varierar | varierar | varierar | 3, 5, 11 | 3, 5, 11 |
| Vanlighet | varierar | varierar | varierar | vanlig | ovanlig |
| Antal | varierar | varierar | varierar | 2-50 | 1-10 |
| STY | 6 | 8 | 10 | 11 | 15 |
| STO | 4 | 6 | 9 | 7 | 11 |
| FYS | 6 | 8 | 11 | 14 | 14 |
| SMI | 13 | 11 | 13 | 16 | 16 |
| INT | 2 | 2 | 2 | 2 | 3 |
| PSY | 11 | 11 | 11 | 11 | 11 |
| KP | 5 | 7 | 10 | 11 | 13 |
| SB | - | - | - | - | - |
| Nat. skydd | - | - | - | 1 | 2 |
| Förflyttning | L12 | L14 | L12 | L16 | L16 |
| 1 Bett | 1T2, 5 | 1T4, 5 | 1T6, 5 | 1T8, 10 | 1T8, 11 |
| Upptäcka fara | 17 | 17 | 17 | 17 | 17 |
| Spåra | 10 | 12 | 14 | 16 | 15 |
| Smyga | 10 | 10 | 7 | 9 | 7 |
| Gömma sig | 13 | 10 | 8 | 9 | 8 |

**Jättebläckfisk (s. 26)**: Hemvist 13; mycket sällsynt; 1. STY 35, STO 125, FYS 42, SMI 35, INT 0, PSY 11, KP 84, SB +5T6. 2 Tentakelgrepp (1T6): 5; 1 Tentakelsnärt (1T6, halv SB): 5. Nat. skydd 4. S12. Lyckad tentakelattack = offret är omslingrat; loss: offrets STY mot bläckfiskens STY på Motståndstabellen. Bläckmoln 10 x 10 x 10 m förblindar. Tentakler upp till 20 m. Dränker sina byten.

**Kattdjur (s. 26)**: liten = vanlig katt; medelstor = jaguar, puma, gepard, leopard, ozelot, vildkatt, lodjur; stor = lejon, tiger.

| | Liten katt | Medelstor katt | Stor katt |
|---|---|---|---|
| STY | 2 | 11 | 27 |
| STO | 1 | 8 | 19 |
| FYS | 6 | 11 | 12 |
| SMI | 18 | 17 | 16 |
| INT | 2 | 2 | 2 |
| PSY | 11 | 11 | 11 |
| KP | 4 | 10 | 16 |
| SB | - | - | +1T6 |
| Nat. skydd | - | 1 | 2 |
| Förflyttning | L12 | L14 | L16 |
| 1 Bett | - | 1T6, 10 | 1T8, 14 |
| 2 Klor | 1T2, 5 | 1T4, 10 | 1T6, 14 |
| Klättra | 18 | 16 | 14 |
| Upptäcka fara | 17 | 17 | 17 |
| Smyga | 16 | 12 | 8 |
| Gömma sig | 14 | 12 | 10 |

**Klövdjur (s. 26)**: rådjur (liten), hjort, ren, lama, ko, kamel, dromedar (medelstora), gnu, oxe, tjur (medelstor/stor), bison, vicent, myskoxe, vattenbuffel, älg (stora).

| | Litet | Medelstort | Stort |
|---|---|---|---|
| STY | 11 | 17 | 29 |
| STO | 14 | 20 | 29 |
| FYS | 8 | 11 | 17 |
| SMI | 14 | 10 | 13 |
| INT | 2 | 2 | 2 |
| PSY | 11 | 11 | 11 |
| KP | 11 | 16 | 23 |
| SB | - | +1T4 | +1T10 |
| Förflyttning | L14 | L14 | L20 |
| Nat. skydd | - | 2 | 3 |
| 1 Bett | - | 1T4, 5 | 1T4, 5 |
| 1 Stångning | 1T4, 6 | 1T6, 6 | 1T8, 9 |
| 1 Spark | 1T4, 6 | 1T6, 6 | 1T8, 13 |
| Upptäcka fara | 14 | 8 | 11 |

**Orm (s. 27)**: kramormar (pytonorm, boaorm: stora) och giftormar (kobra, skallerorm, mamba, huggorm: medelstora). Nästan alla små och medelstora har gift med valfri effekt.

| | Liten orm | Medelstor orm | Stor orm |
|---|---|---|---|
| STY | 1 | 5 | 23 |
| STO | 1 | 2 | 18 |
| FYS | 5 | 7 | 11 |
| SMI | 19 | 17 | 15 |
| INT | 1 | 1 | 1 |
| PSY | 11 | 13 | 15 |
| KP | 3 | 5 | 15 |
| SB | - | - | +1T6 |
| Förflyttning | L10 | L8 | L8 |
| Nat. skydd | 0 | 0 | 1 |
| 1 Bett eller | 1T2, 9 | 1T4, 9 | 1T6, 11 |
| 1 Kram | - | - | 1T8, 11 |
| Upptäcka fara | 7 | 5 | 5 |
| Gömma sig | 18 | 14 | 16 |
| Smyga | 12 | 10 | 16 |

**Skorpion (s. 27)**: Hemvist 9, 10; ovanlig; 1. STY 1, STO 0, FYS 1, SMI 17, INT 1, PSY 1, KP 1, SB -. 1 Sting (gift): 18. Nat. skydd 0. L2. Dödligt gift om den träffar oskyddad kroppsdel, giftets STY 2T8 beroende på art.

**Spindel (s. 27)**: Hemvist varierar; vanlig; antal varierar. STY 1, STO 0-1, FYS 1, SMI 17, INT 1, PSY 1, KP 1, SB -. 1 Bett (gift): 19. Nat. skydd 0. L2. Farlig bara om giftkörtlar; giftets effekt varierar.

**Husdjur (s. 27)**: gris, get, bock, får, bagge. Vildsvin = tamsvin +5 STY och +5 STO.

| | Tamsvin | Get & får | Bock & bagge |
|---|---|---|---|
| Hemvist | B eller 2 | B eller 5 | B eller 5 |
| Vanlighet | vanlig | vanlig | vanlig |
| Antal | varierar | varierar | varierar |
| STY | 5 | 5 | 7 |
| STO | 6 | 4 | 5 |
| FYS | 11 | 7 | 11 |
| SMI | 7 | 11 | 11 |
| INT | 2 | 2 | 2 |
| PSY | 11 | 11 | 11 |
| KP | 9 | 6 | 8 |
| SB | - | - | - |
| Förflyttning | L10 | L12 | L12 |
| Nat. skydd | 0 | 2 | 2 |
| 1 Spark | - | 1T4, 5 | 1T4, 5 |
| 1 Bett | 1T4, 5 | - | 1T4, 5 |
| 1 Stångning | - | 1T4, 5 | 1T6, 12 |
| Upptäcka fara | 5 | 5 | 5 |

### 4.3 Legendariska varelser (s. 27-47)

#### Spelbara raser (tärningsformel och typvärde)

| Ras (s.) | STY | STO | FYS | SMI | INT | PSY | KAR | KP | Förfl. | Nat. skydd |
|---|---|---|---|---|---|---|---|---|---|---|
| Alv (27) | 2T6+3 (10) | 2T4+6 (11) | 3T6 (11) | 3T6+3 (14) | 4T6 (14) | 3T6 (11) | 3T6+2 (13) | 11 | L10 | Inget |
| Anka (28) | 2T6 (7) | 1T4+2 (5) | 2T6+6 (13) | 2T6+6 (13) | 3T6 (11) | 3T6 (11) | 2T6+1 (8) | 9 | L10 | Inget |
| Dvärg (35) | 4T6 (14) | 2T4+1 (6) | 2T6+6 (13) | 3T6 (11) | 3T6 (11) | 2T6+6 (13) | 3T6 (11) | 10 | L8 | Inget |
| Halvalv (37) | 3T6 (11) | 2T6+6 (13) | 3T6 (11) | 3T6+2 (13) | 3T6 (11) | 3T6 (11) | 3T6+1 (12) | 12 | L10 | Inget |
| Halvlängdsman (38) | 2T6 (7) | 1T3+2 (4) | 2T6+6 (14) | 4T6 (14) | 3T6 (11) | 2T6+6 (13) | 3T6 (11) | 9 | L8 | Inget |
| Halvorch (38) | 3T6+2 (13) | 2T6+4 (11) | 3T6+2 (13) | 2T6+2 (10) | 3T6 (11) | 3T6 (11) | 2T6+1 (8) | 12 | L10 | Inget |

| Ras | Hemvist | Vanlighet | Antal | Färdigheter (FV) | Förmågor och beteende |
|---|---|---|---|---|---|
| Alv | 2G, 3G | Ovanlig | 1-20 | 2 Nävar (1T3) 5, 1 Spark (1T6) 5, Båge 8, Svärd 3, Smyga 8, Gömma sig 6, Upptäcka fara 8, Klättra 12 | Syn ungefär dubbelt så långt som människor, ser hyfsat i natt, blind i absolut mörker. Åldras inte. Immun mot alla sjukdomar och infektioner. RP-alver +4 Upptäcka fara och Lyssna. Gömmer sig hellre än slåss, flyr bort från boningen. Bär pilbåge och kort svärd. |
| Anka | Varierar | Sällsynt | Varierar | 2 Nävar (1T3) 4, 1 Spark (1T6) 4, Smyga 10, Gömma sig 6, Upptäcka fara 6, Klättra 4, Simma 20. Vita: Värdera 14. Bruna och svarta: Ett närstridsvapen 8, Ett avståndsvapen 6. Svarta: Sjökunskap 10, Navigera 10 | RP-ankor FV 20 (B5) i Simma och +4 Smyga. Svarta = piratankor (vanligast), våldsamma men hedersamma. Vita = handel. Bruna = legosoldater/krigare. Föredrar läderrustning och avståndsvapen. Temperamentsfulla. |
| Dvärg | 5B, 8B | Ovanlig | Varierar | 2 Nävar (1T3) 5, 1 Spark (1T6) 5, Ett närstridsvapen 7, Ett avståndsvapen 2, Smyga 4, Gömma sig 5, Upptäcka fara 5, Klättra 2, Hantverk (något) 8, Geologi 5 | Mörkerseende utan ljuskälla, ser lika långt som människa med fackla. Lever 250-400 år. Använder i allmänhet inte magi. RP-dvärgar FV 5 Geologi (primär). Typisk krigare: ringbrynja, tvåhandsyxa eller stridshammare, öppen hjälm. Sällan skrämda. |
| Halvalv | Överallt | Sällsynt | Varierar | 2 Nävar (1T3) 5, 1 Spark (1T6) 5, Ett närstridsvapen 4, Ett avståndsvapen 4, Smyga 5, Gömma sig 5, Upptäcka fara 5, Klättra 5 | Syn och hörsel dubbelt så bra som människor. Dubbel FYS på motståndsslag mot sjukdomar. RP +2 Upptäcka fara och Lyssna. |
| Halvlängdsman | 2, 3, 4, 5 | Ovanlig | Varierar | 2 Nävar (1T3) 4, 1 Spark (1T6) 4, Ett närstridsvapen 2, Ett avståndsvapen 4, Smyga 12, Gömma sig 17, Upptäcka fara 7, Klättra 3 | Lever 80-110 år. RP +4 Gömma sig. Fredliga men uthålliga och modiga i nöd. |
| Halvorch | Överallt | Mycket sällsynta | Varierar | 2 Nävar (1T3) 5, 1 Spark (1T6) 5, Ett närstridsvapen 4, Ett avståndsvapen 4, Klättra 4, Upptäcka fara 6, Smyga 4, Gömma sig 4 | Mörkerseende som dvärgar. RP +4 Slagsmål. Kan lära sig magi. Ofta förbittrade enstöringar. |

#### Övriga legendariska varelser, grundegenskaper (typvärden)

| Varelse (s.) | STY | STO | FYS | SMI | INT | PSY | KAR | KP | SB | Förfl. | Nat. skydd |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Demon, typisk (28) | 26 | 21 | 26 | 26 | 16 | 26 | 1 | 24 | +1T6 | L22 | 6 hud |
| Drake (30) | 100 | 100 | 35 | 22 | 19 | 23 | - | 68 | +6T6 | L14/F52 | Kropp 10, Buk 5, Vingar 1 |
| Enhörning (36) | 35 | 30 | 15 | 15 | 11 | 13 | - | 23 | 2T6 | L26 | 1 skinn |
| Gast (36) | x2 (21) | x1 (11) | 0 (0) | x1 (11) | x1 (11) | x3 (32) | - | =PSY (32) | +1T4 | L10 | Inget |
| Grip (37) | 21 | 14 | 13 | 17 | 5 | 13 | - | 14 | 1T4 | L12/F28 | 4 päls och fjädrar |
| Harpya (39) | 11 | 11 | 11 | 17 | 7 | 11 | - | 11 | 0 | L4/F14 | 1 fjädrar |
| Hydra (39) | 21 | 21 | 22 | 7 | 5 | 11 | - | 22 | 1T6 | L16 | 1 skinn |
| Jätte (39) | 60 | 60 | 22 | 11 | 10 | 11 | 9 | 42 | +4T6 | L18 | 1 skinn |
| Jättespindel (40) | 17 | 17 | 17 | 19 | 7 | 17 | - | 17 | +1T4 | L18 | 5 hud |
| Kentaur (40) | 17 | 26 | 11 | 11 | 11 | 11 | 11 | 16 | +1T6 | L24 | 1 skinn |
| Mantikora (41) | 29 | 28 | 22 | 14 | 7 | 11 | - | 15 | 1T6 | L12 | 4 skinn |
| Minotaur (42) | 35 | 23 | 13 | 13 | 10 | 11 | 9 | 18 | +1T10 | L12 | 3 hud |
| Mumie (42) | 32 | 11 | 0 | 3 | 7 | 2 | - | 6 | +1T6 | L8 | 2 lindor |
| Orch (42) | 14 | 12 | 11 | 11 | 8 | 11 | 7 | 12 | - | L10 | Inget |
| Pegas (43) | 35 | 26 | 13 | 11 | 7 | 16 | - | 20 | +2T6 | F30/L26 | 1 hud |
| Reptilman (44) | 17 | 14 | 13 | 11 | 10 | 11 | 5 | 14 | - | L10/S10 | 3 fjällpansar |
| Rese (44) | 35 | 23 | 13 | 10 | 7 | 11 | 5 | 18 | +1T10 | L10 | 1 hud |
| Sfinx (45) | 26 | 17 | 11 | 17 | 15 | 16 | - | 14 | 1T6 | L14/F20 | 2 päls |
| Skelett (45) | 13 | 11 | 0 | 7 | 2 | 2 | - | 6 | 0 | L6 | Inget |
| Spöke (45) | 0 (0) | x1 (11) | 0 (0) | x2 (21) | x1 (11) | x2 (21) | - | 0 (0) | 0 | A10 | Inget |
| Svartalf (46) | 9 | 7 | 11 | 11 | 9 | 11 | 7 | 9 | - | L10 | Inget |
| Troll (46) | 25 | 25 | 13 | 10 | 7 | 11 | 3 | 19 | +1T6 | L12 | 4 hud |
| Vätte (47) | 7 | 6 | 11 | 13 | 11 | 11 | 7 | 9 | - | L10 | Inget |
| Zombie (47) | 19 | 11 | 0 | 4 | 2 | 2 | - | 6 | 0 | L8 | Inget |

Gast och Spöke: "x2" osv. är multipel av den levande personens värde, typvärdet står inom parentes.

#### Övriga legendariska varelser, hemvist, anfall, färdigheter och förmågor

| Varelse | Hemvist; vanlighet; antal | Anfall och färdigheter (FV) | Förmågor och regler |
|---|---|---|---|
| Demon | Varierar; Mycket sällsynt; 1 | 2 Nävar (1T3) 12, 1 Spark (1T6) 12, 1 Bett (1T8, halv SB) 12, 1 Svanssnärt (1T8) 12, 1T4 Klor (1T8) 12, Ett närstridsvapen 10, Smyga 8, Gömma sig 2, Upptäcka fara 18, Skräckslå 3/0 | 1T6+1 demoniska förmågor (tabell nedan). Kommer bara till världen om en mäktigare demon skickar den eller en demonolog åkallar den. Egoistisk. |
| Drake | 5, 8, G; Mycket sällsynt; 1 | 2 Klor (1T8) 26, 1 Bett (1T8, halv SB) 26, 1 Svanssnärt (1T4) 24, 1 Eldkvast (10T10) 19, Finna dolda ting 19, Smyga 19, Spåra 19, Upptäcka fara (vaken) 19, Upptäcka fara (sovande) 9, Besvärjelser 15, Skräckslå 0/15 | 5-20 m lång. Ser perfekt i mörker; luktsinne identifierar ras, ålder, kön, stämning inom 30-40 m; draksinne låter den avfyra eldkvast med normal träffsäkerhet mot osynliga. Skattpansar på undersidan abs +4, 50 % chans att det har en blotta. Skräckslå: ointelligenta varelser (ridhästar, vakthundar) flyr automatiskt. Den som ser i drakens ögon: normalt INT-slag, annars paralyserad tills draken vänder bort blicken. Drakblod: 1T10 KP frätskada, rustning/sköld skyddar men icke-magisk rustnings abs -1 efter träffen. Vapen som tränger igenom fjällen och gör skada: BV -1T4 permanent (ej magiska vapen). Eldkvast tänder allt brännbart inom räckvidd (räckvidd ej angiven); bara sköldar/rustningar med stark magi, mithril eller drakfjäll skyddar. Efter eldkvast 1T6 SR innan nästa. Drakmagi: KÄNSLOLÄSNING, TANKEÖVERFÖRING, SYN, TANKELÄSNING, KONTROLLERA PERSON, TELEPATI, MAGISK SYN. Älskar gåtor och smicker, hämnas förolämpningar. |
| Enhörning | 2G, 4G, 5G; Mycket sällsynt; 1 | 1 Stångning (1T8) 14, 2 Hovar (1T8) 16, 1 Bett (1T4, ingen SB) 8, Gömma sig 13, Lyssna 22, Smyga 13, Hoppa 13, Upptäcka fara 22 | Immun mot alla gifter. Hornberöring läker 1T6 KP på vänligt sinnad varelse. Upptäcker telepatiskt fientliga varelser; telepati med vänner upp till 100 m. Skygg; anfaller våldsamma/onda varelser med raseri. |
| Gast | Varierar; Mycket sällsynt; 1 | Samma som i levande livet (~1T10+15), Beröra offer 18, Skräckslå 5/15 | Högre odöd. KP = PSY; besvärjelser sänker även KP; skada sänker även PSY; återvinner PSY (och därmed KP) som vanligt. Perfekt mörkersyn, extremt god hörsel, -2 på alla färdigheter i fullt dagsljus. Halv skada av vanliga vapen; full skada av eld, magi, magiska vapen. Beröring: gastens PSY mot offrets FYS på Motståndstabellen, lyckat = offret förlorar 2 FYS permanent och är paralyserat 1T4 SR. Rustning, kläder och SKYDD hjälper inte; MOTSTÅNDSKRAFT minskar förlusten med 1 per femte effektgrad. |
| Grip | 4, 5G; Mycket sällsynt; 1-2 | 2 Klor (1T6) 16, 1 Bett (1T6, halv SB) 12, Finna dolda ting 13, Lyssna 10, Hoppa 14, Klättra 16, Smyga 18, Spåra 18, Upptäcka fara 13 | Jagar hästar inom 1 km (vittring eller syn). Hästar som vittrar grip flyr i panik; bara vältränade stridshästar kan kontrollera paniken. Unge kan tämjas till riddjur. |
| Harpya | 2, 5; Sällsynt; 2-5 | 2 Klor (1T6) 6, Finna dolda ting 11, Upptäcka fara 11 | Fega, anfaller bara i numerärt överläge, i störtdykningar. Besmutsad mat oätbar. Smittobärare: 5 % risk per skada för svår smittosjukdom. |
| Hydra | 5, 8; Mycket sällsynt; 1 | 1 Bett per huvud (1T8) 11, Finna dolda ting 13 | Föds med 2-5 huvuden. 6 eller fler skadepoäng i ett hugg med huggvapen (svärd, yxa, hillebard m.fl.) hugger av ett huvud; inom 1T6+1 SR växer två nya ut om stumpen inte bränns med eld. Fackelattack mot stumpen: halva träffchansen man har med liten träklubba, räcker att träffa. ELD, ENERGISTRÅLE m.fl. räcker att de lyckas. Ointelligent, glupsk. |
| Jätte | Överallt, G; Sällsynt; 1-10 | 2 Nävar (1T3) 5, 1 Spark (1T6) 5, Ett närstridsvapen 6, Upptäcka fara 5, Klättra 2 | Ca 6 m. Inga speciella förmågor. Använder trädstammar som tvåhandsklubbor, bär sällan rustning. Mest fredliga. |
| Jättespindel | 3, 8; Sällsynt; 1-10 | 1 Bett (1T8+gift) 8 (lyckas automatiskt mot offer snärjt i nätet), Klättra 11, Spåra 10, Upptäcka fara 11 | Hoppar upp till 10 m. Går man in i nätet: 1T20 minus egen STO = antal trådar man fastnat i (minst 1). Slita loss: egen STY mot spindelns FYS på Motståndstabellen, ett försök varannan SR, kan krävas flera lyckade. Skära av tråd: 10 KP per tråd, +10 på CL, svärdsarmen måste vara fri (båda armar för tvåhandsvapen). 15 % (3 eller lägre på 1T20) att avhuggen tråd snärtar till: 1T4 KP och klibbar fast. Gift paralyserande, STY = PSY; verkar giftet: medvetslös 1T8+2 timmar. Offret dör efter 1T4+2 dagar i kokongen. |
| Kentaur | 2; Sällsynt; Varierar | 2 Nävar (1T3) 5, 1 Hovspark (1T8) 4, Spjut 8, Båge 5, Smyga 4, Gömma sig 4, Upptäcka fara 12, Sjunga B4, Spela instrument B3, Astrologi 10 | Kan inte lära sig Rida eller Klättra; suveräna på Hoppa. Lever ca 200 år. Bär rustning, långbåge eller bredbladigt spjut och långsmal sköld. |
| Mantikora | 2, 4, 5; Mycket sällsynt; 1-3 | 2 Klor (1T6) 11, 1 Bett (1T8, ingen SB) 11, Svansprojektil (1T4, ingen SB, gift) 9, Svanssnärt (1T10, gift) 11, Lyssna 10, Gömma sig 14, Klättra 14, Smyga 14, Spåra 15, Upptäcka fara 11 | Svans med 1T6+2 taggar, gift STY = PSY. Kan skjuta alla utom en tagg, räckvidd STY rutor; återbildas 1 per dag upp till 7. Kan anfalla med svansen samtidigt som klor eller bett. Rovgirig. |
| Minotaur | Varierar; Sällsynt; Varierar | 1 Bett (1T6, halv SB) 8, 2 Nävar (1T3) 10, 1 Spark (1T6) 5, 1 Stångning (1T6) 6, Tvåhands dubbelyxa 14, Smyga 2, Gömma sig 3, Upptäcka fara 4, Klättra 4 | Ca 2,5 m. Kan inte använda magi. Slåss nästan alltid med enorm tveeggad tvåhandsyxa. Temperamentsfulla, våldsamma. |
| Mumie | Varierar; Sällsynt; Varierar | Varierar 1T20, Smyga 19 | Lägre odöd. Lyder skaparen; order bara inom syn- och hörhåll, annars utför den senaste ordern. Behåller färdigheter utom INT-baserade, kan inte använda besvärjelser. Lindorna brinner: brinnande mumie agerar som vanligt i två SR och faller sedan ihop. Stanken: FYS-kontroll (1T20 under FYS) eller kraftigt illamående 1T4 minuter. Ingen smärta, blöder inte, perfekt mörkersyn. Sällan avståndsvapen. |
| Orch | 8; Ovanlig; Varierar | 2 Nävar (1T3) 5, 1 Spark (1T6) 5, 1 Bett (1T6) 4, Ett närstridsvapen 5, Ett avståndsvapen 4, Smyga 5, Gömma sig 6, Upptäcka fara 6, Klättra 5 | Perfekt mörkersyn, ser suddigt i solsken. Kan aldrig lära sig magi. Bär mest arm- och benskydd. Besegras halva bandet eller ledaren slänger resten ofta vapnen och vill bli följeslagare; på hemmaplan slåss de tills allt hopp är ute. (Exemplet på s. 24 ger orcher hemvist "2, 5 & 8"; blocket säger 8.) |
| Pegas | 5AG; Mycket sällsynt; 1 | 2 Hovar (1T6) 12, 1 Bett (1T4, halv SB) 10, Smyga 10, Spåra 10, Upptäcka fara 16 | Hör sin herres visselsignal upp till tio mil. Måste klara Kritiskt PSY-slag för att följa ned i underjorden. Dör samtidigt som sin herre. Avskyr svartfolk. Vingspann ca 10 m. |
| Reptilman | 6, 7; Ovanlig; Varierar | 2 Klor (1T6) 6, 1 Spark (1T6) 5, 1 Bett (1T8) 6, 1 Svanssnärt (1T4) 4, Spjut 8, Svärd 3, Smyga 6, Gömma sig 4, Upptäcka fara 8 | Helt okänsliga för naturlig eld. Bär högst hjälm och armskydd. Använder harpuner och treuddar. |
| Rese | 2, 3, 5, 8; Sällsynt; 1-2 | 2 Nävar (1T3) 9, 1 Spark (1T6) 9, Ett närstridsvapen 5, Gömma sig 2, Upptäcka fara 3, Klättra 3 | Ca 3 m. Begränsad mörkersyn (som människa med fackla), ingen nedsatt syn i dagsljus. Använder tvåhandsvapen som enhandsvapen. Kan aldrig lära sig magi. |
| Sfinx | 5; Mycket sällsynt; 1 | 2 Klor (1T6) 13, 1 Bett (1T8, halv SB) 9, Finna dolda ting 11, Gömma sig 15, Klättra 15, Lyssna 15, Smyga 17, Spåra 13, Upptäcka fara 14, Övertala 11 | Skonar den som löser hennes gåta. Framtassar med visst grepp. Talar många språk. |
| Skelett | Varierar; Sällsynt; Varierar | Varierar 1T20, Smyga 19 | Lägre odöd, lyder sin herre. Behåller färdigheter utom INT-baserade. **Ingen skada av pilar eller stickvapen (t.ex. dolk och spjut). Ingen skada av vanlig eld.** Ingen smärta, blöder inte, perfekt mörkersyn. Kan bära rustning, vilka vapen som helst. Kan skapas av djur också. |
| Spöke | Varierar; Sällsynt; 1 | Skräckslå 5/10 | Går genom fast materia. Skadas bara av vissa mycket kraftfulla besvärjelser (Bok Magi), inte av vanliga attacker, magiska vapen eller andra besvärjelser. Beröring suger 1 FYS per SR; återfås 1 per vecka; FYS 0 = medvetslös och död. Bundet inom 25 m från dödsplatsen. |
| Svartalf | 3, 5, 8; Ovanlig; Varierar | 2 Nävar (1T3) 4, 1 Spark (1T6) 4, Ett närstridsvapen 4, Ett avståndsvapen 5, Smyga 7, Gömma sig 7, Upptäcka fara 9, Klättra 5, Rida 4 | Rövarband, lojala bara mot ledaren. Kortsvärd, klubbor, kortspjut, kortbågar, lätt läder. Rider tämjda vargar/ulvar. Fega i motgång. Perfekt mörkersyn utomhus på natten, överkänsliga för starkt solsken. Kan aldrig lära sig magi. |
| Troll | 8; Sällsynt; 1-5 | 2 Nävar (1T3) 9, 1 Spark (1T6) 4, 1 Bett (1T6, halv SB) 5, 2 Klor (1T8) 7, Ett närstridsvapen 4, Smyga 2, Gömma sig 2, Upptäcka fara 4, Klättra 2 | Ca 2,5 m. Förstenas omedelbart av rena solstrålar (ej vid dis, dimma, moln). Halverade färdighetsvärden dagtid. Den som ser ett troll närmare än 15 m: PSY-kontroll, misslyckas = Skräcktabellen. **Regenererar 3 KP per SR** som inte orsakats av magi, eld eller magiskt vapen. PSY-kontroll för att gå närmare eld än 3 m. Perfekt mörkersyn, suddig syn i dagsljus. Kan aldrig lära sig magi. Stjäl gärna hästarna först. |
| Vätte | 8; Sällsynt; Varierar | 2 Nävar (1T3) 4, 1 Spark (1T6) 4, Ett närstridsvapen 5, Ett avståndsvapen 4, Smyga 14, Gömma sig 16, Upptäcka fara 6, Klättra 10, Rida 4 | Ca 120 cm. Ser i mörker som människa i dagsljus, ser inget i totalt beckmörker. I starkt solsken: slå INT x 3 eller lägre på 1T100, annars flyr i panik till närmaste skugga. Ett fåtal kan lära sig magi. Vaktposter överallt. |
| Zombie | Varierar; Sällsynt; Varierar | Varierar 1T20, Smyga 19 | Lägre odöd, lyder nekromantikern. Behåller färdigheter utom INT-baserade. Stanken: FYS-kontroll (1T20 under FYS), misslyckas = spyr och kan inget göra under 1 minut. Ingen smärta, blöder inte, perfekt mörkersyn. Stridsuppförande lika listigt som skaparens. |

#### Demoniska förmågor (s. 28-29), 1T20 eller valfritt

| 1T20 | Förmåga |
|---|---|
| 1 | Demonbesudling: naturen runt demonen förvrids; stannar den länge dör all växtlighet för alltid. |
| 2 | Demonisk andedräkt: kväljande stank, rum obrukbara i veckor, missfärgar tyg, papper, målade ytor. |
| 3 | Eldkvast: 2T10 skada, räckvidd 25 m. |
| 4 | Extra huvud: två huvuden med separat INT och PSY. |
| 5 | Explosiv kropp: när KP når 0 exploderar den, 1 skada per STO, minus 1 per meter avstånd. |
| 6 | Frätande blod: 1T6 skada; rustning som träffas får abs -1. Den som skadar demonen med närstridsvapen måste slå under sin SMI med 1T20 för att undvika blodstänk. |
| 7 | Åldra/föryngra: upp till 5 år, demonens PSY mot offrets PSY på Motståndstabellen. |
| 8 | Gift: giftblåsor i huggtänderna, giftets styrka = demonens PSY; verkar bara om bettet gör minst 1 skada efter abs. |
| 9 | Jordbävning: hoppar i marken, alla inom 25 m faller automatiskt omkull. |
| 10 | Kvickhet: anfaller alltid först i varje SR. |
| 11 | Livsuttömning: beröring suger 1T6 FYS permanent; PSY mot PSY. |
| 12 | Magisk osårbarhet: helt resistent mot alla besvärjelser, även elementarbesvärjelser. |
| 13 | Minnesförlust: beröring, offret glömmer en slumpvis färdighet eller besvärjelse permanent; PSY mot PSY. |
| 14 | Osårbarhet: berörs ej av icke-magiska vapen, bara besvärjelser, heliga och magiska vapen. |
| 15 | Regenera: slå 1T10 för antal KP den läker automatiskt varje SR (högst den skada den fått). |
| 16 | Sinnesuttömning: beröring suger 1T6 PSY permanent; PSY mot PSY. |
| 17 | Skräckslå: demonen har Skräckslå 5/25. |
| 18 | Styrkeuttömning: beröring suger 1T6 STY permanent; PSY mot PSY. |
| 19 | Vingar: flyger med samma förflyttning som på marken. |
| 20 | Ökat skydd: naturligt skydd +1T10+1. |

#### KP per träffområde för humanoida varelser (härlett ur Kroppspoängstabellen, inte angivet i blocken)

| KP totalt | Varelser | Bröstkorg | Ben (var) | Mage | Arm (var) | Huvud |
|---|---|---|---|---|---|---|
| 6 | Skelett, Zombie, Mumie | 4 | 3 | 3 | 2 | 3 |
| 9-11 | Anka, Halvlängdsman, Svartalf, Vätte (9), Dvärg (10), Alv (11) | 5 | 4 | 4 | 3 | 4 |
| 12-14 | Halvalv, Halvorch, Orch (12), Reptilman (14) | 6 | 5 | 5 | 4 | 5 |
| 18-19 | Minotaur, Rese (18), Troll (19) | 7 | 6 | 6 | 5 | 6 |
| 24 | Demon | 8 | 7 | 7 | 6 | 7 |
| 32 | Gast | 10 | 9 | 9 | 8 | 9 |
| 42 | Jätte | 12 | 11 | 11 | 10 | 11 |

#### Drakar och Demoner Monster (s. 48)
Hänvisning till tilläggsboxen (ca 150 detaljerade och 200 översiktliga varelser). Omräkning av en ras till rollperson: rasens modifikation = typvärde minus 11; min/max-STO = lägsta/högsta värde med STO-tärningarna. BP-kostnad efter summan av modifikationerna:

| Summa modifikationer | Kostnad i BP |
|---|---|
| Mindre än -2 | 0 |
| -2 till -1 | 5 |
| ±0 till +1 | 10 |
| +2 till +4 | 15 |
| +5 till +6 | 20 |
| +7 till +8 | 25 |
| +9 till +10 | 30 |
| varje ytterligare +1 | +5 |

## 5. Spelledarens uppgift och Liv efter döden (s. 2-13), mekaniskt relevant

- SL slår dolda slag för t.ex. Upptäcka fara, Gömma sig, Finna dolda ting, och får slå låtsasslag (s. 3-4).
- Massbeskjutning kan förenklas: SL behöver inte slå för varje skott, kan sätta en grov chans, "säg 1 på 10" (s. 4).
- Svårighetsgraden ska vara flexibel; undvik antiklimax (hjälte ska inte dö i ett slumpmöte på vägen hem) (s. 3, 6-7).
- Inomhuskartor: en ruta på rutat papper = 2-3 meter (s. 8-10).
- Belöning: pengar och status; exempel "1.000 sm var nu; 1.000 till när ni kommer tillbaka" (s. 8-10). Förbättring av rollpersoner efter avslutat äventyr: "Hur man blir bättre" (Bok I). Inga EP-värden i denna bok.
- Slumpmässiga möten: SL gör egen tabell anpassad till miljön (s. 8-10).
- **Liv efter döden (s. 13)**: dör en RP får spelaren genast skapa en ny som förs in vid lämpligt tillfälle. Egendom får inte "testamenteras" till nästa RP (kamraterna kan förvalta utrustningen).

## 6. Gifter och örter (s. 49-59), kort

Gäller giftiga varelser (skorpion, spindel, jättespindel, mantikora, demon med Gift).

- **Effekt (s. 50)**: motståndsslag, offrets FYS mot giftets STY på Motståndstabellen. Lyckas = Lindrig. Misslyckas med 1-5 = Måttlig. Med 6-10 = Allvarlig. Med mer än 10 = Dödlig. Effekterna läggs på varandra.
- **Tid till verkan**: giftets STY 0: lindrig efter 20 SR, måttlig efter ytterligare 20 minuter, allvarlig inom ytterligare 20 timmar, dödlig efter ytterligare 20 dygn. Dra giftets STY från alla "20" (STY 15 ger 5 SR, 5 min, 5 tim, 5 dygn). STY över 20: 1 SR, 2 SR, 1 minut, 1 timme. STY över 30: 1 SR, 2 SR, 3 SR, 1 minut.
- **Varaktighet**: ett motståndsslag per dygn; lyckat = giftets STY -1. Slagen 1 lyckas alltid. STY 0 = nedbrutet.
- **Gifttyper** (lindrig / måttlig / allvarlig / dödlig):
  - Nervgift: SMI -5 / SMI -15, INT -10, PSY -10 / medvetslös, Svårt FYS-slag per kroppsdel annars permanent förlamad (huvud eller bröstkorg = död) / hjärndöd.
  - Muskelgift: 1T4 KP, SMI -5, PSY -5 / SMI -10, PSY -10, STY -5, varje timme 1T20: 18 = -1 KP i slumpvis kroppsdel, 19 = -1T3 KP i slumpvis kroppsdel, 20 = -1T3 totala KP / medvetslös, Svårt FYS-slag per kroppsdel annars musklerna förtvinade (huvud eller bröstkorg = död) / hjärtstillestånd, död inom FYS SR.
  - Andningsvägar: SMI, INT, PSY -2 / SMI, INT, PSY -5 och -1T4 KP / medvetslös, Normalt FYS-slag per dygn annars -1 INT och PSY permanent / död.
  - Blodomlopp: SMI -3 / -1T4 KP i drabbad kroppsdel och -1T4 totala KP, SMI -7 / -1 KP per minut tills koma, 1T6 per dygn: 4 = -1 INT och PSY permanent, 5 = hand/fot amputeras, 6 = arm/ben amputeras / död.
  - Funktionsnedsättande: SMI -5 / 1T10 funktion utslagen (1 syn, 2 hörsel, 3 matsmältning, 4 känsel, 5 urinvägar, 6 lever, 7 lukt, 8 smak, 9 två funktioner, 10 tre funktioner) / som måttlig men permanent / död.
- Gift på vapen: brygd för "genom sår" doppas på egg/spets, torkar in på ca 1 timme (s. 50).
- Örter: vanlighetssiffran dras från FV vid letande (CL minst 1); handlare har den om 1T10 > vanlighet; pris = vanlighet^3 sm (±20 %).

Läkedroger med KP-effekt (s. 52-54, vanlighetssiffra inom parentes): Cepirbuske 1 KP på 1 minut (vanl. 1); Draklövsek 1T6 KP på en kvart (3); Honungslilja 1T20 KP omedelbart (9); Kardiskt vildvin brännskador 1T6 KP (7); Klubblomster 2T4 KP av krossvapen (4); Kokongträd 3T6 KP på 1 minut (7); Kronhjortshorn 1T4 KP på 1-30 minuter (2); Mirenbuske 10 KP omedelbart (6); Myrblisterbuske 2T20 KP på tio minuter (9); Rödbär 1T10 KP inom en minut (6); Sårlindringslärk 2T10 KP, desinficerande (8); Tågvirkestång köldskador 1T10 KP (9); Årgångsmistel 2 KP (5); Älghornsen 1T6 KP på en timme (2); Utomgårdsbär 15 KP på en timme (17, extremt okänd drog s. 59). Övrigt: Alvhandsbuske stoppar blödningar (7); Kråkfläder stoppar mindre blödningar (2); Undervattensros stoppar blödningar på 1T3 KP/SR (18, extremt okänd drog s. 59); Grönblära motgift STY 5 (3); Älskogsört minskar giftets STY med 15 (6); Mårtistel sänker giftets STY med 2T10 (6); Rödstrimmig spindelskivling stoppar kallbrand (9); Saltsopp halverar infektionsrisken (8); Benhele halverar läkningstiden för benbrott (3).

Stridsrelevanta allmänna droger (s. 55): Forte dubbel styrka 1T4 SR (7); Hårstjälk SMI +4 i 3 SR (4); Indigolilja dubbel hastighet (9); Vargtass +5 CL på vapenfärdigheter i 1 SR (1); Glavbladsklocka mörkersyn 1T4 SR (3); Galdermossa som besvärjelsen ORÄDD (7).

## 7. Notes for a real-time action game

1. **Tidsskala.** Boken: 1 SR ≈ 5 s, ruta = 1,5 m, L10 = 15 m per SR (jogg). **(förslag)** Kör striden med en komprimerad SR (t.ex. 1 SR = 1,2-1,5 s spelad tid) och skala alla "per SR"-värden (blödning var sjätte SR, laddningstider, eld, regenerering, giftets 20 SR) med samma faktor.
2. **Rörelse.** Boken: i närstrid högst halv förflyttning; full förflyttning = jogg utan andra handlingar; springa x2 och sprinta x3 utan handlingar (sprint kräver ingen rustning eller börda). **(förslag)** Halv hastighet medan man har ett anfall eller en parering aktiv, full hastighet annars, sprint bara utan rustning.
3. **Initiativ.** Boken: 1T10+SMI per SR, högst först, andra attacken med två vapen kommer alltid sist. **(förslag)** Gör SMI till en kortare uppladdning före träff (t.ex. uppladdning = bas - SMI x k), och använd 1T10+SMI bara som tie-break när två träffar landar i samma fönster. Andra vapnets attack får längre fördröjning.
4. **Handlingsbudget.** Boken: en attack ELLER en parering per vapen och SR. Vapen + sköld: attack med vapnet och parering med skölden. **(förslag)** Varje hand har en egen nedkylning; en parering förbrukar handens nästa attack. Sköldhanden är fri att blockera medan vapenhanden hugger; anfall med sköldhand -10.
5. **Parering.** Boken: färdighetsslag med vapen eller sköld; projektiler kan inte pareras; kastvapen bara med sköld och bara om man ser kastet; ingen parering med avståndsvapen i handen; ingen parering mot omedveten bakifrånattack. **(förslag)** Blockknapp som startar ett pareringsslag mot FV när en träff kommer in under blocket. Lyckat block mot lyckat anfall: ingen skada, men skadan jämförs med pareringsföremålets BV (BV -1 om skadan är högre; vid BV 0 går överskottet igenom). Perfekt parering = inget händer.
6. **Vanlig mot detaljerad strid.** Boken: vanlig strid (bara totala KP, inget pareringsslag) för djur och monster, detaljerad för personer. **(förslag)** Djur och svärmar använder vanlig strid; humanoider och bossar detaljerad strid med träffområden.
7. **Träffområde.** Boken: 1T20 på närstrids- eller avståndskolumnen; sikta på kroppsdel -5. **(förslag)** Använd tabellen som standard; ett "riktat" tungt slag får -5 CL men väljer zon (huvudet med 17-20 i närstrid är 20 % av alla träffar, så huvudskydd betyder mycket).
8. **Skadeflöde.** Boken: skada + SB (närstrid) minus abs i zonen, dras från zonens och totala KP. Perfekt = max skada och max SB, ingen abs. KP per zon ur Kroppspoängstabellen. Rustning köps per zon (hjälm, arm, ben, harnesk osv.).
9. **Zon-effekter.** Boken: arm 0 = obrukbar (vapen/sköld i den handen går inte att använda, Svårt PSY-slag för att fortsätta med resten); ben 0 = på knä; bröstkorg/mage 0 = faller och kryper; huvud 0 = medvetslös. Zon på 0 blöder 1 total KP var sjätte SR tills Första förband. Varje förlorad KP i en zon ger -2 CL på det som använder zonen; halva benets KP borta = halv fart. Skada >= 2 x zonens max = kritisk (huvud = död). **(förslag)** Visa zonstatus på HUD och låt bandage vara en kanaliserad handling.
10. **Totala KP.** Boken: 2 = halv CL, 1 = inga färdigheter (bara krypa), 0 = medvetslös, -FYS = död. **(förslag)** För spelaren: KP 0 = "nedslagen" med räddningsfönster innan -FYS.
11. **Flank och rygg.** Boken: sida +3 (får parera), bakifrån +7 och ingen parering om försvararen är omedveten (Smyga mot Upptäcka fara med differensvärdet). Liggande mål +5. **(förslag)** Riktningsbaserade bonusar ur angriparens vinkel mot målets blickriktning; smygande tjuv som når ryggen oupptäckt får +7 och oblockerbar träff.
12. **Avstånd och skydd.** Boken: minst en ruta mellan skytt och mål, 50 % risk att träffa någon i vägen, mörker -15, fackelsken -5, mörkersyn mot varmblodiga utan avdrag. Söka skydd: Normalt SMI-slag, skyttens CL minus differensvärdet; kasta sig ned -1 per ruta. Laddning: stavslunga 1 SR, lätt armborst 3, tungt 6, arbalest 12. **(förslag)** En dodge/kasta-sig-handling som ger dessa avdrag mot inkommande projektiler.
13. **Moral.** Boken: SLP slår moral (1T20 + modifikationer, <= PSY = fly/ge upp) vid ledarens fall, halva gruppen ute, överraskning, över halva KP förlorade. Odöda, INT 0, drakar och hjältar slår aldrig. **(förslag)** Kör moralkollen som en händelse när någon av triggarna inträffar; orcher och svartalfer flyr eller ger upp ofta, odöda aldrig.
14. **Miljöskada.** Boken: fall 1T6 per meter efter 3 m; eld 1T4, 2T4, 3T4 ... per SR, rustning skyddar tills elden tränger igenom abs; drunkning efter ca 2 min + 1T3 min. Troll regenererar 3 KP per SR utom av eld/magi, skelett tar ingen skada av stick och pilar. **(förslag)** Gör fackla och eld till kontringsverktyg mot troll, mumier och hydrans halsstumpar.
