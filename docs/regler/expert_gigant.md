# Expert och Gigant: tillegg og endringer for en sanntids-roguelite

Utdrag fra to svenske regelbøker, laget for programmereren av "Svart Nebb under Fristaden". Spillet bygger på DoD 4.0 (1991). Her står det Expert og Gigant legger til eller endrer, i den grad det kan brukes i et sanntidsspill med kamera og kamp som Diablo og Hades.

## Kilder og konvensjoner

- **E** = Drakar och Demoner Expert, Regler (TAMB Äventyrsspel 1987), fil `rules/kingafw/expert_regler.txt`.
- **G** = Drakar och Demoner Gigant, Regelbok (andre trykning 1987), fil `rules/kingafw/gigant_regelbok_2.txt`.
- **M** = Expert Magiboken, nevnt bare der E eller G viser til den.
- Sidetall er trykte sider (E19 = Expert side 19). De er kontrollert mot registeret bak i begge bøkene og mot G sine egne kryssreferanser til E (for eksempel "Rida, se sidan E39").
- Regeltermer, navn og tabeller står på svensk som i bøkene. Forklaringer er på norsk.
- I tabellene er bokas tankestreker byttet ut med vanlig bindestrek: `-` betyr tom rute, "ingen" eller minus, og `1-3` betyr intervallet 1 til 3. `1T6` er en sekssidet terning (T = tärning).
- Gigant skriver ofte "GL" der Expert skriver "CL" (for eksempel "+4 på GL"). Her er begge skrevet CL.
- Der transkripsjonen er ødelagt eller mangler noe, står det `[transkripsjon: ...]`. Tall er ikke gjettet. Der jeg har sluttet meg til noe, står det "trolig".
- Mye fra Expert finnes allerede i DoD 4.0 (detaljerad strid med träffområden, stridsmoral, fummeltabeller, Bärsärkagång, hjältepoäng, stridskonster). Kapittel 0 sier kort hva som er nytt i forhold til 4.0, så det er lett å se hva som faktisk tilfører noe.

## 0. Hva som er nytt i forhold til DoD 4.0

Sjekket mot ferdighetslisten og hjältedåd-kapitlet i DoD 4.0 bok 1:

- **Hjälteförmågor som fast meny** (E64-65, G8): 23 navngitte evner med fast HP-pris. DoD 4.0 har bare kast på tabellen over särskilda förmågor (+2 på kastet per HP) og 5 HP per grunnegenskapspoeng (Expert: 2 HP).
- **Stridskonster i Ereb-Altor** (G37): tre ferdige stridskonster, blant dem **quack-fu**, som ankene har laget. DoD 4.0 har teknikklisten, men ikke de navngitte stilene. Komponentlisten i G avviker noe fra 4.0 (se 9.7).
- **Tabell för skadeeffekter** (G37): straff når Totala KP er 3, 2 og 1.
- **Förflyttningstabell** (G9): fart etter STO+FYS+SMI, Anka -1.
- **Kraftsamlingsfärdigheter** (G11-12): korte buffs (styrka, hastighet, språng).
- **Pilvarianter, nye våpen, parervapen, flere rustninger** (G31-34).
- **Hantverk-kvalitet på våpen og rustning** (E20-21): fem nivåer som endrer skada, BV og abs.
- **Våpenmaterialer** (E58-60): brons, mithril, silver, jade, drakskinn med mer.
- **Ferdigheter som mangler i 4.0**: Judo, Karate, Taktik, Förhöra, Överklasstil, Förklädnad, Skugga, Stadskännedom, Provsmaka, Områdeskännedom, Läkedrogskunskap, Botanik, Fiska, Grottorientering, Ilmarsch, Jaga, Kamouflage, Kanot, Köra vagn, Skidåkning, Skridskoåkning, Rykte (E), og fra G: Rida flygdjur, Spå i kort, Utbrytarkonst, Memorera, Dölja, Lukta dolda ting, Sonaravsökning, Sonarstudie, Teologi, Shamanism, Kastmaskin, Rikta kastmaskin.
- **Nye droger og urter** (G48-57).

### Ankor i Expert og Gigant

Alt bøkene sier om ankor (Svart Nebb er en svart anka):

| Regel | Verdi | Sida |
|---|---|---|
| Socialt ursprung | Vita ankor alltid borgare. Övriga ankor alltid egendomslösa. | E8 |
| Samhällsklasser | Ankor är antingen egendomslösa eller borgare. Blir praktiskt taget aldrig adelsmän. | E70 |
| Språk | Människospråken talas av människor, ankor, minotaurer och halvlängdsmän. | E17 |
| Rida | Ankor kan inte eller vill inte lära sig rida. | E39 |
| Stridsmoral (grundmoral) | Anka (vit) 7, Anka (svart eller brun) 12 | E61 |
| Bärsärkskontroll | Anka 3 | E62 |
| Förflyttning, rasmodifikation | Anka -1 | G9 |
| Stridskonst | Quack-fu (se 9.8) | G37 |

## DEL A: EXPERT

## 1. Grunnbegreper (E3-5)

- **BEP** (belastningspoäng): cirka 3 kg.
- **SR** (stridsrunda): 5 sekunder.
- **CL** (chans att lyckas): FV etter alle modifikasjoner. Slå 1T20 lik eller under CL. Gang og deling gjøres etter pluss og minus (E16-17).
- **Differensnummer**: CL minus terningutfallet. Brukes av mange ferdigheter (E17).
- **Grundegenskaper**: STY, STO, FYS, SMI, INT, PSY, KAR.

### Grupptabellen (E5)

Brukes overalt: baschans (BC) for en ferdighet er gruppeverdien til grunnegenskapen.

| Värde | Grupp | Värde | Grupp |
|---|---|---|---|
| 0-3 | 0 | 131-140 | 17 |
| 4-8 | 1 | 141-150 | 18 |
| 9-12 | 2 | 151-160 | 19 |
| 13-16 | 3 | 161-170 | 20 |
| 17-20 | 4 | 171-180 | 21 |
| 21-25 | 5 | 181-190 | 22 |
| 26-30 | 6 | 191-200 | 23 |
| 41-50 | 8 | 201-210 | 24 |
| 51-60 | 9 | 211-220 | 25 |
| 61-70 | 10 | 221-230 | 26 |
| 71-80 | 11 | 231-240 | 27 |
| 81-90 | 12 | 241-250 | 28 |
| 91-100 | 13 | 251-260 | 29 |
| 101-110 | 14 | 261-270 | 30 |
| 111-120 | 15 | 271-280 | 31 |
| 121-130 | 16 | 281-290 | 32 |
|  |  | 291-300 | 33 |

[transkripsjon: raden 31-40 mangler. Etter mønsteret er den trolig 31-40 = 7.]

### Svårighetsgrader (E5)

| Grad | Modifikation |
|---|---|
| Lätt | Värdet × 2 |
| Normalt | Värdet × 1 |
| Svårt | Värdet × 1/2 (avrunda neråt) |
| Kritiskt | Slå först "1", och sedan ett normalt kast. |

### Perfekt slag, särskilt slag og fummel (E16-17)

- Med FV 1 eller mer lykkes "1" alltid og "20" mislykkes alltid, uansett CL.
- FV 0 og CL 0 eller lavere: to "1" på rad for å lykkes.
- **CL lavere enn 1**: kan ikke slå perfekt. "20" er automatisk fummel.
- **CL 1-19**: "1" gir nytt kast; andre kast lik eller under FV = perfekt. "20" gir nytt kast; andre kast over FV = fummel.
- **CL 20 eller mer**: "1" er alltid perfekt. "2" gir nytt kast; lik eller under FV minus 20 = perfekt. Fummel bare på to "20" på rad.
- **Särskilt slag** (bare der ferdigheten sier det): samme regel som perfekt, men nytt kast utløses av 5 eller lavere på første kast. Med FV 20 eller mer slås ikke andre kast: FV 20-23 gir särskilt på 2-5, FV 24-27 på 2-6, FV 28-31 på 2-7 og så videre. Perfekt går foran särskilt.

## 2. Hur man skapar en rollperson (E7-15)

### Grundegenskaper (E7)

SL velger metode:

- **A.** Terningkombinasjonene i grunnreglene.
- **B.** Slå tre sett etter A, velg det beste.
- **C.** Én av terningene for hver grunnegenskap får automatisk høyeste verdi (människa slår STY med 2T6+6). Ikke for egenskaper som slås med én terning. Anbefales sammen med det alternative stridssystemet.

### Svärdshand (E7)

| 2T10 | Svärdshand |
|---|---|
| 02-14 | Höger |
| 15-18 | Vänster |
| 19 | Båda svärdshand, dock ej samtidigt (dubbelhänt) |
| 20 | Båda svärdshand samtidigt (ambidextrös) |

- Bruke noe man er trent med i svärdshanden, med sköldhanden: CL til 1/3.
- Trene sköldhanden spesielt: dobbelt så dyrt, egen ferdighet.
- Kategori B-ferdighet med sköldhanden: FV -2.
- Sköldhanden er ikke dårligere for Två vapen og Sköld.
- Ambidextrös: kan gjøre helt ulike ting med hver hånd samtidig.

### Socialt ursprung (E7-8)

| 1T20 A (människor) | 1T20 B (halvlängdsmän) | 1T20 C (dvärgar) | Stånd | Förbjudna yrken | Startkapital |
|---|---|---|---|---|---|
| 1-2 | - | 1-3 | Adel | Gycklare | 4T3 × 150 sm |
| 3-6 | 1-5 | 4-11 | Borgare | Riddare | 3T3 × 150 sm |
| 7-10 | 6-15 | - | Skattebonde | Riddare | 3T3 × 150 sm |
| 11-20 | 16-20 | 12-20 | Egendomslös | Riddare, köpman, lärd | 1T3 × 100 sm |

- Alltid borgare: Vita ankor. Alltid skattebönder: Bofasta jättar.
- Alltid egendomslösa: Övriga ankor, kattmän, minotaurer, reptilmän, cykloper, utstötta jättar, svartfolk, vargmän, och människor som lever i primitiva stamsamhällen.
- Karkioner, älvfolk og kentaurer: stand spiller ingen rolle, startkapital 1T20 × 20 sm.

### Ålder (E8-9)

Spilleren velger aldersgruppe; nøyaktig alder slås tilfeldig innen gruppen. Älvfolk og karkioner starter alltid unge og får ingen aldersmodifikasjoner. Den som går ut av gruppen Gammal, pensjoneres.

| | Ung | Mogen | Medelålders | Gammal |
|---|---|---|---|---|
| STY | 0 | 0 | -2 | -3 |
| STO | 0 | 0 | 0 | 0 |
| FYS | 0 | 0 | -1 | -2 |
| SMI | +1 | -1 | -1 | -2 |
| INT | 0 | 0 | +1 | 0 |
| PSY | 0 | +1 | +1 | +2 |
| KAR | 0 | 0 | +1 | 0 |
| Startkapital | × 1 | × 1,5 | × 2 | × 2,5 |
| Bakgrundspoäng | 160 | 220 | 280 | 340 |

[transkripsjon: tabellen over biologisk alder per rase mangler; fotnotene 1) "Omfattar cykloper, dvärgar och jättar" og 2) "Omfattar orcher, resar, svartalfer och svartnissar" hører til den. Eksempel i teksten: mogen människa er 21-35 år, mogen kattman 20-32 år.]

### Rasmodifikationer på baschanser (E9)

| Färdighet | Modifikation |
|---|---|
| Finna dolda ting | Älvfolk +1T3, Dvärg +1T4, Kattman +1T3 |
| Lyssna | Grottalv +1T2, Vargman +1T3 |
| Upptäcka fara | Kattman +1T2, Vargman +1T2 |
| Provsmaka | Vargman +1T3, Halvl. man +1T3 |
| Spåra och Jaga | Vargman +1T3, Kattman +1T2 |
| Orientering | Skogsalv +1T2, Silveralv +1 |

### Yrken i Expert (E9-11)

Yrket bestemmer bare hvilke ferdigheter man kan kjøpe med bakgrundspoäng. Etter start kan alle lære alt. Gigant bygger om alle disse og legger til nye (se 8.2); bruk G-versjonen.

| Yrke (krav) | LÄR | STR | KOM | UPF | TJU | VIL |
|---|---|---|---|---|---|---|
| Gycklare (SMI 9+) | Första Hjälpen, Områdeskännedom | Max ett lätt vapen, judo, slagsmål | Alla | Alla | Alla | Djurträning, Fiska, Jaga, Kanot, Köra Vagn, Orientering, Rida, Simma, Sjökunnighet, Skidåkning |
| Jägare | Första Hjälpen, Områdeskännedom, Zoologi | Max två (båge + ett lätt vapen) | Tala språk | Alla | Hoppa, Klättra, Smyga | Fiska, Grottorientering, Ilmarsch, Jaga, Kamouflage, Kanot, Orientering, Simma, Skidåkning, Skridskoåkning, Spåra, Överlevnad |
| Krigare (STY 9+) | Geografi, Första Hjälpen, Områdeskännedom, Värdesätta, Läsa/skriva språk | Alla, utom Judo och Karate | Förhöra, Tala språk | Upptäcka Fara | Klättra, Hoppa | Fiska, Ilmarsch, Jaga, Kamouflage, Orientering, Rida, Simma |
| Munk | Astrologi, Botanik, Drogkunskap, Första hjälpen, Kulturkännedom, Läkekonst, Läsa/Skriva, Områdeskännedom, Schack & Brädspel, Zoologi | Judo, Karate, Trästav | Bluff, Sjunga & Spela, Tala språk, Teckenspråk, Övertala | Alla | Hoppa, Klättra | Orientering, Simma |
| Köpman (INT 9+) | Administration/juridik, Kulturkännedom, Första Hjälpen, Geografi, Hantverk, Historia, Läsa/skriva språk, Områdeskännedom, Räkning, Språkkunskap, Värdesätta | Ett lätt vapen | Alla | Alla | Stadskännedom | Kamouflage, Kanot, Köra Vagn, Rida |
| Lärd man (INT 9+) | Alla utom magiskolor | Övriga färdigheter: Inga | Tala språk, Förhöra, Överklasstil | Provsmaka | Övriga färdigheter: Inga | Övriga färdigheter: Inga |
| Stråtrövare | Första Hjälpen, Områdeskännedom, Värdesätta | Slagsmål, lätta vapen och sköldar | Bluff, Förhöra, Muta, Teckenspråk | Alla | Hoppa, Klättra, Smyga, Spela Hasard, Undre Världen, Änterhake | Alla utom Navigera och Sjökunnighet |
| Trollkarl (INT 9+) | Magi: Magiskolor och besvärjelser valfritt antal | Inga | Övriga färdigheter: Max fyra valfria (alla typer) | | | |
| Pirat/Sjöfarare | Första Hjälpen, Geografi, Värdesätta | Alla utom Judo och Karate | Förhöra, Tala Språk | Upptäcka Fara | Hoppa, Klättra, Spela Hasard, Stadskännedom, Undre Världen, Änterhake | Fiska, Navigera, Simma, Sjökunnighet |
| Tjuv (SMI 9+) | Första Hjälpen, Värdesätta | Judo, Slagsmål, Dolk, Dra Vapen | Alla utom Överklasstil och Tala Språk | Alla | Alla | Inga |
| Riddare (STY 9+) | Administration/Juridik, Första Hjälpen, Kulturkännedom, Geografi, Heraldik, Historia, Kunskap om Magi, Läsa/Skriva Språk, Områdeskännedom, Räkning, Schack & Brädspel, Språkkunskap | Alla utom Judo och Karate | Alla | Upptäcka Fara | Inga | Ilmarsch, Orientering, Rida |

Trollkarl må også bestå en opptaksprøve (se Magiboken).

### Bakgrundspoäng (E12)

Kostnaden per FV-trinn er ferdighetens kostnad ganger multippelen. Samme tabell brukes for erfarenhetspoäng (kapittel 4).

| FV kategori A | FV kategori B | Multipel |
|---|---|---|
| 1-10 | 1-2 | x1 |
| 11-14 | 3-4 | x2 |
| 15-17 | 5 | x3 |
| 18-20 | - | x4 |

- Kategori A kan ikke være over FV 15 før spillet starter.
- FV fra BC (gruppeverdien) er gratis.
- Over FV 20 (A): multippelen øker med 1 per tre trinn: FV 21-23 ×5, 24-26 ×6, 27-29 ×7 og så videre.
- Ubrukte bakgrundspoäng forsvinner.
- Eksempel (E12): Animism (kostnad 5) til FV 12 = 5×10×1 + 5×2×2 = 70 poäng. Klättra 6 med SMI 18 (grupp 4): FV 4 gratis, kjøp to trinn.

### Livsmål (E12-14)

Hver rollperson velger ett eller flere: Anarkism, Berömmelse, Den starkes rätt, Egoism, Finess, Frihet, Harmoni & barmhärtighet, Jämlikhet, Kärlek, Konservatism, Kunskap, Lag & ordning, Makt, Naturvän, Ridderlighet, Rikedom, Rättvisa-hämnd, Skämt, Stolthet, Stridsära, Upptäckarlust.

Mekanikk: handler man mot et livsmål, får man ångest och skuldkänslor: STY og SMI og deres ferdigheter -1T4 fra handlingen til man har fullført et botgöringsuppdrag (et vanskelig og farlig eventyr som fremmer livsmålet). Bytte av livsmål bare ved overgang til ny aldersgruppe.

Utseendetabeller (ögonfärg, röst, hårfärg, hårlängd, skägg) står på E14. Rent kosmetisk.

## 3. Färdigheter (E15-43)

### Generelt (E15-17)

- Prosentverdier fra grunnreglene er delt på 5; alt slås med 1T20.
- **Kategori A**: skala 0-20 (høyere finnes). Slå 1T20.
- **Kategori B**: skala 0-5, 5 er absolutt maks. Man kan det eller ikke; terning sjelden.
- **BC**: enten 0 (kan ikke brukes utrent) eller gruppeverdien til grunnegenskapen.
- Endres grunnegenskapen, endres ferdighetene som bygger på den like mye.

### Språk (E17)

Kostnad i bakgrunds- og erfarenhetspoäng. Parentes betyr at formen er sjelden (ingen standardisert skrift).

| Namn | Tala | Läsa/skriva |
|---|---|---|
| Människospråken | 4 | 8 |
| Älvspråket | 12 | 12 |
| Dvärgspråket | 12 | 16 |
| Svartiska | 8 | (12) |
| Ödlespråken | 14 | (14) |
| Uråldriga språk | (14) | 14 |
| Drakspråk | 20 | (20) |
| Insektoidspråk | 20 | (20) |
| Modersmålet | 4 | 8 |

### Alle ferdigheter i Expert

Kolonnen "4.0" sier om ferdigheten finnes med samme navn i DoD 4.0 sin ferdighetsliste. Kat = kategori. Fotnote 1 i LÄR: krever Läsa/Skriva 4 i et språk. Fotnote 1 i KOM: krever FV 3 i språket som brukes.

**Lärdomsfärdigheter (LÄR), tabell E18**

| Namn | GE | Kostnad | BC | Kat | Mekanikk | Sida | 4.0 |
|---|---|---|---|---|---|---|---|
| Administration/juridik (1) | INT | 4 | 0 | A | Byråkrati, tillstånd, lagar, brott och straff. | E19 | ja |
| Astrologi (1) | INT | 4 | 0 | A | En natt, klar himmel, tabeller: gynnsamt eller ogynnsamt. Miss = intet svar, fummel = motsatt svar. SL slår dolt. | E19 | ja |
| Botanik | INT | 2 | 0 | A | Identifiera växter. Sommar/tidig höst, en dag: lyckat 1T4 dagsransoner, särskilt 2T4, perfekt 4T4. | E19 | nej |
| Drogkunskap | INT | 5 | 0 | A | Känna till och framställa droger. Kräver laboratorieutrustning. | E19 | ja |
| Läkedrogskunskap (tabellen: Läkeörtskunskap) | INT | 3 | 0 | A | Begränsad Drogkunskap: bara läkande droger. | E19 | nej |
| Giftkunskap | INT | 3 | 0 | A | Begränsad Drogkunskap: bara gifter. | E20 | ja |
| Första hjälpen | INT | 1 | INT | A | Lägger förband, stoppar blödning. | E20 | ja |
| Geografi (1) | INT | 5 | 0 | A | Kunskap om en kontinent. Karta eller bok kanske +1T4. | E20 | ja |
| Geologi (1) | INT | 2 | 0 | A | Identifiera mineral. Vanlig ±0 (1 SR), Ovanlig -5 (1 minut), Sällsynt -10 (3 minuter), M. sällsynt -15 (5 minuter). | E20 | ja |
| Hantverk | INT | 8 | 0 | B | Ett hantverk per färdighet. FV-nivåer påverkar kvaliteten (se under). | E20-21 | ja |
| Heraldik (1) | INT | 1 | 0 | A | Vapenmärken. Utländskt -5, annan ras ytterligare -5. | E21 | ja |
| Historia (1) | INT | 3 | 0 | A | Mycket viktig händelse ±0, Viktig -5, Liten -10, Mycket liten -15. Annat land på samma kontinent -3, annan kontinent -5, per 50 år tillbaka -1. | E21-22 | ja |
| Kulturkännedom (1) | INT | Generell 5, Specifik 1 | 0 | A | Seder och tabun. Vanlig ±0/±0/-3, Ovanlig -1/-3/-5, Sällsynt -3/-5/-10, Mycket sällsynt -5/-10/-15 (A egen specialkultur, B generell, C specialist i annan kultur). | E22 | ja |
| Kunskap om magi (1) | INT | 10 | 0 | A | Teori om magi. Magiker använder sin bästa skolfärdighet i stället. | E22 | ja |
| Läkekonst (1) | INT | 5 | 0 | A | Ett slag per patient och full veckas vård: lyckat = dubbelt så många KP läks den veckan. | E22 | ja |
| Läsa/skriva språk | INT | varierar | 0 | B | 0 Ingenting, 1 Begränsade, 2 Normala, 3 Goda, 4 Utmärkta, 5 Skönskrift. Läsa närbesläktat språk -1, -3 eller -4. | E22-23 | ja |
| Magiskolor | INT | 5 | 0 | A | Se Magiboken. | E23 | ja |
| Områdeskännedom (1) | INT | 2 | 0 (INT för hemlandet) | A | Kunskap om ett land. Karta kanske +1T4. | E23 | nej |
| Räkning | INT | 4 | 0 | B | Nivåer: addition och subtraktion, multiplikation, division, bokföring, geometri. [transkripsjon: numrene mangler, trolig FV 1-5] | E23 | ja |
| Schack & Brädspel | INT | 1 | 0 | A | Se grundreglerna. | E23 | ja |
| Språkkunskap | INT | 2 | 0 | A | Identifiera ett språk (inte förstå det). | E23 | ja |
| Värdesätta | INT | Generell 5, Specifik 1 | 0 | A | Värdera föremål. Miss: felbedömning ±10 % per differenspoäng (-10 eller sämre ±100 %); jämnt tärningsslag = övervärdering, udda = undervärdering. Vanlighetsmod som Kulturkännedom. 12 varugrupper. | E23-24 | 4.0: Värdera |
| Zoologi | INT | 3 | 0 | A | SL svarar på en fråga om ett djur. Vanligt ±0, Ovanligt -5, Sällsynt -10, Mycket sällsynt -15, Unikt -20. Fummel = falsk information. | E24-25 | ja |

**Hantverk, nivåer og effekt på gjenstander (E20-21)**

| FV | Nivå | Effekt |
|---|---|---|
| 0 | Ingenting | - |
| 1 | Lärling | Vapen: skada -2, BV -4, 25 % chans att gå sönder vid varje attack och parering. Rustning: vikt +1, abs -1, 10 % chans varje SR i strid att den lossnar och faller av. |
| 2 | Duglig | Säljs för halva priset. Vapen: skada -1, BV -2. Rustning: abs -1. |
| 3 | Kunnig | Standardkvalitet och standardpris. |
| 4 | Skicklig | Dubbla priset. Vapen: BV +2. Krävs för arbeten i mithril. |
| 5 | Erkänd mästare | Upp till tio gånger priset. Vapen: skada +1, BV +4. Rustning: abs +1. |

**Stridsfärdigheter (STR), tabell E25**

| Namn | GE | Kostnad | BC | Kat | Mekanikk | Sida | 4.0 |
|---|---|---|---|---|---|---|---|
| Dra vapen | SMI | 2 | SMI | A | Dra och använda vapnet samma SR (vapen med FV 10+). Se 5.10. | E25 | ja |
| Judo | SMI | 2 | 0 | A | Kast, fasthållning, parering som absorberar 1T6. Se 5.10. | E25-26 | nej (4.0: Stridskonster) |
| Karate | SMI | 3 | 0 | A | Slag och spark +1 skada, +5 SMI för turordning, blockering -1T6. Se 5.10. | E26 | nej (4.0: Stridskonster) |
| Taktik | INT | 3 | 0 | A | Ledarens FV-grupp läggs till egna sidans initiativslag. Kan få svar på en fråga om fienden. | E26 | nej |
| Två vapen | SMI | 4 | 0 | A | Två attacker, attack och parering, eller två pareringar per SR. Se 5.10. | E26 | ja |
| Övriga vapenfärdigheter | SMI | 2 | SMI | A | Samma FV för anfall och parering. Se 5.10. | E26-27 | ja |

Slagsmål: omfattar knytnäve och spark, BC = STY-grupp + SMI-grupp (E27).

**Kommunikationsfärdigheter (KOM), tabell E27**

| Namn | GE | Kostnad | BC | Kat | Mekanikk | Sida | 4.0 |
|---|---|---|---|---|---|---|---|
| Bluff (1) | KAR | 2 | KAR | A | Lyckat: trodd för stunden, genomskådas inom 1T10+10-INT minuter. Särskilt: genomskådas inte. | E27 | 4.0: Bluffa |
| Förhöra (1) | INT | 3 | 0 | A | Per timme: differensnummer/3 = förhörspoäng. Offret slår INT-slag; lyckat drar av INT-grupp. Bryter ihop när poängen överstiger offrets INT. Perfekt hos offret: bryter aldrig ihop. Fummel hos offret eller perfekt hos förhörsledaren: bryter ihop direkt. Fummel hos förhörsledaren: förlorar alla poäng. | E27-28 | nej |
| Köpslå (1) | KAR | 3 | 0 | A | Båda slår. Högsta differensnummer minus den andres = prisändring i 3 %-enheter. | E28 | ja |
| Muta (1) | KAR | 2 | 0 | A | Mutan minst en dagsinkomst. FV ska övervinna Mutfaktor (Mutkolv 1, Lättmutad 5, Svårmutad 12, Omutbar 20). Miss: ett nytt försök med dubbel muta. Risk att bli anmäld: grund 1-5 på 1T20. | E28 | ja |
| Sjunga & Spela | KAR | 8 | 0 | B | Ett instrument per färdighet. 0-5 (5 Mästare). | E28-29 | 4.0: Sjunga, Spela instrument |
| Tala språk | INT | varierar | 0 | B | Modersmål: INT 16+ FV 5, INT 9-15 FV 4, INT 1-8 FV 3. Närbesläktat -1 eller -2. | E29 | ja |
| Teckenspråk (1) | SMI (tabellen säger INT) | 8 | 0 | B | Ljudlöst yrkesspråk (tjuvar, köpmän). Bara om yrkets ämnen. | E29-30 | ja |
| Överklasstil (1) | INT | 2 | 0 | A | Lyckat: +5 på reaktionstabellen. Fummel: -5. | E30 | nej |
| Övertala (1) | KAR | 2 | KAR | A | Otillåten handling -5, farlig -10 till -15. | E30 | ja |

**Tjuvfärdigheter (TJU), tabell E30**

| Namn | GE | Kostnad | BC | Kat | Mekanikk | Sida | 4.0 |
|---|---|---|---|---|---|---|---|
| Akrobatik | SMI | 8 | 0 | B | 1 Nybörjare (landar på fötterna), 2 Tränad, 3 Kunnig, 4 Erfaren (spänd lina), 5 Mästare (slak lina). Under påfrestning varje SR: PSY-slag och SMI-slag, båda miss = tappar kontrollen. Högst FYS minuter, sedan 30 minuters vila. | E30-31 | ja |
| Förklädnad | INT | 2 | 0 | A | Slag varje timme, och varje gång någon lyckas med Finna dolda ting mot en. Miss = genomskådad. | E31 | nej |
| Gömma sig | INT | 2 | INT | A | I bebyggelse. Sökaren måste lyckas med Finna dolda ting; den gömdes differensnummer modifierar sökarens CL. Kontrasterande kläder -20, kläder som smälter in +5. | E31 | ja |
| Hantera fällor | SMI | 4 | 0 | A | Se Desarmera/Gillra fällor i grundreglerna. | E31 | ja |
| Hasardspel | INT | 2 | 0 | A | 1T20+FV mot motståndarens 1T20+FV, högst vinner insatsen. Fusk upp till +50 % FV. Upptäckt-CL: Upptäcka Dolda Ting + Hasardspel + fusktillägget - fuskarens Hasardspel. | E31-32 | ja |
| Hoppa | SMI | 1 | SMI | A | Se grundreglerna. | E32 | ja |
| Klättra | SMI | 1 | SMI | A | Miss: kan inte fortsätta. Fummel: faller. | E32 | ja |
| Låsdyrkning | SMI | 3 | 0 | A | Se 3.1. | E32 | ja |
| Skugga | INT | 2 | 0 | A | Följa någon oupptäckt. Slag vid knepiga moment eller var (skuggarens FV - offrets FV) minut, minst varje minut. Miss: nytt slag efter 2T6 SR med -10. Fummel: fel riktning 1T6 minuter. Offret får INT-slag eller Skugga-slag varje gång skuggaren missar. | E32-33 | nej |
| Smyga | SMI | 2 | SMI | A | Högst SMI-grupp rutor per SR. -2 per extra ruta, +5 per ruta under. Metallrustning halverar CL. Smygarens differensnummer modifierar andras Lyssna. | E33 | ja |
| Stadskännedom | INT | 1 | 0 (INT för hemstaden) | A | En stad per färdighet. Förorter -1T4. | E33 | nej |
| Stjäla föremål | SMI | 3 | 0 | A | Se 3.1. | E33 | ja |
| Undre världen | INT | 1 | 0 | A | Kontakter, häleri, gömställen. Utomlands -10. Reaktionsslag med FV i stället för KAR. | E33-34 | ja |
| Änterhake | SMI | 1 | SMI | A | Högst STY×1 rutor långt och STY/3 rutor högt. Fummel: 1T6 skada på kastaren. | E34 | ja |

**Uppfattningsfärdigheter (UPF), tabell E34**

| Namn | GE | Kostnad | BC | Kat | Mekanikk | Sida | 4.0 |
|---|---|---|---|---|---|---|---|
| Finna dolda ting | INT | 2 | INT | A | Gömda personer, saker, lönndörrar, fällor. Nytt dolt slag för om en hittad dörr är en fälla; perfekt = vet hur den desarmeras. | E34-35 | ja |
| Lyssna | INT | 2 | INT | A | Summan av alla modifikationer positiv = hör automatiskt. Annars modifierat slag. Se 3.1. | E35 | ja |
| Provsmaka | INT | 3 | 0 | A | Vad man smakar på. Exakt svar / giftigt eller ej: Vanligt ±0/+5, Ovanligt -10/-5, Sällsynt -15/-10. Fummel = SL ljuger. | E35 | nej |
| Upptäcka fara | PSY | 4 | PSY | A | Känsla av att vara hotad ("nackhåren reser sig"). | E36 | ja |

Alle UPF (E34): i rörelse ±0 på den första, -10 på övriga. Koncentration (stå stilla) +5 på den första, -5 på övriga, SL slår en gång per minut. Per koncentrerad minut i sträck: CL-4. Ouppmärksam: halverade.

**Vildmarksfärdigheter (VIL), tabell E36**

| Namn | GE | Kostnad | BC | Kat | Mekanikk | Sida | 4.0 |
|---|---|---|---|---|---|---|---|
| Djurträning | INT | 3 | 0 | A | Tämja och träna djur via träningsvärde. Se 3.1. | E36-38 | ja |
| Fiska | INT | 1 | INT | A | Rev eller ljuster: en dagsranson per timme. Nät: en per 20 minuter. Särskilt ×2, perfekt ×4. Fummel: utrustningen förlorad. | E38 | nej |
| Grottorientering | INT | 5 (3 för dvärgar, grottalver, svartfolk) | 0 (INT för dessa) | A | Orientering inomhus och under jord. | E38 | nej |
| Ilmarsch | FYS | 2 | FYS | A | Efter normal dagsmarsch: slag varje timme, CL -1 per timme efter den första (gäller även SMI-baserade A-färdigheter). Sedan 6 timmars vila; varje extra timme vila tar bort 1 av avdraget. | E38 | nej |
| Jaga | INT | 2 | 0 | A | En dag: lyckat 1T6 dagsransoner, särskilt 2T6, perfekt 4T6. Fummel: strid med farligt djur. Kan göra enkla fällor. | E38 | nej |
| Kamouflage | INT | 2 | 0 | A | Som Gömma sig, men i naturen. Kontrasterande kläder -20, smälter in +5. | E39 | nej |
| Kanot | SMI | 2 | SMI | A | Fors: Lätt +5 (skada 1T6), Medelsvår ±0 (2T6), Svår -5 (3T6). Stor kanot -3. | E42 | nej |
| Köra vagn | SMI | 2 | SMI | A | Slag varje timme på väg, var tionde minut i terräng. Missöde: fast i 3T6 minuter. | E42 | nej |
| Navigera | INT | 3 | 0 | A | Se grundreglerna. | E42 | 4.0: Navigation |
| Orientering | INT | 2 | INT | A | Utomhus. Utan klar himmel halverat FV. Slag vid varje viktigt vägval; fummel = fel väg. | E42 | ja |
| Rida | SMI | 2 | SMI | A | Slag vid avancerade handlingar; miss = faller av. Strid från hästrygg: CL aldrig högre än FV i Rida. Otränad häst i strid: slag varje SR. Ankor kan inte rida. | E39 | ja |
| Simma | SMI | 6 | 0 | B | Se 3.1. | E39-40 | ja |
| Sjökunnighet | INT | 2 | 0 | A | Sjösjuka: -4 på alla CL, INT och SMI halveras. Strid i båt i kraftig sjögång: CL aldrig bättre än Sjökunnighet (väldig sjögång: halva). | E40-41 | ja |
| Skidåkning | SMI | 2 | SMI | A | Slag vid svåra handlingar. Fummel: 1T4 KP. | E41 | nej |
| Skridskoåkning | SMI | 2 | 0 | A | Slag vid svåra handlingar. Fummel: 1T4 KP. | E41 | nej |
| Spåra | INT | 2 | 0 | A | Se 3.1. | E42-43 | ja |
| Överlevnad | INT | Generell 5, Specifik 2 | 0 | A | Vatten, mat, skydd, väder. Generell: halvera FV först. Terränger: Arktisk/tundra, Berg, Djungel, Prärie/savann/stäpp, Skog, Hav, Träsk, Öken. Halv dagsmarsch när man söker mat. | E43 | ja |

Rykte (KOM, KAR, ingen kostnad, BC 0) hører til hjältedåd, se kapittel 6.

### 3.1 Detaljer som kan bli spillmekanikk

**Låsdyrkning (E32).** Utan dyrkset halv chans. Bra dyrkar +1T4 eller +1T6. Låset har svårighetsgrad (SG) 1-50, ibland upp till 75, okänt lås SG 10. Varje SR: färdighetsslag, positiva differensnummer summeras tills summan når SG. Perfekt öppnar direkt. Särskilt fördubblar differensnumret den SR. Fummel, slå 1T6:

| 1T6 | Resultat |
|---|---|
| 1-3 | Låset kärvar. Fortsatta försök har -2 på CL. |
| 4 | Dyrken går sönder, men fastnar inte i låset. |
| 5 | Låset kärvar. Fortsatta försök har -5 på CL. |
| 6 | Dyrken går sönder och en del fastnar i låset. Detta lås måste monteras isär av en låssmed innan man kan öppna det igen. Det hjälper inte ens om man har tillgång till nyckeln. |

**Stjäla föremål (E33).** Lyckat: offret märker det bara på ett perfekt PSY-slag. Miss: offret märker det på ett normalt PSY-slag. Fummel: tagen på bar gärning. Vittnen: SL slår 1T20, "1" vid lyckad stöld, "1-5" vid misslyckad.

| Föremål | CL-modifikation |
|---|---|
| Småsaker i en ficka | -5 |
| Börs | ±0 |
| Hårspänne, hårnål | ±0 |
| Huvudbonad | -10 |
| Örhänge | -10 |
| Brosch, nål, medalj | -5 |
| Halsband, medaljong | -10 |
| Armband | -10 |
| Ring | -15 |
| Bältesspänne | -10 |
| Sak hängande på bälte | ±0 |
| Ankelkedja | -10 |

**Lyssna (E35).**

| Avstånd till ljudet | Modifiering |
|---|---|
| 0-2 meter | +5 |
| 3-5 | +3 |
| 6-10 | +1 |
| 11-20 | ±0 |
| 21-50 | -1 |
| 51-100 | -3 |
| 101-200 | -5 |
| 201-400 | -8 |
| 401-800 | -11 |
| 801-1500 | -15 |
| 1501-3000 | -20 |

| Lyssnaren | Modifiering |
|---|---|
| Slöar | -7 |
| Pratar | -5 |
| Viskar | -2 |
| Skriker | -10 |
| För oljud | -10 |

| Andra faktorer | Modifiering |
|---|---|
| Medvind från ljudet | +1 |
| Motvind från ljudet | -1 |
| Bakgrundsljud | -1 till -10 |
| Tyst bakgrund | +1 till +5 |

| Ljudkälla | Modifiering |
|---|---|
| Armborstskott | +2 |
| Bågskott | ±0 |
| Krossat Glas | +2 |
| Kropp som slår i marken | ±0 |
| Dörr öppnas | ±0 |
| Dörr öppnas försiktigt | -3 |
| Försiktiga steg¹ | -1 |
| Normala steg | ±0 |
| Springande steg | +1 |
| Svärdsstrid | +1 |
| Knytnävsslag | ±0 |
| Nysning | +1 |
| Snarkning | ±0 |
| Viskning | -3 |
| Prat | -1 |
| Högljudd konversation | +1 |
| Skrik | +3 |
| Explosion | +15 |

Fotnot 1 (Försiktiga steg): "Om man lyckas med färdigheten SMYGA får man + MOD. lika med differensnumret." Smyga (E33) sier bare at smygarens differensnummer modifierar Lyssna; retningen er uklar i teksten.

**Spåra (E42-43).** Underlag: Mjukt +10, Medium ±0, Hårt -5. Spårets ålder: upp till 1 timme ±0, 6 timmar -1, 12 timmar -2, 24 timmar -3, 2 dagar -6, 4 dagar -9, 7 dagar -12, 14 dagar -18. Offret blöder +2. "Inside" hjälp +1T4. Regn -2 per timme, snö -5 per timme. Miss: nytt slag efter 2T6×10 minuter med -10. Fummel: fel riktning 1T6 timmar. Offret som döljer spåren: förföljarens CL minus offrets halva FV i Spåra.

**Simma (E39-40).** Kategori B.

| FV | Simnivå | CL vid kontrollslag | Förflyttning |
|---|---|---|---|
| 0 | Kan ej simma | 0 | 0 |
| 1 | Simkunnig | 5+SMIgrupp | 1 |
| 2 | Hyfsad simmare | 10+SMIgrupp | 1 |
| 3 | God simmare | 14+SMIgrupp | 2 |
| 4 | Skicklig simmare | 17+SMIgrupp | 3 |
| 5 | Mästersimmare | 19+SMIgrupp | 4 |

- Strid under vatten: kontrollslag för Simma varje SR innan man får anfalla. Avståndsvapen fungerar inte. Alla andra vapen och sköldar utom dolk, spjut och treudd -5 på CL. Varje träff: normalt FYS-slag, annars förlorar man alla syrepoäng.
- Sikt under vatten: klart vatten högst 10 rutor (15 m), normalt grumligt 1-2 rutor.
- Syrepoäng när man är förberedd: FYS + (FV Simma × 5) + 1T4. Förbrukning per SR: ligger stilla 1, simmar 2, strider 3. Slut: medvetslös, död efter 1T8 + 10 SR. Överlevd syrebrist: 20 % chans att förlora 1T4 INT.
- Långa sträckor: 30 × simFV meter per 5 minuter; snabbt tempo 60 × simFV med lyckat slag.

**Djurträning (E36-38).** Specialisering: upp till FV 10 en djurtyp, FV 11-20 +1, FV 21+ +1. Fel djurtyp -5 och dubbla träningsvärden. Varje vecka: positivt differensnummer dras från träningsvärdet tills det är 0. Tämjning: Husdjur 8, Vilddjur 16 (uppvuxet hos tränaren ×0,5, fångat som vuxet ×1,5). Träning: Stridsträning 24, Inriden 4, trick Lätt 4, Medelsvårt 8, Svårt 16. Lyder kommando: tränarens FV + lydnadsvärde (Riddjur 3, Fåglar 0, Hunddjur 5, Kattdjur 0, Apor 4, Björnar 2, Legendariska djur 0). Djurets FV med naturliga vapen förenklat: STY-grupp + SMI-grupp + 5.

## 4. Träning och erfarenhet (E44-46)

Erfarenhetspoäng (EP) gjelder én bestemt ferdighet og veksles til FV med samme kostnadstabell som bakgrundspoäng (se kapittel 2). Tre måter å få EP på: ensamträning, träning med lärare, erfarenhet genom äventyr.

**Tak.** Trening kan ikke heve en ferdighet over verdien i grunnegenskapen den bygger på. Unntak: alle lärdomsfärdigheter og alle kategori B. Kategori B kan bare forbedres med trening, ikke med erfaring. Ingen andre tak er satt for erfaring; SL kan tillate FV over 20.

**Ensamträning (E45).**
- Normal trening: 8 timer om dagen, 6 dager i uka.
- Hver uke: et normalt egenskapsslag for ferdighetens grunnegenskap. Lyckat = 1 EP.
- 6 timer om dagen: treningstiden +50 %. 4 timer om dagen: +100 %. Ikke mer enn 8 eller mindre enn 4 timer.
- Ikke under pågående eventyr. Kan kombineres med deltidsarbeid. Krever nødvendig utstyr (smie, bibliotek, våpen).

**Träning med lärare (E45).**
- Læreren må være mester: FV 15 (A) eller FV 4 (B), og INT 13 eller mer.
- A: lærerens FV må være minst 3 høyere enn elevens. B: elevens FV kan ikke være lik lærerens.
- Klassestørrelse høyst lærerens INT; elev av annen rase teller som to.
- Alltid 8 timer om dagen, 6 dager i uka. Hver uke slår eleven **to** slag (som ensamträning).
- Modifikationer på CL: per FV læreren har over 18 i en A-ferdighet +1; lærer med FV 5 i B-ferdighet +5; klassen halve kapasiteten eller mindre +5; ensam elev +10.
- Pris per uke: 150 sm (magiker 300 sm). Elev av annen rase ×1,5. Klassen halve kapasiteten eller mindre ×2. Ensam elev × lærerens INT. (Grovarbeiderlønn er 3 sm per dag.)
- EP fra trening kan veksles inn straks de er mange nok.

**Erfarenhet genom äventyr (E45-46).**
- Første vellykkede bruk av en ferdighet etter en søvnperiode på minst 6 timer (2 timer for älvfolk) gir 1 EP. Perfekt slag gir 1T3+1 EP.
- Deretter ingen flere EP i den ferdigheten før man har sovet minst 6 timer igjen.
- EP kan ikke veksles inn under et eventyr; det krever en sammenhengende hvileperiode på minst 7 dager.
- Bonuspoeng etter eventyret (fritt fordelt): fullført oppdrag 1-4, usedvanlig vanskelig dåd 1-2, godt rollespill 1-4. Høyst 10 per eventyr.

| FV kategori A | FV kategori B | Multipel |
|---|---|---|
| 1-10 | 1-2 | x1 |
| 11-14 | 3-4 | x2 |
| 15-17 | 5 | x3 |
| 18-20 | - | x4 |

FV 21+ (A): multippelen øker med 1 per tre poeng (FV 25 har ×6). Eksempel: Överklasstil (kostnad 2): FV 1-10 koster 2 EP per trinn, FV 11-14 4 EP, FV 15-17 6 EP.

## 5. Strid & vapen (E47-62)

### 5.1 Alternativt stridssystem: träffområden (E48-49)

Valgfritt, ment for rollpersoner og viktige SLP. Kroppen deles i träffområden med egne KP, beregnet fra Totala KP (snitt av STO og FYS). Summen av områdenes KP er bevisst høyere enn Totala KP. Boka anbefaler grunnegenskaper slått med metode C sammen med dette systemet [transkripsjon: teksten skriver "metod G", trolig metode C]; da har en människa i snitt 13 KP (spenn 8-18) mot 11 (3-18).

Tabell 1. Humanoider och bevingade humanoider (E48)

| Träffområde | Totala KP 5-7 | 8-11 | 12-15 | 16-20 | 21-25 | 26-30 |
|---|---|---|---|---|---|---|
| Höger ben | 3 | 4 | 5 | 6 | 7 | 8 |
| Vänster ben | 3 | 4 | 5 | 6 | 7 | 8 |
| Mage | 3 | 4 | 5 | 6 | 7 | 8 |
| Bröstkorg | 4 | 5 | 6 | 7 | 8 | 9 |
| Höger arm | 2 | 3 | 4 | 5 | 6 | 7 |
| Vänster arm | 2 | 3 | 4 | 5 | 6 | 7 |
| Huvud | 3 | 4 | 5 | 6 | 7 | 8 |
| Höger vinge | 2 | 3 | 4 | 5 | 6 | 7 |
| Vänster vinge | 2 | 3 | 4 | 5 | 6 | 7 |

Over 30 Totala KP: +1 på hvert område per 5 poeng. Totala KP 1-4: ingen inndeling.

Tabell 2. Kentaurer (E49)

| Träffområde | Totala KP 8-10 | 11-15 | 16-20 | 21-25 | 26-30 |
|---|---|---|---|---|---|
| Höger bakben | 2 | 3 | 4 | 5 | 6 |
| Vänster bakben | 2 | 3 | 4 | 5 | 6 |
| Höger framben | 2 | 3 | 4 | 5 | 6 |
| Vänster framben | 2 | 3 | 4 | 5 | 6 |
| Hästkropp | 8 | 9 | 10 | 11 | 12 |
| Människokropp | 6 | 7 | 8 | 9 | 10 |
| Höger arm | 3 | 4 | 5 | 6 | 7 |
| Vänster arm | 3 | 4 | 5 | 6 | 7 |
| Huvud | 4 | 5 | 6 | 7 | 8 |

Tabell 3. Svan(mö) (E49)

| Träffområde | Totala KP 7-10 | 11-15 |
|---|---|---|
| Kropp | 5 | 6 |
| Höger vinge | 4 | 5 |
| Vänster vinge | 4 | 5 |
| Huvud & hals | 3 | 4 |

### 5.2 Var träffar vapnet (E49-50)

Kolumn A: projektilvapen og nærkamp mot motstander som ikke forsvarer seg (angrep i ryggen). Kolumn B: nærkamp mot motstander som forsvarer seg.

Tabell 4. Humanoid

| A (1T8) | B (1T10) | Träffområde |
|---|---|---|
| 1 | 1 | Höger ben |
| 2 | 2 | Vänster ben |
| 3 | 3 | Mage |
| 4-5 | 4 | Bröstkorg |
| 6 | 5-6 | Höger arm |
| 7-8 | 7-8 | Vänster arm |
| - | 9-10 | Huvud |

[transkripsjon: kolumn A gir ingen treff i hodet og 7-8 på vänster arm; slik står det.]

Tabell 5. Bevingad humanoid

| A (1T10) | B (1T10) | Träffområde |
|---|---|---|
| 1 | 1 | Höger ben |
| 2 | 2 | Vänster ben |
| 3 | 3 | Mage |
| 4-5 (1) | 4 | Bröstkorg |
| 6 | 5-6 | Höger arm |
| 7-8 | 7-8 | Vänster arm |
| 8 | 9-10 | Huvud |
| 9 | - | Höger vinge |
| 10 | - | Vänster vinge |

(1) Träffas varelsen i ryggen är 4 höger vinge och 5 vänster vinge. [transkripsjon: "8" står både på vänster arm og huvud i kolumn A.]

Tabell 6. Kentaur (1T10): A 1-2 / B 1-2 Benen (bara på anfallarens sida), A 3-5 / B 3 Hästkropp, A 6-7 / B 4-5 Människokropp, A 8 / B 6-7 Höger arm, A 9 / B 8-9 Vänster arm, A 10 / B 10 Huvud.

Tabell 7. Svan(mö) (1T8, A og B): 1-3 Kropp, 4-5 Höger vinge, 6-7 Vänster vinge, 8 Huvud & hals.

**Sikta mot en kroppsdel** (E50): -5 på CL, träffar den valda delen om attacken lyckas.

**Besvärjelser** (E50): BLIXT, ELD, FROST og elementarers skada räknas bara från Totala KP. Unntak: ENERGISTRÅLE treffer en kroppsdel, DÖDSHAND treffer kroppsdelen med hjärtat. Besvärjelse knyttet til magisk vapen skadar samma kroppsdel som vapnet.

### 5.3 Effekten av skador (E50-51)

- Skada dras från både Totala KP och träffområdets KP.
- **Område på 0 KP eller lägre**: obrukbart (ben eller vinge viker sig, arm hänger slapp). Inga andra effekter. Första Hjälpen kräver två fungerande armar.
- **Bröstkorg, mage eller kropp på 0 eller lägre**: faller, kan bara krypa och göra Första Hjälpen på sig själv med halverad CL. Blöder 1 poäng Totala KP per halvminut (6 SR) tills Första Hjälpen eller HELA.
- **Huvud på 0 eller lägre**: medvetslös i 40-FYS minuter, sedan oförmögen till allt aktivt tills huvudet läkts till positivt värde.
- **Kritiskt skadad** = dubbelt så mycket skada som delen tål. Arm, ben, vinge: avhuggen eller måste amputeras (1T100 % av delen). Bröstkorg, mage, kropp: omedelbar medvetslöshet, förblöder inom FYS SR om inte Första Hjälpen eller HELA. Huvud: krossat eller avhugget, omedelbar död.
- Skada över dubbla KP i arm, ben eller vinge försvinner (räknas varken från delen eller Totala KP).
- **Totala KP 0**: svimmar av blodförlust i 1T4 timmar. **Totala KP lik minus FYS**: död.
- HELA läggs på en kroppsdel men läker lika många poäng Totala KP; överskott läks valfritt annanstans.
- Mer än halva KP förlorade i ett ben: förflyttning halveras. Varelser utan detta system: förflyttning halveras vid mer än halva Totala KP, de försöker dra sig ur striden, flygande nödlandar.
- Träffar en attack armen med skölden, måste den först tränga igenom skölden även om sköldpareringen misslyckades.

**Infektion (E51).** Älvfolk immuna. Efter striden slås för varje träffad kroppsdel: vanliga vapen 1 % per träff, naturliga vapen (utom knytnäve och spark) eller särskilt smutsiga vapen 3 % per träff. Infektion: 5 % chans till kallbrand inom 1T4 veckor (amputation; i huvud eller bål död). Infekterad del läks inte. Infektion utan kallbrand läks på 1T4 veckor eller av HELA E4. Efter amputation: inaktiv fyra veckor, FYS minskas permanent med delens KP.

### 5.4 Särskild eller perfekt träff (E51)

- **Särskild träff**: vapnets maximala skada plus maximal SB.
- **Perfekt träff**: samma, och målet får inte räkna någon form av rustning eller skydd.

### 5.5 Rustningar (E51-53)

En rustningsdel per kroppsdel. Absorption läggs till varelsens naturliga skydd.

| Namn (kroppsdel) | Abs | Vikt |
|---|---|---|
| **Hjälm (huvud)** |  |  |
| Läderhuva | 2 | 0 |
| Nitläderhuva | 3 | 0,25 |
| Öppen hjälm | 4 | 0,5 |
| Romersk hjälm | 6 | 1 |
| Tunnhjälm³ | 8 | 1,5 |
| **Armskena (arm)¹** |  |  |
| Tjockt tyg | 1 | 0,5 |
| Läder | 2 | 1 |
| Nitläder | 3 | 1,5 |
| Metallskena | 8 | A |
| **Benskena (ben)¹** |  |  |
| Tjockt tyg | 1 | 0,5 |
| Läder | 2 | 1 |
| Nitläder | 3 | 1,5 |
| Metallskena⁴ | 8 | A |
| **Kilt (mage)** |  |  |
| Tjockt tyg | 1 | 0,5 |
| Läder | 2 | 0,5 |
| Nitläder | 3 | 1 |
| **Harnesk (bröstkorg och mage)** |  |  |
| Tjockt tyg | 1 | 0,5 |
| Läder | 2 | 1 |
| Nitläder | 3 | 1,5 |
| Fjällpansar | 5 | B |
| Ringbrynja | 6 | B |
| **Kyrass (bröstkorg)²** |  |  |
| Metallkyrass | 8 | B |
| **Kort brynja (armar, bröstkorg², mage)** |  |  |
| Ringbrynja | 6 | D |
| **Lång brynja (armar, bröstkorg, mage, ben)** |  |  |
| Ringbrynja | 6 | F |
| **Helrustning (hela kroppen)** |  |  |
| Metall⁵ | 8 | K |
| **Täcke (kentaurens hästkropp)** |  |  |
| Tjockt tyg | 1 | G |
| Läder | 2 | E |
| Nitläder | 3 | F |
| Fjällpansar | 5 | H |
| Ringbrynja | 6 | J |

Rustningar för varelser utan det alternativa systemet (täcker hela kroppen):

| Namn | Abs | Vikt |
|---|---|---|
| Tjockt tyg | 1 | A |
| Läder | 2 | C |
| Nitläder | 3 | E |
| Lätt fjällpansar | 4 | F |
| Fjällpansar | 5 | G |
| Ringbrynja | 6 | H |
| Förstärkt ringbrynja | 7 | J |
| Helrustning⁵ | 8 | K |

Fotnoter (E52): ¹ Pris och vikt gäller för par. ² Gäller även kentaurens människokropp. ³ Halverar alla uppmärksamhetsfärdigheter. ⁴ Kan inte användas av kentaurer. ⁵ Kan endast tillverkas av dvärgsmeder. Halverar alla uppmärksamhetsfärdigheter. Kan inte användas av kentaurer. ⁶ Varelser med STO 1-4 kan bara ha läderrustning över hela kroppen (0,5 BEP per STO, abs 2). Bevingade humanoider: högst läder på bröstkorg och mage; vingar kan inte pansras.

**Vikt efter viktbokstav (E53).** Bokstav i stället för vikt beräknas efter bärarens STO.

| Viktbokstav | STO 5-8 | 9-12 | 13-16 | 17-20 | 21-25 | 26-30 |
|---|---|---|---|---|---|---|
| A | 1,5 | 2,0 | 2,5 | 3,0 | 3,5 | 4,0 |
| B | 2,0 | 2,5 | 3,0 | 3,5 | 4,0 | 4,5 |
| C | 2,5 | 3,0 | 3,5 | 4,5 | 5,0 | 6,0 |
| D | 3,0 | 4,0 | 5,0 | 6,0 | 7,0 | 8,0 |
| E | 4,0 | 5,0 | 6,5 | 7,5 | 9,0 | 10,0 |
| F | 4,5 | 6,0 | 7,5 | 9,0 | 10,5 | 12,0 |
| G | 5,5 | 7,0 | 9,0 | 10,5 | 11,5 | 13,0 |
| H | 6,0 | 8,0 | 10,0 | 12,0 | 14,0 | 16,0 |
| J | 7,0 | 9,0 | 11,5 | 13,5 | 16,0 | 18,5 |
| K | 7,5 | 10,0 | 12,5 | 15,0 | 17,5 | 20,0 |

Kentaurer har egen STO-rad i overskriften: 16-21, 22-28, 29-36. [transkripsjon: hvilke kolonner disse tre hører til, kommer ikke fram.]

**Pris (E53).** Rustningsdelar: vikt × materialpris. Hjälmar har fast pris.

| Material | sm/BEP | Hjälmtyp | sm |
|---|---|---|---|
| Tjockt tyg | 20 | Läderhuva | 15 |
| Läder | 25 | Nitläderhuva | 35 |
| Nitläder | 70 | Öppen hjälm | 100 |
| Fjällpansar | 150 | Romersk hjälm | 200 |
| Ringbrynja | 175 | Tunnhjälm | 300 |
| Metall | 200 |  |  |

**Allmänna kommentarer (E53).** Fjällpansar och tyngre klirrar: halverar CL för Smyga. Att ta på en rustningsdel: 2 minuter med hjälp, 3 utan. Helrustning = sju delar. Utan ljus dubbel tid.

### 5.6 Attacker sist i SR och Fasthållning (E53)

- Flera regler säger att en attack kommer sist i SR. Inbördes ordning mellan sådana: högst SMI först.
- **Fasthållning**: vanlig slagsmålsattack; lyckas den ska anfallaren övervinna försvararens STY med sin STY (motståndstabellen). Varje runda nytt STY mot STY. Ingen av dem kan göra något annat under tiden.

### 5.7 Vapen som kräver specialregler (E54-55)

- **Bola**: säg först vad du vill uppnå. Lyckat anfallsslag = träff; sedan ett vanligt FV-slag. Lyckas det händer det avsedda, annars bara 1T4 skada. Två ben: ingen förflyttning, springande faller, gående SMI-slag. Arm: armen oanvändbar. Huvud: omtumlad 1T3 SR, kan bara förflytta sig. 1T3 SR att ta bort.
- **Lasso**: som bola, men inget händer vid miss på FV-slaget. Rycka omkull: egen STY mot medelvärdet av målets STO och SMI. Snara om halsen eller två ben: användarens STY dubblas.
- **Oxpiska**: som lasso, men alltid 1T2 skada även vid miss på andra slaget, och greppet varar bara den SR den träffar. Svinga sig i piska: bara hjältar, kostar 1 HP.
- **Fotanglar**: 10 per kvadratmeter för säker effekt (2 SR att lägga ut), varje saknad ger 10 % chans att klara sig. Gående i god belysning klarar sig automatiskt; springande svårt SMI-slag varje SR; i mörker kan de inte undvikas. Kastade: träffchans -1T6×10 %. 10 fotanglar = 1 BEP. Ingen KP-skada; utan skodon halveras förflyttningen i 24 timmar (HELA E1 tar bort). Rensa: 5 SR per kvadratmeter, 10 i mörker.
- **Lans eller spjut från galopperande riddjur**: minst 15 m ansats, hästens SB i stället för egen. Övervinner skadan (inkl. SB) den träffade ryttarens STO kastas han 1T4 m ur sadeln.
- **Spjut mot springande varelser**: långspjut mot stormande varelse första SR; lyckas attacken gör den vapnets skada plus målets SB.
- **Stridsslaga och andra vapen med kätting**: den som parerar får halverad CL. Användaren: 18-20 är automatisk miss med risk för fummel.
- **Blåsrör**: ingen KP-skada. Förgiftad pil tränger igenom om 1T8 > målets rustningsabsorption.

### 5.8 Sköldar (E55)

- Kan parera kastvapen om sköldbäraren ser kastet. Pilar, skäktor och slungstenar kan inte pareras.
- Projektil på sköldsidan som inte pareras: slå 1T20, träffar skölden (måste tränga igenom) på Stor sköld 1-6, Medelstor 1-4, Liten 1-2.
- I det alternativa systemet skyddar skölden kroppsdelar: Stor = sköldarm + mage + bröst (kentaur: sköldarm + människokropp), Medelstor = sköldarm + bröst (eller sköldarm + människokropp), Liten = sköldarm.
- **Sköldars tålighet**: vid lyckad parering, för varje skadepoäng över sköldens absorption 1/20 chans att skölden förstörs.
- Expert har ingen egen tabell med sköldvärden (de står i grundreglerna). Gigant har en, se 9.5.

### 5.9 Avståndsvapen (E55-56)

- **Miss**: projektilen fortsätter rakt 50 % längre än avståndet till målet (högst maximal räckvidd). Varje tänkbart mål i banan (1 ruta bred) träffas med 1 % per STO-poäng.
- Modifiera först för avstånd, sedan för målets rörelse (avrunda nedåt).

| Målets rörelse | Modifikation |
|---|---|
| Stilla | x1 |
| Går | x3/4 |
| Springer | x1/2 |
| Flyger | x1/4 |

Avståndstabell för FV 0-15

| Avstånd i rutor | Kastvapen | Projektilvapen |
|---|---|---|
| 1 | Går ej | Går ej |
| 2-3 | ±0 | ±0 |
| 4-6 | -1 | ±0 |
| 7-10 | -2 | -1 |
| 11-15 | -3 | -1 |
| 16-20 | -4 | -2 |
| därefter för varje +10 meter | -1 | -1 |

Avståndstabell för FV 16+

| Avstånd i meter | Kastvapen | Projektilvapen |
|---|---|---|
| 1 | Går ej | Går ej |
| 2-3 | ±0 | ±0 |
| 4-6 | -1 | ±0 |
| 7-10 | -2 | -1 |
| 11-15 | -3 | -1 |
| 16-20 | -4 | -2 |
| därefter avstånd i meter |  |  |
| 31-50 | -5 | -3 |
| 51-75 | -6 | -4 |
| 76-100 | -7 | -5 |
| 101-150 | -8 | -6 |
| 151-200 | -9 | -7 |
| 201-250 | -10 | -8 |
| osv. upp till vapnets räckvidd |  |  |

[transkripsjon: første tabell sier "rutor" i overskriften, andre "meter"; intervallet 21-30 mangler i andre tabell. Slik står det.]

### 5.10 Stridsfärdigheter i detalj (E25-27)

- **Dra vapen**: dra och använda vapnet samma SR, för vapen man har FV 10+ i. Normalt tar dragningen en hel SR. Krav: båda händerna fria, vapnet lättåtkomligt. Modifikationer: endast svärdshanden fri -2, endast sköldhanden fri -10, vapnet på ryggen -5, i stöveln -5, innanför kläderna omöjligt. Lyckat: normal handling samma SR, men motståndare med vapnet redo slår först. Särskilt: turordning som vanligt. Perfekt: slår först även mot motståndare med vapnet redo. Miss: vapnet draget men ingen attack. Fummel: som miss, och misslyckas ett normalt SMI-slag tappas vapnet i samma ruta.
- **Judo**: kast mot humanoid. FV + SMI ska övervinna offrets STO + SMI. Offret kan blockera med sitt FV i Judo. Judo sker sist i SR. Lyckat kast: offret flygs 0-2 (1T3-1) rutor i valfri riktning och måste slå SMI-slag eller FV i Judo/Karate (bästa), annars 1 KP. Hålla fast liggande: Judo-FV mot medelvärdet av offrets SMI och STY, nytt slag varje SR. Parering med Judo absorberar 1T6 av skadan; man kan anfalla och parera samma SR. Högst ringbrynja.
- **Karate**: slag och sparkar +1 skada. +5 på SMI vid turordning. I stället för anfall kan man blockera en närstridsattack: lyckat = attackens skada -1T6. Skadas inte av att sparka på metallrustning. Högst läderrustning.
- **Två vapen**: två attacker, en attack och en parering, eller två pareringar per SR. Första attacken (svärdshand) på vanlig plats, andra (sköldhand) efter alla andra attacker. Varje vapenkombination är en egen färdighet. Otränad kombination -15 på FV.
- **Vapenfärdigheter**: samma FV för anfall och parering. Alla vapen inom en vapengrupp har minst 1/3 (avrundat nedåt) av högsta FV i gruppen. Vapengrupper: Sköldar, Dolkar, Enhandsvärd, Övriga svärd, Stavar, Yxor, Klubbor & Hammare (inkl. morgonstjärna), Spjut, Slagor & Gissel, Stångvapen, Bågar, Slungor, Armborst, Kastvapen, Lasso, Piskor, Bola, Slagsmål & Judo, Karate.
- **Extra vapenskicklighet** (E27): CL 20 eller mer med ett vapen kan delas i bitar på minst 10 vardera, fritt som attacker eller pareringar. En attack kan bara pareras en gång. Första attacken på vanlig plats, resten sist i SR.
- **Obeväpnad mot metallrustning** (E27): 1 KP skada på den som slår eller sparkar, varje träff (inte Karate).

### 5.11 Vapens tyngd, flera motståndare, vapenlängd (E56)

- Enhandsvapen med STY-grupp ett steg för hög: kan användas tvåhands om fästet räcker, men som separat färdighet. Inte kastvapen.
- Vapen eller sköld med STY-grupp ett steg för hög med korrekt fattning: halverad CL.
- 1-2H: STY-kravet gäller tvåhands; enhands kräver ett steg högre. Samma färdighet för båda fattningarna.
- **Strid mot flera motståndare**: FV 20+ i närstridsvapen eller sköld kan delas i bitar med CL 10+ vardera, fördelade mellan handlingar och motståndare. En motståndare med FV 20-29 kräver två bitar, 30-39 tre bitar, osv.
- **Vapenlängd**: går två in i närstrid med vapnen redo, slår längst vapen först i första SR. Sedan vanlig turordning.

### 5.12 Vapentabeller (E57-58)

Typ: L = lätt, T = tungt. Pris i sm. Vapenlängd 0-5.

Närstridsvapen

| Fattning | STY-grupp | Namn | Skada | Vapenlängd | BEP | BV | Typ | Pris |
|---|---|---|---|---|---|---|---|---|
| 1H | - | Näve | 1T3 | 0 | - | - | L | - |
| 1F | - | Spark | 1T6 | 1 | - | - | L | - |
| 1H | 1 | Dolk | 1T4+1 | 0 | 0,5 | 9 | L | 40 |
| 1H | 1 | Dirk | 1T4+2 | 1 | 0,5 | 9 | L | 60 |
| 1H | 1 | Parerdolk | 1T4+1 | 1 | 0,5 | 13 | L | 80 |
| 1H | 1 | Tanto4) | 1T4+1 | 0 | 0,5 | 9 | L | 40 |
| 1H | 1 | Hammare | 1T6 | 0 | 1 | 7 | L | 25 |
| 1H | 1 | Kortsvärd | 1T6+1 | 1 | 1 | 15 | L | 190 |
| 1H | 1 | Wakizashi4) | 1T6+1 | 1 | 1 | 15 | L | 200 |
| 1H | 1 | Knogjärn5) | +1 | 0 | 0,5 | - | L | 25 |
| 1H | 1 | Oxpiska | 1T2 | 4 | 2 | 3 | L | 30 |
| 1H | 1 | Träklubba | 1T6 | 1 | 1 | 7 | L | 2 |
| 1H | 2 | Handyxa | 1T6+2 | 0 | 1 | 11 | L | 60 |
| 1H | 2 | Bredsvärd | 1T8+1 | 1 | 1 | 15 | T | 200 |
| 1H | 2 | Huggare | 1T8 | 1 | 1 | 15 | T | 175 |
| 1H | 2 | Ninjato4) | 1T8+2 | 1 | 1 | 15 | T | 200 |
| 1H | 2 | Kofot | 1T6 | 0 | 1 | 15 | L | 25 |
| 1H | 2 | Stridsklubba | 1T8 | 1 | 1 | 15 | T | 150 |
| 1H | 2 | Stridshammare | 1T6+2 | 1 | 2 | 15 | T | 340 |
| 1H | 3 | Lans | 1T10+1 | 5 | 3 | 15 | T | 125 |
| 1-2H | 1 | Kortspjut | 1T6+1 | 2 | 2 | 11 | L | 75 |
| 1-2H | 2 | Kroksabel | 1T8+2 | 1 | 2 | 15 | T | 310 |
| 1-2H | 2 | Stridsslaga1) | 1T10 | 3 | 3 | 11 | T | 300 |
| 1-2H | 2 | Hacka | 1T10 | 2 | 2 | 11 | T | 125 |
| 1-2H | 2 | Bredyxa | 1T8+2 | 1 | 2 | 11 | T | 125 |
| 1-2H | 2 | Katana4) | 1T8+2 | 2 | 2 | 15 | T | 600 |
| 1-2H | 2 | Treudd | 1T8+2 | 3 | 3 | 11 | L | 200 |
| 1-2H | 2 | Slagsvärd | 1T10+1 | 2 | 2 | 13 | T | 500 |
| 1-2H | 2 | Stridsgissel1) | 1T10 | 1 | 2 | 11 | T | 300 |
| 1-2H | 2 | [oläsligt tecken] m. spik1) | 1T10+1 | 1 | 2 | 11 | T | 340 |
| 1-2H | 3 | Stridsyxa | 1T10+2 | 1 | 2 | 11 | T | 190 |
| 1-2H | 4 | Morgonstjärna | 2T8+2 | 1 | 3 | 11 | T | 250 |
| 2H | 1 | Trästav | 2T4 | 3 | 2 | 7 | L | 12 |
| 2H | 2 | Långspjut | 1T10+1 | 4 | 3 | 11 | T | 100 |
| 2H | 2 | No-dachi4) | 2T8+2 | 3 | 2 | 13 | T | 500 |
| 2H | 2 | Högaffel | 2T4+1 | 3 | 3 | 9 | L | 75 |
| 2H | 2 | Spade | 2T4 | 2 | 2 | 9 | L | 100 |
| 2H | 2 | Hillebard | 3T4 | 4 | 3 | 11 | T | 375 |
| 2H | 2 | Pik | 1T10+3 | 5 | 4 | 11 | T | 375 |
| 2H | 3 | Naginata4) | 2T8+1 | 4 | 4 | 11 | T | 350 |
| 2H | 3 | Spetum | 2T8 | 4 | 3 | 11 | T | 150 |
| 2H | 3 | Stor träklubba | 2T8 | 2 | 3 | 9 | T | 90 |
| 2H | 4 | Tvåhandssvärd2) | 2T10 | 3 | 2 | 11 | T | 560 |
| 2H | 4 | Tvåhandsyxa3) | 2T10+2 | 3 | 2 | 11 | T | 375 |
| 2H | 4 | Pålyxa | 3T6 | 4 | 3 | 11 | T | 125 |

Fotnoter: 1) Vapen med kätting. 2) Kallas även storsvärd. 3) Kallas även dubbelyxa. 4) Japanskt vapen; SL avgör om det passar i världen. 5) Adderas till vanlig knytnävsskada, kan bara användas med Slagsmål. 6) Naturliga vapen som inte står här har oftast vapenlängd 1 (drakklo 1-4); alla naturliga vapen har STY-grupp 0. [transkripsjon: "[oläsligt tecken] m. spik" er trolig Stridsgissel m. spik, jf. bildetekstlisten på E59 og G66.]

Projektilvapen

| Fattning | STY-grupp | Namn | Skada | Vapenlängd | BEP | BV | Typ | Pris | Räckvidd |
|---|---|---|---|---|---|---|---|---|---|
| 2H | 1 | Liten båge | 1T4+1 | - | 1 | - | L | 125 | 135m |
| 2H | 2 | Kortbåge | 1T6+1 | - | 2 | - | L | 190 | 135m |
| 2H | 3 | Långbåge | 1T8+1 | - | 2 | - | T | 250 | 180m |
| 2H | 3 | Sammansatt båge | 1T10+1 | - | 2 | - | T | 600 | 180m |
| 1H | 1 | Slunga | 1T6 | - | 0,25 | - | L | 12 | 90m |
| 2H | 2 | Stavslunga | 1T8 | 2 | 1 | - | L | 50 | 120m |
| 2H | 1 | Blåsrör | Spec. | 4 | 2 | - | T | 50 | 20m |
| 2H | 2 | Lätt armborst | 2T4+2 | 0 | 2 | 9 | L | 310 | 180m |
| 2H | 2 | Tungt armborst | 2T6+2 | 1 | 2 | 11 | T | 625 | 225m |
| 2H | 3 | Arbalest | 3T6+3 | 1 | 3 | 11 | T | 750 | 250m |

Kastvapen

| Fattning | STY-grupp | Namn | Skada | Vapenlängd | BEP | BV | Typ | Pris | Räckvidd |
|---|---|---|---|---|---|---|---|---|---|
| 1H | 1 | Kaststjärna | 1T4 | 0 | 0,2 | - | L | 30 | SMIx1 rutor |
| 1H | 1 | Kastspjut | 1T6+1 | 2 | 2 | 9 | L | 100 | STYx1 rutor |
| 1H | 1 | Kastkniv | 1T4+1 | 0 | 0,5 | 9 | L | 75 | STYx1 rutor |
| 1H | 2 | Kastyxa | 1T6+2 | 1 | 1 | 11 | L | 90 | STYx1 rutor |
| 1H | 2 | Bola | Spec. | 1 | 1 | - | L | 5 | STYx1 rutor |
| 2H | 1 | Lasso | Spec. | 5 | 2 | 5 | L | 1 | 7 rutor |

Laddningstider: Stavslunga 1 SR, Lätt armborst 3 SR, Tungt armborst 6 SR, Arbalest 12 SR.

Beräkning av vapenlängd: riktig längd 0,0-0,4 m = 0, 0,5-0,9 = 1, 1,0-1,4 = 2, 1,5-1,9 = 3, 2,0-2,9 = 4, 3,0+ = 5.

### 5.13 Vapen och rustningar av andra material än järn (E58-60)

| Material | Effekt | Pris |
|---|---|---|
| Trä | Spjut och pilar med bara vassad spets: skada -3. | - |
| Sten | Dolk, stridsklubba, spjut, pil, skäkta. Skada -2 (utom stridsklubba). Stendolk BV -4. | - |
| Tänder (rovdjur) | Spjut- och pilspetsar, skada -2. | - |
| Brons | Skärande egg skada -1. Dolkar och svärd BV -2. Metallrustningar abs -1. | 80 % av järn |
| Mithril | Skärande egg skada +1. Svärd och dolkar BV +2. Rustning abs +1, vikt -1 (alt. system: en viktbokstav lägre; bokstav A eller 1,5 BEP: -1 BEP). Bara dvärgar smider svärd och rustningar. Kan förtrollas. | 16-20 gånger normalt |
| Silver | Vissa varelser skadas bara av silver. Dolk, beslag till trästav, stridsklubba, knogjärn, morgonstjärna, stridsgissel, slungprojektiler, kaststjärnor, spetsar till pilar, skäktor, spjut. | 9 gånger normalt |
| Jade | Mot varelser känsliga för jade (t.ex. onaqui) normal skada, annars skada -2. Slungstenar, spetsar. | - |
| Sjöorm | Fjällpansar som skramlar mindre: Smyga minskas bara med 1/4. | 180-200 sm/BEP |
| Mantikora | Svansspikar som pil- och skäktspetsar, skada +1. | 20-30 sm styck |
| Syrödla | Läder som aldrig tar frätskada; halva syraskadan försvinner. Sköld kan parera syra. | 65-85 sm/BEP, sköld dubbelt |
| Drake | Drakskinnsrustning: läder med drakskinnets abs, bäraren immun mot eld och syra. Drakskinnssköld kan parera eld och syra. Draktänder som spjutspetsar skada +2. | Ovärderlig |

### 5.14 Fummeltabeller (E60-61)

Slå 1T20 när man fumlar med vapen- eller sköldfärdighet. Resultat utan effekt (tappa rustning man inte har) räknas som ingenting.

Naturliga vapen

| 1T20 | Resultat |
|---|---|
| 1-9 | Vacklar till och missar nästa attack. |
| 10 | Tappar delar av rustningen. Nya systemet: slå kroppsdel (kolumn B). Gamla systemet: Abs -2. |
| 11-13 | Snubblar. Det tar 1 SR att resa sig. |
| 14-15 | Vrickar foten. Förflyttningsförmågan -1 resten av striden. |
| 16-17 | Distraherad. Alla fiender har +3 på CL nästa SR. |
| 18 | Träffa närmsta vän. |
| 19 | Klumpig rörelse. Nästa fientliga attack träffar automatiskt. |
| 20 | Rejäl klantighet. Slå två gånger på tabellen. |

Närstridsvapen och sköldar

| 1T20 | Resultat |
|---|---|
| 1 | Vapnet eller skölden går sönder. |
| 2-7 | Vacklar till och missar nästa attack eller parering. |
| 8 | Helt ur balans. Missar nästa 1T3 attacker eller pareringar. |
| 9-10 | Snubblar. Det tar 1 SR att resa sig. |
| 11 | Tappar delar av rustningen. Se ovan. |
| 12-13 | Vrickar foten. Förflyttningsförmågan -1 resten av striden. |
| 14-16 | Tappar vapnet eller skölden i samma ruta. |
| 17 | Tappar vapnet eller skölden, som slås bort 1T3 rutor. |
| 18 | Träffar närmsta vän med vapnet eller tappar skölden i samma ruta. |
| 19 | Klumpig rörelse. Nästa fientliga attack träffar automatiskt. |
| 20 | Rejäl klantighet. Slå två gånger på tabellen. |

Avståndsvapen

| 1T20 | Resultat |
|---|---|
| 1-12 | Distraherad. Kan inte agera denna SR. |
| 13-15 | Tappar vapnet. Kastvapen faller 1T6 rutor bort. |
| 16-17 | Snubblar. Det tar 1 SR att resa sig. |
| 18 | Träffa närmsta vän i skottfältet. |
| 19 | Vapnet går sönder. |
| 20 | Rejäl klantighet. Slå två gånger. |

### 5.15 Stridsmoral och bärsärk (E61-62)

Gjelder SLP, ikke spillerne (unntatt der magi tvinger det). Hjältar, drakar og insektoider handler alltid fornuftig. Varelser uten INT og magiske odøde slåss til de er forintet.

| Varelse | Grundmoral |
|---|---|
| Vanliga ointelligenta varelser | 10 |
| Aggressiva ointelligenta varelser1) | 15 |
| Anka (vit) | 7 |
| Anka (svart eller brun) | 12 |
| Människa, halvlängdsman | 10 |
| Kattman | 14 |
| Kentaur | 13 |
| Onaqui | 17 |
| Reptilman | 10 |
| Stenfolk | 15 |
| Orch, rese | 12 |
| Svartalf, svartnisse | 6 |
| Troll, varulv, vampyr | 18 |
| Vargman | 11 |
| Älvfolk, karkion, enhörning | 15 |
| Övriga intelligenta varelser | 14 |

1) Grottbjörn, grip, hydra, kimera. Drakormen hör också hit fast den är intelligent.

| Situation (gäller oftast hela gruppen) | Modifikation |
|---|---|
| Summan av fiendens STO överstiger den egna STO-summan med minst 33%: | -5 |
| Summan av fiendens STO understiger den egna STO-summan med minst 33%: | +5 |
| Gruppen anfalls från två eller flera håll samtidigt: | -2 |
| Ledaren har sårats: | -2 |
| Ledaren har stupat, gett sig eller tagits till fånga: | -5 |
| Hälften av den egna gruppen oförmögna att slåss: | -5 |
| Hälften av fienden oförmögna att slåss: | +5 |
| Egen undsättning inom synhåll: | +3 |
| Fiendens undsättning inom synhåll: | -3 |
| Varelsen har förlorat mer än hälften av sina KP: | -4 |
| Varelsen särskilt duglig kämpe: | +5 |

**Moralslag** (1T20 under eller lik moral) slås for hver varelse med moral 19 eller lavere når: egen ledare flyr, stupar, ger sig eller tas till fånga; halva egna gruppen är oförmögen att slåss; gruppen angrips överraskande; varelsen har förlorat mer än halva KP; den angrips av en fiende med större STO som går bärsärk. Moral 0 eller lägre misslyckas automatiskt.

- Lyckat: står kvar eller retirerar i god ordning.
- Misslyckat: kan den inte gå bärsärk flyr den. Kan den gå bärsärk och har mer än halva KP kvar: bärsärkskontroll; visar den bärsärk går den bärsärk, annars flyr den. Mer än halva KP förlorade: flyr.
- Omringad intelligent varelse som måste fly: har den inte förlorat mer än halva KP, ny bärsärkskontroll, annars ger den sig. Mer än halva KP förlorade: ger sig automatiskt. Omringad ointelligent varelse försöker slå sig fri.
- Fummel: ger upp fullständigt, kastar vapnen, söker skydd.
- Perfekt: bärsärkskontroll; blir det inte bärsärk räknas slaget som lyckat.

**Bärsärk.** Bärsärkskontroll: 1T20 lik eller under bärsärksvärdet.

| Varelse | Värde |
|---|---|
| Anka | 3 |
| Människa | 1 |
| Kentaur | 1 |
| Minotaur | 13 |
| Reptilman | 4 |
| Cyklop | 5 |
| Dvärg | 2 |
| Jätte | 4 |
| Orch | 2 |
| Rese | 3 |
| Vargman | 2 |

- Bärsärken angriper vettlöst närmsta fiende, bryr sig inte om skador (kan förblöda), får **två attacker per SR** (den andra sist), parerar inte ens med sköld.
- När alla fiender flytt eller är oskadliggjorda: ny kontroll; lyckas den förföljer han flyende fiender i FYS SR, annars lugnar han sig.
- Minotaur: kontroll första SR i varje strid.
- Frivilligt: stå stilla en hel SR och slå bärsärkskontroll med dubblat bärsärksvärde. Misslyckas det händer ingenting.

## 6. Hjältedåd (E63-66)

Frivillig. Hjältepoäng (HP) brukes til ulike ting og er da oppbrukt.

### Hur man får HP (E64)

- Hver gang en ferdighet når FV 21, 41, 61 osv. (eller 105 %, 205 %, 305 %): 1T4 HP.
- Første HP gjør rollpersonen til hjälte, og KAR heves straks til 19.
- Deltar man i store dåd, får hver deltaker HP etter tabellen. Utført alene: dobbelt.

| Dåd | Poäng |
|---|---|
| Döda drakunge | 1 |
| Döda ung drake | 10 |
| Döda mogen drake | 20 |
| Döda medelålders drake | 30 |
| Döda gammal drake | 40 |
| Döda urgammal drake | 50 |
| Stjäla en drakskatt utan att döda draken | 10 |
| Döda en rock | 10 |
| Döda Medusa | 15 |
| Förstöra en vampyr | 20 |
| På kungens uppdrag rädda prinsessan | 10 |

### Hur man använder HP (E64)

1. **Garantert suksess** på et ferdighets- eller grunnegenskapsslag. Jo vanskeligere slaget er (lavere CL), jo dyrere:

| Slag (CL) | HP | Slag (CL) | HP |
|---|---|---|---|
| 1 (5 %) | 20 | 5 (25 %) | 5 |
| 2 (10 %) | 12 | 6 (30 %) | 4 |
| 3 (15 %) | 8 | 7-8 (35-40 %) | 3 |
| 4 (20 %) | 6 | 9-12 (45-60 %) | 2 |
| | | 13+ (65 %+) | 1 |

2. **Maksimal skade**: 1 HP gjør at et treff med våpenet gir våpenets maksimale skade (pluss ev. maksimal SB).
3. I begge tilfeller brukes HP **i stedet for** terningslaget, aldri etter et dårlig kast.
4. **Grunnegenskaper** (ikke STO): 2 HP = +1 permanent, uten øvre grense. Ferdighetene som bygger på egenskapen endres ikke.
5. **Hjälteförmågor**: kjøpes bare mellom eventyr.

### Hjälteförmågor i Expert (E64-65)

| Hjälteförmåga | HP | Krav | Effekt |
|---|---|---|---|
| Järnnäve | 1 | Hjälte | Knytnävar och sparkar ger alltid maximal skada. |
| Kattfot | 2 | Hjälte | Tappar aldrig balansen; faller han landar han alltid på fötterna. |
| Kommunikation | 3 | Hjälte | Gör sig förstådd överallt med enkla budskap. |
| Orientering | 3 | Hjälte | Vet alltid väderstrecken, kan aldrig gå vilse. |
| Tidskänsla | 3 | Hjälte | Vet alltid exakt tid och tidsintervall. |
| Skarpögd | 4 | Hjälte | CL för Upptäcka Fara är alltid minst 15. |
| Snabbslående | 4 | Hjälte | Slår alltid före alla andra beväpnade i en SR. Två med förmågan: vanlig turordning. |
| Tålig | 4 | Hjälte | Kan inte tvingas mot sin vilja (avslöjar inget i förhör); magi fungerar. Där andra får en chans att klara sig (t.ex. PSY mot PSY) får han två. |
| Läkeförmåga | 5 | Hjälte | Första Hjälpen fungerar alltid perfekt och läker dessutom 1T3 KP. Kan suga ut ormgift (halv skada). |
| Orädd | 5 | Hjälte | Slår aldrig på skräcktabellen. |
| Projektilparering | 5 | Hjälte, måste se avfyrningen | Kan parera pilar (inte skäktor) och kastvapen med svärd eller trästav, med vapnets FV. Kan fånga kastvapen med händerna med Judo, Karate eller Slagsmål. |
| Snabbläkning | 6 | Hjälte | Skador läks dubbelt så snabbt. |
| Språkets gåva | 6 | Endast munkar | Talar och förstår alla världens språk. |
| Stålblick | 6 | Hjälte | Stirrar ilsket: varje fientlig intelligent varelse slår normalt PSY-slag; miss = står stilla och tvekar hela SR. |

[Rubriken heter "PROJEKTILPARSERING" i transkripsjonen; trolig trykkfeil for Projektilparering.]

Gigant legger til ni hjälteförmågor (se 8.3).

### Nackdelar med att vara hjälte (E65-66)

- En hjälte må være djerv. Hver feig handling: -1 HP. Særlig nedrig handling: SL trekker det han finner rimelig. HP trekkes først fra ubrukte HP, så ved å fjerne hjälteförmågor (ikke grunnegenskapsøkninger). Kan gå i minus.
- Ingen plikt til å være ærlig mot fiender.

| Nesligt dåd | HP-förlust |
|---|---|
| Överge sina vänner i farans stund | -4 |
| Förråda sina vänner | -7 |
| Vägra att acceptera en utmaning från en person som har lägre Rykte än en själv | -1 per 3 skillnad i FV |

**Rykte** (KOM, KAR, ingen kostnad, BC 0, E65): +1 FV for hver HP man får. Gir ikke HP over FV 20. SL slår i hemmelighet når hjelten kommer til en by: lyckat = gjenkjent (positivt eller negativt etter SL).

**Utmanare og följeslagare** (E66): rivaler oppsøker hjelten for tvekamp. Hver gang hjelten får HP: 25 % sjanse for at en ung følgesvenn av samme rase og yrke slutter seg til (nybegynner, styrt av SL, gjør aldri noe hjelten ikke ville gjort). Sviker hjelten følgesvennen, mister han mange HP og følgesvennen forlater ham.

## 7. Kampanjregler (E67-79), bare det mekanisk nyttige

**Löner (E68)**, dagslön: Enkelt grovarbete 30 km; Hantverk (Hantverk FV 2-3) 40 km; Menig soldat 35 km; Karavanvakt, livvakt 50 km; Elitvakt (Hjälte) 40 sm; Underbefäl 70 km; Officer 10-50 sm; Tolk (båda språken FV 4-5) 60 km; Skrivare (Skriva FV 4-5) 12 sm; Sjöman 30 km; Styrman (Sjökunnighet 12+) 60 km; Läkare (Läkekonst 10+) 50 sm.

**Levnadsomkostnader (E68)**, per uke: Spartansk 15 sm (riddare, lärda män och magiker unngår det), Gott 25 sm, Lyxigt 50 sm.

**Sjukvård (E69)**: Läkare 50 sm/dag. HELA 200 sm per effektgrad. Läkedroger etter prisliste.

**Skatter (E69)**: Mantalspenning 8 gm/år; förmögenhetsskatt 3 %/år over 10 000 gm; inkomstskatt 10 %/år over 350 gm. Monstergäld: 15-25 % av skatter tatt fra monstre går til områdets hersker.

**Mat, vann og sult (E72)**: en rollperson bruker 1/2 BEP mat og 1/2 BEP vann per dag (kentaurer, minotaurer, resar dobbelt). Sult: STY og SMI -1 og dagsmarsj -10 % for hver annen dag; når en av dem når 0 kan man ikke bevege seg, STY og SMI 0 = død. Gjenvinnes med 1 per dag. Vannmangel: etter et døgn halveres STY, SMI og förflyttning; etter to dager kan man ikke bevege seg; etter fire dager død. 25-35 °C dobbelt vannbehov, 36-40 °C tredobbelt.

**Normal dagsmarsch (E71)**, km på cirka åtte timer, raster inräknade:

| Terräng | Smyga | Gång/Skidor | Ritt | Kärra/Släde | Segelbåt | Kanot |
|---|---|---|---|---|---|---|
| Väg | - | 35 | 45 | 30 | - | - |
| Öppen terräng | 15 | 30 | 35 | 5 | - | - |
| Öppen skog | 12 | 25 | 20 | - | - | - |
| Tät skog1) | 7 | 15 | 7 | - | - | - |
| Kullar1) | 9 | 18 | 20 | - | - | - |
| Berg1) | 5 | 10 | - | - | - | - |
| Träsk | 5 | 10 | 5 | - | - | 30 |
| Flod | - | - | - | - | 302) | 502) |
| Öppet vatten | - | - | - | - | 50 | 50 |
| Stig3) | +5 | +10 | +10 | - | - | - |

1) Stigbonus gäller i denna terräng. 2) Modifiera för strömhastigheten ±1-20 km per dagsmarsch. 3) Bonus bara om man går på stigen. Dåligt väder -25 %, uruselt väder -50 %. Ritt, kärra, segelbåt eller kanot: färdighetsslag per dag, miss = -10 % sträcka. G91 har en egen tabell för olika ridedyr.

**Reaktionstabell (E74)**: 1T20 + beste KAR-grupp blant rollpersonene.

| 1T20 | Reaktion |
|---|---|
| 1-3 | Fientlig eller starkt avvisande. SLPn reagerar mycket negativt. |
| 4-7 | Ogillande eller misstänksamhet. SLPn är illa berörd, misstänksam och beter sig avvisande. |
| 8-16 | Neutral reaktion. SLPn har de känslor han normalt har inför främlingar. |
| 17-19 | Positiv reaktion. SLPn känner sig tillfreds och säker. Han behandlar rollpersonerna väl och uppför sig mycket trevligt. |
| 20+ | Vänskaplig och förtrolig. SLPn känner förtroende för rollpersonerna och vill gärna lära känna dem bättre. |

**Dörrar och lås (E74)**: en dør har KP, fra 10 (tynn garderobedør) til 200 (jernbeslått eik). Hugge: yxa gör normal skada, ingen effekt på metalldør. Kofot: 1T6 per SR (riv låset ut). Murbräcka: 1T6 + summen av SB hos alle som bærer den. STY 30+ kan bruke skulderen: skade lik SB. Lås: 10 KP (billig hänglås av brons) til 200 KP (mithrillås); krever hammer eller slägga og bräckjärn. Alt dette lager bråk.

**Typiska SLP (E72-73)**. Multiplikatorene viser til tabellen Stridserfarenhet i Monsterboken. KP-verdien står slik i boka.

| SLP | STY | SB | STO | KP | FYS | SMI | INT | PSY | KAR | Färdigheter | Mutfaktor |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Menig stadsvakt eller soldat | 13 | 0 | 12 | 12 | 12 | 13 | 9 | 11 | 10 | 1 Närstridsvapen 10, Sköld 10, 1 Projektilvapen 10, Stadskännedom 13, Finna Dolda Ting 7, Upptäcka Fara 9 | 3+1T4 |
| Patrullchef/underbefäl | 14 | 0 | 12 | 13 | 14 | 13 | 12 | 12 | 12 | 1 Närstridsvapen 18, Sköld 18, 1 Projektilvapen 18, Stadskännedom 17, Finna Dolda Ting 17, Upptäcka Fara 17, Taktik 10, Övertala 10 | 7+1T4 |
| Officer | 14 | 0 | 12 | 12 | 12 | 12 | 14 | 13 | 13 | 2 Närstridsvapen 17, Sköld 17, 1 Projektilvapen 17, Stadskännedom 20, Finna Dolda Ting 20, Upptäcka Fara 18, Taktik 20, Övertala 13 | 15+1T4 |
| Livvakt | 16 | 0 | 12 | 13 | 14 | 16 | 9 | 11 | 10 | Slagsmål 13, 1 Närstridsvapen 13, 1 Avståndsvapen 13, Sköld 13, Upptäcka Fara 15, Finna Dolda Ting 13, Lyssna 13 | 17+1T4 |
| Sheriff | 14 | 0 | 12 | 14 | 16 | 12 | 13 | 13 | 12 | Slagsmål 17, 1 Närstridsvapen 17, 1 Avståndsvapen 10, Sköld 17, Upptäcka Fara 18, Rida 17, Övertala 10 | 18+1T4 |
| Vanlig tjuv | 9 | 0 | 11 | 11 | 11 | 16 | 11 | 10 | 13 | Hantera Fällor 13, Dolk 13, Stadskännedom 15, Klättra 13, Smyga 13, Undre Världen 15, Bluff 10, Teckenspråk 4, Upptäcka Fara 14, Se Dolda Ting 15 | 3+1T4 |
| Buse | 15 | 0 | 13 | 14 | 15 | 10 | 8 | 8 | 8 | Slagsmål 14, 1 Närstridsvapen 14, Undre Världen 6, Stadskännedom 11 | 1T4 |
| Utkastare | 18 | 1T4 | 18 | 16 | 14 | 13 | 10 | 10 | 10 | Slagsmål 18, Judo 18, Stadskännedom 8, Övertala 14, Upptäcka Fara 14 | 12+1T4 |
| Kvinna i nöd (tuff) | 9 | 0 | 8 | 10 | 12 | 16 | 14 | 12 | 14 | Slagsmål 16, Judo 16, Övertala 14, Bluff 14, Upptäcka Fara 17 | - |
| Kvinna i nöd (våp) | 7 | 0 | 7 | 9 | 11 | 10 | 7 | 8 | 17 | Övertala 17, inga övriga användbara färdigheter | - |

Resten av kampanjkapitlet (samhällsklasser, skattesystemet, SL-råd, klisjéfigurer, politiske systemer) er bakgrunn uten regler.

## DEL B: GIGANT

## 8. Rollpersonen (G5-12)

### 8.1 Storlekstabell (G5)

Vekt i kg ut fra STO. 3 kg kroppsvekt = 1 BEP.

| STO | Vikt (ca kg) | STO | Vikt (ca kg) | STO | Vikt (ca kg) |
|---|---|---|---|---|---|
| 1 | 5 | 9 | 65 | 17 | 110 |
| 2 | 10 | 10 | 70 | 18 | 120 |
| 3 | 20 | 11 | 75 | 19 | 130 |
| 4 | 30 | 12 | 80 | 20 | 140 |
| 5 | 40 | 13 | 85 | 21 | 150 |
| 6 | 50 | 14 | 90 | 22 | 160 |
| 7 | 55 | 15 | 95 | 23 | 170 |
| 8 | 60 | 16 | 100 | 24 | 180 |

### 8.2 Yrken (G5-8)

Gigant bygger om Expert-yrkene og legger til Kurtisan, Nomad og Helare. Siste kolonne sier hva som er endret fra E.

| Yrke (krav) | LÄR | STR | KOM | UPF | TJU | VIL | Endring fra E |
|---|---|---|---|---|---|---|---|
| Gycklare (SMI 9+), G5 | Första hjälpen, Områdeskännedom, Läsa/Skriva, Spå i kort | Max ett lätt vapen, judo, slagsmål | Alla | Alla | Alla | Djurträning, Fiska, Jaga, Kanot, Köra vagn, Orientering, Rida, Simma, Sjökunnighet, Skidåkning | + Läsa/Skriva, Spå i kort |
| Kurtisan (KAR 9+), G5-6 | Drogkunskap, Första hjälpen, Hantverk, Heraldik, Kulturkännedom, Läsa/skriva, Räkning, Schack & Brädspel, Språkkunskap, Värdesätta | Dolk, Judo, Karate | Alla | Alla | Förklädnad, Gömma sig, Hasardspel, Stadskännedom | Simma | Nytt. Endast människor. |
| Nomad, G6 | Första hjälpen, Botanik, Hantverk, Zoologi | Sköld, Dolk, Stav, Spjut, Båge, Slunga, Lasso, Piska, Bola, Slagsmål | Tala Språk | Finna dolda ting, Lyssna, Upptäcka fara | Hoppa, Klättra, Smyga | Djurträning, Ilmarsch, Jaga, Kamouflage, Orientering, Rida (i vissa kulturer), Simma, Skidåkning, Skridskoåkning, Spåra, Överlevnad (i den miljö där stammen hör hemma) | Nytt. [transkripsjon: listen har i tillegg linjen "Stridsfärdigheter: Inga", trolig feil] |
| Jägare, G6 | Första hjälpen, Zoologi | Max två (båge + ett lätt vapen) | Tala språk | Alla | Hoppa, Klättra, Smyga | Fiska, Grottorientering, Ilmarsch, Jaga, Kamouflage, Kanot, Orientering, Simma, Skidåkning, Skridskoåkning, Spåra, Överlevnad | - Områdeskännedom |
| Trollkarl (INT 9+), G6-7 | Astrologi, Hantverk, Läsa/skriva, Räkning, Värdesätta, Magiskolor och valfritt antal besvärjelser | Inga | Övriga färdigheter: Max fyra valfria | | | | Ny opptaksprøve, se under |
| Riddare (STY 9+), G7 | Administration/Juridik, Första hjälpen, Kulturkännedom, Geografi, Områdeskännedom, Heraldik, Historia, Kunskap om magi, Läsa/Skriva, Räkning, Schack & Brädspel, Språkkunskap | Alla utom Judo och Karate | Alla | Upptäcka fara | Inga | Ilmarsch, Orientering, Rida | Uendret |
| Helare (INT 9+), G7 | Botanik, Läkeörtskunskap, Första hjälpen, Kunskap om magi, Läkekonst, Läsa/Skriva, Områdeskännedom, Zoologi | Ett lätt vapen | Tala språk, Övertala, Överklasstil | Alla | Inga | Köra vagn, Orientering, Rida | Nytt. Livsmål: knappast brutal eller egoistisk. |
| Lärd man (INT 9+), G7 | Alla, utom magiskolor och shamanism | Inga | Tala språk, Förhöra, Överklasstil | Provsmaka | Inga | Inga | Shamanism utelukket |
| Krigare (STY 9+), G7 | Geografi, Första hjälpen, Områdeskännedom, Läsa/Skriva, Värdesätta | Alla, utom Judo och Karate | Förhöra, Tala språk | Upptäcka fara | Klättra, Hoppa | Fiska, Ilmarsch, Jaga, Kamouflage, Orientering, Rida, Simma | Uendret |
| Munk, G7 | Astrologi, Botanik, Drogkunskap, Första hjälpen, Kulturkännedom, Läkekonst, Läsa/Skriva, Områdeskännedom, Schack & Brädspel, Spå i kort, Zoologi | Judo, Karate, Trästav | Bluff, Sjunga & Spela, Tala språk, Teckenspråk, Övertala | Alla | Inga | Orientering, Simma | + Spå i kort, + Särskilda färdigheter: Kraftsamlingsfärdigheterna; TJU nå Inga |
| Köpman (INT 9+), G7 | Administration/Juridik, Kulturkännedom, Första hjälpen, Geografi, Hantverk, Historia, Läsa/Skriva, Områdeskännedom, Räkning, Språkkunskap, Värdesätta | Ett lätt vapen | Alla | Alla | Stadskännedom | Kamouflage, Kanot, Köra vagn, Rida | Uendret |
| Stråtrövare, G8 | Första hjälpen, Värdesätta | Slagsmål, sköldar och lätta vapen | Bluff, Förhöra, Muta, Teckenspråk | Alla | Hoppa, Klättra, Smyga, Hasardspel, Undre världen, Änterhake | Alla utom Navigera och Sjökunnighet | - Områdeskännedom |
| Pirat/Sjöfarare, G8 | Första hjälpen, Geografi, Värdesätta, Läsa/skriva | Alla utom Judo och Karate | Förhöra, Tala språk | Upptäcka fara | Hoppa, Klättra, Hasardspel, Stadskännedom, Undre världen, Änterhake | Fiska, Navigera, Simma, Sjökunnighet, Havsöverlevnad | + Läsa/skriva, + Havsöverlevnad |
| Tjuv (SMI 9+), G8 | Första hjälpen, Värdesätta | Judo, Slagsmål, Dolk, Dra vapen | Alla utom Överklasstil och Tala språk | Alla | Alla | Inga | Uendret |

**Trollkarl, opptak (G6)**: én gang i livet slås 1T100 lik eller under INT+PSY. Lyckas det, kan personen lære magi; ellers aldri. Man kan starte i et annet yrke og bli magiker senere.

### 8.3 Hjälteförmågor i Gigant (G8)

Kommer i tillegg til de 14 i Expert (kapittel 6). Kjøpes med HP mellom eventyr.

| Hjälteförmåga | HP | Krav | Effekt |
|---|---|---|---|
| Bärsärk | 1 | Inte minotaurer | Hjältens bärsärksvärde höjs till 8. |
| Sköldkrossare | 2 | Hjälte | I stället för normal attack: slag mot motståndarens sköld med +4 på CL. Träff gör normal skada; övervinner skadan sköldens absorbering på motståndstabellen krossas skölden. |
| Snabbfot | 3 | Hjälte | Förflyttningsförmågan +2. |
| Fint | 4 | Hjälte | Skenattack följd av riktig attack: motståndaren måste slå svårt INT-slag (normalt om han känner till förmågan) för att få parera. Den riktiga attacken kommer sist i SR. |
| Hjältesprång | 4 | Hjälte | Utan ansats: 5 × egen längd i längd, 1,5 × i höjd. Med ansats: 7 × och 2 ×. |
| Giftskydd | 5 | Hjälte | Alla gifter får halverad giftstyrka mot hjälten. |
| Avväpning | 6 | Hjälte; bara mot fiender som inte är hjältar, inte mot naturliga vapen | I stället för attack: anfallsslag med -10. Lyckas det slår motståndaren svårt SMI-slag (normalt om han känner till förmågan); miss = vapnet flyger 0-2 rutor. |
| Vapenexpert | 7 | Hjälte | BC för vapen- och sköldfärdigheter = 2 × SMI-grupp. Gratis 20 EP i Värdesätta vapen. Normalt INT-slag avgör vilket vapen som orsakat ett sår (ett försök per sår). |
| Snabbpsyke | 7 | Endast magiker | Återvinner PSY på 2/3 av normal tid. |

### 8.4 Förflyttningstabell (G9)

Valgfri: fart etter STO + FYS + SMI, deretter rasemodifikasjon.

| Summa | Förflyttning |
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

| Ras | Modifikation |
|---|---|
| Anka | -1 |
| Reptilman | -1 |
| Kattmän | +1 |
| Älvfolk | +1 |
| Dvärgar | -2 |
| Svartfolk | +1 |
| Karkion | -2 |
| Övriga | ±0 |

Eksempel: en anka med STO+FYS+SMI = 36 får 10 - 1 = 9.

### 8.5 Nya färdigheter (G9-12)

| Namn | Typ | GE | Kostnad | BC | Kat | Mekanikk | Sida |
|---|---|---|---|---|---|---|---|
| Gyckelkonster | TJU | SMI | 6 | 0 | B | 1 gå på händer och styltor, 2 sluka eld, 3 jonglera fyra föremål, 4 sluka svärd och jonglera fem, 5 jonglera sex och avancerade balansakter. Störd: normalt färdighetsslag (grundegenskap efter SL). | G9 |
| Rida flygdjur | VIL | SMI | 3 | SMI | A | Som Rida men för flygande riddjur (pegas, hippogriff). Ryttaren brukar vara fastspänd. | G9 |
| Spå i kort | LÄR | SMI | 4 | 0 | A | Som Astrologi. 3T6 minuter, dolt slag. Miss = inget svar, fummel = fel svar. Samma fråga ger samma svar. | G9-10 |
| Utbrytarkonst | TJU | SMI | 4 | 0 | A | Ta sig loss ur bojor och rep. CL ±0 till -20 efter bojorna. Flera minuter. Fummel: 1T3 skada. | G10 |
| Memorera | LÄR | INT | 2 | 0 | A | Lära utantill: 50 ord eller en bild per minut. Slag först när man ska minnas. | G10 |
| Dölja | TJU | SMI | 2 | 0 | A | Gömma litet föremål på kroppen; CL efter storlek. Noggrann visitering: CL halverad eller mindre, i värsta fall 0. | G10 |
| Lukta dolda ting | UPF | INT | 2 | INT | A | Som Finna dolda ting men med luktsinne. Bara varelser med exceptionellt luktsinne (vargmän, insektoider), och bara vid framslagningen. | G10 |
| Sonaravsökning | UPF | INT | 2 | INT | A | Bild av alla större föremål inom räckvidd; lyckat slag hittar dolda saker och skiljer material. Bara varelser med sonar (grottalver, insektoider). Den som använder sonar hörs tydligt av andra med sonar (+3 som "skrik" på Lyssna). | G10-11 |
| Sonarstudie | UPF | INT | 2 | INT | A | Detaljstudie inom 1 m: lönnfack, fällor. Högst 1 m² per SR. | G11 |
| Teologi | LÄR | INT | 5 | 0 | A | En färdighet per religion: riter, myter, legender. | G11 |
| Shamanism | - | PSY | 5 | 0 | A | Kontakta en ande: ritual 1T6 timmar, CL modifieras av FV i Spela trumma & sjunga. Fummel: fientlig stridsande angriper i andestrid. Se Kampanjboken. | G11 |
| Kraftsamling: språng | Särskild | PSY | 2 | 0 | A | Se under. Lyckat: hopp 25 % längre och högre, särskilt 50 %, perfekt 80 %. Hoppa används fortfarande. | G12 |
| Kraftsamling: styrka | Särskild | PSY | 2 | 0 | A | Lyckat: STY +1T4, särskilt 1T4+1, perfekt 1T4+2. | G12 |
| Kraftsamling: hastighet | Särskild | PSY | 2 | 0 | A | Lyckat: SMI +1T4 och förflyttning +2. Särskilt: SMI +1T4+1, förflyttning +4. Perfekt: SMI +1T4+2, förflyttning +6. | G12 |
| Kastmaskin | - | INT | 8 | - | B | 1 bemanning, 2 riktning på order, 3 rikta själv (ger Rikta kastmaskin med startvärde 2 × INT-grupp), 4 leda bygge, 5 lära ut bygge. | G65 |
| Rikta kastmaskin | - | INT | 3 | 2 × INT-grupp | A | Lyckat: träff inom 10 m första skottet, inom 2 m följande om man ser nedslaget. Perfekt: exakt träff. | G65 |

**Kraftsamling, felles regler (G11-12)**: konsentrer deg én SR uten å gjøre noe annet, slå ferdighetsslaget. Effekten varer 1T6 SR (SL slår i skjul). Hever kraftsamlingen en grunnegenskap, heves alle A-ferdigheter med FV 1+ som bygger på den like mye. Fungerer ikke om man er påvirket av magi. Munker lærer dette i klostre.

## 9. Strid (G30-37)

### 9.1 Pilvarianter (G31)

Alle spesialpiler (bågpilar og armborstlod) koster 50 % mer enn vanlige.

| Pilvariant | Effekt |
|---|---|
| Pansarbrytande (J) | Skada -1, men rustningens eller det naturliga skyddets absorbering halveras (avrunda uppåt). |
| Magrensare (J) | Skada +2, men rustning och naturligt skydd har dubblad absorbering, och skytten får -2 på CL. |
| Visslare (J) | Pilspets av trä som surrar i flykten. Skada 1 poäng, skytten -1 på CL. |
| Brandpil | Nätkorg med oljiga trasor bakom spetsen. Halv skada (avrunda nedåt), skytten -2 på CL. |

### 9.2 Särskilda vapen (G31-32)

- **Brandestock**: tvåhandsyxa med dold meterlång spjutspets. 1 SR att fälla ut; då kan den inte användas som yxa. Färdigheten Brandestock har kostnad 3.
- **Fångstpåle**: gripklo mot offrets hals; anfall som med lasso.
- **Hui-tho**: som oxpiska men kortare, och gör alltid skada genom bladet i änden.
- **Manriki-gusari**: cirka 170 cm kedja med tyngder. Som stridsgissel för skada, eller snärja som oxpiska men med 1T4 skada.
- **Shakujo-yari**: trästav med dold 20 cm spjutspets, 1 SR att dra ut; sedan både stav och spjut. Färdigheten kostar 3.
- **Sodegarami**: haka fast i kläderna genom att slå lika med eller under halva CL; sedan som lasso. 1 SR att ta sig loss (snabbare om man släpper manteln).
- **Bumerang**: missar den får kastaren slå igen; lyckas andra slaget har den kommit tillbaka till handen.
- **Dubbelarmborst**: lätt armborst med två bågar, ett lod i taget, 6 SR per lod att ladda om.

### 9.3 Parervapen (G32)

Konstruerade för försvar, dåliga att anfalla med. **Gunsen**: solfjäder av metall. **Jitte**: gaffelliknande; kan avväpna svärd, dolk och liknande: perfekt parering med jitte sliter vapnet ur angriparens hand, det flyger 1T3 rutor.

### 9.4 Vapentabeller (G33)

Nationaliteter: A = Afrika söder om Sahara, E = Europa, I = Indien, J = Japan, M = Malaysia, O = Okinawa. Fotnoter: 1) Kättingvapen, 2) Parervapen, 3) Se särskilda regler för detta vapen.

Närstridsvapen

| Namn | Fattn | STYg | Skada | Längd | BEP | BV | Typ | Pris |
|---|---|---|---|---|---|---|---|---|
| Brandestock (E)3 | 2H | 3 |  |  | 2 | 11 | T | 700 |
| Brandestock som yxa |  |  | 1T8+2 | 2 |  |  |  |  |
| Brandestock som spjut |  |  | 1T10+1 | 4 |  |  |  |  |
| Dubbel-dolk (I)1 | 1H | 1 | 1T4+1 | 0 | 0,5 | 9 | L | 80 |
| Fångstpåle (E) | 2H | 2 | 3 | 4 | 3 | 11 | T | 120 |
| Gunsen (J)2 | 1H | 1 | 1T3 | 0 | 0,5 | 15 | L | 80 |
| Hui-tho (M)3 | 2H | 1 | 1T6 | 3 | 1 | 3 | L | 50 |
| Jitte (J)2 | 1H | 1 | 1T6 | 1 | 1 | 12 | L | 40 |
| Lajatang (M) | 2H | 2 | 2T8 | 3 | 3 | 11 | T | 390 |
| Manriki-Gusari (J)1 | 2H | 2 | 1T63 | 3 | 1 | 15 | L | 200 |
| Nunchaku (O)1 | 2H | 1 | 1T8 | 1 | 1 | 9 | L | 60 |
| Shakujo-Yari (J)3 | 2H | 1 |  |  | 2 | 11 | L | 100 |
| Shakujo-Yari som stav |  |  | 1T6 | 2 |  |  |  |  |
| Shakujo-Yari som spjut |  |  | 1T6+1 | 3 |  |  |  |  |
| Sodegarami (J)3 | 2H | 2 | 1T8 | 4 | 3 | 11 | T | 150 |
| Tigerklor (I) | 1H | 1 | 1T6 | 0 | 0,5 | - | L | 40 |
| Yawara (J) | 1H | 1 | 1T6 | 0 | 0,5 | - | L | 40 |

[transkripsjon: Fångstpåle har "3" i skadekolonnen; trolig at skadeverdien mangler og at tallene er forskjøvet. Manriki-Gusari "1T63" = 1T6 med fotnote 3.]

Kast- och projektilvapen

| Namn | Fattn | STYg | Skada | Längd | BEP | BV | Typ | Pris | RV |
|---|---|---|---|---|---|---|---|---|---|
| Bumerang3 | 1H | 2 | 1T6 | 1 | 0,5 | - | L | 50 | STY×1,5 rutor |
| Chakram (I)1 | 1H | 1 | 1T6 | 0 | 0,5 | - | L | 30 | SMI×1 rutor |
| Mongwanga (A) | 1H | 2 | 2T4+1 | 1 | 1 | 7 | T | 100 | STY/2 rutor |
| Dubbelarmborst3 | 2H | 2 | 2T4+2 | 1 | 3 | 11 | T | 800 | 150m |

### 9.5 Sköldar (G33)

| Sköldtyp | STY-g | Abs | Vikt | Pris |
|---|---|---|---|---|
| L träsköld | 0 | 5 | 0,5 | 40 |
| M träsköld | 1 | 7 | 1 | 60 |
| S träsköld | 2 | 9 | 1,5 | 80 |
| L järnbeslagen sköld | 1 | 8 | 1 | 90 |
| M järnbeslagen sköld | 2 | 12 | 2 | 120 |
| S järnbeslagen sköld | 3 | 16 | 3 | 160 |

L, M, S = liten, medelstor, stor.

### 9.6 Rustningstabell och priser (G34-35)

Erstatter tabellen i E52 for det alternative systemet.

| Namn (kroppsdel) | Abs | Vikt |
|---|---|---|
| **Hjälm (huvud)** |  |  |
| Tyghuva | 1 | 0 |
| Läderhuva | 2 | 0 |
| Nitläderhuva | 3 | 0,25 |
| Läderhuva m. järnkors | 3 | 0,25 |
| Öppen hjälm | 4 | 0,5 |
| Ringbrynjehuva | 5 | 0,75 |
| Romersk hjälm | 6 | 1 |
| Bascinet | 7 | 1,5 |
| Bascinet med visir2 | 7/8 | 1,5 |
| Tunnhjälm2 | 8 | 1,5 |
| **Armskena (arm)3** |  |  |
| Tjockt tyg | 1 | 0,5 |
| Läder | 2 | 1 |
| Nitläder | 3 | 1,5 |
| Remsskena | 6 | A |
| Metallskena | 8 | A |
| **Benskena (ben)3** |  |  |
| Tjockt tyg | 1 | 0,5 |
| Läder | 2 | 1 |
| Nitläder | 3 | 1,5 |
| Remsskena4 | 6 | A |
| Metallskena4 | 8 | A |
| **Kilt (mage)** |  |  |
| Tjockt tyg | 1 | 0,5 |
| Läder | 2 | 0,5 |
| Nitläder | 3 | 1 |
| **Harnesk (bröstkorg & mage)** |  |  |
| Tjockt tyg | 1 | 0,5 |
| Läder | 2 | 1 |
| Nitläder | 3 | 1,5 |
| Fjällpansar | 5 | B |
| Ringbrynja | 6 | B |
| Förstärkt ringbrynja | 7 | C |
| **Kyrass (bröstkorg)5** |  |  |
| Romersk bandkyrass | 6 | B |
| Metallkyrass | 8 | B |
| **Kort brynja (armar, bröstkorg, mage)** |  |  |
| Ringbrynja | 6 | D |
| Förstärkt ringbrynja | 7 | E |
| **Lång brynja (armar, bröstkorg, mage, ben)** |  |  |
| Ringbrynja | 6 | F |
| Förstärkt ringbrynja | 7 | G |
| **Helrustning (hela kroppen)** |  |  |
| Metall6 | 8 | K |
| **Täcke (kentaurens hästkropp)** |  |  |
| Tjockt tyg | 1 | G |
| Läder | 2 | E |
| Nitläder | 3 | F |
| Fjällpansar | 5 | H |
| Ringbrynja | 6 | J |
| Förstärkt ringbrynja | 7 | K |

Fotnoter: 1) Bara för personer med STO 4 eller mer (se E52). 2) Bascinet med visir: abs 7 med uppfällt visir, 8 med nedfällt. Nedfällt visir eller tunnhjälm ger mycket nedsatt synfält och hörsel: Upptäcka fara och Provsmaka kan inte användas alls, Finna dolda ting och Lyssna halveras (ändring från EDD). Cirka en sekund att fälla visiret. 3) Pris och vikt per par. 4) Kan inte användas av kentaurer. 5) Gäller även kentaurers människokropp. 6) Bara dvärgsmeder; inte kentaurer; har bascinet med visir (huvudets abs varierar).

| Hjälmtyp | sm |
|---|---|
| Läderhuva | 15 |
| Nitläderhuva | 35 |
| Läderhuva m. järnkors | 30 |
| Öppen hjälm | 100 |
| Ringbrynjehuva | 135 |
| Romersk hjälm | 200 |
| Bascinet | 250 |
| Tunnhjälm1 | 150 |
| Bascinet med visir | 500 |

1) Tunnhjälmens pris är en ändring från EDD.

| Material | sm/BEP |
|---|---|
| Tjockt tyg | 20 |
| Läder | 25 |
| Nitläder | 70 |
| Fjällpansar | 150 |
| Remsskena | 160 |
| Romerskt band | 170 |
| Ringbrynja | 175 |
| Förstärkt ringbrynja | 180 |
| Metall | 200 |

Viktbokstäverna räknas som i E53 (se 5.5).

### 9.7 Stridskonster (G35-37)

Valfria regler som **helt ersätter Judo och Karate** från Expert.

- Varje stridskonst är en egen färdighet. Alla är SMI-baserade med BC 0.
- En stridskonst består av komponenter. Man har ett enda FV som gäller för alla komponenterna; de lärs och ger erfarenhet som en enhet.
- **Kostnad** = summan av komponenternas kostnader, avrundat uppåt, i bakgrundspoäng (per FV-steg, som en vanlig färdighets kostnad; EP omvandlas på samma sätt enligt E44). Exempel: Tanate (normal spark, bakåtspark, fint, kortsvärd) = 0,5 + 0,5 + 0,5 + 2,0 = 3,5, avrundas till 4.
- SL kan underkänna egna konstruktioner.
- Inre hållning: missbrukas stridskonsten kan SL sänka FV med 1 per missbrukstillfälle. Lärare är svåra att hitta och väljer elever efter inställning.

Komponentlista

| Namn | Kostnad |
|---|---|
| Normal spark | 0,5 |
| Rundspark | 1,0 |
| Hoppspark | 1,0 |
| Bakåtspark | 0,5 |
| Normalt slag | 0,5 |
| Krosslag | 1,0 |
| Bedövningsslag1) | 1,0 |
| Obeväpnad parering | 0,5 |
| Fint | 0,5 |
| Avväpning | 1,0 |
| Lågt kast1) | 0,5 |
| Högt kast1) | 1,0 |
| Fallteknik | 0,5 |
| Uppresning | 0,5 |
| Liggande strid | 1,0 |
| Låsning1) | 0,5 |
| Vapenteknik | 2,0 (3,0)2) |
| Missilavledning | 1,5 |
| Initiativbonus | 0,5 |

1) Kan endast användas mot människoliknande motståndare. 2) Se förklaring vid beskrivningen (Vapenteknik).

Beskrivning (G36-37)

| Komponent | Effekt |
|---|---|
| Normal spark | 1T6 skada. |
| Rundspark | Snurrar upp till ett varv. 1T8 skada. Missar den förlorar angriparen nästa anfall eller parering. |
| Hoppspark | Kräver en rutas sats. Träffar automatiskt huvudet, 1T8 skada (eller valfri kroppsdel över midjan; mot arm räknas axeln). Misslyckas eller pareras den kastas angriparen omkull i försvararens ruta. |
| Bakåtspark | Spark mot motståndare bakom angriparen, 1T6. |
| Normalt slag | Knytnävsslag, 1T3. |
| Krosslag | Knytnävsslag mot ömtåliga punkter, 1T6. |
| Bedövningsslag | 1T3 skada. Vållar det skada: svårt FYS-slag, annars förlorar offret nästa anfall eller parering. Mot icke människoliknande bara 1T3. |
| Obeväpnad parering | Parera alla närstridsattacker, även vapen, obeväpnad. Lyckad parering drar av 1T6 från attackens skada. |
| Fint | Utförs samtidigt som ett angrepp. Först slag för finten, sedan för angreppet. Lyckas finten halveras försvararens chans att parera (avrunda nedåt). [transkripsjon: texten bryts av efter "Finten kan användas till-"] |
| Avväpning | Obeväpnad parering mot beväpnat anfall. Lyckas anfallet: vanlig obeväpnad parering. Misslyckas anfallet och pareringen lyckas: anfallaren tappar vapnet på marken. Särskild eller perfekt: försvararen har vapnet i sina händer. |
| Lågt kast | På normal plats i SR. Försvararen kastas omkull i sin ruta utan skada. Kan pareras. |
| Högt kast | Sist i SR. Offret kastas 1T3 rutor och landar liggande; svårt SMI-slag, annars 1T3 KP i en kroppsdel. Kan pareras. |
| Fallteknik | Alltid påkopplad, inget slag. Alla fallskador halveras (avrunda nedåt). |
| Uppresning | Kastas kämpen omkull kan han resa sig omedelbart med ett lyckat färdighetsslag. |
| Liggande strid | Alltid påkopplad. Kan slå, sparka, parera och göra låga kast liggande. Angripare får ingen bonus mot liggande. |
| Låsning | Utförs som attack, kan pareras. Försvararen kan inte röra sig. Ta sig loss: övervinna stridskonstens FV med egen halverad SMI (avrunda nedåt). |
| Vapenteknik | Vapen som ingår i stridskonsten kostar som vanligt (2 eller 3 poäng), både anfall och parering. Trästav eller lajatang: för 3 poäng kan man anfalla och parera med vapnet samma SR. |
| Missilavledning (beskrivs som Missilduckning) | Ducka eller hoppa undan kastvapen och pilar, inte slungstenar och armborstlod. En projektil per SR. Måste se projektilen komma. |
| Initiativbonus | Alltid påkopplad. +5 på SMI vid turordning. |

Kommentarer (G37)

- Parerar försvararen ett obeväpnat angrepp med vapen: särskild parering ger angriparen normal vapenskada (utan SB) i den kroppsdel som användes, perfekt parering maximal skada (utan SB). Rustning skyddar.
- Obeväpnad närstrid kan inte utföras i tyngre rustning än läder.
- Saknar stridskonsten "obeväpnad parering" kan kämpen, obeväpnad, bara parera obeväpnade attacker från människoliknande varelser.

Skillnader mot DoD 4.0 sin stridskonstlista (bok 1): i 4.0 räknas kostnaden som grundkostnad i EP (+2 EP om den inte är yrkesfärdighet); 4.0 har också Blind strid, Dubbelslag, Dubbelspark, Stålsättning och Vidvinkelsyn men inte Vapenteknik och Missilavledning; i 4.0 låter obeväpnad parering en parera som med vapen (G: -1T6 skada); Fallteknik/Rullning i 4.0 ger dessutom en rullning upp till 5 rutor per SR som inte kan huggas på (G: bara halv fallskada); Låsning/Neddragning kostar 1,0 i 4.0 (G: 0,5).

### 9.8 Stridskonster i Ereb-Altor (G37)

| Stridskonst | Utövare | Komponenter | Kostnad |
|---|---|---|---|
| Tanno-tekniken | Den Lysande Vägens solmunkar | trästav (3-poängsvarianten), fint (0,5), initiativbonus (0,5) | 4 bakgrundspoäng |
| Stjärnnäven | Landet Erebos | normal spark (0,5), bakåtspark (0,5), krosslag (1,0), obeväpnad parering (0,5), fallteknik (0,5), liggande strid (1,0) | 4 bakgrundspoäng |
| Quack-fu | Ankorna; "särskilt anpassad till ankornas förmågor och begränsningar" | krosslag (1,0), obeväpnad parering (0,5), lågt kast (0,5), fallteknik (0,5), uppresning (0,5) | 3 poäng |

**Quack-fu som kampprofil** (bare G-reglene satt sammen):

- Angrep: Krosslag 1T6. Lågt kast (vanlig plass i SR, motstanderen faller i sin rute uten skade, kan pareres).
- Forsvar: Obeväpnad parering mot alle nærkampangrep, også våpen, trekker 1T6 fra skaden.
- Passivt: Fallteknik, halv fallskade alltid. Uppresning: reiser seg straks etter å ha blitt slått over ende med et vellykket slag.
- Ingen spark i stilen. Høyst läderrustning. Ett FV for alt. Misbruk koster FV.
- Mot våpen: pareres et quack-fu-angrep med våpen og pareringen blir särskild eller perfekt, tar anden våpenskade i kroppsdelen den slo med (se Kommentarer).

### 9.9 Skador (G37)

Når Totala KP nærmer seg null. Ikke for odøde, og ikke for varelser med Totala KP 6 eller lavere normalt.

| Totala KP kvar | Effekt |
|---|---|
| 3 | SMI och SMI-baserade färdigheter halverade. Förflyttningsförmågan minskad till 3/4. Akrobatik kan inte användas. |
| 2 | Kan inte slåss eller använda uppfattnings- och B-färdigheter. Alla andra färdigheter och förflyttningsförmågan halverade. |
| 1 | Kan inte använda några färdigheter. Förflyttningsförmågan minskas till 1/4. |

## 10. Magi i Gigant (G13-29)

Gigant oppgir ikke PSY-kostnad per besvärjelse. Regelen står i Expert Magiboken: 1 PSY per effektgrad (M). Kolonnen "Sv" er skolvärde (nødvendig FV i skolen). Bokstaver etter navnet: F = fysisk manifestation, K = kvick, R = ritual. S = magikerens skicklighetsvärde, E = effektgrad.

### 10.1 Minimagi (G14)

Alle magikere lærer dette først. Ingen effektgrader, skolvärde 0, tar ingen plass i minnet, regnes som kvicka og fysiske, lykkes alltid, koster 1 PSY. Räckvidd 3 m, magikeren må se målet.

Bläddra (blar fram ønsket side), Knäppa (knuser et lite insekt), Kyla (kjøler drikk eller mat, høyst 10 liter, ned til +1 °C), Minilyft (flytter en gjenstand på høyst 20 gram), Smaksätt (krydrer mat, høyst 10 liter), Vissling (plystring opp til 110 desibel), Väldoft (behagelig duft, radius 3 m), Värma (varmer drikk eller mat, høyst 10 liter, opp til +99 °C), Öppna/Stänga (åpner eller lukker en ulåst dør, et vindu eller lokk).

### 10.2 Besvärjelser

| Besvärjelse | Skola | Sv | Räckvidd | Varaktighet | Effekt | Sida |
|---|---|---|---|---|---|---|
| Tidsinställning | alla | 15 | Beröring | Speciell | Som SIGILL, men utlöses efter en viss tid, högst 240 timmar. | G14 |
| Träeld (F, K) | Animism | 2 | Beröring | Omedelbar | Antänder ett stycke torrt, dött trä; ett stycke till per extra E. | G14 |
| Vindpil (F) | Animism | 6 | S×2 rutor | S×1 SR | Träpil (spets ej av järn) svävar framför ansiktet och avfyras med en gest. Träffar automatiskt, 1T10+E skada, rustning skyddar. Bara magi (VIRVELSKÖLD) eller att försvinna ur sikte hjälper. | G14-15 |
| Kamouflage | Animism | 7 | Personlig | S/4 minuter | Smälter in i omgivningen. Står han helt stilla kan han inte uppfattas med något naturligt sinne. Sökande magi måste övervinna E. | G15 |
| Repväx (F) | Animism | 7 | Beröring | S×1 minuter | Organiskt rep (minst 1 m) blir 10 m längre per E. | G15 |
| Virvelsköld (F) | Animism | 8 | Personlig | S×1 SR | Luftvirvel 75 cm. E mot projektilens motståndsvärde (motståndstabellen): projektilen missar. Gäller även egna projektiler, samt oxpiska och lasso. | G15 |
| Rikta brevduva | Animism | 11 | Beröring | Permanent | Ger brevduvan ett nytt "hemma"; en duva till per extra E. | G16 |
| Neutralisera gift (F) | Animism | 15 | Beröring | Omedelbar | Neutraliserar 1T6+1 giftstyrka per E. Läker inte redan vållad skada. | G16 |
| Fördrivning (R) | Animism | 16 | S×2 rutor | Permanent | Exorcism av ande: 1 E per helt femtal PSY hos den odöde. Lyckad förhäxning fördriver den för evigt; miss: magikern slår på Skräcktabellen. | G16 |
| Besätta ryggradsdjur | Animism | 18 | S/2 rutor | S×1 minuter | Själen tar säte i ett ointelligent ryggradsdjur; egen kropp i koma. Dödas djuret: -1 PSY permanent. | G16 |
| Regenerera (R) | Animism | 20 | Beröring | Se nedan | Avhuggen arm, vinge eller ben växer ut 1 cm per dygn. En kroppsdel per E. | G16 |
| Rost (F, K) | Elementarmagi | 4 | 1 ruta | Omedelbar | E² kubikcentimeter järn blir rost där magikern pekar. | G16-17 |
| Kalla handen (F, K) | Elementarmagi | 4 | S/2 rutor | Omedelbar | Köldstråle: svårt FYS-slag (normalt för köldvarelser), modifierat med naturligt skydd. Miss: kan inte göra något denna SR. Lyckat: -4 (-20 %) på CL denna SR. | G17 |
| Luftstråle (F, K) | Elementarmagi | 4 | S/2 rutor | Omedelbar | Kraftig luftstråle, 5 cm, blåser bort damm och papper. | G17 |
| Vattenstråle (F, K) | Elementarmagi | 5 | Personlig | Omedelbar | Cirka 100 liter vatten, räckvidd 5 m + 1 m per E. | G17 |
| Jordstöt (F) | Elementarmagi | 18 | S×2 rutor | Omedelbar | Marken skakar inom radien. Lösa föremål välter, alla (även magikern) slår svårt SMI-slag för att stå kvar. Under jord 10 % per E för ras. | G17 |
| Gasmoln (F) | Elementarmagi | 5 | S×10 rutor | S×1 minuter | Ny version (SL väljer mot Experts). Se tabell under. | G17-18 |
| Tvivel | Harmonism | 3 | S×2 rutor | Konc | Alla levande inom räckvidden: CL -2 per E på alla färdigheter. | G19 |
| Flygförmåga (K) | Harmonism | 3 | Personlig | Konc | Flyger 4×E rutor per SR, bär högst 2×E BEP. | G19 |
| Reptrick (F) | Harmonism | 4 | Beröring | Konc | Repsektion på 2×E meter reser sig 1 m/s och blir styv som stål. | G19 |
| Dövhet | Harmonism | 6 | S×2 rutor | Omedelbar | Alla utom magikern döva 1T4 timmar (skyddade öron 1T20 minuter). | G19 |
| Skrän (K) | Harmonism | 6 | S×2 rutor | Konc | Förhäxade kan inte använda några färdigheter. Ointelligenta flyr; intelligenta flyr eller stannar med halverad förflyttning. | G20 |
| Självläkning | Harmonism | 7 | Personlig | Konc | Läker E KP per minut. | G20 |
| Obemärkt | Harmonism | 8 | S×2 rutor | Konc | Förhäxade kan inte uppfatta magikern med syn, hörsel eller lukt. Beröring bryter. | G20 |
| Splittra (F, K) | Harmonism | 9 | S/2 rutor | Omedelbar | Allt glas, lergods, keramik och porslin splittras; magiska föremål bara om E övervinner deras summerade E. | G20 |
| Överrösta | Harmonism | 9 | S×2 rutor | Konc | Dränker allt annat ljud. Annan magi eller harmoni tränger in bara om dess E övervinner. | G20 |
| Frid | Harmonism | 10 | S×2 rutor | Konc | En varelse glömmer aggressiva tankar och lyssnar. | G20 |
| Sammanfoga | Harmonism | 10 | Beröring | Se nedan | Lagar tillverkade föremål: E1 dolk (10 minuter spel), E2 långsvärd (20 minuter), E3 2H-svärd (en timme), E4 rustning (halv dag), E5 mindre vagn (hel dag + en dags vila). | G20 |
| Dans | Harmonism | 11 | S×2 rutor | Konc | En intelligent varelse börjar dansa. Angrepp eller våld bryter. | G21 |
| Mod | Harmonism | 12 | Personlig | Konc | Magikern slår aldrig på Skräcktabellen. | G21 |
| Fruktan | Harmonism | 13 | S×2 rutor | Konc | En intelligent varelse slår en gång på Skräcktabellen. | G21 |
| Hetta | Harmonism | 13 | S/2 rutor | Konc | Värmer vatten. Varelse med normal kroppsmassa: 1 KP första SR, 2 nästa, osv. Rustning skyddar inte. | G21 |
| Massmod | Harmonism | 15 | S×2 rutor | Konc | Alla inom räckvidden (även magikern) slår inte på Skräcktabellen. | G21 |
| Vila | Harmonism | 15 | S×2 rutor | Konc | Två timmars lyssnande ersätter en natts sömn. Inte svartfolk och stenfolk. | G21 |
| Massfrid | Harmonism | 16 | S×2 rutor | Konc | Som Frid för alla inom räckvidden. | G21 |
| Stiltje (F) | Harmonism | 16 | S×10 rutor | Konc | Dämpar naturkrafter: blixt, vind, nederbörd, sjö, kyla, värme, jordbävning. Inte besvärjelsen BLIXT. | G21-22 |
| Kamplust | Harmonism | 17 | S×2 rutor | Konc | En intelligent varelse angriper närmsta varelse (inte magikern). | G22 |
| Massdans | Harmonism | 17 | S×2 rutor | Konc | Som Dans för alla intelligenta inom räckvidden. | G22 |
| Massfruktan | Harmonism | 18 | S×2 rutor | Konc | Alla intelligenta slår en gång på Skräcktabellen. | G22 |
| Sann form | Harmonism | 20 | S×2 rutor | Konc | Osynligt syns, illusioner upphör, formförändrat återgår, om E övervinner den döljande E. | G22 |
| Masskamplust | Harmonism | 25 | S×2 rutor | Konc | Alla intelligenta angriper närmsta varelse (inte magikern). | G22 |
| Utseendeförändring | Illusionism | 10 | Personlig | S×1 timmar | Ändrar hårfärg, ögonfärg, anletsdrag och röst, inte grundegenskaper. | G22 |
| Färgskifte | Illusionism | 11 | S×2 rutor | S/4 veckor | Ett dött föremål per E byter färg. | G22 |
| Falsktal (K) | Illusionism | 12 | S×2 rutor | Omedelbar | Intelligent varelse säger en mening på högst sex ord som magikern väljer. | G23 |
| Avlyssning | Illusionism | 13 | Beröring | S/4 dygn | Föremål sänder vad som händer inom 5 m upp till 200 m. E1 stämning, E2 ljud, E3 svartvit bild, E4 lukt, E5 färgbild, E6 ultraljud. | G23 |
| Fäste | Mentalism | 6 | Beröring | S×1 minuter | Fäste med bara händer och fötter på väggar och tak. 1 E per 5 STO. | G24 |
| Väcka (K) | Mentalism | 7 | S×2 rutor | Omedelbar | Väcker en sovande per E (magiskt eller drogsövd: 2 E). Drogsövd blir omtöcknad (halverad SMI och INT). | G24 |
| Syraskydd | Mentalism | 10 | Beröring | S×1 minuter | Kroppen skadas inte av syror och baser (inte utrustningen). | G24 |
| Stålslag | Mentalism | 12 | Personlig | S×1 SR | Naturliga vapen slår E+1 tärningar (människa E2: slag 3T3, spark 3T6) + SB, CL +1 per E, skadas inte mot hårda mål. | G25 |
| Rätt väg | Mentalism | 12 | Personlig | S×1 minuter | Rätt val vid varje vägval (inte nödvändigtvis ofarligt). | G25 |
| Jättestark | Mentalism | 13 | Personlig | S×1 minuter | STY till rasens naturliga max (människa 18). Kan inte kombineras med ÖKA eller droger. | G25 |
| Tillkalla föremål | Mentalism | 14 | Beröring | Omedelbar (se text) | Föremål flyger (F50) till handen på kommandoord om man ser det. Fastsittande lossnar om 2×E övervinner STY. Ger dragning utan turordningsstraff. | G25 |
| Besmutsa | Nekromanti | 1 | S×2 rutor | Omedelbar | Offret blir smutsigt och illaluktande tills det tvättar sig. | G25 |
| Skendöd (K) | Nekromanti | 12 | Personlig | S/4 timmar | Synbarligen död; magisk undersökning måste övervinna E. Kan skadas, återvinner inte PSY. | G25-26 |
| Fobi | Nekromanti | 12 | Beröring | S/4 veckor | En fobi per E från fobitabellen (dubletter slås om). | G26 |
| Sinnesbedövning | Nekromanti | 13 | S×2 rutor | S×1 SR | Ett sinne ur spel; E4 två sinnen, E9 tre. | G26 |
| Deformera | Nekromanti | 15 | S×2 rutor | S/4 dygn | STY, SMI, KAR, deras färdigheter och förflyttning halveras. | G26 |
| Animera tupilak (R) | Nekromanti | 15 | Beröring | S/4 veckor | Zombie av delar från olika kroppar. Färdigheter från huvudet, högst 80 % av förflyttningen hos den som stod för benen. | G26 |
| Förtvina extremitet | Nekromanti | 17 | S×2 rutor | Permanent | Arm, ben eller vinge obrukbar: E1 en, E4 två, E9 tre, E16 fyra, E25 fem. REGENERERING återställer. | G26 |
| Frammana dödsriddare (R) | Nekromanti | 22 | Beröring | Permanent | Personen kan återvända och bo i sitt skelett som dödsriddare. | G26-27 |
| Frammana gast (R) | Nekromanti | 25 | Beröring | Permanent | Personen kan bli gast. 1T100 + PSY + FV Nekromanti: 01-50 kummelgast, 51-75 mörkergast, 76+ dödsgast. | G27 |
| Zombiekopia (R) | Nekromanti | 26 | Beröring | S/4 veckor | Zombie med exakt utseende av en annan person (lik högst 48 timmar, hår eller hud från personen). Kan inte tala, luktar lik. | G27 |
| Spökdråp | Nekromanti | 27 | Beröring | Omedelbar | Inom en minut efter döden: själen tvingas hemsöka platsen som spöke tills ett villkor uppfylls. | G27 |
| Stridslust | Symbolism | 19 | - | - | De som ser symbolen angriper närmaste varelse så länge de hittar motståndare eller effekten varar. | G27 |
| Väktare | Symbolism | 20 | - | - | Skalmodell 1:100 av en byggnad larmar och visar en lysande punkt när ett villkor (ett per E, fysisk händelse inom 20 m) inträffar. | G27-28 |

**Virvelsköld, motståndsvärden (G15)**: Arbalestlod 6, Armborstlod 6, Blåsrörspil 1, Bola 6, Kastkniv 4, Kastspjut 5, Kaststjärna 4, Kastyxa 5, Klippblock 9, Lasso 1, Oxpiska 2, Pil 4, Slungsten 7, Sten 5.

**Gasmoln (G17-18)**. Gastypen krever et minste antall E (kolonnen E). Det gir en sky på 100 m³ med giftstyrka 1T4; hver ekstra E gir +100 m³ eller +1T4. Giftstyrkan mot hvert offers FYS på motståndstabellen: utenfor parentes rammer alle i skyen, innenfor parentes rammer dem hvis FYS blir overvunnet. Giftgas: FYS ikke overvunnet = halv giftstyrka i skada, overvunnet = hel (fra Totala KP).

| Gastyp | E | Färg | Effekt |
|---|---|---|---|
| Äcklande | 1 | Grön | Illamående. Luktsinnet sätts ur spel medan man befinner sig i molnet och under 2T6 SR efter det att man lämnat det. (Kräkningar som tvingar varelsen att stå stilla och spy under 1T4 SR.) |
| Irriterande | 3 | Gul | Ögonen tåras. Alla uppmärksamhetsfärdigheter får -10 på CL medan man är i molnet och under 2T6 SR efter det att man lämnat det. (Temporär blindhet medan man är i molnet och under 2T6+6 SR efter det att man lämnat det. Våldsam klåda som varar tills man har tagit av sig alla kläder och torkat av kroppen. Klådans effekt är att SMI och alla SMI-baserade färdigheter halveras.) |
| Sövande | 7 | Vit | Yrsel som minskar SMI och alla SMI-baserade färdigheter till 1 så länge man är i molnet och under 2T6 SR efter att man lämnat det. Förflyttningsförmågan halveras under samma tid. (Sömn under 1T4+1 timmar.) |
| Gift | 10 | Gråblå | Effekt beskriven i texten. |

**Harmonism, felles regler (G18-19)**: magi gjennom sang og musikk. Krever FV 5 i sang a capella og FV 5 i et instrument. Människor, alver og metamorpher (svanmö, hjortid, säling, örnman). Varaktighet Konc = så lenge magikeren spiller eller synger. Bare én harmonibesvärjelse om gangen. Magikeren rammes aldri av egne negative effekter og kan gå i gangtakt. Offeret må høre den; mislykket förhäxning prøves på nytt hver SR. Virker i et område med magikeren i sentrum og räckvidden som radius. God hørsel (fladdermöss, grottalver, insektoider, onaquis, valar, vargmän): PSY -2 for å motstå. Fisk, reptiler, amfibier: PSY +2. Døve og odøde påvirkes ikke.

**Krigsmagi (G23-24)**: bare for fältslag. Magikergrupper (turma) med en dirigent (INT 15, PSY 20, Krigsmagi 15). Stridsvärde = summen av PSY. Försvarsfält, anfallsstöt og besvärjelser per fältrunda. Alle besvärjelser E1, hele slaget som räckvidd, én fältrunda varaktighet.

| Besvärjelse | Sv | Kostnad | Typ | Effekt |
|---|---|---|---|---|
| Moralförstärkning | 5 | 6 PSY/manipel | Defensiv | Manipelns stridsvärde × 1,5. |
| Demoralisering | 8 | 10 PSY/manipel | Offensiv | Stridsvärdet minskar med 1/3. |
| Oordning | 13 | 6 PSY/manipel | Offensiv | Disciplinerad manipel blir odisciplinerad; odisciplinerad får halverat stridsvärde. |
| Fanatism | 15 | 17 PSY/manipel | Defensiv | Stridsvärdet dubblas. |
| Fruktan | 18 | 23 PSY/manipel | Offensiv | Stridsvärdet halveras. |

### 10.3 Magiska drycker (G28)

Drikken er silverklorid i vann: 1 gram per desiliter, 1 km per gram. Förtrollas etter reglene for magiska föremål, men uten LADDNING, PERMANENS eller NEXUS. Bare SIGILL pluss én annen besvärjelse. Høyst 1 E SIGILL og 1 E av den andre besvärjelsen per desiliter. Når noen drikker, utløses SIGILLET og den andre besvärjelsen virker.

### 10.4 Golem (G28-29)

Leirkropp (krever Skulptering/hantverk FV 4), 1 E per 4 STO på alle besvärjelser: FRAMMANA for alle sju elementarer og en BLIXT, hver under et SIGILL som utløses av en HÄV FÖRSTENING. Mislykkes én: eksplosjon, 2T6 skada på magikeren. Golemen er lojal og dum (INT-slag ved uklare ordre), immun mot søvn, gift og sykdom. KP 0: eksploderer med skada lik STO, -1 per meter avstand. Grundegenskaper: STY = STO, STO etter konstruksjon, FYS = STO, SMI 2T6, INT 1T6, PSY STO+3T6. Naturligt skydd 0. Förflyttning L = SMI. Kategori A-ferdigheter høyst lik grunnegenskapen, kategori B høyst FV 3, aldri magi. 7 BEP per STO.

### 10.5 Expanderad fobitabell (G29)

| 1T20 | Betyder fruktan för |
|---|---|
| 1 | Agorafobi · Öppna platser (ej gråalver) |
| 2 | Klaustrofobi · Trånga utrymmen (ej dvärgar eller grottalver) |
| 3 | Demofobi · Folksamlingar |
| 4 | Ailurofobi · Katter (ej kattmän) |
| 5 | Entomofobi · Insekter |
| 6 | Ofiofobi · Ormar (ej serpenter) |
| 7 | Skotofobi · Mörker (ej svartfolk eller grottalver) |
| 8 | Dendrofobi · Träd (ej skogslevande älvfolk) |
| 9 | Talassofobi · Hav (ej havslevande älvfolk) |
| 10 | Xenofobi · Främlingar |
| 11 | Hippofobi · Hästar (ej kentaurer) |
| 12 | Trogliofobi · Underjorden (ej dvärgar eller grottalver) |
| 13 | Hagiofobi · Heliga platser |
| 14 | Kynofobi · Hunddjur (ej vargmän) |
| 15 | Ornithofobi · Fåglar (ej svanmöer eller örnman) |
| 16 | Iktyofobi · Fiskar |
| 17 | Pyrofobi · Eld (ej irrbloss) |
| 18 | Botanofobi · Växter (ej älvfolk) |
| 19 | Anekrofobi · Odöda |
| 20 | Monofobi · Ensamhet (ej eremitiska älvfolk) |

## 11. Örter & droger (G47-57)

### 11.1 Modifikationer för Botanik (G48)

Vanlig på hemkontinenten +2, Växer ej på hemkontinenten -2, Vanlig +1, Ovanlig ±0, Sällsynt -2, Mycket sällsynt -4, Unik -20.

### 11.2 Växttabell (G52)

Fullstendige beskrivelser (klimatsone, voksested, blad, blomst) står på G48-51.

| Växt | Vanlighet | Klimatzon | Delar till droger |
|---|---|---|---|
| Belrondsvamp | Mycket sällsynt2) | - | Svampprotenssaft |
| Brunmossa | Vanlig | Tempererad | Hela växten |
| Budört | Sällsynt | Subarktisk | Bladen |
| Draktungeblomster | Mycket sällsynt | Subtropisk | Ståndaren |
| Eldsblomma | Sällsynt | Subtropisk | Frukt, sav, rot |
| Gråbinka | Sällsynt | Tempererad | Saven |
| Grönmossa | Ovanlig | Tempererad | Hela växten |
| Haverrot | Mycket sällsynt | Tempererad, Subtropisk | Rotlöken |
| Huvudsvamp | Sällsynt | Tempererad | Innanmätet |
| Iran | Mycket sällsynt | Tempererad | Blad |
| Jungfrulin | Vanlig | Arktisk | Stjälken |
| Kirskaktus | Mycket sällsynt | Hetöken | Pollen, frukt, rot |
| Krustistel | Ovanlig | Arktisk | Roten1) |
| Kungslilja | Mycket sällsynt | Tempererad | Bladen |
| Kvälsterbuske | Vanlig | Tempererad | Bären |
| Malgellan | Sällsynt | Tempererad | Bär, rot |
| Mitzelblomster | Ovanlig | Tempererad | Blomma, blad |
| Molnsvamp | Sällsynt | Tropisk | Sporerna |
| Nysört | Vanlig | Tempererad | Hela örten |
| Rotnäva | Vanlig | Subarktisk | Rotknölarna |
| Silionsvamp | Ovanlig | Tempererad | Svampen |
| Silversporre | Ovanlig | Tropisk | Roten |
| Simeljört | Mycket sällsynt | Arktisk | Pollen |
| Solkrokus | Sällsynt | Tropisk | Rotlök |
| Tyril | Sällsynt | Tempererad | Blad |
| Vitmåra | Mycket sällsynt | Subtropisk | Blad, frukt, rot |
| Äreris | Ovanlig | Tempererad | Blommor |

1) Roten sitter mycket djupt och är mycket svår att få tag i. 2) Odlas systematiskt av grottalverna. [transkripsjon: "Svampprotenssaft" står slik; G50 sier "Svampfotens saft".]

### 11.3 Droger (G52-56)

Svårighetsgrad (G52) viser hvor vanskelig drogen er å lage, hvilket utstyr som trengs og hvor mye FV modifiseres. Nivåene, i rekkefølge: Lätt (krever ikke avansert utstyr); den vanligste (bra utstyr); litt vanskeligere (relativt avansert utstyr); Svår (svært avansert utstyr, produsenten må ha FV 10); den mest kompliserte (svært avansert utstyr, FV 15). [transkripsjon: nummerne 1-5 og FV-modifikasjonene mangler; trolig nivå 1 til 5.]

Drogene har to ventetider: den første er tiden til effekten, den andre tiden til ettervirkningen. Pris fra prislisten på G57 der den finnes (chans = sjanse for å finne den til salgs). Hos en alkymist koster en drog ellers summen av ingrediensene × svårighetsgraden.

| Drog | Effekt | Form, konsumtion | Väntetid, verkningstid | Efterverkning (väntetid, tid) | Färdigheter | SG | Pris (chans) | Sida |
|---|---|---|---|---|---|---|---|---|
| Nysörtspulver | Framkallar nysningar | Pulver, inandning genom näsan | 0; 3 SR | 1T8 minuter, 2T10 minuter: näsan täppt, inget luktsinne | Drogkunskap | 1 | Nysört 10 sm/st (65 %) | G52-53 |
| Tyrilextrakt | Sömnmedel | Trögflytande vätska, genom sår | 1T20 sekunder; 1T6 timmar | - | Drogkunskap, Giftkunskap | 4 | Tyrilblad 20 gm/st (5 %) | G53 |
| Iran | Användaren känner ingen smärta | Gräs, äts | 1T6 minuter; 1T6 timmar | 1T10 minuter, 1T8 timmar: total förlamning | Botanik (ingen tillagning) | - | 50 gm/st (2 %) | G53 |
| Mibolium | Gift med styrka 2+FV (högst 20) | Blåsvart pulver, i föda eller dryck | 2T6 SR; se gift i grundreglerna | - | Drogkunskap/Giftkunskap | 3 | - | G53 |
| Kungsliljeextrakt | Läker 2T3 KP när dekokten är het. Hjälte: 6 KP. Hjälte med Läkeförmåga: 10+INT-grupp KP. | Vätska, drickes | 1T4 SR; 1 SR per KP som läks | 2T4 SR, väntetid +10 SR: medvetslöshet | Drogkunskap, Läkedrogskunskap | 3 | Kungslilja 92 gm/st (2 %) | G53 |
| Donuros | Stoppar starka blödningar | Oljeliknande salva, smörjes på såret | 0; 2T4 SR | 0, 1T6+6 SR: tillfällig förlamning (alt. system: bara den skadade kroppsdelen) | Drogkunskap, Läkedrogskunskap | 1 | 130 gm/dos (25 %) | G53 |
| Tetinon | Finna dolda ting +10 på avstånd | Vätska, drickes | 1T4+4 SR; 1T10+10 minuter | Inga, men -10 på alla färdigheter med synen inom 10 m under verkningstiden | Drogkunskap | 3 | - | G53 |
| Mhiboulan | Mörkersyn | Svart pulver, inhaleras | 1T6 SR; 2T6+6 minuter | 0, 1T3 minuter: allt ljus bländar, bedövad 1T3 minuter | Drogkunskap | 2 | 320 gm/dos (12 %) | G54 |
| Spetzsyra | Frätande syra (inte glas), fungerar som gift, kan öppna lås. Måste fräta bort rustningen först. Giftstyrka = FV. | Syra | 0; 0 | 0 | Drogkunskap | 3 | 410 gm/dos (8 %) | G54 |
| Edinor | Motgift, motgiftsstyrka 1T4+13 | Vätska, drickes | 1T4 SR; se motgift | 1T20 minuter, 1T4 minuter: illamående (normalt FYS-slag, miss: kräkningar 1T4 timmar, halverade färdigheter, -2 på alla färdigheter) | Drogkunskap | 2 | 100 gm/dos (33 %) | G54 |
| Dödshjärta | Gift, giftstyrka 20 | Grönsvart gelé, föda, dryck eller sår | 0; se gift | - | Drogkunskap/Giftkunskap | 4 | - | G54 |
| Bendinon | Förblindande: miss på normalt FYS-slag = permanent blind, annars 1T6 dagar | Rött pulver, mat eller dryck | 1T100 minuter | 0 | Drogkunskap/Giftkunskap | 4 | - | G54 |
| Belrond | Energitillskott, vaken längre, motsvarar en dagsranson | Vätska, drickes | 0; 1 dygn | 0 | Drogkunskap | 2 | 95 gm/dos (30 %) | G54-55 |
| Enridiondon | Hindrar åldrande | Pulver, inhaleras | 0; 1 månad | Vanebildande: varje månad utan dos svårt PSY-slag, miss = en fobi som inte går över. Botas av HELA E6. | Drogkunskap | 4 | - | G55 |
| Groharem | Återger syn förlorad genom droger och magi, gradvis | Trögflytande vätska, drickes | 0; 1T2+1 timmar | 0 | Drogkunskap, Läkedrogskunskap | 2 | - | G55 |
| Gablonell | Halverar alla skador från eld och brännsår | Olja, smörjes på direkt efter skadan | 0; 1 SR | 0, 1T4 timmar: risk för eksem 4 + 2 per SR fördröjning; klåda halverar SMI och SMI-färdigheter | Drogkunskap, Läkedrogskunskap | 2 | 126 gm/dos (30 %) | G55 |
| Denior | Starkt berusande, +4 i Stridsmoral; påverkad: -2 på INT, PSY, deras färdigheter och förflyttning | Flytande, drickes | 1T8 SR; 1T20+20 minuter | 1T10+6 minuter: sömn 3T10 minuter, baksmälla 8T4 timmar | Drogkunskap | 3 | 120 sm/dos (32 %) | G55 |
| Kondino | Motgift, styrka 20. Misslyckas den: svårt FYS-slag ger en chans till efter 1T4 SR. | Silvergrått pulver, blandas med vatten | 0; se motgift | 0 | Drogkunskap | 3 | - | G55-56 |
| Spendiorna | Paralysering | Gas, inandas | FYS-grupp × 1 SR; 3T6 × 10 minuter | 0: yrsel och illamående | Drogkunskap/Giftkunskap | 3 | - | G56 |
| Quackanrachia | Gift, giftstyrka 16 + tillverkarens FV-grupp i Drogkunskap eller Giftkunskap | Vätska med stark lukt, mat eller dryck | 1T3 SR; 0 | 0 | Drogkunskap/Giftkunskap | 4 | - | G56 |
| Melion | Skador och sår läker dubbelt så fort | [transkripsjon: resten av oppføringen mangler] | | | | | - | G56 |
| Bactar | Motgift: giftets styrka -1T4+3 | Pulver, inhaleras | 1T3 SR; 0 | 0: slö och trött 2T6 timmar | Drogkunskap/Läkedrogskunskap | 4 | - | G56 |

**Experts droger, svårighetsgrad (G56)**: Gelli 3, Duragos 2, Liliansblad 3, Karsonolja 2, Svartblod 1, Ganas 3, Sarrassos 4, Stjärnedryck 4, Stridsdryck 2, Erisinon 2. (Selve drogene står i Expert Magiboken.)

### 11.4 Prislista för droger och växter (G57)

| Namn | Kostnad | Chans |
|---|---|---|
| Nysört | 10 sm/st | 65% |
| Tyrilblad | 20 gm/st | 5% |
| Iran | 50 gm/st | 2% |
| Malgellanbär | 65 sm/st | 25% |
| Malgellanrot | 30 gm/st | 10% |
| Silversporrerot | 45 gm/st | 20% |
| Rotnävans knöl | 15 sm/st | 85% |
| Jungfrulin (10 stjälkar) | 8 sm/10 st | 90% |
| Äreris (10 blommor) | 12 gm/10 st | 15% |
| Kungslilja | 92 gm/st | 2% |
| Mitzelblomsterblad | 8 sm/st | 23% |
| Mitzelblomsterblomma | 50 sm/st | 13% |
| Draktungeblomstrens ståndare | 100 gm/st | 2% |
| Kvälsterbuskbär | 3 sm/st | 50% |
| Krustistelrot | 28 gm/st | 20% |
| Haverrot | 28 gm/st | 15% |
| Kirskaktuspollen | 80 gm/st | 1/2%1) |
| Kirskaktusblomma | 750 gm/st | 1/4%2) |
| Kirskaktusrot | 35 gm/st | 8% |
| Kirskaktusfrukt | 70 gm/st | 1/2%1) |
| Gråbinkesav | 70 sm/dl | 33% |
| Budörtsblad | 30 sm/g | 19% |
| Silionsvamp | 68 sm/st | 22% |
| Molnsvamp | 90 sm/st | 18% |
| Belrondsvamp | 12 gm/st | 16% |
| Simeljörtspollen | 90 gm/g | 3% |
| Silverstjärneblad | 12 gm/g | 3% |
| Silverstjärnerot | 75 gm/st | 5% |
| Grönmossa | 20 sm/kg | 100% |
| Huvudsvamp | 70 gm/kg | 18% |
| Eldsblomma, frukt | 10 gm/st | 3% |
| Eldsblomma, sav | 320 gm/dl | 2% |
| Eldsblomma, rot | 50 gm/st | 5% |
| Solkrokuslök | 75 sm/st | 45% |
| Solkrokusblomma | 12 sm/st | 85% |
| Banterfrukt | 180 gm/st | 3% |
| Banterblomma | 98 gm/st | 5% |
| Banterblad | 275 gm/st | 1% |
| Vitmåra, rot | 83 gm/st | 10% |
| Vitmåra, blad | 12 sm/st | 23% |
| Vitmåra, frukt | 32 sm/st | 15% |
| Brunmossa | 8 sm/g | 75% |
| Donuros | 130 gm/dos | 25% |
| Mhiboulan | 320 gm/dos | 12% |
| Spetzsyra | 410 gm/dos | 8% |
| Edinor | 100 gm/dos | 33% |
| Belrond | 95 gm/dos | 30% |
| Gablonell | 126 gm/dos | 30% |
| Denior | 120 sm/dos | 32% |

1) Slå först 01, sedan under 50. 2) Slå först 01, sedan under 25.

## 12. Øvrig Gigant, kort

**Fältslag (G38-46).** Abstrakt masseslag med 2T6 per fältrunda (en halvtime). For en enkelt rollperson i slaget: **Ödestabellen** (G43, 1T10 per runde, +1 om man er djerv) gir prosjektiltreff eller nærkamp mot soldat, underbefäl eller officer (verdier fra E73), og **Krigsbytestabellen** (G44, 2T6 + modifikasjoner) gir bytte fra 1T10 sm til fanget høy offiser. Kan brukes som en hendelse i spillet, ellers uten verdi her.

**Borgar (G58-77).** Vegger, gulv, tak og dører har KP per m² og absorberer skade som en rustning. For hvert slag mot veggen slår veggen sitt Parera-kast; blir resultatet lik eller høyere enn våpenets BV, synker BV med 1 (G61-62). Hullet må være minst den "minsta öppning" materialet tillater.

| Material | Abs | Parera |
|---|---|---|
| Halm | 4 | 2T4 |
| Trä | 6 | 2T8 |
| Tegel1) | 8 | 2T10 |
| Sten | 10 | 2T12 |
| Metall | 12 | 2T20 |

1) Gäller även klinad vägg.

Dörrar (G63), KP/m²: furu 30, ek 80, brons 90, järn 110 (normal dörr 2 m², minsta öppning 1/2 m² för furu, 1 m² övriga). Trävägg furuplank 30, palissad 100. Tegelvägg enkel 60, dubbel 120, trippel 180. Stenvägg 250-500. Port trä (ek) 70, metall (järn) 150, fällgaller 80. Järnförstärkning +10 KP/m².

Verktyg som vapen (G63-64), bara slag var tredje SR, ingen parering emellan:

| Namn | Skada | BV | STY grupp |
|---|---|---|---|
| buskyxa | 1T4 + 6 | 17 | 2 |
| vedyxa | 1T6 + 12 | 17 | 3 |
| klyvyxa | 1T8 + 14 | 17 | 4 |
| handslägga | 1T4 + 4 | 21 | 3 |
| storslägga | 1T6 + 10 | 21 | 4 |
| korphacka | 1T6 + 12 | 23 | 4 |
| järnspett | 1T8 + 10 | 23 | 4 |

**Odöda (G78-81).** Fem släkten: andar, gastar, kroppsliga odöda, likätare, magiska odöda. Felles: förbättrar inte grundegenskaper, mister alla HP och hjälteförmågor, behöver inte andas, äta eller sova, immuna mot utmattning, droger, gifter och sjukdomar, läker inte (HELA har ingen effekt; ANIMERA DÖD läker 1T10 KP per E), ser i mörker, rök och magiskt mörker, slår aldrig på Skräcktabellen. Gast: KP = PSY (besvärjelser kostar KP, skada kostar PSY). Odöda magiker kan inte använda animism och harmonism. Älvfolk kan aldrig bli odöda.

**Klimat & väder (G82-87), det som rör strid.** Avståndsvapen mot mål längre bort än 1/4 av räckvidden: CL × 3/4 vid blåst, × 1/4 vid storm eller värre. Under -5 °C med bristfällig utrustning: SMI-färdigheter -2. Under -15 °C (eller under -5 °C med blåst): SMI-färdigheter halveras, nakna fingrar -2 per -5 °C. Blåst eller kraftig nederbörd: CL för att dölja sig (Smyga, Kamouflage, Jaga, Skugga) dubbleras, Lyssna och Upptäcka fara halveras. Värmeslag: 10 % per 5 grader över +25 °C i tung rustning; INT och PSY till 1/4. Kulblixt: 1T10 KP på alla i kontakt med metallen. Hagel: medeldiameter (1T10 cm) - 7 skada per stridsfas utan skydd. Ondväder: ingen läkning, moralslag -3.

**Utrustning (G88-92).** Teknologinivåer 1-7 (stenålder till renässans) viser hvilke våpen som finnes. Fem hesteraser med verdier (G91). Lådor av trä med KP: Äsk 2, Skrin 4, Låda 6, Liten kista 30, Kista 50, Stor kista 100 (järnbeslagna: pris ×2, KP ×1,5, vikt ×1,25). Broddar +2 på SMI vid halkkontrollslag. Pannlampa: ett vaxljus räcker 20 minuter.

## 13. Anbefalinger

Hva fra Expert og Gigant som gjør mest for en sanntids-roguelite på DoD 4.0, og hva som bør hoppes over. 1 SR (5 sekunder) passer grovt til ett angrep eller én handling i sanntid; "sist i SR" kan bli en tregere animasjon.

**Ta med:**

1. **Quack-fu som Svart Nebbs kampstil (G35-37).** Én ferdighet, ett FV for alle komponenter, kostnad 3. Krosslag (1T6) blir lett angrep, Lågt kast blir knockdown uten skade, Obeväpnad parering blir blokk som trekker 1T6 fra skaden, Fallteknik og Uppresning er passive (halv fallskade, reise seg straks). Andre komponenter fra listen (Rundspark, Hoppspark, Initiativbonus, Missilduckning, Bedövningsslag) kan låses opp med EP etter kostnadene sine. Det gir et naturlig ferdighetstre som er forankret i boka og i Ereb Altor.
2. **Hjälteförmågor som perk-butikk mellom runs (E64-65, G8).** HP fra FV 21-milepæler og bossdrap (E64), og en fast meny med pris. Best for action: Järnnäve, Kattfot, Snabbslående, Snabbfot, Fint, Hjältesprång, Projektilparering, Stålblick, Giftskydd, Avväpning, Sköldkrossare, Skarpögd. "Feig handling koster HP" kan bli en straff for å flykte fra en boss.
3. **Särskild og perfekt träff (E51) og fummeltabellene (E60-61).** Kritisk treff = maks skade + maks SB, perfekt ignorerer rustning. Fummel blir korte stagger-tilstander: snubler (1 SR på bakken), mister våpenet 1T3 ruter unna, neste fiendeangrep treffer automatisk. Gir mye "juice" for lite kode.
4. **Stridsmoral og bärsärk for fiende-AI (E61-62).** Grunnmoral per rase, gruppemodifikasjoner (leder død -5, halve gruppen ute -5, mer enn halve KP borte -4) og utfall (flykte, overgi seg, gå bärsärk). Fiender som flykter eller overgir seg når lederen faller, er billig dybde. En bärsärk får to angrep per SR og parerer aldri. Anka har bärsärk 3; frivillig bärsärk (stå stille én SR, dobbel verdi) kan bli en spesialhandling.
5. **Tabell för skadeeffekter (G37).** Straff ved 3, 2 og 1 Totala KP. Bruk den fullt på fiender (sårede fiender blir trege og slutter å slåss), og i mildere form på spilleren, så lav helse kjennes uten at spillet låser seg.
6. **Kraftsamling som korte buffs (G11-12).** Én SR oppladning, 1T6 SR varighet: styrka (+1T4 STY), hastighet (+1T4 SMI, +2 förflyttning), språng (+25/50/80 % hopp). Passer en munkeinspirert and og har en innebygd motvekt (virker ikke under magi).
7. **Tyverier i Fristaden som minispill (E32-33).** Låsdyrkning: summer positive differensnummer hver SR til låsets SG, med fummeltabell (låset kärvar, -2 eller -5; dyrken går sönder). Stjäla föremål: CL-tabellen per gjenstand og vitneregel. Smyga og Lyssna: SMI-grupp ruter per SR, metallrustning halverer, avstandstabellen for hørsel gir et ferdig støysystem.
8. **Gjenstandskvalitet og materialer (E20-21, E58-60).** Hantverk-nivåene (Lärling til Erkänd mästare) og materialene (brons, mithril, silver, jade, sjöorm, drakskinn) er et ferdig affiks-system med tall for skade, BV og abs. Silver og jade gir mening mot bestemte fiender.
9. **Pilvarianter og nye våpen (G31-33).** Pansarbrytande, Magrensare, Visslare og Brandpil som ammunisjonstyper for fiendtlige bueskyttere eller spilleren. Parervåpen (Jitte avvæpner på perfekt parering) og kjettingvåpen (halvert parering mot dem) gir variasjon i fiendetyper.
10. **Avståndsvapen-reglene (E55-56).** Bevegelsesmodifikasjoner (går ×3/4, springer ×1/2, flyger ×1/4), bom som fortsetter og kan treffe andre (1 % per STO), skjold som fanger piler (1-6 / 1-4 / 1-2 på 1T20). Lett å oversette til sanntid.
11. **Droger og urter som forbruksvarer (G52-57).** Kungsliljeextrakt (helbreder, men gir bevisstløshet etterpå: interessant risiko), Donuros (stopper blødning), Mhiboulan (mørkesyn i kloakken, men lys blender), Gablonell (halv brannskade), Denior (+4 moral, -2 INT og PSY), motgiftene Edinor, Kondino og Bactar, og giftene Tyrilextrakt (søvn gjennom sår), Mibolium og Quackanrachia. Prisliste og sjanse for å finne dem til salgs er ferdig.
12. **Förflyttningstabell (G9).** Fart fra STO+FYS+SMI og Anka -1 gir individuelle hastigheter uten egen regel.
13. **Erfaring og trening som meta-progresjon (E44-46).** "Første vellykkede bruk etter søvn gir 1 EP, perfekt 1T3+1" passer per run. EP veksles inn i hvile i byen. Lærer koster 150 sm per uke og krever FV 15, noe som gir pengene en funksjon mellom runs.

**Hopp over:**

- Fullt treffområdesystem med rustning per kroppsdel og amputasjoner (E48-53): tungt å vise og balansere i sanntid. DoD 4.0 har allerede detaljerad strid; behold høyst "bein under halv KP halverer fart" og "hode til 0 = bevisstløs".
- Infeksjon, kallbrand, sult, vann og vær dag for dag (E51, E72, G82-87): for tregt for en roguelite.
- Fältslag, borger, krigsmagi, golem, länskonstruksjon, skatter, lønninger og samfunnsklasser: ingen kobling til kampene. Unntak: KP og abs for dører og vegger (G62-63) hvis spillet får knusbare dører.
- Livsmål med ångest (E12-14): fint for rollespill ved bordet, men vanskelig å gjøre rettferdig i et actionspill.
- Ferdighetene uten handling i spillet (Astrologi, Heraldik, Räkning, Schack, Teologi, Spå i kort, Kastmaskin og lignende).

