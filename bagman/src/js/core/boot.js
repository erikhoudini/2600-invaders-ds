/* =====================================================================
   23. BOOT
   ===================================================================== */
async function start(){initGL();resize();loadSave();await loadAssets();
  fctx.fillStyle='#000';fctx.fillRect(0,0,SW,SH);present(0);if(location.hash==='#editor'&&edUnlocked())edStart();else showSplash();requestAnimationFrame(frame);}
addEventListener('gamepadconnected',()=>{UI.input='pad';toast('CONTROLLER READY',C_G);});
