## v54.54 (2026-07-08)

### 變更內容
使用者確認清除快取後問題依舊，排除了「舊快取殘留」的可能。目前已用 Node.js 模擬環境排除：JS 例外（showForm()/renderFld() 呼叫鏈實際測試沒有拋出例外）、欄位資料為空（實際測試 renderFld() 產生的HTML字串內容正常，單一分組有 2000~5000 字元）、id 重複衝突（檢查過關鍵 id 無重複）。三個最有可能的方向都排除後，問題依舊存在，純靠程式碼推理已經到極限。

**新增暫時性診斷面板**：`renderForm()` 完成後，在畫面上（用 `position:fixed` 直接掛在 `<body>` 上，不受任何版面問題影響）顯示關鍵狀態：`entry.category`、欄位表長度、`form-body` 實際內容長度、`form-sec`／`#shell`／`#content`／`#nav` 的實際渲染尺寸、`--app-height` 目前數值。這個面板問題排除後會移除。

### 影響檔案
- index.html / GameVault_v54_54_index.html
- sw.js

### GS 版本
- 無（純前端暫時性診斷工具）

### PWA 快取
- CACHE_NAME: gamevault-v54-53 → gamevault-v54-54

### 對應備份
- _internal/old/v54_53/

## v54.53 (2026-07-08)

### 變更內容
使用者回報 v54.52 修正後導覽列消失問題依舊，並補充關鍵線索：**除了 AI網頁查詢，所有建檔方式進入後都空白**。推理：AI網頁查詢／條碼查詢的 overlay 用 `position:fixed;inset:0` 定位（相對整個螢幕，不依賴 `#shell`），其餘所有畫面（含底部導覽列）都在 `#shell` 內——若 `#shell` 高度計算異常塌陷，裡面的東西會被擠壓到看不見，但 fixed 的 overlay 不受影響，剛好符合「只有 AI網頁查詢正常」的現象。

用 Node.js 模擬瀏覽器環境實際執行過主程式（含模擬呼叫 `initManualMode()`→`showForm()`），沒有發現腳本載入或函式呼叫時的 JS 例外，排除單純 JS 錯誤的可能，更加確認是版面高度計算的問題：
- **加強視窗高度計算防護**：`setAppHeight()` 加入數值有效性檢查（小於200px視為異常，不套用），避免任何情況下把破損的高度值寫入 `--app-height`
- **加入定時保險網**：每 3 秒檢查一次 `#shell` 實際渲染高度，異常過小時強制重新計算，作為所有事件監聽都沒被觸發到時的最後防線
- **showForm() 加上錯誤攔截**：以防萬一不是版面問題而是真的有 JS 例外，包上 try-catch 明確顯示錯誤訊息，取代目前完全無法判斷成因的靜默失敗狀況

### 影響檔案
- index.html / GameVault_v54_53_index.html
- sw.js

### GS 版本
- 無（純前端防護強化與錯誤攔截）

### PWA 快取
- CACHE_NAME: gamevault-v54-52 → gamevault-v54-53

### 對應備份
- _internal/old/v54_52/

## v54.52 (2026-07-08)

### 變更內容
使用者回報底部導覽列（建檔/收藏/尋寶/統計/設定）消失。查到這個 App 早在 v54.10 就記錄過同一個症狀的成因：`#shell` 版面高度依賴 JS 動態計算的 `--app-height`（取代不穩定的純 CSS `100dvh`），部分手機瀏覽器在視窗尺寸變化的瞬間算出來的值可能不穩定，卡在過時／過小的數值，導致最外層容器高度塌陷、底部導覽列被擠出畫面外：
- **推測觸發原因**：這幾版新增的相機/OCR/掃描功能（條碼查詢、AI網頁查詢等）會觸發視窗尺寸暫時變化（address bar 顯示/隱藏等），關閉相機切回 App 畫面時，`--app-height` 沒有被正確重新計算
- **修正**：補上 `visibilitychange` 事件監聽，使用者切回本頁籤時強制重新計算一次視窗高度（立即算一次＋150ms後再算一次確保視窗完全穩定），比照既有的 resize/orientationchange 處理方式

### 其他
使用者要求將 `_internal/old/v54_48/` 標記為永久保留備份（跟 `v42_20a1` 一樣），5 版輪替清理時會略過，已記錄。

### 影響檔案
- index.html / GameVault_v54_52_index.html
- sw.js

### GS 版本
- 無（純前端邏輯修正）

### PWA 快取
- CACHE_NAME: gamevault-v54-51 → gamevault-v54-52

### 對應備份
- _internal/old/v54_51/

## v54.51 (2026-07-08)

### 變更內容
使用者回報「AI網頁查詢」貼上JSON解析匯入時會導致收藏頁空白（伴隨「建檔內容保留中」提示）。程式碼審查沒能直接定位確切拋出點，比照先前 `showDetail()`／`quickCompPreset()` 遇到類似情況的處理方式：
- **加入錯誤攔截**：`aiWebParseAndImport()` 核心邏輯包上 try-catch，若匯入過程真的拋出例外，會明確用 toast 顯示錯誤訊息＋印出完整堆疊到 console，取代靜默失敗
- **順帶修正一個相關缺口**：檢查返回鍵處理邏輯 `_topLayerClose()` 時發現 `aiweb-ov`（AI網頁查詢）與 `barcode-web-ov`（條碼查詢）這兩個 overlay 都沒有納入清單，代表這兩個畫面開啟時按返回鍵不會正常關閉 overlay，而是繼續往下觸發「建檔內容保留中」跳轉收藏頁的邏輯——這很可能是空白頁的部分成因，一併補上

### 影響檔案
- index.html / GameVault_v54_51_index.html
- sw.js

### GS 版本
- 無（純前端錯誤處理與邏輯補強）

### PWA 快取
- CACHE_NAME: gamevault-v54-50 → gamevault-v54-51

### 對應備份
- _internal/old/v54_50/

