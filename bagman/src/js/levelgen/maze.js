// roguelike rooms and mazes: rooms on the odd grid, a straight-biased maze in between, one opening per region, dead ends filled back in.
// the result is long one-wide hallways with hard right angles between the rooms
function hallMaze(L,W,H,R,ri,rooms){const map=L.map,room=L.room;
  for(let t=0;t<400&&rooms.length<11;t++){const w=ri(2,4)*2+1,h=ri(2,4)*2+1,x=ri(0,(W-w-2)>>1)*2+1,y=ri(0,(H-h-2)>>1)*2+1;if(x+w>W-2||y+h>H-2)continue;
    if(rooms.some(r=>x<r.x+r.w+3&&x+w+3>r.x&&y<r.y+r.h+3&&y+h+3>r.y))continue;
    const r={x,y,w,h,cx:x+(w>>1),cy:y+(h>>1),i:rooms.length};rooms.push(r);for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++){map[yy*W+xx]=0;room[yy*W+xx]=r.i;}}
  const reg=new Int32Array(W*H).fill(-1);for(const r of rooms)for(let yy=r.y;yy<r.y+r.h;yy++)for(let xx=r.x;xx<r.x+r.w;xx++)reg[yy*W+xx]=r.i;
  let nreg=rooms.length;const DIRS=[[1,0],[-1,0],[0,1],[0,-1]];
  for(let y=1;y<H-1;y+=2)for(let x=1;x<W-1;x+=2){if(!map[y*W+x])continue;map[y*W+x]=0;reg[y*W+x]=nreg;const st=[[x,y]];let last=null;
    while(st.length){const[cx,cy]=st[st.length-1];const op=DIRS.filter(([dx,dy])=>{const nx=cx+dx*2,ny=cy+dy*2;return nx>0&&ny>0&&nx<W-1&&ny<H-1&&map[ny*W+nx];});
      if(!op.length){st.pop();last=null;continue;}
      const d=last&&op.includes(last)&&R()<.82?last:op[ri(0,op.length-1)];
      for(const k of[1,2]){const i=(cy+d[1]*k)*W+cx+d[0]*k;map[i]=0;reg[i]=nreg;}st.push([cx+d[0]*2,cy+d[1]*2]);last=d;}
    nreg++;}
  const par=[...Array(nreg).keys()],fd=a=>par[a]===a?a:(par[a]=fd(par[a]));
  const con=[];for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){const i=y*W+x;if(!map[i])continue;
    for(const[a,b]of[[i-1,i+1],[i-W,i+W]])if(!map[a]&&!map[b]&&reg[a]>=0&&reg[b]>=0&&reg[a]!==reg[b])con.push([i,reg[a],reg[b]]);}
  for(let k=con.length-1;k>0;k--){const j=ri(0,k);[con[k],con[j]]=[con[j],con[k]];}
  const opened=[];const near=i=>opened.some(o=>Math.abs(o%W-i%W)+Math.abs(((o/W)|0)-((i/W)|0))<3);
  for(const[i,a,b]of con){if(fd(a)!==fd(b)){if(near(i))continue;map[i]=0;opened.push(i);par[fd(a)]=fd(b);}}
  for(const[i,a,b]of con){if(map[i]&&fd(a)!==fd(b)){map[i]=0;opened.push(i);par[fd(a)]=fd(b);}}
  for(const[i]of con)if(map[i]&&R()<.035&&!near(i)){map[i]=0;opened.push(i);}
  // fill dead ends back in
  for(let ch=1;ch;){ch=0;for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){const i=y*W+x;if(map[i]||room[i]>=0)continue;
    if((map[i-1]?1:0)+(map[i+1]?1:0)+(map[i-W]?1:0)+(map[i+W]?1:0)>=3){map[i]=L.map[0]||1;ch=1;}}}
  const wt=map[0];for(let i=0;i<W*H;i++)if(map[i]&&map[i]!==wt)map[i]=wt;
}
function genMaze(n){
  const th=CH[n-1];const R=rng(n*7919+1301);const ri=(a,b)=>a+Math.floor(R()*(b-a+1));
  const W=th.size,H=W;const L=baseLevel(n,W,H,tex(th.corr)+1);const {map,room,dg,doors}=L;
  // --- rooms by BSP
  let rooms=[];
  if(th.halls)hallMaze(L,W,H,R,ri,rooms);else{
  const leaves=[];
  (function split(x,y,w,h,dep){const node={x,y,w,h};
    if((w<16&&h<16)||(dep>1&&w<22&&h<22&&R()<.3)){leaves.push(node);return;}
    const vert=w>=16&&(h<16||w>h||(w===h&&R()<.5));
    if(vert){const s=Math.floor(w*(.4+R()*.2));split(x,y,s,h,dep+1);split(x+s,y,w-s,h,dep+1);}
    else{const s=Math.floor(h*(.4+R()*.2));split(x,y,w,s,dep+1);split(x,y+s,w,h-s,dep+1);}})(1,1,W-2,H-2,0);
  for(const lf of leaves){const rw=ri(5,Math.max(5,lf.w-2)),rh=ri(5,Math.max(5,lf.h-2));
    const rx=lf.x+1+ri(0,Math.max(0,lf.w-2-rw)),ry=lf.y+1+ri(0,Math.max(0,lf.h-2-rh));
    const r={x:rx,y:ry,w:Math.min(rw,W-2-rx),h:Math.min(rh,H-2-ry)};r.cx=r.x+(r.w>>1);r.cy=r.y+(r.h>>1);r.i=rooms.length;rooms.push(r);
    for(let y=r.y;y<r.y+r.h;y++)for(let x=r.x;x<r.x+r.w;x++){map[y*W+x]=0;room[y*W+x]=r.i;}}
  // --- corridors: minimum spanning connections plus a few loops
  function carve(a,b){let x=a.cx,y=a.cy;const hf=R()<.5;
    const sx=()=>{while(x!==b.cx){map[y*W+x]=0;x+=Math.sign(b.cx-x);}},sy=()=>{while(y!==b.cy){map[y*W+x]=0;y+=Math.sign(b.cy-y);}};
    if(hf){sx();sy();}else{sy();sx();}map[y*W+x]=0;}
  const inTree=new Set([0]);
  while(inTree.size<rooms.length){let best=null,bd=1e9;for(const i of inTree)for(let j=0;j<rooms.length;j++){if(inTree.has(j))continue;const a=rooms[i],b=rooms[j];const d=Math.abs(a.cx-b.cx)+Math.abs(a.cy-b.cy);if(d<bd){bd=d;best=[a,b];}}
    carve(best[0],best[1]);inTree.add(best[1].i);}
  for(let k=0;k<Math.floor(rooms.length/5);k++){const a=rooms[ri(0,rooms.length-1)];let best=null,bd=1e9;for(const b of rooms){if(b===a)continue;const d=Math.abs(a.cx-b.cx)+Math.abs(a.cy-b.cy);if(d<bd&&d>8){bd=d;best=b;}}if(best&&bd<20)carve(a,best);}
  }
  // --- doors at room thresholds
  const open=(x,y)=>x>0&&y>0&&x<W-1&&y<H-1&&map[y*W+x]===0;
  for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){const i=y*W+x;if(map[i]||room[i]>=0)continue;
    if(dg[i-1]>=0||dg[i+1]>=0||dg[i-W]>=0||dg[i+W]>=0)continue;
    if(open(x-1,y)&&open(x+1,y)&&!open(x,y-1)&&!open(x,y+1)&&(room[i-1]>=0||room[i+1]>=0)){dg[i]=doors.length;doors.push({x,y,vert:true,open:0,st:0,t:0,lock:null});}
    else if(open(x,y-1)&&open(x,y+1)&&!open(x-1,y)&&!open(x+1,y)&&(room[i-W]>=0||room[i+W]>=0)){dg[i]=doors.length;doors.push({x,y,vert:false,open:0,st:0,t:0,lock:null});}}
  const ring=(r,f)=>{for(let y=r.y-1;y<=r.y+r.h;y++)for(let x=r.x-1;x<=r.x+r.w;x++){if(y<0||x<0||y>=H||x>=W)continue;if(x>=r.x&&x<r.x+r.w&&y>=r.y&&y<r.y+r.h)continue;f(x,y,y*W+x);}};
  for(const r of rooms){const t=tex(th.rooms[ri(0,th.rooms.length-1)])+1;r.tex=t;ring(r,(x,y,i)=>{if(map[i])map[i]=t;});}
  // --- framed pictures on room walls
  const FRAMES=['FRAMED0','FRAMED1','FRAMED2','FRAMED3'],POSTERS=['POSTER0','POSTER1','POSTER2','POSTER3','POSTER4','POSTER5','POSTER6'];
  for(const r of rooms){const roll=R();if(roll>.36)continue;const pool=roll<.18?FRAMES:POSTERS;for(let k=0;k<8;k++){const side=ri(0,3);let x,y;
      if(side<2){x=ri(r.x+1,r.x+r.w-2);y=side?r.y+r.h:r.y-1;}else{y=ri(r.y+1,r.y+r.h-2);x=side===3?r.x+r.w:r.x-1;}
      const i=y*W+x;if(map[i]!==r.tex||dg[i-1]>=0||dg[i+1]>=0||dg[i-W]>=0||dg[i+W]>=0)continue;map[i]=tex(pool[ri(0,pool.length-1)])+1;break;}}
  // --- start, exit, key progression
  const start=rooms[ri(0,rooms.length-1)];const d0=bfsFrom(L,start.cx,start.cy,-1);
  let exit=null,ed=-1;
  for(const r of rooms){if(r===start)continue;const dd=d0[r.cy*W+r.cx];const score=dd+(th.boss&&r.w*r.h>=36?1000:0);if(dd>=0&&score>ed){ed=score;exit=r;}}
  const roomAt=(cell)=>room[cell]>=0?rooms[room[cell]]:null;
  const farRoom=(dist,excl)=>{let br=null,bd=-1;for(const r of rooms){if(excl.includes(r))continue;const v=dist[r.cy*W+r.cx];if(v>bd){bd=v;br=r;}}return br;};
  const keys=[];
  let lockA=null;
  {let best=null,bdist=-1;for(const dr of doors){const di=dr.y*W+dr.x;const db=bfsFrom(L,start.cx,start.cy,di);if(db[exit.cy*W+exit.cx]>=0)continue;if(d0[di]>bdist){bdist=d0[di];best={dr,di,db};}}lockA=best;}
  if(lockA){
    const regionA=lockA.db;
    if(th.keys>=2){let lockB=null,bs=-1;
      for(const dr of doors){if(dr===lockA.dr)continue;const di=dr.y*W+dr.x;if(regionA[di]<0)continue;
        const db=bfsFrom(L,start.cx,start.cy,new Set([lockA.di,di]));let cutN=0;for(let i=0;i<W*H;i++)if(regionA[i]>=0&&db[i]<0)cutN++;
        if(cutN>=40){const s=Math.min(cutN,300)+d0[di];if(s>bs){bs=s;lockB={dr,di,db,regionA};}}}
      if(lockB){lockA.dr.lock='R';lockB.dr.lock='Y';
        const cutRooms=rooms.filter(r=>regionA[r.cy*W+r.cx]>=0&&lockB.db[r.cy*W+r.cx]<0);
        const dB=bfsFrom(L,lockB.dr.x,lockB.dr.y,lockA.di);let kr=null,kd=-1;for(const r of cutRooms){const v=dB[r.cy*W+r.cx];if(v>kd){kd=v;kr=r;}}
        if(kr)keys.push(['KEYR',kr]);
        const yr=farRoom(lockB.db,[start,exit,...cutRooms]);keys.push(['KEYY',yr||start]);}
      else{lockA.dr.lock='Y';keys.push(['KEYY',farRoom(regionA,[start,exit])||start]);}}
    else{lockA.dr.lock='Y';keys.push(['KEYY',farRoom(regionA,[start,exit])||start]);}}
  const elev=tex('ELEV')+1;ring(exit,(x,y,i)=>{if(map[i])map[i]=elev;});
  let sw=null,sd=-1;const entry=doors.filter(dr=>Math.abs(dr.x-exit.cx)<=exit.w&&Math.abs(dr.y-exit.cy)<=exit.h);
  ring(exit,(x,y,i)=>{if(!map[i])return;if(![[1,0],[-1,0],[0,1],[0,-1]].some(([ox,oy])=>room[(y+oy)*W+x+ox]===exit.i))return;
    if(dg[i-1]>=0||dg[i+1]>=0||dg[i-W]>=0||dg[i+W]>=0)return;
    let m=1e9;for(const e of entry)m=Math.min(m,Math.abs(e.x-x)+Math.abs(e.y-y));if(!entry.length)m=R();if(m>sd){sd=m;sw={x,y,i};}});
  map[sw.i]=tex('SWITCH')+1;L.sw=sw;
  for(const dr of doors)dr.tex=dr.lock==='R'?tex('LOCKEDR'):dr.lock==='Y'?tex('LOCKED'):tex('DOOR');
  // --- secrets: push walls into sealed closets
  const solid=(x,y)=>x>0&&y>0&&x<W-1&&y<H-1&&map[y*W+x]&&dg[y*W+x]<0&&map[y*W+x]!==tex('SWITCH')+1;
  const used=new Uint8Array(W*H);const secretGoods=[];
  const wantSecrets=2+(n>6?1:0);let made=0;
  for(let tries=0;tries<400&&made<wantSecrets;tries++){const r=rooms[ri(0,rooms.length-1)];if(r===exit)continue;
    const side=ri(0,3);const[dx,dy]=[[0,-1],[0,1],[-1,0],[1,0]][side];
    let wx,wy;if(dx===0){wx=ri(r.x+1,r.x+r.w-2);wy=dy<0?r.y-1:r.y+r.h;}else{wy=ri(r.y+1,r.y+r.h-2);wx=dx<0?r.x-1:r.x+r.w;}
    const px=-dy,py=dx;let ok=solid(wx,wy);
    for(let d=1;d<=3&&ok;d++)for(let l=-1;l<=1&&ok;l++)if(!solid(wx+dx*d+px*l,wy+dy*d+py*l))ok=false;
    if(!ok)continue;
    const c1=(wy+dy)*W+wx+dx,c2=(wy+dy*2)*W+wx+dx*2;map[c1]=0;map[c2]=0;
    const wi=wy*W+wx;if(R()<.6){map[wi]=tex(R()<.5?POSTERS[ri(0,POSTERS.length-1)]:FRAMES[ri(0,FRAMES.length-1)])+1;}L.secretAt.set(wi,{x:wx,y:wy,dx,dy,tex:map[wi]-1});made++;
    const face=dx===0?(dy<0?3:2):(dx<0?1:0);if(!/POSTER|FRAMED/.test(A.wallNames[map[wi]-1]))stainHand(L,wi,face);
    secretGoods.push([c1,c2]);}
  L.secrets=made;
  // --- monster closets: a sealed room behind a key room's wall that opens the moment the key is lifted
  L.ambush=[];const quiet=new Set();
  const tryRoom=(k,r)=>{
    for(let tries=0;tries<400;tries++){const[dx,dy]=[[0,-1],[0,1],[-1,0],[1,0]][ri(0,3)];const lx=Math.abs(dy),ly=Math.abs(dx);
      let wx,wy;if(dx===0){if(r.w<5)continue;wx=ri(r.x+1,r.x+r.w-3);wy=dy<0?r.y-1:r.y+r.h;}else{if(r.h<5)continue;wy=ri(r.y+1,r.y+r.h-3);wx=dx<0?r.x-1:r.x+r.w;}
      const op=[[wx,wy],[wx+lx,wy+ly]];if(!op.every(([x,y])=>map[y*W+x]===r.tex&&dg[y*W+x-1]<0&&dg[y*W+x+1]<0&&dg[y*W+x-W]<0&&dg[y*W+x+W]<0))continue;
      const big=tries<180,dep=big?ri(4,6):3,half=big?ri(2,3):1;let ok=true;
      for(let d=1;d<=dep+1&&ok;d++)for(let l=-half-1;l<=half+2&&ok;l++){const x=wx+dx*d+lx*l,y=wy+dy*d+ly*l;if(!solid(x,y)||used[y*W+x])ok=false;}
      if(!ok)continue;const cells=[];
      for(let d=1;d<=dep;d++)for(let l=-half;l<=half+1;l++){const x=wx+dx*d+lx*l,y=wy+dy*d+ly*l,i=y*W+x;map[i]=0;used[i]=1;cells.push(i);}
      L.ambush.push({key:k,vert:dx!==0,open:op.map(([x,y])=>({x,y,i:y*W+x,tex:map[y*W+x]-1})),cells,enemies:[],face:Math.atan2(-dy,-dx)});return true;}return false;};
  for(const[k,r]of keys){if(r===start||r===exit)continue;quiet.add(r);if(tryRoom(k,r))continue;
    const near=rooms.filter(o=>o!==r&&o!==start&&o!==exit&&!quiet.has(o)).sort((a,b)=>Math.hypot(a.cx-r.cx,a.cy-r.cy)-Math.hypot(b.cx-r.cx,b.cy-r.cy)).slice(0,3);
    for(const o of near)if(tryRoom(k,o)){quiet.add(o);break;}}
  // --- population
  const freeCell=(r,pad)=>{for(let k=0;k<30;k++){const x=ri(r.x+pad,r.x+r.w-1-pad),y=ri(r.y+pad,r.y+r.h-1-pad);const i=y*W+x;if(used[i]||map[i])continue;if(r===start&&Math.hypot(x-start.cx,y-start.cy)<2.5)continue;return{x,y,i};}return null;};
  for(const r of rooms){const area=r.w*r.h;
    if(r!==start){let ne=Math.round(area/9*th.dens*1.3*(0.75+R()*.5));if(r===exit&&th.boss)ne=3;ne=Math.min(ne,13);if(quiet.has(r))ne=Math.min(ne,ri(1,2));
      for(let k=0;k<ne;k++){const c=freeCell(r,0);if(!c)break;used[c.i]=1;L.enemies.push(makeEnemy(pickMix(th.mix,R),c.x+.5,c.y+.5,R));}
      if(!quiet.has(r)&&!(r===exit&&th.boss)){const weak=th.mix.thug?'thug':'cop',nw=Math.round(area/28*(.6+R()*.8));for(let k=0;k<nw;k++){const c=freeCell(r,0);if(!c)break;used[c.i]=1;L.enemies.push(makeEnemy(weak,c.x+.5,c.y+.5,R));}}}
    const nb=ri(0,Math.min(3,Math.floor(area/14)));
    for(let k=0;k<nb;k++){const c=freeCell(r,1);if(!c)break;const {x,y}=c;let ok=true;for(let oy=-1;oy<=1&&ok;oy++)for(let ox=-1;ox<=1;ox++){const j=(y+oy)*W+x+ox;if(room[j]!==r.i||L.block[j]||dg[j]>=0){ok=false;break;}}
      if(!ok)continue;used[c.i]=1;const kind=th.blk[ri(0,th.blk.length-1)];
      if(kind==='XDRUM')addBoom(L,x+.5,y+.5,'XDRUM');else{L.block[c.i]=1;L.things.push({t:'deco',x:x+.5,y:y+.5,d:dec(kind),blk:1});}}
    if(R()<.35){const c=freeCell(r,1);if(c){used[c.i]=1;addBoom(L,c.x+.5,c.y+.5,'XDRUM');}}
    const ns=ri(0,3);for(let k=0;k<ns;k++){const c=freeCell(r,0);if(!c)break;used[c.i]=1;L.things.push({t:'deco',x:c.x+.5+(R()-.5)*.4,y:c.y+.5+(R()-.5)*.4,d:dec(th.soft[ri(0,th.soft.length-1)])});}
    if(R()<.6){const c=freeCell(r,0);if(c){used[c.i]=1;addItem(L,R()<.45?'MEDKIT':'BOTTLE',c.x+.5,c.y+.5);}}
    if(R()<.49||r===start){const c=freeCell(r,0);if(c){used[c.i]=1;addItem(L,ammoKind(R,n),c.x+.5,c.y+.5);}}
    const nc=ri(1,3+(th.rich?4:0));for(let k=0;k<nc;k++){const c=freeCell(r,0);if(!c)break;used[c.i]=1;addItem(L,th.rich&&R()<.4?'PACKAGE':scoreKind(R),c.x+.5,c.y+.5);}
  }
  for(const t of L.things.slice()){if(!t.boom||R()>.65)continue;const cx=Math.floor(t.x),cy=Math.floor(t.y);const rm=room[cy*W+cx];if(rm<0||rooms[rm]===start)continue;
    for(const[ox,oy]of[[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,-1]]){const i=(cy+oy)*W+cx+ox;if(map[i]||used[i]||L.block[i]||room[i]!==rm)continue;used[i]=1;const ty=pickMix(th.mix,R);L.enemies.push(makeEnemy(ty==='dog'?'thug':ty,cx+ox+.5,cy+oy+.5,R));break;}}
  for(const am of L.ambush){const want=4+Math.min(4,n>>1)+ri(0,1);const pool=am.cells.slice();
    for(let k=0;k<want&&pool.length;k++){const i=pool.splice(ri(0,pool.length-1),1)[0];const e=makeEnemy(pickMix(th.mix,R),(i%W)+.5,((i/W)|0)+.5,R);e.a=am.face;e.ambush=1;e.role=e.dog?'rush':(R()<.6?'rush':'flank');am.enemies.push(e);L.enemies.push(e);}
    if(R()<.5&&pool.length){const i=pool[ri(0,pool.length-1)];addItem(L,ammoKind(R,n),(i%W)+.5,((i/W)|0)+.5);}}
  if(th.halls){const hall=[];for(let i=0;i<W*H;i++)if(!map[i]&&room[i]<0&&dg[i]<0&&!used[i]&&d0[i]>=10)hall.push(i);
    const want=Math.round(hall.length/11);for(let k=0;k<want&&hall.length;k++){const i=hall.splice(ri(0,hall.length-1),1)[0];if(L.enemies.some(e=>Math.abs(e.x-(i%W)-.5)+Math.abs(e.y-((i/W)|0)-.5)<4))continue;
      used[i]=1;const e=makeEnemy(pickMix(th.mix,R),(i%W)+.5,((i/W)|0)+.5,R);if(!e.dog)e.role=R()<.5?'hold':'rush';L.enemies.push(e);}}
  const mids=rooms.filter(r=>r!==start&&r!==exit);
  if(mids.length){const r=mids[ri(0,mids.length-1)];const c=freeCell(r,0);if(c){used[c.i]=1;addItem(L,'KILO',c.x+.5,c.y+.5);}}
  if(n===4&&mids.length){const near=mids.slice().sort((a,b)=>d0[a.cy*W+a.cx]-d0[b.cy*W+b.cx])[0];const c=freeCell(near,0)||{x:near.cx,y:near.cy};
    const e=makeEnemy('enf',c.x+.5,c.y+.5,R);e.carry='TOMMYGUN';e.role='hold';L.enemies.push(e);}
  if(n===3&&mids.length){const c=freeCell(mids[0],0);if(c){used[c.i]=1;addItem(L,'GUNSHOT',c.x+.5,c.y+.5);}}
  // power-ups: one out in the open, the rest in secrets
  const pw=(th.power||[]).concat(n>=8?['FLAMER']:[]);let pi=0;
  if(pw.length&&mids.length){const cnt=r=>L.enemies.filter(e=>!e.ambush&&e.x>=r.x&&e.x<r.x+r.w&&e.y>=r.y&&e.y<r.y+r.h).length;const r=mids.slice().sort((a,b)=>cnt(b)-cnt(a))[0];const c=freeCell(r,0);if(c){used[c.i]=1;addItem(L,pw[pi++%pw.length],c.x+.5,c.y+.5);}}
  for(const[c1,c2]of secretGoods){const roll=R();addItem(L,roll<.3?'FULLHP':(pw.length?pw[pi++%pw.length]:'PACKAGE'),(c2%W)+.5,((c2/W)|0)+.5);addItem(L,R()<.5?'PACKAGE':'CHAIN',(c1%W)+.5,((c1/W)|0)+.5);}
  for(const[k,r]of keys){const c=freeCell(r,0)||{x:r.cx,y:r.cy};addItem(L,k,c.x+.5,c.y+.5);}
  if(th.boss){const b=makeEnemy(th.boss,exit.cx+.5,exit.cy+.5,R);L.boss=b;L.enemies.push(b);}
  let sa=0,best=-1;for(let k=0;k<4;k++){const ax=[1,0,-1,0][k],ay=[0,1,0,-1][k];let s=0,x=start.cx,y=start.cy;while(!map[(y+ay)*W+x+ax]){x+=ax;y+=ay;s++;}if(s>best){best=s;sa=k*Math.PI/2;}}
  L.sx=start.cx+.5;L.sy=start.cy+.5;L.sa=sa;L.outdoor=false;
  return L;
}
