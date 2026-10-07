function hurtPlayer(dmg,fromAng,boom){if(state!=='play'||P.dead)return;if(cheat.fent){P.hurt=.1;return;}if(L)L.dmg=(L.dmg||0)+dmg;
  if(P.armor>0){const ab=Math.min(P.armor,Math.round(dmg*(P.acls||.33)));P.armor-=ab;dmg-=ab;}
  P.hp-=dmg;ST.hurt+=Math.max(0,dmg);P.hurt=.3;borderFlash=.2;borderFlashIdx=10;SFX.hurt();shake=Math.max(shake,.35);CRT.hit=Math.max(CRT.hit,clamp(dmg/18,.25,1));
  if(fromAng!==undefined){P.hurtSide=Math.sign(angDiff(P.a,fromAng))||1;P.hurtDir=.5;}
  if(P.hp<=0){P.hp=0;P.dead=1;ST.deaths++;saveStats();state='dying';deathT=0;P.lock=null;SFX.pdie();CRT.hit=1;}}
let deathT=0;

