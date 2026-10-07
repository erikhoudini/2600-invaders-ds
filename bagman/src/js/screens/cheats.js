const CHEATS={BLACKTAR:()=>{cheat.tar=!cheat.tar;return 'PERMANENT SLO-MO '+(cheat.tar?'ON.':'OFF.');},FENTBALL:()=>{cheat.fent=!cheat.fent;return 'NO DAMAGE '+(cheat.fent?'ON.':'OFF.');},
  BASEHEAD:()=>{SAVE.best=CH.length;writeSave();return 'EVERY CHAPTER IS OPEN.';},ROBOTRIP:()=>{UNL.allMods=1;saveUnl();return 'EVERY MODIFIER IS UNLOCKED.';}};
function showCheats(){const GRID=['ABCDEFG','HIJKLMN','OPQRSTU','VWXYZ<>'];
  const sc={title:'CHEATS',border:3,buf:'',msg:'',mc:C_C,gx:0,gy:0,back:showCache,
    foot:()=>UI.input==='touch'?'TAP THE LETTERS':UI.input==='mouse'?'CLICK OR TYPE  RIGHT CLICK BACK':UI.input==='pad'?'MOVE  A PRESS  B BACK':'TYPE A CODE  ENTER TRY  ESC BACK',
    press:ch=>{if(ch==='<'){sc.buf=sc.buf.slice(0,-1);play('menu',.3,.8);}else if(ch==='>')sc.submit();else if(sc.buf.length<12){sc.buf+=ch;play('menu',.3,1.5);}},
    submit:()=>{const f=CHEATS[sc.buf];if(f){sc.msg=f();sc.mc=C_G;play('power',.7);try{localStorage.setItem('bagman.cheat',JSON.stringify(cheat));}catch(_){}}else{sc.msg=sc.buf?'NOTHING HAPPENS.':'TYPE A CODE FIRST.';sc.mc=C_R;play('empty',.7);}sc.buf='';},
    keys:e=>{const c=e.code;if(/^Key[A-Z]$/.test(c)){sc.press(c[3]);sc.typed=1;return true;}if(c==='Backspace'){if(!sc.buf)return false;sc.press('<');return true;}
      if(c==='Enter'||c==='NumpadEnter'){if(e.repeat)return true;if(sc.typed)sc.submit();else sc.press(GRID[sc.gy][sc.gx]);return true;}
      if(c==='Space'){sc.press(GRID[sc.gy][sc.gx]);return true;}
      const mv=(dx,dy)=>{sc.typed=0;sc.gy=(sc.gy+dy+4)%4;sc.gx=(sc.gx+dx+7)%7;if(sc.gx>=GRID[sc.gy].length)sc.gx=GRID[sc.gy].length-1;play('menu',.2,1.4,.03);};
      if(c==='ArrowLeft'){mv(-1,0);return true;}if(c==='ArrowRight'){mv(1,0);return true;}if(c==='ArrowUp'){mv(0,-1);return true;}if(c==='ArrowDown'){mv(0,1);return true;}return false;},
    tap:h=>{if(h.k!=null){const x=h.k%10,y=(h.k/10)|0;sc.gx=x;sc.gy=y;sc.typed=0;sc.press(GRID[y][x]);return true;}return false;},
    hover:h=>{if(h.k!=null){sc.gx=h.k%10;sc.gy=(h.k/10)|0;}},
    draw:()=>{const W=S.w,H=S.h,m=M();let y=header(sc);const bw=W-2*m;uRect(m,y,bw,22,C_K);uBox(m,y,bw,22,C_W);
      uText(sc.buf+(((UI.t*3)|0)%2?'_':' '),m+8,y+7,C_Y,PORT?2:1);y+=30;
      const cw=PORT?30:30,chh=PORT?26:20,gx0=m+((bw-7*cw)>>1);
      GRID.forEach((row,gy)=>[...row].forEach((ch,gx)=>{const x=gx0+gx*cw,yy=y+gy*chh,sel=gx===sc.gx&&gy===sc.gy;uRect(x,yy,cw-3,chh-3,sel?C_Y:C_K);uBox(x,yy,cw-3,chh-3,sel?C_Y:C_B);
        const lab=ch==='<'?'DEL':ch==='>'?'OK':ch;uText(lab,x+((cw-3-uTW(lab))>>1),yy+((chh-10)>>1),sel?C_K:ch==='>'?C_G:C_W);UI.hits.push({x,y:yy,w:cw-3,h:chh-3,k:gy*10+gx});}));
      y+=4*chh+8;if(sc.msg){for(const l of wrap(sc.msg,Math.floor(bw/7))){uText(l,m,y,sc.mc);y+=10;}y+=4;}
      const on=[cheat.tar&&'PERMANENT SLO-MO',cheat.fent&&'NO DAMAGE'].filter(Boolean);
      for(const l of wrap(on.length?'ON: '+on.join(', ')+'. ACHIEVEMENTS STAY LOCKED WHILE A CHEAT IS ON.':'ACHIEVEMENTS STAY LOCKED WHILE A CHEAT IS ON.',Math.floor(bw/7))){uText(l,m,y,C_GR);y+=10;}}};
  ui(sc);}
