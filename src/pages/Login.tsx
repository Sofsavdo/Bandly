import { JoinForm } from '../components/JoinForm';
import { LogoMark } from '../components/Logo';
import { L } from '../i18n';

/** Ro'yxatdan o'tmagan mehmon ilova sahifasini ochganda: kirish talab qilinadi (bepul tarif ham hisob bilan).
 *  Kirish usullari: Telegram, Google (sozlansa) va telefon raqam + parol (JoinForm). */
export default function Login() {
  return (
    <div className="login-wall">
      <LogoMark size={72} title={L('Sellzen')} />
      <h2>{L('Davom etish uchun kiring')}</h2>
      <p className="muted">{L('Bepul. Progressingiz har qanday qurilmada saqlanadi.')}</p>
      <JoinForm onJoined={() => { /* hisob o'zgarishi App'ni qayta chizadi */ }} />
      <p className="muted legal-note">{L('Davom etish orqali quyidagilarga rozilik bildirasiz:')} <a href="/shartlar">{L('Foydalanish shartlari')}</a> · <a href="/maxfiylik">{L('Maxfiylik siyosati')}</a></p>
    </div>
  );
}
