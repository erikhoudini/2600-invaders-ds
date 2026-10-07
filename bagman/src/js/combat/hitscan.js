function fireRay(ang,range,dmin,dmax,gib,hsChance){const c=Math.cos(ang),s=Math.sin(ang);const h=cast(P.x,P.y,c,s,range);const wd=h?h.t:range;
  const hx=h?{id:h.id,face:h.face,u:h.u,door:h.door}:null;let best=null,bd=wd,bthing=null;
  for(const e of L.enemies){if(e.st==='dead'||e.st==='dying')continue;const dx=e.x-P.x,dy=e.y-P.y;const al=dx*c+dy*s;if(al<=0||al>=bd)continue;
    if(Math.abs(-dx*s+dy*c)<(e.dog?.36:.32*e.sc)){best=e;bd=al;}}
  for(const t of L.things){if(!t.boom)continue;const dx=t.x-P.x,dy=t.y-P.y;const al=dx*c+dy*s;if(al<=0||al>=bd)continue;if(Math.abs(-dx*s+dy*c)<.3){bthing=t;bd=al;best=null;}}
  if(bthing){bthing.hp-=dmin+rnd()*(dmax-dmin);puff(bthing.x-c*.3,bthing.y-s*.3);if(bthing.hp<=0)detonate(bthing,0);return null;}
  if(best){hurtEnemy(best,dmin+rnd()*(dmax-dmin),ang,gib,rnd()<hsChance);}
  else if(hx&&range>2){carHit(hx.id,dmin+rnd()*(dmax-dmin));puff(P.x+c*(wd-.08),P.y+s*(wd-.08));if(!hx.door)stainWall(hx.id,hx.face,hx.u,.42+rnd()*.25,0,3);}
  return best;}
