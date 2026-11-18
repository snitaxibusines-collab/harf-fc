import type { ReactNode } from 'react';
import { sayArabic } from '../lib/speech';

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
const SVGS: Record<string, ReactNode> = {
  jam: (
    <>
      <rect x="18" y="30" width="64" height="58" rx="10" fill="#E85A71" />
      <rect x="14" y="18" width="72" height="16" rx="5" fill="#F4C27A" />
      <rect x="28" y="48" width="44" height="22" rx="4" fill="#FFF" opacity="0.85" />
      <circle cx="42" cy="59" r="5" fill="#C8102E" />
      <circle cx="56" cy="59" r="5" fill="#C8102E" />
    </>
  ),
  sugar: (
    <>
      <rect x="14" y="44" width="34" height="34" rx="4" fill="#FFFFFF" stroke="#C9CFDB" strokeWidth="3" />
      <rect x="52" y="44" width="34" height="34" rx="4" fill="#FFFFFF" stroke="#C9CFDB" strokeWidth="3" />
      <rect x="33" y="12" width="34" height="34" rx="4" fill="#FFFFFF" stroke="#C9CFDB" strokeWidth="3" />
    </>
  ),
  yogurt: (
    <>
      <path d="M22 30h56l-8 58H30z" fill="#FFFFFF" stroke="#C9CFDB" strokeWidth="3" />
      <rect x="18" y="20" width="64" height="12" rx="4" fill="#4C8DF0" />
      <rect x="30" y="50" width="40" height="18" rx="4" fill="#E8F0FF" />
    </>
  ),
  apricot: (
    <>
      <circle cx="50" cy="56" r="34" fill="#F7A440" />
      <path d="M50 24c-6 10-6 54 0 64" stroke="#E07F1C" strokeWidth="3" fill="none" />
      <path d="M50 24c8-12 22-14 26-10-6 6-16 10-26 10z" fill="#4C9A4A" />
    </>
  ),
  fig: (
    <>
      <path d="M50 14c-6 14-34 30-34 52a34 30 0 0 0 68 0c0-22-28-38-34-52z" fill="#7B3F8C" />
      <path d="M46 12h8v8h-8z" fill="#5A7B2E" />
      <circle cx="40" cy="64" r="3" fill="#C58BD6" />
      <circle cx="56" cy="72" r="3" fill="#C58BD6" />
      <circle cx="58" cy="56" r="3" fill="#C58BD6" />
    </>
  ),
  pomegranate: (
    <>
      <circle cx="50" cy="58" r="34" fill="#C8102E" />
      <path d="M40 26l4-12 6 8 6-8 4 12z" fill="#9E0B22" />
      <circle cx="40" cy="56" r="4" fill="#FF8FA3" />
      <circle cx="54" cy="64" r="4" fill="#FF8FA3" />
      <circle cx="60" cy="50" r="4" fill="#FF8FA3" />
    </>
  ),
};

export function Picture({ img, size = 120, label }: { img: string; size?: number; label: string }) {
  if (img.startsWith('svg:')) {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label={label}>
        {SVGS[img.slice(4)]}
      </svg>
    );
  }
  return (
    <span className="emoji-pic" role="img" aria-label={label} style={{ fontSize: size * 0.82, width: size, height: size }}>
      {img}
    </span>
  );
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
