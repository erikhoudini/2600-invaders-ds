/* =====================================================================
   KILL RACE 3. VEHICLES
   One driving model for everything with wheels, the player included.
   A car keeps a world-space velocity and a heading. The part of the velocity
   along the heading is driven and dragged; the part across it is bled off by
   tyre grip. Low grip (handbrake, oil, speed in a hard turn) lets the back
   step out, and a sliding car lays rubber on Bagman's floor-stain buffer.
   ===================================================================== */
// acc: launch acceleration. top: top speed. brake: braking deceleration. steer: wheel lock at a standstill (radians).
// wb: wheelbase; turning rate is speed x tan(wheel) / wb. grip: the most sideways acceleration the tyres will take.
// front: frame in the cars sheet (bikes are flat sprites). Bodies for the box renderer are in carbox.js.
const CARK={
  // the three cars you can drive
  player:  {name:'SEDAN',body:'sedanR',hood:'CARR',front:0,hp:100,acc:9,top:12.5,brake:8.8,steer:.62,wb:1.15,grip:16,drag:0.0084,mass:1.2,
            blurb:'SALAMANDER\'S CAR. QUICK, EVEN, NOTHING SPECIAL.'},
  pPickup: {name:'PICKUP',body:'pickup',hood:'CARB',front:3,hp:150,acc:7.5,top:11.3,brake:7.6,steer:.58,wb:1.3,grip:14,drag:0.0091,mass:1.7,
            blurb:'HEAVY AND SLOW. STARTS WITH THE PUMP. HITS LIKE A TRUCK.'},
  pCruiser:{name:'CRUISER',body:'cruiser',hood:'CARW',front:4,hp:85,acc:10.5,top:13.8,brake:9.6,steer:.64,wb:1.15,grip:17,drag:0.0077,mass:1.15,ram:1,
            blurb:'A STOLEN COP CAR. FASTEST AND SHARPEST, BUT LIGHT. RAMS HIT HARDER.'},
  // the opposition
  sedanR: {front:0,hp:110,acc:8.5,top:12,brake:8.0,steer:.6,wb:1.15,grip:15,drag:0.0084,mass:1,gun:'mg',score:1000},
  sedanW: {front:1,hp:110,acc:8.5,top:12,brake:8.0,steer:.6,wb:1.15,grip:15,drag:0.0084,mass:1,gun:'mg',score:1000},
  sedanY: {front:2,hp:110,acc:8.5,top:12,brake:8.0,steer:.6,wb:1.15,grip:15,drag:0.0084,mass:1,gun:'mg',score:1000},
  pickup: {front:3,hp:200,acc:7.5,top:11,brake:7.2,steer:.56,wb:1.3,grip:14,drag:0.0091,mass:1.5,gun:'shot',score:1500},
  cruiser:{front:4,hp:160,acc:9.5,top:13,brake:8.8,steer:.62,wb:1.15,grip:16,drag:0.0077,mass:1.2,gun:'mg',score:2000,siren:1,ram:1},
  bike:   {front:5,hp:45,acc:11,top:14,brake:9.6,steer:.8,wb:.8,grip:17,drag:0.0084,mass:.45,gun:'dyn',score:800,r:.35},
  // built from wall textures (carbox.js): a motorhome that lays fuel drums, and Gila's meat truck that just rams
  rv:     {front:1,hp:320,acc:6,top:10,brake:5.6,steer:.5,wb:1.8,grip:11,drag:0.0098,mass:2.6,gun:'drum',score:2500,r:.8},
  reefer: {front:3,hp:420,acc:5.5,top:10.5,brake:5.6,steer:.5,wb:2,grip:10,drag:0.0098,mass:3.2,gun:null,score:3000,r:.85,ram:1}};
function makeCar(kind,x,y,a,o){const K=CARK[kind];return Object.assign({kind,K,wheel:0,gear:1,x,y,a,vx:0,vy:0,hp:K.hp,hp0:K.hp,r:K.r||.55,mass:K.mass,
  steer:0,cool:1+rnd()*1.5,fireT:0,flash:0,burn:0,dead:0,wreckT:0,lt:0,los:false,stk:0,stuckT:0,stuckDir:1,
  name:LIZ[Math.floor(rnd()*LIZ.length)],lastP:-99,sc:1,z:0,vz:0},o||{});}
const fwdSpeed=c=>c.vx*Math.cos(c.a)+c.vy*Math.sin(c.a);
const speedOf=c=>Math.hypot(c.vx,c.vy);
function onOil(c){return L.oil[Math.floor(c.y)*L.W+Math.floor(c.x)];}

// input: thr 0..1, brake 0..1 (reverses once stopped and held), steer -1..1, hand (handbrake), boost
const GEARS=[.22,.42,.62,.82,1.01];
function stepCar(c,dt,inp){if(airStep(c,dt))return;const K=c.K,ca=Math.cos(c.a),sa=Math.sin(c.a),tm_=c.tmul||1;
  let fwd=c.vx*ca+c.vy*sa,lat=-c.vx*sa+c.vy*ca;const sp=Math.abs(fwd);
  const top=K.top*tm_*(inp.boost?1.35:1)*(c.rage?1.12:1);
  // the steering wheel takes time to turn, comes back quicker, and has less lock the faster you go
  const lock=K.steer/(1+sp*.11),want=inp.steer*lock,back=Math.abs(want)<Math.abs(c.wheel||0)||Math.sign(want)!==Math.sign(c.wheel||0);
  c.wheel=(c.wheel||0)+clamp(want-(c.wheel||0),-(back?6:3.2)*dt,(back?6:3.2)*dt);
  // five gears; a shift cuts the power for a moment
  let g=0;while(g<4&&fwd>top*GEARS[g])g++;const lo=g?top*GEARS[g-1]:0;
  c.rpm=fwd<0?Math.min(1,-fwd/(top*.3)):clamp((fwd-lo)/(top*GEARS[g]-lo),0,1);
  if(g+1!==c.gear){if(g+1>(c.gear||1)&&inp.thr>0)c.shiftT=.14;c.gear=g+1;if(c===P&&inp.thr>0)play('thud',.12,1.6);}
  if(c.shiftT>0)c.shiftT-=dt;
  // engine, brakes, reverse, drag
  let a=0;
  if(inp.thr>0){if(fwd<-.4)a+=K.brake*inp.thr;else if(!(c.shiftT>0))a+=K.acc*tm_*inp.thr*(inp.boost?1.6:1)*Math.max(0,1-(fwd/top)**2)*(1.25-.12*g);}
  if(inp.brake>0){if(fwd>.4){a-=K.brake*inp.brake;c.revT=0;}else{c.revT=(c.revT||0)+dt;if(c.revT>.25&&fwd>-K.top*.3)a-=K.acc*.6*inp.brake;}}else c.revT=0;
  a-=fwd*Math.abs(fwd)*K.drag+Math.sign(fwd)*(inp.thr>0?.4:2.4);
  let nf=fwd+a*dt;if(fwd!==0&&Math.sign(nf)!==Math.sign(fwd)&&!(c.revT>.25)&&!(inp.thr>0&&fwd<0))nf=0;
  c.accel=(nf-fwd)/Math.max(dt,1e-3);fwd=nf;
  // turning: steering geometry, held to what the tyres can take. Past that the front scrubs wide,
  // unless the handbrake has the back end loose, which turns it in harder
  const oil=onOil(c),hand=inp.hand&&sp>2.5;let mu=K.grip*(oil?.35:1);
  let yaw=fwd*Math.tan(c.wheel)/K.wb;const need=Math.abs(fwd*yaw);c.under=0;
  if(hand){yaw*=1.55;mu*=.45;}else if(need>mu){yaw*=mu/need;c.under=1;}
  c.yaw=yaw;
  // the tyres pull the car's motion round to where it points, as hard as grip allows
  const latGrip=hand?mu*.35:mu;lat-=Math.sign(lat)*Math.min(Math.abs(lat),latGrip*dt);
  c.vx=ca*fwd-sa*lat;c.vy=sa*fwd+ca*lat;c.a+=yaw*dt;c.slip=Math.abs(lat);
  // rubber on the road when sliding, scrubbing or locking up
  c.skid=c.slip>1.4||(inp.brake>0&&fwd>7)||(c.under&&sp>8)||(hand&&sp>5);
  if(c.skid&&!c.dead){const nx=-sa,ny=ca;for(const s of[-.32,.32])stainFloor(c.x-ca*.6+nx*s,c.y-sa*.6+ny*s,.045,3);}
  const ox=c.x,oy=c.y;moveCar(c,dt);rampCheck(c,ox,oy);}

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
  if(c===P){if(!(P.berserk>0))hurtPlayer(dmg*.4,undefined,'walls');P.bump=Math.min(8,imp*.6);shake=Math.max(shake,Math.min(.9,imp/14));crashSnd(Math.min(1,imp/12),imp>10);}
  else{damageCar(c,dmg,null);const d=Math.hypot(c.x-P.x,c.y-P.y);if(d<16)crashSnd(Math.max(.1,.6-d/30),imp>10);}}

// car against car: push apart, trade momentum, and the faster side of the hit deals the damage
function carCollisions(){const all=[P,...L.vcars];
  for(let a=0;a<all.length;a++)for(let b=a+1;b<all.length;b++){const A=all[a],B=all[b];if(A===P&&P.dead)continue;
    const dx=B.x-A.x,dy=B.y-A.y,d=Math.hypot(dx,dy),rr=A.r+B.r;if(d>=rr||d<1e-4)continue;
    // one car in the air goes over the other
    if(Math.abs((A.z||0)-(B.z||0))>.4)continue;
    const nx=dx/d,ny=dy/d,ma=A.parked||A.wreck?1e9:A.mass,mb=B.parked||B.wreck?1e9:B.mass;const over=rr-d,ia=1/ma,ib=1/mb;
    A.x-=nx*over*ia/(ia+ib);A.y-=ny*over*ia/(ia+ib);B.x+=nx*over*ib/(ia+ib);B.y+=ny*over*ib/(ia+ib);
    const vn=(B.vx-A.vx)*nx+(B.vy-A.vy)*ny;if(vn>=0)continue;
    const j=-(1.3)*vn/(ia+ib);A.vx-=j*ia*nx;A.vy-=j*ia*ny;B.vx+=j*ib*nx;B.vy+=j*ib*ny;
    const imp=-vn;if(imp<2.5)continue;
    // whoever was driving into the other one hits harder
    const aIn=A.vx*nx+A.vy*ny,bIn=-(B.vx*nx+B.vy*ny);
    // 'into' is how fast the attacker was driving at the other car: being bumped while parked is not an attack
    const hit=(atk,vic,k,into)=>{if(vic===P){if(!(P.berserk>0))hurtPlayer(imp*k*(atk.K&&atk.K.ram?1.1:.7),Math.atan2(atk.y-P.y,atk.x-P.x),'rams');P.bump=Math.min(8,imp*.7);}
      else{const mine=atk===P&&into>2;if(mine){vic.lastRam=tm;vic.angry=8;P.nitro=Math.min(100,P.nitro+imp*2.5);}damageCar(vic,imp*k*(mine?(P.berserk>0?7:3.2)*(P.K.ram?1.3:1)*P.mass/1.2:1.5),mine?P:null);}};
    hit(A,B,aIn>bIn?1:.45,aIn);hit(B,A,bIn>=aIn?1:.45,bIn);
    const mx=(A.x+B.x)/2,my=(A.y+B.y)/2;for(let k=0;k<10;k++)addPart(mx,my,.35+rnd()*.3,(rnd()-.5)*4,(rnd()-.5)*4,1+rnd()*2,[255,230,140],.012,.35,3);
    const v=Math.max(.15,1-Math.hypot(mx-P.x,my-P.y)/25);crashSnd(v,imp>6);if(A===P||B===P){CRT.hit=Math.max(CRT.hit,Math.min(.8,imp/14));shake=Math.max(shake,Math.min(1.1,imp/10));}}}
