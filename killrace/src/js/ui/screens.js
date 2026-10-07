/* =====================================================================
   KILL RACE 14. SCREENS
   Title, pause and game over, drawn into the game buffer over the live city
   and sent through the same palette and tube as play.
   ===================================================================== */
const HELP=[['W S','GAS, BRAKE','A D','STEER'],['SPACE','FIRE','SHIFT','NITRO'],['E','LOCK ON','Q 1-3','GUNS'],['X','HANDBRAKE','B','DROP DRUM'],['H','HORN','ESC','PAUSE']];
const MODES=[['WAVES','THE GECKOS COME IN WAVES. LAST AS LONG AS YOU CAN.'],['RACE','3 LAPS, 8 CHECKPOINTS, 5 ARMED RACERS.']];
let TITLE_SEL=0;
let titleT=0;
function titleInit(){RACE.on=false;L=genCity(7);for(const[x,y,a,k]of L.parkAt)L.vcars.push(makeCar(k,x,y,a,{parked:true,hp:90,hp0:90}));
  resetPlayer();spawnPeds(40,2);P.x=L.sx;P.y=L.sy+2;state='title';titleT=0;setBody('m-cine');rumbleOn(false);}
function dim(k){for(let i=0;i<SW*VH*4;i+=4){D[i]*=k;D[i+1]*=k;D[i+2]*=k;}}
function shadowText(s,y,c,sc){const x=((SW-textW(s,sc))/2)|0;text(s,x+sc,y+sc,C_R,sc);text(s,x,y,c,sc);}

function titleFrame(dt){titleT+=dt;P.a=-Math.PI/2+Math.sin(titleT*.12)*1.4;P.fov=.75;setDir();HZ=HALF;updPeds(dt);updParts(dt);
  light=1;renderBack();skyFill();krWalls();krSprites();renderParts();dim(.42);clash();
  rect(0,VH,SW,SH-VH,C_K);
  shadowText('KILL RACE',22,C_Y,5);textC('SOMEWHERE IN NEVADA. AFTER DARK.',64,C_C);
  MODES.forEach(([m],i)=>{const sel=i===TITLE_SEL,y=82+i*20,w=textW(m,2)+16,x=(SW-w)>>1;if(sel){rect(x,y-3,w,20,C_Y);text('>',x+3,y+4,C_K);}text(m,x+10,y,sel?C_K:C_W,2);});
  textC(MODES[TITLE_SEL][1],126,C_C,1,C_K);
  const blink=((titleT*2)|0)%2===0;textC(UI_TOUCH?'TAP A MODE':GP.on?'D-PAD PICKS  A DRIVES':'UP DOWN PICKS  ENTER DRIVES',138,blink?C_W:C_GR,1,C_K);
  let y=154;for(const[k1,v1,k2,v2]of HELP){text(k1,20,y,C_Y,1,C_K);text(v1,62,y,C_W,1,C_K);text(k2,170,y,C_Y,1,C_K);text(v2,216,y,C_W,1,C_K);y+=9;}
  if(BEST.score)textC('BEST '+money(BEST.score)+'  WAVE '+BEST.wave+(BEST.race?'  RACE '+fmtTime(BEST.race):''),VH+8,C_C);
  textC('A BAGMAN ENGINE PROTOTYPE',VH+22,C_GR);
  show(2);}

function pauseDraw(){light=1;renderBack();skyFill();krWalls();krSprites();renderParts();drawHood();drawGun();dim(.35);clash();overlayKR();hud();
  shadowText('PAUSED',60,C_Y,3);textC(UI_TOUCH?'TAP TO RESUME':'ESC RESUMES   Q QUITS',100,C_W,1,C_K);show(1);}

function gameOver(){state='over';overT=0;rumbleOn(false);setBody('m-cine');ambStop();
  P.newBest=P.score>BEST.score;if(P.newBest)BEST.score=P.score;BEST.wave=Math.max(BEST.wave,WAVE.n);saveBest();}
function overDraw(dt){overT+=dt;light=1;renderBack();skyFill();krWalls();krSprites();renderParts();dim(.3);clash();
  const race=GAMEMODE==='race',won=race&&RACE.done;
  shadowText(won?(RACE.place===1?'WINNER':ordinal(RACE.place)+' PLACE'):'WRECKED',30,won&&RACE.place===1?C_Y:C_R,4);
  const t=Math.floor(P.time/60)+':'+String(Math.floor(P.time%60)).padStart(2,'0');
  const rows=race?[['FINISH',won?ordinal(RACE.place)+' OF 6':'DID NOT FINISH'],['TIME',won?fmtTime(P.fin):'-'],['RACERS WRECKED',P.kills],['PEDESTRIANS',P.peds],['SCORE',money(P.score)]]
    :[['WAVE',WAVE.n],['CARS WRECKED',P.kills],['DEPUTIES AND DOGS',P.foot],['PEDESTRIANS',P.peds],['TIME',t],['SCORE',money(P.score)]];
  let y=78;for(const[k,v]of rows){text(k,70,y,C_GR,1,C_K);const s=String(v);text(s,250-textW(s),y,C_Y,1,C_K);y+=12;}
  if(P.newBest||P.newRace)textC(P.newRace?'NEW BEST RACE TIME':'NEW BEST',y+4,((overT*4)|0)&1?C_Y:C_W,1,C_K);
  if(overT>1)textC(UI_TOUCH?'TAP TO DRIVE AGAIN':'ENTER: AGAIN   ESC: TITLE',VH-10,C_W,1,C_K);
  rect(0,VH,SW,SH-VH,C_K);show(2);}
