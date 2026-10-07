/* ---------- achievements as a hand of cards ---------- */
function drawCardBig(x,y,i,up){const w=158,h=214;
  if(!up){const r=uImg('cardBack',x,y,w,h,'cover',.5);if(!r)uRect(x,y,w,h,C_DR);uBox(x,y,w,h,C_W);return;}
  const su=(i/5)|0,rk=RANKS[i%5],ink=su===1||su===2?C_R:C_K,sym=SUITS[su];
  uRect(x,y,w,h,C_W);uBox(x,y,w,h,C_K);uRect(x,y,1,1,C_K);uRect(x+w-1,y,1,1,C_K);
  const lab=rk==='JOKER'?'JOKER':rk;uText(lab+' '+sym,x+4,y+5,ink);uTextR(sym+' '+lab,x+w-4,y+5,ink);
  const r=uImg('card:'+i,x+4,y+18,150,190,'native');if(!r)uRect(x+4,y+18,150,190,C_K);uBox(x+3,y+17,152,192,ink);}
function showAch(){const sc={eyebrow:()=>'ACHIEVEMENTS  '+ACH.filter(a=>ACHV[a[0]]).length+'/'+ACH.length,border:4,back:showCache,i:0,
    foot:()=>UI.input==='touch'?'TAP A CARD':UI.input==='mouse'?'POINT AT A CARD':'◀▶▲▼ PICK A CARD  ESC BACK',
    keys:e=>{const c=e.code;const mv=(dx,dy)=>{const x=sc.i%5,y=(sc.i/5)|0;sc.i=((y+dy+4)%4)*5+(x+dx+5)%5;play('menu',.25,1.4,.03);};
      if(KLT().includes(c)){mv(-1,0);return true;}if(KRT().includes(c)){mv(1,0);return true;}if(KUP().includes(c)){mv(0,-1);return true;}if(KDN().includes(c)){mv(0,1);return true;}
      if(KOK().includes(c))return true;return false;},
    tap:h=>{if(h.card!=null){sc.i=h.card;play('menu',.3,1.3);return true;}return false;},hover:h=>{if(h.card!=null)sc.i=h.card;},
    draw:()=>{const W=S.w,H=S.h,m=M(),i=sc.i,a=ACH[i],up=!!ACHV[a[0]];let ix,iy,iw,gx,gy,cw,chh;
      if(PORT){uText(ev(sc.eyebrow),m,8,C_C);drawCardBig((W-158)>>1,20,i,up);ix=m;iy=240;iw=W-2*m;gx=m;cw=43;chh=19;gy=H-17-4*chh;}
      else{drawCardBig(8,6,i,up);ix=176;iy=8;iw=W-ix-m;uText(ev(sc.eyebrow),ix,iy,C_C);iy+=12;gx=ix;cw=27;chh=22;gy=H-17-4*chh;}
      const cols=Math.floor(iw/7);const line=(s,c)=>{for(const l of wrap(s,cols)){if(iy+8>gy-2)return;uText(l,ix,iy,c);iy+=9;}iy+=3;};
      line(cardName(i),C_W);if(up)line(a[1],C_Y);else line(a[1]+'. FACE DOWN',C_GR);line(a[2],up?C_W:C_GR);if(up)line('COVER: '+A.cardMeta[i][0]+', '+A.cardMeta[i][1],C_GR);
      for(let k=0;k<20;k++){const x=gx+(k%5)*cw,y=gy+((k/5)|0)*chh,w=cw-4,h=chh-3,got=!!ACHV[ACH[k][0]],su=(k/5)|0,ink=su===1||su===2?C_R:C_K;
        if(got){uRect(x,y,w,h,C_W);uText((RANKS[k%5]==='JOKER'?'*':RANKS[k%5])+SUITS[su],x+((w-13)>>1),y+((h-7)>>1),ink);}else{uRect(x,y,w,h,C_DR);uText(SUITS[su],x+((w-6)>>1),y+((h-7)>>1),[150,0,0]);}
        if(k===i&&((UI.t*4)|0)%2===0){uBox(x-2,y-2,w+4,h+4,C_Y);uBox(x-1,y-1,w+2,h+2,C_Y);}UI.hits.push({x:x-1,y:y-1,w:cw,h:chh,card:k});}}};
  ui(sc);}

