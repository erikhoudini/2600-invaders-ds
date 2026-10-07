// 35 packs of Spirals across the story, two or three a chapter, kept for good once found
const SPN={1:2,2:2,3:3,4:3,5:3,6:3,8:3,9:3,10:3,11:2,12:3,13:3,14:2};const SPIRAL_ALL=35;
let SPIR={};try{SPIR=JSON.parse(localStorage.getItem('bagman.spirals')||'{}');}catch(e){}
const spiralCount=()=>Object.keys(SPIR).length;
function spiralCap(n){const t=SPN[n]||0;if(!t)return{s:'NO SPIRALS',c:C_GR};let g=0;for(let k=0;k<t;k++)if(SPIR[n+'-'+k])g++;return{s:'SPIRALS '+g+'/'+t,c:g===t?C_G:C_C};}
function spiralGet(id){if(!id||SPIR[id])return;SPIR[id]=1;try{localStorage.setItem('bagman.spirals',JSON.stringify(SPIR));}catch(e){}
  L.spiral++;ST.spiral=(ST.spiral||0)+1;P.score+=500;const c=spiralCount();play('combo',.6,1.9);
  const um=MODLIST.find(m=>m[3]===c);if(um)feed('MODIFIER UNLOCKED: '+um[1],C_C);
  if(c>=SPIRAL_ALL){bigMsg('ALL 35 SPIRALS',3,C_W);feed('LUCKY: TWO SEVENS NOW PAY THE JACKPOT',C_Y);feed('MODIFIED ARENA IS OPEN',C_C);ach('chainsmoker');UNL.lucky=1;saveUnl();}
  else{bigMsg('SPIRAL '+c+' OF '+SPIRAL_ALL,1.6,C_W);}}
