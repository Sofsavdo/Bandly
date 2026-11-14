// Exam formats as DATA with provenance. Only fields backed by an official source are marked verified.
export interface FormatField<T> { value: T; verified: boolean; source?: string }
export interface SectionFormat { id: 'listening' | 'reading' | 'writing' | 'speaking'; nameUz: string; items: FormatField<string>; minutes: FormatField<number> }
export interface ExamFormat {
  id: string;
  country: string;          // ISO 3166-1
  nameUz: string;
  levels: FormatField<string[]>;
  sections: SectionFormat[];
  scoring: FormatField<{ scale: string; cutoffs: { level: string; range: string }[] }>;
  verifiedAt: string;       // date the official sources were read
  sources: { title: string; url: string }[];
  notesUz: string[];        // what is NOT verified
}

const LEX = 'O‘zbekiston Respublikasi Vazirlar Mahkamasining 16.02.2022 dagi 73-son qarori (2026-yil 29-iyuldagi 411-son qaror tahririgacha), 22- va 27-bandlar';
const JOURNAL = 'UzBMB “Axborotnoma / Bulletin” 1/2023, A.A. Abbosov, “Analysis of multilevel English language proficiency tests”, 1-jadval';

export const UZ_MULTILEVEL: ExamFormat = {
  id: 'uz-multilevel-en',
  country: 'UZ',
  nameUz: 'CEFR Multilevel (ingliz tili, O‘zbekiston)',
  levels: { value: ['B1', 'B2', 'C1'], verified: true, source: LEX },
  sections: [
    { id: 'listening', nameUz: 'Tinglab tushunish', items: { value: '35 ta topshiriq', verified: true, source: LEX }, minutes: { value: 45, verified: true, source: LEX } },
    { id: 'reading', nameUz: 'O‘qish', items: { value: '35 ta topshiriq', verified: true, source: LEX }, minutes: { value: 60, verified: true, source: LEX } },
    { id: 'writing', nameUz: 'Yozma ish', items: { value: '2 ta topshiriq: 1-topshiriq 100–150 so‘z, 2-topshiriq 200–250 so‘z', verified: true, source: LEX }, minutes: { value: 60, verified: true, source: LEX } },
    { id: 'speaking', nameUz: 'Gapirish', items: { value: '3 turdagi topshiriq', verified: true, source: LEX }, minutes: { value: 15, verified: true, source: LEX } },
  ],
  scoring: {
    value: { scale: 'standart ball (eng yuqori 75)', cutoffs: [{ level: 'C1', range: '65–75' }, { level: 'B2', range: '51–64' }, { level: 'B1', range: '38–50' }, { level: 'B1 dan past', range: '1–37' }] },
    verified: true,
    source: JOURNAL,
  },
  verifiedAt: '2026-11-14',
  sources: [
    { title: 'Vazirlar Mahkamasining 73-son qarori (lex.uz)', url: 'https://lex.uz/docs/-5863626' },
    { title: 'UzBMB Axborotnoma 1/2023 — Multilevel testlar tahlili (PDF)', url: 'https://ejournal.uzbmb.uz/media/files/journals/split_article/9.pdf' },
  ],
  notesUz: [
    'Har bo‘limning ichki qismlari (masalan, Listening nechta qismdan iboratligi) va topshiriq turlari rasmiy manbalarda ko‘rsatilmagan — boshqa saytlardagi ma’lumotlar bir-biriga zid, shuning uchun bu yerda keltirilmadi.',
    'Ball chegaralari 2023-yilgi rasmiy jurnal maqolasidan olingan; ular keyinchalik o‘zgargan bo‘lishi mumkin.',
    'Bandly bu imtihonning rasmiy materiallaridan foydalanmaydi; mashqlar Bandly’ning o‘z kontenti.',
  ],
};
