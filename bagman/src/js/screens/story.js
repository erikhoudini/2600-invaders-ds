/* ---------- story ---------- */
const DIFFN=d=>d==='bagman'?'BAGMAN':'NORMAL';
function showStory(){const cont=SAVE.ch>1||!!SAVE.snap;
  ui({title:'STORY',border:2,art:cont?'photo:'+CH[SAVE.ch-1].photo:'pulp:gunman',items:[
    ...(cont?[{label:'CONTINUE',val:'CH '+SAVE.ch,sub:CH[SAVE.ch-1].t+'. '+CH[SAVE.ch-1].why+(UNL.won?' '+DIFFN(SAVE.diff)+' DIFFICULTY.':''),
      act:()=>{DIFF=SAVE.diff||'normal';GM='story';playChapter(SAVE.ch,SAVE.snap||chapterSnap(SAVE.ch));}}]:[]),
    {label:'NEW GAME',sub:'FROM THE MOTEL, CHAPTER 1.',act:newGame},{label:'CHAPTER SELECT',sub:'REPLAY ANY CHAPTER YOU HAVE REACHED.',act:showChapters}],back:showMenu});}
function newGame(){const go=d=>{const begin=()=>{SAVE={ch:1,snap:freshSnap(),best:SAVE.best||1,diff:d};writeSave();DIFF=d;GM='story';playChapter(1,freshSnap());};
    if(SAVE.ch>1||SAVE.snap)confirmBox('NEW GAME','YOUR SAVE AT CHAPTER '+SAVE.ch+' WILL BE REPLACED.',begin,showStory);else begin();};
  if(UNL.won)pickDiff(go,showStory);else go('normal');}
function pickDiff(cb,back){ui({title:'DIFFICULTY',border:2,art:'pulp:bandit',items:[
  {label:'NORMAL',sub:'THE WAY IT PLAYS THE FIRST TIME THROUGH.',act:()=>cb('normal')},
  {label:'BAGMAN',col:C_R,sub:'THEY WAKE FAST, PUSH HARD AND NEVER HIT EACH OTHER. SLO-MO DOES NOT SLOW THEIR BULLETS. ARMOR IS RARE AND FIRST AID IS THIN.',act:()=>cb('bagman')}],back});}
function showChapters(){const best=Math.max(SAVE.best||1,SAVE.ch||1);
  ui({title:'CHAPTER SELECT',border:2,art:()=>UI.sel<best?'photo:'+CH[UI.sel].photo:null,cap:()=>{const n=UI.sel+1;if(n>best)return null;return spiralCap(n);},
    items:CH.map((c,i)=>i<best?{label:(i+1)+'. '+c.t,sub:c.why,act:()=>startFrom(i+1)}:{label:(i+1)+'. ??????',dis:'LOCKED. KEEP PLAYING.'}),back:showStory});}
function startFrom(n){const go=d=>{DIFF=d;GM='story';SAVE.diff=d;playChapter(n,(SAVE.ch===n&&SAVE.snap)?SAVE.snap:chapterSnap(n));};if(UNL.won)pickDiff(go,showChapters);else go('normal');}
function playChapter(n,snap){const c=CH[n-1];if(GM==='mod'){showCard(n,snap);return;}comicStart(String(n),()=>showCard(n,snap),['LOCATION: '+c.t,c.why]);}
function quitTo(){PAUSED=false;if(L&&L.custom){showCustom();return;}if(GM==='mod')showMods();else if(GM==='attack')showScoreAttack();else if(GM==='arena')showHustles();else showMenu();}
function showCard(n,snap){const c=CH[n-1];const tag=GM==='mod'?'  MODIFIED':(DIFF==='bagman'?'  BAGMAN':'');
  const go=()=>{if(GM==='story'){SAVE.ch=n;SAVE.snap=snap;SAVE.best=Math.max(SAVE.best||1,n);SAVE.diff=DIFF;writeSave();}else if(GM==='mod'&&MRUN){MRUN.ch=n;MRUN.snap=snap;saveMRun();}
    startLevel(n,snap,GM);state='intro';introStart(true,resumePlay);};
  ui({eyebrow:'CHAPTER '+n+' OF '+CH.length+tag,title:c.t,border:c.bd,art:'photo:'+c.photo,artCol:ZX[c.bd+8],text:[c.why,{s:c.obj,c:C_Y}],
    items:[{label:'START',act:()=>c.boss?showBoss(c.boss,go):go()},{label:'MENU',act:quitTo}],back:quitTo});}
function showBoss(type,go){const T=ETYPE[type];SFX.horn();
  ui({eyebrow:'WANTED',title:T.boss,tcol:C_R,tsc:PORT?3:3,border:2,art:'pulp:'+T.pulp,artCol:C_R,items:[{label:'GO',act:go},{label:'MENU',act:quitTo}],back:quitTo});}
function showTally(){if(EDTEST){edBack('done');return;}if(L&&L.custom){customDone();return;}const n=L.n;if(L.kilo&&(GM==='story'||GM==='mod')&&!KILOS[n]){KILOS[n]=1;saveKilos();L.newKilo=1;}ST.chapters++;achTick();if(!(L.dmg>0))ach('untouched');if(L.secrets&&L.secretsFound>=L.secrets)ach('snoop');if(L.rails&&R_&&R_.truck>R_.truckMax/2)ach('roadrage');if(L.train)ach('brakeman');
  if(n===CH.length&&GM==='story')ST.runs++;saveStats();const snap=snapOf();if(n===7){snap.has[3]=1;snap.b=Math.max(snap.b,150);snap.w=3;}
  if(GM==='attack')return attackDone();
  if(GM==='story'&&n<CH.length){SAVE.ch=n+1;SAVE.snap=snap;SAVE.best=Math.max(SAVE.best||1,n+1);SAVE.diff=DIFF;writeSave();}
  if(GM==='mod'&&MRUN){if(n<CH.length){MRUN.ch=n+1;MRUN.snap=snap;saveMRun();}}
  const earned=P.score-L.score0;const rows=[['BODIES',L.kills+(L.rails?'':' / '+L.total)]];
  if(!L.rails){rows.push(['TAKE RECOVERED',L.cash+' / '+L.cashTotal],['YOUR KILO',L.kilo?'RECOVERED':'LOST']);if(L.secrets)rows.push(['SECRETS',L.secretsFound+' / '+L.secrets]);if(L.spiralTotal)rows.push(['SPIRALS',L.spiral+' / '+L.spiralTotal]);}
  else rows.push(['TRUCK LEFT',Math.ceil(R_.truck/R_.truckMax*100)+'%']);if(L.newKilo)rows.push(['POSTCARD','NEW PIECE',C_G]);
  rows.push(['TIME',fmtT(L.time)],['THIS CHAPTER',money(earned)],['SCORE',money(P.score)]);
  const next=()=>{if(n>=CH.length){if(GM==='mod')modDone();else comicStart('end',showEnd);return;}if(GM==='story'&&P.score>=1000)showBet(n,snap);else playChapter(n+1,snap);};
  ui({eyebrow:'CHAPTER '+n+' COMPLETE',title:CH[n-1].t,border:CH[n-1].bd,art:'photo:'+CH[n-1].photo,artCol:ZX[CH[n-1].bd+8],rows,items:[{label:n<CH.length?'NEXT CHAPTER':'FINISH',act:next}]});}
function showEnd(){const first=!UNL.won;SAVE={ch:1,snap:null,best:CH.length,diff:'normal'};writeSave();UNL.won=1;saveUnl();ach('fullrun');if(P.score>=1e6)ach('milly');
  ui({eyebrow:'THE END',title:'DAWN',border:6,art:'photo:'+ENDPHOTO,text:[ENDING,...(first?[{s:'BAGMAN DIFFICULTY AND THE SIDE HUSTLES ARE OPEN.',c:C_Y}]:[])],rows:[['FINAL SCORE',money(P.score)]],
    items:[{label:'MENU',act:showMenu},{label:'CREDITS',act:()=>showCredits(showMenu)}]});}
function showDead(){if(EDTEST){edBack(GM==='arena'?'arena':'dead');return;}if(L&&L.custom){if(GM==='arena')customArenaDead();else customDead();return;}if(GM==='arena')return arenaDead();const rails=L&&L.rails;
  ui({eyebrow:'CHAPTER '+L.n+': '+CH[L.n-1].t,title:rails?'THE TRUCK IS DONE':'SALAMANDER IS DEAD',tcol:C_R,border:2,art:'pulp:gunman',artCol:C_R,
    text:[rails?'THE FLATBED GOES OVER ON THE SHOULDER.':'NO ONE WILL FIND YOUR BODY.'],items:[{label:'RETRY',act:retry},{label:'MENU',act:quitTo}]});}
function retry(){if(L&&L.custom&&CUSTOM){replayCustom();return;}const n=L.n;if(GM==='attack'){startLevel(n,chapterSnap(n),'attack');P.score=0;L.score0=0;}else if(GM==='mod')startLevel(n,(MRUN&&MRUN.snap)||chapterSnap(n),'mod');else startLevel(n,SAVE.snap||chapterSnap(n),'story');resumePlay();}
function showPause(){if(EDTEST&&state!=='ui'){edBack('pause');return;}if(!L)return showMenu();if(state==='play'){snapPause();saveStats();}PAUSED=true;rumbleOn(false);
  ui({eyebrow:L.custom?'PAUSED  CUSTOM MAP'+(CUSTOM&&CUSTOM.mods&&CUSTOM.mods.length?'  MODIFIED':''):L.arena?'PAUSED  '+(L.modArena?'MODIFIED ARENA':'ARENA')+'  WAVE '+L.wave.n:'PAUSED  CHAPTER '+L.n+(GM==='mod'?'  MODIFIED':DIFF==='bagman'&&GM==='story'?'  BAGMAN':''),title:L.arena||L.custom?(L.arenaName||'GAS STATION'):CH[L.n-1].t,border:CH[L.n-1].bd,text:[{s:L.arena?'SURVIVE. SPEND THE CASH BETWEEN WAVES.':L.custom?'FIND THE EXIT.':CH[L.n-1].obj,c:C_Y}],items:[
    {label:'RESUME',act:resumePlay},
    {label:L.custom?'RESTART MAP':L.arena?'RESTART ARENA':'RESTART CHAPTER',act:()=>confirmBox('RESTART',L.arena?'START OVER FROM WAVE 1?':'START THIS CHAPTER OVER?',()=>{if(GM==='arena')arenaStart(L.modArena,ARENAMAP);else retry();},showPause)},
    {label:'HOW TO PLAY',act:()=>showHow(0,showPause)},{label:'OPTIONS',act:()=>showOptions(showPause)},
    {label:'QUIT TO MENU',act:()=>confirmBox('QUIT','PROGRESS IN THIS CHAPTER IS LOST.',quitTo,showPause)}],back:resumePlay});}

