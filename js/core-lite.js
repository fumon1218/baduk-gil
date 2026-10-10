/* 바둑길 — 가벼운 바탕 모듈(window.OKS). 설정·음성·효과음·학습 기록·마침 창만 담았어요.
   옥쌤의 즐거운 교실의 oks-core.js 가운데 바둑에 필요한 부분만 새로 쓴 것이에요(어린이용 이미지·교사 기록·코인 제외). */
(function (global) {
  'use strict';
  var SKEY = 'baduk_settings_v1', LKEY = 'baduk_log_v1';
  function jget(k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
  function jset(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* ---------- 설정 ---------- */
  function settings() { var b = jget(SKEY, {}); return { voice: !!b.voice, explain: !!b.voice, sound: b.sound !== false, calm: !!b.calm, big: !!b.big, slow: !!b.slow, levels: b.levels || {}, defaultLevel: b.defaultLevel || 2 }; }
  function applyBody() { var s = settings(), b = document.body; if (!b) return; b.classList.toggle('calm', s.calm); b.classList.toggle('big-targets', s.big); }
  function saveSetting(k, v) { if (k === 'explain') k = 'voice'; var b = jget(SKEY, {}); b[k] = v; jset(SKEY, b); applyBody(); }
  function levelFor(id) { var v = settings().levels[id]; return v >= 1 && v <= 5 ? v : settings().defaultLevel; }
  function rememberLevel(id, lv) { var b = jget(SKEY, {}); b.levels = b.levels || {}; b.levels[id] = lv; jset(SKEY, b); }
  var profile = { active: function () { return ''; }, label: function () { return '나'; } };

  /* ---------- 음성(기본은 꺼짐) ---------- */
  var voices = []; function loadVoices() { try { voices = speechSynthesis.getVoices() || []; } catch (e) {} }
  if ('speechSynthesis' in global) { loadVoices(); try { speechSynthesis.onvoiceschanged = loadVoices; } catch (e) {} }
  function say(text) {
    if (!text) return Promise.resolve(); var s = settings(); if (!s.voice || !('speechSynthesis' in global)) return Promise.resolve();
    return new Promise(function (res) { try {
      speechSynthesis.cancel(); var u = new SpeechSynthesisUtterance(String(text).replace(/[\u{1F300}-\u{1FAFF}☀-➿]/gu, '')); u.lang = 'ko-KR';
      var v = voices.filter(function (x) { return x.lang && x.lang.replace('_', '-').indexOf('ko') === 0; }); var best = v.filter(function (x) { return /Google|Yuna|Heami|Natural/i.test(x.name); })[0] || v[0]; if (best) u.voice = best;
      u.rate = 1 * (s.slow ? 0.8 : 1); var done = false, fin = function () { if (!done) { done = true; res(); } }; u.onend = fin; u.onerror = fin; setTimeout(fin, 900 + String(text).length * 170); speechSynthesis.speak(u);
    } catch (e) { res(); } });
  }
  function hush() { try { speechSynthesis.cancel(); } catch (e) {} }

  /* ---------- 효과음(Web Audio 합성) ---------- */
  var ac = null;
  function actx() { if (!ac) { try { ac = new (global.AudioContext || global.webkitAudioContext)(); } catch (e) { return null; } } if (ac.state === 'suspended') ac.resume(); return ac; }
  function tone(f, dur, type, vol, when) { var c = actx(); if (!c) return; var t = c.currentTime + (when || 0), o = c.createOscillator(), g = c.createGain(); o.type = type || 'sine'; o.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || 0.2, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.012 + (dur || 0.3)); o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + (dur || 0.3) + 0.06); }
  function sfx(name) { if (!settings().sound) return; switch (name) {
    case 'ok': tone(660, 0.14, 'triangle', 0.2); tone(990, 0.22, 'triangle', 0.18, 0.1); break;
    case 'no': tone(260, 0.2, 'sine', 0.13); tone(220, 0.25, 'sine', 0.11, 0.12); break;
    case 'pop': tone(520, 0.08, 'sine', 0.18); tone(780, 0.08, 'sine', 0.1, 0.04); break;
    case 'tick': tone(1200, 0.04, 'square', 0.04); break;
    case 'win': [523, 659, 784, 1047].forEach(function (f, i) { tone(f, 0.3, 'triangle', 0.2, i * 0.12); }); break;
    default: tone(600, 0.1); } }

  /* ---------- 학습 기록 · 마침 창 ---------- */
  function newStats() { return { mistakes: 0, glow: 0, hand: 0, asked: 0, t0: Date.now() }; }
  function log(entry) { if (!entry) return; var a = jget(LKEY, []); a.push(entry); if (a.length > 1000) a = a.slice(-1000); jset(LKEY, a); }
  function finish(o) {
    var st = o.stats || newStats(), stars = o.stars || (st.mistakes <= 1 ? 3 : st.mistakes <= 3 ? 2 : 1); sfx('win'); log(o.entry && Object.assign({ stars: stars }, o.entry));
    var ov = document.createElement('div'), box = document.createElement('div'); ov.className = 'bk-overlay'; box.className = 'bk-finish';
    box.innerHTML = '<h2>' + esc(o.title || '다 했어요!') + '</h2><p>' + esc(o.text || '') + '</p><div class="bk-stars" aria-label="별 ' + stars + '개">' + [0, 1, 2].map(function (i) { return '<span class="' + (i < stars ? 'on' : '') + '">★</span>'; }).join('') + '</div><div class="bk-btns"></div><div class="bk-note">틀린 횟수 ' + st.mistakes + ' · 힌트 ' + st.asked + ' · ' + Math.round((Date.now() - st.t0) / 1000) + '초</div>';
    var btns = box.querySelector('.bk-btns'); (o.buttons || []).forEach(function (b) { var x = document.createElement('button'); x.type = 'button'; x.className = 'bk-btn ' + (b.color || ''); x.textContent = b.label; x.onclick = function () { ov.remove(); b.onClick && b.onClick(); }; btns.appendChild(x); });
    ov.appendChild(box); document.body.appendChild(ov); say(o.speak); return stars;
  }
  global.OKS = { jget: jget, jset: jset, settings: settings, saveSetting: saveSetting, levelFor: levelFor, rememberLevel: rememberLevel, profile: profile, say: say, hush: hush, unlock: actx, sfx: sfx, newStats: newStats, finish: finish, log: log, applyBody: applyBody, logKey: LKEY };
  if (document.body) applyBody(); else document.addEventListener('DOMContentLoaded', applyBody);
})(window);
