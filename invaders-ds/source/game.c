#include "game.h"
#include <string.h>

GameOptions variantOptions(int offset)
{
    if (offset < 1) offset = 1;
    if (offset > 16) offset = 16;
    int n = offset - 1;
    GameOptions o;
    o.movingShields = (n & 1) != 0;
    o.zigzagBombs = (n & 2) != 0;
    o.fastBombs = (n & 4) != 0;
    o.invisibleInvaders = (n & 8) != 0;
    return o;
}

void gameSetOptions(GameWorld *g, GameOptions options)
{
    g->options = options;
}

bool gameAliensVisible(const GameWorld *g)
{
    if (!g->options.invisibleInvaders) return true;
    return g->flashTimer > 0;
}

void gameRngSeed(GameRng *rng, unsigned int seed)
{
    rng->state = seed ? seed : 0xA53A9E17u; // xorshift32 must never be seeded with exactly 0
}

unsigned int gameRngNext(GameRng *rng)
{
    unsigned int x = rng->state;
    x ^= x << 13;
    x ^= x >> 17;
    x ^= x << 5;
    rng->state = x;
    return x;
}

int dieRowPoints(int rowIndex)
{
    // aliens[] row index 0 is the TOP row (farthest from the ship,
    // i.e. the 2600 manual's "rear"), increasing toward the ship
    // (the "front"). 2600 scoring is 5/10/.../30 low-to-high, front
    // to rear -- so row 0 (rear) is worth the MOST, not the least.
    if (rowIndex < 0) rowIndex = 0;
    if (rowIndex >= ALIEN_ROWS) rowIndex = ALIEN_ROWS - 1;
    return (ALIEN_ROWS - rowIndex) * POINTS_PER_ROW_STEP;
}

// Lays out a fresh, fully-alive formation starting at g->waveTopY,
// and resets the per-wave movement state (direction, move timer) --
// shared by gameInit (wave 1) and gameStep's wave-advance path (every
// wave after), so the two can never drift out of sync with each other.
static void resetFormation(GameWorld *g)
{
    int gridW = ALIEN_COLS * ALIEN_W + (ALIEN_COLS - 1) * ALIEN_H_GAP;
    int startX = (FIELD_W - gridW) / 2;
    for (int row = 0; row < ALIEN_ROWS; row++)
    {
        for (int col = 0; col < ALIEN_COLS; col++)
        {
            Alien *a = &g->aliens[row * ALIEN_COLS + col];
            a->x = startX + col * (ALIEN_W + ALIEN_H_GAP);
            a->y = g->waveTopY + row * (ALIEN_H + ALIEN_V_GAP);
            a->alive = true;
        }
    }
    g->alienDX = 1;
    g->alienMoveTimer = ALIEN_MOVE_INTERVAL;
}

// Lays out 3 fresh, fully-intact shields, evenly spaced. Called
// alongside resetFormation (wave 1 and every wave after) -- shields
// reset fresh each wave, same as the formation itself, rather than
// carrying damage across a wave boundary.
static void resetShields(GameWorld *g)
{
    int totalW = SHIELD_COUNT * SHIELD_W + (SHIELD_COUNT - 1) * SHIELD_GAP;
    int startX = (FIELD_W - totalW) / 2;
    for (int s = 0; s < SHIELD_COUNT; s++)
    {
        g->shields[s].x = startX + s * (SHIELD_W + SHIELD_GAP);
        g->shields[s].destroyed = false;
        for (int r = 0; r < SHIELD_ROWS; r++)
            for (int c = 0; c < SHIELD_COLS; c++)
                g->shields[s].cells[r][c] = true;
    }
    g->shieldDX = 1; // only used when options.movingShields is set
}

bool shieldCellIntact(const GameWorld *g, int shieldIndex, int row, int col)
{
    if (shieldIndex < 0 || shieldIndex >= SHIELD_COUNT) return false;
    if (row < 0 || row >= SHIELD_ROWS || col < 0 || col >= SHIELD_COLS) return false;
    const Shield *s = &g->shields[shieldIndex];
    if (s->destroyed) return false;
    return s->cells[row][col];
}

// Checks a bullet's rect against one shield. Returns true (and erodes
// exactly one cell) if an INTACT cell absorbed the hit -- the bullet
// should be deactivated by the caller in that case. Returns false if
// the shield is destroyed, the bullet's rect doesn't reach the
// shield's bounding box at all, or it lands on a cell already eroded
// away (a bullet passing through a hole keeps going, matching "block
// your own shots" only where the shield is still actually there).
static bool shieldAbsorb(Shield *s, int bx, int by, int bw, int bh)
{
    if (s->destroyed) return false;
    int sx0 = s->x, sy0 = SHIELD_Y;
    int sx1 = sx0 + SHIELD_W, sy1 = sy0 + SHIELD_H;
    if (bx >= sx1 || bx + bw <= sx0 || by >= sy1 || by + bh <= sy0)
        return false;

    // Which cell the bullet's own center falls into -- a reasonable
    // simplification given the bullet is thin (BULLET_W) relative to
    // a cell (SHIELD_CELL_W), so it essentially never spans two cells
    // horizontally; clamped defensively in case that ever changes.
    int col = (bx + bw / 2 - sx0) / SHIELD_CELL_W;
    int row = (by + bh / 2 - sy0) / SHIELD_CELL_H;
    if (col < 0) col = 0;
    if (col >= SHIELD_COLS) col = SHIELD_COLS - 1;
    if (row < 0) row = 0;
    if (row >= SHIELD_ROWS) row = SHIELD_ROWS - 1;

    if (!s->cells[row][col]) return false; // already eroded away here -- bullet passes through
    s->cells[row][col] = false;
    return true;
}

static int rollCommandShipInterval(GameRng *rng)
{
    return COMMAND_SHIP_SPAWN_MIN +
        (int)(gameRngNext(rng) % (unsigned int)(COMMAND_SHIP_SPAWN_MAX - COMMAND_SHIP_SPAWN_MIN + 1));
}

void gameInit(GameWorld *g, unsigned int seed)
{
    memset(g, 0, sizeof(*g));
    g->status = GAME_PLAYING;
    g->shipW = SHIP_W;
    g->shipH = SHIP_H;
    g->shipX = FIELD_W / 2 - g->shipW / 2;
    g->lives = STARTING_LIVES;
    g->animFrame = 0;
    g->animTimer = ALIEN_ANIM_INTERVAL;
    g->wave = 1;
    g->waveTopY = ALIEN_TOP_Y;
    gameRngSeed(&g->rng, seed);
    resetFormation(g);
    resetShields(g);
    g->commandShipTimer = rollCommandShipInterval(&g->rng);
}

void gameSetDifficulty(GameWorld *g, bool advanced)
{
    g->advancedDifficulty = advanced;
    g->shipW = advanced ? SHIP_W * ADVANCED_SHIP_SCALE : SHIP_W;
    g->shipH = advanced ? SHIP_H * ADVANCED_SHIP_SCALE : SHIP_H;
    g->shipX = FIELD_W / 2 - g->shipW / 2; // re-center at the new width
}

void gameMoveShip(GameWorld *g, int dx)
{
    if (g->status != GAME_PLAYING) return;
    g->shipX += (dx > 0) ? SHIP_SPEED : -SHIP_SPEED;
    if (g->shipX < 0) g->shipX = 0;
    if (g->shipX > FIELD_W - g->shipW) g->shipX = FIELD_W - g->shipW;
}

void gameFire(GameWorld *g)
{
    if (g->status != GAME_PLAYING) return;
    if (g->playerBullet.active) return;
    g->playerBullet.x = g->shipX + g->shipW / 2 - BULLET_W / 2;
    g->playerBullet.y = SHIP_Y - BULLET_H;
    g->playerBullet.active = true;
}

void gamePauseToggle(GameWorld *g)
{
    if (g->status == GAME_PLAYING) g->status = GAME_PAUSED;
    else if (g->status == GAME_PAUSED) g->status = GAME_PLAYING;
}

int gameAliveAlienCount(const GameWorld *g)
{
    int n = 0;
    for (int i = 0; i < MAX_ALIENS; i++)
        if (g->aliens[i].alive) n++;
    return n;
}

static bool aabbOverlap(int ax, int ay, int aw, int ah, int bx, int by, int bw, int bh)
{
    return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

void gameStep(GameWorld *g)
{
    if (g->status != GAME_PLAYING) return;

    if (g->playerBullet.active)
    {
        g->playerBullet.y -= PLAYER_BULLET_SPEED;
        if (g->playerBullet.y + BULLET_H < 0)
            g->playerBullet.active = false;
    }
    if (g->alienBullet.active)
    {
        int speed = g->options.fastBombs ? ALIEN_BULLET_SPEED * FAST_BOMB_SPEED_MULTIPLIER : ALIEN_BULLET_SPEED;
        g->alienBullet.y += speed;
        if (g->alienBullet.y + BULLET_H > FIELD_H - STATUS_STRIP_H)
            g->alienBullet.active = false;

        if (g->alienBullet.active && g->options.zigzagBombs)
        {
            g->alienBullet.x += ZIGZAG_STEP * g->bulletZigzagDir;
            int offset = g->alienBullet.x - g->bulletZigzagOrigin;
            if (offset >= ZIGZAG_AMPLITUDE || offset <= -ZIGZAG_AMPLITUDE)
                g->bulletZigzagDir = -g->bulletZigzagDir;
        }
    }

    if (g->playerBullet.active)
    {
        for (int s = 0; s < SHIELD_COUNT; s++)
        {
            if (shieldAbsorb(&g->shields[s], g->playerBullet.x, g->playerBullet.y, BULLET_W, BULLET_H))
            {
                g->playerBullet.active = false;
                break;
            }
        }
    }
    if (g->alienBullet.active)
    {
        for (int s = 0; s < SHIELD_COUNT; s++)
        {
            if (shieldAbsorb(&g->shields[s], g->alienBullet.x, g->alienBullet.y, BULLET_W, BULLET_H))
            {
                g->alienBullet.active = false;
                break;
            }
        }
    }

    if (g->playerBullet.active)
    {
        for (int i = 0; i < MAX_ALIENS; i++)
        {
            Alien *a = &g->aliens[i];
            if (!a->alive) continue;
            if (aabbOverlap(g->playerBullet.x, g->playerBullet.y, BULLET_W, BULLET_H,
                             a->x, a->y, ALIEN_W, ALIEN_H))
            {
                a->alive = false;
                g->playerBullet.active = false;
                g->score += dieRowPoints(i / ALIEN_COLS);
                if (g->options.invisibleInvaders)
                    g->flashTimer = INVISIBLE_FLASH_DURATION;
                break;
            }
        }
    }
    if (g->playerBullet.active && g->commandShip.active &&
        aabbOverlap(g->playerBullet.x, g->playerBullet.y, BULLET_W, BULLET_H,
                    g->commandShip.x, g->commandShip.y, COMMAND_SHIP_W, COMMAND_SHIP_H))
    {
        g->playerBullet.active = false;
        g->commandShip.active = false;
        g->score += COMMAND_SHIP_POINTS;
        if (g->options.invisibleInvaders)
            g->flashTimer = INVISIBLE_FLASH_DURATION;
    }

    if (g->alienBullet.active &&
        aabbOverlap(g->alienBullet.x, g->alienBullet.y, BULLET_W, BULLET_H,
                    g->shipX, SHIP_Y, g->shipW, g->shipH))
    {
        g->alienBullet.active = false;
        g->lives--;
        if (g->lives <= 0)
        {
            g->status = GAME_LOST;
            return;
        }
    }

    if (gameAliveAlienCount(g) == 0)
    {
        g->wave++;
        int newTopY = g->waveTopY + WAVE_TOP_Y_STEP;
        if (newTopY > WAVE_MAX_TOP_Y) newTopY = WAVE_MAX_TOP_Y;
        g->waveTopY = newTopY;
        resetFormation(g);
        resetShields(g);
        // A fresh formation shouldn't have to contend with a bullet
        // left over from the wave that just ended.
        g->playerBullet.active = false;
        g->alienBullet.active = false;
        return;
    }

    g->alienMoveTimer--;
    if (g->alienMoveTimer <= 0)
    {
        // Difficulty ramp: fewer aliens left -> shorter interval
        // between steps, same classic Space Invaders feel, down to a
        // floor so it never becomes literally unplayable.
        int alive = gameAliveAlienCount(g);
        int interval = ALIEN_MOVE_INTERVAL * alive / MAX_ALIENS;
        if (interval < 4) interval = 4;
        g->alienMoveTimer = interval;

        bool wouldHitEdge = false;
        for (int i = 0; i < MAX_ALIENS; i++)
        {
            if (!g->aliens[i].alive) continue;
            int nextX = g->aliens[i].x + g->alienDX * ALIEN_H_STEP;
            if (nextX < 0 || nextX + ALIEN_W > FIELD_W)
            {
                wouldHitEdge = true;
                break;
            }
        }

        if (wouldHitEdge)
        {
            g->alienDX = -g->alienDX;
            for (int i = 0; i < MAX_ALIENS; i++)
                if (g->aliens[i].alive)
                    g->aliens[i].y += ALIEN_STEP_DOWN;
        }
        else
        {
            for (int i = 0; i < MAX_ALIENS; i++)
                if (g->aliens[i].alive)
                    g->aliens[i].x += g->alienDX * ALIEN_H_STEP;
        }

        for (int i = 0; i < MAX_ALIENS; i++)
        {
            if (g->aliens[i].alive && g->aliens[i].y + ALIEN_H >= SHIP_Y)
            {
                g->status = GAME_LOST;
                return;
            }
        }

        bool aliensReachedShields = false;
        for (int i = 0; i < MAX_ALIENS; i++)
        {
            if (g->aliens[i].alive && g->aliens[i].y + ALIEN_H >= SHIELD_Y)
            {
                aliensReachedShields = true;
                break;
            }
        }
        if (aliensReachedShields)
            for (int s = 0; s < SHIELD_COUNT; s++)
                g->shields[s].destroyed = true;
    }

    if (g->options.movingShields)
    {
        int leftEdge = g->shields[0].x;
        int rightEdge = g->shields[SHIELD_COUNT - 1].x + SHIELD_W;
        if (leftEdge + g->shieldDX * SHIELD_DRIFT_SPEED < 0 ||
            rightEdge + g->shieldDX * SHIELD_DRIFT_SPEED > FIELD_W)
            g->shieldDX = -g->shieldDX;
        for (int s = 0; s < SHIELD_COUNT; s++)
            g->shields[s].x += g->shieldDX * SHIELD_DRIFT_SPEED;
    }

    if (g->flashTimer > 0)
        g->flashTimer--;

    g->animTimer--;
    if (g->animTimer <= 0)
    {
        g->animTimer = ALIEN_ANIM_INTERVAL;
        g->animFrame = 1 - g->animFrame;
    }

    if (!g->alienBullet.active)
    {
        unsigned int roll = gameRngNext(&g->rng) % 1000;
        if (roll < ALIEN_FIRE_CHANCE_PER_1000)
        {
            int alive = gameAliveAlienCount(g);
            if (alive > 0)
            {
                unsigned int pick = gameRngNext(&g->rng) % (unsigned int)alive;
                unsigned int seen = 0;
                for (int i = 0; i < MAX_ALIENS; i++)
                {
                    if (!g->aliens[i].alive) continue;
                    if (seen == pick)
                    {
                        g->alienBullet.x = g->aliens[i].x + ALIEN_W / 2 - BULLET_W / 2;
                        g->alienBullet.y = g->aliens[i].y + ALIEN_H;
                        g->alienBullet.active = true;
                        g->bulletZigzagOrigin = g->alienBullet.x;
                        g->bulletZigzagDir = (gameRngNext(&g->rng) % 2 == 0) ? 1 : -1;
                        break;
                    }
                    seen++;
                }
            }
        }
    }

    if (g->commandShip.active)
    {
        g->commandShip.x += g->commandShip.dx * COMMAND_SHIP_SPEED;
        if (g->commandShip.x + COMMAND_SHIP_W < 0 || g->commandShip.x > FIELD_W)
            g->commandShip.active = false; // escaped off the far edge -- no points, it was never a real threat
    }

    g->commandShipTimer--;
    if (g->commandShipTimer <= 0)
    {
        // Re-rolled every time this fires, whether or not a ship is
        // currently on screen -- it's a periodic check, not something
        // that only becomes possible again after a kill. If one's
        // already active, this cycle just doesn't spawn a second one
        // on top of it.
        g->commandShipTimer = rollCommandShipInterval(&g->rng);
        if (!g->commandShip.active)
        {
            // "direction varies" per source material -- not always
            // the same edge or the same way across.
            bool fromLeft = (gameRngNext(&g->rng) % 2) == 0;
            g->commandShip.dx = fromLeft ? 1 : -1;
            g->commandShip.x = fromLeft ? -COMMAND_SHIP_W : FIELD_W;
            g->commandShip.y = COMMAND_SHIP_Y;
            g->commandShip.active = true;
        }
    }
}
