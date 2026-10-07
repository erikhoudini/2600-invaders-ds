/* ---------- level object for the engine ---------- */
function edBuild(E){const W=E.W,H=E.H,R=rng(4242);const L=baseLevel(1,W,H,0);L.custom=1;L.ambush=[];L.graf=new Map();
  L.th={t:E.name,ceil:ZX[E.ceil].map(v=>v*.35),bd:E.border};L.arenaName=(E.name||'UNTITLED').toUpperCase();
  const map=L.map,edge=tex('CINDER')+1,swt=tex('SWITCH')+1;
  for(let i=0;i<W*H;i++){map[i]=E.walls[i];const x=i%W,y=(i/W)|0;if((x===0||y===0||x===W-1||y===H-1)&&!map[i])map[i]=edge;}
  for(let i=0;i<W*H;i++)if(map[i]===swt&&!L.sw)L.sw={x:i%W,y:(i/W)|0,i};if(!L.sw)L.sw={x:0,y:0,i:-1};
  for(const[i,m]of E.marks){const x=i%W,y=(i/W)|0;
    if(m.k==='door'&&!map[i]){const vert=!!(map[i-W]&&map[i+W]);L.dg[i]=L.doors.length;L.doors.push({x,y,vert,open:0,st:0,t:0,lock:m.lock||null,tex:tex(m.lock==='R'?'LOCKEDR':m.lock==='Y'?'LOCKED':'DOOR')});}
    else if(m.k==='secret'&&map[i]){let dx=0,dy=0;for(const[ox,oy]of[[1,0],[-1,0],[0,1],[0,-1]]){const j=(y-oy)*W+x-ox;if(j>=0&&j<W*H&&!map[j]){dx=ox;dy=oy;break;}}
      L.secretAt.set(i,{x,y,dx,dy,tex:map[i]-1});L.secrets++;}
    else if(m.k==='amb'&&map[i]){const key='KEY'+(m.key||'Y'),vert=!map[i-1]||!map[i+1];L.ambush.push({key,vert,open:[{x,y,i,tex:map[i]-1}],cells:[],enemies:[],face:0});}}
  // cars: each patch of car cells is one car that burns and blows
  L.cars=[];L.carAt=new Map();const seen=new Uint8Array(W*H),isCar=i=>map[i]&&CARTEX.has(A.wallNames[map[i]-1]);
  for(let i=0;i<W*H;i++){if(seen[i]||!isCar(i))continue;const cells=[],q=[i];seen[i]=1;
    for(let h=0;h<q.length;h++){const c=q[h];cells.push(c);for(const o of[1,-1,W,-W]){const n=c+o;if(n<0||n>=W*H||seen[n]||!isCar(n))continue;seen[n]=1;q.push(n);}}
    let sx=0,sy=0;for(const c of cells){sx+=c%W+.5;sy+=((c/W)|0)+.5;}const car={cells,hp:150,burn:-1,x:sx/cells.length,y:sy/cells.length};for(const c of cells)L.carAt.set(c,car);L.cars.push(car);}
  L.floorsD=E.floors.map(f=>floorData(f).d);L.fmap=Uint8Array.from(E.fmap);L.floor=floorData(E.floors[0]);
  for(const[i,t]of E.things){if(map[i]||L.dg[i]>=0)continue;const x=(i%W)+.5,y=((i/W)|0)+.5;
    if(t.t==='item')addItem(L,t.k,x,y);
    else if(t.t==='prop'){if(t.k==='XDRUM'||t.k==='PUMP')addBoom(L,x,y,t.k);else if(t.k.startsWith('TREE')){L.block[i]=1;L.things.push({t:'tree',x,y,ti:(+t.k.slice(4))%A.treeN,blk:1});}
      else{const b=PROPBLK.has(t.k);if(b)L.block[i]=1;L.things.push({t:'deco',x,y,d:dec(t.k),blk:b?1:0});}}
    else if(t.t==='enemy'&&ETYPE[t.k]){const e=makeEnemy(t.k,x,y,R);e.a=(t.dir||0)*Math.PI/4;const r=t.role||'auto';
      if(!e.boss&&!e.dog&&(r==='hold'||r==='rush'||r==='flank'))e.role=r;
      if(r==='patrol'&&!e.boss)e.patrol=1;
      if(r==='ambush'&&!e.boss){e.ambush=1;e.role=e.dog?'rush':(e.role==='hold'?'rush':e.role);const key='KEY'+(t.key||'Y');let a=L.ambush.find(o=>o.key===key);
        if(!a){a={key,vert:false,open:[],cells:[],enemies:[],face:0};L.ambush.push(a);}a.enemies.push(e);}
      if(e.boss&&!L.boss)L.boss=e;L.enemies.push(e);}}
  if(E.mode==='arena'){let sp=[...E.marks].filter(([i,m])=>m.k==='spawn'&&!map[i]&&!L.block[i]).map(([i])=>i);
    if(!sp.length)for(let i=0;i<W*H;i++)if(!map[i]&&!L.block[i]&&L.dg[i]<0)sp.push(i);
    L.wave={n:0,total:6,pause:2.5,queue:[],spawnT:0,spawns:sp,R,lot:[]};}
  L.sx=E.start.x+.5;L.sy=E.start.y+.5;L.sa=E.start.dir*Math.PI/4;
  L.outdoor=!!E.sky;if(L.outdoor)L.sky=makeSky(77,1.2,E.dawn?0:300,!!E.dawn);
  L.camZ=.5;L.bombs=[];L.pflames=[];L.total=L.enemies.length;L.spiralTotal=0;L.spiral=0;
  applyRules(L,1);L.cashTotal=L.things.filter(t=>SCOREV[t.kind]).length;
  return L;}
// idle patrol: wander near the post until something wakes them
function edPatrol(e,dt){if(e.wait>0){e.wait-=dt;e.moving=0;return;}
  if(!e.wp||Math.hypot(e.wp.x-e.x,e.wp.y-e.y)<.3){e.wp=null;for(let k=0;k<12;k++){const x=Math.floor(e.hx+(rnd()*2-1)*6),y=Math.floor(e.hy+(rnd()*2-1)*6);
      if(x<1||y<1||x>=L.W-1||y>=L.H-1||L.map[y*L.W+x]||L.block[y*L.W+x])continue;if(!hasLOS(e.x,e.y,x+.5,y+.5))continue;e.wp={x:x+.5,y:y+.5};break;}
    if(rnd()<.4)e.wait=1+rnd()*2.5;return;}
  const mx=e.wp.x-e.x,my=e.wp.y-e.y,ml=Math.hypot(mx,my)||1;e.a=Math.atan2(my,mx);if(!moveEnemy(e,mx/ml,my/ml,1.1*dt))e.wp=null;e.moving=1;e.wt+=dt;}

