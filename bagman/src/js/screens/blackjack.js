/* ---------- blackjack: one felt table for the back room and the standalone game ---------- */
function bjDeck(){const d=[];for(let k=0;k<2;k++)for(let s=0;s<4;s++)for(const r of['A','2','3','4','5','6','7','8','9','10','J','Q','K'])d.push({r,s});for(let i=d.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[d[i],d[j]]=[d[j],d[i]];}return d;}
function bjVal(h){let v=0,a=0;for(const c of h){if(c.r==='A'){a++;v+=11;}else v+='JQK'.includes(c.r)?10:+c.r;}while(v>21&&a){v-=10;a--;}return v;}
const BJSTEP=10000;let BJBET=0;
let BJS={pot:50000,best:50000,hands:0};try{Object.assign(BJS,JSON.parse(localStorage.getItem('bagman.bj')||'{}'));}catch(e){}
const saveBJS=()=>{try{localStorage.setItem('bagman.bj',JSON.stringify(BJS));}catch(e){}};
const ease=t=>1-Math.pow(1-clamp(t,0,1),3);
// o: {title, pot(), apply(delta), leave(), leaveLabel, single (one hand then next), next()}
function bjTable(o){const ST_=o.step||BJSTEP;const sc={step:ST_,border:4,row:1,o,phase:'bet',p:[],d:[],dk:bjDeck(),q:[],qT:0,res:null,resT:0,delta:0,shown:o.pot(),chipT:-9,chipTo:0,t:0,
    back:()=>{if(sc.phase==='bet'||sc.phase==='done')o.leave();},foot:()=>bjFoot(sc),draw:()=>bjDraw(sc),tick:dt=>bjTick(sc,dt)};
  const pot=o.pot();sc.bet=clamp(Math.floor(Math.min((o.step?0:BJBET)||pot/4,pot)/ST_)*ST_,Math.min(ST_,pot),pot);if(sc.bet<ST_)sc.bet=pot;
  bjBetItems(sc);ui(sc);UI.sel=3;}
function bjFoot(sc){if(UI.input==='touch')return 'TAP A BUTTON';if(UI.input==='mouse')return 'CLICK A BUTTON';return (UI.input==='pad'?'◀▶ PICK  A OK':'◀▶ PICK  ENTER OK')+(sc.phase==='bet'||sc.phase==='done'?(UI.input==='pad'?'  B LEAVE':'  ESC LEAVE'):'');}
const bjK=v=>v>=1000?(v/1000)+'K':String(v);
function bjBetItems(sc){const o=sc.o,st=sc.step,pot=()=>o.pot(),top=()=>Math.floor(pot()/st)*st;
  sc.items=[{label:'-'+bjK(st),dis:()=>sc.bet<=st||pot()<st,act:()=>{sc.bet=sc.bet>top()?top():Math.max(st,sc.bet-st);sc.bump=sc.t;play('cash',.4,.8);}},
    {label:'+'+bjK(st),dis:()=>sc.bet+st>pot(),act:()=>{sc.bet=Math.min(top(),sc.bet+st);sc.bump=sc.t;play('cash',.4,1.2);}},
    {label:'ALL IN',col:C_R,act:()=>{sc.bet=pot();sc.bump=sc.t;play('cash',.7,.9);shake=Math.max(shake,.25);}},
    {label:'DEAL',col:C_G,act:()=>bjDeal(sc)},{label:sc.o.leaveLabel,act:()=>sc.o.leave()}];}
function bjDeal(sc){if(sc.bet<=0)return;BJBET=sc.bet;sc.phase='deal';sc.items=[];sc.p=[];sc.d=[];sc.res=null;sc.chipT=-9;if(sc.dk.length<20)sc.dk=bjDeck();
  sc.q=[['p',1],['d',1],['p',1],['d',0]];sc.qT=.15;play('push',.5,1.4);}
function bjCard(sc,who,up){const c=sc.dk.pop();c.t0=sc.t;c.up=up;c.flip=up?sc.t+.24:null;(who==='p'?sc.p:sc.d).push(c);play('pick',.45,1.1+rnd()*.3);return c;}
function bjTick(sc,dt){sc.t+=dt;sc.shown+=(sc.o.pot()-sc.shown)*Math.min(1,dt*6);if(Math.abs(sc.o.pot()-sc.shown)<1)sc.shown=sc.o.pot();
  if(sc.q.length){sc.qT-=dt;if(sc.qT<=0){const[w,up]=sc.q.shift();if(w==='flip'){const h=sc.d[1];h.up=1;h.flip=sc.t;play('menu',.5,.8);}else if(w==='end')bjEnd(sc);else bjCard(sc,w,up);sc.qT=w==='flip'?.5:.42;
      if(!sc.q.length&&sc.phase==='deal'){sc.phase='play';if(bjVal(sc.p)===21||bjVal(sc.d)===21){sc.q=[['flip'],['end']];sc.phase='dealer';}else{sc.items=[{label:'HIT',act:()=>bjHit(sc)},{label:'STAND',col:C_C,act:()=>bjStand(sc)}];UI.sel=0;}}
      else if(!sc.q.length&&sc.phase==='dealer'&&!sc.res){if(bjVal(sc.d)<17&&bjVal(sc.p)<=21)sc.q.push(['d',1]);else sc.q.push(['end']);}}}}
function bjHit(sc){if(sc.q.length)return;bjCard(sc,'p',1);const v=bjVal(sc.p);if(v>21){sc.items=[];sc.phase='dealer';sc.q=[['flip'],['end']];sc.qT=.5;}else if(v===21)bjStand(sc);}
function bjStand(sc){sc.items=[];sc.phase='dealer';sc.q=[['flip']];sc.qT=.3;}
function bjEnd(sc){const o=sc.o,pv=bjVal(sc.p),dv=bjVal(sc.d),bet=sc.bet,win=bet*((o.odds?o.odds():2)-1);let res,delta=0;
  if(pv>21){res='BUST';delta=-bet;}else if(dv>21){res='HOUSE BUSTS';delta=win;}else if(pv>dv){res=pv===21&&sc.p.length===2?'BLACKJACK':'YOU WIN';delta=win;}else if(pv<dv){res='HOUSE WINS';delta=-bet;}else res='PUSH';
  sc.res=res;sc.delta=delta;sc.resT=sc.t;sc.chipT=sc.t+.35;sc.chipTo=Math.sign(delta);sc.phase='done';o.apply(delta);
  if(delta>0){play('combo2',.8,1);play('cash',.8,1);borderFlash=res==='BLACKJACK'?.6:.35;borderFlashIdx=14;CRT.boom=Math.max(CRT.boom,.35);shake=.4;}
  else if(delta<0){play('empty',.8,.7);CRT.hit=.45;shake=.5;borderFlash=.25;borderFlashIdx=10;}else play('menu',.5);
  sc.items=o.single?[{label:o.nextLabel||'NEXT',col:C_G,act:o.next}]:[{label:'AGAIN',col:C_G,act:()=>{if(o.pot()<=0){o.broke();}sc.phase='bet';sc.p=[];sc.d=[];sc.res=null;const pot=o.pot();sc.bet=clamp(Math.min(sc.bet,pot),Math.min(sc.step,pot),pot);bjBetItems(sc);UI.sel=3;}},{label:o.leaveLabel,act:()=>o.leave()}];UI.sel=0;}
function bjFelt(){const d=S.d,W=S.w,H=S.h;for(let y=0;y<H-14;y++)for(let x=0;x<W;x++){const i=(y*W+x)*4,on=BAYER[(((y>>1)&3)<<2)|((x>>1)&3)]<.22;d[i]=0;d[i+1]=on?150:0;d[i+2]=0;}}
function bjDrawCard(c,x,y,w,h,t){let k=1,up=c.up;if(c.flip!=null){const f=(t-c.flip)/.16;if(f<0)up=0;else if(f<1){k=Math.abs(1-2*f);up=f>=.5?1:0;}}
  const cw=Math.max(2,Math.round(w*k)),cx=x+((w-cw)>>1);
  if(!up){const r=uImg('cardBack',cx,y,cw,h,'cover',.5);if(!r)uRect(cx,y,cw,h,C_DR);uBox(cx,y,cw,h,C_W);return;}
  uRect(cx,y,cw,h,C_W);uBox(cx,y,cw,h,C_K);if(cw<w-6)return;const ink=c.s===1||c.s===2?C_R:C_K;
  uText(c.r,x+3,y+3,ink);uText(SUITS[c.s],x+((w-12)>>1),y+((h-14)>>1)+2,ink,2);uTextR(c.r,x+w-3,y+h-10,ink);}
function bjHand(sc,h,y,cw,chh,dx,deck){const n=h.length,W=S.w,tot=cw+(n-1)*dx,x0=(W-tot)>>1;
  h.forEach((c,i)=>{const tx=x0+i*dx,a=ease((sc.t-c.t0)/.26);const x=deck[0]+(tx-deck[0])*a,yy=deck[1]+(y-deck[1])*a;uRect(x+2,yy+2,cw,chh,C_K);bjDrawCard(c,Math.round(x),Math.round(yy),cw,chh,sc.t);});}
function bjChips(x,y,amt,col,st=BJSTEP){const n=clamp(Math.ceil(amt/st),1,12);for(let k=0;k<n;k++){const yy=y-k*4;uRect(x-2,yy,22,6,C_K);uRect(x-1,yy,20,5,k%3===0?C_R:k%3===1?C_W:C_B);uRect(x+3,yy+1,3,2,k%3===1?C_R:C_W);uRect(x+12,yy+1,3,2,k%3===1?C_R:C_W);}}
function bjPaper(s,x,y,c,sc=1){const w=uTW(s,sc);uRect(x-3,y-3,w+6,7*sc+6,C_K);uText(s,x,y,c,sc);}
function bjBadge(x,y,v,c){const s=String(v),w=uTW(s,2)+8;uRect(x,y,w,18,C_K);uBox(x,y,w,18,c);uText(s,x+4,y+2,c,2);}
function bjDraw(sc){const W=S.w,H=S.h,m=M(),o=sc.o,t=sc.t;bjFelt();
  const cw=PORT?34:32,chh=PORT?48:44,dx=PORT?26:30,deck=[W-m-cw,PORT?44:20];
  {const tw=uTW(o.title,2);uRect(m-4,PORT?6:2,tw+10,22,C_K);uTextS(o.title,m,PORT?10:6,C_Y,2);}
  // printed on the felt
  const ly=PORT?150:84,od=o.odds?o.odds():2,l1='DEALER STANDS ON 17',l2='WINS PAY '+od+' TO 1';
  {const w=Math.max(uTW(l1),uTW(l2))+12,x=(W-w)>>1;uRect(x,ly-4,w,25,C_K);uBox(x,ly-4,w,25,[0,150,0]);uTextC(l1,ly,C_W);uTextC(l2,ly+10,od>2?C_Y:C_W);}
  for(let k=0;k<4;k++)bjDrawCard({up:0},deck[0]-k,deck[1]-k,cw,chh,t);
  const dy=PORT?80:30,py=PORT?190:116;
  bjHand(sc,sc.d,dy,cw,chh,dx,deck);bjHand(sc,sc.p,py,cw,chh,dx,deck);
  if(sc.d.length){const hole=sc.d[1]&&!sc.d[1].up;const v=hole?bjVal([sc.d[0]]):bjVal(sc.d);bjBadge(m,dy+12,hole?v+'?':v,C_W);bjPaper('HOUSE',m,dy+1,C_W);}
  if(sc.p.length){const v=bjVal(sc.p);bjBadge(m,py+12,v,v>21?C_R:v===21?C_Y:C_W);bjPaper('YOU',m,py+1,C_W);}
  // stake chips: sit in the middle, then slide to the winner
  const cxm=W-m-30,cym=PORT?276:156;let chx=cxm,chy=cym;
  if(sc.chipT>-9&&t>sc.chipT){const a=ease((t-sc.chipT)/.4);if(sc.chipTo>0){chx=cxm+(m+50-cxm)*a;chy=cym+(py+chh+14-cym)*a;}else if(sc.chipTo<0){chx=cxm+(deck[0]-cxm)*a;chy=cym+(deck[1]+10-cym)*a;}}
  if(!(sc.chipTo<0&&t>sc.chipT+.4)){bjChips(chx,chy,sc.bet,0,sc.step);if(sc.chipTo>0&&t>sc.chipT)bjChips(chx+18,chy,Math.max(sc.bet,sc.delta),0,sc.step);}
  const bump=sc.bump!=null?Math.max(0,1-(t-sc.bump)*6):0;const bs=money(sc.bet);{const w=Math.max(uTW('STAKE'),uTW(bs))+8,xr=cxm+19;uRect(xr-w,cym-48,w,24,C_K);uTextR('STAKE',cxm+16,cym-44,C_GR);uTextR(bs,cxm+16,cym-34-(bump>0?2:0),bump>0?C_W:C_Y);}
  // the pot or score, counting
  const lab=o.potLabel||(o.single?'SCORE':'POT'),py2=H-56-(PORT?10:0),ps=money(Math.round(sc.shown));uRect(m-3,py2-3,uTW(lab)+uTW(ps,2)+16,20,C_K);uText(lab,m,py2+4,C_GR);uText(ps,m+uTW(lab)+8,py2,C_C,2);
  if(sc.res&&t>sc.resT){const a=ease((t-sc.resT)/.22),s=PORT?2:3,col=sc.delta>0?C_Y:sc.delta<0?C_R:C_W,bh=Math.round((8*s+12)*a),by=(PORT?150:88)-(bh>>1);
    uRect(0,by,W,bh,C_K);if(a>.6){uTextS(sc.res,(W-uTW(sc.res,s))>>1,by+6,col,s,C_K);const sub=sc.delta?(sc.delta>0?'+':'-')+money(Math.abs(sc.delta)).replace(/^-/,''):'STAKE RETURNED';const sw=uTW(sub,2)+12;uRect((W-sw)>>1,by+bh,sw,20,C_K);uTextC(sub,by+bh+3,col,2);}}
  bjButtons(sc,m,H-34-(PORT?10:0),W-2*m);}
function bjButtons(sc,x,y,w){const items=sc.items||[];if(!items.length){if(sc.phase!=='done'){const dots='.'.repeat(1+((sc.t*3)|0)%3);uText(sc.phase==='dealer'?'HOUSE PLAYS'+dots:'DEALING'+dots,x,y+6,C_GR);}return;}
  const gap=4,bw=Math.floor((w-gap*(items.length-1))/items.length),bh=PORT?22:18;
  items.forEach((it,i)=>{const bx=x+i*(bw+gap),sel=i===UI.sel,dis=ev(it.dis);uRect(bx,y,bw,bh,sel?(dis?C_GR:C_Y):C_K);uBox(bx,y,bw,bh,dis?[80,80,80]:(ev(it.col)||C_W));
    const lab=ev(it.label);uText(lab,bx+((bw-uTW(lab))>>1),y+((bh-7)>>1),sel?C_K:dis?[90,90,90]:(ev(it.col)||C_W));UI.hits.push({x:bx,y,w:bw,h:bh,i});});}
function showBet(n,snap){const go=()=>playChapter(n+1,snap);if(P.score<BJSTEP)return go();
  bjTable({title:'THE BACK ROOM',leaveLabel:'WALK',single:1,nextLabel:'NEXT CHAPTER',leave:go,next:go,pot:()=>P.score,
    apply:delta=>{P.score+=delta;snap.score=P.score;SAVE.snap=snap;writeSave();if(delta>0){ST.bjWon=(ST.bjWon||0)+1;ach('doubledown');}else if(delta<0)ST.bjLost=(ST.bjLost||0)+1;ST.bjNet=(ST.bjNet||0)+delta;saveStats();}});}
function showBlackjack(){if(BJS.pot<=0)BJS.pot=50000;
  bjTable({title:'BLACKJACK',leaveLabel:'LEAVE',leave:()=>{saveBJS();showHustles();},pot:()=>BJS.pot,
    apply:delta=>{BJS.pot+=delta;BJS.hands++;BJS.best=Math.max(BJS.best,BJS.pot);saveBJS();},broke:()=>{BJS.pot=50000;saveBJS();toast('THE HOUSE FRONTS YOU $50,000',C_Y);}});}

