// scripts/sahwal-all.json(엔진 풀이기로 검증한 궁도 후보)에서 수업 3개를 골라 js/lessons-sahwal.js 로 저장해요.  node scripts/sahwal-build.mjs
import fs from 'node:fs';
const all = JSON.parse(fs.readFileSync(new URL('./sahwal-all.json', import.meta.url), 'utf8'));
let seed = 20261010; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
const shuffle = (a) => a.map((v) => [rnd(), v]).sort((x, y) => x[0] - y[0]).map((p) => p[1]);
const pick = (list, n) => shuffle(list).slice(0, n);
const Q = '흑 차례! 흑이 먼저 두면 이 백 돌을 잡을 수 있을까요?';
const item = (o) => {
  const k = o.killable, tg = o.target;
  return { kind: 'yn', rows: o.rows, turn: 'X', target: tg, sym: true, answer: k, prompt: Q, hintText: '빈 곳이 몇 칸인지, 어떤 모양인지 살펴봐요. 흑이 급소에 먼저 두면 백이 두 눈을 만들 수 있을까요?',
    explain: k ? '흑이 급소에 먼저 두면 백은 눈을 두 개 만들 수 없어 잡혀요.' : '백이 두 눈을 만들 수 있는 모양이라, 흑이 먼저 두어도 잡을 수 없어요.',
    why: k ? { true: '맞아요! 흑이 급소를 먼저 차지하면 백은 눈을 하나밖에 만들 수 없어 잡혀요.', false: '아니에요. 이 모양은 흑이 급소에 먼저 두면 잡을 수 있어요.' } : { false: '맞아요! 백이 두 눈을 만들 수 있어서 흑이 먼저 두어도 잡을 수 없어요.', true: '아니에요. 이 모양은 백이 두 눈을 만들 수 있어서 흑이 먼저 두어도 살아요.' } };
};
const page = (o, text, extra) => Object.assign({ n: 7, rows: o.rows, turn: 'X', text }, extra || {});
const shapeOf = (s, key, f) => all.filter((o) => o.sz === s && (!key || o.key === key) && (!f || f(o)));
const S3 = ['0,0;1,0;2,0', '0,0;1,0;0,1'], S4 = { line: '0,0;1,0;2,0;3,0', ell: '0,0;1,0;2,0;0,1', tee: '0,0;1,0;2,0;1,1', sq: '0,0;1,0;0,1;1,1', ess: '1,0;0,1;1,1;0,2' };
const vital = (o, txt) => ({ script: [[o.killGood[0] % 7, (o.killGood[0] / 7) | 0, txt, 2000]] });
const open4 = (o) => o.ox > 0 && o.oy > 0;
// 수업 1: 3궁과 4궁
const t3 = shapeOf(3).filter(open4), ex3 = t3[0], line4 = shapeOf(4, S4.line).filter(open4), tee4 = shapeOf(4, S4.tee).filter(open4), sq4 = shapeOf(4, S4.sq).filter(open4);
const g1items = shuffle([...pick(shapeOf(3), 3), ...pick(shapeOf(4, S4.line), 3), ...pick(shapeOf(4, S4.ell).filter((o) => !o.killable), 2), ...pick(shapeOf(4, S4.tee), 1), ...pick(shapeOf(4, S4.sq), 1)]).map(item);
const L1 = { id: 'sh-g1', lv: 3, ord: 41, icon: '🧩', title: '궁도와 사활 1 · 3궁과 4궁', sub: '눈 모양의 크기', play: null,
  pages: [
    Object.assign(page(ex3, '돌 안쪽의 빈 곳을 "궁도(눈 모양)"라고 합니다. 빈 곳이 3칸이면 두 눈을 만들기에 모자랍니다. 흑이 급소에 먼저 두면 백은 눈이 하나뿐이라 잡힙니다.'), vital(ex3, '흑이 급소를 차지했습니다. 백은 두 눈을 만들 수 없습니다.')),
    page(line4[0] || shapeOf(4, S4.line)[0], '빈 곳이 일자로 4칸이면 백이 가운데에 두어 두 눈을 만들 수 있습니다. 그래서 흑이 먼저 두어도 잡을 수 없는 산 모양입니다.', { turn: 'O' }),
    page(tee4[0] || shapeOf(4, S4.tee)[0], '같은 4칸이라도 모양이 다릅니다. 이 T자 모양이나 네모 모양(정사각형)은 흑이 급소에 먼저 두면 잡힙니다. 칸 수만이 아니라 모양을 함께 보아야 합니다.')
  ], items: g1items };
// 수업 2: 5궁과 6궁
const k5 = shapeOf(5).filter((o) => o.killable), a5 = shapeOf(5).filter((o) => !o.killable), a6 = shapeOf(6);
const g2items = shuffle([...k5.slice(0, 3), ...pick(a5, 4), ...pick(a6, 5)]).map(item);
const L2 = { id: 'sh-g2', lv: 3, ord: 42, icon: '🧩', title: '궁도와 사활 2 · 5궁과 6궁', sub: '넓은 눈 모양', play: null,
  pages: [
    page(a5[0], '빈 곳이 5칸이면 대부분 백이 두 눈을 만들 수 있어 삽니다. 흑이 먼저 두어도 잡히지 않는 모양이 많습니다.', { turn: 'O' }),
    page(k5[0], '그래도 5칸 가운데 잡히는 모양이 있습니다. 급소를 찾으면 잡을 수 있으니, 모양을 잘 살펴야 합니다.'),
    page(a6[0], '빈 곳이 6칸 이상이면 이 앱의 문제에서는 흑이 먼저 두어도 잡을 수 없었습니다. 넓을수록 두 눈을 만들 공간이 충분하기 때문입니다.', { turn: 'O' })
  ], items: g2items };
// 수업 3: 귀의 4사6활
const cn = (o) => o.ox === 0 && o.oy === 0, c4 = shapeOf(4).filter(cn), c5 = shapeOf(5).filter(cn), c6 = shapeOf(6).filter(cn);
const c4k = c4.filter((o) => o.killable), c4a = c4.filter((o) => !o.killable);
const g3items = shuffle([...c4k.slice(0, 3), ...c4a.slice(0, 1), ...pick(c5.filter((o) => o.killable), 2), ...pick(c5.filter((o) => !o.killable), 2), ...pick(c6, 3)]).map(item);
const L3 = { id: 'sh-g3', lv: 3, ord: 43, icon: '🧩', title: '귀의 사활 · 4사6활', sub: '귀에서는 4궁은 죽고 6궁은 산다', play: null,
  pages: [
    page(c4k[0], '귀(모서리)는 판의 끝이라 변이나 중앙과 사정이 조금 다릅니다. 바둑에는 "귀에서는 4사 6활"이라는 말이 있습니다. 귀에서 눈 모양이 4칸이면 죽고, 6칸이면 산다는 뜻입니다.'),
    page(c4a[0], '다만 예외가 있습니다. 일자로 4칸인 모양은 귀에서도 삽니다. 이 모양은 백이 가운데에 두어 두 눈을 만듭니다.', { turn: 'O' }),
    page(c6[0], '귀에서 6칸이면 흑이 먼저 두어도 잡을 수 없습니다. 5칸은 모양에 따라 다르니 문제로 연습합시다.', { turn: 'O' })
  ], items: g3items };
let js = '/* 바둑 배우기 — 궁도와 사활(3~6궁, 귀의 4사6활). scripts/sahwal-gen.mjs 로 검증한 모양을 scripts/sahwal-build.mjs 가 골라 만든 파일이에요(직접 고치지 마세요). */\n(function (root) {\n  \'use strict\';\n  var L = root.OKS_GO_LESSONS || require(\'./lessons.js\'), add = L.add;\n';
[L1, L2, L3].forEach((l) => { js += '  add(' + JSON.stringify(l) + ');\n'; }); js += '})(typeof window !== \'undefined\' ? window : globalThis);\n';
fs.writeFileSync(new URL('../js/lessons-sahwal.js', import.meta.url), js);
console.log('수업', [L1, L2, L3].map((l) => l.id + ':' + l.items.length + '문제 ' + l.items.filter((i) => i.answer).length + '예').join(' · '));
