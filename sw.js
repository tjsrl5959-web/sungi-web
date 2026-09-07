// 선기왕국 PWA 서비스 워커 (2026-09-07)
// 같은 출처(index·꾸러미·워커)는 **네트워크 먼저**, 안 되면 캐시 — 새 판이 곧장 보이고
// 오프라인이면 마지막 판이 돈다. 런타임(CDN, 판 번호가 주소에 박힘)은 캐시 먼저.
const CACHE = "sungi-3.9.9";
const CDN = "https://pygame-web.github.io/";
const PRECACHE = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"];
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});
function keep(req, res) {
  const ok = res && (res.status === 200 || res.type === "opaque");
  if (ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
  return res;
}
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.href.startsWith(CDN)) {
    e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => keep(req, res))));
  } else if (url.origin === self.location.origin) {
    e.respondWith(fetch(req).then((res) => keep(req, res)).catch(() => caches.match(req)));
  }
});
