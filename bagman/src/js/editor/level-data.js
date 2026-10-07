/* ---------- level data ---------- */
function edNew(W,H){const wall=tex('CINDER')+1;const w=new Uint16Array(W*H);
  for(let x=0;x<W;x++){w[x]=wall;w[(H-1)*W+x]=wall;}for(let y=0;y<H;y++){w[y*W]=wall;w[y*W+W-1]=wall;}
  return{name:'UNTITLED',W,H,mode:'level',sky:0,dawn:0,ceil:7,border:1,kit:0,walls:w,floors:[{fl:'concrete',fi:0}],fmap:new Uint8Array(W*H),marks:new Map(),things:new Map(),start:{x:W>>1,y:H>>1,dir:6}};}
function edSerialize(){const used=new Set();for(let i=0;i<E.walls.length;i++)if(E.walls[i])used.add(E.walls[i]-1);
  const wallSet=[...used].sort((a,b)=>a-b),wIdx=new Map(wallSet.map((t,k)=>[t,k+1]));
  const fUsed=[...new Set(E.fmap)].sort((a,b)=>a-b),fIdx=new Map(fUsed.map((f,k)=>[f,k]));
  return{fmt:'bagman-level',v:1,name:E.name,W:E.W,H:E.H,mode:E.mode,sky:E.sky,dawn:E.dawn,ceil:E.ceil,border:E.border,kit:E.kit,
    wallSet:wallSet.map(t=>A.wallNames[t]),walls:Array.from(E.walls,v=>v?wIdx.get(v-1):0),
    floors:fUsed.map(f=>({fl:E.floors[f].fl,fi:E.floors[f].fi})),fmap:Array.from(E.fmap,f=>fIdx.get(f)),
    marks:[...E.marks].map(([i,m])=>Object.assign({x:i%E.W,y:(i/E.W)|0},m)),
    things:[...E.things].map(([i,t])=>Object.assign({x:i%E.W,y:(i/E.W)|0},t)),start:Object.assign({},E.start)};}
function edParse(o){if(!o||o.fmt!=='bagman-level')throw new Error('NOT A BAGMAN LEVEL FILE.');
  const W=clamp(o.W|0,8,64),H=clamp(o.H|0,8,64),n=W*H;const L0=edNew(W,H);L0.walls.fill(0);
  Object.assign(L0,{name:String(o.name||'UNTITLED').slice(0,24),mode:o.mode==='arena'?'arena':'level',sky:o.sky?1:0,dawn:o.dawn?1:0,ceil:clamp(o.ceil|0,0,7),border:clamp(o.border|0,0,7),kit:clamp(o.kit|0,0,2)});
  const ws=(o.wallSet||[]).map(nm=>{const t=A.wallNames.indexOf(nm);return t<0?tex('CINDER'):t;});
  for(let i=0;i<n;i++){const v=(o.walls||[])[i]|0;L0.walls[i]=v&&ws[v-1]!=null?ws[v-1]+1:0;}
  L0.floors=(o.floors||[]).filter(f=>FLO[f.fl]).map(f=>({fl:f.fl,fi:clamp(f.fi|0,0,7)}));if(!L0.floors.length)L0.floors=[{fl:'concrete',fi:0}];
  for(let i=0;i<n;i++)L0.fmap[i]=Math.min(L0.floors.length-1,(o.fmap||[])[i]|0);
  const okXY=(x,y)=>x>=0&&y>=0&&x<W&&y<H;
  for(const m of o.marks||[])if(okXY(m.x,m.y)){const c=Object.assign({},m);delete c.x;delete c.y;L0.marks.set(m.y*W+m.x,c);}
  for(const t of o.things||[])if(okXY(t.x,t.y)){const c=Object.assign({},t);delete c.x;delete c.y;L0.things.set(t.y*W+t.x,c);}
  if(o.start&&okXY(o.start.x,o.start.y))L0.start={x:o.start.x|0,y:o.start.y|0,dir:(o.start.dir|0)&7};
  return L0;}
function edSnap(){ES.undo.push(JSON.stringify(edSerialize()));if(ES.undo.length>120)ES.undo.shift();ES.redo.length=0;ES.dirty=true;}
function edUndo(){if(!ES.undo.length){edToast('NOTHING TO UNDO.');return;}ES.redo.push(JSON.stringify(edSerialize()));E=edParse(JSON.parse(ES.undo.pop()));ES.sel=-1;ES.dirty=true;play('menu',.3,.9);}
function edRedo(){if(!ES.redo.length){edToast('NOTHING TO REDO.');return;}ES.undo.push(JSON.stringify(edSerialize()));E=edParse(JSON.parse(ES.redo.pop()));ES.sel=-1;ES.dirty=true;play('menu',.3,1.1);}
function edResize(W,H){const O=E,N=edNew(W,H);N.walls.fill(0);
  for(const k of['name','mode','sky','dawn','ceil','border','kit'])N[k]=O[k];N.floors=O.floors;
  for(let y=0;y<Math.min(H,O.H);y++)for(let x=0;x<Math.min(W,O.W);x++){N.walls[y*W+x]=O.walls[y*O.W+x];N.fmap[y*W+x]=O.fmap[y*O.W+x];}
  for(const[i,m]of O.marks){const x=i%O.W,y=(i/O.W)|0;if(x<W&&y<H)N.marks.set(y*W+x,m);}
  for(const[i,t]of O.things){const x=i%O.W,y=(i/O.W)|0;if(x<W&&y<H)N.things.set(y*W+x,t);}
  N.start={x:Math.min(O.start.x,W-1),y:Math.min(O.start.y,H-1),dir:O.start.dir};E=N;ES.sel=-1;}

