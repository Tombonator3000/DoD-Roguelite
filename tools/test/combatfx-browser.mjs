// node tools/test/combatfx-browser.mjs [utmappe]
// TEST_SOURCE=1 kj�rer ES-modulene direkte, ellers testes det ferdige bygget.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const root = fileURLToPath(new URL('../../', import.meta.url));
const out = path.resolve(process.argv[2] || path.join(root, 'dist/combatfx-test'));
fs.mkdirSync(out, { recursive: true });
let html;
if (process.env.TEST_SOURCE) {
  const duck = fs.readFileSync(path.join(root, 'assets/duck.bin')).toString('base64');
  const tex = fs.readFileSync(path.join(root, 'assets/duck_tex.jpg')).toString('base64');
  html = '<!doctype html><html lang="no"><head><meta charset="utf-8"></head><body>' +
    fs.readFileSync(path.join(root, 'src/page.html'), 'utf8')
      .replace('/*__DUCK_DATA__*/', () => `window.DUCK_B64="${duck}";window.DUCK_TEX="data:image/jpeg;base64,${tex}";`)
      .replace('/*__GAME_JS__*/', () => "import '/src/main.js';") + '</body></html>';
} else html = fs.readFileSync(path.join(root, 'dist/index.html'), 'utf8');
html = html.replaceAll('https://cdn.jsdelivr.net/npm/three@0.170.0/', '/node_modules/three/');

const server = http.createServer((req, res) => {
  const name = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  if (name === '/') { res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }); res.end(html); return; }
  const file = path.resolve(root, '.' + name), rel = path.relative(root, file);
  if (rel.startsWith('..') || path.isAbsolute(rel) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
    res.writeHead(404); res.end(); return;
  }
  res.writeHead(200, { 'Content-Type': file.endsWith('.js') ? 'text/javascript' : 'application/octet-stream' });
  res.end(fs.readFileSync(file));
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
let browser;
const errors = [], result = {};
try {
  browser = await chromium.launch({
    executablePath: process.env.CHROME || undefined,
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'],
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  page.on('pageerror', e => errors.push(e.stack || e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('response', r => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  await page.addInitScript(() => {
    localStorage.setItem('svartnebb.settings.v1', JSON.stringify({ quality: 'lav', music: 0, sfx: 0 }));
  });
  for (const f of ['sim.js', 'town.js', 'townstress.js', 'stress.js']) {
    await page.addInitScript(fs.readFileSync(path.join(root, 'tools/test', f), 'utf8'));
  }
  await page.goto(`http://127.0.0.1:${server.address().port}/`, { timeout: 90000 });
  await page.addStyleTag({ content: '*,*::before,*::after{animation-duration:0s!important;transition:none!important}' });
  await page.waitForFunction(() => window.G?.game && window.G?.player && window.G?.fx?.combat, null, { timeout: 90000 });
  result.stress = await page.evaluate(() => stress('tjuv', 20));
  assert.deepEqual(result.stress.errors, [], 'stresstesten feilet');
  assert.equal(result.stress.floors.length, 5);
  // Treff- og magishadere m� ogs� kompileres med ekte WebGL.
  await page.evaluate(() => {
    const G = window.G;
    G.player.setSheet(G.game.selectedSheet());
    G.game.startRun(); G.game.loadFloor(1); G.ui.hideScreens(); G.state = 'play';
    G.enemies.forEach(e => { e.dead = true; });
    G.game.settings.quality = 'hoy'; G.game.applySettings();
    G.ui.logEl.innerHTML = '';
  });
  await page.screenshot({ path: path.join(out, 'kloakk.png') });
  await page.evaluate(() => {
    const G = window.G, p = G.player.pos;
    G.fx.impact(p, 0xffcd78, 2.5, 1);
    G.fx.burst('feather', p, 16);
    G.fx.burst('bone', { x: p.x + 1, y: 1, z: p.z }, 12);
    G.fx.burst('heal', { x: p.x - 1, z: p.z }, 12);
    G.fx.ring(p, 3, 0x77b9e8);
    G.fx.slash(p, G.player.yaw, 2.5, Math.PI * 0.9, 1);
    G.fx.update(0.06, G.camera);
    G.state = 'pause';
  });
  await page.screenshot({ path: path.join(out, 'kampeffekter.png') });
  result.cleanup = await page.evaluate(() => {
    const G = window.G, fx = G.fx, counts = [];
    for (let i = 0; i < 8; i++) {
      fx.slash(G.player.pos, 0, 2, Math.PI, 1);
      fx.ring(G.player.pos, 2);
      fx.burst('heal', G.player.pos, 12);
      fx.clearLevel();
      counts.push({ extra: fx.combat.count, slashes: fx.slashes.length, rings: fx.rings.length, particles: fx.add.geo.drawRange.count + fx.norm.geo.drawRange.count });
    }
    G.state = 'play'; G.game.loadFloor(0); G.ui.hideScreens();
    return counts;
  });
  assert.ok(result.cleanup.every(x => Object.values(x).every(n => n === 0)));
  await page.screenshot({ path: path.join(out, 'fristaden.png') });
  result.errors = errors;
  assert.deepEqual(errors, [], 'nettleseren meldte feil');
} finally {
  if (browser) await browser.close();
  await new Promise(resolve => server.close(resolve));
  fs.writeFileSync(path.join(out, 'resultat.json'), JSON.stringify({ ...result, errors }, null, 2));
}
console.log(JSON.stringify(result, null, 2));
