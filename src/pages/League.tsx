import { ArrowDown, ArrowRight, ArrowUp, Crown, Flame, Shield, Timer } from 'lucide-react';
import { Illo } from '../components/Illo';
import { RankBadge } from '../components/RankBadge';
import { useCallback, useEffect, useState } from 'react';
import { fetchBoard, getAccount, syncNow, type Board } from '../lib/account';
import { JoinForm } from '../components/JoinForm';
import { useProfile } from '../lib/store';
import { L } from '../i18n';

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
      <div className="card page-head t-butter with-illo">
        <h2 style={{ margin: 0 }}>{L('Reyting')}</h2>
        <p style={{ margin: '4px 0 0' }}>{L('XP yig‘ing va yuqoriga chiqing.')}</p>
        <div className="seg seg-dark" role="tablist" aria-label={L('Reyting turi')}>
          {([['league', L('Mening ligam')], ['week', L('Shu hafta')], ['all', L('Hamma vaqt')]] as const).map(([k, l]) => <button key={k} type="button" role="tab" aria-selected={period === k} className={period === k ? 'on' : ''} onClick={() => setPeriod(k)}>{l}</button>)}
        </div>
        <Illo kind="trophy" size={130} />
      </div>

      {!acc && <JoinForm text={L('Reytingda qatnashish uchun hisobingizga kiring. Laqabingiz reytingda ko‘rinadi.')} onJoined={(a) => { setAcc(a); void load(); }} />}
      {err && <p className="notice">{err}</p>}

      {period === 'league' && acc && lg && <LeagueCard v={lg} />}
      {period !== 'league' && <div className="card">
        {board && board.top.length === 0 && <p>{L('Hali hech kim yo‘q. Birinchi bo‘ling: o‘yin o‘ynab XP yig‘ing!')}</p>}
        {board && board.top.length >= 3 && <Podium rows={board.top.slice(0, 3).map((r) => ({ nickname: r.nickname, xp: r.xp, me: r.me }))} />}
        {board && board.top.length > 0 && (
          <table className="data" style={{ width: '100%' }}>
            <thead><tr><th>#</th><th>{L('Laqab')}</th><th>{L('XP')}</th><th><Flame size={14} /></th></tr></thead>
            <tbody>
              {board.top.map((r) => (
                <tr key={r.rank} style={r.me ? { background: 'var(--lilac-50)', fontWeight: 700 } : undefined}>
                  <td><RankBadge n={r.rank} /></td>
                  <td>{r.nickname}{r.me ? L(' (siz)') : ''}</td><td>{r.xp}</td><td>{r.streak}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {board?.me && board.me.rank > 20 && <p className="evidence">{L('Sizning o‘rningiz:')} {board.me.rank}{L('-o‘rin,')} {board.me.xp}  {L('XP')}</p>}
        {acc && <p className="evidence">{L('Siz reytingda')} <b>{acc.nickname}</b>  {L('nomi bilan qatnashyapsiz. Hisobdan chiqish — Profil sahifasida.')}</p>}
        <p className="evidence">{L('XP server tomonidan hisoblanadi: har faoliyat turi va kun uchun chegara bor.')}</p>
      </div>}
    </div>
  );
}

interface LeagueView { tier: number; tierName: string; endsAt: number; joined: boolean; promote: number; demote: number; rows: { rank: number; nickname: string; xp: number; me: boolean; zone: 'up' | 'down' | null }[] }
const TIER_COLORS = ['#c27a3e', '#9aa3b5', '#f5b400', '#12b76a', '#5cd6ff'];
function Podium({ rows }: { rows: { nickname: string; xp: number; me?: boolean }[] }) {
  const order = [1, 0, 2].filter((i) => rows[i]);
  return (
    <div className="podium" aria-label={L('Top 3')}>
      {order.map((i) => { const r = rows[i]!; return (
        <div key={i} className={`pd p${i + 1}`}>
          {i === 0 && <Crown size={26} className="crown" fill="currentColor" />}
          <span className="avatar" aria-hidden="true">{r.nickname.slice(0, 1).toUpperCase()}</span>
          <span className="nm">{r.nickname}{r.me ? L(' (siz)') : ''}</span><span className="xp">{r.xp}  {L('XP')}</span>
          <div className="base">{i + 1}</div>
        </div>
      ); })}
    </div>
  );
}

function LeagueCard({ v }: { v: LeagueView }) {
  const ms = Math.max(0, v.endsAt - Date.now());
  const d = Math.floor(ms / 86_400_000), h = Math.floor((ms % 86_400_000) / 3_600_000), m = Math.floor((ms % 3_600_000) / 60_000);
  const me = v.rows.find((r) => r.me);
  return (
    <div className="card league">
      <div className="league-head">
        <span className="league-badge" style={{ background: TIER_COLORS[v.tier] }}><Shield size={26} /></span>
        <div><h3 style={{ margin: 0 }}>{v.tierName}  {L('ligasi')}</h3><p className="muted" style={{ margin: 0 }}>{L('Yuqori')} {v.promote}  {L('— keyingi ligaga, quyi')} {v.demote}  {L('— pastga')}</p></div>
      </div>
      <div className="league-tiers" aria-hidden="true">{TIER_COLORS.map((c, i) => <i key={c} style={{ background: c, opacity: i <= v.tier ? 1 : 0.25 }} />)}</div>
      <div className="countdown"><Timer size={26} color="var(--brand)" /><div><small>{L('Liga tugashiga')}</small><b>{d}k : {h}s : {m}d</b></div></div>
      {!v.joined ? <p>{L('Bu hafta hali XP olmadingiz. Bitta dars yoki o‘yin — va siz ligangiz guruhiga qo‘shilasiz.')}</p> : (<>
        {v.rows.length >= 3 && <Podium rows={v.rows.slice(0, 3)} />}
        <ol className="league-rows" start={v.rows.length >= 3 ? 4 : 1}>
          {v.rows.slice(v.rows.length >= 3 ? 3 : 0).map((r) => (
            <li key={r.rank} className={`${r.me ? 'me' : ''} ${r.zone ?? ''}`}>
              <b className="rk">{r.rank}</b><span className="avatar sm" aria-hidden="true" style={{ width: 34, height: 34, fontSize: 14 }}>{r.nickname.slice(0, 1).toUpperCase()}</span><span className="nm">{r.nickname}{r.me ? L(' (siz)') : ''}</span>
              {r.zone === 'up' && <ArrowUp size={14} className="ok" aria-label={L('ko‘tarilish zonasi')} />}{r.zone === 'down' && <ArrowDown size={14} className="bad" aria-label={L('tushish zonasi')} />}
              <span className="xp">{r.xp}  {L('XP')}</span>
            </li>
          ))}
        </ol>
        {me && <div className="me-bar"><span className="rkbox">#{me.rank}</span><div className="grow"><b>{me.nickname} <span className="badge" style={{ marginLeft: 4 }}>{L('SIZ')}</span></b><small>{me.xp}  {L('XP shu hafta')}</small></div><a className="btn primary sm" href="#/learn">{L('XP olish')} <ArrowRight size={15} /></a></div>}
      </>)}
    </div>
  );
}
