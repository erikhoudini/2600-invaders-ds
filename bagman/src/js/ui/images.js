/* ---------- pictures: scaled once, re-dithered to the palette, cached ---------- */
const IMG={},IMGC=new Map();
function comicArt(key){const pg=(COMICS[key]||[])[0]||[];const sl=pg[pg.length-1];return sl?sl.i:null;}
function imgOf(k){if(!k)return null;if(k.startsWith('pulp:'))return PULP[k.slice(5)]||null;const v=IMG[k];if(v)return v;
  if(v===undefined){IMG[k]=null;const src=k==='houdini'?A.houdini:k==='olive'?A.olive:k.startsWith('photo:')?A.photos[k.slice(6)]:k.startsWith('card:')?A.cards[+k.slice(5)]:k==='cardBack'?A.cardBack:k.startsWith('comic:')?comicArt(k.slice(6)):null;
    if(src)loadImg(src).then(im=>{IMG[k]=pix(im);}).catch(()=>{});}
  return null;}
function zxDither(d,i,x,y){const r=d[i],g=d[i+1],b=d[i+2],k=((r>>3)<<10)|((g>>3)<<5)|(b>>3),c=LUT[k]&7,v=r>g?(r>b?r:b):(g>b?g:b),th=BAYER[(((y>>1)&3)<<2)|((x>>1)&3)];let o;
  if(!c||v<26)o=ZX[0];else if(v<150)o=(v-26)/124>th?ZX[c]:ZX[0];else if(v<196)o=ZX[c];else o=(v-196)/54>th?ZX[c+8]:ZX[c];d[i]=o[0];d[i+1]=o[1];d[i+2]=o[2];}
function scaled(src,sx,sy,sw,sh,dw,dh){const out=new Uint8ClampedArray(dw*dh*4),sd=src.d,W0=src.w,H0=src.h;const fx=sw/dw,fy=sh/dh;const exact=Math.abs(fx-1)<.001&&Math.abs(fy-1)<.001;
  for(let y=0;y<dh;y++){const y0=sy+y*fy;for(let x=0;x<dw;x++){const o=(y*dw+x)*4,x0=sx+x*fx;
    if(exact||fx<=1){const si=(Math.min(H0-1,Math.floor(y0))*W0+Math.min(W0-1,Math.floor(x0)))*4;out[o]=sd[si];out[o+1]=sd[si+1];out[o+2]=sd[si+2];out[o+3]=sd[si+3];continue;}
    let r=0,g=0,b=0,a=0,n=0;const ya=Math.floor(y0),yb=Math.max(ya+1,Math.ceil(y0+fy)),xa=Math.floor(x0),xb=Math.max(xa+1,Math.ceil(x0+fx));
    for(let yy=ya;yy<yb;yy++)for(let xx=xa;xx<xb;xx++){const si=(Math.min(H0-1,yy)*W0+Math.min(W0-1,xx))*4;r+=sd[si];g+=sd[si+1];b+=sd[si+2];a+=sd[si+3];n++;}
    out[o]=r/n;out[o+1]=g/n;out[o+2]=b/n;out[o+3]=a/n;}}
  if(!exact)for(let y=0;y<dh;y++)for(let x=0;x<dw;x++)zxDither(out,(y*dw+x)*4,x,y);
  return{w:dw,h:dh,d:out};}
// mode: cover (fill and crop), contain (fit inside), native (1:1)
function uImg(k,x,y,w,h,mode='cover',ay=.35){const src=imgOf(k);if(!src)return null;
  let dw=Math.round(w),dh=Math.round(h),sx=0,sy=0,sw=src.w,sh=src.h;x=Math.round(x);y=Math.round(y);
  if(mode==='native'){dw=src.w;dh=src.h;x+=(w-dw)>>1;}
  else if(mode==='contain'){const s=Math.min(w/src.w,h/src.h);dw=Math.max(1,Math.round(src.w*s));dh=Math.max(1,Math.round(src.h*s));x+=(w-dw)>>1;}
  else{const s=Math.max(w/src.w,h/src.h);sw=w/s;sh=h/s;sx=(src.w-sw)/2;sy=(src.h-sh)*ay;}
  const key=k+'|'+mode+'|'+dw+'x'+dh+'|'+ay;let c=IMGC.get(key);if(!c){c=scaled(src,sx,sy,sw,sh,dw,dh);IMGC.set(key,c);}
  const d=S.d,W=S.w;for(let yy=0;yy<dh;yy++){const py=y+yy;if(py<0||py>=S.h)continue;for(let xx=0;xx<dw;xx++){const px=x+xx;if(px<0||px>=W)continue;const si=(yy*dw+xx)*4;if(c.d[si+3]<110)continue;const i=(py*W+px)*4;d[i]=c.d[si];d[i+1]=c.d[si+1];d[i+2]=c.d[si+2];}}
  return{x,y,w:dw,h:dh};}

