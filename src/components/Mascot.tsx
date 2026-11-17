// Bandly brend belgisi (2026-11-17): bolalarcha smaylik o'rniga — girih yulduzi va "B" monogrammasi.
// Eski Mascot API saqlangan (mood, size, talking), shuning uchun barcha joylarda avtomatik almashadi.
import { useId } from 'react';

export type Mood = 'idle' | 'happy' | 'sad' | 'angry' | 'think' | 'laugh' | 'listen' | 'impressed';

export function Mascot({ size = 96, talking = false }: { mood?: Mood; size?: number; talking?: boolean }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg className={`mascot brandmark${talking ? ' talking' : ''}`} width={size} height={size} viewBox="0 0 100 100" role="img" aria-label="Bandly">
      <defs>
        <linearGradient id={`bg${id}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#252b63" /><stop offset="1" stopColor="#0e1230" /></linearGradient>
        <linearGradient id={`st${id}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ff7a5c" /><stop offset="1" stopColor="#f2a922" /></linearGradient>
      </defs>
      <rect x="2" y="2" width="96" height="96" rx="26" fill={`url(#bg${id})`} />
      <g fill="none" stroke={`url(#st${id})`} strokeWidth="4.5" strokeLinejoin="round">
        <rect x="24" y="24" width="52" height="52" rx="4" />
        <rect x="24" y="24" width="52" height="52" rx="4" transform="rotate(45 50 50)" />
      </g>
      <text x="50" y="62" textAnchor="middle" fontFamily="Unbounded, Inter, sans-serif" fontWeight="700" fontSize="32" fill="#fff">B</text>
    </svg>
  );
}
