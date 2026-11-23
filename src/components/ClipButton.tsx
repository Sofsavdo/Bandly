import { Volume2 } from 'lucide-react';
import { say, stopSpeaking } from '../lib/speech';
import { useClip } from '../lib/useClip';
import { L } from '../i18n';

/** «Eshitish» tugmasi: faqat shu matn uchun ElevenLabs audiosi bor bo'lsa ko'rinadi (aks holda bosilganda jim qolardi).
 *  Tekshirilayotganda joyi saqlanadi (ko'rinmas), shuning uchun sahifa «sakramaydi». */
export function ClipButton({ text, audio, className = 'icon-btn', size = 16, children }: { text: string; audio?: string; className?: string; size?: number; children?: React.ReactNode }) {
  const ok = useClip(text, audio);
  if (ok === false) return null;
  return (
    <button type="button" className={className} aria-label={L('Eshitish: {0}', [text])} tabIndex={ok ? 0 : -1} style={ok ? undefined : { visibility: 'hidden' }}
      onClick={() => { stopSpeaking(); if (audio) void new Audio(audio).play().catch(() => undefined); else void say(text, { cancelled: false }); }}>
      <Volume2 size={size} />{children}
    </button>
  );
}
