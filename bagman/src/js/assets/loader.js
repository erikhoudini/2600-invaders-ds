/* =====================================================================
   5. ASSETS
   ===================================================================== */
function loadImg(src){return new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=src;});}
const TINTC={};
function tintFloor(k,ink){const key=k+'/'+ink;if(TINTC[key])return TINTC[key];const S=FLO[k],d=new Uint8ClampedArray(S.d.length);let m=0;
  for(let i=0;i<S.d.length;i+=4)m+=S.d[i]*.3+S.d[i+1]*.59+S.d[i+2]*.11;m/=S.d.length/4;const C=ZX[ink];
  for(let i=0;i<S.d.length;i+=4){const l=S.d[i]*.3+S.d[i+1]*.59+S.d[i+2]*.11;const f=Math.max(.1,Math.min(1.1,.54+(l-m)/m*1.5));d[i]=C[0]*f;d[i+1]=C[1]*f;d[i+2]=C[2]*f;d[i+3]=255;}
  return TINTC[key]={w:S.w,h:S.h,d};}
function pix(im){const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const x=c.getContext('2d');x.drawImage(im,0,0);return{w:im.width,h:im.height,d:x.getImageData(0,0,im.width,im.height).data};}
let WALLS,DECO,CARS,TREES,DOG,CARSIDE,GRAF=null;const FLO={},SHEET={},WPN={},PULP={};
const tex=n=>{const i=A.wallNames.indexOf(n);if(i<0)throw new Error('tex '+n);return i;};
const dec=n=>{const i=A.decoNames.indexOf(n);if(i<0)throw new Error('deco '+n);return i;};
function recolor(src,rgb,speck,pants){
  const d=new Uint8ClampedArray(src.d);let seed=7;
  for(let i=0;i<d.length;i+=4){if(d[i+3]<100)continue;const r=d[i],g=d[i+1],b=d[i+2];const mx=Math.max(r,g,b),mn=Math.min(r,g,b);
    if(mx>90&&(mx-mn)/mx<0.2){const l=(r+g+b)/3/200;d[i]=Math.min(255,rgb[0]*l);d[i+1]=Math.min(255,rgb[1]*l);d[i+2]=Math.min(255,rgb[2]*l);
      if(speck){seed=(seed*1103515245+12345)&0x7fffffff;if(seed%100<speck[0]){d[i]=speck[1][0];d[i+1]=speck[1][1];d[i+2]=speck[1][2];}}}
    else if(pants&&mx<60){d[i]=pants[0]*(mx+20)/80;d[i+1]=pants[1]*(mx+20)/80;d[i+2]=pants[2]*(mx+20)/80;}}
  return{w:src.w,h:src.h,d};
}
function tint(src,rgb){const d=new Uint8ClampedArray(src.d);for(let i=0;i<d.length;i+=4){if(d[i+3]<100)continue;const l=(d[i]*.3+d[i+1]*.59+d[i+2]*.11)/150;if(d[i]>d[i+1]+60&&d[i]>d[i+2]+60)continue;d[i]=Math.min(255,rgb[0]*l);d[i+1]=Math.min(255,rgb[1]*l);d[i+2]=Math.min(255,rgb[2]*l);}return{w:src.w,h:src.h,d};}
function headless(src){const d=new Uint8ClampedArray(src.d);const w=src.w;
  for(const[col,f]of[[1,.24],[2,.26],[3,.3],[4,.3]]){const x0=col*64,y0=5*64;let top=64,bot=0,left=64,right=0;
    for(let y=0;y<64;y++)for(let x=0;x<64;x++)if(d[((y0+y)*w+x0+x)*4+3]>100){top=Math.min(top,y);bot=Math.max(bot,y);left=Math.min(left,x);right=Math.max(right,x);}
    if(bot<=top)continue;const cutY=top+Math.round((bot-top)*f);
    for(let y=top;y<cutY;y++)for(let x=0;x<64;x++)d[((y0+y)*w+x0+x)*4+3]=0;
    for(let x=left;x<=right;x++){const i=((y0+cutY)*w+x0+x)*4;if(d[i+3]>100){d[i]=200;d[i+1]=0;d[i+2]=0;}}}
  return{w:src.w,h:src.h,d};}
// Key cards are redrawn as big chunky cards: a solid colour body, a black mag stripe, a white label and a hard black edge,
// so they read against any wall or floor once the palette pass has had its way.
function keycard(name,col){const f=A.decoNames.indexOf(name);if(f<0)return;const w=DECO.w,d=DECO.d,x0=f*64;
  for(let y=0;y<64;y++)for(let x=0;x<64;x++)d[(y*w+x0+x)*4+3]=0;
  const set=(x,y,c)=>{const i=(y*w+x0+x)*4;d[i]=c[0];d[i+1]=c[1];d[i+2]=c[2];d[i+3]=255;};
  for(let y=18;y<48;y++)for(let x=10;x<54;x++){const edge=y<20||y>45||x<12||x>51;const cut=(y<22&&x<14)||(y<22&&x>49);
    if(cut&&!edge)continue;set(x,y,edge?[0,0,0]:col);}
  for(let y=24;y<29;y++)for(let x=12;x<52;x++)set(x,y,[0,0,0]);
  for(let y=33;y<42;y++)for(let x=16;x<30;x++)set(x,y,(y===33||y===41||x===16||x===29)?[0,0,0]:[255,255,255]);
  for(let y=34;y<41;y+=2)for(let x=33;x<49;x++)set(x,y,[0,0,0]);}
async function loadAssets(){
  WALLS=pix(await loadImg(A.walls));GRAF=pix(await loadImg(A.graf));CARSIDE=pix(await loadImg(A.carSide));DECO=pix(await loadImg(A.deco));CARS=pix(await loadImg(A.cars));TREES=pix(await loadImg(A.trees));DOG=pix(await loadImg(A.dog));
  for(const k in A.floors)FLO[k]=pix(await loadImg(A.floors[k]));
  DCAN=A.decoNames.indexOf('DRUMCAN');keycard('KEYY',[255,255,0]);keycard('KEYR',[255,0,0]);
  for(const k in A.pulp)PULP[k]=pix(await loadImg(A.pulp[k]));
  const cop=pix(await loadImg(A.cop)),thug=pix(await loadImg(A.thug));
  const torch=pix(await loadImg(A.torch));const base={cop,thug,torch,enf:recolor(thug,[170,20,20]),gila:recolor(thug,[230,120,30],[30,[20,20,20]],[20,20,20]),
    iguana:recolor(cop,[40,170,60],null,[30,80,30]),komodo:tint(torch,[70,190,60]),heavy:pix(await loadImg(A.heavy))};
  for(const k in base){SHEET[k]=base[k];SHEET[k+'_h']=headless(base[k]);}
  for(const k of['wFists','wPistol','wShotgun','wTommy','wSniper','wDyn','wFlame']){const w=A[k];WPN[k]=Object.assign(pix(await loadImg(w.img)),{fw:w.w,fh:w.h,x:w.x,y:w.y,n:w.n});}
}

