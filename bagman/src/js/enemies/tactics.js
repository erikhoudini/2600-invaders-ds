// rush: close the distance. hold: keep a preferred range, give ground, only advance after losing sight.
// flank: route around the player's line of sight using the flank field, then close in.
function nearBarrel(e){e.bT=(e.bT||0)-1;if(e.bT>0)return e.bar;e.bT=40;let b=null,bd=6;for(const t of L.things)if(t.boom&&t.fuse===undefined){const d=Math.hypot(t.x-e.x,t.y-e.y);if(d<bd){bd=d;b=t;}}e.bar=b;return b;}
function friendInLine(e,tx,ty){const dx=tx-e.x,dy=ty-e.y,d=Math.hypot(dx,dy)||1,ux=dx/d,uy=dy/d;
  for(const o of L.enemies){if(o===e||o.st==='dead'||o.st==='dying'||o.st==='idle'&&o.ambush)continue;const ox=o.x-e.x,oy=o.y-e.y,al=ox*ux+oy*uy;if(al<=.2||al>=d-.3)continue;if(Math.abs(-ox*uy+oy*ux)<.5)return o;}return null;}
function separate(e,mv){let sx=0,sy=0;for(const o of L.enemies){if(o===e||o.st==='dead'||o.st==='dying')continue;const dx=e.x-o.x,dy=e.y-o.y,d=dx*dx+dy*dy;if(d>1.2||d<1e-4)continue;const k=(1.1-Math.sqrt(d))*1.6/Math.sqrt(d);sx+=dx*k;sy+=dy*k;}
  if(!sx&&!sy)return mv;const x=mv[0]+sx,y=mv[1]+sy,l=Math.hypot(x,y)||1;return[x/l,y/l,mv[2]];}
function chooseMove(e,dt,dx,dy,dist){
  const face=()=>{e.a=Math.atan2(dy,dx);};
  if(e.los&&e.strafe>0){e.strafe-=dt;face();return[-dy/dist*e.sd,dx/dist*e.sd,e.role==='hold'?.7:1];}
  if(e.los)e.noLos=0;else e.noLos+=dt;
  if(e.role==='hold'&&!e.boss){
    if(e.los){face();if(dist<e.pref-1.5){const ax=-dx/dist,ay=-dy/dist;return[ax,ay,.8];}
      if(e.T.range&&dist>e.T.range-1){const mv=stepToward(e,dt);if(mv)return[mv[0],mv[1],.9];}
      const b=nearBarrel(e);if(b&&L.things.includes(b)){const bx=b.x-e.x,by=b.y-e.y,bd=Math.hypot(bx,by);if(bd>1.3)return[bx/bd,by/bd,.8];}
      if(rnd()<dt*.6){e.strafe=.4+rnd()*.6;e.sd=rnd()<.5?1:-1;}return null;}
    if(e.noLos<(RULES.aggr?.8:2.5))return null;}
  if(e.role==='flank'&&!e.boss&&dist>4.5){const mv=stepToward(e,dt,L.flank);if(mv){e.a=Math.atan2(mv[1],mv[0]);return[mv[0],mv[1],1.15];}}
  if(e.los&&dist<2.2){face();return null;}
  const mv=stepToward(e,dt);if(!mv)return null;e.a=Math.atan2(mv[1],mv[0]);return mv;}
