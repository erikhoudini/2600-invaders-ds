#include "game.h"
#include <stdio.h>

static int failures = 0;
#define CHECK(cond, msg) do { \
    if (!(cond)) { printf("FAIL: %s (line %d)\n", msg, __LINE__); failures++; } \
    else { printf("ok:   %s\n", msg); } \
} while (0)

static void testInit(void)
{
    GameWorld g;
    gameInit(&g, 1);
    CHECK(g.status == GAME_PLAYING, "starts in GAME_PLAYING");
    CHECK(gameAliveAlienCount(&g) == MAX_ALIENS, "all aliens start alive");
    CHECK(g.lives == STARTING_LIVES, "starts with STARTING_LIVES");
    CHECK(g.shipX >= 0 && g.shipX <= FIELD_W - SHIP_W, "ship starts within bounds");
    CHECK(!g.playerBullet.active && !g.alienBullet.active, "no bullets active at start");

    // Every alien must be fully within the field, and none overlapping --
    // a real layout bug (bad spacing math) would show up here.
    bool allInBounds = true, anyOverlap = false;
    for (int i = 0; i < MAX_ALIENS; i++)
    {
        Alien *a = &g.aliens[i];
        if (a->x < 0 || a->x + ALIEN_W > FIELD_W || a->y < 0) allInBounds = false;
        for (int j = i + 1; j < MAX_ALIENS; j++)
        {
            Alien *b = &g.aliens[j];
            if (a->x < b->x + ALIEN_W && a->x + ALIEN_W > b->x &&
                a->y < b->y + ALIEN_H && a->y + ALIEN_H > b->y)
                anyOverlap = true;
        }
    }
    CHECK(allInBounds, "every alien starts fully within the field");
    CHECK(!anyOverlap, "no two aliens start overlapping");
}

static void testShipMovementClamping(void)
{
    GameWorld g;
    gameInit(&g, 2);
    for (int i = 0; i < 200; i++) gameMoveShip(&g, -1);
    CHECK(g.shipX == 0, "ship clamps at the left edge, doesn't go negative");
    for (int i = 0; i < 200; i++) gameMoveShip(&g, 1);
    CHECK(g.shipX == FIELD_W - SHIP_W, "ship clamps at the right edge");

    g.status = GAME_PAUSED;
    int before = g.shipX;
    gameMoveShip(&g, -1);
    CHECK(g.shipX == before, "ship doesn't move while paused");
}

static void testFireSingleBulletAtATime(void)
{
    GameWorld g;
    gameInit(&g, 3);
    gameFire(&g);
    CHECK(g.playerBullet.active, "firing spawns a player bullet");
    int yAfterFirst = g.playerBullet.y;
    gameFire(&g); // should be a no-op, bullet already active
    CHECK(g.playerBullet.y == yAfterFirst, "firing again while a bullet is active does not reset/move it");

    g.status = GAME_PAUSED;
    Bullet before = g.playerBullet;
    gameFire(&g);
    CHECK(g.playerBullet.active == before.active, "firing while paused is a no-op");
}

static void testPauseToggle(void)
{
    GameWorld g;
    gameInit(&g, 4);
    gamePauseToggle(&g);
    CHECK(g.status == GAME_PAUSED, "pause toggles PLAYING -> PAUSED");
    gamePauseToggle(&g);
    CHECK(g.status == GAME_PLAYING, "pause toggles back PAUSED -> PLAYING");

    g.status = GAME_WON;
    gamePauseToggle(&g);
    CHECK(g.status == GAME_WON, "pause toggle is a no-op from GAME_WON");
    g.status = GAME_LOST;
    gamePauseToggle(&g);
    CHECK(g.status == GAME_LOST, "pause toggle is a no-op from GAME_LOST");
}

static void testStepDoesNothingUnlessPlaying(void)
{
    GameWorld g;
    gameInit(&g, 5);
    g.status = GAME_PAUSED;
    GameWorld before = g;
    gameStep(&g);
    CHECK(g.alienMoveTimer == before.alienMoveTimer && g.shipX == before.shipX,
          "gameStep is a complete no-op while paused");
}

static void testPlayerBulletKillsAlienAndScores(void)
{
    GameWorld g;
    gameInit(&g, 6);
    Alien *target = &g.aliens[0]; // row 0 = top/rearmost -> highest points
    // gameStep moves the bullet by PLAYER_BULLET_SPEED BEFORE checking
    // collision (correct, standard design: check at the new position,
    // not the old one) -- so position it PLAYER_BULLET_SPEED below
    // where it needs to land, not exactly at the target.
    g.playerBullet.active = true;
    g.playerBullet.x = target->x;
    g.playerBullet.y = target->y + PLAYER_BULLET_SPEED;
    gameStep(&g);
    CHECK(!target->alive, "a bullet overlapping an alien kills it");
    CHECK(!g.playerBullet.active, "the bullet is consumed on hit");
    CHECK(g.score == dieRowPoints(0), "killing a row-0 (rearmost) alien awards dieRowPoints(0), not a flat amount");
    CHECK(gameAliveAlienCount(&g) == MAX_ALIENS - 1, "alive count decrements by exactly one");
}

static void testRowScoring(void)
{
    // 2600 scoring: 5/10/15/20/25/30, front (bottom, closest to the
    // ship) to rear (top, farthest) -- row 0 in aliens[] is the top/
    // rearmost row here, so it should score HIGHEST, not lowest.
    CHECK(dieRowPoints(0) == 30, "row 0 (rearmost) is worth 30, the top tier");
    CHECK(dieRowPoints(ALIEN_ROWS - 1) == 5, "the bottom row (frontmost, closest to the ship) is worth only 5");
    CHECK(dieRowPoints(1) == 25 && dieRowPoints(2) == 20 && dieRowPoints(3) == 15 && dieRowPoints(4) == 10,
          "the middle rows step down in units of 5 between the two extremes");
    // Full wave value: 630 points for the base 2600 formation (36
    // aliens). This project's formation is also 6x6=36, so the same
    // total should hold exactly.
    int total = 0;
    for (int r = 0; r < ALIEN_ROWS; r++) total += ALIEN_COLS * dieRowPoints(r);
    CHECK(total == 630, "a full 6x6 wave is worth exactly 630 points, matching the 2600 original");
}

static void testAlienBulletHitsShipAndCostsALife(void)
{
    GameWorld g;
    gameInit(&g, 7);
    g.alienBullet.active = true;
    g.alienBullet.x = g.shipX;
    g.alienBullet.y = SHIP_Y;
    int livesBefore = g.lives;
    gameStep(&g);
    CHECK(!g.alienBullet.active, "the alien bullet is consumed on hitting the ship");
    CHECK(g.lives == livesBefore - 1, "a hit costs exactly one life");
    CHECK(g.status == GAME_PLAYING, "losing a life (not the last) does not end the game");
}

static void testLosingLastLifeEndsGame(void)
{
    GameWorld g;
    gameInit(&g, 8);
    g.lives = 1;
    g.alienBullet.active = true;
    g.alienBullet.x = g.shipX;
    g.alienBullet.y = SHIP_Y;
    gameStep(&g);
    CHECK(g.lives == 0, "lives reaches exactly 0, not negative");
    CHECK(g.status == GAME_LOST, "losing the last life ends the game as GAME_LOST");
}

static void testClearingAWaveContinuesRatherThanWinning(void)
{
    GameWorld g;
    gameInit(&g, 9);
    int scoreBefore = g.score;
    int livesBefore = g.lives;
    int waveBefore = g.wave;
    for (int i = 0; i < MAX_ALIENS; i++) g.aliens[i].alive = false;
    gameStep(&g);
    CHECK(g.status == GAME_PLAYING, "clearing every alien keeps the game in GAME_PLAYING, not GAME_WON -- there is no win state reachable through normal play");
    CHECK(g.wave == waveBefore + 1, "the wave counter increments");
    CHECK(gameAliveAlienCount(&g) == MAX_ALIENS, "a fresh, fully-alive formation spawns immediately");
    CHECK(g.score == scoreBefore && g.lives == livesBefore, "score and lives carry over unchanged into the new wave");
    CHECK(!g.playerBullet.active && !g.alienBullet.active, "leftover bullets from the cleared wave don't carry into the new one");
}

static void testWaveStartGetsLowerButStaysClamped(void)
{
    GameWorld g;
    gameInit(&g, 10);
    int firstTopY = g.waveTopY;
    for (int wave = 0; wave < 30; wave++) // far more than enough to hit the clamp
    {
        for (int i = 0; i < MAX_ALIENS; i++) g.aliens[i].alive = false;
        gameStep(&g);
    }
    CHECK(g.waveTopY > firstTopY, "after many cleared waves, the formation starts lower than wave 1 did");
    CHECK(g.waveTopY <= WAVE_MAX_TOP_Y, "the starting row never exceeds the computed safe maximum");

    // The clamp must actually leave room to play: even at the hardest
    // starting position, the formation's own bottom edge should sit
    // safely above the invasion-loss row, not right at or past it.
    int formationBottom = g.waveTopY + (ALIEN_ROWS - 1) * (ALIEN_H + ALIEN_V_GAP) + ALIEN_H;
    CHECK(formationBottom < SHIP_Y, "even the hardest wave-start position leaves the formation's bottom edge above the ship's row");
}

static void testBulletsExpireOffField(void)
{
    GameWorld g;
    gameInit(&g, 10);
    g.playerBullet.active = true;
    g.playerBullet.x = 50;
    g.playerBullet.y = 0;
    // Step enough times for it to travel off the top of the field.
    for (int i = 0; i < 50 && g.playerBullet.active; i++) gameStep(&g);
    CHECK(!g.playerBullet.active, "a player bullet that travels off the top of the field deactivates");

    gameInit(&g, 11);
    g.alienBullet.active = true;
    g.alienBullet.x = 50;
    g.alienBullet.y = FIELD_H - 5;
    for (int i = 0; i < 50 && g.alienBullet.active; i++) gameStep(&g);
    CHECK(!g.alienBullet.active, "an alien bullet that travels off the bottom of the field deactivates");
}

static void testAliensStayInBoundsWhileStepping(void)
{
    // Run a long simulation and check aliens never leave the field --
    // the edge-detection-then-reverse logic is exactly the kind of
    // thing that's easy to get off-by-one on.
    GameWorld g;
    gameInit(&g, 12);
    bool everOutOfBounds = false;
    for (int step = 0; step < 2000 && g.status == GAME_PLAYING; step++)
    {
        gameStep(&g);
        for (int i = 0; i < MAX_ALIENS; i++)
        {
            if (!g.aliens[i].alive) continue;
            if (g.aliens[i].x < 0 || g.aliens[i].x + ALIEN_W > FIELD_W)
                everOutOfBounds = true;
        }
    }
    CHECK(!everOutOfBounds, "aliens never leave the field horizontally across a long simulation");
}

static void testAlienInvasionEndsGame(void)
{
    GameWorld g;
    gameInit(&g, 13);
    // Force every alien down near the ship's row, then step once --
    // should trigger the invasion loss condition.
    for (int i = 0; i < MAX_ALIENS; i++)
        g.aliens[i].y = SHIP_Y - ALIEN_H;
    g.alienMoveTimer = 1; // force the movement branch to run this step
    gameStep(&g);
    CHECK(g.status == GAME_LOST, "aliens reaching the ship's row ends the game as GAME_LOST (invasion)");
}

static void testRngNeverGetsStuckAtZero(void)
{
    GameRng rng;
    gameRngSeed(&rng, 0);
    bool everZero = false;
    for (int i = 0; i < 1000; i++)
        if (gameRngNext(&rng) == 0) everZero = true;
    // A single 0 output is statistically fine; getting stuck (every
    // subsequent call also 0) is the real xorshift-seeded-with-0 bug.
    unsigned int last = gameRngNext(&rng);
    bool stuck = true;
    for (int i = 0; i < 10; i++)
        if (gameRngNext(&rng) != last) stuck = false;
    CHECK(!stuck, "seeding with 0 does not leave the RNG stuck repeating one value");
    (void)everZero;
}

static void testShieldsStartFullyIntact(void)
{
    GameWorld g;
    gameInit(&g, 20);
    bool allIntact = true;
    for (int s = 0; s < SHIELD_COUNT; s++)
        for (int r = 0; r < SHIELD_ROWS; r++)
            for (int c = 0; c < SHIELD_COLS; c++)
                if (!shieldCellIntact(&g, s, r, c)) allIntact = false;
    CHECK(allIntact, "every shield starts with every cell intact");
    CHECK(!shieldCellIntact(&g, -1, 0, 0), "an out-of-range shield index returns false, not garbage");
    CHECK(!shieldCellIntact(&g, 0, 99, 0), "an out-of-range row returns false, not garbage");
}

static void testPlayerBulletAbsorbedByShield(void)
{
    GameWorld g;
    gameInit(&g, 21);
    // Collision uses the bullet's CENTER, not its top edge, and the
    // check happens AFTER this step's movement -- values below were
    // computed directly (not hand-derived) to land the bullet's
    // center in row 0 once gameStep has moved it.
    g.playerBullet.active = true;
    g.playerBullet.x = g.shields[0].x + SHIELD_CELL_W / 2;
    g.playerBullet.y = 190;
    gameStep(&g);
    CHECK(!g.playerBullet.active, "a player bullet that reaches an intact shield cell is absorbed, not passed through");
    CHECK(!shieldCellIntact(&g, 0, 0, 0), "the specific cell that was hit is now eroded");
    CHECK(shieldCellIntact(&g, 0, 1, 0), "a different cell in the same shield is untouched");
}

static void testAlienBulletAbsorbedByShield(void)
{
    GameWorld g;
    gameInit(&g, 22);
    g.alienBullet.active = true;
    g.alienBullet.x = g.shields[1].x + SHIELD_CELL_W / 2;
    g.alienBullet.y = 181; // lands centered in row 0 after this step's move (see testPlayerBulletAbsorbedByShield)
    int livesBefore = g.lives;
    gameStep(&g);
    CHECK(!g.alienBullet.active, "an alien bullet absorbed by a shield never reaches the ship");
    CHECK(g.lives == livesBefore, "the ship takes no damage when a shield absorbs the shot meant for it");
    CHECK(!shieldCellIntact(&g, 1, 0, 0), "the cell that absorbed it is now eroded");
}

static void testBulletPassesThroughAlreadyErodedCell(void)
{
    GameWorld g;
    gameInit(&g, 23);
    g.shields[0].cells[0][0] = false; // pre-erode the cell this bullet will land in (row 0, col 0)
    g.playerBullet.active = true;
    g.playerBullet.x = g.shields[0].x + SHIELD_CELL_W / 2;
    g.playerBullet.y = 190;
    gameStep(&g);
    CHECK(g.playerBullet.active, "a bullet aimed at an already-eroded cell is not absorbed -- it keeps going");
}

static void testShieldsVanishWhenAliensGetClose(void)
{
    GameWorld g;
    gameInit(&g, 24);
    for (int i = 0; i < MAX_ALIENS; i++)
        g.aliens[i].y = SHIELD_Y - ALIEN_H; // right at the shields' row
    g.alienMoveTimer = 1; // force the movement/proximity-check branch to run this step
    gameStep(&g);
    bool allGone = true;
    for (int s = 0; s < SHIELD_COUNT; s++)
        for (int r = 0; r < SHIELD_ROWS; r++)
            for (int c = 0; c < SHIELD_COLS; c++)
                if (shieldCellIntact(&g, s, r, c)) allGone = false;
    CHECK(allGone, "once any alien reaches the shields' row, every shield vanishes entirely, not just erodes further");
}

static void testShieldsResetFreshEachWave(void)
{
    GameWorld g;
    gameInit(&g, 25);
    g.shields[0].cells[0][0] = false; // damage a shield mid-wave
    for (int i = 0; i < MAX_ALIENS; i++) g.aliens[i].alive = false;
    gameStep(&g); // triggers wave advance
    CHECK(shieldCellIntact(&g, 0, 0, 0), "shields come back fully intact on a fresh wave, not carrying damage over");
}

static void testCommandShipEventuallySpawns(void)
{
    GameWorld g;
    gameInit(&g, 30);
    bool everActive = false;
    // COMMAND_SHIP_SPAWN_MAX is the longest possible wait -- stepping
    // that many times plus one guarantees at least one spawn attempt,
    // regardless of exactly which random interval got rolled at init.
    for (int i = 0; i <= COMMAND_SHIP_SPAWN_MAX && !everActive; i++)
    {
        gameStep(&g);
        if (g.commandShip.active) everActive = true;
    }
    CHECK(everActive, "the Command Ship spawns within its documented maximum wait");
}

static void testCommandShipEntersFromAnEdgeMovingInward(void)
{
    GameWorld g;
    gameInit(&g, 31);
    g.commandShipTimer = 1;
    gameStep(&g); // forces a spawn attempt this exact step
    CHECK(g.commandShip.active, "forcing the timer to expire spawns a ship");
    bool validSpawn =
        (g.commandShip.x == -COMMAND_SHIP_W && g.commandShip.dx == 1) ||
        (g.commandShip.x == FIELD_W && g.commandShip.dx == -1);
    CHECK(validSpawn, "the ship starts just off one edge, moving inward from that same edge");
}

static void testCommandShipMovesAndEscapesWithoutScoring(void)
{
    GameWorld g;
    gameInit(&g, 32);
    g.commandShip.active = true;
    g.commandShip.dx = 1;
    g.commandShip.x = FIELD_W - COMMAND_SHIP_SPEED; // one step from fully exiting the right edge
    g.commandShip.y = COMMAND_SHIP_Y;
    int scoreBefore = g.score;
    gameStep(&g);
    CHECK(g.commandShip.x == FIELD_W - COMMAND_SHIP_SPEED + COMMAND_SHIP_SPEED, "the ship moves by COMMAND_SHIP_SPEED each step while active");

    // Push it further out until it actually escapes.
    for (int i = 0; i < 20 && g.commandShip.active; i++) gameStep(&g);
    CHECK(!g.commandShip.active, "the ship eventually escapes off the far edge");
    CHECK(g.score == scoreBefore, "escaping awards no points -- it was never a real threat");
}

static void testCommandShipDestroyedByPlayerBulletScoresExactly200(void)
{
    GameWorld g;
    gameInit(&g, 33);
    g.commandShip.active = true;
    g.commandShip.x = 50;
    g.commandShip.y = COMMAND_SHIP_Y;
    g.commandShip.dx = 1;
    g.playerBullet.active = true;
    g.playerBullet.x = 50;
    g.playerBullet.y = COMMAND_SHIP_Y + PLAYER_BULLET_SPEED; // lands inside the ship's rect after this step's move
    int scoreBefore = g.score;
    gameStep(&g);
    CHECK(!g.commandShip.active, "a player bullet destroys the Command Ship");
    CHECK(!g.playerBullet.active, "the bullet is consumed on the hit");
    CHECK(g.score == scoreBefore + COMMAND_SHIP_POINTS, "destroying it awards exactly COMMAND_SHIP_POINTS (200)");
}

// Not tested by simulation: "the Command Ship never fires" can't be
// meaningfully distinguished from "an ordinary alien happened not to
// fire this run" by observing alienBullet activity alone, since both
// draw from the same field. It holds by construction instead -- the
// Command Ship's own update code (see gameStep) only ever touches
// x/y/active, never alienBullet, so there's no path by which it could
// fire even in principle.

static void testCommandShipDoesNotDoubleSpawn(void)
{
    GameWorld g;
    gameInit(&g, 35);
    g.commandShip.active = true;
    g.commandShip.x = 80;
    g.commandShip.y = COMMAND_SHIP_Y;
    g.commandShip.dx = 1;
    g.commandShipTimer = 1;
    gameStep(&g); // timer expires while a ship is already active
    CHECK(g.commandShip.x == 80 + COMMAND_SHIP_SPEED,
          "when the spawn timer fires while a ship is already active, the existing ship just continues moving -- no second spawn overwrites it");
}

static void testVariantOptionsDecoding(void)
{
    // The full 16-column table, transcribed directly from the source
    // document (not re-derived), checked against the implementation.
    struct { int offset; bool ms, zz, fb, ii; } table[] = {
        {1,  false,false,false,false}, {2,  true, false,false,false},
        {3,  false,true, false,false}, {4,  true, true, false,false},
        {5,  false,false,true, false}, {6,  true, false,true, false},
        {7,  false,true, true, false}, {8,  true, true, true, false},
        {9,  false,false,false,true }, {10, true, false,false,true },
        {11, false,true, false,true }, {12, true, true, false,true },
        {13, false,false,true, true }, {14, true, false,true, true },
        {15, false,true, true, true }, {16, true, true, true, true },
    };
    bool allMatch = true;
    for (int i = 0; i < 16; i++)
    {
        GameOptions o = variantOptions(table[i].offset);
        if (o.movingShields != table[i].ms || o.zigzagBombs != table[i].zz ||
            o.fastBombs != table[i].fb || o.invisibleInvaders != table[i].ii)
        {
            printf("  offset %d mismatch\n", table[i].offset);
            allMatch = false;
        }
    }
    CHECK(allMatch, "all 16 variant offsets decode to exactly the source document's modifier table");
    GameOptions clampedHigh = variantOptions(99);
    CHECK(clampedHigh.movingShields && clampedHigh.zigzagBombs && clampedHigh.fastBombs && clampedHigh.invisibleInvaders,
          "an offset above 16 clamps to 16 (every modifier on), not undefined behavior");
}

static void testMovingShieldsDriftWhenEnabled(void)
{
    GameWorld g;
    gameInit(&g, 40);
    gameSetOptions(&g, (GameOptions){.movingShields = true});
    int startX = g.shields[0].x;
    for (int i = 0; i < 10; i++) gameStep(&g);
    CHECK(g.shields[0].x != startX, "with Moving Shields on, shields actually drift over time");
    int spacing1 = g.shields[1].x - g.shields[0].x;
    int spacing2 = g.shields[2].x - g.shields[1].x;
    CHECK(spacing1 == SHIELD_W + SHIELD_GAP && spacing2 == SHIELD_W + SHIELD_GAP,
          "the shields move as one row, preserving their fixed relative spacing");
}

static void testShieldsStayFixedWhenMovingShieldsOff(void)
{
    GameWorld g;
    gameInit(&g, 41); // options default to all-off from gameInit alone
    int startX = g.shields[0].x;
    for (int i = 0; i < 10; i++) gameStep(&g);
    CHECK(g.shields[0].x == startX, "without Moving Shields, shields stay exactly where they started");
}

static void testZigzagBombsOscillateWhenEnabled(void)
{
    GameWorld g;
    gameInit(&g, 42);
    gameSetOptions(&g, (GameOptions){.zigzagBombs = true});
    g.alienBullet.x = 90;
    g.alienBullet.y = 30;
    g.alienBullet.active = true;
    g.bulletZigzagOrigin = g.alienBullet.x;
    g.bulletZigzagDir = 1;
    int startX = g.alienBullet.x;
    bool everMoved = false;
    for (int i = 0; i < 30 && g.alienBullet.active; i++)
    {
        gameStep(&g);
        if (g.alienBullet.x != startX) everMoved = true;
    }
    CHECK(everMoved, "with Zigzag Bombs on, the bullet's X changes as it descends, not just its Y");
}

static void testBombsGoStraightDownWhenZigzagOff(void)
{
    GameWorld g;
    gameInit(&g, 43); // zigzag off by default
    g.alienBullet.active = true;
    g.alienBullet.x = 77;
    g.alienBullet.y = 30;
    for (int i = 0; i < 10; i++) gameStep(&g);
    CHECK(g.alienBullet.x == 77, "without Zigzag Bombs, an alien bullet's X never changes -- it falls straight down");
}

static void testFastBombsAreFaster(void)
{
    GameWorld normal, fast;
    gameInit(&normal, 44);
    gameInit(&fast, 44);
    gameSetOptions(&fast, (GameOptions){.fastBombs = true});
    normal.alienBullet.active = true; normal.alienBullet.x = 50; normal.alienBullet.y = 30;
    fast.alienBullet.active = true; fast.alienBullet.x = 50; fast.alienBullet.y = 30;
    gameStep(&normal);
    gameStep(&fast);
    int normalDelta = normal.alienBullet.y - 30;
    int fastDelta = fast.alienBullet.y - 30;
    CHECK(fastDelta == normalDelta * FAST_BOMB_SPEED_MULTIPLIER, "Fast Bombs move exactly FAST_BOMB_SPEED_MULTIPLIER times as far per step as normal bombs");
}

static void testInvisibleInvadersHideThenFlashOnHit(void)
{
    GameWorld g;
    gameInit(&g, 45);
    gameSetOptions(&g, (GameOptions){.invisibleInvaders = true});
    CHECK(!gameAliensVisible(&g), "with Invisible Invaders on, the formation starts invisible (no recent hit yet)");

    Alien *target = &g.aliens[0];
    g.playerBullet.active = true;
    g.playerBullet.x = target->x;
    g.playerBullet.y = target->y + PLAYER_BULLET_SPEED;
    gameStep(&g);
    CHECK(gameAliensVisible(&g), "a hit makes the formation flash visible immediately");

    for (int i = 0; i < INVISIBLE_FLASH_DURATION; i++) gameStep(&g);
    CHECK(!gameAliensVisible(&g), "the flash expires and the formation goes invisible again after INVISIBLE_FLASH_DURATION frames");
}

static void testAliensAlwaysVisibleWhenInvisibleOff(void)
{
    GameWorld g;
    gameInit(&g, 46); // invisibleInvaders off by default
    CHECK(gameAliensVisible(&g), "without Invisible Invaders, the formation is always visible");
    for (int i = 0; i < 30; i++) gameStep(&g);
    CHECK(gameAliensVisible(&g), "...and stays visible regardless of what else happens");
}

static void testDefaultDifficultyIsBeginnerSize(void)
{
    GameWorld g;
    gameInit(&g, 50); // no gameSetDifficulty call
    CHECK(g.shipW == SHIP_W && g.shipH == SHIP_H, "without calling gameSetDifficulty, the ship stays exactly the base Beginner size");
    CHECK(!g.advancedDifficulty, "advancedDifficulty defaults to false");
}

static void testAdvancedDifficultyDoublesSize(void)
{
    GameWorld g;
    gameInit(&g, 51);
    gameSetDifficulty(&g, true);
    CHECK(g.shipW == SHIP_W * ADVANCED_SHIP_SCALE && g.shipH == SHIP_H * ADVANCED_SHIP_SCALE,
          "Advanced difficulty scales both width and height by ADVANCED_SHIP_SCALE (2x) -- a bigger hitbox, per source material");
}

static void testShipRecentersWhenDifficultyChanges(void)
{
    GameWorld g;
    gameInit(&g, 52);
    int centerBefore = g.shipX + g.shipW / 2;
    gameSetDifficulty(&g, true);
    int centerAfter = g.shipX + g.shipW / 2;
    CHECK(centerBefore == centerAfter, "switching difficulty re-centers the ship at its new width, rather than leaving it lopsided");
}

static void testClampRespectsCurrentShipWidth(void)
{
    GameWorld beginner, advanced;
    gameInit(&beginner, 53);
    gameInit(&advanced, 53);
    gameSetDifficulty(&advanced, true);
    for (int i = 0; i < 200; i++) { gameMoveShip(&beginner, 1); gameMoveShip(&advanced, 1); }
    CHECK(beginner.shipX == FIELD_W - beginner.shipW, "a Beginner-size ship clamps at FIELD_W - its own (smaller) width");
    CHECK(advanced.shipX == FIELD_W - advanced.shipW, "an Advanced-size ship clamps at FIELD_W - its own (larger) width -- it can't travel as far right");
    CHECK(advanced.shipX < beginner.shipX, "the wider ship's clamped position is further left than the narrower ship's, since both stop at the same physical right edge");
}

static void testAdvancedShipIsEasierToHit(void)
{
    // The whole point of Advanced difficulty: a bullet that would
    // miss a Beginner-size ship should hit the same bullet aimed at
    // the same X against an Advanced-size one, because the hitbox is
    // genuinely bigger, not just visually bigger.
    GameWorld beginner, advanced;
    gameInit(&beginner, 54);
    gameInit(&advanced, 54);
    gameSetDifficulty(&advanced, true);
    // Aim just past the Beginner ship's right edge -- should miss it,
    // but land within the wider Advanced ship's right edge.
    int bx = beginner.shipX + beginner.shipW + 1;
    beginner.alienBullet.active = true; beginner.alienBullet.x = bx; beginner.alienBullet.y = SHIP_Y;
    advanced.alienBullet.active = true; advanced.alienBullet.x = bx; advanced.alienBullet.y = SHIP_Y;
    int livesBefore = beginner.lives;
    gameStep(&beginner);
    gameStep(&advanced);
    CHECK(beginner.lives == livesBefore, "a bullet just past the Beginner ship's edge misses it");
    CHECK(advanced.lives == livesBefore - 1, "the same bullet, same X, hits the wider Advanced ship -- confirming the hitbox is actually bigger, not just the sprite");
}

static void testBulletSpawnsCenteredOnCurrentShipWidth(void)
{
    GameWorld g;
    gameInit(&g, 55);
    gameSetDifficulty(&g, true);
    gameFire(&g);
    int expectedCenter = g.shipX + g.shipW / 2;
    int actualCenter = g.playerBullet.x + BULLET_W / 2;
    CHECK(actualCenter == expectedCenter, "a fired bullet spawns centered on the CURRENT ship width, not the base Beginner width");
}

int main(void)
{
    testInit();
    testShipMovementClamping();
    testFireSingleBulletAtATime();
    testPauseToggle();
    testStepDoesNothingUnlessPlaying();
    testPlayerBulletKillsAlienAndScores();
    testRowScoring();
    testAlienBulletHitsShipAndCostsALife();
    testLosingLastLifeEndsGame();
    testClearingAWaveContinuesRatherThanWinning();
    testWaveStartGetsLowerButStaysClamped();
    testBulletsExpireOffField();
    testAliensStayInBoundsWhileStepping();
    testAlienInvasionEndsGame();
    testRngNeverGetsStuckAtZero();
    testShieldsStartFullyIntact();
    testPlayerBulletAbsorbedByShield();
    testAlienBulletAbsorbedByShield();
    testBulletPassesThroughAlreadyErodedCell();
    testShieldsVanishWhenAliensGetClose();
    testShieldsResetFreshEachWave();
    testCommandShipEventuallySpawns();
    testCommandShipEntersFromAnEdgeMovingInward();
    testCommandShipMovesAndEscapesWithoutScoring();
    testCommandShipDestroyedByPlayerBulletScoresExactly200();
    testCommandShipDoesNotDoubleSpawn();
    testVariantOptionsDecoding();
    testMovingShieldsDriftWhenEnabled();
    testShieldsStayFixedWhenMovingShieldsOff();
    testZigzagBombsOscillateWhenEnabled();
    testBombsGoStraightDownWhenZigzagOff();
    testFastBombsAreFaster();
    testInvisibleInvadersHideThenFlashOnHit();
    testAliensAlwaysVisibleWhenInvisibleOff();
    testDefaultDifficultyIsBeginnerSize();
    testAdvancedDifficultyDoublesSize();
    testShipRecentersWhenDifficultyChanges();
    testClampRespectsCurrentShipWidth();
    testAdvancedShipIsEasierToHit();
    testBulletSpawnsCenteredOnCurrentShipWidth();

    printf("\n%d check(s) failed\n", failures);
    return failures ? 1 : 0;
}
