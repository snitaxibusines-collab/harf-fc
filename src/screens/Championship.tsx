import { WORLDS, type Match } from '../data/content';
import { isUnlocked, MAX_STARS, totalStars, useProgress } from '../lib/progress';
import { Ar, Balls, Icon, TopBar } from '../components/ui';

// La carte des niveaux : chaque monde est un petit championnat (poules, quarts, demi-finale, finale).
export function Championship({ onBack, onPlay }: { onBack: () => void; onPlay: (m: Match) => void }) {
  const p = useProgress();
  return (
    <div className="screen champ">
      <TopBar onBack={onBack} backLabel="Retour à l'accueil" title="Le championnat" right={<span className="score-pill">{totalStars()} / {MAX_STARS} ballons d'or</span>} />
      <main className="worlds">
        {WORLDS.map((w, wi) => {
          const done = w.matches.filter((m) => (p.stars[m.id] ?? 0) > 0).length;
          return (
            <section key={w.id} className={`card world world-${wi}`}>
              <header className="world-head">
                <h2>
                  Monde {wi + 1} : {w.title.toLowerCase()}
                </h2>
                <Ar className="world-rule">{w.ruleLabel}</Ar>
              </header>
              <p className="muted">{w.subtitle}</p>
              <ol className="matches">
                {w.matches.map((m, k) => {
                  const open = isUnlocked(m.id);
                  const stars = p.stars[m.id] ?? 0;
                  return (
                    <li key={m.id}>
                      <button type="button" className={`match-row ${open ? '' : 'locked'} ${stars ? 'played' : ''}`} disabled={!open} onClick={() => onPlay(m)}>
                        <span className="match-num">{open ? k + 1 : <Icon name="lock" size={22} />}</span>
                        <span className="match-name">
                          <strong>{m.stage}</strong> · {m.title}
                        </span>
                        {open ? <Balls n={stars} size={26} /> : <span className="muted small">Gagne le match d'avant</span>}
                      </button>
                    </li>
                  );
                })}
              </ol>
              <p className="world-foot">
                <Icon name="trophy" size={24} /> {done === w.matches.length ? 'Coupe gagnée !' : 'Gagne la finale pour la coupe'}
              </p>
            </section>
          );
        })}
        <section className="card world locked-world">
          <header className="world-head">
            <h2>Monde bonus : le foot</h2>
            <Ar className="world-rule">كُرَةُ الْقَدَمِ</Ar>
          </header>
          <p className="muted">Ballon, but, joueur, équipe, stade… Bientôt disponible !</p>
          <div className="lock-big">
            <Icon name="lock" size={48} />
          </div>
        </section>
      </main>
    </div>
  );
}
