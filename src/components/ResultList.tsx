// Natijalar ro'yxati: jadval o'rniga kartochka qatorlari — telefonda siqilmaydi, uzun test nomi ham sig'adi.
import type { ResultRecord } from '../lib/storage';
import { L } from '../i18n';

export const RESULT_KIND: Record<string, string> = { reading: 'Reading', listening: 'Listening', speaking: 'Speaking', writing: 'Writing', grammar: 'Grammar', practice: L('Gap tuzish') };

export function ResultList({ results, limit, moreHref }: { results: ResultRecord[]; limit?: number; moreHref?: string }) {
  if (results.length === 0) return <p>{L('Hozircha natija yo‘q.')}</p>;
  const shown = limit ? results.slice(0, limit) : results;
  return (
    <>
      <ul className="res-list">
        {shown.map((r) => {
          const pct = r.total ? Math.round((r.correct / r.total) * 100) : 0;
          return (
            <li key={r.id} className="res-row">
              <div className="res-main">
                <b className="res-title">{r.title}</b>
                <span className="muted res-meta">{RESULT_KIND[r.kind] ?? r.kind} · {new Date(r.date).toLocaleDateString('uz-UZ')}</span>
              </div>
              <div className="res-score">
                <b>{r.correct}/{r.total}</b>
                <span className="muted">{pct}%</span>
              </div>
              <div className="res-band" aria-label={L('Band (taxm.)')}>
                <span className="muted">{L('Band')}</span>
                <b>{r.band !== undefined ? r.band.toFixed(1) : '—'}</b>
              </div>
            </li>
          );
        })}
      </ul>
      {moreHref && limit && results.length > limit && <a className="btn sm" href={moreHref} style={{ marginTop: 10 }}>{L('Barcha natijalar ({0})', [results.length])}</a>}
    </>
  );
}
