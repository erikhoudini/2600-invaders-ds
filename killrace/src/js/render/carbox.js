/* =====================================================================
   KILL RACE 12a. CARS AS BOXES
   Bagman only has flat car pictures: a front view, a side view drawn at toy
   proportions, and nothing from behind. Drawn as billboards they snap between
   views and the sides look wrong. So every vehicle is a real box in the
   world: four vertical faces projected in perspective column by column, the
   way Bagman casts its walls, depth-tested against them and textured from
   Bagman art:
     front  the front sprite, cropped to the car
     rear   the same with the headlights recoloured to tail lights
     sides  the side sprite fitted to the car's length and height, which
            turns the tall hatchback into a low sedan profile
   A face is a stack of bands, each with its own texture, so bigger vehicles
   can be put together from wall textures: the motorhome is a sedan nose
   under the RV wall, the meat truck is a pickup nose and wheels under the
   white reefer trailer from Bagman's Cold Storage chapter.
   Cars turn smoothly through every angle and keep their size.
   ===================================================================== */
const TX=(src,x,y,w,h)=>({src,x,y,w,h});
let CARS_REAR=null,BODY={};
function makeCarBodies(){
  const d=new Uint8ClampedArray(CARS.d);for(let i=0;i<d.length;i+=4)if(d[i]===255&&d[i+1]===250&&d[i+2]===200){d[i]=230;d[i+1]=0;d[i+2]=0;}
  CARS_REAR={w:CARS.w,h:CARS.h,d};
  // the yellow sedan's side is the white one, recoloured
  const y=new Uint8ClampedArray(CARSIDE.d);for(let i=0;i<y.length;i+=4){const px=(i>>2)%CARSIDE.w;if(px<256||y[i+3]<100)continue;const r=y[i],g=y[i+1],b=y[i+2],mx=Math.max(r,g,b),mn=Math.min(r,g,b);
    if(mx>140&&(mx-mn)<30){const l=mx/255;y[i]=255*l;y[i+1]=215*l;y[i+2]=40*l;}}
  const CY={w:CARSIDE.w,h:CARSIDE.h,d:y};
  const fb=[[4,18,89,46],[4,18,89,46],[4,18,89,46],[4,14,89,50],[4,13,89,51]];
  const F=i=>TX(CARS,i*96+fb[i][0],fb[i][1],fb[i][2],fb[i][3]),R=i=>TX(CARS_REAR,i*96+fb[i][0],fb[i][1],fb[i][2],fb[i][3]);
  const S=[TX(CARSIDE,0,18,128,106),TX(CARSIDE,128,19,128,97),TX(CARSIDE,256,20,128,96),TX(CY,256,20,128,96)];
  const Wt=(n,y0=0,h=128)=>TX(WALLS,tex(n)*TS,y0,TS,h);
  const car=(fi,si,L,Wd,H)=>({L,W:Wd,H,front:[[F(fi),0,H]],rear:[[R(fi),0,H]],side:[[S[si],0,H]]});
  BODY.sedanR=car(0,0,1.7,.92,.5);BODY.sedanW=car(1,2,1.7,.92,.5);BODY.sedanY=car(2,3,1.7,.92,.5);
  BODY.pickup=car(3,1,1.85,.95,.56);BODY.cruiser=car(4,2,1.75,.92,.56);
  BODY.rv={L:2.7,W:1.05,H:1.15,front:[[F(1),0,.5],[Wt('RV',8,52),.5,1.15]],rear:[[R(1),0,.5],[Wt('RV',8,52),.5,1.15]],side:[[Wt('RV'),0,1.15,2]]};
  BODY.reefer={L:2.9,W:1.05,H:1.25,front:[[F(3),0,.56],[Wt('REEFER'),.56,1.25]],rear:[[R(3),0,.56],[Wt('LOCKEDR',70,58),.56,1.25]],
    side:[[TX(CARSIDE,128,82,128,34),0,.3],[Wt('REEFER'),.3,1.25,2]]};}

let BOXMIN=0,BOXMAX=0,BOXT=0,BOXB=0;
// one vertical face from ground point A to B, u running 0 at A to 1 at B
function drawFace(bands,ax,ay,bx,by,lift,shade){
  let[txA,tyA]=project(ax,ay),[txB,tyB]=project(bx,by),uA=0,uB=1;const N=.1;
  if(tyA<N&&tyB<N)return;
  if(tyA<N){const t=(N-tyA)/(tyB-tyA);txA+=(txB-txA)*t;tyA=N;uA=t;}
  if(tyB<N){const t=(N-tyB)/(tyA-tyB);txB+=(txA-txB)*t;tyB=N;uB=1-t;}
  const sA=CX*(1+txA/tyA),sB=CX*(1+txB/tyB);if(Math.abs(sB-sA)<.5)return;
  const x0=Math.max(0,Math.ceil(Math.min(sA,sB))),x1=Math.min(SW,Math.ceil(Math.max(sA,sB)));
  const iA=1/tyA,iB=1/tyB,qa=uA*iA,qb=uB*iB,camZ=L.camZ;
  for(let x=x0;x<x1;x++){const s=(x-sA)/(sB-sA),iz=iA+(iB-iA)*s,z=1/iz;if(z>=zbuf[x])continue;const u=(qa+(qb-qa)*s)/iz;
    const wh=VH/z,k=fog(z)*shade,ground=HZ+wh*(camZ-lift);
    for(const[t,z0,z1,rep=1]of bands){const top=ground-wh*z1,bot=ground-wh*z0,y0=Math.max(0,Math.ceil(top)),y1=Math.min(VH,Math.ceil(bot));if(y1<=y0)continue;
      const tu=t.x+Math.min(t.w-1,((u*rep)%1*t.w)|0),sd=t.src.d,sw=t.src.w,dv=t.h/(bot-top);let v=(y0-top)*dv;
      for(let yy=y0;yy<y1;yy++,v+=dv){const si=((t.y+Math.min(t.h-1,v|0))*sw+tu)*4;if(sd[si+3]<110)continue;const di=(yy*SW+x)*4;
        D[di]=Math.min(255,sd[si]*k);D[di+1]=Math.min(255,sd[si+1]*k);D[di+2]=Math.min(255,sd[si+2]*k);MASK[yy*SW+x]=1;
        if(x<BOXMIN)BOXMIN=x;if(x>BOXMAX)BOXMAX=x;if(yy<BOXT)BOXT=yy;if(yy>BOXB)BOXB=yy;}}}}

function drawCarBox(c,B,outline){const sc=c.sc||1,hl=B.L*sc/2,hw=B.W*sc/2,ca=Math.cos(c.a),sa=Math.sin(c.a),rx=-sa,ry=ca,H=B.H*sc;
  const scaleBands=bands=>sc===1?bands:bands.map(([t,a,b,r])=>[t,a*sc,b*sc,r]);
  const fx=c.x+ca*hl,fy=c.y+sa*hl,bx=c.x-ca*hl,by=c.y-sa*hl;
  const faces=[
    {n:[ca,sa],cx:fx,cy:fy,A:[fx-rx*hw,fy-ry*hw],B:[fx+rx*hw,fy+ry*hw],bands:B.front,sh:1},
    {n:[-ca,-sa],cx:bx,cy:by,A:[bx+rx*hw,by+ry*hw],B:[bx-rx*hw,by-ry*hw],bands:B.rear,sh:.9},
    {n:[rx,ry],cx:c.x+rx*hw,cy:c.y+ry*hw,A:[fx+rx*hw,fy+ry*hw],B:[bx+rx*hw,by+ry*hw],bands:B.side,sh:.82},
    {n:[-rx,-ry],cx:c.x-rx*hw,cy:c.y-ry*hw,A:[fx-rx*hw,fy-ry*hw],B:[bx-rx*hw,by-ry*hw],bands:B.side,sh:.82}];
  const vis=faces.filter(f=>f.n[0]*(P.x-f.cx)+f.n[1]*(P.y-f.cy)>0).sort((a,b)=>((b.cx-P.x)**2+(b.cy-P.y)**2)-((a.cx-P.x)**2+(a.cy-P.y)**2));
  BOXMIN=SW;BOXMAX=-1;BOXT=VH;BOXB=-1;
  for(const f of vis)drawFace(scaleBands(f.bands),f.A[0],f.A[1],f.B[0],f.B[1],0,f.sh);
  if(BOXMAX<0)return null;
  const box={l:BOXMIN,r:BOXMAX,t:BOXT,b:BOXB};
  // outline like Bagman's sprites, then clear the mask we used
  const x0=Math.max(0,BOXMIN-1),x1=Math.min(SW-1,BOXMAX+1),y0=Math.max(0,BOXT-1),y1=Math.min(VH-1,BOXB+1);
  if(outline)for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const m=y*SW+x;if(MASK[m])continue;
    if((x>0&&MASK[m-1])||(x<SW-1&&MASK[m+1])||(y>0&&MASK[m-SW])||(y<VH-1&&MASK[m+SW])){const di=m*4;D[di]=outline[0];D[di+1]=outline[1];D[di+2]=outline[2];}}
  for(let y=y0;y<=y1;y++)MASK.fill(0,y*SW+x0,y*SW+x1+1);
  return box;}
