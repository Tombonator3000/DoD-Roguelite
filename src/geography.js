// Oppmålingsgrunnlag: originalkartet i Ereb Altor-boxen 1989, fra Toms bibliotek.
// Punkter er bildepiksler på en referanse på 1856 x 1333. Kartets 100 mil = 1000 km.
// Lokale utsnitt og forbindelsesruter er anslag, ikke nye offisielle kartgrenser.
export const EREB_MAP = {
  width:1856, height:1333, scalePixels:189, scaleKm:1000,
  source:'https://kingafw.no/Drakar/boker/ae66767c8db9/les-hele-boka.html',
};
export const KM_PER_PIXEL = EREB_MAP.scaleKm / EREB_MAP.scalePixels;
export const distanceKm = points => points.slice(1).reduce((n,p,i)=>n+Math.hypot(p[0]-points[i][0],p[1]-points[i][1])*KM_PER_PIXEL,0);

// Navnene står på kartet. Små regioner og øyer har mindre utsnitt enn store skogland.
export const REGION_GEO = {
  aidne:{ point:[430,900],bounds:[145,725,590,1030] },
  trakorien:{ point:[290,490],bounds:[125,365,445,575] },
  marjura:{ point:[290,358],bounds:[220,320,350,400] },
  mereld:{ point:[222,685],bounds:[180,650,260,740] },
  bzegusta:{ point:[238,641],bounds:[205,605,275,690] },
  magilre:{ point:[365,665],bounds:[285,565,460,735] },
  klomellien:{ point:[525,700],bounds:[450,620,620,760] },
  kasenu:{ point:[470,765],bounds:[405,735,520,805] },
  goiana:{ point:[365,815],bounds:[285,775,440,865] },
  jorpagna:{ point:[690,783],bounds:[550,725,825,870] },
  ljusna:{ point:[560,575],bounds:[500,535,620,630] },
  mirel:{ point:[640,605],bounds:[570,570,750,650] },
  ransard:{ point:[575,495],bounds:[480,450,710,555] },
  jorduashur:{ point:[655,260],bounds:[520,170,790,460] },
  palinor:{ point:[755,550],bounds:[650,460,875,625] },
  nargur:{ point:[920,540],bounds:[790,405,1045,655] },
  barbia:{ point:[1090,430],bounds:[925,285,1220,500] },
  cereval:{ point:[1140,545],bounds:[1040,470,1250,630] },
  torshem:{ point:[920,650],bounds:[810,600,1010,705] },
  landori:{ point:[880,705],bounds:[800,675,975,780] },
  berendien:{ point:[920,780],bounds:[835,735,1015,865] },
  felicien:{ point:[910,915],bounds:[810,860,1070,990] },
  hynsolge:{ point:[1085,820],bounds:[1015,750,1190,895] },
  grynnerbergen:{ point:[1160,800],bounds:[1105,755,1245,875] },
  nidland:{ point:[1200,750],bounds:[1080,640,1345,835] },
  krun:{ point:[1180,950],bounds:[1080,870,1315,1060] },
  caddo:{ point:[440,1025],bounds:[390,975,505,1070] },
  erebos:{ point:[605,965],bounds:[520,900,740,1055] },
  samkarna:{ point:[300,1180],bounds:[110,1110,670,1210] },
  soluna:{ point:[1025,1155],bounds:[800,1080,1200,1210] },
  akrogal:{ point:[1670,550],bounds:[1535,390,1720,835] },
};

// Havner som er navngitt i sjøtabellen. Tricilve ligger på vestre Paratorna
// (Trakorien, avsnittet om hovedstaden). Noen havnenavn mangler på oversiktskartet;
// disse har anslått punkt innen den kildeførte kysten, merket estimated.
export const PORT_GEO = {
  fristaden:{ point:[526,850] }, arno:{ point:[434,1001] }, gringul:{ point:[551,1040] },
  tricilve:{ point:[338,468],estimated:true }, mercana:{ point:[396,683] },
  staden_o:{ point:[485,683] }, kapahlt:{ point:[632,513] }, halle:{ point:[632,346] },
  mastika_agga:{ point:[1040,290],estimated:true }, cerevallis:{ point:[1180,499] },
  jorgund:{ point:[727,852] }, fervidun:{ point:[1040,815] }, tyros:{ point:[950,900] },
  khaanikel:{ point:[1240,744] }, stabul:{ point:[1169,1040] }, melukha:{ point:[170,1085],estimated:true },
  kiorsham:{ point:[205,1120],estimated:true }, krilloan:{ point:[190,1170],estimated:true },
};

// Sjøruter følger havsbassengene rundt Aidne og nordsiden av Ereb. Inne i havna
// er streken bare en oversikt; den er ikke et detaljert navigasjonskart.
const seaNodes = {
  kobber:[650,1100], vestkobber:[320,1080], vestkyst:[120,1020], vesterhav:[110,620],
  nordvest:[455,375], nordhav:[870,210], nordost:[1370,210], maseva:[1340,590],
  ostkobber:[1000,990], sor:[840,1090],
};
const seaEdges=[['kobber','vestkobber'],['vestkobber','vestkyst'],['vestkyst','vesterhav'],['vesterhav','nordvest'],['nordvest','nordhav'],['nordhav','nordost'],['nordost','maseva'],['kobber','sor'],['sor','ostkobber']];
const portLane={
  fristaden:['kobber',[590,930],[600,1065]], arno:['kobber',[480,1070],[550,1090]],
  gringul:['kobber',[580,1080]], tricilve:['nordvest',[300,550],[440,520]],
  mercana:['vesterhav',[255,700],[145,720]], staden_o:['nordvest',[475,625],[430,585],[450,520]],
  kapahlt:['nordvest',[540,500],[470,460]], halle:['nordvest',[565,350]],
  mastika_agga:['nordhav',[1030,245]], cerevallis:['maseva',[1260,535]],
  khaanikel:['maseva',[1270,675]], jorgund:['kobber',[755,905],[785,1005]],
  fervidun:['ostkobber',[1005,850],[1050,890]], tyros:['ostkobber',[990,960]],
  stabul:['ostkobber',[1150,1080],[1080,1080]], melukha:['vestkobber',[220,1080]],
  kiorsham:['vestkobber',[250,1090]], leir_marjura:['nordvest',[375,335]],
  leir_mereld:['vesterhav',[155,685]], leir_bzegusta:['vesterhav',[170,640]],
  leir_soluna:['sor',[1000,1090]],
};
export function geoForPlace(id, region) {
  return PORT_GEO[id]?.point || REGION_GEO[region]?.point;
}
export function seaTrace(a,b,from,to) {
  const direct={
    fristaden_arno:[[526,850],[540,895],[520,930],[500,966],[480,990],[434,1001]],
    fristaden_gringul:[[526,850],[540,895],[520,930],[505,980],[510,1055],[551,1040]],
    arno_gringul:[[434,1001],[420,1060],[490,1090],[550,1080],[551,1040]],
    arno_melukha:[[434,1001],[420,1060],[350,1085],[250,1085],[170,1085]],
    tricilve_leir_marjura:[[338,468],[350,415],[340,390],[290,358]],
  };
  if(direct[a+'_'+b])return direct[a+'_'+b];
  if(direct[b+'_'+a])return direct[b+'_'+a].slice().reverse();
  const pa=geoForPlace(a,from), pb=geoForPlace(b,to), la=portLane[a], lb=portLane[b];
  if (!la||!lb) return [pa,pb];
  const dist={ [la[0]]:0 }, paths={ [la[0]]:[la[0]] }, open=new Set(Object.keys(seaNodes));
  while(open.size) {
    let u=null; for(const n of open) if(dist[n]!=null&&(u==null||dist[n]<dist[u]))u=n;
    if(u==null||u===lb[0])break;
    open.delete(u);
    for(const [x,y] of seaEdges) {
      const v=x===u?y:y===u?x:null;if(!v||!open.has(v))continue;
      const n=dist[u]+distanceKm([seaNodes[u],seaNodes[v]]);
      if(dist[v]==null||n<dist[v]){dist[v]=n;paths[v]=[...paths[u],v];}
    }
  }
  return [pa,...la.slice(1),...(paths[lb[0]]||[]).map(n=>seaNodes[n]),...lb.slice(1).reverse(),pb];
}

const landSpecial={
  aidne_goiana:[[430,830],[400,815],[380,805]],
  aidne_jorpagna:[[540,800],[560,772],[600,770]],
  nidland_akrogal:[[1290,810],[1340,825],[1395,833],[1470,815],[1540,795]],
  hynsolge_krun:[[1150,865],[1180,882],[1190,910]],
  nidland_krun:[[1275,815],[1300,850],[1270,890],[1240,910]],
};
export function landTrace(a,b) {
  const direct=landSpecial[a+'_'+b], reverse=landSpecial[b+'_'+a];
  if(direct)return direct.map(p=>[...p]);if(reverse)return reverse.slice().reverse().map(p=>[...p]);
  const x=REGION_GEO[a].point,y=REGION_GEO[b].point;
  // Etappen forbinder grenseområdene. Gangen fra by til grense tas på regionkartet.
  return [[x[0]+(y[0]-x[0])*.3,x[1]+(y[1]-x[1])*.3],[x[0]+(y[0]-x[0])*.7,x[1]+(y[1]-x[1])*.7]];
}
export function cellDistance(region,dx,dy) {
  const b=REGION_GEO[region].bounds;
  return Math.hypot(dx*(b[2]-b[0])/50,dy*(b[3]-b[1])/30)*KM_PER_PIXEL;
}
