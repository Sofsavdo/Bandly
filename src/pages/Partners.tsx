// Hamkorlik: blogerlar, o'qituvchilar va ijtimoiy tarmog'i bor o'quvchilar uchun ommaviy sahifa (mehmon ham ochadi).
// Mukofot summalari faqat admin yoqqan qoidalardan (server/partners.ts publicTerms) — sahifa o'zi hech narsa va'da qilmaydi.
import { useEffect, useState } from 'react';
import { ArrowRight, Check, Megaphone, Send, Users, Video } from 'lucide-react';
import { getAccount } from '../lib/account';
import { fmtSum } from '../lib/pay';
import { InviteCard } from '../components/InviteCard';
import { L } from '../i18n';

interface Terms { rules: { kind: string; pct: number | null; som: number | null; holdDays: number }[]; invite: { xp: number; days: number } }
type Kind = 'blogger' | 'teacher' | 'learner';

function ruleText(r: Terms['rules'][number]): string | null {
  if (r.kind === 'paid_pct' && r.pct) return L('Siz orqali kelgan o‘quvchining har bir obuna to‘lovidan {0}%', [r.pct]);
  if (r.kind === 'first_paid_flat' && r.som) return L('Siz orqali kelib birinchi obunani olgan har bir o‘quvchi uchun {0} so‘m', [fmtSum(r.som)]);
  if (r.kind === 'activated_flat' && r.som) return L('Siz orqali kelib darsni boshlagan har bir o‘quvchi uchun {0} so‘m', [fmtSum(r.som)]);
  if (r.kind === 'verified_views_per_1k' && r.som) return L('Sellzen haqidagi videongizning har 1000 ta tasdiqlangan ko‘rishi uchun {0} so‘m', [fmtSum(r.som)]);
  return null;
}

export default function Partners() {
  const acc = getAccount();
  const [terms, setTerms] = useState<Terms | null>(null);
  const [kind, setKind] = useState<Kind>('blogger');
  const [f, setF] = useState({ name: '', link: '', audience: '', contact: '', note: '' });
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [sent, setSent] = useState(false);
  useEffect(() => { void fetch('/api/partners/terms').then((r) => (r.ok ? r.json() : null)).then(setTerms).catch(() => undefined); }, []);
  const rules = (terms?.rules ?? []).map(ruleText).filter((x): x is string => !!x);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(''); setBusy(true);
    try {
      const r = await fetch('/api/partners/apply', { method: 'POST', headers: { 'content-type': 'application/json', ...(acc ? { 'x-token': acc.token } : {}) }, body: JSON.stringify({ kind, ...f, consent }) });
      const j = await r.json().catch(() => ({})) as { error?: string };
      if (!r.ok) throw new Error(j.error || L('Yuborib bo‘lmadi — qayta urinib ko‘ring.'));
      setSent(true);
    } catch (x) { setErr((x as Error).message); } finally { setBusy(false); }
  };
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  return (
    <div className="partners">
      <section className="w-hero partners-hero">
        <div>
          <span className="eyebrow"><Megaphone size={15} />  {L('Hamkorlik')}</span>
          <h1>{L('Sellzen haqida gapiring — daromad oling')}</h1>
          <p className="lead">{L('Blogerlar, o‘qituvchilar va ijtimoiy tarmog‘i bor o‘quvchilar uchun: shaxsiy havola, tayyor materiallar va har bir kelgan o‘quvchi kabinetingizda ko‘rinadi.')}</p>
          <a className="btn primary lg" href="#partner-form">{L('Ariza qoldirish')} <ArrowRight size={18} /></a>
        </div>
      </section>

      <div className="section-title"><h2>{L('Kimlar uchun?')}</h2></div>
      <div className="partner-who">
        <div className="card"><Video size={22} /><h3>{L('Blogerlar')}</h3><p>{L('Instagram, TikTok, YouTube yoki Telegram’da ingliz tili, ta’lim yoki talabalar hayoti haqida kontent qilasiz.')}</p></div>
        <div className="card"><Users size={22} /><h3>{L('O‘qituvchilar va o‘quv markazlar')}</h3><p>{L('O‘quvchilaringizga Sellzen’ni tavsiya qilasiz yoki guruhingiz bilan birga ishlatasiz.')}</p></div>
        <div className="card"><Send size={22} /><h3>{L('Faol o‘quvchilar')}</h3><p>{L('Sellzen’da o‘qiyapsiz va natijangizni do‘stlaringiz yoki obunachilaringiz bilan ulashmoqchisiz.')}</p></div>
      </div>

      <div className="section-title"><h2>{L('Qanday ishlaydi?')}</h2></div>
      <ol className="how-steps">
        <li><b>1</b><div><h3>{L('Ariza qoldirasiz')}</h3><p>{L('Sahifangiz havolasi va aloqa ma’lumotingiz — 1 daqiqa.')}</p></div></li>
        <li><b>2</b><div><h3>{L('Biz bog‘lanamiz')}</h3><p>{L('Arizani ko‘rib chiqamiz va hamkor kabinetini ochib beramiz.')}</p></div></li>
        <li><b>3</b><div><h3>{L('Ulashasiz va kuzatasiz')}</h3><p>{L('Har bir video yoki post uchun alohida havola. Kim kelgani, kim obuna bo‘lgani va mukofotingiz kabinetda ko‘rinadi.')}</p></div></li>
      </ol>

      <div className="section-title"><h2>{L('Mukofot')}</h2></div>
      <section className="card partner-terms">
        {rules.length > 0
          ? <ul>{rules.map((t) => <li key={t}><Check size={16} />{t}</li>)}</ul>
          : <p>{L('Mukofot shartlari auditoriyangiz va formatga qarab ariza ko‘rib chiqilgach siz bilan kelishiladi.')}</p>}
        {terms && terms.invite.days > 0 && <p className="muted">{L('Do‘stingizni taklif qilsangiz: u darsni boshlaganda ikkalangiz ham {0} kunlik All Access olasiz.', [terms.invite.days])}</p>}
        <p className="muted">{L('Mukofot faqat haqiqiy o‘quvchilar va tasdiqlangan to‘lovlar uchun hisoblanadi. Qaytarilgan to‘lovlar ayriladi.')}</p>
      </section>

      {acc && <InviteCard />}

      <div className="section-title" id="partner-form"><h2>{L('Ariza')}</h2></div>
      <section className="card partner-form">
        {sent ? (
          <div className="partner-sent" role="status"><Check size={22} /><h3>{L('Arizangiz qabul qilindi')}</h3><p>{L('Ko‘rsatgan aloqangiz orqali bog‘lanamiz.')}</p></div>
        ) : (
          <form onSubmit={(e) => void submit(e)}>
            <div className="seg" role="group" aria-label={L('Kim siz?')}>
              {([['blogger', L('Bloger')], ['teacher', L('O‘qituvchi')], ['learner', L('O‘quvchi')]] as const).map(([k, t]) => (
                <button key={k} type="button" className={`btn sm${kind === k ? ' primary' : ''}`} aria-pressed={kind === k} onClick={() => setKind(k)}>{t}</button>
              ))}
            </div>
            <label>{L('Ismingiz')}<input required maxLength={60} value={f.name} onChange={set('name')} autoComplete="name" /></label>
            <label>{L('Sahifangiz yoki kanalingiz')}<input required maxLength={200} value={f.link} onChange={set('link')} placeholder={L('instagram.com/… yoki @kanal')} /></label>
            <label>{L('Obunachilar soni')}
              <select required value={f.audience} onChange={set('audience')}>
                <option value="" disabled>{L('Tanlang')}</option>
                <option value="<1k">{L('1 000 gacha')}</option>
                <option value="1k-10k">{'1 000 – 10 000'}</option>
                <option value="10k-100k">{'10 000 – 100 000'}</option>
                <option value="100k+">{L('100 000 dan ko‘p')}</option>
              </select>
            </label>
            <label>{L('Telegram yoki telefon')}<input required maxLength={60} value={f.contact} onChange={set('contact')} placeholder={L('@username yoki +998 90 123 45 67')} inputMode="text" /></label>
            <label>{L('Izoh (ixtiyoriy)')}<textarea maxLength={500} rows={3} value={f.note} onChange={set('note')} placeholder={L('Qanday kontent qilasiz, qaysi auditoriya')} /></label>
            <label className="check"><input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} /> {L('Ma’lumotlarimni hamkorlik bo‘yicha bog‘lanish uchun ishlatishga roziman')}</label>
            {err && <p className="notice" role="alert">{err}</p>}
            <button className="btn primary lg" type="submit" disabled={busy || !consent}>{busy ? L('Yuborilmoqda…') : L('Ariza yuborish')}</button>
          </form>
        )}
      </section>
    </div>
  );
}
