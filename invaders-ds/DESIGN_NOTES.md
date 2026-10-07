# Space Invaders (Atari 2600) — Design Reference & Project Scope

Digested from `Space_Invaders_Atari_2600_Deep_Dive.md` (uploaded to this
project) for the stated long-term goal: a homebrew remake of the
**Atari 2600** version specifically — not the Taito arcade original,
and not a generic "Space Invaders clone." This distinction matters
throughout: several of the 2600 version's most-cited traits (36
invaders, 6 rows, 3 shields, 6 point tiers) are direct *consequences*
of 1980 TIA/RAM constraints, not arbitrary design choices — see
Section 6 of the source doc. We're not bound by those constraints on
DS hardware, but "remake" means honoring what they produced, not
re-deriving arcade-style numbers because they're more familiar.

This file has two parts: (1) the concrete facts worth building
against, extracted from the source doc and organized for reference
during development rather than as prose; (2) a gap analysis and
phased scope against the current codebase (`/home/claude/invaders`,
the book-mode single-player prototype built earlier in this project).

---

## Part 1: What the 2600 version actually is

### Core loop
- Horizontal cannon, bottom of screen. Invaders descend, march
  side-to-side, step down at each screen edge.
- Loss conditions: invaders reach the bottom row (instant loss), OR
  cannon struck 3 times.
- Difficulty ramps *within* a wave as invaders are destroyed — fewer
  aliens remaining = faster formation movement, fastest at exactly 1
  remaining. This is independent of the variation system below.
- Clearing a wave starts a new one, beginning its descent **closer to
  the bottom** than the previous wave. Waves repeat indefinitely --
  there's no fixed "you win" endpoint in the base game.

### Formation (the single most load-bearing difference from arcade)
- **36 invaders: 6 rows x 6 columns** (arcade: 55, 5x11).
- **6 distinct sprite types, one per row** (arcade: 3 types shared
  across rows).
- Row scoring, front (bottom, closest to player) to rear (top,
  farthest): **5, 10, 15, 20, 25, 30** points. Full wave = 630 points.
  Note the direction: the *closest* row is worth the *least*, not the
  most — opposite of what "front row = biggest threat = biggest
  reward" intuition might suggest.
- Score display: 4 digits, visually caps at 9999 (underlying score can
  exceed that).

### Command Alien Ship
- Periodically flies across the top, direction varies (not always the
  same way).
- 200 points normally, 100 points in the two simultaneous-competitive
  2-player modes (categories C/D below).
- Never fires — pure risk/reward distraction (players fixating on it
  can miss a descending bomb).
- Score display hides while it's on screen, reappears after it exits
  or is destroyed.

### Shields (bunkers)
- **3** shields (arcade: 4), between cannon and invaders.
- Absorb both the player's shots and enemy bombs; erode visibly with
  damage; disappear entirely once invaders get close enough.
- In several variations (see the 4 binary modifiers below), shields
  additionally drift back and forth rather than staying fixed.

### Difficulty switches (separate from the 112 variations)
- Left/Right difficulty switches control cannon size: **Beginner** =
  normal size; **Advanced** = 2x size (bigger hitbox — a deliberate
  self-handicap for skilled players).
- One-player game: left switch only. Any 2-player mode: each switch
  independently sizes that player's own cannon.

### The 112 variations — the defining feature
This is the single most-cited trait of the cartridge and the part
most worth taking seriously in a remake, per the source doc's own
framing (Section 10: "one of the most extensive built-in replayability
structures of any single-cartridge game from the era").

**7 structural categories (A–G), 16 games each:**

| Cat | Games | Structure |
|---|---|---|
| A | 1–16 | Single player vs. computer. The "standard" mode. |
| B | 17–32 | Alternating turns, 2P. Each gets a full fresh wave+shields. Highest score across both turns wins. |
| C | 33–48 | Simultaneous competitive 2P, same wave. Hit-one → other player +200. Ends after 3 total hits combined, or invasion. |
| D | 49–64 | Same as C, but shots alternate — hesitate too long and your cannon auto-fires (can waste the shot). |
| E | 65–80 | 2P co-op, split movement: one player left-only, other right-only, either can fire. Shared cannon + score. |
| F | 81–96 | 2P co-op, alternating full turns: left player moves+fires one shot, then control passes to right player. |
| G | 97–112 | 2P co-op, split control: one player moves only, the other fires only. |

**4 binary modifiers**, combined in every permutation (2^4=16) within
each category block, at a *fixed offset* that repeats identically
across all 7 blocks:

| Offset → | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Moving Shields | | X | | X | | X | | X | | X | | X | | X | | X |
| Zigzag Bombs | | | X | X | | | X | X | | | X | X | | | X | X |
| Fast Bombs | | | | | X | X | X | X | | | | | X | X | X | X |
| Invisible Invaders | | | | | | | | | X | X | X | X | X | X | X | X |

So game offset 1 (in any category) is the plain baseline; offset 16 is
every modifier at once (called out by name in the original manual as
"a serious challenge"). This table is exactly reproducible in code —
it's a clean 4-bit lookup, not something requiring per-game special
casing.

**"Invisible Invaders" specifically**: sprites render invisible
during play; on any hit (invader or Command Ship), the *entire
remaining formation* flashes briefly visible before vanishing again.

---

## Part 2: Gap analysis against the current codebase

Current state (`/home/claude/invaders`, confirmed against source, not
memory): 6 cols x 3 rows = 18 aliens, flat 10 points per kill
regardless of row, no shields, no Command Ship, no variation system,
single-player only, book-mode (90°-rotated) layout and controls.

| 2600 trait | Current state | Gap |
|---|---|---|
| 36 invaders, 6 rows x 6 cols | 18 invaders, 3 rows x 6 cols | Need 3 more rows; also 3 more distinct sprite designs (currently reuses the same 3 sprite types extracted from the earlier sprite sheet, which only had that many variants readily usable) |
| Row-based scoring 5/10/15/20/25/30 | Flat 10/kill | Straightforward logic change once row-to-points mapping is decided |
| 3 shields, erode, optionally move | None | New game object entirely: position, per-cell damage state, erosion rule, optional drift |
| Command Ship, periodic, 200/100 pts | None | New entity: spawn timer, direction randomization, no-collision-with-player, score-display hide/show |
| Wave progression (repeat, start lower each time) | Single wave, game ends on win/loss | Needs a wave counter and a "restart formation at a lower start row" rule |
| Difficulty switches (cannon size) | N/A | Needs an equivalent input mapping decision (DS has no physical toggle switches) |
| 112 variations (7 structures x 16 modifiers) | N/A | The largest single piece of scope in this whole list |
| Screen orientation / input mapping | Book-mode (90° rotated), D-pad up/down = left/right | Was a deliberate earlier design choice for this project, unrelated to the 2600 source, which used standard landscape + paddle/joystick |

**What this is NOT flagging as gaps:** hardware-accuracy items like
the HMOVE comb artifact, TIA multi-copy sprite replication, or the
exact 1-bit/4-bit-volume audio channel limits. Those are *why* the
2600 version looks the way it does, not things a DS remake needs to
reproduce — the DS has real memory and real sprite hardware. Faking a
CRT-era rendering glitch on purpose would be a deliberate aesthetic
choice, not a fidelity requirement, and should be treated as one if it
ever comes up.

---

## Proposed phased scope

Ordered by what's structurally load-bearing first (things later
phases depend on) and by honoring the source doc's own framing of
what's *most* essential to the identity of this specific version.

1. **Formation fidelity**: 6 rows x 6 cols, 6 distinct sprite types,
   row-based scoring (5/10/15/20/25/30). This is the single most-cited
   difference from arcade and should come before anything else —
   everything downstream (shields, Command Ship, wave progression)
   assumes this shape.
2. **Shields**: 3 destructible bunkers with visible erosion. Stationary
   first; "moving shields" becomes one of the modifier toggles later,
   not built twice.
3. **Command Ship**: periodic top-of-screen flyover, direction
   randomized, score display hide/show while active.
4. **Wave progression**: repeat-forever loop, each new wave starting
   its descent lower than the last.
5. **The 112-variation system**: this is genuinely the largest phase
   and probably wants breaking down further once we're there — the 4
   binary modifiers (straightforward, a 4-bit lookup) are much less
   work than the 7 structural player-configuration categories
   (several of which imply real multiplayer-input-handling work: turn
   alternation, forced-timeout auto-fire in category D, split
   movement/fire control in E/G). Suggest tackling modifiers before
   structures, and category A/B before the more involved C/D/E/F/G.
6. **Difficulty switches equivalent**: smallest phase, but needs a
   decision (see open questions) since DS has no physical toggle
   switch to map this to directly.

## Open questions worth deciding before development resumes

- **Orientation/controls**: the current book-mode layout was this
  project's own earlier design choice, not drawn from the 2600
  source (which was standard landscape TV output with joystick/
  paddle input). Keep book-mode as this remake's own identity, or
  move to standard landscape to read as more directly "the 2600
  game"? Either is defensible; it's a call about what "remake" means
  here, not a fidelity requirement either way.
- **Strictness of fidelity**: the source doc's own homebrew-history
  section (8.4) documents this exact fork in the community — INV+
  prioritized gameplay-feel fidelity over visual accuracy; Space
  Instigators did the opposite. Worth deciding up front which axis
  this project weights more heavily when the two pull in different
  directions, rather than deciding case-by-case as it comes up.
- **Multiplayer categories B–G**: DS is a single-screen, single-player-
  at-a-time physical device. "2-player" here would mean local
  pass-and-play (category B fits naturally) or split-input schemes
  (E/G) that don't map obviously onto one set of DS controls without
  a real design pass of their own. Worth scoping as its own decision
  once phase 5 is reached, not assumed now.
- **How many of the 112 to actually implement**: the full matrix is
  mechanically simple (a lookup table), but categories C/D/E/F/G each
  carry real, distinct input-handling logic behind them. Worth
  deciding whether "112 variations" as a goal means the full matrix
  or a representative subset (e.g., category A's 16 plus category B)
  once the core single-player mode is solid.

No code changes made this turn, per the requested pause — this file is
meant to be the reference point when development resumes, so the next
session doesn't need to re-read the source doc from scratch.
