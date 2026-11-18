import { useMemo, useState } from 'react';
import { ALL_WORDS } from '../data/content';
import { shuffle } from '../lib/arabic';
import { beep, sayArabic } from '../lib/speech';
import { Ar, Picture } from '../components/ui';
import type { ActivityProps } from './types';

// « Relie le mot à l'image » : touche un mot, puis l'image qui va avec.
export function Pairing({ words, onDone }: ActivityProps & { words: string[] }) {
  const left = useMemo(() => shuffle(words), [words]);
  const right = useMemo(() => shuffle(words), [words]);
  const [word, setWord] = useState<string | null>(null);
  const [done, setDone] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [wrong, setWrong] = useState<string | null>(null);

  function pickImage(id: string) {
    if (!word || done.includes(id)) return;
    if (id === word) {
      beep('good');
      sayArabic(ALL_WORDS[id].ar);
      const d = [...done, id];
      setDone(d);
      setWord(null);
      if (d.length === words.length) {
        setTimeout(() => onDone({ correct: words.length - errors.length, total: words.length, missed: errors }), 700);
      }
    } else {
      beep('bad');
      setWrong(id);
      setTimeout(() => setWrong(null), 500);
      if (!errors.includes(word)) setErrors([...errors, word]);
    }
  }

  return (
    <div className="activity pairing">
      <p className="activity-title">Relie chaque mot à son image : touche un mot, puis la bonne image.</p>
      <div className="pair-grid">
        <div className="pair-col" dir="rtl">
          {left.map((id) => (
            <button
              key={id}
              type="button"
              className={`pair-word ${word === id ? 'selected' : ''} ${done.includes(id) ? 'matched' : ''}`}
              disabled={done.includes(id)}
              aria-pressed={word === id}
              onClick={() => setWord(id)}
            >
              <Ar>{ALL_WORDS[id].ar}</Ar>
            </button>
          ))}
        </div>
        <div className="pair-col pair-images">
          {right.map((id) => (
            <button
              key={id}
              type="button"
              className={`pair-img ${done.includes(id) ? 'matched' : ''} ${wrong === id ? 'shake' : ''}`}
              disabled={done.includes(id)}
              aria-label={done.includes(id) ? ALL_WORDS[id].fr : 'Image'}
              onClick={() => pickImage(id)}
            >
              <Picture img={ALL_WORDS[id].img} label={ALL_WORDS[id].fr} size={72} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
