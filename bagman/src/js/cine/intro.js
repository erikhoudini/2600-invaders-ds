let intro=null;
function introStart(short,done){intro={t:0,short:!!short,done:done||null,drips:[]};state='intro';setMode('cine');}
function introDraw(dt){const I=intro;I.t+=dt;const t=I.t;
  D.fill(0,0,SW*VH*4);for(let i=3;i<SW*VH*4;i+=4)D[i]=255;
  const mx=30,my=30,mw=260,mh=140,ly=104,lx0=70,lx1=250;
  // timeline: full intro chops a pile into a line first; the short cut starts with the line laid out
  const chop=I.short?2.2:t,billT=I.short?(t-.25)/1.0:(t-2.4)/1.2,flashAt=I.short?1.35:3.9,endAt=I.short?1.9:7.2;
  const fade=I.short?1:Math.min(1,t/.8);
  for(let y=my;y<my+mh;y++)for(let x=mx;x<mx+mw;x++){const i=(y*SW+x)*4;const g=hash2(x>>2,y>>2)*.25+.55+((x+y*2)%80<5?.25:0);D[i]=40*g*fade;D[i+1]=170*g*fade;D[i+2]=190*g*fade;}
  rect(mx-4,my-4,mw+8,4,[150,150,160]);rect(mx-4,my+mh,mw+8,4,[150,150,160]);rect(mx-4,my,4,mh,[150,150,160]);rect(mx+mw,my,4,mh,[150,150,160]);
  const k=clamp(billT,0,1);
  // the powder is drawn again after the palette pass so it stays pure white instead of taking the mirror's ink
  const powder=v=>{if(chop<1.2){const r=12;for(let y=-r;y<=r;y++)for(let x=-r*1.6;x<=r*1.6;x++){if((x*x)/(r*r*2.6)+(y*y)/(r*r)>1)continue;const i=(((ly+y*.5)|0)*SW+((CX+x)|0))*4;D[i]=v[0];D[i+1]=v[1];D[i+2]=v[2];}}
    else{const grow=Math.min(1,(chop-1.2)/1);const a=CX-(CX-lx0)*grow,b=CX+(lx1-CX)*grow;const gone=b-k*(lx1-lx0);
      for(let x=a|0;x<b;x++){if(x>=gone)continue;for(let y=-2;y<=2;y++){if(hash2(x,y+5)<.15&&Math.abs(y)===2)continue;const i=((ly+y)*SW+x)*4;D[i]=v[0];D[i+1]=v[1];D[i+2]=v[2];}}}};
  powder([240,240,240]);
  if(chop>=1.2){const grow=Math.min(1,(chop-1.2)/1);
    if(!I.short&&chop<2.3){const bx=(CX+Math.sin(t*9)*50*(1-grow*.5))|0;rect(bx-2,ly-22,5,36,[200,200,210]);rect(bx-2,ly-22,5,5,[120,120,130]);}}
  if(billT>0&&billT<1.25){if(!I.snd){I.snd=1;SFX.snort(1.3);setTimeout(()=>SFX.snort(1.7),I.short?250:350);}
    const bx=lx1-k*(lx1-lx0),by=ly-1;
    for(let i=0;i<86;i++){const x=(bx+i*1.2)|0,y=(by-i*.55)|0;for(let w=-5;w<=5;w++){const yy=y+w;if(x<0||x>=SW||yy<0||yy>=VH)continue;const j=(yy*SW+x)*4;const edge=Math.abs(w)>=4;D[j]=edge?20:60;D[j+1]=edge?80:150;D[j+2]=edge?20:70;}}
    rect(bx-2,by-3,5,7,[10,30,10]);}
  if(t>=flashAt&&!I.hit){I.hit=1;CRT.boom=1;CRT.hit=.8;shake=1.4;borderFlash=.5;borderFlashIdx=15;SFX.bigboom();}
  if(t>flashAt+.2&&t<flashAt+1.2&&I.drips.length<(I.short?2:5)&&rnd()<dt*5){I.drips.push({x:mx+40+rnd()*(mw-80),y:my+12+rnd()*(mh-24),r:0});SFX.drip();}
  for(const d of I.drips){d.r=Math.min(7,d.r+dt*22);for(let y=-d.r;y<=d.r;y++)for(let x=-d.r;x<=d.r;x++)if(x*x+y*y<=d.r*d.r){const i=(((d.y+y)|0)*SW+((d.x+x)|0))*4;if(i>=0&&i<VH*SW*4){D[i]=210;D[i+1]=0;D[i+2]=0;}}}
  if(t>=flashAt&&t<flashAt+.18&&OPT.flash)D.fill(255,0,SW*VH*4);
  const slam=!I.short&&t>5.2;
  if(slam){D.fill(0,0,SW*VH*4);for(let i=3;i<SW*VH*4;i+=4)D[i]=255;const pp=PULP.hero;const h=Math.min(VH-10,pp.h),w=Math.round(h*pp.w/pp.h);const ox=12,oy=(VH-h)/2|0;
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){const sx=(x/w*pp.w)|0,sy=(y/h*pp.h)|0;const si=(sy*pp.w+sx)*4,di=((oy+y)*SW+ox+x)*4;D[di]=pp.d[si];D[di+1]=pp.d[si+1];D[di+2]=pp.d[si+2];}
    if(!I.slam){I.slam=1;CRT.boom=.9;shake=1;SFX.bigboom();}}
  clashCell();
  if(!slam&&!(t>=flashAt&&t<flashAt+.18))powder(ZX[15]);
  if(slam){const c=((t*8)|0)&1?C_Y:C_R;const tk=clamp((t-5.2)/.25,0,1);text('BAGMAN',SW-136,70-((1-tk)*40)|0,c,3);text('SOMEWHERE IN',SW-134,112,C_C);text('NEVADA',SW-134,124,C_C);}
  if(I.short&&L){textC(L.custom?L.arenaName:CH[L.n-1].t,VH-26,C_Y,2,C_K);}
  if(!I.short&&t>1&&t<5.2)textC(UI.input==='touch'?'TAP TO SKIP':UI.input==='pad'?'PRESS A TO SKIP':'PRESS ANY KEY TO SKIP',VH-12,C_GR);
  rect(0,VH,SW,SH-VH,C_K);
  if(t>endAt)introEnd();}
function introEnd(){const I=intro;intro=null;if(I&&I.done)I.done();else showMenu();}

