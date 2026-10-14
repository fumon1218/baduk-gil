// 명국 기보(프로 17국)를 js/games-classic.js 로 만들어요.
// 사용: node scripts/go-classic-gen.mjs <SGF 폴더 1> [<SGF 폴더 2> …]   (폴더 안의 pro_manifest.json 은 쓰지 않고, 아래 META 의 파일 이름으로 찾아요)
// 원본 SGF 의 수순과 사실 정보(대국자·날짜·결과)만 담고, 원본에 붙은 해설·변화도는 담지 않아요. 모든 수를 우리 엔진으로 처음부터 끝까지 두어 보고, 규칙에 어긋나면 넣지 않아요.
import fs from 'node:fs'; import path from 'node:path'; import { createRequire } from 'node:module'; import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url); globalThis.window = globalThis;
const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'js');
require(path.join(dir, 'sgf.js')); const E = require(path.join(dir, 'engine.js'));
const roots = process.argv.slice(2); if (!roots.length) { console.error('사용: node scripts/go-classic-gen.mjs <SGF 폴더…>'); process.exit(1); }
const files = {}; roots.forEach((r) => (function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else if (/\.sgf$/i.test(e.name)) files[e.name] = p; } })(r));

const NAME = { 'AlphaGo': '알파고', 'Lee Sedol': '이세돌', 'Fan Hui': '판후이', 'Ke Jie': '커제', 'Akaboshi Intetsu': '아카보시 인테쓰', 'Honinbo Jowa': '혼인보 조와', 'Yasuda Shusaku': '야스다 슈사쿠', 'Inoue Gennan Inseki': '이노우에 겐안 인세키', 'Go Seigen': '오청원', 'Honinbo Shusai': '혼인보 슈사이', 'Kitani Minoru': '기타니 미노루', 'Iwamoto Kaoru': '이와모토 가오루', 'Hashimoto Utaro': '하시모토 우타로' };
// 날짜는 원본을 그대로 믿기 어려운 옛 대국은 해(年)까지만 적어요(1835년 대국은 문헌마다 날짜가 달라요).
const META = [
  { f: '1835-blood-vomiting-game.sgf', nick: '피를 토한 대국', dt: '1835', note: '아카보시 인테쓰와 혼인보 조와의 대국입니다. 대국 뒤 아카보시가 피를 토했다는 일화에서 이름이 붙었습니다.' },
  { f: '1846-ear-reddening-game.sgf', nick: '귀가 붉어진 대국', dt: '1846', note: '슈사쿠의 대표 명국입니다. 한 수에 얽힌 일화에서 이름이 붙었습니다. 흑이 2집을 이겼습니다.' },
  { f: '1933-game-of-the-century.sgf', nick: '세기의 대국', dt: '1933~34', note: '오청원이 삼삼과 천원으로 시작한 새로운 포석 시대의 대국입니다. 백이 2집을 이겼습니다.' },
  { f: '1938-shusai-retirement-game.sgf', nick: '슈사이 은퇴 대국', dt: '1938', note: '혼인보 슈사이의 은퇴 대국입니다. 수개월에 걸쳐 두었고, 기타니가 5집을 이겼습니다.' },
  { f: '1945-atomic-bomb-game.sgf', nick: '원폭 대국', dt: '1945', note: '히로시마 부근에서 둔 혼인보 타이틀전입니다. 원자폭탄이 떨어진 날에도 이어 두었다고 전해집니다.' },
  { f: '2015_fan_hui_alphago_2.sgf', nick: '알파고 대 판후이 제2국', note: '알파고가 프로 기사를 처음 꺾은 5번기(2015)의 제2국입니다.' },
  { f: '2015_fan_hui_alphago_3.sgf', nick: '알파고 대 판후이 제3국', note: '2015년 5번기의 제3국입니다.' },
  { f: '2015_fan_hui_alphago_4.sgf', nick: '알파고 대 판후이 제4국', note: '2015년 5번기의 제4국입니다.' },
  { f: '2015_fan_hui_alphago_5.sgf', nick: '알파고 대 판후이 제5국', note: '2015년 5번기의 마지막 대국입니다. 알파고가 5전 전승했습니다.' },
  { f: '2016_lee_sedol_alphago_game_1.sgf', nick: '이세돌 대 알파고 제1국', note: '세계가 지켜본 5번기(2016)의 첫 대국입니다. 알파고가 이겼습니다.' },
  { f: '2016_lee_sedol_alphago_game_2.sgf', nick: '이세돌 대 알파고 제2국', note: '알파고의 5선 어깨짚기(37수)가 화제가 된 대국입니다.' },
  { f: '2016_lee_sedol_alphago_game_3.sgf', nick: '이세돌 대 알파고 제3국', note: '알파고가 시리즈 승리를 확정한 대국입니다.' },
  { f: '2016_lee_sedol_alphago_game_4.sgf', nick: '이세돌 대 알파고 제4국', note: '이세돌이 알파고에게 거둔 유일한 승리입니다. 백 78수가 특히 유명합니다.' },
  { f: '2016_lee_sedol_alphago_game_5.sgf', nick: '이세돌 대 알파고 제5국', note: '5번기의 마지막 대국입니다. 알파고가 4승 1패로 마쳤습니다.' },
  { f: '2017_ke_jie_alphago_1.sgf', nick: '커제 대 알파고 제1국', note: '2017년 3번기의 첫 대국입니다. 반집 차이였습니다.' },
  { f: '2017_ke_jie_alphago_2.sgf', nick: '알파고 대 커제 제2국', note: '2017년 3번기의 제2국입니다.' },
  { f: '2017_ke_jie_alphago_3.sgf', nick: '알파고 대 커제 제3국', note: '2017년 3번기의 마지막 대국입니다.' },
];
const out = []; let bad = 0;
META.forEach((m, i) => {
  const f = files[m.f]; if (!f) { console.error('없음:', m.f); bad++; return; }
  const g = window.OKS_SGF.parse(fs.readFileSync(f, 'utf8')); if (!g || g.n !== 19 || g.setup.B.length || g.setup.W.length) { console.error('읽기 실패:', m.f); bad++; return; }
  const game = new E.Game(19), N = g.mv.length / 2; let ok = true;
  for (let k = 0; k < N; k++) { const a = g.mv.slice(k * 2, k * 2 + 2); if (a === '--') { game.pass(); continue; } if (!game.play(a.charCodeAt(0) - 97, a.charCodeAt(1) - 97)) { console.error('규칙 위반:', m.f, (k + 1) + '수'); ok = false; break; } }
  if (!ok) { bad++; return; }
  out.push({ id: 'k' + (i + 1), lv: 3, fam: 1, nick: m.nick, b: NAME[g.b] || g.b, w: NAME[g.w] || g.w, dt: m.dt || g.dt, re: g.re, note: m.note, mv: g.mv });
  console.log('OK', m.f, N + '수', NAME[g.b] || g.b, '대', NAME[g.w] || g.w, g.re);
});
if (bad) { console.error('실패 ' + bad + '건 — 파일을 만들지 않았어요.'); process.exit(1); }
const head = '/* 명국 기보 — scripts/go-classic-gen.mjs 가 만든 파일이에요(직접 고치지 마세요).\n   출처: CWI "Database of Go Games"(https://homepages.cwi.nl/~aeb/go/games/)의 알파고 대국, 공개 GitHub 미러의 역사적 명국 5국.\n   수순과 대국자·날짜·결과만 담았고 원본 해설은 담지 않았어요. 모든 수를 규칙 엔진으로 끝까지 확인했어요. 옛 대국의 날짜는 해(年)까지만 적었어요. */\n';
fs.writeFileSync(path.join(dir, 'games-classic.js'), head + '(function () { window.OKS_GO_GAMES = (window.OKS_GO_GAMES || []).concat(' + JSON.stringify(out) + '); })();\n');
console.log('js/games-classic.js —', out.length + '국');
