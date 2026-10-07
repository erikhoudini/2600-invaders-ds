/* =====================================================================
   KILL RACE 9. PICKUPS
   Arena-shooter rules: every intersection and every open lot holds something,
   and it comes back after a while. All of them are Bagman item sprites.
   ===================================================================== */
const PICKS={
  GUNSHOT:{t:20,msg:'PUMP 12',c:C_W,go:()=>{const first=!P.has[1];P.has[1]=1;P.s=Math.min(40,P.s+12);if(first&&!(P.flame>0)){P.lastW=P.w;P.w=1;}return true;}},
  SHELLS: {t:20,msg:'SHELLS +8',c:C_W,go:()=>{if(P.s>=40)return false;P.has[1]=1;P.s=Math.min(40,P.s+8);return true;}},
  DYNAMITE:{t:20,msg:'DYNAMITE +4',c:C_R,go:()=>{if(P.d>=16)return false;const first=!P.has[2];P.has[2]=1;P.d=Math.min(16,P.d+4);if(first)feed('3 OR Q FOR DYNAMITE',C_GR);return true;}},
  CLIP:   {t:25,msg:'ROCKETS +4',c:C_R,go:()=>{if(P.m>=12)return false;const first=!P.has[3];P.has[3]=1;P.m=Math.min(12,P.m+4);if(first)feed('4 OR Q FOR ROCKETS. LOCK ON FIRST',C_GR);return true;}},
  DRUMCAN:{t:25,msg:'FUEL DRUMS +2. B DROPS ONE',c:C_Y,go:()=>{if(P.drums>=6)return false;P.drums=Math.min(6,P.drums+2);return true;}},
  MEDKIT: {t:20,msg:'REPAIR +30',c:C_G,go:()=>{if(P.hp>=P.maxHp)return false;P.hp=Math.min(P.maxHp,P.hp+30);return true;}},
  BOTTLE: {t:15,msg:'REPAIR +12',c:C_G,go:()=>{if(P.hp>=P.maxHp)return false;P.hp=Math.min(P.maxHp,P.hp+12);return true;}},
  FULLHP: {t:45,msg:'FULL REPAIR',c:C_G,big:1,go:()=>{if(P.hp>=P.maxHp)return false;P.hp=P.maxHp;return true;}},
  VEST:   {t:25,msg:'ARMOR 50',c:C_B,go:()=>{if(P.armor>=50)return false;P.armor=50;return true;}},
  KEVLAR: {t:40,msg:'HEAVY ARMOR',c:C_B,big:1,go:()=>{if(P.armor>=100)return false;P.armor=100;return true;}},
  BERSERK:{t:45,msg:'RAMPAGE',c:C_R,big:1,go:()=>{P.berserk=Math.max(0,P.berserk)+15;CRT.boom=.6;shake=.8;feed('RAMS HIT 2X HARDER. NO CRASH DAMAGE',C_R);return true;}},
  DEADEYE:{t:45,msg:'SLO-MO',c:C_C,big:1,go:()=>{P.slow=Math.max(0,P.slow)+10;CRT.boom=.4;return true;}},
  FLAMER: {t:40,msg:'FLAMER',c:C_Y,big:1,go:()=>{P.flame=Math.max(0,P.flame)+15;CRT.boom=.4;return true;}},
  CASH:   {t:20,msg:'+$500',c:C_C,score:500},PACKAGE:{t:30,msg:'+$1,000',c:C_C,score:1000},KILO:{t:60,msg:'A KILO +$2,500',c:C_Y,score:2500}};
const SPOT_MIX=['CLIP','CLIP','CLIP','GUNSHOT','GUNSHOT','SHELLS','SHELLS','DYNAMITE','DYNAMITE','DYNAMITE','DRUMCAN','DRUMCAN','DRUMCAN','MEDKIT','MEDKIT','MEDKIT','MEDKIT','BOTTLE','BOTTLE',
  'FULLHP','VEST','VEST','KEVLAR','BERSERK','DEADEYE','FLAMER','FLAMER','CASH','CASH','PACKAGE','PACKAGE','KILO'];
function setupPickups(R){L.pick=[];const kinds=SPOT_MIX.slice();
  for(let i=kinds.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[kinds[i],kinds[j]]=[kinds[j],kinds[i]];}
  L.spots.forEach((s,k)=>{const sp={x:s.x,y:s.y,kind:kinds[k%kinds.length],t:0,item:null};L.pick.push(sp);placePick(sp);});}
function placePick(sp){sp.item={t:'item',kind:sp.kind,x:sp.x,y:sp.y,d:dec(sp.kind),spot:sp};L.things.push(sp.item);}
function lootDrop(x,y){const k=['SHELLS','DYNAMITE','MEDKIT','BOTTLE','CASH','DRUMCAN','CLIP'][Math.floor(rnd()*7)];L.things.push({t:'item',kind:k,x,y,d:dec(k),drop:1});}
function updPickups(dt){
  for(const sp of L.pick)if(!sp.item){sp.t-=dt;if(sp.t<=0)placePick(sp);}
  if(P.dead)return;
  for(let i=L.things.length-1;i>=0;i--){const it=L.things[i];if(it.t!=='item'||Math.hypot(it.x-P.x,it.y-P.y)>.95)continue;
    const D=PICKS[it.kind];if(!D)continue;
    if(D.score){P.score+=D.score;SFX.cash();feed(D.msg,D.c);}
    else{if(!D.go())continue;if(D.big){bigMsg(D.msg,1.8,D.c);SFX.power();}else{feed(D.msg,D.c);it.kind==='MEDKIT'||it.kind==='BOTTLE'||it.kind==='FULLHP'?SFX.medkit():SFX.pick();}}
    L.things.splice(i,1);if(it.spot){it.spot.item=null;it.spot.t=D.t;}}}
