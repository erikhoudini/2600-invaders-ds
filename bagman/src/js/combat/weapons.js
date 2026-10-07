function aimAngle(){if(P.lock&&lockValid(P.lock))return Math.atan2(P.lock.y-P.y,P.lock.x-P.x);return P.a;}
function tryFire(){if(L.sniper){sniperFire();return;}const W0=WEAP[P.w];if(P.cool>0||P.switchT>0||P.dash)return;
  if(L.rails){railsFire();return;}
  if(P.w===5){P.cool=WEAP[5].rate;P.anim={i:0,t:0};KW='flame';flameShot();return;}
  if(P.berserk>0&&P.w===0&&P.lock&&lockValid(P.lock)&&!P.lock.boom&&Math.hypot(P.lock.x-P.x,P.lock.y-P.y)>1.3){startDash(P.lock);return;}
  if(W0.ammo){if(ammoOf(W0.ammo)<=0){SFX.empty();P.cool=.3;autoSwitch();return;}if(W0.ammo==='d'){P.d--;ST.dyn++;P.cool=W0.rate;P.anim={i:0,t:0};throwDyn();return;}if(W0.ammo==='b'){P.b--;if(P.w===3)ST.tommy++;else ST.pistol++;}else{P.s--;ST.shells++;}}
  P.cool=W0.rate*(P.berserk>0&&P.w===0?.7:1);P.anim={i:0,t:0};for(const e of L.enemies)e.shotDmg=0;
  KW=['fists','pistol','shotgun','ak','dyn'][P.w];const locked=P.lock&&lockValid(P.lock);const a=aimAngle();const hs=locked?W0.hs:.05;
  if(P.w===0){SFX.fists();const ber=P.berserk>0;const hit=fireRay(a,ber?1.6:1.3,ber?140:10,ber?190:22,ber?.85:0,0);if(hit){SFX.thud();if(ber){shake=.7;CRT.hit=.4;}}}
  else{P.flash=.06;borderFlash=.05;borderFlashIdx=P.w===2?14:15;P.recoil=P.w===2?10:(P.w===1?5:3);
    ST.shots++;
    if(P.w===1){SFX.pistol();if(fireRay(a+(rnd()-.5)*(locked?.004:.02),40,11,20,0,hs))ST.hits++;}
    else if(P.w===2){SFX.shotgun();shake=.6;let h=0;for(let k=0;k<9;k++)if(fireRay(a+(rnd()-.5)*.17,40,6,12,.0,hs))h=1;ST.hits+=h;if(RULES.david){P.dav++;if(P.dav%3===0)davidBoom(a);}}
    else{SFX.tommy();shake=.15;if(fireRay(a+(rnd()-.5)*(locked?.02:.05),40,9,15,.3,hs))ST.hits++;}
    noise();}
}
// the flamethrower: a short cone of burning fuel, the same stuff the torchers throw
function flameShot(){const a=aimAngle();if(!L.pflames)L.pflames=[];ST.shots++;play('boom',.16,1.8+rnd()*.4,.06);P.flash=.03;shake=Math.max(shake,.12);
  for(let k=0;k<2;k++){const b=a+(rnd()-.5)*.2,sp=7.5+rnd()*2;L.pflames.push({x:P.x+Math.cos(b)*.45,y:P.y+Math.sin(b)*.45,z:.42,vx:Math.cos(b)*sp,vy:Math.sin(b)*sp,life:1,big:2});}noise();}
function updPFlames(dt){const F=L.pflames;if(!F)return;const kw0=KW;KW='flame';
  for(let i=F.length-1;i>=0;i--){const s=F[i];s.life-=dt;let dead=s.life<=.1;
    for(let k=0;k<2&&!dead;k++){s.x+=s.vx*dt/2;s.y+=s.vy*dt/2;
      if(solidCell(Math.floor(s.x),Math.floor(s.y),false)){dead=true;carHit(Math.floor(s.y)*L.W+Math.floor(s.x),4);if(rnd()<.2)stainFloor(s.x,s.y,.15,3);break;}
      for(const t of L.things)if(t.boom&&t.fuse===undefined&&Math.abs(t.x-s.x)<.35&&Math.abs(t.y-s.y)<.35){t.hp-=5;if(t.hp<=0)detonate(t,0);dead=true;break;}
      if(!dead)for(const e of L.enemies){if(e.st==='dead'||e.st==='dying')continue;const r=e.dog?.32:.34*e.sc;if(Math.abs(e.x-s.x)<r&&Math.abs(e.y-s.y)<r){e.shotDmg=0;hurtEnemy(e,7,Math.atan2(s.vy,s.vx),.25,false);dead=true;break;}}}
    if(rnd()<dt*12)addPart(s.x,s.y,s.z,(rnd()-.5)*.4,(rnd()-.5)*.4,.6+rnd(),[255,140+rnd()*90|0,0],.03,.3,2);
    if(dead)F.splice(i,1);}KW=kw0;}
// a lit stick lobbed at the lock (or straight ahead); it bounces, rolls and goes off when the fuse burns down
function throwDyn(){const a=aimAngle(),c=Math.cos(a),sn=Math.sin(a);const tgt=P.lock&&lockValid(P.lock)?Math.hypot(P.lock.x-P.x,P.lock.y-P.y):7;
  const d=clamp(tgt*.92,2,12),T=.55+d*.03,g=9;L.bombs.push({x:P.x+c*.3,y:P.y+sn*.3,z:.5,vx:c*d/T,vy:sn*d/T,vz:(-.45+.5*g*T*T)/T,fuse:1.6,g});play('push',.5,1.6);}
function updBombs(dt){if(!L.bombs)return;for(let i=L.bombs.length-1;i>=0;i--){const b=L.bombs[i];b.fuse-=dt;
    const nx=b.x+b.vx*dt,ny=b.y+b.vy*dt;if(solidCell(Math.floor(nx),Math.floor(b.y),false)){b.vx*=-.45;}else b.x=nx;if(solidCell(Math.floor(b.x),Math.floor(ny),false)){b.vy*=-.45;}else b.y=ny;
    b.vz-=b.g*dt;b.z+=b.vz*dt;if(b.z<0){b.z=0;if(Math.abs(b.vz)>1.2)play('push',.25,2.2,.05);b.vz=-b.vz*.3;b.vx*=.3;b.vy*=.3;}if(b.z<.01){const f=Math.max(0,1-5*dt);b.vx*=f;b.vy*=f;}
    if(rnd()<.7)addPart(b.x,b.y,b.z+.12,(rnd()-.5)*.6,(rnd()-.5)*.6,.8+rnd(),rnd()<.5?[255,220,0]:[255,90,0],.012,.25,2);
    if(b.fuse<=0){L.bombs.splice(i,1);window.__lastBoom=[b.x,b.y];explode({x:b.x,y:b.y,boom:1,dyn:1,en:b.en});}}}
function autoSwitch(){for(const w of[3,2,1,0]){if(!P.has[w])continue;const W0=WEAP[w];if(!W0.ammo||ammoOf(W0.ammo)>0){if(w!==P.w)selectW(w);return;}}}
function selectW(w){if(!P.has[w]||w===P.w||L.rails||P.berserk>0||P.flame>0)return;P.lastW=P.w;if(w===3)P.lock=null;P.pendingW=w;P.switchT=.28;SFX.weapon();}
