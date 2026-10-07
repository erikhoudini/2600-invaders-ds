# BAGMAN

| Folder | What |
|---|---|
| [`bagman/`](bagman/) | **BAGMAN**, released. A ZX Spectrum styled raycaster shooter set in Nevada. The engine and all the art live here. |
| [`killrace/`](killrace/) | **KILL RACE**, a prototype. First-person car combat in a night-time grid town, built on the Bagman engine with Bagman's art plus credited free sound and music. |
| [`tools/`](tools/) | The build: each game is a manifest of source pieces, joined into one self-contained HTML file. |

Needs Node 18+. There are no npm dependencies.

```sh
npm run build                      # dist/bagman.html and dist/killrace.html
node tools/build.mjs bagman        # one game
npm run check:bagman -- bagman.html   # prove a Bagman build is byte-identical to a shipped file
npm run smoke                      # boot and play both in headless Chromium (needs Playwright)
```

A game's `src/manifest.txt` can list files from another game's `src/`. That
is how Kill Race reuses Bagman's renderer, audio, particles and enemy AI
without copying them.
