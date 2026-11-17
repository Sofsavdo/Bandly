// Mock Arena testlarining javobsiz nusxasini yaratadi: npx tsx scripts/gen-mock-public.ts
// Test (src/content/mockPublic.test.ts) nusxa asl kontent bilan mos va javobsiz ekanini tekshiradi.
import { writeFileSync } from 'node:fs';
import { listeningTests } from '../src/content/listeningTests';
import { readingTests } from '../src/content/readingTests';
import { stripTest } from '../src/content/mockShared';

const out = { reading: readingTests.map(stripTest), listening: listeningTests.map(stripTest) };
writeFileSync(new URL('../src/content/mockPublic.json', import.meta.url), JSON.stringify(out, null, 1) + '\n');
console.log('mockPublic.json: %d reading, %d listening', out.reading.length, out.listening.length);
