const PICKNAME={CASH:'CASH',ROLL:'ROLL',BAGGIE:'BAGGIE',PILLS:'PILLS',CHAIN:'GOLD CHAIN',PACKAGE:'PACKAGE'};
function pickup(k){const cap=(v,m)=>Math.min(m,v);
  if(SCOREV[k]){const v=SCOREV[k];P.score+=v;L.cash++;if(k==='PILLS'){if(RULES.pills)hurtPlayer(5);else if(P.hp<P.maxHp)P.hp=Math.min(P.maxHp,P.hp+5);}ST.cash+=v;if(k==='KILO')ST.kilos++;if(k==='KILO'){L.kilo=true;feed('ONE OF YOUR KILOS +$'+v,C_Y);SFX.key();}else{feed('+$'+v+' '+PICKNAME[k],C_C);SFX.cash();}return true;}
  switch(k){
    case'FULLHP':if(P.hp>=P.maxHp)return false;P.hp=P.maxHp;bigMsg('FULL HEALTH',1.6,C_R);ST.medkit++;SFX.medkit();break;
    case'MEDKIT':if(P.hp>=P.maxHp)return false;P.hp=cap(P.hp+25,P.maxHp);feed('FIRST AID +25',C_G);ST.medkit++;SFX.medkit();break;
    case'BOTTLE':if(P.hp>=P.maxHp)return false;P.hp=cap(P.hp+10,P.maxHp);feed('WHISKEY +10',C_G);ST.whiskey++;SFX.gulp();break;
    case'CLIP':if(P.b>=300)return false;P.b=cap(P.b+10,300);feed('ROUNDS +10');ST.ammo++;SFX.pick();break;
    case'DRUM':if(P.b>=300)return false;P.b=cap(P.b+50,300);feed('ROUNDS +50');ST.ammo++;SFX.pick();break;
    case'BOX':if(P.b>=300&&P.s>=sMax())return false;P.b=cap(P.b+25,300);P.s=cap(P.s+(P.has[2]?5:0),sMax());feed('AMMO CRATE');ST.ammo++;SFX.pick();break;
    case'SHELLS':if(P.s>=sMax())return false;P.s=cap(P.s+8,sMax());feed('SHELLS +8');ST.ammo++;SFX.pick();break;
    case'KEYY':P.keys.Y=1;triggerAmbush('KEYY');feed('YELLOW KEY',C_Y);ST.keys++;SFX.key();break;
    case'KEYR':P.keys.R=1;triggerAmbush('KEYR');feed('RED KEY',C_R);ST.keys++;SFX.key();break;
    case'GUNSHOT':P.has[2]=1;P.s=cap(P.s+10,sMax());bigMsg('PUMP 12',1.5);SFX.weapon();selectW(2);break;
    case'BERSERK':P.hp=Math.min(P.maxHp||100,P.hp+50);if(P.berserk<=0)P.preBerserkW=P.w;P.berserk=Math.max(0,P.berserk)+POWER.BERSERK.time;P.w=0;P.switchT=0;P.pendingW=-1;bigMsg('BERSERK',2,C_R);ST.berserk++;SFX.power();CRT.boom=.6;shake=.8;break;
    case'FLAMER':if(!(P.flame>0))P.preFlameW=P.w===5?1:P.w;P.flame=Math.max(0,P.flame||0)+POWER.FLAMER.time;P.w=5;P.switchT=0;P.pendingW=-1;bigMsg('FLAMER',2,C_Y);ST.flamer=(ST.flamer||0)+1;SFX.power();CRT.boom=.4;break;
    case'DEADEYE':P.slow=Math.max(0,P.slow)+POWER.DEADEYE.time;bigMsg('SLO-MO',2,C_C);ST.deadeye++;SFX.power();CRT.boom=.4;break;
    case'KEVLAR':if(P.armor>=200)return false;P.armor=200;P.acls=.5;bigMsg('HEAVY ARMOR',1.6,C_B);ST.kevlar++;SFX.power();break;
    case'VEST':if(P.armor>=100)return false;P.armor=100;P.acls=.33;feed('ARMOR VEST',C_G);ST.vest++;SFX.power();break;
    case'PLATE':if(P.armor>=200)return false;if(!P.armor)P.acls=.33;P.armor=Math.min(200,P.armor+5);feed('HELMET +5 ARMOR',C_G);ST.plate++;SFX.pick();break;
    case'TOMMYGUN':P.has[3]=1;P.b=cap(P.b+50,300);bigMsg('AK-47',1.8);SFX.weapon();selectW(3);break;
    case'DYNAMITE':{const first=!P.has[4];if(!first&&P.d>=20)return false;P.has[4]=1;P.d=cap((P.d||0)+4,20);if(first){bigMsg('DYNAMITE',1.8,C_R);selectW(4);}else feed('DYNAMITE +4',C_R);SFX.weapon();break;}
  }
  return true;}

