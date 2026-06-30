## v42.01 (2026-06-30)

### 變更內容

**1. 表單分區重新排序（四種類型一致套用）**
- 新順序：圖片紀錄 → 識別資訊/主資訊 → 規格類 → 其餘（編碼條碼/廠商發行/收藏狀態/品相完整度/個人記錄/關聯商品/補充資訊）
- 摺疊邏輯由「黑名單摺疊」改為「白名單展開」：僅前段主要分類預設展開，其餘全部預設摺疊
- 遊戲：圖片紀錄／識別資訊／遊戲規格／版本規格 展開
- 書籍：圖片紀錄／書籍資訊／出版資訊 展開
- 主機：圖片紀錄／主機資訊／硬體規格 展開
- 週邊：圖片紀錄／週邊資訊／規格 展開

**2. 楽天商品名稱清理強化**
- 過去只去除【中古】【新品】等標記，現在新增：
  - 移除結尾 [編碼/平台/系統名] 中括號雜訊
  - 移除開頭常見發行商前綴（SIE/任天堂/SE/SEGA/萬代南夢宮/CAPCOM/KONAMI）
  - 移除版本標示括號（英語版／限定版／Edition 等）
- 解決「ソニー・インタラクティブエンタテインメント MLB The Show 26 （英語版）[ECJS-00052 PS5 ...]」這類完整商品標題污染識別資訊的問題

**3. 中文名稱顯示日文問題修正**
- 過去 `applyMultiDbResult` 會在查詢後立即把日文塞進中文欄位佔位，導致 `aiCompleteMissing` 誤判該欄位「已填」而跳過真正翻譯
- 修正：移除提前塞值，改為 `aiCompleteMissing` 嘗試 AI 翻譯後仍失敗才退而求其次填入原名（並標記來源為 fallback 以利後續追蹤）

**4. AI 可協助欄位盤點**
- 確認 `AI_CAT_SPEC` 四類別欄位定義已涵蓋所有客觀事實類欄位（名稱/系列/廠商/發行日/類型/規格等）
- 個人收藏類欄位（購入日期/價格/保管位置/遊玩狀態/評分）維持留白給使用者填寫，不適合 AI 代填

**5. 封面圖區域感知（GAS 後端，v42）**
- 根本原因：ScreenScraper 封面查詢過去地區優先序寫死為 jp 優先，無論使用者選什麼地區都優先抓日版封面
- GAS `screenScraperProxy` 新增 `region` 參數，`getMediaUrl` 依使用者選擇的地區動態調整優先序（日本→jp優先／亞洲→asi優先／北美→us優先／歐洲→eu優先）
- 前端 `ssSearch` 同步帶入 `_region` 參數
- 非日本地區（亞洲/歐美）的遊戲現在能正確抓到對應版本封面，而非一律抓日版圖

### 影響檔案
- index.html
- GameVault_v42_01_index.html
- sw.js
- GameVault_AppsScript.gs（v42，含 region-aware 封面查詢）

### GS 版本
- v42：screenScraperProxy 加 region 參數；getMediaUrl 動態地區優先序

### PWA 快取
- CACHE_NAME 已遞增：gamevault-v42-01

### 對應備份
- _internal/old/v41_04/

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

