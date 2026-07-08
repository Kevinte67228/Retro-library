## v54.13 (2026-07-08)

### 變更內容
「立即更新」提示橫幅視覺優化，原本深色背景（#141b30）跟版面其他深色卡片太像不夠明顯：
- 改用青紫漸層亮色背景（#00e5ff → #7c4dff），文字改深色確保對比度
- 新增滑入進場動畫＋持續發光脈動動畫，吸引注意力
- 按鈕改深色底、亮色文字，跟背景形成更清楚的層次

### 影響檔案
- index.html / GameVault_v54_13_index.html
- sw.js

### GS 版本
- 無（純前端視覺調整）

### PWA 快取
- CACHE_NAME: gamevault-v54-12 → gamevault-v54-13

### 對應備份
- _internal/old/v54_12/

## v54.12 (2026-07-08)

### 變更內容
使用者提供 IGDB 遊戲頁面截圖，確認「Localized Titles」與「Alternative Titles」是兩個不同資料來源（前者 game_localizations 關聯，後者 alternative_names），部分遊戲的日文標題只存在前者：
- **加入 game_localizations 查詢**：同時檢查兩個資料來源，任一符合語言/地區條件就採用（繁中：alternative_names traditional 或 game_localizations 的 Taiwan/Hong Kong；簡中：alternative_names simplified 或 game_localizations 的 China；日文同理）
- **加上防呆退回機制**：`game_localizations` 是推測的欄位名稱，若導致 IGDB 查詢失敗，自動退回不含它的欄位組合重試一次，不會讓整個功能掛掉
- 快取 key 升級 v4
- **排版修正**：說明文字（發售日/開發商/類型）改為對齊圖片右側的品名文字，不再從圖片正下方開始
- 自我檢查：兩資料來源整合的優序邏輯（含無在地化資料時正確退回原文）已驗證通過

### 影響檔案
- index.html / GameVault_v54_12_index.html
- sw.js
- GameVault_AppsScript.gs（**GS CI/CD 自動部署**）

### GS 版本
- v62 → v63（igdb_upcoming 加入 game_localizations 來源＋防呆退回機制）

### PWA 快取
- CACHE_NAME: gamevault-v54-11 → gamevault-v54-12

### 對應備份
- _internal/old/v54_11/

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

