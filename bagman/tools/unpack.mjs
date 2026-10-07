#!/usr/bin/env node
// Split a single-file BAGMAN build back into src/ and assets/.
//
//   node tools/unpack.mjs path/to/bagman.html
//
// Use it when a change was made directly to a single-file build and has to come
// back into this tree. It overwrites src/ pieces and assets/ files named in
// src/manifest.txt. Run `node tools/build.mjs --check that.html` afterwards to
// confirm the round trip is exact.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {EXT, pretty, readManifest, walkStrings} from './lib.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const input = process.argv[2];
if (!input) { console.error('usage: node tools/unpack.mjs <bagman.html>'); process.exit(1); }

const html = fs.readFileSync(input, 'utf8');
if (!html.endsWith('\n')) throw new Error('expected the file to end with a newline');
const lines = html.slice(0, -1).split('\n');
const manifest = readManifest(fs.readFileSync(path.join(ROOT, 'src/manifest.txt'), 'utf8'));

// Leading comments and banners travel with the piece below them.
const leads = l => /^\s*\/\//.test(l) || /^\/\* =+$/.test(l) || /^\/\*[A-Z]+\*\/$/.test(l);

const starts = [];
let cursor = 0;
for (const [k, m] of manifest.entries()) {
  if (!m.marker) throw new Error('manifest line has no marker: ' + m.path);
  const want = m.marker.trim();
  let at = -1;
  for (let i = cursor; i < lines.length; i++) if (lines[i].trim().startsWith(want)) { at = i; break; }
  if (at < 0) throw new Error(`marker not found after line ${cursor + 1}: ${want}`);
  if (k === 0 && at !== 0) throw new Error('the first marker must be on the first line');
  const floor = k ? starts[k - 1] + 1 : 0;
  while (at > floor && leads(lines[at - 1])) at--;
  starts.push(at);
  cursor = at + 1;
}

const write = (rel, text) => { const p = path.join(ROOT, rel); fs.mkdirSync(path.dirname(p), {recursive: true}); fs.writeFileSync(p, text); };

// Where each embedded file goes, from its key path in the table.
function assetPath(table, keyPath, ext, A) {
  const [k0, k1, k2] = keyPath;
  if (table === 'COMICS') return `comics/${k0}/p${k1 + 1}-${k2 + 1}.${ext}`;
  if (k0 === 'walls') return `textures/walls.${ext}`;
  if (k0 === 'floors') return `textures/floors/${k1}.${ext}`;
  if (/^w[A-Z]/.test(k0) && k1 === 'img') return `weapons/${k0}.${ext}`;
  if (k0 === 'photos') return `photos/${k1}.${ext}`;
  if (k0 === 'pulp') return `pulp/${k1}.${ext}`;
  if (k0 === 'cards') return `cards/${String(k1).padStart(2, '0')}-${A.cardFile[k1]}.${ext}`;
  if (k0 === 'snd') return `audio/${k1}.${ext}`;
  if (k0 === 'amb') return `audio/ambience.${ext}`;
  if (['cardBack', 'olive', 'houdini'].includes(k0)) return `ui/${k0}.${ext}`;
  if (keyPath.length === 1) return `sprites/${k0}.${ext}`;
  return `misc/${keyPath.join('-')}.${ext}`;
}

let assetCount = 0;
let A = null;
manifest.forEach((m, k) => {
  const piece = lines.slice(starts[k], k + 1 < starts.length ? starts[k + 1] : lines.length);
  const tbl = m.path.match(/^@table\s+(\w+)\s+(\S+)$/);
  if (!tbl) { write('src/' + m.path, piece.join('\n') + '\n'); return; }
  const [, name, jsonRel] = tbl;
  if (piece.length !== 1) throw new Error(`table ${name} should be one line, got ${piece.length}`);
  const pre = `const ${name}=`;
  if (!piece[0].startsWith(pre) || !piece[0].endsWith(';')) throw new Error(`table ${name} has an unexpected shape`);
  const json = piece[0].slice(pre.length, -1);
  if (name === 'A') A = JSON.parse(json);
  const spans = [];
  walkStrings(json, (keyPath, s, e) => {
    if (!json.startsWith('"data:', s)) return;
    const uri = json.slice(s + 1, e - 1), m2 = uri.match(/^data:([^;,]+);base64,(.*)$/s);
    if (!m2 || !EXT[m2[1]]) throw new Error('unsupported data URI at ' + keyPath.join('.'));
    const rel = assetPath(name, keyPath, EXT[m2[1]], A);
    const bytes = Buffer.from(m2[2], 'base64');
    if (bytes.toString('base64') !== m2[2]) throw new Error('non-canonical base64 at ' + keyPath.join('.'));
    write('assets/' + rel, bytes);
    assetCount++;
    spans.push([s, e, JSON.stringify('asset:' + rel)]);
  });
  let out = '', last = 0;
  for (const [s, e, rep] of spans) { out += json.slice(last, s) + rep; last = e; }
  out += json.slice(last);
  write(jsonRel, pretty(out));
});

console.log(`unpacked ${manifest.length} pieces and ${assetCount} asset files from ${input}`);
