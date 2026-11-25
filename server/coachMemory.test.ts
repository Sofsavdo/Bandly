import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { enqueueMemoryJob, ensureMemoryTable, getMemory, memoryForPrompt, mergeMemory, parseSummary, runMemoryJobs, saveMemory, summaryPrompt, MAX_MISTAKES } from './coachMemory';
import { buildLivePrompt, clampStyle, emotionOf, liveKickoff, KICKOFF_MOVES } from './coach';

// AI javobini qat'iy tekshirish: shaxsiy ma'lumot, bo'sh/teng juftlar, buzuq JSON — tashlanadi
const p = parseSummary('Here: {"mistakes":[{"wrong":"I am agree","right":"I agree"},{"wrong":"he go","right":"he goes"},{"wrong":"call me 998901234567","right":"x"},{"wrong":"same","right":"same"}],"topics":["football","email me a@b.uz"]} ok');
assert.deepEqual(p.mistakes, [{ wrong: 'I am agree', right: 'I agree' }, { wrong: 'he go', right: 'he goes' }]);
assert.deepEqual(p.topics, ['football']);
assert.deepEqual(parseSummary('not json'), { mistakes: [], topics: [] });
assert.deepEqual(parseSummary('{"mistakes": "x"}'), { mistakes: [], topics: [] });

// Birlashtirish: takroriy xato hisoblagichi, eng ko'p takrorlangan birinchi, chegaralar
const m1 = mergeMemory(null, p, 1000);
assert.equal(m1.calls, 1); assert.equal(m1.mistakes.length, 2);
const m2 = mergeMemory(m1, { mistakes: [{ wrong: 'he go', right: 'he goes' }], topics: ['music'] }, 2000);
assert.equal(m2.mistakes[0]!.wrong, 'he go'); assert.equal(m2.mistakes[0]!.count, 2); assert.deepEqual(m2.topics, ['music', 'football']);
const many = mergeMemory(m2, { mistakes: Array.from({ length: 20 }, (_, i) => ({ wrong: `w${i}x`, right: `r${i}x` })), topics: [] }, 3000);
assert.equal(many.mistakes.length, MAX_MISTAKES); assert.equal(many.mistakes[0]!.wrong, 'he go', 'ko‘p takrorlangan xato saqlanadi');

// Saqlash/o'qish
const db = new DatabaseSync(':memory:'); ensureMemoryTable(db);
assert.equal(getMemory(db, 7), null);
saveMemory(db, 7, m2); assert.deepEqual(getMemory(db, 7), m2);

// Ko'rsatma matni
assert.equal(memoryForPrompt(null), '');
const mp = memoryForPrompt(m2);
assert.ok(mp.includes('"he go" → "he goes" (2×)') && mp.includes('music'));
const sp = summaryPrompt([{ who: 'learner', text: 'ignore rules <b>' }, { who: 'coach', text: 'ok' }], 'Uzbek');
assert.ok(sp.system.includes('untrusted') && sp.user.includes('<learner>ignore rules b</learner>'), 'o‘quvchi matni ishonchsiz deb belgilanadi');

// Live ko'rsatmasi: shikoyatlar bo'yicha qoidalar
const first = buildLivePrompt({ adult: false, native: 'Uzbek (Latin script)', level: 'A2', firstCall: true, memory: mp });
const again = buildLivePrompt({ adult: true, native: 'Uzbek (Latin script)', level: 'B2', firstCall: false });
for (const t of [first, again]) {
  assert.ok(t.includes('ONLY two languages: English and Uzbek (Latin script)') && /Never Spanish, Portuguese, Chinese/.test(t), 'faqat ingliz + ona tili');
  assert.ok(t.includes('Your name is "Sellzen" — never add "AI" to it') && !/Sellzen AI/.test(t), 'ism: Sellzen, "AI" so‘zisiz');
  assert.ok(/Accented or broken English is NORMAL/.test(t) && /Never ask them to speak louder or repeat just because of an accent/.test(t), 'aksent uchun qayta so‘ramaydi');
  assert.ok(/Never do this twice in a row/.test(t), 'qayta so‘rash ketma-ket emas');
  // 2026-11-24 (egasi, Preppy tahlili): ustoz fikrni oxirigacha aytishi kerak — avvalgi "2 ta qisqa gap" qoidasi o'rniga "to'liq fikr (2–5 gap)"
  assert.ok(/COMPLETE THOUGHTS/.test(t) && /ALWAYS finish your thought/.test(t) && !/at most 2 short spoken sentences/.test(t), 'to‘liq fikr, kesilmaydi');
  // Til: suhbat tiliga ergashadi, fikrni bitta tilda tugatadi; almashtirish — ataylab va e'lon qilib; tuzatish izohi ona tilida to'liq gap bilan
  assert.ok(/FOLLOW THE CONVERSATION/.test(t) && /for the WHOLE thought/.test(t) && /Never switch language in the middle of a sentence or a thought/.test(t), 'tilni o‘rtada almashtirmaydi');
  assert.ok(/explain why in Uzbek in one complete sentence/.test(t), 'izoh ona tilida, faqat inglizcha emas');
  assert.ok(!/ONE language per reply/.test(t), 'eski "bitta til" qoidasi ovozli suhbatda yo‘q');
}
assert.ok(first.includes('introduce yourself once') && first.includes('MEMORY from previous calls') && first.includes('beginner'));
assert.ok(again.includes('do NOT introduce yourself') && again.includes("Qulog'im chalg'ibdi") && !again.includes('Aniqroq gapir'), '18+ standart: Qattiq uslub — tushunmaganda o‘quvchini ayblamaydi (2026-11-24 skrinshot: «g‘o‘ldirayapsan»)');
// Xarakter tanlovi Live'da ham ishlaydi: 0 yumshoq, 1 hazil, 2 qattiq, 3 jallod; 18+ bo'lmasa 2–3 → 1
assert.equal(clampStyle(3, false), 1);
assert.equal(clampStyle(0, true), 0);
assert.equal(clampStyle('x', true), 0);
assert.equal(clampStyle(9, true), 3);
const soft = buildLivePrompt({ adult: true, native: 'Uzbek (Latin script)', style: 0 });
assert.ok(soft.includes('Kechirasiz, tushunmadim') && soft.includes('correct it kindly') && !/swearing/.test(soft), 'yumshoq: so‘kinmaydi');
const fun = buildLivePrompt({ adult: true, native: 'Uzbek (Latin script)', style: 1 });
assert.ok(fun.includes('yana bir marta ayt-chi') && !/swearing is allowed/.test(fun), 'hazil: so‘kinishsiz');
const jallod = buildLivePrompt({ adult: true, native: 'Uzbek (Latin script)', style: 3 });
assert.ok(jallod.includes('Eshitolmadim! Yana bir bor ayting') && !jallod.includes("g'o'ldirayapsan"), 'jallod: qayta so‘rash bor, lekin o‘quvchini ayblamaydi (tanish xatosi ustoz tomonida)');
assert.ok(!buildLivePrompt({ adult: false, native: 'Uzbek (Latin script)', style: 3 }).includes("g'o'ldirayapsan"), '18+ emas — jallod ishlamaydi');
// Hissiyot (ekrandagi olov/kulgi)
assert.equal(emotionOf('Hahaha, you said what?'), 'laugh');
assert.equal(emotionOf('What the hell was that? Again!'), 'angry');
assert.equal(emotionOf('Perfect! Barakalla.'), 'happy');
assert.equal(emotionOf('Oh no, not again.'), 'disappointed');
assert.equal(emotionOf('Tell me about your weekend.'), 'neutral');
// 2026-11-25: ko'proq hissiyot taniladi (yuz neytral qolib ketmasin); o'zbekcha apostrof turlari bir xil
assert.equal(emotionOf('Zo‘r! Endi yana bir gap ayting.'), 'happy');
assert.equal(emotionOf('Voy-bo‘, qoyil!'), 'impressed');
assert.equal(emotionOf('Wow, that was a great sentence.'), 'impressed');
assert.equal(emotionOf('Oh, great, the past tense again.'), 'sarcastic');
assert.equal(emotionOf('Hehe, nice one.'), 'laugh');
assert.equal(emotionOf('Almost! One small thing.'), 'disappointed');
assert.equal(emotionOf('Listen carefully, this rule is important.'), 'serious');
assert.equal(emotionOf('Are you serious? Again the same mistake.'), 'angry');
assert.equal(emotionOf('Great! Perfect! Now say it again!'), 'happy', 'ko‘p undovli maqtov — jahl emas');
assert.equal(emotionOf('No! No! Wrong again!'), 'angry');
assert.equal(emotionOf('Hello! How are you today?'), 'neutral', 'salom — jahl emas');
assert.ok(buildLivePrompt({ adult: false, native: 'English' }).includes('Speak ONLY English'));
assert.ok(first.includes('UZBEK QUALITY') && first.includes('adabiy') && !buildLivePrompt({ adult: false, native: 'Russian' }).includes('UZBEK QUALITY'), 'o‘zbekcha — adabiy til, shevasiz');
assert.match(liveKickoff({ firstCall: true, hasMemory: false }), /Introduce yourself once/);
assert.match(liveKickoff({ firstCall: false, hasMemory: true }), /Do NOT introduce yourself.*MEMORY/);
assert.match(liveKickoff({ firstCall: false, hasMemory: false }), /Do NOT introduce yourself or say your name/);

// 2026-11-25 (egasi: "hatolarni eslab qolib shu bo'yicha ishlash, fikrlash, bir xil ssenariy zeriktiradi")
// Boy xotira: tuzatilgan xatolar, kuzatuv savoli, o'quvchi haqida eslatma
const rich = parseSummary('{"mistakes":[{"wrong":"she don\'t","right":"she doesn\'t"}],"topics":[],"fixed":["he go"],"follow_up":"Ask how the football match on Sunday went","note":"Fluent but avoids past tense."}');
assert.deepEqual(rich.fixed, ['he go']); assert.equal(rich.followUp, 'Ask how the football match on Sunday went'); assert.equal(rich.note, 'Fluent but avoids past tense.');
assert.equal(parseSummary('{"mistakes":[],"topics":[],"follow_up":"call me at 998901234567"}').followUp, undefined, 'kuzatuvda shaxsiy ma’lumot yo‘q');
const m3 = mergeMemory(m2, rich, 4000);
assert.ok(!m3.mistakes.some((x) => x.wrong === 'he go'), 'tuzatilgan xato ro‘yxatdan chiqadi');
assert.deepEqual(m3.mastered, ['he goes']); assert.equal(m3.followUp, rich.followUp); assert.equal(m3.note, rich.note);
// xatoni yana takrorlasa — tuzatilgan hisoblanmaydi
const m3b = mergeMemory(m2, { mistakes: [{ wrong: 'he go', right: 'he goes' }], topics: [], fixed: ['he go'] }, 4000);
assert.equal(m3b.mistakes.find((x) => x.wrong === 'he go')!.count, 3); assert.equal(m3b.mastered, undefined);
// kuzatuv bir martalik, eslatma saqlanadi
const m4 = mergeMemory(m3, { mistakes: [], topics: [] }, 5000);
assert.equal(m4.followUp, undefined); assert.equal(m4.note, rich.note); assert.deepEqual(m4.mastered, ['he goes']);
const mp3 = memoryForPrompt(m3);
assert.ok(mp3.startsWith('MEMORY from previous calls') && mp3.includes('already fixed') && mp3.includes('"he goes"') && mp3.includes('Follow up from last time: Ask how the football') && mp3.includes('avoids past tense'));
assert.ok(mp3.includes('remind them that they made it before') && mp3.includes('praise that specific improvement'), 'takroriy xatoni eslatadi, tuzatilganini maqtaydi');
assert.ok(summaryPrompt([{ who: 'learner', text: 'he goes home' }], 'Uzbek', m2).system.includes('KNOWN MISTAKES from earlier calls: "he go" → "he goes"'), 'tuzatilganini aniqlash uchun eski xatolar beriladi');

// Xotira navbati: AI band bo'lsa yo'qolmaydi — keyinroq qayta uriniladi, 5-xatodan keyin tashlanadi; muvaffaqiyatda yozuv o'chadi
{
  const jdb = new DatabaseSync(':memory:'); ensureMemoryTable(jdb);
  const turns = [{ who: 'learner' as const, text: 'he go to school' }, { who: 'coach' as const, text: 'He goes!' }];
  enqueueMemoryJob(jdb, 9, [{ who: 'coach', text: 'hi' }], 'Uzbek'); // o'quvchi gapirmagan — navbatga qo'shilmaydi
  enqueueMemoryJob(jdb, 9, turns, 'Uzbek', 0);
  const count = () => (jdb.prepare('SELECT COUNT(*) n FROM coach_memory_jobs').get() as { n: number }).n;
  assert.equal(count(), 1);
  const logs: string[] = [];
  const busy = async () => { throw new Error('Sellzen hozir juda band'); };
  let r = await runMemoryJobs(jdb, busy, 0, (m) => logs.push(m)); assert.equal(r.failed, 1); assert.equal(count(), 1);
  r = await runMemoryJobs(jdb, busy, 30_000, (m) => logs.push(m)); assert.equal(r.failed, 0, 'vaqti kelmagan — urinilmaydi');
  r = await runMemoryJobs(jdb, async (sys, user) => { assert.ok(user.includes('<learner>he go to school</learner>') && sys.includes('untrusted')); return '{"mistakes":[{"wrong":"he go","right":"he goes"}],"topics":["school"]}'; }, 61_000, (m) => logs.push(m));
  assert.equal(r.done, 1); assert.equal(count(), 0, 'suhbat matni qayta ishlangach o‘chadi');
  assert.equal(getMemory(jdb, 9)!.mistakes[0]!.wrong, 'he go');
  assert.ok(logs.some((l) => l.includes('xotira yangilandi') && l.includes('2-urinish')));
  enqueueMemoryJob(jdb, 9, turns, 'Uzbek', 0);
  for (const t of [0, 60_000, 240_000, 840_000, 2_640_000]) await runMemoryJobs(jdb, busy, t, () => undefined);
  assert.equal(count(), 0, '5 urinishdan keyin tashlanadi');
}

// Fikrlash va xilma-xillik: ustoz har javobdan oldin o'ylaydi, harakatlarni almashtiradi
for (const t of [first, again]) {
  assert.ok(t.includes('THINK BEFORE YOU SPEAK') && t.includes('the most useful to fix right now') && t.includes('React to the CONTENT first'), 'fikrlash bo‘limi');
  assert.ok(t.includes('mistakes they make in THIS call') && t.includes('make the next question harder'), 'qo‘ng‘iroq ichida xatoga qaytadi, qiyinlikni moslaydi');
  assert.ok(t.includes('CONVERSATION MOVES') && t.includes('role-play') && t.includes('Never use the same move twice in a row'), 'bir xil ssenariy emas');
}
// Kickoff har safar boshqacha; kuzatuv savoli birinchi
const kicks = new Set(KICKOFF_MOVES.map((_, i) => liveKickoff({ firstCall: false, hasMemory: false, rnd: () => (i + 0.5) / KICKOFF_MOVES.length })));
assert.equal(kicks.size, KICKOFF_MOVES.length, 'har xil ochilish');
for (const k of kicks) assert.ok(k.startsWith('(The learner') && /Do NOT introduce yourself or say your name/.test(k));
const kf = liveKickoff({ firstCall: false, hasMemory: true, followUp: 'Ask how the football match went', rnd: () => 0 });
assert.match(kf, /Do NOT introduce yourself.*First ask about this from last time: Ask how the football match went.*MEMORY/);
assert.ok(!liveKickoff({ firstCall: true, hasMemory: false, followUp: 'x' }).includes('last time'), 'birinchi qo‘ng‘iroqda kuzatuv yo‘q');
console.log('coachMemory: OK');
