/* ---------- screen state, navigation and input ---------- */
const UI={scr:null,sel:0,top:0,dy:0,t:0,hits:[],toast:null,input:matchMedia('(pointer:coarse)').matches?'touch':'key',cap:null,capA:null,contentH:0,viewH:1,listRH:13,listN:1};
function ui(scr){if(document.pointerLockElement){UI.wantLock=true;try{document.exitPointerLock();}catch(e){}}
  firing=false;mouseFire=false;stick={x:0,y:0};for(const k in keys)keys[k]=false;WHEEL.down=0;WHEEL.open=0;
  UI.scr=scr;UI.t=0;UI.top=0;UI.dy=0;UI.cap=null;UI.capA=null;uiPtr=null;
  const items=scr.items||[];let s=scr.sel!=null?scr.sel:items.findIndex(it=>!it.kind&&!ev(it.dis));if(s<0)s=items.findIndex(it=>!it.kind);UI.sel=Math.max(0,s);
  state='ui';setMode('ui');rumbleOn(false);timeScaleAudio=1;ambStop();if(muff&&AC)muff.frequency.setTargetAtTime(20000,AC.currentTime,.1);}
function toast(s,c=C_Y){UI.toast={s:String(s).toUpperCase(),t:1.8,c};}
const focusable=it=>it&&!it.kind;
function uiMove(d){const items=UI.scr.items||[];if(!items.length)return;let i=UI.sel;for(let n=0;n<items.length;n++){i=(i+d+items.length)%items.length;if(focusable(items[i]))break;}
  if(i!==UI.sel){UI.sel=i;play('menu',.25,1.4,.03);}}
function uiAct(i){const it=(UI.scr.items||[])[i==null?UI.sel:i];if(!it||it.kind)return;audioInit();const dis=ev(it.dis);
  if(dis){play('empty',.5,1,.05);if(typeof dis==='string'&&dis)toast(dis,C_R);return;}
  if(it.adj&&!it.act){it.adj(1);play('menu',.35,1.6);return;}play('menu',.45);if(it.act)it.act();}
function uiBack(){const sc=UI.scr;if(!sc||!sc.back)return;play('menu',.35,.7);sc.back();}
function uiAdj(d){const it=(UI.scr.items||[])[UI.sel];if(it&&it.adj&&!ev(it.dis)){it.adj(d);play('menu',.35,d>0?1.6:1.2);return true;}return false;}
function uiScroll(d){UI.dy=clamp(UI.dy+d,0,Math.max(0,UI.contentH-UI.viewH));}
const KUP=()=>['ArrowUp','KeyW',KB.fwd],KDN=()=>['ArrowDown','KeyS',KB.back],KLT=()=>['ArrowLeft','KeyA',KB.left,KB.turnL],KRT=()=>['ArrowRight','KeyD',KB.right,KB.turnR],KOK=()=>['Enter','NumpadEnter','Space',KB.fire];
function uiKey(e){const c=e.code;UI.input='key';audioInit();const sc=UI.scr;if(!sc)return;
  if(UI.cap){e.preventDefault();UI.cap(e);return;}
  if(sc.keys&&sc.keys(e)){e.preventDefault();return;}
  if(sc.row){if(KLT().includes(c)||KUP().includes(c)){uiMove(-1);e.preventDefault();return;}if(KRT().includes(c)||KDN().includes(c)){uiMove(1);e.preventDefault();return;}}
  if(KUP().includes(c)){if(sc.doc)uiScroll(-14);else uiMove(-1);}
  else if(KDN().includes(c)){if(sc.doc)uiScroll(14);else uiMove(1);}
  else if(c==='PageUp')uiScroll(-UI.viewH);else if(c==='PageDown')uiScroll(UI.viewH);
  else if(KLT().includes(c)){if(!uiAdj(-1)&&sc.lr)sc.lr(-1);}
  else if(KRT().includes(c)){if(!uiAdj(1)&&sc.lr)sc.lr(1);}
  else if(KOK().includes(c)){if(e.repeat)return;if(sc.doc&&!sc.items)uiBack();else uiAct();}
  else if(c==='Escape'||c==='Backspace'){if(e.repeat)return;uiBack();}
  else return;e.preventDefault();}
// pointer to buffer coordinates, through the same barrel warp the tube shader applies
function toSurf(cx,cy){const r=view.getBoundingClientRect();let x=(cx-r.left)/r.width*2-1,y=(cy-r.top)/r.height*2-1;
  if(gl){const kc=OPT.crt?1:.3,ox=Math.abs(y)/5.2*kc,oy=Math.abs(x)/4.3*kc;x=x+x*ox*ox;y=y+y*oy*oy;}
  const u=x*.5+.5,v=y*.5+.5;return PORT?[u*UCW-16,v*UCH-16]:[u*CW-16,v*CHh-12];}
function uiHit(x,y){for(let k=UI.hits.length-1;k>=0;k--){const h=UI.hits[k];if(x>=h.x&&y>=h.y&&x<h.x+h.w&&y<h.y+h.h)return h;}return null;}
const hitEq=(a,b)=>!!a&&!!b&&a.i===b.i&&a.adj===b.adj&&a.back===b.back&&a.k===b.k&&a.card===b.card;
let uiPtr=null;
view.addEventListener('pointerdown',e=>{if(state!=='ui')return;audioInit();UI.input=e.pointerType==='mouse'?'mouse':'touch';if(e.button===2){uiBack();return;}
  const[x,y]=toSurf(e.clientX,e.clientY);const h=uiHit(x,y);uiPtr={id:e.pointerId,y0:y,h,moved:0,top:UI.top,dy:UI.dy};
  const items=UI.scr.items||[];if(h&&h.i!=null&&!h.adj&&focusable(items[h.i]))UI.sel=h.i;try{view.setPointerCapture(e.pointerId);}catch(_){}});
view.addEventListener('pointermove',e=>{if(state!=='ui')return;const[x,y]=toSurf(e.clientX,e.clientY);
  if(uiPtr&&uiPtr.id===e.pointerId){const dy=y-uiPtr.y0;if(Math.abs(dy)>6)uiPtr.moved=1;
    if(uiPtr.moved){if(UI.scr.doc)UI.dy=clamp(uiPtr.dy-dy,0,Math.max(0,UI.contentH-UI.viewH));else UI.top=clamp(uiPtr.top-Math.round(dy/UI.listRH),0,Math.max(0,(UI.scr.items||[]).length-UI.listN));}return;}
  if(e.pointerType!=='mouse')return;UI.input='mouse';const h=uiHit(x,y);if(!h)return;
  if(UI.scr.hover)UI.scr.hover(h);const items=UI.scr.items||[];if(h.i!=null&&focusable(items[h.i])&&UI.sel!==h.i){UI.sel=h.i;play('menu',.2,1.4,.03);}});
view.addEventListener('pointerup',e=>{if(state!=='ui'||!uiPtr||uiPtr.id!==e.pointerId)return;const p=uiPtr;uiPtr=null;if(p.moved)return;
  const[x,y]=toSurf(e.clientX,e.clientY);const h=uiHit(x,y);if(!h||!hitEq(h,p.h))return;
  if(h.back){uiBack();return;}if(UI.scr.tap&&UI.scr.tap(h))return;if(h.adj){UI.sel=h.i;uiAdj(h.adj);return;}if(h.i!=null)uiAct(h.i);});
view.addEventListener('pointercancel',()=>{uiPtr=null;});
view.addEventListener('wheel',e=>{if(state!=='ui')return;e.preventDefault();if(UI.scr.doc)uiScroll(e.deltaY>0?28:-28);else if(UI.scr.wheel)UI.scr.wheel(e.deltaY>0?1:-1);else uiMove(e.deltaY>0?1:-1);},{passive:false});

