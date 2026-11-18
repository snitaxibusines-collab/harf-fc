// La voix de l'appli. Pour l'instant : la voix arabe de l'iPad.
// Plus tard : les enregistrements de la prof, rangés dans AUDIO_FILES (texte → fichier).

export const AUDIO_FILES: Record<string, string> = {};

let arabicVoice: SpeechSynthesisVoice | null = null;
let frenchVoice: SpeechSynthesisVoice | null = null;

function pickVoices() {
  if (!('speechSynthesis' in window)) return;
  const voices = window.speechSynthesis.getVoices();
  const ar = voices.filter((v) => v.lang.toLowerCase().startsWith('ar'));
  arabicVoice = ar.find((v) => v.lang === 'ar-SA') ?? ar[0] ?? null;
  const fr = voices.filter((v) => v.lang.toLowerCase().startsWith('fr'));
  frenchVoice = fr.find((v) => v.lang === 'fr-FR') ?? fr[0] ?? null;
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  pickVoices();
  window.speechSynthesis.addEventListener?.('voiceschanged', pickVoices);
}

export function hasArabicVoice(): boolean {
  pickVoices();
  return arabicVoice !== null;
}

export function arabicVoiceName(): string | null {
  pickVoices();
  return arabicVoice ? `${arabicVoice.name} (${arabicVoice.lang})` : null;
}

let current: HTMLAudioElement | null = null;

function playFile(url: string): Promise<void> {
  return new Promise((resolve) => {
    current?.pause();
    const a = new Audio(url);
    current = a;
    a.onended = () => resolve();
    a.onerror = () => resolve();
    a.play().catch(() => resolve());
  });
}

function utter(text: string, lang: 'ar' | 'fr', rate: number): Promise<void> {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) return resolve();
    const synth = window.speechSynthesis;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    if (lang === 'ar') {
      u.lang = arabicVoice?.lang ?? 'ar-SA';
      if (arabicVoice) u.voice = arabicVoice;
    } else {
      u.lang = frenchVoice?.lang ?? 'fr-FR';
      if (frenchVoice) u.voice = frenchVoice;
    }
    u.rate = rate;
    let done = false;
    const finish = () => {
      if (!done) {
        done = true;
        resolve();
      }
    };
    u.onend = finish;
    u.onerror = finish;
    // Sécurité : certaines tablettes n'envoient jamais « fin ».
    setTimeout(finish, 1500 + text.length * 250);
    synth.speak(u);
  });
}

export function sayArabic(text: string, slow = false): Promise<void> {
  pickVoices();
  const file = AUDIO_FILES[text];
  if (file) return playFile(file);
  return utter(text, 'ar', slow ? 0.6 : 0.8);
}

export function sayFrench(text: string): Promise<void> {
  pickVoices();
  return utter(text, 'fr', 1);
}

export function stopSpeaking() {
  current?.pause();
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
}

// Petits sons de jeu, fabriqués sans fichier.
let ctx: AudioContext | null = null;
export function beep(kind: 'good' | 'bad' | 'win') {
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = ctx ?? new AC();
    const notes = kind === 'good' ? [660, 880] : kind === 'bad' ? [300, 220] : [523, 659, 784, 1047];
    notes.forEach((f, i) => {
      const o = ctx!.createOscillator();
      const g = ctx!.createGain();
      o.type = kind === 'bad' ? 'sawtooth' : 'triangle';
      o.frequency.value = f;
      const t = ctx!.currentTime + i * 0.12;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.15, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
      o.connect(g).connect(ctx!.destination);
      o.start(t);
      o.stop(t + 0.16);
    });
  } catch {
    /* pas de son, ce n'est pas grave */
  }
}
