// "Bugun" paneli: salomlashish, seriya va kunlik maqsad halqalari, keyingi dars — bitta asosiy harakat.
import { ArrowRight, Flame, Target } from 'lucide-react';
import { UNITS } from '../content/lessons';
import { getAccount } from '../lib/account';
import { dayKey, displayStreak, levelProgress } from '../lib/game';
import { loadProgress, nextLesson } from '../lib/lessons';
import { useProfile } from '../lib/store';

function Ring({ value, max, color, label, children }: { value: number; max: number; color: string; label: string; children: React.ReactNode }) {
  const r = 40, c = 2 * Math.PI * r, pct = Math.max(0, Math.min(1, value / Math.max(1, max)));
  return (
    <div className="ring" role="img" aria-label={label}>
      <svg viewBox="0 0 92 92"><circle cx="46" cy="46" r={r} fill="none" stroke="rgba(255,255,255,.14)" strokeWidth="8" /><circle cx="46" cy="46" r={r} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${c * pct} ${c}`} /></svg>
      <div>{children}</div>
    </div>
  );
}

export function TodayHero() {
  const p = useProfile();
  const nick = getAccount()?.nickname;
  const streak = displayStreak(p, dayKey());
  const lp = levelProgress(p.xp);
  const next = nextLesson(UNITS, loadProgress(), p.level);
  const nl = next ? UNITS.find((u) => u.id === next.unitId)?.lessons.find((l) => l.id === next.lessonId) : null;
  const h = new Date().getHours();
  const hello = h < 12 ? 'Xayrli tong' : h < 18 ? 'Xayrli kun' : 'Xayrli kech';
  return (
    <section className="night today">
      <div>
        <span className="lvl">{p.level ? `Daraja ${p.level}` : 'Daraja aniqlanmagan'} · Bandly {lp.level}-bosqich</span>
        <h2>{hello}{nick ? `, ${nick}` : ''}!</h2>
        <p style={{ margin: 0 }}>{p.dailyXp >= p.dailyGoal ? 'Bugungi maqsad bajarildi — zo‘r! Seriyangiz saqlandi.' : `Bugungi maqsadgacha ${Math.max(0, p.dailyGoal - p.dailyXp)} XP qoldi.`}</p>
        <div className="next">
          {nl ? <a className="btn primary lg" href={`#/learn/${nl.id}`}>Davom ettirish: {nl.titleUz.length > 28 ? `${nl.titleUz.slice(0, 28)}…` : nl.titleUz} <ArrowRight size={18} /></a>
            : <a className="btn primary lg" href="#/learn">Darslar xaritasi <ArrowRight size={18} /></a>}
          <a className="btn ghost-light" href="#/mocks">Mock test</a>
        </div>
      </div>
      <div className="rings">
        <Ring value={streak} max={Math.max(7, streak)} color="#ff7a5c" label={`${streak} kunlik seriya`}><b><Flame size={18} style={{ verticalAlign: -2 }} /> {streak}</b><span>kun seriya</span></Ring>
        <Ring value={p.dailyXp} max={p.dailyGoal} color="#3ad1c0" label={`Kunlik maqsad ${p.dailyXp} / ${p.dailyGoal} XP`}><b><Target size={16} style={{ verticalAlign: -2 }} /> {Math.min(p.dailyXp, p.dailyGoal)}</b><span>/ {p.dailyGoal} XP</span></Ring>
      </div>
    </section>
  );
}
