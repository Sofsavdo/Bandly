// Ovoz demosi: DEMO_LINES ni tanlangan ElevenLabs ovozi va modelida MP3 ga aylantiradi.
// Ishlatish:  npm run voice:demo -- --voice <voice_id> [--model eleven_v4|eleven_v4_turbo] [--out voice-demo-out] [--only 01-friendly,04-savage] --yes
// --yes bo'lmasa faqat hisob-kitob ko'rsatiladi (kredit sarflanmaydi). Kalit: ELEVENLABS_API_KEY (kodda yo'q).
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { elevenLabsFromEnv, isElModel, synthesize } from '../../server/elevenlabs';
import { DEMO_LINES, totalChars } from './lines';

const arg = (name: string): string | undefined => {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
};
const voice = arg('voice');
const model = arg('model') ?? 'eleven_v4';
const out = arg('out') ?? 'voice-demo-out';
const only = arg('only')?.split(',');
const yes = process.argv.includes('--yes');

if (!voice) { console.error('--voice <voice_id> kerak'); process.exit(2); }
if (!isElModel(model)) { console.error(`model faqat: eleven_v4, eleven_v4_turbo`); process.exit(2); }
const lines = DEMO_LINES.filter((l) => !only || only.includes(l.id));
const chars = totalChars(lines);
const credits = Math.ceil(chars * (model === 'eleven_v4_turbo' ? 0.5 : 1));
console.log(`${lines.length} ta gap, ${chars} belgi, ≈ ${credits} kredit (${model}, ovoz ${voice})`);
if (!yes) { console.log('Hisob-kitob rejimi: audio yaratilmadi. Yaratish uchun --yes qo‘shing.'); process.exit(0); }

const client = elevenLabsFromEnv();
if (!client) { console.error('ELEVENLABS_API_KEY yo‘q — ovoz xizmati mavjud emas.'); process.exit(3); }
const dir = join(out, `${voice}-${model}`);
mkdirSync(dir, { recursive: true });
let ok = 0;
for (const l of lines) {
  try {
    const audio = await synthesize(client, { text: l.text, voiceId: voice, modelId: model });
    writeFileSync(join(dir, `${l.id}.mp3`), audio);
    ok++;
    console.log(`✓ ${l.id} (${audio.length} bayt)`);
  } catch (e) {
    console.log(`✗ ${l.id}: ${(e as Error).message.slice(0, 200)}`);
  }
}
writeFileSync(join(dir, 'lines.json'), JSON.stringify({ voice, model, lines }, null, 2));
console.log(`${ok}/${lines.length} tayyor → ${dir}`);
