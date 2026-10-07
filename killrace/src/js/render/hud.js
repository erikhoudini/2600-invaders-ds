/* =====================================================================
   KILL RACE 13. HUD
   Drawn after the palette pass, like Bagman's, so text and radar stay crisp.
   Bottom bar: car, armour, gun, score, speed and nitro. Top: wave, power-up
   clocks, a heading-up radar. Middle: lock brackets, messages, the chain.
   ===================================================================== */
function hud(){const y0=VH,h=SH-VH;rect(0,y0,SW,h,C_K);rect(0,y0,SW,1,P.berserk>0?C_R:C_B);
  for(const x of[70,166,250])rect(x,y0+1,1,h-1,C_B);
  const hp=Math.max(0,Math.ceil(P.hp));text('CAR',5,y0+6,C_GR);text(hp,5,y0+18,hp<=25?(((tm*5)|0)&1?C_R:C_W):C_W,2);
  if(P.armor>0){text('ARM',42,y0+6,C_B);text(Math.ceil(P.armor),42,y0+18,C_B);}
  const g=gunNow();text(g.name,76,y0+6,P.flame>0?C_Y:C_GR);
  text(P.flame>0?Math.ceil(P.flame)+'S':P.w===0?'INF':String(ammoLeft(P.w)),76,y0+18,C_Y,2);
  if(P.drums)text('DRUMS '+P.drums,124,y0+29,C_Y);
  text('SCORE',172,y0+6,C_GR);{const m=money(P.score);text(m,172,y0+18,C_C,m.length>5?1:2);}
  const mph=Math.round(speedOf(P)*7);text('MPH',256,y0+6,C_GR);text(mph,256,y0+18,P.boosting?C_C:C_W,2);
  rect(256,y0+33,58,4,C_DR);rect(256,y0+33,Math.round(58*P.nitro/100),4,P.boosting?C_W:C_C);}

function radar(){const R=26,cx=SW-R-4,cy=R+4,sc=.8,W=L.W;
  for(let ry=-R;ry<=R;ry++)for(let rx=-R;rx<=R;rx++){if(rx*rx+ry*ry>R*R)continue;
    const wx=P.x+(rx*-P.dy-ry*P.dx)*sc,wy=P.y+(rx*P.dx-ry*P.dy)*sc,i=Math.floor(wy)*W+Math.floor(wx);
    put(cx+rx,cy+ry,wx<0||wy<0||wx>=W||wy>=L.H||L.map[i]?[0,0,120]:L.fmap[i]===F_WALK?[30,30,30]:C_K);}
  const dot=(x,y,c,s)=>{const dx=x-P.x,dy=y-P.y,rx=(dx*-P.dy+dy*P.dx)/sc,ry=-(dx*P.dx+dy*P.dy)/sc;if(rx*rx+ry*ry>(R-1)*(R-1))return;rect(Math.round(cx+rx-s/2),Math.round(cy+ry-s/2),s,s,c);};
  for(const sp of L.pick)if(sp.item&&PICKS[sp.kind].big)dot(sp.x,sp.y,C_C,2);
  for(const e of L.enemies)if(e.st!=='dead'&&e.st!=='dying'&&e.st!=='idle')dot(e.x,e.y,C_Y,1);
  for(const c of L.vcars)if(!c.dead&&!c.parked)dot(c.x,c.y,c.boss?(((tm*6)|0)&1?C_Y:C_R):C_R,c.boss?4:3);
  put(cx,cy-2,C_W);rect(cx-1,cy-1,3,1,C_W);rect(cx-2,cy,5,1,C_W);}

function overlayKR(){
  // lock brackets and the driver's name
  if(P.lock&&lockBox){const c=((tm*8)|0)&1?C_R:C_W,pad=3,bt=Math.max(0,lockBox.t-pad),bb=Math.min(VH-1,lockBox.b+pad),bl=Math.max(0,lockBox.l-pad),br=Math.min(SW-1,lockBox.r+pad);
    bracket(bl,bt,br,bb,c);const nm=P.lock.name||(P.lock.dog?'DOG':'DEPUTY');text(nm,clamp(Math.round((bl+br)/2-textW(nm)/2),1,SW-textW(nm)-1),Math.max(1,bt-10),C_R,1,C_K);}
  // where the guns are pointing
  const a=angDiff(P.a,aimAngle()),ax=Math.round(CX+Math.tan(a)/P.fov*CX),ay=HZ-4;for(let k=3;k<=6;k++){put(ax-k,ay,C_W);put(ax+k,ay,C_W);put(ax,ay-k,C_W);put(ax,ay+k,C_W);}
  if(P.hurt>0&&P.hurt>.2)rect(0,24,4,VH-48,C_R),rect(SW-4,24,4,VH-48,C_R);
  // wave line and power-up clocks
  const alive=L.vcars.filter(c=>!c.dead&&!c.parked).length+WAVE.queue.length;let ty=3;
  const boss=L.vcars.find(c=>c.boss&&!c.dead);
  if(boss){rect(0,0,SW-60,12,C_K);text(boss.name,4,3,C_R);const bw=SW-60-80;rect(70,3,bw,6,C_DR);rect(70,3,Math.round(bw*Math.max(0,boss.hp)/boss.hp0),6,C_R);ty=15;}
  else if(WAVE.n){text(WAVE.clear?'WAVE '+WAVE.n+' CLEAR':'WAVE '+WAVE.n+'  CARS '+alive,4,ty,WAVE.clear?C_G:C_Y,1,C_K);ty+=11;}
  if(P.berserk>0){text('RAMPAGE '+Math.ceil(P.berserk),4,ty+2,((tm*6)|0)&1?C_R:C_Y,1,C_K);ty+=11;}
  if(P.slow>0){text('SLO-MO '+Math.ceil(P.slow),4,ty+2,C_C,1,C_K);ty+=11;}
  if(P.flame>0){text('FLAMER '+Math.ceil(P.flame),4,ty+2,((tm*6)|0)&1?C_Y:C_R,1,C_K);ty+=11;}
  radar();
  if(P.chain>=2&&P.chainT>0){const s='X'+P.chain;text(s,SW-textW(s,2)-6,60,((tm*6)|0)&1?C_Y:C_R,2,C_K);text('CHAIN',SW-textW('CHAIN')-6,78,C_Y,1,C_K);}
  if(big.time>0)textC(big.t,52,big.c,textW(big.t,2)>SW-8?1:2,C_K);
  const fy=VH-46;for(let i=0;i<msgs.length;i++)textC(msgs[i].t,fy-i*10,msgs[i].c,1,C_K);
  if(combo.time>0){const sc=Math.min(2,fitScale(combo.t,SW-6)),c=((tm*10)|0)&1?(combo.n>=10?C_R:C_Y):C_W;textC(combo.t,74,c,sc,C_K);}}
