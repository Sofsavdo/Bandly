import { useEffect, useState, type ReactNode } from 'react';
import { fmtSum, payConfig, startPurchase, type PayConfig } from '../lib/pay';
import { SALE_PLANS, TRACK_NAME, planForTrack } from '../config';
import type { TrackId } from '../lib/types';
import { setPlan, useProfile } from '../lib/store';
import { Lock } from 'lucide-react';

export function LockCard({ track, reason }: { track: TrackId; reason?: string }) {
  const plan = SALE_PLANS.find((p) => p.id === planForTrack(track))!;
  const [cfg, setCfg] = useState<PayConfig | null>(null);
  useEffect(() => { void payConfig().then(setCfg); }, []);
  const live = !!cfg?.enabled;
  const price = cfg?.periods[0]?.prices[plan.id] ?? plan.monthlyUzs;
  return (
    <div className="card lock">
      <span className="blob ink" style={{ margin: '0 auto 10px' }}><Lock /></span>
      <h2>{TRACK_NAME[track]} — obuna bilan ochiladi</h2>
      <p>{reason ?? `Bu bo‘lim ${plan.title} va All Access tariflarida bor.`}</p>
      <div className="row" style={{ justifyContent: 'center' }}>
        <a className="btn" href="#/pricing">Barcha tariflar</a>
        {live ? <button className="btn primary" onClick={() => startPurchase(plan.id, 30)}>{plan.title} · {fmtSum(price)} so‘m / oy</button> : <button className="btn" onClick={() => setPlan(track, true)}>Demo: sinab ko‘rish</button>}
      </div>
      {!live && <p className="evidence">Demo rejim: to‘lov hali ulanmagan, bu tugma faqat shu qurilmada bo‘limni ochadi.</p>}
    </div>
  );
}

export function Gate({ track, children }: { track: TrackId; children: ReactNode }) {
  const p = useProfile();
  return p.plan[track] ? <>{children}</> : <LockCard track={track} />;
}
