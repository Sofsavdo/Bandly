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

// ---------- Digital SAT (College Board) ----------
export interface SatFormat {
  verifiedAt: string;
  sections: { nameUz: string; minutes: number; questions: number; modules: string }[];
  totals: { minutes: number; questions: number; breakMin: number };
  adaptiveUz: string;
  domains: { section: 'rw' | 'math'; name: string; uz: string }[];
  scores: { total: string; section: string };
  passagesUz: string;
  sources: { title: string; url: string }[];
  notesUz: string[];
}
export const DIGITAL_SAT: SatFormat = {
  verifiedAt: '2026-11-14',
  sections: [
    { nameUz: 'Reading and Writing', minutes: 64, questions: 54, modules: '2 ta modul × 32 daqiqa' },
    { nameUz: 'Math', minutes: 70, questions: 44, modules: '2 ta modul × 35 daqiqa' },
  ],
  totals: { minutes: 134, questions: 98, breakMin: 10 },
  adaptiveUz: 'Har bo‘lim 2 ta teng modulga bo‘linadi. 1-modulda oson, o‘rta va qiyin savollar aralash; 1-moduldagi natijangizga qarab 2-modul qiyinroq yoki osonroq bo‘ladi.',
  domains: [
    { section: 'rw', name: 'Information and Ideas', uz: 'Ma’lumot va g‘oyalar (matn va grafiklardan xulosa)' },
    { section: 'rw', name: 'Craft and Structure', uz: 'Tuzilma va so‘z (kontekstdagi so‘z, matnlarni bog‘lash)' },
    { section: 'rw', name: 'Expression of Ideas', uz: 'Fikrni ifodalash (matnni tahrirlash, bog‘lovchilar)' },
    { section: 'rw', name: 'Standard English Conventions', uz: 'Standart ingliz qoidalari (gap tuzilishi, moslashuv, tinish belgilari)' },
    { section: 'math', name: 'Algebra', uz: 'Algebra' },
    { section: 'math', name: 'Advanced Math', uz: 'Murakkab matematika' },
    { section: 'math', name: 'Problem-Solving and Data Analysis', uz: 'Masala yechish va ma’lumotlar tahlili' },
    { section: 'math', name: 'Geometry and Trigonometry', uz: 'Geometriya va trigonometriya' },
  ],
  scores: { total: '400–1600', section: 'har bo‘lim 200–800' },
  passagesUz: 'Reading and Writing: 25–150 so‘zli qisqa matnlar (yoki matn juftligi), har biriga bitta test savoli; adabiyot, tarix/ijtimoiy fanlar, gumanitar va tabiiy fanlar mavzularida.',
  sources: [
    { title: 'How the SAT Is Structured (College Board)', url: 'https://satsuite.collegeboard.org/sat/whats-on-the-test/structure' },
    { title: 'The SAT Reading and Writing Section (College Board)', url: 'https://satsuite.collegeboard.org/sat/whats-on-the-test/reading-writing' },
    { title: 'The SAT Math Section (College Board)', url: 'https://satsuite.collegeboard.org/sat/whats-on-the-test/math' },
    { title: 'Understanding SAT Scores (College Board)', url: 'https://satsuite.collegeboard.org/sat/scores/understanding-scores' },
  ],
  notesUz: [
    'Ko‘pchilik savollar test shaklida; Math’dagi ba’zi savollarda javobni o‘zingiz kiritasiz (student-produced response).',
    'Bandly SAT ballini taxmin qilmaydi: haqiqiy ball moslashuvchan modullar va rasmiy shkala asosida hisoblanadi. Ishonchli baho uchun College Board’ning bepul rasmiy Bluebook amaliy testlaridan foydalaning.',
    'Kalkulyator qoidalari va savollar soni bo‘yicha domenlar ulushi bu yerda keltirilmadi (rasmiy sahifadan to‘liq o‘qib bo‘lmadi).',
  ],
};
