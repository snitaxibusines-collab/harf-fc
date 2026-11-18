// Contenu de Harf FC : les mondes, les mots et les matchs.
// Les listes de mots suivent les thèmes du cours (vocabulaire courant).
// Les images sont provisoires (émojis ou petits dessins), en attendant nos propres illustrations.

export type ImageKey = string; // un émoji, ou "svg:<nom>" pour un petit dessin maison

export interface Word {
  id: string;
  ar: string; // le mot avec les voyelles
  fr: string;
  img: ImageKey;
  def: string; // avec « al », au cas sujet (ex. الْحَلِيبُ)
  defAcc: string; // avec « al », au cas direct (ex. الْحَلِيبَ), pour « ضَعْ … »
  sing?: { ar: string; fr: string }; // singulier en ة (fruits)
}

export type Place = 'fridge' | 'box' | 'basket' | 'table';

export interface PlaceInfo {
  id: Place;
  ar: string; // au cas indirect, après فِي / عَلَى
  fr: string;
  canIn: boolean;
  canOn: boolean;
}

export const PLACES: Record<Place, PlaceInfo> = {
  fridge: { id: 'fridge', ar: 'الثَّلَّاجَةِ', fr: 'le frigo', canIn: true, canOn: true },
  box: { id: 'box', ar: 'الصُّنْدُوقِ', fr: 'la boîte', canIn: true, canOn: true },
  basket: { id: 'basket', ar: 'السَّلَّةِ', fr: 'le panier', canIn: true, canOn: false },
  table: { id: 'table', ar: 'الطَّاوِلَةِ', fr: 'la table', canIn: false, canOn: true },
};

export const PREP = {
  in: { ar: 'فِي', fr: 'dans' },
  on: { ar: 'عَلَى', fr: 'sur' },
} as const;
export type Prep = keyof typeof PREP;

export type Activity =
  | { type: 'discover'; words: string[] }
  | { type: 'trace'; words: string[] }
  | { type: 'pairing'; words: string[] }
  | { type: 'quiz'; words: string[]; count: number }
  | { type: 'rule'; rule: 'fiAla' | 'ayna'; count: number }
  | { type: 'sounds'; count: number }
  | { type: 'dictation'; words: string[] };

export interface Match {
  id: string;
  stage: string; // Poules, Quarts…
  title: string;
  activities: Activity[];
}

export interface SoundPairs {
  letters: [string, string];
  tip: string;
  pairs: [string, string][];
}

export interface World {
  id: string;
  title: string;
  subtitle: string;
  ruleLabel: string; // en arabe
  words: Word[];
  sounds: SoundPairs;
  matches: Match[];
}

const food: Word[] = [
  { id: 'halib', ar: 'حَلِيبٌ', fr: 'du lait', img: '🥛', def: 'الْحَلِيبُ', defAcc: 'الْحَلِيبَ' },
  { id: 'zubda', ar: 'زُبْدَةٌ', fr: 'du beurre', img: '🧈', def: 'الزُّبْدَةُ', defAcc: 'الزُّبْدَةَ' },
  { id: 'murabba', ar: 'مُرَبَّى', fr: 'de la confiture', img: 'svg:jam', def: 'الْمُرَبَّى', defAcc: 'الْمُرَبَّى' },
  { id: 'asal', ar: 'عَسَلٌ', fr: 'du miel', img: '🍯', def: 'الْعَسَلُ', defAcc: 'الْعَسَلَ' },
  { id: 'shay', ar: 'شَايٌ', fr: 'du thé', img: '🍵', def: 'الشَّايُ', defAcc: 'الشَّايَ' },
  { id: 'qahwa', ar: 'قَهْوَةٌ', fr: 'du café', img: '☕', def: 'الْقَهْوَةُ', defAcc: 'الْقَهْوَةَ' },
  { id: 'bahar', ar: 'بَهَارٌ', fr: 'des épices', img: '🌶️', def: 'الْبَهَارُ', defAcc: 'الْبَهَارَ' },
  { id: 'zayt', ar: 'زَيْتٌ', fr: "de l'huile", img: '🫒', def: 'الزَّيْتُ', defAcc: 'الزَّيْتَ' },
  { id: 'sukkar', ar: 'سُكَّرٌ', fr: 'du sucre', img: 'svg:sugar', def: 'السُّكَّرُ', defAcc: 'السُّكَّرَ' },
  { id: 'milh', ar: 'مِلْحٌ', fr: 'du sel', img: '🧂', def: 'الْمِلْحُ', defAcc: 'الْمِلْحَ' },
  { id: 'asir', ar: 'عَصِيرٌ', fr: 'du jus', img: '🧃', def: 'الْعَصِيرُ', defAcc: 'الْعَصِيرَ' },
  { id: 'zabadi', ar: 'زَبَادِيٌّ', fr: 'du yaourt', img: 'svg:yogurt', def: 'الزَّبَادِيُّ', defAcc: 'الزَّبَادِيَّ' },
];

const fruits: Word[] = [
  { id: 'tuffah', ar: 'تُفَّاحٌ', fr: 'des pommes', img: '🍎', def: 'التُّفَّاحَةُ', defAcc: 'التُّفَّاحَةَ', sing: { ar: 'تُفَّاحَةٌ', fr: 'une pomme' } },
  { id: 'burtuqal', ar: 'بُرْتُقَالٌ', fr: 'des oranges', img: '🍊', def: 'الْبُرْتُقَالَةُ', defAcc: 'الْبُرْتُقَالَةَ', sing: { ar: 'بُرْتُقَالَةٌ', fr: 'une orange' } },
  { id: 'mawz', ar: 'مَوْزٌ', fr: 'des bananes', img: '🍌', def: 'الْمَوْزَةُ', defAcc: 'الْمَوْزَةَ', sing: { ar: 'مَوْزَةٌ', fr: 'une banane' } },
  { id: 'farawla', ar: 'فَرَاوِلَةٌ', fr: 'des fraises', img: '🍓', def: 'الْفَرَاوِلَةُ', defAcc: 'الْفَرَاوِلَةَ' },
  { id: 'mishmish', ar: 'مِشْمِشٌ', fr: 'des abricots', img: 'svg:apricot', def: 'الْمِشْمِشَةُ', defAcc: 'الْمِشْمِشَةَ', sing: { ar: 'مِشْمِشَةٌ', fr: 'un abricot' } },
  { id: 'tin', ar: 'تِينٌ', fr: 'des figues', img: 'svg:fig', def: 'التِّينَةُ', defAcc: 'التِّينَةَ', sing: { ar: 'تِينَةٌ', fr: 'une figue' } },
  { id: 'kummathra', ar: 'كُمَّثْرَى', fr: 'des poires', img: '🍐', def: 'الْكُمَّثْرَاةُ', defAcc: 'الْكُمَّثْرَاةَ', sing: { ar: 'كُمَّثْرَاةٌ', fr: 'une poire' } },
  { id: 'rumman', ar: 'رُمَّانٌ', fr: 'des grenades', img: 'svg:pomegranate', def: 'الرُّمَّانَةُ', defAcc: 'الرُّمَّانَةَ', sing: { ar: 'رُمَّانَةٌ', fr: 'une grenade' } },
  { id: 'laymun', ar: 'لَيْمُونٌ', fr: 'des citrons', img: '🍋', def: 'اللَّيْمُونَةُ', defAcc: 'اللَّيْمُونَةَ', sing: { ar: 'لَيْمُونَةٌ', fr: 'un citron' } },
  { id: 'battikh', ar: 'بِطِّيخٌ', fr: 'des pastèques', img: '🍉', def: 'الْبِطِّيخَةُ', defAcc: 'الْبِطِّيخَةَ', sing: { ar: 'بِطِّيخَةٌ', fr: 'une pastèque' } },
  { id: 'inab', ar: 'عِنَبٌ', fr: 'du raisin', img: '🍇', def: 'الْعِنَبُ', defAcc: 'الْعِنَبَ' },
  { id: 'karaz', ar: 'كَرَزٌ', fr: 'des cerises', img: '🍒', def: 'الْكَرَزَةُ', defAcc: 'الْكَرَزَةَ', sing: { ar: 'كَرَزَةٌ', fr: 'une cerise' } },
];

const ids = (ws: Word[], from: number, to: number) => ws.slice(from, to).map((w) => w.id);

function buildMatches(prefix: string, ws: Word[], rule: 'fiAla' | 'ayna', ruleTitle: string): Match[] {
  const a = ids(ws, 0, 6);
  const b = ids(ws, 6, 12);
  const all = ids(ws, 0, 12);
  return [
    {
      id: `${prefix}-1`, stage: 'Poules', title: 'Les 6 premiers mots',
      activities: [
        { type: 'discover', words: a },
        { type: 'pairing', words: a },
        { type: 'trace', words: [a[0], a[3]] },
        { type: 'quiz', words: a, count: 6 },
      ],
    },
    {
      id: `${prefix}-2`, stage: 'Quarts', title: '6 mots de plus',
      activities: [
        { type: 'discover', words: b },
        { type: 'pairing', words: b },
        { type: 'trace', words: [b[1], b[4]] },
        { type: 'quiz', words: b, count: 6 },
      ],
    },
    {
      id: `${prefix}-3`, stage: 'Demi-finale', title: ruleTitle,
      activities: [
        { type: 'rule', rule, count: 8 },
        { type: 'quiz', words: all, count: 4 },
      ],
    },
    {
      id: `${prefix}-4`, stage: 'Finale', title: 'Sons proches et dictée',
      activities: [
        { type: 'sounds', count: 5 },
        { type: 'dictation', words: [all[2], all[7], all[10]] },
        { type: 'quiz', words: all, count: 6 },
      ],
    },
  ];
}

export const WORLDS: World[] = [
  {
    id: 'food',
    title: 'La nourriture',
    subtitle: 'Ton chapitre actuel : on consolide',
    ruleLabel: 'فِي / عَلَى',
    words: food,
    sounds: {
      letters: ['ظ', 'ذ'],
      tip: 'Pour ظ, la langue touche les dents et le son est plus lourd, comme si la bouche était pleine. Pour ذ, le son est léger.',
      pairs: [
        ['ظَلَّ', 'ذَلَّ'],
        ['نَظَرَ', 'نَذَرَ'],
        ['ظِلٌّ', 'ذِلٌّ'],
        ['نَظِيرٌ', 'نَذِيرٌ'],
        ['مَحْظُورٌ', 'مَحْذُورٌ'],
      ],
    },
    matches: buildMatches('food', food, 'fiAla', 'Dans ou sur ?'),
  },
  {
    id: 'fruits',
    title: 'Les fruits',
    subtitle: 'Ton prochain chapitre : prends de l’avance',
    ruleLabel: 'أَيْنَ ؟',
    words: fruits,
    sounds: {
      letters: ['ض', 'ظ'],
      tip: 'Pour ض, le bord de la langue appuie sur les dents du fond. Pour ظ, le bout de la langue sort un peu entre les dents.',
      pairs: [
        ['ضَلَّ', 'ظَلَّ'],
        ['ضَنَّ', 'ظَنَّ'],
        ['حَضَرَ', 'حَظَرَ'],
        ['نَاضِرَةٌ', 'نَاظِرَةٌ'],
      ],
    },
    matches: buildMatches('fruits', fruits, 'ayna', 'Où est le fruit ?'),
  },
];

export const ALL_WORDS: Record<string, Word> = Object.fromEntries(
  WORLDS.flatMap((w) => w.words).map((w) => [w.id, w]),
);

export function worldOfMatch(matchId: string): World {
  return WORLDS.find((w) => w.matches.some((m) => m.id === matchId)) ?? WORLDS[0];
}

export function worldOfWord(wordId: string): World {
  return WORLDS.find((w) => w.words.some((x) => x.id === wordId))!;
}
