// 참집(진짜 눈)·옥집(가짜 눈) 문제 후보: 규칙(대각선 판정)으로 눈 종류를 정하고, 엔진 풀이기 결과와 어긋나는 모양은 버려요.
// node scripts/sahwal-eyes.mjs <시도수> <시드> <출력.json>
import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire(import.meta.url);
const Go = require('../js/engine.js');
const N = 7, TRIES = +process.argv[2] || 3000; let seed = +process.argv[3] || 1;
const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
const nb4 = (x, y) => [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]].filter(([a, b]) => a >= 0 && b >= 0 && a < N && b < N);
const dg4 = (x, y) => [[x + 1, y + 1], [x - 1, y + 1], [x + 1, y - 1], [x - 1, y - 1]];
const inb = (a, b) => a >= 0 && b >= 0 && a < N && b < N;
function eyeKind(g, x, y) {   // 흑에게 둘러싸이지 않은 백의 빈 점이 참집인지: 대각선에 흑 돌이 (변·귀: 1개, 중앙: 2개) 이상이면 옥집
  const dgs = dg4(x, y).filter(([a, b]) => inb(a, b)), onEdge = dgs.length < 4, bl = dgs.filter(([a, b]) => g.get(b * N + a) === 1).length;
  return bl >= (onEdge ? 1 : 2) ? 'false' : 'real';
}
const out = [], seen = new Set(); let tried = 0;
for (let t = 0; t < TRIES; t++) {
  const rw = 4 + ((rnd() * 2) | 0), rh = 3 + ((rnd() * 2) | 0), grid = Array.from({ length: N }, (_, y) => Array.from({ length: N }, (_, x) => (x < rw && y < rh ? 'O' : (x <= rw && y <= rh ? 'X' : '.'))));
  const cells = []; for (let y = 0; y < rh; y++) for (let x = 0; x < rw; x++) cells.push([x, y]);
  const pickC = () => cells[(rnd() * cells.length) | 0];
  const mode = rnd() < 0.2 ? 'real' : rnd() < 0.5 ? 'edge' : 'int';   // 참집 둘 / 변의 옥집 / 중앙의 옥집
  let e1, e2 = pickC();
  if (mode === 'edge') { e1 = [rw - 2, 0]; grid[1][rw - 1] = 'X'; }
  else if (mode === 'int') { const y = 1 + ((rnd() * (rh - 2)) | 0); e1 = [rw - 2, y]; grid[y - 1][rw - 1] = 'X'; grid[y + 1][rw - 1] = 'X'; }
  else e1 = pickC();
  if (Math.abs(e1[0] - e2[0]) + Math.abs(e1[1] - e2[1]) < 3) continue;
  const eyes = [e1, e2]; if (eyes.some(([x, y]) => grid[y][x] !== 'O')) continue; eyes.forEach(([x, y]) => { grid[y][x] = '.'; });
  const rows = grid.map((r) => r.join(''));
  let g; try { g = Go.Game.fromRows(rows, 'X', N); } catch (e) { continue; }
  // 눈 후보 조건: 위·아래·좌·우가 모두 백이거나 판 끝
  if (!eyes.every(([x, y]) => nb4(x, y).every(([a, b]) => g.get(b * N + a) === -1))) continue;
  // 모든 돌이 숨 쉬고 있어야 함
  let dead = false; for (let q = 0; q < N * N; q++) { const c = g.get(q); if (!c) continue; if (g.group(q % N, (q / N) | 0).libs.length < 1) { dead = true; break; } } if (dead) continue;
  const kinds = eyes.map(([x, y]) => eyeKind(g, x, y)); let target = -1, best = 0; for (let q = 0; q < N * N; q++) { if (g.get(q) !== -1) continue; const gg = g.group(q % N, (q / N) | 0); if (gg.stones.length > best) { best = gg.stones.length; target = q; } } if (target < 0) continue;
  const grp = g.group(target % N, (target / N) | 0); if (eyes.some(([x, y]) => !nb4(x, y).some(([a, b]) => grp.stones.includes(b * N + a)))) continue;
  tried++; let killable; try { killable = Go.solver.canKill(g, target, 1, 15, { maxNodes: 4e5 }, 1); } catch (e) { continue; } if (killable === null) continue;
  const nReal = kinds.filter((k) => k === 'real').length;
  if (nReal === 2 && killable) continue; if (nReal < 2 && !killable) continue;   // 규칙과 풀이기가 어긋나면 버림
  const key = rows.join('/'); if (seen.has(key)) continue; seen.add(key);
  out.push({ rows, target: [target % N, (target / N) | 0], eyes, kinds, killable });
}
console.log('시도', tried, '통과', out.length, '둘다참', out.filter((o) => !o.killable).length, '참+옥', out.filter((o) => o.kinds.includes('false') && o.kinds.includes('real')).length, '옥+옥', out.filter((o) => o.kinds.every((k) => k === 'false')).length);
fs.writeFileSync(process.argv[4] || '/tmp/eyes.json', JSON.stringify(out));
