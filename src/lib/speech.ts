// La voix de l'appli.
// 1. Les enregistrements de la prof, rangés dans AUDIO_FILES (texte → fichier), plus tard.
// 2. Les sons fabriqués à l'avance (dossier audio/, liste dans audio/manifest.json).
// 3. En dernier recours : la voix arabe de l'iPad.
import { normalizeSpeech, speechFile } from './speechKey';

export const AUDIO_FILES: Record<string, string> = {};

const online = typeof window !== 'undefined' && location.protocol.startsWith('http');

function fileFor(text: string): string | null {
  const own = AUDIO_FILES[text] ?? AUDIO_FILES[normalizeSpeech(text)];
  if (own) return own;
  return online ? `audio/${speechFile(text)}` : null;
}

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

// Un seul lecteur de sons, réveillé au premier toucher : sur iPad, il peut ensuite jouer tout seul.
let player: HTMLAudioElement | null = null;
function getPlayer(): HTMLAudioElement {
  if (!player) {
    player = new Audio();
    player.preload = 'auto';
    player.setAttribute('playsinline', '');
  }
  return player;
}

// Un tout petit son muet (WAV), pour réveiller le lecteur.
function silentWav(): string {
  const n = 800;
  const buf = new ArrayBuffer(44 + n * 2);
  const v = new DataView(buf);
  const str = (o: number, t: string) => [...t].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
  str(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); str(8, 'WAVE'); str(12, 'fmt ');
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, 16000, true); v.setUint32(28, 32000, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true);
  str(36, 'data'); v.setUint32(40, n * 2, true);
  let bin = '';
  new Uint8Array(buf).forEach((b) => (bin += String.fromCharCode(b)));
  return 'data:audio/wav;base64,' + btoa(bin);
}

let playToken = 0;
function playFile(url: string, rate = 1): Promise<boolean> {
  return new Promise((resolve) => {
    const a = getPlayer();
    const token = ++playToken;
    a.pause();
    a.src = url;
    a.playbackRate = rate;
    (a as HTMLAudioElement & { preservesPitch?: boolean }).preservesPitch = true;
    let settled = false;
    const done = (ok: boolean) => {
      if (token === playToken && !settled) {
        settled = true;
        resolve(ok);
      }
    };
    a.onended = () => done(true);
    a.onerror = () => done(false);
    a.play().catch((e: DOMException) => done(e?.name === 'AbortError'));
    setTimeout(() => done(true), 15000);
  });
}

// Sur iPad, la voix ne parle qu'après un premier toucher de l'écran.
// Au tout premier toucher, on lui fait dire « rien » pour la réveiller.
let unlocked = false;
function unlockSpeech() {
  if (unlocked) return;
  unlocked = true;
  try {
    const a = getPlayer();
    a.src = silentWav();
    a.play().catch(() => undefined);
  } catch {
    /* rien */
  }
  if (!('speechSynthesis' in window)) return;
  try {
    const u = new SpeechSynthesisUtterance(' ');
    u.volume = 0;
    window.speechSynthesis.speak(u);
  } catch {
    /* rien */
  }
}
if (typeof window !== 'undefined') {
  window.addEventListener('pointerdown', unlockSpeech, { capture: true, once: true });
  window.addEventListener('touchend', unlockSpeech, { capture: true, once: true });
}

// Prévenir l'écran quand la voix ne démarre pas (mode silencieux, pas de voix arabe…).
export const VOICE_FAIL_EVENT = 'harf-voice-fail';

function utter(text: string, lang: 'ar' | 'fr', rate: number): Promise<void> {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      (window as Window).dispatchEvent(new Event(VOICE_FAIL_EVENT));
      return resolve();
    }
    const synth = window.speechSynthesis;
    const u = new SpeechSynthesisUtterance(text);
    if (lang === 'ar') {
      u.lang = arabicVoice?.lang ?? 'ar-SA';
      if (arabicVoice) u.voice = arabicVoice;
    } else {
      u.lang = frenchVoice?.lang ?? 'fr-FR';
      if (frenchVoice) u.voice = frenchVoice;
    }
    u.rate = rate;
    u.volume = 1;
    let done = false;
    let started = false;
    const finish = () => {
      if (!done) {
        done = true;
        resolve();
      }
    };
    u.onstart = () => {
      started = true;
    };
    u.onend = finish;
    u.onerror = (e) => {
      if (e.error !== 'interrupted' && e.error !== 'canceled') window.dispatchEvent(new Event(VOICE_FAIL_EVENT));
      finish();
    };
    // Sécurité : certaines tablettes n'envoient jamais « fin ».
    setTimeout(finish, 2500 + text.length * 250);
    setTimeout(() => {
      if (!started && !done) window.dispatchEvent(new Event(VOICE_FAIL_EVENT));
    }, 2500);
    // Sur iPad, « cancel » juste avant « speak » peut avaler la nouvelle phrase.
    if (synth.speaking || synth.pending) {
      synth.cancel();
      setTimeout(() => synth.speak(u), 120);
    } else {
      synth.speak(u);
    }
    // Sur iPad, la voix peut rester en pause après une coupure.
    if (synth.paused) synth.resume();
  });
}

export let lastSoundError: string | null = null;

// Pour l'espace parent : joue un son et dit si ça a marché.
export async function testSound(): Promise<string> {
  const text = 'مَرْحَبًا، أَنَا لَاعِبٌ فِي فَرِيقِ حَرْف';
  const file = fileFor(text);
  if (!file) return 'Pas de fichier son (appli ouverte hors ligne).';
  const ok = await playFile(file);
  return ok ? 'Le son a été joué. Si tu n\'entends rien, monte le volume.' : `Erreur : le son ne se lance pas (${player?.error?.code ?? 'lecture refusée'}).`;
}

export function sayArabic(text: string, slow = false): Promise<void> {
  pickVoices();
  const file = fileFor(text);
  if (!file) return utter(text, 'ar', slow ? 0.6 : 0.8);
  return playFile(file, slow ? 0.75 : 1).then((ok) => {
    if (!ok) {
      lastSoundError = `${file} : ${player?.error?.code ?? 'lecture refusée'}`;
      return utter(text, 'ar', slow ? 0.6 : 0.8);
    }
  });
}

export function sayFrench(text: string): Promise<void> {
  pickVoices();
  return utter(text, 'fr', 1);
}

export function stopSpeaking() {
  playToken++;
  player?.pause();
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
