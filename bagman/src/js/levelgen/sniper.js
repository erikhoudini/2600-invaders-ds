function genSniper(n){
  const th=CH[n-1];const R=rng(n*3571+9);const ri=(a,b)=>a+Math.floor(R()*(b-a+1));
  const W=th.size,H=W;const L=baseLevel(n,W,H,0);const map=L.map;const wt=tex(th.wall)+1;
  for(let x=0;x<W;x++){map[x]=wt;map[(H-1)*W+x]=wt;map[(H-2)*W+x]=wt;map[(H-3)*W+x]=wt;}for(let y=0;y<H;y++){map[y*W]=wt;map[y*W+W-1]=wt;}
  const px=W>>1,py=H-2;for(let x=px-3;x<=px+3;x++)map[py*W+x]=0;
  const yardOK=()=>{const d=bfsFrom(L,px,H-5,-1);for(let y=1;y<H-3;y++)for(let x=1;x<W-1;x++){const i=y*W+x;if(!map[i]&&!L.block[i]&&d[i]<0)return false;}return true;};
  const texs=['CNT1','SHACK2','CINDER2','STORE','HANG1','REEFER','CARR','CARB','CARW','CNT3'];let k=0;
  for(let t=0;t<400&&k<16;t++){const w=ri(2,6),h=ri(2,5),x0=ri(2,W-2-w),y0=ri(2,H-6-h);let ok=true;
    for(let y=y0-1;y<y0+h+1&&ok;y++)for(let x=x0-1;x<x0+w+1;x++)if(map[y*W+x]){ok=false;break;}if(!ok)continue;
    const tt=tex(texs[ri(0,texs.length-1)])+1;for(let y=y0;y<y0+h;y++)for(let x=x0;x<x0+w;x++)map[y*W+x]=tt;
    if(!yardOK()){for(let y=y0;y<y0+h;y++)for(let x=x0;x<x0+w;x++)map[y*W+x]=0;continue;}k++;}
  const open=[];for(let y=2;y<H-5;y++)for(let x=2;x<W-2;x++)if(!map[y*W+x])open.push(y*W+x);
  for(let j=0;j<10;j++){const i=open[ri(0,open.length-1)];L.things.push({t:'deco',x:(i%W)+.5,y:((i/W)|0)+.5,d:dec(j<6?'LAMP':'TIRE')});}
  for(let j=0;j<6;j++){const i=open[ri(0,open.length-1)];if(!L.block[i])addBoom(L,(i%W)+.5,((i/W)|0)+.5,'XDRUM');}
  const used=new Set();const types=['cop','cop','thug','enf'];
  for(let j=0;j<16;j++){let i;for(let t=0;t<40;t++){i=open[ri(0,open.length-1)];if(!used.has(i)&&!L.block[i]&&Math.hypot((i%W)-px,((i/W)|0)-py)>9)break;}used.add(i);
    const e=makeEnemy(types[ri(0,types.length-1)],(i%W)+.5,((i/W)|0)+.5,R);e.guard=1;e.wp=null;e.wait=R()*3;L.enemies.push(e);}
  L.sw={x:0,y:0,i:-1};L.sx=px+.5;L.sy=py+.5;L.sa=-Math.PI/2;L.outdoor=true;L.sniper=true;L.camZ=1.7;
  return L;}
