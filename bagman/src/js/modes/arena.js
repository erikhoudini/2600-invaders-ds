// prices before hikes. ammo goes on sale, health dries up
const SHOP=[
 ['rounds','ROUNDS +50',900,()=>P.b<300,()=>{P.b=Math.min(300,P.b+50);},'ammo'],
 ['shells','SHELLS +10',900,()=>P.has[2]&&P.s<60,()=>{P.s=Math.min(60,P.s+10);},'ammo'],
 ['dyn','DYNAMITE X4',2400,()=>(P.d||0)<20,()=>{P.has[4]=1;P.d=Math.min(20,(P.d||0)+4);},'ammo'],
 ['drum','FUEL DRUM TO PLACE',1200,()=>(P.drums||0)<6,()=>{P.drums=(P.drums||0)+1;},'ammo'],
 ['pills','PILLS +5 HEALTH',600,()=>P.hp<P.maxHp,()=>{P.hp=Math.min(P.maxHp,P.hp+5);},'heal'],
 ['aid','FIRST AID +25',1600,()=>P.hp<P.maxHp,()=>{P.hp=Math.min(P.maxHp,P.hp+25);},'heal'],
 ['full','FULL HEALTH',3000,()=>P.hp<P.maxHp,()=>{P.hp=P.maxHp;},'heal'],
 ['vest','VEST, 100 ARMOR',2500,()=>P.armor<100,()=>{P.armor=100;P.acls=.33;}],
 ['heavy','HEAVY ARMOR, 200',5000,()=>P.armor<200,()=>{P.armor=200;P.acls=.5;}],
 ['pump','PUMP 12',5000,()=>!P.has[2],()=>{P.has[2]=1;P.s=Math.max(P.s,16);}],
 ['ak','AK-47',9000,()=>!P.has[3],()=>{P.has[3]=1;P.b=Math.max(P.b,100);}]];
const SPECIALS=[['BERSERK','BERSERK'],['DEADEYE','SLO-MO'],['FLAMER','FLAMETHROWER']];
function arenaStart(mod,map){GM='arena';DIFF='normal';ARENAMOD=!!mod;ARENAMAP=map||ARENAMAP||'gas';WAVEMODS=[];startLevel(2,ARENAMAP==='custom'&&CUSTOM&&CUSTOM.snap?Object.assign({},CUSTOM.snap):{hp:100,armor:0,b:40,s:0,d:0,has:[1,1,0,0,0],w:1,score:0},'arena');
  if(!L.custom){L.things=L.things.filter(t=>t.t!=='item');L.enemies=[];L.total=0;}L.cashTotal=0;L.arena=1;L.modArena=ARENAMOD;L.spiralTotal=0;P.cash=600;P.drums=0;P.special=null;
  const w=L.wave;w.total=1e9;w.n=0;w.pause=2.5;w.mult=1;w.nextHike=4+Math.floor(rnd()*4);w.jp=0;w.shop='normal';if(L.doors[0]&&!L.custom)L.doors[0].lock='W';state='intro';introStart(true,resumePlay);}
function arenaWave(w){w.n++;w.pause=0;w.jp=0;const n=w.n;
  if(L.modArena){const pool=MODLIST.map(m=>m[0]).filter(k=>!ARENA_SKIP.has(k));WAVEMODS=[];while(WAVEMODS.length<(n%3===0?3:1)){const k=pool[Math.floor(rnd()*pool.length)];if(!WAVEMODS.includes(k))WAVEMODS.push(k);}
    computeRules();P.maxHp=RULES.dope?50:100;P.hp=Math.min(P.hp,P.maxHp);if(RULES.david)P.s=Math.min(P.s,16);feed(WAVEMODS.map(k=>MODN[k]).join(' + '),C_C);}
  if(n%5===0){const k=n/5-1,type=['gila','iguana','komodo'][k%3];const sp=w.spawns[Math.floor(w.R()*w.spawns.length)];
    const b=makeEnemy(type,(sp%L.W)+.5,((sp/L.W)|0)+.5,w.R);b.st='chase';if(k>=3){b.name=LIZ[Math.floor(w.R()*LIZ.length)];b.hp=b.T.hp*(1+.4*(k-2));b.hpMax=b.hp;}
    L.enemies.push(b);L.total++;L.boss=b;bigMsg('WAVE '+n+': '+(k>=3?b.name:b.T.boss),2.6,C_R);SFX.horn();}
  else bigMsg('WAVE '+n,2.2,C_Y);
  const cnt=(Math.min(90,Math.round(6+n*3.8))-(n%5===0?Math.floor(n/2):0))*(RULES.army?2:1);
  for(let k=0;k<cnt;k++){const r=w.R();w.queue.push(n>=3&&r<.1?'heavy':n>=6&&r<.17?'torch':n>=4&&r<.33?'enf':n>=3&&r<.45?'dog':n>=2&&r<.68?'cop':'thug');}
  if(RULES.pipe)for(let k=0;k<6;k++)w.queue.splice(Math.floor(w.R()*w.queue.length),0,'torch');if(RULES.wanted)w.wantedNext=1;
  if(P.special){const k=P.special;P.special=null;pickup(k);}
  SFX.wave();if(n>10)ach('arena10');}
// what the shop is doing this time round
function arenaShopRoll(w){w.dealt=0;if(w.n>=w.nextHike){w.mult=Math.round(w.mult*1.25*100)/100;w.nextHike=w.n+4+Math.floor(rnd()*4);w.shop='hike';w.spec=null;return;}
  const r=rnd();w.spec=null;
  if(w.n>=3&&w.shop!=='closed'&&r<.08)w.shop='closed';else if(w.n>=2&&r<.2)w.shop='drought';else if(r<.35)w.shop='sale';else if(w.n>=2&&r<.53&&!P.special){w.shop='special';w.spec=SPECIALS[Math.floor(rnd()*SPECIALS.length)];}else w.shop='normal';}
const SHOPMSG={normal:'',hike:'THE INVISIBLE HAND OF THE MARKET MOVES IN MYSTERIOUS WAYS.',closed:'CLOSED TODAY.',drought:'IT\'S A DROUGHT, NO PILLS.',sale:'BLAST EM! AMMO FIRE SALE',special:'GOT SOMETHING SPECIAL FOR YA.'};
const shopPrice=(it,w)=>Math.round(it[2]*w.mult*(w.shop==='sale'&&it[5]==='ammo'?.5:1)/50)*50;
function showShop(){const w=L.wave;if(!PAUSED)snapPause();PAUSED=true;const st=w.shop;
  const items=SHOP.map(it=>({label:it[1],val:()=>(st==='sale'&&it[5]==='ammo'?'SALE ':'')+money(shopPrice(it,w)),vc:st==='sale'&&it[5]==='ammo'?C_G:null,
    dis:()=>st==='closed'?'CLOSED TODAY.':st==='drought'&&it[5]==='heal'?'NONE TO BE HAD. IT\'S A DROUGHT.':!it[3]()?'YOU HAVE ENOUGH OF THAT.':P.cash<shopPrice(it,w)?'NOT ENOUGH CASH.':null,
    act:()=>{const p=shopPrice(it,w);P.cash-=p;it[4]();ST.shop=(ST.shop||0)+p;play('cash',.7);}}));
  if(st==='special'&&w.spec){const sp=w.spec,price=Math.round(6000*w.mult/50)*50;items.unshift({label:sp[1]+' NEXT WAVE',col:C_C,val:()=>money(price),
    dis:()=>P.special?'YOU ALREADY HAVE ONE COMING.':P.cash<price?'NOT ENOUGH CASH.':null,act:()=>{P.cash-=price;P.special=sp[0];ST.shop=(ST.shop||0)+price;play('power',.6);toast(sp[1]+' NEXT WAVE',C_C);}});}
  const odds=()=>2+(w.jp||0);
  items.push({label:'THE DEALER',col:C_Y,val:()=>'PAYS '+odds()+' TO 1',
    dis:()=>st==='closed'?'CLOSED TODAY.':P.cash<100?'YOU NEED AT LEAST $100.':null,act:()=>arenaDealer(odds)});
  items.push({label:'NEXT WAVE',col:C_G,act:()=>{resumePlay();arenaWave(L.wave);}});
  const sc={eyebrow:'WAVE '+w.n+' CLEARED',title:'THE SHOP',border:st==='hike'?2:st==='closed'?1:4,
    text:[{s:SHOPMSG[st],c:st==='hike'||st==='closed'?C_R:st==='sale'?C_G:st==='special'?C_C:C_Y},{s:()=>'CASH '+money(P.cash)+(w.mult>1?'   PRICES X'+w.mult.toFixed(2):''),c:C_G},{s:()=>'HEALTH '+Math.ceil(P.hp)+'  ARMOR '+Math.ceil(P.armor)+'  ROUNDS '+P.b+'  SHELLS '+P.s+'  DYNAMITE '+(P.d||0)+'  DRUMS '+(P.drums||0),c:C_GR}],
    items,sel:items.length-1};
  ui(sc);if(st==='hike'&&!w.hikeSaid){w.hikeSaid=1;SFX.horn();borderFlash=.4;borderFlashIdx=10;}}
function arenaDealer(odds){const w=L.wave;
  bjTable({title:'THE DEALER',leaveLabel:'SHOP',step:100,potLabel:'CASH',odds,leave:showShop,pot:()=>P.cash,
    apply:delta=>{P.cash=Math.max(0,P.cash+delta);if(delta>0){ST.bjWon=(ST.bjWon||0)+1;ach('doubledown');}else if(delta<0)ST.bjLost=(ST.bjLost||0)+1;saveStats();},broke:()=>{toast('YOU ARE TAPPED OUT',C_R);showShop();}});}
function arenaDead(){const n=Math.max(0,L.wave.n-1);if(L.modArena)ST.marenaBest=Math.max(ST.marenaBest||0,n);else ST.arenaBest=Math.max(ST.arenaBest||0,n);{const k=L.modArena?'marenaMap':'arenaMap';ST[k]=ST[k]||{};ST[k][ARENAMAP]=Math.max(ST[k][ARENAMAP]||0,n);}ST.arenaScore=Math.max(ST.arenaScore||0,P.score);saveStats();
  const ma=L.modArena;ui({eyebrow:(ma?'MODIFIED ARENA  ':'ARENA  ')+(L.arenaName||'GAS STATION'),title:'SALAMANDER IS DEAD',tcol:C_R,border:2,art:'pulp:gunman',artCol:C_R,rows:[['WAVES SURVIVED',n],['BODIES',L.kills],['SCORE',money(P.score)],['BEST WAVES',ma?ST.marenaBest:ST.arenaBest]],
    items:[{label:'AGAIN',act:()=>arenaStart(ma,ARENAMAP)},{label:'MAPS',act:()=>showArenas(ma)},{label:'MENU',act:showHustles}]});}
function dropDrum(){if(!L.arena||!(P.drums>0))return;const x=P.x+P.dx*1.2,y=P.y+P.dy*1.2,i=Math.floor(y)*L.W+Math.floor(x);
  if(L.map[i]||L.block[i]||Math.hypot(x-P.x,y-P.y)<.8){feed('NO ROOM THERE',C_GR);return;}P.drums--;addBoom(L,Math.floor(x)+.5,Math.floor(y)+.5,'XDRUM');L.flowCell=-1;play('push',.6,.7);}

