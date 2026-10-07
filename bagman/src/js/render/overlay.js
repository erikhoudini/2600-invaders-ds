function postFX(){
  if(P.hurt>0||P.dead){const a=P.dead?Math.min(.75,deathT*.6):Math.min(.22,P.hurt*.75);for(let i=0;i<VH*SW*4;i+=4){D[i]=D[i]+(220-D[i])*a;D[i+1]*=1-a;D[i+2]*=Math.max(0,1-a*2);}}
  if(P.berserk>0){for(let i=0;i<VH*SW*4;i+=4){D[i]=Math.min(255,D[i]*1.15+12);D[i+2]*=.8;}}}
function bracket(l,t,r,b,c){l=Math.round(l);t=Math.round(t);r=Math.round(r);b=Math.round(b);const s=Math.max(4,Math.min(10,((r-l)/3)|0));
  const hl=(x0,x1,y)=>{for(let x=x0;x<=x1;x++){put(x,y,c);put(x,y+1,c);}},vl=(x,y0,y1)=>{for(let y=y0;y<=y1;y++){put(x,y,c);put(x+1,y,c);}};
  hl(l,l+s,t);vl(l,t,t+s);hl(r-s,r,t);vl(r-1,t,t+s);hl(l,l+s,b-1);vl(l,b-s,b);hl(r-s,r,b-1);vl(r-1,b-s,b);}
let tm=0;
function overlay(){
  if(P.lock&&lockBox){const c=((tm*8)|0)&1?C_R:C_W;const pad=3;
    const bt=Math.max(0,lockBox.t-pad),bb=Math.min(VH-1,lockBox.b+pad),bl=Math.max(0,lockBox.l-pad),br=Math.min(SW-1,lockBox.r+pad);bracket(bl,bt,br,bb,c);
    const nm=P.lock.name||'';text(nm,clamp(Math.round((bl+br)/2-textW(nm)/2),1,SW-textW(nm)-1),Math.max(1,bt-10),P.berserk>0?C_Y:C_R,1,C_K);}
  else if(L.rails){const c=R_.assist?C_R:C_W;for(let a=0;a<TAU;a+=.18)put(Math.round(CX+Math.cos(a)*8),Math.round(HALF+Math.sin(a)*8),c);put(CX,HALF,c);put(CX+1,HALF,c);put(CX,HALF+1,c);}
  else if(!(L.sniper&&P.zoom)){const cy=L.sniper?HZ+36:HALF;for(let k=3;k<=7;k++){put(CX-k,cy,C_W);put(CX+k,cy,C_W);put(CX,cy-k,C_W);put(CX,cy+k,C_W);}}
  if(P.hurtDir>0)rect(P.hurtSide>0?SW-6:0,24,6,VH-48,C_R);
  const boss=L.rails?null:L.boss;let ty=1;
  if(boss&&boss.st!=='idle'&&boss.st!=='dead'&&boss.st!=='dying'){rect(0,0,SW,12,C_K);text(boss.hpMax?boss.name:boss.T.boss,4,3,C_R);const bw=SW-88,w=Math.round(bw*Math.max(0,boss.hp)/(boss.hpMax||boss.hp0||boss.T.hp));rect(80,3,bw,6,C_DR);rect(80,3,w,6,C_R);ty=14;}
  else if(L.wave&&!L.wave.done&&L.wave.n>0){const alive=L.enemies.filter(e=>e.st!=='dead'&&e.st!=='dying').length+L.wave.queue.length;text(L.arena?'WAVE '+L.wave.n+'  LEFT '+alive:'WAVE '+L.wave.n+'/'+L.wave.total+'  LEFT '+alive,4,3,C_Y,1,C_K);ty=13;}
  else if(L.sniper){const left=L.enemies.filter(e=>e.st!=='dead'&&e.st!=='dying').length;text('GUARDS LEFT '+left,4,3,C_Y,1,C_K);ty=13;}
  else if(L.rails){const left=Math.max(0,Math.ceil(R_.end-R_.t));rect(0,0,SW,22,C_K);text('FLATBED  '+(R_.t<R_.end?String(left).padStart(2,'0')+'S':'CLEAR THE ROAD'),4,3,C_Y);
    text('TRUCK',4,13,R_.truckHit>0?C_W:C_R);const bw=SW-60;rect(50,14,bw,6,C_DR);rect(50,14,Math.round(bw*R_.truck/R_.truckMax),6,R_.truck<R_.truckMax*.3?(((tm*6)|0)&1?C_R:C_W):C_R);ty=24;}
  if(P.berserk>0){text('BERSERK '+Math.ceil(P.berserk),4,ty+2,P.hold?C_GR:(((tm*6)|0)&1?C_R:C_Y),1,C_K);ty+=11;}
  if(P.slow>0){text('SLO-MO '+Math.ceil(P.slow),4,ty+2,P.hold?C_GR:C_C,1,C_K);ty+=11;}
  if(P.flame>0){text('FLAMER '+Math.ceil(P.flame),4,ty+2,((tm*6)|0)&1?C_Y:C_R,1,C_K);ty+=11;}
  if(L.modArena&&WAVEMODS.length&&L.wave.queue.length+L.enemies.filter(e=>e.st!=='dead'&&e.st!=='dying').length>0){const t=WAVEMODS.map(k=>MODN[k]).join(' + ');text(t,4,ty+2,C_C,1,C_K);ty+=11;}
  if(RULES.lava&&P.still>.3&&!L.rails)textC('MOVE!',72,((tm*8)|0)&1?C_R:C_Y,2,C_K);
  if(OPT.xhair&&!L.sniper&&!L.rails&&state==='play'){const cx=SW>>1,cy=VH>>1;for(const[dx,dy]of[[-4,0],[-3,0],[3,0],[4,0],[0,-4],[0,-3],[0,3],[0,4]]){const i=((cy+dy)*SW+cx+dx)*4;D[i]=255;D[i+1]=255;D[i+2]=255;}}
  if(L.time<7&&FINE&&UI.input==='mouse'&&!document.pointerLockElement&&state==='play')textC('CLICK TO USE THE MOUSE',VH-46,C_GR,1,C_K);
  drawSlot();drawAch(1/60);
  if(P.chain>=2&&P.chainT>0){const s='X'+P.chain;text(s,SW-textW(s,2)-4,16,((tm*6)|0)&1?C_Y:C_R,2,C_K);text('CHAIN',SW-textW('CHAIN')-4,34,C_Y,1,C_K);}
  if(big.time>0){textC(big.t,52,big.c,textW(big.t,2)>SW-8?1:2,C_K);}
  const fy=VH-12;for(let i=0;i<msgs.length;i++)textC(msgs[i].t,fy-i*10,msgs[i].c,1,C_K);
  drawWheel();
  if(combo.time>0&&!WHEEL.open){const sc=Math.min(2,fitScale(combo.t,SW-6));const c=((tm*10)|0)&1?(combo.n>=10?C_R:C_Y):C_W;textC(combo.t,fy-msgs.length*10-8*sc-2,c,sc,C_K);}
}
