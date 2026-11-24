// Ochiq (hisobsiz) SEO sahifalari: public/vositalar/*.html, robots.txt, sitemap.xml.
// Google topa oladigan oddiy HTML (SPA emas): matn sahifaning o'zida, hisoblash kichik ichki skript bilan.
// Ishlatish: npx tsx scripts/seo/gen.ts   (test: scripts/seo/gen.test.ts — fayllar kontent bilan mosligini tekshiradi)
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { LISTENING_TABLE, READING_ACADEMIC_TABLE, READING_GENERAL_TABLE } from '../../src/lib/band';
import { UZ_MULTILEVEL } from '../../src/content/examFormats';
import { part1Topics, part2Cards } from '../../src/content/speaking';
import { writingPrompts } from '../../src/content/writing';

export const SITE = 'https://sellzen.uz';
const ROOT = new URL('../../public/', import.meta.url).pathname;

/** IELTS ↔ CEFR: ielts.org "IELTS and the CEFR" (2026-11-18 da o'qildi). Chegara ballar (5.0, 8.0) — oraliq holat. */
export const IELTS_CEFR = [
  { cefr: 'C2', ielts: '8.5–9.0', min: 8.5 },
  { cefr: 'C1', ielts: '7.0–8.0', min: 7 },
  { cefr: 'B2', ielts: '5.5–6.5', min: 5.5 },
  { cefr: 'B1', ielts: '4.0–5.0', min: 4 },
];
const IELTS_SRC = { title: 'IELTS and the CEFR — ielts.org', url: 'https://ielts.org/organisations/ielts-for-organisations/compare-ielts/ielts-and-the-cefr' };

/** Ilovadagi brend belgisi (src/components/Logo.tsx bilan bir xil shakl). */
const LOGO = '<svg viewBox="0 0 100 100" aria-hidden="true"><defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3A4A66"/><stop offset=".45" stop-color="#9DB0C9"/><stop offset=".6" stop-color="#5B6E8C"/><stop offset="1" stop-color="#26344E"/></linearGradient></defs><path d="M86 38V30.5L50 9.5L14 30.5V46.5L86 53.5V69.5L50 90.5L14 69.5V62" fill="none" stroke="url(#lg)" stroke-width="13" stroke-linejoin="round"/></svg>';
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
const json = (v: unknown) => JSON.stringify(v).replace(/</g, '\\u003c');

type Lang = 'uz' | 'ru';
interface Page { slug: string; title: string; short: string; blurb: string; ru?: string; group: 'level' | 'score' | 'prep' }
/** O'zbekcha sahifalar; `ru` — ruscha versiyaning slug'i (hreflang juftligi). */
const PAGES: Page[] = [
  { slug: 'ingliz-tili-darajasini-aniqlash', group: 'level', title: 'Ingliz tili darajasini aniqlash testi', short: 'Daraja testi', blurb: '20 tagacha savol, ~3 daqiqa: A1 dan C1 gacha darajangiz va shaxsiy reja — bepul.', ru: 'test-urovnya-angliyskogo' },
  { slug: 'ielts-band-kalkulyator', group: 'score', title: 'IELTS band kalkulyatori', short: 'Band kalkulyatori', blurb: 'To‘g‘ri javoblar sonidan band va Overall ball, rasmiy yaxlitlash qoidasi bilan.' },
  { slug: 'multilevel-ball-hisoblash', group: 'score', title: 'CEFR Multilevel ball hisoblash', short: 'Multilevel ball', blurb: 'Multilevel balingiz (0–75) qaysi darajaga (B1, B2, C1) teng va imtihon formati.', ru: 'multilevel-bally' },
  { slug: 'cefr-darajalari', group: 'level', title: 'CEFR darajalari: A1 dan C2 gacha', short: 'CEFR darajalari', blurb: 'Har bir daraja nimani anglatadi, IELTS va Multilevel’dagi taxminiy mosligi.', ru: 'urovni-cefr' },
  { slug: 'ielts-cefr-multilevel', group: 'level', title: 'IELTS ↔ CEFR ↔ Multilevel', short: 'IELTS ↔ CEFR', blurb: 'IELTS balini CEFR darajasi va O‘zbekiston Multilevel ballari bilan solishtirish.' },
  { slug: 'ielts-speaking-part-2-mavzulari', group: 'prep', title: 'IELTS Speaking Part 2 mavzulari', short: 'Speaking Part 2', blurb: 'Part 2 kartochkalari ro‘yxati va har biriga Part 3 savollari.' },
  { slug: 'ielts-writing-task-2-savollari', group: 'prep', title: 'IELTS Writing Task 2 savollari', short: 'Writing Task 2', blurb: 'Insho turlari bo‘yicha guruhlangan Task 2 savollari.' },
  { slug: 'speaking-writing-mavzular', group: 'prep', title: 'IELTS Speaking va Writing mavzulari', short: 'Mavzu generatori', blurb: 'Tasodifiy Speaking va Writing mavzulari, imtihon taymeri bilan.' },
];
const RU_PAGES: Page[] = [
  { slug: 'test-urovnya-angliyskogo', group: 'level', title: 'Тест на уровень английского', short: 'Тест уровня', blurb: 'До 20 вопросов, ~3 минуты: ваш уровень от A1 до C1 и личный план — бесплатно.' },
  { slug: 'multilevel-bally', group: 'score', title: 'Баллы CEFR Multilevel', short: 'Баллы Multilevel', blurb: 'Какому уровню (B1, B2, C1) соответствуют баллы Multilevel (0–75) и формат экзамена.' },
  { slug: 'urovni-cefr', group: 'level', title: 'Уровни CEFR: от A1 до C2', short: 'Уровни CEFR', blurb: 'Что означает каждый уровень и примерное соответствие IELTS и Multilevel.' },
];
const pathOf = (lang: Lang, slug: string) => `${lang === 'ru' ? '/ru' : ''}/vositalar/${slug}`;
const pairOf = (lang: Lang, slug: string): { uz: string; ru: string } | null => {
  const uz = lang === 'uz' ? PAGES.find((p) => p.slug === slug) : PAGES.find((p) => p.ru === slug);
  return uz?.ru ? { uz: uz.slug, ru: uz.ru } : null;
};
const UI = {
  uz: { all: 'Barcha vositalar', app: 'Ilovani ochish', groups: { level: 'Darajangizni bilib oling', score: 'Ballni hisoblash', prep: 'Imtihonga tayyorgarlik' }, open: 'Ochish', fTools: 'Bepul vositalar', fApp: 'Sellzen', fLinks: [['/#/', 'Ilova'], ['/#/placement', 'Daraja testi'], ['/#/pricing', 'Narxlar'], ['https://t.me/Sellzenbot', 'Telegram bot'], ['https://t.me/Sellzen_AI', 'Telegram kanal']], tag: 'Ingliz tili, IELTS, CEFR va SAT — AI ustoz bilan.', nav: 'Vositalar', ctaH: 'Ingliz tili darajangizni bepul aniqlang', ctaP: '3 daqiqalik test: A1 dan C1 gacha darajangiz, maqsadingizga mos kunlik reja, darslar va mock testlar.', ctaB: 'Testni boshlash', foot: 'Sellzen — o‘zbek tilida ingliz tili va IELTS, CEFR, SAT tayyorgarligi. Bu vositalar bepul va ro‘yxatdan o‘tishsiz ishlaydi. Sellzen IELTS, Cambridge yoki UzBMB’ning rasmiy hamkori emas; natijalar taxminiy.' },
  ru: { all: 'Все инструменты', app: 'Открыть приложение', groups: { level: 'Узнайте свой уровень', score: 'Расчёт баллов', prep: 'Подготовка к экзамену' }, open: 'Открыть', fTools: 'Бесплатные инструменты', fApp: 'Sellzen', fLinks: [['/#/', 'Приложение'], ['/#/placement', 'Тест уровня'], ['/#/pricing', 'Тарифы'], ['https://t.me/Sellzenbot', 'Telegram-бот'], ['https://t.me/Sellzen_AI', 'Telegram-канал']], tag: 'Английский, IELTS, CEFR и SAT — с AI-наставником.', nav: 'Инструменты', ctaH: 'Узнайте свой уровень английского бесплатно', ctaP: 'Тест на 3 минуты: уровень от A1 до C1, ежедневный план под вашу цель, уроки и пробные экзамены.', ctaB: 'Начать тест', foot: 'Sellzen — английский язык и подготовка к IELTS, CEFR, SAT. Инструменты бесплатны и работают без регистрации. Sellzen не является официальным партнёром IELTS, Cambridge или UzBMB; результаты приблизительные.' },
} as const;

function layout(o: { slug: string; title: string; description: string; body: string; script?: string; lang?: Lang; kind?: 'tool' | 'page'; faq?: { q: string; a: string }[] }): string {
  const lang: Lang = o.lang ?? 'uz';
  const url = `${SITE}${pathOf(lang, o.slug)}`; // indeks sahifalari — slash bilan (sitemap va hreflang bilan bir xil)
  const pair = o.slug ? pairOf(lang, o.slug) : { uz: '', ru: '' };
  const alt = pair ? [`<link rel="alternate" hreflang="uz" href="${SITE}${pathOf('uz', pair.uz)}">`, `<link rel="alternate" hreflang="ru" href="${SITE}${pathOf('ru', pair.ru)}">`, `<link rel="alternate" hreflang="x-default" href="${SITE}${pathOf('uz', pair.uz)}">`].join('\n') : '';
  const pages = lang === 'ru' ? RU_PAGES : PAGES;
  const ui = UI[lang];
  const ld: unknown[] = [o.kind === 'page'
    ? { '@context': 'https://schema.org', '@type': 'WebPage', name: o.title, url, inLanguage: lang, publisher: { '@type': 'Organization', name: 'Sellzen' } }
    : { '@context': 'https://schema.org', '@type': 'WebApplication', name: o.title, url, applicationCategory: 'EducationalApplication', inLanguage: lang, offers: { '@type': 'Offer', price: '0', priceCurrency: 'UZS' }, publisher: { '@type': 'Organization', name: 'Sellzen' } }];
  if (o.faq?.length) ld.push({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: o.faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) });
  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(o.title)} — Sellzen</title>
<meta name="description" content="${esc(o.description)}">
<link rel="canonical" href="${url}">
${alt}
<meta property="og:title" content="${esc(o.title)}">
<meta property="og:description" content="${esc(o.description)}">
<meta property="og:type" content="website">
<meta property="og:url" content="${url}">
<link rel="icon" href="/favicon.svg">
<style>
:root{--bg:#f4f7f8;--card:#fff;--ink:#0B1F3A;--muted:#55627a;--line:#e1e7ec;--acc:#0F766E;--acc2:#2563eb;--ok:#1f9d61}
@media (prefers-color-scheme:dark){:root{--bg:#0b1422;--card:#132033;--ink:#eef3f8;--muted:#a3b0c2;--line:#22324a;--acc:#2dd4bf;--acc2:#60a5fa;--ok:#4cc98e}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.55 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
header,main,footer,nav.tools{max-width:960px;margin:0 auto;padding:0 16px}
header{display:flex;align-items:center;justify-content:space-between;gap:12px;padding-top:18px;padding-bottom:6px;flex-wrap:wrap}
.logo{display:inline-flex;align-items:center;gap:8px;color:var(--ink);text-decoration:none}.logo svg{width:30px;height:30px}.logo .word{font-weight:800;letter-spacing:.06em;font-size:16px}.logo em{font-style:normal;color:var(--muted)}.hright{display:flex;align-items:center;gap:12px}.lang{font-size:14px;color:var(--muted);text-decoration:none;font-weight:600}.btn.sm{padding:9px 14px;font-size:14px}
nav.tools{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;padding-top:8px;padding-bottom:4px;white-space:nowrap}nav.tools::-webkit-scrollbar{display:none}nav.tools a{flex:0 0 auto;font-size:14px;padding:6px 12px;border-radius:99px;color:var(--ink);text-decoration:none;border:1px solid var(--line);background:var(--card)}nav.tools a.on{background:var(--ink);color:var(--bg);border-color:var(--ink)}
h1{font-size:clamp(26px,5vw,38px);line-height:1.15;margin:18px 0 8px}h2{font-size:21px;margin:26px 0 8px}
.lead{color:var(--muted);margin:0 0 18px}
.card{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:18px;margin:14px 0}
label{display:block;font-weight:650;margin:10px 0 4px}input,select{width:100%;font:inherit;padding:10px 12px;border-radius:12px;border:1px solid var(--line);background:var(--bg);color:var(--ink)}
.grid{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(170px,1fr))}
.big{font-size:44px;font-weight:800;color:var(--acc);line-height:1}
.pill{display:inline-block;padding:4px 10px;border-radius:99px;background:var(--bg);border:1px solid var(--line);font-size:14px;margin:2px 4px 2px 0}
table{width:100%;border-collapse:collapse;font-size:15px}th,td{text-align:left;padding:9px 8px;border-bottom:1px solid var(--line)}th{color:var(--muted);font-weight:650}
.btn{display:inline-block;font:inherit;font-weight:700;padding:12px 18px;border-radius:99px;border:0;background:var(--ink);color:var(--bg);text-decoration:none;cursor:pointer}
.btn.alt{background:var(--card);color:var(--ink);border:1px solid var(--line)}
.cta{background:linear-gradient(135deg,var(--acc),var(--acc2));color:#fff;border:0}.cta p{margin:6px 0 14px}.cta .btn{background:#fff;color:#0B1F3A}
.muted{color:var(--muted)}.note{font-size:14px;color:var(--muted)}ul.src{padding-left:18px;font-size:14px}a{color:var(--acc)}
footer{margin-top:28px;padding-top:26px;padding-bottom:40px;font-size:14px;color:var(--muted);border-top:1px solid var(--line)}.fgrid{display:grid;gap:22px;grid-template-columns:1.4fr 1fr 1fr}.fgrid h3{font-size:12px;text-transform:uppercase;letter-spacing:.07em;color:var(--muted);margin:4px 0 8px}.fgrid a:not(.logo){display:block;color:var(--ink);text-decoration:none;padding:3px 0}.fgrid a:not(.logo):hover{color:var(--acc)}.fbrand p{margin:10px 0 0;max-width:280px}.fnote{font-size:12.5px;margin:14px 0 0}@media(max-width:640px){.fgrid{grid-template-columns:1fr 1fr}.fbrand{grid-column:1/-1}}
.groups h2{font-size:14px;text-transform:uppercase;letter-spacing:.06em;color:var(--muted);margin:26px 0 10px}.tiles{display:grid;gap:12px;grid-template-columns:repeat(auto-fill,minmax(260px,1fr))}.tile{display:flex;flex-direction:column;gap:6px;background:var(--card);border:1px solid var(--line);border-radius:18px;padding:18px;text-decoration:none;color:var(--ink);transition:border-color .15s,transform .15s}.tile:hover{border-color:var(--acc);transform:translateY(-1px)}.tile b{font-size:17px;line-height:1.3}.tile span{color:var(--muted);font-size:14.5px;flex:1}.tile i{font-style:normal;color:var(--acc);font-weight:700;font-size:14px}
.timer{font-variant-numeric:tabular-nums;font-size:34px;font-weight:800}
</style>
${ld.map((x) => `<script type="application/ld+json">${json(x)}</script>`).join('\n')}
</head>
<body>
<header><a class="logo" href="/" aria-label="Sellzen">${LOGO}<span class="word">SELLZEN<em>.UZ</em></span></a><div class="hright">${pair ? `<a class="lang" href="${pathOf(lang === 'uz' ? 'ru' : 'uz', o.slug ? (lang === 'uz' ? pair.ru : pair.uz) : '')}" hreflang="${lang === 'uz' ? 'ru' : 'uz'}">${lang === 'uz' ? 'RU' : 'UZ'}</a>` : ''}<a class="btn sm" href="/#/">${ui.app}</a></div></header>
${o.slug ? `<nav class="tools" aria-label="${ui.nav}"><a href="${pathOf(lang, '')}">← ${ui.all}</a>${pages.map((p) => `<a href="${pathOf(lang, p.slug)}"${p.slug === o.slug ? ' class="on" aria-current="page"' : ''}>${esc(p.short)}</a>`).join('')}</nav>` : ''}
<main>
${o.body}
<section class="card cta"><h2 style="margin-top:0">${ui.ctaH}</h2><p>${ui.ctaP}</p><a class="btn" href="/#/placement" onclick="try{navigator.sendBeacon('/api/event',new Blob(['{&quot;name&quot;:&quot;seo_cta&quot;}'],{type:'application/json'}))}catch(e){}">${ui.ctaB}</a></section>
</main>
<footer><div class="fgrid"><div class="fbrand"><a class="logo" href="/" aria-label="Sellzen">${LOGO}<span class="word">SELLZEN<em>.UZ</em></span></a><p>${ui.tag}</p></div><div><h3>${ui.fTools}</h3>${pages.map((p) => `<a href="${pathOf(lang, p.slug)}">${esc(p.short)}</a>`).join('')}</div><div><h3>${ui.fApp}</h3>${ui.fLinks.map(([h, t]) => `<a href="${h}"${h.startsWith('http') ? ' rel="noopener"' : ''}>${t}</a>`).join('')}</div></div><p class="fnote">${ui.foot}</p><p class="fnote">© 2026 Sellzen</p></footer>
${o.slug ? '<script>var t=document.querySelector("nav.tools .on");if(t)t.parentNode.scrollLeft=t.offsetLeft-16;</script>' : ''}
${o.script ? `<script>${o.script}</script>` : ''}
</body>
</html>
`;
}

function bandPage(): string {
  const opts = Array.from({ length: 19 }, (_, i) => i / 2).reverse().map((b) => `<option value="${b}"${b === 6 ? ' selected' : ''}>${b.toFixed(1)}</option>`).join('');
  const body = `<h1>IELTS band kalkulyatori</h1>
<p class="lead">Listening va Reading’dagi to‘g‘ri javoblar sonini kiriting, Writing va Speaking balingizni tanlang — umumiy (Overall) IELTS balingiz va keyingi yarim ballga nima yetmayotgani darhol chiqadi.</p>
<section class="card">
<div class="grid">
<div><label for="l">Listening: to‘g‘ri javoblar (0–40)</label><input id="l" type="number" min="0" max="40" value="28" inputmode="numeric"></div>
<div><label for="r">Reading: to‘g‘ri javoblar (0–40)</label><input id="r" type="number" min="0" max="40" value="27" inputmode="numeric"></div>
<div><label for="m">Reading moduli</label><select id="m"><option value="a">Academic</option><option value="g">General Training</option></select></div>
<div><label for="w">Writing band</label><select id="w">${opts}</select></div>
<div><label for="s">Speaking band</label><select id="s">${opts}</select></div>
</div>
</section>
<section class="card" aria-live="polite">
<div class="grid"><div><div class="muted">Overall</div><div class="big" id="ov">–</div></div><div id="parts"></div></div>
<p id="why" style="margin:12px 0 0"></p><p id="tip" style="margin:6px 0 0"></p>
</section>
<h2>Overall ball qanday hisoblanadi</h2>
<p>To‘rtta bo‘lim (Listening, Reading, Writing, Speaking) balining o‘rtachasi olinadi va eng yaqin yarim ballga yaxlitlanadi. O‘rtacha .25 bilan tugasa, keyingi yarim ballga (masalan, 6.25 → 6.5), .75 bilan tugasa, keyingi butun ballga (6.75 → 7.0) ko‘tariladi. Shu sababli bitta bo‘limni yarim ballga oshirish ko‘pincha umumiy balni ham ko‘taradi.</p>
<h2>To‘g‘ri javoblar → band jadvali</h2>
<p class="note">Listening va Reading uchun 40 ta savol beriladi. Quyidagi jadvallar ommaviy e’lon qilingan taxminiy o‘tkazish jadvallariga asoslangan: haqiqiy imtihonda chegaralar test versiyasiga qarab bir-ikki ballga farq qilishi mumkin.</p>
<div class="card" style="overflow-x:auto"><table><thead><tr><th>Band</th><th>Listening</th><th>Reading (Academic)</th><th>Reading (General)</th></tr></thead><tbody>
${[9, 8.5, 8, 7.5, 7, 6.5, 6, 5.5, 5, 4.5, 4].map((b) => { const f = (t: ReadonlyArray<readonly [number, number]>) => { const i = t.findIndex((x) => x[1] === b); return i < 0 ? '–' : `${t[i]![0]}${i > 0 ? `–${t[i - 1]![0] - 1}` : '–40'}`.replace(/^(\d+)–\1$/, '$1'); }; return `<tr><td><b>${b.toFixed(1)}</b></td><td>${f(LISTENING_TABLE)}</td><td>${f(READING_ACADEMIC_TABLE)}</td><td>${f(READING_GENERAL_TABLE)}</td></tr>`; }).join('\n')}
</tbody></table></div>
<p class="note">Writing va Speaking’ni imtihonchi 4 mezon bo‘yicha baholaydi. Ularni o‘zingiz aniqlash qiyin — Sellzen’da yozma ish va gapirish AI tomonidan shu mezonlar bo‘yicha baholanadi.</p>`;
  const script = `const T={l:${json(LISTENING_TABLE)},a:${json(READING_ACADEMIC_TABLE)},g:${json(READING_GENERAL_TABLE)}};
const band=(raw,t)=>{raw=Math.max(0,Math.min(40,Math.floor(+raw||0)));for(const [m,b] of t)if(raw>=m)return b;return 0};
const round=a=>Math.floor(a*2+0.5)/2;const $=id=>document.getElementById(id);
function calc(){const L=band($('l').value,T.l),R=band($('r').value,T[$('m').value]),W=+$('w').value,S=+$('s').value;const avg=(L+R+W+S)/4,o=round(avg);
$('ov').textContent=o.toFixed(1);$('parts').innerHTML=[['Listening',L],['Reading',R],['Writing',W],['Speaking',S]].map(([n,b])=>'<span class="pill">'+n+': <b>'+b.toFixed(1)+'</b></span>').join('');
$('why').textContent='O‘rtacha: ('+[L,R,W,S].map(x=>x.toFixed(1)).join(' + ')+') ÷ 4 = '+avg.toFixed(3).replace(/0+$/,'').replace(/\\.$/,'')+' → '+o.toFixed(1);
if(o>=9){$('tip').textContent='Maksimal ball!';return}const need=(o+0.5)*4-0.25*4-(L+R+W+S);const half=Math.max(0.5,Math.ceil(need*2)/2);
$('tip').textContent=need<=0.5?'Keyingi ball ('+(o+0.5).toFixed(1)+') uchun to‘rt bo‘limdan bittasini yarim ballga oshirish yetadi.':'Keyingi ball ('+(o+0.5).toFixed(1)+') uchun bo‘limlar yig‘indisi yana taxminan '+half.toFixed(1)+' ballga oshishi kerak.'}
['l','r','m','w','s'].forEach(i=>$(i).addEventListener('input',calc));calc();`;
  return layout({ slug: 'ielts-band-kalkulyator', title: 'IELTS band kalkulyatori (Overall ball hisoblash)', description: 'IELTS Listening va Reading to‘g‘ri javoblarini band’ga o‘tkazing va Overall balni rasmiy yaxlitlash qoidasi bilan hisoblang. Bepul, o‘zbek tilida.', body, script });
}

function cefrPage(): string {
  const ml = UZ_MULTILEVEL.scoring.value.cutoffs;
  const mlOf = (lv: string) => ml.find((c) => c.level === lv)?.range ?? '—';
  const body = `<h1>IELTS ↔ CEFR ↔ Multilevel</h1>
<p class="lead">IELTS balingiz qaysi CEFR darajasiga to‘g‘ri keladi va O‘zbekistondagi CEFR Multilevel imtihonida bu daraja qaysi ball oralig‘iga teng — bir sahifada.</p>
<section class="card" aria-live="polite">
<div class="grid">
<div><label for="i">IELTS band</label><select id="i">${Array.from({ length: 11 }, (_, k) => 9 - k / 2).map((b) => `<option value="${b}"${b === 6.5 ? ' selected' : ''}>${b.toFixed(1)}</option>`).join('')}</select><p id="io" style="margin:10px 0 0"></p></div>
<div><label for="mlv">Multilevel balingiz (0–75)</label><input id="mlv" type="number" min="0" max="75" value="55" inputmode="numeric"><p id="mo" style="margin:10px 0 0"></p></div>
</div>
</section>
<div class="card" style="overflow-x:auto"><table><thead><tr><th>CEFR</th><th>IELTS band</th><th>Multilevel ball</th></tr></thead><tbody>
${IELTS_CEFR.map((r) => `<tr><td><b>${r.cefr}</b></td><td>${r.ielts}</td><td>${r.cefr === 'C2' ? '— (Multilevel’da C2 yo‘q)' : mlOf(r.cefr)}</td></tr>`).join('\n')}
<tr><td>B1 dan past</td><td>4.0 dan past</td><td>${mlOf('B1 dan past')}</td></tr>
</tbody></table></div>
<h2>Bu moslik qanchalik aniq?</h2>
<p>IELTS’ning o‘zi ta’kidlaganidek, IELTS ballari va CEFR darajalari bir-biriga aynan teng emas: bu taxminiy moslik. Chegaradagi ballar ikki darajaga ham to‘g‘ri kelishi mumkin — masalan, 5.0 B1 yoki B2, 8.0 esa C1 yoki C2 bo‘lishi mumkin. Universitetlar odatda C1 uchun IELTS 7.0 ni talab qiladi.</p>
<p>Multilevel va IELTS to‘g‘ridan-to‘g‘ri taqqoslanmaydi: ikkalasi ham CEFR darajasiga bog‘langan, shuning uchun yuqoridagi jadval umumiy daraja orqali moslik ko‘rsatadi. Multilevel B1, B2 va C1 darajalarini beradi.</p>
<h2>Manbalar</h2>
<ul class="src"><li><a href="${IELTS_SRC.url}" rel="nofollow">${esc(IELTS_SRC.title)}</a> (2026-11-18 da o‘qildi)</li>${UZ_MULTILEVEL.sources.map((s) => `<li><a href="${esc(s.url)}" rel="nofollow">${esc(s.title)}</a> (${UZ_MULTILEVEL.verifiedAt} da o‘qildi)</li>`).join('')}</ul>
<p class="note">Multilevel ball chegaralari ${esc(UZ_MULTILEVEL.scoring.source ?? '')} dan olingan; keyinchalik o‘zgargan bo‘lishi mumkin.</p>`;
  const script = `const M=${json(IELTS_CEFR)};const ML=${json(ml.map((c) => ({ level: c.level, lo: Number(c.range.split('–')[0]), hi: Number(c.range.split('–')[1]) })))};const $=id=>document.getElementById(id);
function f(){const b=+$('i').value;const r=M.find(x=>b>=x.min);const border=b===5||b===8;$('io').innerHTML=r?'CEFR: <b>'+r.cefr+'</b>'+(border?' <span class="muted">(chegara ball — '+(b===5?'B1 yoki B2':'C1 yoki C2')+')</span>':''):'CEFR: B1 dan past';
const v=Math.max(0,Math.min(75,Math.round(+$('mlv').value||0)));const m=ML.find(x=>v>=x.lo&&v<=x.hi);const ie=m&&M.find(x=>x.cefr===m.level);$('mo').innerHTML=m?'Daraja: <b>'+m.level+'</b>'+(ie?' · IELTS’da taxminan <b>'+ie.ielts+'</b>':''):'Daraja aniqlanmadi'}
['i','mlv'].forEach(i=>$(i).addEventListener('input',f));f();`;
  return layout({ slug: 'ielts-cefr-multilevel', title: 'IELTS ↔ CEFR ↔ Multilevel: ballar mosligi', description: 'IELTS balini CEFR darajasiga (B1, B2, C1, C2) va O‘zbekistondagi CEFR Multilevel ballariga solishtiring. Rasmiy manbalar asosida, o‘zbek tilida.', body, script });
}

function topicsPage(): string {
  const p1 = part1Topics.map((t) => ({ t: t.topic, q: t.questions }));
  const p2 = part2Cards.map((c) => ({ t: c.title, p: c.points, q: c.part3 }));
  const w2 = writingPrompts.filter((w) => w.task === 2).map((w) => w.prompt);
  const body = `<h1>IELTS Speaking va Writing mavzu generatori</h1>
<p class="lead">Tasodifiy imtihon mavzusi va haqiqiy vaqt bilan mashq qiling: Speaking Part 1, Part 2 kartochkasi (1 daqiqa tayyorgarlik + 2 daqiqa nutq), Part 3 savollari va Writing Task 2 inshosi (40 daqiqa).</p>
<section class="card"><h2 style="margin-top:0">Speaking Part 1</h2><p class="muted" id="p1t"></p><ol id="p1"></ol><button class="btn alt" data-new="p1">Boshqa mavzu</button></section>
<section class="card"><h2 style="margin-top:0">Speaking Part 2 kartochkasi</h2><p><b id="p2t"></b></p><p class="muted" style="margin:0">Quyidagilar haqida gapiring:</p><ul id="p2"></ul>
<div class="timer" id="t2">1:00</div><p class="note" id="t2l">Tayyorgarlik: 1 daqiqa, keyin 2 daqiqa gapiring.</p>
<button class="btn" id="go2">Taymerni boshlash</button> <button class="btn alt" data-new="p2">Boshqa kartochka</button>
<h2>Part 3 (shu mavzu bo‘yicha)</h2><ol id="p3"></ol></section>
<section class="card"><h2 style="margin-top:0">Writing Task 2</h2><p id="w2"></p><div class="timer" id="tw">40:00</div><p class="note">Kamida 250 so‘z, 40 daqiqa.</p><button class="btn" id="gow">Taymerni boshlash</button> <button class="btn alt" data-new="w2">Boshqa mavzu</button></section>
<p class="note">Bu bazada ${p1.length} ta Part 1 mavzusi, ${p2.length} ta Part 2 kartochkasi va ${w2.length} ta Writing Task 2 savoli bor. Mavzular Sellzen’ning o‘z mashq materiali (rasmiy IELTS savollari emas). Javobingizni Sellzen’da yozib yoki aytib, AI bahosini olishingiz mumkin.</p>`;
  const script = `const D={p1:${json(p1)},p2:${json(p2)},w2:${json(w2)}};const $=id=>document.getElementById(id);const pick=a=>a[Math.floor(Math.random()*a.length)];
const li=a=>a.map(x=>'<li>'+x.replace(/[<>&]/g,'')+'</li>').join('');
function n1(){const t=pick(D.p1);$('p1t').textContent=t.t;$('p1').innerHTML=li(t.q)}
function n2(){const c=pick(D.p2);$('p2t').textContent=c.t;$('p2').innerHTML=li(c.p);$('p3').innerHTML=li(c.q);stop();$('t2').textContent='1:00';$('t2l').textContent='Tayyorgarlik: 1 daqiqa, keyin 2 daqiqa gapiring.'}
function nw(){$('w2').textContent=pick(D.w2);stopW();$('tw').textContent='40:00'}
const fmt=s=>Math.floor(s/60)+':'+String(s%60).padStart(2,'0');let iv=null,ivw=null;
function stop(){clearInterval(iv);iv=null}function stopW(){clearInterval(ivw);ivw=null}
$('go2').onclick=()=>{stop();let phase=0,left=60;$('t2').textContent=fmt(left);iv=setInterval(()=>{left--;if(left<0){if(phase===0){phase=1;left=120;$('t2l').textContent='Gapiring! 2 daqiqa.'}else{stop();$('t2l').textContent='Vaqt tugadi. Part 3 savollariga o‘ting.';return}}$('t2').textContent=fmt(left)},1000)};
$('gow').onclick=()=>{stopW();let left=2400;ivw=setInterval(()=>{left--;$('tw').textContent=fmt(Math.max(0,left));if(left<=0)stopW()},1000)};
document.querySelectorAll('[data-new]').forEach(b=>b.addEventListener('click',()=>({p1:n1,p2:n2,w2:nw})[b.dataset.new]()));n1();n2();nw();`;
  return layout({ slug: 'speaking-writing-mavzular', title: 'IELTS Speaking va Writing mavzu generatori (taymer bilan)', description: 'Tasodifiy IELTS Speaking Part 1, 2, 3 va Writing Task 2 mavzulari, haqiqiy imtihon vaqti bilan. Bepul, ro‘yxatdan o‘tishsiz.', body, script });
}

function indexPage(lang: Lang = 'uz'): string {
  const pages = lang === 'ru' ? RU_PAGES : PAGES;
  const h = lang === 'ru' ? { t: 'Бесплатные инструменты для английского и IELTS', l: 'Работают без регистрации.', d: 'Тест на уровень английского, баллы CEFR Multilevel и уровни CEFR — бесплатно.' } : { t: 'Bepul ingliz tili va IELTS vositalari', l: 'Ro‘yxatdan o‘tishsiz ishlaydigan, o‘zbek tilidagi bepul vositalar.', d: 'Ingliz tili daraja testi, IELTS band kalkulyatori, Multilevel ball hisoblash, CEFR darajalari va IELTS Speaking/Writing mavzulari — bepul, o‘zbek tilida.' };
  const body = `<h1>${h.t}</h1>
<p class="lead">${h.l}</p>
<div class="groups">${(['level', 'score', 'prep'] as const).filter((g) => pages.some((p) => p.group === g)).map((g) => `<h2>${UI[lang].groups[g]}</h2><div class="tiles">${pages.filter((p) => p.group === g).map((p) => `<a class="tile" href="${pathOf(lang, p.slug)}"><b>${esc(p.title)}</b><span>${esc(p.blurb)}</span><i>${UI[lang].open} →</i></a>`).join('')}</div>`).join('\n')}</div>`;
  return layout({ slug: '', title: h.t, description: h.d, body, lang, kind: 'page' });
}

const ML_CUT = () => UZ_MULTILEVEL.scoring.value.cutoffs.map((c) => ({ level: c.level, lo: Number(c.range.split('–')[0]), hi: Number(c.range.split('–')[1]) }));
const ML_SRC = () => `<ul class="src">${UZ_MULTILEVEL.sources.map((x) => `<li><a href="${esc(x.url)}" rel="nofollow">${esc(x.title)}</a> (${UZ_MULTILEVEL.verifiedAt})</li>`).join('')}</ul>`;

function multilevelPage(lang: Lang): string {
  const ru = lang === 'ru';
  const secName: Record<string, [string, string]> = { listening: ['Tinglab tushunish (Listening)', 'Аудирование (Listening)'], reading: ['O‘qish (Reading)', 'Чтение (Reading)'], writing: ['Yozma ish (Writing)', 'Письмо (Writing)'], speaking: ['Gapirish (Speaking)', 'Говорение (Speaking)'] };
  const items = (v: string) => (ru ? v.replace('ta topshiriq', 'заданий').replace('2 ta topshiriq: 1-topshiriq', '2 задания: 1-е').replace('2-topshiriq', '2-е').replace(/so‘z/g, 'слов').replace('3 turdagi topshiriq', '3 типа заданий') : v);
  const t = ru
    ? { h: 'Баллы CEFR Multilevel: калькулятор уровня', l: 'Введите свой балл Multilevel (0–75) — узнаете уровень (B1, B2 или C1). Ниже — пороговые баллы и формат экзамена по официальным источникам.', in: 'Ваш балл Multilevel (0–75)', cut: 'Пороговые баллы', fmt: 'Формат экзамена', sec: 'Раздел', it: 'Задания', min: 'Время (мин)', lv: 'Уровень', sc: 'Балл', src: 'Источники', below: 'ниже B1', note: 'Пороговые значения взяты из публикации UzBMB; со временем они могут измениться — проверяйте на официальном сайте.', none: 'Уровень не определён', d: 'Калькулятор баллов CEFR Multilevel (0–75): какой уровень B1, B2 или C1. Пороговые баллы и формат экзамена по официальным источникам.' }
    : { h: 'CEFR Multilevel ball hisoblash', l: 'Multilevel balingizni (0–75) kiriting — qaysi darajaga (B1, B2 yoki C1) teng ekanini ko‘rasiz. Quyida ball chegaralari va imtihon formati rasmiy manbalar asosida.', in: 'Multilevel balingiz (0–75)', cut: 'Ball chegaralari', fmt: 'Imtihon formati', sec: 'Bo‘lim', it: 'Topshiriqlar', min: 'Vaqt (daq)', lv: 'Daraja', sc: 'Ball', src: 'Manbalar', below: 'B1 dan past', note: 'Chegaralar UzBMB nashridan olingan; keyinchalik o‘zgargan bo‘lishi mumkin — rasmiy saytda tekshiring.', none: 'Daraja aniqlanmadi', d: 'CEFR Multilevel ballini (0–75) darajaga aylantiring: B1, B2 yoki C1. Ball chegaralari va imtihon formati rasmiy manbalar asosida, bepul.' };
  const cut = ML_CUT();
  const body = `<h1>${t.h}</h1>
<p class="lead">${t.l}</p>
<section class="card" aria-live="polite"><label for="mlv">${t.in}</label><input id="mlv" type="number" min="0" max="75" value="55" inputmode="numeric"><p class="big" id="lvl" style="margin:14px 0 0">–</p></section>
<h2>${t.cut}</h2>
<div class="card" style="overflow-x:auto"><table><thead><tr><th>${t.lv}</th><th>${t.sc}</th></tr></thead><tbody>
${cut.map((c) => `<tr><td><b>${c.level === 'B1 dan past' ? t.below : c.level}</b></td><td>${c.lo}–${c.hi}</td></tr>`).join('\n')}
</tbody></table></div>
<h2>${t.fmt}</h2>
<div class="card" style="overflow-x:auto"><table><thead><tr><th>${t.sec}</th><th>${t.it}</th><th>${t.min}</th></tr></thead><tbody>
${UZ_MULTILEVEL.sections.map((x) => `<tr><td>${secName[x.id]![ru ? 1 : 0]}</td><td>${esc(items(x.items.value))}</td><td>${x.minutes.value}</td></tr>`).join('\n')}
</tbody></table></div>
<p class="note">${t.note}</p>
<h2>${t.src}</h2>${ML_SRC()}`;
  const script = `const C=${json(cut.map((c) => ({ ...c, level: c.level === 'B1 dan past' ? t.below : c.level })))};const $=id=>document.getElementById(id);
function f(){const v=Math.max(0,Math.min(75,Math.round(+$('mlv').value||0)));const m=C.find(x=>v>=x.lo&&v<=x.hi);$('lvl').textContent=m?m.level:${json(t.none)}}
$('mlv').addEventListener('input',f);f();`;
  return layout({ slug: ru ? 'multilevel-bally' : 'multilevel-ball-hisoblash', title: t.h, description: t.d, body, script, lang });
}

const CEFR_DESC: Record<string, [string, string]> = {
  A1: ['Eng oddiy so‘z va iboralarni tushunasiz, o‘zingiz haqingizda qisqa gaplar tuza olasiz.', 'Понимаете простейшие слова и фразы, можете коротко рассказать о себе.'],
  A2: ['Kundalik mavzularda (oila, xarid, ish) sodda suhbat qura olasiz.', 'Можете вести простой разговор на бытовые темы (семья, покупки, работа).'],
  B1: ['Tanish mavzularda fikr bildirasiz, sayohatda o‘zingizni bemalol his qilasiz.', 'Высказываете мнение на знакомые темы, уверенно общаетесь в поездках.'],
  B2: ['Murakkab matnlarni tushunasiz, ona tilida so‘zlashuvchi bilan erkin gaplashasiz.', 'Понимаете сложные тексты, свободно общаетесь с носителями языка.'],
  C1: ['Akademik va kasbiy mavzularda aniq va moslashuvchan ifodalanasiz.', 'Точно и гибко выражаетесь на академические и профессиональные темы.'],
  C2: ['Deyarli hamma narsani oson tushunasiz, nozik ma’no farqlarini ham ifodalaysiz.', 'Легко понимаете практически всё и передаёте тонкие оттенки смысла.'],
};
function cefrLevelsPage(lang: Lang): string {
  const ru = lang === 'ru';
  const ml = (lv: string) => UZ_MULTILEVEL.scoring.value.cutoffs.find((c) => c.level === lv)?.range;
  const ie = (lv: string) => IELTS_CEFR.find((r) => r.cefr === lv)?.ielts;
  const t = ru
    ? { h: 'Уровни CEFR: от A1 до C2', l: 'CEFR — общеевропейская шкала владения языком из шести уровней. Здесь — что означает каждый уровень и как он примерно соотносится с IELTS и узбекским экзаменом Multilevel.', lv: 'Уровень', what: 'Что вы умеете', ie: 'IELTS (примерно)', ml: 'Multilevel', no: 'официального соответствия нет', noml: 'не присваивается', how: 'Как узнать свой уровень', howp: 'Пройдите бесплатный тест Sellzen: до 20 вопросов, около 3 минут, результат от A1 до C1 и план занятий.', faq: [{ q: 'Какой уровень CEFR соответствует IELTS 6.5?', a: 'По данным IELTS, баллы 5.5–6.5 соответствуют уровню B2. Это приблизительное соответствие, а не точное равенство.' }, { q: 'Какие уровни даёт экзамен Multilevel?', a: 'Экзамен CEFR Multilevel в Узбекистане присваивает уровни B1, B2 и C1 (максимальный балл — 75).' }], d: 'Уровни CEFR A1, A2, B1, B2, C1, C2: что означает каждый уровень и примерное соответствие IELTS и экзамену Multilevel.' }
    : { h: 'CEFR darajalari: A1 dan C2 gacha', l: 'CEFR — tilni bilishning olti darajali Yevropa shkalasi. Bu yerda har bir daraja nimani anglatishi va IELTS hamda O‘zbekistondagi Multilevel imtihoniga taxminan qanday mos kelishi.', lv: 'Daraja', what: 'Nimani uddalaysiz', ie: 'IELTS (taxminan)', ml: 'Multilevel', no: 'rasmiy moslik yo‘q', noml: 'berilmaydi', how: 'Darajangizni qanday aniqlash mumkin', howp: 'Sellzen’ning bepul testini topshiring: 20 tagacha savol, taxminan 3 daqiqa, A1 dan C1 gacha natija va shaxsiy reja.', faq: [{ q: 'IELTS 6.5 qaysi CEFR darajasiga to‘g‘ri keladi?', a: 'IELTS ma’lumotiga ko‘ra 5.5–6.5 ball B2 darajasiga mos keladi. Bu aynan tenglik emas, taxminiy moslik.' }, { q: 'Multilevel imtihoni qaysi darajalarni beradi?', a: 'O‘zbekistondagi CEFR Multilevel imtihoni B1, B2 va C1 darajalarini beradi (eng yuqori ball — 75).' }], d: 'CEFR darajalari A1, A2, B1, B2, C1, C2: har biri nimani anglatadi, IELTS va Multilevel imtihoniga taxminiy mosligi. O‘zbek tilida.' };
  const body = `<h1>${t.h}</h1>
<p class="lead">${t.l}</p>
<div class="card" style="overflow-x:auto"><table><thead><tr><th>${t.lv}</th><th>${t.what}</th><th>${t.ie}</th><th>${t.ml}</th></tr></thead><tbody>
${['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((lv) => `<tr><td><b>${lv}</b></td><td>${CEFR_DESC[lv]![ru ? 1 : 0]}</td><td>${ie(lv) ?? `<span class="muted">${t.no}</span>`}</td><td>${ml(lv) ?? `<span class="muted">${t.noml}</span>`}</td></tr>`).join('\n')}
</tbody></table></div>
<h2>${t.how}</h2><p>${t.howp}</p><p><a class="btn" href="/#/placement">${UI[lang].ctaB}</a></p>
<h2>FAQ</h2>${t.faq.map((f) => `<details class="card"><summary><b>${esc(f.q)}</b></summary><p>${esc(f.a)}</p></details>`).join('')}
<h2>${ru ? 'Источники' : 'Manbalar'}</h2><ul class="src"><li><a href="${IELTS_SRC.url}" rel="nofollow">${esc(IELTS_SRC.title)}</a> (2026-11-18)</li>${UZ_MULTILEVEL.sources.map((x) => `<li><a href="${esc(x.url)}" rel="nofollow">${esc(x.title)}</a> (${UZ_MULTILEVEL.verifiedAt})</li>`).join('')}</ul>`;
  return layout({ slug: ru ? 'urovni-cefr' : 'cefr-darajalari', title: t.h, description: t.d, body, lang, kind: 'page', faq: t.faq });
}

function placementLanding(lang: Lang): string {
  const ru = lang === 'ru';
  const t = ru
    ? { h: 'Тест на уровень английского — бесплатно, 3 минуты', l: 'Короткий адаптивный тест Sellzen определяет ваш уровень по шкале CEFR (A1–C1) и сразу составляет план занятий под вашу цель: IELTS, Multilevel или разговорный английский.', s: [['До 20 вопросов', 'Вопросы подстраиваются: блоки A1 → C1, переход дальше после 3 правильных из 4.'], ['≈ 3 минуты', 'Без таймера и без регистрации — результат сразу.'], ['Личный план', 'Уровень, цель по IELTS и ежедневный план уроков, игр и пробных тестов.']], faq: [{ q: 'Это официальный тест?', a: 'Нет. Это бесплатный ориентировочный тест Sellzen; он не заменяет официальные экзамены IELTS или Multilevel.' }, { q: 'Нужна регистрация?', a: 'Нет, тест проходится без регистрации. Чтобы сохранить план и прогресс, можно войти через Telegram.' }], d: 'Бесплатный тест на уровень английского: до 20 вопросов, около 3 минут, уровень от A1 до C1 по CEFR и личный план подготовки. Без регистрации.' }
    : { h: 'Ingliz tili darajasini aniqlash testi — bepul, 3 daqiqa', l: 'Sellzen’ning qisqa moslashuvchan testi CEFR shkalasi bo‘yicha darajangizni (A1–C1) aniqlaydi va darhol maqsadingizga — IELTS, Multilevel yoki so‘zlashuv ingliz tiliga — mos reja tuzadi.', s: [['20 tagacha savol', 'Savollar moslashadi: A1 → C1 bloklari, 4 tadan 3 tasiga to‘g‘ri javob bersangiz keyingisiga o‘tasiz.'], ['≈ 3 daqiqa', 'Taymersiz va ro‘yxatdan o‘tishsiz — natija darhol.'], ['Shaxsiy reja', 'Daraja, IELTS maqsadi va kunlik dars, o‘yin va mock testlar rejasi.']], faq: [{ q: 'Bu rasmiy testmi?', a: 'Yo‘q. Bu Sellzen’ning bepul, taxminiy testi; rasmiy IELTS yoki Multilevel imtihonlari o‘rnini bosmaydi.' }, { q: 'Ro‘yxatdan o‘tish kerakmi?', a: 'Yo‘q, testni ro‘yxatdan o‘tmasdan topshirasiz. Reja va progressni saqlash uchun Telegram orqali kirishingiz mumkin.' }], d: 'Bepul ingliz tili daraja testi: 20 tagacha savol, taxminan 3 daqiqa, CEFR bo‘yicha A1 dan C1 gacha natija va shaxsiy reja. Ro‘yxatdan o‘tishsiz.' };
  const body = `<h1>${t.h}</h1>
<p class="lead">${t.l}</p>
<p><a class="btn" href="/#/placement">${UI[lang].ctaB}</a></p>
<div class="grid">${t.s.map(([a, b]) => `<section class="card"><h2 style="margin-top:0">${a}</h2><p class="muted" style="margin:0">${b}</p></section>`).join('')}</div>
<h2>FAQ</h2>${t.faq.map((f) => `<details class="card"><summary><b>${esc(f.q)}</b></summary><p>${esc(f.a)}</p></details>`).join('')}`;
  return layout({ slug: ru ? 'test-urovnya-angliyskogo' : 'ingliz-tili-darajasini-aniqlash', title: t.h, description: t.d, body, lang, kind: 'page', faq: t.faq });
}

function part2ListPage(): string {
  const body = `<h1>IELTS Speaking Part 2 mavzulari (${part2Cards.length} ta kartochka)</h1>
<p class="lead">Har bir kartochka uchun 1 daqiqa tayyorgarlik va 1–2 daqiqa nutq. Ostida shu mavzu bo‘yicha Part 3 savollari. Bular Sellzen’ning o‘z mashq kartochkalari (rasmiy IELTS savollari emas).</p>
<p><a class="btn alt" href="/vositalar/speaking-writing-mavzular">Tasodifiy kartochka + taymer</a></p>
${part2Cards.map((c, i) => `<section class="card"><h2 style="margin-top:0">${i + 1}. ${esc(c.title)}</h2><ul>${c.points.map((x) => `<li>${esc(x)}</li>`).join('')}</ul><details><summary>Part 3 savollari</summary><ol>${c.part3.map((x) => `<li>${esc(x)}</li>`).join('')}</ol></details></section>`).join('\n')}`;
  return layout({ slug: 'ielts-speaking-part-2-mavzulari', title: `IELTS Speaking Part 2 mavzulari: ${part2Cards.length} ta kartochka va Part 3 savollari`, description: `IELTS Speaking Part 2 uchun ${part2Cards.length} ta mashq kartochkasi va har biriga Part 3 savollari. O‘zbek tilida tushuntirish, bepul.`, body, kind: 'page' });
}

const W2_TYPE: Record<string, string> = { agree: 'Agree / disagree (fikringiz)', discuss: 'Discuss both views (ikki fikr)', advdis: 'Advantages / disadvantages', evaluate: 'Positive or negative development (baholash)', cause: 'Causes and effects (sabab va oqibat)', problem: 'Problem / solution (muammo va yechim)', two: 'Two-part question (ikki savol)' };
function task2ListPage(): string {
  const w2 = writingPrompts.filter((w) => w.task === 2) as { prompt: string; type?: string }[];
  const groups = new Map<string, string[]>();
  for (const w of w2) { const k = w.type ?? 'other'; groups.set(k, [...(groups.get(k) ?? []), w.prompt]); }
  const body = `<h1>IELTS Writing Task 2 savollari (${w2.length} ta)</h1>
<p class="lead">Insho turi bo‘yicha guruhlangan Task 2 savollari: kamida 250 so‘z, 40 daqiqa. Bular Sellzen’ning o‘z mashq savollari (rasmiy IELTS savollari emas). Inshoingizni Sellzen’da yozib, 4 mezon bo‘yicha AI bahosini olishingiz mumkin.</p>
${[...groups].map(([k, list]) => `<section class="card"><h2 style="margin-top:0">${esc(W2_TYPE[k] ?? k)} — ${list.length} ta</h2><ol>${list.map((x) => `<li>${esc(x)}</li>`).join('')}</ol></section>`).join('\n')}`;
  return layout({ slug: 'ielts-writing-task-2-savollari', title: `IELTS Writing Task 2 savollari: ${w2.length} ta mavzu insho turlari bo‘yicha`, description: `IELTS Writing Task 2 uchun ${w2.length} ta mashq savoli: agree/disagree, discuss, advantages/disadvantages, problem/solution. Bepul, o‘zbek tilida.`, body, kind: 'page' });
}

export function generate(): Record<string, string> {
  const files: Record<string, string> = {
    'vositalar/index.html': indexPage('uz'),
    'vositalar/ingliz-tili-darajasini-aniqlash.html': placementLanding('uz'),
    'vositalar/ielts-band-kalkulyator.html': bandPage(),
    'vositalar/multilevel-ball-hisoblash.html': multilevelPage('uz'),
    'vositalar/cefr-darajalari.html': cefrLevelsPage('uz'),
    'vositalar/ielts-cefr-multilevel.html': cefrPage(),
    'vositalar/ielts-speaking-part-2-mavzulari.html': part2ListPage(),
    'vositalar/ielts-writing-task-2-savollari.html': task2ListPage(),
    'vositalar/speaking-writing-mavzular.html': topicsPage(),
    'ru/vositalar/index.html': indexPage('ru'),
    'ru/vositalar/test-urovnya-angliyskogo.html': placementLanding('ru'),
    'ru/vositalar/multilevel-bally.html': multilevelPage('ru'),
    'ru/vositalar/urovni-cefr.html': cefrLevelsPage('ru'),
    'robots.txt': `User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /r/\nSitemap: ${SITE}/sitemap.xml\n`,
  };
  // lastmod — qidiruv tizimlari yangilangan sahifalarni tezroq qayta o'qishi uchun (kontent o'zgarganda yangilang)
  const LASTMOD = '2026-11-23';
  const urls = ['/', '/vositalar/', ...PAGES.map((p) => pathOf('uz', p.slug)), '/ru/vositalar/', ...RU_PAGES.map((p) => pathOf('ru', p.slug))];
  files['sitemap.xml'] = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${SITE}${u}</loc><lastmod>${LASTMOD}</lastmod>${u === '/' ? '<changefreq>weekly</changefreq><priority>1.0</priority>' : ''}</url>`).join('\n')}\n</urlset>\n`;
  return files;
}

if (process.argv[1]?.endsWith('gen.ts')) {
  for (const [path, content] of Object.entries(generate())) { mkdirSync(join(ROOT, path, '..'), { recursive: true }); writeFileSync(join(ROOT, path), content); }
  console.log('SEO sahifalari yozildi:', Object.keys(generate()).join(', '));
}
