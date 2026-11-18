// Metodist kabineti: Reading/Listening testlarini matn formatida yaratish, tekshirish va e'lon qilish.
import { Archive, CheckCircle2, ExternalLink, FilePlus2, Pencil, RotateCcw, Save, Send, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { parseTest, TEST_TEMPLATE } from '../lib/testDsl';
import { studio } from '../pages/Studio';
import { L } from '../i18n';

interface Row { id: string; kind: string; status: string; title: string; level: string; questions: number; errors: { line: number; message: string }[]; dirty: boolean; updatedBy: string | null; updatedAt: number; source: string }

const STATUS: Record<string, string> = { draft: L('qoralama'), published: L('e’lon qilingan'), archived: L('arxivda') };

export function StudioTests() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [edit, setEdit] = useState<{ id: string | null; source: string } | null>(null);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const load = useCallback(async () => { try { const j = await studio<{ tests: Row[] }>('GET', 'tests'); setRows(j.tests); } catch (e) { setMsg((e as Error).message); } }, []);
  useEffect(() => { void load(); }, [load]);
  const act = async (fn: () => Promise<unknown>, ok: string) => { setBusy(true); setMsg(''); try { await fn(); await load(); setMsg(ok); } catch (e) { setMsg((e as Error).message); } finally { setBusy(false); } };

  if (edit) return <TestEditor initial={edit} onClose={() => setEdit(null)} onSaved={async (m) => { await load(); setMsg(m); setEdit(null); }} />;
  return (
    <section className="card">
      <h3 style={{ marginTop: 0 }}>{L('Testlar (Reading va Listening)')}</h3>
      <p className="muted" style={{ marginTop: 0 }}>{L('Test matn formatida yoziladi: matn yoki audio skripti va savollar. Xatosiz test “E’lon” qilingach, Mock Arena’da o‘z darajasi bo‘yicha chiqadi. Javoblar o‘quvchiga ko‘rinmaydi — faqat serverda tekshiriladi.')}</p>
      {msg && <p className="notice" role="status">{msg}</p>}
      {!rows ? <p className="muted">{L('Yuklanmoqda…')}</p> : rows.length === 0 ? <p className="muted">{L('Hozircha test yo‘q.')}</p> : (
        <ol className="studio-lessons">
          {rows.map((t) => (
            <li key={t.id} className={t.status === 'archived' ? 'archived' : ''}>
              <div style={{ minWidth: 0 }}>
                <b>{t.title}</b> <span className="muted" style={{ fontSize: 13 }}>{t.kind === 'listening' ? 'Listening' : 'Reading'} · {t.level} · {t.questions}  {L('savol')}</span>{' '}
                <span className={`badge ${t.status === 'published' ? 'on' : ''}`}>{STATUS[t.status] ?? t.status}{t.dirty ? L(' · o‘zgarish e’lon qilinmagan') : ''}</span>
                {t.errors.length > 0 && <span className="badge warn">{L('{0} ta xato', [t.errors.length])}</span>}
              </div>
              <div className="studio-actions">
                <button className="btn sm" onClick={() => setEdit({ id: t.id, source: t.source })}><Pencil size={14} />  {L('Tahrirlash')}</button>
                {t.status === 'published' && <a className="btn sm" href={`#/mocks/${t.kind === 'listening' ? 'listening' : 'reading'}/${t.id}`}><ExternalLink size={14} />  {L('Ko‘rish')}</a>}
                {(t.status !== 'published' || t.dirty) && t.status !== 'archived' && <button className="btn sm primary" disabled={busy || t.errors.length > 0} onClick={() => void act(() => studio('POST', L('tests/{0}/publish', [t.id])), L('Test e’lon qilindi. O‘quvchilar ilovani qayta ochganda ko‘radi.'))}><Send size={14} />  {L('E’lon')}</button>}
                {t.status === 'archived' ? <button className="btn sm" disabled={busy} onClick={() => void act(() => studio('POST', L('tests/{0}/restore', [t.id])), L('Test tiklandi (qoralama).'))}><RotateCcw size={14} />  {L('Tiklash')}</button>
                  : <button className="btn sm danger" disabled={busy} onClick={() => { if (confirm(L('Testni arxivlaysizmi? O‘quvchilardan yashiriladi.'))) void act(() => studio('POST', L('tests/{0}/archive', [t.id])), L('Test arxivlandi.')); }}><Archive size={14} />  {L('Arxiv')}</button>}
              </div>
            </li>
          ))}
        </ol>
      )}
      <button className="btn primary" onClick={() => setEdit({ id: null, source: TEST_TEMPLATE })}><FilePlus2 size={16} />  {L('Yangi test (namuna bilan)')}</button>
    </section>
  );
}

function TestEditor({ initial, onClose, onSaved }: { initial: { id: string | null; source: string }; onClose: () => void; onSaved: (m: string) => void }) {
  const [src, setSrc] = useState(initial.source);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const check = useMemo(() => parseTest(src, initial.id ?? 'st-preview'), [src, initial.id]);
  const save = async () => {
    setBusy(true); setErr('');
    try {
      const r = await studio<{ id: string; errors: unknown[] }>(initial.id ? 'PUT' : 'POST', initial.id ? L('tests/{0}', [initial.id]) : 'tests', { source: src });
      onSaved(r.errors.length ? L('Qoralama saqlandi, lekin {0} ta xato bor — e’lon qilishdan oldin tuzating.', [r.errors.length]) : L('Saqlandi (qoralama). Endi “E’lon” tugmasini bosing.'));
    } catch (e) { setErr((e as Error).message); } finally { setBusy(false); }
  };
  const t = check.test;
  return (
    <section className="card">
      <div className="studio-row"><h3 style={{ margin: 0 }}>{initial.id ? L('Testni tahrirlash') : L('Yangi test')}</h3><button className="icon-btn sm" aria-label={L('Yopish')} onClick={onClose}><X size={16} /></button></div>
      <details className="fold"><summary>{L('Format qoidalari')}</summary>
        <ul className="muted" style={{ fontSize: 14 }}>
          <li>{L('Boshida: Title, Level (A1–C1), Minutes, Kind (reading yoki listening). Listening uchun: Names: A=Ism; B=Ism va Context.')}</li>
          <li>{L('[PASSAGE] — matn abzatslari; listening uchun [SCRIPT] — “A: gap” qatorlari.')}</li>
          <li>{L('[QUESTIONS] — “## Ko‘rsatma” guruh boshlaydi. Savollar: T (True/False/Not Given), M (test, to‘g‘ri variant oldida *), H (moslashtirish), F (bo‘sh joy ______, javoblar ; bilan).')}</li>
          <li>{L('Har savol oxirida “| @ dalil” — o‘quvchi natijada ko‘radigan izoh (ixtiyoriy).')}</li>
        </ul>
      </details>
      <textarea value={src} onChange={(e) => setSrc(e.target.value)} rows={22} spellCheck={false} style={{ width: '100%', fontFamily: 'ui-monospace, monospace', fontSize: 13 }} aria-label={L('Test matni')} />
      {check.errors.length > 0 ? (
        <div className="notice" role="alert"><b>{L('Xatolar ({0}):', [check.errors.length])}</b><ul style={{ margin: '6px 0 0' }}>{check.errors.slice(0, 12).map((e, i) => <li key={i}>{e.line ? L('{0}-qator: ', [e.line]) : ''}{e.message}</li>)}</ul></div>
      ) : t && <p className="ok"><CheckCircle2 size={16} />  {L('Xatosiz: {0} · {1} · {2} savol · {3} daqiqa', [t.kind === 'listening' ? 'Listening' : 'Reading', t.level, t.questions.length, t.minutes])}</p>}
      {err && <p className="notice">{err}</p>}
      <div className="row"><button className="btn primary" disabled={busy} onClick={() => void save()}><Save size={14} />  {L('Saqlash (qoralama)')}</button><button className="btn" onClick={onClose}>{L('Bekor qilish')}</button></div>
    </section>
  );
}
