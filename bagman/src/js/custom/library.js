/*CUSTOM*/
/* =====================================================================
   CUSTOM MAPS (desktop release): a level list shared by the game and the editor.
   On the desktop the list is a folder of .json files; in a browser it is kept in storage.
   ===================================================================== */
const DESK=window.bagmanDesk||null;
const LIB={desk:!!DESK,
  ls(){try{return JSON.parse(localStorage.getItem('bagman.levels')||'{}');}catch(e){return{};}},
  lsSave(o){localStorage.setItem('bagman.levels',JSON.stringify(o));},
  meta(file,o){let en=0;for(const t of o.things||[])if(t.t==='enemy')en++;return{file,name:String(o.name||file).toUpperCase(),mode:o.mode==='arena'?'arena':'level',W:o.W,H:o.H,enemies:en,sky:!!o.sky};},
  async list(){if(DESK)return(await DESK.list()).sort((a,b)=>a.name.localeCompare(b.name));const o=this.ls();return Object.keys(o).map(f=>this.meta(f,o[f])).sort((a,b)=>a.name.localeCompare(b.name));},
  async read(f){if(DESK)return JSON.parse(await DESK.read(f));const o=this.ls()[f];if(!o)throw new Error('missing');return o;},
  async write(f,obj){if(DESK){await DESK.write(f,JSON.stringify(obj));return;}const o=this.ls();o[f]=obj;this.lsSave(o);},
  async remove(f){if(DESK){await DESK.remove(f);return;}const o=this.ls();delete o[f];this.lsSave(o);},
  folder(){if(DESK)DESK.openFolder();}};
async function libUnique(name){const base=(String(name||'level').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'level');const have=new Set((await LIB.list()).map(o=>o.file));
  let f=base+'.json',k=2;while(have.has(f))f=base+'-'+(k++)+'.json';return f;}
let CUSTOM=null;
// the editor opens once the flatbed gets through in the story
const edUnlocked=()=>UNL.won||Math.max(SAVE.best||1,SAVE.ch||1)>=8;
const EDLOCK='CLEAR CHAPTER 7 IN THE STORY FIRST.';
let CMODS=new Set();try{CMODS=new Set(JSON.parse(localStorage.getItem('bagman.cmods')||'[]'));}catch(e){}
const saveCMods=()=>{try{localStorage.setItem('bagman.cmods',JSON.stringify([...CMODS]));}catch(e){}};
const replayCustom=()=>playCustom(CUSTOM.obj,CUSTOM.file,CUSTOM.mods);
const readPlay=(o,mods)=>LIB.read(o.file).then(obj=>playCustom(obj,o.file,mods)).catch(()=>showCustom('THAT LEVEL COULD NOT BE READ.'));
const KIT_SNAP=k=>{const s=[freshSnap(),chapterSnap(3),chapterSnap(5)][k|0]||freshSnap();s.score=0;return s;};
