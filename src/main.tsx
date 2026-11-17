import './lib/cloudBoot'; // birinchi bo'lishi shart: navbatdagi hisob progressi boshqa modullardan oldin yoziladi
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/inter';
import '@fontsource-variable/outfit';
import './styles.css';
import './design3.css'; // Design 3.0 qatlami: pastel ranglar, qora pill tugmalar, yon panel
import { deepTranslate, getLang, initI18n } from './i18n';

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
  const content = import.meta.glob('./content/**/*.ts');
  const mods = await Promise.all(Object.entries(content).filter(([p]) => !p.endsWith('.test.ts')).map(([, load]) => load()));
  for (const m of mods) for (const v of Object.values(m as Record<string, unknown>)) deepTranslate(v);
  const [{ default: App }, { startSync }, { initPay }, { bootTelegram }, { pullIfNewer, startCloud }, { loadRemoteContent }] = await Promise.all([
    import('./App'), import('./lib/account'), import('./lib/pay'), import('./lib/telegram'), import('./lib/cloud'), import('./content/remote'),
  ]);
  // Telegram Mini App bo'lsa — avval Telegram skripti va avtomatik kirish; keyin hisob progressi (boshqa qurilmada yangilangan bo'lsa)
  await Promise.all([bootTelegram().then(() => pullIfNewer()), loadRemoteContent()]).catch(() => undefined);
  startSync();
  startCloud();
  void initPay();
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
