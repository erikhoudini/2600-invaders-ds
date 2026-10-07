// Book-mode coordinate transform: the device is held rotated 90 CW
// from normal landscape, so content is pre-rotated 90 CCW into the
// native framebuffer to appear upright once physically rotated.
// Logical space is 192 wide (native height) x 256 tall (native
// width) -- verified against all 4 corners before use (not just
// assumed): logical (0,0) -> native (0,191), (191,0) -> (0,0),
// (0,255) -> (255,191), (191,255) -> (255,0).
#ifndef ROTATE_H_INCLUDED
#define ROTATE_H_INCLUDED

#include <nds.h>

#define NATIVE_W 256
#define NATIVE_H 192
#define LOGICAL_W 192
#define LOGICAL_H 256

static inline void plotLogical(u16 *fb, int lx, int ly, u16 color)
{
    if (lx < 0 || lx >= LOGICAL_W || ly < 0 || ly >= LOGICAL_H) return;
    int nx = ly;
    int ny = (LOGICAL_W - 1) - lx;
    fb[ny * NATIVE_W + nx] = color;
}

// Same transform, no bounds check -- for call sites that already
// guarantee in-bounds coordinates by construction (e.g. clearing a
// rect that's provably within the field), where the check is pure
// redundant overhead repeated on every single pixel.
static inline void plotLogicalUnchecked(u16 *fb, int lx, int ly, u16 color)
{
    int nx = ly;
    int ny = (LOGICAL_W - 1) - lx;
    fb[ny * NATIVE_W + nx] = color;
}

#endif
