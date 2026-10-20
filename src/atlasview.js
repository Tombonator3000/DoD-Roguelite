// Verdensatlas i blekk og pergament. Regionkartene og 3D-områdene er egne lag.
import { G } from './state.js';
import { ATLAS_REGIONS, ATLAS_LAND } from './atlasdata.js';
import { PLACES, connectionsFrom, atlasRoute } from './regionalmaps.js';
import { W, reveal, worldMap, terrainAt, roadAt } from './worldtravel.js';
import { journeyQuote, takeJourney } from './atlastravel.js';
import { saveGame } from './save.js';
import { textureImage } from './textures.js';

const $ = s => document.querySelector(s);
const hours = h => `${Math.round(h*10)/10}`.replace('.',',') + ' t';

export class AtlasView {
  constructor() {
    this.cv = $('#atlas-map'); this.ctx = this.cv.getContext('2d');
    this.selected = 'aidne'; this.busy = false;
    $('#btn-w-atlas').onclick = () => this.open();
    $('#btn-atlas-back').onclick = () => this.close();
    $('#atlas-country').innerHTML = Object.values(ATLAS_REGIONS).sort((a,b)=>a.name.localeCompare(b.name,'nb')).map(r=>`<option value="${r.id}">${r.name}</option>`).join('');
    $('#atlas-country').onchange = e => { this.selected=e.target.value; this.preferredLeg=null; this.refresh(); };
    $('#atlas-mode').onchange = () => this.refresh();
    $('#btn-atlas-find').onclick = () => this.findDeparture();
    $('#btn-atlas-travel').onclick = () => this.travel();
    this.cv.addEventListener('click',e=> {
      const b=this.cv.getBoundingClientRect(), x=(e.clientX-b.left)/b.width*100, y=(e.clientY-b.top)/b.height*100;
      const nearest=Object.values(ATLAS_REGIONS).map(r=>[r,Math.hypot((r.x-x)*b.width/100,(r.y-y)*b.height/100)]).sort((a,b)=>a[1]-b[1])[0];
      if (nearest && nearest[1]<24) { this.selected=nearest[0].id; this.preferredLeg=null; this.refresh(); }
    });
    addEventListener('resize',()=> { if (this.isOpen) this.draw(); });
  }
  get isOpen() { return !$('#atlas').hidden; }

  open(target) {
    if (G.state!=='world' || G.worldview.moving || !$('#w-enc').hidden) return;
    this.selected = ATLAS_REGIONS[target] ? target : W().region;
    this.preferredLeg=null;
    this.busy = false; G.state='atlas'; G.ui.show('atlas'); G.audio.ui();
    this.refresh();
  }
  close() {
    if (this.busy || !this.isOpen) return;
    G.worldview.open();
  }

  refresh() {
    const w=W(), r=ATLAS_REGIONS[this.selected];
    $('#atlas-country').value=r.id;
    $('#atlas-place').textContent=`Du er i ${worldMap().name}. Dag ${Math.floor(G.run.clock/24)+1}. ${G.player.silver} sm.`;
    $('#atlas-name').textContent=r.name;
    $('#atlas-lore').textContent=r.lore;
    $('#atlas-rumor').textContent=r.rumor;
    const list=$('#atlas-departures');
    const connections=connectionsFrom(w.region);
    list.innerHTML=connections.map(c=>`<button class="atlas-link" data-dest="${c.to}" data-connection="${c.id}">${c.kind==='skip' ? 'Skip til '+PLACES[c.b].name : 'Vei til '+ATLAS_REGIONS[c.to].name}<small>Fra ${PLACES[c.a].name}, ${ATLAS_REGIONS[c.to].name}</small></button>`).join('');
    list.querySelectorAll('button').forEach(b=>b.onclick=()=> { this.selected=b.dataset.dest; this.preferredLeg=b.dataset.connection; this.refresh(); });
    const route=atlasRoute(w.region,r.id);
    // Samme land kan nås fra både havn og grensevei. Bruk avgangen vi faktisk står ved.
    const here=connections.find(c=>c.to===r.id && PLACES[c.a].x===w.x && PLACES[c.a].y===w.y);
    this.leg=connections.find(c=>c.id===this.preferredLeg && c.to===r.id) || here || route?.[0] || null;
    const el=$('#atlas-route'), find=$('#btn-atlas-find'), go=$('#btn-atlas-travel');
    find.hidden=true; go.hidden=true; $('#atlas-mode-wrap').hidden=true;
    if (w.region===r.id) el.textContent='Dette er regionen du utforsker nå. Gå tilbake til regionkartet for å velge et sted.';
    else if (!this.leg) el.textContent='Du kjenner ingen ferdselsvei hit ennå.';
    else {
      const q=journeyQuote(this.leg.id,$('#atlas-mode').value==='crew');
      const indirect=this.leg.to!==r.id;
      const dest=ATLAS_REGIONS[this.leg.to].name;
      el.textContent=`${indirect ? `Første etappe går til ${dest}. ` : ''}Fra ${q.departure} til ${q.destination}: ${q.crew ? `${hours(q.minHours)} til ${hours(q.hours)}` : hours(q.hours)}. ${q.fare ? `${q.fare} sm.` : 'Ingen billett.'}${this.leg.kind==='skip' ? ' Mat er inkludert om bord.' : ' Ta med proviant.'}`;
      $('#atlas-mode-wrap').hidden=this.leg.kind!=='skip';
      find.hidden=q.atDeparture; go.hidden=!q.atDeparture;
      find.textContent=`Finn avgangen i ${q.departure}`;
      go.textContent=this.leg.kind==='skip' ? (q.crew ? 'Ta hyre og reis' : 'Kjøp passasje og reis') : `Følg veien til ${dest}`;
      go.disabled=!q.affordable || this.busy;
      if (!q.affordable) el.textContent+=' Du har ikke nok silver. Velg hyre for å arbeide deg over.';
    }
    $('#atlas-journal').innerHTML=(w.journeys||[]).slice(-4).reverse().map(j=>`<li>${ATLAS_REGIONS[j.from].name} til ${ATLAS_REGIONS[j.to].name}, dag ${Math.floor(j.end/24)+1}</li>`).join('');
    this.draw();
  }

  draw() {
    const width=Math.max(280,Math.floor(this.cv.parentElement.clientWidth)), height=Math.floor(Math.min(width*0.78,Math.max(180,innerHeight-220)));
    if (this.cv.width!==width || this.cv.height!==height) { this.cv.width=width; this.cv.height=height; }
    const g=this.ctx, X=x=>x/100*width, Y=y=>y/100*height;
    g.fillStyle='#aec1bb'; g.fillRect(0,0,width,height);
    for (const poly of ATLAS_LAND) {
      g.beginPath(); poly.forEach(([x,y],i)=>i ? g.lineTo(X(x),Y(y)) : g.moveTo(X(x),Y(y))); g.closePath();
      g.fillStyle='#cfc79f'; g.fill(); g.strokeStyle='#6c7250'; g.lineWidth=1.5; g.stroke();
    }
    // Pergament og små blekktegn gir kartet lesbar struktur uten nye bildefiler.
    const paper=textureImage('pergament_c');
    if (paper) { g.save(); g.globalAlpha=.16; g.drawImage(paper,0,0,width,height); g.restore(); }
    g.strokeStyle='rgba(70,75,47,.5)'; g.lineWidth=1;
    for (const [cx,cy] of [[25,59],[31,58],[52,39],[52,57]]) for (let i=0;i<7;i++) {
      const x=X(cx-2+(i%3)*1.1),y=Y(cy-3+Math.floor(i/3)*1.2),s=Math.max(2,width/160);
      g.beginPath();g.moveTo(x,y-s*2);g.lineTo(x-s,y+s);g.lineTo(x+s,y+s);g.closePath();g.stroke();
    }
    for (const [cx,cy] of [[32,63],[39,29],[59,56],[43,95]]) for (let i=0;i<5;i++) {
      const x=X(cx+i*.8),y=Y(cy+i*.7),s=Math.max(3,width/130);
      g.beginPath();g.moveTo(x-s,y+s);g.lineTo(x,y-s);g.lineTo(x+s,y+s);g.stroke();
    }
    g.fillStyle='rgba(53,83,87,.65)'; g.font=`italic ${Math.max(11,width/39)}px Georgia`; g.textAlign='center';
    for (const [name,x,y] of [['Kopparhavet',44,88],['Västerhavet',10,68],['Masevabukten',78,36]]) g.fillText(name,X(x),Y(y));
    const w=W(), route=atlasRoute(w.region,this.selected);
    for (const c of route||[]) {
      const a=ATLAS_REGIONS[c.from], b=ATLAS_REGIONS[c.to];
      g.strokeStyle=c.kind==='skip' ? '#3e6d88' : '#9f5133'; g.lineWidth=2; g.setLineDash(c.kind==='skip' ? [5,4] : [2,3]);
      g.beginPath(); g.moveTo(X(a.x),Y(a.y)); g.lineTo(X(b.x),Y(b.y)); g.stroke();
    }
    g.setLineDash([]);
    const radius=Math.max(3,width/150);
    for (const r of Object.values(ATLAS_REGIONS)) {
      const visited=!!w.maps[r.id], here=r.id===w.region, selected=r.id===this.selected;
      g.beginPath(); g.arc(X(r.x),Y(r.y),radius*(here||selected ? 1.5 : 1),0,Math.PI*2);
      g.fillStyle=here ? '#93432e' : visited ? '#405d48' : '#77684c'; g.fill();
      g.strokeStyle=selected ? '#822d22' : '#ece0bb'; g.lineWidth=selected ? 3 : 1.2; g.stroke();
      if (here||selected||width>650) {
        g.font=`${here||selected ? 'bold ' : ''}${Math.max(10,width/67)}px Georgia`;
        g.textAlign=r.x>80 ? 'right' : 'left';
        const dx=r.x>80 ? -9 : 9;
        g.lineWidth=3; g.strokeStyle='#eee2bf'; g.strokeText(r.name,X(r.x)+dx,Y(r.y)+4);
        g.fillStyle='#302b20'; g.fillText(r.name,X(r.x)+dx,Y(r.y)+4);
      }
    }
  }

  findDeparture() {
    if (this.busy || !this.leg) return;
    const p=PLACES[this.leg.a]; reveal(this.leg.a,true);
    this.close(); G.worldview.select(p.x,p.y);
  }

  travel() {
    if (this.busy || !this.leg || !this.isOpen) return;
    const r=takeJourney(this.leg.id,$('#atlas-mode').value==='crew');
    if (!r.ok) { $('#atlas-route').textContent=r.why; return; }
    this.busy=true; G.state='transition'; document.activeElement?.blur?.();
    G.game.wipe(()=> {
      const w=W(), p=PLACES[r.destination];
      // Bygg riktig bakgrunnsområde også når spillet lagres på regionkartet.
      if (p.kind==='fristaden') G.game.loadFloor(0,null,false,'gate');
      else if (p.kind==='by') G.game.loadTemplate({ kind:'by',id:r.destination },'west');
      else G.game.loadTemplate({ kind:'vill',x:w.x,y:w.y,terr:terrainAt(w.x,w.y),road:!!roadAt(w.x,w.y),seed:w.x*73+w.y*151 },'south');
      this.busy=false;
      G.worldview.open({ note:r.note });
      saveGame('auto',true);
    });
  }
}
