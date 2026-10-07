/* =====================================================================
   KILL RACE 12. SCENE
   Sprites through Bagman's drawSprite, back to front. Cars are boxes
   (carbox.js); bikes stay flat sprites, front or tail-lit. Gunners
   lean out of the window when they fire (Bagman's attack frames). Then the
   player's hood, cast like a floor and painted from the red car texture,
   and the gun out the window.
   ===================================================================== */
function drawCar(c){const K=c.K,sc=c.sc||1,B=BODY[c.body||c.kind];
  const keep=light;if(c.dead)light*=.3;else if(c.flash>0)light*=1.7;
  const oc=c.dead||c.parked||c.traffic?null:K.siren?(((tm*7)|0)&1?C_R:C_B):c.boss?(((tm*6)|0)&1?C_Y:C_R):c.angry?(((tm*4)|0)&1?C_R:C_K):C_K;
  if(!B){const dx=P.x-c.x,dy=P.y-c.y,tow=(Math.cos(c.a)*dx+Math.sin(c.a)*dy)/(Math.hypot(dx,dy)||1);drawSprite(tow>0?CARS:CARS_REAR,K.front*96,0,96,64,c.x,c.y,.75*sc,c===P.lock,false,oc);}
  else{const box=drawCarBox(c,B,oc);if(box&&c===P.lock)lockBox=box;}
  light=keep;
  if(c.fireT>0&&!c.dead&&c.kind!=='bike'){const fr=c.fireT>.08?2:1;drawSprite(SHEET[K.siren?'cop':'thug'],fr*64,6*64,64,64,c.x,c.y,.45*sc,false,false,null,(B?B.H*sc-.15:.42));}}

function krSprites(){lockBox=null;const list=[],far=48*48;
  const add=(o,k)=>{const d=(o.x-P.x)**2+(o.y-P.y)**2;if(d<far)list.push({d,o,k});};
  for(const t of L.things)add(t,'t');for(const c of L.vcars)add(c,'c');for(const p of L.peds)add(p,'p');for(const e of L.enemies)add(e,'e');
  for(const r of L.ramps||[])add(r,'r');for(const s of L.shots)add(s,'s');for(const s of L.pflames)add(s,'s');for(const b of L.bombs)add(b,'b');
  list.sort((a,b)=>b.d-a.d);
  for(const {o,k}of list){
    if(k==='c')drawCar(o);
    else if(k==='r')drawRamp(o);
    else if(k==='t'){if(o.t==='tree')drawSprite(TREES,o.ti*64,0,64,128,o.x,o.y,2.6);
      else if(o.t==='item'){const pow=PICKS[o.kind]&&PICKS[o.kind].big,bob=.14+.06*Math.sin(tm*3.2+o.x*1.7);
        drawSprite(DECO,o.d*64,0,64,64,o.x,o.y,pow?1.3:1.1,false,false,pow?(((tm*5)|0)&1?C_W:C_C):C_K,bob);}
      else if(o.cp!==undefined)drawSprite(DECO,o.d*64,0,64,64,o.x,o.y,1.5,false,false,o.cp===P.cp?(((tm*6)|0)&1?C_Y:C_W):null);
      else drawSprite(DECO,o.d*64,0,64,64,o.x,o.y,o.d===DCAN?1.5:1,o===P.lock,false,o.boom?C_K:null);}
    else if(k==='p'){if(o.gib){drawSprite(DECO,o.corpse*64,0,64,64,o.x,o.y,1);continue;}const[fx,fy]=enemyFrame(o);drawSprite(SHEET[o.sh],fx,fy,64,64,o.x,o.y,o.sc,false,false,o.st==='dead'?null:C_K);}
    else if(k==='e'){if(o.gib){drawSprite(DECO,o.corpse*64,0,64,64,o.x,o.y,1);continue;}if(o.dog){drawDog(o);continue;}
      const[fx,fy]=enemyFrame(o);drawSprite(SHEET[o.T.sh],fx,fy,64,64,o.x,o.y,o.sc,o===P.lock,false,o.st==='dead'?null:C_K);}
    else if(k==='s')drawShot(o);
    else drawSprite(DECO,dec('DYN')*64,0,64,64,o.x,o.y,.55,false,false,C_K,o.z);}}

// the hood: a flat panel just below the eye, cast row by row like Bagman's floor
const HOOD_Z=.24,HOOD_LEN=.92;
function drawHood(){const wd=WALLS.d,ww=WALLS.w,base=tex(P.K.hood||'CARR')*TS,rage=P.berserk>0,dz=L.camZ-HOOD_Z;
  for(let y=HZ+1;y<VH;y++){const d=VH*dz/(y-HZ+.5);if(d>HOOD_LEN)continue;const hw=.6-Math.max(0,d-.6)*.8,tv=50+Math.min(11,(d/HOOD_LEN*12)|0),rim=d>HOOD_LEN-.06,fall=.75-.35*(d/HOOD_LEN);
    for(let x=0;x<SW;x++){const lat=d*(2*x/SW-1)*P.fov,al=Math.abs(lat);if(al>hw)continue;
      const tu=14+Math.min(47,((lat/hw*.5+.5)*48)|0),si=(tv*ww+base+tu)*4,di=(y*SW+x)*4;
      let k=fall*(.35+.65*(1-al/hw)**.6)*(rim||hw-al<.025?.4:1);
      // a streak of street light off the crown of the hood
      if(Math.abs(lat-.14)<.025)k*=1.6;
      if(rage){D[di]=Math.min(255,wd[si]*k*1.4);D[di+1]=wd[si+1]*k*.3;D[di+2]=wd[si+2]*k*.3;}else{D[di]=wd[si]*k;D[di+1]=wd[si+1]*k;D[di+2]=wd[si+2]*k;}}}}

// the gun out the window: Bagman's weapon sprites and bob, with road vibration
function drawGun(){GRT.fill(0);if(P.dead&&deathT>.6)return;const g=gunNow(),T=WPN[g.spr];let fi=0;if(P.anim)fi=g.seq[P.anim.i]||0;else if(P.flame>0)fi=((tm*14)|0)&1;else if(P.w===2&&!P.d)fi=2;
  const S=g.spr==='wFlame'?.9:1,sp=speedOf(P),vib=sp>3?Math.round((rnd()-.5)*Math.min(2,sp*.12)):0;
  const ox=Math.round(T.x+30+(g.spr==='wFlame'?10:0)+P.sway)+vib,oy=Math.round(VH-(160-T.y)*S+10+P.recoil*.5+P.bump*.8+(P.dead?deathT*120:0));
  const sd=T.d,sw=T.w,k=Math.min(1.6,1.25*light),dw=Math.round(T.fw*S),dh=Math.round(T.fh*S),rage=P.berserk>0;
  for(let yy=0;yy<dh;yy++){const y=oy+yy;if(y<0||y>=VH)continue;const v=Math.min(T.fh-1,(yy/S)|0);
    for(let xx=0;xx<dw;xx++){const x=ox+xx;if(x<0||x>=SW)continue;const u=Math.min(T.fw-1,(xx/S)|0),si=(v*sw+fi*T.fw+u)*4;if(sd[si+3]<110)continue;GRT[y*SW+x]=1;const di=(y*SW+x)*4;
      if(rage){D[di]=Math.min(255,sd[si]*1.6);D[di+1]=sd[si+1]*.4;D[di+2]=sd[si+2]*.3;}else{D[di]=Math.min(255,sd[si]*k);D[di+1]=Math.min(255,sd[si+1]*k);D[di+2]=Math.min(255,sd[si+2]*k);}}}}
