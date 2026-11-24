// Google Identity Services tugmasi. Faqat server GOOGLE_CLIENT_ID ni bersa (authConfig().google) ishlatiladi.
// Skript https://accounts.google.com/gsi/client dan yuklanadi; ID token serverga yuboriladi va u yerda tekshiriladi.
interface GsiId { initialize(o: { client_id: string; callback: (r: { credential?: string }) => void; ux_mode?: string; auto_select?: boolean }): void; renderButton(el: HTMLElement, o: Record<string, unknown>): void }
declare global { interface Window { google?: { accounts: { id: GsiId } } } }

let loading: Promise<void> | null = null;
export function loadGoogle(): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve();
  return (loading ??= new Promise<void>((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client'; s.async = true; s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => { loading = null; s.remove(); reject(new Error('google script')); };
    document.head.appendChild(s);
  }));
}
/** Tugmani el ichiga chizadi. Skript yuklanmasa (Google yopiq) — false: chaqiruvchi tugmani ko'rsatmaydi. */
export async function mountGoogleButton(el: HTMLElement, clientId: string, lang: string, onCredential: (credential: string) => void): Promise<boolean> {
  try { await loadGoogle(); } catch { return false; }
  const id = window.google?.accounts?.id; if (!id) return false;
  id.initialize({ client_id: clientId, callback: (r) => { if (r.credential) onCredential(r.credential); }, ux_mode: 'popup', auto_select: false });
  el.innerHTML = '';
  id.renderButton(el, { type: 'standard', theme: 'outline', size: 'large', shape: 'pill', text: 'continue_with', logo_alignment: 'left', locale: lang, width: Math.min(300, Math.max(200, el.clientWidth || 280)) });
  return true;
}
