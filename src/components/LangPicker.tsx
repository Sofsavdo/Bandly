import { Globe } from 'lucide-react';
import { LANG_NAMES, enabledLangs, getLang, setLang } from '../i18n';
import { L } from '../i18n';

/** Interfeys tili: tanlanganda ilova shu tilda qayta yuklanadi. */
export function LangPicker({ compact = false }: { compact?: boolean }) {
  const langs = enabledLangs();
  if (langs.length < 2) return null; // faqat o'zbekcha tayyor — tanlov ko'rsatilmaydi
  return (
    <label className={`lang-pick${compact ? ' compact' : ''}`}>
      <Globe size={16} aria-hidden="true" />
      <span className="sr-only">{L('Language / Til / Язык')}</span>
      <select value={getLang()} onChange={(e) => setLang(e.target.value)} aria-label={L('Language / Til / Язык')}>
        {langs.map((l) => <option key={l} value={l}>{LANG_NAMES[l]}</option>)}
      </select>
    </label>
  );
}
