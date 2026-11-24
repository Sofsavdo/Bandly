import { Send } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { authConfig, getAccount, joinLeague, pendingBotLogin, startBotLogin, waitBotLogin, type Account, type AuthConfig } from '../lib/account';
import { refreshEntitlements } from '../lib/pay';
import { inTelegram, mountLoginWidget, retryWebAppLogin } from '../lib/telegram';
import { track } from '../lib/track';
import { L } from '../i18n';

/** Hisobga kirish. Telegram sozlangan bo'lsa — faqat Telegram orqali (OD-05); aks holda vaqtincha laqab bilan. */
export function JoinForm({ onJoined, text }: { onJoined: (a: Account) => void; text?: string }) {
  const [conf, setConf] = useState<AuthConfig | null>(null);
  useEffect(() => { void authConfig().then(setConf); }, []);
  if (!conf) return <div className="card"><p className="muted">{L('Yuklanmoqda…')}</p></div>;
  return conf.telegram ? <TelegramJoin bot={conf.telegram.bot} host={conf.telegram.host} text={text} onJoined={onJoined} /> : <NickJoin text={text} onJoined={onJoined} />;
}

function TelegramJoin({ bot, host, text, onJoined }: { bot: string; host?: string | null; text?: string; onJoined: (a: Account) => void }) {
  const box = useRef<HTMLDivElement>(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [missing, setMissing] = useState(false);
  const [botUrl, setBotUrl] = useState('');
  const sig = useRef({ cancelled: false });
  // onJoined har chizishda yangi funksiya bo'lishi mumkin: vidjet qayta o'rnatilib, jarayondagi kirish buzilmasligi uchun ref orqali
  const joined = useRef(onJoined); joined.current = onJoined;
  // Telegram vidjeti faqat BotFather'da ko'rsatilgan domenda ishlaydi (boshqasida "Bot domain invalid") — bot orqali kirish hamma manzilda ishlaydi
  const widgetHere = !host || location.host === host;
  const done = (a: Account) => { track('login_bot_done'); void refreshEntitlements(); joined.current(a); };

  useEffect(() => {
    if (!widgetHere || !box.current) return;
    mountLoginWidget(box.current, bot, (e) => {
      if (e) return setErr(e);
      const a = getAccount(); if (a) { void refreshEntitlements(); joined.current(a); }
    });
    // Vidjet 7 soniyada paydo bo'lmasa (telegram.org ochilmayapti yoki internet sekin) — foydalanuvchi bot yo'lini ko'rsin
    const t = setTimeout(() => { if (box.current && !box.current.querySelector('iframe')) { setMissing(true); track('login_widget_missing'); } }, 7000);
    return () => clearTimeout(t);
  }, [bot, widgetHere]);

  // Telegram ilovasiga o'tganda brauzer sahifani xotiradan chiqarib yuborgan bo'lsa — qaytganda kutish davom etadi
  useEffect(() => {
    const p = pendingBotLogin();
    if (p && !inTelegram()) {
      setBusy(true);
      waitBotLogin(p.poll, sig.current, p.until).then(done, (e: Error) => { if (!sig.current.cancelled) setErr(e.message); }).finally(() => { if (!sig.current.cancelled) setBusy(false); });
    }
    return () => { sig.current.cancelled = true; };
  }, []);

  const viaBot = async () => {
    setBusy(true); setErr(''); setBotUrl('');
    sig.current.cancelled = true; sig.current = { cancelled: false }; // oldingi kutish bo'lsa to'xtatiladi
    const w = window.open('', '_blank'); // bosish paytida ochiladi — keyin ochilsa mobil brauzer bloklaydi
    try {
      track('login_bot_start');
      const { url, poll } = await startBotLogin();
      setBotUrl(url); if (w) w.location.href = url;
      done(await waitBotLogin(poll, sig.current));
    } catch (e) { w?.close(); setErr((e as Error).message); } finally { setBusy(false); setBotUrl(''); }
  };
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
            {widgetHere && missing && <p className="muted tg-note">{L('Telegram tugmasi chiqmadi? Pastdagi tugma orqali kiring.')}</p>}
            {/* Ishonchli yo'l: botda tasdiqlanadi, sahifa o'zi kiradi (domen va telefon raqami so'ralmaydi) */}
            <button type="button" className="btn primary tg-open" disabled={busy} onClick={() => void viaBot()}>{busy ? L('Botda tasdiqlang…') : L('Telegram bot orqali kirish')}</button>
            {busy && botUrl && <a className="btn sm" href={botUrl} target="_blank" rel="noreferrer">{L('Botni ochish')}</a>}
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
