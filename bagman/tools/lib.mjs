// Shared helpers for build.mjs and unpack.mjs.
// The asset tables are kept as JSON text, never parsed and re-serialised:
// JSON.parse moves integer-like keys ("10") ahead of others ("01"), so a
// round trip through objects would change the shipped file.

export const MIME = {jpg: 'image/jpeg', png: 'image/png', wav: 'audio/wav', mp3: 'audio/mpeg'};
export const EXT = Object.fromEntries(Object.entries(MIME).map(([e, m]) => [m, e]));

// Drop whitespace outside strings. The shipped tables have none, so this is
// the exact inverse of pretty().
export function minify(text) {
  let out = '', inS = false, esc = false;
  for (const c of text) {
    if (inS) { out += c; if (esc) esc = false; else if (c === '\\') esc = true; else if (c === '"') inS = false; continue; }
    if (c === '"') { inS = true; out += c; continue; }
    if (c === ' ' || c === '\n' || c === '\t' || c === '\r') continue;
    out += c;
  }
  return out;
}

// Walk compact JSON text and report every string value with its key path.
// onString(path, start, end) gets the span of the quoted string, quotes included.
export function walkStrings(text, onString) {
  let i = 0;
  const str = () => { const s = i; i++; while (text[i] !== '"') { if (text[i] === '\\') i++; i++; } i++; return [s, i]; };
  const value = path => {
    const c = text[i];
    if (c === '{') {
      i++;
      if (text[i] === '}') { i++; return; }
      for (;;) {
        const [ks, ke] = str(); const key = JSON.parse(text.slice(ks, ke));
        i++; // :
        value([...path, key]);
        if (text[i++] === '}') return; // else ','
      }
    }
    if (c === '[') {
      i++;
      if (text[i] === ']') { i++; return; }
      for (let k = 0; ; k++) { value([...path, k]); if (text[i++] === ']') return; }
    }
    if (c === '"') { const [s, e] = str(); onString(path, s, e); return; }
    while (i < text.length && !',]}'.includes(text[i])) i++; // number, true, false, null
  };
  value([]);
  if (i !== text.length) throw new Error('trailing text after JSON at ' + i);
}

// Readable layout for the checked-in tables: one key per line, short arrays of
// plain values kept on one line.
export function pretty(text) {
  let out = '', depth = 0, i = 0;
  const nl = () => '\n' + '  '.repeat(depth);
  const flatArray = at => { // [ ... ] with no nested containers
    let j = at + 1, inS = false, esc = false;
    for (; j < text.length; j++) {
      const c = text[j];
      if (inS) { if (esc) esc = false; else if (c === '\\') esc = true; else if (c === '"') inS = false; continue; }
      if (c === '"') inS = true; else if (c === '[' || c === '{') return -1; else if (c === ']') return j;
    }
    return -1;
  };
  while (i < text.length) {
    const c = text[i];
    if (c === '"') { const s = i; i++; while (text[i] !== '"') { if (text[i] === '\\') i++; i++; } i++; out += text.slice(s, i); continue; }
    if (c === '[') { const e = flatArray(i); if (e > 0) { out += spaceCommas(text.slice(i, e + 1)); i = e + 1; continue; } }
    if (c === '{' || c === '[') { const close = c === '{' ? '}' : ']'; if (text[i + 1] === close) { out += c + close; i += 2; continue; } depth++; out += c + nl(); i++; continue; }
    if (c === '}' || c === ']') { depth--; out += nl() + c; i++; continue; }
    if (c === ',') { out += ',' + nl(); i++; continue; }
    if (c === ':') { out += ': '; i++; continue; }
    out += c; i++;
  }
  return out + '\n';
}

function spaceCommas(s) {
  let out = '', inS = false, esc = false;
  for (const c of s) {
    if (inS) { if (esc) esc = false; else if (c === '\\') esc = true; else if (c === '"') inS = false; }
    else if (c === '"') inS = true;
    else if (c === ',') { out += ', '; continue; }
    out += c;
  }
  return out;
}

// Manifest lines: "<path>  | <marker>". Build reads the path; unpack also uses the marker.
export function readManifest(text) {
  return text.split('\n').map(l => l.replace(/\r$/, '')).filter(l => l.trim() && !l.trimStart().startsWith('#'))
    .map(l => { const k = l.indexOf('|'); return {path: (k < 0 ? l : l.slice(0, k)).trim(), marker: k < 0 ? null : l.slice(k + 1).replace(/^ /, '')}; });
}
