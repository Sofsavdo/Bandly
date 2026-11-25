// Sellzen yuz ifodalari ko'rgazmasi (dev uchun): har holat/hissiyot → bitta HTML sahifa. Ishlatish: npx tsx scripts/build/facePreview.tsx <chiqish.html>
import { writeFileSync, readFileSync } from 'node:fs';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AiAvatar, type AiPhase } from '../../src/components/AiAvatar';
import type { CoachEmotion } from '../../src/content/personas';

const cases: [string, AiPhase, CoachEmotion, number, number][] = [
  ['Navbat sizda', 'idle', 'neutral', 0, 0], ['Tinglayapti', 'listening', 'neutral', 0.5, 0], ["O'ylayapti", 'thinking', 'neutral', 0, 0],
  ['Gapiryapti', 'speaking', 'neutral', 0.6, 0], ['Quvonch', 'speaking', 'happy', 0.6, 0], ['Kulgi', 'speaking', 'laugh', 0.6, 0],
  ['Jahl', 'speaking', 'angry', 0.6, 0], ['Qoyil (maqtov)', 'speaking', 'impressed', 0.5, 0], ['Hafsala', 'speaking', 'disappointed', 0.5, 0],
  ['Jiddiy', 'speaking', 'serious', 0.5, 0], ['Kinoya', 'speaking', 'sarcastic', 0.5, 0], ['Qattiq xarakter, tinch', 'idle', 'neutral', 0, 2],
];
const css = readFileSync('src/design3.css', 'utf8');
const cells = cases.map(([t, ph, e, l, lk]) => `<figure>${renderToStaticMarkup(h(AiAvatar, { phase: ph, emotion: e, level: l, size: 150, look: lk }))}<figcaption>${t}</figcaption></figure>`).join('');
writeFileSync(process.argv[2] ?? 'face.html', `<!doctype html><meta charset="utf-8"><style>${css}
:root{--surface:#fff} body{margin:0;background:#f6f7fb;font:600 14px system-ui} .grid{display:grid;grid-template-columns:repeat(4,190px);gap:18px;padding:24px} figure{margin:0;display:grid;justify-items:center;gap:8px;background:#fff;border-radius:16px;padding:16px 8px}</style><div class="grid">${cells}</div>`);
