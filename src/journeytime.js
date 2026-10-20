// DoD91 Bok II s. 5: gång 20 km og marsch 30 km på 12 timer, resten av døgnet hvile.
// Vær gir 75 % eller 50 % dagsdistanse. Terrengfaktorene og missødet er spilltilpasninger.
export const TRAVEL_RULES={ walkKm:20,marchKm:30,startHour:6,endHour:18,uvTerrain:true };
export const weatherFactor=kind=>['storm','uvar','uvær'].includes(kind)?.5:kind==='regn'?.75:1;
export const terrainFactor=(terrain,road)=>road?1:terrain==='^'?.5:terrain==='F'?.65:1;

export function walkSchedule(km,clock,{ pace='walk',terrain='.',road=true,weather=()=> 'klart',dayKm=null }={}) {
  let left=Math.max(0,km),at=clock,restHours=0;
  const nights=[];
  const daily=pace==='march'?TRAVEL_RULES.marchKm:TRAVEL_RULES.walkKm;
  while(left>1e-7) {
    const day=Math.floor(at/24),h=at-day*24;
    if(h<6||h>=18-1e-7) {
      const next=(h<6?day:day+1)*24+6;
      const end=next>at+1e-7?next:at+12;
      nights.push({ start:at,end });restHours+=end-at;at=end;continue;
    }
    // Været ligger i tretimersblokker. Del ved neste værskifte for likt anslag og faktisk tur.
    const speed=(dayKm?dayKm(day):daily)/12*terrainFactor(terrain,road)*weatherFactor(weather(at));
    const step=Math.min(18-h,3-(h%3),left/speed);
    left-=step*speed;at+=step;
  }
  return { hours:at-clock,end:at,restHours,movingHours:at-clock-restHours,nights,km };
}

export function formatDuration(hours) {
  const mins=Math.round(hours*60),days=Math.floor(mins/1440),h=Math.floor((mins%1440)/60),m=mins%60;
  if(days)return `${days} døgn${h?' '+h+' t':''}${!h&&m?' '+m+' min':''}`;
  if(h)return `${h} t${m?' '+m+' min':''}`;
  return `${m} min`;
}
