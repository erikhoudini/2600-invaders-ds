#!/usr/bin/env node
// Boot dist/bagman.html in headless Chromium, walk from the splash screen into
// chapter 1, fire once, and fail on any page error. Needs Playwright:
//   npm i -g playwright   (or have it on NODE_PATH)
//   node tools/smoke.mjs [dist/bagman.html] [screenshot-dir]
import path from 'node:path';
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {execSync} from 'node:child_process';

const require = createRequire(import.meta.url);
let chromium;
try { ({chromium} = require('playwright')); }
catch { ({chromium} = require(path.join(execSync('npm root -g').toString().trim(), 'playwright'))); }

const file = path.resolve(process.argv[2] || 'dist/bagman.html');
const shots = process.argv[3] ? path.resolve(process.argv[3]) : null;
if (shots) fs.mkdirSync(shots, {recursive: true});

const browser = await chromium.launch({args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist']});
const page = await browser.newPage({viewport: {width: 1024, height: 768}});
const errors = [];
page.on('pageerror', e => errors.push(e.message));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });

const wait = ms => page.waitForTimeout(ms);
const key = async (k, ms = 700) => { await page.keyboard.press(k); await wait(ms); };
const shot = async name => { if (shots) await page.screenshot({path: path.join(shots, name + '.png')}); };

await page.goto('file://' + file);
await wait(2500); await shot('1-splash');
await key('Enter', 800); await shot('2-advisory');
await key('Enter', 1500); await key('Escape', 1500); // skip the intro
await key('Escape', 1500); await shot('3-menu');      // skip the opening comic
await key('Enter', 1000); await shot('4-story');      // STORY
await key('Enter', 1500); await key('Escape', 1500);  // NEW GAME, skip the chapter comic
await shot('5-chapter-card');
await key('Enter', 3000);                             // START
await page.keyboard.down('KeyW'); await wait(1200); await page.keyboard.up('KeyW');
await key('Space', 800); await shot('6-play');

const gl = await page.evaluate(() => !document.getElementById('screen').classList.contains('nogl'));
await browser.close();
console.log('webgl tube: ' + (gl ? 'on' : 'off (2D fallback)'));
if (errors.length) { console.error('page errors:\n' + errors.join('\n')); process.exit(1); }
console.log('smoke test passed: splash, menu, chapter 1, movement and firing, no page errors');
