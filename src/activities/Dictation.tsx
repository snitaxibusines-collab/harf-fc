import { useEffect, useMemo, useState } from 'react';
import { ALL_WORDS } from '../data/content';
import { ARABIC_LETTERS, letters, pick, shuffle } from '../lib/arabic';
import { beep, sayArabic } from '../lib/speech';
import { Ar, Icon, Picture } from '../components/ui';
import type { ActivityProps } from './types';

// La dictée : écoute le mot et écris-le avec les lettres proposées.
export function Dictation({ words, onDone }: ActivityProps & { words: string[] }) {
  const [i, setI] = useState(0);
  const [built, setBuilt] = useState<number[]>([]);
  const [answer, setAnswer] = useState<null | boolean>(null);
  const [correct, setCorrect] = useState(0);
  const [missed, setMissed] = useState<string[]>([]);
  const w = ALL_WORDS[words[i]];
  const target = useMemo(() => letters(w.ar), [w]);
  const tiles = useMemo(() => shuffle([...target, ...pick(ARABIC_LETTERS, 3, target)]), [target]);

  useEffect(() => {
    setBuilt([]);
    setAnswer(null);
    const t = setTimeout(() => sayArabic(w.ar, true), 300);
    return () => clearTimeout(t);
  }, [w]);

  function tap(k: number) {
    if (answer !== null || built.includes(k) || built.length >= target.length) return;
    setBuilt([...built, k]);
  }

  function check() {
    const ok = built.map((k) => tiles[k]).join('') === target.join('');
    setAnswer(ok);
    beep(ok ? 'good' : 'bad');
    if (ok) setCorrect((c) => c + 1);
    else setMissed((m) => [...m, w.id]);
  }

  function next() {
    if (i + 1 < words.length) setI(i + 1);
    else onDone({ correct, total: words.length, missed });
  }

  return (
    <div className="activity dictation">
      <p className="activity-title">Dictée : mot {i + 1} sur {words.length}</p>
      <div className="card dict-card">
        <div className="row center">
          <button type="button" className="btn btn-blue btn-big" onClick={() => sayArabic(w.ar, true)}>
            <Icon name="speaker" /> Écouter le mot
          </button>
        </div>
        <div className="built big" dir="rtl" aria-live="polite">
          <Ar className="word-big">{built.map((k) => tiles[k]).join('') || ' '}</Ar>
        </div>
        <div className="tiles" dir="rtl">
          {tiles.map((t, k) => (
            <button key={k} type="button" className="tile" disabled={built.includes(k) || answer !== null} onClick={() => tap(k)}>
              <Ar>{t}</Ar>
            </button>
          ))}
        </div>
        <div className="row center">
          {answer === null && (
            <>
              <button type="button" className="btn btn-ghost" onClick={() => setBuilt(built.slice(0, -1))} disabled={!built.length}>
                Effacer une lettre
              </button>
              <button type="button" className="btn btn-navy" onClick={check} disabled={built.length !== target.length}>
                Valider
              </button>
            </>
          )}
        </div>
        <div className="feedback-bar" aria-live="polite">
          {answer !== null && (
            <>
              <span className={answer ? 'good' : 'bad'}>
                {answer ? 'Bravo, sans faute !' : <>Presque ! Le mot était <Ar className="inline-ar">{w.ar}</Ar></>}
              </span>
              <Picture img={w.img} label={w.fr} size={56} />
              <button type="button" className="btn btn-navy" onClick={next}>
                Suivant
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
