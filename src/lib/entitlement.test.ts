import assert from 'node:assert/strict';
import { hasAnyTrack, hasTrack } from './entitlement';

const now = Date.UTC(2026, 10, 18);
const p = (plan: Partial<Record<'exam' | 'grammar' | 'mocks', boolean>>, until: Partial<Record<'exam' | 'grammar' | 'mocks', number | null>> = {}) =>
  ({ plan: { exam: false, grammar: false, mocks: false, ...plan }, planUntil: until });
assert.equal(hasTrack(p({ exam: true }, { exam: now + 1000 }), 'exam', now), true, 'faol obuna');
assert.equal(hasTrack(p({ exam: true }, { exam: now - 1000 }), 'exam', now), false, 'muddati tugagan obuna darhol yopiladi (belgi eskirgan bo‘lsa ham)');
assert.equal(hasTrack(p({ grammar: true }), 'grammar', now), true, 'demo belgisi (server muddati yo‘q)');
assert.equal(hasTrack(p({}), 'mocks', now), false);
assert.equal(hasAnyTrack(p({ exam: true }, { exam: now - 1 }), now), false);
assert.equal(hasAnyTrack(p({}, { grammar: now + 1 }), now), true, 'server muddati bo‘lsa belgidan qat’i nazar');
console.log('entitlement.test: OK');
