/* ---------- test play ---------- */
function edTest(){const p=edProblems();if(p.out.length){ES.modal={kind:'msg',title:'CANNOT TEST',lines:p.out};play('empty',.6);return;}
  audioInit();if(typeof CUSTOM!=='undefined')CUSTOM=null;EDL=E;EDTEST=true;for(const k in keys)keys[k]=false;
  const snap=[freshSnap(),chapterSnap(3),chapterSnap(5)][E.kit]||freshSnap();snap.score=0;
  if(E.mode==='arena'){GM='arena';DIFF='normal';ARENAMOD=false;WAVEMODS=[];ARENAMAP='custom';startLevel(2,snap,'arena');L.arena=1;L.modArena=false;P.cash=600;P.drums=0;P.special=null;
    Object.assign(L.wave,{total:1e9,n:0,pause:2.5,mult:1,nextHike:4+Math.floor(rnd()*4),jp:0,shop:'normal'});}
  else{DIFF='normal';startLevel(1,snap,'edit');}
  resumePlay();if(p.warn.length)feed(p.warn[0],C_Y);}
function edBack(why){const L0=L;EDTEST=false;PAUSED=false;state='edit';rumbleOn(false);if(typeof ambStop==='function')ambStop();try{if(document.pointerLockElement)document.exitPointerLock();}catch(e){}
  for(const k in keys)keys[k]=false;mouseFire=false;firing=false;edMode();
  if(why==='dead')edToast('DEAD. '+(L0?L0.kills+' KILLS, '+fmtT(L0.time)+'.':''),C_R);
  else if(why==='done')edToast('LEVEL FINISHED. '+L0.kills+' OF '+L0.total+' KILLS, '+L0.secretsFound+' OF '+L0.secrets+' SECRETS, '+fmtT(L0.time)+'.',C_G);
  else if(why==='arena')edToast('DEAD ON WAVE '+(L0.wave?L0.wave.n:0)+'. '+L0.kills+' KILLS.',C_R);}

