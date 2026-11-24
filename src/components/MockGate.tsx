// Mehmon mockni topshirdi: natija tayyor, lekin baholash (javob kalitlari) serverda va hisob bilan ochiladi.
// Foyda oldindan aniq aytiladi; javoblar shu qurilmada saqlangan — sahifa yangilansa yoki ro'yxatdan o'tish bekor qilinsa yo'qolmaydi.
import { BarChart3, CalendarCheck, CheckCircle2, LineChart, Lock, Trophy } from 'lucide-react';
import { track } from '../lib/track';
import { L } from '../i18n';

export function MockGate({ answered, total }: { answered: number; total: number }) {
  const here = (location.hash || '#/').split('?')[0]!;
  const href = `#/login?next=${encodeURIComponent(here)}`;
  return (
    <section className="card mock-gate" aria-labelledby="mg-title">
      <span className="eyebrow"><CheckCircle2 size={15} />  {L('Natijangiz tayyor')}</span>
      <h2 id="mg-title" style={{ margin: '6px 0' }}><Lock size={18} style={{ verticalAlign: -3 }} />  {L('Natijani ko‘rish va saqlash uchun bepul ro‘yxatdan o‘ting')}</h2>
      <p>{L('{0} / {1} savolga javob berdingiz. Javoblaringiz shu qurilmada saqlangan — ro‘yxatdan o‘tgach natija darhol ochiladi.', [answered, total])}</p>
      <ul className="mock-gate-list">
        <li><Trophy size={16} />  {L('Test natijasini olasiz va hisobingizda saqlaysiz')}</li>
        <li><BarChart3 size={16} />  {L('Bo‘limlar bo‘yicha kuchli va zaif tomonlaringizni ko‘rasiz')}</li>
        <li><CalendarCheck size={16} />  {L('Xatolaringiz asosida shaxsiy o‘quv rejasini olasiz')}</li>
        <li><LineChart size={16} />  {L('Keyingi progressingizni kuzatib borasiz')}</li>
      </ul>
      <div className="row" style={{ marginTop: 12 }}>
        <a className="btn primary lg" href={href} onClick={() => track('mock_guest_signup_click')}>{L('Bepul ro‘yxatdan o‘tish va natijani ochish')}</a>
        <a className="btn lg" href={href} onClick={() => track('mock_guest_signup_click')}>{L('Hisobim bor — kirish')}</a>
      </div>
      <p className="muted" style={{ fontSize: 13, margin: '10px 0 0' }}>{L('Telegram, Google yoki telefon raqam bilan. Mock testlar bepul.')}</p>
    </section>
  );
}
