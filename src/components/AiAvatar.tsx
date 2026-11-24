// Sellzen ustozning ovozli qo'ng'iroqdagi belgisi: yuzli personaj. Shakli va rangi holat/hissiyotga qarab o'zgaradi:
// navbat sizda — yumaloq tabletka (yashil), tinglash — ko'k tabletka (mikrofon darajasiga qarab nafas oladi), o'ylash — bulut (binafsha),
// gapirish — nutq pufagi (shaftoli; ovoz balandligiga qarab og'iz ochiladi), quvonch — oval, qattiq maqtov — yurak (pushti),
// kulgi — pufak (sariq), jahl — qizil tabletka (silkinadi, olovsiz), hafsala — bulut (kulrang-ko'k, ko'z yoshi).
// Ustoz xarakteri (look: 0 yumshoq … 3 jallod) — dam olish holatidagi nigohni belgilaydi: qattiq xarakterlarda yarim yumuq, mensimagan ko'z.
import type { CSSProperties } from 'react';
import type { CoachEmotion } from '../content/personas';
import { L } from '../i18n';

export type AiPhase = 'idle' | 'listening' | 'thinking' | 'speaking' | 'error';
export type AvatarShape = 'pill' | 'bubble' | 'cloud' | 'heart' | 'egg';
export type AvatarMood = 'calm' | 'attentive' | 'thinking' | 'talk' | 'happy' | 'love' | 'laugh' | 'angry' | 'sad' | 'smug' | 'error';
export interface AvatarLook { shape: AvatarShape; mood: AvatarMood; color: string }

const COLORS = { idle: '#2DD4BF', listen: '#38BDF8', think: '#A5B4FC', talk: '#FB923C', happy: '#34D399', love: '#F472B6', laugh: '#FBBF24', angry: '#EF4444', sad: '#94A3B8', serious: '#475569', smug: '#818CF8', error: '#FB7185' };

/** Holat va hissiyotdan avatar ko'rinishi (sof funksiya — sinovdan o'tadi). */
export function avatarLook(phase: AiPhase, emotion: CoachEmotion = 'neutral'): AvatarLook {
  if (phase === 'error') return { shape: 'pill', mood: 'error', color: COLORS.error };
  if (phase === 'listening') return { shape: 'pill', mood: 'attentive', color: COLORS.listen };
  if (phase === 'thinking') return { shape: 'cloud', mood: 'thinking', color: COLORS.think };
  if (phase === 'idle') return { shape: 'pill', mood: 'calm', color: COLORS.idle };
  switch (emotion) { // phase === 'speaking'
    case 'angry': return { shape: 'pill', mood: 'angry', color: COLORS.angry };
    case 'laugh': return { shape: 'bubble', mood: 'laugh', color: COLORS.laugh };
    case 'happy': return { shape: 'egg', mood: 'happy', color: COLORS.happy };
    case 'impressed': return { shape: 'heart', mood: 'love', color: COLORS.love };
    case 'disappointed': return { shape: 'cloud', mood: 'sad', color: COLORS.sad };
    case 'serious': return { shape: 'pill', mood: 'smug', color: COLORS.serious };
    case 'sarcastic': return { shape: 'egg', mood: 'smug', color: COLORS.smug };
    default: return { shape: 'bubble', mood: 'talk', color: COLORS.talk };
  }
}

const SHAPES: Record<AvatarShape, { d: string; fy: number }> = {
  pill: { d: 'M74 54 H126 A48 48 0 0 1 126 150 H74 A48 48 0 0 1 74 54 Z', fy: 102 },
  bubble: { d: 'M68 44 H132 A40 40 0 0 1 172 84 V100 A40 40 0 0 1 132 140 H88 L52 170 L62 140 H68 A40 40 0 0 1 28 100 V84 A40 40 0 0 1 68 44 Z', fy: 92 },
  cloud: { d: 'M62 146 A30 30 0 0 1 52 90 A32 32 0 0 1 104 62 A32 32 0 0 1 154 92 A28 28 0 0 1 144 146 Z', fy: 106 },
  heart: { d: 'M100 164 C36 122 24 86 46 62 C68 42 94 54 100 76 C106 54 132 42 154 62 C176 86 164 122 100 164 Z', fy: 96 },
  egg: { d: 'M100 32 C150 32 168 80 164 112 C160 146 132 168 100 168 C68 168 40 146 36 112 C32 80 50 32 100 32 Z', fy: 104 },
};

export function AiAvatar({ phase, emotion = 'neutral', level = 0, size = 200, look = 0 }: { phase: AiPhase; emotion?: CoachEmotion; level?: number; size?: number; look?: number }) {
  const lk = avatarLook(phase, emotion);
  const lvl = Math.min(1, Math.max(0, level));
  const style = { width: size, height: size, ['--ring' as string]: lk.color, ['--lvl' as string]: String(lvl) } as CSSProperties;
  const fy = SHAPES[lk.shape].fy;
  // Qattiq xarakterlar (2–3) tinch holatda yarim yumuq, mensimagan nigoh bilan
  const lidded = (lk.mood === 'calm' || lk.mood === 'talk') && look >= 2;
  return (
    <span className={`ai-avatar ${phase} emo-${emotion} mood-${lk.mood}`} style={style} role="img" aria-label={L('Sellzen')}>
      <svg className="ai-face" viewBox="0 0 200 200" aria-hidden="true">
        <ellipse className="av-shadow" cx="100" cy="184" rx="52" ry="7" />
        {(Object.keys(SHAPES) as AvatarShape[]).map((k) => <path key={k} className={`av-shape${k === lk.shape ? ' on' : ''}`} d={SHAPES[k].d} />)}
        <g className="av-face" style={{ transform: `translate(100px, ${fy}px)` }}>
          <Eyes mood={lk.mood} lidded={lidded} />
          <Mouth mood={lk.mood} speaking={phase === 'speaking'} level={lvl} look={look} />
          {lk.mood === 'thinking' && <g className="av-dots" fill="currentColor">{[-14, 0, 14].map((x, i) => <circle key={x} cx={x} cy={30} r={3.4} style={{ ['--i' as string]: String(i) } as CSSProperties} />)}</g>}
          {lk.mood === 'sad' && <path className="av-tear" d="M-30 6 Q-34 16 -30 20 Q-26 16 -30 6 Z" />}
        </g>
      </svg>
      <EmotionFx emotion={phase === 'speaking' ? emotion : 'neutral'} />
    </span>
  );
}

function Eyes({ mood, lidded }: { mood: AvatarMood; lidded: boolean }) {
  const arc = (x: number) => <path key={x} className="av-eye-arc" d={`M${x - 9} 2 Q${x} -12 ${x + 9} 2`} />;
  if (mood === 'happy' || mood === 'love' || mood === 'laugh') return <g>{arc(-24)}{arc(24)}</g>;
  if (mood === 'angry') return <g><ellipse className="av-eye" cx={-24} cy={-2} rx={7} ry={6} /><ellipse className="av-eye" cx={24} cy={-2} rx={7} ry={6} /><path className="av-brow" d="M-38 -16 L-12 -8" /><path className="av-brow" d="M38 -16 L12 -8" /></g>;
  if (mood === 'sad') return <g><ellipse className="av-eye" cx={-24} cy={-2} rx={7} ry={8} /><ellipse className="av-eye" cx={24} cy={-2} rx={7} ry={8} /><path className="av-brow" d="M-38 -14 L-12 -20" /><path className="av-brow" d="M38 -14 L12 -20" /></g>;
  if (mood === 'thinking') return <g className="av-look-up"><ellipse className="av-eye" cx={-24} cy={-4} rx={7} ry={9} /><ellipse className="av-eye" cx={24} cy={-4} rx={7} ry={9} /></g>;
  if (mood === 'attentive') return <g className="av-blink"><ellipse className="av-eye" cx={-24} cy={-4} rx={8} ry={11} /><ellipse className="av-eye" cx={24} cy={-4} rx={8} ry={11} /></g>;
  if (mood === 'error') return <g><path className="av-brow" d="M-32 -8 L-16 4 M-32 4 L-16 -8" /><path className="av-brow" d="M16 -8 L32 4 M16 4 L32 -8" /></g>;
  if (mood === 'smug' || lidded) return <g><ellipse className="av-eye" cx={-24} cy={0} rx={8} ry={4.5} /><ellipse className="av-eye" cx={24} cy={0} rx={8} ry={4.5} /><path className="av-brow" d="M-34 -6 H-14 M14 -6 H34" /></g>;
  return <g className="av-blink"><ellipse className="av-eye" cx={-24} cy={-4} rx={7} ry={9} /><ellipse className="av-eye" cx={24} cy={-4} rx={7} ry={9} /></g>;
}

function Mouth({ mood, speaking, level, look }: { mood: AvatarMood; speaking: boolean; level: number; look: number }) {
  if (speaking && (mood === 'talk' || mood === 'happy' || mood === 'love' || mood === 'angry' || mood === 'sad' || mood === 'smug')) {
    const ry = 3 + level * 15; // ovoz balandligiga qarab og'iz ochiladi
    return <ellipse className="av-mouth-open" cx={0} cy={26} rx={mood === 'angry' ? 13 : 11} ry={ry} />;
  }
  if (mood === 'laugh') return <path className="av-mouth-fill" d="M-17 16 Q0 44 17 16 Z" />;
  if (mood === 'happy' || mood === 'love') return <path className="av-mouth" d="M-14 20 Q0 34 14 20" />;
  if (mood === 'angry') return <path className="av-mouth" d="M-14 32 Q0 18 14 32" />;
  if (mood === 'sad') return <path className="av-mouth" d="M-10 30 Q0 22 10 30" />;
  if (mood === 'attentive') return <ellipse className="av-mouth-open" cx={0} cy={26} rx={6} ry={4 + level * 6} />;
  if (mood === 'thinking') return <path className="av-mouth" d="M-8 24 H8" />;
  if (mood === 'error') return <path className="av-mouth" d="M-12 30 Q0 20 12 30" />;
  return look >= 2 ? <path className="av-mouth" d="M-10 24 Q0 28 12 21" /> : <path className="av-mouth" d="M-12 20 Q0 32 12 20" />;
}

/** Hissiyot effektlari (faqat CSS): kulgi — "ha-ha", quvonch — uchqunlar, hafsala — tomchilar. Jahl: olovsiz — faqat qizil nur va silkinish. */
function EmotionFx({ emotion }: { emotion: CoachEmotion }) {
  if (emotion === 'laugh') return <span className="emo-fx" aria-hidden="true">{['ha', 'ha-ha', 'ha!'].map((t, i) => <i key={i} className="fx-laugh" style={{ ['--i' as string]: String(i) } as CSSProperties}>{t}</i>)}</span>;
  if (emotion === 'happy' || emotion === 'impressed') return <span className="emo-fx" aria-hidden="true">{[0, 1, 2, 3, 4, 5].map((i) => <i key={i} className="fx-spark" style={{ ['--i' as string]: String(i) } as CSSProperties}>✦</i>)}</span>;
  return null;
}
