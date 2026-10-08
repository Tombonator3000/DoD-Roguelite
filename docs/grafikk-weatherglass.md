# Grafikken i Weatherglass, og hva vi kan ta med oss

Kilde: artifacten «Weatherglass (Copy)», https://claude.ai/artifact/J3rGE5ojPcpA94249ugroP, lest 8. oktober 2026. Det er et lite, levende landskap i et glassmonter. Du kan dra skyer, presse ut regn, blåse vind, flytte sola og bytte årstid. Den er laget med three.js r186 og bygget med Vite til én fil på 1,4 MB. Det finnes ingen bildefiler i den: alt er prosedyrisk.

Tom spurte hvorfor den ser bedre ut enn spillet vårt, og hva vi kan bruke. Her er svaret, med tallene fra koden.

## Hvorfor den ser bedre ut

Den viktigste grunnen er at hele bildebudsjettet går til én scene på 12 x 8 meter som aldri byttes ut. Hver flate er laget for akkurat den scenen. Spillet vårt tegner områder på 92 x 92 meter med folk, fiender, kamp og brukerflate, og det skal også kunne kjøres på mobil og som artifact. Likevel er det mye vi kan ta etter. Grunnene er sortert etter hvor mye de betyr for bildet.

1. **Lyset er HDR og følger tiden på døgnet.**
   - Sola er et retningslys med styrke opptil 4,6.
   - Fyllyset er et halvkulelys på 1,15. Himmelfargen ligger øverst. Nederst ligger en varm refleks fra bakken, (0,30, 0,25, 0,17), som blir sterkere jo høyere sola står.
   - Sollys mot fyll blir omtrent 6 til 1 på flat mark.
   - Eksponeringen går mykt mellom 1 og 1,65, så natta blir lettere i stedet for svart.
   - Miljøkartet er laget med PMREM fra et mørkt fotostudio med fire lysbokser. Det står på bare 0,17, så det gir myke glansflater uten å flate ut lyset.
   - Hos oss følger et spotlys spilleren (110, kjegle 0,62). Halvkulelyset er 0x6f8f88 over 0x0b0806 på 0,55, og den nederste fargen er nesten svart. Vi har ikke noe miljøkart. Materialene får dermed ingen refleksjoner fra omgivelsene og ser matte og plastaktige ut.
2. **De har kantutjevning, og det har ikke vi.** De tegner scenen til en HalfFloat-target med `samples: 4` før etterbehandlingen. Vi har `antialias: true` på rendereren. EffectComposer i r170 tegner likevel til sin egen target uten MSAA (`new WebGLRenderTarget(..., { type: HalfFloatType })`). I praksis har vi derfor ingen kantutjevning, og alle kanter hakker.
3. **Bare de sterkeste glimtene gløder.**
   - Bloom-terskelen deres er 1,45 om dagen og 1,0 om natta, og styrken er rundt 0,3. Bare HDR-glimt gløder: sol i vann, lyn og lamper.
   - Vår terskel er 0,78 med styrke 0,65. Vanlige lyse flater gløder også, og bildet blir grøtete.
4. **Vegetasjonen.** Ute er det denne som skiller mest.
   - Trærne er bygget med greiner av bark og kort med bladtekstur.
   - Lyset skinner gjennom bladene: `pow(bak, 3) + wrap * 0.22`.
   - Normalene peker ut fra en ellipsoide rundt kronen, og hvert bladkort får AO etter hvor i kronen det sitter (0,22 til 1).
   - Gresset er 20 000 til 120 000 instanserte strå, 45 prosent av dem i tuster. Stråene bøyer seg i vinden og lyser opp når et vindkast går over.
   - Våre trær er ikosaedre og kjegler med `flatShading` og én farge (`area.js` linje 328, `town.js` MAT.leaf). Se docs/grafikk-weatherglass/var-ekeskogen.jpg (høy kvalitet, Ekeskogen klokka elleve).
5. **Flatene tegnes i shaderen.**
   - Bakken blandes i lag etter høyde, helning, fuktighet og årstid: eng, jord, strand med småstein, berg med lav, elvebunn med lysmønster, sølepytter med regnringer og snø.
   - Ujevnheten lages med deriverte (bump fra `dFdx`/`dFdy`). Detaljer som blir mindre enn en piksel, tones ut med `fwidth`.
   - Ingenting gjentar seg. Hos oss har bakken én tekstur per flis på 2 meter, og rutemønsteret synes, særlig på jord og fjell.
6. **Skyggene.**
   - Ett retningslys har et tett skyggekamera rundt monteret. Kameraet snappes til hele texler, så skyggene ikke flimrer.
   - Radiusen er fast i meter: `0.075 / texel`.
   - En billig PCSS gjør skyggen skarp der ting står på bakken og myk lenger unna.
   - Skyene kaster skygger på alle materialer gjennom en krok i `lights_fragment_begin`.
7. **Ting står på bakken.** De bruker ikke SSAO. I stedet blir det mørkere ved roten av gresset (indirekte lys ganger 0,14 til 0,4), steinene får et skittent bånd der de møter jorda, og det er kontakt-AO under monteret.
8. **Luft og dybde.**
   - Et volum med lav dis er tykt bak fokuspunktet og tynt foran. Det gir lyssøyler fra skyggekartet.
   - Skyene er volumetriske.
   - Smal FOV (34), tilt-shift, vignett 0,32, varmt løft i skyggene og korn 0,035 gir modellpreget.
9. **Fargene.**
   - Albedo er lav i lineært rom: gress rundt (0,21, 0,38, 0,13), stein 0,13 til 0,3.
   - Hovedlyset er varmt og fyllet kaldt.
   - Himmelfargene holdes på moderat lysstyrke, «så ACES beholder fargen».
10. **Det er liv overalt.** En liten væskesimulering av vinden (48 x 32) styrer gress, trær med fjærer, blader og vannflaten. Kameraet går etter med eksponentiell demping.

## Hva vi kan bruke

### Raskt, en kveld, liten risiko

- **MSAA i komposeren.** Gi EffectComposer en `WebGLRenderTarget` med `type: HalfFloatType` og `samples: 4` på høy kvalitet, 2 på middels og 0 på lav. Det virker i r170 og er den største gevinsten for minst jobb.
- **Bloom.** Sett terskelen til 1,0 til 1,2 og styrken til 0,3 til 0,4. Ild, magi, runer og lykter får emissive over 1, så de gløder fortsatt.
- **Miljøkart.** Bruk `PMREMGenerator.fromScene` med `RoomEnvironment` (finnes i r170 addons) eller et lite mørkt rom vi lager selv. Sett `scene.environmentIntensity` til 0,15 til 0,3. Våt brostein, metall, rustning og vann får glans.
- **Halvkulelyset.** La himmelfargen komme fra `skyAt`, som allerede har fargene. Gjør bakkefargen til en varm refleks i stedet for nesten svart.
- **Eksponering etter tid på døgnet**, med en lettere natt.

### Middels, en til tre økter

- **Sola som retningslys ute.** Skyggekameraet følger spilleren og snappes til texler. Lykta blir spotlys om natta og i kloakken, som nå.
- **Bakkeshader med onBeforeCompile.** Bryt opp flisene med støy i verdensrom, la fuktigheten komme fra været (vi har allerede `updateWet` i wet.js), og gjør kantene mørkere mot vegger og vann.
- **Enkel AO.** Gjør det mørkere nederst på vegger, trær og steiner med vertexfarge eller en gradient i shaderen, og legg en mørk skive under props og folk.
- **Trærne uten flatShading.** Gi dem myke normaler som peker ut fra en ellipsoide, AO etter høyden i kronen og lys gjennom bladene. Det alene fjerner mye av plastpreget.
- **Skyskygger.** De finnes allerede i wet.js for materialene som har `addWetness`. Kroken i `lights_fragment_begin` gir dem til alle materialer. I r170 heter linjene `getSpotLightInfo( spotLight, geometryPosition, directLight );` og `getDirectionalLightInfo( directionalLight, directLight );`, sjekket i node_modules/three.

### Store, egne prosjekter

- Ekte trær med greiner og bladkort, og tusenvis av gresstrå i vinden. Dette trenger kvalitetsnivåer for mobil.
- Volumtåke og lyssøyler.
- Volumetriske skyer passer bare på tittelskjermen eller verdenskartet, ikke i kamp.
- Et vindfelt i en tekstur som alt leser fra.

### Det vi ikke trenger

Glassmonteret, messingrammen, bordet og studioet rundt hører til et leketøy, ikke et spill.

## Fallgruver

- **Versjon.** Vi står på r170 (se AGENTS.md). Skyggefilteret deres bruker API fra r186 (`sampler2DShadow` i `getShadow`, `vogelDiskSample`, `USE_REVERSED_DEPTH_BUFFER`). I r170 må PCSS lages etter eksemplet `webgl_shadowmap_pcss`. Resten av teknikkene virker i r170, men sjekk navnene på shader-chunkene før du patcher dem.
- **Ytelse.** De velger ett av tre kvalitetsnivåer fra navnet på skjermkortet og justerer DPR mens spillet går. Hvert 0,75 sekund måler de: under 50 fps ganger de med 0,9, under 35 fps med 0,8, og over 58 fps med 1,06. Vi bør ha det samme på plass før vi legger på mer.
- **Opphav.** Artifacten heter «(Copy)» og kan være laget av noen andre. Vi tar ideene og tallene og skriver koden selv. Ikke lim inn store biter av den.
