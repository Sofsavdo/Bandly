// Telegram Mini App rejimi va Login Widget (saytda). Server tomoni: server/telegram.ts.
// Mini App havolasi: /?tg=1&r=/mocks — Telegram URL hash'iga o'z ma'lumotini (tgWebAppData) qo'shadi;
// telegram-web-app.js uni o'qib bo'lgach, hash bizning marshrutga almashtiriladi.
import { getAccount, loginTelegram, logout as accountLogout } from './account';

interface TgWebApp {
  initData: string; colorScheme?: 'light' | 'dark'; ready(): void; expand(): void;
  BackButton: { show(): void; hide(): void; onClick(cb: () => void): void };
  setHeaderColor?(c: string): void; setBackgroundColor?(c: string): void;
}
declare global { interface Window { Telegram?: { WebApp?: TgWebApp }; sellzenTgAuth?: (u: unknown) => void } }

const loadScript = (src: string, ms = 4000): Promise<void> => new Promise((resolve) => {
  const s = document.createElement('script'); s.src = src; s.async = true;
  const done = () => resolve(); s.onload = done; s.onerror = done; setTimeout(done, ms);
  document.head.appendChild(s);
});

export const webApp = (): TgWebApp | null => (window.Telegram?.WebApp?.initData ? window.Telegram.WebApp : null);
export const inTelegram = (): boolean => document.documentElement.dataset.tg === '1';

/** main.tsx dan render'dan oldin chaqiriladi. Oddiy saytda hech narsa qilmaydi. */
export async function bootTelegram(): Promise<void> {
  const q = new URLSearchParams(location.search);
  const fromTg = q.get('tg') === '1' || location.hash.includes('tgWebAppData') || sessionStorage.getItem('bandly.tg') === '1';
  if (!fromTg) return;
  await loadScript('https://telegram.org/js/telegram-web-app.js');
  const wa = webApp();
  const route = q.get('r');
  if (q.has('tg') || location.hash.includes('tgWebAppData')) history.replaceState(null, '', `${location.pathname}#${route && route.startsWith('/') ? route : '/'}`);
  if (!wa) return; // Telegram tashqarisida ?tg=1 bilan ochilgan — oddiy sayt
  try { sessionStorage.setItem('bandly.tg', '1'); } catch { /* */ }
  document.documentElement.dataset.tg = '1';
  wa.ready(); wa.expand();
  // Orqaga tugmasi: bosh sahifadan boshqa joyda ko'rinadi
  const syncBack = () => (location.hash && location.hash !== '#/' ? wa.BackButton.show() : wa.BackButton.hide());
  wa.BackButton.onClick(() => (history.length > 1 ? history.back() : (location.hash = '#/')));
  window.addEventListener('hashchange', syncBack); syncBack();
  // Avtomatik kirish (Telegram ichida parol ham, tugma ham kerak emas)
  if (!getAccount() || !sessionStorage.getItem('bandly.tg.auth')) {
    try { sessionStorage.setItem('bandly.tg.auth', '1'); await loginTelegram('webapp', wa.initData); } catch { try { sessionStorage.removeItem('bandly.tg.auth'); } catch { /* */ } /* server Telegram'ni hali sozlamagan bo'lishi mumkin — sayt baribir ishlaydi */ }
  }
}

/** Telegram ichida avtomatik kirish qayta urinishi. */
export async function retryWebAppLogin(): Promise<void> { const wa = webApp(); if (wa) await loginTelegram('webapp', wa.initData); }

/** Saytdagi "Telegram orqali kirish" tugmasini (rasmiy widget) berilgan elementga joylaydi. */
export function mountLoginWidget(el: HTMLElement, bot: string, onDone: (err: string | null) => void): void {
  window.sellzenTgAuth = (u: unknown) => { loginTelegram('widget', u).then(() => onDone(null), (e: Error) => onDone(e.message)); };
  el.innerHTML = '';
  const s = document.createElement('script');
  s.async = true; s.src = 'https://telegram.org/js/telegram-widget.js?22';
  s.setAttribute('data-telegram-login', bot);
  s.setAttribute('data-size', 'large');
  s.setAttribute('data-radius', '12');
  s.setAttribute('data-userpic', 'false');
  s.setAttribute('data-lang', 'uz');
  s.setAttribute('data-request-access', 'write');
  s.setAttribute('data-onauth', 'sellzenTgAuth(user)');
  el.appendChild(s);
}

export const logout = accountLogout;
