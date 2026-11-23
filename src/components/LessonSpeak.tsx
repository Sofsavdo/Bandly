import { Mic, Square } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { serverSttReady } from '../lib/voiceTurn';
import { accuracy, verdict } from '../lib/shadow';
import { listenTurn, SpeechError, stopSpeaking, sttSupported } from '../lib/speech';
import { ClipButton } from './ClipButton';
import { L } from '../i18n';

/** Speaking step: listen to each example sentence, say it, see which words were recognised.
 *  Browser speech recognition is used; it is NOT a pronunciation score and is not saved to mastery (device-dependent, unverified). */
/** onDone: har bir gap kamida bir marta aytilganda (keyingi qadam shundan keyin ochiladi). */
export function LessonSpeak({ sentences, onDone }: { sentences: string[]; onDone?: () => void }) {
  const [active, setActive] = useState<number | null>(null);
  const [interim, setInterim] = useState('');
  const [said, setSaid] = useState<Record<number, string>>({});
  const [err, setErr] = useState('');
  const endRef = useRef<(() => void) | null>(null);
  const sig = useRef({ cancelled: false });
  const stt = typeof window !== 'undefined' && (serverSttReady() || sttSupported());
  const allSaid = sentences.every((_, i) => said[i] !== undefined);
  useEffect(() => { if (allSaid || !stt) onDone?.(); }, [allSaid, stt]); // eslint-disable-line react-hooks/exhaustive-deps

  const listen = async (i: number) => {
    if (active !== null) return;
    stopSpeaking(); setErr(''); setInterim(''); setActive(i);
    sig.current = { cancelled: false };
    try {
      const r = await listenTurn({ silenceMs: 1400, maxMs: 15000, noSpeechMs: 7000, lang: 'en-US', onInterim: setInterim, signal: sig.current, endRef });
      setSaid((s) => ({ ...s, [i]: r.text }));
    } catch (e) {
      const code = e instanceof SpeechError ? e.code : 'unstable';
      setErr(code === 'denied' ? L('Mikrofonga ruxsat berilmagan. Brauzer sozlamalarida ruxsat bering.') : code === 'nomic' ? L('Mikrofon topilmadi.') : code === 'network' ? L('Nutqni tanish xizmati bilan aloqa yo‘q.') : L('Nutqni tanib bo‘lmadi, qayta urinib ko‘ring.'));
    } finally { setActive(null); setInterim(''); }
  };

  if (!stt) {
    return <p className="muted">{L('Brauzer nutqni tanimaydi — Chrome yoki Edge’da oching.')}</p>;
  }
  return (
    <div>
      <p className="muted">{L('Eshiting, so‘ng mikrofonni bosib ayting.')}</p>
      {sentences.map((s, i) => {
        if (i > 0 && said[i - 1] === undefined) return null; // ketma-ket: oldingi gap aytilmaguncha keyingisi ko'rinmaydi
        const res = said[i] !== undefined ? accuracy(s, said[i]!) : null;
        const v = res ? verdict(res.pct) : null;
        return (
          <div key={s} className="q">
            <p className="row">
              <ClipButton className="btn sm" text={s} size={14} />
              <b>{s}</b>
            </p>
            {active === i
              ? <button type="button" className="btn sm primary" onClick={() => endRef.current?.()}><Square size={14} />  {L('Tugatdim')}</button>
              : <button type="button" className="btn sm" disabled={active !== null} onClick={() => void listen(i)}><Mic size={14} />  {L('Aytish')}</button>}
            {active === i && <p className="muted">{L('Tinglayapman…')} {interim}</p>}
            {res && v && (
              <p style={{ marginTop: 6 }}>
                <span className={v.tone === 'no' ? 'bad' : 'ok'}>{v.label} · {res.pct}%</span>
                <span className="muted">  {L('— tanildi: “')}{said[i] || '…'}”{res.missing.length ? L(' · tushib qolgan/boshqacha: {0}', [res.missing.join(', ')]) : ''}</span>
              </p>
            )}
          </div>
        );
      })}
      {err && <p className="bad">{err}</p>}
    </div>
  );
}
