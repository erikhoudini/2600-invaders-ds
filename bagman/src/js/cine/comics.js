/* =====================================================================
   19. THE LINE: full intro at boot, short cut before every chapter
   ===================================================================== */
/* comic cut scenes: panels land one at a time on a black page, Max Payne style */
function wrapText(t,n){const w=t.split(' '),out=[];let cur='';for(const x of w){if((cur+' '+x).trim().length>n){out.push(cur);cur=x;}else cur=(cur+' '+x).trim();}if(cur)out.push(cur);return out;}
let comic=null;const COMIC_IMG={};
async function comicLoad(key){if(COMIC_IMG[key])return COMIC_IMG[key];const pages=COMICS[key]||[];
  const out=await Promise.all(pages.map(pg=>Promise.all(pg.map(async sl=>({r:sl.r,im:pix(await loadImg(sl.i))})))));return COMIC_IMG[key]=out;}
function comicStart(key,done,cap){if(!COMICS[key]){done&&done();return;}markSeen(key);state='comicload';setMode('cine');
  comicLoad(key).then(pages=>{comic={key,pages,pi:0,si:0,t:0,land:0,done,hold:0,dirs:[],cap};state='comic';comicLand();});}
function comicLand(){const c=comic;c.t=0;c.land=1;c.dir=[[-1,0],[1,0],[0,-1],[0,1]][(c.pi*3+c.si)%4];
  play('push',.6,.8+rnd()*.4);SFX.thud&&SFX.thud();}
function comicNext(){const c=comic;if(!c)return;if(c.land&&c.t<.16){c.t=.16;return;}
  const pg=c.pages[c.pi];if(c.si<pg.length-1){c.si++;comicLand();return;}
  if(c.pi<c.pages.length-1){c.pi++;c.si=0;borderFlash=.12;borderFlashIdx=15;comicLand();return;}
  comicEnd();}
function comicEnd(){const c=comic;comic=null;state='menu';if(c&&c.done)c.done();}
function comicDraw(dt){const c=comic;c.t+=dt;if(c.down)c.hold+=dt;
  if(c.hold>.7){comicEnd();return;}
  D.fill(0,0,SW*SH*4);for(let i=3;i<SW*SH*4;i+=4)D[i]=255;
  const pg=c.pages[c.pi],oy=0;
  for(let k=0;k<=c.si;k++){const sl=pg[k],im=sl.im;let[x,y,w,h]=sl.r;y+=oy;
    if(k===c.si){const p=Math.min(1,c.t/.16),e=1-(1-p)*(1-p)*(1-p);x+=Math.round(c.dir[0]*(1-e)*60);y+=Math.round(c.dir[1]*(1-e)*40);
      if(p>=1&&c.land){c.land=0;CRT.hit=Math.max(CRT.hit,.35);shake=Math.max(shake,.35);}}
    const flash=OPT.flash&&k===c.si&&c.t>=.16&&c.t<.24;
    for(let yy=0;yy<h;yy++){const dy=y+yy;if(dy<0||dy>=SH)continue;for(let xx=0;xx<w;xx++){const dx=x+xx;if(dx<0||dx>=SW)continue;const si=(yy*im.w+xx)*4,di=(dy*SW+dx)*4;
      if(flash){D[di]=255;D[di+1]=255;D[di+2]=255;}else{D[di]=im.d[si];D[di+1]=im.d[si+1];D[di+2]=im.d[si+2];}}}
    if(!flash){rect(x-1,y-1,w+2,1,C_W);rect(x-1,y+h,w+2,1,C_W);rect(x-1,y,1,h,C_W);rect(x+w,y,1,h,C_W);}}
  if(c.cap){const lastPage=c.pi===c.pages.length-1,txt=c.pi===0?c.cap[0]:(lastPage?c.cap[1]:null);
    if(txt&&(c.pi>0||c.si>=1)){const lines=wrapText(txt.toUpperCase(),40),bh=lines.length*10+6,bw=Math.max(...lines.map(l=>textW(l)))+10,bx=c.pi===0?6:SW-bw-6,by=SH-bh-6;
      rect(bx-1,by-1,bw+2,bh+2,C_K);rect(bx,by,bw,bh,C_Y);lines.forEach((l,i)=>text(l,bx+5,by+4+i*10,C_K));}}
  const last=c.si===pg.length-1;if(c.t>(last?2.6:1.5))comicNext();
  if(c.pi===0&&c.si<2)textC(UI.input==='touch'?'TAP ON, HOLD TO SKIP':UI.input==='pad'?'A ON, B SKIPS':'ENTER ON, ESC SKIPS',SH-12,C_GR);
  if(c.down&&c.hold>.15){const w=Math.round((SW-40)*Math.min(1,c.hold/.7));rect(20,SH-4,w,2,C_W);}}
