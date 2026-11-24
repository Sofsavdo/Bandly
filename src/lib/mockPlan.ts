// Mock natijasidan qisqa shaxsiy reja (taxminiy tavsiya; natija kafolatlanmaydi). Sof funksiyalar — ilova va testlar bir xil kodni ishlatadi.
// Faqat MAVJUD katalogdan tuziladi: IELTS kursi darslari (content/ielts) va Mock Arena testlari. Mos mashq topilmasa — vazifa qo'shilmaydi.
// Progress alohida saqlanmaydi: vazifa bajarilganligi mavjud ma'lumotdan (dars o'tilgan sana, mock natijalari tarixi) hisoblanadi.
import { IELTS_TRACKS } from '../content/ielts';
import { ieltsUnlocked, lessonById } from '../content/lessons';
import type { TypeRow } from '../components/TestReport';
import { examLadder, type LadderResult, type LadderTest } from './examLadder';
import { levelIndex, type Cefr } from './levels';

export type Kind = 'reading' | 'listening';
export type QType = TypeRow['type'];
/** Zaif savol turi → IELTS kursidagi shu turni o'rgatadigan dars (TestReport shu darslarga havola beradi). */
export const WEAK_LESSON: Record<Kind, Partial<Record<QType, string>>> = {
  reading: { tfng: 'ie-rs-l4', mcq: 'ie-rc-l3', fill: 'ie-rs-l5', match: 'ie-rc-l1' },
  listening: { fill: 'ie-ls-l2', mcq: 'ie-lc-l1', match: 'ie-lc-l2' },
};

export type Reason = 'weak_type' | 'prereq' | 'next_test' | 'other_skill' | 'placement';
export interface PlanTask {
  id: string;                                  // 'lesson:ie-rs-l4' | 'mock:reading-6' | 'placement'
  type: 'lesson' | 'mock' | 'placement';
  href: string;                                // bevosita havola (ro'yxat emas)
  title: string;                               // dars/test nomi (tarjima qilinmaydi — kontent nomi)
  minutes: number;
  reason: Reason;
  params: { qtype?: QType; correct?: number; total?: number; skill?: Kind };
  day: number;                                 // 1 = bugun
}
export type PlanTest = LadderTest & { minutes: number };
export interface PlanInput {
  kind: Kind;
  exam: 'ielts' | 'cefr';
  /** Shu urinishning savol turlari bo'yicha natijasi (server bahosidan) */
  rows: TypeRow[];
  takenTestId: string;
  tests: Record<Kind, PlanTest[]>;
  results: Record<Kind, LadderResult[]>;
  /** Daraja testi natijasi (bo'lmasa — null va reja daraja testidan boshlanadi) */
  level: Cefr | null;
  progress: Record<string, { passedAt: number | null } | undefined>;
  /** Kunlik vaqt (planPrefs) */
  minutesPerDay: number;
  /** Bugun yana nechta yangi bepul IELTS darsi ochiladi (null — cheklovsiz) va keyingi kunlarda kuniga nechta (null — cheklovsiz). Server sozlamasidan. */
  freeLeftToday: number | null;
  freePerDay: number | null;
}

const MAX_DAYS = 3;
const WEAK_BELOW = 0.7;
const other = (k: Kind): Kind => (k === 'reading' ? 'listening' : 'reading');
const lessonHref = (id: string): string => `#/learn/${id}`;
const mockHref = (kind: Kind, id: string): string => `#/mocks/${kind}/${id}`;

/** Zaif turni o'rgatadigan darsning hozir BAJARISH MUMKIN varianti: oldingi darslar o'tilmagan bo'lsa, ochiq turgan birinchi o'tilmagan dars (kursdagi ketma-ketlik saqlanadi).
 *  Maqsadgacha hammasi o'tilgan bo'lsa — null (o'rgatadigan yangi narsa yo'q). */
export function doableLesson(lessonId: string, progress: PlanInput['progress'], level: Cefr | null): { lessonId: string; prereq: boolean } | null {
  const track = IELTS_TRACKS.find((t) => [...t.start.lessons, ...t.core.lessons].some((l) => l.id === lessonId));
  if (!track) return null;
  // Core bo'limi ochiq bo'lsa (daraja B2+ yoki Start tugagan) faqat shu bo'lim; yopiq bo'lsa — avval Start bo'limi
  const own = track.core.lessons.some((l) => l.id === lessonId) ? track.core : track.start;
  const seq = own === track.core && !ieltsUnlocked(track.core, 0, progress, level) ? [track.start, track.core] : [own];
  const flat = seq.flatMap((u) => u.lessons.map((l, i) => ({ u, l, i })));
  const target = flat.findIndex((x) => x.l.id === lessonId);
  for (let p = 0; p <= target; p++) {
    const x = flat[p]!;
    if (!progress[x.l.id]?.passedAt && ieltsUnlocked(x.u, x.i, progress, level)) return { lessonId: x.l.id, prereq: p < target };
  }
  return null;
}

/** Keyingi mock: shu imtihon turi (IELTS pog'onasi yoki CEFR) bo'yicha hali yechilmagan test; hozirgi testdan farqli.
 *  Daraja testi yo'q bo'lsa pog'ona A2 dan boshlanadi — u yerda test topilmasa, topshirilgan test darajasiga eng yaqin yechilmagan test olinadi. */
function nextMock(kind: Kind, exam: 'ielts' | 'cefr', input: PlanInput, skipId: string, ref: Cefr | null): PlanTest | null {
  const tests = input.tests[kind].filter((t) => t.id !== skipId);
  const res = input.results[kind];
  const solved = (t: PlanTest) => res.some((r) => r.title === t.title && r.total > 0);
  if (exam === 'cefr') return tests.find((t) => t.exam === 'cefr' && !solved(t)) ?? null;
  const ladder = examLadder(tests, res, input.level);
  const pick = ladder.next ?? ladder.pool.find((t) => !solved(t as PlanTest));
  if (pick) return tests.find((t) => t.id === pick.id) ?? null;
  const r = ref ? levelIndex(ref) : levelIndex('B1');
  return tests.filter((t) => t.exam !== 'cefr' && !t.full && !solved(t)).sort((a, b) => Math.abs(levelIndex(a.level) - r) - Math.abs(levelIndex(b.level) - r))[0] ?? null;
}

export function buildMockPlan(input: PlanInput): PlanTask[] {
  const out: Omit<PlanTask, 'day'>[] = [];
  const seen = new Set<string>();
  const add = (t: Omit<PlanTask, 'day'>) => { if (!seen.has(t.id)) { seen.add(t.id); out.push(t); } };

  if (!input.level) add({ id: 'placement', type: 'placement', href: '#/placement', title: '', minutes: 3, reason: 'placement', params: {} });

  const weak = input.rows.filter((r) => r.total >= 2 && r.correct / r.total < WEAK_BELOW).sort((a, b) => a.correct / a.total - b.correct / b.total).slice(0, 2);
  for (const w of weak) {
    const target = WEAK_LESSON[input.kind][w.type];
    const d = target ? doableLesson(target, input.progress, input.level) : null;
    const l = d ? lessonById(d.lessonId)?.lesson : undefined;
    if (!d || !l) continue; // mos dars yo'q yoki allaqachon o'tilgan — uydirma vazifa qo'shilmaydi
    add({ id: `lesson:${l.id}`, type: 'lesson', href: lessonHref(l.id), title: l.titleUz, minutes: l.minutes, reason: d.prereq ? 'prereq' : 'weak_type', params: { qtype: w.type, correct: w.correct, total: w.total } });
  }

  const ref = input.level ?? input.tests[input.kind].find((t) => t.id === input.takenTestId)?.level ?? null;
  const same = nextMock(input.kind, input.exam, input, input.takenTestId, ref);
  if (same) add({ id: `mock:${same.id}`, type: 'mock', href: mockHref(input.kind, same.id), title: same.title, minutes: same.minutes, reason: 'next_test', params: { skill: input.kind } });
  const o = other(input.kind);
  if (input.results[o].length === 0) {
    const t = nextMock(o, input.exam, input, '', ref);
    if (t) add({ id: `mock:${t.id}`, type: 'mock', href: mockHref(o, t.id), title: t.title, minutes: t.minutes, reason: 'other_skill', params: { skill: o } });
  }

  // Kunlarga taqsimlash: kunlik vaqt chegarasi va (darslar uchun) serverdagi bepul kunlik limit hurmat qilinadi; kuniga kamida bitta vazifa
  const days: { minutes: number; lessons: number }[] = Array.from({ length: MAX_DAYS }, () => ({ minutes: 0, lessons: 0 }));
  const cap = (d: number): number => (d === 0 ? input.freeLeftToday : input.freePerDay) ?? Infinity;
  const tasks: PlanTask[] = [];
  for (const t of out) {
    const isLesson = t.type === 'lesson';
    // eng erta mos keladigan kun (bugun limitga tegmaydigan vazifa — mock yoki daraja testi — darslar limitidan qat'i nazar bugunga tushadi)
    const d = days.findIndex((x, k) => (!isLesson || x.lessons < cap(k)) && (x.minutes === 0 || x.minutes + t.minutes <= input.minutesPerDay));
    if (d < 0) continue;
    days[d]!.minutes += t.minutes; if (isLesson) days[d]!.lessons++;
    tasks.push({ ...t, day: d + 1 });
  }
  tasks.sort((a, b) => a.day - b.day); // barqaror saralash: kun ichida dastlabki ustuvorlik saqlanadi
  return tasks;
}

/** Vazifa bajarilganmi — mavjud ma'lumotdan (alohida progress tizimi yo'q). `since` — reja tuzilgan vaqt. */
export function isTaskDone(t: PlanTask, ctx: { passedAt: (lessonId: string) => number | null; resultAfter: (title: string, since: number) => boolean; level: Cefr | null; since: number }): boolean {
  if (t.type === 'placement') return ctx.level !== null;
  if (t.type === 'lesson') { const at = ctx.passedAt(t.id.slice('lesson:'.length)); return at !== null && at >= ctx.since; }
  return ctx.resultAfter(t.title, ctx.since);
}
