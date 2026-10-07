function project(wx,wy){const dx=wx-P.x,dy=wy-P.y;const iv=1/(P.px*P.dy-P.dx*P.py);return[iv*(P.dy*dx-P.dx*dy),iv*(-P.py*dx+P.px*dy)];}
let lockBox=null;
// opts: mark (lock box), flip, outline colour, lift (fraction of wall height the sprite floats above the floor)
const MASK=new Uint8Array(SW*VH);
function drawSprite(src,fx,fy,fw,fh,wx,wy,scale,mark,flip,outline,lift){
  const[tx,ty]=project(wx,wy);if(ty<.12)return;
  const sx=(SW/2)*(1+tx/ty),wallH=VH/ty,h=wallH*scale,w=h*fw/fh,bottom=HZ+wallH*L.camZ-(lift||0)*wallH,top=bottom-h,left=sx-w/2;const high=!!L.sniper;
  if(mark)lockBox={l:left+w*.28,r:left+w*.72,t:top+h*.1,b:bottom,ty};
  const x0=Math.max(0,Math.ceil(left)),x1=Math.min(SW,Math.ceil(left+w));if(x0>=x1)return;
  const y0=Math.max(0,Math.ceil(top)),y1=Math.min(VH,Math.ceil(bottom));if(y0>=y1)return;const k=fog(ty);const sd=src.d,sw=src.w;
  const vis=(x,y)=>high?ty<ZB[y*SW+x]:ty<zbuf[x];
  if(outline)for(let y=y0;y<y1;y++)MASK.fill(0,y*SW+x0,y*SW+x1);
  for(let x=x0;x<x1;x++){if(!high&&ty>=zbuf[x])continue;let ux=Math.min(fw-1,Math.floor((x-left)/w*fw));if(flip)ux=fw-1-ux;const u=fx+ux;
    for(let y=y0;y<y1;y++){if(high&&ty>=ZB[y*SW+x])continue;const v=fy+Math.min(fh-1,Math.floor((y-top)/h*fh));const si=(v*sw+u)*4;if(sd[si+3]<110)continue;const di=(y*SW+x)*4;
      D[di]=sd[si]*k;D[di+1]=sd[si+1]*k;D[di+2]=sd[si+2]*k;if(outline)MASK[y*SW+x]=1;}}
  if(!outline)return;
  const ox0=Math.max(0,x0-1),ox1=Math.min(SW,x1+1),oy0=Math.max(0,y0-1),oy1=Math.min(VH,y1+1);
  for(let y=oy0;y<oy1;y++)for(let x=ox0;x<ox1;x++){const m=y*SW+x;if(x>=x0&&x<x1&&y>=y0&&y<y1&&MASK[m])continue;
    const hit=(x>x0&&x-1<x1&&y>=y0&&y<y1&&MASK[m-1])||(x+1<x1&&x+1>=x0&&y>=y0&&y<y1&&MASK[m+1])||(y>y0&&y-1<y1&&x>=x0&&x<x1&&MASK[m-SW])||(y+1<y1&&y+1>=y0&&x>=x0&&x<x1&&MASK[m+SW]);
    if(hit&&vis(x,y)){const di=m*4;D[di]=outline[0];D[di+1]=outline[1];D[di+2]=outline[2];}}}
function viewAngleIndex(e){const s=Math.sin(P.a),c=Math.cos(P.a);const fx=Math.cos(e.a),fy=Math.sin(e.a);let tx=P.x-e.x,ty=P.y-e.y;const tl=Math.hypot(tx,ty)||1;tx/=tl;ty/=tl;
  const side=fx*(-s)+fy*c,tow=fx*tx+fy*ty;return{k:((Math.round(Math.atan2(-side,tow)/(Math.PI/4))%8)+8)%8,tow,side};}
function enemyFrame(e){let row=0,col=0;
  if(e.st==='dead'){row=5;col=5;}
  else if(e.st==='dying'){row=5;col=2+Math.min(2,e.fr);}
  else if(e.st==='pain'){row=5;col=1;}
  else if(e.st==='attack'){row=6;col=e.fr===0?(e.t<e.T.wind*.5?0:1):2;}
  else{col=viewAngleIndex(e).k;row=!e.moving?0:1+(Math.floor(e.wt*7)%4);}
  return[col*64,row*64];}
function drawDog(e){const v=viewAngleIndex(e);
  if(e.st==='dead'||e.st==='dying'){drawSprite(DOG,(e.st==='dead'?1:0)*64,128,64,64,e.x,e.y,.6,false,v.side>0);return;}
  const OC=C_K;
  const mark=e===P.lock;
  if(v.tow>.55||e.st==='attack'){const f=e.st==='attack'?2:(e.moving?(Math.floor(e.wt*10)&1):0);drawSprite(DOG,f*64,0,64,64,e.x,e.y,.62,mark,false,OC);}
  else{const f=e.moving?Math.floor(e.wt*12)%5:0;drawSprite(DOG,f*64,64,64,64,e.x,e.y,.6,mark,v.side<0,OC);}}
function renderSprites(){lockBox=null;const list=[];
  for(const t of L.things)list.push({d:(t.x-P.x)**2+(t.y-P.y)**2,t});
  for(const e of L.enemies)list.push({d:(e.x-P.x)**2+(e.y-P.y)**2,e});
  for(const s of L.shots)list.push({d:(s.x-P.x)**2+(s.y-P.y)**2,s});
  for(const s of L.pflames||[])list.push({d:(s.x-P.x)**2+(s.y-P.y)**2,s});
  for(const b of L.bombs||[])list.push({d:(b.x-P.x)**2+(b.y-P.y)**2,b});
  list.sort((a,b)=>b.d-a.d);
  for(const o of list){
    if(o.t){const t=o.t;if(t.t==='tree')drawSprite(TREES,t.ti*64,0,64,128,t.x,t.y,2.6);
      else if(t.t==='item'){const key=t.kind==='KEYY'||t.kind==='KEYR',pow=POWER[t.kind];const bob=.14+.06*Math.sin(tm*3.2+t.x*1.7);
        const oc=key?(((tm*6)|0)&1?C_W:C_K):pow?(((tm*5)|0)&1?C_W:C_C):C_K;drawSprite(DECO,t.d*64,0,64,64,t.x,t.y,key?.8:pow?1.2:1,false,false,oc,key?bob-.08:bob);}
      else drawSprite(DECO,t.d*64,0,64,64,t.x,t.y,t.d===DCAN?1.5:1,t===P.lock,false,t.boom?C_K:null);}
    else if(o.s)drawShot(o.s);
    else if(o.b)drawSprite(DECO,dec('DYN')*64,0,64,64,o.b.x,o.b.y,.55,false,false,C_K,o.b.z);
    else{const e=o.e;if(e.gib){drawSprite(DECO,e.corpse*64,0,64,64,e.x,e.y,1);continue;}
      if(e.dog){drawDog(e);continue;}
      const[fx,fy]=enemyFrame(e);drawSprite(SHEET[e.T.sh+(e.headless?'_h':'')],fx,fy,64,64,e.x,e.y,e.sc,e===P.lock,false,e.st==='dead'?null:(e.wanted?(((tm*6)|0)&1?C_R:C_Y):C_K));}}}
function drawShot(s){const[tx,ty]=project(s.x,s.y);if(ty<.15)return;const sx=Math.floor((SW/2)*(1+tx/ty)),wh=VH/ty,sy=Math.floor(HZ+wh*(L.camZ-s.z));
  if(s.big===2){const age=1-s.life/1.3,r=Math.max(1,Math.round(wh*(.05+.16*age)));
    for(let y=sy-r;y<=sy+r;y++)for(let x=sx-r;x<=sx+r;x++){if(x<0||y<0||x>=SW||y>=VH||ty>=zbuf[x])continue;const d=((x-sx)**2+(y-sy)**2)/(r*r+1);if(d>1||rnd()<d*.7)continue;const i=(y*SW+x)*4;
      if(d<.25&&age<.6){D[i]=255;D[i+1]=255;D[i+2]=160;}else if(d<.6){D[i]=255;D[i+1]=age>.7?90:200;D[i+2]=0;}else{D[i]=230;D[i+1]=40;D[i+2]=0;}}return;}
  const r=Math.max(1,Math.round(wh*(s.big?.05:.032)));
  for(let y=sy-r;y<=sy+r;y++)for(let x=sx-r;x<=sx+r;x++){if(x<0||y<0||x>=SW||y>=VH||ty>=zbuf[x])continue;const d=(x-sx)**2+(y-sy)**2;if(d>r*r+1)continue;const i=(y*SW+x)*4;
    if(d<=r*r*.3){D[i]=255;D[i+1]=255;D[i+2]=230;}else{D[i]=255;D[i+1]=s.big?60:230;D[i+2]=0;}}}
function renderParts(){const high=!!L.sniper;for(const p of parts){const[tx,ty]=project(p.x,p.y);if(ty<.15)continue;const sx=Math.floor((SW/2)*(1+tx/ty));if(sx<0||sx>=SW||(!high&&ty>=zbuf[sx]))continue;
  const wh=VH/ty,sy=Math.floor(HZ+wh*(L.camZ-p.z)),sz=Math.max(1,Math.round(wh*p.s));const k=p.kind===2?1.2:fog(ty);
  for(let y=sy-(sz>>1);y<sy+sz-(sz>>1);y++){if(y<0||y>=VH)continue;for(let x=sx-(sz>>1);x<sx+sz-(sz>>1);x++){if(x<0||x>=SW||ty>=zbuf[x])continue;const di=(y*SW+x)*4;
    if(high&&ty>=ZB[y*SW+x])continue;D[di]=Math.min(255,p.c[0]*k);D[di+1]=Math.min(255,p.c[1]*k);D[di+2]=Math.min(255,p.c[2]*k);}}}}
