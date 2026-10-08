# Kampeffekter for Svart Nebb

ChatGPTs grafikkbidrag ligger i `src/combatfx.js` og `src/combatfx-pool.js`. Det er koblet inn ved at `main.js` importerer `CombatFX as FX`. Ingen regelverdier, bykart, modeller eller generatorer er endret.

## Hva som er gjort

- Våpenhugg har en skarp forkant og et smalere spor bak våpenet. Huggretning, rekkevidde og høyde følger de eksisterende kallene.
- Sjokkbølger, runesirkler for helbredelse og vilje, lengre gnister og fjær med egen silhuett. Bein og tre gir kantete småbiter.
- To instansierte lag med høyst 128 glødeffekter og 96 småbiter. De bruker to ekstra tegnekall når begge lagene er synlige. Geometri, materialer og postene i poolen gjenbrukes.
- Lav og middels grafikk reduserer antall gnister og småbiter. Fiendens angrepsvarsler ligger fortsatt i grunnlaget og deler ikke denne poolen.
- `clearLevel()` rydder nye effekter og gamle hugg og ringer med en gang, også mens spillet står i pause. Grunnpartiklenes tegneområder nullstilles.

## Samarbeid med Claude

`CombatFX` arver `FX`. Nye metoder som Claude legger til i `fx.js`, som `spark()`, følger automatisk med. `impact()`, `burst()`, `update()` og `clearLevel()` kaller grunnlaget først; `slash()` og `ring()` har egne instansierte bilder. Hold navn og argumenter på disse metodene stabile, eller oppdater underklassen samtidig. Ved endringer i grunnlagets samlinger for hugg og ringer må oppryddingen sjekkes.

Det er ingen nye eksterne ressurser eller teksturfiler. Shaderne følger bundlingen til den selvstendige HTML-fila. Lys, vær, vann, ild og fargegradering ligger fortsatt i Claudes arbeid.

## Kontroll

```sh
npm install
npm install --no-save playwright@1.62.1
npx playwright install chromium
npm run build
node --test tools/test/combatfx.test.mjs
node tools/test/combatfx-browser.mjs dist/combatfx-test
```

Nettlesertesten bruker lokalt three.js og ruter bort eksterne skrifter. Den kjører `stress('tjuv', 20)` gjennom alle fem nivåene, tegner de nye shaderne i WebGL og gjentar umiddelbar opprydding åtte ganger. Resultat, bilder av kloakken, kampeffektene og Fristaden ligger i utmappa. `CHROME` kan peke på en installert Chromium. `TEST_SOURCE=1` tester ES-modulene direkte; dette ble brukt på Windows der npm/esbuild ikke var tilgjengelig. GitHub Actions tester den ferdige HTML-fila.

Lokalt: fire regresjonstester bestått, fem nivåer uten spill- eller konsollfeil, åtte oppryddinger med null gjenstående effekter. Også testet etter at Claudes inventar og lagring kom inn (`26cddf7`). GitHub Actions på b1520fa besto også bygg av den selvstendige HTML-fila og de samme regresjons- og nettlesertestene. Skjermbilder og resultat.json finnes i artefakten `kampeffekter-test` på [testkjøringen](https://github.com/Tombonator3000/DoD-Roguelite/actions/runs/37739654038).

Dette er funksjons- og shaderkontroll med SwiftShader, ikke en FPS-måling på mobil.

## Neste grafikkpass

- Skille materiell ved treff: gnister på metall, fliser på tre og støv på stein. Det krever en eksplisitt trefftype fra kampkoden.
- Gi hver magiskole egne farger og former når DoD91-kallene er på plass.
- Ekte animasjon av Svart Nebb når modellen får rigg. Effektlaget bruker verdensposisjoner og kan senere få hånd- eller våpenposisjon fra skjelettet.
