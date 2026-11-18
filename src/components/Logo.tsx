// i18n-ignore-file: brend nomi tarjima qilinmaydi.
// Sellzen brend belgisi: olti burchak ichida "S" (po'lat-ko'k gradient) va "SELLZEN.UZ" yozuvi.
// tile — to'q ko'k plitka ustida (ikonka, avatar, favicon), aks holda shaffof fon (header). Fayllari: public/brand/*, public/favicon.svg.
import { useId } from 'react';
import { BRAND } from '../brand';

export const HEX_S = 'M86 38V30.5L50 9.5L14 30.5V46.5L86 53.5V69.5L50 90.5L14 69.5V62';

export function LogoMark({ size = 36, title, tile = false }: { size?: number; title?: string; tile?: boolean }) {
  const id = `st${useId().replace(/:/g, '')}`;
  return (
    <svg className={`logo-mark${tile ? ' tile' : ''}`} width={size} height={size} viewBox="0 0 100 100" role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" style={{ stopColor: tile ? '#8FA3C0' : 'var(--steel-a, #3A4A66)' }} />
          <stop offset=".45" style={{ stopColor: tile ? '#E4ECF6' : 'var(--steel-b, #9DB0C9)' }} />
          <stop offset=".6" style={{ stopColor: tile ? '#A9BAD2' : 'var(--steel-c, #5B6E8C)' }} />
          <stop offset="1" style={{ stopColor: tile ? '#7486A3' : 'var(--steel-d, #26344E)' }} />
        </linearGradient>
      </defs>
      {tile && <rect x="0" y="0" width="100" height="100" rx="24" fill="#16233D" />}
      <g transform={tile ? 'translate(16 16) scale(.68)' : undefined}>
        <path d={HEX_S} fill="none" stroke={`url(#${id})`} strokeWidth="13" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

/** Gorizontal logotip: belgi + "SELLZEN.UZ" (yorug'/qorong'i mavzuga CSS orqali moslashadi). */
export function Logo({ size = 36 }: { size?: number }) {
  return (
    <span className="logo-lockup" style={{ fontSize: Math.round(size * 0.56) }}>
      <LogoMark size={size} />
      <span className="logo-word">SELLZEN<em>.UZ</em></span>
      <span className="sr-only">{BRAND.name}</span>
    </span>
  );
}
