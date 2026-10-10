// scripts/sahwal-tactics.json(엔진 풀이기로 검증한 먹여치기 후보)에서 수업 2개를 골라 js/lessons-tactics.js 로 저장해요.  node scripts/sahwal-build2.mjs
import fs from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const Go = require('../js/engine.js');
const all = JSON.parse(fs.readFileSync(new URL('./sahwal-tactics.json', import.meta.url), 'utf8')), N = 7;
let seed = 20261011; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
const shuffle = (a) => a.map((v) => [rnd(), v]).sort((x, y) => x[0] - y[0]).map((p) => p[1]);
const ok = (o) => o.sa && o.live.length === 1 && o.intr <= 2 && o.rows.join('').split('O').length - 1 >= 7 && o.caps.length === 4 && o.caps[0][1] > 0 && o.caps[1][1] === 0 && o.caps[2][1] > 0 && o.caps[3][1] > 0;
const pool = shuffle(all.filter(ok)); const half = pool.length >> 1;
// 같은 모양(앞 5줄 6칸)이 겹치지 않게
const uniq = (list, n) => { const seen = new Set(), out = []; for (const o of list) { const k = o.rows.slice(0, 5).map((r) => r.slice(0, 6)).join('/'); if (seen.has(k)) continue; seen.add(k); out.push(o); if (out.length >= n) break; } return out; };
const A = uniq(pool.slice(0, half), 10), B = uniq(pool.slice(half), 10);
const solved = {};
const xy = (s) => [s % N, (s / N) | 0];
const kitem = (o, id) => { solved[id] = { good: [xy(o.first)] }; return { id, kind: 'kill', rows: o.rows, turn: 'X', target: o.target, sym: true, ring: false, prompt: '흑 차례! 일부러 단수가 되는 곳에 돌을 두어(먹여치기) 백을 잡는 수는 어디일까요?', explain: '먹여치기로 백이 돌을 따내게 하면, 백의 눈 자리가 줄어들어 결국 전체가 잡혀요.', hintText: '백의 눈 자리 안에서, 두면 바로 단수가 되는 곳을 찾아봐요.' }; };
const litem = (o, id) => { solved[id] = { good: [xy(o.live[0])] }; return { id, kind: 'live', rows: o.rows, turn: 'O', target: o.target, sym: true, ring: false, prompt: '백 차례! 흑의 먹여치기를 막고 사는 수는 어디일까요?', explain: '흑이 먹여칠 자리를 먼저 차지하면 눈 자리를 지킬 수 있어 살아요.', hintText: '흑이 안으로 먹여치려는 자리가 어디일지 생각해 봐요.' }; };
const demo = A[0], g0 = Go.Game.fromRows(demo.rows, 'X', N), line = [demo.first]; { const g = g0.copy(); g.turn = 1; g.play(demo.first % N, (demo.first / N) | 0); const l = Go.solver.line(g, demo.target[1] * N + demo.target[0], 1, -1, 9, { maxNodes: 2e5 }); l.forEach((s) => line.push(s)); }
const TX = ['흑이 일부러 단수가 되는 곳에 두었습니다. 이것이 먹여치기입니다.', '백이 흑 돌을 따냅니다.', '흑이 같은 자리에 다시 둡니다.', '백이 또 따냅니다.', '이제 눈 자리가 모자라서, 흑이 두면 백 전체가 잡힙니다.'];
const script = line.slice(0, 5).map((s, i) => [s % N, (s / N) | 0, TX[i], 1900]);
const pg = (o, text, extra) => Object.assign({ n: 7, rows: o.rows, turn: 'X', text }, extra || {});
const L1 = { id: 'sh-t1', lv: 3, ord: 44, icon: '🪤', title: '먹여치기로 잡기', sub: '일부러 단수에 두는 수', play: null,
  pages: [
    pg(demo, '먹여치기란 상대가 따낼 수 있는 곳에 일부러 돌을 두는 수입니다. 돌 하나를 내주는 대신 상대 돌 전체를 잡는 길이 열립니다.', { rings: [xy(demo.first)] }),
    pg(demo, '실제 진행을 봅시다.', { script }),
    pg(A[1], '백의 눈 자리가 좁을 때 쓰는 기술입니다. 문제에서 먹여칠 자리를 찾아봅시다.')
  ], items: A.map((o, i) => kitem(o, 'sh-t1#' + i)) };
const L2 = { id: 'sh-t2', lv: 3, ord: 45, icon: '🛡️', title: '먹여치기를 막고 살기', sub: '눈 자리를 지키는 수', play: null,
  pages: [
    pg(B[0], '이번에는 반대로 백이 둘 차례입니다. 흑이 먹여칠 자리를 미리 차지하면 눈 자리를 지킬 수 있습니다.', { turn: 'O', rings: [xy(B[0].live[0])] }),
    pg(B[1], '상대가 어디에 먹여칠지 먼저 생각해 보는 습관이 중요합니다.', { turn: 'O' })
  ], items: B.map((o, i) => litem(o, 'sh-t2#' + i)) };
let js = '/* 바둑 배우기 — 먹여치기로 잡기·막고 살기. scripts/sahwal-tactics.mjs 로 검증한 모양을 scripts/sahwal-build2.mjs 가 골라 만든 파일이에요(직접 고치지 마세요). */\n(function (root) {\n  \'use strict\';\n  var L = root.OKS_GO_LESSONS || require(\'./lessons.js\'), add = L.add;\n  root.OKS_GO_SOLVED = Object.assign(root.OKS_GO_SOLVED || {}, ' + JSON.stringify(solved) + ');\n';
[L1, L2].forEach((l) => { js += '  add(' + JSON.stringify(l) + ');\n'; }); js += '})(typeof window !== \'undefined\' ? window : globalThis);\n';
fs.writeFileSync(new URL('../js/lessons-tactics.js', import.meta.url), js);
console.log('수업', L1.items.length, L2.items.length, '예시 순서', line.join(','));
[...A.slice(0, 3), ...B.slice(0, 2)].forEach((o, i) => { console.log(i < 3 ? 'KILL' : 'LIVE', o.first % N + ',' + ((o.first / N) | 0), o.live.map((s) => s % N + ',' + ((s / N) | 0)).join('/')); console.log(o.rows.slice(0, 5).map((r) => r.slice(0, 6)).join('\n')); });
