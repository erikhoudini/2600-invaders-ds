# BAGMAN: how the engine works

A first-person shooter in one HTML file. A software raycaster draws into a
320x240 framebuffer. Every frame is then forced through a ZX Spectrum palette
with attribute clash and shown through a WebGL CRT shader. Menus, comics and
the level editor are drawn into the same kind of buffer and go through the
same tube, so the whole game shares one look.

About 2,980 lines of dense JavaScript, 72 lines of CSS, and 260 embedded
media files (3.9 MB). It uses no libraries, no build-time dependencies and no
network, apart from two Google Fonts used only by the on-screen touch buttons.

## The frame

```
game state ──► 320x240 RGBA buffer (D)          src/js/render/*, modes/rails.js
                 sky / ceiling, floor cast, DDA walls, sprites by distance,
                 particles, weapon in hand, hurt / berserk tint
             ──► clash()                         src/js/render/clash.js
                 per pixel: hue from a 32K LUT onto the 8 Spectrum inks,
                 brightness on a 2px Bayer grid (black / ink / bright ink),
                 weak colours pulled to the 8x8 cell's dominant hue
             ──► HUD, text, map, lock brackets   drawn AFTER clash so text stays crisp
             ──► 352x264 composite, border in a Spectrum colour (flashes on hits)
             ──► WebGL tube                      src/js/render/crt.js
                 barrel curve, RGB split, bloom, scanlines, aperture mask,
                 vignette, grain, and gameplay-driven FX:
                 hit / boom / rage / low health / slo-mo ghosting
                 (2D canvas fallback if WebGL is missing)
```

The intro uses the older two-ink-per-cell `clashCell()`. The gun in your hand
and the pulp art are marked in `GRT` so they keep the hard dither while the
world gets solid mid-tone bands.

## Source map

`src/manifest.txt` lists every piece in load order. All JavaScript runs in
one shared scope (`(()=>{` in `core/prelude.js` ... `})();` in
`core/start.js`), so there are no imports. Everything is a top-level `const`,
`let` or `function`, and the order in the manifest is the load order.

| Folder | What lives there |
|---|---|
| `core/` | helpers and seeded RNG, the frame loop, boot |
| `render/` | Spectrum clash, bitmap text, the CRT tube, walls/floors/sky, sprites, the gun, overlay, HUD and automap |
| `assets/loader.js` | decodes the embedded images and recolours sprite sheets (Gila, Iguana and Komodo are recoloured thug, cop and torch sheets; headless corpses are cut from the death frames) |
| `audio/` | WebAudio player for the beeper samples, desert-wind and room-tone ambience, lowpass during slo-mo |
| `data/` | weapons, enemy types, power-ups, the 14 chapters and their story text, font, how-to-play |
| `levelgen/` | procedural levels: BSP rooms and corridors, the long-hallway maze, outdoor yards, the train roof, the sniper yard, the four arenas, spiral placement, difficulty and modifier rules, graffiti |
| `state/` | the player, lifetime stats, achievements, saves and snapshots, the rules object, starting a level |
| `world/` | raycast and collision, flow fields, blood and scorch stains, particles, doors, secrets, ambush closets, waves |
| `combat/` | chains and the 777 slot, enemy damage, gibs, headshots, revives, hitscan, explosions and burning cars, weapons, the weapon wheel, lock-on and the berserk dash |
| `enemies/` | firing patterns, movement, dogs, rush/hold/flank tactics, infighting, the per-frame update, projectiles |
| `player/` | movement, sprint, secret walls, the exit switch, pickups |
| `modes/` | the flatbed rail shooter (chapter 7), the sniper mode (built but unused), arena shop and waves |
| `cine/` | comic cut scenes (panels slam in one at a time) and the cocaine-line intro |
| `ui/` | the menu system: surface, drawing, cached dithered images, navigation for keys/mouse/touch/pad, standard layout |
| `screens/` | title, story, chapter cards, blackjack, side hustles, modified runs, drug cache, cheats, credits, achievement cards, options |
| `input/` | keyboard, mouse with pointer lock, two touch pads, gamepad |
| `custom/` | the custom map library (localStorage in a browser, a folder on desktop) |
| `editor/` | the level editor: a 640x400 tool drawn through the tube, undo/redo, JSON level files, test play inside the real engine |

`assets/assets.json` and `assets/comics.json` are the asset tables, with
`"asset:<path>"` where the shipped file has a data URI.

## Game structure

**Story, 14 chapters.** Salamander's nine kilos were stolen at a motel. The
story follows the money up the chain: Skink, Gila, the sheriff's night shift,
the county evidence lot, Iguana, Chuckwalla, and Komodo. Every chapter has a
comic, a location card using a 1940 FSA/OWI Library of Congress photo, a
level, a tally screen, and an optional blackjack hand where you bet your
score.

| Mode | Chapters | Generator |
|---|---|---|
| `maze` | 1, 3, 4, 5, 6, 12, 14 | BSP rooms, MST corridors, key doors placed by graph cuts, secrets, monster closets that open when you take a key |
| `maze` + `halls` | 10 | rooms on a grid joined by a straight-biased maze of one-wide hallways |
| `waves` | 2 | gas station: six waves, then the office unlocks |
| `rails` | 7 | flatbed shooter: scripted car timeline, protect the truck |
| `yard` | 8, 9, 13 | outdoor lots with RVs, shacks and cars that burn and then explode |
| `train` | 11 | freight roofs; step off and you fall |

Levels are **seeded per chapter** (for example `rng(n*7919+1301)`), so every
player gets the same layout. The layout is generated, but it is the same
level every time.

**Bosses:** Gila (ch 4), Iguana (ch 8), Komodo (ch 14). They are recoloured
sprite sheets with their own firing patterns.

**Systems:** lock-on (cycle and flick targets; locked shots always hit and can
take heads), chains (kill score x chain; every 7th kill gives 7s of slo-mo
and lights a reel; three 7s pay $25,000), berserk dash, a weapon wheel that
nearly stops time, explosive drums and pumps, infighting on Normal, armour
classes, and 35 Spirals hidden in nooks. Spirals unlock 22 modifiers.

**Outside the story:** Bagman difficulty, Arena on 4 maps with a shop
(prices rise, sales, droughts, a blackjack dealer with jackpot odds), Score
Attack, Modified runs (up to 7 modifiers), Modified Arena (random modifiers
every wave), standalone Blackjack, Custom Maps, and the Level Editor (unlocks
after chapter 7). There are 20 achievements dealt as playing cards with pulp
covers, a 13-piece postcard (one per recovered kilo), a cut-scene gallery,
statistics, and four cheats that block achievements.

## Saved data (localStorage)

| Key | What |
|---|---|
| `bagman11.save` | story progress: chapter, snapshot, best chapter, difficulty. **Renaming this key wipes everyone's save.** |
| `bagman.stats` | lifetime statistics (kept apart from the save) |
| `bagman.unlock` | finished-story flag, all-modifiers cheat, lucky jackpot |
| `bagman.ach`, `bagman.spirals`, `bagman.kilos`, `bagman.seen` | achievements, spirals, postcard pieces, comics seen |
| `bagman.opts`, `bagman.keys` | options and key bindings |
| `bagman.modsel`, `bagman.modrun`, `bagman.cmods` | modifier picks, the modified run in progress, custom-map modifiers |
| `bagman.hs`, `bagman.bj`, `bagman.cheat` | score attack bests, blackjack bankroll, cheats |
| `bagman.levels` | custom maps (browser only; desktop uses a folder) |

## Desktop hooks

If `window.bagmanDesk` exists, the game uses it for `list / read / write /
remove / openFolder / quit`. Custom maps then live in a folder and the main
menu gets QUIT. Two flags are hard-coded in this build: `EDWEB=true` (hides
"open a level file") and `EDCOMBO=true` (the editor saves to the library).
The `/*CUSTOM*/` and `/*EDITOR*/` comments look like splice points from an
earlier build step. The desktop shell that provides `bagmanDesk`, and
whatever produced store builds, are **not** in this repo.

## Things noticed while reading (not changed)

- **Sniper mode is finished but unused.** `genSniper`, the scope, guard
  patrols and the `wSniper` sprite all work, but no chapter has `mode:'sniper'`.
- **Postcard count disagrees.** The statistics screen says `POSTCARD PIECES n OF 14`;
  the drug cache and postcard screen say 13. `kiloCount()` tops out at 13
  (chapter 7 has no kilo).
- **Achievement toasts depend on frame rate.** `drawAch(1/60)` uses a fixed
  step, so on a 120 Hz screen the banner lasts half as long.
- `cardName()` has a ternary whose two branches are identical.
- `fx2.x` is labelled "unused" in the CRT comment but drives shake jitter and
  barrel pulse.
- Chapter 11 (Freight) has an empty `story` string; its comic carries the
  story instead.
