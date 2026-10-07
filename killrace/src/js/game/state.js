/* =====================================================================
   KILL RACE 1. STATE
   P is both the camera and the player's car. The Bagman pieces read P for the
   view (x, y, a, dx, dy, px, py, fov) and as the thing to shoot at (mvx, mvy),
   and L for the level. RULES is Bagman's modifier object; Kill Race runs with
   none of them on.
   ===================================================================== */
const RULES={};
const WH=3;                 // building height in wall units: storefront plus two floors
const CAM_Z=.55;            // driver's eye height
let state='title',deathT=0,overT=0,borderFlash=0,borderFlashIdx=0;
const P={x:0,y:0,a:0,dx:1,dy:0,px:0,py:.66,fov:.66,mvx:0,mvy:0,vx:0,vy:0,r:.55,
  hp:100,maxHp:100,armor:0,lock:null,lockLost:0,hurt:0,flash:0,dead:0,berserk:0,slow:0,flame:0,
  w:0,has:[1,0,0],s:0,d:0,drums:0,nitro:100,boosting:0,cool:0,anim:null,recoil:0,
  score:0,chain:0,chainT:0,kills:0,peds:0,foot:0,K:null,steer:0,shake:0,bump:0,skid:0,lastW:0};
function setDir(){P.dx=Math.cos(P.a);P.dy=Math.sin(P.a);P.px=-P.dy*P.fov;P.py=P.dx*P.fov;}

// messages: one big centre line, a feed of three small lines, a combo shout
let msgs=[],big={t:'',time:0,c:C_Y},combo={t:'',time:0,n:0};
function bigMsg(t,d=2,c=C_Y){big={t,time:d,c};}
function feed(t,c=C_W){msgs.unshift({t,time:2.4,c});if(msgs.length>3)msgs.length=3;}
const money=v=>'$'+Math.round(v).toLocaleString('en-US');

// best run, kept between sessions
let BEST={score:0,wave:0};try{Object.assign(BEST,JSON.parse(localStorage.getItem('killrace.best')||'{}'));}catch(e){}
function saveBest(){try{localStorage.setItem('killrace.best',JSON.stringify(BEST));}catch(e){}}

// kills inside three seconds of each other chain. Every kill pays its base value times the chain;
// every seventh link in a chain buys a few seconds of slo-mo
function chainKill(){P.chain=P.chainT>0?P.chain+1:1;P.chainT=3;
  const tier=COMBO.find(c=>c[0]===P.chain)||(P.chain>20&&P.chain%5===0?[P.chain,'KILL MORE X'+P.chain+'!!!!']:null);
  if(tier){combo={t:tier[1],time:1.6,n:P.chain};SFX.combo(P.chain);CRT.boom=Math.max(CRT.boom,P.chain>=10?.45:.2);shake=Math.max(shake,.3);}
  else if(P.chain>=2)SFX.chain(P.chain);
  if(P.chain%7===0){P.slow=Math.max(0,P.slow)+5;feed('SLO-MO +5',C_C);}
  return Math.max(1,P.chain);}
