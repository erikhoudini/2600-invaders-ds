/* ---------- thumbnails ---------- */
const TH=new Map();
function wallThumb(t,z){const key='w'+t+'_'+z;let c=TH.get(key);if(c)return c;const d=new Uint8ClampedArray(z*z*4),wd=WALLS.d,ww=WALLS.w;
  for(let y=0;y<z;y++)for(let x=0;x<z;x++){const sx=t*128+Math.min(127,Math.floor((x+.5)*128/z)),sy=Math.min(127,Math.floor((y+.5)*128/z)),si=(sy*ww+sx)*4,o=(y*z+x)*4;d[o]=wd[si];d[o+1]=wd[si+1];d[o+2]=wd[si+2];d[o+3]=255;}
  c={w:z,h:z,d};TH.set(key,c);return c;}
function floorData(f){return(f.fi>0?tintFloor(f.fl,f.fi):FLO[f.fl]);}
function floorThumb(f,z){const key='f'+f.fl+'/'+f.fi+'_'+z;let c=TH.get(key);if(c)return c;const S0=floorData(f),d=new Uint8ClampedArray(z*z*4);
  for(let y=0;y<z;y++)for(let x=0;x<z;x++){const sx=Math.min(63,Math.floor((x+.5)*64/z)),sy=Math.min(63,Math.floor((y+.5)*64/z)),si=(sy*S0.w+sx)*4,o=(y*z+x)*4;d[o]=S0.d[si];d[o+1]=S0.d[si+1];d[o+2]=S0.d[si+2];d[o+3]=255;}
  c={w:z,h:z,d};TH.set(key,c);return c;}
// a sprite cell cropped to what is drawn in it, then fitted into a square
function spriteThumb(key,src,sx,sy,sw,sh,z){const k2=key+'_'+z;let c=TH.get(k2);if(c)return c;const sd=src.d,W0=src.w;let x0=sw,y0=sh,x1=-1,y1=-1;
  for(let y=0;y<sh;y++)for(let x=0;x<sw;x++)if(sd[((sy+y)*W0+sx+x)*4+3]>110){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;}
  const d=new Uint8ClampedArray(z*z*4);if(x1<0){c={w:z,h:z,d};TH.set(k2,c);return c;}
  const bw=x1-x0+1,bh=y1-y0+1,s=Math.min(z/bw,z/bh),dw=Math.max(1,Math.round(bw*s)),dh=Math.max(1,Math.round(bh*s)),ox=(z-dw)>>1,oy=z-dh;
  for(let y=0;y<dh;y++)for(let x=0;x<dw;x++){const ux=sx+x0+Math.min(bw-1,Math.floor((x+.5)/s)),uy=sy+y0+Math.min(bh-1,Math.floor((y+.5)/s)),si=(uy*W0+ux)*4,o=((oy+y)*z+ox+x)*4;
    if(sd[si+3]<110)continue;d[o]=sd[si];d[o+1]=sd[si+1];d[o+2]=sd[si+2];d[o+3]=255;}
  c={w:z,h:z,d};TH.set(k2,c);return c;}
function thingThumb(t,k,z){if(t==='enemy'){if(k==='dog')return spriteThumb('e'+k,DOG,0,64,64,64,z);return spriteThumb('e'+k,SHEET[k],0,0,64,64,z);}
  if(k.startsWith('TREE'))return spriteThumb('t'+k,TREES,(+k.slice(4))*64,0,64,128,z);
  const f=A.decoNames.indexOf(k);return spriteThumb('d'+k,DECO,Math.max(0,f)*64,0,64,64,z);}
// draw a thumbnail, optionally clipped to a rectangle and dimmed
function eBlit(th,x,y,clip,k=1){const d=S.d,W=S.w;const cx0=clip?clip.x:0,cy0=clip?clip.y:0,cx1=clip?clip.x+clip.w:W,cy1=clip?clip.y+clip.h:S.h;
  for(let yy=0;yy<th.h;yy++){const py=y+yy;if(py<cy0||py>=cy1)continue;for(let xx=0;xx<th.w;xx++){const px=x+xx;if(px<cx0||px>=cx1)continue;const si=(yy*th.w+xx)*4;if(th.d[si+3]<110)continue;const i=(py*W+px)*4;d[i]=th.d[si]*k;d[i+1]=th.d[si+1]*k;d[i+2]=th.d[si+2]*k;}}}
function eRect(x,y,w,h,c,clip){if(clip){const x0=Math.max(x,clip.x),y0=Math.max(y,clip.y),x1=Math.min(x+w,clip.x+clip.w),y1=Math.min(y+h,clip.y+clip.h);if(x1<=x0||y1<=y0)return;uRect(x0,y0,x1-x0,y1-y0,c);}else uRect(x,y,w,h,c);}
function eBox(x,y,w,h,c,clip){eRect(x,y,w,1,c,clip);eRect(x,y+h-1,w,1,c,clip);eRect(x,y,1,h,c,clip);eRect(x+w-1,y,1,h,c,clip);}
function eDash(x,y,w,h,c,clip,ph=0){for(let k=0;k<w;k++)if(((k+ph)>>1)&1){eRect(x+k,y,1,1,c,clip);eRect(x+k,y+h-1,1,1,c,clip);}for(let k=0;k<h;k++)if(((k+ph)>>1)&1){eRect(x,y+k,1,1,c,clip);eRect(x+w-1,y+k,1,1,c,clip);}}
function eLine(x0,y0,x1,y1,c,clip){const n=Math.max(1,Math.ceil(Math.max(Math.abs(x1-x0),Math.abs(y1-y0))));for(let k=0;k<=n;k++)eRect(Math.round(x0+(x1-x0)*k/n),Math.round(y0+(y1-y0)*k/n),1,1,c,clip);}

