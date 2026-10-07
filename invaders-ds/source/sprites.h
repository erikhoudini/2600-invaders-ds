// Sprite bitmap data, extracted from the uploaded sprite sheet
// (1000029967.png). Each sprite was confirmed to use exactly one ink
// color over a transparent (black) background, and the sheet was
// confirmed to be drawn at a genuine 3x pixel scale (every 3x3 block
// checked for uniformity, not assumed) before downsampling to this
// true 1x resolution. Rendered back to a PNG and visually compared
// against the source before being transcribed here -- see the
// conversation this came from for that verification.
#ifndef SPRITES_H_INCLUDED
#define SPRITES_H_INCLUDED

#include <nds.h>

typedef struct {
    u8 w, h;
    const u16 *rows; // low w bits per row, MSB-first (bit w-1 = leftmost)
    u16 color;        // RGB15, this sprite's single ink color
} Sprite;

#define ALIEN_A_F0_W 8
#define ALIEN_A_F0_H 10
static const u16 ALIEN_A_F0_ROWS[10] = {1,66,164,152,62,107,126,126,66,231};
#define ALIEN_A_F1_W 8
#define ALIEN_A_F1_H 10
static const u16 ALIEN_A_F1_ROWS[10] = {128,66,37,25,124,214,126,126,66,231};

#define ALIEN_B_F0_W 8
#define ALIEN_B_F0_H 10
static const u16 ALIEN_B_F0_ROWS[10] = {60,126,90,255,165,153,153,165,165,165};
#define ALIEN_B_F1_W 8
#define ALIEN_B_F1_H 10
static const u16 ALIEN_B_F1_ROWS[10] = {60,126,90,255,165,153,90,90,90,66};

#define ALIEN_C_F0_W 8
#define ALIEN_C_F0_H 10
static const u16 ALIEN_C_F0_ROWS[10] = {129,129,165,189,90,24,24,24,36,195};
#define ALIEN_C_F1_W 8
#define ALIEN_C_F1_H 9
static const u16 ALIEN_C_F1_ROWS[9] = {24,90,189,153,153,165,36,66,36};

#define SHIP_SPRITE_W 8
#define SHIP_SPRITE_H 18
static const u16 SHIP_SPRITE_ROWS[18] = {60,60,126,126,126,126,126,126,126,126,255,255,255,255,255,255,195,195};

#define BULLET_SPRITE_W 1
#define BULLET_SPRITE_H 7
static const u16 BULLET_SPRITE_ROWS[7] = {1,1,1,1,1,1,1};

// Command Ship: hand-designed (the extracted sprite sheet had no UFO
// asset to source this from), verified visually before encoding --
// rendered at 12x4, dome top / wide middle / small legs, a simple
// recognizable "flying saucer" silhouette. Magenta is a new color
// choice for this project specifically to stay visually distinct
// from every color already in use (olive aliens, orange ship, white
// shields/text, grey bullets).
#define COMMAND_SHIP_SPRITE_W 12
#define COMMAND_SHIP_SPRITE_H 4
static const u16 COMMAND_SHIP_SPRITE_ROWS[4] = {1008, 2040, 4092, 1360};

#define ALIEN_INK_COLOR   (RGB15(16,16,3) | BIT(15))  // olive, from rgb8(134,134,29)
#define SHIP_INK_COLOR    (RGB15(22,10,5) | BIT(15))  // orange, from rgb8(181,83,40)
#define BULLET_INK_COLOR  (RGB15(17,17,17) | BIT(15)) // grey, from rgb8(142,142,142)
#define COMMAND_SHIP_INK_COLOR (RGB15(25,10,25) | BIT(15)) // magenta, new for this sprite specifically

// 3 alien types (2 walk-cycle frames each), matched to the game's 3
// alien rows for visual variety, same as classic Space Invaders.
static const Sprite ALIEN_SPRITES[3][2] = {
    { {ALIEN_A_F0_W, ALIEN_A_F0_H, ALIEN_A_F0_ROWS, ALIEN_INK_COLOR},
      {ALIEN_A_F1_W, ALIEN_A_F1_H, ALIEN_A_F1_ROWS, ALIEN_INK_COLOR} },
    { {ALIEN_B_F0_W, ALIEN_B_F0_H, ALIEN_B_F0_ROWS, ALIEN_INK_COLOR},
      {ALIEN_B_F1_W, ALIEN_B_F1_H, ALIEN_B_F1_ROWS, ALIEN_INK_COLOR} },
    { {ALIEN_C_F0_W, ALIEN_C_F0_H, ALIEN_C_F0_ROWS, ALIEN_INK_COLOR},
      {ALIEN_C_F1_W, ALIEN_C_F1_H, ALIEN_C_F1_ROWS, ALIEN_INK_COLOR} },
};

static const Sprite SHIP_SPRITE = {SHIP_SPRITE_W, SHIP_SPRITE_H, SHIP_SPRITE_ROWS, SHIP_INK_COLOR};
static const Sprite BULLET_SPRITE = {BULLET_SPRITE_W, BULLET_SPRITE_H, BULLET_SPRITE_ROWS, BULLET_INK_COLOR};
static const Sprite COMMAND_SHIP_SPRITE = {COMMAND_SHIP_SPRITE_W, COMMAND_SHIP_SPRITE_H, COMMAND_SHIP_SPRITE_ROWS, COMMAND_SHIP_INK_COLOR};

#endif
