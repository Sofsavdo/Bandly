// Barcha inglizcha audio ElevenLabs bilan oldindan yaratiladi (brauzer ovozi ishlatilmaydi).
// Ishlatish: NODE_USE_ENV_PROXY=1 npx tsx scripts/audio/generate.ts [--reserve 5000] [--dry]
// Kalit: ELEVENLABS_API_KEY (yoki bulut sessiyasida proksi o'zi qo'yadi). Kodda kalit yo'q.
// Navbat: Listening mini-testlar → IELTS darslaridagi tinglash savollari → to'liq Listening → daraja testi audiosi → Speaking imtihonchisi → dars misollari → so'zlar → shadowing.
// Qayta ishga tushirilsa, tayyorlarini o'tkazib yuboradi. Kredit `--reserve` dan kamaysa to'xtaydi (AI ustoz ovozi uchun zaxira).
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync, copyFileSync } from 'node:fs';
import { join } from 'node:path';
import { clipInventory, listeningInventory, type Clip } from './inventory';
import { listeningTests } from '../../src/content/listeningTests';

const ROOT = new URL('../../', import.meta.url).pathname;
const PUB = join(ROOT, 'public/audio');
const CACHE = join(ROOT, '.audio-cache');
const MODEL = 'eleven_v4_turbo';
const FORMAT = 'mp3_44100_64';
const arg = (n: string) => { const i = process.argv.indexOf(`--${n}`); return i >= 0 ? process.argv[i + 1] : undefined; };
const RESERVE = Number(arg('reserve') ?? 5000);
const DRY = process.argv.includes('--dry');
const KEY = process.env.ELEVENLABS_API_KEY || 'proxy-injected';

/** Bitta doimiy ovozlar to'plami (Britaniya talaffuzi). Dars, so'z, Speaking — bitta diktor. */
export const VOICES = {
  narrator: 'Xb7hH8MSUJpSbSDYk0k2', // Alice — British female, educational
  femaleA: 'pFZP5JQG7iQjIQuC4Bku',  // Lily — British female
  femaleB: 'Xb7hH8MSUJpSbSDYk0k2',  // Alice
  maleA: 'onwK4e9ZLuTAKqWW03F9',    // Daniel — British male, broadcaster
  maleB: 'JBFqnCBsd6RMkjVDRZzb',    // George — British male
} as const;
const FEMALE = new Set(['Madina', 'Anna', 'Maria', 'Aziza', 'Leila', 'Emma', 'Sarah', 'Hope', 'Helen / Lecturer', 'Customer', 'Agent', 'Receptionist', 'Librarian', 'Coordinator', 'Adviser', 'Professor']);

/** Test ichida har bir so'zlovchiga alohida ovoz: ayollar Lily/Alice, erkaklar Daniel/George navbat bilan. */
export function castFor(names: Record<string, string>, order: string[]): Record<string, string> {
  const out: Record<string, string> = {}; let f = 0, m = 0;
  for (const sp of order) {
    if (out[sp]) continue;
    const female = FEMALE.has(names[sp] ?? '');
    out[sp] = female ? (f++ % 2 ? VOICES.femaleB : VOICES.femaleA) : (m++ % 2 ? VOICES.maleB : VOICES.maleA);
  }
  return out;
}

const manifestPath = join(PUB, 'manifest.json');
type Manifest = { clips: string[]; listening: Record<string, { file: string; seconds: number; provider?: string }>; elevenlabs?: string[] };
const manifest: Manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
manifest.elevenlabs ??= [];
const elDone = new Set(manifest.elevenlabs);
const saveManifest = () => {
  manifest.clips = [...new Set(manifest.clips)].sort();
  manifest.elevenlabs = [...elDone].sort();
  writeFileSync(manifestPath, JSON.stringify(manifest) + '\n');
};

let credits = 0;
async function refreshCredits(): Promise<number> {
  const r = await fetch('https://api.elevenlabs.io/v1/user/subscription', { headers: { 'xi-api-key': KEY } });
  const d = await r.json() as { character_count: number; character_limit: number };
  credits = d.character_limit - d.character_count;
  return credits;
}

/** Bitta gapni ovozlaydi (keshlanadi: bir xil ovoz+matn qayta pul talab qilmaydi). */
async function tts(text: string, voice: string): Promise<string> {
  mkdirSync(CACHE, { recursive: true });
  const file = join(CACHE, createHash('sha256').update(`${voice}|${MODEL}|${FORMAT}|${text}`).digest('hex').slice(0, 24) + '.mp3');
  if (existsSync(file)) return file;
  const cost = Math.ceil(text.length * 0.5);
  if (credits - cost < RESERVE) throw new Error('RESERVE');
  for (let attempt = 1; ; attempt++) {
    const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}?output_format=${FORMAT}`, {
      method: 'POST', headers: { 'xi-api-key': KEY, 'content-type': 'application/json', accept: 'audio/mpeg' },
      body: JSON.stringify({ text, model_id: MODEL }),
    });
    if (r.ok) {
      const buf = Buffer.from(await r.arrayBuffer());
      if (buf.length < 200) throw new Error('empty audio');
      writeFileSync(file, buf); credits -= cost; return file;
    }
    const body = (await r.text()).slice(0, 200);
    if ((r.status === 429 || r.status >= 500) && attempt < 5) { await new Promise((res) => setTimeout(res, 2000 * attempt)); continue; }
    throw new Error(`HTTP ${r.status}: ${body}`);
  }
}

const seconds = (f: string): number => Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString().trim()) || 0;

async function doListening(id: string): Promise<boolean> {
  if (manifest.listening[id]?.provider === 'elevenlabs') return true;
  const t = listeningTests.find((x) => x.id === id)!;
  const cast = castFor(t.names as Record<string, string>, t.script.map((l) => l.speaker));
  const parts: string[] = [];
  for (const l of t.script) parts.push(await tts(l.text.replace(/\s+/g, ' ').trim(), cast[l.speaker]!));
  // gaplar orasida 0.6 s jimlik; qism sarlavhalari oldidan 2 s (to'liq testlarda)
  const breaks = new Set((t.sections ?? []).map((s) => s.at).filter((a) => a > 0));
  const list = join(CACHE, `${id}.txt`);
  const sil = (s: number) => { const f = join(CACHE, `silence-${s}.mp3`); if (!existsSync(f)) execFileSync('ffmpeg', ['-y', '-v', 'error', '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=mono', '-t', String(s), '-b:a', '64k', f]); return f; };
  const seq: string[] = [];
  parts.forEach((p, i) => { if (i > 0) seq.push(breaks.has(i) ? sil(2) : sil(0.6)); seq.push(p); });
  writeFileSync(list, seq.map((f) => `file '${f}'`).join('\n'));
  mkdirSync(join(PUB, 'listening'), { recursive: true });
  const out = join(PUB, 'listening', `${id}.mp3`);
  execFileSync('ffmpeg', ['-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', list, '-ac', '1', '-ar', '44100', '-b:a', '64k', out]);
  manifest.listening[id] = { file: `/audio/listening/${id}.mp3`, seconds: Math.round(seconds(out) * 10) / 10, provider: 'elevenlabs' };
  saveManifest();
  console.log(`✓ listening ${id} (${manifest.listening[id]!.seconds}s) · credits left ${credits}`);
  return true;
}

async function doClip(c: Clip): Promise<void> {
  if (elDone.has(c.key)) return;
  const f = await tts(c.text, VOICES.narrator);
  mkdirSync(join(PUB, 'clips'), { recursive: true });
  copyFileSync(f, join(PUB, 'clips', `${c.key}.mp3`));
  manifest.clips.push(c.key); elDone.add(c.key);
}

const LEVEL = ['A1', 'A2', 'B1', 'B2', 'C1'];
const lis = listeningTests.filter((t) => t.id in Object.fromEntries(listeningInventory().map((l) => [l.id, 1])));
const minis = lis.filter((t) => !t.sections?.length).sort((a, b) => LEVEL.indexOf(a.level) - LEVEL.indexOf(b.level)).map((t) => t.id);
const fulls = lis.filter((t) => t.sections?.length).map((t) => t.id);
const clips = clipInventory();
const ORDER: Clip['category'][] = ['lesson-listen', 'listening-skill', 'speaking', 'lesson', 'word', 'shadow'];
const queue: (() => Promise<unknown>)[] = [
  ...minis.map((id) => () => doListening(id)),
  ...clips.filter((c) => c.category === 'lesson-listen').map((c) => () => doClip(c)),
  ...fulls.map((id) => () => doListening(id)),
  ...ORDER.slice(1).flatMap((cat) => clips.filter((c) => c.category === cat).map((c) => () => doClip(c))),
];

const todoChars = minis.concat(fulls).filter((id) => manifest.listening[id]?.provider !== 'elevenlabs').reduce((s, id) => s + (listeningInventory().find((l) => l.id === id)?.chars ?? 0), 0)
  + clips.filter((c) => !elDone.has(c.key)).reduce((s, c) => s + c.text.length, 0);
await refreshCredits();
console.log(`Navbat: ${queue.length} ish · qolgan matn ${todoChars} belgi ≈ ${Math.ceil(todoChars * 0.5)} kredit · hisobda ${credits} kredit · zaxira ${RESERVE}`);
if (DRY) process.exit(0);
let n = 0;
for (const job of queue) {
  try { await job(); } catch (e) {
    if ((e as Error).message === 'RESERVE') { console.log(`■ To'xtadi: kredit zaxiraga yetdi (${credits} qoldi).`); break; }
    console.log(`✗ ${(e as Error).message}`);
  }
  if (++n % 50 === 0) { saveManifest(); await refreshCredits(); console.log(`… ${n}/${queue.length} · credits ${credits}`); }
}
saveManifest();
await refreshCredits();
const left = clips.filter((c) => !elDone.has(c.key)).length + lis.filter((t) => manifest.listening[t.id]?.provider !== 'elevenlabs').length;
console.log(`Tayyor. ElevenLabs klip: ${elDone.size}, listening: ${Object.values(manifest.listening).filter((x) => x.provider === 'elevenlabs').length}/${lis.length}. Qolgan ish: ${left}. Kredit: ${credits}`);
process.exit(0);
