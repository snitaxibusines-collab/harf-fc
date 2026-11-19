// Copie les illustrations (Fluent Emoji 3D de Microsoft, licence MIT) utilisées par l'appli.
// Usage : node scripts/emoji.mjs <dossier assets du paquet @lobehub/fluent-emoji-3d>
import { readFileSync, readdirSync, copyFileSync, existsSync, mkdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const src = process.argv[2];
const files = [];
const walk = (d) => readdirSync(d).forEach((f) => { const p = join(d, f); statSync(p).isDirectory() ? walk(p) : /\.(ts|tsx)$/.test(f) && files.push(p); });
walk('src');
const re = /\p{Extended_Pictographic}(?:️|‍\p{Extended_Pictographic}|‍[♀♂⬛]️?|[\u{1F3FB}-\u{1F3FF}])*/gu;
const found = new Set();
for (const f of files) for (const m of readFileSync(f, 'utf8').matchAll(re)) found.add(m[0]);
const cp = (e) => [...e].map((c) => c.codePointAt(0).toString(16)).join('-');
mkdirSync('public/img', { recursive: true });
const missing = [];
for (const e of found) {
  const full = cp(e);
  const bare = cp(e.replace(/️/g, ''));
  const name = [full, bare].find((n) => existsSync(join(src, n + '.webp')));
  if (!name) { missing.push(`${e} ${full}`); continue; }
  copyFileSync(join(src, name + '.webp'), join('public/img', bare + '.webp'));
}
console.log(found.size, 'images, manquantes :', missing.join(', ') || 'aucune');
