// Ustoz sahifasining birinchi ekrani (egasi, 2026-11-26): "xarakter va erkak/ayolni tanlash profil ichida, ko'rimsiz joyda — qidirib topish mushkul.
// Kichik yozuvlar va emojilar bilan ustoz birinchi sahifasiga qo'yaylik, tanlab turib Boshlash tugmasini bosganda suhbat boshlansin".
// Tanlov profil bilan bir xil holatda saqlanadi (store); bolalar rejimi yoqilgan bo'lsa faqat bolalar xarakteri ochiq.
import { useState } from 'react';
import { ArrowRight, Lock } from 'lucide-react';
import { setPersona, setTutorChoice, setTutorVoice, useProfile } from '../lib/store';
import { L } from '../i18n';

type Choice = 0 | 1 | 2 | 3 | 'romantic' | 'kids';
interface Card { id: Choice; emoji: string; name: string; desc: string; adult: boolean }
const CARDS = (): Card[] => [
  { id: 0, emoji: '😊', name: L('Yumshoq'), desc: L('Sabrli, muloyim tuzatadi'), adult: false },
  { id: 1, emoji: '😄', name: L('Hazil'), desc: L('Kuladi, kesatadi — toza tilda'), adult: false },
  { id: 'kids', emoji: '🧸', name: L('Bolalar uchun'), desc: L('4–10 yosh, o‘yin va qo‘shiq'), adult: false },
  { id: 'romantic', emoji: '💕', name: L('Romantik'), desc: L('Erkalaydi va maqtaydi'), adult: true },
  { id: 2, emoji: '😤', name: L('Qattiq'), desc: L('Yengil so‘kish, talabchan'), adult: true },
  { id: 3, emoji: '👹', name: L('Jallod'), desc: L('Qattiq so‘kish, dramatik g‘azab'), adult: true },
];

export function TutorSetup({ onStart, disabled, extra }: { onStart: () => void; disabled: boolean; extra?: React.ReactNode }) {
  const p = useProfile();
  const kids = !!p.kidsMode;
  const voice = p.tutorVoice ?? 'male';
  const cur: Choice = kids ? 'kids' : (p.tutorExtra ?? (Math.max(0, Math.min(3, p.roastLevel)) as 0 | 1 | 2 | 3));
  const [ask18, setAsk18] = useState<Choice | null>(null);
  const pick = (c: Card) => {
    if (kids) return;
    if (c.adult && !p.adult) { setAsk18(c.id); return; }
    setAsk18(null);
    if (typeof c.id === 'number') setPersona(c.id, p.adult); else setTutorChoice(c.id);
  };
  const confirm18 = () => {
    const c = ask18; setAsk18(null);
    if (c === null) return;
    if (typeof c === 'number') setPersona(c, true); else setTutorChoice(c, true);
  };
  return (
    <div className="tsetup">
      <h3 className="tsetup-h">{L('Ustoz')}</h3>
      <div className="tsetup-voices" role="group" aria-label={L('Ustoz ovozi')}>
        {([['male', '👨‍🏫', L('Erkak ustoz')], ['female', '👩‍🏫', L('Ayol ustoz')]] as const).map(([v, e, t]) => (
          <button key={v} type="button" className={`tsetup-voice${voice === v ? ' on' : ''}`} aria-pressed={voice === v} onClick={() => setTutorVoice(v)}>
            <span className="tsetup-emoji" aria-hidden="true">{e}</span><b>{t}</b>
          </button>
        ))}
      </div>
      <h3 className="tsetup-h">{L('Xarakter')}</h3>
      {kids && <p className="tsetup-note"><Lock size={13} /> {L('Bolalar rejimi yoqilgan: faqat bolalar xarakteri.')}</p>}
      <div className="tsetup-grid">
        {CARDS().map((c) => {
          const locked = kids ? c.id !== 'kids' : c.adult && !p.adult;
          const on = cur === c.id;
          return (
            <button key={String(c.id)} type="button" className={`tsetup-card${on ? ' on' : ''}${locked ? ' locked' : ''}`} aria-pressed={on} disabled={kids && c.id !== 'kids'} onClick={() => pick(c)}>
              <span className="tsetup-emoji" aria-hidden="true">{c.emoji}</span>
              <b>{c.name}{c.adult && <small> 18+</small>}</b>
              <span>{c.desc}</span>
              {locked && !kids && <Lock className="tsetup-lock" size={12} aria-hidden="true" />}
            </button>
          );
        })}
      </div>
      {ask18 !== null && (
        <div className="tsetup-18" role="dialog" aria-label={L('18 yosh tasdig‘i')}>
          <p>{L('Bu xarakter faqat kattalar uchun. 18 yoshdan oshganmisiz?')}</p>
          <div className="row"><button type="button" className="btn primary sm" onClick={confirm18}>{L('Ha, 18 yoshdan oshganman')}</button><button type="button" className="btn sm" onClick={() => setAsk18(null)}>{L('Yo‘q')}</button></div>
        </div>
      )}
      {extra}
      <button type="button" className="btn primary lg block tsetup-start" disabled={disabled} onClick={onStart}>{L('Suhbatni boshlash')} <ArrowRight size={18} /></button>
      <a className="tsetup-more" href="#/profile">{L('Bolalar rejimi (PIN bilan) — profilda')}</a>
    </div>
  );
}
