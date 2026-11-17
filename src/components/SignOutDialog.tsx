import { LogOut, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getAccount, signOut } from '../lib/account';

/** Chiqish oynasi: hisobdan chiqish va/yoki qurilmadagi ma'lumotlarni tozalash (yangi foydalanuvchi ko'rinishi). */
export function SignOutDialog({ onClose }: { onClose: () => void }) {
  const acc = getAccount();
  const [copied, setCopied] = useState(false);
  useEffect(() => { const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); }; addEventListener('keydown', k); return () => removeEventListener('keydown', k); }, [onClose]);
  return (
    <>
      <div className="drawer-back" style={{ zIndex: 70 }} onClick={onClose} />
      <div className="modal card" role="dialog" aria-modal="true" aria-labelledby="so-title">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <h3 id="so-title" style={{ margin: 0 }}><LogOut size={18} /> Chiqish</h3>
          <button className="icon-btn" aria-label="Yopish" onClick={onClose}><X size={18} /></button>
        </div>
        {acc
          ? <p>Siz <b>{acc.nickname}</b> hisobidasiz. XP, darslar, natijalar va obuna hisobingizda saqlanadi: chiqqaningizda ular bu qurilmadan olinadi va qayta kirganingizda (istalgan qurilmada) qaytadi.</p>
          : <p>Siz hisobga kirmagansiz: progressingiz faqat shu qurilmada saqlangan.</p>}
        {acc && !acc.tg && (
          <p className="notice">Bu hisob Telegram’ga bog‘lanmagan. Keyin qayta kirish uchun <b>hisob kodi</b> kerak bo‘ladi — chiqishdan oldin uni saqlab qo‘ying.{' '}
            <button className="btn sm" onClick={async () => { await navigator.clipboard.writeText(acc.token).catch(() => {}); setCopied(true); }}>{copied ? 'Nusxalandi' : 'Kodni nusxalash'}</button>
          </p>
        )}
        <div className="stack so-actions">
          {acc
            ? <button className="btn primary" onClick={() => void signOut(false)}><LogOut size={16} /> <span>Hisobdan chiqish<small>Progress hisobda saqlanadi</small></span></button>
            : <button className="btn danger" onClick={() => { if (window.confirm('Bu qurilmadagi barcha progress, XP va natijalar o‘chiriladi. Hisob ochilmagani uchun ularni qaytarib bo‘lmaydi. Davom etasizmi?')) void signOut(true); }}>
              <Trash2 size={16} /> <span>Qurilmani tozalash<small>Sayt yangi foydalanuvchidagidek ochiladi</small></span>
            </button>}
          {!acc && <p className="muted" style={{ fontSize: 13 }}>Progressni saqlab qolmoqchi bo‘lsangiz, avval hisob oching: hozirgi natijalaringiz unga yoziladi.</p>}
        </div>
      </div>
    </>
  );
}
