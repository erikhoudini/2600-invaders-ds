/* =====================================================================
   KILL RACE 6. THE PLAYER'S CAR
   Driving runs on real time even in slo-mo, like Bagman's player. The view
   widens with speed, the horizon kicks on impacts, and the engine loop from
   Bagman's flatbed level is pitched to the speedometer.
   ===================================================================== */
let PCAR='player';
function resetPlayer(){const K=CARK[PCAR];Object.assign(P,{K,mass:K.mass,r:.55,wheel:0,gear:1,heat:0,hot:0,pitch:0,sway:0,x:L.sx,y:L.sy,a:L.sa,vx:0,vy:0,hp:K.hp,maxHp:K.hp,armor:0,lock:null,lockLost:0,hurt:0,flash:0,dead:0,
  berserk:0,slow:0,flame:0,rage:false,w:0,has:[1,0,0,0],s:0,d:0,m:0,drums:2,nitro:100,boosting:0,cool:0,anim:null,recoil:0,score:0,chain:0,chainT:0,kills:0,peds:0,foot:0,bump:0,hornT:0,fov:.66,time:0,z:0,vz:0,spin:0,dmgBy:{},cp:0,lap:1,fin:0,newRace:0});if(PCAR==='pPickup'){P.has[1]=1;P.s=16;}setDir();}

function driveInput(){const K_=c=>!!keys[c];
  let thr=(K_('KeyW')||K_('ArrowUp'))?1:0,brake=(K_('KeyS')||K_('ArrowDown'))?1:0,steer=(K_('KeyD')||K_('ArrowRight')?1:0)-(K_('KeyA')||K_('ArrowLeft')?1:0);
  // touch stick: up drives, down brakes and reverses, across steers
  if(stick.x||stick.y){steer+=stick.x;if(stick.y<-.15)thr=Math.max(thr,Math.min(1,-stick.y*1.3));if(stick.y>.25)brake=Math.max(brake,Math.min(1,stick.y*1.3));}
  if(GP.on){steer+=GP.lx;thr=Math.max(thr,GP.rt);brake=Math.max(brake,GP.lt);}
  return{thr,brake,steer:clamp(steer,-1,1),hand:K_('KeyX')||K_('KeyC')||GP.hand,boost:(K_('ShiftLeft')||K_('ShiftRight')||nitroBtn||GP.boost)&&P.nitro>0};}

function updPlayer(rdt){if(P.dead)return;P.time+=rdt;
  if(P.berserk>0){P.berserk-=rdt;CRT.rage=Math.min(1,P.berserk/3);if(P.berserk<=0){P.berserk=0;CRT.rage=0;feed('RAMPAGE OVER',C_GR);}}
  if(P.flame>0){P.flame-=rdt;if(P.flame<=0){P.flame=0;feed('FLAMER OUT',C_GR);}}
  if(P.slow>0){P.slow-=rdt;CRT.slow=Math.min(1,P.slow/1.5);timeScaleAudio=.6;if(P.slow<=0){P.slow=0;CRT.slow=0;timeScaleAudio=1;}}
  if(muff&&AC)muff.frequency.setTargetAtTime(P.slow>0?1400:20000,AC.currentTime,.15);
  CRT.low=P.hp<=25?(1-P.hp/25)*.8+.2:0;P.rage=P.berserk>0;
  const inp=RACE.on&&RACE.count>0?{thr:0,brake:0,steer:0}:driveInput();
  // nitro burns while held; it only comes back by driving hard: drifting, and hitting other cars (Full Auto, Burnout)
  if(inp.boost){P.nitro=Math.max(0,P.nitro-30*rdt);if(!P.boosting)play('power',.35,1.6);P.boosting=1;}else P.boosting=0;
  stepCar(P,rdt,inp);L.camZ=CAM_Z+(P.z||0);
  const sp=speedOf(P);P.mvx=P.vx;P.mvy=P.vy;
  if(P.slip>1.4&&sp>5&&!inp.boost)P.nitro=Math.min(100,P.nitro+16*rdt);
  if(!inp.boost)P.nitro=Math.min(100,P.nitro+1.5*rdt);
  // camera: the nose dips under braking and lifts under power, the gun leans out on the turns,
  // the view opens a little with speed, hits jolt the horizon and the road buzzes through it
  P.pitch+=(clamp(P.accel*.3,-6,4)-P.pitch)*Math.min(1,rdt*6);P.sway+=(clamp(-P.yaw*Math.abs(fwdSpeed(P))*.45,-10,10)-P.sway)*Math.min(1,rdt*5);
  const want=.66+Math.min(1,sp/14)*.06+(P.boosting?.07:0);P.fov+=(want-P.fov)*Math.min(1,rdt*4);setDir();
  P.bump=Math.max(0,P.bump-rdt*30);HZ=HALF+Math.round(P.pitch+P.bump*Math.sin(tm*40)+(sp>5?(rnd()-.5)*sp*.04:0));
  // the engine note follows the revs through the gears
  if(!engineSnd(P.rpm||0,P.gear||1,inp.thr,P.boosting,P.skid&&sp>4&&!(P.z>0),P.slip||0)){if(!rumble&&SBUF.engine)rumbleOn(true);
  if(rumble&&isFinite(P.rpm)){rumble.s.playbackRate.value=(.32+P.rpm*.42+P.gear*.05+(P.boosting?.12:0))*timeScaleAudio;rumble.g.gain.value=.08+.12*inp.thr+(P.shiftT>0?-.05:0);}
  if(P.skid&&sp>4&&rnd()<rdt*10)play('push',.16,2.3+rnd()*.4,.1);}
  // guns
  // the twin AK runs hot (Vigilante 8): it cools when you let go, and locks up for a moment if you cook it
  P.heat=Math.max(0,P.heat-rdt*(P.hot?.45:.55));if(P.hot&&P.heat<.3){P.hot=0;feed('GUNS COOL',C_GR);}
  P.cool-=rdt;if(firing||keys.Space||keys.ControlLeft||mouseFire||GP.fire)tryFire();
  if(P.anim){const g=gunNow();P.anim.t+=rdt;if(P.anim.t>g.ft){P.anim.t=0;P.anim.i++;if(P.anim.i>=g.seq.length)P.anim=null;}}
  P.recoil=Math.max(0,P.recoil-rdt*50);P.flash-=rdt;P.hurt=Math.max(0,P.hurt-rdt);P.hornT-=rdt;
  updLock(rdt);
  if(P.chainT>0){P.chainT-=rdt;if(P.chainT<=0)P.chain=0;}
  // burning barrels hurt to drive through
  for(const f of L.fires)if(Math.hypot(f.x-P.x,f.y-P.y)<1.1){hurtPlayer(20*rdt,undefined,'fire');if(rnd()<rdt*10)addPart(P.x,P.y,.4,(rnd()-.5),(rnd()-.5),1.5,[255,140,0],.03,.4,2);}}

function selectGun(w){if(P.flame>0||w===P.w||!P.has[w])return;if(ammoLeft(w)<=0){feed('NO '+GUNS[w].name+' AMMO',C_GR);return;}P.lastW=P.w;P.w=w;SFX.weapon();}
function nextGun(){for(let k=1;k<=4;k++){const w=(P.w+k)%4;if(P.has[w]&&ammoLeft(w)>0){selectGun(w);return;}}}
function horn(){if(P.hornT>0)return;P.hornT=1.2;SFX.horn();panicAt(P.x,P.y,14);}

// Carmageddon's credits: spend score on an instant repair, or to be put back on the road
const REPAIR_COST=1000,RECOVER_COST=500;
function buyRepair(){if(P.dead||P.hp>=P.maxHp)return;if(P.score<REPAIR_COST){feed('REPAIR COSTS '+money(REPAIR_COST),C_R);play('empty',.5);return;}
  P.score-=REPAIR_COST;P.hp=Math.min(P.maxHp,P.hp+30);feed('REPAIR +30  -'+money(REPAIR_COST),C_G);SFX.medkit();}
function buyRecover(){if(P.dead)return;if(P.score<RECOVER_COST){feed('RECOVERY COSTS '+money(RECOVER_COST),C_R);play('empty',.5);return;}
  const W=L.W,cx=Math.floor(P.x),cy=Math.floor(P.y),f=RACE.on&&!P.fin?L.cpField[P.cp]:null;let best=-1,bv=1e9;
  for(let y=cy-10;y<=cy+10;y++)for(let x=cx-10;x<=cx+10;x++){if(x<1||y<1||x>=W-1||y>=L.H-1)continue;const i=y*W+x;if(!L.wide[i]||L.block[i])continue;
    if(L.vcars.some(o=>!o.dead&&Math.hypot(o.x-x-.5,o.y-y-.5)<2))continue;const v=(f?f[i]:0)+Math.hypot(x-cx,y-cy)*(f?1:3);if(v<bv){bv=v;best=i;}}
  if(best<0)return;P.score-=RECOVER_COST;P.x=(best%W)+.5;P.y=((best/W)|0)+.5;P.vx=P.vy=0;P.wheel=0;
  if(f){const[tx,ty]=flowTarget(P,f);P.a=Math.atan2(ty-P.y,tx-P.x);}setDir();feed('RECOVERED  -'+money(RECOVER_COST),C_C);SFX.door();CRT.hit=.3;}
