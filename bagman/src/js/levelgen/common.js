/* =====================================================================
   8. LEVEL GENERATION
   ===================================================================== */
const SKYW=1400,SKYH=80;
function makeSky(seed,ridge,moon,dawn){const R=rng(seed);const s=new Uint8ClampedArray(SKYW*SKYH*3);
  const h=[];for(let x=0;x<SKYW;x++){const a=x/SKYW*TAU;h[x]=SKYH-14-ridge*(Math.sin(a*3+1)*.5+Math.sin(a*7+2)*.3+Math.sin(a*17)*.12+.8)*8;}
  for(let y=0;y<SKYH;y++)for(let x=0;x<SKYW;x++){const i=(y*SKYW+x)*3;let c=[0,0,Math.round(20+y/SKYH*110)];
    if(y>SKYH-26)c=[Math.round((y-SKYH+26)*2.4),0,Math.round(70+(y-SKYH+26))];
    if(dawn){const k=y/SKYH;c=k<.45?[0,0,Math.round(60+k*200)]:[Math.round(120+(k-.45)*240),Math.round(40+(k-.45)*220),Math.round(140-(k-.45)*220)];}
    if(!dawn&&R()<.0025&&y<SKYH-22)c=[230,230,230];
    if(y>h[x])c=y>h[x]+2?[0,0,0]:[40,20,60];
    s[i]=c[0];s[i+1]=c[1];s[i+2]=c[2];}
  if(moon){const mx=moon,my=16;for(let y=my-8;y<=my+8;y++)for(let x=mx-8;x<=mx+8;x++){const d=(x-mx)**2+(y-my)**2;if(d<=64){const i=(y*SKYW+x)*3;s[i]=240;s[i+1]=240;s[i+2]=220;}}}
  return s;}
let L=null;
function baseLevel(n,W,H,fill){return{n,th:CH[n-1],W,H,map:new Uint8Array(W*H).fill(fill),dg:new Int16Array(W*H).fill(-1),room:new Int16Array(W*H).fill(-1),
  doors:[],things:[],enemies:[],block:new Uint8Array(W*H),boss:null,sw:null,flow:new Int16Array(W*H).fill(-1),flowCell:-1,
  kills:0,total:0,cash:0,cashTotal:0,score0:0,kilo:false,time:0,shots:[],stain:new Uint8Array(W*16*H*16),wstain:new Map(),wave:null,
  secretAt:new Map(),secrets:0,secretsFound:0,fuses:[],seen:new Uint8Array(W*H),walked:new Uint8Array(W*H)};}
function bfsFrom(L,sx,sy,blocked){const W=L.W,d=new Int16Array(W*L.H).fill(-1);const s=sy*W+sx;const q=[s];d[s]=0;const bl=blocked instanceof Set?blocked:new Set(blocked>=0?[blocked]:[]);
  for(let h=0;h<q.length;h++){const c=q[h];for(const o of[1,-1,W,-W]){const nb=c+o;if(d[nb]>=0||L.map[nb]||L.block[nb]||bl.has(nb))continue;d[nb]=d[c]+1;q.push(nb);}}return d;}
let DCAN=-1;
function addItem(L,kind,x,y){L.things.push({t:'item',kind,x,y,d:dec(kind)});}
function addBoom(L,x,y,kind){const i=Math.floor(y)*L.W+Math.floor(x);L.block[i]=1;L.things.push({t:'deco',x,y,d:dec(kind),blk:1,boom:kind==='PUMP'?2:1,hp:kind==='PUMP'?30:16,cell:i,name:kind==='PUMP'?'PUMP':'FUEL'});}
function scoreKind(R){let s=R()*100,a=0;for(let i=0;i<SCOREK.length;i++){a+=SCOREW[i];if(s<a)return SCOREK[i];}return'ROLL';}
function ammoKind(R,n){const s=R();if(n>=5&&s>.93)return'DYNAMITE';return n>=2&&s<.3?'SHELLS':(n>=7&&s<.55?'DRUM':(s<.75?'BOX':'CLIP'));}
const ROLES={thug:[.55,.2,.25],cop:[.35,.35,.3],enf:[.3,.5,.2],torch:[0,1,0],heavy:[.45,.35,.2]};
function pickRole(type,R){if(type==='dog')return'rush';const w=ROLES[type];if(!w)return'boss';const r=R();return r<w[0]?'rush':r<w[0]+w[1]?'hold':'flank';}
function makeEnemy(type,x,y,R){const e=makeEnemy0(type,x,y,R);if(RULES.donuts)e.hp*=1.3;e.hp0=e.hp;if(RULES.aggr&&!e.boss){if(e.role==='hold'&&R()<.6)e.role='rush';e.pref*=.75;}return e;}
function makeEnemy0(type,x,y,R){const T=ETYPE[type];return{type,T,x,y,a:R()*TAU,hp:T.hp,st:'idle',t:0,cd:1+R()*1.5,fr:0,los:0,lt:R()*.3,sc:T.sc,burst:0,shotDmg:0,
  role:pickRole(type,R),pref:type==='torch'?6+R()*1.5:6+R()*5,noLos:0,react:0,hx:x,hy:y,
  name:T.boss||(T.dog?DOGN[Math.floor(R()*DOGN.length)]:LIZ[Math.floor(R()*LIZ.length)]),strafe:0,sd:R()<.5?1:-1,boss:!!T.boss,dog:!!T.dog,wt:0,moving:0};}
function pickMix(mix,R){const ks=Object.keys(mix);let tot=0;for(const k of ks)tot+=mix[k];let s=R()*tot,a=0;for(const k of ks){a+=mix[k];if(s<=a)return k;}return ks[0];}

