/* =====================================================================
   KILL RACE 3. VEHICLES
   One driving model for everything with wheels, the player included.
   A car keeps a world-space velocity and a heading. The part of the velocity
   along the heading is driven and dragged; the part across it is bled off by
   tyre grip. Low grip (handbrake, oil, speed in a hard turn) lets the back
   step out, and a sliding car lays rubber on Bagman's floor-stain buffer.
   ===================================================================== */
// front: frame in the cars sheet. side: frame in the side sheet (3 is the yellow recolour, -1 none)
const CARK={
  player: {front:0,side:0,hp:100,acc:13,top:15,turn:2.7,mass:1.2,gun:null,score:0},
  sedanR: {front:0,side:0,hp:110,acc:10,top:12.5,turn:2.4,mass:1,gun:'mg',score:1000},
  sedanW: {front:1,side:2,hp:110,acc:10,top:12.5,turn:2.4,mass:1,gun:'mg',score:1000},
  sedanY: {front:2,side:3,hp:110,acc:10,top:12.5,turn:2.4,mass:1,gun:'mg',score:1000},
  pickup: {front:3,side:1,hp:200,acc:8.5,top:11,turn:2.1,mass:1.5,gun:'shot',score:1500},
  cruiser:{front:4,side:2,hp:160,acc:11,top:14.5,turn:2.6,mass:1.2,gun:'mg',score:2000,siren:1,ram:1},
  bike:   {front:5,side:-1,hp:45,acc:13,top:16,turn:3.3,mass:.45,gun:'dyn',score:800,r:.35}};
function makeCar(kind,x,y,a,o){const K=CARK[kind];return Object.assign({kind,K,x,y,a,vx:0,vy:0,hp:K.hp,hp0:K.hp,r:K.r||.55,mass:K.mass,
  steer:0,cool:1+rnd()*1.5,fireT:0,flash:0,burn:0,dead:0,wreckT:0,lt:0,los:false,stk:0,stuckT:0,stuckDir:1,
  name:LIZ[Math.floor(rnd()*LIZ.length)],lastP:-99,sc:1},o||{});}
const fwdSpeed=c=>c.vx*Math.cos(c.a)+c.vy*Math.sin(c.a);
const speedOf=c=>Math.hypot(c.vx,c.vy);
function onOil(c){return L.oil[Math.floor(c.y)*L.W+Math.floor(c.x)];}

// input: thr 0..1, brake 0..1 (reverses once stopped), steer -1..1, hand (handbrake), boost
function stepCar(c,dt,inp){const K=c.K,ca=Math.cos(c.a),sa=Math.sin(c.a);
  let fwd=c.vx*ca+c.vy*sa,lat=-c.vx*sa+c.vy*ca;
  const tm_=c.tmul||1,top=K.top*tm_*(inp.boost?1.45:1)*(c.rage?1.15:1);
  if(inp.thr>0&&fwd<top)fwd+=K.acc*tm_*inp.thr*(inp.boost?1.7:1)*dt;
  if(inp.brake>0){if(fwd>.6)fwd-=K.acc*2*inp.brake*dt;else if(fwd>-K.top*.35)fwd-=K.acc*.7*inp.brake*dt;}
  fwd-=fwd*(inp.thr>0||inp.brake>0?.25:.9)*dt;if(fwd>top)fwd-=(fwd-top)*Math.min(1,dt*2);
  const oil=onOil(c),sp=Math.abs(fwd);
  // steering bites harder with speed, then eases off near the top so cars can still be caught
  const bite=Math.min(1,sp/3.5)*(1-.25*Math.min(1,sp/K.top));
  c.a+=inp.steer*K.turn*bite*(fwd<-.2?-1:1)*(inp.hand?1.45:1)*dt;
  const grip=oil?1.1:inp.hand?1.6:(sp>K.top*.8&&Math.abs(inp.steer)>.7?5:10);
  lat-=lat*Math.min(1,grip*dt);
  c.vx=ca*fwd-sa*lat;c.vy=sa*fwd+ca*lat;
  // rubber: a sliding or hard-braking car marks the road
  c.skid=Math.abs(lat)>2.2||(inp.brake>0&&fwd>7)||(inp.hand&&sp>5);
  if(c.skid&&!c.dead){const nx=-sa,ny=ca;for(const s of[-.32,.32])stainFloor(c.x-ca*.45+nx*s,c.y-sa*.45+ny*s,.045,3);}
  moveCar(c,dt);}

// slide along walls and props. Hard hits hurt, and a car that hits a fuel drum at speed sets it off
// a car-to-car shove can push a car into a wall, and then every move tests as blocked: ease it back out first
function unembed(c){if(!blockedAt(c.x,c.y,c.r))return;
  for(let d=.05;d<1.5;d+=.05)for(let k=0;k<8;k++){const a=k*Math.PI/4,x=c.x+Math.cos(a)*d,y=c.y+Math.sin(a)*d;if(!blockedAt(x,y,c.r)){c.x=x;c.y=y;return;}}}
function moveCar(c,dt){unembed(c);const steps=Math.max(1,Math.ceil(speedOf(c)*dt/.2)),sdt=dt/steps;
  for(let k=0;k<steps;k++){
    const nx=c.x+c.vx*sdt;if(!blockedAt(nx,c.y,c.r))c.x=nx;else{wallHit(c,Math.abs(c.vx),Math.sign(c.vx),0);c.vx*=-.3;}
    const ny=c.y+c.vy*sdt;if(!blockedAt(c.x,ny,c.r))c.y=ny;else{wallHit(c,Math.abs(c.vy),0,Math.sign(c.vy));c.vy*=-.3;}}}
function wallHit(c,imp,sx,sy){
  // what did we hit? a prop cell (drum, pump, tree, fire) or a wall
  const W=L.W,hx=Math.floor(c.x+sx*(c.r+.1)),hy=Math.floor(c.y+sy*(c.r+.1)),i=hy*W+hx;
  if(L.block[i]){const t=L.things.find(t=>t.cell===i||(t.blk&&Math.floor(t.x)===hx&&Math.floor(t.y)===hy));
    if(t&&t.boom&&imp>3){if(c===P)t.byP=1;detonate(t,0);}}
  if(imp<6.5)return;
  const dmg=(imp-6.5)*2;
  for(let k=0;k<6;k++)addPart(c.x+sx*c.r,c.y+sy*c.r,.3+rnd()*.3,(rnd()-.5)*2-sx*2,(rnd()-.5)*2-sy*2,1+rnd()*2,[255,220,120],.012,.3,3);
  if(c===P){if(!(P.berserk>0))hurtPlayer(dmg*.4,undefined,'walls');P.bump=Math.min(8,imp*.6);shake=Math.max(shake,Math.min(.9,imp/14));play('thud',Math.min(1,imp/12),.55);play('empty',.4,.7,.05);}
  else{damageCar(c,dmg,null);const d=Math.hypot(c.x-P.x,c.y-P.y);if(d<16)play('thud',Math.max(.1,.6-d/30),.6,.08);}}

// car against car: push apart, trade momentum, and the faster side of the hit deals the damage
function carCollisions(){const all=[P,...L.vcars];
  for(let a=0;a<all.length;a++)for(let b=a+1;b<all.length;b++){const A=all[a],B=all[b];if(A===P&&P.dead)continue;
    const dx=B.x-A.x,dy=B.y-A.y,d=Math.hypot(dx,dy),rr=A.r+B.r;if(d>=rr||d<1e-4)continue;
    const nx=dx/d,ny=dy/d,ma=A.parked||A.wreck?1e9:A.mass,mb=B.parked||B.wreck?1e9:B.mass;const over=rr-d,ia=1/ma,ib=1/mb;
    A.x-=nx*over*ia/(ia+ib);A.y-=ny*over*ia/(ia+ib);B.x+=nx*over*ib/(ia+ib);B.y+=ny*over*ib/(ia+ib);
    const vn=(B.vx-A.vx)*nx+(B.vy-A.vy)*ny;if(vn>=0)continue;
    const j=-(1.3)*vn/(ia+ib);A.vx-=j*ia*nx;A.vy-=j*ia*ny;B.vx+=j*ib*nx;B.vy+=j*ib*ny;
    const imp=-vn;if(imp<2.5)continue;
    // whoever was driving into the other one hits harder
    const aIn=A.vx*nx+A.vy*ny,bIn=-(B.vx*nx+B.vy*ny);
    const hit=(atk,vic,k)=>{if(vic===P){if(!(P.berserk>0))hurtPlayer(imp*k*(atk.K&&atk.K.ram?1.1:.7),Math.atan2(atk.y-P.y,atk.x-P.x),'rams');P.bump=Math.min(8,imp*.7);}
      else damageCar(vic,imp*k*(atk===P?(P.berserk>0?7:3.2):1.5),atk===P?P:null);};
    hit(A,B,aIn>bIn?1:.45);hit(B,A,bIn>=aIn?1:.45);
    const mx=(A.x+B.x)/2,my=(A.y+B.y)/2;for(let k=0;k<10;k++)addPart(mx,my,.35+rnd()*.3,(rnd()-.5)*4,(rnd()-.5)*4,1+rnd()*2,[255,230,140],.012,.35,3);
    const v=Math.max(.15,1-Math.hypot(mx-P.x,my-P.y)/25);play('thud',v,.45);play('empty',v*.7,.6,.03);if(A===P||B===P){CRT.hit=Math.max(CRT.hit,Math.min(.8,imp/14));shake=Math.max(shake,Math.min(1.1,imp/10));}}}
