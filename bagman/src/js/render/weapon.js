function renderWeapon(){GRT.fill(0);if(L.sniper&&P.zoom)return;const W0=L.sniper?{k:'wSniper',seq:[1,2]}:WEAP[P.w],T=WPN[W0.k];let fi=0;if(P.anim)fi=W0.seq[P.anim.i]||0;else if(P.w===4&&!P.d)fi=2;else if(P.w===5)fi=((tm*14)|0)&1;
  const amp=(P.sprinting?5:3)*(OPT.sway?1:0),spd=P.sprinting?11:9;const bob=P.moving?Math.sin(P.walk*spd)*amp:0,bobY=P.moving?Math.abs(Math.cos(P.walk*spd))*amp:0;
  let drop=0;if(P.switchT>0)drop=(P.switchT>.14?(.28-P.switchT):P.switchT)/.14*70;
  const S=W0.k==='wFlame'?1:1.25,ox=Math.round((S===1?T.x:T.x*S)+bob+(P.dash?-20:0)),oy=Math.round((S===1?T.y:VH-(160-T.y)*S)+bobY+drop+P.recoil*.5+(P.dead?deathT*120:0)+(P.dash?-12:0));const sd=T.d,sw=T.w;const k=Math.min(1.6,1.25*light);
  const rage=P.berserk>0&&P.w===0;const dw=Math.round(T.fw*S),dh=Math.round(T.fh*S);
  for(let yy=0;yy<dh;yy++){const y=oy+yy;if(y<0||y>=VH)continue;const v=Math.min(T.fh-1,(yy/S)|0);for(let xx=0;xx<dw;xx++){const x=ox+xx;if(x<0||x>=SW)continue;const u=Math.min(T.fw-1,(xx/S)|0);const si=(v*sw+fi*T.fw+u)*4;if(sd[si+3]<110)continue;GRT[y*SW+x]=1;const di=(y*SW+x)*4;
    if(rage){D[di]=Math.min(255,sd[si]*1.6);D[di+1]=sd[si+1]*.4;D[di+2]=sd[si+2]*.3;}else{D[di]=Math.min(255,sd[si]*k);D[di+1]=Math.min(255,sd[si+1]*k);D[di+2]=Math.min(255,sd[si+2]*k);}}}}
