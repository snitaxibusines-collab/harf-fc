// Le micro : enregistrer la voix de l'enfant, puis la réécouter.

export type RecorderError = 'unsupported' | 'denied' | 'other';

let stream: MediaStream | null = null;

async function getStream(): Promise<MediaStream> {
  if (stream && stream.getTracks().some((t) => t.readyState === 'live')) return stream;
  stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  return stream;
}

function pickMime(): string | undefined {
  const options = ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm'];
  return options.find((m) => typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported?.(m));
}

export interface Recording {
  stop: () => Promise<string>; // renvoie l'adresse du son enregistré
}

export async function startRecording(): Promise<Recording> {
  if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
    throw new Error('unsupported');
  }
  let s: MediaStream;
  try {
    s = await getStream();
  } catch (e) {
    const name = (e as DOMException)?.name;
    throw new Error(name === 'NotAllowedError' || name === 'SecurityError' ? 'denied' : 'other');
  }
  const mime = pickMime();
  const rec = new MediaRecorder(s, mime ? { mimeType: mime } : undefined);
  const chunks: Blob[] = [];
  rec.ondataavailable = (ev) => {
    if (ev.data.size > 0) chunks.push(ev.data);
  };
  rec.start();
  const autoStop = setTimeout(() => {
    if (rec.state === 'recording') rec.stop();
  }, 6000);
  return {
    stop: () =>
      new Promise<string>((resolve) => {
        clearTimeout(autoStop);
        const finish = () => resolve(URL.createObjectURL(new Blob(chunks, { type: rec.mimeType || mime || 'audio/mp4' })));
        if (rec.state === 'inactive') return finish();
        rec.onstop = finish;
        rec.stop();
      }),
  };
}

export function playUrl(url: string): Promise<void> {
  return new Promise((resolve) => {
    const a = new Audio(url);
    a.onended = () => resolve();
    a.onerror = () => resolve();
    a.play().catch(() => resolve());
  });
}

export function recorderErrorText(err: unknown): string {
  const m = (err as Error)?.message as RecorderError;
  if (m === 'denied') return "Le micro n'est pas autorisé. Demande à un parent de l'autoriser dans les réglages de l'iPad.";
  if (m === 'unsupported') return "Cet appareil ne permet pas d'enregistrer ici. Tu peux quand même répéter à voix haute !";
  return "Le micro ne répond pas. Réessaie dans un instant.";
}
