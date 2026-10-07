#ifndef UI_H_INCLUDED
#define UI_H_INCLUDED

#include <nds.h>
#include "game.h"

#define COLOR_BLACK (RGB15(0,0,0) | BIT(15))
#define COLOR_WHITE (RGB15(31,31,31) | BIT(15))

void uiDrawText(u16 *fb, int lx, int ly, const char *text, int scale, u16 color);
int uiTextWidth(const char *text, int scale);

// Full clear + redraw of everything -- for state transitions (resume,
// restart) where a full field composite is genuinely needed and only
// happens rarely, not every frame.
void uiDrawFieldFull(u16 *fb, const GameWorld *g);

// Per-frame path while playing: only erases/redraws what actually
// changed since `prev`, instead of clearing the whole field every
// frame. See ui.c for why the unconditional full clear this replaces
// was a real bug, not just a style preference.
void uiDrawFieldDelta(u16 *fb, const GameWorld *g, const GameWorld *prev);

// Full-screen overlay for PAUSED/WON/LOST, shown on the same screen
// in place of (or over) the field.
void uiDrawOverlay(u16 *fb, GameStatus status, int score);

// Pre-game menu: shown before the first gameInit, lets the player
// pick a variant offset (1-16, see variantOptions) and cannon size
// before starting. variantOffset should already be in [1,16].
void uiDrawMenu(u16 *fb, int variantOffset, bool advancedDifficulty);

#endif
