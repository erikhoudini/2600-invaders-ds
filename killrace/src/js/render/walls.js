/* =====================================================================
   KILL RACE 11. CITY WALLS
   Bagman's renderWalls, made tall. Bagman walls are one unit high with the
   eye at half height; here every wall is WH units high and the eye sits at
   L.camZ. The bottom unit uses the cell's own texture with Bagman's blood,
   bullet holes and graffiti; the floors above use L.up (windows, brick),
   a little darker so the street level reads as lit.
   ===================================================================== */
// Bagman's sky strip is 80 rows and the horizon sits at 100, so the top rows come out empty: repeat the top of the sky
function skyFill(){const n=Math.max(0,HZ-SKYH);if(!n)return;const src=n*SW*4;for(let y=0;y<n;y++)D.copyWithin(y*SW*4,src,src+SW*4);}
function krWalls(){const wd=WALLS.d,ww=WALLS.w,camZ=L.camZ,up=L.up,gd=GRAF&&GRAF.d,G0=(WH-1)*TS;
  for(let x=0;x<SW;x++){const cam=2*x/SW-1,rdx=P.dx+P.px*cam,rdy=P.dy+P.py*cam;
    const h=cast(P.x,P.y,rdx,rdy,90);if(!h){zbuf[x]=90;continue;}
    L.seen[h.id]=1;const perp=h.t;zbuf[x]=perp;
    const s=VH/perp,top=HZ-(WH-camZ)*s,bot=HZ+camZ*s,y0=Math.max(0,Math.ceil(top)),y1=Math.min(VH,Math.ceil(bot));if(y1<=y0)continue;
    const tu=Math.min(127,Math.floor(h.u*TS)),k=fog(perp)*(h.side?.78:1),ku=k*.72;
    const g=h.tex,u=up[h.id]?up[h.id]-1:g,baseG=g*TS+tu,baseU=u*TS+tu;
    const ws=h.face>=0?L.wstain.get(h.id*4+h.face):null,su=tu>>2;
    const gi=h.face>=0&&L.graf?L.graf.get(h.id*4+h.face):undefined,gb=gi!==undefined?gi*128+tu:-1;
    const step=WH*TS/(bot-top);let tp=(y0-top)*step;
    for(let y=y0;y<y1;y++){const T=tp|0;tp+=step;const di=(y*SW+x)*4;
      if(T<G0){const tv=T%TS,si=(tv*ww+baseU)*4;D[di]=wd[si]*ku;D[di+1]=wd[si+1]*ku;D[di+2]=wd[si+2]*ku;continue;}
      const tv=Math.min(127,T-G0);
      if(ws){const st=ws[((tv>>2)<<5)|su];if(st){if(st===3||st===4){const v=st===3?8:20;D[di]=v;D[di+1]=v*.8;D[di+2]=v*.6;}else{const v=st===2?200:120;D[di]=v*k;D[di+1]=0;D[di+2]=0;}continue;}}
      if(gb>=0&&tv>=40&&tv<104){const gs=((tv-40)*GRAF.w+gb)*4;if(gd[gs+3]>100){D[di]=gd[gs]*k;D[di+1]=gd[gs+1]*k;D[di+2]=gd[gs+2]*k;continue;}}
      const si=(tv*ww+baseG)*4;D[di]=wd[si]*k;D[di+1]=wd[si+1]*k;D[di+2]=wd[si+2]*k;}}}
