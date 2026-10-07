/* ---------- modified runs ---------- */
function showMods(){const sel=()=>MODSEL.size;
  const sc={title:'MODIFIED',border:3,
    text:[{s:()=>sel()+' OF 7 PICKED. '+modCount()+' OF '+MODLIST.length+' UNLOCKED.',c:C_GR}],
    items:[
      ...(MRUN&&MRUN.ch?[{label:'CONTINUE RUN',val:'CH '+MRUN.ch,sub:()=>'MODIFIERS: '+MRUN.mods.map(k=>MODN[k]).join(', ')+'.',act:()=>{GM='mod';DIFF='normal';playChapter(MRUN.ch,MRUN.snap||chapterSnap(MRUN.ch));}}]:[]),
      {label:'START A RUN',col:C_G,dis:()=>sel()?null:'PICK AT LEAST ONE MODIFIER.',sub:'PICK A CHAPTER. THE RUN GOES ON FROM THERE.',act:modPickChapter},
      {label:'CLEAR ALL',dis:()=>sel()?null:'NOTHING PICKED.',act:()=>{MODSEL.clear();saveModSel();}},
      {kind:'head',label:'MODIFIERS'},
      ...MODLIST.map(m=>({label:m[1],val:()=>MODSEL.has(m[0])?'ON':modOpen(m)?'':'★'+m[3],vc:()=>MODSEL.has(m[0])?C_G:C_GR,sub:m[2],
        dis:()=>modOpen(m)?null:'COLLECT '+m[3]+' SPIRALS TO UNLOCK. YOU HAVE '+spiralCount()+'.',
        act:()=>{if(MODSEL.has(m[0]))MODSEL.delete(m[0]);else if(MODSEL.size>=7){toast('SEVEN IS THE LIMIT',C_R);return;}else MODSEL.add(m[0]);saveModSel();}}))],back:showHustles};
  ui(sc);}
function modPickChapter(){ui({title:'PICK A CHAPTER',border:3,art:()=>'photo:'+CH[UI.sel].photo,
  items:CH.map((c,i)=>({label:(i+1)+'. '+c.t,sub:c.why,act:()=>{MRUN={mods:[...MODSEL],ch:i+1,snap:chapterSnap(i+1),start:i+1};saveMRun();GM='mod';DIFF='normal';playChapter(i+1,MRUN.snap);}})),back:showMods});}
function modDone(){ST.modRuns=(ST.modRuns||0)+1;ST.modBest=Math.max(ST.modBest||0,P.score);saveStats();const mods=MRUN?MRUN.mods:[];MRUN=null;saveMRun();
  ui({eyebrow:'MODIFIED RUN',title:'RUN COMPLETE',border:6,art:'photo:'+ENDPHOTO,text:[{s:'MODIFIERS: '+mods.map(k=>MODN[k]).join(', ')+'.',c:C_C}],rows:[['SCORE',money(P.score)],['BEST MODIFIED',money(ST.modBest)]],
    items:[{label:'MENU',act:showMenu},{label:'MODIFIERS',act:showMods}]});}

