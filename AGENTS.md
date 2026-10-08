# AGENTS.md

Instrukser for alle som jobber i dette repoet, mennesker og AI-agenter (Claude, ChatGPT/Codex og andre). Les hele fila før du gjør endringer.

## Hva prosjektet er

"Svart Nebb under Fristaden": en roguelite i nettleseren, laget med three.js. Kamera og kamp som Diablo og Hades, samtaler med nøkkelord som i Ultima IV/V. Regler fra Drakar och Demoner (Fria Ligan, 2023), verden fra Ereb Altor. Hovedpersonen er Svart Nebb, en and og tjuv fra Fristaden i Zorakin. Eier: Tom (Tombonator3000).

## Les dette først

1. `README.md`: hvordan spillet spilles og bygges, og hvordan koden er delt opp.
2. `memory.md`: tekniske beslutninger, regler slik de er implementert, ting som lett går galt. Viktigst av alt.
3. `todo.md`: hva som gjenstår, og hvem som jobber med hva.
4. De siste oppføringene i `log.md`: hva som er gjort, med tidspunkt.

## Faste regler for arbeidet

- **Logg alt i `log.md`.** Hver arbeidsøkt får en overskrift med dato og hva økta handler om (`## 2026-10-08, versjon 0.5: inventar og grafikk`). Hver ting du gjør, får en linje med klokkeslett i norsk tid (Europe/Oslo): `- 08:14 Hva du gjorde og hvorfor.` Skriv hvem du er hvis du ikke er Claude, for eksempel `- 09:30 (ChatGPT) ...`. Nye oppføringer legges nederst.
- **Hold `memory.md` oppdatert** med beslutninger, formater, koordinater, fallgruver og testnotater som neste person trenger. Ikke dagbok, det er det log.md er for.
- **Hold `todo.md` oppdatert.** Kryss av det som er gjort, legg til det du oppdager.
- **Skrivestil i tekst, kommentarer og spillet:** ingen emoji, ingen tankestrek (em dash, —), ingen typiske AI-floskler. Skriv som et menneske, kort og konkret.
- **Språk:** spilltekst og kommentarer på norsk (bokmål). Regeltermer står på svensk som i DoD-boka (färdigheter, tillstånd, hjälteförmågor, Drake, Demon, pressa slag). Verdier som ikke er sjekket mot boka, merkes `uv: true` i `src/dod.js`.

## Samarbeid mellom flere agenter

- Jobb på en egen gren: `claude/<tema>`, `chatgpt/<tema>` og så videre. Lag pull request mot `main`. Ikke push rett til `main` uten at Tom har sagt det.
- Før du begynner på noe stort: skriv navnet ditt bak oppgaven i `todo.md` under "Hvem jobber med hva", så to ikke skriver om den samme fila samtidig.
- Små, avgrensede commits med beskjed som sier hva og hvorfor.
- Ikke formater om eller flytt kode du ikke endrer. Store filer (`main.js`, `player.js`, `town.js`) får fort konflikter.
- `dist/` er bygget kode og ligger ikke i git. GitHub Actions bygger og publiserer spillet til GitHub Pages ved hver push til `main`.

## Teknikk

- **three.js r170** fra jsdelivr via importmap i `src/page.html`. Ikke oppgrader: fra r171 er three.module.js delt i flere filer, og importmapen må endres. Addons hentes fra `three/addons/...`.
- **Én selvstendig HTML-fil.** `npm run build` (esbuild) lager `dist/index.html` (vanlig side) og `dist/artifact.html` (uten doctype og head, for publisering som Claude-artifact). Modellen av Svart Nebb bygges inn som base64 fra `assets/`. Ingen fetch av eksterne filer i spillet, fordi artifact-sandkassen blokkerer det.
- **Moduler** ligger i `src/` (ES-moduler, to mellomrom innrykk, enkle anførselstegn). Delt tilstand ligger i `G` (`src/state.js`). `window.G` finnes for feilsøking.
- **Lagring** i `localStorage`, alltid inne i try/catch. Nøkler: `svartnebb.meta.v1`, `svartnebb.settings.v1`, `svartnebb.chars.v1`, `svartnebb.lastchar`, og fra 0.5 `svartnebb.saves.v1` (lagrede spill).
- **Rådata for modellen** ligger i `modell/` (GLB, OBJ og tekstur). `tools/pack_mesh.py` og `tools/decimate.py` lager `assets/duck.bin` fra dem.

## Bygg og test

```
npm install
npm run build          # minifisert
npm run build:dev      # uten minifisering
```

Åpne `dist/index.html` i nettleseren. Testriggen i `tools/test/` bruker Playwright med headless Chromium (SwiftShader) og sender three.js-forespørsler til lokal `node_modules/three`, så den virker uten nett:

```
THREE_DIR=node_modules/three NOANIM=1 LOWQ=1 INIT="$(cat tools/test/sim.js tools/test/town.js)" \
  node tools/test/shot.mjs file://$PWD/dist/index.html ut.png 4000 '[{"eval":"..."},{"shot":"a.png"}]'
```

`CHROME` kan peke på en egen Chromium. Se `memory.md` under "Testing" for hjelperne (`sim`, `stress`, `bot`, `goto`, `talk`, `dayTest`). Kjør minst en stresstest (`stress('tjuv', 20)`) og sjekk at konsollen er fri for feil før du lager pull request.
