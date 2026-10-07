/* =====================================================================
   16. PLAYER UPDATE AND PICKUPS
   ===================================================================== */
const keys={};
const KB0={fwd:'KeyW',back:'KeyS',left:'KeyA',right:'KeyD',turnL:'ArrowLeft',turnR:'ArrowRight',fire:'Space',lock:'KeyE',swap:'KeyQ',run:'ShiftLeft',map:'KeyM',drum:'KeyB'};
const KBN={fwd:'FORWARD',back:'BACK',left:'STRAFE LEFT',right:'STRAFE RIGHT',turnL:'TURN LEFT',turnR:'TURN RIGHT',fire:'FIRE',lock:'LOCK ON',swap:'GUN WHEEL',run:'RUN',map:'MAP',drum:'DRUM (ARENA)'};
let KB=Object.assign({},KB0);try{Object.assign(KB,JSON.parse(localStorage.getItem('bagman.keys')||'{}'));}catch(e){}
const K=a=>keys[KB[a]];let stick={x:0,y:0},firing=false,turnAcc=0,mouseFire=false;
// power-up clocks only run while a fight is on: someone awake nearby or in sight
function engaged(){for(const e of L.enemies){if(e.st==='idle'||e.st==='dead'||e.st==='dying'||e.guard)continue;const d=Math.hypot(e.x-P.x,e.y-P.y);if(d<16||(e.los&&d<26))return true;}return false;}
function updPlayer(dt){P.hold=false;const pdt=dt;if(cheat.tar)P.slow=Math.max(P.slow,1.5);
  if(P.berserk>0){P.berserk-=pdt;CRT.rage=Math.min(1,P.berserk/3);if(P.berserk<=0){P.berserk=0;CRT.rage=0;if(!(P.flame>0))P.w=P.has[P.preBerserkW]?P.preBerserkW:1;}}
  if(P.flame>0){P.flame-=pdt;if(P.flame<=0){P.flame=0;P.w=P.berserk>0?0:(P.has[P.preFlameW]?P.preFlameW:1);}}
  if(muff&&AC)muff.frequency.setTargetAtTime(P.slow>0?1400:20000,AC.currentTime,.15);
  if(P.slow>0){P.slow-=pdt;CRT.slow=Math.min(1,P.slow/1.5);timeScaleAudio=.6;if(P.slow<=0){P.slow=0;CRT.slow=0;timeScaleAudio=1;}}
  CRT.low=P.hp<=25?(1-P.hp/25)*.8+.2:0;
  if(P.dash){updDash(dt);weaponTick(dt);return;}
  let f=0,s=0,t=0;
  if(K('fwd')||keys.ArrowUp)f+=1;if(K('back')||keys.ArrowDown)f-=1;if(K('left'))s-=1;if(K('right'))s+=1;
  if(K('turnL'))t-=1;if(K('turnR'))t+=1;
  f+=-stick.y-GP.ly;s+=stick.x+GP.lx;t+=GP.rx;if(WHEEL.down){f=0;s=0;t=0;turnAcc=0;}
  const manual=t*3.2*dt+turnAcc;turnAcc=0;
  if(P.lock&&lockValid(P.lock))lockSwipe(manual,t);else P.a+=manual;
  updLock(dt);setDir();
  const m=Math.hypot(f,s);if(m>1){f/=m;s/=m;}
  const runIn=OPT.sprint==='toggle'?(P.sprintT||P.sprint):(P.sprint||K('run')||keys.ShiftRight||GP.run);const sprint=(OPT.arun?!runIn:runIn)&&m>.2;
  const sp=(sprint?7.4:4.5)*(P.berserk>0?1.15:1)*(RULES.speed?1.3:1)*dt;const plx=P.px/.66,ply=P.py/.66;
  const mx=(P.dx*f+plx*s)*sp,my=(P.dy*f+ply*s)*sp;
  P.moving=m>.1?1:0;P.sprinting=sprint;if(P.moving)P.walk+=dt*Math.min(1,m)*(sprint?1.5:1);{const ph=Math.floor(P.walk*(sprint?11:9)/Math.PI);if(P.moving&&ph!==P.stepPh&&!L.train){play('thud',.07+(sprint?.04:0),(L.outdoor?.62:.8)+rnd()*.14);}P.stepPh=ph;}
  const ox=P.x,oy=P.y;
  const bx=blockedAt(P.x+mx,P.y,.24),by=blockedAt(P.x,P.y+my,.24);
  if(!bx)P.x+=mx;if(!by)P.y+=my;
  if((bx||by)&&m>.3){const ci=Math.floor(P.y+Math.sign(my)*.5*(by?1:0))*L.W+Math.floor(P.x+Math.sign(mx)*.5*(bx?1:0));if(L.secretAt.has(ci))trySecret(ci);
    const fi2=Math.floor(P.y+P.dy*.6)*L.W+Math.floor(P.x+P.dx*.6);if(L.secretAt.has(fi2))trySecret(fi2);}
  P.mvx=(P.x-ox)/Math.max(dt,1e-3);P.mvy=(P.y-oy)/Math.max(dt,1e-3);
  if(RULES.lava){if(P.moving)P.still=0;else{P.still+=dt;if(P.still>.5){P.lavaT+=dt;if(P.lavaT>.45){P.lavaT=0;hurtPlayer(3);}}}}
  if(L.void&&L.void[Math.floor(P.y)*L.W+Math.floor(P.x)]&&!P.dead){P.hp=0;P.dead=1;P.fell=1;ST.deaths++;ST.falls=(ST.falls||0)+1;saveStats();state='dying';deathT=0;P.lock=null;SFX.pdie();CRT.hit=1;bigMsg('YOU FELL',2.5,C_R);return;}
  {const W=L.W,c=Math.floor(P.y)*W+Math.floor(P.x);for(const o of[0,1,-1,W,-W,W+1,W-1,-W+1,-W-1])L.walked[c+o]=1;}
  for(const e of L.enemies){if(e.st==='dead'||e.st==='dying')continue;const dx=P.x-e.x,dy=P.y-e.y,d=Math.hypot(dx,dy);const r=e.dog?.35:.45*e.sc;if(d<r&&d>.001){const nx=P.x+dx/d*(r-d),ny=P.y+dy/d*(r-d);if(!blockedAt(nx,ny,.24)){P.x=nx;P.y=ny;}}}
  const fi=Math.floor(P.y+P.dy*.85)*L.W+Math.floor(P.x+P.dx*.85);
  for(const[ax,ay]of[[P.dx*.85,P.dy*.85],[0,0]]){const ci=Math.floor(P.y+ay)*L.W+Math.floor(P.x+ax);if(L.dg[ci]>=0)openDoor(L.doors[L.dg[ci]],true);}
  if(L.map[fi]===tex('SWITCH')+1&&(m>.1||firing)){if(L.boss&&L.boss.st!=='dead'&&L.boss.st!=='dying'){if(lockMsgT<=0){feed(L.boss.T.boss+' IS STILL BREATHING',C_R);lockMsgT=1.5;}}else{L.map[fi]=tex('SWITCHON')+1;SFX.sw();state='exiting';exitT=0;}}
  for(let i=L.things.length-1;i>=0;i--){const it=L.things[i];if(it.t!=='item')continue;if(Math.hypot(it.x-P.x,it.y-P.y)>.6)continue;if(it.fly>.15)continue;if(it.kind==='SPIRAL'){spiralGet(it.sid);L.things.splice(i,1);continue;}if(it.val){P.cash=(P.cash||0)+it.val;feed('+$'+it.val+' CASH',C_G);SFX.cash();L.things.splice(i,1);continue;}if(it.bonus&&SCOREV[it.kind])L.cash--;if(pickup(it.kind))L.things.splice(i,1);}
  weaponTick(dt);
}
function weaponTick(dt){
  if(P.switchT>0){P.switchT-=dt;if(P.switchT<=.14&&P.pendingW>=0){P.w=P.pendingW;P.pendingW=-1;}}
  P.cool-=dt;if(!WHEEL.open&&(firing||K('fire')||keys.ControlLeft||mouseFire||GP.fire))tryFire();
  if(P.anim){const W0=WEAP[P.w];P.anim.t+=dt;if(P.anim.t>W0.ft){P.anim.t=0;P.anim.i++;if(P.anim.i>=W0.seq.length)P.anim=null;}}
  P.recoil=Math.max(0,P.recoil-dt*60);
  if(P.chainT>0&&!(RULES.pbox&&P.moving)){P.chainT-=dt;if(P.chainT<=0)P.chain=0;}}
let exitT=0;
