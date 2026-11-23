import { Send } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { authConfig, getAccount, joinLeague, type Account, type AuthConfig } from '../lib/account';
import { refreshEntitlements } from '../lib/pay';
import { inTelegram, mountLoginWidget, retryWebAppLogin } from '../lib/telegram';
import { L } from '../i18n';

/** Hisobga kirish. Telegram sozlangan bo'lsa — faqat Telegram orqali (OD-05); aks holda vaqtincha laqab bilan. */
export function JoinForm({ onJoined, text }: { onJoined: (a: Account) => void; text?: string }) {
  const [conf, setConf] = useState<AuthConfig | null>(null);
  useEffect(() => { void authConfig().then(setConf); }, []);
  if (!conf) return <div className="card"><p className="muted">{L('Yuklanmoqda…')}</p></div>;
  return conf.telegram ? <TelegramJoin bot={conf.telegram.bot} text={text} onJoined={onJoined} /> : <NickJoin text={text} onJoined={onJoined} />;
}

function TelegramJoin({ bot, text, onJoined }: { bot: string; text?: string; onJoined: (a: Account) => void }) {
  const box = useRef<HTMLDivElement>(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (box.current) mountLoginWidget(box.current, bot, (e) => {
      if (e) return setErr(e);
      const a = getAccount(); if (a) { void refreshEntitlements(); onJoined(a); }
    });
  }, [bot, onJoined]);
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
            <div ref={box} className="tg-widget" aria-label={L('Telegram orqali kirish tugmasi')} />
            {/* Zaxira yo'l: vidjet ishlamasa (domen sozlanmagan, ilova ichidagi brauzer) — botni ochib, ilovaga u yerdan kiriladi */}
            <a className="btn sm tg-open" href={`https://t.me/${bot}`} target="_blank" rel="noreferrer">{L('Telegram ilovasida ochish')}</a>
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
