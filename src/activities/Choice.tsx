import { useEffect, useMemo, useState } from 'react';
import type { ChoiceGen } from '../data/content';
import { makeChoices, type Visual } from '../data/choices';
import { beep, sayArabic } from '../lib/speech';
import { Ar, Emoji, Icon, Picture } from '../components/ui';
import type { ActivityProps } from './types';

function VisualView({ v }: { v: Visual }) {
  switch (v.kind) {
    case 'img':
      return <Picture img={v.img} label={v.label} size={150} />;
    case 'people':
      return (
        <span className="people" role="img" aria-label={v.label}>
          {[...v.emoji.matchAll(/\p{Extended_Pictographic}(?:\uFE0F|\u200D\p{Extended_Pictographic}|\u200D[\u2640\u2642]\uFE0F?)*/gu)].map((m, k) => (
            <Emoji key={k} e={m[0]} size={140} />
          ))}
        </span>
      );
    case 'stack':
      return (
        <div className="stack-scene" role="img" aria-label={v.label}>
          <span className={`stack-item ${v.above ? 'above' : 'below'}`}><Picture img={v.item} label="" size={96} /></span>
          <span className="stack-ref"><Emoji e={v.ref} size={130} /></span>
        </div>
      );
    case 'depth':
      return (
        <div className="depth-scene" role="img" aria-label={v.label}>
          <span className="depth-ref"><Emoji e={v.ref} size={180} /></span>
          <span className={`depth-item ${v.front ? 'front' : 'back'}`}><Picture img={v.item} label="" size={v.front ? 110 : 80} /></span>
        </div>
      );
  }
}

// Jeu de règle à choix : une image, une phrase à compléter, deux ou trois réponses.
export function Choice({ gen, count, title, onDone }: ActivityProps & { gen: ChoiceGen; count: number; title: string }) {
  const items = useMemo(() => makeChoices(gen, count), [gen, count]);
  const [i, setI] = useState(0);
  const [answer, setAnswer] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);
  const [missed, setMissed] = useState<string[]>([]);
  const q = items[i];
  const first = q.sayFirst ?? q.prompt;

  useEffect(() => {
    setAnswer(null);
    if (first) {
      const t = setTimeout(() => sayArabic(first), 300);
      return () => clearTimeout(t);
    }
  }, [q, first]);

  function choose(id: string) {
    if (answer) return;
    setAnswer(id);
    const ok = id === q.answer;
    beep(ok ? 'good' : 'bad');
    if (ok) setCorrect((c) => c + 1);
    else if (q.wordId && !missed.includes(q.wordId)) setMissed((m) => [...m, q.wordId!]);
    if (q.say) setTimeout(() => sayArabic(q.say!), 350);
  }

  function next() {
    if (i + 1 < items.length) setI(i + 1);
    else onDone({ correct, total: items.length, missed });
  }

  const ok = answer === q.answer;
  return (
    <div className="activity rule-choice">
      <div className="quiz-head">
        <span className="activity-title">
          {title} · question {i + 1} sur {items.length}
        </span>
        <span className="score-pill">Buts : {correct}</span>
      </div>
      <div className="choice-grid">
        {q.visual && (
          <section className="card choice-visual">
            <VisualView v={q.visual} />
          </section>
        )}
        <section className="card choice-panel">
          <p className="q-text">{q.question}</p>
          {q.prompt && (
            <div className="rule-sentence">
              <Ar className="word-mid">{q.prompt}</Ar>
              {first && (
                <button type="button" className="icon-btn" aria-label="Réécouter" onClick={() => sayArabic(first)}>
                  <Icon name="speaker" />
                </button>
              )}
            </div>
          )}
          <div className={`choice-options n${q.options.length}`}>
            {q.options.map((o) => {
              const state = answer ? (o.id === q.answer ? 'right' : o.id === answer ? 'wrong' : 'dim') : '';
              return (
                <button key={o.id} type="button" className={`choice-opt ${state}`} disabled={!!answer} onClick={() => choose(o.id)}>
                  {o.ar && <Ar className="opt-ar">{o.ar}</Ar>}
                  {o.fr && <span className="opt-fr">{o.fr}</span>}
                </button>
              );
            })}
          </div>
          {answer && (
            <div className="choice-feedback" aria-live="polite">
              <p className={ok ? 'good' : 'bad'}>
                {ok ? 'BUT !' : 'Raté !'} {q.say && <Ar className="inline-ar">{q.say}</Ar>}
              </p>
              <p className="explain">{q.explain}</p>
              <button type="button" className="btn btn-navy" onClick={next}>
                Suivant
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
