/* =====================================================================
   KILL RACE 2. THE CITY
   A 4x4 grid of blocks with seven-lane roads between them. Every block has a
   sidewalk ring, then one of: buildings cut by through-alleys, a gas station
   (the pumps blow), a park, a car park full of parked cars (they burn, then
   blow), or the casino. The roads get fuel drums, oil slicks that kill your
   grip, burning barrels and junk.
   Floors use Bagman's per-cell floor map (L.fmap / L.floorsD).
   ===================================================================== */
const F_ROAD=0,F_WALK=1,F_LOT=2,F_PARK=3,F_OIL=4,F_ALLEY=5,F_PARKING=6;
const CITY={N:4,road:7,blk:13};
const GROUND=['STORE','SHOP2','GLASSD','MOTEL1','MOTEL2','CINDER','CINDER2','BOARD2','CNT1','SUB2','SUDS1','CNTY1'];
const UPPER=['WINDOW','WINDOW2','WINDOW','WINDOW2','MOTEL1','CINDER2','SUB1','CNTY1','MOTEL3'];
const PARKED=['sedanR','sedanW','sedanY','pickup'];
const FACADE=['POSTER0','POSTER1','POSTER2','POSTER3','POSTER4','POSTER5','POSTER6','GLASSD','WINDOW','WINDOW2'];
function genCity(seed){
  const R=rng(seed),ri=(a,b)=>a+Math.floor(R()*(b-a+1));
  const {N,road,blk}=CITY,W=1+road+N*(blk+road)+1,H=W;
  const L=baseLevel(1,W,H,0);L.th={t:'KILL RACE',bd:2,ceil:[0,0,0]};
  const map=L.map,up=L.up=new Uint8Array(W*H),fm=L.fmap=new Uint8Array(W*H);
  // Bagman tints floors with a Spectrum ink per chapter; here per surface: blue road, white walk, green park, magenta oil
  L.floorsD=[tintFloor('asphalt',1).d,FLO.concrete.d,tintFloor('checker',2).d,tintFloor('dirt',4).d,tintFloor('wet',3).d,tintFloor('asphalt2',1).d,tintFloor('slab',5).d];L.floor=tintFloor('asphalt',1);
  L.oil=new Uint8Array(W*H);L.parkAt=[];L.fires=[];
  const fence=tex('FENCE')+1;for(let i=0;i<W;i++){map[i]=map[(H-1)*W+i]=map[i*W]=map[i*W+W-1]=fence;}
  const bld=(x0,y0,w,h,g,u)=>{for(let y=y0;y<y0+h;y++)for(let x=x0;x<x0+w;x++){const i=y*W+x;map[i]=tex(g)+1;up[i]=tex(u)+1;}};
  const pick=a=>a[ri(0,a.length-1)];
  const used=new Uint8Array(W*H),deco=(x,y,k,blkd)=>{const i=y*W+x;used[i]=1;if(blkd)L.block[i]=1;L.things.push({t:'deco',x:x+.5,y:y+.5,d:dec(k),blk:blkd?1:0});};
  // block types, shuffled
  const types=['gas','park','parking','casino'];while(types.length<N*N)types.push('build');
  for(let i=types.length-1;i>0;i--){const j=ri(0,i);[types[i],types[j]]=[types[j],types[i]];}
  L.blocks=[];
  for(let by=0;by<N;by++)for(let bx=0;bx<N;bx++){const x0=1+road+bx*(blk+road),y0=1+road+by*(blk+road),ix=x0+1,iy=y0+1,n=blk-2,type=types[by*N+bx];
    L.blocks.push({x0,y0,type});
    for(let y=y0;y<y0+blk;y++)for(let x=x0;x<x0+blk;x++){const edge=x===x0||y===y0||x===x0+blk-1||y===y0+blk-1;fm[y*W+x]=edge?F_WALK:F_ALLEY;}
    if(type==='build'){const m=ri(0,3),a=ri(4,5),b=ri(4,5),B=(x,y,w,h)=>bld(x,y,w,h,pick(GROUND),pick(UPPER));
      if(m===0)B(ix,iy,n,n);
      else if(m===1){B(ix,iy,a,n);B(ix+a+2,iy,n-a-2,n);}
      else if(m===2){B(ix,iy,n,b);B(ix,iy+b+2,n,n-b-2);}
      else{B(ix,iy,a,b);B(ix+a+2,iy,n-a-2,b);B(ix,iy+b+2,a,n-b-2);B(ix+a+2,iy+b+2,n-a-2,n-b-2);}}
    else if(type==='casino')bld(ix,iy,n,n,'CASINO','CASINO2');
    else if(type==='gas'){for(let y=iy;y<iy+n;y++)for(let x=ix;x<ix+n;x++)fm[y*W+x]=F_LOT;bld(ix+3,iy,5,3,'STORE','CINDER2');
      for(const py of[iy+5,iy+8])for(const px of[ix+2,ix+5,ix+8]){addBoom(L,px+.5,py+.5,'PUMP');used[py*W+px]=1;}
      deco(ix,iy+n-1,'LAMP');deco(ix+n-1,iy+n-1,'LAMP');}
    else if(type==='park'){for(let y=iy;y<iy+n;y++)for(let x=ix;x<ix+n;x++)fm[y*W+x]=F_PARK;
      for(let k=0,t=0;k<9&&t<200;t++){const x=ri(ix,ix+n-1),y=ri(iy,iy+n-1),i=y*W+x;if(used[i-1]||used[i+1]||used[i-W]||used[i+W]||used[i])continue;used[i]=1;L.block[i]=1;
        if(k<6)L.things.push({t:'tree',x:x+.5,y:y+.5,ti:ri(0,A.treeN-1),blk:1});else deco(x,y,'JTREE',1);k++;}
      for(let k=0;k<2;k++){const x=ri(ix+2,ix+n-3),y=ri(iy+2,iy+n-3);if(!used[y*W+x]){deco(x,y,'FIRE',1);L.fires.push({x:x+.5,y:y+.5});}}
      for(let k=0;k<4;k++){const x=ri(ix,ix+n-1),y=ri(iy,iy+n-1);if(!used[y*W+x])deco(x,y,pick(['BONES','TIRE','BODY4']));}}
    else if(type==='parking'){for(let y=iy;y<iy+n;y++)for(let x=ix;x<ix+n;x++)fm[y*W+x]=F_PARKING;
      for(const py of[iy+1,iy+4,iy+7])for(const px of[ix+1,ix+4,ix+7]){if(R()<.3)continue;const i=py*W+px;used[i]=used[i+1]=1;L.parkAt.push([px+1,py+.5,R()<.5?0:Math.PI,pick(PARKED)]);}
      for(let k=0;k<2;k++){const x=ri(ix,ix+n-1),y=iy+n-1;if(!used[y*W+x]&&!map[y*W+x]){addBoom(L,x+.5,y+.5,'XDRUM');used[y*W+x]=1;}}}
  }
  // street-level fronts: posters, shop windows and doors on the walls that face a sidewalk
  for(let i=W;i<W*H-W;i++){if(!map[i]||map[i]===fence)continue;const g=A.wallNames[map[i]-1];if(g==='CASINO'||g==='STORE')continue;
    if([i-1,i+1,i-W,i+W].some(j=>!map[j]&&fm[j]===F_WALK)&&R()<.09)map[i]=tex(pick(FACADE))+1;}
  // street lamps along the sidewalks
  for(const b of L.blocks){const {x0,y0}=b;for(let k=2;k<blk-1;k+=5)for(const[x,y]of[[x0+k,y0],[x0+k,y0+blk-1],[x0,y0+k],[x0+blk-1,y0+k]])if(!map[y*W+x]&&!used[y*W+x])deco(x,y,'LAMP');}
  // lists the rest of the game works from
  const inBlock=i=>{const x=i%W,y=(i/W)|0;return L.blocks.some(b=>x>=b.x0&&y>=b.y0&&x<b.x0+blk&&y<b.y0+blk);};
  L.roadCells=[];L.walk=[];for(let i=0;i<W*H;i++){if(map[i]||L.block[i])continue;if(fm[i]===F_WALK)L.walk.push(i);else if(!inBlock(i))L.roadCells.push(i);}
  const free=i=>!map[i]&&!L.block[i]&&!used[i];
  const cx=1+3+2*(blk+road),cy=1+road+1*(blk+road)+6;L.sx=cx+.5;L.sy=cy+.5;L.sa=-Math.PI/2;
  // road hazards
  const roadPick=(minD)=>{for(let t=0;t<60;t++){const i=L.roadCells[ri(0,L.roadCells.length-1)],x=i%W,y=(i/W)|0;
    if(!free(i)||!free(i-1)||!free(i+1)||!free(i-W)||!free(i+W)||Math.hypot(x-L.sx,y-L.sy)<minD)continue;return i;}return -1;};
  for(let k=0;k<18;k++){const i=roadPick(8);if(i>=0){addBoom(L,(i%W)+.5,((i/W)|0)+.5,'XDRUM');used[i]=1;}}
  for(let k=0;k<11;k++){const i=roadPick(4);if(i<0)continue;for(const j of[i,i+1,i+W,i+W+1])if(!map[j]){fm[j]=F_OIL;L.oil[j]=1;}const x=i%W,y=(i/W)|0;used[i]=1;L.things.push({t:'deco',x:x+1,y:y+1,d:dec('PUDDLE')});}
  for(let k=0;k<6;k++){const i=roadPick(8);if(i>=0){deco(i%W,(i/W)|0,'FIRE',1);L.fires.push({x:(i%W)+.5,y:((i/W)|0)+.5});}}
  for(let k=0;k<22;k++){const i=roadPick(3);if(i>=0)deco(i%W,(i/W)|0,pick(['TIRE','TIRE','DEBRIS','BONES']));}
  // cars parked along the curbs, nose to tail with the traffic
  for(let k=0,t=0;k<14&&t<400;t++){const i=L.roadCells[ri(0,L.roadCells.length-1)],x=i%W,y=(i/W)|0;
    const side=[[1,0],[-1,0],[0,1],[0,-1]].find(([ox,oy])=>fm[(y+oy)*W+x+ox]===F_WALK&&!map[(y+oy)*W+x+ox]);if(!side||!free(i)||Math.hypot(x-L.sx,y-L.sy)<6)continue;
    const along=side[0]?Math.PI/2:0;if(!free(i+(side[0]?W:1))||!free(i-(side[0]?W:1)))continue;used[i]=1;L.parkAt.push([x+.5,y+.5,along+(R()<.5?0:Math.PI),pick(PARKED)]);k++;}
  // pickup spots: every intersection, plus the park, the lot and the gas station
  L.spots=[];for(let jy=0;jy<=N;jy++)for(let jx=0;jx<=N;jx++){const x=1+3+jx*(blk+road),y=1+3+jy*(blk+road);if(Math.hypot(x-L.sx,y-L.sy)>3)L.spots.push({x:x+.5,y:y+.5});}
  for(const b of L.blocks)if(b.type!=='build'&&b.type!=='casino'){for(let t=0;t<30;t++){const x=b.x0+ri(2,blk-3),y=b.y0+ri(2,blk-3),i=y*W+x;if(free(i)){used[i]=1;L.spots.push({x:x+.5,y:y+.5});break;}}}
  // cells a car can drive through without scraping a wall
  L.wide=new Uint8Array(W*H);for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){let ok=1;for(let oy=-1;oy<=1&&ok;oy++)for(let ox=-1;ox<=1;ox++){const j=(y+oy)*W+x+ox;if(map[j]||L.block[j]){ok=0;break;}}L.wide[y*W+x]=ok;}
  L.cflow=new Float32Array(W*H);L.cflowT=0;
  L.sky=makeSky(1977,1,420,0);L.outdoor=true;L.camZ=CAM_Z;L.bombs=[];L.pflames=[];L.missiles=[];L.ramps=[];L.booms=[];L.vcars=[];L.peds=[];L.pick=[];
  placeGraffiti(L,R);
  return L;}

// driving distance to the player for every cell. Cells next to a wall cost more, so cars keep to the lanes
const HEAP=[];
function computeCarFlow(){computeFlowFrom(Math.floor(P.y)*L.W+Math.floor(P.x),L.cflow);}
// the same field from any cell into any array: race mode keeps one per checkpoint
function computeFlowFrom(start,f){const W=L.W,n=W*L.H;f.fill(1e9);f[start]=0;HEAP.length=0;
  const push=(c,v)=>{HEAP.push([v,c]);let i=HEAP.length-1;while(i>0){const p=(i-1)>>1;if(HEAP[p][0]<=HEAP[i][0])break;[HEAP[p],HEAP[i]]=[HEAP[i],HEAP[p]];i=p;}};
  const pop=()=>{const top=HEAP[0],last=HEAP.pop();if(HEAP.length){HEAP[0]=last;let i=0;for(;;){const l=i*2+1,r=l+1;let m=i;if(l<HEAP.length&&HEAP[l][0]<HEAP[m][0])m=l;if(r<HEAP.length&&HEAP[r][0]<HEAP[m][0])m=r;if(m===i)break;[HEAP[m],HEAP[i]]=[HEAP[i],HEAP[m]];i=m;}}return top;};
  push(start,0);
  while(HEAP.length){const[v,c]=pop();if(v>f[c])continue;for(const o of[1,-1,W,-W]){const nb=c+o;if(nb<0||nb>=n||L.map[nb]||L.block[nb])continue;const nv=v+(L.wide[nb]?1:5);if(nv<f[nb]){f[nb]=nv;push(nb,nv);}}}}
