/* =====================================================================
   KILL RACE 7. ENEMY DRIVERS
   They drive the same model as the player. Out of sight they follow a
   driving-distance field toward the player that keeps them off the walls;
   in sight they pick a line by type:
     gunners (sedans) drive past you with the gun out the window,
     rammers (cruisers, and pickups up close) aim at where you will be and floor it,
     bikers hang back and lob dynamite.
   Their bullets are Bagman enemy bullets (L.shots), moved by Bagman's updShots.
   ===================================================================== */
const ROLE={sedanR:'gun',sedanW:'gun',sedanY:'gun',pickup:'gun',cruiser:'ram',bike:'bike'};
function steerTo(c,tx,ty){const d=angDiff(c.a,Math.atan2(ty-c.y,tx-c.x));return d;}
function flowTarget(c,f=L.cflow){const W=L.W;let i=Math.floor(c.y)*W+Math.floor(c.x);
  for(let k=0;k<4;k++){let b=i,bv=f[i];for(const o of[1,-1,W,-W,W+1,W-1,-W+1,-W-1]){const v=f[i+o];if(v<bv&&!L.map[i+o]&&!L.block[i+o]){bv=v;b=i+o;}}if(b===i)break;i=b;}
  return[(i%W)+.5,((i/W)|0)+.5];}

function updAICar(c,dt){
  if(c.flash>0)c.flash-=dt;if(c.fireT>0)c.fireT-=dt;
  if(c.dead||c.parked){if(c.wreck){c.wreckT-=dt;c.vx*=Math.max(0,1-dt*2);c.vy*=Math.max(0,1-dt*2);moveCar(c,dt);
      if(rnd()<dt*14)addPart(c.x+(rnd()-.5)*.6,c.y+(rnd()-.5)*.6,.4+rnd()*.3,(rnd()-.5)*.3,(rnd()-.5)*.3,1+rnd(),rnd()<.5?[255,200,0]:[255,70,0],.04,.5,2);
      if(rnd()<dt*5)addPart(c.x,c.y,.9,(rnd()-.5)*.2,(rnd()-.5)*.2,1,[60,60,60],.09,1.6,4);}
    if(c.parked&&!c.dead&&c.hp<c.hp0*.5&&rnd()<dt*4)addPart(c.x,c.y,.7,(rnd()-.5)*.2,(rnd()-.5)*.2,.9,[90,90,90],.07,1.2,4);
    return;}
  if(c.burnT>0){c.burnT-=dt;damageCar(c,10*dt,P);if(rnd()<dt*16)addPart(c.x+(rnd()-.5)*.5,c.y+(rnd()-.5)*.5,.5,(rnd()-.5)*.3,(rnd()-.5)*.3,1.2,[255,120,0],.04,.4,2);if(c.dead)return;}
  if(c.hp<c.hp0*.4&&rnd()<dt*6)addPart(c.x,c.y,.8,(rnd()-.5)*.2,(rnd()-.5)*.2,.9,[80,80,80],.07,1.2,4);
  const dx=P.x-c.x,dy=P.y-c.y,dist=Math.hypot(dx,dy)||.01,toP=Math.atan2(dy,dx),sp=speedOf(c);
  c.lt-=dt;if(c.lt<=0){c.lt=.2+rnd()*.1;c.los=!P.dead&&dist<38&&hasLOS(c.x,c.y,P.x,P.y);}
  const role=c.boss?'ram':ROLE[c.kind];let tx,ty,boost=false,thr=1;
  if(c.los&&!P.dead){const lead=Math.min(1.2,dist/18);const px=P.x+P.vx*lead,py=P.y+P.vy*lead;
    if(role==='ram'||(role==='gun'&&c.kind==='pickup'&&dist<7)){tx=px;ty=py;boost=dist<14&&Math.abs(angDiff(c.a,toP))<.3;}
    else if(role==='bike'){const keep=dist<7?-1:dist>14?1:0;tx=keep>=0?px:c.x-dx;ty=keep>=0?py:c.y-dy;if(!keep){tx=c.x-dy/dist*6;ty=c.y+dx/dist*6;thr=.6;}}
    else{// gunners line up a pass: aim beside the player, not at him
      const side=c.side||(c.side=rnd()<.5?1:-1),off=dist<12?3.5:0;tx=px-dy/dist*off*side;ty=py+dx/dist*off*side;}}
  else[tx,ty]=flowTarget(c);
  // racers drive the course, and only go for the player when he is right there in front of them
  if(c.racer){[tx,ty]=flowTarget(c,L.cpField[c.cp]);boost=false;thr=1;
    if(c.los&&!P.dead&&dist<9&&c.aggro&&Math.abs(angDiff(c.a,toP))<.5){tx=P.x+P.vx*.3;ty=P.y+P.vy*.3;}
    if(Math.abs(angDiff(c.a,Math.atan2(ty-c.y,tx-c.x)))<.08&&c.nitro>0){boost=true;c.nitro-=dt*30;}else c.nitro=Math.min(100,(c.nitro||0)+dt*6);}
  let da=steerTo(c,tx,ty);
  // feelers: turn away from a wall coming up, unless we are lined up on the player
  if(!c.los||dist>6){const look=Math.min(4,1+sp*.3);const fl=cast(c.x,c.y,Math.cos(c.a-.45),Math.sin(c.a-.45),look),fr=cast(c.x,c.y,Math.cos(c.a+.45),Math.sin(c.a+.45),look);
    const tl=fl?fl.t:look,tr=fr?fr.t:look;if(tl<look||tr<look)da+=(tr-tl)*.35;}
  const inp={thr,brake:0,steer:clamp(da*2.4,-1,1),hand:false,boost};
  if(Math.abs(da)>1.3&&sp>7){inp.thr=0;inp.brake=.6;}
  // stuck against something: back out, turning the other way
  if(c.stuckT>0){c.stuckT-=dt;inp.thr=0;inp.brake=1;inp.steer=-c.stuckDir;}
  else{if(sp<1.2)c.stk+=dt;else{c.stk=Math.max(0,c.stk-dt*2);if(sp>5)c.stuckN=Math.max(0,(c.stuckN||0)-dt*.3);}
    if(c.stk>1){c.stk=0;c.stuckN=(c.stuckN||0)+1;c.stuckT=.7+rnd()*.5;
      // alternate the way we back out, and if that keeps failing, get put back on the road out of sight
      c.stuckDir=c.stuckN%2?(Math.sign(da)||1):-(Math.sign(da)||1);if(c.stuckN>=3&&(!c.los||dist>12))unstick(c);}}
  stepCar(c,dt,inp);
  // guns
  c.cool-=dt;if(c.burst>0){c.burstT-=dt;if(c.burstT<=0){c.burst--;c.burstT=.11;aiShoot(c,toP,dist);}}
  if(!c.los||P.dead||c.cool>0)return;const off=Math.abs(angDiff(c.a,toP));
  if(c.K.gun==='mg'&&dist<24&&off<.35){c.burst=3+(c.boss?3:0);c.burstT=0;c.cool=1.4+rnd()*1.1;}
  else if(c.K.gun==='shot'&&dist<14&&off<.6){c.cool=1.6+rnd();for(let k=-2;k<=2;k++)aiShoot(c,toP+k*.09,dist,1);if(c.boss&&dist>6)throwDyn(toP,true,c);}
  else if(c.K.gun==='dyn'&&dist>5&&dist<16){c.cool=2.6+rnd()*1.2;c.fireT=.3;throwDyn(toP,true,c);}}
function aiShoot(c,a,dist,big){a+=(rnd()-.5)*.06;const s=big?13:16;c.fireT=.15;
  L.shots.push({x:c.x+Math.cos(a)*.7,y:c.y+Math.sin(a)*.7,z:.5,vx:Math.cos(a)*s,vy:Math.sin(a)*s,dmg:big?1.8:1.6,life:2.6,big:big?1:0,own:c,age:0});
  SFX.eshot(Math.max(.15,1-dist/26));}
// bullets against cars, before Bagman's updShots moves them: the car is a lot wider than a man
function shotsVsCars(){for(let i=L.shots.length-1;i>=0;i--){const s=L.shots[i];
  if(!P.dead&&s.own!==P&&Math.hypot(s.x-P.x,s.y-P.y)<P.r+.05){hurtPlayer(s.dmg,Math.atan2(s.y-P.y,s.x-P.x));L.shots.splice(i,1);continue;}
  for(const c of L.vcars)if(c!==s.own&&!c.dead&&Math.hypot(s.x-c.x,s.y-c.y)<c.r){damageCar(c,s.dmg,null);puff(s.x,s.y);L.shots.splice(i,1);break;}}}
function updCars(dt){for(const c of L.vcars)if(!(c.racer&&RACE.count>0))updAICar(c,dt);
  for(let i=L.vcars.length-1;i>=0;i--){const c=L.vcars[i];if(c.wreck&&c.wreckT<=0){L.vcars.splice(i,1);L.things.push({t:'deco',x:c.x,y:c.y,d:dec('DEBRIS')});stainFloor(c.x,c.y,.9,3);}}}
// a car that cannot get itself free is moved to the best nearby open lane, pointing the way it wants to go
function unstick(c){const W=L.W,f=c.racer?L.cpField[c.cp]:L.cflow,cx=Math.floor(c.x),cy=Math.floor(c.y);let best=-1,bv=1e9;
  for(let y=cy-8;y<=cy+8;y++)for(let x=cx-8;x<=cx+8;x++){if(x<1||y<1||x>=W-1||y>=L.H-1)continue;const i=y*W+x;if(!L.wide[i]||L.block[i])continue;
    if(L.vcars.some(o=>o!==c&&Math.hypot(o.x-x-.5,o.y-y-.5)<1.6))continue;const v=f[i]+Math.hypot(x-cx,y-cy)*2;if(v<bv){bv=v;best=i;}}
  if(best<0)return;c.x=(best%W)+.5;c.y=((best/W)|0)+.5;c.vx=c.vy=0;c.stuckN=0;c.stuckT=0;const[tx,ty]=flowTarget(c,f);c.a=Math.atan2(ty-c.y,tx-c.x);}
