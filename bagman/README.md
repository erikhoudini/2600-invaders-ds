# BAGMAN

*Somewhere in Nevada.* A first-person shooter drawn as a ZX Spectrum game on
a CRT. It ships as one self-contained HTML file.

This folder is the source for that file. The JavaScript is split into about
90 pieces by system, and every image, sound and comic panel is a real file
under `assets/`. `tools/build.mjs` puts them back together.

## Build

Needs Node 18 or newer. There are no npm dependencies.

```sh
npm run build                      # -> dist/bagman.html
npm run check -- path/to/bagman.html   # build, then fail unless byte-identical to that file
npm run smoke                      # optional: boot dist/bagman.html in headless Chromium (needs Playwright)
```

Open `dist/bagman.html` in a browser to play. It works from `file://`.

The tree reproduces the released 1.0 build exactly. See `RELEASES.md` for the
hash.

## Layout

```
src/
  manifest.txt     the order every piece is joined in (read this first)
  html/            page shell: head, on-screen touch controls, closing tags
  css/             tokens, handheld/landscape/desktop layout, menu modes
  js/              the game, one shared scope, split by system
assets/
  assets.json      asset table A: names, sprite metrics, credits metadata, "asset:" refs
  comics.json      comic pages: panel rectangles and "asset:" refs
  textures/ sprites/ weapons/ photos/ pulp/ cards/ ui/ audio/ comics/
tools/
  build.mjs        src + assets -> one HTML file
  unpack.mjs       one HTML file -> src + assets (to bring back edits made to a single-file build)
  smoke.mjs        headless boot-and-play test
docs/
  ARCHITECTURE.md  how the engine works, folder map, saved data, known issues
```

## Working in it

- **Load order matters.** All of `src/js` runs in one scope. Add a new file
  by adding a line to `src/manifest.txt` after anything it needs at load time.
- **Assets:** drop a file under `assets/` and reference it from
  `assets/assets.json` as `"asset:folder/name.png"`. Supported types: png,
  jpg, wav, mp3.
- **Edited a single-file build somewhere else?** Run
  `node tools/unpack.mjs that.html` and then `npm run check -- that.html`.
  The unpacker finds each piece by the marker text in `manifest.txt`, so if
  a marker line was edited, update the manifest first.
- **Don't rename `bagman11.save`** or any other `bagman.*` localStorage key
  unless you mean to reset players' progress.
