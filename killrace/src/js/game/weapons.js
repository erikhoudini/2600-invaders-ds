/* =====================================================================
   KILL RACE 5. WEAPONS
   Guns are fixed to the car and fire along its heading. Lock-on (Bagman's
   idea) lets them swing up to about 25 degrees onto the locked target, and
   it is where dynamite gets thrown. The flamer is a power-up that replaces
   the guns for 15 seconds, like Bagman's. Fuel drums are dropped behind the
   car as mines.
   ===================================================================== */
const GUNS=[
  {name:'TWIN AK',spr:'wTommy',rate:.075,seq:[1,2],ft:.035},
  {name:'PUMP 12',spr:'wShotgun',rate:.72,seq:[1,2,3,4],ft:.1,ammo:'s'},
  {name:'DYNAMITE',spr:'wDyn',rate:.85,seq:[1,2,2,2],ft:.08,ammo:'d'},
  {name:'ROCKETS',spr:'wSniper',rate:.45,seq:[1,2],ft:.08,ammo:'m'}];
const FLAMER={name:'FLAMER',spr:'wFlame',rate:.05,seq:[2,3],ft:.05};
const gunNow=()=>P.flame>0?FLAMER:GUNS[P.w];
const ammoLeft=w=>w===1?P.s:w===2?P.d:w===3?P.m:Infinity;
const LOCK_CONE=.7,LOCK_RANGE=34,AIM_SWING=.45;

/* ---------- lock-on ---------- */
function lockOK(e){if(!e)return false;if(e.K)return !e.dead;return e.st!=='dead'&&e.st!=='dying';}
function lockTargets(){const out=[];const add=e=>{const dx=e.x-P.x,dy=e.y-P.y,d=Math.hypot(dx,dy);if(d>LOCK_RANGE)return;const a=angDiff(P.a,Math.atan2(dy,dx));
    if(Math.abs(a)>LOCK_CONE||!hasLOS(P.x,P.y,e.x,e.y))return;out.push({e,s:Math.abs(a)*12+d*(e.K?1:1.6)});};
  for(const c of L.vcars)if(!c.dead&&!c.parked&&!c.traffic)add(c);for(const e of L.enemies)if(e.st!=='idle'&&lockOK(e))add(e);
  return out.sort((a,b)=>a.s-b.s);}
function lockCycle(){const ts=lockTargets();if(!ts.length){if(P.lock){P.lock=null;SFX.unlock();}return;}
  const i=ts.findIndex(t=>t.e===P.lock);P.lock=ts[(i+1)%ts.length].e;P.lockLost=0;SFX.lock();}
function updLock(dt){const e=P.lock;if(!e)return;if(!lockOK(e)){P.lock=null;return;}
  const d=Math.hypot(e.x-P.x,e.y-P.y),a=Math.abs(angDiff(P.a,Math.atan2(e.y-P.y,e.x-P.x)));
  if(d>LOCK_RANGE+6||a>1.5||!hasLOS(P.x,P.y,e.x,e.y)){P.lockLost+=dt;if(P.lockLost>1){P.lock=null;SFX.unlock();}}else P.lockLost=0;}
// guns swing onto the lock if it is close enough to straight ahead
function aimAngle(){const e=P.lock;if(e&&lockOK(e)){const a=Math.atan2(e.y-P.y,e.x-P.x),d=angDiff(P.a,a);if(Math.abs(d)<AIM_SWING)return a;return P.a+Math.sign(d)*AIM_SWING;}return P.a;}

/* ---------- firing ---------- */
function tryFire(){if(P.cool>0||P.dead)return;const g=gunNow();
  if(P.flame>0){P.cool=g.rate;P.anim={i:0,t:0};flameShot();return;}
  if(g.ammo&&ammoLeft(P.w)<=0){SFX.empty();P.cool=.3;P.w=0;return;}
  P.cool=g.rate;P.anim={i:0,t:0};const a=aimAngle(),locked=lockOK(P.lock);
  if(P.w===0){if(P.hot){P.cool=.12;return;}P.heat+=.05;if(P.heat>=1){P.hot=1;feed('GUNS OVERHEATED',C_R);play('empty',.6,.7);}SFX.tommy();P.flash=.05;P.recoil=3;shake=Math.max(shake,.12);ray(a+(rnd()-.5)*(locked?.016:.035),45,7,11,.2);}
  else if(P.w===1){P.s--;SFX.shotgun();P.flash=.07;P.recoil=10;shake=Math.max(shake,.5);for(let k=0;k<9;k++)ray(a+(rnd()-.5)*.15,24,7,13,.35);}
  else if(P.w===2){P.d--;throwDyn(a,false);}
  else{P.m--;const t=lockOK(P.lock)?P.lock:(lockTargets()[0]||{}).e||null;fireRocket(a,P,t,false);P.recoil=6;shake=Math.max(shake,.3);}
  borderFlash=.04;borderFlashIdx=P.w===1||P.w===3?14:15;gunNoise();}
function gunNoise(){for(const e of L.enemies)if(e.st==='idle'){const d=Math.hypot(e.x-P.x,e.y-P.y);if(d<16)wake(e);}panicAt(P.x,P.y,12);}

// hitscan from the car: the nearest of wall, car, deputy, civilian or fuel drum takes it
function ray(ang,range,dmin,dmax,gib){const c=Math.cos(ang),s=Math.sin(ang);const h=cast(P.x,P.y,c,s,range);
  const wall=h?{t:h.t,id:h.id,face:h.face,u:h.u}:null;let bd=wall?wall.t:range,best=null,kind='';
  const test=(o,r,k)=>{const dx=o.x-P.x,dy=o.y-P.y,al=dx*c+dy*s;if(al<=.3||al>=bd)return;if(Math.abs(-dx*s+dy*c)<r){best=o;bd=al;kind=k;}};
  for(const v of L.vcars)if(!v.wreck||v.wreckT>0)test(v,v.r,'car');
  for(const e of L.enemies)if(e.st!=='dead'&&e.st!=='dying')test(e,e.dog?.36:.32,'foot');
  for(const p of L.peds)if(p.st!=='dead'&&p.st!=='dying')test(p,.3,'ped');
  for(const t of L.things)if(t.boom&&t.fuse===undefined)test(t,.32,'boom');
  const dmg=dmin+rnd()*(dmax-dmin),hx=P.x+c*bd,hy=P.y+s*bd;
  if(kind==='car'){if(!best.dead){damageCar(best,dmg,P);play('empty',.25,2+rnd()*.5,.03);for(let k=0;k<3;k++)addPart(hx-c*.2,hy-s*.2,.3+rnd()*.4,(rnd()-.5)*2-c,(rnd()-.5)*2-s,1+rnd(),[255,240,160],.012,.25,3);}else puff(hx-c*.2,hy-s*.2);}
  else if(kind==='foot')hurtFoot(best,dmg,ang,gib,true);
  else if(kind==='ped')killPed(best,ang,dmg>16,true,false);
  else if(kind==='boom'){best.hp-=dmg;puff(best.x-c*.3,best.y-s*.3);if(best.hp<=0){best.byP=1;detonate(best,0);}}
  else if(wall){puff(hx-c*.08,hy-s*.08);stainWall(wall.id,wall.face,wall.u,.3+rnd()*.5,0,3);}}

/* ---------- dynamite: Bagman's lobbed stick, thrown from a moving car ---------- */
function throwDyn(a,en,from){const o=from||P,tgt=!en&&lockOK(P.lock)?Math.hypot(P.lock.x-o.x,P.lock.y-o.y):en?Math.hypot(P.x-o.x,P.y-o.y):11;
  const d=clamp(tgt*.9,3,16),T=.55+d*.03,g=9,c=Math.cos(a),s=Math.sin(a);
  L.bombs.push({x:o.x+c*.7,y:o.y+s*.7,z:.6,vx:c*d/T+o.vx*.6,vy:s*d/T+o.vy*.6,vz:(-.5+.5*g*T*T)/T,fuse:1.7,g,en,from:o,age:0});play('push',.5,en?1.3:1.6);}
function updBombs(dt){for(let i=L.bombs.length-1;i>=0;i--){const b=L.bombs[i];b.fuse-=dt;b.age+=dt;
    const nx=b.x+b.vx*dt,ny=b.y+b.vy*dt;if(solidCell(Math.floor(nx),Math.floor(b.y),false))b.vx*=-.45;else b.x=nx;if(solidCell(Math.floor(b.x),Math.floor(ny),false))b.vy*=-.45;else b.y=ny;
    b.vz-=b.g*dt;b.z+=b.vz*dt;if(b.z<0){b.z=0;if(Math.abs(b.vz)>1.2)play('push',.25,2.2,.05);b.vz=-b.vz*.3;b.vx*=.3;b.vy*=.3;}if(b.z<.01){const f=Math.max(0,1-5*dt);b.vx*=f;b.vy*=f;}
    if(rnd()<.7)addPart(b.x,b.y,b.z+.12,(rnd()-.5)*.6,(rnd()-.5)*.6,.8+rnd(),rnd()<.5?[255,220,0]:[255,90,0],.012,.25,2);
    // a stick that lands on a car goes off on it
    let touch=false;if(b.age>.35&&b.z<1){for(const c of L.vcars)if(!c.dead&&c!==b.from&&Math.hypot(c.x-b.x,c.y-b.y)<c.r+.2){touch=true;break;}if(b.en&&Math.hypot(P.x-b.x,P.y-b.y)<P.r+.2)touch=true;}
    if(b.fuse<=0||touch){L.bombs.splice(i,1);kaboom(b.x,b.y,false,!b.en);}}}

/* ---------- the flamer ---------- */
function flameShot(){const a=aimAngle();play('boom',.14,1.8+rnd()*.4,.06);P.flash=.03;shake=Math.max(shake,.1);
  for(let k=0;k<2;k++){const b=a+(rnd()-.5)*.22,sp=10+rnd()*2;L.pflames.push({x:P.x+Math.cos(b)*.7,y:P.y+Math.sin(b)*.7,z:.42,vx:Math.cos(b)*sp+P.vx,vy:Math.sin(b)*sp+P.vy,life:1,big:2});}gunNoise();}
function updFlames(dt){const F=L.pflames;for(let i=F.length-1;i>=0;i--){const s=F[i];s.life-=dt*1.3;let dead=s.life<=.1;
    for(let k=0;k<2&&!dead;k++){s.x+=s.vx*dt/2;s.y+=s.vy*dt/2;
      if(solidCell(Math.floor(s.x),Math.floor(s.y),false)){dead=true;if(rnd()<.2)stainFloor(s.x,s.y,.15,3);break;}
      for(const t of L.things)if(t.boom&&t.fuse===undefined&&Math.abs(t.x-s.x)<.35&&Math.abs(t.y-s.y)<.35){t.hp-=5;if(t.hp<=0){t.byP=1;detonate(t,0);}dead=true;break;}
      if(dead)break;for(const c of L.vcars)if(!c.dead&&Math.hypot(c.x-s.x,c.y-s.y)<c.r){damageCar(c,5,P);c.burnT=Math.max(c.burnT||0,1);dead=true;break;}
      if(dead)break;for(const e of L.enemies)if(e.st!=='dead'&&e.st!=='dying'&&Math.hypot(e.x-s.x,e.y-s.y)<.4){hurtFoot(e,8,Math.atan2(s.vy,s.vx),.25,true);dead=true;break;}
      if(dead)break;for(const p of L.peds)if(p.st!=='dead'&&p.st!=='dying'&&Math.hypot(p.x-s.x,p.y-s.y)<.4){killPed(p,Math.atan2(s.vy,s.vx),false,true,false);dead=true;break;}}
    if(rnd()<dt*12)addPart(s.x,s.y,s.z,(rnd()-.5)*.4,(rnd()-.5)*.4,.6+rnd(),[255,140+rnd()*90|0,0],.03,.3,2);
    if(dead)F.splice(i,1);}}

/* ---------- fuel drums dropped as mines ---------- */
function dropDrum(){if(!(P.drums>0)||P.dead)return;const x=P.x-P.dx*1.4,y=P.y-P.dy*1.4,i=Math.floor(y)*L.W+Math.floor(x);
  if(L.map[i]||L.block[i]||L.vcars.some(c=>Math.hypot(c.x-x,c.y-y)<.9)){feed('NO ROOM BEHIND',C_GR);return;}
  P.drums--;addBoom(L,Math.floor(x)+.5,Math.floor(y)+.5,'XDRUM');const t=L.things[L.things.length-1];t.mine=1;t.byP=1;t.arm=.8;L.cflowT=0;play('push',.6,.7);}
function dropDrumFrom(c){const x=c.x-Math.cos(c.a)*(c.r+1.1),y=c.y-Math.sin(c.a)*(c.r+1.1),i=Math.floor(y)*L.W+Math.floor(x);
  if(L.map[i]||L.block[i])return;addBoom(L,Math.floor(x)+.5,Math.floor(y)+.5,'XDRUM');const t=L.things[L.things.length-1];t.mine=1;t.arm=.6;t.from=c;L.cflowT=0;play('push',.4,.7);}
// mines go off when a car rolls up to them: anyone's for enemy cars, the enemy's for the player
function updMines(dt){for(const t of L.things){if(!t.mine||t.fuse!==undefined)continue;if(t.arm>0){t.arm-=dt;continue;}
  if(!t.byP&&!P.dead&&Math.hypot(P.x-t.x,P.y-t.y)<P.r+.5){detonate(t,0);continue;}
  for(const c of L.vcars)if(!c.dead&&!c.parked&&c!==t.from&&Math.hypot(c.x-t.x,c.y-t.y)<c.r+.5){detonate(t,0);break;}}}

/* ---------- homing rockets (Twisted Metal's bread and butter) ----------
   They home on the lock, or on whatever is nearest ahead. No new art: the
   rocket is a hot point of light with a smoke trail, from Bagman's particles. */
function fireRocket(a,from,tgt,en){const c=Math.cos(a),s=Math.sin(a);
  L.missiles.push({x:from.x+c*.8,y:from.y+s*.8,z:.55+(from.z||0),a,sp:8+speedOf(from)*.6,tgt,en,from,life:3.2,age:0});
  rocketSnd(en?Math.max(.3,1-Math.hypot(from.x-P.x,from.y-P.y)/30):1);if(en){feed('INCOMING ROCKET',C_R);SFX.lock();}}
function updMissiles(dt){const M=L.missiles;for(let i=M.length-1;i>=0;i--){const m=M[i];m.age+=dt;m.life-=dt;
  const t=m.tgt;if(t&&m.age>.12&&(t===P?!P.dead:lockOK(t))){const d=angDiff(m.a,Math.atan2(t.y-m.y,t.x-m.x)),turn=(m.en?1.7:2.6)*dt;m.a+=clamp(d,-turn,turn);}
  m.sp=Math.min(m.en?16:21,m.sp+28*dt);m.z+=(.5-m.z)*Math.min(1,dt*3);
  const c=Math.cos(m.a),s=Math.sin(m.a),steps=Math.ceil(m.sp*dt/.25);let boom=m.life<=0;
  for(let k=0;k<steps&&!boom;k++){m.x+=c*m.sp*dt/steps;m.y+=s*m.sp*dt/steps;
    if(solidCell(Math.floor(m.x),Math.floor(m.y),false)){m.x-=c*.3;m.y-=s*.3;boom=true;break;}
    if(m.en&&!P.dead&&Math.hypot(P.x-m.x,P.y-m.y)<P.r+.15&&Math.abs((P.z||0)-m.z+.3)<.9){boom=true;break;}
    for(const v of L.vcars)if(v!==m.from&&!v.dead&&Math.hypot(v.x-m.x,v.y-m.y)<v.r+.1&&m.z>(v.z||0)-.2&&m.z<(v.z||0)+carH(v)+.3){boom=true;break;}
    if(!boom&&!m.en)for(const e of L.enemies)if(e.st!=='dead'&&e.st!=='dying'&&Math.hypot(e.x-m.x,e.y-m.y)<.45){boom=true;break;}}
  addPart(m.x-c*.2,m.y-s*.2,m.z,(rnd()-.5)*.3,(rnd()-.5)*.3,.3,[110,110,110],.05+rnd()*.03,.9,4);
  addPart(m.x,m.y,m.z,0,0,0,m.en?[255,80,40]:[255,240,140],.045,.05,2);
  if(boom){M.splice(i,1);kaboom(m.x,m.y,false,!m.en,false,.8);}}}
// rockets for the AI: bosses and racers, now and then, when you are out in front of them
function aiRocket(c,toP,dist,dt){c.mcool=(c.mcool===undefined?4+rnd()*6:c.mcool)-dt;
  if(c.mcool>0||!c.los||P.dead||dist<7||dist>30||Math.abs(angDiff(c.a,toP))>.35)return;
  c.mcool=(c.boss?5:9)+rnd()*5;c.fireT=.3;fireRocket(toP,c,P,true);}
