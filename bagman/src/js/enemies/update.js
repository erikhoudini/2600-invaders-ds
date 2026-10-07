function updEnemies(dt){computeFlow();computeFlank();let attackers=0;for(const e of L.enemies)if(e.st==='attack'&&!e.dog)attackers++;
  for(const e of L.enemies){e.t+=dt;
    if(e.fount>0){e.fount-=dt;if(rnd()<.85)addPart(e.x,e.y,.75*e.sc,(rnd()-.5)*.8,(rnd()-.5)*.8,2+rnd()*2,[230,0,0],.016,3,1);}
    if(e.st==='dead'){if(e.reviveT>0){e.reviveT-=dt;if(e.reviveT<=0){reviveEnemy(e,!!e.gib);continue;}}if(e.poolR!==undefined&&e.poolR<.55&&!e.gib){e.poolR+=dt*.12;if(rnd()<.2)stainFloor(e.x,e.y,e.poolR,1);}continue;}
    if(e.st==='dying'){if(e.t>(e.headless?.2:.13)){e.t=0;e.fr++;if(e.fr>(e.dog?1:2)){e.st='dead';stainFloor(e.x,e.y,.25,2);}}continue;}
    const dx=P.x-e.x,dy=P.y-e.y,dist=Math.hypot(dx,dy)||.001;
    e.lt-=dt;if(e.lt<=0){e.lt=.22+rnd()*.1;e.los=dist<26&&hasLOS(e.x,e.y,P.x,P.y);}
    if(e.st==='idle'){if(e.patrol)edPatrol(e,dt);if(e.los&&dist<(L.outdoor?(RULES.aggr?24:17):(RULES.aggr?32:28))){const fa=Math.cos(e.a)*dx/dist+Math.sin(e.a)*dy/dist;if(RULES.aggr||fa>-.2||dist<5)wake(e);}continue;}
    if(e.st==='pain'){if(e.t>.26){e.st='chase';e.t=0;}continue;}
    if(e.dyn&&rnd()<.3)addPart(e.x,e.y,.98*e.sc,(rnd()-.5)*.3,(rnd()-.5)*.3,.7,[255,220,0],.012,.2,2);
    if(e.guard){updGuard(e,dt);continue;}
    if(L.outdoor&&!L.wave&&!e.boss&&!RULES.aggr&&e.noLos>7&&dist>20){e.st='idle';e.noLos=0;e.moving=0;continue;}
    if(e.react>0){e.react-=dt;e.a=Math.atan2(dy,dx);e.moving=0;continue;}
    const foe=e.foe&&e.foeT>0&&e.foe.st!=='dead'&&e.foe.st!=='dying'?e.foe:null;if(foe)e.foeT-=dt;else e.foe=null;
    if(foe){const fx=foe.x-e.x,fy=foe.y-e.y,fd=Math.hypot(fx,fy)||.001;e.a=Math.atan2(fy,fx);e.cd-=dt;
      if(e.dog||e.T.range&&fd>e.T.range||!hasLOS(e.x,e.y,foe.x,foe.y)||fd>14){if(e.dog&&fd<1.1){if(e.cd<=0){e.cd=.7;SFX.bite();hurtEnemy(foe,e.T.dmg*2,e.a,0,false,e);}e.moving=0;continue;}
        const mv=fd>1?[fx/fd,fy/fd]:null;if(mv){moveEnemy(e,mv[0],mv[1],e.T.spd*dt);e.moving=1;e.wt+=dt;}continue;}
      if(e.st!=='attack'&&e.cd<=0){e.st='attack';e.t=0;e.fr=0;e.burst=e.T.burstN||1;}
      if(e.st==='attack'){if(e.fr===0&&e.t>e.T.wind*(RULES.aggr?.66:.88)){e.fr=1;e.t=0;enemyFire(e,fd,foe);}else if(e.fr===1&&e.t>(e.T.hold||.18)){if(e.burst>1){e.burst--;e.fr=0;e.t=e.T.wind-.12;}else{e.st='chase';e.t=0;e.cd=cdOf(e);}}}
      e.moving=0;continue;}
    if(e.dog){updDog(e,dt,dx,dy,dist);continue;}
    if(e.st==='attack'){e.a=Math.atan2(dy,dx);
      if(e.fr===0&&e.t>e.T.wind*(RULES.aggr?.66:.88)){e.fr=1;e.t=0;if(RULES.noFF||RULES.ignoreFF||!friendInLine(e,P.x,P.y))enemyFire(e,dist);}
      else if(e.fr===1&&e.t>(e.T.hold||.18)){if(e.burst>1&&e.los){e.burst--;e.fr=0;e.t=e.T.wind-(e.T.bint!==undefined?e.T.bint:.12);}else{e.st='chase';e.t=0;e.cd=cdOf(e);e.strafe=.5+rnd()*.8;e.sd=rnd()<.5?1:-1;}}
      continue;}
    e.cd-=dt;
    if(e.dyn&&e.los&&dist<7&&dist>2.4&&!e.foe){e.dyn=0;enemyThrow(e);e.cd=Math.max(e.cd,1.2);}
    if(e.los&&e.cd<=0&&dist<(e.T.range||20)&&!e.boss&&!RULES.noFF&&!RULES.ignoreFF&&friendInLine(e,P.x,P.y)){e.cd=.35+rnd()*.3;e.strafe=.5+rnd()*.5;e.sd=rnd()<.5?1:-1;}
    if(e.los&&e.cd<=0&&dist<(e.T.range||20)){if(attackers>=(L.outdoor?(RULES.aggr?10:6):(RULES.aggr?7:4))&&!e.boss){e.cd=.25+rnd()*.4;}else{attackers++;e.st='attack';e.t=0;e.fr=0;e.burst=e.T.burstN||(e.T.pat==='burst2'?2:(e.T.pat==='iguana'?6:1));continue;}}
    let mv=chooseMove(e,dt,dx,dy,dist);
    if(!mv){e.moving=0;if(e.los)e.a=Math.atan2(dy,dx);continue;}
    mv=separate(e,mv);
    const spd=e.T.spd*(mv[2]||1);if(!moveEnemy(e,mv[0],mv[1],spd*dt))e.strafe=0;e.moving=1;e.wt+=dt;
  }}
