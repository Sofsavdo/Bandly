// "O'rganish yo'li": imtihonga faqat test topshirish emas — avval darajani bilish, keyin shu darajadagi darslar va
// ko'nikma strategiyalari, so'ng mashq testlari va to'liq mock. CEFR va SAT uchun mavjud darslardan yig'ilgan yo'l.
import { BookOpenCheck, Compass, Gamepad2, GraduationCap, Mic, Puzzle, Target, Timer } from 'lucide-react';
import { useProfile } from '../lib/store';
import { loadProgress } from '../lib/lessons';
import { UNITS } from '../content/lessons';
import { L } from '../i18n';

type Exam = 'cefr' | 'sat';
interface Step { href: string; icon: typeof Compass; title: string; text: string; done?: boolean }

export function ExamPath({ exam }: { exam: Exam }) {
  const p = useProfile();
  const lvl = p.level;
  const progress = loadProgress();
  const atLevel = lvl ? UNITS.filter((u) => u.level === lvl).flatMap((u) => u.lessons) : [];
  const passed = atLevel.filter((l) => progress[l.id]?.passedAt).length;
  const steps: Step[] = exam === 'cefr' ? [
    { href: '#/placement', icon: Compass, title: L('1. Darajangizni biling'), text: lvl ? L('Hozirgi daraja: {0}. Multilevel’da B2 uchun odatda B1+ darajadan boshlanadi.', [lvl]) : L('3 daqiqalik test — yo‘l shu natijaga qarab tuziladi.'), done: !!lvl },
    { href: '#/learn', icon: BookOpenCheck, title: L('2. Darajangizdagi darslar'), text: lvl ? L('{0}: {1}/{2} dars o‘tildi. Grammatika va so‘z boyligi — Multilevel’ning asosi.', [lvl, passed, atLevel.length]) : L('A1–C2 General English darslari.'), done: atLevel.length > 0 && passed >= atLevel.length },
    { href: '#/grammar', icon: Puzzle, title: L('3. Grammatika'), text: L('Imtihonda ko‘p uchraydigan mavzular, o‘zbekcha izohlar bilan.') },
    { href: '#/ielts', icon: GraduationCap, title: L('4. O‘qish va tinglash strategiyalari'), text: L('IELTS kursidagi Reading/Listening strategiya darslari Multilevel uchun ham ishlaydi (asosiy g‘oya, kalit so‘zlar, vaqtni boshqarish).') },
    { href: '#/mocks', icon: Timer, title: L('5. Mashq testlari'), text: L('Reading va Listening — rasmiy hajm va vaqt bilan. Xatolar izohi bilan.') },
    { href: '#/coach', icon: Mic, title: L('6. Gapirish va yozish'), text: L('Sellzen bilan har kuni suhbat; quyida yozma ish mashqi va AI baho.') },
  ] : [
    { href: '#/placement', icon: Compass, title: L('1. Darajangizni biling'), text: lvl ? L('Hozirgi daraja: {0}. SAT Reading & Writing uchun B2–C1 so‘z boyligi kerak.', [lvl]) : L('3 daqiqalik test — yo‘l shu natijaga qarab tuziladi.'), done: !!lvl },
    { href: '#/learn', icon: BookOpenCheck, title: L('2. B2–C1 darslar'), text: L('Akademik so‘zlar, murakkab gaplar, matn tuzilishi.') },
    { href: '#/grammar', icon: Puzzle, title: L('3. Standard English Conventions'), text: L('Tinish belgilari, moslashuv, zamonlar — SAT’dagi grammatika savollari.') },
    { href: '#/games', icon: Gamepad2, title: L('4. So‘z boyligi'), text: L('So‘z o‘yinlari — Words in Context savollari uchun.') },
    { href: '#/exam', icon: Target, title: L('5. Mashq savollari'), text: L('Quyidagi Reading & Writing va Math savollari — izohlar bilan.') },
  ];
  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>{L('O‘rganish yo‘li')}</h3>
      <p className="muted" style={{ fontSize: 13 }}>{exam === 'cefr' ? L('Darajadan to‘liq testgacha — qadam-baqadam.') : L('So‘z boyligi va grammatika, keyin SAT savollari.')}</p>
      <ol className="exam-path">
        {steps.map((s) => <li key={s.title} className={s.done ? 'done' : ''}><a href={s.href}><s.icon size={18} /><span><b>{s.title}</b><small>{s.text}</small></span></a></li>)}
      </ol>
    </div>
  );
}
