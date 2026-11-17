// Tarjima katalogi: L('...') chaqiruvlari, nav kalitlari, dars kontenti va server xabarlari → src/i18n/catalog.json
// Ishlatish: npx tsx scripts/i18n/extract.ts [--check]  (--check: katalog eskirgan bo'lsa 1 bilan tugaydi)
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import ts from 'typescript';
import { isUzContent, isUzText } from './detect';
import { englishOnly } from './english';
import { uz } from '../../src/i18n/uz';

const ROOT = join(dirname(new URL(import.meta.url).pathname), '../..');
const OUT = join(ROOT, 'src/i18n/catalog.json');
const set = new Set<string>();
// Faqat inglizcha (yoki brend) matn tarjima qilinmaydi: Grammar, Mock Arena, Reading, Beginner — barcha tillarda o'zgarmaydi
const add = (s: string) => { const t = s.replace(/\s+/g, ' ').trim(); if (t.length >= 2 && !englishOnly(t)) set.add(t); };

const walk = (d: string, out: string[], skip: (p: string) => boolean) => { for (const f of readdirSync(d)) { const p = join(d, f); if (skip(p)) continue; if (statSync(p).isDirectory()) walk(p, out, skip); else if (/\.tsx?$/.test(f) && !/\.(test|d)\.tsx?$/.test(f)) out.push(p); } };

// 1) Interfeys: L('...') va t('kalit')
const ui: string[] = []; walk(join(ROOT, 'src'), ui, (p) => p.includes('/content/') || p.endsWith('/i18n'));
for (const f of ui) {
  const sf = ts.createSourceFile(f, readFileSync(f, 'utf8'), ts.ScriptTarget.Latest, true, f.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const v = (n: ts.Node): void => {
    if (ts.isCallExpression(n) && ts.isIdentifier(n.expression) && n.expression.text === 'L' && n.arguments[0] && (ts.isStringLiteral(n.arguments[0]) || ts.isNoSubstitutionTemplateLiteral(n.arguments[0]))) add(n.arguments[0].text);
    ts.forEachChild(n, v);
  };
  v(sf);
}
for (const s of Object.values(uz)) add(s);

// 2) Dars kontenti (ilova ishga tushganda deepTranslate qiladigan modullar bilan bir xil ro'yxat)
const MODS = ['lessons', 'vocab', 'roasts', 'writingGuide', 'mockTests', 'curriculum/inventory', 'curriculum/pilot', 'mockShared', 'speakingModels', 'speakingEasy', 'speaking', 'scenes', 'practice', 'placement', 'grammar', 'writing', 'tips', 'skillCheck', 'personas', 'listeningTests', 'readingTests', 'examFormats', 'lines', 'vocabWriting', 'satPractice'];
const seen = new WeakSet<object>();
const deep = (v: unknown, key = ''): void => {
  if (typeof v === 'string') { if (isUzContent(key, v)) add(v); return; }
  if (!v || typeof v !== 'object' || seen.has(v as object)) return;
  seen.add(v as object);
  if (Array.isArray(v)) v.forEach((x) => deep(x, key)); else for (const [k, x] of Object.entries(v as Record<string, unknown>)) deep(x, k);
};
for (const m of MODS) { const mod = await import(join(ROOT, 'src/content', m)); for (const [k, v] of Object.entries(mod)) deep(v, k); }

// 3) Server xabarlari (xatolar, bot matnlari): `${x}` → {0}
const srv: string[] = []; walk(join(ROOT, 'server'), srv, () => false);
for (const f of srv) {
  const sf = ts.createSourceFile(f, readFileSync(f, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const v = (n: ts.Node): void => {
    if ((ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) && isUzText(n.text) && !/^(You|Text|Reply|Output|Keep|Level|Unit|The |This )/.test(n.text)) add(n.text);
    else if (ts.isTemplateExpression(n)) { let s = n.head.text; n.templateSpans.forEach((sp, i) => { s += `{${i}}` + sp.literal.text; }); if (isUzText(s) && !/[<>]|\b(You|learner|JSON)\b/.test(s)) add(s); return; }
    ts.forEachChild(n, v);
  };
  v(sf);
}

const list = [...set].sort();
const json = JSON.stringify(list, null, 0).replace(/","/g, '",\n"') + '\n';
if (process.argv.includes('--check')) {
  const old = (() => { try { return readFileSync(OUT, 'utf8'); } catch { return ''; } })();
  if (old !== json) { console.error('src/i18n/catalog.json eskirgan: npx tsx scripts/i18n/extract.ts'); process.exit(1); }
  console.log(`i18n catalog: OK (${list.length})`);
} else { writeFileSync(OUT, json); console.log(`catalog: ${list.length} ta matn → src/i18n/catalog.json`); }
