import assert from 'node:assert/strict';
import { L, LANGS, LANG_NAMES, __setForTest, deepTranslate, detectLang, t } from './index';

// O'zbekcha — manba: tarjima talab qilinmaydi
__setForTest('uz', {});
assert.equal(t('nav.exam'), 'Imtihon');
assert.equal(t('greet.progress', { n: 3 }), '3 ta qoldi');
assert.equal(L('{0} ta dars', [5]), '5 ta dars');

// Tarjima topilsa — tarjima, topilmasa — o'zbekcha
__setForTest('ru', { 'Imtihon': 'Экзамен', '{0} ta dars': '{0} уроков', 'Darslar': 'Уроки' });
assert.equal(t('nav.exam'), 'Экзамен');
assert.equal(L('{0} ta dars', [7]), '7 уроков');
assert.equal(L('Yo‘q matn'), 'Yo‘q matn');

// Ma'lumotlar: o'zbekcha maydonlar tarjima qilinadi, inglizcha misollar o'zgarmaydi
const data = { titleUz: 'Darslar', examples: [{ en: 'I am a student.', uz: 'Darslar' }] };
deepTranslate(data);
assert.equal(data.titleUz, 'Уроки');
assert.equal(data.examples[0]!.en, 'I am a student.');

// Tilni aniqlash: saqlangan > Telegram > brauzer; inglizcha brauzer — o'zbekcha
assert.equal(detectLang('kk', 'ru', ['en']), 'kk');
assert.equal(detectLang(null, 'ru', ['uz']), 'ru');
assert.equal(detectLang(null, null, ['ky-KG', 'ru']), 'ky');
assert.equal(detectLang(null, null, ['en-US']), 'uz');
assert.equal(detectLang('xx', null, []), 'uz');
assert.equal(LANGS.length, 6);
assert.ok(LANGS.every((l) => LANG_NAMES[l]));
console.log('i18n.test: OK');
