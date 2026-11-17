// Metodist kabineti → Tarjimalar: har til bo'yicha qamrov, AI bilan to'ldirish (admin), qidirish va qo'lda tuzatish.
import { Languages, Loader2, Save, Sparkles } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { L, LANG_NAMES } from '../i18n';
import { studio } from '../pages/Studio';

const TARGETS = ['en', 'ru', 'kk', 'ky', 'tg'] as const;
type Target = (typeof TARGETS)[number];
interface Cov { done: number; total: number; human: number }
interface Item { src: string; text: string | null; by: string | null }

export function TranslationsPanel({ admin }: { admin: boolean }) {
  const [cov, setCov] = useState<Record<Target, Cov> | null>(null);
  const [aiOn, setAiOn] = useState(false);
  const [lang, setLangSel] = useState<Target>('ru');
  const [q, setQ] = useState('');
  const [missing, setMissing] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<Target | 'all' | null>(null);
  const [msg, setMsg] = useState('');

  const loadCov = useCallback(async () => { const r = await studio<{ coverage: Record<Target, Cov>; ai: boolean }>('GET', 'i18n'); setCov(r.coverage); setAiOn(r.ai); }, []);
  const loadItems = useCallback(async () => {
    const r = await studio<{ items: Item[] }>('GET', `i18n/list?lang=${lang}&q=${encodeURIComponent(q)}&missing=${missing ? 1 : 0}`);
    setItems(r.items); setDraft({});
  }, [lang, q, missing]);
  useEffect(() => { void loadCov().catch((e: Error) => setMsg(e.message)); }, [loadCov]);
  useEffect(() => { const t = setTimeout(() => void loadItems().catch((e: Error) => setMsg(e.message)), 250); return () => clearTimeout(t); }, [loadItems]);

  /** AI bilan yetishmaganlarni to'ldiradi: server har so'rovda ~45 soniya ishlaydi, tugaguncha takrorlaymiz. */
  const fill = async (which: Target[]) => {
    setBusy(which.length > 1 ? 'all' : which[0]!); setMsg('');
    try {
      for (const l of which) {
        for (let guard = 0; guard < 80; guard++) {
          const r = await studio<{ added: number; remaining: number }>('POST', 'i18n/translate', { lang: l });
          await loadCov();
          if (r.remaining === 0 || r.added === 0) break;
        }
      }
      setMsg(L('Tarjima yakunlandi.')); await loadItems();
    } catch (e) { setMsg((e as Error).message); }
    finally { setBusy(null); }
  };

  const save = async (src: string) => {
    const text = draft[src]?.trim();
    if (!text) return;
    try { await studio('PUT', 'i18n/item', { lang, src, text }); setItems((xs) => xs.map((x) => (x.src === src ? { ...x, text, by: 'human' } : x))); setDraft((d) => { const n = { ...d }; delete n[src]; return n; }); void loadCov(); }
    catch (e) { setMsg((e as Error).message); }
  };

  return (
    <section className="card">
      <h3 style={{ marginTop: 0 }}><Languages size={18} style={{ verticalAlign: -3 }} /> {L('Tarjimalar')}</h3>
      <div className="tr-cov">
        {TARGETS.map((l) => {
          const c = cov?.[l]; const pct = c && c.total ? Math.round((c.done / c.total) * 100) : 0;
          return (
            <button key={l} type="button" className={`tr-lang ${lang === l ? 'on' : ''}`} onClick={() => setLangSel(l)}>
              <b>{LANG_NAMES[l]}</b><span>{c ? `${pct}%` : '…'}</span>
              <i style={{ width: `${pct}%` }} />
              {c && <small>{c.done} / {c.total}</small>}
            </button>
          );
        })}
      </div>
      {admin && (
        <div className="row" style={{ margin: '12px 0' }}>
          <button className="btn primary sm" disabled={!aiOn || !!busy} onClick={() => void fill([...TARGETS])}>{busy === 'all' ? <Loader2 size={14} className="spin" /> : <Sparkles size={14} />} {L('Barcha tillarni AI bilan to‘ldirish')}</button>
          <button className="btn sm" disabled={!aiOn || !!busy} onClick={() => void fill([lang])}>{busy === lang ? <Loader2 size={14} className="spin" /> : <Sparkles size={14} />} {LANG_NAMES[lang]}</button>
          {!aiOn && <span className="muted">{L('AI sozlanmagan')}</span>}
        </div>
      )}
      {msg && <p className="notice">{msg}</p>}
      <div className="row" style={{ marginBottom: 10 }}>
        <input type="text" value={q} onChange={(e) => setQ(e.target.value)} placeholder={L('Qidirish…')} style={{ flex: 1, minWidth: 180 }} />
        <label><input type="checkbox" checked={missing} onChange={(e) => setMissing(e.target.checked)} /> {L('Faqat tarjimasizlar')}</label>
      </div>
      <div className="tr-list">
        {items.map((it) => (
          <div key={it.src} className="tr-row">
            <div className="tr-src">{it.src}</div>
            <div className="tr-dst">
              <textarea rows={Math.min(4, Math.ceil(Math.max(it.src.length, (draft[it.src] ?? it.text ?? '').length) / 60) || 1)} value={draft[it.src] ?? it.text ?? ''} placeholder={L('Tarjima yo‘q')} onChange={(e) => setDraft((d) => ({ ...d, [it.src]: e.target.value }))} />
              {draft[it.src] !== undefined && <button className="icon-btn sm" onClick={() => void save(it.src)} aria-label={L('Saqlash')}><Save size={15} /></button>}
              {it.by === 'human' && <span className="badge on">{L('qo‘lda')}</span>}
            </div>
          </div>
        ))}
        {!items.length && <p className="muted">{L('Hech narsa topilmadi.')}</p>}
      </div>
    </section>
  );
}
