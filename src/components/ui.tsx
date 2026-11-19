import { useState } from 'react';
import type { ReactNode } from 'react';
import { sayArabic } from '../lib/speech';
import { DRAWINGS } from './drawings';

// ---------- Icônes (dessinées en traits simples) ----------
type IconName = 'back' | 'close' | 'speaker' | 'mic' | 'stop' | 'play' | 'lock' | 'trophy' | 'redo' | 'check' | 'turtle' | 'settings';

const PATHS: Record<IconName, ReactNode> = {
  back: <path d="M15 5l-7 7 7 7" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  speaker: (
    <>
      <path d="M4 9v6h4l5 4V5L8 9z" />
      <path d="M16 9a4 4 0 0 1 0 6" />
      <path d="M19 6a8 8 0 0 1 0 12" />
    </>
  ),
  mic: (
    <>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0" />
      <path d="M12 18v3" />
    </>
  ),
  stop: <rect x="6" y="6" width="12" height="12" rx="2" />,
  play: <path d="M7 5l12 7-12 7z" />,
  lock: (
    <>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </>
  ),
  trophy: (
    <>
      <path d="M7 4h10v5a5 5 0 0 1-10 0z" />
      <path d="M7 6H4a3 3 0 0 0 3 4" />
      <path d="M17 6h3a3 3 0 0 1-3 4" />
      <path d="M12 14v4" />
      <path d="M8 21h8" />
    </>
  ),
  redo: (
    <>
      <path d="M4 12a8 8 0 1 0 3-6.2" />
      <path d="M4 4v5h5" />
    </>
  ),
  check: <path d="M5 12l5 5 9-10" />,
  turtle: (
    <>
      <path d="M4 15c0-4 3.5-7 8-7s8 3 8 7z" />
      <path d="M20 13h2M7 15v3M17 15v3" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2" />
    </>
  ),
};

export function Icon({ name, size = 28, color = 'currentColor' }: { name: IconName; size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {PATHS[name]}
    </svg>
  );
}

// ---------- Ballon d'or (étoile du jeu) ----------
export function Ball({ on = true, size = 32 }: { on?: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill={on ? 'var(--gold)' : 'rgba(255,255,255,0.18)'} stroke={on ? 'none' : 'rgba(11,21,48,0.25)'} />
      <path d="M12 5.5l3.6 2.7-1.4 4.3H9.8L8.4 8.2z" fill={on ? 'var(--ink)' : 'rgba(11,21,48,0.25)'} />
      <path d="M9.8 12.5l-2.3 3.4M14.2 12.5l2.3 3.4M8.4 8.2L4.5 7.5M15.6 8.2l3.9-.7" stroke={on ? 'var(--ink)' : 'rgba(11,21,48,0.25)'} strokeWidth="1.2" />
    </svg>
  );
}

export function Balls({ n, size = 32 }: { n: number; size?: number }) {
  return (
    <span className="balls" role="img" aria-label={`${n} ballon${n > 1 ? 's' : ''} d'or sur 3`}>
      {[0, 1, 2].map((i) => (
        <Ball key={i} on={i < n} size={size} />
      ))}
    </span>
  );
}

// ---------- Texte arabe ----------
export function Ar({ children, className = '', size }: { children: ReactNode; className?: string; size?: number }) {
  return (
    <span lang="ar" dir="rtl" className={`ar ${className}`} style={size ? { fontSize: size } : undefined}>
      {children}
    </span>
  );
}

export function Listen({ text, label = 'Écouter', slow = false, big = false }: { text: string; label?: string; slow?: boolean; big?: boolean }) {
  return (
    <button type="button" className={`btn ${big ? 'btn-big' : ''} btn-blue`} onClick={() => sayArabic(text, slow)}>
      <Icon name={slow ? 'turtle' : 'speaker'} /> {label}
    </button>
  );
}

// ---------- Images provisoires ----------
const SVGS: Record<string, ReactNode> = DRAWINGS;

export function Picture({ img, size = 120, label }: { img: string; size?: number; label: string }) {
  if (!img) return null;
  if (img.startsWith('color:')) {
    // Un maillot de la couleur demandée.
    const c = img.slice(6);
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label={label}>
        <path d="M30 14 L42 10 Q50 18 58 10 L70 14 L92 30 L82 46 L72 40 L72 90 L28 90 L28 40 L18 46 L8 30 Z" fill={c} stroke="#0b1530" strokeWidth="3" strokeLinejoin="round" />
      </svg>
    );
  }
  if (img.startsWith('svg:')) {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label={label}>
        {SVGS[img.slice(4)]}
      </svg>
    );
  }
  return <Emoji e={img} size={size} label={label} />;
}

// ---------- Barre du haut ----------
export function TopBar({ onBack, title, right, backLabel = 'Retour', closeIcon = false }: { onBack: () => void; title: ReactNode; right?: ReactNode; backLabel?: string; closeIcon?: boolean }) {
  return (
    <header className="topbar">
      <button type="button" className="icon-btn" aria-label={backLabel} onClick={onBack}>
        <Icon name={closeIcon ? 'close' : 'back'} />
      </button>
      <div className="topbar-title">{title}</div>
      <div className="topbar-right">{right}</div>
    </header>
  );
}

export function Progress({ value, max }: { value: number; max: number }) {
  return (
    <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={max} aria-valuenow={value}>
      <div style={{ width: `${(100 * value) / Math.max(1, max)}%` }} />
    </div>
  );
}

// Une illustration : l'image Fluent Emoji 3D (Microsoft, licence MIT) rangée dans img/.
// Si l'image manque, on affiche l'émoji du système.
export function emojiSrc(e: string): string {
  return 'img/' + [...e.replace(/\uFE0F/g, '')].map((c) => c.codePointAt(0)!.toString(16)).join('-') + '.webp';
}

export function Emoji({ e, size = 100, label = '' }: { e: string; size?: number; label?: string }) {
  const [broken, setBroken] = useState(false);
  if (broken) {
    return (
      <span className="emoji-pic" role="img" aria-label={label} style={{ fontSize: size * 0.82, width: size, height: size }}>
        {e}
      </span>
    );
  }
  return <img className="emoji-img" src={emojiSrc(e)} alt={label} width={size} height={size} draggable={false} onError={() => setBroken(true)} />;
}
