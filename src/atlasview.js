// Originalkart med geografiske markører, zoom, panorering og reiseforbindelser.
import { G } from './state.js';
import { ATLAS_REGIONS } from './atlasdata.js';
import { EREB_MAP, PORT_GEO } from './geography.js';
import { PLACES, connectionsFrom, atlasRoute } from './regionalmaps.js';
import { W, reveal, worldMap, terrainAt, roadAt, placeAt } from './worldtravel.js';
import { journeyQuote, takeJourney } from './atlastravel.js';
import { formatDuration } from './journeytime.js';
import { saveGame } from './save.js';
import { textureImage } from './textures.js';
import { questEntries } from './quests.js';

const $ = s => document.querySelector(s);

export class AtlasView {
  constructor() {
    this.cv=$('#atlas-map');this.ctx=this.cv.getContext('2d');
    this.selected='aidne';this.busy=false;this.zoom=1;this.pan=[0,0];this.pointers=new Map();
    $('#btn-w-atlas').onclick=()=>this.open();
    $('#btn-atlas-back').onclick=()=>this.close();
    $('#atlas-country').innerHTML=Object.values(ATLAS_REGIONS).sort((a,b)=>a.name.localeCompare(b.name,'nb')).map(r=>`<option value="${r.id}">${r.name}</option>`).join('');
    $('#atlas-country').onchange=e=>{this.selected=e.target.value;this.preferredLeg=null;this.refresh();};
    for(const id of ['atlas-mode','atlas-land-mode'])$('#'+id).onchange=()=>this.refresh();
    $('#btn-atlas-find').onclick=()=>this.findDeparture();
    $('#btn-atlas-travel').onclick=()=>this.travel();
    $('#atlas-zoom-in').onclick=()=>this.zoomAt(this.zoom*1.5);
    $('#atlas-zoom-out').onclick=()=>this.zoomAt(this.zoom/1.5);
    $('#atlas-fit').onclick=()=>{this.zoom=1;this.pan=[0,0];this.draw();};
    $('#atlas-focus').onclick=()=>this.focus();
    this.cv.addEventListener('wheel',e=>{e.preventDefault();const p=this.eventPoint(e);this.zoomAt(this.zoom*Math.exp(-e.deltaY*.002),p);},{passive:false});
    this.cv.addEventListener('pointerdown',e=>this.pointerDown(e));
    this.cv.addEventListener('pointermove',e=>this.pointerMove(e));
    this.cv.addEventListener('pointerup',e=>this.pointerUp(e));
    this.cv.addEventListener('pointercancel',e=>this.pointers.delete(e.pointerId));
    this.cv.addEventListener('keydown',e=>{
      const deltas={ArrowLeft:[50,0],ArrowRight:[-50,0],ArrowUp:[0,50],ArrowDown:[0,-50]};
      if(deltas[e.key]){e.preventDefault();this.pan[0]+=deltas[e.key][0];this.pan[1]+=deltas[e.key][1];this.draw();}
      else if(['+','=','-','0'].includes(e.key)){e.preventDefault();if(e.key==='0'){this.zoom=1;this.pan=[0,0];this.draw();}else this.zoomAt(this.zoom*(e.key==='-'?1/1.5:1.5));}
    });
    addEventListener('resize',()=>{if(this.isOpen)this.draw();});
  }
  get isOpen(){return !$('#atlas').hidden;}
  open(target){
    if(G.state!=='world'||G.worldview.moving||!$('#w-enc').hidden)return;
    this.selected=ATLAS_REGIONS[target]?target:W().region;this.preferredLeg=null;
    this.busy=false;G.state='atlas';G.ui.show('atlas');G.audio.ui();this.refresh();
  }
  close(){if(!this.busy&&this.isOpen)G.worldview.open();}

  refresh(){
    const w=W(),r=ATLAS_REGIONS[this.selected];
    $('#atlas-country').value=r.id;
    $('#atlas-place').textContent=`Du er i ${worldMap().name}. Dag ${Math.floor(G.run.clock/24)+1}. ${G.player.silver} sm.`;
    $('#atlas-name').textContent=r.name;$('#atlas-lore').textContent=r.lore;$('#atlas-rumor').textContent=r.rumor;
    const list=$('#atlas-departures'),connections=connectionsFrom(w.region);
    list.innerHTML=connections.map(c=>`<button class="atlas-link" data-dest="${c.to}" data-connection="${c.id}">${c.kind==='skip'?'Skip til '+PLACES[c.b].name:'Vei til '+ATLAS_REGIONS[c.to].name}<small>Fra ${PLACES[c.a].name}, ${ATLAS_REGIONS[c.to].name}</small></button>`).join('');
    list.querySelectorAll('button').forEach(b=>b.onclick=()=>{this.selected=b.dataset.dest;this.preferredLeg=b.dataset.connection;this.refresh();});
    const route=atlasRoute(w.region,r.id);
    const here=connections.find(c=>c.to===r.id&&PLACES[c.a].x===w.x&&PLACES[c.a].y===w.y);
    this.leg=connections.find(c=>c.id===this.preferredLeg&&c.to===r.id)||here||route?.[0]||null;
    this.route=w.region===r.id?[]:this.leg?[this.leg,...(atlasRoute(this.leg.to,r.id)||[])]:[];
    const el=$('#atlas-route'),find=$('#btn-atlas-find'),go=$('#btn-atlas-travel');
    find.hidden=true;go.hidden=true;$('#atlas-mode-wrap').hidden=true;$('#atlas-land-wrap').hidden=true;
    if(w.region===r.id)el.textContent='Dette er regionen du utforsker nå. Gå tilbake til regionkartet for å velge et sted.';
    else if(!this.leg)el.textContent='Du kjenner ingen ferdselsvei hit ennå.';
    else{
      const q=journeyQuote(this.leg.id,$('#atlas-mode').value==='crew',$('#atlas-land-mode').value);
      const indirect=this.leg.to!==r.id,dest=ATLAS_REGIONS[this.leg.to].name;
      const total=this.route.reduce((n,c)=>n+c.hours,0)-this.leg.hours+q.hours;
      const estimate=this.leg.estimated||this.leg.bookDays==null;
      let text=`${indirect?`Første etappe går til ${dest}. `:''}Fra ${q.departure} til ${q.destination}: ${estimate?'omtrent ':''}${formatDuration(q.hours)}. `;
      if(q.schedule)text+=`${Math.round(this.leg.km)} km med nattestans. `;
      text+=q.fare?`${q.fare} sm. `:'Ingen billett. ';
      text+=q.meals?'Mat er inkludert underveis. ':`Ta med ${q.supplies} dagsrasjoner. `;
      if(q.landMode==='march'&&q.schedule)text+=`Lätt SMI hver dag; opptil ${formatDuration(q.maxHours)} ved missøder. `;
      if(indirect)text+=`Etappene videre gir minst ${formatDuration(total)}, i tillegg til ferd mellom avgangsstedene. `;
      const quest=G.run.ivan;
      if(quest?.deadline!=null&&!quest.flags?.truce&&!quest.flags?.storm&&G.run.clock+q.hours>=quest.deadline)text+='Fristen i Edelfara utløper før denne reisen er ferdig. ';
      for(const entry of G.campaign?questEntries(G.campaign,G.run.clock):[]) if(entry.hours!=null&&q.hours>=entry.hours)text+=`Fristen for «${entry.title}» utløper under denne reisen. `;
      if(!q.affordable)text+=this.leg.kind==='skip'?'Du mangler silver. Du kan arbeide deg over.':'Du mangler silver til karavanen.';
      if(!q.foodReady)text+='Provianten rekker ikke. Skaff mer, eller velg karavane med mat underveis.';
      el.textContent=text;
      $('#atlas-mode-wrap').hidden=this.leg.kind!=='skip';$('#atlas-land-wrap').hidden=this.leg.kind==='skip';
      find.hidden=q.atDeparture;go.hidden=!q.atDeparture;find.textContent=`Finn avgangen i ${q.departure}`;
      go.textContent=this.leg.kind==='skip'?(q.crew?'Ta hyre og reis':'Kjøp passasje og reis'):q.caravan?'Bli med karavanen':`Følg veien til ${dest}`;
      go.disabled=!q.affordable||!q.foodReady||this.busy;
    }
    $('#atlas-journal').innerHTML=(w.journeys||[]).slice(-4).reverse().map(j=>`<li>${ATLAS_REGIONS[j.from].name} til ${ATLAS_REGIONS[j.to].name}, ${formatDuration(j.end-j.start)}, dag ${Math.floor(j.end/24)+1}</li>`).join('');
    this.draw();
  }

  transform(){
    const scale=Math.min(this.cv.width/EREB_MAP.width,this.cv.height/EREB_MAP.height)*this.zoom;
    const dx=Math.max(0,(EREB_MAP.width*scale-this.cv.width)/2),dy=Math.max(0,(EREB_MAP.height*scale-this.cv.height)/2);
    this.pan[0]=Math.max(-dx,Math.min(dx,this.pan[0]));this.pan[1]=Math.max(-dy,Math.min(dy,this.pan[1]));
    return {scale,x:(this.cv.width-EREB_MAP.width*scale)/2+this.pan[0],y:(this.cv.height-EREB_MAP.height*scale)/2+this.pan[1]};
  }
  mapToCanvas(point){const t=this.transform();return [point[0]*t.scale+t.x,point[1]*t.scale+t.y];}
  canvasToMap(point){const t=this.transform();return [(point[0]-t.x)/t.scale,(point[1]-t.y)/t.scale];}
  eventPoint(e){const b=this.cv.getBoundingClientRect();return [(e.clientX-b.left)*this.cv.width/b.width,(e.clientY-b.top)*this.cv.height/b.height];}
  zoomAt(value,point=[this.cv.width/2,this.cv.height/2]){
    const before=this.canvasToMap(point);this.zoom=Math.max(1,Math.min(6,value));
    const after=this.mapToCanvas(before);this.pan[0]+=point[0]-after[0];this.pan[1]+=point[1]-after[1];this.draw();
  }
  focus(){
    this.zoom=Math.max(2.5,this.zoom);this.pan=[0,0];
    const p=this.mapToCanvas(ATLAS_REGIONS[this.selected].geo);
    this.pan=[this.cv.width/2-p[0],this.cv.height/2-p[1]];this.draw();
  }
  pointerDown(e){
    if(e.button!==0)return;
    this.cv.setPointerCapture(e.pointerId);const p=this.eventPoint(e);
    this.pointers.set(e.pointerId,{p,start:p,moved:false});
    if(this.pointers.size===2){for(const item of this.pointers.values())item.moved=true;this.pinchDistance=null;}
  }
  pointerMove(e){
    const item=this.pointers.get(e.pointerId);if(!item)return;
    const p=this.eventPoint(e),old=item.p;item.p=p;
    if(this.pointers.size===2){
      const [a,b]=[...this.pointers.values()].map(v=>v.p),distance=Math.hypot(a[0]-b[0],a[1]-b[1]);
      if(this.pinchDistance)this.zoomAt(this.zoom*distance/this.pinchDistance,[(a[0]+b[0])/2,(a[1]+b[1])/2]);
      this.pinchDistance=distance;return;
    }
    if(Math.hypot(p[0]-item.start[0],p[1]-item.start[1])>5)item.moved=true;
    if(item.moved){this.pan[0]+=p[0]-old[0];this.pan[1]+=p[1]-old[1];this.draw();}
  }
  pointerUp(e){
    const item=this.pointers.get(e.pointerId);if(!item)return;
    this.pointers.delete(e.pointerId);this.pinchDistance=null;
    if(item.moved)return;
    const p=this.eventPoint(e),candidates=[];
    for(const r of Object.values(ATLAS_REGIONS))candidates.push({region:r.id,point:r.geo});
    for(const [id,g] of Object.entries(PORT_GEO))if(PLACES[id])candidates.push({region:PLACES[id].map,port:id,point:g.point});
    const nearest=candidates.map(c=>({ ...c,d:Math.hypot(...this.mapToCanvas(c.point).map((v,i)=>v-p[i])) })).sort((a,b)=>a.d-b.d)[0];
    if(nearest?.d<=22){
      this.selected=nearest.region;
      this.preferredLeg=nearest.port?connectionsFrom(W().region).find(c=>c.b===nearest.port)?.id:null;
      this.refresh();
    }
  }

  draw(){
    const width=Math.max(280,Math.floor(this.cv.parentElement.clientWidth)),height=Math.floor(Math.min(width*.7182,Math.max(180,innerHeight-240)));
    if(this.cv.width!==width||this.cv.height!==height){this.cv.width=width;this.cv.height=height;}
    const g=this.ctx,t=this.transform(),map=textureImage('ereb_altor');
    this.mapLoaded=!!map;
    g.fillStyle='#211b15';g.fillRect(0,0,width,height);
    if(map)g.drawImage(map,t.x,t.y,EREB_MAP.width*t.scale,EREB_MAP.height*t.scale);
    else{g.fillStyle='#eee1c3';g.font='16px Georgia';g.fillText('Kartbildet kunne ikke lastes.',18,32);return;}
    // Kontrastkontur under streken gjør den synlig på kartets ulike terrengfarger.
    for(const c of this.route||[]){
      const points=c.route.map(p=>this.mapToCanvas(p));
      const trace=()=>{g.beginPath();points.forEach((p,i)=>i?g.lineTo(...p):g.moveTo(...p));};
      g.setLineDash(c.kind==='skip'?[6,4]:[]);g.lineWidth=5;g.strokeStyle='#f8ecd9';trace();g.stroke();
      g.lineWidth=2.5;g.strokeStyle=c.kind==='skip'?'#154a86':'#832918';trace();g.stroke();
    }
    g.setLineDash([]);
    const w=W(),selected=ATLAS_REGIONS[this.selected];
    for(const r of Object.values(ATLAS_REGIONS)){
      const [x,y]=this.mapToCanvas(r.geo);g.beginPath();g.arc(x,y,3,0,Math.PI*2);g.fillStyle='#d6bb78';g.fill();g.strokeStyle='#30271e';g.lineWidth=1;g.stroke();
    }
    for(const [id,p] of Object.entries(PORT_GEO)){
      const [x,y]=this.mapToCanvas(p.point);g.fillStyle=id===this.leg?.b?'#f5d66a':'#f4e4ad';g.fillRect(x-2,y-2,4,4);
    }
    const current=PLACES[placeAt(w.x,w.y)]?.geo||ATLAS_REGIONS[w.region].geo;
    for(const [point,name,color] of [[selected.geo,selected.name,'#14528d'],[current,'Du er her','#962c1a']]){
      const [x,y]=this.mapToCanvas(point);g.beginPath();g.arc(x,y,6,0,Math.PI*2);g.fillStyle=color;g.fill();g.strokeStyle='#fff0cc';g.lineWidth=2;g.stroke();
      g.font='bold 13px Georgia';g.textAlign=x>width*.8?'right':'left';
      const dx=x>width*.8?-10:10;g.lineWidth=3;g.strokeStyle='#fff0cc';g.strokeText(name,x+dx,y-8);g.fillStyle=color;g.fillText(name,x+dx,y-8);
    }
    $('#atlas-zoom').textContent=`${Math.round(this.zoom*100)} %`;
    $('#atlas-zoom-out').disabled=this.zoom<=1;$('#atlas-zoom-in').disabled=this.zoom>=6;
  }

  findDeparture(){
    if(this.busy||!this.leg)return;
    const p=PLACES[this.leg.a];reveal(this.leg.a,true);this.close();G.worldview.select(p.x,p.y);
  }
  travel(){
    if(this.busy||!this.leg||!this.isOpen)return;
    const r=takeJourney(this.leg.id,$('#atlas-mode').value==='crew',$('#atlas-land-mode').value);
    if(!r.ok){$('#atlas-route').textContent=r.why;return;}
    this.busy=true;G.state='transition';document.activeElement?.blur?.();
    G.game.wipe(()=>{
      const w=W(),p=PLACES[r.destination];
      if(p.kind==='fristaden')G.game.loadFloor(0,null,false,'gate');
      else if(p.kind==='by')G.game.loadTemplate({kind:'by',id:r.destination},'west');
      else G.game.loadTemplate({kind:'vill',x:w.x,y:w.y,terr:terrainAt(w.x,w.y),road:!!roadAt(w.x,w.y),seed:w.x*73+w.y*151},'south');
      this.busy=false;G.worldview.open({note:r.note});saveGame('auto',true);
    });
  }
}
