/* =====================================================================
   12. COMBAT: player fire, damage, explosions, combos
   ===================================================================== */
const ammoOf=t=>t==='b'?P.b:t==='d'?(P.d||0):P.s;
function chainKill(){P.chain=P.chainT>0?P.chain+1:1;P.chainT=3;ST.chain=Math.max(ST.chain,P.chain);if(P.chain===10)ST.overkill++;if(P.chain===20)ST.massacre++;
  const tier=COMBO.filter(c=>c[0]===P.chain)[0]||(P.chain>20&&P.chain%5===0?[P.chain,'KILL MORE X'+P.chain+'!!!!']:null);
  if(tier){combo={t:tier[1],time:1.6,n:P.chain};SFX.combo(P.chain);CRT.boom=Math.max(CRT.boom,P.chain>=10?.45:.2);shake=Math.max(shake,P.chain>=10?.5:.25);
    if(P.chain>=10){borderFlash=.4;borderFlashIdx=14;}}
  else if(P.chain>=2)SFX.chain(P.chain);
  if(P.chain%7===0&&!L.rails){P.slow=Math.max(0,P.slow)+7;ST.chainEye=(ST.chainEye||0)+1;feed('SLO-MO +7',C_C);CRT.boom=Math.max(CRT.boom,.25);
    if(!slot.spin){slot.n=Math.min(3,slot.n+1);slot.pop=.35;play('combo',.7,1.6);if(slot.n===(UNL.lucky?2:3)){slot.n=3;slot.spin=1.4;play('combo2',.8,1);}}}}
const slot={n:0,pop:0,spin:0,win:0};
function slotUpdate(dt){if(slot.pop>0)slot.pop-=dt;if(P.chain===0&&!slot.spin&&!(slot.win>0))slot.n=0;
  if(slot.spin>0){slot.spin-=dt;if(((slot.spin*14)|0)!==((slot.spin*14+dt*14)|0))play('pick',.4,1.5+rnd());if(slot.spin<=0){slot.spin=0;slot.win=2.2;slot.n=0;jackpot();}}
  if(slot.win>0){slot.win-=dt;if(slot.win<=0)slot.win=0;}}
function jackpot(){ST.jackpots=(ST.jackpots||0)+1;if(L&&L.arena&&L.wave){L.wave.jp=(L.wave.jp||0)+1;feed('THE DEALER PAYS '+(2+L.wave.jp)+' TO 1',C_Y);}bigMsg('JACKPOT $25,000',2.4,C_Y);SFX.combo(20);CRT.boom=1;shake=.8;borderFlash=.6;borderFlashIdx=14;
  const loot=[].concat(Array(13).fill('PACKAGE'),Array(10).fill('CASH'),Array(6).fill('CHAIN'),Array(10).fill('BAGGIE'));
  for(const k of loot){const a=rnd()*TAU,sp=1.5+rnd()*3.5;L.things.push({t:'item',kind:k,x:P.x,y:P.y,d:dec(k),vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,fly:.6+rnd()*.5,bonus:1});}}
function updLoot(dt){for(const t of L.things){if(!t.fly)continue;t.fly-=dt;const nx=t.x+t.vx*dt,ny=t.y+t.vy*dt;
    if(!solidCell(Math.floor(nx),Math.floor(t.y),false))t.x=nx;else t.vx*=-.5;if(!solidCell(Math.floor(t.x),Math.floor(ny),false))t.y=ny;else t.vy*=-.5;
    t.vx*=1-dt*3;t.vy*=1-dt*3;if(t.fly<=0)t.fly=0;}}
function drawSlot(){if(!slot.n&&!slot.spin&&!(slot.win>0))return;const bw=15,bh=19,x0=SW-3*(bw+3)-4,y0=44;
  rect(x0-3,y0-3,3*(bw+3)+3,bh+6,C_K);rect(x0-3,y0-3,3*(bw+3)+3,1,C_Y);rect(x0-3,y0+bh+2,3*(bw+3)+3,1,C_Y);
  for(let k=0;k<3;k++){const x=x0+k*(bw+3),on=k<slot.n||slot.spin>0||slot.win>0;rect(x,y0,bw,bh,on?C_W:C_GR);
    let ch='';if(slot.spin>0){const stop=slot.spin<.9-k*.25;ch=stop?'7':'7$X*'[((tm*20+k*7)|0)%4];}else if(slot.win>0)ch='7';else if(k<slot.n)ch='7';
    const pop=k===slot.n-1&&slot.pop>0;if(ch)text(ch,x+4,y0+6-(pop?2:0),slot.win>0?(((tm*10)|0)&1?C_R:C_Y):C_R,1);}}
function killScore(e){P.score+=(e.boss?e.T.score:100)*Math.max(1,P.chain)*(KW==='fists'&&!(P.berserk>0)?2:1);}
