// Profil: do'stlarni taklif qilish — shaxsiy havola (sayt va Telegram), ulashish, statistika.
import { Copy, Gift, Share2 } from 'lucide-react';
import { trackUser } from '../lib/track';
import { useEffect, useState } from 'react';
import { getAccount } from '../lib/account';
import { L } from '../i18n';

interface Ref { code: string; invited: number; activated: number; xpEach: number; planDays?: number; bot: string | null }

export function InviteCard() {
  const acc = getAccount();
  const [r, setR] = useState<Ref | null>(null);
  const [msg, setMsg] = useState('');
  useEffect(() => {
    if (!acc) return;
    void fetch('/api/referral', { headers: { 'x-token': acc.token } }).then((x) => (x.ok ? x.json() : null)).then((j: Ref | null) => setR(j)).catch(() => setR(null));
  }, [acc?.token]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!acc || !r) return null;
  const link = r.bot ? `https://t.me/${r.bot}?start=ref_${r.code}` : `${location.origin}/?ref=${r.code}`;
  const text = L('Men Sellzen’da ingliz tilini o‘rganyapman — sen ham qo‘shil:');
  const share = async () => {
    trackUser('referral_share');
    try { if (navigator.share) { await navigator.share({ title: 'Sellzen', text, url: link }); return; } } catch { /* bekor qilindi */ }
    await navigator.clipboard?.writeText(`${text} ${link}`).catch(() => undefined); setMsg(L('Havola nusxalandi'));
  };
  return (
    <section className="card invite">
      <div className="row" style={{ gap: 12, alignItems: 'flex-start' }}>
        <span className="blob orange"><Gift /></span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ margin: 0 }}>{L('Do‘stlarni taklif qiling')}</h3>
          <p className="muted" style={{ margin: '2px 0 10px' }}>{r.planDays ? L('Do‘stingiz birinchi darsni tugatsa — ikkalangizga +{0} kun All Access va +{1} XP.', [r.planDays, r.xpEach]) : L('Do‘stingiz birinchi darsni tugatsa — ikkalangizga +{0} XP.', [r.xpEach])}</p>
        </div>
      </div>
      <div className="invite-link"><code>{link}</code><button className="icon-btn sm" aria-label={L('Nusxalash')} onClick={() => { void navigator.clipboard?.writeText(link).then(() => setMsg(L('Havola nusxalandi'))); }}><Copy size={16} /></button></div>
      <div className="row" style={{ marginTop: 10, justifyContent: 'space-between' }}>
        <span className="muted">{L('Taklif qilinganlar: {0} · faol: {1}', [r.invited, r.activated])}</span>
        <button className="btn primary sm" onClick={() => void share()}><Share2 size={15} /> {L('Ulashish')}</button>
      </div>
      {msg && <p className="evidence">{msg}</p>}
    </section>
  );
}
