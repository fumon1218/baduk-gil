/* 바둑길 서비스 워커 — 처음 한 번 받아 두면 인터넷 없이도 열려요. 파일을 바꾸면 CACHE 이름을 올려 주세요. */
var CACHE = 'baduk-v2';
var FILES = [
"./",
"./assets/pieces.mp3",
"./assets/pl_back1.webp",
"./assets/pl_back10.webp",
"./assets/pl_fwd1.webp",
"./assets/pl_fwd10.webp",
"./assets/pl_knob.webp",
"./assets/pl_panel.webp",
"./assets/pl_pause.webp",
"./assets/pl_play.webp",
"./assets/pl_restart.webp",
"./assets/pl_rocket.webp",
"./assets/pl_stop.webp",
"./assets/stones.glb",
"./css/app.css",
"./icons/icon-192.png",
"./icons/icon-512.png",
"./index.html",
"./js/ai-worker.js",
"./js/common3d.js",
"./js/core-lite.js",
"./js/engine.js",
"./js/games-pack.js",
"./js/games.js",
"./js/go.js",
"./js/lessons-eval.js",
"./js/lessons-joseki.js",
"./js/lessons-l1.js",
"./js/lessons-lecture.js",
"./js/curriculum.js",
"./js/lessons-l2.js",
"./js/lessons-l3.js",
"./js/lessons-l4.js",
"./js/lessons-life.js",
"./js/lessons-prac.js",
"./js/lessons-problems.js",
"./js/lessons-replay.js",
"./js/lessons-solved.js",
"./js/lessons-strategy.js",
"./js/lessons-strategy2.js",
"./js/lessons.js",
"./js/pieces-sound.js",
"./js/sgf.js",
"./js/strategy.js",
"./manifest.webmanifest",
"./vendor/three/addons/controls/OrbitControls.js",
"./vendor/three/addons/loaders/GLTFLoader.js",
"./vendor/three/addons/utils/BufferGeometryUtils.js",
"./vendor/three/addons/utils/SkeletonUtils.js",
"./vendor/three/three.core.js",
"./vendor/three/three.module.js"
];
self.addEventListener('install', function (e) { e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); })); });
self.addEventListener('activate', function (e) { e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); })); });
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(function (hit) {
    return hit || fetch(e.request).then(function (r) { if (r && r.ok && new URL(e.request.url).origin === location.origin) { var cp = r.clone(); caches.open(CACHE).then(function (c) { c.put(e.request, cp); }); } return r; });
  }));
});
