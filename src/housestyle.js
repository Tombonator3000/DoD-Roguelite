// Faste håndverksdetaljer fra husets ID. Ingen endring av dører, rom eller kollisjon.
import { T } from './state.js';

function hash(s) {
  let h = 2166136261;
  for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return h >>> 0;
}

export function houseStyle(b) {
  if (b.architecture) return;
  const seed = hash(b.id), stone = b.style === 'stone';
  const cottage = b.roof === 'thatch', tall = b.wallH >= 3.5;
  b.architecture = { seed, kind: stone ? 'murhus' : cottage ? 'stue' : tall ? 'bygard' : 'verksted',
    dormers: !stone && !cottage && tall ? 1 + seed % 2 : 0,
    braces: seed % 2 === 0, courses: cottage ? 0 : 4 + seed % 4 };
  if (b.roof !== 'cone') {
    b.roofPitch ??= (cottage ? 0.78 : stone ? 0.62 : 0.56) + (seed >>> 4) % 4 * 0.055;
    b.roofAxis ??= (b.x1 - b.x0) >= (b.y1 - b.y0) ? 'x' : 'z';
  }
}

export function houseRoof(b, { roof, gable, chim }, bounds) {
  const v = b.architecture;
  if (!v) return;
  const { X0, X1, Z0, Z1, ridgeY, ey, alongX } = bounds;
  const A0 = alongX ? X0 : Z0, A1 = alongX ? X1 : Z1;
  const C0 = alongX ? Z0 : X0, C1 = alongX ? Z1 : X1, cc = (C0 + C1) / 2;
  const P = (a, y, c) => alongX ? [a, y, c] : [c, y, a];
  const N = (a, y, c) => alongX ? [a, y, c] : [c, y, a];
  const beam = [0.36, 0.27, 0.19], pale = b.tint.map(c => c * 0.94);
  const box = (m, a0, y0, c0, a1, y1, c1, col = beam) => {
    if (alongX) m.box(a0, y0, c0, a1, y1, c1, { uv: 'world', us: 1.8, col });
    else m.box(c0, y0, a0, c1, y1, a1, { uv: 'world', us: 1.8, col });
  };
  // Synlig treverk i gavlplanet, med kryssband uten en egen maske per bjelke.
  const slant = (a, c0, y0, c1, y1, width) => {
    const dc = c1 - c0, dy = y1 - y0, len = Math.hypot(dc, dy), uc = -dy / len * width, uy = dc / len * width;
    for (const side of [-1, 1]) {
      const aa = a + side * 0.025;
      gable.quad([P(aa, y0 + uy, c0 + uc), P(aa, y1 + uy, c1 + uc), P(aa, y1 - uy, c1 - uc), P(aa, y0 - uy, c0 - uc)],
        N(side, 0, 0), [[0, 0.96], [len / T, 0.96], [len / T, 0.99], [0, 0.99]], beam);
    }
  };
  for (const a of [A0 + 0.45, A1 - 0.45]) {
    const H = b.wallH, top = ridgeY - 0.2;
    box(gable, a - 0.08, H - 0.1, C0 + 0.45, a + 0.08, H + 0.1, C1 - 0.45);
    if (b.style !== 'stone') {
      box(gable, a - 0.08, H, cc - 0.08, a + 0.08, top, cc + 0.08);
      if (v.braces) {
        slant(a, C0 + 0.6, H + 0.1, cc, top - 0.12, 0.075);
        slant(a, cc, top - 0.12, C1 - 0.6, H + 0.1, 0.075);
      }
    }
  }
  if (!b.harbor) for (const edge of [C0, C1]) {
    // Tykkere halmtak eller tynne, overlappende skift i tegl og spon.
    box(gable, A0 + 0.2, ey - (b.roof === 'thatch' ? 0.25 : 0.12), edge - 0.06, A1 - 0.2, ey + 0.03, edge + 0.06);
    for (let i = 1; i <= v.courses; i++) {
      const f = i / (v.courses + 1), c = edge + (cc - edge) * f, y = ey + (ridgeY - ey) * f;
      const shade = 0.8 + ((v.seed >>> i) & 3) * 0.04;
      box(roof, A0 + 0.03, y + 0.012, c - 0.025, A1 - 0.03, y + 0.055, c + 0.025, [shade, shade, shade]);
    }
  }
  // Murhusenes hjørnekvadre er små og ligger utenfor veggen, aldri i døråpningen.
  if (b.style === 'stone') for (const a of [A0 + 0.45, A1 - 0.45]) for (const c of [C0 + 0.45, C1 - 0.45]) {
    for (let y = 0.15, i = 0; y < b.wallH - 0.2; y += 0.5, i++) {
      const w = i % 2 ? 0.23 : 0.32;
      box(chim, a - w, y, c - 0.25, a + w, Math.min(y + 0.36, b.wallH), c + 0.25, [0.98, 0.94, 0.85]);
    }
  }
  // Takoppløft over takflaten, med mørkt vindusfelt og eget lite saltak.
  for (let i = 0; i < v.dormers; i++) {
    const a = A0 + (A1 - A0) * (i + 1) / (v.dormers + 1), c = C1 - (C1 - cc) * 0.4;
    const base = ey + (ridgeY - ey) * 0.4 + 0.03, back = c - 1.15;
    const h = Math.max(1.25, (ridgeY - ey) / (C1 - cc) * 1.15 + 0.5), top = base + h;
    const w = 0.7;
    box(gable, a - w, base, back, a + w, top, c, pale);
    // Frontens vindu ligger utenpå oppløftets vegg, med karm og loddpost.
    box(gable, a - 0.42, base + 0.16, c + 0.012, a + 0.42, top - 0.17, c + 0.025, [0.055, 0.065, 0.07]);
    box(gable, a - 0.5, top - 0.15, c + 0.025, a + 0.5, top - 0.06, c + 0.08);
    box(gable, a - 0.48, base + 0.07, c + 0.025, a + 0.48, base + 0.16, c + 0.12);
    box(gable, a - 0.035, base + 0.16, c + 0.025, a + 0.035, top - 0.15, c + 0.06);
    for (const s of [-1, 1]) {
      const ax = a + s * (w + 0.12), rise = 0.48, ny = 0.82, nx = s * 0.57;
      roof.quad([P(ax, top, c + 0.14), P(ax, top, back - 0.12), P(a, top + rise, back - 0.12), P(a, top + rise, c + 0.14)],
        N(nx, ny, 0), [[0, 0], [0, 0.8], [0.6, 0.8], [0.6, 0]], [0.95, 0.92, 0.86]);
    }
    gable.tri([P(a - w, top, c), P(a + w, top, c), P(a, top + 0.44, c)], N(0, 0, 1), [[0, 0], [0.7, 0], [0.35, 0.4]], pale);
  }
}
