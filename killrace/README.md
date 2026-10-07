# KILL RACE

*Somewhere in Nevada. After dark.* A first-person car-combat prototype in the
spirit of Carmageddon and Twisted Metal. It runs on the BAGMAN engine and uses
only BAGMAN's art and sound.

You drive a red sedan through a night-time grid town with an AK out the
window. The Geckos send cars at you in waves. Deputies come out on foot, dogs
come off the leash, and civilians walk the sidewalks until you give them a
reason not to.

```sh
node tools/build.mjs killrace     # -> dist/killrace.html, open it in a browser
```

Add `#debug` to the URL (`dist/killrace.html#debug`) to get `window.KR` in the
console. The tests use it to place cars and read game state.

## Controls

| Keyboard | Pad | Touch | |
|---|---|---|---|
| W / S | RT / LT | stick up / down | gas, brake, reverse |
| A / D | left stick | stick sideways | steer |
| Space, left click | A | Fire | fire |
| Shift | X | Nitro | nitro (meter refills) |
| X | B | | handbrake: the back end steps out |
| E, right click | LB | Lock | lock on; guns swing up to ~25° onto the target |
| Q, 1–3, wheel | RB | Gun | twin AK / pump / dynamite |
| B | Y | Drum | drop a fuel drum behind you as a mine |
| H | Back | Horn | horn; pedestrians scatter |
| Esc / P | Start | Menu | pause |

## What's in the prototype

- **Driving model.** Throttle, brake and reverse; steering that tightens with
  speed; tyre grip that lets go on oil, on the handbrake, or at full lock at
  top speed. Sliding leaves tyre marks on the road. Nitro widens the field of
  view. Hard wall hits hurt and jolt the horizon.
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
- **Enemy cars.** Five kinds from Bagman's car sprites:
  - sedans and pickups: gunners who line up a pass and shoot out the window
  - cruisers: rammers with flashing light-bar outlines
  - bikes: hang back and lob dynamite

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
- **HUD.** A heading-up radar, lock brackets, a boss health bar, a
  speedometer and nitro gauge, and wave status.
- **Title, pause and game-over screens.** The title plays over the live city.
  The best score is saved.

## How it's built

`src/manifest.txt` lists 45 pieces. **28 of them are BAGMAN files used
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

The touch pads come with Bagman's page shell. The car game is 16 new files in
`src/js/` (about 850 lines) plus its own page title.

The two games share one scope. Kill Race defines the functions Bagman's engine
calls back into (`hurtPlayer`, `hurtEnemy`, `wake`, `carHit`, `detonate`), so
Bagman deputies shoot at a car without knowing it's a car.

Three things had to be written new rather than reused:
- **Tall walls** (`render/walls.js`). Bagman's walls are one unit high with
  the eye at half height, which makes a city look knee-high. This version
  draws three storeys from the same textures.
- **Cars as sprites from any angle.** Bagman only has front and side car art,
  so cars facing away use a copy of the front sheet with the headlights
  recoloured to tail lights. The yellow sedan's side view is the white one
  recoloured. Both are done at load time, the way Bagman makes its bosses.
- **The hood.** It's cast like a floor and painted from Bagman's red car wall
  texture.

No new art or sound files were made. OpenGameArt wasn't needed.

## Known limits and next steps

- **Flat world.** No ramps or jumps, and every building is the same height.
  Varying heights needs a multi-hit wall renderer; Bagman's sniper-mode
  renderer is most of one.
- **No tail-light-to-side blend.** Cars snap between front, side and rear
  views. Bagman has no three-quarter car art.
- **Balance is first-pass.** Tuned against a bot that drives badly. Wave 1
  should be easy for a person with lock-on; nobody has played wave 6+.
- **Enemy cars only target you.** They don't fight each other, though their
  bullets and explosions do hurt each other.
- **No music.** Bagman has none either: beeper effects and ambience only.
- **Ideas:** checkpoint races and time trials on the same streets (the
  "race" in Kill Race), a pedestrian bounty mode, more maps from Bagman's
  level editor format, two-player split screen (the renderer is
  320×200, so two views fit).
