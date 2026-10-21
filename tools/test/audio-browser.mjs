// Ekte WebAudio i sluttbygget: gang/pause, rom, ressursgrenser og taktbytte.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const root = new URL('../../', import.meta.url).pathname;
const out = path.resolve(process.argv[2] || 'dist/lydtest');
fs.mkdirSync(out, { recursive: true });
const html = fs.readFileSync(path.join(root, 'dist/index.html'), 'utf8');
for (const f of ['index.html', 'artifact.html']) {
  const body = fs.readFileSync(path.join(root, 'dist', f), 'utf8');
  assert.ok(body.includes('Copyright (c) 2026 iamlukethedev') && body.includes('Permission is hereby granted'), 'MIT-merknaden mangler i ' + f);
}
const server = http.createServer((req, res) => {
  const name = new URL(req.url, 'http://localhost').pathname;
  if (name.startsWith('/src/') && /^\/src\/[\w-]+\.js$/.test(name)) {
    res.setHeader('Content-Type', 'application/javascript'); res.end(fs.readFileSync(path.join(root, name))); return;
  }
  res.setHeader('Content-Type', 'text/html'); res.end(html);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const browser = await chromium.launch({ executablePath: process.env.CHROME || undefined,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const result = { errors: [] };
try {
  const page = await browser.newPage({ viewport: { width: 1100, height: 760 } });
  page.setDefaultTimeout(90000);
  page.on('pageerror', e => result.errors.push(e.stack || e.message));
  page.on('console', m => { if (m.type() === 'error') result.errors.push(m.text()); });
  await page.route(/cdn\.jsdelivr\.net\/npm\/three@[^/]+\/(.*)$/, r => r.fulfill({
    contentType: 'application/javascript', body: fs.readFileSync(path.join(root, 'node_modules/three', r.request().url().match(/three@[^/]+\/(.*)$/)[1])),
  }));
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.fulfill({ body: '', contentType: 'text/css' }));
  await page.addInitScript(() => localStorage.setItem('svartnebb.settings.v1', JSON.stringify({ quality: 'lav', music: 20, sfx: 70 })));
  for (const f of ['sim.js', 'town.js']) await page.addInitScript(fs.readFileSync(path.join(root, 'tools/test', f), 'utf8'));
  await page.goto(`http://127.0.0.1:${server.address().port}/DoD-Roguelite/`);
  await page.waitForFunction(() => window.G?.game?.title);
  await page.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important}' });
  await page.keyboard.press('Enter'); await page.locator('#mi-quick').click();
  await page.waitForFunction(() => G.state === 'play' && !G.game.wiping);
  assert.equal(await page.evaluate(() => G.audio.ctx.state), 'running');
  await page.evaluate(() => { goto(18, 21.5, 0.5); G.audio.space.update(); });
  const before = await page.evaluate(() => G.audio.space.stats.steps);
  await page.keyboard.down('d');
  try { await page.waitForFunction(n => G.audio.space.stats.steps > n, before, { timeout: 15000 }); }
  finally { await page.keyboard.up('d'); }
  await page.keyboard.press('Escape'); await page.waitForFunction(() => G.state === 'pause');
  const paused = await page.evaluate(() => G.audio.space.stats.steps);
  await page.waitForTimeout(450);
  assert.equal(await page.evaluate(() => G.audio.space.stats.steps), paused, 'pause gir nye steg');
  result.gang = { before, after: paused, pause: true };
  console.log('Tastaturgang og pause bestod');

  result.underlag = await page.evaluate(async () => {
    const { stepSurface } = await import('/src/audio-space.js');
    const D = G.dungeon, found = {};
    for (let y = 0; y < D.H; y++) for (let x = 0; x < D.W; x++) {
      if (D.get(x, y) !== 1 && D.get(x, y) !== 2) continue;
      const P = { pos: { x: (x + 0.5) * 2, z: (y + 0.5) * 2 } };
      const surface = stepSurface(D, P); found[surface] ||= [x, y];
    }
    const bridge = [...D.bridgeMap].findIndex(x => x > 0);
    return { found, bridge: stepSurface(D, { pos: { x: (bridge % D.W + 0.5) * 2, z: (Math.floor(bridge / D.W) + 0.5) * 2 } }) };
  });
  assert.deepEqual(Object.keys(result.underlag.found).sort(), ['gress', 'jord', 'stein', 'tre', 'vann']);
  assert.equal(result.underlag.bridge, 'tre');

  result.pool = await page.evaluate(async () => {
    const a = G.audio, s = a.space;
    a.setMuted(true); const before = s.stats.steps;
    for (let i = 0; i < 20; i++) s.step('stein', G.player.pos);
    const muted = s.stats.steps === before;
    a.setMuted(false);
    for (let i = 0; i < 100; i++) s.step(['stein', 'tre', 'gress', 'jord', 'vann'][i % 5], G.player.pos);
    const size = s.voices.length, dropped = s.stats.dropped;
    await new Promise(r => setTimeout(r, 500));
    return { muted, size, dropped, active: s.voices.filter(v => v.source).length, buffers: s.buffers.size };
  });
  assert.ok(result.pool.muted && result.pool.size <= 12 && result.pool.dropped > 0);
  assert.equal(result.pool.active, 0); assert.ok(result.pool.buffers <= 15);

  await page.evaluate(() => { G.player.pos.set(49, 0, 17); G.audio.space.update(); });
  await page.waitForFunction(() => G.audio.space.room === 'stein');

  result.arno = await page.evaluate(() => {
    G.state = 'play'; G.run.world = { region: 'caddo', x: 24, y: 20, maps: {}, known: {} };
    G.game.loadTemplate({ kind: 'by', id: 'arno' }, 'west');
    const roofs = () => G.dungeon.buildings.map(b => ({ id: b.id, doors: b.doors,
      hash: b.roofG.children.filter(o => o.isMesh).map(o => {
        let h = 0; for (const p of o.geometry.attributes.position.array) h = (Math.imul(h, 31) + Math.round(p * 10000)) | 0; return h;
      }) }));
    const first = roofs(); G.game.loadTemplate({ kind: 'by', id: 'arno' }, 'west');
    const second = roofs();
    const D = G.dungeon;
    const doors = D.buildings.every(b => b.doors.every(([x, y]) => !D.pointBlocked((x + 0.5) * 2, (y + 0.5) * 2)));
    const b = D.buildings.find(b => b.id.endsWith('_inn'));
    G.player.pos.set((b.doors[0][0] + 0.5) * 2, 0, (b.y1 - 0.5) * 2); G.player.vel.set(0, 0, 0);
    for (let i = 0; i < 40; i++) D.update(0.05, G.player, G.game.townLights(0.05));
    G.audio.space.update();
    G.state = 'pause';
    return { first, second, doors, open: !b.roofG.visible && !b.frontFull.visible && b.frontLowG.visible,
      hasVariants: D.buildings.every(b => b.harbor), inn: !!G.audio.music.wantInn };
  });
  assert.deepEqual(result.arno.first, result.arno.second, 'husene skifter ved nytt besøk');
  assert.ok(result.arno.doors && result.arno.open && result.arno.hasVariants && result.arno.inn);
  await page.waitForFunction(() => G.audio.space.room === 'tre');
  await page.evaluate(() => { G.player.pos.set(45, 0, 47); G.audio.space.update(); });
  await page.waitForFunction(() => G.audio.space.room === 'ute');
  const noTeleportSteps = await page.evaluate(() => G.audio.space.stats.steps);
  await page.evaluate(() => { G.player.pos.set(5, 0, 5); G.player.walkPhase += 3.3; G.audio.space.update(); });
  assert.equal(await page.evaluate(() => G.audio.space.stats.steps), noTeleportSteps);
  result.rooms = await page.evaluate(async () => {
    const seen = ['stein', 'tre', 'ute'];
    for (const [depth, name] of [[1, 'kloakk'], [3, 'hall']]) {
      G.game.loadFloor(depth, 139); G.player.invuln = 999;
      await new Promise(r => setTimeout(r, 420)); G.audio.space.update();
      seen.push(G.audio.space.room);
    }
    return { seen, impulses: G.audio.space.impulses.size };
  });
  assert.deepEqual(result.rooms.seen, ['stein', 'tre', 'ute', 'kloakk', 'hall']);
  assert.ok(result.rooms.impulses <= 5);
  console.log('Underlag, lydgrense, rom og Arnos dører/tak bestod');

  result.music = await page.evaluate(async () => {
    // GPU-emuleringen kan blokkere JS i sekunder. Lydklokka testes uten rendering.
    const render = G.composer.render; G.composer.render = () => {};
    try {
      const m = G.audio.music; m.stop(); m.setIntensity(0); m.play('explore', { fast: true });
      await new Promise(r => setTimeout(r, 250));
      const s = m.current, bar = s.song.beats * s.song.sub;
      const expected = s.start + Math.ceil(s.n / bar) * bar * s.sd;
      m.play('boss'); m.play('boss'); const pending = m.pending.name;
      m.play('explore'); const cancelled = m.pending === null;
      m.play('town'); m.setIntensity(0.9);
      const early = m.name;
      for (let i = 0; i < 120 && m.name !== 'town'; i++) await new Promise(r => setTimeout(r, 50));
      const landed = { name: m.name, start: m.current.start, beats: m.current.song.beats, target: m.barTarget };
      const t = m.current;
      const until = performance.now() + 800; while (performance.now() < until) { /* en reell JS-stans */ }
      m._tick();
      const afterStall = Math.abs((t.next - t.start) / t.sd - t.n);
      m.play('boss'); m.play('boss', { fast: true }); const fast = m.name;
      m.play('town'); m.play('death', { fast: true });
      return { expected, pending, cancelled, early, landed, afterStall, fast, death: m.name, cleared: m.pending === null };
    } finally { G.composer.render = render; }
  });
  assert.equal(result.music.pending, 'boss'); assert.ok(result.music.cancelled && result.music.cleared);
  assert.equal(result.music.early, 'explore'); assert.equal(result.music.landed.name, 'town');
  assert.ok(Math.abs(result.music.landed.start - result.music.expected) < 0.000001);
  assert.equal(result.music.landed.beats, 3); assert.equal(result.music.landed.target, 0.9);
  assert.ok(result.music.afterStall < 0.000001, 'JS-stans flyttet takten');
  assert.equal(result.music.death, 'death');
  assert.equal(result.music.fast, 'boss');
  console.log('Musikkbytte på faktisk lydklokke bestod');

  result.offline = await page.evaluate(async () => {
    const { stepBuffer, roomImpulse } = await import('/src/audio-space.js');
    const ctx = new OfflineAudioContext(1, 22050 * 6, 22050);
    const surfaces = ['stein', 'tre', 'gress', 'jord', 'vann'];
    const steps = surfaces.map((surface, n) => {
      const b = stepBuffer(ctx, surface, 0), a = b.getChannelData(0);
      const s = ctx.createBufferSource(); s.buffer = b; s.connect(ctx.destination); s.start(n + 0.2);
      return { surface, peak: Math.max(...a.map(Math.abs)), rms: Math.sqrt(a.reduce((s, v) => s + v * v, 0) / a.length) };
    });
    const rooms = ['ute', 'tre', 'stein', 'kloakk', 'hall'].map(name => {
      const b = roomImpulse(ctx, name), a = b.getChannelData(0);
      const energy = (a0, a1) => { let e = 0; for (let i = a0; i < a1; i++) e += a[i] * a[i]; return e / (a1 - a0); };
      return { name, duration: b.duration, start: energy(0, a.length / 5 | 0), end: energy(a.length * 0.8 | 0, a.length) };
    });
    const rendered = await ctx.startRendering(), samples = rendered.getChannelData(0);
    return { steps, rooms, finite: samples.every(Number.isFinite), pcm: Array.from(samples, v => Math.round(Math.max(-1, Math.min(1, v)) * 32767)) };
  });
  assert.ok(result.offline.finite);
  for (const s of result.offline.steps) assert.ok(s.peak < 1 && s.rms > 0.01, JSON.stringify(s));
  for (const r of result.offline.rooms) assert.ok(r.end < r.start * 0.01, JSON.stringify(r));
  const pcm = result.offline.pcm; delete result.offline.pcm;
  const wav = Buffer.alloc(44 + pcm.length * 2);
  wav.write('RIFF'); wav.writeUInt32LE(wav.length - 8, 4); wav.write('WAVEfmt ', 8); wav.writeUInt32LE(16, 16);
  wav.writeUInt16LE(1, 20); wav.writeUInt16LE(1, 22); wav.writeUInt32LE(22050, 24); wav.writeUInt32LE(44100, 28);
  wav.writeUInt16LE(2, 32); wav.writeUInt16LE(16, 34); wav.write('data', 36); wav.writeUInt32LE(pcm.length * 2, 40);
  pcm.forEach((s, i) => wav.writeInt16LE(s, 44 + i * 2));
  fs.writeFileSync(path.join(out, 'fotsteg.wav'), wav);
  assert.deepEqual(result.errors, []);
} finally {
  fs.writeFileSync(path.join(out, 'resultat.json'), JSON.stringify(result, null, 2));
  await browser.close(); server.close();
}
console.log(JSON.stringify(result, null, 2));
