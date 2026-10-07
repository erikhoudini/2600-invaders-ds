function genLevel(n){if(EDL&&(GM==='edit'||GM==='custom'||(GM==='arena'&&ARENAMAP==='custom')))return edBuild(EDL);const th=CH[n-1];
  if(n===2&&GM==='arena'&&ARENAMAP!=='gas')return genArena(ARENAMAP);
  if(th.mode==='rails')return{n,th,rails:1,kills:0,total:0,cash:0,kilo:true,time:0,secrets:0,secretsFound:0,score0:0,shots:[]};
  const L=th.mode==='maze'?genMaze(n):th.mode==='sniper'?genSniper(n):th.mode==='train'?genTrain(n):genYard(n);
  L.camZ=L.camZ||.5;L.bombs=[];L.pflames=[];if(th.fl2)L.floor2=tintFloor(th.fl2,6);L.total=L.enemies.length;L.floor=th.fi!=null?tintFloor(th.fl,th.fi):FLO[th.fl];
  if(L.outdoor)L.sky=makeSky(n*13,th.mode==='waves'?.6:1.2,th.dawn?0:(th.mode==='waves'?900:300),th.dawn);
  if(!L.rails&&!L.sniper){const R=rng(n*9001+5),W=L.W;
    // rank floor by walking distance from the start so the good stuff sits deep in the chapter
    const d=new Int32Array(W*L.H).fill(-1),q=[Math.floor(L.sy)*W+Math.floor(L.sx)];d[q[0]]=0;
    for(let h=0;h<q.length;h++){const c=q[h];for(const o of[1,-1,W,-W]){const nb=c+o;if(nb<0||nb>=d.length||d[nb]>=0||L.map[nb]&&!L.secretAt.has(nb)&&!(L.ambush&&L.ambush.some(a=>a.open.some(c=>c.i===nb)))||L.block[nb]||(L.void&&L.void[nb]))continue;d[nb]=d[c]+1;q.push(nb);}}
    const occ=new Set(L.things.map(t=>Math.floor(t.y)*W+Math.floor(t.x)));let far=0;for(const v of d)far=Math.max(far,v);
    const deep=[];for(let i=0;i<d.length;i++)if(d[i]>=far*.35&&!L.map[i]&&L.dg[i]<0&&L.room[i]!==99&&!occ.has(i))deep.push(i);
    const take=()=>{for(let t=0;t<200&&deep.length;t++){const j=Math.floor(R()*deep.length),i=deep[j];deep.splice(j,1);if(occ.has(i))continue;occ.add(i);return i;}return -1;};
    if(n>=10&&!L.wave){for(let k=0;k<(n>=13?2:1);k++){const i=take();if(i>=0)addItem(L,'FLAMER',(i%W)+.5,((i/W)|0)+.5);}}
    if(n>1&&!L.wave){const na=RULES.bag?(n%4===0?1:0):(n>=10?2:n>=3?1:0);for(let k=0;k<na;k++){const i=take();if(i>=0)addItem(L,k===1?'KEVLAR':'VEST',(i%W)+.5,((i/W)|0)+.5);}}
    const want=SPN[n]||0;L.spiralTotal=want;L.spiral=0;
    // out of the way: the closets the ambushers came out of, dead ends, the far corners of rooms. never two close together
    const solidAt=i=>(L.map[i]&&!L.secretAt.has(i))||L.block[i]||(L.void&&L.void[i]);const amb=new Set();if(L.ambush)for(const a of L.ambush)for(const c of a.cells)amb.add(c);
    const nooks=[];for(let i=W;i<d.length-W;i++){if(d[i]<far*.22||L.map[i]||L.dg[i]>=0||occ.has(i)||L.room[i]===99)continue;
      const h=(solidAt(i-1)?1:0)+(solidAt(i+1)?1:0),v=(solidAt(i-W)?1:0)+(solidAt(i+W)?1:0);let sc=-1;
      if(amb.has(i))sc=3;else if(h+v>=3)sc=2.4;else if(h===1&&v===1)sc=L.room[i]>=0?1.8:.6;else continue;nooks.push([i,sc+R()*1.2]);}
    nooks.sort((a,b)=>b[1]-a[1]);const placed=[];
    const takeNook=()=>{for(const[i]of nooks){if(occ.has(i))continue;if(placed.some(p=>Math.abs(p%W-i%W)+Math.abs(((p/W)|0)-((i/W)|0))<10))continue;occ.add(i);placed.push(i);return i;}return take();};
    const losL=(x,y)=>{const dx=x-L.sx,dy=y-L.sy,n=Math.ceil(Math.hypot(dx,dy)*4);for(let k=1;k<n;k++){const j=Math.floor(L.sy+dy*k/n)*W+Math.floor(L.sx+dx*k/n);if(L.map[j]||L.block[j])return false;}return true;};
    const takeFirst=()=>{const c=[];for(let i=0;i<d.length;i++)if(d[i]>=3&&d[i]<=6&&!L.map[i]&&L.dg[i]<0&&!occ.has(i)&&losL((i%W)+.5,((i/W)|0)+.5))c.push(i);if(!c.length)return takeNook();const i=c[Math.floor(R()*c.length)];occ.add(i);placed.push(i);return i;};
    for(let k=0;k<want;k++){const i=n===1&&k===0?takeFirst():takeNook();if(i<0)break;const id=n+'-'+k;if(SPIR[id]){L.spiral++;continue;}const it={t:'item',kind:'SPIRAL',x:(i%W)+.5,y:((i/W)|0)+.5,d:dec('SPIRAL'),sid:id};L.things.push(it);}}
  if(!L.rails)applyRules(L,n);
  if(!L.rails&&!L.sniper&&!L.train)placeGraffiti(L,rng(n*313+9));
  L.cashTotal=L.things.filter(t=>SCOREV[t.kind]).length;
  return L;}
// difficulty and modifiers that change what is in a level
function applyRules(L,n){const R=rng(n*7771+3),W=L.W;
  L.things=L.things.filter(t=>{if(t.t!=='item')return true;if(HEALK.has(t.kind)){if(RULES.nola)return false;if(RULES.hp<1&&R()>RULES.hp)return false;}
    if(RULES.knuckle&&AMMOK.has(t.kind)&&R()<.5)return false;if(RULES.bag&&L.wave&&t.kind==='VEST')return false;return true;});
  const dist=new Int32Array(W*L.H).fill(-1),q=[Math.floor(L.sy)*W+Math.floor(L.sx)];dist[q[0]]=0;
  for(let h=0;h<q.length;h++){const c=q[h];for(const o of[1,-1,W,-W]){const nb=c+o;if(nb<0||nb>=dist.length||dist[nb]>=0||L.map[nb]||L.block[nb]||(L.void&&L.void[nb]))continue;dist[nb]=dist[c]+1;q.push(nb);}}
  const taken=new Set(L.enemies.map(e=>Math.floor(e.y)*W+Math.floor(e.x)));
  const freeNear=(x,y)=>{for(const[ox,oy]of[[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]]){const i=Math.floor(y+oy)*W+Math.floor(x+ox);if(i<0||i>=dist.length||taken.has(i))continue;
      const amb=L.ambush&&L.ambush.some(a=>a.cells.includes(i));if(dist[i]<0&&!amb)continue;if(L.map[i]||L.block[i])continue;taken.add(i);return i;}return -1;};
  const far=q.filter(i=>dist[i]>=9&&L.room[i]!==99);
  const pickFar=()=>{for(let t=0;t<50&&far.length;t++){const j=Math.floor(R()*far.length),i=far[j];far.splice(j,1);if(!taken.has(i)){taken.add(i);return i;}}return -1;};
  const add=(type,i,base)=>{const e=makeEnemy(type,(i%W)+.5,((i/W)|0)+.5,R);if(base){e.ambush=base.ambush;e.role=base.role;e.a=base.a;if(base.guard){e.guard=1;e.wp=null;e.wait=R()*3;}
      if(base.ambush&&L.ambush)for(const a of L.ambush)if(a.enemies.includes(base)){a.enemies.push(e);break;}}L.enemies.push(e);return e;};
  if(RULES.bag)for(const e of L.enemies){if(e.boss||e.dog||e.guard)continue;const t=bagUp(e.type,R(),n);if(t!==e.type)retype(e,t,R);}
  if(!L.wave&&n>=3&&GM!=='arena'){for(let k=0;k<(n<7?1:2)+(RULES.bag?1:0);k++){const i=pickFar();if(i>=0)add('heavy',i);}}
  if(n>=11&&GM!=='arena'){const am=L.things.filter(t=>t.t==='item'&&AMMOK.has(t.kind));for(let k=0;k<Math.round(am.length*.2);k++){const a=am[Math.floor(R()*am.length)];const i=freeNear(a.x,a.y);if(i>=0)addItem(L,a.kind,(i%W)+.5,((i/W)|0)+.5);}}
  if(RULES.army)for(const e of L.enemies.slice()){if(e.boss)continue;const i=freeNear(e.x,e.y);if(i>=0)add(e.type,i,e);}
  if(RULES.pipe&&!L.wave)for(let k=0;k<16;k++){const i=pickFar();if(i>=0)add('torch',i);}
  if(RULES.glyc)for(const e of L.enemies)if(!e.boss&&!e.dog&&e.type!=='torch'&&R()<.16)e.dyn=1;
  if(RULES.wanted&&!L.wave){let b=null,bd=-1;for(const e of L.enemies){if(e.boss||e.dog||e.ambush)continue;const d=dist[Math.floor(e.y)*W+Math.floor(e.x)];if(d>bd){bd=d;b=e;}}if(b)markWanted(b);}
  L.total=L.enemies.length;}
// spray paint on plain walls, keyed by wall cell and the face it is seen from (0 west, 1 east, 2 north, 3 south)
function placeGraffiti(L,R){const W=L.W,H=L.H,map=L.map;L.graf=new Map();if(!GRAF)return;
  const no=new Set(['SWITCH','SWITCHON','ELEV','LOCKED','LOCKEDR','DOOR','GLASSD','CARR','CARB','CARW','RV','WINDOW','WINDOW2','REEFER','FRAMED0','FRAMED1','FRAMED2','FRAMED3','POSTER0','POSTER1','POSTER2','POSTER3','POSTER4','POSTER5','POSTER6','SHOP1'].map(t=>tex(t)+1));
  const want=Math.round(W*H/(L.outdoor?150:85));const FACES=[[-1,0,0],[1,0,1],[0,-1,2],[0,1,3]];
  for(let t=0;t<want*8&&L.graf.size<want;t++){const x=1+Math.floor(R()*(W-2)),y=1+Math.floor(R()*(H-2)),i=y*W+x;
    if(!map[i]||no.has(map[i])||L.dg[i]>=0||L.secretAt.has(i)||(L.carAt&&L.carAt.has(i)))continue;
    const op=FACES.filter(([dx,dy])=>{const j=(y+dy)*W+x+dx;return !map[j]&&L.dg[j]<0&&!(L.void&&L.void[j]);});if(!op.length)continue;
    const f=op[Math.floor(R()*op.length)];
    if(L.graf.has((i-1)*4+f[2])||L.graf.has((i+1)*4+f[2])||L.graf.has((i-W)*4+f[2])||L.graf.has((i+W)*4+f[2]))continue;
    L.graf.set(i*4+f[2],Math.floor(R()*A.grafN));}}

