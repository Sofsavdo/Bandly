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
export type AvatarMood = 'calm' | 'attentive' | 'thinking' | 'talk' | 'happy' | 'love' | 'laugh' | 'angry' | 'sad' | 'smug' | 'stern' | 'error';
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
    case 'serious': return { shape: 'pill', mood: 'stern', color: COLORS.serious };
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

/** size — piksel yoki CSS qiymati (masalan, "min(58vw, 34dvh)": ekranga qarab o'zgaradigan o'lcham) */
export function AiAvatar({ phase, emotion = 'neutral', level = 0, size = 200, look = 0 }: { phase: AiPhase; emotion?: CoachEmotion; level?: number; size?: number | string; look?: number }) {
  const lk = avatarLook(phase, emotion);
  const lvl = Math.min(1, Math.max(0, level));
  const style = { width: size, height: size, ['--ring' as string]: lk.color, ['--lvl' as string]: String(lvl) } as CSSProperties;
  const fy = SHAPES[lk.shape].fy;
  // Qattiq xarakterlar (2–3) tinch holatda yarim yumuq, mensimagan nigoh bilan
  const lidded = (lk.mood === 'calm' || lk.mood === 'talk') && look >= 2;
  const speaking = phase === 'speaking';
  const emo = speaking ? emotion : 'neutral';
  return (
    <span className={`ai-avatar ${phase} emo-${emo} mood-${lk.mood}${lidded ? ' lidded' : ''}`} style={style} role="img" aria-label={L('Sellzen')}>
      <svg className="ai-face" viewBox="0 0 200 200" aria-hidden="true">
        <ellipse className="av-shadow" cx="100" cy="184" rx="52" ry="7" />
        {(Object.keys(SHAPES) as AvatarShape[]).map((k) => <path key={k} className={`av-shape${k === lk.shape ? ' on' : ''}`} d={SHAPES[k].d} />)}
        <g className="av-face" style={{ transform: `translate(100px, ${fy}px)` }}>
          {/* Bosh harakati (qiyshayish, egilish) — faqat shu guruh ichida: boshqa elementlar qimirlamaydi */}
          <g className="av-head">
            <ellipse className="av-cheek" cx={-36} cy={14} rx={9} ry={5.5} />
            <ellipse className="av-cheek" cx={36} cy={14} rx={9} ry={5.5} />
            <Brows />
            <g key={`e-${lk.mood}-${lidded}`} className="av-eyes av-pop"><Eyes mood={lk.mood} lidded={lidded} /></g>
            <g key={`m-${lk.mood}-${speaking}`} className="av-mouth-g av-pop"><Mouth mood={lk.mood} speaking={speaking} level={lvl} look={look} /></g>
            {lk.mood === 'thinking' && <g className="av-dots" fill="currentColor">{[[40, -30, 3], [50, -42, 4.2], [62, -56, 5.6]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} style={{ ['--i' as string]: String(i) } as CSSProperties} />)}</g>}
            {lk.mood === 'sad' && <path className="av-tear" d="M-30 8 Q-34 18 -30 22 Q-26 18 -30 8 Z" />}
            {lk.mood === 'laugh' && <g className="av-joy">{[-36, 36].map((x, i) => <path key={x} style={{ ['--i' as string]: String(i) } as CSSProperties} d={`M${x} 0 Q${x - 4} 9 ${x} 12 Q${x + 4} 9 ${x} 0 Z`} />)}</g>}
            {lk.mood === 'angry' && <AngerMarks />}
            {lk.mood === 'error' && <path className="av-sweat" d="M38 -26 Q33 -16 38 -12 Q43 -16 38 -26 Z" />}
          </g>
        </g>
      </svg>
      <EmotionFx emotion={emo} />
    </span>
  );
}

/** Qoshlar har holatda bor: qanday turishi CSS'da (mood- va emo- klasslari), holatlar orasida silliq o'tadi. */
function Brows() {
  return (
    <g className="av-brows">
      <g transform="translate(-24 -20)"><path className="av-brow av-brow-l" d="M-10 1 Q0 -3 10 1" /></g>
      <g transform="translate(24 -20)"><path className="av-brow av-brow-r" d="M-10 1 Q0 -3 10 1" /></g>
    </g>
  );
}

/** Jahl belgilari: chakkadagi "tomir" va quloqdan chiqayotgan bug' */
function AngerMarks() {
  return (
    <g className="av-anger">
      <g transform="translate(42 -34)"><g className="av-vein"><path d="M-7 -2 Q-2 -2 -2 -7 M2 -7 Q2 -2 7 -2 M7 2 Q2 2 2 7 M-2 7 Q-2 2 -7 2" /></g></g>
      {[-1, 1].map((sd) => <g key={sd} className="av-steam" transform={`translate(${sd * 50} -6)`}>{[0, 1, 2].map((i) => <circle key={i} cx={sd * i * 3} cy={-i * 7} r={4 - i} style={{ ['--i' as string]: String(i) } as CSSProperties} />)}</g>)}
    </g>
  );
}

function Eye({ x, kind }: { x: number; kind: 'round' | 'big' | 'angry' | 'sad' | 'lid' }) {
  const m = x < 0 ? 1 : -1; // chap ko'z: 1, o'ng: -1 (ko'zgu)
  const hl = <circle className="av-hl" cx={x + 2} cy={kind === 'big' ? -8 : -6} r={kind === 'big' ? 3 : 2.2} />;
  if (kind === 'angry') return <g><path className="av-eye" d={`M${x - 9 * m} -8 L${x + 9 * m} -1 C${x + 9 * m} 6 ${x + 5 * m} 9 ${x} 9 C${x - 6 * m} 9 ${x - 9 * m} 4 ${x - 9 * m} -8 Z`} />{hl}</g>;
  if (kind === 'sad') return <g><path className="av-eye" d={`M${x - 8 * m} -1 L${x + 8 * m} -7 C${x + 9 * m} 2 ${x + 5 * m} 9 ${x} 9 C${x - 6 * m} 9 ${x - 9 * m} 5 ${x - 8 * m} -1 Z`} /><circle className="av-hl" cx={x + 1} cy={2} r={2} /></g>;
  if (kind === 'lid') return <g><ellipse className="av-eye" cx={x} cy={0} rx={8} ry={4.5} /><path className="av-lid" d={`M${x - 10} -3 Q${x} -7 ${x + 10} -3`} /></g>;
  return <g className="av-blink"><ellipse className="av-eye" cx={x} cy={-4} rx={kind === 'big' ? 8.5 : 7} ry={kind === 'big' ? 11 : 9} />{hl}</g>;
}

function Eyes({ mood, lidded }: { mood: AvatarMood; lidded: boolean }) {
  const arc = (x: number) => <path key={x} className="av-eye-arc" d={`M${x - 9} 2 Q${x} -12 ${x + 9} 2`} />;
  const heart = (x: number) => <path key={x} className="av-heart-eye" d={`M${x} 7 C${x - 13} -1 ${x - 9} -13 ${x} -6 C${x + 9} -13 ${x + 13} -1 ${x} 7 Z`} />;
  const squeeze = (x: number) => { const m = x < 0 ? 1 : -1; return <path key={x} className="av-eye-arc" d={`M${x - 8 * m} -8 L${x + 7 * m} -2 L${x - 8 * m} 4`} />; };
  if (mood === 'happy') return <g>{arc(-24)}{arc(24)}</g>;
  if (mood === 'love') return <g>{heart(-24)}{heart(24)}</g>;
  if (mood === 'laugh') return <g>{squeeze(-24)}{squeeze(24)}</g>;
  if (mood === 'angry') return <g><Eye x={-24} kind="angry" /><Eye x={24} kind="angry" /></g>;
  if (mood === 'sad') return <g><Eye x={-24} kind="sad" /><Eye x={24} kind="sad" /></g>;
  if (mood === 'thinking') return <g className="av-look-up"><Eye x={-24} kind="round" /><Eye x={24} kind="round" /></g>;
  if (mood === 'attentive') return <g><Eye x={-24} kind="big" /><Eye x={24} kind="big" /></g>;
  if (mood === 'error') return <g><path className="av-brow" d="M-32 -8 L-16 4 M-32 4 L-16 -8" /><path className="av-brow" d="M16 -8 L32 4 M16 4 L32 -8" /></g>;
  if (mood === 'smug' || mood === 'stern' || lidded) return <g><Eye x={-24} kind="lid" /><Eye x={24} kind="lid" /></g>;
  return <g className="av-glance"><Eye x={-24} kind="round" /><Eye x={24} kind="round" /></g>;
}

/** Ochiq og'iz: ichi, til va (jahl, kulgida) tishlar. h — ochilish (ovoz balandligi bilan). */
function OpenMouth({ d, h, teeth, tongue = true }: { d: string; h: number; teeth?: 'top' | 'grit'; tongue?: boolean }) {
  return (
    <g className="av-open">
      <path className="av-mouth-in" d={d} />
      {tongue && h > 5 && <ellipse className="av-tongue" cx={0} cy={22 + h * 0.72} rx={7} ry={Math.min(5, h * 0.28)} />}
      {teeth === 'top' && <path className="av-teeth" d="M-13 17.2 Q0 20 13 17.2 L12 21 Q0 23.5 -12 21 Z" />}
      {teeth === 'grit' && <g className="av-teeth"><path d={`M-14 21 Q0 17.5 14 21 L14 ${24 + h * 0.15} Q0 ${21 + h * 0.15} -14 ${24 + h * 0.15} Z`} /><path d={`M-13 ${21 + h} Q0 ${24.5 + h} 13 ${21 + h} L13 ${24 + h} Q0 ${27 + h} -13 ${24 + h} Z`} /></g>}
    </g>
  );
}

export function Mouth({ mood, speaking, level, look }: { mood: AvatarMood; speaking: boolean; level: number; look: number }) {
  const h = speaking ? 2 + level * 16 : 0; // ovoz balandligiga qarab og'iz ochiladi
  if (mood === 'laugh') { const b = speaking ? 40 + level * 8 : 40; return <OpenMouth d={`M-19 15 Q0 19 19 15 Q16 ${b} 0 ${b} Q-16 ${b} -19 15 Z`} h={b - 18} teeth="top" />; }
  if (speaking) {
    switch (mood) {
      case 'angry': return <OpenMouth d={`M-17 21 Q0 16 17 21 L15 ${25 + h} Q0 ${29 + h} -15 ${25 + h} Z`} h={h} teeth="grit" tongue={false} />;
      case 'happy': case 'love': return <OpenMouth d={`M-15 18 Q0 22 15 18 Q12 ${30 + h} 0 ${30 + h} Q-12 ${30 + h} -15 18 Z`} h={h + 6} teeth={mood === 'happy' ? 'top' : undefined} />;
      case 'sad': return <OpenMouth d={`M-10 30 Q0 ${23 - h * 0.25} 10 30 Q6 ${33 + h * 0.6} 0 ${33 + h * 0.6} Q-6 ${33 + h * 0.6} -10 30 Z`} h={h * 0.5} tongue={false} />;
      case 'stern': return <OpenMouth d={`M-14 24 L14 24 L13 ${26 + h * 0.6} Q0 ${27 + h * 0.6} -13 ${26 + h * 0.6} Z`} h={h * 0.6} tongue={false} />;
      case 'smug': return <OpenMouth d={`M-12 26 Q2 27 14 19 Q8 ${30 + h * 0.7} -2 ${30 + h * 0.6} Q-10 ${30 + h * 0.4} -12 26 Z`} h={h * 0.6} tongue={false} />;
      default: return <OpenMouth d={`M-11 21 Q0 18 11 21 Q11 ${24 + h} 0 ${25 + h} Q-11 ${24 + h} -11 21 Z`} h={h} />;
    }
  }
  if (mood === 'happy') return <path className="av-mouth" d="M-15 19 Q0 35 15 19" />;
  if (mood === 'love') return <ellipse className="av-mouth-in" cx={0} cy={26} rx={6} ry={7} />;
  if (mood === 'angry') return <path className="av-mouth" d="M-14 32 Q0 18 14 32" />;
  if (mood === 'sad') return <path className="av-mouth av-wobble" d="M-12 31 Q-6 25 0 29 Q6 25 12 31" />;
  if (mood === 'attentive') return <ellipse className="av-mouth-in" cx={0} cy={26} rx={6} ry={4 + level * 6} />;
  if (mood === 'thinking') return <path className="av-mouth" d="M-6 26 Q4 24 12 21" />;
  if (mood === 'error') return <path className="av-mouth" d="M-12 30 Q-6 24 0 30 Q6 36 12 30" />;
  if (mood === 'smug') return <path className="av-mouth" d="M-10 25 Q2 28 13 19" />;
  if (mood === 'stern') return <path className="av-mouth" d="M-12 26 H12" />;
  return look >= 2 ? <path className="av-mouth" d="M-10 24 Q0 28 12 21" /> : <path className="av-mouth" d="M-12 20 Q0 32 12 20" />;
}

/** Hissiyot effektlari (faqat CSS): kulgi — "ha-ha", quvonch — uchqunlar, iliq maqtov — yuraklar. */
function EmotionFx({ emotion }: { emotion: CoachEmotion }) {
  if (emotion === 'laugh') return <span className="emo-fx" aria-hidden="true">{['ha', 'ha-ha', 'ha!'].map((t, i) => <i key={i} className="fx-laugh" style={{ ['--i' as string]: String(i) } as CSSProperties}>{t}</i>)}</span>;
  if (emotion === 'impressed') return <span className="emo-fx" aria-hidden="true">{[0, 1, 2, 3, 4].map((i) => <i key={i} className="fx-heart" style={{ ['--i' as string]: String(i) } as CSSProperties}>♥</i>)}</span>;
  if (emotion === 'happy') return <span className="emo-fx" aria-hidden="true">{[0, 1, 2, 3, 4, 5].map((i) => <i key={i} className="fx-spark" style={{ ['--i' as string]: String(i) } as CSSProperties}>✦</i>)}</span>;
  return null;
}
