import { LogOut, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getAccount, signOut } from '../lib/account';
import { L } from '../i18n';

/** Hisobdan chiqish oynasi. Progress hisobda qoladi. */
export function SignOutDialog({ onClose }: { onClose: () => void }) {
  const acc = getAccount();
  const [copied, setCopied] = useState(false);
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
        {!acc.tg && (
          <p className="notice">{L('Qayta kirish uchun hisob kodi kerak bo‘ladi.')}{' '}
            <button className="btn sm" onClick={async () => { await navigator.clipboard.writeText(acc.token).catch(() => {}); setCopied(true); }}>{copied ? L('Nusxalandi') : L('Kodni nusxalash')}</button>
          </p>
        )}
        <div className="row so-actions">
          <button className="btn primary" onClick={() => void signOut(false)}><LogOut size={16} />  {L('Hisobdan chiqish')}</button>
          <button className="btn" onClick={onClose}>{L('Bekor qilish')}</button>
        </div>
      </div>
    </>
  );
}
