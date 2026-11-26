// Creator kabineti — «Batafsil» qismi: kampaniyalar va brend qoidalari, to'lovlar tarixi, ixtiyoriy reyting. Video topshirish va balans: CreatorVideos.tsx.
import { Megaphone, Trophy } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { getAccount } from '../lib/account';
import { fmtSum } from '../lib/pay';
import { L } from '../i18n';

interface Campaign { id: number; name: string; brief: string; rules: string; requiresVideo: boolean; endsAt: number | null }
interface Entry { id: number; kind: string; amountMinor: number; currency: string; status: string; createdAt: number }

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const r = await fetch(path, { ...init, headers: { 'x-token': getAccount()?.token ?? '', ...(init?.body ? { 'content-type': 'application/json' } : {}) } });
  const j = await r.json().catch(() => ({})) as T & { error?: string };
  if (!r.ok) throw new Error(j.error ?? L('Xato {0}', [r.status]));
  return j;
}
export const POST_STATUS = (): Record<string, string> => ({ draft: L('Qoralama'), submitted: L('Ko‘rib chiqilmoqda'), needs_changes: L('O‘zgartirish kerak'), approved: L('Tasdiqlangan'), rejected: L('Rad etilgan') });
export const RULE_KIND = (): Record<string, string> => ({ paid_pct: L('To‘lovdan foiz'), activated_flat: L('Faollashgan o‘quvchi boshiga'), first_paid_flat: L('Birinchi to‘lov boshiga'), verified_views_per_1k: L('Har 1000 tasdiqlangan ko‘rish uchun') });
export const LEDGER_KIND = (): Record<string, string> => ({ commission: L('Komissiya'), cpa_activated: L('Faollashgan o‘quvchi'), cpa_first_paid: L('Birinchi to‘lov'), views: L('Tasdiqlangan ko‘rishlar'), video: L('Video to‘lovi'), bonus: L('Bonus'), adjustment: L('Tuzatish'), reversal: L('Qaytarish ushlanmasi') });
export const LEDGER_STATUS = (): Record<string, string> => ({ pending: L('Kutilmoqda'), approved: L('Tasdiqlangan'), rejected: L('Rad etilgan'), paid: L('To‘langan') });
const fmtDate = (t: number): string => new Date(t).toLocaleDateString();
const BRAND_RULES = (): string[] => [
  L('Reklama ekanini aniq belgilang (masalan, #reklama yoki #ad).'),
  L('Natijani kafolatlamang: «band beramiz», «albatta o‘tasiz» kabi da’volar mumkin emas.'),
  L('Sellzen rasmiy IELTS tashkilotlari bilan bog‘liq emas — «rasmiy IELTS» deb da’vo qilmang.'),
  L('18+ ustoz xarakterini voyaga yetmaganlarga qaratilgan reklamada ko‘rsatmang.'),
];

export function CreatorPosts() {
  const [camps, setCamps] = useState<Campaign[]>([]);
  const [rw, setRw] = useState<{ entries: Entry[]; balances: { pending: number; approved: number; paid: number; currency: string }; enabled: boolean; video?: { terms: { enabled: boolean } }; inHoldMinor: number; terms: { kind: string; name: string; pct: number | null; amountMinor: number | null; holdDays: number; endsAt: number | null }[] } | null>(null);
  const [rk, setRk] = useState<Record<string, { nickname: string; value: number }[]> | null>(null);
  const [prof, setProf] = useState<{ rankOptIn: boolean; status: string } | null>(null);
  const [err, setErr] = useState('');
  const load = useCallback(() => {
    void api<{ campaigns: Campaign[] }>('/api/creator/campaigns').then((d) => setCamps(d.campaigns)).catch(() => undefined);
    void api<NonNullable<typeof rw>>('/api/creator/rewards').then(setRw).catch(() => undefined);
    void api<Record<string, { nickname: string; value: number }[]>>('/api/creator/ranking').then(setRk).catch(() => undefined);
    void api<{ profile: { rankOptIn: boolean; status: string } }>('/api/creator/profile').then((d) => setProf(d.profile)).catch(() => undefined);
  }, []);
  useEffect(load, [load]);
  const rankLabels: [string, string][] = [['verifiedReach', L('Tasdiqlangan qamrov')], ['activatedLearners', L('Faollashgan o‘quvchilar')], ['retainedLearners', L('Qaytgan o‘quvchilar (7-kun)')], ['netPaidConversions', L('Sof to‘lovga o‘tganlar')]];
  return (
    <>
      <section className="card">
        <h3 style={{ marginTop: 0 }}><Megaphone size={18} style={{ verticalAlign: -3 }} />  {L('Kampaniyalar va kreativ brief')}</h3>
        {camps.length === 0 ? <p className="muted">{L('Hozircha faol kampaniya yo‘q. Bio havolangiz uchun video topshirish shart emas — organik takliflar o‘z-o‘zidan hisoblanadi.')}</p> : camps.map((c) => (
          <div key={c.id} className="card" style={{ margin: '0 0 8px' }}><b>{c.name}</b>{c.endsAt ? <small className="muted"> · {L('muddati: {0}', [fmtDate(c.endsAt)])}</small> : null}
            <p style={{ margin: '4px 0' }}>{c.brief}</p>{c.rules && <p className="muted" style={{ margin: 0 }}>{c.rules}</p>}
            <p className="evidence" style={{ margin: '4px 0 0' }}>{c.requiresVideo ? L('Bu kampaniya uchun video-post havolasi majburiy.') : L('Video-post havolasi majburiy emas.')}</p></div>
        ))}
        <h4 className="list-h">{L('Brend qoidalari (hammasi uchun)')}</h4>
        <ul>{BRAND_RULES().map((r) => <li key={r}>{r}</li>)}</ul>
      </section>
      {rw && (
        <section className="card">
          <h3 style={{ marginTop: 0 }}>{L('To‘lovlar tarixi')}</h3>
          {!rw.enabled && !rw.video?.terms.enabled && <p className="muted">{L('Hozircha mukofot dasturi yoqilmagan: hisoblash va to‘lovlar admin tasdiqlagan qoidalar bilan keyin boshlanadi. Hamkorlik shartlari alohida kelishiladi.')}</p>}
          {rw.terms.length > 0 && (<><h4 className="list-h">{L('Amaldagi mukofot shartlari')}</h4><ul>{rw.terms.map((t) => <li key={t.name}><b>{t.name}</b> — {RULE_KIND()[t.kind] ?? t.kind}: {t.kind === 'paid_pct' ? `${t.pct}%` : `${fmtSum(Math.round((t.amountMinor ?? 0) / 100))} ${L('so‘m')}`} · {L('kutish davri {0} kun', [t.holdDays])}{t.endsAt ? ` · ${L('muddati: {0}', [fmtDate(t.endsAt)])}` : ''}</li>)}</ul></>)}
          {rw.enabled && <p className="muted" style={{ fontSize: 13 }}>{L('Kutish davrida: {0} so‘m', [fmtSum(Math.round(rw.inHoldMinor / 100))])}</p>}
          {rw.entries.length === 0 && <p className="muted">{L('Hali to‘lov yozuvi yo‘q.')}</p>}
          {rw.entries.length > 0 && <div className="table-scroll"><table className="data"><thead><tr><th>{L('Sana')}</th><th>{L('Turi')}</th><th>{L('Summa')}</th><th>{L('Holat')}</th></tr></thead><tbody>
            {rw.entries.map((e) => <tr key={e.id}><td>{fmtDate(e.createdAt)}</td><td>{LEDGER_KIND()[e.kind] ?? e.kind}</td><td>{fmtSum(Math.round(e.amountMinor / 100))} {e.currency === 'UZS' ? L('so‘m') : e.currency}</td><td>{LEDGER_STATUS()[e.status] ?? e.status}</td></tr>)}</tbody></table></div>}
          <p className="muted" style={{ fontSize: 13, marginBottom: 0 }}>{L('Summalar so‘mda. «Tasdiq kutilmoqda» — admin hisoblagan, hali tasdiqlamagan; «To‘lanadi» — tasdiqlangan, muddatida to‘lanadi; «To‘langan» — sizga o‘tkazilgan.')}</p>
        </section>
      )}
      <section className="card">
        <h3 style={{ marginTop: 0 }}><Trophy size={18} style={{ verticalAlign: -3 }} />  {L('Hamkorlar reytingi')}</h3>
        <label className="evidence" style={{ display: 'flex', gap: 8, alignItems: 'center' }}><input type="checkbox" checked={prof?.rankOptIn ?? false} onChange={(e) => void api('/api/creator/profile', { method: 'POST', body: JSON.stringify({ rankOptIn: e.target.checked }) }).then(load).catch((x: Error) => setErr(x.message))} /> {L('Laqabim va agregat ko‘rsatkichlarim reytingda ko‘rinsin')}</label>
        {err && <p className="notice" role="alert">{err}</p>}
        {rk && rankLabels.map(([k, label]) => (rk[k]?.length ?? 0) > 0 && <div key={k}><h4 className="list-h">{label}</h4><ol>{rk[k]!.map((e) => <li key={e.nickname}>{e.nickname} — {e.value}</li>)}</ol></div>)}
        {rk && rankLabels.every(([k]) => (rk[k]?.length ?? 0) === 0) && <p className="muted">{L('Reytingda hozircha hech kim yo‘q (faqat ruxsat bergan hamkorlar ko‘rinadi).')}</p>}
      </section>
    </>
  );
}
