import type { Item } from './lessons/types';
import { ch, gap } from './lessons/helpers';

// ORIGINAL Bandly practice items in the style of the Digital SAT domains. Not official College Board material. No SAT score is estimated from them.
export interface SatItem { domain: string; item: Item }

export const SAT_RW: SatItem[] = [
  { domain: 'Standard English Conventions', item: ch('The museum’s collection, which includes over 3,000 manuscripts, ___ visited by thousands of researchers every year.', ['are', 'is', 'have been', 'were'], 1, 'Ega — “The collection” (birlik); vergullar orasidagi qism egaga ta’sir qilmaydi: is.') },
  { domain: 'Standard English Conventions', item: ch('Neither the students nor the teacher ___ aware of the schedule change.', ['were', 'was', 'are', 'have been'], 1, '“neither … nor” da fe’l yaqin turgan egaga moslashadi: the teacher → was.') },
  { domain: 'Standard English Conventions', item: ch('Each of the volunteers ___ a certificate at the end of the program.', ['receive', 'receives', 'are receiving', 'have received'], 1, '“Each” birlik hisoblanadi: receives.') },
  { domain: 'Expression of Ideas', item: ch('Solar panels have become much cheaper over the last decade. ___, many families in rural areas still cannot afford them.', ['Therefore', 'However', 'For example', 'Similarly'], 1, 'Ikkinchi gap birinchisiga zid: However.') },
  { domain: 'Expression of Ideas', item: ch('The new metro line cut travel time between the two districts in half. ___, the number of passengers doubled within a year.', ['As a result', 'Nevertheless', 'In contrast', 'For instance'], 0, 'Ikkinchi gap birinchisining natijasi: As a result.') },
  { domain: 'Craft and Structure', item: ch('The scientist’s findings were initially met with skepticism, but later studies ___ her conclusions, and the theory became widely accepted.', ['corroborated', 'undermined', 'ignored', 'postponed'], 0, 'Nazariya qabul qilingan — demak keyingi tadqiqotlar uni tasdiqlagan: corroborated.') },
  { domain: 'Craft and Structure', item: ch('Although the novel is long, its plot is so ___ that most readers finish it in a few days.', ['compelling', 'tedious', 'obscure', 'fragile'], 0, '“Although … long” va “tez o‘qib tugatishadi” — syujet qiziqarli: compelling.') },
  { domain: 'Information and Ideas', item: ch('A 2020 survey of 500 small businesses in Tashkent found that 62% had started selling online that year. Among businesses with fewer than five employees, the share was 48%; among those with more than twenty employees, it was 81%. Which choice is best supported by the data?', ['Larger businesses in the survey were more likely to sell online than smaller ones.', 'Most businesses with fewer than five employees sold online.', 'Online sales doubled for every business in the survey.', 'Businesses with more than twenty employees stopped selling in stores.'], 0, '81% > 48% — kattaroq korxonalarda ulush yuqori. 48% “ko‘pchilik” emas; qolgan variantlar haqida ma’lumot yo‘q.') },
];

export const SAT_MATH: SatItem[] = [
  { domain: 'Algebra', item: ch('If 3x + 7 = 22, what is the value of x?', ['3', '5', '7', '15'], 1, '3x = 15 → x = 5.') },
  { domain: 'Algebra', item: gap('A phone plan costs $12 per month plus $0.05 per text message. One month’s bill was $15.50. How many text messages were sent? ___', ['70', '70.0'], '(15.50 − 12) / 0.05 = 3.50 / 0.05 = 70.') },
  { domain: 'Algebra', item: gap('The lines y = 2x + 1 and y = −x + 7 intersect at the point (x, y). What is the value of x? ___', ['2', '2.0'], '2x + 1 = −x + 7 → 3x = 6 → x = 2.') },
  { domain: 'Advanced Math', item: ch('Which expression is equivalent to (x + 3)²?', ['x² + 9', 'x² + 6x + 9', 'x² + 3x + 9', '2x + 6'], 1, '(x + 3)² = x² + 2·3·x + 9 = x² + 6x + 9.') },
  { domain: 'Advanced Math', item: gap('If f(x) = 2x² − 3x, what is the value of f(4)? ___', ['20', '20.0'], 'f(4) = 2·16 − 12 = 32 − 12 = 20.') },
  { domain: 'Advanced Math', item: ch('What are the solutions of x² − 5x + 6 = 0?', ['x = 2 and x = 3', 'x = −2 and x = −3', 'x = 1 and x = 6', 'x = −1 and x = 6'], 0, '(x − 2)(x − 3) = 0 → x = 2 yoki x = 3.') },
  { domain: 'Problem-Solving and Data Analysis', item: ch('In a class of 30 students, 18 prefer tea and the rest prefer coffee. What percent of the students prefer coffee?', ['12%', '30%', '40%', '60%'], 2, 'Qahva: 30 − 18 = 12; 12/30 = 0.4 = 40%.') },
  { domain: 'Geometry and Trigonometry', item: ch('A right triangle has legs of length 6 and 8. What is the length of the hypotenuse?', ['10', '12', '14', '48'], 0, '√(6² + 8²) = √100 = 10.') },
  { domain: 'Geometry and Trigonometry', item: ch('In a right triangle, angle A is acute and sin A = 3/5. What is cos A?', ['3/4', '4/5', '5/3', '5/4'], 1, 'sin²A + cos²A = 1 → cos A = √(1 − 9/25) = 4/5.') },
];
