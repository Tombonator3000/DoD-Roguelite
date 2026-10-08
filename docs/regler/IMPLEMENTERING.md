# Hvordan DoD91 er oversatt til sanntid

Denne fila er kontrakten mellom regelbøkene og koden. Alt som ikke står rett i bøkene, er merket "uv" her og i koden (`uv: true` eller kommentaren "spillets tolkning"). Sidetall og tabeller står i de andre filene i denne mappa.

## Tid og grunnslag

- 1 stridsrunda (SR) er 1,5 sekunder i spillet (uv). Alt som skjer "per SR" i boka, skjer hvert 1,5 sekund. Konstanten heter `SR` i `src/dod.js`.
- Färdighetsslag: 1T20 lik eller under CL. CL = FV + modifikasjoner. `clRoll(cl, fv)` i `src/rules.js` gir `{ r, r2, cl, fv, success, perfekt, fummel, diff }`. Omslaget for perfekt og fummel sammenlignes med FV, ikke CL (Bok I s. 37).
- Grundegenskapsslag og motstand: `resist(aktiv, passiv)`, mål = 10 + aktiv - passiv. Et "normalt SMI-slag" er `resist(SMI, 10)`, altså CL = SMI. Et "svårt PSY-slag" er `resist(PSY, 15)`.
- Spilleren slår alle slag selv, også de fiendene gjør mot ham. Terningene vises i kamploggen: `Dolk 7/14` (slag/CL), `Dolk 1>3 Perfekt`, `Dolk 20>17 Fummel`.

## Kroppen: träffområden

- Totala KP = (FYS + STO) / 2, avrundet opp. KP per kroppsdel etter Kroppspoängstabellen (`locKP`).
- Spilleren og humanoide fiender har detaljert strid: träfftabellen (1T20, egen kolonne for avstand) avgjør kroppsdel, rustningen på den kroppsdelen absorberer, skaden trekkes fra kroppsdelen og fra totala KP. Djur og monstre (rotter, demonen) har vanlig strid: bare totala KP (Bok II s. 15).
- Små dyr (rotter) biter lavt: träffområdet slås med 1T8 på närstridskolonnen (bein og mage). uv.
- Rustning: én del per kroppsdel teller, den beste. Utstyrsplassene er `hjalm`, `rustning` (harnesk, brynja eller hauberk), `armar`, `ben`, pluss `vapen`, `vapen2` og `amulett`.
- Kroppsdel på 0: blödning, 1 totala KP hvert 6. SR (9 s) til Första hjälpen eller HELA stopper den.
- Arm på 0: armen er ubrukelig. Våpenet i den hånda faller i bakken, skjoldet i den hånda kan ikke parere. Svårt PSY-slag for å slåss videre, ellers lammet av smerte i 1 SR. To armer trengs for Första hjälpen og for å trylle.
- Bein på 0: på kne. Farten blir en tredjedel, ingen dukking. Halve KP borte i et bein halverer farten.
- Bröstkorg eller mage på 0: faller og kan bare krype (en femdel av farten). Ingen angrep, ingen magi. Legedrikk og brød går (uv).
- Huvud på 0: medvetslös.
- Skade på dobbelt så mye som kroppsdelen tåler (kroppsdelens KP ned til minus maks): kritisk. Huvud: død. Bröstkorg og mage: medvetslös, og et svårt FYS-slag avgjør om du overlever. Arm og bein: slå 1T10 på tabellen for kritiske skader (`CRIT_LIMB`), varer resten av løpet.
- Hver tapt KP i en kroppsdel gir -2 på CL for det som trenger den: våpenarmen for anfall og parering (begge armer for tohåndsvåpen og buer), bena for Smyga, Hoppa, Akrobatik og dukking.
- Totala KP 2: halv CL på alt. Totala KP 1: ingen ferdigheter, bare krype. Totala KP 0: medvetslös. Totala KP minus FYS: død.

## Strid

- Anfall: hvert hugg som treffer noe, er ett anfallsslag mot våpenets FV (`weaponFV`, med vapengruppe-regelen). Kombinasjonen på tre hugg er spillets (uv). Uten våpen: knytnever 1T3 og spark 1T6 med Slagsmål. Har du en stridskonst, brukes den (Quack-fu: krosslag 1T6, lågt kast på tredje slag).
- Modifikasjoner: bakfra +7 (og ingen parering hvis målet ikke har sett deg), fra siden +3, mål som ligger +5, orørlig mål +10.
- STY-krav: STY lik eller over kravet gir én hånd. Under kravet, men minst halvparten: to hender, og det du har i den andre hånda kan ikke brukes. Under halvparten: for tungt.
- Perfekt anfall: maksimal skade og maksimal skadebonus, rustningen hjelper ikke, kan ikke pareres. Fummel: Expert sine fummeltabeller (1T20).
- Parering: hold høyre museknapp. Hvert parerende redskap (våpen eller skjold) kan parere én gang per SR. Projektiler kan ikke pareres. Kastvåpen bare med skjold. Ingen parering med bue i hånda. Resultatene følger tabellen i Bok II s. 17: lyckat mot lyckat stopper skaden, men er skaden større enn redskapets BV, mister det 1 BV, og ved BV 0 går resten av skaden gjennom. Perfekt parering: ingenting skjer.
- Dukking (mellomrom): DoD91 har ingen Undvika. Treffer et anfall mens du dukker, slår du et normalt SMI-slag. Lykkes det, bommer anfallet. Akrobatik B2 eller bedre gir +3 (uv). Ikke i metallrustning med Akrobatik-bonus.
- Fiender parerer også én gang per SR hvis de ser deg og har noe å parere med.
- Skadebonus (SB) fra STY + STO legges til i närstrid. Ikke på kast og skudd (uv: boka sier bare närstrid).
- Bärsärkagång: +1T6 skade, raskere hugg (ekstra anfall), ingen parering eller dukking. Slutter som i boka med ferdighetsslag.
- Lönnmördarens attack bakifrån: fra Smyga mot en humanoid som ikke har sett deg. Bom gir likevel vanlig skade, lyckat dobbel, perfekt fyrdobbel, uten skadebonus.

## Smyga

- Shift slår Smyga og gir et differensvärde. Fart halveres. Fiender som kunne sett deg, slår Upptäcka fara minus differensvärdet hvert SR. Lykkes de, ser de deg. Nytt Smyga-slag hvert 40. sekund (boka: hvert minutt, uv). Klirrende rustning halverer CL.

## Skräck

- Skräckslag: 1T20 - PSY + skräckslå + høyeste modifikasjon (Lärd man -5, Extremt orädd -5). Resultatet leses på Skräcktabellen (`SKRACK`). ORÄDD og hjälteförmågan Orädd slipper slaget. Rødpels sitt kongelige vrål har skräckslå 5 (uv), demonen 3.

## Magi

- Besvärjelser ligger i `P.spells` som `{ id: S }`. CL = S - 2 x (E - 1). E kan ikke være høyere enn FV i skolen. Hold R, G eller T for høyere E.
- Kostnad: lyckat E PSY, perfekt halvparten (minst 1), misslyckat 1, fummel E og Snedtändningstabellen (1T20 + E).
- PSY er grundegenskapen. PSY 0 er døden, så spillet lar deg ikke trylle hvis prisen tar deg til 0 (uv). Ikke i metallrustning eller metallhjelm. Skade mens du tryller bryter konsentrasjonen (1 PSY, ingen effekt).
- PSY kommer tilbake med 1 per 20 sekund utenfor kamp (uv; boka: 1 per time i hvile).

## Yrkesförmåga (F) og ferdigheter

- F bruker yrkesförmågan: Handpåläggning (hold F, 1 KP per SR for 1 PSY), Meditation (stå stille, +1 FV per SR på neste slag), Riddarslag (5 PSY, neste treff maksimal skade), Tjuvens tur (1 til 3 PSY for like mye CL på neste slag, to ganger per nivå). Krigare, Lärd man, Lönnmördare, Sjöfarare og Utbygdsjägare har passive förmågor.
- H: Första hjälpen på deg selv. Stopper blødning, helbreder ingen KP. Trenger to hele armer.
- R, G og T: besvärjelser for den som kan trylle, ellers Bärsärkagång og Avväpna hvis du kan dem.

## Erfarenhet og hjältepoäng

- Første lyckade slag i en ferdighet etter søvn gir 1 EP i den ferdigheten, perfekt gir 1T3+1 (Bok I s. 63). Kategori B gir ingen EP. Søvn er trappa ned (du sover der) og senga på vertshuset.
- EP veksles inn til FV når du hviler en uke på vertshuset i Fristaden. Kostnaden er grundkostnad x tabellen i Bok I s. 29 (`fvCost`). Sekundære ferdigheter kan ikke gå over grundegenskapen.
- Bonuspoeng etter et nivå (1 for nivået, +1 for monster eller runer, høyst 4) gis i trappa til en ferdighet du velger (uv, etter tabellen i Bok I s. 63).
- Hjältepoäng (HP): FV 21 gir 1T4, store dåder (demon, Rødpels) gir 10. V gjør klar 1 HP: neste slag blir ett trinn bedre (fummel til bom, bom til lyckat, lyckat til perfekt, og perfekt gir HP-en tilbake). I Fristaden hos Syster Jehanne (ordet DÅDER): 5 HP gir +1 i en grundegenskap (ikke STO, aldri over rasens maks, lagres i `P.attrUp`), og hjälteförmågor fra Expert og Gigant kan kjøpes. Bare de spillet bruker står på lista: Järnnäve, Kattfot, Snabbfot, Skarpögd, Snabbslående, Orädd, Projektilparering og Snabbläkning.

## Medvetslös

Ingen dödsslag. Når du blir medvetslös:

1. Fiender i nærheten handler etter hva de er (uv). Vätter og orcher raner deg (halve silveret og en verdisak) og går. Rotter biter noen ganger før de mister interessen. Skjeletter og demoner slår videre. Hver skade kan ta deg til minus FYS, og da er du død.
2. Blør du, slår du et normalt FYS-slag. Bom koster 1T3 totala KP.
3. Så våkner du. Du kan krype, drikke og spise, men ikke slåss før totala KP er over 0.
4. 1 hjältepoäng: du reiser deg med en gang med 1 KP, og fiendene rundt deg blir slått tilbake.

## Bärförmåga og penger

- Bärförmåga er STY kg (Bok II s. 5). Det du har på deg og i hendene teller ikke. Over STY kg er du överlastad: farten x0,75 og -5 på Smyga, Akrobatik, Hoppa og Klättra (uv). Høyst 2 x STY kg.
- Penger er silvermynt (sm) som i boka. Prisene på våpen og rustning står i tabellene. Alt annet i spillet er ganget med 10 fra versjon 0.4.

## Player-API som andre moduler bruker

- `P.attrs` (effektive grundegenskaper), `P.skills` (FV per ferdighet), `P.baseSkills` (FV i løpet), `P.spells` (`{ id: S }`), `P.spellOrder` (rekkefølgen på R/G/T).
- `P.kp`, `P.maxKP`, `P.loc[loc]`, `P.locMax[loc]`, `P.bleeding` (Set), `P.injuries` (kritiske skader).
- `P.psy`, `P.maxPSY`, `P.hjp` (hjältepoäng), `P.exp` (`{ ferdighet: EP }`), `P.silver`, `P.potions`, `P.bag`, `P.kit`, `P.equip`.
- `P.roll(id, o)`: slår et färdighetsslag eller grundegenskapsslag (STY, FYS osv. som normalt slag). `o.mod` legger til på CL, `o.sg` gir svårighetsgrad for grundegenskaper, `o.label` vises i loggen. Gir EP ved første suksess. Bruker en klargjort hjältepoäng.
- `P.rollHero(id, o, cb)`: som `roll`, men kaller `cb(r)` etterpå. Brukes der det tidligere sto `rollPush`.
- `P.attrRoll(attr, sg = 10, o)`: grundegenskap mot svårighetsgrad.
- `P.heal(n, quiet)`: helbreder n KP på totala KP og fordeler det på skadde kroppsdeler (de viktigste først). Gir tilbake hvor mye.
- `P.gainPSY(n)`, `P.spendPSY(n)` (false hvis det ikke går).
- `P.stopBleeding()`, `P.healAll()` (alle KP, kroppsdeler og PSY, stopper blødning).
- `P.restWeek()`: en uke på vertshuset. Helbreder, gir PSY, veksler EP til FV og gir tilbake en tekst med hva som ble bedre.
- `P.learnSpell(id, S)`, `P.addExp(id, n)`, `P.addHjp(n, why)`, `P.raiseAttr(a)`, `P.learnHeroic(id)`.
- `G.ui.logRoll(r, tekst, fiende)` viser et slag i loggen.
