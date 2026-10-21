// Samme kamera før/etter, ekte shaderkompilering, vær og detaljer som følger taket.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const root = path.resolve(process.env.ROOT || new URL('../../', import.meta.url).pathname);
const current = new URL('../../', import.meta.url).pathname;
const out = path.resolve(process.argv[2] || 'dist/landskap-test');
const baseline = !!process.env.BASELINE;
fs.mkdirSync(out, { recursive: true });
const html = fs.readFileSync(path.join(root, 'dist/index.html'));
const server = http.createServer((req, res) => { res.setHeader('Content-Type', 'text/html'); res.end(html); });
await new Promise(r => server.listen(0, '127.0.0.1', r));
const browser = await chromium.launch({ executablePath: process.env.CHROME || undefined,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const result = { baseline, errors: [], views: [], checks: {} };
try {
  const page = await browser.newPage({ viewport: { width: 960, height: 720 } });
  page.setDefaultTimeout(120000);
  page.on('pageerror', e => result.errors.push(e.stack || e.message));
  page.on('console', m => { if (m.type() === 'error') result.errors.push(m.text()); });
  await page.route(/cdn\.jsdelivr\.net\/npm\/three@[^/]+\/(.*)$/, r => r.fulfill({
    contentType: 'application/javascript', body: fs.readFileSync(path.join(root, 'node_modules/three', r.request().url().match(/three@[^/]+\/(.*)$/)[1])),
  }));
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.fulfill({ body: '', contentType: 'text/css' }));
  for (const f of ['sim.js', 'town.js']) await page.addInitScript(fs.readFileSync(path.join(current, 'tools/test', f), 'utf8'));
  await page.addInitScript(() => {
    localStorage.setItem('svartnebb.settings.v1', JSON.stringify({ quality: 'lav', music: 0, sfx: 0 }));
    let seed = 1941;
    Math.random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  });
  await page.goto(`http://127.0.0.1:${server.address().port}/DoD-Roguelite/`);
  await page.waitForFunction(() => window.G?.game?.title);
  await page.addStyleTag({ content: '#banner{display:none!important}' });
  await page.evaluate(() => {
    G.game.startRun(); G.game.loop = () => {};
    G.ui.hideScreens(); G.ui.hud.hidden = true; G.ui.prompt.hidden = true; G.ui.logEl.style.display = 'none';
  });
  async function view(name, place, x, z, weather = 'klart', quality = 'lav') {
    console.log('Bilde:', name);
    const stats = await page.evaluate(({ place, x, z, weather, quality }) => {
      if (place === 'fristaden') G.game.loadFloor(0);
      else if (place === 'arno') {
        G.run.world.region = 'caddo'; G.game.loadTemplate({ kind: 'by', id: 'arno' });
      } else G.game.loadArea(place, 'west');
      G.state = 'play'; setHour(12);
      G.game.settings.quality = quality; G.game.applySettings();
      G.weather.force(weather); G.weather.snap();
      G.player.pos.set(x * 2, 0, z * 2); G.player.vel.set(0, 0, 0); G.player.invuln = 99999;
      G.game.camTarget.copy(G.player.pos).setY(0.6);
      G.camera.fov = place === 'sortmund' ? 45 : 58; G.camera.updateProjectionMatrix();
      G.camera.position.copy(G.game.camTarget).add({ x: 10.4, y: 15.6, z: 10.4 }); G.camera.lookAt(G.game.camTarget);
      G.game.townLights(0); G.game.updateLights(0);
      G.weather.update(0, G.game.camTarget, 0); G.dungeon.update(0, G.player, G.game.townLights(0));
      G.state = 'pause'; G.ui.hideScreens(); G.ui.hud.hidden = true;
      G.ui.prompt.hidden = true; G.ui.logEl.style.display = 'none';
      G.game.renderPass.scene = G.scene; G.game.renderPass.camera = G.camera;
      const renderer = G.renderer; renderer.info.autoReset = false; renderer.info.reset();
      G.composer.render(); renderer.getContext().finish();
      const data = { calls: renderer.info.render.calls, triangles: renderer.info.render.triangles,
        geometries: renderer.info.memory.geometries, textures: renderer.info.memory.textures,
        roofKinds: G.dungeon.buildings.map(b => ({ id: b.id, kind: b.architecture?.kind, pitch: b.roofPitch, dormers: b.architecture?.dormers })) };
      renderer.info.autoReset = true;
      return data;
    }, { place, x, z, weather, quality });
    await page.screenshot({ path: path.join(out, name + '.jpg'), type: 'jpeg', quality: 88 });
    result.views.push({ name, ...stats });
    return stats;
  }
  await view('fristaden-hus', 'fristaden', 14, 12);
  await view('arno-hus', 'arno', 17, 22);
  await view('sortmund-sti', 'sortmund', 30, 33);
  if (!baseline) {
    result.checks.weights = await page.evaluate(() => {
      let vertices = 0, mixed = 0, invalid = 0;
      G.dungeon.group.traverse(m => {
        const w = m.geometry?.getAttribute('terrainWeights');
        if (!w) return;
        for (let i = 0; i < w.count; i++) {
          const a = [w.getX(i), w.getY(i), w.getZ(i), w.getW(i)]; vertices++;
          if (a.filter(v => v > 0.01).length > 1) mixed++;
          if (a.some(v => !Number.isFinite(v) || v < 0) || Math.abs(a.reduce((a, b) => a + b) - 1) > 0.001) invalid++;
        }
      });
      return { vertices, mixed, invalid };
    });
    assert.ok(result.checks.weights.mixed > 100); assert.equal(result.checks.weights.invalid, 0);
    const probe = kind => page.evaluate(kind => {
      const r = G.renderer, mat = kind === 'surface' ? G.dungeon.M.timber : G.dungeon.M.terrain;
      const sh = { uniforms: {}, vertexShader: '', fragmentShader: '' }; mat.onBeforeCompile(sh, r);
      const blend = sh.uniforms[kind === 'surface' ? 'uSurfaceDetail' : kind === 'wetness' ? 'uWet' : 'uTerrainBlend'];
      const on = kind === 'wetness' ? blend.value : 1;
      const canvas = document.createElement('canvas'); canvas.width = r.domElement.width; canvas.height = r.domElement.height;
      const ctx = canvas.getContext('2d');
      const pixels = value => { blend.value = value; G.composer.render(); ctx.drawImage(r.domElement, 0, 0); return ctx.getImageData(0, 0, canvas.width, canvas.height).data; };
      const diff = (a, b) => { let n = 0; for (let i = 0; i < a.length; i += 4) if (Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]) + Math.abs(a[i + 2] - b[i + 2]) > 5) n++; return n; };
      const hard = pixels(0), soft = pixels(on), stable = diff(soft, pixels(on));
      const ground = []; G.dungeon.group.traverse(m => {
        const affected = kind === 'surface' ? m.material?.userData.surface : kind === 'wetness' ? m.material?.customProgramCacheKey().includes('|wet') : m.material === mat;
        if (affected && m.visible) { ground.push(m); m.visible = false; }
      });
      const negative = diff(pixels(0), pixels(on));
      ground.forEach(m => { m.visible = true; }); pixels(on);
      return { changed: diff(hard, soft), stable, negative, on };
    }, kind);
    result.checks.blend = await probe('blend');
    assert.ok(result.checks.blend.changed > 100); assert.equal(result.checks.blend.stable, 0); assert.equal(result.checks.blend.negative, 0);
    await view('arno-regn', 'arno', 17, 22, 'regn', 'middels');
    result.checks.roadJunction = await page.evaluate(async () => {
      const THREE = await import('three'), D = G.dungeon, mat = D.M.terrain, r = G.renderer;
      const compile = mat.onBeforeCompile, key = mat.customProgramCacheKey, tone = mat.toneMapped;
      const oldTarget = r.getRenderTarget(), scene = new THREE.Scene();
      const target = new THREE.WebGLRenderTarget(1152, 512);
      const camera = new THREE.OrthographicCamera(-18, 18, 8, -8, 0.1, 120);
      camera.position.set(46, 100, 46); camera.up.set(0, 0, -1); camera.lookAt(46, 0, 46);
      // Vis de faktiske shadervektene: rødt = brostein, blått = jord, grønt = vegetasjon.
      mat.onBeforeCompile = (sh, renderer) => {
        compile.call(mat, sh, renderer);
        sh.fragmentShader = sh.fragmentShader.replace('#include <opaque_fragment>',
          'outgoingLight = vec3(terrainW.z, terrainW.x + terrainW.w, terrainW.y);\n#include <opaque_fragment>');
      };
      mat.customProgramCacheKey = () => key.call(mat) + '|road-test';
      mat.toneMapped = false; mat.needsUpdate = true;
      D.group.traverse(m => { if (m.material === mat) scene.add(new THREE.Mesh(m.geometry, mat)); });
      const pixels = new Uint8Array(1152 * 512 * 4);
      try {
        r.setRenderTarget(target); r.render(scene, camera); r.readRenderTargetPixels(target, 0, 0, 1152, 512, pixels);
      } finally {
        r.setRenderTarget(oldTarget); mat.onBeforeCompile = compile; mat.customProgramCacheKey = key;
        mat.toneMapped = tone; mat.needsUpdate = true; target.dispose(); scene.clear();
      }
      const sample = (x, z) => {
        const px = Math.floor((x - 28) * 32), py = Math.floor((54 - z) * 32), i = (py * 1152 + px) * 4;
        return { x, z, stone: pixels[i], vegetation: pixels[i + 1], earth: pixels[i + 2] };
      };
      const crossing = [32, 34, 35.8, 36, 36.2, 40, 52, 55.8, 56, 56.2, 58, 60].map(x => sample(x, 45));
      let tufts = 0, inRoad = 0;
      const matrix = new THREE.Matrix4();
      D.group.traverse(m => {
        if (!m.isInstancedMesh || m.material !== D.M.tuft) return;
        for (let i = 0; i < m.count; i++) {
          m.getMatrixAt(i, matrix); const x = matrix.elements[12], z = matrix.elements[14]; tufts++;
          for (const road of D.roads) {
            if (road.ground !== 2) continue;
            for (let j = 1; j < road.points.length; j++) {
              const [ax, az] = road.points[j - 1].map(n => n * 2), [bx, bz] = road.points[j].map(n => n * 2);
              const dx = bx - ax, dz = bz - az, t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz)));
              if (Math.hypot(x - ax - t * dx, z - az - t * dz) < road.width + 0.65) inRoad++;
            }
          }
        }
      });
      const doorThresholds = [[31, 41.55], [55, 41.55], [31, 52.45], [59, 52.45]].map(([x, z]) => sample(x, z));
      return { crossing, doorThresholds, pavedCore: sample(44, 45), pavedFarSide: sample(54, 45), earthCore: sample(32, 45), grass: sample(62, 49), tufts, inRoad };
    });
    const junction = result.checks.roadJunction;
    assert.ok(junction.crossing.every(p => p.vegetation < 8 && p.stone + p.earth > 240), JSON.stringify(junction));
    assert.ok(junction.pavedCore.stone > 245 && junction.earthCore.earth > 245);
    assert.ok(junction.pavedFarSide.stone > 245, 'Adkomsten har revet opp brosteinen på motsatt side av torget');
    assert.ok(junction.doorThresholds.every(p => p.vegetation < 8 && p.stone + p.earth > 240), JSON.stringify(junction.doorThresholds));
    assert.ok(junction.grass.vegetation > 245); assert.ok(junction.tufts > 100); assert.equal(junction.inRoad, 0);
    for (const kind of ['surface', 'wetness']) {
      const r = result.checks[kind] = await probe(kind);
      assert.ok(r.changed > 100); assert.equal(r.stable, 0); assert.equal(r.negative, 0);
    }
    assert.ok(result.checks.wetness.on > 0.5);
    result.checks.roofs = await page.evaluate(() => {
      const D = G.dungeon, b = D.buildings.find(b => b.architecture.dormers > 0);
      const signature = house => {
        const values = []; house.roofG.traverse(m => { if (m.geometry) values.push(m.geometry.attributes.position.count); });
        return values;
      };
      const before = signature(b), id = b.id;
      G.player.pos.set((b.x0 + b.x1 + 1) / 2 * 2, 0, (b.y0 + b.y1 + 1) / 2 * 2);
      for (let i = 0; i < 100; i++) D.update(0.1, G.player, G.game.townLights(0));
      const faded = { alpha: b.roofA, visible: b.roofG.visible, allMats: b.roofMats.every(m => m.opacity === b.roofA) };
      G.game.loadTemplate({ kind: 'by', id: 'arno' });
      return { before, after: signature(G.dungeon.buildings.find(b => b.id === id)), ...faded };
    });
    assert.ok(result.checks.roofs.alpha < 0.05); assert.equal(result.checks.roofs.visible, false);
    assert.ok(result.checks.roofs.allMats); assert.deepEqual(result.checks.roofs.before, result.checks.roofs.after);
    await view('arno-lav', 'arno', 17, 22);
  }
  assert.deepEqual(result.errors, []);
} finally {
  fs.writeFileSync(path.join(out, 'resultat.json'), JSON.stringify(result, null, 2));
  await browser.close(); await new Promise(r => server.close(r));
}
console.log(JSON.stringify(result, null, 2));
