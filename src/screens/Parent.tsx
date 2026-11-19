import { useMemo, useState } from 'react';
import { ALL_WORDS, WORLDS } from '../data/content';
import { arabicVoiceName, testSound } from '../lib/speech';
import { pendingReviewWords, resetProgress, setPlayerName, setUnlockAll, useProgress } from '../lib/progress';
import { Ar, Balls, TopBar } from '../components/ui';
import { TeacherVoices } from './TeacherVoices';

// L'espace parent : progrès, réglages. Protégé par une petite multiplication.
export function Parent({ onBack }: { onBack: () => void }) {
  const p = useProgress();
  const [a, b] = useMemo(() => [6 + Math.floor(Math.random() * 4), 6 + Math.floor(Math.random() * 4)], []);
  const [answer, setAnswer] = useState('');
  const [open, setOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [soundMsg, setSoundMsg] = useState<string | null>(null);
  const [showRec, setShowRec] = useState(false);
  const voice = arabicVoiceName();
  const review = pendingReviewWords();

  if (!open) {
    return (
      <div className="screen parent">
        <TopBar onBack={onBack} backLabel="Retour à l'accueil" title="Espace parent" />
        <main className="parent-gate card">
          <label htmlFor="gate">
            Pour entrer, combien font {a} × {b} ?
          </label>
          <input id="gate" inputMode="numeric" value={answer} onChange={(e) => setAnswer(e.target.value.replace(/\D/g, ''))} />
          <button type="button" className="btn btn-navy" onClick={() => setOpen(Number(answer) === a * b)}>
            Entrer
          </button>
          {answer !== '' && Number(answer) !== a * b && answer.length >= 2 && <p className="muted">Ce n'est pas la bonne réponse.</p>}
        </main>
      </div>
    );
  }

  return (
    <div className="screen parent">
      <TopBar onBack={onBack} backLabel="Retour à l'accueil" title="Espace parent" />
      <main className="parent-grid">
        <section className="card">
          <h2>Progrès</h2>
          {WORLDS.map((w) => (
            <div key={w.id} className="parent-world">
              <h3>{w.title}</h3>
              <ul>
                {w.matches.map((m) => (
                  <li key={m.id}>
                    <span>
                      {m.stage} · {m.title}
                    </span>
                    <Balls n={p.stars[m.id] ?? 0} size={22} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <p className="muted">Blocs gagnés pour le stade : {p.blocks}</p>
        </section>
        <section className="card">
          <h2>Mots à revoir ({review.length})</h2>
          {review.length ? (
            <div className="missed">
              {review.map((id) => (
                <Ar key={id} className="word-sm">{ALL_WORDS[id].ar}</Ar>
              ))}
            </div>
          ) : (
            <p className="muted">Aucun pour l'instant.</p>
          )}

          <h2>Réglages</h2>
          <label htmlFor="name">Prénom affiché sur l'accueil</label>
          <input id="name" value={p.playerName} onChange={(e) => setPlayerName(e.target.value)} placeholder="Prénom" />

          <label className="check">
            <input type="checkbox" checked={p.unlockAll} onChange={(e) => setUnlockAll(e.target.checked)} />
            Ouvrir tous les matchs (il avance vite)
          </label>

          <h2>Son</h2>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              setSoundMsg('…');
              testSound().then(setSoundMsg);
            }}
          >
            Tester le son
          </button>
          {soundMsg && <p className="muted">{soundMsg}</p>}
          <button type="button" className="btn btn-gold" onClick={() => setShowRec((v) => !v)}>
            {showRec ? 'Fermer la liste des mots' : 'Écouter et vérifier les mots (et ma voix)'}
          </button>
          <p className="muted">
            Version de l'appli : {__BUILD__}. Voix de secours de l'iPad : {voice ?? 'aucune'}.
          </p>

          <h2>Recommencer</h2>
          {confirmReset ? (
            <div className="row">
              <button
                type="button"
                className="btn btn-red"
                onClick={() => {
                  resetProgress();
                  setConfirmReset(false);
                }}
              >
                Oui, tout effacer
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setConfirmReset(false)}>
                Annuler
              </button>
            </div>
          ) : (
            <button type="button" className="btn btn-ghost" onClick={() => setConfirmReset(true)}>
              Effacer tous les progrès
            </button>
          )}
        </section>
      </main>
      {showRec && <TeacherVoices />}
    </div>
  );
}
