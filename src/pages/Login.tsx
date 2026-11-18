import { useState } from 'react';
import { JoinForm } from '../components/JoinForm';
import { Mascot } from '../components/Mascot';
import { refreshEntitlements } from '../lib/pay';
import { restoreAccount } from '../lib/account';
import { L } from '../i18n';

/** Ro'yxatdan o'tmagan mehmon ilova sahifasini ochganda: kirish talab qilinadi (bepul tarif ham hisob bilan). */
export default function Login() {
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState('');
  return (
    <div className="login-wall">
      <Mascot mood="happy" size={72} />
      <h2>{L('Davom etish uchun kiring')}</h2>
      <p className="muted">{L('Bepul. Progressingiz har qanday qurilmada saqlanadi.')}</p>
      <JoinForm onJoined={() => { /* hisob o'zgarishi App'ni qayta chizadi */ }} />
      <details className="fold login-code">
        <summary>{L('Eski hisob kodi bilan kirish')}</summary>
        <div className="row">
          <input type="text" value={code} placeholder={L('Hisob kodi')} onChange={(e) => setCode(e.target.value)} />
          <button className="btn sm" disabled={code.trim().length < 20} onClick={async () => { try { await restoreAccount(code); await refreshEntitlements(); } catch (e) { setMsg((e as Error).message); } }}>{L('Kirish')}</button>
        </div>
        {msg && <p className="notice">{msg}</p>}
      </details>
    </div>
  );
}
