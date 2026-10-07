// Space Invaders, book-mode layout. Pure game logic -- no DS types,
// no rendering, host-testable the same way as every other project
// this session. "Book mode" only affects rendering/input mapping in
// main.c; this file works in a plain logical coordinate space:
// FIELD_W (ship's left-right range) x FIELD_H (the ship-to-aliens
// firing corridor).
#ifndef GAME_H_INCLUDED
#define GAME_H_INCLUDED

#include <stdbool.h>

#define FIELD_W 192
#define FIELD_H 256

// The 4 binary modifiers, category-independent (apply the same way
// regardless of which of the 7 structural player-configuration
// categories A-G is active -- only category A, single player vs.
// computer, is implemented so far). Confirmed against the source
// document's 16-column table directly, not assumed: variantOptions
// decodes a 1-16 offset as a plain 4-bit binary counter on
// (offset-1), bit 0 = Moving Shields ... bit 3 = Invisible Invaders,
// and that decode was checked against all 16 columns of the actual
// table before being implemented this way.
typedef struct {
    bool movingShields;
    bool zigzagBombs;
    bool fastBombs;
    bool invisibleInvaders;
} GameOptions;

// offset: 1-16. Out-of-range values clamp into that range rather than
// reading undefined bits.
GameOptions variantOptions(int offset);

// Moving Shields: the whole shield row drifts together and bounces
// at the field edges, rather than staying fixed.
#define SHIELD_DRIFT_SPEED 1

// Zigzag Bombs: an alien bullet's X oscillates in a triangle wave as
// it descends, instead of falling straight down.
#define ZIGZAG_AMPLITUDE 12
#define ZIGZAG_STEP 1 // X change per frame while the bullet is active

// Fast Bombs: alien bullets simply move faster.
#define FAST_BOMB_SPEED_MULTIPLIER 2

// Invisible Invaders: the formation doesn't render during normal
// play; any hit (an alien or the Command Ship) flashes the entire
// remaining formation visible for FLASH_DURATION frames before it
// goes invisible again.
#define INVISIBLE_FLASH_DURATION 20

// Sprite scale: the real extracted sprites are small (8x10 aliens,
// 8x18 ship) -- displayed at 2x so they read clearly in the 192x256
// logical field, without needing to re-derive every layout constant
// from scratch. See sprites.h for the actual bitmap data.
#define SPRITE_SCALE 2

#define SHIP_W (8 * SPRITE_SCALE)
#define SHIP_H (18 * SPRITE_SCALE)
#define SHIP_Y (FIELD_H - 50) // fixed row near the "near" end of the corridor, leaving room for the status text below
#define SHIP_SPEED 3

// Difficulty switch equivalent: Beginner = normal cannon size,
// Advanced = 2x size -- a deliberate self-handicap (bigger hitbox),
// per source material. Stored as computed shipW/shipH on GameWorld
// (set via gameSetDifficulty) rather than SHIP_W/SHIP_H becoming
// runtime values directly, so every existing SHIP_W/SHIP_H use in
// this file that genuinely means "the base size" (e.g. sprite source
// dimensions) doesn't need touching -- only the handful of places
// that need the CURRENT size for this game go through g->shipW/shipH.
#define ADVANCED_SHIP_SCALE 2

#define ALIEN_COLS 6
#define ALIEN_ROWS 6
#define MAX_ALIENS (ALIEN_COLS * ALIEN_ROWS)
#define ALIEN_W (8 * SPRITE_SCALE)
#define ALIEN_H (10 * SPRITE_SCALE) // uniform cell using the tallest frame; the one 9-tall frame just sits 1px higher within it
#define ALIEN_H_GAP 6
#define ALIEN_V_GAP 6
#define ALIEN_TOP_Y 20
#define ALIEN_STEP_DOWN 10
#define ALIEN_MOVE_INTERVAL 18 // frames between horizontal alien steps -- speeds up as fewer remain, see gameStep
#define ALIEN_H_STEP 4
#define ALIEN_ANIM_INTERVAL 20 // frames between walk-cycle frame swaps, independent of movement timing

// Wave progression: clearing a wave starts a new one rather than
// ending the game, with the new formation starting its descent
// ROW_STEP_PER_WAVE closer to the ship than the previous wave's start
// -- matching the 2600 original (waves repeat indefinitely; each
// starts lower than the last). Clamped to WAVE_MAX_TOP_Y so this
// can't produce a wave that starts already unwinnable: the clamp
// leaves at least two of the in-play ALIEN_STEP_DOWN steps worth of
// room between the formation's starting bottom edge and the
// invasion-loss row, computed from the real formation/ship
// dimensions rather than a guessed constant.
#define WAVE_TOP_Y_STEP 8
#define ALIEN_FORMATION_H (ALIEN_ROWS * ALIEN_H + (ALIEN_ROWS - 1) * ALIEN_V_GAP)
// Invasion triggers once the closest row's y + ALIEN_H >= SHIP_Y,
// i.e. once topY + ALIEN_FORMATION_H >= SHIP_Y (ALIEN_FORMATION_H
// already spans from the top of row 0 to the bottom of the last row
// -- subtracting ALIEN_H a second time here double-counted it and
// silently made the clamp lower than wave 1's own starting position,
// which a host test caught).
#define WAVE_MAX_TOP_Y (SHIP_Y - ALIEN_FORMATION_H - 2 * ALIEN_STEP_DOWN)

#define BULLET_W (1 * SPRITE_SCALE)
#define BULLET_H (7 * SPRITE_SCALE)
#define PLAYER_BULLET_SPEED 6
#define ALIEN_BULLET_SPEED 3
#define ALIEN_FIRE_CHANCE_PER_1000 6 // per step, while no alien bullet is active

#define STARTING_LIVES 3

// Row-based scoring, front (bottom, closest to the ship) to rear
// (top, farthest) -- matching the 2600 original's 5/10/15/20/25/30
// point tiers, low to high, front to rear. See dieRowPoints() in
// game.c for the actual row-to-points mapping (row 0 in the aliens[]
// array is the TOP/rearmost row here, so the mapping is inverted
// relative to naive row-index order -- worth stating explicitly
// rather than leaving implicit in a lookup table).
#define POINTS_PER_ROW_STEP 5

// Height of the status text strip at the bottom of the field. Alien
// bullets despawn at this boundary (see gameStep) rather than
// continuing into it -- keeping bullets and the status text out of
// each other's space entirely, rather than needing the rendering
// layer to resolve which one wins when they'd otherwise overlap.
#define STATUS_STRIP_H 12

// Shields (bunkers): 3, sitting between the descending formation and
// the ship. Each is a small grid of destructible cells rather than a
// single hit-point blob, giving visible, localized erosion as it
// absorbs hits -- matching "erode visibly with damage" from the 2600
// source material. They block BOTH the player's own shots and alien
// bombs (confirmed directly from source material, not assumed), and
// the whole formation vanishes at once, rather than eroding further,
// once any alive alien's row reaches the shields' own row -- also
// directly from source material ("disappear entirely" once invaders
// get close, not just eroded further).
//
// Vertical placement is genuinely tight: the formation's own worst-
// case resting bottom edge (WAVE_MAX_TOP_Y + ALIEN_FORMATION_H = 186)
// sits only 20px above the ship's row (206). SHIELD_Y=188 was chosen
// to give wave 1 (formation bottom 170) real breathing room --
// roughly two ALIEN_STEP_DOWNs' worth -- while later waves
// legitimately encroach on the shields almost immediately, which is
// consistent with the intended escalating-difficulty feel rather
// than an oversight.
#define SHIELD_COUNT 3
#define SHIELD_COLS 4
#define SHIELD_ROWS 3
#define SHIELD_CELL_W 8
#define SHIELD_CELL_H 6
#define SHIELD_W (SHIELD_COLS * SHIELD_CELL_W)
#define SHIELD_H (SHIELD_ROWS * SHIELD_CELL_H)
#define SHIELD_Y 188
#define SHIELD_GAP 24 // horizontal gap between adjacent shields

typedef struct {
    int x; // left edge; y is always SHIELD_Y
    bool cells[SHIELD_ROWS][SHIELD_COLS]; // true = intact
    bool destroyed; // true once the alien formation reaches this row -- the whole shield vanishes, not just erodes further
} Shield;

// Command Ship: periodic flyover along the very top of the field,
// well above where the alien formation itself ever sits (formation
// starts at ALIEN_TOP_Y=20 at the earliest/highest; the ship flies at
// COMMAND_SHIP_Y=4, comfortably clear of it). Direction and which
// edge it starts from are randomized per spawn ("direction varies" --
// not always the same way, per source material). Never fires -- it's
// pure risk/reward, not a real threat -- and destroying it awards a
// flat 200 points (the 2600 source material's single-player value;
// the 100-point value only applies in the simultaneous-competitive
// 2P modes, out of scope for now). The score display is meant to
// hide while it's on screen (source material); that's a rendering
// concern driven off commandShip.active, not modeled here in game.c.
#define COMMAND_SHIP_W (12 * SPRITE_SCALE)
#define COMMAND_SHIP_H (4 * SPRITE_SCALE)
#define COMMAND_SHIP_Y 4
#define COMMAND_SHIP_SPEED 2
#define COMMAND_SHIP_POINTS 200
// Spawn timing: a countdown re-rolled (within a min/max range) each
// time it reaches zero, whether or not the previous ship was ever
// destroyed -- so it's a genuine periodic event, not something that
// only becomes possible again after a kill.
#define COMMAND_SHIP_SPAWN_MIN 600  // 10s at 60fps
#define COMMAND_SHIP_SPAWN_MAX 1200 // 20s at 60fps

typedef struct {
    int x, y;
    bool active;
    int dx; // +1 or -1
} CommandShip;

typedef struct { unsigned int state; } GameRng;
void gameRngSeed(GameRng *rng, unsigned int seed);
unsigned int gameRngNext(GameRng *rng); // exposed for tests; gameStep uses it internally

typedef struct {
    int x, y; // top-left
    bool alive;
} Alien;

typedef struct {
    int x, y; // top-left
    bool active;
} Bullet;

typedef enum {
    GAME_PLAYING,
    GAME_PAUSED,
    GAME_WON,
    GAME_LOST,
} GameStatus;

typedef struct {
    GameStatus status;
    int shipX;
    Alien aliens[MAX_ALIENS];
    Bullet playerBullet;
    Bullet alienBullet;
    int alienDX;       // +1 or -1, current horizontal direction
    int alienMoveTimer; // counts down to the next horizontal step
    int animFrame;       // 0 or 1 -- which walk-cycle frame to draw
    int animTimer;        // counts down to the next frame swap, independent of movement
    int score;
    int lives;
    int wave;          // 1-based; increments each time a formation is fully cleared
    int waveTopY;       // current formation's starting row, tracked so the next wave can start lower (clamped -- see WAVE_MAX_TOP_Y)
    Shield shields[SHIELD_COUNT];
    int shieldDX; // +1 or -1, current drift direction -- only used when options.movingShields is set
    CommandShip commandShip;
    int commandShipTimer; // counts down to the next spawn (re-rolled each time it fires, see gameStep)
    int bulletZigzagDir;    // +1 or -1 -- only used when options.zigzagBombs is set
    int bulletZigzagOrigin; // the X the current alien bullet's zigzag bounces around (set at spawn)
    int flashTimer;          // frames remaining to show the formation -- only used when options.invisibleInvaders is set
    GameOptions options;
    bool advancedDifficulty;
    int shipW, shipH; // computed from advancedDifficulty (see gameSetDifficulty) -- the actual current cannon size, not the base SHIP_W/SHIP_H
    GameRng rng;
} GameWorld;

void gameInit(GameWorld *g, unsigned int seed);

// Sets Beginner (false, normal size) or Advanced (true, 2x size --
// a deliberate self-handicap, bigger hitbox) cannon size for the
// CURRENT game. Call right after gameInit, before any gameStep, same
// as gameSetOptions -- recomputes g->shipW/shipH and re-centers the
// ship at its (possibly now different) width so it doesn't end up
// partially off-field or asymmetrically placed.
void gameSetDifficulty(GameWorld *g, bool advanced);

// Sets the active variant's modifiers (see variantOptions) for the
// CURRENT game -- call right after gameInit, before any gameStep.
// Kept separate from gameInit's own signature so existing callers
// (including every host test written before this) keep compiling
// unchanged and default to no modifiers active, rather than needing
// every call site updated for a parameter most of them don't care
// about.
void gameSetOptions(GameWorld *g, GameOptions options);

// dx: -1 or +1 (or any nonzero sign -- only the sign is used). No-op
// while not GAME_PLAYING. Clamps the ship within [0, FIELD_W-SHIP_W].
void gameMoveShip(GameWorld *g, int dx);

// No-op if a player bullet is already active, or not GAME_PLAYING --
// classic single-shot-at-a-time constraint.
void gameFire(GameWorld *g);

// Toggles GAME_PLAYING <-> GAME_PAUSED. No-op if GAME_WON/GAME_LOST
// (use gameInit to start a fresh game from those states instead).
void gamePauseToggle(GameWorld *g);

// Advances one frame: moves bullets, checks collisions (including
// shields and the Command Ship), advances aliens on their own timer,
// maybe fires an alien bullet, periodically spawns/moves the Command
// Ship, and checks loss. Clearing every alien starts a new wave (see
// WAVE_TOP_Y_STEP) rather than ending the game -- there is no
// GAME_WON state reachable through normal play; waves repeat
// indefinitely, matching the 2600 original. No-op unless GAME_PLAYING.
void gameStep(GameWorld *g);

int gameAliveAlienCount(const GameWorld *g);

// Points awarded for destroying an alien in the given row index (0 =
// top/rearmost row in aliens[], increasing toward the ship) --
// 5/10/15/20/25/30 low-to-high, front (bottom, closest to the ship)
// to rear (top, farthest), matching the 2600 original. Exposed
// (rather than kept file-local) so tests can verify the row->points
// mapping directly against the source values, not just indirectly
// through a kill's resulting score.
int dieRowPoints(int rowIndex);

// True if the given shield's given cell is currently intact (i.e.
// should render, and would still block a bullet). Out-of-range
// shield/row/col, or a destroyed shield, both return false rather
// than reading out of bounds.
bool shieldCellIntact(const GameWorld *g, int shieldIndex, int row, int col);

// True if the alien formation should currently be rendered visible.
// Always true unless options.invisibleInvaders is set, in which case
// it's only true during the brief post-hit flash window (see
// flashTimer / INVISIBLE_FLASH_DURATION) -- exposed so the rendering
// layer doesn't need to know about flashTimer's internals directly.
bool gameAliensVisible(const GameWorld *g);

#endif
