import assert from 'node:assert/strict';
import { rejectReason } from './i18nQuality';

const ok = (src: string, tr: string, lang: Parameters<typeof rejectReason>[2]) => assert.equal(rejectReason(src, tr, lang), null, `${lang}: «${tr}» qabul qilinishi kerak edi`);
const no = (src: string, tr: string, lang: Parameters<typeof rejectReason>[2], why: RegExp) => { const r = rejectReason(src, tr, lang); assert.ok(r && why.test(r), `${lang}: «${tr}» rad etilishi kerak edi (${why}), natija: ${r}`); };

// To'g'ri ruscha: inglizcha atamalar lotinda qoladi
ok('Ingliz tilini o‘yin kabi o‘rganing', 'Учите английский как игру', 'ru');
ok('General English · IELTS · CEFR · SAT', 'General English · IELTS · CEFR · SAT', 'ru');
ok('Present Simple: kundalik odatlar', 'Present Simple: повседневные привычки', 'ru');
ok('“I am agree” emas, “I agree” deymiz.', 'Говорим не «I am agree», а «I agree».', 'ru');
ok('{0} ta dars', '{0} уроков', 'ru');
ok('Darslar', 'Сабақтар', 'kk');
ok('Darslar', 'Сабактар', 'ky');
ok('Darslar', 'Дарсҳо', 'tg');
ok('Bepul mock test', 'Free mock test', 'en');

// Kirill harfida yozilgan o'zbekcha — rad
no('Ingliz tilini o‘yin kabi o‘rganing', 'Инглиз тилини ўйин каби ўрганинг', 'ru', /ў|o‘zbekcha/);
no('Bugungi maqsadgacha {0} XP qoldi', 'Бугунги мақсадгача {0} XP қолди', 'ru', /қ|o‘zbek/);
no('Darajani aniqlash testi va bepul mock testlar', 'Даражани аниклаш тести ва бепул мок тестлар', 'ru', /kirill harfida/);
no('Seriya eslatmalari yoqildi', 'Серия эслатмалари ёқилди', 'ky', /қ|kirill/);
// Inglizcha atama tarjima/transliteratsiya qilingan — rad
no('General English · IELTS', 'Генерал Енглисх · ИЕЛТС', 'ru', /General English|IELTS/);
no('Present Simple: kundalik odatlar', 'Настоящее простое время: привычки', 'ru', /Present Simple/);
no('Misol: I have got a car. She has got a dog.', 'Пример: У меня есть машина. У неё есть собака.', 'ru', /inglizcha misol/);
// Lotinda qolgan o'zbekcha — rad
no('Darslar xaritasi', 'Darslar xaritasi', 'ru', /lotincha o‘zbekcha/);
no('Bugun o‘qing', 'Read today o‘qing', 'en', /o‘zbek/);
// {o'rin} yo'qolgan — rad
no('{0} ta dars', 'уроков', 'ru', /o‘rin/);
console.log('i18n quality: OK');
