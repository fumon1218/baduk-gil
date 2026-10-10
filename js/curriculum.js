/* 바둑길 — 교재 목차(장·절)와 급수 체계.
   수업(lessons*.js)은 그대로 두고, 여기서 장 → 절 → 강으로 묶어서 한 권의 교재처럼 보여 줘요.
   급수는 이 앱 자체의 학습 기준이에요. 한국기원 등 공식 급수와는 다릅니다. */
(function (root) {
  'use strict';
  var L = root.OKS_GO_LESSONS || require('./lessons.js');
  if (root.OKS_TONE || (typeof require !== 'undefined' && (root.OKS_TONE = require('./tone.js')))) L.LESSONS.forEach(function (l) { root.OKS_TONE.deep(l); }); /* 문체를 "~합니다"체로 */
  var CHAPTERS = [
    { id: 'ch1', no: 1, title: '바둑의 규칙', sub: '돌·활로·단수·집', rank: 25, goal: '바둑판과 돌, 활로와 단수, 착수금지와 패, 집 세기, 두 눈으로 사는 모양까지 바둑의 기본 규칙을 익힙니다.',
      sections: [{ t: '판과 돌, 활로', ids: ['i1', 'i2'] }, { t: '단수와 따내기', ids: ['i3', 'i4', 'i5'] }, { t: '집과 계가', ids: ['i6', 'i7', 'i8'] }, { t: '첫 대국', ids: ['i9'] }] },
    { id: 'ch2', no: 2, title: '기초 기술', sub: '따내기·축·양단수', rank: 21, goal: '돌을 따내고 도망치는 기본 기술과 축, 양단수를 손에 익힙니다.',
      sections: [{ t: '따내기와 단수 연습', ids: ['i10', 'i11', 'i12'] }, { t: '축과 양단수', ids: ['c1', 'c2', 'c3', 'k1', 'k2'] }, { t: '기술 연습', ids: ['c6', 'c7'] }] },
    { id: 'ch3', no: 3, title: '실전 속 단수와 따내기', sub: '실전 감각', rank: 18, goal: '실제 대국 장면에서 단수 치는 자리와 따낼 수 있는 돌을 찾는 눈을 기릅니다.',
      sections: [{ t: '단수 치기', ids: ['q-a1', 'q-a2', 'q-a3'] }, { t: '따내기', ids: ['q-c1', 'q-c2', 'q-c3'] }, { t: '9줄 대국', ids: ['c5'] }] },
    { id: 'ch4', no: 4, title: '포석', sub: '귀 → 변 → 중앙', rank: 15, goal: '대국 초반의 큰 자리, 귀의 대표 자리(화점·소목·삼삼), 걸침과 벌림을 배웁니다.',
      sections: [{ t: '포석의 원칙', ids: ['c4', 's1', 's2'] }, { t: '귀의 대표 자리', ids: ['s14'] }, { t: '포석 실습', ids: ['s3', 's4', 's5'] }] },
    { id: 'ch5', no: 5, title: '사활', sub: '살고 죽는 모양', rank: 12, goal: '살고 죽는 기본 모양과 급소를 익히고, 사활 문제로 수읽기 힘을 기릅니다.',
      sections: [{ t: '살고 죽는 모양', ids: ['m1', 'm2'] }, { t: '기초 사활', ids: ['life-k1', 'life-k2', 'life-l1', 'life-l2'] }, { t: '사활 연습·심화', ids: ['m6', 'a1'] }] },
    { id: 'ch6', no: 6, title: '정석 입문', sub: '귀의 기본 수순', rank: 10, goal: '귀에서 자주 나오는 기본 수순의 흐름을 기보로 살펴봅니다.',
      sections: [{ t: '정석의 흐름', ids: ['j1', 'j2', 'j3'] }, { t: '모양의 이름', ids: ['s15'] }] },
    { id: 'ch7', no: 7, title: '중반 전투', sub: '약한 돌·공격과 방어', rank: 8, goal: '약한 돌을 알아보고 지키며, 상대의 약점을 끊어 공격하는 중반의 기본 전략을 배웁니다.',
      sections: [{ t: '약한 돌과 강한 돌', ids: ['s6', 's7', 's8'] }, { t: '실기', ids: ['s9'] }, { t: '패 싸움', ids: ['a4'] }] },
    { id: 'ch8', no: 8, title: '형세 판단과 끝내기', sub: '집 계산·승기', rank: 6, goal: '집을 세어 형세를 판단하고, 끝내기와 침입·삭감, 집과 세력의 균형을 배웁니다.',
      sections: [{ t: '형세 판단', ids: ['m3', 'a2', 's12'] }, { t: '끝내기', ids: ['s10', 's11', 's13'] }, { t: '집과 세력, 침입과 삭감', ids: ['s16', 's17', 's18'] }] },
    { id: 'ch9', no: 9, title: '접바둑과 정식 대국', sub: '13줄·19줄', rank: 4, goal: '접바둑과 13줄·19줄 정식 대국으로 실력을 점검하고 전략의 큰 그림을 정리합니다.',
      sections: [{ t: '접바둑', ids: ['m4'] }, { t: '대국과 전략', ids: ['m5', 'a3', 'a5', 'a6'] }] },
    { id: 'ch10', no: 10, title: '기보 감상', sub: '복기 강좌 106강', rank: 2, goal: '컴퓨터 대국과 프로 대국을 한 수씩 따라 두며 해설과 문제로 대국의 흐름을 익힙니다.', sections: [] }
  ];
  var used = {}; CHAPTERS.forEach(function (c) { c.sections.forEach(function (s) { s.ids = s.ids.filter(function (id) { return L.LESSONS.some(function (l) { return l.id === id; }); }); s.ids.forEach(function (i) { used[i] = c.id; }); }); });
  /* 복기 강좌는 10강씩 한 절로 */
  var rs = L.LESSONS.filter(function (l) { return /^r\d+$/.test(l.id); }).map(function (l) { return l.id; }), c10 = CHAPTERS[9];
  for (var i = 0; i < rs.length; i += 10) { var part = rs.slice(i, i + 10); c10.sections.push({ t: '복기 ' + (i + 1) + '~' + (i + part.length) + '강', ids: part }); part.forEach(function (x) { used[x] = 'ch10'; }); }
  /* 어느 장에도 안 들어간 수업은 가장 알맞은 장 끝에 붙여요(수업을 새로 추가해도 빠지지 않도록) */
  L.LESSONS.forEach(function (l) { if (used[l.id]) return; var ch = CHAPTERS[Math.min(CHAPTERS.length - 2, Math.max(0, l.lv - 1))]; ch.sections.push({ t: '더 보기', ids: [l.id] }); used[l.id] = ch.id; });
  CHAPTERS[9].exam = false;
  var api = {
    CHAPTERS: CHAPTERS, START_RANK: 30,
    chapterOf: function (lid) { return CHAPTERS.filter(function (c) { return c.id === used[lid]; })[0] || null; },
    lessonsOf: function (ch) { if (typeof ch === 'string') ch = CHAPTERS.filter(function (c) { return c.id === ch; })[0]; var o = []; ch.sections.forEach(function (s) { s.ids.forEach(function (id) { var l = L.LESSONS.filter(function (q) { return q.id === id; })[0]; if (l) o.push(l); }); }); return o; },
    rankName: function (r) { return r >= 1 ? r + '급' : '초단'; }
  };
  root.OKS_GO_CURR = api; if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
