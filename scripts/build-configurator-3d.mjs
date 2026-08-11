import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { build } from 'esbuild';

const root = resolve(import.meta.dirname, '..');
const outfile = resolve(root, 'assets/configurator-3d.js');

await build({
  entryPoints: [resolve(root, 'src/configurator-3d.js')],
  bundle: true,
  minify: true,
  format: 'iife',
  target: 'es2020',
  outfile
});

const bundle = await readFile(outfile, 'utf8');
const cleanBundle = bundle
  .replace(/[ \t]+$/gm, '')
  .replace(/^ +\t/gm, '\t');
await writeFile(outfile, cleanBundle, 'utf8');
console.log(`Built ${outfile.slice(root.length + 1)}`);
