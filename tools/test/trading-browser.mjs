// Handel via synlige knapper, virkelig sjøreise, Fortsett, lager og mobil.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
const root = new URL('../../', import.meta.url).pathname;
const out = path.resolve(process.argv[2] || 'dist/handel-test');
fs.mkdirSync(out, { recursive: true });
const html = fs.readFileSync(path.join(root, 'dist/index.html'));
const server = http.createServer((req, res) => { res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }); res.end(html); });
await new Promise(r => server.listen(0, '127.0.0.1', r));
const browser = await chromium.launch({ executablePath: process.env.CHROME || undefined, args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const result = { errors: [], steps: [] };
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  page.setDefaultTimeout(90000);
  page.on('pageerror', e => result.errors.push(e.stack || e.message));
  page.on('console', m => { if (m.type() === 'error') result.errors.push(m.text()); });
  await page.route(/cdn\.jsdelivr\.net\/npm\/three@[^/]+\/(.*)$/, r => r.fulfill({ contentType: 'application/javascript', body: fs.readFileSync(path.join(root, 'node_modules/three', r.request().url().match(/three@[^/]+\/(.*)$/)[1])) }));
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.fulfill({ body: '', contentType: 'text/css' }));
  await page.addInitScript(() => localStorage.setItem('svartnebb.settings.v1', JSON.stringify({ quality: 'lav', music: 0, sfx: 0 })));
  for (const f of ['sim.js', 'town.js']) await page.addInitScript(fs.readFileSync(path.join(root, 'tools/test', f), 'utf8'));
  const ready = () => page.waitForFunction(() => G.state === 'play' && !G.game.wiping);
  async function start(resume = false) {
    await page.goto(`http://127.0.0.1:${server.address().port}/DoD-Roguelite/`);
    await page.waitForFunction(() => window.G?.game?.title);
    await page.keyboard.press('Enter');
    await page.locator(resume ? '#mi-continue' : '#mi-quick').click();
    await ready();
  }
  async function market(npc) {
    await page.evaluate(id => { setHour(12); talk(id); }, npc);
    await page.locator('#dlg-kw').getByRole('button', { name: 'HANDELSVARER', exact: true }).click();
    await page.locator('#trade-qty').selectOption('5');
  }
  const state = () => page.evaluate(() => ({ silver: G.player.silver, bag: G.player.bag.filter(e => e.type === 'trade'), market: G.campaign.areas[G.dungeon.L?.place || 'fristaden'].market, clock: G.run.clock }));
  const action = (id, side) => page.locator(`[data-good="${id}"] [data-side="${side}"]`);
  await start(); console.log('Startet');
  await page.evaluate(() => { G.player.silver = 1000; });
  await market('nansen'); console.log('Nansens marked');
  assert.ok(await action('jern', 'buy').isEnabled());
  await page.evaluate(() => { G.game.closeShop(); G.run.world.region = 'caddo'; G.run.world.x = 9; G.run.world.y = 22; G.game.loadTemplate({ kind: 'by', id: 'arno' }); });
  await ready();
  await market('v_arno_hand'); console.log('Markedet i Arno');
  const before = await state();
  await action('lerret', 'buy').click();
  const bought = await state();
  assert.equal(bought.bag[0].qty, 5);
  assert.equal(await page.locator('#silver').innerText(), String(bought.silver));
  assert.equal(bought.market.stock.lerret, before.market.stock.lerret - 5);
  assert.equal(bought.silver, before.silver - bought.bag[0].basis);
  assert.equal(await action('krydder', 'buy').isDisabled(), true); // ikke nok silver til fem pakker
  console.log('Kjøpt lerret');
  await start(true);
  await market('v_arno_hand');
  const restored = await state();
  assert.equal(restored.silver, bought.silver);
  assert.deepEqual(restored.bag, bought.bag);
  assert.equal(restored.market.stock.lerret, bought.market.stock.lerret);
  result.steps.push({ name: 'Kjøp og Fortsett bevarer penger, last og lager', ...restored });
  console.log('Fortsett bevarte handelen');
  await page.evaluate(() => { G.talk.close(); G.game.openWorld(); });
  await page.locator('#btn-w-atlas').click();
  await page.locator('#atlas-country').selectOption('erebos');
  assert.ok((await page.locator('#atlas-route').innerText()).includes('4 døgn'));
  const departure = await page.evaluate(() => G.run.clock);
  await page.locator('#btn-atlas-travel').click();
  await page.waitForFunction(() => G.state === 'world' && G.run.world.region === 'erebos' && !G.game.wiping);
  assert.ok(Math.abs((await page.evaluate(() => G.run.clock)) - departure - 96) < 0.1);
  await page.locator('#btn-w-enter').click(); await ready();
  await market('v_gringul_hand'); console.log('Ankom Gringul');
  await page.locator('.trade-book summary').click();
  assert.ok((await page.locator('.trade-book').innerText()).includes('Arno'));
  assert.ok((await page.locator('.trade-book').innerText()).includes('dag 1'));
  await action('lerret', 'sell').click();
  const sold = await state();
  assert.equal(sold.bag.length, 0); assert.ok(sold.silver > before.silver);
  assert.equal(await page.locator('#silver').innerText(), String(sold.silver));
  assert.ok((await page.locator('#dlg-text').innerText()).includes('Resultat mot innkjøpspris: +'));
  assert.equal(await action('lerret', 'sell').isDisabled(), true);
  await action('salt', 'buy').click();
  result.steps.push({ name: 'Fire døgns betalt reise, fortjeneste og salt til returen', ...(await state()) });
  await page.locator('#trade-qty').scrollIntoViewIfNeeded();
  await page.screenshot({ path: path.join(out, 'handel-gringul.jpg'), type: 'jpeg', quality: 85 });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('.trade-book summary').click();
  await action('salt', 'sell').scrollIntoViewIfNeeded();
  const layout = await page.evaluate(() => ({ width: innerWidth, scroll: document.documentElement.scrollWidth, buttons: [...document.querySelectorAll('.trade-buttons button')].map(b => ({ left: b.getBoundingClientRect().left, right: b.getBoundingClientRect().right, height: b.getBoundingClientRect().height })) }));
  assert.ok(layout.scroll <= layout.width);
  assert.ok(layout.buttons.every(b => b.left >= 0 && b.right <= layout.width && b.height >= 40));
  await page.locator('#trade-qty').scrollIntoViewIfNeeded();
  await page.screenshot({ path: path.join(out, 'handel-mobil.jpg'), type: 'jpeg', quality: 85 });
  result.steps.push({ name: 'Handelsknapper og prisbok på 390 px', ...layout });
  assert.deepEqual(result.errors, []);
  console.log(JSON.stringify(result));
} catch (e) {
  result.failure = e.stack || e.message; console.error(result.failure); throw e;
} finally {
  fs.writeFileSync(path.join(out, 'resultat.json'), JSON.stringify(result, null, 2) + '\n');
  await browser.close(); await new Promise(r => server.close(r));
}
