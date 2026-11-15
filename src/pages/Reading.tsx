import { Highlighter, Eraser } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { MockTest, type ExamLeftState } from '../components/MockTest';
import type { ReadingTest } from '../content/types';
import { READING_ACADEMIC_TABLE } from '../lib/band';
import { addHighlight, segments, type HighlightRange } from '../lib/examAttempt';

/** Tanlangan matnni paragraf bo'yicha belgilar oralig'iga aylantiradi. */
function selectionRanges(root: HTMLElement, range: Range): HighlightRange[] {
  const paras = Array.from(root.querySelectorAll<HTMLElement>('[data-p]'));
  const out: HighlightRange[] = [];
  for (const el of paras) {
    if (!range.intersectsNode(el)) continue;
    const p = Number(el.dataset.p);
    const full = el.textContent ?? '';
    const pre = document.createRange();
    pre.selectNodeContents(el);
    let start = 0;
    let end = full.length;
    if (el.contains(range.startContainer)) { pre.setEnd(range.startContainer, range.startOffset); start = pre.toString().length; }
    if (el.contains(range.endContainer)) { const pe = document.createRange(); pe.selectNodeContents(el); pe.setEnd(range.endContainer, range.endOffset); end = pe.toString().length; }
    if (end > start) out.push({ p, start, end });
  }
  return out;
}

function Passage({ t, state }: { t: ReadingTest; state: ExamLeftState }) {
  const root = useRef<HTMLDivElement | null>(null);
  const last = useRef<Range | null>(null);
  const [hasSel, setHasSel] = useState(false);
  const canMark = state.started && !state.submitted && state.attempt !== null;
  const highlights = state.attempt?.highlights ?? [];

  // Mobil qurilmalarda tugma bosilganda tanlov yo'qolishi mumkin — oxirgi tanlovni eslab qolamiz.
  useEffect(() => {
    if (!canMark) return;
    const on = () => {
      const s = window.getSelection();
      if (s && s.rangeCount && !s.isCollapsed && root.current?.contains(s.getRangeAt(0).commonAncestorContainer)) { last.current = s.getRangeAt(0).cloneRange(); setHasSel(true); }
    };
    document.addEventListener('selectionchange', on);
    return () => document.removeEventListener('selectionchange', on);
  }, [canMark]);

  const mark = () => {
    if (!root.current || !last.current) return;
    const rs = selectionRanges(root.current, last.current);
    state.update((a) => ({ ...a, highlights: rs.reduce((acc, r) => addHighlight(acc, r), a.highlights) }));
    window.getSelection()?.removeAllRanges();
    last.current = null; setHasSel(false);
  };
  const clear = () => state.update((a) => ({ ...a, highlights: [] }));

  return (
    <div className="passage">
      {canMark && (
        <div className="row hl-tools" role="toolbar" aria-label="Matnni bo‘yash">
          <button type="button" className="btn sm" onPointerDown={(e) => e.preventDefault()} onClick={mark} disabled={!hasSel}><Highlighter size={15} /> Tanlanganni bo‘yash</button>
          {highlights.length > 0 && <button type="button" className="btn sm" onClick={clear}><Eraser size={15} /> Tozalash</button>}
          <span className="muted" style={{ fontSize: 13 }}>Matnni belgilang, so‘ng “bo‘yash”ni bosing.</span>
        </div>
      )}
      <div ref={root}>
        <h3>{t.passageTitle}</h3>
        {t.paragraphs.map((p, i) => (
          <p key={p.slice(0, 24)} data-p={i}>
            {segments(p, highlights, i).map((s, j) => (s.hl ? <mark key={j} className="hl">{s.text}</mark> : <span key={j}>{s.text}</span>))}
          </p>
        ))}
      </div>
    </div>
  );
}

export default function Reading({ test: t }: { test: ReadingTest }) {
  return (
    <MockTest
      key={t.id}
      kind="reading"
      testId={t.id}
      title={t.title}
      level={t.level}
      minutes={t.minutes}
      groups={t.groups}
      questions={t.questions}
      table={READING_ACADEMIC_TABLE}
      intro={<p>Bitta matn va {t.questions.length} ta savol. Vaqt tugagach test avtomatik yakunlanadi. Matn original mashq materiali.</p>}
      left={(state) => <Passage t={t} state={state} />}
    />
  );
}
