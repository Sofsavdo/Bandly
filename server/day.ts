// Kun chegarasi O'zbekiston vaqti bo'yicha (UTC+5, yozgi vaqt yo'q): kunlik XP, AI va ovoz limitlari
// Toshkentda soat 00:00 da yangilanadi (avval UTC bo'yicha — soat 05:00 da yangilanardi).
export const TZ_OFFSET_MS = 5 * 3_600_000;
const DAY = 86_400_000;
/** "YYYY-MM-DD" — Toshkent sanasi. */
export const tzDay = (now: number): string => new Date(now + TZ_OFFSET_MS).toISOString().slice(0, 10);
/** Toshkentdagi joriy kun boshlanishi (ms, UTC epoch). */
export const tzDayStart = (now: number): number => Math.floor((now + TZ_OFFSET_MS) / DAY) * DAY - TZ_OFFSET_MS;
