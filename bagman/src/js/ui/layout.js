/* ---------- standard layout: header, art, text, rows, list, description, footer ---------- */
const M=()=>PORT?12:10;
function header(sc){let y=PORT?12:8;const m=M(),W=S.w;
  if(sc.eyebrow){uText(ev(sc.eyebrow),m,y,C_C);y+=12;}
  if(sc.title){const t=ev(sc.title);const room=W-2*m-(sc.back&&UI.input!=='key'?48:0);const s=sc.tsc||uFit(t,room,2);uTextS(t,m,y,sc.tcol||C_Y,s);y+=8*s+(PORT?9:7);}
  return y;}
function backBtn(sc){if(!sc.back||UI.input==='key')return;const t='◀ BACK',w=uTW(t)+10,x=S.w-M()-w,y=PORT?8:4;uRect(x,y,w,14,C_K);uBox(x,y,w,14,C_GR);uText(t,x+5,y+4,C_W);UI.hits.push({x:x-4,y,w:w+8,h:20,back:1});}
function hintText(sc){if(sc.foot!=null)return ev(sc.foot);if(UI.input==='pad'){const it=(sc.items||[])[UI.sel];return (it&&it.adj?'\u25C0\u25B6 CHANGE  ':'')+(sc.doc?'\u25B2\u25BC SCROLL':'\u25B2\u25BC MOVE  A OK')+(sc.back?'  B BACK':'');}if(UI.input==='touch')return sc.back?'TAP TO CHOOSE   ◀ BACK TO RETURN':'TAP TO CHOOSE';
  if(UI.input==='mouse')return 'CLICK TO CHOOSE'+(sc.back?'  RIGHT CLICK BACK':'');
  const it=(sc.items||[])[UI.sel];return (it&&it.adj?'◀▶ CHANGE  ':'')+(sc.doc?'▲▼ SCROLL':'▲▼ MOVE  ENTER OK')+(sc.back?'  ESC BACK':'');}
function footer(sc){const H=S.h,W=S.w,m=M();uRect(0,H-13,W,13,C_K);uRect(m,H-13,W-2*m,1,C_B);let h=hintText(sc);if(uTW(h)>W-2*m)h=h.slice(0,Math.floor((W-2*m)/7));uText(h,m,H-9,C_GR);
  if(UI.toast&&UI.toast.t>0){const lines=wrap(UI.toast.s,Math.floor((W-24)/7));const w=Math.max(...lines.map(l=>uTW(l)))+12,hh=lines.length*10+6,x=(W-w)>>1,y=H-20-hh;
    uRect(x-1,y-1,w+2,hh+2,C_K);uRect(x,y,w,hh,UI.toast.c);lines.forEach((l,i)=>uText(l,x+6,y+4+i*10,C_K));}}
function subOf(it){if(!it)return null;const d=ev(it.dis);if(typeof d==='string')return{s:d,c:C_R};const s=ev(it.sub);return s?{s,c:C_C}:null;}
function drawItems(sc,x,y,w,yBottom){const items=sc.items||[];const big=!!sc.big,isc=big?2:1,rh=sc.rh||(big?(PORT?26:20):(PORT?18:13));
  const n=Math.max(1,Math.floor((yBottom-y)/rh));if(UI.sel<UI.top)UI.top=UI.sel;if(UI.sel>=UI.top+n)UI.top=UI.sel-n+1;UI.top=clamp(UI.top,0,Math.max(0,items.length-n));
  UI.listRH=rh;UI.listN=n;
  for(let k=0;k<n&&UI.top+k<items.length;k++){const i=UI.top+k,it=items[i],yy=y+k*rh;
    if(it.kind==='head'){uText(ev(it.label),x,yy+rh-11,C_C);uRect(x,yy+rh-2,w,1,C_B);continue;}
    if(it.kind==='gap')continue;
    const ty=yy+((rh-2-7*isc)>>1),ty1=yy+((rh-2-7)>>1);
    if(it.kind==='row'){uText(ev(it.label),x+2,ty1,C_GR);const v=ev(it.val);if(v!=null)uTextR(v,x+w-2,ty1,it.vc||C_Y);continue;}
    const sel=i===UI.sel,dis=ev(it.dis);
    if(sel){uRect(x,yy,w,rh-2,dis?C_GR:C_Y);if(UI.input!=='key'||((UI.t*3)|0)%2===0)uText('>',x+3,ty,C_K,isc);}
    const lc=sel?C_K:(dis?[100,100,100]:(ev(it.col)||C_W));uText(ev(it.label),x+(big?22:12),ty,lc,isc);
    const v=ev(it.val);UI.hits.push({x,y:yy,w,h:rh-2,i});
    if(it.adj){const vs=v!=null?String(v):'';const xr=x+w-4;uText('▶',xr-7,ty1,sel?C_K:C_GR);const vx=xr-12-uTW(vs);uText(vs,vx,ty1,sel?C_K:C_Y);uText('◀',vx-11,ty1,sel?C_K:C_GR);
      UI.hits.push({x:vx-16,y:yy,w:16,h:rh-2,i,adj:-1});UI.hits.push({x:xr-14,y:yy,w:18,h:rh-2,i,adj:1});}
    else if(v!=null)uTextR(v,x+w-6,ty1,sel?C_K:(ev(it.vc)||C_Y));}
  if(UI.top>0)uText('▲',x+w-8,y-10,C_C);if(UI.top+n<items.length)uText('▼',x+w-8,y+n*rh,C_C);
  return y+Math.min(n,items.length)*rh;}
function drawStd(sc){const W=S.w,H=S.h,m=M();let y=header(sc);let x=m,w=W-2*m;const art=ev(sc.art);
  if(art){if(PORT){const ah=sc.artH||((sc.items||[]).length>5||sc.rows?100:140);const r=uImg(art,m,y,W-2*m,ah,sc.artMode==='contain'?'contain':'cover',sc.artY);
      if(r)uBox(r.x-2,r.y-2,r.w+4,r.h+4,ev(sc.artCol)||C_W);y+=(r?r.h:ah)+8;const cp=ev(sc.cap);if(cp){const ct=cp.s||cp;uTextC(ct,y-2,cp.c||C_C);y+=10;}}
    else{const aw=sc.artW||118,ah=H-y-22-(sc.cap?14:0);const r=uImg(art,m,y,aw,Math.min(ah,sc.artMaxH||ah),sc.artMode||'contain',sc.artY);if(r)uBox(r.x-2,r.y-2,r.w+4,r.h+4,ev(sc.artCol)||C_W);
      const cp=ev(sc.cap);if(cp){const ct=cp.s||cp;uText(ct,m+((aw-uTW(ct))>>1),(r?r.y+r.h:y+60)+6,cp.c||C_C);}x=m+aw+10;w=W-x-m;}}
  else if(PORT&&sc.cap){const cp=ev(sc.cap);if(cp){const ct=cp.s||cp;uTextC(ct,y,cp.c||C_C);y+=12;}}
  const cols=Math.floor(w/7);
  for(const p of (sc.text?ev(sc.text):[])){const o=typeof p==='string'?{s:p}:p;const s=ev(o.s);if(!s)continue;for(const l of wrap(s,cols)){uText(l,x,y,o.c||C_W);y+=10;}y+=5;}
  if(sc.rows){for(const r of ev(sc.rows)){uText(r[0],x,y,C_GR);uTextR(String(r[1]),x+w,y,r[2]||C_Y);uRect(x,y+9,w,1,[0,0,110]);y+=12;}y+=6;}
  let bottom=H-17;
  if(sc.items&&sc.items.some(it=>it.sub||typeof it.dis==='string'||isFn(it.dis))){if(sc._subN==null){let mx=1;for(const it of sc.items){for(const s of[ev(it.sub),typeof ev(it.dis)==='string'?ev(it.dis):''])if(s)mx=Math.max(mx,wrap(s,cols-1).length);}sc._subN=Math.min(mx,6);}
    const bh=sc._subN*9+7;bottom=H-17-bh-3;const sub=subOf(sc.items[UI.sel]);
    if(sub){const lines=wrap(sub.s,cols-1);uBox(x,bottom+3,w,bh,sub.c===C_R?C_R:C_B);lines.slice(0,sc._subN).forEach((l,i)=>uText(l,x+4,bottom+7+i*9,sub.c===C_R?C_R:C_W));}}
  if(sc.items)drawItems(sc,x,y,w,bottom);}
// scrolling documents: credits, statistics
function drawDoc(sc){const W=S.w,H=S.h,m=M();const top=header(sc),x=m,w=W-2*m-6,cols=Math.floor(w/7),bottom=H-17;UI.viewH=bottom-top;
  if(!sc._lines||sc._cols!==cols){sc._cols=cols;const out=[];for(const b of ev(sc.doc)){
      if(b.h){out.push({gap:6});out.push({t:b.h,c:C_C,rule:1});}else if(b.kv)out.push({k:b.kv[0],v:b.kv[1]});else if(b.sp)out.push({gap:5});
      else for(const l of wrap(b.s,cols))out.push({t:l,c:b.c||C_W});}sc._lines=out;}
  let yy=top-UI.dy,ch=0;
  for(const l of sc._lines){const h=l.gap!=null?l.gap:(l.rule?12:10);if(yy>=top&&yy+8<=bottom){
      if(l.k!=null){uText(l.k,x,yy,C_GR);uTextR(l.v,x+w,yy,C_Y);}else if(l.t!=null){uText(l.t,x,yy,l.c);if(l.rule)uRect(x,yy+9,w,1,C_B);}}
    yy+=h;ch+=h;}
  UI.contentH=ch;UI.dy=clamp(UI.dy,0,Math.max(0,ch-UI.viewH));
  if(ch>UI.viewH){const bh=Math.max(10,UI.viewH*UI.viewH/ch),by=top+(UI.viewH-bh)*UI.dy/Math.max(1,ch-UI.viewH);uRect(W-m-2,top,2,UI.viewH,[0,0,90]);uRect(W-m-3,by,4,bh,C_C);}}
function drawPauseBG(){if(!PAUSEBG){uClear();return;}
  if(!PORT){S.d.set(PAUSEBG);uDim(.17);return;}
  uClear();const d=S.d;for(let y=0;y<180;y++){const sy=(y*4/3)|0;for(let x=0;x<240;x++){const si=(sy*SW+((x*4/3)|0))*4,i=(y*UPW+x)*4;d[i]=PAUSEBG[si]*.17;d[i+1]=PAUSEBG[si+1]*.17;d[i+2]=PAUSEBG[si+2]*.17;}}}
function snapPause(){PAUSEBG=new Uint8ClampedArray(D);}
function uiFrame(dt){UI.t+=dt;if(UI.toast)UI.toast.t-=dt;shake=Math.max(0,shake-dt*2.5);borderFlash-=dt;const sc=UI.scr;if(!sc)return;
  if(sc.tick)sc.tick(dt);UI.hits.length=0;
  if(PAUSED||sc.bg==='pause')drawPauseBG();else uClear();
  if(sc.draw)sc.draw(sc);else if(sc.doc)drawDoc(sc);else drawStd(sc);
  backBtn(sc);if(!sc.nofoot)footer(sc);
  const bd=borderFlash>0&&OPT.flash?borderFlashIdx:(ev(sc.border)??1);
  if(PORT)presentPort(bd);else{fctx.putImageData(img,0,0);present(bd);}}
function confirmBox(title,msg,yes,no){ui({title,border:2,text:[msg],items:[{label:'YES',act:yes},{label:'NO',act:no}],back:no,sel:1});}

