import { useEffect, useMemo, useState } from 'react';
import { ALL_WORDS, type Word } from '../data/content';
import { letters, pick, shuffle } from '../lib/arabic';
import { beep, sayArabic } from '../lib/speech';
import { Ar, Icon, Picture } from '../components/ui';
import type { ActivityProps } from './types';

type QType = 'listen' | 'imageToWord' | 'wordToImage' | 'frToWord' | 'order' | 'singular';

interface Q {
  type: QType;
  word: Word;
  options: Word[];
}

function makeQuestions(ids: string[], count: number): Q[] {
  const pool = ids.map((id) => ALL_WORDS[id]);
  const hasSing = pool.filter((w) => w.sing).length >= 3;
  const types: QType[] = ['listen', 'imageToWord', 'wordToImage', 'listen', 'frToWord', 'order'];
  if (hasSing) types.push('singular');
  const targets = shuffle(pool);
  const qs: Q[] = [];
  for (let k = 0; k < count; k++) {
    const word = targets[k % targets.length];
    let type = types[k % types.length];
    if (type === 'singular' && !word.sing) type = 'imageToWord';
    if (type === 'order' && letters(word.ar).length > 6) type = 'listen';
    const others = pick(type === 'singular' ? pool.filter((w) => w.sing) : pool, 2, [word]);
    qs.push({ type, word, options: shuffle([word, ...others]) });
  }
  return shuffle(qs);
}

// Le QCM, en version « tirs au but ».
export function Quiz({ words, count, onDone }: ActivityProps & { words: string[]; count: number }) {
  const questions = useMemo(() => makeQuestions(words, count), [words, count]);
  const [i, setI] = useState(0);
  const [answer, setAnswer] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);
  const [missed, setMissed] = useState<string[]>([]);
  const [built, setBuilt] = useState<number[]>([]);
  const q = questions[i];
  const tiles = useMemo(() => shuffle(letters(q.word.ar).map((l, k) => ({ l, k }))), [q]);

  useEffect(() => {
    setAnswer(null);
    setBuilt([]);
    if (q.type === 'listen') {
      const t = setTimeout(() => sayArabic(q.word.ar), 300);
      return () => clearTimeout(t);
    }
  }, [q]);

  function choose(id: string) {
    if (answer) return;
    setAnswer(id);
    const ok = id === q.word.id;
    beep(ok ? 'good' : 'bad');
    if (ok) setCorrect((c) => c + 1);
    else if (!missed.includes(q.word.id)) setMissed((m) => [...m, q.word.id]);
    sayArabic(q.type === 'singular' ? q.word.sing!.ar : q.word.ar);
  }

  function tapTile(k: number) {
    if (answer || built.includes(k)) return;
    const b = [...built, k];
    setBuilt(b);
    if (b.length === tiles.length) {
      const word = b.map((x) => tiles[x].l).join('');
      choose(word === letters(q.word.ar).join('') ? q.word.id : '__wrong__');
    }
  }

  function next() {
    if (i + 1 < questions.length) setI(i + 1);
    else onDone({ correct, total: questions.length, missed });
  }

  const ok = answer === q.word.id;

  const prompt = (() => {
    switch (q.type) {
      case 'listen':
        return (
          <>
            <p className="q-text">Écoute le mot, puis tire dans la bonne case.</p>
            <button type="button" className="btn btn-blue btn-big" onClick={() => sayArabic(q.word.ar)}>
              <Icon name="speaker" /> Réécouter
            </button>
          </>
        );
      case 'imageToWord':
        return (
          <>
            <p className="q-text">Quel est le mot pour cette image ?</p>
            <Picture img={q.word.img} label={q.word.fr} size={140} />
          </>
        );
      case 'wordToImage':
        return (
          <>
            <p className="q-text">Quelle image va avec ce mot ?</p>
            <Ar className="word-big">{q.word.ar}</Ar>
          </>
        );
      case 'frToWord':
        return (
          <>
            <p className="q-text">Comment dit-on en arabe :</p>
            <p className="fr-big">« {q.word.fr} » ?</p>
          </>
        );
      case 'singular':
        return (
          <>
            <p className="q-text">
              <Ar className="inline-ar">{q.word.ar}</Ar> = {q.word.fr}. Comment dit-on « {q.word.sing!.fr} » ?
            </p>
            <Picture img={q.word.img} label={q.word.fr} size={110} />
          </>
        );
      case 'order':
        return (
          <>
            <p className="q-text">Remets les lettres dans l'ordre pour écrire « {q.word.fr} ».</p>
            <Picture img={q.word.img} label={q.word.fr} size={100} />
            <div className="built" dir="rtl" aria-live="polite">
              <Ar className="word-mid">{built.map((x) => tiles[x].l).join('') || ' '}</Ar>
            </div>
          </>
        );
    }
  })();

  return (
    <div className="activity quiz">
      <div className="quiz-head">
        <span className="activity-title">Tir {i + 1} sur {questions.length}</span>
        <span className="score-pill">
          Buts : {correct}
        </span>
      </div>
      <div className="quiz-prompt card">{prompt}</div>

      {q.type === 'order' ? (
        <div className="tiles" dir="rtl">
          {tiles.map((t, k) => (
            <button key={k} type="button" className="tile" disabled={built.includes(k) || !!answer} onClick={() => tapTile(k)}>
              <Ar>{t.l}</Ar>
            </button>
          ))}
          {!answer && built.length > 0 && (
            <button type="button" className="btn btn-ghost" onClick={() => setBuilt([])} dir="ltr">
              <Icon name="redo" /> Effacer
            </button>
          )}
        </div>
      ) : (
        <div className="goal" role="group" aria-label="Choisis ta réponse">
          {q.options.map((o) => {
            const state = answer ? (o.id === q.word.id ? 'right' : o.id === answer ? 'wrong' : 'dim') : '';
            return (
              <button key={o.id} type="button" className={`goal-cell ${state}`} onClick={() => choose(o.id)} disabled={!!answer}>
                {q.type === 'wordToImage' ? (
                  <Picture img={o.img} label={o.fr} size={96} />
                ) : (
                  <Ar className="word-mid">{q.type === 'singular' ? o.sing!.ar : o.ar}</Ar>
                )}
              </button>
            );
          })}
        </div>
      )}

      <div className="feedback-bar" aria-live="polite">
        {answer && (
          <>
            <span className={ok ? 'good' : 'bad'}>
              {ok ? 'BUT ! Bien joué !' : (
                <>
                  Raté. La bonne réponse : <Ar className="inline-ar">{q.type === 'singular' ? q.word.sing!.ar : q.word.ar}</Ar>
                </>
              )}
            </span>
            <button type="button" className="btn btn-navy" onClick={next}>
              Suivant
            </button>
          </>
        )}
      </div>
    </div>
  );
}
