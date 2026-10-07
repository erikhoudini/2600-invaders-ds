/* =====================================================================
   20. FRAME LOOP
   ===================================================================== */
function render(){light=P.flash>0?1.35:1;HZ=L.sniper?55:HALF;
  if(L.rails)railsRender();else{renderBack();renderWalls();renderSprites();renderParts();}
  renderWeapon();postFX();clash();if(showMap&&!L.rails&&!L.sniper)drawMap();else{if(L.sniper&&P.zoom)drawScope();overlay();}hud();}
let last=0;
function frame(ts){requestAnimationFrame(frame);let rdt=Math.min(.05,(ts-last)/1000||0);last=ts;CRT.t+=rdt;tm+=rdt;crtDecay(rdt);
  pollPad(rdt);
  if(state==='edit'){edFrame(rdt);return;}
  if(state==='ui'){uiFrame(rdt);return;}
  if(state==='comic'){comicDraw(rdt);if(comic){fctx.putImageData(img,0,0);present(borderFlash>0&&OPT.flash?borderFlashIdx:0);}borderFlash-=rdt;shake=Math.max(0,shake-rdt*2.5);return;}
  if(state==='intro'){introDraw(rdt);fctx.putImageData(img,0,0);present(borderFlash>0&&OPT.flash?borderFlashIdx:(intro&&intro.short&&L?(L.custom?L.th.bd:CH[L.n-1].bd):0));borderFlash-=rdt;shake=Math.max(0,shake-rdt*2.5);return;}
  if(!L||!['play','dying','exiting'].includes(state))return;
  if(OPT.gspd<10)rdt*=OPT.gspd/10;
  wheelTick(rdt);const dt=rdt*(P.slow>0?.35:1)*(WHEEL.open?.08:1);
  L.time+=rdt;if(state==='play'){ST.time+=rdt;if((stDirty+=rdt)>15){saveStats();achTick();}}
  if(big.time>0)big.time-=rdt;if(combo.time>0)combo.time-=rdt;for(const m of msgs)m.time-=rdt;msgs=msgs.filter(m=>m.time>0);
  lockMsgT-=rdt;P.hurt=Math.max(0,P.hurt-rdt);P.hurtDir=Math.max(0,P.hurtDir-rdt);P.flash-=rdt;borderFlash-=rdt;shake=Math.max(0,shake-rdt*2.5);
  if(L.rails){if(state==='play')railsUpdate(rdt);else if(state==='dying'){deathT+=rdt;if(deathT>1.6){state='over';rumbleOn(false);showDead();}}else if(state==='exiting'){exitT+=rdt;if(exitT>.9){state='tally';rumbleOn(false);showTally();}}}
  else{
    if(state==='play'){if(L.sniper)updPlayerSniper(rdt);else updPlayer(WHEEL.open?rdt*.08:rdt);updEnemies(dt);if(L.train)updTrain(dt);updShots(RULES.unslow?rdt*(WHEEL.open?.08:1):dt);updPFlames(dt);updFuses(dt);updBombs(dt);updWaves(dt);slotUpdate(rdt);updLoot(dt);updCars(dt);
      if(L.sniper&&!L.cleared&&L.enemies.every(e=>e.st==='dead'||e.st==='dying')){L.cleared=1;L.clearT=2.6;bigMsg('THE YARD IS CLEAR',3,C_G);}
      if(L.cleared&&(L.clearT-=rdt)<=0){state='exiting';exitT=0;}}
    else if(state==='dying'){deathT+=rdt;updEnemies(dt);updShots(dt);if(deathT>1.6){state='over';showDead();}}
    else if(state==='exiting'){exitT+=rdt;if(exitT>.9){state='tally';showTally();}}
    updDoors(dt);updParts(dt);}
  render();fctx.putImageData(img,0,0);
  present(borderFlash>0&&OPT.flash?borderFlashIdx:(P.berserk>0&&OPT.flash?(((tm*4)|0)&1?2:10):(L.custom?L.th.bd:CH[L.n-1].bd)));}

