import { useEffect, useMemo, useRef, useState } from 'react';
import type { World } from '../data/content';
import { shuffle } from '../lib/arabic';
import { beep, sayArabic } from '../lib/speech';
import { playUrl, recorderErrorText, startRecording, type Recording } from '../lib/recorder';
import { Ar, Icon } from '../components/ui';
import type { ActivityProps } from './types';

// Tirs au but sur les sons proches (ex. ظ / ذ) : écoute, choisis la bonne moitié du but, puis dis-le.
export function Sounds({ world, count, onDone }: ActivityProps & { world: World; count: number }) {
  const rounds = useMemo(
    () =>
      shuffle(world.sounds.pairs)
        .concat(shuffle(world.sounds.pairs))
        .slice(0, count)
        .map((pair) => {
          const target = Math.random() < 0.5 ? 0 : 1;
          return { pair: shuffle(pair), word: pair[target] };
        }),
    [world, count],
  );
  const [i, setI] = useState(0);
  const [answer, setAnswer] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);
  const [recording, setRecording] = useState(false);
  const [mine, setMine] = useState<string | null>(null);
  const [micError, setMicError] = useState<string | null>(null);
  const rec = useRef<Recording | null>(null);
  const r = rounds[i];

  useEffect(() => {
    setAnswer(null);
    setMine(null);
    const t = setTimeout(() => sayArabic(r.word, true), 300);
    return () => clearTimeout(t);
  }, [r]);

  function choose(w: string) {
    if (answer) return;
    setAnswer(w);
    const ok = w === r.word;
    beep(ok ? 'good' : 'bad');
    if (ok) setCorrect((c) => c + 1);
  }

  async function toggleRecord() {
    setMicError(null);
    if (recording) {
      setRecording(false);
      const url = await rec.current!.stop();
      setMine(url);
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
    if (i + 1 < rounds.length) setI(i + 1);
    else onDone({ correct, total: rounds.length, missed: [] });
  }

  const [a, b] = world.sounds.letters;
  return (
    <div className="activity sounds pitch">
      <div className="quiz-head">
        <span className="activity-title light">
          Tirs au but : les sons proches <Ar className="inline-ar">{a} / {b}</Ar>
        </span>
        <span className="shots" aria-label={`Tir ${i + 1} sur ${rounds.length}`}>
          {rounds.map((_, k) => (
            <span key={k} className={k < i ? 'shot done' : k === i ? 'shot now' : 'shot'} />
          ))}
        </span>
      </div>
      <div className="row center">
        <button type="button" className="btn btn-white btn-big" onClick={() => sayArabic(r.word, true)}>
          <Icon name="speaker" /> Écoute le mot, puis tire dans la bonne case
        </button>
      </div>
      <div className="big-goal" role="group" aria-label="Le but">
        {r.pair.map((w) => {
          const state = answer ? (w === r.word ? 'right' : w === answer ? 'wrong' : 'dim') : '';
          return (
            <button key={w} type="button" className={`goal-half ${state}`} disabled={!!answer} onClick={() => choose(w)}>
              <Ar>{w}</Ar>
            </button>
          );
        })}
      </div>
      <div className="sounds-foot">
        <p className="tip">Astuce : {world.sounds.tip}</p>
        {answer && (
          <div className="row">
            <button type="button" className={`btn btn-gold ${recording ? 'pulse' : ''}`} onClick={toggleRecord}>
              <Icon name={recording ? 'stop' : 'mic'} /> {recording ? "J'ai fini" : 'Je le dis'}
            </button>
            <button type="button" className="btn btn-white" disabled={!mine} onClick={() => mine && playUrl(mine)}>
              Ma voix
            </button>
            <button type="button" className="btn btn-navy" onClick={next} disabled={recording}>
              {i + 1 < rounds.length ? 'Tir suivant' : 'Fin de la séance'}
            </button>
          </div>
        )}
      </div>
      <p className="feedback-line" aria-live="polite">
        {answer && (answer === r.word ? 'BUT ! Tu as bien entendu.' : <>Arrêté par le gardien ! C'était <Ar className="inline-ar">{r.word}</Ar>.</>)}
        {micError && <span className="warn"> {micError}</span>}
      </p>
    </div>
  );
}
