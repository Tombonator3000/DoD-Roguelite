// Tegner kartene i Edelfara som tekst: node tools/test/areamap.mjs [område] [trail]
import { AREAS } from '../../src/edelmap.js';
import { buildAreaGrid, asciiArea } from '../../src/areagrid.js';

const which = process.argv[2];
const state = { trail: process.argv.includes('trail') };
for (const [id, L] of Object.entries(AREAS)) {
  if (which && which !== id) continue;
  const A = buildAreaGrid({ ...L, state });
  console.log(`--- ${id} ---`);
  console.log(asciiArea(A).split('\n').map((r, i) => String(i).padStart(2) + ' ' + r).join('\n'));
}
