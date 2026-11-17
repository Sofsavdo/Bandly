import type { ReactNode } from 'react';

/** Progress halqasi (Design 3.0): qiymat / maksimum, markazda istalgan matn. */
export function PRing({ value, max, size = 64, stroke = 7, color = 'var(--brand)', track = 'var(--surface-2)', dark = false, label, children }: { value: number; max: number; size?: number; stroke?: number; color?: string; track?: string; dark?: boolean; label: string; children?: ReactNode }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r, pct = Math.max(0, Math.min(1, value / Math.max(1, max)));
  return (
    <div className={`pring${dark ? ' dark' : ''}`} style={{ width: size, height: size }} role="img" aria-label={label}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={dark ? 'rgba(255,255,255,.18)' : track} strokeWidth={stroke} />
        {pct > 0 && <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={`${c * pct} ${c}`} />}
      </svg>
      <div style={{ textAlign: 'center' }}>{children}</div>
    </div>
  );
}
