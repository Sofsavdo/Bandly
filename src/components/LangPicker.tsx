// Interfeys tili: bayroq + qisqa kod (UZ, RU, EN, KK, KY, TG). Oddiy <select> o'rniga o'z ro'yxatimiz: tungi rejimda
// brauzer ro'yxatni oq fonda chizib, matn ham oq bo'lib ko'rinmay qolardi; emoji bayroqlar esa Windows'da chiqmaydi (SVG ishlatiladi).
import { Check, ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { LANG_NAMES, enabledLangs, getLang, setLang, type Lang } from '../i18n';
import { L } from '../i18n';

const W = 24, H = 16;
/** Soddalashtirilgan davlat bayroqlari (kichik o'lchamda tanib olinadigan darajada). */
function Flag({ lang }: { lang: Lang }) {
  const body = (() => {
    switch (lang) {
      case 'uz': return <><rect width={W} height={H} fill="#fff" /><rect width={W} height={5.2} fill="#0099B5" /><rect y={10.8} width={W} height={5.2} fill="#1EB53A" /><rect y={5.2} width={W} height={0.6} fill="#CE1126" /><rect y={10.2} width={W} height={0.6} fill="#CE1126" /><circle cx={4} cy={2.6} r={1.6} fill="#fff" /><circle cx={4.7} cy={2.6} r={1.4} fill="#0099B5" /></>;
      case 'ru': return <><rect width={W} height={H} fill="#fff" /><rect y={5.33} width={W} height={5.34} fill="#0039A6" /><rect y={10.67} width={W} height={5.33} fill="#D52B1E" /></>;
      case 'en': return <><rect width={W} height={H} fill="#012169" /><path d={`M0 0L${W} ${H}M${W} 0L0 ${H}`} stroke="#fff" strokeWidth={3.2} /><path d={`M0 0L${W} ${H}M${W} 0L0 ${H}`} stroke="#C8102E" strokeWidth={1.2} /><path d={`M${W / 2} 0V${H}M0 ${H / 2}H${W}`} stroke="#fff" strokeWidth={5} /><path d={`M${W / 2} 0V${H}M0 ${H / 2}H${W}`} stroke="#C8102E" strokeWidth={2.6} /></>;
      case 'kk': return <><rect width={W} height={H} fill="#00AFCA" /><circle cx={12} cy={7} r={3} fill="#FEC50C" /><path d="M8 11.5q4 2 8 0" stroke="#FEC50C" strokeWidth={0.9} fill="none" /><rect x={1.4} y={1.5} width={1} height={13} fill="#FEC50C" opacity={0.85} /></>;
      case 'ky': return <><rect width={W} height={H} fill="#E8112D" /><circle cx={12} cy={8} r={4.2} fill="#FFEF00" /><circle cx={12} cy={8} r={2.4} fill="#E8112D" /><path d="M10.2 8h3.6M12 6.2v3.6" stroke="#FFEF00" strokeWidth={0.7} /></>;
      case 'tg': return <><rect width={W} height={H} fill="#fff" /><rect width={W} height={4.6} fill="#CC0000" /><rect y={11.4} width={W} height={4.6} fill="#006600" /><path d="M10 9.6h4l-.5-1.6-1.5.8-1.5-.8z" fill="#F8C300" /><circle cx={12} cy={6.6} r={0.6} fill="#F8C300" /></>;
      default: return <rect width={W} height={H} fill="#ccc" />;
    }
  })();
  return <svg className="flag" width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden="true"><clipPath id={`fl-${lang}`}><rect width={W} height={H} rx={3} /></clipPath><g clipPath={`url(#fl-${lang})`}>{body}</g><rect width={W} height={H} rx={3} fill="none" stroke="rgba(0,0,0,.18)" /></svg>;
}

export function LangPicker({ compact = false }: { compact?: boolean }) {
  const langs = enabledLangs();
  const cur = getLang();
  const [open, setOpen] = useState(false);
  const [up, setUp] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => { if (e instanceof KeyboardEvent ? e.key === 'Escape' : !ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', close); document.addEventListener('keydown', close);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', close); };
  }, [open]);
  if (langs.length < 2) return null; // faqat o'zbekcha tayyor — tanlov ko'rsatilmaydi
  const toggle = () => { const r = ref.current?.getBoundingClientRect(); setUp(!!r && r.bottom > window.innerHeight - 300); setOpen(!open); };
  return (
    <div ref={ref} className={`lang-pick${compact ? ' compact' : ''}${open ? ' open' : ''}`}>
      <button type="button" className="lang-btn" aria-haspopup="listbox" aria-expanded={open} aria-label={`${L('Language / Til / Язык')}: ${LANG_NAMES[cur]}`} onClick={toggle}>
        <Flag lang={cur} /><b>{cur.toUpperCase()}</b><ChevronDown size={14} aria-hidden="true" />
      </button>
      {open && (
        <ul className={`lang-menu${up ? ' up' : ''}`} role="listbox" aria-label={L('Language / Til / Язык')}>
          {langs.map((l) => (
            <li key={l} role="option" aria-selected={l === cur}>
              <button type="button" lang={l} title={LANG_NAMES[l]} onClick={() => { setOpen(false); if (l !== cur) setLang(l); }}>
                <Flag lang={l} /><b>{l.toUpperCase()}</b>{l === cur && <Check size={14} aria-hidden="true" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
