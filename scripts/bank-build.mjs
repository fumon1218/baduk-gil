// 문제 은행 만들기 ② — scripts/bank-verify.mjs 가 만든 json 을 쉬운 문제부터 차례로 늘어놓아 js/bank.js 로 써요.
// 사용: node scripts/bank-build.mjs <bank-all.json>
// 번호(i)는 받은 자료의 파일 번호 그대로예요. 오답노트가 이 번호로 문제를 찾으니, 같은 자료로 다시 만들 때 번호를 바꾸지 마세요.
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url)); const inp = process.argv[2]; if (!inp) { console.error('사용: node scripts/bank-build.mjs <bank-all.json>'); process.exit(1); }
const { results } = JSON.parse(fs.readFileSync(inp, 'utf8'));
const num = (id) => +id.split('_').pop(); const cnt = (rows, ch) => rows.reduce((a, r) => a + r.split(ch).length - 1, 0);
const bucket = { cap: [], con: [], rd: [] };
results.forEach((x) => {
  const rec = { i: num(x.id), r: x.rows.join('/'), a: x.ans }, w = cnt(x.rows, 'O'), b = cnt(x.rows, 'X');
  if (x.kind === 'cap') { rec.e = x.src.comment; rec._k = [w, x.n, b, rec.i]; }
  else if (x.kind === 'con') { rec.l = x.labels; rec.e = x.src.comment; const d = Math.abs(x.labels[0][0] - x.labels[1][0]) + Math.abs(x.labels[0][1] - x.labels[1][1]); rec._k = [d, x.n, b, rec.i]; }
  else { rec.s = x.seq.slice(1); rec.e = [x.src.comment, x.src.comment2].filter(Boolean).join(' '); if (x.wrong.length) rec.w = x.wrong.filter((q) => q[2]).map((q) => [q[0], q[1], q[2]]); rec._k = [w, x.n, b, rec.i]; }
  bucket[x.kind].push(rec);
});
Object.values(bucket).forEach((list) => { list.sort((p, q) => { for (let k = 0; k < 4; k++) if (p._k[k] !== q._k[k]) return p._k[k] - q._k[k]; return 0; }); list.forEach((r) => { delete r._k; }); });
const head = '/* 문제 은행 — scripts/bank-verify.mjs · bank-build.mjs 가 만든 파일이에요(직접 고치지 마세요).\n   따내기 200 · 연결하기 100 · 두 수 따내기 500. 모든 정답을 규칙 엔진으로 처음부터 다시 풀어 확인했어요(정답 자리가 하나뿐인 문제만 담았어요). r 은 줄을 / 로 이은 판 모양이에요.\n   교육용으로 만든 문제이고 전문가 검수는 거치지 않았어요. 쉬운 문제부터 차례대로 들어 있어요. */\n';
fs.writeFileSync(path.join(here, '..', 'js', 'bank.js'), head + 'window.OKS_GO_BANK = ' + JSON.stringify(bucket) + ';\n');
console.log('js/bank.js —', Object.entries(bucket).map(([k, v]) => k + ' ' + v.length).join(' · '), (fs.statSync(path.join(here, '..', 'js', 'bank.js')).size / 1024).toFixed(0) + 'KB');
