## v54.61 (2026-07-08)

### 變更內容
修正低對比文字造成的閱讀困難：找到根因是 `color:#444`（很暗的灰色，適合淺色背景用的淡化提示色），套用在 App 深色背景上幾乎看不見。這個問題不只出現在新的 AI網頁查詢頁面，也是**既有的商店連結／商品條碼／商品編碼模式共用的舊有問題**（同樣的複製貼上手誤），一併修正：
- AI網頁查詢：「系統會自動帶入目前分類所需的欄位產生查詢提示詞」、「將帶入的欄位：...」
- 商店連結模式：「例如：https://store.steampowered.com/app/...」
- 商品條碼模式：條碼格式範例文字
- 商品編碼模式：編碼格式範例文字

全部改用既有的可讀次要提示色 `#9fa8c8`（App 內已使用 113 次的established慣例色），跟主要提示文字 `#7986cb` 形成清楚的視覺層次，深色背景下清晰可讀。

### 影響檔案
- index.html / GameVault_v54_61_index.html
- sw.js

### GS 版本
- 無（純前端配色修正）

### PWA 快取
- CACHE_NAME: gamevault-v54-60 → gamevault-v54-61

### 對應備份
- _internal/old/v54_60/

## v54.60 (2026-07-08)

### 變更內容
AI 網頁查詢建檔頁新增免手動輸入的兩個功能，**完全沿用既有機制，未重造輪子**：
- **📷 掃描條碼**：新增 `aiWebScanBarcode()`，比照 `barScanFromBtn()` 的實作，呼叫既有的 `openFieldScanner({mode:'barcode'})` 即時掃描機制，掃到自動帶入查詢輸入框
- **📷 拍照辨識名稱**：直接沿用既有的 `nameFieldOCR(this,'aiweb-subject','zh')`（隱藏 file input + `capture="environment"` 的既有模式），拍照後經 Gemini 視覺辨識帶出商品中文名稱（沿用既有 prompt：只要名稱、不要型號價格店名、看不清留空禁止腦補）
- 進入模式時一併重置 file input，避免殘留上次選過的檔案
- 驗證：語法檢查通過、依賴函式（`openFieldScanner`／`nameFieldOCR`）確認存在、新增的 7 個 `aiweb-*` id 皆無重複

### 影響檔案
- index.html / GameVault_v54_60_index.html
- sw.js

### GS 版本
- 無（純前端功能新增）

### PWA 快取
- CACHE_NAME: gamevault-v54-59 → gamevault-v54-60

### 對應備份
- _internal/old/v54_59/

## v54.59 (2026-07-08)

### 變更內容
**【階段二：AI網頁查詢功能邏輯完整實作】**（階段一 UI 排版已驗收正常，確認 UI 層安全後才進行）

- **架構決策**：`aiweb-sec` 區塊放在 `#pg-scan` 內、預設 `display:none`、納入 `hideAllSecs()` 管理，**完全比照 `digital-link-sec`（商店連結模式）的既有模式**。刻意不用 v54.49 那次的獨立 fixed overlay（該 overlay 是當時唯一沒受災的畫面，反而模糊了問題定位）
- **完整對齊既有架構**：`initAiWebMode()` 比照 `initDigitalLinkMode()` 的實作（`pickTypeAndPlatform` → `setMbActive` → `enterMode` → `hideAllSecs` → 顯示自己的 sec）；`_METHOD_MB` 加入 `initAiWebMode:'aiweb'`（建檔方式記憶）；`setMbActive()` 加入 aiweb 的高亮色（#7c4dff）
- **動態 Prompt 產生**：直接呼叫既有的 `fieldsFor(category, subtype)` 取得該分類欄位定義，篩選出核心識別欄位（排除個人記錄／收藏狀態／品相完整度／關聯商品／圖片類）；Prompt 中帶入 Step1~3 已選的分類／子類型／商品區域／平台作為已知條件，並強制約束 AI 只回傳純 JSON、key 完全對應 entry 欄位、查無資料一律留空不可臆測
- **AI 助手跳轉**：DeepSeek／GPT／Gemini／Claude 四個按鈕，沿用 v54.46 已驗證可用的 `<a>` 模擬點擊開啟方式（避免 PWA 內嵌瀏覽器把 Google 服務開成桌面版）
- **貼上匯入**：使用既有的 `extractJson()` 容錯機制（自動剔除 markdown 標籤／前後廢話／修尾逗號／單引號），解析成功後預填進手動建檔表單
- **自我檢查全部通過**：核心欄位篩選（驗證個人記錄等欄位確實被排除）、`extractJson()` 對 4 種 AI 髒回覆格式的容錯、匯入時空值/「無」/「未知」的過濾

### 影響檔案
- index.html / GameVault_v54_59_index.html
- sw.js

### GS 版本
- 無（AI 呼叫走使用者自行複製貼上，不經 API，無後端異動）

### PWA 快取
- CACHE_NAME: gamevault-v54-58 → gamevault-v54-59

### 對應備份
- _internal/old/v54_58/

## v54.58 (2026-07-08)

### 變更內容
**【階段一：純 UI 排版，不含任何 JS 業務邏輯】**

考量 v54.49～v54.56 曾因一次性同時導入「AI網頁查詢功能 + UI排版重構」而引發嚴重災難（所有其他建檔方式進入後空白、導覽列消失，根因至今未查明，最終回退），本次改採分階段導入，先隔離 UI 層風險：

- **新增第 8 張建檔方式卡片**「🤖 AI 網頁查詢」（`mb-aiweb`），命名比照現有慣例（`mb-bar`/`mb-gcode`/`mb-img`/`mb-manual`/`mb-link`）
- **每排 4 格整除重構**：「編碼＋照片」（`mb-gcode-combo`）從 `span 2` 改回 `span 1`，「條碼＋照片」（`mb-combo`，推薦標籤）維持 `span 2` 不變。移除已不需要的 `_DIGI_LINK_WIDE_SUBS` 動態撐寬邏輯（數位下載版的空格改由新卡片補滿）
- **格數驗證**：一般分類 8 格（2排滿）、數位下載版各子類型 4 格（1排滿）
- **`initAiWebMode()` 目前僅是佔位函式**（點擊顯示「開發中」提示），完整功能邏輯待階段二實作
- 自我檢查：11 種分類/子類型情境的格數全部驗證可被 4 整除，末尾無空缺格

### ⚠️ 階段一驗收重點
請確認：(1) Step 4 版面每排 4 格無空缺；(2) **其他 7 種建檔方式（尤其手動建檔、圖片辨識）進入後畫面正常，沒有空白**；(3) 底部導覽列正常顯示。確認無誤後才進行階段二（AI網頁查詢功能邏輯實作）。

### 影響檔案
- index.html / GameVault_v54_58_index.html
- sw.js

### GS 版本
- 無（純前端 UI 排版）

### PWA 快取
- CACHE_NAME: gamevault-v54-57 → gamevault-v54-58

### 對應備份
- _internal/old/v54_57/

