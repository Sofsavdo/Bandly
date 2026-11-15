// tools/audio-tasks.ts ro'yxatidagi inglizcha audiolarni ElevenLabs'da yaratadi (Kokoro o'rniga yoki qo'shimcha).
// Ishlatish:
//   npx tsx tools/audio-tasks.ts > tasks.json
//   npx tsx tools/gen-audio-elevenlabs.mts tasks.json public/audio [--only-missing] [--listening] [--model eleven_v4|eleven_v4_turbo] [--limit N] [--yes]
// --yes bo'lmasa faqat hisob-kitob (kredit sarflanmaydi). Kalit: ELEVENLABS_API_KEY (kodda yo'q).
// Proksi orqali chiqadigan muhitda NODE_USE_ENV_PROXY=1 bilan ishga tushiring.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { elevenLabsFromEnv, isElModel, synthesize } from '../server/elevenlabs';

// Egasi tanlagan ingliz ovozlari (2026-11-15): Kokoro ovoz nomi → ElevenLabs ovozi.
export const EN_VOICES = {
  us_male: { id: 'Gfpl8Yo74Is0W6cPUWWT', name: 'Max (US)' },
  us_female: { id: 'WZlYpi1yf6zJhNWXih74', name: 'Hope (US)' },
  uk_female: { id: 'y1LQSw6x4O5I1qZEI77j', name: 'Sarah (UK)' },
  uk_male: { id: 'l30f87tf05uxyknGdDw6', name: 'Alistair (UK)' },
} as const;
const mapVoice = (kokoro: string) =>
  kokoro.startsWith('bm_') ? EN_VOICES.uk_male : kokoro.startsWith('bf_') ? EN_VOICES.uk_female : kokoro.startsWith('am_') ? EN_VOICES.us_male : EN_VOICES.us_female;

const [tasksPath, out] = process.argv.slice(2, 4);
const flag = (n: string) => process.argv.includes(`--${n}`);
const opt = (n: string) => { const i = process.argv.indexOf(`--${n}`); return i >= 0 ? process.argv[i + 1] : undefined; };
const model = opt('model') ?? 'eleven_v4';
const limit = Number(opt('limit') ?? Infinity);
if (!tasksPath || !out || !isElModel(model)) { console.error('tasks.json va chiqish papkasi kerak; model: eleven_v4 | eleven_v4_turbo'); process.exit(2); }

type Clip = { key: string; text: string; voice: string; speed: number };
type Listen = { id: string; lines: { text: string; voice: string }[]; pauseMs: number };
const tasks = JSON.parse(readFileSync(tasksPath, 'utf8')) as { clips: Clip[]; listens: Listen[] };
const manifestPath = join(out, 'manifest.json');
const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) as { clips: string[]; listening: Record<string, { file: string; seconds: number }> } : { clips: [], listening: {} };
const have = new Set(manifest.clips);

const clips = tasks.clips.filter((c) => !flag('only-missing') || !have.has(c.key)).slice(0, limit);
const listens = flag('listening') ? tasks.listens : [];
const chars = clips.reduce((s, c) => s + c.text.length, 0) + listens.reduce((s, l) => s + l.lines.reduce((a, x) => a + x.text.length, 0), 0);
const credits = Math.ceil(chars * (model === 'eleven_v4_turbo' ? 0.5 : 1));
const byVoice: Record<string, number> = {};
for (const c of clips) byVoice[mapVoice(c.voice).name] = (byVoice[mapVoice(c.voice).name] ?? 0) + 1;
console.log(`${clips.length} ta qisqa audio + ${listens.length} ta Listening, ${chars} belgi ≈ ${credits} kredit (${model})`, byVoice);
if (!flag('yes')) { console.log('Hisob-kitob rejimi: hech narsa yaratilmadi. Yaratish uchun --yes.'); process.exit(0); }

const client = elevenLabsFromEnv();
if (!client) { console.error('ELEVENLABS_API_KEY yo‘q'); process.exit(3); }
mkdirSync(join(out, 'clips'), { recursive: true }); mkdirSync(join(out, 'listening'), { recursive: true });
const saveManifest = () => { manifest.clips = [...have].sort(); writeFileSync(manifestPath, JSON.stringify(manifest)); };

let ok = 0, fail = 0;
for (const c of clips) {
  try {
    const audio = await synthesize(client, { text: c.text, voiceId: mapVoice(c.voice).id, modelId: model, outputFormat: 'mp3_22050_32' });
    writeFileSync(join(out, 'clips', `${c.key}.mp3`), audio);
    have.add(c.key); ok++;
    if (ok % 25 === 0) { saveManifest(); console.log(`… ${ok}/${clips.length}`); }
  } catch (e) { fail++; console.log(`✗ ${c.key} "${c.text.slice(0, 40)}": ${(e as Error).message.slice(0, 120)}`); }
}
saveManifest();

// Listening: har gap alohida yaratiladi, so'ng pauza bilan bitta mp3 ga ulanadi (ffmpeg).
for (const l of listens) {
  const dir = join(tmpdir(), `listen-${l.id}`); mkdirSync(dir, { recursive: true });
  const parts: string[] = [];
  const sil = join(dir, 'sil.mp3');
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'lavfi', '-i', 'anullsrc=r=22050:cl=mono', '-t', String(l.pauseMs / 1000), '-c:a', 'libmp3lame', '-b:a', '32k', sil]);
  let bad = false;
  for (const [i, line] of l.lines.entries()) {
    try {
      const a = await synthesize(client, { text: line.text, voiceId: mapVoice(line.voice).id, modelId: model, outputFormat: 'mp3_22050_32' });
      const f = join(dir, `${i}.mp3`); writeFileSync(f, a); parts.push(f, sil);
    } catch (e) { bad = true; console.log(`✗ ${l.id} #${i}: ${(e as Error).message.slice(0, 120)}`); break; }
  }
  if (bad) { fail++; continue; }
  const list = join(dir, 'list.txt'); writeFileSync(list, parts.map((p) => `file '${p}'`).join('\n'));
  const dest = join(out, 'listening', `${l.id}.mp3`);
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', list, '-ac', '1', '-ar', '22050', '-c:a', 'libmp3lame', '-b:a', '40k', dest]);
  const seconds = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', dest]).toString().trim());
  manifest.listening[l.id] = { file: `/audio/listening/${l.id}.mp3`, seconds: Math.round(seconds * 10) / 10 };
  saveManifest(); ok++;
  console.log(`✓ ${l.id} (${manifest.listening[l.id].seconds} s)`);
}
console.log(`Tayyor: ${ok}, xato: ${fail}`);
process.exit(fail ? 1 : 0);
