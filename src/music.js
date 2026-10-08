// Prosedyrisk musikk. Ingen lydfiler: lutt (Karplus-Strong, forhåndsrendret),
// drone, kor, fløyte, horn, bjelle og trommer syntetiseres i WebAudio.
// En enkel sequencer med lookahead planlegger noter litt fram i tid.

const mtof = m => 440 * Math.pow(2, (m - 69) / 12);

// Akkorder som voicing (MIDI): 0 bass, 1 grunntone, 2 kvint, 3 oktav, 4 ters, 5 kvint, 6 oktav
const CH = {
  Dm: [38, 50, 57, 62, 65, 69, 74],
  C: [36, 48, 55, 60, 64, 67, 72],
  Bb: [34, 46, 53, 58, 62, 65, 70],
  F: [41, 53, 57, 60, 65, 69, 72],
  Gm: [43, 55, 58, 62, 67, 70, 74],
  A: [45, 57, 61, 64, 69, 73, 76],
  Eb: [39, 51, 58, 63, 67, 70, 75],
  Cm: [36, 48, 55, 60, 63, 67, 72],
  D: [38, 50, 57, 62, 66, 69, 74],
  Am: [45, 57, 60, 64, 69, 72, 76],
  G: [43, 55, 59, 62, 67, 71, 74],
  Bm: [47, 59, 62, 66, 71, 74, 78],
  Em: [40, 52, 55, 59, 64, 67, 71],
};

// "Fristadens torg" i 3/4, D-dur. Om natta blir den stille, på vertshuset blir den en dans.
const TOWN_CH = ['D', 'G', 'A', 'D', 'Bm', 'G', 'Em', 'A', 'D', 'G', 'A', 'D', 'Bm', 'G', 'A', 'D'];
const TOWN_MEL = [
  [[74, 2], [78, 2], [81, 2]], [[83, 3], [81, 1], [79, 2]], [[76, 2], [78, 2], [79, 2]], [[78, 4], [74, 2]],
  [[74, 2], [78, 2], [83, 2]], [[81, 2], [79, 2], [78, 2]], [[76, 2], [79, 2], [78, 1], [76, 1]], [[73, 6]],
  [[81, 2], [78, 2], [74, 2]], [[79, 2], [83, 2], [86, 2]], [[85, 2], [83, 1], [81, 1], [79, 2]], [[78, 6]],
  [[74, 2], [76, 2], [78, 2]], [[79, 3], [78, 1], [76, 2]], [[76, 2], [73, 2], [76, 2]], [[74, 6]],
].map(bar => { let st = 0; return bar.map(([p, dur]) => { const e = [p, st, dur]; st += dur; return e; }); });

// "Svart Nebbs vise" i 3/4. Hver takt: [tone, varighet i åttendedeler]
const TITLE_CHORDS = ['Dm', 'Dm', 'C', 'C', 'Bb', 'F', 'Gm', 'A', 'Dm', 'Bb', 'F', 'C', 'Dm', 'Bb', 'A', 'A'];
const TITLE_MEL_RAW = [
  [[69, 2], [74, 2], [76, 1], [77, 1]],
  [[76, 3], [74, 3]],
  [[72, 2], [76, 2], [79, 2]],
  [[77, 3], [76, 3]],
  [[74, 2], [77, 2], [81, 2]],
  [[79, 2], [77, 2], [76, 1], [77, 1]],
  [[74, 2], [70, 2], [74, 2]],
  [[73, 6]],
  [[81, 2], [79, 1], [77, 1], [76, 2]],
  [[77, 2], [74, 4]],
  [[72, 2], [77, 2], [81, 2]],
  [[79, 3], [76, 3]],
  [[77, 2], [76, 2], [74, 2]],
  [[70, 2], [74, 2], [77, 2]],
  [[76, 3], [73, 3]],
  [[74, 6]],
];
const TITLE_MEL = TITLE_MEL_RAW.map(bar => {
  let s = 0;
  return bar.map(([p, dur]) => { const e = [p, s, dur]; s += dur; return e; });
});

const EXPLORE_CH = ['Dm', 'Dm', 'Bb', 'C', 'Dm', 'Gm', 'A', 'A'];
const DWARF_CH = ['Am', 'Am', 'F', 'C', 'Dm', 'Am', 'Eb', 'A'];
const BOSS_CH = ['Dm', 'Eb', 'Dm', 'C'];
const BOSS_RIFF = [[50, 0, 2], [50, 2, 2], [51, 4, 2], [50, 6, 4], [48, 10, 2], [46, 12, 4]];
const BOSS_RIFF2 = [[53, 0, 4], [51, 4, 4], [50, 8, 6], [51, 14, 2]];

const SONGS = {
  title: {
    bpm: 84, sub: 2, drone: [38, 45], droneVol: 0.05,
    step(m, s, n, t, sd) {
      const bar = Math.floor(n / 6), st = n % 6;
      const intro = bar < 2;
      const lb = intro ? -1 : (bar - 2) % 16;
      const v = CH[intro ? 'Dm' : TITLE_CHORDS[lb]];
      if (st === 0) m.pluck(v[0], t, 0.5, s.out, 0, 0.2);
      m.pluck(v[[1, 2, 3, 4, 3, 2][st]], t, st === 0 ? 0.36 : 0.28, s.out, -0.3 + st * 0.12);
      if (intro) return;
      if (st === 0) m.drum('frame', t, 0.45, s.out);
      if (st === 3) m.drum('tap', t, 0.2, s.out);
      if (lb >= 8 && st % 3 !== 0) m.drum('shaker', t, 0.08, s.out);
      if (lb >= 8 && st === 0) m.pad(v.slice(1, 5), t, sd * 6.3, 0.13, s.out);
      for (const [p, s0, dur] of TITLE_MEL[lb]) if (s0 === st) m.flute(p, t, dur * sd * 0.96, 0.2, s.out);
    },
  },
  explore: {
    bpm: 70, sub: 2, drone: [38, 45], droneVol: 0.045,
    step(m, s, n, t, sd) {
      const bar = Math.floor(n / 8), st = n % 8;
      const dw = s.biome === 'dverg';
      const prog = dw ? DWARF_CH : EXPLORE_CH;
      const v = CH[prog[Math.floor(bar / 2) % prog.length]];
      const I = m.intensity;
      if (bar % 2 === 0 && st === 0) m.pad(v.slice(1, 4), t, sd * 16.5, 0.09 + I * 0.05, s.out);
      if (st === 0 && bar % 2 === 0) m.pluck(v[0], t, 0.38, s.out, 0, 0.15);
      if (Math.random() < 0.16 + I * 0.08) m.pluck(v[2 + Math.floor(Math.random() * 5)], t, 0.14 + Math.random() * 0.18, s.out, Math.random() * 0.9 - 0.45);
      if (dw && st === 0 && bar % 4 === 3) m.drum('clang', t, 0.12, s.out);
      if (I > 0.06) {
        if (st === 0 || st === 3 || st === 6) m.drum('frame', t, 0.55 * I, s.out);
        if (st === 2 || st === 5 || st === 7) m.drum('tap', t, 0.26 * I, s.out);
        if (st % 2 === 1) m.drum('shaker', t, 0.09 * I, s.out);
        m.pluck(v[[1, 3, 2, 3, 1, 3, 2, 4][st]], t, 0.2 * I, s.out, 0.25);
        if (st === 0 && bar % 2 === 0 && I > 0.55) m.horn(v[1] - 12, t, sd * 3.5, 0.22 * I, s.out);
        if (bar % 8 === 7 && st >= 4) m.drum('tom', t, 0.4 * I, s.out);
      }
    },
  },
  boss: {
    bpm: 102, sub: 4, drone: [38, 26], droneVol: 0.04,
    step(m, s, n, t, sd) {
      const bar = Math.floor(n / 16), st = n % 16;
      const v = CH[BOSS_CH[bar % 4]];
      if (st === 0 || st === 10) m.drum('boom', t, 0.5, s.out);
      if (st === 4 || st === 12) m.drum('frame', t, 0.42, s.out);
      if (st % 2 === 0 && st !== 0 && st !== 4 && st !== 12) m.drum('tap', t, 0.16, s.out);
      if (bar % 4 === 3 && st >= 12) m.drum('tom', t, 0.36, s.out);
      if (bar % 8 === 7 && st === 15) m.drum('clang', t, 0.2, s.out);
      m.pluck(v[st % 2 ? 5 : 3], t, 0.12, s.out, st % 2 ? 0.35 : -0.35, 0.5);
      const riff = bar % 2 === 0 ? BOSS_RIFF : BOSS_RIFF2;
      for (const [p, s0, dur] of riff) if (s0 === st) m.horn(p, t, dur * sd * 0.92, 0.19, s.out);
      if (st === 0) m.pad(v.slice(1, 5), t, sd * 16, 0.1, s.out);
    },
  },
  town: {
    bpm: 92, sub: 2, drone: [38, 45], droneVol: 0.022,
    step(m, s, n, t, sd) {
      const bar = Math.floor(n / 6), st = n % 6;
      const lb = bar % 16;
      const v = CH[TOWN_CH[lb]];
      const night = m.night, inn = m.inn;
      if (night && !inn) {
        // natt: lange akkorder og noen få toner
        if (st === 0 && bar % 2 === 0) m.pad(v.slice(1, 4), t, sd * 12.5, 0.07, s.out);
        if (st === 0) m.pluck(v[0], t, 0.22, s.out, 0, 0.12);
        if (st === 3 && Math.random() < 0.5) m.pluck(v[2 + Math.floor(Math.random() * 4)], t, 0.12, s.out, Math.random() - 0.5, 0.2);
        if (bar % 4 === 0) for (const [p, s0, dur] of TOWN_MEL[lb]) if (s0 === st) m.flute(p - 12, t, dur * sd * 0.95, 0.08, s.out);
        return;
      }
      if (st === 0) m.pluck(v[0], t, 0.42, s.out, 0, 0.2);
      m.pluck(v[[1, 2, 3, 4, 3, 2][st]], t, st === 0 ? 0.3 : 0.22, s.out, -0.35 + st * 0.13, 0.35);
      if (st === 0) m.drum('frame', t, inn ? 0.5 : 0.3, s.out);
      if (st === 3) m.drum('tap', t, inn ? 0.32 : 0.16, s.out);
      if (inn && st % 2 === 1) m.drum('shaker', t, 0.1, s.out);
      if (inn && (st === 2 || st === 5)) m.drum('tap', t, 0.18, s.out);
      if (st === 0 && bar % 2 === 0) m.pad(v.slice(1, 4), t, sd * 12.2, inn ? 0.06 : 0.08, s.out);
      const play = inn || bar % 32 < 16 || bar % 2 === 0;
      if (play) for (const [p, s0, dur] of TOWN_MEL[lb]) if (s0 === st) m.flute(p, t, dur * sd * 0.94, inn ? 0.2 : 0.16, s.out);
      if (inn && st === 0 && bar % 4 === 2) m.bell(v[5] + 12, t, 0.06, s.out);
    },
  },
  victory: {
    bpm: 80, sub: 2, drone: [38, 45], droneVol: 0.04, length: 40,
    step(m, s, n, t, sd) {
      const v = CH.D;
      if (n === 0) {
        [74, 78, 81, 86].forEach((p, i) => m.bell(p, t + i * sd, 0.3, s.out));
        m.pad(v.slice(1, 6), t, sd * 14, 0.16, s.out);
      }
      if (n === 4) m.flute(81, t, sd * 2, 0.22, s.out);
      if (n === 6) m.flute(78, t, sd * 2, 0.22, s.out);
      if (n === 8) m.flute(81, t, sd * 2, 0.22, s.out);
      if (n === 10) m.flute(86, t, sd * 6, 0.24, s.out);
      if (n < 32) m.pluck(v[[1, 2, 3, 4, 5, 4, 3, 2][n % 8]], t, 0.24, s.out, (n % 8) * 0.1 - 0.35);
      if (n % 8 === 0) m.drum('frame', t, 0.35, s.out);
      if (n === 16) m.pad(CH.G ? CH.G : [55, 59, 62, 67], t, sd * 8, 0.12, s.out);
      if (n === 24) m.pad(v.slice(1, 6), t, sd * 14, 0.14, s.out);
    },
  },
  death: {
    bpm: 56, sub: 2, drone: [38, 45], droneVol: 0.04, length: 22,
    step(m, s, n, t, sd) {
      if (n === 0) m.pad(CH.Dm.slice(1, 4), t, sd * 18, 0.14, s.out);
      const notes = { 0: 69, 2: 67, 4: 65, 6: 64, 8: 62, 12: 57, 14: 50 };
      if (notes[n] !== undefined) m.pluck(notes[n], t, 0.4, s.out, 0, 0.15);
      if (n === 8) m.drum('frame', t, 0.4, s.out);
    },
  },
};

export class Music {
  constructor(sound) {
    this.snd = sound;
    this.ctx = sound.ctx;
    this.bus = sound.musicBus;
    this.intensity = 0;
    this.target = 0;
    this.current = null;
    this.name = null;
    this.biome = 'kloakk';
    this.cache = new Map();
    this.noise = sound.noise;
    this.drums = this._renderDrums();
    this.timer = setInterval(() => this._tick(), 25);
  }

  // --- styring ------------------------------------------------------------

  play(name, opts = {}) {
    if (this.name === name && this.current && !opts.restart) return;
    const c = this.ctx;
    const now = c.currentTime;
    if (this.current) this._fadeOut(this.current, opts.fast ? 0.6 : 2.2);
    const song = SONGS[name];
    this.name = name;
    if (!song) { this.current = null; return; }
    const out = c.createGain();
    out.gain.setValueAtTime(0.0001, now);
    out.gain.exponentialRampToValueAtTime(1, now + (opts.fast ? 0.4 : 1.6));
    out.connect(this.bus);
    const s = { song, out, n: 0, next: now + 0.12, sd: 60 / song.bpm / song.sub, biome: this.biome, drone: null };
    if (song.drone) s.drone = this._drone(song.drone, song.droneVol, out);
    this.current = s;
  }

  setBiome(b) {
    this.biome = b;
    if (this.current) this.current.biome = b;
  }

  setIntensity(x) {
    this.target = Math.max(0, Math.min(1, x));
  }

  stop() {
    if (this.current) this._fadeOut(this.current, 1.5);
    this.current = null;
    this.name = null;
  }

  _fadeOut(s, dur) {
    const now = this.ctx.currentTime;
    s.out.gain.cancelScheduledValues(now);
    s.out.gain.setValueAtTime(Math.max(0.0001, s.out.gain.value), now);
    s.out.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    s.dead = true;
    setTimeout(() => {
      if (s.drone) s.drone.forEach(o => { try { o.stop(); } catch (e) { /* allerede stoppet */ } });
      s.out.disconnect();
    }, dur * 1000 + 200);
  }

  _tick() {
    this.intensity += (this.target - this.intensity) * 0.04;
    const s = this.current;
    if (!s || s.dead) return;
    const c = this.ctx;
    if (s.next < c.currentTime - 0.5) s.next = c.currentTime + 0.05; // fanen var i bakgrunnen
    while (s.next < c.currentTime + 0.14) {
      try { s.song.step(this, s, s.n, s.next, s.sd); } catch (e) { console.warn(e); }
      s.next += s.sd;
      s.n++;
      if (s.song.length && s.n >= s.song.length) {
        this._fadeOut(s, 3);
        this.current = null;
        this.name = null;
        return;
      }
    }
  }

  // --- instrumenter -------------------------------------------------------

  _pluckBuffer(midi) {
    if (this.cache.has(midi)) return this.cache.get(midi);
    const c = this.ctx, sr = c.sampleRate;
    const f = mtof(midi);
    const N = Math.max(2, Math.floor(sr / f - 0.5));
    const actual = sr / (N + 0.5);
    const dur = midi < 50 ? 3.2 : 2.4;
    const len = Math.floor(sr * dur);
    const out = new Float32Array(len);
    const buf = new Float32Array(N);
    let prev = 0;
    for (let i = 0; i < N; i++) {
      prev += 0.5 * ((Math.random() * 2 - 1) - prev);
      buf[i] = prev;
    }
    // plukkeposisjon: kamfilter gir en nasal luttklang
    const pp = Math.max(1, Math.floor(N * 0.13));
    const tmpb = buf.slice();
    for (let i = 0; i < N; i++) buf[i] = tmpb[i] - 0.6 * tmpb[(i + pp) % N];
    const R = midi < 50 ? 0.9985 : 0.997;
    let idx = 0, peak = 0;
    for (let i = 0; i < len; i++) {
      const a = buf[idx];
      const j = idx + 1 === N ? 0 : idx + 1;
      buf[idx] = 0.5 * (a + buf[j]) * R;
      out[i] = a;
      if (Math.abs(a) > peak) peak = Math.abs(a);
      idx = j;
    }
    const fade = Math.floor(sr * 0.25);
    for (let i = 0; i < fade; i++) out[len - 1 - i] *= i / fade;
    const g = peak > 0 ? 0.8 / peak : 1;
    for (let i = 0; i < len; i++) out[i] *= g;
    const ab = c.createBuffer(1, len, sr);
    ab.getChannelData(0).set(out);
    const e = { buf: ab, rate: f / actual };
    this.cache.set(midi, e);
    return e;
  }

  pluck(midi, t, vel, dst, pan = 0, bright = 0.3) {
    const c = this.ctx;
    const e = this._pluckBuffer(midi);
    const src = c.createBufferSource();
    src.buffer = e.buf;
    src.playbackRate.value = e.rate;
    const f = c.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = 1800 + bright * 4000;
    const body = c.createBiquadFilter();
    body.type = 'peaking';
    body.frequency.value = 240;
    body.gain.value = 5;
    body.Q.value = 1.2;
    const g = c.createGain();
    g.gain.value = vel * 0.55;
    const p = c.createStereoPanner ? c.createStereoPanner() : null;
    src.connect(f);
    f.connect(body);
    body.connect(g);
    if (p) { p.pan.value = pan; g.connect(p); p.connect(dst); } else g.connect(dst);
    src.start(t);
    src.stop(t + e.buf.duration / e.rate);
  }

  pad(midis, t, dur, vel, dst) {
    const c = this.ctx;
    const g = c.createGain();
    const att = Math.min(1.2, dur * 0.3), rel = Math.min(1.6, dur * 0.4);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vel * 0.22, t + att);
    g.gain.setValueAtTime(vel * 0.22, t + dur - rel);
    g.gain.linearRampToValueAtTime(0.0001, t + dur);
    const mix = c.createGain();
    mix.gain.value = 1;
    // formanter for "aah"
    for (const [fr, q, amp] of [[720, 6, 1], [1150, 8, 0.6], [2600, 10, 0.25]]) {
      const bp = c.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = fr;
      bp.Q.value = q;
      const ga = c.createGain();
      ga.gain.value = amp * 2.2;
      mix.connect(bp);
      bp.connect(ga);
      ga.connect(g);
    }
    const lfo = c.createOscillator();
    lfo.frequency.value = 4.6;
    const lg = c.createGain();
    lg.gain.value = 6;
    lfo.connect(lg);
    for (const m of midis) {
      for (const det of [-7, 7]) {
        const o = c.createOscillator();
        o.type = 'sawtooth';
        o.frequency.value = mtof(m);
        o.detune.value = det;
        lg.connect(o.detune);
        o.connect(mix);
        o.start(t);
        o.stop(t + dur + 0.1);
      }
    }
    lfo.start(t);
    lfo.stop(t + dur + 0.1);
    g.connect(dst);
  }

  flute(midi, t, dur, vel, dst) {
    const c = this.ctx;
    const f = mtof(midi);
    const o = c.createOscillator();
    o.type = 'sine';
    o.frequency.value = f;
    const o2 = c.createOscillator();
    o2.type = 'triangle';
    o2.frequency.value = f * 2;
    const g2 = c.createGain();
    g2.gain.value = 0.12;
    const lfo = c.createOscillator();
    lfo.frequency.value = 5.2;
    const lg = c.createGain();
    lg.gain.setValueAtTime(0, t);
    lg.gain.linearRampToValueAtTime(14, t + Math.min(0.5, dur * 0.6));
    lfo.connect(lg);
    lg.connect(o.detune);
    lg.connect(o2.detune);
    const breath = c.createBufferSource();
    breath.buffer = this.noise;
    breath.loop = true;
    const bp = c.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = f;
    bp.Q.value = 14;
    const bg = c.createGain();
    bg.gain.value = 0.35;
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vel * 0.3, t + 0.07);
    g.gain.setValueAtTime(vel * 0.3, t + Math.max(0.08, dur - 0.12));
    g.gain.linearRampToValueAtTime(0.0001, t + dur + 0.1);
    o.connect(g);
    o2.connect(g2);
    g2.connect(g);
    breath.connect(bp);
    bp.connect(bg);
    bg.connect(g);
    g.connect(dst);
    for (const n of [o, o2, lfo]) { n.start(t); n.stop(t + dur + 0.15); }
    breath.start(t, Math.random());
    breath.stop(t + dur + 0.15);
  }

  horn(midi, t, dur, vel, dst) {
    const c = this.ctx;
    const f = mtof(midi);
    const lp = c.createBiquadFilter();
    lp.type = 'lowpass';
    lp.Q.value = 2;
    lp.frequency.setValueAtTime(260, t);
    lp.frequency.linearRampToValueAtTime(1500, t + 0.08);
    lp.frequency.exponentialRampToValueAtTime(600, t + dur);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vel * 0.32, t + 0.05);
    g.gain.setValueAtTime(vel * 0.28, t + Math.max(0.06, dur - 0.1));
    g.gain.linearRampToValueAtTime(0.0001, t + dur + 0.12);
    for (const [mul, det] of [[1, -5], [1, 6], [0.5, 0]]) {
      const o = c.createOscillator();
      o.type = 'sawtooth';
      o.frequency.value = f * mul;
      o.detune.value = det;
      o.connect(lp);
      o.start(t);
      o.stop(t + dur + 0.15);
    }
    lp.connect(g);
    g.connect(dst);
  }

  bell(midi, t, vel, dst) {
    const c = this.ctx;
    const f = mtof(midi);
    const car = c.createOscillator();
    car.frequency.value = f;
    const mod = c.createOscillator();
    mod.frequency.value = f * 3.5;
    const mg = c.createGain();
    mg.gain.setValueAtTime(f * 2.2, t);
    mg.gain.exponentialRampToValueAtTime(f * 0.05, t + 1.6);
    mod.connect(mg);
    mg.connect(car.frequency);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vel * 0.35, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 2.6);
    car.connect(g);
    g.connect(dst);
    for (const o of [car, mod]) { o.start(t); o.stop(t + 2.7); }
  }

  drum(name, t, vel, dst) {
    const b = this.drums[name];
    if (!b) return;
    const c = this.ctx;
    const src = c.createBufferSource();
    src.buffer = b;
    src.playbackRate.value = 0.97 + Math.random() * 0.06;
    const g = c.createGain();
    g.gain.value = vel;
    src.connect(g);
    g.connect(dst);
    src.start(t);
  }

  _drone(midis, vol, dst) {
    const c = this.ctx;
    const lp = c.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 520;
    lp.Q.value = 1.5;
    const lfo = c.createOscillator();
    lfo.frequency.value = 0.09;
    const lg = c.createGain();
    lg.gain.value = 160;
    lfo.connect(lg);
    lg.connect(lp.frequency);
    const g = c.createGain();
    g.gain.value = vol;
    lp.connect(g);
    g.connect(dst);
    const nodes = [lfo];
    for (const m of midis) {
      for (const det of [-4, 5]) {
        const o = c.createOscillator();
        o.type = 'sawtooth';
        o.frequency.value = mtof(m);
        o.detune.value = det;
        o.connect(lp);
        o.start();
        nodes.push(o);
      }
    }
    // summing av en lerkekasse: litt firkant gjennom smalt båndpass
    const buzz = c.createOscillator();
    buzz.type = 'square';
    buzz.frequency.value = mtof(midis[0] + 12);
    const bp = c.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 900;
    bp.Q.value = 9;
    const bg = c.createGain();
    bg.gain.value = 0.12;
    buzz.connect(bp);
    bp.connect(bg);
    bg.connect(g);
    buzz.start();
    nodes.push(buzz);
    lfo.start();
    return nodes;
  }

  _renderDrums() {
    const c = this.ctx, sr = c.sampleRate;
    const mk = (dur, fn) => {
      const len = Math.floor(sr * dur);
      const b = c.createBuffer(1, len, sr);
      const d = b.getChannelData(0);
      let ph = 0, lp = 0;
      const st = { ph, lp };
      for (let i = 0; i < len; i++) d[i] = fn(i / sr, st, i);
      return b;
    };
    const sine = (st, f) => { st.ph += (2 * Math.PI * f) / sr; return Math.sin(st.ph); };
    const noise = () => Math.random() * 2 - 1;
    return {
      frame: mk(0.7, (t, st) => {
        const f = 50 + 70 * Math.exp(-t * 18);
        const body = sine(st, f) * Math.exp(-t * 5.5);
        st.lp += 0.08 * (noise() - st.lp);
        return 0.9 * body + st.lp * Math.exp(-t * 40) * 1.6;
      }),
      tap: mk(0.12, (t, st) => {
        st.lp += 0.35 * (noise() - st.lp);
        const hp = noise() - st.lp;
        return (hp * 0.5 + st.lp * 0.6) * Math.exp(-t * 45);
      }),
      shaker: mk(0.1, (t) => {
        const env = Math.min(1, t / 0.012) * Math.exp(-t * 55);
        return noise() * env * 0.5;
      }),
      tom: mk(0.45, (t, st) => {
        const f = 105 + 80 * Math.exp(-t * 14);
        return sine(st, f) * Math.exp(-t * 8) * 0.9 + noise() * Math.exp(-t * 60) * 0.2;
      }),
      boom: mk(1.4, (t, st) => {
        const f = 34 + 40 * Math.exp(-t * 9);
        st.lp += 0.03 * (noise() - st.lp);
        return Math.tanh(sine(st, f) * Math.exp(-t * 2.6) * 1.6) * 0.9 + st.lp * Math.exp(-t * 20) * 2;
      }),
      clang: mk(1.6, (t) => {
        let v = 0;
        for (const [f, dcy, a] of [[312, 2.2, 1], [741, 3, 0.6], [1133, 4, 0.45], [1617, 5.5, 0.3], [2420, 7, 0.2]]) {
          v += Math.sin(2 * Math.PI * f * t) * Math.exp(-t * dcy) * a;
        }
        return v * 0.35 + noise() * Math.exp(-t * 80) * 0.3;
      }),
    };
  }
}
