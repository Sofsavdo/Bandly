// IELTS kursi: har bir ko'nikma uchun ikki pog'ona — Start (A2–B1, format va asosiy usullar) va Core (B2–C1, imtihon darajasi).
// General English darslaridan alohida: bu yerda til emas, imtihon ko'nikmasi o'rgatiladi; har dars real savol turi bilan tugaydi.
import type { Unit } from '../lessons/types';
import { IE_READING_START, IE_READING_CORE } from './reading';
import { IE_LISTENING_START, IE_LISTENING_CORE } from './listening';
import { IE_WRITING_START, IE_WRITING_CORE } from './writing';
import { IE_SPEAKING_START, IE_SPEAKING_CORE } from './speaking';

export type IeltsSkill = 'reading' | 'listening' | 'writing' | 'speaking';
export interface IeltsTrack { skill: IeltsSkill; start: Unit; core: Unit; practiceHref: string }

export const IELTS_TRACKS: IeltsTrack[] = [
  { skill: 'reading', start: IE_READING_START, core: IE_READING_CORE, practiceHref: '#/mocks/reading' },
  { skill: 'listening', start: IE_LISTENING_START, core: IE_LISTENING_CORE, practiceHref: '#/mocks/listening' },
  { skill: 'writing', start: IE_WRITING_START, core: IE_WRITING_CORE, practiceHref: '#/exam/writing' },
  { skill: 'speaking', start: IE_SPEAKING_START, core: IE_SPEAKING_CORE, practiceHref: '#/exam/speaking' },
];
export const IELTS_UNITS: Unit[] = IELTS_TRACKS.flatMap((t) => [t.start, t.core]);
