import { useEffect, useState } from 'react';
import { hasClip } from './clips';

/** Matn uchun oldindan yaratilgan ElevenLabs audiosi bormi: null — tekshirilmoqda, true/false — aniq.
 *  Audio fayli (audio) berilgan bo'lsa — doim true. Brauzer ovozi ishlatilmaydi, shuning uchun audiosi yo'q matn uchun tugma ko'rsatilmaydi. */
export function useClip(text: string, audio?: string): boolean | null {
  const [ok, setOk] = useState<boolean | null>(audio ? true : null);
  useEffect(() => {
    if (audio) { setOk(true); return; }
    let on = true;
    setOk(null);
    void hasClip(text).then((v) => { if (on) setOk(v); });
    return () => { on = false; };
  }, [text, audio]);
  return ok;
}
