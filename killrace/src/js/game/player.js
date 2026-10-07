/* =====================================================================
   KILL RACE 6. THE PLAYER'S CAR
   Driving runs on real time even in slo-mo, like Bagman's player. The view
   widens with speed, the horizon kicks on impacts, and the engine loop from
   Bagman's flatbed level is pitched to the speedometer.
   ===================================================================== */
function resetPlayer(){Object.assign(P,{K:CARK.player,mass:CARK.player.mass,r:.55,x:L.sx,y:L.sy,a:L.sa,vx:0,vy:0,hp:100,maxHp:100,armor:0,lock:null,lockLost:0,hurt:0,flash:0,dead:0,
  berserk:0,slow:0,flame:0,rage:false,w:0,has:[1,0,0],s:0,d:0,drums:2,nitro:100,boosting:0,cool:0,anim:null,recoil:0,score:0,chain:0,chainT:0,kills:0,peds:0,foot:0,bump:0,hornT:0,fov:.66,time:0,dmgBy:{},cp:0,lap:1,fin:0,newRace:0});setDir();}

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
  if(inp.boost){P.nitro=Math.max(0,P.nitro-32*rdt);if(!P.boosting)play('power',.35,1.6);P.boosting=1;}else{P.boosting=0;P.nitro=Math.min(100,P.nitro+9*rdt);}
  stepCar(P,rdt,inp);
  const sp=speedOf(P);P.mvx=P.vx;P.mvy=P.vy;
  // camera: field of view opens with speed, the horizon jolts on hits and buzzes at speed
  const want=.66+Math.min(1,sp/15)*.14+(P.boosting?.08:0);P.fov+=(want-P.fov)*Math.min(1,rdt*4);setDir();
  P.bump=Math.max(0,P.bump-rdt*30);HZ=HALF+Math.round(P.bump*Math.sin(tm*40)+(sp>6?(rnd()-.5)*sp*.06:0));
  if(!rumble&&SBUF.engine)rumbleOn(true);
  if(rumble){rumble.s.playbackRate.value=(.35+Math.min(1.2,sp/15)*.55+(P.boosting?.2:0))*timeScaleAudio;rumble.g.gain.value=.1+.1*inp.thr;}
  if(P.skid&&sp>5&&rnd()<rdt*8)play('push',.12,2.4+rnd()*.4,.12);
  // guns
  P.cool-=rdt;if(firing||keys.Space||keys.ControlLeft||mouseFire||GP.fire)tryFire();
  if(P.anim){const g=gunNow();P.anim.t+=rdt;if(P.anim.t>g.ft){P.anim.t=0;P.anim.i++;if(P.anim.i>=g.seq.length)P.anim=null;}}
  P.recoil=Math.max(0,P.recoil-rdt*50);P.flash-=rdt;P.hurt=Math.max(0,P.hurt-rdt);P.hornT-=rdt;
  updLock(rdt);
  if(P.chainT>0){P.chainT-=rdt;if(P.chainT<=0)P.chain=0;}
  // burning barrels hurt to drive through
  for(const f of L.fires)if(Math.hypot(f.x-P.x,f.y-P.y)<1.1){hurtPlayer(20*rdt,undefined,'fire');if(rnd()<rdt*10)addPart(P.x,P.y,.4,(rnd()-.5),(rnd()-.5),1.5,[255,140,0],.03,.4,2);}}

function selectGun(w){if(P.flame>0||w===P.w||!P.has[w])return;if(ammoLeft(w)<=0){feed('NO '+GUNS[w].name+' AMMO',C_GR);return;}P.lastW=P.w;P.w=w;SFX.weapon();}
function nextGun(){for(let k=1;k<=3;k++){const w=(P.w+k)%3;if(P.has[w]&&ammoLeft(w)>0){selectGun(w);return;}}}
function horn(){if(P.hornT>0)return;P.hornT=1.2;SFX.horn();panicAt(P.x,P.y,14);}
