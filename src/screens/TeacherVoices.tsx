import { useState, useSyncExternalStore } from 'react';
import { WORLDS, type Word } from '../data/content';
import { recorderErrorText, startRecording, type Recording } from '../lib/recorder';
import { deleteTeacher, saveTeacher, subscribeTeacher, teacherUrl, teacherVersion } from '../lib/teacher';
import { sayArabic } from '../lib/speech';
import { Ar, Icon } from '../components/ui';

// « Enregistrer les mots » : la prof (ou un parent) dit chaque mot, et sa voix remplace la voix de synthèse.
export function TeacherVoices() {
  useSyncExternalStore(subscribeTeacher, teacherVersion);
  const [rec, setRec] = useState<{ text: string; r: Recording } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function start(text: string) {
    setError(null);
    if (rec) return;
    try {
      const r = await startRecording();
      setRec({ text, r });
    } catch (e) {
      setError(recorderErrorText(e));
    }
  }
  async function stop() {
    if (!rec) return;
    const url = await rec.r.stop();
    const blob = await fetch(url).then((x) => x.blob());
    URL.revokeObjectURL(url);
    setRec(null);
    if (blob.size > 0) {
      await saveTeacher(rec.text, blob);
      void sayArabic(rec.text);
    }
  }

  const items = (w: Word) => [w.ar, ...(w.sing ? [w.sing.ar] : [])];
  const all = WORLDS.flatMap((world) => world.words.flatMap(items));
  const done = all.filter((t) => teacherUrl(t)).length;

  return (
    <section className="card teacher">
      <h2>Voix de la prof</h2>
      <p className="muted">
        Touche « Enregistrer », dis le mot, puis touche « Stop ». L'appli jouera cette voix à la place de la voix de l'ordinateur, sur cet iPad.
        Mots enregistrés : {done} sur {all.length}.
      </p>
      {error && <p className="error">{error}</p>}
      {WORLDS.map((world) => (
        <div key={world.id}>
          <h3>{world.title}</h3>
          <ul className="teacher-list">
            {world.words.flatMap(items).map((text) => {
              const has = !!teacherUrl(text);
              const recording = rec?.text === text;
              return (
                <li key={text} className={has ? 'has' : ''}>
                  <Ar className="teacher-ar">{text}</Ar>
                  <span className="teacher-state">{has ? '✓ voix de la prof' : 'voix ordinateur'}</span>
                  <div className="row">
                    {recording ? (
                      <button type="button" className="btn btn-red" onClick={stop}>
                        <Icon name="stop" /> Stop
                      </button>
                    ) : (
                      <button type="button" className="btn btn-gold" disabled={!!rec} onClick={() => start(text)}>
                        <Icon name="mic" /> Enregistrer
                      </button>
                    )}
                    <button type="button" className="btn btn-ghost" onClick={() => sayArabic(text)} aria-label="Écouter">
                      <Icon name="play" />
                    </button>
                    {has && (
                      <button type="button" className="btn btn-ghost" onClick={() => deleteTeacher(text)}>
                        Effacer
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </section>
  );
}
