import { Globe } from 'lucide-react';
import { LANGS, LANG_NAMES, getLang, setLang } from '../i18n';
import { L } from '../i18n';

/** Interfeys tili: tanlanganda ilova shu tilda qayta yuklanadi. */
export function LangPicker({ compact = false }: { compact?: boolean }) {
  return (
    <label className={`lang-pick${compact ? ' compact' : ''}`}>
      <Globe size={16} aria-hidden="true" />
      <span className="sr-only">{L('Language / Til / Язык')}</span>
      <select value={getLang()} onChange={(e) => setLang(e.target.value)} aria-label={L('Language / Til / Язык')}>
        {LANGS.map((l) => <option key={l} value={l}>{LANG_NAMES[l]}</option>)}
      </select>
    </label>
  );
}
