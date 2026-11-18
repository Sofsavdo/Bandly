// Kunlik bepul dars tugaganda: ertagacha taymer va obuna taklifi. Bepul qoladiganlar aniq ko'rsatiladi.
import { Clock, Crown, Repeat } from 'lucide-react';
import { useEffect, useState } from 'react';
import { SALE_PLANS, planForTrack } from '../config';
import { COURSE_TRACK, type Course } from '../lib/freeRules';
import { fmtSum, payConfig, startPurchase, type PayConfig } from '../lib/pay';
import { L } from '../i18n';

const hms = (ms: number) => { const s = Math.max(0, Math.floor(ms / 1000)); return `${Math.floor(s / 3600)}:${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; };
const COURSE_UZ: Record<Course, string> = { ge: 'General English', ielts: L('IELTS kursi'), cefr: 'CEFR', sat: 'SAT' };

export function DailyLimit({ course, resetAt, back }: { course: Course; resetAt: number; back: string }) {
  const [now, setNow] = useState(Date.now());
  const [cfg, setCfg] = useState<PayConfig | null>(null);
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  useEffect(() => { void payConfig().then(setCfg); }, []);
  const plan = SALE_PLANS.find((p) => p.id === planForTrack(COURSE_TRACK[course]))!;
  const price = cfg?.periods[0]?.prices[plan.id] ?? plan.monthlyUzs;
  return (
    <section className="card daily-limit">
      <h2 style={{ marginTop: 0 }}>{L('Bugungi bepul dars bajarildi! 🎉')}</h2>
      <p>{L('{0}: kuniga 1 ta yangi dars bepul.', [COURSE_UZ[course]])}</p>
      <div className="dl-timer"><Clock size={18} />  {L('Keyingi bepul dars:')} <b>{hms(resetAt - now)}</b></div>
      <div className="row" style={{ marginTop: 12 }}>
        {cfg?.enabled
          ? <button className="btn primary" onClick={() => startPurchase(plan.id, 30)}><Crown size={16} />  {L('{0} — {1} so‘m/oy', [plan.title, fmtSum(price)])}</button>
          : <a className="btn primary" href="#/pricing"><Crown size={16} />  {L('Obuna bilan davom etish')}</a>}
        <a className="btn" href={back}>{L('Orqaga')}</a>
      </div>
      <p className="muted" style={{ margin: '14px 0 0', fontSize: 14 }}><Repeat size={14} />  {L('Bepul: o‘tilgan darslar, “Xatolarim” va Mock testlar.')}</p>
    </section>
  );
}
