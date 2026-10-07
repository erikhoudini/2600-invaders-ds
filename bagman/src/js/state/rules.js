let GM='story',drumHid=true;
// difficulty and modifiers resolve into one rules object at the start of every level (and every modified arena wave)
const MODLIST=[
 ['speed','SPEEDBALL','MOVE 30% FASTER.',2],['pbox','PLEASURE BOX','THE CHAIN CLOCK STOPS WHILE YOU MOVE.',3],['hjdt','HE JUST DID THAT','EVERY 7TH KILL GOES UP IN AN EXPLOSION.',5],
 ['gas','GAZZOLEEN','FLAMETHROWER MEN EXPLODE WHEN THEY DIE.',6],['david','DAVIDIAN','EVERY 3RD SHOTGUN SHELL EXPLODES. YOU CAN CARRY 16.',8],['donuts','DONUTS','ENEMIES HAVE 30% MORE HEALTH.',10],
 ['army','7 NATION ARMY','TWICE AS MANY ENEMIES.',11],['pills','PRESSED PILLS','PILLS TAKE 5 HEALTH INSTEAD OF GIVING IT.',13],['knuckle','KNUCKLE UP','HALF THE AMMO IN EVERY LEVEL.',14],
 ['nofocus','NO FOCUS','NO LOCK ON. FOR ANYTHING.',16],['uppers','UPPERS','SLO-MO DOES NOT SLOW ENEMY BULLETS.',18],['glyc','GLYCERINE','SOME OF THEM CARRY DYNAMITE AND THROW IT WHEN YOU GET CLOSE.',19],
 ['badco','BAD COMPANY','MORE AGGRESSIVE. THEY SHOOT THROUGH EACH OTHER TO GET TO YOU.',21],['brutal','POLICE BRUTALITY','MUCH MORE AGGRESSIVE. NO FRIENDLY FIRE.',22],
 ['dtap','DOUBLE TAP','ONE IN THREE OF THE DEAD GETS BACK UP ONCE, UNLESS AN EXPLOSION TOOK HIM.',24],['pipe','PIPE-TORCH','16 MORE FLAMETHROWER MEN IN EVERY LEVEL.',25],
 ['coke','COCAINE','ENEMIES MOVE TWICE AS FAST.',27],['lava','FLOOR IS LAVA','STAND STILL AND YOU BURN.',29],['nola','NEW ORLEANS','NO HEALTH PICKUPS EXCEPT PILLS.',30],
 ['dope','DOPESICK','HALF MAXIMUM HEALTH.',32],['angel','ANGEL DUST','ENEMIES PLAY AT BAGMAN DIFFICULTY.',33],['wanted','WANTED DEAD','A MARKED MAN IN EVERY LEVEL. KILL HIM AND EVERY DEAD MAN GETS BACK UP.',35]];
const MODN=Object.fromEntries(MODLIST.map(m=>[m[0],m[1]]));const ARENA_SKIP=new Set(['pills','knuckle','nola']);
const modOpen=m=>UNL.allMods||spiralCount()>=m[3];const modCount=()=>MODLIST.filter(modOpen).length;
let MODSEL=new Set();try{MODSEL=new Set(JSON.parse(localStorage.getItem('bagman.modsel')||'[]'));}catch(e){}
const saveModSel=()=>{try{localStorage.setItem('bagman.modsel',JSON.stringify([...MODSEL]));}catch(e){}};
let MRUN=null;try{MRUN=JSON.parse(localStorage.getItem('bagman.modrun')||'null');}catch(e){}
const saveMRun=()=>{try{if(MRUN)localStorage.setItem('bagman.modrun',JSON.stringify(MRUN));else localStorage.removeItem('bagman.modrun');}catch(e){}};
let DIFF='normal',RULES={},ARENAMOD=false,WAVEMODS=[];
function computeRules(){const on=new Set(GM==='mod'&&MRUN?MRUN.mods:((GM==='custom'||(GM==='arena'&&ARENAMAP==='custom'))&&CUSTOM&&CUSTOM.mods?CUSTOM.mods:(GM==='arena'&&ARENAMOD?WAVEMODS:[])));const m=k=>on.has(k);const bag=GM==='story'&&DIFF==='bagman';
  RULES={bag,aggr:bag||m('brutal')||m('angel')||m('badco'),noFF:bag||m('brutal')||m('angel'),ignoreFF:m('badco'),unslow:bag||m('uppers')||m('angel'),hp:bag?.8:1};
  for(const x of MODLIST)RULES[x[0]]=m(x[0]);}
computeRules();
const AMMOK=new Set(['CLIP','DRUM','BOX','SHELLS']),HEALK=new Set(['MEDKIT','BOTTLE','FULLHP']);
const sMax=()=>RULES.david?16:60;
