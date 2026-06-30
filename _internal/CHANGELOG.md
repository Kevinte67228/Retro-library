## v41.01 (2026-06-30)

### 變更內容
**GAS 後端（v41）：**
- 新增 `google_image_search` action：透過 Google Custom Search API 搜尋圖片，回傳第一張結果 URL
- IGDB proxy `fields` 加入 `cover.url`，回傳封面圖 URL（`t_cover_big` 尺寸）

**前端（v41.01）：**
- 設定頁新增「Google 圖片搜尋」區塊：API Key（gcsekey）+ Search Engine ID（gcxid）+ 測試按鈕
- `extractField` IGDB case 加入 `cover_url` 提取
- `mergeMultiDbResults` 封面優先序：ScreenScraper → IGDB → 楽天
- 新增 `_autoFetchCover()`：所有查詢/AI填欄完成後，若 cover_img 仍空且已設定 CSE 金鑰，自動以名稱+平台搜尋第一張圖片帶入
- `applyMultiDbResult` 末尾呼叫 `_autoFetchCover()`（延遲 500ms，讓 GameTDB 先完成）
- 主機/週邊 AI 填欄路徑（gcodeSearch）完成後也呼叫 `_autoFetchCover()`
- 新增 `testGCSE()` 測試函式

### 影響檔案
- index.html
- GameVault_v41_01_index.html
- sw.js
- GameVault_AppsScript.gs（v41）

### GS 版本
- v41：新增 google_image_search + IGDB cover

### PWA 快取
- CACHE_NAME 已遞增：gamevault-v41-01

### 對應備份
- _internal/old/v40_49/

## v40.49 (2026-06-29)

### 變更內容
- 修正主機/週邊用商品編碼查詢後「所有資料庫均無結果」的問題
- 根本原因：`_crossRefQuery` 的路由守衛刻意讓非遊戲分類繞過所有遊戲資料庫（正確設計），但缺少替代路徑
- 解法：`gcodeSearch` 加入主機/週邊獨立分支，走「ScreenScraper 試查 + AI 直接填欄」並行策略：
  - ScreenScraper：用型號當名稱查詢，有結果就帶入（需已設定 SS 帳密）
  - AI：直接用型號 + 平台呼叫 `aiKnowledgeFill`，不再需要 primary_name 已存在才執行
  - 兩者並行 Promise.all，SS 填主要欄位，AI 補缺漏欄位
- 週邊的 gcode-combo 路徑（gcodeComboSearch）保持不變，已有 AI 視覺辨識涵蓋

### 影響檔案
- index.html
- GameVault_v40_49_index.html
- sw.js

### GS 版本
- 無

### PWA 快取
- CACHE_NAME 已遞增：gamevault-v40-49

### 對應備份
- _internal/old/v40_48/

## v40.48 (2026-06-29)

### 變更內容
- 完整研究所有建檔平台（PS/Nintendo/Sega/Xbox/PCE/Neo Geo/WonderSwan 等）各地區編碼格式
- `_isValidGCode` 白名單更新（37/37 測試通過）：
  - A: 純數字 4-13 碼（原 5-13），新增支援 Sega Master System 短碼（7015、1228 等）
  - B2: 新增純數字連字號格式（610-6272-50、610-6275 等 Sega 日本地區碼）
  - B1 + C: 維持原有廣域覆蓋
- 覆蓋率從 104/109（95.4%）提升至 109/109（100%）
  - 補上：Sega MD 610 系列、Sega Saturn 610 系列、Sega CD 610 系列、Sega MS 純數字短碼

### 影響檔案
- index.html
- GameVault_v40_48_index.html
- sw.js

### GS 版本
- 無

### PWA 快取
- CACHE_NAME 已遞增：gamevault-v40-48

### 對應備份
- _internal/old/v40_47/

