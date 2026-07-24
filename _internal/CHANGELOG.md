## v02.12 (2026-07-22)

### 變更內容
尋寶頁右下角 FAB 展開選單，互換「條碼查詢」與「日系資料庫查詢」兩個按鈕的位置（純視覺順序調整，功能與樣式皆未改動）：
- HTML 順序由 `main→barcode→cd→lens` 改為 `main→cd→barcode→lens`
- 因容器用 `flex-direction:column-reverse`，視覺呈現（由上到下）從「拍照辨識(粉紅)／日系資料庫(cyan)／條碼查詢(綠)／•••」改為「拍照辨識(粉紅)／條碼查詢(綠)／日系資料庫(cyan)／•••」

### 影響檔案
- index.html / GameVault_v02_12_index.html
- sw.js

### GS 版本
- 無（純前端 UI 順序調整）

### PWA 快取
- CACHE_NAME: gamevault-v02-11 → gamevault-v02-12

### 對應備份
- _internal/old/v02_11/

## v02.11 (2026-07-22)

### 變更內容
尋寶頁右下角 FAB 選單（原本三個：主按鈕/條碼查詢/拍照辨識遊戲）新增第四個「日系資料庫查詢」按鈕：
- 新增 `#hunt-cd-fab` 圓形按鈕（cyan 漸層，帶 consoledictionary.com 網站圖示），比照既有的條碼查詢／拍照辨識遊戲按鈕樣式與展開動畫
- 點擊後開啟新彈窗 `cd-web-ov`：輸入日系遊戲名稱查詢，串接既有的 GAS `cd_search` action，顯示候選清單（縮圖/名稱/平台/開發商/駿河屋參考價）
- 跟建檔頁的 `cdApplyCandidate` 不同：這裡是尋寶清單頁，沒有正在編輯的項目可以套用查詢結果，因此點選候選改為**直接開啟該遊戲在 consoledictionary.com 的詳情頁**（外部連結），純粹作為查詢工具使用
- 涵蓋查詢中／查無結果／查詢失敗三種狀態的畫面提示

自我檢查：查詢結果渲染（成功時卡片內容與詳情頁連結是否正確、查無結果提示、查詢失敗提示）皆用檔案內實際程式碼以 mock 驗證通過；另確認新增內容前後 `<div>`／`<button>` 標籤計數差值一致，未破壞既有結構。

### 影響檔案
- index.html / GameVault_v02_11_index.html
- sw.js

### GS 版本
- 無（沿用既有 `cd_search` proxy action，未新增後端邏輯）

### PWA 快取
- CACHE_NAME: gamevault-v02-10 → gamevault-v02-11

### 對應備份
- _internal/old/v02_10/

## v02.10 (2026-07-22)

### 變更內容
「條碼查詢」彈窗（掃碼查無資料時的輔助查詢視窗）的 8 個目的地按鈕，統一改用跟「AI 網頁查詢」頁面一致的 `.genre-chip` 晶片樣式：
- 這裡原本是**獨立的一套實作**（`_bcWebRenderDestTabs`），跟「AI 網頁查詢」頁面的 `_aiWebRenderDests` 各自維護重複邏輯，風格因此不一致——第一排搜尋引擎（Barcode Lookup/Google/Bing/Yahoo!JAPAN）選中時填綠色、第二排 AI 助手（DeepSeek/GPT/Gemini/Claude）選中時填紫色，皆為寫死的 inline 樣式
- 改為統一套用 `.genre-chip` class，兩排都跟整體 App 風格一致（cyan 選中效果），拿掉舊的群組色碼邏輯

自我檢查：兩排晶片渲染數量、預設選中狀態、切換選中時正確互斥熄滅、確認無殘留舊 inline 背景色，皆用檔案內實際程式碼驗證通過。

### 影響檔案
- index.html / GameVault_v02_10_index.html
- sw.js

### GS 版本
- 無（純前端 UI 樣式統一）

### PWA 快取
- CACHE_NAME: gamevault-v02-09 → gamevault-v02-10

### 對應備份
- _internal/old/v02_09/

## v02.09 (2026-07-22)

### 變更內容
「AI 網頁查詢」建檔模式的「掃描條碼」「拍照辨識名稱」晶片新增選中點亮效果，讓使用者知道剛剛用哪種方式產生了輸入內容：
- 新增 `_aiWebInputMethod` 狀態變數，只在**真正成功**產生結果時才點亮，不是點擊當下就點亮——避免使用者中途取消掃描/OCR失敗時晶片卻誤顯示已選中
- 「掃描條碼」：掛勾既有的 `resultToast` 回調（本來就只在成功掃到、真的帶入值時才會被呼叫）
- 「拍照辨識名稱」：`_nameFieldOCR`／`nameFieldOCR` 新增**可選**的第4個成功回調參數（向後相容，其餘3處既有呼叫端未帶此參數，行為完全不受影響），新增 aiweb 專屬包裹函式 `aiWebNameOCR()` 只在 OCR 成功帶入文字後才點亮
- 兩者互斥（改用另一種方式會自動熄滅前一個），重新進入建檔模式時一併重置

自我檢查：晶片點亮邏輯（未使用/成功後點亮/切換互斥熄滅/重置）皆用檔案內實際程式碼以模擬 DOM 驗證通過；額外確認其餘 3 處呼叫 `nameFieldOCR` 的既有欄位（品名/日文品名等）未帶新參數，行為不受影響。

### 影響檔案
- index.html / GameVault_v02_09_index.html
- sw.js

### GS 版本
- 無（純前端 UI 邏輯調整）

### PWA 快取
- CACHE_NAME: gamevault-v02-08 → gamevault-v02-09

### 對應備份
- _internal/old/v02_08/

