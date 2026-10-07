/* ---------- side hustles ---------- */
function showHustles(){const lock=UNL.won?null:'FINISH THE STORY FIRST.';
  ui({title:'SIDE HUSTLES',border:6,art:'pulp:bandit',items:[
    {label:'BLACKJACK',val:()=>money(BJS.pot<=0?50000:BJS.pot),sub:'HOUSE FRONTS YOU $50K.',act:showBlackjack},
    {label:'ARENA',val:ST.arenaBest?'BEST '+ST.arenaBest:null,sub:'WAVE AFTER WAVE ON FOUR MAPS. CASH BUYS GUNS BETWEEN WAVES.',dis:lock,act:()=>showArenas(0)},
    {label:'SCORE ATTACK',sub:'ANY CHAPTER WITH ITS STARTING LOADOUT. BEST SCORE AND TIME ARE KEPT.',dis:lock,act:()=>showScoreAttack()},
    {label:'MODIFIED',val:modCount()+'/'+MODLIST.length,sub:'BEND THE RULES FOR A RUN. NEW SPIRALS UNLOCK MODIFIERS.',dis:lock,act:showMods},
    {label:'MODIFIED ARENA',val:ST.marenaBest?'BEST '+ST.marenaBest:null,sub:'THE ARENA, BUT EVERY WAVE ROLLS A MODIFIER. EVERY THIRD WAVE ROLLS THREE.',dis:lock||(spiralCount()<SPIRAL_ALL?'COLLECT ALL '+SPIRAL_ALL+' SPIRALS. YOU HAVE '+spiralCount()+'.':null),act:()=>showArenas(1)},
    {label:'CUSTOM MAPS',col:C_C,sub:'PLAY LEVELS BUILT IN THE EDITOR.',act:()=>showCustom()},{label:'LEVEL EDITOR',col:C_C,sub:'BUILD YOUR OWN MAPS.',dis:()=>edUnlocked()?null:EDLOCK,act:()=>edStart()}],back:showMenu});}
let HS={};try{HS=JSON.parse(localStorage.getItem('bagman.hs')||'{}');}catch(e){}
function showScoreAttack(msg){ui({title:'SCORE ATTACK',border:6,text:[msg?{s:msg,c:C_Y}:'BEST SCORE AND BEST TIME FOR EVERY CHAPTER.'],
  items:CH.map((c,i)=>{const h=HS[i+1]||{};return{label:(i+1)+'. '+c.t,val:h.s!=null?money(h.s):'-',sub:h.t!=null?'BEST TIME '+fmtT(h.t)+'.':'NOT PLAYED YET.',
    act:()=>{GM='attack';DIFF='normal';startLevel(i+1,chapterSnap(i+1),'attack');P.score=0;L.score0=0;state='intro';introStart(true,resumePlay);}};}),back:showHustles});}
function attackDone(){const n=L.n,sc=P.score-L.score0,t=L.time,h=HS[n]||{};const nb=[];
  if(h.s==null||sc>h.s){h.s=sc;nb.push('SCORE');}if(h.t==null||t<h.t){h.t=t;nb.push('TIME');}HS[n]=h;try{localStorage.setItem('bagman.hs',JSON.stringify(HS));}catch(e){}
  showScoreAttack(CH[n-1].t+': '+money(sc)+' IN '+fmtT(t)+'.'+(nb.length?' NEW BEST '+nb.join(' AND ')+'.':''));}
const achN=()=>ACH.filter(a=>ACHV[a[0]]).length;
const ARENAS=[['gas','GAS STATION','THE ALL NIGHT PUMPS. AN OPEN LOT WITH CARS AND FUEL.','photo:02',()=>null],
  ['train','FREIGHT TRAIN','THREE CARS AT SPEED. THEY COME OVER BOTH ENDS. STEP OFF AND YOU FALL.',()=>'photo:'+CH[CH.findIndex(c=>c.mode==='train')].photo,()=>achN()>=10?null:'EARN 10 ACHIEVEMENTS. YOU HAVE '+achN()+'.'],
  ['meat','MEAT LOCKER','A TIGHT SQUARE FREEZER. HANGING BEEF FOR COVER. FOUR WAYS IN.','photo:04',()=>Math.max(ST.arenaBest||0,ST.marenaBest||0)>=10?null:'SURVIVE 10 WAVES IN ANY ARENA.'],
  ['head','HEADSHOP','THE STORE, THE LOUNGE, AND ONE CROOKED HALL BETWEEN THEM.','pulp:bandit',()=>achN()>=15?null:'EARN 15 ACHIEVEMENTS. YOU HAVE '+achN()+'.']];
function showArenas(mod){ui({title:mod?'MODIFIED ARENA':'ARENA',border:6,art:()=>{const a=ARENAS[UI.sel];return a&&!a[4]()?ev(a[3]):null;},
  items:ARENAS.map(a=>({label:a[1],val:()=>{const b=((mod?ST.marenaMap:ST.arenaMap)||{})[a[0]];return b?'BEST '+b:null;},sub:a[2],dis:a[4],act:()=>arenaStart(mod,a[0])})),back:showHustles});}
