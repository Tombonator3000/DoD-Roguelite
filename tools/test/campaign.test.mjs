import test from 'node:test';
import assert from 'node:assert/strict';
import { newCampaign, normalizeCampaign, captureCampaign, restoreCampaign, restoreExploration, readCampaign, writeCampaign, CAMPAIGN_KEY } from '../../src/campaign.js';
import { questAction, expireQuests, questEntries } from '../../src/quests.js';
import { QUESTS } from '../../src/questdata.js';
import { migrateSave, compatibleSave, describe, SAVE_VERSION } from '../../src/save.js';
import { G } from '../../src/state.js';
import { advanceTravelTime } from '../../src/worldtravel.js';
import { performQuest } from '../../src/campaign-runtime.js';

const ctx = (clock = 17, place = 'arno', actor = 'arno_ragna', object) => ({ clock, place, actor, object });

test('et annet oppdrag får egne mål, journal og oppgjør bare fra data', () => {
  QUESTS.prove = { title: 'Et annet oppdrag', giver: 'anna', place: 'arno', duration: 24, first: 'finn', completeText: [{ text: 'Levert.' }], failedText: 'For sent.',
    stages: { finn: { text: 'Finn nøkkelen.', items: [{ text: 'En nøkkel' }], actions: { lever: { place: 'gringul', actor: 'ola', next: 'done', effects: [{ type: 'silver', amount: 7 }] } } } } };
  try {
    const c = newCampaign();
    assert.ok(questAction(c, 'prove', 'accept', ctx(17, 'arno', 'anna')).ok);
    assert.equal(questEntries(c)[0].item, 'En nøkkel');
    assert.equal(questAction(c, 'prove', 'lever', ctx(18, 'gringul', 'ola')).silver, 7);
    assert.equal(questEntries(c)[0].text, 'Levert.');
    assert.equal(questAction(c, 'prove', 'lever', ctx(19, 'gringul', 'ola')).ok, false);
  } finally { delete QUESTS.prove; }
});
function collect(c) {
  assert.ok(questAction(c, 'havnelisten', 'accept', ctx()).ok);
  assert.ok(questAction(c, 'havnelisten', 'hent', ctx(18, 'arno', null, 'havnekiste')).ok);
}
function deliver(c, clock = 114) {
  return questAction(c, 'havnelisten', 'lever', ctx(clock, 'gringul', 'gringul_tova'));
}

test('en full rundreise gir betaling og relasjoner én gang, med faste objekt-ID-er', () => {
  const c = newCampaign(); collect(c);
  assert.equal(c.areas.arno.objects.havnekiste, 'tom');
  assert.equal(questAction(c, 'havnelisten', 'hent', ctx(19, 'arno', null, 'havnekiste')).ok, false);
  assert.equal(deliver(c).ok, true);
  assert.equal(deliver(c).ok, false);
  assert.equal(c.factions.gringul_havn, 1);
  const result = questAction(c, 'havnelisten', 'kvittering', ctx(211));
  assert.equal(result.silver, 80);
  assert.equal(c.people.arno_ragna.relation, 2);
  assert.equal(c.quests.havnelisten.state, 'done');
  const restored = normalizeCampaign(JSON.parse(JSON.stringify(c)));
  assert.equal(questAction(restored, 'havnelisten', 'kvittering', ctx(212)).ok, false);
  assert.equal(questEntries(restored)[0].item, null);
});

test('brutt segl følger med gjennom lagring og gir et annet oppgjør', () => {
  const c = newCampaign(); collect(c);
  assert.ok(questAction(c, 'havnelisten', 'bryt', ctx(30, 'fristaden')).ok);
  assert.equal(questAction(c, 'havnelisten', 'bryt', ctx(31)).ok, false);
  const restored = normalizeCampaign(JSON.parse(JSON.stringify(c)));
  assert.ok(deliver(restored).ok);
  assert.equal(restored.factions.gringul_havn, undefined);
  assert.equal(questAction(restored, 'havnelisten', 'kvittering', ctx(211)).silver, 20);
  assert.equal(restored.people.arno_ragna.relation, -1);
  assert.equal(restored.factions.arno_havn, -1);
});

test('handlinger krever riktig person, sted, objekt og rekkefølge', () => {
  const c = newCampaign();
  assert.equal(questAction(c, 'havnelisten', 'accept', ctx(17, 'gringul')).ok, false);
  assert.equal(questAction(c, 'havnelisten', 'accept', ctx(17, 'arno', 'noen_andre')).ok, false);
  assert.equal(questAction(c, 'constructor', 'accept', ctx()).ok, false);
  assert.ok(questAction(c, 'havnelisten', 'accept', ctx()).ok);
  assert.equal(questAction(c, 'havnelisten', 'hent', ctx(18, 'arno', null, 'feil_kiste')).ok, false);
  assert.equal(deliver(c).ok, false);
  assert.equal(questAction(c, 'havnelisten', 'kvittering', ctx(211)).ok, false);
  assert.equal(c.quests.havnelisten.stage, 'hent');
  assert.equal(Object.keys(c.people).length, 0);
});

test('lang reise passerer fristen, registrerer én følge og stopper senere oppgjør', () => {
  const c = newCampaign(); collect(c);
  G.campaign = c; G.run = { clock: 18 }; G.state = 'atlas';
  G.ui = { log() {} }; G.audio = {};
  G.player = { bag: [], kp: 10, silver: 0, maxPSY: 2, heal() {}, gainPSY() {} };
  const originalStorage = globalThis.localStorage;
  globalThis.localStorage = { getItem: () => '{}', setItem() {} };
  try {
    advanceTravelTime(12 * 24, { meals: true });
    assert.equal(G.run.clock, 306);
    assert.equal(c.quests.havnelisten.state, 'failed');
    assert.equal(c.people.arno_ragna.relation, -1);
    assert.equal(c.factions.arno_havn, -1);
    assert.deepEqual(expireQuests(c, 500), []);
    assert.equal(c.people.arno_ragna.relation, -1);
    assert.equal(questAction(c, 'havnelisten', 'kvittering', ctx(501)).ok, false);
  } finally { globalThis.localStorage = originalStorage; G.campaign = null; }
});

test('fristen gjelder også nøyaktig ved utløp, og en fullført avtale utløper aldri', () => {
  const c = newCampaign(); collect(c); deliver(c);
  assert.equal(questAction(c, 'havnelisten', 'kvittering', ctx(305)).ok, false);
  assert.equal(c.quests.havnelisten.state, 'failed');
  const done = newCampaign(); collect(done); deliver(done);
  questAction(done, 'havnelisten', 'kvittering', ctx(304.99));
  assert.deepEqual(expireQuests(done, 9000), []);
  assert.equal(done.quests.havnelisten.state, 'done');
});

test('journalvalg lager ikke et lagret kampspill mens vanlig lagring er sperret', () => {
  const c = newCampaign(); collect(c);
  const storage = new Map(), original = globalThis.localStorage;
  globalThis.localStorage = { getItem: k => storage.get(k), setItem: (k, v) => storage.set(k, v) };
  G.campaign = c; G.run = { clock: 19 }; G.state = 'pause';
  G.dungeon = { L: { place: 'arno' } }; G.player = { pos: { x: 0, z: 0 }, silver: 0 };
  G.enemies = [{ alerted: true, pos: { x: 1, z: 1 } }]; G.ui = { log() {} }; G.audio = {};
  try {
    assert.equal(performQuest('havnelisten', 'bryt').ok, true);
    assert.equal(c.quests.havnelisten.flags.brutt, true);
    assert.equal(storage.has(CAMPAIGN_KEY), true);
    assert.equal(storage.has('svartnebb.saves.v1'), false);
  } finally { globalThis.localStorage = original; G.campaign = null; G.enemies = []; }
});

test('nytt løp bevarer verden, men starter hjemme uten gammel sult eller penger', () => {
  const c = newCampaign(); collect(c);
  captureCampaign(c, { clock: 200, silver: 999, kills: 42, quests: { rats: { state: 'done' } }, rykte: 3,
    ivan: { deadline: 220, flags: { trail: true } }, world: { region: 'caddo', x: 8, y: 9, fed: 180, starveT: 190, enc: 'gammel', route: [1], known: { arno: true }, done: {}, cleared: { vraket: true }, maps: { aidne: { seen: [1, 2] } }, seen: [2, 1] } });
  const run = { clock: 17, kills: 0, silver: 0, quests: {} };
  restoreCampaign(c, run);
  assert.equal(run.clock, 200); assert.equal(run.kills, 0); assert.equal(run.silver, 0);
  assert.equal(run.quests.rats.state, 'done'); assert.equal(run.ivan.deadline, 220);
  const world = { region: 'aidne', x: 31, y: 18, fed: run.clock, route: null, enc: null, seen: [0, 0], maps: {} };
  restoreExploration(c, world);
  assert.equal(world.region, 'aidne'); assert.equal(world.fed, 200);
  assert.equal(world.route, null); assert.equal(world.enc, null);
  assert.deepEqual(world.seen, [1, 2]); assert.equal(world.known.arno, true);
  world.seen[0] = 0; assert.equal(c.exploration.maps.aidne.seen[0], 1);
});

test('verdensminne er isolert per rollperson, og blokkert eller fullt lager gir kontrollert feil', () => {
  const data = new Map(), storage = { getItem: k => data.get(k), setItem: (k, v) => data.set(k, v) };
  const a = newCampaign('a'); collect(a);
  assert.equal(writeCampaign(a, storage), true);
  assert.equal(readCampaign('a', storage).quests.havnelisten.stage, 'gringul');
  assert.deepEqual(readCampaign('b', storage).quests, {});
  assert.equal(writeCampaign(newCampaign('b'), storage), true);
  assert.equal(readCampaign('a', storage).areas.arno.objects.havnekiste, 'tom');
  const bad = { getItem() { throw Error('blokkert'); }, setItem() { throw Error('fullt'); } };
  assert.equal(readCampaign('a', bad).character, 'a'); assert.equal(writeCampaign(a, bad), false);
  const future = JSON.stringify({ a: { v: 2, clock: 999, quests: { framtid: true } } });
  storage.setItem(CAMPAIGN_KEY, future);
  assert.equal(readCampaign('a', storage).unsupported, true);
  assert.equal(writeCampaign(a, storage), false);
  assert.equal(storage.getItem(CAMPAIGN_KEY), future);
});

test('DoD91 v2 migreres fra sitt eget øyeblikk, uten å endre originalen eller hente framtidig verdensminne', () => {
  const old = { v: 2, rules: 'dod91', at: 1, meta: {}, run: { clock: 120, ivan: { deadline: 144 }, world: { region: 'aidne', known: { arno: true }, seen: [1], maps: {} } }, player: { sheet: { id: 'gammel' } }, pos: { x: 0, z: 0 } };
  const before = JSON.stringify(old), migrated = migrateSave(old);
  assert.equal(SAVE_VERSION, 3); assert.equal(compatibleSave(old), true); assert.equal(describe(old).old, false);
  assert.equal(migrated.campaign.character, 'gammel'); assert.equal(migrated.campaign.clock, 120);
  assert.equal(migrated.campaign.legacy.ivan.deadline, 144);
  assert.equal(migrated.campaign.exploration.known.arno, true);
  assert.deepEqual(migrated.campaign.quests, {}); assert.equal(JSON.stringify(old), before);
  assert.equal(migrateSave({ ...old, rules: 'dod2023' }), null);
  assert.equal(migrateSave({ ...old, v: 4 }), null);
  assert.equal(migrateSave({ ...migrated, campaign: { v: 2 } }), null);
});
