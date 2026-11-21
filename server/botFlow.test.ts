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
    setRef: (id, r) => { st.refs.set(id, r); }, getRef: (id) => st.refs.get(id), setRemind: () => true, channel: '@Sellzen_AI',
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
  assert.deepEqual(h.calls.map((c) => c.m), ['sendMessage', 'sendPhoto']);
  assert.deepEqual(h.calls[0]!.b.reply_markup, { remove_keyboard: true });
  const w = h.calls[1]!.b;
  assert.equal(w.photo, 'https://www.sellzen.uz/brand/og-image.png');
  assert.match(JSON.stringify(w.reply_markup), /tg=1&r=%2F&ref=abc234/);
  assert.match(JSON.stringify(w.reply_markup), /r=%2Fplacement/);
}
// 3) Hammasi bor: /start → darhol xush kelibsiz; /mock → ochish tugmasi; /help; guruh — javob yo'q
{
  const h = harness({ member: true, phone: true });
  await handleBot(msg('/start'), h.d); assert.equal(h.calls[0]!.m, 'sendPhoto');
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
console.log('botFlow: OK');
