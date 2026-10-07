function hurtEnemy(e,dmg,ang,gibChance,head,src){if(e.st==='dying'||e.st==='dead')return;
  if(src&&src!==e&&src.type!==e.type&&!e.guard){e.foe=src;e.foeT=6;}
  if(head&&!e.dog)dmg*=2.6;e.hp-=dmg;e.shotDmg+=dmg;
  const hz=e.dog?.25:(head?.85*e.sc:.55*e.sc);blood(e.x,e.y,hz,ang,7+Math.floor(dmg/3),1.1);if(!e.dog)splatBehind(e.x,e.y,ang,Math.min(1,dmg/22));
  if(e.st==='idle')wake(e);
  if(e.hp<=0){e.st='dying';e.t=0;e.fr=0;L.kills++;ST.kills++;if(src){ST.infight=(ST.infight||0)+1;}else{ST.kw=ST.kw||{};ST.kw[KW]=(ST.kw[KW]||0)+1;if(P.w===0&&!L.sniper&&!L.rails)ST.punch++;chainKill();killScore(e);}if(e.dog)ST.dogs++;if(e.boss)ST.bosses++;
    const d=Math.hypot(e.x-P.x,e.y-P.y),v=Math.max(.15,1-d/20);
    if(!e.boss&&(e.shotDmg>=40||rnd()<gibChance)){e.gib=1;ST.gib++;e.st='dead';e.corpse=dec(['BODY1','BODY2','BODY3'][Math.floor(rnd()*3)]);gibs(e.x,e.y,ang);SFX.gib(v);}
    else if(head&&!e.boss&&!e.dog){e.headless=1;ST.head++;e.fount=1.1;SFX.head();bigMsg('HEADSHOT',1,C_R);blood(e.x,e.y,.95,ang,34,1.5);}
    else SFX.die(v);
    e.poolR=0;
    const r=rnd();
    if(L.arena){if(!e.dog&&(e.boss||rnd()<.45)){const n=L.wave?L.wave.n:1,v=e.boss?2000:Math.round(({thug:120,cop:150,enf:250,torch:300,heavy:300}[e.type]||120)*(1+n*.04)/10)*10;L.things.push({t:'item',kind:'CASH',x:e.x,y:e.y,d:dec('CASH'),drop:1,val:v});}}
    else if(e.T.drop&&r<e.T.drop){let k=r<(L.n>=11&&!L.arena?.22:.18)?(e.type==='enf'?'SHELLS':(P.has[3]&&rnd()<.3?'DRUM':'CLIP')):(r<.55?scoreKind(rnd):(r<.64?(rnd()<.5?'BOTTLE':'PILLS'):scoreKind(rnd)));if(HEALK.has(k)&&(RULES.nola||rnd()>RULES.hp))k=scoreKind(rnd);if(AMMOK.has(k)&&RULES.knuckle&&rnd()<.5)k=scoreKind(rnd);
      L.things.push({t:'item',kind:k,x:e.x+(rnd()-.5)*.3,y:e.y+(rnd()-.5)*.3,d:dec(k),drop:1});}
    if(e.carry&&!L.arena)L.things.push({t:'item',kind:e.carry,x:e.x,y:e.y,d:dec(e.carry),drop:1});
    if(e.type==='torch')ST.torch++;
    if(e.type==='torch'&&RULES.gas)L.fuses.push({x:e.x,y:e.y,boom:1,fuse:.15,fx:1});
    if(RULES.hjdt&&!src){L.k7=(L.k7||0)+1;if(L.k7%7===0){L.fuses.push({x:e.x,y:e.y,boom:1,fuse:.08,fx:1});feed('HE JUST DID THAT',C_Y);}}
    if(RULES.dtap&&!e.revived&&!e.boss&&!e.wanted&&KW!=='boom'&&KW!=='dyn'&&rnd()<.3)e.reviveT=e.gib?4:2.4;
    if(e.wanted)wantedDown(e);
    if(e.type==='komodo')ach('biggame');if(KW==='dyn'&&!src)L.dynKill=(L.dynKill||0)+1;
    if(e.boss){if(e.type==='gila'&&!L.arena)L.things.push({t:'item',kind:'DYNAMITE',x:e.x,y:e.y,d:dec('DYNAMITE'),drop:1});bigMsg(e.T.boss+' IS DEAD',3,C_R);gibs(e.x,e.y,ang,1.4);shake=1;CRT.boom=1;SFX.bigboom();}
    if(P.lock===e){const nx=nearestTarget(e.x,e.y,e);P.lock=nx;if(nx)SFX.lock();}
  } else if(!e.boss&&rnd()<.4&&e.st!=='attack'){e.st='pain';e.t=0;}
}
// bagman difficulty brings the heavier men in earlier
function bagUp(t,r,n){if(t==='thug'&&r<.3)return 'cop';if(t==='cop'&&r<.25)return 'enf';if(n>=3&&t!=='torch'&&r>.95)return 'torch';return t;}
function retype(e,t,R){e.type=t;e.T=ETYPE[t];e.hp=e.T.hp*(RULES.donuts?1.3:1);e.hp0=e.hp;e.sc=e.T.sc;e.role=pickRole(t,R);}
function markWanted(e){e.wanted=1;e.name='WANTED';e.hp*=3;e.hp0=e.hp;}
function reviveEnemy(e,home){e.revived=1;e.reviveT=0;if(home){e.x=e.hx;e.y=e.hy;}e.hp=(e.hp0||e.T.hp)*.7;e.gib=0;e.headless=0;e.fount=0;e.poolR=undefined;e.st=home?'idle':'pain';e.t=0;e.fr=0;e.cd=1;e.react=.3;e.foe=null;e.shotDmg=0;e.moving=0;L.total++;
  if(!home&&Math.hypot(e.x-P.x,e.y-P.y)<14){feed('HE GETS BACK UP',C_R);SFX.alert(1);}}
function wantedDown(w){let n=0;for(const o of L.enemies){if(o===w||o.boss||o.st!=='dead')continue;reviveEnemy(o,true);n++;}
  for(let k=0;k<3;k++)L.things.push({t:'item',kind:'PACKAGE',x:w.x+(rnd()-.5)*.6,y:w.y+(rnd()-.5)*.6,d:dec('PACKAGE'),drop:1});
  bigMsg(n?'THEY ALL GOT BACK UP':'WANTED: DEAD',3,C_R);SFX.horn();shake=Math.max(shake,.6);CRT.boom=Math.max(CRT.boom,.5);}
function enemyThrow(e){const dx=P.x-e.x,dy=P.y-e.y,d=Math.hypot(dx,dy)||1,c=dx/d,sn=dy/d,T=.55+d*.03,g=9;
  L.bombs.push({x:e.x+c*.4,y:e.y+sn*.4,z:.6,vx:c*d*.92/T,vy:sn*d*.92/T,vz:(-.5+.5*g*T*T)/T,fuse:1.5,g,en:1});play('push',.5,1.3);feed('DYNAMITE!',C_R);}
function davidBoom(a){const c=Math.cos(a),s=Math.sin(a);const h=cast(P.x,P.y,c,s,24);let d=h?h.t-.35:24;
  for(const e of L.enemies){if(e.st==='dead'||e.st==='dying')continue;const dx=e.x-P.x,dy=e.y-P.y,al=dx*c+dy*s;if(al>0&&al<d&&Math.abs(-dx*s+dy*c)<.5)d=al;}
  d=Math.max(1.2,d);L.fuses.push({x:P.x+c*d,y:P.y+s*d,boom:1,fuse:.05,fx:1});}
function wake(e){if(e.st!=='idle')return;e.st='chase';e.t=0;e.cd=.6+rnd()*1.2;e.react=e.boss?0:((e.dog?.15:.2)+rnd()*(e.dog?.25:.75))*(RULES.aggr?.35:1);const v=Math.max(.1,1-Math.hypot(e.x-P.x,e.y-P.y)/18);if(e.dog)SFX.bark(v);else SFX.alert(v);}
