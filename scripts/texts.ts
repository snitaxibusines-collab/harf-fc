// Liste toutes les phrases arabes que l'appli peut dire, pour fabriquer les sons.
// Lancer : npm run texts  → écrit audio/texts.json
import { writeFileSync } from 'node:fs';
import { ALL_WORDS, PLACES, PREP, WORLDS } from '../src/data/content';
import { normalizeSpeech } from '../src/lib/speechKey';

const out = new Set<string>();
const add = (t: string) => out.add(normalizeSpeech(t));

for (const w of Object.values(ALL_WORDS)) {
  add(w.ar);
  if (w.sing) add(w.sing.ar);
  for (const p of Object.values(PLACES)) {
    add(`${w.def} … ${p.ar}`);
    for (const pr of Object.values(PREP)) {
      add(`${w.def} ${pr.ar} ${p.ar}`);
      add(`هَلِ ${w.def} ${pr.ar} ${p.ar} ؟`);
      add(`ضَعِ ${w.defAcc} ${pr.ar} ${p.ar}`);
    }
  }
  add(`أَيْنَ ${w.def} ؟`);
}
for (const world of WORLDS) for (const [a, b] of world.sounds.pairs) { add(a); add(b); }
add('مَرْحَبًا، أَنَا لَاعِبٌ فِي فَرِيقِ حَرْف');

writeFileSync('audio/texts.json', JSON.stringify([...out].sort(), null, 1) + '\n');
console.log(out.size, 'phrases');
