// Hamkorlik: blogerlar, o'qituvchilar va ijtimoiy tarmog'i bor o'quvchilar uchun ommaviy sahifa (mehmon ham ochadi).
// Egasi (2026-11-26): "ko'p qismlar tushunarsiz va murakkab" — sahifa soddalashtirildi: bitta jadval, egasining 3 ta misoli, 4 ta qisqa shart.
// Summalar va normalar serverdan (admin tahrirlaydi: server/videoPay.ts) — sahifada qattiq yozilgan summa yo'q.
import { useEffect, useState } from 'react';
import { ArrowRight, Check, Megaphone } from 'lucide-react';
import { getAccount } from '../lib/account';
import { fmtSum } from '../lib/pay';
import { L } from '../i18n';

interface Tier { min: number; som: number }
interface VideoTerms { baseSom: number; windowDays: number; payDays: number; viewTiers: Tier[]; learnerTiers: Tier[]; instagram: string }
interface Terms { rules: { kind: string; pct: number | null; som: number | null; holdDays: number }[]; invite: { xp: number; days: number }; video: VideoTerms | null }
type Kind = 'blogger' | 'teacher' | 'learner';
const n = (x: number): string => fmtSum(x);
const som = (x: number): string => L('{0} so‘m', [n(x)]);

/** Server bilan bir xil hisob: har qatorda erishilgan ENG YUQORI pog'ona (ustma-ust qo'shilmaydi). */
const bonus = (t: Tier[], x: number): number => t.reduce((s, y) => (x >= y.min ? y.som : s), 0);

/** Egasining misollari: birinchi normaga yetmagan, o'rtadagi va eng yuqori natija (normalar o'zgarsa misollar ham o'zgaradi). */
function examples(v: VideoTerms): { views: number; learners: number; parts: number[] }[] {
  const vt = v.viewTiers, lt = v.learnerTiers;
  if (!vt.length || !lt.length) return [];
  const topV = vt.at(-1)!.min, topL = lt.at(-1)!.min;
  const raw = [
    { views: vt[0]!.min - 1, learners: lt[0]!.min - 1 },
    { views: Math.max(vt[0]!.min, Math.floor((topV * 0.99) / 1000) * 1000), learners: Math.max(lt[0]!.min, topL - 1) },
    { views: topV, learners: topL },
  ];
  const seen = new Set<string>();
  return raw.filter((e) => { const k = `${bonus(vt, e.views)}:${bonus(lt, e.learners)}`; if (seen.has(k)) return false; seen.add(k); return true; })
    .map((e) => ({ ...e, parts: [v.baseSom, bonus(vt, e.views), bonus(lt, e.learners)].filter((x, i) => i === 0 || x > 0) }));
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
  const v = terms?.video ?? null;
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
  const ex = v ? examples(v) : [];
  const best = ex.length ? ex.at(-1)!.parts.reduce((a, b) => a + b, 0) : 0;

  return (
    <div className="partners">
      <section className="w-hero partners-hero">
        <div>
          <span className="eyebrow"><Megaphone size={15} />  {L('Hamkorlik')}</span>
          <h1>{L('Sellzen haqida video qiling — pul ishlang')}</h1>
          <p className="lead">{v
            ? (best > v.baseSom ? L('Har bir video uchun {0}. Video yaxshi natija bersa — {1} so‘mgacha.', [som(v.baseSom), n(best)]) : L('Har bir video uchun {0}.', [som(v.baseSom)]))
            : L('Blogerlar, o‘qituvchilar va ijtimoiy tarmog‘i bor o‘quvchilar uchun: shaxsiy havola va har bir kelgan o‘quvchi kabinetingizda ko‘rinadi.')}</p>
          <a className="btn primary lg" href="#partner-form">{L('Ariza qoldirish')} <ArrowRight size={18} /></a>
        </div>
      </section>

      {v ? (
        <>
          <div className="section-title"><h2>{L('Bitta video uchun qancha olasiz?')}</h2></div>
          <section className="card vp-table">
            <div className="vp-row base"><span>{L('Video joylaganingiz uchun')}</span><b>{som(v.baseSom)}</b></div>
            {v.viewTiers.map((t) => <div className="vp-row" key={`v${t.min}`}><span>{L('{0} va undan ko‘p ko‘rish', [n(t.min)])}</span><b>+{som(t.som)}</b></div>)}
            {v.learnerTiers.map((t) => <div className="vp-row" key={`l${t.min}`}><span>{L('{0} va undan ko‘p o‘quvchi', [n(t.min)])}</span><b>+{som(t.som)}</b></div>)}
            <p className="muted">{L('Ko‘rish va o‘quvchi bonuslari ustma-ust qo‘shilmaydi: har biridan eng yuqorisi olinadi.')}</p>
          </section>

          {ex.length > 0 && (
            <>
              <div className="section-title"><h2>{L('Misollar')}</h2></div>
              <div className="vp-examples">
                {ex.map((e) => {
                  const total = e.parts.reduce((a, b) => a + b, 0);
                  return (
                    <section className="card vp-ex" key={`${e.views}-${e.learners}`}>
                      <p className="vp-ex-in">{L('{0} ko‘rish, {1} o‘quvchi', [n(e.views), n(e.learners)])}</p>
                      <p className="vp-ex-calc">{e.parts.length > 1 ? `${e.parts.map(n).join(' + ')} =` : L('faqat video uchun')}</p>
                      <b className="vp-ex-total">{som(total)}</b>
                    </section>
                  );
                })}
              </div>
              {best > 0 && <p className="vp-month">{L('Oyiga 15 ta video: 15 × {0} = {1} so‘mgacha', [n(best), n(best * 15)])}</p>}
            </>
          )}

          <div className="section-title"><h2>{L('Shartlar')}</h2></div>
          <section className="card">
            <ul className="vp-rules">
              <li><Check size={16} />{L('sellzen.uz yoki shaxsiy havolangiz profil bio’sida va video izohida tursin.')}</li>
              <li><Check size={16} />{v.instagram ? L('Videoda Instagram sahifamizni belgilang: {0}.', [`@${v.instagram}`]) : L('Videoda Sellzen Instagram sahifasini belgilang.')}</li>
              <li><Check size={16} />{L('Hisob video joylanganidan {0} kun o‘tib, bir marta qilinadi. Keyingi ko‘rishlar hisobga olinmaydi.', [v.windowDays])}</li>
              <li><Check size={16} />{L('Summa tasdiqlangach {0} kun ichida to‘lanadi.', [v.payDays])}</li>
            </ul>
            <p className="muted" style={{ marginBottom: 0 }}>{L('O‘quvchi — havolangiz orqali ro‘yxatdan o‘tib, darsni boshlagan odam.')}</p>
          </section>
        </>
      ) : (
        <section className="card"><p style={{ margin: 0 }}>{L('Mukofot shartlari auditoriyangiz va formatga qarab ariza ko‘rib chiqilgach siz bilan kelishiladi.')}</p></section>
      )}

      <div className="section-title"><h2>{L('Qanday boshlanadi?')}</h2></div>
      <ol className="how-steps">
        <li><b>1</b><div><h3>{L('Ariza qoldirasiz')}</h3><p>{L('1 daqiqa: sahifangiz va aloqa.')}</p></div></li>
        <li><b>2</b><div><h3>{L('Havola olasiz')}</h3><p>{L('Bog‘lanib, kabinet va shaxsiy havolangizni beramiz.')}</p></div></li>
        <li><b>3</b><div><h3>{L('Video joylaysiz')}</h3><p>{L('Ko‘rishlar, o‘quvchilar va balansingiz kabinetda ko‘rinadi.')}</p></div></li>
      </ol>

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
