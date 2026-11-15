import assert from 'node:assert/strict';
import { mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { EL_TAG, TtsError, cacheKey, cleanText, estimateCostUsd, isCached, isEmotion, ssml, stripTags, synthesize, ttsConfigFromEnv } from './tts';
import { TUTOR_VOICE } from './elevenlabs';

const dir = mkdtempSync(join(tmpdir(), 'tts-'));
// Sozlama
assert.equal(ttsConfigFromEnv(dir, {}).provider, 'none');
assert.equal(ttsConfigFromEnv(dir, { TTS_KEY: 'k', TTS_REGION: 'bad region!' }).provider, 'none');
const cfg0 = ttsConfigFromEnv(dir, { TTS_KEY: 'k', TTS_REGION: 'westeurope' });
assert.equal(cfg0.provider, 'azure'); assert.equal(cfg0.voice, 'uz-UZ-MadinaNeural');
assert.equal(ttsConfigFromEnv(dir, { TTS_KEY: 'k', TTS_REGION: 'westeurope', TTS_VOICE: 'uz-UZ-SardorNeural' }).voice, 'uz-UZ-SardorNeural');
assert.equal(ttsConfigFromEnv(dir, { TTS_KEY: 'k', TTS_REGION: 'westeurope', TTS_VOICE: '"><evil' }).voice, 'uz-UZ-MadinaNeural', 'noto‘g‘ri ovoz nomi rad etiladi');

// Matn
assert.throws(() => cleanText('  '), TtsError);
assert.throws(() => cleanText('a'.repeat(281)), TtsError);
assert.equal(cleanText(' Salom   dunyo '), 'Salom dunyo');
assert.ok(ssml('uz-UZ-MadinaNeural', 'a <b> & "c"').includes('a &lt;b&gt; &amp; &quot;c&quot;'), 'SSML belgilari qochiriladi');
assert.notEqual(cacheKey('v', 'a', 1, 0), cacheKey('v', 'b', 1, 0));

// Sintez + kesh (soxta server)
let calls = 0; let seen: { url: string; headers: Record<string, string>; body: string } | null = null;
const fake = (async (url: string, init: { headers: Record<string, string>; body: string }) => { calls++; seen = { url, headers: init.headers, body: init.body }; return new Response(new Uint8Array(600).fill(7), { status: 200 }); }) as unknown as typeof fetch;
const cfg = { ...cfg0, fetchImpl: fake };
const a = await synthesize(cfg, 'Qoyil!');
assert.equal(a.cached, false); assert.equal(a.audio.length, 600); assert.equal(calls, 1);
assert.equal(seen!.url, 'https://westeurope.tts.speech.microsoft.com/cognitiveservices/v1');
assert.equal(seen!.headers['ocp-apim-subscription-key'], 'k');
assert.ok(seen!.body.includes('Qoyil!') && seen!.body.includes('uz-UZ-MadinaNeural'));
const b = await synthesize(cfg, 'Qoyil!');
assert.equal(b.cached, true); assert.equal(calls, 1, 'bir xil matn qayta so‘ralmaydi');
await synthesize(cfg, 'Qoyil!', { rate: 1.2 });
assert.equal(calls, 2, 'boshqa tezlik — boshqa kesh');
assert.equal(readdirSync(dir).length, 2);

// Xatolar
await assert.rejects(synthesize({ ...cfg, provider: 'none' }, 'x'), (e: TtsError) => e.status === 503);
await assert.rejects(synthesize({ ...cfg, fetchImpl: (async () => new Response('no', { status: 401 })) as unknown as typeof fetch }, 'Boshqa matn'), (e: TtsError) => e.status === 502);
await assert.rejects(synthesize({ ...cfg, fetchImpl: (async () => new Response(new Uint8Array(5), { status: 200 })) as unknown as typeof fetch }, 'Yana matn'), (e: TtsError) => e.status === 502);
await assert.rejects(synthesize({ ...cfg, fetchImpl: (async () => { throw new Error('net'); }) as unknown as typeof fetch }, 'Tarmoq'), (e: TtsError) => e.status === 502);

// ---------------- ElevenLabs ----------------
// Fail-closed: kalit yoki umumiy kunlik chegara bo'lmasa o'chiq
assert.equal(ttsConfigFromEnv(dir, { TTS_PROVIDER: 'elevenlabs' }).provider, 'none');
assert.equal(ttsConfigFromEnv(dir, { TTS_PROVIDER: 'elevenlabs', ELEVENLABS_API_KEY: 'k' }).provider, 'none', 'VOICE_GLOBAL_DAILY_CHARS=0 → o‘chiq');
const el0 = ttsConfigFromEnv(dir, { TTS_PROVIDER: 'elevenlabs', ELEVENLABS_API_KEY: 'k', VOICE_GLOBAL_DAILY_CHARS: '20000' });
assert.equal(el0.provider, 'elevenlabs'); assert.equal(el0.voice, TUTOR_VOICE.voiceId); assert.equal(el0.model, 'eleven_v4_turbo');
assert.equal(ttsConfigFromEnv(dir, { TTS_PROVIDER: 'elevenlabs', ELEVENLABS_API_KEY: 'k', VOICE_GLOBAL_DAILY_CHARS: '1', ELEVENLABS_VOICE_ID: '"><x', ELEVENLABS_MODEL: 'eleven_multilingual_v2' }).voice, TUTOR_VOICE.voiceId, 'noto‘g‘ri ovoz/model rad etiladi');
assert.equal(ttsConfigFromEnv(dir, { TTS_PROVIDER: 'elevenlabs', ELEVENLABS_API_KEY: 'k', VOICE_GLOBAL_DAILY_CHARS: '1', ELEVENLABS_MODEL: 'eleven_multilingual_v2' }).model, 'eleven_v4_turbo');
// Teglar: mijoz teg kirita olmaydi, emotsiya tegini server qo'yadi
assert.equal(stripTags('Salom [shouting] dunyo [x'), 'Salom dunyo');
assert.ok(isEmotion('angry') && !isEmotion('rage'));
let elSeen: { url: string; headers: Record<string, string>; body: string } | null = null; let elCalls = 0;
const elFake = (async (url: string, init: { headers: Record<string, string>; body: string }) => { elCalls++; elSeen = { url, headers: init.headers, body: init.body }; return new Response(new Uint8Array(900).fill(3), { status: 200 }); }) as unknown as typeof fetch;
const el = { ...el0, fetchImpl: elFake };
assert.equal(isCached(el, 'Voy, «shkul» deysanmi? School!', { emotion: 'angry' }), false);
const e1 = await synthesize(el, 'Voy, «shkul» deysanmi? [whispers] School!', { emotion: 'angry' });
assert.equal(e1.cached, false); assert.equal(elCalls, 1);
assert.equal(elSeen!.url, `https://api.elevenlabs.io/v1/text-to-speech/${TUTOR_VOICE.voiceId}?output_format=mp3_44100_128`);
assert.equal(elSeen!.headers['xi-api-key'], 'k');
const sent = JSON.parse(elSeen!.body) as { text: string; model_id: string };
assert.equal(sent.model_id, 'eleven_v4_turbo');
assert.equal(sent.text, `${EL_TAG.angry} Voy, «shkul» deysanmi? School!`, 'faqat server tegi qoladi');
assert.equal(e1.chars, sent.text.length);
assert.equal(isCached(el, 'Voy, «shkul» deysanmi? [whispers] School!', { emotion: 'angry' }), true);
const e2 = await synthesize(el, 'Voy, «shkul» deysanmi? [whispers] School!', { emotion: 'angry' });
assert.equal(e2.cached, true); assert.equal(e2.chars, 0); assert.equal(elCalls, 1, 'kesh — qayta pul to‘lanmaydi');
await synthesize(el, 'Voy, «shkul» deysanmi? [whispers] School!', { emotion: 'laugh' });
assert.equal(elCalls, 2, 'boshqa emotsiya — boshqa kesh');
assert.ok(Math.abs(estimateCostUsd(el, 1000) - 0.04) < 1e-9, 'turbo: $0.04 / 1000 belgi');
await assert.rejects(synthesize({ ...el, fetchImpl: (async () => new Response('quota', { status: 401 })) as unknown as typeof fetch }, 'Yangi gap'), (e: TtsError) => e.status === 502);
await assert.rejects(synthesize(el, '[shouting]'), (e: TtsError) => e.status === 400);

rmSync(dir, { recursive: true, force: true });
console.log('tts.test: OK');
