/* =====================================================================
   KILL RACE 10b. THE RACE
   Three laps of eight checkpoints around the town against five armed racers.
   Every leg runs straight down a road from one intersection to the next.
   Each checkpoint is a gate of two burning barrels; the next one flashes,
   shows on the radar, and has an arrow at the top of the screen.
   Racers drive a driving-distance field to their next checkpoint (one field
   per checkpoint, built once), shoot whoever is in front of them, and ram
   the player if he is right there. A little rubber band keeps the pack honest.
   Wreck a racer and he is out. Wreck all five and the race is yours.
   ===================================================================== */
const RACE={on:false,laps:3,cps:[],t:0,count:0,done:false,finish:[],pos:1};
const ROUTE=[[2,0],[4,0],[4,2],[2,2],[2,4],[0,4],[0,2],[0,0]];
// the field: Bagman's rogues, each in something that suits them. Heavy ones get bigger engines to keep up
const RACERS=[['sedanR','ANOLE',1],['sedanY','SKINK',1],['cruiser','IGUANA',1],['reefer','GILA',1.2],['rv','CHUCKWALLA',1.18]];
const CLOCK0=75;
const PRIZE=[10000,6000,4000,2000,1000,500];
let GAMEMODE='waves';
function cpPos(g){const p=CITY.blk+CITY.road;return[1+3+g[0]*p+.5,1+3+g[1]*p+.5];}

function newRace(){GAMEMODE='race';L=genCity(7);const W=L.W;
  RACE.cps=ROUTE.map(cpPos);
  for(const[x,y,a,k]of L.parkAt)if(!(y<9&&x>8&&x<30)&&!onCourse(x,y))L.vcars.push(makeCar(k,x,y,a,{parked:true,hp:90,hp0:90}));
  // clear the starting grid
  for(let i=L.things.length-1;i>=0;i--){const t=L.things[i];if(t.y<9&&t.x>8&&t.x<30&&t.t!=='item'){if(t.cell!==undefined||t.blk)L.block[Math.floor(t.y)*W+Math.floor(t.x)]=0;L.things.splice(i,1);}}
  L.fires=L.fires.filter(f=>!(f.y<9&&f.x>8&&f.x<30));
  for(let y=1;y<9;y++)for(let x=8;x<30;x++)L.oil[y*W+x]=0;
  RACE.cps=ROUTE.map(cpPos);const n=RACE.cps.length;
  // keep drums and burning barrels off the middle lanes of the course; the oil stays
  const onLine=(x,y)=>onCourse(x,y,2.6);
  for(let i=L.things.length-1;i>=0;i--){const t=L.things[i];if((t.boom||t.d===dec('FIRE'))&&onLine(t.x,t.y)){L.block[Math.floor(t.y)*W+Math.floor(t.x)]=0;L.things.splice(i,1);}}
  L.fires=L.fires.filter(f=>!onLine(f.x,f.y));
  placeRamps(null,RACE.cps);setupPickups(rng(99));resetPlayer();spawnPeds(30,6);
  L.cpField=RACE.cps.map(([x,y])=>{const f=new Float32Array(W*L.H);computeFlowFrom(Math.floor(y)*W+Math.floor(x),f);return f;});
  // gates across the road, square to the way you arrive
  RACE.cps.forEach(([x,y],i)=>{const[px,py]=RACE.cps[(i+n-1)%n],dx=x-px,dy=y-py,l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;
    for(const s of[-3.3,3.3])L.things.push({t:'deco',x:x+nx*s,y:y+ny*s,d:dec('FIRE'),cp:i});});
  // the grid: two columns on the top road, between the finish line and the first checkpoint
  const slots=[[23,3.2],[23,5.8],[20,3.2],[20,5.8],[17,3.2],[17,5.8]],me=3;
  slots.forEach(([x,y],k)=>{if(k===me){P.x=x;P.y=y;P.a=0;setDir();return;}const[kind,name,tb]=RACERS[(k>me?k-1:k)],hp=Math.max(200,CARK[kind].hp);
    L.vcars.push(makeCar(kind,x,y,0,{racer:true,name,tbase:tb,cp:0,lap:1,hp,hp0:hp,aggro:kind==='cruiser'||kind==='reefer'||rnd()<.4,cool:4+rnd()*3,nitro:100}));});
  spawnTraffic(8);
  P.cp=0;P.lap=1;Object.assign(RACE,{on:true,t:0,clock:CLOCK0,count:3.6,done:false,finish:[],pos:me+1,lastN:4,lastCar:0,place:0,outOfTime:0,bonus:null,tick:0});
  WAVE.n=0;WAVE.queue=[];WAVE.clear=false;
  msgs=[];big={t:'',time:0,c:C_Y};combo={t:'',time:0,n:0};parts.length=0;
  state='play';setBody('m-game');rumbleOn(true);ambFor(L);audioInit();}

// how far round the course someone is: laps, checkpoints, then road distance to the next one
function raceProg(r){const f=L.cpField[r.cp],d=f[Math.floor(r.y)*L.W+Math.floor(r.x)];return((r.lap-1)*RACE.cps.length+r.cp)*300-Math.min(299,d>=1e9?299:d);}
function updRace(dt){
  if(RACE.count>0){const before=Math.ceil(RACE.count);RACE.count-=dt;const now=Math.ceil(RACE.count);
    if(now!==before||RACE.lastN!==now){RACE.lastN=now;if(now>0){bigMsg(String(now),.9,C_R);play('menu',.8,.9);}else{bigMsg('GO!',1.2,C_G);SFX.horn();}}
    P.vx=P.vy=0;for(const c of L.vcars)if(c.racer){c.vx=c.vy=0;}return;}
  if(RACE.done)return;RACE.t+=dt;const n=RACE.cps.length;if(RACE.bonus)RACE.bonus.t-=dt;
  // Carmageddon's clock: it only stays topped up if you keep hitting checkpoints and things
  if(!P.dead&&!P.fin){RACE.clock-=dt;if(RACE.clock<=0){RACE.clock=0;bigMsg('OUT OF TIME',2.4,C_R);SFX.pdie();RACE.done=true;RACE.outOfTime=1;setTimeout(()=>{if(state==='play')gameOver();},2200);return;}
    if(RACE.clock<10&&Math.ceil(RACE.clock)!==RACE.tick){RACE.tick=Math.ceil(RACE.clock);play('menu',.6,1.8);}}
  const runners=[P,...L.vcars.filter(c=>c.racer&&!c.dead&&!c.fin)];
  for(const r of runners){if(r===P&&(P.dead||P.fin))continue;const[cx,cy]=RACE.cps[r.cp];if(Math.hypot(r.x-cx,r.y-cy)>5)continue;
    r.cp=(r.cp+1)%n;if(r.cp===0)r.lap++;
    if(r.lap>RACE.laps){r.fin=RACE.t;RACE.finish.push(r);if(r===P){raceEnd();return;}feed(r.name+' FINISHES',C_GR);continue;}
    if(r===P){if(r.cp===0){bigMsg(r.lap===RACE.laps?'FINAL LAP':'LAP '+r.lap+'/'+RACE.laps,1.8,C_Y);SFX.key();}else{feed('CHECKPOINT '+r.cp+'/'+n,C_C);SFX.pick();}P.score+=200;addTime(10);}}
  // positions and the rubber band
  const ranked=[P,...L.vcars.filter(c=>c.racer&&!c.dead)].sort((a,b)=>(b.fin?1e9-b.fin:raceProg(b))-(a.fin?1e9-a.fin:raceProg(a)));
  RACE.pos=ranked.indexOf(P)+1;const mine=raceProg(P);
  for(const c of L.vcars)if(c.racer&&!c.dead){const d=raceProg(c)-mine;c.tmul=(c.tbase||1)*(d>500?.88:d<-700?1.14:d<-250?1.06:1);}
  if(!L.vcars.some(c=>c.racer&&!c.dead&&!c.fin)&&!P.dead){RACE.lastCar=1;raceEnd();}}
function raceEnd(){RACE.done=true;P.fin=P.fin||RACE.t;const pos=RACE.lastCar&&!RACE.finish.some(r=>r!==P)?1:RACE.finish.indexOf(P)+1||RACE.pos;
  RACE.place=pos;P.score+=PRIZE[pos-1]||0;bigMsg(pos===1?(RACE.lastCar?'LAST CAR DRIVING':'YOU WIN'):'FINISHED '+ordinal(pos),2.5,pos===1?C_Y:C_W);
  if(pos===1){SFX.combo(20);CRT.boom=.6;}else SFX.wave();
  if(pos===1&&(!BEST.race||RACE.t<BEST.race)){BEST.race=RACE.t;P.newRace=1;}
  setTimeout(()=>{if(state==='play'&&RACE.done)gameOver();},2600);}
const ordinal=n=>n+(['ST','ND','RD'][n-1]||'TH');
const fmtTime=t=>Math.floor(t/60)+':'+(t%60).toFixed(1).padStart(4,'0');
function addTime(s){if(!RACE.on||RACE.done||!s)return;RACE.clock+=s;RACE.bonus={s,t:1.2};}
// is a point on the course? w is how far either side of a leg's centre line counts
function onCourse(x,y,w=3.6){const n=RACE.cps.length;return RACE.cps.some(([ax,ay],i)=>{const[bx,by]=RACE.cps[(i+1)%n];
  return Math.abs(ax-bx)<1?Math.abs(x-ax)<w&&y>=Math.min(ay,by)-3&&y<=Math.max(ay,by)+3:Math.abs(y-ay)<w&&x>=Math.min(ax,bx)-3&&x<=Math.max(ax,bx)+3;});}
