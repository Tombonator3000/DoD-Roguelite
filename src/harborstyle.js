// Første bygningsprøve: Arno. Spillets egen arkitektur, ikke et nytt offisielt bykart.
// Materialsamling og faste varianter er inspirert av Ninth Vigils town/Building.js.
import { T } from './state.js';

function hash(s) {
  let h = 2166136261;
  for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return h >>> 0;
}

export function harborStyle(id, buildings) {
  if (id !== 'arno') return;
  const plasters = [0xe6d5ad, 0xdcc59c, 0xe5d9c2, 0xd5bd96];
  const shutters = [[0.24, 0.40, 0.46], [0.47, 0.27, 0.18], [0.34, 0.42, 0.32]];
  for (const b of buildings) {
    const seed = hash('arno:' + b.id);
    b.plaster = plasters[seed % plasters.length];
    b.shutter = shutters[(seed >>> 5) % shutters.length].slice();
    b.wallH += ((seed >>> 8) % 5 - 2) * 0.12;
    b.roofPitch = 0.42 + ((seed >>> 12) % 5) * 0.045;
    b.roofAxis = (seed >>> 18) % 3 === 0 ? 'z' : 'x';
    b.harbor = { seed, courses: 5 + (seed >>> 21) % 3, cornice: 0.14 + (seed >>> 24) % 3 * 0.035 };
  }
}

// Legges i de eksisterende materialhaugene, uten egne materialer eller masker.
// Alt hører til takgruppen, så også utkraging og konsoller tones bort inne i huset.
export function harborRoof(b, { roof, gable, chim }, { X0, X1, Z0, Z1, ridgeY, ey, alongX }) {
  if (!b.harbor) return;
  const H = b.wallH, v = b.harbor;
  const col = b.tint.map(x => x * 0.8);
  const A0 = alongX ? X0 : Z0, A1 = alongX ? X1 : Z1;
  const C0 = alongX ? Z0 : X0, C1 = alongX ? Z1 : X1, cc = (C0 + C1) / 2;
  const box = (M, a0, y0, c0, a1, y1, c1, color) => {
    if (alongX) M.box(a0, y0, c0, a1, y1, c1, { uv: 'world', us: 1.8, col: color });
    else M.box(c0, y0, a0, c1, y1, a1, { uv: 'world', us: 1.8, col: color });
  };
  for (const edge of [C0, C1]) {
    // Små konsoller og en utkraget gesims over vinduer og dører.
    box(chim, A0 + 0.3, ey - 0.17, edge - v.cornice, A1 - 0.3, ey + 0.015, edge + v.cornice, col);
    for (let a = A0 + 0.9; a < A1 - 0.4; a += T * 1.3) {
      box(chim, a - 0.11, ey - 0.48, edge - 0.08, a + 0.11, ey - 0.18, edge + 0.08, col.map(x => x * 0.85));
    }
    for (let i = 1; i <= v.courses; i++) {
      const f = i / (v.courses + 1), c = edge + (cc - edge) * f;
      const y = ey + (ridgeY - ey) * f;
      // Synlig tykkelse mellom takradene uten én geometri per takstein.
      const shade = 0.78 + ((v.seed >>> (i % 16)) & 3) * 0.035;
      box(roof, A0 + 0.025, y + 0.015, c - 0.035, A1 - 0.025, y + 0.075, c + 0.035, [shade, shade, shade]);
    }
  }
  // Gavlene får sokkel og pilastre som gir en annen silhuett enn malhuset.
  for (const a of [A0 + 0.32, A1 - 0.32]) {
    box(gable, a - 0.1, H - 0.1, C0 + 0.2, a + 0.1, H + 0.15, C1 - 0.2, col);
    const top = H + (ridgeY - H) * 0.65;
    box(gable, a - 0.08, H, cc - 0.1, a + 0.08, top, cc + 0.1, col);
  }
}
