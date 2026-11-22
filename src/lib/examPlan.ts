// Imtihon sanasiga moslashgan tayyorgarlik (P1.2). Mavjud kunlik reja (PlanCard + planLog: bajarilmagan kunlarda yuk kamayadi)
// saqlanadi; bu modul faqat UZOQ MUDDATLI qismni qo'shadi: real imkoniyat bahosi, haftalik bosqichlar va mock jadvali.
// Halollik qoidalari:
//  - Ball kafolatlanmaydi. Baho — ichki REJALASHTIRISH TAXMINI: HOURS_PER_HALF_BAND (0,5 band uchun ~soat) ilmiy kalibrlangan raqam
//    emas; o'quvchiga "taxminiy" deb ko'rsatiladi va hozirgi ball bo'lmasa baho berilmaydi ('unknown').
//  - Yuk o'quvchi tanlagan kunlik vaqtdan oshirilmaydi; sana yaqinlashsa ham vazifalar ko'paymaydi — faqat mock tez-tez bo'ladi.
//  - Haftasiga 5 o'qish kuni deb hisoblanadi (planPrefs weeklyLessonTarget bilan bir xil).
export const HOURS_PER_HALF_BAND = 50;
export const STUDY_DAYS_PER_WEEK = 5;
export type Risk = 'reached' | 'ok' | 'tight' | 'unlikely' | 'unknown' | 'past';
export type FocusSkill = 'reading' | 'listening' | 'writing' | 'speaking';
export interface Milestone { week: number; focus: FocusSkill | 'revision'; mock: boolean; note: 'start' | 'build' | 'exam_week' }
export interface ExamPlan {
  daysLeft: number | null; weeksLeft: number | null;
  availableHours: number | null; neededHours: number | null;
  gap: number | null; risk: Risk;
  milestones: Milestone[];
  nextMockInDays: number | null;
}
const DAY = 86_400_000;

export function examPlan(o: { examAt: number | null; now: number; minutesPerDay: number; current: number | null; target: number; weakest: FocusSkill[]; lastMockAt: number | null }): ExamPlan {
  const daysLeft = o.examAt === null ? null : Math.ceil((o.examAt - o.now) / DAY);
  if (daysLeft === null) return { daysLeft, weeksLeft: null, availableHours: null, neededHours: null, gap: null, risk: 'unknown', milestones: [], nextMockInDays: null };
  if (daysLeft <= 0) return { daysLeft, weeksLeft: 0, availableHours: 0, neededHours: null, gap: null, risk: 'past', milestones: [], nextMockInDays: null };
  const weeksLeft = Math.ceil(daysLeft / 7);
  const availableHours = Math.round(((daysLeft * STUDY_DAYS_PER_WEEK) / 7) * (o.minutesPerDay / 60));
  const cur = o.current !== null && o.current > 0 ? o.current : null;
  const gap = cur === null ? null : Math.max(0, Math.round((o.target - cur) * 2) / 2);
  const neededHours = gap === null ? null : Math.round((gap / 0.5) * HOURS_PER_HALF_BAND);
  const risk: Risk = gap === null ? 'unknown' : gap === 0 ? 'reached' : availableHours >= neededHours! * 1.2 ? 'ok' : availableHours >= neededHours! * 0.7 ? 'tight' : 'unlikely';
  // Haftalik bosqichlar: zaif ko'nikmalar navbat bilan; mock — har 2 haftada, oxirgi 4 haftada har hafta; oxirgi hafta — takrorlash
  const order: FocusSkill[] = [...o.weakest, ...(['writing', 'speaking', 'reading', 'listening'] as FocusSkill[]).filter((s) => !o.weakest.includes(s))];
  const milestones: Milestone[] = Array.from({ length: Math.min(weeksLeft, 12) }, (_, i) => {
    const week = i + 1, last = week === weeksLeft;
    return { week, focus: last ? 'revision' : order[i % order.length]!, mock: last || weeksLeft - week < 4 || week % 2 === 0, note: last ? 'exam_week' : week === 1 ? 'start' : 'build' };
  });
  const sinceMock = o.lastMockAt === null ? null : Math.floor((o.now - o.lastMockAt) / DAY);
  const interval = weeksLeft <= 4 ? 7 : 14;
  const nextMockInDays = sinceMock === null ? 0 : Math.max(0, interval - sinceMock);
  return { daysLeft, weeksLeft, availableHours, neededHours, gap, risk, milestones, nextMockInDays };
}
