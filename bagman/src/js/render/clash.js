/* =====================================================================
   2. FRAMEBUFFER AND SPECTRUM ATTRIBUTE CLASH
   Each 8x8 cell keeps one hue plus black (or two hues when both are strong).
   Shading inside a cell is a contrast-stretched Bayer pattern at 2px, so flat
   areas stay solid and only the midtones break into chunky dots.
   ===================================================================== */
const fb=document.createElement('canvas');fb.width=SW;fb.height=SH;const fctx=fb.getContext('2d');
const img=fctx.createImageData(SW,SH),D=img.data;for(let i=3;i<D.length;i+=4)D[i]=255;
const zbuf=new Float32Array(SW),ZB=new Float32Array(SW*VH);
const ZX=[[0,0,0],[0,0,215],[215,0,0],[215,0,215],[0,215,0],[0,215,215],[215,215,0],[215,215,215],
          [0,0,0],[0,0,255],[255,0,0],[255,0,255],[0,255,0],[0,255,255],[255,255,0],[255,255,255]];
const ZXC=ZX.map(c=>`rgb(${c[0]},${c[1]},${c[2]})`);
const C_W=ZX[15],C_Y=ZX[14],C_R=ZX[10],C_C=ZX[13],C_G=ZX[12],C_B=ZX[9],C_K=ZX[0],C_DR=ZX[2],C_GR=ZX[7];
const LUT=new Uint8Array(32768);
for(let r=0;r<32;r++)for(let g=0;g<32;g++)for(let b=0;b<32;b++){
  const R=r*8+4,G=g*8+4,B=b*8+4,mx=Math.max(R,G,B),mn=Math.min(R,G,B);let ink;
  if(mx<28)ink=0;
  else{const sat=(mx-mn)/mx;
    if(sat<.3)ink=7;
    else{const d=mx-mn;let h=mx===R?60*(((G-B)/d)%6):mx===G?60*((B-R)/d+2):60*((R-G)/d+4);if(h<0)h+=360;
      ink=(h<14||h>=290)?2:h<75?6:h<165?4:h<200?5:1;}}
  LUT[(r<<10)|(g<<5)|b]=ink|(ink&&mx>=236?8:0);
}
const BAYER=new Float32Array([0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5].map(v=>(v+.5)/16));
// Per-pixel Spectrum mapping. Hue comes from the LUT; brightness is dithered on a fixed 2px Bayer grid between
// black, normal and bright ink, so the picture keeps its grain without flickering cell edges. Weakly coloured
// pixels take on the dominant hue of their 8x8 cell, which keeps a little attribute bleed.
const SAT=new Uint8Array(32768);
for(let r=0;r<32;r++)for(let g=0;g<32;g++)for(let b=0;b<32;b++){const R=r*8+4,G=g*8+4,B=b*8+4,mx=Math.max(R,G,B),mn=Math.min(R,G,B);SAT[(r<<10)|(g<<5)|b]=mx?Math.round((mx-mn)/mx*255):0;}
const cnt=new Int32Array(8);
// The intro keeps the old 8x8 attribute clash: two inks per cell, hard Bayer dither between them
const lum=c=>c[0]*3+c[1]*4+c[2]*2;
function clashCell(){
  for(let cy=0;cy<VH;cy+=8)for(let cx=0;cx<SW;cx+=8){
    cnt.fill(0);let br=0,nb=0;
    for(let y=cy;y<cy+8;y++){let i=(y*SW+cx)*4;for(let x=0;x<8;x++,i+=4){
      const q=LUT[((D[i]>>3)<<10)|((D[i+1]>>3)<<5)|(D[i+2]>>3)];const c=q&7;cnt[c]++;if(c){nb++;if(q>7)br++;}}}
    let c1=0,b1=0;for(let c=1;c<8;c++)if(cnt[c]>b1){b1=cnt[c];c1=c;}
    if(!b1){for(let y=cy;y<cy+8;y++){let i=(y*SW+cx)*4;for(let x=0;x<8;x++,i+=4)D[i]=D[i+1]=D[i+2]=0;}continue;}
    let c2=0,b2=0;for(let c=1;c<8;c++)if(c!==c1&&cnt[c]>b2){b2=cnt[c];c2=c;}
    if(b2<26)c2=0;
    const o=(br*2>nb)?8:0;let P1=ZX[c2+o],P2=ZX[c1+o];if(lum(P1)>lum(P2)){const t=P1;P1=P2;P2=t;}
    const ar=P1[0],ag=P1[1],ab=P1[2],dr=P2[0]-ar,dg=P2[1]-ag,db=P2[2]-ab,den=1/(dr*dr+dg*dg+db*db||1);
    for(let y=cy;y<cy+8;y++){let i=(y*SW+cx)*4;const row=((y>>1)&3)<<2;for(let x=0;x<8;x++,i+=4){
      let t=((D[i]-ar)*dr+(D[i+1]-ag)*dg+(D[i+2]-ab)*db)*den;t=(t-.5)*1.45+.5;
      if(t>BAYER[row|((x>>1)&3)]){D[i]=P2[0];D[i+1]=P2[1];D[i+2]=P2[2];}else{D[i]=ar;D[i+1]=ag;D[i+2]=ab;}}}
  }
}
// GRT marks pixels that keep the full hard dither (the gun in your hand, the pulp art); everything else gets a solid band in the mid-tones
const GRT=new Uint8Array(SW*SH);
function clash(){
  for(let cy=0;cy<VH;cy+=8)for(let cx=0;cx<SW;cx+=8){
    cnt.fill(0);
    for(let y=cy;y<cy+8;y++){let i=(y*SW+cx)*4;for(let x=0;x<8;x++,i+=4){const k=((D[i]>>3)<<10)|((D[i+1]>>3)<<5)|(D[i+2]>>3);const c=LUT[k]&7;if(c&&c!==7&&SAT[k]>110)cnt[c]++;}}
    let dom=0,bd=6;for(let c=1;c<7;c++)if(cnt[c]>bd){bd=cnt[c];dom=c;}
    for(let y=cy;y<cy+8;y++){let i=(y*SW+cx)*4;const row=((y>>1)&3)<<2;for(let x=0;x<8;x++,i+=4){
      const r=D[i],g=D[i+1],b=D[i+2],k=((r>>3)<<10)|((g>>3)<<5)|(b>>3);let c=LUT[k]&7;
      if(dom&&c!==dom&&c!==0&&SAT[k]<150&&SAT[k]>40)c=dom;
      const v=r>g?(r>b?r:b):(g>b?g:b);const th=BAYER[row|((x>>1)&3)];let out;
      if(c===0)out=ZX[0];
      else if(GRT[i>>2]){if(v<215){let t=v/215;t=(t-.5)*1.3+.5;out=t>th?ZX[c]:ZX[0];}else out=((v-215)/40)>th?ZX[c+8]:ZX[c];}
      else if(v<26)out=ZX[0];
      else if(v<150)out=((v-26)/124)>th?ZX[c]:ZX[0];
      else if(v<196)out=ZX[c];
      else out=((v-196)/54)>th?ZX[c+8]:ZX[c];
      D[i]=out[0];D[i+1]=out[1];D[i+2]=out[2];}}
  }
}

