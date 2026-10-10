// 사활 문제 후보를 무작위로 만들고 엔진 풀이기로 걸러서 유형(먹여치기·환격 등)별로 모아요.  node scripts/sahwal-search.mjs <시도수> <시드>
import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire(import.meta.url);
const Go = require('../js/engine.js');
const N = 7, TRIES = +process.argv[2] || 3000; let seed = +process.argv[3] || 1;
const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
const out = [];
function groups(g, col) { const seen = new Set(), res = []; for (let s = 0; s < N * N; s++) { if (g.get(s) !== col || seen.has(s)) continue; const gr = g.group(s % N, (s / N) | 0); gr.stones.forEach((q) => seen.add(q)); res.push(gr); } return res; }
function classify(g, target, first) {
  const g2 = g.copy(); g2.turn = 1; const r1 = g2.play(first % N, (first / N) | 0); if (!r1) return null;
  const line = Go.solver.line(g2, target, 1, -1, 9, { maxNodes: 3e5 }); const seq = [{ s: first, c: 1, cap: r1.captured.length }];
  let c = -1; for (const s of line) { if (s < 0) return null; const r = g2.play(s % N, (s / N) | 0); if (!r) return null; seq.push({ s, c, cap: r.captured.length, tcap: g2.get(target) !== -1 }); c = -c; if (g2.get(target) !== -1) break; }
  if (g2.get(target) === -1) return null;
  const selfAtari = (() => { const g3 = g.copy(); g3.turn = 1; g3.play(first % N, (first / N) | 0); const gr = g3.group(first % N, (first / N) | 0); return gr && gr.libs.length === 1; })();
  const whiteCaptured = seq.some((q, i) => i > 0 && q.c === -1 && q.cap > 0);
  return { seq, selfAtari, whiteCaptured, len: seq.length };
}
let tried = 0, kept = 0; const dbg = { g: {} };
const nb = (x, y) => [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]].filter(([a, b]) => a >= 0 && b >= 0 && a < N && b < N);
function blob(sz) { const cells = [[rnd() < 0.5 ? 0 : 1 + ((rnd() * 2) | 0), rnd() < 0.5 ? 0 : 1 + ((rnd() * 2) | 0)]]; while (cells.length < sz) { const c = cells[(rnd() * cells.length) | 0], ns = nb(...c).filter(([a, b]) => a < 5 && b < 5 && !cells.some((q) => q[0] === a && q[1] === b)); if (!ns.length) break; cells.push(ns[(rnd() * ns.length) | 0]); } return cells; }
for (let t = 0; t < TRIES; t++) {
  const grid = Array.from({ length: N }, () => Array(N).fill('.')); const cells = blob(2 + ((rnd() * 5) | 0)); cells.forEach(([x, y]) => { grid[y][x] = 'O'; });
  const nbs = []; cells.forEach(([x, y]) => nb(x, y).forEach(([a, b]) => { if (grid[b][a] === '.' && !nbs.some((q) => q[0] === a && q[1] === b)) nbs.push([a, b]); }));
  const libTarget = 2 + ((rnd() * 2) | 0); if (nbs.length < libTarget) continue; nbs.sort(() => rnd() - 0.5);
  nbs.slice(libTarget).forEach(([a, b]) => { grid[b][a] = 'X'; });
  const extra = (rnd() * 4) | 0; for (let k = 0; k < extra; k++) { const x = (rnd() * 6) | 0, y = (rnd() * 6) | 0; if (grid[y][x] === '.') grid[y][x] = rnd() < 0.7 ? 'X' : 'O'; }
  const rows = grid.map((r) => r.join(''));
  let g; try { g = Go.Game.fromRows(rows, 'X', N); } catch (e) { continue; }
  const ws = groups(g, -1), bs = groups(g, 1); if (!ws.length || !bs.length) continue;
  ws.sort((a, b) => b.stones.length - a.stones.length); const tg = ws[0]; if (tg.stones.length < 2) continue;
  if (ws.some((w) => w.libs.length < 2) || bs.some((b) => b.libs.length < 2)) continue;
  tried++; const target = g.s ? g.s(tg.stones[0]) : tg.stones[0];
  let res; try { res = Go.solver.firstMoves(g, target, 1, 1, 11, { maxNodes: 2e5 }); } catch (e) { continue; }
  dbg.g[res.good.length] = (dbg.g[res.good.length] || 0) + 1; if (res.good.length < 1 || res.good.length > 2) continue;
  const cls = classify(g, target, res.good[0]); if (!cls || cls.len > 8) continue;
  kept++; out.push({ rows, target: [target % N, (target / N) | 0], good: res.good, selfAtari: cls.selfAtari, whiteCaptured: cls.whiteCaptured, len: cls.len, libs: tg.libs.length, size: tg.stones.length });
}
console.log(JSON.stringify(dbg), "시도", tried, '통과', kept, '먹여치기후보', out.filter((o) => o.selfAtari).length, '환격후보', out.filter((o) => o.whiteCaptured).length);
fs.writeFileSync(process.argv[4] || '/tmp/sahwal-cand.json', JSON.stringify(out));
