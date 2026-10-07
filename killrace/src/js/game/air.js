/* =====================================================================
   KILL RACE 3b. AIR
   The world is flat, but cars don't have to stay on it. Every car has a
   height (z) and a climb rate (vz):
     ramps   stepped plank kickers on the roads throw you as far as your
             speed allows
     blasts  explosions throw cars in the air and spin them; a wrecked car
             goes up on its own fireball, Twisted Metal style
     landing hard hurts; landing on another car crushes it (Carmageddon)
   In the air there is no grip: you keep your speed and can only twist a
   little. Cars at different heights pass over each other.
   ===================================================================== */
const GRAV=16;
// a ramp is three plank steps rising toward the end it launches from
const RAMP={L:1.8,W:3.2,H:.36};
function makeRampBodies(){const pl=TX(WALLS,tex('BOARD')*TS,0,TS,TS);
  BODY.rampStep=[1,2,3].map(k=>{const H=RAMP.H*k/3;return{L:RAMP.L/3,W:RAMP.W,H,front:[[pl,0,H]],rear:[[pl,0,H]],side:[[pl,0,H,.33]]};});}
function addRamp(x,y,a){L.ramps.push({x,y,a});}
// waves: kickers on straight road, square to the road; race: one on each leg of the course
function placeRamps(R,course){L.ramps=[];const W=L.W,p=CITY.blk+CITY.road,ok=(x,y)=>{for(let oy=-2;oy<=2;oy++)for(let ox=-2;ox<=2;ox++){const i=(Math.floor(y)+oy)*W+Math.floor(x)+ox;if(L.map[i]||L.block[i])return false;}return true;};
  if(course){const n=course.length;for(let i=0;i<n;i++){const[ax,ay]=course[i],[bx,by]=course[(i+1)%n],t=.3+.15*(i%2),x=ax+(bx-ax)*t,y=ay+(by-ay)*t;
      if(ok(x,y)&&Math.hypot(bx-ax,by-ay)>15)addRamp(x,y,Math.atan2(by-ay,bx-ax));}return;}
  for(let k=0,t=0;k<10&&t<300;t++){const horiz=R()<.5,line=Math.floor(R()*(CITY.N+1)),blk=Math.floor(R()*CITY.N),off=4+Math.floor(R()*(CITY.blk-8));
    const c=1+3+line*p+.5,along=1+CITY.road+blk*p+off+.5,x=horiz?along:c,y=horiz?c:along,a=(horiz?0:Math.PI/2)+(R()<.5?0:Math.PI);
    if(!ok(x,y)||L.ramps.some(r=>Math.hypot(r.x-x,r.y-y)<12)||Math.hypot(x-L.sx,y-L.sy)<10)continue;addRamp(x,y,a);k++;}}
function drawRamp(r){const ca=Math.cos(r.a),sa=Math.sin(r.a),s=RAMP.L/3;
  // the three steps, far one first
  const steps=[0,1,2].map(k=>({x:r.x+ca*(k-1)*s,y:r.y+sa*(k-1)*s,a:r.a,B:BODY.rampStep[k]}));
  steps.sort((a,b)=>((b.x-P.x)**2+(b.y-P.y)**2)-((a.x-P.x)**2+(a.y-P.y)**2));
  for(const st of steps)drawCarBox(st,st.B,C_K);}

const carH=c=>{const B=BODY[c.body||c.kind];return(B?B.H:.5)*(c.sc||1);};
function airLaunch(c,vz,spin){c.z=Math.max(c.z||0,.02);c.vz=Math.max(c.vz||0,vz);if(spin)c.spin=(c.spin||0)+spin;c.airT=0;c.airMax=0;}

// on the ground: check the ramps. A car crossing the top edge going forward takes off; one hitting
// the tall end from in front gets a jolt instead
function rampCheck(c,ox,oy){if(!L.ramps||(c.z||0)>.05)return;
  for(const r of L.ramps){const ca=Math.cos(r.a),sa=Math.sin(r.a),dx=c.x-r.x,dy=c.y-r.y,acr=-dx*sa+dy*ca;if(Math.abs(acr)>RAMP.W/2+.1)continue;
    const al=dx*ca+dy*sa,al0=(ox-r.x)*ca+(oy-r.y)*sa,v=c.vx*ca+c.vy*sa,top=RAMP.L/2;
    if(al0<top&&al>=top&&v>2.5&&al0>-top-.5){airLaunch(c,Math.min(8,1.2+v*.5),0);c.vx*=1.04;c.vy*=1.04;
      if(c===P){play('push',.7,.5);P.bump=4;}else if(Math.hypot(c.x-P.x,c.y-P.y)<20)play('push',.35,.6);}
    else if(al0>top&&al<=top&&v<-3){c.vx*=.5;c.vy*=.5;airLaunch(c,1.5,0);if(c===P){P.bump=6;play('thud',.6,.7);}}}}

// returns true while the car is off the ground; the caller skips driving
function airStep(c,dt){if(!((c.z||0)>0)&&!((c.vz||0)>0))return false;
  c.vz-=GRAV*dt;c.z=(c.z||0)+c.vz*dt;c.airT=(c.airT||0)+dt;c.airMax=Math.max(c.airMax||0,c.z);
  if(c.spin){c.a+=c.spin*dt;c.spin*=Math.max(0,1-dt*.8);}
  c.vx*=1-dt*.05;c.vy*=1-dt*.05;c.skid=0;c.slip=0;c.accel=0;
  // falling onto a car crushes it
  if(c.vz<-2)for(const o of[P,...L.vcars]){if(o===c||(o===P&&P.dead)||o.dead||(o.z||0)>.3)continue;const h=carH(o);if(c.z>h+.05||c.z<h-.5)continue;
    if(Math.hypot(o.x-c.x,o.y-c.y)>(o.r+c.r)*.8)continue;
    const dmg=30+(-c.vz)*9*c.mass;
    if(o===P){hurtPlayer(dmg*.5,Math.atan2(c.y-P.y,c.x-P.x),'crushed');bigMsg('CRUSHED',1,C_R);}
    else{if(c===P){o.lastRam=tm;o.angry=8;}damageCar(o,dmg*(c===P?1.6:1),c===P?P:null);if(c===P){feed('CRUSHED '+(o.name||'')+' +$200',C_Y);P.score+=200;P.nitro=Math.min(100,P.nitro+30);}}
    play('thud',1,.4);play('empty',.8,.5);for(let k=0;k<14;k++)addPart(o.x,o.y,h,(rnd()-.5)*5,(rnd()-.5)*5,1+rnd()*2,[255,230,140],.012,.35,3);
    c.z=h;c.vz=3.5;shake=Math.max(shake,c===P||o===P?1:.3);break;}
  if(c.z<=0){c.z=0;const hit=-c.vz;c.spin=0;
    if(hit>3.5){c.vz=hit*.28;c.z=.001;}else c.vz=0;
    const near=Math.max(.1,1-Math.hypot(c.x-P.x,c.y-P.y)/24);if(hit>2)play('thud',Math.min(1,hit/8)*near,.5);
    for(let k=0;k<(hit>5?10:4);k++)addPart(c.x,c.y,.1,(rnd()-.5)*3,(rnd()-.5)*3,.6+rnd(),[150,150,160],.02,.4,3);
    if(hit>7){const dmg=(hit-7)*4;if(c===P){if(!(P.berserk>0))hurtPlayer(dmg,undefined,'landing');}else if(!c.dead)damageCar(c,dmg,null);}
    if(c===P){P.bump=Math.min(8,hit*.9);shake=Math.max(shake,Math.min(1,hit/10));
      if(c.vz===0&&c.airT>.55){const v=Math.round(c.airT*10)*50;P.score+=v;P.nitro=Math.min(100,P.nitro+c.airT*25);feed('AIR '+c.airT.toFixed(1)+'S +'+money(v),C_C);addTime&&RACE.on&&c.airT>1&&addTime(1);}}}
  moveCar(c,dt);return true;}
