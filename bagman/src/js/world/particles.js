/* =====================================================================
   11. STAINS AND PARTICLES
   floor stain values: 1 dark blood, 2 bright blood, 3 scorch
   wall stain values:  1 dark blood, 2 bright blood, 3 bullet hole, 4 scorch
   ===================================================================== */
function stainFloor(x,y,r,val,R=rnd){const SWs=L.W*16;const cx=x*16,cy=y*16,rr=r*16;
  for(let yy=Math.floor(cy-rr);yy<=cy+rr;yy++)for(let xx=Math.floor(cx-rr);xx<=cx+rr;xx++){if(xx<0||yy<0||xx>=SWs||yy>=L.H*16)continue;
    const d=Math.hypot(xx-cx,yy-cy)/Math.max(.5,rr);if(d<=1&&(d<.6||R()<.55)){const i=yy*SWs+xx;if(val===3||L.stain[i]!==3)L.stain[i]=val;}}}
function wallStainBuf(L,key){let s=L.wstain.get(key);if(!s){s=new Uint8Array(1024);L.wstain.set(key,s);}return s;}
function stainWall(id,face,u,v,size,kind){if(face<0)return;const s=wallStainBuf(L,id*4+face);const cx=u*32,cy=v*32;
  if(kind===3){for(let yy=-1;yy<=0;yy++)for(let xx=-1;xx<=0;xx++){const X=Math.floor(cx+xx),Y=Math.floor(cy+yy);if(X>=0&&Y>=0&&X<32&&Y<32)s[Y*32+X]=3;}return;}
  const n=Math.floor(10+size*36);
  for(let k=0;k<n;k++){const a=rnd()*TAU,r=rnd()**1.6*size*15;const X=Math.floor(cx+Math.cos(a)*r),Y=Math.floor(cy+Math.sin(a)*r*.8);if(X>=0&&Y>=0&&X<32&&Y<32)s[Y*32+X]=kind===4?4:(rnd()<.4?2:1);}
  if(kind===4)return;
  const drips=Math.floor(1+size*5);for(let k=0;k<drips;k++){const X=Math.floor(cx+(rnd()-.5)*size*14);let Y=Math.floor(cy);const len=4+rnd()*18*size;for(let j=0;j<len&&Y<32;j++,Y++)if(X>=0&&X<32&&Y>=0)s[Y*32+X]=1;}}
function stainHand(L,id,face){const s=wallStainBuf(L,id*4+face);const cx=15,cy=17;
  for(let y=-3;y<=3;y++)for(let x=-3;x<=3;x++)if(x*x+y*y<=10)s[(cy+y)*32+cx+x]=1;
  for(let f=0;f<4;f++){const fx=cx-3+f*2;for(let y=cy-9+(f===0||f===3?2:0);y<cy-3;y++)s[y*32+fx]=1;}
  for(let y=cy-2;y<cy+1;y++)s[y*32+cx+5]=1;for(let y=cy+3;y<cy+12;y++)s[y*32+cx+(y%3?0:1)]=1;}
function splatBehind(x,y,ang,size){const h=cast(x,y,Math.cos(ang),Math.sin(ang),2.6);if(h&&!h.door)stainWall(h.id,h.face,h.u,.38+rnd()*.15,size,1);}
const parts=[];
// kind 0 dust, 1 blood, 2 fire, 3 shrapnel, 4 smoke
function addPart(x,y,z,vx,vy,vz,c,s,life,kind=0){if(parts.length>1600)parts.splice(0,120);parts.push({x,y,z,vx,vy,vz,c,s,life,kind});}
function blood(x,y,z,ang,n,power){for(let k=0;k<n;k++){const a=ang+(rnd()-.5)*1.6,sp=(.5+rnd()*2.2)*power;
  addPart(x,y,z+rnd()*.15,Math.cos(a)*sp,Math.sin(a)*sp,rnd()*2.6,rnd()<.5?[230,0,0]:[150,0,0],.012+rnd()*.02,3,1);}}
function gibs(x,y,ang,power=1){blood(x,y,.5,ang,70,1.9*power);for(let k=0;k<22;k++){const a=rnd()*TAU,sp=(.8+rnd()*3)*power;
  addPart(x,y,.3+rnd()*.5,Math.cos(a)*sp,Math.sin(a)*sp,1.5+rnd()*3.4,rnd()<.4?[235,150,120]:rnd()<.5?[130,0,0]:[230,230,210],.03+rnd()*.04,4,1);}
  stainFloor(x,y,.6,2);}
function puff(x,y){for(let k=0;k<5;k++)addPart(x,y,.45+rnd()*.2,(rnd()-.5)*.6,(rnd()-.5)*.6,rnd()*1.5,[215,215,215],.012,.4,0);}
function updParts(dt){for(let i=parts.length-1;i>=0;i--){const p=parts[i];p.life-=dt;if(p.life<=0){parts.splice(i,1);continue;}
  if(p.kind===2||p.kind===4){p.vz+=(p.kind===2?1.8:.8)*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;p.vx*=.96;p.vy*=.96;continue;}
  p.vz-=6*dt;const nx=p.x+p.vx*dt,ny=p.y+p.vy*dt;
  if(!solidCell(Math.floor(nx),Math.floor(ny),false)){p.x=nx;p.y=ny;}
  else{if(p.z>.05&&p.z<1){const h=cast(p.x,p.y,p.vx,p.vy,.5);if(h&&!h.door){if(p.kind===1)stainWall(h.id,h.face,h.u,clamp(1-p.z,0,1),.12,1);else if(p.kind===3)stainWall(h.id,h.face,h.u,clamp(1-p.z,0,1),0,3);}}
    parts.splice(i,1);continue;}
  p.z+=p.vz*dt;if(p.z<=0){if(p.kind===1)stainFloor(p.x,p.y,.035+p.s*1.8,rnd()<.5?2:1);parts.splice(i,1);}}}

