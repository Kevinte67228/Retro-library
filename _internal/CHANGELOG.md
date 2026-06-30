## v41.04 (2026-06-30)

### 變更內容
- `gcodeSearch` 純編碼查詢分支：`normalizeGameCode` 正規化後，同步把結果寫回輸入框（`gcode-inp`）
- 例：輸入 `ECJS00052` 查詢後，輸入框會顯示為正規化後的 `ECJS-00052`，避免使用者誤以為輸入有誤
- 純視覺一致性修正，不影響查詢與存檔邏輯（正規化早已在內部生效）

### 影響檔案
- index.html
- GameVault_v41_04_index.html
- sw.js

### GS 版本
- 無

### PWA 快取
- CACHE_NAME 已遞增：gamevault-v41-04

### 對應備份
- _internal/old/v41_03/

## v41.03 (2026-06-30)

### 變更內容
- **找到真正的根本原因**：`renderFld()` 內的 URL 防護機制
  ```js
  if(v&&typeof v==='string'&&v.startsWith('http')&&k!=='ref_link')v='';
  ```
  這段是為了防止「價格／日期欄位被誤填網址」，但白名單只排除了 `ref_link`，**沒有把 `cover_img`／`back_img`／`spine_img` 排除**。導致只要封面圖來源是外部 URL（楽天、IGDB、ScreenScraper 等），渲染表單時就會被這段防護直接清空成空字串——資料層 `entry.cover_img` 在賦值當下完全正常，但每次重繪表單（`renderForm`→`renderFld`）都會被這段防護清掉，畫面上連預覽圖的 `<img>` 標籤都不會渲染（因為 `hasImgVal('')===false`）
- 修正：URL 防護加入圖片欄位白名單（`cover_img`、`back_img`、`spine_img`），讓外部圖片 URL 合法顯示
- 這個 bug 影響範圍極廣：所有資料庫（ScreenScraper／IGDB／楽天）回傳的封面網址，過去只要沒有先被存檔流程下載成 Drive ID，**畫面上都不會顯示封面**，使用者誤以為查詢沒有抓到圖片

### 影響檔案
- index.html
- GameVault_v41_03_index.html
- sw.js

### GS 版本
- 無

### PWA 快取
- CACHE_NAME 已遞增：gamevault-v41-03

### 對應備份
- _internal/old/v41_02/

## v41.02 (2026-06-30)

### 變更內容
- **根本原因找到**：純編碼查詢（`gcodeSearch`）沒有 AI 比對來源時，`dbTrusted` 邏輯要求 `_confidence==='high'`（至少 2 個資料庫同意），但實務上常常只有單一資料庫（如楽天）命中，導致整批結果（含封面、名稱、平台）被判定「不吻合」而完全丟棄
- 修正：純編碼查詢時，編碼本身就是查詢鍵，只要有任一資料庫回傳結果即視為可信（不再要求多庫共識）
- 移除除錯用的 debug alert
- 此修正影響範圍：所有透過「商品編碼」查詢的封面、名稱、平台、發行商等欄位自動帶入

### 影響檔案
- index.html
- GameVault_v41_02_index.html
- sw.js

### GS 版本
- 無

### PWA 快取
- CACHE_NAME 已遞增：gamevault-v41-02

### 對應備份
- _internal/old/v41_01/

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

