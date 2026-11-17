// Bandly 3.0 tasvirlari: tekis (flat), yumshoq soyali jismlar — kitoblar, kubok, quloqchin, soat, mikrofon, suhbat,
// shapka, nishon, karnay. Hammasi SVG (rasm yuklanmaydi), har qanday o'lchamda tiniq, kattalar uchun ham mos.
import type { CSSProperties } from 'react';
import { L } from '../i18n';

export type IlloKind = 'books' | 'trophy' | 'headphones' | 'clock' | 'mic' | 'chat' | 'cap' | 'target' | 'megaphone' | 'pencil' | 'star' | 'map';

const Shadow = ({ cx = 60, cy = 108, rx = 40 }: { cx?: number; cy?: number; rx?: number }) => <ellipse cx={cx} cy={cy} rx={rx} ry="6" fill="#14162b" opacity=".08" />;

function Art({ kind }: { kind: IlloKind }) {
  switch (kind) {
    case 'books': return (
      <>
        <Shadow />
        <rect x="18" y="82" width="84" height="22" rx="5" fill="#f4715f" /><rect x="18" y="82" width="10" height="22" rx="4" fill="#d9584a" /><rect x="30" y="86" width="68" height="4" rx="2" fill="#fff" opacity=".85" /><rect x="30" y="94" width="68" height="4" rx="2" fill="#fff" opacity=".55" />
        <rect x="24" y="62" width="76" height="20" rx="5" fill="#ffd65c" /><rect x="90" y="62" width="10" height="20" rx="4" fill="#e9b830" /><rect x="28" y="66" width="60" height="4" rx="2" fill="#fff" opacity=".85" /><rect x="28" y="74" width="60" height="4" rx="2" fill="#fff" opacity=".55" />
        <rect x="14" y="44" width="80" height="18" rx="5" fill="#7b61ff" /><rect x="14" y="44" width="10" height="18" rx="4" fill="#6448f0" /><rect x="26" y="48" width="64" height="3.5" rx="1.75" fill="#fff" opacity=".85" /><rect x="26" y="55" width="64" height="3.5" rx="1.75" fill="#fff" opacity=".55" />
        <g transform="rotate(-12 78 30)"><rect x="56" y="18" width="46" height="26" rx="5" fill="#5fd0bd" /><rect x="92" y="18" width="10" height="26" rx="4" fill="#3fb3a0" /><rect x="60" y="23" width="30" height="4" rx="2" fill="#fff" opacity=".85" /></g>
      </>
    );
    case 'trophy': return (
      <>
        <Shadow rx={30} />
        <rect x="40" y="94" width="40" height="12" rx="4" fill="#14162b" /><rect x="50" y="78" width="20" height="18" rx="3" fill="#e9b830" />
        <path d="M30 22h60v18c0 22-13 38-30 38S30 62 30 40z" fill="#ffd65c" /><path d="M60 22h30v18c0 22-13 38-30 38z" fill="#e9b830" />
        <path d="M30 30H18c0 16 8 24 16 26" fill="none" stroke="#e9b830" strokeWidth="6" strokeLinecap="round" /><path d="M90 30h12c0 16-8 24-16 26" fill="none" stroke="#e9b830" strokeWidth="6" strokeLinecap="round" />
        <path d="M60 32l4.4 9 9.9 1.4-7.2 7 1.7 9.8L60 54.6 51.2 59.2l1.7-9.8-7.2-7 9.9-1.4z" fill="#fff" opacity=".9" />
      </>
    );
    case 'headphones': return (
      <>
        <Shadow rx={34} />
        <path d="M24 70V58a36 36 0 0 1 72 0v12" fill="none" stroke="#14162b" strokeWidth="8" strokeLinecap="round" />
        <rect x="14" y="62" width="24" height="38" rx="12" fill="#7b61ff" /><rect x="82" y="62" width="24" height="38" rx="12" fill="#7b61ff" />
        <rect x="22" y="68" width="10" height="26" rx="5" fill="#b9adff" /><rect x="88" y="68" width="10" height="26" rx="5" fill="#b9adff" />
      </>
    );
    case 'clock': return (
      <>
        <Shadow rx={32} />
        <circle cx="34" cy="28" r="12" fill="#f4715f" /><circle cx="86" cy="28" r="12" fill="#f4715f" />
        <path d="M40 96l-8 10M80 96l8 10" stroke="#14162b" strokeWidth="6" strokeLinecap="round" />
        <circle cx="60" cy="64" r="38" fill="#7b61ff" /><circle cx="60" cy="64" r="29" fill="#fff" />
        <path d="M60 64V46M60 64l12 8" stroke="#14162b" strokeWidth="5" strokeLinecap="round" /><circle cx="60" cy="64" r="4" fill="#f4715f" />
      </>
    );
    case 'mic': return (
      <>
        <Shadow rx={26} />
        <rect x="42" y="12" width="36" height="58" rx="18" fill="#f4715f" /><rect x="50" y="20" width="8" height="40" rx="4" fill="#fff" opacity=".45" />
        <path d="M30 56a30 30 0 0 0 60 0" fill="none" stroke="#14162b" strokeWidth="6" strokeLinecap="round" /><path d="M60 86v16M44 104h32" stroke="#14162b" strokeWidth="6" strokeLinecap="round" />
      </>
    );
    case 'chat': return (
      <>
        <Shadow rx={38} />
        <path d="M10 26c0-8 6-14 14-14h46c8 0 14 6 14 14v24c0 8-6 14-14 14H40l-16 14V64h0c-8 0-14-6-14-14z" fill="#7b61ff" />
        <text x="47" y="46" textAnchor="middle" fontFamily="Outfit Variable, Inter, sans-serif" fontWeight="700" fontSize="20" fill="#fff">{'Hello'}</text>
        <path d="M110 58c0-8-6-14-14-14H60c-8 0-14 6-14 14v18c0 8 6 14 14 14h28l14 12V90c5-2 8-7 8-14z" fill="#ffd65c" />
        <text x="78" y="74" textAnchor="middle" fontFamily="Outfit Variable, Inter, sans-serif" fontWeight="700" fontSize="17" fill="#14162b">{L('Salom')}</text>
      </>
    );
    case 'cap': return (
      <>
        <Shadow rx={36} />
        <path d="M30 56v24c0 8 14 16 30 16s30-8 30-16V56" fill="#2a2d52" />
        <path d="M60 22l50 22-50 22-50-22z" fill="#14162b" /><path d="M60 22l50 22-50 22z" fill="#2a2d52" />
        <path d="M96 50v28" stroke="#ffd65c" strokeWidth="4" strokeLinecap="round" /><circle cx="96" cy="82" r="6" fill="#ffd65c" />
      </>
    );
    case 'target': return (
      <>
        <Shadow rx={34} />
        <circle cx="56" cy="62" r="40" fill="#f4715f" /><circle cx="56" cy="62" r="30" fill="#fff" /><circle cx="56" cy="62" r="20" fill="#f4715f" /><circle cx="56" cy="62" r="10" fill="#fff" />
        <path d="M56 62l46-40" stroke="#14162b" strokeWidth="5" strokeLinecap="round" /><path d="M96 14l10 2-2 10-10-2z" fill="#7b61ff" />
      </>
    );
    case 'megaphone': return (
      <>
        <Shadow rx={34} />
        <path d="M22 50h18l44-26v72L40 70H22z" fill="#7b61ff" /><path d="M84 24v72l-44-26V50z" fill="#6448f0" />
        <rect x="14" y="48" width="18" height="24" rx="6" fill="#b9adff" /><path d="M42 72l8 26h12l-6-24" fill="#14162b" />
        <path d="M96 46c6 4 6 24 0 28M104 38c11 8 11 36 0 44" fill="none" stroke="#ffd65c" strokeWidth="5" strokeLinecap="round" />
      </>
    );
    case 'pencil': return (
      <>
        <Shadow rx={34} />
        <g transform="rotate(-38 60 60)"><rect x="20" y="48" width="66" height="24" rx="4" fill="#ffd65c" /><rect x="20" y="48" width="66" height="8" fill="#ffe28a" /><rect x="10" y="48" width="14" height="24" rx="4" fill="#f4715f" /><rect x="22" y="48" width="6" height="24" fill="#c9cbe0" />
          <path d="M86 48l22 12-22 12z" fill="#f6dcb8" /><path d="M100 56l8 4-8 4z" fill="#14162b" /></g>
      </>
    );
    case 'star': return (
      <>
        <Shadow rx={30} />
        <path d="M60 10l14 30 32 4-24 22 6 32-28-16-28 16 6-32-24-22 32-4z" fill="#ffd65c" /><path d="M60 10l14 30 32 4-24 22 6 32-28-16z" fill="#e9b830" />
      </>
    );
    case 'map': return (
      <>
        <Shadow rx={40} />
        <path d="M14 30l30-10 32 10 30-10v70l-30 10-32-10-30 10z" fill="#dcf6f0" /><path d="M44 20v70M76 30v70" stroke="#5fd0bd" strokeWidth="3" />
        <path d="M24 74c14-4 18-24 34-22s14 18 34 6" fill="none" stroke="#7b61ff" strokeWidth="4" strokeDasharray="6 6" strokeLinecap="round" />
        <circle cx="92" cy="56" r="9" fill="#f4715f" /><circle cx="92" cy="56" r="3.5" fill="#fff" />
      </>
    );
  }
}

/** Tasvir: dekorativ (aria-hidden). size — piksel kengligi. */
export function Illo({ kind, size = 120, className = '', style }: { kind: IlloKind; size?: number; className?: string; style?: CSSProperties }) {
  return <svg className={`illo ${className}`} width={size} height={size} viewBox="0 0 120 120" aria-hidden="true" focusable="false" style={style}><Art kind={kind} /></svg>;
}
