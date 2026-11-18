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
import { B2_U3, C1_U3, C2_U2 } from './upper';
import { A1_U4, A1_U5, A1_U6, A1_U7, A1_U8 } from './a1more';
import { A2_U4, A2_U5, A2_U6, A2_U7, A2_U8 } from './a2more';
import { B1_U4, B1_U5, B1_U6, B1_U7, B1_U8 } from './b1more';
import { B2_U4, B2_U5, B2_U6, B2_U7, B2_U8 } from './b2more';

/** General English path (pilot slice A1–C2). Order matters: units and lessons follow the learning sequence. */
const withWriting = (u: Unit): Unit => ({ ...u, lessons: u.lessons.map((l) => (WRITING[l.id] ? { ...l, writing: WRITING[l.id] } : l)) });
export const UNITS: Unit[] = [A1_U1, A1_U2, A1_U3, A1_U4, A1_U5, A1_U6, A1_U7, A1_U8, A2_U1, A2_U2, A2_U3, A2_U4, A2_U5, A2_U6, A2_U7, A2_U8, B1_U1, B1_U2, B1_U3, B1_U4, B1_U5, B1_U6, B1_U7, B1_U8, B2_U1, B2_U2, B2_U3, B2_U4, B2_U5, B2_U6, B2_U7, B2_U8, C1_U1, C1_U2, C1_U3, C2_U1, C2_U2].map(withWriting);

const flatten = (units: Unit[]) => units.flatMap((unit) => unit.lessons.map((lesson, index) => ({ unit, lesson, index })));
export const ALL_LESSONS: { unit: Unit; lesson: Lesson; index: number }[] = flatten(UNITS);
export const lessonById = (id: string) => ALL_LESSONS.find((x) => x.lesson.id === id);
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
