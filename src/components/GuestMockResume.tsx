// Mehmon testni yarim qoldirib yoki topshirib, ro'yxatdan o'tmasdan chiqib ketgan bo'lsa — qaytganda javoblari/natijasi kutayotgani eslatiladi.
import { getAccount } from '../lib/account';
import { openGuestAttempts, attemptRoute } from '../lib/examAttempt';
import { track } from '../lib/track';
import { L } from '../i18n';

export function GuestMockResume() {
  const a = openGuestAttempts().find((x) => attemptRoute(x.testKey));
  if (!a) return null;
  const href = attemptRoute(a.testKey)!;
  const submitted = a.status === 'submitted';
  return (
    <section className="card guest-resume" role="status">
      <b>{submitted ? L('Test natijangiz sizni kutmoqda') : L('Yarim qolgan test')}</b>
      <p style={{ margin: '4px 0 8px' }}>{submitted ? (getAccount() ? L('Javoblaringiz qabul qilingan. Natijani ochish va hisobingizga saqlash uchun bosing.') : L('Javoblaringiz qabul qilingan. Natijani ochish uchun bepul ro‘yxatdan o‘ting yoki hisobingizga kiring.')) : L('Javoblaringiz saqlangan — testni davom ettiring.')}</p>
      <a className="btn primary sm" href={href} onClick={() => { if (submitted) track('mock_guest_signup_click'); }}>{submitted ? L('Natijani ochish') : L('Davom ettirish')}</a>
    </section>
  );
}
