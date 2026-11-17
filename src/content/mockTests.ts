// Brauzer uchun Mock Arena testlari — javob kalitlarisiz (javoblar faqat serverda: src/content/readingTests.ts va listeningTests.ts).
import data from './mockPublic.json';
import type { PublicListeningTest, PublicReadingTest } from './mockShared';

export const readingTests = data.reading as unknown as PublicReadingTest[];
export const listeningTests = data.listening as unknown as PublicListeningTest[];
