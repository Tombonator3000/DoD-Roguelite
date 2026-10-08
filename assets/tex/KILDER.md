# Kilder og lisens for bildesettet

Alle bildene her er laget for Svart Nebb av ChatGPT med OpenAI imagegen 2026-10-08, etter Toms bestilling D007. De er AI-genererte i malt stil, deretter klargjort i prosjektets egen bildepipeline. Ingen illustrasjoner, teksturer eller kart fra DoD, Ivanhoe eller andre spill er brukt som bildegrunnlag.

Bildene distribueres med prosjektets MIT-lisens, se [LICENSE](../../LICENSE). Kildeatlas, separate høydekart, genereringsbeskrivelser og målinger ligger i [raw/](raw/). Rådata bygges ikke inn i spillet.

Hvert navn i tabellen gjelder begge filene `<navn>_c.jpg` og `<navn>_n.png`. Normalkartene er avledet fra den egne høyderaden i samme atlas, med periodiske nabopiksler og OpenGL-konvensjon. De er ikke laget fra fargekartet.

| Filer | Kilde | Lisens |
| --- | --- | --- |
| gress, skogbunn, jord, brostein | raw/ground.jpg, rad 1 farge og rad 2 høyde | MIT |
| heller, planker, klippe, teltduk | raw/ground.jpg, rad 3 farge og rad 4 høyde | MIT |
| bindingsverk | Malt tre fra planker og puss/stein fra steinvegg, satt sammen etter timber() sine UV-felt | MIT |
| steinvegg, bymur, takstein | raw/buildings.jpg, rad 1 farge og rad 2 høyde | MIT |
| spon, halm, skifer, kobber | raw/buildings.jpg, rad 3 farge og rad 4 høyde | MIT |
| kloakk_gulv, dverg_gulv, rev_gulv | raw/dungeon.jpg, rad 1 farge og rad 2 høyde | MIT |
| kloakk_vegg, dverg_vegg, rev_vegg | raw/dungeon.jpg, rad 3 farge og rad 4 høyde | MIT |
| edelfara_kart_c.jpg | raw/map.jpg. Eget landskap komponert etter NODES, uten tekst eller veier | MIT |
| pergament_c.jpg | raw/parchment.jpg | MIT |
| fane_edelfara.png | raw/banners.png, første felt, svart ravn på sølv | MIT |
| fane_eke.png | raw/banners.png, andre felt, grønn eik på gull | MIT |
| fane_ridderskors.png | raw/banners.png, tredje felt, rødt kors på hvitt | MIT |
| fane_lekh.png | raw/banners.png, fjerde felt, rødt øye på svart | MIT |

Alle materialer er 512 x 512. Fanene er 256 x 512 med alfa. Kartet er 1600 x 1152 og brukes bare av canvas, uten mipmaps. Fargekart er JPEG med kvalitet 76 (kart 80), normalkart tapsfrie PNG med 24 normalretninger i en palett. Det demper ubetydelig finstøy og holder bildesettet under 4 MB. Fanene har en palett på 96 farger med alfa.

De 50 filene som bygges inn tar 3 856 040 byte. Rådata og denne dokumentasjonen regnes ikke inn i runtime-budsjettet.
