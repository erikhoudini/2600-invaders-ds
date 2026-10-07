/* =====================================================================
   18. RAILS MODE: the flatbed
   ===================================================================== */
let R_=null;const F=242,EYE=2.9,DECKY=1.2,CAMZ=-5;let CZ=CAMZ;
// cars chase the flatbed and shoot the truck itself. dmg is what one hit takes off the truck
const CARSPEC={bike:{hp:45,w:.9,h:1.0,score:300,g:1,dmg:3},sedanR:{hp:130,w:2,h:1.33,score:600,g:1,dmg:4},sedanW:{hp:130,w:2,h:1.33,score:600,g:1,dmg:4},sedanY:{hp:130,w:2,h:1.33,score:600,g:1,dmg:4},
  pickup:{hp:210,w:2.1,h:1.4,score:900,g:2,dmg:4},cruiser:{hp:170,w:2,h:1.33,score:1200,g:1,dmg:5}};
const NZ=new Uint8Array(65536);{const R=rng(4242);for(let i=0;i<NZ.length;i++)NZ[i]=(R()*255)|0;}
function railsInit(){const R=rng(777);
  R_={t:0,end:96,scroll:0,px:0,pz:0,yaw:0,yawT:0,kick:0,base:0,side:0,cars:[],shots:[],props:[],tr:[],booms:[],ti:0,R,sky:makeSky(99,1.4,500),done:0,truck:200,truckMax:200,fired:0,warn:0,
    tl:[[2,['bike','bike']],[6,['sedanR']],[10,['sedanW','bike','bike']],[15,['pickup','bike']],[20,['sedanY','sedanR','bike']],[25,['cruiser','pickup']],
      [31,'SIDE'],[33,['side','side']],[39,['side','side']],[45,['side','side','side']],[52,['side','side']],[58,'BACK'],
      [61,['cruiser','sedanW','bike']],[66,['pickup','pickup','bike']],[72,['cruiser','cruiser','sedanR']],[78,['pickup','sedanY','bike','bike']],[85,['pickup','cruiser','cruiser','sedanW','bike','bike']]]};
  for(let i=0;i<40;i++){const side=i%2?1:-1;R_.props.push({kind:i%4===0?'pole':(i%3===0?'tree':'jtree'),ti:i%4,x:side*(i%4===0?8.5:10+R()*25),z:i*6+R()*4});}
  L.shots=[];P.lock=null;}
function railsBest(skip){let b=null,bd=1e9;for(const c of R_.cars){if(c.dead||c===skip)continue;const ang=railsAngleOf(c);const d=Math.abs(angDiff(R_.yaw,ang));if(Math.abs(angDiff(R_.base,ang))<1.25&&c.z<70&&d<bd){bd=d;b=c;}}return b;}
function railsSpawn(kind){const R=R_.R,hm=RULES.donuts?1.3:1;
  if(kind==='side'){R_.cars.push({kind,side:1,ti:Math.floor(R()*3),x:6.2+R()*.8,z:CZ-15-R()*4,tx:6.2,tz:CZ-4+R()*10,hp:170*hm,cd:1.4+R()*1.2,S:{hp:170,w:3,h:1.5,score:900,g:2,dmg:4},dead:0,burn:0,name:LIZ[Math.floor(R()*LIZ.length)],wob:R()*TAU,laneT:3,flash:0});return;}
  const S=CARSPEC[kind];const lane=[-3.6,0,3.6][Math.floor(R()*3)];const ram=(kind==='pickup'||kind==='cruiser')&&R()<.55;
  R_.cars.push({kind,ram,x:lane+(R()-.5),z:70+R()*10,tx:lane,tz:ram?3.5:6+R()*9,hp:S.hp*hm,cd:1.5+R()*1.5,S,dead:0,burn:0,name:LIZ[Math.floor(R()*LIZ.length)],wob:R()*TAU,laneT:2+R()*3,flash:0,ramT:0});}
const railsAngleOf=c=>Math.atan2(c.x-R_.px,c.z-CZ);
function railsDown(c){const Rr=R_;c.dead=1;c.burn=0;ST.kills++;ST.cars++;chainKill();const m=Math.max(1,P.chain);P.score+=c.S.score*m;L.kills++;SFX.bigboom();SFX.boom(Math.max(.3,1-c.z/60));
  shake=Math.max(shake,.9);CRT.boom=clamp(1-c.z/40,.35,1);borderFlash=.12;borderFlashIdx=14;Rr.booms.push({x:c.x,z:c.z,t:0,y:.8});
  for(let k=0;k<46;k++)Rr.shots.push({x:c.x+(rnd()-.5)*2,y:.5+rnd(),z:c.z+(rnd()-.5),vx:(rnd()-.5)*7,vy:rnd()*7,vz:(rnd()-.5)*5,life:.6+rnd()*.7,fire:1});
  for(let k=0;k<14;k++)Rr.shots.push({x:c.x,y:1,z:c.z,vx:(rnd()-.5)*9,vy:3+rnd()*6,vz:(rnd()-.5)*6,life:1.2,debris:1});
  feed('+$'+(c.S.score*m).toLocaleString('en-US'),C_C);if(P.lock===c){P.lock=null;}}
// the AK on the flatbed: no ammo to count, every third round a tracer, misses kick up the road
function railsFire(){const Rr=R_;KW='ak';P.cool=WEAP[3].rate;ST.tommy++;ST.shots++;Rr.fired++;P.anim={i:0,t:0};SFX.tommy();P.flash=.05;borderFlash=.03;borderFlashIdx=15;P.recoil=4;shake=Math.max(shake,.2);Rr.kick+=.006*(rnd()<.5?-1:1);
  const locked=P.lock&&!P.lock.dead;const a=(locked?railsAngleOf(P.lock):Rr.yaw)+(rnd()-.5)*(locked?.018:.04);
  let best=null,bz=1e9;for(const c of Rr.cars){if(c.dead)continue;const dist=Math.hypot(c.x-Rr.px,c.z-CZ);if(Math.abs(angDiff(a,railsAngleOf(c)))<Math.atan(c.S.w*.55/dist)&&dist<bz){bz=dist;best=c;}}
  const sa=Math.sin(a),ca=Math.cos(a);
  if(best){ST.hits++;best.hp-=locked?13:11;best.flash=.05;for(let k=0;k<4;k++)Rr.shots.push({x:best.x+(rnd()-.5)*best.S.w*.6,y:.5+rnd()*.9,z:best.z,vx:(rnd()-.5)*4,vy:rnd()*4,vz:-2,life:.25,spark:1});
    if(Rr.fired%3===0)Rr.tr.push({a,d:bz,y:.9,life:.06});if(best.hp<=0)railsDown(best);}
  else{const d=16+rnd()*40,x=Rr.px+sa*d,z=CZ+ca*d;for(let k=0;k<3;k++)Rr.shots.push({x,y:.05,z,vx:(rnd()-.5)*1.5,vy:1+rnd()*2,vz:32,life:.45,dust:1});if(Rr.fired%3===0)Rr.tr.push({a,d,y:0,life:.06});}}
function truckHit(dmg,x,y,z){const Rr=R_;if(!cheat.fent)Rr.truck-=dmg;Rr.truckHit=.18;CRT.hit=Math.max(CRT.hit,.16);borderFlash=.08;borderFlashIdx=10;
  for(let k=0;k<4;k++)Rr.shots.push({x,y,z,vx:(rnd()-.5)*3,vy:rnd()*3,vz:0,life:.25,spark:1});play('empty',.35,1.8+rnd()*.4,.03);
  if(Rr.truck<=0&&state==='play'){Rr.truck=0;bigMsg('THE TRUCK IS DONE',3,C_R);P.dead=1;ST.deaths++;state='dying';deathT=0;P.lock=null;SFX.pdie();SFX.bigboom();CRT.hit=1;shake=1.4;}}
function railsUpdate(dt){const Rr=R_;Rr.t+=dt;Rr.scroll+=dt*32;
  // you stand at the tailgate. the only thing you move is the gun
  const wantSide=Rr.sideOn?1:0;Rr.side+=(wantSide-Rr.side)*Math.min(1,dt*2.2);
  const nb=Rr.side*Math.PI/2,db=nb-Rr.base;Rr.yaw+=db;Rr.yawT+=db;Rr.base=nb;CZ=CAMZ;
  let t=0;if(K('turnL')||K('left'))t-=1;if(K('turnR')||K('right'))t+=1;t+=stick.x+GP.rx+GP.lx;t=clamp(t,-1,1);
  const manual=t*2.3*dt+turnAcc;turnAcc=0;
  if(P.lock&&(P.lock.dead||Math.abs(angDiff(Rr.base,railsAngleOf(P.lock)))>1.3))P.lock=null;
  if(P.lock&&lockValid(P.lock)){lockSwipe(manual,t);Rr.yawT+=clamp(angDiff(Rr.yawT,railsAngleOf(P.lock)),-dt*6,dt*6);}else Rr.yawT+=manual;
  const hot=firing||K('fire')||mouseFire||keys.ControlLeft||GP.fire;
  if(!RULES.nofocus&&!P.lock){let best=null,bd=.1;for(const c of Rr.cars){if(c.dead||c.z>72)continue;const d=Math.abs(angDiff(Rr.yawT,railsAngleOf(c)));if(d<bd){bd=d;best=c;}}
    if(best)Rr.yawT+=angDiff(Rr.yawT,railsAngleOf(best))*Math.min(1,dt*(hot?3:1.2));Rr.assist=best;}else Rr.assist=null;
  Rr.yawT=Rr.base+clamp(angDiff(Rr.base,Rr.yawT),-1.15,1.15);Rr.kick*=Math.max(0,1-dt*10);
  Rr.yaw+=angDiff(Rr.yaw,Rr.yawT+Rr.kick)*Math.min(1,dt*16);P.a=Rr.yaw;
  while(Rr.ti<Rr.tl.length&&Rr.t>=Rr.tl[Rr.ti][0]){const ev=Rr.tl[Rr.ti][1];
    if(ev==='SIDE'){Rr.sideOn=1;bigMsg('ALONGSIDE',2,C_R);SFX.horn();}
    else if(ev==='BACK'){if(Rr.cars.some(c=>c.side&&!c.dead)){Rr.t-=dt;break;}Rr.sideOn=0;bigMsg('BEHIND YOU',1.6,C_Y);}
    else for(const k of ev)railsSpawn(k);
    if(Rr.ti===Rr.tl.length-1){bigMsg('HERE COME THE GECKOS',2.5,C_R);SFX.horn();}Rr.ti++;}
  for(const c of Rr.cars){c.flash-=dt;
    if(c.dead){c.burn+=dt;if(c.side){c.z-=dt*(6+c.burn*14);c.x+=dt*3;}else{c.z+=dt*(14+c.burn*20);c.x+=dt*Math.sign(c.x||1)*2;}if(rnd()<.6)Rr.shots.push({x:c.x+(rnd()-.5),y:1+rnd()*.6,z:c.z,vx:(rnd()-.5),vy:2+rnd()*2,vz:0,life:.5,fire:1});continue;}
    c.wob+=dt;
    if(c.side){c.x+=(c.tx+Math.sin(c.wob*1.7)*.35-c.x)*Math.min(1,dt*1.5);const tz=c.tz+Math.sin(c.wob*.5)*4;c.z+=(tz-c.z)*Math.min(1,dt*1.4);}
    else{c.laneT-=dt;if(c.laneT<=0&&!(c.ram&&c.z<14)){c.laneT=2+Rr.R()*3;c.tx=c.ram?(Rr.R()-.5)*1.2:[-3.6,0,3.6][Math.floor(Rr.R()*3)];}
      c.x+=(c.tx+Math.sin(c.wob*1.3)*.4-c.x)*Math.min(1,dt*1.2);
      const tz=c.tz+(c.ram?0:Math.sin(c.wob*.7)*3);c.z+=(tz-c.z)*Math.min(1,dt*(c.z>tz?.8:.4)*(c.ram?1.6:1));
      // rammers close in and hit the tailgate
      if(c.ram&&c.z<6){c.ramT+=dt;if(c.ramT>1.2){c.ramT=0;truckHit(22,c.x*.3,.8,-.5);SFX.bigboom();shake=1.1;CRT.hit=.6;c.z+=9;c.hp-=20;c.flash=.2;feed('RAMMED',C_R);if(c.hp<=0)railsDown(c);}}}
    c.cd-=dt;if(c.cd<=0&&(c.side||c.z<45)){c.cd=((c.kind==='bike'?1.0:1.4)+Rr.R()*1.1)*(RULES.aggr?.7:1);c.flash=.12;SFX.eshot(Math.max(.2,1-Math.abs(c.z-CZ)/50));
      const n=c.side?2:c.kind==='pickup'?3:(c.kind==='cruiser'?2:1);
      for(let k=0;k<n;k++){const gx=c.side?c.x-.4:c.x+(c.kind==='pickup'?(k-1)*.6:.5),gy=c.side?1.4:c.S.h+.7,gz=c.side?c.z+(k-.5)*1.2:c.z;
        const tx=(Rr.R()-.5)*2.4,ty=.7+Rr.R()*1.1,tz=-13+Rr.R()*12;
        const sp=c.side?10:12,dx=tx-gx,dy=ty-gy,dz=tz-gz,dd=Math.hypot(dx,dy,dz);Rr.shots.push({x:gx,y:gy,z:gz,vx:dx/dd*sp,vy:dy/dd*sp,vz:dz/dd*sp,life:5,enemy:1,dmg:c.S.dmg});}}}
  Rr.cars=Rr.cars.filter(c=>c.z<120&&c.z>CZ-60);
  for(let i=Rr.shots.length-1;i>=0;i--){const p=Rr.shots[i];p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;if(p.fire||p.spark||p.debris){p.vy-=(p.debris?12:4)*dt;p.z+=dt*10;}if(p.dust){p.vy-=3*dt;}if(p.smoke)p.a+=dt;
    if(p.enemy&&Math.abs(p.x)<1.4&&p.y<2.2&&p.z<0&&p.z>-14){truckHit(p.dmg||3,p.x,p.y,p.z);Rr.shots.splice(i,1);continue;}
    if(p.life<=0||p.z<CZ-2||p.y<-.5)Rr.shots.splice(i,1);}
  for(let i=Rr.tr.length-1;i>=0;i--){Rr.tr[i].life-=dt;if(Rr.tr[i].life<=0)Rr.tr.splice(i,1);}
  for(let i=Rr.booms.length-1;i>=0;i--){const b=Rr.booms[i];b.t+=dt;b.z+=dt*12;if(b.t>.7)Rr.booms.splice(i,1);}
  Rr.truckHit=Math.max(0,(Rr.truckHit||0)-dt);
  const hpf=Rr.truck/Rr.truckMax;
  if(hpf<.5&&Rr.warn<1){Rr.warn=1;}if(hpf<.25&&Rr.warn<2){Rr.warn=2;bigMsg('THE TRUCK IS ON FIRE',2,C_R);SFX.horn();}
  if(hpf<.5&&state==='play'&&rnd()<dt*(hpf<.25?9:5))Rr.shots.push({x:(rnd()<.5?-1:1)*(1.1+rnd()*.6),y:1.3+rnd()*.4,z:-5.5+rnd()*2,vx:(rnd()-.5)*.6,vy:1.4+rnd(),vz:6+rnd()*3,life:1.1,smoke:1,a:0});
  if(hpf<.25&&state==='play'&&rnd()<dt*30)Rr.shots.push({x:(rnd()-.5)*2.4,y:1.2,z:-.6-rnd()*2,vx:(rnd()-.5),vy:2+rnd()*2,vz:3,life:.4,tfire:1});
  if(Rr.t>Rr.end&&Rr.ti>=Rr.tl.length&&!Rr.cars.some(c=>!c.dead)&&!Rr.done){Rr.done=1;bigMsg('ROAD IS CLEAR',2.5,C_G);Rr.doneT=2.2;}
  if(Rr.done&&Rr.doneT>0){Rr.doneT-=dt;if(Rr.doneT<=0){state='exiting';exitT=0;}}
  weaponTick(dt);}
function fillR(x,y,w,h,c,k){x=Math.round(x);y=Math.round(y);w=Math.round(w);h=Math.round(h);for(let yy=Math.max(0,y);yy<Math.min(VH,y+h);yy++)for(let xx=Math.max(0,x);xx<Math.min(SW,x+w);xx++){const i=(yy*SW+xx)*4;D[i]=Math.min(255,c[0]*k);D[i+1]=Math.min(255,c[1]*k);D[i+2]=Math.min(255,c[2]*k);}}
function blit(src,fx,fy,fw,fh,cx,by,w,h,k){const left=cx-w/2,top=by-h;const x0=Math.max(0,Math.ceil(left)),x1=Math.min(SW,Math.ceil(left+w)),y0=Math.max(0,Math.ceil(top)),y1=Math.min(VH,Math.ceil(by));
  const sd=src.d,sw=src.w;for(let x=x0;x<x1;x++){const u=fx+Math.min(fw-1,Math.floor((x-left)/w*fw));for(let y=y0;y<y1;y++){const v=fy+Math.min(fh-1,Math.floor((y-top)/h*fh));const si=(v*sw+u)*4;if(sd[si+3]<110)continue;const di=(y*SW+x)*4;
    D[di]=Math.min(255,sd[si]*k);D[di+1]=Math.min(255,sd[si+1]*k);D[di+2]=Math.min(255,sd[si+2]*k);}}}
function railsRender(){const Rr=R_,yaw=Rr.yaw,sn=Math.sin(yaw),cs=Math.cos(yaw),eye=EYE+Math.sin(Rr.t*23)*.015;
  const sky=Rr.sky;for(let x=0;x<SW;x++){const ang=yaw+Math.atan((x-CX)/F)+Math.PI;const sx=Math.floor(((ang/TAU)%1+1)%1*SKYW);
    for(let y=0;y<HALF;y++){const si=(y*SKYW+sx)*3,di=(y*SW+x)*4;D[di]=sky[si];D[di+1]=sky[si+1];D[di+2]=sky[si+2];}}
  // road: one lookup into a noise table per pixel, stepped along the row
  for(let y=HALF;y<VH;y++){const cz=eye*F/(y-HALF+.5),k=Math.max(.25,1.2-cz*.012);let di=y*SW*4;
    const l0=(0-CX)/F;let X=Rr.px+cz*(sn+l0*cs),Z=CZ+cz*(cs-l0*sn)-Rr.scroll;const dX=cz*cs/F,dZ=-cz*sn/F;
    for(let x=0;x<SW;x++,di+=4,X+=dX,Z+=dZ){let r,g,b;const ax=X<0?-X:X;
      if(ax<6){const h=NZ[(((X*8)|0)&255)|((((Z*8)|0)&255)<<8)]/255;r=g=b=48+h*30;if(ax>1.88&&ax<2.12&&((Z%9+9)%9)<4.5){r=230;g=230;b=210;}if(ax>5.55&&ax<5.75){r=230;g=210;b=40;}}
      else if(ax<7.5){const h=NZ[(((X*6)|0)&255)|((((Z*6)|0)&255)<<8)]/255;r=120+h*40;g=100+h*30;b=70+h*20;}
      else{const h=NZ[(((X*3)|0)&255)|((((Z*3)|0)&255)<<8)]/255;r=180+h*40;g=150+h*30;b=100+h*20;if(h<.5&&NZ[((X*.7)&255)|(((Z*.7)&255)<<8)]<13){r=70;g=90;b=40;}}
      D[di]=r*k;D[di+1]=g*k;D[di+2]=b*k;}}
  const list=[];const dk=(x,z)=>{const dx=x-Rr.px,dz=z-CZ;return dx*sn+dz*cs;};
  for(const p of Rr.props){const z=((p.z+Rr.scroll)%240+240)%240-20;list.push({zz:z,k:dk(p.x,z),p});}
  for(const c of Rr.cars)list.push({zz:c.z,k:dk(c.x,c.z),c});
  for(const s of Rr.shots)list.push({zz:s.z,k:dk(s.x,s.z),s});
  for(const b of Rr.booms)list.push({zz:b.z,k:dk(b.x,b.z),b});
  list.sort((a,b)=>b.k-a.k);lockBox=null;
  const proj=(X,Y,Z)=>{const dx=X-Rr.px,dz=Z-CZ,czz=dx*sn+dz*cs,cx=dx*cs-dz*sn;return[CX+cx/czz*F,HALF-(Y-eye)/czz*F,czz];};
  for(const o of list){
    if(o.p){const p=o.p;const[sx,sy,cz]=proj(p.x,0,o.zz);if(cz<.5)continue;const k=Math.max(.3,1.2-cz*.012);
      if(p.kind==='pole'){const top=proj(p.x,7,o.zz)[1];const w=Math.max(1,Math.round(.25/cz*F));fillR(sx-w/2,top,w,sy-top,[110,80,50],k);fillR(sx-1.4/cz*F,top,2.8/cz*F,Math.max(1,.2/cz*F),[110,80,50],k);}
      else if(p.kind==='tree')blit(TREES,(p.ti%A.treeN)*64,0,64,128,sx,sy,3.4/cz*F,6.8/cz*F,k);else blit(DECO,dec('JTREE')*64,0,64,64,sx,sy,3.2/cz*F,3.2/cz*F,k);}
    else if(o.c){const c=o.c;const[sx,sy,cz]=proj(c.x,0,c.z);if(cz<1)continue;const k=Math.max(.35,1.25-cz*.012)*(c.dead?.35:1);const w=c.S.w/cz*F,h=c.S.h/cz*F;
      if(!c.dead||c.burn<.3)for(let g=0;g<c.S.g;g++){const gx=c.side?c.x+.2:c.kind==='pickup'?c.x+(g-.5)*.8:c.x+(c.kind==='bike'?0:.45);const[gsx,gsy]=proj(gx,c.side?1.05:c.kind==='bike'?.35:c.S.h*.75,c.side?c.z+(g-.5)*1.3:c.z+(c.kind==='pickup'?.6:0));
        const gh=(c.kind==='bike'?1.5:1.25)/cz*F;blit(SHEET[c.kind==='cruiser'?'cop':'thug'],(c.flash>0?2:(c.flash>-.15?1:0))*64,6*64,64,64,gsx,gsy,gh,gh,k);}
      if(c.side)blit(CARSIDE,c.ti*128,10,128,104,sx,sy+.12/cz*F,w,h*1.15,k*(c.flash>0?1.4:1));else blit(CARS,A.carNames.indexOf(c.kind)*96,0,96,64,sx,sy,w,h,k*(c.flash>0?1.4:1));
      if(c.ram&&!c.dead&&c.z<16&&((tm*8)|0)&1)fillR(sx-w/2,sy-h-3,w,2,[255,0,0],1);
      if(c===P.lock)lockBox={l:sx-w/2,r:sx+w/2,t:sy-h-1.2/cz*F,b:sy,ty:cz};}
    else if(o.b){const b=o.b;const[sx,sy,cz]=proj(b.x,b.y+b.t*1.5,b.z);if(cz<1)continue;const r=Math.max(2,(1.2+b.t*3.2)/cz*F*(1-b.t*.4));
      for(let y=Math.max(0,Math.floor(sy-r));y<Math.min(VH,sy+r);y++)for(let x=Math.max(0,Math.floor(sx-r));x<Math.min(SW,sx+r);x++){const d=((x-sx)**2+(y-sy)**2)/(r*r);if(d>1||rnd()<d*.6)continue;const i=(y*SW+x)*4;
        if(b.t<.12){D[i]=255;D[i+1]=255;D[i+2]=220;}else if(d<.35&&b.t<.4){D[i]=255;D[i+1]=220;D[i+2]=60;}else if(b.t<.5){D[i]=255;D[i+1]=90;D[i+2]=0;}else{D[i]=90;D[i+1]=80;D[i+2]=80;}}}
    else{const s=o.s;const[sx,sy,cz]=proj(s.x,s.y,s.z);if(cz<.3)continue;const r=s.smoke?clamp(Math.round((.14+s.a*.35)/cz*F),2,10):Math.max(s.dust||s.spark?1:2,Math.round((s.enemy?.1:s.debris?.08:.09)/cz*F));
      if(s.smoke){const g=70+(((s.x*97)|0)&31);for(let y=Math.max(0,(sy-r)|0);y<Math.min(VH,sy+r);y++)for(let x=Math.max(0,(sx-r)|0);x<Math.min(SW,sx+r);x++){if(((x-sx)**2+(y-sy)**2)>r*r||BAYER[((y&3)<<2)|(x&3)]>.4)continue;const i=(y*SW+x)*4;D[i]=g;D[i+1]=g;D[i+2]=g;}continue;}
      const col=s.tfire?(rnd()<.5?[255,90,0]:[255,210,40]):s.enemy?[255,230,0]:s.dust?[200,180,140]:s.debris?[60,60,60]:(s.fire?(rnd()<.5?[255,120,0]:[255,230,60]):[255,255,255]);fillR(sx-r,sy-r,r*2,r*2,col,1);if(s.enemy)fillR(sx-r/2,sy-r/2,r,r,[255,255,255],1);}}
  for(let y=HALF+1;y<VH;y++){const cz=(eye-DECKY)*F/(y-HALF+.5);let di=y*SW*4;const l0=-CX/F;let X=Rr.px+cz*(sn+l0*cs),Z=CZ+cz*(cs-l0*sn);const dX=cz*cs/F,dZ=-cz*sn/F;
    for(let x=0;x<SW;x++,di+=4,X+=dX,Z+=dZ){if(Z<0&&Z>-14&&X<1.35&&X>-1.35){let r=120,g=80,b=45;if(((X+2)*4)%1<.08){r=50;g=30;b=15;}if(Z>-.25){r=160;g=160;b=170;}if(X>1.25||X<-1.25){r=90;g=90;b=95;}
      if(Rr.truckHit>0&&Z>-1.5){r=Math.min(255,r+90);g*=.6;b*=.6;}D[di]=r*.95;D[di+1]=g*.95;D[di+2]=b*.95;}}}
  // tracers from the muzzle out to where the round went
  for(const t of Rr.tr){const[ex,ey,cz]=proj(Rr.px+Math.sin(t.a)*t.d,t.y,CZ+Math.cos(t.a)*t.d);if(cz<1)continue;const x0=CX+18,y0=VH-46;const n=Math.max(Math.abs(ex-x0),Math.abs(ey-y0))|0;
    for(let k=n*.35|0;k<n;k++){const x=Math.round(x0+(ex-x0)*k/n),y=Math.round(y0+(ey-y0)*k/n);if(x<0||y<0||x>=SW||y>=VH)continue;const i=(y*SW+x)*4;D[i]=255;D[i+1]=240;D[i+2]=120;}}}

