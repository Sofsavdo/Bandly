// Band o'sishi: boshlang'ich (birinchi to'liq imtihon) → oxirgi natija, keyingi o'lchov sanasi va rasmiy IELTS natijasi.
// Ma'lumot serverdan (hisob bo'lsa); hisobsiz — qurilmadagi imtihonlar tarixi.
import { Award, CalendarClock, ClipboardCheck, Trash2, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getAccount } from '../lib/account';
import { addOfficial, BAND_STEPS, fetchBands, removeBand, syncLocalMocks, type BandData, type BandRecord } from '../lib/bands';
import { loadMocks } from '../lib/history';
import { L } from '../i18n';

const SK = [['listening', 'Listening'], ['reading', 'Reading'], ['writing', 'Writing'], ['speaking', 'Speaking']] as const;
const fmt = (ms: number) => new Date(ms).toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' });
const DAY = 86_400_000;

/** Hisobsiz holat uchun: qurilmadagi imtihonlardan xuddi shu xulosa. */
function localData(): BandData {
  const records: BandRecord[] = loadMocks().map((m, i) => ({ id: -i - 1, at: m.at, source: 'mock', listening: m.listening ?? null, reading: m.reading ?? null, writing: m.writing ?? null, speaking: m.speaking ?? null, overall: m.overall, testDate: null }));
  const baseline = records[0] ?? null, last = records[records.length - 1] ?? null;
  const latest = records.length > 1 ? last : null;
  return { records, summary: { baseline, latest, official: null, gain: baseline && latest ? latest.overall - baseline.overall : null, nextMockAt: last ? Math.max(Date.now(), last.at + 14 * DAY) : Date.now() } };
}

export function BandProgress({ compact = false }: { compact?: boolean }) {
  const acct = getAccount();
  const [data, setData] = useState<BandData | null>(acct ? null : localData());
  const [err, setErr] = useState('');
  useEffect(() => {
    if (!acct) return;
    let alive = true;
    fetchBands().then((d) => {
      if (!alive) return;
      setData(d);
      if (loadMocks().some((m) => !d.records.some((r) => r.source === 'mock' && r.at === m.at))) { syncLocalMocks(d.records); setTimeout(() => { void fetchBands().then((x) => alive && setData(x)).catch(() => undefined); }, 1500); }
    }).catch(() => { if (alive) setData(localData()); });
    return () => { alive = false; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  if (!data) return null;
  const { baseline, latest, gain, nextMockAt, official } = data.summary;
  const due = !baseline || (nextMockAt !== null && nextMockAt <= Date.now());

  if (compact) {
    return (
      <div className={`card band-due ${due ? 'due' : ''}`}>
        <div className="row" style={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <b><TrendingUp size={16} />  {!baseline ? L('Boshlang‘ich bandingizni o‘lchang') : due ? L('Qayta o‘lchash vaqti keldi') : L('Keyingi o‘lchov: {0}', [fmt(nextMockAt!)])}</b>
            <p className="muted" style={{ margin: '2px 0 0' }}>{!baseline ? L('To‘liq imtihon (L, R, W, S) — o‘sishni shu natijadan hisoblaymiz.') : gain !== null ? L('Boshlang‘ichdan: {0}', [`${gain >= 0 ? '+' : ''}${gain.toFixed(1)}`]) : L('Boshlang‘ich: {0}', [baseline.overall.toFixed(1)])}</p>
          </div>
          {due && <a className="btn primary sm" href="#/mocks/full"><ClipboardCheck size={15} />  {L('To‘liq imtihon')}</a>}
        </div>
      </div>
    );
  }

  return (
    <div className="card band-progress">
      <h3 style={{ marginTop: 0 }}><TrendingUp size={18} />  {L('Band o‘sishi')}</h3>
      {!baseline ? (
        <>
          <p>{L('O‘sishni o‘lchash uchun avval boshlang‘ich bandingizni aniqlaymiz: to‘liq imtihon (Listening, Reading, Writing, Speaking). Keyin har 2 haftada qayta o‘lchaymiz.')}</p>
          <a className="btn primary" href="#/mocks/full"><ClipboardCheck size={16} />  {L('Boshlang‘ich imtihonni topshirish')}</a>
        </>
      ) : (
        <>
          <div className="band-kpis">
            <div><span>{L('Boshlang‘ich')}</span><b>{baseline.overall.toFixed(1)}</b><small>{fmt(baseline.at)}</small></div>
            <div><span>{L('Oxirgi')}</span><b>{latest ? latest.overall.toFixed(1) : '—'}</b><small>{latest ? fmt(latest.at) : L('hali yo‘q')}</small></div>
            <div className={gain !== null && gain > 0 ? 'up' : ''}><span>{L('O‘sish')}</span><b>{gain === null ? '—' : `${gain >= 0 ? '+' : ''}${gain.toFixed(1)}`}</b><small>{latest ? L('{0} kunda', [Math.max(1, Math.round((latest.at - baseline.at) / DAY))]) : ''}</small></div>
          </div>
          <table className="data band-table">
            <thead><tr><th></th>{SK.map(([, n]) => <th key={n} title={n}><span className="full">{n}</span><span className="short">{n[0]}</span></th>)}</tr></thead>
            <tbody>
              <tr><td>{L('Boshlang‘ich')}</td>{SK.map(([k]) => <td key={k}>{baseline[k]?.toFixed(1) ?? '—'}</td>)}</tr>
              {latest && <tr><td>{L('Oxirgi')}</td>{SK.map(([k]) => <td key={k}>{latest[k]?.toFixed(1) ?? '—'}</td>)}</tr>}
            </tbody>
          </table>
          <p className={`notice ${due ? '' : 'muted'}`} style={{ marginBottom: 0 }}>
            <CalendarClock size={15} />  {due ? <>{L('Qayta o‘lchash vaqti keldi.')} <a href="#/mocks/full">{L('To‘liq imtihonni boshlash')}</a></> : L('Keyingi o‘lchov: {0}. Har 2 haftada bir marta — shunda o‘sish ishonchli ko‘rinadi.', [fmt(nextMockAt!)])}
          </p>
        </>
      )}
      <p className="muted" style={{ fontSize: 13 }}>{L('Mock bandi — taxminiy natija, rasmiy IELTS emas.')}</p>
      {acct ? <OfficialForm data={data} onData={setData} onErr={setErr} official={official} /> : <p className="muted">{L('Natijalaringiz saqlanishi va rasmiy IELTS natijasini kiritish uchun hisobga kiring.')}</p>}
      {err && <p className="bad">{err}</p>}
    </div>
  );
}

function OfficialForm({ data, onData, onErr, official }: { data: BandData; onData: (d: BandData) => void; onErr: (e: string) => void; official: BandRecord | null }) {
  const [open, setOpen] = useState(false);
  const [v, setV] = useState({ listening: 6, reading: 6, writing: 6, speaking: 6 });
  const [date, setDate] = useState('');
  const [busy, setBusy] = useState(false);
  const officials = data.records.filter((r) => r.source === 'official');
  const save = () => {
    setBusy(true); onErr('');
    addOfficial({ ...v, testDate: date }).then((d) => { onData(d); setOpen(false); }).catch((e: Error) => onErr(e.message)).finally(() => setBusy(false));
  };
  return (
    <div className="official">
      <h4><Award size={16} />  {L('Rasmiy IELTS natijangiz')}</h4>
      {official && <p>{L('Oxirgi rasmiy natija: {0} ({1})', [official.overall.toFixed(1), official.testDate ?? ''])}</p>}
      {officials.length > 0 && (
        <ul className="plain">{officials.map((r) => <li key={r.id}>{r.testDate}: <b>{r.overall.toFixed(1)}</b> (L {r.listening?.toFixed(1)} · R {r.reading?.toFixed(1)} · W {r.writing?.toFixed(1)} · S {r.speaking?.toFixed(1)}) <button className="icon-btn sm" aria-label={L('O‘chirish')} onClick={() => { void removeBand(r.id).then(onData).catch((e: Error) => onErr(e.message)); }}><Trash2 size={14} /></button></li>)}</ul>
      )}
      {!open ? <button className="btn sm" onClick={() => setOpen(true)}>{L('Natijani kiritish')}</button> : (
        <div className="official-form">
          <p className="muted" style={{ marginTop: 0 }}>{L('Imtihon topshirgan bo‘lsangiz, natijangizni kiriting — bu Bandly samaradorligini halol o‘lchashga yordam beradi.')}</p>
          <div className="row">
            {SK.map(([k, n]) => (
              <label key={k} className="field-sm">{n}
                <select value={v[k]} onChange={(e) => setV({ ...v, [k]: Number(e.target.value) })}>{BAND_STEPS.slice(2).map((b) => <option key={b} value={b}>{b.toFixed(1)}</option>)}</select>
              </label>
            ))}
            <label className="field-sm">{L('Sana')}<input type="date" value={date} max={new Date().toISOString().slice(0, 10)} onChange={(e) => setDate(e.target.value)} /></label>
          </div>
          <div className="row"><button className="btn primary sm" disabled={busy || !date} onClick={save}>{L('Saqlash')}</button><button className="btn sm" onClick={() => setOpen(false)}>{L('Bekor qilish')}</button></div>
        </div>
      )}
    </div>
  );
}
