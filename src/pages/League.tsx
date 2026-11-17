import { ArrowDown, ArrowUp, Flame, Shield } from 'lucide-react';
import { RankBadge } from '../components/RankBadge';
import { useCallback, useEffect, useState } from 'react';
import { fetchBoard, getAccount, syncNow, type Board } from '../lib/account';
import { JoinForm } from '../components/JoinForm';
import { useProfile } from '../lib/store';

export default function League() {
  useProfile(); // XP o'zgarsa qayta chizish
  const [period, setPeriod] = useState<'league' | 'week' | 'all'>('league');
  const [lg, setLg] = useState<LeagueView | null>(null);
  const [board, setBoard] = useState<Board | null>(null);
  const [err, setErr] = useState('');
  const [acc, setAcc] = useState(getAccount());

  const load = useCallback(async () => {
    try {
      await syncNow();
      if (period === 'league') { if (getAccount()) { const r = await fetch('/api/league', { headers: { 'x-token': getAccount()!.token } }); if (r.ok) setLg(await r.json() as LeagueView); } }
      else setBoard(await fetchBoard(period));
      setErr('');
    } catch (e) { setErr((e as Error).message); }
  }, [period]);
  useEffect(() => { void load(); const t = setInterval(() => void load(), 20_000); return () => clearInterval(t); }, [load]);

  return (
    <div>
      <div className="card hero">
        <div>
          <h2 style={{ margin: 0 }}>Reyting</h2>
          <p style={{ margin: '4px 0' }}>Har hafta dushanba kuni yangilanadi. XP yig‘ing va yuqoriga chiqing.</p>
          <div className="tabs" style={{ margin: 0 }}>
            <button className={`btn ${period === 'league' ? 'primary' : ''}`} onClick={() => setPeriod('league')}>Mening ligam</button>
            <button className={`btn ${period === 'week' ? 'primary' : ''}`} onClick={() => setPeriod('week')}>Shu hafta</button>
            <button className={`btn ${period === 'all' ? 'primary' : ''}`} onClick={() => setPeriod('all')}>Hamma vaqt</button>
          </div>
        </div>
      </div>

      {!acc && <JoinForm text="Reytingda qatnashish uchun hisobingizga kiring. Laqabingiz reytingda ko‘rinadi." onJoined={(a) => { setAcc(a); void load(); }} />}
      {err && <p className="notice">{err}</p>}

      {period === 'league' && acc && lg && <LeagueCard v={lg} />}
      {period !== 'league' && <div className="card">
        {board && board.top.length === 0 && <p>Hali hech kim yo‘q. Birinchi bo‘ling: o‘yin o‘ynab XP yig‘ing!</p>}
        {board && board.top.length > 0 && (
          <table className="data" style={{ width: '100%' }}>
            <thead><tr><th>#</th><th>Laqab</th><th>XP</th><th><Flame size={14} /></th></tr></thead>
            <tbody>
              {board.top.map((r) => (
                <tr key={r.rank} style={r.me ? { background: 'rgba(255,77,61,.12)', fontWeight: 700 } : undefined}>
                  <td><RankBadge n={r.rank} /></td>
                  <td>{r.nickname}{r.me ? ' (siz)' : ''}</td><td>{r.xp}</td><td>{r.streak}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {board?.me && board.me.rank > 20 && <p className="evidence">Sizning o‘rningiz: {board.me.rank}-o‘rin, {board.me.xp} XP</p>}
        {acc && <p className="evidence">Siz reytingda <b>{acc.nickname}</b> nomi bilan qatnashyapsiz. Hisobdan chiqish — Profil sahifasida.</p>}
        <p className="evidence">XP server tomonidan hisoblanadi: har faoliyat turi va kun uchun chegara bor.</p>
      </div>}
    </div>
  );
}

interface LeagueView { tier: number; tierName: string; endsAt: number; joined: boolean; promote: number; demote: number; rows: { rank: number; nickname: string; xp: number; me: boolean; zone: 'up' | 'down' | null }[] }
const TIER_COLORS = ['#c27a3e', '#9aa3b5', '#f5b400', '#12b76a', '#5cd6ff'];
function LeagueCard({ v }: { v: LeagueView }) {
  const days = Math.max(0, Math.ceil((v.endsAt - Date.now()) / 86_400_000));
  return (
    <div className="card league">
      <div className="league-head">
        <span className="league-badge" style={{ background: TIER_COLORS[v.tier] }}><Shield size={26} /></span>
        <div><h3 style={{ margin: 0 }}>{v.tierName} ligasi</h3><p className="muted" style={{ margin: 0 }}>Hafta tugashiga {days} kun · yuqori {v.promote} — keyingi ligaga, quyi {v.demote} — pastga</p></div>
      </div>
      <div className="league-tiers" aria-hidden="true">{TIER_COLORS.map((c, i) => <i key={c} style={{ background: c, opacity: i <= v.tier ? 1 : 0.25 }} />)}</div>
      {!v.joined ? <p>Bu hafta hali XP olmadingiz. Bitta dars yoki o‘yin — va siz o‘z ligangiz guruhiga qo‘shilasiz (30 kishigacha).</p> : (
        <ol className="league-rows">
          {v.rows.map((r) => (
            <li key={r.rank} className={`${r.me ? 'me' : ''} ${r.zone ?? ''}`}>
              <b className="rk">{r.rank}</b><span className="nm">{r.nickname}{r.me ? ' (siz)' : ''}</span>
              {r.zone === 'up' && <ArrowUp size={14} className="ok" aria-label="ko‘tarilish zonasi" />}{r.zone === 'down' && <ArrowDown size={14} className="bad" aria-label="tushish zonasi" />}
              <span className="xp">{r.xp} XP</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
