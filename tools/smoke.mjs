#!/usr/bin/env node
// Boot a built game in headless Chromium, play a few seconds of it, and fail on
// any page error. Needs Playwright (npm i -g playwright, or on NODE_PATH).
//   node tools/smoke.mjs bagman   [screenshot-dir]   walks splash -> menu -> chapter 1, moves and fires
//   node tools/smoke.mjs killrace [screenshot-dir]   title -> drive, steer, fire, lock on
import path from 'node:path';
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {execSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const require = createRequire(import.meta.url);
let chromium;
try { ({chromium} = require('playwright')); }
catch { ({chromium} = require(path.join(execSync('npm root -g').toString().trim(), 'playwright'))); }

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const game = process.argv[2] || 'bagman';
const file = path.join(REPO, 'dist', game + '.html');
const shots = process.argv[3] ? path.resolve(process.argv[3]) : null;
if (!fs.existsSync(file)) { console.error(`no ${file}; run: node tools/build.mjs ${game}`); process.exit(1); }
if (shots) fs.mkdirSync(shots, {recursive: true});

const browser = await chromium.launch({args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist']});
const page = await browser.newPage({viewport: {width: 1024, height: 768}});
const errors = [];
page.on('pageerror', e => errors.push(e.message));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });

const wait = ms => page.waitForTimeout(ms);
const key = async (k, ms = 700) => { await page.keyboard.press(k); await wait(ms); };
const hold = async (k, ms) => { await page.keyboard.down(k); await wait(ms); await page.keyboard.up(k); };
const shot = async name => { if (shots) await page.screenshot({path: path.join(shots, name + '.png')}); };

await page.goto('file://' + file);
await wait(2500); await shot('1-boot');
if (game === 'bagman') {
  await key('Enter', 800); await shot('2-advisory');
  await key('Enter', 1500); await key('Escape', 1500); // skip the intro
  await key('Escape', 1500); await shot('3-menu');      // skip the opening comic
  await key('Enter', 1000);                             // STORY
  await key('Enter', 1500); await key('Escape', 1500);  // NEW GAME, skip the chapter comic
  await key('Enter', 3000);                             // START
  await hold('KeyW', 1200); await key('Space', 800);
} else {
  await key('Enter', 1200); await shot('2-start');
  await page.keyboard.down('KeyW'); await wait(900);
  await hold('KeyA', 400); await key('KeyE', 200); await hold('Space', 900);
  await page.keyboard.up('KeyW'); await key('Escape', 500); await shot('3-pause'); await key('Escape', 300);
}
await shot('9-play');

const gl = await page.evaluate(() => !document.getElementById('screen').classList.contains('nogl'));
await browser.close();
console.log('webgl tube: ' + (gl ? 'on' : 'off (2D fallback)'));
if (errors.length) { console.error('page errors:\n' + errors.join('\n')); process.exit(1); }
console.log(`${game} smoke test passed, no page errors`);
