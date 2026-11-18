import { useState } from 'react';
import { type Activity, type Match, worldOfMatch } from '../data/content';
import { finishMatch, markMissed, markReviewed } from '../lib/progress';
import { beep, stopSpeaking } from '../lib/speech';
import { Discover } from '../activities/Discover';
import { Trace } from '../activities/Trace';
import { Pairing } from '../activities/Pairing';
import { Quiz } from '../activities/Quiz';
import { RuleGame } from '../activities/RuleGame';
import { Sounds } from '../activities/Sounds';
import { Dictation } from '../activities/Dictation';
import type { ActivityResult } from '../activities/types';
import { Progress, TopBar } from '../components/ui';
import { Result } from './Result';

const NAMES: Record<Activity['type'], string> = {
  discover: 'Je découvre',
  pairing: 'Je relie',
  trace: "J'écris",
  quiz: 'Tirs au but',
  rule: 'La règle',
  sounds: 'Sons proches',
  dictation: 'Dictée',
};

export function starsFor(correct: number, total: number): number {
  if (total === 0) return 3;
  const r = correct / total;
  return r >= 0.9 ? 3 : r >= 0.7 ? 2 : 1;
}

// Joue un match : enchaîne ses activités, puis affiche le résultat.
export function MatchRunner({ match, onExit, onNext, reviewWords }: { match: Match; onExit: () => void; onNext?: () => void; reviewWords?: string[] }) {
  const world = worldOfMatch(match.id);
  const [step, setStep] = useState(0);
  const [total, setTotal] = useState<ActivityResult>({ correct: 0, total: 0, missed: [] });
  const [final, setFinal] = useState<{ stars: number; blocks: number; missed: string[]; correct: number; total: number } | null>(null);

  function done(r: ActivityResult) {
    stopSpeaking();
    const t = { correct: total.correct + r.correct, total: total.total + r.total, missed: [...new Set([...total.missed, ...r.missed])] };
    setTotal(t);
    if (step + 1 < match.activities.length) {
      setStep(step + 1);
      return;
    }
    const stars = starsFor(t.correct, t.total);
    markMissed(t.missed);
    if (reviewWords) markReviewed(reviewWords.filter((w) => !t.missed.includes(w)));
    const blocks = reviewWords ? 1 : finishMatch(match.id, stars);
    beep('win');
    setFinal({ stars, blocks, missed: t.missed, correct: t.correct, total: t.total });
  }

  if (final) {
    return <Result match={match} reviewMode={!!reviewWords} {...final} onHome={onExit} onNext={onNext} />;
  }

  const a = match.activities[step];
  const key = `${match.id}-${step}`;
  return (
    <div className="screen match">
      <TopBar
        onBack={() => {
          stopSpeaking();
          onExit();
        }}
        closeIcon
        backLabel="Quitter le match"
        title={
          <span>
            {match.id === 'review' ? match.stage : `${world.title} · ${match.stage}`} <span className="muted">· {match.title}</span>
          </span>
        }
        right={<span className="step-pill">{NAMES[a.type]} · {step + 1}/{match.activities.length}</span>}
      />
      <Progress value={step} max={match.activities.length} />
      <main className="match-body">
        {a.type === 'discover' && <Discover key={key} words={a.words} onDone={done} />}
        {a.type === 'pairing' && <Pairing key={key} words={a.words} onDone={done} />}
        {a.type === 'trace' && <Trace key={key} words={a.words} onDone={done} />}
        {a.type === 'quiz' && <Quiz key={key} words={a.words} count={a.count} onDone={done} />}
        {a.type === 'rule' && <RuleGame key={key} rule={a.rule} count={a.count} onDone={done} />}
        {a.type === 'sounds' && <Sounds key={key} world={world} count={a.count} onDone={done} />}
        {a.type === 'dictation' && <Dictation key={key} words={a.words} onDone={done} />}
      </main>
    </div>
  );
}
