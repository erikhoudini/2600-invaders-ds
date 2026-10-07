// controllers, standard mapping: A ok, B back, start pauses. sticks move and turn, RT fires, LB locks, RB holds the gun wheel
const GP={on:0,lx:0,ly:0,rx:0,ry:0,fire:0,run:0,prev:[],rep:{},t:0};
const dz=v=>Math.abs(v)<.2?0:(v-Math.sign(v)*.2)/.8;
function padKey(code){const ev={code,repeat:false,preventDefault(){}};
  if(state==='ui'){UI.input='pad';uiKey(ev);UI.input='pad';}else if(state==='comic'){if(code==='Escape')comicEnd();else if(code==='Enter')comicNext();}else if(state==='intro'){if(intro&&intro.t>.3)introEnd();}}
function pollPad(dt){const pads=navigator.getGamepads?navigator.getGamepads():[];let g=null;for(const p of pads)if(p&&p.connected){g=p;break;}
  if(!g){if(GP.on){GP.on=0;GP.lx=GP.ly=GP.rx=GP.ry=0;GP.fire=GP.run=0;}return;}GP.on=1;
  const b=i=>!!(g.buttons[i]&&(g.buttons[i].pressed||g.buttons[i].value>.5));const now=[];for(let i=0;i<17;i++)now[i]=b(i);const hit=i=>now[i]&&!GP.prev[i],rel=i=>!now[i]&&GP.prev[i];
  GP.lx=dz(g.axes[0]||0);GP.ly=dz(g.axes[1]||0);GP.rx=dz(g.axes[2]||0);GP.ry=dz(g.axes[3]||0);
  if(now.some(Boolean)||Math.abs(GP.lx)+Math.abs(GP.ly)+Math.abs(GP.rx)>.4){if(state!=='play')UI.input='pad';}
  if(state==='play'){audioInit();GP.fire=now[7];GP.run=OPT.sprint==='hold'&&(now[10]||now[0]);if(OPT.sprint==='toggle'&&(hit(10)||hit(0)))P.sprintT=!P.sprintT;
    if(hit(4)||hit(6))lockCycle();if(hit(3)||hit(8))toggleMap();if(hit(9)){GP.prev=now;showPause();return;}if(hit(1)&&L.arena)dropDrum();
    if(hit(5))wheelPress();if(rel(5))wheelRelease();if(WHEEL.down&&Math.hypot(GP.rx,GP.ry)>.4)wheelAim(GP.rx,GP.ry);else if(WHEEL.down&&Math.hypot(GP.lx,GP.ly)>.4)wheelAim(GP.lx,GP.ly);
    if(hit(2))cycleW(1);if(hit(12))cycleW(-1);if(hit(13))cycleW(1);}
  else{GP.fire=0;GP.run=0;
    // menus: d-pad or left stick with key repeat, A and start confirm, B backs out
    const dirs=[['ArrowUp',now[12]||GP.ly<-.6],['ArrowDown',now[13]||GP.ly>.6],['ArrowLeft',now[14]||GP.lx<-.6],['ArrowRight',now[15]||GP.lx>.6]];
    for(const[k,on]of dirs){const r=GP.rep[k];if(on){if(r==null){GP.rep[k]=.38;padKey(k);}else{GP.rep[k]-=dt;if(GP.rep[k]<=0){GP.rep[k]=.09;padKey(k);}}}else GP.rep[k]=null;}
    if(hit(0)||hit(9))padKey('Enter');if(hit(1))padKey('Escape');
    if(state==='ui'&&UI.scr&&UI.scr.doc&&Math.abs(GP.ry)>.2)uiScroll(GP.ry*dt*260);}
  GP.prev=now;}

