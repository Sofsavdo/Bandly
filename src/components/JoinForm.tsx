import { Send } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { authConfig, getAccount, googleLogin, joinLeague, phoneAuth, type Account, type AuthConfig } from '../lib/account';
import { mountGoogleButton } from '../lib/google';
import { refreshEntitlements } from '../lib/pay';
import { inTelegram, mountLoginWidget, retryWebAppLogin } from '../lib/telegram';
import { track } from '../lib/track';
import { L, getLang } from '../i18n';

/** Hisobga kirish. Telegram sozlangan bo'lsa — faqat Telegram orqali (OD-05); aks holda vaqtincha laqab bilan. */
export function JoinForm({ onJoined, text }: { onJoined: (a: Account) => void; text?: string }) {
  const [conf, setConf] = useState<AuthConfig | null>(null);
  useEffect(() => { void authConfig().then(setConf); }, []);
  if (!conf) return <div className="card"><p className="muted">{L('Yuklanmoqda…')}</p></div>;
  return (
    <>
      {conf.telegram ? <TelegramJoin bot={conf.telegram.bot} host={conf.telegram.host} text={text} onJoined={onJoined} /> : <NickJoin text={text} onJoined={onJoined} />}
      {!inTelegram() && (conf.google || conf.phone) && <AltLogin conf={conf} onJoined={onJoined} />}
    </>
  );
}

/** Boshqa kirish usullari: Google (server GOOGLE_CLIENT_ID bersa) va telefon raqam + parol. Telegram Mini App ichida kerak emas (kirish avtomatik). */
function AltLogin({ conf, onJoined }: { conf: AuthConfig; onJoined: (a: Account) => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [phone, setPhone] = useState('');
  const [pw, setPw] = useState('');
  const [nick, setNick] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const gbox = useRef<HTMLDivElement>(null);
  const joined = useRef(onJoined); joined.current = onJoined;
  const gid = conf.google?.clientId;
  const done = (a: Account) => { void refreshEntitlements(); joined.current(a); };
  useEffect(() => {
    if (!gid || !gbox.current) return;
    void mountGoogleButton(gbox.current, gid, getLang(), (cred) => { setErr(''); setBusy(true); googleLogin(cred).then(done, (e: Error) => setErr(e.message)).finally(() => setBusy(false)); });
  }, [gid]);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(''); setBusy(true);
    try { done(await phoneAuth(mode, phone, pw, mode === 'register' ? nick : undefined)); } catch (x) { setErr((x as Error).message); } finally { setBusy(false); }
  };
  return (
    <div className="card alt-login">
      {gid && <div ref={gbox} className="alt-google" style={{ minHeight: 44, display: 'flex', justifyContent: 'center' }} aria-label={L('Google orqali kirish')} />}
      {conf.phone && (
        <details className="fold alt-phone">
          <summary>{L('Telefon raqam va parol bilan')}</summary>
          <form onSubmit={(e) => void submit(e)} style={{ display: 'grid', gap: 10, marginTop: 10 }}>
            <div className="row" role="group" aria-label={L('Kirish usuli')}>
              <button type="button" className={`btn sm ${mode === 'login' ? 'primary' : ''}`} aria-pressed={mode === 'login'} onClick={() => { setMode('login'); setErr(''); }}>{L('Kirish')}</button>
              <button type="button" className={`btn sm ${mode === 'register' ? 'primary' : ''}`} aria-pressed={mode === 'register'} onClick={() => { setMode('register'); setErr(''); }}>{L('Ro‘yxatdan o‘tish')}</button>
            </div>
            <input type="tel" inputMode="tel" autoComplete="tel" value={phone} placeholder="+998 90 123 45 67" aria-label={L('Telefon raqam')} onChange={(e) => setPhone(e.target.value)} />
            <input type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={pw} minLength={8} maxLength={128} placeholder={mode === 'register' ? L('Parol (kamida 8 belgi)') : L('Parol')} aria-label={L('Parol')} onChange={(e) => setPw(e.target.value)} />
            {mode === 'register' && <input type="text" autoComplete="nickname" value={nick} maxLength={20} placeholder={L('Ismingiz (ixtiyoriy)')} onChange={(e) => setNick(e.target.value)} />}
            <button className="btn primary" type="submit" disabled={busy || phone.trim().length < 9 || pw.length < 8}>{busy ? L('Kuting…') : mode === 'login' ? L('Kirish') : L('Ro‘yxatdan o‘tish')}</button>
            {mode === 'register' && <p className="muted tg-note" style={{ margin: 0 }}>{L('Parolni eslab qoling: uni tiklash hozircha yo‘q.')}</p>}
          </form>
        </details>
      )}
      {err && <p className="notice" style={{ marginTop: 10 }}>{err}</p>}
    </div>
  );
}

function TelegramJoin({ bot, host, text, onJoined }: { bot: string; host?: string | null; text?: string; onJoined: (a: Account) => void }) {
  const box = useRef<HTMLDivElement>(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [missing, setMissing] = useState(false);
  // onJoined har chizishda yangi funksiya bo'lishi mumkin: vidjet qayta o'rnatilib, jarayondagi kirish buzilmasligi uchun ref orqali
  const joined = useRef(onJoined); joined.current = onJoined;
  // Telegram vidjeti faqat BotFather'da ko'rsatilgan domenda ishlaydi (boshqasida "Bot domain invalid")
  const widgetHere = !host || location.host === host;

  useEffect(() => {
    if (!widgetHere || !box.current) return;
    mountLoginWidget(box.current, bot, (e) => {
      if (e) return setErr(e);
      const a = getAccount(); if (a) { void refreshEntitlements(); joined.current(a); }
    });
    // Vidjet 7 soniyada paydo bo'lmasa (telegram.org ochilmayapti yoki internet sekin) — foydalanuvchi boshqa usulni ko'rsin
    const t = setTimeout(() => { if (box.current && !box.current.querySelector('iframe')) { setMissing(true); track('login_widget_missing'); } }, 7000);
    return () => clearTimeout(t);
  }, [bot, widgetHere]);

  const retry = async () => {
    setBusy(true); setErr('');
    try { await retryWebAppLogin(); const a = getAccount(); if (a) { void refreshEntitlements(); onJoined(a); } } catch (e) { setErr((e as Error).message); } finally { setBusy(false); }
  };
  return (
    <div className="card tg-join">
      <h3><Send size={18} />  {L('Telegram orqali kiring')}</h3>
      {text && <p>{text}</p>}
      {inTelegram()
        ? <button className="btn primary" disabled={busy} onClick={() => void retry()}>{busy ? L('Ulanmoqda…') : L('Kirish')}</button>
        : <>
            {widgetHere
              ? <div ref={box} className="tg-widget" aria-label={L('Telegram orqali kirish tugmasi')} />
              : <p className="muted tg-note">{L('Telegram tugmasi faqat bu manzilda ishlaydi:')} <a href={`https://${host}/#/login`}>{host}</a></p>}
            {widgetHere && missing && <p className="muted tg-note">{L('Telegram tugmasi chiqmadi? Pastdagi boshqa usul bilan kiring.')}</p>}
          </>}
      <p className="muted tg-note">{L('Faqat ismingiz va Telegram ID olinadi.')}</p>
      {err && <p className="notice">{err}</p>}
    </div>
  );
}

function NickJoin({ onJoined, text }: { onJoined: (a: Account) => void; text?: string }) {
  const [nick, setNick] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const go = async () => {
    setBusy(true);
    try { onJoined(await joinLeague(nick)); setErr(''); } catch (e) { setErr((e as Error).message); } finally { setBusy(false); }
  };
  return (
    <div className="card">
      <h3>{L('Hisob oching')}</h3>
      <p>{text ?? L('Parol shart emas. Laqabingiz reyting va duellarda ko‘rinadi.')}</p>
      <div className="row">
        <input type="text" value={nick} maxLength={20} placeholder={L('Laqab')} onChange={(e) => setNick(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') void go(); }}
          style={{ padding: 10, borderRadius: 10, border: '2px solid var(--line)', background: 'var(--bg)', color: 'var(--text)', fontSize: 16 }} />
        <button className="btn primary" disabled={busy || nick.trim().length < 2} onClick={() => void go()}>{L('Davom etish')}</button>
      </div>
      {err && <p className="notice" style={{ marginTop: 10 }}>{err}</p>}
    </div>
  );
}
