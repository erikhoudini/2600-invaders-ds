// weapon wheel: hold swap and the world nearly stops; push a direction and let go. a quick tap flips back to the last gun
const WHEEL={down:0,t:0,open:0,x:0,y:0,sel:-1,moved:0};
const WSLOT={2:-Math.PI/2,3:0,4:Math.PI,0:Math.PI/2,1:-Math.PI*3/4};
const wheelOK=w=>P.has[w]&&(!WEAP[w].ammo||ammoOf(WEAP[w].ammo)>0);
function wheelPress(){if(state!=='play'||L.rails||L.sniper||P.berserk>0)return;Object.assign(WHEEL,{down:1,t:0,open:0,x:0,y:0,sel:-1,moved:0});}
function wheelAim(x,y){WHEEL.x=x;WHEEL.y=y;const l=Math.hypot(x,y);if(l<.35)return;WHEEL.moved=1;const a=Math.atan2(y,x);let b=-1,bd=9;
  for(const k in WSLOT){const w=+k;if(!wheelOK(w))continue;const d=Math.abs(angDiff(a,WSLOT[k]));if(d<bd){bd=d;b=w;}}if(b!==WHEEL.sel&&b>=0){WHEEL.sel=b;SFX.menu();}}
function wheelNudge(dx,dy){let x=WHEEL.x+dx,y=WHEEL.y+dy;const l=Math.hypot(x,y);if(l>1.4){x*=1.4/l;y*=1.4/l;}wheelAim(x,y);}
function wheelRelease(){if(!WHEEL.down)return;const tap=!WHEEL.open&&!WHEEL.moved;WHEEL.down=0;WHEEL.open=0;
  if(state!=='play')return;if(tap){const w=P.lastW;if(w!=null&&w!==P.w&&wheelOK(w))selectW(w);else nextW();return;}
  if(WHEEL.sel>=0&&WHEEL.sel!==P.w)selectW(WHEEL.sel);}
function wheelTick(rdt){if(!WHEEL.down)return;WHEEL.t+=rdt;if(!WHEEL.open&&(WHEEL.t>.16||WHEEL.moved)){WHEEL.open=1;SFX.menu();}
  if(!WHEEL.open)return;let x=0,y=0;if(K('right')||keys.ArrowRight)x+=1;if(K('left')||keys.ArrowLeft)x-=1;if(K('fwd')||keys.ArrowUp)y-=1;if(K('back')||keys.ArrowDown)y+=1;
  if(x||y)wheelAim(x,y);else if(Math.hypot(stick.x,stick.y)>.4)wheelAim(stick.x,stick.y);}
function drawWheel(){if(!WHEEL.open)return;const cx=SW>>1,cy=(VH>>1)+4,R0=80;
  for(let y=0;y<VH;y++)for(let x=0;x<SW;x++){const i=(y*SW+x)*4;D[i]=D[i]*.4;D[i+1]=D[i+1]*.4;D[i+2]=D[i+2]*.4;}
  for(let a=0;a<TAU;a+=.02){put(Math.round(cx+Math.cos(a)*R0*.55),Math.round(cy+Math.sin(a)*R0*.55),C_B);}
  const NM=['FISTS','.38','PUMP','AK-47','DYNAMITE'];
  for(const k in WSLOT){const w=+k,a=WSLOT[k],x=Math.round(cx+Math.cos(a)*R0),y=Math.round(cy+Math.sin(a)*R0*.85);const ok=wheelOK(w),sel=WHEEL.sel===w,cur=P.w===w;
    const nm=NM[w],am=WEAP[w].ammo?String(ammoOf(WEAP[w].ammo)):'--',bw=Math.max(textW(nm),textW(am))+8;
    rect(x-bw/2-1,y-11,bw+2,24,sel?C_Y:(cur?C_C:C_B));rect(x-bw/2+1,y-9,bw-2,20,C_K);
    text(nm,x-textW(nm)/2,y-7,!P.has[w]?C_K:ok?(sel?C_Y:C_W):C_GR);if(P.has[w])text(am,x-textW(am)/2,y+3,ok?C_Y:C_R);else text('??',x-textW('??')/2,y+3,C_GR);}
  if(Math.hypot(WHEEL.x,WHEEL.y)>.35){const l=Math.hypot(WHEEL.x,WHEEL.y);for(let k=4;k<R0*.5;k++)put(Math.round(cx+WHEEL.x/l*k),Math.round(cy+WHEEL.y/l*k*.78),C_Y);}
  textC('WEAPONS',cy-4,C_W,1,C_K);}
function nextW(){if(P.berserk>0||P.flame>0)return;for(let k=1;k<=5;k++){const w=(P.w+k)%5;if(P.has[w]&&(!WEAP[w].ammo||ammoOf(WEAP[w].ammo)>0)){selectW(w);return;}}}
