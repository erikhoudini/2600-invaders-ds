/* ---------- editing ---------- */
const inMap=(x,y)=>x>=0&&y>=0&&x<E.W&&y<E.H;
const cellAt=(sx,sy)=>{const x=Math.floor((sx-MAPV.x-ES.ox)/ES.z),y=Math.floor((sy-MAPV.y-ES.oy)/ES.z);return inMap(x,y)?y*E.W+x:-1;};
const isSwitch=i=>E.walls[i]===tex('SWITCH')+1;
function setWall(i,v){if(E.walls[i]===v)return;E.walls[i]=v;const m=E.marks.get(i);
  if(v){if(m&&(m.k==='door'||m.k==='spawn'))E.marks.delete(i);E.things.delete(i);if(ES.sel===i)ES.sel=-1;}
  else if(m&&(m.k==='secret'||m.k==='amb'))E.marks.delete(i);}
function floorSlot(f){let k=E.floors.findIndex(o=>o.fl===f.fl&&o.fi===f.fi);if(k<0){if(E.floors.length>=250){const used=new Set(E.fmap);E.floors=E.floors.map((o,j)=>used.has(j)?o:null);k=E.floors.indexOf(null);if(k<0)return 0;E.floors[k]={fl:f.fl,fi:f.fi};for(let j=0;j<E.floors.length;j++)if(!E.floors[j])E.floors[j]={fl:'concrete',fi:0};return k;}E.floors.push({fl:f.fl,fi:f.fi});k=E.floors.length-1;}return k;}
function paintCell(i,erase){const tab=ES.tab;if(i<0)return;
  if(tab===0){setWall(i,erase?0:WALLPAL[ES.pick[0]]+1);return;}
  if(tab===1){if(!erase)E.fmap[i]=floorSlot(FLOORPAL[ES.pick[1]]);return;}}
function floodFloor(i){if(i<0||E.walls[i])return;edSnap();const slot=floorSlot(FLOORPAL[ES.pick[1]]),W=E.W,seen=new Uint8Array(W*E.H),q=[i];seen[i]=1;
  for(let h=0;h<q.length;h++){const c=q[h];E.fmap[c]=slot;for(const o of[1,-1,W,-W]){const n=c+o;if(n<0||n>=seen.length||seen[n]||E.walls[n]||(E.marks.get(n)&&E.marks.get(n).k==='door'))continue;if((o===1&&n%W===0)||(o===-1&&c%W===0))continue;seen[n]=1;q.push(n);}}play('pick',.4,1.1);}
function placeAt(i){const tab=ES.tab;if(i<0)return;const x=i%E.W,y=(i/E.W)|0;
  if(tab>=2&&tab<=4){const t=['item','enemy','prop'][tab-2],list=[ED_ITEMS,ED_ENEMIES,ED_PROPS][tab-2],k=list[ES.pick[tab]][0];const ex=E.things.get(i);
    if(ex&&ex.t===t&&tab===3&&ex.k===k){ES.sel=i;return;}
    if(E.walls[i]){edToast('THAT CELL IS A WALL.');return;}if(E.marks.get(i)&&E.marks.get(i).k==='door'){edToast('THAT CELL IS A DOOR.');return;}
    edSnap();const o={t,k};if(t==='enemy'){o.dir=ex&&ex.t==='enemy'?ex.dir:2;o.role='auto';}E.things.set(i,o);ES.sel=t==='enemy'?i:-1;play('pick',.4,1.2);return;}
  if(tab===5){const sp=ED_SPECIAL[ES.pick[5]][0];
    if(sp==='start'){if(E.walls[i]){edToast('THE START NEEDS AN OPEN CELL.');return;}edSnap();E.start.x=x;E.start.y=y;E.things.delete(i);ES.sel=-2;play('pick',.4,1.2);return;}
    if(sp==='exit'){edSnap();E.marks.delete(i);E.things.delete(i);E.walls[i]=tex('SWITCH')+1;play('pick',.4,1.2);return;}
    if(sp.startsWith('door')){if(E.walls[i]){edToast('A DOOR GOES IN AN OPEN CELL BETWEEN TWO WALLS.');return;}const W=E.W;
      const ew=x>0&&x<E.W-1&&E.walls[i-1]&&E.walls[i+1],ns=y>0&&y<E.H-1&&E.walls[i-W]&&E.walls[i+W];if(!ew&&!ns){edToast('A DOOR NEEDS WALLS ON TWO OPPOSITE SIDES.');return;}
      edSnap();E.things.delete(i);E.marks.set(i,{k:'door',lock:sp==='doorY'?'Y':sp==='doorR'?'R':''});play('pick',.4,1.2);return;}
    if(sp==='secret'||sp.startsWith('amb')){if(!E.walls[i]||isSwitch(i)){edToast('PICK A WALL CELL.');return;}const W=E.W;
      if(![i-1,i+1,i-W,i+W].some(j=>j>=0&&j<E.walls.length&&!E.walls[j])){edToast('THE WALL NEEDS AN OPEN CELL NEXT TO IT.');return;}
      edSnap();E.marks.set(i,sp==='secret'?{k:'secret'}:{k:'amb',key:sp==='ambY'?'Y':'R'});play('pick',.4,1.2);return;}
    if(sp==='spawn'){if(E.walls[i]){edToast('SPAWNS GO IN OPEN CELLS.');return;}edSnap();const m=E.marks.get(i);if(m&&m.k==='spawn')E.marks.delete(i);else E.marks.set(i,{k:'spawn'});play('pick',.4,1.2);return;}}}
function eraseAt(i){if(i<0)return;const tab=ES.tab;
  if(tab>=2&&tab<=4){if(E.things.has(i)){E.things.delete(i);if(ES.sel===i)ES.sel=-1;return true;}return false;}
  if(tab===5){if(isSwitch(i)){E.walls[i]=tex('CINDER')+1;return true;}if(E.marks.has(i)){E.marks.delete(i);return true;}return false;}
  return false;}
function selRotate(d){if(ES.sel===-2){edSnap();E.start.dir=(E.start.dir+d+8)&7;return;}const t=E.things.get(ES.sel);if(t&&t.t==='enemy'){edSnap();t.dir=((t.dir||0)+d+8)&7;}}
function selDelete(){if(ES.sel>=0&&E.things.has(ES.sel)){edSnap();E.things.delete(ES.sel);ES.sel=-1;play('empty',.4,1.3);}}
function rectCells(a,b){const W=E.W,ax=a%W,ay=(a/W)|0,bx=b%W,by=(b/W)|0;return[Math.min(ax,bx),Math.min(ay,by),Math.max(ax,bx),Math.max(ay,by)];}
function applyRect(a,b,fill,erase){const[x0,y0,x1,y1]=rectCells(a,b),W=E.W;edSnap();
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const edge=x===x0||x===x1||y===y0||y===y1;const i=y*W+x;
    if(ES.tab===0){if(fill||edge)setWall(i,erase?0:WALLPAL[ES.pick[0]]+1);}
    else if(ES.tab===1){if(!erase)E.fmap[i]=floorSlot(FLOORPAL[ES.pick[1]]);}}
  play('pick',.4,1);}
function eyedrop(i){if(i<0)return;if(E.walls[i]&&!isSwitch(i)){const k=WALLPAL.indexOf(E.walls[i]-1);if(k>=0){ES.tab=0;ES.pick[0]=k;}}
  else{const f=E.floors[E.fmap[i]];const k=FLOORPAL.findIndex(o=>o.fl===f.fl&&o.fi===f.fi);if(k>=0){ES.tab=1;ES.pick[1]=k;}}play('menu',.3,1.4);}

