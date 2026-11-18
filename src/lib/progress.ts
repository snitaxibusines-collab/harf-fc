// Les progrès de l'enfant, gardés dans la tablette (rien n'est envoyé sur internet).
import { useSyncExternalStore } from 'react';
import { WORLDS } from '../data/content';

const KEY = 'harf-fc-v1';
const DAY = 24 * 60 * 60 * 1000;

export interface Progress {
  stars: Record<string, number>; // matchId → 0 à 3 ballons d'or
  blocks: number; // blocs gagnés pour construire le stade
  review: Record<string, number>; // wordId → date (ms) où le mot revient
  unlockAll: boolean;
  playerName: string;
}

const EMPTY: Progress = { stars: {}, blocks: 0, review: {}, unlockAll: false, playerName: '' };

function load(): Progress {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...EMPTY, ...JSON.parse(raw) };
  } catch {
    /* stockage indisponible : on repart de zéro */
  }
  return { ...EMPTY };
}

let state: Progress = load();
const listeners = new Set<() => void>();

function save(next: Progress) {
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* tant pis : la partie continue sans sauvegarde */
  }
  listeners.forEach((l) => l());
}

export function useProgress(): Progress {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => state,
  );
}

export function getProgress(): Progress {
  return state;
}

/** Enregistre la fin d'un match. Renvoie le nombre de nouveaux blocs gagnés. */
export function finishMatch(matchId: string, stars: number): number {
  const before = state.stars[matchId] ?? 0;
  const gained = Math.max(0, stars - before) * 2 + 1; // toujours au moins 1 bloc pour l'effort
  save({
    ...state,
    stars: { ...state.stars, [matchId]: Math.max(before, stars) },
    blocks: state.blocks + gained,
  });
  return gained;
}

export function markMissed(wordIds: string[]) {
  if (!wordIds.length) return;
  const review = { ...state.review };
  const due = Date.now() + 2 * DAY;
  wordIds.forEach((id) => (review[id] = due));
  save({ ...state, review });
}

export function markReviewed(wordIds: string[]) {
  const review = { ...state.review };
  wordIds.forEach((id) => delete review[id]);
  save({ ...state, review });
}

export function dueReviewWords(): string[] {
  const now = Date.now();
  return Object.entries(state.review)
    .filter(([, due]) => due <= now)
    .map(([id]) => id);
}

export function pendingReviewWords(): string[] {
  return Object.keys(state.review);
}

export function isUnlocked(matchId: string): boolean {
  if (state.unlockAll) return true;
  for (const w of WORLDS) {
    const i = w.matches.findIndex((m) => m.id === matchId);
    if (i === 0) return true;
    if (i > 0) return (state.stars[w.matches[i - 1].id] ?? 0) >= 1;
  }
  return false;
}

export function setUnlockAll(v: boolean) {
  save({ ...state, unlockAll: v });
}

export function setPlayerName(name: string) {
  save({ ...state, playerName: name.slice(0, 20) });
}

export function resetProgress() {
  save({ ...EMPTY });
}

export function totalStars(): number {
  return Object.values(state.stars).reduce((a, b) => a + b, 0);
}

export const MAX_STARS = WORLDS.reduce((n, w) => n + w.matches.length * 3, 0);

// Le stade : 4 parties à construire, chacune avec un nombre de blocs.
export const STADIUM_PARTS = [
  { name: 'La pelouse', blocks: 6 },
  { name: 'Les buts', blocks: 6 },
  { name: 'La tribune nord', blocks: 10 },
  { name: 'La tribune sud', blocks: 10 },
  { name: 'Les projecteurs', blocks: 8 },
  { name: 'Le tableau de score', blocks: 8 },
];

export function stadiumState(blocks: number) {
  let left = blocks;
  return STADIUM_PARTS.map((p) => {
    const have = Math.min(p.blocks, Math.max(0, left));
    left -= p.blocks;
    return { ...p, have, done: have >= p.blocks };
  });
}
