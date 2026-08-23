## v09.01 (2026-08-23)

### 變更內容
使用者反映很多含日期/時間的欄位在試算表裡出現格式不一致的問題（正常應該是純文字的 `YYYY/MM/DD`，但少數列變成含時分秒的 ISO 時間戳記字串，例如 `2098-12-31T16:00:00.000Z`，且因為 UTC 轉換誤差，日期還會往前推一天）。**GAS 後端有實質邏輯變更，依規則進行版本重整（v08→v09，前端主版號跟隨、小版號歸零為 v09.01）。**

**根因**：Google Sheets 會把長得像日期的儲存格自動格式化成「日期」型別（即使寫入時給的是純文字字串）。GAS 用 `getValues()` 讀取這種被自動格式化的儲存格時，回傳的是 JS `Date` 物件而不是字串；這個 `Date` 物件被塞進回傳給前端的 JSON 資料時，`JSON.stringify()` 會自動呼叫其 `.toJSON()`（等同 `.toISOString()`），產生 UTC 時間戳記字串。這個問題過去曾經修過一次，但範圍只涵蓋 `created_at`（建檔時間）這一個欄位，沒有推廣到其他日期型欄位。

**這次做雙層防護**：

1. **讀取時正規化**（`listSheet()`）：新增 `_normalizeDateCell()`，統一把讀到的 `Date` 物件用試算表本身設定的時區轉回 `YYYY/MM/DD` 純文字格式，套用在最核心的資料讀取路徑上，涵蓋全部 32 張工作表。
2. **寫入時強制純文字**（`addRow`／`updateRow`）：把原本只套用在 `created_at` 的「強制該欄位為純文字格式並以字串重寫」防呆邏輯，抽出成通用的 `_forceTextDateCols()`，推廣到全部日期型欄位：`buy_date`（購入日期）、`resale_date`（出售日期）、`release_date`（發售日期）、`test_date`（測試日期）、`event_date`（演出日期）、`loan_due`（預計歸還日）、`market_value_updated_at`（估值更新日），從源頭避免 Google Sheets 自動把這些欄位格式化成日期型別。

這次修正解決的是「往後不再發生」——已經寫入試算表、格式已經被污染成 ISO 字串的舊資料，要等下次被編輯（觸發 `updateRow`）時才會順便修正回乾淨格式，不會自動回溯處理。

### 自我檢查
`node --check` 通過（前端、GAS 都做了語法檢查）；無 U+FFFD。用純邏輯測試驗證（`SpreadsheetApp`／`Utilities` 是 GAS 專屬 API，無法在一般 JS 環境真正執行，改用 mock 物件模擬 API 行為驗證邏輯正確性）：確認 `_normalizeDateCell()` 正確把 `Date` 物件轉成乾淨字串、非 `Date` 值原樣通過不受影響；確認 `_forceTextDateCols()` 只對「這個分類的欄位表裡實際存在」的日期欄位做處理（不會誤動不相關分類沒有的欄位）、正確對每個存在的日期欄位套用純文字格式、對 `null`/`undefined` 值安全處理不會噴錯。

### 影響檔案
- docs/index.html / docs/RetroVault_v09_01_index.html
- docs/sw.js
- docs/RetroVault_AppsScript.gs

### GS 版本
- v08 → v09（`listSheet`／`addRow`／`updateRow` 新增日期欄位雙層防護）

### PWA 快取
- CACHE_NAME: retrovault-v08-27 → retrovault-v09-01

### 對應備份
- _internal/old/v08_27/


## v08.27 (2026-08-22)

### 變更內容
使用者要求把「關聯商品選擇器」跟「收藏頁」的搜尋範圍統一收斂成四種名稱（主要/中文/日文/英文名稱）。查證後發現尋寶頁的搜尋也是同一種模式，一併處理。

**主收藏頁搜尋（`_quickPass`）**：原本除了四種名稱，還混雜了平台、系列、廠商、保管位置、語言、完整度可讀文字等一大堆欄位，範圍太廣泛容易誤判命中不相關的項目（前幾版排查搜尋 bug 時實測發現過「職棒野球魂」被誤判符合「實況」的疑慮，根源就在這裡）。收斂成只比對四種名稱欄位。

**關聯商品選擇器**：原本 `_relPickList` 每一筆只存「第一個非空的名稱」（`primary_name||zh_name||jp_name||en_name` 依序 fallback），如果使用者想用的搜尋詞剛好對應到「非優先」的那個名稱欄位（例如某款遊戲 `primary_name` 是英文，使用者想用 `zh_name` 的中文名稱找），會完全找不到。改成同時保留全部四個名稱欄位，篩選時逐一比對任一個是否符合；畫面顯示用的名稱優先序維持不變。

**尋寶頁搜尋**：原本混雜了子類型、備註、簡介、地區等欄位，而且連 `zh_name`／`en_name` 都缺漏（只比對了 `primary_name` 跟 `jp_name`），一併補齊修正為四種名稱。

### 自我檢查
`node --check` 通過；無 U+FFFD。用 jsdom 建立實際會執行的測試環境完整驗證：確認主搜尋能透過 `zh_name` 命中，即使搜尋詞跟 `primary_name` 不同；確認不再誤判命中發行商等不相關欄位裡巧合出現的文字；確認關聯商品選擇器的 `_relPickList` 正確保留全部四個名稱欄位，篩選能透過非顯示用的名稱（`zh_name`）正確找到項目；確認尋寶頁搜尋現在也能透過先前缺漏的 `zh_name` 正確命中。同時移除了前幾版留下的暫時性除錯顯示（前一版的搜尋失效問題已確認修正）。

### 影響檔案
- docs/index.html / docs/RetroVault_v08_27_index.html
- docs/sw.js

### GS 版本
- 無

### PWA 快取
- CACHE_NAME: retrovault-v08-26 → retrovault-v08-27

### 對應備份
- _internal/old/v08_26/




## v08.26 (2026-08-22)

### 變更內容
使用者提供的除錯截圖是本次能真正定位問題的關鍵——`[除錯] value="實況野球" len=4 listLen=404`，證實輪詢正確讀到了輸入框內容、`_relPickList` 也確實有 404 筆資料，代表 `filterRelatedPicker()` 一定有被正確呼叫。這排除了先前 5 次嘗試（`onkeyup`、`compositionend`、`compositionupdate`、輪詢、參數傳遞方式）全部針對的「事件有沒有觸發」這個方向——問題根本不在這裡。

真正根因：篩選邏輯裡有 `it.code&&it.code.toLowerCase()` 這段，如果收藏庫裡任何一筆資料的 `code` 或 `barcode` 欄位剛好是**數字型別**（不是字串——例如某些純數字條碼在寫入時沒有被強制轉成字串），呼叫 `.toLowerCase()` 會直接拋出 `TypeError`，導致整個 `.filter()` 中斷、`list.innerHTML=` 這一行根本沒有執行機會。這種例外不會有任何使用者可見的錯誤提示，只會安靜地在背景失敗——這正是為什麼前 5 版換再多種 DOM 事件都不可能解決：問題根本不在「觸發時機」，而是函式一旦真正執行到篩選邏輯就直接中斷。

加上防禦性的 `String()` 轉型，確保不管 `name`／`code` 欄位原始型別是什麼都能安全比對。除錯文字暫時保留，等確認問題真的解決後再另外部署一版移除。

### 自我檢查
`node --check` 通過；無 U+FFFD。用 jsdom 建立實際會執行的測試環境，**先重現了舊程式碼在遇到數字型別 `code` 欄位時確實會拋出 `TypeError: it.code.toLowerCase is not a function`**，證實假設成立；再驗證修正後的版本，用同樣「`code` 欄位是數字型別」的測試資料，確認不會拋出例外、能正確篩選出符合的項目、正確排除不相關的項目。

### 影響檔案
- docs/index.html / docs/RetroVault_v08_26_index.html
- docs/sw.js

### GS 版本
- 無

### PWA 快取
- CACHE_NAME: retrovault-v08-25 → retrovault-v08-26

### 對應備份
- _internal/old/v08_25/






## v08.25 (2026-08-22)

### 變更內容
使用者實測回報：打完字後點擊其他位置（讓輸入框失焦）依然沒有反應——這排除了所有跟「組字進行中」相關的假設，因為失焦一定會確定觸發組字完成。

改成完全比照收藏頁主搜尋框（`filterCol()`）已經確認能正常運作的寫法——原本的 `filterRelatedPicker(this.value)` 是把 `this.value` 當參數傳遞，改成 `filterRelatedPicker()`（無參數），函式內部自己重新查詢 `$('gp-search').value`，不透過 inline handler 傳遞的參數。

**同時加上一段暫時性的除錯輔助**：在搜尋框正下方顯示輪詢當下實際讀到的 `value` 內容、字元長度、跟清單筆數，讓使用者下次截圖時能直接看到真實的內部狀態，不用再靠遠端反覆猜測技術原因。這是第 5 次針對同一個問題的嘗試，如果這次還是沒有解決，除錯文字會提供直接的診斷依據，而不用繼續盲目嘗試不同的 DOM 事件組合。

### 自我檢查
`node --check` 通過；無 U+FFFD。用 jsdom 建立實際會執行的測試環境驗證：確認 `filterRelatedPicker()` 改成無參數後依然能正確篩選；確認 `_relToggle()`（勾選項目時）呼叫這個函式也正常運作、不會出錯；確認除錯顯示元素正確存在於畫面上。

### 影響檔案
- docs/index.html / docs/RetroVault_v08_25_index.html
- docs/sw.js

### GS 版本
- 無

### PWA 快取
- CACHE_NAME: retrovault-v08-24 → retrovault-v08-25

### 對應備份
- _internal/old/v08_24/






