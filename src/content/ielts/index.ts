// IELTS kursi: har bir ko'nikma uchun ikki pog'ona — Start (A2–B1, format va asosiy usullar) va Core (B2–C1, imtihon darajasi).
// General English darslaridan alohida: bu yerda til emas, imtihon ko'nikmasi o'rgatiladi; har dars real savol turi bilan tugaydi.
import type { Unit } from '../lessons/types';
import { IE_READING_START, IE_READING_CORE } from './reading';

export type IeltsSkill = 'reading' | 'listening' | 'writing' | 'speaking';
export interface IeltsTrack { skill: IeltsSkill; start: Unit; core: Unit; practiceHref: string }

export const IELTS_TRACKS: IeltsTrack[] = [
  { skill: 'reading', start: IE_READING_START, core: IE_READING_CORE, practiceHref: '#/mocks/reading' },
];
export const IELTS_UNITS: Unit[] = IELTS_TRACKS.flatMap((t) => [t.start, t.core]);
