import { Flame, Share2, Star } from 'lucide-react';
import { fmtDuration, unitDots, weekDots, weekdayNames } from '../lib/lessonStats';
import { renderStory, resultLink, shareCard } from '../lib/shareCard';
import { dayKey } from '../lib/game';
import { track } from '../lib/track';
import { getLang, L } from '../i18n';

/** Dars yakunidagi 4 ta ko'rsatkich: yulduz, XP, aniqlik, vaqt (+ bo'limdagi qadam nuqtalari). */
export function ResultTiles({ stars, xp, accuracy, ms, lessonIds, passed, currentId }: { stars: number; xp: number; accuracy: number; ms: number; lessonIds: string[]; passed: (id: string) => boolean; currentId: string }) {
  const dots = unitDots(lessonIds, passed, currentId);
  return (
    <div className="res-wrap">
      <div className="res-tiles">
        <div className="res-tile t-star"><span>{L('Yulduz')}</span><b><Star size={18} />{stars}</b></div>
        <div className="res-tile t-xp"><span>{L('XP')}</span><b>{xp}</b></div>
        <div className="res-tile t-acc"><span>{L('Aniqlik')}</span><b>{accuracy}%</b></div>
        <div className="res-tile t-time"><span>{L('Vaqt')}</span><b>{fmtDuration(ms)}</b></div>
      </div>
      <div className="unit-dots" role="img" aria-label={L('{0} / {1} dars', [dots.filter((d) => d.done).length, dots.length])}>
        {dots.map((d, i) => <i key={i} className={d.now ? 'now' : d.done ? 'done' : ''} />)}
        <small>{L('{0} / {1} dars', [dots.filter((d) => d.done).length, dots.length])}</small>
      </div>
    </div>
  );
}

/** Kunlik seriya kartochkasi: nechanchi kun, shu haftaning kunlari va ulashish. */
export function StreakCard({ streak, lastActiveDay, refCode }: { streak: number; lastActiveDay: string | null; refCode?: string | null }) {
  const today = dayKey();
  const week = weekDots(today, lastActiveDay, streak);
  const names = weekdayNames(getLang());
  const share = async () => {
    track('share_streak');
    const blob = await renderStory({ eyebrow: L('Mening ketma-ket kunlarim'), big: String(streak), title: L('kun ketma-ket'), sub: L('Har kuni ingliz tili'), cta: L('Sen ham bugun boshla!'), link: 'sellzen.uz' });
    if (blob) await shareCard(blob, `sellzen-streak-${streak}`, `${L('Ingliz tilini {0} kun ketma-ket o‘rganyapman.', [streak])} ${resultLink('/', refCode ?? null)}`);
  };
  return (
    <div className="streak-card">
      <div className="sc-head">
        <span className="sc-num"><Flame size={22} />{streak}</span>
        <div><b>{L('kun ketma-ket')}</b><small>{L('Seriyani yoqib turish uchun ertaga qayting.')}</small></div>
      </div>
      <div className="week-dots" role="list">
        {week.map((w, i) => <span key={w.day} role="listitem" className={`wd ${w.state}`}><small>{names[i]}</small><i aria-hidden="true">{w.state === 'done' ? '✓' : ''}</i></span>)}
      </div>
      <button type="button" className="btn sm" onClick={() => void share()}><Share2 size={14} />  {L('Ulashish')}</button>
    </div>
  );
}
