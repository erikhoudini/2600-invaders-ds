const POSTC=[['Underworld','1927','Paramount','Underworld (1927) one-sheet poster.jpg'],['The Racket','1928','Paramount','The Racket (1928) film poster.jpg'],['Little Caesar','1931','First National','Little Caesar (1931 film poster - Style A).jpg'],
  ['The Public Enemy','1931','Warner Bros.','The Public Enemy 1931 Poster.jpg'],['The Great Train Robbery','1903','Edison','The Great Train Robbery, Edwin S. Porter, Edison Films, 1903 Poster.jpg'],['The Covered Wagon','1923','Paramount','The Covered Wagon poster 1923.jpg']];
function showCredits(back){const ph=A.photoMeta,doc=[];const cr=(b,s,u)=>{doc.push({s:b,c:C_Y},{s},{s:u.replace(/^https?:\/\//,''),c:C_C},{sp:1});};
  doc.push({h:'SPRITES. CC0, OPENGAMEART.ORG'});
  for(const o of[['The Guard','knekko','opengameart.org/content/the-guard','Deputy sprites'],['Psycho Man','horrormovierei','opengameart.org/content/psycho-man','Gunman sprites'],
    ['German Shepherd','shepardskin','opengameart.org/content/german-shepherd-0','Dog running frames'],['FPS Weapon Sprites','ragnar-random','opengameart.org/content/fps-weapon-sprites','Fists, revolver, shotgun and the hands'],
    ['Old School FPS Wall Textures','knekko','opengameart.org/content/old-school-fps-wall-textures','Switch and elevator panels'],['Oldschool FPS Decoration Sprites','knekko','opengameart.org/content/oldschool-fps-decoration-sprites','Props, key and remains'],
    ['Wolfclone Sprite Pack','a-devs-diary','opengameart.org/content/wolfclone-sprite-pack','First aid kit'],['Low Poly Guns Pack','Quaternius','opengameart.org/content/low-poly-guns-pack','AK-47'],
    ['Monster Mutant Leader for FPS Game','Nmn','opengameart.org/content/monster-mutant-leader-for-fps-game','Flamethrower man'],['CC0 Explosive Icons','AntumDeluge, from OpenClipart','opengameart.org/content/cc0-explosive-icons','Dynamite'],['Human Guard for sprite-based FPS','Nmn','opengameart.org/content/human-guard-for-sprite-based-fps','Guard in the red helmet'],['wind1','Luke.RUSTLTD','opengameart.org/content/wind1','Desert wind']])cr(o[0],o[3]+'. By '+o[1]+'. CC0.',o[2]);
  doc.push({h:'TEXTURES AND SOUND. CC BY'});
  cr('Rustic Decay','Low-res abandoned city textures. By The Gas Station. CC BY 4.0.','thegasstation.itch.io/rustic-decay-low-res-abandoned-city-textures');
  cr('ZX Spectrum Beeper Sound Effects','By Shiru. CC BY 3.0.','opengameart.org/content/zx-spectrum-beeper-sound-effects');
  doc.push({h:'COMIC PANELS. PUBLIC DOMAIN'});
  cr('Black Magic, issues 1 to 20','Prize Publications, 1950 to 1953. Art by the Simon and Kirby studio, Mort Meskin, Bruno Premiani, Leonard Starr, Bill Draut and others. Scans from Comic Book Plus.','comicbookplus.com/?cid=1151');
  doc.push({h:'ACHIEVEMENT CARDS. PULP COVERS, PUBLIC DOMAIN'});
  A.cardMeta.forEach((m,i)=>cr(m[0]+', '+m[1],cardName(i)+'. Cover art, cropped and recoloured. From the Luminist Archives.','luminist.org/archives/PU/'+A.cardFile[i]+'_L.jpg'));
  doc.push({h:'FILM POSTERS. PUBLIC DOMAIN'});
  POSTC.forEach(c=>cr(c[0]+' ('+c[1]+')',c[2]+'. Theatrical poster. Wikimedia Commons.','commons.wikimedia.org/wiki/File:'+c[3].replace(/ /g,'_')));
  cr('Reefer Madness (1936)','Motion Picture Ventures. Theatrical poster.','en.wikipedia.org/wiki/Reefer_Madness');
  doc.push({h:'POSTCARD. PUBLIC DOMAIN'});cr('Memories of Olive','Alberto Vargas, 1920. Painted after the death of Olive Thomas. Dithered and cut into fourteen pieces.','en.wikipedia.org/wiki/Alberto_Vargas');
  doc.push({h:'PULP MAGAZINE ART. PUBLIC DOMAIN'});
  for(const c of['September 1930','November 1929','May 1930','April 1930','October 1929'])cr('Black Mask, '+c,'Cover art. Wikimedia Commons.','commons.wikimedia.org/wiki/File:Black_Mask_'+c.replace(' ','_')+'.jpg');
  doc.push({h:'PHOTOGRAPHS. PUBLIC DOMAIN'});
  Object.keys(ph).sort().forEach(k=>{const m=ph[k];cr(m.title,m.date+'. '+m.by+'. Farm Security Administration / Office of War Information, Library of Congress. No known restrictions.',m.url);});
  ui({title:'CREDITS',border:4,doc,back});}

