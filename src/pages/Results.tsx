import { TrendingUp } from 'lucide-react';
import { LineChart, type Pt } from '../components/LineChart';
import { loadMocks } from '../lib/history';
import { skillBands } from '../lib/progress';
import { loadResults } from '../lib/storage';
import { useProfile } from '../lib/store';

const fmtD = (ms: number) => new Date(ms).toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit' });
const KIND: Record<string, string> = { reading: 'Reading', listening: 'Listening', speaking: 'Speaking', writing: 'Writing', grammar: 'Grammar', practice: L('Gap tuzish') };

import { MasteryCard } from '../components/MasteryCard';
import { BandProgress } from '../components/BandProgress';
import { L } from '../i18n';

export default function Results() {
  const p = useProfile();
  const mocks = loadMocks();
  const results = loadResults();
  const sb = skillBands(results);
  // Grafik: daraja aniqlash natijalari va to'liq imtihonlar (vaqt bo'yicha)
  const series: (Pt & { at: number })[] = [
    ...p.checkpoints.map((c) => ({ at: Date.parse(c.at), label: L('Test {0}', [fmtD(Date.parse(c.at))]), value: c.band })),
    ...mocks.map((m, i) => ({ at: m.at, label: `${i + 1}-Mock`, value: m.overall })),
  ].sort((a, b) => a.at - b.at).slice(-8);
  const last = series[series.length - 1], prev = series[series.length - 2];
  const last3 = mocks[mocks.length - 1];
  const delta = last && prev ? last.value - prev.value : null;
  return (
    <div>
      <div className="card">
        <span className="eyebrow"><TrendingUp size={15} />  {L('Natijalar')}</span>
        <div className="myplan-head">
          <div>
            <div className="bigband">{last ? last.value.toFixed(1) : '—'}</div>
            <p className="evidence">{last3 ? `${mocks.length}-Mock` : L('Daraja aniqlash')}{delta !== null ? <> · <b className={delta >= 0 ? 'ok' : 'bad'}>{delta >= 0 ? '+' : ''}{delta.toFixed(1)}</b></> : null}</p>
          </div>
          <div className="skills res-skills">
            {(['listening', 'reading', 'speaking'] as const).map((k) => <div key={k} className="skill"><span>{KIND[k]}</span><b>{(last3?.[k] ?? sb[k])?.toFixed(1) ?? '—'}</b></div>)}
            <div className="skill"><span>{L('Maqsad')}</span><b>{p.target.toFixed(1)}</b></div>
          </div>
        </div>
      </div>
      <BandProgress />
      <MasteryCard />
      <div className="card">
        <h3 style={{ marginTop: 0 }}>{L('Overall o‘sishi')}</h3>
        <LineChart points={series} />
        {series.length < 2 && <p className="evidence">{L('O‘sishni ko‘rish uchun')} <a href="#/mocks/full">{L('to‘liq imtihon')}</a>  {L('topshiring yoki')} <a href="#/placement">{L('darajani qayta aniqlang')}</a>.</p>}
      </div>
      <div className="card">
        <h3 style={{ marginTop: 0 }}>{L('So‘nggi natijalar')}</h3>
        {results.length === 0 ? <p>{L('Hozircha natija yo‘q.')}</p> : (
          <table className="data">
            <thead><tr><th>{L('Sana')}</th><th>{L('Bo‘lim')}</th><th>{L('Mavzu')}</th><th>{L('Natija')}</th><th>{L('Band')}</th></tr></thead>
            <tbody>{results.slice(0, 15).map((r) => <tr key={r.id}><td>{new Date(r.date).toLocaleDateString('uz-UZ')}</td><td>{KIND[r.kind] ?? r.kind}</td><td>{r.title}</td><td>{r.correct} / {r.total}</td><td>{r.band !== undefined ? r.band.toFixed(1) : '—'}</td></tr>)}</tbody>
          </table>
        )}
      </div>
    </div>
  );
}
