import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { G } from '../../src/state.js';
import { ATLAS_REGIONS, ATLAS_SCENARIOS } from '../../src/atlasdata.js';
import { CONNECTIONS, PLACES, getRegionMap, atlasRoute, connectionsFrom, defaultPlace } from '../../src/regionalmaps.js';
import { W, changeRegion, look, seenAt, placeAt, findPath, worldMap } from '../../src/worldtravel.js';
import { journeyQuote, takeJourney } from '../../src/atlastravel.js';
import { dropEntry } from '../../src/inventory.js';

beforeEach(() => {
  G.run = { clock:17 };
  G.state = 'atlas';
  G.player = { silver:200, kp:10, bag:[], roll:()=>({ success:true }), recalc:()=>{} };
  G.game = { wiping:false }; G.worldview = { moving:null };
  G.inv = null;
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
  assert.equal(q.hours,10); assert.equal(q.fare,20);
  const r=takeJourney(id);
  assert.ok(r.ok); assert.equal(G.player.silver,180); assert.equal(G.run.clock,27);
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
  assert.ok(r.ok); assert.equal(r.hours,162.5); assert.equal(W().region,'nidland');
  assert.equal(G.player.kp,10); assert.equal(G.player.bag.length,0); assert.equal(G.player.silver,0);
  assert.ok(G.run.clock-W().fed<24);
  assert.ok(takeJourney('fristaden__khaanikel',true).ok);
  assert.equal(W().region,'aidne');
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
