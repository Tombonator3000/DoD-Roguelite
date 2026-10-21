// Regionkart beholder samme målestokk og format som Aidne. Aidne er uendret.
// De øvrige kartene er egne skjematiske reisekart; byenes fulle gatenett kommer senere.
import { WW, WH, TERRAIN, PLACES as AIDNE_PLACES, ROADS, RIVERS, REGIONS } from './worldmap.js';
import { ATLAS_REGIONS, ATLAS_PORTS } from './atlasdata.js';
import { geoForPlace, seaTrace, landTrace, distanceKm } from './geography.js';
import { walkSchedule } from './journeytime.js';

export const PLACES = Object.fromEntries(Object.entries(AIDNE_PLACES).map(([id, p]) => [id, { ...p, map: 'aidne' }]));
const cache = {};
const hubs = {};
for (const id of Object.keys(ATLAS_REGIONS)) hubs[id] = [];
for (const [id, p] of Object.entries(ATLAS_PORTS)) {
  PLACES[id] = { ...p, map: p.region, kind: 'by', size: 'middels', coast: true, big: true,
    sub: `havneby i ${ATLAS_REGIONS[p.region].name}`, tells: [], lore: ATLAS_REGIONS[p.region].lore };
  hubs[p.region].push(id);
}
// Krilloan I, Geografi: Kiorsham ligger mot Kopparhavet; Krilloan mot Ormsjön.
// Mellom dem må lasten over land. Ingen vanlig skipsrute går gjennom Vägen bort.
PLACES.kiorsham = { name:'Kiorsham',map:'samkarna',x:39,y:8,kind:'by',size:'liten',coast:true,
  sub:'Krilloans omlastingshavn mot Kopparhavet',source:'krilloan',lore:'Den befestede havna på Kopparhavssiden av Forithos. Her losses varer som skal over land til Krilloan.',tells:['krilloan','melukha'] };
PLACES.krilloan = { name:'Krilloan',map:'samkarna',x:38,y:20,kind:'by',size:'stor',coast:true,big:true,
  sub:'handelsby ved Ormsjön',source:'krilloan',lore:'Handelsbyen under Forithos samler sjøfolk, handelsmenn og magikere. Strømmen i Vägen bort gjør den vanlige sjøveien til Kopparhavet ufarbar.',tells:['kiorsham','melukha'] };

function hash(s) { let h = 17; for (const c of s) h = (Math.imul(h, 31) + c.charCodeAt(0)) | 0; return h >>> 0; }
function noise(x, y, seed) { let h = Math.imul(x + seed, 374761393) ^ Math.imul(y + seed, 668265263); h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967295; }

// Nybyggede kystleirer er ikke påstått å være byer fra bøkene.
for (const r of Object.values(ATLAS_REGIONS)) if (r.id !== 'aidne' && !hubs[r.id].length) {
  const id = 'leir_' + r.id;
  const coast = ['oy', 'oyer', 'kyst'].includes(r.shape);
  PLACES[id] = { name: `${coast ? 'Sjøleiren' : 'Veileiren'} i ${r.name}`, sub: 'en leir for reisende',
    x: coast ? 9 : 25, y: coast ? 22 : 15, map: r.id, kind: 'by', size: 'liten', coast, original: true, lore: r.lore, tells: [] };
  hubs[r.id].push(id);
}

// Transport mellom kart. Alle priser, forbindelsestider til lands og ekspedisjonsruter er uv.
// Bokas seildager er kalenderdøgn. Anslåtte ruter bruker kartets avstand.
export const CONNECTIONS = [];
const firstHub = region => region === 'aidne' ? 'fristaden' : hubs[region]?.[0];
function sea(a, b, days, o = {}) {
  const from=PLACES[a].map,to=PLACES[b].map,route=seaTrace(a,b,from,to),km=distanceKm(route);
  const bookDays=o.original?null:days;
  const hours=(bookDays??Math.ceil(km/100))*24; // 100 km/døgn på egne sjøruter er uv.
  CONNECTIONS.push({ id: a + '__' + b, a, b, from: PLACES[a].map, to: PLACES[b].map,
    kind: 'skip', hours, fare: Math.max(8, Math.ceil(hours/24 * 2)), uv: true,route,km,
    source: 'kampanj', sourcePage: o.original ? 61 : 41, bookDays, ...o });
}
// Kampanjboken, PDF s. 41, raden Fristaden. Dager beholdes som dager.
for (const [port, days] of [['arno',10],['gringul',8],['tricilve',55],['mercana',46],['staden_o',61],['kapahlt',60],['halle',62],['mastika_agga',87],['cerevallis',117],['jorgund',33],['fervidun',41],['tyros',35],['khaanikel',130],['stabul',42],['melukha',35]]) sea('fristaden', port, days);
for (const [a,b,h] of [['arno','gringul',4],['arno','melukha',25],['arno','tricilve',45],['gringul','jorgund',25],['jorgund','tyros',13],['tyros','stabul',22],['halle','kapahlt',16],['kapahlt','tricilve',18],['mercana','staden_o',22],['cerevallis','mastika_agga',30]]) sea(a,b,h);
sea('tricilve', firstHub('marjura'), 30, { original: true, expedition: true });
sea('mercana', firstHub('bzegusta'), 8, { original: true });
sea('tricilve', firstHub('mereld'), 12, { original: true });
// Dette går langs Efaro-kysten på Kopparhavet, aldri opp Raas Narram.
sea('stabul', firstHub('soluna'), 12, { original: true });
sea('fristaden','kiorsham',40,{ original:true,source:'krilloan',sourcePage:null,sourceSection:'Geografi: Kiorsham' });

const slots = [[42,8],[42,21],[25,5],[25,25],[7,8],[7,21],[15,5],[35,25]];
const gateCount = {};
function gate(region, target) {
  if (region === 'aidne' && target === 'goiana') return 'lofhelm';
  const id = 'pass_' + region + '_' + target;
  const [x,y] = region === 'aidne' ? [48,17] : slots[(gateCount[region] || 0) % slots.length];
  gateCount[region] = (gateCount[region] || 0) + 1;
  PLACES[id] = { name: `Veien mot ${ATLAS_REGIONS[target].name}`, sub: 'landevei videre til neste region',
    x,y, map: region, kind: 'gateway', size: 'liten', target, original: true };
  return id;
}
function land(a,b) {
  const route=landTrace(a,b),km=distanceKm(route),terrain=a==='grynnerbergen'||b==='grynnerbergen'||b==='akrogal'?'^':'.';
  const hours=walkSchedule(km,6,{terrain,road:terrain!== '^'}).hours;
  const departure=gate(a,b),arrival=gate(b,a);
  PLACES[departure].geo=route[0];PLACES[arrival].geo=route[route.length-1];
  CONNECTIONS.push({ id: a + '__' + b, a:departure,b:arrival, from:a,to:b,kind:'landevei',hours,fare:0,uv:true,route,km,terrain,
    source:'karta',estimated:true });
}
for (const [a,b] of [
  ['aidne','goiana'],['aidne','jorpagna'],['goiana','kasenu'],['kasenu','magilre'],['kasenu','klomellien'],
  ['magilre','klomellien'],['klomellien','mirel'],['klomellien','jorpagna'],['mirel','ljusna'],
  ['mirel','ransard'],['mirel','palinor'],['ransard','jorduashur'],['ransard','palinor'],
  ['palinor','nargur'],['nargur','barbia'],['nargur','cereval'],['nargur','torshem'],
  ['torshem','landori'],['landori','jorpagna'],['landori','berendien'],['jorpagna','berendien'],
  ['berendien','hynsolge'],['hynsolge','grynnerbergen'],['grynnerbergen','landori'],
  ['hynsolge','nidland'],['hynsolge','krun'],['nidland','krun'],['nidland','akrogal'],
]) land(a,b);

for(const [id,p] of Object.entries(PLACES)) p.geo ||= geoForPlace(id,p.map);

export function defaultPlace(region) { return firstHub(region); }

export function getRegionMap(id = 'aidne') {
  if (ATLAS_REGIONS[id]?.id !== id) id = 'aidne';
  if (cache[id]) return cache[id];
  const region = ATLAS_REGIONS[id];
  const places = Object.fromEntries(Object.entries(PLACES).filter(([,p]) => p.map === id));
  if (id === 'aidne') return cache[id] = { id, name: 'Aidne og Drakdjupet', terrain: TERRAIN, roads: ROADS, rivers: RIVERS, places, regions: REGIONS };
  const seed = hash(id), cold = region.climate === 'kaldt', forest = ['skog','tropisk'].includes(region.climate), island = ['oy','oyer'].includes(region.shape);
  const grid = Array.from({ length: WH }, (_,y) => Array.from({ length: WW }, (_,x) => {
    if (island && ((x-25)/24)**2 + ((y-15)/14)**2 > 1) return '~';
    if (!island && region.shape === 'kyst' && y >= 27) return '~';
    const n = noise(Math.floor(x/3), Math.floor(y/3), seed);
    if ((cold || region.climate === 'fjell') && Math.abs(x-26) < 4 && y > 3 && y < 25) return '^';
    if (n < (forest ? 0.65 : 0.27)) return 'F';
    if (n > 0.87) return '^';
    return '.';
  }));
  const center = [25,15], roads = [];
  for (const p of Object.values(places)) {
    const n = Math.max(Math.abs(p.x-center[0]),Math.abs(p.y-center[1]));
    for (let s=0;s<=n;s++) {
      const x=Math.round(center[0]+(p.x-center[0])*s/Math.max(1,n)), y=Math.round(center[1]+(p.y-center[1])*s/Math.max(1,n));
      // Brede landkorridorer gjør at A* ikke trenger å skjære vannhjørner.
      for (let dy=-1;dy<=1;dy++) for (let dx=-1;dx<=1;dx++) if (grid[y+dy]?.[x+dx] != null) grid[y+dy][x+dx]='.';
    }
    roads.push({ kind: 'vei', pts: [center,[p.x,p.y]] });
    if (p.kind === 'by') p.tells = Object.keys(places).filter(k => PLACES[k] !== p);
  }
  return cache[id] = { id, name: region.name, terrain: grid.map(row=>row.join('')), roads, rivers: [], places,
    regions: [{ id: forest ? 'goiana' : cold || region.climate === 'fjell' ? 'vorga' : 'zorakin', name: region.name, danger: region.danger, test: () => true }] };
}

// En kant kan brukes i begge retninger; id og pris er de samme.
export function connectionsFrom(region) {
  return CONNECTIONS.filter(c => c.from === region || c.to === region).map(c => c.from === region ? c : { ...c, a:c.b, b:c.a, from:c.to, to:c.from,route:c.route.slice().reverse() });
}

// Finn første etappe. Gå til havna/grenseveien på regionkartet før du kan reise.
export function atlasRoute(from, to) {
  if (!from || !to || ATLAS_REGIONS[from]?.id !== from || ATLAS_REGIONS[to]?.id !== to) return null;
  if (from === to) return [];
  const dist = { [from]:0 }, paths = { [from]:[] }, open = new Set(Object.keys(ATLAS_REGIONS));
  while (open.size) {
    let u=null;
    for (const id of open) if (dist[id]!=null && (u==null || dist[id]<dist[u])) u=id;
    if (u==null) break;
    open.delete(u);
    if (u===to) return paths[u];
    for (const c of connectionsFrom(u)) if (open.has(c.to) && (dist[c.to]==null || dist[u]+c.hours<dist[c.to])) {
      dist[c.to]=dist[u]+c.hours; paths[c.to]=[...paths[u],c];
    }
  }
  return null;
}
