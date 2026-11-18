// Brauzer uchun Mock Arena testlari — javob kalitlarisiz (javoblar faqat serverda: src/content/readingTests.ts va listeningTests.ts).
import data from './mockPublic.json';
import type { PublicListeningTest, PublicReadingTest } from './mockShared';

export const readingTests = data.reading as unknown as PublicReadingTest[];
export const listeningTests = data.listening as unknown as PublicListeningTest[];

/** Metodist kabinetida e'lon qilingan testlarni (javobsiz) ro'yxatga qo'shadi. Ilova ochilishida bir marta chaqiriladi. */
export async function loadStudioTests(): Promise<void> {
  try {
    const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 2500);
    const r = await fetch('/api/mock/tests', { signal: ctl.signal });
    clearTimeout(t);
    if (!r.ok) return;
    const j = (await r.json()) as { reading?: PublicReadingTest[]; listening?: PublicListeningTest[] };
    const add = <T extends { id: string; level: string }>(list: T[], extra: T[] | undefined) => {
      for (const x of extra ?? []) if (x && typeof x.id === 'string' && x.id.startsWith('st-') && !list.some((y) => y.id === x.id)) {
        const at = list.findIndex((y) => y.level > x.level && !('sections' in y && (y as { sections?: unknown[] }).sections?.length));
        list.splice(at < 0 ? list.length : at, 0, x); // daraja tartibida joylashadi
      }
    };
    add(readingTests, j.reading); add(listeningTests, j.listening);
  } catch { /* oflayn: ichki testlar bilan davom etadi */ }
}
