// Sellzen belgisi (eski Mascot API saqlangan: mood, size, talking) — barcha joylarda bir xil brend belgisi.
// Holat halqa rangi bilan ko'rsatiladi; gapirganda halqa yumshoq pulsatsiya qiladi.
import { LogoMark } from './Logo';
import { L } from '../i18n';

export type Mood = 'idle' | 'happy' | 'sad' | 'angry' | 'think' | 'laugh' | 'listen' | 'impressed';
const RING: Record<Mood, string> = { idle: '#2DD4BF', happy: '#2DD4BF', laugh: '#5EEAD4', impressed: '#99F6E4', listen: '#38BDF8', think: '#A5B4FC', sad: '#94A3B8', angry: '#FB7185' };

export function Mascot({ size = 96, talking = false, mood = 'happy' }: { mood?: Mood; size?: number; talking?: boolean }) {
  return (
    <span className={`ai-mark${talking ? ' talking' : ''}`} style={{ width: size, height: size, ['--ring' as string]: RING[mood] }} role="img" aria-label={L('Sellzen')}>
      <LogoMark size={Math.round(size * 0.86)} tile />
    </span>
  );
}
