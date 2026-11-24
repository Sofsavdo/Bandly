import { LEVELS } from '../content/roasts';
import { setPersona, useProfile } from '../lib/store';
import { L } from '../i18n';

export function PersonaPicker() {
  const p = useProfile();
  return (
    <div>
      <div className="opts" style={{ marginTop: 0 }}>
        {LEVELS.map((lv) => {
          const locked = lv.id >= 2 && !p.adult;
          const on = p.roastLevel === lv.id && !locked;
          return (
            <button key={lv.id} className={`opt ${on ? 'sel' : ''}`} disabled={locked} onClick={() => setPersona(lv.id, p.adult)}>
              <b>{lv.name}</b><div className="evidence">{lv.desc}</div>
            </button>
          );
        })}
      </div>
      <p style={{ marginTop: 14 }}><label><input type="checkbox" checked={p.adult} onChange={(e) => setPersona(e.target.checked ? p.roastLevel : Math.min(p.roastLevel, 1), e.target.checked)} />  {L('Men 18 yoshdan oshganman va qattiq so‘kishni o‘zim xohlayman')}</label></p>
      <p className="evidence">{L('Qattiq rejimlar (18+): Sellzen AI xatolaringiz ustidan kuladi, shaxsiyatga tegmaydi.')}</p>
    </div>
  );
}
