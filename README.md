# 바둑길 — 어른을 위한 3D 바둑

규칙부터 초반·중반·종반 **전략**까지 배우는 3D 바둑 웹 앱입니다. 설치 없이 브라우저에서 열고, 한 번 열어 두면 인터넷 없이도 실행돼요(PWA).
「옥쌤의 즐거운 교실」 안의 바둑에서 독립한 앱이며, 원본은 그대로 따로 있습니다.

## 들어 있는 것
- **교재형 강의**: 10개 장·절 목차, 장별 학습 목표, 변화도(성공도·실패도) 강의, 앱 자체 기준 급수(30급→2급)와 장별 승급 시험(70% 합격). 급수는 공식 급수가 아닙니다.
- **내 대국 복기**: 컴퓨터와 둔 대국이 끝나면 '내 큰 실수 풀어보기'로 이길 확률이 크게 떨어진 내 수 최대 3곳을 문제로 다시 풉니다(승률은 추정치).
- **문체**: 수업 원문은 그대로 두고 화면에 보일 때 "~합니다"체로 바꿉니다(`js/tone.js`). 내용 오류는 화면 위 🚩 버튼으로 신고할 수 있습니다.
- **바둑 배우기**: 입문 → 초급 → 중급 → 고급 → 전략(초반·중반·종반) → 전략 심화, 약 170개 수업. 🧭 실력 진단, 📕 오답노트(1·3·7일 뒤 복습).
- **컴퓨터와 대국**: 9·13·19줄, 수준 1~5, 접바둑. 🎯 전략 코치(지금이 초반/중반/종반인지, 큰 자리·약한 돌 표시), 대국 뒤 📊 전략 리포트와 복기.
- **기보·맞히기**: 프로 기보 240판(입문 36 · 중급 44 · 고급 160). 한 수마다 "귀 차지·걸침·벌림·단수…" 해설, 다음 수 맞히기, 내 SGF 불러오기.
- 💡 3단계 힌트, 📖 낱말 풀이.

## 실행
정적 파일이라 서버만 있으면 됩니다. 예: `python3 -m http.server` 후 `http://localhost:8000/` (파일을 그냥 더블클릭하면 3D·작업 스레드가 막혀요).
GitHub Pages: 저장소 Settings → Pages → Branch `main` / `(root)` 로 켜면 돼요.

## 구조
- `index.html`, `css/app.css`, `js/*.js` — 화면과 로직(`go.js` 화면, `engine.js` 규칙·계가·컴퓨터, `strategy.js` 전략 코치, `lessons*.js` 수업, `core-lite.js` 설정·소리·기록)
- `vendor/three` — three.js (MIT), `assets/` — 돌 3D 모델·소리·재생 막대 그림
- `sw.js` — 오프라인 저장(파일을 바꾸면 `CACHE` 이름을 올려 주세요), `manifest.webmanifest` — 홈 화면 추가

## 검사
`node scripts/go-strategy-test.mjs` — 수업 정답을 규칙 엔진으로 다시 계산하고, 기보 팩이 모두 규칙대로 두어지는지 확인합니다.

## 기보 출처
`js/games-pack.js`의 기보 140판은 [CWI Database of Go Games](https://homepages.cwi.nl/~aeb/go/games/)(제작자가 퍼블릭 도메인으로 표기)에서 골랐습니다. 다시 만들려면 `node scripts/go-pack-gen.mjs <games 폴더>`. 해당 페이지에 "I do not claim any rights on this collection. The games here are in the public domain."이라고 밝혀져 있어(2026-10 확인) 재배포에 제약이 없습니다. 그래도 공개 전 예의상 제작자(aeb@cwi.nl)에게 사용 사실을 알리면 좋습니다. 앱 안의 출처 표기는 유지해 주세요.


`node scripts/export-review.mjs > review.csv` — 모든 강의 본문을 표로 뽑아 전문가 검수에 씁니다.

## 궁도 사활 수업
`scripts/sahwal-gen.mjs`(오래 걸림)가 3~6궁 눈 모양을 엔진 풀이기로 검증해 `scripts/sahwal-all.json`에 저장하고, `scripts/sahwal-build.mjs`가 거기서 수업 3개(sh-g1~g3, 문제 33개)를 골라 `js/lessons-sahwal.js`를 만듭니다. 정답은 모두 풀이기 결과와 일치합니다.
