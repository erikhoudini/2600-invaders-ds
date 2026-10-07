let SAVE={ch:1,snap:null,best:1};
// lifetime statistics, kept apart from the chapter save so a new game never wipes them
const STK='bagman.stats';
const ST0=()=>({kills:0,head:0,gib:0,dogs:0,bosses:0,cars:0,punch:0,dashes:0,chain:0,overkill:0,massacre:0,
  pistol:0,shells:0,tommy:0,rifle:0,shots:0,hits:0,booms:0,
  berserk:0,deadeye:0,kevlar:0,medkit:0,whiskey:0,ammo:0,cash:0,kilos:0,keys:0,secrets:0,
  vest:0,plate:0,dyn:0,torch:0,chainEye:0,ambush:0,
  hurt:0,deaths:0,chapters:0,runs:0,time:0});
let ST=ST0();let KW='pistol';let stDirty=0;
function loadStats(){try{const s=JSON.parse(localStorage.getItem(STK)||'null');if(s)ST=Object.assign(ST0(),s);}catch(e){}}
function saveStats(){stDirty=0;try{localStorage.setItem(STK,JSON.stringify(ST));}catch(e){}}
loadStats();addEventListener('pagehide',saveStats);document.addEventListener('visibilitychange',()=>{if(document.hidden)saveStats();});
let UNL={won:0};try{Object.assign(UNL,JSON.parse(localStorage.getItem('bagman.unlock')||'{}'));}catch(e){}
function saveUnl(){try{localStorage.setItem('bagman.unlock',JSON.stringify(UNL));}catch(e){}}
