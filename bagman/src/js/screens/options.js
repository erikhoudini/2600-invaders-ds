/* ---------- options ---------- */
function showOptions(back){ui({title:'OPTIONS',border:1,items:[
  {label:'HOW TO PLAY',act:()=>showHow(0,()=>showOptions(back))},{label:'CONTROLS',act:()=>showKeys(()=>showOptions(back))},
  {kind:'head',label:'PLAY'},
  {label:'SPRINT',val:()=>OPT.sprint==='toggle'?'TOGGLE':'HOLD',sub:'HOLD: RUN WHILE THE KEY IS DOWN. TOGGLE: PRESS ONCE TO RUN, AGAIN TO WALK.',adj:()=>{OPT.sprint=OPT.sprint==='toggle'?'hold':'toggle';if(typeof P!=='undefined'&&P)P.sprintT=false;saveOpt();}},
  {label:'ALWAYS RUN',val:()=>OPT.arun?'ON':'OFF',sub:'ON: RUN BY DEFAULT. THE SPRINT KEY WALKS.',adj:()=>{OPT.arun=OPT.arun?0:1;saveOpt();}},
  {label:'GAME SPEED',val:()=>OPT.gspd*10+'%',sub:'SLOWS THE WHOLE GAME. SCORE AND ACHIEVEMENTS STILL COUNT.',adj:d=>{OPT.gspd=clamp(OPT.gspd+d,6,10);saveOpt();}},
  {label:'CROSSHAIR',val:()=>OPT.xhair?'ON':'OFF',sub:'ON: A SMALL MARK AT THE CENTER OF THE VIEW.',adj:()=>{OPT.xhair=OPT.xhair?0:1;saveOpt();}},
  {kind:'head',label:'SOUND AND PICTURE'},
  {label:'VOLUME',val:()=>OPT.vol,adj:d=>{OPT.vol=clamp(OPT.vol+d,0,10);saveOpt();play('pick',.6);}},
  {label:'MOUSE SPEED',val:()=>OPT.mouse,adj:d=>{OPT.mouse=clamp(OPT.mouse+d,1,10);saveOpt();}},
  {label:'TOUCH SPEED',val:()=>OPT.touch,adj:d=>{OPT.touch=clamp(OPT.touch+d,1,10);saveOpt();}},
  {label:'SCREEN SHAKE',val:()=>OPT.shake?'ON':'OFF',adj:()=>{OPT.shake=OPT.shake?0:1;saveOpt();}},
  {label:'FLASHES',val:()=>OPT.flash?'FULL':'REDUCED',sub:'REDUCED TONES DOWN WHITE FLASHES, BORDER FLASHES AND BLASTS.',adj:()=>{OPT.flash=OPT.flash?0:1;saveOpt();}},
  {label:'REDUCE CRT',val:()=>OPT.crt?'OFF':'ON',sub:'ON: LESS CURVE, FEWER SCANLINES, LESS NOISE AND COLOR FRINGING.',adj:()=>{OPT.crt=OPT.crt?0:1;saveOpt();}},
  {label:'SLO-MO BLUR',val:()=>OPT.blur?'ON':'OFF',sub:'OFF: NO GHOSTING DURING SLO-MO. TIME STILL SLOWS.',adj:()=>{OPT.blur=OPT.blur?0:1;saveOpt();}},
  {label:'WEAPON SWAY',val:()=>OPT.sway?'ON':'OFF',sub:'OFF: THE GUN STAYS STILL WHILE YOU MOVE.',adj:()=>{OPT.sway=OPT.sway?0:1;saveOpt();}}],back});}
const keyName=c=>c.replace(/^Key/,'').replace(/^Digit/,'').replace('ArrowLeft','LEFT ARROW').replace('ArrowRight','RIGHT ARROW').replace('ArrowUp','UP ARROW').replace('ArrowDown','DOWN ARROW').replace('ShiftLeft','LEFT SHIFT').replace('ShiftRight','RIGHT SHIFT').replace('ControlLeft','LEFT CTRL').replace('ControlRight','RIGHT CTRL').replace('AltLeft','LEFT ALT').toUpperCase();
function showKeys(back){ui({title:'CONTROLS',border:1,back,
  items:[...Object.keys(KB0).map(a=>({label:KBN[a],val:()=>UI.capA===a?'PRESS A KEY':keyName(KB[a]),vc:()=>UI.capA===a?C_R:C_Y,sub:'ENTER, THEN PRESS THE NEW KEY. ESC KEEPS THE OLD ONE.',
      act:()=>{UI.capA=a;UI.cap=e=>{if(e.repeat)return;UI.cap=null;UI.capA=null;if(e.code==='Escape')return;for(const o in KB)if(KB[o]===e.code&&o!==a)KB[o]=KB[a];KB[a]=e.code;try{localStorage.setItem('bagman.keys',JSON.stringify(KB));}catch(_){}play('pick',.6);};}})),
    {label:'DEFAULT KEYS',act:()=>{KB=Object.assign({},KB0);try{localStorage.removeItem('bagman.keys');}catch(_){}toast('DEFAULT KEYS');}},
    {kind:'head',label:'FIXED'},{kind:'row',label:'1 TO 5',val:'PICK A GUN'},{kind:'row',label:'ESC OR P',val:'PAUSE'},{kind:'row',label:'TAB',val:'MAP'},
    {kind:'head',label:'MOUSE'},{kind:'row',label:'CLICK THE SCREEN',val:'TAKE THE MOUSE'},{kind:'row',label:'LEFT BUTTON',val:'FIRE'},{kind:'row',label:'RIGHT BUTTON',val:'LOCK'},{kind:'row',label:'WHEEL',val:'NEXT GUN'},{kind:'row',label:'HOLD SWAP, MOVE',val:'WHEEL OF GUNS'}]});}
function showHow(i,back){const sc={i:i||0,border:1,back,eyebrow:()=>'HOW TO PLAY  '+(sc.i+1)+'/'+HOW.length,title:()=>HOW[sc.i][0],art:()=>HOW[sc.i][2].startsWith('c:')?'comic:'+HOW[sc.i][2].slice(2):'pulp:'+HOW[sc.i][2],
    text:()=>[].concat(HOW[sc.i][1]),lr:d=>{const n=clamp(sc.i+d,0,HOW.length-1);if(n!==sc.i){sc.i=n;play('menu',.3,1.3);}},
    items:[{label:()=>sc.i<HOW.length-1?'NEXT':'DONE',act:()=>{if(sc.i<HOW.length-1)sc.i++;else back();}},{label:'PREVIOUS',dis:()=>sc.i===0?'THIS IS THE FIRST PAGE.':null,act:()=>{sc.i--;}}]};
  ui(sc);}

