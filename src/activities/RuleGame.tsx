import { useEffect, useMemo, useState } from 'react';
import { PLACES, PREP, WORLDS, type Place, type Prep, type Word } from '../data/content';
import { pick, shuffle } from '../lib/arabic';
import { beep, sayArabic } from '../lib/speech';
import { Ar, Icon, Picture } from '../components/ui';
import { SceneObject } from '../components/Scene';
import type { ActivityProps } from './types';

type Kind = 'complete' | 'hal' | 'place' | 'ayna';

interface Spot {
  place: Place;
  prep: Prep;
}

interface Q {
  kind: Kind;
  word: Word;
  spot: Spot; // où est (ou doit aller) l'aliment
  objects: Place[];
  // pour « hal » : la position demandée (vraie ou fausse)
  asked?: Spot;
  // pour « ayna » : les réponses proposées
  answers?: Spot[];
}

const SPOTS: Spot[] = (Object.keys(PLACES) as Place[]).flatMap((p) => [
  ...(PLACES[p].canIn ? [{ place: p, prep: 'in' as Prep }] : []),
  ...(PLACES[p].canOn ? [{ place: p, prep: 'on' as Prep }] : []),
]);

const sentence = (w: Word, s: Spot) => `${w.def} ${PREP[s.prep].ar} ${PLACES[s.place].ar}`;
function frSentence(w: Word, s: Spot): string {
  // « Le lait est dans le frigo. » ; pour les fruits, on parle d'un seul fruit.
  const src = w.sing?.fr ?? w.fr;
  const base = src.replace(/^(une|un|du|de la|de l'|des) /, '').replace(/^de l'/, '');
  const fem = /^(une|de la) /.test(src);
  const plural = /^des /.test(src);
  const art = plural ? 'Les ' : /^[aeiouyhéè]/i.test(base) ? "L'" : fem ? 'La ' : 'Le ';
  return `${art}${base} ${plural ? 'sont' : 'est'} ${PREP[s.prep].fr} ${PLACES[s.place].fr}.`;
}
const sameSpot = (a: Spot, b: Spot) => a.place === b.place && a.prep === b.prep;

function makeQuestions(rule: 'fiAla' | 'ayna', count: number): Q[] {
  const world = WORLDS.find((w) => w.id === (rule === 'fiAla' ? 'food' : 'fruits'))!;
  const words = shuffle(world.words);
  const kinds: Kind[] = rule === 'fiAla' ? ['complete', 'place', 'hal', 'complete', 'place', 'hal'] : ['ayna', 'place', 'ayna', 'complete'];
  return Array.from({ length: count }, (_, k) => {
    const word = words[k % words.length];
    const kind = kinds[k % kinds.length];
    const spot = pick(SPOTS, 1)[0];
    let objects: Place[] = [spot.place];
    if (kind === 'place' || kind === 'ayna') {
      objects = shuffle([spot.place, ...pick(Object.keys(PLACES) as Place[], kind === 'ayna' ? 2 : 1, [spot.place])]);
    }
    const q: Q = { kind, word, spot, objects };
    if (kind === 'hal') {
      const truth = Math.random() < 0.5;
      const other = PLACES[spot.place].canIn && PLACES[spot.place].canOn ? { place: spot.place, prep: (spot.prep === 'in' ? 'on' : 'in') as Prep } : pick(SPOTS, 1, SPOTS.filter((s) => sameSpot(s, spot)))[0];
      q.asked = truth ? spot : other;
    }
    if (kind === 'ayna') {
      const wrong = pick(SPOTS.filter((s) => !sameSpot(s, spot)), 2);
      q.answers = shuffle([spot, ...wrong]);
    }
    return q;
  });
}

// Jeu de règle : فِي / عَلَى (nourriture) et أَيْنَ ؟ (fruits).
export function RuleGame({ rule, count, onDone }: ActivityProps & { rule: 'fiAla' | 'ayna'; count: number }) {
  const questions = useMemo(() => makeQuestions(rule, count), [rule, count]);
  const [i, setI] = useState(0);
  const [answered, setAnswered] = useState<null | boolean>(null);
  const [correct, setCorrect] = useState(0);
  const [missed, setMissed] = useState<string[]>([]);
  const q = questions[i];

  const prompt = (() => {
    switch (q.kind) {
      case 'complete':
        return `${q.word.def} … ${PLACES[q.spot.place].ar}`;
      case 'hal':
        return `هَلِ ${q.word.def} ${PREP[q.asked!.prep].ar} ${PLACES[q.asked!.place].ar}\u00a0؟`;
      case 'place':
        return `ضَعِ ${q.word.defAcc} ${PREP[q.spot.prep].ar} ${PLACES[q.spot.place].ar}`;
      case 'ayna':
        return `أَيْنَ ${q.word.def}\u00a0؟`;
    }
  })();

  useEffect(() => {
    setAnswered(null);
    const t = setTimeout(() => sayArabic(prompt.replace('…', '')), 300);
    return () => clearTimeout(t);
  }, [i]); // eslint-disable-line react-hooks/exhaustive-deps

  function result(ok: boolean) {
    setAnswered(ok);
    beep(ok ? 'good' : 'bad');
    if (ok) setCorrect((c) => c + 1);
    else if (!missed.includes(q.word.id)) setMissed((m) => [...m, q.word.id]);
    setTimeout(() => sayArabic(sentence(q.word, q.spot)), 400);
  }

  function next() {
    if (i + 1 < questions.length) setI(i + 1);
    else onDone({ correct, total: questions.length, missed });
  }

  const item = { img: q.word.img, label: q.word.fr };
  const itemSpot: Spot | null = q.kind === 'place' && answered === null ? null : q.spot;
  const help: Record<Kind, string> = {
    complete: 'Regarde où est l’aliment, puis choisis « dans » ou « sur ».',
    hal: 'Regarde bien l’image, puis réponds par oui ou par non.',
    place: 'Écoute la phrase, puis touche le bon endroit pour poser l’aliment.',
    ayna: 'Où est le fruit ? Choisis la bonne phrase.',
  };

  return (
    <div className="activity rule">
      <div className="quiz-head">
        <span className="activity-title">
          {rule === 'fiAla' ? 'Dans ou sur ?' : 'Où est le fruit ?'} · question {i + 1} sur {questions.length}
        </span>
        <span className="score-pill">Buts : {correct}</span>
      </div>
      <div className="rule-grid">
        <div className="card scene">
          {q.objects.map((p) => (
            <SceneObject
              key={p}
              place={p}
              item={itemSpot && itemSpot.place === p ? item : null}
              where={itemSpot && itemSpot.place === p ? itemSpot.prep : null}
              highlight={answered === false && q.kind === 'place' && q.spot.place === p ? q.spot.prep : null}
              onZone={
                q.kind === 'place' && answered === null
                  ? (prep) => {
                      const s = { place: p, prep };
                      result(sameSpot(s, q.spot));
                    }
                  : undefined
              }
            />
          ))}
          {q.kind === 'place' && (
            <div className="to-place" aria-label="Aliment à poser">
              {answered === null && <span className="hint">À poser :</span>}
              {answered === null && <Picture img={q.word.img} label={q.word.fr} size={80} />}
            </div>
          )}
        </div>
        <div className="card rule-side">
          <p className="hint">{help[q.kind]}</p>
          <div className="rule-sentence">
            <Ar className="word-mid">{prompt}</Ar>
            <button type="button" className="icon-btn" aria-label="Réécouter" onClick={() => sayArabic(prompt.replace('…', ''))}>
              <Icon name="speaker" />
            </button>
          </div>

          {q.kind === 'complete' && (
            <div className="choice-row">
              {(['in', 'on'] as Prep[]).map((p) => (
                <button key={p} type="button" className={`choice ${answered !== null && p === q.spot.prep ? 'right' : ''}`} disabled={answered !== null} onClick={() => result(p === q.spot.prep)}>
                  <Ar className="word-mid">{PREP[p].ar}</Ar>
                  <span>{PREP[p].fr}</span>
                </button>
              ))}
            </div>
          )}
          {q.kind === 'hal' && (
            <div className="choice-row">
              {[true, false].map((yes) => {
                const truth = sameSpot(q.asked!, q.spot);
                return (
                  <button key={String(yes)} type="button" className={`choice ${answered !== null && yes === truth ? 'right' : ''}`} disabled={answered !== null} onClick={() => result(yes === truth)}>
                    <Ar className="word-mid">{yes ? 'نَعَمْ' : 'لَا'}</Ar>
                    <span>{yes ? 'oui' : 'non'}</span>
                  </button>
                );
              })}
            </div>
          )}
          {q.kind === 'ayna' && (
            <div className="choice-col">
              {q.answers!.map((s, k) => (
                <button key={k} type="button" className={`choice wide ${answered !== null && sameSpot(s, q.spot) ? 'right' : ''}`} disabled={answered !== null} onClick={() => result(sameSpot(s, q.spot))}>
                  <Ar className="word-sm">{sentence(q.word, s)}</Ar>
                </button>
              ))}
            </div>
          )}

          <div className="feedback-bar" aria-live="polite">
            {answered !== null && (
              <>
                <span className={answered ? 'good' : 'bad'}>
                  {answered ? 'BUT !' : 'Raté !'} <Ar className="inline-ar">{sentence(q.word, q.spot)}</Ar>
                </span>
                <button type="button" className="btn btn-navy" onClick={next}>
                  Suivant
                </button>
              </>
            )}
          </div>
          {answered !== null && (
            <p className="hint">
              {frSentence(q.word, q.spot)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
