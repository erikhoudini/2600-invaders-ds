// a freight train seen from its roof: three-wide car roofs, single couplings between cars, crates to weave through,
// tank cars with one-plank catwalks, and the ground racing past on both sides. Step off and you fall.
function genTrain(n){
  const th=CH[n-1];const R=rng(n*7717+3);const ri=(a,b)=>a+Math.floor(R()*(b-a+1));
  const W=41,H=th.size,cx=20;const L=baseLevel(n,W,H,0);const map=L.map;const wt=tex(th.wall)+1;
  for(let x=0;x<W;x++){map[x]=wt;map[(H-1)*W+x]=wt;}for(let y=0;y<H;y++){map[y*W]=wt;map[y*W+W-1]=wt;}
  const V=L.void=new Uint8Array(W*H).fill(1);const roof=(x,y)=>{V[y*W+x]=0;};
  const loco=tex('REEFER')+1;for(let y=2;y<=7;y++)for(let x=cx-2;x<=cx+2;x++)map[y*W+x]=loco;
  map[7*W+cx]=tex('SWITCH')+1;L.sw={x:cx,y:7,i:7*W+cx};for(let x=cx-1;x<=cx+1;x++)roof(x,8);
  const cars=[];let y=H-4;
  while(y>12){const len=ri(11,15),top=Math.max(9,y-len+1);const type=cars.length===0?'box':['box','box','tank','flat'][ri(0,3)];
    cars.push({type,top,bot:y});
    for(let yy=top;yy<=y;yy++){if(type==='tank'&&yy>top+1&&yy<y-1)roof(cx,yy);else for(let x=cx-1;x<=cx+1;x++)roof(x,yy);}
    if(type==='flat'){const side=R()<.5?-1:1;for(let yy=top+2;yy<=y-2;yy++)for(const x of[cx,cx+side])map[yy*W+x]=loco;}
    if(top>9){roof(cx,top-1);roof(cx,top-2);}y=top-3;}
  for(let yy=8;yy<=y+2&&yy<H;yy++)roof(cx,yy);for(let yy=8;yy<=Math.min(H-2,y+2);yy++)for(let x=cx-1;x<=cx+1;x++)if(yy<=10)roof(x,yy);
  // crates on box car roofs, never sealing a row
  for(const c of cars){if(c.type!=='box')continue;for(let yy=c.top+2;yy<=c.bot-2;yy+=ri(2,3)){if(R()<.45)continue;const x=cx+ri(-1,1),i=yy*W+x;
    if(map[i]||L.block[i])continue;L.block[i]=1;L.things.push({t:'deco',x:x+.5,y:yy+.5,d:dec(R()<.7?'CRATE':'DRUMCAN'),blk:1});
    if(!trainOK(L,cx,H-6)){L.block[i]=0;L.things.pop();}}}
  const roofCells=[];for(let i=0;i<W*H;i++)if(!V[i]&&!map[i]&&!L.block[i])roofCells.push(i);
  const used=new Uint8Array(W*H);const pick=(y0,y1)=>{for(let k=0;k<40;k++){const i=roofCells[ri(0,roofCells.length-1)],yy=(i/W)|0;if(used[i]||yy<y0||yy>y1)continue;used[i]=1;return i;}return -1;};
  const at=(i,k)=>{if(i>=0)addItem(L,k,(i%W)+.5,((i/W)|0)+.5);};
  cars.forEach((c,ci)=>{if(ci===0)return;const ne=c.type==='tank'?ri(1,2):ri(2,4);
    for(let k=0;k<ne;k++){const i=pick(c.top,c.bot);if(i<0)continue;const e=makeEnemy(pickMix(th.mix,R),(i%W)+.5,((i/W)|0)+.5,R);e.role=R()<.7?'hold':'rush';e.a=Math.PI/2;L.enemies.push(e);}
    if(R()<.55)at(pick(c.top,c.bot),ammoKind(R,n));if(R()<.35)at(pick(c.top,c.bot),R()<.5?'MEDKIT':'BOTTLE');
    for(let k=0;k<ri(0,2);k++)at(pick(c.top,c.bot),scoreKind(R));});
  const mid=cars[Math.floor(cars.length/2)];at(pick(mid.top,mid.bot),'KILO');
  (th.power||[]).forEach((p,k)=>{const c=cars[Math.floor(cars.length*(k+1)/3)];at(pick(c.top,c.bot),p);});
  // telegraph poles racing past on both sides
  L.poles=[];for(let k=0;k<14;k++){const p={t:'deco',x:k%2?cx-4.5:cx+4.5,y:2+k*(H/14),d:dec('LAMP'),pole:1};L.poles.push(p);L.things.push(p);}
  L.train=1;L.scroll=0;L.clack=0;L.sx=cx+.5;L.sy=H-6+.5;L.sa=-Math.PI/2;L.outdoor=true;
  return L;}
function trainOK(L,sx,sy){const W=L.W,d=new Int16Array(W*L.H).fill(-1),q=[sy*W+sx];d[q[0]]=0;
  for(let h=0;h<q.length;h++){const c=q[h];for(const o of[1,-1,W,-W]){const nb=c+o;if(d[nb]>=0||L.map[nb]||L.block[nb]||L.void[nb])continue;d[nb]=1;q.push(nb);}}
  return d[8*W+sx]>=0;}
function updTrain(dt){L.scroll+=dt*26;for(const p of L.poles){p.y+=dt*26;if(p.y>L.H-2)p.y-=L.H-4;}
  L.clack-=dt;if(L.clack<=0){L.clack=.55+rnd()*.15;play('push',.18,.45+rnd()*.1);shake=Math.max(shake,.08);}}
