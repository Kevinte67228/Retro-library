## v42.03 (2026-06-30)

### 變更內容
全面掃描程式碼中的繁體中文錯字（UI 文字、toast 訊息、程式註解、placeholder、欄位標籤），確認並修正以下 3 處明確錯字：

- **「遂戲」→「遊戲」**（共 14 處）：含使用者可見 UI（「🔍 查詢遂戲資料庫」按鈕文字）、`_selectedType` 字串比對邏輯、`GROUPS` 分類陣列定義、Gemini OCR prompt 文字。已逐一核對改字後分類比對邏輯仍保持一致（`_selectedType||'遊戲'`、`cat==='遊戲'` 等共 22 處引用全部統一）
- **「侩用」→「供用」**（1 處）：函式說明註解
- **「卿測」→「猜測」**（2 處）：toast 訊息「已帶入 AI 卿測結果」

### 掃描範圍與方法
- 全文逐字頻率分析，列出所有罕見字逐一核對上下文
- 280 條 toast/alert 訊息逐條檢視，語句通順無誤
- 25 條設定頁說明文字逐條檢視，語句通順無誤
- FIELDS／GENRES／GROUPS 等所有陣列定義逐一核對
- 確認「廠商發行」→「發行廠商」改名（v42.02）已正確套用，無遺漏

### 影響檔案
- index.html
- GameVault_v42_03_index.html
- sw.js

### GS 版本
- 無

### PWA 快取
- CACHE_NAME 已遞增：gamevault-v42-03

### 對應備份
- _internal/old/v42_02/

## v42.02 (2026-06-30)

### 變更內容
- 遊戲類分區順序調整：「版本規格」與「遊戲規格」互換位置（版本規格在前）
- 展開白名單擴充：四種類型統一加入「編碼條碼」「補充資訊」預設展開
  - 遊戲：圖片紀錄／識別資訊／版本規格／遊戲規格／編碼條碼／補充資訊
  - 書籍：圖片紀錄／書籍資訊／出版資訊／編碼條碼／補充資訊
  - 主機：圖片紀錄／主機資訊／硬體規格／編碼條碼／補充資訊
  - 週邊：圖片紀錄／週邊資訊／規格／編碼條碼／補充資訊
- 「廠商發行」分類全面改名為「發行廠商」（FIELDS 定義、GROUPS、GCOL 共 6 處同步更新）
- 確認建檔與編輯兩種入口皆共用同一份 `groupsFor()`／展開邏輯（`showForm()`／`renderForm()` 唯一實作，無需分別處理）

### 影響檔案
- index.html
- GameVault_v42_02_index.html
- sw.js

### GS 版本
- 無

### PWA 快取
- CACHE_NAME 已遞增：gamevault-v42-02

### 對應備份
- _internal/old/v42_01/

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

