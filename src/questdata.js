// Spillets eget havneoppdrag, ikke et scenario fra Ereb-bøkene. Timer er spilltimer.
// Små tillatte vilkår/virkninger, uten skript eller eval i oppdragsdata.
export const QUESTS = {
  havnelisten: {
    title: 'Den forseglede havnelisten',
    giver: 'arno_ragna', place: 'arno', duration: 12 * 24, first: 'hent',
    acceptMessage: 'Nytt oppdrag: Den forseglede havnelisten. Tolv døgn fra nå.',
    travelNote: 'Reisen Arno–Gringul tar fire døgn hver vei.',
    completeText: [{ if: 'brutt', text: 'Avtalen er gjort opp. Ragna betalte mindre fordi seglet var brutt.' }, { text: 'Listen kom fram med helt segl. Ragna har betalt deg.' }],
    failedText: 'Fristen gikk ut. Ragna husker det.',
    stages: {
      hent: { text: 'Hent Ragnas forseglede liste i lagerkisten ved handelsboden i Arno.', actions: {
        hent: { place: 'arno', object: 'havnekiste', next: 'gringul', message: 'Du tar den forseglede listen. Den bæres som oppdragsgjenstand og står i journalen.', effects: [{ type: 'object', place: 'arno', id: 'havnekiste', value: 'tom' }] },
      } },
      gringul: { text: 'Ta listen til Tova på havnekontoret i Gringul. Hold seglet helt.',
        items: [{ if: 'brutt', text: 'Åpnet havneliste' }, { text: 'Forseglet havneliste' }],
        journalActions: [{ id: 'bryt', label: 'Bryt seglet (20 i stedet for 80 sm)', unless: 'brutt' }],
        actions: {
        bryt: { place: '*', unless: 'brutt', message: 'Seglet er brutt. Listen nevner korn, tran og to ufortollede safrankasser. Betalingen blir mindre.', effects: [{ type: 'flag', id: 'brutt', value: true }] },
        lever: { place: 'gringul', actor: 'gringul_tova', next: 'arno', message: 'Tova tar imot listen og gir deg en kvittering til Ragna i Arno.', effects: [
          { type: 'remember', id: 'gringul_tova', memory: 'liste_mottatt' },
          { type: 'relation', id: 'gringul_tova', amount: 1, unless: 'brutt' },
          { type: 'faction', id: 'gringul_havn', amount: 1, unless: 'brutt' },
        ] },
      } },
      arno: { text: 'Lever Tovas kvittering til Ragna i Arno før fristen.', items: [{ text: 'Tovas kvittering' }], actions: {
        kvittering: { place: 'arno', actor: 'arno_ragna', next: 'done', message: 'Avtalen er gjort opp. Du får {silver} silver. Ragna husker hvordan du behandlet listen.', effects: [
          { type: 'silver', amount: 80, unless: 'brutt' }, { type: 'silver', amount: 20, if: 'brutt' },
          { type: 'relation', id: 'arno_ragna', amount: 2, unless: 'brutt' },
          { type: 'relation', id: 'arno_ragna', amount: -1, if: 'brutt' },
          { type: 'faction', id: 'arno_havn', amount: 1, unless: 'brutt' },
          { type: 'faction', id: 'arno_havn', amount: -1, if: 'brutt' },
          { type: 'remember', id: 'arno_ragna', memory: 'avtale_fullfort' },
        ] },
      } },
    },
    onFail: [{ type: 'relation', id: 'arno_ragna', amount: -1 }, { type: 'faction', id: 'arno_havn', amount: -1 }, { type: 'remember', id: 'arno_ragna', memory: 'fristbrudd' }],
  },
};
