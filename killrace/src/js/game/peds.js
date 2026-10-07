/* =====================================================================
   KILL RACE 8. PEOPLE ON THE STREET
   Civilians walk the sidewalks between nearby points and scatter from horns,
   gunfire, explosions and anything fast coming at them. They are drawn with
   Bagman's thug and deputy sheets, recoloured at boot the way Bagman makes
   its bosses. Deputies and dogs are real Bagman enemies with Bagman's AI.
   Anyone a car hits fast enough goes under it.
   ===================================================================== */
const CIV=['civ1','civ2','civ3','civ4'],PED_T={wind:.4};
function makeCivSheets(){const th=SHEET.thug,cp=SHEET.cop;
  SHEET.civ1=recolor(th,[60,110,230]);SHEET.civ2=recolor(th,[240,200,60],null,[70,45,20]);SHEET.civ3=recolor(cp,[220,70,170]);SHEET.civ4=recolor(cp,[235,235,235],null,[30,30,90]);}
function makePed(i){return{x:(i%L.W)+.5,y:((i/L.W)|0)+.5,a:rnd()*TAU,st:'idle',T:PED_T,sh:CIV[Math.floor(rnd()*CIV.length)],sc:.95,moving:0,wt:0,t:0,fr:0,wp:null,wait:rnd()*2,panic:0,hp:20};}
function spawnPeds(n,minD){for(let k=0,t=0;k<n&&t<n*20;t++){const i=L.walk[Math.floor(rnd()*L.walk.length)],x=(i%L.W)+.5,y=((i/L.W)|0)+.5;
  if(Math.hypot(x-P.x,y-P.y)<minD)continue;L.peds.push(makePed(i));k++;}}

function updPeds(dt){let alive=0;
  for(const p of L.peds){p.t+=dt;
    if(p.st==='dying'){if(p.t>.15){p.t=0;p.fr++;if(p.fr>2){p.st='dead';stainFloor(p.x,p.y,.25,2);}}continue;}
    if(p.st==='dead'){p.deadT=(p.deadT||0)+dt;continue;}
    alive++;
    // something fast coming this way?
    for(const c of[P,...L.vcars]){if(c.dead||c.parked)continue;const dx=p.x-c.x,dy=p.y-c.y,d=Math.hypot(dx,dy),sp=speedOf(c);
      if(d<8&&sp>5&&(c.vx*dx+c.vy*dy)/(d*sp)>.6){p.panic=Math.max(p.panic,1.5);p.fromX=c.x;p.fromY=c.y;}}
    if(p.panic>0){p.panic-=dt;let ax=p.x-p.fromX,ay=p.y-p.fromY;const l=Math.hypot(ax,ay)||1;ax/=l;ay/=l;
      // run away, and sideways if the wall is in the way
      if(!moveEnemy(p,ax,ay,3.4*dt)&&!moveEnemy(p,-ay,ax,3.4*dt))moveEnemy(p,ay,-ax,3.4*dt);
      p.a=Math.atan2(ay,ax);p.moving=1;p.wt+=dt*1.6;p.st='chase';continue;}
    p.st='idle';
    if(p.wait>0){p.wait-=dt;p.moving=0;continue;}
    if(!p.wp||Math.hypot(p.wp.x-p.x,p.wp.y-p.y)<.3){p.wp=null;
      for(let k=0;k<10;k++){const x=Math.floor(p.x+(rnd()*2-1)*7),y=Math.floor(p.y+(rnd()*2-1)*7),i=y*L.W+x;
        if(x<1||y<1||x>=L.W-1||y>=L.H-1||L.map[i]||L.block[i]||L.fmap[i]!==F_WALK)continue;if(!hasLOS(p.x,p.y,x+.5,y+.5))continue;p.wp={x:x+.5,y:y+.5};break;}
      if(rnd()<.35)p.wait=1+rnd()*3;continue;}
    const mx=p.wp.x-p.x,my=p.wp.y-p.y,ml=Math.hypot(mx,my)||1;p.a=Math.atan2(my,mx);if(!moveEnemy(p,mx/ml,my/ml,1.1*dt))p.wp=null;p.moving=1;p.wt+=dt;}
  // keep the streets busy: top up away from the player, clear old bodies
  if(alive<26&&rnd()<dt*2)spawnPeds(1,20);
  const dead=L.peds.filter(p=>p.st==='dead');if(dead.length>36){const old=dead.sort((a,b)=>b.deadT-a.deadT)[0];L.peds.splice(L.peds.indexOf(old),1);}}

// cars against people. Fast enough and they go under; slower and they get shoved
function runOver(){for(const c of[P,...L.vcars]){if(c.parked||(c===P&&P.dead))continue;const sp=speedOf(c);
  for(const list of[L.peds,L.enemies])for(const p of list){if(p.st==='dead'||p.st==='dying')continue;const dx=p.x-c.x,dy=p.y-c.y,d=Math.hypot(dx,dy),r=c.r+(p.dog?.2:.25);if(d>=r)continue;
    const a=Math.atan2(c.vy,c.vx);
    if(sp>3){const byP=c===P;
      if(list===L.peds)killPed(p,a,sp>9,byP,true);
      else{footDown(p,a,sp>9);if(byP){P.foot++;const m=chainKill(),v=(p.dog?150:300)*m;P.score+=v;feed('ROADKILL +'+money(v),C_R);play('splat',.8);}}
      if(byP){CRT.hit=Math.max(CRT.hit,.2);P.bump=3;blood(P.x+P.dx*.6,P.y+P.dy*.6,.45,P.a+Math.PI,12,1);stainFloor(p.x,p.y,.35,2);}
      }
    else if(d>.01){p.x+=dx/d*(r-d);p.y+=dy/d*(r-d);}}}}
