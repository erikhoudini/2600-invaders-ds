/* =====================================================================
   3. BITMAP FONT AND 2D PRIMITIVES (drawn after clash, cell-friendly)
   ===================================================================== */
Object.assign(FONT,{'>':[16,8,4,2,4,8,16],'<':[1,2,4,8,4,2,1],'*':[0,21,14,31,14,21,0],'&':[12,18,20,8,21,18,13],'"':[10,10,0,0,0,0,0],';':[0,12,12,0,12,4,8],'=':[0,0,31,0,31,0,0],'_':[0,0,0,0,0,0,31],
  '\u25B2':[0,4,14,31,31,0,0],'\u25BC':[0,0,31,31,14,4,0],'\u25C0':[2,6,14,30,14,6,2],'\u25B6':[8,12,14,15,14,12,8],
  '\u2660':[4,14,31,31,31,4,14],'\u2665':[0,10,31,31,14,4,0],'\u2666':[4,14,31,31,14,4,0],'\u2663':[14,14,4,31,31,4,14],'\u2605':[4,4,31,14,10,17,0]});
const textW=(s,sc=1)=>String(s).length*7*sc;
function put(x,y,c){if(x<0||y<0||x>=SW||y>=SH)return;const i=(y*SW+x)*4;D[i]=c[0];D[i+1]=c[1];D[i+2]=c[2];}
function rect(x,y,w,h,c){x|=0;y|=0;const x0=Math.max(0,x),x1=Math.min(SW,x+w),y1=Math.min(SH,y+h);for(let yy=Math.max(0,y);yy<y1;yy++)for(let xx=x0;xx<x1;xx++){const i=(yy*SW+xx)*4;D[i]=c[0];D[i+1]=c[1];D[i+2]=c[2];}}
function text(s,x,y,c,sc=1,paper){s=String(s).toUpperCase();x|=0;y|=0;
  if(paper)rect(x-1,y-1,textW(s,sc)+1,8*sc+1,paper);
  for(let k=0;k<s.length;k++){const g=FONT[s[k]]||FONT[' '];const gx=x+k*7*sc;
    for(let r=0;r<7;r++){const row=g[r]|(g[r]>>1);for(let b=0;b<6;b++)if(row&(1<<(5-b))){if(sc===1)put(gx+b,y+r,c);else rect(gx+b*sc,y+r*sc,sc,sc,c);}}}}
function textC(s,y,c,sc=1,paper){text(s,((SW-textW(String(s),sc))/2)|0,y,c,sc,paper);}
function fitScale(s,max){for(const sc of[3,2,1])if(textW(s,sc)<=max)return sc;return 1;}

