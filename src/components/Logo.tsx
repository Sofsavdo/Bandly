// Sellzen brend belgisi: to'q ko'k kvadrat, teal "S" va ochiq kitob sahifasi. Kichik o'lchamda (≤ 28px) kitob chizig'isiz — aniq ko'rinadi.
// Fayl ko'rinishidagi nusxalari: public/brand/*.svg|png, public/favicon.svg.
import { BRAND } from '../brand';
import { L } from '../i18n';

export function LogoMark({ size = 36, title }: { size?: number; title?: string }) {
  const small = size <= 28;
  return (
    <svg className="logo-mark" width={size} height={size} viewBox="0 0 100 100" role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      <rect x="2" y="2" width="96" height="96" rx="26" fill="#0B1F3A" />
      {small
        ? <path d="M69 31.5C65.5 24.5 57.5 20.5 49 20.5C38.5 20.5 31 26.5 31 35C31 44.5 40 47 50 49.5C60.5 52 69.5 55 69.5 65C69.5 73.5 61.5 79.5 50.5 79.5C41.5 79.5 34 75.5 30.5 68.5" fill="none" stroke="#2DD4BF" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
        : <>
          <path d="M67 27C63.5 21.5 57 18.5 50 18.5C40 18.5 33 24 33 31.5C33 40 41 42.5 50 44.5C59.5 46.5 67.5 49.5 67.5 58C67.5 65.5 60 70.5 50.5 70.5C42.5 70.5 36 67 33 61" fill="none" stroke="#2DD4BF" strokeWidth="10.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M18 76.5C28 72.5 40 72.5 50 79C60 72.5 72 72.5 82 76.5" fill="none" stroke="#99F6E4" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M50 79V84" stroke="#99F6E4" strokeWidth="4.5" strokeLinecap="round" />
        </>}
    </svg>
  );
}

/** Gorizontal logotip: belgi + "Sellzen" yozuvi (yorug'/qorong'i mavzuga CSS orqali moslashadi). */
export function Logo({ size = 36 }: { size?: number }) {
  return (
    <span className="logo-lockup" style={{ fontSize: Math.round(size * 0.62) }}>
      <LogoMark size={size} />
      <span className="logo-word">{L('Sell')}<em>{L('zen')}</em></span>
      <span className="sr-only">{BRAND.name}</span>
    </span>
  );
}
