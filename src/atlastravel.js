// Etappene mellom regionkart. Tider og billetter er spilltilpasninger, se atlasdata.js.
import { G } from './state.js';
import { PLACES, connectionsFrom } from './regionalmaps.js';
import { ATLAS_REGIONS } from './atlasdata.js';
import { W, changeRegion, advanceTravelTime, foodNeeded, countFood, marchDistance } from './worldtravel.js';
import { walkSchedule } from './journeytime.js';

export function journeyQuote(id, work = false, landMode='walk') {
  const w = W();
  const c = connectionsFrom(w.region).find(r => r.id === id);
  if (!c) return { ok:false, why:'Den forbindelsen går ikke herfra.' };
  const p = PLACES[c.a];
  const atDeparture = w.x === p.x && w.y === p.y;
  const crew = work && c.kind === 'skip';
  const caravan=c.kind==='landevei'&&landMode==='caravan';
  const schedule=c.kind==='landevei'?walkSchedule(c.km,G.run.clock,{pace:landMode==='march'?'march':'walk',terrain:c.terrain,road:c.terrain!=='^',weather:t=>G.weather?.kindAt?.(t)||'klart'}):null;
  const hours=schedule?.hours??c.hours,meals=c.kind==='skip'||caravan;
  const maxHours=landMode==='march'&&schedule?walkSchedule(c.km,G.run.clock,{terrain:c.terrain,road:c.terrain!=='^',weather:t=>G.weather?.kindAt?.(t)||'klart'}).hours:hours;
  const fare=crew?0:caravan?Math.ceil(hours/24)*2:c.fare;
  const supplies=meals?0:foodNeeded(maxHours);
  return { ok:true,c,atDeparture,crew,fare,hours,minHours:hours,maxHours,schedule,caravan,meals,supplies,foodReady:supplies<=countFood(),landMode,
    affordable:(G.player?.silver || 0) >= fare, departure:p.name, destination:PLACES[c.b].name };
}

export function takeJourney(id, work = false, landMode='walk') {
  if (!['atlas','world'].includes(G.state) || G.player?.dead || G.player?.downed || G.game?.wiping || G.worldview?.moving) return { ok:false, why:'Du kan ikke reise nå.' };
  const q = journeyQuote(id, work, landMode);
  if (!q.ok) return q;
  if (!q.atDeparture) return { ok:false, why:`Reis til ${q.departure} først.` };
  if (!q.affordable) return { ok:false, why:'Du har ikke nok silver. På skip kan du ta hyre i stedet.' };
  if (!q.foodReady) return {ok:false,why:`Du trenger ${q.supplies} dagsrasjoner. Skaff proviant eller velg karavane med mat underveis.`};
  let hours = q.hours;
  if(q.schedule&&landMode==='march') {
    q.schedule=walkSchedule(q.c.km,G.run.clock,{pace:'march',terrain:q.c.terrain,road:q.c.terrain!=='^',weather:t=>G.weather?.kindAt?.(t)||'klart',dayKm:marchDistance});
    hours=q.schedule.hours;
  }
  let roll = null;
  if (q.crew) {
    roll = G.player.roll('Sjökunnighet', { label:'Sjökunnighet' });
  }
  const w = W(), start = G.run.clock;
  advanceTravelTime(hours,{meals:q.meals,nights:q.schedule?.nights||[]});
  G.player.silver -= q.fare;
  changeRegion(q.c.to, q.c.b);
  w.journeys ||= [];
  w.journeys.push({ from:q.c.from, to:q.c.to, departure:q.c.a, arrival:q.c.b, kind:q.c.kind, start, end:G.run.clock, fare:q.fare, crew:q.crew,km:q.c.km,caravan:q.caravan });
  if (w.journeys.length>80) w.journeys.splice(0,w.journeys.length-80);
  if (roll) G.ui?.logRoll(roll, roll.success ? 'Du gjør nytte for deg om bord. Arbeidet betaler passasjen.' : 'Arbeidet går tungt, men du fullfører vaktene og betaler passasjen med arbeid.');
  return { ok:true, destination:q.c.b, region:q.c.to, hours, fare:q.fare,
    note:`Du kommer til ${q.destination} i ${ATLAS_REGIONS[q.c.to].name}${q.c.kind==='skip' ? ' sjøveien' : ' langs landeveien'}.` };
}
