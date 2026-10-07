/* =====================================================================
   17. RENDER: world, sprites, weapon, overlays, HUD
   ===================================================================== */
let light=1;
const fog=d=>Math.min(1.3,Math.max(.42,1.42-d*.06))*light;
function renderBack(){const fm=L.fmap,fls=L.floorsD;const fl=L.floor.d,st=L.stain,SWs=L.W*16,Hs=L.H*16;const vd=L.void,LW=L.W,f2=L.floor2?L.floor2.d:null,scr=(L.scroll||0)*10;
  const high=!!L.sniper,camZ=L.camZ;
  if(L.outdoor){const sky=L.sky;for(let x=0;x<SW;x++){const ang=P.a+Math.atan((2*x/SW-1)*P.fov);const sx=Math.floor(((ang/TAU)%1+1)%1*SKYW);
      for(let y=0;y<HZ;y++){const si=((y+SKYH-HZ)*SKYW+sx)*3,di=(y*SW+x)*4;D[di]=sky[si];D[di+1]=sky[si+1];D[di+2]=sky[si+2];if(high)ZB[y*SW+x]=1e9;}}}
  else D.set(bg,0);
  const r0x=P.dx-P.px,r0y=P.dy-P.py,r1x=P.dx+P.px,r1y=P.dy+P.py;
  for(let y=HZ;y<VH;y++){const rd=(VH*camZ)/(y-HZ+.5);if(high)ZB.fill(rd,y*SW,y*SW+SW);const stx=rd*(r1x-r0x)/SW,sty=rd*(r1y-r0y)/SW;let fx=P.x+rd*r0x,fy=P.y+rd*r0y;
    const k=fog(rd)*.8;let di=y*SW*4;
    for(let x=0;x<SW;x++,di+=4,fx+=stx,fy+=sty){const ti=((((fy*64)&63)<<6)|((fx*64)&63))<<2;const FL=fm&&fx>=0&&fy>=0&&fx<LW?(fls[fm[(fy|0)*LW+(fx|0)]]||fl):fl;let r=FL[ti],g=FL[ti+1],b=FL[ti+2];
      if(vd){const ci=(fy|0)*LW+(fx|0);if(ci>=0&&vd[ci]){const ty=fy*10+scr,tj=((((ty|0)&63)<<6)|(((fx*10)|0)&63))<<2,tk=(((((ty+3)|0)&63)<<6)|(((fx*10)|0)&63))<<2;r=(f2[tj]+f2[tk])*.3;g=(f2[tj+1]+f2[tk+1])*.3;b=(f2[tj+2]+f2[tk+2])*.3;D[di]=r*k;D[di+1]=g*k;D[di+2]=b*k;continue;}}
      const sx=(fx*16)|0,sy=(fy*16)|0;if(sx>=0&&sy>=0&&sx<SWs&&sy<Hs){const s=st[sy*SWs+sx];if(s===1){r=110;g=0;b=0;}else if(s===2){r=190;g=0;b=0;}else if(s===3){r=22;g=18;b=14;}}
      D[di]=r*k;D[di+1]=g*k;D[di+2]=b*k;}}}
// Raised camera: walls are one unit tall and the camera sits above them, so rays keep going after the
// first hit. Each solid cell contributes a front face and a roof; segments are painted far to near
// and write a per-pixel depth buffer that sprites test against.
const SEG=[];
function renderWallsHigh(){const wd=WALLS.d,ww=WALLS.w,camZ=L.camZ,W=L.W,map=L.map;
  for(let x=0;x<SW;x++){const cam=2*x/SW-1,rdx=P.dx+P.px*cam,rdy=P.dy+P.py*cam;
    let mx=Math.floor(P.x),my=Math.floor(P.y);const ddx=Math.abs(1/rdx),ddy=Math.abs(1/rdy);let sx,sy,sdx,sdy;
    if(rdx<0){sx=-1;sdx=(P.x-mx)*ddx}else{sx=1;sdx=(mx+1-P.x)*ddx}
    if(rdy<0){sy=-1;sdy=(P.y-my)*ddy}else{sy=1;sdy=(my+1-P.y)*ddy}
    SEG.length=0;let prev=!!map[my*W+mx],side=0;
    for(let n=0;n<160;n++){if(sdx<sdy){sdx+=ddx;mx+=sx;side=0}else{sdy+=ddy;my+=sy;side=1}
      if(mx<0||my<0||mx>=W||my>=L.H)break;const id=my*W+mx,m=map[id];const tIn=side===0?sdx-ddx:sdy-ddy;if(tIn>70)break;
      if(m){const tOut=Math.min(sdx,sdy);if(!prev){let wx=side===0?P.y+tIn*rdy:P.x+tIn*rdx;wx-=Math.floor(wx);if((side===0&&rdx>0)||(side===1&&rdy<0))wx=1-wx;SEG.push(0,tIn,wx,m-1,side);L.seen[id]=1;}
        SEG.push(1,tIn,tOut,0,0);prev=true;}else prev=false;}
    zbuf[x]=60;
    for(let k=SEG.length-5;k>=0;k-=5){const kind=SEG[k],t=SEG[k+1];
      if(kind===0){const top=HZ-(1-camZ)*VH/t,bot=HZ+camZ*VH/t,y0=Math.max(0,Math.ceil(top)),y1=Math.min(VH,Math.ceil(bot));if(y1<=y0)continue;
        const tu=Math.min(127,Math.floor(SEG[k+2]*TS)),step=TS/(bot-top),base=SEG[k+3]*TS+tu,kk=fog(t)*(SEG[k+4]?.78:1);let tp=(y0-top)*step;
        for(let y=y0;y<y1;y++){const tv=Math.min(127,tp|0);tp+=step;const si=(tv*ww+base)*4,di=(y*SW+x)*4;D[di]=wd[si]*kk;D[di+1]=wd[si+1]*kk;D[di+2]=wd[si+2]*kk;ZB[y*SW+x]=t;}}
      else{const t1=SEG[k+2],ya=Math.max(0,Math.ceil(HZ+(camZ-1)*VH/t1)),yb=Math.min(VH,Math.ceil(HZ+(camZ-1)*VH/t));
        for(let y=ya;y<yb;y++){const d=(camZ-1)*VH/(y-HZ+.5);const wx=P.x+rdx*d,wy=P.y+rdy*d;const h=hash2((wx*6)|0,(wy*6)|0);const kk=fog(d);
          const edge=(wx-Math.floor(wx)<.06||wy-Math.floor(wy)<.06)?40:0;const di=(y*SW+x)*4;D[di]=(70+h*30+edge)*kk;D[di+1]=(62+h*24+edge)*kk;D[di+2]=(55+h*20+edge)*kk;ZB[y*SW+x]=d;}}}}}
function renderWalls(){if(L.sniper){renderWallsHigh();return;}const wd=WALLS.d,ww=WALLS.w;
  for(let x=0;x<SW;x++){const cam=2*x/SW-1,rdx=P.dx+P.px*cam,rdy=P.dy+P.py*cam;
    const h=cast(P.x,P.y,rdx,rdy,60);if(!h){zbuf[x]=60;continue;}
    L.seen[h.id]=1;const perp=h.t;zbuf[x]=perp;const lh=VH/perp,ds=HALF-lh/2;const y0=Math.max(0,Math.ceil(ds)),y1=Math.min(VH,Math.ceil(ds+lh));
    const tu=Math.min(127,Math.floor(h.u*TS)),step=TS/lh;let tp=(y0-ds)*step;const k=fog(perp)*(h.side?.78:1),base=h.tex*TS+tu;
    const ws=h.face>=0?L.wstain.get(h.id*4+h.face):null;const su=tu>>2;
    const gi=h.face>=0&&L.graf?L.graf.get(h.id*4+h.face):undefined,gd=GRAF&&GRAF.d,gb=gi!==undefined?gi*128+tu:-1;
    for(let y=y0;y<y1;y++){const tv=Math.min(127,tp|0);tp+=step;const si=(tv*ww+base)*4,di=(y*SW+x)*4;
      if(ws){const s=ws[((tv>>2)<<5)|su];if(s){if(s===3||s===4){const v=s===3?8:20;D[di]=v;D[di+1]=v*.8;D[di+2]=v*.6;}else{const v=s===2?200:120;D[di]=v*k;D[di+1]=0;D[di+2]=0;}continue;}}
      if(gb>=0&&tv>=40&&tv<104){const gs=((tv-40)*GRAF.w+gb)*4;if(gd[gs+3]>100){D[di]=gd[gs]*k;D[di+1]=gd[gs+1]*k;D[di+2]=gd[gs+2]*k;continue;}}
      D[di]=wd[si]*k;D[di+1]=wd[si+1]*k;D[di+2]=wd[si+2]*k;}}}
