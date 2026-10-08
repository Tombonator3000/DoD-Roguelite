// Før- og etterbilder av teksturene, med samme kamera og én composer-render per måling.
// CHROME=/usr/bin/chromium node tools/test/texture-browser.mjs <html> <utmappe> [før]
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const root = new URL('../../', import.meta.url).pathname;
const [file = 'dist/index.html', dir = 'dist/teksturer/etter', before] = process.argv.slice(2);
const out = path.resolve(dir);
fs.mkdirSync(out, { recursive: true });
const html = fs.readFileSync(file, 'utf8');
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const browser = await chromium.launch({ executablePath: process.env.CHROME || undefined,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'] });
const result = { scenes: {}, errors: [], resourceRequests: [] };
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  page.setDefaultTimeout(120000);
  page.on('pageerror', e => result.errors.push(e.stack || e.message));
  page.on('console', m => { if (m.type() === 'error') result.errors.push(m.text()); });
  await page.route(/cdn\.jsdelivr\.net\/npm\/three@[^/]+\/(.*)$/, async route => {
    const sub = route.request().url().match(/three@[^/]+\/(.*)$/)[1];
    await route.fulfill({ contentType: 'application/javascript', body: fs.readFileSync(path.join(root, 'node_modules/three', sub)) });
  });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.fulfill({ body: '', contentType: 'text/css' }));
  page.on('request', r => { if (/\.(jpg|png)(\?|$)/i.test(r.url())) result.resourceRequests.push(r.url()); });
  for (const f of ['sim.js', 'town.js', 'area.js']) await page.addInitScript(fs.readFileSync(path.join(root, 'tools/test', f), 'utf8'));
  await page.addInitScript(() => {
    localStorage.setItem('svartnebb.settings.v1', JSON.stringify({ quality: 'lav', music: 0, sfx: 0 }));
    let seed = 1941;
    Math.random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  });
  await page.goto(`http://127.0.0.1:${server.address().port}/DoD-Roguelite/`);
  await page.waitForFunction(() => window.G?.game?.title);
  await page.addStyleTag({ content: '*,*::before,*::after{animation-duration:0s!important;transition:none!important}' });
  await page.evaluate(() => { G.game.startRun(); G.ui.hideScreens(); G.state = 'play'; });
  async function scene(name, code) {
    console.log('Bilde:', name);
    await page.evaluate(code);
    await page.evaluate(async () => {
      G.weather.force('klart'); G.weather.snap();
      G.game.camTarget.copy(G.player.pos).setY(0.6);
      G.camLock = G.game.camTarget.clone();
      G.enemies.forEach(e => { e.dead = true; });
      G.player.invuln = 9999;
      G.ui.logEl.innerHTML = '';
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
      G.state = 'pause';
    });
    result.scenes[name] = await page.evaluate(() => {
      const rr = G.renderer, old = rr.info.autoReset, ms = [];
      rr.info.autoReset = false;
      let calls;
      for (let i = 0; i < 4; i++) {
        rr.info.reset(); const t = performance.now();
        G.composer.render(); rr.getContext().finish();
        ms.push(performance.now() - t); calls = rr.info.render.calls;
      }
      rr.info.autoReset = old;
      ms.sort((a, b) => a - b);
      return { calls, frameMs: (ms[1] + ms[2]) / 2, textures: rr.info.memory.textures };
    });
    await page.screenshot({ path: path.join(out, name + '.png'), timeout: 120000 });
  }
  await scene('fristaden-12', () => { G.camLock = null; G.game.loadFloor(0); G.state = 'play'; setHour(12); goto(24, 23); });
  await scene('fristaden-22', () => { G.state = 'play'; setHour(22); goto(24, 23); });
  for (const n of [1, 3, 5]) await scene('nivaa-' + n, `G.camLock = null; G.game.loadFloor(${n}, 1917); G.ui.hideScreens(); G.state = 'play'; sim(0.5);`);
  for (const [id, arrival] of [['akershus', 'castle'], ['sortmund', 'west'], ['ekeskogen', 'north'], ['ridderskors', 'gate']]) {
    await scene(id + '-12', `G.camLock = null; area('${id}', '${arrival}', 12);`);
  }
  await scene('akershus-20', () => { G.camLock = null; area('akershus', 'castle', 20); });
  await page.evaluate(() => { G.state = 'play'; G.travel.open('fristaden'); });
  await page.screenshot({ path: path.join(out, 'reisekart.png'), timeout: 120000 });
  await page.evaluate(() => { G.travel.sel = 'sortmund'; G.travel.info(); G.travel.draw(); });
  assert.ok(await page.evaluate(() => G.travel.route('fristaden', 'sortmund').hours > 0));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: path.join(out, 'reisekart-mobil.png'), timeout: 120000 });
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.evaluate(() => { G.travel.close(); G.game.loadFloor(0); G.ui.hideScreens(); G.state = 'play'; setHour(12); talk('cassian'); });
  await page.screenshot({ path: path.join(out, 'samtale.png'), timeout: 120000 });
  await page.evaluate(() => {
    G.talk.close(); G.state = 'play';
    G.run.ivan.stage = 1; G.run.ivan.day0 = 0; G.run.ivan.deadline = 7 * 24 + 6;
    G.game.pause();
  });
  assert.ok(await page.locator('#pause-quests').innerText());
  await page.screenshot({ path: path.join(out, 'journal.png'), timeout: 120000 });
  if (!before) {
    result.assets = await page.evaluate(() => Object.keys(window.TEX || {}).length);
    assert.equal(result.assets, 50, 'bildesettet er ufullstendig');
    assert.ok(await page.evaluate(() => [...document.querySelectorAll('#travel,#dialog')].every(el => getComputedStyle(el.querySelector('.panel')).backgroundImage.includes('data:image/jpeg'))));
  }
  assert.deepEqual(result.resourceRequests, [], 'bilder ble hentet utenfor HTML-fila');
  assert.deepEqual(result.errors, [], 'feil i konsollen');
} finally {
  fs.writeFileSync(path.join(out, 'resultat.json'), JSON.stringify(result, null, 2));
  await browser.close(); server.close();
}
console.log(JSON.stringify(result, null, 2));
