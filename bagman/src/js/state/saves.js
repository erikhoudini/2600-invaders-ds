function loadSave(){try{const s=JSON.parse(localStorage.getItem('bagman11.save')||'null');if(s&&s.ch)SAVE=s;}catch(e){}}
function writeSave(){try{localStorage.setItem('bagman11.save',JSON.stringify(SAVE));}catch(e){}}
const snapOf=()=>({hp:Math.max(P.hp,60),armor:P.armor,acls:P.acls,b:P.b,s:P.s,d:P.d||0,has:P.has.slice(0,5),w:P.w,score:P.score});
function applySnap(s){P.hp=s.hp;P.armor=s.armor||0;P.acls=s.acls||(P.armor>100?.5:.33);P.b=s.b;P.s=s.s;P.d=s.d||0;P.has=s.has.slice(0,5);while(P.has.length<5)P.has.push(0);P.w=Math.min(4,s.w||1);P.score=s.score||0;}
const freshSnap=()=>({hp:100,armor:0,acls:.33,b:30,s:0,d:0,has:[1,1,0,0,0],w:1,score:0});
function chapterSnap(i){const s=freshSnap();if(i>=3){s.has[2]=1;s.s=16;}if(i>=5){s.has[3]=1;s.b=150;s.w=3;s.has[4]=1;s.d=6;}return s;}
const cheat={tar:0,fent:0};try{Object.assign(cheat,JSON.parse(localStorage.getItem('bagman.cheat')||'{}'));}catch(e){}
const cheating=()=>cheat.tar||cheat.fent;
