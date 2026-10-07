function showCustom(msg){LIB.list().then(list=>{
  const items=list.map(o=>({label:o.name,val:o.mode==='arena'?'ARENA':'LEVEL',sub:o.W+' X '+o.H+'. '+o.enemies+(o.enemies===1?' ENEMY':' ENEMIES')+(o.sky?'. OPEN SKY.':'.'),act:()=>showCustomLevel(o)}));
  if(items.length)items.push({kind:'gap'});
  if(!EDWEB)items.push({label:'OPEN A LEVEL FILE',col:C_C,sub:'ADD A .JSON LEVEL TO THIS LIST.',act:customImport});
  if(LIB.desk)items.push({label:'OPEN THE LEVELS FOLDER',col:C_C,sub:'LEVEL FILES DROPPED IN THIS FOLDER SHOW UP HERE.',act:()=>LIB.folder()});
  items.push({label:'LEVEL EDITOR',col:C_G,sub:'BUILD A NEW MAP.',dis:()=>edUnlocked()?null:EDLOCK,act:()=>edStart()});
  ui({title:'CUSTOM MAPS',border:5,text:msg?[{s:msg,c:C_Y}]:(list.length?null:[(EDWEB?'NO CUSTOM MAPS YET. BUILD ONE IN THE LEVEL EDITOR.':'NO CUSTOM MAPS YET. BUILD ONE IN THE LEVEL EDITOR OR OPEN A LEVEL FILE.')]),items,back:showHustles});
}).catch(()=>ui({title:'CUSTOM MAPS',border:5,text:[{s:'THE LEVEL LIST COULD NOT BE READ.',c:C_R}],items:[{label:'LEVEL EDITOR',dis:()=>edUnlocked()?null:EDLOCK,act:()=>edStart()}],back:showHustles}));}
function showCustomLevel(o){ui({title:o.name,tsc:2,border:5,rows:[['TYPE',o.mode==='arena'?'ARENA':'LEVEL'],['SIZE',o.W+' X '+o.H],['ENEMIES',o.enemies],['SKY',o.sky?'OPEN':'CEILING']],
  items:[{label:'PLAY',col:C_G,act:()=>readPlay(o,[])},{label:'PLAY WITH MODIFIERS',col:C_C,act:()=>showCustomMods(o)},
    {label:'EDIT',dis:()=>edUnlocked()?null:EDLOCK,act:()=>LIB.read(o.file).then(obj=>edStart(obj,o.file)).catch(()=>showCustom('THAT LEVEL COULD NOT BE READ.'))},
    {label:'DELETE',col:C_R,act:()=>confirmBox('DELETE',o.name+' IS REMOVED FROM THE LIST FOR GOOD.',()=>LIB.remove(o.file).then(()=>showCustom()),()=>showCustomLevel(o))}],back:()=>showCustom()});}
function showCustomMods(o){for(const k of[...CMODS])if(!MODLIST.some(m=>m[0]===k&&modOpen(m)))CMODS.delete(k);
  ui({eyebrow:o.name,title:'MODIFIERS',border:3,text:[{s:()=>CMODS.size+' OF 7 PICKED. '+modCount()+' OF '+MODLIST.length+' UNLOCKED.',c:C_GR}],
    items:[{label:'PLAY',col:C_G,dis:()=>CMODS.size?null:'PICK AT LEAST ONE MODIFIER.',act:()=>readPlay(o,[...CMODS])},
      {label:'CLEAR ALL',dis:()=>CMODS.size?null:'NOTHING PICKED.',act:()=>{CMODS.clear();saveCMods();}},
      {kind:'head',label:'MODIFIERS'},
      ...MODLIST.map(m=>({label:m[1],val:()=>CMODS.has(m[0])?'ON':modOpen(m)?'':'★'+m[3],vc:()=>CMODS.has(m[0])?C_G:C_GR,sub:m[2],
        dis:()=>modOpen(m)?null:'COLLECT '+m[3]+' SPIRALS TO UNLOCK. YOU HAVE '+spiralCount()+'.',
        act:()=>{if(CMODS.has(m[0]))CMODS.delete(m[0]);else if(CMODS.size>=7){toast('SEVEN IS THE LIMIT',C_R);return;}else CMODS.add(m[0]);saveCMods();}}))],back:()=>showCustomLevel(o)});}
const modLine=()=>CUSTOM&&CUSTOM.mods&&CUSTOM.mods.length?[{s:'MODIFIERS: '+CUSTOM.mods.map(k=>MODN[k]).join(', ')+'.',c:C_C}]:null;
let IMPORT=null;
function customImport(){if(!IMPORT){IMPORT=document.createElement('input');IMPORT.type='file';IMPORT.accept='.json,application/json';IMPORT.style.display='none';document.body.appendChild(IMPORT);
    IMPORT.addEventListener('change',()=>{const f=IMPORT.files[0];if(!f)return;const r=new FileReader();r.onload=async()=>{try{const o=JSON.parse(r.result);edParse(o);await LIB.write(await libUnique(o.name),o);showCustom('ADDED '+String(o.name||'LEVEL').toUpperCase()+'.');}
      catch(e){showCustom('THAT FILE IS NOT A BAGMAN LEVEL.');}IMPORT.value='';};r.readAsText(f);});}
  IMPORT.click();}
function playCustom(obj,file,mods){let E0;try{E0=edParse(obj);}catch(e){showCustom('THAT FILE IS NOT A BAGMAN LEVEL.');return;}
  CUSTOM={obj,file,E:E0,mods:(mods||[]).filter(k=>MODN[k])};EDL=E0;EDTEST=false;audioInit();const snap=KIT_SNAP(E0.kit);
  if(E0.mode==='arena'){CUSTOM.snap=snap;arenaStart(0,'custom');return;}
  DIFF='normal';startLevel(1,snap,'custom');state='intro';introStart(true,resumePlay);}
function customDone(){const n=CUSTOM&&CUSTOM.E?CUSTOM.E.name:'';saveStats();
  ui({eyebrow:'CUSTOM MAP',title:'LEVEL FINISHED',border:4,text:modLine(),rows:[['MAP',L.arenaName],['BODIES',L.kills+' / '+L.total],['SECRETS',L.secretsFound+' / '+L.secrets],['TIME',fmtT(L.time)],['SCORE',money(P.score)]],
    items:[{label:'AGAIN',act:replayCustom},{label:'CUSTOM MAPS',act:()=>showCustom()}],back:()=>showCustom()});}
function customDead(){saveStats();ui({eyebrow:'CUSTOM MAP  '+L.arenaName,title:'SALAMANDER IS DEAD',tcol:C_R,border:2,art:'pulp:gunman',artCol:C_R,text:['NO ONE WILL FIND YOUR BODY.',...(modLine()||[])],
  items:[{label:'AGAIN',act:replayCustom},{label:'CUSTOM MAPS',act:()=>showCustom()}]});}
function customArenaDead(){const n=Math.max(0,L.wave.n-1);saveStats();ui({eyebrow:'CUSTOM ARENA  '+L.arenaName,title:'SALAMANDER IS DEAD',tcol:C_R,border:2,art:'pulp:gunman',artCol:C_R,text:modLine(),rows:[['WAVES SURVIVED',n],['BODIES',L.kills],['SCORE',money(P.score)]],
  items:[{label:'AGAIN',act:replayCustom},{label:'CUSTOM MAPS',act:()=>showCustom()}]});}

