/* =====================================================================
   KILL RACE 15. INPUT
   Keyboard, mouse, Bagman's two touch pads (left stick drives, the buttons
   are relabelled), and a standard-mapping gamepad: RT gas, LT brake,
   left stick steers, A fire, B handbrake, X nitro, Y drum, LB lock,
   RB gun, Back horn, Start pause.
   ===================================================================== */
const keys={};let stick={x:0,y:0},firing=false,mouseFire=false,nitroBtn=false;
const UI_TOUCH=matchMedia('(pointer:coarse)').matches;
function setBody(m){document.body.className=m;resize();}
function startMode(){GAMEMODE=TITLE_SEL===1?'race':'waves';garageOpen();}
function launch(){PCAR=GARAGE[GSEL];loopsOff();if(GAMEMODE==='race')newRace();else newGame();musicFor(GAMEMODE);}
function garagePick(d){const n=clamp(GSEL+d,0,GARAGE.length-1);if(n!==GSEL){GSEL=n;play('menu',.4,1.3);}}
function startOrResume(){audioInit();if(state==='title')startMode();else if(state==='over'||state==='garage')launch();else if(state==='paused')resume();}
function titlePick(d){TITLE_SEL=(TITLE_SEL+d+MODES.length)%MODES.length;play('menu',.4,1.3);}
function pause(){if(state!=='play')return;state='paused';rumbleOn(false);loopsOff();for(const k in keys)keys[k]=false;firing=false;mouseFire=false;}
function resume(){state='play';rumbleOn(true);}
function toTitle(){titleInit();}
addEventListener('keydown',e=>{audioInit();const c=e.code;
  if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Tab'].includes(c))e.preventDefault();
  if(state==='title'){if(c==='Enter'||c==='Space'||c==='NumpadEnter')startMode();else if(c==='ArrowUp'||c==='KeyW')titlePick(-1);else if(c==='ArrowDown'||c==='KeyS')titlePick(1);else if(c==='Digit1'){TITLE_SEL=0;startMode();}else if(c==='Digit2'){TITLE_SEL=1;startMode();}return;}
  if(state==='garage'){if(c==='Enter'||c==='Space'||c==='NumpadEnter')launch();else if(c==='ArrowLeft'||c==='KeyA')garagePick(-1);else if(c==='ArrowRight'||c==='KeyD')garagePick(1);else if(c==='Escape')toTitle();return;}
  if(state==='over'){if(overT<1)return;if(c==='Enter'||c==='NumpadEnter')startOrResume();else if(c==='Escape')toTitle();return;}
  if(state==='paused'){if(c==='Escape'||c==='KeyP'||c==='Enter')resume();else if(c==='KeyQ')toTitle();return;}
  keys[c]=true;if(state!=='play'||e.repeat)return;
  if(c.startsWith('Digit')){const w=+c.slice(5)-1;if(w>=0&&w<4)selectGun(w);}
  if(c==='KeyQ')nextGun();if(c==='KeyE')lockCycle();if(c==='KeyB')dropDrum();if(c==='KeyH')horn();if(c==='KeyR')buyRepair();if(c==='KeyT')buyRecover();if(c==='KeyM')musicToggle();
  if(c==='Escape'||c==='KeyP')pause();});
addEventListener('keyup',e=>{keys[e.code]=false;});
addEventListener('blur',()=>{for(const k in keys)keys[k]=false;firing=false;mouseFire=false;nitroBtn=false;stick={x:0,y:0};pause();});
document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
document.addEventListener('contextmenu',e=>e.preventDefault());
view.addEventListener('pointerdown',e=>{audioInit();
  // title: the two mode buttons sit at 34-42% and 42-50% of the screen height
  if(state==='garage'){const r=view.getBoundingClientRect(),u=(e.clientX-r.left)/r.width;if(u<.3)garagePick(-1);else if(u>.7)garagePick(1);else launch();return;}
  if(state==='title'){const r=view.getBoundingClientRect(),v=(e.clientY-r.top)/r.height;if(v>.3&&v<.42)TITLE_SEL=0;else if(v>=.42&&v<.52)TITLE_SEL=1;startMode();return;}
  if(state!=='play'){if(state!=='over'||overT>1)startOrResume();return;}
  if(e.pointerType==='mouse'){if(e.button===2)lockCycle();else mouseFire=true;}});
addEventListener('mouseup',()=>{mouseFire=false;});
addEventListener('wheel',e=>{if(state==='play')nextGun();},{passive:true});

// touch: Bagman's pads with car labels
function touchSetup(){const lab=(id,t)=>{const el=$(id);if(el)el.textContent=t;};
  lab('sprintBtn','Nitro');lab('mapBtn','Horn');lab('swapBtn','Gun');lab('drumBtn','Drum');
  const labs=document.querySelectorAll('.padlab');if(labs[0])labs[0].textContent='DRIVE';if(labs[1])labs[1].textContent='GUNS';
  const fb=$('fireBtn');fb.addEventListener('pointerdown',e=>{e.preventDefault();audioInit();firing=true;fb.classList.add('on');});
  const fu=()=>{firing=false;fb.classList.remove('on');};fb.addEventListener('pointerup',fu);fb.addEventListener('pointercancel',fu);fb.addEventListener('pointerleave',fu);
  $('lockBtn').addEventListener('pointerdown',e=>{e.preventDefault();if(state==='play')lockCycle();});
  $('swapBtn').addEventListener('pointerdown',e=>{e.preventDefault();if(state==='play')nextGun();});
  $('mapBtn').addEventListener('pointerdown',e=>{e.preventDefault();if(state==='play')horn();});
  $('drumBtn').addEventListener('pointerdown',e=>{e.preventDefault();if(state==='play')dropDrum();});
  $('menuBtn').addEventListener('click',()=>{if(state==='play')pause();else if(state==='paused')resume();});
  const nb=$('sprintBtn');nb.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();nitroBtn=true;nb.classList.add('on');});
  for(const ev of['pointerup','pointercancel','pointerleave'])nb.addEventListener(ev,()=>{nitroBtn=false;nb.classList.remove('on');});
  const lp=$('leftPad'),kb=$('knobBase'),kn=$('knob');let id=null,ox=0,oy=0;
  lp.addEventListener('pointerdown',e=>{if(e.target===nb||id!==null)return;audioInit();id=e.pointerId;lp.setPointerCapture(id);const r=lp.getBoundingClientRect();ox=e.clientX-r.left;oy=e.clientY-r.top;
    kb.style.left=kn.style.left=ox+'px';kb.style.top=kn.style.top=oy+'px';kb.style.display=kn.style.display='block';});
  lp.addEventListener('pointermove',e=>{if(e.pointerId!==id)return;const r=lp.getBoundingClientRect();let dx=e.clientX-r.left-ox,dy=e.clientY-r.top-oy;const l=Math.hypot(dx,dy),R=52;if(l>R){dx*=R/l;dy*=R/l;}
    stick.x=Math.abs(dx/R)<.1?0:dx/R;stick.y=Math.abs(dy/R)<.1?0:dy/R;kn.style.left=(ox+dx)+'px';kn.style.top=(oy+dy)+'px';});
  const up=e=>{if(e.pointerId!==id)return;id=null;stick={x:0,y:0};kb.style.display=kn.style.display='none';};lp.addEventListener('pointerup',up);lp.addEventListener('pointercancel',up);}

const GP={on:0,lx:0,rt:0,lt:0,fire:0,hand:0,boost:0,prev:[]};
function pollPad(){const pads=navigator.getGamepads?navigator.getGamepads():[];let g=null;for(const p of pads)if(p&&p.connected){g=p;break;}
  if(!g){GP.on=0;GP.lx=GP.rt=GP.lt=0;GP.fire=GP.hand=GP.boost=0;return;}GP.on=1;
  const v=i=>g.buttons[i]?g.buttons[i].value||(g.buttons[i].pressed?1:0):0,b=i=>v(i)>.5,hit=i=>b(i)&&!GP.prev[i];
  const lx=g.axes[0]||0;GP.lx=Math.abs(lx)<.15?0:(lx-Math.sign(lx)*.15)/.85;GP.rt=v(7);GP.lt=v(6);GP.fire=b(0);GP.hand=b(1);GP.boost=b(2);
  if(state==='play'){audioInit();if(hit(4))lockCycle();if(hit(5))nextGun();if(hit(3))dropDrum();if(hit(8))horn();if(hit(9))pause();}
  else if(state==='title'&&(hit(12)||hit(13)))titlePick(hit(12)?-1:1);
  else if(state==='garage'&&(hit(14)||hit(15)))garagePick(hit(14)?-1:1);
  else if(state==='garage'&&hit(1))toTitle();
  else if(hit(0)||hit(9))startOrResume();else if(state==='paused'&&hit(1))resume();else if(state==='over'&&hit(1))toTitle();
  GP.prev=[];for(let i=0;i<17;i++)GP.prev[i]=b(i);}
