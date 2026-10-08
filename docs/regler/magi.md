# Magi i Drakar och Demoner 4.0 (1991): spesifikasjon for implementering

Purpose: exact rules for magic, fear and phobias from DoD 4.0 (1991), plus the differences, extra schools, drugs and equipment lists from DoD Expert "Magi" (1987), written so a programmer can implement them without the books.

## 0. Sources, page numbers and notation

| Short name | File | Book |
|---|---|---|
| Bok III | `rules/kingafw/dod4_bok3_spelarboken.txt` (HTML copy `full_a4d6775ba3be.html`) | Drakar och Demoner, Bok III: Spelarboken (1991). Primary source. |
| Bok I | `rules/kingafw/dod4_bok1_rollpersonen.txt` | Bok I: Rollpersonen. Used only for the definitions Bok III refers to (perfekt slag, fummel, grundegenskapsslag, höja PSY). |
| Bok II | `rules/kingafw/dod4_bok2_spelledarboken.txt` | Bok II: Spelledarboken. Used only for the length of a stridsrunda. |
| Expert Magi | `rules/kingafw/expert_magi.txt` (HTML copy `full_c323a56139f9.html`) | Drakar och Demoner EXPERT, MAGI m.m. (1987). Secondary source. |

Page numbers are printed page numbers ("s. 13"). The Bok III text file has no page markers, so pages come from the PDF anchors in the HTML copy (printed page = PDF page number minus 1). This was checked against the book's own cross reference "fortsättning på sid 27" (the Luminal text does start on printed page 27). Expert Magi pages come from the printed page numbers in the transcription (each number stands at the end of its page, matching the page footers in the HTML copy). Bok I pages come from its table of contents.

Notation rules for this file:

- Swedish rule terms are kept exactly as printed, including spell names in CAPITALS.
- The books print a long dash in tables. Here it is written `-` (none, negligible, not applicable). In Motståndstabellen the long dash means automatic success and is written `auto`. `†` (automatic failure) is kept.
- Where the source text has an obvious misprint, the printed value is kept and the problem is listed in section 12.
- Narrative example paragraphs inside tables (the "Exempel: ..." stories in the Skräck tables) are left out. All numbers and rule text are kept.

Abbreviations used by the books:

| Term | Meaning |
|---|---|
| FV | färdighetsvärde (skill value, here the value in a magiskola) |
| S | skicklighetsvärde, the skill value in one spell ("HELA S12") |
| E | effektgrad ("BLIXT E5"). Also written "grad" |
| CL | chans att lyckas (target number on 1T20). Expert Magi sometimes writes GL |
| SR | stridsrunda, about five seconds (Bok II s. 15) |
| ruta, rutor | grid square, 150 cm per side (Bok II s. 15; Bok III s. 33 "1,5 meter (1 ruta)") |
| PSY | the attribute psykisk kraft. It is also the pool spent on magic ("PSY-poäng") |
| KP | kroppspoäng (hit points); "Totala KP" in the detaljerade stridssystemet |
| BV | brytvärde (break value of weapons, shields and objects) |
| STO, STY, FYS, SMI, INT, KAR | storlek, styrka, fysik, smidighet, intelligens, karisma |
| xTy | x dice with y sides ("1T6", "2T8"), as in "1T20" |
| SL, RP | spelledare, rollperson |
| BC, EP, BP | baschans, erfarenhetspoäng, bakgrundspoäng |
| sm, km, gm | silvermynt, kopparmynt, guldmynt. 10 km = 1 sm, 10 sm = 1 gm (Bok III s. 43) |
| BEP | belastningspoäng. 1 BEP = 3 kg (Bok III s. 12). Expert: "3 BEP = 1 STO" |
| (F), (K), (R) | Fysisk manifestation, Kvick, Ritual |

## 1. Magiskolor and who can learn magic (Bok III s. 3, s. 12)

The schools described in Bok III: **Animism**, **Elementarmagi**, **Mentalism**, plus the **Allmänna besvärjelser** that every caster can learn.

- Animism: nature, influencing and communicating with living things.
- Elementarmagi: eld, vatten, luft, jord, and the lesser elements mörker, ljus, köld, värme.
- Mentalism: control over the body, new properties and abilities.

Who can learn magic (s. 3):

- **Magiker** choose one magiskola as yrkesfärdighet. They may learn any number of allmänna besvärjelser and spells of that school as startfärdigheter. Later they may learn other magiskolor as sekundära färdigheter, and spells from them.
- **Utbygdsjägare** may take Animism as yrkesfärdighet but cannot learn any spells as startfärdigheter. In the rules text "magiker" means "magiker och utbygdsjägare".
- The only fixed restriction in these grundregler: only magiker and utbygdsjägare can ever learn magic. Race and entrance-test restrictions from the box "Drakar och Demoner Magi" are optional, decided by the SL.
- Optional addition for that box's race restrictions, printed exactly: "ankor (Al, E, I, M, Sp, S)". The abbreviations are not explained. Matching them against the school list on s. 12 gives Alkemi, Elementarmagi, Illusionism, Mentalism, Spiritism, Symbolism (interpretation, not stated). Animism is not in the list.
- A magiker may have FV in several magiskolor at once, but only one is his yrkesfärdighet (s. 3).
- Allmänna besvärjelser always count as belonging to the school in which the caster has the highest FV (s. 4).

The "Drakar och Demoner Magi" box (s. 12) adds the schools Alkemi, Demonologi, Harmonism, Häxkonster, Illusionism, Nekromanti, Röstmagi, Spiritism, Stavmagi, Symbolism and over 450 spells. That box is not in the source files. Bok III says its rules override the box where they differ, and that BEP in the box means 3 kg.

## 2. Färdigheten magiskola (Bok III s. 3)

```
Typ: Sekundär
Yrken: Magiker (en valfri magiskola), Utbygdsjägare (Animism)
Grundegenskap: INT
```

- Improved only by training, alone or with a teacher. Training alone requires access to a magiakademi's library (s. 3). Note that s. 7 says EP in magiskolor can only be gained by training with a teacher (see section 4 and section 12).
- The FV in a school controls:
  1. **Skolvärde gate:** every spell has a skolvärde. You may learn a spell only if FV in its school is at least its skolvärde. Example: MINSKA has skolvärde 6, so Animism FV 6 is needed, and the spell then starts at S1.
  2. **Max effektgrad:** the highest E you may use for a spell or ritual equals your FV in that spell's school.
  3. **Memory slots:** the number of spells from that school you can hold memorized equals FV in the school (section 3.10).
- Spells never get BC (they are not yrkesfärdigheter or primära färdigheter). Learning spells as startfärdigheter uses the normal rules, but the grundkostnad depends on skolvärde (table in section 4.4).
- Spells work as färdigheter kategori A. The value is called skicklighetsvärde, written with an S ("HELA S12" equals FV 12). S in a spell may be higher than FV in its school. School FV only limits which spells can be learned and the max E, not how well a spell is known.
- Skolvärde says nothing about how hard the spell is to cast (s. 5).

## 3. Att använda magi (Bok III s. 4 to 7)

### 3.1 Casting algorithm

```
Preconditions
  - Caster is not touching iron and not enclosed by iron (section 5.1).
  - The spell is memorized, or is read from the caster's own formelsamling
    (slower, 3.11), or from a magiskt pergament (3.12).
  - Rituals: must be memorized, and can never be cast in combat (3.13).

1. Choose E before casting (1 <= E <= FV in the spell's school).
   Extra E spent on range or duration count toward E (3.14).
2. CL = S - 2 * (E - 1) + other modifiers
   (example: ELD at S12 has CL 12 at E1, CL 10 at E2, CL 8 at E3).
3. Roll 1T20. Result <= CL succeeds. Check perfekt slag and fummel (3.2).
4. Pay PSY by outcome (3.3).
5. If the spell is not (F) and targets a creature's psyche:
   caster's current PSY (after paying) must overcome the target's PSY
   on Motståndstabellen (3.7). Failure: nothing happens.
6. Timing: normal spell takes effect in the SR after the casting SR;
   (K) takes effect in the same SR (3.4).
```

All spells are based on PSY (s. 4: "Alla besvärjelser är baserade på PSY").

### 3.2 Roll outcomes: perfekt slag and fummel (Bok I s. 37, "Chans att lyckas (CL)")

Bok III only says spells work as kategori A skills. The general rule from Bok I:

- With FV 1 or more, a roll of 1 always succeeds and 20 always fails, whatever the CL.
- With FV 0 and CL 0 or lower, two 1s in a row are needed to succeed.
- **CL below 1:** no perfekt slag is possible. A 20 is a fummel.
- **CL 1 to 19:** on a 1, roll again; if the second roll is at or below FV, the roll is perfekt. On a first roll of 20, roll again; if the second roll is above FV, it is a fummel.
- **CL 20 or more:** a 1 is always perfekt. On a 2, roll again; at or below FV is perfekt. Fummel only on two 20s in a row.
- For spells, use the spell's S as "FV" in these checks (spells use S in place of FV, s. 3).

### 3.3 PSY cost by outcome (s. 4)

| Outcome | Effect | PSY lost |
|---|---|---|
| Lyckat | Full effect | E (1 per effektgrad). Example: ELD E3 costs 3 PSY |
| Perfekt | Full effect | Half of E, rounded in the caster's favour (down), minimum 1 |
| Misslyckat | No effect | 1 |
| Fummel (snedtändning) | Roll on Snedtändningstabellen (section 5.2) | E (everything it would have cost on success) |
| Concentration broken by damage while casting | No effect, counts as a normal failure | 1 |
| Caster killed while casting | Spell has no effect | - |

"Observera att en (1) PSY-poäng alltid går åt, även om han misslyckas med besvärjelsen." A spell always costs at least 1 PSY.

The resource is the PSY attribute itself. There is no separate mana pool. If a magiker's PSY points drop to 0 he dies (s. 5). Expert Magi calls the same thing "kraftpoäng" once (s. 4 of Expert).

### 3.4 Tid och magi, turordning (s. 4; Bok II s. 15)

- Most spells take **1 SR** to cast. Gestures and words are needed. A spell cast in one SR has its consequences in the **next SR**.
- Spells marked **(K)** (kvick) take effect immediately, in the same SR they are cast.
- In combat, magic goes before slagväxling (melee exchange).
- Order between several casters: the one with the highest PSY after paying for the spell goes first.
- Bok II s. 15: while casting ("Lägga en besvärjelse") you concentrate and can do nothing else during the whole SR. One SR is about five seconds.
- Rituals can never be used in combat (s. 4).
- Reading from formelsamling: (K) spell 1T6 SR, ordinary spell 1T6 minuter (s. 5). Reading a pergament: E SR (s. 6).

### 3.5 Olika stark magi (effektgrad) (s. 4)

- Every spell can be cast at different effektgrader. The effect per E is given in each spell.
- Max E = FV in the spell's school.
- CL drops by 2 for each E beyond the first.
- The caster must decide E before casting.

### 3.6 Concentration (s. 4)

- If the caster is damaged while casting, concentration breaks. This works as a normal failure: 1 PSY lost, no effect.
- If the caster is killed while casting, the spell has no effect.
- Some spells last "Konc." (as long as the caster concentrates). KONTROLLERA PERSON states that while concentrating the caster cannot fight, cast other spells or run (s. 31).

### 3.7 Magiskt motstånd and Fysiska besvärjelser (s. 5)

- A creature targeted by a spell in which the caster's psyche tries to affect the target's psyche may always resist if it is conscious. Undead can also resist.
- The caster must overcome the target's PSY with his own PSY, counted **after** subtracting the PSY points paid for this spell, on Motståndstabellen. Caster PSY is the active value (column), target PSY the passive value (row "SG"). Failed roll: nothing happens.
- The target may voluntarily accept the effect if it is aware of the spell (usual for healing). An unprepared person's mind resists automatically.
- A thing or creature affected by a spell is called **förhäxad**.
- **(F) Fysisk manifestation** spells (for example BLIXT) need no resistance roll and always affect the target if the casting succeeds. Symbols (Symbolism, not in Bok III) have their own method.

**Motståndstabellen** (Bok III s. 23, same as Bok I). Row = SG (passive value), column = grundegenskapsvärde (active value). Roll at or below the listed value with 1T20 to succeed. `†` = automatisk misslyckande, `auto` = automatisk framgång.

| SG | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | auto | auto | auto | auto | auto | auto | auto | auto | auto | auto | auto |
| 2 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | auto | auto | auto | auto | auto | auto | auto | auto | auto | auto |
| 3 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | auto | auto | auto | auto | auto | auto | auto | auto | auto |
| 4 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | auto | auto | auto | auto | auto | auto | auto | auto |
| 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | auto | auto | auto | auto | auto | auto | auto |
| 6 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | auto | auto | auto | auto | auto | auto |
| 7 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | auto | auto | auto | auto | auto |
| 8 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | auto | auto | auto | auto |
| 9 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | auto | auto | auto |
| 10 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | auto | auto |
| 11 | † | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | auto |
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
| osv | | | | | | | | | | | | | | | | | | | | | |

Closed form (checked against every cell above): `CL = 10 + aktiv - passiv`. If that is 0 or lower: automatic failure. If it is 20 or higher: automatic success. The table continues ("osv") the same way.

The same table resolves effektgrad against effektgrad (ANTIMAGI, SKINGRA, MÖRKER vs LJUS and so on): the attacking E is the active value, the defending E the passive value.

**Svårighetsgrad** (Bok III s. 23). Used for "normalt/svårt X-slag": put SG and the attribute into Motståndstabellen.

| Problem | SG |
|---|---|
| Mycket lätt | 1 |
| Lätt | 5 |
| Normalt | 10 |
| Svårt | 15 |
| Mycket svårt | 20 |
| Extremt svårt | 25 |

So a normalt PSY-slag has CL = PSY, and a svårt FYS-slag has CL = FYS - 5.

### 3.8 Självmordsattack med magi (s. 5)

- PSY 0 means death. A caster may deliberately cast so strong a spell that his PSY goes below zero, provided he has not already spent all his power.
- Max spend = normal PSY / 2 + remaining PSY. Example: Zot, 4 PSY left, normal PSY 16, may spend 16/2 + 4 = 12, going to -8. Zot dies.
- During a deliberate suicide attack, CL = the unmodified S, whatever the E.

### 3.9 Regaining PSY (s. 4)

- 1 PSY per hour of complete rest, or 1 PSY per 3 hours while doing physical activity.
- Points described as "permanently lost" are never regained this way.
- Raising maximum PSY (Bok I s. 64, "Hur man kan höja sin PSY"): after each finished adventure, a magiker who overcame a victim's resistance in a serious PSY mot PSY contest may roll 1T20. Result at or below (25 - current PSY): +1 PSY. A 1 gives +1T3+1. Once PSY is past 24, only a 1 raises it (+1); two 1s in a row give +1T3+1. One roll per adventure; the increase arrives gradually over a week. A non-magiker who resisted a magiker's attack uses (20 - PSY) and the cap 19 the same way.

### 3.10 Memorering av besvärjelser: how many spells (s. 5)

- Max memorized spells from one school = FV in that school.
- Max memorized spells in total = (INT + PSY) / 4 (rounding not stated).
- A ritual counts as three spells for memory.
- If capacity is exceeded, the player chooses spells to forget.
- Memorizing takes 20 minutes per skolvärde point for a spell, 1 hour per skolvärde point for a ritual.
- A memorized spell stays until replaced. If the caster is knocked unconscious by damage or magic, he forgets all memorized spells unless he passes a normalt PSY-slag. Natural sleep does not erase them.
- Spells not memorized can still be cast by reading them from the formelsamling (3.11).
- There is no limit on how many spells can be *learned* (written in the formelsamling); the limits are skolvärde vs school FV and the EP cost.

### 3.11 Magikerns formelsamling (s. 5)

- Every learned spell must be written in the formelsamling. If all copies are lost, every spell not in memory is lost and must be learned again, but relearning goes three times as fast (six inlärningsslag per week).
- Casting directly from the formelsamling: (K) spell takes 1T6 SR, ordinary spell 1T6 minuter. Rituals cannot be cast this way.
- You cannot cast from another magiker's formelsamling.

### 3.12 Magiska pergament (s. 6)

- A magiker who does not know a spell may cast it from a specially prepared parchment, if the spell belongs to a school in which he has FV, and he has at least FV B4 in Läsa for the language.
- The spell always has the E written by the author. Reading takes E SR.
- Roll an egenskapsslag for INT (interpretation), then a färdighetsslag for the spell's school. Both must succeed. PSY is paid by the reader as usual.
- A fummel on either roll: roll on Snedtändningstabellen.

### 3.13 Ritualer (s. 4, s. 6)

- Marked (R). Must be memorized to be performed. Need S1 or better.
- Normally take 1T4 hours per effektgrad (some exceptions). Require a calm, undisturbed place.
- Count as three spells for memory. Never usable in combat.

### 3.14 Räckvidd and Varaktighet (s. 6)

Spell description format (s. 6): first line skolvärde, NAME and flags (F, R, K); second line school; third line range; fourth line duration.

```
6 KNÄCKA (F, K)
Elementarmagi
Sx2 Rutor
Omedelbar
```

**Räckvidd** (max distance from caster to target; depends on S):

| Beteckning | Räckvidd |
|---|---|
| Personlig | Personlig* |
| Beröring | Sig själv eller något/någon man rör vid |
| Kort | S/2 rutor (avrunda nedåt) |
| Medium | Sx2 rutor |
| Lång | Sx10 rutor |
| Extrem | S/4 kilometer (avrunda inte) |
| Avlägsen | Sx1 kilometer |
| Spec | Speciellt, räckvidden anges i formelbeskrivningen |

\* Innefattar kläder och utrustning som bärs på kroppen.

Some spells print ranges outside this list (S/4 rutor, Sx4 rutor, S/4 km). Use them as printed: S/4 rutor, S x 4 rutor, S/4 km.

Ranges from Kort to Avlägsen can be extended with extra E: each such E adds one base distance. In the Sx2 rutor group, two extra E for range give Sx6 rutor.

**Varaktighet** (depends on S and extra E):

| Varaktighet |
|---|
| Omedelbar |
| S/4 SR |
| Sx1 SR |
| S/4 minuter (avrunda inte) |
| Sx1 minuter |
| S/4 timmar (avrunda inte) |
| Sx1 timmar |
| S/4 dygn (avrunda inte) |
| S/4 veckor (avrunda inte) |
| Konc. = Så länge magikern koncentrerar sig |
| Permanent |

"Vissa specialfall kan även dyka upp." Durations from S/4 SR to S/4 veckor can be extended with extra E; each adds one base duration. In the Sx1 SR group, two extra E give Sx3 SR.

Implementation note: extra E for range or duration count as part of the spell's E. So they cost PSY, lower CL by 2 each, and count against the max E (FV in school). The book does not say this in one sentence; it follows from "extra effektgrader" plus the general E rules.

## 4. Att bli bättre i magi (Bok III s. 7, tables s. 25)

### 4.1 Magiskolor

FV in magiskolor is bought like ordinary skills, but EP can only be gained through **training with a teacher**, not by ensamträning or experience (s. 7). (Compare s. 3, which allows ensamträning with an academy library; see section 12.)

### 4.2 Besvärjelser: ensamträning (s. 7)

- Requires a magisk kodex (a special formula book with a full description of the spell). It takes 20 to 30 handwritten pages per spell.
- Normal training is 8 hours a day, 6 days a week.
- Each week roll a normalt INT-slag with +1 on the die for each point of INT below 19. Success gives 1 EP for the spell. Example: INT 15 gets +4 (19 - 15), so must roll 11 or lower. Equivalent target: 1T20 <= 2 x INT - 19.
- The caster must have enough FV in the spell's school (skolvärde gate).

### 4.3 Training with a teacher, experience, converting EP (s. 7)

- Training with a teacher: exactly as for ordinary skills (Bok I s. 63).
- Experience through adventuring: exactly as for ordinary skills.
- EP from both kinds of training can be converted to S as soon as there are enough. Buying S works like a new character buying startfärdigheter: EP = (Kostnadstabell value) x (grundkostnad from skolvärde).

### 4.4 Cost tables (s. 25)

**Kostnad för besvärjelser**

| Skolvärde | Grundkostnad |
|---|---|
| 1–3 | 2 |
| 4–6 | 4 |
| 7–9 | 6 |
| 10–12 | 8 |
| 13–15 | 10 |
| 16–18 | 12 |
| 19–21 | 14 |
| för varje ytterligare +3 | +2 |

**Kostnadstabell för att köpa FV.** Row = FV du har, column = FV du vill köpa. "Multiplicera resultatet i tabellen med färdighetens grundkostnad för att få fram det antal EP det kostar att köpa ett FV."

| FV du har | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 0 | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 11 | 13 | 15 | 17 | 20 | 23 | 26 | 30 | 34 | 38 | 43 |
| 1 | - | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 10 | 12 | 14 | 16 | 19 | 22 | 25 | 29 | 33 | 37 | 42 |
| 2 | - | - | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 9 | 11 | 13 | 15 | 18 | 21 | 24 | 28 | 32 | 36 | 41 |
| 3 | - | - | - | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 14 | 17 | 20 | 23 | 27 | 31 | 35 | 40 |
| 4 | - | - | - | - | 0 | 1 | 2 | 3 | 4 | 5 | 7 | 9 | 11 | 13 | 16 | 19 | 22 | 26 | 30 | 34 | 39 |
| 5 | - | - | - | - | - | 0 | 1 | 2 | 3 | 4 | 6 | 8 | 10 | 12 | 15 | 18 | 21 | 25 | 29 | 33 | 38 |
| 6 | - | - | - | - | - | - | 0 | 1 | 2 | 3 | 5 | 7 | 9 | 11 | 14 | 17 | 20 | 24 | 28 | 32 | 37 |
| 7 | - | - | - | - | - | - | - | 0 | 1 | 2 | 4 | 6 | 8 | 10 | 13 | 16 | 19 | 23 | 27 | 31 | 36 |
| 8 | - | - | - | - | - | - | - | - | 0 | 1 | 3 | 5 | 7 | 9 | 12 | 15 | 18 | 22 | 26 | 30 | 35 |
| 9 | - | - | - | - | - | - | - | - | - | 0 | 2 | 4 | 6 | 8 | 11 | 14 | 17 | 21 | 25 | 29 | 34 |
| 10 | - | - | - | - | - | - | - | - | - | - | 0 | 2 | 4 | 6 | 9 | 12 | 15 | 19 | 23 | 27 | 32 |
| 11 | - | - | - | - | - | - | - | - | - | - | - | 0 | 2 | 4 | 7 | 10 | 13 | 17 | 21 | 25 | 30 |
| 12 | - | - | - | - | - | - | - | - | - | - | - | - | 0 | 2 | 5 | 8 | 11 | 15 | 19 | 23 | 28 |
| 13 | - | - | - | - | - | - | - | - | - | - | - | - | - | 0 | 3 | 6 | 9 | 13 | 17 | 21 | 26 |
| 14 | - | - | - | - | - | - | - | - | - | - | - | - | - | - | 0 | 3 | 6 | 10 | 14 | 18 | 23 |
| 15 | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | 0 | 3 | 7 | 11 | 15 | 20 |
| 16 | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | 0 | 4 | 8 | 12 | 17 |
| 17 | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | 0 | 4 | 8 | 13 |
| 18 | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | 0 | 4 | 9 |
| 19 | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | 0 | 5 |
| 20+ | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | 0 |

**Ålderstabell** (s. 25). Needed for FÖRYNGRA (section 8.1), which moves STY, STO, FYS and SMI to the values of a younger age group.

| | Ung | Mogen | Medelålders | Gammal |
|---|---|---|---|---|
| STY | −1 | ±0 | −2 | −5 |
| FYS | +1 | ±0 | −1 | −3 |
| SMI | +1 | ±0 | −1 | −3 |
| INT | ±0 | ±0 | +1 | +1 |
| PSY | −1 | ±0 | +2 | +4 |
| KAR | ±0 | ±0 | +1 | +1 |
| STO | ±0 | ±0 | ±0 | ±0 |
| EP | 150 | 200 | 250 | 300 |
| Startkapital | x1 | x1,5 | x2 | x2,5 |
| Max FV från start | 13 | 15 | 17 | 19 |
| Anka | 16–20 | 21–40 | 41–60 | 61–80 |
| Dvärg | 21–40 | 41–155 | 151–250 | 251–400 |
| Halvalv | 30–40 | 41–70 | 71–100 | 101–130 |
| Halvl.man | 20–30 | 31–60 | 61–75 | 76–100 |
| Halvorch | 12–18 | 19–30 | 31–45 | 46–55 |
| Människa | 16–20 | 21–45 | 46–60 | 61–80 |

## 5. Specialregler för magi (Bok III s. 8)

### 5.1 Trollkarlar och järn

A caster cannot cast a spell while in physical contact with iron or enclosed by it. Consequences:

- No casting while wearing iron armour (it encloses him).
- No casting in a room with iron walls or in an iron cage.
- No spell can be laid in an object that is wholly or partly iron.
- Iron can still be reshaped by spells that involve elemental forces: air and water elementals can make iron rust; earth and fire elementals can reshape or melt it (Elementarmagi and Röstmagi).
- Some spells, for example LYFT, can affect iron, but the effect is halved if the object is 25 to 50 percent iron, and reduced to a quarter if it is mostly iron.
- The caster may cast while carrying iron objects weighing no more than 0,5 kg, but he must not be in direct physical contact with them.
- A caster may use iron objects freely, as long as he does not cast at that time.

### 5.2 Snedtändningstabellen

"Slå 1T20 och addera besvärjelsens effektgrad till resultatet."

| Resultat | Effekt |
|---|---|
| 1–5 | Besvärjelsens effektgrad halveras (avrunda uppåt). SL avger exakt vilken effekt detta har. Den träffar sitt avsedda mål. |
| 6–11 | Du skadas av den magiska energi som flödar fel. Du förlorar lika många KP som effektgraden och blir medvetslös i 1T8 minuter. Om du använder det detaljerad stridssystemet dras skadan enbart från Totala KP. |
| 12–15 | Om du har kastat en besvärjelse som skulle haft ett negativt resultat på sitt offer har dess fulla effekt drabbat dig. Du blir automatiskt förhäxad, utan chans till motstånd. Om du kastade en besvärjelse som skulle haft ett positivt eller neutralt resultat för dess mottagare, eller om besvärjelsen inte skulle drabbat någon särskild varelse alls, förlorar du lika många KP som besvärjelsens effektgrad. Du blir medvetslös i 1T8 minuter och blind i 1T8 timmar. |
| 16–17 | Du blir stum i 1T8 dygn. Detta kan inte avhjälpas med HELA. Du kan under denna tid inte använda några besvärjelser. |
| 18 | Du blir förlamad i 1T8 dygn och kan under denna tid inte utöva någon form av magi. Detta kan inte avhjälpas med HELA. Du kan fortfarande tala. |
| 19 | Du har drabbats av en hjärnskada. Din INT och alla INTbaserade färdigheter minskas med 1T4. Du glömmer lika många besvärjelser. Förlusten av färdigheter och besvärjelser kan inte kureras, men går att återvinna med hjälp av studier och träning. Din INT kan återställas om någon annan lägger HELA E6 på dig. |
| 20+ | Du drabbas av total minnesförlust under 1T8 dygn. Under denna tid kan du inte använda vare sig färdigheter eller magi, och du beter dig som en lallande idiot. Dina vänner måste ta hand om dig eftersom du inte kan klara dig själv. Detta kan inte avhjälpas med HELA. Vidare drabbas du av en fobi (se Fobitabellen) under 1T8 månader. Fobin kan inte botas med HELA. |

On a fummel the caster also loses all the PSY the spell would have cost (section 3.3).

## 6. Magiska föremål (Bok III s. 43 to 44)

- Magic items contain spells at fixed effektgrader. A BLIXT E3 always fires at E3.
- **Magic items always succeed; the user does not roll.**
- Normally an item draws PSY from the user's psyche: the user loses PSY when using it (regained as usual). Items with the spell **NEXUS** (skolvärde 20) draw energy from nature instead and cost the user nothing.
- Many items are single-use. Items with **PERMANENS** (skolvärde 19) keep the spell after it has been cast. (Neither NEXUS nor PERMANENS is described as a spell in Bok III; Expert Magi describes them, section 10.2.6.)
- Weapons and armour: usually FÖRTROLLA VAPEN; also LJUS and VARSEBLIVNING. Armour often has SKYDD and/or ANTIMAGI; VIRVELSKÖLD, LYFT and OSYNLIGHET are also useful. Spells in weapons and armour often have both PERMANENS and NEXUS and can then be active all the time (decided when made).
- Stavar och spön: made to hold magic, often of mithril, silverlind, järnek or mistel. LADDNING is very common in them.
- Magiska brygder: single use; the drinker is affected by the spell. Most common: ÖKA, HELA, LEVITATION, OSYNLIGHET, SYN, TELEPORTERING, VARSEBLIVNING.
- SL should be careful with numbers; more than one per person easily causes inflation.

**Analys av magiska föremål** (s. 44). To use an item you must (1) know it is magic, (2) know which spells are stored, (3) know how to activate and use them.

- (1): anyone with the skill Känna magi, or the spell VARSEBLIVNING.
- (2): only the spells VARSEBLIVNING or SYN.
- (3): only the spell SYN (each E of SYN gives 10 % chance to learn the activation words; one try per item until skill in SYN rises).
- Permanently active items need no analysis.

## 7. Skräck and Fobier (Bok III s. 8 to 11)

### 7.1 Fear check procedure (s. 8)

- Creatures that cause fear have the ability **Skräckslå**, listed as two values separated by a slash, for example `5/12`.
  - Left value: automatic fear, used as soon as a victim sees the creature.
  - Right value: used in later SR if the creature actively tries to frighten (it can do nothing else that SR).
  - `0` means add nothing. A dash before the slash: not automatically frightening. A dash after the slash: cannot frighten actively. In those cases no roll is made.
- Roll: **1T20 - victim's PSY + Skräckslå value (+ the highest single modifier)**, then read Skräcktabellen.
- Only the highest of several simultaneous modifiers is used. If a victim rolls several times in the same SR, only the hardest result counts (s. 10).

Other frightening situations and the value added to the roll (s. 8):

| Händelse | Värde |
|---|---|
| Död kropp | 1 |
| Nära vän död | 1T4 |
| Nära vän lemlästad | 1T6 |
| Besvärjelsen RÄDSLA | 1T20 |
| Besvärjelsen PANIK | 1T20 |
| Besvärjelsen TERROR | 1T20+10 |
| Svårt lemlästad kropp | 1T4 |
| Onaturlig händelse | 1T10 |
| Svårt sjuk person | 1T4 |
| Ytterst onaturliga händelser | 1T20 |
| Man konfronteras med någon man har fobi mot: | |
| Mild fobi | 5 |
| Normal fobi | 10 |
| Svår fobi | 15 |

(RÄDSLA, PANIK and TERROR are not Bok III spells; they come from the Magi box. Expert Magi versions are in section 10.2.4.)

### 7.2 Skräcktabellen (s. 9 to 10)

| Resultat | Effekt |
|---|---|
| <1 | Offret är är så pass oberört att han får −2 på Skräcktabellen för resten av sdagen. |
| 1 | Offret är oberört av skräckupplevelsen. |
| 2 | Offret blir försiktigt och har −1 på alla attacker och pareringar under denna SR. |
| 3 | Offret blir försiktigt och har −2 på alla attacker och pareringar under 1T4 SR. |
| 4 | Offret blir paralyserat av skräck under denna SR och kan inte göra något. |
| 5 | Offret blir försiktigt och har −1T4 på allt han företar sig under 1T4 SR. |
| 6 | Offret blir paralyserat av skräck under 1T4 SR och kan inte göra något. |
| 7 | Offret mår illa, får kramper i magen och spyr i 1T4+1 SR. Under denna tid och ytterligare 1 SR kan han inte göra någonting. |
| 8 | Offret går bärsärkagång (se denna färdighet) och rusar rakt mot skräckkällan. |
| 9 | Offret drabbas av en mild fobi. Se nedan. |
| 10 | Offret flyr så fort som möjligt från skräckkällan under 3T6 SR. Offret vet dock åt vilket håll han helst ska fly. |
| 11 | Offrets händer och ben börjar darra häftigt vilket ger −2T4 på allt som offret företar sig under 2T8 SR. |
| 12 | Offret flyr skrikande från skräckkällan så fort som möjligt under 3T6 SR. Offret vet dock inte åt vilket håll han flyr, utan detta bestäms slumpmässigt. |
| 13 | Offret svimmar och faller till marken. Han vaknar 2T8 SR senare. |
| 14 | Offret svimmar och faller till marken. Han vaknar 2T8 minuter senare. |
| 15 | Offret drabbas av en normal fobi. Se nedan. |
| 16 | Offret faller till marken med kroppen okontrollerat skakande tills skräckkällan försvinner. Därefter är han darrig i 1T4 timmar vilket innebär att SMI och alla SMI-baserade färdigheter är halverade. |
| 17 | Offret står paralyserat av skräck och kan inte göra något förrän skräckkällan avlägsnar sig eller avlägsnas. Dessutom blir det +1 på denna tabell under resten av samma dag. |
| 18 | Offret flyr vilt från skräckkällan fortast möjligast och vågar sig inte tillbaka till platsen för skräckkällan under resten av samma dag. |
| 19 | Offret överbelastas av den fruktansvärda skräckupplevelsen och ignorerar skräckkällan totalt. Han uppför sig som om han varken ser, hör, luktar eller känner skräckkällan på något sätt. |
| 20 | Offret blir hysteriskt och står kvar på platsen, skrikande av skräck tills skräckkällan försvinner och offret blir lugnat. Dessutom blir det +3 på alla efterföljande slag på Skräcktabellen under resten av samma dag. |
| 21 | Offret svimmar och faller till marken på grund utav den fruktansvärda upplevelsen och förblir medvetslöst under 2T8 minuter. Offrets hår vitnar. Dessutom blir det +15 på alla efterföljande slag på skräcktabellen under de närmaste 1T3 dagarna.* |
| 22 | Offret drabbas av en svår fobi. Se nedan. Dessutom blir det +4 på alla efterföljande slag på Skräcktabellen under de närmaste 1T4 dagarna. |
| 23 | Offret ramlar ihop på marken och förlorar medvetandet under 2T8 minuter på grund av den fruktansvärda skräckupplevelsen. Offret ådrar sig dessutom en psykisk störning, d.v.s. blir galen. Vilken typ av störning som offret råkar ut för bestäms i samråd mellan spelaren och SL. Det rekommenderas att man hittar på något i stället för att ta exempel från verkligheten. |
| 24 | Offret drabbas av en hjärtattack på grund av den fruktansvärda skräckupplevelsen. Offret måste göra ett normalt FYS-slag, och om detta slag misslyckas dör offret. Lyckas slaget svimmar offret och förblir medvetslöst under 1T8 timmar. Dessutom blir det +5 på alla efterföljande slag på skräcktabellen de närmaste 2T4 dagarna.* |
| 25 | Offret undergår en kraftig fysisk förändring, t. ex. åldras 1T10 år över en natt, förlorar hörseln, blir blind, tvingas amputera ett ben, allt hår faller av, etc. Detta är upp till SL att bestämma vad som händer. Dessutom blir det +6 på alla efterföljande slag på Skräcktabellen under 2T6 dagar.* |
| 26 | Offret får en hjärnblödning på grund av den fruktansvärda skräckupplevelsen. INT och alla INT-baserade färdigheter minskas med 1T4 poäng permanent. Offret glömmer lika många besvärjelser. Försämringar i färdighetsvärden och besvärjelseskicklighet kan tränas upp igen.* |
| 27 | Offret drabbas av massiv hjärtattack och måste klara ett Svårt FYS-slag, annars dör han. Lyckas slaget, se resultat ’24’. |
| 28+ | Offret hamnar i djup koma på grund av den enorma påfrestningen. Den djupa medvetslösheten varar under 1T8 månader och offret måste ha någon eller några som tar hand om honom. Offret ådrar sig dessutom en mild fobi som INTE kan botas. En snäll SL kan dock lösa detta problem med lämplig magi.* |

\* Slå 1T20 en gång för varje grundegenskap utom STO. Om resultatet blir 19–20 minskas grundegenskapen permanent med 1T2 poäng. Grundegenskapen kan inte bli lägre än 1 på detta vis.

("Bärsärkagång" is a skill in Bok I, s. 46.)

### 7.3 Modifikationer till slaget på Skräcktabellen (s. 10)

"Om en varelse har fått flera modifikationer som gäller samtidigt på denna tabell används bara den högsta. Om offret slår flera slag på tabellen samma SR används bara det hårdaste resultatet."

| Modifikation | Situation |
|---|---|
| −varierar | Offrets PSY dras alltid från slaget. |
| −6 | RPn möter skräckkällan ofta. |
| −3 | RPn har fått tid att förbereda sig inför mötet med skräckkällan. |
| −2 | RPn har mött skräckkällan tidigare. |
| +4 | RPn blir överraskad av skräckkällan. |
| +4 | Onaturliga händelser. |
| +15 | Ytterst onaturliga händelser. |

### 7.4 Fobier (s. 11)

- Phobias are ranked Mild, Normal, Svår. Mild: unease. Normal: irrational fear. Svår: the victim can barely hear the source mentioned without fleeing or shaking violently.
- A phobia usually lasts 1T8 months before weakening or vanishing. A svår fobi becomes normal after 1T8 months, then mild after another 1T8 months, then disappears.
- The negative effects only apply when meeting the thing the phobia concerns.
- Treatment: Drogkunskap, Läkekonst or Psykologi (works exactly like Läkekonst). Methods: trepanering, drug treatment, talking therapy, magical cures. None is very effective and some can harm the patient.
- When a creature is confronted with the object of its phobia it must roll on Skräcktabellen, adding the phobia value (Mild 5, Normal 10, Svår 15; table in 7.1).
- When a phobia is gained, roll on Fobitabellen.

**Fobitabellen** (1T20)

| 1T20 | Fobi | Vilket innebär |
|---|---|---|
| 1 | Agorafobi | Torgskräck (ej gråalver) |
| 2 | Klaustrofobi | Cellskräck (ej dvärgar eller grottalver) |
| 3 | Demofobi | Folksamlingar |
| 4 | Ailurofobi | Katter (ej kattmän) |
| 5 | Entemofobi | Insekter |
| 6 | Ofiofobi | Ormar (ej serpenter) |
| 7 | Skotofobi | Mörker (ej svartfolk eller grottalver) |
| 8 | Dendrofobi | Träd (ej skogslevande älvfolk) |
| 9 | Talassofobi | Hav (ej havslevande älvfolk) |
| 10 | Xenofobi | Främlingar |
| 11 | Hippofobi | Hästar (ej kentaurer) |
| 12 | Troglofobi | Underjorden (ej dvärgar eller grottalver) |
| 13 | Hagiofobi | Heliga platser |
| 14 | Kynofobi | Hunddjur (ej vargmän) |
| 15 | Ornithofobi | Fåglar |
| 16 | Iktyofobi | Fiskar |
| 17 | Pyrofobi | Eld (ej irrbloss) |
| 18 | Botanofobi | Växter (ej älvfolk) |
| 19 | Anekrofobi | Odöda |
| 20 | Monofobi | Ensamhet (ej eremitiska älvfolk) |

Spells that touch fear in Bok III: ORÄDD (no Skräcktabellen rolls at all) and the Umbra's fear attack (PSY vs PSY, then Skräcktabellen).

## 8. Besvärjelser (Bok III s. 13 to 31)

Column legend for all spell tables:

- **SV**: skolvärde (school FV needed to learn; also sets grundkostnad).
- **Grk**: grundkostnad in EP/BP from section 4.4 (derived from SV).
- **Räckvidd / Varaktighet**: exactly as printed.
- **Tid**: `1 SR` = cast this SR, effect next SR. `K` = effect in the same SR. `R` = ritual, 1T4 timmar per E, never in combat.
- **PSY**: PSY spent on success. `E` = 1 per effektgrad (section 3.3 for perfekt, failure, fummel).
- **Motstånd**: `nej (F)` = fysisk manifestation, no resistance roll. `PSY` = caster's current PSY vs target's PSY on Motståndstabellen, from the general rule on s. 5 when cast on an unwilling creature (interpretation of the general rule unless marked "texten"). `-` = no creature psyche to resist (area, object, self or information spell).
- **CL-mod**: modifier beyond the universal `-2 per E beyond the first`.

Spell counts in Bok III: Allmänna 6, Animism 20, Elementarmagi 20, Mentalism 20. Total 66.

### 8.1 Allmänna besvärjelser (s. 13 to 14)

Skola: "Allmän". Count as the caster's highest-FV school.

| SV | Namn | Räckvidd | Varaktighet | Tid | PSY | Grk | Motstånd | CL-mod | Effekt | Sida |
|---|---|---|---|---|---|---|---|---|---|---|
| 6 | ANTIMAGI | Sx10 rutor | S/4 minuter | 1 SR | E | 4 | - | - | Magic shield on a creature or object (max 125 m³). Incoming magic must first beat ANTIMAGI's E with its own E on Motståndstabellen; if it fails it rebounds onto the attacking caster where possible. Spells aimed at a creature must also beat its PSY. To lay it on someone with SKYDD, ANTIMAGI's E must first beat SKYDD's E; then both work. Has no effect against ELD and FROST (stated in those spells). | 13 |
| 6 | SKINGRA | Sx10 rutor | Omedelbar | 1 SR | E | 4 | - | - | Cancels another spell's effect (FÖRTROLLA VAPEN, FÖRBANNA VAPEN, BESKYDDARE, ÖKA etc.) if SKINGRA's E beats that spell's E on Motståndstabellen. Can destroy an elementar. Must be aimed at a specific spell (a description is enough). Must first get through ANTIMAGI. Can also stop an enemy caster's spell being cast (vs that spell's E). | 13 |
| 6 | VARSEBLIVNING | Sx10 rutor | Omedelbar | 1 SR | E | 4 | - | - | Choose before casting what to look for (fälla, hemlig dörr, guld, trappa, främmande tankar, svartfolk...). Gives direction and distance to the nearest such thing. Each E gives the direction to one more such thing (E2 = the two nearest). Also detects that an item is magic and which spells it holds (section 6). | 13 |
| 9 | BESKYDDARE | Beröring | Permanent | 1 SR | E | 6 | - | - | Protective cube of 27 m³ (3x3x3 m) around caster, person or object, set out with nine stones in a preparatory ritual. Only the caster can remove it, but it can be SKINGRAd. Works as ANTIMAGI plus ENERGISTRÅLE: all magic and all objects passing either way must beat an ANTIMAGI E1 or take an ENERGISTRÅLE E1 (1T6). Objects count as E1. Each E beyond the first adds 3 m in one dimension. | 14 |
| 14 | FÖRYNGRA (R) | Beröring | S/4 veckor | R | E | 10 | - | - | Rejuvenates own or another's body by E x 5 years. STY, STO, FYS and SMI change to the values of the new age group (Ålderstabell, section 4.4), starting from current values. Looks as at that age. Experience, skills, psyche and intelligence unchanged. When the duration ends, the target ages back to normal over one dygn. | 14 |
| 14 | LADDNING (R) | Beröring | Permanent | R | E | 10 | - | - | Stores PSY in an object like a single-use battery: 5 PSY per E. The caster moves PSY from himself into it and regains those points normally. On a later casting he may pay with the stored PSY instead of his own. An object can receive LADDNING only once. | 14 |

### 8.2 Animism (s. 14 to 18)

| SV | Namn | Räckvidd | Varaktighet | Tid | PSY | Grk | Motstånd | CL-mod | Effekt | Sida |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | FINNA VATTEN | S/4 rutor | Omedelbar | 1 SR | E | 2 | - | - | Distance and direction to all drinkable springs and water within range. Drinkable may be dirty and foul but never harmful to the caster. Does not work while it rains. | 14 |
| 2 | TRÄELD (F, K) | Beröring | Omedelbar | K | E | 2 | nej (F) | - | Ignites one piece of dry, dead wood, which then burns on its own. No other effect. Each extra E ignites one more piece. | 14 |
| 4 | SPÅRLÖS | Beröring | S/4 minuter | 1 SR | E | 4 | - | - | One creature walks through nature leaving no tracks at all, not even smell. Each extra E covers one more creature. | 15 |
| 5 | VÄXTKUNSKAP | Beröring | Omedelbar | 1 SR | E | 4 | - | - | Instant full knowledge of the touched plant: what it is, what it can be used for and so on. | 15 |
| 6 | MINSKA | Beröring | S/4 minuter | 1 SR | E | 4 | PSY | - | Each E lowers the target's STY, FYS, STO, KAR or SMI by 1 (minimum 1). Skills based on that attribute change too. | 15 |
| 6 | NEDKALLA ÅSKVIGG (F) | Sx10 rutor | Omedelbar | 1 SR | E | 4 | nej (F) | - | Calls a thunderbolt from a rain cloud onto a chosen target in range. The cloud's rain must fall on both caster and target. Damage as BLIXT: 1T6 per E, armour gives no protection, from totala KP. | 15 |
| 6 | VINDPIL (F) | Sx2 rutor | Sx1 SR | 1 SR | E | 4 | nej (F) | - | Cast by touch on a wooden arrow with a non-iron head. The arrow hovers before the caster's face, pointing where his nose points. Must be fired with a small gesture before the duration ends (else it falls). Hits a visible target in range automatically, even if it moves: 1T10+E damage, modified by the head's material and type; armour and natural protection work normally. Can only be stopped by magic (for example VIRVELSKÖLD) or by leaving the caster's sight. Light things of max 10 g (a slip of paper) can be tied to it without spoiling its flight. | 15 |
| 6 | ÖKA | Beröring | S/4 minuter | 1 SR | E | 4 | PSY | - | Each E raises the target's STY, FYS, STO, KAR or SMI by 1. Skills based on it rise too. | 15 |
| 6 | ÖRTRANKOR (F) | Särskild | Sx1 SR | 1 SR | E | 4 | nej (F) | - | Creates a bundle of seeds thrown at a target up to (STY+SMI)/2 rutor away; hits automatically. Needs 1 E per 10 STO of the target, else no effect. Each SR the victim may try to break free: its STY (active) vs the vines' motståndspoäng = E (spent on STO) x 10 − victim's STO (passive) on Motståndstabellen; +5 to STY if holding a dagger or similar short edged weapon when caught. One try per SR. At the end of the duration vines (or unthrown seeds) vanish in smoke. Example: STO 12, STY 15, E2: 2x10−12 = 8 vs STY 15. | 15 |
| 7 | KAMOUFLAGE | Personlig | S/4 minuter | 1 SR | E | 6 | - | - | Caster and worn gear seem to be a living, motionless part of the surroundings (tree, bush). While standing completely still and silent he cannot be noticed by any natural sense. Breaks if he does anything else. His own senses work normally. Magical search (VARSEBLIVNING) must beat KAMOUFLAGE's E. | 16 |
| 11 | VINDKONTROLL | Sx1 km | Sx1 timmar | 1 SR | E | 8 | - | - | Changes the wind in range by at most E metres per second, and turns its direction 1/8 turn (for example north to northwest) per E. | 16 |
| 12 | FÖRÄNDRA | Sx2 rutor | Sx1 min | 1 SR | E | 8 | PSY | - | Transforms an object or creature (can be the caster). 3 STO per E; E must cover the target's whole STO or nothing happens. New form must be the same main type: djur, växt or mineral. Only appearance changes: stats, abilities, skills stay (cannot make lead into gold). A creature gains purely physical functions of the new form (flight) but not supernatural ones (dragon breath). Higher E can split over several targets (E2: two of max STO 3 or one of max STO 6). | 16 |
| 12 | HELA | Beröring | Omedelbar | 1 SR | E | 8 | - (willing) | - | Heals 1T6 KP per E caused by wounds, blows, fire, cold, ENERGISTRÅLE, BLIXT or similar spells, acid and the like. Living creatures only, not objects. No effect on disease. HELA E6 also restores INT lost to snedtändning result 19. | 16 |
| 12 | KÄNNA FIENDSKAP | Sx2 rutor | Omedelbar | 1 SR | E | 8 | PSY | - | Senses whether another intelligent creature is in any way hostile to the caster. Not its intentions, only that it wishes him harm. | 16 |
| 13 | REGNKONTROLL | S/4 km | Sx1 minuter | 1 SR | E | 10 | - | - | Makes all clouds in range start a dense rain, or stops rain that is falling. Against an existing REGNKONTROLL: an ordinary effektgradsstrid (E vs E). Clouds normally lie at 1T3 x 500 m. | 17 |
| 15 | DIMMA | Sx10 rutor | S/4 timmar | 1 SR | E | 10 | - | - | Fog bank over the whole area within range; visibility at most 15 m. Needs water in the terrain (not in a desert except at an oasis). | 17 |
| 15 | NEUTRALISERA GIFT (F) | Beröring | Omedelbar | 1 SR | E | 10 | nej (texten) | - | Neutralizes 1T6+1 points of giftstyrka per E of any poison. Automatic if the spell succeeds; the poison need not be förhäxat. Does not heal damage already done. | 17 |

**Varelsebesvärjelser** (s. 17 to 18). A separate spell must be learned for each group (KONTROLLERA DÄGGDJUR is not KONTROLLERA REPTIL). Only usable against non-intelligent creatures. Groups: Däggdjur, Fåglar, Kräldjur, Groddjur, Fiskar, Insekter och spindlar, Skaldjur (krabbor, skorpioner, m. m.), Maskar, Blötdjur (bläckfiskar, mollusker, m. m.), Växter.

| SV | Namn | Räckvidd | Varaktighet | Tid | PSY | Grk | Motstånd | CL-mod | Effekt | Sida |
|---|---|---|---|---|---|---|---|---|---|---|
| 2 | TILLKALLA VARELSE | S/4 km | Omedelbar | 1 SR | E | 2 | nej (texten) | - | Summons 20 STO of creatures of the group per E from within range. They are not hostile to the caster, who can specify which creatures he wants. No need to beat their PSY. | 17 |
| 5 | TALA MED VARELSE | Personlig | Sx1 minuter | 1 SR | E | 4 | - | −5 if the creature is not first identified exactly (for example with Zoologi) | Communicate with one creature of the group by speech or signs: 1 FV in Tala språk per E. Animals give vague, often unreliable answers but never lie on purpose. Birds and mammals count to three, others only to "många". Impossible with creatures without INT. | 17 |
| 10 | KONTROLLERA VARELSE | Sx10 rutor | Sx1 SR | 1 SR | E | 8 | PSY | - | Full telepathic control of 20 STO of creatures of the group per E. Control breaks if they leave range. Plants: controls all that form one unit (a whole grain field), but never beyond range (a whole forest is impossible). | 18 |

### 8.3 Elementarmagi (s. 18 to 22, 27 to 28)

| SV | Namn | Räckvidd | Varaktighet | Tid | PSY | Grk | Motstånd | CL-mod | Effekt | Sida |
|---|---|---|---|---|---|---|---|---|---|---|
| 2 | LJUS (F) | Sx10 rutor | Sx4 minuter | 1 SR | E | 2 | nej (F) | - | About 50 cm³ of an object glows, lighting everything within 3 m. Each E beyond the first: +3 m of light, or +5 minutes duration. (Duration printed "Sx4 minuter"; see section 12.) | 18 |
| 2 | LÅGA (F, K) | Personlig | 1T3 SR | K | E | 2 | nej (F) | - | A small flame rises from the thumb when the caster snaps his fingers. Can ignite flammable things. Does not hurt the caster unless he fumbles. | 18 |
| 3 | FÖRSEGLA (F) | Beröring | Sx1 minuter | 1 SR | E | 2 | nej (F) | - | Binds the edges of two fitting, non-living, non-moving objects into one (door and frame, lid and box, sword in scabbard). They cannot be parted while it lasts; breaking them is hard because FÖRSEGLA adds 20 KP. Each extra E: +15 minutes, or +20 KP. | 18 |
| 3 | MÖRKER (F) | Sx10 rutor | S/4 minuter | 1 SR | E | 2 | nej (F) | - | Removes all light in a sphere 6 m across; nobody can see inside, even with torch or lamp. On an object lit by LJUS, MÖRKER's E must beat LJUS's E. Each E beyond the first: +5 minutes, or +3 m diameter. | 18 |
| 3 | SKÖLD (F, K) | Personlig | Omedelbar | K | E | 2 | nej (F) | - | Air in front of the caster becomes a metal-hard shield that parries one physical attack. BV 4 (+2 per E beyond the first). The parry succeeds automatically. | 19 |
| 4 | FLAMMANDE HAND (F) | Beröring | 1T3 minuter | 1 SR | E | 4 | nej (F) | - | One hand flames: +1T3 damage per E on blows dealt. Ignites every flammable thing it reaches. | 19 |
| 4 | KALLA HANDEN (F, K) | S/2 rutor | Omedelbar | K | E | 4 | nej (F) | - | Cold ray at one creature. Target makes a svårt FYS-slag (normalt for cold-climate creatures such as isbjörn or frostalv), modified in its favour by its natural protection's absorption. Failure: violent shivers, cannot do anything else this SR. Success: −4 CL on everything this SR. | 19 |
| 6 | BLIXT (F, K) | Sx10 rutor | Omedelbar | K | E | 4 | nej (F) | - | Lightning strikes the nearest target in front of the caster; if two are equally near, the one with most metal. 1T6 damage per E. Armour gives no protection. Damage from totala KP. | 19 |
| 6 | ELD (F) | Sx10 rutor | Omedelbar | 1 SR | E | 4 | nej (F) | - | Sudden heat in a sphere 1 m across; sets easily ignited things alight. E1 deals 1T6 to all creatures in the sphere. At higher E each E buys either a new sphere or +1T6 (E4: one 4T6 sphere, two 2T6, or four 1T6). Armour and SKYDD absorb. ANTIMAGI has no effect. Detaljerade stridssystemet: damage to totala KP. | 19 |
| 6 | ENERGISTRÅLE (F) | Sx10 rutor | Omedelbar | 1 SR | E | 4 | nej (F) | - | Magic light beam at one target: 1T6 per E. Armour or SKYDD subtract. Detaljerade stridssystemet: 1T3 per E. | 19 |
| 6 | FROST (F) | Sx10 minuter | Omedelbar | 1 SR | E | 4 | nej (F) | - | Like ELD but cold: sphere 1 m across, 1T6 per E, same sphere/damage splitting. Can put out fires. No effect on drakar or salamandrar. Armour or SKYDD absorb; ANTIMAGI has no effect. Detaljerade stridssystemet: totala KP. (Range printed "Sx10 minuter"; see section 12.) | 20 |
| 6 | FÖRBANNA VAPEN | Sx10 rutor | Sx1 minuter | 1 SR | E | 4 | - (targets an object; not stated) | - | Weapon gets −1 CL to hit and −1 damage per E. Interacts with FÖRTROLLA VAPEN. On a shield: lowers parry chance; BV unchanged. | 20 |
| 6 | FÖRTROLLA VAPEN | Sx10 rutor | Sx1 minuter | 1 SR | E | 4 | - | - | Weapon gets +1 CL to hit and +1 damage per E, and can harm creatures immune to normal weapons. Cancels up to its own E of FÖRBANNA VAPEN; leftover E work normally. On a shield: raises parry chance; BV unchanged. | 20 |
| 6 | KNÄCKA (F, K) | Sx2 rutor | Omedelbar | K | E | 4 | nej (F) | - | Damages a non-living object (SL sets its BV; projectile weapon BV 10; armour BV = 2 x absorption). E1 lowers BV by 10, +2 per extra E (E4 = 16). Magic items resist: KNÄCKA's E must beat the highest E of the spells in the item. | 20 |
| 6 | ÖPPNA (F) | Beröring | Omedelbar | 1 SR | E | 4 | nej (F) | - | Opens locked doors, boxes and chests, makes swords drop from scabbards and so on. Removes FÖRSEGLA if ÖPPNA's E beats FÖRSEGLA's E. | 20 |
| 7 | VIGGFÅNGARE (F) | Personlig | Omedelbar | 1 SR | E | 6 | nej (F) | - | Only in a thunderstorm. Chance to be struck = E x caster's height in metres above the surrounding terrain, in % (1T100; over 100 % is automatic). The bolt deals 5T6: 8 of those points, +4 per E beyond the first, become PSY points; the rest is physical damage. Extra PSY fade at 1 per hour if unused. A SKINGRA on the caster that beats his PSY (normal plus extra) removes the extra PSY, which become damage instead. | 20 |
| 8 | VIRVELSKÖLD (F) | Personlig | Sx1 SR | 1 SR | E | 6 | nej (F) | - | Strong whirlwind, about 75 cm across, around the caster, moving with him. A projectile that would hit him is deflected if the spell's E beats the projectile's motståndsvärde (VAPENTABELL below). Same effect on projectiles he fires himself. Any number per SR. Raises dust on dusty, sandy or snowy ground. No effect on melee weapons except piska. | 20 |
| 9 | FRAMMANA/SKICKA BORT ELEMENTAR (F) | Sx10 rutor | Sx1 SR | 1 SR | E | 6 | nej (F) | - | Summons one kind of elementar (each kind is a separate spell) from a bit of its element. Stats and abilities in 8.3.2. SKICKA BORT: the spell's E must beat the elementar's E on Motståndstabellen; then it vanishes at once. | 21 |
| 10 | ASTRALVAPEN (F) | S/2 rutor | Sx1 SR | 1 SR | E | 8 | nej (F) | - | Conjures a weapon of blue-shimmering energy, which must do damage with a cutting edge (sword, spear). Needs 1 E per kg of the real weapon (round up). Counts as magical, deals 2 less damage than the real weapon, uses the normal skill for that weapon, weighs nothing. | 28 |
| 11 | EXPLOSION (F, K) | Sx10 rutor | Omedelbar | K | E | 8 | nej (F) | - | Fire and light explosion at a chosen point in range: 5 damage per E (from totala KP) to everyone within E metres of the centre; 1 less per ruta further out. The caster can be hit. Everyone who sees it (caster included) is blinded next SR unless protected; blinded counts as being in darkness. | 28 |

#### 8.3.1 VAPENTABELL (for VIRVELSKÖLD, s. 21)

| Projektil | Motståndsvärde |
|---|---|
| Arbalestlod | 6 |
| Armborstlod | 6 |
| Blåsrörspil | 1 |
| Bola | 6 |
| Kastkniv | 4 |
| Kastspjut | 5 |
| Kaststjärna | 4 |
| Kastyxa | 5 |
| Klippblock | 9 |
| Piska | 2 |
| Pil | 4 |
| Slungsten | 7 |
| Sten | 5 |

#### 8.3.2 Elementarer (FRAMMANA/SKICKA BORT ELEMENTAR, s. 21 to 22 and 27)

Common rules:

- Base stats: PSY 3T6, SMI 3T6, STO 1T6. Each extra E: +1T6 STO and +1T6 PSY. SMI does not change with E.
- No FYS and no INT. KP and STY equal STO. Must be steered with the caster's full attention.
- Can be affected by magic; immune to poison.
- The caster needs a little of the element for it to appear from.
- In combat they act like ordinary creatures, using the normal order rules, also when elementars try to destroy each other. Attacks that work as normal combat (for example the Gnom's) have vapenlängd 0.
- "Destroy X" means: this elementar's grad (active) vs X's grad (passive) on Motståndstabellen.

| Elementar | Utseende / källa | Förflyttning | Anfall | Försvar och immunitet | Förstör | Övrigt |
|---|---|---|---|---|---|---|
| Luft: Sylfen | Transparent, vaguely human shape | Max 40 rutor/SR unloaded; normal 10 rutor/SR | Blow something over: its STO vs target's STO | Not harmed by material weapons | Salamander | Carries an object through the air 4 rutor/SR, 6 STO per grad. Carries written messages 28 rutor/SR. Guides a projectile or thrown weapon: +1 CL per grad and +1T3 damage per grad. |
| Eld: Salamandern | Lizard of fire, never fully still | 6 rutor/SR at max speed | Wraps target in flames: 1T6 per grad; armour and SKYDD protect | Harmed by material weapons, but deals 1T6 per grad to every weapon that hits it. Heals by absorbing fire (roll as fire damage, count as KP restored) | Sylf or Glacial | Ignites flammables it touches. Heats a metal weapon: +1T6 damage (1T3 with alternativt stridssystem) for as many SR as the Salamander's grad, but the weapon takes 1T6 per grad. |
| Jord: Gnomen | Human shape of grey-brown sand or clay | Max 6 rutor/SR | "Knytnäve": 1T4 per grad; CL 6 + 2 per E | Harmed by material weapons, but an attacker who hits must roll 1T100 at or below PSY x 5, or his weapon takes the same damage | Undin | Points toward the nearest deposit of a metal named by the caster. Mutually destroys KP with a Salamander until one dissolves. |
| Vatten: Undinen | Pillar of water, sometimes a beautiful woman of water | Max 10 rutor/SR in water, 1 ruta/SR on land | Wraps a creature to crush and drown it: 1T8 per SR | Material weapons do half damage | Gnom (washes it away) | Carries an object through water max 8 rutor/SR, 6 STO per grad. Mutually destroys KP with a Salamander. Makes a weapon work as well underwater as on land. |
| Mörker: Umbran | Vaguely human, of condensed darkness. Only from darkness or shadow | 15 rutor/SR | Fear: wraps a creature; if its PSY beats the victim's PSY the victim rolls on Skräcktabellen. 2T6 per grad to a Salamander, hits automatically | Not harmed by material weapons. Double damage from all fire attacks | Luminal | Globe of darkness, radius 5 rutor per grad: light sources stop shining (not extinguished), fire still burns, mörkersyn does not work. Sees freely in darkness. |
| Ljus: Luminalen | Globe of clear shining light. Only from a light source (daylight and moonlight count, starlight does not) | 15 rutor/SR | Blinds: all who look at it make a normalt PSY-slag (svårt for creatures with mörkersyn and svartfolk) or are blinded 2T6 SR (treated as in darkness) | Not harmed by material weapons. Immune to all fire attacks; cannot be harmed by a Salamander (and cannot blind one) | Umbra | Lights an area of radius 5 rutor per grad. |
| Köld: Glacialen | Human shape, blue skin, bushy white hair and beard, icy wind with snow around it. From solid material at 0 degrees or colder | 6 rutor/SR; 10 rutor/SR at 0 degrees or colder | Hug: 1T4 cold damage per grad, CL = 8 + E. Aura: all living creatures within 2 rutor make a svårt FYS-slag or just stand panting | Harmed by material weapons. Iron weapons that hit it lose 1 BV per hit; edged iron weapons also lose 1 damage per hit. Immune to cold. Double damage from fire | Salamander, Therm | Tunnels through solid ice 1,5 x 1,5 m at 1 ruta/SR. Chills a metal weapon: +1T4 per grad (1T2 alternativt stridssystem) vs living (not undead), 5 % per grad that it shatters on the first hit (not mithril); lasts 1T4+5 SR. |
| Värme: Thermen | Transparent globe of heat, shimmering air, hot winds that wither plants. No real substance. From a heat source (campfire) | Flies 15 rutor/SR | Wraps a creature: 1T4 heat damage per grad, CL = 8 + E. Aura: within 2 rutor svårt FYS-slag or stand panting | Only harmed by magic weapons or magic; normal weapons lose 1 BV per hit; 5 % per E that a wooden weapon catches fire. Immune to heat (for example ELD). Double damage from cold | Glacial | Tunnels through solid ice, 1,5 m wide. Heats a metal weapon: +1T4 per E (1T2 alternativt) vs living (not undead), 5 % per E that it melts and is ruined (not mithril); lasts 1T4+5 SR. |

### 8.4 Mentalism (s. 28 to 31)

| SV | Namn | Räckvidd | Varaktighet | Tid | PSY | Grk | Motstånd | CL-mod | Effekt | Sida |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | SPRÅNG (K) | Beröring | S/4 SR | K | E | 2 | - (willing) | - | Giant leap without run-up: up to 4 m horizontal and 2 m vertical per E. Normalt SMI-slag on landing to keep balance. | 28 |
| 3 | MOTSTÅNDSKRAFT | Beröring | Sx1 minuter | 1 SR | E | 2 | - (willing) | - | Each heat or cold damage instance (ELD, FROST, salamander, dragon fire...) is reduced by 1 per E, separately for each attack in the SR. Example: E3 vs 5, 7 and 10 damage gives 2, 4 and 7. | 28 |
| 4 | LEVITATION | Personlig | Sx1 minuter | 1 SR | E | 4 | - | - | Rise straight up, 5 m per E, carrying up to 50 kg besides the body. No free flight; sideways only with aids (a sail in wind, walking on hands along a ceiling). | 28 |
| 5 | KÄNSLOLÄSNING | Sx2 rutor | S/4 SR | 1 SR | E | 4 | PSY | - | Reads another creature's feelings and moods unnoticed; reveals at once whether it is friendly or hostile. | 29 |
| 6 | LYFT | Sx4 rutor | Sx1 minuter | 1 SR | E | 4 | PSY om ovillig (texten) | - | Telekinesis: 3 STO per E; must cover the whole STO to lift. Moves 2 rutor/SR, +1 ruta/SR per E beyond the first. Can be used on oneself to fly. Brakes falls of objects too big to lift: each E short counts as a 3 m fall; no effect if more than 4 E short (example: STO 13 falling 10 m, E4 lifts 12, one short, falls as 3 m). Ground vehicles: 1 E per 6 STO. Iron halves or quarters the effect (5.1). | 29 |
| 6 | SKYDD | Sx2 rutor | S/4 minuter | 1 SR | E | 4 | - (willing) | - | Like armour: +1 point of bepansring per E. If the target has ANTIMAGI, SKYDD must beat it first; then both work. | 29 |
| 6 | TANKEÖVERFÖRING | Sx10 rutor | Sx1 SR | 1 SR | E | 4 | - | - | Each E lets the target communicate silently with one creature (intelligent or not); only surface thoughts and feelings. | 29 |
| 7 | VATTENANDNING | Beröring | Sx1 timmar | 1 SR | E | 6 | - (willing) | - | Breathe underwater, dive to any depth, no decompression sickness. Can still breathe air. | 29 |
| 8 | FLYGA | Beröring | S/4 timmar | 1 SR | E | 6 | - (willing) | - | Free flight at a speed of "Ex5 rutor" (per SR is implied, not printed). One E is needed for each 20 STO of the target beyond the first 20. | 30 |
| 8 | LÄDERHUD | Personlig | Sx1 timmar | 1 SR | E | 6 | - | - | Skin turns hard, leathery and brownish: natural protection 2, added to any armour. KAR and KAR-based skills −2 while it lasts. | 30 |
| 8 | MÖRKERSYN | Beröring | Sx1 timmar | 1 SR | E | 6 | - (willing) | - | See heat radiation: things warmer or colder than the background, for example all warm-blooded creatures. Blurrier than normal sight. Disrupted by normal light or strong heat sources nearby. | 30 |
| 9 | OSYNLIGHET | Beröring | Sx1 minuter | 1 SR | E | 6 | - (willing) | - | Each E makes 6 STO invisible. A living target can only talk and walk; fighting, running, using magic or being hurt breaks the spell. | 30 |
| 9 | SYN | Personlig | Sx1 SR | 1 SR | E | 6 | - | - | See and hear everything in a known area within 120 m (unknown: within 30 m). Each E beyond the first: look one day back in time. Touching an object: a vision of one earlier owner or one way of using it per E; each E also gives 10 % to learn the magic words that activate a magic item (one try per item until S in SYN rises). | 30 |
| 10 | ELCHOCK (F, K) | Beröring | Omedelbar | K | E | 8 | nej (F) | - | Electric discharge: 1T4 per E to everyone the caster touches or who touches him. Non-metal armour absorbs normally, metal armour only half. | 30 |
| 11 | TANKELÄSNING | Sx2 rutor | Sx1 minuter | 1 SR | E | 8 | PSY | - | Read another intelligent creature's thoughts. The victim notices nothing. | 31 |
| 12 | KONTROLLERA PERSON | Sx4 rutor | Sx1 SR | 1 SR | E | 8 | PSY (texten) | - | Control one intelligent humanoid (not animals) per E after beating each one's PSY. Only bodily movements it could normally make; nothing needing its own thought; no magic; no suicide. For anything other than collapsing, the caster must concentrate all the time (cannot fight, cast or run). If concentration breaks, victims fall into deep sleep; each SR a sleeper rolls 1T100, at or below FYS it wakes in control. | 31 |
| 12 | TELEPATI | Special | Sx1 minuter | 1 SR | E | 8 | - | - | Mind contact with one intelligent being at any distance; the caster must know its name. Each extra E: one more person. They cannot talk to each other, only through the caster. | 31 |
| 12 | TELEPORTERA | Beröring | Omedelbar | 1 SR | E | 8 | PSY om ovillig (texten) | - | Each E transports 3 STO to a place the caster knows well, max 100 m away. Each E beyond what the target needs adds 100 m. | 31 |
| 13 | MAGISK SYN | Beröring | Sx1 minuter | 1 SR | E | 10 | - (willing) | - | See things or creatures that are naturally invisible (älvor) or magically invisible (OSYNLIGHET). Immunity to spells that impair sight. | 31 |
| 14 | ORÄDD | Beröring | Sx1 minuter | 1 SR | E | 10 | - (willing) | - | The target never rolls on Skräcktabellen, whatever it meets. | 31 |

## 9. Quick reference: one casting, start to finish

```
input: caster, spell, E, target
assert not touchingIron(caster) and E <= schoolFV(spell)
cl = S(spell) - 2*(E-1) + mods
r = d20()
outcome = classify(r, cl, S)                  # perfekt / lyckat / misslyckat / fummel (3.2)
if interruptedByDamage: outcome = misslyckat
cost = {perfekt: max(1, floor(E/2)), lyckat: E, misslyckat: 1, fummel: E}[outcome]
caster.PSY -= cost                            # PSY 0 = death (3.8)
if outcome == fummel: snedtändning(d20() + E) # 5.2
if outcome in (perfekt, lyckat):
    if not physical(spell) and targetsPsyche(spell, target) and not target.willing:
        if not resist(active=caster.PSY, passive=target.PSY): return nothing   # 3.7
    schedule effect: same SR if kvick else next SR
```

## 10. Expert Magi (1987)

### 10.1 Expert differences

Expert Magi presents itself as a new magic system that replaces the magic of the older grundregler (Expert s. 2). Bok III (1991) takes over most of it word for word. Differences that matter for implementation, Expert page in brackets:

- **Entrance test** (s. 2): to become a magiker, roll 1T100 at or below INT + PSY. Failure: choose another profession.
- **Race restrictions** (s. 3): människor (alla), alver (aeims), dvärgar (emns), halvlängdsmän (i), karkioner (aeims), kentaurer (am), onaquis (imn), svanmöer (a). Letters match the initials of Animism, Elementarmagi, Illusionism, Mentalism, Nekromanti, Symbolism (interpretation). Ankor are not listed.
- **Six schools**: Animism, Elementarmagi, Illusionism, Mentalism, Nekromanti, Symbolism (s. 2). Nekromanti and Animism can never be known by the same caster (s. 3).
- **School skill** (s. 3): `Typ: LÄR, Grundegenskap: INT, Kostnad: 5, BG: 0`. Training alone or with a teacher, but always with a teacher's or academy's library.
- **Learning spells** (s. 4): same skolvärde cost table as Bok III (1–3: 2, 4–6: 4, 7–9: 6, 10–12: 8, 13–15: 10, 16–18: 12, 19–21: 14, osv.). Spells can **not** be learned by ensamträning, only from a teacher, who charges double the skill price. (Bok III allows ensamträning with a magisk kodex.) For spells made for the old rules, 3 skolvärde points equal one Svårighetsgrad.
- **Old percent conversion** (s. 3 to 4): S = percent / 5 ("HELA S12" = 60 %). School FV = the highest skolvärde among the caster's spells in that school.
- **Memory** (s. 3): same limits. Loss of consciousness from damage or magic erases all memorized spells, with no PSY-slag to save them (Bok III gives a normalt PSY-slag).
- **Casting and PSY cost** (s. 4 to 5): identical to Bok III (1 PSY per E, perfekt halves, failure costs 1, fummel costs all and snedtändning, damage breaks concentration, K spells, magic before melee, higher PSY first).
- **Pergament** (s. 5): need FV 4 in reading; reading takes **E + 1T6 minuter** (Bok III: E SR). Expert also lets a magiker *make* a pergament: S15 in the spell and FV 5 in writing; writing takes skolvärde x E minutes; costs 150 sm per minute of writing; SL rolls a hidden skill roll (fummel: hidden fatal error, automatic snedtändning for the reader); then a SIGILL must be placed. Single use; the parchment is destroyed. Rituals cannot be written this way.
- **Iron** (s. 6): stricter. Contact with only a few grams of iron, pure, alloyed or as rust, stops all spells. A magiker cannot cast while wearing iron armour or holding iron objects (weapons, tools). No 0,5 kg allowance.
- **Raising PSY** (s. 6): the same (25 - PSY) on 1T20 rule as Bok I; perfekt slag means two 1s in a row once past 24.
- **Fobi** (s. 6): a creature with a phobia, confronted with its fear, rolls for stridsmoral every SR (Bok II rules), even a player character. One who cannot flee curls up helplessly. (Bok III: roll on Skräcktabellen.)
- **Andra begränsningar** (s. 7): a magiker's kategori A skills based on STY, FYS or SMI may not exceed the attribute they are based on (SMI 14: no SMI skill above 14).
- **Range and duration conversions to the old grundregler** (s. 6 to 7): Kort (S/2 rutor) = 8 rutor; Medium (Sx2 rutor) = 20 rutor; Lång (Sx10 rutor) = 40 to 80 rutor. Omedelbar = Omedelbar and 1 SR; Sx1 SR = 10 SR; S/4 minuter = 5 min; Sx1 minuter = 15 min. Useful as default fixed values in a game.
- **Snedtändningstabell** (s. 8): same results as Bok III except: 6–11 and 12–15 refer to the "nya stridssystemet" (damage from Totala KP); 16–17 reads "Du blir stum i 1T8 dagar. Du kan bara utöva symbolism under denna tid." 20+ adds "men går över med tiden" for the phobia.
- **Combat damage in the new combat system**: ELD, FROST, BLIXT and ENERGISTRÅLE do 1T3 per E instead of 1T6 (s. 14 to 15).
- **Changed values for shared spells** (Expert vs Bok III): ELD and FROST skolvärde 3 (Bok III 6); LJUS skolvärde 3 and duration S/4 minuter (Bok III 2 and "Sx4 minuter"); FROST range S×10 rutor (Bok III "Sx10 minuter"); FINNA VATTEN range S/4 km (Bok III S/4 rutor); SPÅRLÖS duration S/4 timmar (Bok III S/4 minuter); LYFT and SKYDD range S/4 km (Bok III Sx4 and Sx2 rutor); SYN range S×10 rutor (Bok III Personlig); KONTROLLERA PERSON range S×10 rutor (Bok III Sx4 rutor). Expert has REGNSTART and REGNSTOPP where Bok III has REGNKONTROLL. In Expert, Växter only work with KONTROLLERA VARELSE. Allmänna spells have "Skola: Alla".
- **Fobitabellen** is 1T10 in Expert (s. 8), with descriptions:

| 1T10 | Beskrivning |
|---|---|
| 1 | Agorafobi. Skräck för öppna områden. Där är du utsatt för fara och kan angripas av monster från alla håll. |
| 2 | Klaustrofobi. Skräck för att bli instängd. I trånga och instängda utrymmen kan du kvävas, och väggarna kan krossa dig när de pressas samman. |
| 3 | Demofobi. Skräck för folkmassor. I folksamlingar finns det fiender, och de är ute efter dig. |
| 4 | Ailurofobi. Skräck för kattdjur. Kattdjur är farliga och äter varelser av din ras. |
| 5 | Entemofobi. Skräck för insekter. Dessa är giftiga och rovgiriga varelser som är ute efter dig. |
| 6 | Ofiofobi. Skräck för ormar. De är giftiga och gömmer sig på de mest otroliga ställen. |
| 7 | Skotofobi. Rädsla för mörker. I mörkret ruvar de mest fruktansvärda fasor. Endast med hjälp av ljus kan du hålla dem borta. |
| 8 | Dendrofobi. Skräck för träd. Träden döljer en hatisk intelligens som vill förgöra alla andra former av intelligent liv. (Denna fobi kan inte drabba skogslevande älvfolk. Slå om!) |
| 9 | Talassofobi. Skräck för havet. Det stora svallande havet stöter in över fasta land och försöker uppsluka det. Du måste hålla dig borta från kusterna för att klara dig. Havsresor är helt uteslutna. (Denna fobi kan inte drabba gråalver. Slå om!) |
| 10 | Xenofobi. Skräck för främlingar. Intelligenta varelser du inte känner kan vara representanter för fienden. Detta gäller särskilt sådana som inte är av din ras eller nationalitet. |

- **Skräcktabell** (s. 25), a different, shorter table. Creatures that cause fear themselves (drakar) or have no feelings (insektoider) never roll; undead never roll. Only the highest modifier counts; several rolls in one SR: only the hardest result.

| 1T20 | Resultat |
|---|---|
| 1–4 | Offret blir försiktigt och har minus två (−2) på alla attacker och pareringar under 1T4 SR. |
| 5 | Offret går bärsärkagång (se reglerna för detta) och rusar rakt emot orsaken till hans utbrott. |
| 6–14 | Offret flyr så fort som möjligt från skräckkällan under 3T6 SR. |
| 15 | Offret faller till marken med kroppen skakande tills skräckkällan försvinner. Därefter är han darrig i 1T4 timmar vilket innebär att SMI och alla SMI-baserade färdigheter är halverade. |
| 16–18 | Offret står helt still som om han vore paralyserad. Dessutom blir det +1 på alla efterföljande slag på denna skräcktabell under resten av samma dag. |
| 19 | Offret blir hysterisk och står kvar på platsen, skrikande av skräck tills skräckkällan försvinner och offret blir lugnat. Dessutom blir det +3 på alla efterföljande slag på denna skräcktabell under resten av samma dag. |
| 20 | Offret svimmar och faller till marken på grund av den fruktansvärda upplevelsen och förblir medvetslös i 2T8 minuter. Det finns risk för bestående men (se 23+). Dessutom blir det +3 på alla efterföljande slag på denna skräcktabell under de närmaste 1T3 dagarna. |
| 21–22 | Offret står helt paralyserad i 1T4 timmar. Det finns risk för bestående men (se 23+). Dessutom blir det +3 på alla efterföljande slag på denna skräcktabell under de närmaste 1T4 dagarna. |
| 23+ | Offret drabbas av en hjärtattack på grund av den fruktansvärda skräckupplevelsen. Offret måste slå ett normalt FYS-slag och om detta slag misslyckas så dör offret. Lyckas slaget svimmar offret och förblir medvetslös under 1T8 timmar. Det finns risk för bestående men. Slå 1T20 en gång för varje grundegenskap. Om resultatet blir 19–20 minskas grundegenskapen permanent med 1 poäng. Dessutom blir det +5 på alla efterföljande slag på denna skräcktabell under de närmaste 2T4 dagarna. |

- **Magiska föremål** (s. 30 to 32): a full making system (section 10.2.6). Items must be flawless and contain no iron (usually brons, silver or mithril). Order: place SIGILL, bind spells, PERMANENS, then NEXUS and LADDNING; a skill roll at each step, failure ruins all the magic, fummel makes everyone roll snedtändning and destroys the item. Items are not disturbed by nearby iron. Selling: about 3000 sm per E in the item, tripled for PERMANENS and tripled again for NEXUS. A hired magiker costs 1000 sm per hour and never sacrifices permanent PSY.
- **Magisk forskning** (s. 29): own laboratory about 30.000 sm and 1T10+10 months to equip. SL sets the new spell's skolvärde; research is full time, one attempt per month. (The transcription breaks off mid-sentence, so the monthly success roll is missing.)
- **Spiritus familiarus** (s. 35 to 36): ceremony burning 3 galgörtsblad and 3 svartblisterrötter in pure silver; spirit comes after 1T4+1 minutes into a prepared animal; the magiker sacrifices 1 PSY permanently. Spirit INT 1T6+8, PSY 1T6+8; limited telepathy at eye contact within 10 m; speaks the master's language at FV 3. One familiar at a time.
- **Magikers klädsel** (s. 36): Animism rött, Elementarmagi svart, Illusionism vitt, Mentalism orange, Nekromanti svart/grått, Symbolism purpur.
- **Using Expert spells with the old grundregler** (s. 36): one school per magiker; Svårighetsgrad = skolvärde / 3 rounded up; learning time and price by Svårighetsgrad:

| Svårighetsgrad | Månader | Silvermynt |
|---|---|---|
| 1 | 1 | 1000 |
| 2 | 2 | 2000 |
| 3 | 3 | 3000 |
| 4 | 4 | 4000 |
| 5 | 5 | 5000 |
| 6 | 6 | 6000 |
| 7 | 7 | 7000 |

### 10.2 Extra schools and spells in Expert Magi

Cost in every row: **PSY** = 1 per E when cast (symbols: 1 per E at activation), **Grk** = grundkostnad from the skolvärde table. "Tid" uses the same codes as section 8.

Extra spell counts in Expert: Symbolism 12, Illusionism 13, Nekromanti 15; plus 7 Animism, 12 Elementarmagi and 15 Mentalism spells that are not in Bok III; plus 8 spells and rituals for all schools.

#### 10.2.1 Symbolism (Expert s. 11 to 14)

Symbol rules:

- A symbol is drawn in a lasting material (sand, paint on a wall, etched in a window; not in water). Making it another way (wood, metal, engraving) needs a fitting hantverk at FV 4. It must be complete and undamaged; the smallest flaw ruins it.
- Drawn at an effektgrad. After drawing, a normal skill roll with the usual −2 per E beyond the first decides whether it is flawless (SL rolls hidden; on a fummel the symbolist thinks a flawed symbol is fine). Perfekt: the symbol needs half the PSY to work. A symbol works at its own E and lower. A flawed symbol cannot be fixed.
- Activation: the symbolist concentrates and feeds it 1 PSY per E. It then affects at once everyone in range who sees it with their eyes. Works like a kvick spell. Range 10 m per square decimetre of area (minimum 1 dm²). Single use.
- Only affects intelligent creatures. Resistance: symbol's E (active) vs the victim's PSY-grupp (passive) on Motståndstabellen (PSY-grupp is not defined in these files). Effect is immediate or lasts 1T6 SR per E. One symbol at a time per victim. Unsure whether someone saw it: svårt PSY-slag to avoid it.
- Glow in the dark when activated: costs 1 E set aside while drawing.
- Drawing time: area in dm² x E x 1T3 SR (E2 and 2 dm²: 4T3 SR). Making it another way: area x E x (1T4+1) days.

| SV | Namn | Räckvidd | Varaktighet | Grk | Effekt | Sida |
|---|---|---|---|---|---|---|
| 3 | OSÄKERHET | symbol | 1T6 SR/E | 2 | Viewers doubt their skills: all their CL −1 per E. | 12 |
| 4 | STOPP | symbol | 1T6 SR/E | 4 | Victims moving toward the symbol must stop and cannot come closer. | 12 |
| 5 | LOCKELSE | symbol | 1T6 SR/E | 4 | Victims walk toward the symbol to study it; they keep self-preservation and defend themselves (good for luring into traps). | 12 |
| 8 | FJÄRRSKRIFT (K) | S×1 km | Konc. | 6 | An ordinary spell, not a symbol. A message the symbolist writes appears in letters of light at another place in range. Costs 1 PSY per E every SR. 5 letters or one ideogram per SR. Symbols cannot be sent. | 13 |
| 10 | KRAFT | symbol | - | 8 | Battery for another symbol written together with it: holds E PSY, and activates the linked symbol when an exactly defined physical condition happens in sight of it. Single use; several KRAFT symbols with different conditions may be linked to one symbol. | 13 |
| 11 | BLINDHET | symbol | 1T6 SR/E | 8 | Victims lose their sight completely. | 13 |
| 12 | EPILEPSI | symbol | 1T6 SR/E | 8 | Victims fall unconscious with convulsions; no damage. | 13 |
| 13 | GLÖMSKA | symbol | Omedelbar | 10 | Victims forget E x E hours back, including anything learned; permanent. | 13 |
| 13 | VÄNSKAP | symbol | 1T6 SR/E | 10 | Victims become friendly toward the symbolist. | 13 |
| 14 | ELEMENTARSKYDD | symbol | Omedelbar | 10 | If the symbol's E beats an elementar's E on Motståndstabellen, the elementar is sent back to its home plane. | 13 |
| 15 | FRUKTAN | symbol | Omedelbar | 10 | Victims roll on Skräcktabellen, one roll per E; only the highest roll counts. | 14 |
| 16 | FRED | symbol | 1T6 SR/E | 12 | Victims forget all violent thoughts; the effect ends for a victim that is struck. | 14 |

#### 10.2.2 Illusionism (Expert s. 19 to 21)

| SV | Namn | Räckvidd | Varaktighet | Tid | Grk | Effekt | Sida |
|---|---|---|---|---|---|---|---|
| 1 | SINNESMASK | S×2 rutor | S×1 timmar | 1 SR | 2 | Target's mind seems to belong to another kind of creature when examined (VARSEBLIVNING is fooled and ignores it). No effect on Upptäcka fara. | 19 |
| 2 | DISTRAKTION (K) | S×2 rutor | Omedelbar | K | 2 | Everyone in range turns their attention to one point. Only those who see the casting may resist; victims do not notice. | 19 |
| 3 | AVBILD (F) | S×2 rutor | S×1 minuter | 1 SR | 2 | Image of a creature, object, sound, smell; obeys commands, can never harm, vanishes on contact with a living being. Seeing through it: INT vs svårighetsgrad 10, +4 per extra E spent on realism. Size 3 STO, +3 STO per E spent on it (E4: a human of STO 12). | 19 |
| 3 | SPÖKRÖST (F, K) | S×2 rutor | S×1 SR | K | 2 | Disguise one's voice beyond recognition and make it sound from any point in range. | 20 |
| 4 | DUNKEL (F) | Beröring | S/4 minuter | 1 SR | 4 | Target looks blurred: per E, attackers get −1 CL in melee, −2 CL at range, −2 CL on Finna dolda ting to find it. | 20 |
| 5 | RÖRA SIG LJUDLÖST | Beröring | S/4 minuter | 1 SR | 4 | One creature and its gear move in total silence whatever it does; it keeps its voice. | 20 |
| 6 | SNUBBLA (K) | S×2 rutor | Omedelbar | K | 4 | Victim trips at once and falls flat in a direction the caster chooses. | 20 |
| 9 | FÖRVIRRA | S×10 rutor | S/4 minuter | 1 SR | 6 | Victim is confused and just stands still, but defends itself fully if attacked or threatened. | 20 |
| 11 | FÖRTROLLAD SÖMN | S×10 rutor | S×1 timmar | 1 SR | 8 | Puts one creature that can sleep to sleep per E; also 1 E per 20 STO beyond the first 20. Cannot be woken. | 20 |
| 11 | TYSTNAD (F) | S×2 rutor | S/4 minuter | 1 SR | 8 | One ruta per E becomes completely silent; spellcasting inside is impossible (spells need the voice). | 20 |
| 16 | ILLUSION (F) | S×2 rutor | S×1 minuter | 1 SR | 12 | As AVBILD, but does not vanish on contact, only when seen through. Can deal damage and kill someone who does not see through it. A creature illusion has its stats and combat skills, but never better skills than the caster's own (often only baschans). | 20 |
| 17 | AURA | Beröring | S/4 timmar | 1 SR | 12 | Aura of power and glory: anyone who wants to act with hostility against the target must beat the spell's E with their PSY-grupp. | 21 |
| 19 | FATA MORGANA (STOR ILLUSION) (F, R) | S×10 rutor | S/4 veckor | R | 14 | Huge illusion of buildings, wealth and people (table below), fooling all five senses. Ends at the end of its duration or when another FATA MORGANA beats it E vs E. SANNSYN and SANNHÖRSEL protect temporarily; afterwards one can only ignore it with an INT-slag when acting against it. | 21 |

FATA MORGANA (Expert s. 21):

| Grad | Byggnad | Förmögenhetsvärde (sm) | Antal personer i människostorlek |
|---|---|---|---|
| 1 | Litet skjul | 100 | 1 |
| 2 | | 250 | 2 |
| 3 | Liten stuga | 500 | 4 |
| 4 | | 1.000 | 8 |
| 5 | Normal stuga | 2.500 | 16 |
| 6 | | 5.000 | 32 |
| 7 | Stor stuga | 10.000 | 64 |
| 8 | | 25.000 | 128 |
| 9 | Gård | 50.000 | 256 |
| 10 | | 100.000 | 512 |
| 11 | Herrgård | 250.000 | 1024 |
| 13 | Litet slott | 1.000.000 | 2048 |
| 15 | Stort slott | 5.000.000 | 4096 |
| 17 | Jättepalats | 25.000.000 | 8192 |

#### 10.2.3 Nekromanti (Expert s. 22 to 25)

| SV | Namn | Räckvidd | Varaktighet | Tid | Grk | Effekt | Sida |
|---|---|---|---|---|---|---|---|
| 2 | BESUDLA | Beröring | Omedelbar | 1 SR | 2 | Spoils 1 liter of liquid or solid matter so it is useless or harmful to the living (fresh food rots, water undrinkable). | 22 |
| 7 | PARALYSERING | S×2 rutor | S×1 minuter | 1 SR | 6 | Victim is completely paralysed. Needs 1 E per 20 STO of the victim. | 22 |
| 8 | KONTROLLERA LÄGRE ODÖD | S×2 rutor | Konc. | 1 SR | 6 | Control one skelett, zombie or likätare, +1 per extra E. Can break another caster's control: caster's PSY must first beat the controller's PSY. Casting it again on a controlled undead lays it to rest for ever. | 22 |
| 9 | RÄDSLA (K) | S×2 rutor | Omedelbar | K | 6 | Victim rolls on Skräcktabellen if it fails a normal stridsmoralslag; if it passes it is nervous 1T4 SR (−1 GL per E). No effect on undead or creatures without INT. Player characters also roll. | 22 |
| 10 | BLINDHET | S×2 rutor | S×1 SR | 1 SR | 8 | Victim loses its sight. | 23 |
| 11 | TALA MED DÖD | S/2 rutor | särskild | 1 SR | 8 | At the place of death or burial, knowing the name and language: the soul appears and answers one question per E, with yes/no or a riddle or rhyme. Not with undead. | 23 |
| 12 | ANIMERA DÖD (R) | Beröring | S/4 veckor (mumier P) | R | 8 | Animates a corpse as an undead slave: skelett, zombie (dead at most one month) or mumie (properly embalmed with Balsamering FV 3 to 5; animated as a magic item with SIGILL, PERMANENS, NEXUS, so permanent). Stats = living stats x multiplier (table below), round up; E above 5 use column 5. Also costs 1 grad per 20 STO. Its PSY = PSY spent. Keeps non-INT skills; STY and SMI skills multiplied too. Obeys orders within sight and hearing. | 23 |
| 13 | PANIK | S×2 rutor | Omedelbar | 1 SR | 10 | Skräcktabellen on a failed svårt stridsmoralslag; nervous 1T6 SR on a pass. Lower undead: normal PSY-slag or flee 1T6 SR per E. No effect on higher undead or creatures without INT. | 24 |
| 14 | KONTROLLERA ANDAR | S×2 rutor | Konc | 1 SR | 10 | As KONTROLLERA LÄGRE ODÖD, for restless spirits (spöken, gastar, vålnader). | 24 |
| 14 | SMÄRTA | S×10 rutor | S×1 SR | 1 SR | 10 | Severe pain: STY, SMI (and their skills) and förflyttning halved. FYS-slag every SR; after one failure the victim can do nothing for the rest of the duration. | 24 |
| 15 | TERROR | S×2 rutor | Omedelbar | 1 SR | 10 | All in range: failed svårt stridsmoralslag means Skräcktabellen with +10; a pass means nervous 1T20 SR. Lower undead: svårt PSY-slag or flee; higher undead: normal PSY-slag or flee. Spirits immune; no effect on creatures without INT. | 24 |
| 16 | DÖDSHAND (F) | S×10 rutor | särskild | 1 SR | 12 | Claws at the victim's heart from afar: 1T6 damage every SR, lasting 1 SR per E. Armour does not protect; protective spells work fully. | 24 |
| 17 | KONTROLLERA HÖGRE ODÖD | S×2 rutor | Konc. | 1 SR | 12 | As KONTROLLERA LÄGRE ODÖD, for vampyrer and mumier. | 24 |
| 18 | VOODOORITUAL (R, F) | special | Konc. | R | 12 | Wax doll containing something from the victim's body is tortured; the victim writhes helplessly in pain, takes no damage, is unharmed when it stops. Range E1 10 m, E2 100 m, E3 1.000 m, E4 10.000 m, E5 100.000 m and so on; location need not be known. | 24 |
| 18 | LIVSUTTÖMNING | Beröring | Omedelbar | 1 SR | 12 | Drains an intelligent victim: its PSY −2 per E, moved to the caster (who loses them at 1 per hour if unused). Victim dies at 0; otherwise regains them normally. | 25 |

ANIMERA DÖD multipliers (Expert s. 23):

| Skelett, grad | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|
| STY | 0,4 | 0,8 | 1,2 | 1,6 | 2,0 |
| SMI | 0,2 | 0,4 | 0,6 | 0,8 | 1,0 |
| INT | 0,05 | 0,10 | 0,15 | 0,20 | 0,25 |

| Zombie, grad | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|
| STY | 0,6 | 1,2 | 1,8 | 2,4 | 3,0 |
| SMI | 0,1 | 0,2 | 0,3 | 0,4 | 0,5 |
| INT | 0,05 | 0,10 | 0,15 | 0,20 | 0,25 |

| Mumie, grad | 1 1) | 2 1) | 3 2) | 4 2) | 5 3) |
|---|---|---|---|---|---|
| STY | 1,2 | 2,4 | 3,6 | 4,8 | 6,0 |
| SMI | 0,1 | 0,2 | 0,3 | 0,4 | 0,5 |
| INT | 0,2 | 0,4 | 0,6 | 0,8 | 1,0 |

1) Balsameraren måste ha FV 3 i sitt hantverk. 2) Balsameraren måste ha FV 4 i sitt hantverk. 3) Balsameraren måste ha FV 5 i sitt hantverk.

#### 10.2.4 Expert spells in Animism, Elementarmagi and Mentalism that are not in Bok III

| Skola | SV | Namn | Räckvidd | Varaktighet | Grk | Effekt | Sida |
|---|---|---|---|---|---|---|---|
| A | 3 | RENA | Beröring | Omedelbar | 2 | Purifies 1 liter of liquid, gas or solid per E of everything harmful to the caster (poison, bacteria). Elves are immune to disease, so an elf's purified food may still harm a human. A magic drink: beat its E. | 9 |
| A | 8 | VÄDERFÖRUTSÄGELSE | S×1 km | Omedelbar | 6 | Predicts the natural weather one dygn ahead per E (not magical weather changes). | 9 |
| A | 13 | REGNSTART | S/4 km | S×1 minuter | 10 | All clouds in range start dense rain. Against REGNSTOPP or another spell: effektgradsstrid. Clouds at 1T3×500 m. | 10 |
| A | 13 | REGNSTOPP | S/4 km | S×1 minuter | 10 | Stops all rain in range; magical rain needs an effektgradsstrid. | 10 |
| A | 17 | SNABBVÄX | Beröring | Omedelbar | 12 | A plant grows to full size and glory in one dygn, if it has room; +1 plant per extra E. Caster picks the state of fruit and flowers. | 10 |
| A | 18 | HÄVA FÖRSTENING (F, R) | Beröring | Omedelbar | 12 | Restores a living creature turned to stone (basilisk, gorgon). | 10 |
| A | 19 | VÄDERKONTROLL (R) | S×1 km | Special | 14 | Any weather fitting the season. Each hour of ritual gives 6 hours of weather (exception to ritual time). Roll after the first hour; failure: stop, may restart. Weather builds over 6 hours. Max FYS/2 hours, then exhausted. | 10 |
| E | 3 | STENVÄGG (F) | S/2 rutor | S/4 minuter | 2 | Printed only as "Se grundreglerna"; not described in either file. | 15 |
| E | 5, 10, 13, 16 | GASMOLN (F) | S×10 rutor | S×1 minuter | 4, 8, 10, 12 | Four separate spells: Äcklande 5, Irriterande 10, Sövande 13, Giftig 16. Cloud 100 m³ per E spent on size; 1T4 giftstyrka per E spent on strength. Victims resist giftstyrka with FYS on Motståndstabellen. Effects outside brackets hit everyone in the cloud; bracketed effects only those who fail (table below). | 15 |
| E | 10 | VATTENVÄG | Beröring | S×1 minuter | 8 | Walk on water as on firm ground, with all carried gear. | 16 |
| E | 10 | ELDVÄG | Beröring | S×1 minuter | 8 | Stay in natural fire unharmed, with carried gear (dragon fire is not natural). | 16 |
| E | 10 | JORDVÄG | Beröring | S×1 minuter | 8 | Move through any non-magic solid matter except iron and lead, max 3 rutor per SR, with carried gear. | 16 |
| E | 10 | LUFTVÄG | Beröring | S×1 minuter | 8 | Move freely through the air, 2 rutor/SR per E, with carried gear. | 16 |
| E | 10 | LJUSVÄG | Beröring | S×1 minuter | 8 | Becomes a 5 cm ball of white light moving 150 rutor/SR through anything that lets light through (air, glass, water; not metal or stone), with gear. A MÖRKER that bewitches the ball destroys the person (here MÖRKER does not count as (F)). | 16 |
| E | 10 | MÖRKERVÄG | Beröring | S×1 minuter | 8 | Merges with darkness and moves unseen, even by mörkersyn; gains mörkersyn. Breaks within 3 m of a light source. Seen by MAGISK SYN; found by Upptäcka fara and VARSEBLIVNING. | 17 |
| E | 10 | KÖLDVÄG | Beröring | S×1 minuter | 8 | Unaffected by natural cold, gear included (a Glacial's cold is not natural). | 17 |
| E | 10 | ÅTERFINNA | S×2 rutor | Omedelbar | 8 | Distance and direction to an object owned for at least one dygn, if in range; +1 object per extra E. | 17 |
| E | 12 | MAGNESIUMFLAMMA (F, K) | S×2 rutor | Omedelbar | 8 | All who look toward the caster: svårt PSY-slag or blinded 1T4 SR (+1 SR per extra E): −10 GL to hit and half förflyttning. Not the caster. | 17 |
| E | 18 | IDENTIFIKATION | Personlig | Omedelbar | 12 | Identifies all dead inorganic materials (metals, gems) in an object and their amounts; not value or magic. | 17 |
| M | 1 | ORIENTERING | Personlig | S×1 timmar | 2 | Cannot lose one's bearings; always knows the four directions. | 26 |
| M | 4 | BALANS | Beröring | S/4 timmar | 4 | Perfect balance; lands on the feet in a fall; immune to SNUBBLA; SPRÅNG landings safe. | 26 |
| M | 5 | HJÄRNBLANK | S×10 rutor | S/4 timmar | 4 | Target's mind cannot be observed: immune to VARSEBLIVNING (like SINNESMASK), blocks TANKEÖVERFÖRING. No effect on Upptäcka fara. | 26 |
| M | 5 | HÖRSEL | Beröring | S/4 timmar | 4 | +2 CL per E on Lyssna. | 27 |
| M | 5 | SNABBHET | S×2 rutor | S×1 minuter | 4 | +2 per E to förflyttning, SMI and SMI-based skills. | 27 |
| M | 5 | LÅNGSAMHET | S×2 rutor | S×1 minuter | 4 | −2 per E to förflyttning, SMI and SMI-based skills. | 27 |
| M | 6 | LUNGFILTER | Beröring | S×1 timmar | 4 | Breathe any atmosphere with enough free oxygen, whatever poison gas is in it. | 27 |
| M | 6 | VATTENSYN | Beröring | S×1 timmar | 4 | Clear film over the eyes: see underwater, also usable in gas clouds. | 27 |
| M | 8 | ÖGONMÅTT | Personlig | Omedelbar | 6 | Judge distances, areas and volumes exactly by eye (only what can be seen). | 28 |
| M | 11 | SANNSYN | S×10 rutor | S/4 minuter | 8 | Sees through all visual illusions and AVBILD, including FATA MORGANA. | 28 |
| M | 11 | SANNHÖRSEL | S×10 rutor | S/4 minuter | 8 | Sees through all false sounds and buktaleri, including FATA MORGANA, and every lie heard. Still affected by silence spells. | 28 |
| M | 13 | MINNE | Beröring | Omedelbar | 10 | Remembers everything from a period of 1 dygn per E; does not restore magical memory loss. | 28 |
| M | 15 | FJÄRRSYN | Beröring | S/4 timmar | 10 | Telescope eyes: apparent distance /10 per E (E3: 1000 m seen as 1 m). Straight lines only. | 29 |
| M | 16 | ÅTERVÄNDO | Personlig | Omedelbar | 12 | Teleports the caster to a consecrated return place (one-day ceremony, always succeeds). Range 1=10 km, 2=100 km, 3=1000 km, 4=10000 km and so on. Number of places by S (table below). | 29 |
| M | 19 | ÅTERVÄNDO MED STUDS | Personlig | Omedelbar | 14 | As ÅTERVÄNDO, but stays up to E minutes at the return place, then returns to the start. | 29 |

GASMOLN effects (Expert s. 15). Bracketed effects only hit those who fail to resist the giftstyrka.

| Gastyp | Färg | Effekt |
|---|---|---|
| Äcklande | Grön | Illamående. Luktsinnet sätts ur spel medan man befinner sig i molnet, och under 2T6 SR efter det att man lämnat molnet. (Kräkningar, som tvingar varelsen till att bara stå stilla och spy under 1T4 SR.) |
| Irriterande | Gul | Ögonen tåras. Alla uppmärksamhetsfärdigheter får −10 GL medan man är i molnet och under 2T6 SR efter det att man lämnat molnet. (Temporär blindhet under tiden man är i molnet och under 2T6+6 SR efter det att man lämnat molnet. Våldsam klåda som varar tills man tagit av sig alla kläder och torkat av kroppen. Klådans effekt är att SMI och alla SMIbaserade färdigheter halveras.) |
| Sövande | Osynlig | Yrsel som minskar SMI och alla SMIbaserade färdigheter till 1 så länge man är i molnet och under 2T6 minuter efter det att man lämnat molnet. Förflyttningsförmågan halveras under samma tid. (Sömn under 1T4+1 timmar.) |
| Giftig | Gråblå | Ett giftmoln fungerar som ett vanligt gift. |

ÅTERVÄNDO (Expert s. 29):

| Skicklighetsvärde | Antal platser |
|---|---|
| 1–5 | 1 |
| 6–10 | 2 |
| 11–15 | 3 |
| 16–20 | 4 |
| osv. | |

#### 10.2.5 Expert additions to the elementars (Expert s. 17 to 18)

Same stats as Bok III (STO 1T6, SMI 3T6, PSY 3T6 at E1, +1T6 STO and PSY per extra E). Expert knows seven elements (no Therm) and adds: "En Salamander kan förstöra en Glacial genom att övervinna den på motståndstabellen."

#### 10.2.6 Spells and rituals for all schools: magic items, travel, long life (Expert s. 30 to 35)

| SV | Namn | Räckvidd | Varaktighet | Grk | Effekt | Sida |
|---|---|---|---|---|---|---|
| 14 | LADDNING (R) | Beröring | Permanent | 10 | PSY battery in an item: 5 PSY per E. The magiker regains the moved PSY as if he had cast a spell. Once per item; common in staffs and jewellery. | 30 |
| 17 | SIGILL | Beröring | Tills den aktiveras. | 12 | Each E binds one E of another spell. A finger-drawn pentagram (invisible unless drawn to show) plus a trigger condition (touching it, casting at it). Bound spells count as S10 for range and duration. Felt by Upptäcka fara or VARSEBLIVNING. Broken by its trigger, or by ÖPPNA or SKINGRA, which also release the spell. A normal SIGILL ends when broken. | 30 |
| 19 | PERMANENS (R) | Beröring | Permanent | 14 | Makes a SIGILL permanent (as many E of SIGILL as its own E): it no longer ends when triggered. A present magiker must sacrifice 1 PSY permanently. | 30 to 31 |
| 20 | NEXUS (R) | Beröring | Permanent | 14 | The item draws power from nature, not from the user's PSY. Needs 1 E per spell it supports (SIGILL included, PERMANENS and NEXUS excluded). Some magiker sacrifices 1 PSY per E permanently. Never on LADDNING. One NEXUS per item. | 31 |
| 16 | AVLÄSA MAGI (R) | Beröring | Omedelbar | 12 | One item or creature at a time. (S in the ritual + its E) must beat the total E in the item: identifies all its spells and their E. Then to use the item: meditate a whole day and beat the sum of its E with one's PSY; retry after a night's sleep. Several people can master one item. | 31 |
| 17 | SKINGRINGSRITUAL (R) | Beröring | Omedelbar | 12 | 3 x the ritual's E must beat the sum of the item's E: its magic is dispelled for ever. Failure: one roll on Snedtändningstabellen; fummel: two rolls. | 32 |
| 16 | TRANSFER (R) | Special | Omedelbar | 12 | Moves 2 living creatures per E (the caster may be one) to another universe through the spiritual plane; all must touch the caster. Fummel: wrong universe. | 34 |
| 17 | LIVSFÖRLÄNGNING (R) | Personlig | special | 12 | One month of undisturbed work per E, with one dose of stjärnedryck and one of sarasso every day. Success halts ageing 1T4+4 years per E (SL rolls hidden). Cannot rejuvenate. Failure: normalt PSY-slag or FYS −1 permanently. Fummel: snedtändning and ages one year. | 34 to 35 |

Known Expert magic items (s. 32 to 33), as examples of item construction: ALADDINS FLYGANDE MATTA (two LYFT E5, two SIGILL E5, two PERMANENS E5, NEXUS E4; lifts 27 STO), KHEREK TZORS ELDSVÄRD (mithril bredsvärd, ELD E3, SIGILL E3, PERMANENS E3; flames for +3T6 damage at 3 PSY per SR), AKILLES SKÖLD (FÖRTROLLA VAPEN E2, SKYDD E2, MAGNESIUMFLAMMA E2, each with SIGILL and PERMANENS), AUTOLYKOS KÄNGOR (each boot RÖRA SIG LJUDLÖST E1, SIGILL E1, PERMANENS E1; tap three times), ANGUVARDEL (FÖRTROLLA VAPEN E3, SIGILL E3, PERMANENS E3, NEXUS E2), NARSIL/ANDURIL (FÖRTROLLA VAPEN E2, SIGILL E2, PERMANENS E2, NEXUS E2), LOKES SKOR (LUFTVÄG E1, VATTENVÄG E1, KÖLDVÄG E1, three SIGILL E1, three PERMANENS E1, NEXUS E6).

### 10.3 Droger & Växter (Expert s. 37 to 41; chapter title page s. 37)

"I sagovärlden finns det många droger och gifter man kan utvinna ur allehanda växter eller djur." Field template (s. 38):

| Fält | Betydelse |
|---|---|
| Effekt | Här står vad drogen gör. |
| Form | Drogens form (vätska, dryck, etc). |
| Konsumtion | Hur man intager drogen. |
| Väntetid | Den tid det tar innan drogen börjar verka. |
| Verkningstid | Så länge varar drogens fulla effekt. |
| Väntetid (andra) | Den tid det tar efter drogeffekten har avklingat tills efterverkningarna börjar. |
| Efterverkningstid | Så länge varar efterverkningarna. |
| Efterverkning | Här beskrivs drogens negativa efterverkningar. |
| Ingredienser | Här beskrivs vilka material som behövs för att framställa en dos av drogen (örter, djurdelar och mineraler). |
| Färdighet | Här anges vilken färdighet som krävs för framställningen. Står det flera färdigheter tar man den man behärskar bäst. Den som framställer drogen måste slå ett färdighetsslag för att drogen ska ge önskad effekt. Slår han ett särskilt slag blir drogen 25% bättre, och slår han ett perfekt slag blir drogen 50% bättre. Ett fummelslag innebär att framställaren har råkat skada sig själv under arbetet. |

#### 10.3.1 Droger and gifter

In the rows below, "Väntetid 1" is the delay before the effect, "Väntetid 2" the delay before the after-effects.

| Namn | Effekt | Form | Konsumtion | Väntetid 1 | Verkningstid | Väntetid 2 | Efterverkningstid | Efterverkning | Ingredienser | Färdighet | Sida |
|---|---|---|---|---|---|---|---|---|---|---|---|
| CELLI | Läker 1 KP varannan timme. | Vitt pulver. | Blandas med vatten och drickes. | 1 timme | 1T8+10 timmar | - | - | (not listed) | En lök från svanblomman, 10 gr blad från korsört (plockade under sommaren). | Drogkunskap, Läkedrogskunskap. | 38 |
| DURAGOS | Förhindrar och botar alla sorters sårinfektioner. | Salva. | Smörjes på sår. | - | 1 dygn. | - | - | (not listed) | 23 gr korsörtsrot (plockad under hösten). | Drogkunskap, Läkedrogskunskap. | 38 |
| LILIANSBLAD | Under verkningstiden kan brukaren uthärda kroppsansträngning dubbelt så bra. | Blad konserverade i gelé. | Tuggning. | 1T10 minuter. | 1T4+1 timmar. | 1T10+30 min. | 2T4 timmar. | Darrighet (SMI och alla SMI-baserade färdigheter halveras). | 30 gr blad från liliansörten (plockade under senvaren), och en gelé innehållande 5 gr korsörtsblad (plockade under sommaren). | Drogkunskap. | 38 |
| KARSONOLJA | Kroppens resistans mot kyla förbättras. En välklädd person kan ignorera kyla ner till −30° C. I gengäld luktar man så illa att man automatiskt blir upptäckt om man kommer inom fem meter från en varelse med luktsinne. Dessutom kan man inte använda sitt eget luktsinne under verkningstiden. | Olja. | Insmörjes på kroppen. | 0 | 1T4+20 timmar. | - | - | - | Karson är en bison som lever i polarområden. Ur dess fett kan man brygga karsonolja. Från ett vuxet djur kan man utvinna tre doser olja, från en kalv en dos. | Drogkunskap. | 38 |
| SVARTBLOD (gift) | Skada (se gift i grundreglerna). | Trögflytande svart vätska. | Förtärs med föda eller dryck, eller genom sår. | 1T4 SR. | Se gift i grundreglerna. | - | - | - | 10 cl magsaft från flygödla. 2 krossade matikoratänder. Giftstyrka 1T4+13. Giftet har en bitter smak, vilket gör att en brukare kan upptäcka det i mat eller dryck. Slå för Provsmaka eller Upptäcka Fara om giftet har blandats i kryddstark föda. Har giftet blandats i föda som inte smakar särskilt mycket upptäcker den som äter det en främmande bitter smak utan att behöva slå tärning. Giftet kan smetas på vapen. En mantikora har 1T20+20 tänder. En flygödla har 1T10+10 cl magsaft. | Drogkunskap, giftkunskap. | 38 to 39 |
| CANAS | En dos motsvarar en dagsranson föda. | Hård brödkaka. | Äts. | - | 1 dygn. | - | - | - | 100 gr mjöl från gyllensäd, samt vanliga bakingredienser. | Drogkunskap. | 39 |
| SARRASSOS | Kroppens sinnen blir känsligare och mer skärpta (+5 på alla uppfattningsfärdigheter). Nackdelen är att om de påverkade personen utsätts för en stark sinnesförnimmelse (bländande ljus, buller, etc) måste han slå ett svårt PSY-kast eller står bedövad 1T3 SR, oförmögen att göra någonting aktivt. | Pulver. | Inhaleras. | 1T6 SR. | 1T10+10 minuter. | 1T4 minuter. | 1T10+10 minuter. | Darrighet (SMI och alla SMI-baserade färdigheter halveras). | 3 gr pollen från purpursippa (endast tillgänglig under senvåren). Pollendosen kräver 100 blommor. | Drogkunskap. | 39 |
| STJÄRNEDRYCK | Tankeförmågan skärps (INT ökar 1T4 poäng). | Vätska. | Dricks. | 2T4 minuter. | 1T20+60 minuter. | 1T6+10 minuter. | 1T20+120 minuter. | Brukaren faller i sömn. | 25 gr davidsblomma (plockad under våren) och 7 gr tårbuskbär (plockade under sensommaren). | Drogkunskap. | 39 |
| STRIDSDRYCK | STY höjs med 1T6, SMI med 1T4. STY- och SMIbaserade färdigheter höjs med lika mycket som SMI. Förflyttningsförmågan höjs med 2. | Vätska. | Drickes. | 1T6 minuter. | 1T4+15 minuter. | 1T6 minuter. | 1T6+20 minuter. | Darrighet och slöhet (Förflyttningsförmågan, INT, SMI och färdigheter baserade på dessa halveras). | 5 tänder från en kimeras lejonhuvud. Det finns 1T20+30 tänder per huvud. | Drogkunskap. | 39 |
| ERISINON (gift) | Våldsamma hallucinationer. | Grönt pulver. | Blandas med vatten och dricks. | 1T3 minuter. | 1T10+10 minuter (halveras om man klarar giftslaget). | - | - | - | 3 frukter från gyllenbusken (plockade under sensommaren). Giftstyrka 10. | Drogkunskap, giftkunskap. | 39 |
| SMAUGIFONIA | Under verkningstiden hävs gradvis alla kramp-, skräck- och ångesttillstånd brukaren befinner sig i. Det gäller även sådana som är skapade av magi. | Dryck. | Dricks. | 1T3 minuter. | 1T4 minuter. | 0 | 1T4+2 timmar. | När verkningstiden är över faller brukaren helt avslappad i sömn i 1T4+3 timmar. När han vaknar är han återställd. | 5 drakbär (plockade under högsommaren). | Drogkunskap, Läkedrogskunskap. | 40 |
| REKUPERA (gift) | Djup sömn. | Blått pulver. | Intages med mat eller dryck. | 1T6 minuter. | 1T6+6 timmar (halveras om man klarar giftslaget). | 0 | 1T4 timmar (halveras om man klarar giftslaget). | Huvudvärk och slöhet. SMI, INT och deras färdigheter minskas till hälften (avrunda nedåt). | 10 drakbär (plockade under högsommaren) och 10 gr korsörtsblad (plockade under sommaren). | Drogkunskap, läkedrogskunskap, giftkunskap. Drogens styrka är 1T6+FV. | 40 |

Spelling as printed: "SARRASSOS" in the heading, "sarasso" in LIVSFÖRLÄNGNING, "Sarassos" in the price list; "CANAS" in the heading, "Ganas" in the price list.

#### 10.3.2 Växter

| Namn | Typ | Vanlighet | Klimatzon | Växtplats | Lövform | Lövfärg (höstfärg) | Blomtyp | Blomfärg | Blomningstid | Frukttyp | Fruktfärg | Frukttid | Delar som används för droger | Sida |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| DRAKTRÄD | Träd. | Sällsynt. | Tempererad. | Torra bergssluttningar. | Lönnliknande, fast taggigare. | Mörkt purpur (svarta). | Körsbärsliknande. | Mörkblå. | Senvår. | Stora lingon (mycket söta). | Röd. | Högsommar. | Bär. | 40 |
| SVANBLOMMA | Ört. | Ovanlig. | Subtropisk. | Fält och ängar. | Liljeliknande. | Grön (brun). | Lilja. | Vit. | Senvår, försommar. | - | - | - | Rotlöken. | 40 |
| KORSÖRT | Ört. | Vanlig. | Subarktisk. | Sumpmarker. | Korsformade. | Grön (brun). | Sippa. | Röd. | Sommar. | - | - | - | Blad, rot. | 40 |
| LILIANSÖRT | Ört. | Sällsynt. | Subtropisk. | Pinjeskogar. | Tulpanformade. | Grön (grön). | Tulpanliknande. | Gulgrön. | Tidig vår. | - | - | - | Blad. | 40 |
| DAVIDSBLOMMA | Ört. | Ovanlig. | Tempererad. | Havsstränder. | Sexuddiga. | Grön (rödbrun). | Hundkäxliknande. | Gul. | Vår. | - | - | - | Blomma. | 40 to 41 |
| TÅRBUSKE | Yvig buske. | Ovanlig. | Tempererad. | Sandiga skogar. | Rund. | Grön (orange). | Körsbärsliknande. | Ljusblå. | Senvår. | Körsbärsliknande. | Blå-violett. | Sensommar. | Bär. | 41 |
| GYLLENBUSKE | Buske. | Mycket sällsynt. | Tempererad och subtropisk. | Öppna skogar. | Barr. | Gyllengul (gyllengul). | Små och betydelselösa. | Grön. | Försommar | Hallonlik. | Orange. | Sensommar. | Bär. | 41 |
| GYLLENSÄD | Sädesgräs. | Mycket sällsynt i vilt tillstånd. Gyllensäd odlas systematisk av skogsalver. | Tempererad. | Fält och ängar. | Ointressant. | Ointressant. | Ointressant. | Ointressant. | Ointressant. | Sädesax. | Gyllengul. | Höst. | Ax. | 41 |
| PURPURSIPPA | Ört. | Mycket sällsynt. | Subarktisk. | Å- och bäckstränder. | Långsmala. | Grön (brun). | Stor sippliknande. | Purpur. | Senvår. | - | - | - | Pollen. | 41 |
| SVARTBLISTER | Ört | Sällsynt | Arktisk | Sjöstränder | Maskrosformade | Svart (svart) | Maskrosliknande | Blå | Högsommar | - | - | - | Rot, som plockas på senhösten. | 41 |
| GALGÖRT | Ört | Mycket sällsynt | Tempererad | Före detta avrättningsplatser. | Runda | Grön (brun) | Rosliknande | Vinröd | Högsommar | - | - | - | Blad. | 41 |

### 10.4 Utrustning (Expert s. 42 to 48)

"I detta avsnitt finner du utrustningslistor för allt möjligt. Listorna är uppdelade efter ämne. Alla priser är i silvermynt och vikter i BEP, där inte annat anges." (s. 43). Page 42 is a picture only.

#### 10.4.1 Bärförmåga (s. 43)

"En rollpersons normala bärförmåga är lika med 8 x 10% x STY antal BEP. Om han bär mer än detta tvingas han gå långsammare. Det är möjligt för en person att lasta på sig rejält, mer än vad han obehindrat kan bära. Men även lättare bördor kan vara hindrande i vissa situationer. Bördor påverkar förflyttningsförmågan, SMI och SMIbaserade färdigheter. Vanliga kläder som en rollperson bär tas inte med vid beräkningen av bördan."

| Börda | Förflyttningsminskning | CL- & SMI-minskning |
|---|---|---|
| 0,0–0,5 xSTY | ±0 | ±0 |
| 0,5–1,0 xSTY 1) | −20% | −1 |
| 1,0–1,5 xSTY 1) | −40% | −3 |
| 1,5–2,0 xSTY 1) | −60% | −7 2) |

1) Med denna börda kan rollpersonen inte simma. 2) Inga SMI-baserade färdigheter kan användas.

#### 10.4.2 Diverse verktyg (s. 43)

| Namn | Vikt | Pris |
|---|---|---|
| Träsåg | 1 | 60 |
| Snickarhammare | 1/2 | 18 |
| Trähammare | 1/2 | 2 |
| Handyxa | 1 | 40 |
| Skogsyxa | 1 | 75 |
| Järnborrar (5 st) | 1/2 | 50 |
| Stämjärn | 1/2 | 25 |
| Murslev | 1/2 | 40 |
| Stenborr | 1 | 50 |
| Kofot | 1 | 25 |
| Småspik (100 st) | 1/2 | 75 |
| Grov spik (10 st) | 1/2 | 50 |
| Skruv (10 st) | 1/2 | 100 |
| Skruvmejsel | 1/4 | 15 |
| Hovtång | 1/4 | 20 |
| Järnkilar (3 st) | 1/2 | 15 |
| Trälim (1/2 liter) | 1/2 | 4 |
| Färg (4 liter) | 2 | 35 |
| Trätumstock (1 m) | 1/2 | 7 |
| Vinkelhake | 1 | 12 |

| Namn | Vikt | Pris |
|---|---|---|
| Fisklina (10 m) | 1/4 | 1 |
| Fiskkrokar (10 st) | 1/4 | 10 |
| Hacka | 1 | 125 |
| Skyffel | 1 | 40 |
| Spade | 1 | 75 |
| Skära | 1 | 40 |
| Lie | 1 | 60 |
| Högafvel | 1 | 60 |
| Plogblad av järn | 4 | 190 |
| Slägga | 2 | 40 |
| Bärbart städ | 3 | 190 |
| Normalt städ | 8 | 625 |
| Liten blåsbälg | 1 | 90 |
| Stor blåsbälg | 4 | 190 |
| Bärbar smedja | 16 | 625 |
| Smedja | 170 | 1870 |
| Liten griptång | 1 | 25 |
| Stor griptång | 1 | 50 |
| Järntacka | 4 | 75 |
| Koppartacka | 4 | 250 |
| Bly tacka | 4 | 60 |
| 1/2 tums rep | 2 | 12 |
| 1 tums rep | 4 | 25 |
| Kedja | 1 | 80 |
| Kraftig kedja | 2 | 250 |
| Trästege | 4 | 60 |
| Repstege | 1 | 30 |
| Änterhake | 1/2 | 25 |
| Sax | 1/4 | 50 |

#### 10.4.3 Kokutrustning (s. 44)

| Namn | Vikt | Pris |
|---|---|---|
| Stekpanna i järn, Liten | 1 | 15 |
| Stekpanna i järn, Stor | 1 | 40 |
| Järngryta (1 liter) | 1 | 15 |
| Järngryta (2 liter) | 1 | 25 |
| Järngryta (4 liter) | 2 | 45 |
| Järnkittel (20 liter) | 4 | 225 |
| Järnkittel (40 liter) | 8 | 500 |
| Järnkittel (100 liter) | 21 | 1250 |
| Järnkittel (200 liter) | 41 | 2500 |
| Träsked | - | 1 |
| Kniv i tenn | - | 7 |
| Kniv i silver | - | 50 |
| Kniv i guld | - | 750 |
| Sked i tenn | - | 7 |
| Sked i silver | - | 50 |
| Sked i guld | - | 750 |
| Gaffel i tenn | - | 10 |
| Gaffel i silver | - | 75 |
| Gaffel i guld | - | 875 |
| Slev i trä | 1/4 | 15 km |
| Slev i tenn | 1/4 | 25 |
| Slev i silver | 1/4 | 75 |
| Slev i guld | 1/4 | 1500 |
| Tallrik i trä | 1/4 | 12 km |
| Tallrik i tenn | 1/4 | 25 |
| Tallrik i silver | 1/4 | 190 |
| Tallrik i guld | 1/4 | 3750 |
| Tallrik i lergods | 1/4 | 25 km |
| Tallrik i porslin | 1/4 | 60 |
| Trämugg | 1/4 | 12 km |
| Tennmugg | 1/4 | 40 |
| Porslinskopp | 1/4 | 60 |
| Silverbägare | 1/4 | 125 |
| Guldbägare | 1/4 | 2500 |
| Fin porslinsbägare | 1/4 | 125 |
| Kristallbägare | 1/4 | 250 |
| Fin kristallbägare | 1/4 | 1500 |
| 0,3 kg saltkar i tenn | 1/4 | 190 |
| 0,3 kg saltkar i silver | 1/4 | 440 |
| 0,3 kg saltkar i guld | 1/4 | 8750 |
| Dryckeshorn | 1/4 | 25 |
| Försilvrat d:o | 1/4 | 100 |

"Järnföremål kan försilvras, kostar då 50% av priset för ett silverföremål, eller förgyllas, kostar då 30% av priset för ett guldföremål."

#### 10.4.4 Behållare (s. 44)

"Alla vikter är tomvikter. Tre liter vatten väger 1 BEP."

| Namn | Vikt | Pris |
|---|---|---|
| Träkagge (25 liter) | 1 | 20 |
| Trätunna (50 liter) | 2 | 30 |
| Trätunna (100 liter) | 3 | 50 |
| Trätunna (200 liter) | 6 | 90 |
| Lerkruka (1/2 liter) | 1/2 | 25 km |
| Lerkruka (2 liter) | 1 | 7 |
| Lerkruka (4 liter) | 1 | 12 |
| Lerkruka (20 liter) | 3 | 40 |
| Glasplunta (1 dos) | - | 60 |
| Glasplunta (5 doser) | 1/4 | 150 |
| Tennplunta 1) (1 dos) | - | 25 |
| Tennplunta 1) (5 doser) | 1/4 | 60 |
| Lerplunta (1 dos) | - | 25 km |
| Lerplunta (5 doser) | 1/4 | 10 |
| Trähink (20 liter) | 1 | 3 |
| Metallhink (20 liter) | 1 | 25 |
| Läderhink (20 liter) | 1 | 12 |
| Fältflaska (1/2 liter) | 1/4 | 5 |
| Fältflaska (1 liter) | 1/4 | 7 |
| Fältflaska (2 liter) | 1/4 | 12 |
| Vattenskinn (4 liter) | 1/2 | 12 |
| Vattenskinn (20 liter) | 1 | 25 |

1) Finns i silver för 5 gånger tennpluntornas pris.

#### 10.4.5 Kläder (alla priser i km) (s. 45)

| Namn | Pris |
|---|---|
| Byxor | 25 |
| Basker | 15 |
| Bälte | 20 |
| Hattfjäder | 10 |
| Hatt | 30 |
| Jacka | 30 |
| Kjol | 20 |
| Klänning | 50 |
| Kortbyxor | 10 |
| Kängor | 75 |
| Mantel | 100 |
| Mössa | 5 |
| Sandaler | 10 |
| Slokhatt | 25 |
| Stövlar, höga hårda | 200 |
| Stövlar, höga mjuka | 100 |
| Stövlar, låga hårda | 100 |
| Stövlar, låga mjuka | 50 |
| Särk | 15 |
| Tunika | 20 |
| Underkläder & Strumpor | 15 |
| Ylletröja | 20 |
| Yllevantar | 10 |

#### 10.4.6 Tält, bäddar och småsaker (s. 45; table without its own heading in the source)

| Namn | Vikt | Pris |
|---|---|---|
| Lädertält (2 mans) | 8 | 190 |
| Lädertält (4 mans) | 16 | 375 |
| Lädertält (8 mans) | 30 | 875 |
| Segeldukstält (2 mans) | 5 | 125 |
| Segeldukstält (4 mans) | 10 | 250 |
| Segeldukstält (8 mans) | 16 | 500 |
| Fiskkrok & fisklina | 1/4 | 25 km |
| Litet fisknät | 1/2 | 12 |
| Stort fisknät | 1 | 60 |
| Tunn filt | 1 | 60 |
| Tjock filt | 1 | 125 |
| Sovfäll | 2 | 310 |
| Tygbädd | 3 | 25 |
| Läderbädd | 3 | 60 |
| Halmmadrass | 1/2 | 25 km |
| Halm (för en vecka) | 1 | 5 km |
| Ihopfällbar träsäng | 6 | 250 |
| Fint ullakan | 1/2 | 165 |
| Linnelakan | 1/2 | 315 |
| Myggnät (2×2m) | 1/4 | 125 |
| Fältbestickssats | 1/2 | 100 |
| Bältesbörs (20 mynt) | 1/4 | 5 |
| Myntbälte (100 mynt) | 1/2 | 10 |
| Snaror (3 st) | 1/2 | 2 |

#### 10.4.7 Lägerutrustning (s. 45)

| Namn | Vikt | Pris |
|---|---|---|
| Oljelampa | 1/2 | 7 |
| Oljelykta | 1 | 40 |
| Lampolja (1/2 liter) | 1/2 | 25 km |
| Fackla | 1/2 | 1 |
| Liten ryggsäck (2 BEP) | 1 | 5 |
| Medelstor ryggsäck (4 BEP) | 1 | 10 |
| Stor ryggsäck (6 BEP) | 1 | 20 |
| Liten säck (1 BEP) | 1/4 | 1 |
| Medelstor säck (2 BEP) | 1/4 | 2 |
| Stor säck (4 BEP) | 1/4 | 3 |
| Jättestor säck (8 BEP) | 1/2 | 4 |
| Flinta & stål | 1/2 | 25 km |
| Glödlåda | 1/2 | 10 |

#### 10.4.8 Diverse Föremål (s. 45 to 46)

| Föremål | Vikt | Pris |
|---|---|---|
| Vaxljus | - | 1 |
| Handklocka | 1/4 | 10 |
| Hänglås | 1/2 | 180 |
| Penna, bläck & pergament | 1/2 | 3 |
| Bågsträng | - | 1 km |
| Sytråd (10 m) | - | 1 km |
| Synål | - | 1 km |
| Timglas | 1 | 875 |
| Minutglas | 1/4 | 190 |
| Solur | 1/4 | 500 |
| Glaskulor (20 st) | 1/2 | 25 |
| Helig symbol, Trä | 1/4 | 1 |
| Helig symbol, Silver | 1/4 | 40 |
| Lockhorn | 1/2 | 50 |
| Signalthorn | 1/2 | 30 |
| Harpa | 5 | 350 |
| Lyra | 1 | 75 |
| Säckpipa | 3 | 150 |
| Handtrumma | 1 | 20 |
| Fela | 3 | 250 |
| Flöjt | 1/4 | 50 |
| Skidor | 2 | 20 |
| Skridskor | 1 | 20 |
| Snöskor 1) | 1 | 5 |

1) Halverar personens Förflyttningsförmåga.

#### 10.4.9 Droger, prices (s. 46)

| Namn | Chans 4) | Pris |
|---|---|---|
| Davidsblomma | 15% | 7 sm/g |
| Drakträdsbär | 10% | 55 sm/st |
| Fyrklöver | 100% | 1 sm/blad |
| Gyllenbuskbär | 5% | 120 sm/st |
| Gyllensäd | 15% 1) | 80 sm/hg |
| Korsört, blad | 85% | 5 sm/g |
| Korsört, rot | 70% | 5 sm/g |
| Lakritsrot | 60% | 5 sm/rot |
| Liliansört | 10% | 6 sm/g |
| Purpursippepollen | 5% | 200 sm/g |
| Saffran | 100% | 20 sm/g |
| Stormhatt | 10% 3) | 100 sm/dos |
| Svanblomma, lök | 15% | 350 sm/st |
| Tårbuskbär | 15% | 23 sm/g |
| Vitlök | 100% | 4 km/klyfta |
| Duragos | 30% | 115 gm/dos |
| Ganas | 3% 2) | 80 gm/kaka |
| Karsonolja | 30% 2) | 50 gm/dos |
| Liliansörtdrog | 7% | 200 gm/dos |
| Sarassos | 2% | 320 gm/dos |
| Smaugifonia | 1% | 280 gm/dos |

1) Finns alltid i skogsalvsbosättningar, men säljs där endast till alvfolk. 2) Endast i arktiska trakter. 3) Kräver först ett framgångsrikt bruk av färdigheten Undre Världen. 4) Chans att drogen eller ingrediensen ska finnas hos en örthandlare. I ett samhälle brukar det finnas ungefär 1 örthandlare per 500 invånare.

#### 10.4.10 Mat & dryck (s. 46)

| Namn | Pris |
|---|---|
| Fruktsaft | 4 per kagge |
| Öl | 5 per kagge |
| Cider | 10 per kagge |
| Mjöd | 5 per kagge |
| Vin, enkelt | 15 per kagge |
| Vin, fint | 20 per kagge |
| Fältproviant | 16 km per dagsranson |

#### 10.4.11 Hantverk & tjänster (s. 46)

| Namn | Pris |
|---|---|
| Halvsulning | 1 |
| Besök i badhus | 1 |
| Klippning | 3 |
| Rakning | 2 |
| Bokbindning | 40 per volym |
| Horoskop | 100 per fråga |
| Tvätt | 3 per kg |
| Översättning 1) | |

1) 2×(Grundkostnad i bakgrundspoäng för det okända språket) sm per 100 ord. Bakgrundspoängen anges i avsnittet om färdigheter. Exempel: En översättning från drakspråket kostar (2×20=) 40 sm per 100 ord.

#### 10.4.12 Drag- och riddjur (s. 46 to 47)

| Namn | Pris |
|---|---|
| Åsna | 190 |
| Mula | 375 |
| Ponny | 250 |
| Häst, lätt | 300 |
| Häst, medelstor | 500 |
| Häst, stor | 700 |
| Oxe 1) | 300 |
| Kamel | 500 |
| Elefant | 2200 |
| Otämjd & oinriden: | x0.5 |
| Stridstränad: | x10 |

1) Dagsmarschen för en oxdragen kärra är två tredjedelar av den normala.

"Riddjur kan bära maximalt 3×STY antal BEP. Överlastade riddjur vägrar att flytta sig. Kom ihåg att 1 STO = 3 BEP. Vilka fordon djuret kan dra anges i tabellen nedan." (s. 47)

Rustningar för riddjur:

| Namn | Absorbering | Vikt | Pris |
|---|---|---|---|
| Läder | 2 | STO/4 | 5×STO |
| Ringbrynja | 4 | STO/2 | 40×STO |

Annan riddjursutrustning:

| Namn | Vikt | Pris |
|---|---|---|
| Sadel | 1 | 50 |
| Sadelväskor (5 BEP) | 1 | 20 |
| Elefantsadel (tre personer) | 20 | 200 |

#### 10.4.13 Fordon (s. 47)

| Namn | Vikt | Pris | Lastförmåga 2) | Minsta dragdjur |
|---|---|---|---|---|
| Lätt tvåhjulig vagn 1) | 20 | 1500 | 50 | 1 ponny |
| Stor tvåhjulig vagn | 60 | 1000 | 100 | 2 mulor |
| Fyrhjulig vagn | 100 | 2000 | 200 | 2 medelstora hästar |
| Rodd/segeleka | 45 | 250 | 120 | |
| Segelbåt | 300 | 4000 | 500 | |
| Liten kanot | 25 | 300 | 100 | (12 KP) |
| Stor kanot | 50 | 700 | 200 | (14 KP) |

1) Detta är ett lätt och sportigt fordon, som liknar romerska kappkörningsvagnar. Om vagnen dras av en medelstor eller stor häst tillryggalägger den på goda vägar 40 km under en dagsmarsch. 2) Lastförmågan anges i BEP. När man beräknar hur många personer som ryms i ett fordon är 3 BEP = 1 STO. Tänk på att BEP inte bara anger vikt, utan även kan visa på hur skrymmande ett föremål är.

#### 10.4.14 Tjuvverktyg (s. 47)

| Föremål | Mått | Pris (sm) | Kommentar |
|---|---|---|---|
| Dyrkar (10 st) | 15 cm | 225 | |
| Långa dyrkar (10 st) | 45 cm | 320 | |
| Nyckelämnen (10 st) | | 140 | |
| Nyckelfilar (6 st) | | 100 | |
| Vaxklump | | 4 | |
| Nyckelhålsåg | | 375 | |
| Glimmerplatta | 15×10 cm | 15 | Lyfter hakar genom springor |
| Handborr | 20 cm | 85 | Bågdriven, 2 cm diameter |
| Huggmejsel | | 16 | |
| Inspektionsspegel | 3 cm | 90 | På 25 cm skaft |
| Liten hammare | 20 cm | 10 | |
| Metallsåg | | 550 | |
| Proberstickor | 25 cm | 35 | Av stål, med och utan krok |
| Smörjolja | 25 ml | 8 | |
| Snöre | 50 m | 2 | |
| Stenkulor (24 st) | | 5 | Att strö framför förföljare |
| Stickjärn | 25 cm | 35 | |
| Tång | 12 cm | 50 | |
| Verktygsväska 1) | | 10 | |

1) En verktygsväska kan innehålla all ovanstående utrustning, och väger då 3 BEP.

#### 10.4.15 Värdshus (s. 48)

"Värdshuset är en plats som spelar stor roll under äventyren. Där finner man mat, husrum, rykten, personer att fråga om vägen och uppdragsgivare. Ett värdshus som saknar övernattningsmöjligheter kallas taverna." Four types: fint, normalt, fattigt, slum. Fine inns: nobles and rich burghers. Normal: along roads or in better town quarters. A kvarterskrog is usually fattig. Hamnsjapp and cheap syltor are slum. Ground floor: gillesstuga (serving) and kitchen; upstairs: bedrooms; yard: stable, privy, bath house.

Värdshusets utseende och service:

| Ting | Slum | Fattigt | Normalt | Fint |
|---|---|---|---|---|
| Antal småbord 1) | - | 1T4 | 1T8 | 3T6 |
| Antal långbord 2) | 3T4 | 2T3 | 2T4 | 1T6 |
| Antal bås 3) | - | 1T4 | 2T4 | 2T4 |
| Chans att få bås | 0% | 15% | 95% | 95% |
| Antal sovsalar | 1 | 2 | 2 | - |
| Antal bäddar/sovsal | 4T4+4 | 4T4+2 | 3T4+2 | - |
| Antal dubbelrum | 1 | 1T3+1 | 3T4+2 | 1T3+5 |
| Antal enkelrum | 1 | 1T3 | 1T3+3 | 1T3+5 |
| Chans att få sovplats 4), sovsal | 50% | 55% | 55% | - |
| Chans att få sovplats 4), dubbelrum | 20% | 35% | 45% | 75% |
| Chans att få sovplats 4), enkelrum | 30% | 25% | 25% | 65% |
| Bad | nej | ja | ja | ja |
| Krögare | värden | värden | värden | värden+1 |
| Utkastare | värden | värden | 1 | 1T3 |
| Kock | 1 | 1 | 1 | 1T3 |
| Extra kökspersonal | nej | nej | 1 | 1T4+1 |
| Chans för underhållning 5) | 35% | 45% | 65% | 50% |
| Chans för stall 6) | 15% | 25% | 60% 6) | 100% |
| Chans för vagnhus | nej | nej | 15% 6) | 50% |

Värdshuspriser:

| Mat & dryck | Pris |
|---|---|
| Enkel grönsaksstuvning | 5 km |
| Köttstuvning | 10 km |
| Köttstycke och rovor | 30 km |
| God måltid (ej slum) | 50 km |
| Lyxmåltid (ej slum, fattigt) | 10 sm |
| Bankett | 20 sm |
| Öl (stånka) | 2 km |
| Mjöd (stånka) | 2 km |
| Cider (mugg) | 1 km |
| Vin (mugg) | 3 km |

| Inkvartering (per natt) | Pris |
|---|---|
| Sovsal | 3 sm |
| Dubbelrum | 5 sm |
| Enkelrum | 7 sm |

| Stallplats (per dygn) | Pris |
|---|---|
| Åsna/Mula | 7 km |
| Ponny | 6 km |
| Lätt + Medelstor häst | 10 km |
| Stor häst | 15 km |
| Oxe | 9 km |
| Elefant (ej tillåten i städer) | 10 sm |
| Leggenddjur 7) | 5 sm |

1) 6 platser. 2) 15 platser. 3) 4 platser. 4) Om man får rum på ett värdshus får man också stallplats eller vagnplats om sådant finns hos värdshuset. 5) Slå 1T20: 1–10 Trubadur, 11–15 Dansflickor, 16–19 Gycklare, 20 SLs special. 6) Vid landsväg 100%. 7) Hippogriff, pegas mm.

#### 10.4.16 Underhållning (s. 48)

"Rollpersonerna kastar mynt till underhållarna som betalning. Äger rollpersonen mindre än 30 km behöver han inte betala."

| Underhållare | Betalning |
|---|---|
| Musiker | 1T6 km |
| Dansflickor | 1T10 km (manliga rollpersoner) |
| Dansflickor | 1T3−1 km (kvinnliga rollpersoner) |
| Gycklare | 1T8 km |

#### 10.4.17 Hasardspelsutrustning (s. 48)

| Tärningar | Pris per par 1) |
|---|---|
| trä | 2 |
| tenn | 20 |
| silver | 100 |
| elfenben | 400 |
| guld | 500 |
| Kortlek (52 kort) | 30 |

1) Vill man ha preparerade tärningar eller märkta kort kostar de tio gånger mer.

Note: Bok III also has its own equipment lists (s. 43 to 46, weights in kg, prices in sm), weapon and armour tables (s. 33 to 38) and fumble tables (s. 39 to 41). They are not reproduced here.

## 11. Notes for a real-time action game

- **Time base.** One SR is about 5 seconds (Bok II s. 15). An ordinary spell is cast during one SR and lands in the next, and the caster does nothing else; (K) spells land in the same SR. Suggested mapping: ordinary spell = a channel of about 1 to 1,5 s that roots or slows the caster, (K) = near-instant cast (0,2 s or less), (R) rituals = out-of-combat actions (camp, town, safe room), with the 1T4 hours per E turned into a time skip.
- **Hold to charge = effektgrad.** Each charge step adds +1 E, +1 PSY cost and −2 CL. Cap the steps at the caster's FV in the school. Show the live hit chance: `p = clamp(S - 2*(E-1), 1, 19) / 20` before resistance, plus the perfekt and fummel bands from section 3.2.
- **Pay on release, following the book.** Always take 1 PSY on release. On success take the rest (E total); on perfekt take max(1, floor(E/2)); on fummel take all E and roll 1T20+E on Snedtändningstabellen, so overcharging is risky in itself.
- **Interrupt on hit.** Damage taken while channelling breaks the spell: 1 PSY lost, no effect (s. 4). This gives the Hades-style rule "hits cancel your charge" for free, and makes K spells the safe panic buttons.
- **PSY is mana and life.** The pool is the PSY attribute itself; 0 means death. Show a hard warning near 0. The självmordsattack (spend up to PSY/2 + current, CL = unmodified S) fits as a one-off last-stand ultimate that kills the caster.
- **Regeneration.** 1 PSY per in-game hour of rest, 1 per 3 hours when active (s. 4). In real time, either run a game clock (for example 1 game hour = 60 s at rest) or restore PSY only at rest points and in town, which suits a roguelite loop.
- **Extra E for range and duration.** Let a modifier key or a radial choice spend charge steps on "räckvidd" or "varaktighet" instead of power; each step adds one base distance or base duration. For a simpler first version, fix range and duration at S-based values and spend all charge on power.
- **Converting S-based numbers.** 1 ruta = 1,5 m. Sx10 rutor at S12 is 180 m, which is far beyond a Diablo-style screen, so clamp ranges to the camera area. Durations: S/4 SR at S12 = 3 SR = 15 s; Sx1 SR = 60 s; S/4 minuter = 3 min. Expert Magi's fixed conversions (Kort 8 rutor, Medium 20, Lång 40 to 80; Sx1 SR = 10 SR, S/4 min = 5 min) are handy defaults.
- **Resistance.** Non-(F) spells on unwilling targets need a PSY vs PSY roll after paying: `chance = (10 + casterPSY - targetPSY) / 20`, automatic at 0 or less and at 20 or more. (F) spells (BLIXT, ELD, ENERGISTRÅLE, EXPLOSION) always land, which makes them the reliable damage spells.
- **Memory slots as a hotbar.** Total slots = floor((INT+PSY)/4), at most FV per school, rituals take 3 slots, swapping at rest takes 20 game minutes per skolvärde point. Casting an unslotted spell from the formelsamling takes 1T6 SR (K) or 1T6 minutes, which in practice means "not in combat".
- **Iron rule as a build constraint.** No casting while touching iron, wearing iron armour or inside an iron cage; carrying up to 0,5 kg of iron is fine if not touching it (Bok III s. 8; Expert is stricter). For a thief like Svart Nebb: a drawn iron dagger blocks casting. Only magiker and utbygdsjägare can learn magic (s. 3), but anyone can use magic items, which always succeed and draw PSY from the user unless they have NEXUS (s. 43). Magic scrolls and potions are the natural way to give a non-caster spells.
- **Fear as status effects.** Monsters with Skräckslå trigger `1T20 - PSY + value` on first sight; map Skräcktabellen results to timed statuses (−CL debuffs, stun for N SR, AI-controlled flight, faint), converting SR to seconds with 5 s per SR. ORÄDD and SMAUGIFONIA are the counters.

## 12. Source problems and open questions

- LJUS duration printed "Sx4 minuter" (Bok III s. 18, both text and HTML). Not in the duration list; Expert has S/4 minuter. Probably a misprint for S/4 minuter.
- FROST range printed "Sx10 minuter" (Bok III s. 20). Range cannot be minutes; Expert has S×10 rutor. Treat as Sx10 rutor.
- FINNA VATTEN range "S/4 rutor" (Bok III s. 14) vs Expert "S/4 km". The spell finds all water sources in range, which suggests km.
- FÖRÄNDRA duration printed "Sx1 min" (abbreviation of minuter).
- Training of magiskolor: s. 3 allows training alone with an academy library; s. 7 says EP in magiskolor only come from training with a teacher. The two passages disagree.
- (INT+PSY)/4: rounding not stated.
- "PSY-grupp" (Expert symbols, AURA) is not defined in these files.
- The "ankor (Al, E, I, M, Sp, S)" letters are not explained in the source; the school mapping in section 1 is an interpretation.
- The "Motstånd" column in section 8 marks resistance from the general rule on s. 5 unless the spell text states it ("texten"). The book does not tag each spell.
- Skräck: the events list gives "Onaturlig händelse 1T10" and "Ytterst onaturliga händelser 1T20", while the modifier list gives +4 and +15 for the same words. Only the highest single modifier applies, so pick one source per situation.
- The Skräcktabellen row "<1" has typos in the source ("är är", "sdagen"); kept as printed.
- Expert Magi "Magisk forskning" breaks off mid-sentence in the transcription, so the monthly research roll is missing.
- STENVÄGG (Expert) says only "Se grundreglerna"; its effect is not in either file.
- Bok III mentions NEXUS (skolvärde 20) and PERMANENS (skolvärde 19) on s. 43 but gives no spell description; the Expert versions (section 10.2.6) are the only ones available.
