import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { listeningTests } from './listeningTests';
import { readingTests } from './readingTests';
import { stripTest } from './mockShared';

const pub = JSON.parse(readFileSync(new URL('./mockPublic.json', import.meta.url), 'utf8'));
assert.deepEqual(pub, JSON.parse(JSON.stringify({ reading: readingTests.map(stripTest), listening: listeningTests.map(stripTest) })), 'mockPublic.json eskirgan: npx tsx scripts/gen-mock-public.ts');
const raw = readFileSync(new URL('./mockPublic.json', import.meta.url), 'utf8');
assert.ok(!/"(answer|answers|evidence)"\s*:/.test(raw), 'ochiq nusxada javob yoki izoh bo‘lmasligi kerak');
console.log('mockPublic.test: OK');
