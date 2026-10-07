const fmtT=t=>Math.floor(t/60)+':'+String(Math.floor(t%60)).padStart(2,'0');
const HOW=[
 ['Goal',['Recover your kilos. Kill the men who took them. Reach the exit to finish a chapter.'],'hero'],
 ['Moving',['KEYBOARD: W A S D move. Arrows turn. Shift runs. Space fires. Click the screen to aim with the mouse.','CONTROLLER: left stick moves. Right stick turns. RT fires.','TOUCH: left pad moves. Right pad turns.','Sprint can be hold or toggle in Options.'],'c:1'],
 ['Weapons',['Hold SWAP (Q, RB) to open the weapon wheel. Push toward a weapon and release.','Tap SWAP to return to the previous weapon.','Mouse wheel and keys 1 to 5 also select.'],'c:2'],
 ['Lock-on',['LOCK (E, LB, right mouse) targets the nearest enemy. Press again for the next target.','Locked shots always hit and can take the head.','The AK does not lock. Guards in red helmets cannot be locked.'],'gunman'],
 ['Chains',['A kill pays $100 times the chain. Explosions keep a chain going.','Every 7th kill gives 7 seconds of Slo-Mo and lights one reel. Three 7s pay $25,000.'],'c:5'],
 ['Power-ups',['BERSERK: fists kill in one hit. Fire dashes to the locked target.','SLO-MO: slows time.','FLAMER: short range fire. Replaces your weapon until it runs out.','Each lasts 15 seconds. A second pickup adds time.'],'c:4'],
 ['Health and armor',['First aid, whiskey and pills restore health.','A vest absorbs 1/3 of each hit. Heavy armor absorbs 1/2.'],'cop'],
 ['Keys and secrets',['Colored doors need the matching key. Taking a key can start an ambush.','Some walls open when you walk into them. Look for hand prints, posters and framed pictures.','Spirals unlock modifiers.'],'c:3'],
 ['Explosives',['Fuel drums and pumps explode when shot. Cars burn, then explode.','Dynamite rolls after it lands.','On Normal, enemies can hit each other.'],'bandit'],
 ['The truck',['Chapter 7. You ride the truck bed with the AK. Ammo does not run out.','Enemies shoot the truck. Shoot cars before they ram it.'],'c:7'],
 ['Back room',['Between chapters you can bet your score on one hand of blackjack.','Bet in steps of $10,000 or all of it. A win pays 2 to 1. You can leave without betting.'],'c:6']];
let SEEN={};try{SEEN=JSON.parse(localStorage.getItem('bagman.seen')||'{}');}catch(e){}
function markSeen(k){if(SEEN[k])return;SEEN[k]=1;try{localStorage.setItem('bagman.seen',JSON.stringify(SEEN));}catch(e){}}
