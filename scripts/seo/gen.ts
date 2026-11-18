// Ochiq (hisobsiz) SEO sahifalari: public/vositalar/*.html, robots.txt, sitemap.xml.
// Google topa oladigan oddiy HTML (SPA emas): matn sahifaning o'zida, hisoblash kichik ichki skript bilan.
// Ishlatish: npx tsx scripts/seo/gen.ts   (test: scripts/seo/gen.test.ts — fayllar kontent bilan mosligini tekshiradi)
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { LISTENING_TABLE, READING_ACADEMIC_TABLE, READING_GENERAL_TABLE } from '../../src/lib/band';
import { UZ_MULTILEVEL } from '../../src/content/examFormats';
import { part1Topics, part2Cards } from '../../src/content/speaking';
import { writingPrompts } from '../../src/content/writing';

export const SITE = 'https://bandly-production.up.railway.app';
const ROOT = new URL('../../public/', import.meta.url).pathname;

/** IELTS ↔ CEFR: ielts.org "IELTS and the CEFR" (2026-11-18 da o'qildi). Chegara ballar (5.0, 8.0) — oraliq holat. */
export const IELTS_CEFR = [
  { cefr: 'C2', ielts: '8.5–9.0', min: 8.5 },
  { cefr: 'C1', ielts: '7.0–8.0', min: 7 },
  { cefr: 'B2', ielts: '5.5–6.5', min: 5.5 },
  { cefr: 'B1', ielts: '4.0–5.0', min: 4 },
];
const IELTS_SRC = { title: 'IELTS and the CEFR — ielts.org', url: 'https://ielts.org/organisations/ielts-for-organisations/compare-ielts/ielts-and-the-cefr' };

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
const json = (v: unknown) => JSON.stringify(v).replace(/</g, '\\u003c');

const PAGES = [
  { slug: 'ielts-band-kalkulyator', title: 'IELTS band kalkulyatori', short: 'Band kalkulyatori' },
  { slug: 'ielts-cefr-multilevel', title: 'IELTS ↔ CEFR ↔ Multilevel', short: 'IELTS ↔ CEFR' },
  { slug: 'speaking-writing-mavzular', title: 'IELTS Speaking va Writing mavzulari', short: 'Mavzu generatori' },
] as const;

function layout(o: { slug: string; title: string; description: string; body: string; script?: string }): string {
  const url = `${SITE}/vositalar/${o.slug}`.replace(/\/$/, '');
  return `<!doctype html>
<html lang="uz">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(o.title)} — Bandly</title>
<meta name="description" content="${esc(o.description)}">
<link rel="canonical" href="${url}">
<meta property="og:title" content="${esc(o.title)}">
<meta property="og:description" content="${esc(o.description)}">
<meta property="og:type" content="website">
<meta property="og:url" content="${url}">
<link rel="icon" href="/favicon.svg">
<style>
:root{--bg:#f6f5fb;--card:#fff;--ink:#14162b;--muted:#5d6077;--line:#e5e3ef;--acc:#6c4cf5;--acc2:#ff8f6b;--ok:#1f9d61}
@media (prefers-color-scheme:dark){:root{--bg:#12131f;--card:#1c1e2e;--ink:#f1f0f8;--muted:#a3a5bc;--line:#2c2f45;--acc:#9b85ff;--acc2:#ff9f80;--ok:#4cc98e}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.55 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
header,main,footer{max-width:860px;margin:0 auto;padding:0 16px}
header{display:flex;align-items:center;justify-content:space-between;gap:12px;padding-top:18px;padding-bottom:6px;flex-wrap:wrap}
.logo{font-weight:800;font-size:20px;color:var(--ink);text-decoration:none}.logo b{color:var(--acc)}
nav{display:flex;gap:6px;flex-wrap:wrap}nav a{font-size:14px;padding:6px 10px;border-radius:99px;color:var(--ink);text-decoration:none;border:1px solid var(--line);background:var(--card)}nav a.on{background:var(--ink);color:var(--bg)}
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
.cta{background:linear-gradient(135deg,var(--acc),var(--acc2));color:#fff;border:0}.cta p{margin:6px 0 14px}.cta .btn{background:#fff;color:#14162b}
.muted{color:var(--muted)}.note{font-size:14px;color:var(--muted)}ul.src{padding-left:18px;font-size:14px}a{color:var(--acc)}
footer{padding-top:24px;padding-bottom:40px;font-size:14px;color:var(--muted)}
.timer{font-variant-numeric:tabular-nums;font-size:34px;font-weight:800}
</style>
<script type="application/ld+json">${json({ '@context': 'https://schema.org', '@type': 'WebApplication', name: o.title, url, applicationCategory: 'EducationalApplication', inLanguage: 'uz', offers: { '@type': 'Offer', price: '0', priceCurrency: 'UZS' }, publisher: { '@type': 'Organization', name: 'Bandly' } })}</script>
</head>
<body>
<header><a class="logo" href="/">Band<b>ly</b></a><nav aria-label="Vositalar">${PAGES.map((p) => `<a href="/vositalar/${p.slug}"${p.slug === o.slug ? ' class="on" aria-current="page"' : ''}>${esc(p.short)}</a>`).join('')}</nav></header>
<main>
${o.body}
<section class="card cta"><h2 style="margin-top:0">Bepul shaxsiy IELTS reja</h2><p>2 daqiqalik so‘rovnoma: maqsadingiz, darajangiz va vaqtingizga qarab kunlik reja, darslar va mock testlar.</p><a class="btn" href="/#/start">Rejani olish</a></section>
</main>
<footer>Bandly — o‘zbek tilida IELTS va ingliz tili tayyorgarligi. Bu vositalar bepul va ro‘yxatdan o‘tishsiz ishlaydi. Bandly IELTS’ning rasmiy hamkori emas; natijalar taxminiy.</footer>
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
<p class="note">Writing va Speaking’ni imtihonchi 4 mezon bo‘yicha baholaydi. Ularni o‘zingiz aniqlash qiyin — Bandly’da yozma ish va gapirish AI tomonidan shu mezonlar bo‘yicha baholanadi.</p>`;
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
<p class="note">Bu bazada ${p1.length} ta Part 1 mavzusi, ${p2.length} ta Part 2 kartochkasi va ${w2.length} ta Writing Task 2 savoli bor. Mavzular Bandly’ning o‘z mashq materiali (rasmiy IELTS savollari emas). Javobingizni Bandly’da yozib yoki aytib, AI bahosini olishingiz mumkin.</p>`;
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

function indexPage(): string {
  const body = `<h1>Bepul IELTS vositalari</h1>
<p class="lead">Ro‘yxatdan o‘tishsiz ishlaydigan, o‘zbek tilidagi bepul vositalar.</p>
${PAGES.map((p) => `<section class="card"><h2 style="margin-top:0"><a href="/vositalar/${p.slug}">${esc(p.title)}</a></h2><p class="muted" style="margin:0">${p.slug === 'ielts-band-kalkulyator' ? 'To‘g‘ri javoblar sonidan band va Overall ball, rasmiy yaxlitlash qoidasi bilan.' : p.slug === 'ielts-cefr-multilevel' ? 'IELTS balini CEFR darajasi va O‘zbekiston Multilevel ballari bilan solishtirish.' : 'Tasodifiy Speaking va Writing mavzulari, imtihon taymeri bilan.'}</p></section>`).join('\n')}`;
  return layout({ slug: '', title: 'Bepul IELTS vositalari', description: 'IELTS band kalkulyatori, IELTS ↔ CEFR ↔ Multilevel konvertori va Speaking/Writing mavzu generatori — bepul, o‘zbek tilida.', body });
}

export function generate(): Record<string, string> {
  const files: Record<string, string> = {
    'vositalar/index.html': indexPage(),
    'vositalar/ielts-band-kalkulyator.html': bandPage(),
    'vositalar/ielts-cefr-multilevel.html': cefrPage(),
    'vositalar/speaking-writing-mavzular.html': topicsPage(),
    'robots.txt': `User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: ${SITE}/sitemap.xml\n`,
  };
  const urls = ['/', '/vositalar/', ...PAGES.map((p) => `/vositalar/${p.slug}`)];
  files['sitemap.xml'] = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${SITE}${u}</loc></url>`).join('\n')}\n</urlset>\n`;
  return files;
}

if (process.argv[1]?.endsWith('gen.ts')) {
  for (const [path, content] of Object.entries(generate())) { mkdirSync(join(ROOT, path, '..'), { recursive: true }); writeFileSync(join(ROOT, path), content); }
  console.log('SEO sahifalari yozildi:', Object.keys(generate()).join(', '));
}
