// Fotsteg og rom etter teknikkene i The Ninth Vigil (MIT), tilpasset Svart Nebb.
// Referanse: 3355968, audio/Noise.js, VoicePool.js, SFXKit.js og AudioEngine.js.
// Hele lisensen ligger i licenses/the-ninth-vigil.txt og bygges inn i HTML-filene.
import { G, T } from './state.js';
import { GR, WATER } from './townmap.js';

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const ROOMS = {
  ute: { sec: 0.52, decay: 4.5, wet: 0.12, hz: 9000, er: [[0.004, 0.42], [0.009, -0.28]] },
  tre: { sec: 0.82, decay: 3.6, wet: 0.48, hz: 4200, er: [[0.007, 0.4], [0.016, -0.25], [0.029, 0.18]] },
  stein: { sec: 1.5, decay: 3.2, wet: 0.7, hz: 5200, er: [[0.007, 0.55], [0.013, -0.42], [0.022, 0.31], [0.034, -0.21]] },
  kloakk: { sec: 2.55, decay: 3.3, wet: 0.85, hz: 3800, er: [[0.011, 0.52], [0.019, -0.41], [0.029, 0.33], [0.041, -0.26], [0.058, 0.2]] },
  hall: { sec: 3.2, decay: 3.8, wet: 0.92, hz: 4600, er: [[0.017, 0.44], [0.031, -0.36], [0.049, 0.29], [0.071, -0.22]] },
};

function rand(seed) {
  return () => { seed = (Math.imul(seed, 1664525) + 1013904223) | 0; return (seed >>> 0) / 4294967296; };
}

export function stepSurface(D, P) {
  if (!D || !P) return 'stein';
  const x = Math.floor(P.pos.x / T), y = Math.floor(P.pos.z / T);
  const k = y * D.W + x;
  // Bru og brygge vinner over vannet under. Bruk kartet, ikke forrige frames inWater.
  if (D.bridgeMap?.[k]) return 'tre';
  if (D.get(x, y) === WATER) return 'vann';
  if (!D.isTown) return 'stein';
  const g = D.ground?.[k];
  if (g === GR.WOOD || g === GR.PLANK) return 'tre';
  if (g === GR.GRASS || g === GR.OUT) return 'gress';
  if (g === GR.DIRT) return 'jord';
  return 'stein';
}

export function roomAt(D, P, biome) {
  if (biome === 'meny') return 'hall';
  if (!D?.isTown) return biome === 'dverg' || biome === 'rev' ? 'hall' : 'kloakk';
  const b = P && D.insideAt(P.pos.x, P.pos.z);
  if (!b) return 'ute';
  return b.floor === GR.WOOD || b.floor === GR.PLANK ? 'tre' : 'stein';
}

export function roomImpulse(ctx, name) {
  const spec = ROOMS[name] || ROOMS.ute;
  const sr = ctx.sampleRate, len = Math.ceil(sr * spec.sec);
  const buffer = ctx.createBuffer(2, len, sr);
  const r = rand(7103 + Object.keys(ROOMS).indexOf(name) * 97);
  for (let ch = 0; ch < 2; ch++) {
    const a = buffer.getChannelData(ch);
    let smooth = 0;
    for (let i = 0; i < len; i++) {
      smooth += 0.35 * (r() * 2 - 1 - smooth);
      a[i] = smooth * Math.pow(1 - i / len, spec.decay);
    }
    for (const [sec, gain] of spec.er) a[Math.floor((sec + ch * 0.0017) * sr)] += gain;
  }
  return buffer;
}

// Korte, forhåndsberegnede anslag. Delte buffere, ingen oscillatorgraf per fotsteg.
export function stepBuffer(ctx, kind, variant = 0) {
  const sr = ctx.sampleRate, dur = kind === 'vann' ? 0.25 : 0.17;
  const b = ctx.createBuffer(1, Math.ceil(sr * dur), sr), a = b.getChannelData(0);
  const r = rand(813 + variant * 319 + ['stein', 'tre', 'gress', 'jord', 'vann'].indexOf(kind) * 197);
  let low = 0, prev = 0;
  for (let i = 0; i < a.length; i++) {
    const t = i / sr, n = r() * 2 - 1;
    low += 0.11 * (n - low);
    const high = n - prev; prev = n;
    const attack = Math.min(1, t / 0.003);
    const body = Math.sin(2 * Math.PI * (kind === 'tre' ? 145 : 95) * t) * Math.exp(-t * 48);
    let v;
    if (kind === 'tre') v = body * 0.52 + Math.sin(t * 2 * Math.PI * 310) * Math.exp(-t * 65) * 0.18 + high * Math.exp(-t * 115) * 0.1;
    else if (kind === 'vann') v = low * Math.exp(-t * 15) * 1.5 + Math.sin(2 * Math.PI * (620 * t - 800 * t * t)) * Math.exp(-t * 35) * 0.13;
    else if (kind === 'gress') v = high * Math.exp(-t * 35) * 0.16 + low * Math.exp(-t * 42) * 0.5;
    else if (kind === 'jord') v = low * Math.exp(-t * 30) * 0.9 + body * 0.28;
    else v = high * Math.exp(-t * 95) * 0.23 + body * 0.4 + Math.sin(t * 2 * Math.PI * 1140) * Math.exp(-t * 90) * 0.07;
    a[i] = v * attack * Math.min(1, (dur - t) / 0.015);
  }
  return b;
}

export class SoundSpace {
  constructor(sound) {
    this.sound = sound;
    this.ctx = sound.ctx;
    this.input = this.ctx.createGain();
    this.buffers = new Map();
    this.impulses = new Map();
    this.voices = [];
    this.stats = { steps: 0, dropped: 0, surface: null };
    this.room = null;
    this.roomAt = 0;
    this.channel = 0;
    this.channels = [0, 1].map(() => {
      const reverb = this.ctx.createConvolver(), filter = this.ctx.createBiquadFilter(), gain = this.ctx.createGain();
      filter.type = 'lowpass'; gain.gain.value = 0;
      this.input.connect(reverb); reverb.connect(filter); filter.connect(gain); gain.connect(sound.out);
      return { reverb, filter, gain };
    });
    this.setRoom('hall');
  }

  setRoom(name) {
    if (name === this.room || this.ctx.currentTime < this.roomAt) return;
    const now = this.ctx.currentTime, spec = ROOMS[name] || ROOMS.ute;
    if (!this.impulses.has(name)) this.impulses.set(name, roomImpulse(this.ctx, name));
    const from = this.channels[this.channel], to = this.channels[1 - this.channel];
    to.reverb.buffer = this.impulses.get(name);
    to.filter.frequency.value = spec.hz;
    for (const [c, target] of [[from, 0], [to, spec.wet]]) {
      c.gain.gain.cancelScheduledValues(now);
      c.gain.gain.setValueAtTime(c.gain.gain.value, now);
      c.gain.gain.linearRampToValueAtTime(target, now + 0.32);
    }
    this.channel = 1 - this.channel;
    this.room = name;
    // Den stille kanalen må få fade ferdig før bufferet byttes igjen.
    this.roomAt = now + 0.36;
  }

  step(kind, pos, gain = 1, side = 1) {
    if (!this.sound.ok || this.sound.sfxVol <= 0 || this.ctx.state !== 'running') return false;
    const now = this.ctx.currentTime;
    let v = this.voices.find(v => v.until <= now);
    if (!v) {
      if (this.voices.length >= 12) { this.stats.dropped++; return false; }
      const out = this.ctx.createGain(), pan = this.ctx.createStereoPanner();
      out.connect(pan); pan.connect(this.sound.master);
      v = { out, pan, until: 0, source: null }; this.voices.push(v);
    }
    v.source?.disconnect();
    const variant = this.stats.steps % 3, key = kind + variant;
    if (!this.buffers.has(key)) this.buffers.set(key, stepBuffer(this.ctx, kind, variant));
    const source = this.ctx.createBufferSource();
    source.buffer = this.buffers.get(key);
    source.playbackRate.value = 0.94 + variant * 0.055;
    source.connect(v.out);
    source.onended = () => { source.disconnect(); if (v.source === source) v.source = null; };
    const P = G.player?.pos || pos, cam = G.camera?.position || { x: P.x + 1, z: P.z + 1 };
    const dx = pos.x - P.x, dz = pos.z - P.z, dist = Math.hypot(dx, dz);
    const cx = cam.x - P.x, cz = cam.z - P.z;
    v.pan.pan.value = clamp((dx * cz - dz * cx) / Math.max(1, Math.hypot(cx, cz)) / 8 + side * 0.035, -1, 1);
    v.out.gain.value = clamp(gain, 0, 1) * 0.32 / (1 + dist * 0.12);
    v.until = now + source.buffer.duration / source.playbackRate.value + 0.01;
    v.source = source;
    source.start(now);
    this.stats.steps++; this.stats.surface = kind;
    return true;
  }

  update() {
    const P = G.player, D = G.dungeon;
    this.setRoom(roomAt(D, P, this.sound.biome));
    if (!P || !D) return;
    const phase = Math.floor(P.walkPhase / Math.PI);
    const dx = P.pos.x - (this.x ?? P.pos.x), dz = P.pos.z - (this.z ?? P.pos.z);
    const moved = Math.hypot(dx, dz);
    const walking = G.state === 'play' && !G.game?.wiping && !P.dead && !P.ko && !P.forced &&
      !P.action && Math.hypot(P.vel.x, P.vel.z) > 0.3 && moved > 0.0001 && moved < 1.5;
    if (this.level === D && walking && phase !== this.phase) {
      this.step(stepSurface(D, P), P.pos, P.stealth ? 0.25 : clamp(Math.hypot(P.vel.x, P.vel.z) / 5, 0.4, 1), phase % 2 ? -1 : 1);
    }
    this.level = D; this.phase = phase; this.x = P.pos.x; this.z = P.pos.z;
  }
}
