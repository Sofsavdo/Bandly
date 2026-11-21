// Sellzen ustozning ovozli qo'ng'iroqdagi belgisi: brend belgisi + holat halqasi (tinglash — mikrofon darajasi bilan kengayadi,
// o'ylash — aylanadi, gapirish — pulsatsiya, xato — qizg'ish). Tutor xarakterlari va mantiqi o'zgarmaydi — faqat ko'rinish.
import type { CSSProperties } from 'react';
import type { CoachEmotion } from '../content/personas';
import { LogoMark } from './Logo';
import { L } from '../i18n';

export type AiPhase = 'idle' | 'listening' | 'thinking' | 'speaking' | 'error';
const TONE: Partial<Record<CoachEmotion, string>> = { happy: '#2DD4BF', laugh: '#5EEAD4', impressed: '#99F6E4', angry: '#FB7185', disappointed: '#94A3B8', serious: '#38BDF8', sarcastic: '#A5B4FC' };

export function AiAvatar({ phase, emotion = 'neutral', level = 0, size = 200 }: { phase: AiPhase; emotion?: CoachEmotion; level?: number; size?: number }) {
  const ring = phase === 'error' ? '#FB7185' : phase === 'listening' ? '#38BDF8' : phase === 'thinking' ? '#A5B4FC' : TONE[emotion] ?? '#2DD4BF';
  const style = { width: size, height: size, ['--ring' as string]: ring, ['--lvl' as string]: String(Math.min(1, Math.max(0, level))) } as CSSProperties;
  return (
    <span className={`ai-avatar ${phase} emo-${emotion}`} style={style} role="img" aria-label={L('Sellzen')}>
      <span className="ai-ring" />
      <EmotionFx emotion={emotion} />
      <LogoMark size={Math.round(size * 0.62)} tile />
    </span>
  );
}

/** Hissiyot effektlari (faqat CSS): jahl — olov tillari, kulgi — "ha-ha", quvonch — uchqunlar, hafsala — tomchilar. */
function EmotionFx({ emotion }: { emotion: CoachEmotion }) {
  // Jahl: olovsiz — faqat qizil nur va qizarish (CSS .emo-angry)
  if (emotion === 'laugh') return <span className="emo-fx" aria-hidden="true">{['ha', 'ha-ha', 'ha!'].map((t, i) => <i key={i} className="fx-laugh" style={{ ['--i' as string]: String(i) } as CSSProperties}>{t}</i>)}</span>;
  if (emotion === 'happy' || emotion === 'impressed') return <span className="emo-fx" aria-hidden="true">{[0, 1, 2, 3, 4, 5].map((i) => <i key={i} className="fx-spark" style={{ ['--i' as string]: String(i) } as CSSProperties}>✦</i>)}</span>;
  if (emotion === 'disappointed') return <span className="emo-fx" aria-hidden="true">{[0, 1, 2].map((i) => <i key={i} className="fx-drop" style={{ ['--i' as string]: String(i) } as CSSProperties} />)}</span>;
  return null;
}
