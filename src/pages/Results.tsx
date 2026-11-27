import { TrendingUp } from 'lucide-react';
import { LineChart, type Pt } from '../components/LineChart';
import { loadMocks } from '../lib/history';
import { skillBands } from '../lib/progress';
import { loadResults } from '../lib/storage';
import { useProfile } from '../lib/store';

const fmtD = (ms: number) => new Date(ms).toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit' });

import { MasteryCard } from '../components/MasteryCard';
import { BandProgress } from '../components/BandProgress';
import { ResultList, RESULT_KIND as KIND } from '../components/ResultList';
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
  // Egasi (2026-11-27, sahifalar tekshiruvi): yangi o'quvchida 5 ta bo'sh karta o'rniga — bitta aniq bo'sh holat va keyingi qadam
  const empty = !last && results.length === 0;
  if (empty) return (
    <div>
      <div className="card res-empty">
        <span className="eyebrow"><TrendingUp size={15} />  {L('Natijalar')}</span>
        <h2 style={{ margin: '8px 0 4px' }}>{L('Hali natija yo‘q')}</h2>
        <p className="muted" style={{ marginTop: 0 }}>{L('Birinchi testni topshiring — balingiz, ko‘nikmalaringiz va o‘sishingiz shu yerda ko‘rinadi. Maqsadingiz: {0}.', [p.target.toFixed(1)])}</p>
        <div className="row" style={{ gap: 8 }}><a className="btn primary" href="#/mocks/full">{L('To‘liq imtihon (bepul)')}</a><a className="btn" href="#/mocks/reading">{L('Qisqa Reading test')}</a></div>
      </div>
      <BandProgress />
    </div>
  );
  return (
    <div>
      <div className="card">
        <span className="eyebrow"><TrendingUp size={15} />  {L('Natijalar')}</span>
        <div className="myplan-head">
          <div>
            {last ? <>
              <div className="bigband">{last.value.toFixed(1)}</div>
              <p className="evidence">{last3 ? `${mocks.length}-Mock` : L('Daraja aniqlash')}{delta !== null ? <> · <b className={delta >= 0 ? 'ok' : 'bad'}>{delta >= 0 ? '+' : ''}{delta.toFixed(1)}</b></> : null}</p>
            </> : <p className="muted" style={{ margin: '10px 0 0' }}>{L('Hozircha natija yo‘q.')}</p>}
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
        <ResultList results={results} limit={15} />
      </div>
    </div>
  );
}
