/* =====================================================================
   14. ENEMIES: gunmen, dogs, bosses
   ===================================================================== */
function enemyFire(e,dist,tgt){tgt=tgt||P;const T=e.T;const dm=T.dmg*1.15;const v=Math.max(.15,1-dist/22);if(T.pat==='flame')play('boom',.16*v,1.7+rnd()*.5,.05);else SFX.eshot(v);
  const base=Math.atan2(tgt.y-e.y,tgt.x-e.x);const sp=T.bs;
  const shoot=(a,s=sp,dmg=dm,big=0)=>L.shots.push({x:e.x+Math.cos(a)*.45,y:e.y+Math.sin(a)*.45,z:.5*e.sc,vx:Math.cos(a)*s,vy:Math.sin(a)*s,dmg,life:big===2?1.3:4,big,own:e,age:0});
  const lead=s=>{if(tgt!==P)return base;const t=dist/s;return Math.atan2(P.y+P.mvy*t*.7-e.y,P.x+P.mvx*t*.7-e.x);};
  switch(T.pat){
    case'single':shoot(base+(rnd()-.5)*.12);break;
    case'flame':for(let k=0;k<2;k++)shoot(base+(rnd()-.5)*.2,sp*(.8+rnd()*.4),T.dmg,2);break;
    case'burst2':shoot(base+(rnd()-.5)*.1);break;
    case'fan5':for(let k=-2;k<=2;k++)shoot(base+k*.13);break;
    case'gila':for(let k=-3;k<=3;k++)shoot(base+k*.12,sp,T.dmg,1);break;
    case'iguana':shoot(lead(sp)+(rnd()-.5)*.06,sp,T.dmg,0);break;
    case'komodo':{// a torcher: every burst opens with a ring of fire, a long stream, or a sweep
      if(e.burst===T.burstN){e.kmode=(e.kmode==null?0:e.kmode+1)%3;if(e.kmode===0)for(let k=0;k<18;k++)shoot(base+k/18*TAU,5,dm,2);}
      const sw=e.kmode===2?Math.sin(e.burst*.55)*.7:0;for(let k=0;k<3;k++)shoot(base+sw+(rnd()-.5)*.24,sp*(.8+rnd()*.45),dm,2);play('boom',.2*v,1.5+rnd()*.4,.05);break;}
  }}
const cdOf=e=>(e.T.cd[0]+rnd()*(e.T.cd[1]-e.T.cd[0]))*(RULES.aggr?.6:1)*(L&&L.arena?.72:.78);
function stepToward(e,dt,field){const fl=field||L.flow;const W=L.W,ci=Math.floor(e.y)*W+Math.floor(e.x);let bi=-1,bv=fl[ci]>=0?fl[ci]:9999;
  for(const o of[1,-1,W,-W]){const v=fl[ci+o];if(v>=0&&v<bv){bv=v;bi=ci+o;}}
  if(bi<0)return null;const tx=(bi%W)+.5,ty=Math.floor(bi/W)+.5;const di=L.dg[bi];
  if(di>=0&&L.doors[di].open<.7){openDoor(L.doors[di],false);return null;}
  const ml=Math.hypot(tx-e.x,ty-e.y)||1;return[(tx-e.x)/ml,(ty-e.y)/ml];}
function moveEnemy(e,mvx,mvy,sp){sp*=(RULES.coke?2:1)*(RULES.aggr?1.1:1);const nx=e.x+mvx*sp,ny=e.y+mvy*sp;
  const ok=(x,y)=>!solidCell(Math.floor(x),Math.floor(y),false)&&!L.block[Math.floor(y)*L.W+Math.floor(x)]&&!(L.void&&L.void[Math.floor(y)*L.W+Math.floor(x)]);
  let moved=true;if(ok(nx,e.y)&&ok(nx+Math.sign(mvx)*.25,e.y))e.x=nx;else moved=false;
  if(ok(e.x,ny)&&ok(e.x,ny+Math.sign(mvy)*.25))e.y=ny;else moved=false;return moved;}
