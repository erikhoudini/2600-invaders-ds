/* ---------- drug cache: gallery, cheats, credits ---------- */
function showCache(){ui({title:'DRUG CACHE',border:4,art:'pulp:cop',items:[
  {label:'ACHIEVEMENTS',val:ACH.filter(a=>ACHV[a[0]]).length+'/'+ACH.length,act:showAch},
  {label:'POSTCARD',val:kiloCount()+'/13',act:showPostcard},
  {label:'CUT SCENES',act:showCuts},{label:'STATISTICS',act:showStats},
  {label:'CHEATS',act:showCheats},{label:'CREDITS',act:()=>showCredits(showCache)}],back:showMenu});}
const kiloCount=()=>{let c=0;for(let n=1;n<=14;n++)if(n!==7&&KILOS[n])c++;return c;};
// chapter to postcard piece, so early chapters do not give the face away
const KPIECE=[13,10,7,12,4,9,11,6,2,8,5,1,3,0];
function showPostcard(){const sc={title:'POSTCARD',border:4,back:showCache,foot:()=>UI.input==='pad'?'B BACK':UI.input==='touch'?'◀ BACK TO RETURN':UI.input==='mouse'?'RIGHT CLICK BACK':'ESC BACK',
    draw:()=>{const W=S.w,H=S.h,m=M();let ix,iy,tx,ty,tw;
      if(PORT){ix=(W-176)>>1;iy=header(sc)+2;tx=m;ty=iy+224;tw=W-2*m;}else{ix=8;iy=8;tx=196;uTextS('POSTCARD',tx,8,C_Y,2);ty=30;tw=W-tx-m;}
      uRect(ix-3,iy-3,182,222,C_W);uRect(ix-2,iy-2,180,220,C_K);
      const r=uImg('olive',ix,iy,176,216,'native');if(!r)uRect(ix,iy,176,216,C_K);
      const pw=88,ph=[31,31,31,31,31,31,30];let have=0;
      for(let p=0;p<14;p++){const n=KPIECE.indexOf(p)+1,got=n===7||!!KILOS[n];if(got){have++;continue;}const cx=ix+(p%2)*pw,row=(p/2)|0,cy=iy+row*31,h=ph[row];
        uRect(cx,cy,pw,h,C_DR);for(let yy=1;yy<h-1;yy+=4)for(let xx=1+((yy>>2)&1)*2;xx<pw-1;xx+=4)uRect(cx+xx,cy+yy,2,2,[150,0,0]);uBox(cx,cy,pw,h,C_K);
        const lab='CH '+n;uRect(cx+((pw-uTW(lab))>>1)-3,cy+((h-7)>>1)-2,uTW(lab)+6,11,C_K);uText(lab,cx+((pw-uTW(lab))>>1),cy+((h-7)>>1),C_GR);}
      const cols=Math.floor(tw/7);let y=ty;const line=(s,c)=>{for(const l of wrap(s,cols)){uText(l,tx,y,c);y+=10;}y+=4;};
      line('PIECES '+(have-1)+' OF 13',have>=14?C_G:C_Y);}};
  ui(sc);}
function showCuts(){const best=Math.max(SAVE.best||1,SAVE.ch||1);const open=k=>k==='intro'||SEEN[k]||(k==='end'?UNL.won:+k<=best);
  const list=[['intro','OPENING']].concat(CH.map((c,i)=>[String(i+1),(i+1)+'. '+c.t]),[['end','ENDING']]);
  ui({title:'CUT SCENES',border:4,art:()=>{const k=list[UI.sel][0];return open(k)?'comic:'+k:null;},artMode:'cover',
    items:list.map(([k,t])=>open(k)?{label:t,act:()=>{const n=+k;comicStart(k,showCuts,n?['LOCATION: '+CH[n-1].t,CH[n-1].why]:null);}}:{label:t.replace(/^(\d+\. ).*/,'$1')+'??????',dis:'NOT YET.'}),back:showCache});}
function showStats(){saveStats();const n=v=>Math.round(v||0).toLocaleString('en-US');const kw=ST.kw||{};
  const rounds=ST.pistol+ST.shells+ST.tommy+ST.rifle,acc=ST.shots?Math.round(ST.hits/ST.shots*100)+'%':'-';
  const hrs=Math.floor(ST.time/3600),mins=Math.floor(ST.time%3600/60),secs=Math.floor(ST.time%60);const played=hrs?hrs+'H '+mins+'M':mins+'M '+String(secs).padStart(2,'0')+'S';
  const sec=(h,rows)=>[{h},...rows.map(r=>({kv:r}))];
  ui({title:'STATISTICS',border:4,back:showCache,doc:[
    ...sec('BODY COUNT',[['KILLS',n(ST.kills)],['HEADSHOTS',n(ST.head)],['BLOWN APART',n(ST.gib)],['DOGS',n(ST.dogs)],['BOSSES',n(ST.bosses)],['CARS WRECKED',n(ST.cars)],['WITH FISTS',n(ST.punch)],['FLAMETHROWERS',n(ST.torch)],['BERSERK DASHES',n(ST.dashes)],['AMBUSHES SPRUNG',n(ST.ambush)],['BEST CHAIN',n(ST.chain)],['OVERKILLS',n(ST.overkill)],['MASSACRES',n(ST.massacre)]]),
    ...sec('ROUNDS SPENT',[['.38 ROUNDS',n(ST.pistol)],['SHELLS',n(ST.shells)],['AK ROUNDS',n(ST.tommy)],['RIFLE ROUNDS',n(ST.rifle)],['TOTAL',n(rounds)],['ACCURACY',acc],['DYNAMITE THROWN',n(ST.dyn)],['FUEL DRUMS BLOWN',n(ST.booms)]]),
    ...sec('PICKED UP',[['BERSERK',n(ST.berserk)],['SLO-MO',n(ST.deadeye)],['FLAMER',n(ST.flamer)],['SLO-MO FROM CHAINS',n(ST.chainEye)],['ARMOR VESTS',n(ST.vest)],['HEAVY ARMOR',n(ST.kevlar)],['FIRST AID',n(ST.medkit)],['WHISKEY',n(ST.whiskey)],['AMMO',n(ST.ammo)],['CASH','$'+n(ST.cash)],['KILOS',n(ST.kilos)],['KEYS',n(ST.keys)],['SECRETS',n(ST.secrets)]]),
    ...sec('KILLS BY WEAPON',[['FISTS',n(kw.fists)],['.38',n(kw.pistol)],['PUMP',n(kw.shotgun)],['AK',n(kw.ak)],['DYNAMITE',n(kw.dyn)],['FLAMER',n(kw.flame)],['EXPLOSIONS',n(kw.boom)],['EACH OTHER',n(ST.infight)]]),
    ...sec('ODDS AND ENDS',[['JACKPOTS',n(ST.jackpots)],['SPIRALS',spiralCount()+' OF '+SPIRAL_ALL],['CARS BURNED',n(ST.carsBlown)],['FALLS',n(ST.falls)],['HANDS WON',n(ST.bjWon)],['HANDS LOST',n(ST.bjLost)],['BACK ROOM NET',money(ST.bjNet||0)],['ARENA BEST WAVES',n(ST.arenaBest)],['SPENT IN THE SHOP','$'+n(ST.shop)],['POSTCARD PIECES',kiloCount()+' OF 14'],['MODIFIED RUNS',n(ST.modRuns)],['BEST MODIFIED',money(ST.modBest||0)]]),
    ...sec('SALAMANDER',[['DAMAGE TAKEN',n(ST.hurt)],['DEATHS',n(ST.deaths)],['CHAPTERS CLEARED',n(ST.chapters)],['FULL RUNS',n(ST.runs)],['TIME PLAYED',played]])]});}
