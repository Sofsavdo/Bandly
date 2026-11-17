// Bandly brend belgisi (Design 3.0): binafsha kvadrat, sariq-shaftoli girih yulduzi va "B" monogrammasi.
// Eski Mascot API saqlangan (mood, size, talking), shuning uchun barcha joylarda avtomatik almashadi.
import { useId } from 'react';

export type Mood = 'idle' | 'happy' | 'sad' | 'angry' | 'think' | 'laugh' | 'listen' | 'impressed';

export function Mascot({ size = 96, talking = false }: { mood?: Mood; size?: number; talking?: boolean }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg className={`mascot brandmark${talking ? ' talking' : ''}`} width={size} height={size} viewBox="0 0 100 100" role="img" aria-label="Bandly">
      <defs>
        <linearGradient id={`bg${id}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#9a86ff" /><stop offset="1" stopColor="#5b42e6" /></linearGradient>
        <linearGradient id={`st${id}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffd65c" /><stop offset="1" stopColor="#ffb48a" /></linearGradient>
      </defs>
      <rect x="2" y="2" width="96" height="96" rx="30" fill={`url(#bg${id})`} />
      <g fill="none" stroke={`url(#st${id})`} strokeWidth="4" strokeLinejoin="round">
        <rect x="24" y="24" width="52" height="52" rx="4" />
        <rect x="24" y="24" width="52" height="52" rx="4" transform="rotate(45 50 50)" />
      </g>
      <text x="50" y="62" textAnchor="middle" fontFamily="Outfit Variable, Inter, sans-serif" fontWeight="700" fontSize="32" fill="#fff">B</text>
    </svg>
  );
}
