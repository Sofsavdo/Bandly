// Ustoz sozlamalari: ovoz (erkak/ayol), xarakter va bolalar rejimi.
// Egasi (2026-11-26): ustoz 2 ta — erkak va ayol; romantik (erkalaydigan) xarakter; bolalar uchun alohida xarakter —
// "5 yoshli qizim jallod bilan gaplashsa so'kadigan bo'lib qolyapti". Bolalar rejimi ota-ona PIN kodi bilan qulflanadi:
// yoqilganda faqat bolalar xarakteri ishlaydi, 18+ xarakterlar yopiq, o'chirish uchun PIN kerak.
import { useState } from 'react';
import { Baby, Heart, Lock } from 'lucide-react';
import { LEVELS } from '../content/roasts';
import { setPersona, setKidsMode, setTutorChoice, setTutorVoice, useProfile } from '../lib/store';
import { L } from '../i18n';

export function PersonaPicker() {
  const p = useProfile();
  const [pin, setPin] = useState(''); const [pinOpen, setPinOpen] = useState(false); const [msg, setMsg] = useState('');
  const voice = p.tutorVoice ?? 'male';
  const kids = !!p.kidsMode;
  const cur: number | 'romantic' | 'kids' = kids ? 'kids' : p.tutorExtra ?? p.roastLevel;
  const opts: { id: number | 'romantic' | 'kids'; name: string; desc: string; adult: boolean; icon?: JSX.Element }[] = [
    ...LEVELS.map((lv) => ({ id: lv.id as number, name: lv.name, desc: lv.desc, adult: lv.id >= 2 })),
    { id: 'romantic', name: L('Romantik (18+)'), desc: L('Mehribon, erkalaydi va maqtaydi — xatoni yumshoq tuzatadi'), adult: true, icon: <Heart size={14} /> },
    { id: 'kids', name: L('Bolalar uchun'), desc: L('4–10 yosh: o‘yin, qo‘shiq va oddiy so‘zlar; so‘kish va kesatish umuman yo‘q'), adult: false, icon: <Baby size={14} /> },
  ];
  const applyPin = () => {
    if (!/^\d{4}$/.test(pin)) { setMsg(L('PIN kod 4 ta raqam bo‘lsin')); return; }
    const ok = setKidsMode(!kids, pin);
    setMsg(ok ? (kids ? L('Bolalar rejimi o‘chirildi') : L('Bolalar rejimi yoqildi — o‘chirish uchun shu PIN kerak bo‘ladi')) : L('PIN kod noto‘g‘ri'));
    if (ok) { setPin(''); setPinOpen(false); }
  };
  return (
    <div className="persona-picker">
      <h4 className="list-h">{L('Ustoz ovozi')}</h4>
      <div className="seg" role="group" aria-label={L('Ustoz ovozi')}>
        {([['male', L('Erkak ustoz')], ['female', L('Ayol ustoz')]] as const).map(([v, t]) => (
          <button key={v} type="button" className={`btn sm${voice === v ? ' primary' : ''}`} aria-pressed={voice === v} onClick={() => setTutorVoice(v)}>{t}</button>
        ))}
      </div>

      <h4 className="list-h">{L('Xarakter')}</h4>
      {kids && <p className="evidence"><Lock size={14} /> {L('Bolalar rejimi yoqilgan: faqat bolalar xarakteri ishlaydi.')}</p>}
      <div className="opts" style={{ marginTop: 0 }}>
        {opts.map((o) => {
          const locked = kids ? o.id !== 'kids' : o.adult && !p.adult;
          const on = cur === o.id && !locked;
          return (
            <button key={String(o.id)} type="button" className={`opt ${on ? 'sel' : ''}`} disabled={locked} aria-pressed={on}
              onClick={() => (typeof o.id === 'number' ? setPersona(o.id, p.adult) : setTutorChoice(o.id))}>
              <b>{o.icon} {o.name}</b><div className="evidence">{o.desc}</div>
            </button>
          );
        })}
      </div>
      {!kids && (
        <p style={{ marginTop: 14 }}><label><input type="checkbox" checked={p.adult} onChange={(e) => {
          const adult = e.target.checked;
          if (!adult && p.tutorExtra === 'romantic') setTutorChoice(0, false); else setPersona(adult ? p.roastLevel : Math.min(p.roastLevel, 1), adult);
        }} />  {L('Men 18 yoshdan oshganman va qattiq yoki romantik xarakterni o‘zim xohlayman')}</label></p>
      )}
      <p className="evidence">{L('Qattiq rejimlar (18+): ustoz xatolaringiz ustidan kuladi, shaxsiyatga tegmaydi.')}</p>

      <div className="kids-box">
        <h4 className="list-h"><Baby size={16} /> {L('Bolalar rejimi')}</h4>
        <p className="muted" style={{ marginTop: 0 }}>{kids ? L('Yoqilgan. O‘chirish uchun ota-ona PIN kodini kiriting.') : L('Farzandingiz foydalansa yoqing: ustoz faqat bolalar xarakterida gaplashadi, 18+ xarakterlar yopiladi. 4 xonali PIN kod qo‘yasiz — usiz o‘chirib bo‘lmaydi.')}</p>
        {pinOpen ? (
          <div className="row">
            <input className="input" type="password" inputMode="numeric" maxLength={4} autoComplete="off" value={pin} placeholder={L('4 xonali PIN')} aria-label={L('PIN kod')} onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))} />
            <button type="button" className="btn primary sm" onClick={applyPin}>{kids ? L('O‘chirish') : L('Yoqish')}</button>
            <button type="button" className="btn sm" onClick={() => { setPinOpen(false); setPin(''); setMsg(''); }}>{L('Bekor qilish')}</button>
          </div>
        ) : (
          <button type="button" className="btn sm" onClick={() => { setPinOpen(true); setMsg(''); }}>{kids ? L('Bolalar rejimini o‘chirish') : L('Bolalar rejimini yoqish')}</button>
        )}
        {msg && <p className="evidence" role="status">{msg}</p>}
      </div>
    </div>
  );
}
