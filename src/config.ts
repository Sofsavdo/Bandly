import type { TrackId } from './lib/types';

export const FREE_GAMES_PER_DAY = 2;

export interface Plan {
  id: TrackId;
  title: string;
  short: string;
  features: string[];
  /** NAMUNAVIY narx (so'm/oy). Haqiqiy narx oldindan sotuv (pre-sale) sinovidan keyin belgilanadi. */
  priceUzs: number;
  icon: string;
}

export const PLANS: Plan[] = [
  {
    id: 'exam',
    title: 'Imtihon tayyorgarligi',
    short: 'IELTS (Reading, Listening, Writing, Speaking). SAT va CEFR tez orada.',
    features: ['IELTS 4 ta bo‘lim', 'Kunlik reja va maqsad', 'So‘z o‘yinlari cheksiz', 'SAT va CEFR qo‘shilganda bepul'],
    priceUzs: 149_000,
    icon: '🎯',
  },
  {
    id: 'grammar',
    title: 'Grammar',
    short: 'Mavzular bo‘yicha mashqlar, o‘zbekcha tushuntirish, xatolar ustida ishlash.',
    features: ['Barcha grammar mavzulari', 'O‘zbekcha izohlar', 'Xatolarni takrorlash', 'So‘z o‘yinlari cheksiz'],
    priceUzs: 79_000,
    icon: '🧩',
  },
  {
    id: 'mocks',
    title: 'Mock testlar',
    short: 'Reading va Listening mocklar endi bepul (Mock Arena). Obuna: to‘liq imtihon simulyatsiyasi (Writing + Speaking bilan).',
    features: ['To‘liq imtihon simulyatsiyasi', 'Writing va Speaking qismlari', 'Natijalar tarixi', 'So‘z o‘yinlari cheksiz'],
    priceUzs: 99_000,
    icon: '⏱️',
  },
];

export const TRACK_NAME: Record<TrackId, string> = {
  exam: 'Imtihon tayyorgarligi',
  grammar: 'Grammar',
  mocks: 'Mock testlar',
};
