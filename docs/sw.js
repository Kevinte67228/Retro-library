const CACHE_NAME = 'retrovault-v02-33';
const STATIC_ASSETS = [
  './',
  './index.html',
  './RetroVault_v02_33_index.html',
  './manifest.json',
  './manual.html',
  './bg.webp'
];
// 註：v54.71 起 bg.webp 改回本地相對路徑，納入預先快取——原本從 GitHub(raw) 跨網域載入，
// 該請求不受此處快取保護，若比開機畫面淡出的固定延遲還慢，會出現淡出後背景圖尚未就緒的短暫黑屏空窗。
// icon（含 mkt-*）維持外部連結不變，這些不在 App 開啟當下的關鍵路徑上，不受影響。

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return Promise.all(STATIC_ASSETS.map(function(asset) {
        return cache.add(asset).catch(function() {});
      }));
    })
  );
  // 註：這裡故意「不」呼叫 self.skipWaiting()。
  // 讓新版本先進入 waiting 狀態，由頁面偵測到後顯示「發現新版本」提示，
  // 使用者主動點下去才透過 postMessage 通知這裡 skipWaiting，
  // 避免新版本背景默默接管、跟頁面當下記憶體裡的舊版邏輯不同步。
  // （與 Taxi-Meter 專案採用同一套做法，2026-07 對齊）
});

self.addEventListener('message', function(event) {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
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
