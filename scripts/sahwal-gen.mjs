// 바둑 "사활 기초" 문제 만들기: 눈 모양(3~6칸)을 모두 만들어 보고, 엔진 풀이기로 "잡는 급소"와 "사는 급소"가
// 궁도 사활 수업(lessons-sahwal.js)용 후보를 만들고 엔진 풀이기로 검증해서 sahwal-all.json 에 저장해요(오래 걸려요).  node scripts/sahwal-gen.mjs
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'js');
const Go = require(path.join(dir, 'engine.js'));
globalThis.OKS_GO_SOLVED = undefined;
const L = require(path.join(dir, 'lessons.js'));
const norm = (c) => { const mx = Math.min(...c.map((p) => p[0])), my = Math.min(...c.map((p) => p[1])); return c.map((p) => [p[0] - mx, p[1] - my]).sort((a, b) => a[1] - b[1] || a[0] - b[0]); };
const variants = (c) => { const out = []; let cur = c; for (let r = 0; r < 4; r++) { cur = cur.map((p) => [p[1], -p[0]]); out.push(norm(cur)); out.push(norm(cur.map((p) => [-p[0], p[1]]))); } return out; };
const key = (c) => c.map((p) => p.join(',')).join(';'), canon = (c) => variants(c).map(key).sort()[0];
let level = [norm([[0, 0]])]; const bySize = { 1: level };
for (let sz = 2; sz <= 6; sz++) { const seen = new Map(); for (const c of level) for (const p of c) for (const d of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const q = [p[0] + d[0], p[1] + d[1]]; if (c.some((r) => r[0] === q[0] && r[1] === q[1])) continue; const nc = norm(c.concat([q])); const k = canon(nc); if (!seen.has(k)) seen.set(k, nc); } level = [...seen.values()]; bySize[sz] = level; }
const N = 7, rowsOut = [];
function cls(g, target, first) {
  const g2 = g.copy(); g2.turn = 1; const r1 = g2.play(first % N, (first / N) | 0); if (!r1) return null;
  const sa = (() => { const gr = g2.group(first % N, (first / N) | 0); return gr && gr.libs.length === 1; })();
  const line = Go.solver.line(g2, target, 1, -1, 9, { maxNodes: 3e5 }); let c = -1, wc = false, n = 1;
  for (const s of line) { if (s < 0) break; const r = g2.play(s % N, (s / N) | 0); if (!r) break; n++; if (c === -1 && r.captured.length > 0) wc = true; c = -c; if (g2.get(target) !== -1) break; }
  return { sa, wc, n };
}
for (let sz = 3; sz <= 6; sz++) for (const c of bySize[sz]) for (const [ox, oy] of [[0, 0], [1, 0], [0, 1], [1, 1], [2, 0], [2, 1]]) {
  const w = Math.max(...c.map((p) => p[0])) + 1, h = Math.max(...c.map((p) => p[1])) + 1; if (w + ox > 5 || h + oy > 5) continue;
  const rows = L.shape(N, c, ox, oy); let tS = -1; for (let s = 0; s < N * N; s++) if (rows[(s / N) | 0][s % N] === 'O') { tS = s; break; } if (tS < 0) continue;
  const gk = Go.Game.fromRows(rows, 'X', N), gl = Go.Game.fromRows(rows, 'O', N);
  let k, l; try { k = Go.solver.firstMoves(gk, tS, 1, 1, 13, { maxNodes: 3e5 }); l = Go.solver.firstMoves(gl, tS, 1, -1, 13, { maxNodes: 3e5 }); } catch (e) { continue; }
  const o = { sz, ox, oy, key: key(c), rows, target: [tS % N, (tS / N) | 0], killGood: k.good, liveGood: l.good, killable: k.good.length > 0, corner: ox === 0 && oy === 0 };
  if (k.good.length >= 1 && k.good.length <= 2) { const cc = cls(gk, tS, k.good[0]); if (cc) { o.sa = cc.sa; o.wc = cc.wc; o.n = cc.n; } }
  rowsOut.push(o);
}
fs.writeFileSync('scripts/sahwal-all.json', JSON.stringify(rowsOut));
const cnt = (f) => rowsOut.filter(f).length;
console.log('total', rowsOut.length, 'killable', cnt((o) => o.killable), 'alive-after-X-first', cnt((o) => !o.killable), 'corner', cnt((o) => o.corner), 'selfAtari', cnt((o) => o.sa), 'snapback', cnt((o) => o.wc));
