// Verdensminne per rollperson. Løpets kamp, utstyr og silver lagres fortsatt av save.js.
// Egen implementasjon; dataskillet er beskrevet i docs/gjenbruk.md.
export const CAMPAIGN_VERSION = 1;
export const CAMPAIGN_KEY = 'svartnebb.campaigns.v1';
const LEGACY = ['quests', 'rykte', 'offenses', 'ivan', 'seenAreas', 'offered', 'almsGiven', 'guild'];
const object = v => v && typeof v === 'object' && !Array.isArray(v);
export const copy = v => JSON.parse(JSON.stringify(v));

export function newCampaign(character = 'svartnebb', clock = 17) {
  return { v: CAMPAIGN_VERSION, character, clock, quests: {}, people: {}, factions: {}, areas: {}, exploration: null, legacy: {} };
}

export function normalizeCampaign(value, character = 'svartnebb', clock = 17) {
  const c = newCampaign(character, clock);
  if (!object(value) || value.v !== CAMPAIGN_VERSION) return c;
  if (Number.isFinite(value.clock) && value.clock >= 0) c.clock = value.clock;
  for (const key of ['quests', 'people', 'factions', 'areas', 'legacy']) if (object(value[key])) c[key] = copy(value[key]);
  if (object(value.exploration)) c.exploration = copy(value.exploration);
  return c;
}

export function captureCampaign(c, run) {
  c.clock = run.clock;
  for (const key of LEGACY) if (run[key] !== undefined) c.legacy[key] = copy(run[key]);
  if (run.world) {
    const w = run.world, maps = {};
    for (const [id, m] of Object.entries(w.maps || {})) if (Array.isArray(m.seen)) maps[id] = { seen: m.seen.slice() };
    if (Array.isArray(w.seen)) maps[w.region || 'aidne'] = { seen: w.seen.slice() };
    c.exploration = { known: copy(w.known || {}), done: copy(w.done || {}), cleared: copy(w.cleared || {}), maps };
  }
  return c;
}

export function restoreCampaign(c, run) {
  run.clock = c.clock;
  for (const key of LEGACY) if (c.legacy[key] !== undefined) run[key] = copy(c.legacy[key]);
}

// Nytt løp begynner i Fristaden med ny proviantklokke og uten gammel rute eller møte.
export function restoreExploration(c, world) {
  if (!c.exploration) return;
  Object.assign(world, copy(c.exploration));
  if (world.maps[world.region]?.seen) world.seen = world.maps[world.region].seen;
}

export function campaignArea(c, place) {
  const a = c.areas[place] ||= { objects: {} };
  a.objects ||= {};
  return a;
}

export function personMemory(c, id) {
  return c.people[id] ||= { relation: 0, memories: {} };
}

export function readCampaign(character, storage) {
  try {
    storage ||= globalThis.localStorage;
    const all = JSON.parse(storage.getItem(CAMPAIGN_KEY) || '{}');
    return normalizeCampaign(all?.[character], character);
  } catch { return newCampaign(character); }
}

export function writeCampaign(c, storage) {
  try {
    storage ||= globalThis.localStorage;
    let all;
    try { all = JSON.parse(storage.getItem(CAMPAIGN_KEY) || '{}'); } catch { all = {}; }
    if (!object(all)) all = {};
    // defineProperty behandler også uvanlige navn som vanlige nøkler.
    Object.defineProperty(all, c.character, { value: c, enumerable: true, configurable: true, writable: true });
    storage.setItem(CAMPAIGN_KEY, JSON.stringify(all));
    return true;
  } catch { return false; }
}
