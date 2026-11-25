import type { CurriculumNode } from '../curriculum/types';
import type { Lesson, Unit } from './types';
import { A1_U1, A1_U2 } from './a1';
import { A2_U1, A2_U2 } from './a2';
import { B1_U1, B1_U2 } from './b1';
import { B2_U1, B2_U2 } from './b2';
import { C1_U1, C1_U2 } from './c1';
import { C2_U1 } from './c2';
import { A1_U3, A2_U3, B1_U3 } from './extra';
import { WRITING } from './writing';
import { LESSON_VOCAB } from './lessonVocab';
import { listeningFromExamples } from './listening';
import { B2_U3, C1_U3, C2_U2 } from './upper';
import { A1_U4, A1_U5, A1_U6, A1_U7, A1_U8 } from './a1more';
import { A1_U11 } from './a1family';
import { A1_U12, A1_U13, A1_U14 } from './a1home';
import { A1_U15, A1_U16, A1_U17 } from './a1body';
import { A1_U18, A1_U19, A1_U20 } from './a1life';
import { A1_U21, A1_U22, A1_U23, A1_U24 } from './a1comm';
import { A2_U4, A2_U5, A2_U6, A2_U7, A2_U8 } from './a2more';
import { B1_U4, B1_U5, B1_U6, B1_U7, B1_U8 } from './b1more';
import { B2_U4, B2_U5, B2_U6, B2_U7, B2_U8 } from './b2more';
import { C1_U4, C1_U5, C1_U6, C1_U7, C1_U8 } from './c1more';
import { C2_U3, C2_U4, C2_U5, C2_U6, C2_U7, C2_U8 } from './c2more';
import { A1_S1, A1_S2, A1_U9, A1_U10 } from './starter';
import { A2_U9, A2_U10, B1_U9, B1_U10 } from './midplus';
import { B2_U9, B2_U10, C1_U9, C1_U10 } from './upperplus';
import { C2_U9, C2_U10 } from './c2plus';
import { A2_U11, A2_U12, A2_U13 } from './a2x1';
import { A2_U14, A2_U15, A2_U16 } from './a2x2';
import { IELTS_UNITS, IELTS_TRACKS } from '../ielts';
import { SAT_UNITS, satSectionOf } from '../sat';

/** General English path (pilot slice A1–C2). Order matters: units and lessons follow the learning sequence. */
const withWriting = (u: Unit): Unit => ({ ...u, lessons: u.lessons.map((l) => {
  const w = WRITING[l.id] ? { ...l, writing: WRITING[l.id] } : l;
  const v = (w.vocab?.length ?? 0) < 3 && LESSON_VOCAB[l.id] ? { ...w, vocab: LESSON_VOCAB[l.id] } : w; // eski darslarga so'zlar (juftini top o'yini uchun)
  const listen = listeningFromExamples(v); // darsning o'z misollaridan eshitib tushunish mashqlari
  return listen.length ? { ...v, practice: [...v.practice, ...listen] } : v;
}) });
export const UNITS: Unit[] = [A1_S1, A1_S2, A1_U1, A1_U2, A1_U3, A1_U4, A1_U11, A1_U5, A1_U6, A1_U7, A1_U8, A1_U9, A1_U10, A1_U12, A1_U13, A1_U14, A1_U15, A1_U16, A1_U17, A1_U18, A1_U19, A1_U20, A1_U21, A1_U22, A1_U23, A1_U24, A2_U1, A2_U2, A2_U3, A2_U4, A2_U5, A2_U6, A2_U7, A2_U8, A2_U9, A2_U10, A2_U11, A2_U12, A2_U13, A2_U14, A2_U15, A2_U16, B1_U1, B1_U2, B1_U3, B1_U4, B1_U5, B1_U6, B1_U7, B1_U8, B1_U9, B1_U10, B2_U1, B2_U2, B2_U3, B2_U4, B2_U5, B2_U6, B2_U7, B2_U8, B2_U9, B2_U10, C1_U1, C1_U2, C1_U3, C1_U4, C1_U5, C1_U6, C1_U7, C1_U8, C1_U9, C1_U10, C2_U1, C2_U2, C2_U3, C2_U4, C2_U5, C2_U6, C2_U7, C2_U8, C2_U9, C2_U10].map(withWriting);

const flatten = (units: Unit[]) => units.flatMap((unit) => unit.lessons.map((lesson, index) => ({ unit, lesson, index })));
export const ALL_LESSONS: { unit: Unit; lesson: Lesson; index: number }[] = flatten(UNITS);
/** IELTS kursi darslari (General English yo'lidan alohida, o'z tartibi bilan). */
export { IELTS_UNITS };
export const IELTS_LESSONS: { unit: Unit; lesson: Lesson; index: number }[] = flatten(IELTS_UNITS);
export const isIeltsLesson = (id: string): boolean => id.startsWith('ie-');
/** SAT kursi darslari (alohida yo'l: Reading & Writing va Math, har bir bo'lim ichida ketma-ket). */
export { SAT_UNITS };
export const SAT_LESSONS: { unit: Unit; lesson: Lesson; index: number }[] = flatten(SAT_UNITS);
export const isSatLesson = (id: string): boolean => id.startsWith('sat-');
export const lessonById = (id: string) => ALL_LESSONS.find((x) => x.lesson.id === id) ?? IELTS_LESSONS.find((x) => x.lesson.id === id) ?? SAT_LESSONS.find((x) => x.lesson.id === id);

type Progress = Record<string, { passedAt: number | null } | undefined>;
const LV = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
/** IELTS darsining ochiqligi: bo'lim ichida ketma-ket; Start bo'limi doim ochiq;
 *  Core bo'limi — shu ko'nikmaning Start bo'limi to'liq o'tilganda yoki o'quvchi darajasi B2 va undan yuqori bo'lsa. */
export function ieltsUnlocked(unit: Unit, index: number, progress: Progress, level: string | null | undefined): boolean {
  if (index > 0) return !!progress[unit.lessons[index - 1]!.id]?.passedAt;
  const track = IELTS_TRACKS.find((t) => t.core.id === unit.id);
  if (!track) return true;
  return LV.indexOf(level ?? 'A1') >= LV.indexOf('B2') || track.start.lessons.every((l) => !!progress[l.id]?.passedAt);
}
/** SAT darsining ochiqligi: Reading & Writing va Math — ikki mustaqil yo'l; har birida dars ketma-ket (oldingi dars o'tilgach ochiladi), birinchi dars doim ochiq. */
export function satUnlocked(unit: Unit, index: number, progress: Progress): boolean {
  if (index > 0) return !!progress[unit.lessons[index - 1]!.id]?.passedAt;
  const section = satSectionOf(unit.id);
  const units = SAT_UNITS.filter((u) => satSectionOf(u.id) === section);
  const k = units.findIndex((u) => u.id === unit.id);
  if (k <= 0) return true;
  const prev = units[k - 1]!;
  return !!progress[prev.lessons[prev.lessons.length - 1]!.id]?.passedAt;
}
/** SAT kursidagi keyingi ochiq, o'tilmagan dars (berilgan bo'lim ichida; bo'lim berilmasa — Reading & Writing, so'ng Math). */
export function nextSatLesson(progress: Progress, section?: 'rw' | 'math'): { unit: Unit; lesson: Lesson; index: number } | undefined {
  return SAT_LESSONS.find((x) => (!section || satSectionOf(x.unit.id) === section) && !progress[x.lesson.id]?.passedAt && satUnlocked(x.unit, x.index, progress));
}
/** Keyingi dars shu kurs ichida: GE darsidan keyin GE darsi, IELTS darsidan keyin shu ko'nikmaning keyingi darsi, SAT darsidan keyin shu bo'limning keyingi darsi. */
export function nextInCourse(id: string) {
  const list = isIeltsLesson(id) ? IELTS_LESSONS : isSatLesson(id) ? SAT_LESSONS : ALL_LESSONS;
  const i = list.findIndex((x) => x.lesson.id === id);
  if (i < 0) return undefined;
  const n = list[i + 1];
  if (n && isSatLesson(id)) return satSectionOf(n.unit.id) === satSectionOf(list[i]!.unit.id) ? n : undefined; // Reading & Writing dan Math ga sakramaydi
  if (!n || !isIeltsLesson(id)) return n;
  return n.unit.id.slice(0, 4) === list[i]!.unit.id.slice(0, 4) ? n : undefined; // ie-r* → faqat Reading ichida
}
/** IELTS kursidagi keyingi ochiq, o'tilmagan dars (kunlik reja uchun): A2–B1 — to'rt ko'nikmaning Start darslari, so'ng Core; B2+ — Core dan boshlanadi. */
export function nextIeltsLesson(progress: Progress, level: string | null | undefined): { unit: Unit; lesson: Lesson; index: number } | undefined {
  const strong = LV.indexOf(level ?? 'A1') >= LV.indexOf('B2');
  const starts = IELTS_TRACKS.map((t) => t.start), cores = IELTS_TRACKS.map((t) => t.core);
  const order = strong ? [...cores, ...starts] : [...starts, ...cores]; // avval barcha ko'nikmalarning Start darslari, keyin Core
  for (const u of order) for (let i = 0; i < u.lessons.length; i++) {
    if (!progress[u.lessons[i]!.id]?.passedAt && ieltsUnlocked(u, i, progress, level)) return { unit: u, lesson: u.lessons[i]!, index: i };
  }
  return undefined;
}
export const lessonNodeId = (lessonId: string): string => `ge.lesson.${lessonId}`;

/** Each lesson is a curriculum node; its prerequisite is the previous lesson in the global sequence, so the graph is a single A1-rooted path. */
const toNodes = (all: typeof ALL_LESSONS): CurriculumNode[] => all.map(({ unit, lesson }, i) => ({
  id: lessonNodeId(lesson.id),
  level: unit.level,
  skill: 'grammar' as const,
  objective: lesson.objective,
  taxonomyIds: lesson.taxonomyIds,
  prerequisites: i === 0 ? [] : [lessonNodeId(all[i - 1]!.lesson.id)],
  estMinutes: lesson.minutes,
  hasPractice: lesson.practice.length > 0,
  hasCheck: lesson.check.length >= 5,
  reviewStatus: unit.status,
}));
export const LESSON_NODES: CurriculumNode[] = toNodes(ALL_LESSONS);

/** Serverdan kelgan (metodist e'lon qilgan) kontentni joriy massivlarga joylaydi — import qilgan barcha modullar yangisini ko'radi. */
export function applyUnits(units: Unit[]): void {
  if (!units.length) return;
  UNITS.splice(0, UNITS.length, ...units);
  ALL_LESSONS.splice(0, ALL_LESSONS.length, ...flatten(UNITS));
  LESSON_NODES.splice(0, LESSON_NODES.length, ...toNodes(ALL_LESSONS));
}


import { vocab } from '../vocab';
const baseWord = (en: string): string => en.split(/\s+[–-]\s+/)[0]!.trim().toLowerCase();
/** Vocabulary ids (shared word list) for the words a lesson introduces. Words not in the list are skipped. */
export function lessonWordIds(lessonId: string): string[] {
  const l = lessonById(lessonId)?.lesson;
  return (l?.vocab ?? []).map((v) => vocab.find((w) => w.word.toLowerCase() === baseWord(v.en))?.id).filter((x): x is string => !!x);
}
