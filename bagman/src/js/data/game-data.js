/* =====================================================================
   7. GAME DATA: weapons, enemies, power-ups, chapters
   ===================================================================== */
const WEAP=[
  {name:'Fists',k:'wFists',ammo:null,rate:.32,seq:[1,2,1],ft:.06,hs:0},
  {name:'.38 Snub',k:'wPistol',ammo:'b',rate:.28,seq:[1,2,3,4],ft:.055,hs:.55},
  {name:'Pump 12',k:'wShotgun',ammo:'s',rate:.82,seq:[1,2,3,4],ft:.12,hs:.12},
  {name:'AK-47',k:'wTommy',ammo:'b',rate:.075,seq:[1,2],ft:.035,hs:.22},
  {name:'Dynamite',k:'wDyn',ammo:'d',rate:.8,seq:[1,2,2,2],ft:.08,hs:0},
  {name:'Flamer',k:'wFlame',ammo:null,rate:.05,seq:[2,3],ft:.05,hs:0}
];
const LIZ=['ANOLE','TEGU','AGAMA','MOLOCH','WHIPTAIL','UROMASTYX','BASILISK','SAILFIN','COLLARED','HORNED TOAD','FENCE','SPINY','SKINK','BEARDED','MONITOR','RACERUNNER','NIGHT LIZARD','ZEBRATAIL','SIDEBLOTCH','LEOPARD','CHUCKWALLA','GECKO','ALLIGATOR','BANDED','TREE LIZARD','ROCK LIZARD','SHINGLEBACK','FRILLNECK','THORNY'];
const DOGN=['DUKE','BRUNO','KING','SARGE','TANK','DIESEL','RAMBO','BUTCH','ROCCO','SMOKEY'];
const ETYPE={
  thug:{sh:'thug',hp:30,spd:2.1,cd:[1.4,2.6],wind:.4,pat:'single',bs:9,dmg:4,sc:1,score:100,drop:.65},
  cop:{sh:'cop',hp:40,spd:2.4,cd:[1.3,2.3],wind:.34,pat:'burst2',bs:10.5,dmg:4,sc:1,score:150,drop:.65},
  enf:{sh:'enf',hp:100,spd:1.8,cd:[1.6,2.6],wind:.45,pat:'fan5',bs:8,dmg:3,sc:1.06,score:300,drop:.8},
  heavy:{sh:'heavy',hp:100,spd:1.9,cd:[1.5,2.4],wind:.4,pat:'single',bs:10,dmg:4,sc:1.04,score:400,drop:.8,burstN:4,bint:.13,nolock:1},
  torch:{sh:'torch',hp:210,spd:1.15,cd:[1.8,2.8],wind:.55,pat:'flame',bs:6.5,dmg:3,sc:1.22,score:100,drop:.9,range:8.5,burstN:16,bint:0,hold:.05},
  dog:{dog:1,hp:26,spd:5.4,cd:[.6,.9],dmg:7,sc:.55,score:120,drop:0},
  gila:{sh:'gila',hp:1100,spd:1.9,cd:[.9,1.5],wind:.4,pat:'gila',bs:8.5,dmg:6,sc:1.4,score:6000,boss:'GILA',pulp:'bandit'},
  iguana:{sh:'iguana',hp:1400,spd:2.4,cd:[.8,1.3],wind:.3,pat:'iguana',bs:12,dmg:6,sc:1.4,score:9000,boss:'IGUANA',pulp:'cop'},
  komodo:{sh:'komodo',hp:2800,spd:1.4,cd:[1,1.5],wind:.5,pat:'komodo',bs:6.8,dmg:6,sc:1.6,score:20000,boss:'KOMODO',pulp:'aviator',range:10,burstN:16,bint:0,hold:.05}
};
const POWER={BERSERK:{time:15,label:'BERSERK',c:C_R},DEADEYE:{time:15,label:'SLO-MO',c:C_C},FLAMER:{time:15,label:'FLAMER',c:C_Y},KEVLAR:{label:'KEVLAR',c:C_B}};
const SCOREV={CASH:500,ROLL:100,BAGGIE:250,PILLS:150,CHAIN:750,PACKAGE:1000,KILO:2500};
const SCOREK=['ROLL','BAGGIE','PILLS','CASH','CHAIN','PACKAGE'],SCOREW=[30,25,15,15,8,7];
const COMBO=[[3,'KILL!'],[4,'KILL MORE!'],[5,'KILL KILL KILL!'],[7,'MORE! MORE! MORE!'],[10,'OVERKILL!!!!'],[15,'BLOODBATH!!!!!'],[20,'MASSACRE!!!!!!']];
const CH=[
 {t:'Room 9',why:'A motel off the state route. The buyer brought a crew.',fi:1,mode:'maze',size:42,rooms:['MOTEL1','MOTEL2','MOTEL3','WINDOW'],corr:'MOTELC',fl:'carpet',ceil:[60,60,40],bd:2,mix:{thug:1},dens:.85,keys:1,blk:['TABLE','TABLE2','PLANT'],soft:['BODY1','POOL','BONES'],photo:'01',power:['BERSERK'],
  story:'Somewhere in Nevada, a two-story motel off the state route. You are Salamander. You drove nine kilos here in a gym bag for a buyer called Anole. Anole was supposed to come alone. He brought two deputies and a shotgun. The bag is gone and you are still breathing, which nobody planned for.',obj:'Get out of the motel alive.'},
 {t:'All Night',why:'Skink runs the only pumps open past midnight. Skink set you up.',fi:1,mode:'waves',size:36,wall:'CINDER2',fl:'asphalt',bd:6,mix:{thug:.7,cop:.3},photo:'02',
  story:'Skink set up the meet. Skink runs the only pumps open past midnight for sixty miles, and you came to ask him why. His whole crew came to make sure you never get the chance. Hold the lot until they stop coming. Then take his office. Mind the pumps.',obj:'Survive six waves. Take the office.'},
 {t:'Suds',why:'A laundromat on the main drag. The money gets washed here.',fi:7,mode:'maze',size:46,rooms:['SUDS1','SUDS2','SUDS3'],corr:'SUDSC',fl:'checker',ceil:[0,140,140],bd:5,mix:{thug:.7,cop:.3},dens:1.0,keys:2,blk:['TABLE2','VAT2','XDRUM'],soft:['PUDDLE','POOL','BODY2'],photo:'03',power:['DEADEYE'],
  story:'Skink talked before he stopped breathing. The money goes through a laundromat on the main drag. The machines run all night and nobody ever brings clothes. The men guarding it get dirty for a living.',obj:'Find both keys. Find the way down.'},
 {t:'Cold Storage',why:'An old packing plant. Gila keeps the product in the freezer.',fi:5,mode:'maze',size:46,rooms:['COLD1','COLD2','COLD3'],corr:'COLDC',fl:'brtile',ceil:[60,60,60],bd:2,mix:{thug:.55,enf:.45},dens:1.1,keys:2,blk:['CARCASS','VAT','XDRUM'],soft:['BODY1','BODY2','POOL','BONES','HANGER'],photo:'04',boss:'gila',power:['BERSERK'],
  story:'A tunnel under the laundromat runs to an old packing plant. Gila keeps the product in the freezer with the sides of beef. He keeps the people who asked questions in there too. The first man you meet inside is carrying an AK.',obj:'Kill Gila. Throw the switch.'},
 {t:'Saturday Night',why:'The sheriff\'s substation. The night shift is on the payroll.',fi:4,mode:'maze',size:48,rooms:['SUB1','SUB2','SUB3','WINDOW2'],corr:'SUBC',fl:'smtile',ceil:[30,30,30],bd:1,mix:{torch:.05,cop:.7,thug:.15,dog:.15},dens:1.15,keys:2,blk:['TABLE2','DRUMCAN','XDRUM'],soft:['POOL','BODY3'],photo:'05',power:['DEADEYE'],
  story:'Gila kept a ledger, and one column of it pays the sheriff. Every deputy on the night shift has your description now, and the kennel behind the substation has been fed nothing since noon.',obj:'Fight through the substation.'},
 {t:'County',why:'The county evidence lot. Your kilos are leaving on a flatbed.',fi:1,mode:'maze',size:50,rooms:['CNTY1','CNTY2','CNTY3'],corr:'CNTYC',fl:'concrete',ceil:[20,20,20],bd:7,mix:{torch:.06,cop:.6,enf:.25,dog:.15},dens:1.2,keys:2,blk:['CRATE','BARREL','XDRUM'],soft:['POOL','BODY1'],photo:'06',power:['BERSERK'],
  story:'Your bag was logged into evidence as four kilos. Somebody is doing arithmetic with your life. The other five went out the back of the county lot tonight on a flatbed, and the flatbed leaves from the loading dock.',obj:'Reach the loading dock.'},
 {t:'Eighteen Wheels',why:'The state route, on the back of that flatbed.',mode:'rails',bd:2,photo:'07',
  story:'You drop onto the flatbed as it pulls out. Somebody left an AK under the tarp with a crate of magazines. Behind you, every car the Geckos own is coming up the highway with its lights off.',obj:'Hold the flatbed. The drum never runs dry.'},
 {t:'Dry Lake',why:'A cook site on a dry lake. Iguana runs security.',fi:7,mode:'yard',size:46,wall:'ROCK2',fl:'dirt',bd:6,mix:{torch:.07,cop:.4,enf:.3,thug:.1,dog:.2},dens:1.1,obs:['SHACK2','RV','CAR'],deco:['FIRE','TIRE','JTREE','TREE','TREE','LAMP','XDRUM','XDRUM'],exitTex:'EXITM',photo:'08',boss:'iguana',power:['BERSERK','DEADEYE'],
  story:'The flatbed ends at a cook site on a dry lake bed, a ring of shacks and trailers under work lights. Iguana runs security out here on department overtime, with his dogs. He was the second deputy in Room 9.',obj:'Kill Iguana. Find the key. Throw the switch.'},
 {t:'The Wash',why:'Twenty miles of dry riverbed between the lake and town.',fi:2,mode:'yard',size:56,wall:'ROCK2',fl:'dirt',bd:6,mix:{thug:.35,enf:.25,dog:.4},dens:.75,obs:['ROCK2','ROCK2','ROCK','SHACK2','CAR'],deco:['JTREE','JTREE','TREE','TREE','TIRE','BONES','XDRUM'],exitTex:'SHACK2',photo:'16',dawn:1,power:['DEADEYE','BERSERK'],
  story:'Iguana is dead and his trucks are gone. That leaves the wash, twenty miles of dry riverbed between the lake and town, with the sun coming up and Komodo\'s men combing it with dogs and rifles. There is a line shack at the far end with a phone in it.',obj:'Cross the wash. Find the key to the line shack.'},
 {t:'The Channel',why:'The flood channels under town. Nobody watches them.',fi:4,mode:'maze',halls:1,size:51,rooms:['CHAN1','CHAN2','CHAN3'],corr:'CHANC',fl:'wet',ceil:[0,0,0],bd:4,mix:{torch:.08,thug:.5,enf:.4,dog:.1},dens:1.25,keys:2,blk:['DRUMCAN','TOXIC','XDRUM'],soft:['PUDDLE','BONES','BODY4'],photo:'09',power:['DEADEYE','BERSERK'],
  story:'Every road back into town is watched. The flood channels are not. They run under all of it, dry eleven months of the year, and the people who live down there do not ask questions.',obj:'Follow the channel into town.'},
 {t:'Freight',why:"A freight running into town. Komodo\'s guns ride on top.",fi:2,mode:'train',size:190,wall:'ROCK2',fl:'panel',fl2:'dirt',bd:5,mix:{thug:.35,enf:.3,cop:.25,torch:.1},dens:1,photo:'13',power:['BERSERK','DEADEYE'],
  story:'',obj:'Get to the engine. Throw the brake.'},
 {t:'Counting Room',why:'Under a scrapyard. Chuckwalla counts Komodo\'s money.',fi:4,mode:'maze',size:52,rooms:['CNT1','CNT2','CNT3'],corr:'CNTC',fl:'panel',ceil:[20,20,20],bd:4,mix:{torch:.08,thug:.35,enf:.45,cop:.2},dens:1.3,keys:2,blk:['CRATE','TABLE','XDRUM'],soft:['POOL','BODY1'],photo:'10',rich:1,power:['BERSERK','DEADEYE'],
  story:'The yard is quiet now. Chuckwalla counts for Komodo in the room underneath it. Every dollar your nine kilos made was stacked here, banded and sent up the line. The men who count it are paid well enough to die for it.',obj:'Clear the counting room.'},
 {t:'Oasis',why:'A dead casino resort on the state line. Komodo\'s men.',fi:1,mode:'yard',size:50,wall:'FENCE',fl:'asphalt2',bd:2,mix:{torch:.08,enf:.4,cop:.25,thug:.15,dog:.2},dens:1.2,obs:['RV','RV','CAR','BOARD2'],deco:['JTREE','TREE','TIRE','LAMP','FIRE','XDRUM'],exitTex:'CASINO2',exitBig:1,photo:'11',power:['BERSERK','DEADEYE'],
  story:'Komodo bought a dead desert resort on the state line. The casino has had its power cut for years and the RV park is full of men who work for him. His plane is waiting on the other side.',obj:'Find the key. Get into the casino.'},
 {t:'The Hangar',why:'Hangar four. Komodo\'s plane leaves at dawn.',fi:5,mode:'maze',size:54,rooms:['HANG1','HANG2','HANG3'],corr:'HANGC',fl:'slab',ceil:[0,0,0],bd:2,mix:{torch:.1,enf:.55,cop:.35,dog:.1},dens:1.35,keys:2,blk:['DRUMCAN','CRATE','XDRUM'],soft:['POOL','BODY1'],photo:'12',boss:'komodo',power:['BERSERK','DEADEYE'],
  story:'Hangar four. The plane is fuelled for a dawn departure. Komodo bought Anole, Skink, Gila, Iguana and the county. He did not buy Salamander.',obj:'Kill Komodo.'}
];
const ENDPHOTO='17';
const ENDING='The plane never leaves the hangar. The money burns on the concrete with the jet fuel and the smoke is visible from the state route. Nobody writes it down. Nobody comes looking for Salamander. You walk out to the road and wait for the sun.';

