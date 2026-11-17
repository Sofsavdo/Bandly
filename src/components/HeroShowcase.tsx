// Bosh sahifadagi telefon namunasi: ilovaning haqiqiy elementlaridan yig'ilgan (xarita, XP, seriya) — rasm emas.
import { Check, Flame, Lock, Mic, Play, Star, Trophy } from 'lucide-react';

export function HeroShowcase() {
  return (
    <div className="phone" aria-hidden="true">
      <div className="phone-screen">
        <div className="ph-top"><span>Bandly</span><span className="ph-chip"><Flame size={13} color="#ff5a3c" fill="#ff5a3c" /> 12</span></div>
        <div className="ph-card"><div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}><span>B1 · Ko‘l bo‘yi</span><span>620 XP</span></div><div className="ph-bar"><i /></div></div>
        <div className="ph-path">
          <span className="ph-node done" style={{ left: '38%', top: '2%' }}><Check size={20} strokeWidth={3} /></span>
          <span className="ph-node done" style={{ left: '14%', top: '20%' }}><Check size={20} strokeWidth={3} /></span>
          <span className="ph-node now" style={{ left: '40%', top: '39%' }}><Play size={20} fill="#fff" /></span>
          <span className="ph-node lock" style={{ left: '64%', top: '58%' }}><Lock size={18} /></span>
          <span className="ph-node boss" style={{ left: '38%', top: '78%' }}><Trophy size={20} /></span>
        </div>
      </div>
      <span className="float-chip a"><Star size={15} color="#f2a922" fill="#f2a922" /> +40 XP</span>
      <span className="float-chip b"><Mic size={15} color="#0fa597" /> Talaffuz 92%</span>
      <span className="float-chip c">IELTS · band 6.5 → 7.0</span>
    </div>
  );
}
