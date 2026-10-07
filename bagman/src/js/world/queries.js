/* =====================================================================
   10. WORLD QUERIES: raycast, collision, flow field
   ===================================================================== */
function solidCell(x,y,forPlayer){if(x<0||y<0||x>=L.W||y>=L.H)return true;const i=y*L.W+x;if(L.map[i])return true;const di=L.dg[i];if(di>=0)return L.doors[di].open<(forPlayer?.9:.7);return false;}
const HIT={t:0,id:-1,face:0,u:0,tex:0,door:0,side:0};
function cast(ox,oy,rdx,rdy,max){const W=L.W,map=L.map,dg=L.dg,doors=L.doors;
  let mx=Math.floor(ox),my=Math.floor(oy);const ddx=Math.abs(1/rdx),ddy=Math.abs(1/rdy);let sx,sy,sdx,sdy;
  if(rdx<0){sx=-1;sdx=(ox-mx)*ddx}else{sx=1;sdx=(mx+1-ox)*ddx}
  if(rdy<0){sy=-1;sdy=(oy-my)*ddy}else{sy=1;sdy=(my+1-oy)*ddy}
  let side=0;
  for(let n=0;n<220;n++){
    if(sdx<sdy){sdx+=ddx;mx+=sx;side=0}else{sdy+=ddy;my+=sy;side=1}
    if(mx<0||my<0||mx>=W||my>=L.H)break;
    const id=my*W+mx;const di=dg[id];
    if(di>=0){const dr=doors[di];
      if(dr.vert){const tt=(mx+.5-ox)/rdx;const yy=oy+tt*rdy;if(tt>0&&Math.floor(yy)===my){const uu=yy-my;if(uu>=dr.open){if(tt>max)return null;Object.assign(HIT,{t:tt,id,face:-1,u:uu-dr.open,tex:dr.tex,door:1,side:0});return HIT;}}}
      else{const tt=(my+.5-oy)/rdy;const xx=ox+tt*rdx;if(tt>0&&Math.floor(xx)===mx){const uu=xx-mx;if(uu>=dr.open){if(tt>max)return null;Object.assign(HIT,{t:tt,id,face:-1,u:uu-dr.open,tex:dr.tex,door:1,side:1});return HIT;}}}
      continue;}
    const m=map[id];if(m){const t=side===0?sdx-ddx:sdy-ddy;if(t>max)return null;let wx=side===0?oy+t*rdy:ox+t*rdx;wx-=Math.floor(wx);let u=wx;
      if((side===0&&rdx<0)||(side===1&&rdy>0))u=1-u;
      HIT.t=t;HIT.id=id;HIT.face=side===0?(rdx>0?0:1):(rdy>0?2:3);HIT.u=u;HIT.tex=m-1;HIT.door=0;HIT.side=side;return HIT;}
  }
  return null;}
function blockedAt(x,y,r){for(const[ox,oy]of[[-r,-r],[r,-r],[-r,r],[r,r]]){const cx=Math.floor(x+ox),cy=Math.floor(y+oy);if(solidCell(cx,cy,true))return true;if(L.block[cy*L.W+cx]){const dx=x-(cx+.5),dy=y-(cy+.5);if(Math.abs(dx)<.5+r*.6&&Math.abs(dy)<.5+r*.6)return true;}}return false;}
function hasLOS(ax,ay,bx,by){const dx=bx-ax,dy=by-ay,d=Math.hypot(dx,dy);if(d<.01)return true;return !cast(ax,ay,dx/d,dy/d,d-.05);}
function computeFlank(){const W=L.W,cell=Math.floor(P.y)*W+Math.floor(P.x);
  if(cell===L.flankCell&&Math.abs(angDiff(P.a,L.flankA||0))<.35)return;L.flankCell=cell;L.flankA=P.a;
  const f=L.flank||(L.flank=new Int16Array(W*L.H));f.fill(-1);const q=[cell];f[cell]=0;
  for(let h=0;h<q.length;h++){const c=q[h];if(f[c]>50)continue;for(const o of[1,-1,W,-W]){const nb=c+o;if(nb<0||nb>=f.length||f[nb]>=0||L.map[nb]||L.block[nb]||(L.void&&L.void[nb]))continue;
    const dx=(nb%W)+.5-P.x,dy=((nb/W)|0)+.5-P.y,d=Math.hypot(dx,dy);if(d>1.6&&d<10&&(dx*P.dx+dy*P.dy)/d>.55)continue;f[nb]=f[c]+1;q.push(nb);}}}
function computeFlow(){const cell=Math.floor(P.y)*L.W+Math.floor(P.x);if(cell===L.flowCell)return;L.flowCell=cell;const f=L.flow;f.fill(-1);const q=[cell];f[cell]=0;const W=L.W;
  for(let h=0;h<q.length;h++){const c=q[h];if(f[c]>44)continue;for(const o of[1,-1,W,-W]){const nb=c+o;if(nb<0||nb>=f.length||f[nb]>=0||L.map[nb]||L.block[nb]||(L.void&&L.void[nb]))continue;f[nb]=f[c]+1;q.push(nb);}}}

