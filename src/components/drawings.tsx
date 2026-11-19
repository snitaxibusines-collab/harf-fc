import type { ReactNode } from 'react';

// Nos propres dessins, dans le même style doux et en relief que les autres illustrations.
// (Pour les mots qui n'ont pas d'illustration toute faite.)
const shadow = <ellipse cx="50" cy="93" rx="30" ry="4.5" fill="#000" opacity="0.12" />;

export const DRAWINGS: Record<string, ReactNode> = {
  sugar: (
    <>
      <defs>
        <linearGradient id="dSugTop" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FFFFFF" /><stop offset="1" stopColor="#EEF0F6" /></linearGradient>
        <linearGradient id="dSugL" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#E7EAF2" /><stop offset="1" stopColor="#CBD1DF" /></linearGradient>
        <linearGradient id="dSugR" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#D6DBE7" /><stop offset="1" stopColor="#B4BCCD" /></linearGradient>
        <linearGradient id="dBowl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5BB8F5" /><stop offset="1" stopColor="#2A7FD0" /></linearGradient>
      </defs>
      {shadow}
      {[[22, 30], [50, 30], [36, 14]].map(([x, y], k) => (
        <g key={k} transform={`translate(${x} ${y})`}>
          <path d="M0 8 L14 0 L28 8 L14 16 Z" fill="url(#dSugTop)" />
          <path d="M0 8 L14 16 L14 32 L0 24 Z" fill="url(#dSugL)" />
          <path d="M28 8 L14 16 L14 32 L28 24 Z" fill="url(#dSugR)" />
          <circle cx="8" cy="7" r="1" fill="#C7CEDD" /><circle cx="19" cy="9" r="1" fill="#C7CEDD" /><circle cx="6" cy="18" r="1" fill="#AEB7C9" />
        </g>
      ))}
      <path d="M12 60 H88 Q86 90 50 90 Q14 90 12 60 Z" fill="url(#dBowl)" />
      <ellipse cx="50" cy="60" rx="38" ry="6" fill="#8FD0FF" />
      <path d="M20 68 Q24 82 40 86" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity="0.5" fill="none" />
    </>
  ),
  yogurt: (
    <>
      <defs>
        <linearGradient id="dYoCup" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#FFFFFF" /><stop offset="0.6" stopColor="#F4F6FB" /><stop offset="1" stopColor="#D9DEEA" /></linearGradient>
        <linearGradient id="dYoLab" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#6FC3FF" /><stop offset="1" stopColor="#2F86E0" /></linearGradient>
      </defs>
      {shadow}
      <path d="M22 30 L78 30 L70 90 Q50 94 30 90 Z" fill="url(#dYoCup)" />
      <path d="M25 48 L75 48 L72 72 Q50 76 28 72 Z" fill="url(#dYoLab)" />
      <path d="M38 60 q6 -8 12 0 q6 8 12 0" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" />
      <ellipse cx="50" cy="30" rx="30" ry="7" fill="#F7F7F2" stroke="#D9DEEA" strokeWidth="2" />
      <ellipse cx="50" cy="30" rx="24" ry="4.5" fill="#FFFDF4" />
      <path d="M58 6 Q64 4 64 10 L56 32" stroke="#C9CFDB" strokeWidth="5" strokeLinecap="round" fill="none" />
      <path d="M29 40 L33 84" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
    </>
  ),
  jam: (
    <>
      <defs>
        <linearGradient id="dJam" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#FF5C7A" /><stop offset="0.5" stopColor="#E0284A" /><stop offset="1" stopColor="#A3122E" /></linearGradient>
        <linearGradient id="dGlass" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#FFFFFF" stopOpacity="0.7" /><stop offset="0.3" stopColor="#FFFFFF" stopOpacity="0.1" /><stop offset="1" stopColor="#FFFFFF" stopOpacity="0.25" /></linearGradient>
      </defs>
      {shadow}
      <rect x="22" y="34" width="56" height="58" rx="12" fill="url(#dJam)" />
      <rect x="22" y="34" width="56" height="58" rx="12" fill="url(#dGlass)" />
      <rect x="34" y="52" width="32" height="24" rx="4" fill="#FFF8E7" />
      <circle cx="50" cy="64" r="7" fill="#E0284A" />
      <path d="M46 57 q4 -4 8 0" stroke="#3E9B4F" strokeWidth="3" fill="none" strokeLinecap="round" />
      <rect x="20" y="22" width="60" height="14" rx="5" fill="#E53950" />
      {[0, 1, 2, 3, 4].map((k) => (
        <rect key={k} x={22 + k * 12} y="22" width="6" height="14" fill="#fff" opacity="0.85" />
      ))}
      <path d="M18 34 Q50 42 82 34" stroke="#B8243C" strokeWidth="3" fill="none" />
      <path d="M28 44 L28 84" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity="0.55" />
    </>
  ),
  fig: (
    <>
      <defs>
        <radialGradient id="dFig" cx="0.35" cy="0.35" r="0.75"><stop offset="0" stopColor="#B07AD6" /><stop offset="0.6" stopColor="#6E3A9A" /><stop offset="1" stopColor="#3F1D61" /></radialGradient>
        <radialGradient id="dFigIn" cx="0.5" cy="0.55" r="0.6"><stop offset="0" stopColor="#FFD9DE" /><stop offset="0.45" stopColor="#F2687E" /><stop offset="1" stopColor="#B83256" /></radialGradient>
      </defs>
      {shadow}
      <path d="M30 18 Q34 10 38 16 Q50 26 50 54 Q50 88 28 88 Q8 88 8 62 Q8 38 30 18 Z" fill="url(#dFig)" />
      <path d="M31 17 L33 8" stroke="#5A7D2B" strokeWidth="4" strokeLinecap="round" />
      <path d="M18 46 Q16 60 20 72" stroke="#fff" strokeWidth="3" opacity="0.35" fill="none" strokeLinecap="round" />
      <path d="M70 30 Q90 44 90 66 Q90 90 70 90 Q50 90 50 66 Q50 44 70 30 Z" fill="#7A4AA6" />
      <path d="M70 36 Q85 48 85 66 Q85 85 70 85 Q55 85 55 66 Q55 48 70 36 Z" fill="#F8E7C9" />
      <path d="M70 42 Q80 52 80 66 Q80 80 70 80 Q60 80 60 66 Q60 52 70 42 Z" fill="url(#dFigIn)" />
      {[[66, 58], [74, 60], [70, 68], [64, 72], [76, 72], [70, 52]].map(([x, y], k) => (
        <circle key={k} cx={x} cy={y} r="1.6" fill="#FFF3D6" />
      ))}
    </>
  ),
  pomegranate: (
    <>
      <defs>
        <radialGradient id="dPom" cx="0.35" cy="0.35" r="0.75"><stop offset="0" stopColor="#FF7A6B" /><stop offset="0.55" stopColor="#D7263D" /><stop offset="1" stopColor="#8E1027" /></radialGradient>
      </defs>
      {shadow}
      <path d="M40 16 L36 6 L44 11 L50 3 L56 11 L64 6 L60 16 Z" fill="#B0182F" />
      <circle cx="50" cy="54" r="38" fill="url(#dPom)" />
      <ellipse cx="36" cy="38" rx="9" ry="6" fill="#fff" opacity="0.35" transform="rotate(-30 36 38)" />
      <path d="M40 16 Q50 22 60 16" stroke="#8E1027" strokeWidth="3" fill="none" />
    </>
  ),
  leek: (
    <>
      <defs>
        <linearGradient id="dLeekW" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#FFFFFF" /><stop offset="1" stopColor="#E3E8D2" /></linearGradient>
        <linearGradient id="dLeekG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2E8B48" /><stop offset="1" stopColor="#8DCB6A" /></linearGradient>
      </defs>
      {shadow}
      <g transform="rotate(-25 50 50)">
        <path d="M42 6 Q38 30 44 50 L56 50 Q62 30 58 6 Q54 22 50 26 Q46 20 42 6 Z" fill="url(#dLeekG)" />
        <path d="M44 4 Q30 16 28 30 Q40 22 46 30 Z" fill="#3E9B4F" />
        <path d="M56 4 Q72 14 74 28 Q62 22 54 30 Z" fill="#4FAF5A" />
        <rect x="43" y="46" width="14" height="44" rx="7" fill="url(#dLeekW)" />
        <path d="M46 52 L46 84" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M44 90 l-4 5 M50 91 v6 M56 90 l4 5" stroke="#C8B98F" strokeWidth="2" strokeLinecap="round" />
      </g>
    </>
  ),
  board: (
    <>
      <defs>
        <linearGradient id="dWood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#C98A4B" /><stop offset="1" stopColor="#8B5A2B" /></linearGradient>
        <linearGradient id="dSlate" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#2F7A55" /><stop offset="1" stopColor="#1B4E36" /></linearGradient>
      </defs>
      {shadow}
      <path d="M28 70 L20 94 M72 70 L80 94" stroke="#8B5A2B" strokeWidth="5" strokeLinecap="round" />
      <rect x="6" y="12" width="88" height="62" rx="6" fill="url(#dWood)" />
      <rect x="12" y="18" width="76" height="50" rx="3" fill="url(#dSlate)" />
      <text x="50" y="38" fontSize="14" fill="#fff" fontFamily="Noto Naskh Arabic, serif" textAnchor="middle">أ ب ت</text>
      <path d="M20 50 h40 M20 58 h28" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" opacity="0.85" />
      <rect x="56" y="66" width="14" height="4" rx="1" fill="#F4F1EA" />
    </>
  ),
};
