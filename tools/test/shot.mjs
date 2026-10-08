// Usage: node shot.mjs <url> <out.png> [waitMs] [actionsJSON]
// Routes three.js CDN requests to local node_modules so the page works offline.
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const [,, url, out, waitMs = '3000', actionsJson = '[]'] = process.argv;
const THREE_DIR = path.resolve(process.env.THREE_DIR || '/home/claude/devenv/node_modules/three');
const browser = await chromium.launch({
  executablePath: process.env.CHROME || (fs.existsSync('/opt/pw-browsers/chromium-1194/chrome-linux/chrome') ? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' : undefined),
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'],
});
const VW = parseInt(process.env.VW || '1280'), VH = parseInt(process.env.VH || '720');
const page = await browser.newPage({ viewport: { width: VW, height: VH }, hasTouch: !!process.env.TOUCH, isMobile: !!process.env.TOUCH });
const logs = [];
if (process.env.LOWQ) await page.addInitScript(() => { try { localStorage.setItem('svartnebb.settings.v1', JSON.stringify({ quality: 'lav', music: 0, sfx: 0 })); } catch (e) {} });
if (process.env.INIT) await page.addInitScript(process.env.INIT);
page.on('console', m => logs.push(`[${m.type()}] ${m.text()}`));
page.on('pageerror', e => logs.push(`[pageerror] ${e.message}\n${e.stack}`));
await page.route(/cdn\.jsdelivr\.net\/npm\/three@[^/]+\/(.*)$/, async route => {
  const m = route.request().url().match(/three@[^/]+\/(.*)$/);
  const p = path.join(THREE_DIR, m[1]);
  if (fs.existsSync(p)) {
    await route.fulfill({ status: 200, contentType: 'application/javascript', body: fs.readFileSync(p) });
  } else { logs.push('[route-miss] ' + p); await route.abort(); }
});
await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
await page.goto(url, { timeout: 90000 });
if (process.env.NOANIM) await page.addStyleTag({ content: '*,*::before,*::after{animation-duration:0s!important;animation-delay:0s!important;transition:none!important}' });
await page.waitForTimeout(parseInt(waitMs));
const actions = JSON.parse(actionsJson);
let shotIdx = 0;
for (const a of actions) {
  if (a.t === 'key') await page.keyboard.press(a.k);
  else if (a.t === 'down') await page.keyboard.down(a.k);
  else if (a.t === 'up') await page.keyboard.up(a.k);
  else if (a.t === 'click') await page.mouse.click(a.x, a.y, { button: a.b || 'left' });
  else if (a.t === 'move') await page.mouse.move(a.x, a.y);
  else if (a.t === 'mdown') { await page.mouse.move(a.x, a.y); await page.mouse.down(); }
  else if (a.t === 'mup') await page.mouse.up();
  else if (a.t === 'wait') await page.waitForTimeout(a.ms);
  else if (a.t === 'eval') logs.push('[eval] ' + JSON.stringify(await page.evaluate(a.js)));
  else if (a.t === 'shot') await page.screenshot({ path: out.replace('.png', `_${shotIdx++}.png`) });
}
await page.screenshot({ path: out });
console.log(logs.slice(0, 80).join('\n'));
await browser.close();
