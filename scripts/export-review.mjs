// 강의 본문 전체를 CSV로 뽑아 전문가 검수에 쓸 수 있게 합니다. 사용: node scripts/export-review.mjs > review.csv
import { createRequire } from 'module'; import path from 'path'; import { fileURLToPath } from 'url';
const require = createRequire(import.meta.url), dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../js');
globalThis.window = globalThis;
for (const f of ['engine.js', 'lessons-solved.js', 'lessons.js', 'lessons-l1.js', 'lessons-l2.js', 'lessons-l3.js', 'lessons-l4.js', 'lessons-prac.js', 'lessons-problems.js', 'lessons-life.js', 'lessons-joseki.js', 'lessons-eval.js', 'strategy.js', 'lessons-strategy.js', 'lessons-strategy2.js', 'lessons-lecture.js', 'curriculum.js']) require(path.join(dir, f));
const L = globalThis.OKS_GO_LESSONS, C = globalThis.OKS_GO_CURR, q = (v) => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
const out = [['장', '강 ID', '강 제목', '구분', '쪽/문항', '내용', '검수 의견'].map(q).join(',')];
C.CHAPTERS.forEach((c) => C.lessonsOf(c).forEach((l) => {
  if (/^r\d+$/.test(l.id)) return;
  if (l.goal) out.push([c.title, l.id, l.title, '학습 목표', '', l.goal, ''].map(q).join(','));
  l.pages.forEach((p, i) => out.push([c.title, l.id, l.title, '설명', i + 1, p.text, ''].map(q).join(',')));
  l.items.forEach((it, i) => out.push([c.title, l.id, l.title, '문제', i + 1, (it.prompt || '') + ' / 해설: ' + (it.explain || ''), ''].map(q).join(',')));
  if (l.done) out.push([c.title, l.id, l.title, '요약', '', l.done, ''].map(q).join(','));
}));
console.log('﻿' + out.join('\n'));
