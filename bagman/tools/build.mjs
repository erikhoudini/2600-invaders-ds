#!/usr/bin/env node
// Build the single-file game from src/ and assets/.
//
//   node tools/build.mjs                 -> dist/bagman.html
//   node tools/build.mjs --out x.html    -> x.html
//   node tools/build.mjs --check a.html  -> build, then fail unless the result is byte-identical to a.html
//
// The shipped game is one self-contained HTML file: every image, sound and
// comic panel is inlined as a data URI, so it runs from file://, inside the
// desktop shell, or from any static host without a server.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {MIME, minify, readManifest} from './lib.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const opt = k => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };

const manifest = readManifest(fs.readFileSync(path.join(ROOT, 'src/manifest.txt'), 'utf8'));
const read = rel => fs.readFileSync(path.join(ROOT, rel));

let html = '';
for (const m of manifest) {
  const tbl = m.path.match(/^@table\s+(\w+)\s+(\S+)$/);
  if (!tbl) {
    let text = read('src/' + m.path).toString('utf8').replace(/\r\n/g, '\n');
    if (!text.endsWith('\n')) text += '\n';
    html += text;
    continue;
  }
  const [, name, jsonRel] = tbl;
  const json = minify(read(jsonRel).toString('utf8')).replace(/"asset:([^"]+)"/g, (_, rel) => {
    const ext = path.extname(rel).slice(1), mime = MIME[ext];
    if (!mime) throw new Error('no MIME type for ' + rel);
    return '"data:' + mime + ';base64,' + read('assets/' + rel).toString('base64') + '"';
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

const out = opt('--out') || path.join(ROOT, 'dist/bagman.html');
fs.mkdirSync(path.dirname(out), {recursive: true});
fs.writeFileSync(out, html);
console.log(`wrote ${path.relative(process.cwd(), out)} (${(Buffer.byteLength(html) / 1048576).toFixed(2)} MB, sha256 ${sha(html)})`);
