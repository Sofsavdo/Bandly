import assert from 'node:assert/strict';
import { checkMember, handleBot, type BotDeps } from './botFlow';

// Soxta Telegram API va holat
function harness(o: { member?: boolean; phone?: boolean } = {}) {
  const calls: { m: string; b: Record<string, any> }[] = []; // eslint-disable-line @typescript-eslint/no-explicit-any
  const st = { member: o.member ?? false, phones: new Map<number, string>(o.phone ? [[5, '+998901234567']] : []), refs: new Map<number, string>() };
  const d: BotDeps = {
    api: async (m, b) => { calls.push({ m, b }); return true; },
    publicUrl: 'https://www.sellzen.uz', tr: () => (t) => t,
    isMember: async () => st.member, hasPhone: (id) => st.phones.has(id), savePhone: (id, p) => { st.phones.set(id, p); },
    setRef: (id, r) => { st.refs.set(id, r); }, getRef: (id) => st.refs.get(id), setRemind: () => true, channel: '@Sellzen_AI', stats: { lessons: 144, ielts: 36, mocks: 41 },
  };
  return { d, calls, st };
}
const msg = (text: string, extra: Record<string, unknown> = {}) => ({ message: { message_id: 1, chat: { id: 5, type: 'private' }, from: { id: 5, first_name: 'Ali' }, text, ...extra } });

// 1) Obuna bo'lmagan: /start → kanal tugmasi + "Tekshirish"; ref kodi eslab qolinadi
{
  const h = harness();
  await handleBot(msg('/start ref_abc234'), h.d);
  assert.equal(h.calls.length, 1); assert.equal(h.calls[0]!.m, 'sendMessage');
  const kb = h.calls[0]!.b.reply_markup.inline_keyboard;
  assert.equal(kb[0][0].url, 'https://t.me/Sellzen_AI'); assert.equal(kb[1][0].callback_data, 'chk');
  assert.equal(h.st.refs.get(5), 'abc234');
  // "Tekshirish" — hali obuna emas: ogohlantirish
  await handleBot({ callback_query: { id: 'q1', from: { id: 5 }, data: 'chk', message: { message_id: 9, chat: { id: 5 } } } }, h.d);
  assert.equal(h.calls[1]!.m, 'answerCallbackQuery'); assert.equal(h.calls[1]!.b.show_alert, true);
  // obuna bo'ldi → xabar o'chiriladi, raqam so'raladi (request_contact)
  h.st.member = true; h.calls.length = 0;
  await handleBot({ callback_query: { id: 'q2', from: { id: 5 }, data: 'chk', message: { message_id: 9, chat: { id: 5 } } } }, h.d);
  assert.deepEqual(h.calls.map((c) => c.m), ['answerCallbackQuery', 'deleteMessage', 'sendMessage']);
  assert.equal(h.calls[2]!.b.reply_markup.keyboard[0][0].request_contact, true);
}
// 2) Birovning kontakti qabul qilinmaydi; o'zining kontakti → saqlanadi → xush kelibsiz (rasm + ilova tugmalari, ref bilan)
{
  const h = harness({ member: true });
  h.st.refs.set(5, 'abc234');
  await handleBot(msg('', { contact: { phone_number: '998935554433', user_id: 77 } }), h.d);
  assert.equal(h.st.phones.size, 0); assert.match(h.calls[0]!.b.text, /o‘zingizning raqamingizni/);
  h.calls.length = 0;
  await handleBot(msg('', { contact: { phone_number: '998935554433', user_id: 5 } }), h.d);
  assert.equal(h.st.phones.get(5), '+998935554433');
  // rasm funksiyasi berilmagan — xush kelibsiz xabari matn sifatida (jim qolmaydi)
  assert.deepEqual(h.calls.map((c) => c.m), ['sendMessage', 'sendMessage']);
  assert.deepEqual(h.calls[0]!.b.reply_markup, { remove_keyboard: true });
  const w = h.calls[1]!.b;
  assert.match(w.text, /Xush kelibsiz, Ali!/); assert.match(w.text, /144 ta dars/); assert.ok(w.text.split('\n').length <= 5, 'welcome qisqa');
  const kb = JSON.stringify(w.reply_markup);
  for (const r of ['%2F', '%2Fplacement', '%2Fcoach']) assert.match(kb, new RegExp(`r=${r}&ref=abc234`), r);
  assert.ok(w.reply_markup.inline_keyboard.flat().length <= 3, 'welcome: ko‘pi bilan 3 tugma');
  assert.match(kb, /Ilovani ochish/); assert.match(kb, /Darajamni aniqlash/); assert.match(kb, /AI ustoz/);
}
// 3) Hammasi bor: /start → darhol xush kelibsiz; /mock → ochish tugmasi; /help; guruh — javob yo'q
{
  const h = harness({ member: true, phone: true });
  const photos: Record<string, unknown>[] = [];
  h.d.sendPhoto = async (m) => { photos.push(m); };
  await handleBot(msg('/start'), h.d); assert.equal(photos.length, 1); assert.equal(h.calls.length, 0, 'rasm bilan yuborildi');
  // rasm yuborilmasa (Telegram xatosi) — matn bilan qayta
  h.d.sendPhoto = async () => { throw new Error('failed to get HTTP URL content'); };
  const err0 = console.error; console.error = () => undefined;
  await handleBot(msg('/start'), h.d); console.error = err0;
  assert.equal(h.calls[0]!.m, 'sendMessage'); assert.match(h.calls[0]!.b.text, /Xush kelibsiz/);
  h.calls.length = 0; delete h.d.sendPhoto;
  await handleBot(msg('/start'), h.d); assert.equal(h.calls[0]!.m, 'sendMessage');
  await handleBot(msg('/mock'), h.d); assert.match(JSON.stringify(h.calls[1]!.b), /r=%2Fmocks/);
  await handleBot(msg('/help'), h.d); assert.match(h.calls[2]!.b.text, /\/level/);
  await handleBot({ message: { chat: { id: -1, type: 'group' }, from: { id: 5 }, text: '/start' } }, h.d); assert.equal(h.calls.length, 3);
  await handleBot(msg('/stop'), h.d); assert.match(h.calls[3]!.b.text, /o‘chirildi/);
}
// 4) Obuna holatlari; tekshirib bo'lmasa — to'smaymiz
assert.equal(await checkMember(async () => ({ status: 'member' }), '@c', 1), true);
assert.equal(await checkMember(async () => ({ status: 'left' }), '@c', 1), false);
assert.equal(await checkMember(async () => ({ status: 'kicked' }), '@c', 1), false);
assert.equal(await checkMember(async () => ({ status: 'restricted', is_member: false }), '@c', 1), false);
const err = console.error; console.error = () => undefined;
assert.equal(await checkMember(async () => { throw new Error('member list is inaccessible'); }, '@c', 1), true);
console.error = err;
// Admin paneldan majburiy obuna va telefon o'chirilgan (standart): /start → darhol xush kelibsiz, kanal/telefon so'ralmaydi
{
  const h = harness({ member: false, phone: false });
  h.d.requireSubscribe = () => false; h.d.requirePhone = () => false;
  await handleBot(msg('/start ref_zz9988'), h.d);
  assert.equal(h.calls.length, 1, 'bitta xabar — xush kelibsiz');
  const b = h.calls[0]!.b;
  assert.ok(!JSON.stringify(b).includes('request_contact'), 'telefon so‘ralmaydi');
  assert.ok(!JSON.stringify(b).includes('"callback_data":"chk"'), 'obuna tekshiruvi yo‘q');
  assert.ok(String(b.caption ?? b.text).includes('Ali'), 'ism bilan xush kelibsiz');
  assert.equal(h.st.refs.get(5), 'zz9988', 'referal kodi baribir saqlanadi');
  // faqat telefon yoqilgan: obunasiz ham telefon so'raladi
  const h2 = harness({ member: false });
  h2.d.requireSubscribe = () => false; h2.d.requirePhone = () => true;
  await handleBot(msg('/start'), h2.d);
  assert.ok(JSON.stringify(h2.calls[0]!.b).includes('request_contact'));
}
console.log('botFlow: OK');
// /start login_<kod> endi maxsus emas (botga kirish olib tashlandi): oddiy /start sifatida ishlaydi va hech qanday kirish tasdig'i yubormaydi
{
  const h = harness({ member: true, phone: true });
  await handleBot(msg(`/start login_${'a'.repeat(32)}`), h.d);
  assert.ok(!JSON.stringify(h.calls).includes('login:'), 'kirish tasdiq tugmasi yo‘q');
  h.calls.length = 0;
  await handleBot({ callback_query: { id: 'q9', from: { id: 5, first_name: 'Ali' }, data: `login:${'a'.repeat(32)}`, message: { message_id: 3, chat: { id: 5 } } } }, h.d);
  assert.deepEqual(h.calls.map((c) => c.m), ['answerCallbackQuery'], 'login: callback e’tiborsiz');
}
