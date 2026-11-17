// Kod ichidagi o'zbekcha matnlarni L() tarjima chaqiruviga o'raydi (bir martalik va takror ishlatsa bo'ladi: o'ralganlarni tegmaydi).
// Ishlatish: npx tsx scripts/i18n/codemod.ts [--check]
//   --check: hech narsa o'zgartirmaydi, o'ralmagan matn qolsa ro'yxat chiqarib, 1 bilan tugaydi (CI qo'riqchisi).
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import ts from 'typescript';
import { TEXT_ATTRS, isJsxText, isUzTemplate, isUzText } from './detect';

const ROOT = join(dirname(new URL(import.meta.url).pathname), '../..');
const SRC = join(ROOT, 'src');
const CHECK = process.argv.includes('--check');

// Ma'lumot modullari (darslar, so'zlar...) ishga tushganda deepTranslate bilan tarjima qilinadi — bu yerda o'ralmaydi.
const SKIP_DIRS = ['content', 'i18n'];
const files: string[] = [];
const walk = (d: string) => {
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    if (statSync(p).isDirectory()) { if (!SKIP_DIRS.includes(relative(SRC, p).split('/')[0]!)) walk(p); }
    else if (/\.tsx?$/.test(f) && !/\.(test|d)\.tsx?$/.test(f) && !/vite-env/.test(f)) files.push(p);
  }
};
walk(SRC);

const q = (s: string) => `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n')}'`;

function isLCall(n: ts.Node): boolean {
  const c = n.parent;
  return !!c && ts.isCallExpression(c) && ts.isIdentifier(c.expression) && (c.expression.text === 'L' || c.expression.text === 't');
}
/** Bu satr literal kod sifatida ishlatilganmi (taqqoslash, kalit, tur, import)? */
function isCodeLiteral(n: ts.Node): boolean {
  const p = n.parent;
  if (!p) return true;
  if (ts.isImportDeclaration(p) || ts.isExportDeclaration(p) || ts.isLiteralTypeNode(p) || ts.isExternalModuleReference(p)) return true;
  if ((ts.isPropertyAssignment(p) || ts.isPropertyDeclaration(p) || ts.isMethodDeclaration(p) || ts.isEnumMember(p)) && p.name === n) return true;
  if (ts.isCaseClause(p)) return true;
  if (ts.isElementAccessExpression(p) && p.argumentExpression === n) return true;
  if (ts.isBinaryExpression(p) && [ts.SyntaxKind.EqualsEqualsEqualsToken, ts.SyntaxKind.ExclamationEqualsEqualsToken, ts.SyntaxKind.EqualsEqualsToken, ts.SyntaxKind.ExclamationEqualsToken, ts.SyntaxKind.InKeyword].includes(p.operatorToken.kind)) return true;
  if (ts.isCallExpression(p) && ts.isPropertyAccessExpression(p.expression) && ['log', 'warn', 'error', 'info', 'debug', 'getItem', 'setItem', 'removeItem', 'querySelector', 'querySelectorAll', 'getElementById', 'includes', 'startsWith', 'endsWith', 'test', 'match', 'replace', 'split'].includes(p.expression.name.text)) return true;
  if (ts.isJsxAttribute(p)) return true; // atributlar alohida ko'riladi
  return isLCall(n);
}

interface Edit { start: number; end: number; text: string }
const leftovers: string[] = [];
let changedFiles = 0, wrapped = 0;

for (const file of files) {
  const code = readFileSync(file, 'utf8');
  const sf = ts.createSourceFile(file, code, ts.ScriptTarget.Latest, true, file.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const edits: Edit[] = [];
  const visit = (n: ts.Node): void => {
    // 1) JSX matn tugunlari
    if (ts.isJsxText(n)) {
      const raw = n.text;
      if (isJsxText(raw)) {
        const lead = raw.match(/^\s*/)![0], trail = raw.match(/\s*$/)![0];
        const body = raw.slice(lead.length, raw.length - trail.length).replace(/\s*\n\s*/g, ' ');
        if (/[{}<>]/.test(body)) { leftovers.push(`${relative(ROOT, file)}: ${body}`); return; }
        edits.push({ start: n.getStart(sf), end: n.getEnd(), text: `${lead}{L(${q(body)})}${trail}` });
      }
      return;
    }
    // 2) JSX atributlari: title="..." → title={L('...')}
    if (ts.isJsxAttribute(n) && n.initializer && ts.isStringLiteral(n.initializer)) {
      const name = n.name.getText(sf);
      if (TEXT_ATTRS.has(name) && isJsxText(n.initializer.text)) edits.push({ start: n.initializer.getStart(sf), end: n.initializer.getEnd(), text: `{L(${q(n.initializer.text)})}` });
      return;
    }
    // 3) Oddiy satrlar
    if ((ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) && isUzText(n.text) && !isCodeLiteral(n)) {
      edits.push({ start: n.getStart(sf), end: n.getEnd(), text: `L(${q(n.text)})` });
      return;
    }
    // 4) Shablonlar: `${a} ta dars` → L('{0} ta dars', [a])
    if (ts.isTemplateExpression(n) && !isLCall(n)) {
      const parts = [n.head.text, ...n.templateSpans.map((s) => s.literal.text)];
      const attr = n.parent && ts.isJsxExpression(n.parent) && n.parent.parent && ts.isJsxAttribute(n.parent.parent) ? n.parent.parent.name.getText(sf) : null;
      if ((attr === null || TEXT_ATTRS.has(attr)) && isUzTemplate(parts) && !(n.parent && ts.isTaggedTemplateExpression(n.parent))) {
        let src = n.head.text; const args: string[] = [];
        n.templateSpans.forEach((s, i) => { src += `{${i}}` + s.literal.text; args.push(s.expression.getText(sf)); });
        edits.push({ start: n.getStart(sf), end: n.getEnd(), text: `L(${q(src)}, [${args.join(', ')}])` });
        return; // ichidagi ifodalar o'zgarmaydi
      }
    }
    ts.forEachChild(n, visit);
  };
  visit(sf);
  if (!edits.length) continue;
  if (CHECK) { for (const e of edits) leftovers.push(`${relative(ROOT, file)}:${sf.getLineAndCharacterOfPosition(e.start).line + 1}: ${code.slice(e.start, e.end).slice(0, 90)}`); continue; }
  let out = code;
  for (const e of edits.sort((a, b) => b.start - a.start)) out = out.slice(0, e.start) + e.text + out.slice(e.end);
  // import { L } qo'shish
  if (!/import \{[^}]*\bL\b[^}]*\} from '[./]*i18n'/.test(out)) {
    const rel = relative(dirname(file), join(SRC, 'i18n')).replace(/\\/g, '/');
    const spec = rel.startsWith('.') ? rel : `./${rel}`;
    const imp = `import { L } from '${spec}';\n`;
    const m = [...out.matchAll(/^import [^;]+;\n/gm)].pop();
    out = m ? out.slice(0, m.index! + m[0].length) + imp + out.slice(m.index! + m[0].length) : imp + out;
  }
  writeFileSync(file, out);
  changedFiles++; wrapped += edits.length;
}

if (CHECK) {
  if (leftovers.length) { console.error(`O'ralmagan matnlar (${leftovers.length}):\n` + leftovers.join('\n')); process.exit(1); }
  console.log('i18n guard: OK — barcha matnlar L() orqali');
} else {
  console.log(`codemod: ${changedFiles} fayl, ${wrapped} ta matn o‘raldi`);
  if (leftovers.length) console.log('Qo‘lda ko‘rish kerak:\n' + leftovers.join('\n'));
}
