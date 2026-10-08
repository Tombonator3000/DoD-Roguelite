# Regler: DoD91 (Drakar och Demoner 4.0) med Expert og Gigant

Fra versjon 0.5 bygger spillet på de gamle reglene: Drakar och Demoner 4.0 (1991, ofte kalt DoD91), med Expert (1987) og Gigant der DoD91 ikke dekker noe. 2023-reglene er fjernet.

Filene her er regelspesifikasjoner hentet ut fra transkriberte bøker i biblioteket på https://kingafw.no/Drakar/index.html. De beskriver mekanikken med tall og tabeller, med sidetall, slik at koden kan sjekkes mot dem:

- `bok1.md`: Bok I, Rollpersonen. Raser, yrker, grundegenskaper, KP og träffområden, skadebonus, förflyttning, särskilda förmågor, färdigheter, CL, perfekt og fummel, erfarenhet, hjältedåd.
- `bok2.md`: Bok II, Spelledarboken. Strid, träfftabell, skador per kroppsdel, läkning, moral, vapen- og rustningstabeller, varelser.
- `magi.md`: Bok III, Spelarboken. Magi, besvärjelser, snedtändning, skräck og fobier. Pluss Expert Magi i kortform og utrustningslister.
- `expert_gigant.md`: det Expert og Gigant legger til: fummeltabeller, stridsmoral, hjälteförmågor, stridskonster (også quack-fu fra Ereb-Altor), skador ved lav KP.
- `IMPLEMENTERING.md`: hvordan reglene er oversatt til sanntid i spillet, og hva som er spillets egne tilpasninger (merket uv i koden).

Når noe i koden er tilpasset sanntid eller ikke står i bøkene, er det merket `uv: true` eller med en kommentar "spillets tolkning".
