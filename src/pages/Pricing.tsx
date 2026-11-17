import { Check, Crown, Gift, Info, Sparkles, Target, Bot } from 'lucide-react';
import { useEffect, useState } from 'react';
import { SALE_PERIODS, SALE_PLANS, periodPrice, type PlanId } from '../config';
import { fmtDate, fmtSum, payConfig, startPurchase, type PayConfig } from '../lib/pay';
import { setPlan, useProfile } from '../lib/store';
import { Illo } from '../components/Illo';

const ICON: Record<PlanId, typeof Bot> = { general: Bot, exam: Target, all: Crown };
const TONE: Record<PlanId, string> = { general: 'blue', exam: 'red', all: 'orange' };

/** Tariflar sahifasi (MONETIZATION_SPEC §7): FREE + General English / Exam Preparation / All Access, 1 / 3 / 12 oy. */
export default function Pricing() {
  const p = useProfile();
  const [cfg, setCfg] = useState<PayConfig | null>(null);
  const [ai, setAi] = useState<boolean | null>(null);
  const [days, setDays] = useState(30);
  useEffect(() => {
    void payConfig().then(setCfg);
    void fetch('/api/ai/status').then((r) => r.json()).then((j: { enabled?: boolean }) => setAi(!!j.enabled)).catch(() => setAi(false));
  }, []);
  const live = !!cfg?.enabled;
  const per = SALE_PERIODS.find((x) => x.days === days)!;
  const priceOf = (id: PlanId) => cfg?.periods.find((x) => x.days === days)?.prices[id] ?? periodPrice(SALE_PLANS.find((x) => x.id === id)!.monthlyUzs, days);
  const activeUntil = (id: PlanId): number | null => {
    const tr = SALE_PLANS.find((x) => x.id === id)!.tracks.filter((t) => t !== 'mocks');
    const us = tr.map((t) => p.planUntil[t] ?? 0);
    return us.every((u) => u > Date.now()) ? Math.min(...us) : null;
  };
  const demoOn = (id: PlanId) => SALE_PLANS.find((x) => x.id === id)!.tracks.every((t) => p.plan[t]);
  return (
    <div>
      <div className="card page-head with-illo t-mint pricing-head">
        <h2 style={{ margin: 0 }}>Tarif <em className="it">tanlang</em></h2>
        <p style={{ margin: '6px 0 12px' }}>Mock testlar bepul. Obuna AI ustoz va to‘liq bo‘limlarni ochadi.</p>
        <div className="price-tabs" role="tablist" aria-label="Muddat">
          {SALE_PERIODS.map((x) => <button key={x.days} role="tab" aria-selected={x.days === days} className={x.days === days ? 'on' : ''} onClick={() => setDays(x.days)}>{x.label}{x.note && <small> {x.note}</small>}</button>)}
        </div>
        {!live && <p className="note muted">Demo rejim: to‘lov hali ulanmagan.</p>}
        {ai === false && <p className="note muted"><Info size={14} /> AI imkoniyatlari tez orada — limitlar AI yoqilgan kundan hisoblanadi.</p>}
        <Illo kind="star" size={124} />
      </div>

      <div className="plans4">
        <div className="card plan free">
          <span className="blob green"><Gift /></span>
          <h3 style={{ margin: 0 }}>Bepul</h3>
          <div className="price">0 so‘m</div>
          <ul>
            {['Mock Arena: Reading va Listening testlari', 'Darajani aniqlash testi', 'A1–C2 darslar xaritasi (sinov davrida bepul)', 'Kuniga 2 ta so‘z o‘yini'].map((f) => <li key={f}><Check size={16} />{f}</li>)}
          </ul>
          <a className="btn" href="#/placement">Bepul boshlash</a>
        </div>

        {SALE_PLANS.map((pl) => {
          const Icon = ICON[pl.id];
          const price = priceOf(pl.id);
          const until = activeUntil(pl.id);
          const monthlyEq = days === 30 ? null : Math.round(price / (days === 90 ? 3 : 12) / 100) * 100;
          return (
            <div key={pl.id} className={`card plan ${pl.recommended ? 'rec' : ''}`}>
              {pl.recommended && <span className="rec-badge"><Sparkles size={13} /> Tavsiya etiladi</span>}
              <span className={`blob ${TONE[pl.id]}`}><Icon /></span>
              <h3 style={{ margin: 0 }}>{pl.title}</h3>
              <p style={{ margin: 0, color: 'var(--muted)' }}>{pl.short}</p>
              <div>
                <div className="price">{fmtSum(price)} so‘m <span className="evidence">/ {per.label}</span></div>
                {monthlyEq && <span className="evidence">oyiga ≈ {fmtSum(monthlyEq)} so‘m</span>}
                {until && <span className="badge on" style={{ marginLeft: 6 }}>Faol: {fmtDate(until)} gacha</span>}
              </div>
              <ul>{pl.features.map((f) => <li key={f}><Check size={16} />{f}</li>)}</ul>
              {live
                ? <button className={`btn ${pl.recommended ? 'primary' : ''}`} onClick={() => startPurchase(pl.id, days)}>{until ? 'Uzaytirish' : 'Sotib olish'}</button>
                : <button className="btn" onClick={() => { const on = demoOn(pl.id); pl.tracks.forEach((t) => setPlan(t, !on)); }}>{demoOn(pl.id) ? 'Demo: o‘chirish' : 'Demo: yoqish'}</button>}
            </div>
          );
        })}
      </div>

      <div className="card">
        <details className="fold"><summary>To‘lov qanday ishlaydi</summary>
        <ul className="plain">
          <li>To‘lov bank kartasiga o‘tkazma orqali: ilova aniq summa va karta raqamini ko‘rsatadi, o‘tkazma qilingach obuna bir necha soniyada o‘zi yoqiladi.</li>
          <li>Obuna avtomatik yangilanmaydi — muddat tugagach, xohlasangiz qayta to‘laysiz.</li>
          <li>Obuna hisobingizga yoziladi: boshqa qurilmada ham shu hisob bilan kirasiz.</li>
          <li>Barcha ballar taxminiy; rasmiy natijani faqat imtihon markazi beradi.</li>
        </ul>
        </details>
      </div>
    </div>
  );
}
