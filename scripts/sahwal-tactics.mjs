// 먹여치기·환격 후보 찾기: 바깥이 흑 벽으로 막힌 작은 구역에 돌을 무작위로 놓고, 엔진 풀이기로 "흑이 먼저 두어 잡는 수"가 하나뿐인 모양만 모아요.
// node scripts/sahwal-tactics.mjs <시도수> <시드> <출력.json>
import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire(import.meta.url);
const Go = require('../js/engine.js');
const N = 7, TRIES = +process.argv[2] || 20000; let seed = +process.argv[3] || 1;
const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
const RW = 5, RH = 4;
const out = [], seen = new Set();
function groups(g, col) { const s = new Set(), res = []; for (let q = 0; q < N * N; q++) { if (g.get(q) !== col || s.has(q)) continue; const gr = g.group(q % N, (q / N) | 0); gr.stones.forEach((z) => s.add(z)); res.push(gr); } return res; }
function analyze(g, target, first) {
  const g2 = g.copy(); g2.turn = 1; const r1 = g2.play(first % N, (first / N) | 0); if (!r1) return null;
  const sa = (() => { const gr = g2.group(first % N, (first / N) | 0); return !!gr && gr.libs.length === 1; })();
  const line = Go.solver.line(g2, target, 1, -1, 9, { maxNodes: 2e5 }); let c = -1, snap = false, n = 1, firstCap = 0, caps = [];
  for (const s of line) { if (s < 0) return null; const r = g2.play(s % N, (s / N) | 0); if (!r) return null; n++; if (c === -1 && r.captured.length > 0) { snap = true; } caps.push([c, r.captured.length]); c = -c; if (g2.get(target) !== -1) break; }
  if (g2.get(target) === -1) return null;
  return { sa, snap, n, caps };
}
let tried = 0;
for (let t = 0; t < TRIES; t++) {
  const rw = 4 + ((rnd() * 2) | 0), rh = 3 + ((rnd() * 2) | 0), grid = Array.from({ length: N }, (_, y) => Array.from({ length: N }, (_, x) => (x < rw && y < rh ? 'O' : (x <= rw && y <= rh ? 'X' : '.'))));
  const cells = []; for (let y = 0; y < rh; y++) for (let x = 0; x < rw; x++) cells.push([x, y]);
  const ne = 2 + ((rnd() * 4) | 0); const start = cells[(rnd() * cells.length) | 0], E = [start];
  while (E.length < ne) { const c = E[(rnd() * E.length) | 0], ds = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([a, b]) => [c[0] + a, c[1] + b]).filter(([a, b]) => a >= 0 && b >= 0 && a < rw && b < rh && !E.some((q) => q[0] === a && q[1] === b)); if (!ds.length) break; E.push(ds[(rnd() * ds.length) | 0]); }
  if (E.length < 2) continue; E.forEach(([x, y]) => { grid[y][x] = '.'; });
  const intr = (rnd() * 3) | 0; for (let k = 0; k < intr; k++) { const c = cells[(rnd() * cells.length) | 0]; if (grid[c[1]][c[0]] === 'O') grid[c[1]][c[0]] = 'X'; }
  const rows = grid.map((r) => r.join(''));
  let g; try { g = Go.Game.fromRows(rows, 'X', N); } catch (e) { continue; }
  const ws = groups(g, -1), bs = groups(g, 1); if (ws.length !== 1) continue; const tg = ws[0]; if (tg.stones.length < 4) continue;
  if (tg.libs.length < 2 || bs.some((b) => b.libs.length < 1)) continue;
  tried++; const target = tg.stones[0];
  let res; try { res = Go.solver.firstMoves(g, target, 1, 1, 11, { maxNodes: 8e4 }); } catch (e) { continue; }
  if (res.good.length !== 1) continue;
  const a = analyze(g, target, res.good[0]); if (!a || a.n > 8) continue;
  const key = rows.join('/'); if (seen.has(key)) continue; seen.add(key);
  out.push({ rows, target: [target % N, (target / N) | 0], first: res.good[0], sa: a.sa, snap: a.snap, n: a.n, caps: a.caps, empties: E.length, intr });
}
console.log('시도', tried, '통과', out.length, '먹여치기후보', out.filter((o) => o.sa).length, '환격후보', out.filter((o) => o.snap).length);
fs.writeFileSync(process.argv[4] || '/tmp/tactics.json', JSON.stringify(out));
