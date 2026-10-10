// scripts/sahwal-eyes.json(참집·옥집 규칙과 엔진 풀이기가 일치한 모양)에서 수업 2개를 골라 js/lessons-eyes.js 로 저장해요.  node scripts/sahwal-build3.mjs
import fs from 'node:fs';
const all = JSON.parse(fs.readFileSync(new URL('./sahwal-eyes.json', import.meta.url), 'utf8'));
let seed = 20261012; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
const shuffle = (a) => a.map((v) => [rnd(), v]).sort((x, y) => x[0] - y[0]).map((p) => p[1]);
const mixed = shuffle(all.filter((o) => o.kinds.includes('false') && o.kinds.includes('real'))), both = shuffle(all.filter((o) => !o.killable));
const rule = '판 가운데에서는 빈 점의 대각선 네 곳 중 흑 돌이 두 곳 이상이면 옥집, 변이나 귀에서는 대각선에 흑 돌이 한 곳만 있어도 옥집입니다.';
const pg = (o, text, extra) => Object.assign({ n: 7, rows: o.rows, turn: 'X', text }, extra || {});
const ringOf = (o, kind) => o.eyes.filter((_, i) => o.kinds[i] === kind);
const pickItem = (o) => {
  const ri = o.kinds.indexOf('real'), fi = o.kinds.indexOf('false'), swap = rnd() < 0.5, A = swap ? o.eyes[fi] : o.eyes[ri], B = swap ? o.eyes[ri] : o.eyes[fi], real = swap ? 'B' : 'A', fake = swap ? 'A' : 'B';
  return { kind: 'pick', rows: o.rows, turn: 'X', sym: true, choices: [{ p: A, t: 'A' }, { p: B, t: 'B' }], correct: [real], prompt: '백 돌 안의 빈 곳 두 군데 중에서 진짜 눈(참집)은 어디일까요?', hintText: '빈 점의 대각선 자리를 살펴봐요. 흑 돌이 대각선에 있으면 백 돌이 끊길 수 있어요.',
    explain: '둘레가 모두 백 돌로 이어져 있어 흑이 눈을 없앨 수 없는 곳이 참집이에요.', why: { [real]: '맞아요! 이곳은 둘레와 대각선이 모두 든든해서 진짜 눈(참집)이에요.', [fake]: '아니에요. 이곳은 대각선에 흑 돌이 있어 백 돌이 끊기면 눈이 사라지는 가짜 눈(옥집)이에요.' } };
};
const ynItem = (o) => { const k = o.killable; return { kind: 'yn', rows: o.rows, turn: 'X', target: o.target, sym: true, answer: k, prompt: '흑 차례! 흑이 먼저 두면 이 백 돌을 잡을 수 있을까요?', hintText: '빈 곳이 진짜 눈(참집)인지 가짜 눈(옥집)인지 하나씩 살펴봐요.', explain: k ? '눈 하나가 가짜라 진짜 눈이 하나뿐이에요. 흑이 급소를 두면 잡혀요.' : '진짜 눈이 두 개라 흑이 먼저 두어도 잡을 수 없어요.',
  why: k ? { true: '맞아요! 한 곳이 옥집(가짜 눈)이라 진짜 눈이 하나뿐이어서 잡혀요.', false: '아니에요. 한 곳이 가짜 눈이라 눈이 하나뿐이에요. 흑이 먼저 두면 잡을 수 있어요.' } : { false: '맞아요! 진짜 눈(참집)이 두 개라 잡을 수 없어요.', true: '아니에요. 진짜 눈이 두 개라 흑이 먼저 두어도 백이 살아요.' } }; };
const L1 = { id: 'sh-e1', lv: 2, ord: 46, icon: '👁️', title: '참집과 옥집', sub: '진짜 눈과 가짜 눈', play: null,
  pages: [
    pg(mixed[0], '돌이 살려면 눈(집)이 필요합니다. 그런데 눈처럼 보여도 진짜가 아닌 곳이 있습니다. 표시한 두 곳 가운데 하나는 진짜 눈(참집)이고 하나는 가짜 눈(옥집)입니다.', { rings: mixed[0].eyes }),
    pg(mixed[0], '참집은 둘레가 모두 이어진 백 돌로 막혀 있어 흑이 들어갈 수 없는 눈입니다. 옥집은 흑 돌이 대각선에 있어서, 흑이 단수를 치면 백 돌이 끊기고 눈이 사라집니다.', { rings: ringOf(mixed[0], 'false') }),
    pg(mixed[1], '구별하는 방법: ' + rule, { rings: mixed[1].eyes })
  ], items: mixed.slice(1, 11).map(pickItem) };
const alive = both.slice(0, 6), dead = mixed.slice(11, 17);
const L2 = { id: 'sh-e2', lv: 2, ord: 47, icon: '🌱', title: '삶의 조건 · 두 눈', sub: '진짜 눈이 둘이면 산다', play: null,
  pages: [
    pg(both[6], '돌이 살아 있으려면 진짜 눈(참집)이 두 개 필요합니다. 흑이 한 눈에 두어도 다른 눈에는 둘 수 없기 때문입니다.', { rings: both[6].eyes }),
    pg(mixed[17], '눈이 두 군데 있어도 하나가 옥집(가짜 눈)이면 진짜 눈은 하나뿐입니다. 이런 돌은 잡힙니다.', { rings: mixed[17].eyes }),
    pg(both[7], '문제를 풀 때는 먼저 빈 곳마다 대각선을 확인해서 진짜 눈이 몇 개인지 세어 봅시다.')
  ], items: shuffle([...alive, ...dead]).map(ynItem) };
let js = '/* 바둑 배우기 — 참집과 옥집, 삶의 조건. scripts/sahwal-eyes.mjs 로 검증한 모양을 scripts/sahwal-build3.mjs 가 골라 만든 파일이에요(직접 고치지 마세요). */\n(function (root) {\n  \'use strict\';\n  var L = root.OKS_GO_LESSONS || require(\'./lessons.js\'), add = L.add;\n';
[L1, L2].forEach((l) => { js += '  add(' + JSON.stringify(l) + ');\n'; }); js += '})(typeof window !== \'undefined\' ? window : globalThis);\n';
fs.writeFileSync(new URL('../js/lessons-eyes.js', import.meta.url), js);
console.log('수업', L1.items.length, L2.items.length, 'mixed', mixed.length, 'both', both.length);
