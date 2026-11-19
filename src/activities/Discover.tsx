import { useEffect, useRef, useState } from 'react';
import { ALL_WORDS } from '../data/content';
import { stripHarakat } from '../lib/arabic';
import { sayArabic } from '../lib/speech';
import { playUrl, recorderErrorText, startRecording, type Recording } from '../lib/recorder';
import { Ar, Icon, Picture } from '../components/ui';
import type { ActivityProps } from './types';

// « Je découvre et je répète » : image, mot, traduction, écoute, micro, comparaison.
export function Discover({ words, onDone }: ActivityProps & { words: string[] }) {
  const [i, setI] = useState(0);
  const [vowels, setVowels] = useState(true);
  const [tries, setTries] = useState(0);
  const [mine, setMine] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const rec = useRef<Recording | null>(null);
  const w = ALL_WORDS[words[i]];

  useEffect(() => {
    setTries(0);
    setMine(null);
    const t = setTimeout(() => sayArabic(w.ar), 350);
    return () => clearTimeout(t);
  }, [w.ar]);

  async function toggleRecord() {
    setMicError(null);
    if (recording) {
      setRecording(false);
      const url = await rec.current!.stop();
      rec.current = null;
      setMine(url);
      setTries((t) => t + 1);
      return;
    }
    try {
      rec.current = await startRecording();
      setRecording(true);
    } catch (e) {
      setMicError(recorderErrorText(e));
    }
  }

  function next() {
    if (recording) return;
    if (i + 1 < words.length) setI(i + 1);
    else onDone({ correct: 0, total: 0, missed: [] });
  }

  return (
    <div className="activity discover">
      <p className="activity-title">Je découvre : mot {i + 1} sur {words.length}</p>
      <div className="discover-grid">
        <section className="card word-card">
          <Picture img={w.img} label={w.fr} size={170} />
          <Ar className={w.long ? 'word-long' : 'word-big'}>{vowels ? w.ar : stripHarakat(w.ar)}</Ar>
          <p className={w.long ? 'fr-mid' : 'fr-big'}>{w.fr}</p>
          {w.note && <p className="note">{w.note}</p>}
          {w.sing && (
            <p className="sing">
              {/^(un|une|des|du|de|le|la|l')\b/i.test(w.fr) ? 'Un seul' : 'Au féminin'} : <Ar className="sing-ar">{w.sing.ar}</Ar> ({w.sing.fr})
            </p>
          )}
          <div className="seg" role="group" aria-label="Voyelles">
            <button type="button" className={vowels ? 'on' : ''} aria-pressed={vowels} onClick={() => setVowels(true)}>Avec voyelles</button>
            <button type="button" className={!vowels ? 'on' : ''} aria-pressed={!vowels} onClick={() => setVowels(false)}>Sans voyelles</button>
          </div>
        </section>

        <div className="steps">
          <section className="card step">
            <h3>1. J'écoute</h3>
            <div className="row">
              <button type="button" className="btn btn-blue btn-grow" onClick={() => sayArabic(w.ar)}>
                <Icon name="speaker" /> Écouter
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => sayArabic(w.ar, true)} aria-label="Écouter lentement">
                <Icon name="turtle" /> Lent
              </button>
            </div>
          </section>
          <section className="card step">
            <h3>2. Je répète 3 fois</h3>
            <button type="button" className={`btn btn-gold btn-grow ${recording ? 'pulse' : ''}`} onClick={toggleRecord}>
              <Icon name={recording ? 'stop' : 'mic'} /> {recording ? "J'ai fini" : 'Appuie et parle'}
            </button>
            <div className="tries" aria-label={`${Math.min(tries, 3)} essais sur 3`}>
              {[1, 2, 3].map((n) => (
                <span key={n} className={tries >= n ? 'done' : ''}>
                  {n} {tries >= n && <Icon name="check" size={18} />}
                </span>
              ))}
            </div>
            {micError && <p className="hint warn">{micError}</p>}
          </section>
          <section className="card step">
            <h3>3. Je compare</h3>
            <div className="row">
              <button type="button" className="btn btn-ghost btn-grow" onClick={() => sayArabic(w.ar)}>
                Le modèle
              </button>
              <button type="button" className="btn btn-ghost btn-grow" disabled={!mine} onClick={() => mine && playUrl(mine)}>
                Ma voix
              </button>
            </div>
          </section>
          <button type="button" className="btn btn-navy btn-big" onClick={next} disabled={recording}>
            {i + 1 < words.length ? 'Mot suivant' : "J'ai fini !"}
          </button>
        </div>
      </div>
    </div>
  );
}
