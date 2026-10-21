// Samme Arno og kamera før/etter. ROOT kan peke på en urørt worktree.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { chromium } from 'playwright';

const root = path.resolve(process.env.ROOT || new URL('../../', import.meta.url).pathname);
const out = path.resolve(process.argv[2] || 'dist/arno-bilder');
fs.mkdirSync(out, { recursive: true });
const html = fs.readFileSync(path.join(root, 'dist/index.html'));
const server = http.createServer((req, res) => { res.setHeader('Content-Type', 'text/html'); res.end(html); });
await new Promise(r => server.listen(0, '127.0.0.1', r));
const browser = await chromium.launch({ executablePath: process.env.CHROME || undefined,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const result = { errors: [], views: [] };
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  page.setDefaultTimeout(90000);
  page.on('pageerror', e => result.errors.push(e.stack || e.message));
  page.on('console', m => { if (m.type() === 'error') result.errors.push(m.text()); });
  await page.route(/cdn\.jsdelivr\.net\/npm\/three@[^/]+\/(.*)$/, r => r.fulfill({
    contentType: 'application/javascript', body: fs.readFileSync(path.join(root, 'node_modules/three', r.request().url().match(/three@[^/]+\/(.*)$/)[1])),
  }));
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.fulfill({ body: '', contentType: 'text/css' }));
  await page.addInitScript(() => localStorage.setItem('svartnebb.settings.v1', JSON.stringify({ quality: 'middels', music: 0, sfx: 0 })));
  for (const f of ['sim.js', 'town.js']) await page.addInitScript(fs.readFileSync(path.join(root, 'tools/test', f), 'utf8'));
  await page.goto(`http://127.0.0.1:${server.address().port}/DoD-Roguelite/`);
  await page.waitForFunction(() => window.G?.game?.title);
  await page.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important}' });
  await page.keyboard.press('Enter');
  await page.locator('#mi-quick').click();
  await page.waitForFunction(() => G.state === 'play' && !G.game.wiping);
  await page.evaluate(() => {
    G.run.world = { region: 'caddo', x: 24, y: 20, maps: {}, known: {} };
    G.game.loadTemplate({ kind: 'by', id: 'arno' }, 'west');
    setHour(12); G.weather.force('klart');
  });
  for (const [name, x, y, fov] of [['vertshus', 17, 22, 45], ['oversikt', 23, 26, 65]]) {
    await page.evaluate(({ x, y, fov }) => {
      G.state = 'play'; goto(x, y, 1);
      G.camLock = G.player.pos.clone().setY(0.6);
      G.camera.fov = fov; G.camera.updateProjectionMatrix();
    }, { x, y, fov });
    await page.waitForTimeout(1200);
    const metrics = await page.evaluate(() => {
      G.state = 'pause'; G.ui.hideScreens();
      const r = G.renderer; r.info.autoReset = false; r.info.reset(); G.composer.render();
      const m = { calls: r.info.render.calls, triangles: r.info.render.triangles, geometries: r.info.memory.geometries, textures: r.info.memory.textures };
      r.info.autoReset = true;
      return m;
    });
    await page.screenshot({ path: path.join(out, name + '.jpg'), type: 'jpeg', quality: 88, timeout: 90000 });
    result.views.push({ name, ...metrics });
  }
  if (result.errors.length) throw new Error(result.errors.join('\n'));
} finally {
  fs.writeFileSync(path.join(out, 'resultat.json'), JSON.stringify(result, null, 2));
  await browser.close(); server.close();
}
console.log(JSON.stringify(result));
