/* =====================================================================
   KILL RACE 1b. SOUND AND MUSIC
   Bagman's sounds are 1-bit beeper samples. Kill Race adds a table of real
   car sounds and music (KA, from killrace/assets: see CREDITS.md). They go
   into Bagman's sample table, so Bagman's play() and gain chain handle them,
   and each one falls back to the Bagman sound it replaces if it is missing.
     loops  the engine (pitched to the revs), tyre squeal (by slip)
     music  one track per mode, streamed from the page, M to mute
   ===================================================================== */
Object.assign(A.snd,KA.snd||{});
const has=k=>!!SBUF[k];
// play the first of several takes that has loaded, so repeats don't sound the same
function playAny(ks,vol,rate,gap){const ok=ks.filter(has);if(!ok.length)return null;return play(ok[Math.floor(rnd()*ok.length)],vol,rate,gap);}
function krSounds(){const S0=Object.assign({},SFX),pick=(ks,vol,rate,gap,fb)=>(...a)=>playAny(ks,vol,typeof rate==='function'?rate():rate,gap)||fb(...a);
  SFX.tommy=pick(['mg1','mg2'],.55,()=>.95+rnd()*.1,0,S0.tommy);
  SFX.shotgun=pick(['shotgun'],.9,()=>.95+rnd()*.1,0,S0.shotgun);
  SFX.boom=(v=1)=>playAny(['boom1','boom2','boom3'],.9*v,.9+rnd()*.2,.05)||S0.boom(v);
  SFX.bigboom=()=>playAny(['bigboom'],1,.9+rnd()*.15,.08)||S0.bigboom();
  SFX.horn=pick(['horn'],.8,1,0,S0.horn);}
// car-on-car and car-on-wall: crunch by impact, falling back to Bagman's thud
function crashSnd(v,hard){if(!playAny(hard?['crash1','crash2','crash3']:['bump1','bump2','crash1'],Math.min(1,v),.9+rnd()*.2,.06))play('thud',v,.45);}
function rocketSnd(v){if(!playAny(['rocket'],.7*v,1+rnd()*.1,.05))play('push',.7*v,.35);}

/* ---------- loops ---------- */
const LOOP={};
function loopSet(k,src,vol,rate){if(!AC)return;let l=LOOP[k];
  if(!l&&vol>0.005&&SBUF[src]){const s=AC.createBufferSource();s.buffer=SBUF[src];s.loop=true;const g=AC.createGain();g.gain.value=0;s.connect(g);g.connect(master);s.start();l=LOOP[k]={s,g};}
  if(!l)return;l.g.gain.setTargetAtTime(vol,AC.currentTime,.05);l.s.playbackRate.setTargetAtTime(rate*timeScaleAudio,AC.currentTime,.05);}
function loopsOff(){for(const k in LOOP){try{LOOP[k].s.stop();}catch(e){}delete LOOP[k];}}
// true if the real engine loop is running, so the caller can skip Bagman's
function engineSnd(rpm,gear,thr,boost,skid,slip){if(!has('engine2'))return false;if(rumble)rumbleOn(false);
  loopSet('eng','engine2',.22+.25*thr,.55+rpm*.75+gear*.07+(boost?.15:0));
  loopSet('skid','skid',skid?Math.min(.5,.12+slip*.08):0,.9+Math.min(.3,slip*.05));return true;}

/* ---------- music: an <audio> element, so the big file streams instead of decoding ---------- */
const MUSIC={el:null,cur:'',on:true};try{MUSIC.on=localStorage.getItem('killrace.music')!=='0';}catch(e){}
function musicFor(mode){const src=(KA.music||{})[mode];if(!src||!MUSIC.on){musicStop();return;}
  if(MUSIC.cur===mode&&MUSIC.el&&!MUSIC.el.paused)return;musicStop();
  const el=new Audio(src);el.loop=true;el.volume=.45*OPT.vol/7;MUSIC.el=el;MUSIC.cur=mode;el.play().catch(()=>{MUSIC.cur='';});}
function musicStop(){if(MUSIC.el){MUSIC.el.pause();MUSIC.el=null;}MUSIC.cur='';}
function musicToggle(){MUSIC.on=!MUSIC.on;try{localStorage.setItem('killrace.music',MUSIC.on?'1':'0');}catch(e){}feed(MUSIC.on?'MUSIC ON':'MUSIC OFF',C_GR);if(MUSIC.on)musicFor(GAMEMODE);else musicStop();}
