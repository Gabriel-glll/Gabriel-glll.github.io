// Captura o site do Bolêros (mobile, rolagem longa) para usar como mockup no reel.
import { createRequire } from 'module';
import path from 'path';
const require = createRequire(path.join(process.env.LOCALAPPDATA, 'hairline-look', 'node_modules', 'x.js'));
const pw = require('playwright-core');
const b = await pw.chromium.launch({ channel: 'chrome' }).catch(() => pw.chromium.launch());
const ctx = await b.newContext({ viewport: { width: 430, height: 900 }, deviceScaleFactor: 2 });
const p = await ctx.newPage();
await p.goto('https://gabriel-glll.github.io/bolerosbom/', { waitUntil: 'networkidle' });
await p.waitForTimeout(1500);
await p.screenshot({ path: 'assets/boleros-site.jpg', type: 'jpeg', quality: 85, clip: { x: 0, y: 0, width: 430, height: 1800 }, fullPage: true });
await b.close();
console.log('ok');
