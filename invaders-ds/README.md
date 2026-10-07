# Space Invaders (Atari 2600 remake), Nintendo DS

A homebrew remake of the Atari 2600 version of Space Invaders for the DS,
in book mode (the console is held rotated 90°). It is written in C against
libnds with the BlocksDS toolchain. `DESIGN_NOTES.md` covers the design and
scope.

## Build the ROM

Needs BlocksDS (the Makefile expects `/opt/wonderful/thirdparty/blocksds`).

```sh
make            # -> space-invaders.nds
```

## Run the game-logic tests on a PC

`source/game.c` has no DS dependencies, so the tests build with any C compiler:

```sh
gcc -std=c11 -Wall -Wextra -I source -o tests/test_game tests/test_game.c source/game.c
./tests/test_game
```

All 89 checks pass as of this import.

## Where it stands

The code is further along than the gap table in `DESIGN_NOTES.md`, which was
written before this work. Phases 1 to 4 and 6 of its plan are in: the 6x6
formation with row scoring, 3 shields, the Command Ship, and endless waves
that each start lower. The Advanced difficulty doubles the cannon size. From
phase 5, the 16 single-player variant offsets work (moving shields, zigzag
bombs, fast bombs, invisible invaders). The two-player categories B to G are
not started.
