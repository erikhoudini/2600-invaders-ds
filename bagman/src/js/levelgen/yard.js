function genYard(n){
  const th=CH[n-1];const R=rng(n*104729+77);const ri=(a,b)=>a+Math.floor(R()*(b-a+1));
  const waves0=th.mode==='waves';const W=waves0?th.size:Math.round(th.size*.55),H=waves0?th.size:th.size*2;const L=baseLevel(n,W,H,0);const map=L.map;const wt=tex(th.wall)+1;
  for(let x=0;x<W;x++){map[x]=wt;map[(H-1)*W+x]=wt;}for(let y=0;y<H;y++){map[y*W]=wt;map[y*W+W-1]=wt;}
  const waves=th.mode==='waves';const sx=W>>1,sy=waves?H-5:H-4;
  const bw=waves?12:(th.exitBig?11:8),bh=waves?7:(th.exitBig?8:6);
  const bx=(W-bw)>>1,by=1;const bt=tex(waves?'STORE':th.exitTex)+1;
  for(let y=by;y<by+bh;y++)for(let x=bx;x<bx+bw;x++){const edge=x===bx||x===bx+bw-1||y===by||y===by+bh-1;map[y*W+x]=edge?bt:0;}
  const dx=bx+(bw>>1),dy=by+bh-1;map[dy*W+dx]=0;L.dg[dy*W+dx]=0;L.doors.push({x:dx,y:dy,vert:false,open:0,st:0,t:0,lock:waves?'W':'Y',tex:tex('LOCKED')});
  const swx=bx+(bw>>1)+(waves?3:0),swy=by;map[swy*W+swx]=tex('SWITCH')+1;L.sw={x:swx,y:swy,i:swy*W+swx};
  for(let y=by+1;y<by+bh-1;y++)for(let x=bx+1;x<bx+bw-1;x++)L.room[y*W+x]=99;
  const reserved=(x,y,m)=>(x>=bx-m&&x<bx+bw+m&&y>=by-m&&y<by+bh+m)||Math.hypot(x-sx,y-sy)<5;
  const connected=()=>{const d=bfsFrom(L,sx,sy,-1);for(let i=0;i<W*H;i++)if(!map[i]&&!L.block[i]&&d[i]<0&&L.room[i]!==99)return false;return true;};
  const place=(x0,y0,w,h,t)=>{for(let y=y0;y<y0+h;y++)for(let x=x0;x<x0+w;x++)if(x<2||y<2||x>=W-2||y>=H-2||map[y*W+x]||L.block[y*W+x]||reserved(x,y,2))return false;
    for(let y=y0;y<y0+h;y++)for(let x=x0;x<x0+w;x++)map[y*W+x]=t;
    if(!connected()){for(let y=y0;y<y0+h;y++)for(let x=x0;x<x0+w;x++)map[y*W+x]=0;return false;}return true;};
  const carTex=()=>tex(['CARR','CARB','CARW'][ri(0,2)])+1;L.cars=[];L.carAt=new Map();
  const placeCar=(x0,y0,w,h)=>{if(!place(x0,y0,w,h,carTex()))return false;const c={cells:[],hp:150,burn:-1,x:x0+w/2,y:y0+h/2};
    for(let y=y0;y<y0+h;y++)for(let x=x0;x<x0+w;x++){const i=y*W+x;c.cells.push(i);L.carAt.set(i,c);}L.cars.push(c);return true;};
  if(waves){
    for(const py of[(H>>1)-1,(H>>1)+3])for(const px of[(W>>1)-7,(W>>1),(W>>1)+7])addBoom(L,px+.5,py+.5,'PUMP');
    let k=0;for(let t=0;t<200&&k<9;t++){const hz=R()<.5;if(placeCar(ri(2,W-4),ri(by+bh+2,H-4),hz?2:1,hz?1:2))k++;}
    for(let k2=0;k2<6;k2++)L.things.push({t:'deco',x:ri(2,W-3)+.5,y:ri(by+bh+1,H-3)+.5,d:dec('LAMP')});
    for(let k2=0;k2<5;k2++){const x=ri(3,W-4),y=ri(by+bh+2,H-6);if(!map[y*W+x]&&!L.block[y*W+x]&&!reserved(x,y,1)){addBoom(L,x+.5,y+.5,'XDRUM');if(!connected()){L.block[y*W+x]=0;L.things.pop();}}}
  }else{
    const want=Math.floor(W*H/55);let k=0;
    for(let t=0;t<600&&k<want;t++){const o=th.obs[ri(0,th.obs.length-1)];let w,h;
      if(o==='RV'){const hz=R()<.5;w=hz?5:2;h=hz?2:5;}else if(o==='CAR'){const hz=R()<.5;w=hz?2:1;h=hz?1:2;}else{w=ri(3,4);h=ri(3,4);}
      if(o==='CAR'?placeCar(ri(2,W-2-w),ri(2,H-2-h),w,h):place(ri(2,W-2-w),ri(2,H-2-h),w,h,tex(o)+1))k++;}
    for(let k2=0;k2<Math.floor(W*H/45);k2++){const x=ri(2,W-3),y=ri(2,H-3);if(map[y*W+x]||reserved(x,y,1)||L.block[y*W+x])continue;const dname=th.deco[ri(0,th.deco.length-1)];
      if(dname==='XDRUM'){addBoom(L,x+.5,y+.5,'XDRUM');if(!connected()){L.block[y*W+x]=0;L.things.pop();}continue;}
      const blk=dname==='FIRE'||dname==='JTREE'||dname==='TREE';if(blk){L.block[y*W+x]=1;if(!connected()){L.block[y*W+x]=0;continue;}}
      if(dname==='TREE')L.things.push({t:'tree',x:x+.5,y:y+.5,ti:ri(0,A.treeN-1),blk:1});else L.things.push({t:'deco',x:x+.5,y:y+.5,d:dec(dname),blk:blk?1:0});}
  }
  const d0=bfsFrom(L,sx,sy,-1);const cells=[];for(let i=0;i<W*H;i++)if(d0[i]>=0&&!L.block[i]&&L.room[i]!==99)cells.push(i);
  const used=new Uint8Array(W*H);const pick=(minD)=>{for(let k=0;k<60;k++){const i=cells[ri(0,cells.length-1)];if(used[i]||d0[i]<minD)continue;used[i]=1;return i;}return -1;};
  const at=(i,k)=>addItem(L,k,(i%W)+.5,((i/W)|0)+.5);
  if(!waves){let best=-1,bd=-1;for(let k=0;k<80;k++){const i=cells[ri(0,cells.length-1)];const x=i%W,y=(i/W)|0;const d=d0[i]+Math.hypot(x-bx-bw/2,y-by-bh/2)*1.5;if(d>bd){bd=d;best=i;}}used[best]=1;at(best,'KEYY');}
  const ne=waves?0:Math.floor(cells.length/19*th.dens*1.3);
  for(let k=0;k<ne;k++){const i=pick(waves?14:9);if(i<0)continue;const type=pickMix(th.mix,R);
    if(type==='dog'){for(let j=0;j<3;j++){const ii=i+(j%2?1:W*(j?1:0));if(!map[ii]&&!L.block[ii])L.enemies.push(makeEnemy('dog',(ii%W)+.5,((ii/W)|0)+.5,R));}}
    else L.enemies.push(makeEnemy(type,(i%W)+.5,((i/W)|0)+.5,R));}
  if(!waves){const weak=th.mix.thug?'thug':'cop';for(let k=0;k<Math.floor(cells.length/55);k++){const i=pick(9);if(i>=0)L.enemies.push(makeEnemy(weak,(i%W)+.5,((i/W)|0)+.5,R));}}
  for(let y=by+1;y<by+bh-1;y++)for(let x=bx+1;x<bx+bw-1;x++)if(R()<.18&&!(x===swx&&y===swy+1))addItem(L,waves?scoreKind(R):(R()<.5?'PACKAGE':'CASH'),x+.5,y+.5);
  for(let k=0;k<Math.floor(cells.length/28);k++){const i=pick(2);if(i>=0)at(i,scoreKind(R));}
  for(let k=0;k<Math.floor(cells.length/(waves?57:78));k++){const i=pick(2);if(i>=0)at(i,ammoKind(R,n));}
  for(let k=0;k<Math.floor(cells.length/(waves?55:80));k++){const i=pick(2);if(i>=0)at(i,R()<.5?'MEDKIT':'BOTTLE');}
  {const i=pick(10);if(i>=0)at(i,'KILO');}
  for(const p of th.power||[]){const i=pick(8);if(i>=0)at(i,p);}
  if(waves){addItem(L,'GUNSHOT',sx+.5,sy-2.5);addItem(L,'SHELLS',sx+1.5,sy-2.5);addItem(L,'VEST',sx-1.5,sy-2.5);
    const spawns=[];for(const i of cells){const x=i%W,y=(i/W)|0;if((x<4||x>W-5||y>H-5)&&Math.hypot(x-sx,y-sy)>8)spawns.push(i);}
    L.wave={n:0,total:6,pause:2.5,queue:[],spawnT:0,spawns,R,lot:cells.filter(i=>Math.hypot(i%W-sx,((i/W)|0)-sy)<11)};}
  if(th.boss){const b=makeEnemy(th.boss,dx+.5,dy+2.5,R);L.boss=b;L.enemies.push(b);}
  L.sx=sx+.5;L.sy=sy+.5;L.sa=-Math.PI/2;L.outdoor=true;
  return L;
}
