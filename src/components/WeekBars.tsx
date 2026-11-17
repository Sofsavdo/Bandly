import { dayKey } from '../lib/game';

const WD = ['Ya', 'Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh'];

/** Oxirgi 7 kun XP ustunlari (bugun — binafsha). */
export function WeekBars({ activity }: { activity: Record<string, number> }) {
  const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (6 - i)); return { k: dayKey(d), w: WD[d.getDay()]!, xp: activity[dayKey(d)] ?? 0 }; });
  const max = Math.max(30, ...days.map((d) => d.xp));
  const best = days.reduce((b, d) => (d.xp > b.xp ? d : b), days[0]!);
  return (
    <div className="weekbars" role="img" aria-label={`Oxirgi 7 kun: ${days.map((d) => `${d.w} ${d.xp} XP`).join(', ')}`}>
      {days.map((d, i) => (
        <div key={d.k} className={`wb${i === 6 ? ' now' : d.xp > 0 ? ' has' : ''}`}>
          <i style={{ height: `${Math.max(14, (d.xp / max) * 100)}%` }}>{d === best && d.xp > 0 && <em>{d.xp} XP</em>}</i>
          <small>{d.w}</small>
        </div>
      ))}
    </div>
  );
}

