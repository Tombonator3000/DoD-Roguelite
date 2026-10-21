// Hele havneavtalen, eldre lagringer, nytt løp og frist under virkelig sjøreise.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const root = new URL('../../', import.meta.url).pathname;
const out = path.resolve(process.argv[2] || 'dist/kampanje-test');
fs.mkdirSync(out, { recursive: true });
const html = fs.readFileSync(path.join(root, 'dist/index.html'), 'utf8');
const server = http.createServer((req, res) => { res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }); res.end(html); });
await new Promise(r => server.listen(0, '127.0.0.1', r));
const browser = await chromium.launch({ executablePath: process.env.CHROME || undefined,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'] });
const result = { errors: [], steps: [] };
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  page.setDefaultTimeout(90000);
  page.on('pageerror', e => result.errors.push(e.stack || e.message));
  page.on('console', m => { if (m.type() === 'error') result.errors.push(m.text()); });
  await page.route(/cdn\.jsdelivr\.net\/npm\/three@[^/]+\/(.*)$/, async r => {
    const sub = r.request().url().match(/three@[^/]+\/(.*)$/)[1];
    await r.fulfill({ contentType: 'application/javascript', body: fs.readFileSync(path.join(root, 'node_modules/three', sub)) });
  });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.fulfill({ body: '', contentType: 'text/css' }));
  await page.addInitScript(() => {
    localStorage.setItem('svartnebb.settings.v1', JSON.stringify({ quality: 'lav', music: 0, sfx: 0 }));
  });
  for (const f of ['sim.js', 'town.js']) await page.addInitScript(fs.readFileSync(path.join(root, 'tools/test', f), 'utf8'));
  const ready = () => page.waitForFunction(() => G.state === 'play' && !G.game.wiping);
  async function start(continuing = false) {
    await page.goto(`http://127.0.0.1:${server.address().port}/DoD-Roguelite/`);
    await page.waitForFunction(() => window.G?.game?.title);
    await page.addStyleTag({ content: '*,*::before,*::after{animation-duration:0s!important;transition:none!important}' });
    await page.keyboard.press('Enter');
    await page.locator(continuing ? '#mi-continue' : '#mi-quick').click();
    console.log(continuing ? 'Klikket Fortsett etter ny sideåpning' : 'Startet nytt spill');
    await ready();
  }
  async function voyage(region, expectedDays) {
    await page.evaluate(() => { G.talk?.close(); G.game.openWorld(); });
    await page.locator('#btn-w-atlas').click();
    await page.locator('#atlas-country').selectOption(region);
    const before = await page.evaluate(() => G.run.clock);
    const quote = await page.locator('#atlas-route').innerText();
    assert.ok(quote.includes(`${expectedDays} døgn`), quote);
    console.log('Reiser til', region, expectedDays, 'døgn');
    await page.locator('#btn-atlas-travel').click();
    await page.waitForFunction(r => G.state === 'world' && G.run.world.region === r && !G.game.wiping, region);
    const after = await page.evaluate(() => G.run.clock);
    assert.ok(Math.abs(after - before - 24 * expectedDays) < 0.1, `reisetid: ${after - before}`);
    await page.locator('#btn-w-enter').click();
    await ready();
  }
  const state = () => page.evaluate(() => ({ q: G.campaign.quests.havnelisten, people: G.campaign.people, factions: G.campaign.factions, silver: G.player.silver, clock: G.run.clock, place: G.dungeon.L?.place }));
  async function load(slot) { await page.evaluate(s => { G.talk?.close(); G.game.loadSave(s); }, slot); await ready(); }
  async function finish(expected) {
    await page.evaluate(() => talk('gringul_tova'));
    await page.locator('#dlg-kw').getByRole('button', { name: 'LEVER', exact: true }).click();
    assert.equal((await state()).q.stage, 'arno');
    await voyage('caddo', 4);
    await page.evaluate(() => talk('arno_ragna'));
    const before = (await state()).silver;
    await page.locator('#dlg-kw').getByRole('button', { name: 'KVITTERING', exact: true }).click();
    assert.equal((await state()).silver, before + expected);
    await page.evaluate(() => ask('KVITTERING'));
    assert.equal((await state()).silver, before + expected);
    return state();
  }

  await start();
  if (process.env.CAMPAIGN_LAYOUT_ONLY) {
    await page.evaluate(() => { G.run.world.region = 'caddo'; G.game.loadTemplate({ kind: 'by', id: 'arno' }); });
  } else {
    await page.evaluate(() => { G.debugNoEnc = true; G.player.silver = 1000; G.game.openTravel('fristaden'); });
    await page.waitForFunction(() => G.state === 'world' && !G.game.wiping);
    await voyage('caddo', 10);
    await page.evaluate(() => talk('arno_ragna'));
    await page.locator('#dlg-kw').getByRole('button', { name: 'OPPDRAG', exact: true }).click();
    await page.locator('#dlg-kw').getByRole('button', { name: 'JA', exact: true }).click();
    await page.evaluate(() => {
      G.talk.close();
      const it = G.interactables.find(i => i.kind === 'quest');
      G.player.pos.set(it.pos.x, 0, it.pos.z + 1.1);
      sim(0.1);
    });
    await page.keyboard.press('e');
    await page.waitForFunction(() => G.campaign.quests.havnelisten.stage === 'gringul');
    await page.evaluate(() => {
      const saves = JSON.parse(localStorage.getItem('svartnebb.saves.v1'));
      saves['1'] = saves.auto;
      localStorage.setItem('svartnebb.saves.v1', JSON.stringify(saves));
    });
    result.steps.push({ name: 'Avtale gjennom samtale og henting med E', ...(await state()) });
    await voyage('erebos', 4);
    const sealed = await finish(80);
    assert.equal(sealed.q.state, 'done'); assert.equal(sealed.factions.arno_havn, 1);
    const trusted = await page.evaluate(() => {
      const life = G.dungeon.life, price = life.price('v_arno_hand', 100, true);
      G.campaign.factions.arno_havn = 0;
      const base = life.price('v_arno_hand', 100, true);
      G.campaign.factions.arno_havn = 1;
      return { price, base, note: life.priceNote('v_arno_hand') };
    });
    assert.ok(trusted.price < trusted.base); assert.ok(trusted.note.includes('havnas tillit'));
    result.steps.push({ name: 'Helt segl, fire døgn hver vei og én betaling', ...sealed });
    await page.evaluate(() => { G.talk.close(); talk('v_arno_bonde'); });
    assert.ok((await page.locator('#dlg-text').innerText()).includes('holdt ord'));
    await page.screenshot({ path: path.join(out, 'arno-husker.jpg'), type: 'jpeg', quality: 85 });
    const memory = await page.evaluate(() => {
      G.talk.close();
      const clock = G.run.clock;
      G.game.onDeath(true, 'test av verdensminne'); G.game.startRun();
      return { clock, resumed: G.run.clock, region: G.run.world.region, state: G.campaign.quests.havnelisten.state, relation: G.campaign.people.arno_ragna.relation };
    });
    assert.equal(memory.state, 'done'); assert.equal(memory.relation, 2); assert.equal(memory.region, 'aidne');
    assert.ok(memory.resumed >= memory.clock);
    result.steps.push({ name: 'Nederlag og nytt løp beholder verden', ...memory });
    await page.waitForFunction(() => JSON.parse(localStorage.getItem('svartnebb.saves.v1')).auto?.run?.area === null);
    await start(true);
    assert.equal((await state()).q.state, 'done');
    result.steps.push({ name: 'Nettleseren åpnes igjen og Fortsett laster verdensminnet' });

    await load('1');
    assert.equal((await state()).q.stage, 'gringul');
    assert.equal((await state()).people.arno_ragna, undefined);
    assert.equal(await page.evaluate(() => G.campaign.areas.arno.objects.havnekiste), 'tom');
    await page.evaluate(() => G.game.pause());
    await page.locator('[data-quest-action="bryt"]').click();
    assert.equal((await state()).q.flags.brutt, true);
    await page.evaluate(() => G.game.resume());
    await voyage('erebos', 4);
    const broken = await finish(20);
    assert.equal(broken.people.arno_ragna.relation, -1); assert.equal(broken.factions.arno_havn, -1);
    const distrusted = await page.evaluate(() => {
      const life = G.dungeon.life, price = life.price('v_arno_hand', 100, true);
      G.campaign.factions.arno_havn = 0; const base = life.price('v_arno_hand', 100, true);
      G.campaign.factions.arno_havn = -1; return { price, base };
    });
    assert.ok(distrusted.price > distrusted.base);
    result.steps.push({ name: 'Lasting erstatter framtiden; brutt segl gir annet oppgjør', ...broken });

    await load('1');
    await page.evaluate(() => { G.run.clock = G.campaign.quests.havnelisten.deadline - 48; G.game.openWorld(); });
    await page.locator('#btn-w-atlas').click();
    await page.locator('#atlas-country').selectOption('aidne');
    assert.ok((await page.locator('#atlas-route').innerText()).includes('Den forseglede havnelisten'));
    await page.locator('#btn-atlas-travel').click();
    await page.waitForFunction(() => G.state === 'world' && G.run.world.region === 'aidne' && !G.game.wiping);
    assert.equal((await state()).q.state, 'failed'); assert.equal((await state()).people.arno_ragna.relation, -1);
    result.steps.push({ name: 'Fristvarsel før ti døgn; fristbrudd under reisen', ...(await state()) });

    await page.evaluate(() => {
      const saves = JSON.parse(localStorage.getItem('svartnebb.saves.v1'));
      saves['3'] = JSON.parse(JSON.stringify(saves['1'])); saves['3'].v = 2; delete saves['3'].campaign;
      saves['3'].run.ivan = { stage: 1, deadline: saves['3'].run.clock + 168, flags: {}, items: {}, dead: {}, clues: [] };
      localStorage.setItem('svartnebb.saves.v1', JSON.stringify(saves));
    });
    await load('3');
    assert.equal(await page.evaluate(() => Object.keys(G.campaign.quests).length), 0);
    assert.equal(await page.evaluate(() => G.campaign.clock === G.run.clock), true);
    result.steps.push({ name: 'v2 migreres uten framtidige oppdrag, og Edelfaras frist beholdes', ...(await state()) });
  }
  const paths = await page.evaluate(() => {
    const n = npc('arno_ragna'), spots = G.dungeon.spots;
    return n.def.sched.slice(1).map(([hour, id], i) => {
      const a = spots[n.def.sched[i][1]], b = spots[id];
      return { hour, id, reachable: !!G.dungeon.npcPath(a.x * 2, a.y * 2, b.x * 2, b.y * 2) };
    });
  });
  assert.ok(paths.every(p => p.reachable), JSON.stringify(paths));
  result.steps.push({ name: 'Ragnas døgnruter er framkommelige', paths });
  await page.evaluate(() => {
    talk('arno_ragna'); ask('OPPDRAG'); ask('JA'); G.talk.close();
    G.interactables.find(i => i.kind === 'quest').onUse();
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => G.game.pause());
  const mobile = await page.evaluate(() => ({ width: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth, text: document.querySelector('#campaign-journal').textContent }));
  assert.ok(mobile.scroll <= mobile.width); assert.ok(mobile.text.includes('Verden som varer'));
  await page.locator('[data-quest-action="bryt"]').click();
  assert.equal((await state()).q.flags.brutt, true);
  await page.screenshot({ path: path.join(out, 'journal-mobil.jpg'), type: 'jpeg', quality: 85 });
  result.steps.push({ name: 'Journalen på 390 piksler', width: mobile.width, scroll: mobile.scroll });
  // Lik, frosset skog med og uten utskjæring. Negativ kontroll skjuler bare trærne.
  await page.setViewportSize({ width: 960, height: 720 });
  const canopy = await page.evaluate(() => {
    G.game.resize();
    G.game.resume(); G.game.loadArea('ekeskogen', 'west');
    G.game.loop = () => {}; G.ui.hideScreens(); G.state = 'pause';
    G.ui.hud.hidden = true; G.ui.prompt.hidden = true; G.ui.logEl.style.display = 'none';
    const D = G.dungeon, P = G.player;
    G.scene.updateMatrixWorld(true);
    let leaf = null;
    D.group.traverse(m => {
      if (leaf || !m.isInstancedMesh || m.material !== D.M.leaf) return;
      m.geometry.computeBoundingSphere();
      const matrix = G.camera.matrixWorld.clone();
      for (let i = 0; i < m.count; i++) {
        m.getMatrixAt(i, matrix);
        const point = m.geometry.boundingSphere.center.clone().applyMatrix4(matrix).applyMatrix4(m.matrixWorld);
        if (point.x > 3 && point.z > 3 && point.x < 89 && point.z < 89 && point.y > 2) { leaf = point; break; }
      }
    });
    if (!leaf) throw Error('Fant ingen trekroner til prøven.');
    // Legg synsstrålen gjennom en ekte krone. Dette er en renderprøve, ikke stifinning.
    const offset = (leaf.y - 1) / (15.6 - 1) * 10.4;
    P.pos.set(leaf.x - offset, 0, leaf.z - offset);
    G.game.camTarget.copy(P.pos); G.camera.position.copy(P.pos).add({ x: 10.4, y: 15.6, z: 10.4 }); G.camera.lookAt(P.pos);
    G.game.updateLights(0);
    G.game.renderPass.scene = G.scene; G.game.renderPass.camera = G.camera;
    const sh = { uniforms: {}, vertexShader: '#include <common>\n#include <begin_vertex>\n#include <project_vertex>', fragmentShader: '#include <common>\nvoid main() {}' };
    D.M.leaf.onBeforeCompile(sh, G.renderer);
    const radius = sh.uniforms.uCutR, normal = radius.value;
    const canvas = document.createElement('canvas'); canvas.width = G.renderer.domElement.width; canvas.height = G.renderer.domElement.height;
    const context = canvas.getContext('2d');
    const pixels = r => { radius.value = r; G.composer.render(); context.drawImage(G.renderer.domElement, 0, 0); return context.getImageData(0, 0, canvas.width, canvas.height).data; };
    const diff = (a, b) => { let n = 0; for (let i = 0; i < a.length; i += 4) if (Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]) + Math.abs(a[i + 2] - b[i + 2]) > 5) n++; return n; };
    const before = pixels(0), after = pixels(normal);
    const changed = diff(before, after), stable = diff(after, pixels(normal));
    const trees = [];
    D.group.traverse(m => { if (m.isInstancedMesh && [D.M.leaf, D.M.spruce, D.M.bark].includes(m.material)) { trees.push([m, m.visible]); m.visible = false; } });
    const control = diff(pixels(0), pixels(normal));
    for (const [m, visible] of trees) m.visible = visible;
    pixels(normal);
    return { changed, stable, control, position: { x: P.pos.x, z: P.pos.z }, treeMeshes: trees.length, radius: normal,
      width: canvas.width, height: canvas.height };
  });
  await page.screenshot({ path: path.join(out, 'trekroner.jpg'), type: 'jpeg', quality: 85 });
  assert.ok(canopy.changed > 50, JSON.stringify(canopy));
  assert.equal(canopy.stable, 0); assert.equal(canopy.control, 0);
  assert.equal(canopy.width, 960); assert.equal(canopy.height, 720);
  result.steps.push({ name: 'Instanserte trekroner viker, med frosset bilde og negativ kontroll', ...canopy });
  assert.deepEqual(result.errors, []);
} finally {
  fs.writeFileSync(path.join(out, 'resultat.json'), JSON.stringify(result, null, 2));
  await browser.close(); await new Promise(r => server.close(r));
}
console.log(JSON.stringify(result, null, 2));
