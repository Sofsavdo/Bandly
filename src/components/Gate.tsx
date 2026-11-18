import { useEffect, useState, type ReactNode } from 'react';
import { hasTrack } from '../lib/entitlement';
import { fmtSum, payConfig, startPurchase, type PayConfig } from '../lib/pay';
import { SALE_PLANS, TRACK_NAME, planForTrack } from '../config';
import type { TrackId } from '../lib/types';
import { setPlan, useProfile } from '../lib/store';
import { Lock } from 'lucide-react';
import { L } from '../i18n';

export function LockCard({ track, reason }: { track: TrackId; reason?: string }) {
  const plan = SALE_PLANS.find((p) => p.id === planForTrack(track))!;
  const [cfg, setCfg] = useState<PayConfig | null>(null);
  useEffect(() => { void payConfig().then(setCfg); }, []);
  const live = !!cfg?.enabled;
  const demo = !live && !!cfg?.demo; // demo tugmasi faqat server aniq "demo" desa (tarmoq xatosida emas)
  const price = cfg?.periods[0]?.prices[plan.id] ?? plan.monthlyUzs;
  return (
    <div className="card lock">
      <span className="blob ink" style={{ margin: '0 auto 10px' }}><Lock /></span>
      <h2>{TRACK_NAME[track]}  {L('— obuna bilan ochiladi')}</h2>
      <p>{reason ?? L('Bu bo‘lim {0} va All Access tariflarida bor.', [plan.title])}</p>
      <div className="row" style={{ justifyContent: 'center' }}>
        <a className="btn" href="#/pricing">{L('Barcha tariflar')}</a>
        {live ? <button className="btn primary" onClick={() => startPurchase(plan.id, 30)}>{plan.title} · {fmtSum(price)}  {L('so‘m / oy')}</button> : demo && <button className="btn" onClick={() => setPlan(track, true)}>{L('Demo: sinab ko‘rish')}</button>}
      </div>
      {demo && <p className="evidence">{L('Demo rejim: to‘lov hali ulanmagan, bu tugma faqat shu qurilmada bo‘limni ochadi.')}</p>}
    </div>
  );
}

export function Gate({ track, children }: { track: TrackId; children: ReactNode }) {
  const p = useProfile();
  return hasTrack(p, track) ? <>{children}</> : <LockCard track={track} />;
}
