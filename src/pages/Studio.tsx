// Metodist kabineti (#/studio): bo'lim va darslarni tahrirlash, tartiblash, arxivlash, e'lon qilish, fayldan import.
// Ruxsat: rol "methodologist" yoki "admin" (server tekshiradi). O'quvchilar faqat e'lon qilingan versiyani ko'radi.
import { ArrowDown, ArrowUp, Archive, CheckCircle2, FilePlus2, Loader2, Pencil, Plus, RotateCcw, Send, Upload, Volume2, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { JoinForm } from '../components/JoinForm';
import type { Lesson } from '../content/lessons/types';
import { getAccount } from '../lib/account';
import { formatItems, formatPairs, parseItems, parsePairs } from '../lib/lessonDsl';
import { validateLesson } from '../lib/lessons';
import { ImportPanel } from '../components/ImportPanel';
import { L } from '../i18n';

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
type Status = 'draft' | 'published' | 'archived';
interface TLesson { id: string; status: Status; dirty: boolean; title: string; errors: string[]; data: Lesson }
interface TUnit { id: string; level: string; status: Status; dirty: boolean; data: { titleUz: string; title: string; situationUz: string }; lessons: TLesson[] }

export async function studio<T>(method: string, path: string, body?: unknown): Promise<T> {
  const r = await fetch(`/api/studio/${path}`, { method, headers: { 'x-token': getAccount()?.token ?? '', ...(body ? { 'content-type': 'application/json' } : {}) }, body: body ? JSON.stringify(body) : undefined });
  const j = (await r.json().catch(() => ({}))) as T & { error?: string };
  if (!r.ok) throw Object.assign(new Error(j.error ?? L('Xato {0}', [r.status])), { status: r.status });
  return j;
}

const STATUS_UZ: Record<Status, string> = { draft: L('Qoralama'), published: L('E’lon qilingan'), archived: 'Arxivda' };
const badge = (s: Status, dirty: boolean) => <span className={`badge ${s === 'published' && !dirty ? 'on' : ''}`}>{STATUS_UZ[s]}{s !== 'archived' && dirty ? L(' · o‘zgarish e’lon qilinmagan') : ''}</span>;

export default function Studio() {
  const [acc, setAcc] = useState(getAccount());
  const [units, setUnits] = useState<TUnit[] | null>(null);
  const [err, setErr] = useState('');
  const [denied, setDenied] = useState(false);
  const [level, setLevel] = useState<(typeof LEVELS)[number]>('A1');
  const [edit, setEdit] = useState<TLesson | null>(null);
  const [importTo, setImportTo] = useState<TUnit | null>(null);
  const [busy, setBusy] = useState('');
  const [msg, setMsg] = useState('');
  const [role, setRole] = useState<string>('');

  const load = useCallback(async () => {
    try { const j = await studio<{ units: TUnit[]; role: string }>('GET', 'tree'); setUnits(j.units); setRole(j.role); setErr(''); }
    catch (e) { const s = (e as { status?: number }).status; if (s === 403 || s === 401) setDenied(true); else setErr((e as Error).message); }
  }, []);
  useEffect(() => { if (acc) void load(); }, [acc, load]);

  const act = async (label: string, fn: () => Promise<unknown>, ok?: string) => {
    setBusy(label); setMsg('');
    try { await fn(); await load(); if (ok) setMsg(ok); } catch (e) { setMsg((e as Error).message); } finally { setBusy(''); }
  };
  const move = (list: { id: string }[], i: number, d: number) => {
    const j = i + d; if (j < 0 || j >= list.length) return;
    const ids = list.map((x) => x.id); [ids[i], ids[j]] = [ids[j]!, ids[i]!];
    void act('reorder', () => studio('POST', 'reorder', { ids }));
  };

  if (!acc) return <div><div className="card"><h2>{L('Metodist kabineti')}</h2><p>{L('Kabinetga kirish uchun hisobingizga kiring.')}</p></div><JoinForm onJoined={setAcc} /></div>;
  if (denied) return <div className="card"><h2>{L('Metodist kabineti')}</h2><p>{L('Bu bo‘lim faqat metodist va adminlar uchun. Ruxsat olish uchun administratorga laqabingizni yuboring:')} <b>{acc.nickname}</b>.</p></div>;
  if (!units) return <div className="card"><p className="muted"><Loader2 className="spin" size={16} />  {L('Yuklanmoqda…')}</p>{err && <p className="notice">{err}</p>}</div>;

  if (edit) return <LessonEditor lesson={edit} onClose={() => setEdit(null)} onSaved={async (m) => { await load(); setMsg(m); setEdit(null); }} />;

  const list = units.filter((u) => u.level === level);
  return (
    <div>
      <div className="card">
        <h2 style={{ margin: 0 }}>{L('Metodist kabineti')}</h2>
        <p className="muted" style={{ margin: '6px 0 10px' }}>{L('O‘zgarishlar avval qoralama bo‘lib saqlanadi; o‘quvchilar faqat “E’lon qilish”dan keyin ko‘radi. O‘chirilgan (arxivlangan) dars tiklanishi mumkin.')}</p>
        <div className="seg" role="tablist" aria-label={L('Daraja')}>{LEVELS.map((l) => <button key={l} type="button" role="tab" aria-selected={l === level} className={l === level ? 'on' : ''} onClick={() => setLevel(l)}>{l} <small>({units.filter((u) => u.level === l).reduce((s, u) => s + u.lessons.filter((x) => x.status !== 'archived').length, 0)})</small></button>)}</div>
        {msg && <p className="notice" style={{ marginTop: 10 }} role="status">{msg}</p>}
      </div>

      {list.map((u, ui) => (
        <section key={u.id} className={`card studio-unit ${u.status === 'archived' ? 'archived' : ''}`}>
          <div className="studio-row">
            <div style={{ minWidth: 0 }}><h3 style={{ margin: 0 }}>{u.data.titleUz}</h3><span className="muted" style={{ fontSize: 13 }}>{u.id} · {u.lessons.length}  {L('dars')}</span> {badge(u.status, u.dirty)}</div>
            <div className="studio-actions">
              <button className="icon-btn sm" aria-label={L('Yuqoriga')} disabled={ui === 0 || !!busy} onClick={() => move(list, ui, -1)}><ArrowUp size={15} /></button>
              <button className="icon-btn sm" aria-label={L('Pastga')} disabled={ui === list.length - 1 || !!busy} onClick={() => move(list, ui, 1)}><ArrowDown size={15} /></button>
              <button className="btn sm" onClick={() => { const t = prompt(L('Bo‘lim nomi (o‘zbekcha)'), u.data.titleUz); if (t) void act('unit', () => studio('PUT', `unit/${u.id}`, { data: { titleUz: t } }), L('Bo‘lim nomi saqlandi (qoralama).')); }}><Pencil size={14} />  {L('Nomi')}</button>
              {(u.status !== 'published' || u.dirty) && u.status !== 'archived' && <button className="btn sm primary" onClick={() => void act('pub', () => studio('POST', `unit/${u.id}/publish`), L('Bo‘lim e’lon qilindi.'))}><Send size={14} />  {L('E’lon')}</button>}
              {u.status === 'archived' ? <button className="btn sm" onClick={() => void act('res', () => studio('POST', `unit/${u.id}/restore`))}><RotateCcw size={14} />  {L('Tiklash')}</button>
                : <button className="btn sm danger" onClick={() => { if (confirm(L('Bo‘limni arxivlaysizmi? O‘quvchilardan yashiriladi, keyin tiklash mumkin.'))) void act('arc', () => studio('POST', `unit/${u.id}/archive`)); }}><Archive size={14} />  {L('Arxiv')}</button>}
            </div>
          </div>
          <ol className="studio-lessons">
            {u.lessons.map((l, li) => (
              <li key={l.id} className={l.status === 'archived' ? 'archived' : ''}>
                <div style={{ minWidth: 0 }}>
                  <b>{li + 1}. {l.title}</b> {badge(l.status, l.dirty)}
                  {l.errors.length > 0 && <span className="badge warn">{l.errors.length}  {L('ta xato')}</span>}
                </div>
                <div className="studio-actions">
                  <button className="icon-btn sm" aria-label={L('Yuqoriga')} disabled={li === 0 || !!busy} onClick={() => move(u.lessons, li, -1)}><ArrowUp size={15} /></button>
                  <button className="icon-btn sm" aria-label={L('Pastga')} disabled={li === u.lessons.length - 1 || !!busy} onClick={() => move(u.lessons, li, 1)}><ArrowDown size={15} /></button>
                  <button className="btn sm" onClick={() => setEdit(l)}><Pencil size={14} />  {L('Tahrirlash')}</button>
                  {l.status !== 'archived' && l.data.examples?.some((e) => !e.audio) && <button className="btn sm" title={L('Misollarni ElevenLabs bilan ovozlashtirish')} onClick={() => void act('voice', async () => { const r = await studio<{ voiced: number }>('POST', `lesson/${l.id}/voice`, { voice: u.level.startsWith('C') || u.level === 'B2' ? 'uk' : 'us' }); setMsg(L('{0} ta misol ovozlashtirildi. O‘quvchilarga chiqishi uchun darsni e’lon qiling.', [r.voiced])); })}><Volume2 size={14} />  {L('Ovoz')}</button>}
                  {(l.status !== 'published' || l.dirty) && l.status !== 'archived' && <button className="btn sm primary" disabled={l.errors.length > 0} title={l.errors.length ? L('Avval xatolarni tuzating') : ''} onClick={() => void act('pub', () => studio('POST', `lesson/${l.id}/publish`), L('Dars e’lon qilindi — o‘quvchilar endi uni ko‘radi.'))}><Send size={14} />  {L('E’lon')}</button>}
                  {l.status === 'archived' ? <button className="btn sm" onClick={() => void act('res', () => studio('POST', `lesson/${l.id}/restore`))}><RotateCcw size={14} />  {L('Tiklash')}</button>
                    : <button className="btn sm danger" onClick={() => { if (confirm(L('Darsni arxivlaysizmi (o‘chirish)? Keyin tiklash mumkin.'))) void act('arc', () => studio('POST', `lesson/${l.id}/archive`)); }}><Archive size={14} />  {L('O‘chirish')}</button>}
                </div>
              </li>
            ))}
          </ol>
          <div className="row">
            <button className="btn sm" onClick={() => void act('new', async () => { const r = await studio<{ id: string }>('POST', 'lesson', { unitId: u.id }); setMsg(L('Yangi dars yaratildi ({0}). Uni tahrirlang.', [r.id])); })}><Plus size={14} />  {L('Bo‘sh dars')}</button>
            <button className="btn sm primary" onClick={() => setImportTo(u)}><Upload size={14} />  {L('Fayldan import (AI)')}</button>
          </div>
        </section>
      ))}

      {role === 'admin' && <StaffPanel />}
      <button className="btn" onClick={() => { const t = prompt(L('{0} uchun yangi bo‘lim nomi (o‘zbekcha)', [level])); if (t) void act('unit', () => studio('POST', 'unit', { level, data: { titleUz: t } }), L('Bo‘lim yaratildi (qoralama).')); }}><FilePlus2 size={16} /> {level}  {L('uchun yangi bo‘lim')}</button>
      {importTo && <ImportPanel unit={{ id: importTo.id, level: importTo.level, titleUz: importTo.data.titleUz }} onClose={() => setImportTo(null)} onDone={async (m: string) => { setImportTo(null); await load(); setMsg(m); }} />}
    </div>
  );
}

function LessonEditor({ lesson, onClose, onSaved }: { lesson: TLesson; onClose: () => void; onSaved: (msg: string) => void }) {
  const d = lesson.data;
  const [f, setF] = useState({
    titleUz: d.titleUz, title: d.title ?? '', objectiveUz: d.objectiveUz ?? '', objective: d.objective ?? '', minutes: String(d.minutes ?? 15),
    taxonomy: (d.taxonomyIds ?? []).join(', '), explanation: (d.explanationUz ?? []).join('\n'),
    table: formatPairs((d.table ?? []).map((r) => [r.form, r.example])), examples: formatPairs((d.examples ?? []).map((e) => [e.en, e.uz])),
    practice: formatItems(d.practice ?? []), check: formatItems(d.check ?? []),
    wPrompt: d.writing?.promptUz ?? '', wMin: String(d.writing?.minWords ?? 30), wModel: d.writing?.model ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF((x) => ({ ...x, [k]: e.target.value }));
  const pp = parseItems(f.practice), pc = parseItems(f.check);
  const built: Lesson = {
    ...d, titleUz: f.titleUz.trim(), title: f.title.trim(), objectiveUz: f.objectiveUz.trim(), objective: f.objective.trim(), minutes: Math.max(1, Number(f.minutes) || 15),
    taxonomyIds: f.taxonomy.split(',').map((x) => x.trim()).filter(Boolean) as Lesson['taxonomyIds'],
    explanationUz: f.explanation.split(/\r?\n/).map((x) => x.trim()).filter(Boolean),
    table: parsePairs(f.table).map(([form, example]) => ({ form, example })),
    examples: parsePairs(f.examples).map(([en, uz]) => { const old = (d.examples ?? []).find((x) => x.en === en); return old?.audio ? { en, uz, audio: old.audio } : { en, uz }; }), // matn o'zgarmagan misolning ovozi saqlanadi
    practice: pp.items, check: pc.items,
    writing: f.wPrompt.trim() ? { promptUz: f.wPrompt.trim(), minWords: Math.max(5, Number(f.wMin) || 30), require: d.writing?.require ?? [], forbid: d.writing?.forbid, model: f.wModel.trim() } : undefined,
  };
  const errors = [...validateLesson(built), ...pp.errors.map((e) => L('Mashq {0}-qator: {1}', [e.line, e.message])), ...pc.errors.map((e) => L('Tekshiruv {0}-qator: {1}', [e.line, e.message]))];
  const save = async (andPublish: boolean) => {
    setSaving(true); setMsg('');
    try {
      await studio('PUT', `lesson/${lesson.id}`, { data: built });
      if (andPublish) await studio('POST', `lesson/${lesson.id}/publish`);
      onSaved(andPublish ? L('Saqlandi va e’lon qilindi.') : L('Qoralama saqlandi.'));
    } catch (e) { setMsg((e as Error).message); } finally { setSaving(false); }
  };
  const area = (k: keyof typeof f, label: string, hint: string, rows = 5) => (
    <label className="studio-field"><b>{label}</b><span className="muted">{hint}</span><textarea rows={rows} value={f[k]} onChange={set(k)} spellCheck={false} /></label>
  );
  return (
    <div className="card studio-editor">
      <div className="studio-row"><h2 style={{ margin: 0 }}>{L('Darsni tahrirlash')}</h2><button className="icon-btn" aria-label={L('Yopish')} onClick={onClose}><X size={18} /></button></div>
      <p className="muted" style={{ fontSize: 13 }}>{lesson.id}</p>
      <div className="studio-grid">
        <label className="studio-field"><b>{L('Nomi (o‘zbekcha)')}</b><input value={f.titleUz} onChange={set('titleUz')} /></label>
        <label className="studio-field"><b>{L('Nomi (inglizcha)')}</b><input value={f.title} onChange={set('title')} /></label>
        <label className="studio-field"><b>{L('Maqsad (o‘zbekcha)')}</b><input value={f.objectiveUz} onChange={set('objectiveUz')} /></label>
        <label className="studio-field"><b>{L('Maqsad (inglizcha)')}</b><input value={f.objective} onChange={set('objective')} /></label>
        <label className="studio-field"><b>{L('Daqiqa')}</b><input inputMode="numeric" value={f.minutes} onChange={set('minutes')} /></label>
        <label className="studio-field"><b>{L('Xato turlari (taksonomiya)')}</b><input value={f.taxonomy} onChange={set('taxonomy')} placeholder={L('G.tense, G.article')} /></label>
      </div>
      {area('explanation', L('Tushuntirish'), L('Har qator — alohida paragraf.'))}
      {area('table', 'Jadval', L('Har qator: shakl ::: misol'), 4)}
      {area('examples', L('Misollar'), L('Har qator: English ::: o‘zbekcha (kamida 3 ta)'), 4)}
      {area('practice', L('Mashq savollari'), L('? savol | variant | *to‘g‘ri | izoh   ·   _ gap ___ | javob1; javob2 | izoh   ·   = to‘g‘ri gap | izoh  (kamida 4 ta)'), 6)}
      {area('check', L('Yakuniy tekshiruv'), L('Xuddi shu format, kamida 5 ta savol.'), 6)}
      <details className="fold"><summary>{L('Yozma topshiriq')}</summary>
        <label className="studio-field"><b>{L('Topshiriq')}</b><textarea rows={2} value={f.wPrompt} onChange={set('wPrompt')} /></label>
        <label className="studio-field"><b>{L('Eng kam so‘z')}</b><input value={f.wMin} onChange={set('wMin')} /></label>
        <label className="studio-field"><b>{L('Namuna javob')}</b><textarea rows={3} value={f.wModel} onChange={set('wModel')} /></label>
        <p className="muted" style={{ fontSize: 13 }}>{L('Grammatik qoidalar tekshiruvi (')}{d.writing?.require.length ?? 0}  {L('ta) saqlanadi; namuna javob ulardan o‘tishi kerak.')}</p>
      </details>
      {errors.length > 0
        ? <div className="notice" role="alert"><b>{errors.length}  {L('ta xato — tuzatilmaguncha e’lon qilinmaydi:')}</b><ul>{errors.slice(0, 12).map((e) => <li key={e}>{e}</li>)}</ul></div>
        : <p className="ok"><CheckCircle2 size={16} />  {L('Tekshiruvdan o‘tdi:')} {built.practice.length}  {L('ta mashq,')} {built.check.length}  {L('ta tekshiruv savoli.')}</p>}
      {msg && <p className="notice">{msg}</p>}
      <div className="row">
        <button className="btn" disabled={saving} onClick={() => void save(false)}>{L('Qoralama saqlash')}</button>
        <button className="btn primary" disabled={saving || errors.length > 0} onClick={() => void save(true)}><Send size={14} />  {L('Saqlash va e’lon qilish')}</button>
        <button className="btn" onClick={onClose}>{L('Bekor qilish')}</button>
      </div>
    </div>
  );
}

/** Admin: metodistlarni qo'shish / olib tashlash (laqab bo'yicha). */
function StaffPanel() {
  const [list, setList] = useState<{ nickname: string; role: string }[]>([]);
  const [nick, setNick] = useState('');
  const [msg, setMsg] = useState('');
  const call = async (path: string, init?: RequestInit) => { const r = await fetch(path, { ...init, headers: { 'x-token': getAccount()?.token ?? '', 'content-type': 'application/json' } }); const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error((j as { error?: string }).error ?? L('Xato {0}', [r.status])); return j; };
  const load = async () => { try { setList(((await call('/api/staff')) as { staff: { nickname: string; role: string }[] }).staff); } catch (e) { setMsg((e as Error).message); } };
  useEffect(() => { void load(); }, []);
  const setRole = async (nickname: string, on: boolean) => { try { await call('/api/staff/role', { method: 'POST', body: JSON.stringify({ nickname, role: on }) }); setNick(''); setMsg(on ? `${nickname} — metodist.` : `${nickname} — rol olib tashlandi.`); await load(); } catch (e) { setMsg((e as Error).message); } };
  return (
    <section className="card">
      <h3 style={{ marginTop: 0 }}>{L('Admin: xodimlar')}</h3>
      <p className="muted" style={{ fontSize: 13 }}>{L('Metodist avval saytda hisob ochadi, so‘ng uning laqabini shu yerga yozing.')}</p>
      <div className="row"><input value={nick} onChange={(e) => setNick(e.target.value)} placeholder={L('Laqab')} style={{ padding: 8, borderRadius: 10, border: '1.5px solid var(--line)' }} /><button className="btn sm primary" disabled={nick.trim().length < 2} onClick={() => void setRole(nick.trim(), true)}>{L('Metodist qilish')}</button></div>
      <ul>{list.map((x) => <li key={x.nickname}>{x.nickname} — {x.role === 'admin' ? 'admin' : 'metodist'} {x.role !== 'admin' && <button className="btn sm" onClick={() => void setRole(x.nickname, false)}>{L('Olib tashlash')}</button>}</li>)}</ul>
      {msg && <p className="notice">{msg}</p>}
    </section>
  );
}
