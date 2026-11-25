// SAT kursi: Digital SAT ning ikki bo‘limi bo‘yicha darslik — Reading & Writing (4 bo‘lim, 13 dars) va Math (4 bo‘lim, 16 dars).
// General English va IELTS dan alohida yo‘l: bu yerda til emas, imtihon ko‘nikmasi va mavzu qoidalari o‘rgatiladi; har dars real SAT uslubidagi savollar bilan tugaydi.
// ORIGINAL Sellzen materiali: College Board materiali emas, SAT ball taxmin qilinmaydi.
import type { Unit } from '../lessons/types';
import { balanceChoices } from '../balance';
import { SAT_RW_CONVENTIONS } from './rw1';
import { SAT_RW_EXPRESSION } from './rw2';
import { SAT_RW_CRAFT } from './rw3';
import { SAT_RW_INFO } from './rw4';
import { SAT_MATH_ALGEBRA } from './m1';
import { SAT_MATH_ADVANCED } from './m2';
import { SAT_MATH_DATA } from './m3';
import { SAT_MATH_GEOMETRY } from './m4';

export type SatSection = 'rw' | 'math';
export interface SatTrack { section: SatSection; titleUz: string; units: Unit[] }

/** To'g'ri javob o'rni barcha darslar bo'ylab teng taqsimlanadi (bir joyda to'planib qolmasin). */
let pos = 0;
const balanced = (u: Unit): Unit => ({
  ...u,
  lessons: u.lessons.map((l) => {
    const practice = balanceChoices(l.practice, pos), check = balanceChoices(l.check, pos + l.practice.length);
    pos += l.practice.length + l.check.length;
    return { ...l, practice, check };
  }),
});

export const SAT_TRACKS: SatTrack[] = [
  { section: 'rw', titleUz: 'Reading and Writing', units: [SAT_RW_CONVENTIONS, SAT_RW_EXPRESSION, SAT_RW_CRAFT, SAT_RW_INFO].map(balanced) },
  { section: 'math', titleUz: 'Math', units: [SAT_MATH_ALGEBRA, SAT_MATH_ADVANCED, SAT_MATH_DATA, SAT_MATH_GEOMETRY].map(balanced) },
];
export const SAT_UNITS: Unit[] = SAT_TRACKS.flatMap((t) => t.units);
export const satSectionOf = (unitId: string): SatSection => (unitId.startsWith('sat-rw') ? 'rw' : 'math');
