// Dekoding må være ferdig før Area lages. Feil i ett bilde skal bare bruke reserveparet.
// CHROME=/usr/bin/chromium node tools/test/texture-fallback.mjs
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import http from 'node:http';
import { chromium } from 'playwright';

const root = new URL('../../', import.meta.url).pathname;
const html = fs.readFileSync(path.join(root, 'dist/index.html'), 'utf8');
const server = http.createServer((req, res) => { res.writeHead(200, { 'Content-Type': 'text/html' }); res.end(html); });
await new Promise(r => server.listen(0, '127.0.0.1', r));
const browser = await chromium.launch({ executablePath: process.env.CHROME || undefined,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
try {
  for (const mode of ['full', 'empty', 'broken-normal']) {
    const page = await browser.newPage({ viewport: { width: 640, height: 480 } });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.route(/cdn\.jsdelivr\.net\/npm\/three@[^/]+\/(.*)$/, async r => {
      const sub = r.request().url().match(/three@[^/]+\/(.*)$/)[1];
      await r.fulfill({ contentType: 'application/javascript', body: fs.readFileSync(path.join(root, 'node_modules/three', sub)) });
    });
    await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.fulfill({ body: '', contentType: 'text/css' }));
    await page.addInitScript(mode => {
      localStorage.setItem('svartnebb.settings.v1', JSON.stringify({ quality: 'lav', music: 0, sfx: 0 }));
      let tex;
      Object.defineProperty(window, 'TEX', { get: () => tex, set: v => {
        tex = mode === 'empty' ? {} : v;
        if (mode === 'broken-normal') tex.gress_n = 'data:image/png;base64,AA==';
      } });
    }, mode);
    for (const f of ['sim.js', 'area.js']) await page.addInitScript(fs.readFileSync(path.join(root, 'tools/test', f), 'utf8'));
    await page.goto(`http://127.0.0.1:${server.address().port}/`);
    await page.waitForFunction(() => window.G?.game?.title, null, { timeout: 90000 });
    const r = await page.evaluate(() => {
      area('akershus', 'castle', 12); G.state = 'pause';
      const m = G.dungeon.M, grass = m.ground[3], forest = m.forestFloor;
      return { grassReserve: !!grass.map.isCanvasTexture, forestReserve: !!forest.map.isCanvasTexture,
        decoded: !!grass.map.image.complete, colorSpace: grass.map.colorSpace,
        normalSpace: grass.normalMap.colorSpace, repeat: grass.map.wrapS, anisotropy: grass.map.anisotropy };
    });
    assert.equal(r.grassReserve, mode !== 'full');
    assert.equal(r.forestReserve, mode === 'empty');
    assert.equal(r.colorSpace, 'srgb'); assert.equal(r.normalSpace, '');
    assert.equal(r.repeat, 1000); assert.equal(r.anisotropy, 4);
    if (mode === 'full') assert.equal(r.decoded, true);
    assert.deepEqual(errors, []);
    console.log(mode, r);
    await page.close();
  }
} finally { await browser.close(); server.close(); }
