/* =====================================================================
   KILL RACE 10c. TRAFFIC
   Civilians drive the grid on the right-hand lane: straight on, left or
   right at each intersection, slowing for whatever is in front of them and
   leaning on the horn if it is you. Shoot or ram one and they floor it.
   They are wreckable, worth a little money and a couple of seconds on the
   race clock, and make every street a moving obstacle course
   (Carmageddon, Full Auto, Quarantine all fill their streets).
   ===================================================================== */
const DIRS=[[1,0],[0,1],[-1,0],[0,-1]],LANE=1.75,TRAFFIC_K=['sedanW','sedanR','sedanY','pickup','sedanW'];
const roadLine=k=>4.5+k*(CITY.blk+CITY.road),NROADS=CITY.N+1;
function spawnTraffic(n){for(let k=0,t=0;k<n&&t<n*30;t++){const dir=Math.floor(rnd()*4),line=Math.floor(rnd()*NROADS),along=4.5+rnd()*(L.W-9);
  const[dx,dy]=DIRS[dir],rx=-dy,ry=dx,lc=roadLine(line);let x=dx?along:lc+rx*LANE,y=dx?lc+ry*LANE:along;
  if(Math.hypot(x-P.x,y-P.y)<20||blockedAt(x,y,.6)||L.vcars.some(c=>Math.hypot(c.x-x,c.y-y)<3))continue;
  const kind=TRAFFIC_K[Math.floor(rnd()*TRAFFIC_K.length)];L.vcars.push(makeCar(kind,x,y,Math.atan2(dy,dx),{traffic:true,dir,line,hp:80,hp0:80,cool:1e9,name:'CIVILIAN'}));k++;}}
function driveTraffic(c,dt){const[dx,dy]=DIRS[c.dir],rx=-dy,ry=dx,lc=roadLine(c.line);
  // turn at the next intersection centre we reach
  const along=dx?c.x:c.y;const ki=Math.round((along-4.5)/(CITY.blk+CITY.road)),ic=roadLine(ki),toI=(ic-along)*(dx+dy);
  if(Math.abs(toI)<.6&&c.turnedAt!==ki*100+c.line&&ki>=0&&ki<NROADS){c.turnedAt=ki*100+c.line;
    // straight on if the road goes on; left or right if that road goes that way
    const opts=[];if((dx>0||dy>0)?ki<NROADS-1:ki>0)opts.push(c.dir,c.dir);
    for(const d of[(c.dir+1)%4,(c.dir+3)%4]){const[ex,ey]=DIRS[d];if((ex>0||ey>0)?c.line<NROADS-1:c.line>0)opts.push(d);}
    const d=opts.length?opts[Math.floor(rnd()*opts.length)]:(c.dir+2)%4;
    if(d!==c.dir){c.line=ki;c.dir=d;}}
  const[ex,ey]=DIRS[c.dir],erx=-ey,ery=ex,elc=roadLine(c.line);
  // aim a few cells down our lane
  const tx=ex?c.x+ex*3.5:elc+erx*LANE,ty=ex?elc+ery*LANE:c.y+ey*3.5;
  const da=angDiff(c.a,Math.atan2(ty-c.y,tx-c.x));
  // slow for anything ahead in the lane; honk if it is the player
  let want=c.panic>0?11:6.5,blocked=null;if(c.panic>0)c.panic-=dt;
  for(const o of[P,...L.vcars]){if(o===c||o.dead&&!o.wreck)continue;const ox=o.x-c.x,oy=o.y-c.y,d=Math.hypot(ox,oy);if(d>5.5||d<.01)continue;if((ox*Math.cos(c.a)+oy*Math.sin(c.a))/d>.85){blocked=o;want=Math.min(want,Math.max(0,(d-2.2)*2));}}
  for(const p of L.peds)if(p.st!=='dead'&&p.st!=='dying'&&c.panic<=0){const ox=p.x-c.x,oy=p.y-c.y,d=Math.hypot(ox,oy);if(d<4&&(ox*Math.cos(c.a)+oy*Math.sin(c.a))/d>.9)want=Math.min(want,1);}
  if(blocked===P&&speedOf(c)<1){c.honk=(c.honk||0)+dt;if(c.honk>1.5){c.honk=-2;play('horn',.25,1.3);}}
  const sp=fwdSpeed(c),inp={thr:sp<want?1:0,brake:sp>want+1?1:0,steer:clamp(da*2.5,-1,1),hand:false,boost:false};
  // stuck behind a wreck or wedged: back up and go round
  if(c.stuckT>0){c.stuckT-=dt;inp.thr=0;inp.brake=1;inp.steer=-1;}else if(want>2&&Math.abs(sp)<.6){c.stk+=dt;if(c.stk>2){c.stk=0;c.stuckT=1;}}else c.stk=0;
  stepCar(c,dt,inp);}
function updTraffic(want){const n=L.vcars.filter(c=>c.traffic&&!c.dead).length;if(n<want&&rnd()<.02)spawnTraffic(1);
  // drop cars that end up far away and out of sight, to keep the count where the action is
  for(let i=L.vcars.length-1;i>=0;i--){const c=L.vcars[i];if(c.traffic&&!c.dead&&Math.hypot(c.x-P.x,c.y-P.y)>60&&rnd()<.005)L.vcars.splice(i,1);}}
