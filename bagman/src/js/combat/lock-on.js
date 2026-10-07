/* =====================================================================
   13. LOCK-ON AND BERSERK DASH
   ===================================================================== */
function lockValid(e){if(!e)return false;if(e.boom)return e.fuse===undefined&&L.things.includes(e);return !e.dead&&e.st!=='dead'&&e.st!=='dying';}
const LOCK_RANGE=()=>L.sniper?70:(P.w===1?(RULES.bag?6:7.5):P.w===2?(RULES.bag?8:12):(RULES.bag?10:15));
function candidates(){const out=[];if(!L.rails&&P.w===3&&!(P.berserk>0))return out;if(L.rails){for(const c of R_.cars){if(c.dead)continue;const ang=railsAngleOf(c);if(Math.abs(angDiff(R_.base,ang))<1.25&&c.z<75)out.push({e:c,d:angDiff(R_.yaw,ang),dist:Math.hypot(c.x-R_.px,c.z-CZ)});}return out;}
  const cone=L.sniper?.5*P.fov:1.25;
  const consider=(e)=>{const dx=e.x-P.x,dy=e.y-P.y,dist=Math.hypot(dx,dy);if(dist>LOCK_RANGE())return;
    const d=angDiff(P.a,Math.atan2(dy,dx));if(Math.abs(d)>cone)return;if(!L.sniper&&!hasLOS(P.x,P.y,e.x,e.y))return;out.push({e,d,dist});};
  for(const e of L.enemies)if(lockValid(e)&&!e.T.nolock)consider(e);
  for(const t of L.things)if(t.boom&&t.fuse===undefined)consider(t);
  return out;}
function lockShift(dir){const cs=candidates();if(!P.lock||!cs.length)return;const cur=cs.find(c=>c.e===P.lock);const cd=cur?cur.d:angDiff(L.rails?R_.yaw:P.a,L.rails?railsAngleOf(P.lock):Math.atan2(P.lock.y-P.y,P.lock.x-P.x));
  let best=null;for(const c of cs){if(c.e===P.lock)continue;const dd=c.d-cd;if(dir>0?dd>.01:dd<-.01){if(!best||Math.abs(dd)<Math.abs(best.d-cd))best=c;}}
  if(best){P.lock=best.e;P.lockLost=0;SFX.lock();}else play('empty',.4,1.6,.15);}
// a turn gesture while locked moves the lock to the next target in that direction instead of turning the view
// Keys and sticks shift once per press. Mouse and touch use a leaky accumulator, so only a deliberate flick moves the lock:
// slow drift leaks away, and a cooldown stops one long swipe from skipping past several targets.
function lockSwipe(manual,held){const k=Math.abs(held)>.35?Math.sign(held):0;
  if(k||P.kPrev){if(k&&k!==P.kPrev)lockShift(k);P.kPrev=k;P.swipe=0;return;}
  if(P.swipeCd>0){P.swipeCd--;P.swipe=0;return;}
  P.swipe=(P.swipe||0)*.86+manual;if(Math.abs(P.swipe)>.09){lockShift(Math.sign(P.swipe));P.swipe=0;P.swipeCd=14;}}
function lockCycle(){if(RULES.nofocus){if(lockMsgT<=0){feed('NO FOCUS. NO LOCK.',C_GR);lockMsgT=1.5;}return;}
  if(!L.rails&&P.w===3&&!(P.berserk>0)){if(P.lock){P.lock=null;SFX.unlock();}if(lockMsgT<=0){feed('NO LOCK.',C_GR);lockMsgT=1.5;}return;}
  if(P.lock&&lockValid(P.lock)&&!(P.berserk>0&&!L.rails&&!P.lock.boom)){P.lock=null;P.swipe=0;SFX.unlock();return;}
  if(P.berserk>0&&!L.rails){const t=P.lock&&lockValid(P.lock)?P.lock:null;const cs=candidates();
    const en=cs.filter(c=>!c.e.boom);if(!t&&en.length){en.sort((a,b)=>(Math.abs(a.d)+a.dist*.05)-(Math.abs(b.d)+b.dist*.05));P.lock=en[0].e;SFX.lock();}
    if(P.lock&&lockValid(P.lock)&&!P.lock.boom){startDash(P.lock);return;}}
  const cs=candidates();if(!cs.length){if(P.lock){P.lock=null;SFX.unlock();}return;}
  cs.sort((a,b)=>a.d-b.d);
  if(!P.lock||!cs.find(c=>c.e===P.lock)){let best=cs[0],bs=1e9;for(const c of cs){const s=Math.abs(c.d)+c.dist*.015;if(s<bs){bs=s;best=c;}}P.lock=best.e;}
  else{const i=cs.findIndex(c=>c.e===P.lock);P.lock=cs[(i+1)%cs.length].e;}
  P.lockLost=0;P.turnBreak=0;SFX.lock();}
function nearestTarget(x,y,skip){if(L.rails){return railsBest(skip);}
  let b=null,bd=1e9;for(const e of L.enemies){if(!lockValid(e)||e===skip||e.T.nolock)continue;const pd=Math.hypot(e.x-P.x,e.y-P.y);const d=Math.hypot(e.x-x,e.y-y)+pd*.5;if(d<bd&&pd<22&&hasLOS(P.x,P.y,e.x,e.y)){bd=d;b=e;}}return b;}
function updLock(dt){if(!P.lock)return;if(!lockValid(P.lock)){P.lock=null;return;}
  if(L.rails){const ang=railsAngleOf(P.lock);R_.yaw+=clamp(angDiff(R_.yaw,ang),-dt*7,dt*7);R_.yaw=clamp(R_.yaw,-1.3,1.3);if(P.lock.z>80)P.lock=null;return;}
  const e=P.lock;const ang=Math.atan2(e.y-P.y,e.x-P.x);P.a+=clamp(angDiff(P.a,ang),-dt*(P.berserk>0?14:8),dt*(P.berserk>0?14:8));
  if(L.sniper)P.a=clamp(P.a,-Math.PI/2-1.4,-Math.PI/2+1.4);
  const seen=L.sniper?true:(e.boom?hasLOS(P.x,P.y,e.x,e.y):e.los);
  if(!seen||Math.hypot(e.x-P.x,e.y-P.y)>LOCK_RANGE()+3){P.lockLost+=dt;if(P.lockLost>.8){P.lock=null;SFX.unlock();}}else P.lockLost=0;}
function startDash(e){const dx=e.x-P.x,dy=e.y-P.y,d=Math.hypot(dx,dy);if(d>10||d<.9)return;
  let tx=e.x-dx/d*.85,ty=e.y-dy/d*.85;
  const steps=Math.ceil(d*6);let lx=P.x,ly=P.y;for(let i=1;i<=steps;i++){const x=P.x+(tx-P.x)*i/steps,y=P.y+(ty-P.y)*i/steps;if(blockedAt(x,y,.22))break;lx=x;ly=y;}
  ST.dashes++;P.dash={x0:P.x,y0:P.y,x1:lx,y1:ly,t:0,dur:.13,e};P.a=Math.atan2(dy,dx);setDir();SFX.grr(1);CRT.hit=Math.max(CRT.hit,.3);}
function updDash(dt){KW='fists';const d=P.dash;d.t+=dt;const k=Math.min(1,d.t/d.dur);P.x=d.x0+(d.x1-d.x0)*k;P.y=d.y0+(d.y1-d.y0)*k;
  for(let i=0;i<2;i++)addPart(P.x,P.y,.5,(rnd()-.5),(rnd()-.5),.2,[255,0,0],.02,.25,4);
  if(k>=1){P.dash=null;P.cool=0;if(lockValid(d.e)){P.a=Math.atan2(d.e.y-P.y,d.e.x-P.x);setDir();const W0=WEAP[0];P.cool=W0.rate*.7;P.anim={i:0,t:0};SFX.fists();
    d.e.shotDmg=0;hurtEnemy(d.e,150+rnd()*60,P.a,.9,false);SFX.thud();shake=.8;CRT.hit=.5;}}}

