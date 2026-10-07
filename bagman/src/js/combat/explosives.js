function carHit(cell,dmg){if(!L.carAt)return;const c=L.carAt.get(cell);if(!c||c.dead)return;c.hp-=dmg;
  if(c.burn<0&&c.hp<=60){c.burn=2.6;play('boom',.3,2.2);}}
function updCars(dt){if(!L.cars)return;for(const c of L.cars){if(c.dead||c.burn<0)continue;c.burn-=dt;
    if(!c.bb){let x0=1e9,y0=1e9,x1=-1,y1=-1;for(const i of c.cells){const x=i%L.W,y=(i/L.W)|0;x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x+1);y1=Math.max(y1,y+1);}c.bb=[x0-.08,y0-.08,x1+.08,y1+.08];}
    const edge=()=>{const b=c.bb,s=rnd()*4|0,t=rnd();return s===0?[b[0]+(b[2]-b[0])*t,b[1]]:s===1?[b[0]+(b[2]-b[0])*t,b[3]]:s===2?[b[0],b[1]+(b[3]-b[1])*t]:[b[2],b[1]+(b[3]-b[1])*t];};
    if(!c.fires){c.fires=[];for(let k=0;k<4;k++){const[px,py]=edge();const f={t:'deco',x:px,y:py,d:dec('FIRE')};c.fires.push(f);L.things.push(f);}}
    for(let k=0;k<4;k++)if(rnd()<.8){const[px,py]=edge();addPart(px,py,.3+rnd()*.5,(rnd()-.5)*.3,(rnd()-.5)*.3,1+rnd()*1.5,rnd()<.5?[255,200,0]:[255,70,0],.04,.4+rnd()*.4,2);}
    if(rnd()<.3){const[px,py]=edge();addPart(px,py,1,(rnd()-.5)*.2,(rnd()-.5)*.2,1.2,[60,60,60],.08,1.4,4);}
    if(c.burn<=0){c.dead=1;for(const f of c.fires||[]){const j=L.things.indexOf(f);if(j>=0)L.things.splice(j,1);}for(const i of c.cells){L.map[i]=0;L.carAt.delete(i);}L.flowCell=-1;ST.carsBlown=(ST.carsBlown||0)+1;
      L.things.push({t:'deco',x:c.x,y:c.y,d:dec('DEBRIS')});stainFloor(c.x,c.y,1.1,3);explode({x:c.x,y:c.y,boom:2,car:1});}}}
function detonate(t,delay){if(t.fuse!==undefined)return;t.fuse=delay;L.fuses.push(t);}
function updFuses(dt){for(let i=L.fuses.length-1;i>=0;i--){const t=L.fuses[i];t.fuse-=dt;if(t.fuse<=0){L.fuses.splice(i,1);explode(t);}}}
function explode(t){if(!t.dyn&&!t.fx)ST.booms++;if(P.chainT>0&&!L.rails)P.chainT=3;const kw0=KW;KW=t.dyn&&!t.en?'dyn':'boom';L.dynKill=0;try{explode0(t);}finally{KW=kw0;}if(t.dyn&&!t.en&&L.dynKill>=10)ach('onestick');}
function explode0(t){const big=t.boom===2;if(L.cars)for(const c of L.cars){if(c.dead)continue;const d=Math.hypot(c.x-t.x,c.y-t.y);if(d<(big?4.2:3.4)&&c!==t)carHit(c.cells[0],big?120:90);}const R=big?3.4:2.6,DMG=big?160:110;
  const k=L.things.indexOf(t);if(k>=0)L.things.splice(k,1);if(t.cell!==undefined)L.block[t.cell]=0;
  L.things.push({t:'deco',x:t.x,y:t.y,d:dec('DEBRIS')});
  stainFloor(t.x,t.y,R*.55,3);
  for(let a=0;a<12;a++){const ang=a/12*TAU;const h=cast(t.x,t.y,Math.cos(ang),Math.sin(ang),R*.8);if(h&&!h.door)stainWall(h.id,h.face,h.u,.35+rnd()*.4,.9,4);}
  for(let k2=0;k2<46;k2++){const a=rnd()*TAU,sp=.5+rnd()*2.8;addPart(t.x,t.y,.2+rnd()*.5,Math.cos(a)*sp,Math.sin(a)*sp,rnd()*1.4,rnd()<.5?[255,200,0]:[255,90,0],.03+rnd()*.05,.35+rnd()*.5,2);}
  for(let k2=0;k2<16;k2++){const a=rnd()*TAU,sp=.3+rnd()*1.2;addPart(t.x,t.y,.4+rnd()*.4,Math.cos(a)*sp,Math.sin(a)*sp,.3,[80,80,80],.06+rnd()*.06,1.2+rnd(),4);}
  for(let k2=0;k2<26;k2++){const a=rnd()*TAU,sp=4+rnd()*6;addPart(t.x,t.y,.3+rnd()*.5,Math.cos(a)*sp,Math.sin(a)*sp,1+rnd()*2,[170,170,180],.015,.9,3);}
  const RE=t.dyn?R:R*1.3,RP=t.dyn?R:R*.8;for(const e of L.enemies){if(e.st==='dead'||e.st==='dying')continue;const d=Math.hypot(e.x-t.x,e.y-t.y);if(d<RE){const ang=Math.atan2(e.y-t.y,e.x-t.x);e.shotDmg=0;hurtEnemy(e,DMG*(1-d/RE)+10,ang,.8,false);}}
  const pd=Math.hypot(P.x-t.x,P.y-t.y);if(pd<RP&&!L.rails)hurtPlayer(Math.round(55*(1-pd/RP)+5),Math.atan2(t.y-P.y,t.x-P.x),true);
  for(const o of L.things)if(o.boom&&o.fuse===undefined&&Math.hypot(o.x-t.x,o.y-t.y)<R)detonate(o,.12+rnd()*.15);
  const v=Math.max(.3,1-pd/22);SFX.bigboom();SFX.boom(v);CRT.boom=Math.max(CRT.boom,clamp(1.2-pd/14,.25,1));shake=Math.max(shake,clamp(1.4-pd/12,.3,1.2));borderFlash=.12;borderFlashIdx=14;
  noiseAt(t.x,t.y,18);}
function noiseAt(x,y,r){for(const e of L.enemies){if(e.st==='idle'&&!e.ambush&&Math.hypot(e.x-x,e.y-y)<r)wake(e);}}
function noise(){const r=L.outdoor?10:15;for(const e of L.enemies){if(e.st!=='idle'||e.ambush)continue;const f=L.flow[Math.floor(e.y)*L.W+Math.floor(e.x)];if(f>=0&&f<=r)wake(e);}}
