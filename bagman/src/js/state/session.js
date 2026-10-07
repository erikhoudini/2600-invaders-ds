let state='boot',borderFlash=0,borderFlashIdx=0;
function setDir(){P.dx=Math.cos(P.a);P.dy=Math.sin(P.a);P.px=-P.dy*P.fov;P.py=P.dx*P.fov;}
let bg=null;
function buildBG(){const c=L.th.ceil||[0,0,0];bg=new Uint8ClampedArray(SW*HALF*4);
  for(let y=0;y<HALF;y++){const k=Math.pow((HALF-y)/HALF,1.4)*.9;for(let x=0;x<SW;x++){const i=(y*SW+x)*4;bg[i]=c[0]*k;bg[i+1]=c[1]*k;bg[i+2]=c[2]*k;bg[i+3]=255;}}}
let msgs=[],big={t:'',time:0,c:C_Y,sc:2},combo={t:'',time:0};
function bigMsg(t,d=2,c=C_Y){big={t,time:d,c};}
function feed(t,c=C_W){msgs.unshift({t,time:2.2,c});if(msgs.length>3)msgs.length=3;}
function startLevel(n,snap,gm){
  GM=gm||'story';computeRules();L=genLevel(n);applySnap(snap);P.fell=0;P.still=0;P.lavaT=0;P.dav=0;P.maxHp=RULES.dope?50:100;P.hp=Math.min(P.hp,P.maxHp);P.s=Math.min(P.s,sMax());
  WHEEL.down=0;WHEEL.open=0;P.lastW=null;Object.assign(P,{keys:{},hurt:0,flash:0,dead:0,anim:null,cool:0,switchT:0,lock:null,chain:0,chainT:0,sprint:false,sprintT:false,berserk:0,slow:0,flame:0,dash:null});if(P.w===5)P.w=1;
  P.fov=.66;P.zoom=false;$('sprintBtn').classList.remove('on');CRT.rage=0;CRT.slow=0;CRT.low=0;timeScaleAudio=1;
  slot.n=0;slot.spin=0;slot.win=0;L.score0=P.score;parts.length=0;msgs=[];showMap=false;$('mapBtn').classList.remove('on');
  if(L.rails){railsInit();P.w=3;P.has[3]=1;P.hp=Math.max(P.hp,P.maxHp);}
  else{P.x=L.sx;P.y=L.sy;P.a=L.sa;setDir();if(!P.has[P.w])P.w=1;buildBG();}
  $('swapBtn').textContent=L.sniper?'Scope':'Swap';
  bigMsg(L.arenaName||CH[n-1].t,3);state='play';PAUSED=false;setMode('game');rumbleOn(!!L.rails);ambFor(L);if(muff&&AC)muff.frequency.value=20000;
}

