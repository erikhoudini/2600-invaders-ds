/*EDITOR*/
/* =====================================================================
   LEVEL EDITOR
   Drawn into a 640x400 buffer that goes through the same CRT pass as the game.
   Test play builds a level object for the real engine from the editor data.
   ===================================================================== */
const EW=640,EH=400,ECW=672,ECH=432;
const efb=document.createElement('canvas');efb.width=EW;efb.height=EH;const efx=efb.getContext('2d');
const eimg=efx.createImageData(EW,EH),ED=eimg.data;for(let i=3;i<ED.length;i+=4)ED[i]=255;
const ecomp=document.createElement('canvas');ecomp.width=ECW;ecomp.height=ECH;const ecx=ecomp.getContext('2d');
let EDL=null,EDTEST=false;let EDCOMBO=true;let EDWEB=true;
const ZXN=['BLACK','BLUE','RED','MAGENTA','GREEN','CYAN','YELLOW','WHITE'];
const NOWALL=new Set(['SWITCH','SWITCHON','LOCKED','LOCKEDR','DOOR']);
const CARTEX=new Set(['CARR','CARB','CARW']);
const ED_ITEMS=[['MEDKIT','FIRST AID'],['BOTTLE','WHISKEY'],['FULLHP','FULL HEALTH'],['PILLS','PILLS'],['VEST','VEST'],['PLATE','ARMOR PLATE'],['KEVLAR','HEAVY ARMOR'],
  ['CLIP','.38 ROUNDS'],['BOX','AMMO BOX'],['DRUM','AK DRUM'],['SHELLS','SHELLS'],['GUNSHOT','PUMP SHOTGUN'],['TOMMYGUN','AK-47'],['DYNAMITE','DYNAMITE'],
  ['BERSERK','BERSERK'],['DEADEYE','SLO-MO'],['FLAMER','FLAMER'],['KEYY','YELLOW KEY'],['KEYR','RED KEY'],
  ['ROLL','CASH ROLL'],['BAGGIE','BAGGIE'],['CASH','CASH'],['CHAIN','GOLD CHAIN'],['PACKAGE','PACKAGE'],['KILO','KILO']];
const ED_ENEMIES=[['thug','THUG'],['cop','DEPUTY'],['enf','SHOTGUN'],['heavy','GUARD'],['torch','TORCHER'],['dog','DOG'],['gila','GILA (BOSS)'],['iguana','IGUANA (BOSS)'],['komodo','KOMODO (BOSS)']];
const ED_PROPS=[['XDRUM','FUEL DRUM'],['PUMP','GAS PUMP'],['BARREL','BARREL'],['TABLE','TABLE'],['TABLE2','COUNTER'],['RACK','RACK'],['STOVE','STOVE'],['VAT','VAT'],['VAT2','VAT 2'],
  ['DRUMCAN','OIL DRUM'],['TOXIC','TOXIC DRUM'],['PLANT','PLANT'],['CARCASS','HANGING MEAT'],['FIRE','FIRE'],['JTREE','JOSHUA TREE'],['TREE0','TREE 1'],['TREE1','TREE 2'],['TREE2','TREE 3'],['TREE3','TREE 4'],
  ['LAMP','LAMP'],['TIRE','TIRE'],['POTS','POTS'],['PUDDLE','PUDDLE'],['POOL','BLOOD POOL'],['HANGER','HANGER'],['BONES','BONES'],['DEBRIS','DEBRIS'],['BODY1','BODY 1'],['BODY2','BODY 2'],['BODY3','BODY 3'],['BODY4','BODY 4']];
const PROPBLK=new Set(['BARREL','TABLE','TABLE2','RACK','STOVE','VAT','VAT2','DRUMCAN','TOXIC','PLANT','CARCASS','FIRE','JTREE']);
const ED_SPECIAL=[['start','PLAYER START'],['exit','EXIT SWITCH'],['door','DOOR'],['doorY','YELLOW KEY DOOR'],['doorR','RED KEY DOOR'],['secret','SECRET WALL'],
  ['ambY','AMBUSH WALL, YELLOW KEY'],['ambR','AMBUSH WALL, RED KEY'],['spawn','ARENA SPAWN']];
const ED_ROLES=['auto','hold','rush','flank','patrol','ambush'];
const ED_KITS=['.38 ONLY','.38 AND PUMP','.38, PUMP, AK, DYNAMITE'];
const TABS=['WALL','FLOOR','ITEM','ENEMY','PROP','SPECIAL'];
const MAPV={x:4,y:18,w:442,h:364},PAN={x:452,y:18,w:184};
let E=null;
const ES={tab:0,pick:[0,0,0,0,0,0],z:10,ox:0,oy:0,scroll:[0,0,0,0,0,0],hc:-1,sel:-1,drag:null,modal:null,toast:null,undo:[],redo:[],dirty:false,t:0,hits:[],space:false,mx:0,my:0,file:null};
let WALLPAL=[],FLOORPAL=[];

