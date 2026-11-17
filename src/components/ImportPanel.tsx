// Metodist: fayldan dars import qilish. Hujjat (txt, docx, xlsx, pdf, srt/vtt) → matn → AI yordamchi → qoralama darslar.
// Video/audio: fayl saqlanadi, matni (transkript) qo'shiladi — dars videosi bilan birga yaratiladi.
import { FileUp, Loader2, Sparkles, X } from 'lucide-react';
import { useState } from 'react';
import { getAccount } from '../lib/account';
import { L } from '../i18n';

interface Created { id: string; title: string; errors: string[] }

async function upload(file: File): Promise<{ text?: string; media?: { kind: 'video' | 'audio'; url: string } }> {
  const r = await fetch(`/api/studio/upload?name=${encodeURIComponent(file.name)}`, { method: 'POST', headers: { 'x-token': getAccount()?.token ?? '', 'content-type': 'application/octet-stream' }, body: file });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error((j as { error?: string }).error ?? L('Xato {0}', [r.status]));
  return j;
}

export function ImportPanel({ unit, onClose, onDone }: { unit: { id: string; level: string; titleUz: string }; onClose: () => void; onDone: (msg: string) => void }) {
  const [text, setText] = useState('');
  const [note, setNote] = useState('');
  const [media, setMedia] = useState<{ kind: 'video' | 'audio'; url: string } | null>(null);
  const [busy, setBusy] = useState('');
  const [err, setErr] = useState('');
  const [created, setCreated] = useState<Created[] | null>(null);

  const pick = async (f: File | undefined) => {
    if (!f) return;
    setErr(''); setBusy(`“${f.name}” yuklanmoqda…`);
    try {
      const r = await upload(f);
      if (r.media) { setMedia(r.media); setBusy(''); return; }
      setText((t) => (t ? `${t}\n\n` : '') + (r.text ?? ''));
    } catch (e) { setErr((e as Error).message); }
    setBusy('');
  };
  const run = async () => {
    setErr(''); setBusy(L('AI yordamchi materialni dars formatiga o‘giryapti (1–2 daqiqa)…'));
    try {
      const r = await fetch('/api/studio/import', { method: 'POST', headers: { 'x-token': getAccount()?.token ?? '', 'content-type': 'application/json' }, body: JSON.stringify({ unitId: unit.id, text, note, media }) });
      const j = await r.json().catch(() => ({})) as { created?: Created[]; error?: string };
      if (!r.ok) throw new Error(j.error ?? L('Xato {0}', [r.status]));
      setCreated(j.created ?? []);
    } catch (e) { setErr((e as Error).message); }
    setBusy('');
  };

  return (
    <>
      <div className="drawer-back" style={{ zIndex: 70 }} onClick={onClose} />
      <div className="modal card import-panel" role="dialog" aria-modal="true" aria-labelledby="imp-title">
        <div className="studio-row"><h3 id="imp-title" style={{ margin: 0 }}><Sparkles size={18} />  {L('Fayldan import ·')} {unit.level} · {unit.titleUz}</h3><button className="icon-btn" aria-label={L('Yopish')} onClick={onClose}><X size={18} /></button></div>
        {created ? (
          <div>
            <p className="ok">{created.length}  {L('ta dars qoralama sifatida yaratildi. Ularni ko‘rib chiqing, kerak bo‘lsa tahrirlang va e’lon qiling.')}</p>
            <ul>{created.map((c) => <li key={c.id}><b>{c.title}</b> {c.errors.length ? <span className="badge warn">{c.errors.length}  {L('ta xato — tahrirlash kerak')}</span> : <span className="badge on">{L('tekshiruvdan o‘tdi')}</span>}</li>)}</ul>
            <button className="btn primary" onClick={() => onDone(L('{0} ta dars import qilindi (qoralama).', [created.length]))}>{L('Kabinetga qaytish')}</button>
          </div>
        ) : (
          <>
            <p className="muted" style={{ fontSize: 13 }}>{L('Word (.docx), Excel (.xlsx), PDF, matn (.txt) yoki subtitr (.srt, .vtt) yuklang — yoki matnni shu yerga qo‘ying. Video/audio (mp4, webm, mp3) yuklasangiz, uning matnini (transkript) ham qo‘shing. AI yordamchi materialingizni ilova formatiga o‘giradi: tushuntirish, misollar, mashq va tekshiruv savollari, yozma topshiriq. Natija')} <b>{L('qoralama')}</b>  {L('— siz tekshirib e’lon qilasiz.')}</p>
            <label className="btn sm"><FileUp size={14} />  {L('Fayl tanlash')}<input type="file" hidden accept=".txt,.md,.csv,.docx,.xlsx,.pdf,.srt,.vtt,.mp4,.webm,.mov,.m4a,.mp3" onChange={(e) => void pick(e.target.files?.[0])} /></label>
            {media && <p className="notice" style={{ marginTop: 8 }}>{media.kind === 'video' ? 'Video' : 'Audio'}  {L('saqlandi. Endi uning matnini (transkript) quyiga qo‘ying yoki .srt/.vtt fayl yuklang.')}</p>}
            <label className="studio-field"><b>{L('Material matni')}</b><textarea rows={10} value={text} onChange={(e) => setText(e.target.value)} placeholder={L('Qoida tushuntirishi, misollar, mashqlar… Savollar formatda bo‘lsa (? … | *to‘g‘ri | izoh), AI ularni o‘zgartirmasdan oladi.')} /></label>
            <label className="studio-field"><b>{L('Izoh AI uchun (ixtiyoriy)')}</b><input value={note} onChange={(e) => setNote(e.target.value)} placeholder={L('Masalan: 2 ta dars qil; misollarni Toshkent hayotidan ol')} /></label>
            {busy && <p className="muted" role="status"><Loader2 className="spin" size={14} /> {busy}</p>}
            {err && <p className="notice" role="alert">{err}</p>}
            <div className="row"><button className="btn primary" disabled={!!busy || text.trim().length < 20} onClick={() => void run()}><Sparkles size={14} />  {L('AI bilan darsga aylantirish')}</button><button className="btn" onClick={onClose}>{L('Bekor qilish')}</button></div>
          </>
        )}
      </div>
    </>
  );
}
