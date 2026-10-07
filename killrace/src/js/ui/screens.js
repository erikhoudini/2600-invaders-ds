/* =====================================================================
   KILL RACE 14. SCREENS
   Title, pause and game over, drawn into the game buffer over the live city
   and sent through the same palette and tube as play.
   ===================================================================== */
const HELP=[['W S','GAS, BRAKE AND REVERSE'],['A D','STEER'],['SPACE','FIRE'],['SHIFT','NITRO'],['X','HANDBRAKE'],['E','LOCK ON. GUNS SWING ONTO IT'],
  ['Q  1-3','CHANGE GUN'],['B','DROP A FUEL DRUM'],['H','HORN. THEY SCATTER'],['ESC','PAUSE']];
let titleT=0;
function titleInit(){L=genCity(7);for(const[x,y,a,k]of L.parkAt)L.vcars.push(makeCar(k,x,y,a,{parked:true,hp:90,hp0:90}));
  resetPlayer();spawnPeds(40,2);P.x=L.sx;P.y=L.sy+2;state='title';titleT=0;setBody('m-cine');rumbleOn(false);}
function dim(k){for(let i=0;i<SW*VH*4;i+=4){D[i]*=k;D[i+1]*=k;D[i+2]*=k;}}
function shadowText(s,y,c,sc){const x=((SW-textW(s,sc))/2)|0;text(s,x+sc,y+sc,C_R,sc);text(s,x,y,c,sc);}

function titleFrame(dt){titleT+=dt;P.a=-Math.PI/2+Math.sin(titleT*.12)*1.4;P.fov=.75;setDir();HZ=HALF;updPeds(dt);updParts(dt);
  light=1;renderBack();skyFill();krWalls();krSprites();renderParts();dim(.42);clash();
  rect(0,VH,SW,SH-VH,C_K);
  shadowText('KILL RACE',22,C_Y,5);textC('SOMEWHERE IN NEVADA. AFTER DARK.',64,C_C);
  const blink=((titleT*2)|0)%2===0;textC(UI_TOUCH?'TAP TO DRIVE':GP.on?'PRESS A TO DRIVE':'PRESS ENTER TO DRIVE',86,blink?C_W:C_GR,1,C_K);
  let y=104;for(const[k,v]of HELP){text(k,58,y,C_Y,1,C_K);text(v,112,y,C_W,1,C_K);y+=9;}
  if(BEST.score)textC('BEST '+money(BEST.score)+'  WAVE '+BEST.wave,VH+8,C_C);
  textC('A BAGMAN ENGINE PROTOTYPE',VH+22,C_GR);
  show(2);}

function pauseDraw(){light=1;renderBack();skyFill();krWalls();krSprites();renderParts();drawHood();drawGun();dim(.35);clash();overlayKR();hud();
  shadowText('PAUSED',60,C_Y,3);textC(UI_TOUCH?'TAP TO RESUME':'ESC RESUMES   Q QUITS',100,C_W,1,C_K);show(1);}

function gameOver(){state='over';overT=0;rumbleOn(false);setBody('m-cine');ambStop();
  P.newBest=P.score>BEST.score;if(P.newBest)BEST.score=P.score;BEST.wave=Math.max(BEST.wave,WAVE.n);saveBest();}
function overDraw(dt){overT+=dt;light=1;renderBack();skyFill();krWalls();krSprites();renderParts();dim(.3);clash();
  shadowText('WRECKED',30,C_R,4);
  const rows=[['WAVE',WAVE.n],['CARS WRECKED',P.kills],['DEPUTIES AND DOGS',P.foot],['PEDESTRIANS',P.peds],['TIME',Math.floor(P.time/60)+':'+String(Math.floor(P.time%60)).padStart(2,'0')],['SCORE',money(P.score)]];
  let y=78;for(const[k,v]of rows){text(k,70,y,C_GR,1,C_K);const s=String(v);text(s,250-textW(s),y,C_Y,1,C_K);y+=12;}
  if(P.newBest)textC('NEW BEST',y+4,((overT*4)|0)&1?C_Y:C_W,1,C_K);
  if(overT>1)textC(UI_TOUCH?'TAP TO DRIVE AGAIN':'ENTER: AGAIN   ESC: TITLE',VH-10,C_W,1,C_K);
  rect(0,VH,SW,SH-VH,C_K);show(2);}
