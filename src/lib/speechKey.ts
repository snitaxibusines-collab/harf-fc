// La même phrase doit toujours donner la même clé, dans l'appli comme dans la liste des sons.
export function normalizeSpeech(t: string): string {
  return t.replace(/…/g, ' ').replace(/[\s ]+/g, ' ').trim();
}

// Petit nom de fichier stable à partir du texte (FNV-1a 32 bits, en UTF-8).
export function speechFile(t: string): string {
  const bytes = new TextEncoder().encode(normalizeSpeech(t));
  let h = 0x811c9dc5;
  for (const b of bytes) {
    h ^= b;
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return 'w' + h.toString(16).padStart(8, '0') + '.mp3';
}
