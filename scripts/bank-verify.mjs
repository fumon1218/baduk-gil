// 문제 은행 만들기 ① — 받은 SGF 문제(따내기·연결·2수 따내기)를 우리 규칙 엔진으로 처음부터 다시 풀어서 정답 자리를 확인해요.
// 사용: node scripts/bank-verify.mjs <SGF 루트(sgf 폴더의 부모)> <출력 json> [종류 cap|con|rd] [시작] [끝]
// - 따내기(cap): 한 수로 백돌을 따낼 수 있는 흑의 모든 자리가 정답.
// - 연결(con): 둔 뒤 A·B 두 돌이 한 덩어리가 되는 모든 자리가 정답.
// - 2수 따내기(rd): 흑이 먼저 두고, 백이 어떤 합법적인 수(패스 포함)로 받아도 다음 흑 한 수로 처음의 백돌을 모두 잡을 수 있는 모든 첫 수가 정답.
// 받은 자료가 말하는 정답이 엔진 결과에 없으면 그 문제는 빼요(이유를 남겨요).
import fs from 'node:fs'; import path from 'node:path'; import { createRequire } from 'node:module'; import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url); globalThis.window = globalThis;
const here = path.dirname(fileURLToPath(import.meta.url)); const E = require(path.join(here, '..', 'js', 'engine.js'));
const [root, outFile, kindArg, a0, a1] = process.argv.slice(2); if (!root || !outFile) { console.error('사용: node scripts/bank-verify.mjs <루트> <출력.json> [cap|con|rd] [시작] [끝]'); process.exit(1); }

/* 아주 작은 SGF 트리 읽기: 노드 {p:{키:[값…]}, ch:[노드…]} */
function parseSgf(t) {
  let i = 0;
  function node() { const nd = { p: {}, ch: [] }; i++; // ';'
    for (;;) { while (/\s/.test(t[i] || '')) i++; if (!/[A-Z]/.test(t[i] || '')) break; let k = ''; while (/[A-Z]/.test(t[i])) k += t[i++]; const vals = []; while (true) { while (/\s/.test(t[i] || '')) i++; if (t[i] !== '[') break; i++; let v = ''; while (i < t.length && t[i] !== ']') { if (t[i] === '\\') i++; v += t[i++]; } i++; vals.push(v); } nd.p[k] = (nd.p[k] || []).concat(vals); }
    return nd; }
  function seq() { // '(' 다음부터 ')' 까지
    let first = null, last = null;
    while (i < t.length && t[i] !== ')') {
      while (/\s/.test(t[i] || '')) i++;
      if (t[i] === ';') { const nd = node(); if (last) last.ch.push(nd); else first = nd; last = nd; }
      else if (t[i] === '(') { i++; const sub = seq(); i++; if (last && sub) last.ch.push(sub); }
      else i++;
    }
    return first;
  }
  while (t[i] !== '(') i++; i++; const r = seq(); return r;
}
const pt = (s) => (s && s.length >= 2 ? [s.charCodeAt(0) - 97, s.charCodeAt(1) - 97] : null);

function setupOf(root) {
  const n = +root.p.SZ[0]; const rows = []; for (let y = 0; y < n; y++) rows.push(new Array(n).fill('.'));
  (root.p.AB || []).forEach((v) => { const q = pt(v); rows[q[1]][q[0]] = 'X'; }); (root.p.AW || []).forEach((v) => { const q = pt(v); rows[q[1]][q[0]] = 'O'; });
  return { n, rows: rows.map((r) => r.join('')) };
}
const canon = (rows, labels) => { // 8방향 뒤집기·돌려도 같은 문제를 찾기 위한 대표 모양
  const n = rows.length, out = [];
  for (let k = 0; k < 8; k++) { const g = rows.map((r) => r.split('')), h = g.map((r) => r.slice()); const lab = {};
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) { let a = x, b = y; if (k & 1) a = n - 1 - a; if (k & 2) b = n - 1 - b; if (k & 4) [a, b] = [b, a]; h[b][a] = g[y][x]; (labels || []).forEach((l) => { if (l[0] === x && l[1] === y) lab[l[2]] = [a, b]; }); }
    out.push(h.map((r) => r.join('')).join('/') + (labels ? '|' + ['A', 'B'].map((t) => lab[t]).join(';') : '')); }
  return out.sort()[0];
};

const legalMoves = (g, c) => { const out = []; for (let s = 0; s < g.n * g.n; s++) { if (g.get(s)) continue; if (g.legal(s % g.n, (s / g.n) | 0, c)) out.push(s); } return out; };

function solveCap(sp) {
  const g = E.Game.fromRows(sp.rows, 'X', sp.n), ans = [], counts = {};
  legalMoves(g, 1).forEach((s) => { const r = g.play(s % sp.n, (s / sp.n) | 0); if (r && r.captured.length) { ans.push(s); counts[s] = r.captured.length; } if (r) g.undo(); });
  return { ans, counts };
}
function solveCon(sp, A, B) {
  const g = E.Game.fromRows(sp.rows, 'X', sp.n), ans = [], sB = B[1] * sp.n + B[0];
  legalMoves(g, 1).forEach((s) => { const r = g.play(s % sp.n, (s / sp.n) | 0); if (r) { const gr = g.group(A[0], A[1]); if (gr && gr.stones.indexOf(sB) >= 0) ans.push(s); g.undo(); } });
  return { ans };
}
function solveRd(sp) {
  const n = sp.n, g = E.Game.fromRows(sp.rows, 'X', n), W0 = []; for (let s = 0; s < n * n; s++) if (g.get(s) < 0) W0.push(s);
  const allGone = () => W0.every((s) => g.get(s) >= 0);
  const canFinish = () => { // 흑 차례: 한 수로 W0 를 모두 잡을 수 있나
    if (allGone()) return true;
    for (let s = 0; s < n * n; s++) { if (g.get(s)) continue; const r = g.play(s % n, (s / n) | 0); if (!r) continue; const ok = allGone(); g.undo(); if (ok) return true; }
    return false; };
  const ans = [], immediate = [];
  for (let s = 0; s < n * n; s++) {
    if (g.get(s)) continue; const r = g.play(s % n, (s / n) | 0); if (!r) continue;
    if (allGone()) { immediate.push(s); g.undo(); continue; }
    let forced = true;
    // 백의 응수: 모든 합법적인 수 + 패스
    const rs = []; for (let q = 0; q < n * n; q++) { if (g.get(q)) continue; if (g.legal(q % n, (q / n) | 0, -1)) rs.push(q); }
    // 흑 b1 뒤 차례는 백이라 g.turn 이 -1
    const w0 = g.pass(); const passOk = canFinish(); g.undo(); void w0; if (!passOk) forced = false;
    for (let j = 0; forced && j < rs.length; j++) { const q = rs[j], r2 = g.play(q % n, (q / n) | 0); if (!r2) continue; const ok = canFinish(); g.undo(); if (!ok) forced = false; }
    g.undo(); if (forced) ans.push(s);
  }
  return { ans, immediate, W0 };
}

const files = (dir) => fs.readdirSync(path.join(root, 'sgf', dir)).filter((f) => f.endsWith('.sgf')).sort().map((f) => path.join(root, 'sgf', dir, f));
const kinds = kindArg ? [kindArg] : ['cap', 'con', 'rd'];
const results = []; const rep = { drop: {}, ok: 0 };
const drop = (id, why) => { (rep.drop[why] = rep.drop[why] || []).push(id); };
const t0 = Date.now();
for (const kd of kinds) {
  let list = kd === 'rd' ? files('02_reading') : files('01_beginner');
  list = list.filter((f) => { const nm = path.basename(f); const gn = fs.readFileSync(f, 'utf8'); const isCon = /돌 연결하기/.test(gn); return kd === 'rd' ? true : kd === 'con' ? isCon : !isCon; });
  if (a0 != null) list = list.slice(+a0, a1 != null ? +a1 : undefined);
  for (const f of list) {
    const id = path.basename(f, '.sgf'); const txt = fs.readFileSync(f, 'utf8'); let tree; try { tree = parseSgf(txt); } catch (e) { drop(id, 'parse'); continue; }
    const sp = setupOf(tree); if ((tree.p.PL || ['B'])[0] !== 'B') { drop(id, 'turn'); continue; }
    const first = tree.ch.filter((c) => c.p.B); const good = first.filter((c) => c.p.TE), bad = first.filter((c) => c.p.BM);
    if (good.length !== 1) { drop(id, 'no-te'); continue; }
    const sol = pt(good[0].p.B[0]), solS = sol[1] * sp.n + sol[0];
    const rec = { id, kind: kd, n: sp.n, rows: sp.rows, src: { sol: sol, comment: (good[0].p.C || [''])[0] }, wrong: bad.map((b) => { const q = pt(b.p.B[0]); return [q[0], q[1], (b.p.C || [''])[0]]; }) };
    if (kd === 'cap') {
      const r = solveCap(sp); if (r.ans.indexOf(solS) < 0) { drop(id, 'sol-not-capture'); continue; }
      rec.ans = r.ans.map((s) => [s % sp.n, (s / sp.n) | 0]); rec.cnt = r.counts[solS];
    } else if (kd === 'con') {
      const lb = (tree.p.LB || []).map((v) => { const m = /^(..):([AB])$/.exec(v); return m ? [...pt(m[1]), m[2]] : null; }).filter(Boolean); const A = lb.find((q) => q[2] === 'A'), B = lb.find((q) => q[2] === 'B'); if (!A || !B) { drop(id, 'no-labels'); continue; }
      const r = solveCon(sp, A, B); if (r.ans.indexOf(solS) < 0) { drop(id, 'sol-not-connect'); continue; }
      rec.ans = r.ans.map((s) => [s % sp.n, (s / sp.n) | 0]); rec.labels = [A, B];
    } else {
      const r = solveRd(sp); if (r.immediate.length) { drop(id, 'one-move-capture-exists'); continue; }
      if (r.ans.indexOf(solS) < 0) { drop(id, 'sol-not-forced'); continue; }
      rec.ans = r.ans.map((s) => [s % sp.n, (s / sp.n) | 0]);
      // 풀이 예시: 받은 자료의 첫 변화 그대로(흑 첫 수 → 백 응수 → 흑 마무리)
      const seq = [[sol[0], sol[1], 1]]; let nd = good[0].ch.find((c) => c.p.W); if (nd) { const w = pt((nd.p.W || [''])[0]); if (w) seq.push([w[0], w[1], -1]); const b2 = nd.ch.find((c) => c.p.B); if (b2) { const q = pt(b2.p.B[0]); if (q) seq.push([q[0], q[1], 1]); rec.src.comment2 = (b2.p.C || [''])[0]; } }
      rec.seq = seq; rec.nReplies = 0;
    }
    rec.canon = canon(sp.rows, rec.labels); results.push(rec); rep.ok++;
  }
  console.error(kd, '처리 끝', ((Date.now() - t0) / 1000).toFixed(1) + '초');
}
fs.writeFileSync(outFile, JSON.stringify({ results, rep }));
console.error('통과', rep.ok, '제외', Object.entries(rep.drop).map(([k, v]) => k + ':' + v.length).join(' ') || '없음');
