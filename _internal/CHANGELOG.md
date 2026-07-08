## v54.11 (2026-07-08)

### 變更內容
近期發售瀏覽兩項優化：
- **放寬日文標題比對關鍵字**：原本只比對 comment 含「japan」，改為同時比對 japan／japanese／jp 幾種可能寫法，涵蓋更多社群標記習慣不一致的情況；快取 key 升級 v3 避免舊快取殘留
- **排版重新設計**：圖片＋遊戲名稱同一行，發售日/開發商/類型等說明文字改成獨立整行放在下面，不再擠在圖片旁的窄欄位裡

### 影響檔案
- index.html / GameVault_v54_11_index.html
- sw.js
- GameVault_AppsScript.gs（**GS CI/CD 自動部署**）

### GS 版本
- v61 → v62（igdb_upcoming 放寬日文比對關鍵字＋快取版本升級）

### PWA 快取
- CACHE_NAME: gamevault-v54-10 → gamevault-v54-11

### 對應備份
- _internal/old/v54_10/

## v54.10 (2026-07-08)

### 變更內容
修正點擊「立即更新」後底部導覽列消失的問題：
- **根因**：版面最外層容器 `#shell` 用 `100dvh`（動態視窗高度）計算高度，部分手機瀏覽器在網址列/工具列顯示狀態切換的瞬間（尤其是 JS 觸發 reload 這種非使用者手動操作的情境）算出來的 dvh 值可能不穩定，導致容器高度塌陷，底部導覽列（flex 排版的最後一個子元素）跟著不見——這是原本就存在的隱性問題，這次因為新增「立即更新」按鈕觸發 reload 才浮出來
- **修正**：改用 JS 動態計算視窗高度並寫入 CSS 變數 `--app-height`，在 `<body>` 最早的時機就設定好，並在 resize／orientationchange／視覺視窗變化時持續更新，不再單靠瀏覽器的 dvh 支援與時機穩定性

### 影響檔案
- index.html / GameVault_v54_10_index.html
- sw.js

### GS 版本
- 無（純前端修正）

### PWA 快取
- CACHE_NAME: gamevault-v54-09 → gamevault-v54-10

### 對應備份
- _internal/old/v54_09/

## v54.09 (2026-07-08)

### 變更內容
兩個問題修正：
- **標題仍顯示英文**：根因是 GAS 快取 key 沒有隨在地化標題改版更動，同一平台/月份/語言組合持續吐出改版前存的 7 天舊快取。快取 key 加上版本標記（v2）強制讓舊快取失效
- **PWA 自動更新造成畫面破碎、底部導覽列消失**：v54.01 改成的「偵測到新版本自動 reload」實測會在部分情況下於頁面資源還沒穩定載入完成時觸發（`controllerchange` 不只在真的有新版本時觸發），需要使用者關閉重開才會恢復。**改回保守做法**：偵測到新版本只顯示提示橫幅＋「立即更新」按鈕，由使用者自己決定何時點擊更新，不再自動 reload

### 影響檔案
- index.html / GameVault_v54_09_index.html
- sw.js
- GameVault_AppsScript.gs（**GS CI/CD 自動部署**）

### GS 版本
- v60 → v61（igdb_upcoming 快取 key 加版本標記）

### PWA 快取
- CACHE_NAME: gamevault-v54-08 → gamevault-v54-09

### 對應備份
- _internal/old/v54_08/

## v54.08 (2026-07-08)

### 變更內容
近期發售瀏覽的遊戲標題改用在地化名稱，並移除韓文語言篩選：
- **標題改用在地化名稱**：串接 IGDB `alternative_names` 關聯（Localized Titles／Alternative Titles），依 繁中＞簡中＞日文＞英文 優序挑選顯示標題，查無在地化標題則退回原文 name
- comment 欄位是社群自由填寫的說明文字非嚴格列舉值，用關鍵字比對（traditional／simplified／japan）挑選最可能符合的那筆
- 移除「🇰🇷 支援韓文」篩選分頁
- 自我檢查：優序挑選邏輯（含無在地化標題時正確退回原文）已驗證通過

### 影響檔案
- index.html / GameVault_v54_08_index.html
- sw.js
- GameVault_AppsScript.gs（**GS CI/CD 自動部署**）

### GS 版本
- v59 → v60（igdb_upcoming 加入 alternative_names 查詢與在地化標題挑選邏輯）

### PWA 快取
- CACHE_NAME: gamevault-v54-07 → gamevault-v54-08

### 對應備份
- _internal/old/v54_07/

