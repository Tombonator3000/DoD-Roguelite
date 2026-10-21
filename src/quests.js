// Deklarative oppdrag med faste ID-er og engangsvirkninger.
import { campaignArea, personMemory } from './campaign.js';
import { QUESTS } from './questdata.js';

function effects(c, q, list = []) {
  let silver = 0;
  for (const e of list) {
    if (e.if && !q.flags[e.if] || e.unless && q.flags[e.unless]) continue;
    if (e.type === 'flag') q.flags[e.id] = e.value;
    else if (e.type === 'object') campaignArea(c, e.place).objects[e.id] = e.value;
    else if (e.type === 'remember') personMemory(c, e.id).memories[e.memory] = true;
    else if (e.type === 'relation') { const p = personMemory(c, e.id); p.relation = Math.max(-5, Math.min(5, p.relation + e.amount)); }
    else if (e.type === 'faction') c.factions[e.id] = Math.max(-5, Math.min(5, (c.factions[e.id] || 0) + e.amount));
    else if (e.type === 'silver') silver += e.amount;
    else throw new Error('Ukjent oppdragsvirkning: ' + e.type);
  }
  return silver;
}

export function expireQuests(c, clock) {
  c.clock = clock;
  const failed = [];
  for (const [id, q] of Object.entries(c.quests)) {
    if (q.state === 'active' && q.deadline != null && clock >= q.deadline && QUESTS[id]) {
      q.state = 'failed'; q.finishedAt = clock;
      effects(c, q, QUESTS[id].onFail);
      failed.push(id);
    }
  }
  return failed;
}

export function questAction(c, id, action, ctx) {
  expireQuests(c, ctx.clock);
  const def = Object.hasOwn(QUESTS, id) ? QUESTS[id] : null;
  if (!def) return { ok: false, why: 'Ukjent oppdrag.' };
  let q = c.quests[id];
  if (action === 'accept') {
    if (q) return { ok: false, why: 'Du har allerede svart på dette oppdraget.' };
    if (ctx.place !== def.place || ctx.actor !== def.giver) return { ok: false, why: 'Snakk med oppdragsgiveren.' };
    c.quests[id] = { state: 'active', stage: def.first, startedAt: ctx.clock, deadline: ctx.clock + def.duration, flags: {} };
    return { ok: true, silver: 0, stage: def.first, message: def.acceptMessage };
  }
  if (!q || q.state !== 'active') return { ok: false, why: q?.state === 'failed' ? 'Fristen er ute.' : q?.state === 'done' ? 'Avtalen er allerede gjort opp.' : 'Du har ikke tatt oppdraget.' };
  const step = def.stages[q.stage]?.actions[action];
  if (!step) return { ok: false, why: 'Det er ikke neste steg i oppdraget.' };
  if (step.place !== '*' && step.place !== ctx.place || step.actor && step.actor !== ctx.actor || step.object && step.object !== ctx.object) return { ok: false, why: 'Det må gjøres på rett sted, hos rett person.' };
  if (step.unless && q.flags[step.unless]) return { ok: false, why: 'Det er allerede gjort.' };
  const silver = effects(c, q, step.effects);
  if (step.next) q.stage = step.next;
  if (step.next === 'done') { q.state = 'done'; q.finishedAt = ctx.clock; }
  return { ok: true, silver, stage: q.stage, message: step.message };
}

export function questEntries(c, clock = c.clock) {
  return Object.entries(c.quests).filter(([id]) => Object.hasOwn(QUESTS, id)).map(([id, q]) => {
    const def = QUESTS[id], stage = def.stages[q.stage];
    const choose = list => list?.find(e => !e.if || q.flags[e.if])?.text || '';
    return {
      id, title: def.title, state: q.state, note: def.travelNote || '',
      text: q.state === 'done' ? choose(def.completeText) : q.state === 'failed' ? def.failedText : stage?.text || '',
      hours: q.state === 'active' ? Math.max(0, q.deadline - clock) : null,
      item: q.state === 'active' ? choose(stage?.items) || null : null,
      actions: q.state === 'active' ? (stage?.journalActions || []).filter(a => !a.unless || !q.flags[a.unless]) : [],
    };
  });
}
