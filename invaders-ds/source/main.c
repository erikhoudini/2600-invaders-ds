// Space Invaders, book-mode demo. Device held rotated 90 CW; content
// is pre-rotated into the framebuffer (see rotate.h) so it appears
// upright. Physical D-pad Up/Down move the ship left/right on screen
// during play (the D-pad rotates with the device, so "up/down" is
// what "left/right" feels like once you're holding it sideways); the
// same Up/Down cycles the variant number on the pre-game menu. A
// fires (or starts, from the menu); START pauses (shown as a simple
// menu); A/B resume/restart from there; B toggles ship size on the
// pre-game menu.
#include <nds.h>
#include "game.h"
#include "ui.h"
#include "rotate.h"

int main(void)
{
    videoSetMode(MODE_5_2D);
    vramSetBankA(VRAM_A_MAIN_BG);
    int bgId = bgInit(3, BgType_Bmp16, BgSize_B16_256x256, 0, 0);
    u16 *fb = bgGetGfxPtr(bgId);

    unsigned int bootSeed = 0x1234ABCDu;

    // Pre-game menu: picks the variant (1-16) and cannon size before
    // the first gameInit. Kept as a plain bool here rather than a new
    // GameStatus value -- this is a concern of main's own loop, not
    // something GameWorld's state machine needs to know exists.
    bool inMenu = true;
    int variantOffset = 1;
    bool advancedDifficulty = false;
    uiDrawMenu(fb, variantOffset, advancedDifficulty);

    GameWorld g;
    GameWorld prev;

    // Applies the currently-selected variant/difficulty to a freshly
    // gameInit'd world -- used for the initial start AND every
    // restart, so restarting mid-game doesn't silently drop back to
    // baseline settings the player didn't choose.
    #define APPLY_SELECTED_SETTINGS() do { \
        gameSetOptions(&g, variantOptions(variantOffset)); \
        gameSetDifficulty(&g, advancedDifficulty); \
    } while (0)

    while (1)
    {
        swiWaitForVBlank();
        scanKeys();
        int keys = keysHeld();
        int down = keysDown();
        bootSeed += 1; // cheap per-frame entropy accumulator

        if (inMenu)
        {
            bool menuChanged = false;
            if (down & KEY_UP) { variantOffset = (variantOffset == 16) ? 1 : variantOffset + 1; menuChanged = true; }
            else if (down & KEY_DOWN) { variantOffset = (variantOffset == 1) ? 16 : variantOffset - 1; menuChanged = true; }
            else if (down & KEY_B) { advancedDifficulty = !advancedDifficulty; menuChanged = true; }
            else if (down & KEY_A)
            {
                gameInit(&g, bootSeed);
                APPLY_SELECTED_SETTINGS();
                uiDrawFieldFull(fb, &g);
                prev = g;
                inMenu = false;
            }
            if (menuChanged)
                uiDrawMenu(fb, variantOffset, advancedDifficulty);
            continue;
        }

        bool needsRedraw = false;
        bool cameFromNonPlaying = (g.status != GAME_PLAYING);

        if (g.status == GAME_PLAYING)
        {
            if (keys & KEY_UP) gameMoveShip(&g, 1);
            if (keys & KEY_DOWN) gameMoveShip(&g, -1);
            if (down & KEY_A) gameFire(&g);
            if (down & KEY_START) { gamePauseToggle(&g); needsRedraw = true; }
            gameStep(&g);
            needsRedraw = true; // the field animates every frame while playing regardless
        }
        else if (g.status == GAME_PAUSED)
        {
            if ((down & KEY_A) || (down & KEY_START)) { gamePauseToggle(&g); needsRedraw = true; }
            else if (down & KEY_B) { gameInit(&g, bootSeed); APPLY_SELECTED_SETTINGS(); needsRedraw = true; }
        }
        else // GAME_WON or GAME_LOST
        {
            if (down & KEY_A) { gameInit(&g, bootSeed); APPLY_SELECTED_SETTINGS(); needsRedraw = true; }
        }

        if (needsRedraw)
        {
            if (g.status == GAME_PLAYING)
            {
                // Coming from PAUSED (just resumed) or a fresh restart:
                // prev is stale (it's whatever the field looked like
                // before pausing, or default-zeroed from gameInit's
                // memset), so a delta against it wouldn't actually
                // cover everything on screen. Do one full redraw on
                // exactly that transition frame, then drop back to
                // delta rendering for every subsequent frame.
                if (cameFromNonPlaying) uiDrawFieldFull(fb, &g);
                else uiDrawFieldDelta(fb, &g, &prev);
            }
            else
            {
                uiDrawOverlay(fb, g.status, g.score);
            }
            prev = g;
        }
    }

    return 0;
}
