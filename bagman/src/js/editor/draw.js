/* ---------- drawing ---------- */
function edMode(){MODE='ed';PORT=false;const b=document.body.classList;b.remove('m-ui','m-cine','m-game','port');b.add('m-ed');S={d:ED,w:EW,h:EH};resize();}
function edButton(label,x,y,act,col,on){const w=uTW(label)+10,h=13;const hov=ES.mx>=x&&ES.mx<x+w&&ES.my>=y&&ES.my<y+h&&!ES.modal;uRect(x,y,w,h,on?C_Y:hov?C_B:C_K);uBox(x,y,w,h,on?C_Y:(col||C_GR));uText(label,x+5,y+3,on?C_K:(col||C_W));ES.hits.push({x,y,w,h,act});return x+w+4;}
function edDrawMap(){const v=MAPV,z=ES.z,W=E.W,H=E.H;uRect(v.x,v.y,v.w,v.h,[0,0,40]);
  for(let y=v.y;y<v.y+v.h;y+=4)for(let x=v.x+((y>>2)&1)*2;x<v.x+v.w;x+=4)uRect(x,y,1,1,[0,0,110]);
  const cx0=Math.max(0,Math.floor(-ES.ox/z)),cy0=Math.max(0,Math.floor(-ES.oy/z)),cx1=Math.min(W-1,Math.floor((v.w-ES.ox)/z)),cy1=Math.min(H-1,Math.floor((v.h-ES.oy)/z));
  const swt=tex('SWITCH')+1,blink=((ES.t*4)|0)&1;
  for(let y=cy0;y<=cy1;y++)for(let x=cx0;x<=cx1;x++){const i=y*W+x,px=v.x+ES.ox+x*z,py=v.y+ES.oy+y*z,w=E.walls[i];
    if(w){eBlit(wallThumb(w-1,z),px,py,v);if(w===swt){eBox(px,py,z,z,C_G,v);if(z>=10)uText('E',px+(z>>1)-3,py+(z>>1)-3,C_G);}}
    else eBlit(floorThumb(E.floors[E.fmap[i]],z),px,py,v,.55);
    const m=E.marks.get(i);
    if(m){if(m.k==='door'){const c=m.lock==='Y'?C_Y:m.lock==='R'?C_R:C_W,vert=E.walls[i-W]&&E.walls[i+W];eBlit(wallThumb(tex(m.lock==='R'?'LOCKEDR':m.lock==='Y'?'LOCKED':'DOOR'),z),px,py,v);
        if(vert)eRect(px+(z>>1)-1,py,2,z,C_K,v);else eRect(px,py+(z>>1)-1,z,2,C_K,v);eBox(px,py,z,z,c,v);}
      else if(m.k==='secret')eDash(px,py,z,z,C_C,v,blink);
      else if(m.k==='amb'){eDash(px,py,z,z,m.key==='R'?C_R:C_Y,v,blink);if(z>=10)uText('A',px+(z>>1)-3,py+(z>>1)-3,m.key==='R'?C_R:C_Y);}
      else if(m.k==='spawn'){for(let yy=0;yy<z;yy+=2)for(let xx=(yy>>1)&1;xx<z;xx+=2)eRect(px+xx,py+yy,1,1,[255,0,255],v);}}
    if(z>=16&&!w){eRect(px,py,z,1,[0,0,90],v);eRect(px,py,1,z,[0,0,90],v);}else if(z>=10&&!w)eRect(px,py,1,1,[0,0,120],v);}
  // things
  for(const[i,t]of E.things){const x=i%W,y=(i/W)|0;if(x<cx0||x>cx1||y<cy0||y>cy1)continue;const px=v.x+ES.ox+x*z,py=v.y+ES.oy+y*z;
    if(z>=8){const pad=z>=16?1:0;eBlit(thingThumb(t.t,t.k,z-pad*2),px+pad,py+pad,v);}
    else{const c=t.t==='enemy'?C_R:t.t==='item'?(t.k==='KEYY'?C_Y:t.k==='KEYR'?C_R:C_G):C_GR;eRect(px+1,py+1,z-2,z-2,c,v);}
    if(t.t==='enemy'){const a=(t.dir||0)*Math.PI/4,c=px+z/2,d=py+z/2;eLine(c,d,c+Math.cos(a)*z*.6,d+Math.sin(a)*z*.6,C_Y,v);
      if(t.role==='ambush')eDash(px,py,z,z,t.key==='R'?C_R:C_Y,v,0);else if(t.role==='patrol')eBox(px,py,z,z,C_C,v);
      if(z>=16&&t.role&&t.role!=='auto'){const ch=t.role[0].toUpperCase();eRect(px+z-8,py,8,9,C_K,v);if(px+z-7>=v.x&&px+z<v.x+v.w&&py>=v.y&&py+9<v.y+v.h)uText(ch,px+z-7,py+1,t.role==='ambush'?(t.key==='R'?C_R:C_Y):C_C);}}
    if(i===ES.sel&&blink){eBox(px-1,py-1,z+2,z+2,C_W,v);}}
  // player start
  {const s=E.start,px=v.x+ES.ox+s.x*z,py=v.y+ES.oy+s.y*z,a=s.dir*Math.PI/4,cx=px+z/2,cy=py+z/2,r=Math.max(2,z*.48);
    const P0=[cx+Math.cos(a)*r,cy+Math.sin(a)*r],P1=[cx+Math.cos(a+2.5)*r,cy+Math.sin(a+2.5)*r],P2=[cx+Math.cos(a-2.5)*r,cy+Math.sin(a-2.5)*r];
    const sg=(p,q,o)=>(o[0]-q[0])*(p[1]-q[1])-(p[0]-q[0])*(o[1]-q[1]);
    for(let yy=0;yy<z;yy++)for(let xx=0;xx<z;xx++){const o=[px+xx+.5,py+yy+.5],d1=sg(P0,P1,o),d2=sg(P1,P2,o),d3=sg(P2,P0,o);if(!((d1<0||d2<0||d3<0)&&(d1>0||d2>0||d3>0)))eRect(px+xx,py+yy,1,1,C_Y,v);}
    if(ES.sel===-2&&blink)eBox(px-1,py-1,z+2,z+2,C_W,v);}
  // grid every 8 cells
  if(z>=6){for(let x=0;x<=W;x+=8)eRect(v.x+ES.ox+x*z,v.y+ES.oy,1,H*z,[0,80,160],v);for(let y=0;y<=H;y+=8)eRect(v.x+ES.ox,v.y+ES.oy+y*z,W*z,1,[0,80,160],v);}
  eBox(v.x+ES.ox-1,v.y+ES.oy-1,W*z+2,H*z+2,C_C,v);
  // hover and drag preview
  const d=ES.drag;
  if(d&&d.rect&&d.b>=0){const[x0,y0,x1,y1]=rectCells(d.a,d.b);const px=v.x+ES.ox+x0*z,py=v.y+ES.oy+y0*z;eBox(px,py,(x1-x0+1)*z,(y1-y0+1)*z,d.erase?C_R:C_Y,v);if(!d.fill&&ES.tab===0)eBox(px+z,py+z,(x1-x0-1)*z,(y1-y0-1)*z,d.erase?C_R:C_Y,v);
    const lab=(x1-x0+1)+' X '+(y1-y0+1),lw=uTW(lab)+6,lx=clamp(ES.mx+10,v.x,v.x+v.w-lw),ly=clamp(ES.my-16,v.y,v.y+v.h-12);uRect(lx,ly,lw,11,C_K);uText(lab,lx+3,ly+2,C_Y);}
  else if(ES.hc>=0&&!ES.modal){const x=ES.hc%W,y=(ES.hc/W)|0,px=v.x+ES.ox+x*z,py=v.y+ES.oy+y*z,g=ghostThumb(ES.hc);if(g&&!(d&&d.pan))eBlit(g,px,py,v,.7);eBox(px,py,z,z,blink?C_W:C_Y,v);}
  uBox(v.x-1,v.y-1,v.w+2,v.h+2,C_B);}
function ghostThumb(i){const z=ES.z,tab=ES.tab;if(ES.drag&&!ES.drag.paint)return null;
  if(tab===0)return E.walls[i]?null:wallThumb(WALLPAL[ES.pick[0]],z);
  if(tab===1)return E.walls[i]?null:floorThumb(FLOORPAL[ES.pick[1]],z);
  if(tab>=2&&tab<=4){if(E.walls[i]||E.things.has(i)||z<8)return null;const k=[ED_ITEMS,ED_ENEMIES,ED_PROPS][tab-2][ES.pick[tab]][0];return thingThumb(['item','enemy','prop'][tab-2],k,z-2);}
  return null;}
function drawPanel(){const p=PAN;uRect(p.x-2,p.y-1,p.w+4,MAPV.h+2,C_K);
  // tabs: two rows of three
  TABS.forEach((t,k)=>{const col=k%3,row=(k/3)|0,w=58,x=p.x+col*(w+2),y=p.y+row*14,on=k===ES.tab;uRect(x,y,w,12,on?C_Y:C_K);uBox(x,y,w,12,on?C_Y:C_B);
    uText((k+1)+' '+t,x+4,y+3,on?C_K:C_W);ES.hits.push({x,y,w,h:12,act:()=>{ES.tab=k;play('menu',.25,1.3);}});});
  const ents=palEntries(ES.tab),py0=p.y+32,ph=236;
  if(ES.tab===5){ents.forEach((e,k)=>{const y=py0+k*16,on=k===ES.pick[5];uRect(p.x,y,p.w,14,on?C_Y:C_K);uBox(p.x,y,p.w,14,on?C_Y:C_B);uText(e.lab,p.x+5,y+4,on?C_K:C_W);
      ES.hits.push({x:p.x,y,w:p.w,h:14,act:()=>{ES.pick[5]=k;play('menu',.25,1.3);}});});}
  else{const cs=23,cols=8,rows=Math.floor(ph/cs),maxS=Math.max(0,Math.ceil(ents.length/cols)-rows);ES.scroll[ES.tab]=clamp(ES.scroll[ES.tab],0,maxS);const s0=ES.scroll[ES.tab]*cols;
    ES.palRect={x:p.x,y:py0,w:cols*cs,h:rows*cs,max:maxS};
    for(let k=s0;k<Math.min(ents.length,s0+rows*cols);k++){const r=((k-s0)/cols)|0,c=(k-s0)%cols,x=p.x+c*cs,y=py0+r*cs;uRect(x,y,cs-2,cs-2,[0,0,60]);eBlit(ents[k].th(cs-4),x+1,y+1);
      if(k===ES.pick[ES.tab]){uBox(x-1,y-1,cs,cs,C_Y);uBox(x,y,cs-2,cs-2,C_K);}else if(ES.mx>=x&&ES.my>=y&&ES.mx<x+cs-2&&ES.my<y+cs-2&&!ES.modal)uBox(x-1,y-1,cs,cs,C_W);
      ES.hits.push({x,y,w:cs-2,h:cs-2,act:()=>{ES.pick[ES.tab]=k;play('menu',.25,1.3);},tip:ents[k].lab});}
    if(maxS){const bh=Math.max(10,rows*cs*rows/(rows+maxS)),by=py0+(rows*cs-bh)*ES.scroll[ES.tab]/maxS;uRect(p.x+p.w-3,py0,2,rows*cs,[0,0,90]);uRect(p.x+p.w-4,by,4,bh,C_C);}}
  const cur=ents[ES.pick[ES.tab]];uRect(p.x,p.y+296,p.w,1,C_B);
  if(cur&&cur.th){uRect(p.x+p.w-34,p.y+272,32,32,[0,0,60]);uBox(p.x+p.w-35,p.y+271,34,34,C_Y);eBlit(cur.th(30),p.x+p.w-33,p.y+273);}
  uText(cur?cur.lab:'',p.x,p.y+300,C_Y);
  drawProps(p.x,p.y+314,p.w);}
function arrowRow(x,y,w,label,val,onAdj,vc){uText(label,x,y,C_GR);const vs=String(val),xr=x+w;uText('▶',xr-7,y,C_W);const vx=xr-12-uTW(vs);uText(vs,vx,y,vc||C_Y);uText('◀',vx-11,y,C_W);
  ES.hits.push({x:vx-14,y:y-3,w:13,h:13,act:()=>onAdj(-1)});ES.hits.push({x:xr-10,y:y-3,w:13,h:13,act:()=>onAdj(1)});}
const DIRN=['EAST','SOUTHEAST','SOUTH','SOUTHWEST','WEST','NORTHWEST','NORTH','NORTHEAST'];
function drawProps(x,y,w){const t=ES.sel>=0?E.things.get(ES.sel):null;
  if(t&&t.t==='enemy'){const nm=(ED_ENEMIES.find(e=>e[0]===t.k)||[0,t.k])[1];uText('SELECTED: '+nm,x,y,C_C);
    arrowRow(x,y+14,w,'FACING',DIRN[t.dir||0],d=>{edSnap();t.dir=((t.dir||0)+d+8)&7;});
    if(!ETYPE[t.k].boss)arrowRow(x,y+28,w,'BEHAVIOR',(t.role||'auto').toUpperCase(),d=>{edSnap();const k=ED_ROLES.indexOf(t.role||'auto');t.role=ED_ROLES[(k+d+ED_ROLES.length)%ED_ROLES.length];});
    else uText('BOSS. GUARDS THE EXIT.',x,y+28,C_GR);
    if(t.role==='ambush')arrowRow(x,y+42,w,'WAKES ON',t.key==='R'?'RED KEY':'YELLOW KEY',()=>{edSnap();t.key=t.key==='R'?'Y':'R';},t.key==='R'?C_R:C_Y);
    return;}
  if(ES.sel===-2||ES.tab===5){uText('PLAYER START',x,y,C_C);arrowRow(x,y+14,w,'FACING',DIRN[E.start.dir],d=>{edSnap();E.start.dir=(E.start.dir+d+8)&7;});return;}
  let en=0,it=0,pr=0;for(const v of E.things.values()){if(v.t==='enemy')en++;else if(v.t==='item')it++;else pr++;}let se=0;for(const m of E.marks.values())if(m.k==='secret')se++;
  uText('ENEMIES',x,y,C_GR);uTextR(String(en),x+w,y,C_Y);uText('ITEMS',x,y+12,C_GR);uTextR(String(it),x+w,y+12,C_Y);uText('PROPS',x,y+24,C_GR);uTextR(String(pr),x+w,y+24,C_Y);uText('SECRETS',x,y+36,C_GR);uTextR(String(se),x+w,y+36,C_Y);}
function drawBar(){uRect(0,0,EW,15,C_K);uRect(0,15,EW,1,C_B);let x=4;
  x=edButton('NEW',x,1,()=>{const go=()=>{edSnapRaw();E=edNew(32,32);ES.sel=-1;ES.dirty=false;edFit();};if(ES.dirty)ES.modal={kind:'confirm',title:'NEW LEVEL',lines:['UNSAVED CHANGES ARE LOST.'],yes:go};else go();});
  if(EDCOMBO){x=edButton('OPEN',x,1,edLibOpen);x=edButton('SAVE',x,1,edLibSave);if(!EDWEB)x=edButton('EXPORT',x,1,edDownload);}else{x=edButton('OPEN',x,1,edOpen);x=edButton('SAVE',x,1,edDownload);}x=edButton('LEVEL',x,1,edSettings);
  x=edButton('TEST',x,1,edTest,C_G);x=edButton('HELP',x,1,()=>{ES.modal={kind:'help'};});x=edButton(OPT.crt?'CRT FULL':'CRT LOW',x,1,()=>{OPT.crt=OPT.crt?0:1;saveOpt();});if(EDCOMBO)x=edButton('GAME',x,1,edExit,C_C);
  let info=(E.name||'UNTITLED')+(ES.dirty?' *':'')+'  '+E.W+'X'+E.H+'  '+(E.mode==='arena'?'ARENA':'LEVEL');if(uTW(info)>EW-8-x)info=(E.name||'UNTITLED')+(ES.dirty?' *':'');uTextR(info,EW-4,4,C_C);}
function drawStatus(){const y=EH-14;uRect(0,y-1,EW,15,C_K);uRect(0,y-2,EW,1,C_B);let s='';
  if(ES.hc>=0){const x=ES.hc%E.W,yy=(ES.hc/E.W)|0,w=E.walls[ES.hc];s='X '+x+' Y '+yy+'  '+(w?A.wallNames[w-1]:'FLOOR '+(E.floors[E.fmap[ES.hc]].fl.toUpperCase()));const t=E.things.get(ES.hc);if(t)s+='  '+t.k.toUpperCase();const m=E.marks.get(ES.hc);if(m)s+='  '+(m.k==='amb'?'AMBUSH':m.k.toUpperCase());}
  else s=['LEFT PAINTS. RIGHT ERASES. SHIFT DRAG: ROOM. CTRL DRAG: BLOCK. ALT CLICK: PICK.','LEFT PAINTS. SHIFT DRAG: RECTANGLE. G: FILL AREA. ALT CLICK: PICK.','LEFT PLACES. RIGHT REMOVES.','LEFT PLACES OR SELECTS. R TURNS. DEL REMOVES.','LEFT PLACES. RIGHT REMOVES.','LEFT PLACES. RIGHT REMOVES. R TURNS THE START.'][ES.tab];
  uText(s,4,y+3,C_GR);uTextR('ZOOM '+ES.z,EW-4,y+3,C_GR);
  const tip=ES.tip;if(tip&&!ES.modal){const w=uTW(tip)+8,x=clamp(ES.mx+10,0,EW-w),yy=clamp(ES.my+14,0,EH-14);uRect(x,yy,w,12,C_K);uBox(x,yy,w,12,C_Y);uText(tip,x+4,yy+3,C_Y);}
  if(ES.toast&&ES.toast.t>0){const lines=wrap(ES.toast.s,70);const w=Math.max(...lines.map(l=>uTW(l)))+16,h=lines.length*10+8,x=(EW-w)>>1,yy=EH-40-h;uRect(x-1,yy-1,w+2,h+2,C_K);uRect(x,yy,w,h,ES.toast.c);lines.forEach((l,k)=>uText(l,x+8,yy+5+k*10,C_K));}}
