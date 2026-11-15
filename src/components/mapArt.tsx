// O'quv xaritasi uchun Bandly'ning o'z illyustratsiyalari (original vektor shakllar, tashqi rasm yo'q).
// Har bir daraja — alohida "dunyo": A1 mahalla, A2 bozor, B1 ko'l bo'yi, B2 tog' yo'li, C1 tungi shahar, C2 cho'qqi.

export interface ZoneTheme {
  name: string; sub: string;
  sky: [string, string]; hill: [string, string]; road: string; roadEdge: string; accent: string; accentDark: string;
  night?: boolean;
  props: PropKind[];
}
export type PropKind = 'house' | 'tree' | 'bush' | 'sun' | 'dome' | 'stall' | 'cloud' | 'pine' | 'water' | 'mountain' | 'tower' | 'building' | 'moon' | 'peak' | 'flag' | 'stars';

export const ZONES: Record<string, ZoneTheme> = {
  A1: { name: 'Mahalla', sub: 'Birinchi qadamlar', sky: ['#eafcf2', '#c8f1da'], hill: ['#9fe0b8', '#7fd3a2'], road: '#fff6df', roadEdge: '#e9d9a8', accent: '#12b76a', accentDark: '#0b8a4f', props: ['house', 'tree', 'bush', 'house', 'tree', 'sun'] },
  A2: { name: 'Bozor ko‘chasi', sub: 'Kundalik vaziyatlar', sky: ['#e6fbfa', '#c3eeeb'], hill: ['#93dcd5', '#6fcac2'], road: '#fff3e0', roadEdge: '#ead2a8', accent: '#0ea5a4', accentDark: '#0b7d7c', props: ['dome', 'stall', 'tree', 'dome', 'cloud', 'stall'] },
  B1: { name: 'Ko‘l bo‘yi', sub: 'Tajriba va rejalar', sky: ['#ecf2ff', '#cddcff'], hill: ['#b4c9fb', '#93b0f5'], road: '#fffaf0', roadEdge: '#dfd4b8', accent: '#1f5cff', accentDark: '#1440b8', props: ['water', 'pine', 'cloud', 'pine', 'water', 'tree'] },
  B2: { name: 'Tog‘ yo‘li', sub: 'Fikr va bahs', sky: ['#f3edff', '#dccdff'], hill: ['#c6b2f3', '#a990e8'], road: '#fbf7ff', roadEdge: '#d8c8ee', accent: '#7c3aed', accentDark: '#5b21b6', props: ['mountain', 'pine', 'cloud', 'mountain', 'pine', 'cloud'] },
  C1: { name: 'Tungi shahar', sub: 'Murakkab ingliz tili', sky: ['#2b1640', '#4b1f55'], hill: ['#3d1c4a', '#2c1238'], road: '#5a2f63', roadEdge: '#7b4485', accent: '#ec4899', accentDark: '#be185d', night: true, props: ['tower', 'building', 'moon', 'building', 'tower', 'stars'] },
  C2: { name: 'Cho‘qqi', sub: 'Mukammallik', sky: ['#fff7e0', '#ffe5a3'], hill: ['#f4cf7e', '#e9b85a'], road: '#fffaf0', roadEdge: '#e8c98a', accent: '#f59e0b', accentDark: '#b45309', props: ['peak', 'stars', 'cloud', 'peak', 'flag', 'cloud'] },
};

/** Bitta dekoratsiya (o'lchami px). Ranglar zonaga moslashadi. */
export function Prop({ kind, t, size = 64 }: { kind: PropKind; t: ZoneTheme; size?: number }) {
  const s = { width: size, height: size, display: 'block' } as const;
  switch (kind) {
    case 'house': return (
      <svg viewBox="0 0 64 64" style={s} aria-hidden="true"><ellipse cx="32" cy="58" rx="24" ry="4" fill="#000" opacity=".08" />
        <rect x="12" y="28" width="40" height="28" rx="3" fill="#fff7ea" stroke="#e7cfa6" strokeWidth="2" /><path d="M8 30 L32 12 L56 30 Z" fill={t.accent} /><path d="M8 30 L32 12 L56 30" fill="none" stroke={t.accentDark} strokeWidth="2" strokeLinejoin="round" />
        <rect x="27" y="38" width="10" height="18" rx="2" fill="#c98f52" /><rect x="16" y="35" width="8" height="8" rx="1.5" fill="#bfe3ff" /><rect x="40" y="35" width="8" height="8" rx="1.5" fill="#bfe3ff" /></svg>);
    case 'tree': return (
      <svg viewBox="0 0 64 64" style={s} aria-hidden="true"><ellipse cx="32" cy="59" rx="16" ry="3.5" fill="#000" opacity=".08" />
        <rect x="29" y="38" width="6" height="20" rx="2" fill="#a66b3d" /><circle cx="32" cy="27" r="16" fill={t.hill[1]} /><circle cx="24" cy="31" r="10" fill={t.hill[0]} /><circle cx="40" cy="30" r="10" fill={t.hill[0]} opacity=".85" /><circle cx="27" cy="22" r="4" fill="#fff" opacity=".35" /></svg>);
    case 'bush': return (
      <svg viewBox="0 0 64 40" style={{ width: size, height: size * 0.62, display: 'block' }} aria-hidden="true"><ellipse cx="32" cy="37" rx="24" ry="3" fill="#000" opacity=".07" />
        <circle cx="20" cy="26" r="11" fill={t.hill[1]} /><circle cx="34" cy="21" r="14" fill={t.hill[0]} /><circle cx="46" cy="27" r="10" fill={t.hill[1]} /><circle cx="25" cy="22" r="2.4" fill="#ff8a8a" /><circle cx="40" cy="18" r="2.4" fill="#ffd166" /></svg>);
    case 'sun': return (
      <svg viewBox="0 0 64 64" style={s} aria-hidden="true"><circle cx="32" cy="32" r="14" fill="#ffd166" />{Array.from({ length: 8 }, (_, i) => <rect key={i} x="30.5" y="4" width="3" height="9" rx="1.5" fill="#ffd166" transform={`rotate(${i * 45} 32 32)`} />)}</svg>);
    case 'dome': return (
      <svg viewBox="0 0 64 64" style={s} aria-hidden="true"><ellipse cx="32" cy="59" rx="24" ry="3.5" fill="#000" opacity=".08" />
        <rect x="14" y="34" width="36" height="22" rx="2" fill="#fff4e3" stroke="#e5cba0" strokeWidth="2" /><path d="M18 34 Q32 6 46 34 Z" fill={t.accent} /><path d="M24 34 Q32 16 40 34" fill="none" stroke="#fff" strokeOpacity=".4" strokeWidth="2" /><rect x="31" y="6" width="2" height="8" fill={t.accentDark} /><circle cx="32" cy="6" r="2.2" fill="#ffd166" />
        <path d="M26 56 V46 a6 6 0 0 1 12 0 V56 Z" fill={t.accentDark} opacity=".85" /><rect x="8" y="26" width="5" height="30" rx="2" fill="#f2dfbd" /><circle cx="10.5" cy="25" r="3.5" fill={t.accent} /></svg>);
    case 'stall': return (
      <svg viewBox="0 0 64 64" style={s} aria-hidden="true"><ellipse cx="32" cy="59" rx="24" ry="3.5" fill="#000" opacity=".08" />
        <rect x="12" y="32" width="40" height="24" rx="2" fill="#fff7ea" stroke="#e5cba0" strokeWidth="2" />{[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M${10 + i * 9} 22 h9 v8 a4.5 4.5 0 0 1 -9 0 Z`} fill={i % 2 ? '#fff' : t.accent} />)}
        <circle cx="22" cy="45" r="4" fill="#ff8a5b" /><circle cx="31" cy="46" r="4" fill="#ffd166" /><circle cx="40" cy="45" r="4" fill="#8bd17c" /></svg>);
    case 'cloud': return (
      <svg viewBox="0 0 64 36" style={{ width: size, height: size * 0.56, display: 'block' }} aria-hidden="true"><g fill="#fff" opacity={t.night ? 0.25 : 0.95}><circle cx="20" cy="22" r="10" /><circle cx="34" cy="16" r="13" /><circle cx="47" cy="23" r="9" /><rect x="14" y="22" width="40" height="10" rx="5" /></g></svg>);
    case 'pine': return (
      <svg viewBox="0 0 64 64" style={s} aria-hidden="true"><ellipse cx="32" cy="59" rx="14" ry="3" fill="#000" opacity=".08" /><rect x="29.5" y="48" width="5" height="10" rx="1.5" fill="#8a5a33" />
        <path d="M32 6 L48 30 H38 L50 48 H14 L26 30 H16 Z" fill={t.hill[1]} /><path d="M32 6 L40 18 L32 16 Z" fill="#fff" opacity=".35" /></svg>);
    case 'water': return (
      <svg viewBox="0 0 80 40" style={{ width: size * 1.25, height: size * 0.62, display: 'block' }} aria-hidden="true"><ellipse cx="40" cy="22" rx="38" ry="15" fill="#7fb2ff" /><ellipse cx="40" cy="20" rx="34" ry="12" fill="#a9ccff" />
        <path d="M18 20 q6 -4 12 0 M44 16 q6 -4 12 0 M34 26 q5 -3 10 0" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" /><path d="M54 22 l10 0 l-3 5 h-6 Z" fill="#fff" /><rect x="58.5" y="12" width="1.5" height="10" fill="#8a5a33" /><path d="M60 12 l7 6 h-7 Z" fill={t.accent} /></svg>);
    case 'mountain': return (
      <svg viewBox="0 0 80 64" style={{ width: size * 1.25, height: size, display: 'block' }} aria-hidden="true"><path d="M2 62 L30 14 L46 38 L54 28 L78 62 Z" fill={t.hill[1]} /><path d="M30 14 L38 28 L33 26 L28 31 L23 26 Z" fill="#fff" /><path d="M54 28 L60 37 L55 35 L51 38 Z" fill="#fff" opacity=".9" /><path d="M30 14 L46 38 L40 62 H30 Z" fill="#000" opacity=".07" /></svg>);
    case 'tower': return (
      <svg viewBox="0 0 48 80" style={{ width: size * 0.6, height: size, display: 'block' }} aria-hidden="true"><rect x="10" y="14" width="28" height="64" rx="2" fill="#2a1336" stroke={t.accent} strokeOpacity=".6" />
        {Array.from({ length: 12 }, (_, i) => <rect key={i} x={15 + (i % 3) * 7} y={20 + Math.floor(i / 3) * 13} width="4" height="7" rx="1" fill={(i * 7) % 3 ? '#ffd166' : '#6b4a7a'} />)}<rect x="22" y="2" width="4" height="12" fill={t.accent} /><circle cx="24" cy="2" r="2.5" fill={t.accent} /></svg>);
    case 'building': return (
      <svg viewBox="0 0 64 64" style={s} aria-hidden="true"><rect x="6" y="22" width="22" height="40" rx="2" fill="#341844" /><rect x="30" y="10" width="28" height="52" rx="2" fill="#2a1336" stroke={t.accent} strokeOpacity=".5" />
        {Array.from({ length: 10 }, (_, i) => <rect key={i} x={34 + (i % 2) * 12} y={16 + Math.floor(i / 2) * 9} width="7" height="5" rx="1" fill={i % 3 ? '#ffd166' : '#6b4a7a'} />)}{Array.from({ length: 6 }, (_, i) => <rect key={`b${i}`} x={10 + (i % 2) * 8} y={28 + Math.floor(i / 2) * 10} width="5" height="5" rx="1" fill={i % 2 ? '#ffd166' : '#5b3a6a'} />)}</svg>);
    case 'moon': return (
      <svg viewBox="0 0 64 64" style={s} aria-hidden="true"><circle cx="32" cy="32" r="16" fill="#fff4c2" /><circle cx="39" cy="27" r="14" fill={t.sky[0]} /></svg>);
    case 'stars': return (
      <svg viewBox="0 0 64 40" style={{ width: size, height: size * 0.62, display: 'block' }} aria-hidden="true">{[[8, 10, 2.2], [26, 22, 1.6], [40, 8, 2.6], [56, 26, 1.8], [18, 34, 1.4]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill={t.night ? '#fff4c2' : '#f59e0b'} />)}</svg>);
    case 'peak': return (
      <svg viewBox="0 0 80 72" style={{ width: size * 1.2, height: size * 1.08, display: 'block' }} aria-hidden="true"><path d="M2 70 L40 6 L78 70 Z" fill={t.hill[1]} /><path d="M40 6 L52 26 L45 23 L40 28 L34 23 L28 26 Z" fill="#fff" /><rect x="39" y="0" width="2" height="12" fill="#8a5a33" /><path d="M41 0 l10 4 l-10 4 Z" fill={t.accent} /></svg>);
    case 'flag': return (
      <svg viewBox="0 0 48 64" style={{ width: size * 0.75, height: size, display: 'block' }} aria-hidden="true"><ellipse cx="14" cy="60" rx="10" ry="2.5" fill="#000" opacity=".1" /><rect x="12" y="8" width="4" height="52" rx="2" fill="#8a5a33" /><path d="M16 10 h26 l-6 9 l6 9 h-26 Z" fill={t.accent} /><circle cx="14" cy="7" r="3.5" fill="#ffd166" /></svg>);
  }
}
