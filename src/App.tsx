import { useEffect, useState } from 'react';
import { VOICE_FAIL_EVENT } from './lib/speech';
import { ALL_WORDS, WORLDS, worldOfWord, type Match } from './data/content';
import { dueReviewWords } from './lib/progress';
import { pick } from './lib/arabic';
import { Home } from './screens/Home';
import { Championship } from './screens/Championship';
import { MatchRunner } from './screens/MatchRunner';
import { Parent } from './screens/Parent';

type Screen = { name: 'home' } | { name: 'champ' } | { name: 'parent' } | { name: 'match'; match: Match; review?: string[] };

function reviewMatch(words: string[]): Match {
  // Il faut au moins 3 mots pour proposer des choix : on complète avec des mots du même monde.
  const world = worldOfWord(words[0]);
  const pool = words.length >= 3 ? words : [...words, ...pick(world.words.map((w) => w.id), 3 - words.length, words)];
  return {
    id: 'review',
    stage: 'Révision',
    title: 'Les mots à revoir',
    activities: [
      { type: 'discover', words: words.filter((w) => ALL_WORDS[w]).slice(0, 6) },
      { type: 'quiz', words: pool, count: Math.max(4, Math.min(8, words.length * 2)) },
    ],
  };
}

function nextOf(match: Match): Match | undefined {
  for (const w of WORLDS) {
    const i = w.matches.findIndex((m) => m.id === match.id);
    if (i >= 0) return w.matches[i + 1];
  }
  return undefined;
}

// Bandeau d'aide quand la voix de l'iPad ne parle pas.
function VoiceHelp() {
  const [show, setShow] = useState(false);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const on = () => setShow(true);
    window.addEventListener(VOICE_FAIL_EVENT, on);
    return () => window.removeEventListener(VOICE_FAIL_EVENT, on);
  }, []);
  if (!show || seen) return null;
  return (
    <div className="voice-help" role="alert">
      <strong>La voix ne parle pas ?</strong>
      <ul>
        <li>Enlève le mode silencieux de l'iPad (la cloche barrée dans le Centre de contrôle) et monte le volume.</li>
        <li>Réglages, Accessibilité, Contenu énoncé, Voix, Arabe : télécharge une voix.</li>
      </ul>
      <button type="button" className="btn btn-navy" onClick={() => setSeen(true)}>
        D'accord
      </button>
    </div>
  );
}

export default function App() {
  return (
    <>
      <Screens />
      <VoiceHelp />
    </>
  );
}

function Screens() {
  const [screen, setScreen] = useState<Screen>({ name: 'home' });

  switch (screen.name) {
    case 'home':
      return (
        <Home
          onPlay={(match) => setScreen({ name: 'match', match })}
          onChampionship={() => setScreen({ name: 'champ' })}
          onReview={() => {
            const due = dueReviewWords();
            if (due.length) setScreen({ name: 'match', match: reviewMatch(due), review: due });
          }}
          onParent={() => setScreen({ name: 'parent' })}
        />
      );
    case 'champ':
      return <Championship onBack={() => setScreen({ name: 'home' })} onPlay={(match) => setScreen({ name: 'match', match })} />;
    case 'parent':
      return <Parent onBack={() => setScreen({ name: 'home' })} />;
    case 'match': {
      const next = screen.review ? undefined : nextOf(screen.match);
      return (
        <MatchRunner
          key={screen.match.id + (screen.review ? '-r' : '')}
          match={screen.match}
          reviewWords={screen.review}
          onExit={() => setScreen(screen.review ? { name: 'home' } : { name: 'champ' })}
          onNext={next ? () => setScreen({ name: 'match', match: next }) : undefined}
        />
      );
    }
  }
}
