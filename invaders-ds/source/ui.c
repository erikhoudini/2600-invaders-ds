#include "ui.h"
#include "rotate.h"
#include "sprites.h"
#include <string.h>
#include <stdio.h>

static void drawSpriteScaled(u16 *fb, int lx, int ly, const Sprite *s, int scale)
{
    for (int row = 0; row < s->h; row++)
        for (int col = 0; col < s->w; col++)
            if ((s->rows[row] >> (s->w - 1 - col)) & 1)
                for (int sy = 0; sy < scale; sy++)
                    for (int sx = 0; sx < scale; sx++)
                        plotLogical(fb, lx + col * scale + sx, ly + row * scale + sy, s->color);
}

static void drawSprite(u16 *fb, int lx, int ly, const Sprite *s)
{
    drawSpriteScaled(fb, lx, ly, s, SPRITE_SCALE);
}

// Same verified 5x7 pixel font used throughout this style family --
// only the subset needed here (A-Z, 0-9, space) is included.
static const u8 FONT5X7[37][7] = {
    {0x0E,0x11,0x11,0x1F,0x11,0x11,0x11}, {0x1E,0x11,0x11,0x1E,0x11,0x11,0x1E},
    {0x0F,0x10,0x10,0x10,0x10,0x10,0x0F}, {0x1E,0x11,0x11,0x11,0x11,0x11,0x1E},
    {0x1F,0x10,0x10,0x1E,0x10,0x10,0x1F}, {0x1F,0x10,0x10,0x1E,0x10,0x10,0x10},
    {0x0F,0x10,0x10,0x17,0x11,0x11,0x0F}, {0x11,0x11,0x11,0x1F,0x11,0x11,0x11},
    {0x1F,0x04,0x04,0x04,0x04,0x04,0x1F}, {0x07,0x02,0x02,0x02,0x02,0x12,0x0C},
    {0x11,0x12,0x14,0x18,0x14,0x12,0x11}, {0x10,0x10,0x10,0x10,0x10,0x10,0x1F},
    {0x11,0x1B,0x15,0x11,0x11,0x11,0x11}, {0x11,0x19,0x15,0x13,0x11,0x11,0x11},
    {0x0E,0x11,0x11,0x11,0x11,0x11,0x0E}, {0x1E,0x11,0x11,0x1E,0x10,0x10,0x10},
    {0x0E,0x11,0x11,0x11,0x15,0x12,0x0D}, {0x1E,0x11,0x11,0x1E,0x14,0x12,0x11},
    {0x0F,0x10,0x10,0x0E,0x01,0x01,0x1E}, {0x1F,0x04,0x04,0x04,0x04,0x04,0x04},
    {0x11,0x11,0x11,0x11,0x11,0x11,0x0E}, {0x11,0x11,0x11,0x11,0x11,0x0A,0x04},
    {0x11,0x11,0x11,0x15,0x15,0x1B,0x11}, {0x11,0x11,0x0A,0x04,0x0A,0x11,0x11},
    {0x11,0x11,0x0A,0x04,0x04,0x04,0x04}, {0x1F,0x01,0x02,0x04,0x08,0x10,0x1F},
    {0x0E,0x11,0x13,0x15,0x19,0x11,0x0E}, {0x04,0x0C,0x04,0x04,0x04,0x04,0x0E},
    {0x0E,0x11,0x01,0x02,0x04,0x08,0x1F}, {0x0E,0x11,0x01,0x06,0x01,0x11,0x0E},
    {0x02,0x06,0x0A,0x12,0x1F,0x02,0x02}, {0x1F,0x10,0x1E,0x01,0x01,0x11,0x0E},
    {0x06,0x08,0x10,0x1E,0x11,0x11,0x0E}, {0x1F,0x01,0x02,0x04,0x04,0x04,0x04},
    {0x0E,0x11,0x11,0x0E,0x11,0x11,0x0E}, {0x0E,0x11,0x11,0x0F,0x01,0x02,0x0C},
    {0x00,0x00,0x00,0x00,0x00,0x00,0x00},
};
#define GLYPH_W 5
#define GLYPH_H 7

static int charToGlyphIndex(char c)
{
    if (c >= 'A' && c <= 'Z') return c - 'A';
    if (c >= '0' && c <= '9') return 26 + (c - '0');
    return 36;
}

static void fillRectLogical(u16 *fb, int x0, int y0, int x1, int y1, u16 color)
{
    for (int y = y0; y <= y1; y++)
        for (int x = x0; x <= x1; x++)
            plotLogical(fb, x, y, color);
}

// Fast path for the one call site that's provably always exactly the
// full field (never partial, never out of range by construction) --
// skips the per-pixel bounds check plotLogical otherwise always pays.
static void clearFieldFast(u16 *fb)
{
    for (int ly = 0; ly < LOGICAL_H; ly++)
        for (int lx = 0; lx < LOGICAL_W; lx++)
            plotLogicalUnchecked(fb, lx, ly, COLOR_BLACK);
}

// The alien block only ever occupies this region (verified against
// the actual gameplay bounds: aliens start at ALIEN_TOP_Y and the
// invasion-loss check triggers once any alien's y reaches SHIP_Y -
// ALIEN_H, so they're never drawn below that) -- redrawing this
// bounded sub-region instead of the whole field is the main saving.
// The arena must cover every row an alien's sprite could actually
// occupy -- not a guessed margin. Aliens trigger invasion-loss once
// y + ALIEN_H >= SHIP_Y (see gameStep), so the highest y an alien can
// still be drawn at is SHIP_Y - ALIEN_H, and its sprite's lowest row
// at that position is (SHIP_Y - ALIEN_H) + ALIEN_H - 1 = SHIP_Y - 1.
// The original 190 was a guess that didn't actually reach this,
// letting an alien's own sprite silently bleed past the boundary the
// same way a bullet's could -- found by the same mechanical test.
#define ALIEN_ARENA_Y1 (SHIP_Y - 1)

static void drawShields(u16 *fb, const GameWorld *g)
{
    for (int s = 0; s < SHIELD_COUNT; s++)
        for (int r = 0; r < SHIELD_ROWS; r++)
            for (int c = 0; c < SHIELD_COLS; c++)
                if (shieldCellIntact(g, s, r, c))
                {
                    int x0 = g->shields[s].x + c * SHIELD_CELL_W;
                    int y0 = SHIELD_Y + r * SHIELD_CELL_H;
                    fillRectLogical(fb, x0, y0, x0 + SHIELD_CELL_W - 1, y0 + SHIELD_CELL_H - 1, COLOR_WHITE);
                }
}

static void redrawAlienArena(u16 *fb, const GameWorld *g)
{
    fillRectLogical(fb, 0, 0, LOGICAL_W - 1, ALIEN_ARENA_Y1, COLOR_BLACK);
    if (gameAliensVisible(g))
    {
        for (int i = 0; i < MAX_ALIENS; i++)
        {
            const Alien *a = &g->aliens[i];
            if (!a->alive) continue;
            int row = i / ALIEN_COLS;
            row = row % 3; // only 3 sprite types exist; cycle rather than flatten rows 3-5 to a single repeated look
            drawSprite(fb, a->x, a->y, &ALIEN_SPRITES[row][g->animFrame]);
        }
    }
    // SHIELD_Y..SHIELD_Y+SHIELD_H falls entirely within this same
    // region (SHIELD_Y=188 < ALIEN_ARENA_Y1), so shields are drawn
    // here too -- this redraw is the only thing that ever touches
    // these rows, so it must be self-contained for anything
    // positioned in them, same reasoning as the bullets below.
    drawShields(fb, g);
    // The Command Ship flies at COMMAND_SHIP_Y=4, also within this
    // same region -- same self-containment reasoning as shields and
    // bullets above.
    if (g->commandShip.active)
        drawSprite(fb, g->commandShip.x, g->commandShip.y, &COMMAND_SHIP_SPRITE);
    // Bullets currently within this same region need drawing here --
    // this redraw is the only thing that ever touches these rows, so
    // it must be self-contained for anything positioned in them, not
    // just aliens.
    if (g->playerBullet.active && g->playerBullet.y <= ALIEN_ARENA_Y1)
        drawSprite(fb, g->playerBullet.x, g->playerBullet.y, &BULLET_SPRITE);
    if (g->alienBullet.active && g->alienBullet.y <= ALIEN_ARENA_Y1)
        drawSprite(fb, g->alienBullet.x, g->alienBullet.y, &BULLET_SPRITE);
}

static void drawGlyph(u16 *fb, int x0, int y0, int glyphIndex, int scale, u16 color)
{
    const u8 *rows = FONT5X7[glyphIndex];
    for (int row = 0; row < GLYPH_H; row++)
        for (int col = 0; col < GLYPH_W; col++)
            if ((rows[row] >> (GLYPH_W - 1 - col)) & 1)
                for (int sy = 0; sy < scale; sy++)
                    for (int sx = 0; sx < scale; sx++)
                        plotLogical(fb, x0 + col * scale + sx, y0 + row * scale + sy, color);
}

void uiDrawText(u16 *fb, int lx, int ly, const char *text, int scale, u16 color)
{
    int advance = (GLYPH_W + 1) * scale;
    int cx = lx;
    for (const char *c = text; *c; c++)
    {
        drawGlyph(fb, cx, ly, charToGlyphIndex(*c), scale, color);
        cx += advance;
    }
}

int uiTextWidth(const char *text, int scale)
{
    int len = (int)strlen(text);
    if (len == 0) return 0;
    int advance = (GLYPH_W + 1) * scale;
    return len * advance - scale;
}

static void drawCenteredX(u16 *fb, int centerX, int y, const char *text, int scale, u16 color)
{
    int w = uiTextWidth(text, scale);
    uiDrawText(fb, centerX - w / 2, y, text, scale, color);
}

void uiDrawFieldFull(u16 *fb, const GameWorld *g)
{
    clearFieldFast(fb);
    drawSpriteScaled(fb, g->shipX, SHIP_Y, &SHIP_SPRITE, g->advancedDifficulty ? SPRITE_SCALE * ADVANCED_SHIP_SCALE : SPRITE_SCALE);
    if (gameAliensVisible(g))
    {
        for (int i = 0; i < MAX_ALIENS; i++)
        {
            const Alien *a = &g->aliens[i];
            if (!a->alive) continue;
            int row = i / ALIEN_COLS;
            row = row % 3; // only 3 sprite types exist; cycle rather than flatten rows 3-5 to a single repeated look
            drawSprite(fb, a->x, a->y, &ALIEN_SPRITES[row][g->animFrame]);
        }
    }
    drawShields(fb, g);
    if (g->commandShip.active)
        drawSprite(fb, g->commandShip.x, g->commandShip.y, &COMMAND_SHIP_SPRITE);
    if (g->playerBullet.active)
        drawSprite(fb, g->playerBullet.x, g->playerBullet.y, &BULLET_SPRITE);
    if (g->alienBullet.active)
        drawSprite(fb, g->alienBullet.x, g->alienBullet.y, &BULLET_SPRITE);
    char status[24];
    if (g->commandShip.active)
        snprintf(status, sizeof(status), "LIVES %d", g->lives); // score display hides while the Command Ship is on screen (source material)
    else
        snprintf(status, sizeof(status), "SCORE %d  LIVES %d", g->score, g->lives);
    uiDrawText(fb, 6, LOGICAL_H - 10, status, 1, COLOR_WHITE);
}

// The per-frame path while GAME_PLAYING: only erases/redraws the
// regions that actually changed since `prev`, instead of clearing
// and redrawing the entire 192x256 field every frame regardless of
// whether anything moved. That unconditional full clear was the same
// root-cause pattern (excessive guaranteed-every-frame work with no
// margin against the vblank budget) that caused a real black-screen
// bug in an earlier, unrelated project in this style family -- there
// it was expensive trig calls: no trig here, but 49152 bounds-checked
// pixel writes plus every sprite, every single frame, unconditionally,
// is the same shape of problem with a different expensive ingredient.
void uiDrawFieldDelta(u16 *fb, const GameWorld *g, const GameWorld *prev)
{
    // Everything below the arena (ship, both bullets, status text) is
    // cleared and redrawn together, unconditionally, every frame,
    // rather than tracking each element's own dirty rectangle
    // independently. That per-element approach went through several
    // real, mechanically-verified bugs before landing here: a
    // bullet's erase clipping an alien it was only passing near (not
    // colliding with), the same for the status text, and the same
    // again for the ship -- every one of them a different pairwise
    // interaction between two elements whose regions could overlap.
    // Rather than keep finding and patching them one at a time, this
    // region is small enough (65 of the field's 256 rows, about a
    // quarter of a full clear) that redrawing it as a single unit
    // removes the whole bug class at once: nothing here has a
    // "previous position" for anything else to accidentally clip.
    // Bullets are only drawn here if their CURRENT position actually
    // falls in this region -- one within the arena's range is handled
    // by the arena's own redraw below instead.
    //
    // Deliberately done BEFORE the arena redraw, not after: a
    // bullet's sprite height means one whose top-Y puts it in the
    // arena can still have its bottom few rows bleed past row 190
    // into this region. If this clear ran second, it would clip that
    // overflow off a bullet the arena redraw had just correctly drawn
    // a moment before. Running this first means the arena redraw (if
    // it happens) draws on top last, so any such overflow simply
    // persists unclipped.
    fillRectLogical(fb, 0, ALIEN_ARENA_Y1 + 1, LOGICAL_W - 1, LOGICAL_H - 1, COLOR_BLACK);
    drawSpriteScaled(fb, g->shipX, SHIP_Y, &SHIP_SPRITE, g->advancedDifficulty ? SPRITE_SCALE * ADVANCED_SHIP_SCALE : SPRITE_SCALE);
    if (g->playerBullet.active && g->playerBullet.y > ALIEN_ARENA_Y1)
        drawSprite(fb, g->playerBullet.x, g->playerBullet.y, &BULLET_SPRITE);
    if (g->alienBullet.active && g->alienBullet.y > ALIEN_ARENA_Y1)
        drawSprite(fb, g->alienBullet.x, g->alienBullet.y, &BULLET_SPRITE);
    char status[24];
    if (g->commandShip.active)
        snprintf(status, sizeof(status), "LIVES %d", g->lives); // score display hides while the Command Ship is on screen (source material)
    else
        snprintf(status, sizeof(status), "SCORE %d  LIVES %d", g->score, g->lives);
    uiDrawText(fb, 6, LOGICAL_H - 10, status, 1, COLOR_WHITE);

    bool aliensChanged = (g->animFrame != prev->animFrame);
    if (!aliensChanged)
    {
        for (int i = 0; i < MAX_ALIENS; i++)
        {
            if (g->aliens[i].x != prev->aliens[i].x ||
                g->aliens[i].y != prev->aliens[i].y ||
                g->aliens[i].alive != prev->aliens[i].alive)
            {
                aliensChanged = true;
                break;
            }
        }
    }
    // A bullet can be positioned within the arena's own Y-range (it
    // travels through it), and redrawAlienArena is the only thing
    // that ever draws into that region -- so it needs to redraw
    // (and draw that bullet) whenever a bullet is there, not just
    // when an alien changes. Checked against BOTH this frame and the
    // previous one: checking only the current frame's active+position
    // misses the exact frame a bullet deactivates, where the old
    // (still-active last frame) position in the arena would otherwise
    // never get cleared by anything.
    bool alienBulletInArena =
        (g->alienBullet.active && g->alienBullet.y <= ALIEN_ARENA_Y1) ||
        (prev->alienBullet.active && prev->alienBullet.y <= ALIEN_ARENA_Y1);
    bool playerBulletInArena =
        (g->playerBullet.active && g->playerBullet.y <= ALIEN_ARENA_Y1) ||
        (prev->playerBullet.active && prev->playerBullet.y <= ALIEN_ARENA_Y1);
    if (!aliensChanged && (alienBulletInArena || playerBulletInArena))
        aliensChanged = true;
    // Shields live in this same region (SHIELD_Y < ALIEN_ARENA_Y1)
    // and only this redraw ever touches them -- so erosion (a cell
    // knocked out) or mass destruction (all cells vanishing at once)
    // needs to trigger a redraw here too, same reasoning as the
    // bullets above. A single memcmp across the whole shields array
    // catches both cases without needing to distinguish them.
    if (!aliensChanged && memcmp(g->shields, prev->shields, sizeof(g->shields)) != 0)
        aliensChanged = true;
    // The Command Ship always flies within the arena's Y-range
    // (COMMAND_SHIP_Y=4 is well above ALIEN_ARENA_Y1), so unlike a
    // bullet it never needs an in/out-of-range check -- just whether
    // anything about it changed at all (it moves every frame while
    // active, so this is really "is it active, or did it just stop
    // being active").
    if (!aliensChanged &&
        (g->commandShip.active != prev->commandShip.active ||
         g->commandShip.x != prev->commandShip.x ||
         g->commandShip.y != prev->commandShip.y))
        aliensChanged = true;
    // Invisible Invaders: the underlying alien positions/alive-state
    // might not have changed at all, but whether they're currently
    // DRAWN can still flip (a flash starting or ending) -- without
    // this check, the flash would be computed correctly in game.c but
    // never actually show up on screen.
    if (!aliensChanged && gameAliensVisible(g) != gameAliensVisible(prev))
        aliensChanged = true;
    if (aliensChanged)
        redrawAlienArena(fb, g);
}

void uiDrawMenu(u16 *fb, int variantOffset, bool advancedDifficulty)
{
    fillRectLogical(fb, 0, 0, LOGICAL_W - 1, LOGICAL_H - 1, COLOR_BLACK);
    drawCenteredX(fb, LOGICAL_W / 2, 10, "SPACE INVADERS", 1, COLOR_WHITE);

    char variantLine[16];
    snprintf(variantLine, sizeof(variantLine), "VARIANT %d", variantOffset);
    drawCenteredX(fb, LOGICAL_W / 2, 30, variantLine, 2, COLOR_WHITE);

    GameOptions o = variantOptions(variantOffset);
    int y = 60;
    drawCenteredX(fb, LOGICAL_W / 2, y, o.movingShields ? "MOVING SHIELDS ON" : "MOVING SHIELDS OFF", 1, COLOR_WHITE); y += 14;
    drawCenteredX(fb, LOGICAL_W / 2, y, o.zigzagBombs ? "ZIGZAG BOMBS ON" : "ZIGZAG BOMBS OFF", 1, COLOR_WHITE); y += 14;
    drawCenteredX(fb, LOGICAL_W / 2, y, o.fastBombs ? "FAST BOMBS ON" : "FAST BOMBS OFF", 1, COLOR_WHITE); y += 14;
    drawCenteredX(fb, LOGICAL_W / 2, y, o.invisibleInvaders ? "INVISIBLE INV ON" : "INVISIBLE INV OFF", 1, COLOR_WHITE); y += 20;
    drawCenteredX(fb, LOGICAL_W / 2, y, advancedDifficulty ? "SHIP SIZE ADVANCED" : "SHIP SIZE BEGINNER", 1, COLOR_WHITE);

    drawCenteredX(fb, LOGICAL_W / 2, 190, "UP DOWN VARIANT", 1, COLOR_WHITE);
    drawCenteredX(fb, LOGICAL_W / 2, 204, "B SHIP SIZE", 1, COLOR_WHITE);
    drawCenteredX(fb, LOGICAL_W / 2, 220, "A START", 1, COLOR_WHITE);
}

void uiDrawOverlay(u16 *fb, GameStatus status, int score)
{
    fillRectLogical(fb, 0, 0, LOGICAL_W - 1, LOGICAL_H - 1, COLOR_BLACK);

    const char *title;
    switch (status)
    {
        case GAME_PAUSED: title = "PAUSED";    break;
        case GAME_WON:    title = "YOU WIN";   break;
        case GAME_LOST:   title = "GAME OVER"; break;
        default:          title = "";          break;
    }
    drawCenteredX(fb, LOGICAL_W / 2, 100, title, 2, COLOR_WHITE);

    char scoreLine[24];
    snprintf(scoreLine, sizeof(scoreLine), "SCORE %d", score);
    drawCenteredX(fb, LOGICAL_W / 2, 130, scoreLine, 1, COLOR_WHITE);

    if (status == GAME_PAUSED)
    {
        drawCenteredX(fb, LOGICAL_W / 2, 150, "A RESUME", 1, COLOR_WHITE);
        drawCenteredX(fb, LOGICAL_W / 2, 162, "B RESTART", 1, COLOR_WHITE);
    }
    else
    {
        drawCenteredX(fb, LOGICAL_W / 2, 150, "A RESTART", 1, COLOR_WHITE);
    }
}
