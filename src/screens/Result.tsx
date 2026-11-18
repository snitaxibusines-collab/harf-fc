import type { Match } from '../data/content';
import { ALL_WORDS } from '../data/content';
import { stadiumState, useProgress } from '../lib/progress';
import { Ar, Balls, Picture } from '../components/ui';
import { Stadium } from './Stadium';

export function Result({
  match,
  stars,
  blocks,
  missed,
  correct,
  total,
  reviewMode,
  onHome,
  onNext,
}: {
  match: Match;
  stars: number;
  blocks: number;
  missed: string[];
  correct: number;
  total: number;
  reviewMode: boolean;
  onHome: () => void;
  onNext?: () => void;
}) {
  const p = useProgress();
  const parts = stadiumState(p.blocks);
  const building = parts.find((x) => !x.done);
  const title = stars === 3 ? 'Match gagné, quel champion !' : stars === 2 ? 'Match gagné !' : 'Match terminé, bravo pour tes efforts !';
  return (
    <div className="screen result">
      <p className="result-kicker">{reviewMode ? 'Révision' : `${match.stage} : ${match.title}`}</p>
      <h1 className="result-title">{title}</h1>
      {total > 0 && <p className="result-score">Bonnes réponses : {correct} sur {total}</p>}
      <Balls n={stars} size={96} />
      <div className="result-cards">
        <section className="card">
          <h2>Tu gagnes {blocks} bloc{blocks > 1 ? 's' : ''} pour ton stade</h2>
          <Stadium blocks={p.blocks} compact />
          <p className="muted">{building ? `En construction : ${building.name} (${building.have} sur ${building.blocks})` : 'Ton stade est terminé !'}</p>
        </section>
        <section className="card">
          <h2>{missed.length ? 'À revoir dans 2 jours' : 'Aucun mot à revoir'}</h2>
          {missed.length ? (
            <div className="missed">
              {missed.map((id) => (
                <div key={id} className="missed-word">
                  <Picture img={ALL_WORDS[id].img} label={ALL_WORDS[id].fr} size={44} />
                  <Ar className="word-sm">{ALL_WORDS[id].ar}</Ar>
                </div>
              ))}
            </div>
          ) : (
            <p className="muted">Tous les mots sont bien rentrés. Continue comme ça !</p>
          )}
        </section>
      </div>
      <div className="row center">
        {onNext && !reviewMode && (
          <button type="button" className="btn btn-gold btn-big" onClick={onNext}>
            Match suivant
          </button>
        )}
        <button type="button" className="btn btn-white btn-big" onClick={onHome}>
          Retour au championnat
        </button>
      </div>
    </div>
  );
}
