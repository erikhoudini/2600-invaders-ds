function updShots(dt){for(let i=L.shots.length-1;i>=0;i--){const s=L.shots[i];s.life-=dt;let dead=s.life<=0;
  for(let k=0;k<3&&!dead;k++){s.x+=s.vx*dt/3;s.y+=s.vy*dt/3;
    if(solidCell(Math.floor(s.x),Math.floor(s.y),false)){dead=true;carHit(Math.floor(s.y)*L.W+Math.floor(s.x),s.dmg);puff(s.x-s.vx*.01,s.y-s.vy*.01);break;}
    for(const t of L.things)if(t.boom&&Math.abs(t.x-s.x)<.32&&Math.abs(t.y-s.y)<.32){dead=true;t.hp-=s.dmg*2;if(t.hp<=0)detonate(t,0);break;}
    if(!dead&&Math.hypot(s.x-P.x,s.y-P.y)<(s.big?.34:.28)){dead=true;hurtPlayer(s.dmg,Math.atan2(s.y-P.y,s.x-P.x));}
    if(!dead&&!RULES.noFF)for(const o of L.enemies){if(o===s.own||o.st==='dead'||o.st==='dying')continue;const r=(o.dog?.3:.3*o.sc);if(Math.abs(o.x-s.x)<r&&Math.abs(o.y-s.y)<r){dead=true;hurtEnemy(o,s.dmg*(s.big===2?1.5:2.2),Math.atan2(s.vy,s.vx),0,false,s.own);break;}}}
  if(s.big===2&&rnd()<dt*14)addPart(s.x,s.y,s.z,(rnd()-.5)*.4,(rnd()-.5)*.4,.6+rnd(),[255,120+rnd()*100|0,0],.03,.35,2);
  if(dead){if(s.big===2&&rnd()<.3)stainFloor(s.x,s.y,.18,3);L.shots.splice(i,1);}}}

