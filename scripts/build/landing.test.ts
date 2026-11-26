// Landing (index.html) dagi qat'iy raqamlar kontent bilan mos bo'lsin: dars soni o'zgarganda eskirib qolmasin.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ALL_LESSONS } from '../../src/content/lessons';

const html = readFileSync('index.html', 'utf8');
const claims = [...html.matchAll(/(\d[\d\s]*) ta dars/g)].map((m) => Number(m[1]!.replace(/\s/g, '')));
assert.ok(claims.length >= 1, 'index.html da «N ta dars» ko‘rsatkichi topilmadi');
for (const n of claims) assert.equal(n, ALL_LESSONS.length, `index.html da ${n} ta dars yozilgan, kontentda esa ${ALL_LESSONS.length} ta (General English). Raqamni yangilang.`);
console.log(`landing: OK (${ALL_LESSONS.length} ta dars)`);
