/* ---------- modal panels: settings, help, messages ---------- */
function edSettings(){edSnapRaw();ES.modal={kind:'settings',row:0,W:E.W,H:E.H,typing:false};}
function settingRows(m){const rows=[['NAME',(E.name||'')+(m.typing&&((ES.t*3)|0)%2?'_':''),null],['MODE',E.mode==='arena'?'ARENA':'LEVEL',d=>{E.mode=E.mode==='arena'?'level':'arena';}],
  ['SKY',E.sky?'OPEN SKY':'CEILING',d=>{E.sky=E.sky?0:1;}]];
  if(E.sky)rows.push(['TIME',E.dawn?'DAWN':'NIGHT',d=>{E.dawn=E.dawn?0:1;}]);else rows.push(['CEILING COLOR',ZXN[E.ceil],d=>{E.ceil=(E.ceil+d+8)%8;}]);
  rows.push(['BORDER COLOR',ZXN[E.border],d=>{E.border=(E.border+d+8)%8;}],['START WITH',ED_KITS[E.kit],d=>{E.kit=(E.kit+d+3)%3;}],
    ['WIDTH',m.W,d=>{m.W=clamp(m.W+d,8,64);}],['HEIGHT',m.H,d=>{m.H=clamp(m.H+d,8,64);}],['DONE','',null]);return rows;}
function settingsDone(m){if(m.W!==E.W||m.H!==E.H){edSnapRaw();edResize(m.W,m.H);edFit();}ES.modal=null;ES.dirty=true;play('menu',.3,1.2);}
function drawModal(){const m=ES.modal;if(!m)return;for(let i=0;i<ED.length;i+=4){ED[i]*=.25;ED[i+1]*=.25;ED[i+2]*=.25;}
  const w=m.kind==='help'?560:420,h=m.kind==='help'?360:m.kind==='lib'?270:(m.kind==='settings'?210:110),x=(EW-w)>>1,y=(EH-h)>>1;uRect(x,y,w,h,C_K);uBox(x,y,w,h,C_C);uBox(x+2,y+2,w-4,h-4,C_B);
  ES.hits.length=0;
  if(m.kind==='settings'){uTextS('LEVEL',x+12,y+10,C_Y,2);const rows=settingRows(m);
    rows.forEach((r,k)=>{const yy=y+34+k*18,on=k===m.row;if(on)uRect(x+8,yy-4,w-16,15,C_B);uText((on?'> ':'  ')+r[0],x+12,yy,on?C_W:C_GR);
      if(r[2]){const vs=String(r[1]),xr=x+w-14;uText('▶',xr-7,yy,C_W);const vx=xr-12-uTW(vs);uText(vs,vx,yy,C_Y);uText('◀',vx-11,yy,C_W);
        ES.hits.push({x:vx-14,y:yy-4,w:13,h:15,act:()=>{m.row=k;r[2](-1);}});ES.hits.push({x:xr-10,y:yy-4,w:13,h:15,act:()=>{m.row=k;r[2](1);}});}
      else if(r[0]==='NAME'){uText(r[1],x+w-14-uTW(String(r[1])),yy,C_Y);ES.hits.push({x:x+8,y:yy-4,w:w-16,h:15,act:()=>{m.row=k;m.typing=true;}});}
      else ES.hits.push({x:x+8,y:yy-4,w:w-16,h:15,act:()=>settingsDone(m)});});
    const hint=m.typing?'TYPE THE NAME. ENTER WHEN DONE.':(m.W<E.W||m.H<E.H)?'SHRINKING CUTS OFF THE RIGHT AND BOTTOM EDGES.':'';if(hint)uText(hint,x+12,y+h-14,m.typing?C_C:C_R);}
  else if(m.kind==='lib'){uTextS('OPEN',x+12,y+10,C_Y,2);const list=m.list;
    if(!list)uText('LOADING',x+16,y+40,C_GR);else if(!list.length)uText('NO SAVED LEVELS YET.',x+16,y+40,C_GR);
    else{const n=12;m.top=clamp(m.top||0,0,Math.max(0,list.length-n));list.slice(m.top,m.top+n).forEach((o,k)=>{const yy=y+36+k*16,hov=ES.mx>=x+8&&ES.mx<x+w-8&&ES.my>=yy-3&&ES.my<yy+12;
        if(hov)uRect(x+8,yy-3,w-16,15,C_B);uText(o.name,x+16,yy,C_W);uTextR((o.mode==='arena'?'ARENA':'LEVEL')+'  '+o.W+'X'+o.H,x+w-16,yy,C_C);
        ES.hits.push({x:x+8,y:yy-3,w:w-16,h:15,act:()=>edLibLoad(o.file)});});
      if(list.length>n)uText((m.top+1)+' TO '+Math.min(list.length,m.top+n)+' OF '+list.length+'. WHEEL SCROLLS.',x+16,y+36+n*16,C_GR);}
    let bx=x+12;if(!EDWEB)bx=edButton('OPEN A FILE',bx,y+h-24,()=>{ES.modal=null;edOpen();});if(LIB.desk)bx=edButton('LEVELS FOLDER',bx,y+h-24,()=>LIB.folder());edButton('CANCEL',bx,y+h-24,()=>{ES.modal=null;});}
  else if(m.kind==='help'){uTextS('HELP',x+12,y+10,C_Y,2);const L0=[['MOUSE',''],['LEFT CLICK OR DRAG','PAINT OR PLACE'],['RIGHT CLICK OR DRAG','ERASE'],['SHIFT + DRAG','WALL ROOM OUTLINE, FLOOR RECTANGLE'],['CTRL + DRAG','SOLID BLOCK OF WALL'],['ALT + CLICK','PICK THE WALL OR FLOOR UNDER THE CURSOR'],
      ['MIDDLE DRAG, SPACE + DRAG','MOVE THE VIEW'],['WHEEL','ZOOM. OVER THE PALETTE, SCROLL'],['KEYS',''],['1 TO 6','TABS'],['R, SHIFT + R','TURN THE SELECTED ENEMY OR START'],['DELETE','REMOVE THE SELECTED ENEMY'],['G','FILL THE OPEN AREA UNDER THE CURSOR WITH FLOOR'],
      ['ARROWS','MOVE THE VIEW'],['+ AND -, F','ZOOM, FIT THE MAP'],['CTRL + Z, CTRL + Y','UNDO, REDO'],['CTRL + S, CTRL + O','SAVE, OPEN'],['T','TEST. ESC IN THE GAME COMES BACK HERE'],['ESC','CLOSE THIS PANEL']];
    L0.forEach((r,k)=>{const yy=y+36+k*16;if(!r[1]){uText(r[0],x+16,yy,C_C);uRect(x+16,yy+10,w-32,1,C_B);}else{uText(r[0],x+24,yy,C_W);uText(r[1],x+230,yy,C_Y);}});
    ES.hits.push({x,y,w,h,act:()=>{ES.modal=null;}});}
  else{uTextS(m.title,x+12,y+10,m.kind==='msg'?C_R:C_Y,2);(m.lines||[]).forEach((l,k)=>uText(l,x+12,y+36+k*12,C_W));
    if(m.kind==='confirm'){let bx=x+12;bx=edButton('YES',bx,y+h-24,()=>{ES.modal=null;m.yes();});edButton('NO',bx,y+h-24,()=>{ES.modal=null;});}
    else edButton('OK',x+12,y+h-24,()=>{ES.modal=null;});}}
function edFrame(dt){ES.t+=dt;if(ES.toast)ES.toast.t-=dt;if(S.d!==ED)edMode();ES.hits.length=0;
  if(ES.drag&&ES.drag.pan){}
  // arrow keys pan
  const pan=ES.modal?0:320*dt;if(keys.ArrowLeft)ES.ox+=pan;if(keys.ArrowRight)ES.ox-=pan;if(keys.ArrowUp)ES.oy+=pan;if(keys.ArrowDown)ES.oy-=pan;
  {const z=ES.z,m=24;ES.ox=clamp(ES.ox,m-E.W*z,MAPV.w-m);ES.oy=clamp(ES.oy,m-E.H*z,MAPV.h-m);}
  uRect(0,0,EW,EH,C_K);edDrawMap();drawPanel();drawBar();
  ES.tip=null;if(!ES.modal){for(let k=ES.hits.length-1;k>=0;k--){const h=ES.hits[k];if(ES.mx>=h.x&&ES.my>=h.y&&ES.mx<h.x+h.w&&ES.my<h.y+h.h){ES.tip=h.tip||null;break;}}}
  drawStatus();drawModal();
  efx.putImageData(eimg,0,0);ecx.fillStyle=ZXC[E.border];ecx.fillRect(0,0,ECW,ECH);ecx.drawImage(efb,16,16);glDraw(ecomp,ECW,ECH);}

