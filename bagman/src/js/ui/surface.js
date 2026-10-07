/* =====================================================================
   21. SCREENS: menus drawn inside the tube
   Every screen is drawn into a framebuffer and goes through the same palette
   and CRT pass as the game. Landscape uses the 320x240 game buffer. A phone
   held upright gets a tall 240x400 buffer so the text stays large.
   ===================================================================== */
const UPW=240,UPH=400,UCW=272,UCH=432;
const ufb=document.createElement('canvas');ufb.width=UPW;ufb.height=UPH;const uctx=ufb.getContext('2d');
const uimg=uctx.createImageData(UPW,UPH),UD=uimg.data;for(let i=3;i<UD.length;i+=4)UD[i]=255;
const ucomp=document.createElement('canvas');ucomp.width=UCW;ucomp.height=UCH;const ucctx=ucomp.getContext('2d');
let PORT=false,MODE='',PAUSED=false,PAUSEBG=null;let S={d:D,w:SW,h:SH};
const wantPort=()=>innerHeight>innerWidth*1.1;
function setMode(m){const port=m==='ui'&&wantPort();if(m===MODE&&port===PORT)return;MODE=m;PORT=port;
  const b=document.body.classList;b.remove('m-ui','m-cine','m-game','port','m-ed');b.add('m-'+m);if(port)b.add('port');
  S=port?{d:UD,w:UPW,h:UPH}:{d:D,w:SW,h:SH};resize();}
addEventListener('resize',()=>{if(MODE==='ui'&&wantPort()!==PORT){MODE='';setMode('ui');}});
function presentPort(bd){uctx.putImageData(uimg,0,0);ucctx.fillStyle=ZXC[bd];ucctx.fillRect(0,0,UCW,UCH);ucctx.drawImage(ufb,16,16);glDraw(ucomp,UCW,UCH);}
function resumePlay(){state='play';PAUSED=false;setMode('game');CRT.hit=Math.max(CRT.hit,.25);if(L){rumbleOn(!!L.rails);ambFor(L);}if(UI.wantLock&&FINE){UI.wantLock=false;try{const r=view.requestPointerLock();if(r&&r.catch)r.catch(()=>{});}catch(e){}}}

