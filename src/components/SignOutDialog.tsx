import { LogOut, X } from 'lucide-react';
import { useEffect } from 'react';
import { getAccount, signOut } from '../lib/account';
import { L } from '../i18n';

/** Hisobdan chiqish oynasi. Progress hisobda qoladi. */
export function SignOutDialog({ onClose }: { onClose: () => void }) {
  const acc = getAccount();
  useEffect(() => { const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); }; addEventListener('keydown', k); return () => removeEventListener('keydown', k); }, [onClose]);
  if (!acc) return null;
  return (
    <>
      <div className="drawer-back" style={{ zIndex: 70 }} onClick={onClose} />
      <div className="modal card" role="dialog" aria-modal="true" aria-labelledby="so-title">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <h3 id="so-title" style={{ margin: 0 }}><LogOut size={18} />  {L('Chiqish')}</h3>
          <button className="icon-btn" aria-label={L('Yopish')} onClick={onClose}><X size={18} /></button>
        </div>
        <p>{L('Progressingiz hisobda saqlanadi. Qayta kirsangiz, hammasi qaytadi.')}</p>
        {!acc.tg && <p className="notice">{L('Hisobingiz hali Telegram, Google yoki telefon raqamga bog‘lanmagan. Chiqsangiz, qayta kira olmaysiz — avval bog‘lang.')}</p>}
        <div className="row so-actions">
          {!acc.tg && <a className="btn primary" href="#/profile" onClick={onClose}>{L('Hisobni bog‘lash')}</a>}
          <button className={`btn ${acc.tg ? 'primary' : ''}`} onClick={() => void signOut(false)}><LogOut size={16} />  {acc.tg ? L('Hisobdan chiqish') : L('Baribir chiqish')}</button>
          <button className="btn" onClick={onClose}>{L('Bekor qilish')}</button>
        </div>
      </div>
    </>
  );
}
