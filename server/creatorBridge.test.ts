import assert from 'node:assert/strict';
import { createDb } from './db';
import { trServer } from './i18n';
import { BRIDGE_KEYS, BRIDGE_LANGS, BRIDGE_UZ, bridgeHtml, pickBridgeLang } from './creatorBridge';

// Oltita til: matnlar loyiha katalogidan (trServer); alohida lug'at yo'q. Boshqa tillarda o'zbekcha manba emas, tarjima qaytadi
const db = createDb();
const tr = (l: string, k: (typeof BRIDGE_KEYS)[number]) => (l === 'uz' ? BRIDGE_UZ[k] : trServer(db, l, BRIDGE_UZ[k]));
assert.deepEqual([...BRIDGE_LANGS].sort(), ['en', 'kk', 'ky', 'ru', 'tg', 'uz']);
for (const l of BRIDGE_LANGS) for (const k of BRIDGE_KEYS) {
  const v = tr(l, k); assert.ok(v && v.length > 5, `${l}.${k} bo‘sh`);
  if (l !== 'uz') assert.notEqual(v, BRIDGE_UZ[k], `${l}.${k}: tarjima katalogda yo‘q`);
  if (l === 'ru' || l === 'kk' || l === 'ky' || l === 'tg') assert.match(v, /[а-яёәғқңөұүһіўӣҳҷ]/i, `${l}.${k} kirill emas`);
}
// Har tilda rasmiy IELTS bilan bog'liq emasligi va kafolat yo'qligi aytilgan (brend qoidasi)
for (const l of BRIDGE_LANGS) assert.match(tr(l, 'disclaimer'), /IELTS/, `${l}: disclaimer`);
// Til tanlash: link tili → brauzer tili → uz
assert.equal(pickBridgeLang('ru', 'en-US'), 'ru', 'link tili ustun'); assert.equal(pickBridgeLang(null, 'kk-KZ,ru;q=0.8'), 'kk'); assert.equal(pickBridgeLang(null, 'tg'), 'tg'); assert.equal(pickBridgeLang(null, 'de-DE'), 'uz'); assert.equal(pickBridgeLang('xx', undefined), 'uz'); assert.equal(pickBridgeLang(null, 'ky-KG'), 'ky');
// HTML: tekshirilgan qiymatlar, Telegram chuqur havolasi alohida variant, bot/dublikat uchun beacon yo'q
const h = bridgeHtml({ lang: 'en', code: 'abcd2345', clickId: '0123456789abcdef', bot: 'Sellzenbot' });
assert.match(h, /href="\/\?ref=abcd2345&cid=0123456789abcdef#\/"/); assert.match(h, /href="https:\/\/t\.me\/Sellzenbot\?start=ref_abcd2345"/); assert.match(h, /noindex/); assert.match(h, /fetch\('\/api\/creator\/ping'/);
const h2 = bridgeHtml({ lang: 'uz', code: 'abcd2345', clickId: null, bot: null });
assert.doesNotMatch(h2, /cid=/); assert.doesNotMatch(h2, /t\.me/); assert.match(h2, /var c=null/, 'bot/dublikat: beacon yo‘q'); assert.match(h2, /<html lang="uz">/);
assert.doesNotMatch(bridgeHtml({ lang: 'uz', code: 'abcd2345', clickId: null, bot: 'bad bot<script>' }), /t\.me|<script>alert/, 'noto‘g‘ri bot nomi havolaga tushmaydi');
console.log('creatorBridge.test: OK');
