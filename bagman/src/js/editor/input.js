/* ---------- input ---------- */
function edSurf(cx,cy){const r=view.getBoundingClientRect();let x=(cx-r.left)/r.width*2-1,y=(cy-r.top)/r.height*2-1;
  if(gl){const kc=OPT.crt?1:.3,ox=Math.abs(y)/5.2*kc,oy=Math.abs(x)/4.3*kc;x=x+x*ox*ox;y=y+y*oy*oy;}return[(x*.5+.5)*ECW-16,(y*.5+.5)*ECH-16];}
const inRect=(x,y,r)=>x>=r.x&&y>=r.y&&x<r.x+r.w&&y<r.y+r.h;
view.addEventListener('pointerdown',e=>{if(state!=='edit')return;audioInit();const[x,y]=edSurf(e.clientX,e.clientY);ES.mx=x;ES.my=y;try{view.setPointerCapture(e.pointerId);}catch(_){}
  if(ES.modal){for(let k=ES.hits.length-1;k>=0;k--){const h=ES.hits[k];if(inRect(x,y,h)){h.act();play('menu',.25,1.2);return;}}if(e.button===2)ES.modal=null;return;}
  if(e.button===1||(e.button===0&&ES.space)){ES.drag={pan:1,x,y,ox:ES.ox,oy:ES.oy};return;}
  if(!inRect(x,y,MAPV)){if(e.button!==0)return;for(let k=ES.hits.length-1;k>=0;k--){const h=ES.hits[k];if(inRect(x,y,h)){h.act();return;}}return;}
  const i=cellAt(x,y);if(i<0)return;const erase=e.button===2;
  if(e.altKey&&!erase){eyedrop(i);return;}
  if((ES.tab===0||ES.tab===1)&&(e.shiftKey||e.ctrlKey)){ES.drag={rect:1,a:i,b:i,fill:e.ctrlKey||ES.tab===1,erase};return;}
  if(ES.tab===0||ES.tab===1){edSnap();paintCell(i,erase);ES.drag={paint:1,erase,last:i};return;}
  if(erase){edSnapRaw();if(eraseAt(i)){ES.dirty=true;play('empty',.4,1.3);}else ES.undo.pop();ES.drag={erase:1,last:i};return;}
  const t=E.things.get(i);
  if(ES.tab===3&&t&&t.t==='enemy'){ES.sel=i;ES.drag={move:1,from:i,last:i,snapped:false};play('menu',.25,1.4);return;}
  if(ES.tab===5&&E.start.x===i%E.W&&E.start.y===((i/E.W)|0)&&ED_SPECIAL[ES.pick[5]][0]==='start'){ES.sel=-2;return;}
  placeAt(i);ES.drag={place:1,last:i};});
view.addEventListener('pointermove',e=>{if(state!=='edit')return;const[x,y]=edSurf(e.clientX,e.clientY);ES.mx=x;ES.my=y;const d=ES.drag;
  ES.hc=inRect(x,y,MAPV)&&!ES.modal?cellAt(x,y):-1;if(!d)return;
  if(d.pan){ES.ox=d.ox+(x-d.x);ES.oy=d.oy+(y-d.y);return;}
  const i=cellAt(x,y);if(i<0)return;
  if(d.rect){d.b=i;return;}
  if(i===d.last)return;
  if(d.paint){const W=E.W,ax=d.last%W,ay=(d.last/W)|0,bx=i%W,by=(i/W)|0,n=Math.max(Math.abs(bx-ax),Math.abs(by-ay));for(let k=1;k<=n;k++){const cx=Math.round(ax+(bx-ax)*k/n),cy=Math.round(ay+(by-ay)*k/n);paintCell(cy*W+cx,d.erase);}d.last=i;return;}
  if(d.erase){if(eraseAt(i))ES.dirty=true;d.last=i;return;}
  if(d.move){if(E.walls[i]||E.things.has(i)||(E.marks.get(i)&&E.marks.get(i).k==='door'))return;if(!d.snapped){edSnap();d.snapped=true;}const t=E.things.get(d.last);E.things.delete(d.last);E.things.set(i,t);ES.sel=i;d.last=i;return;}
  if(d.place&&ES.tab===5&&ED_SPECIAL[ES.pick[5]][0]==='start'){if(!E.walls[i]){E.start.x=i%E.W;E.start.y=(i/E.W)|0;}d.last=i;return;}
  if(d.place&&(ES.tab===2||ES.tab===4)&&!E.things.has(i)){placeAt(i);d.last=i;}});
view.addEventListener('pointerup',e=>{if(state!=='edit')return;const d=ES.drag;ES.drag=null;if(d&&d.rect&&d.b>=0)applyRect(d.a,d.b,d.fill,d.erase);});
view.addEventListener('pointerleave',()=>{if(state==='edit')ES.hc=-1;});
view.addEventListener('wheel',e=>{if(state!=='edit')return;e.preventDefault();const[x,y]=edSurf(e.clientX,e.clientY);
  if(ES.modal){if(ES.modal.kind==='lib')ES.modal.top=(ES.modal.top||0)+(e.deltaY>0?1:-1);return;}if(ES.palRect&&inRect(x,y,ES.palRect)){ES.scroll[ES.tab]=clamp(ES.scroll[ES.tab]+(e.deltaY>0?1:-1),0,ES.palRect.max);return;}
  if(inRect(x,y,MAPV))edZoom(e.deltaY>0?-1:1,x,y);},{passive:false});
addEventListener('keyup',e=>{if(e.code==='Space')ES.space=false;});
function edKey(e){const c=e.code,m=ES.modal;keys[c]=true;
  if(m){if(m.kind==='settings'){const rows=settingRows(m);
      if(m.typing){if(c==='Enter'||c==='Escape'||c==='Tab'){m.typing=false;}else if(c==='Backspace')E.name=E.name.slice(0,-1);else if(e.key&&e.key.length===1&&E.name.length<24&&/[a-zA-Z0-9 .,'!?-]/.test(e.key))E.name+=e.key.toUpperCase();e.preventDefault();return;}
      if(c==='ArrowUp'){m.row=(m.row+rows.length-1)%rows.length;play('menu',.2,1.4);}else if(c==='ArrowDown'){m.row=(m.row+1)%rows.length;play('menu',.2,1.4);}
      else if(c==='ArrowLeft'||c==='ArrowRight'){const r=rows[m.row];if(r[2]){r[2](c==='ArrowLeft'?-1:1);play('menu',.25,1.2);}}
      else if(c==='Enter'){const r=rows[m.row];if(r[0]==='NAME')m.typing=true;else if(r[0]==='DONE')settingsDone(m);else if(r[2])r[2](1);}
      else if(c==='Escape')settingsDone(m);e.preventDefault();return;}
    if(c==='Escape'||c==='Enter'){if(m.kind==='confirm'&&c==='Enter'){ES.modal=null;m.yes();}else ES.modal=null;}e.preventDefault();return;}
  const ctrl=e.ctrlKey||e.metaKey;
  if(ctrl&&c==='KeyZ'){if(e.shiftKey)edRedo();else edUndo();e.preventDefault();return;}
  if(ctrl&&c==='KeyY'){edRedo();e.preventDefault();return;}
  if(ctrl&&c==='KeyS'){if(EDCOMBO)edLibSave();else edDownload();e.preventDefault();return;}
  if(ctrl&&c==='KeyO'){if(EDCOMBO)edLibOpen();else edOpen();e.preventDefault();return;}
  if(ctrl)return;
  if(/^Digit[1-6]$/.test(c)){ES.tab=+c[5]-1;play('menu',.25,1.3);}
  else if(c==='KeyR')selRotate(e.shiftKey?-1:1);
  else if(c==='Delete'||c==='Backspace')selDelete();
  else if(c==='KeyG'){if(ES.hc>=0){ES.tab=1;floodFloor(ES.hc);}}
  else if(c==='KeyT')edTest();
  else if(c==='KeyH'||c==='F1')ES.modal={kind:'help'};
  else if(c==='KeyF')edFit();
  else if(c==='Equal'||c==='NumpadAdd')edZoom(1,MAPV.x+MAPV.w/2,MAPV.y+MAPV.h/2);
  else if(c==='Minus'||c==='NumpadSubtract')edZoom(-1,MAPV.x+MAPV.w/2,MAPV.y+MAPV.h/2);
  else if(c==='Space')ES.space=true;
  else if(c==='Escape')ES.sel=-1;
  else return;e.preventDefault();}
addEventListener('beforeunload',e=>{if(ES.dirty&&!EDCOMBO&&state==='edit'){e.preventDefault();e.returnValue='';}});
let edPal=false;
function edStart(obj,file){if(!edPal){edPalettes();edPal=true;}EDL=null;EDTEST=false;try{E=obj?edParse(obj):edNew(32,32);}catch(e){E=edNew(32,32);}ES.libFile=file||null;ES.undo.length=0;ES.redo.length=0;ES.sel=-1;ES.modal=null;ES.tab=0;
  edFit();state='edit';PAUSED=false;try{if(document.pointerLockElement)document.exitPointerLock();}catch(e){}ambStop();rumbleOn(false);edMode();ES.dirty=false;}
// combined build: the level list lives with the game
async function edLibSave(){try{const o=edSerialize();if(!ES.libFile)ES.libFile=await libUnique(E.name);await LIB.write(ES.libFile,o);ES.dirty=false;edToast('SAVED TO CUSTOM MAPS: '+E.name,C_G);play('cash',.5);}catch(e){edToast('COULD NOT SAVE.',C_R);}}
function edLibOpen(){const m={kind:'lib',list:null,top:0};ES.modal=m;LIB.list().then(l=>{m.list=l;}).catch(()=>{m.list=[];});}
async function edLibLoad(file){try{const o=await LIB.read(file);const L0=edParse(o);edSnapRaw();E=L0;ES.libFile=file;ES.sel=-1;ES.dirty=false;ES.modal=null;edFit();edToast('OPENED '+E.name,C_G);}catch(e){edToast('THAT LEVEL COULD NOT BE READ.',C_R);}}
function edExit(){const go=()=>{EDL=null;ES.dirty=false;showCustom();};if(ES.dirty)ES.modal={kind:'confirm',title:'BACK TO THE GAME',lines:['UNSAVED CHANGES ARE LOST.'],yes:go};else go();}

window.__bagman={get E(){return E},set E(v){E=v},ES,edBuild,edTest,edSerialize,edParse,edNew,edFit,edBack,edSurf,edStart,showCustom,LIB,playCustom,get CUSTOM(){return CUSTOM},toSurf,showArenas,showCache,showChapters,arenaShopRoll,genArena,get ARENAMAP(){return ARENAMAP},showPostcard,KILOS,chainKill,wallName:i=>A.wallNames[i],audioInit,P,get L(){return L},get R(){return R_},startLevel,freshSnap,chapterSnap,get state(){return state},set state(v){state=v},tryFire,lockCycle,CH,genLevel,introStart,explode,comicStart,get comic(){return comic},trySecret,pickup,fb,arenaStart,showShop,dropDrum,showAch,showOptions,showCuts,showScoreAttack,showCheats,get UNL(){return UNL},get GM(){return GM},candidates,lockShift,dec,hurtEnemy,carHit,get slot(){return slot},get ST(){return ST},WHEEL,wheelPress,wheelRelease,wheelAim,showBet,showBlackjack,showMods,showHustles,showStory,showMenu,showPause,showStats,showKeys,showHow,get UI(){return UI},uiKey,get RULES(){return RULES},set DIFF(v){DIFF=v},get MRUN(){return MRUN},set MRUN(v){MRUN=v},computeRules,setMode,WEAP,get WAVEMODS(){return WAVEMODS},bench:(n=30)=>{const t0=performance.now();for(let i=0;i<n;i++)render();return (performance.now()-t0)/n;},get ACHV(){return ACHV},set ACHV(v){ACHV=v},toggleMap,cast,showCredits};
