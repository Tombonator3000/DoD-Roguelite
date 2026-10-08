import { Music } from './music.js';

// Prosedyrisk lyd med WebAudio. Ingen lydfiler, alt syntetiseres.
// Kvakket er laget med sagtann gjennom to formantfiltre.

export class Sound {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.master = null;
    this.ambience = null;
    this.biome = null;
    this.dripTimer = 0;
    this.musicVol = 0.7;
    this.sfxVol = 1;
    this.music = null;
  }

  init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return;
    }
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AC();
    } catch (e) {
      this.ctx = null;
      return;
    }
    const c = this.ctx;
    // ut -> kompressor -> høyttaler. Effekter og musikk har hver sin buss, begge sender til romklang.
    this.out = c.createGain();
    this.out.gain.value = this.muted ? 0 : 0.9;
    const comp = c.createDynamicsCompressor();
    comp.threshold.value = -12;
    comp.ratio.value = 3.5;
    this.out.connect(comp);
    comp.connect(c.destination);
    this.master = c.createGain();
    this.master.gain.value = this.sfxVol;
    this.master.connect(this.out);
    this.musicBus = c.createGain();
    this.musicBus.gain.value = this.musicVol * 0.7;
    this.musicBus.connect(this.out);
    this.reverb = c.createConvolver();
    this.reverb.buffer = this._impulse(2.8, 3.0);
    const rvOut = c.createGain();
    rvOut.gain.value = 0.85;
    this.reverb.connect(rvOut);
    rvOut.connect(this.out);
    this.sendS = c.createGain();
    this.sendS.gain.value = 0.16;
    this.master.connect(this.sendS);
    this.sendS.connect(this.reverb);
    this.sendM = c.createGain();
    this.sendM.gain.value = 0.34;
    this.musicBus.connect(this.sendM);
    this.sendM.connect(this.reverb);
    // hvit støy-buffer
    const len = c.sampleRate;
    this.noise = c.createBuffer(1, len, c.sampleRate);
    const data = this.noise.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    this.music = new Music(this);
    if (this.biome) this.music.setBiome(this.biome);
  }

  _impulse(sec, decay) {
    const c = this.ctx, sr = c.sampleRate, len = Math.floor(sr * sec);
    const b = c.createBuffer(2, len, sr);
    for (let ch = 0; ch < 2; ch++) {
      const d = b.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
      // tidlige refleksjoner fra steinvegger
      for (const [ms, a] of [[11, 0.7], [23, 0.5], [37, 0.42], [53, 0.3], [71, 0.22]]) {
        const k = Math.floor((ms + ch * 3) * sr / 1000);
        if (k < len) d[k] += a * (Math.random() < 0.5 ? -1 : 1);
      }
    }
    return b;
  }

  setVolumes(music, sfx) {
    this.musicVol = music;
    this.sfxVol = sfx;
    if (!this.ctx) return;
    this.musicBus.gain.setTargetAtTime(music * 0.7, this.ctx.currentTime, 0.1);
    this.master.gain.setTargetAtTime(sfx, this.ctx.currentTime, 0.1);
  }

  setMuted(m) {
    this.muted = m;
    if (this.out) this.out.gain.setTargetAtTime(m ? 0 : 0.9, this.ctx.currentTime, 0.05);
  }

  get ok() {
    return this.ctx && !this.muted;
  }

  _noiseSrc() {
    const s = this.ctx.createBufferSource();
    s.buffer = this.noise;
    s.loop = true;
    return s;
  }

  _env(g, t, a, dcy, peak) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + a + dcy);
  }

  quack(pitch = 1, vol = 1, delay = 0) {
    if (!this.ok) return;
    const c = this.ctx;
    const t = c.currentTime + delay;
    const o = c.createOscillator();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(380 * pitch, t);
    o.frequency.linearRampToValueAtTime(560 * pitch, t + 0.03);
    o.frequency.exponentialRampToValueAtTime(300 * pitch, t + 0.17);
    const f1 = c.createBiquadFilter();
    f1.type = 'bandpass';
    f1.frequency.value = 1050 * pitch;
    f1.Q.value = 5;
    const f2 = c.createBiquadFilter();
    f2.type = 'bandpass';
    f2.frequency.value = 2300 * pitch;
    f2.Q.value = 7;
    const g = c.createGain();
    this._env(g, t, 0.012, 0.18, 0.9 * vol);
    o.connect(f1);
    o.connect(f2);
    const mix = c.createGain();
    mix.gain.value = 1.6;
    f1.connect(mix);
    f2.connect(mix);
    mix.connect(g);
    g.connect(this.master);
    o.start(t);
    o.stop(t + 0.25);
  }

  swing(pitch = 1, vol = 0.35) {
    if (!this.ok) return;
    const c = this.ctx;
    const t = c.currentTime;
    const s = this._noiseSrc();
    const f = c.createBiquadFilter();
    f.type = 'bandpass';
    f.Q.value = 2;
    f.frequency.setValueAtTime(600 * pitch, t);
    f.frequency.exponentialRampToValueAtTime(2600 * pitch, t + 0.12);
    const g = c.createGain();
    this._env(g, t, 0.02, 0.12, vol);
    s.connect(f);
    f.connect(g);
    g.connect(this.master);
    s.start(t, Math.random());
    s.stop(t + 0.2);
  }

  hit(heavy = false) {
    if (!this.ok) return;
    const c = this.ctx;
    const t = c.currentTime;
    const o = c.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(heavy ? 160 : 210, t);
    o.frequency.exponentialRampToValueAtTime(45, t + 0.14);
    const g = c.createGain();
    this._env(g, t, 0.005, heavy ? 0.22 : 0.12, heavy ? 0.9 : 0.6);
    o.connect(g);
    g.connect(this.master);
    o.start(t);
    o.stop(t + 0.3);
    const s = this._noiseSrc();
    const f = c.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = heavy ? 1800 : 3200;
    const g2 = c.createGain();
    this._env(g2, t, 0.002, 0.05, 0.5);
    s.connect(f);
    f.connect(g2);
    g2.connect(this.master);
    s.start(t, Math.random());
    s.stop(t + 0.1);
  }

  bones() {
    if (!this.ok) return;
    for (let i = 0; i < 6; i++) this._click(0.03 * i + Math.random() * 0.02, 1800 + Math.random() * 1600, 0.25);
  }

  _click(delay, freq, vol) {
    const c = this.ctx;
    const t = c.currentTime + delay;
    const o = c.createOscillator();
    o.type = 'square';
    o.frequency.value = freq;
    const g = c.createGain();
    this._env(g, t, 0.001, 0.03, vol);
    o.connect(g);
    g.connect(this.master);
    o.start(t);
    o.stop(t + 0.05);
  }

  squeak() {
    if (!this.ok) return;
    const c = this.ctx;
    const t = c.currentTime;
    const o = c.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(2200, t);
    o.frequency.linearRampToValueAtTime(3400, t + 0.06);
    o.frequency.linearRampToValueAtTime(2600, t + 0.12);
    const g = c.createGain();
    this._env(g, t, 0.01, 0.12, 0.18);
    o.connect(g);
    g.connect(this.master);
    o.start(t);
    o.stop(t + 0.16);
  }

  grunt(low = 1) {
    if (!this.ok) return;
    const c = this.ctx;
    const t = c.currentTime;
    const o = c.createOscillator();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(130 * low, t);
    o.frequency.exponentialRampToValueAtTime(70 * low, t + 0.3);
    const f = c.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = 700;
    const g = c.createGain();
    this._env(g, t, 0.02, 0.3, 0.5);
    o.connect(f);
    f.connect(g);
    g.connect(this.master);
    o.start(t);
    o.stop(t + 0.4);
  }

  roar() {
    if (!this.ok) return;
    const c = this.ctx;
    const t = c.currentTime;
    for (const det of [0, 7, -5]) {
      const o = c.createOscillator();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(110 + det, t);
      o.frequency.exponentialRampToValueAtTime(55 + det, t + 0.9);
      const f = c.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.setValueAtTime(1600, t);
      f.frequency.exponentialRampToValueAtTime(300, t + 0.9);
      const g = c.createGain();
      this._env(g, t, 0.05, 0.9, 0.35);
      o.connect(f);
      f.connect(g);
      g.connect(this.master);
      o.start(t);
      o.stop(t + 1.1);
    }
  }

  // Torden: lavpasset støy som ruller. k nær 1 er nært (med et smell først).
  thunder(k = 0.6) {
    if (!this.ok) return;
    const c = this.ctx;
    const t = c.currentTime;
    if (k > 0.55) {
      const s = this._noiseSrc();
      const f = c.createBiquadFilter();
      f.type = 'highpass';
      f.frequency.value = 900;
      const g = c.createGain();
      this._env(g, t, 0.005, 0.35, 0.3 * k);
      s.connect(f); f.connect(g); g.connect(this.master);
      s.start(t, Math.random()); s.stop(t + 0.45);
    }
    const s = this._noiseSrc();
    const f = c.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.setValueAtTime(320 * (0.6 + k * 0.6), t);
    f.frequency.exponentialRampToValueAtTime(70, t + 3.2);
    f.Q.value = 0.9;
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.9 * (0.4 + k * 0.6), t + 0.12 + (1 - k) * 0.4);
    g.gain.exponentialRampToValueAtTime(0.25 * k + 0.05, t + 1.2);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 3.8);
    s.connect(f); f.connect(g); g.connect(this.master);
    s.start(t, Math.random()); s.stop(t + 4);
  }

  // Regnet: en støysløyfe som skrus opp og ned. Dempet og mørkere inne i husene.
  setRain(level, inside = false) {
    if (!this.ctx) return;
    const c = this.ctx;
    if (!this.rainNode) {
      if (level < 0.02) return;
      const s = this._noiseSrc();
      const bp = c.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 2200;
      bp.Q.value = 0.5;
      const lp = c.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 6000;
      const g = c.createGain();
      g.gain.value = 0;
      s.connect(bp); bp.connect(lp); lp.connect(g); g.connect(this.master);
      s.start();
      this.rainNode = { s, g, lp };
    }
    this.rainLevel = level;
    const target = this.muted ? 0 : Math.min(1, level) * (inside ? 0.05 : 0.11);
    this.rainNode.g.gain.setTargetAtTime(target, c.currentTime, 0.4);
    this.rainNode.lp.frequency.setTargetAtTime(inside ? 900 : 6000, c.currentTime, 0.3);
  }

  coin() {
    if (!this.ok) return;
    const c = this.ctx;
    [1760, 2637].forEach((fr, i) => {
      const t = c.currentTime + i * 0.055;
      const o = c.createOscillator();
      o.type = 'triangle';
      o.frequency.value = fr;
      const g = c.createGain();
      this._env(g, t, 0.003, 0.14, 0.22);
      o.connect(g);
      g.connect(this.master);
      o.start(t);
      o.stop(t + 0.2);
    });
  }

  drake() {
    if (!this.ok) return;
    const c = this.ctx;
    [523.25, 659.25, 783.99, 1046.5].forEach((fr, i) => {
      const t = c.currentTime + i * 0.06;
      const o = c.createOscillator();
      o.type = 'triangle';
      o.frequency.value = fr;
      const g = c.createGain();
      this._env(g, t, 0.005, 0.35, 0.28);
      o.connect(g);
      g.connect(this.master);
      o.start(t);
      o.stop(t + 0.45);
    });
  }

  demon() {
    if (!this.ok) return;
    const c = this.ctx;
    const t = c.currentTime;
    for (const fr of [98, 104, 147]) {
      const o = c.createOscillator();
      o.type = 'sawtooth';
      o.frequency.value = fr;
      const f = c.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.value = 900;
      const g = c.createGain();
      this._env(g, t, 0.02, 0.6, 0.25);
      o.connect(f);
      f.connect(g);
      g.connect(this.master);
      o.start(t);
      o.stop(t + 0.7);
    }
  }

  dice() {
    if (!this.ok) return;
    for (let i = 0; i < 4; i++) this._click(i * 0.05 + Math.random() * 0.02, 900 + Math.random() * 500, 0.12);
  }

  crunch() {
    if (!this.ok) return;
    const c = this.ctx;
    const t = c.currentTime;
    const s = this._noiseSrc();
    const f = c.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.setValueAtTime(2400, t);
    f.frequency.exponentialRampToValueAtTime(300, t + 0.25);
    const g = c.createGain();
    this._env(g, t, 0.005, 0.25, 0.6);
    s.connect(f);
    f.connect(g);
    g.connect(this.master);
    s.start(t, Math.random());
    s.stop(t + 0.3);
  }

  splash() {
    if (!this.ok) return;
    const c = this.ctx;
    const t = c.currentTime;
    const s = this._noiseSrc();
    const f = c.createBiquadFilter();
    f.type = 'highpass';
    f.frequency.value = 1200;
    const g = c.createGain();
    this._env(g, t, 0.01, 0.25, 0.25);
    s.connect(f);
    f.connect(g);
    g.connect(this.master);
    s.start(t, Math.random());
    s.stop(t + 0.3);
  }

  heal() {
    if (!this.ok) return;
    const c = this.ctx;
    [392, 523.25, 659.25].forEach((fr, i) => {
      const t = c.currentTime + i * 0.08;
      const o = c.createOscillator();
      o.type = 'sine';
      o.frequency.value = fr;
      const g = c.createGain();
      this._env(g, t, 0.02, 0.4, 0.2);
      o.connect(g);
      g.connect(this.master);
      o.start(t);
      o.stop(t + 0.5);
    });
  }

  ui() {
    if (!this.ok) return;
    this._click(0, 1400, 0.12);
  }

  _startAmbience() {
    const c = this.ctx;
    const g = c.createGain();
    g.gain.value = 0.0;
    const f = c.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = 220;
    for (const fr of [55, 55.4, 82.6]) {
      const o = c.createOscillator();
      o.type = 'sawtooth';
      o.frequency.value = fr;
      o.connect(f);
      o.start();
    }
    // sakte "pust" i dronen
    const lfo = c.createOscillator();
    lfo.frequency.value = 0.07;
    const lg = c.createGain();
    lg.gain.value = 90;
    lfo.connect(lg);
    lg.connect(f.frequency);
    lfo.start();
    f.connect(g);
    g.connect(this.master);
    this.ambience = g;
    g.gain.linearRampToValueAtTime(0.05, c.currentTime + 3);
  }

  setBiome(b) {
    this.biome = b;
    if (this.music) this.music.setBiome(b);
  }

  menuTick(midi) {
    if (!this.ok || !this.music) return;
    this.music.pluck(midi, this.ctx.currentTime, 0.55, this.master, 0, 0.6);
  }

  menuSelect() {
    if (!this.ok || !this.music) return;
    this.music.bell(81, this.ctx.currentTime, 0.14, this.master);
    this.music.pluck(62, this.ctx.currentTime, 0.4, this.master, 0, 0.4);
  }

  playMusic(name, opts) {
    if (this.music) this.music.play(name, opts);
  }

  drip() {
    if (!this.ok) return;
    const c = this.ctx;
    const t = c.currentTime;
    const o = c.createOscillator();
    o.type = 'sine';
    const fr = 900 + Math.random() * 1300;
    o.frequency.setValueAtTime(fr, t);
    o.frequency.exponentialRampToValueAtTime(fr * 1.6, t + 0.05);
    const g = c.createGain();
    this._env(g, t, 0.003, 0.12, 0.07);
    o.connect(g);
    g.connect(this.master);
    o.start(t);
    o.stop(t + 0.15);
  }

  clang() {
    if (!this.ok || !this.music) return;
    this.music.drum('clang', this.ctx.currentTime, 0.2, this.master);
  }

  // fuglesang om dagen, sirisser om natta (Fristaden)
  bird() {
    const c = this.ctx;
    const t0 = c.currentTime;
    const base = 2300 + Math.random() * 1900;
    const n = 2 + Math.floor(Math.random() * 4);
    const pan = c.createStereoPanner();
    pan.pan.value = Math.random() * 1.6 - 0.8;
    pan.connect(this.master);
    for (let i = 0; i < n; i++) {
      const t = t0 + i * (0.09 + Math.random() * 0.05);
      const o = c.createOscillator();
      o.type = 'sine';
      o.frequency.setValueAtTime(base * (0.9 + Math.random() * 0.25), t);
      o.frequency.exponentialRampToValueAtTime(base * (1.25 + Math.random() * 0.3), t + 0.06);
      const g = c.createGain();
      this._env(g, t, 0.006, 0.07, 0.035);
      o.connect(g);
      g.connect(pan);
      o.start(t);
      o.stop(t + 0.1);
    }
  }

  cricket() {
    const c = this.ctx;
    const t0 = c.currentTime;
    const fr = 4100 + Math.random() * 500;
    const pan = c.createStereoPanner();
    pan.pan.value = Math.random() * 1.6 - 0.8;
    pan.connect(this.master);
    for (let b = 0; b < 3; b++) for (let p = 0; p < 5; p++) {
      const t = t0 + b * 0.24 + p * 0.022;
      const o = c.createOscillator();
      o.type = 'sine';
      o.frequency.value = fr;
      const g = c.createGain();
      this._env(g, t, 0.002, 0.014, 0.012);
      o.connect(g);
      g.connect(pan);
      o.start(t);
      o.stop(t + 0.03);
    }
  }

  update(dt) {
    if (!this.ok) return;
    if (this.biome === 'stad') {
      this.ambT = (this.ambT || 0) - dt;
      if (this.ambT <= 0) {
        // fugler og sirisser tier når det regner
        if (this.rainLevel > 0.3) this.ambT = 2;
        else if (this.townNight) { this.cricket(); this.ambT = 0.6 + Math.random() * 1.8; }
        else { this.bird(); this.ambT = 1.4 + Math.random() * 4; }
      }
      return;
    }
    this.dripTimer -= dt;
    if (this.dripTimer <= 0) {
      this.dripTimer = this.biome === 'kloakk' ? 0.6 + Math.random() * 2.2 : 3 + Math.random() * 5;
      this.drip();
    }
  }
}
