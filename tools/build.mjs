#!/usr/bin/env node
// Build a game into one self-contained HTML file.
//
//   node tools/build.mjs <game>                  -> dist/<game>.html     (game = bagman, killrace, ...)
//   node tools/build.mjs <game> --out x.html     -> x.html
//   node tools/build.mjs <game> --check a.html   -> build, then fail unless the result is byte-identical to a.html
//
// A game is a folder with src/manifest.txt. The manifest lists the pieces of
// the page in order; paths are relative to that src/ folder, so a game can
// pull engine files from another game (killrace uses ../../bagman/src/js/...).
// "@table NAME file.json" lines (path relative to the game folder) become
// `const NAME=<json>;` with each "asset:<path>" string replaced by a base64
// data URI of <folder of file.json>/<path>. Every image and sound ends up
// inside the HTML, so it runs from file://, a desktop shell, or any static host.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {MIME, minify, readManifest} from './lib.mjs';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const opt = k => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const game = args.find((a, i) => !a.startsWith('--') && !(i > 0 && args[i - 1].startsWith('--')));
if (!game) { console.error('usage: node tools/build.mjs <game> [--out file] [--check file]'); process.exit(1); }

const ROOT = path.join(REPO, game);
const SRC = path.join(ROOT, 'src');
const manifest = readManifest(fs.readFileSync(path.join(SRC, 'manifest.txt'), 'utf8'));

let html = '';
for (const m of manifest) {
  const tbl = m.path.match(/^@table\s+(\w+)\s+(\S+)$/);
  if (!tbl) {
    let text = fs.readFileSync(path.join(SRC, m.path), 'utf8').replace(/\r\n/g, '\n');
    if (!text.endsWith('\n')) text += '\n';
    html += text;
    continue;
  }
  const [, name, jsonRel] = tbl;
  const jsonPath = path.join(ROOT, jsonRel), assetDir = path.dirname(jsonPath);
  const json = minify(fs.readFileSync(jsonPath, 'utf8')).replace(/"asset:([^"]+)"/g, (_, rel) => {
    const mime = MIME[path.extname(rel).slice(1)];
    if (!mime) throw new Error('no MIME type for ' + rel);
    return '"data:' + mime + ';base64,' + fs.readFileSync(path.join(assetDir, rel)).toString('base64') + '"';
  });
  html += `const ${name}=${json};\n`;
}

const sha = s => crypto.createHash('sha256').update(s).digest('hex');
const check = opt('--check');
if (check) {
  const want = fs.readFileSync(check);
  const got = Buffer.from(html, 'utf8');
  if (!want.equals(got)) {
    let i = 0; while (i < want.length && want[i] === got[i]) i++;
    console.error(`MISMATCH with ${check}: first difference at byte ${i}`);
    console.error('  want: ' + JSON.stringify(want.subarray(Math.max(0, i - 40), i + 40).toString('utf8')));
    console.error('  got:  ' + JSON.stringify(got.subarray(Math.max(0, i - 40), i + 40).toString('utf8')));
    process.exit(1);
  }
  console.log(`identical to ${check} (sha256 ${sha(got)})`);
}

const out = opt('--out') || path.join(REPO, 'dist', game + '.html');
fs.mkdirSync(path.dirname(out), {recursive: true});
fs.writeFileSync(out, html);
console.log(`wrote ${path.relative(process.cwd(), out)} (${(Buffer.byteLength(html) / 1048576).toFixed(2)} MB, sha256 ${sha(html)})`);
