// Elchi (egasi, 2026-11-26): video qilmasdan ham blogerlarni hamkorlikka olib kelib pul ishlash.
// Kabinetda: elchi havolasi, shartlar bitta qatorda, shu oydagi faol blogerlar va keyingi bonusgacha qancha qolgani, olib kelingan blogerlar ro'yxati.
import { Copy, Share2, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getAccount } from '../lib/account';
import { fmtSum } from '../lib/pay';
import { L } from '../i18n';

interface Info { total: number; activeTotal: number; code: string; som: number; tiers: { min: number; som: number }[]; payDays: number; enabled: boolean; activeThisMonth: number; next: { need: number; som: number } | null; bloggers: { nickname: string; joinedAt: number; activeAt: number | null }[]; earnedSom: number }
const som = (x: number): string => L('{0} so‘m', [fmtSum(x)]);

export function CreatorElchi() {
  const [d, setD] = useState<Info | null>(null);
  const [msg, setMsg] = useState('');
  useEffect(() => {
    void fetch('/api/creator/elchi', { headers: { 'x-token': getAccount()?.token ?? '' } }).then((r) => (r.ok ? r.json() : null)).then(setD).catch(() => undefined);
  }, []);
  if (!d || !d.enabled) return null;
  const link = `${location.origin}/#/partners?elchi=${d.code}`;
  const invite = L('Salom! Sellzen (ingliz tili ilovasi) blogerlarga har bir video uchun pul to‘laydi. Shartlar va ariza: {0}', [link]);
  const copy = (t: string, ok: string) => { void navigator.clipboard?.writeText(t).then(() => setMsg(ok)); };
  return (
    <section className="card elchi-card">
      <h3 style={{ marginTop: 0 }}><Users size={18} style={{ verticalAlign: -3 }} /> {L('Elchi: blogerlarni olib keling')}</h3>
      <p style={{ marginTop: 0 }}>{L('Har faol bloger uchun {0}.', [som(d.som)])} {d.tiers.map((t) => L('Oyda {0} ta — +{1}.', [t.min, som(t.som)])).join(' ')}</p>
      <div className="invite-link"><code>{link}</code>
        <button className="icon-btn sm" aria-label={L('Nusxalash')} onClick={() => copy(link, L('Havola nusxalandi'))}><Copy size={16} /></button>
        <button className="icon-btn sm" aria-label={L('Ulashish')} onClick={() => { void navigator.share?.({ title: 'Sellzen', text: invite, url: link }).catch(() => undefined); }}><Share2 size={16} /></button>
      </div>
      <button className="btn sm" style={{ marginTop: 8 }} onClick={() => copy(invite, L('Taklif matni nusxalandi'))}><Copy size={14} /> {L('Blogerga yuboriladigan matnni nusxalash')}</button>
      {msg && <p className="evidence" role="status">{msg}</p>}
      <div className="kpis three elchi-kpis">
        <div className="kpi2"><span>{L('Bu oy faol')}</span><b>{d.activeThisMonth}</b><small>{d.next ? L('yana {0} ta — +{1}', [d.next.need, som(d.next.som)]) : L('eng yuqori bonus')}</small></div>
        <div className="kpi2"><span>{L('Olib kelganlar')}</span><b>{d.total}</b><small>{L('faol: {0}', [d.activeTotal])}</small></div>
        <div className="kpi2"><span>{L('Ishlangan')}</span><b>{fmtSum(d.earnedSom)}</b><small>{L('so‘m')}</small></div>
      </div>
      {d.bloggers.length > 0 && (
        <ul className="elchi-list">
          {d.bloggers.map((b) => <li key={b.nickname}><b>{b.nickname}</b> <span className={b.activeAt ? 'ok' : 'muted'}>{b.activeAt ? L('faol · {0}', [new Date(b.activeAt).toLocaleDateString()]) : L('birinchi video kutilmoqda')}</span></li>)}
        </ul>
      )}
      <p className="muted" style={{ fontSize: 13, marginBottom: 0 }}>{L('Faol bloger — havolangiz orqali ariza qoldirib, birinchi videosi tasdiqlangan bloger (kamida 1 000 obunachi). Pul {0} kun ichida to‘lanadi.', [d.payDays])}</p>
    </section>
  );
}
