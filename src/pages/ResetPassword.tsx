// Parolni tiklash: Telegram botidagi /parol havolasi (#/reset?t=…). Kalit 15 daqiqa va bir marta amal qiladi (server/passwordReset.ts).
import { useEffect, useState } from 'react';
import { KeyRound } from 'lucide-react';
import { resetPassword } from '../lib/account';
import { L } from '../i18n';

export default function ResetPassword() {
  const token = new URLSearchParams(location.hash.split('?')[1] ?? '').get('t') ?? '';
  const [valid, setValid] = useState<boolean | null>(null);
  const [pw, setPw] = useState(''); const [pw2, setPw2] = useState('');
  const [err, setErr] = useState(''); const [busy, setBusy] = useState(false); const [done, setDone] = useState(false);
  useEffect(() => { void fetch(`/api/auth/reset?t=${encodeURIComponent(token)}`).then((r) => r.json()).then((j: { valid?: boolean }) => setValid(!!j.valid)).catch(() => setValid(false)); }, [token]);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr('');
    if (pw !== pw2) { setErr(L('Parollar bir xil emas')); return; }
    setBusy(true);
    try { await resetPassword(token, pw); setDone(true); setTimeout(() => { location.hash = '#/'; }, 1500); } catch (x) { setErr((x as Error).message); } finally { setBusy(false); }
  };
  return (
    <div className="login-wall">
      <section className="card reset-card">
        <h2><KeyRound size={20} />  {L('Yangi parol')}</h2>
        {valid === null ? <p className="muted">{L('Tekshirilmoqda…')}</p>
          : done ? <p className="evidence" role="status">{L('Parol yangilandi. Hisobingizga kirdingiz.')}</p>
          : !valid ? <p className="notice">{L('Havola eskirgan yoki allaqachon ishlatilgan. Telegram botda /parol buyrug‘ini qayta yuboring.')}</p>
          : (
            <form onSubmit={(e) => void submit(e)} style={{ display: 'grid', gap: 10 }}>
              <input type="password" autoComplete="new-password" minLength={8} maxLength={128} value={pw} onChange={(e) => setPw(e.target.value)} placeholder={L('Yangi parol (kamida 8 belgi)')} aria-label={L('Yangi parol')} />
              <input type="password" autoComplete="new-password" minLength={8} maxLength={128} value={pw2} onChange={(e) => setPw2(e.target.value)} placeholder={L('Parolni takrorlang')} aria-label={L('Parolni takrorlang')} />
              {err && <p className="notice" role="alert">{err}</p>}
              <button className="btn primary" type="submit" disabled={busy || pw.length < 8 || pw2.length < 8}>{busy ? L('Kuting…') : L('Parolni saqlash')}</button>
              <p className="muted" style={{ margin: 0, fontSize: 13 }}>{L('Saqlangach boshqa qurilmalardagi kirishlar yopiladi.')}</p>
            </form>
          )}
      </section>
    </div>
  );
}
