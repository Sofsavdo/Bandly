import assert from 'node:assert/strict';
import { resultLink, wrapLines } from './shareCard';

assert.equal(resultLink('/placement'), 'https://sellzen.uz/#/placement', 'mehmon: kodsiz');
assert.equal(resultLink('/placement', 'ab3k9xyz'), 'https://sellzen.uz/?ref=ab3k9xyz#/placement', 'kirgan: taklif kodi bilan');
assert.equal(resultLink('mocks', null, 'https://x.uz/'), 'https://x.uz/#/mocks');
assert.match(resultLink('/placement', 'ab3k9xyz'), /[?&#]ref=([a-z2-9]{6,10})\b/, 'captureRef regexi bilan mos');
assert.deepEqual(wrapLines('Sen ham 3 daqiqada bepul tekshir', 13), ['Sen ham 3', 'daqiqada', 'bepul tekshir']);
console.log('shareCard: OK');
