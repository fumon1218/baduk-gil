/* 바둑길 — 강의 문체를 "~합니다"체로 맞추는 변환기.
   수업 원문에 남아 있는 "~해요/~예요/~있어요"체를 읽는 순간 정중한 평서문으로 바꿔요.
   질문("~일까요?", "~있나요?")과 권유("~보세요")는 그대로 두고, 이유를 대는 "~니까요"도 그대로 둡니다. */
(function (root) {
  'use strict';
  var S0 = 0xac00;
  function dec(ch) { var c = ch.charCodeAt(0) - S0; if (c < 0 || c > 11171) return null; return { i: Math.floor(c / 588), v: Math.floor((c % 588) / 28), f: c % 28 }; }
  function enc(i, v, f) { return String.fromCharCode(S0 + i * 588 + v * 28 + f); }
  var V = { ㅏ: 0, ㅐ: 1, ㅓ: 4, ㅔ: 5, ㅕ: 6, ㅗ: 8, ㅘ: 9, ㅙ: 10, ㅚ: 11, ㅜ: 13, ㅝ: 14, ㅟ: 16, ㅡ: 18, ㅣ: 20 };
  var F_B = 17, F_L = 8, F_SS = 20;
  var DICT = { '눌러요': '누릅니다', '골라요': '고릅니다', '달라요': '다릅니다', '갈라요': '가릅니다', '쉬워요': '쉽습니다', '배워요': '배웁니다', '이겨요': '이깁니다', '생겨요': '생깁니다', '아니에요': '아닙니다', '볼게요': '보겠습니다', '줄게요': '주겠습니다', '맞아요': '맞습니다', '써요': '씁니다', '모여요': '모입니다' };
  function conv(w) { // w: 한글 낱말(끝이 '요'), 평서문일 때의 합쇼체
    if (DICT[w]) return DICT[w];
    if (/(니까요|면요|시요|세요|마요|어떨까요)$/.test(w)) return null;
    if (/(았|었|였|했|겼|봤|줬|됐|찼|랐|왔|쳤|렸|졌|뒀|켰|났|갔|섰|폈)어요$|(았|었|였|했|겼|봤|줬|됐|찼|랐|왔|쳤|렸|졌|뒀|켰|났|갔|섰|폈)아요$/.test(w)) return w.slice(0, -2) + '습니다';
    if (/거예요$/.test(w)) return w.slice(0, -3) + '것입니다';
    if (/(이에요|예요)$/.test(w)) return w.replace(/(이에요|예요)$/, '입니다');
    if (/봐요$/.test(w)) return w.slice(0, -2) + '봅시다';
    var m = w.match(/^(.*?)([아어])요$/); // 받침 있는 줄기 + 아요/어요
    if (m && m[1]) { var last = dec(m[1].slice(-1)); if (last) {
      if (last.f === F_L) return m[1].slice(0, -1) + enc(last.i, last.v, F_B) + '니다';
      if (last.f !== 0) return m[1] + '습니다';
      return m[1].slice(0, -1) + enc(last.i, last.v, F_B) + '니다'; } }
    var c = dec(w.charAt(w.length - 2)); if (!c || c.f) return null; var head = w.slice(0, -2);
    if (c.i === 18 && c.v === 1 && false) return null;
    if (c.i === 18 && c.v === 4) return head + '여' === '' ? null : null;
    if (c.v === 1 && c.i === 18) return head + enc(18, 0, F_B) + '니다'; // 해→합
    if (c.v === 1) return c.i === 3 ? head + enc(3, 11, F_B) + '니다' : head + enc(c.i, 1, F_B) + '니다'; // 해→합, 돼→됩, 내→냅
    if (c.v === 10) return head + enc(c.i, 11, F_B) + '니다'; // 돼(ㅙ)→됩
    if (c.v === 0 || c.v === 4) return head + enc(c.i, c.v, F_B) + '니다'; // 가→갑, 서→섭
    if (c.v === 9) return head + enc(c.i, 8, F_B) + '니다'; // 봐·와→봅·옵
    if (c.v === 14) return head + enc(c.i, 13, F_B) + '니다'; // 줘·둬→줍·둡
    if (c.v === 6 && [12, 14, 18, 5, 11, 0, 15].indexOf(c.i) >= 0) return head + enc(c.i, 20, F_B) + '니다'; // 져·쳐·혀·려·여·겨 → 집·칩·힙·립·입·깁
    if (c.v === 5) return head + enc(c.i, 5, F_B) + '니다';
    return null;
  }
  function tone(t) {
    if (typeof t !== 'string' || t.indexOf('요') < 0) return t;
    return t.replace(/([가-힣]+요)(?=[.!,)\]]|\s|$)/g, function (all, w, off, str) {
      var nx = str.charAt(off + all.length); if (nx === '?' ) return all;
      if (/까요$/.test(w) || /그래서요$/.test(w)) return all;
      if (/나요$/.test(w) && !/(살아나요|벗어나요|끝나요|만나요)$/.test(w)) return all;
      var r = conv(w); return r || all;
    });
  }
  function deep(o) { if (typeof o === 'string') return tone(o); if (Array.isArray(o)) { for (var i = 0; i < o.length; i++) o[i] = deep(o[i]); return o; }
    if (o && typeof o === 'object') { for (var k in o) { if (k === 'rows' || k === 'id' || k === 'kind' || k === 'calc') continue; o[k] = deep(o[k]); } } return o; }
  var api = { tone: tone, deep: deep }; root.OKS_TONE = api; if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
