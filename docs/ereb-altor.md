# Ereb Altor og veien videre

Gjennomgang og første utvidelse 20. oktober 2026, ChatGPT. Tom ba om videre utvikling, hele verden i Ultima-stil og bruk av [Drakar-biblioteket](https://kingafw.no/Drakar/index.html) til regler, scenarioer og verden.

Spillet har allerede mye av grunnlaget: sanntidskamp med DoD91, en by med døgnrytme og nøkkelordsamtaler, et helt bokeventyr i Edelfara, lagring og et reisekart med møter. Det som manglet for en større verden, var forbindelse mellom regioner. Det som fortsatt mangler for en lang Ultima-kampanje, er mer særpreget innhold og varige følger av spillerens handlinger.

## Det som er lagt inn i 0.8

Verdensatlaset åpnes fra regionkartet med «Ereb Altor og sjøreiser». Det har 31 regioner, 117 steder inkludert de gamle i Aidne, 30 sjøruter og 28 landeveier. Alle regionene har en vei ut og hjem. Velg et land, finn avgangsstedet på regionkartet, reis dit og gå om bord eller følg grenseveien. Du kan kjøpe passasje eller arbeide deg over med Sjökunnighet. Pris og tid vises før avreise.

Det er tre lag:

| Lag | Hva du gjør | Hva det inneholder nå |
| --- | --- | --- |
| Verdensatlas | Velger land og planlegger etapper | Ereb, Kopparhavet og forbindelser til nabokontinentene |
| Regionkart | Går langs veier, utforsker og møter folk | Ett 50 x 30-kart per region, egen utforsking og tåke |
| Lokalområde i 3D | Snakker, handler, utforsker og kjemper | Fristaden og Edelfara som før, nye havner og leirer fra områdemaler |

![Verdensatlaset med valgt overfart til Caddo](ereb-altor/atlas.png)

![Samtale med en vakt i Arno, foreløpig bygget fra områdemalen](ereb-altor/arno.png)

[Atlaset på smal mobilskjerm](ereb-altor/mobil.png). Bildene er fra det ferdige HTML-bygget i Chromium med lav grafikk.

Aidne beholder kartet og stedene som allerede var i 0.7. Nye regioner er Trakorien, Marjura, Mereld, Bzegusta, Magilre, Klomellien, Kasenu, Goiana, Jorpagna, Ljusna, Mirel, Ransard, Jorduashur, Palinor, Nargur, Barbia, Cereval, Torshem, Landori, Berendien, Felicien, Hynsolge, Grynnerbergen, Nidland, Krun, Caddo, Erebos, Samkarna, Soluna og Akrogal.

De nye havnebyene omfatter Arno, Gringul, Tricilve, Mercana, Staden O, Kapahlt, Halle, Mastika Agga, Cerevallis, Jorgund, Fervidun, Tyros, Khaanikel, Stabul og Melukha. Kiorsham og Krilloan ligger på Samkarnas kart, med transport over land mellom dem. Andre regioner har egne reisendeleirer, laget for spillet. Disse er merket `original: true` i dataene og presenteres ikke som bynavn fra bøkene.

Folk på nye steder forteller om landet og forbindelsene videre. På Caddo advarer de om forbudet mot magi. Varme regioner får noe annen bebyggelse. Dette er korte egne tekster og malområder; havnebyenes fulle gatenett, samfunn og scenarioer er ikke bygget ennå.

Utforsking og besøk huskes mellom reisene. Autolagringen etter ankomst gjenoppretter riktig region og bakgrunnsområde. En gammel 0.7-lagring uten regionfelt fortsetter i Aidne uten å miste tåke, kjente steder eller ryddede steder. En annen rettelse sperrer slipp av gjenstander fra reisekartet, der de tidligere kunne forsvinne i området bak skjermen. Den skjulte 3D-bakgrunnen tegnes høyst åtte ganger i sekundet mens et reisekart er oppe.

## Kilder og spilltilpasninger

Reglene er fortsatt DoD 4.0 fra 1991, med Expert og Gigant. Kontrakten står i [IMPLEMENTERING.md](regler/IMPLEMENTERING.md). De gamle 2023-instruksene i AGENTS.md er rettet så neste utvikler følger det som faktisk brukes.

Verdensgeografien bygger på Ereb Altor-boksen fra 1989. Aidne bruker fortsatt den nyere geografien Tom valgte 8. oktober. Dette er et bevisst møte mellom utgaver; Kardunien og dagens Ereno flyttes ikke tilbake til eldre plasseringer. Atlasets kystlinjer er tegnet for spillet, og regionkartene er egne terrengoppsett. De er navigasjonshjelp, ikke nøyaktige avtegninger av bokkartene. Ingen kartbilder eller hele boktekster er bygget inn.

Sidelenkene under viser PDF-sider i biblioteket, som kan avvike fra sidetallet trykt på arket.

| Kilde | Brukt til |
| --- | --- |
| [Kampanjboken, PDF 10-14](https://kingafw.no/Drakar/boker/3e37a844129d/les-hele-boka.html#pdf-10) | «Bortom Ereb»: Samkarna, Soluna, Akrogal og Demontungan |
| [Kampanjboken, PDF 40](https://kingafw.no/Drakar/boker/3e37a844129d/les-hele-boka.html#pdf-40) | Havner, handelsveier og hindringen ved Raas Narram |
| [Kampanjboken, PDF 41](https://kingafw.no/Drakar/boker/3e37a844129d/les-hele-boka.html#pdf-41) | Reisetabell med seildager mellom havnene |
| [Kampanjboken, PDF 61](https://kingafw.no/Drakar/boker/3e37a844129d/les-hele-boka.html#pdf-61) og [verdenskartet](https://kingafw.no/Drakar/boker/ae66767c8db9/les-hele-boka.html) | Landnavn og relative plasseringer |
| [Spelarboken, PDF 5](https://kingafw.no/Drakar/boker/a3c541529260/les-hele-boka.html#pdf-5) og [PDF 11](https://kingafw.no/Drakar/boker/a3c541529260/les-hele-boka.html#pdf-11) | Caddo og Erebos |
| [Krilloan I](https://kingafw.no/Drakar/boker/35697e393a6b/les-hele-boka.html), «Geografi: Kiorsham» | Krilloan ved Ormsjön og omlasting via Kiorsham på Kopparhavssiden |
| [Spelledarboken](https://kingafw.no/Drakar/boker/5d1c66369cd1/les-hele-boka.html), [Trakorien](https://kingafw.no/Drakar/boker/3605eb62c335/les-hele-boka.html) og [Kopparhavets Kapare](https://kingafw.no/Drakar/boker/f58270b411fc/les-hele-boka.html) | Videre kildestoff for regioner og fremtidig innhold |

25 sjøruter har dager fra reisetabellen som `bookDays`. For å passe den sammenpressede målestokken brukes én bokdag som én spilltime. Fristaden til Arno tar derfor 10 spilltimer, mens Arno til Gringul tar 4. Dette er en spilltilpasning, ikke påstand om at bokas overfart tar ti timer. Billettprisen, muligheten til å ta hyre, tidsøkningen ved hyre, de fem ekstra sjørutene og alle landeveisetappene er egne tilpasninger, merket `uv: true`. Mat er inkludert på skip og behandles gjennom hele turen; én porsjon skal ikke mette en hel ukes reise. Til lands brukes vanlig proviant og sult.

Mastika Agga ligger i Barbia og tar imot varer fra Nargur. Stabul ligger nedenfor fossene som sperrer vanlig seilas inn til Golwyndas sötvattenshav. Krilloan har ikke fått en oppdiktet ordinær skipsrute gjennom Vägen bort. Disse skillene er viktige når mer innhold legges til.

Samkarna, Soluna og Akrogal har foreløpig ett regionkart hver. Underregioner og øyriker som Orghin, Irendor og Drakarnas arkipelag trenger mer kildearbeid og egne kart. 0.8 er dermed et sammenhengende reisefundament over hovedområdene, ikke en ferdig, detaljert simulering av hele Altor.

## Hva som bør utvikles videre

### 1. La verden huske valgene dine

En stor Ultima-kampanje trenger en varig kampanjetilstand ved siden av kloakkløpet. Geografi, kjente personer, utførte oppdrag, fraksjonsrykte, forbrytelser og endrede steder skal kunne bestå når et nytt kloakkløp starter. Dagens `G.run` lagrer reisen og scenariotilstanden, men «nytt løp» er ikke en egen vedvarende kampanjemodus. Start med å definere hva som skjer ved nederlag, hjemreise og nytt løp, og legg til versjonering og migrering før mer historie bindes til dette.

Første avgrensede leveranse: stjel hos en handelsmann i Arno, reis til Tricilve og tilbake, lagre og last, og møt samme reaksjon. Et lokalt lovbrudd skal ikke automatisk gjøre hele Ereb fiendtlig. Caddos magiforbud bør få en faktisk reaksjon fra vitner og vakter før det omtales som en implementert lovmekanikk.

### 2. Gjør to havnebyer til steder du husker

Bygg Arno og Gringul med egne små bydeler, havn, vertshus, tempel og lagerhus. Gi hver by seks til ti navngitte personer med døgnrytme, forhold til hverandre og ulike opplysninger. Én person kan lyve, men en annen kilde må kunne bekrefte eller avkrefte det. Dører, gjenstander og samtaler må støtte etterforskningen.

Ferdig når du kan komme til byen uten oppdragsmarkør, forstå et problem gjennom samtaler, løse det på flere måter og se resultatet etter hjemkomst. Dagens malbyer gjør verden tilgjengelig; denne leveransen gir en grunn til å reise dit.

### 3. Bygg ett nytt bokeventyr gjennom hele kjeden

Jeg anbefaler **Edsbrytarna i Erebos** først. Det passer tyven og handelshavnene, og gir bruk for samtaler, ledetråder og sjøfart. Legg først inn et lite felles oppdragsformat: startvilkår, ledetråder, nøkkelord, gjenstander, valg, frister og avslutninger. Behold Edelfaras fungerende kode til formatet har bevist at det dekker begge scenarioene.

| Scenario eller supplement | Status i spillet | Naturlig neste bruk |
| --- | --- | --- |
| Triangeldrama i Edelfara, Ivanhoe | Spillbart fra 0.6 | Spilltest frist, bevisføring og sluttvalg |
| [Edsbrytarna i Erebos, PDF 24](https://kingafw.no/Drakar/boker/b2dbaa795638/les-hele-boka.html#pdf-24) | Kilde funnet, ingen oppdragskjede implementert | Handelsmannens omdømme, etterforskning og havn |
| [Enhörningen och Drakormen, PDF 2](https://kingafw.no/Drakar/boker/b2dbaa795638/les-hele-boka.html#pdf-2) | Kilde funnet, ingen oppdragskjede implementert | Hynsolge, Gråborg og motstridende interesser |
| Trakorien | Reisemål og korte regiontekster | Handelshus, religion og øyenes konflikter |
| Krilloan | To grunnområder og riktig adkomst | Egen storby med distrikter og eventyr |
| Kopparhavets Kapare | Ingen skipskamp implementert | Skipstyper, besetning, pirater og sjøhendelser |

Bokas gruppestørrelser og utfordringer må tilpasses én rollperson. Behold navn, motiv og dilemmaer, men kontroller alle kampdata mot DoD91 og gi veier utenom kamp. Ikke merk et scenario som ferdig bare fordi reisemålet finnes.

### 4. La reisen gi valg

Legg til et lite sett sjøhendelser med flere løsninger: storm med Sjökunnighet, syk sjømann med läkekonst, kontroll av last med sosial ferdighet, og havari med valg om å hjelpe. Deretter hester og Rida, vær som påvirker fart og proviant, og flere havner i Aidne. Nåværende hyre er bevisst enkel og sikrer at en blakk spiller kan komme hjem. Ikke fjern den uten en annen fungerende vei tilbake.

Det skal være mulig å velge en rask, dyr tur eller en billig tur med en annen risiko. Bruk regelnotatene i [regler/](regler/) når reise og sjøfart utvides. Vis tid, mat og pris før beslutningen.

### 5. Bedre kampoversikt, grafikk og lyd

Prioriter først trær som slipper spilleren til syne, tydelige fiendeanfall og roligere kamp når mange angriper samtidig. Følgesvenner kan komme etter at varig tilstand og oppdragsformat finnes; ellers øker de både kamp- og lagringsproblemene. De manglende reglene om gift, sykdom og flere besvärjelser bør legges inn når et konkret scenario trenger dem.

Gi nye regioner egen form: nordlige langhus og gran, Caddos murverk, Trakoriens havnebyer og Samkarnas våtmark. Ulike navn over samme bymal er utilstrekkelig som sluttresultat. På lydsiden gir underlagssteg, dører, havn, vind og lokale musikkmotiver mye tilstedeværelse. Konkrete gjenbrukskilder og lisensvurderinger finnes allerede i [gjenbruk.md](gjenbruk.md).

Behold WebGL 2 og three r170 mens dette bygges. De viktige gevinstene nå kommer fra innhold, lesbarhet, riktig lys og ytelse på svakere maskiner. Et bytte av grafikkmotor vil også kreve arbeid med shaderne og den selvstendige HTML-fila.

## Teknisk overlevering

- `atlasdata.js` er land, korte sammendrag, kildepekerne og scenariokatalogen. Katalogen lover ikke nye spillbare scenarioer.
- `regionalmaps.js` gir globale sted-ID-er, uendrede Aidne-data, nye terrengoppsett og toveis forbindelser. Regionenes navn og plassering er kildeført; lokale veier og pass er laget for navigasjon i spillet.
- `worldtravel.js` bruker aktivt regionkart. `G.run.world.region` velger kart, og `maps[id]` lagrer utforsking. `known`, `done` og `cleared` bruker globale sted-ID-er. Oppslag for vei og sted må oppdateres ved regionbytte.
- `atlastravel.js` sjekker avgangssted, pris og spilltilstand før avreise, behandler klokke og mat, og beholder de siste 80 reisene. Atlaset håndterer ikke sjøkamper.
- `atlasview.js` viser første etappe mot et fjernt mål. Du må selv gå til avgangen; valg av et land teleporterer ikke spilleren. Flere avganger til samme region kan velges separat, blant annet Melukha og Kiorsham.
- `areatemplates.js` gir de nye stedene tjenestene fra landsbymalene og egne regionale samtaler. Nye bygg-ID-er inneholder region og sted for å unngå kollisjon i taktilstanden.

## Kontroller

`node --test tools/test/atlas.test.mjs tools/test/combatfx.test.mjs` kontrollerer blant annet hele forbindelsesnettet, at alle 117 steder kan nås til fots på sitt kart, gammel lagring, separat utforsking etter JSON-lagring, billett og klokke, avreisekrav, gratis hyre med mat gjennom en lang tur, gjenstander og Krilloans adkomst.

`tools/test/atlas-browser.mjs` kjører mot den ferdige HTML-fila fra Pages-undermappa med Playwright. Den prøver reise fra Fristaden til Arno, vern mot dobbeltkjøp, samtaler i Arno, Trakorien, last av en eldre Arno-lagring, gratis hjemreise, en fysisk grenseovergang, inventarvernet og mobilvisning. Konsollfeil gjør testen rød. Egen atlasjobb i PR-kontrollen lagrer skjermbilder og resultatfil som `verdensatlas-test`.

Den eksisterende stresstesten `stress('tjuv', 20)` gjennom fem nivåer er også kjørt uten konsollfeil. Bygget beholder de 50 innebygde bildene på 3 856 040 byte og trenger ingen nye eksterne ressurser. Automatisk mobiltest er ikke en spilltest på fysisk telefon. Reisefrekvens, sult og nye regioners vanskelighetsgrad trenger fortsatt vanlig spilltesting.

Lokalt 20. oktober: alle 14 regresjonstester, bygg og alle seks atlasflyter bestod. [Nettleserresultatet](ereb-altor/resultat.json) har ingen konsollfeil. Bilder og automatisk test bruker headless Chromium med programvaretegning; det er ingen måling av ytelse på en spillmaskin.
