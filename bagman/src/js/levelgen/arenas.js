let ARENAMAP='gas';
function genArena(k){const L=k==='train'?genArenaTrain():k==='meat'?genMeat():genHead();const th=L.th;
  L.camZ=.5;L.bombs=[];L.pflames=[];L.floor=th.fi!=null?tintFloor(th.fl,th.fi):FLO[th.fl];if(th.fl2)L.floor2=tintFloor(th.fl2,6);
  if(L.outdoor)L.sky=makeSky(77,1.2,300,0);L.spiralTotal=0;L.spiral=0;applyRules(L,2);if(!L.train)placeGraffiti(L,rng(k.length*313+9));L.cashTotal=0;L.arenaName=th.t.toUpperCase();L.total=0;return L;}
// three cars at speed, the engine up front. they come over both ends
function genArenaTrain(){const tn=CH.findIndex(c=>c.mode==='train')+1,th=Object.assign({},CH[tn-1],{t:'Freight Train'});const R=rng(5150);const ri=(a,b)=>a+Math.floor(R()*(b-a+1));
  const W=41,H=60,cx=20;const L=baseLevel(2,W,H,0);L.th=th;const map=L.map;const wt=tex(th.wall)+1;
  for(let x=0;x<W;x++){map[x]=wt;map[(H-1)*W+x]=wt;}for(let y=0;y<H;y++){map[y*W]=wt;map[y*W+W-1]=wt;}
  const V=L.void=new Uint8Array(W*H).fill(1);const roof=(x,y)=>{V[y*W+x]=0;};
  const loco=tex('REEFER')+1;for(let y=2;y<=7;y++)for(let x=cx-2;x<=cx+2;x++)map[y*W+x]=loco;
  for(let y=8;y<=10;y++)for(let x=cx-1;x<=cx+1;x++)roof(x,y);
  const cars=[{type:'box',top:42,bot:55},{type:'flat',top:26,bot:39},{type:'box',top:11,bot:23}];
  for(const c of cars){for(let yy=c.top;yy<=c.bot;yy++)for(let x=cx-1;x<=cx+1;x++)roof(x,yy);roof(cx,c.top-1);roof(cx,c.top-2);}
  {const c=cars[1];let side=-1;for(let yy=c.top+2;yy<=c.bot-2;yy++){const seg=Math.floor((yy-c.top-2)/5);side=seg%2?1:-1;if((yy-c.top-2)%5<3)map[yy*W+cx+side]=loco;}}
  for(const c of[cars[0],cars[2]])for(let yy=c.top+2;yy<=c.bot-2;yy+=ri(2,3)){if(R()<.4)continue;const x=cx+ri(-1,1),i=yy*W+x;if(map[i]||L.block[i])continue;
    L.block[i]=1;L.things.push({t:'deco',x:x+.5,y:yy+.5,d:dec(R()<.7?'CRATE':'DRUMCAN'),blk:1});if(!trainOK(L,cx,50)){L.block[i]=0;L.things.pop();}}
  const spawns=[];for(let i=0;i<W*H;i++){const y=(i/W)|0;if(!V[i]&&!map[i]&&!L.block[i]&&(y<=13||y>=52))spawns.push(i);}
  L.poles=[];for(let k=0;k<14;k++){const p={t:'deco',x:k%2?cx-4.5:cx+4.5,y:2+k*(H/14),d:dec('LAMP'),pole:1};L.poles.push(p);L.things.push(p);}
  L.train=1;L.scroll=0;L.clack=0;L.sw={x:0,y:0,i:-1};L.sx=cx+.5;L.sy=33.5;L.sa=-Math.PI/2;L.outdoor=true;
  L.wave={n:0,total:6,pause:2.5,queue:[],spawnT:0,spawns,R,lot:[]};return L;}
// a square freezer: thick walls, a doorway alcove on each side, a ring of hanging beef and four pillars
function genMeat(){const th={t:'Meat Locker',ceil:[60,60,60],fl:'brtile',fi:5,wall:'COLD1',bd:2};const R=rng(6061);const ri=(a,b)=>a+Math.floor(R()*(b-a+1));
  const W=28,H=28;const w1=tex('COLD1')+1,w2=tex('COLD2')+1,w3=tex('COLD3')+1,wc=tex('COLDC')+1;const L=baseLevel(2,W,H,w1);L.th=th;const map=L.map;
  for(let y=0;y<H;y++)for(let x=0;x<W;x++)map[y*W+x]=(x+y)%5===0?w2:w1;
  for(let y=3;y<=24;y++)for(let x=3;x<=24;x++)map[y*W+x]=0;
  for(let k=12;k<=15;k++){map[1*W+k]=0;map[2*W+k]=0;map[25*W+k]=0;map[26*W+k]=0;map[k*W+1]=0;map[k*W+2]=0;map[k*W+25]=0;map[k*W+26]=0;}
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=y*W+x;if(!map[i])continue;const nb=[i-1,i+1,i-W,i+W].some(j=>j>=0&&j<W*H&&!map[j]);if(nb&&((x>=11&&x<=16)||(y>=11&&y<=16)))map[i]=wc;}
  for(const[px,py]of[[9,9],[17,9],[9,17],[17,17]])for(let y=py;y<py+2;y++)for(let x=px;x<px+2;x++)map[y*W+x]=w3;
  const hang=(x,y)=>{const i=y*W+x;if(map[i]||L.block[i])return;L.block[i]=1;L.things.push({t:'deco',x:x+.5,y:y+.5,d:dec('CARCASS'),blk:1});};
  for(let k=6;k<=21;k+=3){if(k>=11&&k<=16)continue;hang(k,6);hang(k,21);hang(6,k);hang(21,k);}
  hang(12,10);hang(15,17);hang(10,15);hang(17,12);
  const soft=['BODY1','BODY2','POOL','BONES','HANGER','POOL','BODY1'];
  for(let k=0;k<16;k++){const x=ri(3,24),y=ri(3,24);const i=y*W+x;if(map[i]||L.block[i]||Math.hypot(x-13.5,y-13.5)<3)continue;L.things.push({t:'deco',x:x+.5,y:y+.5,d:dec(soft[ri(0,soft.length-1)])});}
  for(const[x,y]of[[4,4],[23,23],[23,4]])addBoom(L,x+.5,y+.5,'XDRUM');
  const spawns=[];for(let i=0;i<W*H;i++){const x=i%W,y=(i/W)|0;if(map[i]||L.block[i])continue;if(x<=3||x>=24||y<=3||y>=24)spawns.push(i);}
  L.sw={x:0,y:0,i:-1};L.sx=13.5;L.sy=13.5;L.sa=-Math.PI/2;L.outdoor=false;
  L.wave={n:0,total:6,pause:2.5,queue:[],spawnT:0,spawns,R,lot:[]};return L;}
// a smoke shop: the store up front, a lounge in back, one crooked one-wide hall between them
function genHead(){const th={t:'Headshop',ceil:[40,20,40],fl:'carpet',fi:3,wall:'SHOP2',bd:3};const R=rng(4207);const ri=(a,b)=>a+Math.floor(R()*(b-a+1));
  const W=40,H=26;const s2=tex('SHOP2')+1,s1=tex('SHOP1')+1,hw=tex('BOARD2')+1;const L=baseLevel(2,W,H,s2);L.th=th;const map=L.map;
  const room=(x0,y0,x1,y1)=>{for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)map[y*W+x]=0;};
  room(2,2,14,23);room(25,2,37,23);
  const hall=[[15,5],[16,5],[17,5],[18,5],[18,6],[18,7],[18,8],[18,9],[18,10],[18,11],[18,12],[19,12],[20,12],[21,12],[21,13],[21,14],[21,15],[21,16],[21,17],[21,18],[21,19],[21,20],[22,20],[23,20],[24,20]];
  for(const[x,y]of hall)map[y*W+x]=0;const inHall=new Set(hall.map(([x,y])=>y*W+x));
  const posters=['POSTER6','POSTER0','POSTER6','POSTER3','POSTER6','POSTER5','POSTER6','POSTER1','FRAMED2'];let pk=0;
  for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){const i=y*W+x;if(!map[i])continue;const nb=[i-1,i+1,i-W,i+W].filter(j=>!map[j]);if(!nb.length)continue;
    if(nb.some(j=>inHall.has(j))){map[i]=hw;continue;}const r=R();map[i]=r<.3?s1:(r<.4&&pk<posters.length?tex(posters[pk++])+1:s2);}
  const blk=(x,y,k)=>{const i=y*W+x;if(map[i]||L.block[i])return false;L.block[i]=1;L.things.push({t:'deco',x:x+.5,y:y+.5,d:dec(k),blk:1});
    const d=bfsFrom(L,8,12,-1);for(const j of[...inHall,26*0+12*W+31,2*W+3,23*W+36])if(d[j]<0&&!map[j]){L.block[i]=0;L.things.pop();return false;}return true;};
  for(let x=5;x<=10;x++)blk(x,9,'TABLE2');for(let x=5;x<=10;x++)blk(x,16,'TABLE2');
  for(const[x,y]of[[3,3],[13,3],[3,22],[13,22],[12,12],[4,12]])blk(x,y,'RACK');
  for(const[x,y]of[[14,7],[2,9],[2,16],[14,18]])blk(x,y,'PLANT');
  for(const[x,y]of[[28,6],[33,6],[28,18],[33,18],[31,12]])blk(x,y,'TABLE');
  for(const[x,y]of[[26,3],[36,3],[26,22],[36,22],[30,12],[32,12]])blk(x,y,'PLANT');
  addBoom(L,36.5,12.5,'XDRUM');addBoom(L,3.5,19.5,'XDRUM');
  for(let k=0;k<10;k++){const x=R()<.5?ri(3,13):ri(26,36),y=ri(3,22),i=y*W+x;if(map[i]||L.block[i])continue;L.things.push({t:'deco',x:x+.5,y:y+.5,d:dec(['POTS','BODY3','POOL','BONES','BODY2'][ri(0,4)])});}
  const spawns=[];for(let i=0;i<W*H;i++){const x=i%W;if(map[i]||L.block[i])continue;if(x<=3||x>=35)spawns.push(i);}
  L.sw={x:0,y:0,i:-1};L.sx=8.5;L.sy=12.5;L.sa=0;L.outdoor=false;
  L.wave={n:0,total:6,pause:2.5,queue:[],spawnT:0,spawns,R,lot:[]};return L;}
