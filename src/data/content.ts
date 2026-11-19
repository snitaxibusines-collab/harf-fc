// Contenu de Harf FC : les mondes, les mots et les matchs.
// Les listes de mots suivent les thèmes du cours (vocabulaire courant).
// Les images sont provisoires (émojis ou petits dessins), en attendant nos propres illustrations.

export type ImageKey = string; // un émoji, ou "svg:<nom>" pour un petit dessin maison

export interface Word {
  id: string;
  ar: string; // le mot avec les voyelles
  fr: string;
  img: ImageKey;
  def?: string; // avec « al », au cas sujet (ex. الْحَلِيبُ) — mondes 1 et 2
  defAcc?: string; // avec « al », au cas direct (ex. الْحَلِيبَ), pour « ضَعْ … »
  note?: string; // une explication en français (Noms d'Allah, invocations)
  fem?: boolean; // nom féminin (pour هٰذِهِ)
  long?: boolean; // texte long (invocation) : pas d'écriture ni de lettres à remettre
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
  | { type: 'dictation'; words: string[] }
  | { type: 'choice'; gen: ChoiceGen; count: number; title: string };

// Les jeux de règle des nouveaux mondes (voir choices.ts).
export type ChoiceGen = 'fawqa' | 'feminine' | 'opposites1' | 'pronouns' | 'opposites2' | 'amama' | 'colors' | 'hadha' | 'sunMoon' | 'names';

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
  sounds?: SoundPairs;
  matches: Match[];
  bonus?: boolean;
}

export const food: Word[] = [
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

export const fruits: Word[] = [
  { id: 'tuffah', ar: 'تُفَّاحٌ', fr: 'des pommes', img: '🍎', def: 'التُّفَّاحَةُ', defAcc: 'التُّفَّاحَةَ', sing: { ar: 'تُفَّاحَةٌ', fr: 'une pomme' } },
  { id: 'burtuqal', ar: 'بُرْتُقَالٌ', fr: 'des oranges', img: '🍊', def: 'الْبُرْتُقَالَةُ', defAcc: 'الْبُرْتُقَالَةَ', sing: { ar: 'بُرْتُقَالَةٌ', fr: 'une orange' } },
  { id: 'mawz', ar: 'مَوْزٌ', fr: 'des bananes', img: '🍌', def: 'الْمَوْزَةُ', defAcc: 'الْمَوْزَةَ', sing: { ar: 'مَوْزَةٌ', fr: 'une banane' } },
  { id: 'farawla', ar: 'فَرَاوِلَةٌ', fr: 'des fraises', img: '🍓', def: 'الْفَرَاوِلَةُ', defAcc: 'الْفَرَاوِلَةَ' },
  { id: 'mishmish', ar: 'مِشْمِشٌ', fr: 'des abricots', img: '🍑', def: 'الْمِشْمِشَةُ', defAcc: 'الْمِشْمِشَةَ', sing: { ar: 'مِشْمِشَةٌ', fr: 'un abricot' } },
  { id: 'tin', ar: 'تِينٌ', fr: 'des figues', img: 'svg:fig', def: 'التِّينَةُ', defAcc: 'التِّينَةَ', sing: { ar: 'تِينَةٌ', fr: 'une figue' } },
  { id: 'kummathra', ar: 'كُمَّثْرَى', fr: 'des poires', img: '🍐', def: 'الْكُمَّثْرَاةُ', defAcc: 'الْكُمَّثْرَاةَ', sing: { ar: 'كُمَّثْرَاةٌ', fr: 'une poire' } },
  { id: 'rumman', ar: 'رُمَّانٌ', fr: 'des grenades', img: 'svg:pomegranate', def: 'الرُّمَّانَةُ', defAcc: 'الرُّمَّانَةَ', sing: { ar: 'رُمَّانَةٌ', fr: 'une grenade' } },
  { id: 'laymun', ar: 'لَيْمُونٌ', fr: 'des citrons', img: '🍋', def: 'اللَّيْمُونَةُ', defAcc: 'اللَّيْمُونَةَ', sing: { ar: 'لَيْمُونَةٌ', fr: 'un citron' } },
  { id: 'battikh', ar: 'بِطِّيخٌ', fr: 'des pastèques', img: '🍉', def: 'الْبِطِّيخَةُ', defAcc: 'الْبِطِّيخَةَ', sing: { ar: 'بِطِّيخَةٌ', fr: 'une pastèque' } },
  { id: 'inab', ar: 'عِنَبٌ', fr: 'du raisin', img: '🍇', def: 'الْعِنَبُ', defAcc: 'الْعِنَبَ' },
  { id: 'karaz', ar: 'كَرَزٌ', fr: 'des cerises', img: '🍒', def: 'الْكَرَزَةُ', defAcc: 'الْكَرَزَةَ', sing: { ar: 'كَرَزَةٌ', fr: 'une cerise' } },
];


type RuleActivity = Activity;

// Un monde = un petit championnat : des matchs de 6 mots, puis la règle, puis la finale.
function buildMatches(prefix: string, ws: Word[], rule: RuleActivity | null, ruleTitle: string, opts: { sounds?: boolean; extra?: Activity[] } = {}): Match[] {
  const stages = ['Poules', 'Quarts', 'Huitièmes', 'Barrages'];
  const titles = ['Les 6 premiers mots', '6 mots de plus', 'Encore 6 mots', 'Les derniers mots'];
  const groups: string[][] = [];
  const list = ws.map((w) => w.id);
  const size = list.length <= 8 ? 4 : 6;
  for (let i = 0; i < list.length; i += size) groups.push(list.slice(i, i + size));
  const traceable = (g: string[]) => g.filter((id) => !ws.find((w) => w.id === id)!.long);
  const matches: Match[] = groups.map((g, k) => {
    const t = traceable(g);
    return {
      id: `${prefix}-${k + 1}`,
      stage: stages[k] ?? `Tour ${k + 1}`,
      title: size === 4 ? (k === 0 ? 'Les 4 premiers mots' : '4 mots de plus') : titles[k] ?? `${g.length} mots`,
      activities: [
        { type: 'discover', words: g },
        ...(ws.every((w) => w.img) ? [{ type: 'pairing', words: g } as Activity] : []),
        ...(t.length ? [{ type: 'trace', words: t.length > 1 ? [t[0], t[Math.min(3, t.length - 1)]] : [t[0]] } as Activity] : []),
        { type: 'quiz', words: g.length >= 3 ? g : list, count: 6 },
      ],
    };
  });
  const n = groups.length;
  const shortWords = list.filter((id) => !ws.find((w) => w.id === id)!.long);
  if (rule) {
    matches.push({
      id: `${prefix}-${n + 1}`, stage: 'Demi-finale', title: ruleTitle,
      activities: [rule, { type: 'quiz', words: list, count: 4 }],
    });
  }
  const pickDict = [shortWords[2], shortWords[Math.floor(shortWords.length / 2) + 1], shortWords[shortWords.length - 2]].filter(Boolean);
  matches.push({
    id: `${prefix}-${matches.length + 1}`, stage: 'Finale', title: opts.sounds === false ? 'La grande finale' : 'Sons proches et dictée',
    activities: [
      ...(opts.sounds === false ? [] : [{ type: 'sounds', count: 5 } as Activity]),
      ...(opts.extra ?? []),
      { type: 'dictation', words: [...new Set(pickDict)] },
      { type: 'quiz', words: list, count: 6 },
    ],
  });
  return matches;
}

// Ajoute « al » à un mot (pour les nouveaux mondes) : الْ + mot, ou lettre solaire doublée.
const SUN = 'تثدذرزسشصضطظلن';
export function withAl(ar: string): string {
  const base = ar.replace(/\u064C/g, '\u064F').replace(/\u064B/g, '\u064E').replace(/\u064D/g, '\u0650');
  const first = base[0];
  if (SUN.includes(first)) {
    const haraka = /[\u064B-\u0652]/.test(base[1] ?? '') && base[1] !== '\u0651' ? base[1] : '';
    const rest = haraka ? base.slice(2) : base.slice(1);
    return 'ال' + first + '\u0651' + haraka + rest;
  }
  return 'الْ' + base;
}

const w = (id: string, ar: string, fr: string, img: string, extra: Partial<Word> = {}): Word => ({ id, ar, fr, img, ...extra });

export const vegetables: Word[] = [
  w('batatis', 'بَطَاطِسُ', 'des pommes de terre', '🥔'),
  w('jazar', 'جَزَرٌ', 'des carottes', '🥕'),
  w('basal', 'بَصَلٌ', 'des oignons', '🧅'),
  w('kurrath', 'كُرَّاثٌ', 'des poireaux', 'svg:leek'),
  w('badhinjan', 'بَاذِنْجَانٌ', 'des aubergines', '🍆'),
  w('dhura', 'ذُرَةٌ', 'du maïs', '🌽'),
  w('bazilla', 'بَازِلَاءُ', 'des petits pois', '🫛'),
  w('fulful', 'فُلْفُلٌ', 'des poivrons', '🫑'),
  w('thum', 'ثُومٌ', "de l'ail", '🧄'),
  w('tamatim', 'طَمَاطِمُ', 'des tomates', '🍅'),
  w('khiyar', 'خِيَارٌ', 'des concombres', '🥒'),
  w('khass', 'خَسٌّ', 'de la salade', '🥬'),
];

export const ADJ_PAIRS: [string, string][] = [
  ['kabir', 'saghir'], ['jadid', 'qadim'], ['maftuh', 'mughlaq'], ['nazif', 'wasikh'],
  ['tawil', 'qasir'], ['mamlu', 'farigh'], ['harr', 'barid'], ['qarib', 'baid'],
];

export const opposites1: Word[] = [
  w('kabir', 'كَبِيرٌ', 'grand', '🐘', { sing: { ar: 'كَبِيرَةٌ', fr: 'grande' } }),
  w('saghir', 'صَغِيرٌ', 'petit', '🐭', { sing: { ar: 'صَغِيرَةٌ', fr: 'petite' } }),
  w('jadid', 'جَدِيدٌ', 'neuf', '🎁', { sing: { ar: 'جَدِيدَةٌ', fr: 'neuve' } }),
  w('qadim', 'قَدِيمٌ', 'vieux', '🏚️', { sing: { ar: 'قَدِيمَةٌ', fr: 'vieille' } }),
  w('maftuh', 'مَفْتُوحٌ', 'ouvert', '🔓', { sing: { ar: 'مَفْتُوحَةٌ', fr: 'ouverte' } }),
  w('mughlaq', 'مُغْلَقٌ', 'fermé', '🔒', { sing: { ar: 'مُغْلَقَةٌ', fr: 'fermée' } }),
  w('nazif', 'نَظِيفٌ', 'propre', '🧼', { sing: { ar: 'نَظِيفَةٌ', fr: 'propre (fém.)' } }),
  w('wasikh', 'وَسِخٌ', 'sale', '🦠', { sing: { ar: 'وَسِخَةٌ', fr: 'sale (fém.)' } }),
];

export const opposites2: Word[] = [
  w('tawil', 'طَوِيلٌ', 'long, grand de taille', '🦒', { sing: { ar: 'طَوِيلَةٌ', fr: 'longue' } }),
  w('qasir', 'قَصِيرٌ', 'court, petit de taille', '🐢', { sing: { ar: 'قَصِيرَةٌ', fr: 'courte' } }),
  w('mamlu', 'مَمْلُوءٌ', 'plein', '🔋', { sing: { ar: 'مَمْلُوءَةٌ', fr: 'pleine' } }),
  w('farigh', 'فَارِغٌ', 'vide', '🪫', { sing: { ar: 'فَارِغَةٌ', fr: 'vide (fém.)' } }),
  w('harr', 'حَارٌّ', 'chaud', '🔥', { sing: { ar: 'حَارَّةٌ', fr: 'chaude' } }),
  w('barid', 'بَارِدٌ', 'froid', '🧊', { sing: { ar: 'بَارِدَةٌ', fr: 'froide' } }),
  w('qarib', 'قَرِيبٌ', 'près (de)', '📍', { sing: { ar: 'قَرِيبَةٌ', fr: 'proche (fém.)' } }),
  w('baid', 'بَعِيدٌ', 'loin (de)', '🔭', { sing: { ar: 'بَعِيدَةٌ', fr: 'loin (fém.)' } }),
];

export const school: Word[] = [
  w('madrasa', 'مَدْرَسَةٌ', 'une école', '🏫', { fem: true }),
  w('saff', 'صَفٌّ', 'une classe', '🧑‍🏫'),
  w('sabbura', 'سَبُّورَةٌ', 'un tableau (noir)', 'svg:board', { fem: true }),
  w('misbah', 'مِصْبَاحٌ', 'une lampe', '💡'),
  w('kharita', 'خَرِيطَةٌ', 'une carte', '🗺️', { fem: true }),
  w('saa', 'سَاعَةٌ', 'une horloge', '🕰️', { fem: true }),
  w('miknasa', 'مِكْنَسَةٌ', 'un balai', '🧹', { fem: true }),
  w('salla', 'سَلَّةٌ', 'une corbeille', '🗑️', { fem: true }),
  w('lawha', 'لَوْحَةٌ', 'une image, un tableau', '🖼️', { fem: true }),
  w('kitab', 'كِتَابٌ', 'un livre', '📕'),
  w('daftar', 'دَفْتَرٌ', 'un cahier', '📓'),
  w('waraqa', 'وَرَقَةٌ', 'une feuille', '📄', { fem: true }),
];

export const COLORS: { ar: string; fr: string; css: string }[] = [
  { ar: 'أَحْمَرُ', fr: 'rouge', css: '#d62828' },
  { ar: 'أَزْرَقُ', fr: 'bleu', css: '#1d4ed8' },
  { ar: 'أَبْيَضُ', fr: 'blanc', css: '#ffffff' },
  { ar: 'أَصْفَرُ', fr: 'jaune', css: '#facc15' },
  { ar: 'أَخْضَرُ', fr: 'vert', css: '#16a34a' },
  { ar: 'أَسْوَدُ', fr: 'noir', css: '#111827' },
];

const football: Word[] = [
  w('kura', 'كُرَةٌ', 'un ballon', '⚽', { fem: true }),
  w('hadaf', 'هَدَفٌ', 'un but', '🥅'),
  w('laib', 'لَاعِبٌ', 'un joueur', '🏃'),
  w('fariq', 'فَرِيقٌ', 'une équipe', '👥'),
  w('malab', 'مَلْعَبٌ', 'un stade', '🏟️'),
  w('haris', 'حَارِسُ الْمَرْمَى', 'le gardien de but', '🧤'),
  ...COLORS.map((c, i) => w(`color${i}`, c.ar, c.fr, `color:${c.css}`)),
];

export const animals: Word[] = [
  w('kalb', 'كَلْبٌ', 'un chien', '🐕'),
  w('fil', 'فِيلٌ', 'un éléphant', '🐘'),
  w('asad', 'أَسَدٌ', 'un lion', '🦁'),
  w('dhib', 'ذِئْبٌ', 'un loup', '🐺'),
  w('baqara', 'بَقَرَةٌ', 'une vache', '🐄', { fem: true }),
  w('hisan', 'حِصَانٌ', 'un cheval', '🐎'),
  w('himar', 'حِمَارٌ', 'un âne', '🫏'),
  w('naja', 'نَعْجَةٌ', 'une brebis', '🐑', { fem: true }),
  w('hut', 'حُوتٌ', 'une baleine', '🐋'),
  w('qird', 'قِرْدٌ', 'un singe', '🐒'),
  w('jamal', 'جَمَلٌ', 'un chameau', '🐫'),
  w('naqa', 'نَاقَةٌ', 'une chamelle', '🐪', { fem: true }),
  w('hudhud', 'هُدْهُدٌ', 'une huppe (oiseau)', '🐦'),
  w('thuban', 'ثُعْبَانٌ', 'un serpent', '🐍'),
  w('ghurab', 'غُرَابٌ', 'un corbeau', '🐦‍⬛'),
  w('difdaa', 'ضِفْدَعَةٌ', 'une grenouille', '🐸', { fem: true }),
  w('ankabut', 'عَنْكَبُوتٌ', 'une araignée', '🕷️'),
  w('nahla', 'نَحْلَةٌ', 'une abeille', '🐝', { fem: true }),
  w('namla', 'نَمْلَةٌ', 'une fourmi', '🐜', { fem: true }),
  w('farash', 'فَرَاشٌ', 'des papillons', '🦋'),
  w('jarad', 'جَرَادٌ', 'des sauterelles', '🦗'),
  w('baouda', 'بَعُوضَةٌ', 'un moustique', '🦟', { fem: true }),
  w('dhubab', 'ذُبَابٌ', 'des mouches', '🪰'),
  w('hisanKhayl', 'خَيْلٌ', 'des chevaux', '🏇'),
];

export const allahNames: Word[] = [
  w('alhayy', 'الْحَيُّ', 'Le Vivant', '', { note: "Allah est vivant pour toujours. Il ne dort jamais et ne meurt jamais." }),
  w('alqayyum', 'الْقَيُّومُ', 'Celui qui existe par Lui-même et fait tout tenir', '', { note: "Allah n'a besoin de personne, et tout ce qui existe a besoin de Lui." }),
  w('arrabb', 'الرَّبُّ', 'Le Seigneur', '', { note: "Allah prend soin de nous, nous nourrit et nous guide." }),
  w('alkhaliq', 'الْخَالِقُ', 'Le Créateur', '', { note: "Allah a créé le ciel, la terre, les animaux et les hommes." }),
  w('dua1', 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ', 'Notre Seigneur, donne-nous du bien dans ce monde et du bien dans l’au-delà, et protège-nous du feu', '', { long: true, note: 'Une invocation du Coran (sourate Al-Baqara, verset 201).' }),
  w('dua2', 'رَبَّنَا مَا خَلَقْتَ هَٰذَا بَاطِلًا', 'Notre Seigneur, Tu n’as pas créé tout cela pour rien', '', { long: true, note: 'Une invocation du Coran (sourate Âl ʿImrân, verset 191).' }),
];

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
    matches: buildMatches('food', food, { type: 'rule', rule: 'fiAla', count: 8 }, 'Dans ou sur ?'),
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
    matches: buildMatches('fruits', fruits, { type: 'rule', rule: 'ayna', count: 8 }, 'Où est le fruit ?'),
  },
  {
    id: 'veg',
    title: 'Les légumes',
    subtitle: 'Chapitre 3 : au-dessus ou en dessous ?',
    ruleLabel: 'فَوْقَ / تَحْتَ',
    words: vegetables,
    sounds: {
      letters: ['ث', 'س'],
      tip: 'Pour ث, le bout de la langue sort un peu entre les dents. Pour س, la langue reste derrière les dents et ça siffle.',
      pairs: [
        ['ثَارَ', 'سَارَ'],
        ['ثَمِينٌ', 'سَمِينٌ'],
        ['كَثِيرٌ', 'كَسِيرٌ'],
        ['ثَوْرٌ', 'سُورٌ'],
      ],
    },
    matches: buildMatches('veg', vegetables, { type: 'choice', gen: 'fawqa', count: 8, title: 'Au-dessus ou en dessous ?' }, 'Au-dessus ou en dessous ?'),
  },
  {
    id: 'opp1',
    title: 'Les contraires 1',
    subtitle: 'Chapitre 4 : grand, petit… et le féminin en ة',
    ruleLabel: 'ـة',
    words: opposites1,
    sounds: {
      letters: ['س', 'ش'],
      tip: 'Pour س, ça siffle comme un serpent. Pour ش, ça chuinte comme quand on dit « chut ».',
      pairs: [
        ['سَارَ', 'شَارَ'],
        ['سَبَكَ', 'شَبَكَ'],
        ['سَهْمٌ', 'شَهْمٌ'],
        ['سَمَّ', 'شَمَّ'],
      ],
    },
    matches: buildMatches('opp1', opposites1, { type: 'choice', gen: 'feminine', count: 8, title: 'Masculin ou féminin ?' }, 'Le féminin en ة', {
      extra: [{ type: 'choice', gen: 'opposites1', count: 4, title: 'Trouve le contraire' }],
    }),
  },
  {
    id: 'opp2',
    title: 'Les contraires 2',
    subtitle: 'Chapitre 5 : chaud, froid… et أَنَا، أَنْتَ، هُوَ، هِيَ',
    ruleLabel: 'أَنَا / هُوَ / هِيَ',
    words: opposites2,
    sounds: {
      letters: ['خ', 'غ'],
      tip: 'Pour خ, l’air frotte au fond de la gorge, sans voix. Pour غ, c’est le même endroit mais la voix vibre, comme un gargarisme.',
      pairs: [
        ['خَالٍ', 'غَالٍ'],
        ['خَابَ', 'غَابَ'],
        ['خَرَسَ', 'غَرَسَ'],
        ['خَيْرٌ', 'غَيْرٌ'],
      ],
    },
    matches: buildMatches('opp2', opposites2, { type: 'choice', gen: 'pronouns', count: 8, title: 'Qui est-ce ?' }, 'Les pronoms', {
      extra: [{ type: 'choice', gen: 'opposites2', count: 4, title: 'Trouve le contraire' }],
    }),
  },
  {
    id: 'school',
    title: "L'école",
    subtitle: 'Chapitre 6 : devant ou derrière ?',
    ruleLabel: 'أَمَامَ / خَلْفَ',
    words: school,
    sounds: {
      letters: ['ـَ', 'ـَا'],
      tip: 'Une voyelle courte (fatha) se dit vite. Une voyelle longue (avec alif) dure deux fois plus longtemps.',
      pairs: [
        ['جَمَلٌ', 'جَمَالٌ'],
        ['كَتَبَ', 'كَاتَبَ'],
        ['سَلَمٌ', 'سَلَامٌ'],
        ['حَرَمٌ', 'حَرَامٌ'],
      ],
    },
    matches: buildMatches('school', school, { type: 'choice', gen: 'amama', count: 8, title: 'Devant ou derrière ?' }, 'Devant ou derrière ?'),
  },
  {
    id: 'review1',
    title: 'Révision',
    subtitle: 'Comme la révision du livre : ال, هٰذَا / هٰذِهِ',
    ruleLabel: 'هٰذَا / هٰذِهِ',
    words: [],
    matches: [
      { id: 'review1-1', stage: 'Match amical', title: 'Lettres solaires et lunaires', activities: [{ type: 'choice', gen: 'sunMoon', count: 10, title: 'Le ل de ال se dit ou pas ?' }] },
      { id: 'review1-2', stage: 'Match amical', title: 'هٰذَا ou هٰذِهِ ?', activities: [{ type: 'choice', gen: 'hadha', count: 10, title: 'هٰذَا ou هٰذِهِ ?' }] },
      { id: 'review1-3', stage: 'Finale', title: 'Tous les mots', activities: [{ type: 'quiz', words: [...food, ...fruits, ...vegetables, ...school].map((x) => x.id), count: 10 }] },
    ],
  },
  {
    id: 'foot',
    title: 'Le foot',
    subtitle: 'Monde bonus : ballon, but, joueur… et les couleurs des maillots',
    ruleLabel: 'كُرَةُ الْقَدَمِ',
    bonus: true,
    words: football,
    sounds: {
      letters: ['ح', 'ه'],
      tip: 'Pour ح, l’air frotte fort au milieu de la gorge, comme quand on souffle sur des lunettes. Pour ه, c’est un souffle léger.',
      pairs: [
        ['حَبَّ', 'هَبَّ'],
        ['حَرَمٌ', 'هَرَمٌ'],
        ['نَحْرٌ', 'نَهْرٌ'],
        ['حَلَّ', 'هَلَّ'],
      ],
    },
    matches: buildMatches('foot', football, { type: 'choice', gen: 'colors', count: 8, title: 'De quelle couleur est le maillot ?' }, 'Les couleurs des maillots'),
  },
  {
    id: 'animals',
    title: 'Les animaux',
    subtitle: 'Monde bonus : 24 animaux',
    ruleLabel: 'هٰذَا / هٰذِهِ',
    bonus: true,
    words: animals,
    sounds: {
      letters: ['ع', 'أ'],
      tip: 'Pour ع, la gorge se serre au milieu, comme un petit écho. Pour أ, c’est un petit arrêt net, sans serrer la gorge.',
      pairs: [
        ['عَمَلٌ', 'أَمَلٌ'],
        ['عَلِمَ', 'أَلِمَ'],
        ['سَعَلَ', 'سَأَلَ'],
        ['عَمِيرٌ', 'أَمِيرٌ'],
      ],
    },
    matches: buildMatches('animals', animals, { type: 'choice', gen: 'hadha', count: 8, title: 'هٰذَا ou هٰذِهِ ?' }, 'هٰذَا ou هٰذِهِ ?'),
  },
  {
    id: 'allah',
    title: "Les Noms d'Allah",
    subtitle: 'Monde bonus : 4 beaux noms et 2 invocations',
    ruleLabel: 'الْأَسْمَاءُ الْحُسْنَى',
    bonus: true,
    words: allahNames,
    matches: buildMatches('allah', allahNames, { type: 'choice', gen: 'names', count: 6, title: 'Que veut dire ce nom ?' }, 'Que veut dire ce nom ?', { sounds: false }),
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
