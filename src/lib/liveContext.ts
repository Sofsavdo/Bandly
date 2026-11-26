// Ovozli ustozga beriladigan o'quvchi konteksti: daraja, maqsad, bugungi reja, zaif joylar, takrorlanadigan xatolar, oxirgi darslar.
// Ustoz suhbatni shu tavsiya asosida olib boradi (dars haqida savollarga javob beradi, o'rgatadi, topshiriq beradi). Faqat ilovadagi haqiqiy ma'lumot:
// to'qilgan raqam yo'q. Serverga qisqa JSON ketadi (server yana qisqartiradi va yo'nalishlarni tekshiradi).
import { nodeById, skillNodeTitle, topicOfNode } from '../content/curriculum/inventory';
import { ALL_LESSONS, UNITS, lessonById, nextIeltsLesson, nextSatLesson } from '../content/lessons';
import { loadAdaptive, localDayKey } from './adaptive/store';
import { buildDailyPlan } from './dailyPlan';
import { adjustMinutes, loadLog, review } from './planLog';
import { loadPrefs } from './planPrefs';
import { loadSkills } from './skillCheck';
import { loadProgress, nextLesson } from './lessons';
import { dueMistakes } from './mistakes';
import type { PlanTask } from './adaptive/recommend';

const WHY: Record<string, (t: PlanTask) => string> = {
  revision_due: () => 'due for review',
  repeated_error: (t) => `repeated mistake: ${String(t.params.taxonomy ?? '')}`,
  exam_soon: (t) => `exam in ${t.params.days} days`,
  goal_match: () => 'matches their goal',
  weak_skill: (t) => `weak skill (mastery ${t.params.mastery}%)`,
  next_step: () => 'next step',
};

export interface LiveCtxInput { level: string | null; examDate?: string | null }
export function buildLiveContext(p: LiveCtxInput, now = Date.now()): Record<string, unknown> {
  const prefs = loadPrefs();
  const out: Record<string, unknown> = { level: p.level, goal: prefs.goal === 'general' ? 'General English' : prefs.goal.toUpperCase(), minutes: prefs.minutes, today: [], weak: [], mistakesDue: 0, done: [] };
  try {
    const examMs = p.examDate ? new Date(p.examDate).getTime() : NaN;
    if (Number.isFinite(examMs)) out.examDays = Math.max(0, Math.ceil((examMs - now) / 86_400_000));
    const saved = loadAdaptive();
    const progress = loadProgress();
    const rows: { title: string; minutes: number; why: string; route: string }[] = [];
    if (p.level) {
      const day = localDayKey(now);
      const load = adjustMinutes(prefs.minutes, review(loadLog(), saved.mastery, day));
      const { tasks } = buildDailyPlan({ level: p.level, saved, prefs: { ...prefs, minutes: load.minutes }, skills: loadSkills(), examDate: Number.isFinite(examMs) ? examMs : undefined, now });
      // Kursni davom ettirish: keyingi ochiq dars (rejadagi dars bo'lmasa ham)
      const next = nextLesson(UNITS, progress, p.level);
      const nl = next ? lessonById(next.lessonId) : undefined;
      if (nl) rows.push({ title: nl.lesson.titleUz, minutes: nl.lesson.minutes, why: 'next lesson in their course', route: `#/learn/${nl.lesson.id}` });
      for (const t of tasks) {
        const lesson = ALL_LESSONS.find((x) => `ge.lesson.${x.lesson.id}` === t.nodeId);
        const node = nodeById(t.nodeId);
        const title = lesson ? lesson.lesson.titleUz : skillNodeTitle(t.nodeId) ?? topicOfNode(t.nodeId) ?? node?.id ?? t.nodeId;
        const route = lesson ? `#/learn/${lesson.lesson.id}` : node?.skill === 'reading' ? '#/mocks/reading' : node?.skill === 'listening' ? '#/mocks/listening' : node?.skill === 'vocabulary' ? '#/games' : '#/grammar';
        if (rows.some((r) => r.title === title)) continue;
        rows.push({ title, minutes: t.minutes, why: (WHY[t.reason] ?? (() => ''))(t), route });
      }
      if (prefs.goal === 'ielts') { const ie = nextIeltsLesson(progress, p.level); if (ie) rows.push({ title: ie.lesson.titleUz, minutes: ie.lesson.minutes, why: 'IELTS course', route: `#/learn/${ie.lesson.id}` }); }
      if (prefs.goal === 'sat') { const sa = nextSatLesson(progress); if (sa) rows.push({ title: sa.lesson.titleUz, minutes: sa.lesson.minutes, why: 'SAT course', route: `#/learn/${sa.lesson.id}` }); }
    }
    out.today = rows.slice(0, 5);
    // Takrorlanadigan xatolar (oxirgi yozuvlar bo'yicha eng ko'p uchraydigan 3 tasi)
    const freq = new Map<string, number>(); for (const e of saved.errors) freq.set(e, (freq.get(e) ?? 0) + 1);
    out.weak = [...freq.entries()].filter(([, n]) => n >= 2).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([id]) => id);
    out.mistakesDue = dueMistakes().length;
    out.done = Object.entries(progress).filter(([, v]) => v.passedAt).sort((a, b) => (b[1].passedAt ?? 0) - (a[1].passedAt ?? 0)).slice(0, 3).map(([id]) => lessonById(id)?.lesson.titleUz ?? '').filter(Boolean);
  } catch { /* kontekst ixtiyoriy: xato bo'lsa ustoz kontekstsiz ishlaydi */ }
  return out;
}
