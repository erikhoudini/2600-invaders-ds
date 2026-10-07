/* =====================================================================
   22. INPUT: keyboard, mouse, touch pads and controllers
   ===================================================================== */
const FINE=matchMedia('(pointer:fine)').matches;let hadLock=false,wheelT=0;
function cycleW(d){if(P.berserk>0||L.rails)return;for(let k=1;k<=5;k++){const w=(P.w+d*k+10)%5;if(P.has[w]&&(!WEAP[w].ammo||ammoOf(WEAP[w].ammo)>0)){selectW(w);return;}}}
addEventListener('keydown',e=>{
  if(state==='edit'){edKey(e);return;}
  if(state==='ui'){uiKey(e);return;}
  UI.input='key';
  if(state==='intro'){if(intro&&intro.t>.3)introEnd();return;}
  if(state==='comic'){if(e.code==='Escape')comicEnd();else if(!e.repeat)comicNext();return;}
  keys[e.code]=true;
  if(state==='play'){if(e.code.startsWith('Digit')){const w=+e.code.slice(5)-1;if(w>=0&&w<5)selectW(w);}
    if(e.code===KB.run&&!e.repeat&&OPT.sprint==='toggle')P.sprintT=!P.sprintT;
    if(e.code===KB.swap&&!e.repeat)wheelPress();if(e.code===KB.lock&&!e.repeat)lockCycle();if(e.code===KB.drum&&L.arena)dropDrum();
    if((e.code===KB.turnL||e.code===KB.turnR)&&!e.repeat&&P.lock&&lockValid(P.lock)){const d=e.code===KB.turnL?-1:1;lockShift(d);P.kPrev=d;}
    if(e.code==='Escape'||e.code==='KeyP'){showPause();return;}if(e.code===KB.map||e.code==='Tab'){toggleMap();e.preventDefault();}
    if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Tab',KB.fire].includes(e.code))e.preventDefault();}});
addEventListener('keyup',e=>{keys[e.code]=false;if(e.code===KB.swap)wheelRelease();});
addEventListener('blur',()=>{for(const k in keys)keys[k]=false;WHEEL.down=0;WHEEL.open=0;firing=false;mouseFire=false;stick={x:0,y:0};});
addEventListener('pointerdown',e=>{if(state==='intro'&&intro&&intro.t>.3)introEnd();if(state==='comic'&&comic){comic.down=1;comic.hold=0;}if(state!=='ui')UI.input=e.pointerType==='mouse'?'mouse':'touch';},true);
addEventListener('pointerup',()=>{if(state==='comic'&&comic&&comic.down){comic.down=0;if(comic.hold<.3)comicNext();comic.hold=0;}},true);
view.addEventListener('mousedown',e=>{if(state!=='play')return;audioInit();if(e.button===2){lockCycle();return;}if(document.pointerLockElement===view)mouseFire=true;else{try{const r=view.requestPointerLock();if(r&&r.catch)r.catch(()=>{});}catch(err){}}});
addEventListener('mouseup',()=>{mouseFire=false;});
addEventListener('mousemove',e=>{if(state==='play'&&!document.pointerLockElement&&(Math.abs(e.movementX)+Math.abs(e.movementY)>2))UI.input='mouse';if(document.pointerLockElement===view&&state==='play'){const k=OPT.mouse/5;if(WHEEL.down)wheelNudge(e.movementX*.02,e.movementY*.02);else turnAcc+=e.movementX*.0034*k;}});
document.addEventListener('pointerlockchange',()=>{const on=!!document.pointerLockElement;if(!on&&hadLock&&state==='play'){UI.wantLock=true;showPause();}hadLock=on;});
addEventListener('wheel',e=>{if(state!=='play'||!L)return;if(L.sniper){if((e.deltaY<0)!==P.zoom)toggleScope();return;}
  if(WHEEL.down)return;const now=performance.now();if(now-wheelT<110)return;wheelT=now;cycleW(e.deltaY>0?1:-1);},{passive:true});
const SENS=.0105,turners=new Map();
const turnStart=e=>turners.set(e.pointerId,e.clientX);
function turnMove(e){if(!turners.has(e.pointerId))return;turnAcc+=(e.clientX-turners.get(e.pointerId))*SENS*OPT.touch/5;turners.set(e.pointerId,e.clientX);}
const turnEnd=e=>turners.delete(e.pointerId);
const rp=$('rightPad');
rp.addEventListener('pointerdown',e=>{if(e.target!==rp&&!e.target.classList.contains('padlab'))return;rp.setPointerCapture(e.pointerId);turnStart(e);});
rp.addEventListener('pointermove',turnMove);rp.addEventListener('pointerup',turnEnd);rp.addEventListener('pointercancel',turnEnd);
view.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'||state!=='play')return;view.setPointerCapture(e.pointerId);turnStart(e);});
view.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse'&&state==='play')turnMove(e);});view.addEventListener('pointerup',turnEnd);view.addEventListener('pointercancel',turnEnd);
const fireBtn=$('fireBtn');
fireBtn.addEventListener('pointerdown',e=>{e.preventDefault();audioInit();fireBtn.setPointerCapture(e.pointerId);firing=true;fireBtn.classList.add('on');turnStart(e);});
fireBtn.addEventListener('pointermove',turnMove);
const fireUp=e=>{firing=false;fireBtn.classList.remove('on');turnEnd(e);};fireBtn.addEventListener('pointerup',fireUp);fireBtn.addEventListener('pointercancel',fireUp);
const lockBtn=$('lockBtn');lockBtn.addEventListener('pointerdown',e=>{e.preventDefault();audioInit();if(state==='play')lockCycle();lockBtn.classList.add('on');});
for(const ev of['pointerup','pointercancel','pointerleave'])lockBtn.addEventListener(ev,()=>lockBtn.classList.remove('on'));
$('drumBtn').addEventListener('pointerdown',e=>{e.preventDefault();if(state==='play')dropDrum();});
{const sb=$('swapBtn');let sid=null,sx0=0,sy0=0;
  sb.addEventListener('pointerdown',e=>{e.preventDefault();if(state!=='play')return;if(L.sniper){toggleScope();return;}sid=e.pointerId;sb.setPointerCapture(e.pointerId);sx0=e.clientX;sy0=e.clientY;wheelPress();});
  sb.addEventListener('pointermove',e=>{if(e.pointerId!==sid||!WHEEL.down)return;const dx=(e.clientX-sx0)/46,dy=(e.clientY-sy0)/46;if(Math.hypot(dx,dy)>.35)wheelAim(dx,dy);});
  const up=e=>{if(e.pointerId!==sid)return;sid=null;wheelRelease();};sb.addEventListener('pointerup',up);sb.addEventListener('pointercancel',up);}
$('menuBtn').addEventListener('click',()=>{if(state==='play')showPause();});
function toggleMap(){if(!L||L.rails||L.sniper)return;showMap=!showMap;$('mapBtn').classList.toggle('on',showMap);SFX.menu();}
$('mapBtn').addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();if(state==='play')toggleMap();});
const sprintBtn=$('sprintBtn');sprintBtn.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();P.sprint=OPT.sprint==='hold'?true:!P.sprint;sprintBtn.classList.toggle('on',P.sprint);});
for(const ev of['pointerup','pointercancel','pointerleave'])sprintBtn.addEventListener(ev,()=>{if(OPT.sprint==='hold'&&P.sprint){P.sprint=false;sprintBtn.classList.remove('on');}});
const lp=$('leftPad'),kb=$('knobBase'),kn=$('knob');let stickId=null,sox=0,soy=0;
lp.addEventListener('pointerdown',e=>{if(e.target===sprintBtn||stickId!==null)return;audioInit();stickId=e.pointerId;lp.setPointerCapture(e.pointerId);const r=lp.getBoundingClientRect();sox=e.clientX-r.left;soy=e.clientY-r.top;
  kb.style.left=kn.style.left=sox+'px';kb.style.top=kn.style.top=soy+'px';kb.style.display=kn.style.display='block';});
lp.addEventListener('pointermove',e=>{if(e.pointerId!==stickId)return;const r=lp.getBoundingClientRect();let dx=e.clientX-r.left-sox,dy=e.clientY-r.top-soy;const l=Math.hypot(dx,dy),Rr=52;if(l>Rr){dx*=Rr/l;dy*=Rr/l;}
  stick.x=Math.abs(dx/Rr)<.1?0:dx/Rr;stick.y=Math.abs(dy/Rr)<.1?0:dy/Rr;kn.style.left=(sox+dx)+'px';kn.style.top=(soy+dy)+'px';});
const stickUp=e=>{if(e.pointerId!==stickId)return;stickId=null;stick={x:0,y:0};kb.style.display=kn.style.display='none';if(P.sprint&&OPT.sprint==='hold'){P.sprint=false;sprintBtn.classList.remove('on');}};
lp.addEventListener('pointerup',stickUp);lp.addEventListener('pointercancel',stickUp);
document.addEventListener('visibilitychange',()=>{if(document.hidden&&state==='play')showPause();});
document.addEventListener('contextmenu',e=>e.preventDefault());
