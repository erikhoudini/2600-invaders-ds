/* ---------- drawing on the current surface ---------- */
function uRect(x,y,w,h,c){x=Math.round(x);y=Math.round(y);w=Math.round(w);h=Math.round(h);const d=S.d,W=S.w;const x0=Math.max(0,x),x1=Math.min(W,x+w),y0=Math.max(0,y),y1=Math.min(S.h,y+h);
  for(let yy=y0;yy<y1;yy++){let i=(yy*W+x0)*4;for(let xx=x0;xx<x1;xx++,i+=4){d[i]=c[0];d[i+1]=c[1];d[i+2]=c[2];}}}
function uBox(x,y,w,h,c){uRect(x,y,w,1,c);uRect(x,y+h-1,w,1,c);uRect(x,y,1,h,c);uRect(x+w-1,y,1,h,c);}
function uText(s,x,y,c,sc=1){s=String(s).toUpperCase();x=Math.round(x);y=Math.round(y);const d=S.d,W=S.w,H=S.h;
  for(let k=0;k<s.length;k++){const g=FONT[s[k]]||FONT[' '];const gx=x+k*7*sc;
    for(let r=0;r<7;r++){const row=g[r]|(g[r]>>1);if(!row)continue;for(let b=0;b<6;b++)if(row&(1<<(5-b))){
      if(sc===1){const px=gx+b,py=y+r;if(px>=0&&py>=0&&px<W&&py<H){const i=(py*W+px)*4;d[i]=c[0];d[i+1]=c[1];d[i+2]=c[2];}}else uRect(gx+b*sc,y+r*sc,sc,sc,c);}}}}
const uTW=(s,sc=1)=>Math.max(0,String(s).length*7*sc-sc);
function uTextS(s,x,y,c,sc=1,sh=C_R){uText(s,x+Math.max(1,sc>>1)+(sc>2?1:0),y+Math.max(1,sc>>1)+(sc>2?1:0),sh,sc);uText(s,x,y,c,sc);}
function uTextC(s,y,c,sc=1,x0=0,w=S.w){uText(s,x0+((w-uTW(s,sc))>>1),y,c,sc);}
function uTextR(s,xr,y,c,sc=1){uText(s,xr-uTW(s,sc),y,c,sc);}
function uFit(s,w,max=2){for(let k=max;k>1;k--)if(uTW(s,k)<=w)return k;return 1;}
function uDim(k){const d=S.d;for(let i=0;i<d.length;i+=4){d[i]*=k;d[i+1]*=k;d[i+2]*=k;}}
function uClear(){const d=S.d;for(let i=0;i<d.length;i+=4){d[i]=0;d[i+1]=0;d[i+2]=0;}}
function wrap(t,n){const out=[];for(const para of String(t).toUpperCase().split('\n')){let cur='';
    for(let x of para.split(' ')){while(x.length>n){if(cur){out.push(cur);cur='';}out.push(x.slice(0,n));x=x.slice(n);}
      if(cur&&(cur+' '+x).length>n){out.push(cur);cur=x;}else cur=cur?cur+' '+x:x;}out.push(cur);}return out;}
const money=v=>(v<0?'-$':'$')+Math.abs(Math.round(v)).toLocaleString('en-US');
const isFn=f=>typeof f==='function',ev=v=>isFn(v)?v():v;

