function updDog(e,dt,dx,dy,dist){
  if(e.st==='attack'){e.a=Math.atan2(dy,dx);if(e.fr===0&&e.t>.18){e.fr=1;if(dist<1.15){hurtPlayer(e.T.dmg*1.15,Math.atan2(e.y-P.y,e.x-P.x));SFX.bite();blood(P.x,P.y,.4,e.a,6,.6);}}
    else if(e.fr===1&&e.t>.4){e.st='chase';e.t=0;e.cd=cdOf(e);}return;}
  e.cd-=dt;if(dist<1.1&&e.cd<=0){e.st='attack';e.t=0;e.fr=0;return;}
  if(rnd()<dt*.6)SFX.grr(Math.max(.1,1-dist/14));
  let mv=null;if(e.los&&dist<6){mv=[dx/dist,dy/dist];}else mv=stepToward(e,dt);
  if(!mv){e.moving=0;return;}
  if(dist<1.0){e.moving=0;return;}
  e.a=Math.atan2(mv[1],mv[0]);moveEnemy(e,mv[0],mv[1],e.T.spd*dt);e.moving=1;e.wt+=dt;}
