import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { G } from '../../src/state.js';
import { ATLAS_REGIONS, ATLAS_SCENARIOS } from '../../src/atlasdata.js';
import { CONNECTIONS, PLACES, getRegionMap, atlasRoute, connectionsFrom, defaultPlace } from '../../src/regionalmaps.js';
import { W, changeRegion, look, seenAt, placeAt, findPath, worldMap, foodNeeded, advanceTravelTime, pathHours, marchDistance, stepPlan } from '../../src/worldtravel.js';
import { journeyQuote, takeJourney } from '../../src/atlastravel.js';
import { dropEntry } from '../../src/inventory.js';
import { distanceKm, REGION_GEO } from '../../src/geography.js';
import { walkSchedule, formatDuration } from '../../src/journeytime.js';
import { startQuest } from '../../src/ivan.js';

beforeEach(() => {
  G.run = { clock:17 };
  G.state = 'atlas';
  G.player = { silver:200, kp:10, bag:[], roll:()=>({ success:true }), recalc:()=>{} };
  G.game = { wiping:false }; G.worldview = { moving:null };
  G.inv = null;
  G.weather = null;
  G.ui = { log:()=>{}, logRoll:()=>{} }; G.audio = {};
});

test('hele regionnettet har vei ut og hjem, uten ugyldige havner', () => {
  assert.equal(Object.keys(ATLAS_REGIONS).length,31);
  for (const id of Object.keys(ATLAS_REGIONS)) {
    assert.ok(atlasRoute('aidne',id),id+' mangler vei ut');
    assert.ok(atlasRoute(id,'aidne'),id+' mangler vei hjem');
    assert.ok(PLACES[defaultPlace(id)]);
    for (const c of connectionsFrom(id)) {
      assert.equal(PLACES[c.a].map,id); assert.equal(PLACES[c.b].map,c.to);
      assert.ok(c.hours>0 && Number.isFinite(c.hours)); assert.ok(c.fare>=0);
    }
  }
  assert.equal(atlasRoute('finnes_ikke','aidne'),null);
  assert.equal(changeRegion('finnes_ikke'),false);
});

test('alle avgangssteder nås til fots innen sin region', () => {
  for (const id of Object.keys(ATLAS_REGIONS)) {
    assert.ok(changeRegion(id));
    const w=W(), m=worldMap();
    for (const [pid,p] of Object.entries(m.places)) {
      assert.ok(findPath(w.x,w.y,p.x,p.y),`${id}: ${pid} er avskåret`);
      assert.equal(placeAt(p.x,p.y),pid,`${id}: to steder deler rute`);
    }
  }
});

test('gamle Aidne-lagringer beholder posisjon, tåke og kjente steder', () => {
  const seen=new Array(1500).fill(0); seen[487]=2;
  G.run.world={ x:37,y:9,seen,known:{ ereno:true,vraket:true },fed:12,cleared:{ gravhaugen:true },done:{} };
  const w=W();
  assert.equal(w.region,'aidne'); assert.equal(w.x,37); assert.equal(w.y,9);
  assert.equal(w.seen[487],2); assert.ok(w.known.vraket); assert.ok(w.cleared.gravhaugen);
});

test('utforsking og synlige steder blandes ikke mellom regioner, heller ikke etter JSON-lagring', () => {
  const w=W(); look(20,15); const aidne=w.seen.slice();
  changeRegion('caddo','arno'); look(20,15); const caddo=W().seen.slice();
  assert.equal(placeAt(9,22),'arno');
  changeRegion('trakorien','tricilve');
  assert.equal(placeAt(9,22),'tricilve');
  G.run=JSON.parse(JSON.stringify(G.run));
  changeRegion('caddo','arno'); assert.deepEqual(W().seen,caddo);
  changeRegion('aidne','fristaden'); assert.deepEqual(W().seen,aidne);
  assert.equal(seenAt(20,15),2);
});

test('billetten oppgir og belaster samme pris og tid', () => {
  const id='fristaden__arno', q=journeyQuote(id);
  assert.ok(q.ok && q.atDeparture && q.affordable);
  assert.equal(q.hours,240); assert.equal(q.fare,20);
  const r=takeJourney(id);
  assert.ok(r.ok); assert.equal(G.player.silver,180); assert.equal(G.run.clock,257);
  assert.equal(W().region,'caddo'); assert.equal(W().journeys.length,1);
  assert.equal(W().journeys[0].arrival,'arno');
});

test('ingen avgang eller trekk i penger når du er feil sted, blakk eller i en overgang', () => {
  const w=W(); w.x--;
  assert.equal(takeJourney('fristaden__arno').ok,false);
  w.x++; G.player.silver=0;
  assert.equal(takeJourney('fristaden__arno').ok,false);
  G.player.silver=200; G.game.wiping=true;
  assert.equal(takeJourney('fristaden__arno').ok,false);
  assert.equal(G.run.clock,17); assert.equal(W().region,'aidne'); assert.equal(G.player.silver,200);
});

test('hyre gir en vei hjem uten penger og behandler mat gjennom hele en lang reise', () => {
  G.player.silver=0;
  const q=journeyQuote('fristaden__khaanikel',true);
  assert.ok(q.affordable); assert.equal(q.fare,0);
  const r=takeJourney('fristaden__khaanikel',true);
  assert.ok(r.ok); assert.equal(r.hours,130*24); assert.equal(W().region,'nidland');
  assert.equal(G.player.kp,10); assert.equal(G.player.bag.length,0); assert.equal(G.player.silver,0);
  assert.ok(G.run.clock-W().fed<24);
  assert.ok(takeJourney('fristaden__khaanikel',true).ok);
  assert.equal(W().region,'aidne');
});

test('kartets svenske mil gir kilometer, og Demontungan er en lang fjellreise',()=>{
  assert.equal(distanceKm([[0,0],[189,0]]),1000);
  const c=CONNECTIONS.find(c=>c.from==='nidland'&&c.to==='akrogal');
  assert.ok(c.km>1000&&c.km<2000);assert.ok(c.hours>90*24);
  assert.ok(CONNECTIONS.filter(c=>c.kind==='landevei').every(c=>c.hours>24));
  for(const r of Object.keys(ATLAS_REGIONS))assert.ok(REGION_GEO[r].bounds.length===4);
  assert.equal(formatDuration(240),'10 døgn');
});

test('dagsreise har tolv timer gange og nattestans, med bokas værreduksjon',()=>{
  assert.equal(walkSchedule(20,6).hours,12);
  assert.equal(walkSchedule(40,6).hours,36);
  assert.equal(walkSchedule(20,21).hours,21);
  assert.equal(walkSchedule(20,6,{weather:()=> 'regn'}).hours,28);
  assert.equal(walkSchedule(20,6,{weather:()=> 'storm'}).hours,36);
  assert.equal(walkSchedule(30,6,{pace:'march'}).hours,12);
  assert.equal(walkSchedule(30,6,{pace:'march',dayKm:()=>20}).hours,30);
});

test('landeveisavgang blokkeres uten proviant, mens karavane dekker mat og hvile',()=>{
  changeRegion('nidland','pass_nidland_akrogal');
  const id='nidland__akrogal',q=journeyQuote(id);
  assert.ok(q.supplies>100&&!q.foodReady);
  const clock=G.run.clock;assert.equal(takeJourney(id).ok,false);assert.equal(G.run.clock,clock);
  const caravan=journeyQuote(id,false,'caravan');assert.ok(caravan.meals&&caravan.foodReady);
  let rested=0;G.player.heal=()=>rested++;
  G.player.silver=caravan.fare;
  const r=takeJourney(id,false,'caravan');
  assert.ok(r.ok);assert.equal(W().region,'akrogal');assert.equal(G.player.silver,0);
  assert.equal(G.run.clock,clock+caravan.hours);assert.equal(G.player.kp,10);
  assert.equal(G.player.bag.length,0);
  assert.equal(rested,caravan.schedule.nights.filter(n=>n.end-n.start>=6).length,'samme natt må ikke helbrede to ganger');
});

test('egen proviant behandles hvert døgn og sultne får ikke hvilehelbredelse',()=>{
  const w=W();G.player.bag=[{type:'cons',cid:'proviant',qty:5}];
  const needed=foodNeeded(72);
  advanceTravelTime(72,{nights:[{start:18,end:30},{start:42,end:54},{start:66,end:78}]});
  assert.equal(needed,3);assert.equal(G.player.bag[0].qty,2);
  let healed=0,psy=0;G.player.bag=[];G.player.heal=()=>healed++;G.player.gainPSY=()=>psy++;
  w.fed=G.run.clock-49;
  advanceTravelTime(12,{nights:[{start:G.run.clock,end:G.run.clock+12}]});
  assert.equal(healed,0);assert.equal(psy,0);
});

test('gammel klokke, måltid og aktiv oppdragsfrist blir ikke ganget opp ved migrering',()=>{
  G.run.clock=201;G.run.ivan={stage:1,deadline:240,flags:{}};
  G.run.world={x:37,y:9,seen:new Array(1500).fill(0),fed:190,known:{ereno:true}};
  W();assert.equal(G.run.clock,201);assert.equal(W().fed,190);assert.equal(G.run.ivan.deadline,240);
  assert.equal(W().travelRules,2);
});

test('lang reise starter ikke Edelfara; funnet av kureren starter en ny lokal frist',()=>{
  assert.ok(takeJourney('fristaden__arno').ok);
  assert.equal(G.run.ivan,undefined);
  startQuest();const deadline=G.run.ivan.deadline;
  assert.ok(deadline>G.run.clock&&deadline<=G.run.clock+7*24+6);
  assert.ok(takeJourney('fristaden__arno',true).ok);
  assert.equal(G.run.ivan.deadline,deadline);assert.ok(G.run.clock>deadline);
});

test('Aidnes regionale ferd bruker kartavstand og har samme vær i anslag som i etapper',()=>{
  const w=W(),p=PLACES.edelfara,path=findPath(w.x,w.y,p.x,p.y);
  const normal=pathHours(path);assert.ok(normal>15*24);
  G.weather={kindAt:()=> 'storm'};
  assert.ok(pathHours(path)>normal*1.5);
  const short=findPath(w.x,w.y,PLACES.ereno.x,PLACES.ereno.y),start=G.run.clock,expected=pathHours(short);
  G.player.bag=[{type:'cons',cid:'proviant',qty:200}];
  for(let i=1;i<short.length;i++){
    const plan=stepPlan(...short[i-1],...short[i]);
    advanceTravelTime(plan.hours,{nights:plan.nights});
    [w.x,w.y]=short[i];
  }
  assert.ok(Math.abs(G.run.clock-start-expected)<1e-7);
});

test('marsj bruker ett Lätt SMI-slag per reisedag, også gjennom flere kartsteg',()=>{
  let rolls=0;G.player.roll=(id,o)=>{assert.equal(id,'SMI');assert.equal(o.sg,5);rolls++;return {success:rolls>1};};
  assert.equal(marchDistance(1),20);assert.equal(marchDistance(1),20);assert.equal(rolls,1);
  assert.equal(marchDistance(2),30);assert.equal(rolls,2);
});

test('fremtidige eventyr er kildeført og blir ikke merket som spillbare', () => {
  assert.deepEqual(ATLAS_SCENARIOS.filter(s=>s.state==='spillbart').map(s=>s.id),['edelfara']);
  assert.equal(CONNECTIONS.find(c=>c.id==='arno__gringul').bookDays,4);
  assert.equal(CONNECTIONS.find(c=>c.id==='stabul__leir_soluna').bookDays,null);
  for (const id of Object.keys(ATLAS_REGIONS)) {
    const m=getRegionMap(id); assert.equal(m.terrain.length,30);
    assert.ok(m.terrain.every(row=>row.length===50),id+' har feil kartbredde');
  }
});

test('gjenstander kan ikke forsvinne i bakgrunnsområdet fra et reisekart', () => {
  const e={ uid:'test',name:'Proviant',type:'cons',cid:'proviant',qty:1 };
  G.player.bag=[e]; G.player.equip={ vapen:e };
  assert.equal(dropEntry(G.player,e),false);
  G.state='inventory'; G.inv={ fromWorld:true };
  assert.equal(dropEntry(G.player,null,'vapen'),false);
  assert.equal(G.player.bag[0],e); assert.equal(G.player.equip.vapen,e);
});

test('Krilloan nås via Kiorsham og omlasting, uten en oppdiktet sjørute gjennom Vägen bort', () => {
  assert.ok(CONNECTIONS.some(c=>c.b==='kiorsham'));
  assert.equal(CONNECTIONS.some(c=>c.a==='krilloan'||c.b==='krilloan'),false);
  changeRegion('samkarna','kiorsham');
  const p=PLACES.krilloan;
  assert.ok(findPath(W().x,W().y,p.x,p.y));
});
