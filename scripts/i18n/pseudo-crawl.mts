// Tekshiruv: ilovani belgili rejimda ochib, tarjimadan o'tmagan ko'rinadigan matnlarni topadi.
// Ishlatish: npm run build && npx vite preview --port 4173 & ; node --experimental-strip-types scripts/i18n/pseudo-crawl.mts → pseudo-left.txt
import { createRequire } from 'node:module'; import { writeFileSync } from 'node:fs';
const { chromium } = createRequire(import.meta.url)('playwright');
const U = 'http://localhost:4173'; const b = await chromium.launch();
const routes = ['', 'welcome', 'learn', 'learn/a1-u1-l1', 'boss/a1-u1', 'exam', 'exam/writing', 'exam/speaking', 'mocks', 'mocks/reading', 'mocks/listening', 'mocks/reading/reading-full-1', 'mocks/full', 'coach', 'games', 'games/rush', 'games/pairs', 'games/spell', 'grammar', 'practice', 'shadow', 'mistakes', 'homework', 'results', 'tools', 'league', 'duel', 'profile', 'pricing', 'placement', 'skills', 'challenge', 'studio'];
const found = new Map<string, Set<string>>();
for (const [w, h] of [[390, 844], [1366, 900]]) {
  const c = await b.newContext({ viewport: { width: w, height: h } }); const m = await c.newPage();
  await m.goto(U + '/#/'); await m.evaluate(() => { localStorage.setItem('bandly.i18n.pseudo', '1'); localStorage.setItem('bandly.profile.v1', JSON.stringify({ level: 'B1', xp: 340, dailyXp: 10, streak: 3 })); });
  for (const r of routes) {
    await m.goto(`${U}/#/${r}`); await m.reload(); await m.waitForTimeout(700);
    // menyu ochiq holatini ham ko'rish
    if (r === '' && w < 900) { await m.locator('.menu-btn').click().catch(() => {}); await m.waitForTimeout(300); }
    const txt: string[] = await m.evaluate(() => {
      const out: string[] = []; const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let n: Node | null;
      while ((n = tw.nextNode())) {
        const el = n.parentElement!; const s = n.textContent ?? '';
        if (!/[A-Za-zА-Яа-яЎўҚқҒғҲҳ]{2,}/.test(s) || s.includes('⁣')) continue;
        if (el.closest('script,style,svg text,[aria-hidden="true"] svg')) continue;
        const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden') continue;
        out.push(s.replace(/\s+/g, ' ').trim());
      }
      for (const el of document.querySelectorAll('[aria-label],[placeholder],[title]')) for (const a of ['aria-label', 'placeholder', 'title']) { const v = el.getAttribute(a); if (v && /[A-Za-z]{2,}/.test(v) && !v.includes('⁣')) out.push(`@${a}: ${v}`); }
      return out;
    });
    for (const t of txt) { if (!found.has(t)) found.set(t, new Set()); found.get(t)!.add(r || 'home'); }
  }
  await c.close();
}
await b.close();
const rows = [...found.entries()].map(([t, r]) => `${t}\t[${[...r].slice(0, 3).join(',')}]`).sort();
writeFileSync('pseudo-left.txt', rows.join('\n')); console.log('unmarked', rows.length);
