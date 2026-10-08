# Arbeidsbilder og genereringsbeskrivelser

Atlasene er originale AI-genererte bilder fra OpenAI imagegen, 2026-10-08. JPG-versjonene her er arbeidskopier med kvalitet 92. De ferdige materialene er pakket fra de opprinnelige PNG-bildene. De separate `<navn>_h.png`-filene lagrer den behandlede høyden. `manifest.json` viser navn, størrelse, snittfarge og runtime-budsjett.

Felles genereringsbeskrivelse: original nordisk middelalder, malt gouache, rolige flater og mellomstore former som leses fra et skrått kamera. Rett på materialet, uten perspektiv, tekst eller lysretning. Sømløse materialfelt, ingen marger mellom feltene. Fargekart i annenhver rad, med egne geometrisk samsvarende høydekart rett under. Høydekart: lyse opphøyde flater, mørke fordypninger, ingen fargekonvertering til grått.

## Bakke, ground.jpg

Fire kolonner og fire rader. Første fargerad: tørt gulgrønt gress med kløver, skogbunn med barnåler/løv/mose/røtter, kompakt jordvei med svake hjulspor og småstein, varm avrundet brostein. Andre fargerad: tre ganger tre kalksteinsheller, seks vannrette slitte eikeplanker, grå granitt med lav og sprekker, nesten hvit grov lerretsduk uten striper. Fargene ble bedt om som diffuse materialfarger, og lysstyrken er justert etter bestillingen.

## Hus, buildings.jpg

Fire kolonner og fire rader. Første fargerad: bindingsverk, lys steinvegg med åtte forskjøvne skift, grovere mosegrodd bymur med seks skift, rødbrun takstein. Andre fargerad: ti rader spon, fem halmbunter, ni rader gråblå skifer, irret grønt kobber med stående falser. Bindingsverkets genererte stolper traff ikke alle UV-kravene; sluttbildet setter malte tre-, puss- og steinmaterialer inn i det presise oppsettet fra timber(), med smale tilpassede kanter.

## Undergrunnen, dungeon.jpg

Tre kolonner og fire rader. Første fargerad: kjølig mosegrodd kloakkgulv, varme støvete dvergheller og røde heller i Revehiet. Andre fargerad: brun tegl med slim, hugget dvergstein og rødbrun tegl. Store former, begrensede sprekker og fuger. Høyderadene følger materialgeometrien.

## Kart, map.jpg

Eget landskap i penn og akvarell på lyst pergament, uten ord, veier, markør, kompass eller stedsprikker. Fristaden øverst til venstre, Glimming mot nordøst, sjø og Sortmund rundt (71,47) og (74,52), Ekeskogen rundt (40,56), Akershus rundt (30,80), små borger like ved Akershus og Sortmund. Skogbeltet går fra sørvest mot midten; elva går fra vest gjennom Eke og opp til sjøen. Området ved den skjulte leiren er vanlig skog uten leirsymbol. Pharynx er et rolig felt mot øvre høyre hjørne. Stedene følger prosentkoordinatene i edelmap.js, ikke et kopiert bokkart.

## Faner, banners.png

Fire loddrette, flate, revne stofffaner på transparent bakgrunn. Fra venstre: svart ravn med spredte vinger på sølv, grønn eik på gull, rødt kors på hvitt, rødt øye på svart. Enkle silhuetter, dempet stoff, ingen tekst, stenger eller bakgrunnsskygger. Ikke historiske skjold fra boka.

## Pergament, parchment.jpg

Lys, sømløs kremfarget pergamentflate med svake fibre og myke aldringsspor. Ingen mørke kanter, tekst, folder eller ramme. Laget for mørk tekst i samtalene og journalen.

## Klargjøring

`python tools/prepare_textures.py <kildemappe>` tar ground, buildings, dungeon, map, banners og parchment som PNG eller JPG. Uten argument bruker den arbeidskopiene her. Krever Pillow og numpy kun ved klargjøring, ikke ved bygg eller spill. JPEG-arbeidskopiene gir små forskjeller fra den første pakkingen fra PNG.

Pipeline: utsnitt, 512 x 512, periodisk kantkorreksjon, snittlysstyrke, separat myket høyde, sentraldifferanser med grønnt opp langs UV-v, palettpakking av normalene, komprimering. Kartet beholder forholdet 0,72. Alfaen i fanene beholdes. build.mjs leser bare ferdige bildefiler rett under assets/tex, aldri denne mappa.
