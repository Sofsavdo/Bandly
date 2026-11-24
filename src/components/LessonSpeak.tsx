import { Mic, Square } from 'lucide-react';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { parkMic, serverSttReady, sttStatusPending, waitSttStatus } from '../lib/voiceTurn';
import { accuracy, verdict } from '../lib/shadow';
import { listenTurn, SpeechError, stopSpeaking, sttSupported } from '../lib/speech';
import { track } from '../lib/track';
import { ClipButton } from './ClipButton';
import { L } from '../i18n';

/** Speaking step: listen to each example sentence, say it, see which words were recognised.
 *  Recognition is NOT a pronunciation score and is not saved to mastery (device-dependent, unverified).
 *  Mikrofon ishonchli bo'lishi uchun: jonli ovoz ko'rsatkichi (eshitilayotganini ko'rasiz), "Tugatdim" bosilsa avtomatik aniqlash sezmagan
 *  ovoz ham yuboriladi, jim mikrofon aniq aytiladi, ikki urinishdan keyin gapni o'tkazib yuborish mumkin. */
/** onDone: har bir gap kamida bir marta aytilganda (keyingi qadam shundan keyin ochiladi). */
export function LessonSpeak({ sentences, onDone }: { sentences: string[]; onDone?: () => void }) {
  const [active, setActive] = useState<number | null>(null);
  const [interim, setInterim] = useState('');
  const [said, setSaid] = useState<Record<number, string>>({});
  const [misses, setMisses] = useState<Record<number, number>>({});
  const [err, setErr] = useState('');
  const [lvl, setLvl] = useState(0);
  const [quiet, setQuiet] = useState(false);
  const [, bump] = useState(0);
  const endRef = useRef<(() => void) | null>(null);
  const sig = useRef({ cancelled: false });
  const heard = useRef(false);
  // Server tanishi holati sahifa ochilgandan keyin keladi: kelganda qayta chizamiz (aks holda "brauzer tanimaydi" deb qotib qolardi)
  const pending = typeof window !== 'undefined' && sttStatusPending();
  const stt = typeof window !== 'undefined' && (serverSttReady() || sttSupported() || pending);
  const allSaid = sentences.every((_, i) => said[i] !== undefined);
  useEffect(() => { if (sttStatusPending()) void waitSttStatus().then(() => bump((n) => n + 1)); }, []);
  useEffect(() => { if (allSaid || !stt) onDone?.(); }, [allSaid, stt]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => { sig.current.cancelled = true; endRef.current?.(); parkMic(); }, []);

  const listen = async (i: number) => {
    if (active !== null) return;
    stopSpeaking(); setErr(''); setInterim(''); setQuiet(false); setLvl(0); setActive(i);
    heard.current = false;
    sig.current = { cancelled: false };
    // 3,5 soniyada mikrofondan ovoz kelmasa — foydalanuvchiga aytamiz (jim jimjit kutib o'tirmasin)
    const hint = setTimeout(() => { if (!heard.current) setQuiet(true); }, 3500);
    try {
      const r = await listenTurn({
        silenceMs: 1400, maxMs: 15000, noSpeechMs: 7000, lang: 'en-US', onInterim: setInterim, signal: sig.current, endRef,
        onLevel: (v) => { setLvl(v); if (v > 0.08) { heard.current = true; setQuiet(false); } },
      });
      if (!r.text.trim()) {
        setMisses((m) => ({ ...m, [i]: (m[i] ?? 0) + 1 }));
        if (r.heard === false) { track('mic_silent'); setErr(L('Mikrofondan ovoz kelmadi. Telefonni og‘izga yaqinroq tuting, mikrofon ruxsatini tekshiring va yana bosing.')); }
        else setErr(L('Gapingiz tanilmadi. Sekinroq va aniqroq ayting, yana bosing.'));
      } else setSaid((s) => ({ ...s, [i]: r.text }));
    } catch (e) {
      const code = e instanceof SpeechError ? e.code : 'unstable';
      setMisses((m) => ({ ...m, [i]: (m[i] ?? 0) + 1 }));
      setErr(code === 'denied' ? L('Mikrofonga ruxsat berilmagan. Brauzer sozlamalarida ruxsat bering.') : code === 'nomic' ? L('Mikrofon topilmadi.') : code === 'network' ? L('Nutqni tanish xizmati bilan aloqa yo‘q.') : L('Nutqni tanib bo‘lmadi, qayta urinib ko‘ring.'));
    } finally { clearTimeout(hint); setActive(null); setInterim(''); setQuiet(false); setLvl(0); }
  };

  if (!stt) {
    return <p className="muted">{L('Brauzer nutqni tanimaydi — Chrome yoki Edge’da oching.')}</p>;
  }
  return (
    <div>
      <p className="muted">{L('Eshiting, so‘ng mikrofonni bosib ayting.')}</p>
      {sentences.map((s, i) => {
        if (i > 0 && said[i - 1] === undefined) return null; // ketma-ket: oldingi gap aytilmaguncha keyingisi ko'rinmaydi
        const skipped = said[i] === '';
        const res = said[i] !== undefined && !skipped ? accuracy(s, said[i]!) : null;
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
            {active !== i && said[i] === undefined && (misses[i] ?? 0) >= 2 && (
              <button type="button" className="btn sm" style={{ marginLeft: 8 }} disabled={active !== null} onClick={() => { setErr(''); setSaid((x) => ({ ...x, [i]: '' })); }}>{L('O‘tkazib yuborish')}</button>
            )}
            {active === i && (
              <div className="mic-live" role="status">
                <span className="mic-meter" aria-hidden="true" style={{ '--lvl': lvl } as CSSProperties}><i /></span>
                <span className="muted">{L('Tinglayapman…')} {interim}</span>
                {quiet && <p className="bad">{L('Ovoz kelmayapti. Telefonni og‘izga yaqinroq tuting yoki mikrofon ruxsatini tekshiring.')}</p>}
              </div>
            )}
            {skipped && <p className="muted" style={{ marginTop: 6 }}>{L('O‘tkazib yuborildi')}</p>}
            {res && v && (
              <p style={{ marginTop: 6 }}>
                <span className={v.tone === 'no' ? 'bad' : 'ok'}>{v.label} · {res.pct}%</span>
                <span className="muted">  {L('— tanildi: “')}{said[i] || '…'}”{res.missing.length ? L(' · tushib qolgan/boshqacha: {0}', [res.missing.join(', ')]) : ''}</span>
              </p>
            )}
          </div>
        );
      })}
      {err && <p className="bad" role="alert">{err}</p>}
    </div>
  );
}
