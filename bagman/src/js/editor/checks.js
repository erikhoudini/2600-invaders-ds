/* ---------- checks before a test ---------- */
function edProblems(){const out=[],warn=[],W=E.W,s=E.start,si=s.y*W+s.x;
  if(E.walls[si])out.push('THE PLAYER START IS INSIDE A WALL.');
  let sw=0,bosses=0;for(let i=0;i<E.walls.length;i++)if(isSwitch(i))sw++;for(const t of E.things.values())if(t.t==='enemy'&&ETYPE[t.k].boss)bosses++;
  if(E.mode==='level'&&!sw)warn.push('NO EXIT SWITCH. THE LEVEL CANNOT BE FINISHED.');
  if(E.mode==='arena'&&![...E.marks.values()].some(m=>m.k==='spawn'))warn.push('NO ARENA SPAWNS. ENEMIES WILL APPEAR ANYWHERE OPEN.');
  if(bosses>1)warn.push('ONLY THE FIRST BOSS GUARDS THE EXIT.');
  let keyY=0,keyR=0,doorY=0,doorR=0;for(const t of E.things.values()){if(t.k==='KEYY')keyY++;if(t.k==='KEYR')keyR++;}for(const m of E.marks.values())if(m.k==='door'){if(m.lock==='Y')doorY++;if(m.lock==='R')doorR++;}
  if(doorY&&!keyY)warn.push('A YELLOW DOOR WITH NO YELLOW KEY.');if(doorR&&!keyR)warn.push('A RED DOOR WITH NO RED KEY.');
  return{out,warn};}

