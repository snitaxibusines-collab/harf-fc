// Les jeux de règle des nouveaux mondes : des questions à choix, fabriquées au hasard.
import {
  allahNames, animals, COLORS, food, fruits, opposites1, opposites2, school, vegetables, withAl, ADJ_PAIRS, ALL_WORDS,
  type ChoiceGen, type Word,
} from './content';
import { pick, shuffle, stripHarakat } from '../lib/arabic';

export type Visual =
  | { kind: 'img'; img: string; label: string }
  | { kind: 'stack'; item: string; ref: string; above: boolean; label: string }
  | { kind: 'depth'; item: string; ref: string; front: boolean; label: string }
  | { kind: 'people'; emoji: string; label: string };

export interface Option {
  id: string;
  ar?: string;
  fr?: string;
}

export interface ChoiceItem {
  question: string; // la consigne en français
  prompt?: string; // la phrase en arabe (avec …)
  visual?: Visual;
  options: Option[];
  answer: string; // id de la bonne option
  say?: string; // ce qu'on dit en arabe après la réponse
  sayFirst?: string; // ce qu'on dit au début (sinon : la phrase)
  explain: string; // l'explication en français
  wordId?: string;
}

const opt = (ar: string, fr?: string): Option => ({ id: ar, ar, fr });
const isFem = (w: Word) => w.fem ?? /[ةى]ٌ?$/.test(stripHarakat(w.ar).trim()) ;

const REFS = [
  { ar: 'الصُّنْدُوقِ', fr: 'la boîte', img: '📦' },
  { ar: 'الْكُرْسِيِّ', fr: 'la chaise', img: '🪑' },
  { ar: 'السَّلَّةِ', fr: 'le panier', img: '🧺' },
];

function fawqa(n: number): ChoiceItem[] {
  return shuffle(vegetables).slice(0, n).map((v, k) => {
    const ref = pick(REFS, 1)[0];
    const above = Math.random() < 0.5;
    const prep = above ? 'فَوْقَ' : 'تَحْتَ';
    const def = withAl(v.ar);
    const sentence = `${def} ${prep} ${ref.ar}`;
    const fr = `${v.fr.replace(/^(des|du|de la|de l')\s?/, '')} ${above ? 'au-dessus de' : 'en dessous de'} ${ref.fr}`;
    if (k % 3 === 2) {
      const wrong = `${def} ${above ? 'تَحْتَ' : 'فَوْقَ'} ${ref.ar}`;
      return {
        question: 'Regarde l’image. Quelle phrase est juste ?',
        prompt: `أَيْنَ ${def} ؟`,
        visual: { kind: 'stack', item: v.img, ref: ref.img, above, label: fr },
        options: shuffle([opt(sentence), opt(wrong)]),
        answer: sentence,
        say: sentence,
        explain: `فَوْقَ = au-dessus, تَحْتَ = en dessous. Ici : ${fr}.`,
        wordId: v.id,
      };
    }
    return {
      question: 'Regarde l’image, puis choisis « au-dessus » ou « en dessous ».',
      prompt: `${def} … ${ref.ar}`,
      visual: { kind: 'stack', item: v.img, ref: ref.img, above, label: fr },
      options: [opt('فَوْقَ', 'au-dessus'), opt('تَحْتَ', 'en dessous')],
      answer: prep,
      say: sentence,
      explain: `فَوْقَ = au-dessus, تَحْتَ = en dessous. Ici : ${fr}.`,
      wordId: v.id,
    };
  });
}

const PLACES_AMAMA = [
  { ar: 'الْبَيْتِ', fr: 'la maison', img: '🏠' },
  { ar: 'الشَّجَرَةِ', fr: "l'arbre", img: '🌳' },
  { ar: 'السَّيَّارَةِ', fr: 'la voiture', img: '🚗' },
];

function amama(n: number): ChoiceItem[] {
  return shuffle(school.filter((w) => w.id !== 'madrasa' && w.id !== 'saff')).slice(0, n).map((it) => {
    const ref = pick(PLACES_AMAMA, 1)[0];
    const front = Math.random() < 0.5;
    const prep = front ? 'أَمَامَ' : 'خَلْفَ';
    const sentence = `${withAl(it.ar)} ${prep} ${ref.ar}`;
    return {
      question: 'Regarde l’image : l’objet est devant ou derrière ?',
      prompt: `${withAl(it.ar)} … ${ref.ar}`,
      visual: { kind: 'depth', item: it.img, ref: ref.img, front, label: `${it.fr} ${front ? 'devant' : 'derrière'} ${ref.fr}` },
      options: [opt('أَمَامَ', 'devant'), opt('خَلْفَ', 'derrière')],
      answer: prep,
      say: sentence,
      explain: `أَمَامَ = devant, خَلْفَ = derrière. L’objet ${front ? 'cache un peu' : 'est caché par'} ${ref.fr}.`,
      wordId: it.id,
    };
  });
}

const NOUNS: { ar: string; fr: string; img: string; fem: boolean }[] = [
  { ar: 'كِتَابٌ', fr: 'un livre', img: '📕', fem: false },
  { ar: 'بَيْتٌ', fr: 'une maison', img: '🏠', fem: false },
  { ar: 'بَابٌ', fr: 'une porte', img: '🚪', fem: false },
  { ar: 'قَلَمٌ', fr: 'un stylo', img: '✏️', fem: false },
  { ar: 'دَفْتَرٌ', fr: 'un cahier', img: '📓', fem: false },
  { ar: 'سَيَّارَةٌ', fr: 'une voiture', img: '🚗', fem: true },
  { ar: 'حَقِيبَةٌ', fr: 'un cartable', img: '🎒', fem: true },
  { ar: 'نَافِذَةٌ', fr: 'une fenêtre', img: '🪟', fem: true },
  { ar: 'سَاعَةٌ', fr: 'une horloge', img: '🕰️', fem: true },
  { ar: 'كُرَةٌ', fr: 'un ballon', img: '⚽', fem: true },
];

function feminine(n: number): ChoiceItem[] {
  const nouns = shuffle(NOUNS);
  return Array.from({ length: n }, (_, k) => {
    const noun = nouns[k % nouns.length];
    const adj = pick(opposites1, 1)[0];
    const good = noun.fem ? adj.sing!.ar : adj.ar;
    const dem = noun.fem ? 'هٰذِهِ' : 'هٰذَا';
    return {
      question: `« ${noun.fr} » : quel adjectif va avec ce mot ?`,
      prompt: `${dem} ${noun.ar} …`,
      visual: { kind: 'img', img: noun.img, label: noun.fr },
      options: shuffle([opt(adj.ar, adj.fr), opt(adj.sing!.ar, adj.sing!.fr)]),
      answer: good,
      say: `${dem} ${noun.ar} ${good}`,
      explain: noun.fem
        ? `${noun.ar} se termine par ة : c’est un mot féminin. L’adjectif prend aussi ة.`
        : `${noun.ar} n’a pas de ة : c’est un mot masculin. L’adjectif reste sans ة.`,
      wordId: adj.id,
    };
  });
}

function opposites(list: Word[], n: number): ChoiceItem[] {
  return shuffle(list).slice(0, n).map((w0) => {
    const pair = ADJ_PAIRS.find((p) => p.includes(w0.id))!;
    const other = ALL_WORDS[pair[0] === w0.id ? pair[1] : pair[0]];
    const wrong = pick(list, 2, [w0, other]);
    return {
      question: `Quel est le contraire de « ${w0.fr} » ?`,
      prompt: `${w0.ar} ⟷ ؟`,
      sayFirst: w0.ar,
      visual: { kind: 'img', img: w0.img, label: w0.fr },
      options: shuffle([opt(other.ar), ...wrong.map((x) => opt(x.ar))]),
      answer: other.ar,
      say: `${w0.ar}، ${other.ar}`,
      explain: `${w0.ar} (${w0.fr}) est le contraire de ${other.ar} (${other.fr}).`,
      wordId: other.id,
    };
  });
}

const PEOPLE = [
  { pron: 'أَنَا', fem: false, emoji: '🙋‍♂️', fr: 'Tu parles de toi : « je… »' },
  { pron: 'أَنْتَ', fem: false, emoji: '👉👦', fr: 'Tu parles à un garçon : « tu… »' },
  { pron: 'أَنْتِ', fem: true, emoji: '👉👧', fr: 'Tu parles à une fille : « tu… »' },
  { pron: 'هُوَ', fem: false, emoji: '👦', fr: 'Tu parles d’un garçon : « il… »' },
  { pron: 'هِيَ', fem: true, emoji: '👧', fr: 'Tu parles d’une fille : « elle… »' },
];

function pronouns(n: number): ChoiceItem[] {
  return Array.from({ length: n }, (_, k) => {
    const p = PEOPLE[k % PEOPLE.length];
    const adj = pick(opposites2, 1)[0];
    const form = p.fem ? adj.sing!.ar : adj.ar;
    const others = pick(PEOPLE.filter((x) => x.pron !== p.pron), 2);
    return {
      question: p.fr,
      prompt: `… ${form}`,
      visual: { kind: 'people', emoji: p.emoji, label: p.fr },
      options: shuffle([p, ...others]).map((x) => opt(x.pron)),
      answer: p.pron,
      say: `${p.pron} ${form}`,
      explain: `أَنَا = je, أَنْتَ = tu (garçon), أَنْتِ = tu (fille), هُوَ = il, هِيَ = elle. Pour une fille, l’adjectif prend ة.`,
      wordId: adj.id,
    };
  });
}

function colors(n: number): ChoiceItem[] {
  return Array.from({ length: n }, (_, k) => {
    const c = COLORS[(k + Math.floor(Math.random() * COLORS.length)) % COLORS.length];
    const wrong = pick(COLORS, 2, [c]);
    return {
      question: 'De quelle couleur est ce maillot ?',
      prompt: 'مَا لَوْنُ الْقَمِيصِ ؟',
      visual: { kind: 'img', img: `color:${c.css}`, label: `un maillot ${c.fr}` },
      options: shuffle([c, ...wrong]).map((x) => opt(x.ar)),
      answer: c.ar,
      say: `الْقَمِيصُ ${c.ar}`,
      explain: `${c.ar} = ${c.fr}.`,
      wordId: `color${COLORS.indexOf(c)}`,
    };
  });
}

const PLURALS = new Set(['farash', 'jarad', 'dhubab', 'hisanKhayl']);

function hadha(n: number): ChoiceItem[] {
  const pool = [...animals, ...school].filter((w) => !PLURALS.has(w.id));
  const fem = shuffle(pool.filter(isFem));
  const masc = shuffle(pool.filter((w) => !isFem(w)));
  return Array.from({ length: n }, (_, k) => {
    const w0 = k % 2 ? fem[k % fem.length] : masc[k % masc.length];
    const f = isFem(w0);
    const dem = f ? 'هٰذِهِ' : 'هٰذَا';
    return {
      question: `« ${w0.fr} » : on dit هٰذَا ou هٰذِهِ ?`,
      prompt: `… ${w0.ar}`,
      visual: { kind: 'img', img: w0.img, label: w0.fr },
      options: [opt('هٰذَا', 'masculin'), opt('هٰذِهِ', 'féminin')],
      answer: dem,
      say: `${dem} ${w0.ar}`,
      explain: f ? `${w0.ar} est féminin (souvent avec ة) : on dit هٰذِهِ.` : `${w0.ar} est masculin : on dit هٰذَا.`,
      wordId: w0.id,
    };
  });
}

const SUN = 'تثدذرزسشصضطظلن';

function sunMoon(n: number): ChoiceItem[] {
  const pool = [...food, ...fruits, ...vegetables, ...school, ...animals].filter((w) => !w.ar.includes(' '));
  return shuffle(pool).slice(0, n).map((w0) => {
    const sun = SUN.includes(stripHarakat(w0.ar)[0]);
    const def = withAl(w0.ar);
    return {
      question: 'Dans ce mot, est-ce qu’on prononce le ل de ال ?',
      prompt: def,
      visual: { kind: 'img', img: w0.img, label: w0.fr },
      options: [
        { id: 'moon', fr: '🌙 Oui, on dit « al » (lettre lunaire)' },
        { id: 'sun', fr: '☀️ Non, la lettre est doublée (lettre solaire)' },
      ],
      answer: sun ? 'sun' : 'moon',
      say: def,
      explain: sun
        ? `${stripHarakat(w0.ar)[0]} est une lettre solaire : le ل ne se dit pas et la lettre porte une shadda.`
        : `${stripHarakat(w0.ar)[0]} est une lettre lunaire : on entend bien « al ».`,
      wordId: w0.id,
    };
  });
}

function names(n: number): ChoiceItem[] {
  const list = allahNames.filter((w) => !w.long);
  return Array.from({ length: n }, (_, k) => {
    const w0 = list[k % list.length];
    const others = pick(list, 2, [w0]);
    if (k % 2) {
      return {
        question: `Quel nom veut dire « ${w0.fr} » ?`,
        options: shuffle([w0, ...others]).map((x) => ({ id: x.id, ar: x.ar })),
        answer: w0.id,
        say: w0.ar,
        explain: w0.note ?? '',
        wordId: w0.id,
      };
    }
    return {
      question: 'Que veut dire ce nom ?',
      prompt: w0.ar,
      options: shuffle([w0, ...others]).map((x) => ({ id: x.id, fr: x.fr })),
      answer: w0.id,
      say: w0.ar,
      explain: w0.note ?? '',
      wordId: w0.id,
    };
  });
}

export function makeChoices(gen: ChoiceGen, n: number): ChoiceItem[] {
  switch (gen) {
    case 'fawqa': return fawqa(n);
    case 'amama': return amama(n);
    case 'feminine': return feminine(n);
    case 'opposites1': return opposites(opposites1, n);
    case 'opposites2': return opposites(opposites2, n);
    case 'pronouns': return shuffle(pronouns(n));
    case 'colors': return colors(n);
    case 'hadha': return hadha(n);
    case 'sunMoon': return sunMoon(n);
    case 'names': return names(n);
  }
}

// Toutes les phrases possibles, pour fabriquer les sons à l'avance.
export function allChoiceSentences(): string[] {
  const out: string[] = [];
  for (const v of vegetables) for (const r of REFS) for (const p of ['فَوْقَ', 'تَحْتَ']) {
    out.push(`${withAl(v.ar)} … ${r.ar}`, `${withAl(v.ar)} ${p} ${r.ar}`, `أَيْنَ ${withAl(v.ar)} ؟`);
  }
  for (const it of school) for (const r of PLACES_AMAMA) for (const p of ['أَمَامَ', 'خَلْفَ']) {
    out.push(`${withAl(it.ar)} … ${r.ar}`, `${withAl(it.ar)} ${p} ${r.ar}`);
  }
  for (const nn of NOUNS) for (const a of opposites1) {
    const dem = nn.fem ? 'هٰذِهِ' : 'هٰذَا';
    out.push(`${dem} ${nn.ar} …`, `${dem} ${nn.ar} ${nn.fem ? a.sing!.ar : a.ar}`);
  }
  for (const list of [opposites1, opposites2]) for (const w0 of list) {
    const pair = ADJ_PAIRS.find((p) => p.includes(w0.id))!;
    const other = ALL_WORDS[pair[0] === w0.id ? pair[1] : pair[0]];
    out.push(`${w0.ar}، ${other.ar}`);
  }
  for (const p of PEOPLE) for (const a of opposites2) {
    const form = p.fem ? a.sing!.ar : a.ar;
    out.push(`… ${form}`, `${p.pron} ${form}`, p.pron);
  }
  out.push('مَا لَوْنُ الْقَمِيصِ ؟');
  for (const c of COLORS) out.push(`الْقَمِيصُ ${c.ar}`);
  for (const w0 of [...animals, ...school]) {
    out.push(`… ${w0.ar}`, `هٰذَا ${w0.ar}`, `هٰذِهِ ${w0.ar}`);
  }
  out.push('هٰذَا', 'هٰذِهِ', 'فَوْقَ', 'تَحْتَ', 'أَمَامَ', 'خَلْفَ');
  for (const w0 of [...food, ...fruits, ...vegetables, ...school, ...animals]) out.push(withAl(w0.ar));
  return out;
}
