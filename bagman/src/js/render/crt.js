/* =====================================================================
   4. DISPLAY: CRT TUBE (WebGL) WITH GAMEPLAY-DRIVEN DISTORTION
   fx: hit, boom, rage, lowHealth     fx2: unused, seed, slow, grain
   ===================================================================== */
const comp=document.createElement('canvas');comp.width=CW;comp.height=CHh;const cctx=comp.getContext('2d');
const ghost=document.createElement('canvas');ghost.width=SW;ghost.height=SH;const gctx=ghost.getContext('2d');
const view=$('view');let gl=null,glp=null,gltex=null,ctx2=null,U={};
const CRT={hit:0,boom:0,rage:0,low:0,slow:0,t:0};
function initGL(){
  try{gl=view.getContext('webgl',{antialias:false,alpha:false});}catch(e){gl=null}
  if(!gl){fallback2D();return;}
  const vs=`attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;gl_Position=vec4(p,0.,1.);}`;
  const fs=`#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
varying vec2 v;uniform sampler2D t;uniform vec4 fx;uniform vec4 fx2;uniform float tm;uniform vec2 rs;uniform vec2 ts;uniform float cr;
  float h1(float n){return fract(sin(n)*43758.5453);}
  float h2(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
  vec3 tx(vec2 u){return texture2D(t,u).rgb;}
  void main(){
    vec2 uv=vec2(v.x,1.-v.y);
        uv.y+=(sin(tm*2.7)*.0012+(h1(floor(tm*24.))-.5)*.0016)*fx2.x;
    vec2 cc=uv*2.-1.;vec2 o=abs(cc.yx)/vec2(5.2-fx.y*2.6*fx2.x,4.3-fx.y*2.1*fx2.x)*cr;cc=cc+cc*o*o;uv=cc*.5+.5;
    if(uv.x<0.||uv.y<0.||uv.x>1.||uv.y>1.){gl_FragColor=vec4(0,0,0,1);return;}
    float band=step(.55,h1(floor(uv.y*44.)+fx2.y*13.));uv.x+=(h1(floor(uv.y*90.)+fx2.y)-.5)*fx.x*.05*band*fx2.x;
    vec2 px=1./ts;float ab=(.6+fx.x*3.5+fx.y*2.5+fx.z*.8)*cr;
    vec3 c=vec3(tx(uv+vec2(px.x*ab,0.)).r,tx(uv).g,tx(uv-vec2(px.x*ab,0.)).b);
    vec3 bl=tx(uv+vec2(px.x*1.5,0.))+tx(uv-vec2(px.x*1.5,0.))+tx(uv+vec2(0.,px.y*1.3))+tx(uv-vec2(0.,px.y*1.3))+tx(uv+vec2(px.x*3.,0.))+tx(uv-vec2(px.x*3.,0.));
    bl/=6.;c+=max(bl-.22,0.)*(.6+fx.y*1.4);
    float ppr=rs.y/ts.y;float fy=ts.y/rs.y;float sl=0.;
    for(int i=0;i<4;i++){float yy=uv.y*ts.y+(float(i)-1.5)*fy*.25;sl+=.5-.5*cos(fract(yy)*6.28318);}sl*=.25;
    float st=.5*cr*smoothstep(1.9,3.4,ppr);c*=(1.-st+st*sl*1.15)*(1.+st*.65);
    float am=.3*cr*smoothstep(2.4,3.6,ppr);float m=mod(gl_FragCoord.x,3.);vec3 mk=m<1.?vec3(1.,.78,.78):m<2.?vec3(.78,1.,.78):vec3(.78,.78,1.);c*=mix(vec3(1.),mk,am);
    float vg=pow(16.*uv.x*uv.y*(1.-uv.x)*(1.-uv.y),.22*cr);
    float beat=.5+.5*sin(tm*9.);
    c=mix(c,c*vec3(1.35,.62,.62),fx.z*(.55+.45*beat));
    c=mix(c,vec3(.75,0.,0.)*c.r+c*.25,fx.w*(1.-vg)*(.6+.4*beat));
    c*=vg;
    float g=h2(uv*ts+fract(tm)*vec2(91.7,37.3))-.5;c+=g*fx2.w*cr;
    float sx=h1(floor(tm*12.)*1.7);if(cr>.6&&h1(floor(tm*12.)*3.1)<.45&&abs(uv.x-sx)<.0016)c+=vec3(.22);
    float sx2=h1(floor(tm*8.)*5.3);if(cr>.6&&h1(floor(tm*8.)*2.3)<.25&&abs(uv.x-sx2)<.0012)c*=.55;
    vec2 dg=floor(uv*vec2(60.,45.));if(cr>.6&&h2(dg+floor(tm*18.))>.9985)c*=.15;
    c=mix(c,vec3(dot(c,vec3(.3,.5,.2)))*vec3(.75,.9,1.25),fx2.z*.18);
    c*=1.-.05*cr+.05*cr*h1(floor(tm*30.))+fx.y*.35;
    gl_FragColor=vec4(c,1.);}`;
  const sh=(type,src)=>{const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));return s;};
  try{glp=gl.createProgram();gl.attachShader(glp,sh(gl.VERTEX_SHADER,vs));gl.attachShader(glp,sh(gl.FRAGMENT_SHADER,fs));gl.linkProgram(glp);
    if(!gl.getProgramParameter(glp,gl.LINK_STATUS))throw new Error('link');}catch(e){console.warn(e);gl=null;fallback2D();return;}
  gl.useProgram(glp);const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
  const loc=gl.getAttribLocation(glp,'p');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
  gltex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,gltex);
  for(const[p,v]of[[gl.TEXTURE_MIN_FILTER,gl.NEAREST],[gl.TEXTURE_MAG_FILTER,gl.NEAREST],[gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE],[gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE]])gl.texParameteri(gl.TEXTURE_2D,p,v);
  for(const n of['t','fx','fx2','tm','rs','ts','cr'])U[n]=gl.getUniformLocation(glp,n);gl.uniform1i(U.t,0);
}
function fallback2D(){ctx2=view.getContext('2d');$('screen').classList.add('nogl');}
function resize(){const r=view.getBoundingClientRect();const dpr=Math.min(3,window.devicePixelRatio||1);
  const w=Math.max(352,Math.round(r.width*dpr)),h=Math.max(264,Math.round(r.height*dpr));if(view.width!==w||view.height!==h){view.width=w;view.height=h;}}
addEventListener('resize',resize);
let shake=0;
function present(borderIdx){
  cctx.fillStyle=ZXC[borderIdx];cctx.fillRect(0,0,CW,CHh);
  const sh=shake*OPT.shake,sx=sh>0?((rnd()*2-1)*sh*3)|0:0,sy=sh>0?((rnd()*2-1)*sh*3)|0:0;
  cctx.drawImage(fb,16+sx,12+sy);
  if(CRT.slow>0&&OPT.blur){gctx.globalAlpha=.6;gctx.drawImage(fb,0,0);cctx.globalAlpha=.2*CRT.slow;cctx.drawImage(ghost,16+sx,12+sy);cctx.globalAlpha=1;}
  else gctx.drawImage(fb,0,0);
  glDraw(comp,CW,CHh);
}
function glDraw(cv,w,h){const f=OPT.flash?1:.35;
  if(gl){gl.viewport(0,0,view.width,view.height);gl.bindTexture(gl.TEXTURE_2D,gltex);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,cv);
    gl.uniform4f(U.fx,CRT.hit*f,CRT.boom*f,CRT.rage,CRT.low);gl.uniform4f(U.fx2,OPT.shake?1:0,rnd(),OPT.blur?CRT.slow:0,.075);gl.uniform1f(U.tm,CRT.t);gl.uniform2f(U.rs,view.width,view.height);gl.uniform2f(U.ts,w,h);gl.uniform1f(U.cr,OPT.crt?1:.3);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);}
  else{ctx2.imageSmoothingEnabled=false;ctx2.drawImage(cv,0,0,view.width,view.height);}}
function crtDecay(dt){CRT.hit=Math.max(0,CRT.hit-dt*3);CRT.boom=Math.max(0,CRT.boom-dt*2.2);}

