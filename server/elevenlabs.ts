import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

// ElevenLabs (ovoz). Kalit faqat serverda, ELEVENLABS_API_KEY muhit o'zgaruvchisidan o'qiladi; kodda kalit yo'q.
// Kalit bo'lmasa klient yaratilmaydi va ovoz funksiyasi "mavjud emas" holatida qoladi (hech narsa soxtalashtirilmaydi).
// Hozircha hech qaysi API marshrutiga ulanmagan: faqat ovoz demosi skripti ishlatadi (docs/audit/voice).

export const EL_MODELS = ['eleven_v4', 'eleven_v4_turbo'] as const;

/** Egasi tanlagan ustoz ovozi (2026-11-15, demo tinglangandan keyin): "Mirzaev - Uzbek" + eleven_v4_turbo.
 *  Ogohlantirish muddati 30 kun (ovoz egasi uni kutubxonadan shu muddat bilan olib tashlashi mumkin) — zaxira ovoz kerak. */
export const TUTOR_VOICE = { voiceId: 'RaNVfTYq3HYeFPLng6XN', name: 'Mirzaev - Uzbek', modelId: 'eleven_v4_turbo' } as const;
export type ElModel = (typeof EL_MODELS)[number];
export const isElModel = (m: string): m is ElModel => (EL_MODELS as readonly string[]).includes(m);

export function elevenLabsFromEnv(env: NodeJS.ProcessEnv = process.env): ElevenLabsClient | null {
  const key = (env.ELEVENLABS_API_KEY ?? '').trim();
  return key ? new ElevenLabsClient({ apiKey: key }) : null;
}

export interface SynthRequest { text: string; voiceId: string; modelId: ElModel; outputFormat?: 'mp3_44100_128' | 'mp3_22050_32' }

/** Matnni ovozga o'giradi va MP3 baytlarini qaytaradi. Xato bo'lsa istisno otadi (chaqiruvchi "mavjud emas" deb ko'rsatadi). */
export async function synthesize(client: ElevenLabsClient, req: SynthRequest): Promise<Buffer> {
  if (!/^[A-Za-z0-9]{10,40}$/.test(req.voiceId)) throw new Error('voiceId noto‘g‘ri');
  if (!isElModel(req.modelId)) throw new Error('model ruxsat etilmagan');
  const stream = await client.textToSpeech.convert(req.voiceId, {
    text: req.text,
    modelId: req.modelId,
    outputFormat: req.outputFormat ?? 'mp3_44100_128',
  });
  const chunks: Buffer[] = [];
  for await (const c of stream as unknown as AsyncIterable<Uint8Array>) chunks.push(Buffer.from(c));
  const audio = Buffer.concat(chunks);
  if (audio.length < 200) throw new Error('bo‘sh audio');
  return audio;
}
