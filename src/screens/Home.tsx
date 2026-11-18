import { WORLDS, type Match } from '../data/content';
import { dueReviewWords, getProgress, isUnlocked, stadiumState, totalStars, useProgress } from '../lib/progress';
import { Ar, Ball, Icon } from '../components/ui';
import { Stadium } from './Stadium';

export function nextMatch(): Match {
  const all = WORLDS.flatMap((w) => w.matches);
  return all.find((m) => isUnlocked(m.id) && !(totalStarsOf(m.id) > 0)) ?? all.find((m) => isUnlocked(m.id) && totalStarsOf(m.id) < 3) ?? all[0];
}
function totalStarsOf(id: string): number {
  return getProgress().stars[id] ?? 0;
}

export function Home({ onPlay, onChampionship, onReview, onParent }: { onPlay: (m: Match) => void; onChampionship: () => void; onReview: () => void; onParent: () => void }) {
  const p = useProgress();
  const next = nextMatch();
  const world = WORLDS.find((w) => w.matches.includes(next))!;
  const due = dueReviewWords();
  const parts = stadiumState(p.blocks);
  const building = parts.find((x) => !x.done);
  return (
    <div className="screen home">
      <div className="home-deco" aria-hidden="true">
        <span className="band" />
        <svg className="eiffel" viewBox="0 0 60 104" aria-hidden="true">
          <path d="M30 0 L32 18 L36 40 L44 70 L58 104 L44 104 Q30 84 16 104 L2 104 L16 70 L24 40 L28 18 Z M22 62 H38 M25 44 H35" fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="2" />
        </svg>
      </div>
      <header className="home-top">
        <div className="brand">
          <div className="crest" lang="ar">ح</div>
          <div>
            <div className="brand-name">Harf FC</div>
            <div className="brand-sub">Le club parisien des mots arabes</div>
          </div>
        </div>
        <div className="row">
          <span className="chip-stat">
            <Ball size={26} /> {totalStars()} ballons d'or
          </span>
          <span className="chip-stat">
            <span className="blk seat" aria-hidden="true" /> {p.blocks} blocs
          </span>
        </div>
      </header>

      <main className="home-main">
        <section className="home-hero">
          <p className="hello">Salut{p.playerName ? ` ${p.playerName}` : ''}, champion !</p>
          <h1>
            Prochain match :<br />
            {world.title.toLowerCase()}, {next.stage.toLowerCase()}
          </h1>
          <p className="hero-sub">
            {next.title} <Ar className="inline-ar">{world.ruleLabel}</Ar>
          </p>
          <div className="row">
            <button type="button" className="btn btn-gold btn-huge" onClick={() => onPlay(next)}>
              <Icon name="play" /> Jouer
            </button>
            <button type="button" className="btn btn-white btn-big" onClick={onChampionship}>
              Le championnat
            </button>
          </div>
          {due.length > 0 && (
            <button type="button" className="btn btn-red btn-big review-btn" onClick={onReview}>
              <Icon name="redo" /> Révision : {due.length} mot{due.length > 1 ? 's' : ''} à revoir
            </button>
          )}
        </section>
        <section className="card stadium-card">
          <h2>Mon stade</h2>
          <Stadium blocks={p.blocks} />
          <p className="muted">{building ? `${building.name} : ${building.have} blocs sur ${building.blocks}` : 'Ton stade est terminé, bravo !'}</p>
        </section>
      </main>

      <footer className="home-foot">
        <span>Séance du jour : 10 à 15 minutes</span>
        <button type="button" className="link-btn" onClick={onParent}>
          <Icon name="settings" size={20} /> Espace parent
        </button>
      </footer>
    </div>
  );
}
