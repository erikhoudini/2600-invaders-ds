/* ---------- boot, title and main menu ---------- */
function showSplash(){let t=0,done=false;const go=()=>{if(done)return;done=true;showRating();};
  ui({border:0,nofoot:1,items:[],draw:()=>{const W=S.w,H=S.h;const r=uImg('houdini',8,(H>>1)-44,W-16,50,'contain');const y=r?r.y+r.h+14:(H>>1)+14;
      uTextC('GAME BY ERIK HOUDINI',y,C_W,PORT?1:2);UI.hits.push({x:0,y:0,w:W,h:H});},
    tick:dt=>{t+=dt;if(t>3.4)go();},keys:()=>{go();return true;},tap:()=>{go();return true;}});}
function showRating(){ui({eyebrow:'CONTENT ADVISORY',title:'MATURE AUDIENCES',tcol:C_R,border:2,
  text:['STRONG BLOODY VIOLENCE AND GORE.','DRUG USE AND TRAFFICKING.','POLICE CORRUPTION.','FLASHING IMAGES. FLASHES CAN BE TURNED DOWN IN OPTIONS.'],
  items:[{label:'CONTINUE',act:()=>introStart(false,()=>comicStart('intro',showMenu))},{label:'OPTIONS',act:()=>showOptions(showRating)}]});}
function showMenu(){saveStats();rumbleOn(false);GM='story';PAUSED=false;
  const sc={big:1,border:2,menu:1,foot:'',items:[{label:'STORY',act:showStory},{label:'SIDE HUSTLES',act:showHustles},{label:'DRUG CACHE',act:showCache},{label:'OPTIONS',act:()=>showOptions(showMenu)},...(DESK?[{label:'QUIT',act:()=>DESK.quit()}]:[])],
    draw:()=>{const W=S.w,H=S.h,m=M();
      if(PORT){const r=uImg('pulp:hero',m,10,W-2*m,168,'cover',.12);if(r)uBox(r.x-2,r.y-2,r.w+4,r.h+4,C_Y);
        uTextS('BAGMAN',(W-uTW('BAGMAN',4))>>1,194,C_Y,4);uTextC('SOMEWHERE IN NEVADA',230,C_C);drawItems(sc,m,248,W-2*m,H-38);}
      else{const r=uImg('pulp:hero',W-108,6,98,H-24,'contain');if(r)uBox(r.x-2,r.y-2,r.w+4,r.h+4,C_Y);
        uTextS('BAGMAN',m,12,C_Y,4);uText('SOMEWHERE IN NEVADA',m+2,46,C_C);drawItems(sc,m,66,W-m-120,H-34);}
      const st1='SPIRALS '+spiralCount()+'/'+SPIRAL_ALL+'  CARDS '+ACH.filter(a=>ACHV[a[0]]).length+'/'+ACH.length,st2='KILLS '+Math.round(ST.kills||0).toLocaleString('en-US');
      if(PORT){uText(st1,m,H-34,C_GR);uText(st2,m,H-24,C_GR);}else uText(st1+'  '+st2,m,H-25,C_GR);}};
  ui(sc);}

