// La voix de la prof : ses enregistrements, gardés sur cet appareil (IndexedDB).
import { normalizeSpeech } from './speechKey';

const DB = 'harf-fc-voix';
const STORE = 'mots';
const urls = new Map<string, string>();
const listeners = new Set<() => void>();
let version = 0;

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function changed() {
  version++;
  listeners.forEach((l) => l());
}

export function subscribeTeacher(l: () => void): () => void {
  listeners.add(l);
  return () => listeners.delete(l);
}
export function teacherVersion(): number {
  return version;
}

export function teacherUrl(text: string): string | null {
  return urls.get(normalizeSpeech(text)) ?? null;
}

export async function loadTeacher(): Promise<void> {
  try {
    const db = await open();
    await new Promise<void>((resolve) => {
      const tx = db.transaction(STORE, 'readonly');
      const req = tx.objectStore(STORE).openCursor();
      req.onsuccess = () => {
        const c = req.result;
        if (!c) return resolve();
        urls.set(String(c.key), URL.createObjectURL(c.value as Blob));
        c.continue();
      };
      req.onerror = () => resolve();
    });
    changed();
  } catch {
    /* pas de stockage : tant pis */
  }
}

async function write(key: string, blob: Blob | null): Promise<void> {
  const db = await open();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    if (blob) tx.objectStore(STORE).put(blob, key);
    else tx.objectStore(STORE).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function saveTeacher(text: string, blob: Blob): Promise<void> {
  const key = normalizeSpeech(text);
  await write(key, blob);
  const old = urls.get(key);
  if (old) URL.revokeObjectURL(old);
  urls.set(key, URL.createObjectURL(blob));
  changed();
}

export async function deleteTeacher(text: string): Promise<void> {
  const key = normalizeSpeech(text);
  await write(key, null);
  const old = urls.get(key);
  if (old) URL.revokeObjectURL(old);
  urls.delete(key);
  changed();
}

if (typeof indexedDB !== 'undefined') void loadTeacher();
