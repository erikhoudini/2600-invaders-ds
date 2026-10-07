/* =====================================================================
   15. DOORS, SECRETS, SWITCH, WAVES
   ===================================================================== */
let lockMsgT=0;
const KEYNAME={Y:'YELLOW',R:'RED'};
function openDoor(d,byPlayer){
  if(d.lock){if(!byPlayer)return;
    if(d.lock==='W'){if(lockMsgT<=0){feed('OFFICE LOCKED. CLEAR THE LOT.',C_R);SFX.locked();lockMsgT=2;}return;}
    if(P.keys[d.lock]){feed(KEYNAME[d.lock]+' KEY USED',d.lock==='R'?C_R:C_Y);d.lock=null;d.tex=tex('DOOR');SFX.key();}
    else{if(lockMsgT<=0){feed('NEEDS THE '+KEYNAME[d.lock]+' KEY',d.lock==='R'?C_R:C_Y);SFX.locked();lockMsgT=1.5;}return;}}
  if(d.st===0||d.st===3){d.st=1;SFX.door();}if(d.st===2)d.t=0;}
function occupied(d){return(Math.floor(P.x)===d.x&&Math.floor(P.y)===d.y)||L.enemies.some(e=>e.st!=='dead'&&e.st!=='dying'&&Math.floor(e.x)===d.x&&Math.floor(e.y)===d.y);}
function updDoors(dt){for(const d of L.doors){if(d.st===1){d.open+=dt*(d.secret?1.1:2.2);if(d.open>=1){d.open=1;d.st=2;d.t=0;}}
  else if(d.st===2){if(d.secret)continue;d.t+=dt;if(d.t>4){if(!occupied(d)){d.st=3;SFX.door();}else d.t=3;}}
  else if(d.st===3){if(occupied(d))d.st=1;else{d.open-=dt*2.2;if(d.open<=0){d.open=0;d.st=0;}}}}}
function triggerAmbush(k){if(!L.ambush)return;for(const a of L.ambush){if(a.key!==k||a.done)continue;a.done=1;
    for(const c of a.open){L.map[c.i]=0;L.dg[c.i]=L.doors.length;L.doors.push({x:c.x,y:c.y,vert:a.vert,open:0,st:1,t:0,lock:null,tex:c.tex,secret:1});}
    L.flowCell=-1;for(const e of a.enemies){e.ambush=0;if(e.st!=='idle')continue;wake(e);e.react=.5+rnd()*1.1;}
    ST.ambush++;SFX.door();play('boom',.5,.55);shake=Math.max(shake,.45);CRT.boom=Math.max(CRT.boom,.3);}}
function trySecret(i){const s=L.secretAt.get(i);if(!s)return;L.secretAt.delete(i);
  L.map[i]=0;L.dg[i]=L.doors.length;L.doors.push({x:s.x,y:s.y,vert:s.dx!==0,open:0,st:1,t:0,lock:null,tex:s.tex,secret:1});
  L.secretsFound++;ST.secrets++;L.flowCell=-1;SFX.push();bigMsg('SECRET',1.6,C_C);feed('SECRETS '+L.secretsFound+' OF '+L.secrets,C_C);}
function updWaves(dt){const w=L.wave;if(!w)return;
  if(w.queue.length){w.spawnT-=dt;if(w.spawnT<=0){w.spawnT=L.arena?.35:.24;const type=w.queue.shift();
    let best=-1;for(let k=0;k<12;k++){const i=w.spawns[Math.floor(w.R()*w.spawns.length)];const x=i%L.W,y=(i/L.W)|0;if(Math.hypot(x+.5-P.x,y+.5-P.y)>9){best=i;break;}}
    if(best>=0){const e=makeEnemy(RULES.bag?bagUp(type,w.R(),L.n):type,(best%L.W)+.5,((best/L.W)|0)+.5,w.R);e.st='chase';e.cd=1+w.R()*1.5;if(RULES.glyc&&!e.dog&&!e.boss&&type!=='torch'&&w.R()<.16)e.dyn=1;
      if(w.wantedNext&&!e.dog&&!e.boss){w.wantedNext=0;markWanted(e);}L.enemies.push(e);L.total++;}}return;}
  if(L.enemies.some(e=>e.st!=='dead'&&e.st!=='dying'))return;
  if(L.arena){if(w.n===0){w.pause-=dt;if(w.pause<=0)arenaWave(w);return;}if(state==='play'){if(w.clearT==null){w.clearT=4;bigMsg('WAVE '+w.n+' CLEARED',2,C_G);if(L.modArena){WAVEMODS=[];computeRules();P.maxHp=100;}}w.clearT-=dt;if(w.clearT<=0){w.clearT=null;for(let i=L.things.length-1;i>=0;i--){const t=L.things[i];if(t.val){P.cash+=t.val;L.things.splice(i,1);}}w.hikeSaid=0;arenaShopRoll(w);showShop();}}return;}
  if(w.n>=w.total){if(!w.done){w.done=1;const d=L.doors[0];d.lock=null;d.tex=tex('DOOR');bigMsg('THE LOT IS CLEAR',3,C_G);SFX.key();}return;}
  w.pause-=dt;if(w.pause>0)return;
  w.n++;w.pause=3;const cnt=[26,31,36,42,47,52][w.n-1]*(RULES.army?2:1);
  for(let k=0;k<cnt;k++){const r=w.R();w.queue.push(w.n>=4&&r<.2?'enf':(w.n>=3&&r<.38?'dog':(r<.65?'thug':'cop')));}
  if(RULES.pipe)for(let k=0;k<3;k++)w.queue.splice(Math.floor(w.R()*w.queue.length),0,'torch');if(RULES.wanted&&w.n===3)w.wantedNext=1;
  // a little stock spills onto the lot between waves
  if(w.n>=2&&w.lot&&w.lot.length){const drop=['BOX','SHELLS','CLIP'];if(w.n%2===0&&!RULES.nola)drop.push('MEDKIT');for(const k of drop){const i=w.lot[Math.floor(w.R()*w.lot.length)];addItem(L,k,(i%L.W)+.5,((i/L.W)|0)+.5);}}
  bigMsg('WAVE '+w.n+' OF '+w.total,2.2,C_Y);SFX.wave();}

