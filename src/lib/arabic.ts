// Petits outils pour l'écriture arabe : enlever les voyelles, découper un mot en lettres
// et trouver la forme de chaque lettre (seule, au début, au milieu, à la fin).

const HARAKAT = /[ً-ٰٟۖ-ۭ]/g;
const TATWEEL = 'ـ';

export function stripHarakat(s: string): string {
  return s.replace(HARAKAT, '');
}

// Lettres qui ne s'attachent jamais à la lettre suivante.
const RIGHT_JOINING = new Set('اأإآءدذرزوؤةى'.split(''));
const NON_JOINING = new Set(['ء']);

export type Position = 'isolated' | 'initial' | 'medial' | 'final';

export const POSITION_FR: Record<Position, string> = {
  isolated: 'seule',
  initial: 'au début',
  medial: 'au milieu',
  final: 'à la fin',
};

export interface LetterForm {
  letter: string;
  position: Position;
  display: string; // la lettre avec le trait d'union arabe pour montrer sa forme
}

function joinsNext(ch: string): boolean {
  return !RIGHT_JOINING.has(ch) && !NON_JOINING.has(ch);
}
function joinsPrev(ch: string): boolean {
  return !NON_JOINING.has(ch);
}

export function letters(word: string): string[] {
  return Array.from(stripHarakat(word)).filter((c) => c !== ' ' && c !== TATWEEL);
}

export function letterForms(word: string): LetterForm[] {
  const ls = letters(word);
  return ls.map((letter, i) => {
    const prev = i > 0 && joinsNext(ls[i - 1]) && joinsPrev(letter);
    const next = i < ls.length - 1 && joinsNext(letter) && joinsPrev(ls[i + 1]);
    const position: Position = prev && next ? 'medial' : prev ? 'final' : next ? 'initial' : 'isolated';
    const display = (prev ? TATWEEL : '') + letter + (next ? TATWEEL : '');
    return { letter, position, display };
  });
}

export function shuffle<T>(xs: T[]): T[] {
  const a = xs.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function pick<T>(xs: T[], n: number, exclude: T[] = []): T[] {
  return shuffle(xs.filter((x) => !exclude.includes(x))).slice(0, n);
}

export const ARABIC_LETTERS = 'ابتثجحخدذرزسشصضطظعغفقكلمنهوي'.split('');
