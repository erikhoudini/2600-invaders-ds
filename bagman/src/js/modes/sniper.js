/* =====================================================================
   15b. SNIPER: rooftop perch, scope, patrolling guards
   ===================================================================== */
function toggleScope(){if(!L||!L.sniper)return;P.zoom=!P.zoom;P.fov=P.zoom?.2:.66;setDir();play('switch',.6,P.zoom?1.4:1);}
function updPlayerSniper(dt){CRT.low=P.hp<=25?(1-P.hp/25)*.8+.2:0;
  let t=0;if(keys.ArrowLeft||keys.KeyA)t-=1;if(keys.ArrowRight||keys.KeyD)t+=1;t+=stick.x*.8;
  const manual=(t*(P.zoom?.7:2.2)*dt)+turnAcc*(P.fov/.66);turnAcc=0;
  if(P.lock&&lockValid(P.lock))lockSwipe(manual,t);else P.a=clamp(P.a+manual,-Math.PI/2-1.4,-Math.PI/2+1.4);
  updLock(dt);setDir();P.moving=0;P.mvx=P.mvy=0;
  P.cool-=dt;if(firing||keys.Space||mouseFire)sniperFire();
  if(P.anim){P.anim.t+=dt;if(P.anim.t>.06){P.anim.t=0;P.anim.i++;if(P.anim.i>=2)P.anim=null;}}
  P.recoil=Math.max(0,P.recoil-dt*40);if(P.chainT>0){P.chainT-=dt;if(P.chainT<=0)P.chain=0;}}
function alertNear(x,y,r){for(const e of L.enemies){if(!e.guard||e.st==='dead'||e.st==='dying'||e.alertT>0||e.st==='alert'||e.st==='attack')continue;if(Math.hypot(e.x-x,e.y-y)<r)e.alertT=.3+rnd()*.9;}}
function sniperFire(){if(P.cool>0)return;ST.rifle++;ST.shots++;P.cool=1.05;P.anim={i:0,t:0};P.flash=.06;P.recoil=12;shake=.45;CRT.hit=Math.max(CRT.hit,.15);borderFlash=.05;borderFlashIdx=15;
  play('pistol',1,.5);play('boom',.35,1.6);
  const locked=P.lock&&lockValid(P.lock);const a=aimAngle()+(P.zoom||locked?0:(rnd()-.5)*.012);const c=Math.cos(a),sn=Math.sin(a);
  let best=null,bd=80;
  for(const e of L.enemies){if(e.st==='dead'||e.st==='dying')continue;const dx=e.x-P.x,dy=e.y-P.y,al=dx*c+dy*sn;if(al<=0||al>=bd)continue;if(Math.abs(-dx*sn+dy*c)<(P.zoom?.24:.3)*e.sc){best=e;bd=al;}}
  for(const t of L.things){if(!t.boom)continue;const dx=t.x-P.x,dy=t.y-P.y,al=dx*c+dy*sn;if(al<=0||al>=bd)continue;if(Math.abs(-dx*sn+dy*c)<.3){best=t;bd=al;}}
  if(best&&best.boom){detonate(best,0);return;}
  if(best){ST.hits++;const head=rnd()<(P.zoom?.7:.3)+(locked?.2:0);best.shotDmg=0;hurtEnemy(best,260,a,.15,head);alertNear(best.x,best.y,7);return;}
  const h=cast(P.x+c*4,P.y+sn*4,c,sn,70);const ix=h?P.x+c*(4+h.t):P.x+c*40,iy=h?P.y+sn*(4+h.t):P.y+sn*40;puff(ix,iy);alertNear(ix,iy,5);}
function updGuard(e,dt){const dx=P.x-e.x,dy=P.y-e.y;
  if(e.alertT>0){e.alertT-=dt;if(e.alertT<=0&&(e.st==='idle')){e.st='alert';e.cd=.6+rnd();SFX.alert(.4);}}
  if(e.st==='chase')e.st='alert';
  if(e.st==='pain'){if(e.t>.26)e.st='alert';return;}
  if(e.st==='idle'){
    e.bt=(e.bt||0)-dt;if(e.bt<=0){e.bt=.5;for(const o of L.enemies)if((o.st==='dead'||o.st==='dying')&&Math.hypot(o.x-e.x,o.y-e.y)<7&&hasLOS(e.x,e.y,o.x,o.y)){e.alertT=.4;break;}}
    if(e.wait>0){e.wait-=dt;e.moving=0;return;}
    if(!e.wp||Math.hypot(e.wp.x-e.x,e.wp.y-e.y)<.3){e.wp=null;for(let k=0;k<12;k++){const x=Math.floor(e.x+(rnd()*2-1)*7),y=Math.floor(e.y+(rnd()*2-1)*7);
        if(x<1||y<1||x>=L.W-1||y>=L.H-4||L.map[y*L.W+x]||L.block[y*L.W+x])continue;if(!hasLOS(e.x,e.y,x+.5,y+.5))continue;e.wp={x:x+.5,y:y+.5};break;}
      if(rnd()<.4)e.wait=1+rnd()*3;return;}
    const mx=e.wp.x-e.x,my=e.wp.y-e.y,ml=Math.hypot(mx,my)||1;e.a=Math.atan2(my,mx);if(!moveEnemy(e,mx/ml,my/ml,1.1*dt))e.wp=null;e.moving=1;e.wt+=dt;return;}
  e.a=Math.atan2(dy,dx);e.moving=0;
  if(e.st==='alert'){e.cd-=dt;if(e.cd<=0){e.st='attack';e.t=0;e.fr=0;}return;}
  if(e.st==='attack'){if(e.fr===0&&e.t>.45){e.fr=1;e.t=0;SFX.eshot(.5);if(rnd()<.28)hurtPlayer(5,Math.atan2(e.y-P.y,e.x-P.x));}
    else if(e.fr===1&&e.t>.2){e.st='alert';e.cd=1.6+rnd()*1.4;}}}
function drawScope(){const r2=92*92,cy=HZ+36;for(let y=0;y<VH;y++)for(let x=0;x<SW;x++){const dx=x-CX,dy=y-cy;if(dx*dx+dy*dy>r2){const i=(y*SW+x)*4;D[i]=D[i+1]=D[i+2]=0;}}
  for(let k=4;k<92;k++){if(k%10===0){put(CX-k,cy-1,C_R);put(CX+k,cy-1,C_R);put(CX-1,cy+k,C_R);}put(CX-k,cy,C_R);put(CX+k,cy,C_R);if(k<75)put(CX,cy+k,C_R);put(CX,cy-k,C_R);}}

