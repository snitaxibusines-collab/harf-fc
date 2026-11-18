import type { Place, Prep } from '../data/content';
import { PLACES } from '../data/content';
import { Picture } from './ui';

// Les objets du jeu « dans / sur » : le frigo, la boîte, le panier, la table.
// Chaque objet a une zone « dedans » et/ou une zone « dessus » où l'on peut poser un aliment.

export interface SceneItem {
  img: string;
  label: string;
}

interface ObjProps {
  place: Place;
  item?: SceneItem | null;
  where?: Prep | null;
  onZone?: (prep: Prep) => void;
  highlight?: Prep | null;
}

function Zone({ prep, place, onZone, item, where, highlight }: ObjProps & { prep: Prep }) {
  const has = item && where === prep;
  const label = `${prep === 'in' ? 'Dans' : 'Sur'} ${PLACES[place].fr}`;
  const cls = `zone zone-${prep} ${onZone ? 'tappable' : ''} ${highlight === prep ? 'hl' : ''}`;
  const content = has ? <Picture img={item!.img} label={item!.label} size={64} /> : null;
  if (onZone) {
    return (
      <button type="button" className={cls} aria-label={label} onClick={() => onZone(prep)}>
        {content}
      </button>
    );
  }
  return <div className={cls}>{content}</div>;
}

export function SceneObject(props: ObjProps) {
  const { place } = props;
  const info = PLACES[place];
  return (
    <figure className={`obj obj-${place}`}>
      {info.canOn && <Zone {...props} prep="on" />}
      <div className="obj-body" aria-hidden={!info.canIn}>
        {place === 'fridge' && <div className="fridge-door" aria-hidden="true" />}
        {place === 'table' && <div className="table-legs" aria-hidden="true" />}
        {info.canIn && <Zone {...props} prep="in" />}
      </div>
      <figcaption>{info.fr}</figcaption>
    </figure>
  );
}
