/* =====================================================================
   KILL RACE 10. WAVES
   The Geckos send cars in waves, a few at a time, from the far side of town.
   New kinds join as the waves climb: bikes from wave 2, pickups from 3,
   cruisers from 4. Every fourth wave a boss rig leads, named for Bagman's
   bosses. From wave 2 deputies come out on foot as well, and dogs from 3.
   ===================================================================== */
const WAVE={n:0,queue:[],spawnT:0,pause:3,clear:false};
const BOSSN=['GILA','IGUANA','KOMODO'];
function newGame(){GAMEMODE='waves';RACE.on=false;L=genCity(7);computeCarFlow();
  for(const[x,y,a,k]of L.parkAt)L.vcars.push(makeCar(k,x,y,a,{parked:true,hp:90,hp0:90}));
  setupPickups(rng(99));resetPlayer();spawnPeds(30,6);spawnTraffic(10);
  for(const b of L.blocks)if(b.type==='park')for(let k=0;k<2;k++){const x=b.x0+3+k*5+.5,y=b.y0+6.5;if(!L.block[Math.floor(y)*L.W+Math.floor(x)])L.enemies.push(makeEnemy('dog',x,y,rnd));}
  Object.assign(WAVE,{n:0,queue:[],spawnT:0,pause:3,clear:false});
  msgs=[];big={t:'',time:0,c:C_Y};combo={t:'',time:0,n:0};parts.length=0;
  state='play';setBody('m-game');rumbleOn(true);ambFor(L);audioInit();bigMsg('KILL RACE',2.4,C_Y);feed('THE GECKOS ARE COMING',C_R);}

function waveStart(){const n=++WAVE.n;WAVE.clear=false;WAVE.queue=[];
  const cnt=Math.min(14,2+n);
  if(n%4===0)WAVE.queue.push('boss');
  for(let k=0;k<cnt;k++){const r=rnd();WAVE.queue.push(n>=5&&r<.08?'reefer':n>=3&&r<.16?'rv':n>=4&&r<.3?'cruiser':n>=3&&r<.46?'pickup':n>=2&&r<.62?'bike':['sedanR','sedanW','sedanY'][Math.floor(rnd()*3)]);}
  if(n>=2){for(let k=0;k<n+1;k++)spawnFoot('cop',18,36);}
  if(n>=3&&n%2===1){const i=pickRoad(20,40);if(i>=0)for(let k=0;k<3;k++)L.enemies.push(makeEnemy('dog',(i%L.W)+.5+k*.3,((i/L.W)|0)+.5,rnd));}
  bigMsg(n%4===0?'WAVE '+n+': BOSS':'WAVE '+n,2.2,n%4===0?C_R:C_Y);n%4===0?SFX.horn():SFX.wave();}
const maxAlive=()=>Math.min(7,3+Math.floor(WAVE.n/2));
function pickRoad(minD,maxD,hidden){for(let t=0;t<80;t++){const i=L.roadCells[Math.floor(rnd()*L.roadCells.length)],x=(i%L.W)+.5,y=((i/L.W)|0)+.5,d=Math.hypot(x-P.x,y-P.y);
  if(d<minD||d>maxD||!L.wide[i])continue;if(hidden&&hasLOS(x,y,P.x,P.y))continue;if(L.vcars.some(c=>Math.hypot(c.x-x,c.y-y)<2.5))continue;return i;}return -1;}
function spawnFoot(type,minD,maxD){for(let t=0;t<40;t++){const i=L.walk[Math.floor(rnd()*L.walk.length)],x=(i%L.W)+.5,y=((i/L.W)|0)+.5,d=Math.hypot(x-P.x,y-P.y);
  if(d<minD||d>maxD)continue;L.enemies.push(makeEnemy(type,x,y,rnd));return;}}
function spawnCar(kind){let i=pickRoad(24,70,true);if(i<0)i=pickRoad(18,80,false);if(i<0)return false;
  const x=(i%L.W)+.5,y=((i/L.W)|0)+.5;let c;
  if(kind==='boss'){const k=Math.floor(WAVE.n/4)-1;c=makeCar(rnd()<.5?'pickup':'cruiser',x,y,0,{boss:true,sc:1.25,r:.7,mass:2.5});c.hp=c.hp0=700+WAVE.n*60;c.name=k<BOSSN.length?BOSSN[k]:LIZ[Math.floor(rnd()*LIZ.length)];c.K=Object.assign({},c.K,{gun:'shot',score:c.K.score});}
  else c=makeCar(kind,x,y,0);
  const[tx,ty]=flowTarget(c);c.a=Math.atan2(ty-y,tx-x);L.vcars.push(c);return true;}
function updWaves(dt){
  const alive=L.vcars.filter(c=>!c.dead&&!c.parked&&!c.traffic).length;
  if(WAVE.n===0||WAVE.clear){WAVE.pause-=dt;if(WAVE.pause<=0)waveStart();return;}
  if(WAVE.queue.length){WAVE.spawnT-=dt;if(WAVE.spawnT<=0&&alive<maxAlive()){WAVE.spawnT=1.4;if(spawnCar(WAVE.queue[0]))WAVE.queue.shift();}return;}
  if(!alive){WAVE.clear=true;WAVE.pause=5;const bonus=2500*WAVE.n;P.score+=bonus;P.hp=Math.min(P.maxHp,P.hp+25);
    bigMsg('WAVE '+WAVE.n+' CLEAR',2.6,C_G);feed('BONUS '+money(bonus)+'  REPAIR +25',C_G);SFX.key();for(const sp of L.pick)if(!sp.item){sp.t=0;}}}
