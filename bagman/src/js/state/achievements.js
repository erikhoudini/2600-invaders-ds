// twenty achievements, dealt as four suits of ace, king, queen, jack and joker
const SUITS=['\u2660','\u2665','\u2666','\u2663'],SUITN=['Spades','Hearts','Diamonds','Clubs'],RANKS=['A','K','Q','J','JOKER'],RANKN=['Ace','King','Queen','Jack','Joker'];
const ACH=[
 ['fullrun','Last Man Standing','Finish the story.'],['massacre','Massacre','Chain twenty kills.'],['overkill','Overkill','Chain ten kills.'],['headhunter','Headhunter','100 headshots.'],['onestick','One Stick','Kill ten men with a single stick of dynamite.'],
 ['untouched','Not A Scratch','Clear a chapter without taking a hit.'],['biggame','Big Game','Kill Komodo.'],['knuckles','Knuckles','50 kills with your fists.'],['buckshot','Buckshot','100 kills with the pump.'],['roadrage','Road Rage','Get the flatbed through with the truck above half.'],
 ['milly','A Milly','Finish a run with a million dollars on the board.'],['jackpot','Seven Seven Seven','Hit the jackpot.'],['salesman','Salesman','100 kills with the .38.'],['typewriter','Chicago Typewriter','200 kills with the AK.'],['doubledown','Double Or Nothing','Win a hand in the back room.'],
 ['chainsmoker','Chain Smoker','Find all 35 packs of Spirals.'],['arena10','Ten Rounds','Survive ten arena waves.'],['stickman','Stick Man','25 kills with dynamite.'],['snoop','Snoop','Find every secret in a chapter.'],['brakeman','Brakeman','Throw the brake on the freight.']];
const cardName=i=>RANKN[i%5]+(i%5===4?' of '+SUITN[(i/5)|0]:' of '+SUITN[(i/5)|0]);
let KILOS={};try{KILOS=JSON.parse(localStorage.getItem('bagman.kilos')||'{}');}catch(e){}
const saveKilos=()=>{try{localStorage.setItem('bagman.kilos',JSON.stringify(KILOS));}catch(e){}};
let ACHV={};try{ACHV=JSON.parse(localStorage.getItem('bagman.ach')||'{}');}catch(e){}
let achQ=[];
function ach(id){if(L&&L.custom)return;if(ACHV[id]||cheating()||!ACH.some(a=>a[0]===id))return;ACHV[id]=Date.now();try{localStorage.setItem('bagman.ach',JSON.stringify(ACHV));}catch(e){}
  const a=ACH.find(a=>a[0]===id);if(!a)return;achQ.push({t:a[1],time:3});play('combo2',.7,1.2);}
function achTick(){const kw=ST.kw||{};
  if((kw.pistol||0)>=100)ach('salesman');if((kw.ak||0)>=200)ach('typewriter');if((kw.shotgun||0)>=100)ach('buckshot');if((kw.fists||0)>=50)ach('knuckles');if((kw.dyn||0)>=25)ach('stickman');
  if(ST.chain>=10)ach('overkill');if(ST.chain>=20)ach('massacre');if((ST.jackpots||0)>0)ach('jackpot');if(spiralCount()>=SPIRAL_ALL)ach('chainsmoker');
  if(ST.head>=100)ach('headhunter');if((ST.bjWon||0)>0)ach('doubledown');}
function drawAch(dt){if(!achQ.length)return;const a=achQ[0];a.time-=dt;if(a.time<=0){achQ.shift();return;}
  const t='ACHIEVEMENT: '+a.t.toUpperCase(),w=Math.min(SW-8,textW(t)+12),x=(SW-w)>>1,y=VH-40;rect(x-1,y-1,w+2,16,C_K);rect(x,y,w,14,C_Y);text(t,x+6,y+4,C_K);}
