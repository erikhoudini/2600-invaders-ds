let showMap=false;
function drawMap(){const W=L.W,H=L.H,s=Math.max(1,Math.floor(Math.min((SW-8)/W,(VH-14)/H))),ox=((SW-W*s)/2)|0,oy=(((VH-H*s)/2)|0)+4;
  rect(0,0,SW,VH,C_K);text('MAP',4,3,C_Y);if(L.secrets)text('SECRETS '+L.secretsFound+'/'+L.secrets,SW-textW('SECRETS 0/0')-4,3,C_C);
  const swT=tex('SWITCH')+1,swOn=tex('SWITCHON')+1;
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=y*W+x;let c=null;
    if(L.walked[i]&&!L.map[i])c=C_B;
    if(L.seen[i]){const di=L.dg[i];if(di>=0){const d=L.doors[di];c=d.lock==='R'?C_R:(d.lock?C_Y:C_C);}else if(L.map[i]===swT||L.map[i]===swOn)c=C_G;else if(L.map[i])c=C_W;}
    if(c)rect(ox+x*s,oy+y*s,s,s,c);}
  for(const t of L.things){if(t.kind!=='KEYY'&&t.kind!=='KEYR')continue;const i=Math.floor(t.y)*W+Math.floor(t.x);if(!L.walked[i])continue;rect(ox+Math.floor(t.x)*s-1,oy+Math.floor(t.y)*s-1,s+2,s+2,t.kind==='KEYR'?C_R:C_Y);}
  const px=ox+P.x*s,py=oy+P.y*s;if(((tm*4)|0)&1)rect(px-1,py-1,3,3,C_R);for(let k=2;k<6;k++)put(Math.round(px+P.dx*k),Math.round(py+P.dy*k),C_Y);}
function hud(){const y0=VH,h=SH-VH;rect(0,y0,SW,h,C_K);rect(0,y0,SW,1,P.berserk>0?C_R:C_B);
  for(const x of[78,172,286])rect(x,y0+1,1,h-1,C_B);
  if(L.rails){const tv=Math.ceil(R_.truck),low=R_.truck<R_.truckMax*.3;text('TRUCK',5,y0+6,R_.truckHit>0?C_W:C_GR);text(tv,5,y0+18,low?(((tm*5)|0)&1?C_R:C_W):(R_.truckHit>0?C_R:C_W),2);}
  else{text('HEALTH',5,y0+6,C_GR);text(Math.max(0,Math.ceil(P.hp)),5,y0+18,P.hp<=25?(((tm*5)|0)&1?C_R:C_W):C_W,2);}
  if(P.armor>0){const ac=P.acls>=.5?C_B:C_G;text('ARM',53,y0+6,ac);text(String(Math.ceil(P.armor)),53,y0+18,ac);}
  const W0=WEAP[P.w];text(L.rails?'AK-47':L.sniper?'RIFLE':(P.w===5?'FLAMER':P.berserk>0?'BERSERK':W0.name),84,y0+6,P.w===5?C_Y:P.berserk>0?C_R:C_GR);
  text(L.rails||L.sniper?'INF':P.w===5?Math.ceil(P.flame)+'S':(W0.ammo?String(ammoOf(W0.ammo)):'--'),84,y0+18,C_Y,2);
  text('SCORE',178,y0+6,C_GR);text('$'+P.score,178,y0+18,C_C,P.score>=1000000?1:2);
  {const dh=!(L.arena&&P.drums>0);if(drumHid!==dh){drumHid=dh;$('drumBtn').hidden=dh;}}
  if(L.arena){text('CASH',292,y0+6,C_GR);text('$'+(P.cash||0),290,y0+18,C_G);if(P.drums)text('DRUMS '+P.drums,290,y0+29,C_Y);}
  else{text('KEYS',292,y0+6,C_GR);if(!L.rails){if(P.keys.Y)rect(292,y0+18,10,12,C_Y);if(P.keys.R)rect(305,y0+18,10,12,C_R);}}
  if(P.sprinting)text('RUN',236,y0+6,C_C);}

