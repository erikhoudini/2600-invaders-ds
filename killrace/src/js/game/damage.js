/* =====================================================================
   KILL RACE 4. DAMAGE AND EXPLOSIONS
   Also the hooks the Bagman enemy code calls: hurtPlayer (a bullet or a dog
   reached the car), hurtEnemy (a deputy got shot, by us or by his friends),
   wake, carHit (a stray round hit a wall cell; nothing to do here) and
   detonate (a stray round hit a fuel drum).
   ===================================================================== */
// src tallies where damage comes from (P.dmgBy), for tuning; Bagman's shots and dogs call without one
function hurtPlayer(dmg,fromAng,src){if(state!=='play'||P.dead)return;P.dmgBy[src||'bullets']=(P.dmgBy[src||'bullets']||0)+dmg;
  if(P.armor>0){const ab=Math.min(P.armor,dmg*.5);P.armor-=ab;dmg-=ab;}
  P.hp-=dmg;P.hurt=Math.max(P.hurt,.25);CRT.hit=Math.max(CRT.hit,clamp(dmg/16,.15,1));shake=Math.max(shake,Math.min(.6,dmg/14));borderFlash=.15;borderFlashIdx=10;
  if(dmg>=2)play('empty',.5,1.6+rnd()*.5,.04);
  if(P.hp<=0)wreckPlayer();}
function wreckPlayer(){P.hp=0;P.dead=1;state='wrecked';deathT=0;P.lock=null;SFX.pdie();kaboom(P.x,P.y,true,false,true);CRT.hit=1;bigMsg('WRECKED',3,C_R);rumbleOn(false);}

function damageCar(c,dmg,by,ang){if(c.dead||dmg<=0)return;c.hp-=dmg;c.flash=.07;if(by===P)c.lastP=tm;
  if(c.parked&&!c.awake&&c.hp<c.hp0*.5)c.awake=1;
  if(c.hp<=0)wreckCar(c);}
// a car that dies goes up, leaves a burning shell that still blocks the road for a while, and pays out if we did it
function wreckCar(c){c.dead=1;c.wreck=1;c.wreckT=12;c.vx*=.4;c.vy*=.4;c.burn=1;
  const byP=tm-c.lastP<4;kaboom(c.x,c.y,true,byP,false,.45);
  if(byP&&!c.parked){P.kills++;const m=chainKill(),v=c.K.score*(c.boss?5:1)*m;P.score+=v;feed('+'+money(v)+(c.boss?' '+c.name:''),C_C);
    if(c.boss)bigMsg(c.name+' IS DEAD',2.6,C_R);else if(P.chain<3)bigMsg('WRECKED '+c.name,1.4,C_R);
    if(rnd()<.45||c.boss)lootDrop(c.x,c.y);}
  else if(byP&&c.parked){P.score+=250;feed('+$250 PARKED CAR',C_GR);}
  if(P.lock===c)P.lock=null;}

function detonate(t,delay){if(t.fuse!==undefined)return;t.fuse=delay;L.fuses.push(t);}
function updFuses(dt){for(let i=L.fuses.length-1;i>=0;i--){const t=L.fuses[i];t.fuse-=dt;if(t.fuse>0)continue;L.fuses.splice(i,1);
  const k=L.things.indexOf(t);if(k>=0)L.things.splice(k,1);if(t.cell!==undefined)L.block[t.cell]=0;L.cflowT=0;
  L.things.push({t:'deco',x:t.x,y:t.y,d:dec('DEBRIS')});kaboom(t.x,t.y,t.boom===2,!!t.byP);}}

// the one explosion: drums, pumps, dynamite, dying cars. Bagman's blast, with cars in it
// pk scales the hit on the player: a car you just wrecked beside you should sting, not kill
function kaboom(x,y,big,byP,self,pk=1){const R=big?3.6:2.8,DMG=big?160:115;
  stainFloor(x,y,R*.5,3);
  for(let a=0;a<12;a++){const ang=a/12*TAU,h=cast(x,y,Math.cos(ang),Math.sin(ang),R*.8);if(h&&!h.door)stainWall(h.id,h.face,h.u,.35+rnd()*.4,.9,4);}
  for(let k=0;k<50;k++){const a=rnd()*TAU,sp=.5+rnd()*3;addPart(x,y,.2+rnd()*.6,Math.cos(a)*sp,Math.sin(a)*sp,rnd()*1.6,rnd()<.5?[255,200,0]:[255,90,0],.03+rnd()*.06,.35+rnd()*.5,2);}
  for(let k=0;k<18;k++){const a=rnd()*TAU,sp=.3+rnd()*1.2;addPart(x,y,.5+rnd()*.5,Math.cos(a)*sp,Math.sin(a)*sp,.4,[80,80,80],.07+rnd()*.06,1.4+rnd(),4);}
  for(let k=0;k<26;k++){const a=rnd()*TAU,sp=4+rnd()*6;addPart(x,y,.3+rnd()*.5,Math.cos(a)*sp,Math.sin(a)*sp,1+rnd()*2,[170,170,180],.015,.9,3);}
  for(const c of L.vcars){if(c.dead)continue;const d=Math.hypot(c.x-x,c.y-y);if(d>R+c.r)continue;const k=1-Math.min(1,d/(R+c.r));
    if(byP)c.lastP=tm;damageCar(c,DMG*k+15,byP?P:null);const a=Math.atan2(c.y-y,c.x-x),push=10*k/c.mass;c.vx+=Math.cos(a)*push;c.vy+=Math.sin(a)*push;}
  if(!self&&!P.dead){const d=Math.hypot(P.x-x,P.y-y);if(d<R+P.r){const k=1-d/(R+P.r);hurtPlayer(Math.round((44*k+6)*pk),Math.atan2(y-P.y,x-P.x),'blast');const a=Math.atan2(P.y-y,P.x-x);P.vx+=Math.cos(a)*8*k;P.vy+=Math.sin(a)*8*k;P.bump=8;}}
  const kw=byP;for(const e of L.enemies){if(e.st==='dead'||e.st==='dying')continue;const d=Math.hypot(e.x-x,e.y-y);if(d<R*1.2)hurtFoot(e,DMG*(1-d/(R*1.2))+10,Math.atan2(e.y-y,e.x-x),.8,kw);}
  for(const p of L.peds){if(p.st==='dead'||p.st==='dying')continue;const d=Math.hypot(p.x-x,p.y-y);if(d<R*1.2)killPed(p,Math.atan2(p.y-y,p.x-x),d<R*.7,kw);}
  for(const o of L.things)if(o.boom&&o.fuse===undefined&&Math.hypot(o.x-x,o.y-y)<R){if(byP)o.byP=1;detonate(o,.12+rnd()*.15);}
  const pd=Math.hypot(P.x-x,P.y-y),v=Math.max(.3,1-pd/26);SFX.bigboom();SFX.boom(v);
  CRT.boom=Math.max(CRT.boom,clamp(1.2-pd/14,.2,1));shake=Math.max(shake,clamp(1.4-pd/12,.2,1.2));borderFlash=.12;borderFlashIdx=14;
  noiseAt(x,y,18);panicAt(x,y,16);}

/* ---------- people on foot: Bagman's deputies and dogs, and the civilians ---------- */
function wake(e){if(e.st!=='idle')return;e.st='chase';e.t=0;e.cd=.6+rnd()*1.2;e.react=(e.dog?.15:.25)+rnd()*.6;
  const v=Math.max(.1,1-Math.hypot(e.x-P.x,e.y-P.y)/18);if(e.dog)SFX.bark(v);else SFX.alert(v);}
function noiseAt(x,y,r){for(const e of L.enemies)if(e.st==='idle'&&Math.hypot(e.x-x,e.y-y)<r)wake(e);}
// Bagman's enemy code calls this for shots between deputies (src set) and our code for everything else
function hurtEnemy(e,dmg,ang,gib,head,src){if(src&&src!==P&&L.enemies.includes(src)&&src!==e&&src.type!==e.type){e.foe=src;e.foeT=6;}hurtFoot(e,dmg,ang,gib,!src);}
function hurtFoot(e,dmg,ang,gib,byP){if(e.st==='dying'||e.st==='dead')return;e.hp-=dmg;
  blood(e.x,e.y,e.dog?.25:.55,ang,6+Math.floor(dmg/3),1.1);if(!e.dog)splatBehind(e.x,e.y,ang,Math.min(1,dmg/22));
  if(e.st==='idle')wake(e);
  if(e.hp>0){if(rnd()<.4&&e.st!=='attack'){e.st='pain';e.t=0;}return;}
  footDown(e,ang,dmg>=45||rnd()<gib);
  if(byP){P.foot++;const m=chainKill(),v=(e.dog?150:300)*m;P.score+=v;feed('+'+money(v)+' '+(e.dog?'DOG':'DEPUTY'),C_C);}}
function footDown(e,ang,gibIt){const v=Math.max(.15,1-Math.hypot(e.x-P.x,e.y-P.y)/20);e.st='dying';e.t=0;e.fr=0;
  if(gibIt){e.gib=1;e.st='dead';e.corpse=dec(['BODY1','BODY2','BODY3'][Math.floor(rnd()*3)]);gibs(e.x,e.y,ang);SFX.gib(v);}else SFX.die(v);
  if(P.lock===e)P.lock=null;}
// civilians: no score for shooting them, a little for the Carmageddon thing
function killPed(p,ang,gibIt,byP,runOver){if(p.st==='dying'||p.st==='dead')return;
  blood(p.x,p.y,.5,ang,18,1.6);footDown(p,ang,gibIt);p.deadT=0;
  if(byP){P.peds++;if(runOver){const m=chainKill(),v=100*m;P.score+=v;feed('SPLAT +'+money(v),C_R);play('splat',.8);}else feed('THAT WAS A CIVILIAN',C_GR);}}
function panicAt(x,y,r){for(const p of L.peds)if(p.st!=='dead'&&p.st!=='dying'&&Math.hypot(p.x-x,p.y-y)<r){p.panic=2+rnd()*2;p.fromX=x;p.fromY=y;}}
function carHit(){}
