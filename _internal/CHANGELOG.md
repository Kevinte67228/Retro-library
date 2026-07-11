## v54.32 (2026-07-08)

### 變更內容
串接 RAWG 遊戲資料庫，補強 IGDB 對現代／獨立遊戲的封面圖缺漏：
- GAS 新增 `rawg_search` proxy（標準 REST 查詢 `api.rawg.io/api/games`）
- 加入 `DB_REGISTRY`（歐美群），跟現有 11 個資料庫一樣走「自動分流」＋「設定頁可手動強制指定單一庫」的既有機制
- 欄位優先序：主要用於封面圖補強（優先序在 IGDB 之後、樂天之前），文字欄位（名稱/平台/發售日/類型/連結）列為最低優先，僅在其他資料庫都查無時採用（RAWG 基本搜尋不含開發商/發行商資訊，不適合當文字欄位主力來源）
- 設定頁新增 RAWG API Key 欄位＋測試連線＋說明彈窗
- 自我檢查：欄位擷取邏輯（含空資料/null安全性）已驗證通過

### 已知後續
- DeepSeek 圖片辨識／OCR 串接：使用者已確認需求方向（可選引擎＋智慧分流，優先用於亞洲版/CJK文字封面辨識），但因缺少 API Key 與確認過的圖片輸入端點格式，暫緩實作，待使用者提供後再進行
- 使用者提出的「平台分級動態路由」（現代遊戲→RAWG／IGDB，復古平台→強制ScreenScraper）為更精細的路由邏輯，本版僅完成 RAWG 基礎串接，尚未實作平台判斷式的強制分流

### 影響檔案
- index.html / GameVault_v54_32_index.html
- sw.js
- GameVault_AppsScript.gs（**GS CI/CD 自動部署**）

### GS 版本
- v63 → v64（新增 rawg_search proxy）

### PWA 快取
- CACHE_NAME: gamevault-v54-31 → gamevault-v54-32

### 對應備份
- _internal/old/v54_31/

## v54.31 (2026-07-08)

### 變更內容
搜尋框文字再縮小（13px→12px），左右內距也微調（38px→34px、12px→10px），讓完整的 placeholder 文字（搜尋名稱、平台、條碼...）能完整顯示，不用再依賴省略號截斷。

### 影響檔案
- index.html / GameVault_v54_31_index.html
- sw.js

### GS 版本
- 無（純前端字級微調）

### PWA 快取
- CACHE_NAME: gamevault-v54-30 → gamevault-v54-31

### 對應備份
- _internal/old/v54_30/

## v54.30 (2026-07-08)

### 變更內容
縮小多處間距，並嘗試用縮小字級改善搜尋框文字截斷：
- 統計列（總計＋分類數字列）上下留白縮小
- 分隔線與搜尋框之間的間距縮小
- 分類模式各分組之間的間距從 26px 縮小為 16px
- 搜尋框文字字級從 14px 縮小為 13px，讓更多文字能完整顯示，超出才用「...」截斷

### 影響檔案
- index.html / GameVault_v54_30_index.html
- sw.js

### GS 版本
- 無（純前端排版微調）

### PWA 快取
- CACHE_NAME: gamevault-v54-29 → gamevault-v54-30

### 對應備份
- _internal/old/v54_29/

## v54.29 (2026-07-08)

### 變更內容
三項排版修正：
- **統計列「總計」高度對齊**：`#stats-row` 的 `align-items:stretch` 改為 `center`，避免「總計」跟其他可滑動分類項目高度不一致
- **搜尋框文字過長被生硬截斷**：共用的 `.si` 搜尋框樣式（收藏頁/尋寶頁搜尋）、平台選擇搜尋框、關聯商品搜尋框都加上 `text-overflow:ellipsis`，超出寬度改用「...」呈現，不再生硬截斷
- **收藏列表頂部間距**：`#glist` 補上頂部 12px padding，避免第一張卡片直接貼著上方排序列

### 影響檔案
- index.html / GameVault_v54_29_index.html
- sw.js

### GS 版本
- 無（純前端排版修正）

### PWA 快取
- CACHE_NAME: gamevault-v54-28 → gamevault-v54-29

### 對應備份
- _internal/old/v54_28/

