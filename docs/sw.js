const CACHE_NAME = 'retrovault-v02-142';
const STATIC_ASSETS = [
  './',
  './index.html',
  './RetroVault_v02_142_index.html',
  './manifest.json',
  './manual.html',
  './bg.webp'
];
// 註：v54.71 起 bg.webp 改回本地相對路徑，納入預先快取——原本從 GitHub(raw) 跨網域載入，
// 該請求不受此處快取保護，若比開機畫面淡出的固定延遲還慢，會出現淡出後背景圖尚未就緒的短暫黑屏空窗。
// icon（含 mkt-*）維持外部連結不變，這些不在 App 開啟當下的關鍵路徑上，不受影響。

// v02.124：使用者實測回報圖片載入變慢很多。查證後發現收藏封面（Google Drive縮圖，
// drive.google.com/thumbnail?id=...）是跨網域請求，原本 fetch 監聽器一開頭
// 「url.origin !== location.origin 就直接 return」，等於完全略過這類請求、Service
// Worker 從來沒快取過任何一張收藏圖——每次瀏覽同一張圖（例如捲動離開又捲回來、切換
// 卡片/畫廊檢視、開依系列瀏覽）都要重新打一次 Drive，收藏量一大、來回瀏覽次數一多，
// 感受上就是「圖片載入越來越慢」。這裡在跨網域判斷之前，額外攔截 Drive 縮圖請求，
// 走獨立的快取優先策略，不受版號 CACHE_NAME 影響（換版本不會被清空，圖片不需要跟著
// 應用程式版本一起失效）。
const IMG_CACHE_NAME = 'retrovault-img-v1';
// v02.142：使用者實測回報圖片載入偏慢，查證後發現240筆上限對現在的收藏量（300+件）明顯
// 偏小——而且同一張圖在不同畫面（卡片/詳情頁/燈箱）會用不同尺寸參數，對Drive來說是不同
// 網址、會各自佔用一個快取名額，實際覆蓋到的「收藏件數」又比240筆的字面數字更少，快取
// 因此更容易被擠爆、造成本來不該再打網路的圖片重新被踢出去。上調到400筆，緩解這個容量
// 跟收藏量對不上的問題；仍然保留上限（不是無限），避免佔用裝置容量沒有節制。
const IMG_CACHE_MAX = 400; // 上限筆數，避免快取無止盡成長佔用裝置容量；用簡單FIFO汰換
// 舊的（Cache API本身沒有內建LRU，真要做需要額外記錄每筆的存取時間，對縮圖快取這種
// 時效性不高的用途不成比例，FIFO已經夠用）。

function trimImgCache(cache) {
  cache.keys().then(function(keys) {
    if (keys.length > IMG_CACHE_MAX) {
      var toDelete = keys.slice(0, keys.length - IMG_CACHE_MAX);
      toDelete.forEach(function(k) { cache.delete(k); });
    }
  });
}

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
        // v02.124：IMG_CACHE_NAME('retrovault-img-v1')不是gamevault-開頭、也不等於
        // CACHE_NAME，本來就不會被下面這行誤刪；圖片快取刻意跟應用程式版本脫鉤，換版本
        // 不需要重新下載已經快取過的圖。
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

  // v02.124：Google Drive 縮圖，快取優先＋數量上限，見上方常數定義處的說明。
  if (url.hostname === 'drive.google.com' && url.pathname === '/thumbnail') {
    event.respondWith(
      caches.open(IMG_CACHE_NAME).then(function(cache) {
        return cache.match(event.request).then(function(cached) {
          if (cached) return cached;
          return fetch(event.request).then(function(response) {
            if (response.ok) {
              const copy = response.clone();
              cache.put(event.request, copy).then(function() {
                trimImgCache(cache);
              }).catch(function() {});
            }
            return response;
          });
        });
      })
    );
    return;
  }

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
