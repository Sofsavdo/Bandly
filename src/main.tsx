import './lib/cloudBoot'; // birinchi bo'lishi shart: navbatdagi hisob progressi boshqa modullardan oldin yoziladi
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/inter';
import '@fontsource-variable/outfit';
import './styles.css';
import './design3.css'; // Design 3.0 qatlami: pastel ranglar, qora pill tugmalar, yon panel
import { deepTranslate, getLang, initI18n } from './i18n';
import { captureRef } from './lib/referral';
import { installNetRetry } from './lib/netRetry';
installNetRetry(); // deploy paytidagi qisqa uzilishda o'qish so'rovlari o'zi qayta uriniladi

captureRef(); // taklif havolasi (Telegram URL'ni tozalashidan oldin)

// Yangi versiya chiqqach keshlangan eski sahifadagi bo'lak fayllari (masalan /assets/cert-xxxx.js) 404 bo'ladi (jurnal 2026-11-24): sahifa bir marta o'zi yangilanadi
window.addEventListener('vite:preloadError', (e) => {
  try { const k = 'sz.chunkReload'; if (Date.now() - Number(sessionStorage.getItem(k) || 0) > 60_000) { sessionStorage.setItem(k, String(Date.now())); e.preventDefault(); location.reload(); } } catch { /* sessionStorage yo'q — odatdagi xato */ }
});

// Server so'rovlariga til sarlavhasi: server xabarlari (xatolar va h.k.) shu tilda qaytadi
const nativeFetch = window.fetch.bind(window);
window.fetch = (input, init) => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
  if (url.startsWith('/api/') || url.startsWith(`${location.origin}/api/`)) {
    const headers = new Headers(init?.headers ?? (input instanceof Request ? input.headers : undefined));
    headers.set('x-lang', getLang());
    return nativeFetch(input, { ...init, headers });
  }
  return nativeFetch(input, init);
};

// Avval til lug'ati, keyin ilova modullari: modul darajasidagi matnlar ham tanlangan tilda hosil bo'ladi
void initI18n().then(async () => {
  // Faqat ilova allaqachon ishlatadigan ma'lumot modullari (javob kalitlari bor modullar bu ro'yxatga KIRMAYDI)
  const mods = await Promise.all([
    import('./content/lessons'), import('./content/vocab'), import('./content/roasts'), import('./content/writingGuide'), import('./content/mockTests'),
    import('./content/curriculum/inventory'), import('./content/curriculum/pilot'), import('./content/mockShared'), import('./content/speakingModels'),
    import('./content/speakingEasy'), import('./content/speaking'), import('./content/scenes'), import('./content/practice'), import('./content/placement'),
    import('./content/grammar'), import('./content/writing'), import('./content/tips'), import('./content/skillCheck'), import('./content/personas'),
    import('./content/mockTests'), import('./content/examFormats'), import('./content/lines'), import('./content/vocabWriting'),
    import('./content/satPractice'),
  ]);
  for (const m of mods) for (const v of Object.values(m as Record<string, unknown>)) deepTranslate(v);
  // Admin paneldagi limit va narxlar (tariflar matni, bepul tarif raqamlari) — ko'pi bilan 1,5 soniya kutiladi
  await Promise.race([import('./lib/pay').then((m) => m.payConfig()).catch(() => undefined), new Promise((r) => setTimeout(r, 1500))]);
  const [{ default: App }, { startSync }, { initPay }, { bootTelegram }, { pullIfNewer, startCloud }, { loadRemoteContent }, { loadStudioTests }] = await Promise.all([
    import('./App'), import('./lib/account'), import('./lib/pay'), import('./lib/telegram'), import('./lib/cloud'), import('./content/remote'), import('./content/mockTests'),
  ]);
  // Telegram Mini App bo'lsa — avval Telegram skripti va avtomatik kirish; keyin hisob progressi (boshqa qurilmada yangilangan bo'lsa)
  await Promise.all([bootTelegram().then(() => pullIfNewer()), loadRemoteContent(), loadStudioTests()]).catch(() => undefined);
  startSync();
  void import('./lib/freeQuota').then((m) => m.syncFree());
  startCloud();
  void initPay();
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
