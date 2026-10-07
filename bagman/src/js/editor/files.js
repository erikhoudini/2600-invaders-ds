/* ---------- files ---------- */
function edDownload(){const o=edSerialize();const blob=new Blob([JSON.stringify(o)],{type:'application/json'});const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);a.download=((E.name||'level').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'level')+'.json';document.body.appendChild(a);a.click();
  setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},500);ES.dirty=false;edToast('SAVED '+a.download.toUpperCase(),C_G);}
function edOpen(){if(!ES.file){ES.file=document.createElement('input');ES.file.type='file';ES.file.accept='.json,application/json';ES.file.style.display='none';document.body.appendChild(ES.file);
    ES.file.addEventListener('change',()=>{const f=ES.file.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const o=JSON.parse(r.result);const L0=edParse(o);edSnapRaw();E=L0;ES.sel=-1;ES.dirty=EDCOMBO;ES.libFile=null;edFit();edToast('OPENED '+E.name.toUpperCase(),C_G);}catch(err){edToast(err.message&&/BAGMAN/.test(err.message)?err.message:'THAT FILE COULD NOT BE READ.',C_R);}ES.file.value='';};r.readAsText(f);});}
  ES.file.click();}
function edSnapRaw(){ES.undo.push(JSON.stringify(edSerialize()));if(ES.undo.length>120)ES.undo.shift();ES.redo.length=0;}
function edToast(s,c=C_Y){ES.toast={s:String(s).toUpperCase(),c,t:3};}
function edFit(){const z=Math.max(4,Math.min(24,Math.floor(Math.min(MAPV.w/E.W,MAPV.h/E.H))));ES.z=z;ES.ox=Math.floor((MAPV.w-E.W*z)/2);ES.oy=Math.floor((MAPV.h-E.H*z)/2);}
function edZoom(d,sx,sy){const zs=[4,5,6,8,10,12,16,20,24,32];let k=zs.indexOf(ES.z);if(k<0)k=4;const nk=clamp(k+d,0,zs.length-1);if(nk===k)return;const nz=zs[nk];
  const px=sx-MAPV.x,py=sy-MAPV.y,cx=(px-ES.ox)/ES.z,cy=(py-ES.oy)/ES.z;ES.z=nz;ES.ox=Math.round(px-cx*nz);ES.oy=Math.round(py-cy*nz);}

