/* ---------- palettes ---------- */
function edPalettes(){WALLPAL=[];A.wallNames.forEach((n,t)=>{if(!NOWALL.has(n))WALLPAL.push(t);});
  FLOORPAL=[];for(const fl of Object.keys(A.floors))for(const fi of[0,1,2,3,4,5,6,7])FLOORPAL.push({fl,fi});}
function palEntries(tab){if(tab===0)return WALLPAL.map(t=>({lab:A.wallNames[t],th:z=>wallThumb(t,z)}));
  if(tab===1)return FLOORPAL.map(f=>({lab:f.fl.toUpperCase()+(f.fi?' '+ZXN[f.fi]:''),th:z=>floorThumb(f,z)}));
  if(tab===2)return ED_ITEMS.map(([k,l])=>({lab:l,th:z=>thingThumb('item',k,z)}));
  if(tab===3)return ED_ENEMIES.map(([k,l])=>({lab:l,th:z=>thingThumb('enemy',k,z)}));
  if(tab===4)return ED_PROPS.map(([k,l])=>({lab:l,th:z=>thingThumb('prop',k,z)}));
  return ED_SPECIAL.map(([k,l])=>({lab:l}));}

