// Admin → Analitika → O'sish: Analytics 2.0 kohorta hisobotlari (server/userEvents.ts cohortReport).
// Barcha foizlar noyob o'quvchilar bo'yicha; hodisalar yig'indisi bo'lingan joy yo'q. Shaxsiy ma'lumot ko'rsatilmaydi.
import { L } from '../i18n';

export interface Cohort2 {
  signups: number;
  steps: { key: string; users: number; pct: number | null }[];
  retention: { d1: number | null; d7: number | null; d30: number | null; eligible: { d1: number; d7: number; d30: number } };
  activated: number; activationPct: number | null; paid: number; activationToPaidPct: number | null; freeToPaidPct: number | null; renewed: number; renewalPct: number | null;
  period: { activeUsers: number; revenue: number; arpu: number | null; aiUsd: number; aiUsdPerActive: number | null; aiEvalUsd: number; aiEvals: number; aiUsdPerEval: number | null };
  adoption: { feature: string; users: number }[];
}

const STEP: Record<string, string> = {
  onboarding_done: L('Onboardingni tugatdi'), placement_done: L('Daraja testini tugatdi'), lesson_start: L('Dars boshladi'), lesson_done: L('Darsni tugatdi'),
  mock_start: L('Mock boshladi'), mock_done: L('Mockni tugatdi'), speaking_start: L('Speaking boshladi'), speaking_evaluated: L('Speaking baholandi'),
  writing_evaluated: L('Writing baholandi'), plan_done: L('Kunlik rejani bajardi'), pricing_view: L('Tariflarni ko‘rdi'), checkout_start: L('To‘lovni boshladi'),
  payment_done: L('To‘lov qildi'), referral_share: L('Taklif havolasini ulashdi'),
};
const FEATURE: Record<string, string> = {
  lesson: L('Darslar'), mock: L('Mock testlar'), writing_eval: L('Writing baholash'), speaking_eval: L('Speaking baholash'), coach: L('AI ustoz'),
  plan_done: L('Kunlik reja bajarildi'), insight_follow: L('Tavsiyaga amal qildi'),
};
const pct = (x: number | null) => (x === null ? '—' : `${x}%`);
const num = (x: number) => x.toLocaleString('ru-RU');
const usd = (x: number | null) => (x === null ? '—' : `$${x}`);

export function CohortPanel({ c, defs }: { c: Cohort2; defs?: Record<string, string> }) {
  return (
    <section className="card">
      <h3 style={{ marginTop: 0 }}>{L('Kohorta: shu davrda ro‘yxatdan o‘tgan {0} o‘quvchi', [num(c.signups)])}</h3>
      <div className="kpis">
        <div className="kpi2"><span>{L('Faollashdi (7 kun)')}</span><b>{num(c.activated)}</b><small>{pct(c.activationPct)}</small></div>
        <div className="kpi2"><span>D1 / D7 / D30</span><b>{pct(c.retention.d1)} · {pct(c.retention.d7)} · {pct(c.retention.d30)}</b><small>{L('hisoblangan: {0} / {1} / {2}', [c.retention.eligible.d1, c.retention.eligible.d7, c.retention.eligible.d30])}</small></div>
        <div className="kpi2"><span>{L('Bepuldan pullikka')}</span><b>{pct(c.freeToPaidPct)}</b><small>{L('faollashganlardan: {0}', [pct(c.activationToPaidPct)])}</small></div>
        <div className="kpi2"><span>{L('Uzaytirdi')}</span><b>{num(c.renewed)}</b><small>{pct(c.renewalPct)}</small></div>
      </div>
      <div className="table-scroll"><table className="data wrap">
        <thead><tr><th>{L('Qadam')}</th><th>{L('O‘quvchi')}</th><th>%</th></tr></thead>
        <tbody>{c.steps.map((s) => <tr key={s.key}><td>{STEP[s.key] ?? s.key}</td><td>{num(s.users)}</td><td>{pct(s.pct)}</td></tr>)}</tbody>
      </table></div>
      <h4>{L('Davr ko‘rsatkichlari')}</h4>
      <div className="kpis">
        <div className="kpi2"><span>{L('Faol o‘quvchilar')}</span><b>{num(c.period.activeUsers)}</b></div>
        <div className="kpi2"><span>{L('Faol o‘quvchiga daromad')}</span><b>{c.period.arpu === null ? '—' : `${num(c.period.arpu)} ${L('so‘m')}`}</b></div>
        <div className="kpi2"><span>{L('Faol o‘quvchiga AI xarajati')}</span><b>{usd(c.period.aiUsdPerActive)}</b><small>{L('jami: {0}', [usd(c.period.aiUsd)])}</small></div>
        <div className="kpi2"><span>{L('Bitta AI baholash narxi')}</span><b>{usd(c.period.aiUsdPerEval)}</b><small>{L('baholashlar: {0}', [c.period.aiEvals])}</small></div>
      </div>
      <h4>{L('Funksiyalardan foydalanish (noyob o‘quvchilar)')}</h4>
      <div className="table-scroll"><table className="data wrap"><tbody>{c.adoption.map((a) => <tr key={a.feature}><td>{FEATURE[a.feature] ?? a.feature}</td><td>{num(a.users)}</td></tr>)}</tbody></table></div>
      {defs && <details className="fold" style={{ marginTop: 10 }}><summary>{L('Ta’riflar')}</summary><ul className="muted" style={{ fontSize: 13 }}>{Object.entries(defs).map(([k, v]) => <li key={k}>{L(v)}</li>)}</ul></details>}
    </section>
  );
}
