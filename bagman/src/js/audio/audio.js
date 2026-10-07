/* =====================================================================
   6. AUDIO (ZX beeper samples)
   ===================================================================== */
const OPT={vol:7,mouse:5,touch:5,shake:1,flash:1,crt:1,blur:1,sprint:'hold',arun:0,gspd:10,sway:1,xhair:0};try{Object.assign(OPT,JSON.parse(localStorage.getItem('bagman.opts')||'{}'));}catch(e){}
function saveOpt(){try{localStorage.setItem('bagman.opts',JSON.stringify(OPT));}catch(e){}if(master)master.gain.value=.5*OPT.vol/7;}
let AC=null,master=null,rumble=null,timeScaleAudio=1,muff=null,AMB={buf:{},cur:null,kind:''};const SBUF={},lastPlay={};
function audioInit(){if(AC){if(AC.state==='suspended')AC.resume();return;}
  try{AC=new(window.AudioContext||window.webkitAudioContext)();master=AC.createGain();master.gain.value=.5*OPT.vol/7;muff=AC.createBiquadFilter();muff.type='lowpass';muff.frequency.value=20000;master.connect(muff);muff.connect(AC.destination);ambLoad();
    for(const k in A.snd){const bin=atob(A.snd[k].split(',')[1]);const u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);
      AC.decodeAudioData(u.buffer,buf=>{SBUF[k]=buf;},()=>{});}}catch(e){AC=null}}
// ambience: desert wind outside, a low room tone inside
function ambLoad(){if(!AC)return;try{const bin=atob(A.amb.split(',')[1]);const u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);AC.decodeAudioData(u.buffer,b=>{AMB.buf.wind=b;if(AMB.want)ambFor(AMB.want);},()=>{});}catch(e){}
  const n=AC.sampleRate*4,b=AC.createBuffer(1,n,AC.sampleRate),d=b.getChannelData(0);let last=0;for(let i=0;i<n;i++){last=(last+.02*(Math.random()*2-1))/1.02;d[i]=last*3.2;}
  for(let i=0;i<2000;i++){const t=i/2000;d[i]=d[i]*t+d[n-2000+i]*(1-t);}AMB.buf.room=b;}
function ambFor(Lv){const kind=Lv?(Lv.outdoor||Lv.rails||Lv.train?'wind':'room'):'';AMB.want=Lv;if(!AC||kind===AMB.kind&&AMB.cur)return;ambStop();if(!kind||!AMB.buf[kind])return;
  const s=AC.createBufferSource();s.buffer=AMB.buf[kind];s.loop=true;if(kind==='wind'){s.loopStart=.05;s.loopEnd=s.buffer.duration-.05;}const g=AC.createGain();g.gain.value=0;
  g.gain.setTargetAtTime(kind==='wind'?(Lv.rails?.32:.42):.16,AC.currentTime,.6);s.connect(g);g.connect(master);s.start();AMB.cur={s,g};AMB.kind=kind;}
function ambStop(){AMB.want=null;if(!AMB.cur||!AC)return;const c=AMB.cur;AMB.cur=null;AMB.kind='';c.g.gain.setTargetAtTime(0,AC.currentTime,.25);setTimeout(()=>{try{c.s.stop();}catch(e){}},1200);}
function play(k,vol=1,rate=1,gap=0){if(!AC||!SBUF[k])return null;const now=AC.currentTime;if(gap&&lastPlay[k]&&now-lastPlay[k]<gap)return null;lastPlay[k]=now;
  const s=AC.createBufferSource();s.buffer=SBUF[k];s.playbackRate.value=rate*timeScaleAudio;const g=AC.createGain();g.gain.value=vol;s.connect(g);g.connect(master);s.start();return s;}
function rumbleOn(on){if(!AC)return;if(on&&!rumble&&SBUF.engine){const s=AC.createBufferSource();s.buffer=SBUF.engine;s.loop=true;s.playbackRate.value=.45;const g=AC.createGain();g.gain.value=.18;s.connect(g);g.connect(master);s.start();rumble={s,g};}
  else if(!on&&rumble){try{rumble.s.stop()}catch(e){}rumble=null;}}
const SFX={
  pistol:()=>play('pistol',.9,.94+rnd()*.12),tommy:()=>play('shot2',.7,.8+rnd()*.1),shotgun:()=>play('shotgun',1,.95+rnd()*.1),fists:()=>play('fist',.7),thud:()=>play('thud',.8),
  eshot:v=>play('pistol',.3*v,.64+rnd()*.12,.03),hurt:()=>play('hurt',.9,1,.08),alert:v=>play('alert',.33*v,1,.5),
  die:v=>play('die',.7*v,1,.04),gib:v=>play('gib',.9*v),head:()=>{play('head',.9);play('splat',.6);},
  pick:()=>play('pick',.7),cash:()=>play('cash',.6,1,.05),key:()=>play('key',.8),door:()=>play('door',.5,1,.1),locked:()=>play('locked',.6),
  sw:()=>play('switch',.8),weapon:()=>play('weapon',.7),empty:()=>play('empty',.5,1,.1),lock:()=>play('lock',.5),unlock:()=>play('unlock',.4),
  chain:n=>play('chain',.45,1+Math.min(n,10)*.06),boom:(v=1)=>play('boom',.9*v,1,.05),bigboom:()=>play('bigboom',1,1,.08),horn:()=>play('horn',.7),wave:()=>play('wave',.7),
  pdie:()=>play('pdie',.9),gulp:()=>play('gulp',.8),medkit:()=>play('medkit',.7),menu:()=>play('menu',.45),
  grr:v=>play('grr',.45*v,1.2,.6),bite:()=>play('bite',.8,.8,.1),bark:v=>play('bark',.4*v,.7,.4),push:()=>play('push',.8,.6),power:()=>play('power',.9),
  combo:n=>play(n>=10?'combo2':'combo',.7,n>=10?1:1+Math.min(n,9)*.04),snort:r=>play('snort',.7,r),drip:()=>play('drip',.5,.8)
};

