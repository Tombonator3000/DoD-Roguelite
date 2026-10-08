// Bygger spillet til én selvstendig HTML-fil.
// dist/index.html    full side for lokal bruk (åpne i nettleser)
// dist/artifact.html uten doctype/head/body, for publisering som artifact
import { build } from 'esbuild';
import fs from 'fs';

const root = new URL('.', import.meta.url).pathname;
const res = await build({
  entryPoints: [root + 'src/main.js'],
  bundle: true,
  format: 'esm',
  minify: process.argv.includes('--min'),
  write: false,
  external: ['three', 'three/addons/*'],
  target: 'es2020',
  legalComments: 'none',
});
let js = res.outputFiles[0].text;
if (js.includes('</script')) throw new Error('JS inneholder </script');
const duck = fs.readFileSync(root + 'assets/duck.bin').toString('base64');
const tex = fs.readFileSync(root + 'assets/duck_tex.jpg').toString('base64');
const page = fs.readFileSync(root + 'src/page.html', 'utf8');
const data = `window.DUCK_B64="${duck}";window.DUCK_TEX="data:image/jpeg;base64,${tex}";`;
const body = page.replace('/*__DUCK_DATA__*/', () => data).replace('/*__GAME_JS__*/', () => js);
fs.mkdirSync(root + 'dist', { recursive: true });
fs.writeFileSync(root + 'dist/artifact.html', body);
const full = `<!doctype html>\n<html lang="no">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n</head>\n<body>\n${body}\n</body>\n</html>\n`;
fs.writeFileSync(root + 'dist/index.html', full);
console.log('js', (js.length / 1024).toFixed(0) + 'KB', 'html', (full.length / 1024).toFixed(0) + 'KB');
