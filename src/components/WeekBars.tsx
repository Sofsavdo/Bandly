import { dayKey } from '../lib/game';
import { getLang } from '../i18n';
import { L } from '../i18n';

// Hafta kunlarining qisqa nomi (yakshanbadan boshlab) — har til uchun qo'lda: brauzerlarda o'zbek/tojik ICU ma'lumoti har doim ham yo'q
const WD: Record<string, string[]> = {
  uz: ['Ya', 'Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh'], en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], ru: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
  kk: ['Жс', 'Дс', 'Сс', 'Ср', 'Бс', 'Жм', 'Сн'], ky: ['Жк', 'Дш', 'Шй', 'Шр', 'Бш', 'Жм', 'Иш'], tg: ['Яш', 'Дш', 'Сш', 'Чш', 'Пш', 'Ҷм', 'Шб'],
};
const wd = (d: Date) => (WD[getLang()] ?? WD.uz!)[d.getDay()]!;

/** Oxirgi 7 kun XP ustunlari (bugun — binafsha). */
export function WeekBars({ activity }: { activity: Record<string, number> }) {
  const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (6 - i)); return { k: dayKey(d), w: wd(d), xp: activity[dayKey(d)] ?? 0 }; });
  const max = Math.max(30, ...days.map((d) => d.xp));
  const best = days.reduce((b, d) => (d.xp > b.xp ? d : b), days[0]!);
  return (
    <div className="weekbars" role="img" aria-label={L('Oxirgi 7 kun: {0}', [days.map((d) => `${d.w} ${d.xp} XP`).join(', ')])}>
      {days.map((d, i) => (
        <div key={d.k} className={`wb${i === 6 ? ' now' : d.xp > 0 ? ' has' : ''}`}>
          <i style={{ height: `${Math.max(14, (d.xp / max) * 100)}%` }}>{d === best && d.xp > 0 && <em>{d.xp}  {L('XP')}</em>}</i>
          <small>{d.w}</small>
        </div>
      ))}
    </div>
  );
}

