import { Pause, Play, RotateCcw, Volume2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { MockTest, type ExamLeftState } from '../components/MockTest';
import type { ListeningTest } from '../content/types';
import { listeningTrack } from '../lib/clips';
import { LISTENING_TABLE } from '../lib/band';
import { bestVoice } from '../lib/speech';

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

function Transcript({ test }: { test: ListeningTest }) {
  return (
    <>
      {test.script.map((l, i) => <p key={i}><b>{l.speaker === 'A' ? test.names.A : test.names.B}:</b> {l.text}</p>)}
    </>
  );
}

/** Tayyor neyron ovozli audio (public/audio/listening). Imtihon rejimida faqat bir marta. */
function FilePlayer({ file, seconds, practice, initialPlays = 0, onPlay }: { file: string; seconds: number; practice: boolean; initialPlays?: number; onPlay?: () => void }) {
  const ref = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [pos, setPos] = useState(0);
  const [plays, setPlays] = useState(initialPlays);
  const locked = !practice && plays >= 1 && !playing;

  useEffect(() => () => { ref.current?.pause(); }, []);
  const toggle = () => {
    if (!ref.current) {
      const a = new Audio(file);
      a.ontimeupdate = () => setPos(a.currentTime);
      a.onended = () => { setPlaying(false); setPos(0); ref.current = null; };
      a.onerror = () => { setPlaying(false); ref.current = null; };
      ref.current = a;
      setPlays((n) => n + 1);
      onPlay?.();
    }
    const a = ref.current;
    if (a.paused) { void a.play(); setPlaying(true); } else if (practice) { a.pause(); setPlaying(false); }
  };
  const restart = () => { ref.current?.pause(); ref.current = null; setPos(0); setPlaying(false); toggle(); };
  const total = seconds || 1;
  return (
    <div>
      <div className="row">
        <button className="btn primary" onClick={toggle} disabled={locked || (playing && !practice)}>
          {playing ? <><Pause size={18} /> {practice ? 'Pauza' : 'Eshittirilmoqda…'}</> : <><Play size={18} /> {plays === 0 ? 'Audioni boshlash' : 'Davom ettirish'}</>}
        </button>
        {practice && plays > 0 && <button className="btn" onClick={restart}><RotateCcw size={16} /> Boshidan</button>}
        <span className="pill">{mmss(pos)} / {mmss(total)}</span>
      </div>
      <div className="audio-bar" style={{ marginTop: 12 }}><i style={{ width: `${Math.min(100, (pos / total) * 100)}%`, transition: 'width .25s linear' }} /></div>
    </div>
  );
}

/** Zaxira: audio fayl bo'lmasa brauzer ovozi (sifati qurilmaga bog'liq). */
function BrowserPlayer({ test, practice }: { test: ListeningTest; practice: boolean }) {
  const [playing, setPlaying] = useState(false);
  const [plays, setPlays] = useState(0);
  const supported = 'speechSynthesis' in window;
  useEffect(() => () => window.speechSynthesis?.cancel(), []);
  const locked = !practice && plays >= 1 && !playing;
  const play = () => {
    const synth = window.speechSynthesis;
    synth.cancel(); setPlaying(true); setPlays((n) => n + 1);
    const vA = bestVoice('en'); const vB = synth.getVoices().filter((v) => v.lang.toLowerCase().startsWith('en') && v !== vA)[0] ?? vA;
    test.script.forEach((line, i, arr) => {
      const u = new SpeechSynthesisUtterance(line.text);
      const v = line.speaker === 'A' ? vA : vB;
      if (v) { u.voice = v; u.lang = v.lang; } else u.lang = 'en-GB';
      u.rate = 0.92; u.pitch = line.speaker === 'A' ? 1.1 : 0.85;
      if (i === arr.length - 1) u.onend = () => setPlaying(false);
      u.onerror = () => setPlaying(false);
      synth.speak(u);
    });
  };
  return (
    <div>
      <p className="notice">Tayyor audio topilmadi: brauzer ovozi ishlatiladi, sifati qurilmaga bog‘liq.</p>
      {!supported && <p className="notice">Brauzeringiz ovoz sintezini qo‘llamaydi. Transkriptdan foydalaning.</p>}
      <button className="btn primary" onClick={play} disabled={playing || locked || !supported}><Play size={18} /> {plays === 0 ? 'Audioni boshlash' : 'Qayta eshitish'}</button>
    </div>
  );
}

function Player({ test, state }: { test: ListeningTest; state: ExamLeftState }) {
  const { submitted, attempt } = state;
  const [track, setTrack] = useState<{ file: string; seconds: number } | null | undefined>(undefined);
  const [practice, setPractice] = useState(false);
  useEffect(() => { void listeningTrack(test.id).then(setTrack); }, [test.id]);
  // Imtihon rejimida audio bir marta: necha marta boshlangani urinishga yoziladi (sahifa yangilansa ham saqlanadi).
  const playedBefore = attempt?.audioPlays ?? 0;
  return (
    <div>
      <p><b>{test.context}</b></p>
      {!practice && !submitted && playedBefore > 0 && <p className="notice">Audio allaqachon eshittirilgan. Imtihon qoidasi bo‘yicha qayta eshittirilmaydi — savollarga javob berishni davom ettiring.</p>}
      {track === undefined ? <p className="muted">Audio yuklanmoqda…</p> : track ? <FilePlayer key={practice ? 'p' : 'e'} file={track.file} seconds={track.seconds} practice={practice} initialPlays={practice ? 0 : playedBefore} onPlay={() => { if (!practice) state.update((a) => ({ ...a, audioPlays: a.audioPlays + 1 })); }} /> : <BrowserPlayer test={test} practice={practice} />}
      <p style={{ marginTop: 14 }}><label><input type="checkbox" checked={practice} onChange={(e) => setPractice(e.target.checked)} /> Mashq rejimi (pauza va qayta eshitish)</label></p>
      <p className="evidence">Imtihon rejimida audio faqat bir marta eshittiriladi.</p>
      {(submitted || practice) && <details open={submitted}><summary>Transkript</summary><Transcript test={test} /></details>}
    </div>
  );
}

/** Qurilma tekshiruvi: boshlashdan oldin qisqa ovoz (REAL_EXAM_EXPERIENCE_SPEC.md §3, Device check). */
function SoundCheck() {
  const [heard, setHeard] = useState(false);
  const beep = () => {
    try {
      const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return;
      const ctx = new Ctx(); const o = ctx.createOscillator(); const g = ctx.createGain();
      o.frequency.value = 660; g.gain.value = 0.08; o.connect(g); g.connect(ctx.destination);
      o.start(); o.stop(ctx.currentTime + 0.6); o.onended = () => { void ctx.close(); };
      setHeard(true);
    } catch { /* ovoz chiqmadi */ }
  };
  return (
    <p className="row">
      <button type="button" className="btn sm" onClick={beep}><Volume2 size={15} /> Ovozni tekshirish</button>
      {heard && <span className="muted" style={{ fontSize: 13 }}>Ovoz eshitildimi? Eshitilmasa, naushnik yoki ovoz balandligini tekshiring.</span>}
    </p>
  );
}

export default function Listening({ test: t }: { test: ListeningTest }) {
  return (
    <MockTest
      key={t.id}
      kind="listening"
      title={t.title}
      level={t.level}
      minutes={t.minutes}
      groups={t.groups}
      questions={t.questions}
      table={LISTENING_TABLE}
      testId={t.id}
      intro={<><p>Audioni tinglab {t.questions.length} ta savolga javob bering. Audio tabiiy ovozda yozilgan va imtihon qoidasi bo‘yicha bir marta eshittiriladi (mashq rejimida pauza va qayta eshitish mumkin).</p><SoundCheck /></>}
      left={(state) => <Player test={t} state={state} />}
    />
  );
}
