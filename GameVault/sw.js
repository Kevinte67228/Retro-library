const CACHE_NAME = 'gamevault-v54-05';
const STATIC_ASSETS = [
  './',
  './index.html',
  './GameVault_v54_05_index.html',
  './manifest.json',
  './manual.html'
];
// 註：bg.webp 與各 icon（含 mkt-*）已改由 GitHub(raw) 提供，屬跨網域資源，
// 不納入 service worker 預先快取（fetch 事件亦只處理同源），改由瀏覽器自行快取。

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return Promise.all(STATIC_ASSETS.map(function(asset) {
        return cache.add(asset).catch(function() {});
      }));
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.map(function(key) {
        if (key !== CACHE_NAME && key.indexOf('gamevault-') === 0) return caches.delete(key);
      }));
    }).then(function() {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function(event) {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;

  // v40.28：HTML 導航請求 → 網路優先（Network First）。
  // 確保每次進入都先抓最新 HTML，部署新版後第一次進入即更新，不必關閉重開。
  // 離線時 fallback 回快取（含 ./index.html），維持 PWA 離線能力。
  if (event.request.mode === 'navigate' || event.request.destination === 'document') {
    event.respondWith(
      fetch(event.request).then(function(response) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(event.request, copy).catch(function() {});
        });
        return response;
      }).catch(function() {
        return caches.match(event.request).then(function(cached) {
          return cached || caches.match('./index.html');
        });
      })
    );
    return;
  }

  // 其他靜態資源 → 快取優先（Cache First），維持載入速度。
  event.respondWith(
    caches.match(event.request).then(function(cached) {
      if (cached) return cached;
      return fetch(event.request).then(function(response) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(event.request, copy).catch(function() {});
        });
        return response;
      });
    })
  );
});
