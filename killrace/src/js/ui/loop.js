/* =====================================================================
   KILL RACE 16. FRAME LOOP AND BOOT
   Slo-mo slows the world, never the player's driving (Bagman's rule).
   ===================================================================== */
function update(rdt){const dt=rdt*(P.slow>0?.35:1);
  if(big.time>0)big.time-=rdt;if(combo.time>0)combo.time-=rdt;for(const m of msgs)m.time-=rdt;msgs=msgs.filter(m=>m.time>0);
  if(state==='play')updPlayer(rdt);
  else{deathT+=rdt;if(deathT>2.6){gameOver();return;}}
  L.cflowT-=dt;if(L.cflowT<=0){L.cflowT=.35;computeCarFlow();}
  updCars(dt);carCollisions();runOver();updPeds(dt);
  updEnemies(dt);shotsVsCars();updShots(dt);
  updFlames(dt);updBombs(dt);updMines(dt);updFuses(dt);updParts(dt);updPickups(dt);
  if(state==='play')updWaves(dt);
  // burning barrels flicker
  for(const f of L.fires)if(rnd()<dt*8&&Math.hypot(f.x-P.x,f.y-P.y)<30)addPart(f.x+(rnd()-.5)*.3,f.y+(rnd()-.5)*.3,.7,(rnd()-.5)*.2,(rnd()-.5)*.2,1+rnd(),rnd()<.5?[255,200,0]:[255,80,0],.035,.5,2);}

function renderPlay(){light=P.flash>0?1.3:1;renderBack();skyFill();krWalls();krSprites();renderParts();drawHood();drawGun();postFX();clash();overlayKR();hud();}

// copy the finished frame to the canvas, then through the tube
function show(bd){fctx.putImageData(img,0,0);present(bd);}
let last=0;
function frame(ts){requestAnimationFrame(frame);let rdt=Math.min(.05,(ts-last)/1000||0);last=ts;CRT.t+=rdt;tm+=rdt;crtDecay(rdt);pollPad();
  borderFlash-=rdt;shake=Math.max(0,shake-rdt*2.5);
  if(state==='title'){titleFrame(rdt);return;}
  if(state==='over'){overDraw(rdt);return;}
  if(state==='paused'){pauseDraw();return;}
  update(rdt);if(state==='over')return;
  renderPlay();
  show(borderFlash>0&&OPT.flash?borderFlashIdx:(P.berserk>0&&OPT.flash?(((tm*4)|0)&1?2:10):P.boosting?5:0));}

// open the page with #debug to reach the game from a test harness or the console
if(location.hash==='#debug')window.KR={P,WAVE,get L(){return L},get state(){return state},newGame,setDir,computeCarFlow,spawnCar,makeCar,kaboom,lockCycle,
  car:(k,x,y,a)=>{const c=makeCar(k,x,y,a);L.vcars.push(c);return c;}};
async function start(){initGL();resize();fctx.fillStyle='#000';fctx.fillRect(0,0,SW,SH);present(0);
  await loadAssets();makeCivSheets();makeCarSheets();touchSetup();titleInit();requestAnimationFrame(frame);}
