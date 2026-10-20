// Etappene mellom regionkart. Tider og billetter er spilltilpasninger, se atlasdata.js.
import { G } from './state.js';
import { PLACES, connectionsFrom } from './regionalmaps.js';
import { ATLAS_REGIONS } from './atlasdata.js';
import { W, changeRegion, tickHunger, ate } from './worldtravel.js';

export function journeyQuote(id, work = false) {
  const w = W();
  const c = connectionsFrom(w.region).find(r => r.id === id);
  if (!c) return { ok:false, why:'Den forbindelsen går ikke herfra.' };
  const p = PLACES[c.a];
  const atDeparture = w.x === p.x && w.y === p.y;
  const crew = work && c.kind === 'skip';
  const fare = crew ? 0 : c.fare;
  return { ok:true, c, atDeparture, crew, fare, hours:c.hours * (crew ? 1.5 : 1), minHours:c.hours * (crew ? 1.25 : 1),
    affordable:(G.player?.silver || 0) >= fare, departure:p.name, destination:PLACES[c.b].name };
}

export function takeJourney(id, work = false) {
  if (!['atlas','world'].includes(G.state) || G.player?.dead || G.player?.downed || G.game?.wiping || G.worldview?.moving) return { ok:false, why:'Du kan ikke reise nå.' };
  const q = journeyQuote(id, work);
  if (!q.ok) return q;
  if (!q.atDeparture) return { ok:false, why:`Reis til ${q.departure} først.` };
  if (!q.affordable) return { ok:false, why:'Du har ikke nok silver. På skip kan du ta hyre i stedet.' };
  let hours = q.hours;
  let roll = null;
  if (q.crew) {
    roll = G.player.roll('Sjökunnighet', { label:'Sjökunnighet' });
    hours = q.c.hours * (roll.success ? 1.25 : 1.5);
  }
  const w = W(), start = G.run.clock;
  // Behandle hvert døgn underveis. Ett måltid skal ikke mette for en uke.
  for (let left=hours;left>0;) {
    const step = Math.min(1,left); left -= step; G.run.clock += step;
    if (q.c.kind === 'skip' && G.run.clock - w.fed >= 24) ate();
    tickHunger();
  }
  G.player.silver -= q.fare;
  changeRegion(q.c.to, q.c.b);
  w.journeys ||= [];
  w.journeys.push({ from:q.c.from, to:q.c.to, departure:q.c.a, arrival:q.c.b, kind:q.c.kind, start, end:G.run.clock, fare:q.fare, crew:q.crew });
  if (w.journeys.length>80) w.journeys.splice(0,w.journeys.length-80);
  if (roll) G.ui?.logRoll(roll, roll.success ? 'Du gjør nytte for deg om bord og får bli med en raskere skute.' : 'Du arbeider deg over. Det tar litt lenger tid, men passasjen koster ikke silver.');
  return { ok:true, destination:q.c.b, region:q.c.to, hours, fare:q.fare,
    note:`Du kommer til ${q.destination} i ${ATLAS_REGIONS[q.c.to].name}${q.c.kind==='skip' ? ' sjøveien' : ' langs landeveien'}.` };
}
