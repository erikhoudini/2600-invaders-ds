# KILL RACE

*Somewhere in Nevada. After dark.* A first-person car-combat prototype in the
spirit of Carmageddon and Twisted Metal. It runs on the BAGMAN engine and uses
only BAGMAN's art and sound.

You drive through a night-time grid town with an AK out the window. The
Geckos race you or send cars at you in waves. Deputies come out on foot, dogs
come off the leash, and civilians walk the sidewalks until you give them a
reason not to.

```sh
node tools/build.mjs killrace     # -> dist/killrace.html, open it in a browser
```

Add `#debug` to the URL (`dist/killrace.html#debug`) to get `window.KR` in the
console. The tests use it to place cars and read game state.

## Modes

Pick the mode on the title screen (up/down, or 1/2, or tap it), then pick a
car in the garage (left/right, Enter to go, Esc to go back):

| Car | | |
|---|---|---|
| Sedan | 100 hp | quick, even, nothing special |
| Pickup | 150 hp | heavy and slow, starts with the pump, hits like a truck |
| Cruiser | 85 hp | fastest and sharpest, but light; rams hit harder |

- **Waves.** The Geckos send cars at you in waves. Survive as long as you can.
- **Race.** Three laps of eight checkpoints around the town against five armed
  racers: two sedans, a cruiser, a meat truck and a motorhome. Each checkpoint
  is a gate of burning barrels. The next one flashes, blinks on the radar, and
  has an arrow and distance at the top of the screen. Racers shoot and ram,
  and the motorhome rolls fuel drums out the back at whoever is behind it.
  Civilian traffic drives the same streets.

  The race runs on a **clock**, as in Carmageddon: 75 seconds at the start.
  Time is added for each checkpoint (+10), takedown (+10), wreck (+7),
  pedestrian (+2) and civilian car (+2). When it hits zero you're out.

  Wreck one racer and he's out; wreck all five and you win as the last car
  driving. Prize money is paid by finishing place, and the best winning time
  is saved.

## Controls

| Keyboard | Pad | Touch | |
|---|---|---|---|
| W / S | RT / LT | stick up / down | gas, brake, reverse |
| A / D | left stick | stick sideways | steer |
| Space, left click | A | Fire | fire |
| Shift | X | Nitro | nitro (meter refills) |
| X | B | | handbrake: the back end steps out |
| R | | | repair, $1000 for +30 |
| T | | | recover: back onto the road, $500 |
| E, right click | LB | Lock | lock on; guns swing up to ~25° onto the target |
| Q, 1–4, wheel | RB | Gun | twin AK / pump / dynamite / rockets |
| B | Y | Drum | drop a fuel drum behind you as a mine |
| H | Back | Horn | horn; pedestrians scatter |
| Esc / P | Start | Menu | pause |

## What's in the prototype

- **Driving model.** Rebuilt in this pass to feel like a car rather than a
  person on skates:
  - A steering wheel that turns at a limited rate, with less lock the faster
    you go. The turn rate comes from the wheelbase and wheel angle, capped by
    tyre grip, so a fast car pushes wide (understeer) instead of spinning on
    the spot.
  - Five gears with a short power cut on each shift. Engine pitch follows
    rpm.
  - Brakes that take about a second to stop from speed. Hold S at a
    standstill for a quarter second to reverse. Engine braking off the gas.
  - The handbrake breaks the rear loose for drifts. Drifting fills nitro
    (Full Auto's boost-for-style), and so does wrecking a car you just
    rammed.
  - The camera pitches under acceleration and braking and leans into
    corners.

  Sliding leaves tyre marks on the road. Nitro widens the field of view.
  Hard wall hits hurt and jolt the horizon.
- **Air.** Cars have height. Stepped plank kickers sit on the roads: ten
  around town, and one on most legs of the race course. They throw you as far
  as your speed allows. Explosions throw cars up and spin them, and a wrecked
  car goes up on its own fireball. In the air there's no grip. Landing hard
  hurts, and landing on another car crushes it. Air time pays cash and
  nitro, and wrecking a car while you're airborne is an AIRSTRIKE bonus.
  Cars at different heights pass over each other.
- **Homing rockets** (Twisted Metal). They home on your lock, or on the
  nearest target ahead. Ammo comes from the clip pickups. Rival racers and
  bosses fire them back now and then, with an INCOMING ROCKET warning and a
  red blip on the radar. Turn hard to shake one off.
- **Takedowns** (from Burnout 3). Wreck a car within 2.5 s of ramming it for a
  TAKEDOWN: full nitro, a cash bonus, a beat of slow motion and +10 s on
  the race clock. A racer you
  hit gets angry and comes after you for a few seconds; his outline flashes
  red and he blinks on the radar.
- **Gun heat** (from Vigilante 8). The twin AK overheats if you hold the
  trigger, then locks until it cools; the heat bar is under the ammo.
- **Civilian traffic.** Cars keep to the right-hand lane, turn at
  intersections, stop for pedestrians and cars ahead, and honk if you block
  them. Shoot at them and they panic and floor it. They're worth cash and
  time when wrecked.
- **The city.** 89×89 cells: a 4×4 grid of blocks, seven-lane roads,
  three-storey buildings with storefronts at street level and windows above,
  through-alleys, graffiti, posters, street lamps. Special blocks:
  - gas station: the pumps blow up
  - park: trees and burning barrels
  - car park
  - casino

  Cars are parked in the lot and along the curbs; they burn when shot and
  then explode.
- **Road hazards.** Fuel drums go off when shot or hit at speed and set off
  their neighbours. Oil slicks take your grip. Burning barrels hurt to drive
  through. Junk is scattered around.
- **Enemy cars.** Seven kinds:
  - sedans and pickups: gunners who line up a pass and shoot out the window
  - cruisers: rammers with flashing light-bar outlines
  - bikes: hang back and lob dynamite
  - motorhomes (from wave 3): slow and tough, drop fuel drums behind them
  - meat trucks (from wave 5): heavy rammers

  Every 4th wave a boss rig named after Bagman's bosses (Gila, Iguana,
  Komodo) leads the wave. Out of sight, enemy cars follow a driving-distance
  field toward you that keeps them in the lanes. They feel for walls and back
  out when stuck. Drivers have Bagman's lizard names, which show up when
  locked.
- **On foot.** Deputies and dogs are Bagman enemies running Bagman's own AI,
  unchanged. They spot you, flank, shoot and bite, and shoot each other by
  accident. Civilians are Bagman's thug and deputy sheets recoloured into
  four outfits.
- **Running things over.** Cars of any side kill people they hit fast enough.
  Fast hits gib. Roadkill and enemy kills feed Bagman's chain combos (KILL!
  ... MASSACRE!!!!!), and every 7th link gives slo-mo.
- **Pickups on every intersection, respawning arena-style.**
  - weapons: pump, dynamite
  - fuel-drum mines
  - repairs
  - armour
  - cash and kilos
  - power-ups: RAMPAGE (rams hit twice as hard, no crash damage),
    SLO-MO, FLAMER

  Wrecked enemy cars sometimes drop loot.
- **HUD.**
  - a heading-up radar: enemies, grey traffic, flashing angry racers
  - lock brackets and a boss health bar
  - speedometer, gear, nitro gauge and gun heat
  - wave status, or lap, position and the race clock
- **Title, pause and game-over screens.** The title plays over the live city.
  The best score is saved.

## How it's built

`src/manifest.txt` lists 48 pieces. **28 of them are BAGMAN files used
unchanged**: the page shell, CSS, font, the asset table, and 22 engine
scripts:
- the Spectrum palette and attribute clash
- the CRT tube
- bitmap text, asset loading, audio and sound effects
- the floor caster and sky
- sprites and particles, blood and scorch stains
- raycasting and collision
- graffiti placement
- the entire on-foot enemy AI

The touch pads come with Bagman's page shell. The car game is 19 new files in
`src/js/` (about 1,150 lines) plus its own page title.

The two games share one scope. Kill Race defines the functions Bagman's engine
calls back into (`hurtPlayer`, `hurtEnemy`, `wake`, `carHit`, `detonate`), so
Bagman deputies shoot at a car without knowing it's a car.

Three things had to be written new rather than reused:
- **Tall walls** (`render/walls.js`). Bagman's walls are one unit high with
  the eye at half height, which makes a city look knee-high. This version
  draws three storeys from the same textures.
- **Cars as boxes** (`render/carbox.js`). Bagman only has flat car pictures.
  Drawn as billboards, they snapped between views, and the side view (drawn
  at toy proportions) looked wrong. Every vehicle is now a real box: four
  faces projected in perspective column by column, the way Bagman casts
  walls, and depth-tested against them. Each face is textured from Bagman art:
  - fronts: the car sprites
  - rears: the same sprites with the headlights recoloured to tail lights
  - sides: the side sprite fitted to the car's real length and height, which
    turns the tall hatchback into a low sedan
  - the motorhome: a sedan nose under Bagman's RV wall
  - the meat truck: a pickup nose and wheels under the reefer trailer from
    the Cold Storage chapter

  The recolours are done at load time, the way Bagman makes its bosses.
- **The hood.** It's cast like a floor and painted from Bagman's red car wall
  texture.

No new art or sound files were made. OpenGameArt wasn't needed.

## Known limits and next steps

- **Flat world.** No ramps or jumps, and every building is the same height.
  Varying heights needs a multi-hit wall renderer; Bagman's sniper-mode
  renderer is most of one.
- **Box cars are boxes.** No roofline taper or wheel arches: the silhouette
  is a rectangle with the sprite's transparency cut out of it. Bikes are
  still billboards.
- **Traffic is simple.** It doesn't change lanes, and it follows its lane
  rather than the flow field, so a shunted car can sit on a pavement until it
  backs out.
- **Balance is first-pass.** Tuned against a bot that drives badly. Wave 1
  should be easy for a person with lock-on; nobody has played wave 6+.
- **Enemy cars only target you.** They don't fight each other, though their
  bullets and explosions do hurt each other.
- **No music.** Bagman has none either: beeper effects and ambience only.
- **Ideas:**
  - a fare-and-carnage taxi mode (Quarantine, the DOS game behind the
    idea)
  - per-car weapons and specials (Twisted Metal)
  - time trials on the race course, and more race routes
  - a pedestrian bounty mode
  - more maps in Bagman's level editor format
  - two-player split screen (the renderer is 320×200, so two views fit)
